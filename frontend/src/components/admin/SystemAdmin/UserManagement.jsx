import React, { useEffect, useMemo, useState, useCallback } from "react";
import SubscriptionPlanRepository from "@/API/repositories/SubscriptionPlanRepository";
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
import SearchableSelect from "@/components/ui/searchable-select";
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

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";
import AdminUserRepository from "@/API/repositories/AdminUserRepository";
import { Loader2 } from "lucide-react";

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

const FALLBACK_PACKAGE_OPTIONS = [
  { value: "all", label: "Tất cả gói" },
  { value: "free", label: "Người dùng Free" },
];

const STATUS_META = {
  active: {
    label: "Đang hoạt động",
    className: "bg-emerald-50 text-emerald-700",
  },
  inactive: { label: "Tạm dừng", className: "bg-amber-50 text-amber-700" },
  banned: { label: "Đã khoá", className: "bg-rose-50 text-rose-700" },
};

const PLAN_COLORS = {
  seedling: "#22c55e",
  orchard: "#0f9d58",
  harvest: "#064e3b",
  free: "#94a3b8",
};

const PLAN_DESCRIPTIONS = {
  seedling: "Gói khởi đầu cho nông hộ nhỏ",
  orchard: "Gói tối ưu cho vườn đang mở rộng",
  harvest: "Gói chuyên sâu cho doanh nghiệp lớn",
  free: "Người dùng chưa đăng ký gói trả phí",
};

const normalizePlanValue = (planValue) => (planValue ? planValue : "free");

const toDateInputValue = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const formatDateDisplay = (dateString, fallback = "—") => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("vi-VN");
};

const getPlanLabel = (planValue, options = FALLBACK_PACKAGE_OPTIONS) => {
  const normalized = normalizePlanValue(planValue);
  if (normalized === "free") return "Người dùng Free";
  return (
    options.find((option) => option.value === normalized)?.label ??
    "Không xác định"
  );
};

// Tạo dữ liệu mẫu users
const GARDEN_NAME_TEMPLATES = [
  "Vườn Cam",
  "Vườn Bưởi",
  "Vườn Sầu Riêng",
  "Vườn Măng Cụt",
  "Vườn Thanh Long",
  "Vườn Tiêu",
  "Vườn Điều",
];

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateMockGardens = (role) => {
  if (role === "SystemAdmin") return [];

  const gardenCount =
    role === "BusinessAdmin" ? randomInt(2, 5) : randomInt(1, 3);

  return Array.from({ length: gardenCount }).map((_, index) => {
    const templateName =
      GARDEN_NAME_TEMPLATES[
      Math.floor(Math.random() * GARDEN_NAME_TEMPLATES.length)
      ];
    const treeCount = randomInt(50, 400);

    return {
      id: `GRD-${String(
        Date.now() + index + Math.floor(Math.random() * 1000)
      ).slice(-6)}`,
      name: `${templateName} #${index + 1}`,
      treeCount,
    };
  });
};

const generateMockUsers = () => {
  const now = new Date();
  const userTemplates = [
    {
      name: "Nguyễn Minh Hoàng",
      email: "hoang.nm@example.com",
      role: "Farmer",
      province: "Đồng Tháp",
      phone: "0938112223",
    },
    {
      name: "Trần Thị Mai",
      email: "mai.tran@orchard.vn",
      role: "BusinessAdmin",
      province: "Lâm Đồng",
      phone: "0987453776",
    },
    {
      name: "Phạm Anh Tuấn",
      email: "tuan.pham@greengrow.vn",
      role: "SystemAdmin",
      province: "TP. HCM",
      phone: "0903665991",
    },
    {
      name: "Võ Thảo Nhi",
      email: "nhi.vo@example.com",
      role: "Farmer",
      province: "Bến Tre",
      phone: "0913733088",
    },
    {
      name: "Lê Quang Khải",
      email: "khai.le@citrus.io",
      role: "BusinessAdmin",
      province: "Hà Nội",
      phone: "0978334556",
    },
    {
      name: "Đỗ Thanh Vân",
      email: "van.do@example.com",
      role: "Farmer",
      province: "Gia Lai",
      phone: "0905123450",
    },
    {
      name: "Huỳnh Tấn Tài",
      email: "tai.huynh@fruitful.vn",
      role: "BusinessAdmin",
      province: "Cần Thơ",
      phone: "0939889112",
    },
    {
      name: "Đinh Yến Nhi",
      email: "yen.nhi@example.com",
      role: "Farmer",
      province: "Lâm Đồng",
      phone: "0902441114",
    },
    {
      name: "Trương Quý Long",
      email: "long.truong@agrimax.vn",
      role: "BusinessAdmin",
      province: "Nghệ An",
      phone: "0981311223",
    },
    {
      name: "Hồ Khánh Linh",
      email: "linh.khanh@example.com",
      role: "Farmer",
      province: "Quảng Nam",
      phone: "0908777441",
    },
    {
      name: "Tô Thành Phát",
      email: "phat.to@fruitflow.vn",
      role: "BusinessAdmin",
      province: "Đà Nẵng",
      phone: "0919620345",
    },
    {
      name: "Phan Ngọc Trang",
      email: "trang.phan@citrus.vn",
      role: "SystemAdmin",
      province: "Hà Nội",
      phone: "0906788991",
    },
  ];

  const plans = ["seedling", "orchard", "harvest"];
  const userStatuses = ["active", "active", "active", "inactive", "inactive"];

  return userTemplates.map((template, index) => {
    const userId = `USR-${String(index + 1).padStart(6, "0")}`;
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const status =
      userStatuses[Math.floor(Math.random() * userStatuses.length)];

    // Ngày tạo tài khoản: ngẫu nhiên trong 6 tháng gần đây
    const createdDaysAgo = Math.floor(Math.random() * 180) + 30; // từ 1–7 tháng trước
    const createdAt = new Date(
      now.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000
    );

    // Đăng nhập gần nhất: trong 30 ngày gần đây, nhưng không trước ngày tạo
    const daysAgo = Math.floor(Math.random() * 30);
    const lastLoginRaw = new Date(
      now.getTime() - daysAgo * 24 * 60 * 60 * 1000
    );
    const lastLogin = lastLoginRaw < createdAt ? createdAt : lastLoginRaw;

    const gardens = generateMockGardens(template.role);
    const totalTreesManaged = gardens.reduce(
      (sum, garden) => sum + garden.treeCount,
      0
    );

    return {
      id: userId,
      name: template.name,
      email: template.email,
      role: template.role,
      status,
      plan,
      province: template.province,
      phone: template.phone,
      createdAt: createdAt.toISOString(),
      lastLogin: lastLogin.toISOString(),
      gardens,
      totalTreesManaged,
    };
  });
};

const PAGE_SIZE = 10;

const defaultFilters = {
  search: "",
  role: "all",
  status: "all",
  plan: "all",
};

