"use client";

import { useEffect, useRef, useState } from "react";
import { verifyEmail } from "@/lib/api/f-verify";
import { startMessage } from "@/lib/verify-email";
import { checkEmail, suggestEmail } from "@/lib/auth-validate";

const COOLDOWN_S = 60;

/** Where "Open your inbox" goes, for the mail services most people here use. Unknown services get no button (never a guess). */
export function inboxLink(email: string): { name: string; href: string } | null {
  const d = email.split("@")[1]?.toLowerCase() ?? "";
  if (d === "gmail.com" || d === "googlemail.com") return { name: "Gmail", href: "https://mail.google.com/mail/u/0/#inbox" };
  if (["outlook.com", "hotmail.com", "live.com", "msn.com"].includes(d)) return { name: "Outlook", href: "https://outlook.live.com/mail/0/inbox" };
  if (d === "yahoo.com" || d === "yahoo.in" || d === "ymail.com") return { name: "Yahoo Mail", href: "https://mail.yahoo.com/" };
  if (d === "icloud.com" || d === "me.com") return { name: "iCloud Mail", href: "https://www.icloud.com/mail" };
  return null;
}

/**
 * Shown instead of the app for a new account whose email is not confirmed yet. The email goes out at sign-up; this screen lets the person
 * open their inbox, ask for another link (with a wait between sends), or fix a mistyped address. It notices on its own when the link is opened,
 * in this browser or any other, and then the app appears.
 */
export default function VerifyScreen({ email: first, refresh }: { email: string; refresh: () => void }) {
  const [email, setEmail] = useState(first);
  const [wait, setWait] = useState(COOLDOWN_S); // the sign-up email counts as the first send
  const [note, setNote] = useState(""), [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false), [draft, setDraft] = useState(""), [draftErr, setDraftErr] = useState("");
  const sending = useRef(false);
  const inbox = inboxLink(email);

  useEffect(() => { setEmail(first); }, [first]);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait((w) => w - 1), 1000); return () => clearTimeout(t); }, [wait]);

  // Look for the confirmation every few seconds while the tab is open, and at once when the person comes back to it.
  useEffect(() => {
    const tick = () => { if (document.visibilityState === "visible") refresh(); };
    const t = setInterval(tick, 5000);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", tick); };
  }, [refresh]);

  const resend = async () => {
    if (sending.current || wait > 0) return;
    sending.current = true; setBusy(true); setErr(""); setNote("");
    try { await verifyEmail.start(); setNote(`A new link is on its way to ${email}. Check spam too. Older links no longer work.`); setWait(COOLDOWN_S); }
    catch (e) { setErr(startMessage(e)); }
    finally { sending.current = false; setBusy(false); }
  };

  const change = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (sending.current) return;
    const bad = checkEmail(draft);
    if (bad) { setDraftErr(bad); return; }
    sending.current = true; setBusy(true); setDraftErr(""); setErr(""); setNote("");
    try {
      const r = await verifyEmail.change(draft.trim());
      setEmail(r.email); setEditing(false); setDraft(""); setWait(COOLDOWN_S);
      setNote(`We sent a new link to ${r.email}.`);
    } catch (e) {
      const x = e as { status?: number; detail?: { code?: string } };
      setDraftErr(x?.detail?.code === "email_taken" ? "That email already has an account." : x?.status === 400 ? "That does not look like an email address." : x?.status === 429 ? "Too many changes. Try again in an hour." : startMessage(e));
    } finally { sending.current = false; setBusy(false); }
  };

  const fix = editing ? suggestEmail(draft) : null;

  return (
    <section aria-labelledby="verify-h" className="mx-auto max-w-md py-8 text-center sm:py-14">
      <div aria-hidden="true" className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-cyan/30 bg-cyan/10">
        <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-cyan" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM3.5 7.5l8.5 6 8.5-6" /></svg>
      </div>
      <h1 id="verify-h" className="mt-5 font-display text-2xl font-bold text-white">Check your email</h1>
      <p className="mt-2 text-zinc-300">We sent a link to <strong className="break-all text-white">{email}</strong>. Open it to start using Esports Hub. The link works once and expires in 30 minutes.</p>

      {inbox && <a href={inbox.href} target="_blank" rel="noopener noreferrer" className="btn mt-6 inline-flex w-full items-center justify-center sm:w-auto sm:px-8">Open {inbox.name}</a>}

      <div className="mt-6 space-y-3" aria-live="polite">
        {note && <p role="status" className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">{note}</p>}
        {err && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-100">{err}</p>}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button type="button" onClick={resend} disabled={busy || wait > 0} className="btn-ghost !min-h-11 px-6 disabled:opacity-60">
          {wait > 0 ? `Send again in ${wait}s` : "Send the email again"}
        </button>
        <p className="text-xs text-zinc-400">Nothing there? Look in spam or promotions, and check the address above.</p>
      </div>

      <div className="mt-8 border-t border-white/10 pt-5">
        {!editing ? (
          <button type="button" onClick={() => { setEditing(true); setDraft(""); setNote(""); setErr(""); }} className="text-sm text-cyan underline">Wrong email? Change it</button>
        ) : (
          <form onSubmit={change} noValidate className="mx-auto max-w-xs text-left">
            <label htmlFor="verify-new-email" className="block text-sm text-zinc-300">Correct email address</label>
            <input id="verify-new-email" autoFocus className={`field mt-1 w-full ${draftErr ? "!border-red-400/80" : ""}`} type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="email" value={draft} onChange={(e) => { setDraft(e.target.value); setDraftErr(""); }} aria-invalid={!!draftErr} aria-describedby={draftErr ? "verify-new-email-err" : undefined} />
            {draftErr && <p id="verify-new-email-err" role="alert" className="mt-1 text-xs text-red-300">{draftErr}</p>}
            {fix && !draftErr && <p className="mt-1 text-xs text-zinc-300">Did you mean <button type="button" className="text-cyan underline" onClick={() => setDraft(fix)}>{fix}</button>?</p>}
            <div className="mt-3 flex gap-2">
              <button className="btn !min-h-11 flex-1" disabled={busy}>{busy ? "Saving…" : "Save and send"}</button>
              <button type="button" className="btn-ghost !min-h-11 px-4" onClick={() => { setEditing(false); setDraftErr(""); }}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
