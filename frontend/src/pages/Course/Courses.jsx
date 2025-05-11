import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import Sidebar from "../../components/layout/Sidebar";

const Courses = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    price: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/courses", {
          headers: { Authorization: `Bearer ${token}` },
          params: { filter: filter === "my" ? user._id : undefined },
        });
        setCourses(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Không thể tải danh sách khóa học!"
        );
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchCourses();
  }, [token, filter, user]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/courses", newCourse, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses([...courses, response.data.data]);
      setNewCourse({ title: "", description: "", price: 0 });
      toast.success("Tạo khóa học thành công!");
    } catch (err) {
      toast.error(
        "Tạo khóa học thất bại: " +
          (err.response?.data?.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await api.delete(`/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(courses.filter((course) => course._id !== courseId));
      toast.success("Xóa khóa học thành công!");
    } catch (err) {
      toast.error(
        "Xóa khóa học thất bại: " +
          (err.response?.data?.message || "Vui lòng thử lại.")
      );
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-70px)] bg-[#f5f5f5] p-5">
      <Sidebar
        activeTab="courses"
        onTabChange={() => {}}
        user={user}
        tabs="main"
      />
      <div className="flex-1 ml-20">
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-[#34495e] mb-4">Khóa học</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
            >
              <option value="all">Tất cả</option>
              <option value="my">Khóa học của tôi</option>
            </select>
          </div>
          {(user?.role === "teacher" || user?.role === "admin") && (
            <form onSubmit={handleCreateCourse} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-[#34495e]">Tiêu đề</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#34495e]">Mô tả</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#34495e]">
                  Giá (VND)
                </label>
                <input
                  type="number"
                  value={newCourse.price}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      price: Number(e.target.value),
                    })
                  }
                  min="0"
                  className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#e74c3c] text-white py-2 rounded-full hover:bg-[#c0392b]"
              >
                Tạo khóa học
              </button>
            </form>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-[#34495e]">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500">{course.description}</p>
                  <p className="text-sm text-gray-500">
                    Giá: {course.price.toLocaleString()} VND
                  </p>
                  <p className="text-sm text-gray-500">
                    Giảng viên: {course.instructorId?.username || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Nội dung: {course.contents?.length || 0} bài
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="flex-1 bg-[#e74c3c] text-white py-1 rounded-full hover:bg-[#c0392b]"
                    >
                      Xem chi tiết
                    </button>
                    {(user?.role === "teacher" || user?.role === "admin") && (
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="flex-1 bg-gray-300 text-[#34495e] py-1 rounded-full hover:bg-gray-400"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Không tìm thấy khóa học nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
