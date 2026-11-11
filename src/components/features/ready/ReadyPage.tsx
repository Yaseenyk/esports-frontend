"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { captain } from "@/lib/api/f-ready";
import { createPoller } from "@/lib/api/poller";
import { explain } from "@/lib/api/cloud";
import { captainState, clockOffset, graceDeadlineMs, spanText, tokenFromSearch, type CaptainData, type CaptainMatch, type CaptainState } from "@/lib/ready";
import { takeTokenSearch } from "@/lib/tokenHygiene";

type Status = "loading" | "ready" | "missing" | "error";

const hourMinute = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); };

function Dot({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-base text-zinc-100">
      <span aria-hidden="true" className={`grid h-6 w-6 place-items-center rounded-full border-2 text-xs font-extrabold ${on ? "border-emerald-400 bg-emerald-400 text-ink" : "border-zinc-500 text-zinc-400"}`}>{on ? "✓" : ""}</span>
      <span>{label}: <strong>{on ? "here and ready" : "not yet"}</strong></span>
    </span>
  );
}

const HEADLINE: Record<CaptainState, string> = {
  noOpponent: "Your opponent is not decided yet",
  live: "Your match is live",
  both: "Both teams are ready",
  waiting: "Waiting for your opponent",
  early: "Not time to check in yet",
  late: "You are past the start time",
  ready: "Tap when your team is here",
};

function MatchCard({ m, data, now, big, busy, onMark }: { m: CaptainMatch; data: CaptainData; now: number; big: boolean; busy: boolean; onMark: (m: CaptainMatch, ready: boolean) => void }) {
  const state = captainState(m, data.graceMinutes, now);
  const untilStart = Date.parse(m.startsAt) - now;
  const deadline = graceDeadlineMs(m.startsAt, data.graceMinutes);
  const graceLeft = deadline === null ? null : deadline - now;
  const canTap = state === "ready" || state === "late";
  return (
    <article aria-label={`Match against ${m.opponent || "an opponent to be decided"}`} className={`rounded-2xl bg-[#0a0b0d] p-4 ${big ? "border-2 border-cyan" : "border border-white/10"}`}>
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">{big ? "Your next match" : "Later"}</p>
      <h2 className="mt-1 font-display text-2xl font-bold text-white">{data.team} <span className="text-zinc-300">vs</span> {m.opponent || "to be decided"}</h2>
      <p className="mt-1 text-base text-zinc-200">Starts at <strong>{hourMinute(m.startsAt)}</strong>{state !== "live" && (untilStart > 0 ? <> (in {spanText(untilStart)})</> : <> (due {spanText(-untilStart)} ago)</>)}</p>
      <p className="mt-3 font-display text-lg font-bold text-white">{HEADLINE[state]}</p>
      <div className="mt-2 flex flex-col gap-1.5">
        <Dot on={m.youReady} label="You" />
        <Dot on={m.opponentReady} label={m.opponent || "Opponent"} />
      </div>
      {state === "early" && <p className="mt-3 text-base text-zinc-300">The button opens 60 minutes before the start, at {hourMinute(new Date(Date.parse(m.startsAt) - 3_600_000).toISOString())}.</p>}
      {state === "waiting" && <p role="status" className="mt-3 text-base text-zinc-200">You are marked as here. We will tell the organiser. This page updates by itself, so you can keep it open.</p>}
      {state === "both" && <p role="status" className="mt-3 text-base text-emerald-300">Both teams are here. Wait for the organiser to call you.</p>}
      {state === "late" && <p role="status" className="mt-3 text-base text-amber-200">The organiser allowed {data.graceMinutes} minutes after the start. Tap now so they know you are here.</p>}
      {state === "ready" && graceLeft !== null && <p className="mt-3 text-base text-zinc-300">{graceLeft > 0 ? `The organiser waits ${data.graceMinutes} minutes after the start before deciding about a missing team.` : ""}</p>}
      {canTap && (
        <button type="button" disabled={busy} onClick={() => onMark(m, true)} className="mt-4 min-h-20 w-full rounded-2xl bg-emerald-400 px-4 font-display text-2xl font-extrabold text-ink outline-none transition-opacity hover:opacity-90 focus-visible:ring-4 focus-visible:ring-white/70 disabled:opacity-60">
          {busy ? "Saving" : "We are here"}
        </button>
      )}
      {m.youReady && state !== "live" && m.canMark && (
        <button type="button" disabled={busy} onClick={() => onMark(m, false)} className="btn-ghost mt-3 w-full">We are not ready after all</button>
      )}
    </article>
  );
}

