// frontend/src/components/Pcommon/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;