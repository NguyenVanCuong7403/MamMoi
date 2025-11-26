import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, RefreshCw, Copy, QrCode, AlertCircle } from "lucide-react";
import { LivingBackground } from "@/components/background";
import PaymentRepository from "@/API/repositories/PaymentRepository";
import * as QRCodeNS from "react-qr-code";
const QR = (QRCodeNS && "default" in QRCodeNS ? QRCodeNS.default : QRCodeNS);

/* =========================================================
   Theme & constants
========================================================= */
const PALETTE = { 
  bg: "#1F302F", 
  leaf: "#D1DFB6", 
  ivory: "#FBFFDF", 
  accent: "#FFFFA5" 
};

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
export default function MamMoiQrCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get planId from location state or URL params
  const searchParams = new URLSearchParams(location.search);
  const planIdFromUrl = searchParams.get("planId");
  const planIdFromState = location.state?.planId;
  const planId = planIdFromState || planIdFromUrl || null;
  
  // State for checkout data from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  
  // Derived data from API response
  const order = checkoutData?.orderInfo || {
    code: "---",
    payer: "---",
    email: "---",
    plan: "---",
    period: "---",
    subtotal: 0,
    fee: 0,
  };
  
  const bank = checkoutData?.bankInfo || {
    name: "---",
    account: "---",
    holder: "---",
    amount: 0,
    note: "---",
  };
  
  const transactionId = checkoutData?.transactionId || "---";
  const orderCode = checkoutData?.orderCode || "";
  const expirationSeconds = checkoutData?.expirationSeconds || 900;

  // Fetch checkout data from API
  useEffect(() => {
    const fetchCheckout = async () => {
      if (!planId) {
        setError("Không tìm thấy thông tin gói đăng ký. Vui lòng chọn gói từ trang giá.");
        setLoading(false);
        return;
      }
      
      try {
        const response = await PaymentRepository.createCheckout({
          planId: parseInt(planId),
          returnUrl: `${window.location.origin}/invoice`,
          cancelUrl: `${window.location.origin}/price`,
        });
        
        if (response?.success) {
          setCheckoutData(response);
        } else {
          setError(response?.message || "Không thể tạo phiên thanh toán");
        }
      } catch (err) {
        console.error("Error creating checkout:", err);
        setError("Lỗi kết nối. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCheckout();
  }, [planId]);

  const total = useMemo(() => Number(order.subtotal || 0) + Number(order.fee || 0), [order.subtotal, order.fee]);

  // ====== Countdown ======
  const [remain, setRemain] = useState(expirationSeconds);
  useEffect(() => {
    if (checkoutData) {
      setRemain(checkoutData.expirationSeconds || 900);
    }
  }, [checkoutData]);
  
  useEffect(() => {
    if (remain <= 0) return;
    const id = setInterval(() => setRemain((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [remain]);
  
  const mm = String(Math.floor(remain / 60)).padStart(2, "0");
  const ss = String(remain % 60).padStart(2, "0");

  // ====== Payment Status Polling ======
  const [isPolling, setIsPolling] = useState(false);
  const [autoReconcile, setAutoReconcile] = useState(false);

  useEffect(() => {
    if (!autoReconcile || isPolling || !orderCode) return;
    
    setIsPolling(true);
    let pollCount = 0;
    const maxPolls = 180; // 3 minutes max
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      
      try {
        const status = await PaymentRepository.checkPaymentStatus(orderCode);
        
        if (status?.status === "Completed") {
          clearInterval(pollInterval);
          setIsPolling(false);
          
          // Navigate to invoice with data
          navigate("/invoice", {
            state: {
              order: {
                code: order.orderCode || orderCode,
                payer: order.payerName,
                email: order.payerEmail,
                plan: order.planName,
                period: order.period,
                subtotal: order.subtotal,
                fee: order.fee,
              },
              bank: {
                name: bank.bankName,
                account: bank.accountNumber,
                holder: bank.accountHolder,
                amount: bank.amount,
                note: bank.transferNote,
              },
              transactionId: status.transactionId || transactionId,
            },
            replace: true,
          });
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
      }
      
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        setIsPolling(false);
      }
    }, 2000); // Poll every 2 seconds
    
    return () => clearInterval(pollInterval);
  }, [autoReconcile, isPolling, orderCode, navigate, order, bank, transactionId]);

  // ====== QR string ======
  const qrValue = useMemo(() => {
    if (checkoutData?.qrCodeUrl) {
      return checkoutData.qrCodeUrl;
    }
    return [toStr(orderCode), toStr(bank.accountNumber), toStr(bank.amount)].join("|");
  }, [checkoutData, orderCode, bank]);

  // ====== Refresh/Create new QR ======
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await PaymentRepository.createCheckout({
        planId: parseInt(planId),
        returnUrl: `${window.location.origin}/invoice`,
        cancelUrl: `${window.location.origin}/price`,
      });
      
      if (response?.success) {
        setCheckoutData(response);
        setRemain(response.expirationSeconds || 900);
      } else {
        setError(response?.message || "Không thể tạo phiên thanh toán mới");
      }
    } catch (err) {
      console.error("Error refreshing checkout:", err);
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ====== Demo complete payment ======
  const handleDemoComplete = async () => {
    if (!orderCode) return;
    
    try {
      await PaymentRepository.demoCompletePayment(orderCode);
      // The polling will pick up the completed status
    } catch (err) {
      console.error("Error completing demo payment:", err);
    }
  };

  // ====== Loading State ======
  if (loading) {
    return (
      <>
        <LivingBackground
          baseColor={PALETTE.bg}
          palette={[PALETTE.leaf, PALETTE.ivory, PALETTE.accent]}
          density={28}
        />
        <div className="relative min-h-screen pt-[64px] z-10 flex items-center justify-center px-6 py-12">
          <Card className="border border-white/20 bg-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-3xl p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-lg">Đang tạo phiên thanh toán...</p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // ====== Error State ======
  if (error) {
    return (
      <>
        <LivingBackground
          baseColor={PALETTE.bg}
          palette={[PALETTE.leaf, PALETTE.ivory, PALETTE.accent]}
          density={28}
        />
        <div className="relative min-h-screen pt-[64px] z-10 flex items-center justify-center px-6 py-12">
          <Card className="border border-white/20 bg-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-3xl p-12 max-w-md">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-16 h-16 text-red-400" />
              <h2 className="text-white text-xl font-semibold">Không thể tạo thanh toán</h2>
              <p className="text-white/70">{error}</p>
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => navigate("/price")}
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  Chọn gói
                </Button>
                <Button
                  onClick={handleRefresh}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Thử lại
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // ====== Main UI ======
  return (
    <>
      <LivingBackground
        baseColor={PALETTE.bg}
        palette={[PALETTE.leaf, PALETTE.ivory, PALETTE.accent]}
        density={28}
      />

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
                <Badge className="bg-emerald-500/90 hover:bg-emerald-500/90 text-white text-sm px-3 py-1.5">PayOS</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 h-10 px-4"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-5 w-5" /> Tạo QR mới
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-[380px_1fr] pt-2">
              {/* QR block */}
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-2xl border-2 border-white/30 bg-white/95 p-6 shadow-lg">
                  {QR && QR.$$typeof ? (
                    <QR value={qrValue} size={320} />
                  ) : (
                    <div className="text-sm text-red-600">QR component not loaded</div>
                  )}
                </div>
                <div className="text-base text-white/90 flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Hiệu lực còn:
                  <span className={`font-semibold ${remain < 60 ? 'text-red-400' : 'text-white'}`}>
                    {mm}:{ss}
                  </span>
                </div>
              </div>

              {/* Bank details */}
              <div className="space-y-2">
                <Line label="Ngân hàng" value={bank.bankName} />
                <Line label="Số tài khoản" value={bank.accountNumber} copy={bank.accountNumber} />
                <Line label="Chủ tài khoản" value={bank.accountHolder} />
                <Line label="Số tiền" value={currency(bank.amount)} />
                <Line label="Nội dung" value={bank.transferNote} copy={bank.transferNote} />

                <Separator className="my-5 bg-white/20" />

                <div className="flex items-start gap-4">
                  <Checkbox 
                    id="auto-reconcile" 
                    className="mt-1" 
                    checked={autoReconcile}
                    onCheckedChange={(checked) => setAutoReconcile(checked === true)}
                  />
                  <label htmlFor="auto-reconcile" className="text-base leading-7 text-white">
                    <span className="font-semibold">Đối soát tự động.</span>
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
                
                {/* Demo button for testing */}
                {autoReconcile && (
                  <Button
                    onClick={handleDemoComplete}
                    className="mt-4 w-full bg-yellow-500/80 hover:bg-yellow-500 text-white"
                  >
                    Demo: Hoàn tất thanh toán
                  </Button>
                )}
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
                  <div className="text-base font-medium text-white">{toStr(order.orderCode || orderCode)}</div>
                </div>
                <div className="grid grid-cols-[200px_1fr] py-3">
                  <div className="text-base text-white/80">Người thanh toán</div>
                  <div className="text-base font-medium text-white">{toStr(order.payerName)}</div>
                </div>
                <div className="grid grid-cols-[200px_1fr] py-3">
                  <div className="text-base text-white/80">Email</div>
                  <div className="text-base font-medium text-white">{toStr(order.payerEmail)}</div>
                </div>
                <div className="grid grid-cols-[200px_1fr] py-3">
                  <div className="text-base text-white/80">Gói</div>
                  <div className="text-base font-medium text-white">{toStr(order.planName)}</div>
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
