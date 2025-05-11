// frontend/src/components/layout/Sidebar.jsx
import React from "react";
import { Tooltip } from "react-tooltip";
import "./Sidebar.css"; // Import CSS riêng

const Sidebar = ({ activeTab, onTabChange, user, tabs }) => {
  const defaultTabs = [
    { id: "exercise", icon: "fa-solid fa-pen", label: "Góc giải bài tập" },
    { id: "study", icon: "fa-solid fa-book", label: "Góc học tập" },
    { id: "share", icon: "fa-solid fa-share", label: "Góc chia sẻ" },
    { id: "bookmarks", icon: "fa-solid fa-bookmark", label: "Bookmarks" },
    { id: "notifications", icon: "fa-solid fa-bell", label: "Thông báo" },
  ];

  const profileTabs = [
    { id: "overview", icon: "fa-solid fa-house", label: "Tổng quan" },
    ...(user?.role === "student"
      ? [{ id: "stats", icon: "fa-solid fa-chart-line", label: "Thống kê" }]
      : []),
    { id: "library", icon: "fa-solid fa-book", label: "Thư viện" },
    { id: "friends", icon: "fa-solid fa-users", label: "Bạn bè" },
    { id: "posts", icon: "fa-solid fa-file-alt", label: "Bài đăng" },
    { id: "courses", icon: "fa-solid fa-graduation-cap", label: "Khóa học" },
    ...(user?.role === "teacher" || user?.role === "admin"
      ? [{ id: "create-exam", icon: "fa-solid fa-pen", label: "Tạo đề thi" }]
      : []),
  ];

  const adminTabs = [
    { id: "users", icon: "fa-solid fa-users", label: "Người dùng" },
    { id: "exams", icon: "fa-solid fa-pen", label: "Đề thi" },
    { id: "stats", icon: "fa-solid fa-chart-line", label: "Thống kê" },
    { id: "library", icon: "fa-solid fa-book", label: "Thư viện" },
  ];

  const tabList =
    tabs === "profile"
      ? profileTabs
      : tabs === "admin"
      ? adminTabs
      : defaultTabs;

  return (
    <div className="sidebar">
      <ul>
        {tabList.map((tab) => (
          <li
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => onTabChange(tab.id)}
            data-tooltip-id={`${tab.id}-tab`}
            data-tooltip-content={tab.label}
          >
            <i className={tab.icon}></i>
          </li>
        ))}
      </ul>
      {tabList.map((tab) => (
        <Tooltip
          key={tab.id}
          id={`${tab.id}-tab`}
          place="right"
          className="z-[1000] bg-[#333] text-white text-sm rounded-md px-2 py-1"
        />
      ))}
    </div>
  );
};

export default Sidebar;
