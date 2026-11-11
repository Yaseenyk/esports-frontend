"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/api/cloud";
import { hasBackend } from "@/lib/api";
import { FORGOT_NEUTRAL, RESEND_SECONDS, emailFromQuery, forgotMessage, looksLikeEmail, secondsLeft } from "@/lib/auth-reset";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [sent, setSent] = useState(false);
  const [until, setUntil] = useState(0), [left, setLeft] = useState(0);
  const sending = useRef(false);

  useEffect(() => { setEmail(emailFromQuery(location.search)); }, []);
  useEffect(() => {
    if (!until) return;
    const tick = () => { const s = secondsLeft(until, Date.now()); setLeft(s); if (!s) setUntil(0); };
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [until]);

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending.current || left > 0) return;
    const v = email.trim();
    if (!looksLikeEmail(v)) { setErr("That does not look like an email address. Check it and try again."); return; }
    sending.current = true; setBusy(true); setErr("");
    try {
      await auth.forgot(v);
      setSent(true); setUntil(Date.now() + RESEND_SECONDS * 1000);
    } catch (x) { setErr(forgotMessage(x)); } finally { sending.current = false; setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      <div className="text-center">
        <h1 className="font-display text-3xl font-black text-white">Forgot your password?</h1>
        <p className="mt-2 text-sm text-zinc-300">Enter the email you signed up with. We will send a link to choose a new password.</p>
      </div>
      <div className="card">
        {!hasBackend ? <p className="text-sm text-amber-100">Accounts are not connected in this build.</p> : (
          <form onSubmit={go} className="mx-auto w-full max-w-sm space-y-3" noValidate>
            <label className="block text-sm text-zinc-300">Email<input className="field mt-1" name="email" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
            <div aria-live="polite">
              {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
              {sent && !err && <p role="status" className="rounded-xl border border-zinc-700 bg-[#0a0b0d] p-3 text-sm text-zinc-200">{FORGOT_NEUTRAL}</p>}
            </div>
            <button className="btn w-full" disabled={busy || left > 0}>{busy ? "Please wait…" : left > 0 ? `Send again in ${left}s` : sent ? "Send again" : "Send reset link"}</button>
          </form>
        )}
      </div>
      <p className="text-center text-sm text-zinc-300"><Link className="inline-flex min-h-11 items-center text-cyan underline" href="/login/">Back to sign in</Link></p>
    </div>
  );
}
