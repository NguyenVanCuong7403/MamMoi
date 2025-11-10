import React, { useMemo } from "react";
import { Leaf, Sprout, Droplets } from "lucide-react";

export default function LivingBackground({ density = 28 }) {
  const items = useMemo(() => {
    const IconSet = [Leaf, Sprout, Droplets];
    const palette = ["#34d399", "#7dd3fc", "#a78bfa"];
    return Array.from({ length: density }).map((_, i) => ({
      id: i,
      Icon: IconSet[i % IconSet.length],
      color: palette[i % palette.length],
      size: Math.round(Math.random() * 16 + 14),
      left: Math.round(Math.random() * 1000) / 10,
      dur: Math.round(Math.random() * 18 + 18),
      delay: -Math.round(Math.random() * 30),
      swayDur: Math.round(Math.random() * 6 + 4),
      swayAmp: Math.round(Math.random() * 18 + 10),
      rot: Math.round(Math.random() * 60 - 30),
      opacity: Math.round((Math.random() * 0.35 + 0.45) * 100) / 100,
    }));
  }, [density]);

  const ampVar = (v) => ({ ["--amp"]: `${v}px` });

  return (
    <>
      <div className="fixed inset-0 -z-50 bg-[#1F302F]" aria-hidden />
      <div className="fixed inset-0 -z-40 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-violet-500/20"
          style={{ backgroundSize: "200% 200%", animation: "gradientX 14s ease-in-out infinite" }}
        />
        <div className="absolute -top-20 -left-20 w-[45vw] h-[45vw] rounded-full blur-3xl bg-emerald-400/14" style={{ animation: "blob 22s ease-in-out infinite" }} />
        <div className="absolute top-[30vh] -right-24 w-[40vw] h-[40vw] rounded-full blur-3xl bg-sky-400/14" style={{ animation: "blob 20s ease-in-out infinite", animationDelay: "3s" }} />
        <div className="absolute -bottom-24 left-[20vw] w-[35vw] h-[35vw] rounded-full blur-3xl bg-violet-400/14" style={{ animation: "blob 26s ease-in-out infinite", animationDelay: "6s" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(31,48,47,0.6), transparent 20%, transparent 80%, rgba(31,48,47,0.6))" }} />
      </div>

      <div className="fixed inset-0 -z-30 pointer-events-none" aria-hidden>
        {items.map((it) => (
          <div key={it.id} className="absolute" style={{ left: `${it.left}%`, bottom: "-10vh", animation: `rise ${it.dur}s linear infinite`, animationDelay: `${it.delay}s` }}>
            <div style={{ ...ampVar(it.swayAmp), animation: `sway ${it.swayDur}s ease-in-out infinite` }}>
              <it.Icon style={{ width: it.size, height: it.size, color: it.color, opacity: it.opacity, transform: `rotate(${it.rot}deg)`, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.25))" }} />
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes gradientX{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}@keyframes blob{0%,100%{transform:translate(0,0)}50%{transform:translate(40px,-30px)}}@keyframes rise{0%{transform:translate3d(0,0,0);opacity:0}8%{opacity:.85}92%{opacity:.85}100%{transform:translate3d(0,-120vh,0);opacity:0}}@keyframes sway{0%,100%{transform:translateX(0)}50%{transform:translateX(var(--amp,16px))}}@media (prefers-reduced-motion: reduce){*{animation:none!important}}`}</style>
    </>
  );
}
