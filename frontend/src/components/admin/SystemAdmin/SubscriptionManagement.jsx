import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CreditCard,
  DollarSign,
  LineChart,
  Loader2,
  ShieldCheck,
  Calendar as CalendarIcon,
} from "lucide-react";
import { LivingBackground } from "@/components/background";
import AdminLayout from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import AdminRevenueRepository from "@/API/repositories/AdminRevenueRepository";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const TIME_WINDOWS = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
];

const TRANSACTION_STATUS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "success", label: "Thành công" },
  { value: "failed", label: "Thất bại" },
  { value: "pending", label: "Đang xử lý" },
];

const PLAN_OPTIONS = [
  { value: "all", label: "Tất cả gói" },
  { value: "seedling", label: "Gói Ươm Mầm" },
  { value: "orchard", label: "Gói Vườn Xanh" },
  { value: "harvest", label: "Gói Thu Hoạch" },
];

const STATUS_META = {
  success: { label: "Thành công", className: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Thất bại", className: "bg-rose-50 text-rose-700" },
  pending: { label: "Đang xử lý", className: "bg-amber-50 text-amber-700" },
};

const BACKGROUND_PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const PLAN_COLORS = {
  seedling: "#22c55e",
  orchard: "#0f9d58",
  harvest: "#064e3b",
};

const formatDate = (value, fallback = "—") => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("vi-VN");
};

// Hàm format số tiền linh động (k, triệu, tỷ)
function formatCurrency(value) {
  if (value < 1_000_000) {
    // Dưới 1 triệu: hiển thị theo trăm nghìn (k)
    const thousands = value / 1_000;
    return `${thousands.toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })}k`;
  } else if (value < 1_000_000_000) {
    // Từ 1 triệu đến dưới 1 tỷ: hiển thị theo triệu
    const millions = value / 1_000_000;
    return `${millions.toLocaleString("vi-VN", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    })} triệu`;
  } else {
    // Từ 1 tỷ trở lên: hiển thị theo tỷ
    const billions = value / 1_000_000_000;
    return `${billions.toLocaleString("vi-VN", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    })} tỷ`;
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  isCurrency,
  variant = "default",
}) {
  const isDanger = variant === "danger";
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-emerald-200/60",
        isDanger ? "border-rose-200" : "border-emerald-100"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {isCurrency ? formatCurrency(value) : value.toLocaleString("vi-VN")}
          </p>
        </div>
        <div
          className={cn(
            "rounded-2xl p-3 shadow-inner group-hover:bg-emerald-100",
            isDanger
              ? "bg-rose-50 text-rose-600 shadow-rose-100 group-hover:bg-rose-100"
              : "bg-emerald-50 text-emerald-600 shadow-emerald-100"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          isDanger
            ? "from-rose-400/90 via-rose-500/80 to-orange-400/80"
            : "from-emerald-400/90 via-emerald-500/70 to-lime-400"
        )}
      />
    </div>
  );
}

