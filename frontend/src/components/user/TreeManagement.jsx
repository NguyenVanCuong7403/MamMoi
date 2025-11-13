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
  ZoomIn,
} from "lucide-react";

import { useGardenHeader } from "../tree/useGardenHeader";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";

import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import LivingBackground from "@/components/background/LivingBackground";
import { TREES_ARRAY, getTreeById,TREES_BY_GARDEN } from "@/data/demoTrees";

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

/* ================== PHASE metadata (đồng bộ với TreeDetail) ================== */
const PHASE_META = {
  growth_development: { name: "Sinh trưởng & Phát triển", abbr: "Sinh trưởng", icon: "🌱", color: "emerald" },
  flowering:          { name: "Ra Hoa",                   icon: "🌸", color: "pink"    },
  fruiting:           { name: "Ra quả",                   icon: "🍎", color: "lime"    },
  pre_harvest:        { name: "Trước thu hoạch",          icon: "🔍", color: "amber"   },
  post_harvest:       { name: "Sau thu hoạch",            icon: "🌿", color: "teal"    },
};

const PHASE_ID_ALIASES = {
  growth_development: [
    "growth_development","growth","veg","vegetative","sinh_truong","sinh trưởng","sinh_trưởng","sinh truong",
    "sinh_truong_than_la","sinh trưởng thân lá","phat_trien","phát triển","phát_trien",
    "phat_trien_than_la","phát triển thân lá","development","develop",
    "sinh_truong_va_phat_trien","sinh trưởng và phát triển","sinh trưởng & phát triển",
  ],
  flowering: [
    "flowering","flower","bloom","ra hoa","ra_hoa","nở hoa","full bloom","peak","peak_flower",
  ],
  fruiting: [
    "fruiting","fruit","set","setfruit","set_fruit","đậu quả","dau_qua","nuôi quả","ra quả","ra_qua","fruitset",
  ],
  pre_harvest: [
    "pre_harvest","before_harvest","trước thu hoạch","truoc_thu_hoach","trước thu",
  ],
  post_harvest: [
    "post_harvest","after_harvest","sau thu hoạch","sau_thu_hoach","sau thu",
  ],
};
const PHASE_ORDER = [ "growth_development", "flowering", "fruiting", "pre_harvest", "post_harvest" ];
const phaseRank = (id) => { const i = PHASE_ORDER.indexOf(id); return i < 0 ? -1 : i; };
const canShowFlower = (phaseId) => phaseRank(phaseId) >= phaseRank("flowering");
const canShowFruit  = (phaseId) => phaseRank(phaseId) >= phaseRank("fruiting");

function normalizePhaseId(input) {
  if (!input) return null;
  const s = String(input).trim().toLowerCase().replace(/\s+/g, "_");
  if (PHASE_META[s]) return s;
  for (const key of Object.keys(PHASE_ID_ALIASES)) {
    if (PHASE_ID_ALIASES[key].some(a => a.toLowerCase().replace(/\s+/g,"_") === s)) return key;
  }
  return null;
}
function phasePillClasses(color) {
  switch (color) {
    case "emerald": return "bg-emerald-600 text-white";
    case "pink":    return "bg-pink-600 text-white";
    case "lime":    return "bg-lime-600 text-white";
    case "amber":   return "bg-amber-600 text-white";
    case "teal":    return "bg-teal-600 text-white";
    default:        return "bg-gray-200 text-gray-800";
  }
}
function PhaseBadge({ value, size = "xs", preferAbbr = true, autoFit = true }) {
  const id   = normalizePhaseId(value);
  const meta = id ? PHASE_META[id] : null;

  const base =
    size === "xs" ? "px-2 py-0.5 text-[10px]"
  : size === "sm" ? "px-2.5 py-1 text-[11px]"
                  : "px-3 py-1.5 text-[12px]";

  const iconCls =
    size === "xs" ? "text-[12px]"
  : size === "sm" ? "text-[14px]"
                  : "text-[16px]";

  if (!meta) {
    const raw = String(value || "").trim();
    return (
      <span className={`inline-flex items-center rounded-full font-semibold ${base} bg-neutral-100 text-neutral-700 ring-1 ring-black/5 whitespace-nowrap`}>
        {raw || "—"}
      </span>
    );
  }
  const label = preferAbbr && meta.abbr ? meta.abbr : meta.name;

  let textSize = "";
  if (autoFit) {
    const len = label.length;
    if (len > 18) textSize = "text-[10px]";
    if (len > 24) textSize = "text-[9px]";
  }

  return (
    <span
      title={meta.name}
      className={`inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-black/5 shadow-sm ${base} ${phasePillClasses(meta.color)} whitespace-nowrap overflow-hidden text-ellipsis leading-[1] max-w-[176px] sm:max-w-[200px]`}
    >
      <span className={`${iconCls} leading-none`}>{meta.icon}</span>
      <span className={`leading-none ${textSize}`}>{label}</span>
    </span>
  );
}

