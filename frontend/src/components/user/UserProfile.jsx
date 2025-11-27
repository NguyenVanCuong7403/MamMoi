import React, { useEffect, useMemo, useRef, useState } from "react";
import AddressPicker from "@/components/AddressPicker";


import {
  Shield,
  TreePine,
  Users,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Plus,
  Trash2,
  X,
  Upload,
  Link2,
  BadgeCheck,
  Eye,
  RefreshCcw,
  CheckCircle2,
  Check,
  Info,
  Copy,
  Search,
  Heart,
  List,
  Bell,
  LogOut,
  Grid,
  Lock,
  CreditCard,
  TrendingUp,
  Download,
  Calendar,
  ChevronDown,
  Clock,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import LivingBackground from "@/components/background/LivingBackground";
import PaymentHistory from "./PaymentHistory";
import AuthRepository from "@/API/repositories/AuthRepository";
import UserRepository from "@/API/repositories/UserRepository";
import PaymentRepository from "@/API/repositories/PaymentRepository";
import SubscriptionPlanRepository from "@/API/repositories/SubscriptionPlanRepository";
import { useAuth } from "@/API/context/AuthContext";
import { useNavigate } from "react-router-dom";

/* =========================================================
   Theme & helpers
========================================================= */
const BG = "#1F302F";
const CONTAINER = "mm-fluid-shell mx-auto w-full px-6 sm:px-8 lg:px-12 2xl:px-16";

const LS_PROFILE = "mm_user_profile_v3";
const LS_GARDENS = "mm_user_gardens_v3";
const LS_STAFFS = "mm_user_staffs_v3";
const LS_TREES = "mm_user_trees_v1";
const LS_DEMO_PW = "mm_demo_auth_pw";

const INPUT_OK = "h-14 w-full rounded-xl bg-white border border-neutral-300 placeholder:text-neutral-400 text-base focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500";
const INPUT_ERR = "h-14 w-full rounded-xl bg-white border border-rose-500 placeholder:text-neutral-400 text-base focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500";
const SELECT = "h-14 w-full rounded-2xl border bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500";
const BTN = {
  base: "rounded-2xl h-12 px-5 text-base",
  primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
  outline:
    "bg-white text-slate-900 border border-neutral-300 hover:bg-neutral-100",
};


/* ===== (THÊM MỚI, đặt ngay dưới const BTN) ===== */
const COMPACT = {
  select: "h-11 rounded-full border bg-white px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500",
  btn: "h-11 rounded-full px-5",
};


/* ===== trang trí nhẹ ===== */
function PageRails() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white/5 to-transparent blur-xl" />
      <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white/5 to-transparent blur-xl" />
    </div>
  );
}

/* =========================================================
   Default data (demo)
========================================================= */
const defaultProfile = {
  fullName: "Quân Nguyễn",
  email: "NHQ2374@gmail.com",
  phone: "0988284661",
  address: "Khu A, Thạch Hoà, Hòa Lạc, Hà Nội",
  avatarUrl: "",
  gender: "Không xác định",
};

const defaultGardens = [
  {
    name: "Vườn số 1 FPT",
    province: "Hà Nội",
    district: "Hòa Lạc",
    ward: "Thạch Hoà",
    address: "Khu A",
    status: "Đang hoạt động",
    coverUrl: "",
  },
  {
    name: "Vườn số 2 FPT",
    province: "Hà Nội",
    district: "Hòa Lạc",
    ward: "Phú Cát",
    address: "Khu B",
    status: "Đang hoạt động",
    coverUrl: "",
  },
  {
    name: "Vườn số 3 FPT",
    province: "Hòa Bình",
    district: "Kỳ Sơn",
    ward: "Dân Hạ",
    address: "Thửa 03",
    status: "Dừng hoạt động",
    coverUrl: "",
  },
];

const defaultStaffs = [
  {
    name: "Quân",
    email: "quan@gmail.vn",
    phone: "0988123456",
    role: "Staff",
    assigned: "Vườn số 1 FPT",
    avatarUrl: "",
    status: "active",
    createdAt: "2025-10-01",
  },
  {
    name: "Huy",
    email: "huy@gmail.vn",
    phone: "",
    role: "Staff",
    assigned: "Vườn số 2 FPT",
    avatarUrl: "",
    status: "active",
    createdAt: "2025-10-01",
  },
];

/* NEW: dữ liệu mẫu cây — theo AddTreeNewScreen */
const defaultTrees = [
  {
    code: "XC-01",
    speciesKey: "grapefruit",
    speciesLabel: "Bưởi",
    variety: "Da Xanh",
    gardenName: "Vườn số 1 FPT",
    status: "tốt",
    soil: "Đất phù sa",
    plantDate: "2024-06-01",
    preAge: 3,
    region: "Miền Bắc",
    phase: "Sinh trưởng thân lá",
    image: "",
  },
  {
    code: "XC-02",
    speciesKey: "grapefruit",
    speciesLabel: "Bưởi",
    variety: "Năm Roi",
    gardenName: "Vườn số 1 FPT",
    status: "ổn định",
    soil: "Đất thịt nhẹ",
    plantDate: "2024-08-20",
    preAge: 2,
    region: "Miền Bắc",
    phase: "Cây non",
    image: "",
  },
  {
    code: "SR-01",
    speciesKey: "durian",
    speciesLabel: "Sầu riêng",
    variety: "Ri6",
    gardenName: "Vườn số 2 FPT",
    status: "phát triển tốt",
    soil: "Đất đỏ bazan",
    plantDate: "2023-10-10",
    preAge: 6,
    region: "Miền Bắc",
    phase: "Sinh trưởng thân lá",
    image: "",
  },
];

/* =========================================================
   LocalStorage helpers
========================================================= */
function load(k, d) {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : d;
  } catch {
    return d;
  }
}
function save(k, v) {
  localStorage.setItem(k, JSON.stringify(v));
}

/* =========================================================
   Safe Image + Picker
========================================================= */
function normalizeImageUrl(raw = "") {
  if (!raw) return "";
  let u = String(raw).trim();
  if (u.startsWith("http://")) u = "https://" + u.slice(7);
  let m = u.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m && m[1]) u = `https://drive.google.com/uc?export=view&id=${m[1]}`;
  m = u.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (m && m[1]) u = `https://drive.google.com/uc?export=view&id=${m[1]}`;
  m = u.match(/drive\.google\.com\/uc\?(?:export=[^&]+&)?id=([^&]+)/);
  if (m && m[1]) u = `https://drive.google.com/uc?export=view&id=${m[1]}`;
  if (/dropbox\.com/.test(u)) {
    u = u
      .replace("www.dropbox.com", "dl.dropboxusercontent.com")
      .replace(/\?dl=0$/, "?dl=1");
  }
  return u;
}
function looksBlockedHost(u = "") {
  try {
    const h = new URL(u).hostname;
    return /(onedrive\.live\.com|sharepoint\.com|microsoft\.com)/i.test(h);
  } catch {
    return false;
  }
}
function SafeImage({ src, alt = "", className = "" }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setUrl(normalizeImageUrl(src || ""));
    setFailed(false);
    setTried(false);
  }, [src]);

  function onError() {
    if (tried) return setFailed(true);
    setTried(true);
    if (/drive\.google\.com\/uc\?/.test(url)) {
      setUrl(url.replace("export=view", "export=download"));
    } else setFailed(true);
  }

  if (!url || failed)
    return (
      <UserIcon className="h-6 w-6 text-neutral-400" aria-label="no-image" />
    );
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      onError={onError}
    />
  );
}

