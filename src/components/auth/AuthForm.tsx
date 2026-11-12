"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { auth, explain } from "@/lib/api/cloud";
import { checkEmail, checkName, checkPassword, passwordStrength, suggestEmail, type Strength } from "@/lib/auth-validate";
import GoogleButton from "./GoogleButton";

type Mode = "login" | "register";
type Field = "name" | "email" | "password" | "adult";
type Errors = Partial<Record<Field, string>>;
type Values = { email: string; name: string; pw: string; adult: boolean };

function Spinner() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 animate-spin fill-none stroke-current" strokeWidth="3" strokeLinecap="round"><path d="M12 3a9 9 0 019 9" /><path d="M12 3a9 9 0 100 18" opacity="0.25" /></svg>;
}

const STRENGTH: Record<Strength, { label: string; bar: string; text: string; fill: number }> = {
  weak: { label: "Weak", bar: "bg-red-400", text: "text-red-300", fill: 1 },
  okay: { label: "Okay", bar: "bg-amber-300", text: "text-amber-200", fill: 2 },
  good: { label: "Good", bar: "bg-cyan", text: "text-cyan", fill: 3 },
  strong: { label: "Strong", bar: "bg-emerald-300", text: "text-emerald-200", fill: 4 },
};

/** The message for a failed sign-in or sign-up request, in plain words. `taken` is set when the email already has an account. */
function requestFailure(e: unknown, mode: Mode): { text: string; taken?: boolean; field?: Field } {
  const x = e as { status?: number; retryAfterMs?: number };
  if (x?.status === 409 && mode === "register") return { text: "That email already has an account.", taken: true, field: "email" };
  if (x?.status === 401 && mode === "login") return { text: "That email and password do not match. Check them and try again, or reset your password.", field: "password" };
  if (x?.status === 400 && mode === "login") return { text: "Enter your email and password.", field: "email" };
  if (x?.status === 400 && mode === "register") return { text: "The server did not accept those details. Check your email and use a password of at least 8 characters.", field: "email" };
  if (x?.status === 429) {
    const mins = x.retryAfterMs ? Math.max(1, Math.ceil(x.retryAfterMs / 60000)) : 0;
    return { text: `Too many attempts. ${mins ? `Try again in about ${mins} minute${mins === 1 ? "" : "s"}.` : "Wait a few minutes and try again."}` };
  }
  return { text: explain(e) };
}

/**
 * Sign in or create an account. Used by the /login and /signup pages and by the Online panel.
 * `showTabs` adds the Sign in / Create account switch; the two pages leave it off because they link to each other already.
 * Every field is checked as you leave it and again on submit; a problem is said under the field, in words, and the first one is focused.
 */
