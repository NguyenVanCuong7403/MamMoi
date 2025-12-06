import React from "react";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

export default function Footer() {
  const footerSections = {
    about: [
      { label: "Về chúng tôi", href: "/about" },
      { label: "Câu chuyện thương hiệu", href: "/story" },
      { label: "Đội ngũ", href: "/team" },
    ],
    services: [
      { label: "Chăm sóc cây ăn quả", href: "/care" },
      { label: "Quản lý vườn cây", href: "/management" },
      { label: "Gợi ý chăm sóc tự động", href: "/auto-suggestions" },
    ],
    support: [
      { label: "Hướng dẫn sử dụng", href: "/guide" },
      { label: "Chính sách đổi trả", href: "/return-policy" },
      { label: "Câu hỏi thường gặp", href: "/faq" },
    ],
    contact: {
      address: "Đại học FPT Hà Nội",
      phone: "+84 123 456 789",
      email: "info@mammoi.vn",
    },
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "Youtube" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  ];

  const BG = "#1F302F";
  const TEXT = "#FBFFDF";
  const TEXT80 = "rgba(251,255,223,.80)";
  const LINE = "rgba(251,255,223,.22)";

  return (
    <footer
      className="mm-footer w-full mt-auto"
      style={{
        backgroundColor: BG,
        color: TEXT,
        borderTop: `1px solid ${LINE}`,
        position: "relative",
        zIndex: 10,
        isolation: "isolate",
      }}
    >
      <style>{`
        .mm-footer::before{content:"";position:absolute;inset:0;background:${BG};pointer-events:none;z-index:0;}
        .mm-footer, .mm-footer *{background-image:none !important;-webkit-mask-image:none !important;mask-image:none !important;border-image:none !important;}
        .mm-footer .border-t{border-style:solid !important;}
        .mm-footer .mm-inner{position:relative;z-index:1;}
      `}</style>

      {/* FULL-BLEED inner (kéo sát mép) */}
      <div className="mm-inner w-full max-w-none px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-10">
        <div className="flex flex-wrap items-start justify-between gap-8 pb-8">
          <div className="flex-shrink-0" style={{ maxWidth: 320 }}>
            <a
              href="/"
              className="flex items-center gap-3 mb-4 cursor-pointer group"
              aria-label="Mầm Mới"
            >
              <img
                src="/logo/FooterLogo.png"
                alt="Mầm Mới Logo"
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform object-cover"
              />
              <span
                className="text-xl font-bold"
                style={{ color: "rgba(251,255,223,.9)" }}
              >
                Mầm Mới
              </span>
            </a>

            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: TEXT80 }}
            >
              Mang thiên nhiên vào ngôi nhà của bạn. Chúng tôi cung cấp cây xanh
              chất lượng cao với dịch vụ chăm sóc tận tâm.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-100"
                  style={{
                    backgroundColor: "rgba(251,255,223,.12)",
                    color: TEXT,
                  }}
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-12 xl:gap-16 2xl:gap-24 flex-1 justify-end">
            <div>
              <h3
                className="font-semibold text-base mb-3"
                style={{ color: "#FFFFA5" }}
              >
                Về chúng tôi
              </h3>
              <ul className="space-y-2">
                {footerSections.about.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-sm transition-opacity hover:opacity-100"
                      style={{ color: TEXT80 }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3
                className="font-semibold text-base mb-3"
                style={{ color: "#FFFFA5" }}
              >
                Dịch vụ
              </h3>
              <ul className="space-y-2">
                {footerSections.services.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-sm transition-opacity hover:opacity-100"
                      style={{ color: TEXT80 }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3
                className="font-semibold text-base mb-3"
                style={{ color: "#FFFFA5" }}
              >
                Hỗ trợ
              </h3>
              <ul className="space-y-2">
                {footerSections.support.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-sm transition-opacity hover:opacity-100"
                      style={{ color: TEXT80 }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3
                className="font-semibold text-base mb-3"
                style={{ color: "#FFFFA5" }}
              >
                Liên hệ
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: TEXT }}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <a
                    href="https://maps.google.com/?q=Đại+học+FPT+Hà+Nội"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-opacity hover:opacity-100"
                    style={{ color: TEXT80 }}
                  >
                    {footerSections.contact.address}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: TEXT }}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a
                    href={`tel:${footerSections.contact.phone}`}
                    className="transition-opacity hover:opacity-100"
                    style={{ color: TEXT80 }}
                  >
                    {footerSections.contact.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: TEXT }}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a
                    href={`mailto:${footerSections.contact.email}`}
                    className="transition-opacity hover:opacity-100"
                    style={{ color: TEXT80 }}
                  >
                    {footerSections.contact.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          className="border-t pt-6"
          style={{ borderColor: "rgba(251,255,223,.15)", borderStyle: "solid" }}
        >
          <div
            className="flex flex-row flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm"
            style={{ color: "rgba(251,255,223,.75)" }}
          >
            <span>© 2025 MamMoi, Inc.</span>
            <span className="opacity-40">•</span>
            <a href="/privacy" className="hover:opacity-100">
              Privacy
            </a>
            <span className="opacity-40">•</span>
            <a href="/terms" className="hover:opacity-100">
              Terms
            </a>
            <span className="opacity-40">•</span>
            <a href="/sitemap" className="hover:opacity-100">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
