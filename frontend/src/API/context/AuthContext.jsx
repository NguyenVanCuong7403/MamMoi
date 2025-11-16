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
      const response = await AuthRepository.login(email, password);
      console.log("🔍 AuthContext login response:", response);

      if (!response || !response.success) {
        throw new Error(response?.message || "Đăng nhập thất bại");
      }

      const data = response.data;
      if (!data || !data.accessToken) {
        throw new Error(data?.message || "Đăng nhập thất bại");
      }

      const userData = {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        isEmailVerified: data.isEmailVerified,
        ProfileImageUrl: data.ProfileImageUrl,
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
    <AuthContext.Provider value={{ user, token, refreshToken, login, register, verifyOtp, forgotPassword, resetPassword, resendOtp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
