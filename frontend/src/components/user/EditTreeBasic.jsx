import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Info, MapPin, PauseCircle, PlayCircle, AlertTriangle } from "lucide-react";

// ===== Demo data =====
const TREES = {
  "T-001": {
    id: "T-001",
    name: "Xoài Cát Chu",
    variety: "Giống địa phương",
    plantedAt: "2023-04-15",
    phase: "Sinh trưởng thân lá",
    status: "active",
    plot: "Vườn số 3 – FPT",
    note: "Bảo trì: tăng Kali.",
    imageUrl: ""
  },
  "T-003": {
    id: "T-003",
    name: "Bưởi Da Xanh",
    variety: "Da xanh",
    plantedAt: "2020-08-20",
    phase: "Nuôi quả – trước thu hoạch",
    status: "active",
    plot: "Vườn số 3 – FPT",
    note: "",
    imageUrl: ""
  }
};

const PHASES = [
  "Chuẩn bị & trồng",
  "Sinh trưởng thân lá",
  "Ra hoa",
  "Đậu/nuôi quả",
  "Trước thu",
  "Sau thu"
];

const GARDENS = [
  { id: "G-001", name: "Vườn số 1 – FPT" },
  { id: "G-002", name: "Vườn số 2 – FPT" },
  { id: "G-003", name: "Vườn số 3 – FPT" },
  { id: "G-004", name: "Vườn thử nghiệm – Khu A" }
];
const GARDEN_BY_ID = Object.fromEntries(GARDENS.map(g => [g.id, g.name]));
const GARDEN_BY_NAME = Object.fromEntries(GARDENS.map(g => [g.name, g.id]));

const INPUT =
  "w-full border border-gray-300 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400";

function monthsBetween(aStr, b = new Date()) {
  const a = new Date(aStr + "T00:00:00");
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
}