function ImagePicker({ value, onChange }) {
  const fileInputRef = useRef(null);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const objectUrl = URL.createObjectURL(f);
    onChange(objectUrl);
  }

  function handleImageClick() {
    fileInputRef.current?.click();
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <div 
        className="rounded-2xl overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleImageClick}
      >
        {value ? (
          <SafeImage
            src={value}
            alt="preview"
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-neutral-100 flex flex-col items-center justify-center text-neutral-400">
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm">Click để chọn ảnh</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   UI atoms
========================================================= */
function BadgeSoft({ children, color = "emerald" }) {
  const map = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    neutral: "bg-neutral-50 text-neutral-700 border-neutral-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${map[color]}`}
    >
      <BadgeCheck className="h-3 w-3" />
      {children}
    </span>
  );
}
function FieldLabel({ children, required, className = "" }) {
  return (
    <div className={`mb-1 text-sm text-neutral-600 ${className}`}>
      {children}
      {required ? <span className="text-rose-600"> *</span> : null}
    </div>
  );
}

function Segmented({ value, onChange, options = [] }) {
  return (
    <div className="inline-flex rounded-xl border border-neutral-300 bg-white p-0.5">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              "h-9 rounded-lg px-3 text-sm transition " +
              (active
                ? "bg-emerald-600 text-white shadow"
                : "text-neutral-700 hover:bg-neutral-50")
            }
            title={opt.title || ""}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder = "Tìm kiếm...", className = "" }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
      <Input
        type="search"
        inputMode="search"
        autoComplete="off"
        spellCheck={false}
        // giữ mặc định 320px, nhưng className truyền vào ở cuối sẽ override
        className={`h-12 w-[320px] rounded-2xl pl-9 pr-10 text-base ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-neutral-100"
          aria-label="Xoá tìm kiếm"
          title="Xoá tìm kiếm"
        >
          <X className="h-5 w-5 text-neutral-500" />
        </button>
      ) : null}
    </div>
  );
}

/* ===== Avatar Sync ===== */
function AvatarSync({ src, size = 80, title = "" }) {

  // Kiểm tra xem src có phải là URL hợp lệ không (không rỗng và có ít nhất một ký tự)
  const hasImg = src && typeof src === 'string' && src.trim().length > 0;
  const color = hasImg ? "bg-emerald-500" : "bg-amber-500";
  const badgeTitle = hasImg
    ? "Ảnh đã sẵn sàng đồng bộ"
    : "Chờ đồng bộ ảnh từ hồ sơ/đăng nhập bên thứ 3";
  return (
    <div
      className="relative rounded-full overflow-hidden ring-2 ring-white bg-neutral-100 grid place-items-center text-neutral-500"
      style={{ width: size, height: size }}
      title={title || badgeTitle}
      aria-label="Ảnh đại diện người dùng"
    >
      {hasImg ? (
        <SafeImage src={src} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <UserIcon className="h-7 w-7" />
      )}
      <div
        className={`absolute -bottom-0.5 -right-0.5 grid place-items-center h-5 w-5 rounded-full ${color} text-white ring-2 ring-white`}
        title={badgeTitle}
      >
        {hasImg ? (
          <Check className="h-3 w-3" />
        ) : (
          <Clock className="h-3 w-3" />
        )}
      </div>
    </div>
  );
}

/* ===== Avatar Picker (clickable avatar for upload) ===== */
function AvatarPicker({ src, size = 80, title = "", onChange, onFileSelect }) {
  const fileInputRef = useRef(null);
  const hasImg = !!src;
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    
    // Show preview immediately
    const objectUrl = URL.createObjectURL(f);
    if (onChange) onChange(objectUrl);
    
    // If onFileSelect callback is provided, call it with the file
    if (onFileSelect) {
      setUploading(true);
      try {
        await onFileSelect(f);
      } finally {
        setUploading(false);
      }
    }
  }

  function handleAvatarClick() {
    if (onChange && !uploading) {
      fileInputRef.current?.click();
    }
  }

  return (
    <div className="relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <div
        className={`relative rounded-full overflow-hidden ring-2 ring-white bg-neutral-100 grid place-items-center text-neutral-500 ${
          onChange && !uploading ? "cursor-pointer transition-all hover:ring-4 hover:ring-emerald-300" : ""
        } ${uploading ? "opacity-70" : ""}`}
        style={{ width: size, height: size }}
        title={uploading ? "Đang tải lên..." : (onChange ? (hasImg ? "Click để đổi ảnh" : "Click để chọn ảnh") : (title || "Ảnh đại diện"))}
        aria-label="Ảnh đại diện người dùng"
        onClick={handleAvatarClick}
      >
        {hasImg ? (
          <SafeImage src={src} alt="avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
        ) : (
          <UserIcon className="h-7 w-7" />
        )}
        {uploading ? (
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : onChange && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== NEW: Thumbnail vuông cho list vườn/nhân viên ===== */
function SquareThumb({ src, size = 72, fallback = "garden", title = "" }) {
  const FallbackIcon =
    fallback === "user" ? UserIcon : fallback === "garden" ? TreePine : Users;
  return (
    <div
      className="shrink-0 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 grid place-items-center text-neutral-400"
      style={{ width: size, height: size }}
      title={title}
      aria-label="thumbnail"
    >
      {src ? (
        <SafeImage src={src} alt={title || "thumb"} className="w-full h-full object-cover" />
      ) : (
        <FallbackIcon className="h-5 w-5" />
      )}
    </div>
  );
}

/* =========================================================
   Validators
========================================================= */
const reEmail = /^\S+@\S+\.\S+$/;
const reVNPhone = /^0(3|5|7|8|9)\d{8}$/; // 10 số VN bắt đầu 0
function validVNPhone(s = "") {
  const v = s.replace(/\s+/g, "");
  return reVNPhone.test(v);
}

/* =========================================================
   Modal xác nhận chung
========================================================= */
function ConfirmModal({ open, title, children, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1200] grid place-items-center">
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <button className="rounded p-1 hover:bg-neutral-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">{children}</div>
        <div className="mt-4 flex justify-end gap-2">
          <Button className={`${BTN.base} ${BTN.outline}`} onClick={onClose}>
            Huỷ
          </Button>
          <Button className={`${BTN.base} ${BTN.primary}`} onClick={onConfirm}>
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Password Modal (demo auth) + Quên MK
========================================================= */
/* =========================================================
   PasswordModal — v3 (UI hiện đại + OTP email)
   - 2 chế độ: "change" | "forgot"
   - Quên MK: OTP -> Đặt MK mới (2 bước) với email mặc định
   - Chỉ hiện "Đã gửi lúc..." sau khi thực sự gửi OTP
   - Cooldown gửi lại mã, OTP 6 số
========================================================= */
/* =========================================================
   PasswordModal — v3.1 (fix double-click, tabs rõ ràng)
========================================================= */
function PasswordModal({
  open,
  onClose,
  onChanged,
  currentPassword,
  defaultEmail = "",
  userName = "",
  initialTab = "change", // change | forgot
}) {
  // fallback helpers nếu tách file
  const callGenOTP =
    typeof genOTP === "function"
      ? genOTP
      : () => String(Math.floor(100000 + Math.random() * 900000));
  const callGenPassword =
    typeof genPassword === "function"
      ? genPassword
      : () => {
          const cs =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@$!%*?&";
          let s = "";
          for (let i = 0; i < 10; i++) s += cs[Math.floor(Math.random() * cs.length)];
          return s;
        };

  /* --------------- state --------------- */
  const [tab, setTab] = React.useState("forgot"); // forgot

  // Đổi mật khẩu
  const [cp, setCp] = React.useState("");
  const [np, setNp] = React.useState("");
  const [cf, setCf] = React.useState("");
  const [peek, setPeek] = React.useState(false);
  const [tC, setTC] = React.useState({ cp: false, np: false, cf: false });
  const [eC, setEC] = React.useState({ cp: "", np: "", cf: "" });
  const [isVerifying, setIsVerifying] = React.useState(false);
  const cpRef = React.useRef(null);
  const npRef = React.useRef(null);
  const cfRef = React.useRef(null);

  // Quên mật khẩu
  const [step, setStep] = React.useState("otp"); // otp | set
  const [fpEmail, setFpEmail] = React.useState(defaultEmail || "");
  const [emailErr, setEmailErr] = React.useState("");
  const emailLocked = !!defaultEmail;

  const [otp, setOtp] = React.useState("");
  const [otpCode, setOtpCode] = React.useState("");
  const [otpErr, setOtpErr] = React.useState("");
  const [sentAt, setSentAt] = React.useState(null);
  const [cooldown, setCooldown] = React.useState(0);

  const [np2, setNp2] = React.useState("");
  const [cf2, setCf2] = React.useState("");
  const [tS, setTS] = React.useState({ np: false, cf: false });
  const [eS, setES] = React.useState({ np: "", cf: "" });

  /* --------------- lifecycle --------------- */
  const blurActive = () => {
    const el = document.activeElement;
    if (el && typeof el.blur === "function") el.blur();
  };

  React.useEffect(() => {
    if (!open) return;
    // reset khi mở modal
    setTab(initialTab);
    setCp(""); setNp(""); setCf("");
    setTC({ cp: false, np: false, cf: false });
    setEC({ cp: "", np: "", cf: "" });
    setIsVerifying(false);

    setStep("otp");
    setFpEmail(defaultEmail || "");
    setEmailErr("");
    setOtp(""); setOtpCode(""); setOtpErr("");
    setSentAt(null); setCooldown(0);
    setNp2(""); setCf2("");
    setTS({ np: false, cf: false }); setES({ np: "", cf: "" });
  }, [open, defaultEmail, initialTab]);

  React.useEffect(() => {
    if (!open || cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [open, cooldown]);

  // Auto chuyển bước khi đủ 6 số & đúng mã
  React.useEffect(() => {
    if (!open || tab !== "forgot" || step !== "otp") return;
    if (otp.length < 6 || !otpCode) return;
    if (otp === otpCode) {
      setOtpErr("");
      setStep("set");
      if (!np2) setNp2(callGenPassword());
    } else {
      setOtpErr("Mã OTP không chính xác.");
    }
  }, [open, tab, step, otp, otpCode, np2]);


  /* --------------- actions --------------- */
  const validateChange = () => {
    if (!cp.trim()) {
      setTC((t) => ({ ...t, cp: true }));
      setEC((e) => ({ ...e, cp: "Vui lòng nhập mật khẩu hiện tại" }));
      cpRef.current?.focus();
      return false;
    }
    if (!np.trim()) {
      setTC((t) => ({ ...t, np: true }));
      setEC((e) => ({ ...e, np: "Vui lòng nhập mật khẩu mới" }));
      npRef.current?.focus();
      return false;
    }
    if (np.length < 8) {
      setTC((t) => ({ ...t, np: true }));
      setEC((e) => ({ ...e, np: "Mật khẩu mới tối thiểu 8 ký tự" }));
      npRef.current?.focus();
      return false;
    }
    if (np === cp) {
      setTC((t) => ({ ...t, np: true }));
      setEC((e) => ({ ...e, np: "Mật khẩu mới không được trùng mật khẩu cũ" }));
      npRef.current?.focus();
      return false;
    }
    if (!cf.trim()) {
      setTC((t) => ({ ...t, cf: true }));
      setEC((e) => ({ ...e, cf: "Vui lòng xác nhận mật khẩu mới" }));
      cfRef.current?.focus();
      return false;
    }
    if (cf !== np) {
      setTC((t) => ({ ...t, cf: true }));
      setEC((e) => ({ ...e, cf: "Xác nhận mật khẩu không khớp" }));
      cfRef.current?.focus();
      return false;
    }
    return true;
  };

  const submitChange = async () => {
    if (!validateChange()) return;

    // Gọi API để đổi mật khẩu (API sẽ verify mật khẩu hiện tại)
    setIsVerifying(true);
    try {
      const response = await AuthRepository.changePassword({
        currentPassword: cp,
        newPassword: np,
      });

      if (response.success) {
    onChanged?.(np);
    onClose?.();
      } else {
        // Nếu có lỗi về mật khẩu hiện tại không đúng
        const errorMessage = response.message || "";
        if (errorMessage.includes("không đúng") || errorMessage.includes("incorrect") || errorMessage.includes("Password hiện tại") || errorMessage.includes("Current password")) {
          setTC((t) => ({ ...t, cp: true }));
          setEC((e) => ({ ...e, cp: "Mật khẩu hiện tại không đúng" }));
          // Clear tất cả 3 field và bắt nhập lại
          setCp("");
          setNp("");
          setCf("");
          setTC({ cp: false, np: false, cf: false });
          setEC({ cp: "", np: "", cf: "" });
          cpRef.current?.focus();
        } else {
          setEC((e) => ({ ...e, np: errorMessage || "Đổi mật khẩu thất bại" }));
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "";
      if (errorMessage.includes("không đúng") || errorMessage.includes("incorrect") || errorMessage.includes("Password hiện tại") || errorMessage.includes("Current password")) {
        setTC((t) => ({ ...t, cp: true }));
        setEC((e) => ({ ...e, cp: "Mật khẩu hiện tại không đúng" }));
        // Clear tất cả 3 field và bắt nhập lại
        setCp("");
        setNp("");
        setCf("");
        setTC({ cp: false, np: false, cf: false });
        setEC({ cp: "", np: "", cf: "" });
        cpRef.current?.focus();
      } else {
        setEC((e) => ({ ...e, np: errorMessage || "Đổi mật khẩu thất bại" }));
      }
    } finally {
      setIsVerifying(false);
    }
  };

  function sendOTP() {
    if (cooldown > 0) return;
    const em = (fpEmail || "").trim();
    if (!reEmail.test(em)) {
      setEmailErr("Email không hợp lệ");
      return;
    }
    setEmailErr("");
    const code = callGenOTP();
    setOtpCode(code);
    setSentAt(new Date());
    setCooldown(40);
    setOtp(""); setOtpErr("");
    // TODO: Gửi 'code' tới email `em` từ backend
  }

  const validateSet = () => {
    if (!np2.trim()) {
      setTS((t) => ({ ...t, np: true }));
      setES((e) => ({ ...e, np: "Vui lòng nhập mật khẩu mới" }));
      return false;
    }
    if (np2.length < 8) {
      setTS((t) => ({ ...t, np: true }));
      setES((e) => ({ ...e, np: "Mật khẩu mới tối thiểu 8 ký tự" }));
      return false;
    }
    if (!cf2.trim()) {
      setTS((t) => ({ ...t, cf: true }));
      setES((e) => ({ ...e, cf: "Vui lòng xác nhận mật khẩu" }));
      return false;
    }
    if (cf2 !== np2) {
      setTS((t) => ({ ...t, cf: true }));
      setES((e) => ({ ...e, cf: "Xác nhận mật khẩu không khớp" }));
      return false;
    }
    return true;
  };
  const submitSet = () => {
    if (!validateSet()) return;
    onChanged?.(np2);
    onClose?.();
  };

  /* --------------- UI --------------- */
  const TabBtn = ({ active, children, onClick }) => (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={
        "h-9 rounded-full border px-4 text-sm transition " +
        (active
          ? "bg-white text-emerald-700 font-semibold shadow ring-1 ring-white/70"
          : "bg-white/10 text-white/90 border-white/20 hover:bg-white/15")
      }
      onClick={() => {
        blurActive();
        onClick();
      }}
    >
      {children}
    </button>
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1300] grid place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Bảo mật & mật khẩu</div>
              <div className="text-white/80 text-sm">
                Quên mật khẩu — xác minh OTP qua email
              </div>
            </div>
            <button className="rounded p-1 hover:bg-white/10" onClick={onClose} aria-label="Đóng">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
                                                                                  <div className="bg-white p-6">
          {tab === "forgot" && (
            <div className="space-y-4">
              {step === "otp" && (
                <>
                  <div>
                    <FieldLabel required>Email nhận OTP</FieldLabel>
                    <Input
                      type="email"
                      readOnly={emailLocked}
                      className={emailErr ? INPUT_ERR : INPUT_OK}
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      onBlur={() => {
                        const ok = reEmail.test((fpEmail || "").trim());
                        setEmailErr(ok ? "" : "Email không hợp lệ");
                      }}
                      placeholder="name@company.com"
                    />
                    {emailErr ? (
                      <p className="mt-1 text-xs text-rose-600">{emailErr}</p>
                    ) : (
                      <p className="mt-1 text-xs text-neutral-500">
                        {emailLocked
                          ? "Dùng email trong tài khoản."
                          : "Nhập email hợp lệ rồi bấm Nhận mã."}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border p-3">
                    <div className="mb-2 text-sm text-neutral-700">
                      {otpCode ? "Nhập 6 số trong email để tiếp tục." : "Chưa gửi OTP."}
                    </div>
                    <OTPInput6
                      disabled={!otpCode}
                      value={otp}
                      onChange={setOtp}
                      onComplete={(v) => setOtp(v)}
                    />
                    {otpCode && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                        <span>Đã gửi lúc: {sentAt ? sentAt.toLocaleTimeString() : "--:--:--"}</span>
                        <span className="mx-1">•</span>
                        <span>{cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Có thể gửi lại ngay."}</span>
                      </div>
                    )}
                    {otpErr ? <div className="mt-1 text-xs text-rose-600">{otpErr}</div> : null}
                  </div>

                  <div className="flex items-center justify-end">
                    <div className="flex gap-2">
                      <Button className={`${BTN.base} ${BTN.outline}`} onClick={onClose}>
                        Huỷ
                      </Button>
                      <Button
                        className={`${BTN.base} ${BTN.primary}`}
                        onClick={sendOTP}
                        disabled={cooldown > 0}
                        title={cooldown > 0 ? `Chờ ${cooldown}s để gửi lại` : undefined}
                      >
                        {!otpCode
                          ? "Nhận mã"
                          : cooldown > 0
                          ? `Gửi lại mã (${cooldown}s)`
                          : "Gửi lại mã OTP"}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {step === "set" && (
                <>
                  <div className="rounded-2xl border p-3 bg-emerald-50 border-emerald-200 text-emerald-800">
                    OTP hợp lệ. Hãy đặt <b>mật khẩu mới</b>.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <FieldLabel required>Mật khẩu mới</FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          autoComplete="new-password"
                          className={`${!tS.np ? INPUT_OK : eS.np ? INPUT_ERR : INPUT_OK} no-native-eye`}
                          value={np2}
                          onChange={(e) => setNp2(e.target.value)}
                          onBlur={() => setTS((t) => ({ ...t, np: true }))}
                          placeholder="Tối thiểu 8 ký tự"
                        />
                        <Button
                          type="button"
                          className={`${BTN.base} ${BTN.outline}`}
                          onClick={() => setNp2(callGenPassword())}
                        >
                          Gợi ý mạnh
                        </Button>
                      </div>
                      {tS.np && eS.np ? (
                        <p className="mt-1 text-xs text-rose-600">{eS.np}</p>
                      ) : null}
                    </div>

                    <div>
                      <FieldLabel required>Xác nhận mật khẩu</FieldLabel>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        className={`${!tS.cf ? INPUT_OK : eS.cf ? INPUT_ERR : INPUT_OK} no-native-eye`}
                        value={cf2}
                        onChange={(e) => setCf2(e.target.value)}
                        onBlur={() => setTS((t) => ({ ...t, cf: true }))}
                      />
                      {tS.cf && eS.cf ? (
                        <p className="mt-1 text-xs text-rose-600">{eS.cf}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      className="text-sm text-neutral-600 hover:underline"
                      onClick={() => setStep("otp")}
                    >
                      ← Quay lại bước OTP
                    </button>
                    <div className="flex gap-2">
                      <Button className={`${BTN.base} ${BTN.outline}`} onClick={onClose}>
                        Huỷ
                      </Button>
                      <Button className={`${BTN.base} ${BTN.primary}`} onClick={submitSet}>
                        Đặt mật khẩu mới
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   OTPInput6 — mượt, hỗ trợ paste, autocomplete one-time-code
========================================================= */
function OTPInput6({ value = "", onChange, onComplete, disabled = false }) {
  const [cells, setCells] = React.useState(
    () => Array.from({ length: 6 }, (_, i) => value[i] || "")
  );
  const refs = React.useRef([...Array(6)].map(() => React.createRef()));

  React.useEffect(() => {
    const v = (value || "").slice(0, 6);
    if (v === cells.join("")) return;
    setCells(Array.from({ length: 6 }, (_, i) => v[i] || ""));
  }, [value]); // giữ đồng bộ bên ngoài

  const emit = (arr) => {
    const v = arr.join("");
    onChange?.(v);
    if (v.length === 6) onComplete?.(v);
  };

  const setAt = (i, char) => {
    const arr = [...cells];
    arr[i] = char;
    setCells(arr);
    emit(arr);
  };

  const handleChange = (i, e) => {
    const v = (e.target.value || "").replace(/\D/g, "");
    if (!v) return setAt(i, "");
    if (v.length > 1) return pasteFrom(i, v);
    setAt(i, v);
    if (i < 5) refs.current[i + 1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !cells[i] && i > 0) refs.current[i - 1].current?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1].current?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1].current?.focus();
  };

  const pasteFrom = (i, text) => {
    const digits = String(text).replace(/\D/g, "").slice(0, 6 - i);
    if (!digits) return;
    const arr = [...cells];
    for (let k = 0; k < digits.length; k++) arr[i + k] = digits[k];
    setCells(arr);
    emit(arr);
    const next = Math.min(i + digits.length, 5);
    refs.current[next].current?.focus();
  };

  const handlePaste = (i, e) => {
    const t = e.clipboardData?.getData("text") || "";
    const digits = t.replace(/\D/g, "");
    if (!digits) return;
    e.preventDefault();
    pasteFrom(i, digits);
  };

  return (
    <div className="flex gap-2">
      {cells.map((c, i) => (
        <input
          key={i}
          ref={refs.current[i]}
          disabled={disabled}
          inputMode="numeric"
          pattern="\d*"
          autoComplete="one-time-code"
          maxLength={1}
          className={
            "h-12 w-10 rounded-xl border text-center text-lg " +
            (disabled
              ? "bg-neutral-100 border-neutral-200"
              : "bg-white border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30")
          }
          value={c}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
        />
      ))}
    </div>
  );
}




/* =========================================================
   NEW: OTP Modal (xác minh trước khi cho sửa Email/SĐT)
   (đã xoá note demo hiển thị)
========================================================= */
function OTPModal({ open, target, sendTo, onClose, onVerified }) {
  const [otp, setOtp] = useState("");
  const [code, setCode] = useState("");         // chưa sinh cho đến khi bấm "Nhận mã"
  const [err, setErr] = useState("");
  const [sentAt, setSentAt] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const sent = !!sentAt;

  useEffect(() => {
    if (open) {
      setOtp("");
      setCode("");
      setErr("");
      setSentAt(null);
      setCooldown(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open || cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [open, cooldown]);

  useEffect(() => {
    if (!open || !sent) return;
    if (otp.length < 6) {
      if (err) setErr("");
      return;
    }
    if (otp === code) {
      onVerified?.();
      onClose?.();
    } else {
      setErr("Mã OTP không chính xác.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, code, sent, open]);

  const title =
    target === "email"
      ? "Xác minh OTP để đổi Email"
      : "Xác minh OTP để đổi SĐT";

  const handleSend = () => {
    if (cooldown > 0) return;
    const c = genOTP();
    setCode(c);
    setSentAt(new Date());
    setCooldown(40);
    // TODO: gọi API backend để gửi 'c' tới email/SMS.
  };

  const handleChange = (v) => {
    const digits = (v || "").replace(/\D/g, "").slice(0, 6);
    setOtp(digits);
    if (err && digits.length < 6) setErr("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1320] grid place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-6">
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-white/80 text-sm mt-1">
            {sent ? (
              <>Đã gửi mã OTP tới: <b>{sendTo}</b></>
            ) : (
              <>Nhấn <b>Nhận mã</b> để gửi OTP tới: <b>{sendTo}</b></>
            )}
          </div>
        </div>

        <div className="bg-white p-6">
          <div className="text-sm text-neutral-700">
            {sent ? "Nhập 6 số trong email để tiếp tục." : "Chưa gửi mã OTP."}
          </div>

          <div className="mt-3">
            <Input
              inputMode="numeric"
              pattern="\d*"
              disabled={!sent}
              placeholder="••••••"
              className={err ? INPUT_ERR : INPUT_OK}
              value={otp}
              onChange={(e) => handleChange(e.target.value)}
            />
            {sent && (
              <div className="mt-1 text-xs text-neutral-500">
                Gửi lúc: {sentAt ? sentAt.toLocaleTimeString() : "--:--:--"}
              </div>
            )}
            {err ? <div className="mt-1 text-xs text-rose-600">{err}</div> : null}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button className={`${BTN.base} ${BTN.outline}`} onClick={onClose}>
              Huỷ
            </Button>

            <Button
              className={`${BTN.base} ${BTN.primary}`}
              onClick={handleSend}
              disabled={cooldown > 0}
              title={cooldown > 0 ? `Chờ ${cooldown}s để gửi lại` : undefined}
            >
              {!sent
                ? "Nhận mã"
                : cooldown > 0
                ? `Gửi lại mã (${cooldown}s)`
                : "Gửi lại mã"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ErrorBoundary – chặn trắng màn nếu form gặp runtime error
========================================================= */
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError:false }; }
  static getDerivedStateFromError(){ return { hasError:true }; }
  componentDidCatch(err, info){ console.error("EditTree crashed:", err, info); }
  render(){
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[1400] grid place-items-center">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative max-w-md w-full rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-lg font-semibold text-rose-700 mb-2">Có lỗi khi hiển thị form sửa cây</div>
            <div className="text-sm text-neutral-700">Đừng lo, dữ liệu của bạn vẫn an toàn. Đóng hộp thoại này và thử lại.</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* =========================================================
   Garden Detail Modal
========================================================= */
function GardenDetailModal({
  open,
  garden,
  staffs,
  trees,
  onClose,
  onRefresh,
  formatGardenLocation,
  onEditTree,
}) {
  if (!open || !garden) return null;

  const managers = (staffs || []).filter((s) => s.assigned === garden.name);
  const gardenTrees = (trees || []).filter(
    (t) => t.gardenName === garden.name
  );

  return (
    <div
      className="fixed inset-0 z-[1250] grid place-items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">
            Chi tiết vườn —{" "}
            <span className="text-emerald-700">{garden.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className={`${BTN.base} ${BTN.outline} h-11 px-5`}
              onClick={onRefresh}
              title="Tải lại danh sách cây (đồng bộ với LocalStorage)"
            >
              <RefreshCcw className="h-5 w-5 mr-1" />
              Tải lại
            </Button>
            <button className="rounded p-1 hover:bg-neutral-100" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-2xl border p-3 mb-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-700">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {formatGardenLocation(garden)}
            </span>
            <BadgeSoft
              color={garden.status === "Đang hoạt động" ? "emerald" : "rose"}
            >
              {garden.status}
            </BadgeSoft>
          </div>
          {garden.coverUrl ? (
            <div className="mt-3 rounded-xl overflow-hidden border">
              <SafeImage
                src={garden.coverUrl}
                className="w-full h-44 object-cover"
              />
            </div>
          ) : null}
        </div>

        {/* Managers */}
        <div className="mb-4">
          <div className="text-base font-semibold mb-2">Nhân viên quản lý</div>
          {managers.length ? (
            <div className="space-y-2">
              {managers.map((m, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-3 flex items-center gap-3"
                >
                  <div className="shrink-0">
                    <AvatarSync src={m.avatarUrl} size={40} title={m.name} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-neutral-900 truncate">
                      {m.name}
                    </div>
                    <div className="text-sm text-neutral-600 flex flex-wrap gap-3">
                      {m.email ? <span>Email: {m.email}</span> : null}
                      {m.phone ? <span>SĐT: {m.phone}</span> : null}
                      <BadgeSoft color="emerald">active</BadgeSoft>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border p-3 text-sm text-neutral-600">
              Chưa có nhân viên nào được phân công cho vườn này.
            </div>
          )}
        </div>

        {/* Trees */}
        <div>
          <div className="text-base font-semibold mb-2">
            Cây trong vườn{" "}
            <span className="text-neutral-500">({gardenTrees.length})</span>
          </div>
          {gardenTrees.length ? (
            <div className="space-y-2">
              {gardenTrees.map((t, idx) => (
                <div key={idx} className="rounded-2xl border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-neutral-900 truncate">
                        {(t.speciesLabel || "—") +
                          " — " +
                          (t.variety || "—") +
                          " — " +
                          (t.code || "—")}
                      </div>
                      <div className="mt-1 text-sm text-neutral-600 flex flex-wrap gap-3">
                        <span>
                          Mã: <b>{t.code || "—"}</b>
                        </span>
                        {t.status ? <span>Tình trạng: {t.status}</span> : null}
                        {t.phase ? (
                          <span className="inline-flex items-center gap-1">
                            <TreePine className="h-4 w-4 text-emerald-600" />{" "}
                            {t.phase}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {t.image ? (
                      <div className="shrink-0 rounded-lg overflow-hidden border">
                        <SafeImage
                          src={t.image}
                          className="w-24 h-16 object-cover"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border p-3 text-sm text-neutral-600">
              Chưa có cây nào được ghi nhận tại vườn này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Toast (nhẹ)
========================================================= */
function Toast({ open, title, desc, variant = "success", onClose }) {
  if (!open) return null;
  const color =
    variant === "success"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : "text-amber-700 bg-amber-50 border-amber-200";

  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-5 z-[1400]">
      <div
        className={`flex items-start gap-3 rounded-2xl border p-3 shadow-xl ${color} w-[320px]`}
      >
        {variant === "success" ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Info className="h-5 w-5" />
        )}
        <div className="min-w-0">
          <div className="font-semibold truncate">{title}</div>
          {desc ? <div className="text-sm opacity-90 truncate">{desc}</div> : null}
        </div>
        <button
          className="ml-auto rounded-md p-1 hover:bg-black/5"
          onClick={onClose}
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   Edit Garden / Edit Staff Modals
========================================================= */
function EditGardenModal({
  open,
  initial,
  SELECT,
  INPUT_OK,
  INPUT_ERR,
  onClose,
  onSubmit,
}) {
  const blank = {
    name: "",
    province: "",
    district: "",
    ward: "",
    address: "",
    status: "Đang hoạt động",
    coverUrl: "",
  };
  const [form, setForm] = useState(initial || blank);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial || blank);
      setTouched({});
    }
  }, [open, initial]);

  if (!open) return null;

  const errs = {
    name: !form.name.trim() ? "Tên vườn là bắt buộc" : "",
    province: !form.province.trim() ? "Nhập Tỉnh/Thành phố" : "",
    
    ward: !form.ward.trim() ? "Nhập Phường/Xã" : "",
    address: !form.address.trim() ? "Nhập địa chỉ chi tiết" : "",
  };
  const canSave =
    !errs.name &&
    !errs.province &&
    
    !errs.ward &&
    !errs.address;

  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-lg font-semibold">Sửa thông tin vườn</div>

        <div className="space-y-3 text-sm">
          <div>
            <FieldLabel required>Tên vườn</FieldLabel>
            <Input
              className={!touched.name ? INPUT_OK : errs.name ? INPUT_ERR : INPUT_OK}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            />
            {touched.name && errs.name && (
              <p className="mt-1 text-xs text-rose-600">{errs.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
   <div>
     <FieldLabel required>Tỉnh / Thành phố</FieldLabel>
     <Input
       className={!touched.province ? INPUT_OK : errs.province ? INPUT_ERR : INPUT_OK}
       value={form.province}
       onChange={(e) => setForm({ ...form, province: e.target.value })}
       onBlur={() => setTouched((t) => ({ ...t, province: true }))}
     />
     {touched.province && errs.province && (
       <p className="mt-1 text-xs text-rose-600">{errs.province}</p>
     )}
   </div>
   <div>
     <FieldLabel required>Phường / Xã</FieldLabel>
     <Input
       className={!touched.ward ? INPUT_OK : errs.ward ? INPUT_ERR : INPUT_OK}
       value={form.ward}
       onChange={(e) => setForm({ ...form, ward: e.target.value })}
       onBlur={() => setTouched((t) => ({ ...t, ward: true }))}
     />
     {touched.ward && errs.ward && (
       <p className="mt-1 text-xs text-rose-600">{errs.ward}</p>
     )}
   </div>
</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Phường / Xã</FieldLabel>
              <Input
                className={!touched.ward ? INPUT_OK : errs.ward ? INPUT_ERR : INPUT_OK}
                value={form.ward}
                onChange={(e) => setForm({ ...form, ward: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, ward: true }))}
              />
              {touched.ward && errs.ward && (
                <p className="mt-1 text-xs text-rose-600">{errs.ward}</p>
              )}
            </div>
            <div>
              <FieldLabel required>Địa chỉ chi tiết</FieldLabel>
              <Input
                className={!touched.address ? INPUT_OK : errs.address ? INPUT_ERR : INPUT_OK}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, address: true }))}
              />
              {touched.address && errs.address && (
                <p className="mt-1 text-xs text-rose-600">{errs.address}</p>
              )}
            </div>
          </div>

          <div>
            <FieldLabel>Trạng thái</FieldLabel>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={SELECT}
            >
              <option>Đang hoạt động</option>
              <option>Dừng hoạt động</option>
            </select>
          </div>

          <div>
            <FieldLabel>Ảnh vườn</FieldLabel>
            <ImagePicker
              value={form.coverUrl}
              onChange={(v) => setForm({ ...form, coverUrl: v })}
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button
              className="rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 text-slate-900"
              onClick={onClose}
            >
              Huỷ
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!canSave}
              onClick={() => canSave && onSubmit(form)}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditStaffModal({
  open,
  initial,
  SELECT,
  INPUT_OK,
  INPUT_ERR,
  onClose,
  onSubmit,
}) {
  const blank = {
    name: "",
    email: "",
    phone: "",
    assigned: "",
    role: "Staff",
    avatarUrl: "",
    status: "active",
  };
  const [form, setForm] = useState(initial || blank);
  const [touched, setTouched] = useState({});
  const originalAvatar = initial?.avatarUrl || "";

  useEffect(() => {
    if (open) {
      setForm(initial || blank);
      setTouched({});
    }
  }, [open, initial]);

  if (!open) return null;

  const contactErr =
    !form.email.trim() && !form.phone.trim()
      ? "Cần ít nhất Email hoặc SĐT"
      : form.email && !reEmail.test(form.email)
      ? "Email không hợp lệ"
      : form.phone && !validVNPhone(form.phone)
      ? "SĐT Việt Nam không hợp lệ"
      : "";

  const errs = {
    name: !form.name.trim() ? "Họ tên là bắt buộc" : "",
    contact: contactErr,
  };
  const canSave = !errs.name && !errs.contact;

  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-lg font-semibold">Sửa thông tin nhân viên</div>

        <div className="space-y-3 text-sm">
          <div>
            <FieldLabel required>Họ tên</FieldLabel>
            <Input
              className={!touched.name ? INPUT_OK : errs.name ? INPUT_ERR : INPUT_OK}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            />
            {touched.name && errs.name && (
              <p className="mt-1 text-xs text-rose-600">{errs.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Email (ít nhất 1 trong 2: Email/SĐT)</FieldLabel>
              <Input
                type="email"
                className={!touched.contact ? INPUT_OK : errs.contact ? INPUT_ERR : INPUT_OK}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, contact: true }))}
                placeholder="name@company.com"
              />
            </div>
            <div>
              <FieldLabel>Số điện thoại</FieldLabel>
              <Input
                type="tel"
                inputMode="numeric"
                pattern="\d*"
                className={!touched.contact ? INPUT_OK : errs.contact ? INPUT_ERR : INPUT_OK}
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                }
                onBlur={() => setTouched((t) => ({ ...t, contact: true }))}
                placeholder="0xxxxxxxxx"
              />
              {touched.contact && errs.contact && (
                <p className="mt-1 text-xs text-rose-600">{errs.contact}</p>
              )}
            </div>
          </div>

          <div>
            <FieldLabel>Ảnh nhân viên</FieldLabel>
            <div className="space-y-2">
              <ImagePicker
                value={form.avatarUrl}
                onChange={(v) => setForm({ ...form, avatarUrl: v })}
              />
              {originalAvatar ? (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    className={`${BTN.base} ${BTN.outline}`}
                    onClick={() =>
                      setForm((f) => ({ ...f, avatarUrl: originalAvatar }))
                    }
                  >
                    Khôi phục ảnh cũ
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button
              className="rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 text-slate-900"
              onClick={onClose}
            >
              Huỷ
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!canSave}
              onClick={() => canSave && onSubmit(form)}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Assign Staff Modal — chọn vườn & xác nhận
========================================================= */
function AssignStaffModal({ open, staff, gardens = [], onClose, onConfirm }) {
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (open) setSelected(staff?.assigned || "");
  }, [open, staff]);

  if (!open || !staff) return null;

  return (
    <div className="fixed inset-0 z-[1205] grid place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">Phân công nhân viên</div>
          <button className="rounded p-1 hover:bg-neutral-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-neutral-700">
            Chọn <b>vườn</b> để phân công cho nhân viên: <b>{staff.name}</b>
          </div>

          <div className="rounded-xl border p-3 max-h-64 overflow-auto">
            {gardens.length ? (
              <ul className="space-y-2">
                {gardens.map((g, i) => (
                  <li key={i}>
                    <label className="flex items-center gap-3 rounded-lg border px-3 py-2 hover:bg-neutral-50">
                      <input
                        type="radio"
                        name="assign-garden"
                        className="h-4 w-4"
                        checked={selected === g.name}
                        onChange={() => setSelected(g.name)}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-neutral-900 truncate">
                          {g.name}
                        </div>
                        <div className="text-xs text-neutral-600">
                          {[g.address, g.ward, g.district, g.province].filter(Boolean).join(", ")}
                        </div>
                      </div>
                      <BadgeSoft
                        color={g.status === "Đang hoạt động" ? "emerald" : "rose"}
                      >
                        {g.status}
                      </BadgeSoft>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-neutral-600">Chưa có vườn nào.</div>
            )}
          </div>

          {selected ? (
            <div className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800 border p-3 text-sm">
              Bạn đang phân công <b>Nhân viên {staff.name}</b> quản lý{" "}
              <b>Vườn {selected}</b>.
            </div>
          ) : null}

          <div className="mt-2 flex justify-end gap-2">
            <Button className={`${BTN.base} ${BTN.outline}`} onClick={onClose}>
              Huỷ
            </Button>
            <Button
              className={`${BTN.base} ${BTN.primary}`}
              disabled={!selected}
              onClick={() => onConfirm?.(selected)}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Reset Staff Password Modal — Y/C: 1 ô text, luôn hiện ký tự
========================================================= */
function ResetStaffPwModal({ open, staff, onClose, onConfirmed }) {
  const [npw, setNpw] = useState("");
  const [touched, setTouched] = useState(false);
  const [donePw, setDonePw] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setNpw("");
      setTouched(false);
      setDonePw("");
      setCopied(false);
    }
  }, [open]);

  if (!open || !staff) return null;

  const err =
    !npw.trim() ? "Vui lòng nhập mật khẩu mới" :
    npw.trim().length < 8 ? "Mật khẩu tối thiểu 8 ký tự" : "";

  const handleSubmit = () => {
    setTouched(true);
    if (err) return;
    onConfirmed?.(npw);
    setDonePw(npw);
  };

  const copyPw = async () => {
    try {
      await navigator.clipboard.writeText(donePw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Sao chép mật khẩu:", donePw);
    }
  };

  return (
    <div className="fixed inset-0 z-[1206] grid place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">Đổi mật khẩu nhân viên</div>
          <button className="rounded p-1 hover:bg-neutral-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {donePw ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              <div className="font-semibold mb-1">
                Đã đặt lại mật khẩu cho <span className="underline">{staff.name}</span>
              </div>
              <div className="text-sm">Mật khẩu mới:</div>
              <div className="mt-1 flex items-center gap-2">
                <code className="rounded-lg bg-white px-3 py-2 border text-emerald-900">
                  {donePw}
                </code>
                <Button className={`${BTN.base} ${BTN.outline}`} onClick={copyPw}>
                  <Copy className="h-5 w-5 mr-1" /> Sao chép
                </Button>
              </div>
              {copied ? <div className="mt-2 text-xs">Đã sao chép vào clipboard.</div> : null}
            </div>

            <div className="flex justify-end">
              <Button className={`${BTN.base} ${BTN.primary}`} onClick={onClose}>
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-neutral-700">
              Nhập <b>mật khẩu mới</b> cho nhân viên: <b>{staff.name}</b>
            </div>

            <div>
              <FieldLabel required>Mật khẩu mới</FieldLabel>
              <div className="flex gap-2">
                <Input
                  type="text" // luôn hiển thị, không che dấu chấm
                  autoComplete="off"
                  className={!touched ? INPUT_OK : err ? INPUT_ERR : INPUT_OK}
                  value={npw}
                  onChange={(e) => setNpw(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="Tối thiểu 8 ký tự"
                />
                <Button
                  type="button"
                  className={`${BTN.base} ${BTN.outline}`}
                  onClick={() => setNpw(genPassword())}
                >
                  Tạo ngẫu nhiên
                </Button>
              </div>
              {touched && err ? <p className="text-xs text-rose-600 mt-1">{err}</p> : null}
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <Button className={`${BTN.base} ${BTN.outline}`} onClick={onClose}>
                Huỷ
              </Button>
              <Button className={`${BTN.base} ${BTN.primary}`} onClick={handleSubmit}>
                Xác nhận
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   NEW: Staff Detail Modal — xem đầy đủ (trừ phân công), có Sửa + Đổi MK
========================================================= */
function StaffDetailModal({ open, staff, onClose, onEdit, onResetPw }) {
  if (!open || !staff) return null;
  return (
    <div className="fixed inset-0 z-[1255] grid place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">
            Chi tiết nhân viên — <span className="text-emerald-700">{staff.name}</span>
          </div>
          <button className="rounded p-1 hover:bg-neutral-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-start gap-4">
          <SquareThumb src={staff.avatarUrl} size={72} fallback="user" title={staff.name} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            <div className="rounded-xl border bg-neutral-50 px-3 py-2">
              <div className="text-xs text-neutral-500">Họ & tên</div>
              <div className="text-sm text-neutral-900">{staff.name || "—"}</div>
            </div>
            <div className="rounded-xl border bg-neutral-50 px-3 py-2">
              <div className="text-xs text-neutral-500">Email</div>
              <div className="text-sm text-neutral-900">{staff.email || "—"}</div>
            </div>
            <div className="rounded-xl border bg-neutral-50 px-3 py-2">
              <div className="text-xs text-neutral-500">Số điện thoại</div>
              <div className="text-sm text-neutral-900">{staff.phone || "—"}</div>
            </div>
            <div className="rounded-xl border bg-neutral-50 px-3 py-2">
              <div className="text-xs text-neutral-500">Vai trò</div>
              <div className="text-sm text-neutral-900">{staff.role || "Staff"}</div>
            </div>
            <div className="rounded-xl border bg-neutral-50 px-3 py-2 md:col-span-2">
              <div className="text-xs text-neutral-500">Phân công</div>
              <div className="text-sm text-neutral-900">{staff.assigned || "—"}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button className={`${BTN.base} ${BTN.outline}`} onClick={onEdit}>
            Sửa
          </Button>
          <Button className={`${BTN.base} ${BTN.primary}`} onClick={onResetPw}>
            Đổi mật khẩu
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Utils (bổ sung hàm chọn tài khoản ưu tiên & copy)
========================================================= */
function preferredLoginAccount({ phone, email }) {
  const p = (phone || "").trim();
  const e = (email || "").trim();
  return p || e || "";
}
async function copyCredentialsToClipboard(account, password) {
  const text =
    `Tài khoản đăng nhập của bạn: ${account || "—"}\n` +
    `Mật khẩu đăng nhập của bạn: ${password || "—"}.`;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // fallback
    window.prompt("Sao chép thông tin đăng nhập:", text);
  }
}

/* =========================================================
   Main
========================================================= */
export default function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Loading states
  const [profileLoading, setProfileLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  
  // Payment history data from API
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  
  // Subscription plans from API
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  
  // demo password
  const loadDemoPw = () => {
    try {
      const p = localStorage.getItem(LS_DEMO_PW);
      if (p) return p;
      localStorage.setItem(LS_DEMO_PW, "MamMoi@123");
      return "MamMoi@123";
    } catch {
      return "MamMoi@123";
    }
  };
  const [demoPw, setDemoPw] = useState(loadDemoPw);

  // Load profile from API or fallback to localStorage
  const [profile, setProfile] = useState(() => {
    const p = load(LS_PROFILE, defaultProfile);
    const address = p.address || p.organization || defaultProfile.address;
    const { organization, ...rest } = p || {};
    return { ...defaultProfile, ...rest, address };
  });

  const [gardens, setGardens] = useState(() => load(LS_GARDENS, defaultGardens));
  const [staffs, setStaffs] = useState(() => load(LS_STAFFS, defaultStaffs));
  const [trees, setTrees] = useState(() => load(LS_TREES, defaultTrees));
  const [editTree, setEditTree] = useState({ open:false, data:null });

  // Fetch user profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.userId) {
        setProfileLoading(false);
        return;
      }
      
      try {
        const data = await UserRepository.getProfile(user.userId);
        if (data) {
          setProfile({
            fullName: data.fullName || data.name || defaultProfile.fullName,
            email: data.email || defaultProfile.email,
            phone: data.phone || data.phoneNumber || defaultProfile.phone,
            address: data.address || defaultProfile.address,
            avatarUrl: data.profileImageUrl || data.avatar || "",
            gender: data.gender || defaultProfile.gender,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Keep localStorage data on error
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchProfile();
  }, [user?.userId]);

  // Fetch payment history from API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await PaymentRepository.getAllPaymentHistory();
        if (data && Array.isArray(data)) {
          // Transform API data to match PaymentHistory component format
          const transformedPayments = data.map((payment) => ({
            id: payment.invoiceNumber || `PAY-${payment.paymentId}`,
            time: payment.paymentDate || "",
            package: payment.subscriptionPlanName || "—",
            amount: payment.amount ? `${payment.amount.toLocaleString("vi-VN")} đ` : "0 đ",
            method: payment.paymentMethod || "—",
            status: mapPaymentStatus(payment.transactionStatus),
            statusColor: getStatusColor(payment.transactionStatus),
            txId: payment.transactionId || "—",
          }));
          setPaymentTransactions(transformedPayments);
        }
      } catch (error) {
        console.error("Error fetching payment history:", error);
        // Keep empty array on error
      } finally {
        setPaymentsLoading(false);
      }
    };
    
    fetchPayments();
  }, []);

  // Fetch subscription plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await SubscriptionPlanRepository.getPaidPlans();
        console.log("Subscription plans:", data);
        setSubscriptionPlans(data || []);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Handle upgrade plan click
  const handleUpgradePlan = (plan) => {
    navigate('/checkout', { 
      state: { 
        planId: plan.planId, 
        planName: plan.planName, 
        price: plan.price,
        isYearly: false // UserProfile shows monthly pricing
      } 
    });
  };

  // Helper function to map API status to Vietnamese display status
  const mapPaymentStatus = (status) => {
    const statusMap = {
      "Completed": "Thành công",
      "Success": "Thành công",
      "Pending": "Đang xử lý",
      "Processing": "Đang xử lý",
      "Failed": "Thất bại",
      "Refunded": "Hoàn tiền",
      "Cancelled": "Đã hủy",
    };
    return statusMap[status] || status || "—";
  };

  // Helper function to get status color classes
  const getStatusColor = (status) => {
    const colorMap = {
      "Completed": "bg-green-50 text-green-700 border-green-200",
      "Success": "bg-green-50 text-green-700 border-green-200",
      "Pending": "bg-yellow-50 text-yellow-700 border-yellow-200",
      "Processing": "bg-yellow-50 text-yellow-700 border-yellow-200",
      "Failed": "bg-red-50 text-red-700 border-red-200",
      "Refunded": "bg-blue-50 text-blue-700 border-blue-200",
      "Cancelled": "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colorMap[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  useEffect(() => save(LS_PROFILE, profile), [profile]);
  useEffect(() => save(LS_GARDENS, gardens), [gardens]);
  useEffect(() => save(LS_STAFFS, staffs), [staffs]);
  useEffect(() => save(LS_TREES, trees), [trees]);


  /* ====== Search/Filter ====== */
  // Gardens
  const [searchGarden, setSearchGarden] = useState("");
  const [gardenFilter, setGardenFilter] = useState("all"); // all | active | stopped
  // Staffs
  const [searchStaff, setSearchStaff] = useState("");
  const [staffGardenFilter, setStaffGardenFilter] = useState("all"); // all | __none | gardenName
  const [staffStatusFilter, setStaffStatusFilter] = useState("all"); // all | active | inactive

  // Payment History Filters
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("Tất cả trạng thái");
  const [paymentDateFrom, setPaymentDateFrom] = useState("");
  const [paymentDateTo, setPaymentDateTo] = useState("");

  const [activeMenu, setActiveMenu] = useState("account"); // "account" | "password" | "history" | "upgrade"
  const [currentPackage, setCurrentPackage] = useState("Starter"); // Gói hiện tại
  const [pwOpen, setPwOpen] = useState(false);
  const [pwModalTab, setPwModalTab] = useState("change"); // change | forgot
  const [addGardenOpen, setAddGardenOpen] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  
  // Password change form state
  const [cp, setCp] = useState(""); // current password
  const [np, setNp] = useState(""); // new password
  const [cf, setCf] = useState(""); // confirm password
  const [peek, setPeek] = useState(false);
  const [touchedPw, setTouchedPw] = useState({ cp: false, np: false, cf: false });
  const [errorsPw, setErrorsPw] = useState({ cp: "", np: "", cf: "" });
  const cpRef = useRef(null);
  const npRef = useRef(null);
  const cfRef = useRef(null);

  // Validate password change form
  const validatePasswordChange = () => {
    const newErrors = { cp: "", np: "", cf: "" };
    let isValid = true;

    // Kiểm tra mật khẩu mới trước (ưu tiên cao nhất)
    if (!np.trim()) {
      newErrors.np = "Vui lòng nhập mật khẩu mới";
      isValid = false;
    } else if (np.length < 8) {
      newErrors.np = "Mật khẩu mới tối thiểu 8 ký tự";
      isValid = false;
    } else if (np === cp) {
      newErrors.np = "Mật khẩu mới không được trùng mật khẩu cũ";
      isValid = false;
    }

    // Kiểm tra xác nhận mật khẩu (chỉ khi mật khẩu mới hợp lệ)
    if (!newErrors.np) {
      if (!cf.trim()) {
        newErrors.cf = "Vui lòng xác nhận mật khẩu mới";
        isValid = false;
      } else if (cf !== np) {
        newErrors.cf = "Xác nhận mật khẩu không khớp";
        isValid = false;
      }
    }

    // KHÔNG kiểm tra mật khẩu hiện tại ở đây
    // Chỉ kiểm tra khi submit (trong handlePasswordChange)

    setErrorsPw(newErrors);
    setTouchedPw({ cp: true, np: true, cf: true });
    return isValid;
  };

  // Submit password change
  const handlePasswordChange = () => {
    // Bước 1: Kiểm tra mật khẩu mới và xác nhận trước
    if (!validatePasswordChange()) return;

    // Bước 2: Chỉ kiểm tra mật khẩu hiện tại sau khi mật khẩu mới hợp lệ
    const newErrors = { cp: "", np: "", cf: "" };
    let hasError = false;

    if (!cp.trim()) {
      newErrors.cp = "Vui lòng nhập mật khẩu hiện tại";
      hasError = true;
    } else if (cp !== demoPw) {
      newErrors.cp = "Mật khẩu hiện tại không đúng";
      hasError = true;
    }

    if (hasError) {
      setErrorsPw((prev) => ({ ...prev, ...newErrors }));
      setTouchedPw((prev) => ({ ...prev, cp: true }));
      cpRef.current?.focus();
      return;
    }

    // Nếu tất cả đều hợp lệ, thực hiện đổi mật khẩu
    setDemoPw(np);
    try {
      localStorage.setItem(LS_DEMO_PW, np);
    } catch {}
    // Reset form
    setCp("");
    setNp("");
    setCf("");
    setTouchedPw({ cp: false, np: false, cf: false });
    setErrorsPw({ cp: "", np: "", cf: "" });
    // Show success message (you can add a toast notification here)
  };

  // Reset password form when switching menu
  useEffect(() => {
    if (activeMenu !== "password") {
      setCp("");
      setNp("");
      setCf("");
      setTouchedPw({ cp: false, np: false, cf: false });
      setErrorsPw({ cp: "", np: "", cf: "" });
      setPeek(false);
    }
  }, [activeMenu]);

  // Clear các field mật khẩu mới khi mật khẩu hiện tại bị xóa
  useEffect(() => {
    if (activeMenu === "password" && !cp.trim()) {
      setNp("");
      setCf("");
      setTouchedPw((t) => ({ ...t, np: false, cf: false }));
      setErrorsPw((e) => ({ ...e, np: "", cf: "" }));
    }
  }, [cp, activeMenu]);
  const [gardenDetail, setGardenDetail] = useState({
    open: false,
    garden: null,
  });

  /* Edit modals + Toast */
  const [editGarden, setEditGarden] = useState({
    open: false,
    index: -1,
    data: null,
  });
  const [editStaff, setEditStaff] = useState({
    open: false,
    index: -1,
    data: null,
  });
  const [toast, setToast] = useState({
    open: false,
    title: "",
    desc: "",
    variant: "success",
  });
  const showToast = (title, desc = "", variant = "success") =>
    setToast({ open: true, title, desc, variant });

  // NEW: modal phân công, chi tiết & reset mk
  const [assignModal, setAssignModal] = useState({
    open: false,
    index: -1,
    staff: null,
  });
  const [resetPwModal, setResetPwModal] = useState({
    open: false,
    index: -1,
    staff: null,
  });
  const [staffDetail, setStaffDetail] = useState({
    open: false,
    index: -1,
    staff: null,
  });

  const overlayOpen =
    pwOpen ||
    addGardenOpen ||
    addStaffOpen ||
    gardenDetail.open ||
    editGarden.open ||
    editStaff.open ||
    assignModal.open ||
    resetPwModal.open ||
    staffDetail.open ||
    editTree.open;

  const profileRef = useRef(null);

  const [draft, setDraft] = useState(profile);
  const [touchedProfile, setTouchedProfile] = useState({});
  useEffect(() => {
    setDraft(profile);
    setTouchedProfile({});
    // Không reset OTP gate khi profile thay đổi, chỉ reset khi user thay đổi
  }, [profile]);

  const profileErrors = {
    fullName: !draft.fullName.trim() ? "Họ & tên là bắt buộc" : "",
    contact:
      !draft.email.trim() && !draft.phone.trim()
        ? "Cần ít nhất Email hoặc SĐT"
        : draft.email.trim() && !reEmail.test(draft.email)
        ? "Email không hợp lệ"
        : draft.phone.trim() && !validVNPhone(draft.phone)
        ? "SĐT Việt Nam không hợp lệ (10 số, bắt đầu 0)"
        : "",
  };
  const canSaveProfile = !profileErrors.fullName && !profileErrors.contact;

  const blankGarden = {
   name: "",
   province: "",
   ward: "",
   address: "",
   status: "Đang hoạt động",
   coverUrl: "",
   provinceObj: null,
   wardObj: null,
 };
  const [newGarden, setNewGarden] = useState(blankGarden);
  const [touchedGarden, setTouchedGarden] = useState({});
   const gardenErrors = {
       name: !newGarden.name.trim() ? "Tên vườn là bắt buộc" : "",
   province: !newGarden.provinceObj ? "Nhập Tỉnh/Thành phố" : "",
   ward: !newGarden.wardObj ? "Nhập Phường/Xã" : "",
   address: !newGarden.address.trim() ? "Nhập địa chỉ chi tiết" : "",
 };
  const canSubmitGarden =
   !gardenErrors.name &&
  !gardenErrors.province &&
   !gardenErrors.ward &&
   !gardenErrors.address;

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    tempPassword: genPassword(),
    assigned: "",
    role: "Staff",
    avatarUrl: "",
  });
  const [touchedStaff, setTouchedStaff] = useState({});
  const staffErrors = {
    name: !newStaff.name.trim() ? "Họ tên là bắt buộc" : "",
    contact:
      !newStaff.email.trim() && !newStaff.phone.trim()
        ? "Cần ít nhất Email hoặc SĐT"
        : newStaff.phone.trim() && !validVNPhone(newStaff.phone)
        ? "SĐT Việt Nam không hợp lệ"
        : newStaff.email.trim() && !reEmail.test(newStaff.email)
        ? "Email không hợp lệ"
        : "",
    tempPassword:
      !newStaff.tempPassword.trim() || newStaff.tempPassword.trim().length < 8
        ? "Mật khẩu tạm tối thiểu 8 ký tự"
        : "",
  };
  const canSubmitStaff =
    !staffErrors.name && !staffErrors.contact && !staffErrors.tempPassword;

  /* ======= Stats + Memos ======= */
  const stats = useMemo(() => {
    const activeGardens =
      gardens.filter((g) => g.status === "Đang hoạt động").length;
    return {
      totalTrees: trees.length,
      staffCount: staffs.length,
      activeGardens,
      inactiveGardens: gardens.length - activeGardens,
    };
  }, [gardens, staffs, trees]);

  const treeCountMap = useMemo(() => {
    const m = {};
    for (const t of trees) {
      m[t.gardenName] = (m[t.gardenName] || 0) + 1;
    }
    return m;
  }, [trees]);

  // Filter + Search cho vườn
  const filteredGardens = useMemo(() => {
    const q = searchGarden.trim().toLowerCase();
    return gardens.filter((g) => {
      const byStatus =
        gardenFilter === "all"
          ? true
          : gardenFilter === "active"
          ? g.status === "Đang hoạt động"
          : g.status !== "Đang hoạt động";

      if (!q) return byStatus;

      const haystack = [
        g.name,
        g.province,
        
        g.ward,
        g.address,
        g.status,
      ]
        .join(" ")
        .toLowerCase();

      return byStatus && haystack.includes(q);
    });
  }, [gardens, gardenFilter, searchGarden]);

  // Filter + Search cho nhân viên
  const filteredStaffs = useMemo(() => {
    const q = searchStaff.trim().toLowerCase();
    return staffs.filter((s) => {
      const byGarden =
        staffGardenFilter === "all"
          ? true
          : staffGardenFilter === "__none"
          ? !s.assigned
          : s.assigned === staffGardenFilter;

      const byStatus =
        staffStatusFilter === "all"
          ? true
          : (s.status || "active") === staffStatusFilter;

      if (!q) return byGarden && byStatus;

      const hay = [
        s.name,
        s.email,
        s.phone,
        s.role,
        s.assigned,
        s.status,
        s.createdAt,
      ]
        .join(" ")
        .toLowerCase();

      return byGarden && byStatus && hay.includes(q);
    });
  }, [staffs, searchStaff, staffGardenFilter, staffStatusFilter]);

  const [confirm, setConfirm] = useState({
    open: false,
    type: "",
    payload: null,
  });

  function openConfirmAddGarden() {
    setTouchedGarden({
      name: true,
      province: true,
      district: true,
      ward: true,
      address: true,
    });
    if (!canSubmitGarden) return;
    setConfirm({ open: true, type: "add-garden", payload: { ...newGarden } });
  }
  function openConfirmAddStaff() {
    setTouchedStaff({ name: true, contact: true, tempPassword: true });
    if (!canSubmitStaff) return;
    setConfirm({ open: true, type: "add-staff", payload: { ...newStaff } });
  }
  function openConfirmDeleteGarden(g) {
    setConfirm({ open: true, type: "delete-garden", payload: g });
  }
  function openConfirmDeleteStaff(s) {
    setConfirm({ open: true, type: "delete-staff", payload: s });
  }

  async function handleConfirm() {
    if (confirm.type === "add-garden") {
      setGardens((gs) => [confirm.payload, ...gs]);
      closeGardenModal();
    }
    if (confirm.type === "add-staff") {
      // Auto-copy TK + MK khi người dùng bấm Xác nhận
      const acc = preferredLoginAccount(confirm.payload);
      await copyCredentialsToClipboard(acc, confirm.payload.tempPassword);

      setStaffs((ss) => [
        {
          ...confirm.payload,
          status: "active",
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...ss,
      ]);
      closeStaffModal();
    }
    if (confirm.type === "delete-garden") {
      setGardens((gs) => gs.filter((x) => x !== confirm.payload));
    }
    if (confirm.type === "delete-staff") {
      setStaffs((ss) => ss.filter((x) => x !== confirm.payload));
    }
    setConfirm({ open: false, type: "", payload: null });
  }

  async function saveProfile() {
    setTouchedProfile((t) => ({ ...t, fullName: true, contact: true }));
    if (!canSaveProfile) return;
    
    try {
      // Call API to update profile
      if (user?.userId) {
        await UserRepository.editProfile(user.userId, {
          fullName: draft.fullName,
          email: draft.email,
          phone: draft.phone,
          address: draft.address,
          gender: draft.gender,
        });
      }
      
      setProfile(draft);
      setAllowEditContact({ email: false, phone: false }); // Reset OTP gate sau khi save
      
      // Đồng bộ avatar với AuthContext để header cập nhật
      if (user) {
        const updatedUser = {
          ...user,
          ProfileImageUrl: draft.avatarUrl || user.ProfileImageUrl,
          fullName: draft.fullName || user.fullName,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // Trigger custom event để AuthContext có thể cập nhật nếu cần
        window.dispatchEvent(new CustomEvent("userProfileUpdated", { detail: updatedUser }));
      }
      
      showToast("Đã lưu", "Thông tin tài khoản đã được cập nhật", "success");
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast("Lỗi", "Không thể lưu thông tin. Vui lòng thử lại.", "error");
    }
  }

 function formatGardenLocation(g) {
   return [g.address, g.ward, g.province].filter(Boolean).join(", ");
 }

  function openGardenModal() {
    setNewGarden({ ...blankGarden });
    setTouchedGarden({});
    setAddGardenOpen(true);
  }
  function closeGardenModal() {
    setAddGardenOpen(false);
    setNewGarden({ ...blankGarden });
    setTouchedGarden({});
  }
  function openStaffModal() {
    setNewStaff({
      name: "",
      email: "",
      phone: "",
      tempPassword: genPassword(),
      assigned: "",
      role: "Staff",
      avatarUrl: "",
    });
    setTouchedStaff({});
    setAddStaffOpen(true);
  }
  function closeStaffModal() {
    setAddStaffOpen(false);
    setNewStaff({
      name: "",
      email: "",
      phone: "",
      tempPassword: genPassword(),
      assigned: "",
      role: "Staff",
      avatarUrl: "",
    });
    setTouchedStaff({});
  }

  /* NEW: refresh cây từ LS (đồng bộ với màn Thêm cây) */
  const reloadTreesFromLS = () => {
    setTrees(load(LS_TREES, defaultTrees));
  };

  /* ====== OTP gate cho email/phone ====== */
  const [allowEditContact, setAllowEditContact] = useState({
    email: false,
    phone: false,
  });
  const [otpState, setOtpState] = useState({
    open: false,
    target: null, // "email" | "phone"
  });
  const openOtp = (target) => {
    setOtpState({ open: true, target });
  };
  const closeOtp = () => setOtpState({ open: false, target: null });

  return (
   <div className="mm-fluid-page min-h-screen relative">
    <LivingBackground density={28} baseColor={BG} />
    <PageRails />

      {/* Banner */}
      <div
        className={`${CONTAINER} pt-20 pb-6`}
        inert={overlayOpen ? "" : undefined}
      >
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg">Hồ sơ người dùng</h1>
          <p className="text-white/90 text-base mt-2">
            Quản lý thông tin, vườn và nhân viên
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            {
              label: "Hiển thị gói hiện tại",
              value: currentPackage,
              icon: <Shield className="h-5 w-5" />,
            },
            {
              label: "Số vườn đang quản lý",
              value: gardens.length,
              icon: <MapPin className="h-5 w-5" />,
            },
            {
              label: "Tổng số cây đang chăm",
              value: stats.totalTrees,
              icon: <TreePine className="h-5 w-5" />,
            },
          ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/25 bg-white/20 backdrop-blur-[10px] p-4"
                >
                  <div className="flex items-center justify-between text-2xl font-semibold text-white/90 mb-2">
                    <span>{s.label}</span>
                    {s.icon}
                  </div>
                  <div className={`${s.label.includes("vườn") || s.label.includes("cây") ? "text-4xl" : "text-2xl"} font-medium text-white drop-shadow-sm`}>{s.value}</div>
                </div>
              ))}
            </div>
      </div>

      {/* Main */}
      <main
        className={`${CONTAINER} pb-16`}
        inert={overlayOpen ? "" : undefined}
      >
        <div className="flex gap-8 w-full">
          {/* Sidebar Menu - Left */}
          <aside className="w-80 shrink-0">
            <Card className="bg-white/20 backdrop-blur-md border border-white/25 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.3)]">
              <CardContent className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-white drop-shadow-lg">Quản lý tài khoản</h2>
                </div>
                
                {/* Navigation Menu */}
                <nav className="space-y-3 mb-10">
                  <button 
                    onClick={() => setActiveMenu("account")}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-colors ${
                      activeMenu === "account"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : "text-white/90 hover:bg-slate-800/50"
                    }`}
                  >
                    <UserIcon className="h-6 w-6" />
                    <span className="text-lg font-medium">Tài khoản</span>
                  </button>
                  <button 
                    onClick={() => setActiveMenu("password")}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-colors ${
                      activeMenu === "password"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : "text-white/90 hover:bg-slate-800/50"
                    }`}
                  >
                    <Lock className="h-6 w-6" />
                    <span className="text-lg">Mật khẩu</span>
                  </button>
                  <button 
                    onClick={() => setActiveMenu("history")}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-colors ${
                      activeMenu === "history"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : "text-white/90 hover:bg-slate-800/50"
                    }`}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span className="text-lg">Lịch sử giao dịch</span>
                  </button>
                  <button 
                    onClick={() => setActiveMenu("upgrade")}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-colors ${
                      activeMenu === "upgrade"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : "text-white/90 hover:bg-slate-800/50"
                    }`}
                  >
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-lg">Nâng cấp gói</span>
                  </button>
                </nav>

                {/* User Profile Summary */}
                <div className="pt-8 border-t border-white/30">
                  <div className="flex items-center gap-4 mb-4">
                    <AvatarSync src={profile.avatarUrl} size={56} />
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-medium text-white truncate">
  {profile.fullName}
</div>
                      <div className="text-sm text-white/80 truncate">
                        {profile.email || "—"}
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-5 rounded-xl h-12 bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/40 text-base font-medium shadow-lg"
                    onClick={() => {
                      // Logout logic here
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span className="text-base">Thoát</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - Right */}
          <div className="flex-1">
            {/* Tài khoản Section */}
            {activeMenu === "account" && (
              <section ref={profileRef} className="space-y-6">
                {/* Card duy nhất cho tất cả thông tin tài khoản */}
                <Card className="bg-white/20 backdrop-blur-md border border-white/25 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.3)]">
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    {/* Header */}
                    <div className="mb-6">
                      <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1 break-words drop-shadow-lg">Tài khoản</h1>
                      <p className="text-xs sm:text-sm text-white/80 break-words">Cập nhật thông tin tài khoản</p>
                    </div>

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4 mb-6">
                      <div className="relative flex-shrink-0">
                        <AvatarPicker
                          src={draft.avatarUrl}
                          size={120}
                          onChange={(v) => setDraft({ ...draft, avatarUrl: v })}
                          onFileSelect={async (file) => {
                            if (!user?.userId) return;
                            try {
                              const response = await UserRepository.uploadAvatar(user.userId, file);
                              if (response?.url || response?.avatarUrl) {
                                const newAvatarUrl = response.url || response.avatarUrl;
                                setDraft((d) => ({ ...d, avatarUrl: newAvatarUrl }));
                                showToast("Thành công", "Đã cập nhật ảnh đại diện", "success");
                              }
                            } catch (error) {
                              console.error("Error uploading avatar:", error);
                              showToast("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại.", "error");
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0">
                      {/* Họ & tên */}
                      <div className="min-w-0">
                        <FieldLabel required className="text-white/90">Họ & tên</FieldLabel>
                        <Input
                          name="full-name"
                          autoComplete="name"
                          aria-invalid={!!(touchedProfile.fullName && profileErrors.fullName)}
                          className={
                            !touchedProfile.fullName
                              ? "h-12 w-full rounded-xl bg-slate-800/60 border border-emerald-400/40 text-white placeholder:text-white/50 focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 min-w-0"
                              : profileErrors.fullName
                              ? "h-12 w-full rounded-xl bg-slate-800/60 border border-rose-500 text-white placeholder:text-white/50 focus:ring-2 focus:ring-rose-500/40 min-w-0"
                              : "h-12 w-full rounded-xl bg-slate-800/60 border border-emerald-400/40 text-white placeholder:text-white/50 focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 min-w-0"
                          }
                          value={draft.fullName}
                          onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                          onBlur={() => setTouchedProfile((t) => ({ ...t, fullName: true }))}
                          placeholder="Nhập họ và tên"
                        />
                        {touchedProfile.fullName && profileErrors.fullName ? (
                          <p className="mt-1 text-xs text-rose-400 break-words">{profileErrors.fullName}</p>
                        ) : null}
                      </div>

                      {/* Email + OTP gate */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-start sm:items-center justify-between gap-2 mb-2 min-w-0">
                          <FieldLabel className="text-white/80 break-words min-w-0 flex-1">Email (xác minh OTP trước khi đổi)</FieldLabel>
                          {allowEditContact.email ? (
                            <span className="text-xs text-emerald-400 whitespace-nowrap flex-shrink-0">Đã xác minh OTP ✓</span>
                          ) : (
                            <button
                              type="button"
                              className="text-xs text-emerald-400 hover:underline whitespace-nowrap flex-shrink-0"
                              onClick={() => openOtp("email")}
                            >
                              Đổi email
                            </button>
                          )}
                        </div>
                        <Input
                          type="email"
                          name="profile-email"
                          autoComplete="off"
                          readOnly={!allowEditContact.email}
                          aria-invalid={!!(touchedProfile.contact && profileErrors.contact)}
                          className={
                            !touchedProfile.contact
                              ? "h-12 w-full rounded-xl bg-slate-800/60 border border-emerald-400/40 text-white placeholder:text-white/50 focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 min-w-0"
                              : profileErrors.contact
                              ? "h-12 w-full rounded-xl bg-slate-800/60 border border-rose-500 text-white placeholder:text-white/40 focus:ring-2 focus:ring-rose-500/40 min-w-0"
                              : "h-12 w-full rounded-xl bg-slate-800/60 border border-emerald-400/40 text-white placeholder:text-white/50 focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 min-w-0"
                          }
                          value={draft.email}
                          onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                          onBlur={() => setTouchedProfile((t) => ({ ...t, contact: true }))}
                          placeholder="name@company.com"
                        />
                        {touchedProfile.contact && profileErrors.contact ? (
                          <p className="mt-1 text-xs text-rose-400 break-words">{profileErrors.contact}</p>
                        ) : null}
                      </div>

                      {/* Số điện thoại */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-start sm:items-center justify-between gap-2 mb-2 min-w-0">
                          <FieldLabel className="text-white/80 break-words min-w-0 flex-1">Số điện thoại (xác minh OTP trước khi đổi)</FieldLabel>
                          {allowEditContact.phone ? (
                            <span className="text-xs text-emerald-400 whitespace-nowrap flex-shrink-0">Đã xác minh OTP ✓</span>
                          ) : (
                            <button
                              type="button"
                              className="text-xs text-emerald-400 hover:underline whitespace-nowrap flex-shrink-0"
                              onClick={() => openOtp("phone")}
                            >
                              Đổi SĐT
                            </button>
                          )}
                        </div>
                        <Input
                          type="tel"
                          name="profile-phone"
                          autoComplete="off"
                          inputMode="numeric"
                          pattern="\d*"
                          readOnly={!allowEditContact.phone}
                          aria-invalid={!!(touchedProfile.contact && profileErrors.contact)}
                          className={
                            !touchedProfile.contact
                              ? "h-12 w-full rounded-xl bg-slate-800/60 border border-emerald-400/40 text-white placeholder:text-white/50 focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 min-w-0"
                              : profileErrors.contact
                              ? "h-12 w-full rounded-xl bg-slate-800/60 border border-rose-500 text-white placeholder:text-white/40 focus:ring-2 focus:ring-rose-500/40 min-w-0"
                              : "h-12 w-full rounded-xl bg-slate-800/60 border border-emerald-400/40 text-white placeholder:text-white/50 focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 min-w-0"
                          }
                          value={draft.phone}
                          onChange={(e) =>
                            setDraft({ ...draft, phone: e.target.value.replace(/\D/g, "") })
                          }
                          onBlur={() => setTouchedProfile((t) => ({ ...t, contact: true }))}
                          placeholder="0xxxxxxxxx"
                        />
                        {touchedProfile.contact && profileErrors.contact ? (
                          <p className="mt-1 text-xs text-rose-400 break-words">{profileErrors.contact}</p>
                        ) : null}
                      </div>

                      {/* Địa chỉ */}
                      <div className="min-w-0">
                        <FieldLabel className="text-white/80 break-words">Địa chỉ</FieldLabel>
                        <Input
                          name="address"
                          autoComplete="street-address"
                          className="h-12 w-full rounded-xl bg-slate-800/60 border border-emerald-400/40 text-white placeholder:text-white/50 focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 min-w-0"
                          value={draft.address}
                          onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                          placeholder="Số nhà/đường, phường/xã, quận/huyện, tỉnh/thành"
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 mt-6 border-t border-white/30">
                      <Button
                        className="h-12 px-6 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-medium w-full sm:w-auto"
                        onClick={saveProfile}
                      >
                        Lưu thay đổi
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Mật khẩu Section */}
            {activeMenu === "password" && (
              <section className="space-y-6">
                <Card className="bg-white/20 backdrop-blur-md border border-white/25 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.15)]">
              <CardContent className="p-8">
                    <div className="mb-6">
                      <h1 className="text-2xl font-semibold text-white mb-1 drop-shadow-lg">Mật khẩu</h1>
                      <p className="text-sm text-white/80">Bảo mật tài khoản của bạn</p>
                    </div>

                    <div className="space-y-6">
                      {/* Change Password Form */}
                      <div className="p-6 rounded-2xl bg-white/20 border border-white/25">
                        <div className="flex items-center gap-3 mb-4">
                          <Lock className="h-6 w-6 text-yellow-400" />
                          <h2 className="text-lg font-semibold text-white">Đổi mật khẩu</h2>
                        </div>
                        <p className="text-sm text-white/70 mb-6">
                          Để đảm bảo an toàn, vui lòng đổi mật khẩu định kỳ. Mật khẩu mới phải có ít nhất 8 ký tự.
                        </p>

                        <form 
                          autoComplete="off" 
                          onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }}
                          style={{ position: 'relative' }}
                        >
                          {/* Hidden inputs to trick password managers */}
                          <input 
                            type="text" 
                            autoComplete="username" 
                            className="hidden" 
                            tabIndex="-1" 
                            style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                          />
                          <input 
                            type="password" 
                            autoComplete="new-password" 
                            className="hidden" 
                            tabIndex="-1"
                            style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                          />

                          {/* Current password */}
                          <div className="space-y-2 mb-4">
                            <label className="block text-sm font-bold text-white/90">Mật khẩu hiện tại</label>
                            <Input
                              ref={cpRef}
                              type="password"
                              autoComplete="off"
                              readOnly
                              spellCheck="false"
                              onFocus={(e) => {
                                e.currentTarget.removeAttribute("readonly");
                                // Reset cả 3 trường mật khẩu khi click vào để nhập lại
                                setCp("");
                                setNp("");
                                setCf("");
                                setErrorsPw({ cp: "", np: "", cf: "" });
                                setTouchedPw({ cp: false, np: false, cf: false });
                              }}
                              data-lpignore="true"
                              data-1p-ignore="true"
                              data-bwignore="true"
                              data-dashlane-ignore="true"
                              data-ignore-autofill="true"
                              data-form-type="other"
                              data-form-type-other="true"
                              name="current-password-disabled"
                              id="current-password-disabled"
                              className={`h-12 w-full rounded-xl bg-slate-800/60 border ${
                                !touchedPw.cp
                                  ? "border-emerald-400/40"
                                  : errorsPw.cp
                                  ? "border-rose-500 focus:ring-2 focus:ring-rose-500/40"
                                  : "border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/40"
                              } text-white placeholder:text-white/40 focus:border-yellow-500 no-native-eye`}
                              value={cp}
                              onChange={(e) => {
                                setCp(e.target.value);
                                if (errorsPw.cp) {
                                  setErrorsPw((e) => ({ ...e, cp: "" }));
                                }
                              }}
                              onBlur={() => setTouchedPw((t) => ({ ...t, cp: true }))}
                              placeholder="Nhập mật khẩu hiện tại"
                            />
                            {touchedPw.cp && errorsPw.cp && (
                              <p className="text-xs text-rose-400">{errorsPw.cp}</p>
                            )}
                          </div>

                          {/* New password */}
                          <div className="space-y-2 mb-4">
                            <label className="block text-sm font-bold text-white/80">Mật khẩu mới</label>
                            <Input
                              ref={npRef}
                              type="password"
                              autoComplete="off"
                              readOnly
                              spellCheck="false"
                              onFocus={(e) => {
                                if (!cp.trim()) {
                                  e.preventDefault();
                                  e.currentTarget.blur();
                                  cpRef.current?.focus();
                                  return;
                                }
                                e.currentTarget.removeAttribute("readonly");
                              }}
                              data-lpignore="true"
                              data-1p-ignore="true"
                              data-bwignore="true"
                              data-dashlane-ignore="true"
                              data-ignore-autofill="true"
                              data-form-type="other"
                              disabled={!cp.trim()}
                              className={`h-12 w-full rounded-xl bg-slate-800/60 border ${
                                !touchedPw.np
                                  ? "border-emerald-400/40"
                                  : errorsPw.np
                                  ? "border-rose-500 focus:ring-2 focus:ring-rose-500/40"
                                  : "border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/40"
                              } text-white placeholder:text-white/40 focus:border-yellow-500 no-native-eye ${!cp.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
                              value={np}
                              onChange={(e) => {
                                if (!cp.trim()) {
                                  e.preventDefault();
                                  return;
                                }
                                setNp(e.target.value);
                                if (errorsPw.np) {
                                  setErrorsPw((e) => ({ ...e, np: "" }));
                                }
                              }}
                              onBlur={() => setTouchedPw((t) => ({ ...t, np: true }))}
                              onPaste={(e) => {
                                if (!cp.trim()) {
                                  e.preventDefault();
                                  cpRef.current?.focus();
                                  return;
                                }
                              }}
                              onKeyDown={(e) => {
                                if (!cp.trim() && e.key !== "Tab") {
                                  e.preventDefault();
                                  cpRef.current?.focus();
                                }
                              }}
                              placeholder={!cp.trim() ? "Vui lòng nhập mật khẩu hiện tại trước" : "Tối thiểu 8 ký tự"}
                            />
                            {touchedPw.np && errorsPw.np && (
                              <p className="text-xs text-rose-400">{errorsPw.np}</p>
                            )}
                            {!cp.trim() && <p className="text-xs text-white/50">Vui lòng nhập mật khẩu hiện tại trước</p>}
                          </div>

                          {/* Confirm new password */}
                          <div className="space-y-2 mb-6">
                            <label className="block text-sm font-bold text-white/80">Xác nhận mật khẩu mới</label>
                            <Input
                              ref={cfRef}
                              type="password"
                              autoComplete="off"
                              readOnly
                              spellCheck="false"
                              onFocus={(e) => {
                                if (!cp.trim()) {
                                  e.preventDefault();
                                  e.currentTarget.blur();
                                  cpRef.current?.focus();
                                  return;
                                }
                                e.currentTarget.removeAttribute("readonly");
                              }}
                              data-lpignore="true"
                              data-1p-ignore="true"
                              data-bwignore="true"
                              data-dashlane-ignore="true"
                              data-ignore-autofill="true"
                              data-form-type="other"
                              disabled={!cp.trim()}
                              className={`h-12 w-full rounded-xl bg-slate-800/60 border ${
                                !touchedPw.cf
                                  ? "border-emerald-400/40"
                                  : errorsPw.cf
                                  ? "border-rose-500 focus:ring-2 focus:ring-rose-500/40"
                                  : "border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/40"
                              } text-white placeholder:text-white/40 focus:border-yellow-500 no-native-eye ${!cp.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
                              value={cf}
                              onChange={(e) => {
                                if (!cp.trim()) {
                                  e.preventDefault();
                                  return;
                                }
                                setCf(e.target.value);
                                if (errorsPw.cf) {
                                  setErrorsPw((e) => ({ ...e, cf: "" }));
                                }
                              }}
                              onBlur={() => setTouchedPw((t) => ({ ...t, cf: true }))}
                              onPaste={(e) => {
                                if (!cp.trim()) {
                                  e.preventDefault();
                                  cpRef.current?.focus();
                                  return;
                                }
                              }}
                              onKeyDown={(e) => {
                                if (!cp.trim() && e.key !== "Tab") {
                                  e.preventDefault();
                                  cpRef.current?.focus();
                                }
                              }}
                              placeholder={!cp.trim() ? "Vui lòng nhập mật khẩu hiện tại trước" : "Nhập lại mật khẩu mới"}
                            />
                            {touchedPw.cf && errorsPw.cf && (
                              <p className="text-xs text-rose-400">{errorsPw.cf}</p>
                            )}
                          </div>

                          <div className="flex justify-between items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setPwModalTab("forgot");
                                setPwOpen(true);
                              }}
                              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2"
                            >
                              Quên mật khẩu ?
                            </button>
                            <div className="flex gap-3">
    <Button
                                type="button"
                                className="h-12 px-6 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/40 shadow-lg"
                                onClick={() => {
                                  setCp("");
                                  setNp("");
                                  setCf("");
                                  setTouchedPw({ cp: false, np: false, cf: false });
                                  setErrorsPw({ cp: "", np: "", cf: "" });
                                }}
                              >
                                Huỷ
                              </Button>
                              <Button
                                type="submit"
                                className="h-12 px-6 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
                              >
                                Xác nhận
    </Button>
  </div>
                          </div>
                        </form>
</div>

                      {/* Security Tips */}
                      <div className="p-6 rounded-2xl bg-white/20 border border-white/25">
                        <div className="flex items-center gap-3 mb-4">
                          <Shield className="h-6 w-6 text-emerald-400" />
                          <h2 className="text-lg font-semibold text-white">Bảo mật tài khoản</h2>
                              </div>
                        <ul className="space-y-3 text-sm text-white/70">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>Không chia sẻ mật khẩu với người khác</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>Đổi mật khẩu định kỳ để tăng cường bảo mật</span>
                          </li>
                        </ul>
                            </div>
                          </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Lịch sử giao dịch Section */}
            {activeMenu === "history" && (
              <section className="space-y-6">
                <Card className="bg-white/20 backdrop-blur-md border border-white/25 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.3)]">
                  <CardContent className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="mb-6">
                      <h1 className="text-2xl font-semibold text-white mb-1 drop-shadow-lg">Lịch sử giao dịch</h1>
                      <p className="text-sm text-white/80">Xem và quản lý các giao dịch thanh toán của bạn</p>
                    </div>

                    {/* Filters Section */}
                    <div className="space-y-6 mb-6">
                      {/* Search and Status Row */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[280px] relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
                          <Input
                            type="text"
                            placeholder="Tìm mã đơn, gói, TXID, phương thức, số tiền..."
                            className="pl-12 h-14 w-full rounded-xl bg-white/20 border border-emerald-400/40 text-white placeholder:text-white/50 focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 text-base"
                            value={paymentSearch}
                            onChange={(e) => setPaymentSearch(e.target.value)}
                          />
                        </div>

                        <div className="relative">
                          <select
                            className="appearance-none px-5 py-3 pr-10 h-14 text-base border border-emerald-400/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 bg-white/20 backdrop-blur-sm text-white font-medium min-w-[200px]"
                            value={paymentStatusFilter}
                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                          >
                            <option value="Tất cả trạng thái" className="bg-gray-800">Tất cả trạng thái</option>
                            <option value="Thành công" className="bg-gray-800">Thành công</option>
                            <option value="Đang xử lý" className="bg-gray-800">Đang xử lý</option>
                            <option value="Thất bại" className="bg-gray-800">Thất bại</option>
                            <option value="Hoàn tiền" className="bg-gray-800">Hoàn tiền</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5 pointer-events-none" />
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setPaymentSearch("");
                            setPaymentStatusFilter("Tất cả trạng thái");
                            setPaymentDateFrom("");
                            setPaymentDateTo("");
                          }}
                          className="h-14 px-5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/40 shadow-lg text-base font-medium"
                        >
                          Reset
                        </Button>

                        <Button 
                          onClick={() => {
                            // Export CSV logic - use paymentTransactions from API
                            if (paymentTransactions.length === 0) {
                              showToast("Thông báo", "Không có dữ liệu để xuất", "info");
                              return;
                            }
                            const headers = ["Mã đơn", "Thời gian", "Gói", "Số tiền", "Phương thức", "Trạng thái", "Mã giao dịch"];
                            const rows = paymentTransactions.map((t) => [
                              `"${t.id || ""}"`,
                              `"${t.time || ""}"`,
                              `"${t.package || ""}"`,
                              `"${(t.amount || "").toString().replace(/,/g, ".")}"`,
                              `"${t.method || ""}"`,
                              `"${t.status || ""}"`,
                              `"${t.txId || ""}"`,
                            ]);
                            let csvContent = "\uFEFF" + [headers, ...rows].map((e) => e.join(",")).join("\n");
                            const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "payment_history.csv");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            showToast("Thành công", `Đã xuất ${paymentTransactions.length} giao dịch`, "success");
                          }}
                          disabled={paymentsLoading}
                          className="h-14 px-5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2 text-base font-medium disabled:opacity-50"
                        >
                          <Download className="w-5 h-5" /> Xuất CSV
                        </Button>
                      </div>

                      {/* Date Filter Row */}
                      <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-white/20 border border-white/10">
                        <div className="flex items-center gap-2 shrink-0">
                          <Calendar className="w-5 h-5 text-white/80" />
                          <span className="text-white/90 text-base font-medium tracking-wide px-1">Lọc theo ngày:</span>
                        </div>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <DateInput
                              value={paymentDateFrom}
                              onChange={setPaymentDateFrom}
                            />
                          </div>
                          <span className="text-white/70 text-xl shrink-0 px-1">→</span>
                          <div className="flex-1 min-w-0">
                            <DateInput
                              value={paymentDateTo}
                              onChange={setPaymentDateTo}
                            />
                          </div>
                        </div>
                        {(paymentDateFrom || paymentDateTo) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setPaymentDateFrom(""); setPaymentDateTo(""); }}
                            className="h-11 text-sm text-white/90 hover:text-white hover:bg-white/20 px-4 shrink-0"
                          >
                            <X className="w-4 h-4 mr-1" /> Xóa lọc
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Payment History Table */}
                    <div className="border-t border-white/20 pt-6">
                      <PaymentHistory
                        transactions={paymentTransactions}
                        search={paymentSearch}
                        statusFilter={paymentStatusFilter}
                        dateFrom={paymentDateFrom}
                        dateTo={paymentDateTo}
                        loading={paymentsLoading}
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Nâng cấp gói Section */}
            {activeMenu === "upgrade" && (
              <section className="space-y-6">
                <Card className="bg-white/20 backdrop-blur-md border border-white/25 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.3)]">
                  <CardContent className="p-8">
                    <div className="mb-6">
                      <h1 className="text-2xl font-semibold text-white mb-1 drop-shadow-lg">Nâng cấp gói</h1>
                      <p className="text-sm text-white/80">Chọn gói phù hợp với nhu cầu của bạn</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {plansLoading ? (
                        // Loading skeleton
                        [1, 2, 3].map((i) => (
                          <div key={i} className="p-6 rounded-2xl bg-white/20 border border-white/25 animate-pulse">
                            <div className="h-6 bg-white/30 rounded mb-4 w-1/2"></div>
                            <div className="h-10 bg-white/30 rounded mb-6 w-3/4"></div>
                            <div className="space-y-3 mb-6">
                              {[1, 2, 3].map((j) => (
                                <div key={j} className="h-4 bg-white/30 rounded"></div>
                              ))}
                            </div>
                            <div className="h-12 bg-white/30 rounded"></div>
                          </div>
                        ))
                      ) : (
                        subscriptionPlans.map((plan, index) => {
                          const isPopular = index === 1;
                          const isCurrentPlan = currentPackage === plan.planName;
                          const features = (() => {
                            if (!plan.features) return [];
                            // Handle JSON array string like "[\"item1\", \"item2\"]"
                            if (typeof plan.features === 'string' && plan.features.startsWith('[')) {
                              try {
                                return JSON.parse(plan.features);
                              } catch { return []; }
                            }
                            // Handle newline-separated string
                            return plan.features.split('\n').filter(f => f.trim());
                          })();
                          
                          return (
                            <div 
                              key={plan.planId}
                              className={`p-6 rounded-2xl transition-colors relative ${
                                isPopular 
                                  ? "bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/50" 
                                  : "bg-white/20 border border-white/25 hover:border-yellow-500/50"
                              }`}
                            >
                              {isPopular && (
                                <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                  Phổ biến
                                </div>
                              )}
                              <div className="mb-4">
                                <h3 className="text-xl font-semibold text-white mb-2">{plan.planName}</h3>
                                <div className="text-3xl font-bold text-yellow-400 mb-1">
                                  {plan.price.toLocaleString('vi-VN')}đ
                                </div>
                                <div className="text-sm text-white/80">/tháng</div>
                              </div>
                              <ul className="space-y-2 mb-6 text-sm text-white/70">
                                {features.length > 0 ? (
                                  features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-center gap-2">
                                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${isPopular ? "text-yellow-400" : "text-emerald-400"}`} />
                                      <span>{feature}</span>
                                    </li>
                                  ))
                                ) : (
                                  <>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${isPopular ? "text-yellow-400" : "text-emerald-400"}`} />
                                      <span>{plan.maxGardens ? `Tối đa ${plan.maxGardens} vườn` : 'Không giới hạn vườn'}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${isPopular ? "text-yellow-400" : "text-emerald-400"}`} />
                                      <span>{plan.maxTreesPerGarden ? `Tối đa ${plan.maxTreesPerGarden} cây/vườn` : 'Không giới hạn cây'}</span>
                                    </li>
                                  </>
                                )}
                              </ul>
                              <Button
                                className={`w-full h-12 rounded-xl font-medium ${
                                  isCurrentPlan
                                    ? "bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/40 shadow-lg"
                                    : isPopular
                                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                    : "bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/40 shadow-lg"
                                }`}
                                disabled={isCurrentPlan}
                                onClick={() => !isCurrentPlan && handleUpgradePlan(plan)}
                              >
                                {isCurrentPlan ? "Gói hiện tại" : "Nâng cấp ngay"}
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Staffs - TẠM THỜI ẨN (để bật lại: bỏ comment và đổi false thành true) */}
            <section>
            {false && (
            <Card className="bg-white rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-neutral-200/60">
              <CardContent className="p-8">
              <div className="mb-3">
  {/* Hàng 1: tiêu đề + CTA, luôn gọn gàng */}
  <div className="flex items-center justify-between gap-3">
    <div className="text-base font-semibold">Nhân viên & phân công</div>
    <Button
      className={`${COMPACT.btn} ${BTN.primary} ${BTN.base} gap-2 shrink-0`}
      onClick={openStaffModal}
      title="Tạo tài khoản nhân viên"
    >
      <Plus className="h-5 w-5" /> Thêm nhân viên
    </Button>
  </div>

  {/* Hàng 2: bộ lọc + tìm kiếm, cho phép xuống dòng khi thiếu chỗ */}
  <div className="mt-2 flex items-center gap-2 flex-wrap xl:flex-nowrap">
    <select
      value={staffGardenFilter}
      onChange={(e) => setStaffGardenFilter(e.target.value)}
      className={`${COMPACT.select} w-[220px] shrink-0`}
      title="Lọc theo vườn"
    >
      <option value="all">Tất cả vườn</option>
      <option value="__none">Chưa phân công</option>
      {gardens.map((g, i) => (
        <option key={i} value={g.name}>
          {g.name}
        </option>
      ))}
    </select>

    <select
      value={staffStatusFilter}
      onChange={(e) => setStaffStatusFilter(e.target.value)}
      className={`${COMPACT.select} w-[200px] md:w-[220px] shrink-0`}
      title="Lọc theo trạng thái"
    >
      <option value="all">Tất cả trạng thái</option>
      <option value="active">Đang hoạt động</option>
      <option value="inactive">Tạm ngưng</option>
    </select>

    {/* Ô tìm kiếm co giãn: full chiều ngang khi cần, thu về 260/300/320px tuỳ breakpoint */}
    <SearchInput
      value={searchStaff}
      onChange={setSearchStaff}
      placeholder="Tìm tên / email / SĐT / vai trò…"
      className="w-full sm:w-[260px] md:w-[300px] xl:w-[320px]"
    />
  </div>
</div>


                <div className="space-y-2">
                  {filteredStaffs.map((s, idx) => (
                    <div key={idx} className="rounded-2xl border p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex items-start gap-3">
                          <SquareThumb src={s.avatarUrl} size={72} fallback="user" title={s.name} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-emerald-600" />
                              <div className="truncate font-medium text-neutral-900">
                                {s.name}
                              </div>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
                              {s.email ? <span>Email: {s.email}</span> : null}
                              {s.phone ? <span>SĐT: {s.phone}</span> : null}
                              <span>
                                Vai trò: <b>{s.role}</b>
                              </span>
                              <span>Phân công: {s.assigned || "—"}</span>
                              <BadgeSoft color="emerald">
                                {s.status || "active"}
                              </BadgeSoft>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            className={`${BTN.base} ${BTN.outline} h-11 px-5`}
                            onClick={() =>
                              setAssignModal({ open: true, index: idx, staff: s })
                            }
                          >
                            Phân công
                          </Button>
                          <Button
                            className={`${BTN.base} ${BTN.outline} h-11 px-5`}
                            onClick={() =>
                              setStaffDetail({ open: true, index: idx, staff: s })
                            }
                          >
                            Chi tiết
                          </Button>
                          <Button
                            className={`${BTN.base} ${BTN.outline} h-11 px-5 text-rose-600 hover:bg-rose-50`}
                            onClick={() => openConfirmDeleteStaff(s)}
                          >
                            <Trash2 className="mr-1 h-5 w-5" /> Xóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}
          </section>
</div>
        </div>
      </main>

      {/* ================== MODALS ================== */}
      <PasswordModal
        open={pwOpen}
        onClose={() => {
          setPwOpen(false);
          setPwModalTab("change"); // Reset về tab change khi đóng
        }}
        currentPassword={demoPw}
        defaultEmail={profile.email}
        userName={profile.fullName}
        initialTab={pwModalTab}
        onChanged={(newPw) => {
          setDemoPw(newPw);
          try {
            localStorage.setItem(LS_DEMO_PW, newPw);
          } catch {}
        }}
      />

      {/* Thêm vườn */}
      {addGardenOpen && (
        <GardenModal
          SELECT={SELECT}
          INPUT_OK={INPUT_OK}
          INPUT_ERR={INPUT_ERR}
          newGarden={newGarden}
          setNewGarden={setNewGarden}
          touchedGarden={touchedGarden}
          setTouchedGarden={setTouchedGarden}
          gardenErrors={gardenErrors}
          canSubmitGarden={canSubmitGarden}
          openConfirmAddGarden={openConfirmAddGarden}
          closeGardenModal={closeGardenModal}
        />
      )}

      {/* Thêm nhân viên */}
      {addStaffOpen && (
        <StaffModal
          SELECT={SELECT}
          INPUT_OK={INPUT_OK}
          INPUT_ERR={INPUT_ERR}
          gardens={gardens}
          newStaff={newStaff}
          setNewStaff={setNewStaff}
          touchedStaff={touchedStaff}
          setTouchedStaff={setTouchedStaff}
          staffErrors={staffErrors}
          canSubmitStaff={canSubmitStaff}
          openConfirmAddStaff={openConfirmAddStaff}
          closeStaffModal={closeStaffModal}
        />
      )}

      {/* Sửa vườn */}
      {editGarden.open && (
        <EditGardenModal
          open={editGarden.open}
          initial={editGarden.data}
          SELECT={SELECT}
          INPUT_OK={INPUT_OK}
          INPUT_ERR={INPUT_ERR}
          onClose={() =>
            setEditGarden({ open: false, index: -1, data: null })
          }
          onSubmit={(updated) => {
            setGardens((gs) =>
              gs.map((it, i) => (i === editGarden.index ? updated : it))
            );
            setEditGarden({ open: false, index: -1, data: null });
            showToast("Đã cập nhật vườn", updated.name);
          }}
        />
      )}

      {/* Sửa nhân viên */}
      {editStaff.open && (
  <EditStaffModal
    open={editStaff.open}
    initial={editStaff.data}
    SELECT={SELECT}
    INPUT_OK={INPUT_OK}
    INPUT_ERR={INPUT_ERR}
    
    onClose={() => {
      const idx = editStaff.index;
      // ưu tiên staff hiện có trong danh sách; nếu không có thì rơi về dữ liệu đang sửa
      const backStaff =
        (typeof idx === "number" && idx >= 0 ? (staffs[idx] || null) : null) ||
        editStaff.data;

      setEditStaff({ open: false, index: -1, data: null });
      if (backStaff) {
        setStaffDetail({ open: true, index: idx, staff: backStaff });
     }
    }}
  />
)}

      {/* Chi tiết vườn */}
      <GardenDetailModal
  open={gardenDetail.open}
  garden={gardenDetail.garden}
  staffs={staffs}
  trees={trees}
  onClose={() => setGardenDetail({ open: false, garden: null })}
  onRefresh={reloadTreesFromLS}
  formatGardenLocation={formatGardenLocation}
  onEditTree={(treeObj) => {
    setEditTree({ open:true, data: treeObj });
  }}
/>
<ErrorBoundary>
  <EditTreeModal
    open={editTree.open}
    initial={editTree.data}
    gardens={gardens}
    INPUT_OK={INPUT_OK}
    INPUT_ERR={INPUT_ERR}
    SELECT={SELECT}
    onClose={() => setEditTree({ open:false, data:null })}
    onSubmit={(updated) => {
      setTrees((ts) => ts.map((x) => x.code === (editTree.data?.code || "") ? { ...x, ...updated } : x));
      setEditTree({ open:false, data:null });
      // useEffect(save) đã lo lưu LS_TREES; nếu muốn chắc chắn:
      try { localStorage.setItem(LS_TREES, JSON.stringify(
        (trees || []).map((x) => x.code === (editTree.data?.code || "") ? { ...x, ...updated } : x)
      )); } catch {}
      showToast("Đã cập nhật cây", updated.code || "");
    }}
  />
</ErrorBoundary>

      {/* Chi tiết nhân viên (gộp Sửa & Đổi MK) */}
      <StaffDetailModal
  open={staffDetail.open}
  staff={staffDetail.staff}
  onClose={() => setStaffDetail({ open: false, index: -1, staff: null })}
  onEdit={() => {
    const baseIdx = staffs.findIndex((x) => x === staffDetail.staff);
    setEditStaff({ open: true, index: baseIdx, data: { ...staffDetail.staff } });
    setStaffDetail({ open: false, index: -1, staff: null });
  }}
  onResetPw={() => {
    const baseIdx = staffs.findIndex((x) => x === staffDetail.staff);
    setResetPwModal({ open: true, index: baseIdx, staff: staffDetail.staff });
    setStaffDetail({ open: false, index: -1, staff: null });
  }}
/>

      {/* Confirm modal */}
      <ConfirmModal
        open={confirm.open}
        title={
          confirm.type === "add-garden"
            ? "Xác nhận tạo vườn"
            : confirm.type === "add-staff"
            ? "Xác nhận tạo tài khoản"
            : confirm.type === "delete-garden"
            ? "Xác nhận xoá vườn"
            : "Xác nhận xoá nhân viên"
        }
        onClose={() => setConfirm({ open: false, type: "", payload: null })}
        onConfirm={handleConfirm}
      >
        {confirm.type === "add-garden" && (
          <>
            <div className="text-sm">
              <b>Tên vườn:</b> {confirm.payload.name}
            </div>
            <div className="text-sm">
              <b>Địa chỉ:</b> {formatGardenLocation(confirm.payload)}
            </div>
            <div className="text-sm">
              <b>Trạng thái:</b> {confirm.payload.status}
            </div>
            {confirm.payload.coverUrl ? (
              <div className="rounded-2xl overflow-hidden border">
                <SafeImage
                  src={confirm.payload.coverUrl}
                  className="w-full h-40 object-cover"
                />
              </div>
            ) : null}
          </>
        )}

        {confirm.type === "add-staff" && (
          <>
            {/* Hiển thị với placeholder theo yêu cầu */}
            <div className="text-sm">
              <b>Họ tên:</b>{" "}
              {(confirm.payload.name || "").trim() || "Không có thông tin"}
            </div>
            <div className="text-sm">
              <b>Liên hệ:</b>{" "}
              {(() => {
                const p = (confirm.payload.phone || "").trim();
                const e = (confirm.payload.email || "").trim();
                if (!p && !e) return "Không có thông tin";
                return p && e ? `${p} / ${e}` : (p || e);
              })()}
            </div>
            <div className="text-sm">
              <b>Phân công:</b>{" "}
              {(confirm.payload.assigned || "").trim() || "Chưa phân công"}
            </div>
            <div className="text-sm">
              <b>Vai trò:</b> {confirm.payload.role || "Staff"}
            </div>

            {/* Mật khẩu tạm + nút copy TK+MK (copy vào clipboard, không render nội dung chuỗi) */}
            <div className="rounded-xl border p-3 bg-neutral-50">
              <div className="text-sm">
                <b>Mật khẩu tạm:</b>{" "}
                <code className="px-2 py-1 rounded bg-white border">
                  {confirm.payload.tempPassword}
                </code>
              </div>
              <div className="mt-2">
                <Button
                  className={`${BTN.base} ${BTN.outline} h-11 px-5`}
                  onClick={() =>
                    copyCredentialsToClipboard(
                      preferredLoginAccount(confirm.payload),
                      confirm.payload.tempPassword
                    )
                  }
                >
                  <Copy className="h-5 w-5 mr-1" />
                  Sao chép TK + MK
                </Button>
              </div>
            </div>

            {confirm.payload.avatarUrl ? (
              <div className="rounded-2xl overflow-hidden border">
                <SafeImage
                  src={confirm.payload.avatarUrl}
                  className="w-full h-40 object-cover"
                />
              </div>
            ) : null}
          </>
        )}

        {confirm.type === "delete-garden" && (
          <>
            <div className="text-sm">
              Bạn chắc chắn muốn xoá vườn <b>{confirm.payload.name}</b>?
            </div>
            <div className="text-xs text-neutral-600">
              Địa chỉ: {formatGardenLocation(confirm.payload)}
            </div>
          </>
        )}

        {confirm.type === "delete-staff" && (
          <>
            <div className="text-sm">
              Bạn chắc chắn muốn xoá nhân viên <b>{confirm.payload.name}</b>?
            </div>
            <div className="text-xs text-neutral-600">
              {confirm.payload.email ? `Email: ${confirm.payload.email}` : ""}
              {confirm.payload.phone ? ` | SĐT: ${confirm.payload.phone}` : ""}
            </div>
          </>
        )}
      </ConfirmModal>

      <OTPModal
  open={otpState.open}
  target={otpState.target}
  sendTo={profile.email}
  onClose={closeOtp}
  onVerified={() => {
    setAllowEditContact((s) => ({ ...s, [otpState.target]: true }));
    showToast(
      "Xác minh thành công",
      otpState.target === "email" ? "Bạn có thể đổi Email" : "Bạn có thể đổi SĐT",
      "success"
    );
  }}
/>
{/* EditTreeModal được định nghĩa ở dưới file (ngoài JSX) */}




      {/* Assign + Reset Password */}
      <AssignStaffModal
  open={assignModal.open}
  staff={assignModal.staff}
  gardens={gardens}
  onClose={() => setAssignModal({ open: false, index: -1, staff: null })}
  onConfirm={(gardenName) => {
    setStaffs((ss) => {
      const baseIdx = ss.findIndex((x) => x === assignModal.staff);
      return ss.map((it, i) => (i === baseIdx ? { ...it, assigned: gardenName } : it));
    });
    setAssignModal({ open: false, index: -1, staff: null });
    showToast("Đã phân công", `Giao ${assignModal.staff?.name} quản lý ${gardenName}`);
  }}
/>

<ResetStaffPwModal
  open={resetPwModal.open}
  staff={resetPwModal.staff}
  onClose={() => setResetPwModal({ open: false, index: -1, staff: null })}
  onConfirmed={(newPw) => {
    setStaffs((ss) => {
      const baseIdx = ss.findIndex((x) => x === resetPwModal.staff);
      return ss.map((it, i) => (i === baseIdx ? { ...it, tempPassword: newPw } : it));
    });
    // Modal tự hiển thị trạng thái thành công + nút copy
  }}
/>

      {/* Toast xác nhận */}
      <Toast
        open={toast.open}
        title={toast.title}
        desc={toast.desc}
        variant={toast.variant}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
}
function EditTreeModal({
  open,
  initial,
  gardens = [],
  onClose,
  onSubmit,
  INPUT_OK = "h-14 w-full rounded-xl bg-white border border-neutral-300 placeholder:text-neutral-400 text-base focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500",
  INPUT_ERR = "h-14 w-full rounded-xl bg-white border border-rose-500 placeholder:text-neutral-400 text-base focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500",
  SELECT = "h-14 w-full rounded-2xl border bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500",
}) {
  const blank = {
    code: "",
    speciesKey: "",
    speciesLabel: "",
    variety: "",
    gardenName: "",
    status: "",
    soil: "",
    plantDate: "",
    preAge: 0,
    region: "",
    phase: "",
    image: "",
  };

  const [form, setForm] = useState({ ...blank, ...(initial || {}) });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!open) return;
    setForm({ ...blank, ...(initial || {}) });
    setTouched({});
  }, [open, initial]);

  if (!open) return null;

  // Nếu thiếu initial -> hiện thông báo thay vì crash
  if (!initial || typeof initial !== "object") {
    return (
      <div className="fixed inset-0 z-[1350] grid place-items-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e)=>e.stopPropagation()}>
          <div className="text-lg font-semibold text-rose-700 mb-1">Không tìm thấy cây cần sửa</div>
          <div className="text-sm text-neutral-700">Bản ghi có thể đã bị xoá hoặc mã cây không hợp lệ.</div>
          <div className="mt-4 flex justify-end">
            <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </div>
    );
  }

  // Validate tối thiểu
  const errs = {
    code: !String(form.code || "").trim() ? "Mã cây là bắt buộc" : "",
    gardenName: !String(form.gardenName || "").trim() ? "Chọn vườn" : "",
  };
  const canSave = !errs.code && !errs.gardenName;

  return (
    <div className="fixed inset-0 z-[1350] grid place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">
            Sửa thông tin cây — <span className="text-emerald-700">{initial.code}</span>
          </div>
          <button className="rounded p-1 hover:bg-neutral-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Mã cây</FieldLabel>
              <Input
                className={!touched.code ? INPUT_OK : errs.code ? INPUT_ERR : INPUT_OK}
                value={form.code}
                onChange={(e)=>setForm({...form, code: e.target.value})}
                onBlur={()=>setTouched(t=>({...t, code:true}))}
                placeholder="VD: XC-01"
              />
              {touched.code && errs.code ? (
                <p className="mt-1 text-xs text-rose-600">{errs.code}</p>
              ) : null}
            </div>

            <div>
              <FieldLabel required>Vườn</FieldLabel>
              <select
                className={SELECT}
                value={form.gardenName}
                onChange={(e)=>setForm({...form, gardenName: e.target.value})}
                onBlur={()=>setTouched(t=>({...t, gardenName:true}))}
              >
                <option value="">(Chưa chọn)</option>
                {gardens.map((g,i)=>(<option key={i} value={g.name}>{g.name}</option>))}
              </select>
              {touched.gardenName && errs.gardenName ? (
                <p className="mt-1 text-xs text-rose-600">{errs.gardenName}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Loài</FieldLabel>
              <Input
                className={INPUT_OK}
                value={form.speciesLabel}
                onChange={(e)=>setForm({...form, speciesLabel: e.target.value})}
                placeholder="VD: Bưởi / Sầu riêng…"
              />
            </div>
            <div>
              <FieldLabel>Giống</FieldLabel>
              <Input
                className={INPUT_OK}
                value={form.variety}
                onChange={(e)=>setForm({...form, variety: e.target.value})}
                placeholder="VD: Da Xanh, Ri6…"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Tình trạng</FieldLabel>
              <Input
                className={INPUT_OK}
                value={form.status}
                onChange={(e)=>setForm({...form, status: e.target.value})}
                placeholder="VD: tốt / ổn định / sâu bệnh…"
              />
            </div>
            <div>
              <FieldLabel>Giai đoạn sinh trưởng</FieldLabel>
              <Input
                className={INPUT_OK}
                value={form.phase}
                onChange={(e)=>setForm({...form, phase: e.target.value})}
                placeholder="VD: Cây non / Thân lá / Ra hoa…"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Đất</FieldLabel>
              <Input
                className={INPUT_OK}
                value={form.soil}
                onChange={(e)=>setForm({...form, soil: e.target.value})}
                placeholder="VD: Đất phù sa / Đất đỏ bazan…"
              />
            </div>
            <div>
              <FieldLabel>Vùng</FieldLabel>
              <Input
                className={INPUT_OK}
                value={form.region}
                onChange={(e)=>setForm({...form, region: e.target.value})}
                placeholder="VD: Miền Bắc / Miền Tây…"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Ngày trồng</FieldLabel>
              <Input
                type="date"
                className={INPUT_OK}
                value={form.plantDate || ""}
                onChange={(e)=>setForm({...form, plantDate: e.target.value})}
              />
            </div>
            <div>
              <FieldLabel>Tuổi trước khi nhập (tháng)</FieldLabel>
              <Input
                inputMode="numeric"
                pattern="\d*"
                className={INPUT_OK}
                value={String(form.preAge ?? 0)}
                onChange={(e)=>{
                  const v = String(e.target.value).replace(/\D/g,"");
                  setForm({...form, preAge: v ? Number(v) : 0});
                }}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Ảnh cây</FieldLabel>
            <ImagePicker value={form.image} onChange={(v)=>setForm({...form, image: v})} />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button
              className="rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 text-slate-900"
              onClick={onClose}
            >
              Huỷ
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!canSave}
              onClick={()=> canSave && onSubmit(form)}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ------- Small components extracted for brevity ------- */
function EditProfileForm({
  draft,
  setDraft,
  touchedProfile,
  setTouchedProfile,
  profileErrors,
  allowEdit,
  openOtp,
  onCancel,
  onSave,
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 min-w-0">
      <div className="min-w-0">
        <FieldLabel required>Họ & tên</FieldLabel>
        <Input
          name="full-name"
          autoComplete="name"
          aria-invalid={!!(touchedProfile.fullName && profileErrors.fullName)}
          className={`${
            !touchedProfile.fullName
              ? INPUT_OK
              : profileErrors.fullName
              ? INPUT_ERR
              : INPUT_OK
          } min-w-0`}
          value={draft.fullName}
          onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
          onBlur={() => setTouchedProfile((t) => ({ ...t, fullName: true }))}
        />
        {touchedProfile.fullName && profileErrors.fullName ? (
          <p className="mt-1 text-xs text-rose-600 break-words">
            {profileErrors.fullName}
          </p>
        ) : null}
      </div>

      {/* Email + OTP gate */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <FieldLabel className="break-words min-w-0 flex-1">Email (xác minh OTP trước khi đổi)</FieldLabel>
          {allowEdit.email ? (
            <span className="text-xs text-emerald-700 whitespace-nowrap flex-shrink-0">Đã xác minh OTP ✓</span>
          ) : (
            <button
              type="button"
              className="text-xs text-emerald-700 hover:underline whitespace-nowrap flex-shrink-0"
              onClick={() => openOtp("email")}
            >
              Đổi email
            </button>
          )}
        </div>
        <Input
          type="email"
          name="profile-email"
          autoComplete="off"
          readOnly={!allowEdit.email}
          aria-invalid={!!(touchedProfile.contact && profileErrors.contact)}
          className={`${
            !touchedProfile.contact ? INPUT_OK : profileErrors.contact ? INPUT_ERR : INPUT_OK
          } min-w-0`}
          value={draft.email}
          onChange={(e) => setDraft({ ...draft, email: e.target.value })}
          onBlur={() => setTouchedProfile((t) => ({ ...t, contact: true }))}
          placeholder="name@company.com"
        />
      </div>

      <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-2 pt-1 min-w-0">
        <Button className={`${BTN.base} ${BTN.outline} w-full sm:w-auto`} onClick={onCancel}>
          Huỷ
        </Button>
        <Button className={`${BTN.base} ${BTN.primary} w-full sm:w-auto`} onClick={onSave}>
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}

function GardenModal({
  SELECT,
  INPUT_OK,
  INPUT_ERR,
  newGarden,
  setNewGarden,
  touchedGarden,
  setTouchedGarden,
  gardenErrors,
  canSubmitGarden,
  openConfirmAddGarden,
  closeGardenModal,
}) {
  // nhận thay đổi từ AddressPicker và đồng bộ cả object + string (để khớp backend)
  const onAddressChange = (val = {}) => {
  const { province, ward, address } = val;

  setNewGarden((g) => {
    // reset ward khi nhận ward === null
    const shouldResetWard = ward === null;

    return {
      ...g,
      // object đã chọn để dùng lại khi mở form
      provinceObj: province !== undefined ? province : g.provinceObj,
      wardObj: shouldResetWard ? null : (ward !== undefined ? ward : g.wardObj),

      // chuỗi hiển thị để lưu ra backend
      province:
        province
          ? (province.full_name || province.name || province.label || province.text || "")
          : g.province,
      ward: shouldResetWard
        ? ""
        : (ward
            ? (ward.full_name || ward.name || ward.label || ward.text || "")
            : g.ward),
      address: address !== undefined ? address : g.address,
    };
  });
};

  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center" onClick={closeGardenModal}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-lg font-semibold">Thêm vườn mới</div>

        <div className="space-y-3 text-sm">
          {/* Tên vườn */}
          <div>
            <FieldLabel required>Tên vườn</FieldLabel>
            <Input
              aria-invalid={!!(touchedGarden.name && gardenErrors.name)}
              className={!touchedGarden.name ? INPUT_OK : gardenErrors.name ? INPUT_ERR : INPUT_OK}
              value={newGarden.name}
              onChange={(e) => setNewGarden({ ...newGarden, name: e.target.value })}
              onBlur={() => setTouchedGarden((t) => ({ ...t, name: true }))}
              placeholder="VD: Vườn số 1 FPT"
            />
            {touchedGarden.name && gardenErrors.name && (
              <p className="mt-1 text-xs text-rose-600">{gardenErrors.name}</p>
            )}
          </div>

          {/* ĐỊA CHỈ — AddressPicker với gợi ý & khóa bắt buộc chọn */}
          <div className="rounded-2xl border p-3">
            <div className="mb-2 text-[13px] font-medium text-neutral-700">
              Địa chỉ vườn (bắt buộc chọn từ gợi ý)
            </div>

            {/* 
              AddressPicker: component của bạn.
              Yêu cầu:
              - Gõ để ra gợi ý (tỉnh, quận/huyện, phường/xã)
              - lockToSuggestion: không cho “tự gõ linh tinh”
              - Dùng dataset TTHC VN cập nhật (file useVnAdmin bạn đã có)
            */}
            <AddressPicker
  value={{
    province: newGarden.provinceObj,
    ward: newGarden.wardObj,
    address: newGarden.address,
  }}
  onChange={onAddressChange}
  lockToSuggestion={true}
  required={true}
  inputClassOk={INPUT_OK}
  inputClassErr={INPUT_ERR}
  placeholders={{
    province: "VD: Hà Nội",
    ward: "VD: Dịch Vọng / Thạch Hoà…",
    address: "Số nhà / Đường / Khu",
  }}
  /* ✅ chỉ đỏ sau khi bạn bấm TẠO VƯỜN (đã set touched) */
  invalidProvince={!!(touchedGarden.province && gardenErrors.province)}
  invalidWard={!!(touchedGarden.ward && gardenErrors.ward)}
  invalidAddress={!!(touchedGarden.address && gardenErrors.address)}
/>

            {/* hiển thị lỗi dưới từng trường (dựa vào touched + errors) */}
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                {touchedGarden.province && gardenErrors.province && (
                  <p className="text-xs text-rose-600">{gardenErrors.province}</p>
                )}
              </div>
              
              <div>
                {touchedGarden.ward && gardenErrors.ward && (
                  <p className="text-xs text-rose-600">{gardenErrors.ward}</p>
                )}
              </div>
              <div>
                {touchedGarden.address && gardenErrors.address && (
                  <p className="text-xs text-rose-600">{gardenErrors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <FieldLabel>Trạng thái</FieldLabel>
            <select
              value={newGarden.status}
              onChange={(e) => setNewGarden({ ...newGarden, status: e.target.value })}
              className={SELECT}
            >
              <option>Đang hoạt động</option>
              <option>Dừng hoạt động</option>
            </select>
          </div>

          {/* Ảnh vườn */}
          <div>
            <FieldLabel>Ảnh vườn</FieldLabel>
            <ImagePicker
              value={newGarden.coverUrl}
              onChange={(v) => setNewGarden({ ...newGarden, coverUrl: v })}
            />
          </div>

          {/* Action */}
          <div className="mt-2 flex justify-end gap-2">
            <Button className="rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 text-slate-900" onClick={closeGardenModal}>
              Huỷ
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!canSubmitGarden}
              onClick={() => {
                // ép show lỗi nếu người dùng chưa chọn từ gợi ý
                setTouchedGarden({ name: true, province: true, ward: true, address: true });

                if (!canSubmitGarden) return;
                openConfirmAddGarden();
              }}
            >
              Tạo vườn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaffModal({
  SELECT,
  INPUT_OK,
  INPUT_ERR,
  gardens,
  newStaff,
  setNewStaff,
  touchedStaff,
  setTouchedStaff,
  staffErrors,
  canSubmitStaff,
  openConfirmAddStaff,
  closeStaffModal,
}) {
  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center" onClick={closeStaffModal}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-lg font-semibold">Thêm nhân viên</div>
        <div className="space-y-3 text-sm">
          <div>
            <FieldLabel required>Họ tên</FieldLabel>
            <Input
              aria-invalid={!!(touchedStaff.name && staffErrors.name)}
              className={!touchedStaff.name ? INPUT_OK : staffErrors.name ? INPUT_ERR : INPUT_OK}
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              onBlur={() => setTouchedStaff((t) => ({ ...t, name: true }))}
              placeholder="VD: Nguyễn Văn A"
            />
            {touchedStaff.name && staffErrors.name && (
              <p className="mt-1 text-xs text-rose-600">{staffErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Email (ít nhất 1 trong 2: Email/SĐT)</FieldLabel>
              <Input
                type="email"
                name="staff-email"
                autoComplete="email"
                aria-invalid={!!(touchedStaff.contact && staffErrors.contact)}
                className={
                  !touchedStaff.contact ? INPUT_OK : staffErrors.contact ? INPUT_ERR : INPUT_OK
                }
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                onBlur={() => setTouchedStaff((t) => ({ ...t, contact: true }))}
                placeholder="name@company.com"
              />
            </div>
            <div>
              <FieldLabel>Số điện thoại</FieldLabel>
              <Input
                type="tel"
                name="staff-phone"
                autoComplete="tel"
                inputMode="numeric"
                pattern="\d*"
                aria-invalid={!!(touchedStaff.contact && staffErrors.contact)}
                className={
                  !touchedStaff.contact ? INPUT_OK : staffErrors.contact ? INPUT_ERR : INPUT_OK
                }
                value={newStaff.phone}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, phone: e.target.value.replace(/\D/g, "") })
                }
                onBlur={() => setTouchedStaff((t) => ({ ...t, contact: true }))}
                placeholder="0xxxxxxxxx"
              />
              {touchedStaff.contact && staffErrors.contact && (
                <p className="mt-1 text-xs text-rose-600">{staffErrors.contact}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Mật khẩu tạm</FieldLabel>
              <div className="flex gap-2">
                <Input
                  aria-invalid={!!(touchedStaff.tempPassword && staffErrors.tempPassword)}
                  className={
                    !touchedStaff.tempPassword ? INPUT_OK : staffErrors.tempPassword ? INPUT_ERR : INPUT_OK
                  }
                  value={newStaff.tempPassword}
                  onChange={(e) => setNewStaff({ ...newStaff, tempPassword: e.target.value })}
                  onBlur={() => setTouchedStaff((t) => ({ ...t, tempPassword: true }))}
                  placeholder="Tối thiểu 8 ký tự"
                />
                <Button
                  className={`${BTN.base} ${BTN.outline}`}
                  type="button"
                  onClick={() =>
                    setNewStaff((s) => ({ ...s, tempPassword: genPassword() }))
                  }
                >
                  Tạo ngẫu nhiên
                </Button>
              </div>
              {touchedStaff.tempPassword && staffErrors.tempPassword && (
                <p className="mt-1 text-xs text-rose-600">
                  {staffErrors.tempPassword}
                </p>
              )}
            </div>
            <div>
              <FieldLabel>Phân công vườn (không bắt buộc)</FieldLabel>
              <select
                value={newStaff.assigned}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, assigned: e.target.value })
                }
                className={SELECT}
              >
                <option value="">(Chưa chọn)</option>
                {gardens.map((g, i) => (
                  <option key={i} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <FieldLabel>Ảnh nhân viên</FieldLabel>
            <ImagePicker
              value={newStaff.avatarUrl}
              onChange={(v) => setNewStaff({ ...newStaff, avatarUrl: v })}
            />
          </div>

          <div>
            <FieldLabel>Vai trò</FieldLabel>
            <Input className={INPUT_OK} value="Staff" readOnly />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button className={`${BTN.base} ${BTN.outline}`} onClick={closeStaffModal}>
              Huỷ
            </Button>
            <Button
              className={`${BTN.base} ${BTN.primary}`}
              disabled={!canSubmitStaff}
              onClick={openConfirmAddStaff}
            >
              Tạo tài khoản
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DateInput Component (từ AddTreeNewScreen)
========================================================= */
function DateInput({ value, onChange, error }) {
  const [parts, setParts] = React.useState(() => parseIsoToParts(value));
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);
  const dayRef = React.useRef(null);
  const monthRef = React.useRef(null);
  const yearRef = React.useRef(null);

  const today = new Date();

  React.useEffect(() => {
    setParts(parseIsoToParts(value));
  }, [value]);

  React.useEffect(() => {
    const handleClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        commitParts();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [parts]);

  function parseIsoToParts(iso) {
    if (!iso) return { d: "", m: "", y: "" };
    const [y, m, d] = iso.split("-");
    return { d: d || "", m: m || "", y: y || "" };
  }

  function getDaysInMonthSafe(yearStr, monthStr) {
    const monthNum = Number(monthStr);
    if (!monthNum || monthNum < 1 || monthNum > 12) return 31;
    const yearNum = Number(yearStr);
    if (!yearStr || String(yearStr).length < 4 || !yearNum) {
      if ([1, 3, 5, 7, 8, 10, 12].includes(monthNum)) return 31;
      if ([4, 6, 9, 11].includes(monthNum)) return 30;
      if (monthNum === 2) return 29;
    }
    return new Date(yearNum, monthNum, 0).getDate();
  }

  function buildIsoFromParts({ d, m, y }) {
    if (!d || !m || !y) return "";
    if (y.length !== 4) return "";
    const dayNum = Number(d);
    const monthNum = Number(m);
    const yearNum = Number(y);
    if (!dayNum || !monthNum || !yearNum) return "";
    const dt = new Date(yearNum, monthNum - 1, dayNum);
    if (
      dt.getFullYear() !== yearNum ||
      dt.getMonth() !== monthNum - 1 ||
      dt.getDate() !== dayNum
    ) {
      return "";
    }
    return `${String(yearNum).padStart(4, "0")}-${String(monthNum).padStart(
      2,
      "0"
    )}-${String(dayNum).padStart(2, "0")}`;
  }

  function commitParts() {
    const iso = buildIsoFromParts(parts);
    if (!iso) {
      onChange("");
      setParts({ d: "", m: "", y: "" });
    } else {
      onChange(iso);
      setParts(parseIsoToParts(iso));
    }
  }

  function getDaysInMonth(y, m) {
    const yearNum = Number(y);
    const monthNum = Number(m);
    if (!yearNum || !monthNum) return 31;
    return new Date(yearNum, monthNum, 0).getDate();
  }

  function handleSegmentChange(segment, raw) {
    const onlyDigits = raw.replace(/\D/g, "");
    const maxLen = segment === "y" ? 4 : 2;
    let v = onlyDigits.slice(0, maxLen);

    setParts((prev) => {
      const next = { ...prev };

      if (segment === "d") {
        if (!v) {
          next.d = "";
          return next;
        }
        if (v.length === 1) {
          next.d = v;
          return next;
        }
        v = v.slice(0, 2);
        let num = Number(v) || 0;
        if (num === 0) num = 1;
        const limit = getDaysInMonthSafe(prev.y || "", prev.m || "");
        if (num > limit) num = limit;
        if (v[0] === "0" && num < 10) {
          next.d = "0" + String(num);
        } else {
          next.d = String(num);
        }
      } else if (segment === "m") {
        if (!v) {
          next.m = "";
          return next;
        }
        if (v.length === 1) {
          next.m = v;
          return next;
        }
        v = v.slice(0, 2);
        let num = Number(v) || 0;
        if (num === 0) num = 1;
        if (num > 12) num = 12;
        if (v[0] === "0" && num < 10) {
          next.m = "0" + String(num);
        } else {
          next.m = String(num);
        }
        if (next.d && next.d.length === 2) {
          const limit = getDaysInMonthSafe(prev.y || "", next.m);
          const dayNum = Number(next.d) || 0;
          if (dayNum > limit) {
            let adjusted = limit;
            if (adjusted < 10) next.d = "0" + String(adjusted);
            else next.d = String(adjusted);
          }
        }
      } else if (segment === "y") {
        next.y = v;
        if (v.length === 4 && next.d && next.m && next.d.length === 2) {
          const limit = getDaysInMonthSafe(v, next.m);
          const dayNum = Number(next.d) || 0;
          if (dayNum > limit) {
            let adjusted = limit;
            if (adjusted < 10) next.d = "0" + String(adjusted);
            else next.d = String(adjusted);
          }
        }
      }

      return next;
    });
  }

  function handleKeyDown(e, current) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (current === "d" && monthRef.current) {
        monthRef.current.focus();
      } else if (current === "m" && yearRef.current) {
        yearRef.current.focus();
      } else if (current === "y") {
        commitParts();
        setOpen(false);
        yearRef.current?.blur();
      }
    }
  }

  const selected = value ? new Date(value + "T00:00:00") : null;
  const [month, setMonth] = React.useState(
    selected ? selected.getMonth() : today.getMonth()
  );
  const [year, setYear] = React.useState(
    selected ? selected.getFullYear() : today.getFullYear()
  );

  React.useEffect(() => {
    if (selected) {
      setMonth(selected.getMonth());
      setYear(selected.getFullYear());
    }
  }, [value]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array.from({ length: firstDay }).map((_, i) => i);
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1);

  const monthNames = [
    "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
    "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
  ];

  function pickDay(day) {
    const iso = buildIsoFromParts({
      d: String(day),
      m: String(month + 1),
      y: String(year),
    });
    if (!iso) return;
    onChange(iso);
    setParts(parseIsoToParts(iso));
    setOpen(false);
  }

  return (
    <div
      className="relative w-full min-w-0"
      ref={wrapRef}
      data-mm-date-open={open ? "1" : undefined}
    >
      <div
        className={
          "flex items-center w-full min-w-0 rounded-xl border bg-slate-800/60 h-14 px-3 overflow-hidden " +
          (error
            ? "border-rose-500 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/40"
            : "border-emerald-400/40 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-500/40")
        }
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-1 flex-1 min-w-0 justify-center">
          <input
            ref={dayRef}
            value={parts.d}
            onChange={(e) => handleSegmentChange("d", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "d")}
            onFocus={() => setOpen(true)}
            placeholder="Ngày"
            inputMode="numeric"
            className="min-w-[1.25rem] flex-1 max-w-[2.5rem] bg-transparent border-none outline-none text-center placeholder:text-white/50 text-white text-base tracking-wider"
          />
          <span className="text-white/50 shrink-0">/</span>
          <input
            ref={monthRef}
            value={parts.m}
            onChange={(e) => handleSegmentChange("m", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "m")}
            onFocus={() => setOpen(true)}
            placeholder="Tháng"
            inputMode="numeric"
            className="min-w-[1.25rem] flex-1 max-w-[2.5rem] bg-transparent border-none outline-none text-center placeholder:text-white/50 text-white text-base tracking-wider"
          />
          <span className="text-white/50 shrink-0">/</span>
          <input
            ref={yearRef}
            value={parts.y}
            onChange={(e) => handleSegmentChange("y", e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "y")}
            onFocus={() => setOpen(true)}
            placeholder="Năm"
            inputMode="numeric"
            className="min-w-[2rem] flex-1 max-w-[3.5rem] bg-transparent border-none outline-none text-center placeholder:text-white/50 text-white text-base tracking-wider"
          />
        </div>
      </div>

      {open && (
        <div
          className="absolute left-0 mt-1 w-full max-w-[18rem] min-w-[16rem] rounded-xl border bg-white shadow-xl z-[1600] p-3 overflow-hidden"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation();
            }
          }}
          style={{ maxWidth: 'min(18rem, calc(100vw - 2rem))' }}
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              className="px-2 py-1 text-xs rounded-lg border bg-neutral-50 hover:bg-neutral-100"
              onClick={() => {
                if (month === 0) {
                  setMonth(11);
                  setYear((y) => y - 1);
                } else setMonth((m) => m - 1);
              }}
            >
              ←
            </button>
            <div className="text-sm font-medium">
              {monthNames[month]} {year}
            </div>
            <button
              type="button"
              className="px-2 py-1 text-xs rounded-lg border bg-neutral-50 hover:bg-neutral-100"
              onClick={() => {
                if (month === 11) {
                  setMonth(0);
                  setYear((y) => y + 1);
                } else setMonth((m) => m + 1);
              }}
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[11px] text-center text-neutral-500 mb-1">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-sm">
            {blanks.map((b) => (
              <div key={`b-${b}`} />
            ))}
            {days.map((d) => {
              const isSelected =
                selected &&
                d === selected.getDate() &&
                month === selected.getMonth() &&
                year === selected.getFullYear();
              const isToday =
                !selected &&
                d === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              let extraClass = "";
              if (isSelected) {
                extraClass = "bg-emerald-500 text-white";
              } else if (isToday) {
                extraClass = "border border-emerald-500 text-emerald-700 font-semibold";
              } else {
                extraClass = "hover:bg-emerald-50 text-neutral-800";
              }

              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => pickDay(d)}
                  className={
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs " +
                    extraClass
                  }
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-rose-400 break-words min-w-0">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   Utils
========================================================= */
function genPassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@$!%*?&";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
function genOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
} 
