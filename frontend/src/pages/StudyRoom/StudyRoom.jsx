import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io();

const StudyRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetch("/chat-rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error("Lỗi khi lấy danh sách phòng:", err));

    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const joinRoom = (roomId) => {
    setCurrentRoom(roomId);
    socket.emit("joinRoom", roomId);
  };

  const sendMessage = () => {
    if (newMessage && currentRoom) {
      socket.emit("chatMessage", {
        roomId: currentRoom,
        userId: localStorage.getItem("userId"),
        message: newMessage,
      });
      setNewMessage("");
    }
  };

  return (
    <div>
      <h1>Phòng học tập</h1>
      <div>
        <h2>Danh sách phòng</h2>
        {rooms.map((room) => (
          <button key={room._id} onClick={() => joinRoom(room._id)}>
            {room.title}
          </button>
        ))}
      </div>
      {currentRoom && (
        <div>
          <h2>Phòng hiện tại: {currentRoom}</h2>
          <div>
            {messages.map((msg, index) => (
              <p key={index}>
                {msg.userId}: {msg.message}
              </p>
            ))}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Gửi</button>
        </div>
      )}
    </div>
  );
};

export default StudyRoom;
