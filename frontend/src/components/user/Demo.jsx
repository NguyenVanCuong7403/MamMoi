import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ArrowDown } from "lucide-react";

/********************
 * Lifecycle Timeline (COMPACT • MƯỢT • MULTI-HOP • PREVIEW • TRAIL by index)
 * - Arrow chỉ hiển thị khi đang chuyển (transient)
 * - Phase1 → Ra Hoa: line rAF
 * - Thuận: tăng trailIndex ⇒ giữ màu node & arc đã qua
 * - Ngược: suppress node xuất phát ngay; arrow chạy; arrow biến mất; giảm trailIndex ⇒ gỡ arc/node
 ********************/

function LifecycleTimeline({
  activePhase,
  previewPhase,
  isPhase1Completed,
  isSpinning,
  treeData,
  transitionFlow,      // { from, to } — step hiện tại
  transitionKey,       // ép mount lại transient arc mỗi step
  p1Transition,        // đang chạy Phase1 → Ra Hoa
  p1Key,               // ép mount lại transient line
  trailIndex,          // NEW: 0..3 (-1 nếu chưa vào vòng)
  suppressId,          // NEW: node đang bị dập màu tạm thời khi chạy ngược
}) {
  const phase1 = {
    id: "growth_development",
    name: "Sinh trưởng & Phát triển",
    icon: "🌱",
    color: "emerald",
  };

  const cyclePhases = [
    { id: "flowering", name: "Ra Hoa", icon: "🌸", color: "pink" },
    { id: "fruiting", name: "Đậu quả", icon: "🍏", color: "lime" },
    { id: "pre_harvest", name: "Trước thu hoạch", icon: "🔍", color: "amber" },
    { id: "post_harvest", name: "Sau thu hoạch", icon: "🌿", color: "teal" },
  ];

  const getColorClasses = (color, isActiveLike) => {
    const colors = {
      emerald: { active: "bg-emerald-600 border-emerald-400 shadow-emerald-300 text-white", default: "bg-white border-gray-200" },
      pink:    { active: "bg-pink-600 border-pink-400 shadow-pink-300 text-white",          default: "bg-white border-gray-200" },
      lime:    { active: "bg-lime-600 border-lime-400 shadow-lime-300 text-white",          default: "bg-white border-gray-200" },
      amber:   { active: "bg-amber-600 border-amber-400 shadow-amber-300 text-white",       default: "bg-white border-gray-200" },
      teal:    { active: "bg-teal-600 border-teal-400 shadow-teal-300 text-white",          default: "bg-white border-gray-200" },
    };
    return isActiveLike ? colors[color].active : colors[color].default;
  };

  /* ====== GEOMETRY ====== */
  const RING_SIZE = 260;
  const radius = 98;
  const centerX = RING_SIZE / 2;
  const centerY = RING_SIZE / 2;
  const nodeR = 28;
  const dashFlowDur = "2.2s";

  const getCirclePosition = (index, total) => {
    const angle = index * ((2 * Math.PI) / total) - Math.PI / 2;
    return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle), angle };
  };

  // sweep=1: cùng chiều kim; sweep=0: ngược chiều
  const buildArcD = (thetaStart, thetaEnd, r, sweep = 1) => {
    const sx = centerX + r * Math.cos(thetaStart);
    const sy = centerY + r * Math.sin(thetaStart);
    const ex = centerX + r * Math.cos(thetaEnd);
    const ey = centerY + r * Math.sin(thetaEnd);
    return `M ${sx} ${sy} A ${r} ${r} 0 0 ${sweep} ${ex} ${ey}`;
  };

  const tangentAngleAtEnd = (thetaEnd, r, epsilon = 0.04) => {
    const ex = centerX + r * Math.cos(thetaEnd);
    const ey = centerY + r * Math.sin(thetaEnd);
    const px = centerX + r * Math.cos(thetaEnd - epsilon);
    const py = centerY + r * Math.sin(thetaEnd - epsilon);
    return Math.atan2(ey - py, ex - px);
  };

  const PHASE_COLORS = {
    flowering: "#ec4899",
    fruiting: "#84cc16",
    pre_harvest: "#f59e0b",
    post_harvest: "#14b8a6",
  };

  // Chuẩn bị transient arc cho step hiện tại
  let transientConfig = null;
  if (transitionFlow) {
    const fromIdx = cyclePhases.findIndex((p) => p.id === transitionFlow.from);
    const toIdx = cyclePhases.findIndex((p) => p.id === transitionFlow.to);
    const N = cyclePhases.length;
    if (fromIdx > -1 && toIdx > -1) {
      const forward = (fromIdx + 1) % N === toIdx;
      const backward = (toIdx + 1) % N === fromIdx;
      if (forward || backward) {
        const start = getCirclePosition(fromIdx, N);
        const end = getCirclePosition(toIdx, N);
        const GAP = Math.min(1, (nodeR + 6) / radius);
        const alpha = Math.asin(GAP);
        transientConfig = {
          sweep: forward ? 1 : 0,
          thetaStart: start.angle + alpha,
          thetaEnd: end.angle - alpha,
          // LUÔN lấy màu của node xuất phát
          color: PHASE_COLORS[cyclePhases[fromIdx].id] || "#10b981",
          fromIdx,
          toIdx,
        };
      }
    }
  }

  const showP1IdleAnim =
    activePhase === "growth_development" && !isPhase1Completed && !p1Transition;

  /* ====== CSS ANIMS ====== */
  const css = `
    @keyframes dashFlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -28; } }
    .flow-line { animation: dashFlow ${dashFlowDur} linear infinite; will-change: stroke-dashoffset; }
    @keyframes dashFlowSlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -28; } }
    .flow-arc-slow { animation: dashFlowSlow 5.5s linear infinite; will-change: stroke-dashoffset; }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    .fade-in-160 { animation: fadeIn .16s ease-out both; }
  `;

  return (
    <div className="w-full">
      <style>{css}</style>
      <div className="relative flex flex-col items-center gap-2">
        {/* Phase 1 */}
        <div className="flex flex-col items-center select-none">
          <div className="inline-block bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-semibold mb-1 ring-1 ring-emerald-200/60">
            Giai đoạn ban đầu
          </div>
          <div
            className={`relative w-14 h-14 rounded-full border-4 shadow-lg flex items-center justify-center text-lg mb-1.5 pointer-events-none
              ${getColorClasses(
                "emerald",
                activePhase === phase1.id
              )} ${isPhase1Completed ? "opacity-40 grayscale" : ""}`}
          >
            {phase1.icon}
            {activePhase === phase1.id && !isPhase1Completed && (
              <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/60" />
            )}
          </div>
          <div
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold text-center ring-1 ring-black/5 shadow-sm
            ${isPhase1Completed ? "opacity-40 bg-white" : "bg-emerald-600 text-white"}`}
          >
            {phase1.name}
          </div>
        </div>

        {/* CONNECTOR: Phase1 → Ra Hoa */}
        <svg width={RING_SIZE} height="64" viewBox={`0 0 ${RING_SIZE} 64`} className="overflow-visible my-0.5">
          {showP1IdleAnim && (
            <>
              <line
                x1={centerX}
                y1="6"
                x2={centerX}
                y2="52"
                stroke="#ec4899"
                strokeWidth="3"
                strokeDasharray="10,8"
                strokeLinecap="round"
                opacity={0.9}
                className="flow-line"
              />
              <polygon points={`${centerX},58 ${centerX - 8},50 ${centerX + 8},50`} fill="#ec4899" opacity={0.95} />
            </>
          )}
          {p1Transition && (
            <TransientPath
              key={`p1-${p1Key}`}
              d={`M ${centerX} 6 L ${centerX} 52`}
              color="#ec4899"
              duration={950}
              headSize={12}
            />
          )}
        </svg>

        {/* Vòng tròn */}
        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
          {/* Center info */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-white/90 backdrop-blur rounded-full shadow-xl ring-1 ring-black/5 w-24 h-24 flex flex-col items-center justify-center p-2">
              <div className="text-[10px] text-gray-500 font-medium">Loại cây</div>
              <div className="text-[13px] font-bold text-emerald-600">{treeData?.type || "—"}</div>
              <div className="text-[10px] text-gray-500 font-medium mt-0.5">Giống</div>
              <div className="text-[10px] font-semibold text-gray-700">{treeData?.variety || "—"}</div>
              <div className="text-[9px] text-gray-400 mt-0.5">ID: {treeData?.id || "—"}</div>
            </div>
          </div>

          {/* Rotating layer */}
          <div className={`absolute inset-0 ${isSpinning ? "animate-spin-once" : ""}`} style={{ transformOrigin: "50% 50%" }}>
            <style>{`
              @keyframes spin-once { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              .animate-spin-once { animation: spin-once 1s ease-in-out; }
            `}</style>

            <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} shapeRendering="geometricPrecision">
              {/* base dashed circle */}
              <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="5,5" />

              {/* STATIC arcs & arrowheads */}
              {cyclePhases.map((phase, index) => {
                const nIndex = (index + 1) % cyclePhases.length;
                const start = getCirclePosition(index, cyclePhases.length);
                const end = getCirclePosition(nIndex, cyclePhases.length);

                const GAP = Math.asin(Math.min(1, (nodeR + 6) / radius));
                const thetaStart = start.angle + GAP;
                const thetaEnd = end.angle - GAP;

                const isActive = activePhase === cyclePhases[index].id;
                const isPreview = previewPhase === cyclePhases[index].id;

                // Trail theo index: arc i sáng nếu i <= trailIndex-1
                const persisted = isPhase1Completed && trailIndex >= 1 && index <= trailIndex - 1;

                const phaseColor = PHASE_COLORS[phase.id] || "#10b981";
                const dArc = buildArcD(thetaStart, thetaEnd, radius, 1);
                const endX = centerX + radius * Math.cos(thetaEnd);
                const endY = centerY + radius * Math.sin(thetaEnd);
                const tanDeg = (tangentAngleAtEnd(thetaEnd, radius) * 180) / Math.PI;

                const hideStaticFrom = transitionFlow && transientConfig && index === transientConfig.fromIdx;
                const hideStaticTo   = transitionFlow && transientConfig && index === transientConfig.toIdx;
                const hideStaticCurrent = (!transitionFlow && (isActive || isPreview));

                return (
                  <g key={`arc-${phase.id}`}>
                    {isPhase1Completed && (
                      <>
                        <path
                          d={dArc}
                          fill="none"
                          stroke={persisted ? phaseColor : "#d1d5db"}
                          strokeWidth="3"
                          opacity={persisted ? "0.65" : "0.35"}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ vectorEffect: "non-scaling-stroke" }}
                          strokeDasharray={persisted ? "16 12" : undefined}
                          className={persisted ? "flow-arc-slow" : undefined}
                        />
                        <g
                          transform={`translate(${endX}, ${endY}) rotate(${tanDeg})`}
                          opacity={hideStaticFrom || hideStaticTo || hideStaticCurrent ? 0 : 1}
                          className="fade-in-160"
                        >
                          <polygon
                            points="0,0 -10,-5 -10,5"
                            fill={persisted ? phaseColor : "#d1d5db"}
                            opacity={persisted ? "0.75" : "0.45"}
                          />
                        </g>
                      </>
                    )}
                  </g>
                );
              })}

              {/* TRANSIENT FLOW — step hiện tại (vòng tròn) */}
              {transitionFlow && transientConfig && (
                <TransientArc
                  key={`transient-${transitionKey}-${transitionFlow.from}-${transitionFlow.to}`}
                  thetaStart={transientConfig.thetaStart}
                  thetaEnd={transientConfig.thetaEnd}
                  sweep={transientConfig.sweep}
                  radius={radius}
                  centerX={centerX}
                  centerY={centerY}
                  color={transientConfig.color}
                  duration={1150}
                />
              )}
            </svg>

            {/* Nodes */}
            {cyclePhases.map((phase) => {
              const index = cyclePhases.findIndex(p => p.id === phase.id);
              const pos = getCirclePosition(index, cyclePhases.length);
              const isActive = activePhase === phase.id;
              const isPreview = previewPhase === phase.id;
              const willBeActiveSoon = transitionFlow && transitionFlow.to === phase.id;

              // Node theo trail: i sáng nếu i <= trailIndex, trừ khi bị suppress khi chạy ngược rời nó
              const keepByTrail = isPhase1Completed && trailIndex >= 0 && index <= trailIndex;
              const activeAllowed = !(suppressId && phase.id === suppressId);
              const nodeHasColor = (keepByTrail || (isActive && activeAllowed) || isPreview) && isPhase1Completed;

              return (
                <div
                  key={`node-${phase.id}`}
                  className="absolute transition-all duration-300 pointer-events-none select-none"
                  style={{ left: `${pos.x}px`, top: `${pos.y}px`, transform: "translate(-50%, -50%)" }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative w-14 h-14 rounded-full border-4 shadow-lg flex items-center justify-center text-xl
                      ${getColorClasses(phase.color, nodeHasColor)}`}
                    >
                      <span className={nodeHasColor ? "" : "grayscale opacity-40"}>{phase.icon}</span>

                      {((isActive && activeAllowed) || isPreview) && (
                        <span
                          className={`pointer-events-none absolute inset-0 rounded-full animate-ping opacity-60
                            ${phase.color === "pink" ? "bg-pink-400" : phase.color === "lime" ? "bg-lime-400" : phase.color === "amber" ? "bg-amber-400" : "bg-teal-400"}`}
                        />
                      )}

                      {willBeActiveSoon && !isPreview && (
                        <span className="pointer-events-none absolute inset-0 rounded-full animate-pulse bg-emerald-300/30" />
                      )}
                    </div>
                    <div
                      className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ring-1 ring-black/5 shadow-sm whitespace-nowrap
                        ${nodeHasColor
                          ? `${phase.color === "pink" ? "bg-pink-600" : phase.color === "lime" ? "bg-lime-600" : phase.color === "amber" ? "bg-amber-600" : "bg-teal-600"} text-white`
                          : "bg-white text-gray-700 border border-gray-200"}`}
                    >
                      {phase.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!isPhase1Completed && (
          <div className="text-center mt-2 text-[11px] text-gray-500">
            ⚠️ Hoàn thành giai đoạn 1 để mở khóa chu kỳ (chọn bằng nút “Cập nhật giai đoạn”).
          </div>
        )}
      </div>
    </div>
  );
}

/** Transient PATH (line/arc) with moving head — imperative rAF */
function TransientPath({ d, color, duration = 950, headSize = 12 }) {
  const pathRef = useRef(null);
  const headRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const head = headRef.current;
    if (!path || !head) return;

    const total = path.getTotalLength();
    path.style.strokeDasharray = `${total}`;
    path.style.strokeDashoffset = `${total}`;
    path.style.willChange = "stroke-dashoffset";

    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const shown = total * t;
      const offset = total - shown;
      path.style.strokeDashoffset = `${offset}`;

      const p = path.getPointAtLength(shown);
      const prev = path.getPointAtLength(Math.max(0, shown - 1));
      const angle = Math.atan2(p.y - prev.y, p.x - prev.x) * (180 / Math.PI);
      head.setAttribute("transform", `translate(${p.x}, ${p.y}) rotate(${angle})`);

      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [d, duration]);

  return (
    <g>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.98"
        style={{ vectorEffect: "non-scaling-stroke" }}
      />
      <g ref={headRef}>
        <polygon points={`0,0 -${headSize},-${headSize/2} -${headSize},${headSize/2}`} fill={color} opacity="0.98" />
      </g>
    </g>
  );
}

/** Arc transient wrapper (for circle arcs) */
function TransientArc({ thetaStart, thetaEnd, sweep, radius, centerX, centerY, color, duration = 1150 }) {
  const d = `M ${centerX + radius * Math.cos(thetaStart)} ${centerY + radius * Math.sin(thetaStart)}
             A ${radius} ${radius} 0 0 ${sweep} ${centerX + radius * Math.cos(thetaEnd)} ${centerY + radius * Math.sin(thetaEnd)}`;
  return <TransientPath d={d} color={color} duration={duration} headSize={13} />;
}

/** Confirm Modal (giữ nguyên) */
function ConfirmModal({ open, onClose, onConfirm, title, message, highlight }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl w-full max-w-md p-6 relative ring-1 ring-black/5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-40 blur-2xl" />
        <div className="absolute -bottom-24 -left-24 w-44 h-44 bg-gradient-to-tr from-pink-200 to-amber-200 rounded-full opacity-40 blur-2xl" />
        <h3 className="text-lg font-extrabold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 mb-4 text-sm">{message}</p>
        {highlight && <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">{highlight}</div>}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm">Hủy</button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm shadow"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

/** Dropdown Update Button (nhỏ, trái) */
function PhaseDropdown({ activePhase, onPickPhase, onStartNewCycle }) {
  const [open, setOpen] = useState(false);
  const items = [
    { id: "flowering", name: "Ra Hoa", icon: "🌸" },
    { id: "fruiting", name: "Đậu quả", icon: "🍏" },
    { id: "pre_harvest", name: "Trước thu hoạch", icon: "🔍" },
    { id: "post_harvest", name: "Sau thu hoạch", icon: "🌿" },
  ];
  return (
    <div className="relative z-[60]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-extrabold text-white
                   bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800
                   shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_6px_14px_rgba(37,99,235,.3)]
                   ring-1 ring-black/10"
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
                    ${activePhase === it.id ? "bg-emerald-50 border-emerald-300 shadow-sm" : "bg-white hover:bg-blue-50 border-gray-200 hover:shadow-md"}`}
                >
                  <span className="text-[18px] leading-none">{it.icon}</span>
                  <span className="font-semibold text-[12px] text-gray-900 whitespace-nowrap">{it.name}</span>
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
                         bg-gradient-to-r from-amber-400 to-pink-500
                         shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_8px_16px_rgba(236,72,153,.3)]
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

