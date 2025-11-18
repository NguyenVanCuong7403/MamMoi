/* src/data/demoTrees.js
 * Demo data dùng chung cho mọi màn (TreeDetail, TreeManagement, GardenManagement,...)
 * Về sau khi có API/DB bạn chỉ cần giữ nguyên shape object (id, gardenId, name, ...) là thay nguồn là xong.
 */

/* =======================
   GARDENS (vườn demo)
   ======================= */

export const GARDENS = {
  "G-001": {
    id: "G-001",
    name: "Vườn số 1 FPT Long Thành",
    shortName: "Vườn số 1 FPT",
    province: "Đồng Nai",
    district: "Long Thành",
    ward: "An Phước",
    address: "FPT Campus, Long Thành, Đồng Nai",
    lat: 10.82,
    lng: 106.63,
    region: "Miền Nam",
  },
  "G-002": {
    id: "G-002",
    name: "Vườn số 2 FPT Hòa Bình",
    shortName: "Vườn số 2 FPT",
    province: "Hòa Bình",
    district: "Lương Sơn",
    ward: "Tiến Xuân",
    address: "Khu đồi FPT, Lương Sơn, Hòa Bình",
    lat: 20.92,
    lng: 105.5,
    region: "Miền Bắc",
  },
  "G-003": {
    id: "G-003",
    name: "Vườn số 3 FPT Bắc Giang",
    shortName: "Vườn số 3 FPT",
    province: "Bắc Giang",
    district: "Lục Ngạn",
    ward: "Thanh Hải",
    address: "Vùng vải thiều FPT, Lục Ngạn, Bắc Giang",
    lat: 21.37,
    lng: 106.78,
    region: "Miền Bắc",
  },
  "G-004": {
    id: "G-004",
    name: "Vườn số 4 FPT Đắk Lắk",
    shortName: "Vườn số 4 FPT",
    province: "Đắk Lắk",
    district: "Cư M’gar",
    ward: "Ea Kuăng",
    address: "Trang trại cà phê FPT, Cư M’gar, Đắk Lắk",
    lat: 12.86,
    lng: 108.05,
    region: "Tây Nguyên",
  },
};

export const GARDENS_ARRAY = Object.values(GARDENS);

/* =======================
   CARETAKERS (người chăm)
   ======================= */

export const CARETAKERS = {
  "CT-001": {
    id: "CT-001",
    name: "Trần Minh Hòa",
    phone: "0901 234 567",
  },
  "CT-002": {
    id: "CT-002",
    name: "Nguyễn Thị Lan",
    phone: "0902 345 678",
  },
  "CT-003": {
    id: "CT-003",
    name: "Phạm Văn Khánh",
    phone: "0903 456 789",
  },
  "CT-004": {
    id: "CT-004",
    name: "Lê Thu Hương",
    phone: "0904 567 890",
  },
};

/* Để tương thích với code cũ (nếu có import LOCATION/CARETAKER) */
export const LOCATION = {
  label: GARDENS["G-001"].name,
  lat: GARDENS["G-001"].lat,
  lng: GARDENS["G-001"].lng,
  address: GARDENS["G-001"].address,
};
export const CARETAKER = CARETAKERS["CT-001"];

/* =======================
   TREES (cây ăn quả demo)
   ======================= */

