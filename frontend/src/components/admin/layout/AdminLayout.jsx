import React, { useState } from "react";
import { NavLink, Navigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ClipboardList,
  CreditCard,
  Flower2,
  Layers,
  Leaf,
  Menu,
  Package,
  RefreshCcw,
  Sprout,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/API/context/AuthContext";

const ROLE_NAV_ITEMS = {
  systemadmin: [
    {
      key: "users",
      label: "Quản lý người dùng",
      icon: Users,
      path: "/admin/users",
    },
    {
      key: "billing",
      label: "Quản lý thanh toán",
      icon: CreditCard,
      path: "/admin/subscriptions",
    },
    {
      key: "subscription-plans",
      label: "Quản lý gói dịch vụ",
      icon: Package,
      path: "/admin/subscription-plans",
    },
    {
      key: "reports",
      label: "Report",
      icon: BarChart3,
      path: "/admin/reports",
    },
    {
      key: "notifications",
      label: "Quản lý thông báo",
      icon: Bell,
      path: "/admin/notifications",
    },
  ],
  businessadmin: [
    {
      key: "tree-types",
      label: "Quản lý loại cây",
      icon: Sprout,
      path: "/admin/business/tree-types",
    },
    {
      key: "tree-varieties",
      label: "Quản lý giống cây",
      icon: Flower2,
      path: "/admin/business/tree-varieties",
    },
    {
      key: "lifecycle",
      label: "Quy trình vòng đời",
      icon: RefreshCcw,
      path: "/admin/business/lifecycle",
    },
    {
      key: "soils",
      label: "Quản lý loại đất",
      icon: Layers,
      path: "/admin/business/soils",
    },
    {
      key: "reports",
      label: "Quản lý báo cáo",
      icon: BarChart3,
      path: "/admin/business/reports",
    },
  ],
};

const ROLE_SUMMARY = {
  systemadmin: {
    title: "System Admin",
    description: "Giám sát người dùng, thanh toán và báo cáo.",
  },
  businessadmin: {
    title: "Business Admin",
    description: "Quản lý cây trồng, loại cây, giống cây và báo cáo sản xuất.",
  },
};

const VALID_ADMIN_ROLES = ["systemadmin", "businessadmin"];

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ensure user is logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const roleKey = (user?.role || "").toLowerCase();

  // Only allow valid admin roles
  if (!VALID_ADMIN_ROLES.includes(roleKey)) {
    return <Navigate to="/" replace />;
  }

  // Get navigation items for the user's role
  const navItems = ROLE_NAV_ITEMS[roleKey] || [];
  const { title, description } = ROLE_SUMMARY[roleKey] || {
    title: "Admin",
    description: "",
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen w-full text-slate-50" style={{ margin: 0, padding: 0 }}>
      {/* Mobile hamburger button - positioned at bottom left to avoid header */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-50 p-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-50 lg:z-20 h-full lg:h-auto w-72 border-r border-emerald-900/40 bg-black/90 lg:bg-black/20 text-emerald-50 backdrop-blur-2xl transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Close button on mobile */}
        <button
          onClick={closeSidebar}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-500/20 transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Sticky wrapper - luôn ở giữa viewport khi scroll */}
        <div
          className="sticky px-5 pt-12 lg:pt-0"
          style={{
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
              Mầm Mới
            </p>
            <p className="mt-1 text-lg lg:text-xl font-semibold text-emerald-50">
              Admin Console
            </p>
          </div>

          <nav className="space-y-1 lg:space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 lg:gap-3 rounded-lg lg:rounded-xl px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base font-semibold transition-all",
                      "text-emerald-50/80 hover:bg-emerald-500/10 hover:text-emerald-50",
                      isActive &&
                      "bg-emerald-500/15 text-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.45)]"
                    )
                  }
                >
                  <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 lg:mt-8 pt-4 text-xs text-emerald-100/60">
            <p className="font-medium">{title}</p>
            <p className="text-emerald-200/70">{description}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-auto w-full">
        <div className="mx-auto flex h-full w-full flex-col px-4 pb-8 pt-16 lg:pt-28 text-slate-900 sm:px-6 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}

