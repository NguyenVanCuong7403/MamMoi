// scripts/build-vn-admin-2025.mjs
// Build vn-admin-2025.min.json from 19/2025/QĐ-TTg PDF
// Node >= 18 (tested on Node 25), ESM only.

import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/* ================= CLI args ================= */
function parseArgs(argv = process.argv.slice(2)) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--src" || k === "--pdf") out.src = argv[++i];
    else if (k === "--out") out.out = argv[++i];
    else if (k === "--dry") out.dry = true;
  }
  return out;
}

/* =============== helpers ==================== */
function vnTitleCase(s = "") {
  // Best-effort: giữ nguyên dấu, title-case từng chữ
  return String(s)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b([a-zà-ỹ])/giu, (m) => m.toUpperCase())
    .replace(/\s*-\s*/g, " - ");
}
function normalizeSpaces(s = "") {
  return String(s).replace(/[ \t]+/g, " ").replace(/\s+\n/g, "\n").trim();
}

async function loadPdfBytes(src) {
  if (!src) throw new Error("Missing --src");
  if (/^https?:\/\//i.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
    const ab = await res.arrayBuffer();
    return new Uint8Array(ab);
  }
  const buf = await fs.readFile(src);
  // Convert Buffer -> Uint8Array (pdfjs yêu cầu Uint8Array)
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

function sha256(uint8) {
  const h = createHash("sha256");
  h.update(uint8);
  return h.digest("hex");
}

/** Trả về mảng "dòng" đã chuẩn hoá từ PDF (ổn định hơn cho regex) */
async function pdfToLines(pdfBytes) {
  const doc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
  const lines = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    let cur = "";
    for (const it of content.items) {
      cur += (it.str || "") + " ";
      if (it.hasEOL) {
        const line = normalizeSpaces(cur);
        if (line) lines.push(line);
        cur = "";
      }
    }
    if (cur.trim()) lines.push(normalizeSpaces(cur));
  }

  await doc.destroy();
  return lines;
}

/* =============== parsing ==================== */
/**
 * Kỳ vọng cấu trúc:
 *  - Header tỉnh/thành theo dạng: "01. TỈNH ABC" hoặc "01 THÀNH PHỐ XYZ"
 *  - Dòng cấp xã bắt đầu bằng mã 5 số: "xxxxx ..." (bảng phụ lục II)
 *  - Trong bảng, thứ tự cột có thể là: Mã số | Tên | Cấp (Xã/Phường/Thị trấn) | ...
 *  - Hoặc: Mã số | Cấp | Tên | ...
 *  -> Ta xử lý linh hoạt bằng cách tách "mã 5 số" trước, sau đó dò vị trí từ khoá cấp.
 */
