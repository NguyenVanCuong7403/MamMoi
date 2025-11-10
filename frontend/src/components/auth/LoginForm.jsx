import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, LockKeyhole, ArrowRight } from "lucide-react";
import AuthRepository from "../../API/repositories/AuthRepository";
import Field from "./Field";

export default function LoginForm({ onForgot, onSuccess }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await AuthRepository.login(email, password);
      
      if (response.success) {
        // Gọi callback khi đăng nhập thành công
        if (onSuccess) {
          onSuccess(response.data);
        } else {
          // Redirect về trang chủ
          window.location.href = "/";
        }
      } else {
        setError(response.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      <Field label="Email" icon={<Mail className="h-4 w-4" />}>
        <Input
          type="email"
          placeholder="ban@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </Field>

      <Field label="Mật khẩu" icon={<LockKeyhole className="h-4 w-4" />}>
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={rememberMe}
            onCheckedChange={setRememberMe}
            disabled={loading}
          />
          Ghi nhớ đăng nhập
        </label>
        <button
          type="button"
          onClick={onForgot}
          className="text-sm text-emerald-700 hover:underline"
          disabled={loading}
        >
          Quên mật khẩu?
        </button>
      </div>

      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
