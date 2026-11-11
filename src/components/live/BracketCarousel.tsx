"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BracketData } from "@/lib/display";
import { themeById } from "@/lib/display-themes";
import { bracketRounds, currentRoundIndex } from "@/lib/live";
import { reducedMotion } from "./ScheduleTimeline";

const T = themeById("dark");
const norm = (s: string) => s.trim().toLowerCase();
const isTbd = (s: string) => /^(tbd|bye|)$/i.test(s.trim());

function Side({ name, won, lost, mine }: { name: string; won: boolean; lost: boolean; mine: boolean }) {
  return (
    <div className={`flex min-h-11 items-center gap-2 px-3 py-2 ${won ? "font-bold text-white" : lost ? "text-zinc-400" : "font-semibold text-zinc-100"}`} style={won ? { boxShadow: `inset 4px 0 0 ${T.accent}` } : undefined}>
      <span className={`min-w-0 flex-1 break-words text-[16px] leading-snug ${isTbd(name) ? "italic text-zinc-400" : ""} ${mine ? "underline decoration-cyan decoration-2 underline-offset-4" : ""}`}>{name.trim() || "TBD"}</span>
      {won && <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold uppercase" style={{ background: T.accent, color: T.on }}>Won</span>}
      {lost && <span className="shrink-0 text-xs uppercase tracking-wider text-zinc-400">Out</span>}
    </div>
  );
}

/** Phones: round columns you swipe between, with chips to jump (Quarter-finals, Semi-finals, Final). Wide screens: the whole bracket. */
export default function BracketCarousel({ d, team }: { d: BracketData; team: string }) {
  const rounds = useMemo(() => bracketRounds(d), [d]);
  const first = useMemo(() => currentRoundIndex(rounds), [rounds]);
  const [active, setActive] = useState(first);
  const scroller = useRef<HTMLDivElement>(null);
  const cols = useRef<(HTMLLIElement | null)[]>([]);
  const did = useRef(false);
  const want = norm(team);

  const jump = (i: number, smooth = true) => {
    const el = cols.current[i], box = scroller.current;
    if (!el || !box) return;
    setActive(i);
    box.scrollTo({ left: el.offsetLeft - box.offsetLeft - (box.clientWidth - el.clientWidth) / 2, behavior: smooth && !reducedMotion() ? "smooth" : "auto" });
  };
  useEffect(() => { if (did.current) return; did.current = true; if (first > 0) jump(first, false); }); // once, on load
  const onScroll = () => {
    const box = scroller.current;
    if (!box) return;
    const mid = box.scrollLeft + box.clientWidth / 2;
    let best = 0, dist = Infinity;
    cols.current.forEach((el, i) => { if (!el) return; const c = el.offsetLeft - box.offsetLeft + el.clientWidth / 2, k = Math.abs(c - mid); if (k < dist) { dist = k; best = i; } });
    setActive((a) => (a === best ? a : best));
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold leading-tight text-white">{d.title}</h2>
      </div>
      {d.champion && (
        <div role="note" className="rounded-xl border-2 p-4 text-center" style={{ borderColor: T.medals[0], background: T.row }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.medals[0] }}>Champion</p>
          <p className="mt-1 break-words font-display text-2xl font-extrabold text-white">{d.champion}</p>
        </div>
      )}
      {rounds.length === 0 ? <p role="status" className="text-sm text-zinc-300">The bracket has no rounds yet.</p> : (
        <>
          {rounds.length > 1 && (
            <div role="group" aria-label="Jump to a round" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
              {rounds.map((r, i) => <button key={r.key} type="button" aria-pressed={active === i} onClick={() => jump(i)} className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-cyan ${active === i ? "border-cyan bg-cyan text-ink" : "border-zinc-700 text-zinc-100 hover:border-zinc-500"}`}>{r.label}</button>)}
            </div>
          )}
          <div ref={scroller} onScroll={onScroll} tabIndex={0} aria-label="Bracket rounds, swipe sideways" className="-mx-4 overflow-x-auto px-4 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-cyan lg:mx-0 lg:overflow-visible lg:px-0" style={{ scrollSnapType: "x mandatory" }}>
            <ol className="flex gap-3 lg:gap-6">
              {rounds.map((r, i) => (
                <li key={r.key} ref={(el) => { cols.current[i] = el; }} className="w-[84%] shrink-0 snap-center sm:w-[60%] lg:w-64" style={{ scrollSnapAlign: "center" }}>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-300">{r.label}<span className="ml-2 font-normal normal-case tracking-normal text-zinc-400">{r.decided} of {r.total} decided</span></h3>
                  <ul className="space-y-3">
                    {r.matches.map((m, j) => {
                      const mine = !!want && (norm(m.a) === want || norm(m.b) === want);
                      return (
                        <li key={j} data-mine={mine ? "1" : undefined} className="overflow-hidden rounded-xl border" style={{ background: T.row, borderColor: mine ? T.accent : T.line, borderWidth: mine ? 2 : 1 }}>
                          <Side name={m.a} won={m.w === 0} lost={m.w === 1} mine={!!want && norm(m.a) === want} />
                          <div aria-hidden="true" className="h-px" style={{ background: T.line }} />
                          <Side name={m.b} won={m.w === 1} lost={m.w === 0} mine={!!want && norm(m.b) === want} />
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
