"use client";

import { useState } from "react";
import { auth, explain } from "@/lib/api/cloud";

/** Sign in or create an account. Used by the /login and /signup pages and by the Online panel. */
export default function AuthForm({ initialMode = "login", onDone, intro }: { initialMode?: "login" | "register"; onDone?: () => void; intro?: string }) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState(""), [name, setName] = useState(""), [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");

  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      if (mode === "login") await auth.login(email.trim(), pw); else await auth.register(email.trim(), name.trim() || "Organiser", pw);
      onDone?.();
    } catch (x) { setErr(explain(x)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={go} className="mx-auto w-full max-w-sm space-y-3">
      {intro && <p className="text-sm text-zinc-300">{intro}</p>}
      <div className="flex gap-2" role="tablist" aria-label="Account">
        {(["login", "register"] as const).map((m) => <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`chip ${mode === m ? "!border-cyan !text-cyan" : ""}`}>{m === "login" ? "Sign in" : "Create account"}</button>)}
      </div>
      {mode === "register" && <label className="block text-sm text-zinc-300">Your name<input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></label>}
      <label className="block text-sm text-zinc-300">Email<input className="field mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
      <label className="block text-sm text-zinc-300">Password<input className="field mt-1" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : undefined} required />{mode === "register" && <span className="mt-1 block text-xs text-zinc-400">At least 8 characters.</span>}</label>
      {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
      <button className="btn w-full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
    </form>
  );
}
