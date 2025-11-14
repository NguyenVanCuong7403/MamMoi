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
import GardenRepository from "../../API/repositories/GardenRepository";

// ✅ Dùng default import (đúng với file của bạn: src/lib/useVnAdmin.js)
import useVnAdmin from "@/lib/useVnAdmin";

/* ===== Theme (khớp vibe TreeManagement) ===== */
const PALETTE = { bg: "#1F302F", leaf: "#D1DFB6", ivory: "#FBFFDF", accent: "#FFFFA5" };

/* ===== LocalStorage keys (giống UserProfile) ===== */
const LS_GARDENS = "mm_user_gardens_v3";

/* ===== Default gardens (demo) ===== */
const defaultGardens = [
];

/* ===== LocalStorage helpers ===== */
/* ===== Selected garden key ===== */
const LS_SELECTED_GARDEN = "mm_selected_garden_v1";

/* Tạo id ngắn */
function makeId() {
  return "g_" + Math.random().toString(36).slice(2, 10);
}

/* Đảm bảo mọi vườn đều có id */
function ensureIds(list) {
  let changed = false;
  const next = list.map(g => {
    if (!g.id) { changed = true; return { ...g, id: makeId() }; }
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
  if (failed) return <ImageIcon className="h-6 w-6 text-neutral-400" aria-label="no-image" />;

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
    const finalUrl = looksBlockedHost(n) ? `/api/image-proxy?u=${encodeURIComponent(n)}` : n;
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
        <Button type="button" className="rounded-2xl h-10 px-4" onClick={() => setUseLink((v) => !v)}>
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
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${
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
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <button className="rounded p-1 hover:bg-neutral-100" onClick={onClose} aria-label="Đóng">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">{children}</div>
        <div className="mt-4 flex justify-end gap-2">
          <Button className="rounded-2xl h-10 px-4 bg-white border border-neutral-300 hover:bg-neutral-100 text-slate-900" onClick={onClose}>
            Huỷ
          </Button>
          <Button className="rounded-2xl h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onConfirm}>
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ===== Garden Form Modal ===== */
function GardenFormModal({ open, initial, onClose, onSubmit }) {
  const blank = { name: "", province: "", ward: "", address: "", status: "Đang hoạt động", coverUrl: "" };

  // ✅ Hook luôn ở top-level, 1 lần/Component
  const { loading=false, error=null, provinces=[], provinceWardsMap={} } = useVnAdmin();

  const [form, setForm] = useState(initial || blank);
  const [touched, setTouched] = useState({});

  useEffect(() => { if (open) { setForm(initial || blank); setTouched({}); } }, [open, initial]);

  const errs = {
    name: !form.name.trim() ? "Tên vườn là bắt buộc" : "",
    province: !form.province.trim() ? "Nhập Tỉnh/Thành phố" : "",
    ward: !form.ward.trim() ? "Nhập Phường/Xã" : "",
    address: !form.address.trim() ? "Nhập địa chỉ chi tiết" : "",
  };
  const canSave = !errs.name && !errs.province && !errs.ward && !errs.address;

  // ✅ useMemo cũng ở top-level, không bị đặt sau early-return
  const wardOptions = useMemo(() => {
    const p = provinces.find((x) => x.name === form.province || x.full_name === form.province);
    return p ? (provinceWardsMap[p.code] || []) : [];
  }, [provinces, provinceWardsMap, form.province]);




  // 👉 early-return đặt SAU TẤT CẢ hook để không đổi thứ tự hook giữa các render
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] grid place-items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}/>
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e)=>e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">{initial ? "Chỉnh sửa vườn" : "Tạo vườn mới"}</div>
          <button className="rounded p-1 hover:bg-neutral-100" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5"/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Tên vườn</FieldLabel>
            <Input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})}
                   onBlur={()=>setTouched(t=>({...t, name:true}))}
                   className={`h-12 rounded-xl ${touched.name && errs.name ? "border-rose-500" : "border-neutral-300"}`}
                   placeholder="Ví dụ: Vườn số 1 FPT"/>
            {touched.name && errs.name ? <p className="mt-1 text-xs text-rose-600">{errs.name}</p> : null}
          </div>

          <div>
            <FieldLabel>Trạng thái</FieldLabel>
            <select value={form.status} onChange={(e)=>setForm({...form, status:e.target.value})} className="h-12 w-full rounded-xl border bg-white px-3">
              <option>Đang hoạt động</option><option>Dừng hoạt động</option>
            </select>
          </div>

          <div>
            <FieldLabel required>Tỉnh/Thành phố</FieldLabel>
            <select
              value={form.province}
              onChange={(e)=>setForm({...form, province:e.target.value, ward:""})}
              onBlur={()=>setTouched(t=>({...t, province:true}))}
              className={`h-12 w-full rounded-xl border bg-white px-3 ${touched.province && errs.province ? "border-rose-500" : "border-neutral-300"}`}
              disabled={loading && !provinces.length}
            >
              <option value="">{loading ? "Đang tải..." : "(Chọn tỉnh/thành)"}</option>
              {provinces.map((p)=> <option key={p.code} value={p.name}>{p.full_name || p.name}</option>)}
            </select>
            {error ? <p className="mt-1 text-xs text-amber-600">{String(error)}</p> : null}
            {touched.province && errs.province ? <p className="mt-1 text-xs text-rose-600">{errs.province}</p> : null}
          </div>

          <div>
            <FieldLabel required>Phường/Xã</FieldLabel>
            <select
              value={form.ward}
              onChange={(e)=>setForm({...form, ward:e.target.value})}
              onBlur={()=>setTouched(t=>({...t, ward:true}))}
              className={`h-12 w-full rounded-xl border bg-white px-3 ${touched.ward && errs.ward ? "border-rose-500" : "border-neutral-300"}`}
              disabled={!form.province || !wardOptions.length}
            >
              <option value="">{!form.province ? "— Chọn tỉnh trước —" : wardOptions.length ? "(Chọn phường/xã)" : "Không có dữ liệu phường/xã"}</option>
              {wardOptions.map((w)=> <option key={w.code} value={w.name}>{w.full_name || w.name}</option>)}
            </select>
            {touched.ward && errs.ward ? <p className="mt-1 text-xs text-rose-600">{errs.ward}</p> : null}
          </div>

          <div className="md:col-span-2">
            <FieldLabel required>Địa chỉ chi tiết</FieldLabel>
            <Input value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})}
                   onBlur={()=>setTouched(t=>({...t, address:true}))}
                   className={`h-12 rounded-xl ${touched.address && errs.address ? "border-rose-500" : "border-neutral-300"}`}
                   placeholder="Số nhà / thửa đất / mô tả lối vào..."/>
            {touched.address && errs.address ? <p className="mt-1 text-xs text-rose-600">{errs.address}</p> : null}
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Ảnh vườn</FieldLabel>
            <ImagePicker value={form.coverUrl} onChange={(v)=>setForm({...form, coverUrl:v})}/>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button className="rounded-2xl h-10 px-4 bg-white border border-neutral-300 hover:bg-neutral-100 text-slate-900" onClick={onClose}>Huỷ</Button>
          <Button className="rounded-2xl h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={!canSave} onClick={()=>canSave && onSubmit(form)}>
            {initial ? "Lưu thay đổi" : "Tạo vườn"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ===== Utils ===== */
function formatGardenLocation(g) {
  return [g.address, g.ward, g.province].filter(Boolean).join(", ");
}

/* ================================
   MAIN: GardenManagement
================================ */
export default function GardenManagement() {
  const navigate = useNavigate();

function openTrees(g) {
  // Lưu lựa chọn để TreeManagement đọc lại (reload vẫn biết)
  localStorage.setItem(
    LS_SELECTED_GARDEN,
    JSON.stringify({ id: g.id, name: g.name })
  );

  // Phát event (để nếu TreeManagement đang mở tab khác, tiêu đề nhảy ngay)
  window.dispatchEvent(
    new CustomEvent("mm:garden:selected", { detail: { id: g.id, name: g.name } })
  );

  // Điều hướng (tùy đường dẫn app bạn)
  navigate(`/tree?gardenId=${encodeURIComponent(g.id)}&gardenName=${encodeURIComponent(g.name)}`);
}

 const [gardens, setGardens] = useState(() => ensureIds(defaultGardens));

 useEffect(() => {
    async function fetchGardens() {
      try {
        const res = await GardenRepository.getGardens(1, 10);
        if (res.success && res.data?.gardens) {
          const apiGardens = res.data.gardens.map((g) => {
            let ward = "";
            let address = "";
            let province = "";

            if (g.location) {
              const parts = g.location.split(",");
              if (parts.length >= 2) {
                ward = parts[0].trim();
                province = parts.slice(1).join(",").trim();
                if(parts.length > 2) {
                  address = parts[0].trim();
                }
              } else {
                ward = g.location;
              }
            }

            return {
              name: g.name,
              province: g.location?.includes(",") ? g.location.split(",").pop().trim() : g.location || "",
              ward,
              address,
              province,
              status: g.status || "Đang hoạt động",
              coverUrl: g.coverUrl || "",
            };
          });

          setGardens(apiGardens);
        }
      } catch (error) {
        console.error("Failed to fetch gardens:", error);
      }
    }

    fetchGardens();
  }, []);


  // Search + filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | active | stopped
  const [provinceFilter, setProvinceFilter] = useState("");

  // Add/Edit modal
  const [openForm, setOpenForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState(-1);

  // Delete confirm
  const [confirm, setConfirm] = useState({ open: false, targetIdx: -1 });

  const filtered = useMemo(() => {
    const QQ = q.trim().toLowerCase();
    return gardens.filter((g) => {
      if (QQ) {
        const hit = [g.name, g.province, g.ward, g.address].join(" ").toLowerCase().includes(QQ);
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

  // Stats
  const stats = useMemo(() => {
    const total = gardens.length;
    const active = gardens.filter((g) => g.status === "Đang hoạt động").length;
    const stopped = gardens.filter((g) => g.status === "Dừng hoạt động").length;
    return { total, active, stopped };
  }, [gardens]);

  // Province list for filter
  const { provinces = [] } = (typeof useVnAdmin === "function" ? useVnAdmin() : {}) || {};

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
          const sel = JSON.parse(localStorage.getItem(LS_SELECTED_GARDEN) || "null");
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
    const sel = JSON.parse(localStorage.getItem(LS_SELECTED_GARDEN) || "null");
    if (sel && victim && sel.id === victim.id) {
      localStorage.removeItem(LS_SELECTED_GARDEN);
      window.dispatchEvent(new CustomEvent("mm:garden:deleted", { detail: { id: victim.id } }));
    }
  } catch {}
}


  return (
    <div className="relative min-h-screen pt-[64px]" style={{ background: PALETTE.bg }}>
      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6">
        {/* Header */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="max-w-[760px]">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium"
              style={{ background: PALETTE.accent, color: PALETTE.bg }}
            >
              Quản lý vườn
            </span>
            <h1 className="mt-2 text-white text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
              Garden Management
            </h1>
            <p className="text-white/85 mt-1 text-sm md:text-base">
              Tạo, chỉnh sửa, lọc và tra cứu thông tin các vườn — dùng chung nguồn dữ liệu với UserProfile.
            </p>
          </div>

          <div className="w-full md:w-auto flex items-stretch md:items-center gap-3 md:gap-4">
            <Button
              onClick={openAdd}
              className="h-12 md:h-12 px-5 md:px-6 rounded-2xl text-base font-semibold shadow-[0_10px_28px_rgba(255,255,165,0.20)] ring-1 ring-black/5 transition-all hover:shadow-[0_14px_44px_rgba(255,255,165,0.26)] hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#FFFFA5 0%, #D1DFB6 100%)", color: "#1F302F" }}
            >
              <span className="inline-flex items-center gap-3">
                <span className="grid place-items-center w-8 h-8 rounded-xl bg-white/70 backdrop-blur">
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
            style={{ background: "rgba(251,255,223,0.06)", border: "1px solid rgba(255,255,165,0.15)" }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm tên/địa chỉ/tỉnh..."
                className="pl-9 bg-white/95 text-[#0f1f1e] placeholder:text-neutral-500 rounded-full h-11"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 rounded-full border bg-white px-3 text-[15px]"
                title="Lọc trạng thái"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="stopped">Dừng hoạt động</option>
              </select>

              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="h-11 rounded-full border bg-white px-3 text-[15px]"
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
                  className="h-11 rounded-full"
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
              className="relative rounded-xl px-4 py-3 flex items-center justify-between text-[13px]"
              style={{ background: "rgba(251,255,223,0.06)", border: "1px solid rgba(255,255,165,0.15)", color: PALETTE.ivory }}
            >
              <span className="inline-flex items-center gap-2 opacity-80">{s.label}</span>
              <span className="font-semibold">{s.value}</span>
            </div>
          ))}
        </section>

        {/* Gardens grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 items-stretch">
          {filtered.map((g, i) => (
            <Card
   key={i}
   className="group rounded-3xl overflow-hidden shadow-sm transition-all duration-200 h-full flex flex-col hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
   style={{ background: "#FFFFFFF2", borderColor: "rgba(255,255,165,0.25)" }}
   role="button"
   tabIndex={0}
   onClick={() => openTrees(g)}
  onKeyDown={(e) => e.key === "Enter" && openTrees(g)}
 >
              {/* Header ảnh: luôn giữ h-40 để không lệch */}
              
              <div className="relative h-40 w-full bg-neutral-100">
                {/* Fallback (icon) */}
                <div className="absolute inset-0 grid place-items-center text-neutral-400">
                  {!g.coverUrl && <TreePine className="h-8 w-8" />}
                </div>
                {/* Ảnh (ẩn khi lỗi) */}
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
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-[#0f1f1e] truncate">{g.name}</div>
                    <div className="text-xs text-neutral-500 truncate inline-flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {formatGardenLocation(g)}
                    </div>
                  </div>
                  <StatusPill s={g.status} />
                </div>

                <div className="mt-auto pt-4">
                  <Separator />
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <Button
  variant="outline"
  className="h-9 rounded-xl"
  onClick={(e) => { e.stopPropagation(); openEdit(i); }}
>
  <Edit3 className="h-4 w-4 mr-1" /> Sửa
</Button>

<Button
  variant="outline"
  className="h-9 rounded-xl"
  onClick={(e) => { e.stopPropagation(); askDelete(i); }}
>
  <Trash2 className="h-4 w-4 mr-1" /> Xoá
</Button>


                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {filtered.length === 0 && <div className="text-center text-white/70 py-10">Không có vườn phù hợp</div>}
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
    </div>
  );
}
