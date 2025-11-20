import React, {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const PopoverContext = createContext(null);

function usePopoverContext(component) {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Popover>`);
  }
  return ctx;
}

export function Popover({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className = "",
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = typeof openProp === "boolean";
  const open = isControlled ? openProp : internalOpen;
  const wrapperRef = useRef(null);

  const setOpen = (value) => {
    const nextValue = typeof value === "function" ? value(open) : value;
    if (!isControlled) {
      setInternalOpen(nextValue);
    }
    onOpenChange?.(nextValue);
  };

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div
        ref={wrapperRef}
        className={cn("relative inline-block w-full text-left", className)}
      >
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ asChild = true, children }) {
  const ctx = usePopoverContext("PopoverTrigger");

  const handleClick = (event) => {
    if (children?.props?.onClick) {
      children.props.onClick(event);
    }
    if (!children?.props?.disabled) {
      ctx.setOpen((prev) => !prev);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return cloneElement(children, {
      onClick: handleClick,
      "aria-haspopup": "dialog",
      "aria-expanded": ctx.open,
    });
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={ctx.open}
      onClick={() => ctx.setOpen((prev) => !prev)}
    >
      {children}
    </button>
  );
}

export function PopoverContent({
  children,
  className = "",
  side = "bottom",
  align = "start",
  sideOffset = 8,
}) {
  const ctx = usePopoverContext("PopoverContent");
  if (!ctx.open) return null;

  const horizontal = side === "top" || side === "bottom";

  const alignClass = horizontal
    ? align === "end"
      ? "right-0"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "left-0"
    : align === "end"
    ? "bottom-0"
    : align === "center"
    ? "top-1/2 -translate-y-1/2"
    : "top-0";

  const sideClass =
    side === "top"
      ? "bottom-full"
      : side === "left"
      ? "right-full"
      : side === "right"
      ? "left-full"
      : "top-full";

  const offsetStyle =
    side === "top"
      ? { marginBottom: sideOffset }
      : side === "left"
      ? { marginRight: sideOffset }
      : side === "right"
      ? { marginLeft: sideOffset }
      : { marginTop: sideOffset };

  return (
    <div className={cn("absolute z-50", sideClass, alignClass)} style={offsetStyle}>
      <div
        className={cn(
          "rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-xl",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

