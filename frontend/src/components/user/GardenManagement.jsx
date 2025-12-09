import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  MapPin,
  TreePine,
  Edit3,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import GardenRepository from "../../API/repositories/GardenRepository";
import GardenSoilRepository from "../../API/repositories/GardenSoilRepository";
// ⬇⬇ Nền sống
import { LivingBackground } from "@/components/background";
import AddressPicker from "@/components/AddressPicker";

// ✅ Dùng default import (đúng với file của bạn: src/lib/useVnAdmin.js)
import useVnAdmin from "@/lib/useVnAdmin";

const PAGE_SIZE = 12;
/* ===== Theme (khớp vibe TreeManagement) ===== */
const PALETTE = {
  bg: "#1F302F",
  leaf: "#D1DFB6",
  ivory: "#FBFFDF",
  accent: "#FFFFA5",
};
const MAX_ADDRESS_LEN = 60;
/* ===== LocalStorage keys (giống UserProfile) ===== */
const LS_GARDENS = "mm_user_gardens_v3";

const MAX_GARDEN_NAME = 60; // tối đa 60 ký tự cho tên vườn
const MAX_GARDEN_ADDRESS = 120; // tối đa 120 ký tự cho địa chỉ chi tiết
const CLICKABLE_FORM_STYLES = `
.mm-clickable-form input:not(:disabled):not([readonly]),
.mm-clickable-form textarea:not(:disabled):not([readonly]),
.mm-clickable-form select:not(:disabled),
.mm-clickable-form button:not(:disabled) {
  cursor: pointer;
}
.mm-clickable-form input:focus,
.mm-clickable-form textarea:focus {
  cursor: text;
}
`;

/* ===== Default gardens (demo) ===== */
const defaultGardens = [];

/* ===== LocalStorage helpers ===== */
const LS_SELECTED_GARDEN = "mm_selected_garden_v1";

/* Tạo id ngắn */
function makeId() {
  return "g_" + Math.random().toString(36).slice(2, 10);
}

/* Đảm bảo mọi vườn đều có id */
function ensureIds(list) {
  let changed = false;
  const next = list.map((g) => {
    if (!g.id) {
      changed = true;
      return { ...g, id: makeId() };
    }
    return g;
  });
  //if (changed) save(LS_GARDENS, next);
  return next;
}

function load(k, d) {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : d;
  } catch {
    return d;
  }
}
function save(k, v) {
  localStorage.setItem(k, JSON.stringify(v));
}

// Chuẩn hoá chuỗi (bỏ hoa/thường, bỏ dấu, trim)
function normalizeKey(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Logic check cây thuộc vườn nào
 * → giống hệt isTreeInGarden trong TreeManagement.jsx
 */
function isTreeInGardenForCount(tree, garden) {
  if (!garden) return true;

  const gardenId = garden.id && String(garden.id);
  const treeGardenId = tree.gardenId && String(tree.gardenId);

  // 1) Trùng id vườn
  if (gardenId && treeGardenId && treeGardenId === gardenId) {
    return true;
  }

  // 2) Fallback theo tên / location
  const gName = normalizeKey(garden.name || "");
  if (!gName) return true;

  const candidates = [
    tree.gardenName,
    tree.locationLabel,
    tree.location && tree.location.label,
    tree.plot,
  ];
  const firstNonEmpty = candidates.find(
    (x) => x && String(x).trim().length > 0
  );
  const tKey = normalizeKey(firstNonEmpty || "");
  if (!tKey) return false;

  // so sánh chứa nhau để tránh lệch "Vườn số 3 FPT" vs "Vườn số 3 FPT Bắc Giang"
  return tKey.includes(gName) || gName.includes(tKey);
}

function countTreesInGarden(g) {
  const [count, setCount] = useState(null);
  const gardenId = g.id;
  useEffect(() => {
    async function fetch() {
      const res = await GardenRepository.getGardenById(gardenId);
      if (res?.success && res?.data) {
        setCount(res.data.statistics?.totalTrees || 0);
      }
    }
    fetch();
  }, [gardenId]);

  return count;
}

function GardenTreeCount({ g }) {
  const count = countTreesInGarden(g);
  return <span>{count ?? "..."} cây ăn quả</span>;
}

/* ===== SafeImage + ImagePicker ===== */
function normalizeImageUrl(raw = "") {
  if (!raw) return "";
  let u = String(raw).trim();

  // Xử lý relative URLs (bắt đầu với /)
  if (u.startsWith("/") && !u.startsWith("//")) {
    const API_BASE = import.meta.env.VITE_API_BASE || "https://localhost:7237";
    // Loại bỏ trailing slash từ API_BASE nếu có
    const baseUrl = API_BASE.replace(/\/$/, "");
    u = `${baseUrl}${u}`;
  }

  // Xử lý protocol-relative URLs (bắt đầu với //)
  if (u.startsWith("//")) {
    u = `https:${u}`;
  }

  // Chỉ chuyển http sang https nếu không phải localhost (để tránh SSL issues trong development)
  if (u.startsWith("http://") && !u.includes("localhost")) {
    u = "https://" + u.slice(7);
  }

  // Xử lý Google Drive URLs
  let m = u.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m && m[1]) u = `https://drive.google.com/uc?export=view&id=${m[1]}`;
  m = u.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (m && m[1]) u = `https://drive.google.com/uc?export=view&id=${m[1]}`;
  m = u.match(/drive\.google\.com\/uc\?(?:export=[^&]+&)?id=([^&]+)/);
  if (m && m[1]) u = `https://drive.google.com/uc?export=view&id=${m[1]}`;

  // Xử lý Dropbox URLs
  if (/dropbox\.com/.test(u)) {
    u = u
      .replace("www.dropbox.com", "dl.dropboxusercontent.com")
      .replace(/\?dl=0$/, "?dl=1");
  }
  return u;
}
function looksBlockedHost(u = "") {
  try {
    const h = new URL(u).hostname;
    return /(onedrive\.live\.com|sharepoint\.com|microsoft\.com)/i.test(h);
  } catch {
    return false;
  }
}

