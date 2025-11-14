import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { LivingBackground } from "@/components/background";
import { computeInitialPhase, normalizePhaseBeforeSave } from "@/lib/treePhase";
import TreeInfoPanel from "@/components/tree/TreeInfoPanel";
import Section from "@/components/Section";
import { getTreeById, TREES, TREES_ARRAY } from "@/data/demoTrees";
// Đồng bộ lại dữ liệu cây vào demoTrees (TREES + TREES_ARRAY)
// để các màn khác (TreeManagement) đọc được cùng 1 nguồn.
function syncTreePatch(codeKey, patch) {
  if (!codeKey || !patch) return;

  // Cập nhật TREES dạng map
  if (TREES && TREES[codeKey]) {
    TREES[codeKey] = {
      ...TREES[codeKey],
      ...patch,
    };
  }

  // Cập nhật trong TREES_ARRAY
  if (Array.isArray(TREES_ARRAY)) {
    const idx = TREES_ARRAY.findIndex(
      (t) => String(t.id) === String(codeKey)
    );
    if (idx !== -1) {
      TREES_ARRAY[idx] = {
        ...TREES_ARRAY[idx],
        ...patch,
      };
    }
  }
}

import { useParams, useLocation } from "react-router-dom";

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
  ChevronDown,
   ArrowDown,
   Activity,
} from "lucide-react";

const TYPE_THEME = {
  water: {
    name: "Tưới tiêu",
    pill: "border-emerald-300 bg-emerald-50 text-emerald-800",
    activeBtn: "bg-emerald-600 text-white border-emerald-600",
    edge: "border-emerald-500"
  },
  fert: {
    name: "Phân bón",
    pill: "border-lime-300 bg-lime-50 text-lime-800",
    activeBtn: "bg-lime-600 text-white border-lime-600",
    edge: "border-lime-500"
  },
  pest: {
    name: "Sâu bệnh",
    pill: "border-rose-300 bg-rose-50 text-rose-800",
    activeBtn: "bg-rose-600 text-white border-rose-600",
    edge: "border-rose-500"
  },
  other: {
    name: "Khác",
    pill: "border-neutral-300 bg-neutral-50 text-neutral-800",
    activeBtn: "bg-neutral-800 text-white border-neutral-800",
    edge: "border-neutral-500"
  }
};

const STATUS_THEME = {
  active: {
    title: "Đang chăm sóc",
    pill: "border-emerald-300 bg-emerald-50 text-emerald-800",
    desc: "Các tính năng chỉnh sửa đều mở."
  },
  stopped: {
    title: "Dừng hoạt động",
    pill: "border-gray-300 bg-gray-50 text-gray-700",
    desc: "Chỉ xem, khoá các hành động tạo/sửa/xoá."
  }
};

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

// ===== Hero/Header đơn giản ======================
function PageHero({ breadcrumb, title, subtitle, right }) {
  return (
    <header className="relative">
      <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-10 2xl:px-16 pt-20 md:pt-24">
        <div className="flex items-start justify-between gap-4">
          <div>
            {/* Tiêu đề */}
            <h1 className="text-white text-3xl sm:text-4xl font-extrabold">
              {title || "Chi tiết cây"}
            </h1>

            {/* ⬇️ DI CHUYỂN TAG XUỐNG DƯỚI H1 */}
            {breadcrumb ? (
              <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-800">
                {breadcrumb}
              </div>
            ) : null}

            {/* Mô tả */}
            {subtitle ? (
              <p className="mt-2 text-sm md:text-base text-emerald-50/90 max-w-3xl">
                {subtitle}
              </p>
            ) : null}
          </div>

          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      </div>
    </header>
  );
}



/* =========================================================================
   Tiny UI — thẻ cơ bản
   ========================================================================= */
