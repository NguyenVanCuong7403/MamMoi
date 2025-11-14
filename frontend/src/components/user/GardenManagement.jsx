import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
// ⬇⬇ Nền sống
import { LivingBackground } from "@/components/background";
import AddressPicker from "@/components/AddressPicker";
import { TREES_ARRAY, getTreeById } from "@/data/demoTrees";


// ✅ Dùng default import (đúng với file của bạn: src/lib/useVnAdmin.js)
import useVnAdmin from "@/lib/useVnAdmin";


const PAGE_SIZE = 12;
/* ===== Theme (khớp vibe TreeManagement) ===== */
const PALETTE = { bg: "#1F302F", leaf: "#D1DFB6", ivory: "#FBFFDF", accent: "#FFFFA5" };
const MAX_ADDRESS_LEN = 60;
/* ===== LocalStorage keys (giống UserProfile) ===== */
const LS_GARDENS = "mm_user_gardens_v3";

const MAX_GARDEN_NAME = 60;      // tối đa 60 ký tự cho tên vườn
const MAX_GARDEN_ADDRESS = 120;  // tối đa 120 ký tự cho địa chỉ chi tiết


/* ===== Default gardens (demo) ===== */
const defaultGardens = [
  {
    name: "Vườn số 1 FPT",
    province: "Hà Nội",
    ward: "Thạch Hoà",
    address: "Khu A",
    status: "Đang hoạt động",
    coverUrl: "",
  },
  {
    name: "Vườn số 2 FPT",
    province: "Hà Nội",
    ward: "Phú Cát",
    address: "Khu B",
    status: "Đang hoạt động",
    coverUrl: "",
  },
  {
    name: "Vườn số 3 FPT",
    province: "Hòa Bình",
    ward: "Dân Hạ",
    address: "Thửa 03",
    status: "Đang hoạt động",
    coverUrl: "",
  },
];

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
  if (changed) save(LS_GARDENS, next);
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
 * Chuẩn hoá 1 cây theo đúng cách TreeManagement đang làm
 * nhưng dùng garden hiện tại (g) làm fallback.
 */
function canonicalizeTreeForGarden(raw, g) {
  const effectiveId = g?.id || raw?.gardenId;
  const effectiveName = g?.name || raw?.gardenName;

  const baseId = raw?.id ?? raw?.treeId;
  const base = baseId ? getTreeById(baseId) : null;
  const merged = base ? { ...raw, ...base, id: base.id ?? String(baseId) } : { ...raw };

  const gardenId = merged.gardenId || effectiveId;
  const gardenName = merged.gardenName || effectiveName;

  const locationLabel =
    merged.locationLabel ||
    (typeof merged.location === "string"
      ? merged.location
      : merged.location?.label) ||
    gardenName;

  return {
    ...merged,
    id: merged.id ?? String(baseId || ""),
    gardenId,
    gardenName,
    locationLabel,
  };
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
  if (!g) return 0;
  const rawList = Array.isArray(TREES_ARRAY) ? TREES_ARRAY : [];

  // Chuẩn hoá toàn bộ cây theo đúng cách TreeManagement làm
  const canonicalList = rawList.map((raw) =>
    canonicalizeTreeForGarden(raw, g)
  );

  // Đếm những cây mà logic isTreeInGarden xác định thuộc vườn g
  return canonicalList.filter((t) => isTreeInGardenForCount(t, g)).length;
}


