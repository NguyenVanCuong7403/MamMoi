// src/components/tree/demoTrees.js
const LOCATION = "FPT";
const CARETAKER = "Quân";

/* Giữ 2 theme này nếu TreeDetail cần dùng */
export const TYPE_THEME = {
  water: { name: "Tưới tiêu", pill: "bg-emerald-50 text-emerald-800 border-emerald-300", edge: "border-emerald-500", activeBtn: "bg-emerald-600 text-white hover:bg-emerald-700" },
  fert:  { name: "Phân bón", pill: "bg-amber-50 text-amber-800 border-amber-300", edge: "border-amber-500", activeBtn: "bg-amber-600 text-white hover:bg-amber-700" },
  pest:  { name: "Sâu bệnh", pill: "bg-rose-50 text-rose-800 border-rose-300", edge: "border-rose-500", activeBtn: "bg-rose-600 text-white hover:bg-rose-700" },
  other: { name: "Công việc khác", pill: "bg-slate-50 text-slate-800 border-slate-300", edge: "border-slate-500", activeBtn: "bg-slate-700 text-white hover:bg-slate-800" },
};

export const STATUS_THEME = {
  active:  { pill: "bg-emerald-50 text-emerald-800 border-emerald-300", title: "Đang chăm sóc", desc: "Cây tiếp tục nhận nhắc việc, gợi ý và tính quá hạn bình thường." },
  stopped: { pill: "bg-rose-50 text-rose-800 border-rose-300", title: "Dừng hoạt động", desc: "Ngừng mọi nhắc việc/gợi ý. Cây chỉ hiển thị để tra cứu lịch sử." },
};

/* ====== DỮ LIỆU GỐC (copy từ TreeDetail) ====== */
const RAW_TREES = {
  "T-001": {
    id: "T-001",
    name: "Xoài",
    variety: "Cát chu",
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
      { id: 101, type: "water", title: "Tưới giữ ẩm 70–80%", due: "2025-10-15", details: ["10–12L/cây", "Kiểm tra ẩm 20–30cm"] },
      { id: 102, type: "fert",  title: "Bón gốc NPK 16-16-8",  due: "2025-10-18", details: ["200–300g/cây", "Rải đều theo tán"] },
      { id: 103, type: "pest",  title: "Theo dõi rầy chổng cánh", due: "2025-10-20", details: ["Bẫy dính vàng", "Ghi ảnh mẫu"] },
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
      "https://images.unsplash.com/photo-1613758947306-0cb0d5859d6?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKER,
    planned: [
      { id: 201, type: "water", title: "Tưới giữ ẩm 70–80%", due: "2025-10-16", details: ["8–10L/cây"] },
      { id: 202, type: "pest",  title: "Theo dõi bệnh Greening", due: "2025-10-17", details: ["Khảo sát lá, ghi chép"] },
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

/* ====== Chuyển dữ liệu về format dùng cho TreeManagement ====== */
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1524594227085-47981f36b8cf?q=80&w=1200&auto=format&fit=crop";

const _startOfDay = (d = new Date()) => {
  const x = new Date(d); x.setHours(0,0,0,0); return x;
};

function formatDueVi(isoDate) {
  if (!isoDate) return "Nhắc";
  const today = _startOfDay();
  const due = _startOfDay(new Date(isoDate + "T00:00:00"));
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0) return `Quá hạn ${Math.abs(diff)} ngày`;
  if (diff === 0) return "Hôm nay";
  if (diff === 1) return "Ngày mai";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function toManagementTree(t) {
  return {
    id: t.id,
    commonName: t.name || t.commonName || "",
    variety: t.variety || "",
    plantedAt: t.plantedAt,
    location: t.plot || t.location || "Không rõ vườn",
    phase: t.phenology?.stage || t.phase || "",
    status: t.status || "active",
    caretaker: t.caretaker || CARETAKER,
    stateNote: t.phenology?.status || "",
    img: (t.gallery && t.gallery[0]) || FALLBACK_IMG,
    todos: (t.planned || []).map((p) => ({
      text: p.title,
      priority: "medium",
      due: formatDueVi(p.due),
    })),
  };
}

/* MẢNG: dùng nếu bạn muốn giữ mọi cây rồi lọc theo gardenName ở UI */
export const TREES = Object.values(RAW_TREES).map(toManagementTree);

/* NHÓM THEO VƯỜN: dùng nếu muốn lấy thẳng danh sách theo tên vườn */
function normalizeKey(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // bỏ dấu
    .replace(/[–—-]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export const TREES_BY_GARDEN = TREES.reduce((acc, t) => {
  const keys = new Set([
    normalizeKey(t.location),                    // "vuon so 1 — fpt"
    normalizeKey((t.location || "").split("—")[0]), // "vuon so 1"
    normalizeKey(LOCATION),                      // "fpt"
  ]);
  for (const k of keys) {
    if (!k) continue;
    if (!acc[k]) acc[k] = [];
    acc[k].push(t);
  }
  if (!acc.all) acc.all = [];
  acc.all.push(t);
  return acc;
}, {});

/* Default export nếu nơi khác muốn lấy RAW_TREES */
export default RAW_TREES;
