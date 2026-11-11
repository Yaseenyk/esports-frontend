"use client";

import { useEffect, useState } from "react";
import { remaining, type CountdownData } from "@/lib/display";
import { themeById } from "@/lib/display-themes";

const T = themeById("dark");
const two = (n: number) => String(n).padStart(2, "0");

/** Big digits that fit a 360 px phone: the size follows the screen width. */
export default function CountdownBig({ d }: { d: CountdownData }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const r = remaining(d.at, now);
  const units: [string, string][] = [...(r.days > 0 ? [["Days", String(r.days)] as [string, string]] : []), ["Hours", two(r.hours)], ["Min", two(r.minutes)], ["Sec", two(r.seconds)]];
  const when = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(Date.parse(d.at));
  return (
    <div className="space-y-5 py-4 text-center">
      <div>
        <h2 className="break-words font-display text-2xl font-bold leading-tight text-white">{d.title}</h2>
        {d.subtitle && <p className="mt-1 text-base text-zinc-300">{d.subtitle}</p>}
      </div>
      {r.done ? <p role="status" className="font-display text-4xl font-extrabold text-cyan">It is time</p> : (
        <>
          <p className="sr-only">{`${r.days} days, ${r.hours} hours and ${r.minutes} minutes left`}</p>
          <div aria-hidden="true" className="grid gap-2" style={{ gridTemplateColumns: `repeat(${units.length}, minmax(0, 1fr))` }}>
            {units.map(([label, v]) => (
              <div key={label} className="min-w-0 rounded-xl border px-1 py-3" style={{ background: T.row, borderColor: T.line }}>
                <div className="font-display font-extrabold leading-none tabular-nums text-white" style={{ fontSize: "clamp(2rem, 12.5vw, 4.5rem)" }}>{v}</div>
                <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 sm:text-xs">{label}</div>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="text-sm text-zinc-300">{r.done ? "" : "Starts "}{when} <span className="text-zinc-400">(your time)</span></p>
    </div>
  );
}
