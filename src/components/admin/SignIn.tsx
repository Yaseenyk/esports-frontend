"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import GoogleButton from "@/components/auth/GoogleButton";
import { AdminError, admin, maskedOnly } from "@/lib/admin/client";
import { readSiteSession, type SiteSession } from "@/lib/site-session";
import { say } from "./ui";

type Step = "account" | "code" | "enrol";

const APPS = ["Google Authenticator", "Microsoft Authenticator", "Authy", "1Password", "Bitwarden", "Aegis (Android)"];

/** Errors in words a person can act on. A 404 from the staff door means only "this account cannot open this area": it says nothing about anyone else. */
function codeError(x: unknown): string {
  if (x instanceof AdminError) {
    if (x.status === 429) return "Too many tries. Wait 15 minutes, then try again.";
    if (x.status === 401 || x.status === 400 || x.status === 403) return "That code did not work. Codes change every 30 seconds, so wait for a new one and type it again.";
  }
  return say(x);
}
const NOT_STAFF = "This account cannot open this area. Use the account you were given access with.";

function Steps({ step }: { step: Step }) {
  const two = step !== "account";
  return (
    <ol aria-label="Sign-in steps" className="mt-4 flex gap-2 text-xs">
      <li aria-current={two ? undefined : "step"} className={`flex-1 rounded-lg border px-3 py-2 ${two ? "border-white/10 text-zinc-400" : "border-cyan text-cyan"}`}>1 · Your account</li>
      <li aria-current={two ? "step" : undefined} className={`flex-1 rounded-lg border px-3 py-2 ${two ? "border-cyan text-cyan" : "border-white/10 text-zinc-400"}`}>2 · {step === "enrol" ? "Set up authenticator" : "Authenticator code"}</li>
    </ol>
  );
}

function EyeButton({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-label="Show password" aria-pressed={show} onClick={onToggle} className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-full text-zinc-300 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-cyan">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {show ? <path d="M3 3l18 18M10.6 6.2A9.7 9.7 0 0112 6c5 0 8.5 4.2 9.5 6-.4.8-1.3 2.1-2.7 3.3M6.6 7.6C4.5 9 3.2 10.9 2.5 12c1 1.8 4.5 6 9.5 6 1.6 0 3-.4 4.2-1M9.9 9.9a3 3 0 004.2 4.2" /> : <><path d="M2.5 12C3.5 10.2 7 6 12 6s8.5 4.2 9.5 6c-1 1.8-4.5 6-9.5 6s-8.5-4.2-9.5-6z" /><circle cx="12" cy="12" r="3" /></>}
      </svg>
    </button>
  );
}

/**
 * Staff sign-in. Step 1 proves the ordinary account: the site sign-in this browser already has ("Continue as ..."), Google, or email and
 * password. Step 2 is ALWAYS the authenticator: a 6-digit code, or on the very first sign-in the set-up (QR code and key) and then a code.
 * The server rule stays the same: a staff row and a valid code, every time. The account token from step 1 lives only in this component's
 * memory and is never written anywhere; the site sign-in is read, never changed.
 */
