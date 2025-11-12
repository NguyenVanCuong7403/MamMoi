import React, { useEffect, useMemo, useState } from "react";
import LivingBackground from "@/components/background/LivingBackground";
import { useLocation, useSearchParams } from "react-router-dom";

import {
  Calendar as CalIcon,
  Image as ImageIcon,
  MapPin,
  Link2,
  Upload,
  Info,
  CheckCircle2,
  Sprout,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
 import { computeInitialPhase, normalizePhaseBeforeSave } from "@/lib/treePhase";


/**
 * MamMoi — AddTreeNewScreen (updated phases & garden context)
 * - Update phases: ["Sinh trưởng & Phát triển","Ra hoa","Ra quả","Trước thu hoạch","Sau thu hoạch"]
 * - Remove garden selector: infer from navigation (location.state or URL params)
 * - Keep Flower/Fruit always visible; gating:
 *     - Flower editable when phase >= "Ra hoa"
 *     - Fruit  editable when phase >= "Ra quả"
 */

/* ===================== UI ZOOM (đổi nếu muốn) ===================== */
const UI_ZOOM = 1.25;
function useZoomStyle() {
  const [style, setStyle] = useState({});
  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|Edg|OPR/.test(ua);
    if (isSafari) {
      setStyle({
        transform: `scale(${UI_ZOOM})`,
        transformOrigin: "top center",
        width: `${100 / UI_ZOOM}%`,
      });
    } else {
      setStyle({ zoom: UI_ZOOM });
    }
  }, []);
  return style;
}

/* ------------------------------ Species & Varieties ------------------------------ */
const SPECIES_LIST = [
  { key: "mango", label: "Xoài" },
  { key: "grapefruit", label: "Bưởi" },
  { key: "longan", label: "Nhãn" },
  { key: "durian", label: "Sầu riêng" },
];
const VARIETIES = {
  mango: ["Cát Chu", "Cát Hòa Lộc", "Keo", "Tượng", "Xiêm"],
  grapefruit: ["Da Xanh", "Năm Roi", "Phúc Trạch", "Diễn"],
  longan: ["Nhãn lồng Hưng Yên", "Tiêu da bò", "Đường phèn", "Nhãn Thái"],
  durian: ["Ri6", "Monthong", "Musang King"],
};

/* --------------------------- Legacy Phase Dictionaries --------------------------- */
const LEGACY_PHASES = [
  "Cây non",
  "Sinh trưởng thân lá",
  "Ra hoa (dự kiến)",
  "Đậu/nuôi quả (dự kiến)",
  "Trước thu/Cho thu",
  "Sau thu/Phục hồi",
];
const BASE_PHASE_RULES = [
  { min: 0, max: 6, name: "Cây non" },
  { min: 6, max: 24, name: "Sinh trưởng thân lá" },
  { min: 24, max: 36, name: "Ra hoa (dự kiến)" },
  { min: 36, max: 60, name: "Đậu/nuôi quả (dự kiến)" },
  { min: 60, max: 9999, name: "Trước thu/Cho thu" },
];
const SPECIES_RULES = {
  mango: [
    { min: 0, max: 6, name: "Cây non" },
    { min: 6, max: 18, name: "Sinh trưởng thân lá" },
    { min: 18, max: 30, name: "Ra hoa (dự kiến)" },
    { min: 30, max: 48, name: "Đậu/nuôi quả (dự kiến)" },
    { min: 48, max: 9999, name: "Trước thu/Cho thu" },
  ],
  durian: [
    { min: 0, max: 12, name: "Cây non" },
    { min: 12, max: 36, name: "Sinh trưởng thân lá" },
    { min: 36, max: 48, name: "Ra hoa (dự kiến)" },
    { min: 48, max: 72, name: "Đậu/nuôi quả (dự kiến)" },
    { min: 72, max: 9999, name: "Trước thu/Cho thu" },
  ],
  grapefruit: [
    { min: 0, max: 6, name: "Cây non" },
    { min: 6, max: 24, name: "Sinh trưởng thân lá" },
    { min: 24, max: 36, name: "Ra hoa (dự kiến)" },
    { min: 36, max: 60, name: "Đậu/nuôi quả (dự kiến)" },
    { min: 60, max: 9999, name: "Trước thu/Cho thu" },
  ],
  longan: [
    { min: 0, max: 6, name: "Cây non" },
    { min: 6, max: 24, name: "Sinh trưởng thân lá" },
    { min: 24, max: 36, name: "Ra hoa (dự kiến)" },
    { min: 36, max: 60, name: "Đậu/nuôi quả (dự kiến)" },
    { min: 60, max: 9999, name: "Trước thu/Cho thu" },
  ],
};

/* --------------------------- 5-Phase hiển thị --------------------------- */
const PHASES5 = [
  "Sinh trưởng & Phát triển",
  "Ra hoa",
  "Ra quả",
  "Trước thu hoạch",
  "Sau thu hoạch",
];
const PHASE_ORDER = [...PHASES5];

function mapLegacyTo5(name = "") {
  const s = String(name).toLowerCase();
  if (/cây non|sinh trưởng thân lá/.test(s)) return "Sinh trưởng & Phát triển";
  if (/ra hoa/.test(s)) return "Ra hoa";
  if (/đậu|nuôi quả|quả/.test(s)) return "Ra quả";
  if (/trước thu|cho thu|thu\b/.test(s)) return "Trước thu hoạch";
  if (/sau thu|phục hồi/.test(s)) return "Sau thu hoạch";
  return "Sinh trưởng & Phát triển";
}

