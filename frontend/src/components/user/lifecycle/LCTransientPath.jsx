import React, { useRef, useLayoutEffect } from "react";

/**
 * LCTransientPath Component
 * Animated path with optional arrow head for lifecycle transitions
 */
export default function LCTransientPath({
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

