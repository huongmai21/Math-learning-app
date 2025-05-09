import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDocument } from "../../services/documentService";
import "./Document.css";

const educationLevels = [
  { value: "primary", label: "Tiểu học" },
  { value: "secondary", label: "Trung học cơ sở" },
  { value: "highschool", label: "Trung học phổ thông" },
  { value: "university", label: "Đại học" },
];

const grades = {
  primary: ["1", "2", "3", "4", "5"],
  secondary: ["6", "7", "8", "9"],
  highschool: ["10", "11", "12"],
};

const universitySubjects = [
  { value: "advanced_math", label: "Toán cao cấp" },
  { value: "calculus", label: "Giải tích" },
  { value: "algebra", label: "Đại số" },
  { value: "probability_statistics", label: "Xác suất thống kê" },
  { value: "differential_equations", label: "Phương trình vi phân" },
];

const documentTypes = {
  primary: [
    { value: "textbook", label: "SGK" },
    { value: "exercise_book", label: "SBT" },
    { value: "special_topic", label: "Chuyên đề/Đề thi" },
  ],
  secondary: [
    { value: "textbook", label: "SGK" },
    { value: "exercise_book", label: "SBT" },
    { value: "special_topic", label: "Chuyên đề/Đề thi" },
  ],
  highschool: [
    { value: "textbook", label: "SGK" },
    { value: "exercise_book", label: "SBT" },
    { value: "special_topic", label: "Chuyên đề/Đề thi" },
  ],
  university: [
    { value: "textbook", label: "Giáo trình" },
    { value: "exercise", label: "Bài tập" },
    { value: "reference", label: "Tài liệu tham khảo" },
  ],
};

const CreateDocument = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    thumbnail: "",
    educationLevel: "",
    grade: "",
    subject: "",
    documentType: "",
    tags: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "educationLevel" ? { grade: "", subject: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
      };
      await createDocument(data);
      navigate("/documents");
    } catch (err) {
      setError(err.response?.data?.message || "Tạo tài liệu thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="doc-form">
        <h2>Tạo tài liệu mới</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Tiêu đề tài liệu"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Mô tả tài liệu"
          />
          <input
            type="url"
            name="fileUrl"
            value={formData.fileUrl}
            onChange={handleChange}
            placeholder="URL tệp tài liệu"
            required
          />
          <input
            type="url"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
            placeholder="URL hình thu nhỏ"
          />
          <select
            name="educationLevel"
            value={formData.educationLevel}
            onChange={handleChange}
            required
          >
            <option value="">Chọn cấp học</option>
            {educationLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          {formData.educationLevel &&
            formData.educationLevel !== "university" && (
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
              >
                <option value="">Chọn lớp</option>
                {grades[formData.educationLevel]?.map((grade) => (
                  <option key={grade} value={grade}>
                    Lớp {grade}
                  </option>
                ))}
              </select>
            )}
          {formData.educationLevel === "university" && (
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
            >
              <option value="">Chọn môn học</option>
              {universitySubjects.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
          )}
          <select
            name="documentType"
            value={formData.documentType}
            onChange={handleChange}
            required
          >
            <option value="">Chọn loại tài liệu</option>
            {formData.educationLevel &&
              documentTypes[formData.educationLevel]?.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
          </select>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Thẻ (cách nhau bằng dấu phẩy)"
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Đang tạo..." : "Tạo tài liệu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDocument;
