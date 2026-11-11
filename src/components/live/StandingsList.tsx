"use client";

import { useMemo, useState } from "react";
import type { TableData } from "@/lib/display";
import { contrast, themeById } from "@/lib/display-themes";
import { filterCards, leaderOf, standingCards, type StandingCard } from "@/lib/live";

const T = themeById("dark");
const norm = (s: string) => s.trim().toLowerCase();

function Badge({ rank }: { rank: number }) {
  const medal = rank >= 1 && rank <= 3 ? T.medals[rank - 1]! : null;
  const ink = medal ? (contrast(medal, "#0b0b0b") >= 4.5 ? "#0b0b0b" : "#ffffff") : T.fg;
  return (
    <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-base font-extrabold tabular-nums" style={medal ? { background: medal, color: ink } : { background: T.row, color: ink, border: `1px solid ${T.line}` }}>{rank}</span>
  );
}

function Card({ c, open, onToggle, pinned = false }: { c: StandingCard; open: boolean; onToggle: () => void; pinned?: boolean }) {
  const has = c.parts.length > 0;
  const body = (
    <>
      <Badge rank={c.rank} />
      <span className="min-w-0 flex-1 text-left">
        <span className="block break-words text-[17px] font-bold leading-snug text-white"><span className="sr-only">Rank {c.rank}: </span>{c.name}</span>
        {pinned && <span className="block text-xs font-semibold uppercase tracking-wider text-cyan">Your team</span>}
      </span>
      {c.total && <span className="shrink-0 text-right"><span className="block text-2xl font-extrabold leading-none tabular-nums text-white">{c.total}</span>{c.totalLabel && <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{c.totalLabel}</span>}</span>}
      {has && <span aria-hidden="true" className={`shrink-0 text-zinc-400 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>▾</span>}
    </>
  );
  const row = "flex min-h-14 w-full items-center gap-3 px-3 py-2.5";
  return (
    <>
      {has ? <button type="button" aria-expanded={open} onClick={onToggle} className={`${row} rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-cyan`}>{body}</button> : <div className={row}>{body}</div>}
      {has && open && <ul className="flex flex-wrap gap-2 px-3 pb-3 pl-[3.75rem]" aria-label={`${c.name} details`}>{c.parts.map((p) => <li key={p.label} className="rounded-full border px-3 py-1 text-sm text-zinc-100" style={{ borderColor: T.line, background: T.row }}><span className="text-zinc-400">{p.label}</span> <span className="font-bold tabular-nums">{p.value}</span></li>)}</ul>}
    </>
  );
}

/** A ranked list of cards instead of a wide table: rank, team, the headline number, and the other columns as chips that open under the name. */
export default function StandingsList({ d, team }: { d: TableData; team: string }) {
  const cards = useMemo(() => standingCards(d), [d]);
  const leader = useMemo(() => leaderOf(cards), [cards]);
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);
  const [flipped, setFlipped] = useState<Set<string>>(() => new Set());
  const shown = filterCards(cards, q);
  const want = norm(team);
  const mineCard = want ? cards.find((c) => norm(c.name) === want) : undefined;
  const anyParts = cards.some((c) => c.parts.length > 0);
  const toggle = (k: string) => setFlipped((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const isOpen = (c: StandingCard) => (all || (!!mineCard && c.key === mineCard.key)) !== flipped.has(c.key);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold leading-tight text-white">{d.title}</h2>
        {d.subtitle && <p className="mt-1 text-sm text-zinc-300">{d.subtitle}</p>}
        {leader && <p className="mt-2 text-sm text-zinc-300">Leading: <span className="font-bold text-white">{leader.name}</span>{leader.total ? <> with <span className="font-bold tabular-nums text-white">{leader.total}</span></> : null}</p>}
      </div>
      {cards.length > 12 && (
        <label className="block"><span className="sr-only">Find a team</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a team" autoComplete="off" className="min-h-11 w-full rounded-lg border border-zinc-700 bg-[#0a0b0d] px-3 text-base text-zinc-100 outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-cyan" />
        </label>
      )}
      {anyParts && <button type="button" onClick={() => { setAll((v) => !v); setFlipped(new Set()); }} className="min-h-11 rounded-lg border border-zinc-700 px-4 text-sm font-semibold text-zinc-100 outline-none hover:border-zinc-500 focus-visible:ring-2 focus-visible:ring-cyan">{all ? "Hide match details" : "Show match details"}</button>}
      {mineCard && (
        <div className="sticky top-14 z-20 rounded-xl border-2 border-cyan bg-[#05070a] shadow-none" role="group" aria-label="Your team">
          <Card c={mineCard} pinned open={isOpen(mineCard)} onToggle={() => toggle(mineCard.key)} />
        </div>
      )}
      {shown.length === 0 ? <p role="status" className="text-sm text-zinc-300">{cards.length === 0 ? "No results yet." : "No team matches that search."}</p> : (
        <ol className="space-y-2">
          {shown.map((c) => {
            const mine = !!mineCard && c.key === mineCard.key;
            return <li key={c.key} data-mine={mine ? "1" : undefined} className="rounded-xl border" style={{ background: T.row, borderColor: mine ? T.accent : T.line, borderWidth: mine ? 2 : 1 }}><Card c={c} open={isOpen(c)} onToggle={() => toggle(c.key)} /></li>;
          })}
        </ol>
      )}
    </div>
  );
}
