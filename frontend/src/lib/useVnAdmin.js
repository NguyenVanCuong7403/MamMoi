import { useEffect, useMemo, useState } from "react";

/** Chuẩn hoá tiếng Việt: bỏ dấu, gộp space, lower-case */
export const normalize = (s = "") =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/* ======= Fallback tỉnh/thành 2025 (34 đơn vị) ======= */
const PROVINCES_2025 = [
  { code: "01", type: "Thành phố", name: "Hà Nội", full_name: "Thành phố Hà Nội" },
  { code: "04", type: "Tỉnh", name: "Cao Bằng", full_name: "Tỉnh Cao Bằng" },
  { code: "08", type: "Tỉnh", name: "Tuyên Quang", full_name: "Tỉnh Tuyên Quang" },
  { code: "11", type: "Tỉnh", name: "Điện Biên", full_name: "Tỉnh Điện Biên" },
  { code: "12", type: "Tỉnh", name: "Lai Châu", full_name: "Tỉnh Lai Châu" },
  { code: "14", type: "Tỉnh", name: "Sơn La", full_name: "Tỉnh Sơn La" },
  { code: "15", type: "Tỉnh", name: "Lào Cai", full_name: "Tỉnh Lào Cai" },
  { code: "19", type: "Tỉnh", name: "Thái Nguyên", full_name: "Tỉnh Thái Nguyên" },
  { code: "20", type: "Tỉnh", name: "Lạng Sơn", full_name: "Tỉnh Lạng Sơn" },
  { code: "22", type: "Tỉnh", name: "Quảng Ninh", full_name: "Tỉnh Quảng Ninh" },
  { code: "24", type: "Tỉnh", name: "Bắc Ninh", full_name: "Tỉnh Bắc Ninh" },
  { code: "25", type: "Tỉnh", name: "Phú Thọ", full_name: "Tỉnh Phú Thọ" },
  { code: "31", type: "Thành phố", name: "Hải Phòng", full_name: "Thành phố Hải Phòng" },
  { code: "33", type: "Tỉnh", name: "Hưng Yên", full_name: "Tỉnh Hưng Yên" },
  { code: "37", type: "Tỉnh", name: "Ninh Bình", full_name: "Tỉnh Ninh Bình" },
  { code: "38", type: "Tỉnh", name: "Thanh Hóa", full_name: "Tỉnh Thanh Hóa" },
  { code: "40", type: "Tỉnh", name: "Nghệ An", full_name: "Tỉnh Nghệ An" },
  { code: "42", type: "Tỉnh", name: "Hà Tĩnh", full_name: "Tỉnh Hà Tĩnh" },
  { code: "44", type: "Tỉnh", name: "Quảng Trị", full_name: "Tỉnh Quảng Trị" },
  { code: "46", type: "Thành phố", name: "Huế", full_name: "Thành phố Huế" },
  { code: "48", type: "Thành phố", name: "Đà Nẵng", full_name: "Thành phố Đà Nẵng" },
  { code: "51", type: "Tỉnh", name: "Quảng Ngãi", full_name: "Tỉnh Quảng Ngãi" },
  { code: "52", type: "Tỉnh", name: "Gia Lai", full_name: "Tỉnh Gia Lai" },
  { code: "56", type: "Tỉnh", name: "Khánh Hòa", full_name: "Tỉnh Khánh Hòa" },
  { code: "66", type: "Tỉnh", name: "Đắk Lắk", full_name: "Tỉnh Đắk Lắk" },
  { code: "68", type: "Tỉnh", name: "Lâm Đồng", full_name: "Tỉnh Lâm Đồng" },
  { code: "75", type: "Tỉnh", name: "Đồng Nai", full_name: "Tỉnh Đồng Nai" },
  { code: "79", type: "Thành phố", name: "Hồ Chí Minh", full_name: "Thành phố Hồ Chí Minh" },
  { code: "80", type: "Tỉnh", name: "Tây Ninh", full_name: "Tỉnh Tây Ninh" },
  { code: "82", type: "Tỉnh", name: "Đồng Tháp", full_name: "Tỉnh Đồng Tháp" },
  { code: "86", type: "Tỉnh", name: "Vĩnh Long", full_name: "Tỉnh Vĩnh Long" },
  { code: "91", type: "Tỉnh", name: "An Giang", full_name: "Tỉnh An Giang" },
  { code: "92", type: "Thành phố", name: "Cần Thơ", full_name: "Thành phố Cần Thơ" },
  { code: "96", type: "Tỉnh", name: "Cà Mau", full_name: "Tỉnh Cà Mau" },
];

