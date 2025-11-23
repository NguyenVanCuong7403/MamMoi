import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../API/context/AuthContext";

const normalizeRoles = (input = []) =>
  input
    .filter(Boolean)
    .map((role) => role.toLowerCase());

/**
 * Get the appropriate redirect path based on user role when access is denied
 */
const getRedirectPathForRole = (userRole) => {
  const normalizedRole = normalizeRoles([userRole])[0];
  
  if (normalizedRole === "systemadmin") {
    return "/admin/users";
  }
  
  if (normalizedRole === "businessadmin") {
    return "/admin/business/trees";
  }
  
  // Regular user or unknown role
  return "/";
};

export default function RoleGuard({ children, roles = [] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;

  const userRoles = normalizeRoles([
    user.role,
    ...(Array.isArray(user.roles) ? user.roles : []),
  ]);
  const requiredRoles = normalizeRoles(roles);

  // Check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.some((role) => userRoles.includes(role))) {
    // Redirect to appropriate page based on user's role
    const redirectPath = getRedirectPathForRole(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
