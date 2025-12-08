import React from "react";

/**
 * LCConfirmModal Component
 * Confirmation modal for lifecycle phase changes
 */
export default function LCConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  highlight,
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl w-full max-w-md p-6 ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-extrabold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 mb-3 text-sm">{message}</p>
        {highlight && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            {highlight}
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

