import React, { useEffect, useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  LineChart,
  ShieldCheck,
  RefreshCcw,
  Loader2,
  Calendar,
  FileDown,
  X,
} from "lucide-react";
import { LivingBackground } from "@/components/background";
import AdminLayout from "../layout/AdminLayout";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminRevenueRepository from "@/API/repositories/AdminRevenueRepository";
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

const BACKGROUND_PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const TIME_WINDOWS = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
];

const PERIOD_TYPES = {
  day: "daily",
  week: "weekly",
  month: "monthly",
  year: "yearly",
};

const PAGE_SIZE = 10;

// Format currency helper
function formatCurrency(value) {
  if (value < 1_000_000) {
    const thousands = value / 1_000;
    return `${thousands.toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })}k`;
  } else if (value < 1_000_000_000) {
    const millions = value / 1_000_000;
    return `${millions.toLocaleString("vi-VN", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    })} triệu`;
  } else {
    const billions = value / 1_000_000_000;
    return `${billions.toLocaleString("vi-VN", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    })} tỷ`;
  }
}

function StatCard({ label, value, change, icon: Icon, isCurrency }) {
  const isPositive = change >= 0;
  const percent = `${isPositive ? "+" : ""}${Math.round(change * 100)}%`;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-emerald-200/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {isCurrency ? formatCurrency(value) : value.toLocaleString("vi-VN")}
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
          {percent}
        </Badge>
        <span className="text-slate-500">so với kỳ trước</span>
      </div>
    </div>
  );
}

