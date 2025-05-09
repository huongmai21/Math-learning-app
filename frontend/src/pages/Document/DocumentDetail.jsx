import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getDocumentById,
  addBookmark,
  removeBookmark,
  checkBookmark,
} from "../../services/documentService";
import "./Document.css";

const DocumentDetail = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const doc = await getDocumentById(id);
        setDocument(doc);
        const bookmarkStatus = await checkBookmark(id);
        setIsBookmarked(bookmarkStatus.isBookmarked);
      } catch (err) {
        setError("Không thể tải tài liệu!");
      } finally {
        setIsLoading(false);
      }
    };
    loadDocument();
  }, [id]);

  useEffect(() => {
    // Khởi tạo MathJax để render công thức toán học
    if (window.MathJax) {
      window.MathJax.typeset();
    }
  }, [document]);

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await removeBookmark(id);
        setIsBookmarked(false);
      } else {
        await addBookmark({ documentId: id });
        setIsBookmarked(true);
      }
    } catch (err) {
      setError("Không thể cập nhật bookmark!");
    }
  };

  if (isLoading) return <p>Đang tải tài liệu...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!document) return <p>Không tìm thấy tài liệu!</p>;

  return (
    <div className="container">
      <div className="doc-detail">
        <h2>{document.title}</h2>
        <div className="doc-meta">
          <p>
            Lượt xem: {document.views} | Lượt tải: {document.downloads}
          </p>
          <p>Ngày đăng: {new Date(document.uploadedAt).toLocaleDateString()}</p>
          <button onClick={handleBookmark} className="bookmark-button">
            {isBookmarked ? "Bỏ Bookmark" : "Bookmark"}
          </button>
        </div>
        <div className="doc-content" style={{ backgroundSize: "140px" }}>
          {/* Hiển thị nội dung phong phú */}
          <div dangerouslySetInnerHTML={{ __html: document.content }} />
          {/* Hiển thị hình ảnh */}
          {document.images?.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Hình ${index + 1}`}
              className="doc-image"
            />
          ))}
          {/* Hiển thị video nhúng */}
          {document.videoUrl && (
            <div className="doc-video">
              <iframe
                src={document.videoUrl}
                title="Video tài liệu"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
        <div className="doc-tags">
          <p>Thẻ: {document.tags?.join(", ")}</p>
        </div>
        <Link to="/documents" className="back-link">
          Quay lại danh sách
        </Link>
      </div>
    </div>
  );
};

export default DocumentDetail;
