import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/API/context/AuthContext"


const DEFAULT_MENU = [
  { id: "vi-sao", label: "Vì sao chọn Mầm Mới", href: "#intro" },
  { id: "quan-ly", label: "Quản lý cây", href: "/garden" },
  { id: "dang-ky", label: "Đăng ký dịch vụ", href: "#register" },
  { id: "lien-he", label: "Liên hệ & Hỗ trợ", href: "/report" },
];

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=D1DFB6&color=1F302F";

export default function MMHeader({
  menuItems = DEFAULT_MENU,
  suggestions = [],
  onLogin,
  onRegister,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnimOpen, setMenuAnimOpen] = useState(false);
  const { user, logout } = useAuth();
  const [avatarMenu, setAvatarMenu] = useState(false);



  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState(menuItems?.[0]?.id || "");
  const [isTop, setIsTop] = useState(true);
  const [showValidationError, setShowValidationError] = useState(false);

  const searchInputRef = useRef(null);
  const openedAtRef = useRef(0);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    onLogin();
    navigate("/auth");
  };

  const handleRegisterClick = () => {
    onRegister();
    navigate("/auth");
  };

  const palette = useMemo(
    () => ({ bg: "#1F302F", leaf: "#D1DFB6", ivory: "#FBFFDF", accent: "#FFFFA5" }),
    []
  );

  useEffect(() => {
  const close = (e) => {
    if (!e.target.closest(".avatar-menu-area")) setAvatarMenu(false);
  };
  document.addEventListener("click", close);
  return () => document.removeEventListener("click", close);
}, []);

  useEffect(() => {
    const onScroll = () => setIsTop(window.scrollY < 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

    useEffect(() => {
    const onKey = (e) => {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      const typing =
        ["input", "textarea", "select"].includes(tag) ||
        document.activeElement?.getAttribute?.("contenteditable") === "true";

      // Nếu đang mở khung chọn ngày (DateInput) thì bỏ qua Enter,
      // không bật search của header
      const dateOpen = document.querySelector('[data-mm-date-open="1"]');

      if (e.key === "Enter") {
        if (dateOpen) return; // khung lịch đang mở → không làm gì

        if (!typing && !searchOpen) {
          setSearchOpen(true);
        }
      }

      if (e.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);



  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 60);
  }, [searchOpen]);

  const submitSearch = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      setShowValidationError(true);
      searchInputRef.current?.classList.add("mm-shake");
      setTimeout(() => searchInputRef.current?.classList.remove("mm-shake"), 350);
      setTimeout(() => setShowValidationError(false), 2500);
      return;
    }
    setShowValidationError(false);
    console.log("Searching for:", q);
    setTimeout(() => {
      setSearchOpen(false);
      setSearchQuery("");
    }, 800);
  };

  // Drawer open/close (chậm & mượt hơn)
  const openMenu = () => {
    if (menuVisible) return;
    setMenuVisible(true);
    requestAnimationFrame(() => setMenuAnimOpen(true));
    setMenuOpen(true);
  };
  const closeMenu = () => {
    if (!menuVisible) return;
    setMenuAnimOpen(false);
    setMenuOpen(false);
    setTimeout(() => setMenuVisible(false), 820); // khớp overlay/panel
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-white text-black px-3 py-2 rounded-md shadow"
      >
        Bỏ qua tới nội dung chính
      </a>

      {/* Sticky header */}
      <div
        className={[
          "fixed top-0 left-0 right-0 z-[55] transition-all duration-300",
          isTop ? "bg-transparent text-white" : "backdrop-blur-sm",
        ].join(" ")}
        style={!isTop ? { background: `#1F302FE6` } : undefined}
        data-testid="mmheader"
      >
        <div className="w-full px-5 md:px-[90px] h-[80px] flex items-center gap-5">
          {/* Logo */}
          <a
            href="#"
            className="inline-flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-white/50 rounded flex-shrink-0"
            onClick={(e) => { navigate("/")} 
        } 
          >
            <div
              className="w-11 h-11 rounded-full grid place-items-center shadow"
              style={{ background: palette.ivory, color: palette.bg }}
            >
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden>
                <path d="M20 5C20 5 8 8 8 20C8 32 20 35 20 35C20 35 32 32 32 20C32 8 20 5 20 5Z" fill={palette.bg} />
                <path d="M20 8C20 8 20 15 20 25C20 28 20 32 20 32" stroke={palette.ivory} strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <span
              className="font-semibold tracking-wide select-none text-base md:text-lg"
              style={{ color: isTop ? palette.ivory : palette.leaf }}
            >
              MẦM MỚI
            </span>
          </a>

          <div className="flex-1 min-w-0" />

          {/* Right cluster */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
            {/* Search inline */}
            <form
              onSubmit={submitSearch}
              className={[
                "relative overflow-hidden transition-[max-width,opacity] duration-300",
                "hidden sm:block",
              ].join(" ")}
              style={{
                maxWidth: searchOpen ? 600 : 0,
                opacity: searchOpen ? 1 : 0,
                pointerEvents: searchOpen ? "auto" : "none",
              }}
              onMouseLeave={() => {
                if (!searchQuery.trim() && Date.now() - openedAtRef.current > 250) {
                  setSearchOpen(false);
                }
              }}
              data-testid="mm-search-form-inline"
            >
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm cây, quy trình, gợi ý chăm sóc…"
                className="
                  h-12 w-[600px] max-w-[600px]
                  rounded-full pl-6 pr-36
                  bg-white/95 text-[#1F302F]
                  placeholder:text-neutral-500
                  border border-white/30
                  shadow-[0_10px_28px_rgba(0,0,0,0.10)]
                  focus:outline-none focus:ring-2 focus:ring-[#FFFFA5]
                  text-[15px]
                "
                data-testid="mm-search-input"
                aria-invalid={showValidationError ? "true" : "false"}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-28 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full hover:bg-black/5 focus:outline-none"
                  aria-label="Xóa từ khóa"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-full shadow hover:scale-[1.02] transition text-[15px] font-medium focus:outline-none"
                style={{ background: palette.accent, color: "#1F302F" }}
                aria-label="Tìm kiếm"
              >
                Tìm
              </button>
              {showValidationError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="absolute right-0 top-full mt-1 text-xs px-3 py-1.5 rounded-full shadow border z-[80] animate-[mm-pop_.18s_ease-out]"
                  style={{
                    background: palette.accent,
                    color: "#1F302F",
                    borderColor: "#EAB30855",
                    whiteSpace: "nowrap",
                  }}
                >
                  Vui lòng nhập nội dung
                </div>
              )}
            </form>

            {/* Toggle search */}
            <button
              onClick={() => {
                if (!searchOpen) {
                  setSearchOpen(true);
                  openedAtRef.current = Date.now();
                  setTimeout(() => searchInputRef.current?.focus(), 80);
                } else {
                  setSearchOpen(false);
                  setShowValidationError(false);
                }
              }}
              className="w-11 h-11 grid place-items-center rounded-full shadow transition hover:scale-[1.03] focus:outline-none"
              style={{ background: palette.ivory, color: palette.bg }}
              aria-label="Mở/đóng tìm kiếm"
              title="Tìm kiếm"
              data-testid="mm-search-btn"
            >
              <Search className="w-[22px] h-[22px]" />
            </button>

            {/* If logged in → avatar dropdown. If not → login/register */}
{user ? (
  <div className="hidden md:block relative  avatar-menu-area">
    <button
      onClick={() => setAvatarMenu((prev) => !prev)}
      className="w-11 h-11 rounded-full overflow-hidden border border-white/40 shadow focus:outline-none"
    >
      <img
        src={user.ProfileImageUrl || DEFAULT_AVATAR}
        alt="avatar"
        className="w-full h-full object-cover"
      />
    </button>

    {/* Dropdown */}
    {avatarMenu && (
      <div className="absolute right-0 mt-3 w-40 bg-white text-[#1F302F] rounded-xl shadow-lg py-2 z-[999]">
        <button
          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          onClick={() => {
            navigate("/garden");
            setAvatarMenu((prev) => !prev)
          }}
        >
          Vườn của tôi
        </button>

        <button
          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          onClick={() => {
            navigate("/profile");
            setAvatarMenu((prev) => !prev)
          }}
        >
          Hồ sơ
        </button>

        <button
          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
          onClick={logout}
        >
          Đăng xuất
        </button>
      </div>
    )}
  </div>
) : (
  <div
    className="hidden md:flex items-stretch rounded-xl overflow-hidden shadow border"
    style={{ borderColor: palette.ivory }}
  >
    <button
      onClick={handleLoginClick}
      className="px-5 py-2.5 text-base bg-white/0 text-white hover:bg-white/10 focus:outline-none"
    >
      Đăng nhập
    </button>
    <div className="w-px bg-white/20" />
    <button
      onClick={handleRegisterClick}
      className="px-5 py-2.5 text-base font-medium focus:outline-none"
      style={{ background: palette.accent, color: "#1F302F" }}
    >
      Đăng ký
    </button>
  </div>
)}

            {/* Menu button */}
            <button
              onClick={openMenu}
              className="w-11 h-11 grid place-items-center rounded-full shadow transition hover:scale-[1.03] focus:outline-none"
              style={{ background: palette.ivory, color: palette.bg }}
              aria-label="Mở menu"
              title="Menu"
              data-testid="mm-menu-btn"
            >
              <Menu className="w-[22px] h-[22px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer: menu giữa, hẹp hơn, animation rất mượt/chậm; auth không viền */}
      {menuVisible && (
        <div className="fixed inset-0 z-[70]">
          {/* Overlay (fade 800ms) */}
          <div
  className="absolute inset-0 bg-black/50"
  style={{
    opacity: menuAnimOpen ? 1 : 0,                                // chỉ fade
    transition: "opacity var(--mm-uline-dur) var(--mm-uline-ease)",
    pointerEvents: menuAnimOpen ? "auto" : "none",                 // tránh bắt click khi ẩn
  }}
  onClick={closeMenu}
/>

          {/* Panel (rộng vừa; slide 780ms bezier mượt) */}
          <aside
            className="absolute right-0 top-0 bottom-0 w-[66%] sm:w-[44%] md:w-[400px] text-[#EAF5C8] shadow-2xl flex flex-col"
            style={{
              background: "#1A3433",
              transform: menuAnimOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform 780ms cubic-bezier(.15,.85,.25,1)",
            }}
            role="dialog"
            aria-modal="true"
            onMouseLeave={closeMenu}
          >
            {/* NAV giữa panel */}
            <div className="flex-1 min-h-0 grid place-content-center px-8 sm:px-10">
              <nav className="w-full max-w-[360px]">
                <ul className="flex flex-col gap-3">
                  {menuItems.map((item, idx) => {
                    const active = activeMenu === item.id;
                    const isReportLink = item.href === "/report";
                    return (
                      <li key={item.id}>
                        {isReportLink ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveMenu(item.id);
                              closeMenu();
                              navigate(item.href);
                            }}
                            className={[
                              "group relative block w-fit px-1 py-2 rounded-md",
                              "text-[28px] sm:text-[32px] leading-snug font-bold",
                              active ? "text-[#FFFFDD]" : "text-[#EAF5C8]/90 hover:text-[#FFFFDD]",
                            ].join(" ")}
                            style={{
                              animation: `mm-stagger-up 520ms cubic-bezier(.2,.8,.2,1) ${200 + idx * 140}ms both`,
                            }}
                          >
                            <span className="relative z-10">{item.label}</span>
                            {/* underline chậm hơn */}
                            <span
                              aria-hidden
                              className="mm-underline"
                              data-active={active ? "1" : undefined}
                              style={{
                                backgroundImage: `linear-gradient(90deg, ${palette.accent}, ${palette.accent})`,
                              }}
                            />
                          </button>
                        ) : (
                          <a
                            href={item.href}
                            onClick={() => setActiveMenu(item.id)}
                            className={[
                              "group relative block w-fit px-1 py-2 rounded-md",
                              "text-[28px] sm:text-[32px] leading-snug font-bold",
                              active ? "text-[#FFFFDD]" : "text-[#EAF5C8]/90 hover:text-[#FFFFDD]",
                            ].join(" ")}
                            style={{
                              animation: `mm-stagger-up 520ms cubic-bezier(.2,.8,.2,1) ${200 + idx * 140}ms both`,
                            }}
                          >
                            <span className="relative z-10">{item.label}</span>
                            {/* underline chậm hơn */}
                            <span
                              aria-hidden
                              className="mm-underline"
                              data-active={active ? "1" : undefined}
                              style={{
                                backgroundImage: `linear-gradient(90deg, ${palette.accent}, ${palette.accent})`,
                              }}
                            />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Bottom Auth — không viền, không ring xanh */}
            <div className="sticky bottom-0 left-0 right-0 p-6 bg-[#1A3433]/90 backdrop-blur-sm">
              {user ? (
    <div className="flex flex-col gap-3">
      <button
        onClick={logout}
        className="h-11 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
      >
        Đăng xuất
      </button>
    </div>
  ) : (
    <div className="flex gap-3">
      <button
        onClick={handleLoginClick}
        className="flex-1 h-11 rounded-full text-[#EAF5C8] bg-white/5 border border-white/20"
      >
        Đăng nhập
      </button>
      <button
        onClick={handleRegisterClick}
        className="flex-1 h-11 rounded-full font-semibold"
        style={{ background: `linear-gradient(180deg, ${palette.accent}, #F4F39A)`, color: "#1F302F" }}
      >
        Đăng ký
      </button>
    </div>
  )}
            </div>
          </aside>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes mm-pop { from { transform: translateY(-6px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes mm-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-3px) } 50% { transform: translateX(3px) } 75% { transform: translateX(-2px) } }
        @keyframes mm-stagger-up { from { opacity: 0; transform: translateY(10px) scale(.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
        html { scroll-padding-top: 80px; }
        .mm-shake { animation: mm-shake .28s ease-in-out; }
        /* ===========================
   Ultra-smooth underline line
   =========================== */
:root{
  --mm-uline-dur: 1400ms; /* 1200–1800ms: tăng nếu muốn chậm hơn nữa */
  --mm-uline-ease: cubic-bezier(.16,1,.3,1); /* rất êm */
  --mm-uline-h: 2px; /* mảnh tạo cảm giác mềm */
}

.mm-underline{
  position:absolute;
  left:0; right:0; bottom:0;
  height:var(--mm-uline-h);
  border-radius:9999px;

  /* Dùng gradient 1 màu để animate background-size theo chiều ngang */
  background-repeat:no-repeat;
  background-size:0% 100%; /* start 0% → chảy vào khi hover */
  opacity:.35;

  will-change: background-size, opacity;
  transform: translateZ(0);

  transition:
    background-size var(--mm-uline-dur) var(--mm-uline-ease),
    opacity        var(--mm-uline-dur) var(--mm-uline-ease);
}

/* Hover: chảy đầy từ trái sang phải */
.group:hover .mm-underline{
  background-size:100% 100%;
  opacity:1;
}

/* Active: luôn giữ trạng thái đầy */
.mm-underline[data-active="1"]{
  background-size:100% 100%;
  opacity:1;
}

/* Tôn trọng người dùng giảm motion */
@media (prefers-reduced-motion: reduce){
  .mm-underline{
    transition:none;
    background-size:100% 100%;
    opacity:1;
  }
}

      `}</style>
    </>
  );
}