/* ===== SafeImage + ImagePicker ===== */
function normalizeImageUrl(raw = "") {
  if (!raw) return "";
  let u = String(raw).trim();
  if (u.startsWith("http://")) u = "https://" + u.slice(7);

  let m = u.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m && m[1]) u = `https://drive.google.com/uc?export=view&id=${m[1]}`;
  m = u.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (m && m[1]) u = `https://drive.google.com/uc?export=view&id=${m[1]}`;
  m = u.match(/drive\.google\.com\/uc\?(?:export=[^&]+&)?id=([^&]+)/);
  if (m && m[1]) u = `https://drive.google.com/uc?export=view&id=${m[1]}`;

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
    if (tried) return setFailed(true);
    setTried(true);
    if (/drive\.google\.com\/uc\?/.test(url)) {
      setUrl(url.replace("export=view", "export=download"));
    } else setFailed(true);
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
  const [urlInput, setUrlInput] = useState("");
  const [useLink, setUseLink] = useState(false);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const objectUrl = URL.createObjectURL(f);
    onChange(objectUrl);
  }
  function applyUrl() {
    const n = normalizeImageUrl(urlInput || "");
    const finalUrl = looksBlockedHost(n)
      ? `/api/image-proxy?u=${encodeURIComponent(n)}`
      : n;
    if (finalUrl) onChange(finalUrl);
    setUrlInput("");
    setUseLink(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <label className="flex h-10 items-center gap-2 rounded-xl border bg-white px-3 text-sm cursor-pointer hover:bg-neutral-50">
          <Upload className="w-4 h-4" />
          <span>Chọn ảnh (tải lên)</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        <Button
          type="button"
          className="rounded-2xl h-10 px-4"
          onClick={() => setUseLink((v) => !v)}
        >
          Dùng link
        </Button>
      </div>
      {useLink && (
        <div className="flex gap-2">
          <Input
            placeholder="Dán link ảnh (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="rounded-xl bg-white"
          />
          <Button
            className="rounded-2xl h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            type="button"
            onClick={applyUrl}
          >
            Áp dụng
          </Button>
          <Button
            className="rounded-2xl h-10 px-4 bg-white border border-neutral-300 hover:bg-neutral-100 text-slate-900"
            type="button"
            onClick={() => {
              setUseLink(false);
              setUrlInput("");
            }}
          >
            Huỷ
          </Button>
        </div>
      )}
      {value ? (
        <div className="rounded-2xl overflow-hidden border">
          <SafeImage src={value} alt="preview" className="w-full h-40 object-cover" />
        </div>
      ) : null}
    </div>
  );
}

/* ===== UI bits ===== */
function StatusPill({ s }) {
  const map = {
    "Đang hoạt động": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Dừng hoạt động": "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] md:text-[12px] border ${
        map[s] || "bg-neutral-50 text-neutral-700 border-neutral-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {s}
    </span>
  );
}
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

