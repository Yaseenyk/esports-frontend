"use client";

import { useState } from "react";
import { auth, explain } from "@/lib/api/cloud";

/** Change password, delete account. */
export default function AccountPanel({ onDone }: { onDone: () => void }) {
  const [cur, setCur] = useState(""), [next, setNext] = useState(""), [del, setDel] = useState("");
  const [msg, setMsg] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const change = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setErr(""); setMsg(""); try { await auth.changePassword(cur, next); setMsg("Password changed."); setCur(""); setNext(""); } catch (x) { setErr((x as { status?: number }).status === 401 ? "The current password is wrong." : explain(x)); } finally { setBusy(false); } };
  const remove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Delete your account and every event, roster, photo and check-in saved online? This cannot be undone. Your copies in this browser stay.")) return;
    setBusy(true); setErr("");
    try { await auth.deleteAccount(del); onDone(); } catch (x) { setErr((x as { status?: number }).status === 401 ? "That password is wrong." : explain(x)); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-5">
      <form onSubmit={change} className="space-y-3 rounded-xl border border-white/10 p-3">
        <h3 className="font-display font-bold text-white">Change password</h3>
        <label className="block text-sm text-zinc-300">Current password<input className="field mt-1" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} required /></label>
        <label className="block text-sm text-zinc-300">New password<input className="field mt-1" type="password" autoComplete="new-password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required /><span className="mt-1 block text-xs text-zinc-400">At least 8 characters.</span></label>
        <button className="btn !min-h-10 px-4 text-sm" disabled={busy}>Change password</button>
      </form>
      <form onSubmit={remove} className="space-y-3 rounded-xl border border-red-400/30 p-3">
        <h3 className="font-display font-bold text-white">Delete my account</h3>
        <p className="text-sm text-zinc-300">Removes everything saved online: events, rosters, photos, check-ins, invite and pass links. Cards you made in this browser are not touched.</p>
        <label className="block text-sm text-zinc-300">Password to confirm<input className="field mt-1" type="password" autoComplete="current-password" value={del} onChange={(e) => setDel(e.target.value)} required /></label>
        <button className="btn-ghost !min-h-10 px-4 text-sm !border-red-400/50 text-red-200" disabled={busy || !del}>Delete account</button>
      </form>
      <div aria-live="polite">{msg && <p className="text-sm text-emerald-300">{msg}</p>}{err && <p role="alert" className="text-sm text-red-300">{err}</p>}</div>
      <p className="text-xs text-zinc-400">Forgot your password? Password reset by email is not set up yet. Until it is, keep your password somewhere safe.</p>
    </div>
  );
}
