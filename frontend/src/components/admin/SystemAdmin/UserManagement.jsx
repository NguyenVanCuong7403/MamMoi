import React, { useEffect, useMemo, useState } from "react";
import {
  Filter,
  Leaf,
  LineChart,
  MoreVertical,
  RefreshCcw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Trash,
} from "lucide-react";
import { LivingBackground } from "@/components/background";
import AdminLayout from "../layout/AdminLayout";
import { InsightAreaChart, SegmentDistributionCard } from "../components/AnalyticsCharts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const BACKGROUND_PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const TIME_WINDOWS = [
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
];

const ROLE_OPTIONS = [
  { value: "all", label: "Tất cả vai trò" },
  { value: "Farmer", label: "Nông hộ" },
  { value: "BusinessAdmin", label: "Quản trị doanh nghiệp" },
  { value: "SystemAdmin", label: "Quản trị hệ thống" },
];

const ROLE_META = {
  Farmer: {
    label: "Nông hộ",
    className: "bg-lime-50 text-lime-700 border border-lime-100",
  },
  BusinessAdmin: {
    label: "Quản trị doanh nghiệp",
    className: "bg-sky-50 text-sky-700 border border-sky-100",
  },
  SystemAdmin: {
    label: "Quản trị hệ thống",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
};

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Tạm dừng" },
  { value: "banned", label: "Khoá" },
];

const PACKAGE_OPTIONS = [
  { value: "all", label: "Tất cả gói" },
  { value: "seedling", label: "Gói Ươm Mầm" },
  { value: "orchard", label: "Gói Vườn Xanh" },
  { value: "harvest", label: "Gói Thu Hoạch" },
];

const STATUS_META = {
  active: { label: "Đang hoạt động", className: "bg-emerald-50 text-emerald-700" },
  inactive: { label: "Tạm dừng", className: "bg-amber-50 text-amber-700" },
  banned: { label: "Đã khoá", className: "bg-rose-50 text-rose-700" },
};

const PLAN_COLORS = {
  seedling: "#22c55e",
  orchard: "#0f9d58",
  harvest: "#064e3b",
};

const DASHBOARD_DATA = {
  week: {
    label: "so với tuần trước",
    stats: {
      total: { value: 4820, change: 0.12, icon: Users },
      active: { value: 3210, change: 0.08, icon: UserCheck },
      inactive: { value: 138, change: -0.05, icon: UserMinus },
      new: { value: 164, change: 0.22, icon: UserPlus },
    },
    trend: {
      change: 0.14,
      series: [
        { label: "T2", value: 42 },
        { label: "T3", value: 58 },
        { label: "T4", value: 54 },
        { label: "T5", value: 63 },
        { label: "T6", value: 70 },
        { label: "T7", value: 68 },
        { label: "CN", value: 61 },
      ],
    },
    packages: {
      change: 0.05,
      data: [
        { key: "seedling", label: "Seedling", value: 46 },
        { key: "orchard", label: "Orchard Pro", value: 34 },
        { key: "harvest", label: "Harvest Enterprise", value: 20 },
      ],
    },
  },
  month: {
    label: "so với tháng trước",
    stats: {
      total: { value: 19120, change: 0.18, icon: Users },
      active: { value: 14580, change: 0.11, icon: UserCheck },
      inactive: { value: 612, change: -0.04, icon: UserMinus },
      new: { value: 980, change: 0.27, icon: UserPlus },
    },
    trend: {
      change: 0.19,
      series: Array.from({ length: 30 }).map((_, idx) => ({
        label: `Ngày ${idx + 1}`,
        value: 30 + Math.round(Math.sin(idx / 3) * 12 + (idx % 5) * 1.8),
      })),
    },
    packages: {
      change: 0.08,
      data: [
        { key: "seedling", label: "Seedling", value: 41 },
        { key: "orchard", label: "Orchard Pro", value: 37 },
        { key: "harvest", label: "Harvest Enterprise", value: 22 },
      ],
    },
  },
  year: {
    label: "so với năm trước",
    stats: {
      total: { value: 221340, change: 0.32, icon: Users },
      active: { value: 170210, change: 0.24, icon: UserCheck },
      inactive: { value: 7620, change: -0.09, icon: UserMinus },
      new: { value: 17840, change: 0.41, icon: UserPlus },
    },
    trend: {
      change: 0.28,
      series: Array.from({ length: 12 }).map((_, idx) => ({
        label: `T${idx + 1}`,
        value: 260 + Math.round(Math.cos(idx / 2.3) * 40 + idx * 12),
      })),
    },
    packages: {
      change: 0.02,
      data: [
        { key: "seedling", label: "Seedling", value: 38 },
        { key: "orchard", label: "Orchard Pro", value: 36 },
        { key: "harvest", label: "Harvest Enterprise", value: 26 },
      ],
    },
  },
};

