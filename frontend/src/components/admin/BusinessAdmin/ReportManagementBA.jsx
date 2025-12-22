import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileDown,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldQuestion,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Bar,
  BarChart,
  Tooltip as RechartsTooltip,
} from "recharts";

import { LivingBackground } from "@/components/background";
import AdminLayout from "../layout/AdminLayout";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import AdminReportRepository from "@/API/repositories/AdminReportRepository";
import ActionToast from "@/components/admin/components/ActionToast";
import { API_BASE } from "@/API/ApiClient";

const BACKGROUND_PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const TIME_SEGMENTS = [
  { value: "all", label: "Tất cả" },
  { value: "day", label: "Ngày", durationHours: 24 },
  { value: "week", label: "Tuần", durationHours: 24 * 7 },
  { value: "month", label: "Tháng", durationHours: 24 * 30 },
  { value: "year", label: "Năm", durationHours: 24 * 365 },
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "Ưu tiên cao" },
  { value: "medium", label: "Ưu tiên trung bình" },
  { value: "low", label: "Ưu tiên thấp" },
  { value: "all", label: "Tất cả ưu tiên" },
];

const BA_REPORT_TYPES = [
  { value: "tree", label: "Báo cáo cây" },
  { value: "other", label: "Báo cáo khác" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "in_progress", label: "Đang xử lý" },
  { value: "resolved", label: "Đã xử lý" },
  { value: "rejected", label: "Bị từ chối" },
];

const STATUS_FLOW_OPTIONS = STATUS_OPTIONS.filter(
  (option) => option.value !== "all" && option.value !== "in_progress"
);

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
  high: {
    label: "Cao",
    className: "bg-rose-100 text-rose-700",
    accent: "text-rose-600",
  },
  medium: {
    label: "Trung bình",
    className: "bg-amber-100 text-amber-700",
    accent: "text-amber-600",
  },
  low: {
    label: "Thấp",
    className: "bg-emerald-100 text-emerald-700",
    accent: "text-emerald-600",
  },
};

const TYPE_META = {
  tree: { label: "Báo cáo cây", color: "#047857" },
  other: { label: "Báo cáo khác", color: "#a3e635" },
};

const SLA_HOURS = 24;

// Tạo dữ liệu mẫu reports
const generateMockReports = () => {
  const now = new Date();
  const users = [
    {
      id: "USR-000001",
      name: "Nguyễn Minh Hoàng",
      email: "hoang.nm@example.com",
    },
    { id: "USR-000002", name: "Trần Thị Mai", email: "mai.tran@orchard.vn" },
    {
      id: "USR-000003",
      name: "Phạm Anh Tuấn",
      email: "tuan.pham@greengrow.vn",
    },
    { id: "USR-000004", name: "Võ Thảo Nhi", email: "nhi.vo@example.com" },
    { id: "USR-000005", name: "Lê Quang Khải", email: "khai.le@citrus.io" },
    { id: "USR-000006", name: "Đỗ Thanh Vân", email: "van.do@example.com" },
    { id: "USR-000007", name: "Huỳnh Tấn Tài", email: "tai.huynh@fruitful.vn" },
    { id: "USR-000008", name: "Đinh Yến Nhi", email: "yen.nhi@example.com" },
    {
      id: "USR-000009",
      name: "Trương Quý Long",
      email: "long.truong@agrimax.vn",
    },
    {
      id: "USR-000010",
      name: "Hồ Khánh Linh",
      email: "linh.khanh@example.com",
    },
    { id: "USR-000011", name: "Tô Thành Phát", email: "phat.to@fruitflow.vn" },
    {
      id: "USR-000012",
      name: "Phan Ngọc Trang",
      email: "trang.phan@citrus.vn",
    },
  ];

  const reportTemplates = [
    {
      type: "tree",
      title: "Cây xoài bị vàng lá dù đã tưới đủ",
      summary: "Vườn thương mại báo nhiều cây xoài xuống sức trong tuần qua.",
      priority: "high",
      status: "in_progress",
    },
    {
      type: "tree",
      title: "Tỷ lệ trái rụng cao bất thường",
      summary: "Vùng ĐBSCL ghi nhận rụng trái vượt 15% so với trung bình.",
      priority: "medium",
      status: "in_progress",
    },
    {
      type: "other",
      title: "Đề xuất bổ sung báo cáo doanh thu mùa vụ",
      summary: "Doanh nghiệp muốn theo dõi hiệu quả xuất khẩu từng thị trường.",
      priority: "low",
      status: "in_progress",
    },
    {
      type: "other",
      title: "Không truy cập được dashboard nhận đặt hàng",
      summary: "Một số tài khoản doanh nghiệp bị treo khi duyệt đơn hàng mới.",
      priority: "high",
      status: "resolved",
    },
  ];

  const reports = [];
  reportTemplates.forEach((template, index) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    reports.push({
      id: `RP-${date.toISOString().split("T")[0].replace(/-/g, "")}-${String(
        index + 1
      ).padStart(4, "0")}`,
      type: template.type,
      title: template.title,
      summary: template.summary,
      user: { id: user.id, name: user.name, email: user.email },
      createdAt: date.toISOString(),
      priority: template.priority,
      status: template.status,
      content: `${template.summary} Chi tiết: Người dùng ${user.name} (${user.id}) gặp vấn đề này.`,
      evidence: [],
    });
  });

  // Sắp xếp reports theo thời gian
  reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return reports;
};

const MOCK_REPORTS = generateMockReports();

