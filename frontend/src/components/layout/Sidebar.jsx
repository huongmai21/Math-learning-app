import React from "react";
import { Tooltip } from "react-tooltip";

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
    <div className="fixed top-[70px] left-5 w-[60px] h-[calc(100vh-90px)] bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] flex flex-col items-center py-2 z-[900] md:top-[70px] md:left-5 md:w-[60px] md:h-[calc(100vh-90px)] md:flex-col md:items-center md:py-2 sm:bottom-0 sm:top-auto sm:left-0 sm:w-full sm:h-[60px] sm:flex-row sm:justify-center sm:rounded-none sm:shadow-[0_-2px_10px_rgba(0,0,0,0.08)] sm:py-1">
      <ul className="flex flex-col w-full sm:flex-row sm:gap-2 sm:justify-around sm:w-full">
        {tabList.map((tab) => (
          <li
            key={tab.id}
            className={`flex justify-center p-4 sm:p-2 cursor-pointer text-[#6e7681] text-xl sm:text-lg transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-[#f6f8fa] text-[#ff6f61] rounded-lg sm:rounded-md"
                : "hover:bg-[#f6f8fa] hover:text-[#ff6f61]"
            }`}
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
