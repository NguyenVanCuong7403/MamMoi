import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  Filter as FilterIcon,
  Sprout,
  Calendar,
  MapPin,
  Plus,
  User,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

/* --- Palette --- */
const PALETTE = { bg: "#1F302F", leaf: "#D1DFB6", ivory: "#FBFFDF", accent: "#FFFFA5" };

/* --- Demo data (đã bỏ "paused" → "stopped") --- */
const TREES = [
  {
    id: "T-001",
    commonName: "Xoài Cát Chu",
    variety: "Giống địa phương",
    plantedAt: "2023-04-15",
    location: "Vườn số 1 – FPT",
    phase: "Sinh trưởng thân lá",
    status: "active",
    caretaker: "Quân",
    stateNote: "Lá vàng",
    img: "https://images.unsplash.com/photo-1591781862772-b0b6b1f88b68?q=80&w=1200&auto=format&fit=crop",
    todos: [
      { text: "Tưới giữ ẩm 70–80%", priority: "medium", due: "Hôm nay" },
      { text: "Bón gốc NPK 16-16-8", priority: "high", due: "Quá hạn 2 ngày" },
      { text: "Tỉa cành trong tán", priority: "low", due: "18/10/2025" },
    ],
  },
  {
    id: "T-002",
    commonName: "Sầu riêng Ri6",
    variety: "Ri6",
    plantedAt: "2022-10-01",
    location: "Vườn số 2 – FPT",
    phase: "Ra hoa",
    status: "stopped", // trước đây "paused"
    caretaker: "Quân",
    stateNote: "Không có",
    img: "https://images.unsplash.com/photo-1604916287593-0710ae94f43f?q=80&w=1200&auto=format&fit=crop",
    todos: [
      { text: "Phun Bo + Ca trước nở", priority: "high", due: "Hôm nay" },
      { text: "Theo dõi ẩm 70–80%", priority: "low", due: "17/10/2025" },
    ],
  },
  {
    id: "T-003",
    commonName: "Bưởi Da Xanh",
    variety: "Da xanh",
    plantedAt: "2020-08-20",
    location: "Vườn số 3 – FPT",
    phase: "Đậu/nuôi quả",
    status: "active",
    caretaker: "Quân",
    stateNote: "Không có",
    img: "https://images.unsplash.com/photo-1613758947306-0cb0d5859d6?q=80&w=1200&auto=format&fit=crop",
    todos: [
      { text: "Bao trái lứa chính", priority: "medium", due: "Hôm nay" },
      { text: "Tăng Kali, hạn chế N", priority: "high", due: "20/10/2025" },
    ],
  },
  {
    id: "T-004",
    commonName: "Chuối già Nam Mỹ",
    variety: "Già Nam Mỹ",
    plantedAt: "2021-02-10",
    location: "Vườn số 4 – FPT",
    phase: "Sau thu",
    status: "stopped",
    caretaker: "Quân",
    stateNote: "—",
    img: "https://images.unsplash.com/photo-1587731506375-4bcd2c9da3b3?q=80&w=1200&auto=format&fit=crop",
    todos: [{ text: "Vệ sinh vườn, dọn tàn dư", priority: "low", due: "Nhắc" }],
  },
];

function monthsBetween(aStr, b = new Date()) {
  const a = new Date(aStr + "T00:00:00");
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
}

const hasOverdue = (t) =>
  (t.todos || []).some((x) => String(x.due || "").toLowerCase().includes("quá hạn"));

const isStopped = (t) => t.status === "stopped";

function StatusPill({ status }) {
  const map = {
    active: { label: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    stopped: { label: "Dừng hoạt động", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  };
  const s = map[status] || map.active;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {s.label}
    </span>
  );
}

function PhasePill({ phase }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border"
      style={{ background: PALETTE.leaf, color: PALETTE.bg, borderColor: "#cfe3bf" }}
    >
      <Sprout className="h-3.5 w-3.5" /> {phase}
    </span>
  );
}

