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

const BASE_COLORS = [
  {
    key: "emerald",
    label: "Lá non",
    hex: "#059669",
    className: "bg-emerald-500",
  },
  { key: "pink", label: "Hoa hồng", hex: "#ec4899", className: "bg-pink-500" },
  { key: "lime", label: "Trái non", hex: "#84cc16", className: "bg-lime-500" },
  {
    key: "amber",
    label: "Nắng sớm",
    hex: "#f59e0b",
    className: "bg-amber-500",
  },
  { key: "teal", label: "Mát lành", hex: "#14b8a6", className: "bg-teal-500" },
  {
    key: "slate",
    label: "Trung tính",
    hex: "#475569",
    className: "bg-slate-500",
  },
];

export const LIFECYCLE_COLOR_OPTIONS = BASE_COLORS;

export const LIFECYCLE_COLOR_LOOKUP = BASE_COLORS.reduce((map, color) => {
  map[color.key] = color.hex;
  return map;
}, {});

const LIFECYCLE_COLOR_HEX_TO_KEY = BASE_COLORS.reduce((map, color) => {
  map[color.hex.toLowerCase()] = color.key;
  return map;
}, {});

const HEX_COLOR_REGEX = /^#([0-9a-f]{6})$/i;

export const LIFECYCLE_LINE_STYLES = [
  { value: "solid", label: "Nét liền" },
  { value: "dashed", label: "Nét đứt" },
];

// NOTE: Removed DEFAULT_PHASE_THEME — do not provide implicit UI defaults here.
// Theme values should come explicitly from `themeMap` / `phaseTheme` provided by callers.

export function normalizePhaseId(value) {
  // Do not assume a default canonical phase when value is missing or not recognized.
  // Return `null` so callers can decide whether to fallback or keep "no value".
  if (!value) return null;
  const raw = String(value).trim().toLowerCase();
  if (PHASE_ID_ALIASES[raw]) return raw;
  for (const [id, aliases] of Object.entries(PHASE_ID_ALIASES)) {
    if (id === raw || aliases.includes(raw)) return id;
  }
  return null;
}

export function mapPhaseIdFromText(text = "") {
  return normalizePhaseId(text);
}

function normalizeColorKey(value) {
  return resolveColorKey(value);
}

function normalizeLineStyle(value) {
  if (!value) return "solid";
  const style = String(value).trim().toLowerCase();
  return style === "dashed" ? "dashed" : "solid";
}

function resolveColorKey(value) {
  if (!value) return undefined;
  const raw = String(value).trim().toLowerCase();
  if (LIFECYCLE_COLOR_LOOKUP[raw]) return raw;
  if (LIFECYCLE_COLOR_HEX_TO_KEY[raw]) return LIFECYCLE_COLOR_HEX_TO_KEY[raw];
  if (HEX_COLOR_REGEX.test(raw) && LIFECYCLE_COLOR_HEX_TO_KEY[raw]) {
    return LIFECYCLE_COLOR_HEX_TO_KEY[raw];
  }
  return undefined;
}

export function getColorKeyFromHex(hexValue) {
  if (!hexValue) return undefined;
  const raw = String(hexValue).trim().toLowerCase();
  return LIFECYCLE_COLOR_HEX_TO_KEY[raw];
}

