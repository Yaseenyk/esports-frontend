"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { auth, explain } from "@/lib/api/cloud";
import { deleteBlock, type DeleteBlock } from "@/lib/account-delete";
import { useOrg } from "@/components/org/OrgContext";
import { DeletionPreviewNote, useDeletionPreview } from "@/components/org/AccountPrivacy";
import { typedCountNeeded, typedCountOk } from "@/lib/org";

const Note = ({ msg, err }: { msg: string; err: string }) => <div aria-live="polite">{msg && <p className="text-sm text-emerald-300">{msg}</p>}{err && <p role="alert" className="text-sm text-red-300">{err}</p>}</div>;

/** Change password, delete account. */
export default function AccountPanel({ onDone }: { onDone: () => void }) {
  const [cur, setCur] = useState(""), [next, setNext] = useState(""), [del, setDel] = useState("");
  const [msg, setMsg] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const [derr, setDerr] = useState(""), [dbusy, setDbusy] = useState(false);
  const [block, setBlock] = useState<DeleteBlock | null>(null), [alsoEvents, setAlsoEvents] = useState(false);
  const working = useRef(false);
  // Club-era additions. All of this is inert (no request, nothing drawn) until /me/context says clubs are on, or the server asks for a typed count.
  const { teamOrgs } = useOrg();
  const [reload, setReload] = useState(0), [typed, setTyped] = useState(""), [progress, setProgress] = useState("");
  const pv = useDeletionPreview(teamOrgs || reload > 0, reload);
  const wanted = typedCountNeeded(pv.preview ?? undefined) ?? (block?.kind === "count" && pv.preview ? pv.preview.events.deletedCount : null);
  const need = wanted && wanted > 0 ? wanted : null;

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    if (working.current) return;
    if (next === cur) { setErr("Choose a new password that is different from the current one."); setMsg(""); return; }
    working.current = true; setBusy(true); setErr(""); setMsg("");
    try { await auth.changePassword(cur, next); setMsg("Password changed."); setCur(""); setNext(""); }
    catch (x) { setErr((x as { status?: number }).status === 401 ? "The current password is wrong." : explain(x)); }
    finally { working.current = false; setBusy(false); }
  };
  const remove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (working.current) return;
    if (!confirm("Delete your account and everything saved online? Events that have a co-organiser are handed over to them; your other events, rosters, photos and check-ins are deleted. This cannot be undone. Your copies in this browser stay.")) return;
    if (!typedCountOk(typed, need)) { setDerr(`Type the number ${need} in the box to confirm.`); return; }
    working.current = true; setDbusy(true); setDerr(""); setProgress("");
    try {
      // The server removes at most 35 events per request and says so; the same request is sent again until the account itself is gone.
      for (let round = 0; ; round++) {
        try { await auth.deleteAccount(del, block?.kind === "confirm" && alsoEvents, need === null ? undefined : Number(typed.trim())); break; }
        catch (x) {
          const code = (x as { detail?: { code?: string } }).detail?.code;
          if (code !== "deletion_continues" || round >= 20) throw x;
          setProgress(`Still deleting your events (round ${round + 1}). Keep this page open.`);
        }
      }
      onDone();
    }
    catch (x) {
      const b = deleteBlock(x);
      setBlock(b); setAlsoEvents(false); setProgress("");
      if (b?.kind === "count") setReload((n) => n + 1); // ask the server how many, so the box knows what to expect
      setDerr(b ? b.text : (x as { status?: number }).status === 401 ? "That password is wrong." : explain(x));
    }
    finally { working.current = false; setDbusy(false); }
  };
  return (
    <div className="space-y-5">
      <form onSubmit={change} className="space-y-3 rounded-xl border border-white/10 p-3">
        <h3 className="font-display font-bold text-white">Change password</h3>
        <label className="block text-sm text-zinc-300">Current password<input className="field mt-1" type="password" name="current-password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} required /></label>
        <label className="block text-sm text-zinc-300">New password<input className="field mt-1" type="password" name="new-password" autoComplete="new-password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required /><span className="mt-1 block text-xs text-zinc-400">At least 8 characters.</span></label>
        <button className="btn !min-h-11 px-4 text-sm" disabled={busy}>{busy ? "Changing…" : "Change password"}</button>
        <Note msg={msg} err={err} />
      </form>
      <form onSubmit={remove} className="space-y-3 rounded-xl border border-red-400/30 p-3">
        <h3 className="font-display font-bold text-white">Delete my account</h3>
        <p className="text-sm text-zinc-300">Removes everything saved online: events, rosters, photos, check-ins, invite and pass links. Cards you made in this browser are not touched.</p>
        {teamOrgs && <DeletionPreviewNote preview={pv.preview} error={pv.error} loading={pv.loading} />}
        <label className="block text-sm text-zinc-300">Password to confirm<input className="field mt-1" type="password" name="confirm-password" autoComplete="current-password" value={del} onChange={(e) => setDel(e.target.value)} required /></label>
        {need !== null && need > 0 && <label className="block text-sm text-zinc-300">Type {need} to confirm that many events are deleted<input className="field mt-1" inputMode="numeric" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} /></label>}
        <button className="btn-ghost !min-h-11 px-4 text-sm !border-red-400/50 text-red-200" disabled={dbusy || !del || (block?.kind === "confirm" && !alsoEvents) || !typedCountOk(typed, need)}>{dbusy ? "Deleting…" : "Delete account"}</button>
        {block?.kind === "confirm" && <label className="flex items-start gap-2 text-sm text-zinc-200"><input type="checkbox" className="mt-1" checked={alsoEvents} onChange={(e) => setAlsoEvents(e.target.checked)} />Yes, also delete my events that nobody can take over</label>}
        <Note msg={progress} err={derr} />
        {block?.kind === "club" && <p><Link href="/app/org/people/" className="inline-flex min-h-11 items-center text-sm text-cyan underline">Open People to hand the club over</Link></p>}
      </form>
      <p className="text-xs text-zinc-400">Forgot your password? Sign out, then press &ldquo;Forgot password?&rdquo; on the sign-in page. We email you a link to choose a new one.</p>
    </div>
  );
}
