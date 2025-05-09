import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRelatedDocuments } from "../../services/documentService";

const RelatedDocuments = ({ currentDoc }) => {
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRelated = async () => {
      setIsLoading(true);
      try {
        const docs = await fetchRelatedDocuments(
          currentDoc.educationLevel,
          currentDoc.subject,
          currentDoc._id
        );
        setRelated(docs);
      } catch (error) {
        console.error("Error fetching related documents:", error);
        setRelated([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelated();
  }, [currentDoc]);

  return (
    <div className="related-docs">
      <h3>Tài liệu liên quan</h3>
      {isLoading ? (
        <p>Đang tải tài liệu liên quan...</p>
      ) : related.length > 0 ? (
        <div className="doc-grid">
          {related.map((doc) => (
            <div key={doc._id} className="doc-card">
              <img src={doc.thumbnail || "/assets/images/default-doc.png"} alt="thumbnail" />
              <h4>{doc.title}</h4>
              <p>{doc.description?.slice(0, 80)}...</p>
              <Link to={`/documents/detail/${doc._id}`} className="view-link">
                Xem chi tiết →
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>Không có tài liệu liên quan.</p>
      )}
    </div>
  );
};

export default RelatedDocuments;