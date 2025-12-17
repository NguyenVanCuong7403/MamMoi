import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
    success: {
        icon: CheckCircle2,
        iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
        containerBg: "bg-gradient-to-r from-emerald-50 to-white",
        border: "border-emerald-200",
        shadow: "shadow-emerald-200/50",
        iconColor: "text-white",
        titleColor: "text-emerald-800",
        messageColor: "text-emerald-600",
        progressBg: "bg-emerald-500",
    },
    error: {
        icon: AlertTriangle,
        iconBg: "bg-gradient-to-br from-rose-400 to-rose-600",
        containerBg: "bg-gradient-to-r from-rose-50 to-white",
        border: "border-rose-200",
        shadow: "shadow-rose-200/50",
        iconColor: "text-white",
        titleColor: "text-rose-800",
        messageColor: "text-rose-600",
        progressBg: "bg-rose-500",
    },
    info: {
        icon: Info,
        iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
        containerBg: "bg-gradient-to-r from-blue-50 to-white",
        border: "border-blue-200",
        shadow: "shadow-blue-200/50",
        iconColor: "text-white",
        titleColor: "text-blue-800",
        messageColor: "text-blue-600",
        progressBg: "bg-blue-500",
    },
};

export default function AutoToast({
    open,
    type = "success",
    title,
    message,
    duration = 3000,
    onClose,
    showProgress = true,
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (open) {
            // Trigger enter animation
            requestAnimationFrame(() => {
                setIsVisible(true);
                setIsExiting(false);
            });

            // Auto close after duration
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            setIsExiting(false);
        }
    }, [open, duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 300); // Match animation duration
    };

    if (!open && !isVisible) return null;

    const variant = VARIANTS[type] ?? VARIANTS.success;
    const Icon = variant.icon;

    return (
        <div
            className={cn(
                "fixed top-6 right-6 z-[9999] max-w-sm",
                "transform transition-all duration-300 ease-out",
                isVisible && !isExiting
                    ? "translate-x-0 opacity-100 scale-100"
                    : "translate-x-full opacity-0 scale-95"
            )}
        >
            <div
                className={cn(
                    "relative overflow-hidden rounded-2xl border-2 p-4",
                    "backdrop-blur-xl shadow-2xl",
                    variant.containerBg,
                    variant.border,
                    variant.shadow
                )}
            >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/40 to-transparent rounded-bl-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/20 to-transparent rounded-tr-full pointer-events-none" />

                <div className="relative flex gap-4 items-start">
                    {/* Icon */}
                    <div
                        className={cn(
                            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                            variant.iconBg
                        )}
                    >
                        <Icon className={cn("w-6 h-6", variant.iconColor)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                        <p className={cn("font-bold text-base leading-tight", variant.titleColor)}>
                            {title}
                        </p>
                        {message && (
                            <p className={cn("mt-1 text-sm leading-relaxed", variant.messageColor)}>
                                {message}
                            </p>
                        )}
                    </div>

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Đóng thông báo"
                        className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                            "text-gray-400 hover:text-gray-600 hover:bg-gray-100/80",
                            "transition-all duration-200"
                        )}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress bar */}
                {showProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100/50 overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full",
                                variant.progressBg
                            )}
                            style={{
                                animation: `shrink ${duration}ms linear forwards`,
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Keyframe animation for progress bar */}
            <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
        </div>
    );
}
