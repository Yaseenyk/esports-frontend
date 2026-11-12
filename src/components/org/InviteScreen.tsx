"use client";

import { useRef, useState } from "react";
import ToolStep from "@/components/tools/ToolStep";
import { useQuery } from "@/lib/api/useQuery";
import { orgApi } from "@/lib/api/f-org";
import { ROLE_EXPLAIN, expiryText, orgError, roleLabel, validEmail, type ContextOrg, type CreatedInvitation, type OrgInvitation, type OrgRole } from "@/lib/org";
import { ClubGate, ConfirmBar, CopyButton, ListSkeleton, Note, PageHead, SuspendedBanner } from "./ui";

const when = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium" });

function Body({ org }: { org: ContextOrg }) {
  const list = useQuery<{ invitations: OrgInvitation[] }>(`/orgs/${encodeURIComponent(org.id)}/invitations`, { ttl: 5_000 });
  const [email, setEmail] = useState(""), [role, setRole] = useState<OrgRole>("member");
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [created, setCreated] = useState<CreatedInvitation | null>(null);
  const [revoking, setRevoking] = useState<OrgInvitation | null>(null), [rbusy, setRbusy] = useState(false), [msg, setMsg] = useState(""), [lerr, setLerr] = useState("");
  const sending = useRef(false);
  const paused = org.status === "suspended";
  const emailBad = email.trim() !== "" && !validEmail(email);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending.current || !validEmail(email)) return;
    sending.current = true; setBusy(true); setErr(""); setMsg(""); setCreated(null);
    try { setCreated(await orgApi.invite(org.id, email.trim(), role)); setEmail(""); list.refetch(); }
    catch (x) { setErr(orgError(x, "invite")); } finally { sending.current = false; setBusy(false); }
  };
  const revoke = async () => {
    if (!revoking || rbusy) return;
    setRbusy(true); setLerr(""); setMsg("");
    try { await orgApi.revokeInvitation(org.id, revoking.id); setMsg(`The invitation for ${revoking.email} was cancelled. Its link no longer works.`); setRevoking(null); list.refetch(); }
    catch (x) { setLerr(orgError(x, "revoke")); setRevoking(null); list.refetch(); } finally { setRbusy(false); }
  };
  const open = list.data?.invitations ?? [];

  return (
    <div className="space-y-6">
      <PageHead back title="Invite someone" intro="Send a link to a person who helps you run events. Nothing is emailed: you copy the link and send it yourself." />
      <SuspendedBanner status={org.status} />

      <ToolStep n={1} title="Who are you inviting?" hint="Use the email address they signed up with. The link only works for that address.">
        <form onSubmit={send} className="space-y-3">
          <label className="block text-sm text-zinc-200">Their email
            <input className="field mt-1" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} aria-invalid={emailBad || undefined} aria-describedby="inv-email-help" />
          </label>
          <p id="inv-email-help" className={`text-xs ${emailBad ? "text-red-300" : "text-zinc-400"}`}>{emailBad ? "That does not look like an email address. Check it for typing mistakes." : "Check the spelling: a wrong address means the link will not work for them."}</p>
          <fieldset className="space-y-2">
            <legend className="text-sm text-zinc-200">What can they do?</legend>
            {(["member", "admin"] as const).map((r) => (
              <label key={r} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3">
                <input type="radio" name="inv-role" className="mt-0.5 h-5 w-5 shrink-0 accent-cyan" checked={role === r} onChange={() => setRole(r)} />
                <span className="text-sm"><span className="block font-semibold text-white">{roleLabel(r)}</span><span className="block text-zinc-300">{ROLE_EXPLAIN[r]}</span></span>
              </label>
            ))}
          </fieldset>
          <button className="btn !min-h-11 px-5 text-sm" disabled={busy || paused || !validEmail(email)}>{busy ? "Making the link…" : "Make the invitation link"}</button>
          <Note err={err} />
        </form>
      </ToolStep>

      {created && (
        <ToolStep n={2} title="Send them this link" done hint={`For ${created.email} as ${created.role === "admin" ? "an admin" : "a member"}. It works once and runs out on ${when(created.expiresAt)}.`}>
          <div role="status" className="space-y-3">
            <p className="break-all rounded-xl border border-cyan/40 bg-[#0a0b0d] p-3 font-mono text-xs text-cyan" data-testid="invite-link">{created.link}</p>
            <div className="flex flex-wrap items-center gap-2"><CopyButton text={created.link} /></div>
            <p className="text-sm text-amber-100">Copy it now. For safety this link is shown only once and cannot be shown again. If you lose it, cancel the invitation below and make a new one.</p>
          </div>
        </ToolStep>
      )}

      <section aria-label="Waiting invitations" className="space-y-3">
        <h2 className="font-display text-lg font-bold text-white">Waiting for an answer {open.length ? `(${open.length})` : ""}</h2>
        <p className="text-xs text-zinc-400">Wrong address? Cancel the invitation, then make a new one for the right address.</p>
        {list.loading && <ListSkeleton n={2} />}
        {list.error && <div className="space-y-2"><p role="alert" className="text-sm text-red-300">{orgError(list.error)}</p><button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={list.refetch}>Try again</button></div>}
        {list.data && open.length === 0 && <p className="text-sm text-zinc-400">No invitations are waiting. When you invite someone, they show up here until they accept.</p>}
        {open.length > 0 && (
          <ul className="space-y-2">
            {open.map((i) => (
              <li key={i.id} className="rounded-xl border border-white/10 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0"><p className="truncate font-semibold text-white">{i.email}</p><p className="text-xs text-zinc-400">{roleLabel(i.role)} · {i.expired ? <span className="text-amber-200">Expired</span> : expiryText(i.expiresAt, i.expired)}</p></div>
                  {!paused && revoking?.id !== i.id && <button type="button" className="chip !min-h-11" onClick={() => { setLerr(""); setMsg(""); setRevoking(i); }}>Cancel invitation</button>}
                </div>
                {revoking?.id === i.id && <ConfirmBar danger busy={rbusy} question={`Cancel the invitation for ${i.email}? Its link stops working.`} yes="Cancel invitation" onYes={revoke} onNo={() => setRevoking(null)} />}
              </li>
            ))}
          </ul>
        )}
        <Note msg={msg} err={lerr} />
      </section>
    </div>
  );
}

export default function InviteScreen() {
  return <ClubGate need="admin">{(org) => <Body org={org} />}</ClubGate>;
}