function StatCard({ label, value, change, icon: Icon }) {
  const isPositive = change >= 0;
  const percent = `${isPositive ? "+" : ""}${Math.round(change * 100)}%`;

  return (
    <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-emerald-100 bg-white p-3 sm:p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-emerald-200/60">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 truncate">
            {value.toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="rounded-xl sm:rounded-2xl bg-emerald-50 p-2 sm:p-3 text-emerald-600 shadow-inner shadow-emerald-100 group-hover:bg-emerald-100 shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
      <div className="mt-2 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
        <Badge
          className={cn(
            "border-0 px-1.5 sm:px-2.5 py-0.5 text-[10px] sm:text-xs",
            isPositive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-50 text-rose-600"
          )}
        >
          {isPositive ? (
            <TrendingUp className="mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
          ) : (
            <TrendingDown className="mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
          )}
          {percent}
        </Badge>
        <span className="text-slate-500 text-[10px] sm:text-sm">so với kỳ trước</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400/90 via-emerald-500/70 to-lime-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </div>
  );
}

// ======================
//  Biểu đồ nâng cấp
// ======================

function UserGrowthChart({ data, change, timeframeLabel }) {
  const isPositive = change >= 0;
  const changeLabel = `${isPositive ? "+" : ""}${Math.round(change * 100)}%`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const value = payload[0].value;
    return (
      <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs shadow-md">
        <p className="font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-emerald-600">+{value} người dùng mới</p>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-emerald-50 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 p-5 text-emerald-50 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Lượt đăng ký người dùng
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Tăng trưởng theo {timeframeLabel.toLowerCase()}
          </h3>
          <p className="mt-1 text-xs text-emerald-100/80">
            Quan sát xu hướng đăng ký mới để tối ưu chiến dịch onboarding.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-emerald-100/80">Biến động</p>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-950/60 px-3 py-1 text-xs font-semibold">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-emerald-300" />
            ) : (
              <TrendingDown className="h-3 w-3 text-rose-300" />
            )}
            <span>{changeLabel}</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-100/70">
            so với kỳ trước
          </p>
        </div>
      </div>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              left: 0,
              right: 4,
              top: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="userGrowthGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#bbf7d0" stopOpacity={0.95} />
                <stop offset="60%" stopColor="#4ade80" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#064e3b"
              strokeDasharray="3 3"
              opacity={0.35}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#d1fae5", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#a7f3d0", fontSize: 11 }}
              width={40}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#bbf7d0"
              strokeWidth={2.4}
              fill="url(#userGrowthGradient)"
              dot={{
                r: 3,
                strokeWidth: 1.5,
                stroke: "#dcfce7",
                fill: "#22c55e",
              }}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#22c55e" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-950/40 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <span className="font-medium text-emerald-100">Đăng ký mới</span>
        </div>
      </div>
    </div>
  );
}