/* ===== Utils ===== */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// ép render xong một frame (đôi khi cần 2 rAF để thấy rõ “arrow biến mất”)
const flush = () => new Promise((rs) => requestAnimationFrame(() => requestAnimationFrame(rs)));

/**
 * Main Component
 * - Thuận: tăng trailIndex
 * - Ngược: suppress node xuất phát, arrow biến mất, giảm trailIndex
 * - 5→2 luôn thuận (bắt đầu chu kỳ)
 */
export default function LifecycleDemo() {
  const [activePhase, setActivePhase] = useState("growth_development");
  const [previewPhase, setPreviewPhase] = useState(null);

  const [isPhase1Completed, setIsPhase1Completed] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const [transitionFlow, setTransitionFlow] = useState(null);
  const [transitionKey, setTransitionKey] = useState(0);

  const [p1Transition, setP1Transition] = useState(false);
  const [p1Key, setP1Key] = useState(0);

  // Trail theo index + suppress khi chạy ngược
  const [trailIndex, setTrailIndex] = useState(-1); // -1: chưa vào vòng
  const [suppressId, setSuppressId] = useState(null);

  const treeData = {
    id: "XC-01",
    type: "Xoài",
    variety: "Cát Chu",
    currentPhase: "growth_development",
    cycleCount: 0,
    isPhase1Completed: false,
  };

  const cyclePhases = ["flowering", "fruiting", "pre_harvest", "post_harvest"];
  const isCyclePhase = (p) => cyclePhases.includes(p);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPhase, setPendingPhase] = useState(null);
  const [confirmText, setConfirmText] = useState({ title: "", message: "", highlight: "" });

  const labelOf = (id) => {
    const map = {
      growth_development: "Sinh trưởng & Phát triển",
      flowering: "Ra Hoa",
      fruiting: "Đậu quả",
      pre_harvest: "Trước thu hoạch",
      post_harvest: "Sau thu hoạch",
    };
    return map[id] || id;
  };

  const runSpinReset = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1000);
  };

  const requestChangePhase = (to, cause = "pick") => {
    const from = activePhase;
    let title = "Xác nhận đổi giai đoạn";
    let message = `Bạn muốn chuyển từ "${labelOf(from)}" sang "${labelOf(to)}"?`;
    let highlight = "";

    if (from === "post_harvest" && to === "flowering") {
      highlight = "Bạn đang chuyển từ Sau thu hoạch sang Ra Hoa. Hành động này sẽ BẮT ĐẦU MỘT CHU KỲ MỚI.";
    }
    if (from === "growth_development" && isCyclePhase(to)) {
      message = `Hoàn tất giai đoạn "${labelOf(from)}" và chuyển sang "${labelOf(to)}"?`;
    }
    if (cause === "start-new-cycle") {
      title = "Bắt đầu giai đoạn mới";
      message = "Bạn sắp bắt đầu một chu kỳ mới (reset vòng). Mũi tên và các icon sẽ xoay 1s.";
      highlight = "Chu kỳ mới sẽ bắt đầu tại giai đoạn: Ra Hoa.";
    }

    setPendingPhase(to);
    setConfirmText({ title, message, highlight });
    setConfirmOpen(true);
  };

  // Tạo danh sách step (p1 + các cung) theo hướng yêu cầu
  const buildSteps = (from, to) => {
    const steps = [];
    const N = cyclePhases.length;

    if (from === "growth_development" && isCyclePhase(to)) {
      steps.push({ type: "p1" });
      from = "flowering";
    }

    if (isCyclePhase(from) && isCyclePhase(to) && from !== to) {
      let i = cyclePhases.indexOf(from);
      const j = cyclePhases.indexOf(to);

      let dir = 0;
      if (from === "post_harvest" && to === "flowering") {
        dir = +1; // reset vòng
      } else {
        dir = j > i ? +1 : -1;
      }

      while (i !== j) {
        const next = (i + dir + N) % N;
        steps.push({ type: "arc", from: cyclePhases[i], to: cyclePhases[next] });
        i = next;
      }
    }

    return steps;
  };

  const playSteps = async (steps, finalTo, shouldSpin) => {
    setTransitionFlow(null);
    setPreviewPhase(null);
    setSuppressId(null);

    const DUR = 1150;   // thời gian 1 cung
    const DWELL = 200;  // dừng ngắn

    for (let idx = 0; idx < steps.length; idx++) {
      const s = steps[idx];

      if (s.type === "p1") {
        setP1Transition(true);
        setP1Key((k) => k + 1);
        await wait(950);
        setP1Transition(false);
        if (!isPhase1Completed) setIsPhase1Completed(true);

        // Bắt đầu trail tại Ra Hoa
        setTrailIndex(0);
        setPreviewPhase("flowering");
        await wait(DWELL);
        setPreviewPhase(null);
        continue;
      }

      // Hướng chặng hiện tại
      const N = cyclePhases.length;
      const iFrom = cyclePhases.indexOf(s.from);
      const iTo   = cyclePhases.indexOf(s.to);
      const dir = ((iFrom + 1) % N === iTo) ? +1 : -1;

      if (dir === -1) {
        // NGƯỢC: dập node xuất phát ngay
        setSuppressId(s.from);
        await flush();
      }

      // Chạy arrow
      setTransitionFlow({ from: s.from, to: s.to });
      setTransitionKey((k) => k + 1);
      await wait(DUR);

      // Arrow biến mất trước khi cập nhật trail
      setTransitionFlow(null);
      await flush();

      if (dir === +1) {
        // THUẬN: nhận node đích, tăng trail
        setPreviewPhase(s.to);
        await wait(DWELL);
        setTrailIndex(iTo);
        setPreviewPhase(null);
      } else {
        // NGƯỢC: đã tới nơi, giảm trail (gỡ arc vừa đi)
        setTrailIndex(iTo);
        setSuppressId(null);
        await wait(DWELL);
      }
    }

    // Kết thúc
    if (finalTo === "flowering" && steps.find(st => st.type==="arc" && st.from==="post_harvest" && st.to==="flowering")) {
      setCycleCount((c) => c + 1);
    }
    setActivePhase(finalTo);
    setPreviewPhase(null);
    setSuppressId(null);
    if (shouldSpin) runSpinReset();
  };

  const onConfirmModal = async () => {
    const to = pendingPhase;
    if (!to) return;

    const from = activePhase;
    const shouldSpin =
      (from === "post_harvest" && to === "flowering") || confirmText.title === "Bắt đầu giai đoạn mới";

    const steps = buildSteps(from, to);

    // Nếu chọn thẳng không cần chạy (from === to)
    if (steps.length === 0) {
      if (from === "growth_development" && to === "growth_development") {
        setActivePhase(to);
      } else if (from === "post_harvest" && to === "flowering") {
        setActivePhase(to);
        setTrailIndex(0);
        setCycleCount((c) => c + 1);
        runSpinReset();
      } else {
        setActivePhase(to);
        setTrailIndex(cyclePhases.indexOf(to));
      }
    } else {
      await playSteps(steps, to, shouldSpin);
    }

    setConfirmOpen(false);
    setPendingPhase(null);
  };

  const handlePickPhase = (phaseId) => requestChangePhase(phaseId, "pick");
  const handleStartNewCycle = () => requestChangePhase("flowering", "start-new-cycle");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 p-4 md:p-8 pt-24 md:pt-28">
      <div className="max-w-4xl mx-auto">
        {/* Card gọn, dropdown TRÁI */}
        <div className="relative bg-white/90 backdrop-blur rounded-[24px] shadow-xl ring-1 ring-black/5 p-4 md:p-6 overflow-visible">
          <div className="flex items-center justify-center">
            <h2 className="text-base md:text-lg font-bold text-gray-900 text-center">
              Chu kỳ sinh trưởng cây <span className="text-emerald-700">{treeData?.type || "—"}</span>{" "}
              <span className="text-gray-400">•</span>{" "}
              <span className="text-emerald-700">{treeData?.variety || "—"}</span>
            </h2>
            <div className="absolute left-4 top-4">
              <PhaseDropdown activePhase={activePhase} onPickPhase={handlePickPhase} onStartNewCycle={handleStartNewCycle} />
            </div>
          </div>

          {/* Timeline GIỮ Ở GIỮA */}
          <div className="mt-3 flex justify-center">
            <LifecycleTimeline
              activePhase={activePhase}
              previewPhase={previewPhase}
              isPhase1Completed={isPhase1Completed}
              isSpinning={isSpinning}
              treeData={treeData}
              transitionFlow={transitionFlow}
              transitionKey={transitionKey}
              p1Transition={p1Transition}
              p1Key={p1Key}
              trailIndex={trailIndex}
              suppressId={suppressId}
            />
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingPhase(null);
        }}
        onConfirm={onConfirmModal}
        title={confirmText.title}
        message={confirmText.message}
        highlight={confirmText.highlight}
      />
    </div>
  );
}
