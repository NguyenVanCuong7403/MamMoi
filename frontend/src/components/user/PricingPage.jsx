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

// CSS animations as inline styles
const animationStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  
  @keyframes float-reverse {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(20px) rotate(-5deg); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
    50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8), 0 0 60px rgba(16, 185, 129, 0.4); }
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
    50% { transform: translateY(-10px); }
  }
  
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes scale-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; }
  .animate-float-slow { animation: float 8s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
  .animate-shimmer { 
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  .animate-gradient { 
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
  }
  .animate-bounce-soft { animation: bounce-soft 2s ease-in-out infinite; }
  .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
  .animate-rotate-slow { animation: rotate-slow 20s linear infinite; }
  .animate-scale-pulse { animation: scale-pulse 3s ease-in-out infinite; }
  
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .delay-400 { animation-delay: 0.4s; }
  .delay-500 { animation-delay: 0.5s; }
  
  .card-3d {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .card-3d:hover {
    transform: rotateY(-5deg) rotateX(5deg) translateY(-10px);
  }
  
  .shine-effect::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }
  
  .shine-effect:hover::before {
    left: 100%;
  }
  
  /* Fluid typography for prices */
  .price-text {
    font-size: clamp(1.5rem, 4vw, 3.5rem);
    line-height: 1.1;
    word-break: break-word;
  }
  
  /* Pricing card min-width */
  .pricing-card {
    min-width: 280px;
  }
  
  @media (min-width: 768px) {
    .pricing-card {
      min-width: 320px;
    }
  }
  
  @media (min-width: 1280px) {
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
      question: "Tôi có thể hủy hoặc đổi gói đăng ký không?",
      answer:
        "Có, bạn có thể hủy đăng ký hoặc nâng cấp lên gói cao hơn bất cứ lúc nào. Khi hủy, bạn vẫn sử dụng được dịch vụ đến hết kỳ thanh toán hiện tại.",
    },
    {
      question: "Có hỗ trợ thanh toán bằng cách nào?",
      answer:
        "Hiện tại chúng tôi hỗ trợ thanh toán qua VNPay (quét mã QR, thẻ ATM nội địa, thẻ quốc tế Visa/Mastercard). Sau khi thanh toán thành công, gói sẽ được kích hoạt ngay lập tức.",
    },
  ];

  return (
    <>
      <style>{animationStyles}</style>
      <div className="mm-fluid-page min-h-screen overflow-hidden">
        {/* Hero Section - Using Mầm Mới Brand Colors */}
        <div
          className="relative overflow-hidden min-h-[60vh] flex items-center"
          style={{ background: 'linear-gradient(135deg, #1F302F 0%, #2a4a48 50%, #1F302F 100%)' }}
        >
          {/* Animated Background Orbs - Brand Colors */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl animate-float" style={{ background: 'radial-gradient(circle, rgba(209,223,182,0.3) 0%, transparent 70%)' }} />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl animate-float-reverse" style={{ background: 'radial-gradient(circle, rgba(255,255,165,0.25) 0%, transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl animate-scale-pulse" style={{ background: 'radial-gradient(circle, rgba(251,255,223,0.1) 0%, transparent 60%)' }} />
          </div>

          {/* Floating Nature Icons - Plants, Water, Fruits */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Leaf icon - top left */}
            <div className="absolute top-16 left-[8%] animate-float opacity-40">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1DFB6" strokeWidth="1.5">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>

            {/* Water drop - top right */}
            <div className="absolute top-24 right-[12%] animate-float-reverse opacity-35">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FBFFDF" strokeWidth="1.5">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>

            {/* Apple/Fruit - middle left */}
            <div className="absolute top-[45%] left-[5%] animate-float-slow opacity-30">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FFFFA5" strokeWidth="1.5">
                <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                <path d="M10 2c1 .5 2 2 2 5" />
              </svg>
            </div>

            {/* Sprout/Seedling - bottom left */}
            <div className="absolute bottom-28 left-[18%] animate-bounce-soft opacity-40">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1DFB6" strokeWidth="1.5">
                <path d="M7 20h10" />
                <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8Z" />
                <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2Z" />
              </svg>
            </div>

            {/* Sun - top center-right */}
            <div className="absolute top-32 right-[28%] animate-scale-pulse opacity-25">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFA5" strokeWidth="1.5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>

            {/* Small leaf - bottom right */}
            <div className="absolute bottom-20 right-[22%] animate-float opacity-35">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1DFB6" strokeWidth="1.5">
                <path d="M6.5 12C6.5 12 10 6 18.5 2.5c0 0-1.5 9.5-7 12.5-3 1.7-6.5 1-6.5 1" />
                <path d="M6.5 16.5c.5-2 1.5-3.5 3.5-5" />
              </svg>
            </div>

            {/* Water drops cluster - middle right */}
            <div className="absolute top-[55%] right-[8%] animate-float-reverse opacity-30">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FBFFDF" strokeWidth="1.5">
                <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
                <path d="M12.56 14.25c1.24 0 2.24-1.02 2.24-2.28 0-.65-.32-1.27-.96-1.79s-1.13-1.07-1.28-1.68c-.15.61-.57 1.16-1.28 1.68s-.96 1.14-.96 1.79c0 1.26 1 2.28 2.24 2.28z" />
                <path d="M19 14.25c1.24 0 2.24-1.02 2.24-2.28 0-.65-.32-1.27-.96-1.79S19.15 9.11 19 8.5c-.15.61-.57 1.16-1.28 1.68s-.96 1.14-.96 1.79c0 1.26 1 2.28 2.24 2.28z" />
              </svg>
            </div>

            {/* Tree/Plant - far left */}
            <div className="absolute top-[30%] left-[2%] animate-float opacity-25">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1DFB6" strokeWidth="1.5">
                <path d="M12 22v-7l-2-2" />
                <path d="M17 8v.8A6 6 0 0 1 13.8 20v0H10v0A6.5 6.5 0 0 1 7 8h0a5 5 0 0 1 10 0Z" />
                <path d="m14 14-2 2" />
              </svg>
            </div>
          </div>

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              {/* Animated Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-md rounded-full border border-white/30 mb-8 animate-bounce-soft">
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <div className="absolute inset-0 animate-ping">
                    <Sparkles className="w-5 h-5 text-yellow-300 opacity-50" />
                  </div>
                </div>
                <span className="text-white font-semibold">Công nghệ AI tiên tiến nhất</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-8">
                <span style={{ color: '#FBFFDF' }} className="drop-shadow-lg">Chăm Vườn </span>
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

              <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed text-white/90 font-light">
                Quản lý vườn cây chuyên nghiệp với trợ lý AI thông minh,
                cảnh báo thời tiết real-time và nhật ký số hoàn chỉnh
              </p>

              {/* Trust Badges with Animation */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                {[
                  { icon: Gift, text: "Dùng thử miễn phí 1 tháng", color: "text-yellow-300" },
                  { icon: Shield, text: "Bảo mật dữ liệu 100%", color: "text-blue-300" },
                  { icon: Zap, text: "Hỗ trợ 24/7", color: "text-green-300" },
                ].map((badge, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-fade-in-up`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <badge.icon className={`w-5 h-5 ${badge.color}`} />
                    <span className="text-white/90 text-sm font-medium">{badge.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button with Brand Colors */}
              <Button
                size="lg"
                className="relative font-bold px-10 py-7 text-lg rounded-2xl shadow-2xl hover:scale-110 transition-all duration-500 group overflow-hidden"
                style={{
                  background: '#FFFFA5',
                  color: '#1F302F',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)'
                }}
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Xem bảng giá ngay
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
          className="relative py-24 overflow-hidden"
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

          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Section Header - Brand Colors */}
              <div className="text-center mb-20" data-animate id="pricing-header">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border mb-6 animate-bounce-soft" style={{ background: 'rgba(209,223,182,0.15)', borderColor: 'rgba(209,223,182,0.3)' }}>
                  <Crown className="w-5 h-5" style={{ color: '#FFFFA5' }} />
                  <span style={{ color: '#D1DFB6' }} className="font-semibold">Lựa chọn linh hoạt cho mọi quy mô</span>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
                  <span style={{ color: '#FBFFDF' }}>Chọn Gói </span>
                  <span className="animate-gradient" style={{ color: '#FFFFA5' }}>
                    Phù Hợp
                  </span>
                  <span style={{ color: '#FBFFDF' }}> Với Bạn</span>
                </h2>

                <p style={{ color: 'rgba(209,223,182,0.8)' }} className="text-xl max-w-2xl mx-auto">
                  Từ vườn nhỏ gia đình đến trang trại lớn, Mầm Mới có giải pháp tối ưu dành riêng cho bạn
                </p>
              </div>

              {/* ============ PRICING CARDS ============ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 xl:gap-12 mb-20 px-4 md:px-0">
                <style>{`
                  .pricing-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
                  }
                `}</style>
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
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30">
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
                          <div className={`absolute -inset-[2px] bg-gradient-to-br ${plan.style?.borderGradient} rounded-[32px] opacity-100 group-hover:opacity-100 transition-opacity duration-500 animate-gradient`} />

                          {/* Card Inner - BIGGER */}
                          <div className={`relative h-full rounded-[30px] bg-gradient-to-br ${plan.style?.cardBg} backdrop-blur-xl p-10 lg:p-12 flex flex-col overflow-hidden shine-effect`}>
                            {/* Shimmer Effect Overlay */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute inset-0 animate-shimmer" />
                            </div>

                            {/* Plan Icon with Glow */}
                            <div className="relative mb-6">
                              <div
                                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.style?.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                style={{ boxShadow: `0 10px 40px ${plan.style?.glowColor}` }}
                              >
                                <PlanIcon className="w-8 h-8 text-white" />
                              </div>
                            </div>

                            {/* Plan Name */}
                            <h3 className={`text-2xl lg:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${plan.style?.textGradient}`}>
                              {plan.name}
                            </h3>
                            <p className="text-gray-400 text-sm mb-6">
                              {plan.features[0]}
                            </p>

                            {/* Price with Animation - RESPONSIVE */}
                            <div className="mb-6 lg:mb-8">
                              <div className="flex flex-wrap items-baseline gap-1">
                                <span
                                  className={`font-black text-transparent bg-clip-text bg-gradient-to-r ${plan.style?.textGradient} group-hover:scale-105 transition-transform duration-300`}
                                  style={{
                                    fontSize: 'clamp(1.75rem, 5vw, 3rem)',
                                    lineHeight: '1.2',
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {formatPrice(plan.monthlyPrice)}đ
                                </span>
                                <span className="text-gray-500 text-base lg:text-lg">/tháng</span>
                              </div>
                            </div>

                            {/* Features List */}
                            <div className="flex-1 mb-8">
                              <ul className="space-y-4">
                                {plan.features && plan.features.length > 0 ? (
                                  plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start gap-3 group/item">
                                      <div
                                        className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${plan.style?.gradient} flex items-center justify-center group-hover/item:scale-110 transition-transform`}
                                      >
                                        <Check className="w-3.5 h-3.5 text-white" />
                                      </div>
                                      <span className="text-gray-300 text-sm group-hover/item:text-white transition-colors">
                                        {feature}
                                      </span>
                                    </li>
                                  ))
                                ) : (
                                  <>
                                    <li className="flex items-start gap-3">
                                      <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${plan.style?.gradient} flex items-center justify-center`}>
                                        <Check className="w-3.5 h-3.5 text-white" />
                                      </div>
                                      <span className="text-gray-300 text-sm">
                                        {plan.maxGardens
                                          ? `Tối đa ${plan.maxGardens} vườn`
                                          : "Không giới hạn vườn"}
                                      </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                      <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br ${plan.style?.gradient} flex items-center justify-center`}>
                                        <Check className="w-3.5 h-3.5 text-white" />
                                      </div>
                                      <span className="text-gray-300 text-sm">
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
                                className={`w-full py-7 text-lg font-bold rounded-xl transition-all duration-300 relative overflow-hidden group/btn ${plan.popular
                                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white shadow-xl shadow-emerald-500/40'
                                  : `bg-gradient-to-r ${plan.style?.gradient} text-white shadow-lg`
                                  } ${isLowerOrCurrent ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl'}`}
                                size="lg"
                                onClick={() => handleSelectPlan(plan)}
                                disabled={isLowerOrCurrent}
                              >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  {isCurrentPlan ? (
                                    <>
                                      <CheckCircle2 className="w-5 h-5" />
                                      Đang sử dụng
                                    </>
                                  ) : (
                                    <>
                                      {plan.buttonText}
                                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                  )}
                                </span>
                                {!isLowerOrCurrent && (
                                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                                )}
                              </Button>

                              {!isLowerOrCurrent && (
                                <p className="text-xs text-gray-500 text-center mt-4">
                                  ✓ Giá đã bao gồm VAT • Kích hoạt ngay
                                </p>
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
              <div className="flex flex-wrap items-center justify-center gap-8 pt-12 border-t border-white/10">
                {[
                  { icon: Shield, text: "Thanh toán an toàn", color: "text-emerald-400" },
                  { icon: BadgeCheck, text: "Hủy bất cứ lúc nào", color: "text-blue-400" },
                  { icon: Zap, text: "Kích hoạt tức thì", color: "text-amber-400" },
                  { icon: Rocket, text: "Nâng cấp dễ dàng", color: "text-purple-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section - Premium Design */}
        <div className="relative z-10 py-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8faf5 100%)' }}>
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, #D1DFB6, #FFFFA5, #D1DFB6, transparent)' }} />
            <div className="absolute top-20 left-[5%] w-80 h-80 rounded-full blur-3xl animate-float opacity-60" style={{ background: 'radial-gradient(circle, rgba(255,200,100,0.3) 0%, transparent 70%)' }} />
            <div className="absolute bottom-20 right-[5%] w-96 h-96 rounded-full blur-3xl animate-float-reverse opacity-50" style={{ background: 'radial-gradient(circle, rgba(100,200,180,0.25) 0%, transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, rgba(209,223,182,0.5) 0%, transparent 60%)' }} />
          </div>

          <div className="relative container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border mb-6 backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, rgba(255,200,100,0.15) 0%, rgba(100,200,180,0.1) 100%)', borderColor: 'rgba(31,48,47,0.1)' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#e67e22' }} />
                  <span style={{ color: '#1F302F' }} className="font-semibold">Lợi ích nổi bật</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black mb-6">
                  <span style={{ color: '#1F302F' }}>Tại Sao Chọn </span>
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #e67e22 0%, #f39c12 50%, #27ae60 100%)' }}>Mầm Mới?</span>
                </h2>

                <p style={{ color: 'rgba(31,48,47,0.7)' }} className="text-lg max-w-2xl mx-auto">
                  Công nghệ AI tiên tiến giúp bạn chăm vườn hiệu quả và chuyên nghiệp hơn
                </p>
              </div>

              {/* Benefits Grid - Colorful Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => {
                  // Varied accent colors for each card
                  const accentColors = [
                    { bg: 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)', glow: 'rgba(230,126,34,0.3)' },
                    { bg: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)', glow: 'rgba(39,174,96,0.3)' },
                    { bg: 'linear-gradient(135deg, #3498db 0%, #5dade2 100%)', glow: 'rgba(52,152,219,0.3)' },
                    { bg: 'linear-gradient(135deg, #9b59b6 0%, #a569bd 100%)', glow: 'rgba(155,89,182,0.3)' },
                  ];
                  const accent = accentColors[index % accentColors.length];

                  return (
                    <div
                      key={index}
                      className="group relative p-6 rounded-3xl bg-white border shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-3"
                      style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                    >
                      {/* Glow on Hover */}
                      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: accent.glow }} />

                      {/* Card top accent line */}
                      <div className="absolute top-0 left-6 right-6 h-1 rounded-b-full opacity-80" style={{ background: accent.bg }} />

                      <div className="relative pt-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" style={{ background: accent.bg }}>
                          <benefit.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-3" style={{ color: '#1F302F' }}>
                          {benefit.title}
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(31,48,47,0.65)' }}>
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
        <div className="relative z-10 py-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #1F302F 0%, #243833 50%, #1a2a28 100%)' }}>
          {/* Background Decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, #FFFFA5, #D1DFB6, #FFFFA5, transparent)' }} />
            <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full blur-3xl animate-float opacity-40" style={{ background: 'radial-gradient(circle, rgba(255,200,100,0.4) 0%, transparent 70%)' }} />
            <div className="absolute bottom-20 left-[10%] w-80 h-80 rounded-full blur-3xl animate-float-reverse opacity-30" style={{ background: 'radial-gradient(circle, rgba(100,200,180,0.4) 0%, transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle, rgba(255,255,165,0.5) 0%, transparent 60%)' }} />
          </div>

          <div className="relative container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border mb-6 backdrop-blur-sm" style={{ background: 'rgba(255,255,165,0.1)', borderColor: 'rgba(255,255,165,0.3)' }}>
                  <Sparkles className="w-5 h-5" style={{ color: '#FFFFA5' }} />
                  <span style={{ color: '#D1DFB6' }} className="font-semibold">Tính năng mạnh mẽ</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black mb-6">
                  <span style={{ color: '#FBFFDF' }}>Tính Năng </span>
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #FFFFA5 0%, #f39c12 50%, #e67e22 100%)' }}>Nổi Bật</span>
                </h2>

                <p style={{ color: 'rgba(209,223,182,0.8)' }} className="text-lg max-w-2xl mx-auto">
                  Công nghệ hiện đại giúp bạn chăm vườn dễ dàng và hiệu quả hơn mỗi ngày
                </p>
              </div>

              {/* Features Grid - Colorful */}
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {features.map((feature, index) => {
                  // Varied accent colors for each feature
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
                      className="group relative flex gap-5 p-8 rounded-3xl border shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 overflow-hidden backdrop-blur-sm"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                        borderColor: 'rgba(209,223,182,0.15)'
                      }}
                    >
                      {/* Glow on Hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${accent.badge}20 0%, transparent 100%)` }} />

                      {/* Side accent */}
                      <div className="absolute left-0 top-8 bottom-8 w-1 rounded-r-full" style={{ background: accent.bg }} />

                      {/* Feature Icon */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" style={{ background: accent.bg }}>
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Feature Content */}
                      <div className="relative flex-1">
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#FBFFDF' }}>
                          {feature.title}
                        </h3>
                        <p className="leading-relaxed mb-4" style={{ color: 'rgba(209,223,182,0.75)' }}>
                          {feature.description}
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg" style={{ background: accent.bg }}>
                          <Zap className="w-4 h-4 text-white" />
                          <span className="text-sm font-semibold text-white">{feature.highlight}</span>
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
        <div className="relative z-10 py-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fef9e7 50%, #fdf6e3 100%)' }}>
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, #e67e22, #f39c12, #e67e22, transparent)' }} />
            <div className="absolute top-20 right-[15%] w-64 h-64 rounded-full blur-3xl animate-float opacity-50" style={{ background: 'radial-gradient(circle, rgba(230,126,34,0.2) 0%, transparent 70%)' }} />
            <div className="absolute bottom-20 left-[15%] w-72 h-72 rounded-full blur-3xl animate-float-reverse opacity-40" style={{ background: 'radial-gradient(circle, rgba(39,174,96,0.2) 0%, transparent 70%)' }} />
          </div>

          <div className="relative container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border mb-6" style={{ background: 'linear-gradient(135deg, rgba(230,126,34,0.1) 0%, rgba(243,156,18,0.1) 100%)', borderColor: 'rgba(230,126,34,0.2)' }}>
                  <Book className="w-5 h-5" style={{ color: '#e67e22' }} />
                  <span style={{ color: '#1F302F' }} className="font-semibold">Câu hỏi thường gặp</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#1F302F' }}>
                  Giải Đáp <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)' }}>Thắc Mắc</span>
                </h2>

                <p style={{ color: 'rgba(31,48,47,0.7)' }}>
                  Những câu hỏi phổ biến về Mầm Mới
                </p>
              </div>

              {/* FAQ Accordion */}
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className={`group rounded-2xl border transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl ${expandedFaq === index
                      ? 'border-orange-200'
                      : 'border-gray-100 hover:border-orange-100'
                      }`}
                    style={{ background: expandedFaq === index ? 'linear-gradient(135deg, #fff9f0 0%, #fff5e6 100%)' : '#ffffff' }}
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-6 text-left transition-colors"
                    >
                      <span className={`font-semibold pr-4 transition-colors ${expandedFaq === index ? 'text-[#1F302F]' : 'text-[#1F302F] group-hover:text-[#e67e22]'
                        }`}>
                        {faq.question}
                      </span>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${expandedFaq === index
                        ? 'rotate-180'
                        : ''
                        }`}
                        style={{ background: expandedFaq === index ? 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)' : 'rgba(230,126,34,0.1)' }}
                      >
                        <ChevronDown className={`w-5 h-5 transition-colors ${expandedFaq === index ? 'text-white' : 'text-[#e67e22]'
                          }`} />
                      </div>
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 ${expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                      <div className="px-6 pb-6 leading-relaxed border-t pt-4" style={{ color: 'rgba(31,48,47,0.7)', borderColor: 'rgba(230,126,34,0.15)' }}>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact CTA */}
              <div className="mt-16 text-center p-10 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl shadow-purple-500/30 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />

                <div className="relative">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Vẫn còn thắc mắc?
                  </h3>
                  <p className="text-white/80 mb-6 text-lg">
                    Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp đỡ bạn 24/7
                  </p>
                  <Button
                    className="bg-white text-purple-700 hover:bg-white/90 font-bold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    size="lg"
                    onClick={() => navigate("/report")}
                  >
                    <span className="flex items-center gap-2">
                      Liên hệ hỗ trợ ngay
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}