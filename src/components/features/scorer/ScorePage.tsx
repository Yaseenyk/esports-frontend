"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { scoreClient, scoreMessage, type ScoreView } from "@/lib/api/f-scorer";
import {
  brKey, canUndo, enqueue, formatLeft, overlayQueue, parseQueue, queueStorageKey, resultKey, sendQueue, splitMatches, undoBody, undoLeftMs,
  type BrBody, type QueueItem, type ResultBody, type ScorerMatch, type UndoInfo,
} from "@/lib/scorer";
import BrEntry from "./BrEntry";
import ConfirmSheet, { type SheetAsk } from "./ConfirmSheet";
import MatchCard from "./MatchCard";
import { takeTokenSearch } from "@/lib/tokenHygiene";

type Load = "loading" | "ready" | "error" | "invalid";
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** The page a referee or lobby host opens from the link the organiser sent: /score/?t=<token>. No account. Built for a phone in a loud room. */
export default function ScorePage() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [view, setView] = useState<ScoreView | null>(null);
  const [load, setLoad] = useState<Load>("loading");
  const [queue, setQueueState] = useState<QueueItem[]>([]);
  const [online, setOnline] = useState(true);
  const [tab, setTab] = useState<"matches" | "br">("matches");
  const [ask, setAsk] = useState<SheetAsk | null>(null);
  const [undo, setUndo] = useState<UndoInfo | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [notes, setNotes] = useState<{ id: string; ok: boolean; text: string }[]>([]);
  const [sending, setSending] = useState(false);
  const queueRef = useRef<QueueItem[]>([]);
  const flushing = useRef(false);
  const viewRef = useRef<ScoreView | null>(null);
  viewRef.current = view;

  const note = useCallback((ok: boolean, text: string) => setNotes((n) => [...n.slice(-3), { id: uid(), ok, text }]), []);

  useEffect(() => { setToken(new URLSearchParams(takeTokenSearch()).get("t")); }, []);
  const client = useMemo(() => (token ? scoreClient(token) : null), [token]);
  const storeKey = token ? queueStorageKey(token) : null;

  const setQueue = useCallback((q: QueueItem[]) => {
    queueRef.current = q;
    setQueueState(q);
    if (storeKey) { try { localStorage.setItem(storeKey, JSON.stringify(q)); } catch { /* the queue still works in memory */ } }
  }, [storeKey]);

  useEffect(() => {
    if (!storeKey) return;
    let q: QueueItem[] = [];
    try { q = parseQueue(localStorage.getItem(storeKey)); } catch { /* none saved */ }
    queueRef.current = q; setQueueState(q);
  }, [storeKey]);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true); const off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const refresh = useCallback(async () => {
    if (!client) return;
    try {
      const v = await client.view();
      setView(v); setLoad("ready");
    } catch (e) {
      const s = (e as { status?: number }).status;
      if (s === 404) { setLoad("invalid"); return; }
      if (!viewRef.current) setLoad("error");
    }
  }, [client]);

  useEffect(() => { if (token === null) setLoad("invalid"); else if (client) void refresh(); }, [token, client, refresh]);
  useEffect(() => {
    if (!client) return;
    const t = setInterval(() => { if (document.visibilityState === "visible" && queueRef.current.length === 0) void refresh(); }, 20_000);
    return () => clearInterval(t);
  }, [client, refresh]);

  const flush = useCallback(async () => {
    if (!client || flushing.current || queueRef.current.length === 0) return;
    flushing.current = true; setSending(true);
    const snapshot = queueRef.current;
    try {
      const report = await sendQueue(snapshot, async (item) => {
        if (item.kind === "result") {
          const r = await client.result(item.matchId!, item.body as ResultBody);
          if (r.downstreamReset) note(false, `${item.label}: this changed a match that was already played after it. The organiser can see it.`);
        } else await client.br(item.body as BrBody);
      });
      const live = new Set(queueRef.current.map((q) => q.id));
      const added = queueRef.current.filter((q) => !snapshot.some((s) => s.id === q.id));
      setQueue([...report.remaining.filter((r) => live.has(r.id)), ...added]);
      for (const r of report.rejected) note(false, `Not saved (${r.item.label}): ${scoreMessage(Object.assign(new Error(""), { status: r.status }))}`);
      if (report.sent.length) { note(true, report.sent.length === 1 ? "Sent." : `Sent ${report.sent.length} saved results.`); }
      if (report.sent.length || report.rejected.length) await refresh();
    } finally { flushing.current = false; setSending(false); }
  }, [client, note, refresh, setQueue]);

  // Send whenever something is waiting and the phone says it is online; keep trying every 12 seconds (the phone can be wrong about being online).
  useEffect(() => {
    if (queue.length === 0) return;
    if (online) void flush();
    const t = setInterval(() => void flush(), 12_000);
    return () => clearInterval(t);
  }, [queue.length, online, flush]);

  useEffect(() => {
    if (!undo) return;
    const t = setInterval(() => { const n = Date.now(); setNow(n); if (!canUndo(undo, n)) setUndo(null); }, 1000);
    return () => clearInterval(t);
  }, [undo]);

  const shown = useMemo(() => overlayQueue(view?.matches ?? [], queue), [view, queue]);
  const parts = useMemo(() => splitMatches(shown), [shown]);
  const pendingIds = useMemo(() => new Set(queue.filter((q) => q.kind === "result").map((q) => q.matchId!)), [queue]);
  const pendingNos = useMemo(() => queue.filter((q) => q.kind === "br").map((q) => (q.body as BrBody).matchNo), [queue]);

  const sendResult = (m: ScorerMatch, body: ResultBody, label: string) => {
    const before = shown.find((x) => x.id === m.id) ?? m;
    const prev = before.status === "scheduled" || before.status === "ready" ? null : { status: before.status, scoreA: before.scoreA, scoreB: before.scoreB, winner: before.winner };
    setQueue(enqueue(queueRef.current, { id: uid(), key: resultKey(m.id), kind: "result", matchId: m.id, body, label, at: Date.now() }));
    if (body.status !== "live") { setUndo({ matchId: m.id, savedAt: Date.now(), prev }); setNow(Date.now()); }
    note(true, navigator.onLine ? "Saving..." : "Saved on this phone, will send when online.");
  };
  const sendBr = (body: BrBody, label: string) => {
    setQueue(enqueue(queueRef.current, { id: uid(), key: brKey(body.matchNo), kind: "br", body, label, at: Date.now() }));
    note(true, navigator.onLine ? "Saving..." : "Saved on this phone, will send when online.");
  };
  const doUndo = () => {
    if (!undo || !canUndo(undo, Date.now())) return;
    const waiting = queueRef.current.find((q) => q.key === resultKey(undo.matchId));
    const body = undoBody(undo);
    // A save that never left this phone and had no earlier result is simply taken back out of the queue.
    if (waiting && body.status === "live" && body.undo) setQueue(queueRef.current.filter((q) => q.id !== waiting.id));
    else setQueue(enqueue(queueRef.current, { id: uid(), key: resultKey(undo.matchId), kind: "result", matchId: undo.matchId, body, label: "Undo", at: Date.now() }));
    setUndo(null);
    note(true, "Undone.");
  };

  const m = shown.find((x) => x.id === undo?.matchId);
  const lastNote = notes[notes.length - 1];
  useEffect(() => {
    if (!lastNote) return;
    const t = setTimeout(() => setNotes((n) => n.filter((x) => x.id !== lastNote.id)), lastNote.ok ? 4000 : 12000);
    return () => clearTimeout(t);
  }, [lastNote]);

  const hide = <style>{`footer.no-print{display:none}div.no-print.sticky.top-3{display:none}main:has(.sc-root){padding-top:0}`}</style>;

  if (load === "invalid") return (
    <section aria-label="Scoring link" className="sc-root mx-auto max-w-md py-16 text-center">{hide}
      <h1 className="font-display text-2xl font-bold text-white">This scoring link does not work</h1>
      <p role="status" className="mt-3 text-base text-zinc-300">{token === null ? "The link is missing its code. Open the full link the organiser sent you." : "It may have expired, been switched off, or been copied wrongly. Ask the organiser for a new link."}</p>
    </section>
  );
  if (load === "loading" || token === undefined) return (
    <section aria-label="Scoring" aria-busy="true" className="sc-root mx-auto max-w-md space-y-4 py-6">{hide}
      <p className="sr-only" role="status">Loading your matches</p>
      <div className="sk h-8 w-2/3 rounded-lg" /><div className="sk h-40 w-full rounded-2xl" /><div className="sk h-40 w-full rounded-2xl" />
    </section>
  );
  if (load === "error" || !view) return (
    <section aria-label="Scoring" className="sc-root mx-auto max-w-md space-y-4 py-16 text-center">{hide}
      <h1 className="font-display text-2xl font-bold text-white">Could not load your matches</h1>
      <p role="alert" className="text-base text-zinc-300">Check your connection. Anything you saved on this phone is kept.</p>
      <button type="button" className="btn !min-h-12" onClick={() => { setLoad("loading"); void refresh(); }}>Try again</button>
    </section>
  );

  const expires = new Date(view.expiresAt);
  return (
    <section aria-label={`Scoring for ${view.event.name}`} className={`sc-root mx-auto max-w-md space-y-4 pb-28`}>
      {hide}
      <header className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-[#05070a]/95 px-4 py-3 backdrop-blur">
        <h1 className="truncate font-display text-lg font-bold leading-tight text-white">{view.event.name}</h1>
        <p className="truncate text-sm text-zinc-300">{view.label} · link works until {expires.toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</p>
      </header>

      {queue.length > 0 && (
        <div role="status" aria-live="polite" className="space-y-2 rounded-xl border border-amber-300/50 bg-amber-300/10 p-3">
          <p className="text-base font-bold text-amber-100">{queue.length} result{queue.length === 1 ? "" : "s"} saved on this phone, will send when online.</p>
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-amber-50">{queue.slice(0, 4).map((q) => <li key={q.id} className="break-words">{q.label}</li>)}{queue.length > 4 && <li>and {queue.length - 4} more</li>}</ul>
          <p className="text-sm text-amber-50">{online ? (sending ? "Sending now..." : "Trying again every few seconds.") : "No signal. Keep this page open; it sends by itself when the signal is back."}</p>
          <button type="button" className="btn-ghost !min-h-11 w-full" disabled={sending} onClick={() => void flush()}>Send now</button>
        </div>
      )}

      <div aria-live="polite" className="space-y-2">
        {notes.map((n) => <p key={n.id} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${n.ok ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100" : "border-amber-300/50 bg-amber-300/10 text-amber-100"}`}>{n.text}</p>)}
      </div>

      {view.battleRoyale.allowed && (
        <div role="tablist" aria-label="What to enter" className="grid grid-cols-2 gap-2">
          <button role="tab" id="sc-t-m" aria-selected={tab === "matches"} aria-controls="sc-p" type="button" className="chip !min-h-12 justify-center text-base" aria-pressed={tab === "matches"} onClick={() => setTab("matches")}>Matches ({shown.length})</button>
          <button role="tab" id="sc-t-b" aria-selected={tab === "br"} aria-controls="sc-p" type="button" className="chip !min-h-12 justify-center text-base" aria-pressed={tab === "br"} onClick={() => setTab("br")}>Battle royale</button>
        </div>
      )}

      <div id="sc-p" role={view.battleRoyale.allowed ? "tabpanel" : undefined} aria-labelledby={view.battleRoyale.allowed ? (tab === "matches" ? "sc-t-m" : "sc-t-b") : undefined} className="space-y-4">
        {tab === "br" && view.battleRoyale.allowed ? (
          <BrEntry teams={view.battleRoyale.teams} saved={view.battleRoyale.rows} pendingNos={pendingNos} onSend={sendBr} onAsk={setAsk} />
        ) : shown.length === 0 ? (
          <div className="card space-y-3 !p-5 text-center">
            <h2 className="font-display text-xl font-bold text-white">No matches here yet</h2>
            <p className="text-base text-zinc-300">The organiser has not added matches for this link. Ask them, then check again.</p>
            <button type="button" className="btn !min-h-12" onClick={() => void refresh()}>Check again</button>
          </div>
        ) : (
          <>
            {parts.toPlay.length === 0 && <p className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-base font-semibold text-emerald-100">All matches are finished. Thank you. You can still change a result below while your link works.</p>}
            {parts.toPlay.map((x) => <MatchCard key={x.id} match={x} pending={pendingIds.has(x.id)} onSend={sendResult} onAsk={setAsk} />)}
            {parts.done.length > 0 && (
              <details className="space-y-3" open={parts.done.some((x) => pendingIds.has(x.id) || x.id === undo?.matchId) || undefined}>
                <summary className="flex min-h-12 cursor-pointer items-center text-lg font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan">Finished ({parts.done.length})</summary>
                <div className="space-y-4 pt-3">{parts.done.map((x) => <MatchCard key={x.id} match={x} pending={pendingIds.has(x.id)} onSend={sendResult} onAsk={setAsk} />)}</div>
              </details>
            )}
          </>
        )}
      </div>

      <p className="text-center text-sm text-zinc-300">Only you should have this link. The organiser can switch it off at any time.</p>

      {undo && canUndo(undo, now) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-600 bg-zinc-950/95 p-3 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <p className="min-w-0 flex-1 text-sm font-semibold text-white">Saved{m ? `: ${m.a} v ${m.b}` : ""}. Wrong? You can undo for {formatLeft(undoLeftMs(undo.savedAt, now))}.</p>
            <button type="button" className="btn !min-h-12 shrink-0 px-5" onClick={doUndo}>Undo</button>
          </div>
        </div>
      )}
      {ask && <ConfirmSheet ask={ask} onClose={() => setAsk(null)} />}
    </section>
  );
}


