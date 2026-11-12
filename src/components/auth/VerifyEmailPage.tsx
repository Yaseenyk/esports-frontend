"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/components/cloud/useSession";
import { hasBackend } from "@/lib/api";
import { verifyEmail } from "@/lib/api/f-verify";
import { startMessage, verifyFailure, verifyTokenFromQuery } from "@/lib/verify-email";
import { takeTokenSearch } from "@/lib/tokenHygiene";

type Phase = "reading" | "missing" | "signin" | "working" | "done" | "expired" | "error";

/** The page behind the link in the verification email. The token leaves the address bar at once (tokenHygiene) and is held only in this tab. */
export default function VerifyEmailPage() {
  const session = useSession();
  const token = useRef("");
  const [read, setRead] = useState(false);
  const [phase, setPhase] = useState<Phase>("reading");
  const [err, setErr] = useState("");
  const [resent, setResent] = useState(false);
  const sending = useRef(false);

  useEffect(() => { token.current = verifyTokenFromQuery(takeTokenSearch()); setRead(true); }, []);

  useEffect(() => {
    if (!read) return;
    if (!token.current) { setPhase("missing"); return; }
    if (!session) { setPhase("signin"); return; }
    if (sending.current) return;
    sending.current = true; setPhase("working");
    verifyEmail.confirm(token.current)
      .then(() => { token.current = ""; setPhase("done"); })
      .catch((e) => {
        const f = verifyFailure(e);
        if (f.kind === "expired") setPhase("expired");
        else if (f.kind === "signin") setPhase("signin");
        else { setErr(f.text); setPhase("error"); }
      })
      .finally(() => { sending.current = false; });
  }, [read, session]);

  const resend = async () => {
    setErr("");
    try { await verifyEmail.start(); setResent(true); } catch (e) { setErr(startMessage(e)); }
  };

  let body: React.ReactNode;
  if (!hasBackend) body = <p className="text-sm text-amber-100">Accounts are not connected in this build.</p>;
  else if (phase === "reading" || phase === "working") body = <p role="status" className="text-zinc-300">Checking your link...</p>;
  else if (phase === "missing") body = <p role="alert" className="text-zinc-200">This page needs the link from your email. Open the link in the email again.</p>;
  else if (phase === "signin") body = <div><p role="alert" className="text-zinc-200">Sign in with the account you made, then this page confirms your email.</p><Link className="btn mt-4 w-full" href="/login/">Sign in</Link></div>;
  else if (phase === "done") body = <div><p role="status" className="text-emerald-100">Your email is confirmed.</p><Link className="btn mt-4 w-full" href="/app/">Open the app</Link></div>;
  else if (phase === "expired") body = (
    <div>
      <p role="alert" className="text-zinc-200">This link has expired or was already used. Links work once, for 30 minutes.</p>
      {resent ? <p role="status" className="mt-4 text-emerald-100">A new link is on its way. Check spam too.</p> : <button type="button" className="btn mt-4 w-full" onClick={resend}>Send me a new link</button>}
      {err && <p role="alert" className="mt-3 text-red-200">{err}</p>}
    </div>
  );
  else body = <p role="alert" className="text-red-200">{err}</p>;

  return (
    <div className="mx-auto max-w-md space-y-5 py-8">
      <h1 className="font-display text-3xl font-black text-white">Confirm your email</h1>
      <div className="card space-y-4 !text-base">{body}</div>
    </div>
  );
}