function RevenueGrowthChart({ data, timeframeLabel, valueFormatter }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const value = payload[0].value;
    return (
      <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs shadow-md">
        <p className="font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-emerald-600">
          {valueFormatter ? valueFormatter(value) : formatCurrency(value)}
        </p>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-emerald-50 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 p-5 text-emerald-50 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Doanh thu theo thời gian
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Doanh thu theo {timeframeLabel.toLowerCase()}
          </h3>
          <p className="mt-1 text-xs text-emerald-100/80">
            Quan sát xu hướng doanh thu để tối ưu chiến lược kinh doanh.
          </p>
        </div>
      </div>
      <div className="flex-1 min-h-[260px]">
        {data && data.length > 0 ? (
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
                  id="revenueGrowthGradient"
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
                width={60}
                domain={[0, "auto"]}
                allowDecimals={true}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#bbf7d0"
                strokeWidth={2.4}
                fill="url(#revenueGrowthGradient)"
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
        ) : (
          <div className="flex h-full items-center justify-center text-emerald-200/60">
            <p className="text-sm">
              Chưa có dữ liệu doanh thu trong khoảng thời gian này
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-950/40 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <span className="font-medium text-emerald-100">Doanh thu</span>
        </div>
      </div>
    </div>
  );
}

function StatusDistributionChart({ data }) {
  // Remove dependency on allTransactions for revenue calculation
  const chartData = data.map((item) => ({
    ...item,
    label: item.label ?? STATUS_META[item.key]?.label ?? item.key,
    color:
      item.key === "success"
        ? "#22c55e"
        : item.key === "pending"
        ? "#f59e0b"
        : "#ef4444",
  }));

  const peakValue = chartData.reduce(
    (max, item) => Math.max(max, item.value),
    0
  );

  // Calculate total revenue from successful transactions
  const totalRevenue = data
    .filter((item) => item.key === "success")
    .reduce((sum, item) => sum + (item.revenue || 0), 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    return (
      <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs shadow-md">
        <p className="font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-emerald-600">
          {item.value.toLocaleString("vi-VN")} giao dịch
        </p>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-emerald-50 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Phân bổ trạng thái giao dịch
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            Tỷ lệ giao dịch
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] text-slate-500">
            Tổng doanh thu:{" "}
            <span className="font-semibold">
              {formatCurrency(totalRevenue)}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
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
                domain={[0, peakValue ? peakValue * 1.2 : 1]}
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

        <div className="space-y-3 md:w-52">
          <div className="space-y-2">
            {chartData.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2 text-sm shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-800">
                    {item.label}
                  </span>
                </div>
                <span className="font-semibold text-slate-900">
                  {item.value.toLocaleString("vi-VN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const PERIOD_TYPES = {
  day: "daily",
  week: "weekly",
  month: "monthly",
  year: "yearly",
};

const REVENUE_PAGE_SIZE = 10;

function SubscriptionManagement() {
  const [timeframe, setTimeframe] = useState("month");
  const [banner, setBanner] = useState(null);

  // Revenue management states
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState(null);
  const [revenueStartDate, setRevenueStartDate] = useState(null);
  const [revenueEndDate, setRevenueEndDate] = useState(null);
  const [revenuePage, setRevenuePage] = useState(1);
  const [revenueTotalPages, setRevenueTotalPages] = useState(1);
  const [revenueTotalCount, setRevenueTotalCount] = useState(0);
  const [revenueStatistics, setRevenueStatistics] = useState(null);
  const [revenueByPeriod, setRevenueByPeriod] = useState([]);
  const [revenueByPlan, setRevenueByPlan] = useState([]);
  const [revenuePayments, setRevenuePayments] = useState([]);
  const [revenueUserIdFilter, setRevenueUserIdFilter] = useState(null);
  const [revenueStatusFilter, setRevenueStatusFilter] = useState(null);

  // Revenue management functions
  const fetchRevenueStatistics = async () => {
    try {
      const stats = await AdminRevenueRepository.getRevenueStatistics(
        revenueStartDate || null,
        revenueEndDate || null
      );
      setRevenueStatistics(stats);
    } catch (err) {
      console.error("Error fetching revenue statistics:", err);
    }
  };

  const fetchRevenueByPeriod = async () => {
    try {
      const periodType = PERIOD_TYPES[timeframe] || "monthly";
      const data = await AdminRevenueRepository.getRevenueByPeriod(
        periodType,
        revenueStartDate || null,
        revenueEndDate || null
      );
      setRevenueByPeriod(data || []);
    } catch (err) {
      console.error("Error fetching revenue by period:", err);
    }
  };

  const fetchRevenueByPlan = async () => {
    try {
      const data = await AdminRevenueRepository.getRevenueByPlan(
        revenueStartDate || null,
        revenueEndDate || null
      );
      setRevenueByPlan(data || []);
    } catch (err) {
      console.error("Error fetching revenue by plan:", err);
    }
  };

  const fetchRevenuePayments = async () => {
    try {
      setRevenueLoading(true);
      const response = await AdminRevenueRepository.getPayments(
        revenuePage,
        REVENUE_PAGE_SIZE,
        revenueStartDate || null,
        revenueEndDate || null,
        revenueUserIdFilter || null,
        revenueStatusFilter || null
      );

      if (response.success) {
        setRevenuePayments(response.data || []);
        setRevenueTotalCount(response.pagination?.totalCount || 0);
        setRevenueTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching revenue payments:", err);
      const errorMsg =
        err.message || "Có lỗi xảy ra khi tải dữ liệu thanh toán";
      setRevenueError(errorMsg);
    } finally {
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueStatistics();
    fetchRevenueByPeriod();
    fetchRevenueByPlan();
    fetchRevenuePayments();
  }, [
    timeframe,
    revenueStartDate,
    revenueEndDate,
    revenuePage,
    revenueUserIdFilter,
    revenueStatusFilter,
  ]);

  useEffect(() => {
    if (!banner) return;
    const timeout = setTimeout(() => setBanner(null), 3500);
    return () => clearTimeout(timeout);
  }, [banner]);

  // Calculate revenue stats for display
  const revenueStats = useMemo(() => {
    if (!revenueStatistics) return null;

    const totalRevenue = revenueStatistics.totalRevenue || 0;
    const netRevenue = revenueStatistics.netRevenue || 0;
    const totalTransactions = revenueStatistics.totalTransactions || 0;
    const successfulTransactions =
      revenueStatistics.successfulTransactions || 0;

    return {
      revenue: {
        value: totalRevenue,
        icon: DollarSign,
        isCurrency: true,
      },
      transactions: {
        value: totalTransactions,
        icon: CreditCard,
        isCurrency: false,
      },
      success: {
        value: successfulTransactions,
        icon: LineChart,
        isCurrency: false,
      },
      net: {
        value: netRevenue,
        icon: DollarSign,
        isCurrency: true,
      },
    };
  }, [revenueStatistics]);

  // Calculate status distribution from API payments
  const statusDistributionData = useMemo(() => {
    if (!revenuePayments || revenuePayments.length === 0) {
      return [
        { key: "success", label: "Thành công", value: 0 },
        { key: "pending", label: "Đang xử lý", value: 0 },
        { key: "failed", label: "Thất bại", value: 0 },
      ];
    }

    const counts = revenuePayments.reduce((acc, payment) => {
      const status = payment.transactionStatus?.toLowerCase() || "pending";
      if (status === "success" || status === "completed") {
        acc.success = (acc.success || 0) + 1;
      } else if (status === "failed") {
        acc.failed = (acc.failed || 0) + 1;
      } else {
        acc.pending = (acc.pending || 0) + 1;
      }
      return acc;
    }, {});

    return [
      { key: "success", label: "Thành công", value: counts.success || 0 },
      { key: "pending", label: "Đang xử lý", value: counts.pending || 0 },
      { key: "failed", label: "Thất bại", value: counts.failed || 0 },
    ];
  }, [revenuePayments]);

  // Prepare revenue chart data for growth chart
  const revenueGrowthData = useMemo(() => {
    if (!revenueByPeriod || revenueByPeriod.length === 0) return [];

    return (revenueByPeriod || []).map((item) => ({
      label: item.period || item.periodStart || "",
      value: item.revenue || 0,
    }));
  }, [revenueByPeriod]);

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
      <div className="relative min-h-screen z-10">
        <AdminLayout>
          <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  Quản trị hệ thống
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  Quản lý thanh toán
                </h1>
                <p className="text-emerald-100/80">
                  Theo dõi doanh thu, trạng thái giao dịch và phân bổ gói trong
                  hệ sinh thái Mầm Mới.
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
                  <LineChart className="mr-2 h-4 w-4" />
                  Đồng bộ dữ liệu
                </Button>
              </div>
            </div>
            {banner && (
              <div
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm",
                  banner.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                )}
              >
                {banner.message}
              </div>
            )}
            {/* Revenue Section */}
            {revenueError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 shadow-sm">
                {revenueError}
              </div>
            )}
            {/* Revenue Statistics Cards */}
            {revenueStats && (
              <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-900">
                    Tổng quan doanh thu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Object.entries(revenueStats).map(([key, config]) => (
                      <StatCard
                        key={key}
                        label={
                          {
                            revenue: "Tổng doanh thu",
                            transactions: "Tổng giao dịch",
                            success: "Giao dịch thành công",
                            net: "Doanh thu ròng",
                          }[key] ?? key
                        }
                        value={config.value}
                        icon={config.icon}
                        isCurrency={config.isCurrency}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Revenue Chart */}

            {/* Revenue by Plan */}
            {revenueByPlan.length > 0 && (
              <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-900">
                    Doanh thu theo gói dịch vụ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByPlan}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="planName"
                          tick={{ fill: "#6b7280", fontSize: 11 }}
                        />
                        <YAxis
                          tick={{ fill: "#6b7280", fontSize: 11 }}
                          tickFormatter={formatCurrency}
                        />
                        <RechartsTooltip
                          formatter={(value) => formatCurrency(value)}
                        />
                        <Bar
                          dataKey="totalRevenue"
                          fill="#22c55e"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Charts Section */}
            <Card className="border-none bg-transparent text-slate-900 shadow-none">
              <CardContent className="grid gap-6 grid-cols-1 xl:grid-cols-2 p-0 lg:min-h-[360px]">
                <div className="xl:col-span-1 h-full">
                  <RevenueGrowthChart
                    data={revenueGrowthData}
                    timeframeLabel={
                      TIME_WINDOWS.find((t) => t.value === timeframe)?.label ??
                      "Kỳ"
                    }
                    valueFormatter={formatCurrency}
                  />
                </div>
                <div className="xl:col-span-1 h-full">
                  <StatusDistributionChart data={statusDistributionData} />
                </div>
              </CardContent>
            </Card>
            {/* Revenue Payments Table */}
            <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
              <CardHeader>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="text-2xl text-slate-900">
                    Danh sách thanh toán
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    {revenueTotalCount} giao dịch
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="mb-6 grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {revenueStartDate
                            ? new Date(revenueStartDate).toLocaleDateString(
                                "vi-VN"
                              )
                            : "Từ ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={revenueStartDate}
                          onSelect={setRevenueStartDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="lg:col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {revenueEndDate
                            ? new Date(revenueEndDate).toLocaleDateString(
                                "vi-VN"
                              )
                            : "Đến ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={revenueEndDate}
                          onSelect={setRevenueEndDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="lg:col-span-3">
                    <SearchableSelect
                      value={revenueStatusFilter || "all"}
                      onChange={(value) => {
                        setRevenueStatusFilter(value === "all" ? null : value);
                        setRevenuePage(1);
                      }}
                      options={[
                        { value: "all", label: "Tất cả trạng thái" },
                        { value: "Success", label: "Thành công" },
                        { value: "Failed", label: "Thất bại" },
                        { value: "Pending", label: "Đang xử lý" },
                      ]}
                      placeholder="Trạng thái"
                    />
                  </div>
                </div>

                {revenueLoading && revenuePayments.length === 0 ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <span className="ml-3 text-slate-600">
                      Đang tải dữ liệu...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                      <Table>
                        <TableHeader className="sticky top-0 bg-emerald-50/80 backdrop-blur">
                          <TableRow className="border-none text-xs uppercase tracking-wider text-slate-500">
                            <TableHead>STT</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Gói dịch vụ</TableHead>
                            <TableHead>Ngày bắt đầu</TableHead>
                            <TableHead>Ngày kết thúc</TableHead>
                            <TableHead>Số tiền</TableHead>
                            <TableHead>Ngày thanh toán</TableHead>
                            <TableHead>Trạng thái</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {revenuePayments.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="py-8 text-center text-slate-500"
                              >
                                Không có giao dịch nào.
                              </TableCell>
                            </TableRow>
                          ) : (
                            revenuePayments.map((payment, index) => (
                              <TableRow
                                key={payment.paymentId}
                                className="border-b border-slate-100 bg-white/60 transition hover:bg-emerald-50/40"
                              >
                                <TableCell className="font-semibold text-slate-900">
                                  {(revenuePage - 1) * REVENUE_PAGE_SIZE +
                                    index +
                                    1}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-slate-900">
                                      {payment.userName}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {payment.userEmail}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-800">
                                  {payment.planName}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {formatDate(
                                    payment.subscriptionStartDate,
                                    "Chưa xác định"
                                  )}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {payment.subscriptionEndDate
                                    ? formatDate(
                                        payment.subscriptionEndDate,
                                        "Không giới hạn"
                                      )
                                    : "Không giới hạn"}
                                </TableCell>
                                <TableCell className="font-semibold text-emerald-700">
                                  {payment.amount.toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: payment.currency || "VND",
                                  })}
                                </TableCell>
                                <TableCell className="text-slate-500">
                                  {new Date(
                                    payment.paymentDate
                                  ).toLocaleDateString("vi-VN")}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={cn(
                                      "border-0",
                                      payment.transactionStatus === "Success"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : payment.transactionStatus === "Failed"
                                        ? "bg-rose-50 text-rose-700"
                                        : "bg-amber-50 text-amber-700"
                                    )}
                                  >
                                    {payment.transactionStatus === "Success"
                                      ? "Thành công"
                                      : payment.transactionStatus === "Failed"
                                      ? "Thất bại"
                                      : "Đang xử lý"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {revenueTotalPages > 1 && (
                      <Pagination className="mt-6">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setRevenuePage((prev) => Math.max(1, prev - 1));
                              }}
                              className={
                                revenuePage === 1
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                          {Array.from(
                            { length: revenueTotalPages },
                            (_, i) => i + 1
                          ).map((p) => (
                            <PaginationItem key={p}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setRevenuePage(p);
                                }}
                                isActive={revenuePage === p}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setRevenuePage((prev) =>
                                  Math.min(revenueTotalPages, prev + 1)
                                );
                              }}
                              className={
                                revenuePage === revenueTotalPages
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </div>
    </>
  );
}

export default SubscriptionManagement;
