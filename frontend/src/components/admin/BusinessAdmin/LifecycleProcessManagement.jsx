import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Loader2,
  RefreshCcw,
  Save,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  GripVertical,
  Edit,
  Upload,
} from "lucide-react";
import AdminLayout from "../layout/AdminLayout";
import { LivingBackground } from "@/components/background";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LifecycleWidget from "@/components/user/LifecycleWidget";
import {
  PHASE_IDS,
  LIFECYCLE_COLOR_OPTIONS,
  LIFECYCLE_COLOR_LOOKUP,
  getColorKeyFromHex,
} from "@/lib/lifecycleTheme";
import AdminTreeRepository from "@/API/repositories/AdminTreeRepository";
import AdminGrowthStageRepository from "@/API/repositories/AdminGrowthStageRepository";

const BACKGROUND_PALETTE = {
  bg: "#0f172a",
  leaf: "#bbf7d0",
  ivory: "#f8fafc",
  accent: "#c4b5fd",
};

const DEFAULT_NODE_COLOR = LIFECYCLE_COLOR_LOOKUP.emerald || "#059669";
const DEFAULT_LINE_COLOR = LIFECYCLE_COLOR_LOOKUP.teal || "#14b8a6";

const HEX_COLOR_REGEX = /^#([0-9a-f]{6})$/i;

const normalizeStageColorHex = (value) => {
  if (!value) return "";
  const raw = value.toString().trim().toLowerCase();
  if (HEX_COLOR_REGEX.test(raw)) return raw;
  if (LIFECYCLE_COLOR_LOOKUP[raw]) return LIFECYCLE_COLOR_LOOKUP[raw];
  const mappedKey = getColorKeyFromHex(raw);
  if (mappedKey && LIFECYCLE_COLOR_LOOKUP[mappedKey]) {
    return LIFECYCLE_COLOR_LOOKUP[mappedKey];
  }
  return "";
};

const buildColorMeta = (value, fallbackKey = "emerald") => {
  const hex = normalizeStageColorHex(value);
  const key = getColorKeyFromHex(hex) || fallbackKey;
  return {
    hex: hex || LIFECYCLE_COLOR_LOOKUP[key] || "#059669",
    key,
  };
};

