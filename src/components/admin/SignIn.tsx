"use client";

import { useEffect, useRef, useState } from "react";
import { AdminError, admin } from "@/lib/admin/client";
import { say } from "./ui";

/**
 * Staff sign-in in two steps: the ordinary email and password, then the 6-digit authenticator code.
 * The account token from step 1 lives only in this component's memory until step 2 finishes; it is never written anywhere.
 * If the account is not staff the server answers 404 and we show a plain 404, exactly as for a stranger.
 */
export default function SignIn({ ended, onNotStaff }: { ended: boolean; onNotStaff: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [userToken, setUserToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (step === 2) codeRef.current?.focus(); }, [step]);

  async function first(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) { setErr("Enter your email and password."); return; }
    setBusy(true); setErr("");
    try { setUserToken(await admin.checkPassword(email.trim(), password)); setPassword(""); setStep(2); }
    catch (x) { setErr(x instanceof AdminError && x.status === 401 ? "Those details did not work." : say(x)); }
    setBusy(false);
  }

  async function second(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { setErr("Enter the 6-digit code from your authenticator app."); return; }
    setBusy(true); setErr("");
    try { await admin.openSession(userToken as string, code); setUserToken(null); }
    catch (x) {
      if (x instanceof AdminError && x.status === 404) { setUserToken(null); onNotStaff(); return; }
      setErr(x instanceof AdminError && (x.status === 401 || x.status === 400 || x.status === 403) ? "That code did not work. Codes change every 30 seconds, so wait for a new one." : say(x));
      setCode(""); setBusy(false); return;
    }
    setBusy(false);
  }

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-white">Staff sign-in</h1>
      {ended && <p role="status" className="mt-3 text-sm text-zinc-300">Your session ended. Sign in again.</p>}
      {step === 1 ? (
        <form onSubmit={first} className="mt-5 space-y-4" noValidate>
          <p className="text-sm text-zinc-300">Step 1 of 2: your account.</p>
          <div><label htmlFor="s-email" className="block text-sm font-medium text-zinc-100">Email</label><input id="s-email" type="email" autoComplete="username" className="field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label htmlFor="s-pw" className="block text-sm font-medium text-zinc-100">Password</label><input id="s-pw" type="password" autoComplete="current-password" className="field mt-1" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
          <button type="submit" disabled={busy} className="btn w-full disabled:opacity-60">{busy ? "Checking..." : "Continue"}</button>
        </form>
      ) : (
        <form onSubmit={second} className="mt-5 space-y-4" noValidate>
          <p className="text-sm text-zinc-300">Step 2 of 2: the 6-digit code from your authenticator app.</p>
          <div><label htmlFor="s-code" className="block text-sm font-medium text-zinc-100">Authenticator code</label><input id="s-code" ref={codeRef} inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="field mt-1 tracking-widest" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} /></div>
          {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
          <button type="submit" disabled={busy} className="btn w-full disabled:opacity-60">{busy ? "Checking..." : "Sign in"}</button>
          <button type="button" className="btn-ghost w-full" onClick={() => { setStep(1); setUserToken(null); setErr(""); setCode(""); }}>Back</button>
        </form>
      )}
    </main>
  );
}
