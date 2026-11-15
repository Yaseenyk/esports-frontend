"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A wide table in a box that scrolls sideways. The first column stays in view, and a one-line hint shows only when there is more to scroll to.
 * The full table is in the server HTML, so readers and search engines get every cell.
 */
export default function ScrollTable({ caption, head, rows, label, variant = "tool" }: { caption?: string; head: string[]; rows: string[][]; label: string; variant?: "tool" | "prose" }) {
  const box = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const check = () => setMore(el.scrollWidth > el.clientWidth + 2);
    check();
    const ro = new ResizeObserver(check); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const prose = variant === "prose";
  return (
    <div className="space-y-1.5">
      {more && <p className="text-xs text-zinc-300">Scroll sideways to see every column. The first column stays in view.</p>}
      <div ref={box} role="region" aria-label={label} tabIndex={0} className="overflow-x-auto rounded-xl border border-white/[0.14] outline-none focus-visible:ring-2 focus-visible:ring-cyan">
        <table className="w-full border-collapse text-left text-sm">
          {caption && <caption className="px-3 py-2 text-left text-sm font-semibold text-zinc-200">{caption}</caption>}
          <thead><tr className="bg-[#0f1013] text-zinc-200">{head.map((h, i) => <th key={h} scope="col" className={`min-w-28 px-3 py-2 align-bottom ${prose ? "border-b border-white/[0.14] font-semibold text-white" : ""} ${i === 0 ? "sticky left-0 z-10 bg-[#0f1013]" : ""}`}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, j) => (
            <tr key={r[0]} className={`${prose ? "" : "border-t border-white/[0.08]"} align-top`}>{r.map((c, i) => i === 0
              ? <th key={i} scope="row" className={`sticky left-0 z-10 min-w-28 bg-[#0a0b0d] px-3 py-2 font-semibold text-white ${prose ? "border-b border-white/[0.08]" : ""}`}>{c}</th>
              : <td key={i} className={`min-w-28 px-3 py-2 text-zinc-300 ${prose ? "border-b border-white/[0.08]" : ""}`}>{c}</td>)}</tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
