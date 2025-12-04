import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ArrowDown } from "lucide-react";
import TreeRepository from "@/API/repositories/TreeRepository";
import {
  DEFAULT_PHASE_THEME,
  getOrderedPhases,
  LIFECYCLE_COLOR_LOOKUP,
  normalizeLifecycleTheme,
  PHASE_IDS,
} from "@/lib/lifecycleTheme";

// =========================================================================
// Phase ID Aliases & Helpers
// =========================================================================
const PHASE_ID_ALIASES = {
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

// Chuẩn hoá phaseId từ nhiều nguồn (DB / theme) về 5 giá trị chuẩn backend chấp nhận
// Ví dụ: "post_harvest_4" -> "post_harvest"
function normalizePhaseId(x) {
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

function mapPhaseIdFromText(txt = "") {
  return normalizePhaseId(txt);
}

// Export helper functions for use in TreeDetail.jsx
export { normalizePhaseId, mapPhaseIdFromText };

function toDateOnlyString(d) {
  if (!d) return null;
  if (typeof d === "string") return d; // đã là "yyyy-MM-dd"
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return null;
}

// =========================================================================
// LCTransientPath Component
// =========================================================================
function LCTransientPath({
  d,
  color,
  duration = 950,
  headSize = 10,
  headPad = 8,
  mode = "grow",
  headVisible = true,
}) {
  const pathRef = useRef(null);
  const headRef = useRef(null);
  const rafRef = useRef(null);

  useLayoutEffect(() => {
    const path = pathRef.current;
    const head = headRef.current;
    if (!path) return;

    const total = path.getTotalLength();
    path.style.strokeDasharray = `${total}`;
    path.style.willChange = "stroke-dashoffset";
    path.style.strokeDashoffset = mode === "grow" ? `${total}` : `0`;

    let start = null,
      stop = false;
    const step = (ts) => {
      if (stop) return;
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / duration);

      if (mode === "grow") {
        const usable = Math.max(0, total - headPad);
        const shown = usable * t;
        path.style.strokeDashoffset = `${total - shown}`;
        if (headVisible && head) {
          const pLen = Math.min(total - headPad, shown);
          const p = path.getPointAtLength(pLen);
          const prev = path.getPointAtLength(Math.max(0, pLen - 1));
          const angle =
            Math.atan2(p.y - prev.y, p.x - prev.x) * (180 / Math.PI);
          head.setAttribute(
            "transform",
            `translate(${p.x}, ${p.y}) rotate(${angle})`
          );
        }
      } else {
        path.style.strokeDashoffset = `${total * t}`;
      }
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stop = true;
    };
  }, [d, duration, headPad, mode, headVisible]);

  return (
    <g>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="butt"
        strokeLinejoin="round"
        opacity="0.98"
        style={{ vectorEffect: "non-scaling-stroke" }}
      />
      {headVisible && (
        <g ref={headRef}>
          <polygon
            points={`0,0 -${headSize},-${headSize / 2} -${headSize},${
              headSize / 2
            }`}
            fill={color}
            opacity="0.98"
          />
        </g>
      )}
    </g>
  );
}

// =========================================================================
// LifecycleTimeline Component
// =========================================================================
function LifecycleTimeline({
  activePhase,
  previewPhase,
  isPhase1Completed,
  isSpinning,
  treeData,
  treeId,
  treeType,
  treeVariety,
  transitionFlow,
  transitionKey,
  p1Transition,
  p1Key,
  trailIndex,
  suppressId,
  isBackwardRun,
  postHideIdx,
  onPhaseGateChange,
  phaseConfigs,
  editableNodes = false,
  onNodeClick,
  onNodeReorder,
}) {
  const defaultPhase1 = {
    id: "growth_development",
    canonicalPhaseId: "growth_development",
    name: "Sinh trưởng & Phát triển",
    icon: "🌱",
    color: "emerald",
    colorHex: LIFECYCLE_COLOR_LOOKUP.emerald,
    lineColorHex: LIFECYCLE_COLOR_LOOKUP.emerald,
    iconImageUrl: null,
    stageId: null,
    stageOrder: 1,
  };
  const defaultCyclePhases = [
    {
      id: "flowering",
      canonicalPhaseId: "flowering",
      name: "Ra Hoa",
      icon: "🌸",
      color: "pink",
      colorHex: LIFECYCLE_COLOR_LOOKUP.pink,
      lineColorHex: LIFECYCLE_COLOR_LOOKUP.pink,
      iconImageUrl: null,
      stageId: null,
      stageOrder: 2,
    },
    {
      id: "fruiting",
      canonicalPhaseId: "fruiting",
      name: "Ra quả",
      icon: "🍎",
      color: "lime",
      colorHex: LIFECYCLE_COLOR_LOOKUP.lime,
      lineColorHex: LIFECYCLE_COLOR_LOOKUP.lime,
      iconImageUrl: null,
      stageId: null,
      stageOrder: 3,
    },
    {
      id: "pre_harvest",
      canonicalPhaseId: "pre_harvest",
      name: "Trước thu hoạch",
      icon: "🔍",
      color: "amber",
      colorHex: LIFECYCLE_COLOR_LOOKUP.amber,
      lineColorHex: LIFECYCLE_COLOR_LOOKUP.amber,
      iconImageUrl: null,
      stageId: null,
      stageOrder: 4,
    },
    {
      id: "post_harvest",
      canonicalPhaseId: "post_harvest",
      name: "Sau thu hoạch",
      icon: "🌿",
      color: "teal",
      colorHex: LIFECYCLE_COLOR_LOOKUP.teal,
      lineColorHex: LIFECYCLE_COLOR_LOOKUP.teal,
      iconImageUrl: null,
      stageId: null,
      stageOrder: 5,
    },
  ];

  const phase1 = useMemo(() => {
    if (!phaseConfigs?.phase1) return defaultPhase1;
    const cfg = phaseConfigs.phase1;
    const colorKey = (cfg.colorKey || defaultPhase1.color).toLowerCase();
    const colorHex =
      cfg.colorHex ||
      LIFECYCLE_COLOR_LOOKUP[colorKey] ||
      defaultPhase1.colorHex;
    const lineColorHex =
      cfg.lineColorHex ||
      LIFECYCLE_COLOR_LOOKUP[cfg.lineColorKey || colorKey] ||
      colorHex ||
      defaultPhase1.lineColorHex;
    return {
      id: cfg.phaseId || defaultPhase1.id,
      phaseId: cfg.phaseId || defaultPhase1.id,
      canonicalPhaseId:
        cfg.canonicalPhaseId ||
        defaultPhase1.canonicalPhaseId ||
        normalizePhaseId(cfg.phaseId || defaultPhase1.id),
      stageId: cfg.stageId ?? defaultPhase1.stageId ?? null,
      stageOrder: cfg.stageOrder ?? defaultPhase1.stageOrder ?? 1,
      name: cfg.label || defaultPhase1.name,
      icon: cfg.icon || defaultPhase1.icon,
      iconImageUrl: cfg.iconImageUrl || null,
      color: colorKey,
      colorHex,
      lineColorHex,
    };
  }, [phaseConfigs]);

  const cyclePhases = useMemo(() => {
    // Nếu phaseConfigs.cycles được cung cấp (kể cả mảng rỗng), sử dụng nó
    // Chỉ fallback về defaultCyclePhases khi cycles không được định nghĩa
    const hasExplicitCycles = Array.isArray(phaseConfigs?.cycles);
    const source = hasExplicitCycles ? phaseConfigs.cycles : defaultCyclePhases;

    return source.map((phase) => {
      const phaseId = phase.phaseId || phase.id;
      const colorKey = (
        phase.colorKey ||
        phase.color ||
        "emerald"
      ).toLowerCase();
      const colorHex =
        phase.colorHex ||
        LIFECYCLE_COLOR_LOOKUP[colorKey] ||
        LIFECYCLE_COLOR_LOOKUP.emerald;
      const lineColorHex =
        phase.lineColorHex ||
        LIFECYCLE_COLOR_LOOKUP[phase.lineColorKey || colorKey] ||
        colorHex ||
        LIFECYCLE_COLOR_LOOKUP.emerald;
      return {
        id: phaseId,
        phaseId,
        canonicalPhaseId: phase.canonicalPhaseId || normalizePhaseId(phaseId),
        stageId: phase.stageId ?? null,
        stageOrder: phase.stageOrder ?? null,
        name: phase.label || phase.name || phaseId,
        icon: phase.icon || "🌿",
        iconImageUrl: phase.iconImageUrl || null,
        color: colorKey,
        colorHex,
        lineColorHex,
      };
    });
  }, [phaseConfigs]);

  const phaseList = useMemo(() => {
    const list = [];
    if (phase1) list.push(phase1);
    if (Array.isArray(cyclePhases) && cyclePhases.length) {
      list.push(...cyclePhases);
    }
    return list;
  }, [phase1, cyclePhases]);

  const findPhaseById = useCallback(
    (phaseId) =>
      phaseList.find(
        (phase) =>
          phase.id === phaseId ||
          phase.phaseId === phaseId ||
          phase.phaseId === normalizePhaseId(phaseId)
      ) || null,
    [phaseList]
  );

  const findPhaseByStageId = useCallback(
    (stageId) =>
      stageId == null
        ? null
        : phaseList.find((phase) => phase.stageId === stageId) || null,
    [phaseList]
  );

  const findPhaseByCanonical = useCallback(
    (canonicalId) =>
      !canonicalId
        ? null
        : phaseList.find(
            (phase) =>
              phase.canonicalPhaseId === canonicalId ||
              phase.phaseId === canonicalId
          ) || null,
    [phaseList]
  );

  // Lấy nhãn giai đoạn từ cấu hình phaseTheme/DB thay vì mock cứng
  const labelOf = useCallback(
    (id) => {
      if (!id) return "";
      const match =
        findPhaseById(id) || findPhaseByCanonical(normalizePhaseId(id));
      return match?.name || id;
    },
    [findPhaseByCanonical, findPhaseById]
  );

  const palette = {
    emerald: {
      active: "bg-emerald-600 border-emerald-400 shadow-emerald-300 text-white",
      default: "bg-white border-gray-200",
      badge: "bg-emerald-50 border-emerald-300 text-emerald-800",
      solid: "bg-emerald-600 text-white",
      ping: "bg-emerald-400/60",
    },
    pink: {
      active: "bg-pink-600 border-pink-400 shadow-pink-300 text-white",
      default: "bg-white border-gray-200",
      badge: "bg-pink-50 border-pink-300 text-pink-800",
      solid: "bg-pink-600 text-white",
      ping: "bg-pink-400/60",
    },
    lime: {
      active: "bg-lime-600 border-lime-400 shadow-lime-300 text-white",
      default: "bg-white border-gray-200",
      badge: "bg-lime-50 border-lime-300 text-lime-800",
      solid: "bg-lime-600 text-white",
      ping: "bg-lime-400/60",
    },
    amber: {
      active: "bg-amber-600 border-amber-400 shadow-amber-300 text-white",
      default: "bg-white border-gray-200",
      badge: "bg-amber-50 border-amber-300 text-amber-800",
      solid: "bg-amber-600 text-white",
      ping: "bg-amber-400/60",
    },
    teal: {
      active: "bg-teal-600 border-teal-400 shadow-teal-300 text-white",
      default: "bg-white border-gray-200",
      badge: "bg-teal-50 border-teal-300 text-teal-800",
      solid: "bg-teal-600 text-white",
      ping: "bg-teal-400/60",
    },
    slate: {
      active: "bg-slate-700 border-slate-500 shadow-slate-300 text-white",
      default: "bg-white border-gray-200",
      badge: "bg-slate-50 border-slate-300 text-slate-800",
      solid: "bg-slate-700 text-white",
      ping: "bg-slate-500/60",
    },
  };
  const getToneKey = (color) => (palette[color] ? color : "emerald");
  const getColorClasses = (color, activeLike) => {
    const key = getToneKey(color);
    return activeLike ? palette[key].active : palette[key].default;
  };
  const getBadgeTone = (color) => palette[getToneKey(color)].badge;
  const getSolidTone = (color) => palette[getToneKey(color)].solid;
  const getPingTone = (color) => palette[getToneKey(color)].ping;

  // ==== Geometry (đã thu gọn để vừa cột Aside) ====
  const cycleCount = cyclePhases.length || 1;
  // Scale radius and ring size based on number of phases
  // Base: 4 phases -> radius 92, RING_SIZE 240
  // Each additional phase adds 12px to radius and 40px to RING_SIZE
  const radius = 92 + Math.max(0, (cycleCount - 4) * 12);
  const RING_SIZE = 240 + Math.max(0, (cycleCount - 4) * 40);
  const centerX = RING_SIZE / 2,
    centerY = RING_SIZE / 2;
  const nodeR = 26,
    STROKE = 4,
    HEAD_SIZE = 10,
    HEAD_PAD = HEAD_SIZE * 0.85,
    MASK_INSET = 6;

  const GUIDE_ARROW_COUNT = 2,
    GUIDE_ARROW_SIZE = 7;
  const PHASE_COLORS = useMemo(() => {
    return cyclePhases.reduce((acc, phase) => {
      acc[phase.id] = phase.lineColorHex || "#10b981";
      return acc;
    }, {});
  }, [cyclePhases]);

  const getCirclePosition = (index, total = cycleCount) => {
    const angle = index * ((2 * Math.PI) / total) - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle,
    };
  };
  const alphaGap = Math.asin(Math.min(1, (nodeR + MASK_INSET) / radius));
  const buildArcD = (a0, a1, r, sweep = 1) => {
    const sx = centerX + r * Math.cos(a0),
      sy = centerY + r * Math.sin(a0);
    const ex = centerX + r * Math.cos(a1),
      ey = centerY + r * Math.sin(a1);
    return `M ${sx} ${sy} A ${r} ${r} 0 0 ${sweep} ${ex} ${ey}`;
  };
  const trimAngles = (iFrom, iTo) => {
    const total = cycleCount;
    const from = getCirclePosition(iFrom, total).angle;
    const to = getCirclePosition(iTo, total).angle;
    return { thetaStart: from + alphaGap, thetaEnd: to - alphaGap };
  };
  const tangentAngleAtEnd = (thetaEnd, r, eps = 0.04) => {
    const ex = centerX + r * Math.cos(thetaEnd),
      ey = centerY + r * Math.sin(thetaEnd);
    const px = centerX + r * Math.cos(thetaEnd - eps),
      py = centerY + r * Math.sin(thetaEnd - eps);
    return Math.atan2(ey - py, ex - px);
  };

  // transient config (grow/shrink)
  let transientConfig = null;
  if (transitionFlow) {
    const fromIdx = cyclePhases.findIndex((p) => p.id === transitionFlow.from);
    const toIdx = cyclePhases.findIndex((p) => p.id === transitionFlow.to);
    if (fromIdx > -1 && toIdx > -1) {
      const forward = (fromIdx + 1) % cycleCount === toIdx;
      const backward = (toIdx + 1) % cycleCount === fromIdx;
      if (forward || backward) {
        const { thetaStart, thetaEnd } = trimAngles(fromIdx, toIdx);
        const color =
          PHASE_COLORS[
            backward ? cyclePhases[toIdx].id : cyclePhases[fromIdx].id
          ] || "#10b981";
        const retract = backward;
        const d = retract
          ? buildArcD(thetaEnd, thetaStart, radius, 1)
          : buildArcD(thetaStart, thetaEnd, radius, 1);
        transientConfig = { fromIdx, toIdx, retract, d, color, thetaEnd };
      }
    }
  }

  const showP1Idle =
    normalizePhaseId(activePhase) === "growth_development" &&
    !isPhase1Completed &&
    !p1Transition;
  const css = `
    @keyframes dashFlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -28; } }
    .flow-line { animation: dashFlow 2.2s linear infinite; }
    @keyframes dashFlowSlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -28; } }
    .flow-arc-slow { animation: dashFlowSlow 5.5s linear infinite; }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    .fade-in-160 { animation: fadeIn .16s ease-out both; }
    @keyframes spin-once { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin-once { animation: spin-once 1s ease-in-out; }
  `;

  const renderRingMask = () => (
    <mask id="ringMask" maskUnits="userSpaceOnUse">
      <rect x="0" y="0" width={RING_SIZE} height={RING_SIZE} fill="black" />
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth={STROKE * 6}
      />
      {Array.from({ length: cycleCount }).map((_, idx) => {
        const { x, y } = getCirclePosition(idx, cycleCount);
        return (
          <circle key={idx} cx={x} cy={y} r={nodeR + MASK_INSET} fill="black" />
        );
      })}
    </mask>
  );

  const renderGuideArrows = () => {
    return cyclePhases.map((_, i) => {
      let { thetaStart, thetaEnd } = trimAngles(i, (i + 1) % cycleCount);
      if (thetaEnd <= thetaStart) thetaEnd += Math.PI * 2;
      const color = PHASE_COLORS[cyclePhases[i].id];
      const seg = buildArcD(thetaStart, thetaEnd, radius, 1);

      const arrows = [];
      for (let k = 1; k <= 2; k++) {
        const t = k / 3;
        const ang = thetaStart + (thetaEnd - thetaStart) * t;
        const x = centerX + radius * Math.cos(ang);
        const y = centerY + radius * Math.sin(ang);
        const deg = (ang + Math.PI / 2) * (180 / Math.PI);
        arrows.push(
          <g
            key={`a-${i}-${k}`}
            transform={`translate(${x}, ${y}) rotate(${deg})`}
            opacity={0.55}
          >
            <polygon points={`0,0 -7,-3.5 -7,3.5`} fill={color} />
          </g>
        );
      }

      return (
        <g key={`g-${i}`} mask="url(#ringMask)">
          <path
            d={seg}
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity="0.10"
            style={{ vectorEffect: "non-scaling-stroke" }}
          />
          {arrows}
        </g>
      );
    });
  };

  const currentPhaseId = treeData?.currentPhase ?? activePhase ?? phase1.id;
  const phaseName = (id) => {
    const found = findPhaseById(id) || findPhaseByCanonical(id);
    return found?.name || id;
  };
  const currentLabel = phaseName(currentPhaseId);

  const activePhaseCanonical = useMemo(() => {
    const meta =
      findPhaseById(activePhase) || findPhaseByCanonical(activePhase);
    return meta?.canonicalPhaseId || normalizePhaseId(activePhase);
  }, [activePhase, findPhaseByCanonical, findPhaseById]);
  const isBackwardStep = !!(
    transitionFlow &&
    transientConfig &&
    transientConfig.retract
  );
  const removingArcIdx = isBackwardStep ? transientConfig?.toIdx : -1;
  // [ANCHOR: PHASE-GATING]
  const canEditFlower = useMemo(
    () =>
      ["flowering", "fruiting", "pre_harvest", "post_harvest"].includes(
        activePhaseCanonical
      ),
    [activePhaseCanonical]
  );

  const canEditFruit = useMemo(
    () =>
      ["fruiting", "pre_harvest", "post_harvest"].includes(
        activePhaseCanonical
      ),
    [activePhaseCanonical]
  );

  // Mỗi lần phase hiện tại đổi → báo cho TreeDetail biết
  useEffect(() => {
    if (typeof onPhaseGateChange === "function") {
      onPhaseGateChange({
        currentPhaseId: activePhaseCanonical,
        canEditFlower,
        canEditFruit,
      });
    }
  }, [onPhaseGateChange, activePhaseCanonical, canEditFlower, canEditFruit]);

  const typeLabel = treeType || "—";
  const varietyLabel = treeVariety || "—";

  const getSizeForCenterText = (text, baseCls) => {
    const len = (text || "").length;

    if (len <= 10) {
      // ngắn → to
      return baseCls + " text-[13px]";
    }
    if (len <= 18) {
      // trung bình
      return baseCls + " text-[11px]";
    }
    // rất dài → nhỏ lại
    return baseCls + " text-[9px]";
  };
  const connectorColor =
    PHASE_COLORS[cyclePhases[0]?.id] || phase1.lineColorHex || "#ec4899";
  const nodeLayerRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const dragStateRef = useRef(null);
  const nodeInteractionEnabled =
    editableNodes || typeof onNodeClick === "function";
  const allowPhase1Click = typeof onNodeClick === "function";
  const segmentAngle = cyclePhases.length
    ? (2 * Math.PI) / cyclePhases.length
    : 0;

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const computeIndexFromPointer = useCallback(
    (clientX, clientY) => {
      if (!nodeLayerRef.current || !cyclePhases.length || !segmentAngle) {
        return null;
      }
      const rect = nodeLayerRef.current.getBoundingClientRect();
      const relX = clientX - (rect.left + centerX);
      const relY = clientY - (rect.top + centerY);
      const angle = Math.atan2(relY, relX);
      const normalized = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
      const rawIndex = Math.round(normalized / segmentAngle);
      const clamped = Math.min(Math.max(rawIndex, 0), cyclePhases.length - 1);
      return clamped;
    },
    [centerX, centerY, cyclePhases.length, segmentAngle]
  );

  const handlePointerMove = useCallback((event) => {
    setDragState((prev) => {
      if (!prev) return prev;
      const hasMoved =
        prev.hasMoved ||
        Math.abs(event.clientX - prev.pointer.x) > 2 ||
        Math.abs(event.clientY - prev.pointer.y) > 2;
      return {
        ...prev,
        pointer: { x: event.clientX, y: event.clientY },
        hasMoved,
      };
    });
  }, []);

  const handlePointerUp = useCallback(
    (event) => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      const state = dragStateRef.current;
      dragStateRef.current = null;
      if (!state) return;
      setDragState(null);

      if (
        state.hasMoved &&
        editableNodes &&
        typeof onNodeReorder === "function"
      ) {
        const dropIndex = computeIndexFromPointer(event.clientX, event.clientY);
        if (
          dropIndex !== null &&
          dropIndex !== state.originIndex &&
          dropIndex >= 0
        ) {
          onNodeReorder(state.id, dropIndex);
        }
      } else if (!state.hasMoved && typeof onNodeClick === "function") {
        onNodeClick(state.id);
      }
    },
    [
      handlePointerMove,
      editableNodes,
      onNodeReorder,
      computeIndexFromPointer,
      onNodeClick,
    ]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const startDrag = useCallback(
    (phaseId, idx, event) => {
      if (!editableNodes) return;
      event.preventDefault();
      event.stopPropagation();
      if (!nodeLayerRef.current) return;

      const layerRect = nodeLayerRef.current.getBoundingClientRect();
      const total = cyclePhases.length || 1;
      const angle = idx * ((2 * Math.PI) / total) - Math.PI / 2;
      const nodeCenter = {
        x: layerRect.left + centerX + radius * Math.cos(angle),
        y: layerRect.top + centerY + radius * Math.sin(angle),
      };
      const pointer = { x: event.clientX, y: event.clientY };
      const offset = {
        x: pointer.x - nodeCenter.x,
        y: pointer.y - nodeCenter.y,
      };
      const initialState = {
        id: phaseId,
        originIndex: idx,
        pointer,
        offset,
        hasMoved: false,
      };
      dragStateRef.current = initialState;
      setDragState(initialState);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [
      editableNodes,
      cyclePhases.length,
      handlePointerMove,
      handlePointerUp,
      centerX,
      centerY,
      radius,
    ]
  );

  return (
    <div className="w-full">
      <style>{css}</style>

      <div className="flex flex-col items-center gap-2">
        {/* Header nhỏ hiển thị giai đoạn hiện tại */}
        <div className="flex flex-col items-center select-none">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm md:text-base mb-2 w-full">
            <span className="text-neutral-700 shrink-0">
              Giai đoạn hiện tại của cây:
            </span>

            {/* pill cho phép wrap + giới hạn rộng để không đè icon */}
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold
               ${getBadgeTone(phase1.color)}
               max-w-[240px] whitespace-normal break-words leading-tight text-center`}
              title={currentLabel}
            >
              {currentLabel}
            </span>

            <span className="text-neutral-400 shrink-0">•</span>
            <span className="text-neutral-500 shrink-0">
              #{treeId || treeData?.id || "—"}
            </span>
          </div>

          <div
            className={`relative w-12 h-12 rounded-full border-4 shadow-lg flex items-center justify-center text-lg mb-1.5 ${
              allowPhase1Click
                ? "cursor-pointer pointer-events-auto"
                : "pointer-events-none"
            }
              ${getColorClasses(phase1.color, activePhase === phase1.id)} ${
              isPhase1Completed ? "opacity-40 grayscale" : ""
            }`}
            onClick={
              allowPhase1Click
                ? (event) => {
                    event.stopPropagation();
                    onNodeClick(phase1.id);
                  }
                : undefined
            }
          >
            {phase1.iconImageUrl ? (
              <img
                src={phase1.iconImageUrl}
                alt={phase1.name}
                className={`h-7 w-7 object-contain ${
                  isPhase1Completed ? "opacity-60" : ""
                }`}
              />
            ) : (
              <span>{phase1.icon}</span>
            )}
            {activePhase === phase1.id && !isPhase1Completed && (
              <span
                className={`absolute inset-0 rounded-full animate-ping ${getPingTone(
                  phase1.color
                )}`}
              />
            )}
          </div>
          <div
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-center ring-1 ring-black/5 shadow-sm
  ${
    isPhase1Completed
      ? "bg-white text-gray-700 border border-gray-200 opacity-70"
      : getSolidTone(phase1.color)
  }`}
          >
            {phase1.name}
          </div>
        </div>

        {/* Connector P1 → Ra hoa - chỉ hiển thị khi có cycle phases */}
        {cyclePhases.length > 0 && (
          <svg
            width={RING_SIZE}
            height="56"
            viewBox={`0 0 ${RING_SIZE} 56`}
            className="overflow-visible my-0.5"
          >
            {activePhaseCanonical === "growth_development" && showP1Idle && (
              <>
                <line
                  x1={centerX}
                  y1="6"
                  x2={centerX}
                  y2="48"
                  stroke={connectorColor}
                  strokeWidth="3"
                  strokeDasharray="10,8"
                  strokeLinecap="round"
                  opacity={0.9}
                  className="flow-line"
                />
                <polygon
                  points={`${centerX},54 ${centerX - 8},46 ${centerX + 8},46`}
                  fill={connectorColor}
                  opacity={0.95}
                />
              </>
            )}
            {p1Transition && (
              <LCTransientPath
                key={`p1-${p1Key}`}
                d={`M ${centerX} 6 L ${centerX} 48`}
                color={connectorColor}
                duration={950}
                headSize={10}
                headPad={6}
                mode="grow"
                headVisible
              />
            )}
            {!showP1Idle && isPhase1Completed && !p1Transition && (
              <>
                <line
                  x1={centerX}
                  y1="6"
                  x2={centerX}
                  y2="48"
                  stroke="#cbd5e1"
                  strokeWidth="3"
                  strokeDasharray="10,8"
                  strokeLinecap="round"
                  opacity={0.6}
                />
                <polygon
                  points={`${centerX},54 ${centerX - 8},46 ${centerX + 8},46`}
                  fill="#cbd5e1"
                  opacity={0.7}
                />
              </>
            )}
          </svg>
        )}

        {/* Hiển thị thông tin cây khi chỉ có 1 giai đoạn (không có cycle phases) */}
        {cyclePhases.length === 0 && (
          <div className="mt-4 flex justify-center">
            <div
              className="bg-white/90 backdrop-blur rounded-2xl shadow-xl ring-1 ring-black/5
                          px-6 py-4 text-center"
            >
              <div className="text-[10px] text-gray-500 font-medium leading-tight">
                Loại cây
              </div>
              <div className="font-bold text-emerald-600 text-sm leading-tight">
                {typeLabel}
              </div>
              <div className="text-[10px] text-gray-500 font-medium mt-1 leading-tight">
                Giống
              </div>
              <div className="text-gray-700 font-semibold text-sm leading-tight">
                {varietyLabel}
              </div>
              <div className="text-[9px] text-gray-400 mt-1 leading-tight">
                ID: {treeId || treeData?.id || "—"}
              </div>
              <div className="mt-3 text-xs text-amber-600 font-medium">
                Chỉ có 1 giai đoạn được cấu hình
              </div>
            </div>
          </div>
        )}

        {/* Vòng tròn - chỉ hiển thị khi có cycle phases */}
        {cyclePhases.length > 0 && (
          <div
            className="relative"
            style={{ width: RING_SIZE, height: RING_SIZE }}
          >
            {/* center info */}
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div
                className="bg-white/90 backdrop-blur rounded-full shadow-xl ring-1 ring-black/5
                            w-24 h-24 flex flex-col items-center justify-center p-2 text-center"
              >
                <div className="text-[9px] text-gray-500 font-medium leading-tight">
                  Loại cây
                </div>

                <div
                  className={getSizeForCenterText(
                    typeLabel,
                    "font-bold text-emerald-600 leading-tight max-w-[72px] break-words"
                  )}
                >
                  {typeLabel}
                </div>

                <div className="text-[9px] text-gray-500 font-medium mt-0.5 leading-tight">
                  Giống
                </div>

                <div
                  className={getSizeForCenterText(
                    varietyLabel,
                    "text-gray-700 font-semibold leading-tight max-w-[72px] break-words"
                  )}
                >
                  {varietyLabel}
                </div>

                <div className="text-[8px] text-gray-400 mt-0.5 leading-tight">
                  ID: {treeId || treeData?.id || "—"}
                </div>
              </div>
            </div>

            <div
              className={`absolute inset-0 ${
                isSpinning ? "animate-spin-once" : ""
              }`}
              style={{ transformOrigin: "50% 50%" }}
            >
              <svg
                className="absolute inset-0 w-full h-full z-10"
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                shapeRendering="geometricPrecision"
              >
                {renderRingMask()}
                {renderGuideArrows()}

                {cyclePhases.map((phase, index) => {
                  const nIndex = (index + 1) % cyclePhases.length;
                  const { thetaStart, thetaEnd } = trimAngles(index, nIndex);
                  const isActive = activePhase === phase.id;
                  const isPreview = previewPhase === phase.id;

                  const persistedBase =
                    isPhase1Completed &&
                    trailIndex >= 1 &&
                    index <= trailIndex - 1;
                  const persisted =
                    isBackwardRun && index === removingArcIdx
                      ? false
                      : persistedBase;

                  const color = PHASE_COLORS[phase.id] || "#10b981";
                  const dArc = buildArcD(thetaStart, thetaEnd, radius, 1);
                  const endX = centerX + radius * Math.cos(thetaEnd);
                  const endY = centerY + radius * Math.sin(thetaEnd);
                  const tanDeg =
                    (tangentAngleAtEnd(thetaEnd, radius) * 180) / Math.PI;

                  const hideStaticFrom =
                    transitionFlow && index === transientConfig?.fromIdx;
                  const hideStaticTo =
                    transitionFlow && index === transientConfig?.toIdx;
                  const hideStaticCurr =
                    !transitionFlow && (isActive || isPreview);
                  const hideRemoving =
                    isBackwardRun && index === removingArcIdx;
                  const hidePost =
                    postHideIdx !== null && index === postHideIdx;

                  return (
                    <g key={`arc-${phase.id}`} mask="url(#ringMask)">
                      {isPhase1Completed && (
                        <>
                          <path
                            d={dArc}
                            fill="none"
                            stroke={persisted ? color : "#d1d5db"}
                            strokeWidth={STROKE}
                            opacity={persisted ? "0.65" : "0.35"}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ vectorEffect: "non-scaling-stroke" }}
                            strokeDasharray={persisted ? "16 12" : undefined}
                            className={persisted ? "flow-arc-slow" : undefined}
                          />
                          <g
                            transform={`translate(${endX}, ${endY}) rotate(${tanDeg})`}
                            opacity={
                              hideStaticFrom ||
                              hideStaticTo ||
                              hideStaticCurr ||
                              hideRemoving ||
                              hidePost
                                ? 0
                                : 1
                            }
                            className="fade-in-160"
                          >
                            <polygon
                              points={`0,0 -${HEAD_SIZE},-${
                                HEAD_SIZE / 2
                              } -${HEAD_SIZE},${HEAD_SIZE / 2}`}
                              fill={persisted ? color : "#d1d5db"}
                              opacity={persisted ? "0.75" : "0.45"}
                            />
                          </g>
                        </>
                      )}
                    </g>
                  );
                })}

                {transitionFlow && transientConfig && (
                  <g mask="url(#ringMask)">
                    <LCTransientPath
                      key={`transient-${transitionKey}-${transitionFlow.from}-${transitionFlow.to}`}
                      d={transientConfig.d}
                      color={transientConfig.color}
                      duration={1150}
                      headSize={HEAD_SIZE}
                      headPad={HEAD_PAD}
                      mode={transientConfig.retract ? "shrink" : "grow"}
                      headVisible={!transientConfig.retract}
                    />
                  </g>
                )}
              </svg>

              {/* nodes */}
              <div
                ref={nodeLayerRef}
                className={`absolute inset-0 z-30 ${
                  nodeInteractionEnabled ? "" : "pointer-events-none"
                }`}
              >
                {cyclePhases.map((phase, idx) => {
                  const pos = getCirclePosition(idx, cyclePhases.length);
                  const isActive = activePhase === phase.id;
                  const isPreview = previewPhase === phase.id;
                  const allowActiveColor = !isBackwardRun;
                  const keepByTrail =
                    isPhase1Completed && trailIndex >= 0 && idx <= trailIndex;
                  const nodeHasColor =
                    isPhase1Completed &&
                    ((keepByTrail && phase.id !== suppressId) ||
                      (allowActiveColor &&
                        isActive &&
                        phase.id !== suppressId) ||
                      isPreview);
                  const isDragging = dragState?.id === phase.id;
                  const layerRect = nodeLayerRef.current
                    ? nodeLayerRef.current.getBoundingClientRect()
                    : null;
                  let nodeStyle = {
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: "translate(-50%, -50%)",
                  };
                  if (
                    isDragging &&
                    dragState?.pointer &&
                    dragState?.offset &&
                    layerRect
                  ) {
                    nodeStyle = {
                      left: `${
                        dragState.pointer.x -
                        layerRect.left -
                        dragState.offset.x
                      }px`,
                      top: `${
                        dragState.pointer.y - layerRect.top - dragState.offset.y
                      }px`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 50,
                    };
                  }
                  const nodeWrapperClass = [
                    "absolute transition-all duration-300 select-none",
                    nodeInteractionEnabled
                      ? "pointer-events-auto cursor-grab active:cursor-grabbing"
                      : "pointer-events-none",
                    isDragging ? "scale-105 drop-shadow-xl" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <div
                      key={phase.id}
                      className={nodeWrapperClass}
                      style={nodeStyle}
                      onPointerDown={
                        editableNodes
                          ? (event) => startDrag(phase.id, idx, event)
                          : undefined
                      }
                      onClick={
                        !editableNodes && typeof onNodeClick === "function"
                          ? (event) => {
                              event.stopPropagation();
                              onNodeClick(phase.id);
                            }
                          : undefined
                      }
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`relative w-12 h-12 rounded-full border-4 shadow-lg flex items-center justify-center text-lg
                                      ${getColorClasses(
                                        phase.color,
                                        nodeHasColor
                                      )}`}
                        >
                          {phase.iconImageUrl ? (
                            <img
                              src={phase.iconImageUrl}
                              alt={phase.name}
                              className={`h-7 w-7 object-contain ${
                                nodeHasColor ? "" : "grayscale opacity-40"
                              }`}
                            />
                          ) : (
                            <span
                              className={
                                nodeHasColor ? "" : "grayscale opacity-40"
                              }
                            >
                              {phase.icon}
                            </span>
                          )}
                          {((allowActiveColor &&
                            isActive &&
                            phase.id !== suppressId) ||
                            isPreview) && (
                            <span
                              className={`pointer-events-none absolute inset-0 rounded-full animate-ping opacity-60 ${getPingTone(
                                phase.color
                              )}`}
                            />
                          )}
                        </div>
                        <div
                          className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ring-1 ring-black/5 shadow-sm whitespace-nowrap
                        ${
                          nodeHasColor
                            ? `${
                                phase.color === "pink"
                                  ? "bg-pink-600"
                                  : phase.color === "lime"
                                  ? "bg-lime-600"
                                  : phase.color === "amber"
                                  ? "bg-amber-600"
                                  : phase.color === "emerald"
                                  ? "bg-emerald-600"
                                  : phase.color === "slate"
                                  ? "bg-slate-700"
                                  : "bg-teal-600"
                              } text-white`
                            : "bg-white text-gray-700 border border-gray-200"
                        }`}
                        >
                          {phase.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!isPhase1Completed && (
          <div className="text-center mt-1 text-[11px] text-gray-500"></div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// LCConfirmModal Component
// =========================================================================
function LCConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  highlight,
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl w-full max-w-md p-6 ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-extrabold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 mb-3 text-sm">{message}</p>
        {highlight && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            {highlight}
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// LCPhaseDropdown Component
// =========================================================================
function LCPhaseDropdown({
  activePhase,
  onPickPhase,
  onStartNewCycle,
  phaseConfigs,
}) {
  const [open, setOpen] = useState(false);
  const fallbackItems = [
    { id: "flowering", name: "Ra Hoa", icon: "🌸", phase: null },
    { id: "fruiting", name: "Đậu quả", icon: "🍏", phase: null },
    { id: "pre_harvest", name: "Trước thu hoạch", icon: "🔍", phase: null },
    { id: "post_harvest", name: "Sau thu hoạch", icon: "🌿", phase: null },
  ];
  const items = useMemo(() => {
    if (Array.isArray(phaseConfigs?.cycles) && phaseConfigs.cycles.length) {
      return phaseConfigs.cycles.map((phase) => ({
        id: phase.phaseId,
        name: phase.label,
        icon: phase.icon || "🌿",
        phase,
      }));
    }
    return fallbackItems;
  }, [phaseConfigs]);
  return (
    <div className="mm-fluid-shell relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-extrabold text-white
                   bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800
                   shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_6px_14px_rgba(37,99,235,.3)] ring-1 ring-black/10"
      >
        <ChevronDown className="w-3 h-3" />
        Cập nhật giai đoạn
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white/95 backdrop-blur rounded-xl shadow-2xl border border-gray-200 z-[60] overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {items.map((it) => (
              <div key={it.id}>
                <button
                  onClick={() => {
                    setOpen(false);
                    onPickPhase(it.phase || it.id);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl border transition-all flex items-center gap-2.5
                    ${
                      activePhase === it.id
                        ? "bg-emerald-50 border-emerald-300 shadow-sm"
                        : "bg-white hover:bg-blue-50 border-gray-200 hover:shadow-md"
                    }`}
                  title={it.name}
                >
                  <span className="text-[18px] leading-none">{it.icon}</span>
                  <span className="font-semibold text-[12px] text-gray-900 flex-1 min-w-0 truncate">
                    {it.name}
                  </span>
                </button>
                <div className="flex justify-center py-1 text-gray-300">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onStartNewCycle();
              }}
              className="w-full mt-1 p-2.5 rounded-xl font-extrabold text-[12px] text-white
                         bg-gradient-to-r from-amber-400 to-pink-500 shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_8px_16px_rgba(236,72,153,.3)]
                         hover:from-amber-500 hover:to-pink-600"
            >
              🔄 Bắt đầu giai đoạn mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// LifecycleWidget Component (Main Component)
// =========================================================================
export default function LifecycleWidget({
  tree,
  meta,
  portalId,
  value,
  onChange,
  cycleCount: cycleCountProp,
  phase1Completed: phase1CompletedProp,
  disabled = false,
  treeId,
  treeType,
  treeVariety,
  onPhaseGateChange,
  autoLifecycleEnabled,
  autoLifecycleDisabledAt,
  phaseTheme,
  phaseThemeAllowPartial = false,
  enableNodeEditing = false,
  onPhaseNodeClick,
  onPhaseNodeReorder,
}) {
  // Lấy giá trị đầu tiên có thật (string hoặc object {name/label/...})
  const first = (...xs) => xs.find(Boolean) || "";

  // Chuẩn hoá cách đọc "loại" và "giống" từ nhiều kiểu data phổ biến
  const getLoai = (src) =>
    labelOf(
      first(
        src?.loai,
        src?.type,
        src?.species,
        src?.plant,
        src?.tree_type,
        src?.cropName,
        src?.nameLoai
      )
    );

  const getGiong = (src) =>
    labelOf(
      first(
        src?.giong,
        src?.variety,
        src?.cultivar,
        src?.subtype,
        src?.tree_variety,
        src?.nameGiong
      )
    );

  const themeSource =
    phaseTheme ?? meta?.seasonalRoadmap ?? tree?.seasonalRoadmap;
  const normalizedTheme = useMemo(
    () => normalizeLifecycleTheme(themeSource),
    [phaseTheme, meta?.seasonalRoadmap, tree?.seasonalRoadmap]
  );

  const allowPartialPhases =
    phaseThemeAllowPartial ||
    (Array.isArray(themeSource) && themeSource.length);

  const mergedThemeMap = useMemo(() => {
    const buildEntry = (phaseId, override = {}, index = 0) => {
      const base = DEFAULT_PHASE_THEME[phaseId] || {};
      const colorKey = (override.colorKey || base.colorKey || "emerald")
        .toString()
        .toLowerCase();
      const lineColorKey = (
        override.lineColorKey ||
        override.colorKey ||
        base.lineColorKey ||
        base.colorKey ||
        "emerald"
      )
        .toString()
        .toLowerCase();
      const canonicalPhaseId =
        override.canonicalPhaseId || base.canonicalPhaseId || phaseId;
      const stageId =
        override.stageId ?? base.stageId ?? override.rawStage?.stageId ?? null;
      const stageOrder =
        typeof override.stageOrder === "number"
          ? override.stageOrder
          : typeof base.stageOrder === "number"
          ? base.stageOrder
          : index;
      return {
        phaseId,
        canonicalPhaseId,
        label: override.label || base.label || phaseId,
        subtitle: override.subtitle || "",
        description: override.description || "",
        icon: override.icon || base.icon || "🌿",
        colorKey,
        lineColorKey,
        lineStyle: override.lineStyle || base.lineStyle || "solid",
        durationMs: override.durationMs || base.durationMs || 1150,
        order: typeof override.order === "number" ? override.order : index,
        stageId,
        stageOrder,
      };
    };

    const normalizedKeys = Object.keys(normalizedTheme || {});
    if (allowPartialPhases && normalizedKeys.length > 0) {
      return normalizedKeys.reduce((acc, key, index) => {
        acc[key] = buildEntry(key, normalizedTheme[key], index);
        return acc;
      }, {});
    }

    return PHASE_IDS.reduce((acc, phaseId, index) => {
      acc[phaseId] = buildEntry(phaseId, normalizedTheme[phaseId], index);
      return acc;
    }, {});
  }, [normalizedTheme, allowPartialPhases]);

  const orderedPhaseConfigs = useMemo(
    () =>
      getOrderedPhases(mergedThemeMap, {
        allowPartial: allowPartialPhases,
      }),
    [mergedThemeMap, allowPartialPhases]
  );

  const defaultCycleConfigs = useMemo(
    () =>
      PHASE_IDS.filter((id) => id !== "growth_development").map(
        (phaseId, index) => ({
          phaseId,
          label: DEFAULT_PHASE_THEME[phaseId].label,
          subtitle: "",
          description: "",
          icon: DEFAULT_PHASE_THEME[phaseId].icon,
          colorKey: DEFAULT_PHASE_THEME[phaseId].colorKey,
          lineColorKey: DEFAULT_PHASE_THEME[phaseId].colorKey,
          lineStyle: DEFAULT_PHASE_THEME[phaseId].lineStyle || "solid",
          durationMs: 1150,
          order: index + 1,
        })
      ),
    []
  );

  const phase1Config = useMemo(() => {
    if (allowPartialPhases && orderedPhaseConfigs.length > 0) {
      return orderedPhaseConfigs[0];
    }
    const found = orderedPhaseConfigs.find(
      (phase) => phase.phaseId === "growth_development"
    );
    if (found) return found;
    const base = DEFAULT_PHASE_THEME.growth_development;
    return {
      phaseId: "growth_development",
      label: base.label,
      subtitle: "",
      description: "",
      icon: base.icon,
      colorKey: base.colorKey,
      lineColorKey: base.colorKey,
      lineStyle: base.lineStyle || "solid",
      durationMs: 1150,
      order: 0,
    };
  }, [allowPartialPhases, orderedPhaseConfigs]);

  const cyclePhaseConfigs = useMemo(() => {
    // Khi allowPartialPhases = true, chỉ sử dụng các phase từ config (không fallback)
    if (allowPartialPhases) {
      if (orderedPhaseConfigs.length > 0) {
        return orderedPhaseConfigs.slice(1);
      }
      return []; // Không có cycle phases nếu chỉ có 1 giai đoạn
    }
    // Chế độ mặc định: filter và fallback nếu cần
    const filtered = orderedPhaseConfigs.filter(
      (phase) => phase.phaseId !== "growth_development"
    );
    return filtered.length ? filtered : defaultCycleConfigs;
  }, [allowPartialPhases, orderedPhaseConfigs, defaultCycleConfigs]);

  const phaseList = useMemo(() => {
    const list = [];
    if (phase1Config) list.push(phase1Config);
    if (Array.isArray(cyclePhaseConfigs) && cyclePhaseConfigs.length) {
      list.push(...cyclePhaseConfigs);
    }
    return list;
  }, [phase1Config, cyclePhaseConfigs]);

  const findPhaseById = useCallback(
    (phaseId) =>
      phaseList.find(
        (phase) =>
          phase.phaseId === phaseId ||
          phase.id === phaseId ||
          phase.phaseId === normalizePhaseId(phaseId)
      ) || null,
    [phaseList]
  );

  const findPhaseByStageId = useCallback(
    (stageId) =>
      stageId == null
        ? null
        : phaseList.find((phase) => phase.stageId === stageId) || null,
    [phaseList]
  );

  const findPhaseByCanonical = useCallback(
    (canonicalId) =>
      !canonicalId
        ? null
        : phaseList.find(
            (phase) =>
              phase.canonicalPhaseId === canonicalId ||
              phase.phaseId === canonicalId
          ) || null,
    [phaseList]
  );

  const labelOf = useCallback(
    (id) => {
      if (!id) return "";
      const match =
        findPhaseById(id) || findPhaseByCanonical(normalizePhaseId(id));
      return match?.label || match?.name || id;
    },
    [findPhaseByCanonical, findPhaseById]
  );

  const cyclePhaseIds = useMemo(
    () => cyclePhaseConfigs.map((phase) => phase.phaseId),
    [cyclePhaseConfigs]
  );

  const phaseConfigs = useMemo(
    () => ({
      phase1: phase1Config,
      cycles: cyclePhaseConfigs,
    }),
    [phase1Config, cyclePhaseConfigs]
  );

  const isCyclePhase = (p) => cyclePhaseIds.includes(p);

  const displayType = treeType || getLoai(meta) || getLoai(tree);

  const displayVariety = treeVariety || getGiong(meta) || getGiong(tree);

  // Ưu tiên phase từ props.value (DB) -> fallback text trong tree
  const initPhase = normalizePhaseId(
    value ??
      tree?.lifecycle?.currentPhaseId ??
      mapPhaseIdFromText(
        tree?.phenology?.currentPhase ||
          tree?.phenology?.stage ||
          tree?.phase ||
          ""
      )
  );

  // Thứ tự các phase trên vòng tròn

  // Tính trạng thái ban đầu từ prop / tree
  const initialPhase1Completed =
    typeof phase1CompletedProp === "boolean"
      ? phase1CompletedProp
      : initPhase !== "growth_development";

  // Nếu đã qua giai đoạn 1 thì trailIndex = index của phase hiện tại
  // (VD: pre_harvest -> 2; fruiting -> 1; flowering -> 0)
  const initialTrailIndex = initialPhase1Completed
    ? Math.max(0, cyclePhaseIds.indexOf(initPhase))
    : -1;

  const externalStageId =
    tree?.stageId ?? tree?.lifecycle?.stageId ?? meta?.stageId ?? null;

  // Phase controlled
  const [activePhase, setActivePhase] = useState(initPhase);
  const [activeStageId, setActiveStageId] = useState(externalStageId);

  // Sync activePhase khi value prop thay đổi (từ parent/API)
  useEffect(() => {
    if (value == null) return;

    const normalizedValue = normalizePhaseId(value);

    // Kiểm tra phase1 trước
    if (
      phase1Config &&
      (phase1Config.phaseId === normalizedValue ||
        phase1Config.canonicalPhaseId === normalizedValue ||
        normalizePhaseId(phase1Config.phaseId) === normalizedValue)
    ) {
      const targetPhaseId = phase1Config.phaseId;
      setActivePhase((prev) => (prev !== targetPhaseId ? targetPhaseId : prev));
      return;
    }

    // Tìm phase config matching với value trong cycle phases
    const matchedPhase = cyclePhaseConfigs.find(
      (phase) =>
        phase.phaseId === normalizedValue ||
        phase.canonicalPhaseId === normalizedValue ||
        normalizePhaseId(phase.phaseId) === normalizedValue
    );

    // Nếu tìm thấy, dùng phaseId từ config; nếu không, dùng normalized value
    const targetPhaseId = matchedPhase?.phaseId || normalizedValue;

    setActivePhase((prev) => (prev !== targetPhaseId ? targetPhaseId : prev));
  }, [value, phase1Config, cyclePhaseConfigs]);

  useEffect(() => {
    if (externalStageId != null && externalStageId !== activeStageId) {
      setActiveStageId(externalStageId);
    }
  }, [externalStageId, activeStageId]);

  useEffect(() => {
    if (!phaseList.length) return;
    if (activeStageId != null) {
      const stageMatch = findPhaseByStageId(activeStageId);
      if (stageMatch && stageMatch.phaseId !== activePhase) {
        setActivePhase(stageMatch.phaseId);
        return;
      }
    }
    const canonicalMatch = findPhaseByCanonical(initPhase);
    if (canonicalMatch && canonicalMatch.phaseId !== activePhase) {
      setActivePhase(canonicalMatch.phaseId);
    }
  }, [
    phaseList,
    activeStageId,
    activePhase,
    findPhaseByStageId,
    findPhaseByCanonical,
    initPhase,
  ]);

  // Phase1Completed & cycleCount controlled
  const [isPhase1Completed, setIsPhase1Completed] = useState(
    initialPhase1Completed
  );
  useEffect(() => {
    if (typeof phase1CompletedProp === "boolean") {
      setIsPhase1Completed(phase1CompletedProp);
    }
  }, [phase1CompletedProp]);

  const [cycleCount, setCycleCount] = useState(
    Number.isFinite(cycleCountProp) ? Number(cycleCountProp) : 0
  );
  useEffect(() => {
    if (Number.isFinite(cycleCountProp)) {
      setCycleCount(Number(cycleCountProp));
    }
  }, [cycleCountProp]);

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(
    typeof autoLifecycleEnabled === "boolean" ? autoLifecycleEnabled : true
  );
  useEffect(() => {
    if (typeof autoLifecycleEnabled === "boolean") {
      setAutoSyncEnabled(autoLifecycleEnabled);
    }
  }, [autoLifecycleEnabled]);

  const [autoDisabledAt, setAutoDisabledAt] = useState(
    autoLifecycleDisabledAt || null
  );
  useEffect(() => {
    setAutoDisabledAt(autoLifecycleDisabledAt || null);
  }, [autoLifecycleDisabledAt]);

  const [togglingAuto, setTogglingAuto] = useState(false);

  const autoStatusText = useMemo(() => {
    if (autoSyncEnabled) {
      return "Đang tự động chuyển giai đoạn theo tuổi và loại cây.";
    }
    if (!autoDisabledAt) {
      return "Đang ghi đè thủ công (tạm dừng tự động).";
    }
    const dt = new Date(autoDisabledAt);
    if (Number.isNaN(dt.getTime())) {
      return "Đang ghi đè thủ công (tạm dừng tự động).";
    }
    return `Đang ghi đè thủ công từ ${dt.toLocaleString("vi-VN")}.`;
  }, [autoSyncEnabled, autoDisabledAt]);

  const toggleButtonDisabled = disabled || togglingAuto || !treeId;

  // Giữ nguyên các state còn lại của bạn ngay sau đây:
  const [previewPhase, setPreviewPhase] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const [transitionFlow, setTransitionFlow] = useState(null);
  const [transitionKey, setTransitionKey] = useState(0);
  const [p1Transition, setP1Transition] = useState(false);
  const [p1Key, setP1Key] = useState(0);
  const [trailIndex, setTrailIndex] = useState(isPhase1Completed ? 0 : -1);
  const [suppressId, setSuppressId] = useState(null);
  const [isBackwardRun, setIsBackwardRun] = useState(false);
  const [postHideIdx, setPostHideIdx] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runSpinReset = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1000);
  };

  useEffect(() => {
    // Nếu parent đẩy phase/phase1Completed mới từ DB thì đồng bộ lại
    const externalPhase = normalizePhaseId(
      value ??
        tree?.lifecycle?.currentPhaseId ??
        mapPhaseIdFromText(
          tree?.phenology?.currentPhase ||
            tree?.phenology?.stage ||
            tree?.phase ||
            ""
        )
    );

    const externalP1Done =
      typeof phase1CompletedProp === "boolean"
        ? phase1CompletedProp
        : externalPhase !== "growth_development";

    // Cập nhật isPhase1Completed nếu thay đổi
    setIsPhase1Completed((prev) =>
      prev !== externalP1Done ? externalP1Done : prev
    );

    if (!externalP1Done) {
      setTrailIndex(-1);
      return;
    }

    // Tìm index bằng cách match canonical phase ID thay vì phaseId trực tiếp
    let idx = cyclePhaseIds.indexOf(externalPhase);

    // Nếu không tìm thấy trực tiếp, tìm theo canonicalPhaseId
    if (idx < 0) {
      idx = cyclePhaseConfigs.findIndex(
        (phase) =>
          phase.canonicalPhaseId === externalPhase ||
          normalizePhaseId(phase.phaseId) === externalPhase
      );
    }

    if (idx >= 0) {
      setTrailIndex(idx);
      // Cập nhật activePhase để sync với visual
      const matchedPhase = cyclePhaseConfigs[idx];
      if (matchedPhase) {
        setActivePhase((prev) =>
          prev !== matchedPhase.phaseId ? matchedPhase.phaseId : prev
        );
      }
    }
  }, [
    value,
    phase1CompletedProp,
    cyclePhaseIds,
    cyclePhaseConfigs,
    tree?.lifecycle?.currentPhaseId,
    tree?.phenology?.currentPhase,
    tree?.phenology?.stage,
    tree?.phase,
  ]);

  // Modal xác nhận (nhỏ)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPhase, setPendingPhase] = useState(null);
  const [confirmText, setConfirmText] = useState({
    title: "",
    message: "",
    highlight: "",
  });

  const [portalEl, setPortalEl] = useState(null);
  useEffect(() => {
    if (!portalId) return;
    const el = document.getElementById(portalId);
    setPortalEl(el || null);
  }, [portalId]);

  const buildSteps = (from, to) => {
    const steps = [];
    const N = cyclePhaseIds.length;
    if (N <= 0) return steps;
    if (from === "growth_development" && isCyclePhase(to)) {
      steps.push({ type: "p1" });
      from = cyclePhaseIds[0] || "flowering";
    }
    if (isCyclePhase(from) && isCyclePhase(to) && from !== to) {
      let i = cyclePhaseIds.indexOf(from),
        j = cyclePhaseIds.indexOf(to);
      if (i === -1 || j === -1) return steps;
      let dir;
      if ((i + 1) % N === j) dir = +1;
      else if ((j + 1) % N === i) dir = -1;
      else dir = j > i ? +1 : -1;
      while (i !== j) {
        const next = (i + dir + N) % N;
        steps.push({
          type: "arc",
          from: cyclePhaseIds[i],
          to: cyclePhaseIds[next],
        });
        i = next;
      }
    }
    return steps;
  };

  const flush = () =>
    new Promise((rs) => requestAnimationFrame(() => requestAnimationFrame(rs)));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const playSteps = async (steps, finalTo, shouldSpin) => {
    setTransitionFlow(null);
    setPreviewPhase(null);
    setSuppressId(null);
    setPostHideIdx(null);
    const DUR = 1150,
      DWELL = 200;

    const firstArc = steps.find((s) => s.type === "arc");
    if (firstArc && cyclePhaseIds.length > 0) {
      const N = cyclePhaseIds.length;
      const iFrom = cyclePhaseIds.indexOf(firstArc.from);
      const iTo = cyclePhaseIds.indexOf(firstArc.to);
      if (iFrom === -1 || iTo === -1) setIsBackwardRun(false);
      else setIsBackwardRun((iFrom + 1) % N !== iTo);
    } else setIsBackwardRun(false);

    for (let idx = 0; idx < steps.length; idx++) {
      const s = steps[idx];
      if (s.type === "p1") {
        setP1Transition(true);
        setP1Key((k) => k + 1);
        await wait(950);
        setP1Transition(false);
        if (!isPhase1Completed) setIsPhase1Completed(true);
        if (cyclePhaseIds.length > 0) {
          setTrailIndex(0);
          setPreviewPhase(cyclePhaseIds[0]);
        }
        await wait(DWELL);
        setPreviewPhase(null);
        continue;
      }
      const N = cyclePhaseIds.length;
      if (N <= 0) break;
      const iFrom = cyclePhaseIds.indexOf(s.from),
        iTo = cyclePhaseIds.indexOf(s.to);
      if (iFrom === -1 || iTo === -1) continue;
      const dir = (iFrom + 1) % N === iTo ? +1 : -1;

      if (dir === -1) {
        setSuppressId(s.from);
        await flush();
      }
      setTransitionFlow({ from: s.from, to: s.to });
      setTransitionKey((k) => k + 1);
      await wait(DUR);
      setTransitionFlow(null);
      setPostHideIdx(dir === -1 ? iTo : iFrom);
      setTimeout(() => setPostHideIdx(null), 130);
      await flush();

      if (dir === +1) {
        setPreviewPhase(s.to);
        await wait(DWELL);
        setTrailIndex(iTo);
        setPreviewPhase(null);
      } else {
        if (idx < steps.length - 1) setTrailIndex((iTo - 1 + N) % N);
        else setTrailIndex(iTo);
        await flush();
        setSuppressId(null);
        await wait(DWELL);
      }
    }

    setActivePhase(finalTo);
    setPreviewPhase(null);
    setSuppressId(null);
    setIsBackwardRun(false);
    if (shouldSpin) runSpinReset();
  };

  const requestChangePhase = useCallback(
    (targetPhaseInput, cause = "pick") => {
      if (isRunning) return;
      const targetPhase =
        typeof targetPhaseInput === "string"
          ? findPhaseById(targetPhaseInput) ||
            findPhaseByCanonical(normalizePhaseId(targetPhaseInput))
          : targetPhaseInput && typeof targetPhaseInput === "object"
          ? findPhaseById(
              targetPhaseInput.phaseId ||
                targetPhaseInput.id ||
                targetPhaseInput
            ) || targetPhaseInput
          : null;
      if (!targetPhase) return;
      const fromCanonical =
        findPhaseById(activePhase)?.canonicalPhaseId ||
        normalizePhaseId(activePhase);
      const toCanonical =
        targetPhase.canonicalPhaseId ||
        normalizePhaseId(targetPhase.phaseId || targetPhase.id);

      let title = "Xác nhận đổi giai đoạn";
      let message = `Bạn muốn chuyển từ "${labelOf(fromCanonical)}" sang "${
        targetPhase.name || labelOf(toCanonical)
      }"?`;
      let highlight = "";
      if (fromCanonical === "post_harvest" && toCanonical === "flowering")
        highlight = "Chuyển Sau thu hoạch → Ra Hoa sẽ BẮT ĐẦU MỘT CHU KỲ MỚI.";
      if (fromCanonical === "growth_development" && isCyclePhase(toCanonical))
        message = `Hoàn tất "${labelOf(
          fromCanonical
        )}" và chuyển sang "${labelOf(toCanonical)}"?`;
      if (cause === "start-new-cycle") {
        title = "Bắt đầu giai đoạn mới";
        message = "Chu kỳ mới sẽ khởi động và vòng xoay 1s.";
        const startLabel = cyclePhaseConfigs[0]?.label || labelOf("flowering");
        highlight = `Điểm bắt đầu: ${startLabel}.`;
      }
      setPendingPhase({
        phaseId: targetPhase.phaseId,
        canonicalPhaseId: toCanonical,
        stageId: targetPhase.stageId ?? null,
        label: targetPhase.name,
      });
      setConfirmText({ title, message, highlight });
      setConfirmOpen(true);
    },
    [
      isRunning,
      activePhase,
      cyclePhaseConfigs,
      findPhaseByCanonical,
      findPhaseById,
      labelOf,
    ]
  );

  /**
   * Update lifecycle using dedicated lifecycle API
   */
  async function updateLifecyclePhase(
    phaseId,
    cycleCount,
    phase1Completed,
    extra = {},
    stageId = null
  ) {
    if (!treeId) return;

    try {
      // Đảm bảo phaseId gửi lên API luôn là 1 trong 5 giá trị chuẩn
      const normalizedPhaseId = normalizePhaseId(phaseId);

      const payload = {
        phaseId: normalizedPhaseId,
        ...(cycleCount != null && { cycleCount }),
        ...(phase1Completed != null && { phase1Completed }),
      };

      if (Object.prototype.hasOwnProperty.call(extra, "autoSyncEnabled")) {
        payload.autoSyncEnabled = extra.autoSyncEnabled;
      }
      if (extra?.overrideReason) {
        payload.overrideReason = extra.overrideReason;
      }
      if (stageId != null) {
        payload.stageId = stageId;
      }

      // Log ra UI (console browser) để debug
      console.log("[LifecycleWidget] updateLifecyclePhase → sending payload", {
        treeId,
        payload,
      });

      const response = await TreeRepository.updateLifecycle(treeId, payload);
      const data = response?.data ?? response;
      console.log("[LifecycleWidget] updateLifecyclePhase ← response", {
        treeId,
        payload,
        data,
      });
      return data;
    } catch (err) {
      console.error("[LifecycleWidget] Update lifecycle failed", err);
      throw err; // Re-throw to allow caller to handle
    }
  }

  async function handleToggleAutoSync() {
    if (!treeId || togglingAuto || disabled) return;

    const nextState = !autoSyncEnabled;
    let overrideReason = undefined;
    if (!nextState) {
      overrideReason =
        window.prompt("Nhập lý do ghi đè thủ công (tuỳ chọn).") || undefined;
    }

    setTogglingAuto(true);
    try {
      const lifecycleResponse = await updateLifecyclePhase(
        activePhaseCanonical,
        cycleCount,
        isPhase1Completed,
        { autoSyncEnabled: nextState, overrideReason },
        activeStageId ?? null
      );

      const resolvedPhaseId = normalizePhaseId(
        lifecycleResponse?.phaseId ?? activePhaseCanonical
      );
      const resolvedCycleCount = lifecycleResponse?.cycleCount ?? cycleCount;
      const resolvedPhase1Completed =
        lifecycleResponse?.phase1Completed ?? isPhase1Completed;
      const resolvedStageId = lifecycleResponse?.stageId ?? null;
      const resolvedAutoEnabled =
        typeof lifecycleResponse?.lifecycleAutoEnabled === "boolean"
          ? lifecycleResponse.lifecycleAutoEnabled
          : nextState;
      const resolvedAutoDisabledAt =
        lifecycleResponse?.lifecycleAutoDisabledAt ??
        (resolvedAutoEnabled ? null : new Date().toISOString());

      const resolvedPhaseEntry =
        (resolvedStageId != null
          ? findPhaseByStageId(resolvedStageId)
          : findPhaseByCanonical(resolvedPhaseId)) || null;
      if (resolvedPhaseEntry) {
        setActivePhase(resolvedPhaseEntry.phaseId);
        setActiveStageId(resolvedPhaseEntry.stageId ?? resolvedStageId ?? null);
      } else {
        setActivePhase(resolvedPhaseId);
        if (resolvedStageId != null) setActiveStageId(resolvedStageId);
      }
      setCycleCount(resolvedCycleCount);
      setIsPhase1Completed(resolvedPhase1Completed);
      setAutoSyncEnabled(resolvedAutoEnabled);
      setAutoDisabledAt(resolvedAutoDisabledAt);

      if (typeof onChange === "function") {
        onChange({
          phaseId: resolvedPhaseId,
          cycleCount: resolvedCycleCount,
          phase1Completed: resolvedPhase1Completed,
          stageId: resolvedStageId,
          lifecycleAutoEnabled: resolvedAutoEnabled,
          lifecycleAutoDisabledAt: resolvedAutoDisabledAt,
        });
      }
    } catch (err) {
      console.error("Failed to toggle lifecycle automation", err);
    } finally {
      setTogglingAuto(false);
    }
  }

  const onConfirmModal = async () => {
    if (isRunning) return;
    const pending = pendingPhase;
    if (!pending) return;
    setConfirmOpen(false);
    setPendingPhase(null);
    await flush();
    setIsRunning(true);

    const fromPhaseId = activePhase;
    const fromCanonical =
      findPhaseById(fromPhaseId)?.canonicalPhaseId ||
      normalizePhaseId(fromPhaseId);
    const toPhaseId = pending.phaseId;
    const toCanonical = pending.canonicalPhaseId || normalizePhaseId(toPhaseId);
    const shouldSpin =
      (fromCanonical === "post_harvest" && toCanonical === "flowering") ||
      confirmText.title === "Bắt đầu giai đoạn mới";
    const steps = buildSteps(fromPhaseId, toPhaseId);

    console.log("[LifecycleWidget] onConfirmModal", {
      treeId,
      from: fromPhaseId,
      to: toPhaseId,
      pendingPhase,
      cycleCountBefore: cycleCount,
      isPhase1CompletedBefore: isPhase1Completed,
      steps,
    });

    // TÍNH TRẠNG THÁI MỚI (trước khi gọi API)
    const nextP1 = toCanonical !== "growth_development";

    // Nếu là Sau thu hoạch -> Ra Hoa thì tăng chu kỳ
    const nextCount =
      fromCanonical === "post_harvest" && toCanonical === "flowering"
        ? cycleCount + 1
        : cycleCount;

    const resolvePhaseIdForStage = (stageId, canonicalId, fallbackPhaseId) => {
      if (stageId != null) {
        const match = findPhaseByStageId(stageId);
        if (match) return match.phaseId;
      }
      if (canonicalId) {
        const match = findPhaseByCanonical(canonicalId);
        if (match) return match.phaseId;
      }
      return fallbackPhaseId || canonicalId || null;
    };

    // Gọi API lifecycle để cập nhật
    try {
      const lifecycleResponse = await updateLifecyclePhase(
        toCanonical,
        nextCount,
        nextP1,
        undefined,
        pending.stageId ?? null
      );

      // Nếu API trả về dữ liệu, sử dụng dữ liệu từ API (single source of truth)
      if (lifecycleResponse) {
        const apiPhaseId =
          normalizePhaseId(lifecycleResponse.phaseId) || toCanonical;
        const apiCycleCount = lifecycleResponse.cycleCount ?? nextCount;
        const apiPhase1Completed = lifecycleResponse.phase1Completed ?? nextP1;
        const apiStageId = lifecycleResponse.stageId ?? pending.stageId ?? null;
        const apiAutoEnabled =
          typeof lifecycleResponse.lifecycleAutoEnabled === "boolean"
            ? lifecycleResponse.lifecycleAutoEnabled
            : autoSyncEnabled;
        const apiAutoDisabledAt =
          lifecycleResponse.lifecycleAutoDisabledAt ??
          (apiAutoEnabled ? null : autoDisabledAt);

        // Cập nhật state với dữ liệu từ API
        const resolvedPhaseId = resolvePhaseIdForStage(
          apiStageId,
          apiPhaseId,
          toPhaseId
        );
        if (resolvedPhaseId) setActivePhase(resolvedPhaseId);
        if (apiStageId != null) setActiveStageId(apiStageId);
        setCycleCount(apiCycleCount);
        setIsPhase1Completed(apiPhase1Completed);
        setAutoSyncEnabled(apiAutoEnabled);
        setAutoDisabledAt(apiAutoDisabledAt);

        // Nếu không có bước animation, vẫn phải tự cập nhật trail hợp lý
        if (steps.length === 0) {
          const targetId = resolvedPhaseId || toPhaseId;
          const resolvedIndex = cyclePhaseIds.indexOf(targetId);
          setTrailIndex(resolvedIndex);
        } else {
          await playSteps(steps, resolvedPhaseId || toPhaseId, shouldSpin);
        }

        // BẮN SỰ KIỆN RA PARENT với dữ liệu từ API
        if (typeof onChange === "function") {
          onChange({
            phaseId: apiPhaseId,
            cycleCount: apiCycleCount,
            phase1Completed: apiPhase1Completed,
            stageId: apiStageId,
            lifecycleAutoEnabled: apiAutoEnabled,
            lifecycleAutoDisabledAt: apiAutoDisabledAt,
          });
        }
      } else {
        // Fallback nếu API không trả về dữ liệu
        const fallbackPhaseId = resolvePhaseIdForStage(
          pending.stageId ?? null,
          toCanonical,
          toPhaseId
        );
        if (fallbackPhaseId) setActivePhase(fallbackPhaseId);
        if (pending.stageId != null) setActiveStageId(pending.stageId);
        setCycleCount(nextCount);
        setIsPhase1Completed(nextP1);

        if (steps.length === 0) {
          if (
            fromCanonical === "growth_development" &&
            toCanonical === "growth_development"
          ) {
            // No change
          } else if (
            fromCanonical === "post_harvest" &&
            toCanonical === "flowering"
          ) {
            setTrailIndex(0);
            runSpinReset();
          } else {
            setTrailIndex(cyclePhaseIds.indexOf(fallbackPhaseId || toPhaseId));
          }
        } else {
          await playSteps(steps, fallbackPhaseId || toPhaseId, shouldSpin);
        }

        if (typeof onChange === "function") {
          onChange({
            phaseId: toCanonical,
            cycleCount: nextCount,
            phase1Completed: nextP1,
            stageId: pending.stageId ?? null,
            lifecycleAutoEnabled: autoSyncEnabled,
            lifecycleAutoDisabledAt: autoDisabledAt,
          });
        }
      }
    } catch (err) {
      console.error("Failed to update lifecycle", err);
      // TODO: show error toast / message to user
      // Revert state on error?
    }

    setIsRunning(false);
  };

  const nameSource = (meta?.name ?? tree?.name ?? "").trim();
  const varietySource = meta?.variety ?? tree?.variety ?? "—";
  const treeData = {
    id: treeId ?? tree?.id ?? "—", // ⬅️ đồng bộ với mã cây (codeKey)
    type: nameSource.split(/\s+/)[0] || "Cây",
    variety: varietySource,
    currentPhase: activePhase,
    cycleCount,
    isPhase1Completed,
    stageId:
      tree?.stageId ??
      tree?.lifecycle?.stageId ??
      meta?.stageId ??
      externalStageId ??
      null,
  };

  return (
    <div className="relative">
      {/* nút điều khiển căn giữa */}
      {!disabled &&
        (portalEl ? (
          createPortal(
            <LCPhaseDropdown
              activePhase={activePhase}
              onPickPhase={(phase) => requestChangePhase(phase, "pick")}
              onStartNewCycle={() =>
                cyclePhaseConfigs.length
                  ? requestChangePhase(cyclePhaseConfigs[0], "start-new-cycle")
                  : requestChangePhase("flowering", "start-new-cycle")
              }
              phaseConfigs={phaseConfigs}
            />,
            portalEl
          )
        ) : (
          <div className="flex justify-center mb-4">
            <LCPhaseDropdown
              activePhase={activePhase}
              onPickPhase={(phase) => requestChangePhase(phase, "pick")}
              onStartNewCycle={() =>
                cyclePhaseConfigs.length
                  ? requestChangePhase(cyclePhaseConfigs[0], "start-new-cycle")
                  : requestChangePhase("flowering", "start-new-cycle")
              }
              phaseConfigs={phaseConfigs}
            />
          </div>
        ))}
      {disabled && (
        <div className="flex justify-center mb-4">
          <span
            className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[11px] font-extrabold text-white bg-gray-400 cursor-not-allowed"
            title="Đã dừng hoạt động"
          >
            Cập nhật giai đoạn
          </span>
        </div>
      )}

      <div className="mb-5 flex flex-col items-center gap-3 rounded-2xl bg-neutral-50/80 px-4 py-3 text-center">
        <p
          className={`text-xs sm:text-sm ${
            autoSyncEnabled ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          {autoStatusText}
        </p>
        <button
          type="button"
          className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            autoSyncEnabled
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
          } ${toggleButtonDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={handleToggleAutoSync}
          disabled={toggleButtonDisabled}
        >
          {togglingAuto
            ? "Đang xử lý..."
            : autoSyncEnabled
            ? "Chuyển sang ghi đè tay"
            : "Bật tự động"}
        </button>
      </div>

      <div className="flex justify-center">
        <LifecycleTimeline
          activePhase={activePhase}
          previewPhase={previewPhase}
          isPhase1Completed={isPhase1Completed}
          isSpinning={isSpinning}
          treeData={treeData}
          treeId={treeId} // 👈 mã cây chuẩn
          treeType={displayType} // 👈 loại chuẩn
          treeVariety={displayVariety}
          transitionFlow={transitionFlow}
          transitionKey={transitionKey}
          p1Transition={p1Transition}
          p1Key={p1Key}
          trailIndex={trailIndex}
          suppressId={suppressId}
          isBackwardRun={isBackwardRun}
          postHideIdx={postHideIdx}
          onPhaseGateChange={onPhaseGateChange}
          phaseConfigs={phaseConfigs}
          editableNodes={enableNodeEditing}
          onNodeClick={onPhaseNodeClick}
          onNodeReorder={onPhaseNodeReorder}
        />
      </div>

      <LCConfirmModal
        open={confirmOpen}
        onClose={() => {
          if (!isRunning) {
            setConfirmOpen(false);
            setPendingPhase(null);
          }
        }}
        onConfirm={onConfirmModal}
        title={confirmText.title}
        message={confirmText.message}
        highlight={confirmText.highlight}
      />
    </div>
  );
}
