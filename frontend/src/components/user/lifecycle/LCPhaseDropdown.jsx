import React, { useMemo, useState } from "react";
import { ChevronDown, ArrowDown } from "lucide-react";

/**
 * LCPhaseDropdown Component
 * Dropdown menu for selecting lifecycle phases
 */
export default function LCPhaseDropdown({
  activePhase,
  onPickPhase,
  onStartNewCycle,
  phaseConfigs,
}) {
  const [open, setOpen] = useState(false);
  const fallbackItems = [
    { id: "flowering", name: "Ra Hoa", icon: "🌸", phase: null },
    { id: "fruiting", name: "Đậu quả", icon: "🍏", phase: null },
    { id: "pre_harvest", name: "Trước thu hoạch", icon: "🔍", phase: null },
    { id: "post_harvest", name: "Sau thu hoạch", icon: "🌿", phase: null },
  ];
  const items = useMemo(() => {
    const list = [];
    if (phaseConfigs?.phase1) {
      list.push({
        id: phaseConfigs.phase1.phaseId,
        name: phaseConfigs.phase1.label,
        icon: phaseConfigs.phase1.icon || "🌱",
        phase: phaseConfigs.phase1,
      });
    }
    if (Array.isArray(phaseConfigs?.cycles) && phaseConfigs.cycles.length) {
      list.push(
        ...phaseConfigs.cycles.map((phase) => ({
          id: phase.phaseId,
          name: phase.label,
          icon: phase.icon || "🌿",
          phase,
        }))
      );
    }
    return list.length > 0 ? list : fallbackItems;
  }, [phaseConfigs]);
  return (
    <div className="mm-fluid-shell relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-extrabold text-white
                   bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800
                   shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_6px_14px_rgba(37,99,235,.3)] ring-1 ring-black/10"
      >
        <ChevronDown className="w-3 h-3" />
        Cập nhật giai đoạn
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white/95 backdrop-blur rounded-xl shadow-2xl border border-gray-200 z-[60] overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {items.map((it) => (
              <div key={it.id}>
                <button
                  onClick={() => {
                    setOpen(false);
                    onPickPhase(it.phase || it.id);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl border transition-all flex items-center gap-2.5
                    ${activePhase === it.id
                      ? "bg-emerald-50 border-emerald-300 shadow-sm"
                      : "bg-white hover:bg-blue-50 border-gray-200 hover:shadow-md"
                    }`}
                  title={it.name}
                >
                  <span className="text-[18px] leading-none">{it.icon}</span>
                  <span className="font-semibold text-[12px] text-gray-900 flex-1 min-w-0 truncate">
                    {it.name}
                  </span>
                </button>
                <div className="flex justify-center py-1 text-gray-300">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onStartNewCycle();
              }}
              className="w-full mt-1 p-2.5 rounded-xl font-extrabold text-[12px] text-white
                         bg-gradient-to-r from-amber-400 to-pink-500 shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_8px_16px_rgba(236,72,153,.3)]
                         hover:from-amber-500 hover:to-pink-600"
            >
              🔄 Bắt đầu giai đoạn mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

