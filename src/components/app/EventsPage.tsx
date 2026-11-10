"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { events, explain, type CloudEvent, type CloudRoster, type Live } from "@/lib/api/cloud";
import { useQuery } from "@/lib/api/useQuery";
import { Waiting } from "@/components/skeleton/Scenes";
import { Sk } from "@/components/skeleton/Sk";

/** Saved events: a list, and for one event its numbers (people, teams, minors, checked in) with shortcuts to the tools. */
export default function EventsPage() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => setId(new URLSearchParams(location.search).get("id")), []);
  const list = useQuery<CloudEvent[]>("/events", { ttl: 0 });
  const chosen = id ? list.data?.find((e) => e.id === id) : undefined;

  const select = (next: string | null) => { setId(next); history.replaceState(null, "", next ? `/app/events/?id=${encodeURIComponent(next)}` : "/app/events/"); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Events</h1><p className="mt-1 text-sm text-zinc-300">Events you saved online from the ID card maker.</p></div>
        <Link href="/app/id-cards/" className="btn !min-h-10 px-4 text-sm">New event</Link>
      </div>

      <Waiting loading={list.loading} apiKey="/events" label="Loading your events" onRetry={list.refetch}><div className="space-y-2">{Array.from({ length: 3 }, (_, i) => <Sk key={i} i={i} className="!h-16 !rounded-xl" />)}</div></Waiting>
      {list.error && <p role="alert" className="text-sm text-red-300">{explain(list.error)}</p>}
      {!list.loading && !list.error && (list.data ?? []).length === 0 && <div className="card space-y-2"><p className="text-zinc-200">No events saved online yet.</p><p className="text-sm text-zinc-400">Make your cards in the ID card maker, then use <strong className="text-zinc-200">Save, open or share, then Online</strong> to save the event.</p></div>}

      {chosen ? <Detail ev={chosen} onBack={() => select(null)} /> : (
        (list.data ?? []).length > 0 && (
          <ul className="grid gap-3 md:grid-cols-2">
            {(list.data ?? []).map((ev) => (
              <li key={ev.id}><button type="button" onClick={() => select(ev.id)} className="card block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan"><span className="block truncate font-display text-lg font-bold text-white">{ev.name}</span><span className="mt-1 block text-sm text-zinc-300">{[ev.game, ev.date, ev.venue].filter(Boolean).join(" · ") || "No details yet"}</span><span className="mt-2 inline-block text-sm font-semibold text-cyan">Open →</span></button></li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

function Detail({ ev, onBack }: { ev: CloudEvent; onBack: () => void }) {
  const roster = useQuery<CloudRoster>(`/events/${ev.id}/roster`, { ttl: 20_000 });
  const live = useQuery<Live>(`/events/${ev.id}/checkins`, { pollMs: 30_000, maxPollMs: 120_000 });
  const people = roster.data?.people ?? [], teams = roster.data?.teams ?? [];
  const minors = people.filter((p) => p.minor).length, noConsent = people.filter((p) => p.minor && !p.guardian).length, noPhoto = people.filter((p) => !p.photoUrl).length;
  const stat = (label: string, value: string | number, note?: string) => (
    <div className="card !p-4"><p className="text-xs uppercase tracking-wider text-zinc-400">{label}</p><p className="mt-1 font-display text-3xl font-bold text-white">{value}</p>{note && <p className="mt-1 text-xs text-zinc-400">{note}</p>}</div>
  );
  return (
    <section aria-label={ev.name} className="space-y-5">
      <div><button type="button" onClick={onBack} className="text-sm text-cyan hover:underline">← All events</button><h2 className="mt-2 font-display text-2xl font-bold text-white">{ev.name}</h2><p className="text-sm text-zinc-300">{[ev.game, ev.organiser, ev.date, ev.venue].filter(Boolean).join(" · ")}</p></div>
      <Waiting loading={roster.loading} apiKey="/events/roster" label="Loading the roster"><div className="grid gap-3 sm:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Sk key={i} i={i} className="!h-24 !rounded-xl" />)}</div></Waiting>
      {roster.error && <p role="alert" className="text-sm text-red-300">{explain(roster.error)}</p>}
      {roster.data && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Event numbers">
          {stat("People", people.length)}
          {stat("Teams", teams.length)}
          {stat("Checked in", live.data ? `${live.data.checkedIn} of ${live.data.total}` : "…", "Updates every 30 seconds while this page is open")}
          {stat("Minors", minors, noConsent ? `${noConsent} without a guardian's consent` : minors ? "All have consent" : undefined)}
        </div>
      )}
      {roster.data && (noConsent > 0 || noPhoto > 0) && (
        <ul className="space-y-1.5 rounded-xl border border-amber-500/30 bg-[#0a0b0d] p-3 text-sm text-amber-100" aria-label="Things to check">
          {noConsent > 0 && <li><strong>{noConsent}</strong> {noConsent === 1 ? "person is" : "people are"} under 18 without a guardian&apos;s consent recorded. Do not print their card until it is.</li>}
          {noPhoto > 0 && <li><strong>{noPhoto}</strong> {noPhoto === 1 ? "person has" : "people have"} no photo.</li>}
        </ul>
      )}
      {roster.data && teams.length > 0 && (
        <div className="card !p-4"><h3 className="font-display font-bold text-white">Teams</h3><ul className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">{teams.map((t) => <li key={t.id} className="flex justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"><span className="truncate text-zinc-200">{t.name}</span><span className="text-zinc-400">{people.filter((p) => p.teamId === t.id).length} people</span></li>)}</ul></div>
      )}
      <div className="flex flex-wrap gap-2"><Link href={`/app/id-cards/?open=${encodeURIComponent(ev.id)}`} className="btn !min-h-10 px-4 text-sm">Open the cards</Link><Link href="/app/check-in/" className="btn-ghost !min-h-10 px-4 text-sm">Gate check-in</Link><Link href="/tools/points-table/" className="btn-ghost !min-h-10 px-4 text-sm">Points table</Link><Link href="/tools/certificates/" className="btn-ghost !min-h-10 px-4 text-sm">Certificates</Link></div>
    </section>
  );
}