/* ======= helpers ======= */
const arr = (x) =>
  Array.isArray(x)
    ? x
    : Array.isArray(x?.data)
      ? x.data
      : Array.isArray(x?.results)
        ? x.results
        : Array.isArray(x?.provinces)
          ? x.provinces
          : [];

const ensureCode = (e = {}) => ({ ...e, code: String(e.code ?? e.id ?? e.value ?? "") });

/** Xác định “nhìn-trông-giống” xã/phường/thị trấn */
const looksLikeWard = (w = {}) => {
  const typ = String(w.type || "").toLowerCase();
  return (
    w &&
    (w.full_name || w.name) &&
    (typ.includes("xã") || typ.includes("phường") || typ.includes("thị trấn"))
  );
};

/* ======= Shapers (mặc định đưa về mô hình 2 cấp: Province → Ward) ======= */

/** Case A: dữ liệu phẳng {provinces[], wards[]} (wards có province_code hoặc district_code) */
function shapeTwoLevelFlat({ provinces = [], districts = [], wards = [] }) {
  const P = arr(provinces).map(ensureCode);
  const D = arr(districts).map((d) => ensureCode({ ...d, province_code: String(d.province_code) }));
  const Wraw = arr(wards);

  // Map huyện -> tỉnh (nếu còn sót)
  const districtToProvince = {};
  for (const d of D) districtToProvince[d.code] = String(d.province_code ?? "");

  // Xác định province_code cho từng xã/phường
  const W = Wraw.map((w) => {
    const w2 = ensureCode(w);
    const pc =
      String(w2.province_code ?? "") ||
      (w2.district_code ? districtToProvince[String(w2.district_code)] : "");
    return {
      ...w2,
      province_code: String(pc || ""), // luôn string (có thể rỗng nếu nguồn lỗi)
    };
  });

  // Gom xã/phường theo tỉnh
  const provinceWardsMap = {};
  for (const p of P) provinceWardsMap[p.code] = [];
  for (const w of W) {
    if (w.province_code && provinceWardsMap[w.province_code]) {
      provinceWardsMap[w.province_code].push(w);
    }
  }

  // ward -> province
  const wardToProvince = {};
  for (const w of W) {
    if (w.code) wardToProvince[w.code] = String(w.province_code || "");
  }

  return {
    version: "two-level-flat",
    provinces: P,
    allWards: W,
    provinceWardsMap,
    wardToProvince,

    // Các trường “di sản” để không vỡ code cũ (giờ không còn dùng):
    mapDistricts: {},
    mapWards: {}, // trước kia keyed theo district; nay bỏ
    allDistricts: [],
    districtToProvince: {},
    wardToDistrict: {},
  };
}

/** Case B: lồng 2 cấp: provinces[].wards[] (không còn district) */
function shapeTwoLevelNested(list) {
  const provincesRaw = arr(list);
  const provinces = provincesRaw.map(ensureCode);

  const provinceWardsMap = {};
  const allWards = [];
  const wardToProvince = {};

  for (const p0 of provincesRaw) {
    const p = ensureCode(p0);
    const wRaw = arr(p0.wards || p0.children || []);
    const ws = wRaw.map((w) =>
      ensureCode({
        ...w,
        province_code: String(p.code),
      })
    );
    provinceWardsMap[p.code] = ws;
    allWards.push(...ws);
    for (const w of ws) wardToProvince[w.code] = p.code;
  }

  return {
    version: "two-level-nested",
    provinces,
    allWards,
    provinceWardsMap,
    wardToProvince,

    mapDistricts: {},
    mapWards: {},
    allDistricts: [],
    districtToProvince: {},
    wardToDistrict: {},
  };
}

