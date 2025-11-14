import React, { useMemo, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  ShieldCheck,
  Phone,
  ArrowRight,
  Sparkles,
  X as XIcon,
  Clock,
} from "lucide-react";
import { useAuth } from "../../API/context/AuthContext";
import { useNavigate } from "react-router-dom";

import { LivingBackground } from "@/components/background";

// input rõ hơn, font to hơn, placeholder đậm hơn
const baseInputClass =
  "mm-plain-input h-11 w-full border-none bg-transparent p-0 text-[15px] text-slate-900 placeholder:text-slate-600 focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen({ defaultTab = "login" }) {
  const [tab, setTab] = useState(defaultTab);

  const [loginResetToken, setLoginResetToken] = useState(0);
  const [dialogId, setDialogId] = useState(0);

  // OTP (giữ lại cho đăng ký + quên mật khẩu)
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpTarget, setOtpTarget] = useState(null); // { channel, value }
  const [pendingAction, setPendingAction] = useState(null); // { type, payload }
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSession, setOtpSession] = useState(0);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");

  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [forgotContext, setForgotContext] = useState(null); // { acct, mode }

  // popup thông báo nhỏ
  const [authDialog, setAuthDialog] = useState(null); // { title, message, tone }

  // màn đặt lại mật khẩu mới (sau OTP quên mật khẩu)
  const [resetPwContext, setResetPwContext] = useState(null); // { contact, mode, otpCode }

  // overlay animation sau khi đăng nhập thành công
  const [loginSuccessOverlay, setLoginSuccessOverlay] = useState(false);

  const {
    login,
    register,
    forgotPassword,
    resetPassword,
    resendOtp,
    verifyOtp,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const openOtpFor = (type, payload) => {
    const channel = payload.mode || (payload.email ? "email" : "phone");
    const value =
      payload.contact ||
      payload.acct ||
      payload.email ||
      payload.phone ||
      "";

    setPendingAction({ type, payload });
    setOtpTarget({ channel, value });
    setOtpError("");
    setOtpSuccess(false);
    setOtpSuccessMessage("");
    setOtpOpen(true);
    setOtpSession((s) => s + 1);
    // TODO: gọi API gửi OTP thực tế ở đây (đã move xuống handleRegisterCredentials / handleForgotSubmit)
  };

  // ====== LOGIN: dùng tài khoản + mật khẩu ======
  const handleLoginCredentials = async (data) => {
    try {
      const res = await login(
        data.acct?.trim(),
        data.password,
        data.remember
      );

      if (!res || res.success === false) {
        setAuthDialog({
          title: "Đăng nhập không thành công",
          message:
            res?.message ||
            "Tài khoản hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin đăng nhập.",
          tone: "error",
        });
        return;
      }

      // Đăng nhập thành công -> hiện overlay 0.8s rồi vào hệ thống
      setLoginSuccessOverlay(true);

      setTimeout(() => {
        setLoginSuccessOverlay(false);
        navigate("/");
      }, 800);
    } catch (err) {
      setAuthDialog({
        title: "Đăng nhập không thành công",
        message: "Có lỗi xảy ra. Vui lòng thử lại.",
        tone: "error",
      });
    }
  };

  // ====== ĐĂNG KÝ: tạo tài khoản + gửi OTP ======
  const handleRegisterCredentials = async (data) => {
    try {
      if (register) {
        // Gọi API đăng ký thật – backend sẽ gửi OTP về email/SĐT
        // chỉnh lại tham số cho khớp backend của bạn nếu cần:
        const res = await register(
          data.name,
          data.email || data.phone,
          data.password
        );

        if (!res || res.success === false) {
          setAuthDialog({
            title: "Đăng ký không thành công",
            message:
              res?.message ||
              "Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.",
            tone: "error",
          });
          return;
        }
      }

      // Mở popup OTP sau khi backend đã gửi mã
      openOtpFor("register", data);
    } catch (err) {
      setAuthDialog({
        title: "Đăng ký không thành công",
        message: "Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại.",
        tone: "error",
      });
    }
  };

  // ====== QUÊN MẬT KHẨU: gửi OTP reset ======
  const handleForgotSubmit = async ({ acct, mode }) => {
    try {
      if (forgotPassword) {
        const res = await forgotPassword(acct);
        if (!res || res.success === false) {
          setAuthDialog({
            title: "Không gửi được mã OTP",
            message:
              res?.message ||
              "Không thể gửi mã OTP khôi phục mật khẩu. Vui lòng kiểm tra lại tài khoản hoặc thử lại sau.",
            tone: "error",
          });
          return;
        }
      }

      openOtpFor("reset", { contact: acct, mode });
      setForgotContext(null);
    } catch (err) {
      setAuthDialog({
        title: "Lỗi hệ thống",
        message: "Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại.",
        tone: "error",
      });
    }
  };

  const handleOtpClose = () => {
    setOtpOpen(false);
    setOtpError("");
    setOtpSuccess(false);
    setOtpSuccessMessage("");
  };

  const handleOtpResend = async () => {
    if (!otpTarget || !pendingAction) return;

    try {
      if (resendOtp) {
        const res = await resendOtp(otpTarget.value);
        if (!res || res.success === false) {
          setOtpError(
            res?.message ||
              "Không thể gửi lại mã OTP. Vui lòng thử lại sau."
          );
          return;
        }
      }
      setOtpError("");
      setOtpSuccess(false);
      setOtpSuccessMessage("Đã gửi lại mã OTP, vui lòng kiểm tra.");
    } catch (err) {
      setOtpError("Có lỗi xảy ra khi gửi lại mã OTP. Vui lòng thử lại.");
    }
  };

  const handleVerifyOtp = async (code) => {
    if (!pendingAction) return;
    setOtpError("");
    setOtpLoading(true);

    try {
      if (pendingAction.type === "login") {
        // Nhánh login bằng OTP giờ không dùng tới
        const { acct, password, remember } =
          pendingAction.payload || {};
        const res = await login(acct, password, remember, code);

        if (res && res.success === false && res.otpError) {
          setOtpError(res.otpError || "Mã OTP không chính xác.");
          return;
        }

        if (!res || res.success === false) {
          setOtpOpen(false);
          setPendingAction(null);
          setAuthDialog({
            title: "Đăng nhập không thành công",
            message:
              res?.message ||
              "Tài khoản hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.",
            tone: "error",
          });
          return;
        }

        setOtpOpen(false);
        setPendingAction(null);
        setAuthDialog({
          title: "Đăng nhập thành công",
          message:
            "Chào mừng bạn quay lại Mầm Mới! Đang chuyển tới bảng điều khiển.",
          tone: "success",
        });
        navigate("/");
      } else if (pendingAction.type === "register") {
        // Xác thực OTP cho đăng ký tài khoản
        const payload = pendingAction.payload || {};
        const contact =
          payload.contact ||
          payload.email ||
          payload.phone ||
          (otpTarget && otpTarget.value) ||
          "";

        if (verifyOtp && contact) {
          const res = await verifyOtp(contact, code);
          if (!res || res.success === false) {
            setOtpError(
              res?.message || "Mã OTP không chính xác hoặc đã hết hạn."
            );
            return;
          }
        }

        setOtpOpen(false);
        setPendingAction(null);
        setRegisterSuccess(true);
        setTab("login");
        setLoginResetToken((t) => t + 1);

        // ép popup mount lại từ đầu, tránh reuse state cũ (seconds = 0)
        setDialogId((id) => id + 1);
        setAuthDialog({
          title: "Tạo tài khoản thành công",
          message:
            "Bạn đã đăng ký và xác thực tài khoản thành công. Hãy đăng nhập để bắt đầu sử dụng Mầm Mới.",
          tone: "success",
          autoCloseSeconds: 3,
        });
      } else if (pendingAction.type === "reset") {
        // Lưu OTP + contact lại, chuyển sang bước đặt mật khẩu mới
        const payload = pendingAction.payload || {};
        const context = {
          contact:
            payload.contact ||
            payload.acct ||
            (otpTarget && otpTarget.value) ||
            "",
          mode:
            payload.mode ||
            (otpTarget && otpTarget.channel) ||
            "unknown",
          otpCode: code,
        };

        // Hiển thị thông báo thành công ngay tại popup OTP, delay 1.2s rồi chuyển
        setOtpSuccess(true);
        setOtpSuccessMessage(
          "Bạn đã xác minh OTP thành công. Đang chuyển sang bước đặt mật khẩu mới..."
        );

        setTimeout(() => {
          setOtpOpen(false);
          setPendingAction(null);
          setOtpSuccess(false);
          setOtpSuccessMessage("");
          setResetPwContext(context);
        }, 2200);
      }
    } catch (err) {
      setOtpError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleForgot = (acct, mode) => {
    setForgotContext({
      acct: acct || "",
      mode: mode || "unknown",
    });
  };

  const handleNewPasswordSubmit = async ({ newPassword, otpCode }) => {
    try {
      if (resetPassword && resetPwContext?.contact && otpCode) {
        const res = await resetPassword(
          resetPwContext.contact,
          otpCode,
          newPassword
        );
        if (!res || res.success === false) {
          setAuthDialog({
            title: "Đổi mật khẩu không thành công",
            message:
              res?.message ||
              "Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại mã OTP hoặc thử lại.",
            tone: "error",
          });
          return;
        }
      }

      setResetPwContext(null);
      setTab("login");

      // ép popup mount mới
      setDialogId((id) => id + 1);
      setAuthDialog({
        title: "Đổi mật khẩu thành công",
        message: "Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập lại.",
        tone: "success",
        autoCloseSeconds: 3,
      });
    } catch (err) {
      setAuthDialog({
        title: "Đổi mật khẩu không thành công",
        message: "Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại.",
        tone: "error",
      });
    }
  };

  const handleNewPasswordCancel = () => {
    setResetPwContext(null);
    setTab("login");
  };

  const isLoginTab = tab === "login";

  const headerTitle = isLoginTab
    ? "Chào mừng bạn quay lại 👋"
    : "Bắt đầu cùng Mầm Mới";

  const headerSubtitle = isLoginTab
    ? "Đăng nhập để tiếp tục chăm sóc vườn cây thông minh cùng Mầm Mới."
    : "Chỉ mất chưa tới 1 phút để tạo tài khoản mới và bắt đầu sử dụng.";

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900">
      <LivingBackground density={34} baseColor="#1F302F" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          {/* brand chip */}
          <div className="mb-5 flex justify-center">
            <div className="flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" />
              Mầm Mới • Luôn bảo mật dữ liệu của bạn
            </div>
          </div>

          {/* Card chính */}
          <Card className="w-full rounded-[32px] border border-emerald-900/10 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.65)] backdrop-blur-xl">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 inline-flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-100 text-xs font-semibold text-emerald-700 shadow-sm">
                      M
                    </div>
                    <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-600">
                      <Sparkles className="h-3 w-3" />
                      Mầm Mới • Luôn đồng hành cùng bạn
                    </p>
                  </div>
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    {headerTitle}
                  </CardTitle>
                  <p className="mt-1 text-xs text-slate-600">
                    {headerSubtitle}
                  </p>
                </div>
                <div className="hidden shrink-0 flex-col items-end text-[11px] text-slate-400 sm:flex">
                  <ShieldCheck className="mb-1 h-4 w-4 text-emerald-500" />
                  <span>Mọi dữ liệu luôn được bảo mật</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-1 pb-6">
              {registerSuccess && (
                <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                  <div className="flex gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4" />
                    <div>
                      <p className="text-sm font-semibold">
                        Đăng ký tài khoản thành công 🎉
                      </p>
                      <p className="mt-0.5">
                        Hãy đăng nhập lại bằng email/SĐT và mật khẩu
                        vừa tạo để chắc chắn bạn nhớ thông tin.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRegisterSuccess(false)}
                    className="mt-0.5 text-emerald-700/70 transition hover:text-emerald-900"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <Tabs
                value={tab}
                onValueChange={(v) => {
                  setTab(v);
                  setRegisterSuccess(false);
                }}
                className="w-full"
              >
                <TabsList
                  className="
                    mb-5 grid w-full grid-cols-2 rounded-full
                    border border-slate-200 bg-slate-100/90 p-1 text-sm shadow-inner
                  "
                >
                  <TabsTrigger
                    value="login"
                    className="
                      rounded-full border text-sm font-semibold
                      transition-all
                      data-[state=active]:border-emerald-500
                      data-[state=active]:bg-white
                      data-[state=active]:text-emerald-700
                      data-[state=active]:shadow-md
                      data-[state=inactive]:border-transparent
                      data-[state=inactive]:text-slate-500
                      data-[state=inactive]:opacity-80
                      hover:bg-white/80
                    "
                  >
                    Đăng nhập
                  </TabsTrigger>

                  <TabsTrigger
                    value="register"
                    className="
                      rounded-full border text-sm font-semibold
                      transition-all
                      data-[state=active]:border-emerald-500
                      data-[state=active]:bg-white
                      data-[state=active]:text-emerald-700
                      data-[state=active]:shadow-md
                      data-[state=inactive]:border-transparent
                      data-[state=inactive]:text-slate-500
                      data-[state=inactive]:opacity-80
                      hover:bg-white/80
                    "
                  >
                    Đăng ký
                  </TabsTrigger>
                </TabsList>

                {/* KHUNG CỐ ĐỊNH CHO CẢ 2 FORM */}
                <div className="mt-1 min-h-[560px]">
                  <AnimatePresence mode="wait">
                    {tab === "login" ? (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -16, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 16, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                      >
                        <LoginForm
                          resetToken={loginResetToken}
                          onForgot={handleForgot}
                          onSubmitLogin={handleLoginCredentials}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="register"
                        initial={{ opacity: 0, x: 16, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -16, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                      >
                        <RegisterForm
                          onSubmitRegister={handleRegisterCredentials}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quên mật khẩu */}
          <ForgotDialog
            open={!!forgotContext}
            initialAcct={forgotContext?.acct}
            initialMode={forgotContext?.mode}
            onClose={() => setForgotContext(null)}
            onSubmit={handleForgotSubmit}
          />

          {/* OTP (cho đăng ký + quên mật khẩu) */}
          <OtpDialog
            key={otpSession}
            open={otpOpen}
            onClose={handleOtpClose}
            onSubmit={handleVerifyOtp}
            onResend={handleOtpResend}
            loading={otpLoading}
            error={otpError}
            channel={otpTarget?.channel}
            contact={otpTarget?.value}
            actionType={pendingAction?.type}
            success={otpSuccess}
            successMessage={otpSuccessMessage}
          />

          {/* Mật khẩu mới (sau OTP quên mật khẩu) */}
          <ResetPasswordDialog
            open={!!resetPwContext}
            mode={resetPwContext?.mode}
            contact={resetPwContext?.contact}
            otpCode={resetPwContext?.otpCode}
            onClose={handleNewPasswordCancel}
            onSubmit={handleNewPasswordSubmit}
          />

          {/* Popup thông báo chung */}
          <AuthMessageDialog
            key={dialogId}
            open={!!authDialog}
            title={authDialog?.title}
            message={authDialog?.message}
            tone={authDialog?.tone}
            onClose={() => setAuthDialog(null)}
            autoCloseSeconds={authDialog?.autoCloseSeconds}
          />

          {/* Overlay animation sau khi đăng nhập thành công */}
          {loginSuccessOverlay && (
            <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
              <div className="pointer-events-auto flex items-center gap-3 rounded-3xl border border-emerald-200 bg-white/95 px-6 py-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Bạn đã đăng nhập thành công
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-600">
                    Đang chuyển vào hệ thống Mầm Mới...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ------------------------ LOGIN --------------------- */

function LoginForm({ onForgot, onSubmitLogin, resetToken }) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);

  const [acct, setAcct] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [acctError, setAcctError] = useState("");
  const [pwError, setPwError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const acctRef = useRef(null);
  const pwRef = useRef(null);

  useEffect(() => {
    // reset hoàn toàn sau khi đăng ký xong
    setAcct("");
    setPassword("");
    setRemember(false);
    setAcctError("");
    setPwError("");
    setFormError("");
  }, [resetToken]);

  const mode = useMemo(() => {
    if (!acct) return "unknown";
    const trimmed = acct.trim();
    if (trimmed.includes("@")) return "email";
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length >= 9 && trimmed[0] === "0") return "phone";
    return "unknown";
  }, [acct]);

  const handleAcctChange = (e) => {
    setAcct(e.target.value);
    setAcctError("");
  };

  const validateAcct = () => {
    const value = acct.trim();
    let message = "";

    if (!value) {
      message = "Vui lòng nhập email hoặc SĐT.";
    } else if (value.includes("@")) {
      if (!EMAIL_REGEX.test(value)) {
        message = "Email không đúng định dạng.";
      }
    } else if (/^\d+$/.test(value)) {
      const digits = value.replace(/\D/g, "");
      if (!/^0\d{9}$/.test(digits)) {
        message =
          "SĐT không hợp lệ (bắt đầu bằng số 0 và đủ 10 số).";
      }
    } else {
      message =
        "Định dạng không hợp lệ. Hãy nhập email có @ hoặc SĐT 10 số bắt đầu bằng 0.";
    }

    setAcctError(message);
    return !message;
  };

  const validatePw = () => {
    let message = "";
    if (!password) {
      message = "Vui lòng nhập mật khẩu.";
    }
    setPwError(message);
    return !message;
  };

  const submitForm = async () => {
    setFormError("");
    setSubmitting(true);
    try {
      await onSubmitLogin({
        acct: acct.trim(),
        password,
        remember,
        mode,
      });
    } catch (err) {
      setFormError("Không thể đăng nhập. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const okAcct = validateAcct();
    const okPw = validatePw();
    if (!okAcct || !okPw) return;
    await submitForm();
  };

  // ENTER trong từng ô
  const handleAcctKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const ok = validateAcct();
    if (ok) pwRef.current?.focus();
  };

  const handlePwKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    validatePw();
  };

  // mắt mật khẩu – giữ để xem
  const handlePwPressDown = (e) => {
    e.preventDefault();
    setShow(true);
  };
  const handlePwPressUp = () => setShow(false);

  const handleForgotClick = () => {
    onForgot && onForgot(acct, mode);
  };

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit}
      autoComplete="on"
    >
      <Field
        label="Email hoặc SĐT"
        icon={
          mode === "email" ? (
            <Mail className="h-4 w-4" />
          ) : mode === "phone" ? (
            <Phone className="h-4 w-4" />
          ) : (
            <UserRound className="h-4 w-4" />
          )
        }
        error={acctError}
      >
        <Input
          ref={acctRef}
          name="username"
          autoComplete="username"
          className={baseInputClass}
          inputMode="email"
          placeholder="ban@domain.com hoặc 09xxxxxxxx"
          value={acct}
          onChange={handleAcctChange}
          onKeyDown={handleAcctKeyDown}
          onBlur={validateAcct}
        />
      </Field>

      <Field
        label="Mật khẩu"
        icon={<LockKeyhole className="h-4 w-4" />}
        error={pwError}
      >
        <div className="relative flex items-center">
          <Input
            ref={pwRef}
            name="password"
            autoComplete="current-password"
            className={baseInputClass}
            type={show ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPwError("");
            }}
            onKeyUp={(e) =>
              setCaps(
                e.getModifierState &&
                  e.getModifierState("CapsLock")
              )
            }
            onKeyDown={handlePwKeyDown}
            onBlur={validatePw}
          />
          <button
            type="button"
            onMouseDown={handlePwPressDown}
            onMouseUp={handlePwPressUp}
            onMouseLeave={handlePwPressUp}
            onTouchStart={handlePwPressDown}
            onTouchEnd={handlePwPressUp}
            className="ml-2 text-neutral-500 transition hover:text-emerald-600"
            aria-label="Giữ để hiện mật khẩu"
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>

      {caps ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Cảnh báo: CapsLock đang bật.
        </div>
      ) : null}

      <div className="mt-1 flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs sm:text-sm">
          <Checkbox
            checked={remember}
            onCheckedChange={(v) => setRemember(Boolean(v))}
          />
          Ghi nhớ đăng nhập
        </label>

        <button
          type="button"
          onClick={handleForgotClick}
          className="
            inline-flex items-center gap-1
            rounded-full bg-emerald-50 px-3 py-1
            text-[13px] font-semibold text-emerald-700
            shadow-sm
            transition
            hover:bg-emerald-100 hover:text-emerald-900
          "
        >
          <LockKeyhole className="h-3.5 w-3.5" />
          Quên mật khẩu?
        </button>
      </div>

      {formError && (
        <p className="text-xs text-red-500">{formError}</p>
      )}

      <Button
        type="submit"
        className="
          mt-2 w-full gap-2 rounded-2xl
          h-11 sm:h-12
          bg-emerald-600 text-white text-[15px] font-semibold
          transition
          hover:bg-emerald-700 hover:-translate-y-[1px] hover:shadow-md
          disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none
        "
        disabled={submitting}
      >
        {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        <ArrowRight className="h-4 w-4" />
      </Button>

      <Divider text="hoặc" />

      <Button
        type="button"
        variant="outline"
        className="
          mt-2 w-full gap-2 rounded-2xl
          h-11 sm:h-12
          bg-white/90 text-[15px] font-medium
          transition
          hover:-translate-y-[1px] hover:bg-white hover:shadow-md
        "
      >
        <span className="text-lg">
          {/* Google icon SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="100"
            height="100"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
        </span>
        Tiếp tục với Google
      </Button>
    </form>
  );
}

/* ------------------------ REGISTER --------------------- */

function RegisterForm({ onSubmitRegister }) {
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneValue, setPhoneValue] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [contactRequiredError, setContactRequiredError] = useState("");
  const [pwError, setPwError] = useState("");
  const [pw2Error, setPw2Error] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const pwRef = useRef(null);
  const pw2Ref = useRef(null);

  const strength = useMemo(() => calcStrength(pw), [pw]);
  const mismatch = pw2 && pw2 !== pw;

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneValue(digits);
    if (!digits) {
      setPhoneError("");
    }
    setContactRequiredError("");
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!value) {
      setEmailError("");
    }
    setContactRequiredError("");
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (nameError) setNameError("");
  };

  const validateName = (force = false) => {
    const shouldValidate = force || submitted;
    if (!shouldValidate) return true;
    const v = name.trim();
    const msg = v ? "" : "Vui lòng nhập họ và tên.";
    setNameError(msg);
    return !msg;
  };

  const validateEmail = (force = false) => {
    const shouldValidate = force || submitted;
    if (!shouldValidate) return true;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("");
      return true;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Email không đúng định dạng.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePhone = (force = false) => {
    const shouldValidate = force || submitted;
    if (!shouldValidate) return true;
    const trimmedPhone = phoneValue.trim();
    if (!trimmedPhone) {
      setPhoneError("");
      return true;
    }
    const digits = trimmedPhone.replace(/\D/g, "");
    if (!/^0\d{9}$/.test(digits)) {
      setPhoneError(
        "SĐT không hợp lệ (bắt đầu bằng số 0 và đủ 10 số)."
      );
      return false;
    }
    setPhoneError("");
    return true;
  };

  const validatePw = (force = false) => {
    const shouldValidate = force || submitted;
    if (!shouldValidate) return true;
    let msg = "";
    if (!pw) msg = "Vui lòng nhập mật khẩu.";
    else if (pw.length < 8) msg = "Mật khẩu tối thiểu 8 ký tự.";
    setPwError(msg);
    return !msg;
  };

  const validatePw2 = (force = false) => {
    const shouldValidate = force || submitted;
    if (!shouldValidate) return true;
    let msg = "";
    if (!pw2) msg = "Vui lòng nhập lại mật khẩu.";
    else if (mismatch) msg = "Mật khẩu không khớp.";
    setPw2Error(msg);
    return !msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setContactRequiredError("");
    setSubmitted(true);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneValue.trim();

    const hasEmail = !!trimmedEmail;
    const hasPhone = !!trimmedPhone;

    let hasError = false;

    if (!validateName(true)) hasError = true;
    const emailOk = validateEmail(true);
    const phoneOk = validatePhone(true);
    if (!emailOk || !phoneOk) hasError = true;

    if (!hasEmail && !hasPhone) {
      setContactRequiredError(
        "Vui lòng nhập ít nhất email hoặc SĐT."
      );
      hasError = true;
    }

    if (!validatePw(true)) hasError = true;
    if (!validatePw2(true)) hasError = true;

    if (hasError) return;

    const mode = hasEmail ? "email" : "phone";
    const contact = mode === "email" ? trimmedEmail : trimmedPhone;

    try {
      setSubmitting(true);
      await onSubmitRegister({
        name: trimmedName,
        email: trimmedEmail || null,
        phone: trimmedPhone || null,
        password: pw,
        mode,
        contact,
      });
    } catch (err) {
      setFormError("Không thể gửi mã OTP. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // ENTER từng ô
  const handleNameKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    validateName(false);
    emailRef.current?.focus();
  };

  const handleEmailKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    validateEmail(false);
    phoneRef.current?.focus();
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    validatePhone(false);
    pwRef.current?.focus();
  };

  const handlePwKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    validatePw(false);
    pw2Ref.current?.focus();
  };

  const handlePw2KeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    validatePw2(false);
  };

  // mắt mật khẩu – giữ để xem
  const handlePwPressDown = (e) => {
    e.preventDefault();
    setShow(true);
  };
  const handlePwPressUp = () => setShow(false);

  const handlePw2PressDown = (e) => {
    e.preventDefault();
    setShow2(true);
  };
  const handlePw2PressUp = () => setShow2(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <Field
        label="Họ và tên"
        icon={<UserRound className="h-4 w-4" />}
        error={nameError}
      >
        <Input
          ref={nameRef}
          className={baseInputClass}
          placeholder="Tên của bạn"
          value={name}
          onChange={handleNameChange}
          onKeyDown={handleNameKeyDown}
          onBlur={() => validateName(false)}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Email (tuỳ chọn)"
          icon={<Mail className="h-4 w-4" />}
          error={emailError}
          isErrorBorder={
            !!contactRequiredError && !email && !phoneValue
          }
        >
          <Input
            ref={emailRef}
            className={baseInputClass}
            type="email"
            placeholder="Email của bạn"
            value={email}
            onChange={handleEmailChange}
            onKeyDown={handleEmailKeyDown}
            onBlur={() => validateEmail(false)}
          />
        </Field>

        <Field
          label="Số điện thoại (tuỳ chọn)"
          icon={<Phone className="h-4 w-4" />}
          error={phoneError}
          isErrorBorder={
            !!contactRequiredError && !email && !phoneValue
          }
        >
          <Input
            ref={phoneRef}
            className={baseInputClass}
            inputMode="tel"
            placeholder="Số điện thoại của bạn"
            value={phoneValue}
            onChange={handlePhoneChange}
            onKeyDown={handlePhoneKeyDown}
            onBlur={() => validatePhone(false)}
          />
        </Field>
      </div>

      {contactRequiredError && (
        <p className="mt-1 text-xs text-center text-red-500">
          {contactRequiredError}
        </p>
      )}

      <p className="mt-1 text-xs text-slate-500">
        * Bạn phải điền một trong hai: email hoặc số điện thoại.
      </p>

      <Field
        label="Mật khẩu"
        icon={<LockKeyhole className="h-4 w-4" />}
        error={pwError}
      >
        <div className="relative flex items-center">
          <Input
            ref={pwRef}
            className={baseInputClass}
            type={show ? "text" : "password"}
            placeholder="Tối thiểu 8 ký tự"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setPwError("");
            }}
            onKeyDown={handlePwKeyDown}
            onBlur={() => validatePw(false)}
          />
          <button
            type="button"
            onMouseDown={handlePwPressDown}
            onMouseUp={handlePwPressUp}
            onMouseLeave={handlePwPressUp}
            onTouchStart={handlePwPressDown}
            onTouchEnd={handlePwPressUp}
            className="ml-2 text-neutral-500 transition hover:text-emerald-600"
            aria-label="Giữ để hiện mật khẩu"
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <PasswordStrengthBar strength={strength} />
      </Field>

      <Field
        label="Nhập lại mật khẩu"
        icon={<LockKeyhole className="h-4 w-4" />}
        error={pw2Error}
      >
        <div className="relative flex items-center">
          <Input
            ref={pw2Ref}
            className={baseInputClass}
            type={show2 ? "text" : "password"}
            placeholder="nhập lại mật khẩu"
            value={pw2}
            onChange={(e) => {
              setPw2(e.target.value);
              setPw2Error("");
            }}
            onKeyDown={handlePw2KeyDown}
            onBlur={() => validatePw2(false)}
          />
          <button
            type="button"
            onMouseDown={handlePw2PressDown}
            onMouseUp={handlePw2PressUp}
            onMouseLeave={handlePw2PressUp}
            onTouchStart={handlePw2PressDown}
            onTouchEnd={handlePw2PressUp}
            className="ml-2 text-neutral-500 transition hover:text-emerald-600"
            aria-label="Giữ để hiện mật khẩu"
          >
            {show2 ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>

      {formError && (
        <p className="text-xs text-red-500">{formError}</p>
      )}

      <Button
        type="submit"
        className="
          mt-2 h-12 w-full gap-2 rounded-2xl
          bg-emerald-600 text-white text-[15px] font-semibold
          transition
          hover:bg-emerald-700 hover:-translate-y-[1px] hover:shadow-md
          disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none
        "
        disabled={submitting}
      >
        {submitting ? "Đang gửi mã OTP..." : "Tạo tài khoản"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

/* ------------------------ FORGOT PASSWORD --------------------- */

function ForgotDialog({
  open,
  initialAcct,
  initialMode,
  onClose,
  onSubmit,
}) {
  const [acct, setAcct] = useState(initialAcct || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setAcct(initialAcct || "");
      setError("");
    }
  }, [open, initialAcct]);

  const mode = useMemo(() => {
    if (!acct) return initialMode || "unknown";
    const trimmed = acct.trim();
    if (trimmed.includes("@")) return "email";
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length >= 9 && trimmed[0] === "0") return "phone";
    return "unknown";
  }, [acct, initialMode]);

  const handleAcctChange = (e) => {
    setAcct(e.target.value);
    setError("");
  };

  const validateAcct = () => {
    const value = acct.trim();
    if (!value) {
      setError("Vui lòng nhập email hoặc SĐT đăng ký tài khoản.");
      return false;
    }

    if (mode === "email") {
      if (!EMAIL_REGEX.test(value)) {
        setError("Email không đúng định dạng.");
        return false;
      }
    } else if (mode === "phone") {
      const digits = value.replace(/\D/g, "");
      if (!/^0\d{9}$/.test(digits)) {
        setError(
          "SĐT không hợp lệ (bắt đầu bằng số 0 và đủ 10 số)."
        );
        return false;
      }
    } else {
      setError(
        "Định dạng không hợp lệ. Hãy nhập email có @ hoặc SĐT 10 số bắt đầu bằng 0."
      );
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAcct()) return;
    onSubmit && onSubmit({ acct: acct.trim(), mode });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-emerald-700 px-5 py-3 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-100">
              Bảo mật &amp; mật khẩu
            </p>
            <p className="text-sm font-semibold">Quên mật khẩu</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-emerald-50/80 transition hover:bg-emerald-900/30 hover:text-white"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-b from-emerald-50/60 to-white px-6 pb-5 pt-4"
        >
          <p className="text-xs text-slate-500">
            Nhập{" "}
            <span className="font-semibold">email hoặc SĐT</span> bạn
            đã dùng để đăng ký. Chúng tôi sẽ gửi mã OTP để bạn đặt lại
            mật khẩu.
          </p>

          <div className="mt-4">
            <Field
              label="Email hoặc SĐT"
              icon={
                mode === "email" ? (
                  <Mail className="h-4 w-4" />
                ) : mode === "phone" ? (
                  <Phone className="h-4 w-4" />
                ) : (
                  <UserRound className="h-4 w-4" />
                )
              }
              error={error}
            >
              <Input
                className={baseInputClass}
                placeholder="ban@domain.com hoặc 09xxxxxxxx"
                value={acct}
                onChange={handleAcctChange}
                onBlur={validateAcct}
              />
            </Field>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-slate-200 px-4 text-xs transition hover:-translate-y-[1px] hover:shadow-md"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-2xl px-4 text-xs transition hover:-translate-y-[1px] hover:shadow-md"
            >
              Gửi mã OTP
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------ OTP DIALOG --------------------- */

function OtpDialog({
  open,
  onClose,
  onSubmit,
  onResend,
  loading,
  error,
  channel,
  contact,
  actionType,
  success,
  successMessage,
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(40);
  const [localError, setLocalError] = useState("");
  const inputsRef = useRef([]);
  const prevCodeRef = useRef("");

  useEffect(() => {
    if (open) {
      setDigits(["", "", "", "", "", ""]);
      setSecondsLeft(40);
      setLocalError("");
      prevCodeRef.current = "";
      if (inputsRef.current[0]) {
        inputsRef.current[0].focus();
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (secondsLeft <= 0) return;
    const id = setInterval(
      () => setSecondsLeft((s) => s - 1),
      1000
    );
    return () => clearInterval(id);
  }, [open, secondsLeft]);

  const code = digits.join("");
  const hasError = !success && Boolean(localError || error);

  useEffect(() => {
    if (!open) return;
    if (success) return;
    if (code.length !== 6) return;
    if (loading) return;
    if (prevCodeRef.current === code) return;

    prevCodeRef.current = code;
    setLocalError("");
    onSubmit && onSubmit(code);
  }, [code, open, loading, success, onSubmit]);

  const handleChange = (index, value) => {
    const v = value.replace(/\D/g, "");
    if (!v) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }
    const next = [...digits];
    next[index] = v[0];
    setDigits(next);
    if (index < 5 && v[0]) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!text) return;

    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i += 1) {
      next[i] = text[i];
    }
    setDigits(next);
    const lastIndex = Math.min(text.length - 1, 5);
    inputsRef.current[lastIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");
    if (code.length !== 6) {
      setLocalError("Vui lòng nhập đủ 6 số.");
      return;
    }
    onSubmit && onSubmit(code);
  };

  const handleResendClick = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(40);
    onResend && onResend();
  };

  if (!open) return null;

  const maskedContact = maskContact(contact, channel);
  const channelLabel = channel === "phone" ? "SĐT" : "email";
  const primaryTitle =
    actionType === "register"
      ? "Hoàn tất đăng ký"
      : actionType === "reset"
      ? "Hoàn tất xác minh"
      : "Hoàn tất đăng nhập";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-emerald-700 px-5 py-3 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-100">
              Bảo mật &amp; mật khẩu
            </p>
            <p className="text-sm font-semibold">
              Xác minh OTP qua {channelLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-emerald-50/80 transition hover:bg-emerald-900/30 hover:text-white"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-b from-emerald-50/70 to-white px-6 pb-6 pt-5"
        >
          <p className="text-xs text-slate-500">
            Đã gửi mã gồm{" "}
            <span className="font-semibold text-slate-800">
              6 chữ số
            </span>{" "}
            tới{" "}
            <span className="font-semibold text-slate-800">
              {maskedContact || channelLabel}
            </span>
            . Vui lòng nhập mã trong vòng 40 giây để{" "}
            {actionType === "register"
              ? "hoàn tất đăng ký."
              : actionType === "reset"
              ? "xác nhận yêu cầu của bạn."
              : "hoàn tất đăng nhập."}
          </p>

          <div className="mt-4 flex justify-between gap-2">
            {digits.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                className={`h-12 w-11 rounded-2xl border text-center text-lg font-semibold tracking-[0.3em] shadow-none focus-visible:ring-emerald-500 ${
                  hasError
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-slate-300 bg-slate-50 text-slate-800"
                }`}
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(index, e.target.value)
                }
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={success}
              />
            ))}
          </div>

          {success ? (
            <p className="mt-3 text-xs text-emerald-600">
              {successMessage ||
                "Bạn đã xác minh OTP thành công. Đang chuyển sang bước tiếp theo..."}
            </p>
          ) : (localError || error) ? (
            <p className="mt-3 text-xs text-red-500">
              {localError || error}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <div className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-600" />
              {secondsLeft > 0 ? (
                <span>
                  Gửi lại mã sau{" "}
                  <span className="font-semibold text-slate-800">
                    {secondsLeft}s
                  </span>
                </span>
              ) : (
                <span>Bạn có thể yêu cầu mã mới.</span>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleResendClick}
              disabled={secondsLeft > 0 || loading || success}
              className="rounded-full border-emerald-500 px-5 py-2 text-xs font-semibold text-emerald-700 transition hover:-translate-y-[1px] hover:shadow-md disabled:cursor-not-allowed disabled:border-emerald-200 disabled:text-emerald-300"
            >
              Nhận mã mới
            </Button>
          </div>

          <Button
            type="submit"
            className="mt-4 w-full gap-2 rounded-2xl transition hover:-translate-y-[1px] hover:shadow-md"
            disabled={loading || code.length !== 6 || success}
          >
            {loading ? "Đang xác minh..." : primaryTitle}
            <ShieldCheck className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------ RESET PASSWORD (NEW SCREEN) --------------------- */

function ResetPasswordDialog({
  open,
  mode,
  contact,
  otpCode,
  onClose,
  onSubmit,
}) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [errorPw, setErrorPw] = useState("");
  const [errorPw2, setErrorPw2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const pwRef = useRef(null);
  const pw2Ref = useRef(null);

  useEffect(() => {
    if (open) {
      setPw("");
      setPw2("");
      setErrorPw("");
      setErrorPw2("");
      setSubmitting(false);
      setSubmitted(false);
      if (pwRef.current) pwRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const masked = maskContact(
    contact,
    mode === "phone" ? "phone" : "email"
  );

  const validatePw = (force = false) => {
    const shouldValidate = force || submitted;
    if (!shouldValidate) return true;
    let msg = "";
    if (!pw) msg = "Vui lòng nhập mật khẩu mới.";
    else if (pw.length < 8) msg = "Mật khẩu tối thiểu 8 ký tự.";
    setErrorPw(msg);
    return !msg;
  };

  const validatePw2 = (force = false) => {
    const shouldValidate = force || submitted;
    if (!shouldValidate) return true;
    let msg = "";
    if (!pw2) msg = "Vui lòng nhập lại mật khẩu.";
    else if (pw2 !== pw) msg = "Mật khẩu không khớp.";
    setErrorPw2(msg);
    return !msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const ok1 = validatePw(true);
    const ok2 = validatePw2(true);
    if (!ok1 || !ok2) return;
    setSubmitting(true);
    try {
      await onSubmit && onSubmit({ newPassword: pw, otpCode });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose && onClose();
  };

  const handlePwPressDown = (e) => {
    e.preventDefault();
    setShow1(true);
  };
  const handlePwPressUp = () => setShow1(false);
  const handlePw2PressDown = (e) => {
    e.preventDefault();
    setShow2(true);
  };
  const handlePw2PressUp = () => setShow2(false);

  const channelLabel = mode === "phone" ? "SĐT" : "email";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-emerald-700 px-5 py-3 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-100">
              Bảo mật &amp; mật khẩu
            </p>
            <p className="text-sm font-semibold">Đặt mật khẩu mới</p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full p-1 text-emerald-50/80 transition hover:bg-emerald-900/30 hover:text-white"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-b from-emerald-50/70 to-white px-6 pb-5 pt-4"
        >
          <p className="text-xs text-slate-500">
            OTP đã được xác minh thành công cho {channelLabel}{" "}
            <span className="font-semibold text-slate-800">
              {masked}
            </span>
            . Vui lòng đặt{" "}
            <span className="font-semibold">mật khẩu mới</span>{" "}
            để bảo vệ tài khoản của bạn.
          </p>

          <div className="mt-4 space-y-3">
            <Field
              label="Mật khẩu mới"
              icon={<LockKeyhole className="h-4 w-4" />}
              error={errorPw}
            >
              <div className="relative flex items-center">
                <Input
                  ref={pwRef}
                  className={baseInputClass}
                  type={show1 ? "text" : "password"}
                  placeholder="Tối thiểu 8 ký tự"
                  value={pw}
                  onChange={(e) => {
                    setPw(e.target.value);
                    setErrorPw("");
                  }}
                  onBlur={() => validatePw(false)}
                />
                <button
                  type="button"
                  onMouseDown={handlePwPressDown}
                  onMouseUp={handlePwPressUp}
                  onMouseLeave={handlePwPressUp}
                  onTouchStart={handlePwPressDown}
                  onTouchEnd={handlePwPressUp}
                  className="ml-2 text-neutral-500 transition hover:text-emerald-600"
                  aria-label="Giữ để hiện mật khẩu"
                >
                  {show1 ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            <Field
              label="Xác nhận mật khẩu mới"
              icon={<LockKeyhole className="h-4 w-4" />}
              error={errorPw2}
            >
              <div className="relative flex items-center">
                <Input
                  ref={pw2Ref}
                  className={baseInputClass}
                  type={show2 ? "text" : "password"}
                  placeholder="Nhập lại giống mật khẩu mới"
                  value={pw2}
                  onChange={(e) => {
                    setPw2(e.target.value);
                    setErrorPw2("");
                  }}
                  onBlur={() => validatePw2(false)}
                />
                <button
                  type="button"
                  onMouseDown={handlePw2PressDown}
                  onMouseUp={handlePw2PressUp}
                  onMouseLeave={handlePw2PressUp}
                  onTouchStart={handlePw2PressDown}
                  onTouchEnd={handlePw2PressUp}
                  className="ml-2 text-neutral-500 transition hover:text-emerald-600"
                  aria-label="Giữ để hiện mật khẩu"
                >
                  {show2 ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="rounded-2xl border-slate-200 px-4 text-xs transition hover:-translate-y-[1px] hover:shadow-md"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="
                rounded-2xl px-5 py-2.5 text-sm font-semibold
                bg-emerald-600 text-white
                hover:bg-emerald-700 hover:-translate-y-[1px] hover:shadow-md
                disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none
              "
            >
              {submitting ? "Đang cập nhật..." : "Xác nhận"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------ FIELD & HELPERS --------------------- */

function Field({ label, icon, error, isErrorBorder, children }) {
  const hasBorderError = Boolean(error) || Boolean(isErrorBorder);

  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold text-neutral-700">
        {label}
      </Label>

      <div
        className={`
          relative flex items-center rounded-[999px] sm:rounded-2xl border-2 px-3.5 py-3
          transition-all
          focus-within:border-emerald-600
          focus-within:ring-2 focus-within:ring-emerald-200/70
          focus-within:bg-white
          focus-within:shadow-md
          ${
            hasBorderError
              ? "border-rose-500 bg-rose-50 shadow-sm"
              : "border-slate-300 bg-slate-50 shadow-sm"
          }
        `}
      >
        {icon && (
          <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-neutral-500">
            {icon}
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function PasswordStrengthBar({ strength }) {
  const label =
    strength.score >= 4
      ? "Rất mạnh"
      : strength.score === 3
      ? "Mạnh"
      : strength.score === 2
      ? "Vừa"
      : "Yếu";
  const pct = (strength.score / 4) * 100;

  return (
    <div className="mt-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background:
              strength.score >= 3
                ? "linear-gradient(90deg,#10b981,#22c55e)"
                : strength.score === 2
                ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                : "linear-gradient(90deg,#ef4444,#f87171)",
          }}
        />
      </div>
      <div className="mt-1 text-xs text-neutral-600">
        Độ mạnh: <span className="font-medium">{label}</span>
      </div>
    </div>
  );
}

function Divider({ text = "hoặc" }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-neutral-200" />
      <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
        {text}
      </span>
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

function AuthMessageDialog({
  open,
  title,
  message,
  tone = "error",
  onClose,
  autoCloseSeconds,
}) {
  const [seconds, setSeconds] = useState(autoCloseSeconds || null);
  const isSuccess = tone === "success";

  // reset lại khi mở popup mới
  useEffect(() => {
    if (open && autoCloseSeconds) {
      setSeconds(autoCloseSeconds);
    }
  }, [open, autoCloseSeconds]);

  // đếm ngược & tự đóng
  useEffect(() => {
    if (!open || !autoCloseSeconds) return;
    if (seconds === null) return;

    if (seconds <= 0) {
      onClose && onClose();
      return;
    }

    const id = setTimeout(() => {
      setSeconds((s) => (s === null ? null : s - 1));
    }, 1000);

    return () => clearTimeout(id);
  }, [open, autoCloseSeconds, seconds, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div
        className={`
          w-full overflow-hidden rounded-[28px] border shadow-2xl
          ${
            isSuccess
              ? "max-w-lg border-emerald-200 bg-emerald-50"
              : "max-w-sm border-rose-200 bg-rose-50"
          }
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5">
          <p
            className={`
              font-semibold
              ${
                isSuccess
                  ? "text-lg text-emerald-800"
                  : "text-sm text-rose-800"
              }
            `}
          >
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className={`
              rounded-full p-1.5 transition
              ${
                isSuccess
                  ? "text-emerald-700 hover:bg-emerald-100"
                  : "text-rose-700 hover:bg-rose-100"
              }
            `}
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* BODY */}
        <div
          className={`
            px-6 pb-5
            ${
              isSuccess
                ? "text-sm sm:text-base text-emerald-800"
                : "text-xs text-rose-700"
            }
          `}
        >
          <p>{message}</p>

          {autoCloseSeconds ? (
            <p className="mt-3 text-[11px] sm:text-xs text-slate-500">
              Sẽ trở về màn hình đăng nhập sau{" "}
              <span className="font-semibold text-emerald-700 animate-pulse">
                {seconds}s
              </span>
              .
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------ OTHER HELPERS --------------------- */

function calcStrength(pw) {
  let score = 0;
  if (!pw) return { score: 0 };
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 14 && score >= 3) score = 4;
  return { score: Math.min(score, 4) };
}

function maskContact(value, channel) {
  if (!value) return "";
  if (channel === "phone") {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 4) return digits;
    const start = digits.slice(0, 3);
    const end = digits.slice(-2);
    return `${start}***${end}`;
  }
  const parts = value.split("@");
  if (parts.length < 2) return value;
  const name = parts[0];
  const domain = parts.slice(1).join("@");
  const visible = name.slice(0, 3) || name;
  return `${visible}***@${domain}`;
}
