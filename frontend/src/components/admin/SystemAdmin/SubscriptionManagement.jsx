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
import { InsightAreaChart, SegmentDistributionCard } from "../components/AnalyticsCharts";
import { cn } from "@/lib/utils";
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

const DASHBOARD_DATA = {
  week: {
    label: "so với tuần trước",
    stats: {
      revenue: { value: 82450000, change: 0.18, icon: DollarSign },
      success: { value: 142, change: 0.11, icon: CreditCard },
      failed: { value: 9, change: -0.06, icon: Loader2 },
      activeUsers: { value: 312, change: 0.23, icon: ShieldCheck },
    },
    revenueTrend: {
      change: 0.16,
      series: [
        { label: "T2", value: 8.2 },
        { label: "T3", value: 9.5 },
        { label: "T4", value: 10.3 },
        { label: "T5", value: 11.8 },
        { label: "T6", value: 13.1 },
        { label: "T7", value: 12.4 },
        { label: "CN", value: 10.7 },
      ],
    },
    breakdown: {
      byPlan: [
        { key: "seedling", label: "Gói Ươm Mầm", value: 46 },
        { key: "orchard", label: "Gói Vườn Xanh", value: 34 },
        { key: "harvest", label: "Gói Thu Hoạch", value: 20 },
      ],
      byStatus: [
        { key: "success", label: "Thành công", value: 142 },
        { key: "pending", label: "Đang xử lý", value: 12 },
        { key: "failed", label: "Thất bại", value: 9 },
      ],
      change: 0.07,
    },
  },
  month: {
    label: "so với tháng trước",
    stats: {
      revenue: { value: 324_500_000, change: 0.22, icon: DollarSign },
      success: { value: 612, change: 0.17, icon: CreditCard },
      failed: { value: 34, change: -0.04, icon: Loader2 },
      activeUsers: { value: 1280, change: 0.29, icon: ShieldCheck },
    },
    revenueTrend: {
      change: 0.21,
      series: Array.from({ length: 30 }).map((_, idx) => ({
        label: `Ngày ${idx + 1}`,
        value: 7 + Math.round(Math.sin(idx / 3) * 2 + (idx % 5) * 0.8),
      })),
    },
    breakdown: {
      byPlan: [
        { key: "seedling", label: "Gói Ươm Mầm", value: 41 },
        { key: "orchard", label: "Gói Vườn Xanh", value: 37 },
        { key: "harvest", label: "Gói Thu Hoạch", value: 22 },
      ],
      byStatus: [
        { key: "success", label: "Thành công", value: 612 },
        { key: "pending", label: "Đang xử lý", value: 54 },
        { key: "failed", label: "Thất bại", value: 34 },
      ],
      change: 0.09,
    },
  },
  year: {
    label: "so với năm trước",
    stats: {
      revenue: { value: 3_742_800_000, change: 0.35, icon: DollarSign },
      success: { value: 7312, change: 0.27, icon: CreditCard },
      failed: { value: 412, change: -0.08, icon: Loader2 },
      activeUsers: { value: 4423, change: 0.41, icon: ShieldCheck },
    },
    revenueTrend: {
      change: 0.31,
      series: Array.from({ length: 12 }).map((_, idx) => ({
        label: `T${idx + 1}`,
        value: 210 + Math.round(Math.cos(idx / 2.3) * 28 + idx * 11),
      })),
    },
    breakdown: {
      byPlan: [
        { key: "seedling", label: "Gói Ươm Mầm", value: 38 },
        { key: "orchard", label: "Gói Vườn Xanh", value: 36 },
        { key: "harvest", label: "Gói Thu Hoạch", value: 26 },
      ],
      byStatus: [
        { key: "success", label: "Thành công", value: 7312 },
        { key: "pending", label: "Đang xử lý", value: 684 },
        { key: "failed", label: "Thất bại", value: 412 },
      ],
      change: 0.04,
    },
  },
};

