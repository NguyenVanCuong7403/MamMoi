import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../API/context/AuthContext"

export default function RoleGuard({ children, roles = [] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (roles.length > 0 && !roles.includes(user.role))
    return <Navigate to="/" replace />;
  return children;
}
