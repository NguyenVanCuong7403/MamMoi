import React, { useState } from "react";
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
  ArrowRight,
} from "lucide-react";

export default function AuthScreen() {
  const [showReset, setShowReset] = useState(false);
  const [tab, setTab] = useState("login");

  return (
    <div className="min-h-screen bg-[#f7faf7]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/85" />
        <img
          alt="hero"
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop"
          className="h-56 md:h-64 w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-6xl px-6 pt-32 md:pt-36 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 text-white px-3 py-1 text-xs border border-white/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              Tài khoản Mầm Mới
            </div>
            <h1 className="text-white text-3xl md:text-4xl font-semibold mt-3">
              Đăng nhập / Đăng ký
            </h1>
            <p className="text-white/90 mt-1">
              Truy cập dịch vụ hỗ trợ chăm sóc cây ăn quả cho nông hộ.
            </p>
          </div>
        </div>
      </section>

      {/* Auth card */}
      <section className="mx-auto max-w-6xl px-6 mt-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Tabs */}
          <Card className="rounded-2xl shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              {!showReset ? (
                <Tabs value={tab} onValueChange={(v) => setTab(v)} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                    <TabsTrigger value="register">Đăng ký</TabsTrigger>
                  </TabsList>

                  {/* Đăng nhập */}
                  <TabsContent value="login" className="mt-4">
                    <LoginForm onForgot={() => setShowReset(true)} />
                  </TabsContent>

                  {/* Đăng ký */}
                  <TabsContent value="register" className="mt-4">
                    <RegisterForm />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="w-full">
                  <div className="text-sm mb-3">
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

          {/* Right: Benefits / Copy */}
          <Card className="rounded-2xl border-dashed">
            <CardHeader>
              <CardTitle>Lợi ích khi tạo tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-neutral-700 grid gap-3">
              <li>Quản lý gói dịch vụ, hóa đơn và lịch sử giao dịch.</li>
              <li>Nhận cảnh báo sâu bệnh, thời tiết, lịch tưới bón theo vùng.</li>
              <li>Nhật ký vườn và báo cáo năng suất định kỳ.</li>
              <li>Hỗ trợ kỹ thuật nhanh từ đội ngũ chuyên gia.</li>
              <Separator className="my-2" />
              <div className="text-xs text-neutral-500">
                * Đây là giao diện demo (không gọi API). Bạn có thể nối vào back-end
                sau.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="bg-emerald-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm">
          <div className="font-semibold">Mầm Mới</div>
          <div className="opacity-80">
            Hỗ trợ chăm sóc cây ăn quả cho nông hộ Việt Nam.
          </div>
          <Separator className="my-4 bg-white/20" />
          <div className="opacity-70">
            © {new Date().getFullYear()} Mam Moi • Privacy • Terms
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------- */
/* ------------------------ SUB COMPONENTS --------------------- */
/* ------------------------------------------------------------- */

function LoginForm({ onForgot }) {
  const [show, setShow] = useState(false);

  return (
    <form className="grid gap-4">
      <Field label="Email" icon={<Mail className="h-4 w-4" />}>
        <Input type="email" placeholder="ban@domain.com" required />
      </Field>

      <Field label="Mật khẩu" icon={<LockKeyhole className="h-4 w-4" />}>
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

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

      <Button type="submit" className="w-full gap-2">
        Đăng nhập
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

function RegisterForm() {
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);

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
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <Field label="Nhập lại mật khẩu" icon={<LockKeyhole className="h-4 w-4" />}>
        <div className="relative">
          <Input
            type={show2 ? "text" : "password"}
            placeholder="Trùng với mật khẩu"
            required
          />
          <button
            type="button"
            onClick={() => setShow2((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
          >
            {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox required />
        Tôi đồng ý với Điều khoản sử dụng
      </label>

      <Button type="submit" className="w-full gap-2">
        Tạo tài khoản
        <ArrowRight className="h-4 w-4" />
      </Button>
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
        Chúng tôi sẽ gửi một đường link để đặt lại mật khẩu vào email của bạn.
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
