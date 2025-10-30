import React from "react";

export function Slider({ value, min = 0, max = 100, step = 1, onChange }) {
  return (
    <input
      type="range"
      className="w-full accent-blue-600"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
