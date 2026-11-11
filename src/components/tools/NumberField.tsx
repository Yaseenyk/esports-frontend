"use client";

import { useId, useState } from "react";

interface Props {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  /** Allow decimals (for example half a point per kill). Whole numbers only by default. */
  decimal?: boolean;
  step?: number;
  hint?: string;
  className?: string;
  inputClassName?: string;
}

/**
 * A number box that lets you clear it and type a new number. While you type, an empty or half-typed box is left alone (the tool keeps the
 * last good value); the number is kept inside min and max as soon as it is complete, and the box shows the real value again when you leave it.
 */
export default function NumberField({ label, value, onChange, min, max, decimal = false, step, hint, className = "block text-sm text-zinc-200", inputClassName = "" }: Props) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label className={className} htmlFor={id}>
      {label}
      <input
        id={id}
        className={`field mt-1 ${inputClassName}`}
        type="number"
        inputMode={decimal ? "decimal" : "numeric"}
        min={min}
        max={max}
        step={step ?? (decimal ? 0.5 : 1)}
        value={draft ?? String(value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => {
          const v = e.target.value;
          setDraft(v);
          if (v.trim() === "") return;
          const n = Number(v);
          if (!Number.isFinite(n)) return;
          onChange(Math.min(max, Math.max(min, decimal ? n : Math.floor(n))));
        }}
        onBlur={() => setDraft(null)}
      />
      {hint && <span id={`${id}-hint`} className="mt-1 block text-xs text-zinc-400">{hint}</span>}
    </label>
  );
}
