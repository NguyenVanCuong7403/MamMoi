const PHASE_ID_ALIASES = {
  growth_development: [
    "growth",
    "sinh trưởng",
    "sinh truong",
    "phát triển",
    "phat trien",
    "phase1",
    "1",
  ],
  flowering: ["ra hoa", "flower", "2"],
  fruiting: [
    "ra quả",
    "ra qua",
    "đậu quả",
    "dau qua",
    "kết trái",
    "ket trai",
    "nuôi quả",
    "nuoi qua",
    "fruit",
    "3",
  ],
  pre_harvest: [
    "trước thu hoạch",
    "truoc thu hoach",
    "pre harvest",
    "pre-harvest",
    "4",
  ],
  post_harvest: ["sau thu hoạch", "sau thu hoach", "post harvest", "5"],
};

export const PHASE_IDS = [
  "growth_development",
  "flowering",
  "fruiting",
  "pre_harvest",
  "post_harvest",
];

export const CYCLE_PHASE_IDS = PHASE_IDS.slice(1);

export const LIFECYCLE_COLOR_LOOKUP = {
  emerald: "#059669",
  pink: "#ec4899",
  lime: "#84cc16",
  amber: "#f59e0b",
  teal: "#14b8a6",
  slate: "#475569",
};

export const LIFECYCLE_COLOR_OPTIONS = [
  { value: "emerald", label: "Lá non", className: "bg-emerald-500" },
  { value: "pink", label: "Hoa hồng", className: "bg-pink-500" },
  { value: "lime", label: "Trái non", className: "bg-lime-500" },
  { value: "amber", label: "Nắng sớm", className: "bg-amber-500" },
  { value: "teal", label: "Mát lành", className: "bg-teal-500" },
  { value: "slate", label: "Trung tính", className: "bg-slate-500" },
];

export const LIFECYCLE_LINE_STYLES = [
  { value: "solid", label: "Nét liền" },
  { value: "dashed", label: "Nét đứt" },
];

export const DEFAULT_PHASE_THEME = {
  growth_development: {
    phaseId: "growth_development",
    label: "Sinh trưởng & Phát triển",
    icon: "🌱",
    colorKey: "emerald",
    lineStyle: "solid",
  },
  flowering: {
    phaseId: "flowering",
    label: "Ra Hoa",
    icon: "🌸",
    colorKey: "pink",
    lineStyle: "solid",
  },
  fruiting: {
    phaseId: "fruiting",
    label: "Đậu quả",
    icon: "🍈",
    colorKey: "lime",
    lineStyle: "solid",
  },
  pre_harvest: {
    phaseId: "pre_harvest",
    label: "Trước thu hoạch",
    icon: "🌾",
    colorKey: "amber",
    lineStyle: "solid",
  },
  post_harvest: {
    phaseId: "post_harvest",
    label: "Sau thu hoạch",
    icon: "🍂",
    colorKey: "teal",
    lineStyle: "solid",
  },
};

export function normalizePhaseId(value) {
  if (!value) return "growth_development";
  const raw = String(value).trim().toLowerCase();
  if (PHASE_ID_ALIASES[raw]) return raw;
  for (const [id, aliases] of Object.entries(PHASE_ID_ALIASES)) {
    if (id === raw || aliases.includes(raw)) return id;
  }
  return "growth_development";
}

export function mapPhaseIdFromText(text = "") {
  return normalizePhaseId(text);
}

function normalizeColorKey(value) {
  if (!value) return undefined;
  const key = String(value).trim().toLowerCase();
  return LIFECYCLE_COLOR_LOOKUP[key] ? key : undefined;
}

function normalizeLineStyle(value) {
  if (!value) return "solid";
  const style = String(value).trim().toLowerCase();
  return style === "dashed" ? "dashed" : "solid";
}

export function normalizeLifecycleTheme(input) {
  if (!input) return {};

  let data = input;
  if (typeof input === "string") {
    try {
      data = JSON.parse(input);
    } catch {
      return {};
    }
  }

  const entries = Array.isArray(data)
    ? data
    : typeof data === "object"
    ? Object.values(data)
    : [];

  return entries.reduce((map, raw) => {
    if (!raw) return map;
    const phaseId = normalizePhaseId(
      raw.phaseId || raw.id || raw.stage || raw.name
    );
    const base = DEFAULT_PHASE_THEME[phaseId] || {};
    map[phaseId] = {
      phaseId,
      label: raw.label || raw.stage || base.label,
      subtitle: raw.subtitle || raw.timing || "",
      description: raw.description || raw.action || "",
      icon: raw.icon || base.icon,
      colorKey: normalizeColorKey(
        raw.colorKey || raw.nodeColor || raw.lineColorKey || raw.lineColor
      ) || base.colorKey,
      lineColorKey:
        normalizeColorKey(raw.lineColorKey || raw.lineColor) ||
        normalizeColorKey(raw.colorKey || raw.nodeColor) ||
        base.colorKey,
      lineStyle: normalizeLineStyle(raw.lineStyle),
      durationMs: Number(raw.durationMs) > 0 ? Number(raw.durationMs) : null,
      order:
        typeof raw.order === "number"
          ? raw.order
          : PHASE_IDS.indexOf(phaseId),
    };
    return map;
  }, {});
}

export function serializeLifecycleTheme(phases) {
  if (!Array.isArray(phases)) return "[]";

  const payload = phases
    .filter((phase) => phase && phase.phaseId)
    .map((phase, index) => {
      const phaseId = normalizePhaseId(phase.phaseId);
      const base = DEFAULT_PHASE_THEME[phaseId] || {};
      const colorKey =
        normalizeColorKey(phase.colorKey) || base.colorKey || "emerald";
      const lineColorKey =
        normalizeColorKey(phase.lineColorKey) || colorKey || base.colorKey;
      const durationMs =
        Number(phase.durationMs) > 0 ? Number(phase.durationMs) : null;
      return {
        id: phase.id || `${phaseId}-${index}`,
        order:
          typeof phase.order === "number" ? phase.order : PHASE_IDS.indexOf(phaseId),
        phaseId,
        label: phase.label?.trim() || base.label,
        stage: phase.label?.trim() || base.label,
        subtitle: phase.subtitle || "",
        timing: phase.subtitle || "",
        description: phase.description || "",
        action: phase.description || "",
        icon: phase.icon || base.icon,
        colorKey,
        nodeColor: colorKey,
        lineColorKey,
        lineColor: lineColorKey,
        lineStyle: normalizeLineStyle(phase.lineStyle),
        durationMs,
      };
    });

  return JSON.stringify(payload);
}

export function getOrderedPhases(themeMap) {
  const rows = PHASE_IDS.map((phaseId, index) => {
    const override = themeMap?.[phaseId];
    const base = DEFAULT_PHASE_THEME[phaseId];
    return {
      id: `${phaseId}-${index}`,
      phaseId,
      label: override?.label || base.label,
      subtitle: override?.subtitle || "",
      description: override?.description || "",
      icon: override?.icon || base.icon,
      colorKey: override?.colorKey || base.colorKey,
      lineColorKey: override?.lineColorKey || override?.colorKey || base.colorKey,
      lineStyle: override?.lineStyle || base.lineStyle || "solid",
      durationMs: override?.durationMs || 1150,
      order:
        typeof override?.order === "number" ? override.order : index,
    };
  });

  return rows.sort((a, b) => a.order - b.order);
}