/* ================== UI helpers ================== */
const PALETTE = { bg: "#1F302F", leaf: "#D1DFB6", ivory: "#FBFFDF", accent: "#FFFFA5" };

function monthsBetween(aStr, b = new Date()) {
  const a = new Date(aStr + "T00:00:00");
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
}
const isStopped = (t) => t.status === "stopped";

const _startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const _parseViDate = (s) => {
  const m = String(s).trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (!m) return null;
  const dd = parseInt(m[1], 10), mm = parseInt(m[2], 10) - 1, yyyy = parseInt(m[3].length === 2 ? ("20"+m[3]) : m[3], 10);
  const d = new Date(yyyy, mm, dd);
  return isNaN(d.getTime()) ? null : _startOfDay(d);
};
function dueToTime(s) {
  if (!s) return Number.POSITIVE_INFINITY;
  const raw = String(s).trim().toLowerCase();
  if (raw.startsWith("quá hạn")) {
    const m = raw.match(/quá hạn\s*(\d+)/);
    const days = m ? parseInt(m[1], 10) : 1;
    const d = _startOfDay(); d.setDate(d.getDate() - days);
    return d.getTime();
  }
  if (raw === "hôm nay") return _startOfDay().getTime();
  if (raw === "mai" || raw === "ngày mai" || raw === "ngay mai") {
    const d = _startOfDay(); d.setDate(d.getDate() + 1); return d.getTime();
  }
  const dParsed = _parseViDate(raw);
  if (dParsed) return dParsed.getTime();
  return Number.POSITIVE_INFINITY;
}
const compareDue = (a, b) => dueToTime(a?.due) - dueToTime(b?.due);
const hasOverdue = (t) =>
  (t.todos || []).some((x) => {
    const raw = String(x?.due || "").toLowerCase();
    return raw.includes("quá hạn") || dueToTime(x?.due) < _startOfDay().getTime();
  });

function StatusPill({ status }) {
  const map = {
    active:  { label: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    stopped: { label: "Dừng hoạt động",  cls: "bg-rose-50 text-rose-700 border-rose-200" },
  };
  const s = map[status] || map.active;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {s.label}
    </span>
  );
}

/* ====== Condition helpers + UI (Lá/Cành/Hoa/Quả) ====== */
const STATE_ALIASES = {
  leaf:   ["leaf","lá","la","foliage"],
  branch: ["branch","cành","canh","stem","shoot"],
  flower: ["flower","hoa","bloom"],
  fruit:  ["fruit","quả","qua","fruitset","fruiting"],
};
function _pickState(tree, key) {
  if (!tree) return null;

  const candKeys = [key, ...(STATE_ALIASES[key] || [])];

  // 1) ƯU TIÊN đọc từ phenology.* (nguồn chuẩn từ TreeDetail)
  const phen = tree.phenology || {};
  if (key === "leaf" && (phen.leafStatus || phen.leafRootNote)) {
    return phen.leafStatus || phen.leafRootNote;
  }
  if (key === "branch" && phen.branchStatus) return phen.branchStatus;
  if (key === "flower" && phen.flowerStatus) return phen.flowerStatus;
  if (key === "fruit"  && phen.fruitStatus)  return phen.fruitStatus;

  // 2) Đọc từ state.* (data cũ)
  const s = tree.state || {};
  for (const k of candKeys) {
    const v = s[k];
    if (v !== undefined && String(v).trim() !== "") return v;
  }

  // 3) Đọc từ leafState / branchState / flowerState / fruitState (data cũ)
  for (const k of candKeys) {
    const v = tree[`${k}State`];
    if (v !== undefined && String(v).trim() !== "") return v;
  }

  // 4) Fallback cũ: note chung cho Lá
  if (key === "leaf" && tree.stateNote) return tree.stateNote;

  return null;
}

