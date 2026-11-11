"use client";

import { useRef, useState } from "react";
import { auth, explain } from "@/lib/api/cloud";

const Note = ({ msg, err }: { msg: string; err: string }) => <div aria-live="polite">{msg && <p className="text-sm text-emerald-300">{msg}</p>}{err && <p role="alert" className="text-sm text-red-300">{err}</p>}</div>;

/** Change password, delete account. */
export default function AccountPanel({ onDone }: { onDone: () => void }) {
  const [cur, setCur] = useState(""), [next, setNext] = useState(""), [del, setDel] = useState("");
  const [msg, setMsg] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const [derr, setDerr] = useState(""), [dbusy, setDbusy] = useState(false);
  const working = useRef(false);

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    if (working.current) return;
    if (next === cur) { setErr("Choose a new password that is different from the current one."); setMsg(""); return; }
    working.current = true; setBusy(true); setErr(""); setMsg("");
    try { await auth.changePassword(cur, next); setMsg("Password changed."); setCur(""); setNext(""); }
    catch (x) { setErr((x as { status?: number }).status === 401 ? "The current password is wrong." : explain(x)); }
    finally { working.current = false; setBusy(false); }
  };
  const remove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (working.current) return;
    if (!confirm("Delete your account and every event, roster, photo and check-in saved online? This cannot be undone. Your copies in this browser stay.")) return;
    working.current = true; setDbusy(true); setDerr("");
    try { await auth.deleteAccount(del); onDone(); }
    catch (x) { setDerr((x as { status?: number }).status === 401 ? "That password is wrong." : explain(x)); }
    finally { working.current = false; setDbusy(false); }
  };
  return (
    <div className="space-y-5">
      <form onSubmit={change} className="space-y-3 rounded-xl border border-white/10 p-3">
        <h3 className="font-display font-bold text-white">Change password</h3>
        <label className="block text-sm text-zinc-300">Current password<input className="field mt-1" type="password" name="current-password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} required /></label>
        <label className="block text-sm text-zinc-300">New password<input className="field mt-1" type="password" name="new-password" autoComplete="new-password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required /><span className="mt-1 block text-xs text-zinc-400">At least 8 characters.</span></label>
        <button className="btn !min-h-11 px-4 text-sm" disabled={busy}>{busy ? "Changing…" : "Change password"}</button>
        <Note msg={msg} err={err} />
      </form>
      <form onSubmit={remove} className="space-y-3 rounded-xl border border-red-400/30 p-3">
        <h3 className="font-display font-bold text-white">Delete my account</h3>
        <p className="text-sm text-zinc-300">Removes everything saved online: events, rosters, photos, check-ins, invite and pass links. Cards you made in this browser are not touched.</p>
        <label className="block text-sm text-zinc-300">Password to confirm<input className="field mt-1" type="password" name="confirm-password" autoComplete="current-password" value={del} onChange={(e) => setDel(e.target.value)} required /></label>
        <button className="btn-ghost !min-h-11 px-4 text-sm !border-red-400/50 text-red-200" disabled={dbusy || !del}>{dbusy ? "Deleting…" : "Delete account"}</button>
        <Note msg="" err={derr} />
      </form>
      <p className="text-xs text-zinc-400">Forgot your password? Sign out, then press &ldquo;Forgot password?&rdquo; on the sign-in page. We email you a link to choose a new one.</p>
    </div>
  );
}
