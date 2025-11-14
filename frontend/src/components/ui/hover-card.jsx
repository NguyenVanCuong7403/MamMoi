import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  cloneElement,
  createContext,
} from "react";

const Ctx = createContext(null);

export function HoverCard({ children, openDelay = 120, closeDelay = 120 }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const tOpen = useRef(null);
  const tClose = useRef(null);

  const enter = () => {
    clearTimeout(tClose.current);
    tOpen.current = setTimeout(() => setOpen(true), openDelay);
  };
  const leave = () => {
    clearTimeout(tOpen.current);
    tClose.current = setTimeout(() => setOpen(false), closeDelay);
  };

  useEffect(() => () => {
    clearTimeout(tOpen.current);
    clearTimeout(tClose.current);
  }, []);

  return (
    <Ctx.Provider value={{ open, setOpen, wrapRef }}>
      <span
        ref={wrapRef}
        className="relative inline-flex"
        onMouseEnter={enter}
        onMouseLeave={leave}
        onFocus={enter}
        onBlur={leave}
      >
        {children}
      </span>
    </Ctx.Provider>
  );
}

export function HoverCardTrigger({ asChild = true, children }) {
  const ctx = useContext(Ctx);
  if (asChild && React.isValidElement(children)) {
    return cloneElement(children, {
      onFocus: (e) => {
        children.props?.onFocus?.(e);
        ctx?.setOpen(true);
      },
      onBlur: (e) => {
        children.props?.onBlur?.(e);
        ctx?.setOpen(false);
      },
    });
  }
  return <span className="inline-flex">{children}</span>;
}

export function HoverCardContent({
  children,
  className = "",
  side = "top",        // 'top' | 'bottom' | 'left' | 'right'
  align = "center",    // 'start' | 'center' | 'end'
  sideOffset = 8,
}) {
  const ctx = useContext(Ctx);
  if (!ctx?.open) return null;

  const alignCls =
    align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";
  const posCls =
    side === "bottom" ? "top-full"
    : side === "left" ? "right-full"
    : side === "right" ? "left-full"
    : "bottom-full"; // default 'top'

  const style =
    side === "bottom" ? { marginTop: sideOffset }
    : side === "top" ? { marginBottom: sideOffset }
    : side === "left" ? { marginRight: sideOffset }
    : { marginLeft: sideOffset };

  return (
    <div className={`absolute z-50 ${posCls} ${alignCls}`} style={style}>
      <div className={`rounded-xl border border-neutral-200 bg-white shadow-xl p-3 text-sm text-neutral-700 ${className}`}>
        {children}
      </div>
    </div>
  );
}
