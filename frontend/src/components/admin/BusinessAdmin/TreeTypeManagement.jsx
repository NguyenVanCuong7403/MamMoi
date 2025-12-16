import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  X,
  AlertTriangle,
  Bug,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import AdminTreeRepository from "@/API/repositories/AdminTreeRepository";
import AdminSoilMasterRepository from "@/API/repositories/AdminSoilMasterRepository";

const BACKGROUND_PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};

const SOIL_PAGE_SIZE = 5;
const TREE_PAGE_SIZE = 8;
const VARIETY_PAGE_SIZE = 5;
const environmentLabelClass =
  "text-[13px] font-semibold text-slate-600 leading-tight min-h-[32px]";

const toleranceLevels = [
  {
    value: "Low",
    label: "Thấp",
    color: "text-rose-700 bg-rose-50 border-rose-200",
  },
  {
    value: "Medium",
    label: "Trung bình",
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    value: "High",
    label: "Cao",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    value: "None",
    label: "Không xác định",
    color: "text-slate-600 bg-slate-50 border-slate-200",
  },
];

// Màu sắc cho mức độ bệnh (đồng bộ với PlantDetail.jsx)
const severityColors = {
  High: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
    icon: "text-red-600",
  },
  Medium: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-300",
    icon: "text-orange-600",
  },
  Low: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-300",
    icon: "text-yellow-600",
  },
};

const normalizeText = (value = "") => value.trim().toLowerCase();

const buildDuplicateMessage = (entityLabel, value) =>
  `${entityLabel} "${value}" đã có trong hệ thống.`;

