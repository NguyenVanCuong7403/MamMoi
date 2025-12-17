import React, { useEffect, useState } from "react";
import {
  Leaf,
  Plus,
  Search,
  Edit,
  Trash,
  ShieldCheck,
  RefreshCcw,
  Loader2,
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
import AdminTreeRepository from "@/API/repositories/AdminTreeRepository";

const BACKGROUND_PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const PAGE_SIZE = 10;

export default function TreeVarietyManagement() {
  const [varieties, setVarieties] = useState([]);
  const [treeTypes, setTreeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [treeTypeFilter, setTreeTypeFilter] = useState(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVariety, setSelectedVariety] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    treeTypeId: "",
    varietyName: "",
    varietyDescription: "",
  });
  const [varietyNameError, setVarietyNameError] = useState("");
  const [actionNotice, setActionNotice] = useState(null);

  // Fetch tree types for dropdown (including inactive ones to allow adding varieties)
  const fetchTreeTypes = async () => {
    try {
      const response = await AdminTreeRepository.getAllTreeTypes(
        1,
        100,
        null,
        null, // Don't filter by isActive to include inactive tree types
      );
      if (response.success && response.data) {
        setTreeTypes(response.data);
      }
    } catch (err) {
      console.error("Error fetching tree types:", err);
    }
  };

  // Validate variety name doesn't start with or contain tree type name
  const validateVarietyName = (varietyName, treeTypeId) => {
    if (!varietyName || !treeTypeId) return "";

    const selectedTreeType = treeTypes.find(
      (t) => t.treeTypeId.toString() === treeTypeId.toString(),
    );

    if (!selectedTreeType) return "";

    const treeTypeName = selectedTreeType.treeTypeName.trim().toLowerCase();
    const varietyNameLower = varietyName.trim().toLowerCase();

    // Check if variety name starts with tree type name
    if (varietyNameLower.startsWith(treeTypeName)) {
      return `Tên giống cây không được bắt đầu bằng "${selectedTreeType.treeTypeName}"`;
    }

    // Check if variety name contains tree type name
    if (varietyNameLower.includes(treeTypeName)) {
      return `Tên giống cây không được chứa "${selectedTreeType.treeTypeName}"`;
    }

    return "";
  };

  // Fetch varieties from API
  const fetchVarieties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await AdminTreeRepository.getAllTreeVarieties(
        page,
        PAGE_SIZE,
        searchTerm || null,
        treeTypeFilter ? parseInt(treeTypeFilter) : null,
      );

      if (response.success) {
        setVarieties(response.data || []);
        setTotalCount(response.pagination?.totalCount || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching tree varieties:", err);
      const errorMsg = err.message || "Có lỗi xảy ra khi tải dữ liệu giống cây";
      setError(errorMsg);
      setActionNotice({ message: errorMsg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreeTypes();
  }, []);

  useEffect(() => {
    fetchVarieties();
  }, [page, searchTerm, treeTypeFilter]);

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = setTimeout(() => setActionNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [actionNotice]);

  const handleCreate = async () => {
    try {
      const payload = {
        treeTypeId: parseInt(formData.treeTypeId),
        varietyName: formData.varietyName.trim(),
        varietyDescription: formData.varietyDescription.trim() || null,
      };

      // Validate payload to avoid sending invalid/empty treeTypeId
      if (!payload.treeTypeId || Number.isNaN(payload.treeTypeId)) {
        const msg = "Loại cây không hợp lệ. Vui lòng chọn lại loại cây.";
        console.warn("Invalid createTreeVariety payload:", payload);
        setActionNotice({ message: msg, tone: "error" });
        return;
      }

      // Validate variety name doesn't contain tree type name
      const validationError = validateVarietyName(
        payload.varietyName,
        payload.treeTypeId,
      );
      if (validationError) {
        setVarietyNameError(validationError);
        setActionNotice({ message: validationError, tone: "error" });
        return;
      }

      // Log payload for debugging — helps trace incorrect values (e.g. 1000)
      console.debug("Creating tree variety with payload:", payload);

      const created = await AdminTreeRepository.createTreeVariety(payload);
      console.debug("createTreeVariety response:", created);
      setActionNotice({
        message: "Đã tạo giống cây mới thành công!",
        tone: "success",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      await fetchVarieties();
    } catch (err) {
      console.error("Error creating tree variety:", err);
      setActionNotice({
        message: err.message || "Có lỗi xảy ra khi tạo giống cây",
        tone: "error",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedVariety) return;

    try {
      const payload = {};
      if (formData.treeTypeId)
        payload.treeTypeId = parseInt(formData.treeTypeId);
      if (formData.varietyName)
        payload.varietyName = formData.varietyName.trim();
      if (formData.varietyDescription !== undefined)
        payload.varietyDescription = formData.varietyDescription.trim() || null;

      // Validate variety name doesn't contain tree type name
      if (payload.varietyName && payload.treeTypeId) {
        const validationError = validateVarietyName(
          payload.varietyName,
          payload.treeTypeId,
        );
        if (validationError) {
          setVarietyNameError(validationError);
          setActionNotice({ message: validationError, tone: "error" });
          return;
        }
      }

      await AdminTreeRepository.updateTreeVariety(
        selectedVariety.varietyId,
        payload,
      );
      setActionNotice({
        message: "Đã cập nhật giống cây thành công!",
        tone: "success",
      });
      setIsEditDialogOpen(false);
      resetForm();
      await fetchVarieties();
    } catch (err) {
      console.error("Error updating tree variety:", err);
      setActionNotice({
        message: err.message || "Có lỗi xảy ra khi cập nhật giống cây",
        tone: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedVariety) return;

    try {
      await AdminTreeRepository.deleteTreeVariety(selectedVariety.varietyId);
      setActionNotice({
        message: "Đã xóa giống cây thành công!",
        tone: "success",
      });
      setIsDeleteDialogOpen(false);
      setSelectedVariety(null);
      await fetchVarieties();
    } catch (err) {
      console.error("Error deleting tree variety:", err);
      setActionNotice({
        message: err.message || "Có lỗi xảy ra khi xóa giống cây",
        tone: "error",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      treeTypeId: "",
      varietyName: "",
      varietyDescription: "",
    });
    setVarietyNameError("");
    setSelectedVariety(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setVarietyNameError("");
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (variety) => {
    setSelectedVariety(variety);
    setFormData({
      treeTypeId: variety.treeTypeId.toString(),
      varietyName: variety.varietyName,
      varietyDescription: variety.varietyDescription || "",
    });
    setVarietyNameError("");
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (variety) => {
    setSelectedVariety(variety);
    setIsDeleteDialogOpen(true);
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
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  Quản trị kinh doanh
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  Quản lý giống cây trồng
                </h1>
                <p className="text-emerald-100/80">
                  Quản lý các giống cây trồng theo từng loại cây.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  onClick={fetchVarieties}
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
                  Thêm giống cây mới
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
                    : "border-emerald-200 bg-emerald-50 text-emerald-800",
                )}
              >
                {actionNotice.message}
              </div>
            )}

            {/* Filters */}
            <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
              <CardContent className="p-6">
                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <div className="relative">
                      <Input
                        placeholder="Tìm theo tên giống cây..."
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
                  <div className="lg:col-span-4">
                    <SearchableSelect
                      value={treeTypeFilter || "all"}
                      onChange={(value) => {
                        setTreeTypeFilter(value === "all" ? null : value);
                        setPage(1);
                      }}
                      options={[
                        { value: "all", label: "Tất cả loại cây" },
                        ...treeTypes.map((t) => ({
                          value: t.treeTypeId.toString(),
                          label: t.treeTypeName,
                        })),
                      ]}
                      placeholder="Chọn loại cây"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Varieties Table */}
            <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
              <CardHeader>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="text-2xl text-slate-900">
                    Danh sách giống cây
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Leaf className="h-4 w-4 text-emerald-600" />
                    {totalCount} giống cây
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading && varieties.length === 0 ? (
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
                            <TableHead>Tên giống cây</TableHead>
                            <TableHead>Loại cây</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Số cây</TableHead>
                            <TableHead className="text-right">
                              Hành động
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {varieties.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="py-8 text-center text-slate-500"
                              >
                                Không có giống cây nào.
                              </TableCell>
                            </TableRow>
                          ) : (
                            varieties.map((variety, index) => (
                              <TableRow
                                key={variety.varietyId}
                                className="border-b border-slate-100 bg-white/60 transition hover:bg-emerald-50/40"
                              >
                                <TableCell className="font-semibold text-slate-900">
                                  {(page - 1) * PAGE_SIZE + index + 1}
                                </TableCell>
                                <TableCell className="text-slate-800 font-medium">
                                  {variety.varietyName}
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-sky-50 text-sky-700 border border-sky-100">
                                    {variety.treeTypeName}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-600 max-w-xs truncate">
                                  {variety.varietyDescription || "-"}
                                </TableCell>
                                <TableCell className="text-slate-700">
                                  {variety.treesCount || 0}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openEditDialog(variety)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-rose-600"
                                      onClick={() => openDeleteDialog(variety)}
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
                            (_, i) => i + 1,
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
                                  Math.min(totalPages, prev + 1),
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm giống cây mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin về giống cây mới.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Loại cây *
              </label>
              <SearchableSelect
                value={formData.treeTypeId}
                onChange={(value) => {
                  setFormData({ ...formData, treeTypeId: value });
                  // Revalidate variety name when tree type changes
                  if (formData.varietyName) {
                    const error = validateVarietyName(
                      formData.varietyName,
                      value,
                    );
                    setVarietyNameError(error);
                  }
                }}
                options={treeTypes.map((t) => ({
                  value: t.treeTypeId.toString(),
                  label: t.treeTypeName,
                }))}
                placeholder="Chọn loại cây"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Tên giống cây *
              </label>
              <Input
                value={formData.varietyName}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFormData({ ...formData, varietyName: newValue });
                  // Validate on change
                  if (newValue && formData.treeTypeId) {
                    const error = validateVarietyName(
                      newValue,
                      formData.treeTypeId,
                    );
                    setVarietyNameError(error);
                  } else {
                    setVarietyNameError("");
                  }
                }}
                placeholder="Ví dụ: Cát Hòa Lộc A"
                className={cn("mt-1", varietyNameError && "border-rose-500")}
              />
              {varietyNameError && (
                <p className="mt-1 text-sm text-rose-600">{varietyNameError}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Mô tả
              </label>
              <Textarea
                value={formData.varietyDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    varietyDescription: e.target.value,
                  })
                }
                placeholder="Mô tả về giống cây..."
                className="mt-1"
                rows={3}
              />
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
              disabled={
                !formData.treeTypeId ||
                !formData.varietyName ||
                !!varietyNameError
              }
            >
              Tạo mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa giống cây</DialogTitle>
            <DialogDescription>Cập nhật thông tin giống cây.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Loại cây
              </label>
              <SearchableSelect
                value={formData.treeTypeId}
                onChange={(value) => {
                  setFormData({ ...formData, treeTypeId: value });
                  // Revalidate variety name when tree type changes
                  if (formData.varietyName) {
                    const error = validateVarietyName(
                      formData.varietyName,
                      value,
                    );
                    setVarietyNameError(error);
                  }
                }}
                options={treeTypes.map((t) => ({
                  value: t.treeTypeId.toString(),
                  label: t.treeTypeName,
                }))}
                placeholder="Chọn loại cây"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Tên giống cây *
              </label>
              <Input
                value={formData.varietyName}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFormData({ ...formData, varietyName: newValue });
                  // Validate on change
                  if (newValue && formData.treeTypeId) {
                    const error = validateVarietyName(
                      newValue,
                      formData.treeTypeId,
                    );
                    setVarietyNameError(error);
                  } else {
                    setVarietyNameError("");
                  }
                }}
                placeholder="Ví dụ: Cát Hòa Lộc A"
                className={cn("mt-1", varietyNameError && "border-rose-500")}
              />
              {varietyNameError && (
                <p className="mt-1 text-sm text-rose-600">{varietyNameError}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Mô tả
              </label>
              <Textarea
                value={formData.varietyDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    varietyDescription: e.target.value,
                  })
                }
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleEdit}
              disabled={
                !formData.treeTypeId ||
                !formData.varietyName ||
                !!varietyNameError
              }
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
              Bạn có chắc chắn muốn xóa giống cây "
              {selectedVariety?.varietyName}"? Hành động này không thể hoàn tác.
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
