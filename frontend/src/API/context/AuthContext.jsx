import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import AuthRepository from "../repositories/AuthRepository";

const AuthContext = createContext(null);

const ROLE_CLAIM_KEYS = [
  "role",
  "roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
];

const decodeJwtPayload = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      base64.length % 4 === 0 ? base64 : base64.padEnd(base64.length + (4 - (base64.length % 4)), "=");
    return JSON.parse(atob(padded));
  } catch (err) {
    console.warn("Failed to decode JWT payload", err);
    return null;
  }
};

const extractRolesFromToken = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload) return { primaryRole: null, roles: [] };

  for (const key of ROLE_CLAIM_KEYS) {
    const value = payload[key];
    if (!value) continue;

    if (Array.isArray(value)) {
      return { primaryRole: value[0], roles: value };
    }

    return { primaryRole: value, roles: [value] };
  }

  return { primaryRole: null, roles: [] };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed?.role) return parsed;

    const storedToken = localStorage.getItem("token");
    const { primaryRole, roles } = extractRolesFromToken(storedToken);
    if (primaryRole) {
      const enrichedUser = { ...parsed, role: primaryRole, roles };
      localStorage.setItem("user", JSON.stringify(enrichedUser));
      return enrichedUser;
    }
    return parsed;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken"));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await AuthRepository.login(email, password);
      console.log("🔍 AuthContext login response:", response);

      if (!response || !response.success) {
        throw new Error(response?.message || "Đăng nhập thất bại");
      }

      const data = response.data;
      if (!data || !data.accessToken) {
        throw new Error(data?.message || "Đăng nhập thất bại");
      }

      const { primaryRole, roles } = extractRolesFromToken(data.accessToken);

      const userData = {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        isEmailVerified: data.isEmailVerified,
        ProfileImageUrl: data.ProfileImageUrl,
        role: primaryRole,
        roles,
      };

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return { success: true, role: primaryRole, user: userData };
    } catch (err) {
      console.error("Login failed:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, phone, password) => {
    setLoading(true);
    try {
      const response = await AuthRepository.register({
        fullName,
        email,
        password,
        phone,
      });

      console.log("🔍 AuthContext register response:", response);

      if (response.success) {
        return { 
          success: true, 
          message: response.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP.",
          data: response.data
        };
      } else {
        return { success: false, message: response.message || "Đăng ký thất bại" };
      }
    } catch (err) {
      console.error("Register failed:", err);
      return { success: false, message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại." };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email, otpCode) => {
    setLoading(true);
    try {
      const response = await AuthRepository.verifyOtp({
        email,
        otpCode,
      });

      console.log("🔍 AuthContext verifyOtp response:", response);

      if (response.success) {
        return { 
          success: true, 
          message: response.message || "Xác thực OTP thành công!",
          data: response.data
        };
      } else {
        return { success: false, message: response.message || "OTP không hợp lệ" };
      }
    } catch (err) {
      console.error("Verify OTP failed:", err);
      return { success: false, message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại." };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const response = await AuthRepository.forgotPassword(email);

      console.log("🔍 AuthContext forgotPassword response:", response);

      if (response.success) {
        return { 
          success: true, 
          message: response.message || "Đã gửi email reset mật khẩu!",
        };
      } else {
        return { success: false, message: response.message || "Gửi email thất bại" };
      }
    } catch (err) {
      console.error("Forgot password failed:", err);
      return { success: false, message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại." };
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email) => {
    setLoading(true);
    try {
      const response = await AuthRepository.resendOtp({ email });

      console.log("🔍 AuthContext resendOtp response:", response);

      if (response.success) {
        return { 
          success: true, 
          message: response.message || "Đã gửi lại OTP!",
        };
      } else {
        return { success: false, message: response.message || "Gửi lại OTP thất bại" };
      }
    } catch (err) {
      console.error("Resend OTP failed:", err);
      return { success: false, message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại." };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, resetToken, newPassword) => {
    setLoading(true);
    try {
      const response = await AuthRepository.resetPassword({
        email,
        resetToken,
        newPassword,
      });

      console.log("🔍 AuthContext resetPassword response:", response);

      if (response.success) {
        return { 
          success: true, 
          message: response.message || "Đổi mật khẩu thành công!",
        };
      } else {
        return { success: false, message: response.message || "Đổi mật khẩu thất bại" };
      }
    } catch (err) {
      console.error("Reset password failed:", err);
      return { success: false, message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại." };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      await AuthRepository.logout();
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await AuthRepository.me();
      if (res?.success && res.data) {
        const apiUser = res.data;
        setUser((prev) => {
          const prevSafe = prev ?? {};
          const normalized = {
            userId: apiUser.userId ?? apiUser.UserId ?? prevSafe.userId,
            email: apiUser.email ?? apiUser.Email ?? prevSafe.email,
            fullName: apiUser.fullName ?? apiUser.name ?? prevSafe.fullName,
            isEmailVerified: apiUser.isEmailVerified ?? prevSafe.isEmailVerified,
            ProfileImageUrl: apiUser.profileImageUrl ?? apiUser.ProfileImageUrl ?? prevSafe.ProfileImageUrl,
            role: apiUser.role ?? apiUser.Role ?? prevSafe.role,
          };

          const roleList = normalized.role
            ? Array.from(new Set([normalized.role, ...(prevSafe.roles || [])]))
            : prevSafe.roles || [];

          const nextUser = {
            ...prevSafe,
            ...normalized,
            roles: roleList,
          };

          localStorage.setItem("user", JSON.stringify(nextUser));
          return nextUser;
        });
      }
    } catch (err) {
      console.warn("Failed to refresh user:", err);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (token && !user) refreshUser();
  }, [token, user, refreshUser]);

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, register, verifyOtp, forgotPassword, resetPassword, resendOtp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
