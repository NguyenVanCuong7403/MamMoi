// src/pages/TreeManagement.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  CloudSun,
  CloudRain,
  SunMedium,
  ClipboardList,
  Loader2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  StickyNote,
  X,
} from "lucide-react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";

import { LivingBackground } from "@/components/background";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { useGardenHeader } from "../tree/useGardenHeader";
import TreeRepository from "@/API/repositories/TreeRepository";
import WeatherRepository from "@/API/repositories/WeatherRepository";
import CareScheduleRepository from "@/API/repositories/CareScheduleRepository";
import useViewportScale from "@/hooks/useViewportScale";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ================== PHASE metadata (đồng bộ với TreeDetail) ================== */
const PHASE_META = {
  growth_development: {
    name: "Sinh trưởng & Phát triển",
    abbr: "Sinh trưởng",
    icon: "🌱",
    color: "emerald",
  },
  flowering: { name: "Ra hoa", icon: "🌸", color: "pink" },
  fruiting: { name: "Ra quả", icon: "🍎", color: "lime" },
  pre_harvest: { name: "Trước thu hoạch", icon: "🔍", color: "amber" },
  post_harvest: { name: "Sau thu hoạch", icon: "🌿", color: "teal" },
};

const PHASE_ID_ALIASES = {
  growth_development: [
    "growth_development",
    "growth",
    "veg",
    "vegetative",
    "sinh_truong",
    "sinh trưởng",
    "sinh_trưởng",
    "sinh truong",
    "sinh_truong_than_la",
    "sinh trưởng thân lá",
    "phat_trien",
    "phát triển",
    "phát_trien",
    "phat_trien_than_la",
    "phát triển thân lá",
    "development",
    "develop",
    "sinh_truong_va_phat_trien",
    "sinh trưởng và phát triển",
    "sinh trưởng & phát triển",
  ],
  flowering: [
    "flowering",
    "flower",
    "bloom",
    "ra hoa",
    "ra_hoa",
    "nở hoa",
    "full bloom",
    "peak",
    "peak_flower",
  ],
  fruiting: [
    "fruiting",
    "fruit",
    "set",
    "setfruit",
    "set_fruit",
    "đậu quả",
    "dau_qua",
    "nuôi quả",
    "ra quả",
    "ra_qua",
    "fruitset",
  ],
  pre_harvest: [
    "pre_harvest",
    "before_harvest",
    "trước thu hoạch",
    "truoc_thu_hoach",
    "trước thu",
  ],
  post_harvest: [
    "post_harvest",
    "after_harvest",
    "sau thu hoạch",
    "sau_thu_hoach",
    "sau thu",
  ],
};
const PHASE_ORDER = [
  "growth_development",
  "flowering",
  "fruiting",
  "pre_harvest",
  "post_harvest",
];

const phaseRank = (id) => {
  const i = PHASE_ORDER.indexOf(id);
  return i < 0 ? -1 : i;
};
const canShowFlower = (phaseId) => phaseRank(phaseId) >= phaseRank("flowering");
const canShowFruit = (phaseId) => phaseRank(phaseId) >= phaseRank("fruiting");