function _stateText(raw) {
  const v = String(raw ?? "").trim();
  if (!v || v === "-" || v.toLowerCase() === "không" || v.toLowerCase() === "không có") return "Bình thường";
  return v;
}
function _stateTone(value) {
  const s = String(value ?? "").toLowerCase();
  if (!s || s === "bình thường") return "ok";
  if (/(quá|nặng|rụng|mất|thối|sâu|bệnh|cháy)/.test(s)) return "bad";
  if (/(vàng|đốm|héo|khô|chậm|thiếu)/.test(s)) return "warn";
  return "ok";
}
function StateChip({ value, tone = "ok", maxChars = 18 }) {
  const full = _stateText(value);
  const truncated = full.length > maxChars ? full.slice(0, maxChars - 1) + "…" : full;
  const toneCls =
    tone === "bad"  ? "bg-rose-50 text-rose-700 border-rose-200"
  : tone === "warn" ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200";

  const chip = (
    <span
      title={full === truncated ? undefined : full}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${toneCls} max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis`}
    >
      {truncated}
    </span>
  );
  const showPopup = full !== truncated;
  return showPopup ? (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>{chip}</HoverCardTrigger>
      <HoverCardContent side="top" align="end" className="max-w-[320px]">
        <div className="text-sm leading-relaxed">{full}</div>
      </HoverCardContent>
    </HoverCard>
  ) : chip;
}

function CondRow({ label, value, kind }) {
  const norm = (s) => String(s || "").trim().toLowerCase();
  const autoKind = (() => {
    const l = norm(label);
    if (["lá","la","leaf"].includes(l)) return "leaf";
    if (["cành","canh","branch","stem","shoot"].includes(l)) return "branch";
    if (["hoa","flower","bloom"].includes(l)) return "flower";
    if (["quả","qua","fruit"].includes(l)) return "fruit";
    return "leaf";
  })();
  const k = kind || autoKind;

  const STYLE = {
    leaf:   { row: "border-emerald-400 hover:bg-emerald-50/40", tipBox: "bg-emerald-50 border-emerald-200 text-emerald-900", tipArrow: "bg-emerald-50 border-emerald-200" },
    branch: { row: "border-amber-600  hover:bg-amber-50/40",   tipBox: "bg-amber-50  border-amber-200  text-amber-900",   tipArrow: "bg-amber-50  border-amber-200" },
    flower: { row: "border-pink-400   hover:bg-pink-50/40",    tipBox: "bg-pink-50   border-pink-200   text-pink-900",    tipArrow: "bg-pink-50   border-pink-200" },
    fruit:  { row: "border-rose-500   hover:bg-rose-50/40",    tipBox: "bg-rose-50   border-rose-200   text-rose-900",    tipArrow: "bg-rose-50   border-rose-200" },
  }[k];

  const txt = _stateText(value);
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className={`flex items-center gap-3 px-3 py-2 rounded-2xl border bg-transparent transition-colors ${STYLE.row}`}>
        <span className="text-sm font-semibold text-neutral-700 shrink-0">{label}:</span>
        <span className="flex-1 min-w-0 text-sm text-neutral-800 truncate" title={txt}>{txt}</span>
      </div>
      {open && (
        <div className="pointer-events-none absolute left-0 right-0 -top-2 -translate-y-full z-10">
          <div className={`mx-auto max-w-[320px] rounded-2xl shadow-xl px-3 py-2 text-sm border ${STYLE.tipBox}`}>
            {txt}
          </div>
          <div className={`mx-auto h-2 w-2 rotate-45 translate-y-[1px] border-r border-b ${STYLE.tipArrow}`} />
        </div>
      )}
    </div>
  );
}

/* ================== TreeManagement (REWRITE) ================== */
export default function TreeManagement() {
  const navigate = useNavigate();
  const { gardenId: paramGardenId } = useParams();
  const location = useLocation();
  const { gardenName: headerGardenName } = useGardenHeader();

<<<<<<< HEAD
  // Garden truyền từ GardenManagement (nếu có)
  const incomingGarden = location.state?.garden || null;

  // Xác định gardenId hiệu lực
  const [garden, setGarden] = useState(() => {
    const firstKey = TREES_BY_GARDEN && typeof TREES_BY_GARDEN === "object"
      ? Object.keys(TREES_BY_GARDEN)[0]
      : undefined;

    const effectiveId = paramGardenId || incomingGarden?.id || firstKey || "G-001";
    const effectiveName =
      incomingGarden?.name ||
      headerGardenName ||
      `Vườn ${effectiveId}`;

    return { id: effectiveId, name: effectiveName };
  });

  // Danh sách cây hiển thị
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================== Lấy dữ liệu từ TREES_BY_GARDEN và chuẩn hóa ==================
  useEffect(() => {
    const firstKey = TREES_BY_GARDEN && typeof TREES_BY_GARDEN === "object"
      ? Object.keys(TREES_BY_GARDEN)[0]
      : undefined;

    const effectiveId = paramGardenId || incomingGarden?.id || garden?.id || firstKey || "G-001";
    const effectiveName =
      incomingGarden?.name ||
      headerGardenName ||
      garden?.name ||
      `Vườn ${effectiveId}`;

    setGarden({ id: effectiveId, name: effectiveName });

    // Lấy list từ map; nếu không có, rải tất cả gardens
    const rawList = (TREES_BY_GARDEN?.[effectiveId])
      ? TREES_BY_GARDEN[effectiveId]
      : Object.values(TREES_BY_GARDEN || {}).flat();

    // Hàm tạo todo demo từ last/next date (nếu có)
    const mkTodosFromDates = (t) => {
      const out = [];
      if (t?.lastCareDate) out.push({ text: "Kiểm tra ẩm độ, sâu bệnh", priority: "low",  due: "Hôm nay" });
      if (t?.nextCareDate) out.push({ text: "Bón phân đợt tới",         priority: "high", due: "20/10/2025" });
      return out;
    };

        const normalize = (raw) => {
      const id =
        raw?.id ||
        raw?.treeId ||
        `T-${Math.random().toString(36).slice(2, 7)}`;

      const img =
        raw?.img ||
        raw?.imageUrl ||
        raw?.image ||
        `https://picsum.photos/seed/${String(id).replace(/\W/g, "")}/1200/800`;

      const status = raw?.status === "stopped" ? "stopped" : "active";
      const phaseRaw =
        raw?.phase || raw?.lifecyclePhase || raw?.stage || "Sinh trưởng & Phát triển";

      // 👉 Gộp loại cây + giống: "Xoài" + "Cát chu" = "Xoài Cát chu"
      let baseName = (raw?.commonName || raw?.name || "").trim();
      let varietyName = (raw?.variety || "").trim();

      // Nếu tên đã chứa giống rồi (VD: "Xoài Cát chu") thì không gộp lại lần nữa
      if (
        baseName &&
        varietyName &&
        baseName.toLowerCase().includes(varietyName.toLowerCase())
      ) {
        varietyName = "";
      }

      const displayName = [baseName, varietyName].filter(Boolean).join(" ");

      return {
        // ⬇️ GIỮ LẠI FIELD GỐC (để TreeDetail không mất thông tin)
        ...raw,

        // ⬇️ Field chuẩn hoá đè lên
        id,
        img,
        status,

        // Tên hiển thị: "Xoài Cát chu"
        commonName: displayName || raw?.variety || "Cây ăn quả",

        // Giống dùng cho filter
        variety: varietyName || raw?.variety || "—",

        // Thông tin vườn (quan trọng cho TreeDetail)
        gardenId: raw?.gardenId || effectiveId,
        gardenName: raw?.gardenName || effectiveName,
        location: effectiveName,

        plantedAt: raw?.plantedAt || raw?.planted_date || "2024-01-01",
        phase: phaseRaw,
        caretaker: raw?.caretaker || "Quân",
        stateNote: raw?.stateNote || "",
        state: raw?.state || {},
        todos: Array.isArray(raw?.todos) ? raw.todos : mkTodosFromDates(raw),
      };
    };



    setLoading(true);
    // giả lập fetch
    const timer = setTimeout(() => {
  // 🚩 Quan trọng: đồng bộ với bộ demo chuẩn (TREES / getTreeById)
  const canonicalList = (rawList || []).map((raw) => {
    // Lấy id cây
    const id = raw?.id || raw?.treeId;
    const base = id ? getTreeById(id) : null;

    if (!base) {
      // Không tìm thấy trong data/demoTrees -> xài dữ liệu thô
      return normalize(raw);
    }

    // Gộp thông tin:
    // - raw: dữ liệu mapping theo vườn (gardenId, lastCareDate, ...)
    // - base: dữ liệu chuẩn từ TreeDetail (phenology, state, gallery, planned...)
    const merged = {
      ...raw,   // thông tin riêng của màn danh sách / vườn
      ...base,  // phenology + state chuẩn, đã được TreeDetail cập nhật
      id: base.id || id,
    };

    return normalize(merged);
  });

  setTrees(canonicalList);
  setLoading(false);
}, 150);

    return () => clearTimeout(timer);
  }, [paramGardenId, incomingGarden, headerGardenName]);

  /* ================== Zoom ================== */
  const [zoom, setZoom] = useState(1.25);
  const [hasZoomProp, setHasZoomProp] = useState(false);
  useEffect(() => {
=======
  // NEW: UI Zoom state (default 175%)
  const [zoom, setZoom] = useState(1.45);
  const [hasZoomProp, setHasZoomProp] = useState(false);
  useEffect(() => {
    // detect CSS zoom support (Chromium/Edge ✅)
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
    try {
      if (typeof document !== "undefined" && document.body && document.body.style) {
        setHasZoomProp(Object.prototype.hasOwnProperty.call(document.body.style, "zoom"));
      }
    } catch (_) {}
  }, []);
<<<<<<< HEAD
  const zoomWrapperStyle = hasZoomProp
    ? { zoom, margin: "0 auto" }
    : { transform: `scale(${zoom})`, transformOrigin: "top center", width: `${100 / zoom}%`, margin: "0 auto" };

  /* ================== Search + Filters ================== */
=======

  const zoomWrapperStyle = hasZoomProp
    ? { zoom, margin: "0 auto" }
    : {
        transform: `scale(${zoom})`,
        transformOrigin: "top center",
        width: `${100 / zoom}%`,
        margin: "0 auto",
      };

  // Search + filters
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | active | stopped
  const [gardens, setGardens] = useState(new Set());
  const [varieties, setVarieties] = useState(new Set());
  const [caretakers, setCaretakers] = useState(new Set());
  const [phases, setPhases] = useState(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateOrder, setDateOrder] = useState("desc"); // mới nhất trước
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);

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
  const phaseOpts = useMemo(() => {
    const ids = Array.from(
      new Set(trees.map((t) => normalizePhaseId(t.phase || t.lifecyclePhase || t.stage)).filter(Boolean))
    );
    return ids.map((id) => ({ id, ...PHASE_META[id] }));
  }, [trees]);

  // Auto-chọn theo headerGardenName nếu khớp
  useEffect(() => {
    if (!garden?.name) return;
    const match = gardenOpts.find(
      (g) =>
        g?.toLowerCase().includes(garden.name.toLowerCase()) ||
        garden.name.toLowerCase().includes(g?.toLowerCase())
    );
    if (match) setGardens(new Set([match]));
  }, [garden?.name, gardenOpts]);

  const stats = useMemo(() => {
    const total = trees.length;
    const active = trees.filter((t) => t.status === "active").length;
    const stopped = trees.filter((t) => t.status === "stopped").length;
    const today = _startOfDay().getTime();
    const overdue = trees.reduce((n, t) => {
      if (t.status !== "active") return n;
      return n + (t.todos || []).filter((x) => dueToTime(x.due) < today).length;
    }, 0);
    return { total, active, stopped, overdue };
  }, [trees]);

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

      const pId = normalizePhaseId(t.phase || t.lifecyclePhase || t.stage);
      if (phases.size > 0 && (!pId || !phases.has(pId))) return false;

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
  }, [trees, q, status, gardens, varieties, caretakers, phases, dateFrom, dateTo, dateOrder, onlyOverdue]);

  useEffect(() => {
    setPage(1);
  }, [q, status, gardens, varieties, caretakers, phases, dateFrom, dateTo, onlyOverdue, dateOrder]);

