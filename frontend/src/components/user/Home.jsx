import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, VolumeX } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import useViewportScale from "@/hooks/useViewportScale";
import SubscriptionPlanRepository from "@/API/repositories/SubscriptionPlanRepository";
import { useAuth } from "@/API/context/AuthContext";

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
const HERO_TOPLINE = "Studio trải nghiệm cho vườn cây ăn quả Việt".normalize(
  "NFC"
);
const HERO_TAGLINE =
  "Đánh thức mỗi mùa vụ bằng ánh sáng, dữ liệu và cảm hứng".normalize("NFC");

// Rotating copy for the intro-split section (VI)
const ROTATE_PARTS = [
  "dữ liệu cây",
  "quản lý cây",
  "cảnh báo thời tiết",
  "quản lý vườn",
  "hỗ trợ AI",
];

/* =========================================================================
   TYPE-&-ERASE Rotator (thay cho reveal cũ) — KHÔNG blur
   - Giữ nguyên API <Rotator items=[] className="" />

   - Gõ tới hết chữ → tạm dừng → xoá dần → chuyển từ tiếp theo
   - Tự tắt animation nếu người dùng bật “reduce motion”
   ========================================================================= */
function Rotator({
  items,
  className = "",
  typeSpeed = 60, // ms / ký tự khi gõ
  eraseSpeed = 42, // ms / ký tự khi xoá
  holdAfterType = 900, // chờ sau khi gõ xong
  holdAfterErase = 420, // chờ sau khi xoá sạch
  startDelay = 250, // trễ nhỏ trước vòng đầu
}) {
  const [i, setI] = useState(0); // chỉ mục cụm từ
  const [txt, setTxt] = useState(""); // chuỗi đang hiển thị
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
    if (reduced) {
      setTxt(items[0]);
      return;
    }

    const target = items[i] ?? "";
    let t;

    switch (phase) {
      case "delay":
        t = setTimeout(() => setPhase("typing"), startDelay);
        break;

      case "typing":
        if (txt.length < target.length) {
          t = setTimeout(
            () => setTxt(target.slice(0, txt.length + 1)),
            typeSpeed
          );
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
          t = setTimeout(
            () => setTxt(target.slice(0, txt.length - 1)),
            eraseSpeed
          );
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
    items,
    i,
    txt,
    phase,
    typeSpeed,
    eraseSpeed,
    holdAfterType,
    holdAfterErase,
    startDelay,
    reduced,
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
  const onErr = () =>
    setI((prev) => (prev + 1 < list.length ? prev + 1 : prev));

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
    <Comp
      ref={ref}
      className={"relative inline-block overflow-hidden align-top " + className}
    >
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

  // Pricing packages state
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPackagesLoading(true);
        // Get all active plans (including free)
        const data = await SubscriptionPlanRepository.getAll(true);
        if (!data) return;

        const transformed = data.map((plan, index) => {
          let planDescription = "";
          const rawPrice = Number(plan.price) || 0;
          const formattedPrice =
            rawPrice === 0
              ? "Miễn phí"
              : rawPrice.toLocaleString("vi-VN") + "đ";

          const unit = rawPrice === 0 ? "" : "/tháng";

          // Generate description if not present or fallback
          if (plan.description) {
            planDescription = plan.description;
          } else {
            if (plan.maxGardens === 1 && plan.maxTreesPerGarden === 5) {
              planDescription = "Khởi đầu hành trình số hóa vườn cây.";
            } else if (plan.maxGardens === 5 && plan.maxTreesPerGarden === 5) {
              planDescription =
                "Giải pháp chuyên sâu cho nhà vườn chuyên nghiệp.";
            } else {
              planDescription = "Hệ sinh thái toàn diện cho doanh nghiệp.";
            }
          }

          // Parse features
          const features = [];
          if (plan.features) {
            if (
              typeof plan.features === "string" &&
              plan.features.startsWith("[")
            ) {
              try {
                const parsed = JSON.parse(plan.features);
                if (Array.isArray(parsed)) features.push(...parsed);
              } catch {}
            }
            if (features.length === 0) {
              const parsed = String(plan.features)
                .split("\n")
                .filter((f) => f.trim());
              if (parsed.length > 0) features.push(...parsed);
            }
          }
          if (features.length === 0) features.push(planDescription);

          return {
            id: plan.planId,
            name: plan.planName,
            price: formattedPrice,
            unit,
            desc: planDescription,
            features,
            cta: rawPrice === 0 ? "Bắt đầu ngay" : "Dùng thử ngay",
            popular: index === 1, // Highlight 2nd plan
            isFree: rawPrice === 0,
            rawPrice: rawPrice,
          };
        });

        // Ensure we display at least 3 cards if fewer plans returned, or just used returned
        setPackages(transformed);
      } catch (err) {
        console.error("Failed to load packages", err);
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchPlans();
  }, []);

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

  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePackageClick = () => {
    if (user) {
      navigate("/price");
    } else {
      navigate("/auth");
    }
  };

  // --- Smoke tests (runtime) ------------------------------------------------
  useEffect(() => {
    console.groupCollapsed("%cSMOKE TESTS", "color:#0a0");
    try {
      console.assert(
        ["video", "image"].includes(HERO_MEDIA.type),
        'HERO_MEDIA.type must be "video" or "image"'
      );
      console.assert(
        !!document.querySelector('[data-testid="hero"]'),
        "Hero section should exist"
      );
      console.assert(
        !!document.querySelector("main#main"),
        'Main element with id="main" should exist for skip link'
      );
      console.assert(
        !!document.querySelector('[data-testid="intro-split"]'),
        "Intro split section should exist"
      );
      console.assert(
        !!document.querySelector('[data-testid="rotating-text"]'),
        "Rotating text should exist"
      );
      console.assert(
        !!document.querySelector('[data-testid="territory-teaser"]'),
        "Territory teaser section should exist"
      );
      console.assert(
        !!document.querySelector('[data-testid="support-section"]'),
        "Support section should exist"
      );
      console.assert(
        !!document.querySelector('[data-testid="strapline"]'),
        "Strapline should exist"
      );
      console.assert(
        !!document.querySelector('[data-testid="colloque-card"]'),
        "Colloque card should exist"
      );
      console.assert(
        !!document.querySelector('[data-testid="intro-img-1"]'),
        "Intro image 1 should exist"
      );
      console.assert(
        !!document.querySelector('[data-testid="intro-img-2"]'),
        "Intro image 2 should exist"
      );
      console.assert(
        !!document.querySelector('[data-testid="news-overlay"]'),
        "News overlay grid should exist"
      );
      console.assert(
        !!document.querySelector('[data-testid="mute-toggle"]'),
        "Toggle button should exist"
      );
      console.assert(
        !!document.querySelector('[data-testid="hero-text"]'),
        "Hero text block should be visible initially"
      );
    } finally {
      console.groupEnd();
    }
  }, []);

  const { wrapperStyle: zoomWrapperStyle } = useViewportScale();

  return (
    <div style={zoomWrapperStyle}>
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
        <section
          aria-label="Hero"
          className="relative isolate"
          data-testid="hero"
        >
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
                  console.warn(
                    "[hero] video onError, source failed:",
                    videoSources[vidIdx]
                  );
                  setVidIdx((i) =>
                    videoSources.length ? (i + 1) % videoSources.length : i
                  );
                }}
                onStalled={() => {
                  console.warn("[hero] video stalled, trying next source");
                  setVidIdx((i) =>
                    videoSources.length ? (i + 1) % videoSources.length : i
                  );
                }}
                onLoadedData={async () => {
                  try {
                    await videoRef.current?.play();
                  } catch (_) {}
                }}
                onCanPlay={async () => {
                  try {
                    await videoRef.current?.play();
                  } catch (_) {}
                }}
                data-testid="hero-media"
              />
            ) : (
              <motion.img
                style={{ scale: videoScale }}
                src={HERO_MEDIA.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                data-testid="hero-media"
              />
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
                        onError={() => {
                          console.warn(
                            "[hero] PNG failed, falling back to text"
                          );
                          setSloganImgError(true);
                        }}
                      />
                      <span className="sr-only">{HERO_SLOGAN.altText}</span>
                    </>
                  ) : (
                    <div
                      aria-label={HERO_SLOGAN.altText}
                      lang="vi"
                      className="text-[#FBFFDF]"
                    >
                      <p className="font-hero text-[clamp(16px,2.6vw,32px)] font-semibold opacity-95 mb-3 md:mb-4 mm-text-wrap-safe break-words">
                        {HERO_TOPLINE}
                      </p>
                      <h1 className="font-display font-extrabold leading-[1.06] tracking-[-0.01em] drop-shadow-[0_10px_36px_rgba(0,0,0,0.35)] text-[clamp(72px,11.5vw,172px)] antialiased mm-text-wrap-safe break-words">
                        {HERO_TITLE}
                      </h1>
                      <p className="font-hero text-[clamp(16px,2.6vw,32px)] font-semibold mt-3 md:mt-4 mm-text-wrap-safe break-words">
                        {HERO_TAGLINE}
                      </p>
                      <span className="sr-only">{HERO_SLOGAN.altText}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Play toggle button */}
              <button
                onClick={handleHeroToggle}
                className="absolute bottom-6 left-6 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full grid place-items-center bg-[#FFFFA5] text-[#1F302F] shadow-lg hover:scale-105 transition"
                aria-label={
                  showHeroText
                    ? "Phát lại từ đầu (có tiếng)"
                    : "Tắt tiếng & hiện chữ"
                }
                title={
                  showHeroText
                    ? "Phát lại từ đầu (có tiếng)"
                    : "Tắt tiếng & hiện chữ"
                }
                data-testid="mute-toggle"
              >
                {showHeroText ? (
                  <Play className="w-6 h-6" />
                ) : (
                  <VolumeX className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Strapline */}
        <section
          data-testid="strapline"
          className="cv-auto bg-[#1F302F] text-[#D1DFB6] py-6"
        >
          <div className="mm-fluid-shell mx-auto max-w-[1650px] px-4 md:px-[90px]">
            <p className="mm-fluid-text text-center text-[clamp(16px,2.1vw,22px)] opacity-90 mm-text-wrap-safe break-words">
              Thiết lập vườn, cấp mã cây, rồi quản lý lá – cành – hoa – quả ngay
              tại một bảng điều khiển đồng nhất.
            </p>
          </div>
        </section>

        {/* Colloque / Event card */}
        <section
          data-testid="colloque-card"
          className="cv-auto bg-[#1F302F] py-12 md:py-20"
        >
          <div className="mm-fluid-shell mx-auto max-w-[1150px] px-4">
            <div className="rounded-[18px] md:rounded-[20px] bg-[#D1DFB6] ring-1 ring-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.25)] p-6 md:p-10 md:min-h-[440px] flex flex-col md:flex-row gap-8 md:gap-12 items-center">
              <div className="md:w-[46%]">
                <img
                  src="https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=1600&auto=format&fit=crop"
                  alt="Sự kiện Mầm Mới"
                  className="w-full h-[280px] md:h-[440px] object-cover rounded-[18px]"
                />
              </div>
              <div className="md:w-[54%] flex flex-col gap-4 md:gap-5">
                <h3 className="text-[clamp(32px,4vw,50px)] leading-tight text-[#1F302F] font-semibold mm-text-wrap-safe break-words">
                  Đồng hành cùng Mầm mới
                </h3>
                <p className="mm-fluid-text text-[clamp(14px,1.8vw,18px)] leading-relaxed text-[#1F302F]/85 mm-text-wrap-safe break-words">
                  Mục tiêu sứ mệnh của chúng tôi luôn mong muốn đưa ra hệ thống
                  chăm sóc cây ăn quả tốt nhất và hiệu quả nhất cho người dùng.
                </p>
                <div>
                  <Link
                    to="/intro"
                    className="inline-flex items-center justify-center rounded-full bg-[#FFFFA5] text-[#1F302F] px-7 py-3.5 text-[clamp(14px,1.8vw,20px)] font-semibold shadow hover:shadow-md transition mm-text-wrap-safe break-words"
                  >
                    Tìm hiểu về Mầm Mới
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intro split */}
        <section
          id="intro"
          data-testid="intro-split"
          className="cv-auto bg-[#1F302F] text-[#FBFFDF] py-16 md:py-24"
        >
          <div className="mm-fluid-shell mx-auto max-w-[1650px] px-4 md:px-[90px]">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-[clamp(28px,3.2vw,42.5px)] leading-[1.15] font-medium mm-text-wrap-safe break-words">
                  <span className="opacity-90">
                    Chúng tôi luôn đồng hành cùng bạn từ{" "}
                  </span>
                  <span className="font-semibold">
                    <Rotator items={ROTATE_PARTS} />
                  </span>
                  <br />
                  <span className="opacity-90">
                    Mầm Mới luôn đồng hành cùng người dùng sẵn sàng đem đến dịch
                    tốt nhất và nhanh nhất
                  </span>
                </h2>
                <Link
                  to="/plants"
                  className="inline-flex items-center justify-center mt-8 rounded-full bg-[#FFFFA5] text-[#1F302F] px-7 py-3.5 text-lg font-semibold shadow hover:shadow-md transition"
                >
                  Xem Thư viện cây
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="rounded-[18px] overflow-hidden aspect-[4/3] md:aspect-[5/4] ring-1 ring-black/10 shadow-lg">
                  <SafeImage
                    srcs={[
                      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
                      "https://images.unsplash.com/photo-1544717301-9cdcb1f5941c?auto=format&fit=crop&w=1600&q=80",
                      "https://picsum.photos/seed/industrie/1200/900",
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
                      "https://picsum.photos/seed/foret/1200/900",
                    ]}
                    alt="Vườn cây ăn quả"
                    className="w-full h-full object-cover"
                    testId="intro-img-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Packages (Pricing) - only show when user is logged in */}
        {user && (
          <section
            id="pricing"
            data-testid="pricing-section"
            className="cv-auto bg-[#FBFFDF] text-[#1F302F] py-16 md:py-24"
          >
            <div className="mm-fluid-shell mx-auto max-w-[1650px] px-4 md:px-[90px]">
              <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <h2 className="text-[clamp(28px,3.2vw,48px)] font-display font-bold mb-4 mm-text-wrap-safe break-words">
                  Lựa chọn gói dịch vụ phù hợp
                </h2>
                <p className="text-[clamp(16px,1.8vw,20px)] opacity-80 mm-text-wrap-safe break-words">
                  Từ nông hộ nhỏ đến doanh nghiệp lớn, Mầm Mới đều có giải pháp
                  tối ưu cho nhu cầu của bạn.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {packagesLoading
                  ? /* Skeleton loading state */
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="rounded-[24px] bg-white border border-[#1F302F]/10 p-8 h-[400px] animate-pulse"
                      >
                        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))
                  : packages.map((pkg) => {
                      // If this is the free plan, render as a descriptive block
                      if (pkg.isFree) {
                        return (
                          <div
                            key={pkg.id}
                            className={`relative flex flex-col rounded-[24px] p-6 md:p-8 transition-all duration-300 ${
                              pkg.popular
                                ? "bg-[#1F302F] text-[#FBFFDF] shadow-[0_20px_40px_rgba(31,48,47,0.25)] ring-1 ring-[#1F302F]"
                                : "bg-white border border-[#1F302F]/10 shadow-lg hover:shadow-xl text-[#1F302F]"
                            }`}
                          >
                            {pkg.popular && (
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FFFFA5] text-[#1F302F] text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-sm">
                                Khuyên dùng
                              </div>
                            )}

                            <div className="mb-6">
                              <h3
                                className={`text-xl font-bold mb-2 ${
                                  pkg.popular
                                    ? "text-[#FFFFA5]"
                                    : "text-[#5B6B4E]"
                                }`}
                              >
                                {pkg.name} {"(Miễn phí)"}
                              </h3>
                              <p
                                className={`mt-3 text-sm leading-relaxed ${
                                  pkg.popular ? "opacity-90" : "opacity-75"
                                }`}
                              >
                                {/* If user logged in, show the real description; otherwise show a short callout for new users */}
                                {user
                                  ? pkg.desc
                                  : "Người dùng mới sẽ được trải nghiệm miễn phí. Đăng nhập hoặc đăng ký để bắt đầu."}
                              </p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                              {pkg.features.map((feat, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-3 text-sm"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`w-5 h-5 flex-shrink-0 ${
                                      pkg.popular
                                        ? "text-[#FFFFA5]"
                                        : "text-[#1F302F]"
                                    }`}
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  <span className="opacity-90">{feat}</span>
                                </li>
                              ))}
                            </ul>

                            {/* CTA differs for guests vs logged-in users */}
                            {user ? (
                              <button
                                disabled
                                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                                  pkg.popular
                                    ? "bg-[#FFFFA5] text-[#1F302F] opacity-80"
                                    : "bg-[#1F302F] text-[#FBFFDF] opacity-80"
                                }`}
                              >
                                Gói miễn phí
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate("/auth")}
                                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                                  pkg.popular
                                    ? "bg-[#FFFFA5] text-[#1F302F] hover:bg-white"
                                    : "bg-[#1F302F] text-[#FBFFDF] hover:bg-[#5B6B4E]"
                                }`}
                              >
                                Đăng ký để trải nghiệm
                              </button>
                            )}
                          </div>
                        );
                      }

                      // Paid plans: keep original card layout
                      return (
                        <div
                          key={pkg.id}
                          className={`relative flex flex-col rounded-[24px] p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 ${
                            pkg.popular
                              ? "bg-[#1F302F] text-[#FBFFDF] shadow-[0_20px_40px_rgba(31,48,47,0.25)] ring-1 ring-[#1F302F]"
                              : "bg-white border border-[#1F302F]/10 shadow-lg hover:shadow-xl text-[#1F302F]"
                          }`}
                        >
                          {pkg.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FFFFA5] text-[#1F302F] text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-sm">
                              Khuyên dùng
                            </div>
                          )}

                          <div className="mb-6">
                            <h3
                              className={`text-xl font-bold mb-2 ${
                                pkg.popular
                                  ? "text-[#FFFFA5]"
                                  : "text-[#5B6B4E]"
                              }`}
                            >
                              {pkg.name}
                            </h3>
                            <div className="flex items-baseline gap-1">
                              <span className="text-[clamp(32px,2.5vw,40px)] font-display font-bold">
                                {pkg.price}
                              </span>
                              <span className="text-sm opacity-80">
                                {pkg.unit}
                              </span>
                            </div>
                            <p
                              className={`mt-3 text-sm leading-relaxed ${
                                pkg.popular ? "opacity-90" : "opacity-75"
                              }`}
                            >
                              {pkg.desc}
                            </p>
                          </div>

                          <ul className="space-y-4 mb-8 flex-1">
                            {pkg.features.map((feat, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-3 text-sm"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className={`w-5 h-5 flex-shrink-0 ${
                                    pkg.popular
                                      ? "text-[#FFFFA5]"
                                      : "text-[#1F302F]"
                                  }`}
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span className="opacity-90">{feat}</span>
                              </li>
                            ))}
                          </ul>

                          <button
                            onClick={handlePackageClick}
                            className={`w-full py-4 rounded-xl font-semibold transition-all ${
                              pkg.popular
                                ? "bg-[#FFFFA5] text-[#1F302F] hover:bg-white"
                                : "bg-[#1F302F] text-[#FBFFDF] hover:bg-[#5B6B4E]"
                            }`}
                          >
                            {pkg.cta}
                          </button>
                        </div>
                      );
                    })}
              </div>
            </div>
          </section>
        )}

        {/* Always-on support */}
        <section
          id="support-now"
          data-testid="support-section"
          className="cv-auto bg-[#EEF3CC]"
        >
          <div className="mm-fluid-shell mx-auto max-w-[1650px] px-4 md:px-[90px] py-16 md:py-24">
            <div className="rounded-[28px] bg-[#F8FBEA] ring-1 ring-black/5 shadow-[0_14px_40px_rgba(0,0,0,0.08)] p-8 md:p-12 space-y-8">
              <div>
                <p className="text-[clamp(11px,1.3vw,14px)] uppercase tracking-[0.2em] text-[#5B6B4E] font-semibold mm-text-wrap-safe break-words">
                  Mầm Mới Care Desk
                </p>
                <h2 className="text-[clamp(32px,3.6vw,56px)] leading-tight text-[#243833] font-medium mt-3 mm-text-wrap-safe break-words">
                  Luôn hỗ trợ ngay lập tức khi bạn cần
                </h2>
              </div>
              <p className="mm-fluid-text text-[clamp(14px,1.8vw,18px)] text-[#243833]/85 max-w-4xl mm-text-wrap-safe break-words">
                Chúng tôi duy trì đội hỗ trợ có mặt 24/7, sẵn sàng phản hồi mọi
                yêu cầu từ nhập liệu, cấu hình thiết bị đến xử lý cảnh báo sâu
                bệnh, đảm bảo bạn không bao giờ bị bỏ lại cùng câu hỏi chưa được
                giải đáp.
              </p>
              <div className="grid md:grid-cols-3 gap-5">
                {[
                  {
                    title: "Xử lý sự cố tức thời",
                    body: "Gửi mô tả và ảnh tình trạng cây để nhận quy trình giải quyết theo từng bước, đồng bộ trực tiếp với đội kỹ thuật nếu cần can thiệp tại vườn.",
                  },
                  {
                    title: "Tự trợ giúp với AI",
                    body: "AI Mầm Mới đọc nội dung bạn nhập, đề xuất lệnh thao tác, checklist và lưu ý an toàn để bạn có thể tự xử lý ngay trên ứng dụng.",
                  },
                  {
                    title: "Cảnh báo thời tiết chủ động",
                    body: "Hệ thống tự quét radar, cảm biến và so khớp vị trí lô cây; khi phát hiện mưa đá, gió mạnh hay nắng gắt sẽ gửi cảnh báo và hướng dẫn phòng vệ.",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl bg-white/85 p-5 shadow-inner border border-[#E0E7C6]/70"
                  >
                    <h3 className="text-[clamp(16px,2.2vw,20px)] font-semibold text-[#1F302F] mm-text-wrap-safe break-words">
                      {card.title}
                    </h3>
                    <p className="mm-fluid-text mt-3 text-[clamp(13px,1.6vw,16px)] text-[#1F302F]/80 mm-text-wrap-safe break-words">
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mm-fluid-text text-[#243833]/80 max-w-4xl">
                Từng cuộc trò chuyện và hướng dẫn đều được gắn với mã cây, giúp
                bạn xem lại lịch sử hỗ trợ, báo cáo cho đối tác hoặc đào tạo đội
                ngũ mới chỉ với vài thao tác.
              </p>
              <div className="flex justify-end">
                <Link
                  to="/report"
                  className="inline-flex items-center justify-center rounded-full bg-[#243833] text-[#FBFFDF] px-7 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#243833]"
                >
                  Liên hệ hỗ trợ
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <main id="main">{/* News */}</main>

        {/* Cookie banner */}
        {!cookieAccepted && (
          <div className="fixed bottom-3 left-3 right-3 md:left-auto md:right-6 z-[90] max-w-2xl bg-[#E6E7E0] text-[#333] rounded-xl shadow-lg p-4 md:p-5">
            <div className="text-sm">
              Trang này sử dụng cookie để cải thiện trải nghiệm của bạn. Tiếp
              tục sử dụng đồng nghĩa với việc bạn đồng ý với chính sách của
              chúng tôi.
              <a href="#cookies" className="underline underline-offset-2 ml-1">
                Tìm hiểu thêm
              </a>
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <button
                onClick={() => setCookieAccepted(true)}
                className="rounded-lg bg-[#1F302F] text-[#E6E7E0] px-4 py-2 text-sm font-medium"
              >
                Đồng ý
              </button>
              <button
                onClick={() => setCookieAccepted(true)}
                className="rounded-lg border border-[#1F302F] text-[#1F302F] px-4 py-2 text-sm font-medium hover:bg-[#1F302F] hover:text-[#FBFFDF] transition"
              >
                Từ chối
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
