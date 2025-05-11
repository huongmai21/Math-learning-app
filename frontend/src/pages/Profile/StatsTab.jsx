// frontend/src/pages/StatsTab.jsx
import React from "react";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";
import './Profile.css';

const StatsTab = ({ scores, participatedExams, scoreChartData, scoreChartOptions }) => {
  return (
    <div className="stats-tab">
      <h3>Thống kê bảng điểm</h3>
      {scores.length > 0 ? (
        <div className="score-chart">
          <Line data={scoreChartData} options={scoreChartOptions} />
        </div>
      ) : (
        <p>Chưa có dữ liệu bảng điểm.</p>
      )}
      <h3 className="mt-6">Danh sách đề thi đã tham gia</h3>
      {participatedExams.length > 0 ? (
        <div className="exam-list">
          {participatedExams.map((exam) => (
            <div key={exam._id} className="exam-item">
              <div>
                <h4>{exam.title}</h4>
                <p>Môn: {exam.subject}</p>
                <p>Điểm: {exam.score || "Chưa có điểm"}</p>
                <p>
                  Thời gian:{" "}
                  {format(new Date(exam.startTime), "dd/MM/yyyy HH:mm")} -{" "}
                  {format(new Date(exam.endTime), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Chưa tham gia đề thi nào.</p>
      )}
    </div>
  );
};

export default StatsTab;