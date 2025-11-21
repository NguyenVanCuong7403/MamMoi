import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../API/context/AuthContext";

const normalizeRoles = (input = []) =>
  input
    .filter(Boolean)
    .map((role) => role.toLowerCase());

export default function RoleGuard({ children, roles = [] }) {
  // DISABLED: Role-based authentication temporarily disabled for development
  // const { user } = useAuth();
  // if (!user) return <Navigate to="/auth" replace />;

  // const userRoles = normalizeRoles([
  //   user.role,
  //   ...(Array.isArray(user.roles) ? user.roles : []),
  // ]);
  // const requiredRoles = normalizeRoles(roles);

  // if (requiredRoles.length > 0 && !requiredRoles.some((role) => userRoles.includes(role))) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
}
