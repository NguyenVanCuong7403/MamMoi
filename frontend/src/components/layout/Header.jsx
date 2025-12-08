import React, { useEffect, useMemo, useRef, useState } from "react";
import { Menu, Bell, User as UserIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/API/context/AuthContext";
import NotificationRepository from "@/API/repositories/NotificationRepository";
import { getNotificationRoute } from "@/lib/notificationRoutes";

const DEFAULT_MENU = [
  { id: "quan-ly", label: "Quản lý vườn & cây", href: "/garden" },
  { id: "dang-ky", label: "Đăng ký dịch vụ", href: "/price" },
  { id: "lien-he", label: "Liên hệ & Hỗ trợ", href: "/report" },
];

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=D1DFB6&color=1F302F";

/* ===== Helper functions ===== */
const normalizeRole = (role) => {
  if (!role) return null;
  return role.toString().toLowerCase().trim();
};

const isAdmin = (user) => {
  if (!user) return false;
  const role = normalizeRole(user.role);
  return role === "systemadmin" || role === "businessadmin";
};

const isGuest = (user) => {
  return !user;
};

const getAdminPath = (user) => {
  if (!user) return null;
  const role = normalizeRole(user.role);
  if (role === "systemadmin") return "/admin/users";
  if (role === "businessadmin") return "/admin/business/trees";
  return null;
};

/* ===== Safe Image Component (đồng bộ với UserProfile) ===== */
function normalizeImageUrl(raw = "") {
  if (!raw) return "";
  let u = String(raw).trim();

  // Xử lý relative URLs (bắt đầu với /)
  if (u.startsWith("/") && !u.startsWith("//")) {
    const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:7237";
    // Loại bỏ trailing slash từ API_BASE nếu có
    const baseUrl = API_BASE.replace(/\/$/, "");
    u = `${baseUrl}${u}`;
  }

  // Xử lý protocol-relative URLs (bắt đầu với //)
  if (u.startsWith("//")) {
    u = `https:${u}`;
  }

  // Chỉ chuyển http sang https nếu không phải localhost (để tránh SSL issues trong development)
  if (u.startsWith("http://") && !u.includes("localhost")) {
    u = "https://" + u.slice(7);
  }

  // Xử lý Google Drive URLs
  let m = u.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m && m[1]) u = `https://drive.google.com/uc?export=view&id=${m[1]}`;
  m = u.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (m && m[1]) u = `https://drive.google.com/uc?export=view&id=${m[1]}`;
  m = u.match(/drive\.google\.com\/uc\?(?:export=[^&]+&)?id=([^&]+)/);
  if (m && m[1]) u = `https://drive.google.com/uc?export=view&id=${m[1]}`;

  // Xử lý Dropbox URLs
  if (/dropbox\.com/.test(u)) {
    u = u
      .replace("www.dropbox.com", "dl.dropboxusercontent.com")
      .replace(/\?dl=0$/, "?dl=1");
  }

  return u;
}

