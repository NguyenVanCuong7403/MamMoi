import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../API/context/AuthContext"

export default function LoginGuard({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}
