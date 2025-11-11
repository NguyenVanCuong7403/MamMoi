import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { ChevronDown, ArrowDown } from "lucide-react";

/********************
 * Timeline mượt + retract ngược (không quay đầu)
 * - Thuận: arrow grow đến đích, tăng trail
 * - Ngược: line shrink (rút), GIẢM trail trước rồi mới bỏ suppress
 * - useLayoutEffect cho transient tránh khung “tải trước”
 * - postHideIdx che arrowhead tĩnh 1 nhịp sau khi transient tắt
 * - SVG MASK: ringClip che phần line nằm dưới node => không “lòi” & không nháy khi chạm
 * - GUIDE: vòng mũi tên tĩnh hiển thị hướng chu kỳ, 4 đoạn (có cả Sau thu hoạch → Ra hoa)
 ********************/

function LifecycleTimeline({
  activePhase,
  previewPhase,
  isPhase1Completed,
  isSpinning,
  treeData,
  transitionFlow,      // { from, to }
  transitionKey,
  p1Transition,
  p1Key,
  trailIndex,          // 0..3 (-1 = chưa vào vòng)
  suppressId,          // node đang dập khi chạy ngược
  isBackwardRun,       // run ngược nhiều chặng
  postHideIdx,         // ẩn arrowhead tĩnh 1 nhịp
}) {
  const phase1 = { id: "growth_development", name: "Sinh trưởng & Phát triển", icon: "🌱", color: "emerald" };

  const cyclePhases = [
    { id: "flowering",   name: "Ra Hoa",          icon: "🌸", color: "pink"  },
    { id: "fruiting",    name: "Đậu quả",         icon: "🍏", color: "lime"  },
    { id: "pre_harvest", name: "Trước thu hoạch", icon: "🔍", color: "amber" },
    { id: "post_harvest",name: "Sau thu hoạch",   icon: "🌿", color: "teal"  },
  ];

  const getColorClasses = (color, isActiveLike) => {
    const colors = {
      emerald:{ active:"bg-emerald-600 border-emerald-400 shadow-emerald-300 text-white", default:"bg-white border-gray-200" },
      pink:   { active:"bg-pink-600 border-pink-400 shadow-pink-300 text-white",          default:"bg-white border-gray-200" },
      lime:   { active:"bg-lime-600 border-lime-400 shadow-lime-300 text-white",          default:"bg-white border-gray-200" },
      amber:  { active:"bg-amber-600 border-amber-400 shadow-amber-300 text-white",       default:"bg-white border-gray-200" },
      teal:   { active:"bg-teal-600 border-teal-400 shadow-teal-300 text-white",          default:"bg-white border-gray-200" },
    };
    return isActiveLike ? colors[color].active : colors[color].default;
  };

  /* ====== GEOMETRY ====== */
       // kích thước mũi tên
  // slate-300 trung tính
const GUIDE_ARROW_OPACITY= 0.8;
  const RING_SIZE = 260;
  const radius = 98;
  const centerX = RING_SIZE / 2;
  const centerY = RING_SIZE / 2;
  const nodeR = 28;
  const STROKE = 4;
  const HEAD_SIZE = 10;
  const HEAD_PAD  = HEAD_SIZE * 0.85;   // để đầu mũi không “lòi” endpoint
  const MASK_INSET = 6;   
                // line chạy “lún” vào trong node để node che khít

  // GUIDE (mũi tên tĩnh)
  const GUIDE_ARROW_COUNT = 2;          // số mũi tên nhỏ mỗi cung
  const GUIDE_ARROW_SIZE  = 7;          // kích thước mũi tên nhỏ
  const GUIDE_OPACITY     = isPhase1Completed ? 0.55 : 0.3; // mờ nhẹ trước khi mở khóa
const GUIDE_ARROW_COLOR  = "#cbd5e1";
  const dashFlowDur = "2.2s";

  const getCirclePosition = (index, total) => {
    const angle = index * ((2 * Math.PI) / total) - Math.PI / 2;
    return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle), angle };
  };

  // khoảng chừa giữa tâm node và cung
  const alphaGap = Math.asin(Math.min(1, (nodeR + MASK_INSET) / radius)); // thêm MASK_INSET để lún sâu

  const trimAngles = (iFrom, iTo) => {
    const N = cyclePhases.length;
    const from = getCirclePosition(iFrom, N).angle;
    const to   = getCirclePosition(iTo,   N).angle;
    return { thetaStart: from + alphaGap, thetaEnd: to - alphaGap };
  };

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
    flowering:   "#ec4899",
    fruiting:    "#84cc16",
    pre_harvest: "#f59e0b",
    post_harvest:"#14b8a6",
  };

  // transient config — grow (xuôi) hoặc retract (ngược: end→start, không mũi)
  let transientConfig = null;
  if (transitionFlow) {
    const fromIdx = cyclePhases.findIndex((p) => p.id === transitionFlow.from);
    const toIdx   = cyclePhases.findIndex((p) => p.id === transitionFlow.to);
    const N = cyclePhases.length;
    if (fromIdx > -1 && toIdx > -1) {
      const forward  = (fromIdx + 1) % N === toIdx;
      const backward = (toIdx   + 1) % N === fromIdx;
      if (forward || backward) {
        const { thetaStart, thetaEnd } = trimAngles(fromIdx, toIdx);
        const color = PHASE_COLORS[(backward ? cyclePhases[toIdx].id : cyclePhases[fromIdx].id)] || "#10b981";
        const retract = backward;
        const d = retract
          ? buildArcD(thetaEnd, thetaStart, radius, 1)   // rút: end→start
          : buildArcD(thetaStart, thetaEnd, radius, 1);  // grow: start→end
        transientConfig = { fromIdx, toIdx, retract, d, color, thetaEnd };
      }
    }
  }

  const showP1IdleAnim =
    activePhase === "growth_development" && !isPhase1Completed && !p1Transition;

  /* ====== CSS ====== */
  const css = `
    @keyframes dashFlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -28; } }
    .flow-line { animation: dashFlow ${dashFlowDur} linear infinite; will-change: stroke-dashoffset; }
    @keyframes dashFlowSlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -28; } }
    .flow-arc-slow { animation: dashFlowSlow 5.5s linear infinite; will-change: stroke-dashoffset; }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    .fade-in-160 { animation: fadeIn .16s ease-out both; }
  `;

  const isBackwardStep = !!(transitionFlow && transientConfig && transientConfig.retract);
  const removingArcIdx = isBackwardStep ? transientConfig?.toIdx : -1;

  /* ====== SVG MASK: chỉ cho phép vẽ trên vòng tròn, nhưng phần “dưới node” bị che đi ====== */
  const renderRingMask = () => {
    const N = cyclePhases.length;
    const circles = cyclePhases.map((_, idx) => {
      const { x, y } = getCirclePosition(idx, N);
      return (
        <circle
          key={`mask-node-${idx}`}
          cx={x}
          cy={y}
          r={nodeR + MASK_INSET}
          fill="black"
        />
      );
    });
    return (
      <mask id="ringMask" maskUnits="userSpaceOnUse">
        {/* Nền đen → ẩn hết */}
        <rect x="0" y="0" width={RING_SIZE} height={RING_SIZE} fill="black" />
        {/* Cho phép hiển thị quanh vòng */}
        <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="white" strokeWidth={STROKE * 6} />
        {/* Đục lỗ đen ở vị trí node để che phần line “lún” vào trong */}
        {circles}
      </mask>
    );
  };

  /* ====== GUIDE: vòng mũi tên tĩnh, màu theo giai đoạn (điểm xuất phát) ====== */
 // GUIDE: vòng mũi tên tĩnh, màu theo giai đoạn (điểm xuất phát)
