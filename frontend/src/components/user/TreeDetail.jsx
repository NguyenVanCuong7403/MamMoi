import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LivingBackground } from "@/components/background";
import {
  Sprout,
  Calendar,
  MapPin,
  Hash,
  User as UserIcon,
  Droplets,
  Leaf,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Upload,
  Link2,
} from "lucide-react";

/* ===== Ambient Decor (Top + Sides) & Scroll Progress ===================== */

function ScrollProgressBar() {
  const [w, setW] = React.useState(0);
  React.useEffect(() => {
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight || 1;
      const y = window.scrollY || 0;
      setW(Math.min(100, Math.max(0, (y / h) * 100)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div className="fixed top-0 inset-x-0 z-[70] h-[3px]">
      <div
        className="h-full bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-500 transition-[width] duration-150 shadow-[0_0_12px_rgba(16,185,129,.5)]"
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

function AmbientDecor() {
  return (
    <>
      <style>{`
        @keyframes mm-float { 0%{transform:translateY(0)} 50%{transform:translateY(-6px)} 100%{transform:translateY(0)} }
        @keyframes mm-pulse { 0%,100%{opacity:.6;filter:blur(24px)} 50%{opacity:.85;filter:blur(30px)} }
      `}</style>

      {/* Aurora + wave ở TOP */}
      <div className="pointer-events-none fixed inset-x-0 -top-20 z-[1]">
        <div className="relative mx-auto max-w-[1800px]">
          <div className="absolute left-1/2 -translate-x-1/2 w-[1100px] h-[260px] rounded-[999px] blur-3xl bg-gradient-to-r from-emerald-400/20 via-lime-300/10 to-emerald-500/20 animate-[mm-pulse_6s_ease-in-out_infinite]" />
          <svg viewBox="0 0 1200 220" className="mx-auto w-[1200px] h-[220px] opacity-70">
            <defs>
              <linearGradient id="mmWave" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.20" />
                <stop offset="50%" stopColor="#a3e635" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.20" />
              </linearGradient>
            </defs>
            <path d="M0,120 C200,40 400,200 600,120 C800,40 1000,200 1200,120 L1200,220 L0,220 Z" fill="url(#mmWave)" />
          </svg>
        </div>
      </div>

      {/* Glow trái */}
      <div className="pointer-events-none fixed left-0 top-0 h-full w-[130px] z-[1]">
        <div className="absolute left-[-50px] top-24 h-[70%] w-[220px] rounded-[999px] blur-3xl bg-gradient-to-b from-emerald-400/16 via-lime-300/12 to-emerald-600/14" />
        <div className="absolute left-6 top-1/4 w-[2px] h-1/2 rounded-full bg-gradient-to-b from-emerald-400/70 to-transparent" />
      </div>

      {/* Glow phải */}
      <div className="pointer-events-none fixed right-0 top-0 h-full w-[130px] z-[1]">
        <div className="absolute right-[-50px] top-36 h-[70%] w-[220px] rounded-[999px] blur-3xl bg-gradient-to-b from-emerald-400/16 via-lime-300/12 to-emerald-600/14" />
        <div className="absolute right-6 top-1/3 w-[2px] h-1/2 rounded-full bg-gradient-to-b from-emerald-400/70 to-transparent" />
      </div>

      {/* Icon “lá” bay nhẹ ở top center */}
      <div className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-[2] flex gap-6">
        <div className="grid place-items-center h-10 w-10 rounded-full bg-white/90 border shadow animate-[mm-float_5s_ease-in-out_infinite]" style={{ animationDelay: "0.1s" }} aria-hidden>
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600">
            <path fill="currentColor" d="M12 2C7 2 4 7 4 11c0 5 4 8 8 8s8-3 8-8c0-4-3-9-8-9Zm0 4c2.5 0 4.5 2 4.5 4.5S14.5 15 12 15 7.5 13 7.5 10.5 9.5 6 12 6Z" opacity=".08"/>
            <path fill="currentColor" d="M12.8 6.2c-2.7.2-4.5 2.2-4.6 4.7c0 2.8 2.2 5.1 5.1 5.1c2.5 0 4.5-1.9 4.7-4.6c-1.5.7-3.2.8-4.7.2c-1.7-.7-3-2-3.7-3.7c-.1-.3-.2-.6-.3-.9c.6-.5 1.9-.7 3.5-.8Z"/>
          </svg>
        </div>
        <div className="grid place-items-center h-8 w-8 rounded-full bg-white/90 border shadow animate-[mm-float_5s_ease-in-out_infinite]" style={{ animationDelay: "0.6s" }} aria-hidden>
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-lime-600">
            <path fill="currentColor" d="M12 2c-3.2 2-5 4.6-5 7.7c0 3.9 3.1 7 7 7c3.1 0 5.7-1.8 7.7-5c-3.5.3-6.3-1.2-8.1-3C12.8 7.9 11.3 5.1 12 2Z"/>
          </svg>
        </div>
      </div>
    </>
  );
}


/* =========================================================================
   Tiny UI — thẻ cơ bản (hiện đại, dễ đọc, dễ sửa)
   ========================================================================= */
const Card = ({ className = "", children }) => (
  <div
    className={
      "fx-fade rounded-3xl border border-white/10 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] " +
      className
    }
  >
    {children}
  </div>
);
const CardHeader = ({ className = "", children }) => (
  <div className={"px-6 pt-5 pb-3 border-b border-neutral-200/60 " + className}>
    {children}
  </div>
);
const CardTitle = ({ className = "", children }) => (
  <div className={"text-lg font-semibold tracking-tight " + className}>
    {children}
  </div>
);
const CardContent = ({ className = "", children }) => (
  <div className={"px-6 py-5 " + className}>{children}</div>
);
const Badge = ({ className = "", children, variant = "outline" }) => (
  <span
    className={
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
      (variant === "secondary" ? "bg-neutral-100 border-neutral-200" : "") +
      " " +
      className
    }
  >
    {children}
  </span>
);
const Button = ({
  className = "",
  children,
  onClick,
  variant,
  type = "button",
  disabled,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={
      "inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm font-medium " +
      "shadow-sm transition-all hover:shadow-md active:scale-[0.99] " +
      (disabled ? "opacity-60 cursor-not-allowed " : "") +
      (variant === "outline"
        ? "border bg-white hover:bg-neutral-50"
        : "bg-emerald-600 text-white hover:bg-emerald-700") +
      " " +
      className
    }
  >
    {children}
  </button>
);
const Input = ({ className = "", ...props }) => (
  <input
    className={
      "h-10 w-full rounded-xl border px-3.5 py-2 text-sm outline-none " +
      "focus:ring-2 focus:ring-emerald-500/70 " +
      (props.disabled ? "bg-neutral-100 cursor-not-allowed " : "") +
      className
    }
    {...props}
  />
);
const Textarea = ({ className = "", rows = 3, ...props }) => (
  <textarea
    rows={rows}
    className={
      "w-full rounded-xl border px-3.5 py-2 text-sm outline-none " +
      "focus:ring-2 focus:ring-emerald-500/70 " +
      (props.disabled ? "bg-neutral-100 cursor-not-allowed " : "") +
      className
    }
    {...props}
  />
);
const Select = ({ className = "", children, ...props }) => (
  <select
    className={
      "h-10 w-full rounded-xl border px-3.5 py-2 text-sm outline-none bg-white " +
      "focus:ring-2 focus:ring-emerald-500/70 " +
      (props.disabled ? "bg-neutral-100 cursor-not-allowed " : "") +
      className
    }
    {...props}
  >
    {children}
  </select>
);

/* =========================================================================
   Constants & Demo Data
   ========================================================================= */
const LOCATION = "fpt";
const CARETAKER = "Quân";

const STAGE_OPTIONS = [
  "Ươm cây (trước trồng)",
  "Trồng cây",
  "Ổn định bộ rễ",
  "Sinh trưởng thân lá",
  "Ra hoa",
  "Kết trái",
  "Nuôi quả",
  "Quả chín",
  "Trước thu hoạch",
];

const TYPE_THEME = {
  water: {
    name: "Tưới tiêu",
    pill: "bg-emerald-50 text-emerald-800 border-emerald-300",
    edge: "border-emerald-500",
    activeBtn: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  fert: {
    name: "Phân bón",
    pill: "bg-amber-50 text-amber-800 border-amber-300",
    edge: "border-amber-500",
    activeBtn: "bg-amber-600 text-white hover:bg-amber-700",
  },
  pest: {
    name: "Sâu bệnh",
    pill: "bg-rose-50 text-rose-800 border-rose-300",
    edge: "border-rose-500",
    activeBtn: "bg-rose-600 text-white hover:bg-rose-700",
  },
};

const STATUS_THEME = {
  active: {
    pill: "bg-emerald-50 text-emerald-800 border-emerald-300",
    title: "Đang chăm sóc",
    desc: "Cây tiếp tục nhận nhắc việc, gợi ý và tính quá hạn bình thường.",
  },
  stopped: {
    pill: "bg-rose-50 text-rose-800 border-rose-300",
    title: "Dừng hoạt động",
    desc: "Ngừng mọi nhắc việc/gợi ý. Cây chỉ hiển thị để tra cứu lịch sử.",
  },
};

const TREES = {
  "T-001": {
    id: "T-001",
    name: "Xoài Cát Chu",
    variety: "Giống địa phương",
    plantedAt: "2023-04-15",
    preNurseryAgeMonths: 5,
    phase: "Sinh trưởng thân lá",
    status: "active",
    location: LOCATION,
    plot: "Vườn số 1 — FPT",
    region: "Miền Nam",
    soil: "Đất phù sa cao ráo",
    gallery: [
      "https://images.unsplash.com/photo-1591781862772-b0b6b1f88b68?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKER,
    planned: [
      {
        id: 101,
        type: "water",
        title: "Tưới giữ ẩm 70–80%",
        due: "2025-10-15",
        details: ["10–12L/cây", "Kiểm tra ẩm 20–30cm"],
      },
      {
        id: 102,
        type: "fert",
        title: "Bón gốc NPK 16-16-8",
        due: "2025-10-18",
        details: ["200–300g/cây", "Rải đều theo tán"],
      },
      {
        id: 103,
        type: "pest",
        title: "Theo dõi rầy chổng cánh",
        due: "2025-10-20",
        details: ["Bẫy dính vàng", "Ghi ảnh mẫu"],
      },
    ],
    phenology: {
      stage: "Sinh trưởng thân lá",
      status: "Lá xanh, tán thoáng; một vài lá vàng nhẹ",
      prevCare: "Tưới 2 ngày/lần; bón hữu cơ 1 tháng/lần",
      leafRootNote: "Lá bánh tẻ xanh; rễ trắng khoẻ; gốc sạch",
      seasonNote: "Đầu mùa khô; nhiệt độ 32–34°C; gió nhẹ",
      workLog: "10/10 tỉa chồi; 09/10 tưới 12L; 05/10 bón hữu cơ",
      events: [
        { d: "2025-10-10", note: "Quả chín (mốc sinh học)" },
        { d: "2025-09-28", note: "Kết trái" },
        { d: "2025-08-05", note: "Ra hoa" },
      ],
    },
  },
  "T-003": {
    id: "T-003",
    name: "Bưởi Da Xanh",
    variety: "Da xanh",
    plantedAt: "2020-08-20",
    preNurseryAgeMonths: 8,
    phase: "Nuôi quả — trước thu hoạch",
    status: "active",
    location: LOCATION,
    plot: "Vườn số 3 — FPT",
    region: "Miền Nam",
    soil: "Đất thịt thoát nước tốt",
    gallery: [
      "https://images.unsplash.com/photo-1613758947306-0cb0d585b9d6?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKER,
    planned: [
      {
        id: 201,
        type: "water",
        title: "Tưới giữ ẩm 70–80%",
        due: "2025-10-16",
        details: ["8–10L/cây"],
      },
      {
        id: 202,
        type: "pest",
        title: "Theo dõi bệnh Greening",
        due: "2025-10-17",
        details: ["Khảo sát lá, ghi chép"],
      },
    ],
    phenology: {
      stage: "Nuôi quả",
      status: "Quả cỡ 8–10 cm, lá bóng; sinh trưởng ổn",
      prevCare: "Bao trái lứa 1; tưới định kỳ 2–3 ngày/lần",
      leafRootNote: "Lá bánh tẻ, không cháy mép; rễ trắng khoẻ",
      seasonNote: "Cuối mùa mưa; mưa rải rác",
      workLog: "16/10 khảo sát Greening; 14/10 tưới 9L/cây",
      events: [
        { d: "2025-10-02", note: "Bao trái lứa 2" },
        { d: "2025-09-05", note: "Tỉa quả nhỏ" },
      ],
    },
  },
};

/* =========================================================================
   Helpers
   ========================================================================= */
function monthsBetween(aStr, b = new Date()) {
  const a = new Date(aStr + "T00:00:00");
  let m =
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
}
function normalizeDetails(details) {
  if (Array.isArray(details))
    return details
      .map((s) => String(s).replace(/^\s*\d+\.\s*/, "").trim())
      .filter(Boolean);
  return String(details || "")
    .split(/\r?\n/)
    .map((s) => s.replace(/^\s*\d+\.\s*/, "").trim())
    .filter(Boolean);
}
function detailsToPlain(details) {
  return Array.isArray(details) ? details.join(" ") : String(details || "");
}
function addMonths(d, n) {
  try {
    const dt = new Date(d + "T00:00:00");
    dt.setMonth(dt.getMonth() + n);
    return dt.toISOString().slice(0, 10);
  } catch {
    return d;
  }
}
function eventsToText(arr) {
  return (arr || []).map((e) => `${e.d} — ${e.note}`).join("\n");
}
function isYYYYMMDD(d) {
  return (
    d &&
    d.length === 10 &&
    d[4] === "-" &&
    d[7] === "-" &&
    !isNaN(new Date(d + "T00:00:00").getTime())
  );
}
function parseEvents(t) {
  return String(t || "")
    .replaceAll("\r", "")
    .split("\n")
    .map((s) => {
      const line = s.trim();
      if (line.length < 12) return null;
      const date = line.slice(0, 10);
      let rest = line.slice(10).trim();
      if (rest.startsWith("—")) rest = rest.slice(1).trim();
      else if (rest.startsWith("-")) rest = rest.slice(1).trim();
      if (!isYYYYMMDD(date) || !rest) return null;
      return { d: date, note: rest };
    })
    .filter(Boolean);
}
function predictPhenologyEvents(tree) {
  const P = tree.plantedAt;
  const pre = Number(tree.preNurseryAgeMonths || 0);
  const r = [
    { d: addMonths(P, -pre), note: "Ươm cây (trước trồng)" },
    { d: P, note: "Trồng cây" },
    { d: addMonths(P, 1), note: "Ổn định bộ rễ" },
    { d: addMonths(P, 3), note: "Sinh trưởng thân lá" },
    { d: addMonths(P, 16), note: "Ra hoa (dự kiến)" },
    { d: addMonths(P, 17), note: "Kết trái (dự kiến)" },
    { d: addMonths(P, 20), note: "Quả chín (dự kiến)" },
  ];
  return r.filter((x) => x.d && x.note);
}
function sortEventsDesc(arr) {
  return [...(arr || [])].sort((a, b) => (b.d || "").localeCompare(a.d || ""));
}
function formatVN(d) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("vi-VN");
  } catch {
    return d;
  }
}
function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  try {
    const d1 = new Date(a + "T00:00:00");
    const d2 = new Date(b + "T00:00:00");
    return Math.floor((d2.getTime() - d1.getTime()) / 86400000);
  } catch {
    return 0;
  }
}
function daysUntil(due) {
  return -daysBetween(due, today());
}
function overdueDays(due) {
  const n = daysBetween(due, today());
  return n > 0 ? n : 0;
}
function isOverdue(due) {
  return overdueDays(due) > 0;
}
function lateDays(completedAt, due) {
  try {
    const n = daysBetween(due, completedAt);
    return n > 0 ? n : 0;
  } catch {
    return 0;
  }
}
function isToday(d) {
  try {
    const t = today();
    return d === t;
  } catch {
    return false;
  }
}
function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
function countNonEmptyLines(val) {
  return String(val || "")
    .split("\n")
    .map((l) => l.replace(/^\s*\d+\.\s*/, ""))
    .filter((l) => l.trim() !== "").length;
}
function handleNumberedKeyDown(e, setter) {
  if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
  const el = e.target;
  const val = el.value;
  const pos = el.selectionStart ?? 0;
  const lineStart = val.lastIndexOf("\n", Math.max(0, pos - 1)) + 1;
  const lineEnd = val.indexOf("\n", lineStart);
  const lineText =
    val.slice(lineStart, lineEnd === -1 ? val.length : lineEnd) || "";
  const lineTrim = lineText.replace(/^\s*\d+\.\s*/, "").trim();
  const hasPrefix = /^\s*\d+\.\s/.test(lineText);

  if (!hasPrefix && lineTrim === "") {
    const next = countNonEmptyLines(val) + 1;
    const prefix = `${next}. `;
    const newVal = val.slice(0, lineStart) + prefix + val.slice(lineStart);
    e.preventDefault();
    const insertPos = pos + prefix.length;
    const withChar =
      newVal.slice(0, insertPos) + e.key + newVal.slice(pos + prefix.length);
    setter(withChar);
    setTimeout(() => {
      try {
        el.selectionStart = el.selectionEnd = insertPos + 1;
      } catch {}
    }, 0);
  }
}
function lowerFirst(s = "") {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/* =========================================================================
   Local Image Registry + ImagePicker
   ========================================================================= */
const hasLS =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const LS_KEY = "mammoi.tree.images";
const imageRegistry = {
  getMap() {
    if (!hasLS) return {};
    try {
      return JSON.parse(window.localStorage.getItem(LS_KEY) || "{}");
    } catch {
      return {};
    }
  },
  get(code) {
    const map = imageRegistry.getMap();
    return map[code] || "";
  },
  set(code, url) {
    if (!hasLS) return;
    const map = imageRegistry.getMap();
    map[code] = url || "";
    window.localStorage.setItem(LS_KEY, JSON.stringify(map));
  },
  clear(code) {
    if (!hasLS) return;
    const map = imageRegistry.getMap();
    delete map[code];
    window.localStorage.setItem(LS_KEY, JSON.stringify(map));
  },
};
function ImagePicker({ code, value, onChange, disabled }) {
  const [urlInput, setUrlInput] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  useEffect(() => {
    if (!code) return;
    const saved = imageRegistry.get(code);
    if (saved && !value) onChange(saved);
    // eslint-disable-next-line
  }, [code]);

  function handleFile(e) {
    if (disabled) return;
    const f = e.target.files?.[0];
    if (!f) return;
    const objectUrl = URL.createObjectURL(f);
    onChange(objectUrl);
    if (code) imageRegistry.set(code, objectUrl);
  }

  function applyUrl() {
    if (disabled) return;
    const u = (urlInput || "").trim();
    if (!u) return;
    onChange(u);
    if (code) imageRegistry.set(code, u);
    setUrlInput("");
    setLinkOpen(false);
  }

  function clearImage() {
    if (disabled) return;
    onChange("");
    if (code) imageRegistry.clear(code);
  }

  return (
    <div className="space-y-3">
      {!disabled ? (
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center justify-center gap-2 h-10 rounded-xl border bg-white px-3 text-sm cursor-pointer hover:bg-neutral-50">
            <Upload className="w-4 h-4" />
            <span>Chọn ảnh (tải lên)</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          <Button onClick={() => setLinkOpen((v) => !v)} className="rounded-xl">
            <Link2 className="w-4 h-4 mr-1" />
            Dùng link
          </Button>
          {value ? (
            <>
              <Button variant="outline" onClick={() => window.open(value, "_blank")} className="rounded-xl">
                Mở ảnh
              </Button>
              <Button className="bg-rose-600 hover:bg-rose-700 rounded-xl" onClick={clearImage}>
                Xoá ảnh
              </Button>
            </>
          ) : null}
        </div>
      ) : (
        <div className="text-xs text-neutral-500">
          * Cây đang <b>Dừng hoạt động</b> — không thể thay ảnh. Bạn vẫn có thể mở ảnh đã lưu.
        </div>
      )}

      {linkOpen && !disabled && (
        <div className="flex gap-2">
          <Input
            placeholder="Dán link ảnh (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="rounded-xl bg-white"
          />
          <Button onClick={applyUrl} className="rounded-xl">
            Áp dụng
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setLinkOpen(false);
              setUrlInput("");
            }}
            className="rounded-xl"
          >
            Huỷ
          </Button>
        </div>
      )}

      <div className="rounded-xl overflow-hidden border">
        <div className="w-full h-48 grid place-items-center bg-neutral-100 text-neutral-400">
          {value ? (
            <img alt="tree" src={value} className="w-full h-48 object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8" />
          )}
        </div>
      </div>

      <div className="text-xs text-neutral-500">
        Ảnh đồng bộ theo <b>mã cây</b>; chỉ hiển thị &lt;img&gt; khi có URL.
      </div>
    </div>
  );
}

/* =========================================================================
   Notes Registry + Ghi chú
   ========================================================================= */
const NOTES_LS_KEY = "mammoi.tree.notes";
const noteRegistry = {
  getMap() {
    if (!hasLS) return {};
    try {
      return JSON.parse(window.localStorage.getItem(NOTES_LS_KEY) || "{}");
    } catch {
      return {};
    }
  },
  get(code) {
    const map = noteRegistry.getMap();
    return map[code] || "";
  },
  set(code, text) {
    if (!hasLS) return;
    const map = noteRegistry.getMap();
    map[code] = text || "";
    window.localStorage.setItem(NOTES_LS_KEY, JSON.stringify(map));
  },
};

/* =========================================================================
   In-card Toast
   ========================================================================= */
const InCardToast = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute top-3 right-3 z-[60]">
      <div className="rounded-xl border border-emerald-200 bg-white/95 text-emerald-800 shadow-xl px-3 py-2 text-sm">
        <span className="mr-1">✓</span>
        {message}
      </div>
    </div>
  );
};

/* =========================================================================
   HoverCard dùng portal
   ========================================================================= */
function HoverCard({
  anchorRef,
  open,
  side = "right",
  offset = 12,
  width = 320,
  children,
}) {
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (!open || !anchorRef?.current) return;
    const place = () => {
      const r = anchorRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      let left = side === "right" ? r.right + offset : r.left - width - offset;
      let top = r.top;

      if (left + width > vw - 8) left = vw - width - 8;
      if (left < 8) left = 8;

      setPos({ top, left });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, anchorRef, side, offset, width]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed z-[1000] pointer-events-none"
      style={{ top: pos.top, left: pos.left, width }}
    >
      <div className="fx-pop rounded-2xl border bg-white shadow-xl p-3">
        {children}
      </div>
    </div>,
    document.body
  );
}

/* =========================================================================
   Aux row + Done row + Planned row + Aside cards
   ========================================================================= */
function AuxRow({ t, onEdit, onComplete, disabled = false }) {
  const rowRef = React.useRef(null);
  const [hover, setHover] = React.useState(false);

  const hasDetails = Array.isArray(t.details)
    ? t.details.length > 0
    : !!String(t.details || "").trim();

  return (
    <>
      <li
        ref={rowRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative flex items-center justify-between gap-3 p-2 border rounded-2xl bg-white"
      >
        <div className="flex items-start gap-3 min-w-0">
          <CheckCircle2
            className={
              "h-4 w-4 mt-0.5 " +
              (t.completed ? "text-emerald-600" : "text-neutral-400")
            }
          />
          <div className="min-w-0">
            <div className="font-medium truncate">{t.title}</div>
            <div className="text-xs text-neutral-600 mt-0.5">
              {t.due ? <>Hạn: {formatVN(t.due)}</> : null}
              {t.completed && t.completedAt ? (
                <>
                  <span className="ml-2">
                    • Hoàn thành: {formatVN(t.completedAt)}
                  </span>
                  {t.due && lateDays(t.completedAt, t.due) > 0 && (
                    <span className="ml-2 text-[11px] font-medium text-rose-600">
                      muộn {lateDays(t.completedAt, t.due)} ngày
                    </span>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Button
            variant="outline"
            className="h-8 px-2"
            onClick={() => !disabled && onEdit(t)}
            disabled={disabled}
          >
            Sửa
          </Button>
          {!t.completed && (
            <Button
              className="h-8 px-2"
              onClick={() => !disabled && onComplete(t.id)}
              disabled={disabled}
            >
              ✓ Hoàn thành
            </Button>
          )}
        </div>
      </li>

      {hasDetails && (
        <HoverCard anchorRef={rowRef} open={hover} side="right" width={320}>
          <div className="fx-pop">
            <div className="text-sm font-semibold mb-1">{t.title}</div>
            {t.due ? (
              <div className="text-xs text-neutral-600 mb-2 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Hạn: {formatVN(t.due)}
              </div>
            ) : null}
            {Array.isArray(t.details) ? (
              <ol className="ml-5 list-decimal space-y-1 text-sm">
                {t.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ol>
            ) : (
              <div className="text-sm whitespace-pre-wrap">{t.details}</div>
            )}
            {t.completed && t.completedNote ? (
              <div className="mt-2 rounded-lg border bg-neutral-50 p-2 text-xs text-neutral-700">
                <div className="font-medium mb-1">Ghi chú hoàn thành</div>
                <div className="whitespace-pre-wrap">{t.completedNote}</div>
              </div>
            ) : null}
          </div>
        </HoverCard>
      )}
    </>
  );
}

/* Hàng lịch sử hoàn thành: hiển popover khi hover (thay cho modal “Xem”) */
function DoneRow({ it }) {
  const rowRef = React.useRef(null);
  const [hover, setHover] = React.useState(false);

  const theme = it.kind === "main" ? TYPE_THEME[it.type] : null;
  const badge =
    it.kind === "main" ? (
      <Badge className={"border " + (theme?.pill || "")}>
        {TYPE_THEME[it.type]?.name || "Chính"}
      </Badge>
    ) : (
      <Badge className="border bg-neutral-50 text-neutral-800 border-neutral-300">
        Phụ
      </Badge>
    );

  const late =
    it.due && it.completedAt ? lateDays(it.completedAt, it.due) : 0;

  return (
    <>
      <li
        ref={rowRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative flex items-start justify-between gap-3 p-2 border rounded-2xl bg-white"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium truncate">
              {`đã ${lowerFirst(it.title)}`}
            </div>
            {badge}
          </div>
          <div className="text-xs text-neutral-600 mt-0.5">
            Hoàn thành: {formatVN(it.completedAt)}
            {it.due ? (
              <span className="ml-2">• Hạn: {formatVN(it.due)}</span>
            ) : null}
            {late > 0 && (
              <span className="ml-2 text-[11px] font-medium text-rose-600">
                muộn {late} ngày
              </span>
            )}
          </div>
        </div>
      </li>

      <HoverCard anchorRef={rowRef} open={hover} side="right" width={360}>
        <div className="fx-pop">
          <div className="text-sm font-semibold mb-1">
            {`đã ${lowerFirst(it.title)}`}
          </div>

          <div className="text-xs text-neutral-700 mb-2">
            <div>
              Hoàn thành: <b>{formatVN(it.completedAt)}</b>
            </div>
            {it.due ? <div>Hạn: <b>{formatVN(it.due)}</b></div> : null}
          </div>

          {Array.isArray(it.details) && it.details.length > 0 ? (
            <div>
              <div className="font-medium mb-1">Chi tiết thao tác</div>
              <ol className="ml-5 list-decimal space-y-1 text-sm">
                {it.details.map((d, i) => <li key={i}>{d}</li>)}
              </ol>
            </div>
          ) : null}

          {it.note ? (
            <div className="mt-2 rounded-lg border bg-neutral-50 p-2 text-xs text-neutral-700">
              <div className="font-medium mb-1">Mô tả hoàn thành</div>
              <div className="whitespace-pre-wrap">{it.note}</div>
            </div>
          ) : null}
        </div>
      </HoverCard>
    </>
  );
}

/* Hàng công việc đã lên kế hoạch — dùng Portal để hiện popover */
function PlannedRow({ p, theme, disabled, openEditMain, openComplete, openEditNote }) {
  const rowRef = React.useRef(null);
  const [hover, setHover] = React.useState(false);
  const [tapOpen, setTapOpen] = React.useState(false); // hỗ trợ mobile: chạm để bật

  const late = p.completed && p.completedAt && p.due
    ? lateDays(p.completedAt, p.due)
    : 0;

  const open = hover || tapOpen;

  return (
    <>
      <li
        ref={rowRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => setTapOpen(v => !v)}
        className={
          "relative rounded-2xl border bg-white p-3 flex items-start justify-between gap-3 " +
          "border-l-4 " + theme.edge + " hover:shadow-md transition-shadow"
        }
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium text-[15px] truncate">{p.title}</div>
            <Badge className={"border " + TYPE_THEME[p.type].pill}>
              {TYPE_THEME[p.type].name}
            </Badge>

            {p.completed && (
              <Badge className="bg-emerald-600 text-white border-emerald-600 flex-col items-start leading-tight py-1">
                <span>Đã hoàn thành</span>
                {late > 0 && (
                  <span className="text-[10px] font-medium bg-white/15 rounded px-1 mt-0.5">
                    muộn {late} ngày
                  </span>
                )}
              </Badge>
            )}
          </div>

          <div className="text-xs text-neutral-600 mt-1 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Hạn: {formatVN(p.due)}
            {!disabled && !p.completed && isOverdue(p.due) && (
              <span className="text-rose-600 font-medium">
                • Quá hạn {overdueDays(p.due)} ngày
              </span>
            )}
            {!disabled && !p.completed && !isOverdue(p.due) && (
              <span className="text-emerald-700">
                • Còn {Math.max(0, daysUntil(p.due))} ngày
              </span>
            )}
            {p.completed && (
              <span className="text-neutral-500">• Hoàn thành: {formatVN(p.completedAt)}</span>
            )}
          </div>

          {p.completed && (
            <div className="mt-2 rounded-lg border bg-neutral-50 p-2 text-xs text-neutral-700">
              <div className="font-medium mb-1 flex items-center justify-between">
                Ghi chú hoàn thành
                <button
                  className={"text-emerald-700 hover:underline " + (disabled ? "pointer-events-none opacity-60" : "")}
                  onClick={() => !disabled && openEditNote("main", p.id, p.completedNote || "")}
                  title={disabled ? "Cây đang Dừng hoạt động — chỉ xem" : undefined}
                >
                  Sửa
                </button>
              </div>
              <div className="whitespace-pre-wrap">{p.completedNote || "—"}</div>
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Button
            variant="outline"
            className="h-8 px-2"
            onClick={() => openEditMain(p)}
            disabled={disabled}
            title={disabled ? "Cây đang Dừng hoạt động — chỉ xem" : undefined}
          >
            Sửa
          </Button>
          {!p.completed && (
            <Button
              className="h-8 px-2"
              onClick={() => openComplete(p.id)}
              disabled={disabled}
              title={disabled ? "Cây đang Dừng hoạt động — chỉ xem" : undefined}
            >
              ✓ Hoàn thành
            </Button>
          )}
        </div>
      </li>

      <HoverCard anchorRef={rowRef} open={open} side="right" width={340}>
        <div className="fx-pop">
          <div className="text-sm font-semibold mb-1">{p.title}</div>
          <div className="text-xs text-neutral-600 mb-2 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Hạn: {formatVN(p.due)}
          </div>
          {Array.isArray(p.details) && p.details.length > 0 ? (
            <ol className="ml-5 list-decimal space-y-1 text-sm">
              {p.details.map((d, idx) => <li key={idx}>{d}</li>)}
            </ol>
          ) : (
            <div className="text-xs text-neutral-500">Không có hướng dẫn chi tiết.</div>
          )}
        </div>
      </HoverCard>
    </>
  );
}

function AsideCards({
  image,
  setImage,
  codeKey,
  phen,
  tree,
  auxTasks,
  planned,               // dùng để tổng hợp lịch sử
  openEditNote,          // (đã truyền từ cha, hiện không dùng trong Aside)
  openEditAux,
  openAuxComplete,
  note,
  onSaveNote,
  readOnly = false,
}) {
  const [editNote, setEditNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note || "");
  useEffect(() => setNoteDraft(note || ""), [note]);
  useEffect(() => {
    if (readOnly && editNote) setEditNote(false);
  }, [readOnly, editNote]);

  // ===== LỊCH SỬ CÔNG VIỆC ĐÃ HOÀN THÀNH (gom CHÍNH + PHỤ) =====
  const DONE_PAGE_SIZE = 5;
  const completedList = useMemo(() => {
  const mains = (planned || [])
    .filter((p) => p.completed && p.completedAt)
    .map((p) => ({
      id: `main-${p.id}`,
      kind: "main",
      type: p.type,
      title: p.title,
      due: p.due,
      completedAt: p.completedAt,
      details: p.details,
      note: p.completedNote || "",
    }));

  const aux = (auxTasks || [])
    .filter((t) => t.completed && t.completedAt)
    .map((t) => ({
      id: `aux-${t.id}`,
      kind: "aux",
      type: "aux",
      title: t.title,
      due: t.due,
      completedAt: t.completedAt,
      details: t.details,
      note: t.completedNote || "",
    }));

  const all = [...mains, ...aux];
  return all.sort((a, b) =>
    (b.completedAt || "").localeCompare(a.completedAt || "")
  );
}, [planned, auxTasks]);
// Panel state + ref cho "Bộ lọc" (Lịch sử đã hoàn thành)
const [doneFilterOpen, setDoneFilterOpen] = useState(false);
const filterRef = useRef(null);

// Đóng panel khi click ra ngoài
useEffect(() => {
  function onClickOutside(e) {
    if (!filterRef.current) return;
    if (!filterRef.current.contains(e.target)) setDoneFilterOpen(false);
  }
  document.addEventListener("mousedown", onClickOutside);
  return () => document.removeEventListener("mousedown", onClickOutside);
}, []);


  
    // --- Filters (nhỏ) cho "Lịch sử công việc đã hoàn thành"
const [doneKind, setDoneKind]   = useState("all");   // all | main | aux
const [doneType, setDoneType]   = useState("all");   // all | water | fert | pest (chỉ áp cho main)
const [doneLate, setDoneLate]   = useState("all");   // all | ontime | late | nodue
const [doneQuery, setDoneQuery] = useState("");      // tìm toàn văn
const [doneFrom, setDoneFrom] = useState("");
const [doneTo, setDoneTo] = useState("");
// Panel "Bộ lọc"
const doneFiltered = React.useMemo(() => {
  const q = (doneQuery || "").trim().toLowerCase();

  return (completedList || []).filter((it) => {
    // Lọc theo loại: all | main | aux
    if (doneKind !== "all" && it.kind !== doneKind) return false;

    // Lọc theo hạng mục (chỉ áp cho main: water/fert/pest)
    if (doneKind !== "aux" && doneType !== "all" && it.kind === "main") {
      if (it.type !== doneType) return false;
    }

    // Lọc theo trạng thái đúng hạn / trễ hạn / không có hạn
    if (doneLate !== "all") {
      const hasDue = !!it.due;
      const hasComp = !!it.completedAt;
      const isLate = hasDue && hasComp ? lateDays(it.completedAt, it.due) > 0 : false;

      if (doneLate === "ontime" && (!hasDue || !hasComp || isLate)) return false;
      if (doneLate === "late"   && !isLate) return false;
      if (doneLate === "nodue"  && hasDue) return false;
    }

    // Lọc theo khoảng ngày hoàn thành
    if (doneFrom && (!it.completedAt || it.completedAt < doneFrom)) return false;
    if (doneTo   && (!it.completedAt || it.completedAt > doneTo))   return false;

    // Tìm kiếm toàn văn: tiêu đề, ghi chú, chi tiết
    if (q) {
      const hay = [
        it.title || "",
        it.note || "",
        Array.isArray(it.details) ? it.details.join(" ") : (it.details || ""),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}, [completedList, doneKind, doneType, doneLate, doneFrom, doneTo, doneQuery]);

// Chấm đỏ báo đang có filter hoạt động
const hasActiveDoneFilter =
  doneKind !== "all" ||
  doneType !== "all" ||
  doneLate !== "all" ||
  !!doneFrom ||
  !!doneTo ||
  !!(doneQuery || "").trim();
const [donePage, setDonePage] = useState(1);
useEffect(() => setDonePage(1), [
  completedList.length, doneKind, doneType, doneLate, doneFrom, doneTo, doneQuery,
]);
const doneTotal = doneFiltered.length;
const doneStart = (donePage - 1) * DONE_PAGE_SIZE;
const doneItems = doneFiltered.slice(doneStart, doneStart + DONE_PAGE_SIZE);
const doneTotalPages = Math.max(1, Math.ceil(doneTotal / DONE_PAGE_SIZE));

  
// ===== PHÂN TRANG VIỆC PHỤ =====
const AUX_PAGE_SIZE = 5;
const [auxPage, setAuxPage] = useState(1);

// Order: TODO (due gần nhất trước, không có hạn để cuối) -> DONE (mới nhất trước)
const auxOrdered = useMemo(() => {
  const src = Array.isArray(auxTasks) ? auxTasks : [];

  const todo = src
    .filter(t => !t.completed)
    .sort((a, b) => {
      const ad = isYYYYMMDD(a?.due) ? a.due : "9999-12-31";
      const bd = isYYYYMMDD(b?.due) ? b.due : "9999-12-31";
      return ad.localeCompare(bd); // gần hạn trước
    });

  const done = src
    .filter(t => !!t.completed)
    .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || "")); // mới nhất trước

  return [...todo, ...done];
}, [auxTasks]);

// reset về trang 1 khi số lượng/ordering thay đổi
useEffect(() => setAuxPage(1), [auxOrdered.length]);

const auxTotal = auxOrdered.length;
const auxStart = (auxPage - 1) * AUX_PAGE_SIZE;
const auxItems = auxOrdered.slice(auxStart, auxStart + AUX_PAGE_SIZE);
const auxTotalPages = Math.max(1, Math.ceil(auxTotal / AUX_PAGE_SIZE));

  return (
    <>
      {/* Ghi chú */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Ghi chú</CardTitle>
          {!editNote ? (
            <Button
              variant="outline"
              onClick={() => setEditNote(true)}
              disabled={readOnly}
              title={readOnly ? "Cây đang Dừng hoạt động — chỉ xem" : undefined}
            >
              Sửa
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {!editNote ? (
            <div className="text-sm whitespace-pre-wrap min-h-20">
              {note?.trim() ? note : (
                <span className="text-neutral-500">Chưa có ghi chú.</span>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                rows={6}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Nhập ghi chú cho cây này (lưu theo mã cây)"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNoteDraft(note || "");
                    setEditNote(false);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    onSaveNote(noteDraft);
                    setEditNote(false);
                  }}
                >
                  Lưu
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ảnh cây */}
      <Card>
        <CardHeader>
          <CardTitle>Ảnh cây</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ImagePicker
            code={codeKey}
            value={image}
            onChange={setImage}
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      {/* Việc cần làm (Phụ) */}
      <Card>
        <CardHeader>
          <CardTitle>Việc cần làm (Phụ)</CardTitle>
        </CardHeader>
        <CardContent>
 {auxItems.length === 0 ? (
  <div className="text-sm text-neutral-500">Chưa có việc phụ.</div>
) : (
  <ul className="text-sm space-y-2">
    {auxItems.map((t) => (
      <AuxRow
        key={t.id}
        t={t}
        onEdit={openEditAux}
        onComplete={openAuxComplete}
        disabled={readOnly}
      />
    ))}
  </ul>
)}

  {/* Điều hướng trang (giống phần lịch sử) */}
  <div
    className={
      "mt-2 flex items-center text-xs text-neutral-600 " +
      (auxTotal > AUX_PAGE_SIZE ? "justify-between" : "justify-start")
    }
  >
    <div>
      Hiển thị {auxTotal === 0 ? 0 : Math.min(auxTotal, auxStart + 1)}–
      {Math.min(auxTotal, auxStart + auxItems.length)} / {auxTotal}
    </div>

    {auxTotal > AUX_PAGE_SIZE && (
      <div className="flex items-center gap-2">
        <button
          className="h-8 px-3 rounded-full border bg-white hover:bg-neutral-50 transition-all hover:shadow-md active:scale-[0.98]"
          onClick={() => setAuxPage(Math.max(1, auxPage - 1))}
          disabled={auxPage <= 1}
        >
          Trang trước
        </button>

        <span>{auxPage}/{auxTotalPages}</span>

        <button
          className="h-8 px-3 rounded-full border bg-white hover:bg-neutral-50 transition-all hover:shadow-md active:scale-[0.98]"
          onClick={() => setAuxPage(Math.min(auxTotalPages, auxPage + 1))}
          disabled={auxPage >= auxTotalPages}
        >
          Trang sau
        </button>
      </div>
    )}
  </div>

  <div className="text-xs text-neutral-500 mt-3">
    Các việc hỗ trợ: tỉa cành, dọn cỏ, vệ sinh bồn, buộc cành, che mưa nắng…
  </div>
</CardContent>

      </Card>

      {/* Lịch sử công việc ĐÃ hoàn thành (hover popover) */}
      <Card>
        <CardHeader className="flex items-center justify-between">
  <CardTitle>
    Lịch sử công việc <span className="lowercase">đã</span> hoàn thành
  </CardTitle>

  {/* Nút + panel bộ lọc đặt ngay cạnh tiêu đề */}
  <div className="relative">
    <Button
      variant="outline"
      className="h-8 px-3"
      onClick={() => setDoneFilterOpen(v => !v)}
    >
      Bộ lọc
      {hasActiveDoneFilter ? (
        <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
      ) : null}
    </Button>

    {doneFilterOpen && (
      <div
        ref={filterRef}
        className="absolute right-0 top-full mt-2 z-[60] w-[560px] max-w-[calc(100vw-4rem)] rounded-2xl border bg-white p-3 shadow-xl"
      >
        <div className="text-sm font-medium mb-2">Bộ lọc lịch sử đã hoàn thành</div>

        {/* Hàng 1: Chính/Phụ */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex gap-1">
            <FilterChip active={doneKind === "all"}  onClick={() => setDoneKind("all")}>Tất cả</FilterChip>
            <FilterChip active={doneKind === "main"} onClick={() => setDoneKind("main")}>Chính</FilterChip>
            <FilterChip active={doneKind === "aux"}  onClick={() => setDoneKind("aux")}>Phụ</FilterChip>
          </div>
        </div>

        {/* Hàng 2: Selects + Range ngày */}
        <div className="grid sm:grid-cols-2 gap-2">
          <select
            className="h-9 rounded-xl border px-3 bg-white text-sm"
            value={doneType}
            onChange={(e) => setDoneType(e.target.value)}
            title="Hạng mục (chỉ áp cho công việc CHÍNH)"
            disabled={doneKind === "aux"}
          >
            <option value="all">Hạng mục: Tất cả</option>
            <option value="water">Tưới tiêu</option>
            <option value="fert">Phân bón</option>
            <option value="pest">Sâu bệnh</option>
          </select>

          <select
            className="h-9 rounded-xl border px-3 bg-white text-sm"
            value={doneLate}
            onChange={(e) => setDoneLate(e.target.value)}
            title="Trạng thái hoàn thành so với hạn"
          >
            <option value="all">Tất cả</option>
            <option value="ontime">Đúng hạn</option>
            <option value="late">Muộn hạn</option>
            <option value="nodue">Không có hạn</option>
          </select>

          <div className="flex items-center gap-2 sm:col-span-2">
            <input type="date" value={doneFrom} onChange={(e) => setDoneFrom(e.target.value)} className="h-9 w-full rounded-xl border px-3 bg-white text-sm" max="9999-12-31" />
            <span className="text-neutral-400">→</span>
            <input type="date" value={doneTo} onChange={(e) => setDoneTo(e.target.value)} className="h-9 w-full rounded-xl border px-3 bg-white text-sm" max="9999-12-31" />
          </div>
        </div>

        {/* Hàng 3: Search */}
        <div className="mt-2">
          <input
            className="h-9 w-full rounded-xl border px-3 bg-white text-sm"
            placeholder="Tìm tiêu đề / ghi chú…"
            value={doneQuery}
            onChange={(e) => setDoneQuery(e.target.value)}
          />
        </div>

        {/* Hàng 4: Actions */}
        <div className="mt-3 flex items-center justify-between">
          <Button
            variant="outline"
            className="h-9 px-3"
            onClick={() => {
              setDoneKind("all");
              setDoneType("all");
              setDoneLate("all");
              setDoneFrom("");
              setDoneTo("");
              setDoneQuery("");
            }}
          >
            Reset
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" className="h-9 px-3" onClick={() => setDoneFilterOpen(false)}>Đóng</Button>
            <Button className="h-9 px-3" onClick={() => setDoneFilterOpen(false)}>Áp dụng</Button>
          </div>
        </div>
      </div>
    )}
  </div>
</CardHeader>
        <CardContent className="space-y-3">
          {/* --- Tiny filter bar --- */}
{/* --- Filter trigger (1 nút mở panel) --- */}


          {doneItems.length === 0 ? (
            <div className="text-sm text-neutral-500">
              Chưa có công việc đã hoàn thành.
            </div>
          ) : (
            <ul className="space-y-2">
              {doneItems.map((it) => (
                <DoneRow key={it.id} it={it} />
              ))}
            </ul>
          )}

          <div
            className={
              "mt-2 flex items-center text-xs text-neutral-600 " +
              (doneTotal > DONE_PAGE_SIZE ? "justify-between" : "justify-start")
            }
          >
            <div>
              Hiển thị {doneTotal === 0 ? 0 : Math.min(doneTotal, doneStart + 1)}–
              {Math.min(doneTotal, doneStart + doneItems.length)} / {doneTotal}
            </div>

            {doneTotal > DONE_PAGE_SIZE && (
              <div className="flex items-center gap-2">
                <button
                  className="h-8 px-3 rounded-full border bg-white hover:bg-neutral-50 transition-all hover:shadow-md active:scale-[0.98]"
                  onClick={() => setDonePage(Math.max(1, donePage - 1))}
                  disabled={donePage <= 1}
                >
                  Trang trước
                </button>

                <span>{donePage}/{doneTotalPages}</span>

                <button
                  className="h-8 px-3 rounded-full border bg-white hover:bg-neutral-50 transition-all hover:shadow-md active:scale-[0.98]"
                  onClick={() => setDonePage(Math.min(doneTotalPages, donePage + 1))}
                  disabled={donePage >= doneTotalPages}
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

/* =========================================================================
   Component
   ========================================================================= */
export default function TreeDetail() {
  // Hiệu ứng toàn cục: smooth scroll + anti-alias + keyframes
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-mm-effects", "1");
    style.innerHTML = `
      html { scroll-behavior: smooth; }
      body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
      @keyframes mm-fade-in-up { from { opacity:.0; transform: translateY(6px) } to { opacity:1; transform:none } }
      .fx-fade { animation: mm-fade-in-up .35s ease-out both; }
      .fx-pop  { animation: mm-fade-in-up .20s ease-out both; }
    `;
    document.head.appendChild(style);
    return () => { try { document.head.removeChild(style); } catch {} };
  }, []);

  // Realtime tick (badge hạn/quá hạn)
  const [, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // Chọn cây theo query
  const q = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const treeId = q.get("treeId") || "T-001";
  const baseTree = TREES[treeId] || TREES["T-001"];
  const tree = baseTree;

  const [editingMeta, setEditingMeta] = useState(false);
  const [meta, setMeta] = useState({
    name: tree.name || "",
    caretaker: tree.caretaker || "",
    plantedAt: tree.plantedAt || today(),
    variety: tree.variety || "",
    preNurseryAgeMonths: Number(tree.preNurseryAgeMonths || 0),
    soil: tree.soil || "",
    location: tree.location || "",
    plot: tree.plot || "",
    status: tree.status || "active",
  });

  // status flags + ref cho toast hàng ngày
  const isActive = meta.status === "active";
  const isStopped = meta.status === "stopped";
  const statusRef = useRef(meta.status);
  useEffect(() => {
    statusRef.current = meta.status;
  }, [meta.status]);

  // Modal xác nhận đổi trạng thái
  const [statusModal, setStatusModal] = useState({
    open: false,
    next: meta.status || "active",
  });

  // daily toast (tắt khi stopped)
  const lastDateRef = useRef(today());
  const [dailyToast, setDailyToast] = useState({ show: false, msg: "" });
  const plannedRef = useRef([]);
  useEffect(() => {
    const tick = setInterval(() => {
      if (statusRef.current !== "active") return;
      const t = today();
      if (t !== lastDateRef.current) {
        lastDateRef.current = t;
        const overdueTotal = plannedRef.current.filter(
          (p) => !p.completed && isOverdue(p.due)
        ).length;
        if (overdueTotal > 0) {
          setDailyToast({
            show: true,
            msg: `Có ${overdueTotal} công việc bị quá hạn kể từ hôm nay`,
          });
          setTimeout(() => setDailyToast({ show: false, msg: "" }), 2200);
        }
      }
    }, 60000);
    return () => clearInterval(tick);
  }, []);

  // Ảnh theo mã cây
  const codeKey = tree.id;
  const [image, setImage] = useState("");
  useEffect(() => {
    if (!codeKey) return;
    const saved = imageRegistry.get(codeKey);
    if (saved) setImage(saved);
  }, [codeKey]);

  // Ghi chú theo mã cây
  const [note, setNote] = useState("");
  useEffect(() => {
    if (!codeKey) return;
    setNote(noteRegistry.get(codeKey) || "");
  }, [codeKey]);
  const saveNote = (text) => {
    setNote(text || "");
    if (codeKey) noteRegistry.set(codeKey, text || "");
  };

  // States chính
  const [planned, setPlanned] = useState(baseTree.planned || []);
  useEffect(() => {
    plannedRef.current = planned;
  }, [planned]);

  const [aiSuggestions] = useState(getAISuggestions(baseTree));
  const [auxTasks, setAuxTasks] = useState([
    {
      id: "aux-1",
      title: "Tỉa cành",
      due: addDays(2),
      details: "Loại bỏ cành sâu bệnh, cành tăm",
    },
  ]);

  const [newKind, setNewKind] = useState("main");
  const [activeType, setActiveType] = useState("water");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [newMain, setNewMain] = useState({
    title: "",
    type: "water",
    due: today(),
    details: "",
  });
  const [newAux, setNewAux] = useState({
    title: "",
    due: today(),
    details: "",
  });

  // Validate lỗi cục bộ cho form thêm
  const [errorsMain, setErrorsMain] = useState({});
  const [errorsAux, setErrorsAux] = useState({});

  // toast trong khung AI & Thêm việc
  const [toast, setToast] = useState({ show: false, msg: "" });
  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 1500);
  };

  // Modals (không còn modal “Xem” lịch sử)
  const [completeModal, setCompleteModal] = useState({
    open: false,
    forId: undefined,
    note: "",
  });
  const [auxCompleteModal, setAuxCompleteModal] = useState({
    open: false,
    forId: undefined,
    note: "",
  });
  const [noteModal, setNoteModal] = useState({
    open: false,
    type: "main",
    forId: undefined,
    note: "",
  });
  const [editMain, setEditMain] = useState({
    open: false,
    forId: undefined,
    title: "",
    type: "water",
    due: today(),
    details: "",
  });
  const [editAux, setEditAux] = useState({
    open: false,
    forId: undefined,
    title: "",
    due: today(),
    details: "",
  });
  const [confirmDel, setConfirmDel] = useState({
    open: false,
    type: "main",
    forId: undefined,
  });

  // Confirm thêm việc CHÍNH
  const [confirmAddMain, setConfirmAddMain] = useState({
    open: false,
    snapshot: null,
  });

  // Phenology
  const [editingPhen, setEditingPhen] = useState(false);
  const [eventsText, setEventsText] = useState("");
  const [phen, setPhen] = useState({
    stage: baseTree.phenology?.stage || "",
    status: baseTree.phenology?.status || "",
    prevCare: baseTree.phenology?.prevCare || "",
    leafRootNote: baseTree.phenology?.leafRootNote || "",
    seasonNote: baseTree.phenology?.seasonNote || "",
    // workLog giữ trong state nhưng KHÔNG render nữa
    workLog: baseTree.phenology?.workLog || "",
    events: baseTree.phenology?.events || undefined,
  });
  const [eventPick, setEventPick] = useState({ date: today(), note: "" });

  // Phân trang
  const PAGE_SIZE = 5;
  const AI_PAGE_SIZE = 6;
  const [plannedPage, setPlannedPage] = useState({
    water: 1,
    fert: 1,
    pest: 1,
  });
  const [aiPage, setAiPage] = useState(1);

  // Overdue theo nhóm
  const overdueCounts = useMemo(() => {
    if (isStopped) return { water: 0, fert: 0, pest: 0 };
    return {
      water: planned.filter(
        (p) => p.type === "water" && !p.completed && isOverdue(p.due)
      ).length,
      fert: planned.filter(
        (p) => p.type === "fert" && !p.completed && isOverdue(p.due)
      ).length,
      pest: planned.filter(
        (p) => p.type === "pest" && !p.completed && isOverdue(p.due)
      ).length,
    };
  }, [planned, isStopped]);

  useEffect(() => {
    setPlannedPage((prev) => ({ ...prev, [activeType]: 1 }));
  }, [activeType, statusFilter, dateFilter, search]);

  useEffect(() => {
    if (editingPhen) {
      const base = phen.events || predictPhenologyEvents(tree);
      setEventsText(eventsToText(sortEventsDesc(base)));
      setEventPick({ date: today(), note: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPhen]);

  const ageAfterPlant = useMemo(
    () => monthsBetween(meta.plantedAt),
    [meta.plantedAt]
  );
  const preAge = useMemo(
    () => Number(meta.preNurseryAgeMonths || 0),
    [meta.preNurseryAgeMonths]
  );
  const totalAge = ageAfterPlant + preAge;

  /* ---------------------------------------------------------------------
     Xóa cây — confirm chi tiết
     --------------------------------------------------------------------- */
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    confirmText: "",
  });
  const [deleted, setDeleted] = useState(false);

  function openDeleteTree() {
    setDeleteModal({ open: true, confirmText: "" });
  }
  function performDeleteTree() {
    imageRegistry.clear(codeKey);
    noteRegistry.set(codeKey, "");
    setPlanned([]);
    setAuxTasks([]);
    setImage("");
    setNote("");
    setDeleted(true);
    setDeleteModal({ open: false, confirmText: "" });
  }

  /* ---------------------------------------------------------------------
     Actions
     --------------------------------------------------------------------- */
  function validateMainDraft(d) {
    const e = {};
    if (!String(d.title || "").trim()) e.title = "Vui lòng nhập tiêu đề";
    if (daysBetween(d.due, today()) > 0) e.due = "Hạn phải từ hôm nay trở đi";
    return e;
  }

  function addManual() {
    if (isStopped) return;
    if (newKind === "main") {
      const det = normalizeDetails(newMain.details);
      const draft = { ...newMain, details: det };

      const e = validateMainDraft(draft);
      setErrorsMain(e);
      if (Object.keys(e).length) return;

      setConfirmAddMain({ open: true, snapshot: draft });
    } else {
      const e = {};
      if (!String(newAux.title || "").trim())
        e.title = "Vui lòng nhập tên việc phụ";
      if (newAux.due && daysBetween(newAux.due, today()) > 0)
        e.due = "Hạn phải từ hôm nay trở đi";
      setErrorsAux(e);
      if (Object.keys(e).length) return;

      const details = normalizeDetails(newAux.details);
      setAuxTasks((prev) => [
        {
          id: `aux-${Date.now()}`,
          title: newAux.title,
          due: newAux.due,
          details,
        },
        ...prev,
      ]);
      showToast("Đã thêm công việc PHỤ thành công");
      setNewAux({ title: "", due: today(), details: "" });
      setErrorsAux({});
    }
  }

  function performAddMain(draft) {
    if (isStopped) return;
    setPlanned((prev) => [
      {
        id: Date.now(),
        title: draft.title,
        type: draft.type,
        due: draft.due,
        details: draft.details,
      },
      ...prev,
    ]);
    setConfirmAddMain({ open: false, snapshot: null });

    showToast("Đã thêm công việc CHÍNH thành công");
    setActiveType(draft.type);
    setStatusFilter("all");
    setPlannedPage((p) => ({ ...p, [draft.type]: 1 }));
    setNewMain({ title: "", type: draft.type, due: today(), details: "" });
    setErrorsMain({});
  }

  function filteredPlannedBy(type) {
    const qtext = search.toLowerCase();
    const list = planned.filter((p) => p.type === type);

    const filtered = list.filter((p) => {
      if (statusFilter === "todo" && p.completed) return false;
      if (statusFilter === "done" && !p.completed) return false;
      if (dateFilter === "overdue" && !isOverdue(p.due)) return false;
      if (
        dateFilter === "week" &&
        !(daysUntil(p.due) >= 0 && daysUntil(p.due) <= 7)
      )
        return false;
      if (dateFilter === "today" && !isToday(p.due)) return false;
      if (qtext) {
        const text = `${p.title}\n${detailsToPlain(p.details)}\n${
          p.completedNote || ""
        }`.toLowerCase();
        if (!text.includes(qtext)) return false;
      }
      return true;
    });

    const todo = filtered
      .filter((p) => !p.completed)
      .sort((a, b) => (a.due || "").localeCompare(b.due || ""));
    const done = filtered
      .filter((p) => p.completed)
      .sort((a, b) =>
        (b.completedAt || "").localeCompare(a.completedAt || "")
      );
    return [...todo, ...done];
  }

  function openComplete(id) {
    if (isStopped) return;
    setCompleteModal({ open: true, forId: id, note: "" });
  }
  function confirmComplete() {
    if (!completeModal.forId || isStopped) return;
    setPlanned((prev) =>
      prev.map((p) =>
        p.id === completeModal.forId
          ? {
              ...p,
              completed: true,
              completedAt: today(),
              completedNote: completeModal.note,
            }
          : p
      )
    );
    setCompleteModal({ open: false, forId: undefined, note: "" });
  }

  function openAuxComplete(id) {
    if (isStopped) return;
    setAuxCompleteModal({ open: true, forId: id, note: "" });
  }
  function confirmAuxComplete() {
    if (!auxCompleteModal.forId || isStopped) return;
    setAuxTasks((prev) =>
      prev.map((t) =>
        t.id === auxCompleteModal.forId
          ? {
              ...t,
              completed: true,
              completedAt: today(),
              completedNote: auxCompleteModal.note,
            }
          : t
      )
    );
    setAuxCompleteModal({ open: false, forId: undefined, note: "" });
  }

  function openEditNote(type, id, current) {
    if (isStopped) return;
    setNoteModal({ open: true, type, forId: id, note: current || "" });
  }
  function saveNoteModal() {
    if (!noteModal.forId || isStopped) return;
    if (noteModal.type === "main") {
      setPlanned((prev) =>
        prev.map((p) =>
          p.id === noteModal.forId
            ? { ...p, completedNote: noteModal.note }
            : p
        )
      );
    } else {
      setAuxTasks((prev) =>
        prev.map((t) =>
          t.id === noteModal.forId
            ? { ...t, completedNote: noteModal.note }
            : t
        )
      );
    }
    setNoteModal({ open: false, type: "main", forId: undefined, note: "" });
  }

  function openEditMain(p) {
    if (isStopped) return;
    setEditMain({
      open: true,
      forId: p.id,
      title: p.title,
      type: p.type,
      due: p.due,
      details: Array.isArray(p.details)
        ? p.details.join("\n")
        : String(p.details || ""),
    });
  }
  function saveEditMain() {
    if (!editMain.forId || isStopped) return;
    const det = normalizeDetails(editMain.details);
    setPlanned((prev) =>
      prev.map((p) =>
        p.id === editMain.forId
          ? {
              ...p,
              title: editMain.title,
              type: editMain.type,
              due: editMain.due,
              details: det,
            }
          : p
      )
    );
    setEditMain({
      open: false,
      forId: undefined,
      title: "",
      type: "water",
      due: today(),
      details: "",
    });
  }

  function openEditAux(t) {
    if (isStopped) return;
    setEditAux({
      open: true,
      forId: t.id,
      title: t.title,
      due: t.due,
      details: Array.isArray(t.details)
        ? t.details.join("\n")
        : String(t.details || ""),
    });
  }
  function saveEditAux() {
    if (!editAux.forId || isStopped) return;
    const det = normalizeDetails(editAux.details);
    setAuxTasks((prev) =>
      prev.map((t) =>
        t.id === editAux.forId
          ? { ...t, title: editAux.title, due: editAux.due, details: det }
          : t
      )
    );
    setEditAux({
      open: false,
      forId: undefined,
      title: "",
      due: today(),
      details: "",
    });
  }

  function askDeleteMain(id) {
    if (isStopped) return;
    setConfirmDel({ open: true, type: "main", forId: id });
  }
  function askDeleteAux(id) {
    if (isStopped) return;
    setConfirmDel({ open: true, type: "aux", forId: id });
  }
  function confirmDelete() {
    if (!confirmDel.forId || isStopped) return;
    if (confirmDel.type === "main")
      setPlanned((prev) => prev.filter((p) => p.id !== confirmDel.forId));
    else setAuxTasks((prev) => prev.filter((t) => t.id !== confirmDel.forId));
    setConfirmDel({ open: false, type: "main", forId: undefined });
  }

  function addPickedEvent() {
    const d = (eventPick.date || "").trim();
    const note = (eventPick.note || "").trim();
    if (!isYYYYMMDD(d) || !note) return;
    const parsed = parseEvents(eventsText);
    const next = sortEventsDesc([...(parsed || []), { d, note }]);
    setEventsText(eventsToText(next));
    setEventPick({ date: today(), note: "" });
  }

  /* ---------------------------------------------------------------------
     Subviews
     --------------------------------------------------------------------- */
  function PlannedSection({ type, disabled = false }) {
    const list = filteredPlannedBy(type);
    const theme = TYPE_THEME[type];
    const page = plannedPage[type];

    const total = list.length;
    const start = (page - 1) * PAGE_SIZE;
    pagesanity(total);
    const pageItems = list.slice(start, start + PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
      <section className="mb-2">
        <div className="text-sm font-medium mb-2">
          <ClipboardList className="inline h-4 w-4 mr-1" />
          Các công việc đã lên kế hoạch — {theme.name}
        </div>

        <ul className="space-y-3">
          {pageItems.map((p) => (
            <PlannedRow
              key={p.id}
              p={p}
              theme={theme}
              disabled={disabled}
              openEditMain={openEditMain}
              openComplete={openComplete}
              openEditNote={openEditNote}
            />
          ))}

          {pageItems.length === 0 && (
            <li className="text-sm text-neutral-500">
              Không có công việc phù hợp bộ lọc.
            </li>
          )}
        </ul>

        <div
          className={
            "mt-3 flex items-center text-xs text-neutral-600 " +
            (total > PAGE_SIZE ? "justify-between" : "justify-start")
          }
        >
          <div>
            Hiển thị {total === 0 ? 0 : Math.min(total, start + 1)}–
            {Math.min(total, start + pageItems.length)} / {total}
          </div>

          {total > PAGE_SIZE && (
            <div className="flex items-center gap-2">
              <button
                className="h-8 px-3 rounded-full border bg-white hover:bg-neutral-50 transition-all hover:shadow-md active:scale-[0.98]"
                onClick={() =>
                  setPlannedPage((prev) => ({
                    ...prev,
                    [type]: Math.max(1, page - 1),
                  }))
                }
                disabled={page <= 1}
              >
                Trang trước
              </button>

              <span>{page}/{totalPages}</span>

              <button
                className="h-8 px-3 rounded-full border bg-white hover:bg-neutral-50 transition-all hover:shadow-md active:scale-[0.98]"
                onClick={() =>
                  setPlannedPage((prev) => ({
                    ...prev,
                    [type]: Math.min(totalPages, page + 1),
                  }))
                }
                disabled={page >= totalPages}
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  function AISuggestionsList() {
    const list = aiSuggestions;
    const total = list.length;
    const start = (aiPage - 1) * AI_PAGE_SIZE;
    const pageItems = list.slice(start, start + AI_PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(total / AI_PAGE_SIZE));

    return (
      <section className="mb-2">
        <div className="text-sm font-medium mb-2">Gợi ý từ AI</div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {pageItems.map((sug, i) => {
            const theme = TYPE_THEME[sug.type];
            return (
              <div
                key={start + i}
                className={
                  "rounded-2xl border bg-white p-3 border-l-4 " +
                  theme.edge +
                  " hover:shadow-md transition-shadow"
                }
              >
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">{sug.title}</div>
                  <Badge className={"border " + theme.pill}>{theme.name}</Badge>
                </div>
                <div className="text-xs text-neutral-600 mt-0.5">
                  Nên làm: {formatVN(sug.due)}
                </div>
                <ol className="mt-2 ml-5 list-decimal text-sm text-neutral-700 space-y-1">
                  {sug.details.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>

        <div
          className={
            "mt-3 flex items-center text-xs text-neutral-600 " +
            (total > AI_PAGE_SIZE ? "justify-between" : "justify-start")
          }
        >
          <div>
            Hiển thị {total === 0 ? 0 : Math.min(total, start + 1)}–
            {Math.min(total, start + pageItems.length)} / {total}
          </div>

          {total > AI_PAGE_SIZE && (
            <div className="flex items-center gap-2">
              <button
                className="h-8 px-3 rounded-full border bg-white hover:bg-neutral-50 transition-all hover:shadow-md active:scale-[0.98]"
                onClick={() => setAiPage(Math.max(1, aiPage - 1))}
                disabled={aiPage <= 1}
              >
                Trang trước
              </button>

              <span>{aiPage}/{totalPages}</span>

              <button
                className="h-8 px-3 rounded-full border bg-white hover:bg-neutral-50 transition-all hover:shadow-md active:scale-[0.98]"
                onClick={() => setAiPage(Math.min(totalPages, aiPage + 1))}
                disabled={aiPage >= totalPages}
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------------
     Render
     --------------------------------------------------------------------- */
  if (deleted) {
    return (
      <div className="min-h-screen bg-[#1F302F] grid place-items-center p-6">
        <div className="max-w-xl w-full">
          <Card>
            <CardHeader className="!border-b-0">
              <CardTitle className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="h-5 w-5" />
                Cây đã được xoá
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                Toàn bộ công việc, việc phụ, ghi chú và ảnh liên quan đến{" "}
                <b>{meta.name}</b> (<b>#{codeKey}</b>) đã được xoá khỏi phiên
                làm việc này.
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() =>
                    window.history.length > 1
                      ? window.history.back()
                      : window.location.assign("/")
                  }
                >
                  ← Quay về
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Tải lại trang
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent isolate overflow-x-hidden">
      <LivingBackground density={28} baseColor="#1F302F" />
      <main className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-10 2xl:px-16 pt-20 md:pt-24 pb-10 space-y-8">
        {/* daily overdue toast */}
        {dailyToast.show && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70]">
            <div className="rounded-xl border bg-white shadow-xl px-4 py-2 text-sm">
              {dailyToast.msg}
            </div>
          </div>
        )}

        {/* 2-column layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT */}
          <div className="col-span-12 xl:col-span-9 space-y-6">
            {/* Thông tin chung */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Thông tin chung</CardTitle>
                <div className="flex items-center gap-2">
                  {(() => {
                    const th = STATUS_THEME[meta.status] || STATUS_THEME.active;
                    return (
                      <Badge className={"border " + th.pill}>
                        {labelStatus(meta.status)}
                      </Badge>
                    );
                  })()}

                  <Button
                    variant="outline"
                    onClick={() => setEditingMeta((v) => !v)}
                  >
                    {editingMeta ? "Hủy" : "Cập nhật"}
                  </Button>
                  <Button
                    className="bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-500/20"
                    onClick={openDeleteTree}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1.5" />
                    Xóa cây
                  </Button>
                </div>
              </CardHeader>

              {!editingMeta ? (
                <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                  <Field label="Tên thường gọi" value={meta.name} />
                  <Field label="Mã cây" value={`#${tree.id}`} />
                  <Field label="Nhân viên chăm sóc" value={meta.caretaker} />
                  <Field label="Giống/Variety" value={meta.variety} />
                  <Field label="Ngày trồng" value={formatVN(meta.plantedAt)} />
                  <Field
                    label="Tuổi trước khi trồng"
                    value={`${meta.preNurseryAgeMonths} tháng`}
                  />
                  <Field label="Loại đất" value={meta.soil || "—"} />
                  <Field
                    label="Tuổi từ lúc trồng"
                    value={`${ageAfterPlant} tháng`}
                  />
                  <Field label="Vị trí" value={`${meta.location} · ${meta.plot}`} />
                  <Field label="Tổng tuổi" value={`${totalAge} tháng`} />
                </CardContent>
              ) : (
                <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="grid gap-1">
                    <label className="text-xs text-neutral-600">Tên thường gọi</label>
                    <Input
                      value={meta.name}
                      onChange={(e) =>
                        setMeta((s) => ({ ...s, name: e.target.value }))
                      }
                      disabled={isStopped}
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs text-neutral-600">
                      Nhân viên chăm sóc
                    </label>
                    <Input
                      value={meta.caretaker}
                      disabled
                      readOnly
                      title="Khóa theo nghiệp vụ — đổi tại Quản lý vườn"
                      className="bg-neutral-100 cursor-not-allowed"
                    />
                    <div className="text-[11px] text-neutral-500">
                      * Khóa theo nghiệp vụ: Farmer gán nhân viên theo <b>Vườn</b>.
                      Đổi tại màn <b>Quản lý vườn</b>.
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs text-neutral-600">Ngày trồng</label>
                    <Input
                      type="date"
                      value={meta.plantedAt}
                      max="9999-12-31"
                      onChange={(e) =>
                        setMeta((s) => ({ ...s, plantedAt: e.target.value }))
                      }
                      disabled={isStopped}
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs text-neutral-600">Giống/Variety</label>
                    <Input
                      value={meta.variety}
                      onChange={(e) =>
                        setMeta((s) => ({ ...s, variety: e.target.value }))
                      }
                      disabled={isStopped}
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs text-neutral-600">
                      Tuổi trước khi trồng (tháng)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={meta.preNurseryAgeMonths}
                      onChange={(e) => {
                        const v = parseInt(e.target.value || "0", 10);
                        setMeta((s) => ({
                          ...s,
                          preNurseryAgeMonths: isNaN(v) ? 0 : Math.max(0, v),
                        }));
                      }}
                      disabled={isStopped}
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs text-neutral-600">Loại đất</label>
                    <Input
                      value={meta.soil}
                      onChange={(e) =>
                        setMeta((s) => ({ ...s, soil: e.target.value }))
                      }
                      disabled={isStopped}
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs text-neutral-600">
                      Khu vực/Vị trí
                    </label>
                    <Input
                      value={meta.location}
                      disabled
                      readOnly
                      title="Khóa theo nghiệp vụ — đổi tại Quản lý vườn"
                      className="bg-neutral-100 cursor-not-allowed"
                    />
                    <div className="text-[11px] text-neutral-500">
                      * Thuộc tính của <b>Vườn</b> (đổi tại Quản lý vườn).
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs text-neutral-600">Lô/Thửa</label>
                    <Input
                      value={meta.plot}
                      disabled
                      readOnly
                      title="Khóa theo nghiệp vụ — đổi tại Quản lý vườn"
                      className="bg-neutral-100 cursor-not-allowed"
                    />
                    <div className="text-[11px] text-neutral-500">
                      * Thuộc tính của <b>Vườn</b> (đổi tại Quản lý vườn).
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs text-neutral-600">Trạng thái</label>
                    <Select
                      value={meta.status}
                      onChange={(e) => {
                        const next = e.target.value;
                        if (next === meta.status) return;
                        setStatusModal({ open: true, next });
                      }}
                      className="appearance-none pr-8"
                    >
                      <option value="active">Đang chăm sóc</option>
                      <option value="stopped">Dừng hoạt động</option>
                    </Select>
                    <div className="text-[11px] text-neutral-500">
                      * Màu hiển thị thay đổi theo trạng thái.
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingMeta(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={() => {
                        setMeta((s) => ({
                          ...s,
                          preNurseryAgeMonths: Math.max(
                            0,
                            parseInt(s.preNurseryAgeMonths || 0, 10) || 0
                          ),
                        }));
                        setEditingMeta(false);
                      }}
                    >
                      Lưu
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Sinh trưởng */}
            <Card>
              <CardHeader className="flex items-center justify-between !border-b-0 pb-0">
                <CardTitle className="flex items-center gap-3">
                  Sinh trưởng
                  <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-600 text-white text-xs px-2 py-0.5">
                    {phen.stage || tree.phenology?.stage || tree.phase}
                  </span>
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setEditingPhen((v) => !v)}
                  disabled={isStopped}
                  title={isStopped ? "Cây đang Dừng hoạt động — chỉ xem" : undefined}
                >
                  {editingPhen ? "Hủy" : "Cập nhật"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 text-sm pt-0">
                {!editingPhen ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium mb-1">
                          Mốc sinh trưởng (mới → cũ)
                        </div>
                        <ul className="list-disc ml-5 space-y-1">
                          {sortEventsDesc(
                            phen.events || predictPhenologyEvents(tree)
                          ).map((e, i) => {
                            const upcoming = daysBetween(e.d, today()) <= 0;
                            return (
                              <li key={i} className="flex items-center gap-2">
                                <span>
                                  {formatVN(e.d)} — {e.note}
                                </span>
                                {upcoming && (
                                  <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px] px-1.5 py-0.5">
                                    dự kiến
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <Field label="Tình trạng" value={phen.status || "—"} />
                        <Field
                          label="Tình trạng chăm sóc trước đó"
                          value={phen.prevCare || "—"}
                        />
                        <Field
                          label="Chi tiết (lá, rễ, gốc…)"
                          value={phen.leafRootNote || "—"}
                        />
                        <Field
                          label="Đặc điểm thời điểm cây"
                          value={phen.seasonNote || "—"}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-1 md:col-span-2">
                      <label className="text-xs text-neutral-600">
                        Giai đoạn (ghi đè)
                      </label>
                      <Select
                        value={phen.stage}
                        onChange={(e) =>
                          setPhen({ ...phen, stage: e.target.value })
                        }
                        disabled={isStopped}
                      >
                        <option value="">— Chọn giai đoạn —</option>
                        {STAGE_OPTIONS.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="grid gap-1">
                      <label className="text-xs text-neutral-600">Tình trạng</label>
                      <Textarea
                        rows={3}
                        value={phen.status}
                        onChange={(e) =>
                          setPhen({ ...phen, status: e.target.value })
                        }
                        placeholder="Ví dụ: Lá bị vàng/ hoa rụng nhiều..."
                        disabled={isStopped}
                      />
                    </div>

                    <div className="grid gap-1">
                      <label className="text-xs text-neutral-600">
                        Tình trạng chăm sóc trước đó
                      </label>
                      <Textarea
                        rows={3}
                        value={phen.prevCare}
                        onChange={(e) =>
                          setPhen({ ...phen, prevCare: e.target.value })
                        }
                        placeholder="Các biện pháp, tần suất, ghi chú..."
                        disabled={isStopped}
                      />
                    </div>

                    <div className="grid gap-1">
                      <label className="text-xs text-neutral-600">
                        Chi tiết (lá, rễ, gốc…)
                      </label>
                      <Textarea
                        rows={3}
                        value={phen.leafRootNote}
                        onChange={(e) =>
                          setPhen({ ...phen, leafRootNote: e.target.value })
                        }
                        placeholder="Ví dụ: lá có đốm, rễ trắng, gốc rỉ nhựa..."
                        disabled={isStopped}
                      />
                    </div>

                    <div className="grid gap-1">
                      <label className="text-xs text-neutral-600">
                        Đặc điểm thời điểm
                      </label>
                      <Textarea
                        rows={3}
                        value={phen.seasonNote}
                        onChange={(e) =>
                          setPhen({ ...phen, seasonNote: e.target.value })
                        }
                        placeholder="Mùa mưa/khô, nhiệt độ, đợt gió chướng..."
                        disabled={isStopped}
                      />
                    </div>

                    {/* Các mốc thời gian */}
                    <div className="md:col-span-2 grid gap-2">
                      <label className="text-xs text-neutral-600">
                        Các mốc thời gian (YYYY-MM-DD — ghi chú)
                      </label>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="date"
                          value={eventPick.date}
                          max="9999-12-31"
                          onChange={(e) =>
                            setEventPick((s) => ({
                              ...s,
                              date: e.target.value,
                            }))
                          }
                          className="sm:w-48"
                          disabled={isStopped}
                        />
                        <Input
                          placeholder="Ghi chú mốc (ví dụ: Ra hoa lứa 1)"
                          value={eventPick.note}
                          onChange={(e) =>
                            setEventPick((s) => ({
                              ...s,
                              note: e.target.value,
                            }))
                          }
                          disabled={isStopped}
                        />
                        <Button onClick={addPickedEvent} disabled={isStopped}>
                          Thêm mốc
                        </Button>
                      </div>

                      <Textarea
                        rows={6}
                        value={eventsText}
                        onChange={(e) => setEventsText(e.target.value)}
                        placeholder={"2024-03-01 — Ươm cây\n2024-04-15 — Trồng cây"}
                        disabled={isStopped}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setEventsText(
                              eventsToText(predictPhenologyEvents(tree))
                            )
                          }
                          disabled={isStopped}
                        >
                          Tự tính từ AI
                        </Button>
                        <Button
                          onClick={() => {
                            const parsed = parseEvents(eventsText);
                            setPhen({
                              ...phen,
                              events: sortEventsDesc(parsed),
                            });
                            setEditingPhen(false);
                          }}
                          className="gap-2"
                          disabled={isStopped}
                        >
                          Lưu
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Công việc đã lên kế hoạch */}
            <Card>
              <CardHeader>
                <CardTitle>Các công việc đã lên kế hoạch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <TypeSwitch
                    type="water"
                    overdue={overdueCounts.water}
                    active={activeType === "water"}
                    onClick={() => setActiveType("water")}
                  />
                  <TypeSwitch
                    type="fert"
                    overdue={overdueCounts.fert}
                    active={activeType === "fert"}
                    onClick={() => setActiveType("fert")}
                  />
                  <TypeSwitch
                    type="pest"
                    overdue={overdueCounts.pest}
                    active={activeType === "pest"}
                    onClick={() => setActiveType("pest")}
                  />

                  <div className="flex items-center gap-1 ml-auto">
                    <Input
                      placeholder="Tìm kiếm..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-9 w-56"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <FilterChip
                    active={statusFilter === "all"}
                    onClick={() => setStatusFilter("all")}
                  >
                    Tất cả
                  </FilterChip>
                  <FilterChip
                    active={statusFilter === "todo"}
                    onClick={() => setStatusFilter("todo")}
                  >
                    Việc cần làm
                  </FilterChip>
                  <FilterChip
                    active={statusFilter === "done"}
                    onClick={() => setStatusFilter("done")}
                  >
                    Đã hoàn thành
                  </FilterChip>

                  <div className="mx-2 h-4 w-px bg-neutral-200" />

                  <FilterChip
                    active={dateFilter === "all"}
                    onClick={() => setDateFilter("all")}
                  >
                    Tất cả
                  </FilterChip>
                  <FilterChip
                    active={dateFilter === "today"}
                    onClick={() => setDateFilter("today")}
                  >
                    Hôm nay
                  </FilterChip>
                  <FilterChip
                    active={dateFilter === "week"}
                    onClick={() => setDateFilter("week")}
                  >
                    Trong 7 ngày
                  </FilterChip>
                  <FilterChip
                    active={dateFilter === "overdue"}
                    onClick={() => setDateFilter("overdue")}
                  >
                    Quá hạn
                  </FilterChip>
                </div>

                <PlannedSection type={activeType} disabled={isStopped} />
              </CardContent>
            </Card>

            {/* Gợi ý AI & Thêm việc */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Gợi ý từ AI & Thêm việc</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <InCardToast show={toast.show} message={toast.msg} />

                {isStopped ? (
                  <div className="rounded-2xl border p-3 bg-white text-sm text-neutral-700">
                    <b>Đã dừng hoạt động:</b> Ngừng mọi gợi ý mới. Chỉ hiển thị
                    để tra cứu lịch sử.
                  </div>
                ) : (
                  <AISuggestionsList />
                )}

                {/* Thêm việc */}
                <section>
                  <div className="text-sm font-medium mb-2">Thêm việc</div>

                  <div className="flex items-center gap-2 mb-3">
                    <button
                      className={
                        "h-8 px-3 rounded-full text-xs border " +
                        (newKind === "main"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white hover:bg-neutral-50")
                      }
                      onClick={() => {
                        if (!isStopped) setNewKind("main");
                      }}
                      disabled={isStopped}
                      title={
                        isStopped ? "Cây đang Dừng hoạt động — chỉ xem" : undefined
                      }
                    >
                      Công việc CHÍNH
                    </button>

                    <button
                      className={
                        "h-8 px-3 rounded-full text-xs border " +
                        (newKind === "aux"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white hover:bg-neutral-50")
                      }
                      onClick={() => {
                        if (!isStopped) setNewKind("aux");
                      }}
                      disabled={isStopped}
                      title={
                        isStopped ? "Cây đang Dừng hoạt động — chỉ xem" : undefined
                      }
                    >
                      Công việc PHỤ
                    </button>
                  </div>

                  {newKind === "main" ? (
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="md:col-span-3">
                        <div className="text-xs text-neutral-600 mb-1">
                          Chọn hạng mục
                        </div>
                        <div className="flex gap-2">
                          <TypePick
                            value="water"
                            active={newMain.type === "water"}
                            onClick={() =>
                              !isStopped &&
                              setNewMain({ ...newMain, type: "water" })
                            }
                          />
                          <TypePick
                            value="fert"
                            active={newMain.type === "fert"}
                            onClick={() =>
                              !isStopped &&
                              setNewMain({ ...newMain, type: "fert" })
                            }
                          />
                          <TypePick
                            value="pest"
                            active={newMain.type === "pest"}
                            onClick={() =>
                              !isStopped &&
                              setNewMain({ ...newMain, type: "pest" })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-1">
                        <label className="text-xs text-neutral-600">Tiêu đề</label>
                        <Textarea
                          rows={2}
                          value={newMain.title}
                          onChange={(e) => {
                            setNewMain({ ...newMain, title: e.target.value });
                            setErrorsMain((x) => ({ ...x, title: undefined }));
                          }}
                          placeholder="Ví dụ: Tưới 10L/cây lúc sáng"
                          className={errorsMain.title ? "border-red-500" : undefined}
                          disabled={isStopped}
                        />
                        {errorsMain.title && (
                          <div className="text-xs text-red-500">
                            {errorsMain.title}
                          </div>
                        )}
                      </div>

                      <div className="grid gap-1">
                        <label className="text-xs text-neutral-600">Hạn</label>
                        <Input
                          type="date"
                          min={today()}
                          value={newMain.due}
                          onChange={(e) => {
                            setNewMain({ ...newMain, due: e.target.value });
                            setErrorsMain((x) => ({ ...x, due: undefined }));
                          }}
                          className={errorsMain.due ? "border-red-500" : ""}
                          disabled={isStopped}
                        />
                        {errorsMain.due && (
                          <div className="text-xs text-red-500">
                            {errorsMain.due}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-3 grid gap-1">
                        <label className="text-xs text-neutral-600">
                          Hướng dẫn chi tiết
                        </label>
                        <Textarea
                          rows={3}
                          value={newMain.details}
                          onKeyDown={(e) =>
                            handleNumberedKeyDown(e, (v) =>
                              setNewMain((s) => ({ ...s, details: v }))
                            )
                          }
                          onChange={(e) =>
                            setNewMain({ ...newMain, details: e.target.value })
                          }
                          placeholder="Mỗi dòng 1 ý: liều lượng, cách làm, ghi chú..."
                          disabled={isStopped}
                        />
                      </div>

                      <div className="md:col-span-3">
                        <Button
                          className="gap-2"
                          onClick={addManual}
                          disabled={isStopped}
                        >
                          + Thêm việc CHÍNH
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="grid gap-1">
                        <label className="text-xs text-neutral-600">
                          Tên công việc phụ
                        </label>
                        <Input
                          value={newAux.title}
                          onChange={(e) => {
                            setNewAux({ ...newAux, title: e.target.value });
                            setErrorsAux((x) => ({ ...x, title: undefined }));
                          }}
                          placeholder="Ví dụ: Tỉa cành, dọn cỏ, vệ sinh bồn"
                          className={errorsAux.title ? "border-red-500" : ""}
                          disabled={isStopped}
                        />
                        {errorsAux.title && (
                          <div className="text-xs text-red-500">
                            {errorsAux.title}
                          </div>
                        )}
                      </div>

                      <div className="grid gap-1">
                        <label className="text-xs text-neutral-600">
                          Hạn (tuỳ chọn)
                        </label>
                        <Input
                          type="date"
                          min={today()}
                          value={newAux.due}
                          onChange={(e) => {
                            setNewAux({ ...newAux, due: e.target.value });
                            setErrorsAux((x) => ({ ...x, due: undefined }));
                          }}
                          className={errorsAux.due ? "border-red-500" : ""}
                          disabled={isStopped}
                        />
                        {errorsAux.due && (
                          <div className="text-xs text-red-500">
                            {errorsAux.due}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-3 grid gap-1">
                        <label className="text-xs text-neutral-600">Ghi chú</label>
                        <Textarea
                          rows={3}
                          value={newAux.details}
                          onKeyDown={(e) =>
                            handleNumberedKeyDown(e, (v) =>
                              setNewAux((s) => ({ ...s, details: v }))
                            )
                          }
                          onChange={(e) =>
                            setNewAux({ ...newAux, details: e.target.value })
                          }
                          placeholder="Mỗi dòng 1 ý: dụng cụ, cách làm, an toàn lao động..."
                          disabled={isStopped}
                        />
                      </div>

                      <div className="md:col-span-3">
                        <Button
                          className="gap-2"
                          onClick={addManual}
                          disabled={isStopped}
                        >
                          + Thêm việc PHỤ
                        </Button>
                      </div>
                    </div>
                  )}
                </section>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT (Aside) */}
          <aside className="col-span-12 xl:col-span-3">
            <div
              className="
                space-y-6
      xl:sticky xl:top-24
      xl:overflow-visible
      xl:pr-2
    "
            >
              <AsideCards
                image={image}
                setImage={setImage}
                codeKey={codeKey}
                phen={phen}
                tree={tree}
                auxTasks={auxTasks}
                planned={planned}
                openEditNote={openEditNote}
                openEditAux={openEditAux}
                openAuxComplete={(id) => openAuxComplete(id)}
                note={note}
                onSaveNote={saveNote}
                readOnly={isStopped}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* --------------------------- Modals --------------------------- */}

      {/* Confirm đổi trạng thái cây */}
      {statusModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="text-lg font-semibold">Xác nhận đổi trạng thái</div>
              <button
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-neutral-50"
                onClick={() =>
                  setStatusModal({ open: false, next: meta.status })
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {(() => {
              const th = STATUS_THEME[statusModal.next] || STATUS_THEME.active;
              const current = STATUS_THEME[meta.status] || STATUS_THEME.active;
              return (
                <div className="p-6 space-y-4 text-sm">
                  <div className="rounded-xl border p-3">
                    <div className="mb-1">Bạn đang đổi trạng thái:</div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge className={"border " + current.pill}>
                        {current.title}
                      </Badge>
                      <span>→</span>
                      <Badge className={"border " + th.pill}>
                        {th.title}
                      </Badge>
                    </div>
                    <div className="mt-3 text-neutral-700">{th.desc}</div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setStatusModal({ open: false, next: meta.status })
                      }
                    >
                      Huỷ
                    </Button>
                    <Button
                      onClick={() => {
                        setMeta((s) => ({ ...s, status: statusModal.next }));
                        setStatusModal({ open: false, next: meta.status });
                      }}
                    >
                      Xác nhận
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Confirm thêm việc CHÍNH */}
      {confirmAddMain.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="text-lg font-semibold">Xác nhận thêm việc CHÍNH</div>
              <button
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-neutral-50"
                onClick={() =>
                  setConfirmAddMain({ open: false, snapshot: null })
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {(() => {
              const snap =
                confirmAddMain.snapshot || {
                  type: "water",
                  due: today(),
                  title: "",
                  details: [],
                };
              return (
                <div className="p-6 space-y-3 text-sm">
                  <div className="rounded-xl border p-3">
                    <div className="font-medium mb-2">Thông tin sẽ thêm</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={"border " + TYPE_THEME[snap.type].pill}>
                        {TYPE_THEME[snap.type].name}
                      </Badge>
                      <span>• Hạn: {formatVN(snap.due)}</span>
                    </div>
                    <div className="mt-2 font-semibold">{snap.title}</div>
                    {Array.isArray(snap.details) && snap.details.length > 0 ? (
                      <ol className="ml-5 list-decimal mt-1 space-y-1">
                        {snap.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ol>
                    ) : (
                      <div className="text-xs text-neutral-500 mt-1">
                        Không có hướng dẫn chi tiết.
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setConfirmAddMain({ open: false, snapshot: null })
                      }
                    >
                      Huỷ
                    </Button>
                    <Button onClick={() => performAddMain(snap)} disabled={isStopped}>
                      Xác nhận thêm
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {completeModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="text-lg font-semibold">
                Ghi chú thực tế & hoàn thành
              </div>
              <button
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-neutral-50"
                onClick={() =>
                  setCompleteModal({ open: false, forId: undefined, note: "" })
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="rounded-xl border p-3 text-sm">
                <div className="font-medium">Xác nhận hoàn thành công việc</div>
              </div>

              <Textarea
                rows={5}
                value={completeModal.note}
                onChange={(e) =>
                  setCompleteModal((m) => ({ ...m, note: e.target.value }))
                }
                placeholder="VD: kế hoạch tưới 2L, thực tế 1L do đất còn ẩm... (có thể để trống)"
                disabled={isStopped}
              />

              <div className="flex justify-end">
                <Button onClick={confirmComplete} className="gap-2" disabled={isStopped}>
                  ✓ Hoàn thành
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {auxCompleteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="text-lg font-semibold">
                Ghi chú thực tế & hoàn thành (Việc phụ)
              </div>
              <button
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-neutral-50"
                onClick={() =>
                  setAuxCompleteModal({
                    open: false,
                    forId: undefined,
                    note: "",
                  })
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="rounded-xl border p-3 text-sm">
                <div className="font-medium">Xác nhận hoàn thành việc phụ</div>
              </div>

              <Textarea
                rows={5}
                value={auxCompleteModal.note}
                onChange={(e) =>
                  setAuxCompleteModal((m) => ({ ...m, note: e.target.value }))
                }
                placeholder="Ghi chú thực tế..."
                disabled={isStopped}
              />

              <div className="flex justify-end">
                <Button
                  onClick={confirmAuxComplete}
                  className="gap-2"
                  disabled={isStopped}
                >
                  ✓ Hoàn thành
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {noteModal.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="text-lg font-semibold">
                Chỉnh sửa ghi chú hoàn thành
              </div>
              <button
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-neutral-50"
                onClick={() =>
                  setNoteModal({
                    open: false,
                    type: "main",
                    forId: undefined,
                    note: "",
                  })
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <Textarea
                rows={6}
                value={noteModal.note}
                onChange={(e) =>
                  setNoteModal((m) => ({ ...m, note: e.target.value }))
                }
                placeholder="Nhập ghi chú"
                disabled={isStopped}
              />
              <div className="flex justify-end">
                <Button onClick={saveNoteModal} className="gap-2" disabled={isStopped}>
                  Lưu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editMain.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="text-lg font-semibold">Sửa công việc (Chính)</div>
              <button
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-neutral-50"
                onClick={() =>
                  setEditMain({
                    open: false,
                    forId: undefined,
                    title: "",
                    type: "water",
                    due: today(),
                    details: "",
                  })
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="text-xs text-neutral-600">Hạng mục</div>
              <div className="flex gap-2 mb-2">
                <TypePick
                  value="water"
                  active={editMain.type === "water"}
                  onClick={() =>
                    setEditMain((s) => ({ ...s, type: "water" }))
                  }
                />
                <TypePick
                  value="fert"
                  active={editMain.type === "fert"}
                  onClick={() =>
                    setEditMain((s) => ({ ...s, type: "fert" }))
                  }
                />
                <TypePick
                  value="pest"
                  active={editMain.type === "pest"}
                  onClick={() =>
                    setEditMain((s) => ({ ...s, type: "pest" }))
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-xs text-neutral-600">Tiêu đề</label>
                  <Input
                    value={editMain.title}
                    onChange={(e) =>
                      setEditMain((s) => ({ ...s, title: e.target.value }))
                    }
                    disabled={isStopped}
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-neutral-600">Hạn</label>
                  <Input
                    type="date"
                    min={today()}
                    value={editMain.due}
                    onChange={(e) =>
                      setEditMain((s) => ({ ...s, due: e.target.value }))
                    }
                    disabled={isStopped}
                  />
                </div>
                <div className="md:col-span-2 grid gap-1">
                  <label className="text-xs text-neutral-600">
                    Hướng dẫn chi tiết
                  </label>
                  <Textarea
                    rows={4}
                    value={editMain.details}
                    onKeyDown={(e) =>
                      handleNumberedKeyDown(e, (v) =>
                        setEditMain((s) => ({ ...s, details: v }))
                      )
                    }
                    onChange={(e) =>
                      setEditMain((s) => ({ ...s, details: e.target.value }))
                    }
                    disabled={isStopped}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  className="bg-rose-600 hover:bg-rose-700"
                  onClick={() => askDeleteMain(editMain.forId)}
                  disabled={isStopped}
                >
                  Xoá công việc
                </Button>
                <Button onClick={saveEditMain} disabled={isStopped}>
                  Lưu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editAux.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="text-lg font-semibold">Sửa công việc (Phụ)</div>
              <button
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-neutral-50"
                onClick={() =>
                  setEditAux({
                    open: false,
                    forId: undefined,
                    title: "",
                    due: today(),
                    details: "",
                  })
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-xs text-neutral-600">
                    Tên công việc
                  </label>
                  <Input
                    value={editAux.title}
                    onChange={(e) =>
                      setEditAux((s) => ({ ...s, title: e.target.value }))
                    }
                    disabled={isStopped}
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs text-neutral-600">Hạn</label>
                  <Input
                    type="date"
                    min={today()}
                    value={editAux.due}
                    onChange={(e) =>
                      setEditAux((s) => ({ ...s, due: e.target.value }))
                    }
                    disabled={isStopped}
                  />
                </div>
                <div className="md:col-span-2 grid gap-1">
                  <label className="text-xs text-neutral-600">Ghi chú</label>
                  <Textarea
                    rows={4}
                    value={editAux.details}
                    onKeyDown={(e) =>
                      handleNumberedKeyDown(e, (v) =>
                        setEditAux((s) => ({ ...s, details: v }))
                      )
                    }
                    onChange={(e) =>
                      setEditAux((s) => ({ ...s, details: e.target.value }))
                    }
                    disabled={isStopped}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  className="bg-rose-600 hover:bg-rose-700"
                  onClick={() => askDeleteAux(editAux.forId)}
                  disabled={isStopped}
                >
                  Xoá việc phụ
                </Button>
                <Button onClick={saveEditAux} disabled={isStopped}>
                  Lưu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDel.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-4 border-b text-lg font-semibold">
              Xác nhận xoá
            </div>
            <div className="p-6 text-sm">
              Bạn có chắc muốn xoá công việc này? Hành động này không thể hoàn
              tác.
            </div>
            <div className="px-6 pb-6 flex items-center justify-end gap-2">
              <button
                className="h-9 px-3 rounded-xl border bg-white hover:bg-neutral-50"
                onClick={() =>
                  setConfirmDel({ open: false, type: "main", forId: undefined })
                }
              >
                Huỷ
              </button>
              <Button
                onClick={() => {
                  confirmDelete();
                  setEditMain({
                    open: false,
                    forId: undefined,
                    title: "",
                    type: "water",
                    due: today(),
                    details: "",
                  });
                  setEditAux({
                    open: false,
                    forId: undefined,
                    title: "",
                    due: today(),
                    details: "",
                  });
                }}
                disabled={isStopped}
              >
                Xoá
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete TREE */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-4 ring-rose-500/20 border border-rose-300">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-rose-50">
              <div className="text-lg font-semibold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Xóa cây — Hành động không thể hoàn tác
              </div>
              <button
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white"
                onClick={() => setDeleteModal({ open: false, confirmText: "" })}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="rounded-xl border p-3 bg-rose-50/60">
                <div>
                  Bạn sắp xóa cây <b>{meta.name}</b> với mã <b>#{codeKey}</b>.
                </div>
                <ul className="list-disc ml-5 mt-2 space-y-1 text-rose-800">
                  <li>Xóa tất cả <b>công việc đã lên kế hoạch</b> và trạng thái hoàn thành.</li>
                  <li>Xóa toàn bộ <b>việc phụ</b> liên quan.</li>
                  <li>Xóa <b>ghi chú</b> đã lưu theo mã cây.</li>
                  <li>Xóa <b>ảnh</b> đã đồng bộ theo mã cây (LocalStorage).</li>
                </ul>
              </div>

              <div className="rounded-xl border p-3">
                <div className="font-medium mb-1">
                  Nhập <b>{codeKey}</b> để xác nhận:
                </div>
                <Input
                  placeholder={`Nhập chính xác: ${codeKey}`}
                  value={deleteModal.confirmText}
                  onChange={(e) =>
                    setDeleteModal((s) => ({ ...s, confirmText: e.target.value }))
                  }
                />
                <div className="text-xs text-neutral-500 mt-1">
                  Sau khi xác nhận, dữ liệu sẽ bị xoá khỏi phiên hiện tại.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setDeleteModal({ open: false, confirmText: "" })
                  }
                >
                  Huỷ
                </Button>
                <Button
                  onClick={performDeleteTree}
                  className="bg-rose-600 hover:bg-rose-700"
                  disabled={deleteModal.confirmText.trim() !== codeKey}
                >
                  Xóa vĩnh viễn
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   Small components & helpers
   ========================================================================= */
function Field({ label, value, icon }) {
  return (
    <div className="flex items-start gap-2">
      {icon ? <div className="mt-0.5">{icon}</div> : null}
      <div className="w-44 text-neutral-600 shrink-0">{label}</div>
      <div className="font-medium text-neutral-800">{value || "—"}</div>
    </div>
  );
}
function TypeSwitch({ type, active, onClick, overdue = 0 }) {
  const theme = TYPE_THEME[type];
  const icon =
    type === "water" ? (
      <Droplets className="h-4 w-4" />
    ) : type === "fert" ? (
      <Leaf className="h-4 w-4" />
    ) : (
      <AlertTriangle className="h-4 w-4" />
    );
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative h-9 rounded-full px-3 gap-2 border flex items-center " +
        (active ? theme.activeBtn : "bg-white hover:bg-neutral-50")
      }
    >
      {icon}
      <span className="text-sm">{theme.name}</span>
      {overdue > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] leading-[18px] text-center border border-white shadow">
          {overdue > 99 ? "99+" : overdue}
        </span>
      )}
    </button>
  );
}
function TypePick({ value, active, onClick }) {
  const theme = TYPE_THEME[value];
  const icon =
    value === "water" ? (
      <Droplets className="h-4 w-4" />
    ) : value === "fert" ? (
      <Leaf className="h-4 w-4" />
    ) : (
      <AlertTriangle className="h-4 w-4" />
    );
  return (
    <button
      onClick={onClick}
      className={
        "h-9 px-3 rounded-full border flex items-center gap-2 " +
        (active ? theme.activeBtn : "bg-white hover:bg-neutral-50")
      }
      title={theme.name}
    >
      {icon}
      <span className="text-sm">{theme.name}</span>
    </button>
  );
}
function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "h-8 px-3 rounded-full text-xs border " +
        (active
          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
          : "bg-white hover:bg-neutral-50")
      }
    >
      {children}
    </button>
  );
}
function labelStatus(s) {
  switch (s) {
    case "stopped":
      return "Dừng hoạt động";
    default:
      return "Đang chăm sóc";
  }
}

/* =========================================================================
   AI Suggestions (demo)
   ========================================================================= */
function getAISuggestions(tree) {
  if ((tree.phase || "").toLowerCase().includes("ra hoa")) {
    return [
      {
        type: "fert",
        title: "Phun Bo + Canxi trước nở",
        due: addDays(2),
        details: [
          "Liều: theo khuyến cáo NSX",
          "Phun lúc sáng sớm",
          "Tránh nắng gắt",
        ],
      },
      {
        type: "pest",
        title: "Theo dõi rầy chổng cánh",
        due: addDays(3),
        details: ["Đặt bẫy dính vàng", "Quan sát lá non mép cuộn"],
      },
    ];
  }
  return [
    {
      type: "water",
      title: "Tưới giữ ẩm 70–80%",
      due: addDays(1),
      details: ["10–12L/cây", "Kiểm tra ẩm 20–30cm"],
    },
    {
      type: "fert",
      title: "Bổ sung NPK cân đối",
      due: addDays(5),
      details: ["200–300g/cây", "Rải đều theo tán, lấp nhẹ"],
    },
  ];
}

/* nhỏ: tránh chia trang lỗi khi total=0 */
function pagesanity(total) {
  if (total < 0) {
    /* noop */
  }
}

