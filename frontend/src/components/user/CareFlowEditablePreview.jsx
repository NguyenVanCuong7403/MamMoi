import React, { useEffect, useMemo, useState } from "react";
/********************
 * Care Flow Editable Preview — v3.2 (fix z-index)
 * - Sửa lỗi: nút "Ẩn nhóm" và "Xóa bước" không bấm được
 * - Điều chỉnh z-index để các nút tương tác luôn ở trên cùng
 ********************/

/***** Tiny UI wrappers *****/
const Card = ({ className = "", children }) => (
  <div className={"rounded-2xl border bg-white " + className}>{children}</div>
);
const CardHeader = ({ className = "", children }) => (
  <div className={"px-4 pt-4 pb-2 " + className}>{children}</div>
);
const CardContent = ({ className = "", children }) => (
  <div className={"px-4 pb-4 " + className}>{children}</div>
);
const CardTitle = ({ className = "", children }) => (
  <div className={"text-base font-semibold " + className}>{children}</div>
);
const Badge = ({ className = "", children }) => (
  <span className={"inline-flex items-center rounded-full border px-2 py-0.5 text-xs " + className}>{children}</span>
);

/***** Minimal Icons (inline SVG) *****/
const Icon = ({ path }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d={path} />
  </svg>
);
const CalendarIcon = () => <Icon path="M3 4h18M7 2v4M17 2v4M3 10h18M5 6h14v14H5z" />;
const DropletIcon = () => <Icon path="M12 2.69l5.66 5.66A8 8 0 1112 2.69z" />;
const FlaskIcon = () => <Icon path="M6 2h12M10 2v6l-5 9a4 4 0 003.46 6h6.08A4 4 0 0018 17l-5-9V2" />;
const BugIcon = () => <Icon path="M20 7h-3l-2-3h-6L7 7H4m16 0v4a8 8 0 01-8 8 8 8 0 01-8-8V7" />;
const ScissorsIcon = () => <Icon path="M14 12a2 2 0 100-4 2 2 0 000 4zm-4 0a2 2 0 110-4 2 2 0 010 4zm10 7l-8-8M2 19l8-8" />;
const WrenchIcon = () => <Icon path="M14.7 6.3a4 4 0 11-5.66 5.66L2 19l3 3 7.04-7.04a4 4 0 005.66-5.66z" />;
const ActivityIcon = () => <Icon path="M22 12H18l-3 7-4-14-3 7H2" />;
const SparklesIcon = () => <Icon path="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />;
const PlusIcon = () => <Icon path="M12 5v14M5 12h14" />;
const PencilIcon = () => <Icon path="M12 20h9M16.5 3.5l4 4L7 21H3v-4l13.5-13.5z" />;
const TrashIcon = () => <Icon path="M3 6h18M8 6V4h8v2m-1 0v14H7V6" />;
const SaveIcon = () => <Icon path="M19 21H5V3h11l3 3v15zM17 21v-8H7v8" />;
const XIcon = () => <Icon path="M18 6L6 18M6 6l12 12" />;

/***** Types & Data *****/
const PHASES = [
  { id: "growth_development", name: "Sinh trưởng và phát triển" },
  { id: "flowering_fruiting", name: "Ra hoa và đậu quả" },
  { id: "pre_post_harvest", name: "Trước thu và sau thu" },
];

// Màu cố định cho từng giai đoạn
function getPhaseColor(phaseId) {
  const colorMap = {
    growth_development: 'bg-green-100 text-green-800 border-green-200',
    flowering_fruiting: 'bg-pink-100 text-pink-800 border-pink-200',
    pre_post_harvest: 'bg-amber-100 text-amber-800 border-amber-200',
  };
  return colorMap[phaseId] || 'bg-gray-100 text-gray-700 border-gray-200';
}

const ICON_EL = {
  droplet: <DropletIcon />, 
  flask: <FlaskIcon />, 
  bug: <BugIcon />, 
  scissors: <ScissorsIcon />, 
  wrench: <WrenchIcon />, 
  activity: <ActivityIcon />, 
  sparkles: <SparklesIcon />,
};

const ICON_LABEL_VN = {
  droplet: "💧 Tưới tiêu",
  flask: "🧪 Phân bón",
  bug: "🪲 Sâu bệnh",
  scissors: "✂️ Tỉa tán",
  wrench: "🔧 Hạ tầng",
  activity: "📈 KPI",
  sparkles: "✨ Tuỳ chọn",
};

const COLOR_LABEL_VN = {
  emerald: "🟩 Xanh ngọc (emerald)",
  amber: "🟨 Vàng hổ phách (amber)",
  indigo: "🟦 Chàm (indigo)",
  rose: "🟥 Hồng (rose)",
  teal: "🟩 Xanh mòng két (teal)",
  sky: "🟦 Xanh trời (sky)",
  slate: "⬜ Trung tính (slate)",
  violet: "🟪 Tím (violet)",
};

let _id = 1;
const nid = () => _id++;

