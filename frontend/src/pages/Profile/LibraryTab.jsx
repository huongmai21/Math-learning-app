import React from "react";
import "./Profile.css";

const LibraryTab = ({ libraryItems }) => {
  return (
    <div className="library-tab">
      <h3>Thư viện (Bookmarks)</h3>
      {libraryItems.length > 0 ? (
        libraryItems.map((item) => (
          <div key={item._id} className="library-item">
            <h4>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            </h4>
            <p>Loại: {item.type === "document" ? "Tài liệu" : "Tin tức"}</p>
          </div>
        ))
      ) : (
        <p>Chưa có tài liệu hoặc tin tức nào được lưu.</p>
      )}
    </div>
  );
};

export default LibraryTab;
