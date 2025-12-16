import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Clock, RefreshCw, Copy, QrCode, AlertCircle } from "lucide-react";
import { LivingBackground } from "@/components/background";
import PaymentRepository from "@/API/repositories/PaymentRepository";
import * as QRCodeNS from "react-qr-code";
const QR = (QRCodeNS && "default" in QRCodeNS ? QRCodeNS.default : QRCodeNS);

/* ===================== UI ZOOM (similar to AddTreeNewScreen) ===================== */
const UI_ZOOM = 1.25;
const ZOOM_DISABLE_BREAKPOINT = 1180; // tablets & below should see full-size layout
function useZoomStyle() {
  const [style, setStyle] = useState({});

  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|Edg|OPR/.test(ua);

    const applyZoom = () => {
      const width = typeof window !== "undefined" ? window.innerWidth : 1920;
      const targetZoom = width <= ZOOM_DISABLE_BREAKPOINT ? 1 : UI_ZOOM;

      if (targetZoom === 1) {
        setStyle({});
        return;
      }

      if (isSafari) {
        setStyle({
          transform: `scale(${targetZoom})`,
          transformOrigin: "top center",
          width: `${100 / targetZoom}%`,
        });
      } else {
        setStyle({ zoom: targetZoom });
      }
    };

    applyZoom();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", applyZoom);
      return () => window.removeEventListener("resize", applyZoom);
    }
    return undefined;
  }, []);

  return style;
}

/* ===================== RESPONSIVE QR PAYMENT STYLES ===================== */
const RESPONSIVE_QR_STYLES = `
.mm-qr-payment-card {
  font-size: clamp(0.875rem, 0.8rem + 0.3vw, 1rem);
}
.mm-qr-payment-card .mm-qr-title {
  font-size: clamp(1.125rem, 1rem + 0.5vw, 1.5rem);
}
.mm-qr-payment-card .mm-qr-label {
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
}
.mm-qr-payment-card .mm-qr-value {
  font-size: clamp(0.875rem, 0.8rem + 0.3vw, 1rem);
}
.mm-qr-payment-card .mm-qr-timer {
  font-size: clamp(0.875rem, 0.8rem + 0.3vw, 1rem);
}
@media (max-width: 1200px) {
  .mm-qr-payment-card {
    font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.9375rem);
  }
  .mm-qr-payment-card .mm-qr-title {
    font-size: clamp(1rem, 0.9rem + 0.4vw, 1.375rem);
  }
}
@media (max-width: 1279px) {
  .mm-qr-payment-card .mm-qr-content {
    display: flex !important;
    flex-direction: column !important;
    grid-template-columns: none !important;
  }
  .mm-qr-payment-card .mm-qr-content > * {
    width: 100% !important;
    max-width: 100% !important;
  }
}
@media (max-width: 900px) {
  .mm-qr-payment-card .mm-qr-bank-details {
    font-size: clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem);
  }
}
@media (max-width: 768px) {
  .mm-qr-payment-card {
    font-size: clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem);
  }
  .mm-qr-payment-card .mm-qr-title {
    font-size: clamp(0.9375rem, 0.85rem + 0.35vw, 1.25rem);
  }
}
@keyframes mm-dialog-enter {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9) translateY(20px);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.02) translateY(-2px);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) translateY(0);
  }
}
@keyframes mm-dialog-exit {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95) translateY(10px);
  }
}
.mm-cancel-dialog {
  max-width: min(90vw, 32rem) !important;
  width: calc(100% - 2rem) !important;
  max-height: calc(100vh - 4rem) !important;
  margin: 0 !important;
  left: 50% !important;
  top: 50% !important;
  position: fixed !important;
  box-sizing: border-box !important;
  will-change: transform, opacity, box-shadow;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  /* Override default shadcn animations */
  animation: none !important;
  transform: translate(-50%, -50%) !important;
  transition: none !important;
}
.mm-cancel-dialog[data-state="open"] {
  animation: mm-dialog-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
}
.mm-cancel-dialog[data-state="closed"] {
  animation: mm-dialog-exit 0.25s cubic-bezier(0.4, 0, 1, 1) forwards !important;
}
/* Enable hover transitions after animation completes */
.mm-cancel-dialog[data-state="open"] {
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out !important;
}
.mm-cancel-dialog[data-state="open"]:hover {
  transform: translate(-50%, calc(-50% - 4px)) scale(1.02) !important;
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.5) !important;
}
/* Override shadcn default animation classes */
.mm-cancel-dialog.animate-in,
.mm-cancel-dialog.animate-out,
.mm-cancel-dialog[data-state="open"].animate-in,
.mm-cancel-dialog[data-state="closed"].animate-out {
  animation: none !important;
}
.mm-cancel-dialog * {
  box-sizing: border-box;
}
.mm-cancel-dialog button {
  max-width: 100% !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  white-space: normal !important;
  cursor: pointer !important;
}
.mm-cancel-dialog [role="dialog"] {
  overflow: visible !important;
}
/* Overlay animation - target the overlay that's a sibling of mm-cancel-dialog */
[data-radix-dialog-overlay] {
  backdrop-filter: blur(4px) !important;
}
[data-radix-dialog-overlay][data-state="open"] {
  animation: fade-in 0.3s ease-out forwards !important;
}
[data-radix-dialog-overlay][data-state="closed"] {
  animation: fade-out 0.2s ease-in forwards !important;
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
`;

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
  <div className="grid items-start gap-1 sm:gap-2 py-2 min-w-0" style={{ gridTemplateColumns: 'minmax(min-content, 6rem) minmax(0, 1fr)', width: '100%' }}>
    <div className="text-white/80 shrink-0 min-w-0 break-words mm-qr-label">{toStr(label)}</div>
    <div className="flex items-start gap-1 sm:gap-2 min-w-0 flex-wrap" style={{ minWidth: 0, width: '100%' }}>
      <span className="font-medium break-words break-all text-white overflow-wrap-anywhere min-w-0 mm-qr-value" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{toStr(value)}</span>
      {copy != null && toStr(copy) !== "" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-9 sm:w-9 shrink-0 text-white hover:bg-white/20 flex-shrink-0"
          onClick={() => navigator.clipboard?.writeText?.(toStr(copy))}
          title={`Sao chép ${toStr(label)}`}
        >
          <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      )}
    </div>
  </div>
);

