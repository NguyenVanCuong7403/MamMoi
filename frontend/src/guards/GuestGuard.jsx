import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../API/context/AuthContext";

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

export default function GuestGuard({ children }) {
    const { token } = useAuth();

    // If user is authenticated (token exists and not expired), redirect to home
    if (token && !isTokenExpired(token)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
