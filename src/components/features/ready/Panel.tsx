"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PanelProps } from "@/components/app/panels";
import ToolStep from "@/components/tools/ToolStep";
import { ready, type BoardData, type BoardMatch } from "@/lib/api/f-ready";
import { createPoller } from "@/lib/api/poller";
import { explain } from "@/lib/api/cloud";
import { DEFAULT_GRACE, MAX_GRACE, clockOffset, forfeitConsequence, graceDeadlineMs, groupBoard, lateSides, needsNoShowConfirm, parseGrace, spanText } from "@/lib/ready";

const hm = (iso: string | null) => { if (!iso) return "no time set"; const d = new Date(iso); return Number.isNaN(d.getTime()) ? "no time set" : d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); };

function Dots({ m }: { m: BoardMatch }) {
  const one = (name: string, on: boolean) => (
    <span className="inline-flex items-center gap-2 text-sm text-zinc-100">
      <span aria-hidden="true" className={`grid h-5 w-5 place-items-center rounded-full border-2 text-[10px] font-extrabold ${on ? "border-emerald-400 bg-emerald-400 text-ink" : "border-zinc-500"}`}>{on ? "✓" : ""}</span>
      <span>{name || "to be decided"}: <strong>{on ? "here" : "not here yet"}</strong></span>
    </span>
  );
  return <div className="flex flex-col gap-1">{one(m.a, m.aReady)}{one(m.b, m.bReady)}</div>;
}

type Pending = { m: BoardMatch; side: "a" | "b" };

