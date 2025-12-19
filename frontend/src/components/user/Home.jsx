import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, VolumeX } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
} from "framer-motion";
import useViewportScale from "@/hooks/useViewportScale";
import SubscriptionPlanRepository from "@/API/repositories/SubscriptionPlanRepository";
import { useAuth } from "@/API/context/AuthContext";

// Staggered animation variants for cards - prevent flash by using opacity: 1 initially
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 1,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 20,
    },
  },
};

const slideInLeftVariants = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
    },
  },
};

const slideInRightVariants = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
    },
  },
};

const scaleUpVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

// 3D Card Tilt Component
function Card3D({ children, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouse = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Mam Moi — Home (Page Only, no header) [JavaScript version]
 * - Hero video, intro, teaser, map, news, cookie banner
 * - Vietnamese content & smooth scroll preserved
 */

// Hero media config (JS version)
const HERO_MEDIA = {
  type: "video",
  srcs: [
    "/data/Video/Vid1.mp4",
    "/data/Video/vid2.mp4",
    "/data/Video/vid3.mp4",
    "/data/Video/vid4.mp4",
    "/data/Video/Vid5.mp4",
    "/data/Video/Vid6.mp4",
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
  "quản lý dữ liệu cây",
  "dự báo thời tiết",
  "quản lý vườn",
  "cung cấp hỗ trợ AI",
  "theo dõi công việc",
];

/* =========================================================================
   TYPE-&-ERASE Rotator (thay cho reveal cũ) — KHÔNG blur
   - Giữ nguyên API <Rotator items=[] className="" />

   - Gõ tới hết chữ → tạm dừng → xoá dần → chuyển từ tiếp theo
   - Tự tắt animation nếu người dùng bật "reduce motion"
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
  const videoRef = useRef([]);
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
              } catch { }
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
            cta: rawPrice === 0 ? "Bắt đầu ngay" : "Đăng ký ngay",
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
    // Toggle for ALL players
    if (showHeroText) {
      try {
        setIsMuted(false);
        // Find active player and ensure it plays with sound
        const activeIdx = vidIdx % 2;
        const v = videoRef.current[activeIdx];
        if (v) {
          v.muted = false;
          await v.play();
        }
      } catch (_) { }
      setShowHeroText(false);
    } else {
      setIsMuted(true);
      // Mute all
      videoRef.current.forEach(v => {
        if (v) v.muted = true;
      });
      setShowHeroText(true);
    }
  };

  // Autoplay hero video - play active, reset others to time 0
  useEffect(() => {
    if (HERO_MEDIA.type !== "video") return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    // Play the active video, pause and reset others
    videoSources.forEach((_, idx) => {
      const v = videoRef.current[idx];
      if (!v) return;

      if (idx === vidIdx) {
        v.play().catch(() => { });
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [vidIdx, videoSources]);

  // Scroll effects with progress bar
  const { scrollYProgress } = useScroll();
  const { scrollY } = useScroll();
  const videoScale = useTransform(scrollY, [0, 400], [1.08, 1]);
  const titleY = useTransform(scrollY, [0, 300], [0, -40]);

  // Parallax for intro images
  const introImage1Y = useTransform(scrollY, [400, 1200], [0, -60]);
  const introImage2Y = useTransform(scrollY, [400, 1200], [0, -30]);

  // Parallax for colloque section
  const colloqueY = useTransform(scrollY, [200, 800], [40, -40]);
  const colloqueScale = useTransform(scrollY, [200, 600], [0.95, 1]);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Memoize admin check to prevent re-render flash
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const role = user.role?.toString().toLowerCase().trim();
    return role === "systemadmin" || role === "businessadmin";
  }, [user]);

  const adminPath = useMemo(() => {
    if (!user) return "/auth";
    const role = user.role?.toString().toLowerCase().trim();
    if (role === "systemadmin") return "/admin/users";
    if (role === "businessadmin") return "/admin/business/trees";
    return "/garden";
  }, [user]);

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
      {/* Scroll Progress Bar */}
      <motion.div
        className="scroll-progress"
        initial={{ scaleX: 0 }}
        style={{ scaleX: scrollYProgress }}
      />

      <div className="mm-fluid-page min-h-screen bg-[#FBFFDF] text-[#333] font-sans selection:bg-[#FFFFA5] selection:text-[#1F302F]">
        {/* Tokens */}
        <style>{`
        /* --- IMPORTANT: @import MUST be first in the stylesheet or the browser ignores it --- */
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;800;900&display=swap&subset=vietnamese');

        :root{ --color-bg:#1F302F; --color-ivory:#FBFFDF; --color-leaf:#D1DFB6; --color-accent:#FFFFA5; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        
        /* Premium animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-3deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 9s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 5s ease-in-out infinite; }
        .animate-shimmer { 
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
        }
        .animate-bounce-soft { animation: bounce-soft 3s ease-in-out infinite; }
        .animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
        
        /* Responsive container */
        .home-container {
          max-width: 100%;
          overflow-x: hidden;
        }
        
        /* Responsive orbs - smaller on mobile */
        @media (max-width: 768px) {
          .orb-large { width: 150px !important; height: 150px !important; }
          .orb-medium { width: 100px !important; height: 100px !important; }
          .orb-small { width: 80px !important; height: 80px !important; }
        }

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
        
        /* Card hover effects */
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        
        /* Glow effect */
        .glow-effect {
          position: relative;
        }
        .glow-effect::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, #FFFFA5, #D1DFB6, #FFFFA5);
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .glow-effect:hover::before {
          opacity: 1;
        }
        
        /* 3D Card Effects */
        .card-3d {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        .card-3d-inner {
          transform-style: preserve-3d;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-3d-inner:hover {
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25),
                      0 0 40px rgba(255,255,165,0.15);
        }
        
        /* Scroll Progress Bar */
        .scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #FFFFA5, #D1DFB6, #FFFFA5);
          transform-origin: 0%;
          z-index: 9999;
        }
        
        /* Stagger delay utilities */
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        
        /* Enhanced section reveal */
        .section-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .section-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

        {/* Hero */}
        <section
          aria-label="Hero"
          className="relative isolate"
          data-testid="hero"
        >
          <div className="relative h-[88svh] min-h-[350px] w-full overflow-hidden">
            {HERO_MEDIA.type === "video" ? (
              <>
                {videoSources.map((src, idx) => {
                  const isActive = vidIdx === idx;

                  return (
                    <video
                      key={idx}
                      ref={(el) => (videoRef.current[idx] = el)}
                      className={`absolute inset-0 h-full w-full object-cover pointer-events-none ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                      style={{ transition: "opacity 0.3s ease-in-out" }}
                      playsInline
                      muted
                      preload="auto"
                      src={encodeURI(src)}
                      onEnded={() => {
                        if (isActive) {
                          const nextIdx = (idx + 1) % videoSources.length;
                          setVidIdx(nextIdx);
                          // Immediately play next video
                          videoRef.current[nextIdx]?.play();
                        }
                      }}
                      onError={() => {
                        if (isActive) {
                          console.warn("[hero] video onError:", src);
                          setVidIdx((prev) => (prev + 1) % videoSources.length);
                        }
                      }}
                      data-testid={`hero-media-${idx}`}
                    />
                  );
                })}
              </>
            ) : (
              <motion.img
                style={{ scale: videoScale }}
                src={HERO_MEDIA.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                data-testid="hero-media"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />

            {/* Floating orbs - smaller sizes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="orb-medium absolute top-20 left-[10%] w-48 h-48 rounded-full blur-3xl animate-float" style={{ background: 'radial-gradient(circle, rgba(255,255,165,0.12) 0%, transparent 70%)' }} />
              <div className="orb-large absolute bottom-20 right-[15%] w-56 h-56 rounded-full blur-3xl animate-float-reverse" style={{ background: 'radial-gradient(circle, rgba(209,223,182,0.1) 0%, transparent 70%)' }} />
              <div className="orb-large absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-[400px] md:h-[400px] rounded-full blur-3xl animate-pulse-glow" style={{ background: 'radial-gradient(circle, rgba(251,255,223,0.06) 0%, transparent 60%)' }} />
            </div>

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

              {/* Quản lý vườn button - dynamic based on user role */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(adminPath);
                }}
                className="absolute bottom-6 left-6 z-30 inline-flex items-center gap-2 px-5 py-3 md:px-6 md:py-3.5 rounded-full bg-[#FFFFA5] text-[#1F302F] font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
                data-testid="garden-link"
              >
                <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isAdmin ? (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  )}
                </svg>
                <span className="transition-opacity duration-200">
                  {isAdmin ? "Quản lý hệ thống" : "Quản lý vườn & cây"}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Strapline */}
        <section
          data-testid="strapline"
          className="cv-auto py-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1F302F 0%, #2a4a48 50%, #1F302F 100%)' }}
        >
          {/* Subtle animated background - smaller orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="orb-small absolute top-0 left-1/4 w-32 h-32 rounded-full blur-3xl animate-float" style={{ background: 'rgba(209,223,182,0.08)' }} />
            <div className="orb-small absolute bottom-0 right-1/4 w-32 h-32 rounded-full blur-3xl animate-float-reverse" style={{ background: 'rgba(255,255,165,0.06)' }} />
          </div>

          <div className="mm-fluid-shell mx-auto max-w-[1650px] px-4 md:px-[90px] relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mm-fluid-text text-center text-[clamp(16px,2.1vw,24px)] mm-text-wrap-safe break-words font-medium"
              style={{ color: '#D1DFB6' }}
            >
              Hệ thống chăm sóc cây ăn quả thông minh.
            </motion.p>
          </div>
        </section>

        {/* Colloque / Event card */}
        <section
          data-testid="colloque-card"
          className="cv-auto py-12 md:py-24 relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #1F302F 0%, #243833 50%, #1F302F 100%)' }}
        >
          {/* Background orbs - smaller */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="orb-medium absolute top-10 right-[20%] w-48 h-48 rounded-full blur-3xl animate-float" style={{ background: 'rgba(209,223,182,0.06)' }} />
            <div className="orb-large absolute bottom-10 left-[15%] w-56 h-56 rounded-full blur-3xl animate-float-reverse" style={{ background: 'rgba(255,255,165,0.05)' }} />
          </div>

          <div className="mm-fluid-shell mx-auto max-w-[1150px] px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 80,
                damping: 20
              }}
              className="rounded-[24px] md:rounded-[32px] p-8 md:p-12 md:min-h-[480px] flex flex-col md:flex-row gap-10 md:gap-14 items-center relative overflow-hidden card-3d-inner"
              whileHover={{
                boxShadow: "0 40px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)"
              }}
              style={{
                y: colloqueY,
                background: 'linear-gradient(135deg, rgba(209,223,182,0.95) 0%, rgba(209,223,182,1) 100%)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 animate-shimmer" />
              </div>

              <div className="md:w-[46%] relative">
                <div className="rounded-[16px] md:rounded-[20px] overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1200&auto=format&fit=crop"
                    alt="Vườn xoài Việt Nam"
                    className="w-full h-[240px] sm:h-[280px] md:h-[360px] object-cover"
                  />
                </div>
              </div>
              <div className="md:w-[54%] flex flex-col gap-5 md:gap-6 relative z-10">
                <h3 className="text-[clamp(32px,4vw,52px)] leading-tight text-[#1F302F] font-bold mm-text-wrap-safe break-words">
                  Đồng hành cùng Mầm mới
                </h3>
                <p className="mm-fluid-text text-[clamp(15px,1.8vw,19px)] leading-relaxed text-[#1F302F]/85 mm-text-wrap-safe break-words">
                  Mục tiêu sứ mệnh của chúng tôi luôn mong muốn đưa ra hệ thống
                  chăm sóc cây ăn quả tốt nhất và hiệu quả nhất cho người dùng.
                </p>
                <div>
                  <Link
                    to="/intro"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-[clamp(15px,1.8vw,18px)] font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    style={{ background: '#FFFFA5', color: '#1F302F' }}
                  >
                    Tìm hiểu về Mầm Mới
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Intro split */}
        <section
          id="intro"
          data-testid="intro-split"
          className="cv-auto py-16 md:py-24 relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #1F302F 0%, #243833 100%)' }}
        >
          {/* Background decorations - smaller */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="orb-large absolute top-1/4 left-[5%] w-48 h-48 rounded-full blur-3xl animate-float" style={{ background: 'rgba(255,255,165,0.06)' }} />
            <div className="orb-large absolute bottom-1/4 right-[5%] w-56 h-56 rounded-full blur-3xl animate-float-reverse" style={{ background: 'rgba(209,223,182,0.05)' }} />
          </div>

          <div className="mm-fluid-shell mx-auto max-w-[1650px] px-4 md:px-[90px] relative z-10">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <h2 className="text-[clamp(20px,2.2vw,32px)] leading-[1.25] font-medium mm-text-wrap-safe" style={{ color: '#FBFFDF' }}>
                  <span className="opacity-90">
                    Luôn hỗ trợ bạn từ{" "}
                  </span>
                  <span className="font-bold whitespace-nowrap" style={{ color: '#FFFFA5' }}>
                    <Rotator items={ROTATE_PARTS} />
                  </span>
                  <br />
                  <span className="opacity-90">
                    Mầm Mới sẵn sàng đem đến dịch vụ
                    tốt nhất và hiệu quả nhất
                  </span>
                </h2>
                <Link
                  to="/plants"
                  className="inline-flex items-center justify-center gap-2 mt-8 rounded-full px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  style={{ background: '#FFFFA5', color: '#1F302F' }}
                >
                  Xem Thư viện cây
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="grid grid-cols-2 gap-4 md:gap-6"
              >
                <motion.div
                  style={{ y: introImage1Y }}
                  className="rounded-[16px] md:rounded-[20px] overflow-hidden aspect-[4/3] shadow-xl"
                  whileHover={{ scale: 1.03, boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}
                  transition={{ duration: 0.4 }}
                >
                  <SafeImage
                    srcs={[
                      "https://images.unsplash.com/photo-1604608672516-f1b9b1e5c2b8?auto=format&fit=crop&w=800&q=80",
                      "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=800&q=80",
                    ]}
                    alt="Vườn thanh long"
                    className="w-full h-full object-cover"
                    testId="intro-img-1"
                  />
                </motion.div>
                <motion.div
                  style={{ y: introImage2Y }}
                  className="rounded-[16px] md:rounded-[20px] overflow-hidden aspect-[4/3] shadow-xl mt-6 md:mt-8"
                  whileHover={{ scale: 1.03, boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}
                  transition={{ duration: 0.4 }}
                >
                  <SafeImage
                    srcs={[
                      "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80",
                      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
                    ]}
                    alt="Vườn cây ăn quả"
                    className="w-full h-full object-cover"
                    testId="intro-img-2"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Service Packages (Pricing) */}
        <section
          id="pricing"
          data-testid="pricing-section"
          className="cv-auto py-20 md:py-28 relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #FBFFDF 0%, #EEF3CC 50%, #FBFFDF 100%)' }}
        >
          {/* Background orbs - smaller */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="orb-medium absolute top-20 right-[10%] w-48 h-48 rounded-full blur-3xl animate-float" style={{ background: 'rgba(209,223,182,0.3)' }} />
            <div className="orb-large absolute bottom-20 left-[10%] w-56 h-56 rounded-full blur-3xl animate-float-reverse" style={{ background: 'rgba(255,255,165,0.2)' }} />
          </div>

          <div className="mm-fluid-shell mx-auto max-w-[1650px] px-4 md:px-[90px] relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-14 md:mb-18"
            >
              <h2 className="text-[clamp(28px,3.2vw,48px)] font-display font-bold mb-4 mm-text-wrap-safe break-words" style={{ color: '#1F302F' }}>
                Lựa chọn gói dịch vụ phù hợp
              </h2>
              <p className="text-[clamp(16px,1.8vw,20px)] mm-text-wrap-safe break-words" style={{ color: 'rgba(31,48,47,0.8)' }}>
                Từ nông hộ nhỏ đến doanh nghiệp lớn, Mầm Mới đều có giải pháp
                tối ưu cho nhu cầu của bạn.
              </p>
              <p className="text-[clamp(14px,1.6vw,18px)] mt-3 mm-text-wrap-safe break-words" style={{ color: 'rgba(31,48,47,0.7)' }}>
                Khi đăng ký tài khoản, bạn sẽ được sử dụng thử dịch vụ trong 1 tháng.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 md:gap-10"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {packagesLoading
                ? /* Skeleton loading state */
                [1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    variants={cardVariants}
                    className="rounded-[24px] bg-white border border-[#1F302F]/10 p-8 h-[400px] animate-pulse"
                  >
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </motion.div>
                ))
                : packages
                  .filter(pkg => !pkg.isFree) // Loại bỏ gói miễn phí
                  .map((pkg, idx) => {
                    // Gói thứ 2 (index 1) sau khi filter luôn là "Khuyên dùng"
                    const isPopular = idx === 1;
                    return (
                      <motion.div
                        key={pkg.id}
                        variants={cardVariants}
                        whileHover={{
                          boxShadow: isPopular
                            ? "0 30px 60px rgba(31,48,47,0.35)"
                            : "0 25px 50px rgba(0,0,0,0.15)"
                        }}
                        transition={{ duration: 0.2 }}
                        className={`relative flex flex-col rounded-[24px] p-6 md:p-8 h-full cursor-pointer ${isPopular
                          ? "bg-[#1F302F] text-[#FBFFDF] shadow-[0_20px_40px_rgba(31,48,47,0.25)] ring-1 ring-[#1F302F]"
                          : "bg-white border border-[#1F302F]/10 shadow-lg text-[#1F302F]"
                          }`}
                      >
                        {isPopular && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FFFFA5] text-[#1F302F] text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-sm">
                            Khuyên dùng
                          </div>
                        )}

                        <div className="mb-6">
                          <h3
                            className={`text-xl font-bold mb-2 ${isPopular
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
                            <span
                              className={`text-sm ${isPopular
                                ? "text-[#D1DFB6]"
                                : "text-[#1F302F]/60"
                                }`}
                            >
                              / tháng
                            </span>
                          </div>
                        </div>

                        <ul className="flex-1 space-y-3 mb-8">
                          {pkg.features.slice(0, 5).map((feat, idx) => (
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
                                className={`w-5 h-5 flex-shrink-0 ${isPopular
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
                          className={`w-full py-4 rounded-xl font-semibold transition-all ${isPopular
                            ? "bg-[#FFFFA5] text-[#1F302F] hover:bg-white"
                            : "bg-[#1F302F] text-[#FBFFDF] hover:bg-[#5B6B4E]"
                            }`}
                        >
                          {pkg.cta}
                        </button>
                      </motion.div>
                    );
                  })}
            </motion.div>
          </div>
        </section>

        {/* Always-on support */}
        <section
          id="support-now"
          data-testid="support-section"
          className="cv-auto py-16 md:py-24 relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #EEF3CC 0%, #D1DFB6 50%, #EEF3CC 100%)' }}
        >
          {/* Background orbs - smaller */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="orb-medium absolute top-10 left-[15%] w-40 h-40 rounded-full blur-3xl animate-float" style={{ background: 'rgba(255,255,255,0.3)' }} />
            <div className="orb-medium absolute bottom-10 right-[15%] w-48 h-48 rounded-full blur-3xl animate-float-reverse" style={{ background: 'rgba(255,255,165,0.2)' }} />
          </div>

          <div className="mm-fluid-shell mx-auto max-w-[1650px] px-4 md:px-[90px] relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-[32px] p-8 md:p-14 space-y-10 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(248,251,234,0.98) 0%, rgba(255,255,255,0.95) 100%)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)'
              }}
            >
              <div>
                <span
                  className="inline-block text-[clamp(11px,1.3vw,14px)] uppercase tracking-[0.2em] font-bold mm-text-wrap-safe break-words px-4 py-2 rounded-full"
                  style={{ background: 'rgba(31,48,47,0.1)', color: '#1F302F' }}
                >
                  Mầm Mới Care Desk
                </span>
                <h2 className="text-[clamp(32px,3.6vw,56px)] leading-tight font-bold mt-5 mm-text-wrap-safe break-words" style={{ color: '#1F302F' }}>
                  Luôn hỗ trợ ngay lập tức khi bạn cần
                </h2>
              </div>
              <p className="mm-fluid-text text-[clamp(15px,1.8vw,19px)] max-w-4xl mm-text-wrap-safe break-words" style={{ color: 'rgba(36,56,51,0.85)' }}>
                Chúng tôi duy trì đội hỗ trợ có mặt 24/7, sẵn sàng phản hồi mọi
                yêu cầu từ nhập liệu, cấu hình thiết bị đến xử lý cảnh báo sâu
                bệnh, đảm bảo bạn không bao giờ bị bỏ lại cùng câu hỏi chưa được
                giải đáp.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: "⚡",
                    title: "Xử lý sự cố tức thời",
                    body: "Gửi mô tả và ảnh tình trạng cây để nhận quy trình giải quyết theo từng bước, đồng bộ trực tiếp với đội kỹ thuật nếu cần can thiệp tại vườn.",
                  },
                  {
                    icon: "🤖",
                    title: "Tự trợ giúp với AI",
                    body: "AI Mầm Mới đọc nội dung bạn nhập, đề xuất lệnh thao tác, checklist và lưu ý an toàn để bạn có thể tự xử lý ngay trên ứng dụng.",
                  },
                  {
                    icon: "🌤️",
                    title: "Cảnh báo thời tiết chủ động",
                    body: "Hệ thống tự quét radar, cảm biến và so khớp vị trí lô cây; khi phát hiện mưa đá, gió mạnh hay nắng gắt sẽ gửi cảnh báo và hướng dẫn phòng vệ.",
                  },
                ].map((card, idx) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(238,243,204,0.5) 100%)',
                      border: '1px solid rgba(209,223,182,0.5)'
                    }}
                  >
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                    <h3 className="text-[clamp(17px,2.2vw,21px)] font-bold mm-text-wrap-safe break-words" style={{ color: '#1F302F' }}>
                      {card.title}
                    </h3>
                    <p className="mm-fluid-text mt-3 text-[clamp(14px,1.6vw,16px)] mm-text-wrap-safe break-words" style={{ color: 'rgba(31,48,47,0.8)' }}>
                      {card.body}
                    </p>
                  </motion.div>
                ))}
              </div>
              <p className="mm-fluid-text max-w-4xl" style={{ color: 'rgba(36,56,51,0.8)' }}>
                Từng cuộc trò chuyện và hướng dẫn đều được gắn với mã cây, giúp
                bạn xem lại lịch sử hỗ trợ, báo cáo cho đối tác hoặc đào tạo đội
                ngũ mới chỉ với vài thao tác.
              </p>
              <div className="flex justify-end">
                <Link
                  to="/report"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ background: '#1F302F', color: '#FBFFDF' }}
                >
                  Liên hệ hỗ trợ
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main content */}
        <main id="main">{/* News */}</main>

        {/* Cookie banner */}
        {
          !cookieAccepted && (
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
          )
        }
      </div >
    </div >
  );
}