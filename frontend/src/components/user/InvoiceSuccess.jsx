import React, { useMemo, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Check, Printer, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LivingBackground } from '@/components/background';

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

// Extract transaction ID from bank note (e.g., "TXD4EWLO" from "[SUB-STARTER-03933] Thanh toan goi Starter - TXD4EWLO")
const extractTransactionId = (note) => {
  if (!note) return "";
  const match = note.match(/- ([A-Z0-9]+)$/);
  return match ? match[1] : "";
};

export default function InvoiceSuccess({ order: orderProp, bank: bankProp, transactionId: transactionIdProp }) {
  const location = useLocation();
  const [showNotification, setShowNotification] = useState(true);
  
  // ====== Get data from location.state FIRST (fastest), then props, then defaults ======
  // This ensures NO API FETCH - data comes directly from checkout navigation
  const stateData = location.state || {};
  const stateOrder = stateData.order || orderProp;
  const stateBank = stateData.bank || bankProp;
  const stateTransactionId = stateData.transactionId || transactionIdProp;
  
  // ====== Safe data (read from state immediately - NO DELAY) ======
  const order = {
    code: toStr(stateOrder?.code) || "SUB-STARTER-03933",
    payer: toStr(stateOrder?.payer) || "Quân Nguyễn",
    email: toStr(stateOrder?.email) || "NHQ2374@gmail.com",
    plan: toStr(stateOrder?.plan) || "Starter - Chăm sóc cây ăn quả",
    period: toStr(stateOrder?.period) || "1 tháng (gia hạn tự động)",
    subtotal: Number(stateOrder?.subtotal ?? 490000),
    fee: Number(stateOrder?.fee ?? 0),
  };

  const bank = {
    name: toStr(stateBank?.name) || "VCB",
    account: toStr(stateBank?.account) || "0123456789",
    holder: toStr(stateBank?.holder) || "CONG TY TNHH MAM MOI",
    amount: Number(stateBank?.amount ?? order.subtotal + order.fee),
    note: toStr(stateBank?.note) || "[SUB-STARTER-03933] Thanh toan goi Starter - TXD4EWLO",
  };

  const total = useMemo(() => Number(order.subtotal) + Number(order.fee), [order.subtotal, order.fee]);
  
  // Extract transaction ID from note or use prop
  const transactionId = toStr(stateTransactionId) || extractTransactionId(bank.note) || "Tv-DEMO123";
  
  // Auto-hide notification after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  // Format current date/time
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString("vi-VN", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric" 
  });
  const timeStr = currentDate.toLocaleTimeString("vi-VN", { 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit" 
  });

  return (
    <>
      {/* ✅ Nền sống */}
      <LivingBackground
        baseColor={PALETTE.bg}
        palette={[PALETTE.leaf, PALETTE.ivory, PALETTE.accent]}
        density={28}
      />

      {/* ✅ Thông báo màu trắng nhẹ */}
      {showNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg px-6 py-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-sm font-medium text-gray-800">
              Thanh toán thành công! Đang tải hóa đơn...
            </p>
          </div>
        </div>
      )}

      {/* UI trên nền sống */}
      <div className="relative min-h-screen pt-[64px] z-10 flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-4xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-3xl">
          <CardContent className="p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              {/* Animated Success Icon */}
              <div className="relative inline-flex items-center justify-center mb-4">
                {/* Outer ripple rings */}
                <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping"></div>
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                
                {/* Glowing background circle with rotation */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 blur-xl opacity-60"
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{ 
                    rotate: {
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    },
                    scale: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                    opacity: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                ></motion.div>
                
                {/* Main circle with gradient */}
                <motion.div 
                  className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    duration: 0.6
                  }}
                >
                  {/* Inner white circle with subtle pulse */}
                  <motion.div 
                    className="absolute inset-2 rounded-full bg-white"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  ></motion.div>
                  
                  {/* Animated checkmark */}
                  <motion.svg 
                    className="relative w-10 h-10 text-emerald-600 z-10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.3
                    }}
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 0.6,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.svg>
                  
                  {/* Sparkle particles */}
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0.2
                    }}
                  ></motion.div>
                  <motion.div 
                    className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0.4
                    }}
                  ></motion.div>
                  <motion.div 
                    className="absolute top-0 -left-2 w-2.5 h-2.5 bg-emerald-300 rounded-full"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0.6
                    }}
                  ></motion.div>
                </motion.div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                Thanh toán thành công
              </h1>
             
            </div>

            {/* Invoice Details */}
            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Hóa đơn
                  </h2>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900">
                      Thông tin khách hàng
                    </p>
                    <p className="text-sm text-gray-700">{toStr(order.payer)}</p>
                    <p className="text-sm text-gray-700">{toStr(order.email)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700 mb-4">
                    {timeStr} {dateStr}
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900">
                      Đơn vị nhận
                    </p>
                    <p className="text-sm text-gray-700">Công ty TNHH Mầm Mới</p>
                    <p className="text-sm text-gray-700">MST: 0312345678</p>
                    <p className="text-sm text-gray-700">
                      177 West Street, Linh Đàm, Hà Nội
                    </p>
                  </div>
                </div>
              </div>

              {/* Mã đơn và Mã giao dịch - Tiêu đề in đậm */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Mã đơn:</p>
                  <p className="text-base font-semibold text-emerald-600 mb-1">
                    {toStr(order.code)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Hình thức: Chuyển khoản QR (VNPay)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 mb-2">Mã giao dịch:</p>
                  <p className="text-base font-semibold text-emerald-600 mb-1">
                    {transactionId}
                  </p>
                  <p className="text-xs text-gray-600">
                    GÓI: {toStr(order.plan)}
                  </p>
                </div>
              </div>

              <Separator className="my-5 bg-gray-200" />

              {/* Items Table */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium text-gray-900 pb-2 border-b border-gray-200">
                  <span>Nội dung</span>
                  <span>Thành tiền</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {toStr(order.plan)} – Kỳ hạn {toStr(order.period)}
                    </span>
                    <span className="text-gray-900 font-medium">{currency(order.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Phí Vat</span>
                    <span className="text-gray-900 font-medium">{currency(order.fee)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                  <span className="text-emerald-600">TỔNG CỘNG</span>
                  <span className="text-emerald-600">{currency(total)}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-sm text-gray-600">
                * Bản sao hóa đơn đã được gửi tới {toStr(order.email)}.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  <Printer className="w-4 h-4" />
                  In
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  <Download className="w-4 h-4" />
                  Tải PDF (demo)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
