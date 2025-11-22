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
  const [actionNotice, setActionNotice] = useState(null);

  // Fetch tree types for dropdown
  const fetchTreeTypes = async () => {
    try {
      const response = await AdminTreeRepository.getAllTreeTypes(
        1,
        100,
        null,
        true
      );
      if (response.success && response.data) {
        setTreeTypes(response.data);
      }
    } catch (err) {
      console.error("Error fetching tree types:", err);
    }
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
        treeTypeFilter ? parseInt(treeTypeFilter) : null
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

      await AdminTreeRepository.createTreeVariety(payload);
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

      await AdminTreeRepository.updateTreeVariety(
        selectedVariety.varietyId,
        payload
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
    setSelectedVariety(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (variety) => {
    setSelectedVariety(variety);
    setFormData({
      treeTypeId: variety.treeTypeId?.toString() || "",
      varietyName: variety.varietyName || "",
      varietyDescription: variety.varietyDescription || "",
    });
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
                    <Select
                      value={treeTypeFilter || "all"}
                      onValueChange={(value) => {
                        setTreeTypeFilter(value === "all" ? null : value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 bg-white text-slate-900">
                        <SelectValue placeholder="Chọn loại cây" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả loại cây</SelectItem>
                        {treeTypes.map((treeType) => (
                          <SelectItem
                            key={treeType.treeTypeId}
                            value={treeType.treeTypeId.toString()}
                          >
                            {treeType.treeTypeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                            <TableHead>ID</TableHead>
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
                            varieties.map((variety) => (
                              <TableRow
                                key={variety.varietyId}
                                className="border-b border-slate-100 bg-white/60 transition hover:bg-emerald-50/40"
                              >
                                <TableCell className="font-semibold text-slate-900">
                                  #{variety.varietyId}
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
              <Select
                value={formData.treeTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, treeTypeId: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn loại cây" />
                </SelectTrigger>
                <SelectContent>
                  {treeTypes.map((treeType) => (
                    <SelectItem
                      key={treeType.treeTypeId}
                      value={treeType.treeTypeId.toString()}
                    >
                      {treeType.treeTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Tên giống cây *
              </label>
              <Input
                value={formData.varietyName}
                onChange={(e) =>
                  setFormData({ ...formData, varietyName: e.target.value })
                }
                placeholder="Ví dụ: Cát Hòa Lộc A"
                className="mt-1"
              />
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
              disabled={!formData.treeTypeId || !formData.varietyName}
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
              <Select
                value={formData.treeTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, treeTypeId: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn loại cây" />
                </SelectTrigger>
                <SelectContent>
                  {treeTypes.map((treeType) => (
                    <SelectItem
                      key={treeType.treeTypeId}
                      value={treeType.treeTypeId.toString()}
                    >
                      {treeType.treeTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Tên giống cây
              </label>
              <Input
                value={formData.varietyName}
                onChange={(e) =>
                  setFormData({ ...formData, varietyName: e.target.value })
                }
                className="mt-1"
              />
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
