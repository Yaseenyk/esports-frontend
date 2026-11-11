"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { league } from "@/lib/api/f-leaderboard";
import { createPoller } from "@/lib/api/poller";
import { agoText } from "@/lib/live";
import { buildLeague, movementInfo, ordinal, parseSettings, pointsText, rowFor, scoringText, tableFor, tieBreakText, type LeagueRow, type PublicLeague } from "@/lib/league";

type Status = "loading" | "ready" | "missing" | "error";
const SLUG = /^[a-z0-9-]{3,40}$/;
const teamKey = (slug: string) => `eh-league-team-${slug}`;
function readTeam(slug: string) { try { return localStorage.getItem(teamKey(slug)) ?? ""; } catch { return ""; } }
function saveTeam(slug: string, t: string) { try { if (t) localStorage.setItem(teamKey(slug), t); else localStorage.removeItem(teamKey(slug)); } catch { /* private mode: not remembered */ } }

const FORM_STYLE: Record<string, string> = { W: "border-emerald-300/60 text-emerald-200", D: "border-zinc-400 text-zinc-200", L: "border-red-300/60 text-red-200", P: "border-cyan/60 text-cyan" };

/** Last results as small chips. Each one has the letter and words, so colour is never the only clue. */
function Form({ row }: { row: LeagueRow }) {
  if (!row.form.length) return <p className="text-sm text-zinc-400">No results yet</p>;
  return (
    <p className="flex flex-wrap items-center gap-1.5 text-sm">
      <span className="text-zinc-400">Form</span>
      {row.form.map((f, i) => <span key={i} className={`inline-flex min-w-7 items-center justify-center rounded-md border px-1.5 text-xs font-bold leading-6 ${FORM_STYLE[f.kind]}`}><span aria-hidden="true">{f.short}</span><span className="sr-only">{f.label}{i < row.form.length - 1 ? "," : ""}</span></span>)}
    </p>
  );
}

function Move({ row, first }: { row: LeagueRow; first: boolean }) {
  const mv = movementInfo(row.movement);
  const tone = row.movement === null ? "text-zinc-300" : row.movement > 0 ? "text-emerald-300" : row.movement < 0 ? "text-red-300" : "text-zinc-300";
  if (first && row.movement === null) return null; // the first day has nothing to compare with: say nothing rather than "New" for everyone
  return <span className={`inline-flex items-center gap-1 text-sm font-semibold ${tone}`}><span aria-hidden="true">{mv.arrow}</span><span>{mv.text}</span></span>;
}

function Card({ row, mine, first, drew }: { row: LeagueRow; mine: boolean; first: boolean; drew: boolean }) {
  const h2h = row.won + row.drawn + row.lost;
  const stats = [`Played ${row.played}`, h2h ? `W ${row.won} D ${row.drawn} L ${row.lost}` : "", row.firsts ? `${row.firsts} ${row.firsts === 1 ? "win" : "wins"} in battle royale` : "", row.kills ? `${row.kills} ${row.kills === 1 ? "kill" : "kills"}` : ""].filter(Boolean).join(" · ");
  return (
    <li className={`rounded-2xl p-4 ${mine ? "border-2 border-cyan bg-[#0a0b0d]" : "border border-white/10 bg-[#0a0b0d]"}`} aria-current={mine ? "true" : undefined}>
      <div className="flex items-start gap-3">
        <div className="w-12 shrink-0 text-center">
          <p className="font-display text-2xl font-extrabold leading-none text-white"><span className="sr-only">{row.tied ? "Shared rank " : "Rank "}</span>{row.rank}</p>
          {row.tied && <p className="mt-1 text-xs text-zinc-300">level</p>}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-bold leading-snug text-white">{row.team}{mine && <span className="ml-2 inline-block rounded-full bg-cyan px-2 py-0.5 align-middle text-xs font-bold text-ink">Your team</span>}</h3>
          <p className="mt-0.5 text-sm text-zinc-300">{stats}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-2xl font-extrabold leading-none text-white">{pointsText(row.points)}<span className="sr-only"> points</span></p>
          <p className="mt-1 text-xs text-zinc-300">points</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/10 pt-3">
        <Form row={row} />
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {drew && <span className="text-sm text-zinc-200">{row.dayPoints >= 0 ? "+" : ""}{pointsText(row.dayPoints)} on this day</span>}
          <Move row={row} first={first} />
        </p>
      </div>
    </li>
  );
}

