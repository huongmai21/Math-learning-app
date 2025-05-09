import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/authSlice";
import { toast } from "react-toastify";
import { ThemeContext } from "../../../context/ThemeContext";

const Navbar = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const documentsRef = useRef(null);
  const newsRef = useRef(null);
  const notificationsRef = useRef(null);

  const [notifications, setNotifications] = useState([
    { id: 1, message: "Bài đăng mới từ bạn bè!", time: "5 phút trước" },
    { id: 2, message: "Đề thi mới đã có!", time: "1 giờ trước" },
  ]);

  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        documentsRef.current &&
        !documentsRef.current.contains(event.target)
      ) {
        setIsDocumentsOpen(false);
      }
      if (newsRef.current && !newsRef.current.contains(event.target)) {
        setIsNewsOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Đăng xuất thành công!", {
      position: "top-right",
      autoClose: 3000,
    });
    navigate("/auth/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const defaultAvatar =
    "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png";

  return (
    <header className="fixed top-0 left-0 w-full bg-[#2c3e50] text-white h-16 flex items-center justify-between px-4 z-50">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div className="flex items-center">
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-[#ffcccb] to-[#ff6f61] bg-clip-text text-transparent"
        >
          <i className="fa-solid fa-bahai mr-2"></i>FunMath
        </Link>
        <button className="md:hidden text-2xl ml-4" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? "✖" : "☰"}
        </button>
      </div>

      <nav
        className={`md:flex items-center gap-2 ${
          isMobileMenuOpen
            ? "flex flex-col absolute top-16 left-0 w-full bg-[#2c3e50] p-4"
            : "hidden md:flex"
        }`}
      >
        <div
          className="relative group"
          ref={documentsRef}
          onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
        >
          <span className="flex items-center px-3 py-2 rounded-full hover:bg-[#ff6f61] cursor-pointer font-semibold">
            Tài liệu
            <i
              className={`ml-2 fa-solid fa-chevron-${
                isDocumentsOpen ? "up" : "down"
              }`}
            ></i>
          </span>
          {isDocumentsOpen && (
            <div className="absolute top-full left-0 mt-2 w-40 bg-[#2c3e50] rounded-md shadow-lg">
              <Link
                to="/documents/grade1"
                className="block px-4 py-2 hover:bg-[#ff6f61]"
              >
                Cấp 1
              </Link>
              <Link
                to="/documents/grade2"
                className="block px-4 py-2 hover:bg-[#ff6f61]"
              >
                Cấp 2
              </Link>
              <Link
                to="/documents/grade3"
                className="block px-4 py-2 hover:bg-[#ff6f61]"
              >
                Cấp 3
              </Link>
              <Link
                to="/documents/university"
                className="block px-4 py-2 hover:bg-[#ff6f61]"
              >
                Đại học
              </Link>
            </div>
          )}
        </div>
        <div
          className="relative group"
          ref={newsRef}
          onClick={() => setIsNewsOpen(!isNewsOpen)}
        >
          <span className="flex items-center px-3 py-2 rounded-full hover:bg-[#ff6f61] cursor-pointer font-semibold">
            Tin tức
            <i
              className={`ml-2 fa-solid fa-chevron-${
                isNewsOpen ? "up" : "down"
              }`}
            ></i>
          </span>
          {isNewsOpen && (
            <div className="absolute top-full left-0 mt-2 w-40 bg-[#2c3e50] rounded-md shadow-lg">
              <Link
                to="/news/education"
                className="block px-4 py-2 hover:bg-[#ff6f61]"
              >
                Thông tin giáo dục
              </Link>
              <Link
                to="/news/magazine"
                className="block px-4 py-2 hover:bg-[#ff6f61]"
              >
                Tạp chí Toán
              </Link>
            </div>
          )}
        </div>
        <Link
          to="/courses"
          className="px-3 py-2 rounded-full hover:bg-[#ff6f61] font-semibold"
        >
          Khóa học
        </Link>
        {user && (
          <>
            <Link
              to="/exams"
              className="px-3 py-2 rounded-full hover:bg-[#ff6f61] font-semibold"
            >
              Thi đấu
            </Link>
            <Link
              to="/study-corner"
              className="px-3 py-2 rounded-full hover:bg-[#ff6f61] font-semibold"
            >
              Góc học tập
            </Link>
            <Link
              to="/study-room"
              className="px-3 py-2 rounded-full hover:bg-[#ff6f61] font-semibold"
            >
              Phòng học nhóm
            </Link>
          </>
        )}
      </nav>

      {loading ? (
        <div className="text-[#ff6f61]">Đang tải...</div>
      ) : user ? (
        <div className="flex items-center gap-4">
          <div className="relative group" ref={profileRef}>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <img
                src={user.avatar || defaultAvatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-[#ff6f61] object-cover"
                onError={(e) => (e.target.src = defaultAvatar)}
              />
              <span className="bg-gradient-to-r from-[#ff6f61] to-[#ff9a8b] bg-clip-text text-transparent font-semibold">
                {user.username}
              </span>
            </div>
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-[#2c3e50] rounded-md shadow-lg">
                <Link
                  to="/users/profile"
                  className="block px-4 py-2 hover:bg-[#ff6f61]"
                >
                  Hồ sơ
                </Link>
                {(user?.role === "student" || user?.role === "teacher") && (
                  <Link
                    to="/courses/my-courses"
                    className="block px-4 py-2 hover:bg-[#ff6f61]"
                  >
                    Khóa học của tôi
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 hover:bg-[#ff6f61]"
                  >
                    Quản lý hệ thống
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-[#ff6f61]"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
          <div className="relative" ref={notificationsRef}>
            <div
              className="cursor-pointer"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <i className="fa-solid fa-bell text-lg"></i>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff6f61] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>
            {isNotificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-[#2c3e50] rounded-md shadow-lg">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex justify-between items-center px-4 py-2 border-b border-gray-600"
                    >
                      <div>
                        <p>{notif.message}</p>
                        <p className="text-xs text-gray-400">{notif.time}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="text-[#ff6f61]"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2">Không có thông báo</div>
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <i
              className="fa-solid fa-gear text-lg cursor-pointer"
              onClick={() => setIsSettingsOpen(true)}
            ></i>
            {isSettingsOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-[#f5f5f5] text-[#2c3e50] p-6 rounded-md w-80">
                  <h3 className="text-lg font-semibold mb-4">Cài đặt</h3>
                  <div className="flex justify-between items-center mb-4">
                    <label>Thông báo</label>
                    <input type="checkbox" defaultChecked className="h-5 w-5" />
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <label>Chế độ hiển thị</label>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md"
                    >
                      <i
                        className={
                          theme === "light"
                            ? "fa-solid fa-sun"
                            : "fa-solid fa-moon"
                        }
                      ></i>
                      {theme === "light" ? "Sáng" : "Tối"}
                    </button>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="w-full bg-[#ff6f61] text-white py-2 rounded-md"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Link
            to="/auth/login"
            className="px-3 py-2 border border-[#ff6f61] rounded-md hover:bg-[#ff6f61] hover:text-white"
          >
            Đăng nhập
          </Link>
          <Link
            to="/auth/register"
            className="px-3 py-2 border border-[#ff6f61] rounded-md hover:bg-[#ff6f61] hover:text-white"
          >
            Đăng ký
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