const DEFAULT_FLOW = {
  growth_development: {
    water: [
      { id: nid(), title: "Giữ ẩm 70-80%", steps: ["Tưới 10-12L/cây", "Tránh tưới chiều", "Kiểm tra ẩm đất 20-30cm"] },
      { id: nid(), title: "Thiết kế hệ thống tưới", steps: ["1-2 line/cây", "Thử áp định kỳ"] }
    ],
    fert: [
      { id: nid(), title: "Hữu cơ 8-10kg/cây", steps: ["Rải đều theo tán", "Tưới đẫm sau bón"] },
      { id: nid(), title: "NPK cân đối", steps: ["200-300g/cây", "Ưu tiên N cao cho sinh trưởng"] },
    ],
    micro: [{ id: nid(), title: "Bo/Zn qua lá", steps: ["Theo nhãn NSX", "Phun sáng sớm hoặc chiều mát"] }],
    pest: [
      { id: nid(), title: "Theo dõi rầy/bọ trĩ", steps: ["Bẫy dính vàng", "Quan sát lá non"] },
      { id: nid(), title: "Vệ sinh vườn", steps: ["Thu gom tàn dư", "Rải vôi nếu cần"] }
    ],
    prune: [
      { id: nid(), title: "Tỉa thông tán", steps: ["Bỏ cành bệnh/chéo", "Khử trùng dụng cụ"] },
      { id: nid(), title: "Định hình tán", steps: ["Cắt cành không cần thiết", "Tạo thông thoáng"] }
    ],
    infra: [
      { id: nid(), title: "Kiểm tra tưới & thoát nước", steps: ["Thông rãnh", "Sửa rò rỉ hệ thống"] },
      { id: nid(), title: "Che chắn/cọc", steps: ["Kiểm tra dây buộc", "Gia cố khi cần"] }
    ],
    monitor: [
      { id: nid(), title: "Đặt bẫy + đo ẩm", steps: ["Ghi ẩm %", "Cập nhật nhật ký định kỳ"] },
      { id: nid(), title: "Đo chiều cao/đường kính tán", steps: ["Theo dõi tốc độ sinh trưởng"] }
    ],
    flower: [],
  },
  flowering_fruiting: {
    water: [
      { id: nid(), title: "Giữ ẩm ổn định 70-80%", steps: ["8-10L/cây", "Không để khô khi ra hoa"] },
      { id: nid(), title: "Tăng tưới khi đậu quả", steps: ["10-12L/cây", "Kiểm tra định kỳ"] }
    ],
    fert: [
      { id: nid(), title: "Tăng P-K, giảm N", steps: ["Công thức cao P-K", "Bón 1-2 lần/tháng"] },
      { id: nid(), title: "Bón thúc quả", steps: ["Kali cao khi quả to", "Hạn chế đạm"] }
    ],
    micro: [
      { id: nid(), title: "Bo + Ca trước/sau nở", steps: ["Tăng tỷ lệ đậu", "Giảm rụng sinh lý"] },
      { id: nid(), title: "Bo/Ca/Mg qua lá", steps: ["Cách 10-14 ngày", "Phun đều 2 mặt lá"] }
    ],
    pest: [
      { id: nid(), title: "Quản lý nấm trên hoa", steps: ["Thoáng tán", "Theo dõi đốm nâu"] },
      { id: nid(), title: "Bao trái & bẫy ruồi", steps: ["Bao lứa chính", "Đặt bẫy protein"] }
    ],
    prune: [
      { id: nid(), title: "Tỉa thưa trái non", steps: ["Giữ mật độ hợp lý", "1-2 trái/chùm"] },
      { id: nid(), title: "Cắt cành không cần thiết", steps: ["Tập trung dinh dưỡng cho quả"] }
    ],
    infra: [
      { id: nid(), title: "Che mưa nhẹ khi hoa nở", steps: ["Tránh gió nóng", "Bảo vệ hoa"] },
      { id: nid(), title: "Gia cố cọc/dây buộc", steps: ["Chống gió quật khi quả nặng"] }
    ],
    monitor: [
      { id: nid(), title: "Ghi tỉ lệ nở/đậu", steps: ["% chùm nở", "% đậu quả"] },
      { id: nid(), title: "Theo dõi rụng sinh lý", steps: ["Ghi % rụng", "Điều chỉnh chăm sóc"] }
    ],
    flower: [
      { id: nid(), title: "Xử lý ra hoa (nếu cần)", steps: ["Giảm tưới 7-10 ngày", "Khoanh vỏ hoặc giảm N"] }
    ],
  },
  pre_post_harvest: {
    water: [
      { id: nid(), title: "Giảm dần trước thu", steps: ["Không tưới sát ngày thu 5-7 ngày"] },
      { id: nid(), title: "Tưới phục hồi sau thu", steps: ["8-10L/cây", "Bù nước cho cây"] }
    ],
    fert: [
      { id: nid(), title: "Ngừng đạm trước thu", steps: ["Có thể bón K nhẹ", "Theo tình trạng"] },
      { id: nid(), title: "Bón hữu cơ tái tạo sau thu", steps: ["8-10kg/cây", "Phục hồi đất"] }
    ],
    micro: [
      { id: nid(), title: "Ca làm cứng vỏ", steps: ["Ngưng trước thu 10-14 ngày", "Tăng độ bền quả"] }
    ],
    pest: [
      { id: nid(), title: "Vệ sinh vườn", steps: ["Nhặt trái rụng", "Tiêu hủy nguồn bệnh"] },
      { id: nid(), title: "Theo dõi sâu bệnh sau thu", steps: ["Bẫy ruồi/kiến", "Xử lý nếu có"] }
    ],
    prune: [
      { id: nid(), title: "Tỉa phục hồi sau thu", steps: ["Cắt cành già/yếu", "Định hình lại tán"] },
      { id: nid(), title: "Dọn vườn", steps: ["Thu gom cành lá", "Vệ sinh khu vực"] }
    ],
    infra: [
      { id: nid(), title: "Chuẩn bị dụng cụ thu hoạch", steps: ["Khử trùng thùng/kéo", "Chuẩn bị kho"] },
      { id: nid(), title: "Khử trùng & bảo dưỡng sau thu", steps: ["Sửa rò rỉ hệ tưới", "Thông rãnh thoát nước"] }
    ],
    monitor: [
      { id: nid(), title: "Đánh giá độ chín & Brix", steps: ["Chọn ngày thu hợp lý", "Đo độ ngọt"] },
      { id: nid(), title: "Tổng kết mùa vụ/KPI", steps: ["Năng suất", "Chi phí", "Lợi nhuận"] }
    ],
    flower: [],
  },
};

const BASE_KEYS = ["water", "fert", "micro", "pest", "prune", "infra", "monitor", "flower"];
const totalOf = (ph) => BASE_KEYS.reduce((n, k) => n + ((ph?.[k] || []).length), 0);

/***** LocalStorage helpers *****/
const storeKey = () => `careflow_v3_default`;

const emptyHide = () => {
  const r = {};
  PHASES.forEach((p) => (r[p.id] = {}));
  return r;
};
const emptyCustom = () => {
  const r = {};
  PHASES.forEach((p) => (r[p.id] = []));
  return r;
};
const emptyDeleted = () => {
  const r = {};
  PHASES.forEach((p) => (r[p.id] = {}));
  return r;
};

const loadStore = () => {
  if (typeof window === "undefined") return { flow: JSON.parse(JSON.stringify(DEFAULT_FLOW)), hide: emptyHide(), custom: emptyCustom(), deleted: emptyDeleted() };
  try {
    const raw = localStorage.getItem(storeKey());
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        flow: parsed.flow ?? JSON.parse(JSON.stringify(DEFAULT_FLOW)),
        hide: parsed.hide ?? emptyHide(),
        custom: parsed.custom ?? emptyCustom(),
        deleted: parsed.deleted ?? emptyDeleted(),
      };
    }
  } catch {}
  return { flow: JSON.parse(JSON.stringify(DEFAULT_FLOW)), hide: emptyHide(), custom: emptyCustom(), deleted: emptyDeleted() };
};

const saveStore = (s) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(storeKey(), JSON.stringify(s));
};