const isImageIconValue = (value) =>
  typeof value === "string" &&
  (value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/"));

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

const formatAgeRangeLabel = (stage) => {
  const min =
    stage?.minAgeInMonths != null ? Number(stage.minAgeInMonths) : null;
  const max =
    stage?.maxAgeInMonths != null ? Number(stage.maxAgeInMonths) : null;
  if (Number.isFinite(min) && Number.isFinite(max)) {
    return `${min}-${max} tháng`;
  }
  if (Number.isFinite(min)) {
    return `≥${min} tháng`;
  }
  if (Number.isFinite(max)) {
    return `<${max} tháng`;
  }
  return "";
};

export default function BusinessAdminLifecycleProcessManagement() {
  const [treeTypes, setTreeTypes] = useState([]);
  const [treeTypesLoading, setTreeTypesLoading] = useState(true);
  const [treeTypesError, setTreeTypesError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTreeTypeId, setSelectedTreeTypeId] = useState(null);
  const [selectedTreeType, setSelectedTreeType] = useState(null);
  const [stages, setStages] = useState([]);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [draggedStageId, setDraggedStageId] = useState(null);
  const iconInputRef = useRef(null);
  const [iconUploading, setIconUploading] = useState(false);
  const [stageToDelete, setStageToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSelectTreeType = useCallback(async (treeTypeId) => {
    if (!treeTypeId) return;
    setSelectedTreeTypeId(treeTypeId);
    setStagesLoading(true);
    setNotice(null);
    try {
      const detail = await AdminTreeRepository.getTreeTypeById(treeTypeId);
      setSelectedTreeType(detail);

      const stagesData = await AdminGrowthStageRepository.getStagesByTreeTypeId(
        treeTypeId
      );
      const sortedStages = Array.isArray(stagesData)
        ? [...stagesData].sort((a, b) => a.stageOrder - b.stageOrder)
        : [];
      const normalizedStages = sortedStages.map((stage) => {
        const nodeColorMeta = buildColorMeta(
          stage.nodeColor || stage.colorKey || stage.colorHex || ""
        );
        const lineColorMeta = buildColorMeta(
          stage.lineColor ||
            stage.lineColorKey ||
            stage.lineColorHex ||
            nodeColorMeta.hex,
          nodeColorMeta.key
        );

        return {
          ...stage,
          icon: stage.icon || "",
          nodeColor: nodeColorMeta.hex,
          lineColor: lineColorMeta.hex,
        };
      });
      setStages(normalizedStages);
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Không thể tải danh sách giai đoạn.",
      });
    } finally {
      setStagesLoading(false);
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

  const filteredTreeTypes = useMemo(() => {
    if (!searchTerm.trim()) return treeTypes;
    const keyword = searchTerm.trim().toLowerCase();
    return treeTypes.filter(
      (type) =>
        type.name.toLowerCase().includes(keyword) ||
        type.scientificName.toLowerCase().includes(keyword)
    );
  }, [treeTypes, searchTerm]);

  const limitedStages = useMemo(
    () =>
      [...stages]
        .map((stage, index) => ({
          ...stage,
          _order: stage.stageOrder ?? index + 1,
        }))
        .sort((a, b) => a._order - b._order)
        .slice(0, PHASE_IDS.length),
    [stages]
  );

  const previewPhaseTheme = useMemo(() => {
    if (!limitedStages.length) return [];

    const FALLBACK_ICONS = ["🌱", "🌸", "🍈", "🔍", "🌿"];

    return limitedStages.map((stage, idx) => {
      const phaseId = PHASE_IDS[idx] || `custom_${idx}`;
      const label =
        stage.stageName ||
        stage.name ||
        `Giai đoạn ${stage.stageOrder || idx + 1}`;
      const subtitle = formatAgeRangeLabel(stage);
      const nodeColorMeta = buildColorMeta(
        stage.nodeColor || stage.colorKey || ""
      );
      const lineColorMeta = buildColorMeta(
        stage.lineColor || stage.lineColorKey || "",
        nodeColorMeta.key
      );
      const iconValue = stage.icon || "";
      const isImageIcon = isImageIconValue(iconValue);

      return {
        phaseId,
        label,
        subtitle,
        description:
          stage.description ||
          stage.careInstructions ||
          stage.commonIssues ||
          "",
        icon: isImageIcon ? null : iconValue || FALLBACK_ICONS[idx] || "🌿",
        iconImageUrl: isImageIcon ? iconValue : null,
        colorKey: nodeColorMeta.key,
        colorHex: nodeColorMeta.hex,
        lineColorKey: lineColorMeta.key,
        lineColorHex: lineColorMeta.hex || nodeColorMeta.hex,
        order: idx,
      };
    });
  }, [limitedStages]);

  const phaseStageMap = useMemo(() => {
    const map = {};
    previewPhaseTheme.forEach((phase, idx) => {
      const stage = limitedStages[idx];
      if (phase && stage) {
        map[phase.phaseId] = stage;
      }
    });
    return map;
  }, [previewPhaseTheme, limitedStages]);

  const previewActivePhase = useMemo(() => {
    if (!stages.length) return "growth_development";
    const firstCycleIndex = Math.min(
      Math.max(stages.length > 1 ? 1 : 0, 0),
      PHASE_IDS.length - 1
    );
    return PHASE_IDS[firstCycleIndex];
  }, [stages]);

  const prepareStageForEdit = useCallback((stage) => {
    if (!stage) return null;
    const nodeColorMeta = buildColorMeta(
      stage.nodeColor || stage.colorKey || stage.colorHex || ""
    );
    const lineColorMeta = buildColorMeta(
      stage.lineColor ||
        stage.lineColorKey ||
        stage.lineColorHex ||
        stage.nodeColor ||
        nodeColorMeta.hex,
      nodeColorMeta.key
    );
    return {
      ...stage,
      icon: stage.icon || "",
      nodeColor: nodeColorMeta.hex,
      lineColor: lineColorMeta.hex,
    };
  }, []);

  const handlePreviewNodeClick = useCallback(
    (phaseId) => {
      if (!phaseId) return;
      const stage = phaseStageMap[phaseId];
      if (!stage) return;
      const prepared = prepareStageForEdit(stage);
      if (prepared) {
        setEditingStage(prepared);
        setIsEditDialogOpen(true);
      }
    },
    [phaseStageMap, prepareStageForEdit]
  );

  const handleCreateStage = () => {
    setEditingStage({
      treeTypeId: selectedTreeTypeId,
      stageName: "",
      description: "",
      stageOrder:
        stages.length > 0
          ? Math.max(...stages.map((s) => s.stageOrder)) + 1
          : 1,
      minAgeInMonths: null,
      maxAgeInMonths: null,
      wateringFrequencyDays: null,
      wateringAmountLiters: null,
      fertilizingFrequencyDays: null,
      fertilizerType: "",
      fertilizerAmountGrams: null,
      pruningFrequencyDays: null,
      careInstructions: "",
      commonIssues: "",
      criticalWeatherFactors: "",
      vulnerabilityLevel: 5,
      imageUrl: "",
      icon: "",
      nodeColor: DEFAULT_NODE_COLOR,
      lineColor: DEFAULT_LINE_COLOR,
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditStage = useCallback(
    (stage) => {
      const prepared = prepareStageForEdit(stage);
      if (prepared) {
        setEditingStage(prepared);
        setIsEditDialogOpen(true);
      }
    },
    [prepareStageForEdit]
  );

  const handleDeleteStage = (stage) => {
    setStageToDelete(stage);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteStage = async () => {
    if (!stageToDelete) return;

    setDeleting(true);
    try {
      await AdminGrowthStageRepository.deleteTreeGrowthStage(
        stageToDelete.stageId
      );
      setNotice({
        type: "success",
        message: "Đã xóa giai đoạn thành công.",
      });
      setIsDeleteDialogOpen(false);
      setStageToDelete(null);
      // Reload stages
      if (selectedTreeTypeId) {
        await handleSelectTreeType(selectedTreeTypeId);
      }
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Không thể xóa giai đoạn.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveStage = async () => {
    if (!editingStage) return;

    setSaving(true);
    setNotice(null);

    try {
      if (editingStage.stageId) {
        // Update existing stage
        const { stageId, treeTypeName, treesCount, ...updateData } =
          editingStage;
        await AdminGrowthStageRepository.updateTreeGrowthStage(
          stageId,
          updateData
        );
        setNotice({
          type: "success",
          message: "Đã cập nhật giai đoạn thành công.",
        });
      } else {
        // Create new stage
        const { stageId, treeTypeName, treesCount, ...createData } =
          editingStage;
        await AdminGrowthStageRepository.createTreeGrowthStage(createData);
        setNotice({
          type: "success",
          message: "Đã tạo giai đoạn mới thành công.",
        });
      }

      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingStage(null);

      // Reload stages
      if (selectedTreeTypeId) {
        await handleSelectTreeType(selectedTreeTypeId);
      }
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Không thể lưu giai đoạn.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReorderStages = async (newOrder) => {
    if (!selectedTreeTypeId) return;

    try {
      const stageIdToNewOrder = {};
      newOrder.forEach((stage, index) => {
        stageIdToNewOrder[stage.stageId] = index + 1;
      });

      await AdminGrowthStageRepository.reorderStages(
        selectedTreeTypeId,
        stageIdToNewOrder
      );
      setStages(
        newOrder.map((stage, index) => ({ ...stage, stageOrder: index + 1 }))
      );
      setNotice({
        type: "success",
        message: "Đã sắp xếp lại thứ tự giai đoạn.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Không thể sắp xếp lại thứ tự.",
      });
    }
  };

  const handleDragStart = (stageId) => {
    setDraggedStageId(stageId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetStageId) => {
    if (!draggedStageId || draggedStageId === targetStageId) {
      setDraggedStageId(null);
      return;
    }

    const draggedIndex = stages.findIndex((s) => s.stageId === draggedStageId);
    const targetIndex = stages.findIndex((s) => s.stageId === targetStageId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedStageId(null);
      return;
    }

    const newOrder = [...stages];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    handleReorderStages(newOrder);
    setDraggedStageId(null);
  };

  const handleIconUploadClick = () => {
    iconInputRef.current?.click();
  };

  const handleIconFileChange = async (event) => {
    if (!editingStage) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice({
        type: "error",
        message: "Vui lòng chọn file hình ảnh hợp lệ.",
      });
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice({
        type: "error",
        message: "Kích thước ảnh không được vượt quá 5MB.",
      });
      event.target.value = "";
      return;
    }

    try {
      setIconUploading(true);
      const response = await AdminGrowthStageRepository.uploadStageImage(file);
      const url = response?.data?.url ?? response?.url;
      if (!url) {
        throw new Error("Không nhận được đường dẫn hình ảnh từ máy chủ.");
      }
      setEditingStage((prev) => ({
        ...prev,
        icon: url,
      }));
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Upload icon thất bại. Vui lòng thử lại.",
      });
    } finally {
      setIconUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleRemoveIcon = () => {
    setEditingStage((prev) => ({
      ...prev,
      icon: "",
    }));
    if (iconInputRef.current) {
      iconInputRef.current.value = "";
    }
  };

  const renderColorPicker = useCallback(
    (fieldKey, label) => {
      if (!editingStage) return null;
      const currentValue = (editingStage[fieldKey] || "").toLowerCase();
      return (
        <div className="space-y-2">
          <label className="text-sm font-semibold">{label}</label>
          <Input
            readOnly
            value={editingStage[fieldKey] || ""}
            className="font-mono uppercase text-xs"
          />
          <div className="grid grid-cols-3 gap-2">
            {LIFECYCLE_COLOR_OPTIONS.map((opt) => {
              const hex = opt.hex.toLowerCase();
              const isActive = currentValue === hex;
              return (
                <button
                  type="button"
                  key={`${fieldKey}-${opt.key}`}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() =>
                    setEditingStage((prev) => ({
                      ...prev,
                      [fieldKey]: opt.hex.toLowerCase(),
                    }))
                  }
                >
                  <span
                    className="inline-flex h-5 w-5 rounded-full border border-white/70 shadow"
                    style={{ backgroundColor: opt.hex }}
                  />
                  <span className="font-mono uppercase">{opt.hex}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    },
    [editingStage]
  );

  return (
    <AdminLayout>
      <LivingBackground palette={BACKGROUND_PALETTE} dotsOpacity={0.15} />
      <div className="relative z-10 flex flex-col gap-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400">
            Quy trình
          </p>
          <h1 className="text-3xl font-bold text-white">
            Quản lý chu trình giai đoạn cây trồng
          </h1>
          <p className="text-sm text-emerald-50/80 max-w-3xl">
            Quản lý các giai đoạn phát triển của từng loại cây. Tạo, chỉnh sửa,
            xóa và sắp xếp lại thứ tự các giai đoạn.
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
                Chọn loại cây để quản lý giai đoạn.
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
                  Đang quản lý
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
              <Button
                size="sm"
                onClick={handleCreateStage}
                disabled={!selectedTreeTypeId || stagesLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm giai đoạn
              </Button>
            </div>

            {stagesLoading && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tải danh sách giai đoạn...</span>
                </div>
              </div>
            )}

            {!stagesLoading && stages.length === 0 && selectedTreeTypeId && (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center">
                <p className="text-sm text-slate-500">
                  Chưa có giai đoạn nào. Hãy tạo giai đoạn đầu tiên.
                </p>
              </div>
            )}

            {!stagesLoading && stages.length > 0 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="w-20">Thứ tự</TableHead>
                        <TableHead>Tên giai đoạn</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead className="w-32">Tuổi (tháng)</TableHead>
                        <TableHead className="w-24">Số cây</TableHead>
                        <TableHead className="w-32">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stages.map((stage) => (
                        <TableRow
                          key={stage.stageId}
                          draggable
                          onDragStart={() => handleDragStart(stage.stageId)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(stage.stageId)}
                          className={`cursor-move ${
                            draggedStageId === stage.stageId ? "opacity-50" : ""
                          }`}
                        >
                          <TableCell>
                            <GripVertical className="h-4 w-4 text-slate-400" />
                          </TableCell>
                          <TableCell className="font-semibold">
                            {stage.stageOrder}
                          </TableCell>
                          <TableCell className="font-medium">
                            {stage.stageName}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {stage.description || "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {stage.minAgeInMonths !== null &&
                            stage.maxAgeInMonths !== null
                              ? `${stage.minAgeInMonths}-${stage.maxAgeInMonths}`
                              : stage.minAgeInMonths !== null
                              ? `≥${stage.minAgeInMonths}`
                              : stage.maxAgeInMonths !== null
                              ? `<${stage.maxAgeInMonths}`
                              : "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {stage.treesCount || 0}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditStage(stage)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStage(stage)}
                              >
                                <Trash2 className="h-4 w-4 text-rose-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6 shadow-inner space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-500">
                        Xem trước vòng đời
                      </p>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {selectedTreeType?.treeTypeName || "Loại cây"}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Hiển thị tối đa 5 giai đoạn đầu tiên
                      </p>
                    </div>
                    {stages.length > PHASE_IDS.length && (
                      <p className="text-xs text-amber-600">
                        * Giai đoạn vượt quá 5 mục sẽ không hiển thị trên vòng
                        tròn preview
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <LifecycleWidget
                      tree={{
                        lifecycle: { currentPhaseId: previewActivePhase },
                      }}
                      treeId={
                        selectedTreeTypeId
                          ? `preview-${selectedTreeTypeId}`
                          : "preview"
                      }
                      treeType={
                        selectedTreeType?.treeTypeName || "Loại cây tuỳ chỉnh"
                      }
                      treeVariety={
                        selectedTreeType?.scientificName || "Giống đang chọn"
                      }
                      phaseTheme={previewPhaseTheme}
                      phaseThemeAllowPartial
                      phase1Completed={stages.length > 1}
                      disabled
                      autoLifecycleEnabled={false}
                      onPhaseNodeClick={handlePreviewNodeClick}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingStage(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStage?.stageId
                ? "Chỉnh sửa giai đoạn"
                : "Tạo giai đoạn mới"}
            </DialogTitle>
            <DialogDescription>
              {editingStage?.stageId
                ? "Cập nhật thông tin giai đoạn phát triển."
                : "Tạo giai đoạn phát triển mới cho loại cây này."}
            </DialogDescription>
          </DialogHeader>

          {editingStage && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Tên giai đoạn <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={editingStage.stageName || ""}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        stageName: e.target.value,
                      })
                    }
                    placeholder="Ví dụ: Sinh trưởng & Phát triển"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Thứ tự</label>
                  <Input
                    type="number"
                    min="1"
                    value={editingStage.stageOrder || ""}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        stageOrder: parseInt(e.target.value) || null,
                      })
                    }
                    placeholder="Tự động nếu để trống"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Mô tả</label>
                <Textarea
                  rows={2}
                  value={editingStage.description || ""}
                  onChange={(e) =>
                    setEditingStage({
                      ...editingStage,
                      description: e.target.value,
                    })
                  }
                  placeholder="Mô tả ngắn gọn về giai đoạn này"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Icon hiển thị</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full border border-dashed border-slate-300 bg-white shadow-inner grid place-items-center overflow-hidden">
                        {editingStage.icon ? (
                          isImageIconValue(editingStage.icon) ? (
                            <img
                              src={editingStage.icon}
                              alt="Stage icon"
                              className="h-12 w-12 object-contain"
                            />
                          ) : (
                            <span className="text-3xl">
                              {editingStage.icon}
                            </span>
                          )
                        ) : (
                          <Upload className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleIconUploadClick}
                          disabled={iconUploading}
                        >
                          {iconUploading ? "Đang tải..." : "Upload icon"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleRemoveIcon}
                          disabled={!editingStage.icon || iconUploading}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleIconFileChange}
                    />
                    <Input
                      maxLength={8}
                      value={
                        editingStage.icon &&
                        !isImageIconValue(editingStage.icon)
                          ? editingStage.icon
                          : ""
                      }
                      onChange={(e) =>
                        setEditingStage((prev) => ({
                          ...prev,
                          icon: e.target.value,
                        }))
                      }
                      placeholder="Hoặc nhập emoji (ví dụ: 🌱)"
                    />
                    <p className="text-xs text-slate-500">
                      Có thể upload PNG/SVG ≤5MB hoặc nhập emoji để hiển thị
                      trên vòng tròn.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {renderColorPicker("nodeColor", "Màu nút (HEX)")}
                  {renderColorPicker("lineColor", "Màu đường nối (HEX)")}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Tuổi tối thiểu (tháng)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editingStage.minAgeInMonths ?? ""}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        minAgeInMonths: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Tuổi tối đa (tháng)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editingStage.maxAgeInMonths ?? ""}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        maxAgeInMonths: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Không giới hạn"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Tần suất tưới (ngày)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editingStage.wateringFrequencyDays ?? ""}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        wateringFrequencyDays: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Ví dụ: 3"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Lượng nước (lít)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={editingStage.wateringAmountLiters ?? ""}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        wateringAmountLiters: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Ví dụ: 10.0"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Tần suất bón phân (ngày)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editingStage.fertilizingFrequencyDays ?? ""}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        fertilizingFrequencyDays: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Ví dụ: 60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Loại phân</label>
                  <Input
                    value={editingStage.fertilizerType || ""}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        fertilizerType: e.target.value,
                      })
                    }
                    placeholder="Ví dụ: NPK 16-16-8"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Lượng phân (gram)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={editingStage.fertilizerAmountGrams ?? ""}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        fertilizerAmountGrams: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Ví dụ: 100.0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Tần suất cắt tỉa (ngày)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editingStage.pruningFrequencyDays ?? ""}
                    onChange={(e) =>
                      setEditingStage({
                        ...editingStage,
                        pruningFrequencyDays: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Ví dụ: 90"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Hướng dẫn chăm sóc
                </label>
                <Textarea
                  rows={3}
                  value={editingStage.careInstructions || ""}
                  onChange={(e) =>
                    setEditingStage({
                      ...editingStage,
                      careInstructions: e.target.value,
                    })
                  }
                  placeholder="Hướng dẫn chi tiết về cách chăm sóc trong giai đoạn này"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Vấn đề thường gặp
                </label>
                <Textarea
                  rows={2}
                  value={editingStage.commonIssues || ""}
                  onChange={(e) =>
                    setEditingStage({
                      ...editingStage,
                      commonIssues: e.target.value,
                    })
                  }
                  placeholder="Các vấn đề thường gặp trong giai đoạn này"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Yếu tố thời tiết quan trọng
                </label>
                <Textarea
                  rows={2}
                  value={editingStage.criticalWeatherFactors || ""}
                  onChange={(e) =>
                    setEditingStage({
                      ...editingStage,
                      criticalWeatherFactors: e.target.value,
                    })
                  }
                  placeholder="Các yếu tố thời tiết cần lưu ý"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Mức độ dễ tổn thương (1-10)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={editingStage.vulnerabilityLevel || 5}
                  onChange={(e) =>
                    setEditingStage({
                      ...editingStage,
                      vulnerabilityLevel: parseInt(e.target.value) || 5,
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                setEditingStage(null);
              }}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSaveStage}
              disabled={saving || !editingStage?.stageName}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setIsDeleteDialogOpen(false);
            setStageToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa giai đoạn</AlertDialogTitle>
            <AlertDialogDescription>
              {stageToDelete ? (
                (stageToDelete?.treesCount ?? 0) > 0 ? (
                  <>
                    Giai đoạn "{stageToDelete.stageName}" đang được áp dụng cho{" "}
                    <span className="font-semibold text-rose-600">
                      {stageToDelete.treesCount}
                    </span>{" "}
                    cây. Khi xóa, những cây này sẽ được chuyển sang giai đoạn
                    lân cận. Bạn có chắc chắn muốn tiếp tục?
                  </>
                ) : (
                  <>
                    Bạn có chắc chắn muốn xóa giai đoạn "
                    {stageToDelete.stageName}" không?
                  </>
                )
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteStage}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xác nhận xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
