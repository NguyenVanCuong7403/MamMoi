import React from "react";
import clsx from "clsx";

export function Label({ children, className, ...props }) {
  return (
    <label className={clsx("text-sm font-medium text-gray-700", className)} {...props}>
      {children}
    </label>
  );
}
