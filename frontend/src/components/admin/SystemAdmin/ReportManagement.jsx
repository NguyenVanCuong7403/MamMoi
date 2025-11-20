import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileDown,
  Filter,
  Loader2,
  MailCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { LivingBackground } from "@/components/background";
import AdminLayout from "../layout/AdminLayout";

const BACKGROUND_PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const TIME_SEGMENTS = [
  { value: "all", label: "Toàn bộ", durationHours: Infinity },
  { value: "24h", label: "24h gần nhất", durationHours: 24 },
  { value: "7d", label: "7 ngày", durationHours: 24 * 7 },
  { value: "30d", label: "30 ngày", durationHours: 24 * 30 },
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "Ưu tiên cao" },
  { value: "medium", label: "Ưu tiên trung bình" },
  { value: "low", label: "Ưu tiên thấp" },
  { value: "all", label: "Tất cả ưu tiên" },
];

const REPORT_TYPES = [
  { value: "auth", label: "Đăng nhập & Đăng ký" },
  { value: "payment", label: "Thanh toán" },
  { value: "system", label: "Hệ thống" },
  { value: "other", label: "Khác" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "in_progress", label: "Đang xử lý" },
  { value: "resolved", label: "Đã xử lý" },
  { value: "rejected", label: "Bị từ chối" },
];

const STATUS_FLOW_OPTIONS = STATUS_OPTIONS.filter((option) => option.value !== "all");

