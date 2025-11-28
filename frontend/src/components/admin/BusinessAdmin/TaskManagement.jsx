import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  ClipboardList,
  Filter,
  Leaf,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  ShieldCheck,
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
  Dialog,
  DialogContent,
  DialogDescription,
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
import CareScheduleRepository from "@/API/repositories/CareScheduleRepository";
import GardenRepository from "@/API/repositories/GardenRepository";

const BACKGROUND_PALETTE = {
  bg: "#142421",
  leaf: "#C8E6C9",
  ivory: "#F4FFE3",
  accent: "#BBF7D0",
};

const PAGE_SIZE = 12;

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Chờ thực hiện" },
  { value: "InProgress", label: "Đang thực hiện" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Postponed", label: "Hoãn lại" },
  { value: "Cancelled", label: "Đã hủy" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "Tất cả ưu tiên" },
  { value: "Low", label: "Thấp" },
  { value: "Medium", label: "Trung bình" },
  { value: "High", label: "Cao" },
  { value: "Critical", label: "Khẩn cấp" },
];

const TASK_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại công việc" },
  { value: "Watering", label: "Tưới nước" },
  { value: "Fertilizing", label: "Bón phân" },
  { value: "Pruning", label: "Tỉa cành" },
  { value: "Pest Control", label: "Phòng trừ sâu bệnh" },
  { value: "Disease Treatment", label: "Điều trị bệnh" },
  { value: "Harvesting", label: "Thu hoạch" },
  { value: "Mulching", label: "Phủ gốc" },
  { value: "Inspection", label: "Khảo sát" },
];

