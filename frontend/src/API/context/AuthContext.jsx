import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import AuthRepository from "../repositories/AuthRepository";

const AuthContext = createContext(null);

const ROLE_CLAIM_KEYS = [
  "role",
  "roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role",
];

const MAX_REMEMBERED_EMAILS = 5; // Giới hạn tối đa 5 email được ghi nhớ

// Helper functions để quản lý danh sách email đã ghi nhớ
const getRememberedEmails = () => {
  try {
    const stored = localStorage.getItem("rememberedEmails");
    if (!stored) {
      // Kiểm tra xem có email cũ (string) không để migrate
      const oldEmail = localStorage.getItem("rememberedEmail");
      if (oldEmail) {
        const emails = [oldEmail];
        localStorage.setItem("rememberedEmails", JSON.stringify(emails));
        localStorage.removeItem("rememberedEmail"); // Xóa key cũ
        return emails;
      }
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const addRememberedEmail = (email) => {
  if (!email || !email.trim()) return;
  const trimmedEmail = email.trim();
  const emails = getRememberedEmails();

  // Xóa email nếu đã tồn tại (để đưa lên đầu)
  const filtered = emails.filter((e) => e !== trimmedEmail);

  // Thêm email vào đầu danh sách
  const updated = [trimmedEmail, ...filtered];

  // Giới hạn số lượng email
  const limited = updated.slice(0, MAX_REMEMBERED_EMAILS);

  localStorage.setItem("rememberedEmails", JSON.stringify(limited));
};

const removeRememberedEmail = (email) => {
  if (!email) return;
  const trimmedEmail = email.trim();
  const emails = getRememberedEmails();
  const filtered = emails.filter((e) => e !== trimmedEmail);

  if (filtered.length === 0) {
    localStorage.removeItem("rememberedEmails");
  } else {
    localStorage.setItem("rememberedEmails", JSON.stringify(filtered));
  }
};

const clearRememberedEmails = () => {
  localStorage.removeItem("rememberedEmails");
  localStorage.removeItem("rememberedEmail"); // Xóa key cũ nếu còn
};

const decodeJwtPayload = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded =
      base64.length % 4 === 0
        ? base64
        : base64.padEnd(base64.length + (4 - (base64.length % 4)), "=");
    return JSON.parse(atob(padded));
  } catch (err) {
    console.warn("Failed to decode JWT payload", err);
    return null;
  }
};

const extractRolesFromToken = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    console.warn("⚠️ JWT payload is null");
    return { primaryRole: null, roles: [] };
  }

  // Log all keys in payload for debugging
  console.log("🔍 JWT payload keys:", Object.keys(payload));
  console.log("🔍 JWT payload:", payload);

  // Try to find role in various claim keys
  for (const key of ROLE_CLAIM_KEYS) {
    const value = payload[key];
    if (!value) continue;

    console.log(`✅ Found role claim with key "${key}":`, value);

    if (Array.isArray(value)) {
      const result = { primaryRole: value[0], roles: value };
      console.log("✅ Extracted roles (array):", result);
      return result;
    }

    const result = { primaryRole: value, roles: [value] };
    console.log("✅ Extracted role (single):", result);
    return result;
  }

  // If no role found in standard keys, check all keys for role-like values
  for (const key of Object.keys(payload)) {
    if (key.toLowerCase().includes("role")) {
      const value = payload[key];
      console.log(`⚠️ Found potential role key "${key}":`, value);
      if (Array.isArray(value)) {
        return { primaryRole: value[0], roles: value };
      }
      if (typeof value === "string" && value) {
        return { primaryRole: value, roles: [value] };
      }
    }
  }

  console.warn("⚠️ No role found in JWT token");
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
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem("refreshToken")
  );
  const [loading, setLoading] = useState(false);

  const login = async (email, password, remember = false) => {
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

      console.log("🔍 Extracted role from token:", { primaryRole, roles });

      const userData = {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        isEmailVerified: data.isEmailVerified,
        ProfileImageUrl: data.ProfileImageUrl,
        role: primaryRole,
        roleId: data.roleId, // Add roleId from response
        roles,
      };

      console.log("✅ User data to be saved:", userData);

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Lưu email để ghi nhớ đăng nhập (KHÔNG lưu password vì lý do bảo mật)
      // Hỗ trợ nhiều email: lưu vào danh sách thay vì ghi đè
      if (remember) {
        addRememberedEmail(email);
      } else {
        // Nếu không tick "Ghi nhớ", chỉ xóa email hiện tại khỏi danh sách (nếu có)
        // Không xóa toàn bộ danh sách để giữ lại các email khác
        removeRememberedEmail(email);
      }

      setUser(userData);
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      console.log(
        "✅ Login successful, returning role:",
        primaryRole,
        "roleId:",
        data.roleId
      );

      // Sau đăng nhập, gọi refreshUser để lấy thông tin mới nhất bao gồm avatar
      // Sử dụng setTimeout để đảm bảo state đã được cập nhật
      setTimeout(async () => {
        try {
          const res = await AuthRepository.me();
          if (res?.success && res.data) {
            const apiUser = res.data;
            const refreshedUser = {
              ...userData,
              ProfileImageUrl:
                apiUser.profileImageUrl ??
                apiUser.ProfileImageUrl ??
                userData.ProfileImageUrl,
            };
            setUser(refreshedUser);
            localStorage.setItem("user", JSON.stringify(refreshedUser));
            // Dispatch event để Header biết cập nhật avatar
            window.dispatchEvent(new CustomEvent("userProfileUpdated"));
          }
        } catch (err) {
          console.warn("Failed to refresh user after login:", err);
        }
      }, 100);

      return {
        success: true,
        role: primaryRole,
        roleId: data.roleId,
        user: userData,
      };
    } catch (err) {
      console.error("Login failed:", err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (idToken) => {
    setLoading(true);
    try {
      const response = await AuthRepository.loginWithGoogle(idToken);
      console.log("🔍 AuthContext Google login response:", response);

      if (!response || !response.success) {
        throw new Error(response?.message || "Đăng nhập với Google thất bại");
      }

      const data = response.data;
      if (!data || !data.accessToken) {
        throw new Error(data?.message || "Đăng nhập với Google thất bại");
      }

      const { primaryRole, roles } = extractRolesFromToken(data.accessToken);

      console.log("🔍 Extracted role from token:", { primaryRole, roles });

      const userData = {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        isEmailVerified: data.isEmailVerified,
        ProfileImageUrl: data.profileImageUrl || data.ProfileImageUrl,
        role: primaryRole,
        roleId: data.roleId,
        roles,
      };

      console.log("✅ User data to be saved:", userData);

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Add email to remembered emails for Google login
      if (data.email) {
        addRememberedEmail(data.email);
      }

      setUser(userData);
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      console.log(
        "✅ Google login successful, returning role:",
        primaryRole,
        "roleId:",
        data.roleId
      );

      // Sau đăng nhập Google, gọi refreshUser để lấy thông tin mới nhất bao gồm avatar
      setTimeout(async () => {
        try {
          const res = await AuthRepository.me();
          if (res?.success && res.data) {
            const apiUser = res.data;
            const refreshedUser = {
              ...userData,
              ProfileImageUrl:
                apiUser.profileImageUrl ??
                apiUser.ProfileImageUrl ??
                userData.ProfileImageUrl,
            };
            setUser(refreshedUser);
            localStorage.setItem("user", JSON.stringify(refreshedUser));
            // Dispatch event để Header biết cập nhật avatar
            window.dispatchEvent(new CustomEvent("userProfileUpdated"));
          }
        } catch (err) {
          console.warn("Failed to refresh user after Google login:", err);
        }
      }, 100);

      return {
        success: true,
        role: primaryRole,
        roleId: data.roleId,
        user: userData,
      };
    } catch (err) {
      console.error("Google login failed:", err);
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
          message:
            response.message ||
            "Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP.",
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: response.message || "Đăng ký thất bại",
        };
      }
    } catch (err) {
      console.error("Register failed:", err);
      return {
        success: false,
        message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (contact, otpCode) => {
    setLoading(true);
    try {
      // Determine if contact is email or phone
      const isEmail = contact && contact.includes("@");
      const isPhone = contact && /^(0|\+84|84)\d{9,10}$/.test(contact.replace(/\D/g, "").replace(/^84/, "0"));

      const requestData = {
        otpCode,
        email: isEmail ? contact : undefined,
        phone: isPhone ? contact : undefined,
      };

      const response = await AuthRepository.verifyOtp(requestData);

      console.log("🔍 AuthContext verifyOtp response:", response);

      if (response.success) {
        return {
          success: true,
          message: response.message || "Xác thực OTP thành công!",
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: response.message || "OTP không hợp lệ",
        };
      }
    } catch (err) {
      console.error("Verify OTP failed:", err);
      return {
        success: false,
        message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      };
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
        return {
          success: false,
          message: response.message || "Gửi email thất bại",
        };
      }
    } catch (err) {
      console.error("Forgot password failed:", err);
      return {
        success: false,
        message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      };
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
        return {
          success: false,
          message: response.message || "Gửi lại OTP thất bại",
        };
      }
    } catch (err) {
      console.error("Resend OTP failed:", err);
      return {
        success: false,
        message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyResetOtp = async (email, otpCode) => {
    setLoading(true);
    try {
      const response = await AuthRepository.verifyResetOtp({
        email,
        otpCode,
      });

      console.log("🔍 AuthContext verifyResetOtp response:", response);

      if (response.success) {
        return {
          success: true,
          message: response.message || "Xác thực OTP thành công!",
        };
      } else {
        return {
          success: false,
          message: response.message || "OTP không hợp lệ hoặc đã hết hạn",
        };
      }
    } catch (err) {
      console.error("Verify Reset OTP failed:", err);
      return {
        success: false,
        message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      };
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
        return {
          success: false,
          message: response.message || "Đổi mật khẩu thất bại",
        };
      }
    } catch (err) {
      console.error("Reset password failed:", err);
      return {
        success: false,
        message: err.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      await AuthRepository.logout();
    } catch { }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // KHÔNG xóa rememberedEmail khi logout - để giữ lại cho lần đăng nhập sau
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  }, []);

  /* ===== SIDE EFFECT HANDLER ===== */
  // Sync user state to localStorage and notify listeners whenever user changes.
  // This replaces side effects that were previously inside setUser updaters.
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new CustomEvent("userProfileUpdated"));
    }
  }, [user]);

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
            isEmailVerified:
              apiUser.isEmailVerified ?? prevSafe.isEmailVerified,
            ProfileImageUrl:
              apiUser.profileImageUrl ??
              apiUser.ProfileImageUrl ??
              prevSafe.ProfileImageUrl,
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

          // Side effects removed from here!
          return nextUser;
        });
      }
    } catch (err) {
      console.warn("Failed to refresh user:", err);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (token) refreshUser();
  }, [token, refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        login,
        loginWithGoogle,
        register,
        verifyOtp,
        verifyResetOtp,
        forgotPassword,
        resetPassword,
        resendOtp,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
