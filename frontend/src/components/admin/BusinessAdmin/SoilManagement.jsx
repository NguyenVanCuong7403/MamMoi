import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Layers,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LivingBackground } from "@/components/background";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminSoilMasterRepository from "@/API/repositories/AdminSoilMasterRepository";

const BACKGROUND_PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const SOIL_PAGE_SIZE = 10;

const numberField = () =>
  z.preprocess((val) => {
    if (val === "" || val === null || typeof val === "undefined")
      return undefined;
    const parsed = Number(val);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, z.number().optional());

const normalizeText = (value = "") => value.trim().toLowerCase();

const buildDuplicateMessage = (entityLabel, value) =>
  `${entityLabel} "${value}" đã có trong hệ thống.`;

const mapSoilFromApi = (apiSoil) => {
  if (!apiSoil) return null;
  return {
    SoilMasterID: apiSoil.soilMasterId?.toString() || apiSoil.SoilMasterId?.toString() || "",
    SoilName: apiSoil.soilName || apiSoil.SoilName || "",
    Texture: apiSoil.texture || apiSoil.Texture || "",
    Drainage: apiSoil.drainage || apiSoil.Drainage || "",
    OrganicMatterPct: apiSoil.organicMatterPct || apiSoil.OrganicMatterPct,
    EC_dS_m: apiSoil.ecDSM || apiSoil.EcDSM || apiSoil.eC_dS_m,
    Notes: apiSoil.notes || apiSoil.Notes || "",
  };
};

const mapSoilToApi = (componentSoil) => {
  return {
    soilName: componentSoil.SoilName || componentSoil.soilName,
    texture: componentSoil.Texture || componentSoil.texture,
    drainage: componentSoil.Drainage || componentSoil.drainage,
    organicMatterPct: componentSoil.OrganicMatterPct || componentSoil.organicMatterPct,
    ecDSM: componentSoil.EC_dS_m || componentSoil.eC_dS_m || componentSoil.ecDSM,
    notes: componentSoil.Notes || componentSoil.notes,
  };
};

async function fetchSoils() {
  try {
    const response = await AdminSoilMasterRepository.getAllSoilMasters();
    const soils = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
    return soils.map(mapSoilFromApi).filter(soil => soil !== null);
  } catch (error) {
    console.warn("Error fetching soils, returning empty array:", error);
    return [];
  }
}

async function createSoil(payload) {
  try {
    const apiPayload = mapSoilToApi(payload);
    const response = await AdminSoilMasterRepository.createSoilMaster(apiPayload);
    return mapSoilFromApi(response);
  } catch (error) {
    console.error("Error creating soil:", error);
    throw error;
  }
}

async function updateSoil(soilId, payload) {
  try {
    const apiPayload = mapSoilToApi(payload);
    const id = parseInt(soilId);
    const response = await AdminSoilMasterRepository.updateSoilMaster(id, apiPayload);
    return mapSoilFromApi(response);
  } catch (error) {
    console.error("Error updating soil:", error);
    throw error;
  }
}

async function deleteSoil(soilId) {
  try {
    const id = parseInt(soilId);
    await AdminSoilMasterRepository.deleteSoilMaster(id);
    return { SoilMasterID: soilId };
  } catch (error) {
    console.error("Error deleting soil:", error);
    throw error;
  }
}

const soilFormSchema = z.object({
  SoilName: z.string().min(1, "Tên đất là bắt buộc"),
  Texture: z.string().optional(),
  Drainage: z.string().optional(),
  OrganicMatterPct: numberField(),
  EC_dS_m: numberField(),
  Notes: z.string().optional(),
});

const soilDefaultValues = {
  SoilName: "",
  Texture: "",
  Drainage: "",
  OrganicMatterPct: undefined,
  EC_dS_m: undefined,
  Notes: "",
};

const mapSoilToFormValues = (soil) =>
  soil
    ? {
        SoilName: soil.SoilName ?? "",
        Texture: soil.Texture ?? "",
        Drainage: soil.Drainage ?? "",
        OrganicMatterPct: soil.OrganicMatterPct ?? undefined,
        EC_dS_m: soil.EC_dS_m ?? undefined,
        Notes: soil.Notes ?? "",
      }
    : soilDefaultValues;

export default function SoilManagement() {
  const [soils, setSoils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soilSearch, setSoilSearch] = useState("");
  const [soilPage, setSoilPage] = useState(1);
  const [selectedSoilId, setSelectedSoilId] = useState(null);
  const [soilDetailEditMode, setSoilDetailEditMode] = useState(false);
  const [soilDetailSaving, setSoilDetailSaving] = useState(false);
  const [soilDeleting, setSoilDeleting] = useState(false);
  const [soilDeleteConfirmOpen, setSoilDeleteConfirmOpen] = useState(false);
  const [soilUpdateConfirmOpen, setSoilUpdateConfirmOpen] = useState(false);
  const [pendingSoilUpdate, setPendingSoilUpdate] = useState(null);
  const [soilCancelConfirmOpen, setSoilCancelConfirmOpen] = useState(false);
  const [soilRevertConfirmOpen, setSoilRevertConfirmOpen] = useState(false);
  const [createSoilOverlayOpen, setCreateSoilOverlayOpen] = useState(false);
  const [soilCreateConfirmOpen, setSoilCreateConfirmOpen] = useState(false);
  const [pendingSoilCreate, setPendingSoilCreate] = useState(null);
  const [soilSaving, setSoilSaving] = useState(false);
  const [endpointError, setEndpointError] = useState(null);

  const soilForm = useForm({
    resolver: zodResolver(soilFormSchema),
    defaultValues: soilDefaultValues,
    mode: "onChange",
  });

  const soilDetailForm = useForm({
    resolver: zodResolver(soilFormSchema),
    defaultValues: soilDefaultValues,
    mode: "onChange",
  });

  const selectedSoil = useMemo(
    () => soils.find((soil) => soil.SoilMasterID === selectedSoilId) ?? null,
    [selectedSoilId, soils]
  );

  const filteredSoils = useMemo(() => {
    const term = soilSearch.trim().toLowerCase();
    if (!term) return soils;
    return soils.filter((soil) => {
      const name = soil.SoilName?.toLowerCase() ?? "";
      const id = soil.SoilMasterID?.toLowerCase() ?? "";
      return name.includes(term) || id.includes(term);
    });
  }, [soils, soilSearch]);

  const totalSoilPages = Math.max(
    1,
    Math.ceil(filteredSoils.length / SOIL_PAGE_SIZE)
  );

  const paginatedSoils = useMemo(() => {
    const start = (soilPage - 1) * SOIL_PAGE_SIZE;
    return filteredSoils.slice(start, start + SOIL_PAGE_SIZE);
  }, [soilPage, filteredSoils]);

  const soilRangeStart = filteredSoils.length
    ? (soilPage - 1) * SOIL_PAGE_SIZE + 1
    : 0;
  const soilRangeEnd = filteredSoils.length
    ? Math.min(filteredSoils.length, soilRangeStart + paginatedSoils.length - 1)
    : 0;
  const shouldShowSoilPagination = filteredSoils.length > SOIL_PAGE_SIZE;

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setEndpointError(null);
    try {
      const soilData = await fetchSoils();
      setSoils(soilData || []);
      setSoilPage(1);
      // Check if endpoint is not implemented
      const response = await AdminSoilMasterRepository.getAllSoilMasters();
      if (response && response.success === false && response.message?.includes("not implemented")) {
        setEndpointError("Tính năng quản lý loại đất chưa được triển khai ở backend. Vui lòng liên hệ quản trị viên.");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setSoils([]);
      if (error.message?.includes("not implemented") || error.status === 404) {
        setEndpointError("Tính năng quản lý loại đất chưa được triển khai ở backend. Vui lòng liên hệ quản trị viên.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredSoils.length / SOIL_PAGE_SIZE)
    );
    setSoilPage((prev) => Math.min(prev, totalPages));
  }, [filteredSoils]);

  useEffect(() => {
    if (filteredSoils.length === 0) {
      if (selectedSoilId !== null) {
        setSelectedSoilId(null);
      }
      return;
    }
    const stillExists = selectedSoilId
      ? filteredSoils.some((soil) => soil.SoilMasterID === selectedSoilId)
      : false;
    if (!stillExists || !selectedSoilId) {
      setSelectedSoilId(filteredSoils[0]?.SoilMasterID ?? null);
    }
  }, [filteredSoils, selectedSoilId]);

  useEffect(() => {
    setPendingSoilUpdate(null);
    setSoilUpdateConfirmOpen(false);
    setSoilDetailEditMode(false);
    soilDetailForm.reset(mapSoilToFormValues(selectedSoil));
  }, [selectedSoil, soilDetailForm]);

  useEffect(() => {
    if (createSoilOverlayOpen) return;
    setPendingSoilCreate(null);
    setSoilCreateConfirmOpen(false);
    soilForm.reset(soilDefaultValues);
  }, [createSoilOverlayOpen, soilForm]);

  const handlePrepareCreateSoil = (values) => {
    const trimmedName = values.SoilName?.trim() ?? "";
    const duplicateSoilName = soils.some(
      (soil) =>
        normalizeText(soil.SoilName ?? "") === normalizeText(trimmedName)
    );

    if (duplicateSoilName) {
      soilForm.setError("SoilName", {
        type: "manual",
        message: buildDuplicateMessage("Loại đất", trimmedName),
      });
      return;
    }

    setPendingSoilCreate(values);
    setSoilCreateConfirmOpen(true);
  };

  const handleCreateSoil = async (payloadOverride) => {
    const payload = payloadOverride ?? pendingSoilCreate;
    if (!payload) return;
    setSoilSaving(true);
    try {
      const created = await createSoil(payload);
      if (created) {
        setSoils((prev) => [
          created,
          ...prev.filter((soil) => soil.SoilMasterID !== created.SoilMasterID),
        ]);
        setSoilPage(1);
        setCreateSoilOverlayOpen(false);
        setSoilCreateConfirmOpen(false);
        setSelectedSoilId(created.SoilMasterID);
        soilForm.reset(soilDefaultValues);
        setPendingSoilCreate(null);
        setEndpointError(null); // Clear any previous errors
      }
    } catch (error) {
      console.error("Error creating soil:", error);
      // Show user-friendly error message
      const errorMessage = error.message || "Không thể tạo loại đất. Vui lòng thử lại sau.";
      alert(errorMessage);
      throw error;
    } finally {
      setSoilSaving(false);
    }
  };

  const handleSelectSoil = (soilId) => {
    setPendingSoilUpdate(null);
    setSoilUpdateConfirmOpen(false);
    setSoilDetailEditMode(false);
    setSoilCancelConfirmOpen(false);
    setSoilRevertConfirmOpen(false);
    setSelectedSoilId(soilId);
  };

  const handleStartEditSoil = () => {
    if (!selectedSoil) return;
    setSoilDetailEditMode(true);
    setPendingSoilUpdate(null);
    setSoilUpdateConfirmOpen(false);
    soilDetailForm.reset(mapSoilToFormValues(selectedSoil));
  };

  const handleCancelSoilEdit = () => {
    soilDetailForm.reset(mapSoilToFormValues(selectedSoil));
    setPendingSoilUpdate(null);
    setSoilUpdateConfirmOpen(false);
    setSoilDetailEditMode(false);
    setSoilCancelConfirmOpen(false);
  };

  const handleRevertSoilEdit = () => {
    if (!selectedSoil) return;
    soilDetailForm.reset(mapSoilToFormValues(selectedSoil));
    setPendingSoilUpdate(null);
    setSoilUpdateConfirmOpen(false);
    setSoilRevertConfirmOpen(false);
  };

  const handlePrepareUpdateSoil = (values) => {
    if (!selectedSoilId) return;

    const trimmedName = values.SoilName?.trim() ?? "";
    const duplicateSoilName = soils.some(
      (soil) =>
        soil.SoilMasterID !== selectedSoilId &&
        normalizeText(soil.SoilName ?? "") === normalizeText(trimmedName)
    );

    if (duplicateSoilName) {
      soilDetailForm.setError("SoilName", {
        type: "manual",
        message: buildDuplicateMessage("Loại đất", trimmedName),
      });
      return;
    }

    setPendingSoilUpdate(values);
    setSoilUpdateConfirmOpen(true);
  };

  const handleUpdateSoil = async (valuesOverride) => {
    const values = valuesOverride ?? pendingSoilUpdate;
    if (!selectedSoilId || !values) return;

    const trimmedName = values.SoilName?.trim() ?? "";
    const duplicateSoilName = soils.some(
      (soil) =>
        soil.SoilMasterID !== selectedSoilId &&
        normalizeText(soil.SoilName ?? "") === normalizeText(trimmedName)
    );

    if (duplicateSoilName) {
      soilDetailForm.setError("SoilName", {
        type: "manual",
        message: buildDuplicateMessage("Loại đất", trimmedName),
      });
      setPendingSoilUpdate(null);
      setSoilUpdateConfirmOpen(false);
      return;
    }

    setSoilDetailSaving(true);
    try {
      const updated = await updateSoil(selectedSoilId, values);
      setSoils((prev) =>
        prev.map((soil) =>
          soil.SoilMasterID === updated.SoilMasterID ? updated : soil
        )
      );
      soilDetailForm.reset(mapSoilToFormValues(updated));
      setPendingSoilUpdate(null);
      setSoilUpdateConfirmOpen(false);
      setSoilDetailEditMode(false);
      setEndpointError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error updating soil:", error);
      // Show user-friendly error message
      const errorMessage = error.message || "Không thể cập nhật loại đất. Vui lòng thử lại sau.";
      alert(errorMessage);
      throw error;
    } finally {
      setSoilDetailSaving(false);
    }
  };

  const handleDeleteSoil = async () => {
    if (!selectedSoilId) return;
    setSoilDeleting(true);
    try {
      await deleteSoil(selectedSoilId);
      setSoils((prev) => {
        const next = prev.filter(
          (soil) => soil.SoilMasterID !== selectedSoilId
        );
        setSelectedSoilId(next[0]?.SoilMasterID ?? null);
        return next;
      });
      setPendingSoilUpdate(null);
      setSoilUpdateConfirmOpen(false);
      setSoilDeleteConfirmOpen(false);
      setSoilCancelConfirmOpen(false);
      setSoilRevertConfirmOpen(false);
      setSoilDetailEditMode(false);
      setEndpointError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error deleting soil:", error);
      // Show user-friendly error message
      const errorMessage = error.message || "Không thể xóa loại đất. Vui lòng thử lại sau.";
      alert(errorMessage);
      // Don't close dialog on error so user can see the message
      setSoilDeleting(false);
      return;
    } finally {
      setSoilDeleting(false);
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
        density={24}
      />
      <div className="relative z-10 min-h-screen">
        <AdminLayout>
          <div className="flex h-full min-h-full w-full flex-1 flex-col gap-6 px-4 py-8 text-[15px] leading-relaxed sm:px-6 sm:text-base lg:px-12">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-emerald-200">
                  <Layers className="h-4 w-4" />
                  Business Admin
                </p>
                <h1 className="mt-2 text-4xl font-bold text-white">
                  Quản lý loại đất
                </h1>
                <p className="text-base text-white/80">
                  Quản lý các loại đất (SoilMaster) trong hệ thống, bao gồm thông tin về thành phần, khả năng thoát nước, độ hữu cơ và độ mặn.
                </p>
                {endpointError && (
                  <div className="mt-4 rounded-xl border border-amber-500/50 bg-amber-50/90 p-4 text-sm text-amber-900 shadow-lg">
                    <p className="font-semibold">⚠️ Thông báo</p>
                    <p>{endpointError}</p>
                  </div>
                )}
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto">
                <div className="relative w-full min-w-[220px] sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                  <Input
                    value={soilSearch}
                    onChange={(e) => setSoilSearch(e.target.value)}
                    placeholder="Tìm kiếm loại đất..."
                    className="h-12 rounded-xl border-white/40 bg-white/10 pl-10 text-white placeholder:text-white/70 focus-visible:border-white focus-visible:bg-white focus-visible:text-slate-900 focus-visible:ring-emerald-200"
                  />
                </div>
                <Button
                  onClick={() => setCreateSoilOverlayOpen(true)}
                  className="gap-2 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
                >
                  <Plus className="h-4 w-4" />
                  Thêm loại đất
                </Button>
              </div>
            </div>

            <section className="flex flex-1 min-h-0 flex-col">
              {loading ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
                  <div className="space-y-3">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <ScrollArea className="max-h-[600px] overflow-visible pr-2">
                        <div className="grid gap-2">
                          {soils.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-emerald-200/60 bg-white/80 px-4 py-6 text-center text-sm text-slate-500">
                              <Layers className="h-5 w-5 text-emerald-300" />
                              Chưa có loại đất nào. Bấm &quot;Thêm loại đất&quot; để bắt đầu.
                            </div>
                          ) : filteredSoils.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-emerald-200/60 bg-white/80 px-4 py-6 text-center text-sm text-slate-500">
                              <Search className="h-5 w-5 text-emerald-300" />
                              Không tìm thấy loại đất phù hợp với từ khoá.
                            </div>
                          ) : (
                            paginatedSoils.map((soil, index) => {
                              const isActive = selectedSoilId === soil.SoilMasterID;
                              const absoluteIndex = soilRangeStart + index;
                              return (
                                <div
                                  key={soil.SoilMasterID}
                                  className={cn(
                                    "group relative flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                                    isActive
                                      ? "border-emerald-500 shadow-sm shadow-emerald-100"
                                      : "border-slate-200 hover:border-emerald-200"
                                  )}
                                  onClick={() => handleSelectSoil(soil.SoilMasterID)}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                      event.preventDefault();
                                      handleSelectSoil(soil.SoilMasterID);
                                    }
                                  }}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <div className="min-w-0 space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                                      #{absoluteIndex}
                                    </p>
                                    <p className="text-sm font-semibold leading-snug text-slate-900 line-clamp-2">
                                      {soil.SoilName}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {soil.SoilMasterID}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                                      isActive
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                        : "border-slate-300 bg-white text-slate-600"
                                    )}
                                  >
                                    {isActive ? "Đang chọn" : "Chọn"}
                                  </Badge>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </ScrollArea>
                      {filteredSoils.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center justify-end gap-3 text-xs text-slate-500">
                          {shouldShowSoilPagination && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-full px-3 text-xs"
                                onClick={() =>
                                  setSoilPage((prev) => Math.max(1, prev - 1))
                                }
                                disabled={soilPage === 1}
                              >
                                Trước
                              </Button>
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                Trang {soilPage}/{totalSoilPages}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-full px-3 text-xs"
                                onClick={() =>
                                  setSoilPage((prev) =>
                                    Math.min(totalSoilPages, prev + 1)
                                  )
                                }
                                disabled={soilPage === totalSoilPages}
                              >
                                Sau
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg">
                    {selectedSoil ? (
                      <>
                        <div className="mb-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {selectedSoil.SoilMasterID}
                          </p>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {selectedSoil.SoilName}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Cập nhật thông tin chi tiết cho loại đất này.
                          </p>
                        </div>
                        <Form {...soilDetailForm}>
                          <form
                            className="space-y-4"
                            onSubmit={soilDetailForm.handleSubmit(
                              handlePrepareUpdateSoil
                            )}
                          >
                            <FormField
                              control={soilDetailForm.control}
                              name="SoilName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tên đất</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ví dụ: Đất phù sa ngọt"
                                      disabled={
                                        !soilDetailEditMode || soilDetailSaving
                                      }
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                              <FormField
                                control={soilDetailForm.control}
                                name="Texture"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Thành phần</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Thịt nhẹ, cát pha..."
                                        disabled={
                                          !soilDetailEditMode || soilDetailSaving
                                        }
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={soilDetailForm.control}
                                name="Drainage"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Khả năng thoát nước</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Tốt/Trung bình/Kém"
                                        disabled={
                                          !soilDetailEditMode || soilDetailSaving
                                        }
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <FormField
                                control={soilDetailForm.control}
                                name="OrganicMatterPct"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Hữu cơ (%)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.1"
                                        disabled={
                                          !soilDetailEditMode || soilDetailSaving
                                        }
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                        placeholder="Ví dụ: 2.5"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={soilDetailForm.control}
                                name="EC_dS_m"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Độ mặn EC (dS/m)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.1"
                                        disabled={
                                          !soilDetailEditMode || soilDetailSaving
                                        }
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                        placeholder="Ví dụ: 1.2"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={soilDetailForm.control}
                              name="Notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ghi chú</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Ghi chú thêm..."
                                      disabled={
                                        !soilDetailEditMode || soilDetailSaving
                                      }
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {soilDetailEditMode ? (
                              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={soilDetailSaving}
                                  onClick={() => setSoilRevertConfirmOpen(true)}
                                >
                                  Hoàn tác
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  disabled={soilDetailSaving}
                                  onClick={() => setSoilCancelConfirmOpen(true)}
                                >
                                  Huỷ
                                </Button>
                                <Button type="submit" disabled={soilDetailSaving}>
                                  {soilDetailSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                                <Button
                                  type="button"
                                  onClick={handleStartEditSoil}
                                  disabled={!selectedSoil}
                                >
                                  Chỉnh sửa
                                </Button>
                              </div>
                            )}
                          </form>
                        </Form>
                        <Separator className="my-4" />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          onClick={() => setSoilDeleteConfirmOpen(true)}
                          disabled={soilDeleting}
                        >
                          Xoá đất
                        </Button>
                      </>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center text-slate-500">
                        <Layers className="h-8 w-8 text-slate-300" />
                        Chọn một loại đất ở danh sách bên trái để xem chi tiết.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Create Soil Dialog */}
            <Dialog
              open={createSoilOverlayOpen}
              onOpenChange={(open) => {
                if (soilSaving) return;
                setCreateSoilOverlayOpen(open);
                if (!open) {
                  setSoilCreateConfirmOpen(false);
                  setPendingSoilCreate(null);
                }
              }}
            >
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Thêm loại đất mới</DialogTitle>
                  <DialogDescription>
                    Điền thông tin SoilMaster mới. Bạn sẽ cần xác nhận trước khi lưu.
                  </DialogDescription>
                </DialogHeader>
                <Form {...soilForm}>
                  <form
                    className="space-y-4"
                    onSubmit={soilForm.handleSubmit(handlePrepareCreateSoil)}
                  >
                    <FormField
                      control={soilForm.control}
                      name="SoilName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên đất</FormLabel>
                          <FormControl>
                            <Input placeholder="Ví dụ: Đất phù sa ngọt" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={soilForm.control}
                        name="Texture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thành phần</FormLabel>
                            <FormControl>
                              <Input placeholder="Thịt nhẹ, cát pha..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={soilForm.control}
                        name="Drainage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Khả năng thoát nước</FormLabel>
                            <FormControl>
                              <Input placeholder="Tốt/Trung bình/Kém" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={soilForm.control}
                        name="OrganicMatterPct"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hữu cơ (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder="Ví dụ: 2.5"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={soilForm.control}
                        name="EC_dS_m"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Độ mặn EC (dS/m)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                placeholder="Ví dụ: 1.2"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={soilForm.control}
                      name="Notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ghi chú</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Ghi chú thêm..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateSoilOverlayOpen(false)}
                      >
                        Đóng
                      </Button>
                      <Button type="submit" disabled={soilSaving}>
                        {soilSaving ? "Đang xử lý..." : "Tiếp tục"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <AlertDialog
              open={soilCreateConfirmOpen}
              onOpenChange={(open) => {
                if (soilSaving) return;
                setSoilCreateConfirmOpen(open);
                if (!open && !soilSaving) {
                  setPendingSoilCreate(null);
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận thêm loại đất</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn chuẩn bị tạo loại đất&nbsp;
                    <span className="font-semibold text-slate-900">
                      {pendingSoilCreate?.SoilName || "mới"}
                    </span>
                    . Hãy xác nhận để hoàn tất thao tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={soilSaving}>Huỷ</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleCreateSoil(pendingSoilCreate)}
                    disabled={soilSaving}
                  >
                    {soilSaving ? "Đang lưu..." : "Xác nhận"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Update Confirmation Dialog */}
            <AlertDialog
              open={soilUpdateConfirmOpen}
              onOpenChange={(open) => {
                if (soilDetailSaving) return;
                setSoilUpdateConfirmOpen(open);
                if (!open) {
                  setPendingSoilUpdate(null);
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận lưu thay đổi</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc muốn cập nhật thông tin loại đất{" "}
                    <span className="font-semibold text-slate-900">
                      {pendingSoilUpdate?.SoilName ||
                        selectedSoil?.SoilName ||
                        "đang chọn"}
                    </span>
                    ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={soilDetailSaving}>
                    Huỷ
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleUpdateSoil(pendingSoilUpdate)}
                    disabled={soilDetailSaving}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    {soilDetailSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
              open={soilDeleteConfirmOpen}
              onOpenChange={(open) => {
                if (!soilDeleting) {
                  setSoilDeleteConfirmOpen(open);
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xoá loại đất</AlertDialogTitle>
                  <AlertDialogDescription>
                    Thao tác này sẽ xoá vĩnh viễn{" "}
                    {selectedSoil?.SoilName ?? "loại đất"} khỏi danh sách và không
                    thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={soilDeleting}>Huỷ</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-rose-600 hover:bg-rose-500"
                    onClick={handleDeleteSoil}
                    disabled={soilDeleting}
                  >
                    {soilDeleting ? "Đang xoá..." : "Xoá đất"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Cancel Edit Confirmation Dialog */}
            <AlertDialog
              open={soilCancelConfirmOpen}
              onOpenChange={(open) => {
                if (soilDetailSaving) return;
                setSoilCancelConfirmOpen(open);
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Huỷ chỉnh sửa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn sẽ thoát chế độ chỉnh sửa và mọi thay đổi chưa lưu sẽ bị bỏ.
                    Chắc chắn muốn huỷ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={soilDetailSaving}>
                    Tiếp tục chỉnh sửa
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelSoilEdit}
                    disabled={soilDetailSaving}
                    className="bg-rose-600 hover:bg-rose-500"
                  >
                    Huỷ chỉnh sửa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Revert Confirmation Dialog */}
            <AlertDialog
              open={soilRevertConfirmOpen}
              onOpenChange={(open) => {
                if (soilDetailSaving) return;
                setSoilRevertConfirmOpen(open);
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận hoàn tác</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hoàn tác sẽ đưa tất cả trường về dữ liệu hiện tại của loại
                    đất&nbsp;
                    <span className="font-semibold text-slate-900">
                      {selectedSoil?.SoilName || "đang chọn"}
                    </span>
                    . Tiếp tục?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={soilDetailSaving}>
                    Huỷ
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRevertSoilEdit}
                    disabled={soilDetailSaving}
                  >
                    Đồng ý
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </AdminLayout>
      </div>
    </>
  );
}

