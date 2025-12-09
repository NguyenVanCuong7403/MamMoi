import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../API/context/AuthContext"

function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // decode JWT payload
    const exp = payload.exp; // seconds since epoch
    const now = Math.floor(Date.now() / 1000); // current time in seconds
    return exp < now;
  } catch (err) {
    console.error("Failed to decode JWT", err);
    return true;
  }
}


export default function LoginGuard({ children }) {
  // DISABLED: Authentication temporarily disabled for development
  // const { token, logout } = useAuth();
  // if (token && isTokenExpired(token)) {
  //   logout(); // clear user/token from context and localStorage
  //   return <Navigate to="/auth" replace />;
  // }
  // if (!token) return <Navigate to="/auth" replace />;
  return children;
}
