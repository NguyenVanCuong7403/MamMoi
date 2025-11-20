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
import { useForm, useFieldArray } from "react-hook-form";
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

const SOIL_PAGE_SIZE = 10;
const VARIETY_PAGE_SIZE = 4;
const TREE_PAGE_SIZE = 8;
const environmentLabelClass = "text-[13px] font-semibold text-slate-600 leading-tight min-h-[32px]";

const toleranceLevels = [
  { value: "Low", label: "Thấp" },
  { value: "Medium", label: "Trung bình" },
  { value: "High", label: "Cao" },
  { value: "None", label: "Không xác định" },
];

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
    Varieties: z.array(varietySchema).min(1, "Thêm ít nhất 1 giống cây"),
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
  Varieties: [
    { VarietyID: "", VarietyName: "", VarietyDescription: "" },
  ],
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

function TreeTable({ trees, soils, onEdit, onDelete, onToggleStatus, pagination }) {
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
                  <div className="flex justify-end gap-2">
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
  const [soilSearch, setSoilSearch] = useState("");
  const [varietyPage, setVarietyPage] = useState(1);
  const [treePage, setTreePage] = useState(1);

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

  const { fields: varietyFields, append, remove } = useFieldArray({
    control: form.control,
    name: "Varieties",
  });
  const totalVarietyPages = Math.max(1, Math.ceil(varietyFields.length / VARIETY_PAGE_SIZE));
  const varietyPageStart = (varietyPage - 1) * VARIETY_PAGE_SIZE;
  const visibleVarietyFields = varietyFields.slice(
    varietyPageStart,
    varietyPageStart + VARIETY_PAGE_SIZE,
  );

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
    setVarietyPage((prev) => Math.min(prev, totalVarietyPages));
  }, [totalVarietyPages]);

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
      setSoilPage(1);
      setCreateSoilOverlayOpen(false);
      setSoilCreateConfirmOpen(false);
      setPendingSoilCreate(null);
      soilForm.reset(soilDefaultValues);
      setSoilSearch("");
      return;
    }
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
    setVarietyPage(1);
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
      Varieties:
        tree.Varieties?.length > 0
          ? tree.Varieties
          : [{ VarietyID: "", VarietyName: "", VarietyDescription: "" }],
      IsActive: tree.IsActive ?? true,
    });
    setEditingTree(tree);
    setVarietyPage(1);
    setSheetOpen(true);
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      if (editingTree) {
        const updated = await updateTreeType(editingTree.TreeTypeID, values);
        setTrees((prev) => prev.map((tree) => (tree.TreeTypeID === updated.TreeTypeID ? updated : tree)));
      } else {
        const created = await createTreeType(values);
        setTrees((prev) => [created, ...prev]);
      }
      setSheetOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handlePrepareCreateSoil = (values) => {
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
    setSelectedSoilId(soilId);
  };

  const handleUpdateSoil = async (values) => {
    if (!selectedSoilId) return;
    setSoilDetailSaving(true);
    try {
      const updated = await updateSoil(selectedSoilId, values);
      setSoils((prev) => prev.map((soil) => (soil.SoilMasterID === updated.SoilMasterID ? updated : soil)));
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
      setSoilDeleteConfirmOpen(false);
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
                          <Input placeholder="Ví dụ: Xoài cát Hòa Lộc" {...field} />
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

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="inline-flex items-center rounded-full bg-emerald-600/90 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-white">
                      Danh sách giống cây
                    </p>
                    <p className="text-sm text-slate-500">
                      Quản lý trực tiếp các giống thuộc loại cây này.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      append({ VarietyID: "", VarietyName: "", VarietyDescription: "" });
                      const nextPage = Math.max(
                        1,
                        Math.ceil((varietyFields.length + 1) / VARIETY_PAGE_SIZE),
                      );
                      setVarietyPage(nextPage);
                    }}
                  >
                    + Thêm giống mới
                  </Button>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  {visibleVarietyFields.map((fieldItem, index) => {
                    const actualIndex = varietyPageStart + index;
                    return (
                      <div key={fieldItem.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                          <Layers className="h-3.5 w-3.5" />
                          Giống {actualIndex + 1}
                        </div>
                        {varietyFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:text-rose-600"
                            onClick={() => remove(actualIndex)}
                          >
                            Xoá
                          </Button>
                        )}
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`Varieties.${actualIndex}.VarietyName`}
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
                          control={form.control}
                          name={`Varieties.${actualIndex}.VarietyDescription`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mô tả</FormLabel>
                              <FormControl>
                                <Input placeholder="Điểm nổi bật" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      </div>
                    );
                  })}
                  {varietyFields.length === 0 && (
                    <p className="text-sm text-slate-500">Chưa có giống nào.</p>
                  )}
                  {varietyFields.length > VARIETY_PAGE_SIZE && (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-slate-600">
                      <span>
                        Trang {varietyPage}/{totalVarietyPages}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={varietyPage === 1}
                          onClick={() => setVarietyPage((prev) => Math.max(1, prev - 1))}
                        >
                          Trước
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={varietyPage >= totalVarietyPages}
                          onClick={() =>
                            setVarietyPage((prev) => Math.min(totalVarietyPages, prev + 1))
                          }
                        >
                          Sau
                        </Button>
                      </div>
                    </div>
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
              <ScrollArea className="max-h-[420px] rounded-2xl border border-slate-200 bg-white/70 p-3">
                <div className="space-y-3">
                  {soils.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                      <Layers className="h-5 w-5 text-slate-400" />
                      Chưa có loại đất nào. Bấm &quot;Thêm đất&quot; để bắt đầu.
                    </div>
                  ) : filteredSoils.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                      <Search className="h-5 w-5 text-slate-400" />
                      Không tìm thấy loại đất phù hợp với từ khoá.
                    </div>
                  ) : (
                    paginatedSoils.map((soil) => {
                      const isActive = selectedSoilId === soil.SoilMasterID;
                      return (
                        <div
                          key={soil.SoilMasterID}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                            isActive ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-200",
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
                          <div>
                            <p className="font-semibold text-slate-900">{soil.SoilName}</p>
                            <p className="text-xs text-slate-500">{soil.SoilMasterID}</p>
                          </div>
                          {isActive && (
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
                              Đang chọn
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
              {filteredSoils.length > 0 && (
                <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/60 px-3 py-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>
                      Trang {soilPage}/{totalSoilPages}
                    </span>
                    <span>{filteredSoils.length} loại đất</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={soilPage === 1}
                      onClick={() => setSoilPage((prev) => Math.max(1, prev - 1))}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={soilPage >= totalSoilPages || filteredSoils.length === 0}
                      onClick={() =>
                        setSoilPage((prev) => Math.min(totalSoilPages, prev + 1))
                      }
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
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
                    <form className="space-y-4" onSubmit={soilDetailForm.handleSubmit(handleUpdateSoil)}>
                      <FormField
                        control={soilDetailForm.control}
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
                          control={soilDetailForm.control}
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
                          control={soilDetailForm.control}
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
                          control={soilDetailForm.control}
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
                          control={soilDetailForm.control}
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
                        control={soilDetailForm.control}
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
                      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => soilDetailForm.reset(mapSoilToFormValues(selectedSoil))}
                        >
                          Hoàn tác
                        </Button>
                        <Button type="submit" disabled={soilDetailSaving}>
                          {soilDetailSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                      </div>
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
