import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash,
  ShieldCheck,
  RefreshCcw,
  Loader2,
  Check,
  X,
  DollarSign,
} from "lucide-react";
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
import AdminSubscriptionPlanRepository from "@/API/repositories/AdminSubscriptionPlanRepository";

const BACKGROUND_PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const PAGE_SIZE = 10;

// Format currency helper
function formatCurrency(value, currency = "VND") {
  if (currency === "VND") {
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
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: currency,
  });
}

// Format features helper - parse JSON array and format nicely
function formatFeatures(features) {
  if (!features) return "";
  
  try {
    // Try to parse as JSON array
    const parsed = typeof features === "string" ? JSON.parse(features) : features;
    if (Array.isArray(parsed)) {
      return parsed.join(", ");
    }
    return features;
  } catch {
    // If not JSON, return as is
    return features;
  }
}

export default function SubscriptionPlanManagement() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(null); // null = all, true = active, false = inactive

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    planName: "",
    planType: "",
    price: "",
    currency: "VND",
    description: "",
    features: "",
    isActive: true,
  });

  const [actionNotice, setActionNotice] = useState(null);
  const [formError, setFormError] = useState("");

  // Reset form
  const resetForm = () => {
    setFormData({
      planName: "",
      planType: "",
      price: "",
      currency: "VND",
      description: "",
      features: "",
      isActive: true,
    });
    setFormError("");
  };

  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await AdminSubscriptionPlanRepository.getAllSubscriptionPlans(
        page,
        PAGE_SIZE,
        activeFilter,
        searchTerm || null
      );

      if (response.success) {
        setPlans(response.data || []);
        setTotalCount(response.pagination?.totalCount || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching subscription plans:", err);
      const errorMsg = err.message || "Có lỗi xảy ra khi tải danh sách gói dịch vụ";
      setError(errorMsg);
      setActionNotice({ message: errorMsg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [page, searchTerm, activeFilter]);

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = setTimeout(() => setActionNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [actionNotice]);

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      planName: plan.planName || "",
      planType: plan.planType || "",
      price: plan.price?.toString() || "",
      currency: plan.currency || "VND",
      description: plan.description || "",
      features: plan.features || "",
      isActive: plan.isActive !== undefined ? plan.isActive : true,
    });
    setFormError("");
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (plan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  // Handle create
  const handleCreate = async () => {
    if (!formData.planName.trim() || !formData.price) {
      setFormError("Vui lòng nhập đủ tên gói và giá.");
      return;
    }

    try {
      const payload = {
        planName: formData.planName.trim(),
        planType: formData.planType.trim() || null,
        price: parseFloat(formData.price),
        currency: formData.currency || "VND",
        description: formData.description.trim() || null,
        features: formData.features.trim() || null,
        isActive: formData.isActive,
      };

      await AdminSubscriptionPlanRepository.createSubscriptionPlan(payload);
      setActionNotice({
        message: "Đã tạo gói dịch vụ mới thành công!",
        tone: "success",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      await fetchPlans();
    } catch (err) {
      console.error("Error creating subscription plan:", err);
      setFormError(err.message || "Có lỗi xảy ra khi tạo gói dịch vụ");
    }
  };

  // Handle edit
  const handleEdit = async () => {
    if (!selectedPlan) return;

    try {
      const payload = {};
      if (formData.planName !== selectedPlan.planName)
        payload.planName = formData.planName.trim();
      if (formData.price !== selectedPlan.price?.toString())
        payload.price = parseFloat(formData.price);
      if (formData.currency !== selectedPlan.currency)
        payload.currency = formData.currency;
      if (formData.description !== (selectedPlan.description || ""))
        payload.description = formData.description.trim() || null;
      if (formData.features !== (selectedPlan.features || ""))
        payload.features = formData.features.trim() || null;
      if (formData.isActive !== selectedPlan.isActive)
        payload.isActive = formData.isActive;

      await AdminSubscriptionPlanRepository.updateSubscriptionPlan(
        selectedPlan.planId,
        payload
      );
      setActionNotice({
        message: "Đã cập nhật gói dịch vụ thành công!",
        tone: "success",
      });
      setIsEditDialogOpen(false);
      resetForm();
      await fetchPlans();
    } catch (err) {
      console.error("Error updating subscription plan:", err);
      setFormError(err.message || "Có lỗi xảy ra khi cập nhật gói dịch vụ");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedPlan) return;

    try {
      await AdminSubscriptionPlanRepository.deleteSubscriptionPlan(selectedPlan.planId);
      setActionNotice({
        message: "Đã xóa gói dịch vụ thành công!",
        tone: "success",
      });
      setIsDeleteDialogOpen(false);
      setSelectedPlan(null);
      await fetchPlans();
    } catch (err) {
      console.error("Error deleting subscription plan:", err);
      setActionNotice({
        message: err.message || "Có lỗi xảy ra khi xóa gói dịch vụ",
        tone: "error",
      });
    }
  };

  // Handle activate
  const handleActivate = async (plan) => {
    try {
      await AdminSubscriptionPlanRepository.activateSubscriptionPlan(plan.planId);
      setActionNotice({
        message: `Đã kích hoạt gói ${plan.planName}!`,
        tone: "success",
      });
      await fetchPlans();
    } catch (err) {
      console.error("Error activating subscription plan:", err);
      setActionNotice({
        message: err.message || "Có lỗi xảy ra khi kích hoạt gói dịch vụ",
        tone: "error",
      });
    }
  };

  // Handle deactivate
  const handleDeactivate = async (plan) => {
    try {
      await AdminSubscriptionPlanRepository.deactivateSubscriptionPlan(plan.planId);
      setActionNotice({
        message: `Đã vô hiệu hóa gói ${plan.planName}!`,
        tone: "success",
      });
      await fetchPlans();
    } catch (err) {
      console.error("Error deactivating subscription plan:", err);
      setActionNotice({
        message: err.message || "Có lỗi xảy ra khi vô hiệu hóa gói dịch vụ",
        tone: "error",
      });
    }
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  Quản trị hệ thống
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  Quản lý gói dịch vụ
                </h1>
                <p className="text-emerald-100/80">
                  Quản lý các gói dịch vụ, giá cả và tính năng của từng gói.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  onClick={fetchPlans}
                  disabled={loading}
                >
                  <RefreshCcw
                    className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
                  />
                  {loading ? "Đang tải..." : "Làm mới"}
                </Button>
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={openCreateDialog}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo gói mới
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

            {/* Filters */}
            <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
              <CardContent className="p-6">
                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-6">
                    <div className="relative">
                      <Input
                        placeholder="Tìm theo tên gói hoặc mô tả..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPage(1);
                        }}
                        className="rounded-xl border-slate-200 bg-white pl-10 text-slate-900"
                      />
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div className="lg:col-span-6">
                    <Select
                      value={
                        activeFilter === null
                          ? "all"
                          : activeFilter
                          ? "active"
                          : "inactive"
                      }
                      onValueChange={(value) => {
                        setActiveFilter(value === "all" ? null : value === "active");
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="active">Đang hoạt động</SelectItem>
                        <SelectItem value="inactive">Tạm dừng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plans Table */}
            <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
              <CardHeader>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="text-2xl text-slate-900">
                    Danh sách gói dịch vụ
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Package className="h-4 w-4 text-emerald-600" />
                    {totalCount} gói dịch vụ
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading && plans.length === 0 ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <span className="ml-3 text-slate-600">Đang tải dữ liệu...</span>
                  </div>
                ) : (
                  <>
                    <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                      <Table>
                        <TableHeader className="sticky top-0 bg-emerald-50/80 backdrop-blur">
                          <TableRow className="border-none text-xs uppercase tracking-wider text-slate-500">
                            <TableHead>ID</TableHead>
                            <TableHead>Tên gói</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plans.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="py-8 text-center text-slate-500"
                              >
                                Không có gói dịch vụ nào.
                              </TableCell>
                            </TableRow>
                          ) : (
                            plans.map((plan) => (
                              <TableRow
                                key={plan.planId}
                                className="border-b border-slate-100 bg-white/60 transition hover:bg-emerald-50/40"
                              >
                                <TableCell className="font-semibold text-slate-900">
                                  #{plan.planId}
                                </TableCell>
                                <TableCell className="font-medium text-slate-800">
                                  {plan.planName}
                                </TableCell>
                                <TableCell>
                                  {plan.planType ? (
                                    <Badge className="bg-sky-50 text-sky-700 border border-sky-100">
                                      {plan.planType}
                                    </Badge>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell className="font-semibold text-emerald-700">
                                  {formatCurrency(plan.price, plan.currency || "VND")}
                                </TableCell>
                                <TableCell className="text-slate-600 max-w-md truncate">
                                  {plan.description || "-"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={cn(
                                      "border-0",
                                      plan.isActive
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-amber-50 text-amber-700"
                                    )}
                                  >
                                    {plan.isActive ? "Hoạt động" : "Tạm dừng"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditDialog(plan)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    {plan.isActive ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-amber-600"
                                        onClick={() => handleDeactivate(plan)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-emerald-600"
                                        onClick={() => handleActivate(plan)}
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-rose-600"
                                      onClick={() => openDeleteDialog(plan)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
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
          </>
        </AdminLayout>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo gói dịch vụ mới</DialogTitle>
            <DialogDescription>
              Tạo một gói dịch vụ mới cho hệ thống.
            </DialogDescription>
          </DialogHeader>
          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {formError}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Tên gói *
              </label>
              <Input
                value={formData.planName}
                onChange={(e) =>
                  setFormData({ ...formData, planName: e.target.value })
                }
                placeholder="Ví dụ: Gói Ươm Mầm"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Loại gói
                </label>
                <Input
                  value={formData.planType}
                  onChange={(e) =>
                    setFormData({ ...formData, planType: e.target.value })
                  }
                  placeholder="Ví dụ: Basic"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Đơn vị tiền tệ
                </label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VND">VND</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Giá *
              </label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0"
                className="mt-1"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Mô tả
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả về gói dịch vụ..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Tính năng
              </label>
              <Textarea
                value={formData.features}
                onChange={(e) =>
                  setFormData({ ...formData, features: e.target.value })
                }
                placeholder="Danh sách tính năng (mỗi tính năng một dòng)..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-slate-700"
              >
                Kích hoạt ngay sau khi tạo
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleCreate}
            >
              Tạo gói
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa gói dịch vụ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin gói dịch vụ.
            </DialogDescription>
          </DialogHeader>
          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {formError}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Tên gói
              </label>
              <Input
                value={formData.planName}
                onChange={(e) =>
                  setFormData({ ...formData, planName: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Loại gói
                </label>
                <Input
                  value={formData.planType}
                  readOnly
                  disabled
                  className="mt-1 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Loại gói cố định, không thể chỉnh sửa.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Đơn vị tiền tệ
                </label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VND">VND</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Giá</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="mt-1"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Mô tả
              </label>
              <Textarea
                value={formData.description || ""}
                disabled
                className="mt-1 bg-slate-50 text-slate-600 cursor-not-allowed"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Tính năng
              </label>
              <Textarea
                value={formatFeatures(formData.features)}
                disabled
                className="mt-1 bg-slate-50 text-slate-600 cursor-not-allowed"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActiveEdit"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label
                htmlFor="isActiveEdit"
                className="text-sm font-medium text-slate-700"
              >
                Đang hoạt động
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleEdit}
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa gói dịch vụ "
              {selectedPlan?.planName}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

