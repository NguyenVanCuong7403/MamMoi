import React, { useMemo, useState } from "react";
import { Search, Filter, Sprout, Calendar, MapPin, Plus, Hash, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// ===== Demo data (no TS types) =====
const TREES = [
  {
    id: "T-001",
    commonName: "Xoài Cát Chu",
    variety: "Giống địa phương",
    plantedAt: "2023-04-15",
    location: "Vườn số 1 – FPT",
    phase: "Sinh trưởng thân lá",
    status: "active",
    caretaker: "Quân",
    stateNote: "Lá vàng",
    img: "https://images.unsplash.com/photo-1591781862772-b0b6b1f88b68?q=80&w=1200&auto=format&fit=crop",
    todos: [
      { text: "Tưới giữ ẩm 70–80%", priority: "medium", due: "Hôm nay" },
      { text: "Bón gốc NPK 16-16-8", priority: "high", due: "Quá hạn 2 ngày" },
      { text: "Tỉa cành trong tán", priority: "low", due: "18/10/2025" },
    ],
  },
  {
    id: "T-002",
    commonName: "Sầu riêng Ri6",
    variety: "Ri6",
    plantedAt: "2022-10-01",
    location: "Vườn số 2 – FPT",
    phase: "Ra hoa",
    status: "paused",
    caretaker: "Quân",
    stateNote: "Không có",
    img: "https://images.unsplash.com/photo-1604916287593-0710ae94f43f?q=80&w=1200&auto=format&fit=crop",
    todos: [
      { text: "Phun Bo + Ca trước nở", priority: "high", due: "Hôm nay" },
      { text: "Theo dõi ẩm 70–80%", priority: "low", due: "17/10/2025" },
    ],
  },
  {
    id: "T-003",
    commonName: "Bưởi Da Xanh",
    variety: "Da xanh",
    plantedAt: "2020-08-20",
    location: "Vườn số 3 – FPT",
    phase: "Đậu/nuôi quả",
    status: "active",
    caretaker: "Quân",
    stateNote: "Không có",
    img: "https://images.unsplash.com/photo-1613758947306-0cb0d5859d6?q=80&w=1200&auto=format&fit=crop",
    todos: [
      { text: "Bao trái lứa chính", priority: "medium", due: "Hôm nay" },
      { text: "Tăng Kali, hạn chế N", priority: "high", due: "20/10/2025" },
    ],
  },
  {
    id: "T-004",
    commonName: "Chuối già Nam Mỹ",
    variety: "Già Nam Mỹ",
    plantedAt: "2021-02-10",
    location: "Vườn số 4 – FPT",
    phase: "Sau thu",
    status: "stopped",
    caretaker: "Quân",
    stateNote: "—",
    img: "https://images.unsplash.com/photo-1587731506375-4bcd2c9da3b3?q=80&w=1200&auto=format&fit=crop",
    todos: [{ text: "Vệ sinh vườn, dọn tàn dư", priority: "low", due: "Nhắc" }],
  },
];

function monthsBetween(aStr, b = new Date()) {
  const a = new Date(aStr + "T00:00:00");
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
}

function StatusPill({ status }) {
  const map = {
    active: { label: "Đang chăm sóc", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    paused: { label: "Tạm dừng", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    stopped: { label: "Dừng hoạt động", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  };
  const s = map[status] || map.active;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {s.label}
    </span>
  );
}

function PhasePill({ phase }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border bg-sky-50 text-sky-700 border-sky-200">
      <Sprout className="h-3.5 w-3.5" /> {phase}
    </span>
  );
}

function TodoRow({ text, due, priority }) {
  const dueColor = String(due).toLowerCase().includes("quá hạn")
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : String(due).toLowerCase().includes("hôm nay")
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-neutral-50 text-neutral-600 border-neutral-200";
  const prColor =
    priority === "high"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : priority === "medium"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return (
    <li className="flex items-center justify-between gap-2 py-1">
      <span className="text-sm text-neutral-800">{text}</span>
      <span className="inline-flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${prColor}`}>{priority}</span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${dueColor}`}>{due}</span>
      </span>
    </li>
  );
}

export default function TreeManagement() {
  const [trees, setTrees] = useState(TREES);
  const [q, setQ] = useState("");
  const [st, setSt] = useState("Tất cả");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    return trees.filter((t) => {
      const matchQ = !q || [t.id, t.commonName, t.variety, t.location].join(" ").toLowerCase().includes(q.toLowerCase());
      const matchSt = st === "Tất cả" || t.status === st;
      return matchQ && matchSt;
    });
  }, [trees, q, st]);

  function openEdit(t) {
    setEditing({ ...t });
    setEditOpen(true);
  }

  function saveEdit() {
    if (!editing) return;
    setTrees((prev) => prev.map((x) => (x.id === editing.id ? editing : x)));
    setEditOpen(false);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://cdn-icons-png.flaticon.com/512/7666/7666766.png" alt="logo" className="h-7 w-7" />
            <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700">
              <a className="hover:text-emerald-700" href="#">Trang chủ</a>
              <a className="hover:text-emerald-700" href="#">Giới thiệu</a>
              <a className="hover:text-emerald-700" href="#">Danh mục</a>
              <a className="hover:text-emerald-700" href="#">Liên hệ</a>
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input placeholder="Tìm kiếm..." className="pl-9 w-56" />
            </div>
            <div className="h-8 w-8 rounded-full bg-emerald-600 text-white grid place-items-center text-xs">MM</div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1600&auto=format&fit=crop"
          className="h-48 md:h-56 w-full object-cover"
        />
        <div className="absolute inset-0 bg-emerald-950/70" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-7xl px-6 flex w-full items-center justify-between">
            <div>
              <h1 className="text-white text-3xl md:text-4xl font-semibold">Vườn cây ăn quả của tôi</h1>
              <p className="text-white/90 mt-1 text-sm">Theo dõi tuổi cây, trạng thái & kế hoạch chăm sóc.</p>
              <Button className="mt-4 bg-white text-emerald-900 hover:bg-white/90 gap-2" size="sm">
                <Plus className="h-4 w-4" />Thêm cây ăn quả
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="rounded-2xl bg-white/10 border border-white/20 text-white p-4 w-56">
                <div className="text-sm font-medium">Hanoi, Vietnam</div>
                <div className="text-3xl font-semibold">29°</div>
                <div className="text-xs opacity-80">Nắng nhẹ · Gió 5km/h</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <section className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên/ID/vị trí..." className="pl-9" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />Trạng thái: {st}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["Tất cả", "active", "paused", "stopped"].map((s) => (
                <DropdownMenuItem key={s} onClick={() => setSt(s)}>
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </section>

        {/* Cards grid */}
        <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <Card key={t.id} className="rounded-xl overflow-hidden">
              <img src={t.img} alt={t.commonName} className="h-44 w-full object-cover" />
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{t.commonName}</div>
                    <div className="text-xs text-neutral-500"># {t.id}</div>
                  </div>
                  <StatusPill status={t.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-neutral-500">Trạng thái sinh trưởng</div>
                    <div className="mt-1">
                      <PhasePill phase={t.phase} />
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Tuổi cây</div>
                    <div className="mt-1 flex items-center gap-2 text-neutral-800">
                      <Calendar className="h-4 w-4" />
                      {monthsBetween(t.plantedAt)} tháng
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-neutral-500">Nhân viên được chăm sóc</div>
                    <div className="mt-1 flex items-center gap-2 text-neutral-800">
                      <User className="h-4 w-4" />
                      {t.caretaker}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Trạng thái</div>
                    <div className="mt-1 text-neutral-800">{t.stateNote || "—"}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-neutral-500 text-sm">Việc cần làm</div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const n = (t.todos || []).filter((x) => String(x.due).toLowerCase().includes("quá hạn")).length;
                        return n > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-xs border bg-rose-50 text-rose-700 border-rose-200">
                            {n} Quá hạn
                          </span>
                        ) : null;
                      })()}
                      <Button size="sm" variant="outline">
                        Kế hoạch chăm sóc
                      </Button>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {(t.todos || []).map((x, i) => (
                      <TodoRow key={i} text={x.text} due={x.due} priority={x.priority} />
                    ))}
                  </ul>
                </div>

                <Separator />
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5" />
                    {t.id}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {t.location}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 mt-2">
                  Cập nhật vào ngày {new Date().toLocaleDateString("vi-VN")}
                </div>
                <div className="pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                    Sửa thông tin cây
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {filtered.length === 0 && (
          <div className="text-center text-neutral-500 py-10">Không có cây phù hợp</div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sửa thông tin cây</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label>Tên cây</Label>
                <Input
                  value={editing.commonName}
                  onChange={(e) => setEditing({ ...editing, commonName: e.target.value })}
                />
              </div>
              <div className="grid gap-1">
                <Label>Giống</Label>
                <Input
                  value={editing.variety}
                  onChange={(e) => setEditing({ ...editing, variety: e.target.value })}
                />
              </div>
              <div className="grid gap-1">
                <Label>Vị trí</Label>
                <Input
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                />
              </div>
              <div className="grid gap-1">
                <Label>Giai đoạn</Label>
                <Input
                  value={editing.phase}
                  onChange={(e) => setEditing({ ...editing, phase: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={saveEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white mt-10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm">
          <div className="font-semibold">Mầm Mới</div>
          <div className="opacity-80">Hỗ trợ chăm sóc cây ăn quả cho nông hộ.</div>
          <Separator className="my-4 bg-white/20" />
          <div className="opacity-70">
            © {new Date().getFullYear()} Mam Moi • Privacy • Terms
          </div>
        </div>
      </footer>
    </div>
  );
}
