import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useUser();

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Allow superadmin always
  if (user.user_type === "superadmin") {
    return children;
  }

  // Role is restricted
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.user_type)) {
    return <Navigate to="/dashboard/admin-dashboard" replace />;
  }

  return children;
}
