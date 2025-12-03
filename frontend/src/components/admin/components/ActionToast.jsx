import React from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-100 shadow-emerald-200/70",
  },
  error: {
    icon: AlertTriangle,
    badge: "bg-rose-100 text-rose-700",
    border: "border-rose-100 shadow-rose-200/70",
  },
};

export default function ActionToast({
  open,
  type = "success",
  title,
  message,
  onClose,
}) {
  if (!open) return null;

  const variant = VARIANTS[type] ?? VARIANTS.success;
  const Icon = variant.icon;

  return (
    <div className="fixed bottom-6 right-6 z-[120] max-w-sm">
      <div
        className={cn(
          "flex gap-3 rounded-2xl border bg-white/95 p-4 text-slate-900 shadow-2xl transition-all",
          variant.border
        )}
      >
        <div
          className={cn(
            "mt-0.5 flex h-10 w-10 items-center justify-center rounded-full",
            variant.badge
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 text-sm">
          <p className="font-semibold">{title}</p>
          {message && (
            <p className="mt-1 text-slate-600 whitespace-pre-line">{message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông báo"
          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