/** Hình an toàn: khi lỗi có thể ẩn đi (để placeholder giữ chiều cao) */
function SafeImage({ src, alt = "", className = "", hideOnError = false }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setUrl(normalizeImageUrl(src || ""));
    setFailed(false);
    setTried(false);
  }, [src]);

  function onError() {
    if (tried) {
      setFailed(true);
      return;
    }
    setTried(true);

    // Thử fallback cho Google Drive
    if (/drive\.google\.com\/uc\?/.test(url)) {
      setUrl(url.replace("export=view", "export=download"));
      return;
    }

    // Thử fallback từ HTTPS sang HTTP cho localhost (development)
    if (
      url.includes("https://localhost") &&
      !url.includes("http://localhost")
    ) {
      const httpUrl = url.replace("https://", "http://");
      setUrl(httpUrl);
      return;
    }

    setFailed(true);
  }

  if (!url || (failed && hideOnError)) return null;
  if (failed) {
    return (
      <ImageIcon className="h-6 w-6 text-neutral-400" aria-label="no-image" />
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      onError={onError}
    />
  );
}

function ImagePicker({ value, onChange }) {
  const fileInputRef = useRef(null);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const objectUrl = URL.createObjectURL(f);
    onChange(objectUrl, f);
  }

  function handleImageClick() {
    fileInputRef.current?.click();
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <div
        className="rounded-2xl overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleImageClick}
      >
        {value ? (
          <SafeImage
            src={value}
            alt="preview"
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-neutral-100 flex flex-col items-center justify-center text-neutral-400">
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm">Click để chọn ảnh</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== UI bits ===== */
function FieldLabel({ children, required }) {
  return (
    <div className="mb-1 text-sm text-neutral-600">
      {children}
      {required ? <span className="text-rose-600"> *</span> : null}
    </div>
  );
}
function ConfirmModal({ open, title, children, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1200] grid place-items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <button
            className="rounded p-1 hover:bg-neutral-100"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">{children}</div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            className="rounded-2xl h-10 px-4 bg-white border border-neutral-300 hover:bg-neutral-100 text-slate-900"
            onClick={onClose}
          >
            Huỷ
          </Button>
          <Button
            className="rounded-2xl h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={onConfirm}
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}

function ErrorModal({ open, message, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] grid place-items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold text-rose-600">Lỗi</div>
          <button
            className="rounded p-1 hover:bg-neutral-100"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-neutral-700 whitespace-pre-wrap break-words">
            {message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại."}
          </p>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            className="rounded-2xl h-10 px-4 bg-rose-600 hover:bg-rose-700 text-white"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ===== Garden Form Modal (dùng AddressPicker) ===== */
function GardenFormModal({ open, initial, onClose, onSubmit }) {
  const blank = {
    name: "",
    province: "",
    ward: "",
    address: "",
    coverUrl: "",
    soilIds: [],
    soilNames: [],
  };

  const [form, setForm] = useState(initial || blank);
  const [touched, setTouched] = useState({});
  const [soilPickerOpen, setSoilPickerOpen] = useState(false);
  const [soilOptions, setSoilOptions] = useState([]);
  const [soilLoading, setSoilLoading] = useState(false);
  const [soilError, setSoilError] = useState("");
  const [soilSearch, setSoilSearch] = useState("");
  const [soilDraft, setSoilDraft] = useState([]);
  const [soilReloadKey, setSoilReloadKey] = useState(0);

  useEffect(() => {
    if (open) {
      let cancelled = false;
      const baseForm = initial || blank;

      // If editing, load existing SoilMasterIds from GardenSoils
      if (initial?.id) {
        (async () => {
          try {
            const res = await GardenSoilRepository.getGardenSoilsByGarden(
              initial.id
            );
            const gardenSoils = Array.isArray(res)
              ? res
              : Array.isArray(res?.data)
              ? res.data
              : [];
            // Extract SoilMasterIds from GardenSoils
            const soilMasterIds = gardenSoils
              .map((gs) => gs?.soilMasterId ?? gs?.SoilMasterId ?? null)
              .filter((id) => id != null);

            if (!cancelled && soilMasterIds.length > 0) {
              setForm((prev) => ({
                ...prev,
                soilIds: soilMasterIds,
              }));
            }
          } catch (err) {
            console.error("Failed to load garden soils:", err);
          }
        })();
      }

      setForm(baseForm);
      setTouched({});
      setSoilSearch("");
      setSoilError("");

      return () => {
        cancelled = true;
      };
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setSoilLoading(true);
    setSoilError("");
    (async () => {
      try {
        const res = await GardenRepository.getSoilMasters();
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];
        if (!cancelled) setSoilOptions(list);
      } catch (err) {
        console.error("Failed to load soil masters:", err);
        if (!cancelled)
          setSoilError("Không tải được danh sách loại đất. Vui lòng thử lại.");
      } finally {
        if (!cancelled) setSoilLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, soilReloadKey]);

  useEffect(() => {
    if (soilPickerOpen) {
      const selectedIds = (form.soilIds || []).map(String);
      setSoilDraft(selectedIds);
      setSoilSearch("");
    }
  }, [soilPickerOpen, form.soilIds]);

  const normalizedSoils = useMemo(() => {
    return soilOptions
      .map((soil) => {
        // SoilMaster fields
        const id =
          soil?.soilMasterId ??
          soil?.SoilMasterId ??
          soil?.SoilMasterID ??
          soil?.id ??
          soil?.Id ??
          soil?.ID ??
          null;
        if (id == null) return null;
        const label =
          soil?.soilName ||
          soil?.SoilName ||
          soil?.name ||
          soil?.label ||
          `Đất #${id}`;
        const subtitle =
          soil?.notes ||
          soil?.texture ||
          soil?.Texture ||
          soil?.drainage ||
          soil?.Drainage ||
          soil?.description ||
          soil?.Description ||
          "";
        return {
          id: String(id),
          label,
          subtitle,
        };
      })
      .filter(Boolean);
  }, [soilOptions]);

  const filteredSoils = useMemo(() => {
    const term = soilSearch.trim().toLowerCase();
    if (!term) return normalizedSoils;
    return normalizedSoils.filter((soil) => {
      const haystack = `${soil.label} ${soil.subtitle}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [soilSearch, normalizedSoils]);

  const selectedSoils = useMemo(() => {
    const ids = (form.soilIds || []).map(String);
    if (!ids.length) return [];
    return normalizedSoils.filter((soil) => ids.includes(soil.id));
  }, [form.soilIds, normalizedSoils]);
  const chipNames = selectedSoils.length
    ? selectedSoils.map((soil) => soil.label)
    : toArray(form.soilNames);
  const selectedCount = form.soilIds?.length || 0;

  const toggleSoilDraft = (id) => {
    setSoilDraft((prev) => {
      const exists = prev.includes(id);
      return exists ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  const handleApplySoils = () => {
    const unique = Array.from(new Set(soilDraft));
    setForm((prev) => ({
      ...prev,
      soilIds: unique,
      soilNames: unique
        .map(
          (soilId) => normalizedSoils.find((soil) => soil.id === soilId)?.label
        )
        .filter(Boolean),
    }));
    setSoilPickerOpen(false);
  };

  const handleCloseSoilPicker = () => {
    setSoilPickerOpen(false);
  };

  const requestSoilReload = () => setSoilReloadKey((key) => key + 1);

  const errs = {
    name: !String(form.name || "").trim() ? "Tên vườn là bắt buộc" : "",
    province: !String(form.province || "").trim() ? "Nhập Tỉnh/Thành phố" : "",
    ward: !String(form.ward || "").trim() ? "Nhập Phường/Xã" : "",
    address: !String(form.address || "").trim() ? "Nhập địa chỉ chi tiết" : "",
  };
  const canSave = !errs.name && !errs.province && !errs.ward && !errs.address;

  function handleAddressChange(patch) {
    setForm((prev) => {
      const next = { ...prev };

      if ("province" in patch) {
        const p = patch.province;
        next.province = p ? p.full_name || p.name || "" : "";
        // Nếu AddressPicker reset ward (khi đổi tỉnh) thì xoá luôn text ward
        if (patch.ward === null) {
          next.ward = "";
        }
      }

      if ("ward" in patch) {
        const w = patch.ward;
        next.ward = w ? w.full_name || w.name || "" : "";
      }

      if ("address" in patch) {
        const raw = patch.address || "";
        // ✅ Giới hạn địa chỉ chi tiết chỉ tối đa 60 ký tự
        next.address = raw.slice(0, MAX_ADDRESS_LEN);
      }

      return next;
    });
  }

  if (!open) return null;

  return (
    <>
      <style>{CLICKABLE_FORM_STYLES}</style>
      <div className="fixed inset-0 z-[9999] grid place-items-center p-4 mm-clickable-form overflow-y-auto">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div
          className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl my-auto max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-lg font-semibold">
              {initial ? "Chỉnh sửa vườn" : "Tạo vườn mới"}
            </div>
            <button
              className="rounded p-1 hover:bg-neutral-100"
              onClick={onClose}
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên vườn */}
            <div>
              <FieldLabel required>Tên vườn</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    // ✅ giới hạn 60 ký tự
                    name: e.target.value.slice(0, MAX_GARDEN_NAME),
                  })
                }
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                maxLength={MAX_GARDEN_NAME}
                className={`h-12 rounded-xl text-[clamp(13px,1.6vw,16px)] ${
                  touched.name && errs.name
                    ? "border-rose-500"
                    : "border-neutral-300"
                }`}
                placeholder="Ví dụ: Vườn số 1 FPT"
              />

              <div className="mt-1 flex items-center justify-between">
                {touched.name && errs.name ? (
                  <p className="text-xs text-rose-600">{errs.name}</p>
                ) : (
                  <span className="text-xs text-transparent">.</span>
                )}
                <span className="text-[11px] text-neutral-400">
                  {form.name.length}/{MAX_GARDEN_NAME}
                </span>
              </div>
            </div>

            {/* Soil picker trigger */}
            <div className="md:col-span-1">
              <FieldLabel>Loại đất áp dụng</FieldLabel>
              <button
                type="button"
                onClick={() => setSoilPickerOpen(true)}
                className="w-full h-12 rounded-xl border border-neutral-300 bg-white px-4 text-left text-[15px] md:text-base flex items-center justify-between hover:border-emerald-500 transition"
              >
                <span
                  className={`truncate ${
                    selectedCount ? "text-[#0f1f1e]" : "text-neutral-400"
                  }`}
                >
                  {selectedCount
                    ? `${selectedCount} loại đất đã chọn`
                    : "Chọn loại đất phù hợp"}
                </span>
                <span className="text-sm text-emerald-600 font-semibold">
                  Chọn
                </span>
              </button>
              {chipNames.length ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {chipNames.map((label, index) => (
                    <span
                      key={`${label}-${index}`}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-medium"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 mt-2"></p>
              )}
            </div>

            {/* AddressPicker */}
            <div className="md:col-span-2">
              <AddressPicker
                value={{
                  province: form.province,
                  ward: form.ward,
                  address: form.address,
                }}
                onChange={handleAddressChange}
                invalidProvince={touched.province && !!errs.province}
                invalidWard={touched.ward && !!errs.ward}
                invalidAddress={touched.address && !!errs.address}
              />

              {(touched.province || touched.ward || touched.address) &&
              (errs.province || errs.ward || errs.address) ? (
                <p className="mt-1 text-xs text-rose-600">
                  Vui lòng nhập đầy đủ Tỉnh/Thành, Phường/Xã và địa chỉ chi
                  tiết.
                </p>
              ) : null}
            </div>

            {/* Ảnh vườn */}
            <div className="md:col-span-2">
              <FieldLabel>Ảnh vườn</FieldLabel>
              <ImagePicker
                value={form.coverUrl}
                onChange={(v, f) => setForm({ ...form, coverUrl: v, file: f })}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              className="rounded-2xl h-10 px-4 bg-white border border-neutral-300 hover:bg-neutral-100 text-slate-900"
              onClick={onClose}
            >
              Huỷ
            </Button>
            <Button
              className="rounded-2xl h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                if (!canSave) {
                  // Mark tất cả field là "đã chạm" để hiện cảnh báo
                  setTouched({
                    name: true,
                    province: true,
                    ward: true,
                    address: true,
                  });
                  return;
                }
                onSubmit(form);
              }}
            >
              {initial ? "Lưu thay đổi" : "Tạo vườn"}
            </Button>
          </div>
        </div>
        {soilPickerOpen && (
          <div className="fixed inset-0 z-[1350] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={handleCloseSoilPicker}
            />
            <div className="relative w-full max-w-3xl rounded-3xl bg-[#F7F9F2] p-6 shadow-2xl border border-emerald-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-500 font-semibold">
                    Chọn loại đất
                  </p>
                  <h3 className="text-2xl font-semibold text-[#0f1f1e] mt-1">
                    Áp dụng cho vườn này
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    Có thể chọn nhiều loại đất để gợi ý khi tạo cây. Các mục đã
                    chọn sẽ có viền xanh và biểu tượng tick.
                  </p>
                </div>
                <button
                  className="p-2 rounded-full hover:bg-white text-neutral-500"
                  onClick={handleCloseSoilPicker}
                  aria-label="Đóng chọn đất"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    value={soilSearch}
                    onChange={(e) => setSoilSearch(e.target.value)}
                    placeholder="Tìm kiếm loại đất..."
                    className="pl-9 pr-3 h-12 rounded-full border border-emerald-200 bg-white"
                  />
                </div>
                <div className="mt-4 h-[340px] overflow-y-auto pr-1 space-y-3">
                  {soilLoading ? (
                    <div className="h-full grid place-items-center text-sm text-neutral-500">
                      Đang tải dữ liệu loại đất...
                    </div>
                  ) : soilError ? (
                    <div className="h-full grid place-items-center text-sm text-rose-600 text-center px-6">
                      {soilError}
                      <button
                        className="mt-3 text-emerald-600 font-semibold underline underline-offset-2"
                        onClick={requestSoilReload}
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : filteredSoils.length ? (
                    filteredSoils.map((soil) => {
                      const selected = soilDraft.includes(soil.id);
                      return (
                        <button
                          type="button"
                          key={soil.id}
                          onClick={() => toggleSoilDraft(soil.id)}
                          className={`w-full text-left rounded-2xl border p-4 transition flex items-start gap-4 bg-white ${
                            selected
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-neutral-200 hover:border-emerald-200"
                          }`}
                        >
                          <span
                            className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border ${
                              selected
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-neutral-300 text-transparent"
                            }`}
                          >
                            <Check
                              className={`h-4 w-4 ${
                                selected ? "opacity-100" : "opacity-0"
                              }`}
                            />
                          </span>
                          <div>
                            <div className="font-semibold text-[#0f1f1e]">
                              {soil.label}
                            </div>
                            {soil.subtitle ? (
                              <p className="text-sm text-neutral-600 mt-1">
                                {soil.subtitle}
                              </p>
                            ) : null}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="h-full grid place-items-center text-sm text-neutral-500">
                      Không tìm thấy loại đất phù hợp với từ khóa.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-sm text-neutral-600">
                  Đã chọn{" "}
                  <span className="font-semibold text-emerald-600">
                    {soilDraft.length}
                  </span>{" "}
                  loại đất.
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    className="rounded-full h-11 px-5 border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                    type="button"
                    onClick={handleCloseSoilPicker}
                  >
                    Huỷ
                  </Button>
                  <Button
                    className="rounded-full h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-[0_14px_30px_rgba(16,185,129,0.35)]"
                    type="button"
                    onClick={handleApplySoils}
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ===== Utils ===== */

function clampText(str, max) {
  if (!str) return "";
  const s = String(str);
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

function normalizeText(v) {
  return String(v || "")
    .trim()
    .toLowerCase();
}

function formatGardenLocation(g) {
  const full = [g.address, g.ward, g.province].filter(Boolean).join(", ");
  return full;
}

function makeLocationKey(obj = {}) {
  return [obj.address, obj.ward, obj.province]
    .map(normalizeText)
    .filter(Boolean)
    .join(" | ");
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function extractSoilId(soil) {
  return (
    soil?.gardenSoilId ??
    soil?.GardenSoilId ??
    soil?.soilMasterId ??
    soil?.SoilMasterId ??
    soil?.SoilMasterID ??
    soil?.id ??
    soil?.Id ??
    soil?.ID ??
    null
  );
}

function extractSoilLabel(soil) {
  return (
    soil?.customLabel ||
    soil?.SoilName ||
    soil?.soilName ||
    soil?.name ||
    soil?.label ||
    ""
  );
}

function normalizeGardenRecord(g) {
  if (!g) return g;
  const inlineSoils = Array.isArray(g.soils)
    ? g.soils
    : Array.isArray(g.gardenSoils)
    ? g.gardenSoils
    : [];

  const fallbackIds = inlineSoils
    .map((soil) => {
      const id = extractSoilId(soil);
      return id != null ? String(id) : null;
    })
    .filter(Boolean);

  const fallbackNames = inlineSoils
    .map((soil) => extractSoilLabel(soil))
    .filter(Boolean);

  const soilIds = toArray(g.soilIds).map(String);
  const soilNames = toArray(g.soilNames);

  return {
    ...g,
    soilIds: soilIds.length ? soilIds : fallbackIds,
    soilNames: soilNames.length ? soilNames : fallbackNames,
  };
}

/* ================================
   MAIN: GardenManagement
================================ */
export default function GardenManagement() {
  const navigate = useNavigate();

  // Mở danh sách cây của 1 vườn
  function openTrees(g) {
    // Lưu vườn đã chọn để TreeManagement / TreeDetail đọc lại
    localStorage.setItem(
      LS_SELECTED_GARDEN,
      JSON.stringify({ id: g.id, name: g.name })
    );

    // Bắn event để tab TreeManagement đang mở có thể update title ngay
    window.dispatchEvent(
      new CustomEvent("mm:garden:selected", {
        detail: { id: g.id, name: g.name },
      })
    );

    // Điều hướng sang màn Tree
    navigate(
      `/tree?gardenId=${encodeURIComponent(
        g.id
      )}&gardenName=${encodeURIComponent(g.name)}`
    );
  }

  // ===== data vườn =====
  // 1) Khởi tạo từ localStorage + defaultGardens (offline/fallback)
  const [gardens, setGardens] = useState(() =>
    ensureIds(load(LS_GARDENS, defaultGardens)).map(normalizeGardenRecord)
  );

  // 2) Lấy danh sách vườn từ backend, đồng bộ lại state + localStorage
  useEffect(() => {
    async function fetchGardens() {
      try {
        const res = await GardenRepository.getGardens(1, 50); // lấy 50 vườn đầu tiên
        if (res?.success && Array.isArray(res.data?.gardens)) {
          const apiGardensRaw = res.data.gardens.map((g) => {
            let province = "";
            let ward = "";
            let address = "";

            // Parse location: "Địa chỉ chi tiết, Phường/Xã, Tỉnh/Thành"
            if (g.location) {
              const parts = g.location
                .split(",")
                .map((p) => p.trim())
                .filter(Boolean);

              if (parts.length === 1) {
                // "Hà Nội"
                province = parts[0];
              } else if (parts.length === 2) {
                // "Phường 1, TP.HCM"
                ward = parts[0];
                province = parts[1];
              } else if (parts.length >= 3) {
                // "Thôn A, Xã B, Tỉnh C" -> address="Thôn A", ward="Xã B", province="Tỉnh C"
                address = parts.slice(0, parts.length - 2).join(", ");
                ward = parts[parts.length - 2];
                province = parts[parts.length - 1];
              }
            }

            return {
              id: g.gardenId, // ⚠️ phải giữ id backend để TreeManagement / TreeDetail dùng
              name: g.name,
              province,
              ward,
              address,
              coverUrl: g.coverUrl || "",
            };
          });

          const apiGardens = ensureIds(apiGardensRaw).map(
            normalizeGardenRecord
          );
          setGardens(apiGardens);
          save(LS_GARDENS, apiGardens); // sync localStorage cho lần load sau
        }
      } catch (error) {
        console.error("Failed to fetch gardens:", error);
        // nếu lỗi, vẫn dùng dữ liệu từ localStorage / defaultGardens
      }
    }

    fetchGardens();
  }, []);

  // ===== search + filter =====
  const [q, setQ] = useState("");
  const [provinceFilter, setProvinceFilter] = useState(""); // Filter theo tỉnh/thành
  const [treeCountRange, setTreeCountRange] = useState([0, 100]); // [min, max] range cho số lượng cây

  // ===== phân trang =====
  const [page, setPage] = useState(1);

  // ===== tree counts cho mỗi garden =====
  const [gardenTreeCounts, setGardenTreeCounts] = useState({});

  // Load tree counts cho tất cả gardens
  useEffect(() => {
    async function fetchTreeCounts() {
      const counts = {};
      for (const g of gardens) {
        try {
          const res = await GardenRepository.getGardenById(g.id);
          if (res?.success && res?.data) {
            counts[g.id] = res.data.statistics?.totalTrees || 0;
          }
        } catch (err) {
          console.error(`Failed to fetch tree count for garden ${g.id}`, err);
          counts[g.id] = 0;
        }
      }
      setGardenTreeCounts(counts);
    }
    if (gardens.length > 0) {
      fetchTreeCounts();
    }
  }, [gardens]);

  // mỗi khi thay đổi bộ lọc / search → quay lại trang 1
  useEffect(() => {
    setPage(1);
  }, [q, treeCountRange, provinceFilter]);

  // ===== modal thêm / sửa =====
  const [openForm, setOpenForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState(-1);

  // ===== confirm xoá =====
  const [confirm, setConfirm] = useState({ open: false, targetIdx: -1 });

  // ===== error notification =====
  const [error, setError] = useState({ open: false, message: "" });

  // ===== lọc danh sách theo search + filter =====
  const filtered = useMemo(() => {
    const QQ = q.trim().toLowerCase();
    return gardens.filter((g) => {
      // 1) Search text
      if (QQ) {
        const hit = [g.name, g.province, g.ward, g.address]
          .join(" ")
          .toLowerCase()
          .includes(QQ);
        if (!hit) return false;
      }

      // 2) Filter theo tỉnh/thành
      if (provinceFilter && g.province !== provinceFilter) return false;

      // 3) Filter theo số lượng cây (range)
      const treeCount = gardenTreeCounts[g.id] || 0;
      if (treeCount < treeCountRange[0] || treeCount > treeCountRange[1]) {
        return false;
      }

      return true;
    });
  }, [gardens, q, treeCountRange, provinceFilter, gardenTreeCounts]);

  // ===== stats mini =====
  const stats = useMemo(() => {
    const total = gardens.length;
    const totalTrees = Object.values(gardenTreeCounts).reduce(
      (sum, count) => sum + (count || 0),
      0
    );
    const gardensWithTrees = Object.values(gardenTreeCounts).filter(
      (count) => (count || 0) > 0
    ).length;
    return { total, totalTrees, gardensWithTrees };
  }, [gardens, gardenTreeCounts]);

  // ===== phân trang từ filtered =====
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  // ===== provinces cho filter combobox =====
  const { provinces = [] } =
    (typeof useVnAdmin === "function" ? useVnAdmin() : {}) || {};

  // ===== Tính max tree count cho slider =====
  const maxTreeCount = useMemo(() => {
    const counts = Object.values(gardenTreeCounts).map((c) => c || 0);
    if (counts.length === 0) return 100;
    const max = Math.max(...counts);
    return Math.max(100, Math.ceil(max / 10) * 10); // Làm tròn lên đến hàng chục gần nhất, tối thiểu 100
  }, [gardenTreeCounts]);

  // Cập nhật range khi maxTreeCount thay đổi (chỉ khi cần thiết)
  useEffect(() => {
    if (treeCountRange[1] > maxTreeCount) {
      setTreeCountRange([treeCountRange[0], maxTreeCount]);
    } else if (treeCountRange[1] === 100 && maxTreeCount > 100) {
      // Khởi tạo lần đầu khi có dữ liệu
      setTreeCountRange([0, maxTreeCount]);
    }
  }, [maxTreeCount, treeCountRange]);

  function openAdd() {
    setEditingIdx(-1);
    setOpenForm(true);
  }

  function openEdit(i) {
    setEditingIdx(i);
    setOpenForm(true);
  }

  function handleSubmit(form) {
    //console.log(form);

    (async () => {
      try {
        // Prevent duplicate garden names at the same location
        const currentNameKey = normalizeText(form.name);
        const currentLocationKey = makeLocationKey(form);
        const hasDuplicate = gardens.some((g, idx) => {
          if (editingIdx >= 0 && idx === editingIdx) return false;
          return (
            normalizeText(g.name) === currentNameKey &&
            makeLocationKey(g) === currentLocationKey
          );
        });
        if (hasDuplicate) {
          setError({
            open: true,
            message:
              "Tên vườn này đã tồn tại tại cùng địa chỉ. Vui lòng đổi tên hoặc cập nhật địa chỉ.",
          });
          return;
        }

        let coverUrl = form.coverUrl; // fallback if user uses URL

        // If user uploaded a file, upload it first
        if (form.file instanceof File) {
          try {
            const data = await GardenRepository.uploadGardenImage(form.file);
            if (data.success && data.url) {
              coverUrl = data.url; // update coverUrl with uploaded file URL
            } else {
              console.error("File upload failed", data);
              setError({
                open: true,
                message: "Upload file thất bại. Vui lòng thử lại.",
              });
              return;
            }
          } catch (err) {
            console.error("File upload error", err);
            const errorMessage =
              err?.message || "Upload file thất bại. Vui lòng thử lại.";
            setError({ open: true, message: errorMessage });
            return;
          }
        }

        // Prepare updated form with coverUrl
        const updatedForm = { ...form, coverUrl };
        delete updatedForm.file;
        updatedForm.soilIds = Array.isArray(updatedForm.soilIds)
          ? updatedForm.soilIds.map((id) => String(id)).filter(Boolean)
          : [];
        updatedForm.soilNames = Array.isArray(updatedForm.soilNames)
          ? updatedForm.soilNames
          : [];
        const payloadSoilMasterIds = updatedForm.soilIds
          .map((id) => Number(id))
          .filter((id) => !Number.isNaN(id));

        if (editingIdx >= 0) {
          const payload = {
            Name: form.name || undefined, // optional
            Location: formatGardenLocation(form) || undefined, // optional
            CoverUrl: coverUrl, // uploaded file or existing URL
            TimeZone: form.timeZone ?? null, // optional
            ClimateZone: form.climateZone ?? null, // optional
            SoilMasterIds:
              payloadSoilMasterIds.length > 0 ? payloadSoilMasterIds : null,
          };
          const res = await GardenRepository.updateGarden(
            updatedForm.id,
            payload
          );
          if (!res?.success) {
            const errorMessage =
              res?.message || "Cập nhật vườn thất bại. Vui lòng thử lại.";
            setError({ open: true, message: errorMessage });
            return;
          }

          // sửa vườn
          setGardens((gs) => {
            const prev = gs[editingIdx];
            const next = [...gs];
            next[editingIdx] = normalizeGardenRecord({
              ...prev,
              ...updatedForm,
            });

            // Nếu tên đổi → phát event để TreeManagement cập nhật title
            if (prev.name !== updatedForm.name) {
              window.dispatchEvent(
                new CustomEvent("mm:garden:renamed", {
                  detail: { id: next[editingIdx].id, name: updatedForm.name },
                })
              );

              // Nếu vườn này đang được chọn, cập nhật luôn LS_SELECTED_GARDEN
              try {
                const sel = JSON.parse(
                  localStorage.getItem(LS_SELECTED_GARDEN) || "null"
                );
                if (sel && sel.id === next[editingIdx].id) {
                  localStorage.setItem(
                    LS_SELECTED_GARDEN,
                    JSON.stringify({ id: sel.id, name: updatedForm.name })
                  );
                }
              } catch {
                // ignore
              }
            }

            save(LS_GARDENS, next);
            return next;
          });
        } else {
          const payload = {
            Name: updatedForm.name,
            Location: formatGardenLocation(updatedForm), // use your existing function
            CoverUrl: updatedForm.coverUrl,
            TimeZone: null,
            ClimateZone: null,
            SoilMasterIds:
              payloadSoilMasterIds.length > 0 ? payloadSoilMasterIds : null,
          };
          const res = await GardenRepository.createGarden(payload);
          if (!res?.success) {
            const errorMessage =
              res?.message || "Tạo vườn thất bại. Vui lòng thử lại.";
            setError({ open: true, message: errorMessage });
            return;
          }
          updatedForm.id = res.data.gardenId;

          // thêm mới
          setGardens((gs) => {
            const next = [normalizeGardenRecord({ ...updatedForm }), ...gs];
            save(LS_GARDENS, next);
            return next;
          });
        }
        setOpenForm(false);
        setEditingIdx(-1);
      } catch (err) {
        console.error("Garden update/create error:", err);
        // Extract error message from the error object
        const errorMessage =
          err?.message ||
          err?.response?.data?.message ||
          "Đã xảy ra lỗi khi cập nhật vườn. Vui lòng thử lại.";
        setError({ open: true, message: errorMessage });
      }
    })();
  }

  function askDelete(i) {
    setConfirm({ open: true, targetIdx: i });
  }

  function doDelete() {
    const idx = confirm.targetIdx;
    const victim = gardens[idx];

    setGardens((gs) => {
      const next = gs.filter((_, i) => i !== idx);
      save(LS_GARDENS, next);
      return next;
    });
    setConfirm({ open: false, targetIdx: -1 });

    // Nếu đang chọn vườn này, clear lựa chọn
    try {
      const sel = JSON.parse(
        localStorage.getItem(LS_SELECTED_GARDEN) || "null"
      );
      if (sel && victim && sel.id === victim.id) {
        localStorage.removeItem(LS_SELECTED_GARDEN);
        window.dispatchEvent(
          new CustomEvent("mm:garden:deleted", { detail: { id: victim.id } })
        );
      }
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* ✅ Nền sống */}
      <LivingBackground
        baseColor={PALETTE.bg}
        palette={[PALETTE.leaf, PALETTE.ivory, PALETTE.accent]}
        density={28}
      />

      {/* UI trên nền sống */}
      <div className="mm-fluid-page relative min-h-screen pt-[64px] z-10">
        <main className="mm-fluid-shell px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6 text-[clamp(14px,1.8vw,17px)]">
          {/* Header */}
          <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="max-w-[820px]">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[clamp(11px,1.3vw,13px)] font-medium mm-text-wrap-safe"
                style={{ background: PALETTE.accent, color: PALETTE.bg }}
              >
                Quản lý vườn
              </span>
              <h1 className="mt-2 text-white text-[clamp(24px,4vw,48px)] font-semibold tracking-tight leading-tight mm-text-wrap-safe">
                Danh Sách Quản Lý Vườn
              </h1>
              <p className="text-white/85 mt-2 text-[clamp(13px,1.6vw,17px)] mm-text-wrap-safe">
                Tạo, chỉnh sửa, lọc và tra cứu thông tin các vườn — dùng chung
                nguồn dữ liệu với UserProfile.
              </p>
            </div>

            <div className="w-full md:w-auto flex items-stretch md:items-center gap-3 md:gap-4">
              <Button
                onClick={openAdd}
                className="h-12 md:h-12 px-5 md:px-6 rounded-2xl text-[clamp(14px,1.8vw,16px)] font-semibold shadow-[0_10px_28px_rgba(255,255,165,0.20)] ring-1 ring-black/5 transition-all hover:shadow-[0_14px_44px_rgba(255,255,165,0.26)] hover:-translate-y-0.5 mm-text-wrap-safe break-words"
                style={{
                  background:
                    "linear-gradient(135deg,#FFFFA5 0%, #D1DFB6 100%)",
                  color: "#1F302F",
                }}
              >
                <span className="inline-flex items-center gap-3">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/70 backdrop-blur">
                    <Plus className="w-5 h-5" />
                  </span>
                  Thêm vườn
                </span>
              </Button>
            </div>
          </section>

          {/* Filters */}
          <section className="sticky top-[64px] z-[50] overflow-visible">
            <div
              className="flex flex-col xl:flex-row gap-3 rounded-2xl p-3"
              style={{
                background: "rgba(251,255,223,0.06)",
                border: "1px solid rgba(255,255,165,0.15)",
              }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm tên/địa chỉ/tỉnh..."
                  className="pl-9 bg-white/95 text-[#0f1f1e] placeholder:text-neutral-500 rounded-full h-12 text-[clamp(13px,1.6vw,15px)] mm-text-wrap-safe"
                />
              </div>

              <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 flex-wrap">
                {/* Filter theo vị trí */}
                <select
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                  className="h-12 rounded-full border bg-white px-3 text-[clamp(13px,1.6vw,15px)] transition-all duration-200 hover:border-emerald-400 hover:shadow-md hover:scale-[1.02] cursor-pointer mm-text-wrap-safe min-w-[180px]"
                  title="Lọc theo tỉnh/thành"
                >
                  <option value="">Tất cả tỉnh/thành</option>
                  {(provinces || []).map((p) => (
                    <option key={p.code} value={p.name}>
                      {p.full_name || p.name}
                    </option>
                  ))}
                </select>

                {/* Filter theo số lượng cây - Slider */}
                <div className="flex-1 min-w-[200px] xl:min-w-[300px] bg-white/95 rounded-full px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[clamp(12px,1.5vw,14px)] text-neutral-700 font-medium">
                      Số lượng cây: {treeCountRange[0]} - {treeCountRange[1]}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-neutral-500 hover:text-neutral-700"
                      onClick={() => setTreeCountRange([0, maxTreeCount])}
                    >
                      Đặt lại
                    </Button>
                  </div>
                  <Slider
                    value={treeCountRange}
                    onValueChange={setTreeCountRange}
                    min={0}
                    max={maxTreeCount}
                    step={1}
                    className="w-full"
                  />
                </div>

                {q ||
                provinceFilter ||
                treeCountRange[0] > 0 ||
                treeCountRange[1] < maxTreeCount ? (
                  <Button
                    variant="outline"
                    className="h-12 rounded-full text-[clamp(12px,1.5vw,14px)] transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 mm-text-wrap-safe break-words"
                    onClick={() => {
                      setQ("");
                      setProvinceFilter("");
                      setTreeCountRange([0, maxTreeCount]);
                    }}
                  >
                    Xoá bộ lọc
                  </Button>
                ) : null}
              </div>
            </div>
          </section>

          {/* Mini stats */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            {[
              { label: "Tổng vườn", value: stats.total },
              { label: "Tổng cây", value: stats.totalTrees },
              { label: "Vườn có cây", value: stats.gardensWithTrees },
            ].map((s, i) => (
              <div
                key={i}
                className="relative rounded-xl px-5 py-3.5 flex items-center justify-between text-[clamp(12px,1.5vw,14px)]"
                style={{
                  background: "rgba(251,255,223,0.06)",
                  border: "1px solid rgba(255,255,165,0.15)",
                  color: PALETTE.ivory,
                }}
              >
                <span className="inline-flex items-center gap-2 opacity-80">
                  {s.label}
                </span>
                <span className="font-semibold text-lg">{s.value}</span>
              </div>
            ))}
          </section>

          {/* Gardens grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {paged.map((g) => {
              const idx = gardens.findIndex((x) => x.id === g.id);
              const status = g.status?.toLowerCase() || "active";
              const isActive =
                status === "active" || status === "đang hoạt động";

              return (
                <Card
                  key={g.id}
                  className="group rounded-3xl overflow-hidden shadow-sm transition-all duration-500 ease-out h-full flex flex-col cursor-pointer text-[clamp(14px,1.8vw,16px)] border border-[rgba(255,255,165,0.25)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-500 hover:border-[4px] hover:ring-4 hover:ring-emerald-400/60 animate-pulse-on-hover"
                  style={{
                    background: "#FFFFFFF2",
                  }}
                  role="button"
                  tabIndex={0}
                  onClick={() => openTrees(g)}
                  onKeyDown={(e) => e.key === "Enter" && openTrees(g)}
                >
                  {/* Header ảnh */}
                  <div className="relative h-52 w-full bg-neutral-100">
                    <div className="absolute inset-0 grid place-items-center text-neutral-400">
                      {!g.coverUrl && <TreePine className="h-9 w-9" />}
                    </div>
                    {g.coverUrl ? (
                      <div className="absolute inset-0 overflow-hidden">
                        <SafeImage
                          src={g.coverUrl}
                          alt={g.name}
                          className="w-full h-full object-cover"
                          hideOnError
                        />
                      </div>
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col">
                    {/* Khối thông tin vườn */}
                    <div className="flex flex-col gap-3 flex-1">
                      {/* Tên vườn + pill trạng thái */}
                      <div className="min-w-0">
                        <div
                          className="font-semibold text-[clamp(15px,2vw,18px)] text-[#0f1f1e] leading-snug break-words mm-text-wrap-safe"
                          title={g.name}
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {g.name}
                        </div>
                      </div>

                      {/* Địa chỉ */}
                      <div className="flex items-start gap-1.5 text-[clamp(12px,1.5vw,14px)] text-neutral-650">
                        <MapPin className="h-4 w-4 mt-[1px] flex-shrink-0 text-neutral-500" />
                        <div
                          className="min-w-0 leading-snug break-words mm-text-wrap-safe"
                          title={formatGardenLocation(g)}
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {formatGardenLocation(g) || "Chưa thiết lập địa chỉ"}
                        </div>
                      </div>

                      {/* Số cây trong vườn */}
                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 text-[clamp(11px,1.4vw,13px)] font-medium mm-text-wrap-safe">
                          <TreePine className="h-3.5 w-3.5" />
                          <GardenTreeCount g={g} key={g} />
                        </span>
                      </div>
                    </div>

                    {/* Actions ở đáy card */}
                    <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10 rounded-xl px-4 text-[clamp(12px,1.5vw,14px)] transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 mm-text-wrap-safe break-words"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (idx >= 0) openEdit(idx);
                          }}
                        >
                          <Edit3 className="w-4 h-4 mr-1.5 flex-shrink-0" />
                          <span className="mm-text-wrap-safe break-words">
                            Sửa vườn
                          </span>
                        </Button>

                        <button
                          type="button"
                          className="hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (idx >= 0) askDelete(idx);
                          }}
                          aria-label="Xoá vườn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Nút trạng thái */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (idx >= 0) askToggleStatus(idx);
                        }}
                        className={`hidden inline-flex items-center justify-center h-10 px-4 rounded-full text-[clamp(11px,1.4vw,13px)] font-semibold shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-[0.95] mm-text-wrap-safe ${
                          isActive
                            ? "bg-rose-500 text-white hover:bg-rose-600 shadow-[0_8px_18px_rgba(244,63,94,0.28)] hover:shadow-[0_12px_28px_rgba(244,63,94,0.40)]"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_8px_18px_rgba(16,185,129,0.28)] hover:shadow-[0_12px_28px_rgba(16,185,129,0.40)]"
                        }`}
                      >
                        {isActive ? "Dừng hoạt động" : "Khởi động lại"}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          {/* Phân trang */}
          {filtered.length > 0 && totalPages > 1 && (
            <section className="mt-2 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/85">
              <div>
                Hiển thị{" "}
                <span className="font-semibold">
                  {startIndex + 1}-
                  {Math.min(startIndex + PAGE_SIZE, filtered.length)}
                </span>{" "}
                trên <span className="font-semibold">{filtered.length}</span>{" "}
                vườn
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full px-3 text-[13px] bg-white/90"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trang trước
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNumber = i + 1;
                    const isCurrent = pageNumber === currentPage;
                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        className={`min-w-[32px] h-9 rounded-full text-[clamp(11px,1.4vw,13px)] px-2 ${
                          isCurrent
                            ? "bg-[#FFFFA5] text-[#1F302F] font-semibold"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full px-3 text-[13px] bg-white/90"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Trang sau
                </Button>
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <div className="text-center text-white/70 py-10">
              Không có vườn phù hợp
            </div>
          )}
        </main>

        {/* Modals */}
        <GardenFormModal
          open={openForm}
          initial={editingIdx >= 0 ? gardens[editingIdx] : null}
          onClose={() => {
            setOpenForm(false);
            setEditingIdx(-1);
          }}
          onSubmit={handleSubmit}
        />

        <ConfirmModal
          open={confirm.open}
          title="Xoá vườn?"
          onClose={() => setConfirm({ open: false, targetIdx: -1 })}
          onConfirm={doDelete}
        >
          <p className="text-sm text-neutral-700">
            Bạn chắc chắn muốn xoá vườn{" "}
            <span className="font-medium">
              {confirm.targetIdx >= 0 ? gardens[confirm.targetIdx]?.name : ""}
            </span>
            ? Hành động này không thể hoàn tác.
          </p>
        </ConfirmModal>

        <ErrorModal
          open={error.open}
          message={error.message}
          onClose={() => setError({ open: false, message: "" })}
        />
      </div>
    </>
  );
}
