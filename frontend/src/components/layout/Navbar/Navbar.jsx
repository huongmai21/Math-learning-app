"use client";

import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  refreshToken,
  refreshUser,
} from "../../../redux/slices/authSlice";
import { toast } from "react-toastify";
import ThemeContext from "../../../context/ThemeContext";
import {
  getNotifications,
  deleteNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  initSocket,
  listenForNotifications,
  getUnreadCount,
} from "../../../services/notificationService";
import { listenForLogout } from "../../../services/authService";
import useDropdown from "../../../hooks/useDropdown";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, loading, token } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

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
      requireAuth: false,
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
      requireAuth: false,
    },
    {
      title: "Khóa học",
      to: "/courses",
      isDropdown: false,
      requireAuth: false,
    },
    { title: "Thi đấu", to: "/exams", isDropdown: false, requireAuth: true },
    {
      title: "Góc học tập",
      to: "/study-corner",
      isDropdown: false,
      requireAuth: true,
    },
    {
      title: "Phòng học nhóm",
      to: "/study-room",
      isDropdown: false,
      requireAuth: true,
    },
  ];

  const loadNotifications = useCallback(async () => {
    if (!user || !token || !isAuthenticated || isLoadingNotifications) return;
    setIsLoadingNotifications(true);
    try {
      const response = await getNotifications(1, 10, true);
      setNotifications(response.data || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error("Error loading notifications:", error);
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu, vui lòng thử lại sau.", {
          position: "top-right",
          autoClose: 3000,
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await loadNotifications();
      } else if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại", {
          position: "top-right",
          autoClose: 3000,
        });
        dispatch(logout());
        navigate("/auth/login");
      }
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [
    user,
    token,
    isAuthenticated,
    isLoadingNotifications,
    dispatch,
    navigate,
  ]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadNotifications();
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [loadNotifications]);

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user || !token || !isAuthenticated) return;
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Error loading unread count:", error);
        if (error.response?.status === 401) {
          dispatch(logout());
          navigate("/auth/login");
        }
      }
    };
    loadUnreadCount();
  }, [user, token, isAuthenticated, dispatch, navigate]);

  useEffect(() => {
    let socket = null;
    let refreshInterval = null;

    const initializeSocketAndRefresh = async () => {
      if (!user || !token || !isAuthenticated) {
        if (
          location.pathname !== "/auth/login" &&
          location.pathname !== "/auth/register"
        ) {
          navigate("/auth/login");
        }
        return;
      }

      // Kiểm tra token hợp lệ bằng cách gọi API refreshUser
      try {
        await dispatch(refreshUser()).unwrap();
      } catch (error) {
        console.error("Token invalid or expired:", error);
        dispatch(logout());
        navigate("/auth/login");
        return;
      }

      socket = initSocket();
      listenForNotifications(user._id, (notification) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 10));
        setUnreadCount((prev) => prev + 1);
        toast.info(`Thông báo mới: ${notification.message}`, {
          position: "top-right",
        });
      });

      listenForLogout((data) => {
        console.log("Received logout event:", data);
        dispatch(logout());
        toast.info(data.message || "Bạn đã đăng xuất", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/auth/login");
      });

      refreshInterval = setInterval(() => {
        dispatch(refreshToken())
          .unwrap()
          .catch(() => {
            clearInterval(refreshInterval);
            dispatch(logout());
            navigate("/auth/login");
          });
      }, 24* 60 * 60 * 1000);
    };

    initializeSocketAndRefresh();

    return () => {
      if (socket) socket.disconnect();
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [user, token, isAuthenticated, dispatch, navigate, location.pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success("Đăng xuất thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/auth/login");
    } catch (error) {
      toast.error("Đăng xuất thất bại", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Logout error:", error);
      dispatch(logout());
      navigate("/auth/login");
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter((notif) => notif._id !== id));
      setUnreadCount((prev) =>
        notifications.find((n) => n._id === id)?.read ? prev : prev - 1
      );
      toast.success("Xóa thông báo thành công!", { position: "top-right" });
    } catch (error) {
      toast.error("Không thể xóa thông báo", { position: "top-right" });
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(
        notifications.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => prev - 1);
      navigate("/notifications");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Không thể đánh dấu thông báo", { position: "top-right" });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc!", {
        position: "top-right",
      });
    } catch (error) {
      toast.error("Không thể đánh dấu tất cả thông báo", {
        position: "top-right",
      });
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
          {menuItems.map((item, index) => {
            if (item.requireAuth && !isAuthenticated) return null;
            return item.isDropdown ? (
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
            );
          })}
        </nav>
      </div>
      {loading && !user ? (
        <div className="loading">Đang tải...</div>
      ) : isAuthenticated && user ? (
        <div className="user-actions">
          <div
            className="user-info"
            ref={profileRef}
            onClick={() => {
              console.log("Clicking avatar");
              toggleProfile();
            }}
            aria-haspopup="true"
            aria-expanded={profileOpen}
            style={{ cursor: "pointer" }}
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
              <div className="profile-dropdown" role="menu">
                <Link
                  to="/users/profile"
                  className="dropdown-item"
                  role="menuitem"
                >
                  Hồ sơ
                </Link>
                {user.role === "student" && (
                  <>
                    <Link
                      to="/courses/my-courses"
                      className="dropdown-item"
                      role="menuitem"
                    >
                      Khóa học của tôi
                    </Link>
                    <Link
                      to="/achievements"
                      className="dropdown-item"
                      role="menuitem"
                    >
                      Thành tích
                    </Link>
                  </>
                )}
                {user.role === "teacher" && (
                  <>
                    <Link
                      to="/courses/my-courses"
                      className="dropdown-item"
                      role="menuitem"
                    >
                      Khóa học của tôi
                    </Link>
                    <Link
                      to="/exams/create"
                      className="dropdown-item"
                      role="menuitem"
                    >
                      Tạo đề thi
                    </Link>
                    <Link
                      to="/documents/create"
                      className="dropdown-item"
                      role="menuitem"
                    >
                      Tạo tài liệu
                    </Link>
                  </>
                )}
                {user.role === "admin" && (
                  <Link to="/admin" className="dropdown-item" role="menuitem">
                    Quản lý hệ thống
                  </Link>
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
            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount}</span>
            )}
            {notificationsOpen && (
              <div className="notification-dropdown" role="menu">
                {isLoadingNotifications && notifications.length === 0 ? (
                  <div className="notification-item">Đang tải thông báo...</div>
                ) : notifications.length > 0 ? (
                  <>
                    <button
                      className="dropdown-item"
                      onClick={handleMarkAllAsRead}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                    {notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`notification-item ${notif.importance} ${
                          notif.read ? "read" : "unread"
                        }`}
                        role="menuitem"
                        onClick={() =>
                          !notif.read && handleMarkAsRead(notif._id)
                        }
                      >
                        <span className="notification-title">
                          {notif.title}
                        </span>
                        <span>{notif.message}</span>
                        {notif.link && (
                          <a
                            href={notif.link}
                            className="notification-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Xem chi tiết
                          </a>
                        )}
                        <span className="notification-time">
                          {new Date(notif.createdAt).toLocaleString("vi-VN")}
                        </span>
                        <button
                          className="delete-notification"
                          onClick={(e) =>
                            handleDeleteNotification(notif._id, e)
                          }
                          aria-label={`Xóa thông báo: ${notif.message}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </>
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
