/* Auto-generated from your existing TreeDetail.jsx demo data.
   Centralized demo dataset so all screens can import consistently.
   Place this file at: src/data/demoTrees.js
*/

// ✅ THÊM 2 HẰNG SỐ DEMO (trước khi export TREES)
export const LOCATION = {
  label: "Vườn số 1 — FPT Long Thành, Đồng Nai",
  lat: 10.82,
  lng: 106.63,
  address: "FPT Campus, Long Thành, Đồng Nai",
};

export const CARETAKER = {
  id: "CT-001",
  name: "Trần Minh Hòa",
  phone: "0901 234 567",
};

export const TREES = {
  "T-001": {
    id: "T-001",
    name: "Xoài ",
    variety: "Cát chu",
    plantedAt: "2023-04-15",
    preNurseryAgeMonths: 5,
    phase: "Sinh trưởng thân lá",
    status: "active",
    location: LOCATION,              // dùng hằng số đã khai báo
    plot: "Vườn số 1 — FPT",
    region: "Miền Nam",
    soil: "Đất phù sa cao ráo",
    gallery: [
      "https://images.unsplash.com/photo-1591781862772-b0b6b1f88b68?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKER,            // dùng hằng số đã khai báo
    planned: [
      {
        id: 101,
        type: "water",
        title: "Tưới giữ ẩm 70–80%",
        due: "2025-10-15",
        details: ["10–12L/cây", "Kiểm tra ẩm 20–30cm"],
      },
      {
        id: 102,
        type: "fert",
        title: "Bón gốc NPK 16-16-8",
        due: "2025-10-18",
        details: ["200–300g/cây", "Rải đều theo tán"],
      },
      {
        id: 103,
        type: "pest",
        title: "Theo dõi rầy chổng cánh",
        due: "2025-10-20",
        details: ["Bẫy dính vàng", "Ghi ảnh mẫu"],
      },
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
    name: "Bưởi",
    variety: "Da xanh",
    plantedAt: "2020-08-20",
    preNurseryAgeMonths: 8,
    phase: " trước thu hoạch",
    status: "active",
    location: LOCATION,
    plot: "Vườn số 3 — FPT",
    region: "Miền Nam",
    soil: "Đất thịt thoát nước tốt",
    gallery: [
      "https://images.unsplash.com/photo-1613758947306-0cb0d585b9d6?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKER,
    planned: [
      {
        id: 201,
        type: "water",
        title: "Tưới giữ ẩm 70–80%",
        due: "2025-10-16",
        details: ["8–10L/cây"],
      },
      {
        id: 202,
        type: "pest",
        title: "Theo dõi bệnh Greening",
        due: "2025-10-17",
        details: ["Khảo sát lá, ghi chép"],
      },
    ],
    phenology: {
      stage: "trước thu hoạch",
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

export const TREES_ARRAY = Object.values(TREES);

// ✅ Map demo: tất cả cây đều thuộc 1 vườn G-001 (cho màn TreeManagement)
export const TREES_BY_GARDEN = {
  "G-001": TREES_ARRAY,
};

/** Get a tree by id. Accepts 'T-001' style strings. */
export function getTreeById(id) {
  if (!id) return null;
  const sid = String(id);
  return TREES[sid] || TREES_ARRAY.find(t => String(t?.id) === sid) || null; // === cho chắc
}

/** Get all trees as an array. */
export function getAllTrees() {
  return TREES_ARRAY;
}
