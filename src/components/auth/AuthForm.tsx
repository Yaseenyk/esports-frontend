"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { auth, authMessage, explain } from "@/lib/api/cloud";
import GoogleButton from "./GoogleButton";

/**
 * Sign in or create an account. Used by the /login and /signup pages and by the Online panel.
 * `showTabs` adds the Sign in / Create account switch; the two pages leave it off because they link to each other already.
 */
export default function AuthForm({ initialMode = "login", onDone, intro, showTabs = true }: { initialMode?: "login" | "register"; onDone?: () => void; intro?: string; showTabs?: boolean }) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState(""), [name, setName] = useState(""), [pw, setPw] = useState("");
  const [show, setShow] = useState(false), [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const sending = useRef(false);

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending.current) return; // a double tap or Enter twice must not send two requests
    sending.current = true; setBusy(true); setErr("");
    try {
      if (mode === "login") await auth.login(email.trim(), pw); else await auth.register(email.trim(), name.trim() || "Organiser", pw);
      onDone?.();
    } catch (x) { setErr(authMessage(x, mode)); } finally { sending.current = false; setBusy(false); }
  };

  const withGoogle = async (credential: string) => {
    if (sending.current) return;
    sending.current = true; setBusy(true); setErr("");
    try {
      await auth.google(credential, mode === "register" && adult);
      onDone?.();
    } catch (x) {
      const code = (x as { detail?: { code?: string } })?.detail?.code;
      setErr(code === "adult_required"
        ? "There is no account for that Google address yet. Choose Create account, tick the box that says you are 18 or older, then continue with Google."
        : explain(x));
    } finally { sending.current = false; setBusy(false); }
  };

  return (
    <form onSubmit={go} className="mx-auto w-full max-w-sm space-y-3">
      {intro && <p className="text-sm text-zinc-300">{intro}</p>}
      {showTabs && (
        <div className="flex gap-2" role="group" aria-label="Account">
          {(["login", "register"] as const).map((m) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => { setMode(m); setErr(""); }} className={`chip ${mode === m ? "!border-cyan !text-cyan" : ""}`}>{m === "login" ? "Sign in" : "Create account"}</button>)}
        </div>
      )}
      {mode === "register" && <label className="block text-sm text-zinc-300">Your name<input className="field mt-1" name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} required /></label>}
      <label className="block text-sm text-zinc-300">Email<input className="field mt-1" name="email" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete={mode === "login" ? "username" : "email"} required /></label>
      <div>
        <label className="block text-sm text-zinc-300">Password<input className="field mt-1" name="password" type={show ? "text" : "password"} autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : undefined} required /></label>
        <div className="mt-1 flex min-h-6 items-center justify-between gap-3">
          <span className="text-xs text-zinc-400">{mode === "register" ? "At least 8 characters." : ""}</span>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs text-zinc-300"><input type="checkbox" className="h-5 w-5 accent-cyan" checked={show} onChange={(e) => setShow(e.target.checked)} />Show characters</label>
        </div>
      </div>
      {mode === "register" && (
        <label className="flex min-h-11 cursor-pointer items-start gap-2 text-xs text-zinc-300">
          <input type="checkbox" name="adult" className="mt-0.5 h-5 w-5 shrink-0 accent-cyan" checked={adult} onChange={(e) => setAdult(e.target.checked)} required />
          <span>I am 18 or older. I have read the <Link className="text-cyan underline" href="/terms/" target="_blank">terms</Link> and <Link className="text-cyan underline" href="/privacy/" target="_blank">privacy policy</Link>. I understand that I am responsible for the events I run and for the consent of everyone I add, and that Esports Hub is not responsible for that.</span>
        </label>
      )}
      {mode === "login" && <p className="-mt-1"><Link className="inline-flex min-h-11 items-center text-sm text-cyan underline" href={email.trim() ? `/forgot-password/?email=${encodeURIComponent(email.trim())}` : "/forgot-password/"}>Forgot password?</Link></p>}
      <div aria-live="polite">{err && <p role="alert" className="text-sm text-red-300">{err}</p>}</div>
      <button className="btn w-full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
      <div className="flex items-center gap-3 text-xs text-zinc-400" aria-hidden="true"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div>
      <GoogleButton onCredential={withGoogle} disabled={busy || (mode === "register" && !adult)} />
      {mode === "register" && !adult && <p className="text-center text-xs text-zinc-400">Tick the 18+ box to use Google.</p>}
    </form>
  );
}
