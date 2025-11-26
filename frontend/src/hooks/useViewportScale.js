import { useEffect, useMemo, useState } from "react";

export const DEFAULT_VIEWPORT_WIDTH = 1440;

const SCALE_RULES = [
  { max: 480, scale: 0.82 },
  { max: 640, scale: 0.86 },
  { max: 820, scale: 0.92 },
  { max: 1024, scale: 0.97 },
  { min: 1900, scale: 1.14 },
  { min: 1720, scale: 1.1 },
  { min: 1560, scale: 1.06 },
  { min: 1400, scale: 1.03 },
];

export function resolveViewportScale(width = DEFAULT_VIEWPORT_WIDTH) {
  if (!width || Number.isNaN(width)) return 1;

  for (const rule of SCALE_RULES) {
    if (typeof rule.max === "number" && width <= rule.max) {
      return rule.scale;
    }
  }

  let result = 1;
  for (const rule of SCALE_RULES) {
    if (typeof rule.min === "number" && width >= rule.min) {
      result = Math.max(result, rule.scale);
    }
  }
  return Number(result.toFixed(2));
}

export default function useViewportScale({ preferZoom = true } = {}) {
  const initialWidth =
    typeof window === "undefined" ? DEFAULT_VIEWPORT_WIDTH : window.innerWidth;
  const [width, setWidth] = useState(initialWidth);
  const [supportsZoom, setSupportsZoom] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      if (typeof document !== "undefined" && document.body?.style) {
        setSupportsZoom(
          Object.prototype.hasOwnProperty.call(document.body.style, "zoom")
        );
      }
    } catch {
      setSupportsZoom(false);
    }
  }, []);

  const scale = useMemo(() => resolveViewportScale(width), [width]);

  const wrapperStyle = useMemo(() => {
    if (preferZoom && supportsZoom) {
      return { zoom: scale, margin: "0 auto", maxWidth: "100%" };
    }
    return {
      transform: `scale(${scale})`,
      transformOrigin: "top center",
      width: scale > 1 ? `${(1 / scale) * 100}%` : "100%",
      margin: "0 auto",
      maxWidth: "100%",
    };
  }, [preferZoom, scale, supportsZoom]);

  return {
    scale,
    width,
    wrapperStyle,
    supportsZoom,
    isMobileWidth: width <= 768,
    isTabletWidth: width <= 1024,
  };
}

