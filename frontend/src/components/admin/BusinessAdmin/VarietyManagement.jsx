import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit3, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const VARIETY_PAGE_SIZE = 5;

const varietySchema = z.object({
  VarietyID: z.string().optional(),
  VarietyName: z.string().min(1, "Tên giống là bắt buộc"),
  VarietyDescription: z.string().optional(),
});

const normalizeText = (value = "") => value.trim().toLowerCase();

const buildDuplicateMessage = (entityLabel, value) =>
  `${entityLabel} "${value}" đã có trong hệ thống.`;

export default function VarietyManagement({ 
  open, 
  onOpenChange, 
  tree,
  onUpdate 
}) {
  const [varieties, setVarieties] = useState([]);
  const [selectedVarietyId, setSelectedVarietyId] = useState(null);
  const [varietySearch, setVarietySearch] = useState("");
  const [varietyPage, setVarietyPage] = useState(1);
  const [varietySaving, setVarietySaving] = useState(false);
  const [varietyDeleting, setVarietyDeleting] = useState(false);
  const [varietyDeleteConfirmOpen, setVarietyDeleteConfirmOpen] = useState(false);
  const [createVarietyOverlayOpen, setCreateVarietyOverlayOpen] = useState(false);
  const [varietyCreateConfirmOpen, setVarietyCreateConfirmOpen] = useState(false);
  const [pendingVarietyCreate, setPendingVarietyCreate] = useState(null);
  const [varietyDetailEditMode, setVarietyDetailEditMode] = useState(false);
  const [varietyUpdateConfirmOpen, setVarietyUpdateConfirmOpen] = useState(false);
  const [pendingVarietyUpdate, setPendingVarietyUpdate] = useState(null);
  const [varietyCancelEditConfirmOpen, setVarietyCancelEditConfirmOpen] = useState(false);
  const [varietyRevertConfirmOpen, setVarietyRevertConfirmOpen] = useState(false);

  const varietyForm = useForm({
    resolver: zodResolver(varietySchema),
    defaultValues: {
      VarietyID: "",
      VarietyName: "",
      VarietyDescription: "",
    },
    mode: "onChange",
  });

  const varietyDetailForm = useForm({
    resolver: zodResolver(varietySchema),
    defaultValues: {
      VarietyID: "",
      VarietyName: "",
      VarietyDescription: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (tree) {
      setVarieties(tree.Varieties || []);
      if (tree.Varieties && tree.Varieties.length > 0) {
        setSelectedVarietyId(tree.Varieties[0].VarietyID);
      }
    }
  }, [tree]);

  const filteredVarieties = useMemo(() => {
    const term = varietySearch.trim().toLowerCase();
    if (!term) return varieties;
    return varieties.filter((v) => {
      const name = v.VarietyName?.toLowerCase() ?? "";
      const id = String(v.VarietyID ?? "");
      return name.includes(term) || id.includes(term);
    });
  }, [varieties, varietySearch]);

  const totalVarietyPages = Math.max(1, Math.ceil(filteredVarieties.length / VARIETY_PAGE_SIZE));
  const paginatedVarieties = useMemo(() => {
    const start = (varietyPage - 1) * VARIETY_PAGE_SIZE;
    return filteredVarieties.slice(start, start + VARIETY_PAGE_SIZE);
  }, [varietyPage, filteredVarieties]);

  const selectedVariety = useMemo(() => {
    return varieties.find((item) => item.VarietyID === selectedVarietyId) ?? null;
  }, [varieties, selectedVarietyId]);

  const mapVarietyToFormValues = (variety) =>
    variety
      ? {
          VarietyID: variety.VarietyID ?? "",
          VarietyName: variety.VarietyName ?? "",
          VarietyDescription: variety.VarietyDescription ?? "",
        }
      : {
          VarietyID: "",
          VarietyName: "",
          VarietyDescription: "",
        };

  const resetVarietyDetailToSelected = () => {
    if (selectedVariety) {
      varietyDetailForm.reset(mapVarietyToFormValues(selectedVariety));
    } else {
      varietyDetailForm.reset({
        VarietyID: "",
        VarietyName: "",
        VarietyDescription: "",
      });
    }
    setPendingVarietyUpdate(null);
    setVarietyUpdateConfirmOpen(false);
    setVarietyDetailEditMode(false);
  };

  const handlePrepareCreateVariety = (values) => {
    const trimmedName = values.VarietyName?.trim() ?? "";
    const duplicateVarietyName = varieties.some(
      (variety) => normalizeText(variety.VarietyName ?? "") === normalizeText(trimmedName),
    );

    if (duplicateVarietyName) {
      varietyForm.setError("VarietyName", {
        type: "manual",
        message: buildDuplicateMessage("Giống cây", trimmedName),
      });
      return;
    }

    setPendingVarietyCreate(values);
    setVarietyCreateConfirmOpen(true);
  };

  const handleCreateVariety = async (payloadOverride) => {
    const payload = payloadOverride ?? pendingVarietyCreate;
    if (!payload) return;
    setVarietySaving(true);
    try {
      const newVariety = {
        VarietyID: `VAR-${Date.now()}`,
        VarietyName: payload.VarietyName,
        VarietyDescription: payload.VarietyDescription || "",
      };
      const updatedVarieties = [...varieties, newVariety];
      setVarieties(updatedVarieties);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate({ ...tree, Varieties: updatedVarieties });
      }
      
      setSelectedVarietyId(newVariety.VarietyID);
      setCreateVarietyOverlayOpen(false);
      setVarietyCreateConfirmOpen(false);
      varietyForm.reset({
        VarietyID: "",
        VarietyName: "",
        VarietyDescription: "",
      });
      setPendingVarietyCreate(null);
    } finally {
      setVarietySaving(false);
    }
  };

  const handleSelectVariety = (varietyId) => {
    setPendingVarietyUpdate(null);
    setVarietyUpdateConfirmOpen(false);
    setVarietyDetailEditMode(false);
    setVarietyCancelEditConfirmOpen(false);
    setVarietyRevertConfirmOpen(false);
    setSelectedVarietyId(varietyId);
  };

  const handleStartEditVariety = () => {
    if (!selectedVariety) return;
    setVarietyDetailEditMode(true);
    setPendingVarietyUpdate(null);
    setVarietyUpdateConfirmOpen(false);
    varietyDetailForm.reset(mapVarietyToFormValues(selectedVariety));
  };

  const handleCancelVarietyEdit = () => {
    resetVarietyDetailToSelected();
  };

  const handlePrepareUpdateVariety = (values) => {
    const trimmedName = values.VarietyName?.trim() ?? "";
    const duplicateVarietyName = varieties.some(
      (variety) =>
        variety.VarietyID !== selectedVarietyId &&
        normalizeText(variety.VarietyName ?? "") === normalizeText(trimmedName),
    );

    if (duplicateVarietyName) {
      varietyDetailForm.setError("VarietyName", {
        type: "manual",
        message: buildDuplicateMessage("Giống cây", trimmedName),
      });
      return;
    }

    setPendingVarietyUpdate(values);
    setVarietyUpdateConfirmOpen(true);
  };

  const handleUpdateVariety = async (payloadOverride) => {
    const values = payloadOverride ?? pendingVarietyUpdate;
    if (!values || !selectedVarietyId) return;
    setVarietySaving(true);
    try {
      const updatedVarieties = varieties.map((v) =>
        v.VarietyID === selectedVarietyId
          ? { ...v, VarietyName: values.VarietyName, VarietyDescription: values.VarietyDescription }
          : v
      );
      setVarieties(updatedVarieties);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate({ ...tree, Varieties: updatedVarieties });
      }

      varietyDetailForm.reset(mapVarietyToFormValues(updatedVarieties.find(v => v.VarietyID === selectedVarietyId)));
      setPendingVarietyUpdate(null);
      setVarietyUpdateConfirmOpen(false);
      setVarietyDetailEditMode(false);
    } finally {
      setVarietySaving(false);
    }
  };

  const handleDeleteVariety = async () => {
    if (!selectedVarietyId) return;
    setVarietyDeleting(true);
    try {
      const updatedVarieties = varieties.filter((v) => v.VarietyID !== selectedVarietyId);
      setVarieties(updatedVarieties);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate({ ...tree, Varieties: updatedVarieties });
      }

      setSelectedVarietyId(updatedVarieties[0]?.VarietyID ?? null);
      setPendingVarietyUpdate(null);
      setVarietyUpdateConfirmOpen(false);
      setVarietyDeleteConfirmOpen(false);
      setVarietyCancelEditConfirmOpen(false);
      setVarietyRevertConfirmOpen(false);
      setVarietyDetailEditMode(false);
    } finally {
      setVarietyDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Quản lý giống cây: {tree?.treeTypeName || tree?.TreeTypeName}</DialogTitle>
            <DialogDescription>
              Thêm, sửa, xóa các giống cây cho loại cây này
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-[2fr_3fr] gap-6 mt-4">
            {/* Left: Variety List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Danh sách giống ({varieties.length})</h3>
                <Button size="sm" onClick={() => setCreateVarietyOverlayOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm
                </Button>
              </div>
              
              <Input
                placeholder="Tìm kiếm giống..."
                value={varietySearch}
                onChange={(e) => setVarietySearch(e.target.value)}
              />

              <ScrollArea className="h-[400px] border rounded-lg">
                {paginatedVarieties.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    Chưa có giống nào
                  </div>
                ) : (
                  <div className="divide-y">
                    {paginatedVarieties.map((variety, index) => (
                      <div
                        key={variety.VarietyID || index}
                        className={`p-4 cursor-pointer hover:bg-slate-50 transition ${
                          selectedVarietyId === variety.VarietyID ? "bg-emerald-50" : ""
                        }`}
                        onClick={() => handleSelectVariety(variety.VarietyID)}
                      >
                        <div className="font-medium">{variety.VarietyName}</div>
                        <div className="text-sm text-slate-500 line-clamp-1">
                          {variety.VarietyDescription || "Không có mô tả"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {totalVarietyPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    Trang {varietyPage} / {totalVarietyPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setVarietyPage((p) => Math.max(1, p - 1))}
                      disabled={varietyPage === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setVarietyPage((p) => Math.min(totalVarietyPages, p + 1))}
                      disabled={varietyPage === totalVarietyPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Variety Details */}
            <div className="border rounded-lg p-6">
              {selectedVariety ? (
                <Form {...varietyDetailForm}>
                  <form className="space-y-4" onSubmit={varietyDetailForm.handleSubmit(handlePrepareUpdateVariety)}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Chi tiết giống</h3>
                      <div className="flex gap-2">
                        {!varietyDetailEditMode ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleStartEditVariety}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => setVarietyDeleteConfirmOpen(true)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="submit"
                              size="sm"
                              disabled={varietySaving}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleCancelVarietyEdit}
                              disabled={varietySaving}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <FormField
                      control={varietyDetailForm.control}
                      name="VarietyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên giống</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!varietyDetailEditMode} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={varietyDetailForm.control}
                      name="VarietyDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả</FormLabel>
                          <FormControl>
                            <Textarea {...field} disabled={!varietyDetailEditMode} rows={6} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Chọn một giống để xem chi tiết
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Variety Dialog */}
      <Dialog open={createVarietyOverlayOpen} onOpenChange={setCreateVarietyOverlayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm giống mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin cho giống cây mới
            </DialogDescription>
          </DialogHeader>
          <Form {...varietyForm}>
            <form className="space-y-4" onSubmit={varietyForm.handleSubmit(handlePrepareCreateVariety)}>
              <FormField
                control={varietyForm.control}
                name="VarietyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên giống</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Giống A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={varietyForm.control}
                name="VarietyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả giống cây..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateVarietyOverlayOpen(false)}>
                  Đóng
                </Button>
                <Button type="submit" disabled={varietySaving}>
                  {varietySaving ? "Đang xử lý..." : "Tiếp tục"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <AlertDialog open={varietyCreateConfirmOpen} onOpenChange={setVarietyCreateConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thêm giống</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn chuẩn bị tạo giống <span className="font-semibold">{pendingVarietyCreate?.VarietyName}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={varietySaving}>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleCreateVariety()} disabled={varietySaving}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={varietyUpdateConfirmOpen} onOpenChange={setVarietyUpdateConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận cập nhật</AlertDialogTitle>
            <AlertDialogDescription>
              Cập nhật thông tin giống cây?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={varietySaving}>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleUpdateVariety()} disabled={varietySaving}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={varietyDeleteConfirmOpen} onOpenChange={setVarietyDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Xóa giống <span className="font-semibold">{selectedVariety?.VarietyName}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={varietyDeleting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteVariety} 
              disabled={varietyDeleting}
              className="bg-rose-600 hover:bg-rose-500"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
