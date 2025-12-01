import React from "react";
import { NavLink, Navigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ClipboardList,
  CreditCard,
  Flower2,
  Layers,
  Leaf,
  Package,
  RefreshCcw,
  Sprout,
  Users,
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
      key: "reports",
      label: "Quản lý báo cáo",
      icon: BarChart3,
      path: "/admin/business/reports",
    },
    {
      key: "lifecycle",
      label: "Quy trình vòng đời",
      icon: RefreshCcw,
      path: "/admin/business/lifecycle",
    },
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
      key: "soils",
      label: "Quản lý loại đất",
      icon: Layers,
      path: "/admin/business/soils",
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

  return (
    <div className="flex min-h-screen w-full text-slate-50">
      {/* Sidebar */}
      <aside className="relative flex w-72 flex-col border-r border-emerald-900/40 bg-black/20 px-5 pb-6 text-emerald-50 backdrop-blur-2xl">
        {/* Wrapper dùng sticky để khối sidebar luôn ở giữa viewport khi cuộn */}
        <div className="sticky top-1/2 -translate-y-1/2 pt-28 lg:pt-32">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
              Mầm Mới
            </p>
            <p className="mt-1 text-xl font-semibold text-emerald-50">
              Admin Console
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all",
                      "text-emerald-50/80 hover:bg-emerald-500/10 hover:text-emerald-50",
                      isActive &&
                        "bg-emerald-500/15 text-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.45)]"
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-8 pt-4 text-xs text-emerald-100/60">
            <p className="font-medium">{title}</p>
            <p className="text-emerald-200/70">{description}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto flex h-full w-full flex-col px-4 pb-8 pt-28 text-slate-900 sm:px-6 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
