"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { explain } from "@/lib/api/cloud";
import { directory } from "@/lib/api/f-directory";
import { emptyFilters, emptyReason, formatDay, hasFilters, listQuery, mergePages, MODES, modeLabel, safeRegLink, todayIso, whenText, type DirectoryEntry, type Filters, type Mode } from "@/lib/directory";

type Status = "loading" | "ready" | "error";

function Card({ e, today, onReport }: { e: DirectoryEntry; today: string; onReport: (e: DirectoryEntry) => void }) {
  const link = safeRegLink(e.regLink);
  return (
    <li className="card space-y-3 !p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="min-w-0 break-words font-display text-xl font-bold leading-tight text-white">{e.title}</h2>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${e.ended ? "border-zinc-600 text-zinc-300" : "border-cyan text-cyan"}`}>{whenText(e.startsOn, today)}</span>
      </div>
      <p className="text-base text-zinc-200">{e.game} · {formatDay(e.startsOn)} · {modeLabel(e.mode)}{e.city ? ` · ${e.city}` : ""}</p>
      {e.blurb && <p className="break-words text-base leading-7 text-zinc-300">{e.blurb}</p>}
      <div className="flex flex-wrap items-center gap-3">
        {e.ended
          ? <span className="text-sm text-zinc-300">This event has ended, so registration is closed.</span>
          : link && <a href={link} className="btn px-5" rel="noopener">Register your team<span className="sr-only"> for {e.title}</span></a>}
        <button type="button" className="min-h-11 px-2 text-sm text-zinc-300 underline underline-offset-4 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan" onClick={() => onReport(e)}>Report this listing<span className="sr-only">: {e.title}</span></button>
      </div>
    </li>
  );
}