/* ===== Garden Form Modal (dùng AddressPicker) ===== */
function GardenFormModal({ open, initial, onClose, onSubmit }) {
  const blank = {
    name: "",
    province: "",
    ward: "",
    address: "",
    status: "Đang hoạt động",
    coverUrl: "",
  };

  const [form, setForm] = useState(initial || blank);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial || blank);
      setTouched({});
    }
  }, [open, initial]);

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
    <div className="fixed inset-0 z-[1200] grid place-items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
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
    className={`h-12 rounded-xl text-[15px] md:text-base ${
      touched.name && errs.name ? "border-rose-500" : "border-neutral-300"
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


          {/* Trạng thái */}
          <div>
            <FieldLabel>Trạng thái</FieldLabel>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
              className="h-12 w-full rounded-xl border bg-white px-3 text-[15px] md:text-base"
            >
              <option>Đang hoạt động</option>
              <option>Dừng hoạt động</option>
            </select>
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
                Vui lòng nhập đầy đủ Tỉnh/Thành, Phường/Xã và địa chỉ chi tiết.
              </p>
            ) : null}
          </div>

          {/* Ảnh vườn */}
          <div className="md:col-span-2">
            <FieldLabel>Ảnh vườn</FieldLabel>
            <ImagePicker
              value={form.coverUrl}
              onChange={(v) => setForm({ ...form, coverUrl: v })}
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
    </div>
  );
}

/* ===== Utils ===== */


function clampText(str, max) {
  if (!str) return "";
  const s = String(str);
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

function formatGardenLocation(g) {
  const full = [g.address, g.ward, g.province].filter(Boolean).join(", ");
  return full;
}



/* ================================
   MAIN: GardenManagement
================================ */
export default function GardenManagement() {
  const navigate = useNavigate();

  function openTrees(g) {
    localStorage.setItem(
      LS_SELECTED_GARDEN,
      JSON.stringify({ id: g.id, name: g.name })
    );

    window.dispatchEvent(
      new CustomEvent("mm:garden:selected", { detail: { id: g.id, name: g.name } })
    );

    navigate(
      `/tree?gardenId=${encodeURIComponent(g.id)}&gardenName=${encodeURIComponent(
        g.name
      )}`
    );
  }

  // ===== data vườn =====
  const [gardens, setGardens] = useState(() =>
    ensureIds(load(LS_GARDENS, defaultGardens))
  );

  useEffect(() => save(LS_GARDENS, gardens), [gardens]);

  // ===== search + filter =====
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | active | stopped
  const [provinceFilter, setProvinceFilter] = useState("");

  // ===== phân trang =====
  const [page, setPage] = useState(1);

  // mỗi khi thay đổi bộ lọc / search → quay lại trang 1
  useEffect(() => {
    setPage(1);
  }, [q, status, provinceFilter]);

  // ===== modal thêm / sửa =====
  const [openForm, setOpenForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState(-1);

  // ===== confirm xoá =====
  const [confirm, setConfirm] = useState({ open: false, targetIdx: -1 });

  // ===== confirm đổi trạng thái =====
  const [statusConfirm, setStatusConfirm] = useState({
    open: false,
    targetIdx: -1,
    nextStatus: "",
    message: "",
  });

  // ===== lọc danh sách theo search + filter =====
  const filtered = useMemo(() => {
    const QQ = q.trim().toLowerCase();
    return gardens.filter((g) => {
      if (QQ) {
        const hit = [g.name, g.province, g.ward, g.address]
          .join(" ")
          .toLowerCase()
          .includes(QQ);
        if (!hit) return false;
      }
      if (status !== "all") {
        if (status === "active" && g.status !== "Đang hoạt động") return false;
        if (status === "stopped" && g.status !== "Dừng hoạt động") return false;
      }
      if (provinceFilter && g.province !== provinceFilter) return false;
      return true;
    });
  }, [gardens, q, status, provinceFilter]);

  // ===== stats mini =====
  const stats = useMemo(() => {
    const total = gardens.length;
    const active = gardens.filter((g) => g.status === "Đang hoạt động").length;
    const stopped = gardens.filter((g) => g.status === "Dừng hoạt động").length;
    return { total, active, stopped };
  }, [gardens]);

  // ===== phân trang từ filtered =====
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  // ===== provinces cho filter combobox =====
  const { provinces = [] } =
    (typeof useVnAdmin === "function" ? useVnAdmin() : {}) || {};

  function openAdd() {
    setEditingIdx(-1);
    setOpenForm(true);
  }
  function openEdit(i) {
    setEditingIdx(i);
    setOpenForm(true);
  }
  function handleSubmit(form) {
    if (editingIdx >= 0) {
      setGardens((gs) => {
        const prev = gs[editingIdx];
        const next = [...gs];
        next[editingIdx] = { ...prev, ...form };

        // Nếu tên đổi → phát event
        if (prev.name !== form.name) {
          window.dispatchEvent(
            new CustomEvent("mm:garden:renamed", {
              detail: { id: next[editingIdx].id, name: form.name },
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
                JSON.stringify({ id: sel.id, name: form.name })
              );
            }
          } catch {}
        }
        return next;
      });
    } else {
      setGardens((gs) => [{ ...form, id: makeId() }, ...gs]);
    }
    setOpenForm(false);
    setEditingIdx(-1);
  }

  function askDelete(i) {
    setConfirm({ open: true, targetIdx: i });
  }
  function doDelete() {
    const idx = confirm.targetIdx;
    const victim = gardens[idx];

    setGardens((gs) => gs.filter((_, i) => i !== idx));
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
    } catch {}
  }

  function askToggleStatus(i) {
    const g = gardens[i];
    if (!g) return;
    const isActive = g.status === "Đang hoạt động";
    const nextStatus = isActive ? "Dừng hoạt động" : "Đang hoạt động";
    const message = isActive
      ? `Bạn có chắc chắn muốn dừng hoạt động vườn "${g.name}"?\nCác cây trong vườn vẫn được giữ nguyên, bạn có thể khởi động lại bất cứ lúc nào.`
      : `Bạn có muốn khởi động lại vườn "${g.name}" và đánh dấu là đang hoạt động?`;

    setStatusConfirm({
      open: true,
      targetIdx: i,
      nextStatus,
      message,
    });
  }

  function doToggleStatus() {
    setGardens((gs) => {
      const idx = statusConfirm.targetIdx;
      if (idx < 0 || !gs[idx]) return gs;
      const next = [...gs];
      next[idx] = { ...next[idx], status: statusConfirm.nextStatus };
      return next;
    });
    setStatusConfirm({ open: false, targetIdx: -1, nextStatus: "", message: "" });
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
      <div className="relative min-h-screen pt-[64px] z-10">
        <main className="mx-auto max-w-[1760px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6 text-[16px] md:text-[17px]">

          <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="max-w-[820px]">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs md:text-[13px] font-medium"
                style={{ background: PALETTE.accent, color: PALETTE.bg }}
              >
                Quản lý vườn
              </span>
              <h1 className="mt-2 text-white text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
                Danh Sách Quản Lý Vườn
              </h1>
              <p className="text-white/85 mt-2 text-sm md:text-base lg:text-[17px]">
                Tạo, chỉnh sửa, lọc và tra cứu thông tin các vườn — dùng chung nguồn dữ liệu với
                UserProfile.
              </p>
            </div>

            <div className="w-full md:w-auto flex items-stretch md:items-center gap-3 md:gap-4">
              <Button
                onClick={openAdd}
                className="h-12 md:h-12 px-5 md:px-6 rounded-2xl text-base font-semibold shadow-[0_10px_28px_rgba(255,255,165,0.20)] ring-1 ring-black/5 transition-all hover:shadow-[0_14px_44px_rgba(255,255,165,0.26)] hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg,#FFFFA5 0%, #D1DFB6 100%)",
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
                  className="pl-9 bg-white/95 text-[#0f1f1e] placeholder:text-neutral-500 rounded-full h-12 text-[15px]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-12 rounded-full border bg-white px-3 text-[15px]"
                  title="Lọc trạng thái"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="stopped">Dừng hoạt động</option>
                </select>

                <select
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                  className="h-12 rounded-full border bg-white px-3 text-[15px]"
                  title="Lọc theo tỉnh/thành"
                >
                  <option value="">Tất cả tỉnh/thành</option>
                  {(provinces || []).map((p) => (
                    <option key={p.code} value={p.name}>
                      {p.full_name || p.name}
                    </option>
                  ))}
                </select>

                {q || status !== "all" || provinceFilter ? (
                  <Button
                    variant="outline"
                    className="h-12 rounded-full text-[14px]"
                    onClick={() => {
                      setQ("");
                      setStatus("all");
                      setProvinceFilter("");
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
              { label: "Đang hoạt động", value: stats.active },
              { label: "Dừng hoạt động", value: stats.stopped },
            ].map((s, i) => (
              <div
                key={i}
                className="relative rounded-xl px-5 py-3.5 flex items-center justify-between text-[14px]"
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
              const isActive = g.status === "Đang hoạt động";

              return (
                <Card
  key={g.id}
  className="group rounded-3xl overflow-hidden shadow-sm transition-all duration-200 h-full flex flex-col hover:-translate-y-0.5 hover:shadow-md cursor-pointer text-[16px]"

                  style={{
                    background: "#FFFFFFF2",
                    borderColor: "rgba(255,255,165,0.25)",
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
  {/* Khối thông tin vườn (chiếm toàn bộ chiều cao phía trên) */}
  <div className="flex flex-col gap-3 flex-1">
    {/* Tên vườn + pill trạng thái (pill nằm dưới tên) */}
    <div className="min-w-0">
      {/* Tên vườn: cho phép 2 dòng, phóng to nhẹ, tự ngắt chữ */}
      <div
        className="font-semibold text-[17px] md:text-[18px] text-[#0f1f1e] leading-snug break-words"
        title={g.name}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2, // tối đa 2 dòng
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {g.name}
      </div>

      {/* Pill trạng thái nhỏ nằm ngay dưới tên */}
      <div className="mt-2">
        <StatusPill s={g.status} />
      </div>
    </div>

    {/* Địa chỉ: icon bên trái, text max 2 dòng để dễ đọc */}
    <div className="flex items-start gap-1.5 text-[14px] text-neutral-650">
      <MapPin className="h-4 w-4 mt-[1px] flex-shrink-0 text-neutral-500" />
      <div
        className="min-w-0 leading-snug break-words"
        title={formatGardenLocation(g)}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2, // tối đa 2 dòng
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {formatGardenLocation(g) || "Chưa thiết lập địa chỉ"}
      </div>
    </div>

    {/* Số cây trong vườn: dạng chip nổi bật hơn */}
    <div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 text-[13px] font-medium">
        <TreePine className="h-3.5 w-3.5" />
        <span>{countTreesInGarden(g)} cây ăn quả</span>
      </span>
    </div>
  </div>

  {/* Thanh action dính sát đáy card */}
  <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between gap-3 flex-wrap">
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 rounded-xl px-4 text-[14px]"
        onClick={(e) => {
          e.stopPropagation();
          if (idx >= 0) openEdit(idx);
        }}
      >
        <Edit3 className="w-4 h-4 mr-1.5" />
        Sửa vườn
      </Button>

      <button
        type="button"
        className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          if (idx >= 0) askDelete(idx);
        }}
        aria-label="Xoá vườn"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>

    {/* Nút trạng thái: rõ, đậm, nổi bật hơn */}
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (idx >= 0) askToggleStatus(idx);
      }}
      className={`inline-flex items-center justify-center h-10 px-4 rounded-full text-[13px] font-semibold shadow-sm transition-transform transition-colors ${
        isActive
          ? "bg-rose-500 text-white hover:bg-rose-600 active:scale-[0.98] shadow-[0_8px_18px_rgba(244,63,94,0.28)]"
          : "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] shadow-[0_8px_18px_rgba(16,185,129,0.28)]"
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

          {filtered.length > 0 && totalPages > 1 && (
            <section className="mt-2 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/85">
              <div>
                Hiển thị{" "}
                <span className="font-semibold">
                  {startIndex + 1}-
                  {Math.min(startIndex + PAGE_SIZE, filtered.length)}
                </span>{" "}
                trên <span className="font-semibold">{filtered.length}</span> vườn
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
                        className={`min-w-[32px] h-9 rounded-full text-[13px] px-2 ${
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
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
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

        <ConfirmModal
          open={statusConfirm.open}
          title={
            statusConfirm.nextStatus === "Dừng hoạt động"
              ? "Dừng hoạt động vườn?"
              : "Khởi động lại vườn?"
          }
          onClose={() =>
            setStatusConfirm({
              open: false,
              targetIdx: -1,
              nextStatus: "",
              message: "",
            })
          }
          onConfirm={doToggleStatus}
        >
          <p className="text-sm text-neutral-700 whitespace-pre-line">
            {statusConfirm.message}
          </p>
        </ConfirmModal>
      </div>
    </>
  );
}
