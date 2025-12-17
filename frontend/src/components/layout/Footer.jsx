import React from "react";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

export default function Footer() {
  const footerSections = {
    about: [
      { label: "Về chúng tôi", href: "/intro" },
      { label: "Câu chuyện thương hiệu", href: "/intro" },

    ],
    services: [
      { label: "Chăm sóc cây ăn quả", href: "/garden" },
      { label: "Quản lý vườn cây", href: "/garden" },
      { label: "Thư viện cây", href: "/plants" },
    ],
    support: [

      { label: "Câu hỏi thường gặp", href: "/price" },
      { label: "Liên hệ hỗ trợ", href: "/report" },
    ],
    contact: {
      address: "Đại học FPT Hà Nội",
      phone: "0988284661",
      email: "info@mammoi.vn",
    },
  };

  const socialLinks = [
  ];

  const BG = "#1F302F";
  const TEXT = "#FBFFDF";
  const TEXT80 = "rgba(251,255,223,.80)";
  const LINE = "rgba(251,255,223,.22)";

  // Fluid spacing CSS variables
  const fluidStyles = {
    "--space-section": "clamp(2rem, 1.5rem + 2vw, 3rem)",
    "--space-6": "clamp(1.25rem, 1rem + 0.75vw, 1.5rem)",
    "--space-4": "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)",
    "--gap-grid": "clamp(1.5rem, 1rem + 1.5vw, 2.5rem)",
    "--container-pad": "clamp(1rem, 4vw, 2rem)",
    "--text-sm": "clamp(0.8125rem, 0.75rem + 0.2vw, 0.875rem)",
    "--text-base": "clamp(0.875rem, 0.8rem + 0.2vw, 1rem)",
    "--text-lg": "clamp(1rem, 0.9rem + 0.3vw, 1.125rem)",
    "--icon-sm": "clamp(1rem, 0.9rem + 0.2vw, 1.125rem)",
  };

  return (
    <footer
      className="mm-footer w-full mt-auto"
      style={{
        ...fluidStyles,
        backgroundColor: BG,
        color: TEXT,
        borderTop: `1px solid ${LINE}`,
        position: "relative",
        zIndex: 1,
      }}
    >
      <style>{`
        .mm-footer::before{content:"";position:absolute;inset:0;background:${BG};pointer-events:none;z-index:0;}
        .mm-footer, .mm-footer *{background-image:none !important;-webkit-mask-image:none !important;mask-image:none !important;border-image:none !important;}
        .mm-footer .border-t{border-style:solid !important;}
        .mm-footer .mm-inner{position:relative;z-index:1;}
      `}</style>

      {/* Container with fluid padding - full width */}
      <div
        className="mm-inner w-full"
        style={{
          padding: "var(--space-section) var(--container-pad)"
        }}
      >
        {/* Main footer content - stacks on mobile, row on desktop */}
        <div
          className="flex flex-col lg:flex-row lg:items-start lg:justify-between"
          style={{ gap: "var(--gap-grid)" }}
        >
          {/* Brand section - full width on mobile, constrained on desktop */}
          <div
            className="w-full lg:w-auto lg:max-w-xs flex-shrink-0"
          >
            <a
              href="/"
              className="flex items-center gap-3 mb-4 cursor-pointer group"
              aria-label="Mầm Mới"
            >
              <img
                src="/logo/FooterLogo.png"
                alt="Mầm Mới Logo"
                className="rounded-full flex-shrink-0 group-hover:scale-110 transition-transform object-cover"
                style={{
                  width: "clamp(3.5rem, 3rem + 2vw, 5rem)",
                  height: "clamp(3.5rem, 3rem + 2vw, 5rem)",
                }}
              />
              <span
                className="font-bold"
                style={{
                  color: "rgba(251,255,223,.9)",
                  fontSize: "var(--text-lg)",
                }}
              >
                Mầm Mới
              </span>
            </a>

            <p
              className="leading-relaxed mb-4"
              style={{
                color: TEXT80,
                fontSize: "var(--text-sm)",
              }}
            >
              Mang thiên nhiên vào ngôi nhà của bạn. Chúng tôi cung cấp cây xanh
              chất lượng cao với dịch vụ chăm sóc tận tâm.
            </p>

            {/* Social icons with proper touch targets (min 44px) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="rounded-full flex items-center justify-center transition-all hover:opacity-100 hover:scale-110"
                  style={{
                    backgroundColor: "rgba(251,255,223,.12)",
                    color: TEXT,
                    width: "clamp(2.5rem, 2rem + 1vw, 2.75rem)",
                    height: "clamp(2.5rem, 2rem + 1vw, 2.75rem)",
                    minWidth: "44px",
                    minHeight: "44px",
                  }}
                >
                  <s.icon style={{
                    width: "var(--icon-sm)",
                    height: "var(--icon-sm)"
                  }} />
                </a>
              ))}
            </div>
          </div>

          {/* Links sections - responsive grid: 2 cols on mobile, 4 cols on larger screens */}
          <div
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 flex-1"
            style={{
              gap: "var(--gap-grid)",
              maxWidth: "800px",
            }}
          >
            {/* Về chúng tôi */}
            <div>
              <h3
                className="font-semibold mb-3"
                style={{
                  color: "#FFFFA5",
                  fontSize: "var(--text-base)",
                }}
              >
                Về chúng tôi
              </h3>
              <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {footerSections.about.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="transition-opacity hover:opacity-100"
                      style={{
                        color: TEXT80,
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dịch vụ */}
            <div>
              <h3
                className="font-semibold mb-3"
                style={{
                  color: "#FFFFA5",
                  fontSize: "var(--text-base)",
                }}
              >
                Dịch vụ
              </h3>
              <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {footerSections.services.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="transition-opacity hover:opacity-100"
                      style={{
                        color: TEXT80,
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hỗ trợ */}
            <div>
              <h3
                className="font-semibold mb-3"
                style={{
                  color: "#FFFFA5",
                  fontSize: "var(--text-base)",
                }}
              >
                Hỗ trợ
              </h3>
              <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {footerSections.support.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="transition-opacity hover:opacity-100"
                      style={{
                        color: TEXT80,
                        fontSize: "var(--text-sm)",
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Liên hệ */}
            <div>
              <h3
                className="font-semibold mb-3"
                style={{
                  color: "#FFFFA5",
                  fontSize: "var(--text-base)",
                }}
              >
                Liên hệ
              </h3>
              <ul style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
                fontSize: "var(--text-sm)",
              }}>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      color: TEXT,
                      width: "var(--icon-sm)",
                      height: "var(--icon-sm)",
                    }}
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
                    className="flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      color: TEXT,
                      width: "var(--icon-sm)",
                      height: "var(--icon-sm)",
                    }}
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
                    className="flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      color: TEXT,
                      width: "var(--icon-sm)",
                      height: "var(--icon-sm)",
                    }}
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

        {/* Bottom bar - copyright and links */}
        <div
          className="border-t"
          style={{
            borderColor: "rgba(251,255,223,.15)",
            borderStyle: "solid",
            marginTop: "var(--space-6)",
            paddingTop: "var(--space-6)",
          }}
        >
          <div
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-3 gap-y-2"
            style={{
              color: "rgba(251,255,223,.75)",
              fontSize: "var(--text-sm)",
            }}
          >
            <span>© 2025 MamMoi, Inc.</span>
            <span className="hidden sm:inline opacity-40">•</span>
            <div className="flex items-center gap-3">
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
      </div>
    </footer>
  );
}
