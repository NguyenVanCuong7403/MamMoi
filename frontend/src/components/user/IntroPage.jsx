import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  ShieldCheck,
  BarChart3,
  CloudSun,
  ScanLine,
} from "lucide-react";
import { motion as _motion } from "framer-motion";

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

  return (
    <div className="min-h-screen bg-[#FBFFDF] text-[#1F302F] font-sans selection:bg-[#FFFFA5] selection:text-[#1F302F]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 md:px-[90px] overflow-hidden bg-[#1F302F] text-[#FBFFDF]">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <_motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block py-1 px-3 rounded-full bg-[#FBFFDF]/10 text-[#FFFFA5] font-semibold text-sm tracking-wide uppercase mb-6 border border-[#FBFFDF]/20"
          >
            Về Mầm Mới
          </_motion.span>
          <_motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="font-display font-extrabold text-[clamp(40px,5vw,72px)] leading-[1.1] mb-6 tracking-tight text-[#FBFFDF]"
          >
            Giải pháp nông nghiệp thông minh <br className="hidden md:block" />{" "}
            cho người làm vườn thời đại mới
          </_motion.h1>
          <_motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-[clamp(16px,2vw,20px)] text-[#FBFFDF]/80 max-w-3xl mx-auto leading-relaxed mb-10"
          >
            Mầm Mới không chỉ là một ứng dụng, mà là người bạn đồng hành tin
            cậy, giúp bạn quản lý vườn cây ăn quả từ khâu xuống giống đến khi
            thu hoạch một cách khoa học và hiệu quả nhất.
          </_motion.p>
          <_motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Link
              to="/auth?tab=register"
              className="inline-flex items-center justify-center rounded-full bg-[#FFFFA5] text-[#1F302F] px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition duration-300"
            >
              Bắt đầu ngay hôm nay
            </Link>
          </_motion.div>
        </div>
      </section>

      {/* Functions Section */}
      <section className="py-20 bg-[#fff]/60">
        <div className="max-w-7xl mx-auto px-4 md:px-[90px]">
          <div className="text-center mb-16">
            <h2 className="text-[clamp(32px,3.5vw,48px)] font-bold mb-4">
              Chức năng cốt lõi
            </h2>
            <p className="text-lg text-[#243833]/70 max-w-2xl mx-auto">
              Hệ thống tính năng toàn diện giúp số hóa quy trình quản lý vườn
              của bạn.
            </p>
          </div>

          <_motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Sprout className="w-8 h-8" />,
                title: "Quản lý vườn & cây trồng",
                desc: "Tổ chức theo khu vườn và từng cây. Theo dõi thông tin cơ bản, tình trạng và lịch sử chăm sóc một cách rõ ràng.",
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Lập kế hoạch & theo dõi chăm sóc",
                desc: "Ghi nhận công việc chăm sóc theo giai đoạn, giúp bạn nắm tiến độ và tránh bỏ sót các mốc quan trọng.",
              },
              {
                icon: <ShieldCheck className="w-8 h-8" />,
                title: "Báo cáo & tổng hợp",
                desc: "Tổng hợp thông tin theo dõi để bạn đánh giá hiệu quả chăm sóc và tình trạng vườn theo thời gian.",
              },
            ].map((item, idx) => (
              <_motion.div
                key={idx}
                variants={fadeIn}
                className="bg-[#EEF3CC]/30 p-8 rounded-2xl border border-[#D1DFB6] hover:bg-[#EEF3CC]/60 transition duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-[#D1DFB6] flex items-center justify-center text-[#1F302F] mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-[#243833]/80 leading-relaxed">{item.desc}</p>
              </_motion.div>
            ))}
          </_motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[#1F302F] text-[#FBFFDF]">
        <div className="max-w-7xl mx-auto px-4 md:px-[90px]">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-[clamp(32px,3.5vw,48px)] font-bold mb-6">
                Lợi ích mang lại
              </h2>
              <div className="space-y-8">
                {[
                  {
                    title: "Tối ưu chi phí",
                    desc: "Giảm thiểu lãng phí phân bón và thuốc bảo vệ thực vật nhờ chế độ chăm sóc chính xác.",
                  },
                  {
                    title: "Nâng cao năng suất",
                    desc: "Cây trồng khỏe mạnh, phát triển đúng chu kỳ giúp tăng sản lượng và chất lượng nông sản.",
                  },
                  {
                    title: "Tiết kiệm thời gian",
                    desc: "Quản lý mọi lúc, mọi nơi trên thiết bị di động. Giảm bớt công việc ghi chép thủ công.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-1 h-full min-h-[60px] bg-[#FFFFA5] rounded-full opacity-60"></div>
                    <div>
                      <h4 className="text-xl font-bold text-[#FFFFA5] mb-2">
                        {item.title}
                      </h4>
                      <p className="text-[#FBFFDF]/80">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition duration-500">
                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1600&auto=format&fit=crop"
                  alt="Benefits"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FFFFA5] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D1DFB6] rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Utilities Section */}
      <section className="py-24 bg-[#E6E7E0]">
        <div className="max-w-7xl mx-auto px-4 md:px-[90px]">
          <div className="text-center mb-16">
            <h2 className="text-[clamp(32px,3.5vw,48px)] font-bold mb-4 text-[#1F302F]">
              Tiện ích mở rộng
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <CloudSun />,
                title: "Dự báo thời tiết",
                desc: "Cảnh báo mưa, bão, nắng hạn chi tiết cho từng vùng trồng.",
              },
              {
                icon: <Sprout />,
                title: "Thư viện cây trồng",
                desc: "Tra cứu thông tin giống/cây trồng và hình ảnh minh hoạ để tham khảo nhanh.",
              },
              {
                icon: <BarChart3 />,
                title: "Báo cáo",
                desc: "Xem các báo cáo tổng hợp để theo dõi hoạt động và hiệu quả theo từng giai đoạn.",
              },
              {
                icon: <ScanLine />,
                title: "Gói dịch vụ & thanh toán",
                desc: "Xem bảng giá và thực hiện thanh toán để sử dụng các gói phù hợp nhu cầu.",
              },
            ].map((u, i) => (
              <div
                key={i}
                className="bg-[#FBFFDF] p-6 rounded-xl shadow-sm hover:shadow-md transition text-center"
              >
                <div className="w-12 h-12 mx-auto bg-[#E6E7E0] rounded-full flex items-center justify-center text-[#1F302F] mb-4">
                  {u.icon}
                </div>
                <h4 className="font-bold text-lg mb-2 text-[#1F302F]">
                  {u.title}
                </h4>
                <p className="text-sm text-[#243833]/70">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketing / CTA Section */}
      <section className="py-24 px-4 md:px-[90px]">
        <div className="max-w-5xl mx-auto bg-[#243833] rounded-[30px] p-8 md:p-16 text-center text-[#FBFFDF] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="relative z-10">
            <h2 className="font-display text-[clamp(28px,4vw,56px)] font-bold mb-6">
              Sẵn sàng chuyển đổi số cho khu vườn của bạn?
            </h2>
            <p className="text-lg md:text-xl text-[#FBFFDF]/80 mb-10 max-w-2xl mx-auto">
              Tham gia cùng hàng ngàn nhà nông đang ứng dụng công nghệ để làm
              giàu từ chính mảnh đất của mình.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth?tab=register"
                className="inline-flex items-center justify-center rounded-full bg-[#FFFFA5] text-[#1F302F] px-8 py-4 text-lg font-bold shadow hover:shadow-lg hover:-translate-y-1 transition"
              >
                Đăng ký ngay
              </Link>
              <Link
                to="/price"
                className="inline-flex items-center justify-center rounded-full border-2 border-[#D1DFB6] text-[#D1DFB6] px-8 py-4 text-lg font-bold hover:bg-[#D1DFB6] hover:text-[#1F302F] transition"
              >
                Xem bảng giá
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
