"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdminError, REASONS, admin } from "@/lib/admin/client";

/** Loads something once and again on demand. Three honest states: loading, failed (with a retry), ready. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [state, set] = useState<{ status: "loading" | "error" | "ready"; data?: T; error?: unknown }>({ status: "loading" });
  const [n, setN] = useState(0);
  const loadRef = useRef(load); loadRef.current = load;
  useEffect(() => {
    let live = true;
    set((s) => (s.data !== undefined ? { ...s, status: "ready" } : { status: "loading" }));
    loadRef.current().then((data) => live && set({ status: "ready", data }), (error) => live && set({ status: "error", error }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, ...deps]);
  return { ...state, reload: useCallback(() => setN((x) => x + 1), []) };
}

/** What went wrong, in a sentence a person can act on. The server's own sentence is used when it sent one. */
export function say(e: unknown): string {
  if (e instanceof AdminError) {
    if (e.status === 0) return e.message;
    if (e.code === "step_up_required") return "Enter a fresh code from your authenticator to do this.";
    if (e.status === 429) return "Too many tries. Wait a few minutes and try again.";
    if (e.status >= 500) return "The server had a problem. Try again in a moment.";
    if (e.message) return e.message;
  }
  return "Something went wrong. Try again.";
}

export const H1 = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
  <header className="mb-5">
    <h1 className="font-display text-2xl font-bold tracking-tight text-white" tabIndex={-1} id="admin-h1">{children}</h1>
    {sub && <p className="mt-1 max-w-prose text-sm text-zinc-300">{sub}</p>}
  </header>
);

export function Loading({ what }: { what: string }) {
  return <div role="status" aria-busy="true" className="card text-sm text-zinc-300">Loading {what}...</div>;
}

export function Failed({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div role="alert" className="card border-red-500/50 text-sm">
      <p className="text-red-200">{say(error)}</p>
      <button type="button" className="btn-ghost mt-3" onClick={onRetry}>Try again</button>
    </div>
  );
}

export const Empty = ({ children }: { children: React.ReactNode }) => <div className="card text-sm text-zinc-300">{children}</div>;

export const Success = ({ children }: { children: React.ReactNode }) => <p role="status" className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{children}</p>;

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card">
      <p className="text-sm text-zinc-300">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

/**
 * The confirmation step for every staff action. An inline panel (not a pop-up), so it works with a keyboard and a screen reader
 * and nothing is hidden behind a layer. A reason is always required; a fresh authenticator code is asked for only when needed.
 * Escape cancels. Focus lands on the heading when it opens and returns to where it was when it closes.
 */
export function ConfirmPanel({ title, children, confirmLabel, danger, needsCode, onConfirm, onCancel }: {
  title: string; children: React.ReactNode; confirmLabel: string; danger?: boolean; needsCode?: boolean;
  onConfirm: (reasonCode: string) => Promise<void>; onCancel: () => void;
}) {
  const head = useRef<HTMLHeadingElement>(null);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const [needCode, setNeedCode] = useState(Boolean(needsCode));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { const prev = document.activeElement as HTMLElement | null; head.current?.focus(); return () => { try { prev?.focus?.(); } catch { /* gone */ } }; }, []);
  const id = useRef(`c${Math.random().toString(36).slice(2, 8)}`).current;

  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) { setErr("Choose a reason first. It is saved in the activity log."); return; }
    if (needCode && !/^\d{6}$/.test(code)) { setErr("Enter the 6-digit code from your authenticator app."); return; }
    setBusy(true); setErr("");
    try {
      if (needCode) await admin.stepUp(code);
      await onConfirm(reason);
    } catch (x) {
      if (x instanceof AdminError && x.code === "step_up_required") { setNeedCode(true); setCode(""); }
      setErr(x instanceof AdminError && (x.status === 401 || x.status === 400) && needCode ? "That code did not work. Codes change every 30 seconds, so wait for a new one." : say(x));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={go} onKeyDown={(e) => { if (e.key === "Escape" && !busy) onCancel(); }} aria-labelledby={`${id}-t`} className={`mt-3 rounded-xl border p-4 ${danger ? "border-amber-400/60 bg-amber-400/5" : "border-zinc-600 bg-zinc-950"}`}>
      <h3 id={`${id}-t`} ref={head} tabIndex={-1} className="font-display text-base font-semibold text-white outline-none">{title}</h3>
      <div className="mt-1 text-sm text-zinc-200">{children}</div>
      <label htmlFor={`${id}-r`} className="mt-3 block text-sm font-medium text-zinc-100">Reason (required)</label>
      <select id={`${id}-r`} className="field mt-1" value={reason} onChange={(e) => setReason(e.target.value)} aria-describedby={err ? `${id}-e` : undefined} aria-invalid={err && !reason ? true : undefined}>
        <option value="">Choose a reason...</option>
        {REASONS.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
      </select>
      {needCode && (
        <>
          <label htmlFor={`${id}-c`} className="mt-3 block text-sm font-medium text-zinc-100">Authenticator code</label>
          <input id={`${id}-c`} className="field mt-1 tracking-widest" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="6 digits" />
          <p className="mt-1 text-xs text-zinc-400">One code covers several changes in the next 5 minutes.</p>
        </>
      )}
      {err && <p id={`${id}-e`} role="alert" className="mt-3 text-sm text-red-300">{err}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className="btn disabled:opacity-60">{busy ? "Working..." : confirmLabel}</button>
        <button type="button" disabled={busy} onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </form>
  );
}