const truncateText = (text = "", maxChars = 60) => {
  const value = (text ?? "").trim();
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars).trimEnd()}…`;
};

// Helper function to map API response to component format (camelCase -> PascalCase)
// Helper function to safely convert value to array
// Handles JSON strings, objects, arrays, and other types
const ensureArray = (value, defaultValue = []) => {
  if (!value) return defaultValue;
  if (Array.isArray(value)) return value;

  // If it's a string, try to parse as JSON
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      // If parsed is an object, try to extract array from it
      if (typeof parsed === "object" && parsed !== null) {
        // Check common property names
        if (Array.isArray(parsed.items)) return parsed.items;
        if (Array.isArray(parsed.data)) return parsed.data;
        if (Array.isArray(parsed.steps)) return parsed.steps;
        // If it's an object with numeric keys, convert to array
        const keys = Object.keys(parsed);
        if (keys.length > 0 && keys.every((k) => !isNaN(Number(k)))) {
          return Object.values(parsed);
        }
      }
    } catch (e) {
      // Not valid JSON, return default
      return defaultValue;
    }
  }

  // If it's an object, try to convert to array
  if (typeof value === "object" && value !== null) {
    // Check if it has array-like properties
    if (Array.isArray(value.items)) return value.items;
    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.steps)) return value.steps;
    // If it's an object with numeric keys, convert to array
    const keys = Object.keys(value);
    if (keys.length > 0 && keys.every((k) => !isNaN(Number(k)))) {
      return Object.values(value);
    }
  }

  return defaultValue;
};

const mapTreeTypeFromApi = (apiTreeType) => {
  if (!apiTreeType) return null;
  return {
    TreeTypeID:
      apiTreeType.treeTypeId?.toString() ||
      apiTreeType.TreeTypeId?.toString() ||
      "",
    TreeTypeName: apiTreeType.treeTypeName || apiTreeType.TreeTypeName || "",
    ScientificName:
      apiTreeType.scientificName || apiTreeType.ScientificName || "",
    Category: apiTreeType.category || apiTreeType.Category || "",
    Description: apiTreeType.description || apiTreeType.Description || "",
    AverageLifespanYears:
      apiTreeType.averageLifespanYears || apiTreeType.AverageLifespanYears,
    SoilMasterID:
      apiTreeType.soilMasterId?.toString() ||
      apiTreeType.SoilMasterId?.toString() ||
      "",
    SoilMasterName:
      apiTreeType.soilMasterName || apiTreeType.SoilMasterName || "",
    OptimalTemperatureMin:
      apiTreeType.optimalTemperatureMin || apiTreeType.OptimalTemperatureMin,
    OptimalTemperatureMax:
      apiTreeType.optimalTemperatureMax || apiTreeType.OptimalTemperatureMax,
    OptimalHumidityMin:
      apiTreeType.optimalHumidityMin || apiTreeType.OptimalHumidityMin,
    OptimalHumidityMax:
      apiTreeType.optimalHumidityMax || apiTreeType.OptimalHumidityMax,
    DroughtTolerance:
      apiTreeType.droughtTolerance || apiTreeType.DroughtTolerance || "",
    FloodTolerance:
      apiTreeType.floodTolerance || apiTreeType.FloodTolerance || "",
    FrostTolerance:
      apiTreeType.frostTolerance || apiTreeType.FrostTolerance || "",
    WindTolerance: apiTreeType.windTolerance || apiTreeType.WindTolerance || "",
    ImageUrl: apiTreeType.imageUrl || apiTreeType.ImageUrl || "",
    IsActive: apiTreeType.isActive ?? apiTreeType.IsActive ?? true,
    Varieties: apiTreeType.varieties || apiTreeType.Varieties || [],
    VarietiesCount:
      apiTreeType.varietiesCount || apiTreeType.VarietiesCount || 0,
    CareGuide: ensureArray(apiTreeType.careGuide || apiTreeType.CareGuide, []),
    Pests: ensureArray(apiTreeType.pests || apiTreeType.Pests, []),
  };
};

const mapVarietyFromApi = (apiVariety) => {
  if (!apiVariety) return null;
  return {
    VarietyID:
      apiVariety.varietyId?.toString() ||
      apiVariety.VarietyId?.toString() ||
      "",
    VarietyName: apiVariety.varietyName || apiVariety.VarietyName || "",
    VarietyDescription:
      apiVariety.varietyDescription || apiVariety.VarietyDescription || "",
  };
};

const mapSoilFromApi = (apiSoil) => {
  if (!apiSoil) return null;
  return {
    SoilMasterID:
      apiSoil.soilMasterId?.toString() ||
      apiSoil.SoilMasterId?.toString() ||
      "",
    SoilName: apiSoil.soilName || apiSoil.SoilName || "",
    Texture: apiSoil.texture || apiSoil.Texture || "",
    Drainage: apiSoil.drainage || apiSoil.Drainage || "",
    OrganicMatterPct: apiSoil.organicMatterPct || apiSoil.OrganicMatterPct,
    EC_dS_m: apiSoil.ecDSM || apiSoil.EcDSM || apiSoil.eC_dS_m,
    Notes: apiSoil.notes || apiSoil.Notes || "",
  };
};

const mapTreeTypeToApi = (componentTreeType) => {
  const result = {
    treeTypeName:
      componentTreeType.TreeTypeName || componentTreeType.treeTypeName,
    scientificName:
      componentTreeType.ScientificName || componentTreeType.scientificName,
    description: componentTreeType.Description || componentTreeType.description,
    category: componentTreeType.Category || componentTreeType.category,
    imageUrl: componentTreeType.ImageUrl || componentTreeType.imageUrl,
    isActive: componentTreeType.IsActive ?? componentTreeType.isActive ?? true,
  };

  // Only include fields that are not undefined/null
  if (componentTreeType.SoilMasterID || componentTreeType.soilMasterId) {
    const soilMasterId = parseInt(
      componentTreeType.SoilMasterID || componentTreeType.soilMasterId
    );
    if (!isNaN(soilMasterId)) {
      result.soilMasterId = soilMasterId;
    }
  }

  if (
    componentTreeType.AverageLifespanYears !== undefined ||
    componentTreeType.averageLifespanYears !== undefined
  ) {
    result.averageLifespanYears =
      componentTreeType.AverageLifespanYears ??
      componentTreeType.averageLifespanYears;
  }

  if (
    componentTreeType.OptimalTemperatureMin !== undefined ||
    componentTreeType.optimalTemperatureMin !== undefined
  ) {
    result.optimalTemperatureMin =
      componentTreeType.OptimalTemperatureMin ??
      componentTreeType.optimalTemperatureMin;
  }

  if (
    componentTreeType.OptimalTemperatureMax !== undefined ||
    componentTreeType.optimalTemperatureMax !== undefined
  ) {
    result.optimalTemperatureMax =
      componentTreeType.OptimalTemperatureMax ??
      componentTreeType.optimalTemperatureMax;
  }

  if (
    componentTreeType.OptimalHumidityMin !== undefined ||
    componentTreeType.optimalHumidityMin !== undefined
  ) {
    result.optimalHumidityMin =
      componentTreeType.OptimalHumidityMin ??
      componentTreeType.optimalHumidityMin;
  }

  if (
    componentTreeType.OptimalHumidityMax !== undefined ||
    componentTreeType.optimalHumidityMax !== undefined
  ) {
    result.optimalHumidityMax =
      componentTreeType.OptimalHumidityMax ??
      componentTreeType.optimalHumidityMax;
  }

  if (
    componentTreeType.DroughtTolerance ||
    componentTreeType.droughtTolerance
  ) {
    result.droughtTolerance =
      componentTreeType.DroughtTolerance || componentTreeType.droughtTolerance;
  }

  if (componentTreeType.FloodTolerance || componentTreeType.floodTolerance) {
    result.floodTolerance =
      componentTreeType.FloodTolerance || componentTreeType.floodTolerance;
  }

  if (componentTreeType.FrostTolerance || componentTreeType.frostTolerance) {
    result.frostTolerance =
      componentTreeType.FrostTolerance || componentTreeType.frostTolerance;
  }

  if (componentTreeType.WindTolerance || componentTreeType.windTolerance) {
    result.windTolerance =
      componentTreeType.WindTolerance || componentTreeType.windTolerance;
  }

  return result;
};

const mapSoilToApi = (componentSoil) => {
  return {
    soilName: componentSoil.SoilName || componentSoil.soilName,
    texture: componentSoil.Texture || componentSoil.texture,
    drainage: componentSoil.Drainage || componentSoil.drainage,
    organicMatterPct:
      componentSoil.OrganicMatterPct || componentSoil.organicMatterPct,
    ecDSM:
      componentSoil.EC_dS_m || componentSoil.eC_dS_m || componentSoil.ecDSM,
    notes: componentSoil.Notes || componentSoil.notes,
  };
};

async function fetchTreeTypes() {
  try {
    const response = await AdminTreeRepository.getAllTreeTypes(1, 1000); // Get all for now
    const treeTypes = response.data || [];

    // Fetch varieties for each tree type
    const treeTypesWithVarieties = await Promise.all(
      treeTypes.map(async (treeType) => {
        try {
          const varietiesResponse =
            await AdminTreeRepository.getVarietiesByTreeTypeId(
              treeType.treeTypeId || treeType.TreeTypeId
            );
          const varieties = Array.isArray(varietiesResponse.data)
            ? varietiesResponse.data
            : Array.isArray(varietiesResponse)
              ? varietiesResponse
              : [];
          return {
            ...treeType,
            varieties: varieties.map(mapVarietyFromApi),
          };
        } catch (error) {
          console.warn(
            `Failed to fetch varieties for tree type ${treeType.treeTypeId || treeType.TreeTypeId
            }:`,
            error
          );
          return {
            ...treeType,
            varieties: [],
          };
        }
      })
    );

    return treeTypesWithVarieties.map(mapTreeTypeFromApi);
  } catch (error) {
    console.error("Error fetching tree types:", error);
    throw error;
  }
}

async function createTreeType(payload) {
  try {
    const apiPayload = mapTreeTypeToApi(payload);
    const response = await AdminTreeRepository.createTreeType(apiPayload);
    return mapTreeTypeFromApi(response);
  } catch (error) {
    console.error("Error creating tree type:", error);
    throw error;
  }
}

async function updateTreeType(treeTypeId, payload) {
  try {
    const apiPayload = mapTreeTypeToApi(payload);
    const id = parseInt(treeTypeId);
    const response = await AdminTreeRepository.updateTreeType(id, apiPayload);
    return mapTreeTypeFromApi(response);
  } catch (error) {
    console.error("Error updating tree type:", error);
    throw error;
  }
}

async function deleteTreeType(treeTypeId) {
  try {
    const id = parseInt(treeTypeId);
    await AdminTreeRepository.deleteTreeType(id);
  } catch (error) {
    console.error("Error deleting tree type:", error);
    throw error;
  }
}

async function fetchSoils() {
  try {
    // For now, we'll use an empty array if the endpoint doesn't exist
    // This should be implemented in the backend
    const response = await AdminSoilMasterRepository.getAllSoilMasters();
    const soils = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];
    return soils.map(mapSoilFromApi);
  } catch (error) {
    console.warn("Error fetching soils, returning empty array:", error);
    // Return empty array if endpoint doesn't exist yet
    return [];
  }
}

async function createSoil(payload) {
  try {
    const apiPayload = mapSoilToApi(payload);
    const response = await AdminSoilMasterRepository.createSoilMaster(
      apiPayload
    );
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
    const response = await AdminSoilMasterRepository.updateSoilMaster(
      id,
      apiPayload
    );
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
    // Return a mock object to maintain compatibility
    return { SoilMasterID: soilId };
  } catch (error) {
    console.error("Error deleting soil:", error);
    throw error;
  }
}

const numberField = () =>
  z.preprocess((val) => {
    if (val === "" || val === null || typeof val === "undefined")
      return undefined;
    const parsed = Number(val);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, z.number().optional());

const varietySchema = z.object({
  VarietyID: z.string().optional(),
  VarietyName: z.string().min(1, "Tên giống là bắt buộc"),
  VarietyDescription: z.string().optional(),
});

const pestSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    severity: z.enum(["Low", "Medium", "High"]).optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      const hasName = data.name?.trim();
      const hasDescription = data.description?.trim();
      const hasSeverity = data.severity;

      // Nếu không có gì thì OK (trường trống)
      if (!hasName && !hasDescription && !hasSeverity) {
        return true;
      }

      // Nếu có name hoặc description thì cả hai phải có
      if (hasName && !hasDescription) {
        return false;
      }

      if (hasDescription && !hasName) {
        return false;
      }

      // Nếu có cả name và description thì phải có severity
      if (hasName && hasDescription && !hasSeverity) {
        return false;
      }

      return true;
    },
    {
      message: "Vui lòng điền đầy đủ thông tin bệnh",
    }
  );

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
    CareGuide: z.array(z.string()).default([]),
    Pests: z.array(pestSchema).default([]),
  })
  .refine(
    ({ OptimalTemperatureMin, OptimalTemperatureMax }) =>
      !OptimalTemperatureMin ||
      !OptimalTemperatureMax ||
      OptimalTemperatureMax > OptimalTemperatureMin,
    {
      message: "Nhiệt độ tối đa phải lớn hơn tối thiểu",
      path: ["OptimalTemperatureMax"],
    }
  )
  .refine(
    ({ OptimalHumidityMin, OptimalHumidityMax }) =>
      !OptimalHumidityMin ||
      !OptimalHumidityMax ||
      OptimalHumidityMax > OptimalHumidityMin,
    {
      message: "Độ ẩm tối đa phải lớn hơn tối thiểu",
      path: ["OptimalHumidityMax"],
    }
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
  DroughtTolerance: undefined,
  FloodTolerance: undefined,
  FrostTolerance: undefined,
  WindTolerance: undefined,
  IsActive: true,
  CareGuide: [],
  Pests: [],
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

function ImageDropzone({ value, onChange, onFileChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = React.useRef(null);

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước ảnh không được vượt quá 2MB");
      return;
    }

    // Store the file object for later upload
    if (onFileChange) {
      onFileChange(file);
    }

    // Create preview (base64) for immediate display
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
        isDragging ? "border-emerald-500 bg-emerald-50/40" : "border-slate-200"
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
        {value && value.trim() !== "" ? (
          <img
            src={value}
            alt="Tree preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src="/vite.svg"
            alt="Default logo"
            className="h-full w-full object-contain p-2"
          />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">
          Tải ảnh giống cây
        </p>
        <p className="text-xs text-slate-500">
          Kéo thả hoặc bấm để chọn. Hỗ trợ PNG, JPG (max 2MB).
        </p>
        {value && value.trim() !== "" && value !== "/vite.svg" && (
          <Button
            size="sm"
            variant="link"
            className="px-0 text-emerald-600"
            onClick={(e) => {
              e.stopPropagation();
              // Set về logo default của trang web thay vì để trống
              onChange("/vite.svg");
              if (onFileChange) {
                onFileChange(null);
              }
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
        <span className="font-medium">
          {tree.OptimalTemperatureMin ?? "?"} -{" "}
          {tree.OptimalTemperatureMax ?? "?"}°C
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Droplets className="h-4 w-4 text-sky-500" />
        <span className="font-medium">
          {tree.OptimalHumidityMin ?? "?"} - {tree.OptimalHumidityMax ?? "?"}%
        </span>
      </div>
    </div>
  );
}

function TreeTable({
  trees,
  soils,
  onEdit,
  onDelete,
  onToggleStatus,
  onManageVarieties,
  pagination,
}) {
  const soilLookup = useMemo(
    () =>
      soils.reduce((acc, soil) => {
        acc[soil.SoilMasterID] = soil.SoilName;
        return acc;
      }, {}),
    [soils]
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-[16px] shadow-sm">
      <ScrollArea className="w-full flex-1">
        <Table className="text-base">
          <TableHeader className="bg-slate-50 text-base text-slate-600">
            <TableRow>
              <TableHead className="text-base font-semibold">
                Loại cây
              </TableHead>
              <TableHead className="hidden text-base font-semibold text-center md:table-cell">
                Đất gợi ý
              </TableHead>
              <TableHead className="hidden text-base font-semibold text-center md:table-cell">
                Giống
              </TableHead>
              <TableHead className="hidden text-base font-semibold lg:table-cell">
                Thông số
              </TableHead>
              <TableHead className="text-base font-semibold">
                Trạng thái
              </TableHead>
              <TableHead className="text-right text-base font-semibold">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trees.map((tree) => (
              <TableRow
                key={tree.TreeTypeID}
                className="text-[16px] hover:bg-emerald-50/40"
              >
                <TableCell>
                  <div className="flex gap-4">
                    {tree.ImageUrl ? (
                      <img
                        src={tree.ImageUrl}
                        alt={tree.TreeTypeName}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-slate-900">
                          {tree.TreeTypeName}
                        </p>
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
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-amber-50 px-4 py-1 text-sm text-amber-600"
                    >
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
                          <p className="text-sm font-semibold text-slate-900">
                            Giống hiện có
                          </p>
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
                        tree.IsActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {tree.IsActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
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
          <p className="text-sm text-slate-500">
            Chưa có loại cây nào trùng khớp bộ lọc.
          </p>
        </div>
      )}
      {pagination && pagination.totalItems > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-600">
          <p>
            Hiển thị{" "}
            {Math.min(
              (pagination.page - 1) * pagination.pageSize + 1,
              pagination.totalItems
            )}
            -
            {Math.min(
              pagination.page * pagination.pageSize,
              pagination.totalItems
            )}{" "}
            trên {pagination.totalItems} loại cây
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
  const navigate = useNavigate();
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
  const [varietyDeleteConfirmOpen, setVarietyDeleteConfirmOpen] =
    useState(false);
  const [createVarietyOverlayOpen, setCreateVarietyOverlayOpen] =
    useState(false);
  const [varietyCreateConfirmOpen, setVarietyCreateConfirmOpen] =
    useState(false);
  const [pendingVarietyCreate, setPendingVarietyCreate] = useState(null);
  const [varietyDetailEditMode, setVarietyDetailEditMode] = useState(false);
  const [varietyUpdateConfirmOpen, setVarietyUpdateConfirmOpen] =
    useState(false);
  const [pendingVarietyUpdate, setPendingVarietyUpdate] = useState(null);
  const [varietyCancelEditConfirmOpen, setVarietyCancelEditConfirmOpen] =
    useState(false);
  const [varietyRevertConfirmOpen, setVarietyRevertConfirmOpen] =
    useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [newlyCreatedTreeTypeId, setNewlyCreatedTreeTypeId] = useState(null);
  const [showCreateSuccessDialog, setShowCreateSuccessDialog] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
    mode: "onSubmit",
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
    const [treeData, soilData] = await Promise.all([
      fetchTreeTypes(),
      fetchSoils(),
    ]);
    setTrees(treeData);
    setSoils(soilData);
    setSoilPage(1);
    setLoading(false);
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
        tree.TreeTypeName.toLowerCase().includes(
          filters.search.toLowerCase()
        ) ||
        (tree.Description ?? "")
          .toLowerCase()
          .includes(filters.search.toLowerCase());
      const soilMatch =
        filters.soil === "all" || tree.SoilMasterID === filters.soil;
      const statusMatch =
        filters.status === "all" ||
        (filters.status === "active" ? tree.IsActive : !tree.IsActive);
      return searchMatch && soilMatch && statusMatch;
    });
  }, [trees, filters]);

  const totalTreePages = Math.max(
    1,
    Math.ceil(filteredTrees.length / TREE_PAGE_SIZE)
  );

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
    setImageFile(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (tree) => {
    form.reset({
      TreeTypeName: tree.TreeTypeName,
      ScientificName: tree.ScientificName ?? "",
      AverageLifespanYears: tree.AverageLifespanYears,
      SoilMasterID: tree.SoilMasterID ?? "",
      Description: tree.Description ?? "",
      ImageUrl:
        tree.ImageUrl && tree.ImageUrl.trim() !== ""
          ? tree.ImageUrl
          : "/vite.svg",
      OptimalTemperatureMin: tree.OptimalTemperatureMin,
      OptimalTemperatureMax: tree.OptimalTemperatureMax,
      OptimalHumidityMin: tree.OptimalHumidityMin,
      OptimalHumidityMax: tree.OptimalHumidityMax,
      DroughtTolerance: tree.DroughtTolerance || undefined,
      FloodTolerance: tree.FloodTolerance || undefined,
      FrostTolerance: tree.FrostTolerance || undefined,
      WindTolerance: tree.WindTolerance || undefined,
      IsActive: tree.IsActive ?? true,
      CareGuide: ensureArray(tree.CareGuide, []),
      Pests: ensureArray(tree.Pests, []),
    });
    setEditingTree(tree);
    setImageFile(null);
    setSheetOpen(true);
  };

  const handleSubmit = async (values) => {
    // Remove empty care steps
    const filteredCareGuide = (values.CareGuide || []).filter(
      (step) => step?.trim() && step.trim().length > 0
    );
    values.CareGuide = filteredCareGuide;

    // Remove empty pests (pests with no name, description, and severity)
    const filteredPests = (values.Pests || []).filter(
      (pest) =>
        (pest.name?.trim() && pest.name.trim().length > 0) ||
        (pest.description?.trim() && pest.description.trim().length > 0) ||
        pest.severity
    );
    values.Pests = filteredPests;

    // Update form values
    form.setValue("CareGuide", filteredCareGuide);
    form.setValue("Pests", filteredPests);

    const trimmedName = values.TreeTypeName?.trim() ?? "";
    const duplicateTreeName = trees.some(
      (tree) =>
        tree.TreeTypeID !== editingTree?.TreeTypeID &&
        normalizeText(tree.TreeTypeName ?? "") === normalizeText(trimmedName)
    );

    if (duplicateTreeName) {
      form.setError("TreeTypeName", {
        type: "manual",
        message: buildDuplicateMessage("Loại cây", trimmedName),
      });
      return;
    }

    // Validate required fields and show errors
    let hasErrors = false;

    if (!trimmedName) {
      form.setError("TreeTypeName", {
        type: "manual",
        message: "Vui lòng nhập tên loại cây",
      });
      hasErrors = true;
    }

    if (!values.SoilMasterID) {
      form.setError("SoilMasterID", {
        type: "manual",
        message: "Chọn loại đất gợi ý",
      });
      hasErrors = true;
    }

    // Validate pests
    if (values.Pests && values.Pests.length > 0) {
      values.Pests.forEach((pest, index) => {
        const hasName = pest.name?.trim();
        const hasDescription = pest.description?.trim();
        const hasSeverity = pest.severity;

        if (hasName && !hasDescription) {
          form.setError(`Pests.${index}.description`, {
            type: "manual",
            message: "Vui lòng điền mô tả bệnh",
          });
          hasErrors = true;
        }

        if (hasDescription && !hasName) {
          form.setError(`Pests.${index}.name`, {
            type: "manual",
            message: "Vui lòng điền tên bệnh",
          });
          hasErrors = true;
        }

        if (hasName && hasDescription && !hasSeverity) {
          form.setError(`Pests.${index}.severity`, {
            type: "manual",
            message: "Vui lòng chọn mức độ",
          });
          hasErrors = true;
        }
      });
    }

    if (hasErrors) {
      return;
    }

    setSaving(true);
    try {
      // Upload image if a new file was selected
      let imageUrl = values.ImageUrl || "/vite.svg";
      if (imageFile) {
        try {
          const uploadResponse = await AdminTreeRepository.uploadTreeTypeImage(
            imageFile
          );
          if (uploadResponse?.success && uploadResponse?.url) {
            imageUrl = uploadResponse.url;
          } else {
            throw new Error("Không thể tải ảnh lên server");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          form.setError("ImageUrl", {
            type: "manual",
            message: error.message || "Lỗi khi tải ảnh lên. Vui lòng thử lại.",
          });
          setSaving(false);
          return;
        }
      }

      // Update ImageUrl if it was uploaded, or ensure default logo if empty
      if (imageUrl !== values.ImageUrl) {
        values.ImageUrl = imageUrl;
      } else if (!imageUrl || imageUrl.trim() === "") {
        values.ImageUrl = "/vite.svg";
      }

      if (editingTree) {
        const updated = await updateTreeType(editingTree.TreeTypeID, {
          ...editingTree,
          ...values,
        });
        setTrees((prev) =>
          prev.map((tree) =>
            tree.TreeTypeID === updated.TreeTypeID ? updated : tree
          )
        );
        // Dispatch event để PlantDetail đồng bộ ảnh
        window.dispatchEvent(
          new CustomEvent("mm:treetype:updated", {
            detail: {
              treeTypeId: updated.TreeTypeID,
              treeTypeID: updated.TreeTypeID,
              imageUrl: updated.ImageUrl,
            },
          })
        );
      } else {
        const created = await createTreeType({
          ...values,
          Varieties: [],
        });
        setTrees((prev) => [created, ...prev]);
        // Dispatch event để PlantDetail đồng bộ ảnh
        window.dispatchEvent(
          new CustomEvent("mm:treetype:created", {
            detail: {
              treeTypeId: created.TreeTypeID,
              treeTypeID: created.TreeTypeID,
              imageUrl: created.ImageUrl,
            },
          })
        );
        // Hiển thị dialog thông báo và lưu treeTypeId
        setNewlyCreatedTreeTypeId(created.TreeTypeID);
        setShowCreateSuccessDialog(true);
      }
      setImageFile(null);
      setSheetOpen(false);
    } catch (error) {
      console.error("Error saving tree type:", error);
      form.setError("root", {
        type: "manual",
        message: error.message || "Có lỗi xảy ra khi lưu. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };

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
      setSoils((prev) => [
        created,
        ...prev.filter((soil) => soil.SoilMasterID !== created.SoilMasterID),
      ]);
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
    // Only send IsActive to avoid backend issues with other fields
    const updated = await updateTreeType(tree.TreeTypeID, {
      IsActive: !tree.IsActive,
    });

    // Fetch varieties again to ensure count is accurate
    try {
      const varietiesResponse = await AdminTreeRepository.getVarietiesByTreeTypeId(
        tree.TreeTypeID
      );
      const varieties = Array.isArray(varietiesResponse.data)
        ? varietiesResponse.data
        : Array.isArray(varietiesResponse)
          ? varietiesResponse
          : [];

      const updatedWithVarieties = {
        ...updated,
        Varieties: varieties.map(mapVarietyFromApi),
      };

      setTrees((prev) =>
        prev.map((item) =>
          item.TreeTypeID === updatedWithVarieties.TreeTypeID ? updatedWithVarieties : item
        )
      );
    } catch (error) {
      console.warn('Failed to fetch varieties after status toggle:', error);
      // If fetching varieties fails, still update with what we have
      setTrees((prev) =>
        prev.map((item) =>
          item.TreeTypeID === updated.TreeTypeID ? updated : item
        )
      );
    }

    // Dispatch event để PlantDetail đồng bộ ảnh
    window.dispatchEvent(
      new CustomEvent("mm:treetype:updated", {
        detail: {
          treeTypeId: updated.TreeTypeID,
          treeTypeID: updated.TreeTypeID,
          imageUrl: updated.ImageUrl,
        },
      })
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteTreeType(deleteTarget.TreeTypeID);
    setTrees((prev) =>
      prev.filter((tree) => tree.TreeTypeID !== deleteTarget.TreeTypeID)
    );
    // Dispatch event để PlantDetail đồng bộ ảnh
    window.dispatchEvent(
      new CustomEvent("mm:treetype:deleted", {
        detail: {
          treeTypeId: deleteTarget.TreeTypeID,
          treeTypeID: deleteTarget.TreeTypeID,
        },
      })
    );
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
    varietyDetailForm.reset(
      mapVarietyToFormValues(tree.Varieties?.[0] ?? null)
    );
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

  const totalVarietyPages = Math.max(
    1,
    Math.ceil(filteredVarieties.length / VARIETY_PAGE_SIZE)
  );

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
    const maxPage = Math.max(
      1,
      Math.ceil(filteredVarieties.length / VARIETY_PAGE_SIZE)
    );
    if (varietyPage > maxPage) {
      setVarietyPage(maxPage);
    }
  }, [filteredVarieties.length, varietyPage]);

  const varietyRangeStart = filteredVarieties.length
    ? (varietyPage - 1) * VARIETY_PAGE_SIZE + 1
    : 0;
  const varietyRangeEnd = filteredVarieties.length
    ? Math.min(
      filteredVarieties.length,
      varietyRangeStart + paginatedVarieties.length - 1
    )
    : 0;
  const shouldShowVarietyPagination =
    filteredVarieties.length > VARIETY_PAGE_SIZE;

  const selectedVariety = useMemo(() => {
    if (!activeVarietyTree) return null;
    return (
      activeVarietyTree.Varieties?.find(
        (item) => item.VarietyID === selectedVarietyId
      ) ?? null
    );
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
  }, [
    varietyDialogOpen,
    activeVarietyTree,
    selectedVarietyId,
    varietyDetailForm,
    varietyForm,
  ]);

  const handleSelectVariety = (varietyId) => {
    setSelectedVarietyId(varietyId);
    setVarietyDetailEditMode(false);
  };

  const syncUpdatedTreeVarieties = (updatedTree) => {
    setTrees((prev) =>
      prev.map((tree) =>
        tree.TreeTypeID === updatedTree.TreeTypeID ? updatedTree : tree
      )
    );
    setActiveVarietyTree(updatedTree);
  };

  const handlePrepareCreateVariety = (values) => {
    if (!activeVarietyTree) return;

    const trimmedName = values.VarietyName?.trim() ?? "";
    const duplicateVarietyName = (activeVarietyTree.Varieties || []).some(
      (item) =>
        normalizeText(item.VarietyName ?? "") === normalizeText(trimmedName)
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
        updated.Varieties?.[updated.Varieties.length - 1]?.VarietyID ?? null
      );
      setVarietyDetailEditMode(false);
      setCreateVarietyOverlayOpen(false);
      setVarietyCreateConfirmOpen(false);
      setPendingVarietyCreate(null);
      // Dispatch event để PlantDetail đồng bộ ảnh variety
      window.dispatchEvent(
        new CustomEvent("mm:variety:created", {
          detail: {
            treeTypeId: updated.TreeTypeID,
            treeTypeID: updated.TreeTypeID,
            varietyId:
              updated.Varieties?.[updated.Varieties.length - 1]?.VarietyID,
          },
        })
      );
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
          : item
      );
      const updated = await updateTreeType(activeVarietyTree.TreeTypeID, {
        ...activeVarietyTree,
        Varieties: newList,
      });
      syncUpdatedTreeVarieties(updated);
      setVarietyDetailEditMode(false);
      setPendingVarietyUpdate(null);
      setVarietyUpdateConfirmOpen(false);
      // Dispatch event để PlantDetail đồng bộ ảnh variety
      window.dispatchEvent(
        new CustomEvent("mm:variety:updated", {
          detail: {
            treeTypeId: updated.TreeTypeID,
            treeTypeID: updated.TreeTypeID,
            varietyId: selectedVarietyId,
          },
        })
      );
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
        normalizeText(item.VarietyName ?? "") === normalizeText(trimmedName)
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
        (item) => item.VarietyID !== selectedVarietyId
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
      // Dispatch event để PlantDetail đồng bộ ảnh variety
      window.dispatchEvent(
        new CustomEvent("mm:variety:deleted", {
          detail: {
            treeTypeId: updated.TreeTypeID,
            treeTypeID: updated.TreeTypeID,
            varietyId: selectedVarietyId,
          },
        })
      );
    } finally {
      setVarietyDeleting(false);
    }
  };

  const renderSheet = () => (
    <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingTree ? "Chỉnh sửa loại cây" : "Thêm loại cây mới"}
          </DialogTitle>
        </DialogHeader>
        <Separator className="my-4" />
        <Form {...form}>
          <form
            className="flex flex-col flex-1 min-h-0"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="grid grid-cols-[1fr_400px] gap-6 flex-1 min-h-0 overflow-hidden">
              {/* Cột trái: Form chỉnh sửa/thêm loại cây */}
              <ScrollArea className="h-full pr-4">
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
                          <ImageDropzone
                            value={field.value}
                            onChange={field.onChange}
                            onFileChange={setImageFile}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="TreeTypeName"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Tên loại cây</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ví dụ: Xoài,Bưởi,Thanh Long,.."
                              {...field}
                              className={cn(
                                form.formState.isSubmitted &&
                                fieldState.error &&
                                "border-red-500 focus-visible:ring-red-500"
                              )}
                            />
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
                            <Input
                              placeholder="Ví dụ: Mangifera indica"
                              {...field}
                            />
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
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Loại đất phù hợp</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  "h-12 w-full",
                                  form.formState.isSubmitted &&
                                  fieldState.error &&
                                  "border-red-500 focus-visible:ring-red-500"
                                )}
                              >
                                <SelectValue placeholder="Chọn loại đất" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {soils.map((soil) => (
                                <SelectItem
                                  key={soil.SoilMasterID}
                                  value={soil.SoilMasterID}
                                >
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

                <section className="space-y-4 mt-6">
                  <p className="inline-flex items-center rounded-full bg-emerald-600/90 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-white">
                    Thông số môi trường
                  </p>
                  <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="OptimalTemperatureMin"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className={environmentLabelClass}>
                            Nhiệt độ tối thiểu (°C)
                          </FormLabel>
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
                          <FormLabel className={environmentLabelClass}>
                            Nhiệt độ tối đa (°C)
                          </FormLabel>
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
                          <FormLabel className={environmentLabelClass}>
                            Độ ẩm tối thiểu (%)
                          </FormLabel>
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
                          <FormLabel className={environmentLabelClass}>
                            Độ ẩm tối đa (%)
                          </FormLabel>
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
                    {[
                      "DroughtTolerance",
                      "FloodTolerance",
                      "FrostTolerance",
                      "WindTolerance",
                    ].map((fieldName) => (
                      <FormField
                        key={fieldName}
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className={environmentLabelClass}>
                              {fieldName === "DroughtTolerance" &&
                                "Khả năng chịu hạn"}
                              {fieldName === "FloodTolerance" &&
                                "Khả năng chịu ngập"}
                              {fieldName === "FrostTolerance" &&
                                "Khả năng chịu sương giá"}
                              {fieldName === "WindTolerance" &&
                                "Khả năng chịu gió mạnh"}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    "h-12",
                                    field.value &&
                                    toleranceLevels.find(
                                      (t) => t.value === field.value
                                    )?.color,
                                    form.formState.isSubmitted &&
                                    form.formState.errors[fieldName] &&
                                    "border-red-500 focus-visible:ring-red-500"
                                  )}
                                >
                                  <SelectValue placeholder="Chọn mức độ" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {toleranceLevels.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className={cn(
                                      "focus:bg-opacity-50",
                                      option.color
                                    )}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </section>
              </ScrollArea>

              {/* Cột phải: Hướng dẫn chăm sóc và Bệnh thường gặp */}
              <div className="border-l border-slate-200 pl-6 flex flex-col h-full min-h-0 gap-4">
                {/* Phần trên: Hướng dẫn chăm sóc */}
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="shrink-0 pb-4 border-b border-slate-200 mb-4">
                    <p className="inline-flex items-center rounded-full bg-emerald-600/90 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-white mb-4">
                      Hướng dẫn chăm sóc
                    </p>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-emerald-600" />
                        Các bước chăm sóc
                      </FormLabel>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const current = form.getValues("CareGuide");
                          const currentArray = Array.isArray(current)
                            ? current
                            : [];
                          form.setValue("CareGuide", [...currentArray, ""]);
                        }}
                        className="h-8"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Thêm bước
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 min-h-0 pr-2">
                    <FormField
                      control={form.control}
                      name="CareGuide"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-3 pb-4">
                              {Array.isArray(field.value)
                                ? field.value.map((step, index) => (
                                  <div
                                    key={index}
                                    className="flex gap-3 items-start"
                                  >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 mt-1">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                      <Textarea
                                        placeholder={`Bước ${index + 1
                                          }: Mô tả hướng dẫn chăm sóc...`}
                                        value={step}
                                        onChange={(e) => {
                                          const currentValue = Array.isArray(
                                            field.value
                                          )
                                            ? field.value
                                            : [];
                                          const newSteps = [...currentValue];
                                          newSteps[index] = e.target.value;
                                          field.onChange(newSteps);
                                        }}
                                        className="min-h-[80px] text-sm"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                                      onClick={() => {
                                        const currentValue = Array.isArray(
                                          field.value
                                        )
                                          ? field.value
                                          : [];
                                        const newSteps = currentValue.filter(
                                          (_, i) => i !== index
                                        );
                                        field.onChange(newSteps);
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))
                                : null}
                              {(!Array.isArray(field.value) ||
                                field.value.length === 0) && (
                                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-emerald-200/60 bg-white/80 px-4 py-8 text-center text-sm text-slate-500">
                                    <Leaf className="h-8 w-8 text-emerald-300" />
                                    <p>Chưa có hướng dẫn nào.</p>
                                    <p>Bấm &quot;Thêm bước&quot; để bắt đầu.</p>
                                  </div>
                                )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </ScrollArea>
                </div>

                {/* Phần dưới: Bệnh thường gặp */}
                <div className="flex flex-col flex-1 min-h-0 border-t border-slate-200 pt-4">
                  <div className="shrink-0 pb-4 mb-4">
                    <p className="inline-flex items-center rounded-full bg-emerald-600/90 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-white mb-4">
                      Bệnh thường gặp
                    </p>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <Bug className="h-4 w-4 text-rose-600" />
                        Bệnh thường gặp
                      </FormLabel>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const current = form.getValues("Pests");
                          const currentArray = Array.isArray(current)
                            ? current
                            : [];
                          form.setValue("Pests", [
                            ...currentArray,
                            { name: "", description: "", severity: "" },
                          ]);
                        }}
                        className="h-8"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Thêm bệnh
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 min-h-0 pr-2">
                    <FormField
                      control={form.control}
                      name="Pests"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-3 pb-4">
                              {Array.isArray(field.value)
                                ? field.value.map((pest, index) => {
                                  const nameError = form.formState.isSubmitted
                                    ? form.formState.errors?.Pests?.[index]
                                      ?.name
                                    : null;
                                  const descriptionError = form.formState
                                    .isSubmitted
                                    ? form.formState.errors?.Pests?.[index]
                                      ?.description
                                    : null;
                                  const severityError = form.formState
                                    .isSubmitted
                                    ? form.formState.errors?.Pests?.[index]
                                      ?.severity
                                    : null;
                                  const hasError =
                                    nameError ||
                                    descriptionError ||
                                    severityError;
                                  const severityColor = pest.severity
                                    ? severityColors[pest.severity]
                                    : null;

                                  return (
                                    <div
                                      key={index}
                                      className={cn(
                                        "rounded-xl border bg-slate-50/50 p-3 space-y-2",
                                        hasError
                                          ? "border-red-300 bg-red-50/30"
                                          : "border-slate-200"
                                      )}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 space-y-2">
                                          <div>
                                            <Input
                                              placeholder="Tên bệnh..."
                                              value={pest.name || ""}
                                              onChange={(e) => {
                                                const currentValue =
                                                  Array.isArray(field.value)
                                                    ? field.value
                                                    : [];
                                                const newPests = [
                                                  ...currentValue,
                                                ];
                                                newPests[index] = {
                                                  ...(newPests[index] || {}),
                                                  name: e.target.value,
                                                };
                                                field.onChange(newPests);
                                              }}
                                              className={cn(
                                                "h-9",
                                                nameError &&
                                                "border-red-500 focus-visible:ring-red-500"
                                              )}
                                            />
                                            {nameError && (
                                              <p className="text-xs text-red-600 mt-1">
                                                {nameError.message}
                                              </p>
                                            )}
                                          </div>
                                          <div>
                                            <Textarea
                                              placeholder="Mô tả bệnh và cách phòng trừ..."
                                              value={pest.description || ""}
                                              onChange={(e) => {
                                                const currentValue =
                                                  Array.isArray(field.value)
                                                    ? field.value
                                                    : [];
                                                const newPests = [
                                                  ...currentValue,
                                                ];
                                                newPests[index] = {
                                                  ...(newPests[index] || {}),
                                                  description: e.target.value,
                                                };
                                                field.onChange(newPests);
                                              }}
                                              className={cn(
                                                "min-h-[60px] text-sm",
                                                descriptionError &&
                                                "border-red-500 focus-visible:ring-red-500"
                                              )}
                                            />
                                            {descriptionError && (
                                              <p className="text-xs text-red-600 mt-1">
                                                {descriptionError.message}
                                              </p>
                                            )}
                                          </div>
                                          <div>
                                            <Select
                                              value={pest.severity || ""}
                                              onValueChange={(value) => {
                                                const currentValue =
                                                  Array.isArray(field.value)
                                                    ? field.value
                                                    : [];
                                                const newPests = [
                                                  ...currentValue,
                                                ];
                                                newPests[index] = {
                                                  ...(newPests[index] || {}),
                                                  severity: value,
                                                };
                                                field.onChange(newPests);
                                              }}
                                            >
                                              <SelectTrigger
                                                className={cn(
                                                  "h-9",
                                                  severityError &&
                                                  "border-red-500 focus-visible:ring-red-500",
                                                  severityColor &&
                                                  cn(
                                                    severityColor.bg,
                                                    severityColor.text,
                                                    severityColor.border
                                                  )
                                                )}
                                              >
                                                <SelectValue placeholder="Chọn mức độ" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem
                                                  value="High"
                                                  className="text-red-700 focus:bg-red-50"
                                                >
                                                  Cao
                                                </SelectItem>
                                                <SelectItem
                                                  value="Medium"
                                                  className="text-orange-700 focus:bg-orange-50"
                                                >
                                                  Trung bình
                                                </SelectItem>
                                                <SelectItem
                                                  value="Low"
                                                  className="text-yellow-700 focus:bg-yellow-50"
                                                >
                                                  Thấp
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                            {severityError && (
                                              <p className="text-xs text-red-600 mt-1">
                                                {severityError.message}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                                          onClick={() => {
                                            const currentValue =
                                              Array.isArray(field.value)
                                                ? field.value
                                                : [];
                                            const newPests =
                                              currentValue.filter(
                                                (_, i) => i !== index
                                              );
                                            field.onChange(newPests);
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })
                                : null}
                              {(!Array.isArray(field.value) ||
                                field.value.length === 0) && (
                                  <p className="text-sm text-slate-500 text-center py-4">
                                    Chưa có bệnh nào. Bấm "Thêm bệnh" để bắt đầu.
                                  </p>
                                )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </ScrollArea>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4 pt-4 border-t shrink-0">
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
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
            Xem danh sách loại đất, chỉnh sửa thông tin chi tiết và bổ sung loại
            đất mới.
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
              <Button onClick={() => setCreateSoilOverlayOpen(true)}>
                Thêm đất
              </Button>
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
                        Chưa có loại đất nào. Bấm &quot;Thêm đất&quot; để bắt
                        đầu.
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

            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
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
            <form
              className="space-y-4"
              onSubmit={varietyForm.handleSubmit(handlePrepareCreateVariety)}
            >
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
              <span className="font-semibold text-slate-900">
                {pendingVarietyCreate?.VarietyName || "mới"}
              </span>
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
          <DialogTitle>Xem giống cây</DialogTitle>
          <DialogDescription>
            Danh sách các giống thuộc loại cây{" "}
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
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <ScrollArea className="max-h-[440px] overflow-visible pr-2">
                  <div className="grid gap-2">
                    {!activeVarietyTree ||
                      (activeVarietyTree.Varieties || []).length === 0 ? (
                      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-emerald-200/60 bg-white/80 px-4 py-6 text-center text-sm text-slate-500">
                        <Layers className="h-5 w-5 text-emerald-300" />
                        Chưa có giống nào. Bấm &quot;Thêm giống mới&quot; để bắt
                        đầu.
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
                                : "border-black hover:border-slate-700"
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
                {filteredVarieties.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-3 text-xs text-slate-500">
                    {shouldShowVarietyPagination && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full px-3 text-xs"
                          onClick={() =>
                            setVarietyPage((prev) => Math.max(1, prev - 1))
                          }
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
                            setVarietyPage((prev) =>
                              Math.min(totalVarietyPages, prev + 1)
                            )
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
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Tên giống
                      </label>
                      <div className="mt-1 rounded-2xl bg-slate-50 px-4 py-3 text-slate-900">
                        {selectedVariety?.VarietyName || "-"}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Mô tả
                      </label>
                      <div className="mt-1 min-h-[120px] rounded-2xl bg-slate-50 px-4 py-3 text-slate-600">
                        {selectedVariety?.VarietyDescription || "Chưa có mô tả"}
                      </div>
                    </div>
                    <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      Chế độ chỉ xem - Không thể chỉnh sửa
                    </p>
                  </div>
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
                Thao tác này sẽ xoá vĩnh viễn giống đang chọn khỏi loại cây và
                không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={varietyDeleting}>
                Huỷ
              </AlertDialogCancel>
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
                  {pendingVarietyUpdate?.VarietyName ||
                    selectedVariety?.VarietyName}
                </span>
                ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={varietySaving}>
                Huỷ
              </AlertDialogCancel>
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
                Mọi thay đổi đang thực hiện sẽ bị bỏ qua và khung chi tiết trở
                lại trạng thái chỉ xem.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={varietySaving}>
                Tiếp tục chỉnh sửa
              </AlertDialogCancel>
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
              <AlertDialogCancel disabled={varietySaving}>
                Không
              </AlertDialogCancel>
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
                  <Leaf className="h-4 w-4" />
                  Business Admin
                </p>
                <h1 className="mt-2 text-4xl font-bold text-white">
                  Quản lý loại cây
                </h1>
                <p className="text-base text-white/80">
                  Theo dõi, điều chỉnh TreeTypes và các giống cây đi kèm trong
                  hệ thống.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto">
                <div className="relative w-full min-w-[220px] sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                  <Input
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    placeholder="Tìm kiếm loại cây..."
                    className="h-12 rounded-xl border-white/40 bg-white/10 pl-10 text-white placeholder:text-white/70 focus-visible:border-white focus-visible:bg-white focus-visible:text-slate-900 focus-visible:ring-emerald-200"
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-2">
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

            <Dialog
              open={showCreateSuccessDialog}
              onOpenChange={(open) => {
                if (!open) {
                  setShowCreateSuccessDialog(false);
                  setNewlyCreatedTreeTypeId(null);
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Đã tạo loại cây thành công</DialogTitle>
                  <DialogDescription>
                    Loại cây đã được tạo nhưng đang ở trạng thái khóa. Bạn phải
                    tạo Quy trình phát triển cây để có thể kích hoạt loại cây
                    này.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateSuccessDialog(false);
                      setNewlyCreatedTreeTypeId(null);
                    }}
                  >
                    Đóng
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCreateSuccessDialog(false);
                      navigate(
                        `/admin/business/lifecycle?treeTypeId=${newlyCreatedTreeTypeId}`
                      );
                      setNewlyCreatedTreeTypeId(null);
                    }}
                  >
                    Tạo quy trình phát triển
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog
              open={Boolean(deleteTarget)}
              onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xoá loại cây</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động không thể hoàn tác. TreeType "
                    {deleteTarget?.TreeTypeName}" sẽ bị xoá khỏi danh sách.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Huỷ</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-rose-600 hover:bg-rose-500"
                    onClick={handleDelete}
                  >
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
