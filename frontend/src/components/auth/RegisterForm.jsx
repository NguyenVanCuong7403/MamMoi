import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  ArrowRight,
} from "lucide-react";
import AuthRepository from "../../API/repositories/AuthRepository";
import Field from "./Field";

export default function RegisterForm({ onSuccess }) {
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError("Bạn phải đồng ý với điều khoản sử dụng");
      setLoading(false);
      return;
    }

    try {
      const response = await AuthRepository.register(fullName, email, password);

      if (response.success) {
        setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
        // Clear form
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAgreeTerms(false);

        // Gọi callback nếu có
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } else {
        setError(response.message || "Đăng ký thất bại");
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
      {success && (
        <div className="text-green-600 text-sm bg-green-50 p-2 rounded border border-green-200">
          {success}
        </div>
      )}

      <Field label="Họ và tên" icon={<UserRound className="h-4 w-4" />}>
        <Input
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={loading}
          required
        />
      </Field>

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
            placeholder="Tối thiểu 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            minLength={8}
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

      <Field label="Nhập lại mật khẩu" icon={<LockKeyhole className="h-4 w-4" />}>
        <div className="relative">
          <Input
            type={show2 ? "text" : "password"}
            placeholder="Trùng với mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShow2((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
          >
            {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox
          checked={agreeTerms}
          onCheckedChange={setAgreeTerms}
          disabled={loading}
          required
        />
        Tôi đồng ý với Điều khoản sử dụng
      </label>

      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
