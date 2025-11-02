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
  { id: "prepare_plant", name: "Chuẩn bị & trồng" },
  { id: "vegetative", name: "Sinh trưởng thân lá" },
  { id: "bloom", name: "Ra hoa" },
  { id: "fruit_dev", name: "Đậu/nuôi quả" },
  { id: "pre_harvest", name: "Trước thu" },
  { id: "post_harvest", name: "Sau thu" },
];

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
  prepare_plant: {
    water: [{ id: nid(), title: "Thiết kế hệ thống tưới + thử áp", steps: ["1-2 line/cây", "Đo ẩm 20-30cm"] }],
    fert: [{ id: nid(), title: "Xử lý đất & hố trồng", steps: ["Hữu cơ 10-15kg/hố", "Vôi nếu pH<5.5"] }],
    micro: [],
    pest: [{ id: nid(), title: "Vệ sinh vườn", steps: ["Thu gom tàn dư", "Rải vôi đường nước"] }],
    prune: [{ id: nid(), title: "Che tán/cọc chống gió", steps: ["Cắm cọc", "Kiểm tra dây"] }],
    infra: [{ id: nid(), title: "Thoát nước – mở rãnh", steps: ["Khơi thông rãnh", "Chuẩn bị máy bơm"] }],
    monitor: [{ id: nid(), title: "Ghi nhật ký ban đầu", steps: ["Ngày trồng", "Giống/nguồn cây"] }],
    flower: [],
  },
  vegetative: {
    water: [{ id: nid(), title: "Giữ ẩm 70-80%", steps: ["Tưới 10-12L/cây", "Tránh tưới chiều"] }],
    fert: [
      { id: nid(), title: "Hữu cơ 8-10kg/cây", steps: ["Rải đều theo tán", "Tưới đẫm"] },
      { id: nid(), title: "NPK cân đối (chờ ra hoa)", steps: ["200-300g/cây", "Ưu tiên P/K cao"] },
    ],
    micro: [{ id: nid(), title: "Bo/Zn qua lá", steps: ["Theo nhãn NSX", "Phun sáng sớm"] }],
    pest: [{ id: nid(), title: "Theo dõi rầy/bọ trĩ", steps: ["Bẫy dính vàng", "Quan sát lá non"] }],
    prune: [{ id: nid(), title: "Tỉa thông tán", steps: ["Bỏ cành bệnh/chéo", "Khử trùng dụng cụ"] }],
    infra: [{ id: nid(), title: "Kiểm tra tưới & thoát nước", steps: ["Thông rãnh", "Sửa rò rỉ"] }],
    monitor: [{ id: nid(), title: "Đặt bẫy + đo ẩm", steps: ["Ghi ẩm %", "Cập nhật nhật ký"] }],
    flower: [{ id: nid(), title: "Xử lý ra hoa", steps: ["Giảm tưới 7-10 ngày", "Khoanh vỏ / N thấp"] }],
  },
  bloom: {
    water: [{ id: nid(), title: "Giữ ẩm ổn định", steps: ["8-10L/cây"] }],
    fert: [],
    micro: [{ id: nid(), title: "Bo + Canxi trước/sau nở", steps: ["Theo khuyến cáo"] }],
    pest: [{ id: nid(), title: "Quản lý nấm trên hoa", steps: ["Thoáng tán", "Theo dõi đốm nâu"] }],
    prune: [],
    infra: [{ id: nid(), title: "Che mưa nhẹ khi cần", steps: ["Tránh gió nóng"] }],
    monitor: [{ id: nid(), title: "Ghi tỉ lệ nở/đậu", steps: ["% chùm nở"] }],
    flower: [],
  },
  fruit_dev: {
    water: [{ id: nid(), title: "Giữ ẩm 70-80%", steps: ["10-12L/cây", "Kiểm tra định kỳ"] }],
    fert: [{ id: nid(), title: "Tăng Kali - hạn chế Đạm", steps: ["1-2 lần/đợt"] }],
    micro: [{ id: nid(), title: "Bo/Ca/Mg qua lá", steps: ["Cách 10-14 ngày"] }],
    pest: [{ id: nid(), title: "Bao trái & bẫy ruồi", steps: ["Bao lứa chính"] }],
    prune: [{ id: nid(), title: "Tỉa thưa trái non", steps: ["Giữ mật độ hợp lý"] }],
    infra: [{ id: nid(), title: "Gia cố cọc/dây buộc", steps: ["Tránh gió quật"] }],
    monitor: [{ id: nid(), title: "Theo dõi rụng sinh lý", steps: ["Ghi % rụng"] }],
    flower: [],
  },
  pre_harvest: {
    water: [{ id: nid(), title: "Giảm dần lượng nước", steps: ["Không tưới sát ngày thu"] }],
    fert: [{ id: nid(), title: "Ngừng đạm; có thể bón K nhẹ", steps: ["Theo tình trạng vườn"] }],
    micro: [{ id: nid(), title: "Ca làm cứng vỏ", steps: ["Ngưng trước thu 10-14 ngày"] }],
    pest: [{ id: nid(), title: "Vệ sinh vườn", steps: ["Nhặt trái rụng"] }],
    prune: [],
    infra: [{ id: nid(), title: "Chuẩn bị dụng cụ/kho", steps: ["Khử trùng thùng kéo"] }],
    monitor: [{ id: nid(), title: "Đánh giá độ chín & Brix", steps: ["Chọn ngày thu"] }],
    flower: [],
  },
  post_harvest: {
    water: [{ id: nid(), title: "Tưới phục hồi sau thu", steps: ["8-10L/cây"] }],
    fert: [{ id: nid(), title: "Bón hữu cơ tái tạo đất", steps: ["8-10kg/cây"] }],
    micro: [],
    pest: [{ id: nid(), title: "Theo dõi sâu bệnh", steps: ["Bẫy ruồi/kiến"] }],
    prune: [{ id: nid(), title: "Tỉa phục hồi & dọn vườn", steps: ["Cắt cành già/yếu"] }],
    infra: [{ id: nid(), title: "Khử trùng dụng cụ; thông rãnh", steps: ["Sửa rò rỉ hệ tưới"] }],
    monitor: [{ id: nid(), title: "Tổng kết mùa vụ/KPI", steps: ["Năng suất, chi phí"] }],
    flower: [],
  },
};