/* ======================== Main Component ======================= */
export default function MamMoiQrCheckout() {
  const zoomStyle = useZoomStyle();
  const navigate = useNavigate();
  const location = useLocation();

  // Get planId and subscription info from location state or URL params
  const searchParams = new URLSearchParams(location.search);
  const planIdFromUrl = searchParams.get("planId");
  const planIdFromState = location.state?.planId;
  const planId = planIdFromState || planIdFromUrl || null;
  const isYearly = location.state?.isYearly || false; // Check if yearly subscription was selected
  const returnUrl = location.state?.returnUrl; // Get return URL from location state if available

  // State for checkout data from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const hasFetchedRef = useRef(false);

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
    // Prevent double calls (React StrictMode in development runs effects twice)
    if (hasFetchedRef.current || checkoutData) {
      return;
    }

    const fetchCheckout = async () => {
      if (!planId) {
        setError("Không tìm thấy thông tin gói đăng ký. Vui lòng chọn gói từ trang giá.");
        setLoading(false);
        return;
      }

      hasFetchedRef.current = true;

      try {
        const response = await PaymentRepository.createCheckout({
          planId: parseInt(planId),
          returnUrl: `${window.location.origin}/invoice`,
          cancelUrl: `${window.location.origin}/price`,
          subscriptionMonth: isYearly ? 12 : null, // Pass 12 months for yearly, null for monthly
        });

        if (response?.success) {
          setCheckoutData(response);
        } else {
          setError(response?.message || "Không thể tạo phiên thanh toán");
        }
      } catch (err) {
        console.error("Error creating checkout:", err);
        setError("Lỗi kết nối. Vui lòng thử lại sau.");
        hasFetchedRef.current = false; // Allow retry on error
      } finally {
        setLoading(false);
      }
    };

    fetchCheckout();
  }, [planId, isYearly]);

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

  // ====== Payment Timeout Handler ======
  const timeoutHandledRef = useRef(false); // Prevent double handling

  useEffect(() => {
    // When timer reaches 0 and we have an order code, handle timeout
    if (remain === 0 && orderCode && orderCode !== "---" && !timeoutHandledRef.current) {
      timeoutHandledRef.current = true;

      const handleTimeout = async () => {
        try {
          console.log("[Payment Timeout] Timer expired, cancelling payment...");

          // Stop polling if it's running
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setIsPolling(false);
          }

          // Call the cancel payment API to mark as failed
          await PaymentRepository.cancelPayment(orderCode);

          // Show timeout message
          setError("Phiên thanh toán đã hết hạn. Vui lòng thử lại.");

          // Wait 2 seconds to show message, then redirect
          setTimeout(() => {
            if (returnUrl) {
              navigate(returnUrl);
            } else {
              navigate(-1);
            }
          }, 2000);
        } catch (err) {
          console.error("[Payment Timeout] Error handling timeout:", err);
          // Even if cancel API fails, still redirect after showing error
          setError("Phiên thanh toán đã hết hạn.");
          setTimeout(() => {
            if (returnUrl) {
              navigate(returnUrl);
            } else {
              navigate(-1);
            }
          }, 2000);
        }
      };

      handleTimeout();
    }
  }, [remain, orderCode, returnUrl, navigate]);

  // ====== Payment Status Polling ======
  const [isPolling, setIsPolling] = useState(false);
  const [autoReconcile, setAutoReconcile] = useState(true); // Enable by default
  const pollingRef = useRef(null);

  // ====== Cancel Payment Dialog ======
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCancelledMessage, setShowCancelledMessage] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // ====== Window width for responsive layout ======
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // ====== QR Code Size (responsive) ======
  const [qrSize, setQrSize] = useState(320);

  useEffect(() => {
    const calculateQrSize = () => {
      // Use container width for better zoom handling
      const container = document.querySelector('[data-qr-container]');
      const containerWidth = container ? container.clientWidth : (document.documentElement.clientWidth || window.innerWidth);

      // Account for padding (p-4 sm:p-5 md:p-6 = 16px/20px/24px)
      const padding = containerWidth < 640 ? 32 : containerWidth < 1024 ? 40 : 48;
      const availableWidth = containerWidth - padding;

      if (containerWidth < 640) {
        // Mobile
        setQrSize(Math.max(200, Math.min(240, Math.floor(availableWidth * 0.9))));
      } else if (containerWidth < 1024) {
        // Tablet
        setQrSize(Math.max(240, Math.min(280, Math.floor(availableWidth * 0.85))));
      } else {
        // Desktop - use available space but cap at 320px
        setQrSize(Math.max(280, Math.min(320, Math.floor(availableWidth * 0.8))));
      }
    };

    // Initial calculation
    calculateQrSize();

    // Recalculate on resize
    window.addEventListener('resize', calculateQrSize);

    // Use ResizeObserver for better container size tracking
    const container = document.querySelector('[data-qr-container]');
    let resizeObserver = null;
    if (container && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(calculateQrSize);
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener('resize', calculateQrSize);
      if (resizeObserver && container) {
        resizeObserver.unobserve(container);
      }
    };
  }, []);

  // Handle cancel payment confirmation
  const handleConfirmCancel = async () => {
    if (!orderCode || orderCode === "---") {
      // If no order code, just navigate away
      setShowCancelDialog(false);
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate(-1);
      }
      return;
    }

    setIsCancelling(true);

    try {
      // Stop polling if it's running
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsPolling(false);
      }

      // Call the cancel payment API
      const response = await PaymentRepository.cancelPayment(orderCode);

      if (response?.success !== false) {
        // Success - show cancelled message
        setShowCancelDialog(false);
        setShowCancelledMessage(true);

        // After 1.5 seconds, navigate back to previous page
        setTimeout(() => {
          if (returnUrl) {
            // Navigate to specific return URL if provided
            navigate(returnUrl);
          } else {
            // Go back to previous page in history (e.g., UserProfile or Price page)
            navigate(-1);
          }
        }, 1500);
      } else {
        // Error from API
        setError(response?.message || "Không thể hủy thanh toán. Vui lòng thử lại.");
        setShowCancelDialog(false);
      }
    } catch (err) {
      console.error("Error cancelling payment:", err);
      setError("Đã xảy ra lỗi khi hủy thanh toán. Vui lòng thử lại.");
      setShowCancelDialog(false);
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    // Debug: Log the current state
    console.log("[Payment Poll] Effect triggered:", {
      autoReconcile,
      isPolling,
      orderCode,
      hasPollingRef: !!pollingRef.current,
      checkoutData: !!checkoutData
    });

    // Only poll if autoReconcile is enabled, not already polling, and we have an orderCode
    if (!autoReconcile) {
      console.log("[Payment Poll] Skipping: autoReconcile is false");
      return;
    }

    if (isPolling) {
      console.log("[Payment Poll] Skipping: already polling");
      return;
    }

    if (!orderCode || orderCode === "---") {
      console.log("[Payment Poll] Skipping: no orderCode yet", orderCode);
      return;
    }

    if (pollingRef.current) {
      console.log("[Payment Poll] Skipping: polling ref already exists");
      return;
    }

    console.log("[Payment Poll] Starting polling for orderCode:", orderCode);
    setIsPolling(true);
    let pollCount = 0;
    // Calculate maxPolls based on expiration time: expirationSeconds / pollInterval (10 seconds)
    // Add 10% buffer to ensure we poll for the full expiration period
    const maxPolls = Math.ceil((expirationSeconds / 10) * 1.1);
    console.log("[Payment Poll] Max polls:", maxPolls, "Expiration seconds:", expirationSeconds);

    // Start polling immediately (don't wait 10 seconds for first check)
    const checkStatus = async () => {
      pollCount++;

      try {
        console.log(`[Payment Poll] Checking payment status (attempt ${pollCount}/${maxPolls})...`);
        const status = await PaymentRepository.checkPaymentStatus(orderCode);
        console.log(`[Payment Poll] Payment status:`, status);

        if (status?.status === "Completed") {
          console.log(`[Payment Poll] Payment completed! Navigating to invoice...`);
          clearInterval(pollInterval);
          setIsPolling(false);
          pollingRef.current = null;

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
          return;
        }
      } catch (err) {
        console.error("[Payment Poll] Error checking payment status:", err);
      }

      if (pollCount >= maxPolls) {
        console.log(`[Payment Poll] Reached max polls (${maxPolls}), stopping...`);
        clearInterval(pollInterval);
        setIsPolling(false);
        pollingRef.current = null;
      }
    };

    // Check immediately, then every 10 seconds
    checkStatus();
    const pollInterval = setInterval(checkStatus, 10000);

    pollingRef.current = pollInterval;

    return () => {
      console.log("[Payment Poll] Cleaning up polling interval");
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      pollingRef.current = null;
      setIsPolling(false);
    };
  }, [autoReconcile, orderCode, expirationSeconds, navigate, checkoutData]);

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
    hasFetchedRef.current = false; // Reset to allow new fetch
    timeoutHandledRef.current = false; // Reset timeout flag for new session

    // Stop any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      setIsPolling(false);
    }

    try {
      const response = await PaymentRepository.createCheckout({
        planId: parseInt(planId),
        returnUrl: `${window.location.origin}/invoice`,
        cancelUrl: `${window.location.origin}/price`,
        subscriptionMonth: isYearly ? 12 : null, // Pass 12 months for yearly, null for monthly
      });

      if (response?.success) {
        setCheckoutData(response);
        setRemain(response.expirationSeconds || 900);
        hasFetchedRef.current = true;
        // Reset autoReconcile to allow new polling if checkbox is still checked
        if (autoReconcile) {
          setAutoReconcile(false);
          setTimeout(() => setAutoReconcile(true), 100);
        }
      } else {
        setError(response?.message || "Không thể tạo phiên thanh toán mới");
        hasFetchedRef.current = false;
      }
    } catch (err) {
      console.error("Error refreshing checkout:", err);
      setError("Lỗi kết nối. Vui lòng thử lại.");
      hasFetchedRef.current = false;
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
        <div className="relative min-h-screen pt-[64px] z-10 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 overflow-x-hidden">
          <Card className="border border-white/20 bg-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 max-w-md w-full mx-4">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-base sm:text-lg text-center">Đang tạo phiên thanh toán...</p>
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
        <div className="relative min-h-screen pt-[64px] z-10 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 overflow-x-hidden">
          <Card className="border border-white/20 bg-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 max-w-md w-full mx-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400" />
              <h2 className="text-white text-lg sm:text-xl font-semibold">Không thể tạo thanh toán</h2>
              <p className="text-white/70 text-sm sm:text-base">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
                <Button
                  onClick={() => navigate("/price")}
                  className="bg-white/20 hover:bg-white/30 text-white w-full sm:w-auto text-sm sm:text-base"
                >
                  Chọn gói
                </Button>
                <Button
                  onClick={handleRefresh}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto text-sm sm:text-base"
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
      <style>{RESPONSIVE_QR_STYLES}</style>
      <LivingBackground
        baseColor={PALETTE.bg}
        palette={[PALETTE.leaf, PALETTE.ivory, PALETTE.accent]}
        density={28}
      />

      {/* ZOOM WRAPPER */}
      <div style={zoomStyle} className="w-full min-w-0">
        <div className="relative min-h-screen pt-[64px] z-10 flex items-center justify-center overflow-x-hidden">
          <div className="mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 lg:py-12 min-w-0">
            <div className="w-full grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-4 sm:gap-6 md:gap-8 min-w-0">
              {/* LEFT: QR & bank info */}
              <Card className="border border-white/20 bg-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-2xl md:rounded-3xl overflow-visible min-w-0 mm-qr-payment-card">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 px-4 sm:px-6 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto min-w-0">
                    <QrCode className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 shrink-0" />
                    <CardTitle className="text-xl sm:text-2xl font-bold text-white break-words min-w-0 mm-qr-title">Quét QR để thanh toán</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                    <Badge className="bg-emerald-500/90 hover:bg-emerald-500/90 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 shrink-0">PayOS</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 sm:gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm shrink-0"
                      onClick={handleRefresh}
                    >
                      <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Tạo QR mới</span>
                      <span className="sm:hidden">Mới</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent
                  className="flex flex-col xl:grid gap-4 sm:gap-6 md:gap-8 pt-2 px-4 sm:px-6 min-w-0 overflow-visible mm-qr-content"
                  style={windowWidth >= 1280 ? { gridTemplateColumns: 'minmax(min-content, min(100%, 380px)) minmax(0, 1fr)' } : {}}
                >
                  {/* QR block */}
                  <div className="flex flex-col items-center gap-3 sm:gap-4 relative w-full min-w-0">
                    <div
                      data-qr-container
                      className="rounded-xl sm:rounded-2xl border-2 border-white/30 bg-white/95 p-4 sm:p-5 md:p-6 shadow-lg w-full flex items-center justify-center overflow-hidden min-w-0"
                      style={{ maxWidth: 'min(100%, 320px)', width: '100%' }}
                    >
                      {QR && QR.$$typeof ? (
                        <QR
                          value={qrValue}
                          size={qrSize}
                          style={{ maxWidth: '100%', height: 'auto', width: '100%', aspectRatio: '1/1' }}
                        />
                      ) : (
                        <div className="text-sm text-red-600">QR component not loaded</div>
                      )}
                    </div>
                    <div className="text-sm sm:text-base text-white/90 flex items-center gap-2 mm-qr-timer">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                      <span>Hiệu lực còn:</span>
                      <span className={`font-semibold ${remain < 60 ? 'text-red-400' : 'text-white'}`}>
                        {mm}:{ss}
                      </span>
                    </div>
                  </div>

                  {/* Bank details */}
                  <div className="space-y-2 min-w-0 w-full overflow-visible mm-qr-bank-details">
                    <Line label="Ngân hàng" value={bank.bankName} />
                    <Line label="Số tài khoản" value={bank.accountNumber} copy={bank.accountNumber} />
                    <Line label="Chủ tài khoản" value={bank.accountHolder} />
                    <Line label="Số tiền" value={currency(bank.amount)} />
                    <Line label="Nội dung" value={bank.transferNote} copy={bank.transferNote} />

                    <Separator className="my-4 sm:my-5 bg-white/20" />

                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <Checkbox
                        id="auto-reconcile"
                        className="mt-1 shrink-0 flex-shrink-0"
                        checked={autoReconcile}
                        onCheckedChange={(checked) => setAutoReconcile(checked === true)}
                      />
                      <label htmlFor="auto-reconcile" className="text-sm sm:text-base leading-6 sm:leading-7 text-white min-w-0 break-words">
                        <span className="font-semibold">Đối soát tự động.</span>
                        <br />
                        <span className="text-white/70">
                          Sau khi chuyển khoản, hóa đơn sẽ được gửi qua email.
                        </span>
                        {isPolling && (
                          <span className="block mt-2 text-xs sm:text-sm text-emerald-400">
                            Đang kiểm tra thanh toán...
                          </span>
                        )}
                      </label>
                    </div>

                    {/* Demo button for testing */}
                    {autoReconcile && (
                      <Button
                        onClick={handleDemoComplete}
                        className="hidden mt-4 w-full bg-yellow-500/80 hover:bg-yellow-500 text-white text-sm sm:text-base min-w-0"
                      >
                        Demo: Hoàn tất thanh toán
                      </Button>
                    )}
                  </div>
                </CardContent>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex justify-end min-w-0">
                  <Button
                    onClick={() => setShowCancelDialog(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base shrink-0"
                  >
                    Hủy thanh toán
                  </Button>
                </div>
              </Card>

              {/* RIGHT: Order summary */}
              <Card className="border border-white/20 bg-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-2xl md:rounded-3xl overflow-hidden min-w-0">
                <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6 min-w-0">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-white break-words min-w-0">Thông tin đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 min-w-0">
                  <div className="min-w-0">
                    <div className="grid py-2 sm:py-3 gap-2 min-w-0" style={{ gridTemplateColumns: 'minmax(min-content, 8rem) 1fr' }}>
                      <div className="text-sm sm:text-base text-white/80 shrink-0 min-w-0 break-words">Mã đơn</div>
                      <div className="text-sm sm:text-base font-medium text-white break-words break-all min-w-0">{toStr(order.orderCode || orderCode)}</div>
                    </div>
                    <div className="grid py-2 sm:py-3 gap-2 min-w-0" style={{ gridTemplateColumns: 'minmax(min-content, 8rem) 1fr' }}>
                      <div className="text-sm sm:text-base text-white/80 shrink-0 min-w-0 break-words">Người thanh toán</div>
                      <div className="text-sm sm:text-base font-medium text-white break-words break-all min-w-0">{toStr(order.payerName)}</div>
                    </div>
                    <div className="grid py-2 sm:py-3 gap-2 min-w-0" style={{ gridTemplateColumns: 'minmax(min-content, 8rem) 1fr' }}>
                      <div className="text-sm sm:text-base text-white/80 shrink-0 min-w-0 break-words">Email</div>
                      <div className="text-sm sm:text-base font-medium text-white break-all min-w-0">{toStr(order.payerEmail)}</div>
                    </div>
                    <div className="grid py-2 sm:py-3 gap-2 min-w-0" style={{ gridTemplateColumns: 'minmax(min-content, 8rem) 1fr' }}>
                      <div className="text-sm sm:text-base text-white/80 shrink-0 min-w-0 break-words">Gói</div>
                      <div className="text-sm sm:text-base font-medium text-white break-words break-all min-w-0">{toStr(order.planName)}</div>
                    </div>
                    <div className="grid py-2 sm:py-3 gap-2 min-w-0" style={{ gridTemplateColumns: 'minmax(min-content, 8rem) 1fr' }}>
                      <div className="text-sm sm:text-base text-white/80 shrink-0 min-w-0 break-words">Kỳ hạn</div>
                      <div className="text-sm sm:text-base font-medium text-white break-words break-all min-w-0">{toStr(order.period)}</div>
                    </div>

                    <Separator className="my-4 sm:my-5 bg-white/20" />

                    <div className="grid items-center py-2 gap-2 min-w-0" style={{ gridTemplateColumns: 'minmax(min-content, 8rem) 1fr' }}>
                      <div className="text-sm sm:text-base text-white/80 shrink-0 min-w-0 break-words">Tạm tính</div>
                      <div className="text-sm sm:text-base text-right font-medium text-white break-words min-w-0">{currency(order.subtotal)}</div>
                    </div>
                    <div className="grid items-center py-2 gap-2 min-w-0" style={{ gridTemplateColumns: 'minmax(min-content, 8rem) 1fr' }}>
                      <div className="text-sm sm:text-base text-white/80 shrink-0 min-w-0 break-words">Phí VAT</div>
                      <div className="text-sm sm:text-base text-right font-medium text-white break-words min-w-0">{currency(order.fee)}</div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-2 min-w-0">
                      <div className="text-base sm:text-lg font-semibold text-white break-words min-w-0">THANH TOÁN</div>
                      <div className="text-2xl sm:text-3xl font-bold text-emerald-400 break-words min-w-0">{currency(total)}</div>
                    </div>
                    <p className="mt-3 text-xs sm:text-sm text-white/70 break-words min-w-0">* Hóa đơn sẽ gửi về email sau khi kích hoạt.</p>
                  </div>
                </CardContent>
              </Card>

              {/* BOTTOM: Steps */}
              <div className="md:col-span-2 min-w-0">
                <Card className="border border-white/20 bg-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-2xl md:rounded-3xl overflow-hidden min-w-0">
                  <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6 min-w-0">
                    <CardTitle className="text-lg sm:text-xl font-bold text-white break-words min-w-0">Hướng dẫn</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 min-w-0">
                      <Step number={1} text="Mở app ngân hàng và chọn Quét QR" />
                      <Step number={2} text="Kiểm tra số tiền & nội dung (mã đơn + TXID)" />
                      <Step number={3} text="Hoàn tất chuyển khoản - bấm Xác nhận" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancelled Message Overlay */}
      {showCancelledMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200 px-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Giao dịch đã bị Hủy</h2>
              <p className="text-sm sm:text-base text-gray-600">
                Phiên thanh toán đã được hủy thành công.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Payment Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="border border-gray-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.4)] rounded-2xl sm:rounded-3xl overflow-visible min-w-0 mm-cancel-dialog p-6 sm:p-8 pb-6 sm:pb-8 flex flex-col">
          <DialogHeader className="min-w-0 space-y-3">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center break-words min-w-0 leading-tight">
              Xác nhận hủy thanh toán
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600 text-center break-words min-w-0 leading-relaxed px-2">
              Bạn có chắc chắn muốn hủy thanh toán này không?
              <br />
              Phiên thanh toán sẽ bị hủy và bạn sẽ được chuyển về trang chọn gói.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-6 pb-0 min-w-0 w-full flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 sm:px-6 py-2.5 w-full sm:w-auto sm:min-w-[160px] text-xs sm:text-sm shrink-0 transition-all duration-200 ease-out whitespace-normal sm:whitespace-nowrap hover:shadow-md hover:-translate-y-0.5 hover:border-gray-400 active:translate-y-0 h-auto sm:h-10"
            >
              <span className="text-center w-full">Không, tiếp tục thanh toán</span>
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 w-full sm:w-auto text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang hủy...
                </>
              ) : (
                "Có, hủy thanh toán"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Step({ number, text }) {
  return (
    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-sm sm:text-base font-bold text-white shrink-0 flex-shrink-0">{toStr(number)}</div>
      <div className="text-sm sm:text-base leading-6 sm:leading-7 text-white pt-0.5 sm:pt-1 break-words min-w-0">{toStr(text)}</div>
    </div>
  );
}
