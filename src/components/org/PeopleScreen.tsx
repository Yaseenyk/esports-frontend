"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@/lib/api/useQuery";
import { orgApi } from "@/lib/api/f-org";
import {
  CAP, LAST_ADMIN_HINT, ROLE_EXPLAIN, can, leaveQuestion, memberActions, orgError, removeQuestion, roleChangeQuestion, roleLabel,
  type ContextOrg, type OrgMember, type OrgMembers,
} from "@/lib/org";
import { ClubGate, ConfirmBar, ListSkeleton, Note, PageHead, SuspendedBanner } from "./ui";
import { useOrg } from "./OrgContext";

type Pending = { kind: "role" | "remove" | "leave"; member: OrgMember };

function Body({ org }: { org: ContextOrg }) {
  const router = useRouter();
  const shell = useOrg();
  const q = useQuery<OrgMembers>(`/orgs/${encodeURIComponent(org.id)}/members`, { ttl: 5_000 });
  const [pending, setPending] = useState<Pending | null>(null), [busy, setBusy] = useState(false), [err, setErr] = useState(""), [msg, setMsg] = useState("");
  const viewerRole = q.data?.role ?? org.orgRole;
  const members = q.data?.members ?? [];
  const paused = org.status === "suspended";

  const run = async () => {
    if (!pending || busy) return;
    const { kind, member } = pending;
    setBusy(true); setErr(""); setMsg("");
    try {
      if (kind === "role") {
        const to = member.role === "admin" ? "member" : "admin";
        await orgApi.setRole(org.id, member.userId, to);
        setMsg(`${member.name} is now ${to === "admin" ? "an admin" : "a member"}.`);
      } else if (kind === "remove") {
        await orgApi.removeMember(org.id, member.userId);
        setMsg(`${member.name} was removed from your club.`);
      } else {
        await orgApi.removeMember(org.id, member.userId);
        shell.refresh(); // the shell must stop showing a club the person has left
        router.replace("/app/");
        return;
      }
      setPending(null); q.refetch();
    } catch (e) { setErr(orgError(e, kind === "leave" ? "leave" : "people")); setPending(null); q.refetch(); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <PageHead back title="People" intro="Everyone who can see and run this club's events." />
      <SuspendedBanner status={org.status} />
      {can(org, CAP.people) && (
        <section aria-label="Roles" className="rounded-xl border border-white/10 bg-[#0a0b0d] p-3 text-sm text-zinc-300">
          <p><strong className="text-zinc-100">Admin:</strong> {ROLE_EXPLAIN.admin}</p>
          <p className="mt-1"><strong className="text-zinc-100">Member:</strong> {ROLE_EXPLAIN.member}</p>
        </section>
      )}
      {can(org, CAP.people) && <Link href="/app/org/invite/" className="btn !min-h-11 px-4 text-sm">Invite someone</Link>}
      {q.loading && <ListSkeleton />}
      {q.error && <div className="space-y-2"><p role="alert" className="text-sm text-red-300">{orgError(q.error)}</p><button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={q.refetch}>Try again</button></div>}
      {q.data && members.length === 0 && <p className="card text-zinc-300">Nobody is listed. Refresh the page.</p>}
      {q.data && members.length > 0 && (
        <ul aria-label="People in your club" className="space-y-2">
          {members.map((m) => {
            const a = memberActions(viewerRole, m, members);
            const open = pending?.member.userId === m.userId ? pending : null;
            return (
              <li key={m.userId} className="rounded-xl border border-white/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{m.name}{m.isYou && <span className="ml-2 rounded-full border border-cyan/50 px-2 py-0.5 text-xs font-normal text-cyan">You</span>}</p>
                    {m.email && <p className="truncate text-xs text-zinc-400">{m.email}</p>}
                  </div>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-zinc-200">{roleLabel(m.role)}</span>
                </div>
                {!paused && !open && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {a.changeRole && <button type="button" className="chip !min-h-11" disabled={busy} onClick={() => { setErr(""); setMsg(""); setPending({ kind: "role", member: m }); }}>{a.changeRole === "admin" ? "Make admin" : "Make member"}</button>}
                    {a.remove && <button type="button" className="chip !min-h-11" disabled={busy} onClick={() => { setErr(""); setMsg(""); setPending({ kind: "remove", member: m }); }}>Remove</button>}
                    {a.leave && !a.leaveBlocked && <button type="button" className="chip !min-h-11" disabled={busy} onClick={() => { setErr(""); setMsg(""); setPending({ kind: "leave", member: m }); }}>Leave club</button>}
                  </div>
                )}
                {a.leaveBlocked && <p className="mt-2 text-xs text-amber-200">{LAST_ADMIN_HINT}</p>}
                {open && (
                  <ConfirmBar
                    danger={open.kind !== "role" || m.role !== "member"}
                    busy={busy}
                    question={open.kind === "role" ? roleChangeQuestion(m.name, m.role === "admin" ? "member" : "admin") : open.kind === "remove" ? removeQuestion(m.name, m.role === "admin") : leaveQuestion}
                    yes={open.kind === "role" ? (m.role === "admin" ? "Make member" : "Make admin") : open.kind === "remove" ? "Remove" : "Leave club"}
                    onYes={run} onNo={() => setPending(null)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      <Note msg={msg} err={err} />
    </div>
  );
}

export default function PeopleScreen() {
  return <ClubGate>{(org) => <Body org={org} />}</ClubGate>;
}
