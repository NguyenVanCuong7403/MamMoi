import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CreditCard,
  DollarSign,
  FileDown,
  History,
  LineChart,
  Loader2,
  Package,
  Percent,
  ShieldCheck,
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
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

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

// Tạo dữ liệu mẫu transactions
const generateMockTransactions = () => {
  const now = new Date();
  const users = [
    { id: "USR-000001", name: "Nguyễn Minh Hoàng" },
    { id: "USR-000002", name: "Trần Thị Mai" },
    { id: "USR-000003", name: "Phạm Anh Tuấn" },
    { id: "USR-000004", name: "Võ Thảo Nhi" },
    { id: "USR-000005", name: "Lê Quang Khải" },
    { id: "USR-000006", name: "Đỗ Thanh Vân" },
    { id: "USR-000007", name: "Huỳnh Tấn Tài" },
    { id: "USR-000008", name: "Đinh Yến Nhi" },
    { id: "USR-000009", name: "Trương Quý Long" },
    { id: "USR-000010", name: "Hồ Khánh Linh" },
    { id: "USR-000011", name: "Tô Thành Phát" },
    { id: "USR-000012", name: "Phan Ngọc Trang" },
  ];

  const plans = ["seedling", "orchard", "harvest"];
  const planAmounts = {
    seedling: 490000,
    orchard: 1290000,
    harvest: 3890000,
  };
  const statuses = ["success", "success", "success", "pending", "failed"]; // Ưu tiên success
  const transactions = [];

  // Tạo giao dịch trong 30 ngày gần nhất
  for (let i = 0; i < 200; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const date = new Date(
      now.getTime() -
        daysAgo * 24 * 60 * 60 * 1000 -
        hoursAgo * 60 * 60 * 1000 -
        minutesAgo * 60 * 1000
    );

    const plan = plans[Math.floor(Math.random() * plans.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    transactions.push({
      id: `TX-${date.toISOString().split("T")[0].replace(/-/g, "")}-${String(i + 1).padStart(4, "0")}`,
      userId: user.id,
      userName: user.name,
      amount: planAmounts[plan],
      plan,
      status,
      time: date.toISOString(),
    });
  }

  // Tạo thêm giao dịch trong 365 ngày gần nhất (cho timeframe year)
  for (let i = 0; i < 500; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const daysAgo = Math.floor(Math.random() * 365);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const date = new Date(
      now.getTime() -
        daysAgo * 24 * 60 * 60 * 1000 -
        hoursAgo * 60 * 60 * 1000 -
        minutesAgo * 60 * 1000
    );

    const plan = plans[Math.floor(Math.random() * plans.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    transactions.push({
      id: `TX-${date.toISOString().split("T")[0].replace(/-/g, "")}-${String(i + 201).padStart(4, "0")}`,
      userId: user.id,
      userName: user.name,
      amount: planAmounts[plan],
      plan,
      status,
      time: date.toISOString(),
    });
  }

  // Sắp xếp transactions theo thời gian
  transactions.sort((a, b) => new Date(b.time) - new Date(a.time));

  return transactions;
};

const MOCK_TRANSACTIONS = generateMockTransactions();

const PAGE_SIZE = 10;
const HISTORY_PAGE_SIZE = 5;

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

function escapeCsvValue(value) {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

function exportTransactionsToCSV(rows) {
  if (!rows || rows.length === 0) return;
  const headers = [
    "transaction_id",
    "user_id",
    "user_name",
    "plan",
    "amount",
    "status",
    "time",
  ];

  const csvRows = rows.map((row) =>
    [
      escapeCsvValue(row.id),
      escapeCsvValue(row.userId),
      escapeCsvValue(row.userName),
      escapeCsvValue(PLAN_OPTIONS.find((plan) => plan.value === row.plan)?.label ?? row.plan),
      escapeCsvValue(
        row.amount.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })
      ),
      escapeCsvValue(STATUS_META[row.status]?.label ?? row.status),
      escapeCsvValue(new Date(row.time).toLocaleString("vi-VN", { hour12: false })),
    ].join(",")
  );

  const csvContent = [headers.join(","), ...csvRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `transactions-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const defaultFilters = {
  search: "",
  status: "all",
  plan: "all",
  from: null,
  to: null,
};

function StatCard({ label, value, change, icon: Icon, isCurrency, variant = "default" }) {
  const isPositive = change >= 0;
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
            {isCurrency
              ? formatCurrency(value)
              : value.toLocaleString("vi-VN")}
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
      <div className="mt-4 flex items-center gap-2 text-sm">
        <Badge
          className={cn(
            "border-0 px-2.5 py-0.5",
            isDanger
              ? "bg-rose-100 text-rose-700"
              : isPositive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-50 text-rose-600"
          )}
        >
          {isPositive ? (
            <TrendingUp className="mr-1 h-3 w-3" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3" />
          )}
          {`${isPositive ? "+" : ""}${Math.round(change * 100)}%`}
        </Badge>
        <span className="text-slate-500">so với kỳ trước</span>
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

function RevenueGrowthChart({ data, change, timeframeLabel, valueFormatter }) {
  const isPositive = change >= 0;
  const changeLabel = `${isPositive ? "+" : ""}${Math.round(change * 100)}%`;

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
          <p className="mt-1 text-[11px] text-emerald-100/70">so với kỳ trước</p>
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
                <linearGradient id="revenueGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bbf7d0" stopOpacity={0.95} />
                  <stop offset="60%" stopColor="#4ade80" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#064e3b" strokeDasharray="3 3" opacity={0.35} />
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
                domain={[0, 'auto']}
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
                dot={{ r: 3, strokeWidth: 1.5, stroke: "#dcfce7", fill: "#22c55e" }}
                activeDot={{ r: 5, strokeWidth: 0, fill: "#22c55e" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-emerald-200/60">
            <p className="text-sm">Chưa có dữ liệu doanh thu trong khoảng thời gian này</p>
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

function StatusDistributionChart({ data, change, allTransactions = [], timeframe = "month" }) {
  const chartData = data.map((item) => ({
    ...item,
    label: item.label ?? STATUS_META[item.key]?.label ?? item.key,
    color: item.key === "success" ? "#22c55e" : item.key === "pending" ? "#f59e0b" : "#ef4444",
  }));

  // Tính change cho từng status item
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? current * 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getPeriodLabel = () => {
    if (timeframe === "day") return "ngày";
    if (timeframe === "week") return "tuần";
    if (timeframe === "month") return "tháng";
    return "năm";
  };

  const periodLabel = getPeriodLabel();

  // Tính toán comparison data từ dữ liệu thực tế
  const getComparisonData = () => {
    const now = new Date();
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;

    if (timeframe === "day") {
      currentPeriodStart = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    } else if (timeframe === "week") {
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

    const previousCounts = { success: 0, pending: 0, failed: 0 };

    allTransactions.forEach((tx) => {
      const txDate = new Date(tx.time);
      if (txDate >= previousPeriodStart && txDate < previousPeriodEnd) {
        previousCounts[tx.status] = (previousCounts[tx.status] || 0) + 1;
      }
    });

    return previousCounts;
  };

  const previousData = getComparisonData();

  // Tính change cho từng loại status
  const chartDataWithChange = chartData.map((item) => {
    const previousValue = previousData[item.key] || 0;
    const changeValue = calculateChange(item.value, previousValue);
    return { ...item, change: changeValue };
  });

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const peakValue = chartData.reduce(
    (max, item) => Math.max(max, item.value),
    0,
  );
  
  // Tính tổng doanh thu từ transactions thành công trong khoảng thời gian hiện tại
  const now = new Date();
  let currentPeriodStart;
  if (timeframe === "day") {
    currentPeriodStart = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  } else if (timeframe === "week") {
    currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (timeframe === "month") {
    currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else {
    currentPeriodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }
  
  const totalRevenue = allTransactions
    .filter((tx) => {
      const txDate = new Date(tx.time);
      return tx.status === "success" && txDate >= currentPeriodStart && txDate <= now;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const isPositive = change >= 0;
  const changeLabel = `${isPositive ? "+" : ""}${Math.round(change * 100)}%`;

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
          <Badge
            className={cn(
              "border-0 px-2.5 py-1 text-xs font-semibold",
              isPositive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-50 text-rose-600",
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
              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              >
                {chartData.map((item) => (
                  <Cell key={item.key} fill={item.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 md:w-52">
          <div className="space-y-2">
            {chartDataWithChange.map((item) => (
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


function SubscriptionManagement() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [timeframe, setTimeframe] = useState("month");
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState(null);
  const [renewDraft, setRenewDraft] = useState({ action: "extend", duration: "30" });
  const [banner, setBanner] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusDraft, setStatusDraft] = useState("");
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);

  // Hàm cập nhật transaction
  const updateTransaction = (transactionId, updates) => {
    setTransactions((prev) => prev.map((t) => (t.id === transactionId ? { ...t, ...updates } : t)));
  };

  // Tính toán stats từ transactions thực tế
  const stats = useMemo(() => {
    const now = new Date();
    let periodStart, previousPeriodStart, previousPeriodEnd;

    if (timeframe === "day") {
      periodStart = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = periodStart;
    } else if (timeframe === "week") {
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = periodStart;
    } else if (timeframe === "month") {
      periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = periodStart;
    } else {
      periodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = periodStart;
    }

    const revenue = transactions
      .filter((tx) => {
        const txDate = new Date(tx.time);
        return tx.status === "success" && txDate >= periodStart && txDate <= now;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    const success = transactions.filter((tx) => {
      const txDate = new Date(tx.time);
      return tx.status === "success" && txDate >= periodStart && txDate <= now;
    }).length;

    const failed = transactions.filter((tx) => {
      const txDate = new Date(tx.time);
      return tx.status === "failed" && txDate >= periodStart && txDate <= now;
    }).length;

    const activeUsers = new Set(
      transactions
        .filter((tx) => {
          const txDate = new Date(tx.time);
          return tx.status === "success" && txDate >= periodStart && txDate <= now;
        })
        .map((tx) => tx.userId)
    ).size;

    // Tính change so với kỳ trước
    const previousRevenue = transactions
      .filter((tx) => {
        const txDate = new Date(tx.time);
        return tx.status === "success" && txDate >= previousPeriodStart && txDate < previousPeriodEnd;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    const previousSuccess = transactions.filter((tx) => {
      const txDate = new Date(tx.time);
      return tx.status === "success" && txDate >= previousPeriodStart && txDate < previousPeriodEnd;
    }).length;

    const previousFailed = transactions.filter((tx) => {
      const txDate = new Date(tx.time);
      return tx.status === "failed" && txDate >= previousPeriodStart && txDate < previousPeriodEnd;
    }).length;

    const previousActiveUsers = new Set(
      transactions
        .filter((tx) => {
          const txDate = new Date(tx.time);
          return tx.status === "success" && txDate >= previousPeriodStart && txDate < previousPeriodEnd;
        })
        .map((tx) => tx.userId)
    ).size;

    const revenueChange = previousRevenue > 0 ? (revenue - previousRevenue) / previousRevenue : (revenue > 0 ? 1 : 0);
    const successChange = previousSuccess > 0 ? (success - previousSuccess) / previousSuccess : (success > 0 ? 1 : 0);
    const failedChange = previousFailed > 0 ? (failed - previousFailed) / previousFailed : (failed > 0 ? 1 : 0);
    const activeUsersChange = previousActiveUsers > 0 ? (activeUsers - previousActiveUsers) / previousActiveUsers : (activeUsers > 0 ? 1 : 0);

    return {
      revenue: { value: revenue, change: revenueChange, icon: DollarSign, isCurrency: true },
      success: { value: success, change: successChange, icon: CreditCard, isCurrency: false },
      failed: { value: failed, change: failedChange, icon: Loader2, isCurrency: false },
      activeUsers: { value: activeUsers, change: activeUsersChange, icon: ShieldCheck, isCurrency: false },
    };
  }, [transactions, timeframe]);

  // Tính toán revenue growth chart từ dữ liệu thực tế
  const revenueGrowthData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    let bucketCount = 7;
    let getBucketLabel;

    if (timeframe === "day") {
      // 24 giờ gần nhất
      startDate = new Date(now.getTime() - 23 * 60 * 60 * 1000);
      startDate.setMinutes(0, 0, 0);
      bucketCount = 24;
      getBucketLabel = (date) => `${date.getHours()}h`;
    } else if (timeframe === "week") {
      // Với tuần, tính từ 7 ngày trước đến hiện tại
      startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 ngày trước + hôm nay = 7 ngày
      startDate.setHours(0, 0, 0, 0); // Bắt đầu từ 00:00:00
      bucketCount = 7;
      getBucketLabel = (date) => {
        const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        return days[date.getDay()];
      };
    } else if (timeframe === "month") {
      startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000); // 29 ngày trước + hôm nay = 30 ngày
      startDate.setHours(0, 0, 0, 0);
      bucketCount = 30;
      getBucketLabel = (date, index) => `Ngày ${index + 1}`;
    } else {
      // Với năm, tính theo 12 tháng gần nhất
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 11); // 11 tháng trước + tháng hiện tại = 12 tháng
      startDate.setDate(1); // Ngày đầu tháng
      startDate.setHours(0, 0, 0, 0);
      bucketCount = 12;
      getBucketLabel = (date, index) => `T${index + 1}`;
    }

    const buckets = [];
    let bucketSize;

    // Khởi tạo tất cả buckets với index để đảm bảo thứ tự
    if (timeframe === "year") {
      // Với năm, mỗi bucket là 1 tháng
      for (let i = 0; i < bucketCount; i++) {
        const bucketStart = new Date(startDate);
        bucketStart.setMonth(startDate.getMonth() + i);
        const bucketEnd = new Date(bucketStart);
        bucketEnd.setMonth(bucketStart.getMonth() + 1);
        if (i === bucketCount - 1) {
          bucketEnd.setTime(now.getTime());
        }
        
        const label = getBucketLabel(bucketStart, i);
        buckets.push({
          index: i,
          label,
          value: 0,
          startTime: bucketStart.getTime(),
          endTime: bucketEnd.getTime(),
        });
      }
    } else {
      // Với week và month, chia đều khoảng thời gian
      bucketSize = (now.getTime() - startDate.getTime()) / bucketCount;
      for (let i = 0; i < bucketCount; i++) {
        const bucketStart = new Date(startDate.getTime() + i * bucketSize);
        const bucketEnd = i === bucketCount - 1 
          ? now 
          : new Date(startDate.getTime() + (i + 1) * bucketSize);
        
        const label = getBucketLabel(bucketStart, i);
        buckets.push({
          index: i,
          label,
          value: 0,
          startTime: bucketStart.getTime(),
          endTime: bucketEnd.getTime(),
        });
      }
    }

    // Tính revenue theo bucket (chỉ tính giao dịch thành công trong khoảng thời gian)
    const startTime = startDate.getTime();
    const endTime = now.getTime();
    
    transactions
      .filter((tx) => {
        const txDate = new Date(tx.time).getTime();
        return tx.status === "success" && txDate >= startTime && txDate <= endTime;
      })
      .forEach((tx) => {
        const txDate = new Date(tx.time).getTime();
        
        // Tìm bucket chứa giao dịch này
        for (let i = 0; i < buckets.length; i++) {
          const bucket = buckets[i];
          // Với bucket cuối cùng, bao gồm cả thời điểm hiện tại
          if (i === buckets.length - 1) {
            if (txDate >= bucket.startTime && txDate <= bucket.endTime) {
              buckets[i].value += tx.amount;
              break;
            }
          } else {
            if (txDate >= bucket.startTime && txDate < bucket.endTime) {
              buckets[i].value += tx.amount;
              break;
            }
          }
        }
      });

    // Sắp xếp theo index và format
    const series = buckets
      .sort((a, b) => a.index - b.index)
      .map((bucket) => ({
        label: bucket.label,
        value: Math.round(bucket.value * 10) / 10, // Làm tròn 1 chữ số thập phân
      }));

    return series;
  }, [transactions, timeframe]);

  // Tính toán revenue change percentage
  const revenueGrowthChange = useMemo(() => {
    const now = new Date();
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;

    if (timeframe === "day") {
      currentPeriodStart = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    } else if (timeframe === "week") {
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

    const currentRevenue = transactions
      .filter((tx) => {
        const txDate = new Date(tx.time);
        return tx.status === "success" && txDate >= currentPeriodStart && txDate <= now;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    const previousRevenue = transactions
      .filter((tx) => {
        const txDate = new Date(tx.time);
        return tx.status === "success" && txDate >= previousPeriodStart && txDate < previousPeriodEnd;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (previousRevenue === 0) return currentRevenue > 0 ? 1 : 0;
    return (currentRevenue - previousRevenue) / previousRevenue;
  }, [transactions, timeframe]);

  // Tính toán status distribution từ dữ liệu thực tế
  const statusDistributionData = useMemo(() => {
    const counts = transactions.reduce((acc, tx) => {
      acc[tx.status] = (acc[tx.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { key: "success", label: "Thành công", value: counts.success || 0 },
      { key: "pending", label: "Đang xử lý", value: counts.pending || 0 },
      { key: "failed", label: "Thất bại", value: counts.failed || 0 },
    ];
  }, [transactions]);

  // Tính toán status distribution change
  const statusDistributionChange = useMemo(() => {
    const now = new Date();
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;

    if (timeframe === "day") {
      currentPeriodStart = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    } else if (timeframe === "week") {
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

    const currentTotal = transactions.filter((tx) => {
      const txDate = new Date(tx.time);
      return txDate >= currentPeriodStart && txDate <= now;
    }).length;

    const previousTotal = transactions.filter((tx) => {
      const txDate = new Date(tx.time);
      return txDate >= previousPeriodStart && txDate < previousPeriodEnd;
    }).length;

    if (previousTotal === 0) return currentTotal > 0 ? 1 : 0;
    return (currentTotal - previousTotal) / previousTotal;
  }, [transactions, timeframe]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        !filters.search ||
        tx.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        tx.userName.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === "all" || tx.status === filters.status;
      const matchesPlan = filters.plan === "all" || tx.plan === filters.plan;

      let matchesDate = true;
      if (filters.from) {
        matchesDate = matchesDate && new Date(tx.time) >= new Date(filters.from);
      }
      if (filters.to) {
        matchesDate = matchesDate && new Date(tx.time) <= new Date(filters.to);
      }

      return matchesSearch && matchesStatus && matchesPlan && matchesDate;
    });
  }, [filters, transactions]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!banner) return;
    const timeout = setTimeout(() => setBanner(null), 3500);
    return () => clearTimeout(timeout);
  }, [banner]);

  useEffect(() => {
    const totalHistoryPages = Math.max(1, Math.ceil(historyRecords.length / HISTORY_PAGE_SIZE));
    if (historyPage > totalHistoryPages) {
      setHistoryPage(totalHistoryPages);
    }
  }, [historyRecords, historyPage]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const openDetail = (tx) => {
    setSelectedTransaction(tx);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedTransaction(null);
  };

  const openRenewDialog = (tx) => {
    setRenewTarget(tx);
    setRenewDraft({
      action: tx.status === "success" ? "extend" : "activate",
      duration: "30",
    });
    setRenewOpen(true);
  };

  const closeRenewDialog = () => {
    setRenewOpen(false);
    setRenewTarget(null);
  };

  const handleRenewConfirm = () => {
    if (!renewTarget) return;
    const planLabel = PLAN_OPTIONS.find((plan) => plan.value === renewTarget.plan)?.label ?? renewTarget.plan;
    const actionLabel = renewDraft.action === "extend" ? "gia hạn" : "kích hoạt";
    setBanner({
      tone: "success",
      message: `Đã ${actionLabel} gói ${planLabel} cho ${renewTarget.userName} (${renewTarget.userId}) trong ${renewDraft.duration} ngày.`,
    });
    closeRenewDialog();
  };

  const handleExportTransactions = () => {
    exportTransactionsToCSV(filteredTransactions);
  };

  const openHistoryDialog = (tx) => {
    const records = transactions
      .filter((item) => item.userId === tx.userId)
      .sort((a, b) => new Date(b.time) - new Date(a.time));
    setHistoryUser({ id: tx.userId, name: tx.userName });
    setHistoryRecords(records);
    setHistoryPage(1);
    setHistoryOpen(true);
  };

  const closeHistoryDialog = () => {
    setHistoryOpen(false);
    setHistoryUser(null);
    setHistoryRecords([]);
    setHistoryPage(1);
  };

  const openStatusDialog = (tx) => {
    setStatusTarget(tx);
    setStatusDraft(tx.status);
    setStatusDialogOpen(true);
  };

  const closeStatusDialog = () => {
    setStatusDialogOpen(false);
    setStatusTarget(null);
    setStatusDraft("");
    setStatusConfirmOpen(false);
  };

  const requestStatusConfirm = () => {
    if (!statusTarget || !statusDraft || statusDraft === statusTarget.status) return;
    setStatusConfirmOpen(true);
  };

  const applyStatusUpdate = () => {
    if (!statusTarget || !statusDraft) return;
    // Cập nhật transaction thông qua context
    updateTransaction(statusTarget.id, { status: statusDraft });
    setBanner({
      tone: "info",
      message: `Đã cập nhật trạng thái ${statusTarget.id} thành ${
        STATUS_META[statusDraft]?.label ?? statusDraft
      }.`,
    });
    setStatusConfirmOpen(false);
    closeStatusDialog();
  };

  const startIndex = (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, filteredTransactions.length);
  const canSaveStatus =
    !!statusTarget && !!statusDraft && statusTarget.status !== statusDraft;
  const historyTotalPages = Math.max(
    1,
    Math.ceil(historyRecords.length / HISTORY_PAGE_SIZE),
  );
  const historyStartIndex =
    historyRecords.length === 0 ? 0 : (historyPage - 1) * HISTORY_PAGE_SIZE + 1;
  const historyEndIndex = Math.min(
    historyPage * HISTORY_PAGE_SIZE,
    historyRecords.length,
  );
  const historyPaginatedRecords = historyRecords.slice(
    (historyPage - 1) * HISTORY_PAGE_SIZE,
    historyPage * HISTORY_PAGE_SIZE,
  );

  return (
    <>
      <LivingBackground
        baseColor={BACKGROUND_PALETTE.bg}
        palette={[BACKGROUND_PALETTE.leaf, BACKGROUND_PALETTE.ivory, BACKGROUND_PALETTE.accent]}
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
              Quản lý thanh toán & gói dịch vụ
            </h1>
            <p className="text-emerald-100/80">
              Theo dõi doanh thu, trạng thái giao dịch và phân bổ gói trong hệ sinh thái Mầm Mới.
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

        <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-2xl text-slate-900">Tổng quan doanh thu</CardTitle>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <LineChart className="h-4 w-4 text-emerald-600" />
              Dữ liệu {TIME_WINDOWS.find((t) => t.value === timeframe)?.label?.toLowerCase()}{" "}
              hiện tại{" "}
              <span className="font-semibold text-emerald-600">
                so với kỳ trước
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Object.entries(stats).map(([key, config]) => (
                <StatCard
                  key={key}
                  label={
                    {
                      revenue: "Tổng doanh thu",
                      success: "Giao dịch thành công",
                      failed: "Giao dịch thất bại",
                      activeUsers: "Người dùng đang sử dụng gói",
                    }[key]
                  }
                  value={config.value}
                  change={config.change}
                  icon={config.icon}
                  isCurrency={config.isCurrency}
                  variant={key === "failed" ? "danger" : "default"}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-transparent text-slate-900 shadow-none">
          <CardContent className="grid gap-6 grid-cols-1 xl:grid-cols-2 p-0 lg:min-h-[360px]">
            <div className="xl:col-span-1 h-full">
              <RevenueGrowthChart
                data={revenueGrowthData}
                change={revenueGrowthChange}
                timeframeLabel={TIME_WINDOWS.find((t) => t.value === timeframe)?.label ?? "Kỳ"}
                valueFormatter={formatCurrency}
              />
            </div>
            <div className="xl:col-span-1 h-full">
              <StatusDistributionChart
                data={statusDistributionData}
                change={statusDistributionChange}
                allTransactions={transactions}
                timeframe={timeframe}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-2xl text-slate-900">Danh sách thanh toán</CardTitle>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Package className="h-4 w-4 text-emerald-600" />
                  {filteredTransactions.length} giao dịch khớp bộ lọc
                </div>
              </div>
              <Button
                className="gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={handleExportTransactions}
                disabled={filteredTransactions.length === 0}
              >
                <FileDown className="h-4 w-4" />
                Xuất CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="relative">
                  <Input
                    placeholder="Tìm mã giao dịch hoặc tên khách hàng..."
                    value={filters.search}
                    onChange={(event) => handleFilterChange("search", event.target.value)}
                    className="rounded-xl border-slate-200 bg-white pl-10 text-slate-900 shadow-inner shadow-emerald-50 placeholder:text-slate-400"
                  />
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="lg:col-span-2">
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900">
                    <SelectValue placeholder="Trạng thái" className="text-slate-500" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_STATUS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-2">
                <Select
                  value={filters.plan}
                  onValueChange={(value) => handleFilterChange("plan", value)}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900">
                    <SelectValue placeholder="Loại gói" className="text-slate-500" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex w-full items-center justify-between rounded-xl border-slate-200 bg-white text-left font-normal text-slate-700 hover:bg-slate-50"
                    >
                      <span className="truncate">
                        {filters.from
                          ? `Từ: ${new Date(filters.from).toLocaleDateString("vi-VN")}`
                          : "Từ ngày"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.from}
                      onSelect={(date) => handleFilterChange("from", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="lg:col-span-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex w-full items-center justify-between rounded-xl border-slate-200 bg-white text-left font-normal text-slate-700 hover:bg-slate-50"
                    >
                      <span className="truncate">
                        {filters.to
                          ? `Đến: ${new Date(filters.to).toLocaleDateString("vi-VN")}`
                          : "Đến ngày"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.to}
                      onSelect={(date) => handleFilterChange("to", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                Hiển thị {filteredTransactions.length === 0 ? 0 : `${startIndex}–${endIndex}`} /{" "}
                {filteredTransactions.length} giao dịch
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">
                  Trang {page} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
              <Table>
                <TableHeader className="sticky top-0 bg-emerald-50/80 backdrop-blur">
                  <TableRow className="border-none text-xs uppercase tracking-wider text-slate-500">
                    <TableHead>Mã giao dịch</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Loại gói</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="border-b border-slate-100 bg-white/60 transition hover:bg-emerald-50/40"
                    >
                      <TableCell className="font-semibold text-slate-900">
                        {tx.id}
                      </TableCell>
                      <TableCell className="text-slate-800">
                        <button
                          type="button"
                          className="font-semibold text-slate-900 transition hover:text-emerald-600"
                          onClick={() => openHistoryDialog(tx)}
                        >
                          {tx.userName}
                        </button>
                        <p className="text-xs font-mono text-slate-500">{tx.userId}</p>
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">
                        {tx.amount.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">
                        {PLAN_OPTIONS.find((p) => p.value === tx.plan)?.label}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border-0", STATUS_META[tx.status]?.className)}>
                          {STATUS_META[tx.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(tx.time).toLocaleString("vi-VN", { hour12: false })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="rounded-full border border-emerald-100 bg-white/90 px-4 py-2 text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                            onClick={() => openDetail(tx)}
                          >
                            Xem chi tiết
                          </Button>
                          <Button
                            size="sm"
                            className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-slate-600 shadow-sm transition hover:bg-slate-50"
                            onClick={() => openStatusDialog(tx)}
                          >
                            Cập nhật trạng thái
                          </Button>
                          <Button
                            size="sm"
                            className="rounded-full bg-emerald-600 px-4 py-2 text-white shadow-sm transition hover:bg-emerald-700"
                            onClick={() => openRenewDialog(tx)}
                          >
                            Gia hạn / kích hoạt
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedTransactions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-sm text-slate-500"
                      >
                        Không có giao dịch nào khớp bộ lọc.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={detailOpen} onOpenChange={(open) => !open && closeDetail()}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Chi tiết giao dịch</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết của giao dịch được chọn.
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4 text-sm text-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Mã giao dịch
                    </p>
                    <p className="mt-1 font-mono text-slate-900">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">Khách hàng</p>
                    <p className="mt-1 text-slate-900">{selectedTransaction.userName}</p>
                    <p className="text-xs font-mono text-slate-500">{selectedTransaction.userId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Số tiền
                    </p>
                    <p className="mt-1 font-semibold text-emerald-700">
                      {selectedTransaction.amount.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Gói
                    </p>
                    <p className="mt-1 text-slate-900">
                      {PLAN_OPTIONS.find((p) => p.value === selectedTransaction.plan)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Trạng thái
                    </p>
                    <p className="mt-1">
                      <Badge
                        className={cn(
                          "border-0",
                          STATUS_META[selectedTransaction.status]?.className
                        )}
                      >
                        {STATUS_META[selectedTransaction.status]?.label}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Thời gian
                    </p>
                    <p className="mt-1 text-slate-900">
                      {new Date(selectedTransaction.time).toLocaleString("vi-VN", {
                        hour12: false,
                      })}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                  Các hành động như hoàn tiền, gia hạn hoặc kích hoạt gói sẽ được
                  tích hợp trực tiếp với cổng thanh toán trong bản triển khai chính thức.
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={historyOpen}
          onOpenChange={(open) => {
            if (!open) {
              closeHistoryDialog();
            } else {
              setHistoryOpen(true);
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Lịch sử thanh toán</DialogTitle>
              <DialogDescription>
                {historyUser
                  ? `Danh sách giao dịch của ${historyUser.name} (${historyUser.id}).`
                  : "Không có dữ liệu người dùng."}
              </DialogDescription>
            </DialogHeader>
            {historyRecords.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <span>
                    Hiển thị{" "}
                    {historyRecords.length === 0
                      ? 0
                      : `${historyStartIndex}–${historyEndIndex}`}{" "}
                    / {historyRecords.length} giao dịch
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                      disabled={historyPage === 1}
                      onClick={() =>
                        setHistoryPage((prev) => Math.max(1, prev - 1))
                      }
                    >
                      Trước
                    </Button>
                    <span className="text-xs text-slate-400">
                      Trang {historyPage} / {historyTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                      disabled={historyPage === historyTotalPages}
                      onClick={() =>
                        setHistoryPage((prev) =>
                          Math.min(historyTotalPages, prev + 1),
                        )
                      }
                    >
                      Sau
                    </Button>
                  </div>
                </div>
                {historyPaginatedRecords.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm text-slate-700">{record.id}</p>
                      <Badge className={cn("border-0", STATUS_META[record.status]?.className)}>
                        {STATUS_META[record.status]?.label}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {PLAN_OPTIONS.find((plan) => plan.value === record.plan)?.label}
                    </p>
                    <p className="text-sm text-emerald-700">
                      {record.amount.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(record.time).toLocaleString("vi-VN", { hour12: false })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                Chưa có giao dịch nào cho người dùng này.
              </p>
            )}
          </DialogContent>
        </Dialog>

      <Dialog
        open={renewOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeRenewDialog();
          } else {
            setRenewOpen(true);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gia hạn / kích hoạt gói</DialogTitle>
            <DialogDescription>
              Xác nhận thao tác cho giao dịch của khách hàng {renewTarget?.userName}.
            </DialogDescription>
          </DialogHeader>
          {renewTarget && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Khách hàng</p>
                <p className="mt-1 font-semibold text-slate-900">{renewTarget.userName}</p>
                <p className="text-xs font-mono text-slate-500">{renewTarget.userId}</p>
                <p className="text-sm text-slate-600">
                  Gói hiện tại:{" "}
                  {PLAN_OPTIONS.find((plan) => plan.value === renewTarget.plan)?.label}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Hành động</label>
                <Select
                  value={renewDraft.action}
                  onValueChange={(value) => setRenewDraft((prev) => ({ ...prev, action: value }))}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                    <SelectValue placeholder="Chọn hành động" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extend">Gia hạn thêm thời gian</SelectItem>
                    <SelectItem value="activate">Kích hoạt ngay gói</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Thời lượng gia hạn (ngày)
                </label>
                <Select
                  value={renewDraft.duration}
                  onValueChange={(value) => setRenewDraft((prev) => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                    <SelectValue placeholder="Chọn thời lượng" />
                  </SelectTrigger>
                  <SelectContent>
                    {["30", "90", "180"].map((day) => (
                      <SelectItem key={day} value={day}>
                        {day} ngày
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={closeRenewDialog}>
              Huỷ
            </Button>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleRenewConfirm}>
              Xác nhận thao tác
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeStatusDialog();
          } else {
            setStatusDialogOpen(true);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái giao dịch</DialogTitle>
            <DialogDescription>
              Sau khi cập nhật, hệ thống sẽ ghi lại log audit và thông báo cho đội tài chính.
            </DialogDescription>
          </DialogHeader>
          {statusTarget && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Giao dịch</p>
                <p className="mt-1 font-mono text-slate-900">{statusTarget.id}</p>
                <p className="text-sm text-slate-600">
                  {statusTarget.userName} · {statusTarget.userId}
                </p>
                <p className="text-xs text-slate-500">
                  {PLAN_OPTIONS.find((plan) => plan.value === statusTarget.plan)?.label}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Trạng thái mới</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {TRANSACTION_STATUS.filter((option) => option.value !== "all").map((option) => {
                    const isPending = option.value === "pending";
                    const isFailed = option.value === "failed";
                    const isActive = statusDraft === option.value;
                    const isCurrent = statusTarget?.status === option.value;
                    return (
                        <button
                          type="button"
                          key={option.value}
                          disabled={isPending}
                          onClick={() => !isPending && setStatusDraft(option.value)}
                          className={cn(
                            "rounded-2xl border p-3 text-left text-sm font-semibold transition focus:outline-none",
                            "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:text-emerald-700",
                            isActive && !isPending && !isFailed && "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-inner ring-2 ring-emerald-100",
                            isActive && isFailed && "border-rose-500 bg-rose-50 text-rose-700 shadow-inner ring-2 ring-rose-100",
                            isPending && "cursor-not-allowed opacity-60",
                          )}
                        >
                        <span>{option.label}</span>
                        <p className="mt-1 text-xs font-normal text-slate-500">
                          {option.value === "success"
                            ? "Hoàn tất giao dịch"
                            : option.value === "failed"
                            ? "Không thể xử lý"
                            : "Hệ thống tự động xử lý"}
                        </p>
                        {isCurrent && (
                          <span
                            className={cn(
                              "mt-2 block text-[10px] font-medium",
                              isFailed ? "text-rose-600" : "text-emerald-600",
                            )}
                          >
                            Giao dịch đang ở trạng thái này
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">
                  Trạng thái “Đang xử lý” được hệ thống kiểm soát và không thể cập nhật thủ công.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Xác nhận trước khi cập nhật</p>
                  <p className="text-xs text-amber-700">
                    Thao tác này có thể ảnh hưởng tới dịch vụ của khách hàng. Vui lòng chắc chắn trước khi lưu.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={closeStatusDialog}>
              Huỷ
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={!canSaveStatus}
              onClick={requestStatusConfirm}
            >
              Lưu trạng thái
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={statusConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setStatusConfirmOpen(false);
          } else if (canSaveStatus) {
            setStatusConfirmOpen(true);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận cập nhật trạng thái</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp cập nhật giao dịch {statusTarget?.id} sang trạng thái{" "}
              <strong>{STATUS_META[statusDraft]?.label ?? statusDraft}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
            <p>Mọi thay đổi sẽ được lưu trong lịch sử và gửi cảnh báo nếu trạng thái là "Thất bại".</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={applyStatusUpdate}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </AdminLayout>
    </div>
  </>
  );
}

export default SubscriptionManagement;