const MOCK_TRANSACTIONS = [
  {
    id: "TX-20251118-0001",
    userId: "USR-000245",
    userName: "Nguyễn Minh Hoàng",
    amount: 1290000,
    plan: "orchard",
    status: "success",
    time: "2025-11-18T09:24:00",
  },
  {
    id: "TX-20251117-0007",
    userId: "USR-000874",
    userName: "Trần Thị Mai",
    amount: 490000,
    plan: "seedling",
    status: "success",
    time: "2025-11-17T14:05:00",
  },
  {
    id: "TX-20251117-0012",
    userId: "USR-000421",
    userName: "Phạm Anh Tuấn",
    amount: 3890000,
    plan: "harvest",
    status: "pending",
    time: "2025-11-17T16:15:00",
  },
  {
    id: "TX-20251116-0003",
    userId: "USR-000912",
    userName: "Võ Thảo Nhi",
    amount: 1290000,
    plan: "orchard",
    status: "failed",
    time: "2025-11-16T19:22:00",
  },
  {
    id: "TX-20251115-0008",
    userId: "USR-000533",
    userName: "Lê Quang Khải",
    amount: 490000,
    plan: "seedling",
    status: "success",
    time: "2025-11-15T12:13:00",
  },
  {
    id: "TX-20251112-0010",
    userId: "USR-000278",
    userName: "Đỗ Thanh Vân",
    amount: 1290000,
    plan: "orchard",
    status: "success",
    time: "2025-11-12T07:55:00",
  },
];

const PAGE_SIZE = 8;

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

function StatCard({ label, value, change, icon: Icon, isCurrency }) {
  const isPositive = change >= 0;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-emerald-200/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {isCurrency
              ? value.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
              : value.toLocaleString("vi-VN")}
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
          {isPositive ? (
            <Percent className="mr-1 h-3 w-3" />
          ) : (
            <Percent className="mr-1 h-3 w-3 rotate-180" />
          )}
          {`${isPositive ? "+" : ""}${Math.round(change * 100)}%`}
        </Badge>
        <span className="text-slate-500">so với kỳ trước</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400/90 via-emerald-500/70 to-lime-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </div>
  );
}


function SubscriptionManagement() {
  const [timeframe, setTimeframe] = useState("month");
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState(null);
  const [renewDraft, setRenewDraft] = useState({ action: "extend", duration: "30" });
  const [banner, setBanner] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusDraft, setStatusDraft] = useState("");
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);

  const dashboard = DASHBOARD_DATA[timeframe];

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
    setHistoryOpen(true);
  };

  const closeHistoryDialog = () => {
    setHistoryOpen(false);
    setHistoryUser(null);
    setHistoryRecords([]);
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
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === statusTarget.id ? { ...tx, status: statusDraft } : tx))
    );
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
                      revenue: "Tổng doanh thu",
                      success: "Giao dịch thành công",
                      failed: "Giao dịch thất bại",
                      activeUsers: "Người dùng đang sử dụng gói",
                    }[key]
                  }
                  value={config.value}
                  change={config.change}
                  icon={config.icon}
                  isCurrency={key === "revenue"}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-transparent text-slate-900 shadow-none">
          <CardContent className="grid gap-6 grid-cols-1 xl:grid-cols-2 p-0">
            <InsightAreaChart
              data={dashboard.revenueTrend.series}
              change={dashboard.revenueTrend.change}
              title="Doanh thu theo thời gian"
              subtitle="Doanh thu"
              valueFormatter={(value) =>
                `${value.toLocaleString("vi-VN", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                })} tỷ`
              }
            />
            <SegmentDistributionCard
              data={dashboard.breakdown.byStatus}
              change={dashboard.breakdown.change}
              title="Phân bổ trạng thái giao dịch"
              subtitle="Tỷ lệ giao dịch"
            />
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
                            variant="ghost"
                            size="sm"
                            className="text-emerald-700 hover:bg-emerald-50"
                            onClick={() => openDetail(tx)}
                          >
                            Xem chi tiết
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:bg-slate-100"
                            onClick={() => openStatusDialog(tx)}
                          >
                            Cập nhật trạng thái
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
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
                {historyRecords.map((record) => (
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
                <Select value={statusDraft} onValueChange={setStatusDraft}>
                  <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_STATUS.filter((option) => option.value !== "all").map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">Xác nhận trước khi cập nhật</p>
                  <p className="text-xs text-amber-700">
                    Thao tác này có thể ảnh hưởng tới SLA với khách hàng. Vui lòng chắc chắn trước khi lưu.
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


