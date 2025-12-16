// src/components/tree/TreeInfoPanel.jsx
import React from "react";
import {
  TreePine,
  Hash,
  Sprout,
  Calendar as CalendarIcon,
  Ruler,
  BadgeCheck,
  Image as ImageIcon,
  Leaf,
  GitBranch,
  Flower2,
  Apple,
} from "lucide-react";

/* ---------------------- helpers ---------------------- */
const fmtDate = (d) => {
  try {
    const x = new Date(d);
    return x.toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
};

// months since `from` until now, rounded sensibly (>=15 ngày tính +1)
const monthsSince = (from) => {
  const s = new Date(from);
  const e = new Date();
  let m =
    (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const dayDelta = e.getDate() - s.getDate();
  if (dayDelta >= 15) m += 1;
  if (dayDelta <= -15) m -= 1;
  return Math.max(0, m);
};

// “Bình thường” nếu rỗng/null/undefined
const safeNormal = (v, fallback = "Bình thường") => {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
};

const KV = ({ icon: Icon, label, value, valueClass = "" }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 rounded-xl bg-emerald-600/10 p-2 text-emerald-600">
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <div className="text-[13px] uppercase tracking-wide text-emerald-300/80">
        {label}
      </div>
      <div
        className={`truncate text-lg font-semibold ${
          valueClass || "text-emerald-50"
        }`}
      >
        {value}
      </div>
    </div>
  </div>
);

const Pill = ({ icon: Icon, children, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-slate-700/40 text-slate-100 ring-1 ring-white/10",
    ok: "bg-emerald-600/15 text-emerald-100 ring-1 ring-emerald-500/30",
    warn: "bg-amber-600/15 text-amber-100 ring-1 ring-amber-500/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm ${tones[tone]}`}
    >
      {Icon ? <Icon size={16} className="opacity-90" /> : null}
      {children}
    </span>
  );
};

/* ---------------------- component ---------------------- */
export default function TreeInfoPanel({ data, className = "" }) {
  // Demo cứng nếu chưa truyền từ backend
  const demo = {
    species: "Xoài",
    code: "T-001",
    variety: "Cát chu",
    plantDate: "2023-04-15",
    prePlantAgeMonths: 5, // tuổi trước khi trồng
    soilType: "Đất phù sa cao ráo",
    photoUrl: "",

    // trạng thái hiện tại
    status: {
      leaf: "Lá bánh tẻ xanh; rễ trắng khoẻ; gốc sạch",
      branch: "Bình thường",
      flower: "", // trống -> Bình thường
      fruit: "", // trống -> Bình thường
    },

    // thẻ stage (tùy ý)
    stage: "Đang chăm sóc",
  };

  const t = { ...(data || demo) };
  const totalAge =
    (Number(t.prePlantAgeMonths) || 0) + monthsSince(t.plantDate);

  return (
    <section
      className={
        "rounded-2xl border border-white/10 bg-white/[.03] p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,.5)] backdrop-blur " +
        className
      }
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-700/30 p-2.5 text-emerald-200 ring-1 ring-emerald-500/30">
            <TreePine size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold leading-tight text-emerald-50">
              Thông tin cây
            </h2>
            <div className="text-sm text-emerald-200/70">
              Tổng quan & trạng thái nhanh
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Pill icon={BadgeCheck} tone="ok">
            {t.stage || "Đang chăm sóc"}
          </Pill>
          <button
            type="button"
            className="rounded-xl bg-emerald-600/80 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
          >
            Cập nhật
          </button>
        </div>
      </div>

      {/* Grid: info + photo */}
      <div className="grid grid-cols-12 gap-6">
        {/* left */}
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <KV icon={TreePine} label="Cây" value={safeNormal(t.species)} />
            <KV icon={Hash} label="Mã cây" value={`#${safeNormal(t.code)}`} />
            <KV
              icon={Sprout}
              label="Giống/Variety"
              value={safeNormal(t.variety)}
            />
            <KV
              icon={CalendarIcon}
              label="Ngày trồng"
              value={fmtDate(t.plantDate)}
            />
            <KV
              icon={Ruler}
              label="Tuổi trước khi trồng"
              value={`${Number(
                t.preMonths ?? t.preNurseryAgeMonths ?? t.prePlantAgeMonths ?? 0
              )} tháng`}
            />
            <KV icon={Ruler} label="Tổng tuổi" value={`${totalAge} tháng`} />
            {/* Tuổi thực tế / Tuổi dự kiến: prefer preMonths for actual and virtualAgeMonths for expected */}
            {(() => {
              // Tuổi thực tế: hiện thực = `totalAge` (tuổi trước khi trồng + tháng kể từ ngày trồng)
              const realToShow = Number.isFinite(totalAge) ? totalAge : NaN;

              // Tuổi dự kiến: ưu tiên `virtualAgeMonths` từ server; nếu không có thì fallback về `totalAge`.
              const virtual =
                typeof t.virtualAgeMonths === "number"
                  ? t.virtualAgeMonths
                  : typeof t.virtual_age_months === "number"
                  ? t.virtual_age_months
                  : null;
              const expected = virtual ?? totalAge;

              return (
                <>
                  <KV
                    icon={CalendarIcon}
                    label="Tuổi thực tế"
                    value={
                      Number.isFinite(realToShow) ? `${realToShow} tháng` : `—`
                    }
                    valueClass="!text-slate-400"
                  />
                  <KV
                    icon={CalendarIcon}
                    label="Tuổi dự kiến"
                    value={
                      Number.isFinite(expected) ? `${expected} tháng` : `—`
                    }
                    valueClass="!text-slate-400"
                  />
                </>
              );
            })()}
            <KV
              icon={BadgeCheck}
              label="Loại đất"
              value={safeNormal(t.soilType)}
            />
          </div>
        </div>

        {/* right - photo */}
        <div className="col-span-12 lg:col-span-4">
          <div className="h-full rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-200">
                Ảnh cây
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg bg-slate-800/70 px-3 py-1.5 text-xs text-slate-200 ring-1 ring-white/10 hover:bg-slate-800">
                  Chọn ảnh (tải lên)
                </button>
                <button className="rounded-lg bg-slate-800/70 px-3 py-1.5 text-xs text-slate-200 ring-1 ring-white/10 hover:bg-slate-800">
                  Dùng link
                </button>
              </div>
            </div>

            <div className="flex h-56 items-center justify-center overflow-hidden rounded-xl bg-slate-800/60 ring-1 ring-white/10">
              {t.photoUrl ? (
                <img
                  src={t.photoUrl}
                  alt="tree"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                  <ImageIcon />
                  <div className="text-sm opacity-80">Chưa có ảnh</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status section */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-bold text-emerald-50">
            Tình trạng hiện tại
          </div>
          <button className="rounded-xl bg-slate-800/70 px-4 py-2 text-sm text-slate-100 ring-1 ring-white/10 hover:bg-slate-800">
            Cập nhật
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white/[.02] p-4 ring-1 ring-white/10">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Leaf size={16} /> Lá
            </div>
            <p className="text-slate-300">{safeNormal(t.status?.leaf)}</p>
          </div>

          <div className="rounded-xl bg-white/[.02] p-4 ring-1 ring-white/10">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <GitBranch size={16} /> Cành
            </div>
            <p className="text-slate-300">{safeNormal(t.status?.branch)}</p>
          </div>

          <div className="rounded-xl bg-white/[.02] p-4 ring-1 ring-white/10">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Flower2 size={16} /> Hoa
            </div>
            <p className="text-slate-300">{safeNormal(t.status?.flower)}</p>
          </div>

          <div className="rounded-xl bg-white/[.02] p-4 ring-1 ring-white/10">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Apple size={16} /> Quả
            </div>
            <p className="text-slate-300">{safeNormal(t.status?.fruit)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