export default function AuthForm({ initialMode = "login", onDone, intro, showTabs = true }: { initialMode?: Mode; onDone?: () => void; intro?: string; showTabs?: boolean }) {
  const uid = useId();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState(""), [name, setName] = useState(""), [pw, setPw] = useState("");
  const [show, setShow] = useState(false), [adult, setAdult] = useState(false), [gReady, setGReady] = useState(false);
  const [caps, setCaps] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formErr, setFormErr] = useState(""), [taken, setTaken] = useState(false);
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);
  const refs = { name: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null), password: useRef<HTMLInputElement>(null), adult: useRef<HTMLInputElement>(null) };
  const id = (f: Field) => `${uid}-${f}`;

  const register = mode === "register";
  const fix = suggestEmail(email);
  const strength = register && pw ? passwordStrength(pw, email) : null;
  const forgot = email.trim() ? `/forgot-password/?email=${encodeURIComponent(email.trim())}` : "/forgot-password/";

  const validate = (f: Field, v: Values = { email, name, pw, adult }): string => {
    if (f === "name") return register ? checkName(v.name) : "";
    if (f === "email") return checkEmail(v.email);
    if (f === "password") return register ? checkPassword(v.pw, v.email) : v.pw ? "" : "Enter your password.";
    return register && !v.adult ? "Tick the box to confirm you are 18 or older." : "";
  };
  const setField = (f: Field, msg: string) => setErrors((e) => ((e[f] ?? "") === msg ? e : { ...e, [f]: msg || undefined }));
  const blur = (f: Field) => setField(f, validate(f));
  // A shown problem goes away as soon as the value is fine; a new one only appears when you leave the field or submit.
  const edited = (f: Field, next: Values) => { if (errors[f] && !validate(f, next)) setField(f, ""); setFormErr(""); setTaken(false); };

  const switchMode = (m: Mode) => { setMode(m); setErrors({}); setFormErr(""); setTaken(false); };

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending.current) return;
    const order: Field[] = register ? ["name", "email", "password", "adult"] : ["email", "password"];
    const found: Errors = {};
    for (const f of order) { const m = validate(f); if (m) found[f] = m; }
    setErrors(found);
    const first = order.find((f) => found[f]);
    if (first) { refs[first].current?.focus(); return; }
    sending.current = true; setBusy(true); setFormErr(""); setTaken(false);
    try {
      if (!register) await auth.login(email.trim(), pw); else await auth.register(email.trim(), name.trim(), pw);
      onDone?.();
    } catch (x) {
      const f = requestFailure(x, mode);
      setFormErr(f.text); setTaken(!!f.taken);
      if (f.field) { refs[f.field].current?.focus(); if (f.field === "password") refs.password.current?.select(); }
    } finally { sending.current = false; setBusy(false); }
  };

  const withGoogle = async (credential: string) => {
    if (sending.current) return;
    sending.current = true; setBusy(true); setFormErr("");
    try {
      await auth.google(credential, register && adult);
      onDone?.();
    } catch (x) {
      const code = (x as { detail?: { code?: string } })?.detail?.code;
      setFormErr(code === "adult_required"
        ? "There is no account for that Google address yet. Choose Create account, tick the box that says you are 18 or older, then continue with Google."
        : explain(x));
    } finally { sending.current = false; setBusy(false); }
  };

  const inputClass = (f: Field) => `field mt-1 w-full transition-colors ${errors[f] ? "!border-red-400/80" : ""}`;
  const err = (f: Field) => errors[f] ? <p id={`${id(f)}-err`} role="alert" className="mt-1 text-xs text-red-300">{errors[f]}</p> : null;
  const describe = (f: Field, extra = "") => [errors[f] ? `${id(f)}-err` : "", extra].filter(Boolean).join(" ") || undefined;

  return (
    <form onSubmit={go} noValidate className="mx-auto w-full max-w-sm space-y-4">
      {intro && <p className="text-sm text-zinc-300">{intro}</p>}
      {showTabs && (
        <div className="flex gap-2" role="group" aria-label="Account">
          {(["login", "register"] as const).map((m) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => switchMode(m)} className={`chip ${mode === m ? "!border-cyan !text-cyan" : ""}`}>{m === "login" ? "Sign in" : "Create account"}</button>)}
        </div>
      )}

      {register && (
        <div>
          <label className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-xl border bg-white/5 p-3 text-xs text-zinc-300 transition-colors ${errors.adult ? "border-red-400/70" : "border-white/10"}`}>
            <input ref={refs.adult} type="checkbox" name="adult" aria-invalid={!!errors.adult} aria-describedby={describe("adult")} className="mt-0.5 h-5 w-5 shrink-0 accent-cyan" checked={adult} onChange={(e) => { setAdult(e.target.checked); edited("adult", { email, name, pw, adult: e.target.checked }); }} />
            <span>I am 18 or older. I have read the <Link className="text-cyan underline" href="/terms/" target="_blank">terms</Link> and <Link className="text-cyan underline" href="/privacy/" target="_blank">privacy policy</Link>. I understand that I am responsible for the events I run and for the consent of everyone I add, and that Esports Hub is not responsible for that.</span>
          </label>
          {err("adult")}
        </div>
      )}

      <div className="space-y-2">
        <GoogleButton onCredential={withGoogle} onReady={() => setGReady(true)} disabled={busy || (register && !adult)} />
        {gReady && register && !adult && <p className="text-center text-xs text-zinc-400">Tick the box above, then continue with Google.</p>}
      </div>
      {gReady && <div className="flex items-center gap-3 text-xs text-zinc-400" aria-hidden="true"><span className="h-px flex-1 bg-white/10" />{register ? "or sign up with email" : "or sign in with email"}<span className="h-px flex-1 bg-white/10" /></div>}

      {register && (
        <div>
          <label htmlFor={id("name")} className="block text-sm text-zinc-300">Your name</label>
          <input id={id("name")} ref={refs.name} className={inputClass("name")} name="name" value={name} onChange={(e) => { setName(e.target.value); edited("name", { email, name: e.target.value, pw, adult }); }} onBlur={() => blur("name")} autoComplete="name" maxLength={80} aria-invalid={!!errors.name} aria-describedby={describe("name")} />
          {err("name")}
        </div>
      )}

      <div>
        <label htmlFor={id("email")} className="block text-sm text-zinc-300">Email</label>
        <input id={id("email")} ref={refs.email} className={inputClass("email")} name="email" type="email" inputMode="email" enterKeyHint="next" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={email} onChange={(e) => { setEmail(e.target.value); edited("email", { email: e.target.value, name, pw, adult }); }} onBlur={() => blur("email")} autoComplete={register ? "email" : "username"} aria-invalid={!!errors.email} aria-describedby={describe("email", fix ? `${id("email")}-fix` : "")} />
        {err("email")}
        {fix && !errors.email && <p id={`${id("email")}-fix`} className="mt-1 text-xs text-zinc-300">Did you mean <button type="button" className="text-cyan underline" onClick={() => { setEmail(fix); setErrors((e) => ({ ...e, email: undefined })); refs.email.current?.focus(); }}>{fix}</button>?</p>}
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={id("password")} className="block text-sm text-zinc-300">Password</label>
          {!register && <Link className="text-xs text-cyan underline" href={forgot}>Forgot password?</Link>}
        </div>
        <div className="relative">
          <input id={id("password")} ref={refs.password} className={`${inputClass("password")} pr-12`} name="password" type={show ? "text" : "password"} enterKeyHint="go" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw} onChange={(e) => { setPw(e.target.value); edited("password", { email, name, pw: e.target.value, adult }); }} onBlur={() => { setCaps(false); blur("password"); }} onKeyUp={(e) => setCaps(e.getModifierState?.("CapsLock") === true)} onKeyDown={(e) => setCaps(e.getModifierState?.("CapsLock") === true)} autoComplete={register ? "new-password" : "current-password"} aria-invalid={!!errors.password} aria-describedby={describe("password", register ? `${id("password")}-hint` : "")} />
          <button type="button" aria-label="Show characters" aria-pressed={show} onClick={() => setShow((v) => !v)} className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-full text-zinc-300 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-cyan/60">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {show ? <path d="M3 3l18 18M10.6 6.2A9.7 9.7 0 0112 6c5 0 8.5 4.2 9.5 6-.4.8-1.3 2.1-2.7 3.3M6.6 7.6C4.5 9 3.2 10.9 2.5 12c1 1.8 4.5 6 9.5 6 1.6 0 3-.4 4.2-1M9.9 9.9a3 3 0 004.2 4.2" /> : <><path d="M2.5 12C3.5 10.2 7 6 12 6s8.5 4.2 9.5 6c-1 1.8-4.5 6-9.5 6s-8.5-4.2-9.5-6z" /><circle cx="12" cy="12" r="3" /></>}
            </svg>
          </button>
        </div>
        {caps && <p role="status" className="mt-1 text-xs text-amber-200">Caps Lock is on.</p>}
        {err("password")}
        {register && (
          <div id={`${id("password")}-hint`} className="mt-2">
            <div className="flex gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((n) => <span key={n} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${strength && n <= STRENGTH[strength].fill ? STRENGTH[strength].bar : "bg-white/10"}`} />)}
            </div>
            <p className="mt-1 text-xs text-zinc-400" aria-live="polite">{strength ? <>Password strength: <span className={STRENGTH[strength].text}>{STRENGTH[strength].label}</span>. </> : null}Use at least 8 characters{!strength || strength === "weak" ? "; a mix of words, numbers and symbols is stronger" : ""}.</p>
          </div>
        )}
      </div>

      <div aria-live="polite">
        {formErr && (
          <div role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-100">
            <p>{formErr}</p>
            {taken && <p className="mt-2"><button type="button" className="font-medium text-cyan underline" onClick={() => switchMode("login")}>Sign in instead</button> or <Link className="font-medium text-cyan underline" href={forgot}>reset your password</Link>.</p>}
          </div>
        )}
      </div>

      <button className="btn flex w-full items-center justify-center gap-2" disabled={busy} aria-busy={busy}>
        {busy ? <><Spinner />{register ? "Creating your account…" : "Signing in…"}</> : register ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
