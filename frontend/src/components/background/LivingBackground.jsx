import React, { useMemo } from "react";
import { Leaf, Sprout, Droplets } from "lucide-react";

/**
 * LivingBackground — underlay animated background
 *
 * Renders a fixed, non‑interactive animated backdrop consisting of a
 * subtle gradient, blurred color blobs and gently floating icons. The
 * backdrop spans the entire viewport and uses negative z‑indices so
 * that your application UI can simply sit on top with a positive z‑index.
 *
 * Props:
 * - density (number): how many floating icons to render. Adjust to taste.
 * - baseColor (string): fallback background color used behind the animation.
 * - palette (string[]): array of hex colors to use for the icons. The
 *   icons cycle through this palette based on their index.
 */
export default function LivingBackground({ density = 28, baseColor = "#1F302F", palette = ["#34d399", "#7dd3fc", "#a78bfa"] }) {
  // Precompute the floating items on initial render. We memoise the
  // calculation so that rerenders don't reposition everything.
  const items = useMemo(() => {
    const IconSet = [Leaf, Sprout, Droplets];
    return Array.from({ length: density }).map((_, i) => {
      const Icon = IconSet[i % IconSet.length];
      const color = palette[i % palette.length];
      const size = Math.round(Math.random() * 16 + 14); // 14–30px
      const left = Math.round(Math.random() * 1000) / 10; // 0–100%
      const dur = Math.round(Math.random() * 18 + 18); // 18–36s
      const delay = -Math.round(Math.random() * 30); // desynchronise the start
      const swayDur = Math.round(Math.random() * 6 + 4); // 4–10s
      const swayAmp = Math.round(Math.random() * 18 + 10); // 10–28px
      const rot = Math.round(Math.random() * 60 - 30); // -30–30°
      const opacity = Math.round((Math.random() * 0.35 + 0.45) * 100) / 100; // .45–.8
      return { id: i, Icon, color, size, left, dur, delay, swayDur, swayAmp, rot, opacity };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [density, palette.join(",")]);

  return (
    <>
      {/* Solid base colour behind everything */}
      <div className="fixed inset-0 -z-50" style={{ backgroundColor: baseColor }} aria-hidden />

      {/* Gradient and coloured blobs layer */}
      <div className="fixed inset-0 -z-40 pointer-events-none" aria-hidden>
        {/* Soft gradient that slowly pans left to right */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, rgba(16,185,129,.20), rgba(14,165,233,.20), rgba(139,92,246,.20))",
            backgroundSize: "200% 200%",
            animation: "gradientX 14s ease-in-out infinite",
          }}
        />
        {/* Blurry coloured blobs */}
        <div
          className="absolute -top-20 -left-20 w-[45vw] h-[45vw] rounded-full blur-3xl bg-emerald-400/14"
          style={{ animation: "blob 22s ease-in-out infinite" }}
        />
        <div
          className="absolute top-[30vh] -right-24 w-[40vw] h-[40vw] rounded-full blur-3xl bg-sky-400/14"
          style={{ animation: "blob 20s ease-in-out infinite", animationDelay: "3s" }}
        />
        <div
          className="absolute -bottom-24 left-[20vw] w-[35vw] h-[35vw] rounded-full blur-3xl bg-violet-400/14"
          style={{ animation: "blob 26s ease-in-out infinite", animationDelay: "6s" }}
        />
        {/* Fading at top and bottom for nicer edges */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(31,48,47,0.60), transparent 20%, transparent 80%, rgba(31,48,47,0.60))",
          }}
        />
      </div>

      {/* Floating icons */}
      <div className="fixed inset-0 -z-30 pointer-events-none" aria-hidden>
        {items.map((it) => (
          <div
            key={it.id}
            className="absolute"
            style={{
              left: `${it.left}%`,
              bottom: "-10vh",
              animation: `rise ${it.dur}s linear infinite`,
              animationDelay: `${it.delay}s`,
            }}
          >
            {/* Wrapper to handle horizontal sway separately from vertical rise */}
            <div
              style={{
                animation: `sway ${it.swayDur}s ease-in-out infinite`,
                ["--amp"]: `${it.swayAmp}px`,
              }}
            >
              <it.Icon
                style={{
                  width: it.size,
                  height: it.size,
                  color: it.color,
                  opacity: it.opacity,
                  transform: `rotate(${it.rot}deg)`,
                  filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.25))",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes gradientX { 0%,100%{ background-position:0% 50%; } 50%{ background-position:100% 50%; } }
        @keyframes blob { 0%,100%{ transform: translate(0,0); } 50%{ transform: translate(40px,-30px); } }
        @keyframes rise { 0%{ transform: translate3d(0,0,0); opacity:0; } 8%{ opacity:.85; } 92%{ opacity:.85; } 100%{ transform: translate3d(0,-120vh,0); opacity:0; } }
        @keyframes sway { 0%,100%{ transform: translateX(0); } 50%{ transform: translateX(var(--amp,16px)); } }
        @media (prefers-reduced-motion: reduce) { *{ animation: none !important; } }
      `}</style>
    </>
  );
}