const MOCK_USERS = [
  {
    id: "USR-000245",
    name: "Nguyễn Minh Hoàng",
    email: "hoang.nm@example.com",
    role: "Farmer",
    status: "active",
    plan: "seedling",
    province: "Đồng Tháp",
    phone: "0938 112 223",
    lastLogin: "2025-11-16T09:24:00",
  },
  {
    id: "USR-000874",
    name: "Trần Thị Mai",
    email: "mai.tran@orchard.vn",
    role: "BusinessAdmin",
    status: "active",
    plan: "orchard",
    province: "Lâm Đồng",
    phone: "0987 453 776",
    lastLogin: "2025-11-14T14:05:00",
  },
  {
    id: "USR-000421",
    name: "Phạm Anh Tuấn",
    email: "tuan.pham@greengrow.vn",
    role: "SystemAdmin",
    status: "active",
    plan: "harvest",
    province: "TP. HCM",
    phone: "0903 665 991",
    lastLogin: "2025-11-13T08:41:00",
  },
  {
    id: "USR-000912",
    name: "Võ Thảo Nhi",
    email: "nhi.vo@example.com",
    role: "Farmer",
    status: "inactive",
    plan: "seedling",
    province: "Bến Tre",
    phone: "0913 733 088",
    lastLogin: "2025-10-28T19:22:00",
  },
  {
    id: "USR-000533",
    name: "Lê Quang Khải",
    email: "khai.le@citrus.io",
    role: "BusinessAdmin",
    status: "banned",
    plan: "orchard",
    province: "Hà Nội",
    phone: "0978 334 556",
    lastLogin: "2025-09-12T12:13:00",
  },
  {
    id: "USR-000278",
    name: "Đỗ Thanh Vân",
    email: "van.do@example.com",
    role: "Farmer",
    status: "active",
    plan: "seedling",
    province: "Gia Lai",
    phone: "0905 123 450",
    lastLogin: "2025-11-15T07:55:00",
  },
  {
    id: "USR-000981",
    name: "Huỳnh Tấn Tài",
    email: "tai.huynh@fruitful.vn",
    role: "BusinessAdmin",
    status: "active",
    plan: "harvest",
    province: "Cần Thơ",
    phone: "0939 889 112",
    lastLogin: "2025-11-12T16:44:00",
  },
  {
    id: "USR-000667",
    name: "Đinh Yến Nhi",
    email: "yen.nhi@example.com",
    role: "Farmer",
    status: "inactive",
    plan: "seedling",
    province: "Lâm Đồng",
    phone: "0902 441 114",
    lastLogin: "2025-10-02T10:18:00",
  },
  {
    id: "USR-000789",
    name: "Trương Quý Long",
    email: "long.truong@agrimax.vn",
    role: "BusinessAdmin",
    status: "active",
    plan: "orchard",
    province: "Nghệ An",
    phone: "0981 311 223",
    lastLogin: "2025-11-11T18:10:00",
  },
  {
    id: "USR-000812",
    name: "Hồ Khánh Linh",
    email: "linh.khanh@example.com",
    role: "Farmer",
    status: "banned",
    plan: "seedling",
    province: "Quảng Nam",
    phone: "0908 777 441",
    lastLogin: "2025-08-17T20:47:00",
  },
  {
    id: "USR-000193",
    name: "Tô Thành Phát",
    email: "phat.to@fruitflow.vn",
    role: "BusinessAdmin",
    status: "active",
    plan: "harvest",
    province: "Đà Nẵng",
    phone: "0919 620 345",
    lastLogin: "2025-11-09T13:17:00",
  },
  {
    id: "USR-000340",
    name: "Phan Ngọc Trang",
    email: "trang.phan@citrus.vn",
    role: "SystemAdmin",
    status: "active",
    plan: "harvest",
    province: "Hà Nội",
    phone: "0906 788 991",
    lastLogin: "2025-11-15T21:04:00",
  },
];

