"use client";

import { useEffect, useMemo, useState } from "react";
import { runofshow } from "@/lib/api/f-runofshow";
import { createPoller } from "@/lib/api/poller";
import { agoText } from "@/lib/live";
import { STATUS_LABEL, dayText, displayTime, filterByOwner, inText, nowNext, owners, ownerKey, progress, readToken, sortByTime, type PublicRos } from "@/lib/runofshow";

type Status = "loading" | "ready" | "missing" | "error";
type Row = PublicRos["items"][number];

const readName = (k: string) => { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } };
const saveName = (k: string, v: string) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch { /* private mode */ } };

function Big({ label, row, extra }: { label: string; row: Row; extra?: string }) {
  return (
    <div role="note" className="rounded-2xl border-2 border-cyan/60 bg-[#0a0b0d] p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-cyan">{label}{extra ? ` · ${extra}` : ""}</p>
      <p className="mt-1 break-words text-lg font-semibold leading-snug text-white">{row.title}</p>
      <p className="mt-1 text-base text-zinc-300">{displayTime(row.atTime)}{row.ownerName ? ` · ${row.ownerName}` : ""}</p>
      {row.notes && <p className="mt-1 break-words text-base text-zinc-300">{row.notes}</p>}
    </div>
  );
}

/** The read-only list a volunteer opens from a link. Phone first, updates by itself, highlights what is on now and what is next. */
export default function RunPage() {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<PublicRos | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [okAt, setOkAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [offline, setOffline] = useState(false);
  const [me, setMe] = useState("");

  useEffect(() => { const t = readToken(location.search); if (t) { setToken(t); setMe(readName(ownerKey(t))); } else { setToken(""); setStatus("missing"); } }, []);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(id); }, []);

  useEffect(() => {
    if (!token) return;
    const p = createPoller<PublicRos>({
      fetch: () => runofshow.public(token),
      same: (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b),
      onData: (d) => { setData(d); setStatus("ready"); setOkAt(Date.now()); setOffline(false); },
      onError: (e) => { const s = (e as { status?: number }).status; if (s === 404) { setStatus("missing"); setData(null); } else { setOffline(true); setStatus((cur) => (cur === "loading" ? "error" : cur)); } },
      minMs: 15_000, maxMs: 60_000, staleMs: 10_000,
    });
    const wake = () => { setOffline(!navigator.onLine); p.resume(); };
    document.addEventListener("visibilitychange", wake); window.addEventListener("online", wake); window.addEventListener("offline", wake); window.addEventListener("focus", wake);
    p.start();
    return () => { p.stop(); document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); window.removeEventListener("offline", wake); window.removeEventListener("focus", wake); };
  }, [token]);

  const all = useMemo(() => (data ? sortByTime(data.items) : []), [data]);
  const people = useMemo(() => owners(all), [all]);
  const mine = me && people.some((p) => p.toLowerCase() === me.toLowerCase()) ? me : "";
  const shown = useMemo(() => filterByOwner(all, mine), [all, mine]);
  const nowMin = Math.floor(now / 60_000);
  const nn = useMemo(() => nowNext(shown, new Date(nowMin * 60_000), data?.event.date ?? ""), [shown, nowMin, data]);
  const prog = progress(shown);
  const pick = (v: string) => { setMe(v); if (token) saveName(ownerKey(token), v); };

  if (status === "missing") return (
    <section className="mx-auto max-w-xl py-16 text-center" aria-label="Run of show">
      <h1 className="font-display text-2xl font-bold text-white">This link is not working</h1>
      <p role="status" className="mt-3 text-zinc-300">The organiser may have stopped it, or the link is not complete. Ask the organiser for a new link.</p>
    </section>
  );
  if (status === "loading" || token === null) return (
    <section aria-label="Run of show" aria-busy="true" className="space-y-4">
      <p className="sr-only" role="status">Loading the run of show</p>
      <div className="sk h-9 w-2/3 rounded-lg" /><div className="sk h-24 w-full rounded-2xl" /><div className="sk h-72 w-full rounded-2xl" />
    </section>
  );
  if (status === "error" || !data) return (
    <section className="mx-auto max-w-xl py-16 text-center" aria-label="Run of show">
      <h1 className="font-display text-2xl font-bold text-white">Could not load the run of show</h1>
      <p role="alert" className="mt-3 text-zinc-300">Check your connection. It tries again by itself.</p>
    </section>
  );

  const ev = data.event;
  const days = new Set(shown.map((i) => i.dayOffset));
  return (
    <section aria-label={`Run of show for ${ev.name}`} className="ros-root mx-auto max-w-2xl space-y-4 pb-8">
      <style>{`footer.no-print{display:none}div.no-print.sticky.top-3{display:none}main:has(.ros-root){padding-top:0}`}</style>
      <header className="sticky top-0 z-30 -mx-4 flex h-14 items-center gap-3 border-b border-white/10 bg-[#05070a]/95 px-4 backdrop-blur">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-base font-bold leading-tight text-white">{ev.name}</h1>
          <p className="truncate text-xs leading-tight text-zinc-300">Run of show{okAt ? ` · Updated ${agoText(now - okAt)}` : ""}</p>
        </div>
      </header>
      <p className="text-sm text-zinc-300">{[ev.date, ev.venue].filter(Boolean).join(" · ")}</p>
      <div role="status" aria-live="polite" className="empty:hidden">{offline ? <p className="rounded-lg border border-amber-300/40 bg-[#0a0b0d] px-3 py-2 text-sm text-amber-200">You are offline. Showing the last update.</p> : null}</div>

      {people.length > 0 && (
        <label className={`block rounded-2xl bg-[#0a0b0d] p-4 ${mine ? "border border-white/10" : "border-2 border-cyan"}`}>
          <span className="block font-display text-lg font-bold text-white">{mine ? "Showing only my items" : "Which one is you?"}</span>
          <span className="mt-1 block text-sm text-zinc-300">{mine ? "Choose Everyone to see the whole list." : "Pick your name to show only your items. We remember it on this phone."}</span>
          <select value={mine} onChange={(e) => pick(e.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-zinc-700 bg-[#05070a] px-3 text-base text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan" aria-label="Show only my items"><option value="">Everyone</option>{people.map((p) => <option key={p} value={p}>{p}</option>)}</select>
        </label>
      )}

      {all.length === 0 ? <p role="status" className="card text-zinc-300">Nothing has been added yet. Check back soon.</p> : shown.length === 0 ? <p role="status" className="card text-zinc-300">No items for {mine}.</p> : (
        <>
          {nn.now && <Big label="Now" row={nn.now} />}
          {nn.next && <Big label="Next" row={nn.next} extra={nn.minutesToNext !== null ? `in ${inText(nn.minutesToNext)}` : undefined} />}
          {!nn.now && !nn.next && <p className="text-sm text-zinc-300">Nothing is left on the list for the current time.</p>}
          <p className="text-sm text-zinc-300">{prog.done} of {prog.total} done</p>
          <ol className="space-y-2">
            {shown.map((r, i) => {
              const isNow = nn.now === r, isNext = nn.next === r;
              const head = days.size > 1 && (i === 0 || shown[i - 1]!.dayOffset !== r.dayOffset);
              return (
                <li key={r.id}>
                  {head && <h2 className="pb-1 pt-3 text-xs font-bold uppercase tracking-wider text-zinc-300">{r.dayOffset === 0 ? "Event day" : dayText(r.dayOffset)}</h2>}
                  <div className={`rounded-xl border p-3 ${isNow ? "border-cyan bg-cyan/10" : isNext ? "border-cyan/50 bg-[#0a0b0d]" : "border-white/10 bg-[#0a0b0d]"}`}>
                    <p className="flex flex-wrap items-center gap-x-2 text-sm text-zinc-300">
                      <span className="font-bold text-white">{displayTime(r.atTime)}</span>
                      {isNow && <span className="rounded-full bg-cyan px-2 text-xs font-bold text-ink">NOW</span>}
                      {isNext && <span className="rounded-full border border-cyan px-2 text-xs font-bold text-cyan">NEXT</span>}
                      <span className={`ml-auto rounded-full border px-2 text-xs font-semibold ${r.status === "done" ? "border-emerald-300/60 text-emerald-300" : r.status === "doing" ? "border-cyan text-cyan" : "border-zinc-600 text-zinc-300"}`}>{r.status === "done" ? "✓ " : r.status === "doing" ? "● " : ""}{STATUS_LABEL[r.status]}</span>
                    </p>
                    <p className={`mt-1 break-words text-base font-semibold leading-snug ${r.status === "done" ? "text-zinc-400" : "text-white"}`}>{r.title}</p>
                    {r.ownerName && <p className="text-sm text-zinc-300">Owner: {r.ownerName}</p>}
                    {r.notes && <p className="mt-1 break-words text-sm text-zinc-400">{r.notes}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
      <p className="pt-2 text-center text-xs text-zinc-400">Times are the venue&apos;s local time. This page is read only: ask the organiser to change anything.</p>
    </section>
  );
}