export const TREES = {
  // ====== VƯỜN G-001: xoài, sầu riêng, bưởi ======
  "T-001": {
    id: "T-001",
    gardenId: "G-001",
    name: "Xoài Cát Chu 01",
    variety: "Xoài Cát Chu",
    plantedAt: "2023-04-15",
    preNurseryAgeMonths: 5,
    phase: "Sinh trưởng thân lá",
    status: "active",
    location: {
      label: GARDENS["G-001"].name,
      lat: GARDENS["G-001"].lat,
      lng: GARDENS["G-001"].lng,
      address: GARDENS["G-001"].address,
    },
    plot: GARDENS["G-001"].shortName,
    region: GARDENS["G-001"].region,
    soil: "Đất phù sa cao ráo",
    gallery: [
      "https://images.unsplash.com/photo-1591781862772-b0b6b1f88b68?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKERS["CT-001"],
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

  "T-002": {
    id: "T-002",
    gardenId: "G-001",
    name: "Sầu riêng Ri6 01",
    variety: "Ri6",
    plantedAt: "2022-07-10",
    preNurseryAgeMonths: 10,
    phase: "Ra hoa",
    status: "active",
    location: {
      label: GARDENS["G-001"].name,
      lat: GARDENS["G-001"].lat,
      lng: GARDENS["G-001"].lng,
      address: GARDENS["G-001"].address,
    },
    plot: GARDENS["G-001"].shortName,
    region: GARDENS["G-001"].region,
    soil: "Đất thịt pha cát, thoát nước tốt",
    gallery: [
      "https://images.unsplash.com/photo-1626200847920-0efeb6c50498?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKERS["CT-001"],
    planned: [
      {
        id: 104,
        type: "water",
        title: "Tưới nhỏ giọt ẩm 70%",
        due: "2025-10-16",
        details: ["8–10L/cây", "Không để úng gốc"],
      },
      {
        id: 105,
        type: "fert",
        title: "Bón phân hữu cơ hoai mục",
        due: "2025-10-25",
        details: ["5–7kg/cây", "Kết hợp xới nhẹ quanh tán"],
      },
    ],
    phenology: {
      stage: "Ra hoa",
      status: "Hoa ra đều, tỷ lệ đậu tốt",
      prevCare: "Cắt tỉa cành trong tán, vệ sinh vườn",
      leafRootNote: "Lá xanh đậm, cành khoẻ",
      seasonNote: "Cuối mùa mưa, ẩm độ cao",
      workLog: "12/10 kiểm tra sâu bệnh; 05/10 bón hữu cơ",
      events: [
        { d: "2025-09-20", note: "Kích thích ra hoa" },
        { d: "2025-08-15", note: "Bón phân nuôi tán" },
      ],
    },
  },

  "T-003": {
    id: "T-003",
    gardenId: "G-001",
    name: "Bưởi Da Xanh 01",
    variety: "Bưởi da xanh",
    plantedAt: "2020-08-20",
    preNurseryAgeMonths: 8,
    phase: "Trước thu hoạch",
    status: "active",
    location: {
      label: GARDENS["G-001"].name,
      lat: GARDENS["G-001"].lat,
      lng: GARDENS["G-001"].lng,
      address: GARDENS["G-001"].address,
    },
    plot: GARDENS["G-001"].shortName,
    region: GARDENS["G-001"].region,
    soil: "Đất thịt thoát nước tốt",
    gallery: [
      "https://images.unsplash.com/photo-1613758947306-0cb0d585b9d6?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKERS["CT-002"],
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
      stage: "Trước thu hoạch",
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

  // ====== VƯỜN G-002: cam, chanh leo ======
  "T-004": {
    id: "T-004",
    gardenId: "G-002",
    name: "Cam Sành 01",
    variety: "Cam sành",
    plantedAt: "2021-02-10",
    preNurseryAgeMonths: 6,
    phase: "Ra quả",
    status: "active",
    location: {
      label: GARDENS["G-002"].name,
      lat: GARDENS["G-002"].lat,
      lng: GARDENS["G-002"].lng,
      address: GARDENS["G-002"].address,
    },
    plot: GARDENS["G-002"].shortName,
    region: GARDENS["G-002"].region,
    soil: "Đất đồi pha sét, thoát nước tốt",
    gallery: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKERS["CT-002"],
    planned: [
      {
        id: 301,
        type: "water",
        title: "Tưới nhỏ giọt 2 ngày/lần",
        due: "2025-10-18",
        details: ["5–7L/cây"],
      },
      {
        id: 302,
        type: "fert",
        title: "Bón phân kali tăng độ ngọt",
        due: "2025-10-25",
        details: ["150–200g/cây"],
      },
    ],
    phenology: {
      stage: "Ra quả",
      status: "Quả đồng đều, vỏ xanh bóng",
      prevCare: "Tỉa bớt quả nhỏ, sâu",
      leafRootNote: "Lá xanh, ít sâu cuốn lá",
      seasonNote: "Đầu đông, nhiệt độ 18–22°C",
      workLog: "08/10 cắt tỉa; 01/10 bón NPK",
      events: [
        { d: "2025-09-10", note: "Ra quả lứa chính" },
        { d: "2025-08-05", note: "Ra hoa đồng loạt" },
      ],
    },
  },

  "T-005": {
    id: "T-005",
    gardenId: "G-002",
    name: "Chanh Leo 01",
    variety: "Chanh dây tím",
    plantedAt: "2024-03-05",
    preNurseryAgeMonths: 4,
    phase: "Sinh trưởng thân lá",
    status: "active",
    location: {
      label: GARDENS["G-002"].name,
      lat: GARDENS["G-002"].lat,
      lng: GARDENS["G-002"].lng,
      address: GARDENS["G-002"].address,
    },
    plot: GARDENS["G-002"].shortName,
    region: GARDENS["G-002"].region,
    soil: "Đất đồi tơi xốp, thoát nước",
    gallery: [
      "https://images.unsplash.com/photo-1620036796178-0b9d4b2a8e1b?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKERS["CT-002"],
    planned: [
      {
        id: 303,
        type: "water",
        title: "Tưới phun mưa 1 ngày/lần",
        due: "2025-10-17",
        details: ["Giữ ẩm mặt đất"],
      },
    ],
    phenology: {
      stage: "Sinh trưởng thân lá",
      status: "Dây leo khoẻ, lá xanh đậm",
      prevCare: "Làm giàn, buộc dây",
      leafRootNote: "Lá lớn, ít bệnh thán thư",
      seasonNote: "Cuối thu, mưa rải rác",
      workLog: "10/10 buộc dây lên giàn; 03/10 bón phân lót",
      events: [{ d: "2025-09-20", note: "Bón phân thúc lần 1" }],
    },
  },

  // ====== VƯỜN G-003: vải, nhãn ======
  "T-006": {
    id: "T-006",
    gardenId: "G-003",
    name: "Vải Thiều 01",
    variety: "Vải thiều",
    plantedAt: "2019-11-12",
    preNurseryAgeMonths: 12,
    phase: "Sau thu hoạch",
    status: "active",
    location: {
      label: GARDENS["G-003"].name,
      lat: GARDENS["G-003"].lat,
      lng: GARDENS["G-003"].lng,
      address: GARDENS["G-003"].address,
    },
    plot: GARDENS["G-003"].shortName,
    region: GARDENS["G-003"].region,
    soil: "Đất đồi feralit đỏ vàng",
    gallery: [
      "https://images.unsplash.com/photo-1620463148783-49e8f8764fda?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKERS["CT-003"],
    planned: [
      {
        id: 401,
        type: "fert",
        title: "Bón phân phục hồi sau thu hoạch",
        due: "2025-10-30",
        details: ["Phân chuồng hoai + NPK"],
      },
    ],
    phenology: {
      stage: "Sau thu hoạch",
      status: "Cây phục hồi, bật lộc thu",
      prevCare: "Tỉa cành sâu, dọn vệ sinh vườn",
      leafRootNote: "Lộc non xanh, ít sâu bệnh",
      seasonNote: "Sau vụ thu hoạch chính",
      workLog: "01/07 thu hoạch; 10/07 tỉa cành",
      events: [{ d: "2025-06-20", note: "Đỉnh điểm thu hoạch" }],
    },
  },

  "T-007": {
    id: "T-007",
    gardenId: "G-003",
    name: "Nhãn Lồng 01",
    variety: "Nhãn lồng Hưng Yên",
    plantedAt: "2020-03-22",
    preNurseryAgeMonths: 10,
    phase: "Ra quả",
    status: "active",
    location: {
      label: GARDENS["G-003"].name,
      lat: GARDENS["G-003"].lat,
      lng: GARDENS["G-003"].lng,
      address: GARDENS["G-003"].address,
    },
    plot: GARDENS["G-003"].shortName,
    region: GARDENS["G-003"].region,
    soil: "Đất phù sa ven sông",
    gallery: [
      "https://images.unsplash.com/photo-1601000938259-9ae7fc10718c?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKERS["CT-003"],
    planned: [
      {
        id: 402,
        type: "water",
        title: "Tưới tiết kiệm 3 ngày/lần",
        due: "2025-10-19",
        details: ["7–9L/cây"],
      },
    ],
    phenology: {
      stage: "Ra quả",
      status: "Chùm quả dày, quả to",
      prevCare: "Khoanh vỏ kích thích ra hoa",
      leafRootNote: "Lá xanh đậm, tán rộng",
      seasonNote: "Đầu mùa thu hoạch",
      workLog: "15/08 bắt đầu thu tỉa",
      events: [{ d: "2025-07-01", note: "Chuyển giai đoạn nuôi quả" }],
    },
  },

  // ====== VƯỜN G-004: cà phê, bơ ======
  "T-008": {
    id: "T-008",
    gardenId: "G-004",
    name: "Cà Phê Robusta 01",
    variety: "Robusta",
    plantedAt: "2018-06-01",
    preNurseryAgeMonths: 9,
    phase: "Ra quả",
    status: "active",
    location: {
      label: GARDENS["G-004"].name,
      lat: GARDENS["G-004"].lat,
      lng: GARDENS["G-004"].lng,
      address: GARDENS["G-004"].address,
    },
    plot: GARDENS["G-004"].shortName,
    region: GARDENS["G-004"].region,
    soil: "Đất bazan màu mỡ",
    gallery: [
      "https://images.unsplash.com/photo-1502462041640-b3d7e50d0660?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKERS["CT-004"],
    planned: [
      {
        id: 501,
        type: "water",
        title: "Tưới đầu mùa khô",
        due: "2025-11-01",
        details: ["400–500L/sào", "Chia 2 lần tưới"],
      },
    ],
    phenology: {
      stage: "Ra quả",
      status: "Quả chín đỏ 60–70%",
      prevCare: "Tạo hình tán, làm cỏ",
      leafRootNote: "Lá xanh, ít rụng",
      seasonNote: "Đầu vụ thu hoạch Tây Nguyên",
      workLog: "05/11 thu bói; 25/10 kiểm tra sâu đục thân",
      events: [{ d: "2025-09-15", note: "Ra hoa đồng loạt" }],
    },
  },

  "T-009": {
    id: "T-009",
    gardenId: "G-004",
    name: "Bơ Booth 01",
    variety: "Booth",
    plantedAt: "2021-09-18",
    preNurseryAgeMonths: 7,
    phase: "Sinh trưởng thân lá",
    status: "active",
    location: {
      label: GARDENS["G-004"].name,
      lat: GARDENS["G-004"].lat,
      lng: GARDENS["G-004"].lng,
      address: GARDENS["G-004"].address,
    },
    plot: GARDENS["G-004"].shortName,
    region: GARDENS["G-004"].region,
    soil: "Đất đỏ bazan tơi xốp",
    gallery: [
      "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=1200&auto=format&fit=crop",
    ],
    caretaker: CARETAKERS["CT-004"],
    planned: [
      {
        id: 502,
        type: "fert",
        title: "Bón phân hữu cơ vi sinh",
        due: "2025-10-28",
        details: ["4–5kg/cây"],
      },
    ],
    phenology: {
      stage: "Sinh trưởng thân lá",
      status: "Tán cây phát triển tốt",
      prevCare: "Cắt cành vượt, tỉa tán",
      leafRootNote: "Lá xanh bóng, không cháy mép",
      seasonNote: "Giữa mùa mưa, ẩm độ cao",
      workLog: "02/10 bón NPK; 15/09 làm cỏ gốc",
      events: [{ d: "2025-08-01", note: "Giai đoạn bật lộc mạnh" }],
    },
  },
};

export const TREES_ARRAY = Object.values(TREES);

/* Map vườn -> list cây (dùng cho GardenManagement / TreeManagement) */
export const TREES_BY_GARDEN = TREES_ARRAY.reduce((acc, t) => {
  if (!t.gardenId) return acc;
  if (!acc[t.gardenId]) acc[t.gardenId] = [];
  acc[t.gardenId].push(t);
  return acc;
}, {});

/* =======================
   Helpers – dùng chung
   ======================= */

export function getTreeById(id) {
  if (!id) return null;
  const sid = String(id);
  return TREES[sid] || TREES_ARRAY.find((t) => String(t.id) === sid) || null;
}

export function getAllTrees() {
  return TREES_ARRAY;
}

export function getTreesInGarden(gardenId) {
  if (!gardenId) return TREES_ARRAY;
  return TREES_BY_GARDEN[gardenId] || [];
}
