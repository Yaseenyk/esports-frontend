"use client";

import { useEffect, useRef, useState } from "react";
import { unsubscribe, type UnsubscribeInfo } from "@/lib/api/f-reminders";
import { takeTokenSearch } from "@/lib/tokenHygiene";

type Phase = "loading" | "missing" | "notfound" | "error" | "ask" | "done";

/** The page behind the unsubscribe link in every reminder email. Opening it changes nothing; one tap on the button does. */
export default function UnsubscribePage() {
  const token = useRef("");
  const [phase, setPhase] = useState<Phase>("loading");
  const [info, setInfo] = useState<UnsubscribeInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    token.current = new URLSearchParams(takeTokenSearch()).get("t") ?? "";
    if (!token.current) { setPhase("missing"); return; }
    unsubscribe.info(token.current)
      .then((r) => { setInfo(r); setPhase(r.unsubscribed ? "done" : "ask"); })
      .catch((e) => setPhase((e as { status?: number }).status === 404 ? "notfound" : "error"));
  }, []);

  const confirm = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    try { await unsubscribe.confirm(token.current); setInfo((i) => (i ? { ...i, unsubscribed: true } : i)); setPhase("done"); }
    catch (e) { setErr((e as { status?: number }).status === 429 ? "Too many tries. Wait a few minutes and try again." : "That did not work. Check your connection and try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md space-y-5 py-8">
      <h1 className="font-display text-3xl font-black text-white">Unsubscribe from event emails</h1>
      <div className="card space-y-4 !text-base">
        {phase === "loading" && <p role="status" className="text-zinc-300">Loading...</p>}
        {phase === "missing" && <p role="alert" className="text-zinc-200">This page needs the link from the email. Open the link in the email again.</p>}
        {phase === "notfound" && <p role="alert" className="text-zinc-200">This link is not valid. It may have been mistyped. Open the link in the email again.</p>}
        {phase === "error" && <p role="alert" className="text-red-200">We could not reach the server. Check your connection and reload this page.</p>}
        {phase === "ask" && info && (
          <>
            <p className="text-zinc-100">Stop emails about <strong className="text-white">{info.event}</strong> to <strong className="text-white">{info.email}</strong>?</p>
            <p className="text-sm text-zinc-300">This only stops emails from this event. Nothing else changes.</p>
            {err && <p role="alert" className="text-red-200">{err}</p>}
            <button type="button" className="btn w-full" onClick={confirm} disabled={busy}>{busy ? "Please wait..." : "Yes, unsubscribe me"}</button>
          </>
        )}
        {phase === "done" && info && <p role="status" className="text-emerald-100">Done. You will not get any more emails about <strong className="text-white">{info.event}</strong> at {info.email}.</p>}
      </div>
    </div>
  );
}
