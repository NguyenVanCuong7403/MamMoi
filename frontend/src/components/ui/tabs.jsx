import React from "react";
import clsx from "clsx";

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b mb-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={clsx(
            "px-4 py-2 text-sm font-medium",
            active === t
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-blue-500"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