function parseVnAdminFromLines(lines = []) {
  // Province header (rộng tay):
  // "01. TỈNH HÀ NAM", "01 TỈNH HÀ NAM", "01- TỈNH HÀ NAM", "04. THÀNH PHỐ HÀ NỘI", ...
  const reProv =
    /^(\d{2})\s*[\.\-]?\s*(TỈNH|THÀNH PHỐ)\s+([A-ZÀ-Ỹ0-9 \-\.]+)$/u;

  // Nhận biết các dòng không phải dữ liệu
  const skipRe =
    /^(PHỤ LỤC|KÈM THEO|BAN HÀNH|QUYẾT ĐỊNH|TỔNG SỐ|Mã số\b|STT\b|Bảng danh mục|Cấp hành chính|Tên đơn vị hành chính)\b/iu;

  const TYPE_WORDS = ["Xã", "Phường", "Thị trấn"];
  const provinces = [];
  const wards = [];

  let curProv = null; // { code, name, type, full_name }

  for (const raw0 of lines) {
    const raw = raw0.trim();
    if (!raw || skipRe.test(raw)) continue;

    // Tỉnh/TP?
    const mP = raw.match(reProv);
    if (mP) {
      const code = mP[1]; // "01".."34"
      const kind = mP[2]; // "TỈNH" | "THÀNH PHỐ"
      const nameU = mP[3];
      const type = kind === "TỈNH" ? "Tỉnh" : "Thành phố";
      const name = vnTitleCase(nameU);
      const p = {
        code,
        type,
        name,
        full_name: `${type} ${name}`,
      };
      provinces.push(p);
      curProv = p;
      continue;
    }

    // Hàng cấp xã: Phải bắt đầu bằng 5 chữ số
    const mCode = raw.match(/^(\d{5})\s+(.+)$/u);
    if (!mCode) continue;
    if (!curProv) continue; // Chưa vào khu vực 1 tỉnh cụ thể

    const code5 = mCode[1];
    let rest = mCode[2];

    // Tách cột bằng 2+ spaces để dò "type" nếu có
    // Nhiều PDF xuất text theo dạng: "01234  Xã  Tên Xã ABC  Huyện ...  Ghi chú"
    // hoặc: "01234  Tên Xã ABC  Xã  Huyện ..."
    const cols = rest.split(/\s{2,}/).map((s) => s.trim()).filter(Boolean);

    let type = null;
    let name = null;

    // Chiến lược:
    // 1) Nếu cột đầu là (Xã|Phường|Thị trấn) -> type ở cột 0, name ở cột 1
    // 2) Nếu cột thứ hai là type -> name ở cột 0
    // 3) Nếu không theo cột: thử dạng "^(Xã|Phường|Thị trấn)\s+(.+)$"
    // 4) Nếu vẫn không: giữ nguyên, coi như tên trước, tìm từ khoá type trong chuỗi

    if (cols.length >= 2) {
      if (TYPE_WORDS.includes(cols[0])) {
        type = cols[0];
        name = cols[1];
      } else if (TYPE_WORDS.includes(cols[1])) {
        name = cols[0];
        type = cols[1];
      }
    }

    if (!type || !name) {
      const m1 = rest.match(/^(Xã|Phường|Thị trấn)\s+(.+)$/u);
      if (m1) {
        type = m1[1];
        name = m1[2];
      }
    }

    if (!type || !name) {
      // Cố gắng tìm từ khoá type ở gần đầu/giữa chuỗi
      const m2 = rest.match(/\b(Xã|Phường|Thị trấn)\b\s+(.+)$/u);
      if (m2) {
        type = m2[1];
        name = m2[2];
      }
    }

    if (!type || !name) {
      // Không xác định được -> bỏ qua (hoặc log để debug)
      // console.warn("[skip] row not matched:", raw);
      continue;
    }

    name = vnTitleCase(name.replace(/\s{2,}.+$/, "").trim()); // cắt phần sau nếu còn cột khác
    wards.push({
      code: code5,
      type,
      name,
      full_name: `${type} ${name}`,
      province_code: curProv.code,
    });
  }

  // Integrity
  const uniqProv = new Set(provinces.map((p) => p.code));
  const uniqWard = new Set(wards.map((w) => w.code));
  if (uniqProv.size !== provinces.length) {
    console.warn("[warn] Duplicate province codes detected.");
  }
  if (uniqWard.size !== wards.length) {
    console.warn("[warn] Duplicate ward codes detected.");
  }

  return { provinces, wards };
}

/* ============== compose output ================= */
function composeOutput({ provinces, wards }, sourceUrl, pdfHash) {
  return {
    meta: {
      decision: "19/2025/QĐ-TTg",
      source: sourceUrl,
      pdf_sha256: pdfHash,
      generated_at: new Date().toISOString(),
      notes:
        "Danh mục & mã số đơn vị hành chính Việt Nam sau sắp xếp 2025 (cấp tỉnh và cấp xã). Theo phụ lục QĐ 19/2025/QĐ-TTg. Không bao gồm mã cấp huyện (bộ mã 2025 không ban hành).",
      counts: {
        provinces: provinces.length,
        wards: wards.length,
      },
    },
    provinces,
    districts: [], // cố ý rỗng
    wards,
  };
}

/* ==================== main ==================== */
async function main() {
  const { src, out = "public/data/vn-admin-2025.min.json", dry } = parseArgs();

  const pdfBytes = await loadPdfBytes(src);
  const hash = sha256(pdfBytes);

  const lines = await pdfToLines(pdfBytes);
  const parsed = parseVnAdminFromLines(lines);

  console.log(
    `[i] Parsed => provinces: ${parsed.provinces.length}, wards: ${parsed.wards.length}`
  );
  if (parsed.provinces.length !== 34) {
    console.warn(
      "[warn] Số tỉnh/thành khác 34 — kiểm tra regex hoặc phiên bản PDF."
    );
  }
  if (parsed.wards.length < 3000) {
    console.warn(
      "[warn] Số xã/phường có vẻ thiếu (<3000) — cần kiểm tra lại việc tách dòng."
    );
  }

  const output = composeOutput(parsed, src, hash);
  const json = JSON.stringify(output);

  if (dry) {
    console.log(json.slice(0, 2000) + "\n... (truncated)");
    return;
  }

  const dir = path.dirname(out);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(out, json);
  console.log(`[ok] Wrote ${out}`);
  console.log(`[meta] sha256(pdf)=${hash}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