/** Case C: lồng 3 cấp cũ (province→district→ward) → làm phẳng thành 2 cấp */
function shapeThreeToTwoLevel(list) {
  const provincesRaw = arr(list);
  const provinces = provincesRaw.map(ensureCode);

  const districtToProvince = {};
  const provinceWardsMap = {};
  const allWards = [];
  const wardToProvince = {};

  for (const p0 of provincesRaw) {
    const p = ensureCode(p0);
    provinceWardsMap[p.code] = [];

    const dRaw = arr(p0.districts || p0.children || []);
    for (const d0 of dRaw) {
      const d = ensureCode(d0);
      districtToProvince[d.code] = p.code;

      const wRaw = arr(d0.wards || d0.children || []);
      for (const w0 of wRaw) {
        const w = ensureCode({
          ...w0,
          province_code: p.code,
        });
        allWards.push(w);
        wardToProvince[w.code] = p.code;
        provinceWardsMap[p.code].push(w);
      }
    }
  }

  return {
    version: "three-to-two-level",
    provinces,
    allWards,
    provinceWardsMap,
    wardToProvince,

    mapDistricts: {},
    mapWards: {},
    allDistricts: [],
    districtToProvince: {},
    wardToDistrict: {},
  };
}

/** Router: nhận bất kỳ shape nào và trả về 2 cấp */
function shapeAny(payload) {
  if (!payload) return shapeTwoLevelFlat({ provinces: [], wards: [] });

  // Nếu payload có {provinces[], wards[]} → phẳng
  if (Array.isArray(payload.provinces) && Array.isArray(payload.wards)) {
    return shapeTwoLevelFlat(payload);
  }

  // Nếu là mảng provinces có .wards (hoặc children) → lồng 2 cấp
  const list = Array.isArray(payload) ? payload : payload.provinces;
  if (Array.isArray(list) && list.length) {
    const first = list[0];
    const children = arr(first?.wards || first?.children || []);
    if (children.length && looksLikeWard(children[0])) {
      return shapeTwoLevelNested(list);
    }
    // nếu children là district → lồng 3 cấp
    if (children.length) {
      const gchild = arr(children[0]?.wards || children[0]?.children || []);
      if (gchild.length && looksLikeWard(gchild[0])) {
        return shapeThreeToTwoLevel(list);
      }
    }
  }

  // Nếu có {provinces[]} mà chưa có wards → trả về chỉ tỉnh
  if (Array.isArray(payload.provinces)) {
    return shapeTwoLevelFlat({ provinces: payload.provinces, wards: [] });
  }

  // Không nhận diện được → fallback rỗng
  return shapeTwoLevelFlat({ provinces: [], wards: [] });
}