function normalizeColorHex(value, fallbackKey) {
  if (value) {
    const raw = String(value).trim().toLowerCase();
    if (HEX_COLOR_REGEX.test(raw)) {
      return raw;
    }
    if (LIFECYCLE_COLOR_LOOKUP[raw]) {
      return LIFECYCLE_COLOR_LOOKUP[raw];
    }
    if (LIFECYCLE_COLOR_HEX_TO_KEY[raw]) {
      const mappedKey = LIFECYCLE_COLOR_HEX_TO_KEY[raw];
      return LIFECYCLE_COLOR_LOOKUP[mappedKey];
    }
  }

  const normalizedKey = resolveColorKey(value) || fallbackKey;
  if (normalizedKey && LIFECYCLE_COLOR_LOOKUP[normalizedKey]) {
    return LIFECYCLE_COLOR_LOOKUP[normalizedKey];
  }
  return LIFECYCLE_COLOR_LOOKUP.emerald;
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

  // Nếu là mảng và có nhiều phase, giữ nguyên tất cả (kể cả khi phaseId trùng)
  // Sử dụng index làm key để tránh mất phase khi phaseId trùng
  if (Array.isArray(data) && data.length > 0) {
    return entries.reduce((map, raw, index) => {
      if (!raw) return map;
      // Giữ nguyên phaseId nếu nó là custom (bắt đầu bằng 'custom_')
      // Chỉ normalize nếu phaseId là phaseId chuẩn
      const rawPhaseId = raw.phaseId || raw.id || raw.stage || raw.name;
      let phaseId;
      if (
        rawPhaseId &&
        typeof rawPhaseId === "string" &&
        rawPhaseId.startsWith("custom_")
      ) {
        // Giữ nguyên custom phaseId
        phaseId = rawPhaseId;
      } else {
        // Normalize phaseId chuẩn
        phaseId = normalizePhaseId(rawPhaseId);
      }
      const stageId =
        raw.stageId ??
        raw.stage_id ??
        raw.StageId ??
        raw.rawStage?.stageId ??
        raw.rawStage?.StageId ??
        null;
      const stageOrder =
        raw.stageOrder ??
        raw.stage_order ??
        raw.order ??
        raw.StageOrder ??
        index;
      const canonicalPhaseId = raw.canonicalPhaseId || phaseId;
      const base = {}; // no implicit defaults
      const colorKey =
        normalizeColorKey(
          raw.colorKey || raw.nodeColor || raw.lineColorKey || raw.lineColor
        ) || base.colorKey;
      const colorHex = normalizeColorHex(
        raw.colorHex || raw.nodeColor || raw.colorKey || raw.color,
        colorKey || base.colorKey
      );
      const lineColorKey =
        normalizeColorKey(raw.lineColorKey || raw.lineColor) || colorKey;
      const lineColorHex = normalizeColorHex(
        raw.lineColorHex ||
          raw.lineColor ||
          raw.lineColorKey ||
          raw.colorHex ||
          raw.color,
        lineColorKey || colorKey
      );
      // Sử dụng index trong key để tránh mất phase khi phaseId trùng
      const mapKey = `${phaseId}_${index}`;
      map[mapKey] = {
        phaseId,
        canonicalPhaseId,
        label: raw.label || raw.stage || base.label,
        subtitle: raw.subtitle || raw.timing || "",
        description: raw.description || raw.action || "",
        icon: raw.icon || base.icon,
        iconImageUrl: raw.iconImageUrl || raw.iconUrl || null,
        colorKey: colorKey || base.colorKey,
        colorHex: colorHex || base.colorHex,
        lineColorKey: lineColorKey || colorKey || base.colorKey,
        lineColorHex: lineColorHex || colorHex,
        lineStyle: normalizeLineStyle(raw.lineStyle),
        durationMs: Number(raw.durationMs) > 0 ? Number(raw.durationMs) : null,
        order:
          typeof raw.order === "number"
            ? raw.order
            : typeof raw.order === "number"
            ? raw.order
            : index,
        stageId,
        stageOrder,
        rawStage: raw.rawStage || raw,
      };
      return map;
    }, {});
  }

  // Xử lý object như cũ
  return entries.reduce((map, raw) => {
    if (!raw) return map;
    // Giữ nguyên phaseId nếu nó là custom (bắt đầu bằng 'custom_')
    // Chỉ normalize nếu phaseId là phaseId chuẩn
    const rawPhaseId = raw.phaseId || raw.id || raw.stage || raw.name;
    let phaseId;
    if (
      rawPhaseId &&
      typeof rawPhaseId === "string" &&
      rawPhaseId.startsWith("custom_")
    ) {
      // Giữ nguyên custom phaseId
      phaseId = rawPhaseId;
    } else {
      // Normalize phaseId chuẩn
      phaseId = normalizePhaseId(rawPhaseId);
    }
    const base = {}; // no implicit defaults
    const colorKey =
      normalizeColorKey(
        raw.colorKey || raw.nodeColor || raw.lineColorKey || raw.lineColor
      ) || base.colorKey;
    const colorHex = normalizeColorHex(
      raw.colorHex || raw.nodeColor || raw.colorKey || raw.color,
      colorKey || base.colorKey
    );
    const lineColorKey =
      normalizeColorKey(raw.lineColorKey || raw.lineColor) || colorKey;
    const lineColorHex = normalizeColorHex(
      raw.lineColorHex ||
        raw.lineColor ||
        raw.lineColorKey ||
        raw.colorHex ||
        raw.color,
      lineColorKey || colorKey
    );
    map[phaseId] = {
      phaseId,
      canonicalPhaseId: raw.canonicalPhaseId || phaseId,
      label: raw.label || raw.stage || base.label,
      subtitle: raw.subtitle || raw.timing || "",
      description: raw.description || raw.action || "",
      icon: raw.icon || base.icon,
      iconImageUrl: raw.iconImageUrl || raw.iconUrl || null,
      colorKey: colorKey || base.colorKey,
      colorHex: colorHex || base.colorHex,
      lineColorKey: lineColorKey || colorKey || base.colorKey,
      lineColorHex: lineColorHex || colorHex,
      lineStyle: normalizeLineStyle(raw.lineStyle),
      durationMs: Number(raw.durationMs) > 0 ? Number(raw.durationMs) : null,
      order:
        typeof raw.order === "number" ? raw.order : PHASE_IDS.indexOf(phaseId),
      stageId:
        raw.stageId ??
        raw.stage_id ??
        raw.StageId ??
        raw.rawStage?.stageId ??
        raw.rawStage?.StageId ??
        null,
      stageOrder:
        raw.stageOrder ??
        raw.stage_order ??
        raw.StageOrder ??
        raw.order ??
        PHASE_IDS.indexOf(phaseId),
      rawStage: raw.rawStage || raw,
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
      const base = {}; // no implicit defaults
      const colorKey =
        normalizeColorKey(phase.colorKey) || base.colorKey || "emerald";
      const lineColorKey =
        normalizeColorKey(phase.lineColorKey) || colorKey || base.colorKey;
      const colorHex = normalizeColorHex(
        phase.colorHex || phase.nodeColor || phase.colorKey,
        colorKey
      );
      const lineColorHex = normalizeColorHex(
        phase.lineColorHex || phase.lineColorKey || phase.lineColor,
        lineColorKey
      );
      const durationMs =
        Number(phase.durationMs) > 0 ? Number(phase.durationMs) : null;
      return {
        id: phase.id || `${phaseId}-${index}`,
        order:
          typeof phase.order === "number"
            ? phase.order
            : PHASE_IDS.indexOf(phaseId),
        phaseId,
        label: phase.label?.trim() || base.label,
        stage: phase.label?.trim() || base.label,
        subtitle: phase.subtitle || "",
        timing: phase.subtitle || "",
        description: phase.description || "",
        action: phase.description || "",
        icon: phase.icon || base.icon,
        iconImageUrl: phase.iconImageUrl || null,
        colorKey,
        nodeColor: colorHex,
        lineColorKey,
        lineColor: lineColorHex,
        colorHex,
        lineColorHex,
        lineStyle: normalizeLineStyle(phase.lineStyle),
        durationMs,
      };
    });

  return JSON.stringify(payload);
}

export function getOrderedPhases(themeMap, options = {}) {
  const allowPartial = Boolean(options.allowPartial);
  const entries = Object.values(themeMap || {});

  // If there is no theme override and partial mode is not requested,
  // do NOT return the default PHASE_IDS rows. This prevents components
  // from loading the default 4 cycle phases when no theme is provided.
  if (
    !allowPartial &&
    (!themeMap || Object.keys(themeMap || {}).length === 0)
  ) {
    return [];
  }

  if (allowPartial && entries.length > 0) {
    return entries
      .map((override, index) => {
        const phaseId =
          override?.phaseId || PHASE_IDS[index] || `custom_${index}`;
        const base = {}; // no implicit defaults
        const order =
          typeof override?.order === "number"
            ? override.order
            : typeof base.order === "number"
            ? base.order
            : index;
        const colorKey =
          normalizeColorKey(override?.colorKey || override?.nodeColor) ||
          base.colorKey ||
          "emerald";
        const colorHex = normalizeColorHex(
          override?.colorHex || override?.nodeColor || override?.colorKey,
          colorKey
        );
        const lineColorKey =
          normalizeColorKey(override?.lineColorKey || override?.lineColor) ||
          colorKey;
        const lineColorHex = normalizeColorHex(
          override?.lineColorHex ||
            override?.lineColor ||
            override?.lineColorKey ||
            override?.colorHex,
          lineColorKey || colorKey
        );

        return {
          id: `${phaseId}-${index}`,
          phaseId,
          canonicalPhaseId: override?.canonicalPhaseId || phaseId,
          stageId: override?.stageId ?? override?.rawStage?.stageId ?? null,
          stageOrder:
            override?.stageOrder ?? override?.rawStage?.stageOrder ?? index + 1,
          label: override?.label || base.label || phaseId,
          subtitle: override?.subtitle || "",
          description: override?.description || "",
          icon: override?.icon || base.icon || "🌿",
          iconImageUrl: override?.iconImageUrl || null,
          colorKey,
          colorHex,
          lineColorKey,
          lineColorHex,
          lineStyle: override?.lineStyle || base.lineStyle || "solid",
          durationMs: override?.durationMs || base.durationMs || 1150,
          order,
        };
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const rows = PHASE_IDS.map((phaseId, index) => {
    const override = themeMap?.[phaseId];
    const base = {}; // do not inject defaults
    const colorKey =
      normalizeColorKey(override?.colorKey || override?.nodeColor) ||
      base.colorKey ||
      "emerald";
    const colorHex = normalizeColorHex(
      override?.colorHex || override?.nodeColor || override?.colorKey,
      colorKey
    );
    const lineColorKey =
      normalizeColorKey(override?.lineColorKey || override?.lineColor) ||
      colorKey;
    const lineColorHex = normalizeColorHex(
      override?.lineColorHex ||
        override?.lineColor ||
        override?.lineColorKey ||
        override?.colorHex,
      lineColorKey || colorKey
    );
    return {
      id: `${phaseId}-${index}`,
      phaseId,
      canonicalPhaseId: phaseId,
      stageId: override?.stageId ?? null,
      stageOrder: override?.stageOrder ?? index + 1,
      label: override?.label || base.label,
      subtitle: override?.subtitle || "",
      description: override?.description || "",
      icon: override?.icon || base.icon,
      iconImageUrl: override?.iconImageUrl || null,
      colorKey,
      colorHex,
      lineColorKey,
      lineColorHex,
      lineStyle: override?.lineStyle || base.lineStyle || "solid",
      durationMs: override?.durationMs || 1150,
      order: typeof override?.order === "number" ? override.order : index,
    };
  });

  return rows.sort((a, b) => a.order - b.order);
}