const STATUS_META = {
  in_progress: { label: "Đang xử lý", className: "bg-amber-50 text-amber-700" },
  resolved: { label: "Đã xử lý", className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Bị từ chối", className: "bg-rose-50 text-rose-700" },
};

const STATUS_LABELS = {
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý",
  rejected: "Bị từ chối",
};

const STATUS_BADGE_FALLBACK = "bg-slate-100 text-slate-600";

const PRIORITY_META = {
  high: { label: "Cao", className: "bg-rose-100 text-rose-700", accent: "text-rose-600" },
  medium: { label: "Trung bình", className: "bg-amber-100 text-amber-700", accent: "text-amber-600" },
  low: { label: "Thấp", className: "bg-emerald-100 text-emerald-700", accent: "text-emerald-600" },
};

const TYPE_META = {
  auth: { label: "Đăng nhập & Đăng ký", color: "#0d9488" },
  payment: { label: "Thanh toán", color: "#047857" },
  system: { label: "Hệ thống", color: "#4ade80" },
  other: { label: "Khác", color: "#a3e635" },
};

const SLA_HOURS = 24;

const MOCK_REPORTS = [
  {
    id: "RP-20251118-0001",
    type: "payment",
    title: "Thanh toán QR bị treo, không tạo hóa đơn",
    summary: "User báo thanh toán xong nhưng hệ thống không kích hoạt gói.",
    user: { id: "USR-9081", name: "Nguyễn Bảo Khánh", email: "khanh.nguyen@example.com" },
    createdAt: "2025-11-17T08:05:00",
    priority: "high",
    status: "new",
    content:
      "Khách hàng thanh toán gói Harvest Enterprise qua QR VietQR, đã trừ tiền nhưng dashboard vẫn báo gói cũ. Hệ thống không ghi nhận giao dịch.",
    evidence: [
      {
        url: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=900&q=80",
        caption: "Ảnh màn hình lỗi thanh toán QR",
      },
    ],
  },
  {
    id: "RP-20251117-0003",
    type: "auth",
    title: "Không nhận được OTP khi đăng nhập",
    summary: "OTP gửi qua SMS chậm hơn 5 phút, người dùng không thể đăng nhập.",
    user: { id: "USR-9012", name: "Phạm Thảo Nhi", email: "nhi.pham@example.com" },
    createdAt: "2025-11-17T10:42:00",
    priority: "high",
    status: "in_progress",
    content:
      "Network Viettel ổn định nhưng OTP gửi từ hệ thống quá trễ. User cần truy cập dashboard để cập nhật lịch tưới.",
    evidence: [
      {
        url: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
        caption: "Log OTP chậm hơn 5 phút",
      },
    ],
  },
  {
    id: "RP-20251116-0004",
    type: "system",
    title: "API dự báo thời tiết trả về lỗi 500",
    summary: "Module đồng bộ thời tiết thất bại với tất cả garden miền Trung.",
    user: { id: "USR-8998", name: "Trần Văn Hải", email: "hai.tran@example.com" },
    createdAt: "2025-11-15T22:10:00",
    priority: "medium",
    status: "in_progress",
    content:
      "Chúng tôi ghi nhận error 500 từ dịch vụ weather external khiến lịch chăm sóc không tự điều chỉnh.",
    evidence: [
      {
        url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
        caption: "Stacktrace API thời tiết 500",
      },
    ],
  },
  {
    id: "RP-20251115-0011",
    type: "payment",
    title: "Không thể in hóa đơn GTGT",
    summary: "Trang tải vô hạn khi người dùng tải file PDF hóa đơn.",
    user: { id: "USR-8770", name: "Hồ Quốc Thịnh", email: "thinh.ho@example.com" },
    createdAt: "2025-11-14T13:30:00",
    priority: "high",
    status: "resolved",
    content:
      "Lỗi xuất phát từ thay đổi template pdfjs. Đã triển khai sửa nhưng cần phản hồi người dùng.",
  },
  {
    id: "RP-20251114-0005",
    type: "system",
    title: "Dashboard cây bị trắng sau khi cập nhật trình duyệt",
    summary: "Một số người dùng Chrome 130 báo trắng màn hình.",
    user: { id: "USR-8321", name: "Đoàn Nhật Minh", email: "minh.doan@example.com" },
    createdAt: "2025-11-14T06:15:00",
    priority: "medium",
    status: "new",
    content:
      "Console có error về WebGL context. Nhờ team kiểm tra compatibility trên Chrome mới.",
  },
  {
    id: "RP-20251113-0007",
    type: "auth",
    title: "Không gửi được email verify",
    summary: "Email domain @greenfarm.vn không nhận được verify mail.",
    user: { id: "USR-8204", name: "Lý Thị Ánh", email: "anh.ly@greenfarm.vn" },
    createdAt: "2025-11-13T18:55:00",
    priority: "high",
    status: "resolved",
    content:
      "SMTP SendGrid trả về mã 550. Cần cập nhật SPF/DKIM checklist cho khách hàng doanh nghiệp.",
  },
  {
    id: "RP-20251113-0015",
    type: "other",
    title: "Đề xuất thêm dashboard sâu bệnh",
    summary: "Người dùng mong muốn module cảnh báo sâu bệnh theo vùng.",
    user: { id: "USR-7923", name: "Vũ Thị Mỹ", email: "my.vu@example.com" },
    createdAt: "2025-11-12T11:20:00",
    priority: "low",
    status: "new",
    content:
      "Tính năng giúp nông dân chủ động phun phòng và tối ưu chi phí chăm sóc.",
  },
  {
    id: "RP-20251112-0009",
    type: "payment",
    title: "Gia hạn tự động bị thất bại",
    summary: "Thẻ credit hợp lệ nhưng bị từ chối.",
    user: { id: "USR-7801", name: "Nguyễn Hải Đăng", email: "dang.nguyen@example.com" },
    createdAt: "2025-11-12T02:45:00",
    priority: "high",
    status: "new",
    content:
      "Stripe trả về mã 2000 suspected_fraud. Khách hàng yêu cầu hỗ trợ ngay vì gói sắp hết hạn.",
  },
  {
    id: "RP-20251110-0010",
    type: "system",
    title: "Không xem được lịch tưới trên mobile",
    summary: "App mobile crash khi mở tab CareFlow.",
    user: { id: "USR-7450", name: "Đặng Hữu Phúc", email: "phuc.dang@example.com" },
    createdAt: "2025-11-09T09:12:00",
    priority: "medium",
    status: "rejected",
    content:
      "Không tái hiện được trên staging, cần thêm log nếu khách hàng cung cấp.",
  },
  {
    id: "RP-20251108-0004",
    type: "other",
    title: "Gợi ý UI: hiển thị lịch sử chăm sóc dạng timeline",
    summary: "Nâng cao trải nghiệm xem lịch sử cho từng cây.",
    user: { id: "USR-7011", name: "Trần Ngọc Hà", email: "ha.tran@example.com" },
    createdAt: "2025-11-07T15:20:00",
    priority: "low",
    status: "in_progress",
    content:
      "Đề nghị cho phép xuất dữ liệu timeline ra PDF để chia sẻ nội bộ.",
  },
];

const defaultFilters = {
  time: TIME_SEGMENTS[0].value,
  priority: "all",
  type: "all",
  status: "all",
  search: "",
};

const priorityOrder = { high: 0, medium: 1, low: 2 };
const closedStatuses = ["resolved", "rejected"];

function isOverdue(report) {
  const elapsedHours = (Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60);
  return elapsedHours > SLA_HOURS && !closedStatuses.includes(normalizeStatus(report.status));
}

function getRemainingHours(report) {
  const elapsedHours = (Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60);
  return SLA_HOURS - elapsedHours;
}

function normalizeStatus(value) {
  return value === "new" ? "in_progress" : value;
}

function getStatusLabel(value) {
  if (!value) return "";
  const normalized = normalizeStatus(value);
  return STATUS_LABELS[normalized] ?? value;
}

function getStatusBadgeClass(value) {
  const normalized = normalizeStatus(value);
  return STATUS_META[normalized]?.className ?? STATUS_BADGE_FALLBACK;
}

function getSlaBadgeMeta(report) {
  const overdue = isOverdue(report);
  const normalizedStatus = normalizeStatus(report.status);
  const remaining = getRemainingHours(report);

  if (overdue) {
    return { label: "Báo cáo bị xử lý muộn.", className: "bg-rose-600 text-white" };
  }

  if (closedStatuses.includes(normalizedStatus)) {
    return {
      label:
        normalizedStatus === "resolved"
          ? "Đã xử lý báo cáo muộn."
          : "Đã từ chối - đóng cam kết xử lý (SLA)",
      className: "bg-slate-100 text-slate-600",
    };
  }

  if (remaining <= 4) {
    return {
      label: `Còn ${Math.max(1, Math.ceil(remaining))}h trước hạn cam kết (SLA)`,
      className: "bg-amber-100 text-amber-700",
    };
  }

  return {
    label: `Còn ${Math.ceil(remaining)}h trong cam kết (SLA)`,
    className: "bg-emerald-100 text-emerald-700",
  };
}

function escapeCsvValue(value) {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

function exportReportsToCSV(reports) {
  if (!reports || reports.length === 0) return;
  const headers = [
    "report_id",
    "user_id",
    "user_name",
    "type",
    "priority",
    "status",
    "created_at",
    "sla_summary",
  ];

  const rows = reports.map((report) => {
    const slaMeta = getSlaBadgeMeta(report);
    return [
      escapeCsvValue(report.id),
      escapeCsvValue(report.user.id),
      escapeCsvValue(report.user.name),
      escapeCsvValue(TYPE_META[report.type]?.label ?? report.type),
      escapeCsvValue(PRIORITY_META[report.priority]?.label ?? report.priority),
      escapeCsvValue(getStatusLabel(report.status)),
      escapeCsvValue(new Date(report.createdAt).toLocaleString("vi-VN", { hour12: false })),
      escapeCsvValue(slaMeta.label),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `reports-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ReportManagement() {
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const filteredReports = useMemo(() => {
    const timeWindow = TIME_SEGMENTS.find((item) => item.value === filters.time);
    const limitHours = timeWindow?.durationHours ?? Infinity;
    const now = Date.now();

    return MOCK_REPORTS.filter((report) => {
      const createdAt = new Date(report.createdAt).getTime();
      const diffHours = (now - createdAt) / (1000 * 60 * 60);
      const matchesTime = diffHours >= 0 && diffHours <= limitHours;
      const matchesPriority =
        filters.priority === "all" ? true : report.priority === filters.priority;
      const matchesType = filters.type === "all" ? true : report.type === filters.type;
      const matchesStatus =
        filters.status === "all"
          ? true
          : filters.status === "in_progress"
          ? ["in_progress", "new"].includes(report.status)
          : report.status === filters.status;
      const term = filters.search.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        report.id.toLowerCase().includes(term) ||
        report.title.toLowerCase().includes(term) ||
        report.user.name.toLowerCase().includes(term) ||
        report.user.email.toLowerCase().includes(term);

      return matchesTime && matchesPriority && matchesType && matchesStatus && matchesSearch;
    });
  }, [filters]);

  const sortedReports = useMemo(() => {
    const now = Date.now();
    const getOverdueDuration = (report) => {
      const elapsedHours = (now - new Date(report.createdAt).getTime()) / (1000 * 60 * 60);
      return Math.max(0, elapsedHours - SLA_HOURS);
    };

    return [...filteredReports].sort((a, b) => {
      const overdueA = isOverdue(a);
      const overdueB = isOverdue(b);

      if (overdueA !== overdueB) {
        return overdueB ? 1 : -1; // overdue items appear first
      }

      if (overdueA && overdueB) {
        const overdueDiff = getOverdueDuration(b) - getOverdueDuration(a);
        if (overdueDiff !== 0) return overdueDiff;
      }

      const createdDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (createdDiff !== 0) return createdDiff;

      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return 0;
    });
  }, [filteredReports]);

  const stats = useMemo(() => {
    const overdue = filteredReports.filter((report) => isOverdue(report));
    const resolved = filteredReports.filter((report) => report.status === "resolved");
    const rejected = filteredReports.filter((report) => report.status === "rejected");

    return {
      total: filteredReports.length,
      overdue: overdue.length,
      resolved: resolved.length,
      rejected: rejected.length,
      highOverdue: overdue.filter((report) => report.priority === "high").length,
    };
  }, [filteredReports]);

  const timelineData = useMemo(() => {
    if (filteredReports.length === 0) return [];
    const buckets = filteredReports.reduce((acc, report) => {
      const label =
        filters.time === "24h"
          ? new Date(report.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : new Date(report.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            });
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(buckets)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => (a.label > b.label ? 1 : -1));
  }, [filteredReports, filters.time]);

  const typeDistribution = useMemo(() => {
    const map = REPORT_TYPES.reduce((acc, type) => {
      acc[type.value] = 0;
      return acc;
    }, {});

    filteredReports.forEach((report) => {
      map[report.type] += 1;
    });

    return Object.entries(map).map(([key, value]) => ({
      key,
      label: TYPE_META[key]?.label || key,
      value,
    }));
  }, [filteredReports]);

  const priorityDistribution = useMemo(() => {
    const map = { high: 0, medium: 0, low: 0 };
    filteredReports.forEach((report) => {
      map[report.priority] += 1;
    });
    const total = Math.max(1, filteredReports.length);
    return Object.entries(map).map(([key, value]) => ({
      key,
      label: PRIORITY_META[key].label,
      percent: Math.round((value / total) * 100),
    }));
  }, [filteredReports]);

  const openDialog = (report) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  const handleStatusIntent = (value) => {
    setPendingStatus(value);
    setStatusConfirmOpen(true);
  };

  const confirmStatusChoice = () => {
    setStatusUpdate(pendingStatus);
    setStatusConfirmOpen(false);
  };

  const cancelStatusChoice = () => {
    setPendingStatus("");
    setStatusConfirmOpen(false);
  };

  const handleExportReports = () => {
    exportReportsToCSV(sortedReports);
  };

  useEffect(() => {
    if (!selectedReport) return;
    setAdminNotes(selectedReport.internalNote || "");
    setEmailContent(
      `Xin chào ${selectedReport.user.name},\n\nChúng tôi đã tiếp nhận báo cáo ${selectedReport.id} và đang xử lý. Khi có cập nhật mới, chúng tôi sẽ phản hồi ngay.\n\nTrân trọng,\nĐội Hỗ trợ Mầm Mới`
    );
    setStatusUpdate("");
    setPendingStatus("");
  }, [selectedReport]);

  const handleConfirm = () => {
    setConfirmOpen(false);
    setDialogOpen(false);
    setSelectedReport(null);
  };

  const emptyState =
    filteredReports.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
        <ShieldQuestion className="mb-4 h-10 w-10 text-slate-300" />
        <p className="text-base font-semibold text-slate-600">Không có báo cáo nào khớp bộ lọc</p>
        <p className="text-sm">Thử thay đổi bộ lọc ưu tiên hoặc khoảng thời gian.</p>
      </div>
    ) : null;

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
              System admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Quản lý báo cáo 
            </h1>
            <p className="text-emerald-100/80">
              Giám sát báo cáo bảo mật, thanh toán và hoạt động hệ thống toàn bộ hệ sinh thái Mầm Mới.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Đồng bộ
            </Button>
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-white">
              <MailCheck className="mr-2 h-4 w-4" />
              Gửi báo cáo ngày
            </Button>
          </div>
        </div>

        {stats.highOverdue > 0 && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-700 shadow-lg shadow-rose-200/50">
            <div className="flex flex-wrap items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-semibold">
                Bạn đang có {stats.highOverdue} báo cáo ưu tiên cao quá 24h chưa xử lý!
              </p>
              <Button
                variant="outline"
                className="border-rose-200 bg-white/70 text-rose-700 hover:bg-white"
                onClick={() => {
                  const target = sortedReports.find((report) => isOverdue(report));
                  if (target) openDialog(target);
                }}
              >
                Xử lý ngay
              </Button>
            </div>
          </div>
        )}

        <Card className="border-none bg-white rounded-2xl shadow-lg">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-2xl text-slate-900">Bộ lọc thông minh</CardTitle>
                <p className="text-sm text-slate-500">
                  Bộ lọc mặc định: hiển thị toàn bộ báo cáo.
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                onClick={resetFilters}
              >
                <Filter className="h-4 w-4" /> Đặt lại bộ lọc
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <Tabs value={filters.time} onValueChange={(value) => handleFilterChange("time", value)}>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 rounded-2xl bg-slate-100 p-1">
                  {TIME_SEGMENTS.map((segment) => (
                    <TabsTrigger
                      key={segment.value}
                      value={segment.value}
                      className="rounded-xl text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow"
                    >
                      {segment.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Select value={filters.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 text-slate-800">
                    <SelectValue placeholder="Chọn ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 text-slate-800">
                    <SelectValue placeholder="Loại báo cáo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại báo cáo</SelectItem>
                    {REPORT_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 text-slate-800">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Tìm theo tiêu đề, mã báo cáo hoặc người gửi..."
                  className="rounded-xl border-slate-200 bg-slate-50 pl-10 text-slate-800"
                  value={filters.search}
                  onChange={(event) => handleFilterChange("search", event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-none bg-white rounded-2xl shadow-lg">
              <CardContent className="flex items-center justify-between gap-4 py-6">
                <div>
                  <p className="text-sm font-semibold text-rose-600">Báo cáo xử lý muộn</p>
                  <p className="text-3xl font-semibold text-rose-700">{stats.overdue}</p>
                </div>
                <div className="rounded-full bg-rose-50 p-4 text-rose-500">
                  <Clock className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-white rounded-2xl shadow-lg">
              <CardContent className="flex items-center justify-between gap-4 py-6">
                <div>
                  <p className="text-sm text-slate-500">Báo cáo bị từ chối</p>
                  <p className="text-3xl font-semibold text-amber-600">{stats.rejected}</p>
                  <p className="text-xs text-slate-400">Kiểm tra nguyên nhân và phản hồi khách hàng</p>
                </div>
                <div className="rounded-full bg-amber-50 p-4 text-amber-500">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">Tổng quan báo cáo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    key: "total",
                    label: "Tổng số báo cáo",
                    value: stats.total,
                    change: 0.08,
                  },
                  {
                    key: "rejected",
                    label: "Báo cáo bị từ chối",
                    value: stats.rejected,
                    change: stats.rejected > 0 ? 0.06 : -0.01,
                  },
                  {
                    key: "overdue",
                    label: "Báo cáo xử lý muộn",
                    value: stats.overdue,
                    change: stats.overdue > 0 ? 0.12 : -0.02,
                  },
                  {
                    key: "resolved",
                    label: "Đã xử lý",
                    value: stats.resolved,
                    change: 0.18,
                  },
                ].map((item) => {
                  const isPositive = item.change >= 0;
                  const isOverdueCard = item.key === "overdue";
                  return (
                    <div
                      key={item.key}
                      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-emerald-100"
                    >
                      <p
                        className={cn(
                          "text-sm",
                          isOverdueCard ? "text-rose-600" : "text-slate-500"
                        )}
                      >
                        {item.label}
                      </p>
                      <p
                        className={cn(
                          "mt-2 text-3xl font-semibold",
                          isOverdueCard ? "text-rose-700" : "text-slate-900"
                        )}
                      >
                        {item.value}
                      </p>
                      <Badge
                        className={cn(
                          "mt-3 border-0 px-2.5 py-0.5 text-sm",
                          isOverdueCard
                            ? "bg-rose-100 text-rose-700"
                            : isPositive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        )}
                      >
                        {isPositive ? "+" : ""}
                        {Math.round(item.change * 100)}% so với kỳ trước
                      </Badge>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[2fr_1.2fr] gap-4">
                <Card className="rounded-2xl border border-slate-100 bg-emerald-50/50 shadow-inner">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-slate-800">Báo cáo theo thời gian</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    {timelineData.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        Chưa có dữ liệu trong bộ lọc.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsAreaChart data={timelineData} margin={{ left: 0, right: 0 }}>
                          <defs>
                            <linearGradient id="reportArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              borderColor: "#a7f3d0",
                              backgroundColor: "#fff",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#047857"
                            strokeWidth={2}
                            fill="url(#reportArea)"
                          />
                        </RechartsAreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-slate-100 bg-white shadow-inner">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-slate-800">Phân bổ theo loại</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 lg:flex-row">
                    <div className="h-64 w-full lg:w-1/2">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={typeDistribution}
                            dataKey="value"
                            nameKey="label"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={typeDistribution.length > 1 ? 4 : 0}
                          >
                            {typeDistribution.map((entry) => (
                              <Cell key={entry.key} fill={TYPE_META[entry.key]?.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => `${value} báo cáo`}
                            contentStyle={{
                              borderRadius: "12px",
                              borderColor: "#bbf7d0",
                              backgroundColor: "#fff",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                      {typeDistribution.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: TYPE_META[item.key]?.color }}
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                              <p className="text-xs text-slate-500">{item.value} báo cáo</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-emerald-700">
                            {filteredReports.length
                              ? Math.round((item.value / filteredReports.length) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      ))}
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                          Ưu tiên tổng thể
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {priorityDistribution.map((item) => (
                            <div
                              key={item.key}
                              className="flex items-center gap-2 rounded-lg bg-white px-2 py-1 text-sm font-semibold shadow-sm"
                            >
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              {item.label}: {item.percent}%
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white rounded-2xl shadow-lg">
            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-2xl text-slate-900">Danh sách báo cáo</CardTitle>
                <p className="text-sm text-slate-500">{filteredReports.length} báo cáo khớp bộ lọc</p>
              </div>
              <Button
                className="gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={handleExportReports}
                disabled={sortedReports.length === 0}
              >
                <FileDown className="h-4 w-4" />
                Xuất CSV
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Tìm tiêu đề / nội dung / người gửi"
                    className="rounded-xl border-slate-200 bg-slate-50 pl-10 text-slate-800"
                    value={filters.search}
                    onChange={(event) => handleFilterChange("search", event.target.value)}
                  />
                </div>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                  <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-slate-50 text-slate-800">
                    <SelectValue placeholder="Loại báo cáo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {REPORT_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-slate-50 text-slate-800">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={resetFilters}
                >
                  Đặt lại
                </Button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <Table>
                  <TableHeader className="bg-emerald-50/80">
                  <TableRow className="text-xs uppercase tracking-wider text-slate-500">
                    <TableHead>Mã báo cáo</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Loại</TableHead>
                    <TableHead>Ưu tiên</TableHead>
                      <TableHead>Thời gian gửi</TableHead>
                      <TableHead>Trạng thái & cam kết xử lý (SLA)</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedReports.map((report) => {
                      const overdue = isOverdue(report);
                      const slaMeta = getSlaBadgeMeta(report);
                      return (
                        <TableRow
                          key={report.id}
                          className={cn(
                            "text-sm",
                            overdue ? "bg-rose-50/70" : "bg-white",
                            "border-b border-slate-100"
                          )}
                        >
                          <TableCell className="font-semibold text-slate-900">{report.id}</TableCell>
                          <TableCell>
                            <p className="font-medium text-slate-800">{report.user.name}</p>
                            <p className="text-xs font-mono text-slate-500">{report.user.id}</p>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700">
                            {TYPE_META[report.type]?.label}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("border-0", PRIORITY_META[report.priority]?.className)}>
                              {PRIORITY_META[report.priority]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {new Date(report.createdAt).toLocaleString("vi-VN", { hour12: false })}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge className={cn("border-0", getStatusBadgeClass(report.status))}>
                                {getStatusLabel(report.status)}
                              </Badge>
                              <Badge className={cn("border-0", slaMeta.className)}>{slaMeta.label}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              className="text-emerald-700 hover:bg-emerald-50"
                              onClick={() => openDialog(report)}
                            >
                              Xử lý
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {emptyState}
              </div>
            </CardContent>
          </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
        <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-900">Xử lý báo cáo</DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái, ghi log nội bộ và chuẩn bị nội dung phản hồi cho người gửi.
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6 py-2">
              <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Mã báo cáo</p>
                  <p className="text-sm font-mono text-slate-900">{selectedReport.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Người gửi</p>
                  <p className="text-sm text-slate-900">{selectedReport.user.name}</p>
                  <p className="text-xs font-mono text-slate-500">{selectedReport.user.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Loại báo cáo</p>
                  <p className="text-sm text-slate-900">{TYPE_META[selectedReport.type]?.label}</p>
                </div>
                <div className="space-x-2">
                  <Badge className={cn("border-0", PRIORITY_META[selectedReport.priority]?.className)}>
                    Ưu tiên {PRIORITY_META[selectedReport.priority]?.label}
                  </Badge>
                  {isOverdue(selectedReport) ? (
                    <Badge className="border-0 bg-rose-600 text-white">Quá hạn</Badge>
                  ) : (
                    <Badge className="border-0 bg-emerald-100 text-emerald-700">
                      Còn {Math.max(1, Math.ceil(getRemainingHours(selectedReport)))}h trong cam kết (SLA)
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Nội dung báo cáo</p>
                <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  {selectedReport.content}
                </p>
              </div>

              {selectedReport.evidence?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Ảnh chứng minh</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {selectedReport.evidence.map((item, index) => (
                      <div
                        key={`${item.url}-${index}`}
                        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                      >
                        <img
                          src={item.url}
                          alt={item.caption}
                          className="h-40 w-full object-cover"
                          loading="lazy"
                        />
                        <div className="flex items-center justify-between px-3 py-2">
                          <p className="text-sm font-medium text-slate-700">{item.caption}</p>
                          <Button variant="ghost" asChild className="text-emerald-600 hover:bg-emerald-50">
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              Xem
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">Log nội bộ</p>
                  <Textarea
                    rows={5}
                    value={adminNotes}
                    onChange={(event) => setAdminNotes(event.target.value)}
                    placeholder="Admin đã xử lý như thế nào..."
                    className="rounded-2xl border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">Nội dung phản hồi người dùng</p>
                  <Textarea
                    rows={5}
                    value={emailContent}
                    onChange={(event) => setEmailContent(event.target.value)}
                    placeholder="Nội dung email sẽ gửi cho người dùng..."
                    className="rounded-2xl border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Cập nhật trạng thái</p>
                <Select
                  value={statusUpdate || undefined}
                  onValueChange={handleStatusIntent}
                >
                  <SelectTrigger
                    className={cn(
                      "rounded-2xl",
                      statusUpdate ? "border-slate-200" : "border-rose-200"
                    )}
                  >
                    <SelectValue placeholder="Chọn trạng thái xử lý" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FLOW_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              STATUS_META[option.value]?.className?.includes("rose")
                                ? "bg-rose-500"
                                : STATUS_META[option.value]?.className?.includes("sky")
                                ? "bg-sky-500"
                                : STATUS_META[option.value]?.className?.includes("amber")
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            )}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!statusUpdate && (
                  <p className="text-xs font-medium text-rose-600">Vui lòng chọn trạng thái cần xử lý.</p>
                )}
              </div>

              <Button
                className="w-full rounded-2xl bg-emerald-600 py-6 text-lg font-semibold hover:bg-emerald-700"
                disabled={!statusUpdate}
                onClick={() => statusUpdate && setConfirmOpen(true)}
              >
                Xác nhận xử lý
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={statusConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            cancelStatusChoice();
          } else {
            setStatusConfirmOpen(true);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận trạng thái mới</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp chọn trạng thái <strong>{getStatusLabel(pendingStatus)}</strong> cho báo cáo{" "}
              {selectedReport?.id}. Việc này sẽ ảnh hưởng tới bảng cam kết xử lý (SLA).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Trạng thái mới</p>
            <Badge className={cn("mt-2 border-0", getStatusBadgeClass(pendingStatus))}>
              {getStatusLabel(pendingStatus)}
            </Badge>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelStatusChoice}>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChoice}>Xác nhận trạng thái</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => setConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận gửi cập nhật?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp cập nhật báo cáo {selectedReport?.id} với trạng thái{" "}
              <strong>{getStatusLabel(statusUpdate)}</strong> và gửi email cho{" "}
              {selectedReport?.user?.email}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Báo cáo</p>
                <p className="mt-1 font-mono text-slate-900">{selectedReport?.id}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Ưu tiên</p>
                <Badge
                  className={cn("mt-1 border-0", PRIORITY_META[selectedReport?.priority]?.className)}
                >
                  {PRIORITY_META[selectedReport?.priority]?.label}
                </Badge>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Loại báo cáo</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedReport && TYPE_META[selectedReport.type]?.label}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Người nhận email</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedReport?.user?.name}
                </p>
                <p className="text-xs text-slate-500">{selectedReport?.user?.email}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Trạng thái xử lý</p>
              <Badge className={cn("mt-2 border-0", getStatusBadgeClass(statusUpdate))}>
                {getStatusLabel(statusUpdate)}
              </Badge>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Nội dung email</p>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                {emailContent || "Chưa nhập nội dung phản hồi."}
              </pre>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Xác nhận & gửi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
          </>
        </AdminLayout>
      </div>
    </>
  );
}

