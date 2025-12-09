import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { LIFECYCLE_COLOR_LOOKUP } from "@/lib/lifecycleTheme";
import { normalizePhaseId } from "./lifecycleHelpers";
import LCTransientPath from "./LCTransientPath";

// =========================================================================
// Palette & Color Utilities
// =========================================================================
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

// =========================================================================
// CSS Animations
// =========================================================================
const css = `
  @keyframes dashFlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -28; } }
  .flow-line { animation: dashFlow 2.2s linear infinite; }
  @keyframes dashFlowSlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -28; } }
  .flow-arc-slow { animation: dashFlowSlow 5.5s linear infinite; }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  .fade-in-160 { animation: fadeIn .16s ease-out both; }
  @keyframes spin-once { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .animate-spin-once { animation: spin-once 1s ease-in-out; }
  
  /* Tooltip animation */
  @keyframes tooltipIn { 
    from { opacity: 0; transform: translate(-50%, -100%) scale(0.9); } 
    to { opacity: 1; transform: translate(-50%, -100%) scale(1); } 
  }
  .tooltip-enter { animation: tooltipIn 0.15s ease-out forwards; }
  
  /* Responsive scaling */
  .lifecycle-ring-container {
    --ring-scale: 1;
  }
  @media (max-width: 400px) {
    .lifecycle-ring-container { --ring-scale: 0.7; }
  }
  @media (min-width: 401px) and (max-width: 500px) {
    .lifecycle-ring-container { --ring-scale: 0.8; }
  }
  @media (min-width: 501px) and (max-width: 640px) {
    .lifecycle-ring-container { --ring-scale: 0.9; }
  }
`;

