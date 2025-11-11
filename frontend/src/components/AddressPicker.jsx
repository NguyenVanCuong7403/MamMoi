import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useVnAdmin, normalize as vnNormalize } from "@/lib/useVnAdmin";

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
      /\b(tinh|tỉnh|thanh pho|thành phố|tp|xa|xã|phuong|phường|thi tran|thị trấn)\b/gi,
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
   AddressPicker — 2 cấp (Tỉnh/Thành ⇄ Phường/Xã) + Địa chỉ chi tiết
   - Reset Phường/Xã khi đổi Tỉnh/Thành
   - Khóa theo gợi ý (lockToSuggestion)
   - Nhận invalid từ ngoài (không đỏ khi mới mở)
========================================================= */
export default function AddressPicker({
  value = {}, // { province, ward, address } — object/string
  onChange,
  lockToSuggestion = true,
  required = true,

  // nhận cờ invalid từ cha (GardenModal)
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
  const {
    loading,
    provinces,
    provinceWardsMap,
    allWards,
  } = useVnAdmin();

  // local text state
  const [q, setQ] = useState({
    province: labelOf(value.province),
    ward: labelOf(value.ward),
    address: value.address || "",
  });
  const [open, setOpen] = useState({ province: false, ward: false });
  const wrapRef = useRef(null);

  // đồng bộ khi value từ ngoài đổi
  useEffect(() => {
    setQ({
      province: labelOf(value.province),
      ward: labelOf(value.ward),
      address: value.address || "",
    });
  }, [value.province, value.ward, value.address]);

  // xác định province đang chọn (ưu tiên code)
  const selectedProvince = useMemo(() => {
    const c = codeOf(value.province);
    if (c) return provinces.find((p) => String(p.code) === c) || null;
    const l = labelOf(value.province);
    return (
      provinces.find(
        (p) =>
          samePlace(p.full_name || p.name, l) ||
          samePlace(p.name || "", l)
      ) || null
    );
  }, [provinces, value.province]);

  // nguồn gợi ý phường/xã
  const wardSource = useMemo(() => {
    if (selectedProvince)
      return provinceWardsMap[String(selectedProvince.code)] || [];
    return allWards;
  }, [selectedProvince, provinceWardsMap, allWards]);

  // lọc gợi ý (giới hạn 50)
  const filter = (list, keyword) => {
    const k = norm(keyword);
    if (!k) return list.slice(0, 50);
    return list
      .filter((it) => {
        const L = norm(it.full_name || it.name);
        return L.includes(k) || stripPrefixes(L).includes(k);
      })
      .slice(0, 50);
  };

  // ép hợp lệ khi blur (nếu lockToSuggestion = true)
  const forceValidOrRevert = (level) => {
    const list = level === "province" ? provinces : wardSource;
    const txt = q[level];
    const found = list.find(
      (it) =>
        samePlace(it.full_name || it.name, txt) ||
        samePlace(it.name || "", txt)
    );
    if (found) {
      if (
        (level === "province" && codeOf(value.province) !== String(found.code)) ||
        (level === "ward" && codeOf(value.ward) !== String(found.code))
      ) {
        pick(level, found);
      }
    } else if (lockToSuggestion) {
      // revert về label đang chọn
      setQ((s) => ({ ...s, [level]: labelOf(value[level]) }));
    }
  };

  // pick từ gợi ý
  const pick = (level, item) => {
    const lbl = item.full_name || item.name || "";
    setOpen((o) => ({ ...o, [level]: false }));

    if (level === "province") {
      setQ((s) => ({ ...s, province: lbl, ward: "" }));
      // báo ra ngoài: đổi tỉnh => reset ward
      onChange?.({ province: item, ward: null });
      return;
    }

    // level === "ward"
    setQ((s) => ({ ...s, ward: lbl }));
    onChange?.({ ward: item });
  };

  // auto-close khi click ngoài
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        setOpen({ province: false, ward: false });
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
          value={q.province}
          onChange={(e) => {
            setQ((s) => ({ ...s, province: e.target.value }));
            setOpen((o) => ({ ...o, province: true }));
          }}
          onFocus={() => setOpen((o) => ({ ...o, province: true }))}
          onBlur={() => {
            setTimeout(() => {
              setOpen((o) => ({ ...o, province: false }));
              forceValidOrRevert("province");
            }, 80);
          }}
          placeholder={placeholders.province}
          autoComplete="off"
          spellCheck={false}
          className={invalidProvince ? inputClassErr : inputClassOk}
        />
        {open.province && !loading && (
          <SuggestList
            items={filter(provinces, q.province)}
            activeLabel={labelOf(value.province)}
            onPick={(it) => pick("province", it)}
          />
        )}
      </div>

      {/* Ward */}
      <div className="relative">
        <FieldLabel required={required}>Phường / Xã</FieldLabel>
        <Input
          value={q.ward}
          onChange={(e) => {
            setQ((s) => ({ ...s, ward: e.target.value }));
            setOpen((o) => ({ ...o, ward: true }));
          }}
          onFocus={() => setOpen((o) => ({ ...o, ward: true }))}
          onBlur={() => {
            setTimeout(() => {
              setOpen((o) => ({ ...o, ward: false }));
              forceValidOrRevert("ward");
            }, 80);
          }}
          placeholder={placeholders.ward}
          autoComplete="off"
          spellCheck={false}
          className={invalidWard ? inputClassErr : inputClassOk}
        />
        {open.ward && !loading && (
          <SuggestList
            items={filter(wardSource, q.ward)}
            activeLabel={labelOf(value.ward)}
            onPick={(it) => pick("ward", it)}
          />
        )}
      </div>

      {/* Address detail */}
      <div className="md:col-span-2">
        <FieldLabel required={required}>Địa chỉ chi tiết</FieldLabel>
        <Input
          value={q.address}
          onChange={(e) => {
            const v = e.target.value;
            setQ((s) => ({ ...s, address: v }));
            onChange?.({ address: v });
          }}
          placeholder={placeholders.address}
          className={invalidAddress ? inputClassErr : inputClassOk}
        />
      </div>
    </div>
  );
}