<<<<<<< HEAD
=======
  // Trang hiện tại
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
  const PAGE_COUNT = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(filtered.length, page * PAGE_SIZE);
  const pageItems = useMemo(() => filtered.slice(startIdx, endIdx), [filtered, startIdx, endIdx]);

  /* ================== Render ================== */
  return (
<<<<<<< HEAD
    <div className="relative min-h-screen overflow-hidden pt-[64px]">
      <LivingBackground
        theme="aurora"
        baseColor={PALETTE.bg}
        accents={[PALETTE.leaf, "#38bdf8", "#facc15"]}
        density={36}
        grain={0.08}
        blur={12}
        speed={1.15}
      />

=======
    <div className="relative min-h-screen pt-[64px]" style={{ background: PALETTE.bg }}>
      {/* keyframes cho glow cảnh báo */}
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
      <style>{`
        @keyframes mmOverduePulse {
          0%   { box-shadow: 0 0 0 0 rgba(244,63,94,.00); }
          50%  { box-shadow: 0 0 22px 10px rgba(244,63,94,.22); }
          100% { box-shadow: 0 0 0 0 rgba(244,63,94,.00); }
        }
      `}</style>

<<<<<<< HEAD
      {/* Zoom control */}
=======
      {/* ===== Zoom controls (nằm ngoài vùng scale để luôn dễ bấm) ===== */}
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
      <div className="fixed right-4 bottom-4 z-[60]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-11 rounded-full shadow-lg" variant="secondary">
              <ZoomIn className="w-5 h-5 mr-2" /> Phóng to {Math.round(zoom * 100)}%
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border border-neutral-200 bg-white shadow-2xl">
            <DropdownMenuLabel>Tỷ lệ</DropdownMenuLabel>
            {[1, 1.25, 1.5, 1.75, 2].map((z) => (
<<<<<<< HEAD
              <DropdownMenuItem key={z} onClick={() => setZoom(z)} className="cursor-pointer">
=======
              <DropdownMenuItem
                key={z}
                onClick={() => setZoom(z)}
                className="cursor-pointer"
              >
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
                {Math.round(z * 100)}% {zoom === z ? "✓" : ""}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setZoom(1)}>Đặt về 100%</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

<<<<<<< HEAD
      <div style={zoomWrapperStyle}>
        <main className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 space-y-6">
          {/* Header */}
          <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
=======
      {/* ===== Toàn bộ nội dung được scale ===== */}
      <div style={zoomWrapperStyle}>
        <main className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 space-y-6">
          <section
            aria-label="Page header"
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6"
          >
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
            <div className="max-w-[760px]">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium"
                style={{ background: PALETTE.accent, color: PALETTE.bg }}
<<<<<<< HEAD
              >
                Danh sách cây
              </span>

              <h1 className="mt-2 text-white text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                {`Vườn: ${garden?.name || "—"}`}
              </h1>

              <p className="text-white/85 mt-1 text-sm md:text-base">
                Theo dõi tuổi cây, giai đoạn sinh trưởng, công việc và tình trạng chăm sóc.
              </p>

              {/* breadcrumb nhỏ */}
              <div className="mt-2 text-xs text-white/75">
                <Link className="underline" to="/garden">Danh sách vườn</Link>
                <span> / </span>
                <span className="font-medium">{garden?.name || "—"}</span>
              </div>
            </div>

            <div className="w-full md:w-auto flex items-stretch md:items-center gap-3 md:gap-4">
              <Button
                className="h-12 md:h-12 px-5 md:px-6 rounded-2xl text-base font-semibold shadow-[0_10px_28px_rgba(255,255,165,0.20)] ring-1 ring-black/5 transition-all hover:shadow-[0_14px_44px_rgba(255,255,165,0.26)] hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#FFFFA5 0%, #D1DFB6 100%)", color: "#1F302F" }}
                onClick={() => navigate("/new", { state: { garden } })}
              >
=======
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
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
                <span className="inline-flex items-center gap-3">
                  <span className="grid place-items-center w-8 h-8 rounded-xl bg-white/70 backdrop-blur">
                    <Plus className="w-5 h-5" />
                  </span>
                  Thêm cây ăn quả
                </span>
              </Button>

<<<<<<< HEAD
=======
              {/* Thẻ thời tiết giữ nguyên nội dung, đổi sang dạng card độc lập */}
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
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

<<<<<<< HEAD
          {/* Search + filter */}
=======
          {/* search + filter */}
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
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
<<<<<<< HEAD
                    className="z-[1000] min-w-[320px] rounded-xl border border-neutral-200 bg-white shadow-2xl overflow-visible"
=======
                    className="z-[1000] min-w=[320px] rounded-xl border border-neutral-200 bg-white shadow-2xl overflow-visible"
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
                  >
                    <DropdownMenuLabel className="px-3 pt-2 pb-1 text-[11px] text-neutral-500">
                      Trạng thái
                    </DropdownMenuLabel>

                    {[
<<<<<<< HEAD
                      { key: "all",     label: "Tất cả",         count: stats.total },
                      { key: "active",  label: "Đang hoạt động",  count: stats.active },
                      { key: "stopped", label: "Dừng hoạt động",  count: stats.stopped },
=======
                      { key: "all", label: "Tất cả", count: stats.total },
                      { key: "active", label: "Đang hoạt động", count: stats.active },
                      { key: "stopped", label: "Dừng hoạt động", count: stats.stopped },
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
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
<<<<<<< HEAD
                        {phaseOpts.map((opt) => (
                          <DropdownMenuCheckboxItem
                            key={opt.id}
                            checked={phases.has(opt.id)}
                            onCheckedChange={() => toggleSet(phases, setPhases, opt.id)}
                            className="cursor-pointer"
                          >
                            <span className="inline-flex items-center gap-2">
                              <span className="text-sm leading-none">{opt.icon}</span>
                              {opt.name}
                            </span>
=======
                        {phaseOpts.map((p) => (
                          <DropdownMenuCheckboxItem
                            key={p}
                            checked={phases.has(p)}
                            onCheckedChange={() => toggleSet(phases, setPhases, p)}
                            className="cursor-pointer"
                          >
                            {p}
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
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

<<<<<<< HEAD
                    {/* Chỉ hiển thị cây có việc quá hạn */}
=======
                    {/* Chỉ hiển thị cây có việc quá hạn (chỉ áp cho active) */}
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
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

<<<<<<< HEAD
          {/* Mini stats */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: "Tổng cây",         value: stats.total },
              { label: "Đang hoạt động",   value: stats.active },
              { label: "Dừng hoạt động",   value: stats.stopped },
              { label: "Việc quá hạn",     value: stats.overdue, icon: <AlertTriangle className="w-4 h-4" /> },
=======
          {/* mini stats (4 ô) — glow đỏ cho “Việc quá hạn” khi >0 */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: "Tổng cây", value: stats.total },
              { label: "Đang hoạt động", value: stats.active },
              { label: "Dừng hoạt động", value: stats.stopped },
              { label: "Việc quá hạn", value: stats.overdue, icon: <AlertTriangle className="w-4 h-4" /> },
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
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

<<<<<<< HEAD
          {/* Cards grid */}
          {loading ? (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-7">
              {[...Array(8)].map((_,i) => (
                <div key={i} className="h-[360px] rounded-3xl border bg-white/60 animate-pulse" />
              ))}
            </section>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-7 items-stretch">
              {pageItems.map((t) => {
  const stopped = isStopped(t);

  // Dùng chung 1 nguồn dữ liệu Tình trạng
  const {
    leafTxt,
    branchTxt,
    flowerTxt,
    fruitTxt,
    showFlower,
    showFruit,
  } = getTreeConditions(t);


                function getTreeConditions(tree) {
  // lấy raw value giống bên TreeDetail
  const leafRaw   = _pickState(tree, "leaf");
  const branchRaw = _pickState(tree, "branch");
  const flowerRaw = _pickState(tree, "flower");
  const fruitRaw  = _pickState(tree, "fruit");

  const leafTxt   = _stateText(leafRaw);
  const branchTxt = _stateText(branchRaw);
  const flowerTxt = _stateText(flowerRaw);
  const fruitTxt  = _stateText(fruitRaw);

  const has = (v) => !!String(v || "").trim();

  return {
    leafTxt,
    branchTxt,
    flowerTxt,
    fruitTxt,
    // CHỈ hiển thị nếu thực sự có dữ liệu (giống cách TreeDetail hay làm)
    showFlower: has(flowerRaw),
    showFruit:  has(fruitRaw),
  };
}


                return (
                  <Card
                    key={t.id}
                    className={
                      "group rounded-3xl overflow-hidden shadow-sm transition-all duration-200 h-full flex flex-col " +
                      (stopped ? "opacity-90" : "hover:-translate-y-0.5 hover:shadow-md")
                    }
                    style={{ background: "#FFFFFFF2", borderColor: "rgba(255,255,165,0.25)" }}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
  navigate(`/tree_detail/${t.id}`, {
    state: {
      tree: t,
      garden: {
        id: t.gardenId || garden?.id,
        name: t.gardenName || garden?.name,
      },
      from: "tree_list",
    },
  });
}}
                    onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.click(); }}
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
                            <PhaseBadge value={t.phase || t.lifecyclePhase || t.stage} size="xs" preferAbbr />
                          </div>
                        </div>
                        <div>
                          <div className="text-neutral-500">Tuổi cây</div>
                          <div className="mt-1 flex items-center gap-2 text-neutral-800">
                            <Calendar className="h-4 w-4" /> {monthsBetween(t.plantedAt)} tháng
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-neutral-500 text-sm">Tình trạng</div>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <CondRow label="Lá"   value={leafTxt} />
                          <CondRow label="Cành" value={branchTxt} />
                          {showFlower && <CondRow label="Hoa"  value={flowerTxt} />}
                          {showFruit  && <CondRow label="Quả"  value={fruitTxt} />}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div className="text-neutral-500 text-sm">Việc cần làm</div>
                          {!stopped && (() => {
                            const today = _startOfDay().getTime();
                            const n = (t.todos || []).filter((x) => dueToTime(x.due) < today).length;
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
                          (() => {
                            const sorted = [...(t.todos || [])].sort(compareDue);
                            const top3 = sorted.slice(0, 3);
                            const remain = Math.max(0, (t.todos || []).length - top3.length);
                            return (
                              <>
                                <ul className="mt-2 space-y-1">
                                  {top3.map((x, i) => <TodoRow key={i} text={x.text} due={x.due} />)}
                                </ul>
                                {remain > 0 && (
                                  <div className="mt-2 text-xs text-neutral-500">
                                    +{remain} việc nữa — bấm thẻ để xem chi tiết
                                  </div>
                                )}
                              </>
                            );
                          })()
                        )}
                      </div>

                      <div className="mt-auto pt-4">
                        <Separator />
                        <div className="text-xs text-neutral-500 mt-3">
                          Cập nhật {new Date().toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          )}

          {/* Pagination */}
          {!loading && PAGE_COUNT > 1 && (
=======
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
          {PAGE_COUNT > 1 && (
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
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
                <div className="px-3 text-sm text-white/85">Trang {page}/{PAGE_COUNT}</div>
                <Button
                  variant="outline"
                  className="h-9"
                  disabled={page === PAGE_COUNT}
                  onClick={() => setPage((p) => Math.min(PAGE_COUNT, p + 1))}
                >
                  Trang sau
                </Button>
              </div>
            </section>
          )}

<<<<<<< HEAD
          {!loading && filtered.length === 0 && (
=======
          {filtered.length === 0 && (
>>>>>>> 32cbfc6c5698917b8ab0caef6b3d10821d58ed2d
            <div className="text-center text-white/70 py-10">Không có cây phù hợp</div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ================== Small components ================== */
function TodoRow({ text, due }) {
  const dueColor = String(due).toLowerCase().includes("quá hạn")
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : String(due).toLowerCase().includes("hôm nay")
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-neutral-50 text-neutral-600 border-neutral-200";
  return (
    <li className="flex items-center justify-between gap-2 py-1">
      <span className="text-sm text-neutral-800">{text}</span>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${dueColor}`}>
        {due}
      </span>
    </li>
  );
}
