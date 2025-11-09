import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, User, Calendar } from "lucide-react";

/* --- Demo data --- */
const PAYMENT_HISTORY = [
  { id: 1, service: "Dịch Vụ A", amount: 500000, date: "01/10/2025" },
  { id: 2, service: "Dịch Vụ B", amount: 250000, date: "02/10/2025" },
  { id: 3, service: "Dịch Vụ C", amount: 1000000, date: "05/10/2025" },
];

export default function PaymentHistory() {
  const totalAmount = useMemo(() => PAYMENT_HISTORY.reduce((sum, p) => sum + p.amount, 0), []);

  return (
    <div className="relative min-h-screen pt-[64px] px-6 xl:px-10 2xl:px-12">
      <section className="relative overflow-hidden mb-6">
        <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">Lịch sử thanh toán</h1>
        <p className="text-white/85 text-sm md:text-base">
          Xem tất cả các giao dịch đã thực hiện và tổng số tiền đã thanh toán.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl px-4 py-3 flex items-center justify-between text-[13px] border border-white/15 bg-white/10 text-white">
          <span>Tổng giao dịch</span>
          <span className="font-semibold">{PAYMENT_HISTORY.length}</span>
        </div>
        <div className="rounded-xl px-4 py-3 flex items-center justify-between text-[13px] border border-white/15 bg-white/10 text-white">
          <span>Tổng số tiền</span>
          <span className="font-semibold">{totalAmount.toLocaleString()} VNĐ</span>
        </div>
      </section>

      {/* Payment cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PAYMENT_HISTORY.map((p) => (
          <Card key={p.id} className="rounded-3xl p-4 bg-white/95 shadow-md">
            <CardContent className="flex flex-col gap-2">
              <div className="text-sm text-neutral-500">Dịch Vụ</div>
              <div className="font-semibold text-neutral-800 flex items-center gap-2">
                <User className="w-4 h-4" /> {p.service}
              </div>
              <div className="text-sm text-neutral-500 mt-1">Số tiền</div>
              <div className="font-semibold text-neutral-800">{p.amount.toLocaleString()} VNĐ</div>
              <div className="text-sm text-neutral-500 mt-1">Ngày</div>
              <div className="flex items-center gap-2 text-neutral-800">
                <Calendar className="w-4 h-4" /> {p.date}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {PAYMENT_HISTORY.length === 0 && (
        <div className="text-center text-white/70 py-10">Chưa có giao dịch nào</div>
      )}
    </div>
  );
}