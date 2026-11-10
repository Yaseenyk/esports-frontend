"use client";

import Link from "next/link";
import { events, explain, type CloudEvent } from "@/lib/api/cloud";
import { useQuery } from "@/lib/api/useQuery";
import { useSession } from "@/components/cloud/useSession";
import { Waiting } from "@/components/skeleton/Scenes";
import { Sk } from "@/components/skeleton/Sk";

const ACTIONS = [
  { href: "/app/id-cards/", title: "Make ID cards", body: "Add people, design a card for each team, print or download. Aadhaar cards are read in your browser." },
  { href: "/app/check-in/", title: "Run the gate", body: "Scan passes with a phone camera. Live mode shares one list across every door." },
  { href: "/app/brackets/", title: "Build a bracket", body: "Paste your teams, get a seeded bracket, click winners to advance them." },
];

export default function Dashboard() {
  const session = useSession();
  const q = useQuery<CloudEvent[]>(session ? "/events" : null, { ttl: 0 }) /* shows the saved list at once, always re-checks in the background */;
  const list = q.data ?? [];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Welcome{session ? `, ${session.user.name.split(" ")[0]}` : ""}</h1>
        <p className="mt-1 text-sm text-zinc-300">Everything for your event day, in one place. Pick up where you left off, or start something new.</p>
      </div>

      <section aria-label="Start something" className="grid gap-3 md:grid-cols-3">
        {ACTIONS.map((a) => (
          <Link key={a.href} href={a.href} className="card tilt block outline-none focus-visible:ring-2 focus-visible:ring-cyan">
            <h2 className="font-display text-lg font-bold text-white">{a.title}</h2>
            <p className="mt-1 text-sm text-zinc-300">{a.body}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-cyan">Open →</span>
          </Link>
        ))}
      </section>

      <section aria-label="Your events" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-white">Your events</h2>
          <Link href="/app/id-cards/" className="btn-ghost !min-h-9 px-3 text-sm">New event</Link>
        </div>
        <Waiting loading={q.loading} apiKey="/events" label="Loading your events" onRetry={q.refetch}>
          <div className="space-y-2">{Array.from({ length: 3 }, (_, i) => <Sk key={i} i={i} className="!h-16 !rounded-xl" />)}</div>
        </Waiting>
        {q.error && <p role="alert" className="text-sm text-red-300">{explain(q.error)}</p>}
        {!q.loading && !q.error && list.length === 0 && (
          <div className="card space-y-2"><p className="text-zinc-200">No events saved online yet.</p><p className="text-sm text-zinc-400">Make your cards in the ID card maker, then use <strong className="text-zinc-200">Save, open or share → Online</strong> to save the event here.</p></div>
        )}
        {list.length > 0 && (
          <ul className="space-y-2">
            {list.map((ev) => (
              <li key={ev.id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
                <span className="min-w-0"><span className="block truncate font-semibold text-white">{ev.name}</span><span className="text-xs text-zinc-400">{ev.game || "No game"} · {ev.date || "No date"}{ev.venue ? ` · ${ev.venue}` : ""}</span></span>
                <span className="flex gap-2"><Link href={`/app/id-cards/?open=${encodeURIComponent(ev.id)}`} className="btn-ghost !min-h-9 px-3 text-sm">Open cards</Link><Link href="/app/check-in/" className="btn-ghost !min-h-9 px-3 text-sm">Gate</Link></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
