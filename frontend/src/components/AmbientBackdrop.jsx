import React from "react";

/** Nền động cho toàn bộ app: aurora + vignette + noise (JSX) */
export default function AmbientBackdrop() {
  return (
    <>
      <style>{`
  @keyframes mm-aurora-pan {
    0%   { transform: translateY(-2%) translateX(0);   filter: saturate(115%); }
    100% { transform: translateY( 2%) translateX(1%);  filter: saturate(130%); }
  }

  .mm-aurora{
    position:absolute;inset:-10%;
    background:
      radial-gradient(680px 360px at 14% 8%,   rgba(16,185,129,.18),  transparent 60%),
      radial-gradient(760px 340px at 86% 10%,  rgba(56,189,248,.16),  transparent 60%),
      radial-gradient(980px 480px at 50% 118%, rgba(250,204,21,.12),  transparent 66%),
      radial-gradient(540px 300px at 0% 82%,   rgba(16,185,129,.14),  transparent 62%),
      radial-gradient(560px 300px at 100% 84%, rgba(56,189,248,.14),  transparent 62%);
    animation: mm-aurora-pan 28s ease-in-out infinite alternate;
    pointer-events:none;
  }

  .mm-aurora:after{
    content:"";position:absolute;inset:0;pointer-events:none;
    background:
      linear-gradient(90deg, rgba(255,255,255,.05), transparent 40%, transparent 60%, rgba(255,255,255,.05)),
      linear-gradient(rgba(255,255,255,.04), transparent 60%);
    mask-image: radial-gradient(closest-side, rgba(255,255,255,.6), transparent);
  }

  .mm-grid:before{
    content:"";position:absolute;inset:0;pointer-events:none;
    background-image:
      linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
    background-size:28px 28px;background-position:center;
    mask-image: radial-gradient(closest-side, rgba(255,255,255,.45), transparent);
    opacity:.16;
  }

  .mm-frame{position:absolute;inset:0;pointer-events:none}
  .mm-frame:before,.mm-frame:after{
    content:"";position:absolute;top:0;bottom:0;width:min(30vw, 440px)
  }
  .mm-frame:before{
    left:0;
    background:linear-gradient(to right, rgba(0,0,0,.34), rgba(31,48,47,0) 62%);
  }
  .mm-frame:after{
    right:0;
    background:linear-gradient(to left,  rgba(0,0,0,.34), rgba(31,48,47,0) 62%);
  }

  .mm-corners{
    position:absolute;inset:0;pointer-events:none;
    background:
      radial-gradient(600px 420px at -8% -8%, rgba(0,0,0,.28), transparent 60%),
      radial-gradient(600px 420px at 108% -8%, rgba(0,0,0,.28), transparent 60%),
      radial-gradient(520px 360px at 0% 100%, rgba(0,0,0,.20), transparent 60%),
      radial-gradient(520px 360px at 100% 100%, rgba(0,0,0,.20), transparent 60%);
  }

  .mm-topshine{
    position:absolute;left:0;right:0;top:0;height:14vh;pointer-events:none;
    background:linear-gradient(to bottom, rgba(255,255,255,.06), rgba(255,255,255,0));
    mix-blend-mode:soft-light;
  }

  .mm-bottom{
    position:absolute;left:0;right:0;bottom:0;height:30vh;pointer-events:none;
    background:linear-gradient(to top, rgba(9,16,16,.78), rgba(31,48,47,0) 68%);
  }

  .mm-noise{
    position:absolute;inset:0;pointer-events:none;opacity:.05;
    background-image: radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px);
    background-size:2px 2px;mix-blend-mode:overlay;
  }
      `}</style>

      {/* Lớp nền toàn cục */}
      <div className="fixed inset-0 -z-20" aria-hidden>
        {/* Base color (#1F302F) */}
        <div className="absolute inset-0" style={{ backgroundColor: "#1F302F" }} />
        {/* Hiệu ứng */}
        <div className="mm-aurora" />
        <div className="mm-grid absolute inset-0" />
        <div className="mm-frame" />
        <div className="mm-corners" />
        <div className="mm-topshine" />
        <div className="mm-bottom" />
        <div className="mm-noise" />
      </div>
    </>
  );
}
