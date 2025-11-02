import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalIcon, Image as ImageIcon, Info } from "lucide-react";

// Demo catalog
const CATALOG = [
  { id: "mango_cat_chu", commonName: "Xoài Cát Chu", variety: "Giống địa phương" },
  { id: "durian_ri6", commonName: "Sầu riêng Ri6", variety: "Ri6" },
  { id: "grapefruit_dx", commonName: "Bưởi Da Xanh", variety: "Da xanh" },
];

const PHASES = [
  "Cây non",
  "Sinh trưởng thân lá",
  "Ra hoa",
  "Đậu/nuôi quả",
  "Trước thu",
  "Sau thu",
];

function monthsBetween(aStr, b = new Date()) {
  if (!aStr) return 0;
  const a = new Date(aStr + "T00:00:00");
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
}

function genCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `T-${n}`;
}

export default function AddTreeNewScreen() {
  const [code, setCode] = useState(genCode());
  const [speciesId, setSpeciesId] = useState(CATALOG[0].id);
  const [variety, setVariety] = useState(CATALOG[0].variety);
  const [phase, setPhase] = useState("Cây non");
  const [preAge, setPreAge] = useState("6");
  const [plantDate, setPlantDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("Bình thường");
  const [garden, setGarden] = useState("Vườn số 3 – FPT");
  const [soil, setSoil] = useState("Đất đỏ / thịt nhẹ pha cát");
  const [symptom, setSymptom] = useState("Không có");
  const [region, setRegion] = useState("");
  const [careGoal, setCareGoal] = useState("Trồng 1 gốc, tạo tán ban đầu");
  const [note, setNote] = useState("");

  const species = useMemo(() => CATALOG.find((c) => c.id === speciesId), [speciesId]);
  const ageMonths = useMemo(() => monthsBetween(plantDate), [plantDate]);

  function handlePresetFromSpecies(id) {
    const s = CATALOG.find((c) => c.id === id);
    if (!s) return;
    setSpeciesId(id);
    setVariety(s.variety);
    setPhase("Cây non");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1523642595780-9531f5859d82?q=80&w=1600&auto=format&fit=crop"
          className="h-56 w-full object-cover"
          alt="hero"
        />
        <div className="absolute inset-0 bg-emerald-950/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-4xl font-semibold">Thêm cây mới</h1>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT – form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                {/* Mã cây */}
                <div className="grid gap-1">
                  <Label htmlFor="code">Mã cây</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="max-w-[220px]"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setCode(genCode())}
                    >
                      Tạo mã
                    </Button>
                  </div>
                </div>

                {/* Loại cây */}
                <div className="grid gap-1">
                  <Label>Loại cây (giống)</Label>
                  <select
                    value={speciesId}
                    onChange={(e) => handlePresetFromSpecies(e.target.value)}
                    className="h-9 rounded-md border bg-white px-3 text-sm"
                  >
                    {CATALOG.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.commonName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trạng thái */}
                <div className="grid gap-1">
                  <Label>Trạng thái (mô tả ngắn)</Label>
                  <Input
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    placeholder="VD: bình thường, lá vàng nhẹ, cần theo dõi…"
                  />
                </div>

                {/* Giống */}
                <div className="grid gap-1">
                  <Label>Giống/Variety</Label>
                  <Input
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="VD: Cát Chu, Ri6…"
                  />
                </div>

                {/* Giai đoạn */}
                <div className="grid gap-1">
                  <Label>Giai đoạn</Label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    className="h-9 rounded-md border bg-white px-3 text-sm"
                  >
                    {PHASES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tuổi trước khi trồng */}
                <div className="grid gap-1">
                  <Label>Tuổi trước khi trồng (tháng)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={preAge}
                      onChange={(e) => setPreAge(e.target.value)}
                      className="max-w-[120px]"
                    />
                    <span className="text-sm text-neutral-600">tháng</span>
                  </div>
                </div>

                {/* Tình trạng */}
                <div className="grid gap-1">
                  <Label>Tình trạng (biểu hiện)</Label>
                  <Input
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    placeholder="VD: lá vàng nhẹ, rễ khỏe, gốc sạch…"
                  />
                </div>

                {/* Ngày trồng */}
                <div className="grid gap-1">
                  <Label>Ngày trồng</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={plantDate}
                      onChange={(e) => setPlantDate(e.target.value)}
                    />
                    <CalIcon className="absolute right-3 top-2.5 h-4 w-4 text-neutral-500" />
                  </div>
                  <div className="text-xs text-neutral-500">
                    Tuổi sau trồng: {ageMonths} tháng
                  </div>
                </div>

                {/* Vườn */}
                <div className="grid gap-1">
                  <Label>Vườn / vị trí</Label>
                  <Input
                    value={garden}
                    onChange={(e) => setGarden(e.target.value)}
                    placeholder="VD: Vườn số 3 – FPT"
                  />
                </div>

                {/* Loại đất */}
                <div className="grid gap-1">
                  <Label>Loại đất</Label>
                  <Input
                    value={soil}
                    onChange={(e) => setSoil(e.target.value)}
                    placeholder="VD: Đất đỏ, thịt nhẹ…"
                  />
                </div>

                {/* Vùng */}
                <div className="grid gap-1">
                  <Label>Vùng</Label>
                  <Input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="VD: Đồng bằng…"
                  />
                </div>

                {/* Mục tiêu chăm sóc */}
                <div className="md:col-span-2 grid gap-1">
                  <Label>Mục tiêu chăm sóc</Label>
                  <Input
                    value={careGoal}
                    onChange={(e) => setCareGoal(e.target.value)}
                  />
                </div>

                {/* Ghi chú */}
                <div className="md:col-span-2 grid gap-1">
                  <Label>Ghi chú</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Thông tin thêm: nguồn giống, lịch tưới hiện tại…"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gợi ý */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Gợi ý công việc khởi tạo</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-700">
                <ul className="list-disc ml-5 space-y-1">
                  <li>Tạo lịch tưới theo thời tiết địa phương.</li>
                  <li>Nhắc lịch bón phân định kỳ (NPK/Kali).</li>
                  <li>Theo dõi sâu bệnh phổ biến và cảnh báo sớm.</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Tạo cây
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCode(genCode())}
              >
                Tạo mã khác
              </Button>
            </div>
          </div>

          {/* RIGHT – preview */}
          <div className="space-y-6">
            <Card className="rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border bg-white overflow-hidden">
                  <div className="h-40 w-full bg-neutral-100 grid place-items-center">
                    <ImageIcon className="h-6 w-6 text-neutral-400" />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">
                        {species?.commonName}
                      </div>
                      <Badge variant="secondary">{phase}</Badge>
                    </div>
                    <div className="text-xs text-neutral-600">#{code}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <Field label="Tuổi" value={`${ageMonths} tháng`} />
                      <Field label="Vị trí" value={garden || "—"} />
                      <Field label="Giống" value={variety} />
                      <Field label="Trạng thái" value={status} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lưu ý */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-4 w-4" />Lưu ý khi nhập liệu
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-700">
                <ul className="list-disc ml-5 space-y-1">
                  <li>Ngày trồng dùng để ước tính tuổi cây.</li>
                  <li>Nếu trồng nhiều cây cùng lô, số lượng sẽ gom nhóm.</li>
                  <li>Luôn có thể sửa lại giai đoạn sinh trưởng.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-2">
      <div className="text-neutral-500 text-xs sm:w-28">{label}</div>
      <div className="text-neutral-900 text-sm font-medium break-words">
        {value}
      </div>
    </div>
  );
}
