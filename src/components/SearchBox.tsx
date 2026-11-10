"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SEARCH_INDEX, type Hit } from "@/lib/data";

const KIND_STYLE: Record<Hit["kind"], string> = {
  Game: "bg-amber-500/15 text-amber-300",
  Event: "bg-cyan/15 text-cyan",
  Community: "bg-purple/15 text-purple-300",
  Guide: "bg-emerald-500/15 text-emerald-300",
  Tool: "bg-pink-500/15 text-pink-300",
};

/** One box that searches games, events, communities, guides and tools. Press / to focus it from anywhere. */
export default function SearchBox({ large = false, placeholder = "Search games, events…" }: { large?: boolean; placeholder?: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [] as Hit[];
    const words = t.split(/\s+/);
    return SEARCH_INDEX.filter((h) => words.every((w) => `${h.title} ${h.sub} ${h.kind}`.toLowerCase().includes(w))).slice(0, 8);
  }, [q]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    const away = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", away);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", away);
    };
  }, []);
  return (
    <div ref={box} className="relative w-full">
      <label className="sr-only" htmlFor={large ? "search-large" : "search-small"}>Search</label>
      <input
        ref={input}
        id={large ? "search-large" : "search-small"}
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setI(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(hits.length - 1, x + 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
          else if (e.key === "Enter" && hits[i]) window.location.href = hits[i].href;
          else if (e.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && hits.length > 0}
        aria-controls="search-results"
        className={`field ${large ? "min-h-14 pl-12 text-lg" : "pl-10"}`}
      />
      <svg aria-hidden="true" viewBox="0 0 24 24" className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 fill-none stroke-zinc-500 ${large ? "h-6 w-6 left-4" : "h-5 w-5"}`} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      {open && q.trim() && (
        <ul id="search-results" role="listbox" className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl">
          {hits.length === 0 && <li className="px-4 py-3 text-sm text-zinc-400">Nothing matches &ldquo;{q}&rdquo; in the sample data.</li>}
          {hits.map((h, n) => (
            <li key={h.href + h.title} role="option" aria-selected={n === i}>
              <Link href={h.href} className={`flex items-center gap-3 px-4 py-3 outline-none ${n === i ? "bg-zinc-800" : "hover:bg-zinc-900"}`}>
                <span className={`w-20 shrink-0 rounded-md px-2 py-0.5 text-center text-[11px] font-semibold ${KIND_STYLE[h.kind]}`}>{h.kind}</span>
                <span className="min-w-0">
                  <span className="block truncate text-zinc-50">{h.title}</span>
                  <span className="block truncate text-xs text-zinc-400">{h.sub}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