/***** Main Component *****/
export default function CareFlowEditablePreview() {
  const [treeName] = useState("Xoài Cát Chu");
  const DB_ACTIVE_PHASE = "growth_development";

  const visiblePhases = useMemo(() => PHASES.filter((p) => totalOf(DEFAULT_FLOW[p.id]) > 0), []);
  const start = (visiblePhases.find((p) => p.id === DB_ACTIVE_PHASE)?.id || visiblePhases[0]?.id);
  const [phase, setPhase] = useState(start);
  const [editMode, setEditMode] = useState(false);

  const [store, setStore] = useState(() => loadStore());
  useEffect(() => {
    setStore(loadStore());
  }, []);

  const flow = store.flow;
  const hide = store.hide;
  const custom = store.custom;
  const deleted = store.deleted;

  const cur = flow[phase];
  const counts = useMemo(
    () => ({
      water: cur.water.length,
      fert: cur.fert.length,
      micro: cur.micro.length,
      pest: cur.pest.length,
      prune: cur.prune.length,
      infra: cur.infra.length,
      monitor: cur.monitor.length,
      flower: cur.flower.length,
    }),
    [cur]
  );

  function updateStore(mut) {
    setStore((prev) => {
      const draft = JSON.parse(JSON.stringify(prev));
      mut(draft);
      saveStore(draft);
      return draft;
    });
  }

  function mutateBase(key, next) {
    updateStore((d) => {
      d.flow[phase][key] = next;
    });
  }

  function toggleHide(key) {
    updateStore((d) => {
      d.hide[phase][key] = !d.hide[phase][key];
    });
  }

  function deleteBaseGroup(key) {
    updateStore((d) => {
      d.flow[phase][key] = [];
      d.deleted[phase][key] = true;
    });
  }

  function addCustomGroup(title, color, icon) {
    if (!title.trim()) return;
    updateStore((d) => {
      d.custom[phase].push({ id: `${Date.now()}`, title: title.trim(), color, icon, tasks: [], hidden: false });
    });
  }
  function removeCustomGroup(id) {
    updateStore((d) => {
      d.custom[phase] = d.custom[phase].filter((g) => g.id !== id);
    });
  }
  function toggleHideCustomGroup(id) {
    updateStore((d) => {
      const g = d.custom[phase].find((x) => x.id === id);
      if (g) g.hidden = !g.hidden;
    });
  }
  function mutateCustomTasks(id, nextTasks) {
    updateStore((d) => {
      const g = d.custom[phase].find((x) => x.id === id);
      if (g) g.tasks = nextTasks;
    });
  }

  const tone = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    indigo: "bg-indigo-100 text-indigo-700",
    rose: "bg-rose-100 text-rose-700",
    teal: "bg-teal-100 text-teal-700",
    sky: "bg-sky-100 text-sky-700",
    slate: "bg-slate-100 text-slate-700",
    violet: "bg-violet-100 text-violet-700",
  };

  function TopToolbar() {
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showFinalConfirm, setShowFinalConfirm] = useState(false);
    const [resetSuccess, setResetSuccess] = useState({ show: false, keptCount: 0 });
    const [selectedGroups, setSelectedGroups] = useState({
      custom: [],
      modified: []
    });

    function handleReset() {
      setShowResetConfirm(true);
      setSelectedGroups({
        custom: [],
        modified: []
      });
    }

    function handleConfirmClick() {
      setShowFinalConfirm(true);
    }

    function confirmReset() {
      if (typeof window !== "undefined") {
        localStorage.removeItem(storeKey());
      }
      
      const newStore = {
        flow: JSON.parse(JSON.stringify(DEFAULT_FLOW)),
        hide: emptyHide(),
        custom: emptyCustom(),
        deleted: emptyDeleted()
      };

      if (selectedGroups.custom.length > 0) {
        PHASES.forEach(p => {
          const phaseId = p.id;
          const customsInPhase = store.custom[phaseId] || [];
          
          const kept = customsInPhase.filter(g => selectedGroups.custom.includes(g.id));
          if (kept.length > 0) {
            newStore.custom[phaseId] = JSON.parse(JSON.stringify(kept));
          }
        });
      }

      if (selectedGroups.modified.length > 0) {
        selectedGroups.modified.forEach(item => {
          const [phaseId, key] = item.split('::');
          newStore.flow[phaseId][key] = JSON.parse(JSON.stringify(store.flow[phaseId][key]));
        });
      }

      setStore(newStore);
      saveStore(newStore);
      
      // Lưu thông tin để hiển thị toast
      const totalKept = selectedGroups.custom.length + selectedGroups.modified.length;
      setResetSuccess({ show: true, keptCount: totalKept });
      
      setShowResetConfirm(false);
      setShowFinalConfirm(false);
      
      // Tự động ẩn toast sau 3 giây
      setTimeout(() => {
        setResetSuccess({ show: false, keptCount: 0 });
      }, 3000);
    }

    function cancelReset() {
      setShowResetConfirm(false);
      setShowFinalConfirm(false);
    }

    function cancelFinalConfirm() {
      setShowFinalConfirm(false);
    }

    function toggleCustomGroup(id) {
      setSelectedGroups(prev => ({
        ...prev,
        custom: prev.custom.includes(id)
          ? prev.custom.filter(x => x !== id)
          : [...prev.custom, id]
      }));
    }

    function toggleModifiedGroup(key) {
      setSelectedGroups(prev => ({
        ...prev,
        modified: prev.modified.includes(key)
          ? prev.modified.filter(x => x !== key)
          : [...prev.modified, key]
      }));
    }

    function selectAllCustom() {
      const allIds = [];
      PHASES.forEach(p => {
        (store.custom[p.id] || []).forEach(g => allIds.push(g.id));
      });
      setSelectedGroups(prev => ({ ...prev, custom: allIds }));
    }

    function deselectAllCustom() {
      setSelectedGroups(prev => ({ ...prev, custom: [] }));
    }

    function selectAllModified() {
      const allKeys = [];
      PHASES.forEach(p => {
        const phaseId = p.id;
        BASE_KEYS.forEach(key => {
          if (deleted[phaseId]?.[key]) return;
          
          const current = store.flow[phaseId][key];
          const defaultData = DEFAULT_FLOW[phaseId][key];
          if (JSON.stringify(current) !== JSON.stringify(defaultData)) {
            allKeys.push(`${phaseId}::${key}`);
          }
        });
      });
      setSelectedGroups(prev => ({ ...prev, modified: allKeys }));
    }

    function deselectAllModified() {
      setSelectedGroups(prev => ({ ...prev, modified: [] }));
    }

    const customGroups = [];
    PHASES.forEach(p => {
      const phaseLabel = p.name;
      const phaseId = p.id;
      (store.custom[p.id] || []).forEach(g => {
        customGroups.push({
          id: g.id,
          title: g.title,
          phase: phaseLabel,
          phaseId: phaseId,
          color: g.color,
          taskCount: (g.tasks || []).length
        });
      });
    });

    const modifiedGroups = [];
    PHASES.forEach(p => {
      const phaseId = p.id;
      const phaseLabel = p.name;
      BASE_KEYS.forEach(key => {
        if (deleted[phaseId]?.[key]) return;
        
        const current = store.flow[phaseId][key];
        const defaultData = DEFAULT_FLOW[phaseId][key];
        if (JSON.stringify(current) !== JSON.stringify(defaultData)) {
          const currentCount = current.length;
          const defaultCount = defaultData.length;
          const diff = currentCount - defaultCount;
          
          let changeLabel = '';
          if (diff > 0) {
            changeLabel = `Đã thêm ${diff} bước`;
          } else if (diff < 0) {
            changeLabel = `Đã xóa ${Math.abs(diff)} bước`;
          } else {
            changeLabel = 'Đã chỉnh sửa nội dung';
          }
          
          modifiedGroups.push({
            key: `${phaseId}::${key}`,
            title: baseMeta(key).title,
            phase: phaseLabel,
            phaseId: phaseId,
            color: baseMeta(key).color,
            taskCount: currentCount,
            changeLabel: changeLabel
          });
        }
      });
    });

    const totalKept = selectedGroups.custom.length + selectedGroups.modified.length;

    return (
      <>
        {/* Toast notification khi khôi phục thành công */}
        {resetSuccess.show && (
          <div 
            className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in"
            style={{ zIndex: 10001 }}
          >
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-base">Khôi phục thành công!</p>
              {resetSuccess.keptCount > 0 && (
                <p className="text-sm opacity-90">Đã giữ lại {resetSuccess.keptCount} nhóm</p>
              )}
            </div>
          </div>
        )}

        {showResetConfirm && !showFinalConfirm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto" 
            style={{ zIndex: 9999 }}
            onClick={cancelReset}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8 flex flex-col max-h-[calc(100vh-4rem)]" onClick={(e) => e.stopPropagation()}>
              
              <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Khôi phục dữ liệu mặc định</h3>
                    <p className="text-sm text-gray-600">Chọn các nhóm bạn muốn giữ lại</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                
                {customGroups.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <span>📦</span>
                        <span>Nhóm tùy chỉnh ({customGroups.length})</span>
                      </h4>
                      <div className="flex gap-2 text-xs">
                        <button
                          type="button"
                          onClick={selectAllCustom}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Chọn tất cả
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          type="button"
                          onClick={deselectAllCustom}
                          className="text-gray-600 hover:underline"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {customGroups.map(g => (
                        <label
                          key={g.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedGroups.custom.includes(g.id)
                              ? 'bg-blue-50 border-blue-400 shadow-sm'
                              : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedGroups.custom.includes(g.id)}
                            onChange={() => toggleCustomGroup(g.id)}
                            className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">{g.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getPhaseColor(g.phaseId)}`}>
                                {g.phase}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                {g.taskCount} bước
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {modifiedGroups.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <span>✏️</span>
                        <span>Nhóm gốc đã chỉnh sửa ({modifiedGroups.length})</span>
                      </h4>
                      <div className="flex gap-2 text-xs">
                        <button
                          type="button"
                          onClick={selectAllModified}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Chọn tất cả
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          type="button"
                          onClick={deselectAllModified}
                          className="text-gray-600 hover:underline"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {modifiedGroups.map(g => (
                        <label
                          key={g.key}
                          className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedGroups.modified.includes(g.key)
                              ? 'bg-green-50 border-green-400 shadow-sm'
                              : 'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedGroups.modified.includes(g.key)}
                            onChange={() => toggleModifiedGroup(g.key)}
                            className="mt-1 h-5 w-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">{g.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${getPhaseColor(g.phaseId)}`}>
                                {g.phase}
                              </span>
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                {g.changeLabel}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {customGroups.length === 0 && modifiedGroups.length === 0 && (
                  <div className="text-center py-8 space-y-4">
                    <div className="text-6xl">ℹ️</div>
                    <div>
                      <p className="text-gray-700 font-semibold mb-2">
                        Không có nhóm tùy chỉnh hoặc nhóm đã chỉnh sửa
                      </p>
                      <p className="text-gray-600 text-sm">
                        Nhưng khôi phục vẫn sẽ thực hiện những việc sau:
                      </p>
                    </div>
                  </div>
                )}

                {(() => {
                  const hiddenBaseCount = PHASES.reduce((sum, p) => {
                    return sum + BASE_KEYS.filter(k => hide[p.id]?.[k] && !deleted[p.id]?.[k]).length;
                  }, 0);
                  
                  const hiddenCustomCount = PHASES.reduce((sum, p) => {
                    return sum + (store.custom[p.id] || []).filter(g => g.hidden).length;
                  }, 0);
                  
                  const hiddenCount = hiddenBaseCount + hiddenCustomCount;
                  
                  const deletedCount = PHASES.reduce((sum, p) => {
                    return sum + BASE_KEYS.filter(k => deleted[p.id]?.[k]).length;
                  }, 0);
                  
                  const hasChanges = hiddenCount > 0 || deletedCount > 0;
                  
                  if (!hasChanges && customGroups.length === 0 && modifiedGroups.length === 0) {
                    return (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-900 text-sm">
                          ℹ️ Không có thay đổi nào để khôi phục. Dữ liệu đã ở trạng thái mặc định.
                        </p>
                      </div>
                    );
                  }
                  
                  if (hasChanges) {
                    return (
                      <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4">
                        <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <span>🔄</span>
                          <span>Các thay đổi sẽ được khôi phục</span>
                        </p>
                        <ul className="space-y-1.5 ml-6 text-sm text-blue-800">
                          {hiddenCount > 0 && (
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600 font-bold">👁️</span>
                              <span>
                                <strong>{hiddenCount} nhóm đã ẨN</strong> sẽ được HIỆN LẠI
                                {hiddenBaseCount > 0 && hiddenCustomCount > 0 && (
                                  <span className="text-xs text-blue-600 ml-1">
                                    ({hiddenBaseCount} nhóm gốc + {hiddenCustomCount} nhóm tùy chỉnh)
                                  </span>
                                )}
                              </span>
                            </li>
                          )}
                          {deletedCount > 0 && (
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600 font-bold">🔄</span>
                              <span><strong>{deletedCount} nhóm gốc đã XÓA</strong> sẽ được KHÔI PHỤC về mặc định</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    );
                  }
                  
                  return null;
                })()}

                {(customGroups.length > 0 || modifiedGroups.length > 0) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-gray-900">📊 Tóm tắt</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Nhóm sẽ giữ lại:</p>
                        <p className="text-2xl font-bold text-green-600">{totalKept}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Nhóm sẽ reset:</p>
                        <p className="text-2xl font-bold text-red-600">
                          {customGroups.length + modifiedGroups.length - totalKept}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-red-50 border-l-4 border-red-500 rounded p-4">
                  <p className="font-bold text-red-900 flex items-center gap-2 mb-2">
                    <span>⚠️</span>
                    <span>Lưu ý quan trọng</span>
                  </p>
                  <ul className="space-y-1 ml-6 text-sm text-red-800">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Các nhóm KHÔNG được chọn sẽ bị xóa/reset về mặc định</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Các nhóm đã ẨN sẽ được HIỆN LẠI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Các nhóm gốc đã XÓA sẽ được KHÔI PHỤC</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex-shrink-0 p-6 border-t bg-gray-50 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={cancelReset}
                  className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  ← Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClick}
                  className="px-5 py-2.5 rounded-lg font-semibold text-white transition-colors shadow-sm bg-red-600 hover:bg-red-700"
                >
                  🔄 Xác nhận khôi phục
                </button>
              </div>
            </div>
          </div>
        )}

        {showFinalConfirm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center" 
            style={{ zIndex: 10000 }}
            onClick={cancelFinalConfirm}
          >
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🚨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-900">Xác nhận lần cuối!</h3>
                    <p className="text-sm text-red-600">Bạn có chắc chắn muốn thực hiện?</p>
                  </div>
                </div>
                
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 space-y-3">
                  <p className="font-bold text-red-900 text-base">
                    ⚠️ Hành động này sẽ KHÔI PHỤC về dữ liệu mặc định!
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const totalCustom = customGroups.length;
                      const totalModified = modifiedGroups.length;
                      const keptCustom = selectedGroups.custom.length;
                      const keptModified = selectedGroups.modified.length;
                      const willDeleteCustom = totalCustom - keptCustom;
                      const willResetModified = totalModified - keptModified;
                      
                      const hiddenBaseCount = PHASES.reduce((sum, p) => {
                        return sum + BASE_KEYS.filter(k => hide[p.id]?.[k] && !deleted[p.id]?.[k]).length;
                      }, 0);
                      
                      const hiddenCustomCount = PHASES.reduce((sum, p) => {
                        return sum + (store.custom[p.id] || []).filter(g => g.hidden).length;
                      }, 0);
                      
                      const hiddenCount = hiddenBaseCount + hiddenCustomCount;
                      
                      const deletedCount = PHASES.reduce((sum, p) => {
                        return sum + BASE_KEYS.filter(k => deleted[p.id]?.[k]).length;
                      }, 0);
                      
                      return (
                        <>
                          {willDeleteCustom > 0 && (
                            <div className="bg-white rounded p-3 border border-red-300">
                              <p className="font-semibold text-red-900 mb-1">
                                🗑️ Nhóm tùy chỉnh sẽ bị XÓA:
                              </p>
                              <p className="text-red-800">
                                <strong>{willDeleteCustom}</strong> nhóm sẽ bị xóa vĩnh viễn
                              </p>
                            </div>
                          )}
                          
                          {willResetModified > 0 && (
                            <div className="bg-white rounded p-3 border border-red-300">
                              <p className="font-semibold text-red-900 mb-1">
                                🔄 Nhóm gốc đã sửa sẽ được RESET:
                              </p>
                              <p className="text-red-800">
                                <strong>{willResetModified}</strong> nhóm sẽ trở về trạng thái ban đầu
                              </p>
                            </div>
                          )}
                          
                          {hiddenCount > 0 && (
                            <div className="bg-white rounded p-3 border border-blue-300">
                              <p className="font-semibold text-blue-900 mb-1">
                                👁️ Nhóm đã ẨN sẽ được HIỆN LẠI:
                              </p>
                              <p className="text-blue-800">
                                <strong>{hiddenCount}</strong> nhóm đang bị ẩn
                                {hiddenBaseCount > 0 && hiddenCustomCount > 0 && (
                                  <span className="text-xs block mt-1">
                                    ({hiddenBaseCount} nhóm gốc + {hiddenCustomCount} nhóm tùy chỉnh)
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                          
                          {deletedCount > 0 && (
                            <div className="bg-white rounded p-3 border border-blue-300">
                              <p className="font-semibold text-blue-900 mb-1">
                                🔄 Nhóm gốc đã XÓA sẽ được KHÔI PHỤC:
                              </p>
                              <p className="text-blue-800">
                                <strong>{deletedCount}</strong> nhóm sẽ được khôi phục về mặc định
                              </p>
                            </div>
                          )}
                          
                          {(keptCustom > 0 || keptModified > 0) && (
                            <div className="bg-green-50 rounded p-3 border border-green-300">
                              <p className="font-semibold text-green-900 mb-1">
                                ✅ Nhóm sẽ được GIỮ LẠI:
                              </p>
                              <p className="text-green-800">
                                <strong>{keptCustom + keptModified}</strong> nhóm đã chọn
                              </p>
                            </div>
                          )}
                          
                          {willDeleteCustom === 0 && willResetModified === 0 && hiddenCount === 0 && deletedCount === 0 && (
                            <div className="bg-blue-50 rounded p-3 border border-blue-300">
                              <p className="text-blue-900">
                                ℹ️ Không có thay đổi gì. Dữ liệu đã ở trạng thái mặc định.
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={cancelFinalConfirm}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  ← Quay lại
                </button>
                <button
                  type="button"
                  onClick={confirmReset}
                  className="px-6 py-3 rounded-lg font-bold text-white transition-colors shadow-lg bg-red-600 hover:bg-red-700 flex items-center gap-2"
                >
                  <span>🚨</span>
                  <span>ĐỒNG Ý KHÔI PHỤC</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl border bg-white p-3">
          <button 
            type="button" 
            onClick={handleReset} 
            className="rounded-md bg-amber-600 text-white px-4 py-2 text-sm shadow hover:opacity-90 flex items-center gap-2 font-medium"
            title="Khôi phục về dữ liệu ban đầu"
          >
            🔄 Khôi phục mặc định
          </button>
          <button 
            type="button" 
            onClick={() => setEditMode((s) => !s)} 
            className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm shadow hover:opacity-90 font-medium"
          >
            {editMode ? "✓ Hoàn tất chỉnh sửa" : "✏️ Chỉnh sửa"}
          </button>
        </div>
      </>
    );
  }

  function ManageBar() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [color, setColor] = useState("slate");
    const [icon, setIcon] = useState("sparkles");

    const hiddenBases = BASE_KEYS.filter((k) => hide[phase]?.[k] && !deleted[phase]?.[k]);
    const hiddenCustoms = (custom[phase] || []).filter(g => g.hidden);

    return (
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white p-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-600">Nhóm ẩn:</span>
          {hiddenBases.length === 0 && hiddenCustoms.length === 0 && <span className="text-neutral-400">(không)</span>}
          {hiddenBases.map((k) => (
            <button type="button" key={k} onClick={() => toggleHide(k)} className="rounded border px-2 py-0.5 hover:bg-blue-50">
              Hiện {baseMeta(k).title}
            </button>
          ))}
          {hiddenCustoms.map((g) => (
            <button type="button" key={g.id} onClick={() => toggleHideCustomGroup(g.id)} className="rounded border px-2 py-0.5 hover:bg-blue-50">
              Hiện {g.title}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {!open ? (
            <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 rounded border px-3 py-1 text-xs hover:bg-neutral-50">
              <PlusIcon /> Thêm nhóm tuỳ chỉnh
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên nhóm" className="rounded border px-2 py-1" />
              <select value={color} onChange={(e) => setColor(e.target.value)} className="rounded border px-2 py-1">
                {Object.keys(tone).map((c) => (
                  <option key={c} value={c}>{COLOR_LABEL_VN[c]}</option>
                ))}
              </select>
              <select value={icon} onChange={(e) => setIcon(e.target.value)} className="rounded border px-2 py-1">
                {Object.keys(ICON_LABEL_VN).map((ic) => (
                  <option key={ic} value={ic}>{ICON_LABEL_VN[ic]}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  addCustomGroup(title, color, icon);
                  setTitle("");
                  setColor("slate");
                  setIcon("sparkles");
                  setOpen(false);
                }}
                className="inline-flex items-center gap-1 rounded bg-emerald-600 text-white px-3 py-1"
              >
                <SaveIcon /> Lưu nhóm
              </button>
              <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-1 rounded bg-neutral-200 px-3 py-1">
                <XIcon /> Hủy
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#1F302F", paddingTop: "88px" }} /* chỉnh 72–96px tùy header */
    >
      {/* Nền dùng lại cho mọi screen */}
      <BackdropFX color="#1F302F" aurora={false} grid={true} noise={0.03} />
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    🌳
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-emerald-900">{treeName}</h1>
                    <p className="text-sm text-emerald-700 font-medium">Quy trình chăm sóc chung</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon />
                    <span>Giai đoạn: <strong>{PHASES.find(p => p.id === phase)?.name || 'N/A'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>📊</span>
                    <span>Tổng số nhóm: <strong>{BASE_KEYS.filter(k => !hide[phase]?.[k] && !deleted[phase]?.[k]).length + (custom[phase]?.filter(g => !g.hidden).length || 0)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>📝</span>
                    <span>Tổng bước: <strong>{totalOf(cur) + (custom[phase] || []).filter(g => !g.hidden).reduce((sum, g) => sum + (g.tasks?.length || 0), 0)}</strong></span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={`${getPhaseColor(phase)} px-4 py-2 text-sm font-semibold`}>
                  {PHASES.find(p => p.id === phase)?.name}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Fishbone
              phases={visiblePhases}
              active={phase}
              anchor={DB_ACTIVE_PHASE}
              onSelect={setPhase}
              counts={counts}
              chips={[
                ...(!hide[phase]?.water ? [{ label: "Tưới", count: cur.water.length }] : []),
                ...(!hide[phase]?.fert ? [{ label: "Phân bón", count: cur.fert.length }] : []),
                ...(!hide[phase]?.micro ? [{ label: "Vi lượng", count: cur.micro.length }] : []),
                ...(!hide[phase]?.pest ? [{ label: "Sâu bệnh", count: cur.pest.length }] : []),
                ...(!hide[phase]?.prune ? [{ label: "Tỉa & vệ sinh", count: cur.prune.length }] : []),
                ...(!hide[phase]?.infra ? [{ label: "Hạ tầng", count: cur.infra.length }] : []),
                ...(!hide[phase]?.monitor ? [{ label: "KPI", count: cur.monitor.length }] : []),
                ...(!hide[phase]?.flower ? [{ label: "Xử lý ra hoa", count: cur.flower.length }] : []),
                ...((custom[phase] || []).filter(g => !g.hidden).map((g) => ({ label: g.title, count: (g.tasks || []).length }))),
              ]}
            />
          </CardContent>
        </Card>

        <TopToolbar />

        {editMode && <ManageBar />}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {!hide[phase]?.water && !deleted[phase]?.water && (
            <Group
              title="Tưới tiêu"
              color="emerald"
              icon={<DropletIcon />}
              tasks={cur.water}
              editMode={editMode}
              onChange={(t) => mutateBase("water", t)}
              onHideGroup={editMode ? () => toggleHide("water") : undefined}
              onDeleteGroup={editMode ? () => deleteBaseGroup("water") : undefined}
              isBaseGroup={true}
            />
          )}
          {!hide[phase]?.fert && !deleted[phase]?.fert && (
            <Group
              title="Phân bón"
              color="amber"
              icon={<FlaskIcon />}
              tasks={cur.fert}
              editMode={editMode}
              onChange={(t) => mutateBase("fert", t)}
              onHideGroup={editMode ? () => toggleHide("fert") : undefined}
              onDeleteGroup={editMode ? () => deleteBaseGroup("fert") : undefined}
              isBaseGroup={true}
            />
          )}
          {!hide[phase]?.pest && !deleted[phase]?.pest && (
            <Group
              title="Sâu bệnh (IPM)"
              color="rose"
              icon={<BugIcon />}
              tasks={cur.pest}
              editMode={editMode}
              onChange={(t) => mutateBase("pest", t)}
              onHideGroup={editMode ? () => toggleHide("pest") : undefined}
              onDeleteGroup={editMode ? () => deleteBaseGroup("pest") : undefined}
              isBaseGroup={true}
            />
          )}
          {!hide[phase]?.prune && !deleted[phase]?.prune && (
            <Group
              title="Tỉa tán & vệ sinh"
              color="teal"
              icon={<ScissorsIcon />}
              tasks={cur.prune}
              editMode={editMode}
              onChange={(t) => mutateBase("prune", t)}
              onHideGroup={editMode ? () => toggleHide("prune") : undefined}
              onDeleteGroup={editMode ? () => deleteBaseGroup("prune") : undefined}
              isBaseGroup={true}
            />
          )}
          {!hide[phase]?.infra && !deleted[phase]?.infra && (
            <Group
              title="Hạ tầng & thời tiết"
              color="sky"
              icon={<WrenchIcon />}
              tasks={cur.infra}
              editMode={editMode}
              onChange={(t) => mutateBase("infra", t)}
              onHideGroup={editMode ? () => toggleHide("infra") : undefined}
              onDeleteGroup={editMode ? () => deleteBaseGroup("infra") : undefined}
              isBaseGroup={true}
            />
          )}
          {!hide[phase]?.monitor && !deleted[phase]?.monitor && (
            <Group
              title="Theo dõi & KPI"
              color="slate"
              icon={<ActivityIcon />}
              tasks={cur.monitor}
              editMode={editMode}
              onChange={(t) => mutateBase("monitor", t)}
              onHideGroup={editMode ? () => toggleHide("monitor") : undefined}
              onDeleteGroup={editMode ? () => deleteBaseGroup("monitor") : undefined}
              isBaseGroup={true}
            />
          )}
          {!hide[phase]?.micro && !deleted[phase]?.micro && (
            <Group
              title="Vi lượng / Điều hòa"
              color="indigo"
              icon={<FlaskIcon />}
              tasks={cur.micro}
              editMode={editMode}
              onChange={(t) => mutateBase("micro", t)}
              onHideGroup={editMode ? () => toggleHide("micro") : undefined}
              onDeleteGroup={editMode ? () => deleteBaseGroup("micro") : undefined}
              isBaseGroup={true}
            />
          )}
          {!hide[phase]?.flower && !deleted[phase]?.flower && (
            <Group
              title="Xử lý ra hoa"
              color="violet"
              icon={<SparklesIcon />}
              tasks={cur.flower}
              editMode={editMode}
              onChange={(t) => mutateBase("flower", t)}
              onHideGroup={editMode ? () => toggleHide("flower") : undefined}
              onDeleteGroup={editMode ? () => deleteBaseGroup("flower") : undefined}
              isBaseGroup={true}
            />
          )}

          {custom[phase]?.filter(g => !g.hidden).map((g) => (
            <Group
              key={g.id}
              title={g.title}
              color={g.color}
              icon={ICON_EL[g.icon]}
              tasks={g.tasks}
              editMode={editMode}
              onChange={(t) => mutateCustomTasks(g.id, t)}
              onHideGroup={editMode ? () => toggleHideCustomGroup(g.id) : undefined}
              onDeleteGroup={editMode ? () => removeCustomGroup(g.id) : undefined}
              isBaseGroup={false}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function Fishbone({ phases, active, anchor, onSelect, counts, chips }) {
  // Icon cho từng giai đoạn
  const phaseIcons = {
    growth_development: '🌱', // Cây non - Sinh trưởng
    flowering_fruiting: '🌸', // Ra hoa và đậu quả
    pre_post_harvest: '🍎'  // Thu hoạch
  };

  return (
    <div className="py-6">
      {/* Timeline với style mới */}
      <div className="relative px-4">
        {/* Đường nền */}
        <div className="absolute top-8 left-4 right-4 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full" />
        
        {/* Đường progress - với animation mượt cho tất cả giai đoạn */}
        {(() => {
          const activeIdx = phases.findIndex((p) => p.id === active);
          if (activeIdx === -1) return null;
          
          let progressWidth;
          
          // Nếu là giai đoạn cuối, chạy hết 100%
          if (activeIdx === phases.length - 1) {
            progressWidth = 100;
          } else {
            // Các giai đoạn khác: tính vị trí center của node active
            progressWidth = ((activeIdx + 0.5) / phases.length) * 100;
          }
          
          return (
            <div 
              className="absolute top-8 left-4 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 shadow-sm"
              style={{ 
                width: `calc(${progressWidth}% - ${progressWidth === 100 ? '1rem' : '0px'})`
              }} 
            />
          );
        })()}

        {/* Các giai đoạn */}
        <div className="relative z-10 flex justify-between items-start gap-4">
          {phases.map((p, idx) => {
            const isActive = active === p.id;
            const activeIdx = phases.findIndex(ph => ph.id === active);
            const isPassed = activeIdx >= idx;

            return (
              <div key={p.id} className="flex-1 flex flex-col items-center">
                {/* Node/Điểm trên timeline */}
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  className={`
                    relative w-16 h-16 rounded-full border-4 transition-all duration-300 shadow-lg
                    flex items-center justify-center text-3xl mb-3
                    ${isActive 
                      ? 'bg-emerald-600 border-emerald-400 scale-110 shadow-emerald-300' 
                      : isPassed
                        ? 'bg-emerald-500 border-emerald-300 hover:scale-105'
                        : 'bg-white border-gray-300 hover:border-emerald-300 hover:scale-105'
                    }
                  `}
                >
                  {/* Icon theo giai đoạn */}
                  <span className={isActive || isPassed ? 'grayscale-0' : 'grayscale opacity-40'}>
                    {phaseIcons[p.id] || '🌳'}
                  </span>
                  
                  {/* Pulse effect cho active */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  )}
                </button>

                {/* Tên giai đoạn */}
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  className={`
                    px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 text-center
                    max-w-[200px] min-h-[60px] flex items-center justify-center
                    ${isActive 
                      ? 'bg-emerald-600 text-white shadow-lg scale-105' 
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-400 hover:shadow-md'
                    }
                  `}
                >
                  {p.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chips thống kê với style card */}
      <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
        <div className="flex flex-wrap justify-center items-center gap-4">
          {(chips || []).map((c, i) => (
            <div 
              key={i} 
              className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-gray-600 text-sm font-medium">{c.label}</span>
              <span className="text-emerald-600 text-lg font-bold">{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Group({ icon, title, color, tasks, editMode, onChange, onHideGroup, onDeleteGroup, isBaseGroup = false }) {
  const tone = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    indigo: "bg-indigo-100 text-indigo-700",
    rose: "bg-rose-100 text-rose-700",
    teal: "bg-teal-100 text-teal-700",
    sky: "bg-sky-100 text-sky-700",
    slate: "bg-slate-100 text-slate-700",
    violet: "bg-violet-100 text-violet-700",
  };

  const [adding, setAdding] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftSteps, setDraftSteps] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSteps, setEditSteps] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', data: null });

  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) setShowMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  function addTask() {
    if (!draftTitle.trim()) return;
    const t = { id: Date.now(), title: draftTitle.trim(), steps: draftSteps.split("|").map((s) => s.trim()).filter(Boolean) };
    onChange([...(tasks || []), t]);
    setDraftTitle("");
    setDraftSteps("");
    setAdding(false);
  }
  function beginEdit(t) {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditSteps(t.steps.join(" | "));
  }
  function saveEdit() {
    if (!editingId) return;
    const next = (tasks || []).map((t) => (t.id === editingId ? { ...t, title: editTitle || t.title, steps: editSteps.split("|").map((s) => s.trim()).filter(Boolean) || t.steps } : t));
    onChange(next);
    setEditingId(null);
  }
  
  function handleHideGroup(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowMenu(false);
    setConfirmModal({ show: true, type: 'hideGroup', data: null });
  }
  
  function handleDeleteGroup(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowMenu(false);
    setConfirmModal({ show: true, type: 'deleteGroup', data: null });
  }
  
  function handleRemoveTask(id, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setConfirmModal({ show: true, type: 'removeTask', data: id });
  }
  
  function confirmAction() {
    if (confirmModal.type === 'hideGroup') {
      if (onHideGroup) {
        onHideGroup();
      }
    } else if (confirmModal.type === 'deleteGroup') {
      if (onDeleteGroup) {
        onDeleteGroup();
      }
    } else if (confirmModal.type === 'removeTask') {
      const newTasks = tasks.filter((t) => t.id !== confirmModal.data);
      onChange(newTasks);
    }
    
    setConfirmModal({ show: false, type: '', data: null });
  }
  
  function cancelAction() {
    setConfirmModal({ show: false, type: '', data: null });
  }

  return (
    <Card className="relative h-full flex flex-col">
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelAction}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6">
              {confirmModal.type === 'hideGroup' && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Ẩn nhóm công việc</h3>
                    <p className="text-sm text-gray-600">Nhóm sẽ được ẩn tạm thời, không bị xóa</p>
                  </div>
                </div>
              )}
              
              {confirmModal.type === 'deleteGroup' && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🗑️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900">Xóa vĩnh viễn nhóm</h3>
                    <p className="text-sm text-red-600">Hành động này không thể hoàn tác!</p>
                  </div>
                </div>
              )}
              
              {confirmModal.type === 'removeTask' && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🗑️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900">Xóa bước công việc</h3>
                    <p className="text-sm text-red-600">Hành động này không thể hoàn tác!</p>
                  </div>
                </div>
              )}
              
              {confirmModal.type === 'hideGroup' && (
                <div className="text-sm text-gray-700 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="font-semibold text-gray-900 mb-1">📦 Nhóm: {title}</p>
                    <p className="text-gray-600">Số bước công việc: <span className="font-medium text-gray-900">{tasks?.length || 0}</span></p>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-4 space-y-2">
                    <p className="font-semibold text-blue-900 flex items-center gap-2">
                      <span>ℹ️</span>
                      <span>Điều gì sẽ xảy ra khi ẨN nhóm?</span>
                    </p>
                    <ul className="space-y-1.5 ml-6">
                      <li className="text-blue-800 flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Nhóm sẽ <strong>ẨN</strong> khỏi giai đoạn này</span>
                      </li>
                      <li className="text-blue-800 flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Tất cả <strong>{tasks?.length || 0} bước công việc</strong> được <strong>BẢO TOÀN</strong></span>
                      </li>
                      <li className="text-blue-800 flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Bạn có thể <strong>HIỆN LẠI</strong> bất cứ lúc nào</span>
                      </li>
                      <li className="text-blue-800 flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>Dữ liệu <strong>KHÔNG BỊ XÓA</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              
              {confirmModal.type === 'deleteGroup' && (
                <div className="text-sm text-gray-700 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="font-semibold text-gray-900 mb-1">📦 Nhóm: {title}</p>
                    <p className="text-gray-600">Loại: <span className="font-medium text-gray-900">{isBaseGroup ? 'Nhóm gốc' : 'Nhóm tùy chỉnh'}</span></p>
                    <p className="text-gray-600">Số bước công việc: <span className="font-medium text-gray-900">{tasks?.length || 0}</span></p>
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-500 rounded p-4 space-y-2">
                    <p className="font-bold text-red-900 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>CẢNH BÁO: Hậu quả khi XÓA nhóm</span>
                    </p>
                    <ul className="space-y-1.5 ml-6">
                      <li className="text-red-800 flex items-start gap-2">
                        <span className="text-red-600 font-bold">✗</span>
                        <span>Nhóm "{title}" sẽ <strong>BIẾN MẤT</strong> khỏi giao diện</span>
                      </li>
                      <li className="text-red-800 flex items-start gap-2">
                        <span className="text-red-600 font-bold">✗</span>
                        <span>Tất cả <strong>{tasks?.length || 0} bước công việc</strong> sẽ bị <strong>XÓA SẠCH</strong></span>
                      </li>
                      <li className="text-red-800 flex items-start gap-2">
                        <span className="text-red-600 font-bold">✗</span>
                        <span>Nhóm <strong>KHÔNG XUẤT HIỆN</strong> trong danh sách "Nhóm ẩn"</span>
                      </li>
                      {isBaseGroup ? (
                        <li className="text-amber-800 flex items-start gap-2">
                          <span className="text-amber-600 font-bold">⚠</span>
                          <span><strong>Nhóm gốc:</strong> Có thể khôi phục bằng <strong>"Khôi phục mặc định"</strong></span>
                        </li>
                      ) : (
                        <li className="text-red-800 flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span><strong>Nhóm tùy chỉnh:</strong> Bị xóa vĩnh viễn, <strong>KHÔNG THỂ KHÔI PHỤC</strong></span>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 border-l-4 border-amber-500 rounded p-3">
                    <p className="text-amber-900 text-xs font-medium flex items-start gap-2">
                      <span>💡</span>
                      <span><strong>Mẹo:</strong> Nếu bạn chỉ muốn ẨN tạm thời và có thể HIỆN LẠI sau, hãy chọn <strong>"Ẩn nhóm"</strong> thay vì "Xóa nhóm"</span>
                    </p>
                  </div>
                </div>
              )}
              
              {confirmModal.type === 'removeTask' && (() => {
                const target = tasks?.find((t) => t.id === confirmModal.data);
                return (
                  <div className="text-sm text-gray-700 space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="font-semibold text-gray-900 mb-1">📝 Bước: {target?.title || 'bước này'}</p>
                      <p className="text-gray-600">Số hướng dẫn chi tiết: <span className="font-medium text-gray-900">{target?.steps?.length || 0}</span></p>
                    </div>
                    
                    <div className="bg-red-50 border-l-4 border-red-500 rounded p-4 space-y-2">
                      <p className="font-bold text-red-900 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>CẢNH BÁO: Hậu quả khi XÓA bước</span>
                      </p>
                      <ul className="space-y-1.5 ml-6">
                        <li className="text-red-800 flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>Bước công việc sẽ bị <strong>XÓA VĨNH VIỄN</strong></span>
                        </li>
                        <li className="text-red-800 flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>Tất cả <strong>{target?.steps?.length || 0} hướng dẫn</strong> sẽ <strong>MẤT HOÀN TOÀN</strong></span>
                        </li>
                        <li className="text-red-800 flex items-start gap-2">
                          <span className="text-red-600 font-bold">✗</span>
                          <span>Hành động <strong>KHÔNG THỂ HOÀN TÁC</strong></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={cancelAction}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                ← Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmAction}
                className={`px-5 py-2.5 rounded-lg font-semibold text-white transition-colors shadow-sm ${
                  confirmModal.type === 'hideGroup'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmModal.type === 'hideGroup' && "👁️ Ẩn nhóm"}
                {confirmModal.type === 'deleteGroup' && "🗑️ Xóa vĩnh viễn"}
                {confirmModal.type === 'removeTask' && "🗑️ Xóa bước"}
              </button>
            </div>
          </div>
        </div>
      )}
    
      <CardHeader className="pb-2 relative z-20 border-b">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${tone[color]}`}>{icon}</span>
            <span className="font-semibold">{title}</span>
          </span>
          {editMode && (onHideGroup || onDeleteGroup) && (
            <div className="relative">
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="pointer-events-auto relative z-30 inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-50 transition-colors"
                title="Tùy chọn nhóm"
              >
                <span className="text-gray-600">⋮</span>
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {onHideGroup && (
                    <button
                      type="button"
                      onClick={handleHideGroup}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center gap-2 text-blue-700 transition-colors"
                    >
                      <span className="text-lg">👁️</span>
                      <div>
                        <div className="font-medium">Ẩn nhóm</div>
                        <div className="text-xs text-gray-500">Có thể hiện lại</div>
                      </div>
                    </button>
                  )}
                  {onDeleteGroup && (
                    <button
                      type="button"
                      onClick={handleDeleteGroup}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-700 transition-colors"
                    >
                      <span className="text-lg">🗑️</span>
                      <div>
                        <div className="font-medium">Xóa nhóm</div>
                        <div className="text-xs text-gray-500">Xóa vĩnh viễn</div>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 relative z-10 flex-1 py-3">
        {(!tasks || tasks.length === 0) && !adding && <div className="text-xs text-neutral-500">Chưa có bước.</div>}
        {(tasks || []).map((t) => (
          <div key={t.id} className="rounded-lg border p-2 bg-gray-50 relative text-sm">
            {editingId === t.id ? (
              <div className="space-y-2 relative z-20">
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full rounded border px-2 py-1 text-xs" placeholder="Tiêu đề" />
                <textarea value={editSteps} onChange={(e) => setEditSteps(e.target.value)} className="w-full rounded border px-2 py-1 text-xs" placeholder="Các bước, ngăn bằng |" />
                <div className="flex gap-2">
                  <button type="button" onClick={saveEdit} className="inline-flex items-center gap-1 rounded bg-emerald-600 text-white px-2 py-1 text-xs">
                    <SaveIcon /> Lưu
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center gap-1 rounded bg-neutral-200 px-2 py-1 text-xs">
                    <XIcon /> Hủy
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="font-medium text-sm mb-1">{t.title}</div>
                <ul className="text-xs text-neutral-600 list-disc ml-4 space-y-0.5">
                  {t.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
                {editMode && (
                  <div className="mt-2 flex gap-1 relative z-30">
                    <button 
                      type="button" 
                      onClick={() => beginEdit(t)} 
                      className="pointer-events-auto inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs hover:bg-neutral-50"
                    >
                      <PencilIcon /> Sửa
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => handleRemoveTask(t.id, e)} 
                      className="pointer-events-auto inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs text-rose-600 hover:bg-rose-50" 
                      title="Xóa bước"
                    >
                      <TrashIcon /> Xóa
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {editMode && !adding && (
          <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-neutral-50 relative z-20 w-full justify-center">
            <PlusIcon /> Thêm bước
          </button>
        )}
        {editMode && adding && (
          <div className="rounded-lg border p-2 bg-white space-y-2 relative z-20">
            <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="w-full rounded border px-2 py-1 text-xs" placeholder="Tiêu đề" />
            <textarea value={draftSteps} onChange={(e) => setDraftSteps(e.target.value)} className="w-full rounded border px-2 py-1 text-xs" placeholder="Các bước, ngăn bằng |" />
            <div className="flex gap-2">
              <button type="button" onClick={addTask} className="inline-flex items-center gap-1 rounded bg-emerald-600 text-white px-2 py-1 text-xs">
                <SaveIcon /> Lưu
              </button>
              <button type="button" onClick={() => setAdding(false)} className="inline-flex items-center gap-1 rounded bg-neutral-200 px-2 py-1 text-xs">
                <XIcon /> Hủy
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function baseMeta(k) {
  switch (k) {
    case "water": return { title: "Tưới tiêu", color: "emerald" };
    case "fert": return { title: "Phân bón", color: "amber" };
    case "micro": return { title: "Vi lượng / Điều hòa", color: "indigo" };
    case "pest": return { title: "Sâu bệnh (IPM)", color: "rose" };
    case "prune": return { title: "Tỉa tán & vệ sinh", color: "teal" };
    case "infra": return { title: "Hạ tầng & thời tiết", color: "sky" };
    case "monitor": return { title: "Theo dõi & KPI", color: "slate" };
    case "flower": return { title: "Xử lý ra hoa", color: "violet" };
    default: return { title: String(k), color: "slate" };
  }
}