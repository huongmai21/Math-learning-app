import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/slices/authSlice";
import { toast } from "react-toastify";
import ThemeContext from "../../../context/ThemeContext";
import {
  getNotifications,
  deleteNotification,
} from "../../../services/notificationService";
import useDropdown from "../../../hooks/useDropdown";
import io from "socket.io-client";
import io from "socket.io-client";
import "./Navbar.css";

const socket = io("http://localhost:5000");

const socket = io("http://localhost:5000");

const Navbar = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [notifications, setNotifications] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    isOpen: documentsOpen,
    toggle: toggleDocuments,
    ref: documentsRef,
  } = useDropdown();
  const { isOpen: newsOpen, toggle: toggleNews, ref: newsRef } = useDropdown();
  const {
    isOpen: profileOpen,
    toggle: toggleProfile,
    ref: profileRef,
  } = useDropdown();
  const {
    isOpen: notificationsOpen,
    toggle: toggleNotifications,
    ref: notificationsRef,
  } = useDropdown();
  const {
    isOpen: settingsOpen,
    toggle: toggleSettings,
    ref: settingsRef,
  } = useDropdown();

  const menuItems = [
    {
      title: "Tài liệu",
      isDropdown: true,
      open: documentsOpen,
      toggle: toggleDocuments,
      ref: documentsRef,
      items: [
        { to: "/documents/grade1", label: "Cấp 1" },
        { to: "/documents/grade2", label: "Cấp 2" },
        { to: "/documents/grade3", label: "Cấp 3" },
        { to: "/documents/university", label: "Đại học" },
      ],
    },
    {
      title: "Tin tức",
      isDropdown: true,
      open: newsOpen,
      toggle: toggleNews,
      ref: newsRef,
      items: [
        { to: "/news/education", label: "Thông tin giáo dục" },
        { to: "/news/magazine", label: "Tạp chí Toán" },
      ],
    },
    { title: "Khóa học", to: "/courses", isDropdown: false },
    ...(user
      ? [
          { title: "Thi đấu", to: "/exams", isDropdown: false },
          { title: "Góc học tập", to: "/study-corner", isDropdown: false },
          { title: "Phòng học nhóm", to: "/study-room", isDropdown: false },
        ]
      : []),
  ];

  useEffect(() => {
    const loadNotifications = async () => {
      const token = localStorage.getItem("token");
      if (user && token) {
        try {
          const response = await getNotifications(user._id);
          setNotifications(response.data || []);
        } catch (error) {
          toast.error("Không thể tải thông báo");
          toast.error("Không thể tải thông báo");
        }
      }
    };
    loadNotifications();

    // Join user room for real-time notifications
    if (user) {
      socket.emit("join", user._id);
    }

    // Listen for new notifications
    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.info(notification.message, { position: "top-right" });
    });

    // Cleanup
    return () => {
      socket.off("newNotification");
    };

    // Join user room for real-time notifications
    if (user) {
      socket.emit("join", user._id);
    }

    // Listen for new notifications
    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.info(notification.message, { position: "top-right" });
    });

    // Cleanup
    return () => {
      socket.off("newNotification");
    };
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Đăng xuất thành công!");
    toast.success("Đăng xuất thành công!");
    navigate("/auth/login");
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((notif) => notif._id !== id));
      toast.success("Xóa thông báo thành công!");
      toast.success("Xóa thông báo thành công!");
    } catch (error) {
      toast.error("Không thể xóa thông báo");
      toast.error("Không thể xóa thông báo");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const defaultAvatar =
    "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png";

  return (
    <header className="header" aria-label="Thanh điều hướng chính">
      <div className="navbar-container">
        <Link to="/" className="logo" aria-label="FunMath - Trang chủ">
        <Link to="/" className="logo" aria-label="FunMath - Trang chủ">
          <i className="fa-solid fa-bahai"></i> FunMath
        </Link>
        <button
          className="hamburger"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? "✖" : "☰"}
        </button>
        <nav
          className={`navbar ${isMobileMenuOpen ? "active" : ""}`}
          aria-label="Menu điều hướng"
        >
          {menuItems.map((item, index) =>
            item.isDropdown ? (
              <div
                key={index}
                className={`dropdown menu-item ${item.open ? "active" : ""}`}
                ref={item.ref}
                onClick={item.toggle}
                aria-haspopup="true"
                aria-expanded={item.open}
              >
                <span className="dropdown-title">{item.title}</span>
                <span className="left-icon"></span>
                <span className="right-icon"></span>
                {item.open && (
                  <div className="items" role="menu">
                    {item.items.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.to}
                        style={{ "--i": subIndex + 1 }}
                        role="menuitem"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={index} to={item.to} className="menu-item">
                {item.title}
              </Link>
            )
          )}
        </nav>
      </div>
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : user ? (
        <div className="user-actions">
          <div
            className="user-info"
            ref={profileRef}
            onClick={toggleProfile}
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            <div className="avatar">
              <img
                src={user.avatar || defaultAvatar}
                alt={`Avatar của ${user.username}`}
                loading="lazy"
                onError={(e) => (e.target.src = defaultAvatar)}
              />
            </div>
            <span className="profile-username">{user.username}</span>
            {profileOpen && (
            {profileOpen && (
              <div className="profile-dropdown" role="menu">
                <Link
                  to="/users/profile"
                  className="dropdown-item"
                  role="menuitem"
                >
                  Hồ sơ
                </Link>
                {(user?.role === "student" || user?.role === "teacher") && (
                  <Link
                    to="/courses/my-courses"
                    className="dropdown-item"
                    role="menuitem"
                  >
                    Khóa học của tôi
                  </Link>
                )}
                {user?.role === "admin" && (
                  <>
                    <Link to="/admin" className="dropdown-item" role="menuitem">
                      Quản lý hệ thống
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="dropdown-item logout"
                  role="menuitem"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
          <div
            className="notification-container"
            ref={notificationsRef}
            onClick={toggleNotifications}
            aria-label="Thông báo"
            aria-expanded={notificationsOpen}
          >
            <i className="fa-solid fa-bell notification-icon"></i>
            {notifications.length > 0 && (
              <span className="notification-count">{notifications.length}</span>
            )}
            {notificationsOpen && (
              <div className="notification-dropdown" role="menu">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className="notification-item"
                      role="menuitem"
                    >
                      <Link to={notif.link || "#"}>{notif.message}</Link>
                      <Link to={notif.link || "#"}>{notif.message}</Link>
                      <span className="notification-time">
                        {new Date(notif.createdAt).toLocaleTimeString("vi-VN")}
                      </span>
                      <button
                        className="delete-notification"
                        onClick={() => handleDeleteNotification(notif._id)}
                        aria-label={`Xóa thông báo: ${notif.message}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="notification-item">Không có thông báo</div>
                )}
              </div>
            )}
          </div>
          <div className="settings-container" ref={settingsRef}>
            <i
              className="fa-solid fa-gear settings-icon"
              onClick={toggleSettings}
              aria-label="Mở cài đặt"
              aria-expanded={settingsOpen}
            ></i>
            {settingsOpen && (
              <div
                className="settings-modal"
                role="dialog"
                aria-labelledby="settings-title"
              >
                <div className="settings-content">
                  <h3 id="settings-title">Cài đặt</h3>
                  <div className="settings-option">
                    <label htmlFor="notifications-toggle">Thông báo</label>
                    <input
                      id="notifications-toggle"
                      type="checkbox"
                      defaultChecked
                    />
                  </div>
                  <div className="settings-option">
                    <label>Chế độ hiển thị</label>
                    <button className="theme-toggle" onClick={toggleTheme}>
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
                    className="close-settings"
                    onClick={toggleSettings}
                    aria-label="Đóng cài đặt"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="auth-links">
          <Link to="/auth/login" className="auth-link" aria-label="Đăng nhập">
            Đăng nhập
          </Link>
          <Link to="/auth/register" className="auth-link" aria-label="Đăng ký">
            Đăng ký
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