/** The public season leaderboard players and fans open from a link or QR code. Phone first; everything is plain text. */
export default function LeaguePage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [data, setData] = useState<PublicLeague | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [okAt, setOkAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [offline, setOffline] = useState(false);
  const [day, setDay] = useState<number | null>(null);
  const [team, setTeam] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { const s = new URLSearchParams(location.search).get("s") ?? ""; if (SLUG.test(s)) { setSlug(s); setTeam(readTeam(s)); } else { setSlug(""); setStatus("missing"); } }, []);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  useEffect(() => {
    if (!slug) return;
    const p = createPoller<PublicLeague>({
      fetch: () => league.public(slug),
      same: (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b),
      onData: (d) => { setData(d); setStatus("ready"); setOkAt(Date.now()); setOffline(false); },
      onError: (e) => { const s = (e as { status?: number }).status; if (s === 404) { setStatus("missing"); setData(null); } else { setOffline(true); setStatus((cur) => (cur === "loading" ? "error" : cur)); } },
      minMs: 20_000, maxMs: 60_000, staleMs: 15_000,
    });
    const wake = () => { setOffline(!navigator.onLine); p.resume(); };
    document.addEventListener("visibilitychange", wake); window.addEventListener("online", wake); window.addEventListener("offline", wake); window.addEventListener("focus", wake);
    p.start();
    return () => { p.stop(); document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); window.removeEventListener("offline", wake); window.removeEventListener("focus", wake); };
  }, [slug]);

  const settings = useMemo(() => parseSettings({ ...(data?.settings ?? {}), title: data?.title ?? "" }), [data]);
  const lg = useMemo(() => (data ? buildLeague({ matches: Array.isArray(data.matches) ? data.matches : [], br: Array.isArray(data.br) ? data.br : [], settings }) : null), [data, settings]);
  const dayIndex = lg ? Math.min(day ?? lg.latest, lg.tables.length - 1) : 0;
  const table = lg ? tableFor(lg, dayIndex) : null;
  const mine = useMemo(() => (team && lg?.teams.some((t) => t.toLowerCase() === team.toLowerCase()) ? team : ""), [team, lg]);
  const mineRow = rowFor(table, mine);
  const pick = (t: string) => { setTeam(t); if (slug) saveTeam(slug, t); };

  const share = useCallback(async () => {
    const url = location.href, title = data?.title ?? "Season leaderboard";
    try { if (navigator.share) { await navigator.share({ title, url }); return; } } catch (e) { if ((e as Error).name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); setMsg("Link copied."); } catch { setMsg("Could not copy. Copy the address from your browser instead."); }
  }, [data]);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(""), 4000); return () => clearTimeout(t); }, [msg]);

  if (status === "missing") return (
    <section className="mx-auto max-w-xl py-16 text-center" aria-label="Season leaderboard">
      <h1 className="font-display text-2xl font-bold text-white">This leaderboard is not live yet</h1>
      <p role="status" className="mt-3 text-zinc-300">The organiser has not published it, or the link is not right. Check the link, or ask the organiser.</p>
    </section>
  );
  if (status === "loading" || slug === null) return (
    <section aria-label="Season leaderboard" aria-busy="true" className="space-y-4">
      <p className="sr-only" role="status">Loading the leaderboard</p>
      <div className="sk h-9 w-2/3 rounded-lg" /><div className="sk h-5 w-1/2 rounded-lg" /><div className="sk h-12 w-full rounded-xl" /><div className="sk h-24 w-full rounded-2xl" /><div className="sk h-24 w-full rounded-2xl" />
    </section>
  );
  if (status === "error" || !data || !lg || !table) return (
    <section className="mx-auto max-w-xl py-16 text-center" aria-label="Season leaderboard">
      <h1 className="font-display text-2xl font-bold text-white">Could not load this leaderboard</h1>
      <p role="alert" className="mt-3 text-zinc-300">Check your connection. It tries again by itself.</p>
    </section>
  );

  const ev = data.event;
  const moreDays = lg.days.length > 1;
  return (
    <section aria-label={`Season leaderboard for ${ev.name}`} className="lg-root mx-auto max-w-3xl space-y-4 pb-6">
      <style>{`footer.no-print{display:none}div.no-print.sticky.top-3{display:none}main:has(.lg-root){padding-top:0}`}</style>
      <header className="sticky top-0 z-30 -mx-4 flex min-h-14 items-center gap-3 border-b border-white/10 bg-[#05070a]/95 px-4 py-2 backdrop-blur">
        <div className="min-w-0 flex-1">
          <h1 className="break-words font-display text-base font-bold leading-tight text-white">{data.title}</h1>
          <p className="text-xs leading-tight text-zinc-300">{okAt ? `Updated ${agoText(now - okAt)}` : ""}</p>
        </div>
        <button type="button" onClick={share} className="btn-ghost shrink-0 px-4 text-sm font-semibold">Share</button>
      </header>
      <p className="text-sm text-zinc-300">{[ev.name !== data.title ? ev.name : "", ev.date, ev.venue].filter(Boolean).join(" · ")}</p>
      <div role="status" aria-live="polite" className="empty:hidden">
        {msg ? <p className="rounded-lg border border-white/15 bg-[#0a0b0d] px-3 py-2 text-sm text-zinc-100">{msg}</p> : offline ? <p className="rounded-lg border border-amber-300/40 bg-[#0a0b0d] px-3 py-2 text-sm text-amber-200">You are offline. Showing the last update.</p> : null}
      </div>

      {lg.teams.length > 0 && (
        <label className={`block rounded-2xl bg-[#0a0b0d] p-4 ${mine ? "border border-white/10" : "border-2 border-cyan"}`}>
          {mine
            ? <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">My team</span>
            : <><span className="block font-display text-xl font-bold text-white">Which team are you?</span><span className="mt-1 block text-sm text-zinc-300">We will highlight it for you on this phone. <span className="sr-only">My team</span></span></>}
          <select value={mine} onChange={(e) => pick(e.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-zinc-700 bg-[#05070a] px-3 text-base text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan"><option value="">{mine ? "Not chosen" : "Pick your team"}</option>{lg.teams.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        </label>
      )}

      {mine && mineRow && (
        <div role="note" className="rounded-2xl border-2 border-cyan/60 bg-[#0a0b0d] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan">Your team</p>
          <p className="mt-1 text-lg font-semibold leading-snug text-white">{mine} is {ordinal(mineRow.rank)}{mineRow.tied ? " (level with another team)" : ""} with {pointsText(mineRow.points)} {mineRow.points === 1 ? "point" : "points"}.</p>
          {mineRow.movement !== null && moreDays && dayIndex > 0 && <p className="mt-1 text-sm text-zinc-200">Since the day before: {movementInfo(mineRow.movement).text.toLowerCase()}.</p>}
        </div>
      )}

      {lg.empty ? (
        <div role="status" className="card space-y-2 text-zinc-300">
          <p className="font-semibold text-white">No results yet</p>
          <p>The table fills in as soon as the organiser records the first result. This page updates by itself, so you can leave it open.</p>
        </div>
      ) : (
        <>
          {moreDays && (
            <div role="group" aria-label="Choose a day" className="flex flex-wrap gap-2">
              {lg.days.map((d, i) => (
                <button key={d.index} type="button" aria-pressed={i === dayIndex} onClick={() => setDay(i)} className={`min-h-11 rounded-full border px-4 text-[15px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-cyan ${i === dayIndex ? "border-cyan bg-cyan text-ink" : "border-zinc-700 text-zinc-100 hover:border-zinc-500"}`}>{d.label}{lg.tables[i]!.results === 0 && <span className="sr-only"> (no results yet)</span>}</button>
              ))}
            </div>
          )}
          <h2 className="font-display text-lg font-bold text-white">{moreDays ? `Table after ${table.day.label}` : "Table"}</h2>
          {moreDays && table.results === 0 && <p role="status" className="text-sm text-zinc-300">No results on {table.day.label} yet. Showing the table from the days before.</p>}
          {moreDays && table.day.date && <p className="text-sm text-zinc-300">{table.day.date}</p>}
          <ol aria-label="Ranking" className="space-y-3">
            {table.rows.map((r) => <Card key={r.team} row={r} mine={!!mine && r.team.toLowerCase() === mine.toLowerCase()} first={dayIndex === 0} drew={moreDays} />)}
          </ol>
        </>
      )}

      <details className="rounded-2xl border border-white/10 bg-[#0a0b0d] px-4">
        <summary className="flex min-h-12 cursor-pointer items-center text-base font-semibold text-zinc-100">How the points work</summary>
        <div className="space-y-2 pb-4 text-base leading-7 text-zinc-200">
          {scoringText(settings).map((t, i) => <p key={i}>{t}</p>)}
          <p>{tieBreakText()}</p>
          {moreDays && <p>The table after a day counts that day and every day before it. The arrow shows how many places a team moved since the day before.</p>}
        </div>
      </details>

      <p className="pt-2 text-center text-sm text-zinc-400"><Link href="/tools/" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-white">Made with Esports Hub, free tools for event organisers</Link></p>
    </section>
  );
}
