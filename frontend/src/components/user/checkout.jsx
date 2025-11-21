import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, RefreshCw, Copy, QrCode } from "lucide-react";
import * as QRCodeNS from "react-qr-code"; // handle both CJS/ESM shapes to avoid React #130 invalid element type
const QR = (QRCodeNS && "default" in QRCodeNS ? QRCodeNS.default : QRCodeNS);


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
  <div className="grid grid-cols-[160px_1fr] items-start gap-2 py-2">
    <div className="text-sm text-muted-foreground">{toStr(label)}</div>
    <div className="text-sm flex items-center gap-2">
      <span className="font-medium break-words leading-6">{toStr(value)}</span>
      {copy != null && toStr(copy) !== "" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => navigator.clipboard?.writeText?.(toStr(copy))}
          title={`Sao chép ${toStr(label)}`}
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
);

/* ======================== Main Component ======================= */
export default function MamMoiQrCheckout({ order: orderProp, bank: bankProp }) {
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
    <div data-fluid-page className="min-h-screen w-full bg-[#f6f8f7] dark:bg-background px-5 py-8">
      <div data-fluid-shell className="mx-auto max-w-6xl grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
        {/* LEFT: QR & bank info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <QrCode className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-xl">Quét QR để thanh toán</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-600">VNPAY</Badge>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  if (typeof window !== "undefined") window.location.reload();
                }}
              >
                <RefreshCw className="h-4 w-4" /> Tạo QR mới
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-[320px_1fr]">
            {/* QR block */}
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-xl border bg-white p-4">
                {/* Ensure value is a string & the component is callable */}
                {QR && QR.$$typeof ? (
                  <QR value={qrValue} size={260} />
                ) : (
                  <div className="text-xs text-red-600">QR component not loaded</div>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" /> Hiệu lực còn:
                <span className="font-medium text-foreground">{mm}:{ss}</span>
              </div>
            </div>

            {/* Bank details */}
            <div className="space-y-1">
              <Line label="Ngân hàng" value={bank.name} />
              <Line label="Số tài khoản" value={bank.account} copy={bank.account} />
              <Line label="Chủ tài khoản" value={bank.holder} />
              <Line label="Số tiền" value={currency(bank.amount)} />
              <Line label="Nội dung" value={bank.note} copy={bank.note} />

              <Separator className="my-3" />

              <div className="flex items-start gap-3">
                <Checkbox id="auto-reconcile" />
                <label htmlFor="auto-reconcile" className="text-sm leading-6">
                  <span className="font-medium">Đối soát tự động (demo).</span>
                  <br />
                  <span className="text-muted-foreground">
                    Sau khi chuyển khoản, hóa đơn sẽ được gửi qua email.
                  </span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Order summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Thông tin đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              <div className="grid grid-cols-[160px_1fr] py-2">
                <div className="text-sm text-muted-foreground">Mã đơn</div>
                <div className="text-sm font-medium">{toStr(order.code)}</div>
              </div>
              <div className="grid grid-cols-[160px_1fr] py-2">
                <div className="text-sm text-muted-foreground">Người thanh toán</div>
                <div className="text-sm font-medium">{toStr(order.payer)}</div>
              </div>
              <div className="grid grid-cols-[160px_1fr] py-2">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="text-sm font-medium">{toStr(order.email)}</div>
              </div>
              <div className="grid grid-cols-[160px_1fr] py-2">
                <div className="text-sm text-muted-foreground">Gói</div>
                <div className="text-sm font-medium">{toStr(order.plan)}</div>
              </div>
              <div className="grid grid-cols-[160px_1fr] py-2">
                <div className="text-sm text-muted-foreground">Kỳ hạn</div>
                <div className="text-sm font-medium">{toStr(order.period)}</div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-[160px_1fr] items-center py-1">
                <div className="text-sm text-muted-foreground">Tạm tính</div>
                <div className="text-sm text-right font-medium">{currency(order.subtotal)}</div>
              </div>
              <div className="grid grid-cols-[160px_1fr] items-center py-1">
                <div className="text-sm text-muted-foreground">Phí QR</div>
                <div className="text-sm text-right font-medium">{currency(order.fee)}</div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-medium">THANH TOÁN</div>
                <div className="text-2xl font-semibold text-emerald-600">{currency(total)}</div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">* Hóa đơn sẽ gửi về email sau khi kích hoạt.</p>
            </div>
          </CardContent>
        </Card>

        {/* BOTTOM: Steps */}
        <div className="md:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Hướng dẫn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <Step number={1} text="Mở app ngân hàng và chọn Quét QR" />
                <Step number={2} text="Kiểm tra số tiền & nội dung (mã đơn + TXID)" />
                <Step number={3} text="Hoàn tất chuyển khoản - bấm Xác nhận" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Step({ number, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-7 w-7 rounded-full border flex items-center justify-center text-sm font-semibold">{toStr(number)}</div>
      <div className="text-sm leading-6">{toStr(text)}</div>
    </div>
  );
}