/** The page a team captain opens from the link the organiser sent. Phone first, refreshes every 15 seconds, shows plain text only. */
export default function ReadyPage() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [data, setData] = useState<CaptainData | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [offline, setOffline] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const poller = useRef<ReturnType<typeof createPoller<CaptainData>> | null>(null);

  useEffect(() => { setToken(tokenFromSearch(takeTokenSearch())); }, []);
  useEffect(() => { if (token === null) setStatus("missing"); }, [token]);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(""), 5000); return () => clearTimeout(t); }, [msg]);

  useEffect(() => {
    if (!token) return;
    const p = createPoller<CaptainData>({
      fetch: () => captain.get(token),
      onData: (d) => { setData(d); setStatus("ready"); setOffline(false); setOffset(clockOffset(d.serverTime, Date.now())); },
      onError: (e) => { if ((e as { status?: number }).status === 404) { setStatus("missing"); setData(null); } else { setOffline(true); setStatus((cur) => (cur === "loading" ? "error" : cur)); } },
      minMs: 15_000, maxMs: 30_000, staleMs: 10_000,
    });
    poller.current = p;
    const wake = () => { setOffline(!navigator.onLine); p.resume(); };
    document.addEventListener("visibilitychange", wake); window.addEventListener("online", wake); window.addEventListener("offline", wake); window.addEventListener("focus", wake);
    p.start();
    return () => { p.stop(); poller.current = null; document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); window.removeEventListener("offline", wake); window.removeEventListener("focus", wake); };
  }, [token]);

  const mark = useCallback(async (m: CaptainMatch, isReady: boolean) => {
    if (!token) return;
    setBusy(m.id); setErr(""); setMsg("");
    try {
      const r = await captain.mark(token, m.id, isReady);
      setData((d) => (d ? { ...d, matches: d.matches.map((x) => (x.id === m.id ? { ...x, youReady: r.youReady, opponentReady: r.opponentReady, status: r.status } : x)) } : d));
      setMsg(isReady ? (r.opponentReady ? "Both teams are ready." : "Done. The organiser can see that you are here.") : "Done. You are marked as not ready.");
      poller.current?.nudge();
    } catch (e) {
      const s = (e as { status?: number; serverError?: string }).status;
      setErr(s === 409 ? ((e as { serverError?: string }).serverError ?? "That is not possible right now.") : explain(e));
    } finally { setBusy(""); }
  }, [token]);

  const shell = (children: React.ReactNode) => <main className="mx-auto w-full max-w-lg space-y-4 px-4 py-6" aria-label="Team ready check">{children}</main>;

  if (status === "missing") return shell(
    <section className="py-10 text-center">
      <h1 className="font-display text-2xl font-bold text-white">This link does not work</h1>
      <p role="status" className="mt-3 text-base text-zinc-300">It may be mistyped, or the organiser replaced it with a new one. Ask the organiser for your team link again.</p>
    </section>,
  );
  if (status === "loading" || token === undefined) return shell(
    <div aria-busy="true"><p className="sr-only" role="status">Loading your matches</p><div className="sk h-8 w-2/3 rounded-lg" /><div className="sk mt-4 h-64 w-full rounded-2xl" /></div>,
  );
  if (status === "error" || !data) return shell(
    <section className="py-10 text-center">
      <h1 className="font-display text-2xl font-bold text-white">Could not load your matches</h1>
      <p role="alert" className="mt-3 text-base text-zinc-300">Check your connection. We will try again by ourselves, or you can press the button.</p>
      <button type="button" className="btn mt-4" onClick={() => poller.current?.resume()}>Try again</button>
    </section>,
  );

  const t = now + offset;
  return shell(
    <>
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">{data.eventName}</p>
        <h1 className="font-display text-3xl font-bold text-white">{data.team}</h1>
      </header>
      {offline && <p role="status" className="rounded-lg border border-amber-300/40 p-3 text-base text-amber-200">You look offline. What you see may be out of date. It updates when you are back online.</p>}
      <div aria-live="polite" className="min-h-0">
        {msg && <p role="status" className="rounded-lg border border-emerald-400/50 p-3 text-base text-emerald-300">{msg}</p>}
        {err && <p role="alert" className="rounded-lg border border-rose-400/50 p-3 text-base text-rose-200">{err}</p>}
      </div>
      {data.matches.length === 0
        ? (
          <section className="rounded-2xl border border-white/10 bg-[#0a0b0d] p-5">
            <h2 className="font-display text-xl font-bold text-white">No match in the next 24 hours</h2>
            <p className="mt-2 text-base text-zinc-300">When the organiser gives your team a match time, it shows up here. You can leave this page open, it checks again every 15 seconds.</p>
          </section>
        )
        : data.matches.map((m, i) => <MatchCard key={m.id} m={m} data={data} now={t} big={i === 0} busy={busy === m.id} onMark={mark} />)}
      <p className="text-sm text-zinc-400">This is your team link. Do not share it outside your team: anyone with it can mark your team as here. The organiser can replace it at any time.</p>
    </>,
  );
}
