import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import LivingBackground from "./LivingBackground";

/**
 * BackgroundPortal
 *
 * Wraps the `LivingBackground` component in a React Portal so that it
 * attaches directly to the document body. This helps to keep the
 * backdrop outside of your application’s stacking context and avoids
 * unintended z-index conflicts. The portal is only rendered when
 * `enabled` is true.
 *
 * Props:
 * - enabled (boolean): when false, nothing will be rendered.
 * - density (number): passed through to LivingBackground.
 * - baseColor (string): passed through to LivingBackground.
 * - palette (string[]): passed through to LivingBackground.
 */
export default function BackgroundPortal({ enabled = true, density = 28, baseColor = "#1F302F", palette }) {
  // On mount, determine if we can render portals (client only).
  const [canPortal, setCanPortal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setCanPortal(true);
  }, []);

  if (!enabled || !canPortal) return null;

  return createPortal(
    <LivingBackground density={density} baseColor={baseColor} palette={palette} />,
    document.body
  );
}