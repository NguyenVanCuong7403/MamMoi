import React, { useMemo, useState,useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

// Import animated background
import { LivingBackground } from "@/components/background";
import { useAuth } from "@/API/context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * AuthScreen — v3 (polished)
 * - Loại bỏ header/footer, tập trung toàn màn
 * - Nền animated gradient + blur blobs
 * - Card “glass” + panel bên phải nổi bật thương hiệu
 * - Trường đăng nhập: “Email hoặc SĐT” (tự nhận dạng icon)
 * - UX: CapsLock cảnh báo, password strength, divider, social buttons
 * - Giữ cấu trúc Tabs/Login/Register/Reset như bản gốc
 */
export default function AuthScreen({ defaultTab = "login" }) {
  const [showReset, setShowReset] = useState(false);
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
    setShowReset(false);
  }, [defaultTab]);


  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900">
      {/* Hiệu ứng nền động toàn cục */}
      <LivingBackground density={34} baseColor="#1F302F" />

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-10 md:py-14">
        {/* Top brand chip */}
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          <ShieldCheck className="h-3.5 w-3.5" />
          Mầm Mới • Tài khoản bảo mật
        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          {/* LEFT: Auth card */}
          <Card className="rounded-3xl border-white/20 bg-white/90 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Đăng nhập / Đăng ký</CardTitle>
            </CardHeader>
            <CardContent>
              {!showReset ? (
                <Tabs value={tab} onValueChange={(v) => setTab(v)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-xl bg-neutral-100/80">
                    <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                    <TabsTrigger value="register">Đăng ký</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="mt-5">
                    <LoginForm onForgot={() => setShowReset(true)} />
                  </TabsContent>

                  <TabsContent value="register" className="mt-5">
                    <RegisterForm />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="w-full">
                  <div className="mb-3 text-sm">
                    <button
                      type="button"
                      className="text-emerald-700 hover:underline"
                      onClick={() => {
                        setShowReset(false);
                        setTab("login");
                      }}
                    >
                      &larr; Quay lại đăng nhập
                    </button>
                  </div>
                  <ResetForm />
                </div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT: Visual / Brand panel */}
          <Card className="relative overflow-hidden rounded-3xl border-white/20 bg-white/5 p-0 backdrop-blur-xl">
            <div className="relative h-full">
              <PanelVisual />
              <div className="absolute inset-0 z-10 grid place-items-center p-8">
                <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 text-white shadow-2xl backdrop-blur">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs tracking-wide">
                      Trải nghiệm mượt mà cho nông hộ số
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold leading-snug">
                    Giao diện tài khoản hiện đại, nhất quán
                  </h2>
                  <p className="mt-2 text-white/80 text-sm leading-relaxed">
                    Quản lý vườn, lịch tưới bón, cảnh báo thời tiết & sâu bệnh.
                    Tất cả trong một tài khoản duy nhất.
                  </p>
                  <Separator className="my-4 bg-white/20" />
                  <ul className="space-y-2 text-sm text-white/90">
                    <li className="flex items-center gap-2">
                      <Bullet /> Đăng nhập nhanh bằng email hoặc SĐT
                    </li>
                    <li className="flex items-center gap-2">
                      <Bullet /> Bảo mật 2 lớp, tự động phát hiện CapsLock
                    </li>
                    <li className="flex items-center gap-2">
                      <Bullet /> Gợi ý độ mạnh mật khẩu theo thời gian thực
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

/* ------------------------ SUB COMPONENTS --------------------- */

function LoginForm({ onForgot }) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [acct, setAcct] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(form.email, form.password, remember);
    if (res.success) {
      navigate("/");
    } else {
      setError(res.message || "Đăng nhập thất bại");
    }
  };

  const mode = useMemo(() => {
    if (!acct) return "unknown";
    return acct.includes("@")
      ? "email"
      : acct.replace(/\D/g, "").length >= 9
      ? "phone"
      : "unknown";
  }, [acct]);

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
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
      >
        <Input
          inputMode="email"
          placeholder="ban@domain.com hoặc 09xxxxxxxx"
          value={acct}
          onChange={(e) => setAcct(e.target.value)}
          required
        />
      </Field>

      <Field label="Mật khẩu" icon={<LockKeyhole className="h-4 w-4" />}>
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            placeholder="••••••••"
            required
            onKeyUp={(e) =>
              setCaps(e.getModifierState && e.getModifierState("CapsLock"))
            }
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
            aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Cảnh báo: CapsLock đang bật.
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox />
          Ghi nhớ đăng nhập
        </label>
        <button
          type="button"
          onClick={onForgot}
          className="text-sm text-emerald-700 hover:underline"
        >
          Quên mật khẩu?
        </button>
      </div>

{error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập" }
        <ArrowRight className="h-4 w-4" />
      </Button>

      <Divider text="hoặc" />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button variant="outline" className="w-full bg-white">
          <span className="mr-2 text-lg">🟢</span> Tiếp tục với Google
        </Button>
        <Button variant="outline" className="w-full bg-white">
          <span className="mr-2 text-lg"></span> Tiếp tục với Apple
        </Button>
      </div>
    </form>
  );
}

