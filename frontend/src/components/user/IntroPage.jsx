import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  ShieldCheck,
  BarChart3,
  CloudSun,
  Calendar,
  Leaf,
  TreeDeciduous,
  Bell,
  Users,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Zap,
  BookOpen,
  Sun,
  Droplets,
  Bug,
  Clock,
} from "lucide-react";
import { motion as _motion } from "framer-motion";

// CSS Animations
const animationStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  
  @keyframes float-reverse {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(15px); }
  }
  
  @keyframes pulse-soft {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.05); }
  }
  
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-reverse { animation: float-reverse 5s ease-in-out infinite; }
  .animate-pulse-soft { animation: pulse-soft 4s ease-in-out infinite; }
  .animate-gradient { 
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
  }
`;

export default function IntroPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } },
  };

  // Core features - ACCURATE to project
  const coreFeatures = [
    {
      icon: <TreeDeciduous className="w-8 h-8" />,
      title: "Quản lý Vườn",
      desc: "Tạo và quản lý nhiều vườn cây. Theo dõi thông tin vị trí, diện tích, loại đất và nhân viên phụ trách cho từng khu vườn.",
    },
    {
      icon: <Sprout className="w-8 h-8" />,
      title: "Quản lý Cây trồng",
      desc: "Thêm cây vào vườn với đầy đủ thông tin: giống cây, ngày trồng, vị trí, tình trạng sức khỏe. Theo dõi giai đoạn phát triển của từng cây.",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Lịch chăm sóc",
      desc: "Lên lịch và theo dõi các công việc chăm sóc: tưới nước, bón phân, cắt tỉa, phun thuốc. Xem lịch sử chăm sóc chi tiết.",
    },
  ];

  // Utility features - ACCURATE to project
  const utilityFeatures = [
    {
      icon: <CloudSun className="w-6 h-6" />,
      title: "Dự báo thời tiết",
      desc: "Xem dự báo thời tiết theo tỉnh/thành phố, nhận cảnh báo mưa bão để chủ động bảo vệ vườn cây.",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Thư viện cây trồng",
      desc: "Tra cứu thông tin chi tiết về các loại cây: hướng dẫn chăm sóc, yêu cầu ánh sáng, nước, sâu bệnh thường gặp.",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Thông báo nhắc nhở",
      desc: "Nhận thông báo khi đến lịch chăm sóc, cảnh báo thời tiết xấu và các sự kiện quan trọng của vườn.",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Báo cáo & Thống kê",
      desc: "Xem báo cáo tổng hợp về tình trạng vườn, lịch sử chăm sóc và hoạt động theo thời gian.",
    },
  ];

  // Benefits - ACCURATE
  const benefits = [
    {
      title: "AI gợi ý chăm sóc thông minh",
      desc: "Hệ thống AI phân tích từng cây và gợi ý công việc chăm sóc phù hợp: tưới nước, bón phân, cắt tỉa, phun thuốc - tất cả được tự động đề xuất theo giai đoạn và tình trạng cây.",
    },
    {
      title: "Giai đoạn phát triển linh hoạt",
      desc: "Mỗi loại cây có các giai đoạn phát triển riêng, được quản trị viên cấu hình theo từng giống cây. Hệ thống tự động xác định giai đoạn dựa trên tuổi cây.",
    },
    {
      title: "Lịch sử chăm sóc chi tiết",
      desc: "Ghi nhận từng công việc chăm sóc với ngày giờ, loại công việc và ghi chú. Dễ dàng xem lại lịch sử để đánh giá hiệu quả.",
    },
    {
      title: "Quản lý tập trung và linh hoạt",
      desc: "Tất cả thông tin vườn, cây trồng và lịch chăm sóc được lưu trữ ở một nơi duy nhất.",
    },
  ];

  // AI Features
  const aiFeatures = [
    {
      icon: "🤖",
      title: "Gợi ý công việc hàng ngày",
      desc: "AI phân tích và đề xuất các công việc chăm sóc cụ thể cho 3 ngày tới",
    },
    {
      icon: "�",
      title: "Phù hợp giai đoạn cây",
      desc: "Gợi ý thay đổi theo giai đoạn: Sinh trưởng, Ra hoa, Ra quả,...",
    },
    {
      icon: "☀️",
      title: "Kết hợp thời tiết",
      desc: "AI xem xét dự báo thời tiết để điều chỉnh kế hoạch chăm sóc",
    },
    {
      icon: "🔄",
      title: "Cập nhật liên tục",
      desc: "Làm mới gợi ý mỗi khi bạn cập nhật thông tin cây",
    },
  ];

  return (
    <>
      <style>{animationStyles}</style>
      <div className="min-h-screen bg-[#FBFFDF] text-[#1F302F] font-sans selection:bg-[#FFFFA5] selection:text-[#1F302F]">
        {/* ============ HERO SECTION ============ */}
        <section
          className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 md:px-[90px] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1F302F 0%, #2a4a48 50%, #1F302F 100%)' }}
        >
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl animate-float" style={{ background: 'radial-gradient(circle, rgba(209,223,182,0.2) 0%, transparent 70%)' }} />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl animate-float-reverse" style={{ background: 'radial-gradient(circle, rgba(255,255,165,0.15) 0%, transparent 70%)' }} />

            {/* Nature icons */}
            <div className="absolute top-20 left-[8%] opacity-30 animate-float">
              <Leaf className="w-12 h-12" style={{ color: '#D1DFB6' }} />
            </div>
            <div className="absolute top-32 right-[12%] opacity-25 animate-float-reverse">
              <Droplets className="w-10 h-10" style={{ color: '#FBFFDF' }} />
            </div>
            <div className="absolute bottom-24 left-[15%] opacity-25 animate-float">
              <Sun className="w-8 h-8" style={{ color: '#FFFFA5' }} />
            </div>
            <div className="absolute bottom-32 right-[20%] opacity-30 animate-float-reverse">
              <Sprout className="w-10 h-10" style={{ color: '#D1DFB6' }} />
            </div>
          </div>

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <_motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-[#FBFFDF]/10 text-[#FFFFA5] font-semibold text-sm tracking-wide uppercase mb-6 border border-[#FBFFDF]/20 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              Về Mầm Mới
            </_motion.span>

            <_motion.h1
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="font-display font-extrabold text-[clamp(36px,5vw,64px)] leading-[1.1] mb-6 tracking-tight"
              style={{ color: '#FBFFDF' }}
            >
              Hệ thống quản lý vườn cây
              <br />
              <span
                className="text-transparent bg-clip-text animate-gradient"
                style={{ backgroundImage: 'linear-gradient(to right, #FFFFA5, #D1DFB6, #FFFFA5)' }}
              >
                trực tuyến toàn diện
              </span>
            </_motion.h1>

            <_motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-[clamp(16px,2vw,20px)] max-w-3xl mx-auto leading-relaxed mb-10"
              style={{ color: 'rgba(251,255,223,0.85)' }}
            >
              Mầm Mới giúp bạn quản lý nhiều vườn cây, theo dõi từng cây trồng từ lúc xuống giống đến thu hoạch.
              Lên lịch chăm sóc, nhận cảnh báo thời tiết và xem báo cáo chi tiết - tất cả trên một nền tảng web duy nhất.
            </_motion.p>

            {/* Trust badges */}
            <_motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-wrap items-center justify-center gap-4 mb-10"
            >
              {[
                { icon: CheckCircle2, text: "Hoàn toàn trên Web" },
                { icon: Clock, text: "Dùng thử 1 tháng miễn phí" },
                { icon: ShieldCheck, text: "Bảo mật dữ liệu" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border backdrop-blur-sm"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(209,223,182,0.3)',
                    color: '#D1DFB6'
                  }}
                >
                  <item.icon className="w-4 h-4" style={{ color: '#FFFFA5' }} />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </_motion.div>

            <_motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/auth?tab=register"
                className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition duration-300"
                style={{ background: '#FFFFA5', color: '#1F302F' }}
              >
                Đăng ký miễn phí
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/plants"
                className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-semibold border-2 hover:bg-[#D1DFB6] hover:text-[#1F302F] transition duration-300"
                style={{ borderColor: '#D1DFB6', color: '#D1DFB6' }}
              >
                <BookOpen className="w-5 h-5" />
                Xem thư viện cây
              </Link>
            </_motion.div>
          </div>
        </section>

        {/* ============ CORE FEATURES ============ */}
        <section className="py-20 bg-white/70">
          <div className="max-w-7xl mx-auto px-4 md:px-[90px]">
            <div className="text-center mb-16">
              <_motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D1DFB6]/30 text-[#1F302F] font-semibold text-sm mb-4"
              >
                <Zap className="w-4 h-4" />
                Chức năng chính
              </_motion.div>
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold mb-4 text-[#1F302F]">
                Quản lý vườn cây chuyên nghiệp
              </h2>
              <p className="text-lg text-[#243833]/70 max-w-2xl mx-auto">
                Ba tính năng cốt lõi giúp bạn số hóa toàn bộ quy trình chăm sóc vườn
              </p>
            </div>

            <_motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid md:grid-cols-3 gap-8"
            >
              {coreFeatures.map((item, idx) => (
                <_motion.div
                  key={idx}
                  variants={fadeIn}
                  className="group bg-gradient-to-br from-[#EEF3CC]/50 to-white p-8 rounded-3xl border border-[#D1DFB6] hover:border-[#1F302F]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1F302F] to-[#2a4a48] flex items-center justify-center text-[#FFFFA5] mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#1F302F]">{item.title}</h3>
                  <p className="text-[#243833]/80 leading-relaxed">{item.desc}</p>
                </_motion.div>
              ))}
            </_motion.div>
          </div>
        </section>

        {/* ============ AI FEATURES ============ */}
        <section className="py-20 bg-gradient-to-br from-[#1F302F] to-[#2a4a48]">
          <div className="max-w-7xl mx-auto px-4 md:px-[90px]">
            <div className="text-center mb-12">
              <_motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFFA5]/15 text-[#FFFFA5] font-semibold text-sm mb-4"
              >
                <Sparkles className="w-4 h-4" />
                Công nghệ AI
              </_motion.div>
              <h3 className="text-2xl md:text-4xl font-bold text-[#FBFFDF] mb-4">
                AI gợi ý chăm sóc thông minh
              </h3>
              <p className="text-[#D1DFB6] max-w-2xl mx-auto text-lg">
                Hệ thống AI phân tích từng cây và tự động đề xuất công việc chăm sóc phù hợp
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiFeatures.map((feature, i) => (
                <_motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-[#FFFFA5]/30 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h4 className="text-lg font-bold text-[#FFFFA5] mb-2">{feature.title}</h4>
                  <p className="text-[#FBFFDF]/70 text-sm">{feature.desc}</p>
                </_motion.div>
              ))}
            </div>

            {/* Note about flexible phases */}
            <_motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <div className="inline-flex flex-wrap items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[#D1DFB6] text-sm">
                  <strong className="text-[#FFFFA5]">Giai đoạn linh hoạt:</strong>{" "}
                  Mỗi loại cây có các giai đoạn riêng (Sinh trưởng, Ra hoa, Ra quả,...) được cấu hình bởi quản trị viên
                </span>
              </div>
            </_motion.div>
          </div>
        </section>

        {/* ============ BENEFITS ============ */}
        <section className="py-20 bg-[#1F302F] text-[#FBFFDF]">
          <div className="max-w-7xl mx-auto px-4 md:px-[90px]">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <_motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFFFA5]/10 text-[#FFFFA5] font-semibold text-sm mb-6"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Lợi ích
                </_motion.div>
                <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold mb-8">
                  Tại sao chọn Mầm Mới?
                </h2>
                <div className="space-y-6">
                  {benefits.map((item, idx) => (
                    <_motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-4 group"
                    >
                      <div className="w-1 h-auto min-h-[60px] bg-gradient-to-b from-[#FFFFA5] to-[#D1DFB6] rounded-full group-hover:w-1.5 transition-all" />
                      <div>
                        <h4 className="text-lg font-bold text-[#FFFFA5] mb-2">
                          {item.title}
                        </h4>
                        <p className="text-[#FBFFDF]/80 leading-relaxed">{item.desc}</p>
                      </div>
                    </_motion.div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <_motion.div
                  initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 3 }}
                  viewport={{ once: true }}
                  whileHover={{ rotate: 0 }}
                  className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-[#D1DFB6]/20"
                >
                  <img
                    src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1600&auto=format&fit=crop"
                    alt="Vườn cây xanh tươi"
                    className="w-full h-full object-cover"
                  />
                </_motion.div>
                {/* Decorative blurs */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FFFFA5] rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse-soft" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D1DFB6] rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse-soft" />
              </div>
            </div>
          </div>
        </section>

        {/* ============ UTILITY FEATURES ============ */}
        <section className="py-24 bg-gradient-to-br from-[#E6E7E0] to-[#FBFFDF]">
          <div className="max-w-7xl mx-auto px-4 md:px-[90px]">
            <div className="text-center mb-16">
              <_motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F302F]/10 text-[#1F302F] font-semibold text-sm mb-4"
              >
                <Sparkles className="w-4 h-4" />
                Tiện ích mở rộng
              </_motion.div>
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold mb-4 text-[#1F302F]">
                Công cụ hỗ trợ đắc lực
              </h2>
              <p className="text-lg text-[#243833]/70 max-w-2xl mx-auto">
                Những tiện ích giúp bạn chăm sóc vườn hiệu quả hơn mỗi ngày
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {utilityFeatures.map((u, i) => (
                <_motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-[#D1DFB6]/30"
                >
                  <div className="w-14 h-14 mx-auto bg-gradient-to-br from-[#D1DFB6] to-[#EEF3CC] rounded-2xl flex items-center justify-center text-[#1F302F] mb-5 group-hover:scale-110 transition-transform duration-300">
                    {u.icon}
                  </div>
                  <h4 className="font-bold text-lg mb-3 text-[#1F302F] text-center">
                    {u.title}
                  </h4>
                  <p className="text-sm text-[#243833]/70 text-center leading-relaxed">{u.desc}</p>
                </_motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 md:px-[90px]">
            <div className="text-center mb-16">
              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold mb-4 text-[#1F302F]">
                Bắt đầu dễ dàng
              </h2>
              <p className="text-lg text-[#243833]/70">
                Chỉ 3 bước để quản lý vườn chuyên nghiệp
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Tạo vườn", desc: "Thêm vườn với thông tin vị trí, diện tích, loại đất" },
                { step: "2", title: "Thêm cây trồng", desc: "Đăng ký từng cây với giống, ngày trồng, vị trí" },
                { step: "3", title: "Lên lịch chăm sóc", desc: "Tạo và theo dõi các công việc chăm sóc định kỳ" },
              ].map((item, i) => (
                <_motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1F302F] to-[#2a4a48] flex items-center justify-center text-[#FFFFA5] text-2xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#1F302F]">{item.title}</h3>
                  <p className="text-[#243833]/70">{item.desc}</p>
                </_motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA SECTION ============ */}
        <section className="py-24 px-4 md:px-[90px] bg-[#FBFFDF]">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#1F302F] to-[#2a4a48] rounded-[32px] p-8 md:p-16 text-center text-[#FBFFDF] relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '30px 30px'
            }} />

            {/* Decorative orbs */}
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl animate-float" style={{ background: 'rgba(209,223,182,0.15)' }} />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl animate-float-reverse" style={{ background: 'rgba(255,255,165,0.1)' }} />

            <div className="relative z-10">
              <_motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display text-[clamp(24px,4vw,48px)] font-bold mb-6"
              >
                Sẵn sàng quản lý vườn thông minh?
              </_motion.h2>
              <_motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
                style={{ color: 'rgba(251,255,223,0.85)' }}
              >
                Đăng ký miễn phí và trải nghiệm đầy đủ tính năng trong 1 tháng.
                Không cần thẻ tín dụng.
              </_motion.p>
              <_motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  to="/auth?tab=register"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  style={{ background: '#FFFFA5', color: '#1F302F' }}
                >
                  Đăng ký ngay
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/price"
                  className="inline-flex items-center justify-center rounded-full border-2 px-8 py-4 text-lg font-bold hover:bg-[#D1DFB6] hover:text-[#1F302F] transition-all duration-300"
                  style={{ borderColor: '#D1DFB6', color: '#D1DFB6' }}
                >
                  Xem bảng giá
                </Link>
              </_motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