function PlanDistributionChart({
  data,
  change,
  total,
  timeframe = "week",
  allUsers = [],
}) {
  const chartData = data.map((item) => ({
    ...item,
    label: item.label ?? getPlanLabel(item.key),
    color: PLAN_COLORS[item.key] ?? "#22c55e",
  }));

  const totalUsers =
    typeof total === "number"
      ? total
      : chartData.reduce((sum, item) => sum + item.value, 0);
  const peakValue = chartData.reduce(
    (max, item) => Math.max(max, item.value),
    0
  );
  const isPositive = change >= 0;
  const changeLabel = `${isPositive ? "+" : ""}${Math.round(change * 100)}%`;

  // Tính toán comparison data từ dữ liệu thực tế
  const getComparisonData = () => {
    const now = new Date();
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;

    if (timeframe === "week") {
      currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    } else if (timeframe === "month") {
      currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    } else {
      currentPeriodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    }

    const previousCounts = { seedling: 0, orchard: 0, harvest: 0 };

    allUsers.forEach((user) => {
      if (!user.lastLogin) return;
      const userDate = new Date(user.lastLogin);
      if (userDate >= previousPeriodStart && userDate < previousPeriodEnd) {
        const planKey = normalizePlanValue(user.plan);
        // exclude free users from previous period counts
        if (planKey === "free") return;
        previousCounts[planKey] = (previousCounts[planKey] || 0) + 1;
      }
    });

    return previousCounts;
  };

  const previousData = getComparisonData();
  const calculateChange = (current, previous) => {
    if (previous === 0) {
      // Nếu kỳ trước = 0, chỉ trả về 100% nếu có tăng trưởng, không nhân với số lượng
      return current > 0 ? 100 : 0;
    }
    const changePercent = ((current - previous) / previous) * 100;
    // Giới hạn change ở mức hợp lý (max 1000%)
    return Math.min(Math.max(changePercent, -100), 1000);
  };

  // Tính change cho từng gói dịch vụ
  const chartDataWithChange = chartData.map((item) => {
    const previousValue = previousData[item.key] || 0;
    const itemChange = calculateChange(item.value, previousValue);
    return { ...item, change: itemChange };
  });

  // Map timeframe sang period label
  const getPeriodLabel = () => {
    if (timeframe === "week") return "tuần";
    if (timeframe === "month") return "tháng";
    if (timeframe === "year") return "năm";
    return "kỳ";
  };

  const periodLabel = getPeriodLabel();

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    return (
      <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs shadow-md">
        <p className="font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-emerald-600">
          {item.value.toLocaleString("vi-VN")} người dùng
        </p>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-emerald-50 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Phân bổ gói dịch vụ
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            Số lượng người dùng theo gói
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            className={cn(
              "border-0 px-2.5 py-1 text-xs font-semibold",
              isPositive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-50 text-rose-600"
            )}
          >
            {isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            {changeLabel}
          </Badge>
          <span className="text-[11px] text-slate-500">
            Tổng người dùng:{" "}
            <span className="font-semibold">
              {totalUsers.toLocaleString("vi-VN")}
            </span>
          </span>
        </div>
      </div>

      {/* Chart + legend */}
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
        {/* Column chart */}
        <div className="flex-1 w-full md:min-h-[260px]">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                width={50}
                domain={[0, "dataMax + 1"]}
                allowDecimals={false}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={40}>
                {chartData.map((item) => (
                  <Cell key={item.key} fill={item.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend chi tiết */}
        <div className="space-y-3 md:w-52">
          <div className="space-y-2">
            {chartDataWithChange.map((item) => {
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2 text-sm shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        {item.label}
                      </span>
                      {item.change > -100 && Math.abs(item.change) > 0.5 && (
                        <Badge
                          className={cn(
                            "mt-0.5 w-fit border-0 px-1.5 py-0 text-[10px]",
                            item.change >= 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          )}
                        >
                          {item.change >= 0 ? "+" : ""}
                          {Math.round(item.change)}% so với {periodLabel} trước
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {item.value.toLocaleString("vi-VN")} người
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Legacy charts đã thay bằng UserGrowthChart & PlanDistributionChart.

function ActionMenu({ user, onOpenModal }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full border border-slate-200 p-2 text-slate-500 transition-all hover:text-emerald-600">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44 rounded-xl border-emerald-50 bg-white shadow-lg">
        <DropdownMenuItem onSelect={() => onOpenModal("details", user)}>
          Xem chi tiết
        </DropdownMenuItem>
        {user.status === "inactive" ? (
          <DropdownMenuItem
            className="text-emerald-600 focus:bg-emerald-50"
            onSelect={() => onOpenModal("unlock", user)}
          >
            Mở khoá người dùng
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-amber-600 focus:bg-amber-50"
            onSelect={() => onOpenModal("deactivate", user)}
          >
            Khoá người dùng
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-rose-600 focus:bg-rose-50"
          onSelect={() => onOpenModal("delete", user)}
        >
          Xoá vĩnh viễn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const getLocalDateInputValue = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split("T")[0];
};

export default function SystemAdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("week");
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [planDraft, setPlanDraft] = useState("");
  const [packageOptions, setPackageOptions] = useState(FALLBACK_PACKAGE_OPTIONS); // State for dynamic options
  const [planStartDate, setPlanStartDate] = useState(() =>
    getLocalDateInputValue()
  );
  const [planEndDate, setPlanEndDate] = useState("");
  const [passwordDraft, setPasswordDraft] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [pendingRandomConfirm, setPendingRandomConfirm] = useState(false);
  const [editDraft, setEditDraft] = useState({
    name: "",
    phone: "",
    role: "",
    email: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [editError, setEditError] = useState("");
  const [actionNotice, setActionNotice] = useState(null);
  const [planAcknowledged, setPlanAcknowledged] = useState(false);

  const timeframeLabel =
    TIME_WINDOWS.find((t) => t.value === timeframe)?.label ?? "Kỳ";

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const roleId =
        filters.role !== "all" ? getRoleIdFromName(filters.role) : null;
      const isActive =
        filters.status === "active"
          ? true
          : filters.status === "inactive" || filters.status === "banned"
            ? false
            : null;

      const response = await AdminUserRepository.getAllUsers(
        page,
        PAGE_SIZE,
        filters.search || null,
        roleId,
        isActive
      );

      if (response.success) {
        // Transform API response to match UI format
        const transformedUsers = response.data.map((user) => ({
          id: `USR-${String(user.userId).padStart(6, "0")}`,
          userId: user.userId,
          name: user.fullName,
          email: user.email,
          phone: user.phone || "",
          role: user.roleName,
          status: user.isActive ? "active" : "inactive",
          plan: user.planType || "free", // Use planType from backend, default to "free" if null
          planStartDate: user.planStartDate || null,
          planEndDate: user.planEndDate || null,
          province: "", // TODO: Get from user data
          createdAt: user.createdAt,
          lastLogin: user.lastLoginAt || user.createdAt,
          gardensCount: user.gardensCount || 0,
          treesCount: user.treesCount || 0,
        }));

        // Sort by lastLogin descending (most recent first) as default
        transformedUsers.sort((a, b) => {
          const da = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          const db = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          return db - da;
        });
        setUsers(transformedUsers);
        setTotalCount(response.pagination?.totalCount || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      const errorMsg =
        err.message || "Có lỗi xảy ra khi tải dữ liệu người dùng";
      setError(errorMsg);
      setActionNotice({ message: errorMsg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get role ID from role name
  const getRoleIdFromName = (roleName) => {
    // Map role names to IDs - matches database schema:
    // Role 1: SystemAdmin, Role 2: BusinessAdmin, Role 3: Farmer
    const roleMap = {
      SystemAdmin: 1,
      BusinessAdmin: 2,
      Farmer: 3,
    };
    return roleMap[roleName] || null;
  };

  // Fetch users when filters or page change
  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  // Fetch subscription plans dynamically
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await SubscriptionPlanRepository.getAll(true);
        if (plans && Array.isArray(plans)) {
          const dynamicOptions = plans.map(plan => ({
            value: plan.slug || plan.planName || String(plan.planId), // Use slug or planName as value
            label: plan.planName
          }));
          setPackageOptions([
            { value: "all", label: "Tất cả gói" },
            ...dynamicOptions,
            { value: "free", label: "Người dùng Free" }
          ]);
        }
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      }
    };
    fetchPlans();
  }, []);

  // Hàm cập nhật user
  const updateUser = async (userId, updates) => {
    try {
      const numericUserId =
        typeof userId === "string"
          ? parseInt(userId.replace("USR-", ""))
          : userId;
      const updateData = {};

      if (updates.name) updateData.fullName = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.role) {
        updateData.roleId = getRoleIdFromName(updates.role);
      }

      const response = await AdminUserRepository.updateUser(
        numericUserId,
        updateData
      );

      if (response) {
        await fetchUsers(); // Refresh users list
      }
    } catch (err) {
      console.error("Error updating user:", err);
      showNotice("Có lỗi xảy ra khi cập nhật người dùng", "error");
    }
  };

  // Hàm xóa user (soft delete via deactivate)
  const deleteUser = async (userId) => {
    try {
      const numericUserId =
        typeof userId === "string"
          ? parseInt(userId.replace("USR-", ""))
          : userId;
      await AdminUserRepository.deactivateUser(numericUserId);
      await fetchUsers(); // Refresh users list
    } catch (err) {
      console.error("Error deleting user:", err);
      showNotice("Có lỗi xảy ra khi xóa người dùng", "error");
    }
  };

  // Tính toán stats từ users - using totalCount from API and current page for other stats
  const stats = useMemo(() => {
    const total = totalCount; // Use total from API
    const active = users.filter((u) => u.status === "active").length;
    const inactive = users.filter((u) => u.status !== "active").length;

    // Calculate new users from current page (approximate)
    const now = new Date();
    let periodStart;
    if (timeframe === "week") {
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "month") {
      periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      periodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const newUsers = users.filter((u) => {
      if (!u.createdAt) return false;
      const userDate = new Date(u.createdAt);
      return userDate >= periodStart && userDate <= now;
    }).length;

    // Simplified change calculation (placeholder values since we only have current page data)
    // Note: For accurate stats, we'd need to fetch all users or have a stats endpoint
    const totalChange = 0.15;
    const activeChange = active > 0 ? 0.1 : 0;
    const inactiveChange = inactive > 0 ? 0.05 : 0;
    const newChange = newUsers > 0 ? 0.2 : 0;

    return {
      total: { value: total, change: totalChange, icon: Users },
      active: { value: active, change: activeChange, icon: UserCheck },
      inactive: { value: inactive, change: inactiveChange, icon: UserMinus },
      new: { value: newUsers, change: newChange, icon: UserPlus },
    };
  }, [users, timeframe, totalCount]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = setTimeout(() => setActionNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [actionNotice]);

  // Reset page when filters change
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [filters]);

  // Filtering is now handled by backend API, but we can still filter client-side if needed
  const filteredUsers = useMemo(() => {
    // Backend already filters by search, role, and status
    // Only filter by plan if needed (since plan is not in the API response yet)
    if (filters.plan === "all") return users;

    return users.filter((user) => {
      const userPlan = normalizePlanValue(user.plan);
      return userPlan === filters.plan;
    });
  }, [filters, users]);

  // Phân bổ gói dịch vụ: bám theo danh sách đã lọc để biểu đồ linh động với bộ lọc
  const planBreakdown = useMemo(() => {
    const sourceUsers = filteredUsers;

    const counts = sourceUsers.reduce((acc, user) => {
      const planKey = normalizePlanValue(user.plan);
      // Exclude free users from the breakdown
      if (planKey === "free") return acc;
      acc[planKey] = (acc[planKey] ?? 0) + 1;
      return acc;
    }, {});

    const preferredOrder = packageOptions
      .map((option) => option.value)
      .filter((value) => value !== "all" && value !== "free");

    const extraKeys = Object.keys(counts).filter(
      (key) => !preferredOrder.includes(key) && key !== "free"
    );
    const orderedKeys = [...preferredOrder, ...extraKeys];

    const data = orderedKeys.map((key) => ({
      key,
      label: getPlanLabel(key, packageOptions), // Pass packageOptions
      value: counts[key] ?? 0,
    }));

    // Total excludes free users by design
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Tính change tổng thể so với kỳ trước
    const now = new Date();
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;

    if (timeframe === "week") {
      currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    } else if (timeframe === "month") {
      currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    } else {
      currentPeriodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    }

    // Đếm users trong kỳ trước (áp dụng cùng filters)
    const previousTotal = users.filter((user) => {
      // Áp dụng cùng filters như filteredUsers
      const query = filters.search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      const matchesRole = filters.role === "all" || user.role === filters.role;
      const matchesStatus =
        filters.status === "all" || user.status === filters.status;
      const userPlan = normalizePlanValue(user.plan);
      const matchesPlan = filters.plan === "all" || userPlan === filters.plan;

      if (!matchesSearch || !matchesRole || !matchesStatus || !matchesPlan) {
        return false;
      }

      // Kiểm tra thời gian
      if (!user.lastLogin) return false;
      const userDate = new Date(user.lastLogin);
      return userDate >= previousPeriodStart && userDate < previousPeriodEnd;
    }).length;

    // Tính change
    let change = 0;
    if (previousTotal === 0) {
      change = total > 0 ? 1 : 0; // 100% nếu có tăng trưởng từ 0
    } else {
      change = (total - previousTotal) / previousTotal;
    }

    return { data, total, change };
  }, [filteredUsers, users, timeframe, filters, packageOptions]);

  // Tính toán user growth chart từ dữ liệu thực tế
  const userGrowthData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    let bucketCount = 7;
    let getBucketLabel;

    if (timeframe === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      bucketCount = 7;
      getBucketLabel = (date) => {
        const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        return days[date.getDay()];
      };
    } else if (timeframe === "month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      bucketCount = 30;
      getBucketLabel = (date) => `Ngày ${date.getDate()}`;
    } else {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      bucketCount = 12;
      getBucketLabel = (date) => `T${date.getMonth() + 1}`;
    }

    // Tạo buckets rỗng
    const buckets = new Map();
    const bucketSize = (now.getTime() - startDate.getTime()) / bucketCount;

    // Khởi tạo tất cả buckets
    for (let i = 0; i < bucketCount; i++) {
      const bucketDate = new Date(startDate.getTime() + i * bucketSize);
      const label = getBucketLabel(bucketDate);
      buckets.set(label, 0);
    }

    // Đếm users theo bucket (sử dụng lastLogin làm proxy cho ngày đăng ký)
    users.forEach((user) => {
      if (!user.lastLogin) return;

      const userDate = new Date(user.lastLogin);
      if (userDate >= startDate && userDate <= now) {
        const bucketIndex = Math.floor(
          (userDate.getTime() - startDate.getTime()) / bucketSize
        );
        const actualIndex = Math.min(Math.max(0, bucketIndex), bucketCount - 1);
        const bucketDate = new Date(
          startDate.getTime() + actualIndex * bucketSize
        );
        const label = getBucketLabel(bucketDate);
        buckets.set(label, (buckets.get(label) || 0) + 1);
      }
    });

    // Chuyển Map thành array
    const series = Array.from(buckets.entries()).map(([label, value]) => ({
      label,
      value,
    }));

    return series;
  }, [users, timeframe]);

  // Tính toán change percentage so với kỳ trước
  const userGrowthChange = useMemo(() => {
    const now = new Date();
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;

    if (timeframe === "week") {
      currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    } else if (timeframe === "month") {
      currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    } else {
      currentPeriodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    }

    const currentCount = users.filter((user) => {
      if (!user.lastLogin) return false;
      const userDate = new Date(user.lastLogin);
      return userDate >= currentPeriodStart && userDate <= now;
    }).length;

    const previousCount = users.filter((user) => {
      if (!user.lastLogin) return false;
      const userDate = new Date(user.lastLogin);
      return userDate >= previousPeriodStart && userDate < previousPeriodEnd;
    }).length;

    if (previousCount === 0) return currentCount > 0 ? 1 : 0;
    return (currentCount - previousCount) / previousCount;
  }, [users, timeframe]);

  // Pagination is handled by backend, so we use all filtered users
  const paginatedUsers = filteredUsers;

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
      const normalizedPlan = normalizePlanValue(user?.plan);
      setPlanDraft(normalizedPlan);
      setPlanAcknowledged(false);
      const existingStart = user?.planStartDate
        ? toDateInputValue(user.planStartDate)
        : "";
      const defaultStart =
        normalizedPlan === "free" ? "" : getLocalDateInputValue();
      setPlanStartDate(existingStart || defaultStart);
      setPlanEndDate(
        user?.planEndDate ? toDateInputValue(user.planEndDate) : ""
      );
    }
    if (type === "password") {
      setPasswordDraft("");
      setPasswordConfirm("");
      setGeneratedPassword("");
      setPendingRandomConfirm(false);
    }
    if (type === "edit") {
      // Đảm bảo role SystemAdmin không thể bị thay đổi
      const userRole = user?.role ?? "Farmer";
      setEditDraft({
        name: user?.name ?? "",
        phone: user?.phone ?? "",
        role: userRole === "SystemAdmin" ? "SystemAdmin" : userRole,
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
    setPasswordDraft("");
    setPasswordConfirm("");
    setGeneratedPassword("");
    setPendingRandomConfirm(false);
    setPlanDraft("");
    setPlanAcknowledged(false);
    setPlanStartDate(getLocalDateInputValue());
    setPlanEndDate("");
  };

  const showNotice = (message, tone = "success") => {
    setActionNotice({ message, tone });
  };

  const handlePlanSave = async () => {
    if (!selectedUser || !planDraft) return;
    if (!planAcknowledged) {
      setActionNotice({
        message: "Vui lòng xác nhận bạn đã kiểm tra và đồng ý thay đổi gói.",
        tone: "warning",
      });
      return;
    }
    if (!planStartDate && planDraft !== "free") {
      setActionNotice({
        message: "Vui lòng chọn ngày bắt đầu cho gói mới.",
        tone: "warning",
      });
      return;
    }
    if (planStartDate && planEndDate && planEndDate < planStartDate) {
      setActionNotice({
        message: "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.",
        tone: "warning",
      });
      return;
    }

    try {
      const numericUserId =
        typeof selectedUser.userId === "number"
          ? selectedUser.userId
          : typeof selectedUser.id === "string"
            ? parseInt(selectedUser.id.replace("USR-", ""))
            : selectedUser.id;

      await AdminUserRepository.updateUserSubscriptionPlan(numericUserId, {
        planType: planDraft,
        startDate: planStartDate || null,
        endDate: planEndDate || null,
      });
      const planLabel = getPlanLabel(planDraft);
      showNotice(
        `Đã cập nhật gói dịch vụ của ${selectedUser.name} thành ${planLabel}.`
      );
      await fetchUsers(); // Refresh users list to show updated plan
      closeModal();
    } catch (err) {
      console.error("Error updating subscription plan:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi cập nhật gói dịch vụ";
      showNotice(errorMsg, "error");
    }
  };

  const normalizedSelectedPlan = normalizePlanValue(selectedUser?.plan);
  const existingPlanStartInput = selectedUser?.planStartDate
    ? toDateInputValue(selectedUser.planStartDate)
    : "";
  const existingPlanEndInput = selectedUser?.planEndDate
    ? toDateInputValue(selectedUser.planEndDate)
    : "";
  const hasPlanChanges =
    planDraft !== normalizedSelectedPlan ||
    (planStartDate || "") !== (existingPlanStartInput || "") ||
    (planEndDate || "") !== (existingPlanEndInput || "");
  const isPlanActionDisabled =
    !selectedUser || !planAcknowledged || !planDraft || !hasPlanChanges;

  const applyPasswordChange = async (nextPassword) => {
    if (!selectedUser) return;

    try {
      const numericUserId =
        typeof selectedUser.userId === "number"
          ? selectedUser.userId
          : typeof selectedUser.id === "string"
            ? parseInt(selectedUser.id.replace("USR-", ""))
            : selectedUser.id;

      await AdminUserRepository.resetUserPassword(numericUserId, nextPassword);
      showNotice(
        `Đã đặt lại mật khẩu cho ${selectedUser.name}. Hệ thống vừa gửi email xác nhận tới ${selectedUser.email}.`
      );
      closeModal();
    } catch (err) {
      console.error("Error resetting password:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi đặt lại mật khẩu";
      setPasswordError(errorMsg);
      showNotice(errorMsg, "error");
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedUser) return;

    // Validate password length
    if (passwordDraft.length < 10) {
      setPasswordError("Mật khẩu cần tối thiểu 10 ký tự.");
      return;
    }

    // Validate password confirmation
    if (!passwordConfirm) {
      setPasswordError("Vui lòng xác nhận lại mật khẩu mới.");
      return;
    }

    if (passwordDraft !== passwordConfirm) {
      setPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setPasswordError("");
    await applyPasswordChange(passwordDraft);
  };

  const handleEditSave = async () => {
    if (!selectedUser) return;
    if (
      !editDraft.name.trim() ||
      !editDraft.phone.trim() ||
      !editDraft.email.trim()
    ) {
      setEditError("Vui lòng nhập đủ họ tên, email và số điện thoại.");
      return;
    }

    // Ngăn không cho chuyển đổi thành role SystemAdmin
    if (editDraft.role === "SystemAdmin") {
      setEditError("Không thể chuyển đổi vai trò thành Quản trị hệ thống.");
      return;
    }

    // Ngăn không cho thay đổi role của SystemAdmin (nếu user đã là SystemAdmin)
    if (selectedUser.role === "SystemAdmin") {
      if (editDraft.role !== "SystemAdmin") {
        setEditError("Không thể thay đổi vai trò của Quản trị hệ thống.");
        return;
      }
    }

    try {
      await updateUser(selectedUser.userId || selectedUser.id, {
        name: editDraft.name.trim(),
        phone: editDraft.phone.trim(),
        role: editDraft.role,
        email: editDraft.email.trim(),
      });
      setEditError("");
      showNotice(`Đã cập nhật thông tin cho ${editDraft.name}.`);
      closeModal();
    } catch (err) {
      setEditError("Có lỗi xảy ra khi cập nhật thông tin.");
      console.error("Error updating user:", err);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedUser) return;
    try {
      const numericUserId =
        typeof selectedUser.userId === "number"
          ? selectedUser.userId
          : typeof selectedUser.id === "string"
            ? parseInt(selectedUser.id.replace("USR-", ""))
            : selectedUser.id;

      await AdminUserRepository.deactivateUser(numericUserId);
      showNotice(`Đã khoá tài khoản ${selectedUser.name}.`, "warning");
      await fetchUsers(); // Refresh users list
      closeModal();
    } catch (err) {
      console.error("Error deactivating user:", err);
      showNotice("Có lỗi xảy ra khi khoá tài khoản", "error");
    }
  };

  const handleUnlockConfirm = async () => {
    if (!selectedUser) return;
    try {
      const numericUserId =
        typeof selectedUser.userId === "number"
          ? selectedUser.userId
          : typeof selectedUser.id === "string"
            ? parseInt(selectedUser.id.replace("USR-", ""))
            : selectedUser.id;

      await AdminUserRepository.activateUser(numericUserId);
      showNotice(`Đã mở khoá tài khoản ${selectedUser.name}.`);
      await fetchUsers(); // Refresh users list
      closeModal();
    } catch (err) {
      console.error("Error activating user:", err);
      showNotice("Có lỗi xảy ra khi mở khoá tài khoản", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.userId || selectedUser.id);
      showNotice(`Đã xoá tài khoản ${selectedUser.name}.`, "warning");
      closeModal();
    } catch (err) {
      console.error("Error deleting user:", err);
      showNotice("Có lỗi xảy ra khi xóa tài khoản", "error");
    }
  };

  const handleGenerateRandomPassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    const random = Array.from({ length: 12 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("");
    setGeneratedPassword(random);
    setPendingRandomConfirm(true);
    setPasswordDraft("");
    setPasswordConfirm("");
    setPasswordError("");
  };

  const cancelRandomPasswordFlow = () => {
    setPendingRandomConfirm(false);
    setGeneratedPassword("");
  };

  const confirmRandomPasswordFlow = () => {
    if (!generatedPassword) return;
    setPasswordDraft(generatedPassword);
    setPasswordConfirm(generatedPassword);
    applyPasswordChange(generatedPassword);
  };

  // CSV Export function
  const handleExportCSV = () => {
    if (!filteredUsers.length) {
      showNotice("Không có dữ liệu để xuất", "warning");
      return;
    }

    // Define CSV headers
    const headers = [
      "Mã người dùng",
      "Tên",
      "Email",
      "Số điện thoại",
      "Vai trò",
      "Trạng thái",
      "Gói dịch vụ",
      "Ngày bắt đầu gói",
      "Ngày kết thúc gói",
      "Số vườn",
      "Số cây",
      "Ngày tạo tài khoản",
      "Đăng nhập gần nhất",
    ];

    // Convert users to CSV rows
    const csvRows = filteredUsers.map((user) => {
      return [
        user.id || "",
        user.name || "",
        user.email || "",
        user.phone || "",
        ROLE_META[user.role]?.label || user.role || "",
        STATUS_META[user.status]?.label || user.status || "",
        getPlanLabel(user.plan),
        formatDateDisplay(user.planStartDate, ""),
        formatDateDisplay(user.planEndDate, ""),
        user.gardensCount || 0,
        user.treesCount || 0,
        user.createdAt
          ? new Date(user.createdAt).toLocaleString("vi-VN", {
            hour12: false,
          })
          : "",
        user.lastLogin
          ? new Date(user.lastLogin).toLocaleString("vi-VN", {
            hour12: false,
          })
          : "Chưa đăng nhập",
      ];
    });

    // Escape CSV values (handle commas, quotes, newlines)
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Combine headers and rows
    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...csvRows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    // Add BOM for UTF-8 to support Vietnamese characters in Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    link.href = url;
    link.download = `danh-sach-nguoi-dung-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotice(
      `Đã xuất ${filteredUsers.length} người dùng ra file CSV`,
      "success"
    );
  };

  return (
    <>
      <LivingBackground
        baseColor={BACKGROUND_PALETTE.bg}
        palette={[
          BACKGROUND_PALETTE.leaf,
          BACKGROUND_PALETTE.ivory,
          BACKGROUND_PALETTE.accent,
        ]}
        density={28}
      />
      <div className="relative z-10 min-h-screen">
        <AdminLayout>
          <>
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Quản trị hệ thống
                  </p>
                  <h1 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-semibold text-white">
                    Quản lý người dùng
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
                    Giám sát, lọc và thao tác nhanh với toàn bộ người dùng trong
                    hệ sinh thái Mầm Mới.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="rounded-full border border-white/30 bg-white/10 p-0.5 sm:p-1 backdrop-blur">
                    {TIME_WINDOWS.map((option) => {
                      const isActive = timeframe === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setTimeframe(option.value)}
                          className={cn(
                            "rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all",
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
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white text-xs sm:text-sm px-2.5 sm:px-4"
                    onClick={fetchUsers}
                    disabled={loading}
                  >
                    <RefreshCcw
                      className={cn("mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4", loading && "animate-spin")}
                    />
                    <span className="hidden sm:inline">{loading ? "Đang tải..." : "Đồng bộ dữ liệu"}</span>
                    <span className="sm:hidden">{loading ? "..." : "Đồng bộ"}</span>
                  </Button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 shadow-sm">
                  {error}
                </div>
              )}

              {actionNotice && (
                <div
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm",
                    actionNotice.tone === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : actionNotice.tone === "error"
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  )}
                >
                  {actionNotice.message}
                </div>
              )}

              {loading && users.length === 0 && (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <span className="ml-3 text-slate-600">
                    Đang tải dữ liệu...
                  </span>
                </div>
              )}

              {/* Tổng quan stat */}
              <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
                <CardHeader className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-6 pt-4 sm:pt-5">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-slate-900">
                    Tổng quan người dùng
                  </CardTitle>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500">
                    <LineChart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                    <span>Dữ liệu {timeframeLabel.toLowerCase()} hiện tại{" "}</span>
                    <span className="font-semibold text-emerald-600">
                      so với kỳ trước
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-5">
                  <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
                    {Object.entries(stats).map(([key, config]) => (
                      <StatCard
                        key={key}
                        label={
                          {
                            total: "Tổng số người dùng",
                            active: "Đang hoạt động",
                            inactive: "Tạm dừng / khoá",
                            new: "Tài khoản mới",
                          }[key] ?? key
                        }
                        value={config.value}
                        change={config.change}
                        icon={config.icon}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chart nâng cấp */}
              <Card className="border-none bg-transparent text-slate-900 shadow-none">
                <CardContent className="grid gap-4 sm:gap-6 p-0 grid-cols-1 lg:grid-cols-3 lg:min-h-[360px]">
                  <div className="lg:col-span-2 h-full min-h-[280px] sm:min-h-[300px]">
                    <UserGrowthChart
                      data={userGrowthData}
                      change={userGrowthChange}
                      timeframeLabel={timeframeLabel}
                    />
                  </div>
                  <div className="lg:col-span-1 h-full">
                    <PlanDistributionChart
                      data={planBreakdown.data}
                      change={planBreakdown.change}
                      total={planBreakdown.total}
                      timeframe={timeframe}
                      allUsers={users}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Danh sách người dùng */}
              <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
                <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-5">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl text-slate-900">
                      Danh sách người dùng
                    </CardTitle>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500">
                      <Leaf className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                      {filteredUsers.length} người dùng khớp bộ lọc
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-5">
                  {/* Bộ lọc */}
                  <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-12">
                    <div className="col-span-2 lg:col-span-4">
                      <div className="relative">
                        <Input
                          placeholder="Tìm theo tên hoặc email..."
                          value={filters.search}
                          onChange={(event) =>
                            handleFilterChange("search", event.target.value)
                          }
                          className="rounded-xl border-slate-200 bg-white pl-10 text-slate-900 shadow-inner shadow-emerald-50 placeholder:text-slate-400 text-sm"
                        />
                        <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                      <SearchableSelect
                        value={filters.role}
                        onChange={(value) => handleFilterChange("role", value)}
                        options={ROLE_OPTIONS}
                        placeholder="Vai trò"
                      />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                      <SearchableSelect
                        value={filters.status}
                        onChange={(value) =>
                          handleFilterChange("status", value)
                        }
                        options={STATUS_OPTIONS}
                        placeholder="Trạng thái"
                      />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                      <SearchableSelect
                        value={filters.plan}
                        onChange={(value) => handleFilterChange("plan", value)}
                        options={packageOptions}
                        placeholder="Loại gói"
                      />
                    </div>
                    <div className="col-span-2 lg:col-span-2">
                      <Button
                        variant="outline"
                        className="h-10 sm:h-12 w-full rounded-xl border-emerald-100 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 text-xs sm:text-sm"
                        onClick={handleResetFilters}
                      >
                        Đặt lại bộ lọc
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      Hiển thị {paginatedUsers.length} / {totalCount} người dùng
                    </p>
                    <div className="flex items-center gap-3">
                      <Button
                        className="border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 disabled:border-emerald-200 disabled:bg-emerald-200 disabled:text-white/80"
                        disabled={!filteredUsers.length}
                        onClick={handleExportCSV}
                      >
                        Xuất CSV
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Card Layout */}
                  <div className="md:hidden space-y-3">
                    {loading && users.length === 0 ? (
                      <div className="flex items-center justify-center rounded-xl border border-slate-100 bg-white p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                        <span className="ml-3 text-slate-600">Đang tải...</span>
                      </div>
                    ) : paginatedUsers.length === 0 ? (
                      <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-slate-500">
                        Không có người dùng nào.
                      </div>
                    ) : (
                      paginatedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                              <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                            <ActionMenu user={user} onOpenModal={openModal} />
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-400">Mã:</span>
                              <span className="ml-1 font-medium text-slate-700">{user.id}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Vai trò:</span>
                              <Badge
                                className={cn(
                                  "ml-1 px-1.5 py-0.5 text-[10px]",
                                  ROLE_META[user.role]?.className ??
                                  "bg-slate-100 text-slate-600 border border-slate-200"
                                )}
                              >
                                {ROLE_META[user.role]?.label ?? user.role}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-slate-400">Trạng thái:</span>
                              <Badge
                                className={cn(
                                  "ml-1 border-0 px-1.5 py-0.5 text-[10px]",
                                  STATUS_META[user.status]?.className
                                )}
                              >
                                {STATUS_META[user.status]?.label}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-slate-400">Gói:</span>
                              <span className="ml-1 font-medium text-slate-700">{getPlanLabel(user.plan)}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-slate-400">
                            Đăng nhập: {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleString("vi-VN", { hour12: false })
                              : "Chưa đăng nhập"}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
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
                        {loading && users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                              <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
                              <p className="mt-2">Đang tải dữ liệu...</p>
                            </TableCell>
                          </TableRow>
                        ) : paginatedUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                              Không có người dùng nào.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedUsers.map((user) => (
                            <TableRow
                              key={user.id}
                              className="border-b border-slate-100 bg-white/60 transition hover:bg-emerald-50/40"
                            >
                              <TableCell className="font-semibold text-slate-900">{user.id}</TableCell>
                              <TableCell className="text-slate-800">{user.name}</TableCell>
                              <TableCell className="text-slate-500">{user.email}</TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "px-3 py-1 text-xs font-semibold",
                                    ROLE_META[user.role]?.className ??
                                    "bg-slate-100 text-slate-600 border border-slate-200"
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
                              <TableCell className="font-medium text-slate-800">{getPlanLabel(user.plan)}</TableCell>
                              <TableCell className="text-slate-500">
                                {user.lastLogin
                                  ? new Date(user.lastLogin).toLocaleString("vi-VN", { hour12: false })
                                  : "Chưa đăng nhập"}
                              </TableCell>
                              <TableCell className="text-right">
                                <ActionMenu user={user} onOpenModal={openModal} />
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
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

            {/* Modal chi tiết */}
            <Dialog
              open={activeModal === "details"}
              onOpenChange={(open) => {
                if (!open) closeModal();
              }}
            >
              <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl border border-emerald-50 shadow-2xl p-4 sm:p-6">
                <DialogHeader className="pb-2 sm:pb-4">
                  <DialogTitle className="text-base sm:text-lg">Thông tin chi tiết</DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    Hồ sơ chi tiết của {selectedUser?.name}
                  </DialogDescription>
                </DialogHeader>
                {selectedUser && (
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-[3fr,2fr]">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="rounded-lg sm:rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-slate-500">Họ tên</p>
                        <p className="text-base sm:text-lg font-semibold text-slate-900">
                          {selectedUser.name}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                        <div className="rounded-lg sm:rounded-xl border border-slate-100 p-3 sm:p-4">
                          <p className="text-sm text-slate-500">Email</p>
                          <p className="break-all font-medium">
                            {selectedUser.email}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-100 p-4">
                          <p className="text-sm text-slate-500">
                            Số điện thoại
                          </p>
                          <p className="font-medium">{selectedUser.phone}</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 p-4">
                          <p className="text-sm text-slate-500">Vai trò</p>
                          <Badge
                            className={cn(
                              "mt-1 px-3 py-1 text-xs font-semibold",
                              ROLE_META[selectedUser.role]?.className ??
                              "bg-slate-100 text-slate-600 border border-slate-200"
                            )}
                          >
                            {ROLE_META[selectedUser.role]?.label ??
                              selectedUser.role}
                          </Badge>
                        </div>
                        <div className="rounded-xl border border-slate-100 p-4">
                          <p className="text-sm text-slate-500">Trạng thái</p>
                          <Badge
                            className={cn(
                              "mt-1 border-0",
                              STATUS_META[selectedUser.status]?.className
                            )}
                          >
                            {STATUS_META[selectedUser.status]?.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-100 p-4">
                        <p className="text-sm text-slate-500">Địa phương</p>
                        <p className="font-medium">{selectedUser.province}</p>
                      </div>
                      <div className="rounded-xl border border-slate-100 p-4">
                        <p className="text-sm text-slate-500">
                          Ngày tạo tài khoản
                        </p>
                        <p className="font-medium">
                          {new Date(
                            selectedUser.createdAt ?? selectedUser.lastLogin
                          ).toLocaleString("vi-VN", {
                            hour12: false,
                          })}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-100 p-4">
                        <p className="text-sm text-slate-500">Gói hiện tại</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {getPlanLabel(selectedUser.plan)}
                        </p>
                        {(selectedUser?.planStartDate ||
                          selectedUser?.planEndDate) && (
                            <p className="text-sm text-slate-500">
                              Hiệu lực:{" "}
                              <span className="font-medium text-slate-700">
                                {formatDateDisplay(
                                  selectedUser?.planStartDate,
                                  "Chưa xác định"
                                )}
                                {" - "}
                                {formatDateDisplay(
                                  selectedUser?.planEndDate,
                                  "Không giới hạn"
                                )}
                              </span>
                            </p>
                          )}
                      </div>
                      <div className="rounded-xl border border-slate-100 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm text-slate-500">
                              Quy mô vận hành
                            </p>
                            <p className="text-lg font-semibold text-slate-900">
                              {selectedUser.gardensCount ?? 0} vườn
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">
                              Tổng cây đang quản lý
                            </p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {(selectedUser.treesCount ?? 0).toLocaleString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-3">
                          {selectedUser.gardensCount > 0 ? (
                            <p className="text-sm text-slate-500">
                              Người dùng đang quản lý{" "}
                              {selectedUser.gardensCount} vườn với tổng cộng{" "}
                              <span className="font-semibold text-emerald-600">
                                {(selectedUser.treesCount ?? 0).toLocaleString(
                                  "vi-VN"
                                )}
                              </span>{" "}
                              cây.
                            </p>
                          ) : (
                            <p className="text-sm text-slate-500">
                              Người dùng chưa quản lý vườn nào.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-700">
                        Thao tác nhanh
                      </p>
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
                        {selectedUser?.status === "inactive" ? (
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => openModal("unlock", selectedUser)}
                          >
                            <UserPlus className="h-4 w-4" />
                            Mở khoá người dùng
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-amber-600 hover:bg-amber-50"
                            onClick={() =>
                              openModal("deactivate", selectedUser)
                            }
                          >
                            <UserMinus className="h-4 w-4" />
                            Khoá người dùng
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
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Modal chỉnh gói */}
            <Dialog
              open={activeModal === "plan"}
              onOpenChange={(open) => {
                if (!open) closeModal();
              }}
            >
              <DialogContent className="max-w-md rounded-2xl border border-emerald-50 shadow-2xl">
                <DialogHeader>
                  <DialogTitle>Điều chỉnh gói dịch vụ</DialogTitle>
                  <DialogDescription>
                    Chọn một gói và xác nhận để áp dụng cho {selectedUser?.name}
                    .
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <SearchableSelect
                    value={planDraft}
                    onChange={(value) => {
                      setPlanDraft(value);
                      setPlanAcknowledged(false);
                    }}
                    options={packageOptions.filter(
                      (option) => option.value !== "all"
                    )}
                    placeholder="Chọn gói"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">
                        Ngày bắt đầu
                      </label>
                      <Input
                        type="date"
                        value={planStartDate}
                        onChange={(event) =>
                          setPlanStartDate(event.target.value)
                        }
                        className="rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">
                        Ngày kết thúc (tuỳ chọn)
                      </label>
                      <Input
                        type="date"
                        value={planEndDate}
                        min={planStartDate || undefined}
                        onChange={(event) => setPlanEndDate(event.target.value)}
                        className="rounded-xl border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Nếu để trống ngày kết thúc, hệ thống sẽ tự tính dựa trên
                    thời hạn gói.
                  </p>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <p>
                      Gói hiện tại:{" "}
                      <span className="font-semibold">
                        {getPlanLabel(selectedUser?.plan)}
                      </span>
                    </p>
                    <p>
                      Gói đề xuất:{" "}
                      <span className="font-semibold">
                        {getPlanLabel(planDraft)}
                      </span>
                    </p>
                    <p className="mt-2 text-xs">
                      Hiệu lực hiện tại:{" "}
                      <span className="font-semibold">
                        {formatDateDisplay(
                          selectedUser?.planStartDate,
                          "Chưa xác định"
                        )}{" "}
                        -{" "}
                        {formatDateDisplay(
                          selectedUser?.planEndDate,
                          "Không giới hạn"
                        )}
                      </span>
                    </p>
                    <p className="text-xs">
                      Hiệu lực mới:{" "}
                      <span className="font-semibold">
                        {planDraft === "free"
                          ? "Không áp dụng"
                          : `${formatDateDisplay(
                            planStartDate,
                            "Chưa chọn"
                          )} - ${planEndDate
                            ? formatDateDisplay(planEndDate)
                            : "Theo thời hạn gói"
                          }`}
                      </span>
                    </p>
                    <p className="mt-2 text-xs text-emerald-700">
                      * Sau khi xác nhận, hệ thống sẽ gửi email thông báo và tạo
                      log giám sát cho đội Quản trị hệ thống.
                    </p>
                  </div>
                  <label className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white/80 p-3">
                    <Checkbox
                      checked={planAcknowledged}
                      onCheckedChange={(checked) =>
                        setPlanAcknowledged(Boolean(checked))
                      }
                      className="mt-0.5"
                    />
                    <span className="text-sm text-slate-600">
                      Tôi đã kiểm tra thông tin và xác nhận thay đổi gói cho
                      người dùng này.
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
                    disabled={isPlanActionDisabled}
                  >
                    Xác nhận thay đổi
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Modal password */}
            <Dialog
              open={activeModal === "password"}
              onOpenChange={(open) => {
                if (!open) closeModal();
              }}
            >
              <DialogContent className="max-w-md rounded-2xl border border-emerald-50 shadow-2xl">
                <DialogHeader>
                  <DialogTitle>Đặt lại mật khẩu</DialogTitle>
                  <DialogDescription>
                    Nhập mật khẩu mới cho {selectedUser?.name}. Hệ thống sẽ yêu
                    cầu người dùng đổi lại sau khi đăng nhập.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Mật khẩu mới
                    </label>
                    <Input
                      type="text"
                      placeholder="Nhập mật khẩu mới (hiển thị rõ)"
                      value={passwordDraft}
                      onChange={(event) => {
                        setPasswordDraft(event.target.value);
                        setPasswordError("");
                      }}
                      className="rounded-xl border-slate-200 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Xác nhận mật khẩu mới
                    </label>
                    <Input
                      type="text"
                      placeholder="Nhập lại mật khẩu mới để xác nhận"
                      value={passwordConfirm}
                      onChange={(event) => {
                        setPasswordConfirm(event.target.value);
                        setPasswordError("");
                      }}
                      className="rounded-xl border-slate-200 bg-white"
                    />
                  </div>
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
                      <span className="text-sm text-slate-500">
                        Đã tạo: {generatedPassword}
                      </span>
                    )}
                  </div>
                  {pendingRandomConfirm && (
                    <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      <p>
                        Mật khẩu đề xuất:{" "}
                        <span className="font-semibold">
                          {generatedPassword}
                        </span>
                      </p>
                      <p>
                        Nhấn xác nhận để áp dụng và gửi email thông báo cho
                        người dùng.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={confirmRandomPasswordFlow}
                        >
                          Xác nhận đặt mật khẩu này
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={cancelRandomPasswordFlow}
                        >
                          Huỷ
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    Yêu cầu tối thiểu 10 ký tự, bao gồm chữ hoa, chữ thường và
                    số. Mật khẩu hiển thị rõ để admin kiểm tra trước khi gửi.
                  </p>
                  {passwordError && (
                    <p className="text-sm font-medium text-rose-600">
                      {passwordError}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={closeModal}>
                    Huỷ
                  </Button>
                  <Button
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={handlePasswordReset}
                    disabled={
                      !passwordDraft ||
                      !passwordConfirm ||
                      passwordDraft.length < 10 ||
                      passwordDraft !== passwordConfirm
                    }
                  >
                    Xác nhận
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Modal edit */}
            <Dialog
              open={activeModal === "edit"}
              onOpenChange={(open) => {
                if (!open) closeModal();
              }}
            >
              <DialogContent className="max-w-lg rounded-2xl border border-emerald-50 shadow-2xl">
                <DialogHeader>
                  <DialogTitle>Cập nhật thông tin cơ bản</DialogTitle>
                  <DialogDescription>
                    Điều chỉnh thông tin liên hệ hoặc vai trò của người dùng.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">
                      Họ tên
                    </label>
                    <Input
                      value={editDraft.name}
                      onChange={(event) =>
                        setEditDraft((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      className="rounded-xl border-slate-200 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600">
                      Số điện thoại
                    </label>
                    <Input
                      value={editDraft.phone}
                      onChange={(event) =>
                        setEditDraft((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                      className="rounded-xl border-slate-200 bg-white"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-slate-600">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={editDraft.email}
                      onChange={(event) =>
                        setEditDraft((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      className="rounded-xl border-slate-200 bg-white"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-slate-600">
                      Vai trò
                    </label>
                    <SearchableSelect
                      value={editDraft.role}
                      onChange={(value) => {
                        // Prevent selecting SystemAdmin
                        if (value === "SystemAdmin") return;
                        if (selectedUser?.role === "SystemAdmin") return;
                        setEditDraft((prev) => ({ ...prev, role: value }));
                      }}
                      options={ROLE_OPTIONS.filter(
                        (option) => option.value !== "all"
                      ).filter((option) => {
                        if (option.value === "SystemAdmin")
                          return selectedUser?.role === "SystemAdmin";
                        return true;
                      })}
                      placeholder="Chọn vai trò"
                      disabled={selectedUser?.role === "SystemAdmin"}
                    />
                    {selectedUser?.role === "SystemAdmin" && (
                      <p className="text-xs text-amber-600 mt-1">
                        Không thể thay đổi vai trò của Quản trị hệ thống
                      </p>
                    )}
                  </div>
                </div>
                {editError && (
                  <p className="text-sm font-medium text-rose-600">
                    {editError}
                  </p>
                )}
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

            {/* Modal khoá */}
            <Dialog
              open={activeModal === "deactivate"}
              onOpenChange={(open) => {
                if (!open) closeModal();
              }}
            >
              <DialogContent className="max-w-md rounded-2xl border border-rose-100 shadow-2xl">
                <DialogHeader>
                  <DialogTitle>Khoá tài khoản người dùng</DialogTitle>
                  <DialogDescription>
                    Thao tác này sẽ tạm khoá tài khoản. Người dùng sẽ không thể
                    truy cập hệ thống cho đến khi được mở khoá lại.
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                  Bạn chuẩn bị khoá tài khoản {selectedUser?.name}. Việc này sẽ
                  ngăn truy cập vào toàn bộ dịch vụ và có thể cần quy trình mở
                  khoá thủ công.
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={closeModal}>
                    Huỷ
                  </Button>
                  <Button
                    className="bg-rose-600 text-white hover:bg-rose-700"
                    onClick={handleDeactivateConfirm}
                  >
                    Tôi hiểu, khoá ngay
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Modal mở khoá */}
            <Dialog
              open={activeModal === "unlock"}
              onOpenChange={(open) => {
                if (!open) closeModal();
              }}
            >
              <DialogContent className="max-w-md rounded-2xl border border-emerald-100 shadow-2xl">
                <DialogHeader>
                  <DialogTitle>Mở khoá người dùng</DialogTitle>
                  <DialogDescription>
                    Cho phép {selectedUser?.name} truy cập trở lại vào hệ thống.
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                  Sau khi mở khoá, người dùng sẽ nhận email thông báo và có thể
                  đăng nhập lại ngay lập tức.
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={closeModal}>
                    Huỷ
                  </Button>
                  <Button
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={handleUnlockConfirm}
                  >
                    Mở khoá ngay
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Modal xoá vĩnh viễn */}
            <Dialog
              open={activeModal === "delete"}
              onOpenChange={(open) => {
                if (!open) closeModal();
              }}
            >
              <DialogContent className="max-w-md rounded-2xl border border-rose-200 shadow-2xl">
                <DialogHeader>
                  <DialogTitle>Xoá vĩnh viễn người dùng</DialogTitle>
                  <DialogDescription>
                    Đây là thao tác không thể hoàn tác. Toàn bộ dữ liệu liên
                    quan tới {selectedUser?.name} sẽ bị xoá khỏi hệ thống.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                  <p>
                    Hệ thống sẽ loại bỏ tài khoản khỏi danh sách và ghi log
                    audit cho đội Quản trị hệ thống.
                  </p>
                  <p>
                    Bạn nên khoá tài khoản trước khi xoá để đảm bảo tuân thủ
                    đúng quy trình nội bộ.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={closeModal}>
                    Huỷ
                  </Button>
                  <Button
                    className="bg-rose-600 text-white hover:bg-rose-700"
                    onClick={handleDeleteConfirm}
                  >
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
