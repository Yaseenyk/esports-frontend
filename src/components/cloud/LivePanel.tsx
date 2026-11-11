"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPoller } from "@/lib/api/poller";
import { events, explain, type Checkin, type GateKey } from "@/lib/api/cloud";

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

/** Gate keys for the people on the door, and a live count of who has arrived. */
export default function LivePanel({ eventId }: { eventId: string }) {
  const [keys, setKeys] = useState<GateKey[] | null>(null);
  const [fresh, setFresh] = useState<{ key: string; label: string } | null>(null);
  const [label, setLabel] = useState("Main door"), [hours, setHours] = useState(24);
  const [err, setErr] = useState(""), [copied, setCopied] = useState(false), [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Checkin[]>([]);
  const [count, setCount] = useState({ total: 0, checkedIn: 0 }), [every, setEvery] = useState(10);
  const cursor = useRef<string | undefined>(undefined);

  const loadKeys = useCallback(() => { events.gateKeys(eventId).then(setKeys).catch((e) => setErr(explain(e))); }, [eventId]);
  useEffect(loadKeys, [loadKeys]);

  // Live arrivals: asks only for scans newer than the last one it has, every 10 s, slowing to a minute when quiet, and not at all while the tab is hidden.
  useEffect(() => {
    cursor.current = undefined; setRows([]);
    const poller = createPoller({
      fetch: () => events.checkins(eventId, cursor.current),
      same: (a, b) => a.checkedIn === b.checkedIn && a.total === b.total,
      onData: (v) => {
        setErr(""); // the connection is back
        setCount({ total: v.total, checkedIn: v.checkedIn });
        if (v.checkins.length) { cursor.current = v.checkins[v.checkins.length - 1]!.at; setRows((r) => [...v.checkins, ...r].slice(0, 200)); }
        setEvery(Math.round(poller.interval / 1000));
      },
      onError: (e) => setErr(explain(e)), minMs: 10000, maxMs: 60000,
    });
    const wake = () => poller.resume();
    document.addEventListener("visibilitychange", wake); window.addEventListener("online", wake);
    poller.start();
    return () => { poller.stop(); document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); };
  }, [eventId]);

  const make = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (busy) return;
    setBusy(true);
    try { const k = await events.newGateKey(eventId, label.trim() || "Gate", hours); setFresh({ key: k.key, label: k.label }); setCopied(false); loadKeys(); } catch (x) { setErr(explain(x)); } finally { setBusy(false); }
  };
  const revoke = async (k: GateKey) => {
    if (!confirm(`Switch off the key for ${k.label}? The phone using it stops checking guests in straight away.`)) return;
    try { await events.revokeGateKey(eventId, k.id); loadKeys(); } catch (x) { setErr(explain(x)); }
  };
  const reset = async () => {
    if (!confirm(`Clear all ${count.checkedIn} check-ins for this event? Everyone will show as not arrived. This cannot be undone. Use it only to start over.`)) return;
    try { await events.resetCheckins(eventId); cursor.current = undefined; setRows([]); setCount((c) => ({ ...c, checkedIn: 0 })); } catch (x) { setErr(explain(x)); }
  };
  const pct = count.total ? Math.round((count.checkedIn / count.total) * 100) : 0;

  return (
    <div className="space-y-5">
      <section className="space-y-2 rounded-xl border border-white/10 p-3">
        <h3 className="font-display font-bold text-white">Arrivals now</h3>
        <p className="text-2xl font-bold text-white" aria-live="polite">{count.checkedIn} <span className="text-base font-normal text-zinc-400">of {count.total} checked in ({pct}%)</span></p>
        <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-cyan to-purple transition-[width]" style={{ width: `${pct}%` }} /></div>
        <p className="text-xs text-zinc-400">Updates about every {every} seconds, and pauses while this tab is in the background.</p>
        {rows.length > 0 && <ul className="max-h-48 space-y-1 overflow-y-auto text-sm" aria-label="Recent arrivals">{rows.map((r) => <li key={r.personId + r.at} className="flex justify-between gap-2 rounded-lg border border-white/10 px-3 py-1.5"><span className="truncate text-zinc-200">{r.name} <span className="text-zinc-400">· {r.team ?? "No team"} · {r.role}{r.door ? ` · ${r.door}` : ""}</span></span><span className="shrink-0 text-emerald-300">{time(r.at)}</span></li>)}</ul>}
        <button type="button" className="chip" onClick={reset}>Reset all check-ins</button>
      </section>

      <section className="space-y-3 rounded-xl border border-white/10 p-3">
        <h3 className="font-display font-bold text-white">Gate keys</h3>
        <p className="text-sm text-zinc-300">Give each door its own key. A gate phone opens <strong className="text-zinc-100">Gate check-in</strong>, picks <em>Live</em>, and pastes the key. It can only check guests in; it cannot see or change anything else. Revoke a key if a phone is lost.</p>
        <form onSubmit={make} className="flex flex-wrap items-end gap-2">
          <label className="text-sm text-zinc-300">Door name<input className="field mt-1 w-44" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} /></label>
          <label className="text-sm text-zinc-300">Valid for<select className="field mt-1" value={hours} onChange={(e) => setHours(Number(e.target.value))}>{[[6, "6 hours"], [24, "1 day"], [72, "3 days"], [168, "1 week"]].map(([h, l]) => <option key={h} value={h}>{l}</option>)}</select></label>
          <button className="btn !min-h-11 px-4 text-sm" disabled={busy}>{busy ? "Creating…" : "Create key"}</button>
        </form>
        {fresh && (
          <div role="status" className="space-y-2 rounded-xl border border-cyan/40 bg-cyan/10 p-3 text-sm">
            <p className="text-zinc-100">Key for <strong>{fresh.label}</strong>. This is the only time it is shown, so copy it now.</p>
            <p className="break-all rounded-lg bg-black/40 p-2 font-mono text-xs text-cyan">{fresh.key}</p>
            <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => { if (!navigator.clipboard) { setErr("Copying is not available here. Select the key and copy it by hand."); return; } navigator.clipboard.writeText(fresh.key).then(() => setCopied(true), () => setErr("Could not copy. Select the key and copy it by hand.")); }}>{copied ? "Copied" : "Copy key"}</button>
          </div>
        )}
        {keys && keys.length > 0 && <ul className="space-y-1.5 text-sm">{keys.map((k) => <li key={k.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"><span className="text-zinc-200">{k.label} <span className="text-xs text-zinc-400">· {k.revoked ? "revoked" : k.expiresAt ? `until ${new Date(k.expiresAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}` : "no expiry"}</span></span>{!k.revoked && <button type="button" className="chip !min-h-8" onClick={() => revoke(k)}>Revoke</button>}</li>)}</ul>}
      </section>
      {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
    </div>
  );
}