const MOCK_REPORTS_LEGACY = [
  {
    id: "RP-20251118-0001",
    type: "tree",
    title: "Bệnh thán thư lan nhanh tại Trang trại Hòa Lạc",
    summary: "40% diện tích xoài bị đốm nâu chỉ trong ba ngày.",
    user: {
      id: "USR-9081",
      name: "Nguyễn Bảo Khánh",
      email: "khanh.nguyen@example.com",
    },
    createdAt: "2025-11-17T08:05:00",
    priority: "high",
    status: "new",
    content:
      "Quản lý nông trại báo các vết đốm nâu lan rộng, lá rụng hàng loạt. Cần chuyên gia khẩn cấp và đề xuất phác đồ xử lý.",
    evidence: [
      {
        url: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=900&q=80",
        caption: "Ảnh vết bệnh trên lá xoài",
      },
    ],
  },
  {
    id: "RP-20251117-0003",
    type: "tree",
    title: "Thiếu tưới nhỏ giọt khu greenhouse Đà Lạt",
    summary: "Đầu tưới hỏng khiến cây dâu tây héo.",
    user: {
      id: "USR-9012",
      name: "Phạm Thảo Nhi",
      email: "nhi.pham@example.com",
    },
    createdAt: "2025-11-17T10:42:00",
    priority: "high",
    status: "in_progress",
    content:
      "Bộ điều khiển không kích hoạt 2 zone trong 48h. Yêu cầu kiểm tra cảm biến lưu lượng và bổ sung cảnh báo.",
    evidence: [
      {
        url: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
        caption: "Log lưu lượng tưới bằng 0",
      },
    ],
  },
  {
    id: "RP-20251116-0004",
    type: "tree",
    title: "Thiếu vi lượng trên lô bưởi Đồng Nai",
    summary: "Lá non xoăn và xuất hiện đốm vàng.",
    user: {
      id: "USR-8998",
      name: "Trần Văn Hải",
      email: "hai.tran@example.com",
    },
    createdAt: "2025-11-15T22:10:00",
    priority: "medium",
    status: "in_progress",
    content:
      "So sánh dữ liệu đất cho thấy Mg và Zn giảm 30%. Đề nghị gửi kế hoạch bổ sung phân bón lá.",
    evidence: [
      {
        url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
        caption: "Kết quả phân tích đất tuần 46",
      },
    ],
  },
  {
    id: "RP-20251115-0011",
    type: "other",
    title: "Không xuất được báo cáo doanh thu theo đối tác",
    summary: "Trang tải vô hạn khi chọn nhiều thị trường cùng lúc.",
    user: {
      id: "USR-8770",
      name: "Hồ Quốc Thịnh",
      email: "thinh.ho@example.com",
    },
    createdAt: "2025-11-14T13:30:00",
    priority: "high",
    status: "resolved",
    content:
      "Lỗi xuất phát từ thay đổi bộ lọc pipeline. Đã triển khai sửa và cần phản hồi khách hàng.",
    internalNote:
      "Đã optimize query aggregation. Deploy bản sửa vào production, theo dõi thêm 24h.",
    emailContent:
      "Xin chào Hồ Quốc Thịnh,\n\nChúng tôi đã xử lý xong báo cáo RP-20251115-0011. Bạn có thể xuất báo cáo doanh thu theo đối tác bình thường.\n\nTrân trọng,\nĐội Hỗ trợ Mầm Mới",
  },
  {
    id: "RP-20251114-0005",
    type: "other",
    title: "Dashboard chiến dịch thương mại bị trắng màn hình",
    summary: "Một số người dùng Chrome 130 báo lỗi.",
    user: {
      id: "USR-8321",
      name: "Đoàn Nhật Minh",
      email: "minh.doan@example.com",
    },
    createdAt: "2025-11-14T06:15:00",
    priority: "medium",
    status: "new",
    content:
      "Console có error WebGL khi hiển thị bản đồ tiêu thụ. Cần kiểm tra compatibility trên Chrome mới.",
  },
  {
    id: "RP-20251113-0007",
    type: "other",
    title: "Không gửi được email xác nhận đơn hàng B2B",
    summary: "Domain @greenfarm.vn không nhận được thông báo.",
    user: { id: "USR-8204", name: "Lý Thị Ánh", email: "anh.ly@greenfarm.vn" },
    createdAt: "2025-11-13T18:55:00",
    priority: "high",
    status: "resolved",
    content:
      "SMTP trả về mã 550. Cần cập nhật SPF/DKIM checklist cho khách hàng doanh nghiệp.",
    internalNote: "Đã hướng dẫn cập nhật SPF/DKIM. Kiểm tra lại đã gửi được.",
    emailContent:
      "Xin chào Lý Thị Ánh,\n\nChúng tôi đã xử lý xong báo cáo RP-20251113-0007. Email xác nhận đơn hàng đã hoạt động bình thường.\n\nTrân trọng,\nĐội Hỗ trợ Mầm Mới",
  },
  {
    id: "RP-20251113-0015",
    type: "tree",
    title: "Đề xuất thêm dashboard sâu bệnh theo vùng",
    summary: "Doanh nghiệp muốn chủ động cảnh báo.",
    user: { id: "USR-7923", name: "Vũ Thị Mỹ", email: "my.vu@example.com" },
    createdAt: "2025-11-12T11:20:00",
    priority: "low",
    status: "new",
    content:
      "Tính năng giúp nông dân chủ động phun phòng và tối ưu chi phí chăm sóc.",
  },
  {
    id: "RP-20251112-0009",
    type: "other",
    title: "Gia hạn hợp đồng cung ứng tự động thất bại",
    summary: "Thẻ credit hợp lệ nhưng bị từ chối.",
    user: {
      id: "USR-7801",
      name: "Nguyễn Hải Đăng",
      email: "dang.nguyen@example.com",
    },
    createdAt: "2025-11-12T02:45:00",
    priority: "high",
    status: "new",
    content:
      "Stripe trả về mã 2000 suspected_fraud. Khách hàng yêu cầu hỗ trợ ngay vì hợp đồng sắp hết hạn.",
  },
  {
    id: "RP-20251110-0010",
    type: "tree",
    title: "Không xem được lịch tưới trên mobile",
    summary: "App crash khi mở tab CareFlow.",
    user: {
      id: "USR-7450",
      name: "Đặng Hữu Phúc",
      email: "phuc.dang@example.com",
    },
    createdAt: "2025-11-09T09:12:00",
    priority: "medium",
    status: "rejected",
    content:
      "Không tái hiện được trên staging, cần thêm log nếu khách hàng cung cấp.",
    internalNote:
      "Đã test trên staging không lỗi. Đợi thêm log video từ khách hàng.",
    emailContent:
      "Xin chào Đặng Hữu Phúc,\n\nChúng tôi đã kiểm tra báo cáo RP-20251110-0010 nhưng chưa tái hiện được lỗi. Vui lòng cung cấp thêm log hoặc video.\n\nTrân trọng,\nĐội Hỗ trợ Mầm Mới",
  },
  {
    id: "RP-20251108-0004",
    type: "other",
    title: "Gợi ý xuất dữ liệu timeline chăm sóc",
    summary: "Cần tải PDF để chia sẻ nội bộ.",
    user: {
      id: "USR-7011",
      name: "Trần Ngọc Hà",
      email: "ha.tran@example.com",
    },
    createdAt: "2025-11-07T15:20:00",
    priority: "low",
    status: "in_progress",
    content:
      "Đề nghị cho phép export timeline ra PDF với watermark thương hiệu.",
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
  const elapsedHours =
    (Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60);
  return (
    elapsedHours > SLA_HOURS &&
    !closedStatuses.includes(normalizeStatus(report.status))
  );
}

function wasOverdue(report) {
  const elapsedHours =
    (Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60);
  return elapsedHours > SLA_HOURS;
}

function getRemainingHours(report) {
  const elapsedHours =
    (Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60);
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

function formatDateVietnam(value, withTime = true) {
  if (value === undefined || value === null || value === "") return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const options = withTime
    ? {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
    : { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Intl.DateTimeFormat("vi-VN", options)
    .format(d)
    .replace(/,\s*/g, " ");
}

function getOverdueBadgeMeta(report) {
  const overdue = wasOverdue(report);
  if (overdue) {
    return { label: "Report xử lý muộn", className: "bg-rose-600 text-white" };
  }
  return null;
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
    "overdue_status",
  ];

  const rows = reports.map((report) => {
    const overdueMeta = getOverdueBadgeMeta(report);
    return [
      escapeCsvValue(report.id),
      escapeCsvValue(report.user.id),
      escapeCsvValue(report.user.name),
      escapeCsvValue(TYPE_META[report.type]?.label ?? report.type),
      escapeCsvValue(PRIORITY_META[report.priority]?.label ?? report.priority),
      escapeCsvValue(getStatusLabel(report.status)),
      escapeCsvValue(formatDateVietnam(report.createdAt)),
      escapeCsvValue(overdueMeta ? overdueMeta.label : ""),
    ].join(",");
  });

  // Add UTF-8 BOM (Byte Order Mark) to ensure proper encoding for Vietnamese characters
  // Excel and other programs need this to correctly read UTF-8 CSV files
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
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

/**
 * Parse AttachmentUrls string from backend into evidence array format
 * Backend returns comma-separated URLs as a string, we need to convert to array of objects
 */
function parseAttachmentUrls(attachmentUrls) {
  if (!attachmentUrls || typeof attachmentUrls !== 'string') return [];

  const urls = attachmentUrls.split(',').map(url => url.trim()).filter(url => url);

  return urls.map((url, index) => ({
    url: url,
    caption: `Ảnh chứng minh ${index + 1}`
  }));
}


function ReportTimelineChart({ data, timeframeLabel }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const value = payload[0].value;
    return (
      <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs shadow-md">
        <p className="font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-emerald-600">+{value} báo cáo</p>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-emerald-50 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 p-5 text-emerald-50 shadow-lg">
        <p className="text-sm text-emerald-100/80">
          Chưa có dữ liệu trong bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-emerald-50 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 p-5 text-emerald-50 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Báo cáo theo thời gian
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Xu hướng báo cáo theo {timeframeLabel.toLowerCase()}
          </h3>
          <p className="mt-1 text-xs text-emerald-100/80">
            Quan sát số lượng báo cáo theo thời gian để tối ưu quy trình xử lý.
          </p>
        </div>
      </div>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart
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
                id="reportTimelineGradient"
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
              allowDecimals={false}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#bbf7d0"
              strokeWidth={2.4}
              fill="url(#reportTimelineGradient)"
              dot={{
                r: 3,
                strokeWidth: 1.5,
                stroke: "#dcfce7",
                fill: "#22c55e",
              }}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#22c55e" }}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-950/40 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <span className="font-medium text-emerald-100">Báo cáo mới</span>
        </div>
      </div>
    </div>
  );
}

const COMPARISON_PERIODS = [
  { value: "week", label: "Tuần này so với tuần trước" },
  { value: "month", label: "Tháng này so với tháng trước" },
  { value: "year", label: "Năm này so với năm trước" },
];

function ReportTypeDistributionChart({
  data,
  timeFilter = "day",
  allReports = [],
}) {
  const chartData = data.map((item) => ({
    ...item,
    label: item.label ?? TYPE_META[item.key]?.label ?? item.key,
    color: TYPE_META[item.key]?.color ?? "#22c55e",
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const peakValue = chartData.reduce(
    (max, item) => Math.max(max, item.value),
    0
  );

  // Map timeFilter sang comparison period
  const getComparisonPeriod = () => {
    if (timeFilter === "day") return "day";
    if (timeFilter === "week") return "week";
    if (timeFilter === "month") return "month";
    if (timeFilter === "year") return "year";
    return "week";
  };

  const comparisonPeriod = getComparisonPeriod();

  // Map comparison period sang label hiển thị
  const getPeriodLabel = () => {
    if (comparisonPeriod === "day") return "ngày";
    if (comparisonPeriod === "week") return "tuần";
    if (comparisonPeriod === "month") return "tháng";
    if (comparisonPeriod === "year") return "năm";
    return "kỳ";
  };

  const periodLabel = getPeriodLabel();

  // Tính toán comparison data từ dữ liệu thực tế
  const getComparisonData = () => {
    const now = new Date();
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;

    if (comparisonPeriod === "day") {
      currentPeriodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    } else if (comparisonPeriod === "week") {
      currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    } else if (comparisonPeriod === "month") {
      currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    } else {
      currentPeriodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
      previousPeriodEnd = currentPeriodStart;
    }

    const previousCounts = {
      total: 0,
      auth: 0,
      payment: 0,
      system: 0,
      other: 0,
    };

    allReports.forEach((report) => {
      const reportDate = new Date(report.createdAt);
      if (reportDate >= previousPeriodStart && reportDate < previousPeriodEnd) {
        previousCounts.total += 1;
        previousCounts[report.type] = (previousCounts[report.type] || 0) + 1;
      }
    });

    return previousCounts;
  };

  const previousData = getComparisonData();
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? current * 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const totalChange = calculateChange(total, previousData.total);

  // Tính change cho từng loại báo cáo
  const chartDataWithChange = chartData.map((item) => {
    const previousValue = previousData[item.key] || 0;
    const change = calculateChange(item.value, previousValue);
    return { ...item, change };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    return (
      <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs shadow-md">
        <p className="font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-emerald-600">
          {item.value.toLocaleString("vi-VN")} báo cáo
        </p>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-emerald-50 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Phân bổ theo loại
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            Số lượng báo cáo theo loại
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 shadow-sm">
              <span className="text-slate-500">Tổng số báo cáo:</span>
              <span className="font-semibold text-slate-900">
                {total.toLocaleString("vi-VN")}
              </span>
              {totalChange > -100 && Math.abs(totalChange) > 0.5 && (
                <Badge
                  className={cn(
                    "ml-1 border-0 px-1.5 py-0 text-[10px]",
                    totalChange >= 0
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  )}
                >
                  {totalChange >= 0 ? "+" : ""}
                  {Math.round(totalChange)}%
                </Badge>
              )}
            </div>
          </div>
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
                textAnchor="middle"
                height={60}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                width={50}
                domain={[
                  0,
                  (dataMax) => {
                    if (dataMax === 0) return 1;
                    // Tính padding 20% và làm tròn lên đến số tròn phù hợp
                    const padded = dataMax * 1.2;
                    if (padded < 10) return Math.ceil(padded);
                    if (padded < 100) return Math.ceil(padded / 5) * 5;
                    if (padded < 1000) return Math.ceil(padded / 50) * 50;
                    if (padded < 10000) return Math.ceil(padded / 500) * 500;
                    return Math.ceil(padded / 1000) * 1000;
                  },
                ]}
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
                    {item.value.toLocaleString("vi-VN")}
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

export default function ReportManagementBA() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDetailOpen, setViewDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");
  const [hasSubmitAttempt, setHasSubmitAttempt] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [actionToast, setActionToast] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });
  const actionToastTimer = useRef(null);

  // Hàm cập nhật report
  const updateReport = async (reportId, updates) => {
    try {
      // Find the report to get requestId
      const report = reports.find((r) => r.id === reportId);
      const requestId = report?.requestId || reportId;

      const updateData = {
        status: updates.status,
        resolution: updates.internalNote || updates.resolution,
        priority: updates.priority,
        category: updates.category,
      };

      await AdminReportRepository.updateReport(requestId, updateData);

      // Refresh reports after update
      await fetchReports();
    } catch (err) {
      console.error("Error updating report:", err);
      throw err;
    }
  };

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Map filters to API parameters
      const statusFilter = filters.status === "all" ? null : filters.status;
      const priorityFilter =
        filters.priority === "all" ? null : filters.priority;
      const categoryFilter = filters.type === "all" ? null : filters.type;

      // Calculate date range based on time filter
      const now = new Date();
      let startDate = null;
      let endDate = null;

      if (filters.time === "day") {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        endDate = now;
      } else if (filters.time === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
      } else if (filters.time === "month") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
      } else if (filters.time === "year") {
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        endDate = now;
      }

      const response = await AdminReportRepository.getReports(
        page,
        100, // Large page size to get all reports for filtering
        statusFilter,
        priorityFilter,
        categoryFilter,
        null,
        startDate,
        endDate
      );

      if (response.success) {
        // Map API fields to frontend expected fields:
        // - resolution -> internalNote (log nội bộ)
        // - resolution is also used as emailContent placeholder for now
        const mappedReports = (response.data || []).map(report => ({
          ...report,
          internalNote: report.resolution || report.internalNote,
          emailContent: report.emailContent || report.resolution,
        }));
        setReports(mappedReports);
        setTotalCount(response.pagination?.totalCount || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.message || "Có lỗi xảy ra khi tải danh sách báo cáo");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.time, filters.status, filters.priority, filters.type, page]);

  // Refresh button handler
  const handleRefresh = () => {
    fetchReports();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // BusinessAdmin chỉ được xem báo cáo loại: tree (Cây) và other (Khác)
  const BA_ALLOWED_TYPES = ["tree", "other"];

  const filteredReports = useMemo(() => {
    const timeWindow = TIME_SEGMENTS.find(
      (item) => item.value === filters.time
    );
    const limitHours = timeWindow?.durationHours ?? Infinity;
    const now = Date.now();

    return reports.filter((report) => {
      // Chỉ hiển thị báo cáo loại tree và other cho BusinessAdmin
      const isAllowedType = BA_ALLOWED_TYPES.includes(report.type);
      if (!isAllowedType) return false;

      const createdAt = new Date(report.createdAt).getTime();
      const diffHours = (now - createdAt) / (1000 * 60 * 60);
      const matchesTime = diffHours >= 0 && diffHours <= limitHours;
      const matchesPriority =
        filters.priority === "all"
          ? true
          : report.priority === filters.priority;
      const matchesType =
        filters.type === "all" ? true : report.type === filters.type;
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

      return (
        matchesTime &&
        matchesPriority &&
        matchesType &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [filters, reports]);

  const sortedReports = useMemo(() => {
    const now = Date.now();
    const getOverdueDuration = (report) => {
      const elapsedHours =
        (now - new Date(report.createdAt).getTime()) / (1000 * 60 * 60);
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

      const createdDiff =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (createdDiff !== 0) return createdDiff;

      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return 0;
    });
  }, [filteredReports]);

  const stats = useMemo(() => {
    const overdue = filteredReports.filter((report) => isOverdue(report));
    const resolved = filteredReports.filter(
      (report) => report.status === "resolved"
    );
    // Báo cáo chưa xử lý = tất cả báo cáo đang xử lý (in_progress/new) + tất cả báo cáo xử lý muộn
    const rejected = filteredReports.filter((report) => {
      const normalizedStatus = normalizeStatus(report.status);
      return normalizedStatus === "in_progress" || isOverdue(report);
    });

    return {
      total: filteredReports.length,
      overdue: overdue.length,
      resolved: resolved.length,
      rejected: rejected.length,
    };
  }, [filteredReports]);

  const overdueAlert = useMemo(() => {
    const overdueReports = reports.filter((report) => isOverdue(report));
    if (overdueReports.length === 0) return null;

    const pickOldest = (reports) =>
      [...reports].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )[0];

    for (const priorityKey of Object.keys(PRIORITY_META)) {
      const reportsByPriority = overdueReports.filter(
        (report) => report.priority === priorityKey
      );
      if (reportsByPriority.length > 0) {
        return {
          type: "priority",
          priority: priorityKey,
          count: reportsByPriority.length,
          nextReport: pickOldest(reportsByPriority),
        };
      }
    }

    const nonPriorityReports = overdueReports.filter(
      (report) => !PRIORITY_META[report.priority]
    );
    if (nonPriorityReports.length > 0) {
      return {
        type: "general",
        count: nonPriorityReports.length,
        nextReport: pickOldest(nonPriorityReports),
      };
    }

    return null;
  }, [reports]);

  const timelineData = useMemo(() => {
    if (filteredReports.length === 0) return [];

    const now = new Date();
    let startDate = new Date();
    let bucketCount = 7;
    let getBucketLabel;

    if (filters.time === "day") {
      // 24h gần nhất: 24 bucket theo giờ, từ 23h trước tới hiện tại
      startDate = new Date(now.getTime() - 23 * 60 * 60 * 1000);
      startDate.setMinutes(0, 0, 0);
      bucketCount = 24;
      getBucketLabel = (date) =>
        `${String(date.getHours()).padStart(2, "0")}:00`;
    } else if (filters.time === "week") {
      // 7 ngày gần nhất: 7 bucket theo ngày
      startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      bucketCount = 7;
      getBucketLabel = (date) => {
        const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        return days[date.getDay()];
      };
    } else if (filters.time === "month") {
      // 30 ngày gần nhất: 30 bucket theo ngày
      startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      bucketCount = 30;
      getBucketLabel = (date, index) => `Ngày ${index + 1}`;
    } else {
      // 12 tháng gần nhất: gom theo tháng
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      bucketCount = 12;
      getBucketLabel = (date, index) => `T${index + 1}`;
    }

    const buckets = [];
    const isYearView = filters.time === "year";
    let bucketSize;

    if (isYearView) {
      // Mỗi bucket là 1 tháng
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
      // Ngày, tuần, tháng: chia đều theo thời gian giống RevenueGrowthChart
      bucketSize = (now.getTime() - startDate.getTime()) / bucketCount;
      for (let i = 0; i < bucketCount; i++) {
        const bucketStart = new Date(startDate.getTime() + i * bucketSize);
        const bucketEnd =
          i === bucketCount - 1
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

    const startTime = startDate.getTime();
    const endTime = now.getTime();

    filteredReports.forEach((report) => {
      const reportTime = new Date(report.createdAt).getTime();
      if (reportTime < startTime || reportTime > endTime) return;

      for (let i = 0; i < buckets.length; i++) {
        const bucket = buckets[i];
        if (i === buckets.length - 1) {
          if (reportTime >= bucket.startTime && reportTime <= bucket.endTime) {
            buckets[i].value += 1;
            break;
          }
        } else {
          if (reportTime >= bucket.startTime && reportTime < bucket.endTime) {
            buckets[i].value += 1;
            break;
          }
        }
      }
    });

    return buckets
      .sort((a, b) => a.index - b.index)
      .map((bucket) => ({
        label: bucket.label,
        value: bucket.value,
      }));
  }, [filteredReports, filters.time]);

  const typeDistribution = useMemo(() => {
    const map = BA_REPORT_TYPES.reduce((acc, type) => {
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

  const isReportClosed = (report) => {
    const normalizedStatus = normalizeStatus(report.status);
    return closedStatuses.includes(normalizedStatus);
  };

  const openDialog = async (report) => {
    // For closed reports, fetch full details from API since list API doesn't include resolution
    if (isReportClosed(report)) {
      try {
        const requestId = report.requestId || report.id;
        const fullReport = await AdminReportRepository.getReportById(requestId);
        // Map API fields to frontend expected fields
        const mappedReport = {
          ...report,
          ...fullReport,
          internalNote: fullReport.resolution || fullReport.internalNote,
          emailContent: fullReport.emailContent || fullReport.resolution,
        };
        setSelectedReport(mappedReport);
        setViewDetailOpen(true);
      } catch (err) {
        console.error("Error fetching report details:", err);
        // Fallback to using the list data
        setSelectedReport(report);
        setViewDetailOpen(true);
      }
    } else {
      setSelectedReport(report);
      setDialogOpen(true);
    }
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

  const showActionToast = (type, title, message) => {
    if (actionToastTimer.current) {
      clearTimeout(actionToastTimer.current);
    }
    setActionToast({
      open: true,
      type,
      title,
      message,
    });
    actionToastTimer.current = setTimeout(() => {
      setActionToast((prev) => ({ ...prev, open: false }));
    }, 4500);
  };

  const closeActionToast = () => {
    if (actionToastTimer.current) {
      clearTimeout(actionToastTimer.current);
    }
    setActionToast((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!selectedReport) return;
    setAdminNotes(selectedReport.internalNote || "");
    setEmailContent(selectedReport.emailContent || "");
    setStatusUpdate("");
    setPendingStatus("");
    setHasSubmitAttempt(false);
  }, [selectedReport]);

  useEffect(() => {
    if (!dialogOpen) {
      setHasSubmitAttempt(false);
    }
  }, [dialogOpen]);

  useEffect(() => {
    return () => {
      if (actionToastTimer.current) {
        clearTimeout(actionToastTimer.current);
      }
    };
  }, []);

  const isAdminNotesValid = adminNotes.trim().length > 0;
  const isEmailContentValid = emailContent.trim().length > 0;
  const isStatusValid = Boolean(statusUpdate);

  const showAdminNotesError = hasSubmitAttempt && !isAdminNotesValid;
  const showEmailContentError = hasSubmitAttempt && !isEmailContentValid;
  const showStatusError = hasSubmitAttempt && !isStatusValid;

  const handleConfirm = async () => {
    if (
      selectedReport &&
      statusUpdate &&
      isAdminNotesValid &&
      isEmailContentValid
    ) {
      try {
        // Cập nhật report status thông qua API
        const currentReportId = selectedReport?.id;
        const statusLabel = getStatusLabel(statusUpdate);
        await updateReport(selectedReport.id, {
          status: statusUpdate,
          internalNote: adminNotes.trim(),
          emailContent: emailContent.trim(),
        });

        showActionToast(
          "success",
          "Đã gửi cập nhật",
          `Báo cáo ${currentReportId} đã chuyển sang trạng thái ${statusLabel || statusUpdate
          }.`
        );
      } catch (err) {
        showActionToast(
          "error",
          "Không thể cập nhật báo cáo",
          err?.message || "Vui lòng thử lại sau."
        );
        return;
      }
    }
    setConfirmOpen(false);
    setDialogOpen(false);
    setSelectedReport(null);
    setStatusUpdate("");
    setAdminNotes("");
    setEmailContent("");
    setHasSubmitAttempt(false);
  };

  const handleConfirmClick = () => {
    setHasSubmitAttempt(true);
    if (isStatusValid && isAdminNotesValid && isEmailContentValid) {
      setConfirmOpen(true);
    }
  };

  const emptyState =
    filteredReports.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
        <ShieldQuestion className="mb-4 h-10 w-10 text-slate-300" />
        <p className="text-base font-semibold text-slate-600">
          Không có báo cáo nào khớp bộ lọc
        </p>
        <p className="text-sm">
          Thử thay đổi bộ lọc ưu tiên hoặc khoảng thời gian.
        </p>
      </div>
    ) : null;

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
          <>
            <div className="space-y-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-emerald-200">
                    <ShieldCheck className="h-4 w-4" />
                    Business Admin
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-white">
                    Quản lý báo cáo
                  </h1>
                  <p className="text-emerald-100/80">
                    Giám sát báo cáo chất lượng cây trồng và những phản hồi kinh
                    doanh liên quan tới nhà vườn.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-white/30 bg-white/10 p-1 backdrop-blur">
                    {TIME_SEGMENTS.map((segment) => {
                      const isActive = filters.time === segment.value;
                      return (
                        <button
                          key={segment.value}
                          onClick={() =>
                            handleFilterChange("time", segment.value)
                          }
                          className={cn(
                            "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                            isActive
                              ? "bg-white text-emerald-700 shadow-lg shadow-emerald-500/30"
                              : "text-white/70 hover:text-white"
                          )}
                        >
                          {segment.label}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
                    />
                    {loading ? "Đang tải..." : "Đồng bộ dữ liệu"}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-700 shadow-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {loading && reports.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <span className="ml-3 text-slate-600">
                    Đang tải dữ liệu...
                  </span>
                </div>
              ) : null}

              {overdueAlert && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-700 shadow-lg shadow-rose-200/50">
                  <div className="flex flex-wrap items-center gap-3">
                    <AlertTriangle className="h-5 w-5" />
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold">
                        {overdueAlert.type === "priority"
                          ? `Bạn đang có ${overdueAlert.count} báo cáo ưu tiên đang bị quá hạn chưa được xử lý.`
                          : `Bạn đang có ${overdueAlert.count} báo cáo đang bị quá hạn chưa được xử lý.`}
                      </p>
                      {overdueAlert.type === "priority" && (
                        <p className="text-sm">
                          Ưu tiên: Ưu tiên{" "}
                          {PRIORITY_META[
                            overdueAlert.priority
                          ]?.label?.toLowerCase()}{" "}
                          · Báo cáo lâu nhất từ{" "}
                          {formatDateVietnam(overdueAlert.nextReport.createdAt)}
                        </p>
                      )}
                      {overdueAlert.type === "general" && (
                        <p className="text-sm">
                          Báo cáo lâu nhất từ{" "}
                          {formatDateVietnam(overdueAlert.nextReport.createdAt)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="border-rose-200 bg-white/70 text-rose-700 hover:bg-white"
                      onClick={() => {
                        if (overdueAlert.nextReport)
                          openDialog(overdueAlert.nextReport);
                      }}
                    >
                      Xử lý ngay
                    </Button>
                  </div>
                </div>
              )}

              <Card className="border-none bg-white/95 text-slate-900 rounded-2xl shadow-2xl shadow-emerald-900/10">
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-2xl text-slate-900">
                      Tổng quan báo cáo
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                      Dữ liệu{" "}
                      {TIME_SEGMENTS.find(
                        (t) => t.value === filters.time
                      )?.label?.toLowerCase() ?? "kỳ"}{" "}
                      hiện tại{" "}
                      <span className="font-semibold text-emerald-600">
                        so với kỳ trước
                      </span>
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
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        key: "total",
                        label: "Tổng số báo cáo",
                        value: stats.total,
                      },
                      {
                        key: "rejected",
                        label: "Báo cáo chưa xử lý",
                        value: stats.rejected,
                      },
                      {
                        key: "overdue",
                        label: "Báo cáo xử lý muộn",
                        value: stats.overdue,
                      },
                      {
                        key: "resolved",
                        label: "Đã xử lý",
                        value: stats.resolved,
                      },
                    ].map((item) => {
                      const isOverdueCard = item.key === "overdue";
                      return (
                        <div
                          key={item.key}
                          className={cn(
                            "rounded-2xl border border-emerald-50 bg-white px-6 py-5 shadow-sm",
                            isOverdueCard && "border-rose-100 bg-rose-50/70"
                          )}
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
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-transparent text-slate-900 shadow-none">
                <CardContent className="grid gap-6 p-0 lg:grid-cols-3 lg:min-h-[360px]">
                  <div className="lg:col-span-2 h-full">
                    <ReportTimelineChart
                      data={timelineData}
                      timeframeLabel={
                        TIME_SEGMENTS.find((t) => t.value === filters.time)
                          ?.label ?? "Kỳ"
                      }
                    />
                  </div>
                  <div className="lg:col-span-1 h-full">
                    <ReportTypeDistributionChart
                      data={typeDistribution}
                      timeFilter={filters.time}
                      allReports={reports}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none bg-white/95 text-slate-900 rounded-2xl shadow-2xl shadow-emerald-900/10">
                <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-2xl text-slate-900">
                      Danh sách báo cáo
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                      {filteredReports.length} báo cáo khớp bộ lọc
                    </p>
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
                        onChange={(event) =>
                          handleFilterChange("search", event.target.value)
                        }
                      />
                    </div>
                    <SearchableSelect
                      value={filters.priority}
                      onChange={(value) =>
                        handleFilterChange("priority", value)
                      }
                      options={PRIORITY_OPTIONS}
                      placeholder="Ưu tiên"
                    />
                    <SearchableSelect
                      value={filters.type}
                      onChange={(value) => handleFilterChange("type", value)}
                      options={[
                        { value: "all", label: "Tất cả loại" },
                        ...BA_REPORT_TYPES,
                      ]}
                      placeholder="Loại báo cáo"
                    />
                    <SearchableSelect
                      value={filters.status}
                      onChange={(value) => handleFilterChange("status", value)}
                      options={STATUS_OPTIONS}
                      placeholder="Trạng thái"
                    />
                    <Button
                      variant="outline"
                      className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={resetFilters}
                    >
                      Đặt lại
                    </Button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                    <Table>
                      <TableHeader className="sticky top-0 bg-emerald-50/80 backdrop-blur">
                        <TableRow className="border-none text-xs uppercase tracking-wider text-slate-500">
                          <TableHead>Mã báo cáo</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Loại</TableHead>
                          <TableHead>Ưu tiên</TableHead>
                          <TableHead>Thời gian gửi</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">
                            Hành động
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedReports.map((report) => {
                          const overdue = isOverdue(report);
                          const overdueMeta = getOverdueBadgeMeta(report);
                          return (
                            <TableRow
                              key={report.id}
                              className={cn(
                                "text-sm border-b border-slate-100 transition",
                                overdue
                                  ? "bg-rose-50/70 hover:bg-rose-100/80"
                                  : "bg-white/60 hover:bg-emerald-50/40"
                              )}
                            >
                              <TableCell className="font-semibold text-slate-900">
                                {report.id}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium text-slate-800">
                                  {report.user.name}
                                </p>
                                <p className="text-xs font-mono text-slate-500">
                                  {report.user.id}
                                </p>
                              </TableCell>
                              <TableCell className="font-semibold text-slate-700">
                                {TYPE_META[report.type]?.label}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "border-0",
                                    PRIORITY_META[report.priority]?.className
                                  )}
                                >
                                  {PRIORITY_META[report.priority]?.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-500">
                                {formatDateVietnam(report.createdAt)}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge
                                    className={cn(
                                      "border-0",
                                      getStatusBadgeClass(report.status)
                                    )}
                                  >
                                    {getStatusLabel(report.status)}
                                  </Badge>
                                  {overdueMeta && (
                                    <Badge
                                      className={cn(
                                        "border-0",
                                        overdueMeta.className
                                      )}
                                    >
                                      {overdueMeta.label}
                                    </Badge>
                                  )}
                                  {isReportClosed(report) &&
                                    report.internalNote && (
                                      <div className="rounded-lg bg-slate-50 px-2 py-1.5 text-xs text-slate-600">
                                        <span className="font-semibold text-slate-700">
                                          Log nội bộ:{" "}
                                        </span>
                                        <span className="line-clamp-1">
                                          {report.internalNote.length > 100
                                            ? `${report.internalNote.substring(
                                              0,
                                              100
                                            )}...`
                                            : report.internalNote}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    isReportClosed(report)
                                      ? "text-slate-700 hover:bg-slate-50"
                                      : "text-emerald-700 hover:bg-emerald-50"
                                  )}
                                  onClick={() => openDialog(report)}
                                >
                                  {isReportClosed(report)
                                    ? "Xem chi tiết"
                                    : "Xử lý"}
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

            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => setDialogOpen(open)}
            >
              <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-slate-900">
                    Xử lý báo cáo
                  </DialogTitle>
                  <DialogDescription>
                    Cập nhật trạng thái, ghi log nội bộ và chuẩn bị nội dung
                    phản hồi cho người gửi.
                  </DialogDescription>
                </DialogHeader>
                {selectedReport && (
                  <div className="space-y-6 py-2">
                    <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Mã báo cáo
                        </p>
                        <p className="text-sm font-mono text-slate-900">
                          {selectedReport.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Người gửi
                        </p>
                        <p className="text-sm text-slate-900">
                          {selectedReport.user.name}
                        </p>
                        <p className="text-xs font-mono text-slate-500">
                          {selectedReport.user.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Loại báo cáo
                        </p>
                        <p className="text-sm text-slate-900">
                          {TYPE_META[selectedReport.type]?.label}
                        </p>
                      </div>
                      <div className="space-x-2">
                        <Badge
                          className={cn(
                            "border-0",
                            PRIORITY_META[selectedReport.priority]?.className
                          )}
                        >
                          Ưu tiên{" "}
                          {PRIORITY_META[selectedReport.priority]?.label}
                        </Badge>
                        {wasOverdue(selectedReport) && (
                          <Badge className="border-0 bg-rose-600 text-white">
                            Report xử lý muộn
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Nội dung báo cáo
                      </p>
                      <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                        {selectedReport.content}
                      </p>
                    </div>

                    {(() => {
                      // Support both 'evidence' array (mock data) and 'attachmentUrls' string (API data)
                      const evidenceList = selectedReport.evidence?.length > 0
                        ? selectedReport.evidence
                        : parseAttachmentUrls(selectedReport.attachmentUrls);

                      if (evidenceList.length === 0) return null;

                      return (
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-400">
                            Ảnh chứng minh
                          </p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {evidenceList.map((item, index) => (
                              <div
                                key={`${item.url}-${index}`}
                                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                              >
                                <img
                                  src={item.url?.startsWith('http') ? item.url : `${API_BASE}${item.url}`}
                                  alt={item.caption}
                                  className="h-40 w-full object-cover"
                                  loading="lazy"
                                />
                                <div className="flex items-center justify-between px-3 py-2">
                                  <p className="text-sm font-medium text-slate-700">
                                    {item.caption}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    asChild
                                    className="text-emerald-600 hover:bg-emerald-50"
                                  >
                                    <a
                                      href={item.url?.startsWith('http') ? item.url : `${API_BASE}${item.url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Xem
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700">
                          Log nội bộ
                        </p>
                        <Textarea
                          rows={5}
                          value={adminNotes}
                          onChange={(event) =>
                            setAdminNotes(event.target.value)
                          }
                          placeholder="Admin đã xử lý như thế nào..."
                          required
                          aria-invalid={showAdminNotesError}
                          className={cn(
                            "rounded-2xl border bg-white",
                            showAdminNotesError
                              ? "border-rose-300"
                              : "border-slate-200"
                          )}
                        />
                        {showAdminNotesError && (
                          <p className="text-xs font-medium text-rose-600">
                            Vui lòng ghi log nội bộ trước khi xác nhận.
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700">
                          Nội dung phản hồi người dùng
                        </p>
                        <Textarea
                          rows={5}
                          value={emailContent}
                          onChange={(event) =>
                            setEmailContent(event.target.value)
                          }
                          placeholder="Nội dung email sẽ gửi cho người dùng..."
                          required
                          aria-invalid={showEmailContentError}
                          className={cn(
                            "rounded-2xl border bg-white",
                            showEmailContentError
                              ? "border-rose-300"
                              : "border-slate-200"
                          )}
                        />
                        {showEmailContentError && (
                          <p className="text-xs font-medium text-rose-600">
                            Vui lòng soạn nội dung phản hồi cho người dùng.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">
                        Cập nhật trạng thái
                      </p>
                      <Select
                        value={statusUpdate || undefined}
                        onValueChange={handleStatusIntent}
                      >
                        <SelectTrigger
                          className={cn(
                            "rounded-2xl",
                            showStatusError
                              ? "border-rose-300"
                              : "border-slate-200"
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
                                    STATUS_META[
                                      option.value
                                    ]?.className?.includes("rose")
                                      ? "bg-rose-500"
                                      : STATUS_META[
                                        option.value
                                      ]?.className?.includes("sky")
                                        ? "bg-sky-500"
                                        : STATUS_META[
                                          option.value
                                        ]?.className?.includes("amber")
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
                      {showStatusError && (
                        <p className="text-xs font-medium text-rose-600">
                          Vui lòng chọn trạng thái cần xử lý.
                        </p>
                      )}
                    </div>

                    <Button
                      className="w-full rounded-2xl bg-emerald-600 py-6 text-lg font-semibold hover:bg-emerald-700"
                      disabled={!selectedReport}
                      onClick={handleConfirmClick}
                    >
                      Xác nhận xử lý
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Dialog
              open={viewDetailOpen}
              onOpenChange={(open) => setViewDetailOpen(open)}
            >
              <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-slate-900">
                    Chi tiết báo cáo
                  </DialogTitle>
                  <DialogDescription>
                    Thông tin chi tiết về báo cáo đã được xử lý. Không thể chỉnh
                    sửa.
                  </DialogDescription>
                </DialogHeader>
                {selectedReport && (
                  <div className="space-y-6 py-2">
                    <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Mã báo cáo
                        </p>
                        <p className="text-sm font-mono text-slate-900">
                          {selectedReport.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Người gửi
                        </p>
                        <p className="text-sm text-slate-900">
                          {selectedReport.user.name}
                        </p>
                        <p className="text-xs font-mono text-slate-500">
                          {selectedReport.user.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Loại báo cáo
                        </p>
                        <p className="text-sm text-slate-900">
                          {TYPE_META[selectedReport.type]?.label}
                        </p>
                      </div>
                      <div className="space-x-2">
                        <Badge
                          className={cn(
                            "border-0",
                            PRIORITY_META[selectedReport.priority]?.className
                          )}
                        >
                          Ưu tiên{" "}
                          {PRIORITY_META[selectedReport.priority]?.label}
                        </Badge>
                        <Badge
                          className={cn(
                            "border-0",
                            getStatusBadgeClass(selectedReport.status)
                          )}
                        >
                          {getStatusLabel(selectedReport.status)}
                        </Badge>
                        {wasOverdue(selectedReport) && (
                          <Badge className="border-0 bg-rose-600 text-white">
                            Report xử lý muộn
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Nội dung báo cáo
                      </p>
                      <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                        {selectedReport.content}
                      </p>
                    </div>

                    {selectedReport.evidence?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-400">
                          Ảnh chứng minh
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {selectedReport.evidence.map((item, index) => (
                            <div
                              key={`${item.url}-${index}`}
                              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                            >
                              <img
                                src={item.url?.startsWith('http') ? item.url : `${API_BASE}${item.url}`}
                                alt={item.caption}
                                className="h-40 w-full object-cover"
                                loading="lazy"
                              />
                              <div className="flex items-center justify-between px-3 py-2">
                                <p className="text-sm font-medium text-slate-700">
                                  {item.caption}
                                </p>
                                <Button
                                  variant="ghost"
                                  asChild
                                  className="text-emerald-600 hover:bg-emerald-50"
                                >
                                  <a
                                    href={item.url?.startsWith('http') ? item.url : `${API_BASE}${item.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
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
                        <p className="text-sm font-semibold text-slate-700">
                          Log nội bộ
                        </p>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 min-h-[120px]">
                          {selectedReport.internalNote ||
                            "Không có log nội bộ."}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700">
                          Nội dung phản hồi người dùng
                        </p>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 min-h-[120px] whitespace-pre-wrap">
                          {selectedReport.emailContent ||
                            "Không có nội dung phản hồi."}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        className="rounded-2xl border-slate-200 px-6"
                        onClick={() => setViewDetailOpen(false)}
                      >
                        Đóng
                      </Button>
                    </div>
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
                    Bạn sắp chọn trạng thái{" "}
                    <strong>{getStatusLabel(pendingStatus)}</strong> cho báo cáo{" "}
                    {selectedReport?.id}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Trạng thái mới
                  </p>
                  <Badge
                    className={cn(
                      "mt-2 border-0",
                      getStatusBadgeClass(pendingStatus)
                    )}
                  >
                    {getStatusLabel(pendingStatus)}
                  </Badge>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={cancelStatusChoice}>
                    Huỷ
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={confirmStatusChoice}>
                    Xác nhận trạng thái
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={confirmOpen}
              onOpenChange={(open) => setConfirmOpen(open)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận gửi cập nhật?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn sắp cập nhật báo cáo {selectedReport?.id} với trạng thái{" "}
                    <strong>{getStatusLabel(statusUpdate)}</strong> và gửi email
                    cho {selectedReport?.user?.email}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 text-sm text-slate-600">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Báo cáo
                      </p>
                      <p className="mt-1 font-mono text-slate-900">
                        {selectedReport?.id}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Ưu tiên
                      </p>
                      <Badge
                        className={cn(
                          "mt-1 border-0",
                          PRIORITY_META[selectedReport?.priority]?.className
                        )}
                      >
                        {PRIORITY_META[selectedReport?.priority]?.label}
                      </Badge>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Loại báo cáo
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {selectedReport &&
                          TYPE_META[selectedReport.type]?.label}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Người nhận email
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {selectedReport?.user?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedReport?.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Trạng thái xử lý
                    </p>
                    <Badge
                      className={cn(
                        "mt-2 border-0",
                        getStatusBadgeClass(statusUpdate)
                      )}
                    >
                      {getStatusLabel(statusUpdate)}
                    </Badge>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Nội dung email
                    </p>
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                      {emailContent || "Chưa nhập nội dung phản hồi."}
                    </pre>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirm}>
                    Xác nhận & gửi
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        </AdminLayout>
      </div>
      <ActionToast
        open={actionToast.open}
        type={actionToast.type}
        title={actionToast.title}
        message={actionToast.message}
        onClose={closeActionToast}
      />
    </>
  );
}
