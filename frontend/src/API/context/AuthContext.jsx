import React, { createContext, useState, useEffect, useContext } from "react";
import AuthRepository from "../repositories/AuthRepository";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken"));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await AuthRepository.login(email, password);

      if (!data.success || !data.accessToken) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      const userData = {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        isEmailVerified: data.isEmailVerified,
      };

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return { success: true };
    } catch (err) {
      console.error("Login failed:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthRepository.logout();
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  };

  const refreshUser = async () => {
    try {
      const res = await AuthRepository.me();
      if (res.success && res.data) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to refresh user:", err);
      logout();
    }
  };

  useEffect(() => {
    if (token && !user) refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
