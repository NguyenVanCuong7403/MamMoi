import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ArrowDown } from "lucide-react";
import TreeRepository from "@/API/repositories/TreeRepository";

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

function normalizePhaseId(x) {
  if (!x) return "growth_development";
  const s = String(x).trim().toLowerCase();
  if (PHASE_ID_ALIASES[s]) return s; // đã là id
  for (const [id, aliases] of Object.entries(PHASE_ID_ALIASES)) {
    if (id === s || aliases.includes(s)) return id;
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
}) {
  const phase1 = {
    id: "growth_development",
    name: "Sinh trưởng & Phát triển",
    icon: "🌱",
    color: "emerald",
  };
  const cyclePhases = [
    { id: "flowering", name: "Ra Hoa", icon: "🌸", color: "pink" },
    { id: "fruiting", name: "Ra quả", icon: "🍎", color: "lime" },
    { id: "pre_harvest", name: "Trước thu hoạch", icon: "🔍", color: "amber" },
    { id: "post_harvest", name: "Sau thu hoạch", icon: "🌿", color: "teal" },
  ];
  const getColorClasses = (color, activeLike) => {
    const m = {
      emerald: {
        active:
          "bg-emerald-600 border-emerald-400 shadow-emerald-300 text-white",
        default: "bg-white border-gray-200",
      },
      pink: {
        active: "bg-pink-600 border-pink-400 shadow-pink-300 text-white",
        default: "bg-white border-gray-200",
      },
      lime: {
        active: "bg-lime-600 border-lime-400 shadow-lime-300 text-white",
        default: "bg-white border-gray-200",
      },
      amber: {
        active: "bg-amber-600 border-amber-400 shadow-amber-300 text-white",
        default: "bg-white border-gray-200",
      },
      teal: {
        active: "bg-teal-600 border-teal-400 shadow-teal-300 text-white",
        default: "bg-white border-gray-200",
      },
    };
    return activeLike ? m[color].active : m[color].default;
  };

  // ==== Geometry (đã thu gọn để vừa cột Aside) ====
  const RING_SIZE = 240; // ⟵ nhỏ hơn bản demo
  const radius = 92;
  const centerX = RING_SIZE / 2,
    centerY = RING_SIZE / 2;
  const nodeR = 26,
    STROKE = 4,
    HEAD_SIZE = 10,
    HEAD_PAD = HEAD_SIZE * 0.85,
    MASK_INSET = 6;

  const GUIDE_ARROW_COUNT = 2,
    GUIDE_ARROW_SIZE = 7;
  const PHASE_COLORS = {
    flowering: "#ec4899",
    fruiting: "#84cc16",
    pre_harvest: "#f59e0b",
    post_harvest: "#14b8a6",
  };

  const getCirclePosition = (index, total) => {
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
    const from = getCirclePosition(iFrom, 4).angle;
    const to = getCirclePosition(iTo, 4).angle;
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
      const forward = (fromIdx + 1) % 4 === toIdx;
      const backward = (toIdx + 1) % 4 === fromIdx;
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
    activePhase === "growth_development" && !isPhase1Completed && !p1Transition;
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
      {Array.from({ length: 4 }).map((_, idx) => {
        const { x, y } = getCirclePosition(idx, 4);
        return (
          <circle key={idx} cx={x} cy={y} r={nodeR + MASK_INSET} fill="black" />
        );
      })}
    </mask>
  );

  const renderGuideArrows = () => {
    return cyclePhases.map((_, i) => {
      let { thetaStart, thetaEnd } = trimAngles(i, (i + 1) % 4);
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
  const phaseName = (id) =>
    id === phase1.id
      ? phase1.name
      : cyclePhases.find((p) => p.id === id)?.name || id;
  const currentLabel = phaseName(currentPhaseId);
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
        currentPhaseId
      ),
    [currentPhaseId]
  );

  const canEditFruit = useMemo(
    () => ["fruiting", "pre_harvest", "post_harvest"].includes(currentPhaseId),
    [currentPhaseId]
  );

  // Mỗi lần phase hiện tại đổi → báo cho TreeDetail biết
  useEffect(() => {
    if (typeof onPhaseGateChange === "function") {
      onPhaseGateChange({
        currentPhaseId,
        canEditFlower,
        canEditFruit,
      });
    }
  }, [onPhaseGateChange, currentPhaseId, canEditFlower, canEditFruit]);

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
              className="inline-flex items-center rounded-full border px-2.5 py-0.5
               bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold
               max-w-[240px] whitespace-normal break-words leading-tight text-center"
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
            className={`relative w-12 h-12 rounded-full border-4 shadow-lg flex items-center justify-center text-lg mb-1.5 pointer-events-none
              ${getColorClasses("emerald", activePhase === phase1.id)} ${
              isPhase1Completed ? "opacity-40 grayscale" : ""
            }`}
          >
            {phase1.icon}
            {activePhase === phase1.id && !isPhase1Completed && (
              <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/60" />
            )}
          </div>
          <div
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-center ring-1 ring-black/5 shadow-sm
  ${
    isPhase1Completed
      ? "bg-white text-gray-700 border border-gray-200 opacity-70"
      : "bg-emerald-600 text-white"
  }`}
          >
            {phase1.name} {/* luôn là "Sinh trưởng & Phát triển" */}
          </div>
        </div>

        {/* Connector P1 → Ra hoa */}
        <svg
          width={RING_SIZE}
          height="56"
          viewBox={`0 0 ${RING_SIZE} 56`}
          className="overflow-visible my-0.5"
        >
          {activePhase === "growth_development" && showP1Idle && (
            <>
              <line
                x1={centerX}
                y1="6"
                x2={centerX}
                y2="48"
                stroke="#ec4899"
                strokeWidth="3"
                strokeDasharray="10,8"
                strokeLinecap="round"
                opacity={0.9}
                className="flow-line"
              />
              <polygon
                points={`${centerX},54 ${centerX - 8},46 ${centerX + 8},46`}
                fill="#ec4899"
                opacity={0.95}
              />
            </>
          )}
          {p1Transition && (
            <LCTransientPath
              key={`p1-${p1Key}`}
              d={`M ${centerX} 6 L ${centerX} 48`}
              color="#ec4899"
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

        {/* Vòng tròn */}
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
                const hideRemoving = isBackwardRun && index === removingArcIdx;
                const hidePost = postHideIdx !== null && index === postHideIdx;

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
            <div className="absolute inset-0 z-30">
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
                    (allowActiveColor && isActive && phase.id !== suppressId) ||
                    isPreview);
                return (
                  <div
                    key={phase.id}
                    className="absolute transition-all duration-300 pointer-events-none select-none"
                    style={{
                      left: `${pos.x}px`,
                      top: `${pos.y}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`relative w-12 h-12 rounded-full border-4 shadow-lg flex items-center justify-center text-lg
                                      ${getColorClasses(
                                        phase.color,
                                        nodeHasColor
                                      )}`}
                      >
                        <span
                          className={nodeHasColor ? "" : "grayscale opacity-40"}
                        >
                          {phase.icon}
                        </span>
                        {((allowActiveColor &&
                          isActive &&
                          phase.id !== suppressId) ||
                          isPreview) && (
                          <span
                            className={`pointer-events-none absolute inset-0 rounded-full animate-ping opacity-60
                            ${
                              phase.color === "pink"
                                ? "bg-pink-400"
                                : phase.color === "lime"
                                ? "bg-lime-400"
                                : phase.color === "amber"
                                ? "bg-amber-400"
                                : "bg-teal-400"
                            }`}
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
function LCPhaseDropdown({ activePhase, onPickPhase, onStartNewCycle }) {
  const [open, setOpen] = useState(false);
  const items = [
    { id: "flowering", name: "Ra Hoa", icon: "🌸" },
    { id: "fruiting", name: "Đậu quả", icon: "🍏" },
    { id: "pre_harvest", name: "Trước thu hoạch", icon: "🔍" },
    { id: "post_harvest", name: "Sau thu hoạch", icon: "🌿" },
  ];
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
        <div className="absolute left-0 top-full mt-2 w-56 bg-white/95 backdrop-blur rounded-xl shadow-2xl border border-gray-200 z-[60] overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {items.map((it) => (
              <div key={it.id}>
                <button
                  onClick={() => {
                    setOpen(false);
                    onPickPhase(it.id);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl border transition-all flex items-center gap-2.5
                    ${
                      activePhase === it.id
                        ? "bg-emerald-50 border-emerald-300 shadow-sm"
                        : "bg-white hover:bg-blue-50 border-gray-200 hover:shadow-md"
                    }`}
                >
                  <span className="text-[18px] leading-none">{it.icon}</span>
                  <span className="font-semibold text-[12px] text-gray-900 whitespace-nowrap">
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
}) {
  const labelOf = (id) =>
    ({
      growth_development: "Sinh trưởng & Phát triển",
      flowering: "Ra Hoa",
      fruiting: "Đậu quả",
      pre_harvest: "Trước thu hoạch",
      post_harvest: "Sau thu hoạch",
    }[id] || id);

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

  const cyclePhases = ["flowering", "fruiting", "pre_harvest", "post_harvest"];
  const isCyclePhase = (p) => cyclePhases.includes(p);

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
    ? Math.max(0, cyclePhases.indexOf(initPhase))
    : -1;

  // Phase controlled
  const [activePhase, setActivePhase] = useState(initPhase);
  useEffect(() => {
    if (value != null) setActivePhase(normalizePhaseId(value));
  }, [value]);

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

    if (!externalP1Done) {
      setTrailIndex(-1);
      return;
    }

    const idx = cyclePhases.indexOf(externalPhase);
    if (idx >= 0) setTrailIndex(idx);
  }, [value, phase1CompletedProp]);

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
    const N = cyclePhases.length;
    if (from === "growth_development" && isCyclePhase(to)) {
      steps.push({ type: "p1" });
      from = "flowering";
    }
    if (isCyclePhase(from) && isCyclePhase(to) && from !== to) {
      let i = cyclePhases.indexOf(from),
        j = cyclePhases.indexOf(to);
      let dir =
        from === "post_harvest" && to === "flowering" ? +1 : j > i ? +1 : -1;
      while (i !== j) {
        const next = (i + dir + N) % N;
        steps.push({
          type: "arc",
          from: cyclePhases[i],
          to: cyclePhases[next],
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
    if (firstArc) {
      const N = cyclePhases.length;
      const iFrom = cyclePhases.indexOf(firstArc.from);
      const iTo = cyclePhases.indexOf(firstArc.to);
      setIsBackwardRun((iFrom + 1) % N !== iTo);
    } else setIsBackwardRun(false);

    for (let idx = 0; idx < steps.length; idx++) {
      const s = steps[idx];
      if (s.type === "p1") {
        setP1Transition(true);
        setP1Key((k) => k + 1);
        await wait(950);
        setP1Transition(false);
        if (!isPhase1Completed) setIsPhase1Completed(true);
        setTrailIndex(0);
        setPreviewPhase("flowering");
        await wait(DWELL);
        setPreviewPhase(null);
        continue;
      }
      const N = cyclePhases.length;
      const iFrom = cyclePhases.indexOf(s.from),
        iTo = cyclePhases.indexOf(s.to);
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

  const requestChangePhase = (to, cause = "pick") => {
    if (isRunning) return;
    const from = activePhase;
    let title = "Xác nhận đổi giai đoạn";
    let message = `Bạn muốn chuyển từ "${labelOf(from)}" sang "${labelOf(
      to
    )}"?`;
    let highlight = "";
    if (from === "post_harvest" && to === "flowering")
      highlight = "Chuyển Sau thu hoạch → Ra Hoa sẽ BẮT ĐẦU MỘT CHU KỲ MỚI.";
    if (from === "growth_development" && isCyclePhase(to))
      message = `Hoàn tất "${labelOf(from)}" và chuyển sang "${labelOf(to)}"?`;
    if (cause === "start-new-cycle") {
      title = "Bắt đầu giai đoạn mới";
      message = "Chu kỳ mới sẽ khởi động và vòng xoay 1s.";
      highlight = "Điểm bắt đầu: Ra Hoa.";
    }
    setPendingPhase(to);
    setConfirmText({ title, message, highlight });
    setConfirmOpen(true);
  };

  /**
   * Update lifecycle using dedicated lifecycle API
   */
  async function updateLifecyclePhase(phaseId, cycleCount, phase1Completed) {
    if (!treeId) return;

    try {
      const payload = {
        phaseId: phaseId,
        ...(cycleCount != null && { cycleCount }),
        ...(phase1Completed != null && { phase1Completed }),
      };

      const response = await TreeRepository.updateLifecycle(treeId, payload);
      return response?.data ?? response;
    } catch (err) {
      console.error("Update lifecycle failed", err);
      throw err; // Re-throw to allow caller to handle
    }
  }

  const onConfirmModal = async () => {
    if (isRunning) return;
    const to = pendingPhase;
    if (!to) return;
    setConfirmOpen(false);
    setPendingPhase(null);
    await flush();
    setIsRunning(true);

    const from = activePhase;
    const shouldSpin =
      (from === "post_harvest" && to === "flowering") ||
      confirmText.title === "Bắt đầu giai đoạn mới";
    const steps = buildSteps(from, to);

    let nextPhaseId = to;

    // TÍNH TRẠNG THÁI MỚI (trước khi gọi API)
    const nextP1 = nextPhaseId !== "growth_development";

    // Nếu là Sau thu hoạch -> Ra Hoa thì tăng chu kỳ
    const nextCount =
      from === "post_harvest" && nextPhaseId === "flowering"
        ? cycleCount + 1
        : cycleCount;

    // Gọi API lifecycle để cập nhật
    try {
      const lifecycleResponse = await updateLifecyclePhase(
        nextPhaseId,
        nextCount,
        nextP1
      );

      // Nếu API trả về dữ liệu, sử dụng dữ liệu từ API (single source of truth)
      if (lifecycleResponse) {
        const apiPhaseId = lifecycleResponse.phaseId || nextPhaseId;
        const apiCycleCount = lifecycleResponse.cycleCount ?? nextCount;
        const apiPhase1Completed = lifecycleResponse.phase1Completed ?? nextP1;
        const apiStageId = lifecycleResponse.stageId;

        // Cập nhật state với dữ liệu từ API
        setActivePhase(apiPhaseId);
        setCycleCount(apiCycleCount);
        setIsPhase1Completed(apiPhase1Completed);

        // Nếu không có bước animation, vẫn phải tự cập nhật trail hợp lý
        if (steps.length === 0) {
          if (from === "growth_development" && to === "growth_development") {
            // No change
          } else if (from === "post_harvest" && to === "flowering") {
            setTrailIndex(0);
            runSpinReset();
          } else {
            setTrailIndex(cyclePhases.indexOf(apiPhaseId));
          }
        } else {
          await playSteps(steps, apiPhaseId, shouldSpin);
        }

        // BẮN SỰ KIỆN RA PARENT với dữ liệu từ API
        if (typeof onChange === "function") {
          onChange({
            phaseId: apiPhaseId,
            cycleCount: apiCycleCount,
            phase1Completed: apiPhase1Completed,
            stageId: apiStageId,
          });
        }
      } else {
        // Fallback nếu API không trả về dữ liệu
        setActivePhase(nextPhaseId);
        setCycleCount(nextCount);
        setIsPhase1Completed(nextP1);

        if (steps.length === 0) {
          if (from === "growth_development" && to === "growth_development") {
            // No change
          } else if (from === "post_harvest" && to === "flowering") {
            setTrailIndex(0);
            runSpinReset();
          } else {
            setTrailIndex(cyclePhases.indexOf(nextPhaseId));
          }
        } else {
          await playSteps(steps, nextPhaseId, shouldSpin);
        }

        if (typeof onChange === "function") {
          onChange({
            phaseId: nextPhaseId,
            cycleCount: nextCount,
            phase1Completed: nextP1,
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
  };

  return (
    <div className="relative">
      {/* nút điều khiển gọn, bám góc phải */}
      {!disabled &&
        (portalEl ? (
          createPortal(
            <LCPhaseDropdown
              activePhase={activePhase}
              onPickPhase={(id) => requestChangePhase(id, "pick")}
              onStartNewCycle={() =>
                requestChangePhase("flowering", "start-new-cycle")
              }
            />,
            portalEl
          )
        ) : (
          <div className="absolute right-0 -top-1">
            <LCPhaseDropdown
              activePhase={activePhase}
              onPickPhase={(id) => requestChangePhase(id, "pick")}
              onStartNewCycle={() =>
                requestChangePhase("flowering", "start-new-cycle")
              }
            />
          </div>
        ))}
      {disabled && (
        <div className="absolute right-0 -top-1">
          <span
            className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[11px] font-extrabold text-white bg-gray-400 cursor-not-allowed"
            title="Đã dừng hoạt động"
          >
            Cập nhật giai đoạn
          </span>
        </div>
      )}

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
