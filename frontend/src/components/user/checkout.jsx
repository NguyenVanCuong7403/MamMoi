import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, RefreshCw, Copy, QrCode } from "lucide-react";
import { LivingBackground } from "@/components/background";
import * as QRCodeNS from "react-qr-code"; // handle both CJS/ESM shapes to avoid React #130 invalid element type
const QR = (QRCodeNS && "default" in QRCodeNS ? QRCodeNS.default : QRCodeNS);

/* =========================================================
   Theme & constants
========================================================= */
const BG = "#1F302F";
const PALETTE = { 
  bg: "#1F302F", 
  leaf: "#D1DFB6", 
  ivory: "#FBFFDF", 
  accent: "#FFFFA5" 
};


/**
 * MamMoi QR Checkout Page (JS + React + Tailwind + shadcn/ui + lucide)
 *
 * Patch: Harden string conversion (toStr) so React never receives objects
 * as children (fixes React error #130). Add more self-tests.
 */

/* ========================== Utilities ========================== */
const safeStringify = (obj) => {
  try {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (k, v) => {
        if (typeof v === "bigint") return String(v);
        if (typeof v === "symbol") return String(v);
        if (typeof v === "function") return `[fn ${v.name || "anonymous"}]`;
        if (v instanceof Date) return v.toISOString();
        if (typeof v === "object" && v !== null) {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);
        }
        return v;
      },
      0
    );
  } catch {
    return "";
  }
};

const toStr = (v, fallback = "") => {
  try {
    if (v == null) return fallback;
    const t = typeof v;
    if (t === "string") return v;
    if (t === "number" || t === "boolean" || t === "bigint" || t === "symbol") return String(v);
    if (v instanceof Date) return v.toISOString();
    if (Array.isArray(v)) return v.map((x) => toStr(x, "")).join(", ");
    if (t === "function") return `[fn ${v.name || "anonymous"}]`;
    // objects & everything else
    const s = safeStringify(v);
    return typeof s === "string" ? s : fallback;
  } catch {
    return fallback;
  }
};

const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Number(v || 0)) + " đ";

const Line = ({ label, value, copy }) => (
  <div className="grid grid-cols-[120px_1fr] items-start gap-0.5 py-2">
    <div className="text-base text-white/80 shrink-0">{toStr(label)}</div>
    <div className="text-base flex items-center gap-2 min-w-0">
      <span className="font-medium break-words leading-7 text-white">{toStr(value)}</span>
      {copy != null && toStr(copy) !== "" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-white hover:bg-white/20"
          onClick={() => navigator.clipboard?.writeText?.(toStr(copy))}
          title={`Sao chép ${toStr(label)}`}
        >
          <Copy className="h-5 w-5" />
        </Button>
      )}
    </div>
  </div>
);

