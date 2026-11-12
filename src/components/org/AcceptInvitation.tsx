"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { useSession } from "@/components/cloud/useSession";
import { orgApi } from "@/lib/api/f-org";
import { verifyEmail } from "@/lib/api/f-verify";
import { acceptError, acceptedNext, acceptedText } from "@/lib/org";
import { auth } from "@/lib/api/cloud";

type Result = { kind?: string; orgId?: string; eventId?: string; role?: string };

/**
 * Accepts a club or event invitation. The address is cleaned by the page (token hygiene) before this runs; the token arrives as a prop and is
 * only ever sent in the body of one POST. Signed out: sign in or create an account right here, then press Accept. Nothing is accepted by
 * itself, so opening a link never changes anything by accident.
 */
export default function AcceptInvitation({ token, embedded = false }: { token: string; /** Inside another page that already has its own heading. */ embedded?: boolean }) {
  const session = useSession();
  const [busy, setBusy] = useState(false), [res, setRes] = useState<Result | null>(null);
  const [fail, setFail] = useState<ReturnType<typeof acceptError> | null>(null);
  const [vmsg, setVmsg] = useState(""), [verr, setVerr] = useState("");
  const sending = useRef(false);

  const accept = async () => {
    if (sending.current) return;
    sending.current = true; setBusy(true); setFail(null); setVmsg(""); setVerr("");
    try { setRes(await orgApi.accept(token)); } catch (x) { setFail(acceptError(x)); } finally { sending.current = false; setBusy(false); }
  };
  const sendVerify = async () => {
    setVmsg(""); setVerr("");
    try { await verifyEmail.start(); setVmsg("We sent you an email. Open the link in it, then come back to this page and press the button again."); }
    catch (x) { setVerr((x as { status?: number }).status === 429 ? "Too many tries. Wait a few minutes and try again." : "Could not send the email. Try again in a moment."); }
  };

  if (res) {
    const n = acceptedNext(res);
    return (
      <div role="status" className="sk-pop space-y-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-5 text-center">
        <p className="font-display text-xl font-bold text-white">{acceptedText(res)}</p>
        <Link href={n.href} className="btn !min-h-11 px-5 text-sm">{n.label}</Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {embedded ? <h2 className="font-display text-lg font-bold text-white">Accept a club or event invitation</h2> : <h1 className="font-display text-2xl font-bold text-white">You have been invited</h1>}
      <p className="rounded-xl border border-white/[0.14] bg-[#0a0b0d] p-3 text-sm text-zinc-200">Someone invited you to help run events on Esports Hub. Press the button to accept. You need to be signed in with the email address they invited, and that address must be verified.</p>
      {!session ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300">Sign in or create an account first. Use the email address the invitation was sent to.</p>
          <AuthForm initialMode="login" />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300">Signed in as <strong className="text-white">{session.user.email}</strong>.</p>
          <button type="button" className="btn w-full !min-h-11" disabled={busy} onClick={accept}>{busy ? "Accepting…" : fail ? "Try again" : "Accept the invitation"}</button>
        </div>
      )}
      {fail && (
        <div role="alert" className="space-y-3 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">
          <p>{fail.text}</p>
          {fail.verify && <div className="space-y-2"><button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={sendVerify}>Send me the verification email</button>{vmsg && <p role="status" className="text-emerald-200">{vmsg}</p>}{verr && <p className="text-red-200">{verr}</p>}</div>}
          {fail.tryOtherAccount && <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => auth.logout()}>Sign out and use another account</button>}
        </div>
      )}
    </div>
  );
}
