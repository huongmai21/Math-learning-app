// frontend/src/components/Pcommon/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;