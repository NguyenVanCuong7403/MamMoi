import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Section({
  id,
  title,
  icon: Icon,                 // ví dụ: Sprout, Activity
  gradient = "from-emerald-500 via-lime-400 to-emerald-600",
  actions,                    // nút "Cập nhật", "Đang chăm sóc"...
  children,
}) {
  return (
    <section id={id} className="relative">
      <Card className="relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 bg-white">
        {/* Thanh màu phân đoạn ở mép trên */}
        <div className={`absolute inset-x-0 -top-px h-1.5 bg-gradient-to-r ${gradient}`} />

        {/* Header dính để lướt vẫn thấy đang ở mục nào */}
        <header className="sticky -top-2 z-10 flex items-center justify-between gap-3 bg-white/90 backdrop-blur px-6 pt-4 pb-3">
          <div className="flex items-center gap-3">
            {Icon ? (
              <span className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-black/5 bg-slate-50">
                <Icon size={18} />
              </span>
            ) : null}
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </header>

        <CardContent className="px-6 pb-6 pt-2">{children}</CardContent>

        {/* Nhãn góc luôn hiện để quét mắt nhanh */}
        <div className="pointer-events-none absolute top-3 left-3">
          <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20">
            {title}
          </span>
        </div>
      </Card>
    </section>
  );
}