export default function Panel({ eventId }: PanelProps) {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [offset, setOffset] = useState(0);
  const [graceText, setGraceText] = useState("");
  const [graceTouched, setGraceTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [pending, setPending] = useState<Pending | null>(null);
  const [acting, setActing] = useState(false);
  const poller = useRef<ReturnType<typeof createPoller<BoardData>> | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  useEffect(() => {
    const p = createPoller<BoardData>({
      fetch: () => ready.board(eventId),
      onData: (d) => { setBoard(d); setLoadErr(""); setOffset(clockOffset(d.serverTime, Date.now())); },
      onError: (e) => setLoadErr(explain(e)),
      minMs: 15_000, maxMs: 30_000, staleMs: 10_000,
    });
    poller.current = p;
    const wake = () => p.resume();
    document.addEventListener("visibilitychange", wake); window.addEventListener("online", wake);
    p.start();
    return () => { p.stop(); poller.current = null; document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); };
  }, [eventId]);
  useEffect(() => { if (board && !graceTouched) setGraceText(String(board.settings.graceMinutes)); }, [board, graceTouched]);
  useEffect(() => { if (pending) cancelRef.current?.focus(); }, [pending]);
  useEffect(() => {
    if (!pending) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setPending(null); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [pending]);

  const grace = board?.settings.graceMinutes ?? DEFAULT_GRACE;
  const parsed = parseGrace(graceText);
  const t = now + offset;

  const refresh = async () => { const fresh = await ready.board(eventId).catch(() => null); if (fresh) setBoard(fresh); };

  const saveGrace = useCallback(async () => {
    if (parsed === null) return;
    setSaving(true); setErr(""); setMsg("");
    try {
      await ready.setGrace(eventId, parsed);
      setBoard((b) => (b ? { ...b, settings: { graceMinutes: parsed } } : b)); setGraceTouched(false);
      setMsg(`Saved. A team counts as late ${parsed} ${parsed === 1 ? "minute" : "minutes"} after the match start time.`);
    } catch (e) { setErr(explain(e)); } finally { setSaving(false); }
  }, [eventId, parsed]);

  const confirmForfeit = async () => {
    if (!pending) return;
    const { m, side } = pending;
    setActing(true); setErr(""); setMsg("");
    try {
      await ready.forfeit(eventId, m.id, side === "a" ? m.a : m.b, needsNoShowConfirm(m, side));
      setMsg(`${side === "a" ? m.a : m.b} is recorded as a forfeit. ${side === "a" ? m.b : m.a} wins.`);
      setPending(null);
      await refresh();
    } catch (e) {
      const x = e as { status?: number; serverError?: string };
      setErr(x.status === 409 && x.serverError ? x.serverError : explain(e)); setPending(null);
    } finally { setActing(false); }
  };

  const clearMatch = async (m: BoardMatch) => {
    setErr(""); setMsg("");
    try { await ready.clear(eventId, m.id); setMsg(`Ready marks cleared for ${m.a || "?"} vs ${m.b || "?"}.`); await refresh(); } catch (e) { setErr(explain(e)); }
  };

  const groups = board ? groupBoard(board.matches, grace, t) : null;

  const row = (m: BoardMatch, kind: "soon" | "late" | "ready") => {
    const late = lateSides(m, grace, t);
    const d = graceDeadlineMs(m.startsAt, grace);
    const start = m.startsAt ? Date.parse(m.startsAt) - t : null;
    const timing = start === null ? "No start time set" : start > 0 ? `Starts at ${hm(m.startsAt)}, in ${spanText(start)}` : `Was due at ${hm(m.startsAt)}`;
    const graceNote = kind === "late" && d !== null ? `Grace period ended ${spanText(t - d)} ago` : kind === "soon" && d !== null && start !== null && start <= 0 ? `Grace period ends in ${spanText(d - t)}` : "";
    return (
      <li key={m.id} className="space-y-2 rounded-xl border border-white/10 bg-[#0a0b0d] p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="font-semibold text-white">{m.a || "to be decided"} <span className="text-zinc-300">vs</span> {m.b || "to be decided"}</p>
          <p className="text-sm text-zinc-300">{timing}</p>
        </div>
        <Dots m={m} />
        {graceNote && <p className="text-sm text-amber-200">{graceNote}</p>}
        {kind === "late" && late.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {late.map((s) => {
              const name = s === "a" ? m.a : m.b;
              return <button key={s} type="button" className="btn-ghost !border-rose-400/60 text-sm" onClick={() => setPending({ m, side: s })}>Mark {name} as forfeit</button>;
            })}
          </div>
        )}
        {kind !== "late" && (m.aReady || m.bReady) && (
          <button type="button" className="min-h-11 text-sm text-zinc-300 underline underline-offset-2 hover:text-white" onClick={() => void clearMatch(m)}>Clear ready marks for this match</button>
        )}
      </li>
    );
  };

  const section = (title: string, hint: string, list: BoardMatch[], kind: "soon" | "late" | "ready") => (
    <section aria-label={title} className="space-y-2">
      <h4 className="font-display text-base font-bold text-white">{title} <span className="text-sm font-normal text-zinc-300">({list.length})</span></h4>
      {list.length === 0 ? <p className="text-sm text-zinc-300">{hint}</p> : <ul className="space-y-2">{list.map((m) => row(m, kind))}</ul>}
    </section>
  );

  const total = groups ? groups.soon.length + groups.late.length + groups.ready.length : 0;

  return (
    <section aria-label="Team ready check" className="space-y-4">
      <div aria-live="polite">
        {msg && <p role="status" className="rounded-lg border border-emerald-400/50 p-3 text-sm text-emerald-300">{msg}</p>}
        {err && <p role="alert" className="rounded-lg border border-rose-400/50 p-3 text-sm text-rose-200">{err}</p>}
      </div>

      <ToolStep n={1} title="Settings" done={!!board} status={`${grace} min grace`}
        hint="How long do you wait after a match start time before a missing team counts as late? Nothing happens by itself: late teams only show up on the board and you decide what to do.">
        <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); void saveGrace(); }}>
          <label className="block">
            <span className="block text-sm font-semibold text-zinc-200">Grace period in minutes</span>
            <input value={graceText} inputMode="numeric" onChange={(e) => { setGraceText(e.target.value); setGraceTouched(true); }} aria-invalid={parsed === null} aria-describedby="ready-grace-help" className="mt-1 min-h-11 w-28 rounded-lg border border-zinc-700 bg-[#05070a] px-3 text-base text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan" />
          </label>
          <button type="submit" className="btn" disabled={saving || parsed === null || !board}>{saving ? "Saving" : "Save grace period"}</button>
          <p id="ready-grace-help" className={`basis-full text-sm ${parsed === null ? "text-rose-200" : "text-zinc-300"}`}>
            {parsed === null ? `Type a whole number from 0 to ${MAX_GRACE}.` : `Example: with ${parsed} ${parsed === 1 ? "minute" : "minutes"} of grace, a team that has not tapped We are here counts as late ${parsed} ${parsed === 1 ? "minute" : "minutes"} after the match start time. Captains can tap from 60 minutes before the start.`}
          </p>
        </form>
      </ToolStep>

      <ToolStep n={2} title="The board" status={board ? `${total} ${total === 1 ? "match" : "matches"}` : undefined}
        hint="Captains tap We are here on their team link. This board refreshes every 15 seconds. A forfeit is never automatic: you press the button and confirm it.">
        {!board && !loadErr && <div aria-busy="true"><p className="sr-only" role="status">Loading the board</p><div className="sk h-24 w-full rounded-xl" /></div>}
        {loadErr && <div role="alert" className="space-y-2 rounded-lg border border-rose-400/50 p-3 text-sm text-rose-200"><p>{loadErr}</p><button type="button" className="btn-ghost" onClick={() => poller.current?.resume()}>Try again</button></div>}
        {board && groups && (total === 0
          ? (
            <div className="space-y-2 rounded-xl border border-white/10 p-4">
              <p className="font-semibold text-white">No upcoming matches yet</p>
              <p className="text-sm text-zinc-300">The board lists matches that have two teams and are not finished. Add matches with start times in the matches list, and send each team its captain link. Captains tap We are here up to 60 minutes before the start.</p>
              {groups.live > 0 && <p className="text-sm text-zinc-300">{groups.live} {groups.live === 1 ? "match is" : "matches are"} live right now.</p>}
            </div>
          )
          : (
            <div className="space-y-5">
              {section("Late", "No team is late.", groups.late, "late")}
              {section("Starting soon", "Nothing waiting.", groups.soon, "soon")}
              {section("Ready", "No match has both teams ready yet.", groups.ready, "ready")}
              {groups.live > 0 && <p className="text-sm text-zinc-300">{groups.live} {groups.live === 1 ? "match is" : "matches are"} live and not shown here.</p>}
            </div>
          ))}
      </ToolStep>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center" onClick={() => !acting && setPending(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="ready-confirm-h" className="w-full max-w-md space-y-3 rounded-2xl border border-rose-400/60 bg-[#0a0b0d] p-5" onClick={(e) => e.stopPropagation()}>
            <h3 id="ready-confirm-h" className="font-display text-xl font-bold text-white">Mark {pending.side === "a" ? pending.m.a : pending.m.b} as forfeit?</h3>
            <p className="text-sm leading-6 text-zinc-200">{forfeitConsequence(pending.m, pending.side, needsNoShowConfirm(pending.m, pending.side))}</p>
            <div className="flex flex-wrap gap-2">
              <button ref={cancelRef} type="button" className="btn-ghost flex-1" disabled={acting} onClick={() => setPending(null)}>Cancel, keep waiting</button>
              <button type="button" className="btn flex-1 !bg-rose-300" disabled={acting} onClick={() => void confirmForfeit()}>{acting ? "Saving" : `Yes, ${pending.side === "a" ? pending.m.a : pending.m.b} forfeits`}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
