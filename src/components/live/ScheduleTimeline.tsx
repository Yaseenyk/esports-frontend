"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ScheduleData } from "@/lib/display";
import { themeById } from "@/lib/display-themes";
import { scheduleRows } from "@/lib/live";

const T = themeById("dark");

export const reducedMotion = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

/** A vertical timeline of the day: NOW and NEXT badges (refreshed every 30 seconds), breaks, finished rounds dimmed, and a scroll to the current round once on load. */
export default function ScheduleTimeline({ d, team }: { d: ScheduleData; team: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30_000); return () => clearInterval(id); }, []);
  const rows = useMemo(() => scheduleRows(d, now), [d, now]);
  const want = team.trim().toLowerCase();
  const focus = useRef<HTMLLIElement>(null);
  const scrolled = useRef(false);
  const focusIndex = rows.findIndex((r) => r.state === "now") >= 0 ? rows.findIndex((r) => r.state === "now") : rows.findIndex((r) => r.state === "next");

  useEffect(() => {
    if (scrolled.current || focusIndex < 0 || !focus.current) return;
    scrolled.current = true;
    focus.current.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
  }, [focusIndex]);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold leading-tight text-white">{d.title}</h2>
        <p className="mt-1 text-sm text-zinc-300">Times are shown as published by the organiser.{d.date ? ` Day: ${d.date}.` : ""}</p>
      </div>
      {rows.length === 0 ? <p role="status" className="text-sm text-zinc-300">The schedule has no rounds yet.</p> : (
        <ol className="relative ml-2 border-l-2 pl-5" style={{ borderColor: T.line }}>
          {rows.map((r) => {
            const mine = !!want && r.label.toLowerCase().includes(want);
            const live = r.state === "now", next = r.state === "next", past = r.state === "past";
            return (
              <li key={r.index} ref={r.index === focusIndex ? focus : undefined} data-mine={mine ? "1" : undefined} data-state={r.state} className="relative scroll-mt-32 pb-3 last:pb-0">
                <span aria-hidden="true" className="absolute -left-[1.78rem] top-5 h-3 w-3 rounded-full border-2" style={{ borderColor: live ? T.accent : next ? T.accent2 : T.line, background: live ? T.accent : "#05070a" }} />
                <div className={`rounded-xl border p-3 ${past ? "opacity-60" : ""}`} style={{ background: T.row, borderColor: mine ? T.accent : live ? T.accent : T.line, borderWidth: mine || live ? 2 : 1 }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold tabular-nums text-white">{r.start}{r.end ? <span className="font-normal text-zinc-400"> – {r.end}</span> : null}</span>
                    {live && <span className="rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider" style={{ background: T.accent, color: T.on }}>Now</span>}
                    {next && <span className="rounded-full border px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider" style={{ borderColor: T.accent2, color: "#d8b4fe" }}>Next</span>}
                    {past && <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Done</span>}
                  </div>
                  <p className="mt-1 break-words text-[17px] font-semibold leading-snug text-white">{r.label || `Round ${r.n}`}</p>
                  {next && r.startsIn && <p className="mt-1 text-sm font-semibold text-cyan">{r.startsIn}</p>}
                </div>
                {r.breakAfter > 0 && <p className="mt-2 rounded-lg border border-dashed px-3 py-2 text-sm text-zinc-300" style={{ borderColor: T.line }}>Break · {r.breakAfter} min</p>}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
