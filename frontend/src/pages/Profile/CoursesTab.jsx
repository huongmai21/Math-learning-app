// frontend/src/pages/CoursesTab.jsx
import React from "react";
import './Profile.css';

const CoursesTab = ({
  profileData,
  courses,
  newCourse,
  setNewCourse,
  handleCreateCourse,
}) => {
  return (
    <div className="courses-tab">
      <h3>Khóa học của tôi</h3>
      {(profileData.role === "teacher" || profileData.role === "admin") && (
        <form onSubmit={handleCreateCourse} className="mb-6">
          <div className="mb-4">
            <label className="block text-sm">Tiêu đề khóa học</label>
            <input
              type="text"
              value={newCourse.title}
              onChange={(e) =>
                setNewCourse({ ...newCourse, title: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 bg-[#0366d6] text-white rounded hover:bg-[#024ea4]"
          >
            Tạo khóa học
          </button>
        </form>
      )}
      {courses.length > 0 ? (
        courses.map((course) => (
          <div key={course._id} className="course-item">
            <h4>{course.title}</h4>
            <p>Giảng viên: {course.instructorId?.username || "N/A"}</p>
            <p>
              Trạng thái:{" "}
              {course.status === "pending"
                ? "Chờ duyệt"
                : course.status === "approved"
                ? "Đã duyệt"
                : "Bị từ chối"}
            </p>
          </div>
        ))
      ) : (
        <p>Chưa tham gia hoặc tạo khóa học nào.</p>
      )}
    </div>
  );
};

export default CoursesTab;