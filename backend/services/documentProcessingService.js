// backend/services/documentProcessingService.js
const QueueService = require("./queueService");
const redisUtils = require("../config/redis");
const Document = require("../models/Document");
const mammoth = require("mammoth");
const TurndownService = require("turndown");
const { v4: uuidv4 } = require("uuid");
const { uploadToCloudinary } = require("../config/cloudinary"); // Sửa đường dẫn

const turndownService = new TurndownService();

class DocumentProcessingService {
  constructor() {
    this.redisClient = redisUtils.getClient();
    this.queueService = new QueueService(this.redisClient, "document-processing");
    this.workers = [];
  }

  // Thêm tài liệu vào hàng đợi để xử lý
  async addDocumentToQueue(documentId, filePath) {
    const jobId = await this.queueService.addJob(
      { documentId, filePath },
      0 // priority
    );
    console.log(`Added document ${documentId} to processing queue with jobId: ${jobId}`);
    return jobId;
  }

  // Xử lý nội dung tài liệu
  async processDocument(job) {
    const { documentId, filePath } = job.data;

    try {
      console.log(`Processing document ${documentId} from file: ${filePath}`);

      // Trích xuất nội dung từ file Word
      const { value: rawContent } = await mammoth.extractRawText({ path: filePath });
      if (!rawContent) {
        throw new Error("Không thể trích xuất nội dung từ tài liệu");
      }

      // Chuyển đổi nội dung sang Markdown
      const markdownContent = turndownService.turndown(rawContent);

      // Tạo bản xem trước (preview) từ nội dung
      const preview = markdownContent.slice(0, 200) + (markdownContent.length > 200 ? "..." : "");

      // Tải file lên Cloudinary
      const cloudinaryResult = await uploadToCloudinary(filePath, "documents");

      // Cập nhật tài liệu trong MongoDB
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error("Tài liệu không tồn tại");
      }

      document.content = markdownContent;
      document.preview = preview;
      document.fileUrl = cloudinaryResult.secure_url;
      document.status = "processed";
      await document.save();

      console.log(`Document ${documentId} processed successfully`);

      // Gửi thông báo qua Socket.IO
      if (global.io) {
        global.io.to(document.userId.toString()).emit("document_processed", {
          documentId,
          status: "processed",
          fileUrl: cloudinaryResult.secure_url,
        });
      }

      return true;
    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error.message);
      throw error;
    }
  }

  // Khởi động worker xử lý tài liệu
  startWorker(concurrency) {
    console.log(`Starting document processing worker with concurrency ${concurrency}`);

    for (let i = 0; i < concurrency; i++) {
      const workerId = i;
      this.workers.push({ id: workerId, busy: false });

      // Bắt đầu xử lý hàng đợi
      const processNextJob = async () => {
        if (!this.workers[workerId]) return; // Worker đã dừng

        this.workers[workerId].busy = true;

        try {
          // Xử lý hàng đợi retry trước
          await this.queueService.processRetryQueue();

          // Lấy công việc tiếp theo
          const job = await this.queueService.getNextJob();
          if (!job) {
            this.workers[workerId].busy = false;
            setTimeout(processNextJob, 1000); // Chờ 1 giây trước khi thử lại
            return;
          }

          console.log(`Worker ${workerId} processing job ${job.id}`);

          try {
            // Xử lý tài liệu
            await this.processDocument(job);
            await this.queueService.completeJob(job.id);
            console.log(`Worker ${workerId} completed job ${job.id}`);
          } catch (error) {
            // Xử lý lỗi và thêm vào hàng đợi retry
            await this.queueService.failJob(job.id, error);
            console.error(`Worker ${workerId} failed job ${job.id}: ${error.message}`);
          }
        } catch (error) {
          console.error(`Worker ${workerId} error: ${error.message}`);
        } finally {
          this.workers[workerId].busy = false;
          if (this.workers[workerId]) {
            setTimeout(processNextJob, 1000); // Tiếp tục xử lý công việc tiếp theo
          }
        }
      };

      // Bắt đầu worker
      processNextJob().catch((error) => {
        console.error(`Worker ${workerId} initialization error: ${error.message}`);
      });
    }
  }

  // Dừng tất cả worker
  stopWorker() {
    this.workers.forEach((worker, index) => {
      console.log(`Stopping worker ${worker.id}`);
      delete this.workers[index];
    });
    this.workers = [];
  }
}

module.exports = new DocumentProcessingService();