const renderGuideArrows = () => {
  const N = cyclePhases.length;

  return cyclePhases.map((_, i) => {
    const fromIdx = i;
    const toIdx   = (i + 1) % N;

    // Lấy góc đã trừ khoảng lún
    let { thetaStart, thetaEnd } = trimAngles(fromIdx, toIdx);

    // FIX WRAP cho cung "Sau thu hoạch -> Ra Hoa" (thetaEnd < thetaStart)
    if (thetaEnd <= thetaStart) {
      thetaEnd += Math.PI * 2;
    }

    const color  = PHASE_COLORS[cyclePhases[fromIdx].id];
    const arrows = [];

    // Rải mũi tên nhỏ theo chiều tiến
    for (let k = 1; k <= GUIDE_ARROW_COUNT; k++) {
      const t   = k / (GUIDE_ARROW_COUNT + 1);
      const ang = thetaStart + (thetaEnd - thetaStart) * t;
      const x   = centerX + radius * Math.cos(ang);
      const y   = centerY + radius * Math.sin(ang);
      const deg = (ang + Math.PI / 2) * (180 / Math.PI);

      arrows.push(
        <g key={`g-${i}-${k}`} transform={`translate(${x}, ${y}) rotate(${deg})`} opacity={GUIDE_OPACITY}>
          <polygon
            points={`0,0 -${GUIDE_ARROW_SIZE},-${GUIDE_ARROW_SIZE/2} -${GUIDE_ARROW_SIZE},${GUIDE_ARROW_SIZE/2}`}
            fill={color}
          />
        </g>
      );
    }

    // Vệt nền rất nhẹ nối các mũi tên (không phải vòng tròn nét đứt)
    return (
      <g key={`gseg-${i}`} mask="url(#ringMask)">
        <path
          d={buildArcD(thetaStart, thetaEnd, radius, 1)}
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

// ====== Bước 1: Helper lấy tên giai đoạn & label hiển thị hiện tại ======
const phaseNameOf = (id) =>
  id === phase1.id
    ? phase1.name
    : (cyclePhases.find(p => p.id === id)?.name || id);

// Ưu tiên trạng thái từ dữ liệu cây; nếu thiếu thì lấy theo activePhase; cuối cùng fallback phase1
// Nếu bạn muốn ưu tiên trạng thái đang thao tác (activePhase) mạnh hơn dữ liệu, đảo lại thứ tự 2 dòng dưới.
const currentPhaseId = treeData?.currentPhase ?? activePhase ?? phase1.id;
const currentLabel   = phaseNameOf(currentPhaseId);


  return (
    <div className="w-full">
      <style>{css}</style>
      <div className="relative flex flex-col items-center gap-2">
        {/* “Giai đoạn ban đầu” -> giữ nguyên hiển thị & ping khi chưa mở khóa */}
        <div className="flex flex-col items-center select-none">
          <div className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-semibold mb-1 ring-1 ring-emerald-200/60">
  Giai đoạn hiện tại: <span className="font-extrabold">{currentLabel}</span>
</div>
          <div
            className={`relative w-14 h-14 rounded-full border-4 shadow-lg flex items-center justify-center text-lg mb-1.5 pointer-events-none
              ${getColorClasses("emerald", activePhase === phase1.id)} ${isPhase1Completed ? "opacity-40 grayscale" : ""}`}
          >
            {phase1.icon}
            {activePhase === phase1.id && !isPhase1Completed && (
              <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/60" />
            )}
          </div>
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold text-center ring-1 ring-black/5 shadow-sm
            ${isPhase1Completed ? "opacity-40 bg-white" : "bg-emerald-600 text-white"}`}>
            {currentLabel}
          </div>
        </div>

        {/* CONNECTOR P1 → Ra Hoa */}
        <svg width={RING_SIZE} height="64" viewBox={`0 0 ${RING_SIZE} 64`} className="overflow-visible my-0.5">
          {showP1IdleAnim && (
            <>
              <line x1={centerX} y1="6" x2={centerX} y2="52" stroke="#ec4899" strokeWidth="3"
                    strokeDasharray="10,8" strokeLinecap="round" opacity={0.9} className="flow-line" />
              <polygon points={`${centerX},58 ${centerX - 8},50 ${centerX + 8},50`} fill="#ec4899" opacity={0.95} />
            </>
          )}
          {p1Transition && (
            <TransientPath
              key={`p1-${p1Key}`}
              d={`M ${centerX} 6 L ${centerX} 52`}
              color="#ec4899"
              duration={950}
              headSize={HEAD_SIZE}
              headPad={HEAD_SIZE * 0.6}
              mode="grow"
              headVisible
            />
          )}

          {/* Sau khi hoàn tất P1: để lại connector mờ chứ không biến mất */}
          {!showP1IdleAnim && isPhase1Completed && !p1Transition && (
            <>
              <line x1={centerX} y1="6" x2={centerX} y2="52" stroke="#cbd5e1" strokeWidth="3"
                    strokeDasharray="10,8" strokeLinecap="round" opacity={0.6} />
              <polygon points={`${centerX},58 ${centerX - 8},50 ${centerX + 8},50`} fill="#cbd5e1" opacity={0.7} />
            </>
          )}
        </svg>

        {/* Vòng tròn */}
        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
          {/* Center info */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur rounded-full shadow-xl ring-1 ring-black/5 w-24 h-24 flex flex-col items-center justify-center p-2">
              <div className="text-[10px] text-gray-500 font-medium">Loại cây</div>
              <div className="text-[13px] font-bold text-emerald-600">{treeData?.type || "—"}</div>
              <div className="text-[10px] text-gray-500 font-medium mt-0.5">Giống</div>
              <div className="text-[10px] text-gray-700 font-semibold">{treeData?.variety || "—"}</div>
              <div className="text-[9px] text-gray-400 mt-0.5">ID: {treeData?.id || "—"}</div>
            </div>
          </div>

          <div className={`absolute inset-0 ${isSpinning ? "animate-spin-once" : ""}`} style={{ transformOrigin: "50% 50%" }}>
            <style>{`
              @keyframes spin-once { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              .animate-spin-once { animation: spin-once 1s ease-in-out; }
            `}</style>

            {/* ARCS + MASK */}
            <svg className="absolute inset-0 w-full h-full z-10" viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} shapeRendering="geometricPrecision">
              {renderRingMask()}
              {/* base vòng chấm mờ */}
              
              {/* GUIDE: mũi tên tĩnh—gắn dưới transient & node */}
              {renderGuideArrows()}

              {cyclePhases.map((phase, index) => {
                const nIndex = (index + 1) % cyclePhases.length;
                const { thetaStart, thetaEnd } = trimAngles(index, nIndex);

                const isActive  = activePhase  === cyclePhases[index].id;
                const isPreview = previewPhase === cyclePhases[index].id;

                const persistedBase = isPhase1Completed && trailIndex >= 1 && index <= trailIndex - 1;
                const persisted = (isBackwardStep && index === removingArcIdx) ? false : persistedBase;

                const phaseColor = PHASE_COLORS[phase.id] || "#10b981";
                const dArc = buildArcD(thetaStart, thetaEnd, radius, 1);
                const endX = centerX + radius * Math.cos(thetaEnd);
                const endY = centerY + radius * Math.sin(thetaEnd);
                const tanDeg = (tangentAngleAtEnd(thetaEnd, radius) * 180) / Math.PI;

                const hideStaticFrom    = transitionFlow && transientConfig && index === transientConfig.fromIdx;
                const hideStaticTo      = transitionFlow && transientConfig && index === transientConfig.toIdx;
                const hideStaticCurrent = (!transitionFlow && (isActive || isPreview));
                const hideRemovingArc   = isBackwardStep && index === removingArcIdx;
                const hidePost          = (postHideIdx !== null && index === postHideIdx);

                return (
                  <g key={`arc-${phase.id}`} mask="url(#ringMask)">
                    {isPhase1Completed && (
                      <>
                        <path
                          d={dArc}
                          fill="none"
                          stroke={persisted ? phaseColor : "#d1d5db"}
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
                          opacity={hideStaticFrom || hideStaticTo || hideStaticCurrent || hideRemovingArc || hidePost ? 0 : 1}
                          className="fade-in-160"
                        >
                          <polygon
                            points={`0,0 -${HEAD_SIZE},-${HEAD_SIZE/2} -${HEAD_SIZE},${HEAD_SIZE/2}`}
                            fill={persisted ? phaseColor : "#d1d5db"}
                            opacity={persisted ? "0.75" : "0.45"}
                          />
                        </g>
                      </>
                    )}
                  </g>
                );
              })}

              {/* TRANSIENT */}
              {transitionFlow && transientConfig && (
                <g mask="url(#ringMask)">
                  <TransientPath
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

            {/* NODES + labels (z-30 để che line khi chạm) */}
            <div className="absolute inset-0 z-30">
              {cyclePhases.map((phase) => {
                const index = cyclePhases.findIndex(p => p.id === phase.id);
                const pos = getCirclePosition(index, cyclePhases.length);
                const isActive  = activePhase  === phase.id;
                const isPreview = previewPhase === phase.id;
                const willBeActiveSoon = transitionFlow && transitionFlow.to === phase.id;

                const allowActiveColor = !isBackwardRun; // ngược: không dùng isActive để tô
                const keepByTrail   = isPhase1Completed && trailIndex >= 0 && index <= trailIndex;
                const nodeHasColor  = isPhase1Completed && (
                  (keepByTrail   && phase.id !== suppressId) ||
                  (allowActiveColor && isActive && phase.id !== suppressId) ||
                  isPreview
                );

                return (
                  <div
                    key={`node-${phase.id}`}
                    className="absolute transition-all duration-300 pointer-events-none select-none"
                    style={{ left: `${pos.x}px`, top: `${pos.y}px`, transform: "translate(-50%, -50%)" }}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`relative w-14 h-14 rounded-full border-4 shadow-lg flex items-center justify-center text-xl
                                      ${getColorClasses(phase.color, nodeHasColor)}`}>
                        <span className={nodeHasColor ? "" : "grayscale opacity-40"}>{phase.icon}</span>

                        {((allowActiveColor && isActive && phase.id !== suppressId) || isPreview) && (
                          <span className={`pointer-events-none absolute inset-0 rounded-full animate-ping opacity-60
                            ${phase.color === "pink" ? "bg-pink-400" : phase.color === "lime" ? "bg-lime-400" : phase.color === "amber" ? "bg-amber-400" : "bg-teal-400"}`} />
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

/** Transient PATH — useLayoutEffect để không có frame “tải trước”
 *  mode="grow"  : vẽ tiến (có mũi)
 *  mode="shrink": rút lùi (không mũi)
 */
function TransientPath({ d, color, duration = 950, headSize = 10, headPad = 8, mode = "grow", headVisible = true }) {
  const pathRef = useRef(null);
  const headRef = useRef(null);
  const rafRef  = useRef(null);

  useLayoutEffect(() => {
    const path = pathRef.current;
    const head = headRef.current;
    if (!path) return;

    const total = path.getTotalLength();
    path.style.strokeDasharray  = `${total}`;
    path.style.willChange = "stroke-dashoffset";

    // Set dashoffset NGAY TRƯỚC paint đầu tiên
    if (mode === "grow") path.style.strokeDashoffset = `${total}`;
    else                 path.style.strokeDashoffset = `0`;

    let start = null;
    let stopped = false;

    const step = (ts) => {
      if (stopped) return;
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / duration);

      if (mode === "grow") {
        const usable = Math.max(0, total - headPad);
        const shown  = usable * t;
        path.style.strokeDashoffset = `${total - shown}`;

        if (headVisible && head) {
          const pLen  = Math.min(total - headPad, shown);
          const p     = path.getPointAtLength(pLen);
          const prev  = path.getPointAtLength(Math.max(0, pLen - 1));
          const angle = Math.atan2(p.y - prev.y, p.x - prev.x) * (180 / Math.PI);
          head.setAttribute("transform", `translate(${p.x}, ${p.y}) rotate(${angle})`);
        }
      } else {
        // shrink: offset tăng 0→total
        const off = total * t;
        path.style.strokeDashoffset = `${off}`;
      }

      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // stop flag
      // eslint-disable-next-line no-unused-expressions
      (stopped = true);
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
        strokeLinecap="butt"   // quan trọng: không “lòi” khi rút
        strokeLinejoin="round"
        opacity="0.98"
        style={{ vectorEffect:"non-scaling-stroke" }}
      />
      {headVisible && (
        <g ref={headRef}>
          <polygon points={`0,0 -${headSize},-${headSize/2} -${headSize},${headSize/2}`} fill={color} opacity="0.98" />
        </g>
      )}
    </g>
  );
}

/** Confirm Modal */
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

/** Dropdown */
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
                  onClick={() => { setOpen(false); onPickPhase(it.id); }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl border transition-all flex items-center gap-2.5
                    ${activePhase === it.id ? "bg-emerald-50 border-emerald-300 shadow-sm" : "bg-white hover:bg-blue-50 border-gray-200 hover:shadow-md"}`}
                >
                  <span className="text-[18px] leading-none">{it.icon}</span>
                  <span className="font-semibold text-[12px] text-gray-900 whitespace-nowrap">{it.name}</span>
                </button>
                <div className="flex justify-center py-1 text-gray-300"><ArrowDown className="w-3.5 h-3.5" /></div>
              </div>
            ))}
            <button
              onClick={() => { setOpen(false); onStartNewCycle(); }}
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

/* ===== Utils ===== */
const wait  = (ms) => new Promise((r) => setTimeout(r, ms));
const flush = () => new Promise((rs) => requestAnimationFrame(() => requestAnimationFrame(rs)));

/** Main */
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

  const [trailIndex, setTrailIndex] = useState(-1);
  const [suppressId, setSuppressId] = useState(null);
  const [isBackwardRun, setIsBackwardRun] = useState(false);
  const [postHideIdx, setPostHideIdx] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const treeData = { id:"XC-01", type:"Xoài", variety:"Cát Chu", currentPhase:"growth_development", cycleCount:0, isPhase1Completed:false };

  const cyclePhases = ["flowering", "fruiting", "pre_harvest", "post_harvest"];
  const isCyclePhase = (p) => cyclePhases.includes(p);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPhase, setPendingPhase] = useState(null);
  const [confirmText, setConfirmText] = useState({ title: "", message: "", highlight: "" });

  const labelOf = (id) => ({
    growth_development:"Sinh trưởng & Phát triển",
    flowering:"Ra Hoa", fruiting:"Đậu quả", pre_harvest:"Trước thu hoạch", post_harvest:"Sau thu hoạch",
  }[id] || id);

  const runSpinReset = () => { setIsSpinning(true); setTimeout(() => setIsSpinning(false), 1000); };

  const requestChangePhase = (to, cause = "pick") => {
    if (isRunning) return;
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
      let dir = (from === "post_harvest" && to === "flowering") ? +1 : (j > i ? +1 : -1);
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
    setPostHideIdx(null);

    const DUR = 1150;
    const DWELL = 200;

    const firstArc = steps.find(s => s.type === "arc");
    if (firstArc) {
      const N = cyclePhases.length;
      const iFrom = cyclePhases.indexOf(firstArc.from);
      const iTo   = cyclePhases.indexOf(firstArc.to);
      setIsBackwardRun(((iFrom + 1) % N !== iTo));
    } else {
      setIsBackwardRun(false);
    }

    for (let idx = 0; idx < steps.length; idx++) {
      const s = steps[idx];

      if (s.type === "p1") {
        setP1Transition(true); setP1Key(k => k + 1);
        await wait(950); setP1Transition(false);
        if (!isPhase1Completed) setIsPhase1Completed(true);
        setTrailIndex(0);
        setPreviewPhase("flowering"); await wait(DWELL); setPreviewPhase(null);
        continue;
      }

      const N = cyclePhases.length;
      const iFrom = cyclePhases.indexOf(s.from);
      const iTo   = cyclePhases.indexOf(s.to);
      const dir = ((iFrom + 1) % N === iTo) ? +1 : -1;

      if (dir === -1) {
        setSuppressId(s.from);
        await flush();
      }

      setTransitionFlow({ from: s.from, to: s.to });
      setTransitionKey(k => k + 1);
      await wait(DUR);

      // tắt transient & che arrowhead tĩnh 1 nhịp để không nháy
      setTransitionFlow(null);
      setPostHideIdx(dir === -1 ? iTo : iFrom);
      setTimeout(() => setPostHideIdx(null), 130);
      await flush();

      if (dir === +1) {
        setPreviewPhase(s.to); await wait(DWELL);
        setTrailIndex(iTo);
        setPreviewPhase(null);
      } else {
        // NGƯỢC: giảm trail trước → tránh node xuất phát “bật lại”
        if (idx < steps.length - 1) {
          const iToMinus1 = (iTo - 1 + N) % N;
          setTrailIndex(iToMinus1);
        } else {
          setTrailIndex(iTo);
        }
        await flush();
        setSuppressId(null);
        await wait(DWELL);
      }
    }

    if (finalTo === "flowering" && steps.find(st => st.type==="arc" && st.from==="post_harvest" && st.to==="flowering")) {
      setCycleCount(c => c + 1);
    }
    setActivePhase(finalTo);
    setPreviewPhase(null);
    setSuppressId(null);
    setIsBackwardRun(false);
    if (shouldSpin) runSpinReset();
  };

  const onConfirmModal = async () => {
    if (isRunning) return;
    const to = pendingPhase;
    if (!to) return;
    setIsRunning(true);

    // ĐÓNG MODAL NGAY rồi mới chạy animation
    setConfirmOpen(false);
    setPendingPhase(null);
    await flush();

    const from = activePhase;
    const shouldSpin =
      (from === "post_harvest" && to === "flowering") || confirmText.title === "Bắt đầu giai đoạn mới";

    const steps = buildSteps(from, to);

    if (steps.length === 0) {
      if (from === "growth_development" && to === "growth_development") {
        setActivePhase(to);
      } else if (from === "post_harvest" && to === "flowering") {
        setActivePhase(to); setTrailIndex(0); setCycleCount(c => c + 1); runSpinReset();
      } else {
        setActivePhase(to); setTrailIndex(cyclePhases.indexOf(to));
      }
    } else {
      await playSteps(steps, to, shouldSpin);
    }

    setIsRunning(false);
  };

  const handlePickPhase      = (phaseId) => requestChangePhase(phaseId, "pick");
  const handleStartNewCycle  = () => requestChangePhase("flowering", "start-new-cycle");


  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 p-4 md:p-8 pt-24 md:pt-28">
      <div className="max-w-4xl mx-auto">
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
              isBackwardRun={isBackwardRun}
              postHideIdx={postHideIdx}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => { if (!isRunning) { setConfirmOpen(false); setPendingPhase(null); } }}
        onConfirm={onConfirmModal}
        title={confirmText.title}
        message={confirmText.message}
        highlight={confirmText.highlight}
      />
    </div>
  );
}
