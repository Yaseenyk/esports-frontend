"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { insightsApi } from "@/lib/api/f-insights";
import { MAX_KEYS, keyDate, keyError, type ApiKeyRow } from "@/lib/insights";
import { ConfirmBar, CopyButton, ListSkeleton } from "@/components/org/ui";

/** Account page section: list, create and revoke read-only API keys. The secret is shown once, in this component's memory only. */
export default function ApiKeysPanel() {
  const [keys, setKeys] = useState<ApiKeyRow[] | null>(null), [loadErr, setLoadErr] = useState("");
  const [label, setLabel] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const [fresh, setFresh] = useState<{ label: string; key: string } | null>(null);
  const [asking, setAsking] = useState<string | null>(null), [revoking, setRevoking] = useState(false), [msg, setMsg] = useState("");

  const load = useCallback(() => {
    setLoadErr("");
    insightsApi.keys().then(setKeys, (e) => { setKeys(null); setLoadErr(keyError(e, "list")); });
  }, []);
  useEffect(load, [load]);

  const full = (keys?.length ?? 0) >= MAX_KEYS;
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !label.trim()) return;
    setBusy(true); setErr(""); setMsg(""); setFresh(null);
    try { const k = await insightsApi.createKey(label.trim()); setFresh({ label: k.label, key: k.key }); setLabel(""); load(); }
    catch (x) { setErr(keyError(x, "create")); } finally { setBusy(false); }
  };
  const revoke = async (id: string) => {
    setRevoking(true); setErr(""); setMsg("");
    try { await insightsApi.revokeKey(id); setAsking(null); setMsg("Key revoked. It stops working straight away."); load(); }
    catch (x) { setErr(keyError(x, "revoke")); } finally { setRevoking(false); }
  };

  return (
    <section aria-label="API keys" className="card space-y-3">
      <h2 className="font-display font-bold text-white">API keys</h2>
      <p className="text-sm text-zinc-300">A key lets your own tool read event details and counts: how many teams registered, how many people checked in, how many times the live page was viewed. It can never read people, names, emails or photos, and it cannot change anything. You can have up to {MAX_KEYS} keys. <Link href="/developers/" className="text-cyan underline">How the API works</Link></p>

      {fresh && (
        <div role="status" className="space-y-2 rounded-xl border border-cyan/40 bg-[#0a0b0d] p-3">
          <p className="text-sm font-semibold text-white">Your new key for &ldquo;{fresh.label}&rdquo;</p>
          <p className="break-all rounded-lg border border-white/10 px-3 py-2 font-mono text-sm text-zinc-100 select-all" data-testid="new-key">{fresh.key}</p>
          <p className="text-sm text-amber-100">Copy it now and keep it somewhere safe. We cannot show it again. If you lose it, revoke it and make a new one.</p>
          <div className="flex flex-wrap items-center gap-2"><CopyButton text={fresh.key} label="Copy key" /><button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => setFresh(null)}>I have saved it</button></div>
        </div>
      )}

      {keys === null && !loadErr && <ListSkeleton n={2} />}
      {loadErr && <div className="space-y-2"><p role="alert" className="text-sm text-red-300">{loadErr}</p><button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={load}>Try again</button></div>}
      {keys && keys.length === 0 && <p className="text-sm text-zinc-300">You have no keys yet. Make one below if you want to use the API.</p>}
      {keys && keys.length > 0 && (
        <ul className="space-y-2">
          {keys.map((k) => (
            <li key={k.id} className="rounded-xl border border-white/10 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0"><p className="truncate font-semibold text-zinc-100">{k.label}{k.hint && <span className="ml-2 font-mono text-xs font-normal text-zinc-400">ehk_…{k.hint.replace(/^ehk_/, "").replace(/^…/, "")}</span>}</p>
                  <p className="text-xs text-zinc-400">Created {keyDate(k.createdAt)} · Last used: {keyDate(k.lastUsedAt)}</p></div>
                <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" aria-label={`Revoke ${k.label}`} onClick={() => { setAsking(k.id); setMsg(""); }}>Revoke</button>
              </div>
              {asking === k.id && <ConfirmBar danger question={`Revoke "${k.label}"? Anything using it stops working straight away. This cannot be undone.`} yes="Yes, revoke it" busy={revoking} onYes={() => revoke(k.id)} onNo={() => setAsking(null)} />}
            </li>
          ))}
        </ul>
      )}

      {full ? <p className="text-sm text-zinc-300">You have {MAX_KEYS} keys, the most allowed. Revoke one to make another.</p> : (
        <form onSubmit={create} className="flex flex-wrap items-end gap-2">
          <label className="min-w-[12rem] flex-1 text-sm text-zinc-200">Name for the new key<input className="field mt-1" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} placeholder="For example: my results sheet" autoComplete="off" required /></label>
          <button className="btn !min-h-11 px-4 text-sm" disabled={busy || !label.trim()}>{busy ? "Making…" : "Make a key"}</button>
        </form>
      )}
      <div aria-live="polite">{msg && <p className="text-sm text-emerald-300">{msg}</p>}{err && <p role="alert" className="text-sm text-red-300">{err}</p>}</div>
    </section>
  );
}