/* --------------------------- Heuristics --------------------------- */
const REGION_OFFSETS = {
  "Miền Bắc": +3,
  "Miền Trung": +1,
  "Miền Nam": 0,
  "Tây Nguyên": +2,
  ĐBSCL: -2,
};
const SOIL_KB = {
  mango: {
    recommend:
      "Đất đỏ bazan, đất phù sa cao ráo hoặc đất thịt nhẹ tơi xốp (thoát nước tốt)",
    options: [
      "Đất đỏ bazan",
      "Thịt nhẹ tơi xốp",
      "Đất phù sa cao ráo",
      "Đất thịt trung bình thoát nước tốt",
    ],
  },
  durian: {
    recommend: "Đất đỏ bazan sâu, giàu hữu cơ, thoát nước tốt (tránh ngập úng)",
    options: [
      "Đất đỏ bazan sâu",
      "Thịt nhẹ hữu cơ cao",
      "Đất thịt pha cát thoát nước tốt",
      "Đất phù sa cao ráo",
    ],
  },
  grapefruit: {
    recommend: "Đất phù sa hoặc đất thịt thoát nước tốt",
    options: [
      "Đất phù sa",
      "Đất thịt nhẹ",
      "Đất thịt trung bình, thoát nước tốt",
      "Thịt pha cát",
    ],
  },
  longan: {
    recommend: "Đất phù sa/đất thịt thoát nước tốt (không úng)",
    options: [
      "Đất phù sa",
      "Đất thịt thoát nước",
      "Đất cát pha (cao ráo)",
      "Đất thịt nhẹ",
    ],
  },
};
function soilAdjust(soilStr = "") {
  const s = soilStr.toLowerCase();
  let adj = 0;
  if (/(đất đỏ|bazan)/.test(s)) adj += 2;
  if (/(thịt nhẹ|tơi xốp|thoát nước tốt)/.test(s)) adj += 1;
  if (/(cát|pha cát)/.test(s)) adj -= 1;
  if (/(sét|trũng|ngập)/.test(s)) adj -= 2;
  return adj;
}
function statusAdjust(statusStr = "") {
  const s = statusStr.toLowerCase();
  if (!s.trim()) return 0;
  let adj = 0;
  if (/(sâu|bệnh|héo|lụi|thối)/.test(s)) adj -= 2;
  if (/(vàng lá|chậm|kém)/.test(s)) adj -= 1;
  return adj;
}
function normalizeSpecies(name = "") {
  const s = String(name).toLowerCase();
  if (["mango", "grapefruit", "durian", "longan"].includes(s)) return s;
  if (/xoài/.test(s)) return "mango";
  if (/bưởi/.test(s)) return "grapefruit";
  if (/sầu riêng/.test(s)) return "durian";
  if (/nhãn/.test(s)) return "longan";
  return "unknown";
}
function speciesShortVi(name = "") {
  const key = normalizeSpecies(name);
  if (key === "mango") return "xoài";
  if (key === "durian") return "sầu riêng";
  if (key === "grapefruit") return "bưởi";
  if (key === "longan") return "nhãn";
  return name || "cây này";
}
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function pickRules(speciesName) {
  const key = normalizeSpecies(speciesName);
  return SPECIES_RULES[key] || BASE_PHASE_RULES;
}
function computeLegacyPhase({ totalAge, regionTag, speciesName, soil, status }) {
  const shiftRegion = REGION_OFFSETS[regionTag] ?? 0;
  const shiftSoil = soilAdjust(soil);
  const shiftStatus = statusAdjust(status);
  const effective = clamp(totalAge + shiftRegion + shiftSoil + shiftStatus, 0, 9999);
  const rules = pickRules(speciesName);
  const rule = rules.find((r) => effective >= r.min && effective < r.max);
  return rule ? rule.name : LEGACY_PHASES[1];
}

/* ----------------------- Local image registry (LS) ----------------------- */
const hasLS =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const LS_KEY = "mammoi.tree.images";
const imageRegistry = {
  getMap() {
    if (!hasLS) return {};
    try { return JSON.parse(window.localStorage.getItem(LS_KEY) || "{}"); }
    catch { return {}; }
  },
  get(code) { const map = imageRegistry.getMap(); return map[code] || ""; },
  set(code, url) {
    if (!hasLS) return;
    const map = imageRegistry.getMap();
    map[code] = url || "";
    window.localStorage.setItem(LS_KEY, JSON.stringify(map));
  },
};

