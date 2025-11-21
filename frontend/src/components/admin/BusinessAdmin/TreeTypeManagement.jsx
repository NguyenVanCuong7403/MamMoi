import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Leaf,
  Edit3,
  Trash2,
  Thermometer,
  Droplets,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LivingBackground } from "@/components/background";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

const BACKGROUND_PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const SOIL_PAGE_SIZE = 5;
const TREE_PAGE_SIZE = 8;
const VARIETY_PAGE_SIZE = 5;
const environmentLabelClass = "text-[13px] font-semibold text-slate-600 leading-tight min-h-[32px]";

const toleranceLevels = [
  { value: "Low", label: "Thấp" },
  { value: "Medium", label: "Trung bình" },
  { value: "High", label: "Cao" },
  { value: "None", label: "Không xác định" },
];

const normalizeText = (value = "") => value.trim().toLowerCase();

const buildDuplicateMessage = (entityLabel, value) =>
  `${entityLabel} "${value}" đã có trong hệ thống.`;

const truncateText = (text = "", maxChars = 60) => {
  const value = (text ?? "").trim();
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars).trimEnd()}…`;
};

let soilStore = [
  {
    SoilMasterID: "SOIL-01",
    SoilName: "Đất phù sa",
    Texture: "Tơi xốp",
    Drainage: "Tốt",
    OrganicMatterPct: 2.5,
    EC_dS_m: 1.1,
    Notes: "Giàu dinh dưỡng, trung tính.",
  },
  {
    SoilMasterID: "SOIL-02",
    SoilName: "Đất đỏ bazan",
    Texture: "Thịt nặng",
    Drainage: "Trung bình",
    OrganicMatterPct: 3.1,
    EC_dS_m: 1.4,
    Notes: "Thích hợp cây công nghiệp dài ngày.",
  },
  {
    SoilMasterID: "SOIL-03",
    SoilName: "Đất cát pha",
    Texture: "Cát pha",
    Drainage: "Tốt",
    OrganicMatterPct: 1.2,
    EC_dS_m: 0.8,
    Notes: "Cần tưới giữ ẩm thường xuyên.",
  },
  {
    SoilMasterID: "SOIL-04",
    SoilName: "Đất thịt nhẹ",
    Texture: "Thịt nhẹ",
    Drainage: "Trung bình",
    OrganicMatterPct: 2.0,
    EC_dS_m: 1.0,
    Notes: "Phù hợp cây ăn quả phổ thông.",
  },
];

const createVariety = (index, overrides = {}) => ({
  VarietyID: `VAR-${index}`,
  VarietyName: `Giống ${index}`,
  VarietyDescription: "Mô tả giống cây ngắn gọn.",
  ...overrides,
});

let treeStore = [
  {
    TreeTypeID: "TT-001",
    TreeTypeName: "Xoài Cát Hòa Lộc",
    ScientificName: "Mangifera indica",
    Category: "Fruit",
    Description: "Giống xoài cao cấp, vỏ vàng, thơm đậm, phù hợp xuất khẩu.",
    AverageLifespanYears: 35,
    SoilMasterID: "SOIL-01",
    OptimalTemperatureMin: 20,
    OptimalTemperatureMax: 32,
    OptimalHumidityMin: 65,
    OptimalHumidityMax: 85,
    DroughtTolerance: "Medium",
    FloodTolerance: "Low",
    FrostTolerance: "Low",
    WindTolerance: "Medium",
    ImageUrl: "https://images.unsplash.com/photo-1437750769465-301382cdf094?w=400",
    Varieties: [
      createVariety("XO1", { VarietyName: "Cát Hòa Lộc A" }),
      createVariety("XO2", { VarietyName: "Cát Hòa Lộc B" }),
    ],
    IsActive: true,
  },
  {
    TreeTypeID: "TT-002",
    TreeTypeName: "Bơ Hass",
    ScientificName: "Persea americana",
    Category: "Industrial",
    Description: "Giống bơ nhập khẩu, thịt dẻo, dễ bảo quản và vận chuyển.",
    AverageLifespanYears: 25,
    SoilMasterID: "SOIL-02",
    OptimalTemperatureMin: 18,
    OptimalTemperatureMax: 26,
    OptimalHumidityMin: 60,
    OptimalHumidityMax: 80,
    DroughtTolerance: "Low",
    FloodTolerance: "Low",
    FrostTolerance: "Medium",
    WindTolerance: "High",
    ImageUrl: "https://images.unsplash.com/photo-1439127989242-c3749a012eac?w=400",
    Varieties: [
      createVariety("AV1", { VarietyName: "Hass Peru" }),
      createVariety("AV2", { VarietyName: "Hass Highlands" }),
      createVariety("AV3", { VarietyName: "Hass Premium" }),
    ],
    IsActive: true,
  },
  {
    TreeTypeID: "TT-003",
    TreeTypeName: "Thanh Long Ruột Đỏ",
    ScientificName: "Hylocereus costaricensis",
    Category: "Fruit",
    Description: "Màu ruột đỏ đậm, vị ngọt thanh, thu hoạch quanh năm.",
    AverageLifespanYears: 15,
    SoilMasterID: "SOIL-03",
    OptimalTemperatureMin: 22,
    OptimalTemperatureMax: 35,
    OptimalHumidityMin: 55,
    OptimalHumidityMax: 75,
    DroughtTolerance: "High",
    FloodTolerance: "Low",
    FrostTolerance: "Low",
    WindTolerance: "Medium",
    ImageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400",
    Varieties: [
      createVariety("DL1", { VarietyName: "Ruột đỏ Peru" }),
      createVariety("DL2", { VarietyName: "Ruột đỏ Premium" }),
    ],
    IsActive: false,
  },
];

const ENABLE_MOCK_DELAY =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_ENABLE_TREE_ADMIN_DELAY === "true";

const mockDelay = (ms = 400) =>
  ENABLE_MOCK_DELAY ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();

async function fetchTreeTypes() {
  await mockDelay();
  return JSON.parse(JSON.stringify(treeStore));
}

async function createTreeType(payload) {
  await mockDelay();
  const newRecord = {
    ...payload,
    TreeTypeID: `TT-${String(treeStore.length + 1).padStart(3, "0")}`,
    Varieties: payload.Varieties.map((item, index) => ({
      VarietyID: item.VarietyID || `NEW-${Date.now()}-${index}`,
      VarietyName: item.VarietyName,
      VarietyDescription: item.VarietyDescription ?? "",
    })),
  };
  treeStore = [newRecord, ...treeStore];
  return JSON.parse(JSON.stringify(newRecord));
}

async function updateTreeType(treeTypeId, payload) {
  await mockDelay();
  treeStore = treeStore.map((tree) => {
    if (tree.TreeTypeID !== treeTypeId) return tree;
    return {
      ...tree,
      ...payload,
      Varieties: (payload.Varieties ?? tree.Varieties).map((item, index) => ({
        VarietyID: item.VarietyID || `UP-${Date.now()}-${index}`,
        VarietyName: item.VarietyName,
        VarietyDescription: item.VarietyDescription ?? "",
      })),
    };
  });
  return JSON.parse(JSON.stringify(treeStore.find((tree) => tree.TreeTypeID === treeTypeId)));
}

async function deleteTreeType(treeTypeId) {
  await mockDelay();
  treeStore = treeStore.filter((tree) => tree.TreeTypeID !== treeTypeId);
}

async function fetchSoils() {
  await mockDelay();
  return JSON.parse(JSON.stringify(soilStore));
}

async function createSoil(payload) {
  await mockDelay();
  const newSoil = {
    ...payload,
    SoilMasterID: `SOIL-${String(soilStore.length + 1).padStart(2, "0")}`,
  };
  soilStore = [newSoil, ...soilStore];
  return JSON.parse(JSON.stringify(newSoil));
}

async function updateSoil(soilId, payload) {
  await mockDelay();
  soilStore = soilStore.map((soil) =>
    soil.SoilMasterID === soilId ? { ...soil, ...payload } : soil,
  );
  const updated = soilStore.find((soil) => soil.SoilMasterID === soilId);
  return JSON.parse(JSON.stringify(updated));
}

async function deleteSoil(soilId) {
  await mockDelay();
  const removed = soilStore.find((soil) => soil.SoilMasterID === soilId);
  soilStore = soilStore.filter((soil) => soil.SoilMasterID !== soilId);
  return JSON.parse(JSON.stringify(removed));
}

const numberField = () =>
  z.preprocess(
    (val) => {
      if (val === "" || val === null || typeof val === "undefined") return undefined;
      const parsed = Number(val);
      return Number.isNaN(parsed) ? undefined : parsed;
    },
    z.number().optional(),
  );

const varietySchema = z.object({
  VarietyID: z.string().optional(),
  VarietyName: z.string().min(1, "Tên giống là bắt buộc"),
  VarietyDescription: z.string().optional(),
});

const formSchema = z
  .object({
    TreeTypeName: z.string().min(1, "Vui lòng nhập tên loại cây"),
    ScientificName: z.string().optional(),
    AverageLifespanYears: numberField(),
    SoilMasterID: z.string().min(1, "Chọn loại đất gợi ý"),
    Description: z.string().optional(),
    ImageUrl: z.string().optional(),
    OptimalTemperatureMin: numberField(),
    OptimalTemperatureMax: numberField(),
    OptimalHumidityMin: numberField(),
    OptimalHumidityMax: numberField(),
    DroughtTolerance: z.string().min(1),
    FloodTolerance: z.string().min(1),
    FrostTolerance: z.string().min(1),
    WindTolerance: z.string().min(1),
    IsActive: z.boolean().default(true),
  })
  .refine(
    ({ OptimalTemperatureMin, OptimalTemperatureMax }) =>
      !OptimalTemperatureMin ||
      !OptimalTemperatureMax ||
      OptimalTemperatureMax > OptimalTemperatureMin,
    {
      message: "Nhiệt độ tối đa phải lớn hơn tối thiểu",
      path: ["OptimalTemperatureMax"],
    },
  )
  .refine(
    ({ OptimalHumidityMin, OptimalHumidityMax }) =>
      !OptimalHumidityMin || !OptimalHumidityMax || OptimalHumidityMax > OptimalHumidityMin,
    {
      message: "Độ ẩm tối đa phải lớn hơn tối thiểu",
      path: ["OptimalHumidityMax"],
    },
  );

const defaultFormValues = {
  TreeTypeName: "",
  ScientificName: "",
  AverageLifespanYears: undefined,
  SoilMasterID: "",
  Description: "",
  ImageUrl: "",
  OptimalTemperatureMin: undefined,
  OptimalTemperatureMax: undefined,
  OptimalHumidityMin: undefined,
  OptimalHumidityMax: undefined,
  DroughtTolerance: "Medium",
  FloodTolerance: "Medium",
  FrostTolerance: "Medium",
  WindTolerance: "Medium",
  IsActive: true,
};

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

function ImageDropzone({ value, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = React.useRef(null);

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div
      className={cn(
        "relative flex items-center gap-4 rounded-2xl border border-dashed bg-slate-50 px-4 py-4 transition-all",
        isDragging ? "border-emerald-500 bg-emerald-50/40" : "border-slate-200",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border bg-white">
        {value ? (
          <img src={value} alt="Tree preview" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-8 w-8 text-slate-300" />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">Tải ảnh giống cây</p>
        <p className="text-xs text-slate-500">
          Kéo thả hoặc bấm để chọn. Hỗ trợ PNG, JPG (max 2MB).
        </p>
        {value && (
          <Button
            size="sm"
            variant="link"
            className="px-0 text-emerald-600"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            Xoá ảnh
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}

function FilterBar({ filters, onChange, soils }) {
  const soilOptions = Array.isArray(soils) ? soils : [];
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-[16px] shadow-sm">
      <Select
        value={filters.soil}
        onValueChange={(value) => onChange({ ...filters, soil: value })}
      >
        <SelectTrigger className="h-12 w-48 rounded-xl text-base">
          <SelectValue placeholder="Loại đất" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả đất</SelectItem>
          {soilOptions.map((soil) => (
            <SelectItem key={soil.SoilMasterID} value={soil.SoilMasterID}>
              {soil.SoilName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(value) => onChange({ ...filters, status: value })}
      >
        <SelectTrigger className="h-12 w-40 rounded-xl text-base">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function SpecsSummary({ tree }) {
  return (
    <div className="flex flex-col gap-2 text-sm text-slate-600">
      <div className="flex items-center gap-2">
        <Thermometer className="h-4 w-4 text-amber-500" />
        <span className="font-medium">{tree.OptimalTemperatureMin ?? "?"} - {tree.OptimalTemperatureMax ?? "?"}°C</span>
      </div>
      <div className="flex items-center gap-2">
        <Droplets className="h-4 w-4 text-sky-500" />
        <span className="font-medium">{tree.OptimalHumidityMin ?? "?"} - {tree.OptimalHumidityMax ?? "?"}%</span>
      </div>
    </div>
  );
}

function TreeTable({ trees, soils, onEdit, onDelete, onToggleStatus, onManageVarieties, pagination }) {
  const soilLookup = useMemo(
    () =>
      soils.reduce((acc, soil) => {
        acc[soil.SoilMasterID] = soil.SoilName;
        return acc;
      }, {}),
    [soils],
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-[16px] shadow-sm">
      <ScrollArea className="w-full flex-1">
        <Table className="text-base">
          <TableHeader className="bg-slate-50 text-base text-slate-600">
            <TableRow>
              <TableHead className="text-base font-semibold">Loại cây</TableHead>
              <TableHead className="hidden text-base font-semibold text-center md:table-cell">Đất gợi ý</TableHead>
              <TableHead className="hidden text-base font-semibold text-center md:table-cell">Giống</TableHead>
              <TableHead className="hidden text-base font-semibold lg:table-cell">Thông số</TableHead>
              <TableHead className="text-base font-semibold">Trạng thái</TableHead>
              <TableHead className="text-right text-base font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trees.map((tree) => (
              <TableRow key={tree.TreeTypeID} className="text-[16px] hover:bg-emerald-50/40">
                <TableCell>
                  <div className="flex gap-4">
                    <img
                      src={tree.ImageUrl}
                      alt={tree.TreeTypeName}
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-slate-900">{tree.TreeTypeName}</p>
                      </div>
                      <p className="text-sm italic text-slate-500 line-clamp-1 md:line-clamp-none">
                        {tree.ScientificName || "—"}
                      </p>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {truncateText(tree.Description, 60)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden text-center align-middle md:table-cell">
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="rounded-full bg-amber-50 px-4 py-1 text-sm text-amber-600">
                      {soilLookup[tree.SoilMasterID] || "Chưa gán"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="hidden text-center align-middle md:table-cell">
                  <div className="flex justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="cursor-help rounded-full bg-emerald-50 px-4 py-1 text-sm text-emerald-700">
                            {tree.Varieties.length} giống
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm font-semibold text-slate-900">Giống hiện có</p>
                          <ul className="mt-2 space-y-1 text-xs text-slate-600">
                            {tree.Varieties.map((item) => (
                              <li key={item.VarietyID}>{item.VarietyName}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <SpecsSummary tree={tree} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={tree.IsActive}
                      onCheckedChange={() => onToggleStatus(tree)}
                      className="scale-110"
                    />
                    <Badge
                      variant={tree.IsActive ? "default" : "secondary"}
                      className={cn(
                        "rounded-full px-4 py-1 text-sm",
                        tree.IsActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {tree.IsActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                      onClick={() => onManageVarieties(tree)}
                    >
                      Thêm giống
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-500 hover:text-emerald-600"
                      onClick={() => onEdit(tree)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-500 hover:text-rose-600"
                      onClick={() => onDelete(tree)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      {trees.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Leaf className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">Chưa có loại cây nào trùng khớp bộ lọc.</p>
        </div>
      )}
      {pagination && pagination.totalItems > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-600">
          <p>
            Hiển thị{" "}
            {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.totalItems)}-
            {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} trên {pagination.totalItems} loại cây
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TreeTypeManagement() {
  const [trees, setTrees] = useState([]);
  const [soils, setSoils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTree, setEditingTree] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    soil: "all",
    status: "all",
  });
  const [saving, setSaving] = useState(false);
  const [soilDialogOpen, setSoilDialogOpen] = useState(false);
  const [soilSaving, setSoilSaving] = useState(false);
  const [soilPage, setSoilPage] = useState(1);
  const [createSoilOverlayOpen, setCreateSoilOverlayOpen] = useState(false);
  const [selectedSoilId, setSelectedSoilId] = useState(null);
  const [pendingSoilCreate, setPendingSoilCreate] = useState(null);
  const [soilCreateConfirmOpen, setSoilCreateConfirmOpen] = useState(false);
  const [soilDetailSaving, setSoilDetailSaving] = useState(false);
  const [soilDeleting, setSoilDeleting] = useState(false);
  const [soilDeleteConfirmOpen, setSoilDeleteConfirmOpen] = useState(false);
  const [soilUpdateConfirmOpen, setSoilUpdateConfirmOpen] = useState(false);
  const [soilSearch, setSoilSearch] = useState("");
  const [pendingSoilUpdate, setPendingSoilUpdate] = useState(null);
  const [soilDetailEditMode, setSoilDetailEditMode] = useState(false);
  const [soilCancelConfirmOpen, setSoilCancelConfirmOpen] = useState(false);
  const [soilRevertConfirmOpen, setSoilRevertConfirmOpen] = useState(false);
  const [treePage, setTreePage] = useState(1);
  const [varietyDialogOpen, setVarietyDialogOpen] = useState(false);
  const [activeVarietyTree, setActiveVarietyTree] = useState(null);
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

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

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

  const selectedSoil = useMemo(
    () => soils.find((soil) => soil.SoilMasterID === selectedSoilId) ?? null,
    [selectedSoilId, soils],
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

  const totalSoilPages = Math.max(1, Math.ceil(filteredSoils.length / SOIL_PAGE_SIZE));
  const paginatedSoils = useMemo(() => {
    const start = (soilPage - 1) * SOIL_PAGE_SIZE;
    return filteredSoils.slice(start, start + SOIL_PAGE_SIZE);
  }, [soilPage, filteredSoils]);

  const soilRangeStart = filteredSoils.length ? (soilPage - 1) * SOIL_PAGE_SIZE + 1 : 0;
  const soilRangeEnd = filteredSoils.length
    ? Math.min(filteredSoils.length, soilRangeStart + paginatedSoils.length - 1)
    : 0;
  const shouldShowSoilPagination = filteredSoils.length > SOIL_PAGE_SIZE;

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    const [treeData, soilData] = await Promise.all([fetchTreeTypes(), fetchSoils()]);
    setTrees(treeData);
    setSoils(soilData);
    setSoilPage(1);
    setLoading(false);
  }, []);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredSoils.length / SOIL_PAGE_SIZE));
    setSoilPage((prev) => Math.min(prev, totalPages));
  }, [filteredSoils]);

  useEffect(() => {
    if (!soilDialogOpen) return;
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
      setSelectedSoilId(filteredSoils[0].SoilMasterID);
    }
  }, [soilDialogOpen, filteredSoils, selectedSoilId]);

  useEffect(() => {
    if (!soilDialogOpen) {
      soilDetailForm.reset(soilDefaultValues);
      setSoilDetailEditMode(false);
      setSoilPage(1);
      setCreateSoilOverlayOpen(false);
      setSoilCreateConfirmOpen(false);
      setPendingSoilCreate(null);
      setPendingSoilUpdate(null);
      setSoilUpdateConfirmOpen(false);
      soilForm.reset(soilDefaultValues);
      setSoilSearch("");
      return;
    }
    setPendingSoilUpdate(null);
    setSoilUpdateConfirmOpen(false);
    setSoilDetailEditMode(false);
    soilDetailForm.reset(mapSoilToFormValues(selectedSoil));
  }, [selectedSoil, soilDialogOpen, soilDetailForm, soilForm]);

  useEffect(() => {
    if (createSoilOverlayOpen) return;
    setPendingSoilCreate(null);
    setSoilCreateConfirmOpen(false);
    soilForm.reset(soilDefaultValues);
  }, [createSoilOverlayOpen, soilForm]);

  const filteredTrees = useMemo(() => {
    return trees.filter((tree) => {
      const searchMatch =
        filters.search.trim().length === 0 ||
        tree.TreeTypeName.toLowerCase().includes(filters.search.toLowerCase()) ||
        (tree.Description ?? "").toLowerCase().includes(filters.search.toLowerCase());
      const soilMatch = filters.soil === "all" || tree.SoilMasterID === filters.soil;
      const statusMatch =
        filters.status === "all" ||
        (filters.status === "active" ? tree.IsActive : !tree.IsActive);
      return searchMatch && soilMatch && statusMatch;
    });
  }, [trees, filters]);

  const totalTreePages = Math.max(1, Math.ceil(filteredTrees.length / TREE_PAGE_SIZE));

  useEffect(() => {
    setTreePage((prev) => Math.min(prev, totalTreePages));
  }, [totalTreePages]);

  useEffect(() => {
    setTreePage(1);
  }, [filters.search, filters.soil, filters.status]);

  const paginatedTrees = useMemo(() => {
    const start = (treePage - 1) * TREE_PAGE_SIZE;
    return filteredTrees.slice(start, start + TREE_PAGE_SIZE);
  }, [filteredTrees, treePage]);

  const handleOpenCreate = () => {
    form.reset(defaultFormValues);
    setEditingTree(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (tree) => {
    form.reset({
      TreeTypeName: tree.TreeTypeName,
      ScientificName: tree.ScientificName ?? "",
      AverageLifespanYears: tree.AverageLifespanYears,
      SoilMasterID: tree.SoilMasterID ?? "",
      Description: tree.Description ?? "",
      ImageUrl: tree.ImageUrl ?? "",
      OptimalTemperatureMin: tree.OptimalTemperatureMin,
      OptimalTemperatureMax: tree.OptimalTemperatureMax,
      OptimalHumidityMin: tree.OptimalHumidityMin,
      OptimalHumidityMax: tree.OptimalHumidityMax,
      DroughtTolerance: tree.DroughtTolerance ?? "Medium",
      FloodTolerance: tree.FloodTolerance ?? "Medium",
      FrostTolerance: tree.FrostTolerance ?? "Medium",
      WindTolerance: tree.WindTolerance ?? "Medium",
      IsActive: tree.IsActive ?? true,
    });
    setEditingTree(tree);
    setSheetOpen(true);
  };

  const handleSubmit = async (values) => {
    const trimmedName = values.TreeTypeName?.trim() ?? "";
    const duplicateTreeName = trees.some(
      (tree) =>
        tree.TreeTypeID !== editingTree?.TreeTypeID &&
        normalizeText(tree.TreeTypeName ?? "") === normalizeText(trimmedName),
    );

    if (duplicateTreeName) {
      form.setError("TreeTypeName", {
        type: "manual",
        message: buildDuplicateMessage("Loại cây", trimmedName),
      });
      return;
    }

    setSaving(true);
    try {
      if (editingTree) {
        const updated = await updateTreeType(editingTree.TreeTypeID, {
          ...editingTree,
          ...values,
        });
        setTrees((prev) => prev.map((tree) => (tree.TreeTypeID === updated.TreeTypeID ? updated : tree)));
      } else {
        const created = await createTreeType({
          ...values,
          Varieties: [],
        });
        setTrees((prev) => [created, ...prev]);
      }
      setSheetOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handlePrepareCreateSoil = (values) => {
    const trimmedName = values.SoilName?.trim() ?? "";
    const duplicateSoilName = soils.some(
      (soil) => normalizeText(soil.SoilName ?? "") === normalizeText(trimmedName),
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
      setSoils((prev) => [created, ...prev.filter((soil) => soil.SoilMasterID !== created.SoilMasterID)]);
      setSoilPage(1);
      form.setValue("SoilMasterID", created.SoilMasterID);
      setCreateSoilOverlayOpen(false);
      setSoilCreateConfirmOpen(false);
      setSelectedSoilId(created.SoilMasterID);
      soilForm.reset(soilDefaultValues);
      setPendingSoilCreate(null);
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
        normalizeText(soil.SoilName ?? "") === normalizeText(trimmedName),
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
        normalizeText(soil.SoilName ?? "") === normalizeText(trimmedName),
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
        prev.map((soil) => (soil.SoilMasterID === updated.SoilMasterID ? updated : soil)),
      );
      soilDetailForm.reset(mapSoilToFormValues(updated));
      setPendingSoilUpdate(null);
      setSoilUpdateConfirmOpen(false);
      setSoilDetailEditMode(false);
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
        const next = prev.filter((soil) => soil.SoilMasterID !== selectedSoilId);
        setSelectedSoilId(next[0]?.SoilMasterID ?? null);
        return next;
      });
      if (form.getValues("SoilMasterID") === selectedSoilId) {
        form.setValue("SoilMasterID", "");
      }
      setPendingSoilUpdate(null);
      setSoilUpdateConfirmOpen(false);
      setSoilDeleteConfirmOpen(false);
      setSoilCancelConfirmOpen(false);
      setSoilRevertConfirmOpen(false);
      setSoilDetailEditMode(false);
    } finally {
      setSoilDeleting(false);
    }
  };

  const handleToggleStatus = async (tree) => {
    const updated = await updateTreeType(tree.TreeTypeID, { IsActive: !tree.IsActive });
    setTrees((prev) => prev.map((item) => (item.TreeTypeID === updated.TreeTypeID ? updated : item)));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteTreeType(deleteTarget.TreeTypeID);
    setTrees((prev) => prev.filter((tree) => tree.TreeTypeID !== deleteTarget.TreeTypeID));
    setDeleteTarget(null);
  };

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

  const handleOpenVarietyDialog = (tree) => {
    setActiveVarietyTree(tree);
    setSelectedVarietyId(tree.Varieties?.[0]?.VarietyID ?? null);
    setVarietySearch("");
    setVarietyDetailEditMode(false);
    setVarietyPage(1);
    setCreateVarietyOverlayOpen(false);
    setVarietyCreateConfirmOpen(false);
    setPendingVarietyCreate(null);
    setPendingVarietyUpdate(null);
    setVarietyUpdateConfirmOpen(false);
    setVarietyCancelEditConfirmOpen(false);
    setVarietyRevertConfirmOpen(false);
    varietyForm.reset({
      VarietyID: "",
      VarietyName: "",
      VarietyDescription: "",
    });
    varietyDetailForm.reset(mapVarietyToFormValues(tree.Varieties?.[0] ?? null));
    setVarietyDialogOpen(true);
  };

  const filteredVarieties = useMemo(() => {
    if (!activeVarietyTree) return [];
    const items = activeVarietyTree.Varieties || [];
    const term = varietySearch.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => {
      const name = item.VarietyName?.toLowerCase() ?? "";
      const id = item.VarietyID?.toLowerCase() ?? "";
      return name.includes(term) || id.includes(term);
    });
  }, [activeVarietyTree, varietySearch]);

  const totalVarietyPages = Math.max(1, Math.ceil(filteredVarieties.length / VARIETY_PAGE_SIZE));

  const paginatedVarieties = useMemo(() => {
    if (!filteredVarieties.length) return [];
    const startIndex = (varietyPage - 1) * VARIETY_PAGE_SIZE;
    return filteredVarieties.slice(startIndex, startIndex + VARIETY_PAGE_SIZE);
  }, [filteredVarieties, varietyPage]);

  useEffect(() => {
    setVarietyPage(1);
  }, [activeVarietyTree, varietySearch]);

  useEffect(() => {
    if (filteredVarieties.length === 0) {
      if (varietyPage !== 1) {
        setVarietyPage(1);
      }
      return;
    }
    const maxPage = Math.max(1, Math.ceil(filteredVarieties.length / VARIETY_PAGE_SIZE));
    if (varietyPage > maxPage) {
      setVarietyPage(maxPage);
    }
  }, [filteredVarieties.length, varietyPage]);

  const varietyRangeStart = filteredVarieties.length
    ? (varietyPage - 1) * VARIETY_PAGE_SIZE + 1
    : 0;
  const varietyRangeEnd = filteredVarieties.length
    ? Math.min(filteredVarieties.length, varietyRangeStart + paginatedVarieties.length - 1)
    : 0;
  const shouldShowVarietyPagination = filteredVarieties.length > VARIETY_PAGE_SIZE;

  const selectedVariety = useMemo(() => {
    if (!activeVarietyTree) return null;
    return activeVarietyTree.Varieties?.find((item) => item.VarietyID === selectedVarietyId) ?? null;
  }, [activeVarietyTree, selectedVarietyId]);

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
  };

  useEffect(() => {
    if (!varietyDialogOpen) {
      setActiveVarietyTree(null);
      setSelectedVarietyId(null);
      setVarietySearch("");
      setCreateVarietyOverlayOpen(false);
      setVarietyCreateConfirmOpen(false);
      setPendingVarietyCreate(null);
      setVarietyDetailEditMode(false);
      setPendingVarietyUpdate(null);
      setVarietyUpdateConfirmOpen(false);
      setVarietyCancelEditConfirmOpen(false);
      setVarietyRevertConfirmOpen(false);
      varietyForm.reset({
        VarietyID: "",
        VarietyName: "",
        VarietyDescription: "",
      });
      varietyDetailForm.reset({
        VarietyID: "",
        VarietyName: "",
        VarietyDescription: "",
      });
      setVarietyDeleteConfirmOpen(false);
      setVarietySaving(false);
      setVarietyDeleting(false);
      return;
    }

    if (!activeVarietyTree) return;
    const currentVarieties = activeVarietyTree.Varieties || [];
    const selected =
      currentVarieties.find((item) => item.VarietyID === selectedVarietyId) ||
      currentVarieties[0] ||
      null;
    if (selected) {
      setSelectedVarietyId(selected.VarietyID);
      varietyDetailForm.reset(mapVarietyToFormValues(selected));
    } else {
      setSelectedVarietyId(null);
      setVarietyDetailEditMode(false);
      varietyDetailForm.reset({
        VarietyID: "",
        VarietyName: "",
        VarietyDescription: "",
      });
    }
  }, [varietyDialogOpen, activeVarietyTree, selectedVarietyId, varietyDetailForm, varietyForm]);

  const handleSelectVariety = (varietyId) => {
    setSelectedVarietyId(varietyId);
    setVarietyDetailEditMode(false);
  };

  const syncUpdatedTreeVarieties = (updatedTree) => {
    setTrees((prev) =>
      prev.map((tree) => (tree.TreeTypeID === updatedTree.TreeTypeID ? updatedTree : tree)),
    );
    setActiveVarietyTree(updatedTree);
  };

  const handlePrepareCreateVariety = (values) => {
    if (!activeVarietyTree) return;

    const trimmedName = values.VarietyName?.trim() ?? "";
    const duplicateVarietyName = (activeVarietyTree.Varieties || []).some(
      (item) => normalizeText(item.VarietyName ?? "") === normalizeText(trimmedName),
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
    if (!activeVarietyTree) return;
    const values = payloadOverride ?? pendingVarietyCreate;
    if (!values) return;
    setVarietySaving(true);
    try {
      const newList = [
        ...(activeVarietyTree.Varieties || []),
        {
          VarietyID: values.VarietyID,
          VarietyName: values.VarietyName,
          VarietyDescription: values.VarietyDescription ?? "",
        },
      ];
      const updated = await updateTreeType(activeVarietyTree.TreeTypeID, {
        ...activeVarietyTree,
        Varieties: newList,
      });
      syncUpdatedTreeVarieties(updated);
      varietyForm.reset({
        VarietyID: "",
        VarietyName: "",
        VarietyDescription: "",
      });
      setSelectedVarietyId(
        updated.Varieties?.[updated.Varieties.length - 1]?.VarietyID ?? null,
      );
      setVarietyDetailEditMode(false);
      setCreateVarietyOverlayOpen(false);
      setVarietyCreateConfirmOpen(false);
      setPendingVarietyCreate(null);
    } finally {
      setVarietySaving(false);
    }
  };

  const handleUpdateVariety = async (valuesOverride) => {
    const values = valuesOverride ?? pendingVarietyUpdate;
    if (!activeVarietyTree || !selectedVarietyId || !values) return;
    setVarietySaving(true);
    try {
      const newList = (activeVarietyTree.Varieties || []).map((item) =>
        item.VarietyID === selectedVarietyId
          ? {
              ...item,
              VarietyName: values.VarietyName,
              VarietyDescription: values.VarietyDescription ?? "",
            }
          : item,
      );
      const updated = await updateTreeType(activeVarietyTree.TreeTypeID, {
        ...activeVarietyTree,
        Varieties: newList,
      });
      syncUpdatedTreeVarieties(updated);
      setVarietyDetailEditMode(false);
      setPendingVarietyUpdate(null);
      setVarietyUpdateConfirmOpen(false);
    } finally {
      setVarietySaving(false);
    }
  };

  const handlePrepareUpdateVariety = (values) => {
    if (!varietyDetailEditMode) return;

    const trimmedName = values.VarietyName?.trim() ?? "";
    const duplicateVarietyName = (activeVarietyTree?.Varieties || []).some(
      (item) =>
        item.VarietyID !== selectedVarietyId &&
        normalizeText(item.VarietyName ?? "") === normalizeText(trimmedName),
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

  const handleStartVarietyEdit = () => {
    if (!selectedVariety) return;
    setVarietyDetailEditMode(true);
    resetVarietyDetailToSelected();
  };

  const handleConfirmCancelVarietyEdit = () => {
    resetVarietyDetailToSelected();
    setVarietyDetailEditMode(false);
    setPendingVarietyUpdate(null);
    setVarietyUpdateConfirmOpen(false);
    setVarietyCancelEditConfirmOpen(false);
  };

  const handleConfirmRevertVarietyChanges = () => {
    resetVarietyDetailToSelected();
    setVarietyRevertConfirmOpen(false);
  };

  const handleDeleteVariety = async () => {
    if (!activeVarietyTree || !selectedVarietyId) return;
    setVarietyDeleting(true);
    try {
      const newList = (activeVarietyTree.Varieties || []).filter(
        (item) => item.VarietyID !== selectedVarietyId,
      );
      const updated = await updateTreeType(activeVarietyTree.TreeTypeID, {
        ...activeVarietyTree,
        Varieties: newList,
      });
      syncUpdatedTreeVarieties(updated);
      setSelectedVarietyId(updated.Varieties?.[0]?.VarietyID ?? null);
      setVarietyDeleteConfirmOpen(false);
      setVarietyDetailEditMode(false);
      setVarietyCancelEditConfirmOpen(false);
      setVarietyRevertConfirmOpen(false);
    } finally {
      setVarietyDeleting(false);
    }
  };

  const renderSheet = () => (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent className="sm:max-w-xl lg:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {editingTree ? "Chỉnh sửa loại cây" : "Thêm loại cây mới"}
          </SheetTitle>
        
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
          <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)}>
              <section className="space-y-4">
                <p className="inline-flex items-center rounded-full bg-emerald-600/90 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-white">
                  Thông tin chung
                </p>
                <FormField
                  control={form.control}
                  name="ImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh đại diện</FormLabel>
                      <FormControl>
                        <ImageDropzone value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="TreeTypeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên loại cây</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Xoài,Bưởi,Thanh Long,.." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ScientificName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên khoa học</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Mangifera indica" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="AverageLifespanYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tuổi thọ trung bình (năm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ví dụ: 25"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="SoilMasterID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại đất phù hợp</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 w-full">
                              <SelectValue placeholder="Chọn loại đất" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {soils.map((soil) => (
                              <SelectItem key={soil.SoilMasterID} value={soil.SoilMasterID}>
                                {soil.SoilName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="Description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Thông tin mô tả, lợi thế, quy trình canh tác..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-4">
                <p className="inline-flex items-center rounded-full bg-emerald-600/90 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-white">
                  Thông số môi trường
                </p>
                <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="OptimalTemperatureMin"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={environmentLabelClass}>Nhiệt độ tối thiểu (°C)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="OptimalTemperatureMax"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={environmentLabelClass}>Nhiệt độ tối đa (°C)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="OptimalHumidityMin"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={environmentLabelClass}>Độ ẩm tối thiểu (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="OptimalHumidityMax"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={environmentLabelClass}>Độ ẩm tối đa (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {["DroughtTolerance", "FloodTolerance", "FrostTolerance", "WindTolerance"].map(
                    (fieldName) => (
                      <FormField
                        key={fieldName}
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={environmentLabelClass}>
                              {fieldName === "DroughtTolerance" && "Khả năng hạn"}
                              {fieldName === "FloodTolerance" && "Khả năng ngập"}
                              {fieldName === "FrostTolerance" && "Khả năng sương giá"}
                              {fieldName === "WindTolerance" && "Khả năng gió mạnh"}
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Chọn mức" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {toleranceLevels.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ),
                  )}
                </div>
              </section>
              <SheetFooter>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  const renderSoilDialog = () => (
    <Dialog
      open={soilDialogOpen}
      onOpenChange={(open) => {
        setSoilDialogOpen(open);
        if (!open) {
          soilForm.reset(soilDefaultValues);
          soilDetailForm.reset(soilDefaultValues);
          setSelectedSoilId(null);
          setSoilDeleteConfirmOpen(false);
          setCreateSoilOverlayOpen(false);
          setPendingSoilCreate(null);
          setSoilCreateConfirmOpen(false);
        }
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Quản lý loại đất</DialogTitle>
          <DialogDescription>
            Xem danh sách loại đất, chỉnh sửa thông tin chi tiết và bổ sung loại đất mới.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
           
            <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={soilSearch}
                  onChange={(event) => setSoilSearch(event.target.value)}
                  placeholder="Tìm kiếm theo tên hoặc mã đất..."
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setCreateSoilOverlayOpen(true)}>Thêm đất</Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <ScrollArea className="max-h-[420px] overflow-visible pr-2">
                  <div className="grid gap-2">
                    {soils.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-emerald-200/60 bg-white/80 px-4 py-6 text-center text-sm text-slate-500">
                        <Layers className="h-5 w-5 text-emerald-300" />
                        Chưa có loại đất nào. Bấm &quot;Thêm đất&quot; để bắt đầu.
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
                                : "border-slate-200 hover:border-emerald-200",
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
                              <p className="text-xs text-slate-500">{soil.SoilMasterID}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                                isActive
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                  : "border-slate-300 bg-white text-slate-600",
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
                          onClick={() => setSoilPage((prev) => Math.max(1, prev - 1))}
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
                            setSoilPage((prev) => Math.min(totalSoilPages, prev + 1))
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

            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
              {selectedSoil ? (
                <>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {selectedSoil.SoilMasterID}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">{selectedSoil.SoilName}</h3>
                    <p className="text-sm text-slate-500">Cập nhật thông tin chi tiết cho loại đất này.</p>
                  </div>
                  <Form {...soilDetailForm}>
                    <form
                      className="space-y-4"
                      onSubmit={soilDetailForm.handleSubmit(handlePrepareUpdateSoil)}
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
                                disabled={!soilDetailEditMode || soilDetailSaving}
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
                                  disabled={!soilDetailEditMode || soilDetailSaving}
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
                                  disabled={!soilDetailEditMode || soilDetailSaving}
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
                                  disabled={!soilDetailEditMode || soilDetailSaving}
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
                          control={soilDetailForm.control}
                          name="EC_dS_m"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Độ mặn EC (dS/m)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  disabled={!soilDetailEditMode || soilDetailSaving}
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
                        control={soilDetailForm.control}
                        name="Notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ghi chú</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Ghi chú thêm..."
                                disabled={!soilDetailEditMode || soilDetailSaving}
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
                          <Button type="button" onClick={handleStartEditSoil} disabled={!selectedSoil}>
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
        </div>

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
                Hoàn tác sẽ đưa tất cả trường về dữ liệu hiện tại của loại đất&nbsp;
                <span className="font-semibold text-slate-900">
                  {selectedSoil?.SoilName || "đang chọn"}
                </span>
                . Tiếp tục?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={soilDetailSaving}>Huỷ</AlertDialogCancel>
              <AlertDialogAction onClick={handleRevertSoilEdit} disabled={soilDetailSaving}>
                Đồng ý
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
                Bạn sẽ thoát chế độ chỉnh sửa và mọi thay đổi chưa lưu sẽ bị bỏ. Chắc chắn muốn huỷ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={soilDetailSaving}>Tiếp tục chỉnh sửa</AlertDialogCancel>
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
                Thao tác này sẽ xoá vĩnh viễn {selectedSoil?.SoilName ?? "loại đất"} khỏi danh sách và không thể hoàn tác.
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
                  {pendingSoilUpdate?.SoilName || selectedSoil?.SoilName || "đang chọn"}
                </span>
                ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={soilDetailSaving}>Huỷ</AlertDialogCancel>
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
      </DialogContent>
    </Dialog>
  );

  const renderCreateSoilOverlay = () => (
    <>
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
            <form className="space-y-4" onSubmit={soilForm.handleSubmit(handlePrepareCreateSoil)}>
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
                <Button type="button" variant="outline" onClick={() => setCreateSoilOverlayOpen(false)}>
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
              <span className="font-semibold text-slate-900">{pendingSoilCreate?.SoilName || "mới"}</span>. Hãy xác
              nhận để hoàn tất thao tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={soilSaving}>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleCreateSoil(pendingSoilCreate)} disabled={soilSaving}>
              {soilSaving ? "Đang lưu..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  const renderCreateVarietyOverlay = () => (
    <>
      <Dialog
        open={createVarietyOverlayOpen}
        onOpenChange={(open) => {
          if (varietySaving) return;
          setCreateVarietyOverlayOpen(open);
          if (!open) {
            setVarietyCreateConfirmOpen(false);
            setPendingVarietyCreate(null);
            varietyForm.reset({
              VarietyID: "",
              VarietyName: "",
              VarietyDescription: "",
            });
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm giống mới</DialogTitle>
            <DialogDescription>
              Điền thông tin giống và xác nhận để bổ sung vào loại cây hiện tại.
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
                      <Input placeholder="Ví dụ: Hass Premium" {...field} />
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
                      <Textarea placeholder="Đặc điểm nổi bật" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50"
                  onClick={() => setCreateVarietyOverlayOpen(false)}
                  disabled={varietySaving}
                >
                  Huỷ
                </Button>
                <Button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500"
                  disabled={varietySaving || !activeVarietyTree}
                >
                  {varietySaving ? "Đang xử lý..." : "Thêm giống"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={varietyCreateConfirmOpen}
        onOpenChange={(open) => {
          if (varietySaving) return;
          setVarietyCreateConfirmOpen(open);
          if (!open) {
            setPendingVarietyCreate(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thêm giống mới</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn chuẩn bị thêm giống&nbsp;
              <span className="font-semibold text-slate-900">{pendingVarietyCreate?.VarietyName || "mới"}</span>
              . Vui lòng xác nhận để tiếp tục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={varietySaving}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-500"
              onClick={() => handleCreateVariety(pendingVarietyCreate)}
              disabled={varietySaving}
            >
              {varietySaving ? "Đang lưu..." : "Thêm giống"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  const renderVarietyDialog = () => (
    <Dialog
      open={varietyDialogOpen}
      onOpenChange={(open) => {
        if (!open && (varietySaving || varietyDeleting)) return;
        setVarietyDialogOpen(open);
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Quản lý giống cây</DialogTitle>
          <DialogDescription>
            Thêm, tìm kiếm và chỉnh sửa các giống thuộc loại cây{" "}
            <span className="font-semibold text-slate-900">
              {activeVarietyTree?.TreeTypeName || ""}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={varietySearch}
                  onChange={(event) => setVarietySearch(event.target.value)}
                  placeholder="Tìm kiếm theo tên hoặc mã giống..."
                  className="h-11 rounded-2xl border-slate-200 bg-white/80 pl-9"
                />
              </div>
            </div>
            <Button
              className="w-full gap-2 rounded-2xl bg-emerald-600 px-5 py-2 text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500 sm:w-auto"
              onClick={() => setCreateVarietyOverlayOpen(true)}
              disabled={!activeVarietyTree}
            >
              <Plus className="h-4 w-4" />
              Thêm giống mới
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <ScrollArea className="max-h-[440px] overflow-visible pr-2">
                  <div className="grid gap-2">
                  {!activeVarietyTree || (activeVarietyTree.Varieties || []).length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-emerald-200/60 bg-white/80 px-4 py-6 text-center text-sm text-slate-500">
                      <Layers className="h-5 w-5 text-emerald-300" />
                      Chưa có giống nào. Bấm &quot;Thêm giống mới&quot; để bắt đầu.
                    </div>
                  ) : filteredVarieties.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-emerald-200/60 bg-white/80 px-4 py-6 text-center text-sm text-slate-500">
                      <Search className="h-5 w-5 text-emerald-300" />
                      Không tìm thấy giống phù hợp với từ khoá.
                    </div>
                  ) : (
                    paginatedVarieties.map((item, index) => {
                      const isActive = selectedVarietyId === item.VarietyID;
                      const absoluteIndex = varietyRangeStart + index;
                      return (
                        <div
                          key={item.VarietyID}
                          className={cn(
                            "group relative flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                            isActive
                              ? "border-emerald-500 shadow-sm shadow-emerald-100"
                              : "border-black hover:border-slate-700",
                          )}
                          onClick={() => handleSelectVariety(item.VarietyID)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleSelectVariety(item.VarietyID);
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
                              {item.VarietyName}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                              isActive ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-slate-300 bg-white text-slate-600",
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
                {filteredVarieties.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-3 text-xs text-slate-500">
                    {shouldShowVarietyPagination && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full px-3 text-xs"
                          onClick={() => setVarietyPage((prev) => Math.max(1, prev - 1))}
                          disabled={varietyPage === 1}
                        >
                          Trước
                        </Button>
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                          Trang {varietyPage}/{totalVarietyPages}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full px-3 text-xs"
                          onClick={() =>
                            setVarietyPage((prev) => Math.min(totalVarietyPages, prev + 1))
                          }
                          disabled={varietyPage === totalVarietyPages}
                        >
                          Sau
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-white/95 p-6 shadow-lg shadow-emerald-50">
              {selectedVarietyId && activeVarietyTree ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-400">
                        Chi tiết giống
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold text-slate-900">
                        {selectedVariety?.VarietyName}
                      </h3>
                    </div>
                    {!varietyDetailEditMode && (
                      <Button
                        variant="outline"
                        className="rounded-2xl border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        onClick={handleStartVarietyEdit}
                      >
                        Sửa
                      </Button>
                    )}
                  </div>
                  <Separator className="my-4" />
                  <Form {...varietyDetailForm}>
                    <form
                      className="space-y-4"
                      onSubmit={varietyDetailForm.handleSubmit(handlePrepareUpdateVariety)}
                    >
                      <FormField
                        control={varietyDetailForm.control}
                        name="VarietyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên giống</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!varietyDetailEditMode || varietySaving}
                                className={cn(
                                  "h-11 rounded-2xl",
                                  !varietyDetailEditMode && "bg-slate-50 text-slate-500",
                                )}
                              />
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
                              <Textarea
                                {...field}
                                disabled={!varietyDetailEditMode || varietySaving}
                                className={cn(
                                  "min-h-[120px] rounded-2xl",
                                  !varietyDetailEditMode && "bg-slate-50 text-slate-500",
                                )}
                                placeholder="Đặc điểm nổi bật, vùng canh tác phù hợp..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {varietyDetailEditMode ? (
                        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-amber-600 hover:bg-amber-50"
                            onClick={() => setVarietyRevertConfirmOpen(true)}
                            disabled={varietySaving}
                          >
                            Hoàn tác
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-rose-200 text-rose-600 hover:bg-rose-50"
                            onClick={() => setVarietyCancelEditConfirmOpen(true)}
                            disabled={varietySaving}
                          >
                            Huỷ
                          </Button>
                          <Button
                            type="submit"
                            disabled={!varietyDetailEditMode || varietySaving}
                            className="bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            {varietySaving ? "Đang lưu..." : "Lưu thay đổi"}
                          </Button>
                        </div>
                      ) : (
                        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                          Trạng thái chỉ xem. Bấm &quot;Sửa&quot; để mở khoá chỉnh sửa.
                        </p>
                      )}
                    </form>
                  </Form>
                  <Separator className="my-4" />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => setVarietyDeleteConfirmOpen(true)}
                    disabled={varietyDeleting}
                  >
                    Xoá giống
                  </Button>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center text-slate-500">
                  <Layers className="h-10 w-10 text-emerald-200" />
                  Chọn một giống ở danh sách bên trái để xem chi tiết.
                </div>
              )}
            </div>
          </div>
        </div>

        <AlertDialog
          open={varietyDeleteConfirmOpen}
          onOpenChange={(open) => {
            if (!varietyDeleting) {
              setVarietyDeleteConfirmOpen(open);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xoá giống cây</AlertDialogTitle>
              <AlertDialogDescription>
                Thao tác này sẽ xoá vĩnh viễn giống đang chọn khỏi loại cây và không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={varietyDeleting}>Huỷ</AlertDialogCancel>
              <AlertDialogAction
                className="bg-rose-600 hover:bg-rose-500"
                onClick={handleDeleteVariety}
                disabled={varietyDeleting}
              >
                {varietyDeleting ? "Đang xoá..." : "Xoá giống"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={varietyUpdateConfirmOpen}
          onOpenChange={(open) => {
            if (varietySaving) return;
            setVarietyUpdateConfirmOpen(open);
            if (!open) {
              setPendingVarietyUpdate(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận lưu thay đổi</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn cập nhật thông tin giống{" "}
                <span className="font-semibold text-slate-900">
                  {pendingVarietyUpdate?.VarietyName || selectedVariety?.VarietyName}
                </span>
                ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={varietySaving}>Huỷ</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleUpdateVariety(pendingVarietyUpdate)}
                disabled={varietySaving}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                {varietySaving ? "Đang lưu..." : "Lưu thay đổi"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={varietyCancelEditConfirmOpen}
          onOpenChange={(open) => {
            if (varietySaving) return;
            setVarietyCancelEditConfirmOpen(open);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Huỷ chỉnh sửa?</AlertDialogTitle>
              <AlertDialogDescription>
                Mọi thay đổi đang thực hiện sẽ bị bỏ qua và khung chi tiết trở lại trạng thái chỉ xem.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={varietySaving}>Tiếp tục chỉnh sửa</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmCancelVarietyEdit}
                className="bg-rose-600 hover:bg-rose-500"
                disabled={varietySaving}
              >
                Huỷ chỉnh sửa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={varietyRevertConfirmOpen}
          onOpenChange={(open) => {
            if (varietySaving) return;
            setVarietyRevertConfirmOpen(open);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hoàn tác thay đổi</AlertDialogTitle>
              <AlertDialogDescription>
                Mẫu sẽ được đưa về giá trị mới nhất đã lưu. Bạn có chắc chắn?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={varietySaving}>Không</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmRevertVarietyChanges}
                className="bg-amber-500 hover:bg-amber-400"
                disabled={varietySaving}
              >
                Hoàn tác
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <LivingBackground
        baseColor={BACKGROUND_PALETTE.bg}
        palette={[BACKGROUND_PALETTE.leaf, BACKGROUND_PALETTE.ivory, BACKGROUND_PALETTE.accent]}
        density={24}
      />
      <div className="relative z-10 min-h-screen">
        <AdminLayout>
          <div className="flex h-full min-h-full w-full flex-1 flex-col gap-6 px-4 py-8 text-[15px] leading-relaxed sm:px-6 sm:text-base lg:px-12">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.4em] text-emerald-200">
                  <Leaf className="h-4 w-4" />
                  Business Admin
                </p>
                <h1 className="mt-2 text-4xl font-bold text-white">Quản lý loại cây</h1>
                <p className="text-base text-white/80">
                  Theo dõi, điều chỉnh TreeTypes và các giống cây đi kèm trong hệ thống.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto">
                <div className="relative w-full min-w-[220px] sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                  <Input
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    placeholder="Tìm kiếm loại cây..."
                    className="h-12 rounded-xl border-white/40 bg-white/10 pl-10 text-white placeholder:text-white/70 focus-visible:border-white focus-visible:bg-white focus-visible:text-slate-900 focus-visible:ring-emerald-200"
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 border-white/40 bg-white/10 text-white transition hover:bg-white/20 hover:text-white"
                    onClick={() => setSoilDialogOpen(true)}
                  >
                    <Layers className="h-4 w-4" />
                    Quản lý đất
                  </Button>
                  <Button
                    onClick={handleOpenCreate}
                    className="gap-2 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm loại cây
                  </Button>
                </div>
              </div>
            </div>

            <FilterBar filters={filters} onChange={setFilters} soils={soils} />

            <section className="flex flex-1 min-h-0 flex-col">
              {loading ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
                </div>
              ) : (
                <TreeTable
                  trees={paginatedTrees}
                  soils={soils}
                  onEdit={handleOpenEdit}
                  onDelete={(tree) => setDeleteTarget(tree)}
                  onToggleStatus={handleToggleStatus}
                  onManageVarieties={handleOpenVarietyDialog}
                  pagination={{
                    page: treePage,
                    totalPages: totalTreePages,
                    totalItems: filteredTrees.length,
                    pageSize: TREE_PAGE_SIZE,
                    onPageChange: (page) => setTreePage(page),
                  }}
                />
              )}
            </section>

            {renderSheet()}
            {renderSoilDialog()}
            {renderCreateSoilOverlay()}
            {renderVarietyDialog()}
            {renderCreateVarietyOverlay()}

            <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xoá loại cây</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động không thể hoàn tác. TreeType "{deleteTarget?.TreeTypeName}" sẽ bị xoá khỏi danh sách.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Huỷ</AlertDialogCancel>
                  <AlertDialogAction className="bg-rose-600 hover:bg-rose-500" onClick={handleDelete}>
                    Xoá
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