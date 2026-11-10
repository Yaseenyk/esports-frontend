"use client";

import { AnimatePresence, m as motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

export interface Option { value: string; label: string; /** Small visual on the left, for example a game logo. */ icon?: ReactNode; /** Muted text on the right. */ hint?: string }

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  /** Visible label above the control. Use ariaLabel instead when there is no room for one. */
  label?: string;
  ariaLabel?: string;
  placeholder?: string;
  /** Show a search box. Defaults to on when there are more than 8 options. */
  searchable?: boolean;
  className?: string;
}

const CHECK = "M5 12.5l4.5 4.5L19 7";

/**
 * The hub's dropdown. It replaces the browser's native select everywhere so lists look the same on every device,
 * can show logos, can be searched, and work fully by keyboard. On phones the list opens as a bottom sheet.
 */
export default function Select({ value, onChange, options, label, ariaLabel, placeholder = "Select…", searchable, className = "" }: Props) {
  const id = useId();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [up, setUp] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const typed = useRef({ s: "", t: 0 });
  const [fade, setFade] = useState({ t: false, b: false });
  const [bar, setBar] = useState({ show: false, h: 0, top: 0 });
  const [dragging, setDragging] = useState(false);
  const measure = useCallback(() => {
    const el = list.current;
    if (!el) return;
    setFade({ t: el.scrollTop > 2, b: el.scrollTop + el.clientHeight < el.scrollHeight - 2 });
    const track = el.clientHeight - 12; // 6px inset at both ends
    if (el.scrollHeight <= el.clientHeight + 1 || track <= 0) { setBar((b) => (b.show ? { show: false, h: 0, top: 0 } : b)); return; }
    const h = Math.max(32, (el.clientHeight / el.scrollHeight) * track);
    const top = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * (track - h);
    setBar({ show: true, h, top });
  }, []);
  // Drag the thumb, or click the track to jump there.
  const dragThumb = (e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    const el = list.current; if (!el) return;
    const startY = e.clientY, startTop = el.scrollTop, track = el.clientHeight - 12, h = Math.max(32, (el.clientHeight / el.scrollHeight) * track);
    setDragging(true);
    const move = (m: PointerEvent) => { el.scrollTop = startTop + ((m.clientY - startY) * (el.scrollHeight - el.clientHeight)) / Math.max(1, track - h); };
    const up = () => { setDragging(false); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const jumpTrack = (e: React.PointerEvent) => {
    const el = list.current; if (!el) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    el.scrollTo({ top: ((e.clientY - r.top) / r.height) * (el.scrollHeight - el.clientHeight) - el.clientHeight / 2, behavior: "smooth" });
  };
  const showSearch = searchable ?? options.length > 8;

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? options.filter((o) => `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(t)) : options;
  }, [options, q]);
  const current = options.find((o) => o.value === value);

  const close = useCallback((refocus = true) => { setOpen(false); setQ(""); if (refocus) btn.current?.focus(); }, []);
  const openIt = useCallback(() => {
    const b = btn.current?.getBoundingClientRect();
    setSheet(window.innerWidth < 640);
    setUp(!!b && window.innerHeight - b.bottom < 320 && b.top > window.innerHeight - b.bottom);
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }, [options, value]);
  const pick = useCallback((o: Option) => { onChange(o.value); close(); }, [onChange, close]);

  // Outside click closes it; the bottom sheet also locks page scroll.
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!sheet && !root.current?.contains(e.target as Node)) close(false); };
    document.addEventListener("pointerdown", away);
    const prev = document.body.style.overflow;
    if (sheet) document.body.style.overflow = "hidden";
    const t = setTimeout(() => (showSearch && !sheet ? search.current : list.current)?.focus({ preventScroll: true }), 30);
    return () => { document.removeEventListener("pointerdown", away); document.body.style.overflow = prev; clearTimeout(t); };
  }, [open, sheet, showSearch, close]);

  useEffect(() => { if (open) { const t = setTimeout(measure, 40); return () => clearTimeout(t); } }, [open, q, measure]);

  // Keep the highlighted row in view.
  useEffect(() => { if (open) list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" }); }, [active, open]);
  useEffect(() => { setActive(0); }, [q]);

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openIt(); }
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(shown.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(shown.length - 1); }
    else if (e.key === "Enter" || (e.key === " " && !showSearch)) { e.preventDefault(); if (shown[active]) pick(shown[active]); }
    else if (e.key === "Tab") close(false);
    else if (!showSearch && e.key.length === 1) {
      // Type-ahead: typing "val" jumps to the first option starting with it.
      const now = Date.now();
      typed.current.s = now - typed.current.t > 700 ? e.key.toLowerCase() : typed.current.s + e.key.toLowerCase();
      typed.current.t = now;
      const i = shown.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.s));
      if (i >= 0) setActive(i);
    }
  };

  const panel = (
    <>
      {showSearch && (
        <div className="border-b border-white/10 p-2">
          <input ref={search} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search…" aria-label="Search options" aria-controls={`${id}-list`} className="field !min-h-10" />
        </div>
      )}
      <div className="relative">
      <ul ref={list} id={`${id}-list`} role="listbox" tabIndex={-1} aria-label={label ?? ariaLabel} aria-activedescendant={shown[active] ? `${id}-${active}` : undefined} onKeyDown={onKey} onScroll={measure}
        style={{ ["--ft" as string]: fade.t ? 1 : 0, ["--fb" as string]: fade.b ? 1 : 0 }}
        className="hub-list no-native-scroll max-h-64 overflow-y-auto overscroll-contain p-1.5 pr-3 outline-none sm:max-h-72">
        {shown.length === 0 && <li className="px-3 py-3 text-sm text-zinc-400">No matches</li>}
        {shown.map((o, i) => {
          const sel = o.value === value;
          return (
            <li key={o.value} id={`${id}-${i}`} data-i={i} role="option" aria-selected={sel} onPointerEnter={() => setActive(i)} onClick={() => pick(o)}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-[15px] transition-colors ${i === active ? "bg-white/10 text-white" : "text-zinc-300"} ${sel ? "font-semibold" : ""}`}>
              {o.icon && <span className="shrink-0">{o.icon}</span>}
              <span className="min-w-0 flex-1 truncate">{o.label}</span>
              {o.hint && <span className="shrink-0 text-xs text-zinc-400">{o.hint}</span>}
              {sel && <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-cyan" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={CHECK} /></svg>}
            </li>
          );
        })}
      </ul>
      {bar.show && (
        <div aria-hidden="true" onPointerDown={jumpTrack} className="group absolute inset-y-1.5 right-1 w-3 cursor-pointer">
          <div className={`absolute right-[3px] w-1.5 rounded-full bg-white/[0.06] transition-all group-hover:right-[2px] group-hover:w-2 inset-y-0 ${dragging ? "!w-2" : ""}`} />
          <div onPointerDown={dragThumb} className={`absolute right-[3px] w-1.5 cursor-grab touch-none rounded-full bg-gradient-to-b from-cyan to-purple opacity-60 shadow-[0_0_8px_rgba(34,211,238,.35)] transition-[width,opacity,right] group-hover:right-[2px] group-hover:w-2 group-hover:opacity-100 ${dragging ? "!right-[2px] !w-2 cursor-grabbing !opacity-100" : ""}`} style={{ top: bar.top, height: bar.h }} />
        </div>
      )}
      </div>
    </>
  );

  return (
    <div ref={root} className={`relative ${className}`}>
      {label && <label id={`${id}-label`} htmlFor={`${id}-btn`} className="mb-1 block text-sm text-zinc-400">{label}</label>}
      <button ref={btn} id={`${id}-btn`} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`} aria-label={label ? undefined : ariaLabel}
        onClick={() => (open ? close() : openIt())} onKeyDown={onKey}
        className={`field flex items-center gap-3 text-left transition-colors hover:border-zinc-500 ${open ? "!border-cyan" : ""}`}>
        {current?.icon && <span className="shrink-0">{current.icon}</span>}
        <span className={`min-w-0 flex-1 truncate ${current ? "" : "text-zinc-400"}`}>{current?.label ?? placeholder}</span>
        <motion.svg aria-hidden="true" viewBox="0 0 24 24" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.2 }} className="h-4 w-4 shrink-0 fill-none stroke-zinc-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></motion.svg>
      </button>

      <AnimatePresence>
        {open && !sheet && (
          <motion.div key="pop" initial={reduce ? false : { opacity: 0, y: up ? 6 : -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: up ? 6 : -6, scale: 0.98 }} transition={{ duration: 0.16 }}
            className={`absolute left-0 right-0 z-50 overflow-hidden rounded-xl border border-white/15 bg-zinc-950/95 shadow-2xl shadow-black/70 backdrop-blur-xl ${up ? "bottom-full mb-2" : "top-full mt-2"}`}>
            {panel}
          </motion.div>
        )}
        {open && sheet && (
          <motion.div key="sheet" className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
            <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-white/15 bg-zinc-950 pb-[env(safe-area-inset-bottom)] shadow-2xl">
              <div className="mx-auto mb-1 mt-2 h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
              {(label || ariaLabel) && <p className="px-5 pb-1 pt-2 font-display text-sm font-semibold text-zinc-300">{label ?? ariaLabel}</p>}
              {panel}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
