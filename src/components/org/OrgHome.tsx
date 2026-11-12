"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@/lib/api/useQuery";
import { orgApi } from "@/lib/api/f-org";
import { CAP, can, localDay, orgError, roleLabel, type ContextOrg, type NeedsYou, type OrgDetail, type OrgEventRow, type OrgEvents } from "@/lib/org";
import { ClubGate, ListSkeleton, PageHead, SuspendedBanner } from "./ui";

const GROUP_LABEL: Record<OrgEventRow["group"], string> = { live: "Today", upcoming: "Coming up", past: "Finished", undated: "No date yet" };

function Stat({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const inner = <><span className="block text-xs uppercase tracking-wider text-zinc-400">{label}</span><span className="mt-1 block font-display text-3xl font-bold text-white">{value}</span></>;
  return href ? <Link href={href} className="card block !p-4 outline-none focus-visible:ring-2 focus-visible:ring-cyan">{inner}</Link> : <div className="card !p-4">{inner}</div>;
}

/** The "what needs you" strip: three counts, each a plain sentence. Nothing is shown when nothing needs the person. */
export function NeedsYouStrip({ n }: { n: NeedsYou }) {
  const items = [
    n.pendingRegistrations > 0 && `${n.pendingRegistrations} ${n.pendingRegistrations === 1 ? "team is" : "teams are"} waiting for you to approve`,
    n.pendingResults > 0 && `${n.pendingResults} ${n.pendingResults === 1 ? "result is" : "results are"} waiting to be checked`,
    n.teamsNotReady > 0 && `${n.teamsNotReady} ${n.teamsNotReady === 1 ? "team has" : "teams have"} not tapped Ready for a match`,
  ].filter(Boolean) as string[];
  if (!items.length) return <p className="rounded-xl border border-emerald-400/30 bg-[#0a0b0d] p-3 text-sm text-emerald-100">Nothing needs you right now.</p>;
  return (
    <section aria-label="What needs you" className="space-y-1.5 rounded-xl border border-amber-500/30 bg-[#0a0b0d] p-3 text-sm text-amber-100">
      <h2 className="font-display text-base font-bold text-white">What needs you</h2>
      <ul className="list-disc space-y-1 pl-5">{items.map((t) => <li key={t}>{t}</li>)}</ul>
    </section>
  );
}

function Events({ org }: { org: ContextOrg }) {
  const today = useMemo(() => localDay(), []);
  const first = useQuery<OrgEvents>(`/orgs/${encodeURIComponent(org.id)}/events?today=${encodeURIComponent(today)}&limit=20`, { ttl: 10_000 });
  const [more, setMore] = useState<OrgEventRow[]>([]), [next, setNext] = useState<string | null>(null), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  useEffect(() => { setMore([]); setNext(first.data?.next ?? null); }, [first.data]);
  const rows = [...(first.data?.events ?? []), ...more];
  const loadMore = async () => {
    if (!next || busy) return;
    setBusy(true); setErr("");
    try { const r = await orgApi.events(org.id, today, next); setMore((m) => [...m, ...r.events]); setNext(r.next); } catch (e) { setErr(orgError(e)); } finally { setBusy(false); }
  };
  if (first.loading) return <ListSkeleton />;
  if (first.error) return <div className="space-y-2"><p role="alert" className="text-sm text-red-300">{orgError(first.error)}</p><button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={first.refetch}>Try again</button></div>;
  const d = first.data;
  if (!d) return null;
  return (
    <div className="space-y-4">
      <NeedsYouStrip n={d.needsYou} />
      <section aria-label="Club events" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-white">Club events</h2>
          <p className="text-xs text-zinc-400">{d.groups.live} today · {d.groups.upcoming} coming up · {d.groups.past} finished · {d.groups.undated} without a date</p>
        </div>
        {rows.length === 0 ? (
          <div className="card space-y-3">
            <p className="text-zinc-200">No events in your club yet.</p>
            <p className="text-sm text-zinc-400">Make your first one in the ID card maker. Choose your club when you save it online.</p>
            {can(org, CAP.events) && <Link href="/app/id-cards/" className="btn !min-h-11 px-4 text-sm">Create an event</Link>}
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {rows.map((e) => {
              const need = e.needsYou.pendingRegistrations + e.needsYou.pendingResults + e.needsYou.teamsNotReady;
              return (
                <li key={e.id}>
                  <Link href={`/app/events/?id=${encodeURIComponent(e.id)}`} className="card block !p-4 outline-none focus-visible:ring-2 focus-visible:ring-cyan">
                    <span className="block truncate font-display text-lg font-bold text-white">{e.name}</span>
                    <span className="block truncate text-sm text-zinc-300">{[e.game, e.date].filter(Boolean).join(" · ") || "No details yet"}</span>
                    <span className="mt-2 flex flex-wrap gap-2 text-xs"><span className="rounded-full border border-white/15 px-2.5 py-1 text-zinc-200">{GROUP_LABEL[e.group]}</span>{need > 0 && <span className="rounded-full border border-amber-500/40 px-2.5 py-1 text-amber-100">{need} to do</span>}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {next && <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" disabled={busy} onClick={loadMore}>{busy ? "Loading…" : "Show more events"}</button>}
        {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
      </section>
    </div>
  );
}

function Body({ org }: { org: ContextOrg }) {
  const q = useQuery<OrgDetail>(`/orgs/${encodeURIComponent(org.id)}`, { ttl: 10_000 });
  const d = q.data;
  const admin = can(org, CAP.people);
  return (
    <div className="space-y-6">
      <PageHead title={d?.name ?? org.name} intro={`You are ${admin ? "an admin" : "a member"} of this club.`} />
      <SuspendedBanner status={d?.status ?? org.status} />
      {q.error && <p role="alert" className="text-sm text-red-300">{orgError(q.error)}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="list" aria-label="Club numbers">
        <div role="listitem"><Stat label="People" value={d ? d.counts.members : "…"} href="/app/org/people/" /></div>
        <div role="listitem"><Stat label="Events" value={d ? d.counts.events : "…"} /></div>
        <div role="listitem"><Stat label="Your role" value={roleLabel(d?.role ?? org.orgRole)} /></div>
      </div>
      <nav aria-label="Club" className="flex flex-wrap gap-2">
        <Link href="/app/org/people/" className="btn !min-h-11 px-4 text-sm">People</Link>
        {admin && <Link href="/app/org/invite/" className="btn-ghost !min-h-11 px-4 text-sm">Invite someone</Link>}
        {can(org, CAP.audit) && <Link href="/app/org/activity/" className="btn-ghost !min-h-11 px-4 text-sm">Activity</Link>}
      </nav>
      <Events org={org} />
    </div>
  );
}

export default function OrgHome() {
  return <ClubGate>{(org) => <Body org={org} />}</ClubGate>;
}
