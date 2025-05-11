// frontend/src/pages/LibraryTab.jsx
import React from "react";
import './Profile.css';

const LibraryTab = ({
  libraryItems,
  newLibraryItem,
  setNewLibraryItem,
  handleAddLibraryItem,
}) => {
  return (
    <div className="library-tab">
      <h3>Thư viện</h3>
      <form onSubmit={handleAddLibraryItem} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm">Tiêu đề</label>
          <input
            type="text"
            value={newLibraryItem.title}
            onChange={(e) =>
              setNewLibraryItem({ ...newLibraryItem, title: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Loại</label>
          <select
            value={newLibraryItem.type}
            onChange={(e) =>
              setNewLibraryItem({ ...newLibraryItem, type: e.target.value })
            }
            className="w-full p-2 border rounded"
          >
            <option value="document">Tài liệu</option>
            <option value="news">Tin tức</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm">URL</label>
          <input
            type="url"
            value={newLibraryItem.url}
            onChange={(e) =>
              setNewLibraryItem({ ...newLibraryItem, url: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-[#0366d6] text-white rounded hover:bg-[#024ea4]"
        >
          Thêm vào thư viện
        </button>
      </form>
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
        <p>Chưa có tài liệu hoặc tin tức nào.</p>
      )}
    </div>
  );
};

export default LibraryTab;