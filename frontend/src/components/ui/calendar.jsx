import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const formatMonthLabel = (date) =>
  date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function buildCalendarGrid(date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const startOffset = firstDayOfMonth.getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const weeks = [];
  let currentDay = 1 - startOffset;

  while (currentDay <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i += 1) {
      const dayDate = new Date(date.getFullYear(), date.getMonth(), currentDay);
      week.push(dayDate);
      currentDay += 1;
    }
    weeks.push(week);
  }

  return weeks;
}

export function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  month,
  defaultMonth,
  disabled,
  initialFocus = false,
}) {
  const initialMonth =
    month || selected || defaultMonth || new Date(new Date().setHours(0, 0, 0, 0));
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const gridRef = useRef(null);

  const weeks = useMemo(() => buildCalendarGrid(currentMonth), [currentMonth]);

  useEffect(() => {
    if (month) {
      setCurrentMonth(month);
    }
  }, [month]);

  useEffect(() => {
    if (selected && !month) {
      setCurrentMonth(selected);
    }
  }, [selected, month]);

  useEffect(() => {
    if (initialFocus && gridRef.current) {
      gridRef.current.focus();
    }
  }, [initialFocus]);

  const handleSelect = (date) => {
    if (disabled?.(date)) return;
    if (mode === "single") {
      onSelect?.(new Date(date));
    }
  };

  return (
    <div className={cn("w-[280px] rounded-xl border border-slate-200 bg-white p-4", className)}>
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
        <button
          type="button"
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          onClick={() =>
            setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
          }
          aria-label="Tháng trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-base capitalize">{formatMonthLabel(currentMonth)}</span>
        <button
          type="button"
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          onClick={() =>
            setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
          }
          aria-label="Tháng sau"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={gridRef}
        tabIndex={initialFocus ? 0 : -1}
        className="grid select-none grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-slate-400"
      >
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-sm">
        {weeks.map((week, weekIndex) =>
          week.map((day) => {
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isSelected = selected && isSameDay(day, selected);
            const isDisabled =
              disabled?.(day) || day.getMonth() !== currentMonth.getMonth() && !isCurrentMonth;

            return (
              <button
                key={`${weekIndex}-${day.toISOString()}`}
                type="button"
                onClick={() => handleSelect(day)}
                disabled={isDisabled}
                className={cn(
                  "h-9 rounded-lg border border-transparent text-center transition",
                  !isCurrentMonth && "text-slate-300",
                  isSelected &&
                    "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600",
                  !isSelected &&
                    isCurrentMonth &&
                    !isDisabled &&
                    "text-slate-700 hover:border-emerald-200 hover:bg-emerald-50",
                  isDisabled && "cursor-not-allowed text-slate-200"
                )}
              >
                {day.getDate()}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

