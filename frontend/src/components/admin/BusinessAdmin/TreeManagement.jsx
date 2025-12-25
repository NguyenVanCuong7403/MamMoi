import React, { useEffect, useState } from "react";
import {
  Leaf,
  Search,
  Edit,
  Trash,
  ShieldCheck,
  RefreshCcw,
  Loader2,
  Eye,
  MapPin,
  Calendar,
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
import TreeRepository from "@/API/repositories/TreeRepository";
import AdminTreeRepository from "@/API/repositories/AdminTreeRepository";
import GardenRepository from "@/API/repositories/GardenRepository";

const BACKGROUND_PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const PAGE_SIZE = 10;

const HEALTH_STATUS_META = {
  healthy: { label: "Khỏe mạnh", className: "bg-emerald-50 text-emerald-700" },
  warning: { label: "Cần chú ý", className: "bg-amber-50 text-amber-700" },
  critical: { label: "Nguy hiểm", className: "bg-rose-50 text-rose-700" },
  unknown: { label: "Chưa xác định", className: "bg-slate-50 text-slate-700" },
};

export default function AdminTreeManagement() {
  const [trees, setTrees] = useState([]);
  const [treeTypes, setTreeTypes] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [gardenFilter, setGardenFilter] = useState(null);
  const [treeTypeFilter, setTreeTypeFilter] = useState(null);

  // Dialog states
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTree, setSelectedTree] = useState(null);
  const [treeDetail, setTreeDetail] = useState(null);

  const [actionNotice, setActionNotice] = useState(null);

  // Fetch tree types for filter dropdown
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

  // Fetch gardens for filter dropdown
  const fetchGardens = async () => {
    try {
      const response = await GardenRepository.getGardens(1, 100, "");
      if (response.gardens) {
        setGardens(response.gardens);
      }
    } catch (err) {
      console.error("Error fetching gardens:", err);
    }
  };

  // Fetch trees from API
  const fetchTrees = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await TreeRepository.searchTrees({
        q: searchTerm || "",
        gardenId: gardenFilter ? parseInt(gardenFilter) : null,
        treeTypeId: treeTypeFilter ? parseInt(treeTypeFilter) : null,
        page,
        pageSize: PAGE_SIZE,
      });

      if (response.items) {
        setTrees(response.items || []);
        setTotalCount(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / PAGE_SIZE));
      }
    } catch (err) {
      console.error("Error fetching trees:", err);
      const errorMsg = err.message || "Có lỗi xảy ra khi tải dữ liệu cây trồng";
      setError(errorMsg);
      setActionNotice({ message: errorMsg, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch tree detail
  const fetchTreeDetail = async (treeId) => {
    try {
      const detail = await TreeRepository.getTreeDetail(treeId);
      setTreeDetail(detail);
    } catch (err) {
      console.error("Error fetching tree detail:", err);
      setActionNotice({
        message: "Có lỗi xảy ra khi tải chi tiết cây trồng",
        tone: "error",
      });
    }
  };

  useEffect(() => {
    fetchTreeTypes();
    fetchGardens();
  }, []);

  useEffect(() => {
    fetchTrees();
  }, [page, searchTerm, gardenFilter, treeTypeFilter]);

  useEffect(() => {
    if (!actionNotice) return;
    const timeout = setTimeout(() => setActionNotice(null), 3500);
    return () => clearTimeout(timeout);
  }, [actionNotice]);

  const handleDelete = async () => {
    if (!selectedTree) return;

    try {
      // Admin can delete any tree - pass null for userId to use JWT
      await TreeRepository.deleteTree(selectedTree.treeId, null);
      setActionNotice({
        message: "Đã xóa cây trồng thành công!",
        tone: "success",
      });
      setIsDeleteDialogOpen(false);
      setSelectedTree(null);
      await fetchTrees();
    } catch (err) {
      console.error("Error deleting tree:", err);
      setActionNotice({
        message: err.message || "Có lỗi xảy ra khi xóa cây trồng",
        tone: "error",
      });
    }
  };

  const openDetailDialog = async (tree) => {
    setSelectedTree(tree);
    setIsDetailDialogOpen(true);
    await fetchTreeDetail(tree.treeId);
  };

  const openDeleteDialog = (tree) => {
    setSelectedTree(tree);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getHealthStatusLabel = (status) => {
    if (!status) return HEALTH_STATUS_META.unknown.label;
    const normalized = status.toLowerCase();
    return HEALTH_STATUS_META[normalized]?.label || status;
  };

  const getHealthStatusClassName = (status) => {
    if (!status) return HEALTH_STATUS_META.unknown.className;
    const normalized = status.toLowerCase();
    return (
      HEALTH_STATUS_META[normalized]?.className ||
      HEALTH_STATUS_META.unknown.className
    );
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
            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] text-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Quản trị kinh doanh
                </p>
                <h1 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-semibold text-white">
                  Quản lý cây trồng
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
                  Quản lý tất cả cây trồng trong hệ thống, theo dõi trạng thái
                  và thông tin chi tiết.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white text-xs sm:text-sm px-2.5 sm:px-4"
                  onClick={fetchTrees}
                  disabled={loading}
                >
                  <RefreshCcw
                    className={cn("mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4", loading && "animate-spin")}
                  />
                  <span className="hidden sm:inline">{loading ? "Đang tải..." : "Làm mới"}</span>
                  <span className="sm:hidden">{loading ? "..." : "Làm mới"}</span>
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
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
                  <div className="sm:col-span-2 lg:col-span-4">
                    <div className="relative">
                      <Input
                        placeholder="Tìm theo mã cây, tên cây..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPage(1);
                        }}
                        className="rounded-xl border-slate-200 bg-white pl-10 text-slate-900 text-sm"
                      />
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                  <div className="sm:col-span-1 lg:col-span-4">
                    <SearchableSelect
                      value={gardenFilter || "all"}
                      onChange={(value) => {
                        setGardenFilter(value === "all" ? null : value);
                        setPage(1);
                      }}
                      options={[
                        { value: "all", label: "Tất cả vườn" },
                        ...gardens.map((g) => ({
                          value: g.gardenId.toString(),
                          label: g.name,
                        })),
                      ]}
                      placeholder="Chọn vườn"
                    />
                  </div>
                  <div className="sm:col-span-1 lg:col-span-4">
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

            {/* Trees Table */}
            <Card className="border-none bg-white/95 text-slate-900 shadow-2xl shadow-emerald-900/10">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-5">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-slate-900">
                    Danh sách cây trồng
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                    <Leaf className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                    {totalCount} cây trồng
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 py-4 sm:py-5">
                {loading && trees.length === 0 ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <span className="ml-3 text-slate-600">
                      Đang tải dữ liệu...
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card Layout */}
                    <div className="md:hidden space-y-3">
                      {trees.length === 0 ? (
                        <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-slate-500">
                          Không có cây trồng nào.
                        </div>
                      ) : (
                        trees.map((tree) => (
                          <div
                            key={tree.treeId}
                            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900">{tree.treeName || tree.treeCode || `#${tree.treeId}`}</p>
                                <p className="text-xs text-slate-500 font-mono">{tree.treeCode || "-"}</p>
                              </div>
                              <Badge
                                className={cn(
                                  "border-0 text-[10px] px-1.5 py-0.5 shrink-0",
                                  getHealthStatusClassName(tree.healthStatus)
                                )}
                              >
                                {getHealthStatusLabel(tree.healthStatus)}
                              </Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400">ID:</span>
                                <span className="ml-1 font-medium text-slate-700">#{tree.treeId}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Vườn:</span>
                                <span className="ml-1 text-slate-700">{tree.gardenName}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Loại:</span>
                                <Badge className="ml-1 bg-sky-50 text-sky-700 border border-sky-100 text-[10px] px-1.5 py-0">
                                  {tree.treeTypeName}
                                </Badge>
                              </div>
                              <div>
                                <span className="text-slate-400">Giống:</span>
                                <span className="ml-1 text-slate-600">{tree.treeVarietyName || "-"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Giai đoạn:</span>
                                <span className="ml-1 text-slate-600">{tree.stageName || "-"}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Ngày trồng:</span>
                                <span className="ml-1 text-slate-600">{tree.plantDate ? formatDate(tree.plantDate) : "-"}</span>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => openDetailDialog(tree)}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-rose-600"
                                onClick={() => openDeleteDialog(tree)}
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                      <Table>
                        <TableHeader className="sticky top-0 bg-emerald-50/80 backdrop-blur">
                          <TableRow className="border-none text-xs uppercase tracking-wider text-slate-500">
                            <TableHead>ID</TableHead>
                            <TableHead>Mã cây</TableHead>
                            <TableHead>Tên cây</TableHead>
                            <TableHead>Vườn</TableHead>
                            <TableHead>Loại cây</TableHead>
                            <TableHead>Giống cây</TableHead>
                            <TableHead>Giai đoạn</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày trồng</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trees.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={10} className="py-8 text-center text-slate-500">
                                Không có cây trồng nào.
                              </TableCell>
                            </TableRow>
                          ) : (
                            trees.map((tree) => (
                              <TableRow
                                key={tree.treeId}
                                className="border-b border-slate-100 bg-white/60 transition hover:bg-emerald-50/40"
                              >
                                <TableCell className="font-semibold text-slate-900">#{tree.treeId}</TableCell>
                                <TableCell className="font-mono text-xs text-slate-600">{tree.treeCode || "-"}</TableCell>
                                <TableCell className="font-medium text-slate-800">{tree.treeName || "-"}</TableCell>
                                <TableCell className="text-slate-700">{tree.gardenName}</TableCell>
                                <TableCell>
                                  <Badge className="bg-sky-50 text-sky-700 border border-sky-100">{tree.treeTypeName}</Badge>
                                </TableCell>
                                <TableCell className="text-slate-600">{tree.treeVarietyName || "-"}</TableCell>
                                <TableCell className="text-slate-600">{tree.stageName || "-"}</TableCell>
                                <TableCell>
                                  <Badge className={cn("border-0", getHealthStatusClassName(tree.healthStatus))}>
                                    {getHealthStatusLabel(tree.healthStatus)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500">{tree.plantDate ? formatDate(tree.plantDate) : "-"}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" onClick={() => openDetailDialog(tree)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-rose-600"
                                      onClick={() => openDeleteDialog(tree)}
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

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết cây trồng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về cây trồng được chọn.
            </DialogDescription>
          </DialogHeader>
          {treeDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Mã cây</p>
                  <p className="font-semibold text-slate-900">
                    {treeDetail.treeCode || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tên cây</p>
                  <p className="font-semibold text-slate-900">
                    {treeDetail.treeName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vườn</p>
                  <p className="font-medium text-slate-900">
                    {treeDetail.gardenName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Loại cây</p>
                  <p className="font-medium text-slate-900">
                    {treeDetail.treeTypeName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Giống cây</p>
                  <p className="font-medium text-slate-900">
                    {treeDetail.treeVarietyName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Giai đoạn</p>
                  <p className="font-medium text-slate-900">
                    {treeDetail.stageName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Ngày trồng</p>
                  <p className="font-medium text-slate-900">
                    {treeDetail.plantDate
                      ? formatDate(treeDetail.plantDate)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tuổi (tháng)</p>
                  <p className="font-medium text-slate-900">
                    {treeDetail.preMonths ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vị trí</p>
                  <p className="font-medium text-slate-900">
                    {treeDetail.location || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Trạng thái</p>
                  <Badge
                    className={cn(
                      "mt-1 border-0",
                      treeDetail.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {treeDetail.isActive ? "Đang hoạt động" : "Tạm dừng"}
                  </Badge>
                </div>
                {treeDetail.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500">Ghi chú</p>
                    <p className="font-medium text-slate-900">
                      {treeDetail.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
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
              Bạn có chắc chắn muốn xóa cây trồng "
              {selectedTree?.treeName ||
                selectedTree?.treeCode ||
                `#${selectedTree?.treeId}`}
              "? Hành động này không thể hoàn tác.
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