const STATUS_META = {
  pending: {
    label: "Chờ thực hiện",
    className: "border-amber-100 bg-amber-50 text-amber-700",
  },
  inprogress: {
    label: "Đang thực hiện",
    className: "border-sky-100 bg-sky-50 text-sky-700",
  },
  completed: {
    label: "Hoàn thành",
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  postponed: {
    label: "Hoãn lại",
    className: "border-orange-100 bg-orange-50 text-orange-700",
  },
  cancelled: {
    label: "Đã hủy",
    className: "border-slate-100 bg-slate-50 text-slate-600",
  },
  default: {
    label: "Không xác định",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

const PRIORITY_META = {
  low: { label: "Thấp", className: "bg-emerald-50 text-emerald-700" },
  medium: { label: "Trung bình", className: "bg-amber-50 text-amber-700" },
  high: { label: "Cao", className: "bg-orange-50 text-orange-700" },
  critical: { label: "Khẩn cấp", className: "bg-rose-50 text-rose-700" },
  default: { label: "Không rõ", className: "bg-slate-100 text-slate-600" },
};

const TASK_TYPE_META = {
  watering: { label: "Tưới nước", className: "bg-sky-50 text-sky-700" },
  fertilizing: { label: "Bón phân", className: "bg-amber-50 text-amber-700" },
  pruning: { label: "Tỉa cành", className: "bg-lime-50 text-lime-700" },
  pestcontrol: {
    label: "Phòng trừ sâu bệnh",
    className: "bg-red-50 text-red-700",
  },
  diseasetreatment: {
    label: "Điều trị bệnh",
    className: "bg-rose-50 text-rose-700",
  },
  harvesting: {
    label: "Thu hoạch",
    className: "bg-emerald-50 text-emerald-700",
  },
  mulching: { label: "Phủ gốc", className: "bg-yellow-50 text-yellow-700" },
  inspection: { label: "Khảo sát", className: "bg-indigo-50 text-indigo-700" },
  default: { label: "Khác", className: "bg-slate-100 text-slate-700" },
};

const normalizeKey = (value) =>
  (value || "").toString().replace(/\s+/g, "").toLowerCase();

const normalizeGardenRecord = (garden) => {
  if (!garden) return null;
  const gardenId =
    garden.gardenId ??
    garden.GardenId ??
    garden.id ??
    garden.Id ??
    garden.gardenID ??
    garden.GardenID;
  return {
    gardenId,
    name: garden.name ?? garden.Name ?? garden.title ?? `Garden #${gardenId}`,
    location: garden.location ?? garden.Location ?? "",
    status: garden.status ?? garden.Status ?? "Đang hoạt động",
    coverUrl: garden.coverUrl ?? garden.CoverUrl ?? "",
  };
};

const normalizeTaskRecord = (task) => {
  if (!task) return null;
  const scheduleId =
    task.scheduleId ??
    task.ScheduleId ??
    task.id ??
    task.Id ??
    task.scheduleID ??
    task.ScheduleID;
  return {
    scheduleId,
    taskName: task.taskName ?? task.TaskName ?? "Chưa đặt tên",
    description: task.description ?? task.Description ?? "",
    taskType: task.taskType ?? task.TaskType ?? "",
    treeId: task.treeId ?? task.TreeId ?? null,
    treeCode: task.treeCode ?? task.TreeCode ?? "",
    treeName: task.treeName ?? task.TreeName ?? "",
    gardenId: task.gardenId ?? task.GardenId ?? null,
    gardenName: task.gardenName ?? task.GardenName ?? "",
    scheduledDate: task.scheduledDate ?? task.ScheduledDate ?? null,
    scheduledTimeOfDay:
      task.scheduledTimeOfDay ?? task.ScheduledTimeOfDay ?? null,
    priority: task.priority ?? task.Priority ?? "",
    status: task.status ?? task.Status ?? "Pending",
    createdAt: task.createdAt ?? task.CreatedAt ?? null,
  };
};

const extractArray = (...candidates) => {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

const parseGardenResponse = (response) => {
  const root = response?.data ?? response;
  if (!root) return [];
  const gardens = extractArray(
    root.gardens,
    root.Gardens,
    root.data?.gardens,
    root.data?.Gardens,
    root.data?.data,
    root.items,
    root.Items,
    Array.isArray(root) ? root : undefined
  );
  return gardens.map(normalizeGardenRecord).filter(Boolean);
};

const parsePagedResult = (response) => {
  const root = response?.data ?? response;
  const payload = root?.data ?? root;
  const items = extractArray(
    payload?.items,
    payload?.Items,
    payload?.results,
    payload?.Results,
    payload?.data,
    payload?.Data,
    Array.isArray(payload) ? payload : undefined,
    Array.isArray(root) ? root : undefined
  );
  const total =
    payload?.total ??
    payload?.Total ??
    payload?.totalCount ??
    payload?.TotalCount ??
    items.length;
  const page =
    payload?.page ??
    payload?.Page ??
    payload?.pageNumber ??
    payload?.PageNumber ??
    1;
  const pageSize =
    payload?.pageSize ??
    payload?.PageSize ??
    payload?.limit ??
    payload?.Limit ??
    PAGE_SIZE;

  return {
    items,
    total,
    page,
    pageSize,
  };
};

export default function BusinessAdminTaskManagement() {
  const [gardens, setGardens] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    gardenId: "all",
    status: "all",
    priority: "all",
    taskType: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [statusUpdating, setStatusUpdating] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const activeGarden =
    filters.gardenId === "all"
      ? null
      : gardens.find(
          (garden) => garden?.gardenId?.toString() === filters.gardenId
        );

  const fetchGardens = useCallback(async () => {
    try {
      const response = await GardenRepository.getGardens(1, 100);
      const parsedGardens = parseGardenResponse(response);
      setGardens(parsedGardens);
    } catch (err) {
      console.error("Failed to load gardens:", err);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await CareScheduleRepository.searchTasks({
        gardenId:
          filters.gardenId !== "all" ? Number(filters.gardenId) : undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        priority: filters.priority !== "all" ? filters.priority : undefined,
        taskType: filters.taskType !== "all" ? filters.taskType : undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        searchKeyword: filters.search || undefined,
        pageNumber: page,
        pageSize: PAGE_SIZE,
      });

      const { items: rawItems, total } = parsePagedResult(response);
      const normalizedTasks = rawItems
        .map((task) => normalizeTaskRecord(task))
        .filter(Boolean);
      setTasks(normalizedTasks);
      setTotalCount(total);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(err.message || "Không thể tải danh sách công việc.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchGardens();
  }, [fetchGardens]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = setTimeout(() => setActionNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [actionNotice]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      gardenId: "all",
      status: "all",
      priority: "all",
      taskType: "all",
      dateFrom: "",
      dateTo: "",
    });
    setPage(1);
  };

  const statusStats = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        const key = normalizeKey(task.status);
        if (acc[key] !== undefined) {
          acc[key] += 1;
        }
        acc.total += 1;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        inprogress: 0,
        completed: 0,
        postponed: 0,
        cancelled: 0,
      }
    );
  }, [tasks]);

  const showTaskDetail = (task) => {
    setSelectedTask(task);
    setDetailDialogOpen(true);
  };

  const closeTaskDetail = () => {
    setDetailDialogOpen(false);
    setSelectedTask(null);
  };

  const handleStatusUpdate = async (task, nextStatus) => {
    if (!task || !nextStatus || task.status === nextStatus) return;
    setStatusUpdating((prev) => ({ ...prev, [task.scheduleId]: true }));

    try {
      await CareScheduleRepository.editCareTask(task.scheduleId, {
        status: nextStatus,
      });
      setTasks((prev) =>
        prev.map((item) =>
          item.scheduleId === task.scheduleId
            ? { ...item, status: nextStatus }
            : item
        )
      );
      if (selectedTask?.scheduleId === task.scheduleId) {
        setSelectedTask((prev) =>
          prev ? { ...prev, status: nextStatus } : prev
        );
      }
      setActionNotice({
        tone: "success",
        message: "Đã cập nhật trạng thái công việc.",
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      setActionNotice({
        tone: "error",
        message:
          err.message || "Không thể cập nhật trạng thái. Vui lòng thử lại.",
      });
    } finally {
      setStatusUpdating((prev) => {
        const { [task.scheduleId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const getStatusMeta = (status) => {
    const key = normalizeKey(status);
    return STATUS_META[key] || STATUS_META.default;
  };

  const getPriorityMeta = (priority) => {
    const key = normalizeKey(priority);
    return PRIORITY_META[key] || PRIORITY_META.default;
  };

  const getTaskTypeMeta = (type) => {
    const key = normalizeKey(type);
    return TASK_TYPE_META[key] || TASK_TYPE_META.default;
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (task) => {
    const dateLabel = formatDate(task.scheduledDate);
    if (!task.scheduledTimeOfDay) return dateLabel;
    return `${dateLabel} · ${task.scheduledTimeOfDay}`;
  };

  const renderStatusSelect = (task) => (
    <Select
      value={task.status || "Pending"}
      onValueChange={(value) => handleStatusUpdate(task, value)}
      disabled={Boolean(statusUpdating[task.scheduleId])}
    >
      <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.filter((option) => option.value !== "all").map(
          (option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  );

  return (
    <>
      <LivingBackground
        baseColor={BACKGROUND_PALETTE.bg}
        palette={[
          BACKGROUND_PALETTE.leaf,
          BACKGROUND_PALETTE.ivory,
          BACKGROUND_PALETTE.accent,
        ]}
        density={26}
      />
      <div className="relative z-10 min-h-screen">
        <AdminLayout>
          <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  Quản trị kinh doanh
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  Quản lý công việc vườn
                </h1>
                <p className="text-emerald-100/80">
                  Theo dõi công việc của toàn bộ cây trong vườn, phân bổ nguồn
                  lực và cập nhật trạng thái trực tiếp.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  onClick={fetchTasks}
                  disabled={loading}
                >
                  <RefreshCcw
                    className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
                  />
                  {loading ? "Đang tải..." : "Làm mới"}
                </Button>
              </div>
            </div>

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

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 shadow-sm">
                {error}
              </div>
            )}

            <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Filter className="h-5 w-5 text-emerald-600" />
                  Bộ lọc công việc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <div className="relative">
                      <Input
                        placeholder="Tìm theo tên công việc, cây trồng..."
                        value={filters.search}
                        onChange={(e) =>
                          handleFilterChange("search", e.target.value)
                        }
                        className="rounded-xl border-slate-200 bg-white pl-10 text-slate-900"
                      />
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div className="lg:col-span-4">
                    <Select
                      value={filters.gardenId}
                      onValueChange={(value) =>
                        handleFilterChange("gardenId", value)
                      }
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900">
                        <SelectValue placeholder="Chọn vườn" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả vườn</SelectItem>
                        {gardens.map((garden) => (
                          <SelectItem
                            key={garden.gardenId}
                            value={garden.gardenId?.toString()}
                          >
                            {garden.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="lg:col-span-4">
                    <Select
                      value={filters.taskType}
                      onValueChange={(value) =>
                        handleFilterChange("taskType", value)
                      }
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900">
                        <SelectValue placeholder="Chọn loại công việc" />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-3">
                    <Select
                      value={filters.status}
                      onValueChange={(value) =>
                        handleFilterChange("status", value)
                      }
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900">
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
                  </div>
                  <div className="lg:col-span-3">
                    <Select
                      value={filters.priority}
                      onValueChange={(value) =>
                        handleFilterChange("priority", value)
                      }
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900">
                        <SelectValue placeholder="Mức ưu tiên" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="lg:col-span-3">
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        handleFilterChange("dateFrom", e.target.value)
                      }
                      className="rounded-xl border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <Input
                      type="date"
                      value={filters.dateTo}
                      min={filters.dateFrom || undefined}
                      onChange={(e) =>
                        handleFilterChange("dateTo", e.target.value)
                      }
                      className="rounded-xl border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Button
                    variant="ghost"
                    className="text-slate-500"
                    onClick={handleResetFilters}
                  >
                    Đặt lại bộ lọc
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="border-none bg-white/95 shadow-xl shadow-emerald-900/10">
                <CardContent className="flex flex-col gap-2 p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500">
                    <ClipboardList className="h-4 w-4" />
                    Tổng công việc
                  </div>
                  <p className="text-4xl font-semibold text-slate-900">
                    {statusStats.total}
                  </p>
                  <p className="text-sm text-slate-500">Trong trang hiện tại</p>
                </CardContent>
              </Card>
              <Card className="border-none bg-white/95 shadow-xl shadow-emerald-900/10">
                <CardContent className="flex flex-col gap-2 p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
                    <Leaf className="h-4 w-4" />
                    Đang xử lý
                  </div>
                  <p className="text-4xl font-semibold text-slate-900">
                    {statusStats.pending + statusStats.inprogress}
                  </p>
                  <p className="text-sm text-slate-500">Chưa hoàn tất</p>
                </CardContent>
              </Card>
              <Card className="border-none bg-white/95 shadow-xl shadow-emerald-900/10">
                <CardContent className="flex flex-col gap-2 p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500">
                    <BadgeCheck className="h-4 w-4" />
                    Đã hoàn thành
                  </div>
                  <p className="text-4xl font-semibold text-slate-900">
                    {statusStats.completed}
                  </p>
                  <p className="text-sm text-slate-500">Trong trang hiện tại</p>
                </CardContent>
              </Card>
            </div>

            {activeGarden && (
              <Card className="border-none bg-gradient-to-r from-emerald-600/90 to-emerald-500/60 text-white shadow-xl shadow-emerald-900/20">
                <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.4em] text-white/70">
                      Vườn đang xem
                    </p>
                    <h3 className="text-2xl font-semibold">
                      {activeGarden.name}
                    </h3>
                    <p className="flex items-center gap-1 text-sm text-white/80">
                      <MapPin className="h-4 w-4" />
                      {activeGarden.location || "Chưa cập nhật địa chỉ"}
                    </p>
                  </div>
                  <div className="text-sm text-white/80">
                    <p>ID: {activeGarden.gardenId}</p>
                    <p>Trạng thái: {activeGarden.status || "Đang hoạt động"}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
              <CardHeader>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="text-2xl text-slate-900">
                    Danh sách công việc
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    {totalCount} công việc · Trang {page}/{totalPages}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading && tasks.length === 0 ? (
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
                            <TableHead>Công việc</TableHead>
                            <TableHead>Vườn</TableHead>
                            <TableHead>Cây</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Lịch dự kiến</TableHead>
                            <TableHead>Ưu tiên</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">
                              Hành động
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tasks.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="py-8 text-center text-slate-500"
                              >
                                Không có công việc nào phù hợp.
                              </TableCell>
                            </TableRow>
                          ) : (
                            tasks.map((task) => {
                              const statusMeta = getStatusMeta(task.status);
                              const priorityMeta = getPriorityMeta(
                                task.priority
                              );
                              const taskTypeMeta = getTaskTypeMeta(
                                task.taskType
                              );
                              return (
                                <TableRow
                                  key={task.scheduleId}
                                  className="border-b border-slate-100 bg-white/60 transition hover:bg-emerald-50/40"
                                >
                                  <TableCell>
                                    <div className="font-semibold text-slate-900">
                                      {task.taskName || "Chưa đặt tên"}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                      #{task.scheduleId}
                                    </p>
                                  </TableCell>
                                  <TableCell>
                                    <p className="font-medium text-slate-900">
                                      {task.gardenName || "Không xác định"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      ID: {task.gardenId || "-"}
                                    </p>
                                  </TableCell>
                                  <TableCell>
                                    <p className="font-medium text-slate-900">
                                      {task.treeName || "Không rõ"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {task.treeCode || "-"}
                                    </p>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={cn(
                                        "rounded-full px-3 py-1 text-xs",
                                        taskTypeMeta.className
                                      )}
                                    >
                                      {taskTypeMeta.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm font-medium text-slate-900">
                                      {formatDateTime(task)}
                                    </div>
                                    {task.createdAt && (
                                      <p className="text-xs text-slate-500">
                                        Tạo: {formatDate(task.createdAt)}
                                      </p>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={cn(
                                        "rounded-full px-3 py-1 text-xs",
                                        priorityMeta.className
                                      )}
                                    >
                                      {priorityMeta.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-2">
                                      <Badge
                                        className={cn(
                                          "w-fit rounded-full px-3 py-1 text-xs",
                                          statusMeta.className
                                        )}
                                      >
                                        {statusMeta.label}
                                      </Badge>
                                      {renderStatusSelect(task)}
                                      {statusUpdating[task.scheduleId] && (
                                        <span className="flex items-center text-xs text-slate-500">
                                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                          Đang cập nhật...
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => showTaskDetail(task)}
                                      >
                                        Chi tiết
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>

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
                            (_, index) => index + 1
                          ).map((pageNumber) => (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                href="#"
                                isActive={page === pageNumber}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPage(pageNumber);
                                }}
                              >
                                {pageNumber}
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

      <Dialog
        open={detailDialogOpen}
        onOpenChange={(open) =>
          open ? setDetailDialogOpen(true) : closeTaskDetail()
        }
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết công việc</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của công việc đã chọn.
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Tên công việc</p>
                  <p className="font-semibold text-slate-900">
                    {selectedTask.taskName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">ID</p>
                  <p className="font-semibold text-slate-900">
                    #{selectedTask.scheduleId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vườn</p>
                  <p className="font-semibold text-slate-900">
                    {selectedTask.gardenName} (ID: {selectedTask.gardenId})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Cây</p>
                  <p className="font-semibold text-slate-900">
                    {selectedTask.treeName} · {selectedTask.treeCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Lịch dự kiến</p>
                  <p className="font-semibold text-slate-900">
                    {formatDateTime(selectedTask)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tạo lúc</p>
                  <p className="font-semibold text-slate-900">
                    {formatDate(selectedTask.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Ưu tiên</p>
                  <Badge
                    className={cn(
                      "rounded-full px-3 py-1 text-xs",
                      getPriorityMeta(selectedTask.priority).className
                    )}
                  >
                    {getPriorityMeta(selectedTask.priority).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Trạng thái</p>
                  {renderStatusSelect(selectedTask)}
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <p className="text-sm text-slate-500">Mô tả chi tiết</p>
                  <p className="whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                    {selectedTask.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