function normalizePhaseId(input) {
  if (!input) return null;
  const s = String(input).trim().toLowerCase().replace(/\s+/g, "_");
  if (PHASE_META[s]) return s;
  for (const key of Object.keys(PHASE_ID_ALIASES)) {
    if (
      PHASE_ID_ALIASES[key].some(
        (a) => a.toLowerCase().replace(/\s+/g, "_") === s
      )
    ) {
      return key;
    }
  }
  return null;
}
function phasePillClasses(color) {
  switch (color) {
    case "emerald":
      return "bg-emerald-600 text-white";
    case "pink":
      return "bg-pink-600 text-white";
    case "lime":
      return "bg-lime-600 text-white";
    case "amber":
      return "bg-amber-600 text-white";
    case "teal":
      return "bg-teal-600 text-white";
    default:
      return "bg-gray-200 text-gray-800";
  }
}
function PhaseBadge({ value, size = "xs", preferAbbr = true, autoFit = true }) {
  const id = normalizePhaseId(value);
  const meta = id ? PHASE_META[id] : null;

  const base =
    size === "xs"
      ? "px-2 py-0.5 text-[10px]"
      : size === "sm"
      ? "px-2.5 py-1 text-[11px]"
      : "px-3 py-1.5 text-[12px]";

  const iconCls =
    size === "xs"
      ? "text-[12px]"
      : size === "sm"
      ? "text-[14px]"
      : "text-[16px]";

  if (!meta) {
    const raw = String(value || "").trim();
    return (
      <span
        className={`inline-flex items-center rounded-full font-semibold ${base} bg-neutral-100 text-neutral-700 ring-1 ring-black/5 whitespace-nowrap`}
      >
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
      className={`inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-black/5 shadow-sm ${base} ${phasePillClasses(
        meta.color
      )} whitespace-nowrap overflow-hidden text-ellipsis leading-[1] max-w-[176px] sm:max-w-[200px]`}
    >
      <span className={`${iconCls} leading-none`}>{meta.icon}</span>
      <span className={`leading-none ${textSize}`}>{label}</span>
    </span>
  );
}

/* ================== UI + data helpers ================== */
const PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const TASK_PAGE_SIZE = 12;
const TASK_STATUS_FILTERS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Chờ thực hiện" },
  { value: "InProgress", label: "Đang thực hiện" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Postponed", label: "Hoãn lại" },
  { value: "Cancelled", label: "Đã hủy" },
];
const TASK_TYPE_FILTERS = [
  { value: "all", label: "Tất cả quy trình" },
  { value: "Watering", label: "Tưới tiêu" },
  { value: "Fertilizing", label: "Phân bón" },
  { value: "Pest Control", label: "Sâu bệnh" },
  { value: "Other", label: "Khác" },
];
const TASK_STATUS_META = {
  pending: {
    label: "Chờ thực hiện",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  inprogress: {
    label: "Đang thực hiện",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  completed: {
    label: "Hoàn thành",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  scheduled: {
    label: "Lên lịch",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  postponed: {
    label: "Hoãn lại",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  cancelled: {
    label: "Đã hủy",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
  default: {
    label: "Không rõ",
    className: "border-slate-100 bg-slate-100 text-slate-700",
  },
};
const TASK_PRIORITY_META = {
  low: {
    label: "Thấp",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  medium: {
    label: "Medium",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  high: {
    label: "High",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  normal: {
    label: "Normal",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  critical: {
    label: "Khẩn cấp",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  default: {
    label: "Không rõ",
    className: "border-neutral-200 bg-neutral-50 text-neutral-600",
  },
};
const CORE_TASK_TYPE_KEYS = new Set(["watering", "fertilizing", "pestcontrol"]);
const isCoreTaskType = (taskType) => {
  const key = normalizeKey(taskType);
  return CORE_TASK_TYPE_KEYS.has(key);
};
const TASK_TYPE_LABELS = {
  watering: "Tưới nước",
  fertilizing: "Bón phân",
  pruning: "Tỉa cành",
  pestcontrol: "Phòng trừ sâu bệnh",
  "pest control": "Phòng trừ sâu bệnh",
  diseasetreatment: "Điều trị bệnh",
  "disease treatment": "Điều trị bệnh",
  harvesting: "Thu hoạch",
  mulching: "Phủ gốc",
  inspection: "Khảo sát",
  other: "Khác",
};

const LS_GARDENS = "mm_user_gardens_v3";

const pickArray = (...candidates) => {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

const normalizeTaskRecord = (task) => {
  if (!task) return null;
  const scheduleId =
    task.scheduleId ??
    task.ScheduleId ??
    task.id ??
    task.Id ??
    task.scheduleID ??
    task.ScheduleID;
  return {
    scheduleId,
    taskName: task.taskName ?? task.TaskName ?? "Công việc chăm sóc",
    description: task.description ?? task.Description ?? "",
    taskType: task.taskType ?? task.TaskType ?? "Other",
    treeId: task.treeId ?? task.TreeId ?? null,
    treeCode: task.treeCode ?? task.TreeCode ?? "",
    treeName: task.treeName ?? task.TreeName ?? "",
    gardenId: task.gardenId ?? task.GardenId ?? null,
    gardenName: task.gardenName ?? task.GardenName ?? "",
    scheduledDate: task.scheduledDate ?? task.ScheduledDate ?? null,
    scheduledTimeOfDay:
      task.scheduledTimeOfDay ?? task.ScheduledTimeOfDay ?? null,
    priority: task.priority ?? task.Priority ?? "",
    status: task.status ?? task.Status ?? "Pending",
    createdAt: task.createdAt ?? task.CreatedAt ?? null,
    completedNote: task.completedNote ?? task.CompletedNote ?? "",
    raw: task,
  };
};

function parseTaskSearchResult(response) {
  const root = response?.data ?? response;
  const payload = root?.data ?? root;
  const items = pickArray(
    payload?.items,
    payload?.Items,
    payload?.results,
    payload?.Results,
    payload?.data,
    payload?.Data,
    Array.isArray(payload) ? payload : undefined,
    Array.isArray(root) ? root : undefined
  );
  const normalized = items.map(normalizeTaskRecord).filter(Boolean);
  const total =
    payload?.total ??
    payload?.Total ??
    payload?.totalCount ??
    payload?.TotalCount ??
    normalized.length;
  return { items: normalized, total };
}

const formatTaskDate = (input) => {
  if (!input) return "Chưa đặt lịch";
  try {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return String(input);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return String(input);
  }
};

const isTaskOverdue = (scheduledDate, status) => {
  if (!scheduledDate) return false;
  const s = normalizeKey(status);
  if (s === "completed" || s === "cancelled") return false;
  try {
    const due = new Date(scheduledDate);
    if (Number.isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
  } catch {
    return false;
  }
};

const taskTypeLabel = (type) => {
  if (!type) return "Khác";
  const key = normalizeKey(type);
  return TASK_TYPE_LABELS[key] || TASK_TYPE_LABELS[type] || "Khác";
};

function loadGardensFromLS() {
  try {
    const raw = localStorage.getItem(LS_GARDENS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatGardenLocation(g) {
  if (!g) return "";
  return [g.address, g.ward, g.province].filter(Boolean).join(", ");
}

function monthsBetween(aStr, b = new Date()) {
  const a = new Date(aStr + "T00:00:00");
  let m =
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
}

const isStopped = (t) => t.status === "stopped";

const _startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const _parseViDate = (s) => {
  const m = String(s)
    .trim()
    .match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (!m) return null;
  const dd = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10) - 1;
  const yyyy = parseInt(m[3].length === 2 ? "20" + m[3] : m[3], 10);
  const d = new Date(yyyy, mm, dd);
  return isNaN(d.getTime()) ? null : _startOfDay(d);
};
function dueToTime(s) {
  if (!s) return Number.POSITIVE_INFINITY;
  const raw = String(s).trim().toLowerCase();

  if (raw.startsWith("quá hạn")) {
    const m = raw.match(/quá hạn\s*(\d+)/);
    const days = m ? parseInt(m[1], 10) : 1;
    const d = _startOfDay();
    d.setDate(d.getDate() - days);
    return d.getTime();
  }
  if (raw === "hôm nay") return _startOfDay().getTime();
  if (raw === "mai" || raw === "ngày mai" || raw === "ngay mai") {
    const d = _startOfDay();
    d.setDate(d.getDate() + 1);
    return d.getTime();
  }
  const dParsed = _parseViDate(raw);
  if (dParsed) return dParsed.getTime();
  return Number.POSITIVE_INFINITY;
}
const compareDue = (a, b) => dueToTime(a?.due) - dueToTime(b?.due);
const hasOverdue = (t) =>
  (t.todos || []).some((x) => {
    const raw = String(x?.due || "").toLowerCase();
    return (
      raw.includes("quá hạn") || dueToTime(x?.due) < _startOfDay().getTime()
    );
  });

function StatusPill({ status }) {
  const map = {
    active: {
      label: "Đang hoạt động",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    stopped: {
      label: "Dừng hoạt động",
      cls: "bg-rose-50 text-rose-700 border-rose-200",
    },
  };
  const s = map[status] || map.active;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${s.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {s.label}
    </span>
  );
}

/* ====== Condition helpers (Lá / Cành / Hoa / Quả) ====== */
const STATE_ALIASES = {
  leaf: ["leaf", "lá", "la", "foliage"],
  branch: ["branch", "cành", "canh", "stem", "shoot"],
  flower: ["flower", "hoa", "bloom"],
  fruit: ["fruit", "quả", "qua", "fruitset", "fruiting"],
};

function _pickState(tree, key) {
  if (!tree) return null;
  const candKeys = [key, ...(STATE_ALIASES[key] || [])];

  // 1) Ưu tiên phenology.*
  const phen = tree.phenology || {};
  if (key === "leaf" && (phen.leafStatus || phen.leafRootNote)) {
    return phen.leafStatus || phen.leafRootNote;
  }
  if (key === "branch" && phen.branchStatus) return phen.branchStatus;
  if (key === "flower" && phen.flowerStatus) return phen.flowerStatus;
  if (key === "fruit" && phen.fruitStatus) return phen.fruitStatus;

  // 2) state.*
  const s = tree.state || {};
  for (const k of candKeys) {
    const v = s[k];
    if (v !== undefined && String(v).trim() !== "") return v;
  }

  // 3) leafState / branchState / ...
  for (const k of candKeys) {
    const v = tree[`${k}State`];
    if (v !== undefined && String(v).trim() !== "") return v;
  }

  // 4) stateNote chung cho lá
  if (key === "leaf" && tree.stateNote) return tree.stateNote;

  return null;
}
function _stateText(raw) {
  const v = String(raw ?? "").trim();
  if (
    !v ||
    v === "-" ||
    v.toLowerCase() === "không" ||
    v.toLowerCase() === "không có"
  ) {
    return "Bình thường";
  }
  return v;
}
function getTreeConditions(tree) {
  //console.log(tree);
  const leafRaw = _pickState(tree, "leaf");
  const branchRaw = _pickState(tree, "branch");
  const flowerRaw = _pickState(tree, "flower");
  const fruitRaw = _pickState(tree, "fruit");

  const leafTxt = _stateText(leafRaw);
  const branchTxt = _stateText(branchRaw);
  const flowerTxt = _stateText(flowerRaw);
  const fruitTxt = _stateText(fruitRaw);

  const has = (v) => !!String(v || "").trim();

  return {
    leafTxt,
    branchTxt,
    flowerTxt,
    fruitTxt,
    showFlower: has(flowerRaw),
    showFruit: has(fruitRaw),
  };
}

function CondRow({ label, value, kind }) {
  const [open, setOpen] = useState(false);
  const norm = (s) =>
    String(s || "")
      .trim()
      .toLowerCase();
  const autoKind = (() => {
    const l = norm(label);
    if (["lá", "la", "leaf"].includes(l)) return "leaf";
    if (["cành", "canh", "branch", "stem", "shoot"].includes(l))
      return "branch";
    if (["hoa", "flower", "bloom"].includes(l)) return "flower";
    if (["quả", "qua", "fruit"].includes(l)) return "fruit";
    return "leaf";
  })();
  const k = kind || autoKind;

  const STYLE = {
    leaf: {
      row: "border-emerald-400 hover:bg-emerald-50/40",
      tipBox: "bg-emerald-50 border-emerald-200 text-emerald-900",
      tipArrow: "bg-emerald-50 border-emerald-200",
    },
    branch: {
      row: "border-amber-600 hover:bg-amber-50/40",
      tipBox: "bg-amber-50 border-amber-200 text-amber-900",
      tipArrow: "bg-amber-50 border-amber-200",
    },
    flower: {
      row: "border-pink-400 hover:bg-pink-50/40",
      tipBox: "bg-pink-50 border-pink-200 text-pink-900",
      tipArrow: "bg-pink-50 border-pink-200",
    },
    fruit: {
      row: "border-rose-500 hover:bg-rose-50/40",
      tipBox: "bg-rose-50 border-rose-200 text-rose-900",
      tipArrow: "bg-rose-50 border-rose-200",
    },
  }[k];

  const txt = _stateText(value);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-2xl border bg-transparent transition-colors ${STYLE.row}`}
      >
        <span className="text-sm font-semibold text-neutral-700 shrink-0">
          {label}:
        </span>
        <span
          className="flex-1 min-w-0 text-sm text-neutral-800 truncate"
          title={txt}
        >
          {txt}
        </span>
      </div>
      {open && (
        <div className="pointer-events-none absolute left-0 right-0 -top-2 -translate-y-full z-10">
          <div
            className={`mx-auto max-w-[320px] rounded-2xl shadow-xl px-3 py-2 text-sm border ${STYLE.tipBox}`}
          >
            {txt}
          </div>
          <div
            className={`mx-auto h-2 w-2 rotate-45 translate-y-[1px] border-r border-b ${STYLE.tipArrow}`}
          />
        </div>
      )}
    </div>
  );
}

/* ================== Tree / Garden matching ================== */

// Chuẩn hoá chuỗi (bỏ hoa/thường, bỏ dấu, trim)
function normalizeKey(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Kiểm tra 1 cây có thuộc vườn hiện tại không.
 * - Ưu tiên so sánh gardenId
 * - Nếu không khớp, fallback so sánh tên vườn / locationLabel / plot
 */
function isTreeInGarden(tree, garden) {
  if (!garden) return true; // chưa có vườn → tạm không lọc

  const gardenId = garden.id && String(garden.id);
  const treeGardenId = tree.gardenId && String(tree.gardenId);

  // 1) Trùng id là chắc chắn
  if (gardenId && treeGardenId && treeGardenId === gardenId) {
    return true;
  }

  // 2) Fallback theo tên / location (phù hợp data demo)
  const gName = normalizeKey(garden.name || "");
  if (!gName) return true;

  const candidates = [
    tree.gardenName,
    tree.locationLabel,
    tree.location && tree.location.label,
    tree.plot,
  ];
  const firstNonEmpty = candidates.find(
    (x) => x && String(x).trim().length > 0
  );
  const tKey = normalizeKey(firstNonEmpty || "");

  if (!tKey) return false;
  return tKey.includes(gName) || gName.includes(tKey);
}

/* Chuẩn hoá 1 cây về dạng card dùng trong TreeManagement */
function normalizeTree(raw, effectiveGardenId, effectiveGardenName) {
  const baseId = raw?.id ?? raw?.treeId ?? raw?.treeID;
  const id = String(baseId || "tree-" + Math.random().toString(36).slice(2, 8));

  const img =
    raw?.img ||
    raw?.imageUrl ||
    raw?.image ||
    (Array.isArray(raw?.gallery) ? raw.gallery[0] : null) ||
    `https://picsum.photos/seed/${encodeURIComponent(
      id.replace(/\W/g, "")
    )}/1200/800`;

  const status =
    raw?.status === "stopped" || raw?.isActive === false ? "stopped" : "active";

  // ====== GIAI ĐOẠN (phase) – dùng stageName như mình vừa làm trước đó ======
  const stageName = (raw?.stageName || raw?.stage || "").trim();
  let phaseFromStage = null;
  if (stageName) {
    const s = stageName.toLowerCase();
    if (
      s.includes("ra hoa") &&
      (s.includes("đậu quả") ||
        s.includes("dau qua") ||
        s.includes("ra quả") ||
        s.includes("ra qua"))
    ) {
      phaseFromStage = "Ra quả";
    } else if (s.includes("ra hoa")) {
      phaseFromStage = "Ra hoa";
    } else if (
      s.includes("đậu quả") ||
      s.includes("dau qua") ||
      s.includes("ra quả") ||
      s.includes("ra qua")
    ) {
      phaseFromStage = "Ra quả";
    } else if (s.includes("trước thu hoạch") || s.includes("truoc thu hoach")) {
      phaseFromStage = "Trước thu hoạch";
    } else if (s.includes("sau thu hoạch") || s.includes("sau thu hoach")) {
      phaseFromStage = "Sau thu hoạch";
    } else if (
      s.includes("sinh trưởng") ||
      s.includes("sinh truong") ||
      s.includes("phát triển") ||
      s.includes("phat trien")
    ) {
      phaseFromStage = "Sinh trưởng & Phát triển";
    }
  }

  const phaseRaw =
    raw?.phase ||
    raw?.lifecyclePhase ||
    phaseFromStage ||
    stageName ||
    raw?.currentStage ||
    "Sinh trưởng & Phát triển";

  // ====== TÊN + GIỐNG (rất quan trọng cho filter) ======
  const treeTypeName = (raw?.treeTypeName || raw?.TreeTypeName || "").trim();

  let baseName = (raw?.commonName || raw?.name || raw?.treeName || "").trim();

  // giống: ưu tiên raw.variety, fallback treeTypeName
  let varietyName = (raw?.variety || treeTypeName || "").trim();

  // bỏ placeholder
  if (varietyName === "__" || varietyName === "—") {
    varietyName = "";
  }

  // nếu tên cây đã chứa giống thì không cần lặp lại
  if (
    baseName &&
    varietyName &&
    baseName.toLowerCase().includes(varietyName.toLowerCase())
  ) {
    varietyName = "";
  }

  const displayName =
    [baseName, varietyName].filter(Boolean).join(" ") ||
    raw?.treeName ||
    treeTypeName ||
    "Cây ăn quả";

  const gardenId = raw?.gardenId ?? raw?.GardenId ?? effectiveGardenId;
  const gardenName = raw?.gardenName || raw?.GardenName || effectiveGardenName;

  const locationLabel =
    raw?.locationLabel ||
    (typeof raw?.location === "string" ? raw.location : raw?.location?.label) ||
    gardenName;

  const caretakerName =
    typeof raw?.caretaker === "string"
      ? raw.caretaker
      : raw?.caretaker?.name || "Quản lý vườn";

  // tuổi cây: ưu tiên PlantDate từ backend (plantDate)
  const plantedAt =
    raw?.plantedAt ||
    raw?.planted_date ||
    (raw?.plantDate
      ? String(raw.plantDate).slice(0, 10)
      : raw?.createdAt
      ? String(raw.createdAt).slice(0, 10)
      : "2024-01-01");

  const phenology = {
    leafStatus: raw?.leafStatus,
    branchStatus: raw?.branchStatus,
    flowerStatus: raw?.flowerStatus,
    fruitStatus: raw?.fruitStatus,
  };

  const stateNote = raw?.stateNote || raw?.healthStatus || "";

  // 👇 đây là key cho "lọc theo giống"
  const cleanVariety = varietyName || treeTypeName || "";

  return {
    ...raw,
    id,
    img,
    status,
    phase: phaseRaw,
    commonName: displayName,
    variety: cleanVariety, // <- đảm bảo luôn có "Ổi", "Cam sành", v.v.
    gardenId,
    gardenName,
    locationLabel,
    plantedAt,
    caretaker: caretakerName,
    stateNote,
    state: raw?.state || {},
    phenology,
    todos: Array.isArray(raw?.todos) ? raw.todos : [],
  };
}

/* ================== MAIN COMPONENT ================== */

const PAGE_SIZE = 12;

// Chuẩn hóa dữ liệu thời tiết từ API về format GardenWeatherPanel đang dùng
function normalizeWeatherFromApi(
  currentPayload,
  forecastPayload,
  alertsPayload
) {
  /* ===== CURRENT WEATHER ===== */
  const normalizeCurrent = (c) => {
    if (!c) return null;

    // OpenWeatherMap style: windSpeed nhiều khả năng là m/s → đổi sang km/h
    const windKmh =
      typeof c.windSpeed === "number" ? Math.round(c.windSpeed * 3.6) : null;

    return {
      temp: c.temperature ?? null,
      feelsLike: c.feelsLike ?? c.temperature ?? null,
      conditionText: c.weatherDescription || c.weatherMain || "",
      humidity: c.humidity ?? null,
      windKmh,
      // API hiện chưa có UV → để null, panel vẫn render bình thường
      uvIndex: null,
      uvLabel: null,
      rainMm: c.rain1h ?? null,
    };
  };

  /* ===== FORECAST (3h steps → gom thành 3 mốc ngày) ===== */
  const normalizeForecastArray = (f) => {
    if (!f) return [];

    const items = Array.isArray(f.items) ? f.items : [];

    if (!items.length) return [];

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const dayBuckets = new Map(); // key: dayOffset 0,1,2 → value: agg

    for (const item of items) {
      if (!item?.at) continue;
      const t = new Date(item.at);
      const dayStart = new Date(t.getFullYear(), t.getMonth(), t.getDate());
      const dayOffset = Math.round(
        (dayStart.getTime() - todayStart.getTime()) / (24 * 60 * 60 * 1000)
      );

      // Chỉ lấy hôm nay, ngày mai, 2 ngày nữa cho panel nhỏ này
      if (dayOffset < 0 || dayOffset > 2) continue;

      const existing = dayBuckets.get(dayOffset) || {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
        total: 0,
        rainCount: 0,
        // giữ thử mô tả đầu tiên làm "tình trạng" đại diện
        conditionText: "",
      };

      const tempMin = item.tempMin ?? item.temp ?? null;
      const tempMax = item.tempMax ?? item.temp ?? null;

      if (typeof tempMin === "number") {
        existing.min = Math.min(existing.min, tempMin);
      }
      if (typeof tempMax === "number") {
        existing.max = Math.max(existing.max, tempMax);
      }

      existing.total += 1;
      if (typeof item.rainMm === "number" && item.rainMm > 0) {
        existing.rainCount += 1;
      }

      if (!existing.conditionText && item.description) {
        existing.conditionText = item.description;
      }

      dayBuckets.set(dayOffset, existing);
    }

    if (!dayBuckets.size) return [];

    const labelForOffset = (offset) => {
      if (offset === 0) return "Hôm nay";
      if (offset === 1) return "Ngày mai";
      return `${offset} ngày nữa`;
    };

    const out = [];
    [0, 1, 2].forEach((offset) => {
      if (!dayBuckets.has(offset)) return;
      const b = dayBuckets.get(offset);

      const min = isFinite(b.min) ? b.min : null;
      const max = isFinite(b.max) ? b.max : null;
      const rainChance =
        b.total > 0 ? Math.round((b.rainCount / b.total) * 100) : 0;

      out.push({
        id: `d${offset}`,
        label: labelForOffset(offset),
        min,
        max,
        rainChance,
        conditionText: b.conditionText || "",
      });
    });

    return out;
  };

  /* ===== ALERTS ===== */
  const normalizeAlertsArray = (a) => {
    if (!a) return [];

    const arr = Array.isArray(a) ? a : [];

    return arr.map((x, idx) => {
      const event = String(x.event || "").toLowerCase();

      // Rất đơn giản: nắng nóng → danger, mưa lớn → warning, còn lại watch
      let severity = "watch";
      if (event.includes("nắng nóng")) severity = "danger";
      else if (event.includes("mưa lớn")) severity = "warning";

      return {
        id: `alert-${idx}`,
        title: x.event || "Cảnh báo thời tiết",
        message: x.description || "",
        severity,
      };
    });
  };

  return {
    current: normalizeCurrent(currentPayload),
    forecast: normalizeForecastArray(forecastPayload),
    alerts: normalizeAlertsArray(alertsPayload),
  };
}

export default function TreeManagement() {
  const navigate = useNavigate();
  const { gardenId: paramGardenId } = useParams();
  const location = useLocation();
  const { wrapperStyle: zoomWrapperStyle, isTabletWidth } = useViewportScale();

  // header context (nếu có)
  const { gardenName: headerGardenName, gardenId: headerGardenId } =
    useGardenHeader() || {};

  // Garden truyền từ GardenManagement (navigate state)
  const incomingGarden = location.state?.garden || null;

  // Garden hiện tại
  const [garden, setGarden] = useState(() => {
    const search = new URLSearchParams(location.search);
    const qsGardenId = search.get("gardenId");
    const qsGardenName = search.get("gardenName");

    const effectiveId =
      paramGardenId ||
      qsGardenId ||
      incomingGarden?.id ||
      headerGardenId ||
      "1";

    const effectiveName =
      qsGardenName ||
      incomingGarden?.name ||
      headerGardenName ||
      `Vườn ${effectiveId}`;

    return { id: effectiveId, name: effectiveName };
  });

  // Danh sách vườn người dùng đã tạo (localStorage)
  const [gardenList, setGardenList] = useState(() => loadGardensFromLS());

  useEffect(() => {
    setGardenList(loadGardensFromLS());
  }, [paramGardenId, headerGardenId, headerGardenName]);

  const gardenById = useMemo(() => {
    const map = {};
    (gardenList || []).forEach((g) => {
      if (g && g.id) map[g.id] = g;
    });
    return map;
  }, [gardenList]);

  // Danh sách cây
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);

  // Xác định gardenId & name hiệu lực + load cây từ API
  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const qsGardenId = search.get("gardenId");
    const qsGardenName = search.get("gardenName");

    const effectiveId =
      paramGardenId ||
      qsGardenId ||
      incomingGarden?.id ||
      headerGardenId ||
      garden?.id ||
      "1";

    const effectiveName =
      qsGardenName ||
      incomingGarden?.name ||
      headerGardenName ||
      garden?.name ||
      `Vườn ${effectiveId}`;

    setGarden({ id: effectiveId, name: effectiveName });

    if (!effectiveId) return;

    let cancelled = false;

    async function fetchTrees() {
      setLoading(true);
      try {
        //console.log(effectiveId);
        const res = await TreeRepository.getMyTrees({
          gardenId: effectiveId,
          page: 1,
          pageSize: 200, // tải max 200 cây, UI vẫn chia trang 12/c
          sort: "createdAt_desc",
        });

        const payload = res?.data ?? res;
        //console.log(payload);
        const rawList = Array.isArray(payload)
          ? payload
          : payload.items || payload.results || [];

        const canonicalList = rawList.map((raw) =>
          normalizeTree(raw, effectiveId, effectiveName)
        );

        if (!cancelled) {
          setTrees(canonicalList);
        }
      } catch (err) {
        console.error("Failed to load trees", err);
        if (!cancelled) {
          setTrees([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTrees();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    paramGardenId,
    headerGardenId,
    headerGardenName,
    incomingGarden,
    location.search,
  ]);

  // Load thời tiết từ API (theo location hoặc gardenId)
  useEffect(() => {
    const gInfo = gardenById[garden?.id];
    const locationName = (gInfo && formatGardenLocation(gInfo)) || garden?.name;

    if (!locationName && !garden?.id) return;

    let cancelled = false;

    async function fetchWeather() {
      setWeatherLoading(true);
      try {
        // Ưu tiên gọi bằng location string; backend của bạn có thể mapping ra toạ độ
        const [currentRes, forecastRes, alertsRes] = await Promise.all([
          WeatherRepository.getCurrentByLocation(gInfo.province),
          WeatherRepository.getForecastByLocation(gInfo.province, 72),
          WeatherRepository.getAlertsByLocation(gInfo.province),
        ]);
        const currentPayload = currentRes?.data ?? currentRes;
        const forecastPayload = forecastRes?.data ?? forecastRes;
        const alertsPayload = alertsRes?.data ?? alertsRes;

        const normalized = normalizeWeatherFromApi(
          currentPayload,
          forecastPayload,
          alertsPayload
        );

        if (!cancelled) {
          setWeather(normalized);
        }
      } catch (err) {
        console.error("Failed to load weather", err);
        if (!cancelled) {
          setWeather(null);
        }
      } finally {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, [garden?.id, gardenById, garden?.name]);

  /* ================== Search + Filters ================== */
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | active | stopped
  const [gardenFilter, setGardenFilter] = useState(new Set());
  const [varieties, setVarieties] = useState(new Set());
  const [caretakers, setCaretakers] = useState(new Set());
  const [phases, setPhases] = useState(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateOrder, setDateOrder] = useState("desc");
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  const PAGE_COUNT_MIN = 1;
  const [page, setPage] = useState(1);

  const gardenOpts = useMemo(
    () =>
      Array.from(
        new Set(
          trees
            .map((t) => t.locationLabel || t.location?.label || t.location)
            .filter(Boolean)
        )
      ).sort(),
    [trees]
  );
  const varietyOpts = useMemo(
    () =>
      Array.from(
        new Set(
          trees
            .map((t) => (t.variety || "").trim())
            .filter((v) => v && v !== "—" && v !== "__")
        )
      ).sort(),
    [trees]
  );
  const caretakerOpts = useMemo(
    () => Array.from(new Set(trees.map((t) => t.caretaker))).sort(),
    [trees]
  );
  const phaseOpts = useMemo(() => {
    const ids = Array.from(
      new Set(
        trees
          .map((t) => normalizePhaseId(t.phase || t.lifecyclePhase || t.stage))
          .filter(Boolean)
      )
    );
    return ids.map((id) => ({ id, ...PHASE_META[id] }));
  }, [trees]);

  const stats = useMemo(() => {
    const list = trees.filter((t) => isTreeInGarden(t, garden));

    const total = list.length;
    const active = list.filter((t) => t.status === "active").length;
    const stopped = list.filter((t) => t.status === "stopped").length;

    const today = _startOfDay().getTime();
    const overdue = list.reduce((n, t) => {
      if (t.status !== "active") return n;
      return n + (t.todos || []).filter((x) => dueToTime(x.due) < today).length;
    }, 0);

    return { total, active, stopped, overdue };
  }, [trees, garden]);

  const toggleSet = (set, setter, value) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  };
  const clearAllFilters = () => {
    setStatus("all");
    setGardenFilter(new Set());
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
      // 1) Chỉ cây thuộc vườn hiện tại
      if (!isTreeInGarden(t, garden)) return false;

      const locationKey = t.locationLabel || t.location?.label || "";

      // 2) Search text
      const sMatch =
        !q ||
        [t.id, t.commonName, t.variety, locationKey]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase());
      if (!sMatch) return false;

      // 3) Trạng thái
      if (status !== "all" && t.status !== status) return false;

      const inSet = (set, v) => set.size === 0 || set.has(v);

      // 4) filter theo khu vườn con / vị trí
      if (!inSet(gardenFilter, locationKey)) return false;

      // 5) Theo giống
      if (!inSet(varieties, t.variety)) return false;

      // 6) Theo nhân viên
      if (!inSet(caretakers, t.caretaker)) return false;

      // 7) Theo giai đoạn
      const pId = normalizePhaseId(t.phase || t.lifecyclePhase || t.stage);
      if (phases.size > 0 && (!pId || !phases.has(pId))) {
        return false;
      }

      // 8) Chỉ cây có việc quá hạn
      if (onlyOverdue && !(t.status === "active" && hasOverdue(t))) {
        return false;
      }

      // 9) Lọc theo ngày trồng
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
      const prio = (s) => (s === "stopped" ? 1 : 0); // active trước
      if (prio(a.status) !== prio(b.status))
        return prio(a.status) - prio(b.status);
      const da = new Date(a.plantedAt).getTime();
      const db = new Date(b.plantedAt).getTime();
      return dateOrder === "asc" ? da - db : db - da;
    });

    return list;
  }, [
    trees,
    garden,
    q,
    status,
    gardenFilter,
    varieties,
    caretakers,
    phases,
    dateFrom,
    dateTo,
    dateOrder,
    onlyOverdue,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    q,
    status,
    gardenFilter,
    varieties,
    caretakers,
    phases,
    dateFrom,
    dateTo,
    dateOrder,
    onlyOverdue,
    garden,
  ]);

  const PAGE_COUNT = Math.max(
    PAGE_COUNT_MIN,
    Math.ceil(filtered.length / PAGE_SIZE)
  );
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(filtered.length, page * PAGE_SIZE);
  const pageItems = useMemo(
    () => filtered.slice(startIdx, endIdx),
    [filtered, startIdx, endIdx]
  );
  //console.log(pageItems);

  /* ================== Render ================== */
  return (
    <div className="mm-fluid-page relative min-h-screen overflow-hidden pt-[64px]">
      <LivingBackground
        theme="aurora"
        baseColor={PALETTE.bg}
        accents={[PALETTE.leaf, "#38bdf8", "#facc15"]}
        density={36}
        grain={0.08}
        blur={12}
        speed={1.15}
      />

      <style>{`
        @keyframes mmOverduePulse {
          0%   { box-shadow: 0 0 0 0 rgba(244,63,94,.00); }
          50%  { box-shadow: 0 0 22px 10px rgba(244,63,94,.22); }
          100% { box-shadow: 0 0 0 0 rgba(244,63,94,.00); }
        }
      `}</style>

      <div style={zoomWrapperStyle}>
        <main className="mm-fluid-shell px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4 space-y-6">
          {/* Header + weather (chia đôi hero) */}
          <section className="mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start lg:items-end">
              {/* BÊN TRÁI: title + desc + breadcrumb + nút */}
              <div className="space-y-3">
                <div className="max-w-[760px]">
                  <h1 className="text-white text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                    {`Vườn: ${garden?.name || "—"}`}
                  </h1>

                  <div className="mt-2 text-xs text-white/75">
                    <Link className="underline" to="/garden">
                      Danh sách vườn
                    </Link>
                    <span> / </span>
                    <span className="font-medium">{garden?.name || "—"}</span>
                  </div>
                </div>

                {/* Nút thêm cây ăn quả – sát dưới header */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="h-11 md:h-12 px-5 md:px-6 rounded-2xl text-sm md:text-base font-semibold shadow-[0_10px_28px_rgba(255,255,165,0.20)] ring-1 ring-black/5 transition-all hover:shadow-[0_14px_44px_rgba(255,255,165,0.26)] hover:-translate-y-0.5"
                    style={{
                      background:
                        "linear-gradient(135deg,#FFFFA5 0%, #D1DFB6 100%)",
                      color: "#1F302F",
                    }}
                    onClick={() => navigate("/new", { state: { garden } })}
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className="grid place-items-center w-8 h-8 rounded-xl bg-white/70 backdrop-blur">
                        <Plus className="w-5 h-5" />
                      </span>
                      Thêm cây ăn quả
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-11 md:h-12 px-5 md:px-6 rounded-2xl text-sm md:text-base font-semibold border-white/30 bg-white/15 text-white/95 hover:bg-white/25 hover:text-white transition-all"
                    onClick={() => setTaskPanelOpen(true)}
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className="grid place-items-center w-8 h-8 rounded-xl bg-white/20 backdrop-blur">
                        <ClipboardList className="w-5 h-5" />
                      </span>
                      Quản lý công việc vườn
                    </span>
                  </Button>
                </div>
              </div>

              {/* BÊN PHẢI: khung thời tiết – luôn nằm nửa phải hero */}
              <div className="flex justify-end">
                <div className="w-full max-w-[780px]">
                  <GardenWeatherPanel
                    garden={garden}
                    gardenInfo={gardenById[garden?.id]}
                    weather={weather}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Search + filter */}
          <section
            className={[
              isTabletWidth ? "relative" : "sticky top-[64px]",
              "z-[50] overflow-visible",
            ].join(" ")}
          >
            <div
              className="flex flex-col xl:flex-row gap-3 rounded-2xl p-3"
              style={{
                background: "rgba(251,255,223,0.06)",
                border: "1px solid rgba(255,255,165,0.15)",
              }}
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
                  <Button
                    variant="outline"
                    className="gap-2 bg-white/95 h-11 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700"
                  >
                    <FilterIcon className="h-4 w-4" /> Bộ lọc
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuContent
                    align="end"
                    side="bottom"
                    sideOffset={10}
                    collisionPadding={24}
                    className="z-[1000] min-w-[320px] rounded-xl border border-neutral-200 bg-white shadow-2xl overflow-visible"
                  >
                    <DropdownMenuLabel className="px-3 pt-2 pb-1 text-[11px] text-neutral-500">
                      Trạng thái
                    </DropdownMenuLabel>

                    {[
                      {
                        key: "all",
                        label: "Tất cả",
                        count: stats.total,
                      },
                      {
                        key: "active",
                        label: "Đang hoạt động",
                        count: stats.active,
                      },
                      {
                        key: "stopped",
                        label: "Dừng hoạt động",
                        count: stats.stopped,
                      },
                    ].map((opt) => {
                      const active = status === opt.key;
                      return (
                        <DropdownMenuItem
                          key={opt.key}
                          onClick={() => setStatus(opt.key)}
                          className={
                            "flex items-center justify-between gap-3 py-2 rounded-none cursor-pointer transition-all duration-200 " +
                            (active
                              ? "bg-emerald-50 border-l-2 border-emerald-500"
                              : "hover:bg-emerald-50/50 hover:scale-[1.02]")
                          }
                        >
                          <span className="inline-flex items-center gap-2">
                            {active ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <span className="h-4 w-4" />
                            )}
                            {opt.label}
                          </span>
                          <span className="px-1.5 py-0.5 text-[11px] rounded-full bg-neutral-100 border border-neutral-200">
                            {opt.count}
                          </span>
                        </DropdownMenuItem>
                      );
                    })}

                    <DropdownMenuSeparator className="my-2" />

                    {/* Theo khu vườn / vị trí */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2 transition-all duration-200 hover:bg-emerald-50/50">
                        <MapPin className="h-4 w-4" /> Theo khu / vị trí
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="min-w-[240px] rounded-xl border border-neutral-200 bg-white shadow-2xl">
                        {gardenOpts.map((g) => (
                          <DropdownMenuCheckboxItem
                            key={g}
                            checked={gardenFilter.has(g)}
                            onCheckedChange={() =>
                              toggleSet(gardenFilter, setGardenFilter, g)
                            }
                            className="cursor-pointer transition-all duration-200 hover:bg-emerald-50/50 hover:scale-[1.01]"
                          >
                            {g}
                          </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setGardenFilter(new Set())}
                          className="text-neutral-600 transition-all duration-200 hover:bg-rose-50/50 hover:scale-[1.01]"
                        >
                          Xóa lựa chọn
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Theo giống */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2 transition-all duration-200 hover:bg-emerald-50/50">
                        <Sprout className="h-4 w-4" /> Theo giống
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="min-w-[220px] rounded-xl border border-neutral-200 bg-white shadow-2xl">
                        {varietyOpts.map((v) => (
                          <DropdownMenuCheckboxItem
                            key={v}
                            checked={varieties.has(v)}
                            onCheckedChange={() =>
                              toggleSet(varieties, setVarieties, v)
                            }
                            className="cursor-pointer transition-all duration-200 hover:bg-emerald-50/50 hover:scale-[1.01]"
                          >
                            {v}
                          </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setVarieties(new Set())}
                          className="text-neutral-600 transition-all duration-200 hover:bg-rose-50/50 hover:scale-[1.01]"
                        >
                          Xóa lựa chọn
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Theo nhân viên
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2">
                        <User className="h-4 w-4" /> Theo nhân
                        viên
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="min-w-[200px] rounded-xl border border-neutral-200 bg-white shadow-2xl">
                        {caretakerOpts.map((u) => (
                          <DropdownMenuCheckboxItem
                            key={u}
                            checked={caretakers.has(u)}
                            onCheckedChange={() =>
                              toggleSet(
                                caretakers,
                                setCaretakers,
                                u
                              )
                            }
                            className="cursor-pointer"
                          >
                            {u}
                          </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            setCaretakers(new Set())
                          }
                          className="text-neutral-600"
                        >
                          Xóa lựa chọn
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    */}

                    {/* Theo giai đoạn */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2 transition-all duration-200 hover:bg-emerald-50/50">
                        <Sprout className="h-4 w-4" /> Theo giai đoạn
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="min-w-[240px] rounded-xl border border-neutral-200 bg-white shadow-2xl">
                        {phaseOpts.map((opt) => (
                          <DropdownMenuCheckboxItem
                            key={opt.id}
                            checked={phases.has(opt.id)}
                            onCheckedChange={() =>
                              toggleSet(phases, setPhases, opt.id)
                            }
                            className="cursor-pointer transition-all duration-200 hover:bg-emerald-50/50 hover:scale-[1.01]"
                          >
                            <span className="inline-flex items-center gap-2">
                              <span className="text-sm leading-none">
                                {opt.icon}
                              </span>
                              {opt.name}
                            </span>
                          </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setPhases(new Set())}
                          className="text-neutral-600 transition-all duration-200 hover:bg-rose-50/50 hover:scale-[1.01]"
                        >
                          Xóa lựa chọn
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* Theo ngày thêm */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2 transition-all duration-200 hover:bg-emerald-50/50">
                        <Calendar className="h-4 w-4" /> Theo ngày thêm
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="min-w-[280px] rounded-xl border border-neutral-200 bg-white shadow-2xl p-3">
                        <div className="text-[12px] text-neutral-600 mb-1">
                          Sắp xếp
                        </div>
                        <DropdownMenuRadioGroup
                          value={dateOrder}
                          onValueChange={setDateOrder}
                        >
                          <DropdownMenuRadioItem
                            value="desc"
                            className="transition-all duration-200 hover:bg-emerald-50/50"
                          >
                            Mới nhất → Cũ nhất
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem
                            value="asc"
                            className="transition-all duration-200 hover:bg-emerald-50/50"
                          >
                            Cũ nhất → Mới nhất
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>

                        <DropdownMenuSeparator className="my-2" />
                        <div className="grid gap-2 text-sm">
                          <div className="grid gap-1">
                            <div className="text-[12px] text-neutral-600">
                              Từ ngày
                            </div>
                            <Input
                              type="date"
                              value={dateFrom}
                              onChange={(e) => setDateFrom(e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div className="grid gap-1">
                            <div className="text-[12px] text-neutral-600">
                              Đến ngày
                            </div>
                            <Input
                              type="date"
                              value={dateTo}
                              onChange={(e) => setDateTo(e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div className="flex justify-between pt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 transition-all duration-200 hover:scale-105 hover:bg-rose-50 hover:text-rose-700"
                              onClick={() => {
                                setDateFrom("");
                                setDateTo("");
                              }}
                            >
                              Xóa
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-emerald-600"
                            >
                              Áp dụng
                            </Button>
                          </div>
                        </div>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator className="my-2" />

                    {/* Chỉ hiển thị cây có việc quá hạn */}
                    <DropdownMenuCheckboxItem
                      checked={onlyOverdue}
                      onCheckedChange={() => setOnlyOverdue((v) => !v)}
                      className="cursor-pointer transition-all duration-200 hover:bg-amber-50/50 hover:scale-[1.01]"
                    >
                      Chỉ hiển thị cây có việc quá hạn
                    </DropdownMenuCheckboxItem>

                    <div className="px-3 py-3">
                      <Button
                        variant="outline"
                        className="w-full transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700"
                        onClick={clearAllFilters}
                      >
                        Xóa tất cả bộ lọc
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </div>
          </section>

          {/* Mini stats (chỉ tính cây trong vườn hiện tại) */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: "Tổng cây", value: stats.total },
              { label: "Đang hoạt động", value: stats.active },
              { label: "Dừng hoạt động", value: stats.stopped },
              {
                label: "Việc quá hạn",
                value: stats.overdue,
                icon: <AlertTriangle className="w-4 h-4" />,
              },
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
                    border: isOver
                      ? undefined
                      : "1px solid rgba(255,255,165,0.15)",
                    color: PALETTE.ivory,
                  }}
                >
                  <span
                    className={
                      "inline-flex items-center gap-2 " +
                      (isOver ? "text-rose-200" : "opacity-80")
                    }
                  >
                    {s.icon}
                    {s.label}
                  </span>
                  <span
                    className={
                      "font-semibold " + (isOver ? "text-rose-300" : "")
                    }
                  >
                    {s.value}
                  </span>
                  {isOver && (
                    <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_0_6px_rgba(244,63,94,.32)]" />
                  )}
                </div>
              );
            })}
          </section>

          {/* Cards grid */}
          {loading ? (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-7">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[360px] rounded-3xl border bg-white/60 animate-pulse"
                />
              ))}
            </section>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-7 items-stretch">
              {pageItems.map((t) => {
                const stopped = isStopped(t);
                const {
                  leafTxt,
                  branchTxt,
                  flowerTxt,
                  fruitTxt,
                  showFlower,
                  showFruit,
                } = getTreeConditions(t);

                const gInfo = gardenById[t.gardenId || (garden && garden.id)];
                const locationText = gInfo
                  ? formatGardenLocation(gInfo)
                  : t.locationLabel || t.location?.label || garden?.name;

                return (
                  <Card
                    key={t.id}
                    className={
                      "group rounded-3xl overflow-hidden shadow-sm transition-all duration-500 ease-out h-full flex flex-col border border-[rgba(255,255,165,0.25)] " +
                      (stopped
                        ? "opacity-90"
                        : "hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-500 hover:border-[4px] hover:ring-4 hover:ring-emerald-400/60 animate-pulse-on-hover")
                    }
                    style={{
                      background: "#FFFFFFF2",
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      navigate(`/tree_detail/${encodeURIComponent(t.id)}`, {
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.click();
                    }}
                  >
                    <div className="relative">
                      <img
                        src={t.img}
                        alt={t.commonName}
                        className="h-48 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-[#0f1f1e]">
                            {t.commonName}
                          </div>
                          <div className="text-xs text-neutral-500">
                            # {t.treeCode}
                          </div>
                          <div className="mt-1 text-xs text-neutral-500 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[220px] sm:max-w-[260px]">
                              {locationText}
                            </span>
                          </div>
                        </div>
                        <StatusPill status={t.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mt-5">
                        <div>
                          <div className="text-neutral-500">
                            Giai đoạn sinh trưởng
                          </div>
                          <div className="mt-1">
                            <PhaseBadge
                              value={t.phase || t.lifecyclePhase || t.stage}
                              size="xs"
                              preferAbbr
                            />
                          </div>
                        </div>
                        <div>
                          <div className="text-neutral-500">Tuổi cây</div>
                          <div className="mt-1 flex items-center gap-2 text-neutral-800">
                            <Calendar className="h-4 w-4" />{" "}
                            {monthsBetween(t.plantedAt) + t.preMonths} tháng
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-neutral-500 text-sm">
                          Tình trạng
                        </div>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <CondRow label="Lá" value={leafTxt} />
                          <CondRow label="Cành" value={branchTxt} />
                          {showFlower && (
                            <CondRow label="Hoa" value={flowerTxt} />
                          )}
                          {showFruit && (
                            <CondRow label="Quả" value={fruitTxt} />
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div className="text-neutral-500 text-sm">
                            Việc cần làm
                          </div>
                          {!stopped &&
                            (() => {
                              const today = _startOfDay().getTime();
                              const n = (t.todos || []).filter(
                                (x) => dueToTime(x.due) < today
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
                            Cây đã{" "}
                            <span className="font-medium">dừng hoạt động</span>{" "}
                            — ngừng mọi nhắc việc/gợi ý. Chỉ dùng để tra cứu
                            lịch sử.
                          </div>
                        ) : (
                          (() => {
                            const sorted = [...(t.todos || [])].sort(
                              compareDue
                            );
                            const top3 = sorted.slice(0, 3);
                            const remain = Math.max(
                              0,
                              (t.todos || []).length - top3.length
                            );
                            return (
                              <>
                                <ul className="mt-2 space-y-1">
                                  {top3.map((x, i) => (
                                    <TodoRow
                                      key={i}
                                      text={x.text}
                                      due={x.due}
                                    />
                                  ))}
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
                <div className="px-3 text-sm text-white/85">
                  Trang {page}/{PAGE_COUNT}
                </div>
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

          {!loading && filtered.length === 0 && (
            <div className="text-center text-white/70 py-10">
              Không có cây phù hợp
            </div>
          )}
        </main>
      </div>
      <GardenTaskManagerSheet
        open={taskPanelOpen}
        onOpenChange={setTaskPanelOpen}
        garden={garden}
        gardenInfo={gardenById[garden?.id]}
      />
    </div>
  );
}

function GardenWeatherPanel({ garden, gardenInfo, weather }) {
  // ====== AUTO SCALE THEO RỘNG PANEL (GIỮ KHUNG CỐ ĐỊNH) ======
  const panelRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [supportsZoom, setSupportsZoom] = useState(false);

  // check browser có support thuộc tính CSS zoom không
  useEffect(() => {
    try {
      if (typeof document !== "undefined" && document.body?.style) {
        setSupportsZoom(
          Object.prototype.hasOwnProperty.call(document.body.style, "zoom")
        );
      }
    } catch (_) {}
  }, []);

  // auto tính scale mỗi khi panel thay đổi width
  useEffect(() => {
    if (typeof ResizeObserver === "undefined" || !panelRef.current) return;

    const el = panelRef.current;
    const BASE_WIDTH = 780; // chiều rộng “chuẩn” bạn đang dùng

    const updateScale = () => {
      const w = el.clientWidth || BASE_WIDTH;
      // w < BASE_WIDTH thì thu nhỏ, w >= BASE_WIDTH thì để = 1
      const next = Math.min(1, w / BASE_WIDTH);
      // tránh thu nhỏ quá bé
      setScale(next);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const innerScaleStyle = supportsZoom
    ? {
        zoom: scale,
      }
    : {
        transform: `scale(${scale})`,
        transformOrigin: "center right",
        // đảm bảo sau khi scale, phần nội dung vẫn fill đủ chiều ngang
        width: `${100 / scale}%`,
      };

  // ====== DATA THỜI TIẾT DEMO NHƯ CŨ ======
  const locationName =
    (gardenInfo && formatGardenLocation(gardenInfo)) ||
    garden?.name ||
    "Đang tải vị trí...";

  const demoWeather = {
    current: {
      temp: 29,
      feelsLike: 31,
      conditionText: "Nắng nhẹ",
      humidity: 65,
      windKmh: 5,
      uvIndex: 4,
      uvLabel: "thấp",
      rainMm: 0,
    },
    alerts: [
      {
        id: "alert-1",
        title: "Khả năng mưa rào chiều nay",
        message: "Chuẩn bị thoát nước và kiểm tra nấm bệnh cho vườn.",
        severity: "warning",
      },
    ],
    forecast: [
      {
        id: "f1",
        label: "Chiều nay",
        min: 26,
        max: 32,
        rainChance: 60,
        conditionText: "Mưa rào",
      },
      {
        id: "f2",
        label: "Ngày mai",
        min: 25,
        max: 31,
        rainChance: 30,
        conditionText: "Nắng xen mây",
      },
      {
        id: "f3",
        label: "2 ngày nữa",
        min: 25,
        max: 30,
        rainChance: 40,
        conditionText: "Có mưa nhẹ",
      },
    ],
  };

  const data = weather && weather.current ? weather : demoWeather;
  const current = data.current || demoWeather.current;
  const alerts = Array.isArray(data.alerts) ? data.alerts : [];
  const forecast = Array.isArray(data.forecast) ? data.forecast : [];

  const now = new Date();
  const updatedLabel = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const mainAlert = alerts[0];

  const alertStyle = (() => {
    if (!mainAlert) {
      return {
        wrapper: "border-white/10 bg-black/10",
        pill: "bg-white/10 text-white/80",
      };
    }
    if (mainAlert.severity === "danger") {
      return {
        wrapper: "border-rose-300/80 bg-rose-500/20",
        pill: "bg-rose-500 text-white",
      };
    }
    if (mainAlert.severity === "warning") {
      return {
        wrapper: "border-amber-300/80 bg-amber-500/20",
        pill: "bg-amber-500 text-black/80",
      };
    }
    return {
      wrapper: "border-emerald-300/80 bg-emerald-500/20",
      pill: "bg-emerald-500 text-white/90",
    };
  })();

  const pickWeatherIcon = (conditionText) => {
    const text = String(conditionText || "").toLowerCase();
    if (text.includes("mưa") || text.includes("rain")) {
      return <CloudRain className="w-6 h-6" />;
    }
    if (text.includes("nắng") || text.includes("sun")) {
      return <SunMedium className="w-6 h-6" />;
    }
    return <CloudSun className="w-6 h-6" />;
  };

  return (
    <div
      ref={panelRef}
      className="w-full rounded-2xl px-3 md:px-3.5 py-3 md:py-4 backdrop-blur-md text-white border border-white/15 bg-gradient-to-r from-white/10 via-white/5 to-emerald-400/20 shadow-xl min-h-[170px] md:min-h-[150px] h-auto overflow-hidden"
      aria-label={`Thời tiết vườn ${locationName}`}
    >
      {/* THẺ NỘI DUNG ĐƯỢC SCALE AUTO, KHUNG GIỮ NGUYÊN CHIỀU CAO */}
      <div style={innerScaleStyle} className="w-full h-full flex">
        <div className="flex flex-col md:flex-row items-stretch gap-3 md:gap-4 text-[11px] md:text-[12px] w-full">
          {/* Khối 1: Thời tiết hiện tại */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1 font-medium">
                <CloudSun className="w-3.5 h-3.5 opacity-90" />
                <span>Thời tiết vườn</span>
              </div>
              <span className="text-white/70 text-[10px] md:text-[11px]">
                Cập nhật {updatedLabel}
              </span>
            </div>

            <div className="flex items-center gap-3 md:gap-4 mt-1">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black/15 border border-white/20 grid place-items-center shrink-0">
                {pickWeatherIcon(current.conditionText)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
                  <span className="text-2xl md:text-3xl font-semibold">
                    {current.temp != null
                      ? Math.round(Number(current.temp))
                      : "—"}
                  </span>
                  <span className="text-xs opacity-80">°C</span>
                  <span className="text-xs opacity-85">
                    {current.conditionText || "Đang cập nhật"} · Cảm giác{" "}
                    {current.feelsLike != null
                      ? Math.round(Number(current.feelsLike))
                      : current.temp != null
                      ? Math.round(Number(current.temp))
                      : "—"}
                    °
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Đường kẻ dọc md+ */}
          <div className="hidden md:block w-px bg-white/15" />

          {/* Khối 2: Cảnh báo thời tiết */}
          <div className="flex-1 min-w-[220px] flex flex-col">
            <div
              className={"rounded-xl px-3 py-2.5 border " + alertStyle.wrapper}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {mainAlert
                      ? mainAlert.title
                      : "Không có cảnh báo thời tiết"}
                  </span>

                  {mainAlert && (
                    <span
                      className={
                        "inline-flex items-center justify-center rounded-full w-8 h-8 " +
                        alertStyle.pill
                      }
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {mainAlert && <p className="opacity-90">{mainAlert.message}</p>}

                {alerts.length > 1 && (
                  <div className="opacity-75">
                    +{alerts.length - 1} cảnh báo khác
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Khối 3: Dự báo 3 mốc */}
          {forecast.length > 0 && (
            <div className="mt-1 md:mt-0 grid grid-cols-3 gap-2 w-full md:w-[260px] md:flex-shrink-0">
              {forecast.slice(0, 3).map((f) => (
                <div
                  key={f.id || f.label}
                  className="flex flex-col items-center gap-0.5 rounded-xl bg-white/10 border border-white/15 px-2 py-1.5 text-center"
                >
                  <span className="opacity-80">{f.label}</span>
                  <div className="flex items-center justify-center">
                    {pickWeatherIcon(f.conditionText)}
                  </div>
                  <span className="font-semibold">
                    {f.max != null ? Math.round(Number(f.max)) : "—"}°
                  </span>
                  <span className="opacity-75 text-[10px]">
                    {f.min != null ? Math.round(Number(f.min)) : "—"}° ·{" "}
                    {f.rainChance != null ? f.rainChance : 0}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GardenTaskManagerSheet({ open, onOpenChange, garden, gardenInfo }) {
  const [tasks, setTasks] = useState([]);
  const [taskTotal, setTaskTotal] = useState(0);
  const [taskPage, setTaskPage] = useState(1);
  const [taskFilters, setTaskFilters] = useState({
    search: "",
    status: "all",
    type: "all",
  });
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState(null);
  const [completingMap, setCompletingMap] = useState({});
  const [completeConfirmDialog, setCompleteConfirmDialog] = useState({
    open: false,
    task: null,
    note: "",
  });

  const numericGardenId = useMemo(() => {
    if (!garden?.id) return null;
    const parsed = Number(garden.id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [garden?.id]);

  const totalPages = Math.max(1, Math.ceil(taskTotal / TASK_PAGE_SIZE));
  const locationText =
    (gardenInfo && formatGardenLocation(gardenInfo)) ||
    garden?.name ||
    "Vườn đang chọn";

  const fetchGardenTasks = useCallback(async () => {
    if (!numericGardenId) return;
    setTaskLoading(true);
    setTaskError(null);
    const filterType = taskFilters.type;
    const filterOther = filterType === "Other";
    const apiTaskType =
      filterType !== "all" && !filterOther ? filterType : undefined;
    try {
      const response = await CareScheduleRepository.searchTasks({
        gardenId: numericGardenId,
        status: taskFilters.status !== "all" ? taskFilters.status : undefined,
        taskType: apiTaskType,
        searchKeyword: taskFilters.search || undefined,
        pageNumber: taskPage,
        pageSize: TASK_PAGE_SIZE,
      });
      const { items, total } = parseTaskSearchResult(response);
      const filteredItems = filterOther
        ? items.filter((task) => !isCoreTaskType(task.taskType))
        : items;
      setTasks(filteredItems);
      setTaskTotal(filterOther ? filteredItems.length : total);
    } catch (err) {
      console.error("Failed to load garden tasks", err);
      setTaskError(err?.message || "Không thể tải danh sách công việc.");
      setTasks([]);
    } finally {
      setTaskLoading(false);
    }
  }, [
    numericGardenId,
    taskFilters.search,
    taskFilters.status,
    taskFilters.type,
    taskPage,
  ]);

  useEffect(() => {
    if (!open) return;
    fetchGardenTasks();
  }, [open, fetchGardenTasks]);

  useEffect(() => {
    setTaskPage(1);
  }, [
    taskFilters.search,
    taskFilters.status,
    taskFilters.type,
    numericGardenId,
  ]);

  useEffect(() => {
    setTaskFilters({ search: "", status: "all", type: "all" });
    setTaskPage(1);
  }, [numericGardenId]);

  const statusStats = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        const key = normalizeKey(task.status);
        if (acc[key] !== undefined) {
          acc[key] += 1;
        }
        acc.total += 1;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        inprogress: 0,
        completed: 0,
        postponed: 0,
        cancelled: 0,
      }
    );
  }, [tasks]);

  const handleFilterChange = (key, value) => {
    setTaskFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setTaskFilters({ search: "", status: "all", type: "all" });
  };

  const handleOpenCompleteDialog = (task) => {
    if (!task || task.status === "Completed") return;
    setCompleteConfirmDialog({
      open: true,
      task,
      note: task.completedNote || "",
    });
  };

  const handleCloseCompleteDialog = () => {
    setCompleteConfirmDialog({ open: false, task: null, note: "" });
  };

  const handleConfirmComplete = async () => {
    const task = completeConfirmDialog.task;
    if (!task) return;
    
    const id = task.scheduleId;
    const note = (completeConfirmDialog.note || "").trim();
    
    setCompletingMap((prev) => ({ ...prev, [id]: true }));
    try {
      // Format date as YYYY-MM-DD (consistent with TreeDetail)
      const d = new Date();
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const today = d.toISOString().slice(0, 10);
      
      await CareScheduleRepository.markTaskComplete(id, {
        completedNote: note || null,
        completedDate: today,
      });
      setTasks((prev) =>
        prev.map((item) =>
          item.scheduleId === id
            ? {
                ...item,
                status: "Completed",
                completedNote: note,
              }
            : item
        )
      );
      handleCloseCompleteDialog();
      setTaskError(null); // Clear any previous errors
    } catch (err) {
      console.error("Failed to mark task complete", err);
      setTaskError(err?.message || "Không thể hoàn thành công việc.");
    } finally {
      setCompletingMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleManualRefresh = () => {
    if (!numericGardenId) return;
    fetchGardenTasks();
  };

  // Group tasks by tree
  const tasksByTree = useMemo(() => {
    const grouped = {};
    tasks.forEach((task) => {
      const treeId = task.treeId || task.treeCode || "unknown";
      const treeName = task.treeName || "Cây chưa xác định";
      const key = `${treeId}_${treeName}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          treeId,
          treeName,
          tasks: [],
        };
      }
      grouped[key].tasks.push(task);
    });
    
    // Sort tasks within each tree by scheduled date
    Object.keys(grouped).forEach((key) => {
      grouped[key].tasks.sort((a, b) => {
        const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
        const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
        return dateA - dateB;
      });
    });
    
    return grouped;
  }, [tasks]);

  const treeKeys = useMemo(() => {
    return Object.keys(tasksByTree).sort((a, b) => {
      const nameA = tasksByTree[a].treeName.toLowerCase();
      const nameB = tasksByTree[b].treeName.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [tasksByTree]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl lg:max-w-4xl overflow-y-auto bg-[#f7fbf4]"
      >
        <SheetHeader>
          <SheetTitle>Quản lý công việc vườn</SheetTitle>
          <SheetDescription>
            {garden?.name
              ? `Tổng hợp công việc của ${garden.name}`
              : "Theo dõi tiến độ chăm sóc cây trong vườn"}
            .<br />
            <span className="text-foreground/80">{locationText}</span>
          </SheetDescription>
        </SheetHeader>

        {!numericGardenId && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Vui lòng chọn một vườn hợp lệ để xem công việc.
          </div>
        )}

        {numericGardenId && (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  value={taskFilters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Tìm theo tên công việc, cây hoặc mô tả..."
                  className="pl-9 bg-white"
                />
              </div>
              <Select
                value={taskFilters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_FILTERS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={taskFilters.type}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger className="w-[200px] bg-white">
                  <SelectValue placeholder="Quy trình" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPE_FILTERS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                className="text-sm text-neutral-600 hover:text-rose-600"
                onClick={handleResetFilters}
              >
                Xóa lọc
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleManualRefresh}
                disabled={taskLoading}
              >
                {taskLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Làm mới
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Tổng việc", value: statusStats.total },
                { label: "Chờ thực hiện", value: statusStats.pending },
                { label: "Đang thực hiện", value: statusStats.inprogress },
                { label: "Hoàn thành", value: statusStats.completed },
                { label: "Hoãn lại", value: statusStats.postponed },
                { label: "Đã hủy", value: statusStats.cancelled },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-emerald-100 bg-white px-3 py-3 text-sm text-neutral-600"
                >
                  <div className="text-xs uppercase tracking-wide text-neutral-400">
                    {stat.label}
                  </div>
                  <div className="text-2xl font-semibold text-emerald-700">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {taskError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                {taskError}
              </div>
            )}

            <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-6">
              {taskLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-[140px] rounded-2xl bg-neutral-200/40 animate-pulse"
                    />
                  ))}
                </div>
              )}

              {!taskLoading && tasks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-10 text-center text-sm text-neutral-500">
                  Không có công việc nào phù hợp với bộ lọc hiện tại.
                </div>
              )}

              {!taskLoading &&
                treeKeys.map((treeKey, treeIdx) => {
                  const treeGroup = tasksByTree[treeKey];
                  if (!treeGroup || treeGroup.tasks.length === 0) return null;

                  return (
                    <div key={treeKey} className="space-y-3">
                      {/* Tree Header */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Sprout className="h-5 w-5 text-emerald-600" />
                          <h3 className="text-lg font-semibold text-emerald-900">
                            {treeGroup.treeName}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="ml-auto bg-emerald-100 text-emerald-700 border-emerald-200"
                          >
                            {treeGroup.tasks.length}{" "}
                            {treeGroup.tasks.length === 1
                              ? "công việc"
                              : "công việc"}
                          </Badge>
                        </div>
                      </div>

                      {/* Tasks for this tree */}
                      <div className="space-y-3 pl-4 border-l-2 border-emerald-100">
                        {treeGroup.tasks.map((task) => {
                          const overdue = isTaskOverdue(
                            task.scheduledDate,
                            task.status
                          );
                          const busyComplete = Boolean(
                            completingMap[task.scheduleId]
                          );
                          const priorityMeta =
                            TASK_PRIORITY_META[normalizeKey(task.priority)] ||
                            TASK_PRIORITY_META.default;
                          return (
                            <div
                              key={task.scheduleId}
                              className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-base font-semibold text-slate-900">
                                    {task.taskName}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    #{task.scheduleId}
                                  </div>
                                </div>
                                <TaskStatusBadge status={task.status} />
                              </div>

                              <div className="flex flex-wrap gap-2 text-xs">
                                <Badge
                                  variant="secondary"
                                  className="gap-1 bg-emerald-50 text-emerald-700"
                                >
                                  {taskTypeLabel(task.taskType)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`gap-1 ${priorityMeta.className}`}
                                >
                                  Ưu tiên: {priorityMeta.label}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`gap-1 border-neutral-200 text-neutral-600 ${
                                    overdue
                                      ? "border-rose-200 text-rose-600 bg-rose-50"
                                      : ""
                                  }`}
                                >
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatTaskDate(task.scheduledDate)}
                                  {overdue && " · Quá hạn"}
                                </Badge>
                              </div>

                              {task.description && (
                                <p className="text-sm text-neutral-600">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-neutral-200 pt-3">
                                <Button
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleOpenCompleteDialog(task)}
                                  disabled={
                                    busyComplete || task.status === "Completed"
                                  }
                                >
                                  {busyComplete ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                  Hoàn thành
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Separator between trees */}
                      {treeIdx < treeKeys.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Completion Confirmation Dialog */}
            {completeConfirmDialog.open && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                  <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div className="text-lg font-semibold">
                      Ghi chú thực tế & hoàn thành
                    </div>
                    <button
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-neutral-50"
                      onClick={handleCloseCompleteDialog}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="rounded-xl border p-3 text-sm">
                      <div className="font-medium">
                        Xác nhận hoàn thành công việc
                      </div>
                      {completeConfirmDialog.task && (
                        <div className="text-xs text-neutral-500 mt-1">
                          {completeConfirmDialog.task.taskName}
                        </div>
                      )}
                    </div>

                    <Textarea
                      rows={5}
                      value={completeConfirmDialog.note}
                      onChange={(e) =>
                        setCompleteConfirmDialog((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                      placeholder="VD: kế hoạch tưới 2L, thực tế 1L do đất còn ẩm... (có thể để trống)"
                    />

                    {taskError && (
                      <p className="text-sm text-rose-600">{taskError}</p>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCloseCompleteDialog}
                        disabled={Boolean(
                          completingMap[completeConfirmDialog.task?.scheduleId]
                        )}
                      >
                        Huỷ
                      </Button>
                      <Button
                        onClick={handleConfirmComplete}
                        disabled={Boolean(
                          completingMap[completeConfirmDialog.task?.scheduleId]
                        )}
                        className="gap-2"
                      >
                        {completingMap[completeConfirmDialog.task?.scheduleId] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Hoàn thành
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {taskTotal > TASK_PAGE_SIZE && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-neutral-500">
                  Trang {taskPage}/{totalPages} · {taskTotal} công việc
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={taskPage === 1}
                    onClick={() => setTaskPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={taskPage === totalPages}
                    onClick={() =>
                      setTaskPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function TaskStatusBadge({ status }) {
  const meta =
    TASK_STATUS_META[normalizeKey(status)] || TASK_STATUS_META.default;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

//Sau này nối với API thời tiết như thế nào?
//tạo thêm state & useEffect:
// const [weather, setWeather] = useState(null);

// useEffect(() => {
//   if (!gardenInfo) return;

//   // TODO: gọi API thời tiết thật theo toạ độ / tỉnh / vườn
//   // ví dụ:
//   // fetch(`/api/weather?lat=${gardenInfo.lat}&lng=${gardenInfo.lng}`)
//   //   .then(res => res.json())
//   //   .then((data) => setWeather(data));

//   // Tạm thời bỏ trống, để demo UI
// }, [gardenInfo]);

/* ================== Small components ================== */
function TodoRow({ text, due }) {
  const d = String(due).toLowerCase();
  const dueColor = d.includes("quá hạn")
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : d.includes("hôm nay")
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-neutral-50 text-neutral-600 border-neutral-200";
  return (
    <li className="flex items-center justify-between gap-2 py-1">
      <span className="text-sm text-neutral-800">{text}</span>
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${dueColor}`}
      >
        {due}
      </span>
    </li>
  );
}