export default function SignIn({ ended }: { ended: boolean; onNotStaff?: () => void }) {
  const [step, setStep] = useState<Step>("account");
  const [site, setSite] = useState<SiteSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [code, setCode] = useState("");
  const [userToken, setUserToken] = useState<string | null>(null);
  const [via, setVia] = useState("");
  const [enrol, setEnrol] = useState<{ secret: string; qr: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"" | "site" | "google" | "password" | "code" | "enrol">("");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { setSite(readSiteSession()); }, []);
  useEffect(() => { if (step !== "account") codeRef.current?.focus(); }, [step, enrol]);

  function toCode(token: string, who: string) { setUserToken(token); setVia(who); setErr(""); setNote(""); setCode(""); setStep("code"); }
  function restart(message = "") { setUserToken(null); setEnrol(null); setCode(""); setStep("account"); setErr(message); setNote(""); setTimeout(() => headRef.current?.focus(), 0); }

  async function continueAsSite() {
    if (!site) return;
    setBusy("site"); setErr("");
    try {
      const ok = await admin.checkUserToken(site.token);
      if (ok === true) toCode(site.token, maskedOnly(site.email));
      else { setSite(null); setErr(ok === "inactive" ? "This account is not active, so it cannot sign in." : "Your site sign-in has expired. Sign in below."); }
    } catch (x) { setErr(say(x)); }
    setBusy("");
  }

  async function google(credential: string) {
    setBusy("google"); setErr("");
    try { toCode(await admin.checkGoogle(credential), "your Google account"); }
    catch (x) { setErr(x instanceof AdminError && x.status >= 400 && x.status < 500 && x.status !== 429 ? "Google sign-in did not work for this account. Try email and password." : codeError(x)); }
    setBusy("");
  }

  async function first(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) { setErr("Enter your email and password."); return; }
    setBusy("password"); setErr("");
    try { const t = await admin.checkPassword(email.trim(), password); setPassword(""); setShowPw(false); toCode(t, maskedOnly(email.trim().toLowerCase())); }
    catch (x) { setErr(x instanceof AdminError && x.status === 401 ? "That email and password did not match." : x instanceof AdminError && x.status === 429 ? "Too many tries. Wait 15 minutes, then try again." : say(x)); }
    setBusy("");
  }

  async function startEnrol() {
    if (!userToken) return;
    setBusy("enrol"); setErr(""); setNote("");
    try {
      const r = await admin.enroll(userToken);
      setEnrol({ secret: r.secret, qr: await QRCode.toDataURL(r.otpauthUrl, { margin: 1, width: 220 }) });
      setCode(""); setStep("enrol");
    } catch (x) {
      if (x instanceof AdminError && x.status === 404) setErr("An authenticator cannot be set up for this account here. If you already set one up, type its code.");
      else setErr(say(x));
    }
    setBusy("");
  }

  async function second(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { setErr("Enter the 6-digit code from your authenticator app."); return; }
    setBusy("code"); setErr("");
    try { await admin.openSession(userToken as string, code); setUserToken(null); }
    catch (x) {
      setBusy("");
      if (x instanceof AdminError && x.status === 404) { restart(NOT_STAFF); return; }
      if (x instanceof AdminError && x.code === "totp_not_enrolled") { await startEnrol(); setNote("This is your first staff sign-in: set up your authenticator first."); return; }
      setErr(codeError(x)); setCode(""); return;
    }
    setBusy("");
  }

  async function copyKey() {
    if (!enrol) return;
    try { await navigator.clipboard.writeText(enrol.secret); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setErr("Copying did not work here. Select the key and copy it by hand."); }
  }

  const errBox = err && <p id="s-err" role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{err}</p>;
  const codeField = (
    <div>
      <label htmlFor="s-code" className="block text-sm font-medium text-zinc-100">Authenticator code</label>
      <input id="s-code" ref={codeRef} name="one-time-code" inputMode="numeric" pattern="[0-9]*" autoComplete="one-time-code" maxLength={6} placeholder="6 digits" className="field mt-1 font-mono text-lg tracking-widest" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} aria-describedby={err ? "s-err" : undefined} aria-invalid={err ? true : undefined} />
    </div>
  );

  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col justify-center px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Esports Hub · Staff</p>
      <h1 ref={headRef} tabIndex={-1} className="mt-1 font-display text-2xl font-bold text-white outline-none">Staff sign-in</h1>
      <Steps step={step} />
      {ended && step === "account" && <p role="status" className="mt-3 text-sm text-zinc-300">Your staff session ended. Sign in again.</p>}

      {step === "account" && (
        <div className="mt-5 space-y-4">
          {errBox}
          {site && (
            <div className="card !p-4">
              <p className="text-sm text-zinc-300">You are signed in to the site as <span className="font-mono text-zinc-100">{maskedOnly(site.email)}</span>.</p>
              <button type="button" disabled={!!busy} onClick={continueAsSite} className="btn mt-3 w-full disabled:opacity-60">{busy === "site" ? "Checking..." : `Continue as ${maskedOnly(site.email)}`}</button>
            </div>
          )}
          <GoogleButton onCredential={google} disabled={!!busy} />
          <div className="flex items-center gap-3 text-xs text-zinc-400" aria-hidden="true"><span className="h-px flex-1 bg-white/10" />or with email and password<span className="h-px flex-1 bg-white/10" /></div>
          <form onSubmit={first} className="space-y-4" noValidate>
            <div><label htmlFor="s-email" className="block text-sm font-medium text-zinc-100">Email</label><input id="s-email" name="username" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} className="field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor="s-pw" className="block text-sm font-medium text-zinc-100">Password</label>
                <Link href="/forgot-password/" className="text-sm text-cyan underline underline-offset-2">Forgot password?</Link>
              </div>
              <div className="relative mt-1">
                <input id="s-pw" name="password" type={showPw ? "text" : "password"} autoComplete="current-password" autoCapitalize="none" spellCheck={false} className="field pr-12" value={password} onChange={(e) => setPassword(e.target.value)} />
                <EyeButton show={showPw} onToggle={() => setShowPw((v) => !v)} />
              </div>
              <p className="mt-1 text-xs text-zinc-400">Signed up with Google? Use the Google button, or set a password with Forgot password.</p>
            </div>
            <button type="submit" disabled={!!busy} className="btn w-full disabled:opacity-60">{busy === "password" ? "Checking..." : "Continue"}</button>
          </form>
        </div>
      )}

      {step === "code" && (
        <form onSubmit={second} className="mt-5 space-y-4" noValidate>
          <p className="text-sm text-zinc-300">Signed in as <span className="font-mono text-zinc-100">{via}</span>. Now type the 6-digit code from your authenticator app.</p>
          {codeField}
          {errBox}
          <button type="submit" disabled={!!busy} className="btn w-full disabled:opacity-60">{busy === "code" ? "Checking..." : "Sign in"}</button>
          <button type="button" disabled={!!busy} className="btn-ghost w-full disabled:opacity-60" onClick={startEnrol}>{busy === "enrol" ? "Starting..." : "First time? Set up your authenticator"}</button>
          <button type="button" className="btn-ghost w-full" onClick={() => restart()}>Use another account</button>
        </form>
      )}

      {step === "enrol" && enrol && (
        <form onSubmit={second} className="mt-5 space-y-4" noValidate>
          {note && <p role="status" className="text-sm text-zinc-200">{note}</p>}
          <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-300">
            <li>Open an authenticator app on your phone: {APPS.join(", ")}.</li>
            <li>Add an account and scan this code, or type the key below.</li>
            <li>Type the 6-digit code the app shows.</li>
          </ol>
          {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL drawn in the browser; next/image cannot optimise it */}
          <div className="flex justify-center"><img src={enrol.qr} alt="QR code to add Esports Hub staff to an authenticator app" width={220} height={220} className="rounded-xl bg-white p-2" /></div>
          <div>
            <p className="text-sm font-medium text-zinc-100" id="s-key-l">Key (if you cannot scan)</p>
            <div className="mt-1 flex items-center gap-2">
              <code aria-labelledby="s-key-l" data-testid="totp-key" className="field flex-1 select-all break-all font-mono text-sm">{enrol.secret.replace(/(.{4})/g, "$1 ").trim()}</code>
              <button type="button" className="btn-ghost shrink-0" onClick={copyKey}>{copied ? "Copied" : "Copy key"}</button>
            </div>
            <p className="mt-1 text-xs text-zinc-400">Shown once. Keep it private: anyone with this key can make codes for your staff account.</p>
          </div>
          {codeField}
          {errBox}
          <button type="submit" disabled={!!busy} className="btn w-full disabled:opacity-60">{busy === "code" ? "Checking..." : "Finish and sign in"}</button>
          <button type="button" className="btn-ghost w-full" onClick={() => restart()}>Cancel</button>
        </form>
      )}
    </main>
  );
}
