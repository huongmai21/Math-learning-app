// frontend/src/pages/FriendsTab.jsx
import React from "react";
import './Profile.css';

const FriendsTab = ({
  friendsFilter,
  setFriendsFilter,
  friendsSearchQuery,
  setFriendsSearchQuery,
  followers,
  following,
}) => {
  return (
    <div className="friends-tab">
      <h3>Danh sách bạn bè</h3>
      <div className="friends-filter">
        <button
          className={friendsFilter === "followers" ? "active" : ""}
          onClick={() => setFriendsFilter("followers")}
        >
          Người theo dõi ({followers.length})
        </button>
        <button
          className={friendsFilter === "following" ? "active" : ""}
          onClick={() => setFriendsFilter("following")}
        >
          Đang theo dõi ({following.length})
        </button>
        <input
          type="text"
          placeholder="Tìm kiếm theo username..."
          value={friendsSearchQuery}
          onChange={(e) => setFriendsSearchQuery(e.target.value)}
        />
      </div>
      {(friendsFilter === "followers" ? followers : following).filter(
        (friend) =>
          friend.username.toLowerCase().includes(friendsSearchQuery.toLowerCase())
      ).length > 0 ? (
        (friendsFilter === "followers" ? followers : following)
          .filter((friend) =>
            friend.username
              .toLowerCase()
              .includes(friendsSearchQuery.toLowerCase())
          )
          .map((friend) => (
            <div key={friend._id} className="friend-item">
              <img src={friend.avatar} alt="Avatar" className="friend-avatar" />
              <span>{friend.username}</span>
            </div>
          ))
      ) : (
        <p>Không tìm thấy bạn bè nào.</p>
      )}
    </div>
  );
};

export default FriendsTab;