/* ======================== Main Component ======================= */
export default function MamMoiQrCheckout({ order: orderProp, bank: bankProp }) {
  const navigate = useNavigate();
  
  // ====== Safe data (can be replaced by API props) ======
  const order = {
    code: toStr(orderProp?.code) || "SUB-STARTER-03933",
    payer: toStr(orderProp?.payer) || "Quân Nguyễn",
    email: toStr(orderProp?.email) || "NHQ2374@gmail.com",
    plan: toStr(orderProp?.plan) || "Starter - Chăm sóc cây ăn quả",
    period: toStr(orderProp?.period) || "1 tháng (gia hạn tự động)",
    subtotal: Number(orderProp?.subtotal ?? 490000),
    fee: Number(orderProp?.fee ?? 0),
  };

  const bank = {
    name: toStr(bankProp?.name) || "VCB",
    account: toStr(bankProp?.account) || "0123456789",
    holder: toStr(bankProp?.holder) || "CONG TY TNHH MAM MOI",
    amount: Number(bankProp?.amount ?? order.subtotal + order.fee),
    note:
      toStr(bankProp?.note) ||
      "[SUB-STARTER-03933] Thanh toan goi Starter - TXD4EWLO",
  };

  const total = useMemo(() => Number(order.subtotal) + Number(order.fee), [order.subtotal, order.fee]);

  // ====== Countdown (15:00) ======
  const [remain, setRemain] = useState(15 * 60);
  useEffect(() => {
    const id = setInterval(() => setRemain((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(remain / 60)).padStart(2, "0");
  const ss = String(remain % 60).padStart(2, "0");

  // ====== Payment Status Polling ======
  const [isPolling, setIsPolling] = useState(false);
  const [autoReconcile, setAutoReconcile] = useState(false);
  
  // Extract transaction ID from bank note
  const extractTransactionId = (note) => {
    if (!note) return "";
    const match = note.match(/- ([A-Z0-9]+)$/);
    return match ? match[1] : "";
  };
  
  const transactionId = extractTransactionId(bank.note) || "Tv-DEMO123";

  // Polling function to check payment status (demo - replace with real API)
  useEffect(() => {
    if (!autoReconcile || isPolling) return;
    
    setIsPolling(true);
    let pollCount = 0;
    const maxPolls = 60; // 60 seconds max
    
    const pollInterval = setInterval(() => {
      pollCount++;
      
      // Demo: Simulate payment success after 3 seconds
      // In production, replace with actual API call to check payment status
      if (pollCount >= 3) {
        clearInterval(pollInterval);
        setIsPolling(false);
        
        // Navigate immediately with data - NO API FETCH
        navigate("/invoice", {
          state: {
            order,
            bank,
            transactionId,
          },
          replace: true, // Replace history to prevent back button
        });
      }
      
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        setIsPolling(false);
      }
    }, 1000); // Poll every 1 second
    
    return () => clearInterval(pollInterval);
  }, [autoReconcile, isPolling, navigate, order, bank, transactionId]);

  // ====== QR string (ALWAYS a string) ======
  const qrValue = useMemo(
    () => [toStr(order.code), toStr(bank.account), toStr(bank.amount)].join("|"),
    [order.code, bank.account, bank.amount]
  );

  /* ====================== Runtime Self-Tests =====================
   * We keep existing tests and ADD more cases to ensure toStr
   * always yields strings across edge types.
   */
  useEffect(() => {
    const circ = { a: 1 }; circ.self = circ;
    const TESTS = [
      // existing
      { name: "qrValue is non-empty string", pass: typeof qrValue === "string" && qrValue.length > 0 },
      { name: "currency returns string", pass: typeof currency(12345) === "string" && currency(1).endsWith(" đ") },
      { name: "no object children in Line", pass: typeof toStr({ a: 1 }) === "string" },
      // new coverage
      { name: "toStr(undefined)", pass: typeof toStr(undefined) === "string" },
      { name: "toStr(null)", pass: typeof toStr(null) === "string" },
      { name: "toStr(array)", pass: typeof toStr([1, "x"]) === "string" },
      { name: "toStr(date)", pass: typeof toStr(new Date(0)) === "string" },
      { name: "toStr(function)", pass: typeof toStr(function f(){}) === "string" },
      { name: "toStr(symbol)", pass: typeof toStr(Symbol("x")) === "string" },
      { name: "toStr(bigint)", pass: typeof toStr(10n) === "string" },
      { name: "toStr(circular)", pass: typeof toStr(circ) === "string" },
    ];
    TESTS.forEach((t, i) => {
      console.assert(t.pass, `Test ${i + 1} failed: ${t.name}`);
      if (!t.pass) console.error("\u26A0\uFE0F Self-test failed:", t);
    });
    //console.log("QR:", QR);
  }, [qrValue]);

  // ====== UI ======
  return (
    <>
      {/* ✅ Nền sống */}
      <LivingBackground
        baseColor={PALETTE.bg}
        palette={[PALETTE.leaf, PALETTE.ivory, PALETTE.accent]}
        density={28}
      />

      {/* UI trên nền sống */}
      <div className="relative min-h-screen pt-[64px] z-10 flex items-center justify-center px-6 py-12">
        <div className="w-full grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
          {/* LEFT: QR & bank info */}
          <Card className="border border-white/20 bg-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
              <div className="flex items-center gap-4">
                <QrCode className="h-7 w-7 text-emerald-400" />
                <CardTitle className="text-2xl font-bold text-white">Quét QR để thanh toán</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/90 hover:bg-emerald-500/90 text-white text-sm px-3 py-1.5">VNPAY</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 px-4"
                  onClick={() => {
                    if (typeof window !== "undefined") window.location.reload();
                  }}
                >
                  <RefreshCw className="h-5 w-5" /> Tạo QR mới
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-[380px_1fr] pt-2">
              {/* QR block */}
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-2xl border-2 border-white/30 bg-white/95 p-6 shadow-lg">
                  {/* Ensure value is a string & the component is callable */}
                  {QR && QR.$$typeof ? (
                    <QR value={qrValue} size={320} />
                  ) : (
                    <div className="text-sm text-red-600">QR component not loaded</div>
                  )}
                </div>
                <div className="text-base text-white/90 flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Hiệu lực còn:
                  <span className="font-semibold text-white">{mm}:{ss}</span>
                </div>
              </div>

            {/* Bank details */}
            <div className="space-y-2">
              <Line label="Ngân hàng" value={bank.name} />
              <Line label="Số tài khoản" value={bank.account} copy={bank.account} />
              <Line label="Chủ tài khoản" value={bank.holder} />
              <Line label="Số tiền" value={currency(bank.amount)} />
              <Line label="Nội dung" value={bank.note} copy={bank.note} />

              <Separator className="my-5 bg-white/20" />

              <div className="flex items-start gap-4">
                <Checkbox 
                  id="auto-reconcile" 
                  className="mt-1" 
                  checked={autoReconcile}
                  onCheckedChange={(checked) => setAutoReconcile(checked === true)}
                />
                <label htmlFor="auto-reconcile" className="text-base leading-7 text-white">
                  <span className="font-semibold">Đối soát tự động (demo).</span>
                  <br />
                  <span className="text-white/70">
                    Sau khi chuyển khoản, hóa đơn sẽ được gửi qua email.
                  </span>
                  {isPolling && (
                    <span className="block mt-2 text-sm text-emerald-400">
                      Đang kiểm tra thanh toán...
                    </span>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Order summary */}
        <Card className="border border-white/20 bg-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-3xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-white">Thông tin đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-white/20">
              <div className="grid grid-cols-[200px_1fr] py-3">
                <div className="text-base text-white/80">Mã đơn</div>
                <div className="text-base font-medium text-white">{toStr(order.code)}</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] py-3">
                <div className="text-base text-white/80">Người thanh toán</div>
                <div className="text-base font-medium text-white">{toStr(order.payer)}</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] py-3">
                <div className="text-base text-white/80">Email</div>
                <div className="text-base font-medium text-white">{toStr(order.email)}</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] py-3">
                <div className="text-base text-white/80">Gói</div>
                <div className="text-base font-medium text-white">{toStr(order.plan)}</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] py-3">
                <div className="text-base text-white/80">Kỳ hạn</div>
                <div className="text-base font-medium text-white">{toStr(order.period)}</div>
              </div>

              <Separator className="my-5 bg-white/20" />

              <div className="grid grid-cols-[200px_1fr] items-center py-2">
                <div className="text-base text-white/80">Tạm tính</div>
                <div className="text-base text-right font-medium text-white">{currency(order.subtotal)}</div>
              </div>
              <div className="grid grid-cols-[200px_1fr] items-center py-2">
                <div className="text-base text-white/80">Phí VAT</div>
                <div className="text-base text-right font-medium text-white">{currency(order.fee)}</div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/20">
                <div className="text-lg font-semibold text-white">THANH TOÁN</div>
                <div className="text-3xl font-bold text-emerald-400">{currency(total)}</div>
              </div>
              <p className="mt-3 text-sm text-white/70">* Hóa đơn sẽ gửi về email sau khi kích hoạt.</p>
            </div>
          </CardContent>
        </Card>

        {/* BOTTOM: Steps */}
        <div className="md:col-span-2">
          <Card className="border border-white/20 bg-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-3xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold text-white">Hướng dẫn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-3">
                <Step number={1} text="Mở app ngân hàng và chọn Quét QR" />
                <Step number={2} text="Kiểm tra số tiền & nội dung (mã đơn + TXID)" />
                <Step number={3} text="Hoàn tất chuyển khoản - bấm Xác nhận" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}

function Step({ number, text }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-base font-bold text-white">{toStr(number)}</div>
      <div className="text-base leading-7 text-white pt-1">{toStr(text)}</div>
    </div>
  );
}