function SafeImage({ src, alt = "", className = "" }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setUrl(normalizeImageUrl(src || ""));
    setFailed(false);
    setTried(false);
  }, [src]);

  function onError() {
    if (tried) {
      setFailed(true);
      return;
    }
    setTried(true);

    // Thử fallback cho Google Drive
    if (/drive\.google\.com\/uc\?/.test(url)) {
      setUrl(url.replace("export=view", "export=download"));
      return;
    }

    // Thử fallback từ HTTPS sang HTTP cho localhost (development)
    if (
      url.includes("https://localhost") &&
      !url.includes("http://localhost")
    ) {
      const httpUrl = url.replace("https://", "http://");
      setUrl(httpUrl);
      return;
    }

    setFailed(true);
  }

  if (!url || failed) {
    return (
      <div className="w-full h-full grid place-items-center">
        <UserIcon className="h-6 w-6 text-neutral-500" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      onError={onError}
    />
  );
}

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
  const [notificationMenu, setNotificationMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Đọc avatar từ localStorage profile nếu user.ProfileImageUrl không có
  // Sử dụng key theo userId để tránh avatar bị dùng chung giữa các tài khoản
  const [profileAvatar, setProfileAvatar] = useState(() => {
    if (!user?.userId) return "";
    try {
      const profileKey = `mm_user_profile_v3_${user.userId}`;
      const profile = localStorage.getItem(profileKey);
      if (profile) {
        const parsed = JSON.parse(profile);
        return parsed?.avatarUrl || "";
      }
    } catch {}
    return "";
  });

  // Lắng nghe thay đổi trong localStorage profile (theo userId)
  // Và cập nhật user từ localStorage để sync ProfileImageUrl
  useEffect(() => {
    if (!user?.userId) {
      setProfileAvatar("");
      return;
    }

    function handleStorageChange() {
      try {
        // Đọc từ user-specific profile localStorage
        const profileKey = `mm_user_profile_v3_${user.userId}`;
        const profile = localStorage.getItem(profileKey);
        if (profile) {
          const parsed = JSON.parse(profile);
          setProfileAvatar(parsed?.avatarUrl || "");
        } else {
          // Nếu không có trong profile localStorage, thử đọc từ user localStorage
          const userStr = localStorage.getItem("user");
          if (userStr) {
            try {
              const userFromStorage = JSON.parse(userStr);
              if (userFromStorage?.ProfileImageUrl) {
                setProfileAvatar(userFromStorage.ProfileImageUrl);
              }
            } catch {}
          }
        }
      } catch {}
    }

    // Lắng nghe storage event (từ tab khác) và custom event (từ cùng tab)
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userProfileUpdated", handleStorageChange);

    // Load initial value
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userProfileUpdated", handleStorageChange);
    };
  }, [user?.userId, user?.ProfileImageUrl]);

  const [activeMenu, setActiveMenu] = useState(menuItems?.[0]?.id || "");
  const [isTop, setIsTop] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  const menuCloseTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    onLogin();
    navigate("/auth");
  };

  const handleRegisterClick = () => {
    onRegister();
    navigate("/auth");
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/auth");
  };

  const palette = useMemo(
    () => ({
      bg: "#1F302F",
      leaf: "#D1DFB6",
      ivory: "#FBFFDF",
      accent: "#FFFFA5",
    }),
    []
  );

  // Filter and add menu items based on user role
  const filteredMenuItems = useMemo(() => {
    let items = [...menuItems];

    // Remove "Quản lý vườn & cây" for guests
    if (isGuest(user)) {
      items = items.filter((item) => item.id !== "quan-ly");
    }

    // Add "Thư viện Cây" for users and guests, but not admins
    if (!isAdmin(user)) {
      items.push({
        id: "thu-vien-cay",
        label: "Thư viện Cây",
        href: "/plants",
      });
    }

    return items;
  }, [menuItems, user]);

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".avatar-menu-area")) setAvatarMenu(false);
      if (!e.target.closest(".notification-menu-area"))
        setNotificationMenu(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setIsTop(currentScrollY < 60);

      // Show header when scrolling up, hide when scrolling down
      if (currentScrollY < 60) {
        // Always show header at the top
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down - hide header
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up - show header
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch notifications and unread count
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        // Fetch recent notifications (first page, 5 items)
        const notificationsResponse =
          await NotificationRepository.getUserNotifications(1, 5, null, null);
        if (notificationsResponse.success) {
          setNotifications(notificationsResponse.data || []);
        }

        // Fetch unread count
        const unreadResponse = await NotificationRepository.getUnreadCount();
        if (unreadResponse.success) {
          setUnreadCount(unreadResponse.data?.unreadCount || 0);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Drawer open/close (chậm & mượt hơn)
  const openMenu = () => {
    // Nếu đang trong quá trình đóng (có timeout hoặc menuVisible=true nhưng menuAnimOpen=false), cancel và mở lại ngay
    if (menuCloseTimeoutRef.current || (menuVisible && !menuAnimOpen)) {
      if (menuCloseTimeoutRef.current) {
        clearTimeout(menuCloseTimeoutRef.current);
        menuCloseTimeoutRef.current = null;
      }
      // Mở lại ngay lập tức, không cần đợi animation frame
      setMenuOpen(true);
      setMenuAnimOpen(true);
      // Đảm bảo menuVisible vẫn là true
      if (!menuVisible) {
        setMenuVisible(true);
      }
      return;
    }
    // Nếu đã mở rồi thì không làm gì
    if (menuVisible && menuAnimOpen) return;
    // Mở sidebar mới
    setMenuVisible(true);
    setMenuOpen(true);
    // Đảm bảo animation chạy mượt bằng cách đợi DOM render xong
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMenuAnimOpen(true);
      });
    });
  };
  const closeMenu = () => {
    if (!menuVisible) return;
    // Clear timeout cũ nếu có
    if (menuCloseTimeoutRef.current) {
      clearTimeout(menuCloseTimeoutRef.current);
    }
    setMenuAnimOpen(false);
    setMenuOpen(false);
    menuCloseTimeoutRef.current = setTimeout(() => {
      setMenuVisible(false);
      menuCloseTimeoutRef.current = null;
    }, 820); // khớp overlay/panel
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
          isHeaderVisible ? "translate-y-0" : "-translate-y-full",
        ].join(" ")}
        style={!isTop ? { background: `#1F302FE6` } : undefined}
        data-testid="mmheader"
      >
        <div className="w-full px-3 sm:px-4 md:px-6 h-[80px] flex items-center gap-2 sm:gap-3 md:gap-5">
          {/* Logo */}
          <a
            href="#"
            className="inline-flex items-center gap-1 outline-none focus:outline-none active:outline-none flex-shrink-0"
            onClick={(e) => {
              navigate("/");
            }}
          >
            <img
              src="/logo/HeaderLogo.png"
              alt="Mầm Mới Logo"
              className="h-12 sm:h-14 md:h-15 lg:h-18 w-auto object-contain flex-shrink-0"
            />
            <span
              className="font-semibold tracking-wide select-none text-sm sm:text-base md:text-lg whitespace-nowrap"
              style={{ color: isTop ? palette.ivory : palette.leaf }}
            >
              MẦM MỚI
            </span>
          </a>

          {/* Back button */}
          <button
            onClick={() => {
              // Force reload data khi quay lại bằng cách dispatch event trước khi navigate
              window.dispatchEvent(
                new CustomEvent("mm:navigation:force-reload")
              );
              navigate(-1);
            }}
            className="w-11 h-11 grid place-items-center rounded-full shadow transition hover:scale-[1.03] focus:outline-none"
            style={{ background: palette.ivory, color: palette.bg }}
            aria-label="Quay lại"
            title="Quay lại"
            data-testid="mm-back-btn"
          >
            <ArrowLeft className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
          </button>

          <div className="flex-1 min-w-0" />

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
            {/* Notification bell */}
            {user && (
              <div className="hidden sm:block relative notification-menu-area">
                <button
                  onClick={() => setNotificationMenu((prev) => !prev)}
                  className="w-9 h-9 sm:w-11 sm:h-11 grid place-items-center rounded-full shadow transition hover:scale-[1.03] focus:outline-none relative flex-shrink-0"
                  style={{ background: palette.ivory, color: palette.bg }}
                  aria-label="Thông báo"
                  title="Thông báo"
                >
                  <Bell className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow"
                      style={{ background: "#EF4444" }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {notificationMenu && (
                  <div className="absolute right-0 mt-3 w-[320px] sm:w-[380px] max-w-[calc(100vw-2rem)] bg-white text-[#1F302F] rounded-xl shadow-2xl z-[999] max-h-[500px] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm sm:text-lg whitespace-nowrap">
                        Thông báo
                      </h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                          {unreadCount} chưa đọc
                        </span>
                      )}
                    </div>

                    {/* Notifications list */}
                    <div className="overflow-y-auto max-h-[400px]">
                      {notifications.length === 0 ? (
                        <div className="px-3 sm:px-4 py-6 sm:py-8 text-center text-gray-500 text-sm sm:text-base">
                          Không có thông báo
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => {
                            const formatDate = (dateString) => {
                              if (!dateString) return "Vừa xong";
                              const date = new Date(dateString);
                              const now = new Date();
                              const diff = now - date;
                              const minutes = Math.floor(diff / 60000);
                              const hours = Math.floor(diff / 3600000);
                              const days = Math.floor(diff / 86400000);

                              if (minutes < 1) return "Vừa xong";
                              if (minutes < 60) return `${minutes} phút trước`;
                              if (hours < 24) return `${hours} giờ trước`;
                              if (days < 7) return `${days} ngày trước`;
                              return date.toLocaleDateString("vi-VN");
                            };

                            return (
                              <div
                                key={notification.notificationId}
                                className={[
                                  "px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 transition cursor-pointer",
                                  !notification.isRead && "bg-blue-50/50",
                                ].join(" ")}
                                onClick={() => {
                                  // Get route based on notification type and user role
                                  const route = getNotificationRoute(
                                    notification,
                                    user
                                  );
                                  navigate(route || "/notifications");
                                  setNotificationMenu(false);
                                  if (!notification.isRead) {
                                    NotificationRepository.markNotificationsAsRead(
                                      [notification.notificationId]
                                    );
                                  }
                                }}
                              >
                                <div className="flex gap-2 sm:gap-3">
                                  {/* Icon */}
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-100">
                                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4
                                        className={[
                                          "font-medium text-xs sm:text-sm break-words",
                                          !notification.isRead &&
                                            "font-semibold",
                                        ].join(" ")}
                                      >
                                        {notification.title}
                                      </h4>
                                      {!notification.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                      )}
                                    </div>
                                    {notification.message && (
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 break-words">
                                        {notification.message}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1.5 whitespace-nowrap">
                                      {formatDate(notification.sentAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Footer - Xem tất cả */}
                    {notifications.length > 0 && (
                      <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200">
                        <button
                          className="w-full text-center text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                          onClick={() => {
                            setNotificationMenu(false);
                            navigate("/notifications");
                          }}
                        >
                          Xem tất cả thông báo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* If logged in → avatar dropdown. If not → login/register */}
            {user ? (
              <div className="hidden md:block relative avatar-menu-area">
                {/* Ưu tiên profileAvatar (từ user-specific localStorage) vì nó được cập nhật ngay lập tức */}
                {profileAvatar || user.ProfileImageUrl ? (
                  <button
                    onClick={() => setAvatarMenu((prev) => !prev)}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-white/40 shadow focus:outline-none transition hover:scale-[1.03] grid place-items-center flex-shrink-0"
                    style={{ background: palette.ivory }}
                    aria-label="Tài khoản"
                    title="Tài khoản"
                  >
                    <SafeImage
                      src={profileAvatar || user.ProfileImageUrl}
                      alt="avatar"
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => setAvatarMenu((prev) => !prev)}
                    className="w-9 h-9 sm:w-11 sm:h-11 grid place-items-center rounded-full shadow transition hover:scale-[1.03] focus:outline-none flex-shrink-0"
                    style={{ background: palette.ivory, color: palette.bg }}
                    aria-label="Tài khoản"
                    title="Tài khoản"
                  >
                    <UserIcon className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
                  </button>
                )}

                {/* Dropdown */}
                {avatarMenu && (
                  <div className="absolute right-0 mt-3 w-56 min-w-[200px] max-w-[90vw] bg-white text-[#1F302F] rounded-xl shadow-lg z-[999]">
                    {/* Avatar and Name Section */}
                    <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                        {profileAvatar || user.ProfileImageUrl ? (
                          <SafeImage
                            src={profileAvatar || user.ProfileImageUrl}
                            alt="avatar"
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div
                            className="w-full h-full grid place-items-center"
                            style={{
                              background: palette.ivory,
                              color: palette.bg,
                            }}
                          >
                            <UserIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1F302F] truncate">
                          {user.fullName || user.name || "User"}
                        </p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {isAdmin(user) ? (
                        <button
                          className="block w-full text-left px-4 py-2.5 hover:bg-gray-100 text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                          onClick={() => {
                            const adminPath = getAdminPath(user);
                            if (adminPath) {
                              navigate(adminPath);
                            }
                            setAvatarMenu((prev) => !prev);
                          }}
                          title="Quản lý Admin"
                        >
                          Quản lý Admin
                        </button>
                      ) : !isGuest(user) ? (
                        <button
                          className="block w-full text-left px-4 py-2.5 hover:bg-gray-100 text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                          onClick={() => {
                            navigate("/garden");
                            setAvatarMenu((prev) => !prev);
                          }}
                          title="Vườn của tôi"
                        >
                          Vườn của tôi
                        </button>
                      ) : null}

                      <button
                        className="block w-full text-left px-4 py-2.5 hover:bg-gray-100 text-sm whitespace-nowrap"
                        onClick={() => {
                          navigate("/profile");
                          setAvatarMenu((prev) => !prev);
                        }}
                        title="Hồ sơ"
                      >
                        Hồ sơ
                      </button>

                      {!isAdmin(user) && (
                        <button
                          className="block w-full text-left px-4 py-2.5 hover:bg-gray-100 text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                          onClick={() => {
                            navigate("/reports");
                            setAvatarMenu((prev) => !prev);
                          }}
                          title="Quản lý báo cáo"
                        >
                          Quản lý báo cáo
                        </button>
                      )}

                      <button
                        className="block w-full text-left px-4 py-2.5 hover:bg-gray-100 text-sm whitespace-nowrap text-red-500"
                        onClick={handleLogoutClick}
                        title="Đăng xuất"
                      >
                        Đăng xuất
                      </button>
                    </div>
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
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base bg-white/0 text-white hover:bg-white/10 focus:outline-none whitespace-nowrap"
                >
                  Đăng nhập
                </button>
                <div className="w-px bg-white/20" />
                <button
                  onClick={handleRegisterClick}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium focus:outline-none whitespace-nowrap"
                  style={{ background: palette.accent, color: "#1F302F" }}
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* Menu button */}
            <button
              onClick={openMenu}
              className="w-9 h-9 sm:w-11 sm:h-11 grid place-items-center rounded-full shadow transition hover:scale-[1.03] focus:outline-none flex-shrink-0"
              style={{ background: palette.ivory, color: palette.bg }}
              aria-label="Mở menu"
              title="Menu"
              data-testid="mm-menu-btn"
            >
              <Menu className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" />
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
              opacity: menuAnimOpen ? 1 : 0, // chỉ fade
              transition: "opacity var(--mm-uline-dur) var(--mm-uline-ease)",
              pointerEvents: menuAnimOpen ? "auto" : "none", // tránh bắt click khi ẩn
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
            <div className="flex-1 min-h-0 grid place-content-center px-4 sm:px-8 md:px-10 overflow-hidden">
              <nav className="w-full max-w-[360px]">
                <ul className="flex flex-col gap-3">
                  {isAdmin(user) ? (
                    <li>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const adminPath = getAdminPath(user);
                          if (adminPath) {
                            closeMenu();
                            navigate(adminPath);
                          }
                        }}
                        className={[
                          "group relative block w-fit max-w-full px-1 py-2 rounded-md",
                          "text-[24px] sm:text-[28px] md:text-[32px] leading-snug font-bold",
                          "text-[#EAF5C8]/90 hover:text-[#FFFFDD]",
                          "break-words overflow-wrap-anywhere",
                        ].join(" ")}
                        style={{
                          animation: `mm-stagger-up 520ms cubic-bezier(.2,.8,.2,1) 200ms both`,
                        }}
                      >
                        <span className="relative z-10 break-words">
                          Quản lý hệ thống
                        </span>
                        {/* underline chậm hơn */}
                        <span
                          aria-hidden
                          className="mm-underline"
                          style={{
                            backgroundImage: `linear-gradient(90deg, ${palette.accent}, ${palette.accent})`,
                          }}
                        />
                      </button>
                    </li>
                  ) : (
                    filteredMenuItems.map((item, idx) => {
                      const active = activeMenu === item.id;
                      const isReportLink = item.href === "/report";
                      const isDangKyLink = item.id === "dang-ky";
                      return (
                        <li key={item.id}>
                          {isReportLink || isDangKyLink ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveMenu(item.id);
                                closeMenu();
                                // Redirect guests to login when clicking "Đăng ký dịch vụ"
                                if (isDangKyLink && isGuest(user)) {
                                  navigate("/auth");
                                } else {
                                  navigate(item.href);
                                }
                              }}
                              className={[
                                "group relative block w-fit max-w-full px-1 py-2 rounded-md",
                                "text-[24px] sm:text-[28px] md:text-[32px] leading-snug font-bold",
                                active
                                  ? "text-[#FFFFDD]"
                                  : "text-[#EAF5C8]/90 hover:text-[#FFFFDD]",
                                "break-words overflow-wrap-anywhere",
                              ].join(" ")}
                              style={{
                                animation: `mm-stagger-up 520ms cubic-bezier(.2,.8,.2,1) ${
                                  200 + idx * 140
                                }ms both`,
                              }}
                            >
                              <span className="relative z-10 break-words">
                                {item.label}
                              </span>
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
                                "group relative block w-fit max-w-full px-1 py-2 rounded-md",
                                "text-[24px] sm:text-[28px] md:text-[32px] leading-snug font-bold",
                                active
                                  ? "text-[#FFFFDD]"
                                  : "text-[#EAF5C8]/90 hover:text-[#FFFFDD]",
                                "break-words overflow-wrap-anywhere",
                              ].join(" ")}
                              style={{
                                animation: `mm-stagger-up 520ms cubic-bezier(.2,.8,.2,1) ${
                                  200 + idx * 140
                                }ms both`,
                              }}
                            >
                              <span className="relative z-10 break-words">
                                {item.label}
                              </span>
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
                    })
                  )}
                </ul>
              </nav>
            </div>

            {/* Bottom Auth — không viền, không ring xanh */}
            <div className="sticky bottom-0 left-0 right-0 p-4 sm:p-6 bg-[#1A3433]/90 backdrop-blur-sm">
              {user ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleLogoutClick}
                    className="h-10 sm:h-11 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm sm:text-base font-medium whitespace-nowrap"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={handleLoginClick}
                    className="flex-1 h-10 sm:h-11 rounded-full text-[#EAF5C8] bg-white/5 border border-white/20 text-sm sm:text-base whitespace-nowrap"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={handleRegisterClick}
                    className="flex-1 h-10 sm:h-11 rounded-full font-semibold text-sm sm:text-base whitespace-nowrap"
                    style={{
                      background: `linear-gradient(180deg, ${palette.accent}, #F4F39A)`,
                      color: "#1F302F",
                    }}
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