const BASE_KEYS = ["water", "fert", "micro", "pest", "prune", "infra", "monitor", "flower"];
const totalOf = (ph) => BASE_KEYS.reduce((n, k) => n + ((ph?.[k] || []).length), 0);

/***** LocalStorage helpers *****/
const storeKey = (treeId) => `careflow_v3_${treeId}`;

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

const loadStore = (treeId) => {
  if (typeof window === "undefined") return { flow: JSON.parse(JSON.stringify(DEFAULT_FLOW)), hide: emptyHide(), custom: emptyCustom() };
  try {
    const raw = localStorage.getItem(storeKey(treeId));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        flow: parsed.flow ?? JSON.parse(JSON.stringify(DEFAULT_FLOW)),
        hide: parsed.hide ?? emptyHide(),
        custom: parsed.custom ?? emptyCustom(),
      };
    }
  } catch {}
  return { flow: JSON.parse(JSON.stringify(DEFAULT_FLOW)), hide: emptyHide(), custom: emptyCustom() };
};

const saveStore = (treeId, s) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(storeKey(treeId), JSON.stringify(s));
};

/***** Main Component *****/
export default function CareFlowEditablePreview() {
  const [treeId, setTreeId] = useState("T-0001");
  const [treeName, setTreeName] = useState("Xoài Cát Chu");
  const DB_ACTIVE_PHASE = "vegetative";

  const visiblePhases = useMemo(() => PHASES.filter((p) => totalOf(DEFAULT_FLOW[p.id]) > 0), []);
  const start = (visiblePhases.find((p) => p.id === DB_ACTIVE_PHASE)?.id || visiblePhases[0]?.id);
  const [phase, setPhase] = useState(start);
  const [editMode, setEditMode] = useState(true);

  const [store, setStore] = useState(() => loadStore(treeId));
  useEffect(() => {
    setStore(loadStore(treeId));
  }, [treeId]);

  const flow = store.flow;
  const hide = store.hide;
  const custom = store.custom;

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
      saveStore(treeId, draft);
      return draft;
    });
  }

  function mutateBase(key, next) {
    console.log("mutateBase called", { phase, key, nextLength: next.length });
    updateStore((d) => {
      console.log("Before mutation:", d.flow[phase][key].length);
      d.flow[phase][key] = next;
      console.log("After mutation:", d.flow[phase][key].length);
    });
  }

  function toggleHide(key) {
    console.log("toggleHide called", { phase, key, currentValue: hide[phase]?.[key] });
    updateStore((d) => {
      const before = d.hide[phase][key];
      d.hide[phase][key] = !d.hide[phase][key];
      console.log("toggleHide mutation:", { before, after: d.hide[phase][key] });
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
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white p-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-600">Cây:</span>
          <select
            className="rounded border px-2 py-1"
            value={treeId}
            onChange={(e) => {
              const v = e.target.value;
              setTreeId(v);
              setTreeName(v === "T-0002" ? "Bưởi Da Xanh" : "Xoài Cát Chu");
            }}
          >
            <option value="T-0001">T-0001 — Xoài Cát Chu</option>
            <option value="T-0002">T-0002 — Bưởi Da Xanh</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setEditMode((s) => !s)} className="rounded-md bg-emerald-600 text-white px-3 py-1.5 text-sm shadow hover:opacity-90">
            {editMode ? "Thoát chỉnh sửa" : "Chỉnh sửa"}
          </button>
        </div>
      </div>
    );
  }

  function ManageBar() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [color, setColor] = useState("slate");
    const [icon, setIcon] = useState("sparkles");

    const hiddenBases = BASE_KEYS.filter((k) => hide[phase]?.[k]);
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
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-emerald-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <h1 className="text-2xl font-semibold">Quy trình — {treeName}</h1>
          <p className="text-white/80 text-sm mt-1">
            Theo giai đoạn • Nhóm: Tưới / Phân bón / Vi lượng / Sâu bệnh / Tỉa tán & vệ sinh / Hạ tầng / KPI
            {cur.flower.length > 0 ? " / Xử lý ra hoa" : ""}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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

        {/* Nhóm cơ bản */}
        <div className="grid md:grid-cols-3 gap-4">
          {!hide[phase]?.water && (
            <Group
              title="Tưới tiêu"
              color="emerald"
              icon={<DropletIcon />}
              tasks={cur.water}
              editMode={editMode}
              onChange={(t) => mutateBase("water", t)}
              onHideGroup={editMode ? () => toggleHide("water") : undefined}
              onDeleteGroup={editMode ? () => mutateBase("water", []) : undefined}
              isBaseGroup={true}
            />
          )}
          {!hide[phase]?.fert && (
            <Group
              title="Phân bón"
              color="amber"
              icon={<FlaskIcon />}
              tasks={cur.fert}
              editMode={editMode}
              onChange={(t) => mutateBase("fert", t)}
              onHideGroup={editMode ? () => toggleHide("fert") : undefined}
              onDeleteGroup={editMode ? () => mutateBase("fert", []) : undefined}
              isBaseGroup={true}
            />
          )}
          {!hide[phase]?.micro && (
            <Group
              title="Vi lượng / Điều hòa"
              color="indigo"
              icon={<FlaskIcon />}
              tasks={cur.micro}
              editMode={editMode}
              onChange={(t) => mutateBase("micro", t)}
              onHideGroup={editMode ? () => toggleHide("micro") : undefined}
              onDeleteGroup={editMode ? () => mutateBase("micro", []) : undefined}
              isBaseGroup={true}
            />
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {!hide[phase]?.pest && (
            <Group
              title="Sâu bệnh (IPM)"
              color="rose"
              icon={<BugIcon />}
              tasks={cur.pest}
              editMode={editMode}
              onChange={(t) => mutateBase("pest", t)}
              onHideGroup={editMode ? () => toggleHide("pest") : undefined}
              onDeleteGroup={editMode ? () => mutateBase("pest", []) : undefined}
              isBaseGroup={true}
            />
          )}
          {!hide[phase]?.prune && (
            <Group
              title="Tỉa tán & vệ sinh"
              color="teal"
              icon={<ScissorsIcon />}
              tasks={cur.prune}
              editMode={editMode}
              onChange={(t) => mutateBase("prune", t)}
              onHideGroup={editMode ? () => toggleHide("prune") : undefined}
              onDeleteGroup={editMode ? () => mutateBase("prune", []) : undefined}
              isBaseGroup={true}
            />
          )}
          {!hide[phase]?.infra && (
            <Group
              title="Hạ tầng & thời tiết"
              color="sky"
              icon={<WrenchIcon />}
              tasks={cur.infra}
              editMode={editMode}
              onChange={(t) => mutateBase("infra", t)}
              onHideGroup={editMode ? () => toggleHide("infra") : undefined}
              onDeleteGroup={editMode ? () => mutateBase("infra", []) : undefined}
              isBaseGroup={true}
            />
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {!hide[phase]?.monitor && (
            <Group
              title="Theo dõi & KPI"
              color="slate"
              icon={<ActivityIcon />}
              tasks={cur.monitor}
              editMode={editMode}
              onChange={(t) => mutateBase("monitor", t)}
              onHideGroup={editMode ? () => toggleHide("monitor") : undefined}
              onDeleteGroup={editMode ? () => mutateBase("monitor", []) : undefined}
              isBaseGroup={true}
            />
          )}
          {!hide[phase]?.flower && (
            <Group
              title="Xử lý ra hoa"
              color="violet"
              icon={<SparklesIcon />}
              tasks={cur.flower}
              editMode={editMode}
              onChange={(t) => mutateBase("flower", t)}
              onHideGroup={editMode ? () => toggleHide("flower") : undefined}
              onDeleteGroup={editMode ? () => mutateBase("flower", []) : undefined}
              isBaseGroup={true}
            />
          )}
        </div>

        {/* NHÓM TUỲ CHỈNH */}
        {custom[phase]?.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            {custom[phase].filter(g => !g.hidden).map((g) => (
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
        )}
      </main>

      <footer className="bg-emerald-900 text-white mt-8">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm">© {new Date().getFullYear()} Mam Moi</div>
      </footer>
    </div>
  );
}

/***** Fishbone timeline - Horizontal Simple Design *****/
function Fishbone({ phases, active, anchor, onSelect, counts, chips }) {
  return (
    <div className="py-8">
      {/* Tiêu đề */}
      <div className="mb-6 flex items-center gap-2">
        <h2 className="text-xl font-bold text-gray-800">Xoài Cát Chu</h2>
      </div>

      {/* Timeline horizontal */}
      <div className="relative">
        {/* Đường nối ngang */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2 z-0" style={{ top: '32px' }} />
        
        {/* Đường progress xanh đến anchor */}
        {(() => {
          const anchorIdx = Math.max(0, phases.findIndex((p) => p.id === anchor));
          const progress = phases.length > 1 ? (anchorIdx / (phases.length - 1)) * 100 : 0;
          return <div className="absolute left-0 h-0.5 bg-emerald-600 z-0" style={{ top: '32px', width: `${progress}%` }} />;
        })()}

        {/* Các giai đoạn */}
        <div className="relative z-10 flex justify-between items-center gap-2">
          {phases.map((p, idx) => {
            const isActive = active === p.id;
            const isAnchor = anchor === p.id;
            const anchorIdx = phases.findIndex((ph) => ph.id === anchor);
            const isPast = idx <= anchorIdx;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p.id)}
                className={`
                  relative flex-1 px-6 py-3 rounded-full border-2 text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                    : isPast
                    ? 'bg-white text-gray-700 border-emerald-600 hover:bg-emerald-50'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }
                  ${isAnchor && !isActive ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}
                `}
                title={isAnchor ? 'Cây đang ở giai đoạn này' : undefined}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chips đếm số lượng */}
      <div className="mt-8 flex flex-wrap justify-center items-center gap-3 text-xs text-gray-600">
        {(chips || []).map((c, i) => (
          <span key={i} className="inline-flex items-center">
            {c.label}: <span className="font-semibold ml-1">{c.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/***** Editable Group *****/
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
  
  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', data: null });

  // Đóng menu khi click bên ngoài
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
    console.log("=== handleHideGroup - Opening modal ===");
    setConfirmModal({ show: true, type: 'hideGroup', data: null });
  }
  
  function handleDeleteGroup(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowMenu(false);
    console.log("=== handleDeleteGroup - Opening modal ===");
    setConfirmModal({ show: true, type: 'deleteGroup', data: null });
  }
  
  function handleRemoveTask(id, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("=== handleRemoveTask - Opening modal ===", id);
    setConfirmModal({ show: true, type: 'removeTask', data: id });
  }
  
  function confirmAction() {
    console.log("=== confirmAction ===", confirmModal);
    
    if (confirmModal.type === 'hideGroup') {
      console.log("Executing hideGroup");
      if (onHideGroup) {
        onHideGroup();
      }
    } else if (confirmModal.type === 'deleteGroup') {
      console.log("Executing deleteGroup");
      if (onDeleteGroup) {
        onDeleteGroup();
      }
    } else if (confirmModal.type === 'removeTask') {
      console.log("Executing removeTask", confirmModal.data);
      const newTasks = tasks.filter((t) => t.id !== confirmModal.data);
      console.log("Old count:", tasks.length, "New count:", newTasks.length);
      onChange(newTasks);
    }
    
    setConfirmModal({ show: false, type: '', data: null });
  }
  
  function cancelAction() {
    console.log("=== cancelAction ===");
    setConfirmModal({ show: false, type: '', data: null });
  }

  return (
    <Card className="relative">
      {/* Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelAction}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6">
              {/* Header cho ẨN NHÓM */}
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
              
              {/* Header cho XÓA NHÓM */}
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
              
              {/* Header cho XÓA BƯỚC */}
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
              
              {/* Nội dung chi tiết cho ẨN NHÓM */}
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
              
              {/* Nội dung chi tiết cho XÓA NHÓM */}
              {confirmModal.type === 'deleteGroup' && (
                <div className="text-sm text-gray-700 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="font-semibold text-gray-900 mb-1">📦 Nhóm: {title}</p>
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
                        <span>Nhóm "{title}" sẽ bị <strong>XÓA VĨNH VIỄN</strong></span>
                      </li>
                      <li className="text-red-800 flex items-start gap-2">
                        <span className="text-red-600 font-bold">✗</span>
                        <span>Tất cả <strong>{tasks?.length || 0} bước công việc</strong> sẽ <strong>MẤT HOÀN TOÀN</strong></span>
                      </li>
                      <li className="text-red-800 flex items-start gap-2">
                        <span className="text-red-600 font-bold">✗</span>
                        <span>Hành động <strong>KHÔNG THỂ HOÀN TÁC</strong></span>
                      </li>
                      <li className="text-red-800 flex items-start gap-2">
                        <span className="text-red-600 font-bold">✗</span>
                        <span>Bạn phải <strong>TẠO LẠI TỪ ĐẦU</strong> nếu cần</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Nội dung chi tiết cho XÓA BƯỚC */}
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
            
            {/* Action buttons */}
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
    
      <CardHeader className="pb-2 relative z-20">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${tone[color]}`}>{icon}</span>
            {title}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">{tasks?.length || 0} bước</span>
            {editMode && (onHideGroup || onDeleteGroup) && (
              <div className="relative">
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="pointer-events-auto relative z-30 inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 transition-colors"
                  title="Tùy chọn nhóm"
                >
                  <span className="text-gray-600">⋮</span>
                </button>
                
                {/* Dropdown Menu */}
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
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        {(!tasks || tasks.length === 0) && !adding && <div className="text-sm text-neutral-500">Chưa có bước.</div>}
        {(tasks || []).map((t) => (
          <div key={t.id} className="rounded-xl border p-3 bg-white relative">
            {editingId === t.id ? (
              <div className="space-y-2 relative z-20">
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" placeholder="Tiêu đề" />
                <textarea value={editSteps} onChange={(e) => setEditSteps(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" placeholder="Các bước, ngăn bằng |" />
                <div className="flex gap-2">
                  <button type="button" onClick={saveEdit} className="inline-flex items-center gap-1 rounded bg-emerald-600 text-white px-3 py-1 text-xs">
                    <SaveIcon /> Lưu
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center gap-1 rounded bg-neutral-200 px-3 py-1 text-xs">
                    <XIcon /> Hủy
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="font-medium text-sm">{t.title}</div>
                <ul className="text-xs text-neutral-700 list-disc ml-5 mt-1 space-y-0.5">
                  {t.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
                {editMode && (
                  <div className="mt-2 flex gap-2 relative z-30">
                    <button 
                      type="button" 
                      onClick={() => beginEdit(t)} 
                      className="pointer-events-auto inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-neutral-50"
                    >
                      <PencilIcon /> Sửa
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => handleRemoveTask(t.id, e)} 
                      className="pointer-events-auto inline-flex items-center gap-1 rounded border px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" 
                      title="Xóa bước"
                    >
                      <TrashIcon /> Xóa bước
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {editMode && !adding && (
          <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-xs hover:bg-neutral-50 relative z-20">
            <PlusIcon /> Thêm bước
          </button>
        )}
        {editMode && adding && (
          <div className="rounded-xl border p-3 bg-white space-y-2 relative z-20">
            <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" placeholder="Tiêu đề" />
            <textarea value={draftSteps} onChange={(e) => setDraftSteps(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" placeholder="Các bước, ngăn bằng | (ví dụ: Khơi thông rãnh | Chuẩn bị máy bơm)" />
            <div className="flex gap-2">
              <button type="button" onClick={addTask} className="inline-flex items-center gap-1 rounded bg-emerald-600 text-white px-3 py-1 text-xs">
                <SaveIcon /> Lưu
              </button>
              <button type="button" onClick={() => setAdding(false)} className="inline-flex items-center gap-1 rounded bg-neutral-200 px-3 py-1 text-xs">
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
    case "water": return { title: "Tưới tiêu" };
    case "fert": return { title: "Phân bón" };
    case "micro": return { title: "Vi lượng / Điều hòa" };
    case "pest": return { title: "Sâu bệnh (IPM)" };
    case "prune": return { title: "Tỉa tán & vệ sinh" };
    case "infra": return { title: "Hạ tầng & thời tiết" };
    case "monitor": return { title: "Theo dõi & KPI" };
    case "flower": return { title: "Xử lý ra hoa" };
    default: return { title: String(k) };
  }
}