const PAGE_SIZE = 7;

const defaultFilters = {
  search: "",
  role: "all",
  status: "all",
  plan: "all",
};

function StatCard({ label, value, change, icon: Icon }) {
  const isPositive = change >= 0;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-emerald-200/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {value.toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 shadow-inner shadow-emerald-100 group-hover:bg-emerald-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <Badge
          className={cn(
            "border-0 px-2.5 py-0.5",
            isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-50 text-rose-600"
          )}
        >
          {isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
          {`${isPositive ? "+" : ""}${Math.round(change * 100)}%`}
        </Badge>
        <span className="text-slate-500">so với kỳ trước</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400/90 via-emerald-500/70 to-lime-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </div>
  );
}

// Legacy chart helpers removed in favor of shared analytics components.

function ActionMenu({ user, onOpenModal }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full border border-slate-200 p-2 text-slate-500 transition-all hover:text-emerald-600">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44 rounded-xl border-emerald-50 bg-white shadow-lg">
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            onOpenModal("details", user);
          }}
        >
          Xem chi tiết
        </DropdownMenuItem>
        {user.status === "banned" ? (
          <DropdownMenuItem
            className="text-emerald-600 focus:bg-emerald-50"
            onSelect={(event) => {
              event.preventDefault();
              onOpenModal("unlock", user);
            }}
          >
            Mở khoá người dùng
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-amber-600 focus:bg-amber-50"
            onSelect={(event) => {
              event.preventDefault();
              onOpenModal("deactivate", user);
            }}
          >
            Khoá người dùng
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-rose-600 focus:bg-rose-50"
          onSelect={(event) => {
            event.preventDefault();
            onOpenModal("delete", user);
          }}
        >
          Xoá vĩnh viễn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SystemAdminUserManagement() {
  const [timeframe, setTimeframe] = useState("week");
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState(MOCK_USERS);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [planDraft, setPlanDraft] = useState("");
  const [passwordDraft, setPasswordDraft] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [pendingRandomConfirm, setPendingRandomConfirm] = useState(false);
  const [editDraft, setEditDraft] = useState({ name: "", phone: "", role: "", email: "" });
  const [passwordError, setPasswordError] = useState("");
  const [editError, setEditError] = useState("");
  const [actionNotice, setActionNotice] = useState(null);
  const [planAcknowledged, setPlanAcknowledged] = useState(false);

  const dashboard = DASHBOARD_DATA[timeframe];

  useEffect(() => {
    setPage(1);
  }, [filters, timeframe]);

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = setTimeout(() => setActionNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [actionNotice]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = filters.search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      const matchesRole = filters.role === "all" || user.role === filters.role;
      const matchesStatus = filters.status === "all" || user.status === filters.status;
      const matchesPlan = filters.plan === "all" || user.plan === filters.plan;

      return matchesSearch && matchesRole && matchesStatus && matchesPlan;
    });
  }, [filters, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const openModal = (type, user) => {
    setSelectedUser(user);
    setActiveModal(type);
    if (type === "plan") {
      setPlanDraft(user?.plan ?? "seedling");
      setPlanAcknowledged(false);
    }
    if (type === "password") {
      setPasswordDraft("");
      setGeneratedPassword("");
      setPendingRandomConfirm(false);
    }
    if (type === "edit") {
      setEditDraft({
        name: user?.name ?? "",
        phone: user?.phone ?? "",
        role: user?.role ?? "Farmer",
        email: user?.email ?? "",
      });
    }
    setPasswordError("");
    setEditError("");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedUser(null);
    setPasswordError("");
    setEditError("");
    setGeneratedPassword("");
    setPendingRandomConfirm(false);
    setPlanAcknowledged(false);
  };

  const showNotice = (message, tone = "success") => {
    setActionNotice({ message, tone });
  };

  const handlePlanSave = () => {
    if (!selectedUser || !planDraft) return;
    if (!planAcknowledged) {
      setActionNotice({
        message: "Vui lòng xác nhận bạn đã kiểm tra và đồng ý thay đổi gói.",
        tone: "warning",
      });
      return;
    }
    setUsers((prev) =>
      prev.map((user) => (user.id === selectedUser.id ? { ...user, plan: planDraft } : user))
    );
    const planLabel = PACKAGE_OPTIONS.find((option) => option.value === planDraft)?.label ?? planDraft;
    showNotice(`Đã cập nhật gói dịch vụ của ${selectedUser.name} thành ${planLabel}.`);
    closeModal();
  };

  const applyPasswordChange = (nextPassword) => {
    if (!selectedUser) return;
    showNotice(
      `Đã đặt lại mật khẩu cho ${selectedUser.name}. Hệ thống vừa gửi email xác nhận tới ${selectedUser.email}.`
    );
    closeModal();
  };

  const handlePasswordReset = () => {
    if (!selectedUser) return;
    if (passwordDraft.length < 10) {
      setPasswordError("Mật khẩu cần tối thiểu 10 ký tự.");
      return;
    }
    setPasswordError("");
    applyPasswordChange(passwordDraft);
  };

  const handleEditSave = () => {
    if (!selectedUser) return;
    if (!editDraft.name.trim() || !editDraft.phone.trim() || !editDraft.email.trim()) {
      setEditError("Vui lòng nhập đủ họ tên, email và số điện thoại.");
      return;
    }
    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              name: editDraft.name.trim(),
              phone: editDraft.phone.trim(),
              role: editDraft.role,
              email: editDraft.email.trim(),
            }
          : user
      )
    );
    setEditError("");
    showNotice(`Đã cập nhật thông tin cho ${editDraft.name}.`);
    closeModal();
  };

  const handleDeactivateConfirm = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              status: "banned",
            }
          : user
      )
    );
    showNotice(`Đã khoá tài khoản ${selectedUser.name}.`, "warning");
    closeModal();
  };

  const handleUnlockConfirm = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              status: "active",
            }
          : user
      )
    );
    showNotice(`Đã mở khoá tài khoản ${selectedUser.name}.`);
    closeModal();
  };

  const handleDeleteConfirm = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
    showNotice(`Đã xoá vĩnh viễn tài khoản ${selectedUser.name}.`, "warning");
    closeModal();
  };

  const handleGenerateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    const random = Array.from({ length: 12 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("");
    setGeneratedPassword(random);
    setPendingRandomConfirm(true);
    setPasswordDraft("");
    setPasswordError("");
  };

  const cancelRandomPasswordFlow = () => {
    setPendingRandomConfirm(false);
    setGeneratedPassword("");
  };

  const confirmRandomPasswordFlow = () => {
    if (!generatedPassword) return;
    applyPasswordChange(generatedPassword);
  };

  return (
    <>
      <LivingBackground
        baseColor={BACKGROUND_PALETTE.bg}
        palette={[BACKGROUND_PALETTE.leaf, BACKGROUND_PALETTE.ivory, BACKGROUND_PALETTE.accent]}
        density={28}
      />
      <div className="relative min-h-screen z-10">
        <AdminLayout>
          <>
            <div className="space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                Quản trị hệ thống
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Quản lý người dùng</h1>
              <p className="text-emerald-100/80">
                Giám sát, lọc và thao tác nhanh với toàn bộ user trong hệ sinh thái Mầm Mới.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/30 bg-white/10 p-1 backdrop-blur">
                {TIME_WINDOWS.map((option) => {
                  const isActive = timeframe === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTimeframe(option.value)}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                        isActive
                          ? "bg-white text-emerald-700 shadow-lg shadow-emerald-500/30"
                          : "text-white/70 hover:text-white"
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Đồng bộ dữ liệu
              </Button>
            </div>
          </div>

          {actionNotice && (
            <div
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm",
                actionNotice.tone === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              )}
            >
              {actionNotice.message}
            </div>
          )}

          <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-2xl text-slate-900">Tổng quan người dùng</CardTitle>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <LineChart className="h-4 w-4 text-emerald-600" />
                Dữ liệu {TIME_WINDOWS.find((t) => t.value === timeframe)?.label?.toLowerCase()} hiện tại{" "}
                <span className="font-semibold text-emerald-600">
                  {dashboard.label}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Object.entries(dashboard.stats).map(([key, config]) => (
                  <StatCard
                    key={key}
                    label={
                      {
                        total: "Tổng số người dùng",
                        active: "Đang hoạt động",
                        inactive: "Tạm dừng / khoá",
                        new: "Tài khoản mới",
                      }[key]
                    }
                    value={config.value}
                    change={config.change}
                    icon={config.icon}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-transparent text-slate-900 shadow-none">
            <CardContent className="grid gap-6 md:grid-cols-2 p-0">
              <InsightAreaChart
                data={dashboard.trend.series}
                change={dashboard.trend.change}
                title="Lượt đăng ký người dùng"
                subtitle="Đăng ký mới"
              />
              <SegmentDistributionCard
                data={dashboard.packages.data}
                change={dashboard.packages.change}
                title="Phân bổ gói dịch vụ"
                subtitle="Tỷ lệ người dùng"
              />
            </CardContent>
          </Card>

          <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
            <CardHeader>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="text-2xl text-slate-900">Danh sách người dùng</CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Leaf className="h-4 w-4 text-emerald-600" />
                  {filteredUsers.length} người dùng khớp bộ lọc
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="relative">
                    <Input
                      placeholder="Tìm theo tên hoặc email..."
                      value={filters.search}
                      onChange={(event) => handleFilterChange("search", event.target.value)}
                      className="rounded-xl border-slate-200 bg-white pl-10 text-slate-900 shadow-inner shadow-emerald-50 placeholder:text-slate-400"
                    />
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <Select value={filters.role} onValueChange={(value) => handleFilterChange("role", value)}>
                    <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900">
                      <SelectValue placeholder="Vai trò" className="text-slate-500" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-2">
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                    <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900">
                      <SelectValue placeholder="Trạng thái" className="text-slate-500" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-2">
                  <Select value={filters.plan} onValueChange={(value) => handleFilterChange("plan", value)}>
                    <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900">
                      <SelectValue placeholder="Loại gói" className="text-slate-500" />
                    </SelectTrigger>
                    <SelectContent>
                      {PACKAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 w-full rounded-xl border-emerald-100 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100"
                    onClick={handleResetFilters}
                  >
                    Đặt lại bộ lọc
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Hiển thị {paginatedUsers.length} / {filteredUsers.length} người dùng
                </p>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" className="text-slate-500 hover:bg-slate-100">
                    Xuất CSV
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-emerald-600 hover:bg-emerald-50"
                    onClick={handleResetFilters}
                  >
                    Làm mới nhanh
                  </Button>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                <Table>
                  <TableHeader className="sticky top-0 bg-emerald-50/80 backdrop-blur">
                    <TableRow className="border-none text-xs uppercase tracking-wider text-slate-500">
                      <TableHead>Mã người dùng</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Gói hiện tại</TableHead>
                      <TableHead>Đăng nhập gần nhất</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id} className="border-b border-slate-100 bg-white/60 transition hover:bg-emerald-50/40">
                        <TableCell className="font-semibold text-slate-900">{user.id}</TableCell>
                        <TableCell className="text-slate-800">{user.name}</TableCell>
                        <TableCell className="text-slate-500">{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "px-3 py-1 text-xs font-semibold",
                              ROLE_META[user.role]?.className ?? "bg-slate-100 text-slate-600 border border-slate-200"
                            )}
                          >
                            {ROLE_META[user.role]?.label ?? user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("border-0", STATUS_META[user.status]?.className)}>
                            {STATUS_META[user.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">
                          {PACKAGE_OPTIONS.find((option) => option.value === user.plan)?.label}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {new Date(user.lastLogin).toLocaleString("vi-VN", {
                            hour12: false,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <ActionMenu
                            user={user}
                            onOpenModal={openModal}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredUsers.length === 0 && (
                  <div className="p-10 text-center text-slate-400">Không có người dùng phù hợp.</div>
                )}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="text-sm"
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage((prev) => Math.max(1, prev - 1));
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        isActive={page === index + 1}
                        onClick={(event) => {
                          event.preventDefault();
                          setPage(index + 1);
                        }}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      className="text-sm"
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage((prev) => Math.min(totalPages, prev + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
      </div>

      <Dialog open={activeModal === "details"} onOpenChange={closeModal}>
        <DialogContent className="max-w-3xl rounded-2xl border border-emerald-50 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin chi tiết</DialogTitle>
            <DialogDescription>
              Hồ sơ chi tiết của {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
          <div className="grid gap-6 md:grid-cols-[3fr,2fr]">
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Họ tên</p>
                <p className="text-lg font-semibold text-slate-900">{selectedUser.name}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium break-all">{selectedUser.email}</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">Số điện thoại</p>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">Vai trò</p>
                  <Badge
                    className={cn(
                      "mt-1 px-3 py-1 text-xs font-semibold",
                      ROLE_META[selectedUser.role]?.className ?? "bg-slate-100 text-slate-600 border border-slate-200"
                    )}
                  >
                    {ROLE_META[selectedUser.role]?.label ?? selectedUser.role}
                  </Badge>
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">Trạng thái</p>
                  <Badge className={cn("mt-1 border-0", STATUS_META[selectedUser.status]?.className)}>
                    {STATUS_META[selectedUser.status]?.label}
                  </Badge>
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-sm text-slate-500">Địa phương</p>
                <p className="font-medium">{selectedUser.province}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-sm text-slate-500">Gói hiện tại</p>
                <p className="text-lg font-semibold text-slate-900">
                  {PACKAGE_OPTIONS.find((option) => option.value === selectedUser.plan)?.label}
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Thao tác nhanh</p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                  onClick={() => openModal("plan", selectedUser)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Nâng / hạ cấp gói
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={() => openModal("edit", selectedUser)}
                >
                  <UserCheck className="h-4 w-4" />
                  Sửa thông tin
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={() => openModal("password", selectedUser)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Đặt lại mật khẩu
                </Button>
                {selectedUser?.status === "banned" ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => openModal("unlock", selectedUser)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Mở khoá user
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-amber-600 hover:bg-amber-50"
                    onClick={() => openModal("deactivate", selectedUser)}
                  >
                    <UserMinus className="h-4 w-4" />
                    Khoá user
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-rose-600 hover:bg-rose-50"
                  onClick={() => openModal("delete", selectedUser)}
                >
                  <Trash className="h-4 w-4" />
                  Xoá vĩnh viễn
                </Button>
              </div>
            </div>
          </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>
              Đóng
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Mở hồ sơ người dùng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "plan"} onOpenChange={closeModal}>
        <DialogContent className="max-w-md rounded-2xl border border-emerald-50 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Điều chỉnh gói dịch vụ</DialogTitle>
            <DialogDescription>
              Chọn một gói và xác nhận để áp dụng cho {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={planDraft}
              onValueChange={(value) => {
                setPlanDraft(value);
                setPlanAcknowledged(false);
              }}
            >
              <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Chọn gói" />
              </SelectTrigger>
              <SelectContent>
                {PACKAGE_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p>
                Gói hiện tại:{" "}
                <span className="font-semibold">
                  {PACKAGE_OPTIONS.find((option) => option.value === selectedUser?.plan)?.label}
                </span>
              </p>
              <p>
                Gói đề xuất:{" "}
                <span className="font-semibold">
                  {PACKAGE_OPTIONS.find((option) => option.value === planDraft)?.label}
                </span>
              </p>
              <p className="mt-2 text-xs text-emerald-700">
                * Sau khi xác nhận, hệ thống sẽ gửi email thông báo và tạo log giám sát cho đội Quản trị hệ thống.
              </p>
            </div>
            <label className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white/80 p-3">
              <Checkbox
                checked={planAcknowledged}
                onCheckedChange={(checked) => setPlanAcknowledged(Boolean(checked))}
                className="mt-0.5"
              />
              <span className="text-sm text-slate-600">
                Tôi đã kiểm tra thông tin và xác nhận thay đổi gói cho người dùng này.
              </span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>
              Huỷ
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              onClick={handlePlanSave}
              disabled={!selectedUser || planDraft === selectedUser?.plan || !planAcknowledged}
            >
              Xác nhận thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "password"} onOpenChange={closeModal}>
        <DialogContent className="max-w-md rounded-2xl border border-emerald-50 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu mới cho {selectedUser?.name}. Hệ thống sẽ yêu cầu người dùng đổi lại khi đăng nhập.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Nhập mật khẩu mới (hiển thị rõ)"
              value={passwordDraft}
              onChange={(event) => setPasswordDraft(event.target.value)}
              className="rounded-xl border-slate-200 bg-white"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={handleGenerateRandomPassword}
              >
                Tạo mật khẩu ngẫu nhiên
              </Button>
              {generatedPassword && !pendingRandomConfirm && (
                <span className="text-sm text-slate-500">Đã tạo: {generatedPassword}</span>
              )}
            </div>
            {pendingRandomConfirm && (
              <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p>
                  Mật khẩu đề xuất: <span className="font-semibold">{generatedPassword}</span>
                </p>
                <p>Nhấn xác nhận để áp dụng và gửi email thông báo cho người dùng.</p>
                <div className="flex flex-wrap gap-2">
                  <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={confirmRandomPasswordFlow}>
                    Xác nhận đặt mật khẩu này
                  </Button>
                  <Button variant="ghost" onClick={cancelRandomPasswordFlow}>
                    Hủy
                  </Button>
                </div>
              </div>
            )}
            <p className="text-xs text-slate-500">
              Yêu cầu tối thiểu 10 ký tự, bao gồm chữ hoa, chữ thường và số. Mật khẩu hiển thị rõ để admin kiểm tra trước khi gửi.
            </p>
            {passwordError && <p className="text-sm font-medium text-rose-600">{passwordError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>
              Huỷ
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handlePasswordReset}
              disabled={!passwordDraft}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "edit"} onOpenChange={closeModal}>
        <DialogContent className="max-w-lg rounded-2xl border border-emerald-50 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật thông tin cơ bản</DialogTitle>
            <DialogDescription>
              Điều chỉnh thông tin liên hệ hoặc vai trò của user.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600">Họ tên</label>
              <Input
                value={editDraft.name}
                onChange={(event) => setEditDraft((prev) => ({ ...prev, name: event.target.value }))}
                className="rounded-xl border-slate-200 bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600">Số điện thoại</label>
              <Input
                value={editDraft.phone}
                onChange={(event) => setEditDraft((prev) => ({ ...prev, phone: event.target.value }))}
                className="rounded-xl border-slate-200 bg-white"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-600">Email</label>
              <Input
                type="email"
                value={editDraft.email}
                onChange={(event) => setEditDraft((prev) => ({ ...prev, email: event.target.value }))}
                className="rounded-xl border-slate-200 bg-white"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-600">Vai trò</label>
              <Select value={editDraft.role} onValueChange={(value) => setEditDraft((prev) => ({ ...prev, role: value }))}>
                <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {editError && <p className="text-sm font-medium text-rose-600">{editError}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>
              Huỷ
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleEditSave}
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "deactivate"} onOpenChange={closeModal}>
        <DialogContent className="max-w-md rounded-2xl border border-rose-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Khoá / Xoá user</DialogTitle>
            <DialogDescription>
              Thao tác này cần một lần xác nhận. Tài khoản sẽ bị khoá ngay sau khi bạn đồng ý.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            Bạn chuẩn bị khoá tài khoản {selectedUser?.name}. Việc này sẽ ngăn truy cập vào toàn bộ dịch vụ và có thể cần quy trình mở khoá thủ công.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>
              Huỷ
            </Button>
            <Button className="bg-rose-600 text-white hover:bg-rose-700" onClick={handleDeactivateConfirm}>
              Tôi hiểu, khoá ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "unlock"} onOpenChange={closeModal}>
        <DialogContent className="max-w-md rounded-2xl border border-emerald-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Mở khoá người dùng</DialogTitle>
            <DialogDescription>
              Cho phép {selectedUser?.name} truy cập trở lại vào hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
            Sau khi mở khoá, người dùng sẽ nhận email thông báo và có thể đăng nhập lại ngay lập tức.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>
              Huỷ
            </Button>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleUnlockConfirm}>
              Mở khoá ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "delete"} onOpenChange={closeModal}>
        <DialogContent className="max-w-md rounded-2xl border border-rose-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Xoá vĩnh viễn người dùng</DialogTitle>
            <DialogDescription>
              Đây là thao tác không thể hoàn tác. Toàn bộ dữ liệu liên quan tới {selectedUser?.name} sẽ bị xoá.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <p>Hệ thống sẽ loại bỏ tài khoản khỏi danh sách và ghi log audit cho đội Quản trị.</p>
            <p>Bạn nên khoá tài khoản trước khi xoá để đảm bảo tuân thủ quy trình.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>
              Huỷ
            </Button>
            <Button className="bg-rose-600 text-white hover:bg-rose-700" onClick={handleDeleteConfirm}>
              Tôi hiểu, xoá vĩnh viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          </>
        </AdminLayout>
      </div>
    </>
  );
}