function TodoRow({ text, due, priority }) {
  const dueColor = String(due).toLowerCase().includes("quá hạn")
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : String(due).toLowerCase().includes("hôm nay")
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-neutral-50 text-neutral-600 border-neutral-200";
  const prColor =
    priority === "high"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : priority === "medium"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return (
    <li className="flex items-center justify-between gap-2 py-1">
      <span className="text-sm text-neutral-800">{text}</span>
      <span className="inline-flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${prColor}`}>
          {priority}
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${dueColor}`}>
          {due}
        </span>
      </span>
    </li>
  );
}

/* ----------------------------- Main Screen ----------------------------- */
export default function TreeManagement() {
  const [trees] = useState(TREES);

  // Search + filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | active | stopped
  const [gardens, setGardens] = useState(new Set());
  const [varieties, setVarieties] = useState(new Set());
  const [caretakers, setCaretakers] = useState(new Set());
  const [phases, setPhases] = useState(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateOrder, setDateOrder] = useState("desc"); // mặc định: mới nhất trước
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  // Pagination 4x3
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);

  // Options
  const gardenOpts = useMemo(
    () => Array.from(new Set(trees.map((t) => t.location))).sort(),
    [trees]
  );
  const varietyOpts = useMemo(
    () => Array.from(new Set(trees.map((t) => t.variety))).sort(),
    [trees]
  );
  const caretakerOpts = useMemo(
    () => Array.from(new Set(trees.map((t) => t.caretaker))).sort(),
    [trees]
  );
  const phaseOpts = useMemo(
    () => Array.from(new Set(trees.map((t) => t.phase))).sort(),
    [trees]
  );

  // Stats (quá hạn chỉ tính cây đang hoạt động)
  const stats = useMemo(() => {
    const total = trees.length;
    const active = trees.filter((t) => t.status === "active").length;
    const stopped = trees.filter((t) => t.status === "stopped").length;
    const overdue = trees.reduce(
      (n, t) =>
        n +
        (t.status === "active"
          ? (t.todos || []).filter((x) => String(x.due).toLowerCase().includes("quá hạn")).length
          : 0),
      0
    );
    return { total, active, stopped, overdue };
  }, [trees]);

  // Helpers
  const toggleSet = (set, setter, value) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  };
  const clearAllFilters = () => {
    setStatus("all");
    setGardens(new Set());
    setVarieties(new Set());
    setCaretakers(new Set());
    setPhases(new Set());
    setDateFrom("");
    setDateTo("");
    setDateOrder("desc");
    setOnlyOverdue(false);
  };

  // Filtered + sorted list (stopped luôn ở cuối)
  const filtered = useMemo(() => {
    let list = trees.filter((t) => {
      const sMatch =
        !q ||
        [t.id, t.commonName, t.variety, t.location].join(" ").toLowerCase().includes(q.toLowerCase());
      if (!sMatch) return false;

      if (status !== "all" && t.status !== status) return false;

      const inSet = (set, v) => set.size === 0 || set.has(v);
      if (!inSet(gardens, t.location)) return false;
      if (!inSet(varieties, t.variety)) return false;
      if (!inSet(caretakers, t.caretaker)) return false;
      if (!inSet(phases, t.phase)) return false;

      if (onlyOverdue && !(t.status === "active" && hasOverdue(t))) return false;

      const d = new Date(t.plantedAt + "T00:00:00");
      if (dateFrom) {
        const from = new Date(dateFrom + "T00:00:00");
        if (d < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo + "T23:59:59");
        if (d > to) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      const prio = (s) => (s === "stopped" ? 1 : 0); // active trước, stopped sau
      if (prio(a.status) !== prio(b.status)) return prio(a.status) - prio(b.status);
      const da = new Date(a.plantedAt).getTime();
      const db = new Date(b.plantedAt).getTime();
      return dateOrder === "asc" ? da - db : db - da;
    });

    return list;
  }, [
    trees,
    q,
    status,
    gardens,
    varieties,
    caretakers,
    phases,
    dateFrom,
    dateTo,
    dateOrder,
    onlyOverdue,
  ]);

  // Reset về trang 1 khi bộ lọc thay đổi
  useEffect(() => {
    setPage(1);
  }, [q, status, gardens, varieties, caretakers, phases, dateFrom, dateTo, onlyOverdue, dateOrder]);

  // Trang hiện tại
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(filtered.length, page * PAGE_SIZE);
  const pageItems = useMemo(() => filtered.slice(startIdx, endIdx), [filtered, startIdx, endIdx]);

  return (
    <div className="relative min-h-screen pt-[64px]">
      {/* keyframes cho glow cảnh báo */}
      <style>{`
        @keyframes mmOverduePulse {
          0%   { box-shadow: 0 0 0 0 rgba(244,63,94,.00); }
          50%  { box-shadow: 0 0 22px 10px rgba(244,63,94,.22); }
          100% { box-shadow: 0 0 0 0 rgba(244,63,94,.00); }
        }
      `}</style>

      {/* ===== Header nhỏ gọn (đã bỏ HERO lớn) ===== */}
      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 space-y-6">
        <section
          aria-label="Page header"
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6"
        >
          <div className="max-w-[760px]">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium"
              style={{ background: PALETTE.accent, color: PALETTE.bg }}
            >
              Bảng quản lý vườn
            </span>
            <h1 className="mt-2 text-white text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
              Vườn cây ăn quả của tôi
            </h1>
            <p className="text-white/85 mt-1 text-sm md:text-base">
              Theo dõi tuổi cây, giai đoạn sinh trưởng, công việc và tình trạng chăm sóc — tất cả trên một màn hình.
            </p>
          </div>

          <div className="w-full md:w-auto flex items-stretch md:items-center gap-3 md:gap-4">
            <Button
              className="h-12 md:h-12 px-5 md:px-6 rounded-2xl text-base font-semibold
                         shadow-[0_10px_28px_rgba(255,255,165,0.20)] ring-1 ring-black/5
                         transition-all hover:shadow-[0_14px_44px_rgba(255,255,165,0.26)] hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#FFFFA5 0%, #D1DFB6 100%)", color: "#1F302F" }}
            >
              <span className="inline-flex items-center gap-3">
                <span className="grid place-items-center w-8 h-8 rounded-xl bg-white/70 backdrop-blur">
                  <Plus className="w-5 h-5" />
                </span>
                Thêm cây ăn quả
              </span>
            </Button>

            {/* Thẻ thời tiết giữ nguyên nội dung, đổi sang dạng card độc lập */}
            <div className="rounded-2xl p-4 w-64 md:w-72 backdrop-blur-md text-white border border-white/15 bg-white/10 shadow-2xl">
              <div className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4 opacity-80" />
                Hanoi, Vietnam
              </div>
              <div className="text-3xl md:text-4xl font-semibold mt-1">29°</div>
              <div className="text-xs opacity-80">Nắng nhẹ · Gió 5km/h</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-full text-[11px] border border-white/20 bg-white/10">UV thấp</span>
                <span className="px-2 py-1 rounded-full text-[11px] border border-white/20 bg-white/10">Độ ẩm 65%</span>
              </div>
            </div>
          </div>
        </section>

        {/* search + filter */}
        <section className="sticky top-[64px] z-[50] overflow-visible">
          <div
            className="flex flex-col xl:flex-row gap-3 rounded-2xl p-3"
            style={{ background: "rgba(251,255,223,0.06)", border: "1px solid rgba(255,255,165,0.15)" }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm tên/ID/vị trí..."
                className="pl-9 bg-white/95 text-[#0f1f1e] placeholder:text-neutral-500 rounded-full h-11"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white/95 h-11 rounded-full">
                  <FilterIcon className="h-4 w-4" /> Bộ lọc
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuPortal>
                <DropdownMenuContent
                  align="end"
                  side="bottom"
                  sideOffset={10}
                  collisionPadding={24}
                  className="z-[1000] min-w=[320px] rounded-xl border border-neutral-200 bg-white shadow-2xl overflow-visible"
                >
                  <DropdownMenuLabel className="px-3 pt-2 pb-1 text-[11px] text-neutral-500">
                    Trạng thái
                  </DropdownMenuLabel>

                  {[
                    { key: "all", label: "Tất cả", count: stats.total },
                    { key: "active", label: "Đang hoạt động", count: stats.active },
                    { key: "stopped", label: "Dừng hoạt động", count: stats.stopped },
                  ].map((opt) => {
                    const active = status === opt.key;
                    return (
                      <DropdownMenuItem
                        key={opt.key}
                        onClick={() => setStatus(opt.key)}
                        className={
                          "flex items-center justify-between gap-3 py-2 rounded-none cursor-pointer " +
                          (active ? "bg-neutral-100" : "hover:bg-neutral-50")
                        }
                      >
                        <span className="inline-flex items-center gap-2">
                          {active ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
                          {opt.label}
                        </span>
                        <span className="px-1.5 py-0.5 text-[11px] rounded-full bg-neutral-100 border border-neutral-200">
                          {opt.count}
                        </span>
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator className="my-2" />

                  {/* Theo khu vườn */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                      <MapPin className="h-4 w-4" /> Theo khu vườn
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[240px] rounded-xl border border-neutral-200 bg-white shadow-2xl">
                      {gardenOpts.map((g) => (
                        <DropdownMenuCheckboxItem
                          key={g}
                          checked={gardens.has(g)}
                          onCheckedChange={() => toggleSet(gardens, setGardens, g)}
                          className="cursor-pointer"
                        >
                          {g}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setGardens(new Set())} className="text-neutral-600">
                        Xóa lựa chọn
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  {/* Theo giống */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                      <Sprout className="h-4 w-4" /> Theo giống
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[220px] rounded-xl border border-neutral-200 bg-white shadow-2xl">
                      {varietyOpts.map((v) => (
                        <DropdownMenuCheckboxItem
                          key={v}
                          checked={varieties.has(v)}
                          onCheckedChange={() => toggleSet(varieties, setVarieties, v)}
                          className="cursor-pointer"
                        >
                          {v}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setVarieties(new Set())} className="text-neutral-600">
                        Xóa lựa chọn
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  {/* Theo nhân viên */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                      <User className="h-4 w-4" /> Theo nhân viên
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[200px] rounded-xl border border-neutral-200 bg-white shadow-2xl">
                      {caretakerOpts.map((u) => (
                        <DropdownMenuCheckboxItem
                          key={u}
                          checked={caretakers.has(u)}
                          onCheckedChange={() => toggleSet(caretakers, setCaretakers, u)}
                          className="cursor-pointer"
                        >
                          {u}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setCaretakers(new Set())} className="text-neutral-600">
                        Xóa lựa chọn
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  {/* Theo giai đoạn */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                      <Sprout className="h-4 w-4" /> Theo giai đoạn
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[240px] rounded-xl border border-neutral-200 bg-white shadow-2xl">
                      {phaseOpts.map((p) => (
                        <DropdownMenuCheckboxItem
                          key={p}
                          checked={phases.has(p)}
                          onCheckedChange={() => toggleSet(phases, setPhases, p)}
                          className="cursor-pointer"
                        >
                          {p}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setPhases(new Set())} className="text-neutral-600">
                        Xóa lựa chọn
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  {/* Theo ngày thêm */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                      <Calendar className="h-4 w-4" /> Theo ngày thêm
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[280px] rounded-xl border border-neutral-200 bg-white shadow-2xl p-3">
                      <div className="text-[12px] text-neutral-600 mb-1">Sắp xếp</div>
                      <DropdownMenuRadioGroup value={dateOrder} onValueChange={setDateOrder}>
                        <DropdownMenuRadioItem value="desc">Mới nhất → Cũ nhất</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="asc">Cũ nhất → Mới nhất</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>

                      <DropdownMenuSeparator className="my-2" />
                      <div className="grid gap-2 text-sm">
                        <div className="grid gap-1">
                          <div className="text-[12px] text-neutral-600">Từ ngày</div>
                          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9" />
                        </div>
                        <div className="grid gap-1">
                          <div className="text-[12px] text-neutral-600">Đến ngày</div>
                          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9" />
                        </div>
                        <div className="flex justify-between pt-1">
                          <Button size="sm" variant="ghost" className="h-8" onClick={() => { setDateFrom(""); setDateTo(""); }}>
                            Xóa
                          </Button>
                          <Button size="sm" className="h-8">Áp dụng</Button>
                        </div>
                      </div>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator className="my-2" />

                  {/* Chỉ hiển thị cây có việc quá hạn (chỉ áp cho active) */}
                  <DropdownMenuCheckboxItem
                    checked={onlyOverdue}
                    onCheckedChange={() => setOnlyOverdue((v) => !v)}
                    className="cursor-pointer"
                  >
                    Chỉ hiển thị cây có việc quá hạn
                  </DropdownMenuCheckboxItem>

                  <div className="px-3 py-3">
                    <Button variant="outline" className="w-full" onClick={clearAllFilters}>
                      Xóa tất cả bộ lọc
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </div>
        </section>

        {/* mini stats (4 ô) — glow đỏ cho “Việc quá hạn” khi >0 */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Tổng cây", value: stats.total },
            { label: "Đang hoạt động", value: stats.active },
            { label: "Dừng hoạt động", value: stats.stopped },
            { label: "Việc quá hạn", value: stats.overdue, icon: <AlertTriangle className="w-4 h-4" /> },
          ].map((s, i) => {
            const isOver = s.label === "Việc quá hạn" && Number(s.value) > 0;
            return (
              <div
                key={i}
                aria-live={isOver ? "polite" : undefined}
                className={
                  "relative rounded-xl px-4 py-3 flex items-center justify-between text-[13px] transition-all " +
                  (isOver
                    ? "border border-rose-300/50 bg-rose-400/5 animate-[mmOverduePulse_1.6s_ease-in-out_infinite]"
                    : "")
                }
                style={{
                  background: isOver ? undefined : "rgba(251,255,223,0.06)",
                  border:     isOver ? undefined : "1px solid rgba(255,255,165,0.15)",
                  color: PALETTE.ivory,
                }}
              >
                <span className={"inline-flex items-center gap-2 " + (isOver ? "text-rose-200" : "opacity-80")}>
                  {s.icon}
                  {s.label}
                </span>
                <span className={"font-semibold " + (isOver ? "text-rose-300" : "")}>{s.value}</span>
                {isOver && (
                  <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_0_6px_rgba(244,63,94,.32)]" />
                )}
              </div>
            );
          })}
        </section>

        {/* Cards grid – 4 cột */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-7 items-stretch">
          {pageItems.map((t) => {
            const stopped = isStopped(t);
            return (
              <Card
                key={t.id}
                className={
                  "group rounded-3xl overflow-hidden shadow-sm transition-all duration-200 h-full flex flex-col " +
                  (stopped ? "opacity-90" : "hover:-translate-y-0.5 hover:shadow-md")
                }
                style={{ background: "#FFFFFFF2", borderColor: "rgba(255,255,165,0.25)" }}
              >
                <div className="relative">
                  <img src={t.img} alt={t.commonName} className="h-48 w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                </div>

                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-[#0f1f1e]">{t.commonName}</div>
                      <div className="text-xs text-neutral-500"># {t.id}</div>
                    </div>
                    <StatusPill status={t.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-5">
                    <div>
                      <div className="text-neutral-500">Giai đoạn sinh trưởng</div>
                      <div className="mt-1">
                        <PhasePill phase={t.phase} />
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-500">Tuổi cây</div>
                      <div className="mt-1 flex items-center gap-2 text-neutral-800">
                        <Calendar className="h-4 w-4" /> {monthsBetween(t.plantedAt)} tháng
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                    <div>
                      <div className="text-neutral-500">Nhân viên chăm sóc</div>
                      <div className="mt-1 flex items-center gap-2 text-neutral-800">
                        <User className="h-4 w-4" /> {t.caretaker}
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-500">Trạng thái</div>
                      <div className="mt-1 text-neutral-800">{t.stateNote || "—"}</div>
                    </div>
                  </div>

                  {/* Việc cần làm */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-neutral-500 text-sm">Việc cần làm</div>
                      {!stopped && (() => {
                        const n = (t.todos || []).filter((x) =>
                          String(x.due).toLowerCase().includes("quá hạn")
                        ).length;
                        return n > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-xs border bg-rose-50 text-rose-700 border-rose-200">
                            {n} Quá hạn
                          </span>
                        ) : null;
                      })()}
                    </div>

                    {stopped ? (
                      <div className="mt-2 text-xs px-3 py-2 rounded-lg bg-neutral-100 text-neutral-600 border border-neutral-200">
                        Cây đã <span className="font-medium">dừng hoạt động</span> — ngừng mọi nhắc việc/gợi ý. Chỉ dùng để tra cứu lịch sử.
                      </div>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {(t.todos || []).map((x, i) => (
                          <TodoRow key={i} text={x.text} due={x.due} priority={x.priority} />
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Footer ghim đáy */}
                  <div className="mt-auto pt-4">
                    <Separator />
                    <div className="flex items-center justify-between text-xs text-neutral-500 mt-3">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {t.location}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-2">
                      Cập nhật {new Date().toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Phân trang 4x3 */}
        {pageCount > 1 && (
          <section className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-white/80">
              Hiển thị {startIdx + 1}–{endIdx} / {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-9"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trang trước
              </Button>
              <div className="px-3 text-sm text-white/85">Trang {page}/{pageCount}</div>
              <Button
                variant="outline"
                className="h-9"
                disabled={page === pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Trang sau
              </Button>
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="text-center text-white/70 py-10">Không có cây phù hợp</div>
        )}
      </main>
    </div>
  );
}
