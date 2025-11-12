// src/lib/treePhase.js

// 5 giai đoạn chuẩn dùng chung
export const PHASES = [
  "Sinh trưởng & Phát triển",
  "Ra hoa",
  "Ra quả",
  "Trước thu hoạch",
  "Sau thu hoạch",
];

export function isValidPhase(p) {
  return PHASES.includes(p);
}

// Tính phase ban đầu (seed) – đủ tốt để khởi tạo UI,
// dựa trên tổng tuổi hoặc ngày trồng nếu có.
// Bạn có thể tinh chỉnh ngưỡng theo loài/vùng/đất nếu muốn.
export function computeInitialPhase(
  { totalAge, plantingDate } = {},
  now = new Date()
) {
  const age =
    Number.isFinite(totalAge) && totalAge >= 0
      ? totalAge
      : monthsBetween(plantingDate, now);

  if (age < 18) return "Sinh trưởng & Phát triển";
  if (age < 30) return "Ra hoa";
  if (age < 48) return "Ra quả";
  if (age < 60) return "Trước thu hoạch";
  return "Sau thu hoạch";
}

// Chuẩn hoá trước khi lưu: đảm bảo phase hợp lệ,
// fallback sang computeInitialPhase nếu thiếu/sai,
// và loại các field tạm của UI.
export function normalizePhaseBeforeSave(payload, now = new Date()) {
  const out = { ...payload };

  if (!isValidPhase(out.phase)) {
    out.phase = computeInitialPhase(
      { totalAge: out.ageMonths, plantingDate: out.plantDate },
      now
    );
  }

  // bỏ field tạm của UI nếu có
  delete out.previewPhase;
  delete out.activePhase;
  delete out.phaseOverride;

  return out;
}

/* ---------- helpers ---------- */
function monthsBetween(aStr, b = new Date()) {
  if (!aStr) return 0;
  const a = new Date(aStr + "T00:00:00");
  if (Number.isNaN(a.getTime())) return 0;
  let m =
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
}
