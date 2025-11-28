import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  RefreshCcw,
  Save,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import AdminLayout from "../layout/AdminLayout";
import { LivingBackground } from "@/components/background";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LifecycleWidget from "@/components/user/LifecycleWidget";
import AdminTreeRepository from "@/API/repositories/AdminTreeRepository";
import {
  DEFAULT_PHASE_THEME,
  getOrderedPhases,
  LIFECYCLE_COLOR_OPTIONS,
  LIFECYCLE_LINE_STYLES,
  normalizeLifecycleTheme,
  PHASE_IDS,
  serializeLifecycleTheme,
} from "@/lib/lifecycleTheme";

const BACKGROUND_PALETTE = {
  bg: "#0f172a",
  leaf: "#bbf7d0",
  ivory: "#f8fafc",
  accent: "#c4b5fd",
};

const parseTreeTypeList = (payload) => {
  const root = payload?.data ?? payload;
  const listCandidates = [
    root?.data,
    root?.Data,
    root?.items,
    root?.Items,
    Array.isArray(root) ? root : null,
  ];
  const list =
    listCandidates.find((candidate) => Array.isArray(candidate)) ?? [];
  return list
    .map((item) => {
      const id = item.treeTypeId ?? item.TreeTypeId ?? item.TreeTypeID;
      if (!id) return null;
      return {
        id,
        name: item.treeTypeName || item.TreeTypeName || "—",
        scientificName: item.scientificName || item.ScientificName || "",
      };
    })
    .filter(Boolean);
};

const buildPhaseRowsFromSource = (source) => {
  const normalized = normalizeLifecycleTheme(source);
  const phaseMap = PHASE_IDS.reduce((acc, phaseId, index) => {
    const base = DEFAULT_PHASE_THEME[phaseId] || {};
    const override = normalized[phaseId] || {};
    const colorKey = (override.colorKey || base.colorKey || "emerald")
      .toString()
      .toLowerCase();
    const lineColorKey = (
      override.lineColorKey ||
      override.colorKey ||
      base.lineColorKey ||
      base.colorKey ||
      "emerald"
    )
      .toString()
      .toLowerCase();
    acc[phaseId] = {
      phaseId,
      label: override.label || base.label,
      subtitle: override.subtitle || "",
      description: override.description || "",
      icon: override.icon || base.icon,
      colorKey,
      lineColorKey,
      lineStyle: override.lineStyle || base.lineStyle || "solid",
      durationMs: override.durationMs || base.durationMs || 1150,
      order: typeof override.order === "number" ? override.order : index,
    };
    return acc;
  }, {});

  return getOrderedPhases(phaseMap).map((phase, idx) => ({
    id: `${phase.phaseId}-${idx}`,
    phaseId: phase.phaseId,
    label: phase.label,
    subtitle: phase.subtitle || "",
    description: phase.description || "",
    icon: phase.icon || DEFAULT_PHASE_THEME[phase.phaseId]?.icon || "🌱",
    colorKey:
      phase.colorKey ||
      DEFAULT_PHASE_THEME[phase.phaseId]?.colorKey ||
      "emerald",
    lineColorKey:
      phase.lineColorKey ||
      phase.colorKey ||
      DEFAULT_PHASE_THEME[phase.phaseId]?.colorKey ||
      "emerald",
    lineStyle: phase.lineStyle || "solid",
    durationMs: phase.durationMs || 1150,
    order: typeof phase.order === "number" ? phase.order : idx,
  }));
};

const createPhaseRowFromId = (phaseId, order) => {
  const base = DEFAULT_PHASE_THEME[phaseId] || {};
  return {
    id: `${phaseId}-${Date.now()}`,
    phaseId,
    label: base.label || phaseId,
    subtitle: "",
    description: "",
    icon: base.icon || "🌿",
    colorKey: base.colorKey || "emerald",
    lineColorKey: base.lineColorKey || base.colorKey || "emerald",
    lineStyle: base.lineStyle || "solid",
    durationMs: base.durationMs || 1150,
    order,
  };
};