export default function EditTreeBasic() {
  const q = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const id = q.get("treeId") || "T-003";
  const src = TREES[id] || TREES["T-003"];

  const [form, setForm] = useState({ ...src });
  const age = useMemo(() => monthsBetween(form.plantedAt), [form.plantedAt]);

  const initialGardenId = form.plotId || GARDEN_BY_NAME[form.plot || ""] || "G-003";
  const [gardenId, setGardenId] = useState(initialGardenId);
  const gardenName = useMemo(() => GARDEN_BY_ID[gardenId] || form.plot || "", [gardenId, form.plot]);

  const [banner, setBanner] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  function onSave() {
    console.log("SAVE", form);
    alert("Đã lưu thay đổi cho #" + form.id);
  }
  function onReset() {
    setForm({ ...src });
    setBanner("Đã hoàn nguyên dữ liệu theo lần tải gần nhất.");
    setTimeout(() => setBanner(null), 2200);
  }

  function applyToggle(next) {
    setBusy(true);
    set("status", next);
    setBanner(next === "stopped" ? "Cây đã chuyển sang DỪNG HOẠT ĐỘNG." : "Cây đã được KHỞI ĐỘNG LẠI.");
    setTimeout(() => setBanner(null), 2400);
    setBusy(false);
  }

  function toggleStop() {
    if (form.status === "stopped") {
      applyToggle("active");
      return;
    }
    setConfirmOpen(true);
  }

  return (
    <div className="mm-fluid-page min-h-screen bg-neutral-50">
      <header className="bg-emerald-900 text-white">
        <div className="mm-fluid-shell mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Sửa thông tin cây</h1>
          <StatusBadge status={form.status} />
        </div>
      </header>

      {banner && (
        <div className="mm-fluid-shell mx-auto max-w-7xl px-6 pt-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-2 text-sm" aria-live="polite">
            {banner}
          </div>
        </div>
      )}

      <main className="mm-fluid-shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid lg:grid-cols-3 gap-6 relative isolate">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="h-44 rounded-xl bg-neutral-100 grid place-items-center text-neutral-500">
                Ảnh (kéo thả) <span className="ml-1">/ hoặc nhập URL bên dưới</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <Field label="Mã cây">
                  <input className={INPUT} value={form.id} onChange={e => set("id", e.target.value)} />
                </Field>
                <Field label="Ảnh (URL)">
                  <input
                    className={INPUT}
                    value={form.imageUrl || ""}
                    onChange={e => set("imageUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
              </div>
              <Field label="Ghi chú">
                <textarea
                  className={INPUT}
                  rows={3}
                  value={form.note || ""}
                  onChange={e => set("note", e.target.value)}
                  placeholder="Ghi chú thêm: nguồn giống, lịch tưới, hiện tại, v.v."
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <Field label="Tên cây">
                <input className={INPUT} value={form.name} onChange={e => set("name", e.target.value)} />
              </Field>
              <Field label="Giống">
                <input className={INPUT} value={form.variety || ""} onChange={e => set("variety", e.target.value)} />
              </Field>
              <Field label="Ngày trồng">
                <input
                  type="date"
                  className={INPUT}
                  value={toInputDate(form.plantedAt)}
                  onChange={e => set("plantedAt", e.target.value)}
                />
              </Field>
              <Field label="Trạng thái (hệ thống)">
                <select className={INPUT} value={form.status} onChange={e => set("status", e.target.value)}>
                  <option value="active">Đang chăm sóc</option>
                  <option value="stopped">Dừng hoạt động</option>
                </select>
              </Field>
              <Field label="Giai đoạn (khớp DB)">
                <select className={INPUT} value={form.phase} onChange={e => set("phase", e.target.value)}>
                  {PHASES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Tình trạng (mô tả)">
                <input
                  className={INPUT}
                  value={form.stateNote || ""}
                  onChange={e => set("stateNote", e.target.value)}
                  placeholder="Ví dụ: Lá vàng nhẹ..."
                />
              </Field>
              <Field label="Bệnh">
                <input className={INPUT} value={form.disease || ""} onChange={e => set("disease", e.target.value)} placeholder="Không có" />
              </Field>
              <Field label="Vườn (DB)">
                <select
                  className={INPUT}
                  value={gardenId}
                  onChange={e => {
                    const gid = e.target.value;
                    setGardenId(gid);
                    set("plotId", gid);
                    set("plot", GARDEN_BY_ID[gid]);
                  }}
                >
                  {GARDENS.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="md:col-span-2 pt-2 flex items-center gap-3">
                <Button type="button" className="bg-emerald-600 hover:bg-emerald-700" onClick={onSave}>Lưu thay đổi</Button>
                <Button type="button" variant="outline" onClick={onReset}>Hủy</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <section className="relative z-40 pointer-events-auto">
            <Card className="rounded-2xl shadow-md relative z-40 pointer-events-auto">
              <CardHeader>
                <CardTitle>Thông tin nhanh</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <Quick k={<><Calendar className="h-4 w-4" />Tuổi cây</>} v={<Badge variant="outline">{age} tháng</Badge>} />
                <Quick k={<><Info className="h-4 w-4" />Giai đoạn</>} v={<Badge variant="outline">{form.phase}</Badge>} />
                <Quick k={<><MapPin className="h-4 w-4" />Vị trí</>} v={<Badge variant="outline">{gardenName || "—"}</Badge>} />
                <Quick k={<><Info className="h-4 w-4" />Trạng thái</>} v={<StatusBadge status={form.status} />} />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-rose-200">
              <CardHeader>
                <CardTitle className="text-rose-600">Nguy hiểm</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <p>Nếu cây đã chết hoặc cần ngừng theo dõi, bạn có thể dừng hoạt động. Hệ thống vẫn giữ lịch sử để đối chiếu.</p>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={toggleStop}
                    disabled={busy}
                    className={(form.status === "stopped" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700") + " cursor-pointer"}
                  >
                    {form.status === "stopped" ? (
                      <span className="inline-flex items-center gap-2">
                        <PlayCircle className="h-4 w-4" />Khởi động lại cây
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <PauseCircle className="h-4 w-4" />Dừng hoạt động cây
                      </span>
                    )}
                  </Button>
                  {busy && <span className="text-xs text-neutral-500">Đang xử lý…</span>}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {confirmOpen && (
        <ConfirmModal
          title="Dừng hoạt động cây?"
          description="Hệ thống sẽ ngừng gợi ý và nhắc việc cho cây này. Bạn vẫn có thể khởi động lại sau."
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            applyToggle("stopped");
          }}
        />
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-48 shrink-0 text-neutral-700">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls =
    status === "stopped"
      ? "bg-rose-100 text-rose-700 border border-rose-200"
      : "bg-emerald-100 text-emerald-700 border border-emerald-200";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status === "stopped" ? "ĐANG DỪNG" : "Đang chăm sóc"}
    </span>
  );
}

function Quick({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-neutral-600">{k}</div>
      <div>{v}</div>
    </div>
  );
}

function toInputDate(d) {
  if (!d) return "";
  const dt = new Date(d + (d.length === 10 ? "T00:00:00" : ""));
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ConfirmModal({ title, description, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="mt-0.5"><AlertTriangle className="h-5 w-5 text-rose-600" /></div>
          <div>
            <div className="text-base font-semibold">{title}</div>
            <div className="text-sm text-neutral-600 mt-1">{description}</div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
          <Button type="button" className="bg-rose-600 hover:bg-rose-700" onClick={onConfirm}>Xác nhận dừng</Button>
        </div>
      </div>
    </div>
  );
}