/** The page players open to find an event to enter. Organisers opt events in from their own event page. */
export default function TournamentsPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [games, setGames] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [moreBusy, setMoreBusy] = useState(false);
  const [moreErr, setMoreErr] = useState("");
  const [err, setErr] = useState("");
  const [reporting, setReporting] = useState<DirectoryEntry | null>(null);
  const [reason, setReason] = useState("");
  const [rBusy, setRBusy] = useState(false);
  const [note, setNote] = useState("");
  const [rErr, setRErr] = useState("");
  const [today, setToday] = useState("");
  const seq = useRef(0);

  useEffect(() => setToday(todayIso()), []);

  const load = useCallback((f: Filters) => {
    const mine = ++seq.current;
    setStatus("loading"); setErr("");
    directory.list(listQuery(f)).then((r) => {
      if (mine !== seq.current) return;
      setEntries(r.entries); setPage(r.page); setMore(r.hasMore);
      // The choices in the selects come from what is listed, but never shrink while a filter is on, so a person can always switch back.
      if (!hasFilters(f)) { setGames(r.games); setCities(r.cities); }
      setStatus("ready");
    }).catch((e) => { if (mine === seq.current) { setErr(explain(e)); setStatus("error"); } });
  }, []);
  useEffect(() => load(filters), [filters, load]);

  const showMore = () => {
    setMoreBusy(true); setMoreErr("");
    directory.list(listQuery(filters, page + 1)).then((r) => { setEntries((cur) => mergePages(cur, r.entries)); setPage(r.page); setMore(r.hasMore); })
      .catch((e) => setMoreErr(explain(e))).finally(() => setMoreBusy(false));
  };

  const sendReport = async () => {
    if (!reporting) return;
    setRBusy(true); setRErr("");
    try {
      await directory.report(reporting.id, reason);
      setNote(`Thank you. We have noted your report about "${reporting.title}". Listings with several reports are hidden until the organiser edits them.`);
      setReporting(null); setReason("");
    } catch (e) { setRErr((e as { status?: number }).status === 429 ? "You have sent several reports already. Please try again in an hour." : explain(e)); }
    finally { setRBusy(false); }
  };

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8 text-base text-zinc-100">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-extrabold leading-tight text-white">Find a tournament</h1>
        <p className="text-base leading-7 text-zinc-300">Events that organisers have chosen to list. Pick one and use its Register button: you sign up on the organiser&apos;s own page.</p>
      </header>

      <section aria-label="Filters" className="card space-y-4 !p-4">
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-zinc-200">How is it played?</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="chip" aria-pressed={filters.mode === ""} onClick={() => set({ mode: "" })}>Any</button>
            {MODES.map((m) => <button key={m.id} type="button" className="chip" aria-pressed={filters.mode === m.id} onClick={() => set({ mode: m.id as Mode })}>{m.label}</button>)}
          </div>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-zinc-200">Game
            <select className="field mt-1 text-base" value={filters.game} onChange={(e) => set({ game: e.target.value })}>
              <option value="">All games</option>
              {filters.game && !games.includes(filters.game) && <option value={filters.game}>{filters.game}</option>}
              {games.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-zinc-200">City
            <select className="field mt-1 text-base" value={filters.city} onChange={(e) => set({ city: e.target.value })}>
              <option value="">All cities</option>
              {filters.city && !cities.includes(filters.city) && <option value={filters.city}>{filters.city}</option>}
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        {hasFilters(filters) && <button type="button" className="btn-ghost px-4 text-sm" onClick={() => setFilters(emptyFilters)}>Clear filters</button>}
      </section>

      <div role="status" aria-live="polite" className="min-h-6 text-sm text-zinc-300">{note}</div>

      {status === "loading" && <p role="status" className="card !p-4 text-zinc-300">Loading events…</p>}

      {status === "error" && (
        <div role="alert" className="card space-y-3 !p-4">
          <p className="text-zinc-100">{err}</p>
          <button type="button" className="btn px-5" onClick={() => load(filters)}>Try again</button>
        </div>
      )}

      {status === "ready" && entries.length === 0 && (
        <section className="card space-y-3 !p-5">
          <h2 className="font-display text-xl font-bold text-white">Nothing to show</h2>
          <p className="leading-7 text-zinc-300">{emptyReason(filters)}</p>
          {hasFilters(filters)
            ? <button type="button" className="btn px-5" onClick={() => setFilters(emptyFilters)}>Clear filters</button>
            : <p className="leading-7 text-zinc-300">Running an event? Open it, set up team registration, then use <strong className="text-white">List this event publicly</strong> to appear here.</p>}
          <Link href="/events/" className="btn-ghost px-5">Go to my events</Link>
        </section>
      )}

      {status === "ready" && entries.length > 0 && (
        <>
          <p className="text-sm text-zinc-300" aria-live="polite">Showing {entries.length} event{entries.length === 1 ? "" : "s"}{more ? ", more below" : ""}.</p>
          <ul className="space-y-3">{entries.map((e) => <Card key={e.id} e={e} today={today || todayIso()} onReport={(x) => { setReporting(x); setReason(""); setRErr(""); setNote(""); }} />)}</ul>
          {more && (
            <div className="space-y-2 text-center">
              <button type="button" className="btn-ghost px-6" disabled={moreBusy} onClick={showMore}>{moreBusy ? "Loading…" : "Show more"}</button>
              {moreErr && <p role="alert" className="text-sm text-zinc-200">{moreErr}</p>}
            </div>
          )}
        </>
      )}

      {reporting && (
        <div role="dialog" aria-modal="true" aria-labelledby="rep-h" className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-3 sm:place-items-center">
          <div className="card w-full max-w-md space-y-3 !bg-zinc-950 !p-5">
            <h2 id="rep-h" className="font-display text-xl font-bold text-white">Report this listing?</h2>
            <p className="leading-7 text-zinc-300">You are reporting <strong className="text-white">{reporting.title}</strong>. We do not contact the organiser for you. When several people report a listing it is hidden until the organiser edits it. Nothing about you is shown to the organiser.</p>
            <label className="block text-sm font-semibold text-zinc-200">What is wrong? (optional)
              <textarea className="field mt-1 min-h-24 text-base" maxLength={200} value={reason} onChange={(e) => setReason(e.target.value)} />
            </label>
            {rErr && <p role="alert" className="text-sm text-zinc-100">{rErr}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn px-5" disabled={rBusy} onClick={sendReport}>{rBusy ? "Sending…" : "Yes, report it"}</button>
              <button type="button" className="btn-ghost px-5" disabled={rBusy} onClick={() => setReporting(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