const Card = ({ className = "", children }) => (
  <div
    className={
      // giấy trắng, viền mảnh + shadow sâu, bo lớn, hover nhấc card
      "rounded-3xl border border-neutral-200 bg-white shadow-[0_8px_28px_rgba(2,6,23,0.08)] " +
      "transition-shadow hover:shadow-[0_14px_40px_rgba(2,6,23,0.12)] " +
      className
    }
  >
    {children}
  </div>
);
const CardHeader = ({ className = "", children }) => (
  <div
    className={
      // header thoáng + đường viền sáng + khoảng cách lớn
      "px-6 pt-5 pb-3 border-b border-neutral-200/80 flex items-center justify-between " +
      className
    }
  >
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
// === Base inputs (phóng to)
const Input = ({ className = "", ...props }) => (
  <input
    className={
      "h-12 w-full rounded-2xl border px-4 py-2.5 text-base outline-none " +
      "focus:ring-2 focus:ring-neutral-300 " +
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
      "w-full rounded-2xl border px-4 py-2.5 text-base outline-none " +
      "focus:ring-2 focus:ring-neutral-300 " +
      (props.disabled ? "bg-neutral-100 cursor-not-allowed " : "") +
      className
    }
    {...props}
  />
);

const Select = ({ className = "", children, ...props }) => (
  <select
    className={
      "h-12 w-full rounded-2xl border px-4 py-2.5 text-base outline-none bg-white " +
      "focus:ring-2 focus:ring-neutral-300 " +
      (props.disabled ? "bg-neutral-100 cursor-not-allowed " : "") +
      className
    }
    {...props}
  >
    {children}
  </select>
);
/* === ComboBox (typeahead dropdown, bo tròn, đẹp) ======================= */
function ComboBox({
  value = "",
  onChange,
  options = [],
  placeholder = "",
  disabled = false,
  className = "",
  emptyText = "Không có gợi ý phù hợp",
  allowCreate = false,
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value || "");
  const [active, setActive] = React.useState(0);
  const [invalidFlash, setInvalidFlash] = React.useState(false);
  const boxRef = React.useRef(null);
  const inputRef = React.useRef(null);            // ★ thêm ref cho input
  const isCommittingRef = React.useRef(false);    // ★ cờ cho biết đang commit chọn
  const baseFocusRing = invalidFlash ? "focus:ring-rose-500" : "focus:ring-emerald-500/70";
  const [showAll, setShowAll] = React.useState(false);

  const norm = (s) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim();

  const filtered = React.useMemo(() => {
    const q = norm(query);
    if (!q) return options;
    return options.filter((o) => norm(o).includes(q));
  }, [options, query]);

 const visible = showAll ? options : filtered;

  React.useEffect(() => setQuery(value || ""), [value]);

  // Đóng khi click ngoài
  React.useEffect(() => {
    function onDocClick(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) { setOpen(false); setShowAll(false); }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function commit(val) {
    if (disabled) return;
isCommittingRef.current = true;        
    // chỉ nhận option khi không cho tạo mới
    if (!allowCreate) {
      const match = options.find((o) => norm(o) === norm(val));
      if (!match) return;
      val = match;
    }

    // ★ báo đang commit để onBlur không reset ngược
    isCommittingRef.current = true;

    // cập nhật cho parent + UI
    if (typeof onChange === "function") onChange(val);
    setQuery(val);            // ★ đồng bộ hiển thị ngay
    
    setOpen(false); 

    // ★ blur thủ công để tắt viền focus
    requestAnimationFrame(() => {
      try { inputRef.current?.blur(); } catch {}
      // nhả cờ sau 1 tick để onBlur không chạy reset
      setTimeout(() => { isCommittingRef.current = false; }, 0);
    });
    setTimeout(() => {                       // ★ tắt guard sau khi render ổn định
    isCommittingRef.current = false;
  }, 0);
  }

  function onKeyDown(e) {
    if (disabled) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min((visible.length || 1) - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick =
        visible.length > 0                                   // ★
          ? visible[Math.max(0, Math.min(active, visible.length - 1))]
          : null;
      if (pick) {
        commit(pick);     // ★ Enter cũng blur sau commit
      } else {
        if (!allowCreate) {
          setInvalidFlash(true);
          setTimeout(() => setInvalidFlash(false), 400);
          return;
        }
        if (query.trim()) commit(query.trim());
      }
    } else if (e.key === "Escape") {
      setOpen(false); setShowAll(false);
    }
  }

  function onBlur() {
    if (allowCreate) {
      setTimeout(() => { setOpen(false); setShowAll(false); }, 0);
      return;
    }

    setTimeout(() => {
      // ★ nếu vừa commit, bỏ qua reset lần blur này
      if (isCommittingRef.current) { setOpen(false); return; }

      const q = query.trim();
      const match = options.find((o) => norm(o) === norm(q));
      if (!match) setQuery(value || "");
      setOpen(false); setShowAll(false);
    }, 0);
  }

  return (
    <div ref={boxRef} className={"relative " + className}>
      <input
        ref={inputRef}                           // ★ gắn ref
        value={query}
        onChange={(e) => {
    if (isCommittingRef.current) return;   // ★ đừng mở lại ngay sau commit
    setQuery(e.target.value);
    setOpen(true);
    setShowAll(false);
  }}
  onFocus={() => { if (!isCommittingRef.current) setOpen(true); }}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalidFlash ? "true" : "false"}
        className={
          "h-12 w-full rounded-2xl border px-4 pr-10 py-2.5 text-base outline-none " +
          "focus:ring-2 " + baseFocusRing + " bg-white " +
          "focus:outline-none " +
          (disabled ? "bg-neutral-100 cursor-not-allowed " : "") +
          (invalidFlash ? " ring-2 ring-rose-500 border-rose-500 " : "")
        }
      />
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); }}  // giữ focus khi mở/đóng
        onClick={() => {
      if (disabled) return;
      setShowAll(true);     // ★ luôn hiển thị toàn bộ khi mở bằng chevron
      setOpen((v) => !v);
      setActive(0);         // ★ trỏ về dòng đầu
    }}
        className={
          "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-xl " +
          (disabled ? "text-neutral-400" : "hover:bg-neutral-100")
        }
        tabIndex={-1}
        aria-label="Mở danh sách"
      >
        <ChevronDown className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 mt-1 z-[100] rounded-2xl border bg-white shadow-2xl overflow-hidden"
          role="listbox"
        >
          <div className="max-h-60 overflow-auto py-1">
            {visible.length === 0 ? (   
              <div className="px-3 py-2 text-sm text-neutral-500">{emptyText}</div>
            ) : (
              visible.map((opt, idx) => { 
                const isActive = idx === active;
                const isSelected = norm(opt) === norm(value);
                return (
                  <button
                    key={opt + idx}
                    type="button"
                    onMouseEnter={() => setActive(idx)}
                    onPointerDown={(e) => { e.preventDefault(); commit(opt); }} // click = commit + blur
                    className={
                      "w-full text-left px-3 py-2 text-[15px] flex items-center justify-between " +
                      (isActive ? "bg-emerald-50" : "bg-white hover:bg-neutral-50")
                    }
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}



/* === Options mẫu (có thể thay bằng data từ backend sau này) ============ */
const DROPDOWN_OPTIONS = {
  treeTypes: [
    "Xoài",
    "Bưởi",
    "Cam",
    "Sầu riêng",
    "Mít",
    "Thanh long",
    "Chanh",
    "Ổi",
    "Dừa",
  ],
  varietiesByType: {
    "Xoài": ["Cát Chu", "Hòa Lộc", "Keo", "Thái"],
    "Bưởi": ["Da Xanh", "Năm Roi", "Phúc Trạch"],
    "Cam": ["Sành", "Xã Đoài", "Vinh"],
    "Thanh long": ["Ruột Đỏ", "Ruột Trắng"],
    "Chanh": ["Không Hạt", "Tàu"],
    "Ổi": ["Đài Loan", "Xá Lị"],
    "Sầu riêng": ["Ri6", "Monthong"],
    "Mít": ["Thái Siêu Sớm", "Nghệ"],
    "Dừa": ["Dừa Xiêm", "Dừa Dứa"],
  },
  soils: [
    "Đất phù sa", 
    "Đất phù sa cao ráo",
    "Đất thịt nhẹ",
    "Đất thịt thoát nước tốt",
    "Đất pha cát",
    "Đất đỏ bazan",
    "Đất cát ven sông",
    "Đất phèn đã cải tạo",
  ],
};

// === Field (label + value) phóng to & khoảng cách to hơn
function Field({ label, value, icon }) {
  return (
    <div className="grid grid-cols-[168px,1fr] items-baseline gap-x-3 gap-y-1">
      {icon ? <div className="col-span-2 -mb-1">{icon}</div> : null}

      {/* Nhãn: to & đậm hơn */}
      <div className="text-[16px] md:text-[17px] font-bold text-neutral-900 leading-snug">
        {label}
      </div>

      {/* Giá trị: nhỏ hơn nhãn 1 nấc, vẫn đậm */}
      <div className="text-[15px] md:text-[16px] font-semibold text-neutral-900 leading-snug">
        {value || "—"}
      </div>
    </div>
  );
}
/* =========================================================================
   Constants & Demo Data
   ========================================================================= */


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
// === So khớp trong danh sách cho ComboBox (chuẩn hoá dấu/hoa-thường)
const _norm = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

function inList(val, list = []) {
  const v = _norm(val);
  return list.some((x) => _norm(x) === v);
}

// === Phase normalization (DB ↔ UI) ===
const PHASE_ID_ALIASES = {
  growth_development: [
    "growth", "sinh trưởng", "sinh truong", "phát triển", "phat trien",
    "sinh trưởng & phát triển", "phase1", "1"
  ],
  flowering: ["ra hoa", "flower", "2"],
 fruiting: ["ra quả","ra qua","đậu quả","dau qua","kết trái","ket trai","nuôi quả","nuoi qua","fruit","3"],
  pre_harvest: ["trước thu hoạch","truoc thu hoach","pre harvest","pre-harvest","4"],
  post_harvest: ["sau thu hoạch", "sau thu hoach", "post harvest", "5"],
};

function normalizePhaseId(x) {
  if (!x) return "growth_development";
  const s = String(x).trim().toLowerCase();
  if (PHASE_ID_ALIASES[s]) return s; // đã là id
  for (const [id, aliases] of Object.entries(PHASE_ID_ALIASES)) {
    if (id === s || aliases.includes(s)) return id;
  }
  return "growth_development";
}

function labelPhaseId(id) {
  switch (normalizePhaseId(id)) {
    case "flowering": return "Ra Hoa";
    case "fruiting":    return "Ra quả";
    case "pre_harvest": return "Trước thu hoạch";
    case "post_harvest": return "Sau thu hoạch";
    default: return "Sinh trưởng & Phát triển";
  }
}

// Back-compat cho code đang gọi hàm cũ:
function mapPhaseIdFromText(txt = "") { return normalizePhaseId(txt); }


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

  return (
    <div className="space-y-3">
      {!disabled ? (
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center justify-center gap-2 h-10 rounded-xl border bg-white px-3 text-sm cursor-pointer hover:bg-neutral-50">
            <Upload className="w-4 h-4" />
            <span>Chọn ảnh (tải lên)</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>

          <Button onClick={() => setLinkOpen(v => !v)} className="rounded-xl">
            <Link2 className="w-4 h-4 mr-1" />
            Dùng link
          </Button>
        </div>
      ) : (
        <div className="text-xs text-neutral-500">
          * Cây đang <b>Dừng hoạt động</b> — không thể thay ảnh. Bạn vẫn có thể bấm vào ảnh để mở.
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
          <Button onClick={applyUrl} className="rounded-xl">Áp dụng</Button>
          <Button variant="outline" onClick={() => { setLinkOpen(false); setUrlInput(""); }} className="rounded-xl">
            Huỷ
          </Button>
        </div>
      )}

      <div className="rounded-xl overflow-hidden border">
        <button
          type="button"
          onClick={() => value && window.open(value, "_blank")}
          title={value ? "Bấm để mở ảnh gốc" : ""}
          className={"w-full h-48 grid place-items-center bg-neutral-100 text-neutral-400 " + (value ? "cursor-zoom-in" : "cursor-default")}
        >
          {value ? (
            <img alt="tree" src={value} className="w-full h-48 object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8" />
          )}
        </button>
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
   Hàng lịch sử hoàn thành (đã gom theo type)
   ========================================================================= */
function DoneRow({ it }) {
  const rowRef = React.useRef(null);
  const [hover, setHover] = React.useState(false);

  const theme = TYPE_THEME[it.type] || TYPE_THEME.other;

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
            <Badge className={"border " + theme.pill}>{theme.name}</Badge>
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

/* Hàng công việc đã lên kế hoạch — NOTE sắc nét, căn baseline, đẩy sang phải */
/* Hàng công việc đã lên kế hoạch — NOTE tách sang phải, nền trắng, Sửa trong khung */
function PlannedRow({ p, theme, disabled, openEditMain, openComplete, openEditNote }) {
  const rowRef = React.useRef(null);
  const [hover, setHover] = React.useState(false);
  const [tapOpen, setTapOpen] = React.useState(false);
  const open = hover || tapOpen;

  const late = p.completed && p.completedAt && p.due ? lateDays(p.completedAt, p.due) : 0;

  return (
    <>
      <li
        ref={rowRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => setTapOpen((v) => !v)}
        className={
          "relative rounded-2xl border bg-white p-3 " +
          "flex items-center gap-3 border-l-4 " +
          theme.edge +
          " hover:shadow-md transition-shadow min-h-[56px]"
        }
      >
        {/* LEFT: tiêu đề + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-medium text-[15px] truncate">{p.title}</div>
            <Badge className={"border " + theme.pill}>{theme.name}</Badge>

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

          <div className="text-xs text-neutral-600 mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Hạn: {formatVN(p.due)}
            </span>

            {!p.completed && !isOverdue(p.due) && (
              <span className="text-emerald-700">• Còn {Math.max(0, daysUntil(p.due))} ngày</span>
            )}
            {!p.completed && isOverdue(p.due) && (
              <span className="text-rose-600 font-medium">• Quá hạn {overdueDays(p.due)} ngày</span>
            )}

            {p.completed && (
              <span className="text-neutral-500">• Hoàn thành: {formatVN(p.completedAt)}</span>
            )}
          </div>

          {/* MOBILE: khung ghi chú (nền trắng + viền xám, Sửa nằm cùng hàng tiêu đề) */}
          {p.completed && (
            <div
              className="lg:hidden mt-2 rounded-xl border border-neutral-300 bg-white p-2"
              title={(p.completedNote || "—").replace(/\s+/g, " ").trim()}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-neutral-700">
                  Ghi chú
                </span>
                <button
                  className={
                    "text-xs text-neutral-700 hover:underline whitespace-nowrap " +
                    (disabled ? "pointer-events-none opacity-60" : "")
                  }
                  onClick={() => !disabled && openEditNote("main", p.id, p.completedNote || "")}
                  title={disabled ? "Cây đang Dừng hoạt động — chỉ xem" : "Sửa ghi chú"}
                >
                  Sửa
                </button>
              </div>
              <div className="mt-1 text-sm font-semibold text-neutral-900 break-words">
                {p.completedNote?.trim() ? p.completedNote : "—"}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT (≥ lg): khung ghi chú nền trắng + viền xám, đẩy xa phải hơn */}
        {p.completed && (
          <div className="hidden lg:flex items-center ml-6 max-w-[min(66ch,54vw)] self-center">
            <div
              className="rounded-2xl border border-neutral-300 bg-white px-3 py-2 shadow-sm min-w-[260px] max-w-[66ch]"
              title={(p.completedNote || "—").replace(/\s+/g, " ").trim()}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-black uppercase tracking-wide text-neutral-700 leading-none">
                  Ghi chú
                </div>
                <button
                  className={
                    "text-xs text-neutral-700 hover:underline whitespace-nowrap " +
                    (disabled ? "pointer-events-none opacity-60" : "")
                  }
                  onClick={() => !disabled && openEditNote("main", p.id, p.completedNote || "")}
                  title={disabled ? "Cây đang Dừng hoạt động — chỉ xem" : "Sửa ghi chú"}
                >
                  Sửa
                </button>
              </div>
              <div className="mt-1 text-sm font-semibold text-neutral-900 truncate">
                {p.completedNote?.trim() ? p.completedNote : "—"}
              </div>
            </div>
          </div>
        )}

        {/* ACTIONS */}
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

      {/* Popover chi tiết */}
      <HoverCard anchorRef={rowRef} open={open} side="right" width={380} offset={16}>
        <div className="fx-pop">
          <div className="text-sm font-semibold mb-1">{p.title}</div>
          <div className="text-xs text-neutral-600 mb-2 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Hạn: {formatVN(p.due)}
            {p.completed && <span className="ml-2">• Hoàn thành: {formatVN(p.completedAt)}</span>}
          </div>

          {Array.isArray(p.details) && p.details.length > 0 ? (
            <ol className="ml-5 list-decimal space-y-1 text-sm">
              {p.details.map((d, idx) => (
                <li key={idx}>{d}</li>
              ))}
            </ol>
          ) : (
            <div className="text-xs text-neutral-500">Không có hướng dẫn chi tiết.</div>
          )}

          {p.completed && (
            <div className="mt-2 rounded-lg border bg-neutral-50 p-2 text-sm text-neutral-800">
              <div className="font-semibold mb-1">Ghi chú hoàn thành</div>
              <div className="whitespace-pre-wrap break-words">
                {p.completedNote?.trim() ? p.completedNote : "—"}
              </div>
            </div>
          )}
        </div>
      </HoverCard>
    </>
  );
}



function AsideCards({ image, setImage, codeKey, phen, tree, meta, planned, openEditNote, note, onSaveNote, readOnly = false, showImageTop = false, currentPhaseId, onPhaseChange, cycleCount, phase1Completed,  loai, giong  }) {
  const [editNote, setEditNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note || "");
  useEffect(() => setNoteDraft(note || ""), [note]);
  useEffect(() => {
    if (readOnly && editNote) setEditNote(false);
  }, [readOnly, editNote]);

  // ===== LỊCH SỬ CÔNG VIỆC ĐÃ HOÀN THÀNH (chỉ planned) =====
  const DONE_PAGE_SIZE = 5;
  const completedList = useMemo(() => {
    const mains = (planned || [])
      .filter((p) => p.completed && p.completedAt)
      .map((p) => ({
        id: `task-${p.id}`,
        type: p.type || "other",
        title: p.title,
        due: p.due,
        completedAt: p.completedAt,
        details: p.details,
        note: p.completedNote || "",
      }));
    return mains.sort((a, b) =>
      (b.completedAt || "").localeCompare(a.completedAt || "")
    );
  }, [planned]);

  // ==== Bộ lọc lịch sử (đơn giản hoá: bỏ phân biệt chính/phụ) ====
  const [doneType, setDoneType]   = useState("all");   // all | water | fert | pest | other
  const [doneLate, setDoneLate]   = useState("all");   // all | ontime | late | nodue
  const [doneQuery, setDoneQuery] = useState("");      // tìm toàn văn
  const [doneFrom, setDoneFrom] = useState("");
  const [doneTo, setDoneTo] = useState("");
  const [doneFilterOpen, setDoneFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(e.target)) setDoneFilterOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const doneFiltered = React.useMemo(() => {
    const q = (doneQuery || "").trim().toLowerCase();

    return (completedList || []).filter((it) => {
      // Lọc theo hạng mục (water/fert/pest/other)
      if (doneType !== "all") {
        if ((it.type || "other") !== doneType) return false;
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
  }, [completedList, doneType, doneLate, doneFrom, doneTo, doneQuery]);

  const hasActiveDoneFilter =
    doneType !== "all" ||
    doneLate !== "all" ||
    !!doneFrom ||
    !!doneTo ||
    !!(doneQuery || "").trim();

  const [donePage, setDonePage] = useState(1);
  useEffect(() => setDonePage(1), [
    completedList.length, doneType, doneLate, doneFrom, doneTo, doneQuery,
  ]);
  const doneTotal = doneFiltered.length;
  const doneStart = (donePage - 1) * DONE_PAGE_SIZE;
  const doneItems = doneFiltered.slice(doneStart, doneStart + DONE_PAGE_SIZE);
  const doneTotalPages = Math.max(1, Math.ceil(doneTotal / DONE_PAGE_SIZE));

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

            {/* Chu kỳ sinh trưởng (timeline) — đặt ngay dưới Ghi chú */}
      <Card>
  <CardHeader className="flex items-center justify-between gap-3">
  <CardTitle>Chu kỳ sinh trưởng</CardTitle>
  {/* Điểm gắn nút bằng portal */}
  <div id="lc-controls" className="shrink-0" />
</CardHeader>

  <CardContent>
  {/* Truyền portalId để widget biết gắn nút lên header */}
  <LifecycleWidget
    tree={tree}                     // ✅ dùng prop tree
    meta={meta}
    portalId="lc-controls"
    value={currentPhaseId}
    onChange={onPhaseChange}
    cycleCount={cycleCount}
    phase1Completed={phase1Completed}
    disabled={meta.status === "stopped"}
    treeId={codeKey}
    treeType={loai}         // 👈 thêm
  treeVariety={giong}
  />
</CardContent>

</Card>


        {/* Ảnh cây — đã chuyển lên TopHeader; ẩn ở Aside để tránh trùng */}
      {!showImageTop && (
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
      )}

      {/* Lịch sử công việc ĐÃ hoàn thành */}
      <Card>
        <CardHeader className="flex items-center justify-between">
  <CardTitle>
    Lịch sử công việc <span className="lowercase">đã</span> hoàn thành
  </CardTitle>

  {/* ===== [ANCHOR: HISTORY_FILTER] Nút bộ lọc cạnh tiêu đề (duy nhất) ===== */}
  <div className="relative">
    <Button
      variant="outline"
      className="h-8 px-3"
      onClick={() => setDoneFilterOpen(v => !v)}
      title="Lọc lịch sử đã hoàn thành"
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
        role="dialog"
        aria-label="Bộ lọc lịch sử đã hoàn thành"
      >
        <div className="text-sm font-medium mb-2">Bộ lọc lịch sử đã hoàn thành</div>

        {/* Hàng: Selects + Range ngày */}
        <div className="grid sm:grid-cols-2 gap-2">
          <select
            className="h-9 rounded-xl border px-3 bg-white text-sm"
            value={doneType}
            onChange={(e) => setDoneType(e.target.value)}
            title="Hạng mục công việc"
          >
            <option value="all">Hạng mục: Tất cả</option>
            <option value="water">Tưới tiêu</option>
            <option value="fert">Phân bón</option>
            <option value="pest">Sâu bệnh</option>
            <option value="other">Công việc khác</option>
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
            <input type="date" value={doneFrom} onChange={(e) => setDoneFrom(e.target.value)}
                   className="h-9 w-full rounded-xl border px-3 bg-white text-sm" max="9999-12-31" />
            <span className="text-neutral-400">→</span>
            <input type="date" value={doneTo} onChange={(e) => setDoneTo(e.target.value)}
                   className="h-9 w-full rounded-xl border px-3 bg-white text-sm" max="9999-12-31" />
          </div>
        </div>

        {/* Search */}
        <div className="mt-2">
          <input
            className="h-9 w-full rounded-xl border px-3 bg-white text-sm"
            placeholder="Tìm tiêu đề / ghi chú…"
            value={doneQuery}
            onChange={(e) => setDoneQuery(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between">
          <Button
            variant="outline"
            className="h-9 px-3"
            onClick={() => {
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

function HeaderPhotoBar({ codeKey, image, setImage, readOnly }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  function handleFile(e) {
    if (readOnly) return;
    const f = e.target.files?.[0];
    if (!f) return;
    const objectUrl = URL.createObjectURL(f);
    setImage(objectUrl);
    if (codeKey) imageRegistry.set(codeKey, objectUrl);
  }

  function applyUrl() {
    if (readOnly) return;
    const u = (urlInput || "").trim();
    if (!u) return;
    setImage(u);
    if (codeKey) imageRegistry.set(codeKey, u);
    setUrlInput("");
    setLinkOpen(false);
  }

  return (
    <div className="mt-3">
      <div className="relative rounded-2xl overflow-hidden border bg-neutral-100 aspect-[16/5]">
        <button
          type="button"
          onClick={() => image && window.open(image, "_blank")}
          title={image ? "Bấm để mở ảnh gốc" : ""}
          className={"w-full h-full " + (image ? "cursor-zoom-in" : "cursor-default")}
        >
          {image ? (
            <img src={image} alt="tree" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-neutral-400">
              <div className="flex items-center gap-2 text-sm">
                <ImageIcon className="h-5 w-5" />
                <span>Chưa có ảnh — hãy thêm để làm bìa</span>
              </div>
            </div>
          )}
        </button>

        {!readOnly && (
          <div className="absolute right-3 top-3 flex flex-wrap gap-2">
            <label className="h-9 inline-flex items-center gap-2 rounded-xl border bg-white/95 backdrop-blur px-3 text-sm cursor-pointer hover:bg-white shadow-sm">
              <Upload className="w-4 h-4" />
              <span>Chọn ảnh</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            <button
              className="h-9 rounded-xl border bg-white/95 backdrop-blur px-3 text-sm hover:bg-white shadow-sm"
              onClick={() => setLinkOpen(v => !v)}
            >
              Dùng link
            </button>
          </div>
        )}
      </div>

      {linkOpen && !readOnly && (
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="Dán link ảnh (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="rounded-xl bg-white"
          />
          <Button onClick={applyUrl} className="rounded-xl">Áp dụng</Button>
          <Button variant="outline" onClick={() => { setLinkOpen(false); setUrlInput(""); }} className="rounded-xl">
            Huỷ
          </Button>
        </div>
      )}
    </div>
  );
}



function TopHeader({ codeKey, meta, phen, tree, image, setImage, readOnly, ageAfterPlant, preAge, totalAge, currentPhaseId }) {
  const stage = phen?.stage || tree?.phenology?.stage || tree?.phase;

  return (
    <section className="grid grid-cols-12 gap-6 items-stretch">
      {/* Full width: bỏ hoàn toàn cột phải */}
      <div className="col-span-12">
        <Card>
          <CardHeader className="!border-b-0 pb-2">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl grid place-items-center bg-emerald-600 text-white">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold tracking-tight">Chi tiết cây</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge className="bg-neutral-800 text-white border-neutral-800">#{codeKey}</Badge>
                  <Badge className="bg-emerald-50 border-emerald-300 text-emerald-800">
                    {meta?.name || "—"}
                  </Badge>
                  {currentPhaseId ? (
   <Badge className="bg-emerald-600 text-white border-emerald-600">
     {labelPhaseId(currentPhaseId)}
   </Badge>
 ) : null}
                  <Badge className="bg-white">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {meta?.plot || "—"}
                  </Badge>
                  <Badge className="bg-white">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    Trồng: {formatVN(meta?.plantedAt)}
                  </Badge>
                  <Badge className="bg-white">
                    <Hash className="h-3.5 w-3.5 mr-1" />
                    Trạng thái: {labelStatus(meta?.status)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Banner ảnh mảnh — dính ngay dưới tiêu đề, nhìn như Add-screen */}
          <CardContent className="pt-0">
            <HeaderPhotoBar
              codeKey={codeKey}
              image={image}
              setImage={setImage}
              readOnly={readOnly}
            />

            {/* Quick stats – chữ to, dễ đọc */}
            <div className="mt-3 grid sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border px-4 py-3 bg-white">
                <div className="text-xs text-neutral-600">Tuổi từ lúc trồng</div>
                <div className="text-xl md:text-2xl font-semibold">{ageAfterPlant} tháng</div>
              </div>
              <div className="rounded-2xl border px-4 py-3 bg-white">
                <div className="text-xs text-neutral-600">Tuổi vườn (trước trồng)</div>
                <div className="text-xl md:text-2xl font-semibold">{preAge} tháng</div>
              </div>
              <div className="rounded-2xl border px-4 py-3 bg-white">
                <div className="text-xs text-neutral-600">Tổng tuổi</div>
                <div className="text-xl md:text-2xl font-semibold">{totalAge} tháng</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}



   export default function TreeDetail() {
  // Hiệu ứng toàn cục
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


// === Helpers đọc Loại/Giống dùng chung toàn file ===
function getLoai(src) {
  const s =
    src?.loai ??
    src?.name ??      // tên cây có thể ở đây
    src?.type ??
    src?.species ??
    src?.plant ??
    src?.tree_type ??
    src?.cropName ??
    src?.nameLoai ??
    "";
  return String(s || "").trim();
}

function getGiong(src) {
  const s =
    src?.giong ??
    src?.variety ??   // giống thường ở đây
    src?.cultivar ??
    src?.subtype ??
    src?.tree_variety ??
    src?.nameGiong ??
    "";
  return String(s || "").trim();
}

  
  // Realtime tick (badge hạn/quá hạn)
  const [, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

// ---- Source of tree id / data (URL params, querystring, or navigation state)
const location = useLocation();
const { id: paramId, treeId: paramTreeId } = useParams() || {};

// ?treeId= or ?id=
const qs = new URLSearchParams(location.search);
const qsTreeId = qs.get("treeId") || qs.get("id");


// When navigating with: navigate('/trees/xxx', { state: { tree } })
const stateTree = location.state?.tree || location.state?.treeData || null;

// Final id used everywhere
const treeId = (
  paramTreeId ||
  qsTreeId ||
  stateTree?.id ||
  stateTree?._id ||
  ""
).toString();

  // Chọn cây theo query
  // Chọn cây theo id + merge với stateTree nếu có
const baseTree = React.useMemo(() => {
  // lấy từ demoTrees theo id
  const fromDemo =
    getTreeById(treeId) ||
    TREES?.[treeId] ||
    (Array.isArray(TREES_ARRAY)
      ? TREES_ARRAY.find((t) => String(t?.id) === String(treeId))
      : null) ||
    {};

  // dữ liệu truyền qua navigate(..., { state: { tree } })
  const fromState = stateTree || {};

  // merge: chỉ ghi đè nếu giá trị từ stateTree KHÔNG rỗng
  const merged = { ...fromDemo };
  Object.entries(fromState).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      merged[key] = value;
    }
  });

  return merged;
}, [stateTree, treeId]);


// ⛑️ GUARD: thiếu/không tìm thấy cây → render trạng thái an toàn, tránh crash
const isEmptyBaseTree = !baseTree || Object.keys(baseTree).length === 0;

if (!treeId || isEmptyBaseTree) {
  return (
    <div className="min-h-screen bg-[#1F302F] grid place-items-center p-6">
      <div className="max-w-lg w-full">
        <div className="rounded-2xl border bg-white shadow-xl p-5">
          <div className="text-lg font-semibold mb-1">
            { !treeId ? "Thiếu tham số cây (treeId)" : "Không tìm thấy dữ liệu cây" }
          </div>
          <div className="text-sm text-neutral-700">
            { !treeId
              ? "URL chưa có treeId hoặc state không mang theo tree."
              : "ID không khớp trong dữ liệu demo. Hãy kiểm tra lại đường dẫn hoặc danh sách cây."
            }
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className="h-9 px-3 rounded-xl border bg-white hover:bg-neutral-50"
              onClick={() => (window.history.length > 1 ? window.history.back() : window.location.assign("/"))}
            >
              ← Quay lại
            </button>
            <button
              className="h-9 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ---- DB lifecycle (single source of truth) ----
const lifecycleFromDB = baseTree.lifecycle || {};

const initialPhaseId = normalizePhaseId(
  lifecycleFromDB.currentPhaseId ||
  baseTree?.phenology?.currentPhase ||
  baseTree?.phenology?.stage ||
  baseTree?.phase
);


const initialP1Completed = typeof lifecycleFromDB.phase1Completed === "boolean"
  ? lifecycleFromDB.phase1Completed
  : initialPhaseId !== "growth_development";

const initialCycleCount = Number.isFinite(lifecycleFromDB.cycleCount)
  ? Number(lifecycleFromDB.cycleCount)
  : 0;

const [currentPhaseId, setCurrentPhaseId] = useState(initialPhaseId);
const [phase1Completed, setPhase1Completed] = useState(initialP1Completed);
const [cycleCount, setCycleCount] = useState(initialCycleCount);
// [ANCHOR: PHASE-GATING]
const canEditFlower = useMemo(
  () => ["flowering", "fruiting", "pre_harvest", "post_harvest"].includes(currentPhaseId),
  [currentPhaseId]
);
const canEditFruit = useMemo(
  () => ["fruiting", "pre_harvest", "post_harvest"].includes(currentPhaseId),
  [currentPhaseId]
);

// Ở đầu component TreeDetail:
const [isEditing, setIsEditing] = React.useState(false);

// snapshot lúc bắt đầu edit để có thể rollback
const [original, setOriginal] = React.useState(null);

// bản nháp cho form - mọi input chỉ ghi vào đây, không đụng `tree`
const [draft, setDraft] = React.useState(null);

 // ==== META (data thật) + DRAFT (để sửa, không làm bẩn state khi Hủy) ====
const [meta, setMeta] = useState({
  name: baseTree.name || "",
  plantedAt: baseTree.plantedAt || today(),
  variety: baseTree.variety || "",
  preNurseryAgeMonths: Number(baseTree.preNurseryAgeMonths || 0),
  soil: baseTree.soil || "",
  status: baseTree.status || "active",
});



const [editingMeta, setEditingMeta] = useState(false);
const [metaDraft, setMetaDraft] = useState(meta);
const [metaErrors, setMetaErrors] = useState({});

// ==== MÃ CÂY (cho phép đổi mã & migrate LocalStorage ảnh/ghi chú) ====
const [codeKey, setCodeKey] = useState(baseTree.id || treeId); // trước đây bạn là const codeKey = tree.id;
const [codeDraft, setCodeDraft] = useState(codeKey);
// ưu tiên lấy từ tree -> meta -> info/form





// "Xoài Cát" hoặc chỉ "Xoài" nếu không có giống
const loai  = getLoai(meta) || getLoai(baseTree);
const giong = getGiong(meta) || getGiong(baseTree);
const tenCayHero = [loai, giong].filter(Boolean).join(" ");

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
 // States chính
const [planned, setPlannedState] = useState(baseTree.planned || []);

// Wrapper: vừa set state, vừa sync về demoTrees
function setPlanned(nextOrUpdater) {
  setPlannedState((prev) => {
    const next =
      typeof nextOrUpdater === "function" ? nextOrUpdater(prev) : nextOrUpdater;

    // đồng bộ planned về TREES + TREES_ARRAY
    syncTreePatch(codeKey, { planned: next });

    return next;
  });
}

useEffect(() => {
  plannedRef.current = planned;
}, [planned]);


  const [aiSuggestions, setAiSuggestions] = useState(() =>
  getAISuggestions(baseTree, initialPhaseId)
);

useEffect(() => {
  setAiSuggestions(getAISuggestions(baseTree, currentPhaseId));
}, [currentPhaseId]);


  // Loại đang xem
  const [activeType, setActiveType] = useState("water");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Draft thêm việc (gộp)
  const [newTask, setNewTask] = useState({
    title: "",
    type: "water",            // water | fert | pest | other
    due: today(),
    details: "",
  });

  // Validate lỗi cục bộ cho form thêm (gộp)
  const [errorsTask, setErrorsTask] = useState({});

  // toast trong khung AI & Thêm việc
  const [toast, setToast] = useState({ show: false, msg: "" });
  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 1500);
  };

  // Modals
  const [completeModal, setCompleteModal] = useState({
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
  const [confirmDel, setConfirmDel] = useState({
    open: false,
    forId: undefined,
  });

  // Confirm thêm việc
  const [confirmAddTask, setConfirmAddTask] = useState({
    open: false,
    snapshot: null,
  });

  // [ANCHOR: PHEN-STATE] 4 trường chi tiết theo yêu cầu
const [phen, setPhen] = useState({
  leaf:   baseTree.phenology?.leafStatus   || baseTree.phenology?.leafRootNote || "", // map tạm từ dữ liệu cũ
  branch: baseTree.phenology?.branchStatus || "",
  flower: baseTree.phenology?.flowerStatus || "",
  fruit:  baseTree.phenology?.fruitStatus  || "",
});
const [editingPhen, setEditingPhen] = useState(false);
const [phenDraft, setPhenDraft] = useState(phen);
useEffect(() => setPhenDraft(phen), [phen]);

// Quy tắc “không nhập = Bình thường” sẽ áp dụng khi hiển thị (UI), không ép vào dữ liệu.

  // Phân trang
  const PAGE_SIZE = 5;
  const AI_PAGE_SIZE = 6;
  const [plannedPage, setPlannedPage] = useState({
    water: 1,
    fert: 1,
    pest: 1,
    other: 1,
  });
  const [aiPage, setAiPage] = useState(1);

  // Overdue theo nhóm (thêm other)
  const overdueCounts = useMemo(() => {
    if (isStopped) return { water: 0, fert: 0, pest: 0, other: 0 };
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
      other: planned.filter(
        (p) => (p.type === "other") && !p.completed && isOverdue(p.due)
      ).length,
    };
  }, [planned, isStopped]);

  useEffect(() => {
    setPlannedPage((prev) => ({ ...prev, [activeType]: 1 }));
  }, [activeType, statusFilter, dateFilter, search]);


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
    setImage("");
    setNote("");
    setDeleted(true);
    setDeleteModal({ open: false, confirmText: "" });
  }

  /* ---------------------------------------------------------------------
     Actions (gộp)
     --------------------------------------------------------------------- */
  function validateTaskDraft(d) {
    const e = {};
    if (!String(d.title || "").trim()) e.title = "Vui lòng nhập tiêu đề";
    if (daysBetween(d.due, today()) > 0) e.due = "Hạn phải từ hôm nay trở đi";
    return e;
  }

  function addManual() {
    if (isStopped) return;

    const det = normalizeDetails(newTask.details);
    const draft = { ...newTask, details: det };

    const e = validateTaskDraft(draft);
    setErrorsTask(e);
    if (Object.keys(e).length) return;

    setConfirmAddTask({ open: true, snapshot: draft });
  }

  function performAddTask(draft) {
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
    setConfirmAddTask({ open: false, snapshot: null });

    showToast("Đã thêm công việc thành công");
    setActiveType(draft.type);
    setStatusFilter("all");
    setPlannedPage((p) => ({ ...p, [draft.type]: 1 }));
    setNewTask({ title: "", type: draft.type, due: today(), details: "" });
    setErrorsTask({});
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

  function openEditNote(type, id, current) {
    if (isStopped) return;
    setNoteModal({ open: true, type, forId: id, note: current || "" });
  }
  function saveNoteModal() {
    if (!noteModal.forId || isStopped) return;
    setPlanned((prev) =>
      prev.map((p) =>
        p.id === noteModal.forId
          ? { ...p, completedNote: noteModal.note }
          : p
      )
    );
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

  function askDeleteMain(id) {
    if (isStopped) return;
    setConfirmDel({ open: true, forId: id });
  }
  function confirmDelete() {
    if (!confirmDel.forId || isStopped) return;
    setPlanned((prev) => prev.filter((p) => p.id !== confirmDel.forId));
    setConfirmDel({ open: false, forId: undefined });
  }

  

  /* ---------------------------------------------------------------------
     Subviews
     --------------------------------------------------------------------- */
  function PlannedSection({ type, disabled = false }) {
    const list = filteredPlannedBy(type);
    const theme = TYPE_THEME[type];
    const page = plannedPage[type];

   const total = list.length;
const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
const safePage = Math.min(page, totalPages);
const start = (safePage - 1) * PAGE_SIZE;
const pageItems = list.slice(start, start + PAGE_SIZE);


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

              <span>{safePage}/{totalPages}</span>

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
                Toàn bộ công việc, ghi chú và ảnh liên quan đến{" "}
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
      
      {/* HERO giống màn danh sách cây */}
<PageHero
  // hiển thị tag là ID cây, tự đồng bộ khi codeKey thay đổi
  breadcrumb={codeKey ? `#${codeKey}` : undefined}

  // tiêu đề chỉ còn tên cây (không lặp lại ID)
  title={`Chi tiết cây ${tenCayHero || ""}`}

  subtitle="Theo dõi tuổi cây, giai đoạn sinh trưởng, công việc và tình trạng chăm sóc — tất cả trên một màn hình."
/>

      <main className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-10 2xl:px-16 pt-6 md:pt-8 pb-10 space-y-8">

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
            {/* Thông tin cây (gộp ảnh vào cùng card) */}
<Card>
  <CardHeader className="flex items-center justify-between">
  <CardTitle className="text-2xl md:text-3xl">Thông tin cây</CardTitle>
  <div className="flex items-center gap-2">
    {(() => {
      const th = STATUS_THEME[meta.status] || STATUS_THEME.active;
      return <Badge className={"border " + th.pill}>{labelStatus(meta.status)}</Badge>;
    })()}
    {!editingMeta ? (
      <Button
        variant="outline"
        onClick={() => {
          // mở edit: copy dữ liệu thật sang draft
          setMetaDraft(meta);
          setCodeDraft(codeKey);
          setEditingMeta(true);
        }}
      >
        Cập nhật
      </Button>
    ) : (
      <Button
        variant="outline"
        onClick={() => {
          // HỦY: khôi phục draft về dữ liệu thật + đóng edit
          setMetaDraft(meta);
          setCodeDraft(codeKey);
          setEditingMeta(false);
        }}
      >
        Hủy
      </Button>
    )}
  </div>
</CardHeader>

  {/* Bố cục 3 cột: trái 2 cột cho fields; phải 1 cột cho ảnh */}
  {!editingMeta ? (
    <CardContent>
      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT: thông tin */}
        <div className="md:col-span-2 grid md:grid-cols-2 gap-x-6 gap-y-2">
          <Field label="Cây" value={meta.name || baseTree.name} />
          <Field label="Mã cây" value={`#${codeKey}`} />
          
          <Field label="Giống" value={meta.variety} />
          <Field label="Ngày trồng" value={formatVN(meta.plantedAt)} />
          <Field label="Tuổi trước khi trồng" value={`${meta.preNurseryAgeMonths} tháng`} />
          <Field label="Loại đất" value={meta.soil || baseTree.soil || "—"} />
          
          
          <Field label="Tổng tuổi" value={`${totalAge} tháng`} />
        
          {/* Hai trường kéo từ Sinh trưởng */}
          <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
           

          </div>
        </div>

        {/* RIGHT: Ảnh & Preview (nằm cùng card) */}
        <div className="md:col-span-1">
          <div className="rounded-2xl border bg-white p-3">
            <div className="text-base font-semibold mb-2">Ảnh cây</div>
            <ImagePicker
              code={codeKey}
              value={image}
              onChange={setImage}
              disabled={isStopped}
            />
          </div>
        </div>
      </div>
    </CardContent>
  ) : (
    <CardContent>
      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT: form edit */}
        <div className="md:col-span-2 grid md:grid-cols-2 gap-4 text-base">
          <div className="grid gap-1">
  <label className="text-[13px] text-neutral-600">Mã cây</label>
  <Input
    value={codeDraft}
    onChange={(e) => setCodeDraft(e.target.value.trim())}
    disabled={isStopped} // vẫn cho sửa nếu muốn, hoặc bạn bỏ disabled
  />
</div>
          <div className="grid gap-1">
  <label className="text-[13px] text-neutral-600">Loại cây</label>
  <ComboBox
  value={metaDraft.name}

 onChange={(v) => setMetaDraft((s) => ({ ...s, name: v, variety: "" }))} // đổi loại thì xoá giống
  options={DROPDOWN_OPTIONS.treeTypes}
  placeholder="Chọn loại cây"
  disabled={isStopped}
 allowCreate={false}
/>

{metaErrors?.name && <div className="text-xs text-rose-600 mt-1">{metaErrors.name}</div>}
</div>



          <div className="grid gap-1">
            <label className="text-[13px] text-neutral-600">Ngày trồng</label>
            <Input type="date" value={metaDraft.plantedAt} max="9999-12-31"
              onChange={(e) => setMetaDraft((s) => ({ ...s, plantedAt: e.target.value }))} disabled={isStopped} />
          </div>

          {(() => {
  const typeKey = (metaDraft.name || "").trim();
  const allVar = Object.values(DROPDOWN_OPTIONS.varietiesByType).flat();
  const varietyOptions =
    DROPDOWN_OPTIONS.varietiesByType[typeKey] && DROPDOWN_OPTIONS.varietiesByType[typeKey].length
      ? DROPDOWN_OPTIONS.varietiesByType[typeKey]
      : allVar;

  return (
    <div className="grid gap-1">
      <label className="text-[13px] text-neutral-600">Giống</label>
      <ComboBox
  value={metaDraft.variety}
  onChange={(v) => { setMetaDraft((s) => ({ ...s, variety: v })); setMetaErrors((e)=>({...e, variety: undefined})); }}
  options={varietyOptions} // như bạn đang tính ở chỗ này
  placeholder="Chọn giống cây"
  disabled={isStopped}
  allowCreate={false}
/>
{metaErrors?.variety && <div className="text-xs text-rose-600 mt-1">{metaErrors.variety}</div>}
    </div>
    
    
  );
})()}


          <div className="grid gap-1">
            <label className="text-[13px] text-neutral-600">Tuổi trước khi trồng (tháng)</label>
            <Input type="number" min={0} step={1} value={metaDraft.preNurseryAgeMonths}
              onChange={(e) => {
                const v = parseInt(e.target.value || "0", 10);
                setMetaDraft((s) => ({ ...s, preNurseryAgeMonths: isNaN(v) ? 0 : Math.max(0, v) }));
              }}
              disabled={isStopped}
            />
            {metaErrors?.soil && <div className="text-xs text-rose-600 mt-1">{metaErrors.soil}</div>}

          </div>
              

          <div className="grid gap-1">
  <label className="text-[13px] text-neutral-600">Loại đất</label>
  <ComboBox
  value={metaDraft.soil}
  onChange={(v) => { setMetaDraft((s) => ({ ...s, soil: v })); setMetaErrors((e)=>({...e, soil: undefined})); }}
  options={DROPDOWN_OPTIONS.soils}
  placeholder="Chọn loại đất bạn dùng"
  disabled={isStopped}
  allowCreate={false}
/>
</div>



          <div className="grid gap-1">
            <label className="text-[13px] text-neutral-600">Trạng thái</label>
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
            
          </div>

          

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditingMeta(false)}>Hủy</Button>
           <Button
  onClick={() => {
    // Chuẩn hóa draft
    const fixed = {
      ...metaDraft,
      preNurseryAgeMonths: Math.max(
        0,
        parseInt(metaDraft.preNurseryAgeMonths || 0, 10) || 0
      ),
    };

    // ✅ Validate: buộc phải chọn từ hệ thống
    const typeList = DROPDOWN_OPTIONS.treeTypes;
    const varList =
      DROPDOWN_OPTIONS.varietiesByType[fixed.name?.trim()] || [];
    const soilList = DROPDOWN_OPTIONS.soils;

    const errors = {};
    if (!inList(fixed.name, typeList))
      errors.name = "Chỉ được chọn loại có trong hệ thống.";
    if (!inList(fixed.variety, varList))
      errors.variety = "Chỉ được chọn giống hợp lệ theo loại.";
    if (!inList(fixed.soil, soilList))
      errors.soil = "Chỉ được chọn loại đất có trong hệ thống.";
    setMetaErrors(errors);
    if (Object.keys(errors).length) return; // ❌ dừng lưu nếu có lỗi

    // Nếu đổi mã cây => migrate LocalStorage ảnh/ghi chú
    let targetKey = codeKey;         // <— dùng key này để sync demoTrees
    if (codeDraft && codeDraft !== codeKey) {
      const oldImg = imageRegistry.get(codeKey);
      const oldNote = noteRegistry.get(codeKey);
      if (oldImg) imageRegistry.set(codeDraft, oldImg);
      if (oldNote) noteRegistry.set(codeDraft, oldNote);
      imageRegistry.clear(codeKey);
      noteRegistry.set(codeKey, "");

      setCodeKey(codeDraft);
      targetKey = codeDraft;        // <— key mới

      // (tuỳ chọn) cập nhật URL query ?treeId=...
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("treeId", codeDraft);
        window.history.replaceState({}, "", url.toString());
      } catch {}
    }

    // Ghi meta thật
    setMeta(fixed);

    // ✅ Đồng bộ meta sang demoTrees (TreeManagement sẽ đọc được)
    syncTreePatch(targetKey, {
      id: targetKey,
      name: fixed.name,
      variety: fixed.variety,
      plantedAt: fixed.plantedAt,
      preNurseryAgeMonths: fixed.preNurseryAgeMonths,
      soil: fixed.soil,
      status: fixed.status,
    });

    // đóng edit
    setEditingMeta(false);
  }}
>
  Lưu
</Button>


          </div>
        </div>

        {/* RIGHT: Ảnh ngay trong card */}
        <div className="md:col-span-1">
          <div className="rounded-2xl border bg-white p-3">
            <div className="text-base font-semibold mb-2">Ảnh cây</div>
            <ImagePicker
              code={codeKey}
              value={image}
              onChange={setImage}
              disabled={isStopped}
            />
          </div>
        </div>
      </div>
    </CardContent>
  )}
</Card>

<Card>
  <CardHeader className="flex items-center justify-between">
    <CardTitle>Tình trạng hiện tại</CardTitle>
    <div className="flex items-center gap-2">
      {!editingPhen ? (
        <Button variant="outline" onClick={() => setEditingPhen(true)} disabled={isStopped}>
          Cập nhật
        </Button>
      ) : (
        <>
          <Button variant="outline" onClick={() => { setPhenDraft(phen); setEditingPhen(false); }}>
            Hủy
          </Button>
          <Button
  onClick={() => {
    setPhen(phenDraft);
    setEditingPhen(false);

    // Gom phenology mới
    const nextPhen = {
      ...(baseTree.phenology || {}),
      leafStatus:   phenDraft.leaf,
      branchStatus: phenDraft.branch,
      flowerStatus: phenDraft.flower,
      fruitStatus:  phenDraft.fruit,
      stage:        currentPhaseId,
      currentPhase: currentPhaseId,
    };

    // Gom state mới (để các màn legacy đọc state.* vẫn đúng)
    const nextState = {
      ...(baseTree.state || {}),
      leaf:   phenDraft.leaf,
      branch: phenDraft.branch,
      flower: phenDraft.flower,
      fruit:  phenDraft.fruit,
    };

    // ✅ Sync đồng thời phenology + state + *State + stateNote
    syncTreePatch(codeKey, {
      phenology: nextPhen,
      state:     nextState,

      // fallback cho chỗ nào đang dùng stateNote / leafState / ...
      stateNote:    phenDraft.leaf,
      leafState:    phenDraft.leaf,
      branchState:  phenDraft.branch,
      flowerState:  phenDraft.flower,
      fruitState:   phenDraft.fruit,
    });
  }}
>
  Lưu
</Button>


        </>
      )}
    </div>
  </CardHeader>

  <CardContent>
    {!editingPhen ? (
      <div className="grid md:grid-cols-2 gap-4">
  <Field label="Lá"   value={safePhenText(phen.leaf)} />
  <Field label="Cành" value={safePhenText(phen.branch)} />
  <Field
    label="Hoa"
    value={canEditFlower ? safePhenText(phen.flower) : "Chưa đến giai đoạn"}
  />
  <Field
    label="Quả"
    value={canEditFruit ? safePhenText(phen.fruit) : "Chưa đến giai đoạn"}
  />
</div>

    ) : (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-1">
          <label className="text-[13px] text-neutral-600">Mô tả tình trạng lá</label>
          <Textarea rows={3} value={phenDraft.leaf}
            onChange={(e)=>setPhenDraft(s=>({...s, leaf:e.target.value}))} disabled={isStopped}/>
        </div>
        <div className="grid gap-1">
          <label className="text-[13px] text-neutral-600">Mô tả tình trạng cành</label>
          <Textarea rows={3} value={phenDraft.branch}
            onChange={(e)=>setPhenDraft(s=>({...s, branch:e.target.value}))} disabled={isStopped}/>
        </div>
        <div className="grid gap-1">
          <label className="text-[13px] text-neutral-600">Mô tả tình trạng hoa</label>
          <Textarea rows={3} value={phenDraft.flower}
            onChange={(e)=>setPhenDraft(s=>({...s, flower:e.target.value}))}
            disabled={isStopped || !canEditFlower}/>
        </div>
        <div className="grid gap-1">
          <label className="text-[13px] text-neutral-600">Mô tả tình trạng quả</label>
          <Textarea rows={3} value={phenDraft.fruit}
            onChange={(e)=>setPhenDraft(s=>({...s, fruit:e.target.value}))}
            disabled={isStopped || !canEditFruit}/>
        </div>
      </div>
    )}
  </CardContent>
</Card>

            

            {/* Các công việc đã lên kế hoạch */}
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
                  <TypeSwitch
                    type="other"
                    overdue={overdueCounts.other}
                    active={activeType === "other"}
                    onClick={() => setActiveType("other")}
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

                {/* Thêm việc (gộp) */}
                <section>
                  <div className="text-sm font-medium mb-2">Thêm việc</div>

                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="md:col-span-3">
                      <div className="text-xs text-neutral-600 mb-1">
                        Chọn hạng mục
                      </div>
                      <div className="flex gap-2">
                        <TypePick
                          value="water"
                          active={newTask.type === "water"}
                          onClick={() =>
                            !isStopped &&
                            setNewTask({ ...newTask, type: "water" })
                          }
                        />
                        <TypePick
                          value="fert"
                          active={newTask.type === "fert"}
                          onClick={() =>
                            !isStopped &&
                            setNewTask({ ...newTask, type: "fert" })
                          }
                        />
                        <TypePick
                          value="pest"
                          active={newTask.type === "pest"}
                          onClick={() =>
                            !isStopped &&
                            setNewTask({ ...newTask, type: "pest" })
                          }
                        />
                        <TypePick
                          value="other"
                          active={newTask.type === "other"}
                          onClick={() =>
                            !isStopped &&
                            setNewTask({ ...newTask, type: "other" })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-1">
                      <label className="text-xs text-neutral-600">Tiêu đề</label>
                      <Textarea
                        rows={2}
                        value={newTask.title}
                        onChange={(e) => {
                          setNewTask({ ...newTask, title: e.target.value });
                          setErrorsTask((x) => ({ ...x, title: undefined }));
                        }}
                        placeholder="Ví dụ: Tưới 10L/cây lúc sáng / Quét dọn cỏ..."
                        className={errorsTask.title ? "border-red-500" : undefined}
                        disabled={isStopped}
                      />
                      {errorsTask.title && (
                        <div className="text-xs text-red-500">
                          {errorsTask.title}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-1">
                      <label className="text-xs text-neutral-600">Hạn</label>
                      <Input
                        type="date"
                        min={today()}
                        value={newTask.due}
                        onChange={(e) => {
                          setNewTask({ ...newTask, due: e.target.value });
                          setErrorsTask((x) => ({ ...x, due: undefined }));
                        }}
                        className={errorsTask.due ? "border-red-500" : ""}
                        disabled={isStopped}
                      />
                      {errorsTask.due && (
                        <div className="text-xs text-red-500">
                          {errorsTask.due}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-3 grid gap-1">
                      <label className="text-xs text-neutral-600">
                        Hướng dẫn chi tiết
                      </label>
                      <Textarea
                        rows={3}
                        value={newTask.details}
                        onKeyDown={(e) =>
                          handleNumberedKeyDown(e, (v) =>
                            setNewTask((s) => ({ ...s, details: v }))
                          )
                        }
                        onChange={(e) =>
                          setNewTask({ ...newTask, details: e.target.value })
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
                        + Thêm việc
                      </Button>
                    </div>
                  </div>
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
                tree={baseTree}
                meta={meta}
                planned={planned}
                openEditNote={openEditNote}
                note={note}
                onSaveNote={saveNote}
                readOnly={isStopped}
                 showImageTop={true}
                  currentPhaseId={currentPhaseId}
 cycleCount={cycleCount}
 phase1Completed={phase1Completed}
  loai={loai}
  giong={giong}
 onPhaseChange={(payload) => {
    // payload: { phaseId, cycleCount, phase1Completed }
    setCurrentPhaseId(payload.phaseId);
    setCycleCount(payload.cycleCount);
    setPhase1Completed(payload.phase1Completed);

    // ✅ đồng bộ lifecycle + phase vào demoTrees
    syncTreePatch(codeKey, {
      lifecycle: {
        ...(lifecycleFromDB || {}),
        currentPhaseId: payload.phaseId,
        phase1Completed: payload.phase1Completed,
        cycleCount: payload.cycleCount,
      },
      // nếu bạn có field phase / phenology.stage ở TreeManagement thì cho nó trùng luôn:
      phase: payload.phaseId,
      phenology: {
        ...(baseTree.phenology || {}),
        stage: payload.phaseId,
        currentPhase: payload.phaseId,
      },
    });

    // sau này thay bằng api.trees.updateLifecycle(...)
  }}
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

      {/* Confirm thêm việc */}
      {confirmAddTask.open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="text-lg font-semibold">Xác nhận thêm việc</div>
              <button
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-neutral-50"
                onClick={() =>
                  setConfirmAddTask({ open: false, snapshot: null })
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {(() => {
              const snap =
                confirmAddTask.snapshot || {
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
                        setConfirmAddTask({ open: false, snapshot: null })
                      }
                    >
                      Huỷ
                    </Button>
                    <Button onClick={() => performAddTask(snap)} disabled={isStopped}>
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
              <div className="text-lg font-semibold">Sửa công việc</div>
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
                <TypePick
                  value="other"
                  active={editMain.type === "other"}
                  onClick={() =>
                    setEditMain((s) => ({ ...s, type: "other" }))
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
                  setConfirmDel({ open: false, forId: undefined })
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
function safePhenText(v) {
  const s = String(v ?? "").trim();
  return s ? s : "Bình thường";
}


function TypeSwitch({ type, active, onClick, overdue = 0 }) {
  const theme = TYPE_THEME[type];
  const icon =
    type === "water" ? (
      <Droplets className="h-4 w-4" />
    ) : type === "fert" ? (
      <Leaf className="h-4 w-4" />
    ) : type === "pest" ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <ClipboardList className="h-4 w-4" />
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
    ) : value === "pest" ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <ClipboardList className="h-4 w-4" />
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

/* ===== Sticky Section Nav (mini tabs) ===== */
function StickySectionNav() {
  const sections = [
    { id: "sec-info",    name: "Thông tin cây",       Icon: Sprout },
    { id: "sec-status",  name: "Tình trạng hiện tại", Icon: Activity },
    { id: "sec-planned", name: "Kế hoạch",            Icon: ClipboardList },
    { id: "sec-ai",      name: "Gợi ý & Thêm việc",   Icon: CheckCircle2 },
  ];
  const [active, setActive] = React.useState(sections[0].id);

  React.useEffect(() => {
    const els = sections
      .map(s => document.getElementById(s.id))
      .filter(Boolean);
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter(e => e.isIntersecting)
          .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis?.target?.id) setActive(vis.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0,0.1,0.25,0.5,0.75,1] }
    );

    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="sticky top-16 z-[60] mb-2">
      <nav className="inline-flex gap-1 rounded-full border bg-white/90 backdrop-blur px-1 py-1 shadow">
        {sections.map(({ id, name, Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className={
              "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition " +
              (active === id
                ? "bg-emerald-600 text-white shadow"
                : "hover:bg-neutral-50 text-neutral-700")
            }
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{name}</span>
            <span className="sm:hidden">{name.split(" ")[0]}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}


/* =========================================================================
   Lifecycle timeline (compact widget for Aside)
   ========================================================================= */

// Map tên giai đoạn (text) → id timeline

/** Transient PATH — grow/shrink mượt */
function LCTransientPath({ d, color, duration = 950, headSize = 10, headPad = 8, mode = "grow", headVisible = true }) {
  const pathRef = useRef(null);
  const headRef = useRef(null);
  const rafRef  = useRef(null);

  useLayoutEffect(() => {
    const path = pathRef.current;
    const head = headRef.current;
    if (!path) return;

    const total = path.getTotalLength();
    path.style.strokeDasharray  = `${total}`;
    path.style.willChange = "stroke-dashoffset";
    path.style.strokeDashoffset = mode === "grow" ? `${total}` : `0`;

    let start = null, stop = false;
    const step = (ts) => {
      if (stop) return;
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / duration);

      if (mode === "grow") {
        const usable = Math.max(0, total - headPad);
        const shown  = usable * t;
        path.style.strokeDashoffset = `${total - shown}`;
        if (headVisible && head) {
          const pLen  = Math.min(total - headPad, shown);
          const p     = path.getPointAtLength(pLen);
          const prev  = path.getPointAtLength(Math.max(0, pLen - 1));
          const angle = Math.atan2(p.y - prev.y, p.x - prev.x) * (180 / Math.PI);
          head.setAttribute("transform", `translate(${p.x}, ${p.y}) rotate(${angle})`);
        }
      } else {
        path.style.strokeDashoffset = `${total * t}`;
      }
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); stop = true; };
  }, [d, duration, headPad, mode, headVisible]);

  return (
    <g>
      <path ref={pathRef} d={d} fill="none" stroke={color} strokeWidth={4} strokeLinecap="butt" strokeLinejoin="round" opacity="0.98" style={{ vectorEffect:"non-scaling-stroke" }} />
      {headVisible && <g ref={headRef}><polygon points={`0,0 -${headSize},-${headSize/2} -${headSize},${headSize/2}`} fill={color} opacity="0.98" /></g>}
    </g>
  );
}

/* ===== Timeline ===== */
function LifecycleTimeline({
  activePhase,
  previewPhase,
  isPhase1Completed,
  isSpinning,
  treeData,
  treeId,
  treeType,
  treeVariety,
  transitionFlow,
  transitionKey,
  p1Transition,
  p1Key,
  trailIndex,
  suppressId,
  isBackwardRun,
  postHideIdx,
}) {

  const phase1 = { id: "growth_development", name: "Sinh trưởng & Phát triển", icon: "🌱", color: "emerald" };
  const cyclePhases = [
    { id: "flowering",   name: "Ra Hoa",          icon: "🌸", color: "pink"  },
    { id: "fruiting",    name: "Ra quả",          icon: "🍎", color: "lime"  },
    { id: "pre_harvest", name: "Trước thu hoạch", icon: "🔍", color: "amber" },
    { id: "post_harvest",name: "Sau thu hoạch",   icon: "🌿", color: "teal"  },
  ];
  const getColorClasses = (color, activeLike) => {
    const m = {
      emerald:{ active:"bg-emerald-600 border-emerald-400 shadow-emerald-300 text-white", default:"bg-white border-gray-200" },
      pink:   { active:"bg-pink-600 border-pink-400 shadow-pink-300 text-white",          default:"bg-white border-gray-200" },
      lime:   { active:"bg-lime-600 border-lime-400 shadow-lime-300 text-white",          default:"bg-white border-gray-200" },
      amber:  { active:"bg-amber-600 border-amber-400 shadow-amber-300 text-white",       default:"bg-white border-gray-200" },
      teal:   { active:"bg-teal-600 border-teal-400 shadow-teal-300 text-white",          default:"bg-white border-gray-200" },
    };
    return activeLike ? m[color].active : m[color].default;
  };

  // ==== Geometry (đã thu gọn để vừa cột Aside) ====
  const RING_SIZE = 240;             // ⟵ nhỏ hơn bản demo
  const radius = 92;
  const centerX = RING_SIZE / 2, centerY = RING_SIZE / 2;
  const nodeR = 26, STROKE = 4, HEAD_SIZE = 10, HEAD_PAD = HEAD_SIZE * 0.85, MASK_INSET = 6;

  const GUIDE_ARROW_COUNT = 2, GUIDE_ARROW_SIZE = 7;
  const PHASE_COLORS = { flowering:"#ec4899", fruiting:"#84cc16", pre_harvest:"#f59e0b", post_harvest:"#14b8a6" };

  const getCirclePosition = (index, total) => {
    const angle = index * ((2 * Math.PI) / total) - Math.PI / 2;
    return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle), angle };
  };
  const alphaGap = Math.asin(Math.min(1, (nodeR + MASK_INSET) / radius));
  const buildArcD = (a0, a1, r, sweep = 1) => {
    const sx = centerX + r * Math.cos(a0), sy = centerY + r * Math.sin(a0);
    const ex = centerX + r * Math.cos(a1), ey = centerY + r * Math.sin(a1);
    return `M ${sx} ${sy} A ${r} ${r} 0 0 ${sweep} ${ex} ${ey}`;
  };
  const trimAngles = (iFrom, iTo) => {
    const from = getCirclePosition(iFrom, 4).angle;
    const to   = getCirclePosition(iTo,   4).angle;
    return { thetaStart: from + alphaGap, thetaEnd: to - alphaGap };
  };
  const tangentAngleAtEnd = (thetaEnd, r, eps = 0.04) => {
    const ex = centerX + r * Math.cos(thetaEnd), ey = centerY + r * Math.sin(thetaEnd);
    const px = centerX + r * Math.cos(thetaEnd - eps), py = centerY + r * Math.sin(thetaEnd - eps);
    return Math.atan2(ey - py, ex - px);
  };

  // transient config (grow/shrink)
  let transientConfig = null;
  if (transitionFlow) {
    const fromIdx = cyclePhases.findIndex(p => p.id === transitionFlow.from);
    const toIdx   = cyclePhases.findIndex(p => p.id === transitionFlow.to);
    if (fromIdx > -1 && toIdx > -1) {
      const forward  = (fromIdx + 1) % 4 === toIdx;
      const backward = (toIdx   + 1) % 4 === fromIdx;
      if (forward || backward) {
        const { thetaStart, thetaEnd } = trimAngles(fromIdx, toIdx);
        const color = PHASE_COLORS[(backward ? cyclePhases[toIdx].id : cyclePhases[fromIdx].id)] || "#10b981";
        const retract = backward;
        const d = retract ? buildArcD(thetaEnd, thetaStart, radius, 1) : buildArcD(thetaStart, thetaEnd, radius, 1);
        transientConfig = { fromIdx, toIdx, retract, d, color, thetaEnd };
      }
    }
  }

  const showP1Idle = activePhase === "growth_development" && !isPhase1Completed && !p1Transition;
  const css = `
    @keyframes dashFlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -28; } }
    .flow-line { animation: dashFlow 2.2s linear infinite; }
    @keyframes dashFlowSlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -28; } }
    .flow-arc-slow { animation: dashFlowSlow 5.5s linear infinite; }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    .fade-in-160 { animation: fadeIn .16s ease-out both; }
    @keyframes spin-once { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin-once { animation: spin-once 1s ease-in-out; }
  `;

  const renderRingMask = () => (
    <mask id="ringMask" maskUnits="userSpaceOnUse">
      <rect x="0" y="0" width={RING_SIZE} height={RING_SIZE} fill="black" />
      <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="white" strokeWidth={STROKE * 6} />
      {Array.from({length:4}).map((_, idx) => {
        const { x, y } = getCirclePosition(idx, 4);
        return <circle key={idx} cx={x} cy={y} r={nodeR + MASK_INSET} fill="black" />;
      })}
    </mask>
  );

  const renderGuideArrows = () => {
    return cyclePhases.map((_, i) => {
      let { thetaStart, thetaEnd } = trimAngles(i, (i + 1) % 4);
      if (thetaEnd <= thetaStart) thetaEnd += Math.PI * 2;
      const color = PHASE_COLORS[cyclePhases[i].id];
      const seg = buildArcD(thetaStart, thetaEnd, radius, 1);

      const arrows = [];
      for (let k = 1; k <= 2; k++) {
        const t = k / 3;
        const ang = thetaStart + (thetaEnd - thetaStart) * t;
        const x = centerX + radius * Math.cos(ang);
        const y = centerY + radius * Math.sin(ang);
        const deg = (ang + Math.PI / 2) * (180 / Math.PI);
        arrows.push(
          <g key={`a-${i}-${k}`} transform={`translate(${x}, ${y}) rotate(${deg})`} opacity={0.55}>
            <polygon points={`0,0 -7,-3.5 -7,3.5`} fill={color} />
          </g>
        );
      }

      return (
        <g key={`g-${i}`} mask="url(#ringMask)">
          <path d={seg} fill="none" stroke={color} strokeWidth="2" opacity="0.10" style={{ vectorEffect:"non-scaling-stroke" }} />
          {arrows}
        </g>
      );
    });
  };

  const currentPhaseId = treeData?.currentPhase ?? activePhase ?? phase1.id;
  const phaseName = (id) => id === phase1.id ? phase1.name : (cyclePhases.find(p => p.id === id)?.name || id);
  const currentLabel = phaseName(currentPhaseId);
  const isBackwardStep = !!(transitionFlow && transientConfig && transientConfig.retract);
  const removingArcIdx = isBackwardStep ? transientConfig?.toIdx : -1;
  // [ANCHOR: PHASE-GATING]
const canEditFlower = useMemo(
  () => ["flowering", "fruiting", "pre_harvest", "post_harvest"].includes(currentPhaseId),
  [currentPhaseId]
);
const canEditFruit = useMemo(
  () => ["fruiting", "pre_harvest", "post_harvest"].includes(currentPhaseId),
  [currentPhaseId]
);

  return (
    <div className="w-full">
      <style>{css}</style>

      <div className="flex flex-col items-center gap-2">
        {/* Header nhỏ hiển thị giai đoạn hiện tại */}
        <div className="flex flex-col items-center select-none">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm md:text-base mb-2 w-full">
  <span className="text-neutral-700 shrink-0">Giai đoạn hiện tại:</span>

  {/* pill cho phép wrap + giới hạn rộng để không đè icon */}
  <span
    className="inline-flex items-center rounded-full border px-2.5 py-0.5
               bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold
               max-w-[240px] whitespace-normal break-words leading-tight text-center"
    title={currentLabel}
  >
    {currentLabel}
  </span>

  <span className="text-neutral-400 shrink-0">•</span>
<span className="text-neutral-500 shrink-0">
  #{treeId || treeData?.id || "—"}
</span>

</div>

          <div className={`relative w-12 h-12 rounded-full border-4 shadow-lg flex items-center justify-center text-lg mb-1.5 pointer-events-none
              ${getColorClasses("emerald", activePhase === phase1.id)} ${isPhase1Completed ? "opacity-40 grayscale" : ""}`}>
            {phase1.icon}
            {activePhase === phase1.id && !isPhase1Completed && (
              <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/60" />
            )}
          </div>
          <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-center ring-1 ring-black/5 shadow-sm
  ${isPhase1Completed ? "bg-white text-gray-700 border border-gray-200 opacity-70"
                      : "bg-emerald-600 text-white"}`}>
  {phase1.name}   {/* luôn là “Sinh trưởng & Phát triển” */}
</div>

        </div>

        {/* Connector P1 → Ra hoa */}
        <svg width={RING_SIZE} height="56" viewBox={`0 0 ${RING_SIZE} 56`} className="overflow-visible my-0.5">
          {activePhase === "growth_development" && showP1Idle && (
            <>
              <line x1={centerX} y1="6" x2={centerX} y2="48" stroke="#ec4899" strokeWidth="3" strokeDasharray="10,8" strokeLinecap="round" opacity={0.9} className="flow-line" />
              <polygon points={`${centerX},54 ${centerX - 8},46 ${centerX + 8},46`} fill="#ec4899" opacity={0.95} />
            </>
          )}
          {p1Transition && (
            <LCTransientPath key={`p1-${p1Key}`} d={`M ${centerX} 6 L ${centerX} 48`} color="#ec4899" duration={950} headSize={10} headPad={6} mode="grow" headVisible />
          )}
          {!showP1Idle && isPhase1Completed && !p1Transition && (
            <>
              <line x1={centerX} y1="6" x2={centerX} y2="48" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="10,8" strokeLinecap="round" opacity={0.6} />
              <polygon points={`${centerX},54 ${centerX - 8},46 ${centerX + 8},46`} fill="#cbd5e1" opacity={0.7} />
            </>
          )}
        </svg>

        {/* Vòng tròn */}
        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
          {/* center info */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur rounded-full shadow-xl ring-1 ring-black/5 w-24 h-24 flex flex-col items-center justify-center p-2">
              <div className="text-[10px] text-gray-500 font-medium">Loại cây</div>
<div className="text-[13px] font-bold text-emerald-600">
  {treeType || "—"}
</div>

<div className="text-[10px] text-gray-500 font-medium mt-0.5">Giống</div>
<div className="text-[10px] text-gray-700 font-semibold">
  {treeVariety || "—"}
</div>

<div className="text-[9px] text-gray-400 mt-0.5">
  ID: {treeId || treeData?.id || "—"}
</div>

            </div>
          </div>

          <div className={`absolute inset-0 ${isSpinning ? "animate-spin-once" : ""}`} style={{ transformOrigin:"50% 50%" }}>
            <svg className="absolute inset-0 w-full h-full z-10" viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} shapeRendering="geometricPrecision">
              {renderRingMask()}
              {renderGuideArrows()}

              {cyclePhases.map((phase, index) => {
                const nIndex = (index + 1) % cyclePhases.length;
                const { thetaStart, thetaEnd } = trimAngles(index, nIndex);
                const isActive  = activePhase  === phase.id;
                const isPreview = previewPhase === phase.id;

                const persistedBase = isPhase1Completed && trailIndex >= 1 && index <= trailIndex - 1;
                const persisted = (isBackwardRun && index === removingArcIdx) ? false : persistedBase;

                const color = PHASE_COLORS[phase.id] || "#10b981";
                const dArc  = buildArcD(thetaStart, thetaEnd, radius, 1);
                const endX  = centerX + radius * Math.cos(thetaEnd);
                const endY  = centerY + radius * Math.sin(thetaEnd);
                const tanDeg = (tangentAngleAtEnd(thetaEnd, radius) * 180) / Math.PI;

                const hideStaticFrom = transitionFlow && index === transientConfig?.fromIdx;
                const hideStaticTo   = transitionFlow && index === transientConfig?.toIdx;
                const hideStaticCurr = (!transitionFlow && (isActive || isPreview));
                const hideRemoving   = isBackwardRun && index === removingArcIdx;
                const hidePost       = (postHideIdx !== null && index === postHideIdx);

                return (
                  <g key={`arc-${phase.id}`} mask="url(#ringMask)">
                    {isPhase1Completed && (
                      <>
                        <path d={dArc} fill="none" stroke={persisted ? color : "#d1d5db"} strokeWidth={STROKE}
                          opacity={persisted ? "0.65" : "0.35"} strokeLinecap="round" strokeLinejoin="round"
                          style={{ vectorEffect:"non-scaling-stroke" }} strokeDasharray={persisted ? "16 12" : undefined}
                          className={persisted ? "flow-arc-slow" : undefined} />
                        <g transform={`translate(${endX}, ${endY}) rotate(${tanDeg})`}
                           opacity={hideStaticFrom || hideStaticTo || hideStaticCurr || hideRemoving || hidePost ? 0 : 1}
                           className="fade-in-160">
                          <polygon points={`0,0 -${HEAD_SIZE},-${HEAD_SIZE/2} -${HEAD_SIZE},${HEAD_SIZE/2}`}
                                   fill={persisted ? color : "#d1d5db"} opacity={persisted ? "0.75" : "0.45"} />
                        </g>
                      </>
                    )}
                  </g>
                );
              })}

              {transitionFlow && transientConfig && (
                <g mask="url(#ringMask)">
                  <LCTransientPath
                    key={`transient-${transitionKey}-${transitionFlow.from}-${transitionFlow.to}`}
                    d={transientConfig.d}
                    color={transientConfig.color}
                    duration={1150}
                    headSize={HEAD_SIZE}
                    headPad={HEAD_PAD}
                    mode={transientConfig.retract ? "shrink" : "grow"}
                    headVisible={!transientConfig.retract}
                  />
                </g>
              )}
            </svg>

            {/* nodes */}
            <div className="absolute inset-0 z-30">
              {cyclePhases.map((phase, idx) => {
                const pos = getCirclePosition(idx, cyclePhases.length);
                const isActive  = activePhase  === phase.id;
                const isPreview = previewPhase === phase.id;
                const allowActiveColor = !isBackwardRun;
                const keepByTrail = isPhase1Completed && trailIndex >= 0 && idx <= trailIndex;
                const nodeHasColor = isPhase1Completed && (
                  (keepByTrail && phase.id !== suppressId) || (allowActiveColor && isActive && phase.id !== suppressId) || isPreview
                );
                return (
                  <div key={phase.id} className="absolute transition-all duration-300 pointer-events-none select-none"
                       style={{ left: `${pos.x}px`, top: `${pos.y}px`, transform: "translate(-50%, -50%)" }}>
                    <div className="flex flex-col items-center">
                      <div className={`relative w-12 h-12 rounded-full border-4 shadow-lg flex items-center justify-center text-lg
                                      ${getColorClasses(phase.color, nodeHasColor)}`}>
                        <span className={nodeHasColor ? "" : "grayscale opacity-40"}>{phase.icon}</span>
                        {((allowActiveColor && isActive && phase.id !== suppressId) || isPreview) && (
                          <span className={`pointer-events-none absolute inset-0 rounded-full animate-ping opacity-60
                            ${phase.color === "pink" ? "bg-pink-400" : phase.color === "lime" ? "bg-lime-400" : phase.color === "amber" ? "bg-amber-400" : "bg-teal-400"}`} />
                        )}
                      </div>
                      <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ring-1 ring-black/5 shadow-sm whitespace-nowrap
                        ${nodeHasColor
                          ? `${phase.color === "pink" ? "bg-pink-600" : phase.color === "lime" ? "bg-lime-600" : phase.color === "amber" ? "bg-amber-600" : "bg-teal-600"} text-white`
                          : "bg-white text-gray-700 border border-gray-200"}`}>
                        {phase.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {!isPhase1Completed && (
          <div className="text-center mt-1 text-[11px] text-gray-500">
            ⚠️ Hoàn thành giai đoạn 1 để mở khóa chu kỳ (nút “Cập nhật giai đoạn”).
          </div>
        )}
      </div>
    </div>
  );
}

/** Dropdown + Modal nhỏ riêng cho widget */
function LCConfirmModal({ open, onClose, onConfirm, title, message, highlight }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl w-full max-w-md p-6 ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 mb-3 text-sm">{message}</p>
        {highlight && <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">{highlight}</div>}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm">Hủy</button>
          <button onClick={onConfirm} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow">Xác nhận</button>
        </div>
      </div>
    </div>
  );
}
function LCPhaseDropdown({ activePhase, onPickPhase, onStartNewCycle }) {
  const [open, setOpen] = useState(false);
  const items = [
    { id: "flowering", name: "Ra Hoa", icon: "🌸" },
    { id: "fruiting", name: "Đậu quả", icon: "🍏" },
    { id: "pre_harvest", name: "Trước thu hoạch", icon: "🔍" },
    { id: "post_harvest", name: "Sau thu hoạch", icon: "🌿" },
  ];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-extrabold text-white
                   bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800
                   shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_6px_14px_rgba(37,99,235,.3)] ring-1 ring-black/10"
      >
        <ChevronDown className="w-3 h-3" />
        Cập nhật giai đoạn
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 bg-white/95 backdrop-blur rounded-xl shadow-2xl border border-gray-200 z-[60] overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {items.map((it) => (
              <div key={it.id}>
                <button
                  onClick={() => { setOpen(false); onPickPhase(it.id); }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl border transition-all flex items-center gap-2.5
                    ${activePhase === it.id ? "bg-emerald-50 border-emerald-300 shadow-sm" : "bg-white hover:bg-blue-50 border-gray-200 hover:shadow-md"}`}
                >
                  <span className="text-[18px] leading-none">{it.icon}</span>
                  <span className="font-semibold text-[12px] text-gray-900 whitespace-nowrap">{it.name}</span>
                </button>
                <div className="flex justify-center py-1 text-gray-300"><ArrowDown className="w-3.5 h-3.5" /></div>
              </div>
            ))}
            <button
              onClick={() => { setOpen(false); onStartNewCycle(); }}
              className="w-full mt-1 p-2.5 rounded-xl font-extrabold text-[12px] text-white
                         bg-gradient-to-r from-amber-400 to-pink-500 shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_8px_16px_rgba(236,72,153,.3)]
                         hover:from-amber-500 hover:to-pink-600"
            >
              🔄 Bắt đầu giai đoạn mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Widget gom state + điều khiển — dùng trong Aside */
function LifecycleWidget({
  tree, meta, portalId, value, onChange,
  cycleCount: cycleCountProp, phase1Completed: phase1CompletedProp,
  disabled = false,
  treeId,
  treeType,
  treeVariety,
}) {
  const cyclePhases = ["flowering", "fruiting", "pre_harvest", "post_harvest"];
  const isCyclePhase = (p) => cyclePhases.includes(p);

  const displayType =
  treeType ||
  getLoai(meta) ||
  getLoai(tree);

const displayVariety =
  treeVariety ||
  getGiong(meta) ||
  getGiong(tree);

  // Ưu tiên phase từ props.value (DB) -> fallback text trong tree
const initPhase = normalizePhaseId(
  value ??
  tree?.lifecycle?.currentPhaseId ??
  mapPhaseIdFromText(tree?.phenology?.currentPhase || tree?.phenology?.stage || tree?.phase || "")
);

// Thứ tự các phase trên vòng tròn


// Tính trạng thái ban đầu từ prop / tree
const initialPhase1Completed =
  typeof phase1CompletedProp === "boolean"
    ? phase1CompletedProp
    : initPhase !== "growth_development";

// Nếu đã qua giai đoạn 1 thì trailIndex = index của phase hiện tại
// (VD: pre_harvest -> 2; fruiting -> 1; flowering -> 0)
const initialTrailIndex = initialPhase1Completed
  ? Math.max(0, cyclePhases.indexOf(initPhase))
  : -1;


// Phase controlled
const [activePhase, setActivePhase] = useState(initPhase);
useEffect(() => {
  if (value != null) setActivePhase(normalizePhaseId(value));
}, [value]);

// Phase1Completed & cycleCount controlled
const [isPhase1Completed, setIsPhase1Completed] =
   useState(initialPhase1Completed);
useEffect(() => {
  if (typeof phase1CompletedProp === "boolean") {
    setIsPhase1Completed(phase1CompletedProp);
  }
}, [phase1CompletedProp]);

const [cycleCount, setCycleCount] = useState(
  Number.isFinite(cycleCountProp) ? Number(cycleCountProp) : 0
);
useEffect(() => {
  if (Number.isFinite(cycleCountProp)) {
    setCycleCount(Number(cycleCountProp));
  }
}, [cycleCountProp]);

// Giữ nguyên các state còn lại của bạn ngay sau đây:
const [previewPhase, setPreviewPhase] = useState(null);
const [isSpinning, setIsSpinning] = useState(false);


  const [transitionFlow, setTransitionFlow] = useState(null);
  const [transitionKey, setTransitionKey] = useState(0);
  const [p1Transition, setP1Transition] = useState(false);
  const [p1Key, setP1Key] = useState(0);
  const [trailIndex, setTrailIndex] = useState(isPhase1Completed ? 0 : -1);
  const [suppressId, setSuppressId] = useState(null);
  const [isBackwardRun, setIsBackwardRun] = useState(false);
  const [postHideIdx, setPostHideIdx] = useState(null);
  const [isRunning, setIsRunning] = useState(false);


  const runSpinReset = () => { setIsSpinning(true); setTimeout(() => setIsSpinning(false), 1000); };

  useEffect(() => {
  // Nếu parent đẩy phase/phase1Completed mới từ DB thì đồng bộ lại
  const externalPhase = normalizePhaseId(
    value ??
      tree?.lifecycle?.currentPhaseId ??
      mapPhaseIdFromText(
        tree?.phenology?.currentPhase ||
          tree?.phenology?.stage ||
          tree?.phase ||
          ""
      )
  );

  const externalP1Done =
    typeof phase1CompletedProp === "boolean"
      ? phase1CompletedProp
      : externalPhase !== "growth_development";

  if (!externalP1Done) {
    setTrailIndex(-1);
    return;
  }

  const idx = cyclePhases.indexOf(externalPhase);
  if (idx >= 0) setTrailIndex(idx);
}, [value, phase1CompletedProp]);


  // Modal xác nhận (nhỏ)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPhase, setPendingPhase] = useState(null);
  const [confirmText, setConfirmText] = useState({ title: "", message: "", highlight: "" });

  const [portalEl, setPortalEl] = useState(null);
useEffect(() => {
  if (!portalId) return;
  const el = document.getElementById(portalId);
  setPortalEl(el || null);
}, [portalId]);

  const labelOf = (id) => ({
    growth_development:"Sinh trưởng & Phát triển",
    flowering:"Ra Hoa", fruiting:"Đậu quả", pre_harvest:"Trước thu hoạch", post_harvest:"Sau thu hoạch",
  }[id] || id);

  // Lấy giá trị đầu tiên có thật (string hoặc object {name/label/...})
const first = (...xs) => xs.find(Boolean) || "";

// Chuẩn hoá cách đọc "loại" và "giống" từ nhiều kiểu data phổ biến
const getLoai = (src) =>
  labelOf(first(
    src?.loai, src?.type, src?.species, src?.plant, src?.tree_type, src?.cropName, src?.nameLoai
  ));

const getGiong = (src) =>
  labelOf(first(
    src?.giong, src?.variety, src?.cultivar, src?.subtype, src?.tree_variety, src?.nameGiong
  ));


  const buildSteps = (from, to) => {
    const steps = [];
    const N = cyclePhases.length;
    if (from === "growth_development" && isCyclePhase(to)) { steps.push({ type: "p1" }); from = "flowering"; }
    if (isCyclePhase(from) && isCyclePhase(to) && from !== to) {
      let i = cyclePhases.indexOf(from), j = cyclePhases.indexOf(to);
      let dir = (from === "post_harvest" && to === "flowering") ? +1 : (j > i ? +1 : -1);
      while (i !== j) { const next = (i + dir + N) % N; steps.push({ type: "arc", from: cyclePhases[i], to: cyclePhases[next] }); i = next; }
    }
    return steps;
  };

  const flush = () => new Promise((rs) => requestAnimationFrame(() => requestAnimationFrame(rs)));
  const wait  = (ms) => new Promise((r) => setTimeout(r, ms));

  const playSteps = async (steps, finalTo, shouldSpin) => {
    setTransitionFlow(null); setPreviewPhase(null); setSuppressId(null); setPostHideIdx(null);
    const DUR = 1150, DWELL = 200;

    const firstArc = steps.find(s => s.type === "arc");
    if (firstArc) {
      const N = cyclePhases.length;
      const iFrom = cyclePhases.indexOf(firstArc.from);
      const iTo   = cyclePhases.indexOf(firstArc.to);
      setIsBackwardRun(((iFrom + 1) % N !== iTo));
    } else setIsBackwardRun(false);

    for (let idx = 0; idx < steps.length; idx++) {
      const s = steps[idx];
      if (s.type === "p1") {
        setP1Transition(true); setP1Key(k => k + 1);
        await wait(950); setP1Transition(false);
        if (!isPhase1Completed) setIsPhase1Completed(true);
        setTrailIndex(0);
        setPreviewPhase("flowering"); await wait(DWELL); setPreviewPhase(null);
        continue;
      }
      const N = cyclePhases.length;
      const iFrom = cyclePhases.indexOf(s.from), iTo = cyclePhases.indexOf(s.to);
      const dir = ((iFrom + 1) % N === iTo) ? +1 : -1;

      if (dir === -1) { setSuppressId(s.from); await flush(); }
      setTransitionFlow({ from: s.from, to: s.to }); setTransitionKey(k => k + 1);
      await wait(DUR);
      setTransitionFlow(null); setPostHideIdx(dir === -1 ? iTo : iFrom);
      setTimeout(() => setPostHideIdx(null), 130); await flush();

      if (dir === +1) { setPreviewPhase(s.to); await wait(DWELL); setTrailIndex(iTo); setPreviewPhase(null); }
      else {
        if (idx < steps.length - 1) setTrailIndex((iTo - 1 + N) % N); else setTrailIndex(iTo);
        await flush(); setSuppressId(null); await wait(DWELL);
      }
    }

    
    setActivePhase(finalTo); setPreviewPhase(null); setSuppressId(null); setIsBackwardRun(false);
    if (shouldSpin) runSpinReset();
  };


  const requestChangePhase = (to, cause = "pick") => {
    if (isRunning) return;
    const from = activePhase;
    let title = "Xác nhận đổi giai đoạn";
    let message = `Bạn muốn chuyển từ "${labelOf(from)}" sang "${labelOf(to)}"?`;
    let highlight = "";
    if (from === "post_harvest" && to === "flowering") highlight = "Chuyển Sau thu hoạch → Ra Hoa sẽ BẮT ĐẦU MỘT CHU KỲ MỚI.";
    if (from === "growth_development" && isCyclePhase(to)) message = `Hoàn tất "${labelOf(from)}" và chuyển sang "${labelOf(to)}"?`;
    if (cause === "start-new-cycle") { title = "Bắt đầu giai đoạn mới"; message = "Chu kỳ mới sẽ khởi động và vòng xoay 1s."; highlight = "Điểm bắt đầu: Ra Hoa."; }
    setPendingPhase(to); setConfirmText({ title, message, highlight }); setConfirmOpen(true);
  };

 
  const onConfirmModal = async () => {
    if (isRunning) return;
    const to = pendingPhase; if (!to) return;
    setConfirmOpen(false); setPendingPhase(null); await flush();
    setIsRunning(true);

    const from = activePhase;
    const shouldSpin = (from === "post_harvest" && to === "flowering") || confirmText.title === "Bắt đầu giai đoạn mới";
    const steps = buildSteps(from, to);

    let nextPhaseId = to;

// Nếu không có bước animation, vẫn phải tự cập nhật trail hợp lý
if (steps.length === 0) {
  if (from === "growth_development" && to === "growth_development") {
    setActivePhase(to);
  } else if (from === "post_harvest" && to === "flowering") {
    setActivePhase(to);
    setTrailIndex(0);
    runSpinReset();
  } else {
    setActivePhase(to);
    setTrailIndex(cyclePhases.indexOf(to));
  }
} else {
  await playSteps(steps, to, shouldSpin);
}

// TÍNH TRẠNG THÁI MỚI (sau khi đã chạy animation nếu có)
const nextP1 = (nextPhaseId !== "growth_development");

// Nếu là Sau thu hoạch -> Ra Hoa thì tăng chu kỳ
const nextCount =
  (from === "post_harvest" && nextPhaseId === "flowering")
    ? (cycleCount + 1)
    : cycleCount;

// Đặt state local để widget phản ánh ngay
setIsPhase1Completed(nextP1);
setCycleCount(nextCount);
setActivePhase(nextPhaseId);

// BẮN SỰ KIỆN RA PARENT ĐỂ LƯU DB
if (typeof onChange === "function") {
  onChange({
    phaseId: nextPhaseId,
    cycleCount: nextCount,
    phase1Completed: nextP1,
  });
}

setIsRunning(false);
};

   const nameSource = (meta?.name ?? tree?.name ?? "").trim();
 const varietySource = meta?.variety ?? tree?.variety ?? "—";
 const treeData = {
  id: (treeId ?? tree?.id ?? "—"), // ⬅️ đồng bộ với mã cây (codeKey)
  type: nameSource.split(/\s+/)[0] || "Cây",
  variety: varietySource,
  currentPhase: activePhase,
  cycleCount,
  isPhase1Completed,
};

  return (
    <div className="relative">
      {/* nút điều khiển gọn, bám góc phải */}
      {!disabled && (portalEl
  ? createPortal(
      <LCPhaseDropdown
        activePhase={activePhase}
        onPickPhase={(id) => requestChangePhase(id, "pick")}
        onStartNewCycle={() => requestChangePhase("flowering", "start-new-cycle")}
      />,
      portalEl
    )
  : (
    <div className="absolute right-0 -top-1">
      <LCPhaseDropdown
        activePhase={activePhase}
        onPickPhase={(id) => requestChangePhase(id, "pick")}
        onStartNewCycle={() => requestChangePhase("flowering", "start-new-cycle")}
      />
    </div>
  )
)}
{disabled && (
  <div className="absolute right-0 -top-1">
    <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[11px] font-extrabold text-white bg-gray-400 cursor-not-allowed" title="Đã dừng hoạt động">
      Cập nhật giai đoạn
    </span>
  </div>
)}



      <div className="flex justify-center">
        <LifecycleTimeline
          activePhase={activePhase}
          previewPhase={previewPhase}
          isPhase1Completed={isPhase1Completed}
          isSpinning={isSpinning}
          treeData={treeData}
          treeId={treeId}                 // 👈 mã cây chuẩn
  treeType={displayType}          // 👈 loại chuẩn
  treeVariety={displayVariety}
          transitionFlow={transitionFlow}
          transitionKey={transitionKey}
          p1Transition={p1Transition}
          p1Key={p1Key}
          trailIndex={trailIndex}
          suppressId={suppressId}
          isBackwardRun={isBackwardRun}
          postHideIdx={postHideIdx}
        />
      </div>

      <LCConfirmModal
        open={confirmOpen}
        onClose={() => { if (!isRunning) { setConfirmOpen(false); setPendingPhase(null); } }}
        onConfirm={onConfirmModal}
        title={confirmText.title}
        message={confirmText.message}
        highlight={confirmText.highlight}
      />
    </div>
  );
}


/* =========================================================================
   AI Suggestions (demo)
   ========================================================================= */
/* =========================================================================
   AI Suggestions (demo)
   ========================================================================= */
function getAISuggestions(tree, phaseId) {
  const pid = normalizePhaseId(
    phaseId ||
      tree?.lifecycle?.currentPhaseId ||
      tree?.phenology?.currentPhase ||
      tree?.phenology?.stage ||
      tree?.phase
  );

  // helper: ngày gợi ý luôn >= hôm nay
  const dueIn = (days) => addDays(Math.max(0, days));

  // Mỗi gợi ý: { type: 'water'|'fert'|'pest'|'other', title, due: 'YYYY-MM-DD', details: [..] }
  switch (pid) {
    case "growth_development": // Sinh trưởng & Phát triển
      return [
        {
          type: "water",
          title: "Tưới giữ ẩm 70–80%",
          due: dueIn(0),
          details: ["10–12L/cây (điều chỉnh theo ẩm đất 20–30cm)", "Tưới sáng sớm, tránh nắng gắt"],
        },
        {
          type: "fert",
          title: "Bón NPK cân đối 16-16-8",
          due: dueIn(3),
          details: ["200–300g/cây", "Rải theo mép tán + lấp đất nhẹ", "Tưới đẫm sau bón"],
        },
        {
          type: "pest",
          title: "Theo dõi rầy chổng cánh",
          due: dueIn(1),
          details: ["Đặt bẫy dính vàng", "Khảo sát lá non, chồi non", "Chụp ảnh mẫu nghi ngờ"],
        },
      ];

    case "flowering": // Ra hoa
      return [
        {
          type: "water",
          title: "Điều tiết tưới nhẹ hỗ trợ ra hoa",
          due: dueIn(0),
          details: ["Giữ ẩm nền, tránh dư nước", "Không tưới chiều muộn"],
        },
        {
          type: "fert",
          title: "Phân bón lá vi lượng (Bo/Zn) hỗ trợ thụ phấn",
          due: dueIn(2),
          details: ["Pha đúng nồng độ khuyến cáo", "Phun sáng sớm/chiều mát"],
        },
        {
          type: "pest",
          title: "Theo dõi nấm bệnh trên hoa",
          due: dueIn(1),
          details: ["Quan sát rụng hoa bất thường", "Vệ sinh tán, thoáng khí"],
        },
      ];

    case "fruiting": // Đậu/nuôi quả
      return [
        {
          type: "other",
          title: "Bao trái lứa 1",
          due: dueIn(0),
          details: ["Bao khi quả đạt kích thước chuẩn", "Dùng bao thoáng, sạch"],
        },
        {
          type: "fert",
          title: "Tăng K (ví dụ NPK 13-13-20 hoặc K₂O cao)",
          due: dueIn(4),
          details: ["Liều lượng theo tuổi/tán", "Chia nhỏ, bón xa gốc theo mép tán"],
        },
        {
          type: "water",
          title: "Tưới định kỳ giữ ẩm ổn định",
          due: dueIn(1),
          details: ["8–12L/cây/đợt", "Tránh thay đổi ẩm đột ngột gây nứt quả"],
        },
      ];

    case "pre_harvest": // Trước thu hoạch
      return [
        {
          type: "other",
          title: "Khảo sát độ chín/độ brix",
          due: dueIn(0),
          details: ["Lấy mẫu đại diện", "Ghi brix/độ già quả để lên lịch cắt"],
        },
        {
          type: "water",
          title: "Điều tiết tưới trước thu hoạch",
          due: dueIn(1),
          details: ["Giữ ẩm vừa đủ", "Tránh tưới đẫm sát ngày cắt"],
        },
        {
          type: "pest",
          title: "Vệ sinh cỏ rác lối đi thu hoạch",
          due: dueIn(2),
          details: ["Dọn sạch, chống trơn trượt", "Chuẩn bị sọt/kệ sạch"],
        },
      ];

    case "post_harvest": // Sau thu hoạch
      return [
        {
          type: "other",
          title: "Tỉa cành tạo tán sau thu",
          due: dueIn(1),
          details: ["Loại cành sâu bệnh, cành già", "Tạo thoáng, cân đối tán"],
        },
        {
          type: "fert",
          title: "Bón phục hồi hữu cơ + NPK nhẹ",
          due: dueIn(3),
          details: ["Bổ sung hữu cơ hoai mục", "NPK nhẹ thúc chồi lá mới"],
        },
        {
          type: "pest",
          title: "Vệ sinh vườn, thu gom phụ phẩm",
          due: dueIn(0),
          details: ["Thu gom quả rụng", "Đốt/chôn đúng quy trình tránh lây bệnh"],
        },
      ];

    default:
      return [];
  }
}
