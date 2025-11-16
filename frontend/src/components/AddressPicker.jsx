import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useVnAdmin, normalize as vnNormalize } from "@/lib/useVnAdmin";
const MAX_ADDRESS_LEN = 60;

/* ===== helpers ===== */
const norm = (s) => vnNormalize(String(s || ""));
const labelOf = (x) =>
  typeof x === "string"
    ? x
    : (x?.full_name || x?.name || x?.label || x?.text || "");
const codeOf = (x) =>
  typeof x === "string" ? "" : String(x?.code || x?.value || x?.id || "");

/* bỏ tiền tố để so khớp "nhìn giống nhau" */
const stripPrefixes = (s) =>
  s
    .replace(
      /\b(tinh|tỉnh|thanh pho|thành phố|tp|tp\.?|xa|xã|phuong|phường|thi tran|thị trấn)\b/gi,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

const samePlace = (a, b) => {
  const A = norm(a),
    B = norm(b);
  if (!A || !B) return false;
  if (A === B) return true;
  const A2 = stripPrefixes(A),
    B2 = stripPrefixes(B);
  return A2 && B2 && A2 === B2;
};

/* sort provinces: Hà Nội & TP.HCM lên đầu, sau đó
   - Nhóm Thành phố trước
   - Nhóm Tỉnh sau
   - Trong nhóm: theo ABC bỏ tiền tố */
function sortProvinces(provinces = []) {
  const items = [...provinces];
  const meta = items.map((p) => {
    const label = p.full_name || p.name || "";
    const lNorm = norm(label).toLowerCase();
    const plain = stripPrefixes(label).toLowerCase();
    const isHN = /ha noi/.test(lNorm);
    const isHCM = /(ho chi minh|sai gon)/.test(lNorm);
    const isCity = /(thanh pho|thành phố|tp\b|tp\.)/.test(lNorm);
    return { p, isHN, isHCM, isCity, plain };
  });

  meta.sort((a, b) => {
    if (a.isHN !== b.isHN) return a.isHN ? -1 : 1;
    if (a.isHCM !== b.isHCM) return a.isHCM ? -1 : 1;
    if (a.isCity !== b.isCity) return a.isCity ? -1 : 1;
    if (a.plain < b.plain) return -1;
    if (a.plain > b.plain) return 1;
    return 0;
  });

  return meta.map((m) => m.p);
}

/* sort wards: Phường trước, rồi Xã, còn lại sau.
   Trong mỗi nhóm: theo ABC bỏ tiền tố */
function sortWards(wards = []) {
  const items = [...wards];
  const meta = items.map((w) => {
    const label = w.full_name || w.name || "";
    const lNorm = norm(label).toLowerCase();
    const plain = stripPrefixes(label).toLowerCase();
    const isWard = /\b(phuong|phường)\b/.test(lNorm);
    const isCommune = /\b(xa|xã)\b/.test(lNorm);
    let group = 2; // others
    if (isWard) group = 0;
    else if (isCommune) group = 1;
    return { w, group, plain };
  });

  meta.sort((a, b) => {
    if (a.group !== b.group) return a.group - b.group;
    if (a.plain < b.plain) return -1;
    if (a.plain > b.plain) return 1;
    return 0;
  });

  return meta.map((m) => m.w);
}

/* filter với limit để dropdown không quá nặng */
function filterList(list, keyword, limit = 200) {
  const k = norm(keyword);
  if (!k) return list.slice(0, limit);
  const filtered = list.filter((it) => {
    const L = norm(it.full_name || it.name);
    if (!L) return false;
    return L.includes(k) || stripPrefixes(L).includes(k);
  });
  return filtered.slice(0, limit);
}

function FieldLabel({ children, required }) {
  return (
    <div className="mb-1 text-sm text-neutral-600">
      {children}
      {required ? <span className="text-rose-600"> *</span> : null}
    </div>
  );
}

function SuggestList({ items = [], activeLabel = "", onPick }) {
  if (!items.length)
    return (
      <div className="absolute z-[1600] left-0 right-0 mt-1 rounded-xl border bg-white p-2 text-sm text-neutral-500 shadow">
        Không tìm thấy
      </div>
    );
  return (
    <div className="absolute z-[1600] left-0 right-0 mt-1 max-h-64 overflow-auto rounded-xl border bg-white p-1 shadow-xl">
      {items.map((it) => {
        const lbl = it.full_name || it.name;
        const active = lbl === activeLabel;
        return (
          <button
            type="button"
            key={String(it.code || lbl)}
            className={
              "w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-neutral-50 " +
              (active ? "bg-emerald-50 text-emerald-700" : "text-neutral-800")
            }
            onMouseDown={(e) => e.preventDefault()} // tránh blur trước khi click
            onClick={() => onPick?.(it)}
            title={lbl}
          >
            {lbl}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   AddressPicker
========================================================= */
export default function AddressPicker({
  value = {}, // { province, ward, address }
  onChange,
  lockToSuggestion = true,
  required = true,

  invalidProvince = false,
  invalidWard = false,
  invalidAddress = false,

  inputClassOk = "h-11 w-full rounded-xl bg-white border border-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500",
  inputClassErr = "h-11 w-full rounded-xl bg-white border border-rose-500 placeholder:text-neutral-400 focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500",
  placeholders = {
    province: "VD: Hà Nội",
    ward: "VD: Dịch Vọng / Thạch Hoà…",
    address: "Số nhà / Đường / Khu",
  },
}) {
  const { loading, provinces, provinceWardsMap, allWards } = useVnAdmin();

  // local text state
  const [q, setQ] = useState({
    province: labelOf(value.province),
    ward: labelOf(value.ward),
    address: value.address || "",
  });
  const [open, setOpen] = useState({ province: false, ward: false });
  const [hasTyped, setHasTyped] = useState({ province: false, ward: false });

  // ⚠ Dùng ref thay vì state để tránh delay khi blur
  const justPickedRef = useRef({ province: false, ward: false });

  const wrapRef = useRef(null);
  const provinceRef = useRef(null);
  const wardRef = useRef(null);

  // sync khi value bên ngoài đổi
  useEffect(() => {
    setQ({
      province: labelOf(value.province),
      ward: labelOf(value.ward),
      address: value.address || "",
    });
  }, [value.province, value.ward, value.address]);

  // province đang chọn
  const selectedProvince = useMemo(() => {
    const c = codeOf(value.province);
    if (c && Array.isArray(provinces)) {
      return provinces.find((p) => String(p.code) === c) || null;
    }
    const l = labelOf(value.province);
    if (!l || !Array.isArray(provinces)) return null;
    return (
      provinces.find(
        (p) =>
          samePlace(p.full_name || p.name, l) || samePlace(p.name || "", l)
      ) || null
    );
  }, [provinces, value.province]);

  // nguồn phường/xã
  const wardSourceRaw = useMemo(() => {
    if (selectedProvince && provinceWardsMap) {
      return provinceWardsMap[String(selectedProvince.code)] || [];
    }
    return allWards || [];
  }, [selectedProvince, provinceWardsMap, allWards]);

  const provinceOptions = useMemo(
    () => sortProvinces(Array.isArray(provinces) ? provinces : []),
    [provinces]
  );
  const wardOptions = useMemo(
    () => sortWards(Array.isArray(wardSourceRaw) ? wardSourceRaw : []),
    [wardSourceRaw]
  );

  const provinceSuggestions = useMemo(
    () => filterList(provinceOptions, q.province, 80),
    [provinceOptions, q.province]
  );
  const wardSuggestions = useMemo(
    () => filterList(wardOptions, q.ward, 220),
    [wardOptions, q.ward]
  );

  // chọn từ gợi ý
  function pick(level, item, { focusOut = false } = {}) {
    const lbl = item.full_name || item.name || "";

    setQ((s) => {
      const next = { ...s };
      if (level === "province") {
        next.province = lbl;
        next.ward = ""; // đổi tỉnh → reset phường/xã
      } else if (level === "ward") {
        next.ward = lbl;
      }
      return next;
    });

    setOpen((o) => ({ ...o, [level]: false }));
    setHasTyped((t) => ({ ...t, [level]: false }));

    if (level === "province") {
      onChange?.({ province: item, ward: null });
    } else if (level === "ward") {
      onChange?.({ ward: item });
    }

    if (focusOut) {
      // đánh dấu blur này là do pick → onBlur bỏ qua, không rollback
      justPickedRef.current[level] = true;
      const ref = level === "province" ? provinceRef : wardRef;
      if (ref.current) {
        ref.current.blur();
      }
    }
  }

  // "buoi" -> "Bưởi" (Enter / blur)
  function commitFromText(level, { focusOut = false } = {}) {
    const txt = (q[level] || "").trim();
    const list = level === "province" ? provinceOptions : wardOptions;

    if (!txt) {
      if (level === "province") {
        onChange?.({ province: null, ward: null });
      } else if (level === "ward") {
        onChange?.({ ward: null });
      }
      return;
    }

    const k = norm(txt);
    const exact = list.find(
      (it) => norm(it.full_name || it.name) === k
    );
    const partial =
      exact ||
      list.find((it) => {
        const L = norm(it.full_name || it.name);
        return L.includes(k) || stripPrefixes(L).includes(k);
      });

    if (partial) {
      pick(level, partial, { focusOut });
      return;
    }

    if (lockToSuggestion) {
      // không khớp gì → trả về label hiện tại
      setQ((s) => ({
        ...s,
        [level]: labelOf(value[level]),
      }));
    }
  }

  function handleKeyDown(e, level) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      commitFromText(level, { focusOut: true });
    }
  }

  function handleBlur(level) {
    setOpen((o) => ({ ...o, [level]: false }));
    setHasTyped((t) => ({ ...t, [level]: false }));

    // Nếu blur ngay sau khi vừa pick trong dropdown → KHÔNG rollback
    if (justPickedRef.current[level]) {
      justPickedRef.current[level] = false;
      return;
    }

    // Không gõ gì thì thôi, khỏi ép lại
    if (!hasTyped[level]) return;

    if (lockToSuggestion) {
      commitFromText(level, { focusOut: false });
    }
  }

  // close khi click ngoài
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        setOpen({ province: false, ward: false });
        setHasTyped({ province: false, ward: false });
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={wrapRef} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Province */}
      <div className="relative">
        <FieldLabel required={required}>Tỉnh / Thành phố</FieldLabel>
        <Input
          ref={provinceRef}
          value={q.province}
          onChange={(e) => {
            const v = e.target.value;
            setQ((s) => ({ ...s, province: v }));
            setOpen((o) => ({ ...o, province: true }));
            setHasTyped((t) => ({ ...t, province: true }));
          }}
          onFocus={() => {
            setOpen((o) => ({ ...o, province: true }));
            setHasTyped((t) => ({ ...t, province: false }));
          }}
          onBlur={() => handleBlur("province")}
          onKeyDown={(e) => handleKeyDown(e, "province")}
          placeholder={placeholders.province}
          autoComplete="off"
          spellCheck={false}
          className={invalidProvince ? inputClassErr : inputClassOk}
        />
        {open.province && !loading && (
          <SuggestList
            items={
              hasTyped.province
                ? provinceSuggestions
                : provinceOptions.slice(0, 80)
            }
            activeLabel={labelOf(value.province)}
            onPick={(it) => pick("province", it, { focusOut: true })}
          />
        )}
      </div>

      {/* Ward */}
      <div className="relative">
        <FieldLabel required={required}>Phường / Xã</FieldLabel>
        <Input
          ref={wardRef}
          value={q.ward}
          onChange={(e) => {
            const v = e.target.value;
            setQ((s) => ({ ...s, ward: v }));
            setOpen((o) => ({ ...o, ward: true }));
            setHasTyped((t) => ({ ...t, ward: true }));
          }}
          onFocus={() => {
            setOpen((o) => ({ ...o, ward: true }));
            setHasTyped((t) => ({ ...t, ward: false }));
          }}
          onBlur={() => handleBlur("ward")}
          onKeyDown={(e) => handleKeyDown(e, "ward")}
          placeholder={placeholders.ward}
          autoComplete="off"
          spellCheck={false}
          className={invalidWard ? inputClassErr : inputClassOk}
        />
        {open.ward && !loading && (
          <SuggestList
            items={hasTyped.ward ? wardSuggestions : wardOptions.slice(0, 220)}
            activeLabel={labelOf(value.ward)}
            onPick={(it) => pick("ward", it, { focusOut: true })}
          />
        )}
      </div>

      {/* Địa chỉ chi tiết */}
<div className="md:col-span-2">
  <label className="mb-1 block text-sm text-neutral-600">
    Địa chỉ chi tiết <span className="text-rose-600">*</span>
  </label>

  <Input
    value={value.address || ""}
    onChange={(e) =>
      onChange({
        address: (e.target.value || "").slice(0, MAX_ADDRESS_LEN),
      })
    }
    maxLength={MAX_ADDRESS_LEN}
    className={`h-12 rounded-xl text-[15px] ${
      invalidAddress ? "border-rose-500" : "border-neutral-300"
    }`}
    placeholder="Số nhà, đường, thôn xóm..."
  />
 {/* Bộ đếm ký tự */}
  <div className="mt-1 text-right text-xs text-neutral-500">
    {(value.address || "").length}/{MAX_ADDRESS_LEN}
  </div>
      </div>
    </div>
  );
}
