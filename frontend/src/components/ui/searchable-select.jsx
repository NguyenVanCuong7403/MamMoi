import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { normalize as vnNormalize } from "@/lib/useVnAdmin";

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "",
  disabled = false,
  error,
  inputPlaceholder,
}) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [hasTyped, setHasTyped] = React.useState(false);
  const [justPicked, setJustPicked] = React.useState(false);
  const wrapRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const norm = (s) =>
    vnNormalize(String(s || ""))
      .toLowerCase()
      .trim();

  useEffect(() => {
    const current = options.find((o) => o.value === value) || null;
    setText(current ? current.label : "");
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        setOpen(false);
        setHasTyped(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = React.useMemo(() => {
    if (!open) return [];
    if (!hasTyped || !text.trim()) return options;
    const k = norm(text);
    return options.filter((o) => norm(o.label).includes(k));
  }, [options, open, hasTyped, text]);

  function pickOption(opt) {
    if (!opt) return;
    onChange?.(opt.value);
    setText(opt.label);
    setOpen(false);
    setHasTyped(false);
    setJustPicked(true);
    if (inputRef.current) inputRef.current.blur();
  }

  function commitFromText() {
    const trimmed = text.trim();
    if (!trimmed) {
      if (value) onChange?.("");
      setText("");
      return;
    }

    const k = norm(trimmed);
    const foundExact = options.find((o) => norm(o.label) === k);
    const foundPartial =
      foundExact || options.find((o) => norm(o.label).includes(k));

    if (foundPartial) {
      if (foundPartial.value !== value) onChange?.(foundPartial.value);
      setText(foundPartial.label);
    } else {
      const current = options.find((o) => o.value === value) || null;
      setText(current ? current.label : "");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      commitFromText();
      setOpen(false);
      setHasTyped(false);
      if (inputRef.current) inputRef.current.blur();
    }
  }

  return (
    <div className="relative min-w-0" ref={wrapRef}>
      <Input
        ref={inputRef}
        value={text}
        disabled={disabled}
        onChange={(e) => {
          if (disabled) return;
          setText(e.target.value);
          setHasTyped(true);
          setOpen(true);
        }}
        onFocus={() => {
          if (disabled) return;
          setOpen(true);
          setHasTyped(false);
        }}
        onBlur={() => {
          setOpen(false);
          setHasTyped(false);
          if (disabled) return;
          if (justPicked) {
            setJustPicked(false);
            return;
          }
          const current = options.find((o) => o.value === value) || null;
          setText(current ? current.label : "");
        }}
        onKeyDown={handleKeyDown}
        placeholder={inputPlaceholder || placeholder}
        autoComplete="off"
        spellCheck={false}
        className={
          "h-11 w-full min-w-0 rounded-xl bg-white placeholder:text-neutral-400 truncate " +
          (disabled ? "opacity-60 cursor-not-allowed " : "") +
          (error
            ? "border border-red-500 focus-visible:ring-2 focus-visible:ring-rose-500/40 focus-visible:border-red-500"
            : "border border-neutral-300 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500")
        }
      />

      {open && !disabled && (
        <div className="absolute z-[1600] left-0 right-0 mt-1 max-h-64 overflow-auto rounded-xl border bg-white p-1 shadow-xl">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-neutral-500">
              Không tìm thấy kết quả
            </div>
          ) : (
            filtered.map((opt) => (
              <button
                type="button"
                key={String(opt.value)}
                className={
                  "w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-neutral-50 " +
                  (opt.value === value
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-neutral-800")
                }
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickOption(opt)}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}

      {error && typeof error === "string" && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
