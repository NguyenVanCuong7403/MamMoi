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

    // Reset basic styles
    path.style.willChange = "stroke-dasharray";
    path.style.strokeDashoffset = "0";

    let start = null,
      stop = false;

    const step = (ts) => {
      if (stop) return;
      if (start === null) start = ts;
      const progress = Math.min(1, (ts - start) / duration);

      // Calculate effective t based on mode
      // grow: 0 -> 1
      // shrink: 1 -> 0 (effectively, but we manage 'shown' length directly)

      const usable = Math.max(0, total - headPad);
      let shown = 0;

      if (mode === "grow") {
        shown = usable * progress;
      } else {
        // shrink: starts full, goes to 0
        shown = usable * (1 - progress);
      }

      // Update Path Visibility
      // We use dasharray to define "visible part" + "gap"
      // "shown total" means: <shown>px dash, <total>px gap.
      // This ensures the line always starts at distance 0 and ends at <shown>.
      path.style.strokeDasharray = `${shown} ${total}`;

      // Update Head Position
      if (headVisible && head) {
        // Clamp pLen to avoid errors or negative index
        const pLen = Math.max(0, Math.min(total, shown));

        // For accurate tangible rotation, we need a small delta.
        // If pLen is very small (near 0), finding tangent might be unstable, 
        // but generally okay for this visual.
        const p = path.getPointAtLength(pLen);

        // Look back a tiny bit to get tangent angle
        // In shrink mode, as we retreat, the head points 'forward' relative to the path
        // OR should it point backwards? 
        // Usually "retract" means the line is being sucked back. 
        // If the arrow head represents the "tip" of the growing/shrinking vine:
        // - Grow: Tip points forward.
        // - Shrink: Tip still points likely "forward" (away from root) but moves backward?
        // Let's assume the head is attached to the tip, pointing in the direction of the path flow.
        const prev = path.getPointAtLength(Math.max(0, pLen - 1));

        const angle = Math.atan2(p.y - prev.y, p.x - prev.x) * (180 / Math.PI);

        if (!isNaN(angle)) {
          head.setAttribute(
            "transform",
            `translate(${p.x}, ${p.y}) rotate(${angle})`
          );
          // Ensure head opacity fades out at very end of shrink if needed, 
          // or just stays visible until component unmounts.
          // The component unmounts after animation usually? 
          // The calling code handles standard wait time.
          // We can fade opacity if shown < 1 maybe?
          head.style.opacity = shown < 0.5 ? 0 : 0.98;
        }
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
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
            points={`0,0 -${headSize},-${headSize / 2} -${headSize},${headSize / 2
              }`}
            fill={color}
            opacity="0.98"
          />
        </g>
      )}
    </g>
  );
}

