// frontend/src/pages/CreateExamTab.jsx
import React from "react";
import { format } from "date-fns";
import './Profile.css';

const CreateExamTab = ({
  profileData,
  myExams,
  newExam,
  setNewExam,
  editingExam,
  setEditingExam,
  handleCreateExam,
  handleUpdateExam,
  handleEditClick,
  handleDeleteExam,
}) => {
  return (
    <div className="create-exam-tab">
      <h3>{editingExam ? "Chỉnh sửa đề thi" : "Tạo đề thi"}</h3>
      <form onSubmit={editingExam ? handleUpdateExam : handleCreateExam}>
        <div className="mb-4">
          <label className="block text-sm">Tiêu đề</label>
          <input
            type="text"
            value={newExam.title}
            onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Mô tả</label>
          <textarea
            value={newExam.description}
            onChange={(e) =>
              setNewExam({ ...newExam, description: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Cấp học</label>
          <select
            value={newExam.educationLevel}
            onChange={(e) =>
              setNewExam({ ...newExam, educationLevel: e.target.value })
            }
            className="w-full p-2 border rounded"
          >
            {[...Array(12).keys()].map((i) => (
              <option key={i + 1} value={`grade${i + 1}`}>
                Lớp {i + 1}
              </option>
            ))}
            <option value="university">Đại học</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm">Môn học</label>
          <select
            value={newExam.subject}
            onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="math">Toán</option>
            {newExam.educationLevel === "university" && (
              <>
                <option value="advanced_math">Toán cao cấp</option>
                <option value="calculus">Giải tích</option>
                <option value="algebra">Đại số</option>
                <option value="probability_statistics">Xác suất thống kê</option>
                <option value="differential_equations">Phương trình vi phân</option>
              </>
            )}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm">Thời gian (phút)</label>
          <input
            type="number"
            value={newExam.duration}
            onChange={(e) =>
              setNewExam({ ...newExam, duration: Number(e.target.value) })
            }
            min="1"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Thời gian bắt đầu</label>
          <input
            type="datetime-local"
            value={newExam.startTime}
            onChange={(e) =>
              setNewExam({ ...newExam, startTime: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Thời gian kết thúc</label>
          <input
            type="datetime-local"
            value={newExam.endTime}
            onChange={(e) =>
              setNewExam({ ...newExam, endTime: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Độ khó</label>
          <select
            value={newExam.difficulty}
            onChange={(e) =>
              setNewExam({ ...newExam, difficulty: e.target.value })
            }
            className="w-full p-2 border rounded"
          >
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 p-2 bg-[#0366d6] text-white rounded hover:bg-[#024ea4]"
          >
            {editingExam ? "Cập nhật đề thi" : "Tạo đề thi"}
          </button>
          {editingExam && (
            <button
              type="button"
              onClick={() => {
                setEditingExam(null);
                setNewExam({
                  title: "",
                  description: "",
                  educationLevel: "grade1",
                  subject: "math",
                  duration: 60,
                  questions: [],
                  startTime: "",
                  endTime: "",
                  difficulty: "easy",
                });
              }}
              className="flex-1 p-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
      <h3 className="mt-8">Danh sách đề thi</h3>
      {myExams.length > 0 ? (
        myExams.map((exam) => (
          <div key={exam._id} className="exam-item">
            <div>
              <h4>{exam.title}</h4>
              <p>Môn: {exam.subject}</p>
              <p>
                Độ khó:{" "}
                {exam.difficulty === "easy"
                  ? "Dễ"
                  : exam.difficulty === "medium"
                  ? "Trung bình"
                  : "Khó"}
              </p>
            </div>
            <div className="exam-actions">
              <button onClick={() => handleEditClick(exam)}>Sửa</button>
              <button onClick={() => handleDeleteExam(exam._id)}>Xóa</button>
            </div>
          </div>
        ))
      ) : (
        <p>Chưa có đề thi nào.</p>
      )}
    </div>
  );
};

export default CreateExamTab;