// =========================================================================
// LifecycleTimeline Component
// =========================================================================
export default function LifecycleTimeline({
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
  // Hover state for tooltips
  const [hoveredPhaseId, setHoveredPhaseId] = useState(null);
  const [hoveredPhase1, setHoveredPhase1] = useState(false);

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

  // ==== Geometry - Base values (will be scaled) ====
  const cycleCount = cyclePhases.length || 1;
  const baseRadius = 72 + Math.max(0, (cycleCount - 4) * 10);
  const BASE_RING_SIZE = 180 + Math.max(0, (cycleCount - 4) * 30);
  const radius = baseRadius;
  const RING_SIZE = BASE_RING_SIZE;
  const centerX = RING_SIZE / 2,
    centerY = RING_SIZE / 2;
  const nodeR = 20,
    STROKE = 3,
    HEAD_SIZE = 8,
    HEAD_PAD = HEAD_SIZE * 0.85,
    MASK_INSET = 5;

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
            <polygon points={`0,0 -5,-2.5 -5,2.5`} fill={color} />
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

  // State for tooltip position (for portal)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Tooltip component for phase nodes - rendered via portal
  const PhaseTooltip = ({ phase, isActive, nodeHasColor, position }) => {
    const bgColor = nodeHasColor
      ? phase.color === "pink"
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
      : "bg-gray-700";

    const borderColor = nodeHasColor
      ? phase.color === "pink"
        ? "border-t-pink-600"
        : phase.color === "lime"
        ? "border-t-lime-600"
        : phase.color === "amber"
        ? "border-t-amber-600"
        : phase.color === "emerald"
        ? "border-t-emerald-600"
        : phase.color === "slate"
        ? "border-t-slate-700"
        : "border-t-teal-600"
      : "border-t-gray-700";

    return createPortal(
      <div
        className="fixed z-[9999] pointer-events-none tooltip-enter"
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -100%)",
        }}
      >
        <div
          className={`${bgColor} text-white text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap`}
        >
          {phase.name}
          {isActive && (
            <span className="ml-1.5 text-[10px] opacity-80">
              (đang hoạt động)
            </span>
          )}
        </div>
        {/* Arrow */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 
            border-l-[6px] border-r-[6px] border-t-[6px] 
            border-l-transparent border-r-transparent ${borderColor}`}
        />
      </div>,
      document.body
    );
  };

  return (
    <div className="w-full lifecycle-ring-container overflow-visible">
      <style>{css}</style>

      <div className="flex flex-col items-center gap-1 sm:gap-2 overflow-visible">
        {/* Header nhỏ hiển thị giai đoạn hiện tại */}
        <div className="flex flex-col items-center select-none">
          <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs sm:text-sm mb-1.5 w-full px-2">
            <span className="text-neutral-700 shrink-0">Giai đoạn:</span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold text-[10px] sm:text-xs
               ${getBadgeTone(phase1.color)}
               max-w-[160px] sm:max-w-[200px] truncate`}
              title={currentLabel}
            >
              {currentLabel}
            </span>
          </div>

          {/* Phase 1 node with hover tooltip */}
          <div
            className="relative"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPos({
                x: rect.left + rect.width / 2,
                y: rect.top - 8,
              });
              setHoveredPhase1(true);
            }}
            onMouseLeave={() => setHoveredPhase1(false)}
          >
            {hoveredPhase1 &&
              createPortal(
                <div
                  className="fixed z-[9999] pointer-events-none tooltip-enter"
                  style={{
                    left: tooltipPos.x,
                    top: tooltipPos.y,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div
                    className={`${getSolidTone(
                      phase1.color
                    )} text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap`}
                  >
                    {phase1.name}
                    {activePhase === phase1.id && !isPhase1Completed && (
                      <span className="ml-1.5 text-[10px] opacity-80">
                        (đang hoạt động)
                      </span>
                    )}
                  </div>
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 
                      border-l-[6px] border-r-[6px] border-t-[6px] 
                      border-l-transparent border-r-transparent border-t-emerald-600"
                  />
                </div>,
                document.body
              )}
            <div
              className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[3px] shadow-lg flex items-center justify-center text-base sm:text-lg mb-1 
                pointer-events-auto hover:scale-105 transition-transform
                ${allowPhase1Click ? "cursor-pointer" : "cursor-default"}
                ${getColorClasses(phase1.color, activePhase === phase1.id)} 
                ${isPhase1Completed ? "opacity-40 grayscale" : ""}`}
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
                  className={`h-5 w-5 sm:h-6 sm:w-6 object-contain ${
                    isPhase1Completed ? "opacity-60" : ""
                  }`}
                />
              ) : (
                <span className="text-sm sm:text-base">{phase1.icon}</span>
              )}
              {activePhase === phase1.id && !isPhase1Completed && (
                <span
                  className={`absolute inset-0 rounded-full animate-ping ${getPingTone(
                    phase1.color
                  )}`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Connector P1 → Ra hoa */}
        {cyclePhases.length > 0 && (
          <svg
            width={RING_SIZE}
            height="40"
            viewBox={`0 0 ${RING_SIZE} 40`}
            className="overflow-visible"
            style={{
              transform: "scale(var(--ring-scale, 1))",
              transformOrigin: "center",
            }}
          >
            {activePhaseCanonical === "growth_development" && showP1Idle && (
              <>
                <line
                  x1={centerX}
                  y1="4"
                  x2={centerX}
                  y2="34"
                  stroke={connectorColor}
                  strokeWidth="2"
                  strokeDasharray="8,6"
                  strokeLinecap="round"
                  opacity={0.9}
                  className="flow-line"
                />
                <polygon
                  points={`${centerX},38 ${centerX - 6},30 ${centerX + 6},30`}
                  fill={connectorColor}
                  opacity={0.95}
                />
              </>
            )}
            {p1Transition && (
              <LCTransientPath
                key={`p1-${p1Key}`}
                d={`M ${centerX} 4 L ${centerX} 34`}
                color={connectorColor}
                duration={950}
                headSize={8}
                headPad={5}
                mode="grow"
                headVisible
              />
            )}
            {!showP1Idle && isPhase1Completed && !p1Transition && (
              <>
                <line
                  x1={centerX}
                  y1="4"
                  x2={centerX}
                  y2="34"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="8,6"
                  strokeLinecap="round"
                  opacity={0.6}
                />
                <polygon
                  points={`${centerX},38 ${centerX - 6},30 ${centerX + 6},30`}
                  fill="#cbd5e1"
                  opacity={0.7}
                />
              </>
            )}
          </svg>
        )}

        {/* Hiển thị thông tin cây khi chỉ có 1 giai đoạn */}
        {cyclePhases.length === 0 && (
          <div className="mt-2 flex justify-center">
            <div
              className="bg-white/95 backdrop-blur rounded-xl shadow-lg ring-1 ring-black/5
                          px-4 py-3 text-center"
            >
              <div
                className="font-bold text-emerald-600 text-sm"
                title={typeLabel}
              >
                {typeLabel}
              </div>
            </div>
          </div>
        )}

        {/* Vòng tròn */}
        {cyclePhases.length > 0 && (
          <div
            className="relative overflow-visible"
            style={{
              width: RING_SIZE,
              height: RING_SIZE,
              transform: "scale(var(--ring-scale, 1))",
              transformOrigin: "center",
            }}
          >
            {/* center info - chỉ hiển thị tên loại cây */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div
                className="bg-white/95 backdrop-blur rounded-full shadow-xl ring-1 ring-black/5
                            w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center p-2 text-center"
              >
                <div
                  className="font-bold text-emerald-600 text-[10px] sm:text-xs leading-tight max-w-[44px] sm:max-w-[52px] break-words line-clamp-2"
                  title={typeLabel}
                >
                  {typeLabel}
                </div>
              </div>
            </div>

            <div
              className={`absolute inset-0 overflow-visible ${
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
                            strokeDasharray={persisted ? "12 10" : undefined}
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

              {/* nodes with hover tooltips */}
              <div
                ref={nodeLayerRef}
                className="absolute inset-0 z-30 overflow-visible"
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
                  const isHovered = hoveredPhaseId === phase.id;
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
                    "absolute transition-all duration-200 select-none pointer-events-auto",
                    nodeInteractionEnabled
                      ? "cursor-pointer"
                      : "cursor-default",
                    isDragging ? "scale-110 drop-shadow-xl" : "",
                    isHovered && !isDragging ? "scale-105" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <div
                      key={phase.id}
                      className={nodeWrapperClass}
                      style={nodeStyle}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipPos({
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                        setHoveredPhaseId(phase.id);
                      }}
                      onMouseLeave={() => setHoveredPhaseId(null)}
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
                      {/* Tooltip on hover - rendered via portal */}
                      {isHovered && (
                        <PhaseTooltip
                          phase={phase}
                          isActive={isActive}
                          nodeHasColor={nodeHasColor}
                          position={tooltipPos}
                        />
                      )}
                      {/* Node circle - only icon, no label */}
                      <div
                        className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-[3px] shadow-lg flex items-center justify-center
                                    ${getColorClasses(
                                      phase.color,
                                      nodeHasColor
                                    )}`}
                      >
                        {phase.iconImageUrl ? (
                          <img
                            src={phase.iconImageUrl}
                            alt={phase.name}
                            className={`h-4 w-4 sm:h-5 sm:w-5 object-contain ${
                              nodeHasColor ? "" : "grayscale opacity-40"
                            }`}
                          />
                        ) : (
                          <span
                            className={`text-sm sm:text-base ${
                              nodeHasColor ? "" : "grayscale opacity-40"
                            }`}
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
