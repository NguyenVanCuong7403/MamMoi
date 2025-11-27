import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
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

  const handleReorder = (phaseId, direction) => {
    setPhaseRows((prev) => {
      const ordered = [...prev].sort((a, b) => a.order - b.order);
      const idx = ordered.findIndex((phase) => phase.phaseId === phaseId);
      if (idx < 0) return prev;
      const targetIdx = idx + direction;
      if (ordered[idx].phaseId === "growth_development") return prev;
      if (targetIdx < 1 || targetIdx >= ordered.length) return prev;
      const clone = [...ordered];
      [clone[idx], clone[targetIdx]] = [clone[targetIdx], clone[idx]];
      return clone.map((phase, index) => ({ ...phase, order: index }));
    });
  };

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

  const handleAddPhase = () => {
    const targetId = pendingAddPhase || missingPhaseIds[0];
    if (!targetId) return;
    setPhaseRows((prev) => {
      const nextOrder =
        prev.length > 0 ? Math.max(...prev.map((phase) => phase.order)) + 1 : 0;
      return [...prev, createPhaseRowFromId(targetId, nextOrder)];
    });
    setPendingAddPhase("");
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

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Xem trước animation
                    </p>
                    <p className="text-sm text-slate-600">
                      Thay đổi sẽ áp dụng trực tiếp lên widget bên phải.
                    </p>
                  </div>
                </div>
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
                  />
                </div>
              </div>

              <div className="space-y-4">
                {detailLoading && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang tải cấu hình quy trình...</span>
                    </div>
                  </div>
                )}
                {sortedPhaseRows.map((phase, index) => {
                  const isPhase1 = phase.phaseId === "growth_development";
                  const colorOption =
                    LIFECYCLE_COLOR_OPTIONS.find(
                      (opt) => opt.value === phase.colorKey
                    ) || LIFECYCLE_COLOR_OPTIONS[0];
                  return (
                    <div
                      key={phase.phaseId}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Giai đoạn {index + 1}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{phase.icon}</span>
                            <div>
                              <p className="text-base font-semibold text-slate-900">
                                {phase.label}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID hệ thống: <b>{phase.phaseId}</b>
                              </p>
                            </div>
                          </div>
                        </div>
                        {!isPhase1 && (
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleReorder(phase.phaseId, -1)}
                              disabled={index <= 1}
                              title="Di chuyển lên"
                            >
                              <ArrowUpCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleReorder(phase.phaseId, +1)}
                              disabled={index >= sortedPhaseRows.length - 1}
                              title="Di chuyển xuống"
                            >
                              <ArrowDownCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleRemovePhase(phase.phaseId)}
                              disabled={phase.phaseId === "growth_development"}
                              title="Xoá giai đoạn"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase text-slate-500">
                            Tên giai đoạn hiển thị
                          </label>
                          <Input
                            value={phase.label}
                            onChange={(e) =>
                              handleFieldChange(
                                phase.phaseId,
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
                            value={phase.subtitle}
                            onChange={(e) =>
                              handleFieldChange(
                                phase.phaseId,
                                "subtitle",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <label className="text-xs font-semibold uppercase text-slate-500">
                          Nội dung mô tả
                        </label>
                        <Textarea
                          value={phase.description}
                          rows={3}
                          onChange={(e) =>
                            handleFieldChange(
                              phase.phaseId,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase text-slate-500">
                            Icon / Emoji
                          </label>
                          <Input
                            value={phase.icon}
                            maxLength={4}
                            onChange={(e) =>
                              handleFieldChange(
                                phase.phaseId,
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
                            value={phase.colorKey}
                            onValueChange={(value) =>
                              handleFieldChange(
                                phase.phaseId,
                                "colorKey",
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
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase text-slate-500">
                            Màu đường nối
                          </label>
                          <Select
                            value={phase.lineColorKey || phase.colorKey}
                            onValueChange={(value) =>
                              handleFieldChange(
                                phase.phaseId,
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

                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase text-slate-500">
                            Kiểu đường chạy
                          </label>
                          <Select
                            value={phase.lineStyle}
                            onValueChange={(value) =>
                              handleFieldChange(
                                phase.phaseId,
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
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase text-slate-500">
                            Thứ tự hiển thị
                          </label>
                          <Input
                            type="number"
                            value={phase.order}
                            onChange={(e) =>
                              handleFieldChange(
                                phase.phaseId,
                                "order",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Màu hiện tại:{" "}
                        <span className="font-semibold">
                          {colorOption.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
