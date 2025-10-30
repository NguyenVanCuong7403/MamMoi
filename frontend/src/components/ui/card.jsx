import React from "react";
import clsx from "clsx";

export function Card({ className, children }) {
  return (
    <div className={clsx("rounded-xl border bg-white p-4 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, className }) {
  return (
    <div className={clsx("text-lg font-semibold border-b pb-2 mb-2", className)}>
      {title}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={clsx("space-y-2", className)}>{children}</div>;
}
