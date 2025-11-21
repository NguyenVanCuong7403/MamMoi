import React, { useEffect, useMemo, useRef, useState } from "react";
import { Play, VolumeX } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";

/**
 * Mam Moi — Home (Page Only, no header) [JavaScript version]
 * - Hero video, intro, teaser, map, news, cookie banner
 * - Vietnamese content & smooth scroll preserved
 */

// Hero media config (JS version)
const HERO_MEDIA = {
  type: "video",
  srcs: [
    "https://res.cloudinary.com/ddrxkqez3/video/upload/v1762431369/Advancing_Sustainable_Agriculture___Bayer_srcu15.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "https://v0.coverr.co/s3/mp4/coverr-traveling-through-the-forest-9719-1080p.mp4",
    "https://v0.coverr.co/s3/mp4/coverr-sun-shining-through-the-forest-1210-1080p.mp4",
    "sandbox:/mnt/data/Advancing Sustainable Agriculture _ Bayer.mp4",
    "sandbox:/mnt/data/Nông_Dân_Chăm_Sóc_Vườn_Ăn_Quả.mp4",
  ],
  poster:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2000&auto=format&fit=crop",
  image:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2000&auto=format&fit=crop",
};

// Slogan in Hero — PNG (JS version)
const HERO_SLOGAN = {
  useImage: true,
  altText: "Mầm Mới – Trợ lý thông minh của nhà nông Việt Nam",
  src: "sandbox:/mnt/data/mammoi_sologan.png",
  sizes: "(max-width: 3434px) 100vw, 3434px",
};

// Vietnamese hero strings
const HERO_TITLE = "Mầm Mới".normalize("NFC");
const HERO_TOPLINE = "Hệ thống quản lý & chăm sóc cây ăn quả".normalize("NFC");
const HERO_TAGLINE = "Đồng hành cùng nhà vườn Việt Nam".normalize("NFC");

// Rotating copy for the intro-split section (VI)
const ROTATE_PARTS = ["theo mùa", "chuẩn hóa", "thực tiễn", "bền vững"];

/* =========================================================================
   TYPE-&-ERASE Rotator (thay cho reveal cũ) — KHÔNG blur
   - Giữ nguyên API <Rotator items=[] className="" />
   - Gõ tới hết chữ → tạm dừng → xoá dần → chuyển từ tiếp theo
   - Tự tắt animation nếu người dùng bật “reduce motion”
   ========================================================================= */
   function Rotator({
    items,
    className = "",
    typeSpeed = 60,        // ms / ký tự khi gõ
    eraseSpeed = 42,       // ms / ký tự khi xoá
    holdAfterType = 900,   // chờ sau khi gõ xong
    holdAfterErase = 420,  // chờ sau khi xoá sạch
    startDelay = 250,      // trễ nhỏ trước vòng đầu
  }) {
    const [i, setI] = useState(0);            // chỉ mục cụm từ
    const [txt, setTxt] = useState("");       // chuỗi đang hiển thị
    const [phase, setPhase] = useState("delay"); // delay -> typing -> holdTyped -> erasing -> holdErased
    const [reduced, setReduced] = useState(false);
  
    // Tôn trọng prefers-reduced-motion
    useEffect(() => {
      if (typeof window === "undefined") return;
      const q = window.matchMedia?.("(prefers-reduced-motion: reduce)");
      setReduced(!!q?.matches);
      const onChange = () => setReduced(!!q?.matches);
      q?.addEventListener?.("change", onChange);
      return () => q?.removeEventListener?.("change", onChange);
    }, []);
  
    useEffect(() => {
      if (!items?.length) return;
      if (reduced) { setTxt(items[0]); return; }
  
      const target = items[i] ?? "";
      let t;
  
      switch (phase) {
        case "delay":
          t = setTimeout(() => setPhase("typing"), startDelay);
          break;
  
        case "typing":
          if (txt.length < target.length) {
            t = setTimeout(() => setTxt(target.slice(0, txt.length + 1)), typeSpeed);
          } else {
            t = setTimeout(() => setPhase("holdTyped"), holdAfterType);
          }
          break;
  
        case "holdTyped":
          // vừa gõ xong, sau khoảng holdAfterType mới bắt đầu xoá
          setPhase("erasing");
          break;
  
        case "erasing":
          if (txt.length > 0) {
            t = setTimeout(() => setTxt(target.slice(0, txt.length - 1)), eraseSpeed);
          } else {
            setPhase("holdErased");
          }
          break;
  
        case "holdErased":
          // vừa xoá sạch, chờ một lúc rồi chuyển sang cụm từ kế tiếp
          t = setTimeout(() => {
            setI((i + 1) % items.length);
            setPhase("typing");
          }, holdAfterErase);
          break;
  
        default:
          setPhase("typing");
      }
  
      return () => clearTimeout(t);
    }, [
      items, i, txt, phase,
      typeSpeed, eraseSpeed,
      holdAfterType, holdAfterErase, startDelay,
      reduced
    ]);
  
    // Không render caret/kẻ dọc nữa
    return (
      <span className={className} aria-live="polite" data-testid="rotating-text">
        {txt}
      </span>
    );
  }