export default function BusinessAdminLifecycleProcessManagement() {
  const [treeTypes, setTreeTypes] = useState([]);
  const [treeTypesLoading, setTreeTypesLoading] = useState(true);
  const [treeTypesError, setTreeTypesError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTreeTypeId, setSelectedTreeTypeId] = useState(null);
  const [selectedTreeType, setSelectedTreeType] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [phaseRows, setPhaseRows] = useState(() =>
    buildPhaseRowsFromSource(null)
  );
  const [initialSerialized, setInitialSerialized] = useState(
    serializeLifecycleTheme(buildPhaseRowsFromSource(null))
  );
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingAddPhase, setPendingAddPhase] = useState("");
  const [editingPhaseId, setEditingPhaseId] = useState(null);

  const handleSelectTreeType = useCallback(async (treeTypeId) => {
    if (!treeTypeId) return;
    setSelectedTreeTypeId(treeTypeId);
    setDetailLoading(true);
    setNotice(null);
    try {
      const detail = await AdminTreeRepository.getTreeTypeById(treeTypeId);
      setSelectedTreeType(detail);
      const rows = buildPhaseRowsFromSource(detail?.seasonalRoadmap);
      setPhaseRows(rows);
      setInitialSerialized(serializeLifecycleTheme(rows));
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Không thể tải chi tiết loại cây.",
      });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchTreeTypes = async () => {
      setTreeTypesLoading(true);
      setTreeTypesError(null);
      try {
        const response = await AdminTreeRepository.getAllTreeTypes(1, 100);
        const parsed = parseTreeTypeList(response);
        setTreeTypes(parsed);
        if (parsed.length && !selectedTreeTypeId) {
          handleSelectTreeType(parsed[0].id);
        }
      } catch (err) {
        setTreeTypesError(err.message || "Không thể tải danh sách loại cây.");
      } finally {
        setTreeTypesLoading(false);
      }
    };
    fetchTreeTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedPhaseRows = useMemo(
    () => [...phaseRows].sort((a, b) => a.order - b.order),
    [phaseRows]
  );

  const serializedCurrent = useMemo(
    () => serializeLifecycleTheme(sortedPhaseRows),
    [sortedPhaseRows]
  );

  const isDirty = useMemo(() => {
    if (!selectedTreeTypeId) return false;
    return serializedCurrent !== initialSerialized;
  }, [serializedCurrent, initialSerialized, selectedTreeTypeId]);

  const filteredTreeTypes = useMemo(() => {
    if (!searchTerm.trim()) return treeTypes;
    const keyword = searchTerm.trim().toLowerCase();
    return treeTypes.filter(
      (type) =>
        type.name.toLowerCase().includes(keyword) ||
        type.scientificName.toLowerCase().includes(keyword)
    );
  }, [treeTypes, searchTerm]);

  const handleFieldChange = (phaseId, field, value) => {
    setPhaseRows((prev) =>
      prev.map((phase) =>
        phase.phaseId === phaseId
          ? {
              ...phase,
              [field]:
                field === "order" || field === "durationMs"
                  ? Number(value)
                  : value,
            }
          : phase
      )
    );
  };

  const handleNodeReorder = useCallback((phaseId, targetIdx) => {
    if (typeof targetIdx !== "number") return;
    setPhaseRows((prev) => {
      const ordered = [...prev].sort((a, b) => a.order - b.order);
      const foundation = ordered.find(
        (phase) => phase.phaseId === "growth_development"
      );
      const cycles = ordered.filter(
        (phase) => phase.phaseId !== "growth_development"
      );
      if (!cycles.length) return prev;
      const fromIdx = cycles.findIndex((phase) => phase.phaseId === phaseId);
      if (fromIdx === -1) return prev;
      const clampedIdx = Math.min(
        Math.max(targetIdx, 0),
        Math.max(cycles.length - 1, 0)
      );
      if (fromIdx === clampedIdx) return prev;
      const updatedCycles = [...cycles];
      const [moving] = updatedCycles.splice(fromIdx, 1);
      updatedCycles.splice(clampedIdx, 0, moving);
      const merged = foundation
        ? [foundation, ...updatedCycles]
        : updatedCycles;
      return merged.map((phase, index) => ({ ...phase, order: index }));
    });
  }, []);

  const handlePhaseNodeClick = useCallback((phaseId) => {
    setEditingPhaseId(phaseId);
  }, []);

  const handleResetToOriginal = () => {
    if (!initialSerialized) return;
    setPhaseRows(buildPhaseRowsFromSource(initialSerialized));
  };

  const handleResetToDefault = () => {
    setPhaseRows(buildPhaseRowsFromSource(null));
  };

  const missingPhaseIds = useMemo(
    () =>
      PHASE_IDS.filter(
        (id) => !phaseRows.some((phase) => phase.phaseId === id)
      ),
    [phaseRows]
  );

  const editingPhase = useMemo(
    () => phaseRows.find((phase) => phase.phaseId === editingPhaseId) || null,
    [phaseRows, editingPhaseId]
  );
  const editingPhaseOrder = useMemo(() => {
    if (!editingPhase) return null;
    const idx = sortedPhaseRows.findIndex(
      (phase) => phase.phaseId === editingPhase.phaseId
    );
    return idx >= 0 ? idx + 1 : null;
  }, [editingPhase, sortedPhaseRows]);
  const editingPhaseIsBase =
    editingPhase?.phaseId === "growth_development" || false;
  const isEditDialogOpen = Boolean(editingPhase);

  const handleAddPhase = () => {
    const targetId = pendingAddPhase || missingPhaseIds[0];
    if (!targetId) return;
    let createdPhase = null;
    setPhaseRows((prev) => {
      const nextOrder =
        prev.length > 0 ? Math.max(...prev.map((phase) => phase.order)) + 1 : 0;
      createdPhase = createPhaseRowFromId(targetId, nextOrder);
      return [...prev, createdPhase];
    });
    setPendingAddPhase("");
    if (createdPhase) {
      setEditingPhaseId(createdPhase.phaseId);
    }
  };

  const handleRemovePhase = (phaseId) => {
    if (phaseId === "growth_development") {
      setNotice({
        type: "error",
        message: "Không thể xoá giai đoạn Sinh trưởng & Phát triển.",
      });
      return;
    }
    const cycleCount = phaseRows.filter(
      (phase) => phase.phaseId !== "growth_development"
    ).length;
    if (cycleCount <= 1) {
      setNotice({
        type: "error",
        message: "Phải còn ít nhất một giai đoạn chu kỳ.",
      });
      return;
    }
    setPhaseRows((prev) => prev.filter((phase) => phase.phaseId !== phaseId));
  };

  const handleCloseDialog = useCallback(() => {
    setEditingPhaseId(null);
  }, []);

  const handleSave = async () => {
    if (!selectedTreeTypeId) return;
    setSaving(true);
    setNotice(null);
    try {
      await AdminTreeRepository.updateTreeType(selectedTreeTypeId, {
        seasonalRoadmap: serializedCurrent,
      });
      setInitialSerialized(serializedCurrent);
      setNotice({
        type: "success",
        message: "Đã lưu quy trình tăng trưởng cho loại cây.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Không thể lưu cấu hình quy trình.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <LivingBackground palette={BACKGROUND_PALETTE} dotsOpacity={0.15} />
      <div className="relative z-10 flex flex-col gap-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
            Quy trình
          </p>
          <h1 className="text-3xl font-bold text-white">
            Tuỳ chỉnh vòng đời & hoạt ảnh cây trồng
          </h1>
          <p className="text-sm text-emerald-50/80 max-w-3xl">
            Thiết lập tên giai đoạn, icon, màu sắc và thứ tự đường chạy để đồng
            bộ với widget vòng đời đang hiển thị cho người dùng cuối. Mỗi loại
            cây có thể ghi đè cấu hình riêng.
          </p>
        </header>

        {notice && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {notice.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{notice.message}</span>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="mb-4">
              <p className="text-sm font-semibold text-white">Loại cây</p>
              <p className="text-xs text-emerald-100/80">
                Chọn loại cây để chỉnh sửa quy trình vòng đời.
              </p>
            </div>
            <div className="space-y-3">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên hoặc tên khoa học..."
                className="bg-white/90 text-sm"
              />
              <div className="max-h-[60vh] overflow-y-auto pr-1">
                {treeTypesLoading && (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="h-16 animate-pulse rounded-2xl bg-white/20"
                      />
                    ))}
                  </div>
                )}
                {!treeTypesLoading && treeTypesError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {treeTypesError}
                  </div>
                )}
                {!treeTypesLoading &&
                  !treeTypesError &&
                  filteredTreeTypes.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/30 px-3 py-4 text-center text-xs text-white/70">
                      Không tìm thấy loại cây phù hợp.
                    </div>
                  )}
                {!treeTypesLoading &&
                  filteredTreeTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleSelectTreeType(type.id)}
                      className={`mb-2 w-full rounded-2xl border px-3 py-2 text-left transition ${
                        selectedTreeTypeId === type.id
                          ? "border-emerald-300 bg-emerald-50/90 text-emerald-900 shadow"
                          : "border-white/20 bg-white/10 text-white hover:border-emerald-200/40"
                      }`}
                    >
                      <p className="text-sm font-semibold">{type.name}</p>
                      {type.scientificName && (
                        <p className="text-xs text-white/70 italic">
                          {type.scientificName}
                        </p>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </aside>

          <section className="space-y-6 rounded-3xl border border-white/10 bg-white/90 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-500">
                  Đang cấu hình
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedTreeType?.treeTypeName || "Chưa chọn loại cây"}
                </h2>
                {selectedTreeType?.scientificName && (
                  <p className="text-sm text-slate-500 italic">
                    {selectedTreeType.scientificName}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetToOriginal}
                  disabled={!isDirty || detailLoading}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Hoàn tác
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetToDefault}
                  disabled={detailLoading}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Về mặc định
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!isDirty || saving || detailLoading}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Lưu cấu hình
                </Button>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={pendingAddPhase}
                    onValueChange={setPendingAddPhase}
                    disabled={missingPhaseIds.length === 0}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Chọn giai đoạn" />
                    </SelectTrigger>
                    <SelectContent>
                      {missingPhaseIds.map((phaseId) => {
                        const base = DEFAULT_PHASE_THEME[phaseId];
                        return (
                          <SelectItem key={phaseId} value={phaseId}>
                            {base?.label || phaseId}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    className="gap-2"
                    onClick={handleAddPhase}
                    disabled={missingPhaseIds.length === 0}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm giai đoạn
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Tuỳ chỉnh trực quan
                </p>
                <p className="text-sm text-slate-600">
                  Giữ và kéo các node trên vòng đời để thay đổi thứ tự. Nhấn vào
                  node để mở popup chỉnh sửa chi tiết.
                </p>
              </div>
              {detailLoading && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang tải cấu hình quy trình...</span>
                  </div>
                </div>
              )}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <LifecycleWidget
                  disabled
                  tree={{}}
                  treeId={selectedTreeTypeId || "preview"}
                  treeType={selectedTreeType?.treeTypeName || "Loại cây"}
                  treeVariety={selectedTreeType?.scientificName || "Giống"}
                  phaseTheme={sortedPhaseRows}
                  phase1Completed
                  value={
                    sortedPhaseRows.find(
                      (p) => p.phaseId !== "growth_development"
                    )?.phaseId
                  }
                  autoLifecycleEnabled={false}
                  autoLifecycleDisabledAt={null}
                  enableNodeEditing
                  onPhaseNodeClick={handlePhaseNodeClick}
                  onPhaseNodeReorder={handleNodeReorder}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDialog();
          }
        }}
      >
        <DialogContent className="max-w-2xl space-y-4">
          <DialogHeader>
            <DialogTitle>
              Chỉnh sửa {editingPhase?.label || "giai đoạn"}
            </DialogTitle>
            <DialogDescription>
              Cập nhật nội dung hiển thị cho node này. Giữ và kéo node để đổi
              thứ tự trực tiếp trên vòng đời.
            </DialogDescription>
          </DialogHeader>

          {editingPhase && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  Giai đoạn hệ thống: <b>{editingPhase.phaseId}</b>
                </span>
                {editingPhaseOrder && (
                  <span>
                    Thứ tự hiển thị: <b>{editingPhaseOrder}</b>
                  </span>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Tên giai đoạn hiển thị
                  </label>
                  <Input
                    value={editingPhase.label}
                    onChange={(e) =>
                      handleFieldChange(
                        editingPhase.phaseId,
                        "label",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Ghi chú / thời điểm
                  </label>
                  <Input
                    value={editingPhase.subtitle}
                    onChange={(e) =>
                      handleFieldChange(
                        editingPhase.phaseId,
                        "subtitle",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500">
                  Nội dung mô tả
                </label>
                <Textarea
                  rows={4}
                  value={editingPhase.description}
                  onChange={(e) =>
                    handleFieldChange(
                      editingPhase.phaseId,
                      "description",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Icon / Emoji
                  </label>
                  <Input
                    value={editingPhase.icon}
                    maxLength={4}
                    onChange={(e) =>
                      handleFieldChange(
                        editingPhase.phaseId,
                        "icon",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Màu nút
                  </label>
                  <Select
                    value={editingPhase.colorKey}
                    onValueChange={(value) =>
                      handleFieldChange(editingPhase.phaseId, "colorKey", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn màu" />
                    </SelectTrigger>
                    <SelectContent>
                      {LIFECYCLE_COLOR_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`inline-block h-3 w-3 rounded-full ${opt.className}`}
                            />
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Màu đường nối
                  </label>
                  <Select
                    value={editingPhase.lineColorKey || editingPhase.colorKey}
                    onValueChange={(value) =>
                      handleFieldChange(
                        editingPhase.phaseId,
                        "lineColorKey",
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn màu" />
                    </SelectTrigger>
                    <SelectContent>
                      {LIFECYCLE_COLOR_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`inline-block h-3 w-3 rounded-full ${opt.className}`}
                            />
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Kiểu đường chạy
                  </label>
                  <Select
                    value={editingPhase.lineStyle}
                    onValueChange={(value) =>
                      handleFieldChange(
                        editingPhase.phaseId,
                        "lineStyle",
                        value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kiểu đường" />
                    </SelectTrigger>
                    <SelectContent>
                      {LIFECYCLE_LINE_STYLES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 text-xs text-slate-500">
                  <label className="font-semibold uppercase">Ghi chú</label>
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2">
                    Thứ tự được xác định bằng thao tác kéo trực tiếp.
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {!editingPhaseIsBase && editingPhase && (
              <Button
                type="button"
                variant="destructive"
                className="gap-2"
                onClick={() => {
                  handleRemovePhase(editingPhase.phaseId);
                  handleCloseDialog();
                }}
              >
                <Trash2 className="h-4 w-4" />
                Xoá giai đoạn
              </Button>
            )}
            <div className="flex w-full justify-end gap-2 sm:w-auto">
              <Button
                variant="outline"
                type="button"
                onClick={handleCloseDialog}
              >
                Đóng
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
