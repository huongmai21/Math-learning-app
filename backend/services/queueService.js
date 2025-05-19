// backend/services/queueService.js
const { v4: uuidv4 } = require("uuid");

class QueueService {
  constructor(client, queueName) {
    this.client = client;
    this.queueName = queueName;
    this.jobQueueKey = `queue:${queueName}:jobs`;
    this.processingQueueKey = `queue:${queueName}:processing`;
    this.retryQueueKey = `queue:${queueName}:retry`;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 giây
  }

  // Thêm một công việc vào hàng đợi
  async addJob(data, priority = 0) {
    const jobId = uuidv4();
    const job = {
      id: jobId,
      data,
      priority,
      retries: 0,
      createdAt: Date.now(),
    };

    // Thêm công việc vào sorted set với priority là score
    await this.client.zAdd(this.jobQueueKey, {
      score: priority,
      value: JSON.stringify(job),
    });

    return jobId;
  }

  // Lấy công việc tiếp theo từ hàng đợi
  async getNextJob() {
    // Lấy công việc có độ ưu tiên cao nhất (score thấp nhất) từ sorted set
    const jobs = await this.client.zRangeByScore(this.jobQueueKey, 0, "+inf", {
      LIMIT: { offset: 0, count: 1 },
    });

    if (!jobs.length) return null;

    const job = JSON.parse(jobs[0]);

    // Xóa công việc khỏi hàng đợi chính
    await this.client.zRem(this.jobQueueKey, jobs[0]);

    // Thêm vào hàng đợi đang xử lý
    await this.client.hSet(this.processingQueueKey, job.id, jobs[0]);

    return job;
  }

  // Đánh dấu công việc hoàn thành
  async completeJob(jobId) {
    await this.client.hDel(this.processingQueueKey, jobId);
  }

  // Xử lý lỗi công việc (thêm vào hàng đợi retry)
  async failJob(jobId, error) {
    const jobStr = await this.client.hGet(this.processingQueueKey, jobId);
    if (!jobStr) return;

    const job = JSON.parse(jobStr);
    job.retries = (job.retries || 0) + 1;
    job.lastError = error.message || error.toString();

    if (job.retries >= this.maxRetries) {
      console.error(`Job ${jobId} failed after ${job.retries} retries: ${job.lastError}`);
      await this.completeJob(jobId); // Xóa khỏi hàng đợi xử lý
      return;
    }

    // Thêm vào hàng đợi retry với delay
    const retryAt = Date.now() + this.retryDelay * job.retries;
    await this.client.zAdd(this.retryQueueKey, {
      score: retryAt,
      value: JSON.stringify(job),
    });

    // Xóa khỏi hàng đợi xử lý
    await this.completeJob(jobId);
  }

  // Kiểm tra và xử lý hàng đợi retry
  async processRetryQueue() {
    const now = Date.now();
    const jobs = await this.client.zRangeByScore(this.retryQueueKey, 0, now, {
      LIMIT: { offset: 0, count: 10 },
    });

    for (const jobStr of jobs) {
      const job = JSON.parse(jobStr);

      // Xóa khỏi hàng đợi retry
      await this.client.zRem(this.retryQueueKey, jobStr);

      // Thêm lại vào hàng đợi chính để thử lại
      await this.client.zAdd(this.jobQueueKey, {
        score: job.priority || 0,
        value: JSON.stringify(job),
      });
    }
  }
}

module.exports = QueueService;