function RegisterForm() {
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const strength = useMemo(() => calcStrength(pw), [pw]);
  const mismatch = pw2 && pw2 !== pw;

  return (
    <form className="grid gap-4">
      <Field label="Họ và tên" icon={<UserRound className="h-4 w-4" />}>
        <Input placeholder="Nguyễn Văn A" required />
      </Field>

      <Field label="Email" icon={<Mail className="h-4 w-4" />}>
        <Input type="email" placeholder="ban@domain.com" required />
      </Field>

      <Field label="Mật khẩu" icon={<LockKeyhole className="h-4 w-4" />}>
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            placeholder="Tối thiểu 8 ký tự"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
            aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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

      <Field label="Nhập lại mật khẩu" icon={<LockKeyhole className="h-4 w-4" />}>
        <div className="relative">
          <Input
            type={show2 ? "text" : "password"}
            placeholder="Trùng với mật khẩu"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShow2((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
            aria-label={show2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {show2 ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {mismatch ? (
          <div className="mt-1 text-xs text-rose-600">Mật khẩu không khớp.</div>
        ) : null}
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox required />
        Tôi đồng ý với Điều khoản sử dụng
      </label>

      <Button type="submit" className="w-full gap-2">
        Tạo tài khoản
        <ArrowRight className="h-4 w-4" />
      </Button>

      <div className="rounded-xl border bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
        Gợi ý: dùng &gt;= 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
      </div>
    </form>
  );
}

function ResetForm() {
  return (
    <form className="grid gap-4">
      <Field label="Email khôi phục" icon={<Mail className="h-4 w-4" />}>
        <Input type="email" placeholder="ban@domain.com" required />
      </Field>
      <div className="text-xs text-neutral-600">
        Chúng tôi sẽ gửi đường link đặt lại mật khẩu vào email của bạn.
      </div>
      <Button type="submit" className="w-full gap-2">
        Gửi yêu cầu
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-neutral-500">{label}</Label>
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 text-neutral-400">{icon}</div>}
        <div className={icon ? "w-full pl-9" : "w-full"}>{children}</div>
      </div>
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
    <div className="my-2 flex items-center gap-3">
      <div className="h-px flex-1 bg-neutral-200" />
      <span className="text-xs uppercase tracking-wider text-neutral-500">
        {text}
      </span>
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

/* ------------------------ VISUALS --------------------- */

function PanelVisual() {
  return (
    <>
      <img
        alt="cover"
        src="https://images.unsplash.com/photo-1523661149972-0f2f6e0f7f0f?q=80&w=1800&auto=format&fit=crop"
        className="h-[520px] w-full object-cover brightness-[0.75] contrast-110 saturate-110"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/60 via-emerald-900/70 to-[#1F302F]/90" />
      <div className="pointer-events-none absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/40 blur-3xl" />
    </>
  );
}

function Bullet() {
  return <div className="h-1.5 w-1.5 rounded-full bg-emerald-300" />;
}

/* ------------------------ HELPERS --------------------- */

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
