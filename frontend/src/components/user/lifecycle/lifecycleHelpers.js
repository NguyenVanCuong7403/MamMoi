// =========================================================================
// Phase ID Aliases & Helpers
// =========================================================================

export const PHASE_ID_ALIASES = {
  growth_development: [
    "growth",
    "sinh trưởng",
    "sinh truong",
    "phát triển",
    "phat trien",
    "sinh trưởng & phát triển",
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

/**
 * Chuẩn hoá phaseId từ nhiều nguồn (DB / theme) về 5 giá trị chuẩn backend chấp nhận
 * Ví dụ: "post_harvest_4" -> "post_harvest"
 */
export function normalizePhaseId(x) {
  if (!x) return "growth_development";
  const raw = String(x).trim();
  const s = raw.toLowerCase();

  // 1) Nếu đã là key chuẩn trong bảng alias
  if (PHASE_ID_ALIASES[s]) return s;

  // 2) Nếu trùng alias tiếng Việt / số thứ tự
  for (const [id, aliases] of Object.entries(PHASE_ID_ALIASES)) {
    if (id === s || aliases.includes(s)) return id;
  }

  // 3) Nếu là biến thể có hậu tố: "flowering_2", "post_harvest-4", ...
  for (const id of Object.keys(PHASE_ID_ALIASES)) {
    if (s === id) return id;
    if (s.startsWith(id + "_") || s.startsWith(id + "-")) {
      return id;
    }
  }

  return "growth_development";
}

export function mapPhaseIdFromText(txt = "") {
  return normalizePhaseId(txt);
}

export function toDateOnlyString(d) {
  if (!d) return null;
  if (typeof d === "string") return d; // đã là "yyyy-MM-dd"
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return null;
}

// Utility: flush RAF
export const flush = () =>
  new Promise((rs) => requestAnimationFrame(() => requestAnimationFrame(rs)));

// Utility: wait
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