/* ------------------------------ Safe Image ------------------------------ */
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
    return /(learn-attachment\.microsoft\.com|microsoft\.com|onedrive\.live\.com|sharepoint\.com)/i.test(h);
  } catch {
    return false;
  }
}
function SafeImage({ src, alt = "", className = "" }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  const [triedRetry, setTriedRetry] = useState(false);

  useEffect(() => {
    const n = normalizeImageUrl(src || "");
    setUrl(n);
    setFailed(false);
    setTriedRetry(false);
  }, [src]);

  function onError() {
    if (triedRetry) { setFailed(true); return; }
    setTriedRetry(true);
    if (/drive\.google\.com\/uc\?/.test(url)) {
      setUrl(url.replace("export=view", "export=download"));
    } else setFailed(true);
  }

  if (!url || failed) {
    return <ImageIcon className="h-7 w-7 text-neutral-400" aria-label="no-image" />;
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

/* ------------------------------ Image Picker ----------------------------- */
function ImagePicker({ code, value, onChange }) {
  const [urlInput, setUrlInput] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  useEffect(() => {
    if (!code) return;
    const saved = imageRegistry.get(code);
    if (saved && !value) onChange(saved);
  }, [code]); // eslint-disable-line

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const objectUrl = URL.createObjectURL(f);
    onChange(objectUrl);
    if (code) imageRegistry.set(code, objectUrl);
  }

  function applyUrl() {
    const u = (urlInput || "").trim();
    if (!u) return;
    const normalized = normalizeImageUrl(u);
    const finalUrl = looksBlockedHost(normalized)
      ? `/api/image-proxy?u=${encodeURIComponent(normalized)}`
      : normalized;
    onChange(finalUrl);
    if (code) imageRegistry.set(code, finalUrl);
    setUrlInput("");
    setLinkOpen(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center justify-center gap-2 h-10 rounded-xl border bg-white/90 backdrop-blur px-3 text-sm cursor-pointer hover:bg-white">
          <Upload className="w-4 h-4" />
          <span>Chọn ảnh (tải lên)</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        <Button type="button" onClick={() => setLinkOpen((v) => !v)} className="rounded-xl">
          <Link2 className="w-4 h-4 mr-1" />
          Dùng link
        </Button>
      </div>

      {linkOpen && (
        <div className="flex gap-2">
          <Input
            placeholder="Dán link ảnh (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="rounded-xl bg-white"
          />
          <Button type="button" onClick={applyUrl} className="rounded-xl">
            Áp dụng
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setLinkOpen(false);
              setUrlInput("");
            }}
            className="rounded-xl"
          >
            Huỷ
          </Button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Header offset helper ----------------------------- */
function useHeaderOffset(selector = "[data-app-header],[data-header],header") {
  useEffect(() => {
    const el = document.querySelector(selector);
    const apply = () => {
      const h = el?.offsetHeight || 88;
      document.documentElement.style.setProperty("--mm-header-h", `${h}px`);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [selector]);
}

/* ------------------------------ Main Screen ------------------------------ */
export default function AddTreeNewScreen() {
  useHeaderOffset();
  const zoomStyle = useZoomStyle();
  const location = useLocation();
  const [search] = useSearchParams();

  // Garden context from navigation (state or URL):
  // - state.garden: { id, name, region }
  // - or ?gardenId=&gardenName=&region=
  const navGarden = location?.state?.garden || null;
  const qpGardenId = search.get("gardenId");
  const qpGardenName = search.get("gardenName");
  const qpRegion = search.get("region");

  // Fallback garden list (no backend)
  const [gardens, setGardens] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/gardens?active=1");
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setGardens(
            Array.isArray(data)
              ? data
              : [
                  { id: "g3", name: "Vườn số 3 – FPT", region: "Miền Bắc" },
                  { id: "g_hn_01", name: "Vườn Hà Nội 01", region: "Miền Bắc" },
                  { id: "g_bd_02", name: "Vườn Bình Dương 02", region: "Miền Nam" },
                ]
          );
        } else {
          setGardens([
            { id: "g3", name: "Vườn số 3 – FPT", region: "Miền Bắc" },
            { id: "g_hn_01", name: "Vườn Hà Nội 01", region: "Miền Bắc" },
            { id: "g_bd_02", name: "Vườn Bình Dương 02", region: "Miền Nam" },
          ]);
        }
      } catch {
        setGardens([
          { id: "g3", name: "Vườn số 3 – FPT", region: "Miền Bắc" },
          { id: "g_hn_01", name: "Vườn Hà Nội 01", region: "Miền Bắc" },
          { id: "g_bd_02", name: "Vườn Bình Dương 02", region: "Miền Nam" },
        ]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const currentGarden = useMemo(() => {
    if (navGarden && navGarden.id) return navGarden;
    if (qpGardenId) {
      const g = (gardens || []).find((x) => String(x.id) === String(qpGardenId));
      if (g) return g;
      return { id: qpGardenId, name: qpGardenName || "", region: qpRegion || "" };
    }
    return null;
  }, [navGarden, qpGardenId, qpGardenName, qpRegion, gardens]);

  const regionTag = currentGarden?.region || "";

  // States
  const [code, setCode] = useState("");
  const [userEditedCode, setUserEditedCode] = useState(false);
  const [speciesKey, setSpeciesKey] = useState("");
  const [variety, setVariety] = useState("");
  const [status, setStatus] = useState("");
  const [soil, setSoil] = useState("");
  const [plantDate, setPlantDate] = useState("");
  const [preAge, setPreAge] = useState("");
  const [image, setImage] = useState("");
  const [careGoal, setCareGoal] = useState("");
  const [note, setNote] = useState("");
  const [userIntent, setUserIntent] = useState("");
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [lastCreatedCode, setLastCreatedCode] = useState("");
  const [lastCreatedSpecies, setLastCreatedSpecies] = useState("");
  const [lastCreatedVariety, setLastCreatedVariety] = useState("");

  // Morphology fields
  const [branchInfo, setBranchInfo] = useState("");
  const [leafInfo, setLeafInfo] = useState("");
  const [flowerInfo, setFlowerInfo] = useState("");
  const [fruitInfo, setFruitInfo] = useState("");

  // Phase override (seed từ lib, chỉ dùng làm mặc định lúc mở form)
  const [phaseOverride, setPhaseOverride] = useState(() =>
   computeInitialPhase({}) // nếu muốn bám ngày trồng, có thể truyền { plantingDate: plantDate }
  );

  useEffect(() => { setVariety(""); setSoil(""); }, [speciesKey]);

  // Nếu chưa override tay, khi có ngày trồng thì seed lại phase theo lib (1 lần)
 useEffect(() => {
   if (!phaseOverride && plantDate) {
     const p = computeInitialPhase({ plantingDate: plantDate });
     // Nếu lib đang trả tên phase 5-bước thì giữ nguyên; nếu bạn dùng legacy, có thể map qua:
     // const p5 = mapLegacyTo5(p);
     setPhaseOverride(p);
   }
 }, [plantDate]); // eslint-disable-line

  const ageAfterPlant = useMemo(() => monthsBetween(plantDate), [plantDate]);
  const preAgeNum = useMemo(() => parseInt(preAge || "0", 10) || 0, [preAge]);
  const totalAge = (plantDate ? ageAfterPlant : 0) + preAgeNum;
  const soilKB = useMemo(() => SOIL_KB[speciesKey], [speciesKey]);
  const speciesLabel = useMemo(
    () => SPECIES_LIST.find((s) => s.key === speciesKey)?.label || "",
    [speciesKey]
  );

  // Legacy compute then map to 5-phase
  const legacyPhase = useMemo(
    () => computeLegacyPhase({ totalAge, regionTag, speciesName: speciesKey, soil, status }),
    [totalAge, regionTag, speciesKey, soil, status]
  );
  const defaultPhase5 = useMemo(() => mapLegacyTo5(legacyPhase), [legacyPhase]);
  const effectivePhase = phaseOverride || defaultPhase5;

  // Can edit flower / fruit separately
  const canEditFlower = useMemo(() => {
    const idx = PHASE_ORDER.indexOf(effectivePhase);
    const gateFlower = PHASE_ORDER.indexOf("Ra hoa");
    return idx >= gateFlower && gateFlower !== -1;
  }, [effectivePhase]);
  const canEditFruit = useMemo(() => {
    const idx = PHASE_ORDER.indexOf(effectivePhase);
    const gateFruit = PHASE_ORDER.indexOf("Ra quả");
    return idx >= gateFruit && gateFruit !== -1;
  }, [effectivePhase]);

  // Auto mã cây
  useEffect(() => {
    if (!speciesKey || !variety) return;
    if (userEditedCode) return;

    const s1 = firstLetterVi(speciesLabel || speciesKey);
    const v1 = firstLetterVi(variety);
    if (!s1 || !v1) return;

    const prefix = `${s1}${v1}-`;
    (async () => {
      let next = 1;
      try {
        const res = await fetch(`/api/trees/count?prefix=${encodeURIComponent(prefix)}`);
        if (res.ok) {
          const data = await res.json();
          next = Number(data?.count || 0) + 1;
        }
      } catch { next = 1; }
      const suggested = `${prefix}${String(next).padStart(2, "0")}`;
      setCode(suggested);
      setErrors((x) => ({ ...x, code: undefined }));
    })();
  }, [speciesKey, variety, speciesLabel, userEditedCode]);

  // Validate submit (remove gardenId requirement)
  const REQUIRED_MSG = {
    code: "Vui lòng nhập mã cây (tự gợi ý sau khi chọn Loại + Giống).",
    speciesKey: "Chọn loại cây",
    variety: "Chọn giống",
    plantDate: "Chọn ngày trồng",
    soil: "Chọn loại đất",
  };
  function validateBasic() {
    const e = {};
    if (!String(code).trim()) e.code = REQUIRED_MSG.code;
    if (!speciesKey) e.speciesKey = REQUIRED_MSG.speciesKey;
    if (!variety) e.variety = REQUIRED_MSG.variety;
    if (!plantDate) e.plantDate = REQUIRED_MSG.plantDate;
    if (!soil) e.soil = REQUIRED_MSG.soil;
    return e;
  }

  function resetAll() {
    setCode(""); setUserEditedCode(false);
    setSpeciesKey(""); setVariety(""); setStatus(""); setSoil("");
    setPlantDate(""); setPreAge("");
    setImage(""); setCareGoal(""); setNote(""); setUserIntent("");
    setErrors({});
    setBranchInfo(""); setLeafInfo(""); setFlowerInfo(""); setFruitInfo("");
    setPhaseOverride("");
  }

  function handleCreate() {
    const e = validateBasic();
    if (Object.keys(e).length) { setErrors(e); return; }

    const base = {
      code, speciesKey, speciesLabel, variety, status, soil,
      gardenId: currentGarden?.id || null,
      gardenName: currentGarden?.name || "",
      region: regionTag || "",
      plantDate, preAge: preAgeNum,
      legacyPhase, phase5Default: defaultPhase5, phaseOverride: phaseOverride || null,
      phase: effectivePhase,
      image, careGoal, note, userIntent,
      ageMonths: totalAge,
      branchInfo, leafInfo,
      flowerInfo: canEditFlower ? flowerInfo : "",
      fruitInfo:  canEditFruit ? fruitInfo  : "",
    };
    // DÙNG CHUNG: chuẩn hóa trước khi lưu
   const payload = normalizePhaseBeforeSave(base);
   console.log("Create Tree Payload", payload);
   // await api.trees.create(payload); // khi nối backend, gọi API ở đây

    setLastCreatedCode(code);
    setLastCreatedSpecies(speciesLabel);
    setLastCreatedVariety(variety);
    setShowSuccess(true);
    setSuccessOpen(true);
    resetAll();
    setTimeout(() => setShowSuccess(false), 2200);
  }

  const successName = [lastCreatedSpecies, lastCreatedVariety].filter(Boolean).join(" ");

  /* ---------------- Progress (động theo gate Hoa / Quả) ---------------- */
  const progressChecks = useMemo(() => {
    const base = {
      code: !!code.trim(),
      speciesKey: !!speciesKey,
      variety: !!variety,
      preAge: preAge !== "",
      plantDate: !!plantDate,
      leafInfo: !!leafInfo.trim(),
      branchInfo: !!branchInfo.trim(),
      soil: !!soil,
      phase: !!(phaseOverride || defaultPhase5),
    };
    if (canEditFlower) base.flowerInfo = !!flowerInfo.trim();
    if (canEditFruit) base.fruitInfo = !!fruitInfo.trim();
    return base;
  }, [
    code, speciesKey, variety, preAge, plantDate, leafInfo, branchInfo, soil,
    phaseOverride, defaultPhase5, canEditFlower, canEditFruit, flowerInfo, fruitInfo
  ]);

  const doneCount = Object.values(progressChecks).filter(Boolean).length;
  const totalCount = Object.keys(progressChecks).length;
  const progress = Math.round((doneCount / Math.max(1, totalCount)) * 100);

  const infoDone = doneCount >= totalCount;
  const previewDone = Boolean(image);
  const noteDone = Boolean(userIntent);

  /* ------------------------------ UI ------------------------------ */
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#1F302F", paddingTop: "calc(var(--mm-header-h, 88px) + 12px)" }}
    >
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LivingBackground
          theme="aurora"
          baseColor="#1F302F"
          accents={["#10b981", "#38bdf8", "#facc15"]}
          density={40}
          grain={0.06}
          blur={14}
          speed={28}
        />
      </div>

      {/* ZOOM WRAPPER */}
      <div style={zoomStyle}>
        {/* Header */}
        <section className="relative">
          <div className="mx-auto max-w-[1760px] 2xl:max-w-[1920px] px-6 lg:px-10 pb-3">
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                  Thêm cây mới
                </h1>
                <p className="text-emerald-100/80 text-sm mt-1">
                  Tạo cây với các thông tin chi tiết giúp AI đưa ra gợi ý chăm sóc tốt nhất cho bạn.
                </p>
                {currentGarden ? (
                  <div className="mt-2 inline-flex items-center gap-2 text-emerald-100/80 text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      Trong vườn: <b>{currentGarden.name}</b>{regionTag ? ` — ${regionTag}` : ""}
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-emerald-100/60 text-xs">
                   
                  </div>
                )}
              </div>

              {/* Progress mini-stepper */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-5">
                  <StepDot label="Thông tin" active={!infoDone} done={infoDone} />
                  <StepDot label="Ảnh & Preview" active={infoDone && !previewDone} done={previewDone} />
                  <StepDot label="Ghi chú" active={true} done={noteDone} />
                </div>
                <div className="w-[360px] h-2 rounded-full bg-white/10 overflow-hidden ring-1 ring-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-sky-400 transition-all duration-500"
                    style={{ width: `${Math.max(8, progress)}%` }}
                  />
                </div>
                <div className="text-emerald-100/80 text-xs">{progress}% hoàn thành</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main */}
        <main className="mx-auto max-w-[1760px] 2xl:max-w-[1920px] px-6 lg:px-10 py-6 space-y-6">
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* LEFT – form */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-xl ring-1 ring-black/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <span className="inline-grid place-items-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                      <Sprout className="w-4 h-4" />
                    </span>
                    Thông tin cơ bản
                  </CardTitle>
                </CardHeader>

                {/* Balanced grid: 12 cols */}
                <CardContent className="grid grid-cols-12 gap-5 text-sm">
                  {/* 1. Mã cây */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 grid gap-1">
                    <Label htmlFor="code" className="text-neutral-700">Mã cây</Label>
                    <div className="relative">
                      <Input
                        id="code"
                        value={code}
                        placeholder="Mã cây duy nhất (VD: BD-03)."
                        onChange={(e) => {
                          setCode(e.target.value);
                          setUserEditedCode(true);
                          setErrors((x) => ({ ...x, code: undefined }));
                        }}
                        className={`rounded-xl h-11 w-full bg-white border-neutral-300 placeholder:text-neutral-400 pr-10
                          focus:ring-emerald-500/40 focus:border-emerald-500
                          ${errors.code ? "border-red-500 focus:border-red-500 focus:ring-red-500/40" : ""}`}
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Auto
                      </span>
                    </div>
                    {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                  </div>

                  {/* 2. Loại cây */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 grid gap-1">
                    <Label className="text-neutral-700">Loại cây</Label>
                    <select
                      value={speciesKey}
                      onChange={(e) => {
                        setSpeciesKey(e.target.value);
                        setErrors((x) => ({ ...x, speciesKey: undefined }));
                      }}
                      className={`h-11 rounded-xl border bg-white px-3 text-sm appearance-none
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                        ${errors.speciesKey ? "border-red-500 focus:border-red-500 focus:ring-red-500/40" : "border-neutral-300"}`}
                    >
                      <option value="">— Chọn loại cây —</option>
                      {SPECIES_LIST.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                    {errors.speciesKey && <p className="text-xs text-red-500 mt-1">{errors.speciesKey}</p>}
                  </div>

                  {/* 3. Giống */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 grid gap-1">
                    <Label className="text-neutral-700">Giống</Label>
                    <select
                      value={variety}
                      onChange={(e) => {
                        setVariety(e.target.value);
                        setErrors((x) => ({ ...x, variety: undefined }));
                      }}
                      disabled={!speciesKey}
                      className={`h-11 rounded-xl border bg-white px-3 text-sm appearance-none
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                        ${errors.variety ? "border-red-500 focus:border-red-500 focus:ring-red-500/40" : "border-neutral-300"}
                        ${!speciesKey ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <option value="">{speciesKey ? "— Chọn giống —" : "Chọn loại cây trước"}</option>
                      {speciesKey && (VARIETIES[speciesKey] || []).map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    {errors.variety && <p className="text-xs text-red-500 mt-1">{errors.variety}</p>}
                  </div>

                  {/* 4. Tuổi trước khi trồng */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 grid gap-1">
                    <Label className="text-neutral-700">Tuổi trước khi trồng (tháng)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        value={preAge}
                        onChange={(e) => setPreAge(e.target.value)}
                        className="rounded-xl h-11 pr-12 w-full bg-white border-neutral-300 focus:ring-emerald-500/40 focus:border-emerald-500"
                      />
                      <span className="absolute right-3 top-2.5 text-sm text-neutral-600">tháng</span>
                    </div>
                  </div>

                  {/* 5. Ngày trồng */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 grid gap-1">
                    <Label className="text-neutral-700">Ngày trồng</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={plantDate}
                        onChange={(e) => {
                          setPlantDate(e.target.value);
                          setErrors((x) => ({ ...x, plantDate: undefined }));
                        }}
                        className={`rounded-xl h-11 bg-white
                          ${errors.plantDate ? "border-red-500 focus:border-red-500 focus:ring-red-500/40" : "border-neutral-300"}
                          focus:ring-emerald-500/40 focus:border-emerald-500`}
                      />
                      <CalIcon className="w-4 h-4 absolute right-3 top-3 text-neutral-500" />
                    </div>
                    {errors.plantDate && <p className="text-xs text-red-500 mt-1">{errors.plantDate}</p>}
                  </div>

                  {/* 6. Mô tả tình trạng lá */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 grid gap-1">
                    <Label className="text-neutral-700">Mô tả tình trạng lá</Label>
                    <Input
                      value={leafInfo}
                      onChange={(e) => setLeafInfo(e.target.value)}
                      placeholder="VD: lá xanh tốt, vàng nhẹ, sâu…"
                      className="rounded-xl h-11 bg-white border-neutral-300 placeholder:text-neutral-400 focus:ring-emerald-500/40 focus:border-emerald-500"
                    />
                  </div>

                  {/* 7. Mô tả tình trạng cành */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 grid gap-1">
                    <Label className="text-neutral-700">Mô tả tình trạng cành</Label>
                    <Input
                      value={branchInfo}
                      onChange={(e) => setBranchInfo(e.target.value)}
                      placeholder="Tình trạng cành, ..."
                      className="rounded-xl h-11 bg-white border-neutral-300 placeholder:text-neutral-400 focus:ring-emerald-500/40 focus:border-emerald-500"
                    />
                  </div>

                  {/* 8. Loại đất */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 grid gap-1">
                    <Label className="text-neutral-700">Loại đất</Label>
                    <select
                      value={soil}
                      onChange={(e) => {
                        setSoil(e.target.value);
                        setErrors((x) => ({ ...x, soil: undefined }));
                      }}
                      disabled={!speciesKey}
                      className={`h-11 rounded-xl border bg-white px-3 text-sm appearance-none
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                        ${errors.soil ? "border-red-500 focus:border-red-500 focus:ring-red-500/40" : "border-neutral-300"}
                        ${!speciesKey ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <option value="">{speciesKey ? "— Chọn loại đất —" : "Chọn loại cây trước"}</option>
                      {speciesKey && (soilKB?.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {errors.soil && <p className="text-xs text-red-500 mt-1">{errors.soil}</p>}
                  </div>

                  {/* 9. Giai đoạn */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 grid gap-1">
                    <Label className="text-neutral-700">Giai đoạn</Label>
                    <select
                      value={phaseOverride || defaultPhase5}
                      onChange={(e) => setPhaseOverride(e.target.value)}
                      className="h-11 rounded-xl border bg-white px-3 text-sm appearance-none border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    >
                      {PHASES5.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* 10. Mô tả tình trạng hoa (always visible, gated) */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 grid gap-1">
                    <Label className="text-neutral-700">Mô tả tình trạng hoa</Label>
                    <Input
                      value={flowerInfo}
                      onChange={(e) => setFlowerInfo(e.target.value)}
                      disabled={!canEditFlower}
                      placeholder="Mô tả tình trạng, tỉ lệ ra hoa, ..."
                      className={`rounded-xl h-11 bg-white placeholder:text-neutral-400 focus:ring-emerald-500/40 focus:border-emerald-500
                        border-neutral-300 ${!canEditFlower ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                  </div>

                  {/* 11. Mô tả tình trạng quả (always visible, gated) */}
                  <div className="col-span-12 md:col-span-6 xl:col-span-3 grid gap-1">
                    <Label className="text-neutral-700">Mô tả tình trạng quả</Label>
                    <Input
                      value={fruitInfo}
                      onChange={(e) => setFruitInfo(e.target.value)}
                      disabled={!canEditFruit}
                      placeholder="Số lượng, kích thước, tình trạng, ..."
                      className={`rounded-xl h-11 bg-white placeholder:text-neutral-400 focus:ring-emerald-500/40 focus:border-emerald-500
                        border-neutral-300 ${!canEditFruit ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                  </div>

                  {/* NOTE cuối card */}
                  <div className="col-span-12">
                    <div className="mt-1 pt-3 border-t text-xs text-neutral-600 italic">
                      Các trường thông tin mô tả không điền sẽ mặc định là bình thường.
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hướng dẫn */}
              <Card className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-xl ring-1 ring-black/5">
                <CardHeader className="pb-3"><CardTitle>Hướng dẫn điền & sử dụng</CardTitle></CardHeader>
                <CardContent className="text-sm text-neutral-700">
                  <ol className="list-decimal ml-5 space-y-1">
                    <li><b>Mã cây</b> tự gợi ý sau khi chọn <b>Loại</b> & <b>Giống</b>; có thể chỉnh tay.</li>
                    <li>Nhập <b>Tuổi trước khi trồng</b> (tháng) và <b>Ngày trồng</b> để ước tính tuổi tổng.</li>
                    <li><b>Mô tả lá/cành</b> giúp AI hiểu cây; nếu bỏ trống, hệ thống hiểu là <i>bình thường</i>.</li>
                    <li><b>Giai đoạn</b>: <b>Hoa</b> cho nhập từ <b>Ra hoa</b>; <b>Quả</b> cho nhập từ <b>Ra quả</b>.</li>
                    <li>Nếu đi từ trang danh sách vườn → danh sách cây → tạo cây, màn này sẽ tự nhận <b>Vườn</b>.</li>
                  </ol>
                </CardContent>
              </Card>

              {/* Ghi chú bổ sung cho AI */}
              <Card className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-xl ring-1 ring-black/5">
                <CardHeader className="pb-3"><CardTitle>Ghi chú bổ sung cho AI</CardTitle></CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-1">
                    <Label className="text-neutral-700">Ghi chú bổ sung</Label>
                    <Textarea
                      value={userIntent}
                      onChange={(e) => setUserIntent(e.target.value)}
                      placeholder="Nguồn giống, lịch tưới/bón, mục tiêu, vấn đề đang gặp…"
                      className="rounded-xl bg-white border-neutral-300 placeholder:text-neutral-400 focus:ring-emerald-500/40 focus:border-emerald-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action bar dính */}
              <div className="sticky bottom-4 z-30">
                <div className="flex justify-end gap-3">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                    onClick={handleCreate}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Tạo cây
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetAll}
                    className="rounded-xl bg-white text-slate-900 border border-neutral-300 hover:bg-neutral-100"
                  >
                    Xóa nội dung
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT – preview */}
            <div
              className="lg:col-span-4 space-y-6 lg:sticky"
              style={{ top: "calc(var(--mm-header-h, 88px) + 8px)" }}
            >
              <Card className="rounded-2xl overflow-hidden bg-white/90 backdrop-blur border border-white/60 shadow-xl ring-1 ring-black/5">
                <CardHeader className="pb-3"><CardTitle>Ảnh & Preview</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <ImagePicker code={code} value={image} onChange={setImage} />
                  <div className="rounded-xl border bg-white overflow-hidden ring-1 ring-black/5">
                    <div className="h-52 w-full bg-neutral-100 grid place-items-center">
                      {image && image.trim() ? (
                        <SafeImage src={image} alt="tree" className="w-full h-52 object-cover" />
                      ) : (
                        <ImageIcon className="h-7 w-7 text-neutral-400" />
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{speciesLabel || "Chưa đặt tên"}</div>
                        <Badge className="rounded-full bg-emerald-600 text-white border-emerald-600 shadow">
                          {effectivePhase}
                        </Badge>
                      </div>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-2 text-xs mt-1">
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                          <span>Tổng tuổi:</span>
                          <span className="ml-1 font-semibold">{totalAge}</span>
                          <span className="ml-1">tháng</span>
                        </span>
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5">
                          <CalIcon className="w-3.5 h-3.5 mr-1" />
                          <span>Sau trồng:&nbsp;{plantDate ? ageAfterPlant : 0}m</span>
                        </span>
                        {regionTag ? (
                          <span className="inline-flex items-center rounded-full border px-2 py-0.5">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            <span>{regionTag}</span>
                          </span>
                        ) : null}
                      </div>

                      <div className="text-xs text-neutral-600">#{code || "—"}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <Field label="Tuổi" value={`${totalAge} tháng`} />
                        <Field label="Vườn" value={currentGarden?.name || "—"} />
                        <Field label="Giống" value={variety || "—"} />
                        {branchInfo ? <Field label="Cành" value={branchInfo} /> : null}
                        {leafInfo ? <Field label="Lá" value={leafInfo} /> : null}
                        {canEditFlower && flowerInfo ? <Field label="Hoa" value={flowerInfo} /> : null}
                        {canEditFruit && fruitInfo ? <Field label="Quả" value={fruitInfo} /> : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lưu ý nhập liệu */}
              <Card className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-xl ring-1 ring-black/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Lưu ý khi nhập liệu
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-700">
                  <ul className="list-disc ml-5 space-y-1">
                    <li><b>Mã cây</b> là duy nhất; tự gợi ý theo <b>Loại</b> + <b>Giống</b> nhưng vẫn có thể chỉnh tay.</li>
                    <li>Dropdown <b>không cho gõ text</b> — hãy chọn trong danh sách.</li>
                    <li><b>Giai đoạn</b> quyết định khả năng nhập <b>Hoa</b>/<b>Quả</b> (xem mô tả ở thẻ hướng dẫn).</li>
                    <li><b>Ngày trồng</b> dùng để ước tính tuổi & giai đoạn.</li>
                    <li>Nếu chưa thấy tên vườn, hãy điều hướng từ màn danh sách vườn → cây → tạo cây.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Success Toast (góc phải) */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg transition-all duration-300">
            <div className="relative">
              <span className="absolute inline-flex h-8 w-8 rounded-full bg-emerald-400/30 animate-ping" />
              <div className="relative grid h-8 w-8 place-items-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div>
              <div className="font-semibold text-emerald-700">Thêm cây thành công!</div>
              <div className="text-xs text-neutral-500">
                {successName ? (
                  <>
                    Cây <b>{successName}</b> — mã <b>{lastCreatedCode || "—"}</b>
                  </>
                ) : (
                  <>
                    Mã <b>{lastCreatedCode || "—"}</b>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Overlay giữa màn hình */}
      {successOpen && (
        <>
          <style>{`
            @keyframes mm-pop{0%{transform:scale(.7);opacity:0}60%{transform:scale(1.05);opacity:1}100%{transform:scale(1)}}
            @keyframes mm-confetti{0%{transform:translateY(-16px) rotate(0)}100%{transform:translateY(18px) rotate(360deg)}}
          `}</style>
          <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-[500px] max-w-[92vw] rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5 animate-[mm-pop_.45s_cubic-bezier(.2,.9,.25,1)_both]">
              <div className="mx-auto mb-6 relative w-32 h-32 grid place-items-center">
                <div className="absolute -inset-4 rounded-full bg-emerald-300/30 blur-xl" />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-300 animate-ping" />
                <div className="rounded-full w-32 h-32 bg-emerald-100 grid place-items-center ring-1 ring-emerald-200">
                  <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-emerald-700">Thêm cây thành công</div>
                <div className="mt-1 text-sm text-neutral-600">
                  Bạn đã thêm thành công cây <b>{successName || "—"}</b> — mã cây <b>{lastCreatedCode || "—"}</b>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Button onClick={() => setSuccessOpen(false)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                  Đóng
                </Button>
              </div>

              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {[
                  ["10%","12%","0s","bg-emerald-500"],["18%","78%","0.1s","bg-yellow-400"],
                  ["28%","8%","0.2s","bg-sky-400"],["30%","90%","0.15s","bg-rose-400"],
                  ["-6%","45%","0.05s","bg-violet-500"],["-4%","65%","0.25s","bg-emerald-500"],
                  ["22%","30%","0.18s","bg-yellow-400"],["14%","60%","0.28s","bg-sky-400"],
                  ["6%","38%","0.33s","bg-rose-400"],["-8%","20%","0.4s","bg-violet-500"],
                  ["24%","50%","0.12s","bg-emerald-500"],["-10%","72%","0.22s","bg-sky-400"],
                ].map((p,i)=>(
                  <span key={i}
                    className={`absolute w-2 h-3 ${p[3]} rounded-[2px]`}
                    style={{ top:p[0], left:p[1], animation:"mm-confetti 1.2s ease-in-out infinite", animationDelay:p[2] }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------- Helpers ------------------------------- */
function StepDot({ active, done, label }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={
          "relative grid place-items-center w-7 h-7 rounded-full border " +
          (done
            ? "bg-emerald-600 border-emerald-600 text-white"
            : active
            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
            : "bg-white/70 border-white/60 text-neutral-500")
        }
      >
        <Sprout className={"w-4 h-4 " + (done ? "opacity-100" : "opacity-70")} />
        {active && (
          <span className="absolute -z-10 inline-flex h-7 w-7 rounded-full bg-emerald-400/30 animate-ping" />
        )}
      </div>
      <span
        className={
          "text-sm " + (done ? "text-white" : active ? "text-emerald-100" : "text-emerald-200")
        }
      >
        {label}
      </span>
    </div>
  );
}
function monthsBetween(aStr, b = new Date()) {
  if (!aStr) return 0;
  const a = new Date(aStr + "T00:00:00");
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
}
function firstLetterVi(s = "") {
  if (!s.trim()) return "";
  const ch = s.trim()[0];
  return ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}
function Field({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-2">
      <div className="text-neutral-500 text-xs sm:w-28">{label}</div>
      <div className="text-neutral-900 text-sm font-medium break-words">{value}</div>
    </div>
  );
}
