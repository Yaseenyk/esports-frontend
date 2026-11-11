"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/api/cloud";
import { hasBackend } from "@/lib/api";
import { PASSWORD_HINT, mismatchProblem, passwordProblem, resetFailure, tokenFromQuery } from "@/lib/auth-reset";

type Phase = "reading" | "missing" | "form" | "done" | "expired";

export default function ResetPassword() {
  const [phase, setPhase] = useState<Phase>("reading");
  const token = useRef("");
  const [pw, setPw] = useState(""), [pw2, setPw2] = useState(""), [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const sending = useRef(false);

  useEffect(() => {
    token.current = tokenFromQuery(location.search);
    // Take the token out of the address bar so it is not left in history or sent on to other sites.
    if (location.search) { try { history.replaceState(null, "", location.pathname); } catch { /* ignore */ } }
    setPhase(token.current ? "form" : "missing");
  }, []);

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending.current) return;
    const bad = passwordProblem(pw) || mismatchProblem(pw, pw2);
    if (bad) { setErr(bad); return; }
    sending.current = true; setBusy(true); setErr("");
    try { await auth.reset(token.current, pw); token.current = ""; setPw(""); setPw2(""); setPhase("done"); }
    catch (x) { const f = resetFailure(x); if (f.kind === "expired") setPhase("expired"); else setErr(f.text); }
    finally { sending.current = false; setBusy(false); }
  };

  const again = <Link className="btn mt-4 w-full" href="/forgot-password/">Request a new link</Link>;
  let body: React.ReactNode;
  if (!hasBackend) body = <p className="text-sm text-amber-100">Accounts are not connected in this build.</p>;
  else if (phase === "reading") body = <p className="text-sm text-zinc-300">Loading…</p>;
  else if (phase === "missing") body = <div><p role="alert" className="text-sm text-zinc-200">This page needs the link from your email. Open the link again, or ask for a new one.</p>{again}</div>;
  else if (phase === "expired") body = <div><p role="alert" className="text-sm text-red-300">This link has expired or was already used.</p>{again}</div>;
  else if (phase === "done") body = <div><p role="status" className="text-sm text-zinc-200">Your password is changed. Sign in with the new one.</p><Link className="btn mt-4 w-full" href="/login/">Sign in</Link></div>;
  else body = (
    <form onSubmit={go} className="mx-auto w-full max-w-sm space-y-3" noValidate>
      <label className="block text-sm text-zinc-300">New password<input className="field mt-1" name="password" type={show ? "text" : "password"} autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" required /></label>
      <label className="block text-sm text-zinc-300">Confirm new password<input className="field mt-1" name="confirm" type={show ? "text" : "password"} autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" required /></label>
      <div className="flex min-h-6 items-center justify-between gap-3">
        <span className="text-xs text-zinc-400">{PASSWORD_HINT}</span>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs text-zinc-300"><input type="checkbox" className="h-5 w-5 accent-cyan" checked={show} onChange={(e) => setShow(e.target.checked)} />Show characters</label>
      </div>
      <div aria-live="polite">{err && <p role="alert" className="text-sm text-red-300">{err}</p>}</div>
      <button className="btn w-full" disabled={busy}>{busy ? "Please wait…" : "Set new password"}</button>
    </form>
  );

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      <div className="text-center"><h1 className="font-display text-3xl font-black text-white">Choose a new password</h1></div>
      <div className="card">{body}</div>
      <p className="text-center text-sm text-zinc-300"><Link className="inline-flex min-h-11 items-center text-cyan underline" href="/login/">Back to sign in</Link></p>
    </div>
  );
}