function SafeImage({ srcs, alt = "", className = "", testId }) {
  const list = useMemo(() => {
    const arr = Array.isArray(srcs) ? srcs : [srcs];
    return [
      ...arr,
      "https://picsum.photos/seed/fallback-1/1200/900",
      "https://placehold.co/1200x900/png?text=Image",
    ];
  }, [srcs]);

  const [i, setI] = useState(0);
  const onErr = () => setI((prev) => (prev + 1 < list.length ? prev + 1 : prev));

  return (
    <img
      src={list[i]}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={onErr}
      data-testid={testId}
    />
  );
}

/* Optional helper nếu bạn vẫn dùng đâu đó (đã bỏ blur) */
function Reveal({ children, delay = 0, as = "span", className = "" }) {
  const Comp = as;
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.65 });

  return (
    <Comp ref={ref} className={"relative inline-block overflow-hidden align-top " + className}>
      <motion.span
        initial={{ clipPath: "inset(0 100% 0 0)", y: "0.35em" }}
        animate={inView ? { clipPath: "inset(0 0% 0 0)", y: "0em" } : {}}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
        style={{ display: "inline-block", willChange: "clip-path, transform" }}
      >
        {children}
      </motion.span>
    </Comp>
  );
}

// --- Page component ---------------------------------------------------------
export default function Home() {
  const [cookieAccepted, setCookieAccepted] = useState(false);
  const videoRef = useRef(null);
  const videoSources = useMemo(() => HERO_MEDIA.srcs, []);
  const [vidIdx, setVidIdx] = useState(0);
  const [sloganImgError, setSloganImgError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeroText, setShowHeroText] = useState(true);

  const handleHeroToggle = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (showHeroText) {
      try {
        v.currentTime = 0;
        v.muted = false;
        setIsMuted(false);
        await v.play();
      } catch (_) {}
      setShowHeroText(false);
    } else {
      v.muted = true;
      setIsMuted(true);
      setShowHeroText(true);
    }
  };

  // Autoplay hero video
  useEffect(() => {
    if (HERO_MEDIA.type !== "video") return;
    const v = videoRef.current;
    if (!v) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      v.pause();
      return;
    }
    (async () => {
      try {
        await v.play();
      } catch (_) {}
    })();
  }, []);

  // Scroll effects (parallax only)
  const { scrollY } = useScroll();
  const videoScale = useTransform(scrollY, [0, 400], [1.08, 1]);
  const titleY = useTransform(scrollY, [0, 300], [0, -40]);

  // --- Smoke tests (runtime) ------------------------------------------------
  useEffect(() => {
    console.groupCollapsed("%cSMOKE TESTS", "color:#0a0");
    try {
      console.assert(["video", "image"].includes(HERO_MEDIA.type), 'HERO_MEDIA.type must be "video" or "image"');
      console.assert(!!document.querySelector('[data-testid="hero"]'), "Hero section should exist");
      console.assert(!!document.querySelector("main#main"), 'Main element with id="main" should exist for skip link');
      console.assert(!!document.querySelector('[data-testid="intro-split"]'), "Intro split section should exist");
      console.assert(!!document.querySelector('[data-testid="rotating-text"]'), "Rotating text should exist");
      console.assert(!!document.querySelector('[data-testid="territory-teaser"]'), "Territory teaser section should exist");
      console.assert(!!document.querySelector('[data-testid="map-section"]'), "Map section should exist");
      console.assert(!!document.querySelector('[data-testid="strapline"]'), "Strapline should exist");
      console.assert(!!document.querySelector('[data-testid="colloque-card"]'), "Colloque card should exist");
      console.assert(!!document.querySelector('[data-testid="intro-img-1"]'), "Intro image 1 should exist");
      console.assert(!!document.querySelector('[data-testid="intro-img-2"]'), "Intro image 2 should exist");
      console.assert(!!document.querySelector('[data-testid="news-overlay"]'), "News overlay grid should exist");
      console.assert(!!document.querySelector('[data-testid="mute-toggle"]'), "Toggle button should exist");
      console.assert(!!document.querySelector('[data-testid="hero-text"]'), "Hero text block should be visible initially");
    } finally {
      console.groupEnd();
    }
  }, []);

    return (
     <div className="mm-fluid-page min-h-screen bg-[#FBFFDF] text-[#333] font-sans selection:bg-[#FFFFA5] selection:text-[#1F302F]">
      {/* Tokens */}
      <style>{`
        /* --- IMPORTANT: @import MUST be first in the stylesheet or the browser ignores it --- */
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;800;900&display=swap&subset=vietnamese');

        :root{ --color-bg:#1F302F; --color-ivory:#FBFFDF; --color-leaf:#D1DFB6; --color-accent:#FFFFA5; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

        .font-hero{font-family:'Be Vietnam Pro',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,'Noto Sans','Apple Color Emoji','Segoe UI Emoji';}
        .font-display{font-family:'Be Vietnam Pro',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,'Noto Sans','Apple Color Emoji','Segoe UI Emoji';-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-kerning:normal;letter-spacing:-0.01em;}

        html{scroll-behavior:smooth;scroll-padding-top:64px;}
        body{overscroll-behavior-y:none;scrollbar-gutter:stable both-edges;}
        @supports (-webkit-overflow-scrolling: touch){ body{-webkit-overflow-scrolling:touch;} }
        .cv-auto{content-visibility:auto;contain-intrinsic-size:1px 1000px;}

        /* Caret nháy (dùng currentColor để khớp màu chữ) */
        @keyframes mmCaret { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }
        .mm-typer-caret{
          display:inline-block;
          width:.065em;            /* mảnh, đẹp với chữ lớn */
          height:1em;
          background: currentColor;
          margin-left:.08em;
          vertical-align:-.08em;   /* canh baseline */
          border-radius:1px;
          animation:mmCaret .9s steps(1,end) infinite;
        }
      `}</style>

      {/* Hero */}
      <section aria-label="Hero" className="relative isolate" data-testid="hero">
        <div className="relative h-[100svh] min-h-[520px] w-full overflow-hidden">
          {HERO_MEDIA.type === "video" ? (
            <motion.video
              ref={videoRef}
              style={{ scale: videoScale }}
              className="absolute inset-0 h-full w-full object-cover pointer-events-none transform-gpu will-change-transform"
              playsInline
              muted={isMuted}
              loop
              autoPlay
              preload="auto"
              crossOrigin="anonymous"
              src={encodeURI(videoSources[vidIdx])}
              onError={() => {
                console.warn('[hero] video onError, source failed:', videoSources[vidIdx]);
                setVidIdx((i) => (videoSources.length ? (i + 1) % videoSources.length : i));
              }}
              onStalled={() => {
                console.warn('[hero] video stalled, trying next source');
                setVidIdx((i) => (videoSources.length ? (i + 1) % videoSources.length : i));
              }}
              onLoadedData={async () => { try { await videoRef.current?.play(); } catch (_) {} }}
              onCanPlay={async () => { try { await videoRef.current?.play(); } catch (_) {} }}
              data-testid="hero-media"
            />
          ) : (
            <motion.img style={{ scale: videoScale }} src={HERO_MEDIA.image} alt="" className="absolute inset-0 h-full w-full object-cover" data-testid="hero-media" />
          )}
          <div className="absolute inset-0 bg-black/30" />

          {/* Title block (left aligned) */}
          <div className="relative z-10 w-full px-4 md:px-[90px] h-full flex items-center pt-[6vh] md:pt-[10vh]">
            {showHeroText && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-[#FFFFA5]"
                style={{ y: titleY }}
                data-testid="hero-text"
              >
                {HERO_SLOGAN.useImage && !sloganImgError ? (
                  <>
                    <img
                      src={encodeURI(HERO_SLOGAN.src)}
                      sizes={HERO_SLOGAN.sizes}
                      alt=""
                      decoding="async"
                      fetchPriority="high"
                      data-delay="0"
                      data-animation="fade-in"
                      className="img-with-animation skip-lazy animated-in block pointer-events-none select-none drop-shadow-[0_10px_36px_rgba(0,0,0,0.35)] w-[min(90vw,1040px)] md:w-[min(55vw,1020px)] max-w-none"
                      onError={() => { console.warn('[hero] PNG failed, falling back to text'); setSloganImgError(true); }}
                    />
                    <span className="sr-only">{HERO_SLOGAN.altText}</span>
                  </>
                ) : (
                  <div aria-label={HERO_SLOGAN.altText} lang="vi" className="text-[#FBFFDF]">
                    <p className="font-hero text-[clamp(16px,2.6vw,32px)] font-semibold opacity-95 mb-3 md:mb-4">{HERO_TOPLINE}</p>
                    <h1 className="font-display font-extrabold leading-[1.06] tracking-[-0.01em] drop-shadow-[0_10px_36px_rgba(0,0,0,0.35)] text-[clamp(72px,11.5vw,172px)] antialiased">{HERO_TITLE}</h1>
                    <p className="font-hero text-[clamp(16px,2.6vw,32px)] font-semibold mt-3 md:mt-4">{HERO_TAGLINE}</p>
                    <span className="sr-only">{HERO_SLOGAN.altText}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Play toggle button */}
            <button
              onClick={handleHeroToggle}
              className="absolute bottom-6 left-6 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full grid place-items-center bg-[#FFFFA5] text-[#1F302F] shadow-lg hover:scale-105 transition"
              aria-label={showHeroText ? "Phát lại từ đầu (có tiếng)" : "Tắt tiếng & hiện chữ"}
              title={showHeroText ? "Phát lại từ đầu (có tiếng)" : "Tắt tiếng & hiện chữ"}
              data-testid="mute-toggle"
            >
              {showHeroText ? <Play className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </section>

      {/* Strapline */}
      <section data-testid="strapline" className="cv-auto bg-[#1F302F] text-[#D1DFB6] py-6">
        <div className="mm-fluid-shell mx-auto max-w-[1650px] px-4 md:px-[90px]">
          <p className="mm-fluid-text text-center text-[clamp(16px,2.1vw,22px)] opacity-90">Chuẩn hóa quy trình – nắm bắt mùa vụ – tăng năng suất bền vững.</p>
        </div>
      </section>

      {/* Colloque / Event card */}
      <section data-testid="colloque-card" className="cv-auto bg-[#1F302F] py-12 md:py-20">
        <div className="mm-fluid-shell mx-auto max-w-[1150px] px-4">
          <div className="rounded-[18px] md:rounded-[20px] bg-[#D1DFB6] ring-1 ring-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.25)] p-6 md:p-8 md:min-h-[420px] flex flex-col md:flex-row gap-8 md:gap-10 items-center">
            <div className="md:w-[46%]"><img src="https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=1600&auto=format&fit=crop" alt="Sự kiện Mầm Mới" className="w-full h-[280px] md:h-[420px] object-cover rounded-[18px]" /></div>
            <div className="md:w-[54%] flex flex-col">
              <h3 className="text-[clamp(26px,3vw,38px)] leading-snug text-[#1F302F] font-semibold">Hội thảo Mầm Mới 2025: Số hóa vườn cây ăn quả</h3>
              <p className="mm-fluid-text mt-3 text-[15px] md:text-[16px] text-[#1F302F]/85">Kết nối chuyên gia – hợp tác xã – nhà vườn để bàn về chuẩn quy trình chăm sóc, cảnh báo thời tiết và quản lý vườn bằng dữ liệu. Cùng định hình một cách làm nông bền vững, hiệu quả hơn.</p>
              <div className="mt-5"><a href="#register" className="inline-flex items-center rounded-full bg-[#FFFFA5] text-[#1F302F] px-4 py-2 text-sm font-medium shadow hover:shadow-md transition">Xem chi tiết</a></div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro split */}
      <section id="intro" data-testid="intro-split" className="cv-auto bg-[#1F302F] text-[#FBFFDF] py-16 md:py-24">
        <div className="mm-fluid-shell mx-auto max-w-[1650px] px-4 md:px-[90px]">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-[clamp(28px,3.2vw,42.5px)] leading-[1.15] font-medium">
                <span className="opacity-90">Chăm cây </span>
                {/* ĐÃ ĐỔI: Rotator giờ là gõ/chạy/xoá */}
                <span className="font-semibold">
                  <Rotator items={ROTATE_PARTS} />
                </span>
                <br/>
                <span className="opacity-90">đúng việc, đúng lúc – đó là tinh thần của Mầm Mới.</span>
              </h2>
              <a href="#about" className="inline-block mt-8 rounded-full bg-[#FFFFA5] text-[#1F302F] px-5 py-3 font-medium shadow hover:shadow-md transition">Tìm hiểu thêm</a>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="rounded-[18px] overflow-hidden aspect-[4/3] md:aspect-[5/4] ring-1 ring-black/10 shadow-lg">
                <SafeImage
                  srcs={[
                    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
                    "https://images.unsplash.com/photo-1544717301-9cdcb1f5941c?auto=format&fit=crop&w=1600&q=80",
                    "https://picsum.photos/seed/industrie/1200/900"
                  ]}
                  alt="Nhà vườn & sơ chế"
                  className="w-full h-full object-cover"
                  testId="intro-img-1"
                />
              </div>
              <div className="rounded-[18px] overflow-hidden aspect-[4/3] md:aspect-[5/4] ring-1 ring-black/10 shadow-lg">
                <SafeImage
                  srcs={[
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
                    "https://images.unsplash.com/photo-1613162444453-48d59c7e0c63?auto=format&fit=crop&w=1600&q=80",
                    "https://picsum.photos/seed/foret/1200/900"
                  ]}
                  alt="Vườn cây ăn quả"
                  className="w-full h-full object-cover"
                  testId="intro-img-2"
                />
              </div>
            </div>
          </div>
          <p className="mm-fluid-text mt-10 text-[12.5px] md:text-[13.5px] text-[#D1DFB6]/80 md:text-right md:max-w-3xl md:ml-auto">
            Tại đây, quy trình chăm sóc được chuẩn hóa, việc mùa nào làm việc nấy; dữ liệu tăng trưởng, lịch tưới – bón – tỉa – phòng bệnh đều được ghi chép rõ ràng để nâng năng suất một cách bền vững.
          </p>
        </div>
      </section>

      {/* Territory teaser */}
      <section id="territory-teaser" data-testid="territory-teaser" className="cv-auto bg-[#FBFFDF]">
        <div className="mm-fluid-shell mx-auto max-w-[1650px] px-4 md:px-[90px] py-16 md:py-24 relative">
          <div aria-hidden className="pointer-events-none absolute -bottom-28 right-[12%] w-[520px] h-[520px] rounded-full bg-[#EEF3CC] z-0" />
          <div className="relative grid md:grid-cols-2 gap-10 items-end">
            <div className="relative order-2 md:order-1 z-10">
              <div className="relative md:-mt-20 md:-ml-[6%] w-[min(92vw,880px)] md:w-[760px] aspect-square rounded-full overflow-hidden bg-[#EDEFCF] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                <SafeImage
                  srcs={[
                    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=2000&auto=format&fit=crop",
                    "https://picsum.photos/seed/silo/1600/1600"
                  ]}
                  alt="Silhouette cơ sở sơ chế"
                  className="w-full h-full object-cover"
                  testId="teaser-img-circle"
                />
              </div>
              <div className="absolute md:-bottom-6 md:right-[14%] -bottom-5 right-[18%] w-16 h-16 rounded-full bg-[#D1DFB6] z-20" />
            </div>
            <div className="order-1 md:order-2 z-20 flex md:justify-end">
              <div className="rounded-[28px] overflow-hidden shadow-lg ring-1 ring-black/5 w-[min(86vw,760px)] h-[min(60vh,520px)] md:translate-y-6">
                <SafeImage
                  srcs={[
                    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2000&auto=format&fit=crop",
                    "https://picsum.photos/seed/forestperson/1800/1200"
                  ]}
                  alt="Người làm vườn trong rừng cây"
                  className="w-full h-full object-cover"
                  testId="teaser-img-rect"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Territory map */}
      <section id="territory-map" data-testid="map-section" className="cv-auto bg-[#EEF3CC]">
        <div className="mm-fluid-shell mx-auto max-w-[1650px] px-4 md:px-[90px] py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-[clamp(32px,3.6vw,56px)] leading-tight text-[#243833] font-medium">Bản đồ canh tác & thời tiết địa phương</h2>
            <p className="mm-fluid-text mt-6 text-[#243833]/80 max-w-2xl">Theo dõi khu vườn của bạn trên một nền tảng thống nhất: cây nào, trồng khi nào, đang ở giai đoạn nào – tất cả đều rõ ràng.</p>
            <p className="mm-fluid-text mt-4 text-[#243833]/80 max-w-2xl">Kết hợp dữ liệu thời tiết để nhắc điều chỉnh tưới tiêu, che phủ, cắt tỉa và phòng bệnh trước những đợt mưa lớn hay nắng gắt.</p>
            <p className="mm-fluid-text mt-4 text-[#243833]/80 max-w-2xl">Bức tranh tổng thể giúp bạn ra quyết định nhanh, chính xác – từ hộ gia đình đến trang trại quy mô.</p>
          </div>
          <div className="relative">
            <div className="rounded-[28px] overflow-hidden bg-[#F4F7DF] ring-1 ring-black/5">
              <SafeImage
                srcs={["https://sgp1.digitaloceanspaces.com/e-magazine.asiamedia.vn/wp-content/uploads/2023/07/09195001/46-768x938.jpg"]}
                alt="Bản đồ canh tác & thời tiết"
                className="w-full h-[420px] md:h-[520px] object-cover"
                testId="map-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main id="main">
        {/* News */}
        <section id="news" className="cv-auto bg-[#D1DFB6]">
          <div className="mm-fluid-shell mx-auto max-w-[1280px] px-4 md:px-[90px] py-14 md:py-20">
            <h2 className="text-center text-[clamp(34px,3.6vw,48px)] leading-tight font-semibold text-[#1F302F]">
              Tin mới
            </h2>

            {/* Overlay news cards (2 tall images) */}
            <div className="mt-10 grid md:grid-cols-2 gap-8 md:gap-10 place-items-center" data-testid="news-overlay">
              {[
                {
                  title: "Quy trình chăm sóc chuẩn – từ giống đến thu hoạch",
                  body:
                    "Làm đúng ngay từ đầu: lịch tưới – bón – tỉa – che phủ, kiểm soát sâu bệnh theo mùa để cây khỏe, trái ngọt.",
                  image:
                    "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=1600&auto=format&fit=crop",
                  fallback: "https://picsum.photos/seed/bleuet/1200/1600",
                  href: "#news-a",
                },
                {
                  title: "Quản vườn bằng dữ liệu – quyết định nhanh & chính xác",
                  body:
                    "Theo dõi tăng trưởng, sức khỏe, chi phí và năng suất theo từng cây; nhìn rõ để tối ưu công việc mỗi ngày.",
                  image:
                    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=1600&auto=format&fit=crop",
                  fallback: "https://picsum.photos/seed/silo/1200/1600",
                  href: "#news-b",
                },
              ].map((n) => (
                <a
                  key={n.title}
                  href={n.href}
                  className="group relative w-full max-w-[620px] aspect-[3/4] overflow-hidden rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-white/40"
                >
                  <img
                    src={n.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform scale-105 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-black/10" />
                  <div className="relative z-10 h-full p-6 md:p-8 flex flex-col justify-end text-white">
                    <h3 className="text-[clamp(22px,2.3vw,30px)] leading-snug font-semibold drop-shadow-md">{n.title}</h3>
                    <p className="mm-fluid-text mt-4 text-[14.5px] md:text-[16px] opacity-95 drop-shadow max-w-[92%]">{n.body}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Cookie banner */}
      {!cookieAccepted && (
        <div className="fixed bottom-3 left-3 right-3 md:left-auto md:right-6 z-[90] max-w-2xl bg-[#E6E7E0] text-[#333] rounded-xl shadow-lg p-4 md:p-5">
          <div className="text-sm">
            Trang này sử dụng cookie để cải thiện trải nghiệm của bạn. Tiếp tục sử dụng đồng nghĩa với việc bạn đồng ý với chính sách của chúng tôi.
            <a href="#cookies" className="underline underline-offset-2 ml-1">Tìm hiểu thêm</a>
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <button onClick={() => setCookieAccepted(true)} className="rounded-lg bg-[#1F302F] text-[#E6E7E0] px-4 py-2 text-sm font-medium">Đồng ý</button>
            <button onClick={() => setCookieAccepted(true)} className="rounded-lg border border-[#1F302F] text-[#1F302F] px-4 py-2 text-sm font-medium hover:bg-[#1F302F] hover:text-[#FBFFDF] transition">Từ chối</button>
          </div>
        </div>
      )}
    </div>
  );
}