/* ======= Hook chính (2 cấp) ======= */
export function useVnAdmin() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    version: "init",

    // DỮ LIỆU CHÍNH (2 cấp)
    provinces: [],
    allWards: [],
    provinceWardsMap: {},
    wardToProvince: {},

    // DI SẢN (để không vỡ code cũ – giờ không dùng)
    mapDistricts: {},
    mapWards: {},
    allDistricts: [],
    districtToProvince: {},
    wardToDistrict: {},
  });

  useEffect(() => {
    let cancelled = false;
    const apply = (payload) => {
      if (!cancelled) setState((s) => ({ ...s, loading: false, ...payload }));
    };

    (async () => {
      /* --- 1) ƯU TIÊN: local snapshot 2025 (đầy đủ 3321 xã/phường) --- */
      try {
        const rLocal = await fetch("/data/vn-admin-2025.min.json", { cache: "force-cache" });
        if (rLocal.ok) {
          const j = await rLocal.json();
          const shaped = shapeAny(j);
          if (shaped.provinces.length) {
            apply({ ...shaped, version: "local-2025", error: null });
            return;
          }
        }
      } catch { }

      /* --- 2) Thử OpenAPI v2 phẳng (nếu server đã cập nhật) --- */
      try {
        const [rp, rw] = await Promise.allSettled([
          fetch("https://provinces.open-api.vn/api/v2/p", { cache: "force-cache" }),
          fetch("https://provinces.open-api.vn/api/v2/w", { cache: "force-cache" }),
        ]);
        if (rp.status === "fulfilled" && rw.status === "fulfilled" && rp.value.ok && rw.value.ok) {
          const [jp, jw] = await Promise.all([rp.value.json(), rw.value.json()]);
          const shaped = shapeTwoLevelFlat({ provinces: jp, wards: jw });
          if (shaped.provinces.length) {
            apply({ ...shaped, version: "openapi-v2-flat", error: null });
            return;
          }
        }
      } catch { }

      /* --- 3) Thử OpenAPI depth=3 rồi làm phẳng về 2 cấp --- */
      try {
        const r2 = await fetch("https://provinces.open-api.vn/api/v2/p?depth=3", {
          cache: "force-cache",
        });
        if (r2.ok) {
          const j2 = await r2.json();
          const shaped = shapeAny(j2); // tự nhận dạng & ép về 2 cấp
          if (shaped.provinces.length) {
            apply({ ...shaped, version: "openapi-v2-nested→2level", error: null });
            return;
          }
        }
      } catch { }

      /* --- 4) Fallback v1 rồi làm phẳng về 2 cấp --- */
      try {
        const r1 = await fetch("https://provinces.open-api.vn/api/?depth=3", {
          cache: "force-cache",
        });
        if (r1.ok) {
          const j1 = await r1.json();
          const shaped = shapeAny(j1);
          if (shaped.provinces.length) {
            apply({
              ...shaped,
              version: "openapi-v1→2level",
              error: "Đang dùng dữ liệu v1 (có thể chưa khớp bản 2025)",
            });
            return;
          }
        }
      } catch { }

      /* --- 5) Fallback cuối: chỉ tỉnh/thành nhúng sẵn --- */
      if (PROVINCES_2025.length) {
        const shaped = shapeAny({ provinces: PROVINCES_2025, wards: [] });
        apply({
          ...shaped,
          version: "builtin-2025-provinces",
          error:
            "Chỉ có danh mục cấp tỉnh (34). Hãy cung cấp /data/vn-admin-2025.min.json để có đủ 3321 xã/phường.",
        });
        return;
      }

      // Nếu mọi nguồn đều fail
      apply({
        loading: false,
        error: "Không tải được dữ liệu hành chính",
        version: "failed",
        provinces: [],
        allWards: [],
        provinceWardsMap: {},
        wardToProvince: {},
        mapDistricts: {},
        mapWards: {},
        allDistricts: [],
        districtToProvince: {},
        wardToDistrict: {},
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* --- Index tìm kiếm nhanh --- */
  const indexes = useMemo(() => {
    const pIdx = {};
    for (const p of state.provinces) {
      const n1 = normalize(p.name || "");
      const n2 = normalize(p.full_name || "");
      if (n1) pIdx[n1] = p;
      if (n2) pIdx[n2] = p;
    }

    // tuỳ chọn: index xã/phường (nếu bạn cần tìm nhanh)
    const wIdx = {};
    for (const w of state.allWards) {
      const n1 = normalize(w.name || "");
      const n2 = normalize(w.full_name || "");
      if (n1) (wIdx[n1] ||= []).push(w);
      if (n2) (wIdx[n2] ||= []).push(w);
    }

    return { pIdx, wIdx, normalize };
  }, [state.provinces, state.allWards]);

  return { ...state, ...indexes };
}

export default useVnAdmin;
