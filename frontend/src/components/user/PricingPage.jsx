import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Sparkles,
  Calendar,
  Cloud,
  Book,
  ChevronDown,
  TrendingUp,
  Zap,
  Users,
  Shield,
  CheckCircle2,
  Star,
  Lock,
  Info,
  Crown,
  Leaf,
  ArrowRight,
  BadgeCheck,
  Rocket,
  Gift,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SubscriptionPlanRepository from "@/API/repositories/SubscriptionPlanRepository";

// CSS animations and Design Tokens
const animationStyles = `
  /* ============ DESIGN TOKENS - FLUID TYPOGRAPHY ============ */
  :root {
    /* Typography - Fluid scaling from 320px to 1920px viewport */
    --font-hero: clamp(1.375rem, 2.5vw + 0.5rem, 3rem);
    --font-h2: clamp(1.125rem, 1.8vw + 0.4rem, 2rem);
    --font-h3: clamp(0.8125rem, 1vw + 0.3rem, 1.125rem);
    --font-body: clamp(0.8125rem, 0.6vw + 0.5rem, 1rem);
    --font-small: clamp(0.6875rem, 0.5vw + 0.4rem, 0.8125rem);
    --font-caption: clamp(0.625rem, 0.4vw + 0.35rem, 0.75rem);
    --font-tiny: clamp(0.5625rem, 0.35vw + 0.3rem, 0.6875rem);
    
    /* Line-heights */
    --lh-tight: 1.2;
    --lh-snug: 1.35;
    --lh-normal: 1.5;
    --lh-relaxed: 1.65;
    
    /* Spacing - Fluid */
    --space-xs: clamp(0.125rem, 0.3vw, 0.375rem);
    --space-sm: clamp(0.25rem, 0.5vw, 0.625rem);
    --space-md: clamp(0.5rem, 1vw, 1rem);
    --space-lg: clamp(0.75rem, 1.5vw, 1.5rem);
    --space-xl: clamp(1rem, 2vw, 2rem);
    --space-2xl: clamp(1.5rem, 3vw, 3rem);
    --space-section: clamp(1.5rem, 4vw, 4rem);
    
    /* Container max-widths */
    --container-sm: min(95vw, 540px);
    --container-md: min(92vw, 720px);
    --container-lg: min(90vw, 960px);
    --container-xl: min(88vw, 1140px);
    
    /* Border radius - Fluid */
    --radius-sm: clamp(0.25rem, 0.4vw, 0.5rem);
    --radius-md: clamp(0.375rem, 0.6vw, 0.75rem);
    --radius-lg: clamp(0.5rem, 1vw, 1rem);
    --radius-xl: clamp(0.75rem, 1.5vw, 1.5rem);
    
    /* Icon sizes - Fluid */
    --icon-xs: clamp(0.75rem, 0.8vw + 0.4rem, 1.125rem);
    --icon-sm: clamp(0.875rem, 1vw + 0.4rem, 1.25rem);
    --icon-md: clamp(1rem, 1.2vw + 0.5rem, 1.5rem);
    --icon-lg: clamp(1.25rem, 1.5vw + 0.5rem, 2rem);
  }

  /* ============ ANIMATIONS ============ */
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(2deg); }
  }
  
  @keyframes float-reverse {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(10px) rotate(-2deg); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.25); }
    50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
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
    50% { transform: translateY(-4px); }
  }
  
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes scale-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; }
  .animate-float-slow { animation: float 8s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
  .animate-shimmer { 
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  .animate-gradient { 
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
  }
  .animate-bounce-soft { animation: bounce-soft 2s ease-in-out infinite; }
  .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
  .animate-scale-pulse { animation: scale-pulse 3s ease-in-out infinite; }
  
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  
  .card-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  @media (min-width: 1024px) {
    .card-3d:hover {
      transform: rotateY(-2deg) rotateX(2deg) translateY(-3px);
    }
  }
  
  .shine-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }
  
  .shine-effect:hover::before {
    left: 100%;
  }
  
  /* ============ MOBILE FIRST RESPONSIVE ============ */
  
  /* Base: Mobile (< 480px) */
  .pricing-card {
    min-width: 0;
    width: 100%;
  }
  
  /* Hide decorative elements on small screens */
  @media (max-width: 639px) {
    .floating-decoration {
      display: none !important;
    }
    .bg-orb {
      opacity: 0.3 !important;
      width: 100px !important;
      height: 100px !important;
    }
  }
  
  /* Small Mobile: 480px - 639px */
  @media (min-width: 480px) and (max-width: 639px) {
    .bg-orb {
      opacity: 0.4 !important;
    }
  }
  
  /* Small tablet: 640px - 767px */
  @media (min-width: 640px) and (max-width: 767px) {
    .pricing-card {
      max-width: 320px;
      margin-left: auto;
      margin-right: auto;
    }
    .bg-orb {
      width: 120px !important;
      height: 120px !important;
    }
  }
  
  /* Tablet: 768px - 1023px */
  @media (min-width: 768px) and (max-width: 1023px) {
    .pricing-card {
      min-width: 0;
    }
    .bg-orb {
      width: 150px !important;
      height: 150px !important;
    }
  }
  
  /* Small laptop: 1024px - 1279px */
  @media (min-width: 1024px) and (max-width: 1279px) {
    .pricing-card {
      min-width: 0;
    }
    .bg-orb {
      width: 180px !important;
      height: 180px !important;
    }
  }
  
  /* Medium laptop: 1280px - 1439px */
  @media (min-width: 1280px) and (max-width: 1439px) {
    .pricing-card {
      min-width: 280px;
    }
  }
  
  /* Large screens: >= 1440px */
  @media (min-width: 1440px) {
    .pricing-card {
      min-width: 320px;
    }
  }
  
  /* Extra large: >= 1920px */
  @media (min-width: 1920px) {
    .pricing-card {
      min-width: 360px;
    }
  }
`;