export default function RevenueManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("month");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Data states
  const [statistics, setStatistics] = useState(null);
  const [revenueByPeriod, setRevenueByPeriod] = useState([]);
  const [revenueByPlan, setRevenueByPlan] = useState([]);
  const [payments, setPayments] = useState([]);

  // Filters
  const [userIdFilter, setUserIdFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const [actionNotice, setActionNotice] = useState(null);

  // Payment history dialog states
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] =
    useState(false);
  const [userPaymentHistory, setUserPaymentHistory] = useState([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [paymentHistoryPage, setPaymentHistoryPage] = useState(1);
  const [paymentHistoryTotalPages, setPaymentHistoryTotalPages] = useState(1);
  const [paymentHistoryTotalCount, setPaymentHistoryTotalCount] = useState(0);

  // Fetch revenue statistics
  const fetchStatistics = async () => {
    try {
      const stats = await AdminRevenueRepository.getRevenueStatistics(
        startDate || null,
        endDate || null
      );
      setStatistics(stats);
    } catch (err) {
      console.error("Error fetching revenue statistics:", err);
    }
  };

  // Fetch revenue by period
  const fetchRevenueByPeriod = async () => {
    try {
      const periodType = PERIOD_TYPES[timeframe] || "monthly";
      const data = await AdminRevenueRepository.getRevenueByPeriod(
        periodType,
        startDate || null,
        endDate || null
      );
      setRevenueByPeriod(data || []);
    } catch (err) {
      console.error("Error fetching revenue by period:", err);
    }
  };

  // Fetch revenue by plan
  const fetchRevenueByPlan = async () => {
    try {
      const data = await AdminRevenueRepository.getRevenueByPlan(
        startDate || null,
        endDate || null
      );
      setRevenueByPlan(data || []);
    } catch (err) {
      console.error("Error fetching revenue by plan:", err);
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await AdminRevenueRepository.getPayments(
        page,
        PAGE_SIZE,
        startDate || null,
        endDate || null,
        userIdFilter || null,
        statusFilter || null
      );

      if (response.success) {
        setPayments(response.data || []);
        setTotalCount(response.pagination?.totalCount || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      const errorMsg =
        err.message || "Có lỗi xảy ra khi tải dữ liệu thanh toán";
      setError(errorMsg);
      setActionNotice({ message: errorMsg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    fetchRevenueByPeriod();
    fetchRevenueByPlan();
  }, [timeframe, startDate, endDate]);

  useEffect(() => {
    fetchPayments();
  }, [page, startDate, endDate, userIdFilter, statusFilter]);

  // Fetch payment history for selected user
  const fetchUserPaymentHistory = async (
    userId,
    userName,
    userEmail,
    pageNum = 1
  ) => {
    try {
      setPaymentHistoryLoading(true);
      const response = await AdminRevenueRepository.getPayments(
        pageNum,
        PAGE_SIZE,
        null,
        null,
        userId,
        null
      );

      if (response.success) {
        setUserPaymentHistory(response.data || []);
        setPaymentHistoryTotalCount(response.pagination?.totalCount || 0);
        setPaymentHistoryTotalPages(response.pagination?.totalPages || 1);
        setSelectedUser({ userId, userName, userEmail });
        setIsPaymentHistoryDialogOpen(true);
      }
    } catch (err) {
      console.error("Error fetching user payment history:", err);
      setActionNotice({
        message: "Có lỗi xảy ra khi tải lịch sử thanh toán",
        tone: "error",
      });
    } finally {
      setPaymentHistoryLoading(false);
    }
  };

  // Handle click on user name
  const handleUserNameClick = (payment) => {
    fetchUserPaymentHistory(
      payment.userId,
      payment.userName,
      payment.userEmail,
      1
    );
  };

  // Handle payment history dialog page change
  const handlePaymentHistoryPageChange = (newPage) => {
    if (selectedUser) {
      setPaymentHistoryPage(newPage);
      fetchUserPaymentHistory(
        selectedUser.userId,
        selectedUser.userName,
        selectedUser.userEmail,
        newPage
      );
    }
  };

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = setTimeout(() => setActionNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [actionNotice]);

  // Calculate stats for display
  const stats = useMemo(() => {
    if (!statistics) return null;

    const totalRevenue = statistics.totalRevenue || 0;
    const totalRefunded = statistics.totalRefunded || 0;
    const netRevenue = statistics.netRevenue || 0;
    const totalTransactions = statistics.totalTransactions || 0;
    const successfulTransactions = statistics.successfulTransactions || 0;

    // Placeholder change values - would need historical data for accurate calculation
    const revenueChange = 0.15;
    const transactionsChange = 0.1;
    const successRateChange = 0.05;

    return {
      revenue: {
        value: totalRevenue,
        change: revenueChange,
        icon: DollarSign,
        isCurrency: true,
      },
      transactions: {
        value: totalTransactions,
        change: transactionsChange,
        icon: CreditCard,
        isCurrency: false,
      },
      success: {
        value: successfulTransactions,
        change: successRateChange,
        icon: LineChart,
        isCurrency: false,
      },
      net: {
        value: netRevenue,
        change: revenueChange,
        icon: DollarSign,
        isCurrency: true,
      },
    };
  }, [statistics]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return (revenueByPeriod || []).map((item) => ({
      label: item.period || item.periodStart,
      value: item.revenue || 0,
      net: item.netRevenue || 0,
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
      <div className="relative z-10 min-h-screen">
        <AdminLayout>
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  Quản trị hệ thống
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  Quản lý doanh thu
                </h1>
                <p className="text-emerald-100/80">
                  Theo dõi doanh thu, giao dịch và phân tích tài chính.
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
                  onClick={() => {
                    fetchStatistics();
                    fetchRevenueByPeriod();
                    fetchRevenueByPlan();
                    fetchPayments();
                  }}
                  disabled={loading}
                >
                  <RefreshCcw
                    className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
                  />
                  {loading ? "Đang tải..." : "Làm mới"}
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
                  actionNotice.tone === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                )}
              >
                {actionNotice.message}
              </div>
            )}

            {/* Statistics Cards */}
            {stats && (
              <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-900">
                    Tổng quan doanh thu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Object.entries(stats).map(([key, config]) => (
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
                        change={config.change}
                        icon={config.icon}
                        isCurrency={config.isCurrency}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Revenue Chart */}
            {chartData.length > 0 && (
              <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-900">
                    Biểu đồ doanh thu theo{" "}
                    {TIME_WINDOWS.find(
                      (t) => t.value === timeframe
                    )?.label.toLowerCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "#6b7280", fontSize: 11 }}
                        />
                        <YAxis
                          tick={{ fill: "#6b7280", fontSize: 11 }}
                          tickFormatter={formatCurrency}
                        />
                        <RechartsTooltip
                          formatter={(value) => formatCurrency(value)}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#22c55e"
                          fill="#bbf7d0"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

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

            {/* Payments Table */}
            <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
              <CardHeader>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="text-2xl text-slate-900">
                    Danh sách thanh toán
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    {totalCount} giao dịch
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
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate
                            ? new Date(startDate).toLocaleDateString("vi-VN")
                            : "Từ ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
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
                          <Calendar className="mr-2 h-4 w-4" />
                          {endDate
                            ? new Date(endDate).toLocaleDateString("vi-VN")
                            : "Đến ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="lg:col-span-3">
                    <Select
                      value={statusFilter || "all"}
                      onValueChange={(value) => {
                        setStatusFilter(value === "all" ? null : value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="Success">Thành công</SelectItem>
                        <SelectItem value="Failed">Thất bại</SelectItem>
                        <SelectItem value="Pending">Đang xử lý</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {loading && payments.length === 0 ? (
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
                            <TableHead>ID</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Gói dịch vụ</TableHead>
                            <TableHead>Số tiền</TableHead>
                            <TableHead>Ngày thanh toán</TableHead>
                            <TableHead>Trạng thái</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="py-8 text-center text-slate-500"
                              >
                                Không có giao dịch nào.
                              </TableCell>
                            </TableRow>
                          ) : (
                            payments.map((payment) => (
                              <TableRow
                                key={payment.paymentId}
                                className="border-b border-slate-100 bg-white/60 transition hover:bg-emerald-50/40"
                              >
                                <TableCell className="font-semibold text-slate-900">
                                  #{payment.paymentId}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <button
                                      onClick={() =>
                                        handleUserNameClick(payment)
                                      }
                                      className="font-medium text-slate-900 hover:text-emerald-600 hover:underline cursor-pointer transition-colors text-left"
                                    >
                                      {payment.userName}
                                    </button>
                                    <p className="text-xs text-slate-500">
                                      {payment.userEmail}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-800">
                                  {payment.planName}
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
                    {totalPages > 1 && (
                      <Pagination className="mt-6">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setPage((prev) => Math.max(1, prev - 1));
                              }}
                              className={
                                page === 1
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((p) => (
                            <PaginationItem key={p}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPage(p);
                                }}
                                isActive={page === p}
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
                                setPage((prev) =>
                                  Math.min(totalPages, prev + 1)
                                );
                              }}
                              className={
                                page === totalPages
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

      {/* Payment History Dialog */}
      <Dialog
        open={isPaymentHistoryDialogOpen}
        onOpenChange={(open) => {
          setIsPaymentHistoryDialogOpen(open);
          if (!open) {
            setSelectedUser(null);
            setUserPaymentHistory([]);
            setPaymentHistoryPage(1);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              Lịch sử thanh toán
              {selectedUser && (
                <div className="mt-2 text-base font-normal text-slate-600">
                  <p className="font-medium">{selectedUser.userName}</p>
                  <p className="text-sm text-slate-500">
                    {selectedUser.userEmail}
                  </p>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {paymentHistoryLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <span className="ml-3 text-slate-600">
                  Đang tải lịch sử thanh toán...
                </span>
              </div>
            ) : userPaymentHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                Không có giao dịch nào.
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                  <Table>
                    <TableHeader className="sticky top-0 bg-emerald-50/80 backdrop-blur">
                      <TableRow className="border-none text-xs uppercase tracking-wider text-slate-500">
                        <TableHead>ID</TableHead>
                        <TableHead>Gói dịch vụ</TableHead>
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Phương thức</TableHead>
                        <TableHead>Ngày thanh toán</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userPaymentHistory.map((payment) => (
                        <TableRow
                          key={payment.paymentId}
                          className="border-b border-slate-100 bg-white/60 transition hover:bg-emerald-50/40"
                        >
                          <TableCell className="font-semibold text-slate-900">
                            #{payment.paymentId}
                          </TableCell>
                          <TableCell className="text-slate-800">
                            {payment.planName}
                          </TableCell>
                          <TableCell className="font-semibold text-emerald-700">
                            {payment.amount.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: payment.currency || "VND",
                            })}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {payment.paymentMethod || "N/A"}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {new Date(payment.paymentDate).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
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
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {paymentHistoryTotalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePaymentHistoryPageChange(
                              Math.max(1, paymentHistoryPage - 1)
                            );
                          }}
                          className={
                            paymentHistoryPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: paymentHistoryTotalPages },
                        (_, i) => i + 1
                      ).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePaymentHistoryPageChange(p);
                            }}
                            isActive={paymentHistoryPage === p}
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
                            handlePaymentHistoryPageChange(
                              Math.min(
                                paymentHistoryTotalPages,
                                paymentHistoryPage + 1
                              )
                            );
                          }}
                          className={
                            paymentHistoryPage === paymentHistoryTotalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}

                <div className="mt-4 text-sm text-slate-500 text-center">
                  Tổng cộng: {paymentHistoryTotalCount} giao dịch
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
