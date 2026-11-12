"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@/lib/api/useQuery";
import { orgApi } from "@/lib/api/f-org";
import { auditLine, orgError, type AuditEntry, type ContextOrg, type OrgMembers } from "@/lib/org";
import { ClubGate, ListSkeleton, PageHead } from "./ui";

const stamp = (iso: string) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

function Body({ org }: { org: ContextOrg }) {
  const first = useQuery<{ entries: AuditEntry[]; next: string | null }>(`/orgs/${encodeURIComponent(org.id)}/audit?limit=30`, { ttl: 5_000 });
  const people = useQuery<OrgMembers>(`/orgs/${encodeURIComponent(org.id)}/members`, { ttl: 30_000 });
  const [more, setMore] = useState<AuditEntry[]>([]), [next, setNext] = useState<string | null>(null), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  useEffect(() => { setMore([]); setNext(first.data?.next ?? null); }, [first.data]);
  const names: Record<string, string> = {};
  for (const m of people.data?.members ?? []) names[m.userId] = m.isYou ? "You" : m.name;
  const rows = [...(first.data?.entries ?? []), ...more];
  const loadMore = async () => {
    if (!next || busy) return;
    setBusy(true); setErr("");
    try { const r = await orgApi.audit(org.id, next); setMore((m) => [...m, ...r.entries]); setNext(r.next); } catch (e) { setErr(orgError(e)); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-6">
      <PageHead back title="Activity" intro="Who changed what in your club, newest first. Only admins see this." />
      {first.loading && <ListSkeleton />}
      {first.error && <div className="space-y-2"><p role="alert" className="text-sm text-red-300">{orgError(first.error)}</p><button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={first.refetch}>Try again</button></div>}
      {first.data && rows.length === 0 && <p className="card text-zinc-300">Nothing has happened yet. Changes to people and invitations show up here.</p>}
      {rows.length > 0 && (
        <ol aria-label="Club activity" className="space-y-2">
          {rows.map((e) => (
            <li key={e.id} className="rounded-xl border border-white/10 p-3 text-sm">
              <p className="text-zinc-100">{auditLine(e, names)}</p>
              <p className="text-xs text-zinc-400"><time dateTime={e.at}>{stamp(e.at)}</time></p>
            </li>
          ))}
        </ol>
      )}
      {next && <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" disabled={busy} onClick={loadMore}>{busy ? "Loading…" : "Show older activity"}</button>}
      {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
    </div>
  );
}

export default function ActivityScreen() {
  return <ClubGate need="audit">{(org) => <Body org={org} />}</ClubGate>;
}