export default function PricingPage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [isVisible, setIsVisible] = useState({});
  const pricingRef = useRef(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await SubscriptionPlanRepository.getPaidPlans();
        const transformedPlans = data.map((plan, index) => {
          let planDescription = "";
          let planPrice = Number(plan.price) || 0;

          if (plan.maxGardens === 1 && plan.maxTreesPerGarden === 5) {
            planDescription = "Tạo được 1 vườn và vườn 5 cây";
          } else if (plan.maxGardens === 5 && plan.maxTreesPerGarden === 5) {
            planDescription = "Tạo 5 Vườn và mỗi vườn 5 cây";
          } else if (!plan.maxGardens && !plan.maxTreesPerGarden) {
            planDescription = "Không giới hạn vườn và cây trong vườn";
          } else {
            if (plan.description) {
              planDescription = plan.description;
            } else if (index === 0) {
              planDescription = "Tạo được 1 vườn và vườn 5 cây";
            } else if (index === 1) {
              planDescription = "Tạo 5 Vườn và mỗi vườn 5 cây";
            } else {
              planDescription = "Không giới hạn vườn và cây trong vườn";
            }
          }

          const features = [];
          if (plan.features) {
            if (
              typeof plan.features === "string" &&
              plan.features.startsWith("[")
            ) {
              try {
                const parsed = JSON.parse(plan.features);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  features.push(...parsed);
                }
              } catch (error) {
                void error;
              }
            }
            if (features.length === 0) {
              const parsed = plan.features.split("\n").filter((f) => f.trim());
              if (parsed.length > 0) {
                features.push(...parsed);
              }
            }
          }

          if (features.length === 0) {
            features.push(planDescription);
          }

          // Enhanced plan styling
          const planStyles = [
            {
              gradient: "from-slate-600 via-slate-500 to-zinc-600",
              cardBg: "from-slate-900/95 via-slate-800/95 to-zinc-900/95",
              glowColor: "rgba(100, 116, 139, 0.5)",
              borderGradient: "from-slate-400 via-zinc-300 to-slate-500",
              icon: Leaf,
              iconBg: "from-slate-400 to-zinc-500",
              textGradient: "from-slate-200 to-zinc-300",
              accentColor: "#94a3b8"
            },
            {
              gradient: "from-emerald-500 via-teal-400 to-cyan-500",
              cardBg: "from-emerald-900/95 via-teal-900/95 to-cyan-900/95",
              glowColor: "rgba(16, 185, 129, 0.6)",
              borderGradient: "from-emerald-400 via-teal-300 to-cyan-400",
              icon: Star,
              iconBg: "from-emerald-400 to-teal-400",
              textGradient: "from-emerald-300 to-teal-300",
              accentColor: "#10b981"
            },
            {
              gradient: "from-amber-500 via-orange-400 to-rose-500",
              cardBg: "from-amber-900/95 via-orange-900/95 to-rose-900/95",
              glowColor: "rgba(251, 191, 36, 0.6)",
              borderGradient: "from-amber-400 via-orange-300 to-rose-400",
              icon: Crown,
              iconBg: "from-amber-400 to-orange-400",
              textGradient: "from-amber-300 to-orange-300",
              accentColor: "#fbbf24"
            },
          ];

          return {
            id: plan.planId,
            name: plan.planName,
            duration: "12 tháng",
            monthlyPrice: planPrice,
            yearlyPrice: planPrice * 12,
            popular: index === 1,
            features: features,
            buttonText: index === 0 ? "Bắt đầu" : `Đăng ký ${plan.planName}`,
            buttonVariant: "default",
            maxGardens: plan.maxGardens,
            maxTreesPerGarden: plan.maxTreesPerGarden,
            style: planStyles[index] || planStyles[0],
          };
        });
        setPlans(transformedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        const subscription =
          await SubscriptionPlanRepository.getCurrentUserSubscription();
        if (subscription) {
          setCurrentSubscription(subscription);
        }
      } catch (error) {
        console.error("Error fetching current subscription:", error);
      }
    };
    fetchCurrentSubscription();
  }, []);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const getPlanTier = (plan) => {
    // Nếu plan là object rỗng hoặc không có id (gói Free), trả về tier 0
    if (!plan || !plan.id) {
      return 0;
    }
    if (!plan.maxGardens && !plan.maxTreesPerGarden) {
      return 3;
    } else if (plan.maxGardens === 5) {
      return 2;
    } else if (plan.maxGardens === 1) {
      return 1;
    }
    return plan.maxGardens || 0;
  };

  const isPlanDisabled = (plan) => {
    if (!currentSubscription) return false;
    const currentPlanTier = getPlanTier(
      plans.find((p) => p.id === currentSubscription.planId) || {}
    );
    const planTier = getPlanTier(plan);
    return planTier <= currentPlanTier;
  };

  const handleSelectPlan = (plan) => {
    if (isPlanDisabled(plan)) {
      return;
    }
    navigate("/checkout", {
      state: {
        planId: plan.id,
        planName: plan.name,
        price: plan.monthlyPrice,
        isYearly: false,
      },
    });
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN");
  };

  const features = [
    {
      icon: Sparkles,
      title: "Trợ lý AI – Người bạn đồng hành",
      description:
        "AI Mầm Mới phân tích từng giai đoạn sinh trưởng của cây, tự động đề xuất lịch chăm sóc hợp lý.",
      highlight: "Powered by Gemini AI",
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/20 to-purple-600/20",
    },
    {
      icon: Calendar,
      title: "Nhắc việc thông minh",
      description:
        "Hệ thống tự động tính toán và nhắc nhở đúng thời điểm. Kết hợp dự báo thời tiết 72 giờ.",
      highlight: "Kết nối thời tiết thực",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Cloud,
      title: "Cảnh báo thời tiết",
      description:
        "Cảnh báo sớm mưa lớn, gió mạnh, nắng hạn theo vị trí vườn của bạn.",
      highlight: "Theo vị trí chính xác",
      gradient: "from-sky-500 to-blue-600",
      bgGradient: "from-sky-500/20 to-blue-600/20",
    },
    {
      icon: Book,
      title: "Nhật ký số chuyên nghiệp",
      description:
        "Mọi hoạt động chăm sóc được ghi chép tự động. Xuất báo cáo chi tiết 1 chạm.",
      highlight: "Xuất báo cáo nhanh",
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-500/20 to-green-600/20",
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Tăng năng suất 20-30%",
      description: "Chăm sóc đúng cách, đúng lúc giúp cây phát triển khỏe mạnh.",
      gradient: "from-green-400 to-emerald-500",
    },
    {
      icon: Zap,
      title: "Tiết kiệm 40% thời gian",
      description: "Không cần nhớ lịch, không cần tính toán – AI làm hết.",
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      icon: Users,
      title: "Dễ dàng mở rộng",
      description: "Quản lý từ vài cây đến hàng trăm cây trong nhiều vườn.",
      gradient: "from-blue-400 to-indigo-500",
    },
    {
      icon: Shield,
      title: "Giảm rủi ro thất thu",
      description: "Cảnh báo thời tiết và lịch chăm sóc khoa học.",
      gradient: "from-purple-400 to-pink-500",
    },
  ];

  const faqs = [
    {
      question: "Mầm Mới hoạt động trên nền tảng nào?",
      answer:
        "Mầm Mới là hệ thống quản lý vườn cây trực tuyến, hoạt động hoàn toàn trên nền tảng web. Bạn có thể truy cập từ máy tính, laptop, tablet hoặc điện thoại thông qua trình duyệt web (Chrome, Safari, Firefox, Edge).",
    },
    {
      question: "Tôi có thể dùng thử trước khi mua gói trả phí không?",
      answer:
        "Có! Khi đăng ký tài khoản mới, bạn sẽ được dùng thử miễn phí trong 1 tháng với đầy đủ tính năng. Sau đó bạn có thể chọn gói phù hợp để tiếp tục sử dụng.",
    },
    {
      question: "Tại sao tôi không thể chọn một số gói?",
      answer:
        "Nếu bạn đã đăng ký một gói, bạn chỉ có thể nâng cấp lên gói cao hơn. Các gói thấp hơn hoặc bằng gói hiện tại sẽ bị khóa. Điều này giúp bạn luôn có trải nghiệm tốt hơn khi nâng cấp.",
    },
    {
      question: "Dữ liệu vườn cây của tôi có bị mất không?",
      answer:
        "Không! Tất cả dữ liệu của bạn được lưu trữ an toàn trên máy chủ đám mây. Ngay cả khi bạn tạm ngưng đăng ký, dữ liệu vẫn được giữ nguyên khi bạn quay lại.",
    },
    {
      question: "Gói có tự động gia hạn không?",
      answer:
        "Không, gói sẽ không tự động gia hạn. Bạn cần phải thanh toán lại để tiếp tục sử dụng.",
    },
    {
      question: "Có hỗ trợ thanh toán bằng cách nào?",
      answer:
        "Hiện tại chúng tôi hỗ trợ thanh toán qua quét mã QR. Sau khi thanh toán thành công, gói sẽ được kích hoạt ngay lập tức.",
    },
  ];

  return (
    <>
      <style>{animationStyles}</style>
      <div className="mm-fluid-page min-h-screen overflow-hidden">
        {/* Hero Section - Using Mầm Mới Brand Colors */}
        <div
          className="relative overflow-hidden min-h-[40vh] sm:min-h-[45vh] md:min-h-[50vh] lg:min-h-[55vh] xl:min-h-[60vh] flex items-center"
          style={{ background: 'linear-gradient(135deg, #1F302F 0%, #2a4a48 50%, #1F302F 100%)' }}
        >
          {/* Animated Background Orbs - Hidden on mobile, smaller on tablet */}
          <div className="absolute inset-0 overflow-hidden hidden sm:block">
            <div className="absolute top-10 left-10 w-32 md:w-48 lg:w-56 xl:w-72 h-32 md:h-48 lg:h-56 xl:h-72 rounded-full blur-3xl animate-float opacity-40" style={{ background: 'radial-gradient(circle, rgba(209,223,182,0.25) 0%, transparent 70%)' }} />
            <div className="absolute bottom-10 right-10 w-40 md:w-56 lg:w-72 xl:w-96 h-40 md:h-56 lg:h-72 xl:h-96 rounded-full blur-3xl animate-float-reverse opacity-35" style={{ background: 'radial-gradient(circle, rgba(255,255,165,0.2) 0%, transparent 70%)' }} />
          </div>

          {/* Floating Nature Icons - Hidden on tablet and below */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
            {/* Leaf icon - top left */}
            <div className="absolute top-16 left-[8%] animate-float opacity-30">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1DFB6" strokeWidth="1.5">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>

            {/* Water drop - top right */}
            <div className="absolute top-24 right-[12%] animate-float-reverse opacity-25">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FBFFDF" strokeWidth="1.5">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>

            {/* Sprout/Seedling - bottom left */}
            <div className="absolute bottom-28 left-[18%] animate-bounce-soft opacity-30">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1DFB6" strokeWidth="1.5">
                <path d="M7 20h10" />
                <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8Z" />
              </svg>
            </div>

            {/* Small leaf - bottom right */}
            <div className="absolute bottom-20 right-[22%] animate-float opacity-25">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1DFB6" strokeWidth="1.5">
                <path d="M6.5 12C6.5 12 10 6 18.5 2.5c0 0-1.5 9.5-7 12.5-3 1.7-6.5 1-6.5 1" />
                <path d="M6.5 16.5c.5-2 1.5-3.5 3.5-5" />
              </svg>
            </div>
          </div>

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto" style={{ padding: 'var(--space-section) var(--space-md)' }}>
            <div style={{ maxWidth: 'var(--container-lg)', margin: '0 auto', textAlign: 'center' }}>
              {/* Animated Badge */}
              <div
                className="inline-flex items-center bg-white/15 backdrop-blur-md rounded-full border border-white/25 animate-bounce-soft"
                style={{ gap: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)', marginBottom: 'var(--space-lg)' }}
              >
                <Sparkles style={{ width: 'var(--icon-sm)', height: 'var(--icon-sm)' }} className="text-yellow-300" />
                <span className="text-white font-semibold" style={{ fontSize: 'var(--font-small)' }}>Công nghệ AI tiên tiến nhất</span>
              </div>

              <h1 className="font-black drop-shadow-lg" style={{ fontSize: 'var(--font-hero)', lineHeight: 'var(--lh-tight)', marginBottom: 'var(--space-lg)' }}>
                <span style={{ color: '#FBFFDF' }}>Chăm Vườn </span>
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text animate-gradient" style={{ backgroundImage: 'linear-gradient(to right, #FFFFA5, #D1DFB6, #FFFFA5)' }}>
                    Thông Minh
                  </span>
                </span>
                <br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #FBFFDF, #D1DFB6, #FBFFDF)' }}>
                  Thu Hoạch Bội Thu
                </span>
              </h1>

              <p className="text-white/85 font-light" style={{ fontSize: 'var(--font-body)', lineHeight: 'var(--lh-relaxed)', maxWidth: 'var(--container-md)', margin: '0 auto', marginBottom: 'var(--space-xl)', padding: '0 var(--space-sm)' }}>
                Quản lý vườn cây chuyên nghiệp với trợ lý AI thông minh,
                cảnh báo thời tiết real-time và nhật ký số hoàn chỉnh
              </p>

              {/* Trust Badges with Animation */}
              <div className="flex flex-wrap items-center justify-center" style={{ gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', padding: '0 var(--space-sm)' }}>
                {[
                  { icon: Gift, text: "Dùng thử miễn phí 1 tháng", color: "text-yellow-300" },
                  { icon: Shield, text: "Bảo mật dữ liệu 100%", color: "text-blue-300" },
                  { icon: Zap, text: "Hỗ trợ 24/7", color: "text-green-300" },
                ].map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
                    style={{ gap: 'var(--space-xs)', padding: 'var(--space-xs) var(--space-md)' }}
                  >
                    <badge.icon className={badge.color} style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)' }} />
                    <span className="text-white/90 font-medium" style={{ fontSize: 'var(--font-caption)' }}>{badge.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button with Brand Colors */}
              <Button
                size="lg"
                className="relative font-bold px-6 py-4 md:px-8 md:py-5 lg:px-10 lg:py-7 text-sm md:text-base lg:text-lg rounded-xl md:rounded-2xl shadow-2xl hover:scale-105 md:hover:scale-110 transition-all duration-500 group overflow-hidden"
                style={{
                  background: '#FFFFA5',
                  color: '#1F302F',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)'
                }}
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Xem bảng giá ngay
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to right, #D1DFB6, #FBFFDF)' }} />
              </Button>
            </div>
          </div>

          {/* Smooth gradient fade into Pricing section */}
          <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to bottom, transparent 0%, #1F302F 100%)' }} />
        </div>

        {/* ============ PRICING SECTION - FLOWS FROM HERO ============ */}
        <div
          id="pricing"
          ref={pricingRef}
          className="relative py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1F302F 0%, #243833 30%, #2a4a48 50%, #243833 70%, #1F302F 100%)'
          }}
        >
          {/* Animated Background Effects - Brand Colors */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Subtle glow orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20">
              <div className="w-full h-full rounded-full blur-3xl animate-scale-pulse" style={{ background: 'radial-gradient(circle, rgba(209,223,182,0.4) 0%, transparent 60%)' }} />
            </div>

            {/* Floating orbs - Brand colors */}
            <div className="absolute top-20 left-10 w-48 h-48 rounded-full blur-3xl animate-float" style={{ background: 'rgba(209,223,182,0.15)' }} />
            <div className="absolute bottom-20 right-10 w-56 h-56 rounded-full blur-3xl animate-float-reverse" style={{ background: 'rgba(255,255,165,0.12)' }} />
            <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full blur-3xl animate-float-slow" style={{ background: 'rgba(251,255,223,0.1)' }} />
          </div>

          {/* Grid Overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(209,223,182,0.5) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />

          <div className="relative z-10 container mx-auto" style={{ padding: '0 var(--space-md)' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              {/* Section Header - Brand Colors */}
              <div className="text-center" style={{ marginBottom: 'var(--space-section)' }} data-animate id="pricing-header">
                <div
                  className="inline-flex items-center rounded-full border animate-bounce-soft"
                  style={{ gap: 'var(--space-xs)', padding: 'var(--space-xs) var(--space-md)', marginBottom: 'var(--space-md)', background: 'rgba(209,223,182,0.15)', borderColor: 'rgba(209,223,182,0.25)' }}
                >
                  <Crown style={{ width: 'var(--icon-sm)', height: 'var(--icon-sm)', color: '#FFFFA5' }} />
                  <span style={{ color: '#D1DFB6', fontSize: 'var(--font-caption)' }} className="font-semibold">Lựa chọn linh hoạt cho mọi quy mô</span>
                </div>

                <h2 className="font-black" style={{ fontSize: 'var(--font-h2)', lineHeight: 'var(--lh-tight)', marginBottom: 'var(--space-sm)' }}>
                  <span style={{ color: '#FBFFDF' }}>Chọn Gói </span>
                  <span className="animate-gradient" style={{ color: '#FFFFA5' }}>
                    Phù Hợp
                  </span>
                  <span style={{ color: '#FBFFDF' }}> Với Bạn</span>
                </h2>

                <p style={{ color: 'rgba(209,223,182,0.75)', fontSize: 'var(--font-body)', maxWidth: 'var(--container-md)', margin: '0 auto', lineHeight: 'var(--lh-relaxed)' }}>
                  Từ vườn nhỏ gia đình đến trang trại lớn, Mầm Mới có giải pháp tối ưu dành riêng cho bạn
                </p>
              </div>

              {/* ============ PRICING CARDS ============ */}
              <div
                className="grid grid-cols-1 md:grid-cols-3"
                style={{
                  gap: 'var(--space-xl)',
                  marginBottom: 'var(--space-section)'
                }}
              >
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="relative rounded-3xl overflow-hidden animate-pulse">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800" />
                      <div className="relative p-8">
                        <div className="h-12 bg-gray-600 rounded-xl w-1/2 mb-6" />
                        <div className="h-16 bg-gray-600 rounded-xl w-2/3 mb-8" />
                        <div className="space-y-4">
                          <div className="h-4 bg-gray-600 rounded" />
                          <div className="h-4 bg-gray-600 rounded" />
                          <div className="h-4 bg-gray-600 rounded w-3/4" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  plans.map((plan, index) => {
                    const isCurrentPlan =
                      currentSubscription && currentSubscription.planId === plan.id;
                    const currentPlanTier = currentSubscription
                      ? getPlanTier(
                        plans.find((p) => p.id === currentSubscription.planId) || {}
                      )
                      : 0;
                    const planTier = getPlanTier(plan);
                    const isLowerOrCurrent = planTier <= currentPlanTier;
                    const PlanIcon = plan.style?.icon || Star;

                    const isLowerTier = !isCurrentPlan && isLowerOrCurrent;

                    return (
                      <div
                        key={plan.id}
                        className={`relative group animate-fade-in-up pricing-card`}
                        style={{
                          animationDelay: `${index * 0.15}s`,
                          opacity: 0,
                          minWidth: '0'
                        }}
                        data-animate
                        id={`plan-${index}`}
                      >
                        {/* Current Plan Badge */}
                        {isCurrentPlan && (
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30">
                            <div className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/50 border-2 border-white/30">
                              <CheckCircle2 className="w-5 h-5 fill-white" />
                              ⭐ Gói hiện tại của bạn
                            </div>
                          </div>
                        )}

                        {/* Lower Tier Badge */}
                        {isLowerTier && (
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30">
                            <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-gray-200 text-sm font-semibold rounded-full shadow-lg border border-gray-500">
                              <Lock className="w-4 h-4" />
                              Gói thấp hơn - Không khả dụng
                            </div>
                          </div>
                        )}

                        {/* Popular Badge */}
                        {plan.popular && !isLowerOrCurrent && (
                          <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-30">
                            <div className="relative">
                              <div className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-white text-sm font-bold rounded-full shadow-lg shadow-emerald-500/50 animate-pulse-glow">
                                <Star className="w-4 h-4 fill-white" />
                                🔥 Phổ biến nhất
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Card Container with Glow Effect */}
                        <div
                          className={`relative h-full transition-all duration-500 card-3d ${plan.popular && !isLowerOrCurrent ? 'md:-mt-8 md:mb-8' : ''} ${isLowerOrCurrent ? 'grayscale-[30%]' : ''}`}
                          style={{
                            filter: plan.popular && !isLowerOrCurrent ? `drop-shadow(0 0 30px ${plan.style?.glowColor})` : isLowerOrCurrent ? 'brightness(0.7)' : 'none'
                          }}
                        >
                          {/* Locked Overlay for disabled plans */}
                          {isLowerOrCurrent && (
                            <div className="absolute inset-0 z-20 rounded-[28px] bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gray-600 shadow-2xl text-center max-w-[80%]">
                                {isCurrentPlan ? (
                                  <>
                                    <CheckCircle2 className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                                    <p className="text-white font-bold text-lg mb-1">Đang sử dụng</p>
                                    <p className="text-gray-400 text-sm">Đây là gói bạn đang dùng</p>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                    <p className="text-white font-bold text-lg mb-1">Không khả dụng</p>
                                    <p className="text-gray-400 text-sm">Gói này thấp hơn gói hiện tại.<br />Chỉ có thể nâng cấp lên gói cao hơn.</p>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Animated Border Gradient */}
                          <div className={`absolute -inset-[2px] bg-gradient-to-br ${plan.style?.borderGradient} rounded-[--radius-xl] opacity-100 group-hover:opacity-100 transition-opacity duration-500 animate-gradient`} />

                          {/* Card Inner - Fluid Responsive */}
                          <div
                            className={`relative h-full bg-gradient-to-br ${plan.style?.cardBg} backdrop-blur-xl flex flex-col overflow-hidden shine-effect`}
                            style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)' }}
                          >
                            {/* Shimmer Effect Overlay */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute inset-0 animate-shimmer" />
                            </div>

                            {/* Plan Header - Centered */}
                            <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                              {/* Plan Icon with Glow */}
                              <div style={{ marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'center' }}>
                                <div
                                  className={`inline-flex items-center justify-center bg-gradient-to-br ${plan.style?.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                  style={{ width: 'clamp(3rem, 5vw, 4rem)', height: 'clamp(3rem, 5vw, 4rem)', borderRadius: 'var(--radius-lg)', boxShadow: `0 12px 32px ${plan.style?.glowColor}` }}
                                >
                                  <PlanIcon className="text-white" style={{ width: 'clamp(1.5rem, 2.5vw, 2rem)', height: 'clamp(1.5rem, 2.5vw, 2rem)' }} />
                                </div>
                              </div>

                              {/* Plan Name */}
                              <h3
                                className={`font-bold text-transparent bg-clip-text bg-gradient-to-r ${plan.style?.textGradient}`}
                                style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', lineHeight: 'var(--lh-snug)', marginBottom: 'var(--space-xs)' }}
                              >
                                {plan.name}
                              </h3>
                              <p style={{ fontSize: 'var(--font-small)', marginBottom: 'var(--space-md)', color: 'rgba(255,255,255,0.85)' }}>
                                {plan.features[0]}
                              </p>

                              {/* Price with Animation */}
                              <div style={{ marginBottom: '0' }}>
                                <div className="flex flex-wrap items-baseline justify-center" style={{ gap: 'var(--space-xs)' }}>
                                  <span
                                    className={`font-black text-transparent bg-clip-text bg-gradient-to-r ${plan.style?.textGradient}`}
                                    style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 'var(--lh-tight)' }}
                                  >
                                    {formatPrice(plan.monthlyPrice)}đ
                                  </span>
                                  <span style={{ fontSize: 'var(--font-body)', color: 'rgba(255,255,255,0.7)' }}>/tháng</span>
                                </div>
                              </div>
                            </div>

                            {/* Features List */}
                            <div className="flex-1" style={{ marginBottom: 'var(--space-lg)' }}>
                              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {plan.features && plan.features.length > 0 ? (
                                  plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start group/item" style={{ gap: 'var(--space-sm)' }}>
                                      <div
                                        className={`flex-shrink-0 rounded-full bg-gradient-to-br ${plan.style?.gradient} flex items-center justify-center group-hover/item:scale-105 transition-transform`}
                                        style={{ width: 'var(--icon-sm)', height: 'var(--icon-sm)' }}
                                      >
                                        <Check className="text-white" style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)' }} />
                                      </div>
                                      <span className="group-hover/item:text-white transition-colors" style={{ fontSize: 'var(--font-caption)', lineHeight: 'var(--lh-normal)', color: 'rgba(255,255,255,0.9)' }}>
                                        {feature}
                                      </span>
                                    </li>
                                  ))
                                ) : (
                                  <>
                                    <li className="flex items-start gap-2 md:gap-3">
                                      <div className={`flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br ${plan.style?.gradient} flex items-center justify-center`}>
                                        <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                                      </div>
                                      <span className="text-gray-300 text-xs md:text-sm">
                                        {plan.maxGardens
                                          ? `Tối đa ${plan.maxGardens} vườn`
                                          : "Không giới hạn vườn"}
                                      </span>
                                    </li>
                                    <li className="flex items-start gap-2 md:gap-3">
                                      <div className={`flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br ${plan.style?.gradient} flex items-center justify-center`}>
                                        <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                                      </div>
                                      <span className="text-gray-300 text-xs md:text-sm">
                                        {plan.maxTreesPerGarden
                                          ? `Tối đa ${plan.maxTreesPerGarden} cây/vườn`
                                          : "Không giới hạn cây"}
                                      </span>
                                    </li>
                                  </>
                                )}
                              </ul>
                            </div>

                            {/* CTA Button */}
                            <div className="relative">
                              <Button
                                className={`w-full py-4 md:py-5 lg:py-6 xl:py-7 text-xs md:text-sm lg:text-base xl:text-lg font-bold rounded-lg md:rounded-xl transition-all duration-300 relative overflow-hidden group/btn ${plan.popular
                                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white shadow-xl shadow-emerald-500/40'
                                  : `bg-gradient-to-r ${plan.style?.gradient} text-white shadow-lg`
                                  } ${isLowerOrCurrent ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl'}`}
                                size="lg"
                                onClick={() => handleSelectPlan(plan)}
                                disabled={isLowerOrCurrent}
                              >
                                <span className="relative z-10 flex items-center justify-center gap-1.5 md:gap-2">
                                  {isCurrentPlan ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                                      Đang sử dụng
                                    </>
                                  ) : (
                                    <>
                                      {plan.buttonText}
                                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                  )}
                                </span>
                                {!isLowerOrCurrent && (
                                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                                )}
                              </Button>

                              {!isLowerOrCurrent && (
                                <span style={{ fontSize: 'var(--font-small)', color: 'rgba(255,255,255,0.7)' }}>
                                  ✓ Giá đã bao gồm VAT • Kích hoạt ngay
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Trust Section */}
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 lg:gap-6 xl:gap-8 pt-6 md:pt-8 lg:pt-10 xl:pt-12 border-t border-white/10">
                {[
                  { icon: Shield, text: "Thanh toán an toàn", color: "text-emerald-400" },
                  { icon: BadgeCheck, text: "Hủy bất cứ lúc nào", color: "text-blue-400" },
                  { icon: Zap, text: "Kích hoạt tức thì", color: "text-amber-400" },
                  { icon: Rocket, text: "Nâng cấp dễ dàng", color: "text-purple-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 md:gap-2 text-gray-400 hover:text-white transition-colors group">
                    <item.icon className={`w-4 h-4 md:w-5 md:h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs md:text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section - Light Gradient */}
        <div className="relative z-10 overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8faf5 100%)', padding: 'var(--space-section) 0' }}>
          {/* Background Effects - Hidden on small screens */}
          <div className="absolute inset-0 hidden md:block">
            <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #D1DFB6, #FFFFA5, #D1DFB6, transparent)' }} />
          </div>

          <div className="relative container mx-auto" style={{ padding: '0 var(--space-md)' }}>
            <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto' }}>
              {/* Section Header */}
              <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
                <div
                  className="inline-flex items-center rounded-full border backdrop-blur-sm"
                  style={{ gap: 'var(--space-xs)', padding: 'var(--space-xs) var(--space-md)', marginBottom: 'var(--space-md)', background: 'linear-gradient(135deg, rgba(255,200,100,0.12) 0%, rgba(100,200,180,0.08) 100%)', borderColor: 'rgba(31,48,47,0.08)' }}
                >
                  <TrendingUp style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)', color: '#e67e22' }} />
                  <span style={{ color: '#1F302F', fontSize: 'var(--font-caption)' }} className="font-semibold">Lợi ích nổi bật</span>
                </div>

                <h2 className="font-black" style={{ fontSize: 'var(--font-h2)', lineHeight: 'var(--lh-tight)', marginBottom: 'var(--space-sm)' }}>
                  <span style={{ color: '#1F302F' }}>Tại Sao Chọn </span>
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #e67e22 0%, #f39c12 50%, #27ae60 100%)' }}>Mầm Mới?</span>
                </h2>

                <p style={{ color: 'rgba(31,48,47,0.65)', fontSize: 'var(--font-small)', maxWidth: 'var(--container-sm)', margin: '0 auto' }}>
                  Công nghệ AI tiên tiến giúp bạn chăm vườn hiệu quả hơn
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-sm)' }}>
                {benefits.map((benefit, index) => {
                  const accentColors = [
                    { bg: 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)' },
                    { bg: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)' },
                    { bg: 'linear-gradient(135deg, #3498db 0%, #5dade2 100%)' },
                    { bg: 'linear-gradient(135deg, #9b59b6 0%, #a569bd 100%)' },
                  ];
                  const accent = accentColors[index % accentColors.length];

                  return (
                    <div
                      key={index}
                      className="group relative bg-white border shadow-sm hover:shadow-md transition-all duration-200"
                      style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', borderColor: 'rgba(0,0,0,0.04)' }}
                    >
                      {/* Card top accent line */}
                      <div className="absolute top-0 left-2 right-2 h-0.5 rounded-b-full opacity-75" style={{ background: accent.bg }} />

                      <div className="relative" style={{ paddingTop: 'var(--space-xs)' }}>
                        <div
                          className="inline-flex items-center justify-center shadow-sm"
                          style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', background: accent.bg, borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-sm)' }}
                        >
                          <benefit.icon className="text-white" style={{ width: 'var(--icon-sm)', height: 'var(--icon-sm)' }} />
                        </div>
                        <h3 className="font-semibold" style={{ color: '#1F302F', fontSize: 'var(--font-small)', lineHeight: 'var(--lh-snug)', marginBottom: 'var(--space-xs)' }}>
                          {benefit.title}
                        </h3>
                        <p style={{ color: 'rgba(31,48,47,0.55)', fontSize: 'var(--font-caption)', lineHeight: 'var(--lh-normal)' }}>
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - Dark Premium */}
        <div className="relative z-10 overflow-hidden" style={{ background: 'linear-gradient(180deg, #1F302F 0%, #243833 50%, #1a2a28 100%)', padding: 'var(--space-section) 0' }}>
          {/* Background Decorations - Hidden on mobile */}
          <div className="absolute inset-0 overflow-hidden hidden md:block">
            <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #FFFFA5, #D1DFB6, #FFFFA5, transparent)' }} />
          </div>

          <div className="relative container mx-auto" style={{ padding: '0 var(--space-md)' }}>
            <div style={{ maxWidth: 'var(--container-xl)', margin: '0 auto' }}>
              {/* Section Header */}
              <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
                <div
                  className="inline-flex items-center rounded-full border backdrop-blur-sm"
                  style={{ gap: 'var(--space-xs)', padding: 'var(--space-xs) var(--space-md)', marginBottom: 'var(--space-md)', background: 'rgba(255,255,165,0.08)', borderColor: 'rgba(255,255,165,0.2)' }}
                >
                  <Sparkles style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)', color: '#FFFFA5' }} />
                  <span style={{ color: '#D1DFB6', fontSize: 'var(--font-caption)' }} className="font-semibold">Tính năng mạnh mẽ</span>
                </div>

                <h2 className="font-black" style={{ fontSize: 'var(--font-h2)', lineHeight: 'var(--lh-tight)', marginBottom: 'var(--space-sm)' }}>
                  <span style={{ color: '#FBFFDF' }}>Tính Năng </span>
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #FFFFA5 0%, #f39c12 50%, #e67e22 100%)' }}>Nổi Bật</span>
                </h2>

                <p style={{ color: 'rgba(209,223,182,0.7)', fontSize: 'var(--font-small)', maxWidth: 'var(--container-sm)', margin: '0 auto' }}>
                  Công nghệ hiện đại giúp bạn chăm vườn dễ dàng và hiệu quả hơn
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 'var(--space-sm)' }}>
                {features.map((feature, index) => {
                  const featureColors = [
                    { bg: 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)', badge: '#e67e22' },
                    { bg: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', badge: '#27ae60' },
                    { bg: 'linear-gradient(135deg, #3498db 0%, #5dade2 100%)', badge: '#3498db' },
                    { bg: 'linear-gradient(135deg, #9b59b6 0%, #a569bd 100%)', badge: '#9b59b6' },
                  ];
                  const accent = featureColors[index % featureColors.length];

                  return (
                    <div
                      key={index}
                      className="group relative flex items-start border shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm"
                      style={{
                        gap: 'var(--space-md)',
                        padding: 'var(--space-lg)',
                        borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        borderColor: 'rgba(209,223,182,0.1)'
                      }}
                    >
                      {/* Side accent */}
                      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full" style={{ background: accent.bg }} />

                      {/* Feature Icon */}
                      <div className="flex-shrink-0" style={{ paddingLeft: 'var(--space-xs)' }}>
                        <div
                          className="flex items-center justify-center shadow-sm"
                          style={{ width: 'var(--icon-lg)', height: 'var(--icon-lg)', background: accent.bg, borderRadius: 'var(--radius-md)' }}
                        >
                          <feature.icon className="text-white" style={{ width: 'var(--icon-sm)', height: 'var(--icon-sm)' }} />
                        </div>
                      </div>

                      {/* Feature Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold" style={{ color: '#FBFFDF', fontSize: 'var(--font-h3)', lineHeight: 'var(--lh-snug)', marginBottom: 'var(--space-xs)' }}>
                          {feature.title}
                        </h3>
                        <p style={{ color: 'rgba(209,223,182,0.65)', fontSize: 'var(--font-caption)', lineHeight: 'var(--lh-normal)', marginBottom: 'var(--space-sm)' }}>
                          {feature.description}
                        </p>
                        <div
                          className="inline-flex items-center rounded-full shadow-sm"
                          style={{ gap: 'var(--space-xs)', padding: 'var(--space-xs) var(--space-md)', background: accent.bg }}
                        >
                          <Zap className="text-white" style={{ width: 'var(--icon-xs)', height: 'var(--icon-xs)' }} />
                          <span className="font-semibold text-white" style={{ fontSize: 'var(--font-tiny)' }}>{feature.highlight}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section - Light & Warm */}
        <div className="relative z-10 py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fef9e7 50%, #fdf6e3 100%)' }}>
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, #e67e22, #f39c12, #e67e22, transparent)' }} />
            <div className="absolute top-20 right-[15%] w-40 md:w-52 lg:w-64 h-40 md:h-52 lg:h-64 rounded-full blur-3xl animate-float opacity-50" style={{ background: 'radial-gradient(circle, rgba(230,126,34,0.2) 0%, transparent 70%)' }} />
            <div className="absolute bottom-20 left-[15%] w-48 md:w-60 lg:w-72 h-48 md:h-60 lg:h-72 rounded-full blur-3xl animate-float-reverse opacity-40" style={{ background: 'radial-gradient(circle, rgba(39,174,96,0.2) 0%, transparent 70%)' }} />
          </div>

          <div className="relative container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-6 md:mb-8 lg:mb-10 xl:mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 lg:px-6 lg:py-3 rounded-full border mb-4 md:mb-5 lg:mb-6" style={{ background: 'linear-gradient(135deg, rgba(230,126,34,0.1) 0%, rgba(243,156,18,0.1) 100%)', borderColor: 'rgba(230,126,34,0.2)' }}>
                  <Book className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#e67e22' }} />
                  <span style={{ color: '#1F302F' }} className="font-semibold text-xs md:text-sm lg:text-base">Câu hỏi thường gặp</span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2 md:mb-3 lg:mb-4" style={{ color: '#1F302F' }}>
                  Giải Đáp <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)' }}>Thắc Mắc</span>
                </h2>

                <p style={{ color: 'rgba(31,48,47,0.7)' }} className="text-sm md:text-base">
                  Những câu hỏi phổ biến về Mầm Mới
                </p>
              </div>

              {/* FAQ Accordion */}
              <div className="space-y-2 md:space-y-3 lg:space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className={`group rounded-xl md:rounded-2xl border transition-all duration-300 overflow-hidden shadow-md md:shadow-lg hover:shadow-xl ${expandedFaq === index
                      ? 'border-orange-200'
                      : 'border-gray-100 hover:border-orange-100'
                      }`}
                    style={{ background: expandedFaq === index ? 'linear-gradient(135deg, #fff9f0 0%, #fff5e6 100%)' : '#ffffff' }}
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-4 md:p-5 lg:p-6 text-left transition-colors"
                    >
                      <span className={`font-semibold pr-3 md:pr-4 text-sm md:text-base transition-colors ${expandedFaq === index ? 'text-[#1F302F]' : 'text-[#1F302F] group-hover:text-[#e67e22]'
                        }`}>
                        {faq.question}
                      </span>
                      <div className={`flex-shrink-0 w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${expandedFaq === index
                        ? 'rotate-180'
                        : ''
                        }`}
                        style={{ background: expandedFaq === index ? 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)' : 'rgba(230,126,34,0.1)' }}
                      >
                        <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${expandedFaq === index ? 'text-white' : 'text-[#e67e22]'
                          }`} />
                      </div>
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 ${expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="px-4 pb-4 md:px-5 md:pb-5 lg:px-6 lg:pb-6 leading-relaxed border-t pt-3 md:pt-4 text-sm md:text-base" style={{ color: 'rgba(31,48,47,0.7)', borderColor: 'rgba(230,126,34,0.15)' }}>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact CTA */}
              <div className="mt-8 md:mt-10 lg:mt-12 xl:mt-16 text-center p-5 md:p-6 lg:p-8 xl:p-10 rounded-xl md:rounded-2xl lg:rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg md:shadow-xl lg:shadow-2xl shadow-purple-500/30 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />

                <div className="relative">
                  <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2 md:mb-3">
                    Vẫn còn thắc mắc?
                  </h3>
                  <p className="text-white/80 mb-4 md:mb-5 lg:mb-6 text-sm md:text-base lg:text-lg">
                    Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp đỡ bạn 24/7
                  </p>
                  <Button
                    className="bg-white text-purple-700 hover:bg-white/90 font-bold px-5 py-3 md:px-6 md:py-4 lg:px-8 lg:py-6 text-sm md:text-base lg:text-lg rounded-lg md:rounded-xl shadow-lg md:shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    size="lg"
                    onClick={() => navigate("/report")}
                  >
                    <span className="flex items-center gap-1.5 md:gap-2">
                      Liên hệ hỗ trợ ngay
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </>
  );
}