"use client";

import Link from "next/link";
import Checklist from "@/components/app/Checklist";
import { events, explain, type CloudEvent } from "@/lib/api/cloud";
import { useQuery } from "@/lib/api/useQuery";
import { useSession } from "@/components/cloud/useSession";
import { Waiting } from "@/components/skeleton/Scenes";
import { Sk } from "@/components/skeleton/Sk";

const TOOLS = [
  { href: "/app/check-in/", title: "Run the gate", body: "Scan passes on event day with a phone camera." },
  { href: "/app/brackets/", title: "Build a bracket", body: "Paste your teams and get a bracket to fill in." },
];

export default function Dashboard() {
  const session = useSession();
  const q = useQuery<CloudEvent[]>(session ? "/events" : null, { ttl: 0 }) /* shows the saved list at once, always re-checks in the background */;
  const list = q.data ?? [];
  const first = list[0];
  const hasEvent = list.length > 0;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Welcome{session ? `, ${session.user.name.split(" ")[0]}` : ""}</h1>
        <p className="mt-1 text-sm text-zinc-300">Running an event takes five steps. Follow them in order; the button next to the first unfinished step is always your next move.</p>
      </div>

      <Checklist
        intro={hasEvent ? "Open your latest event to continue. Each step ticks itself off there as you finish it." : "You have no event yet. Start with step 1: it takes about two minutes."}
        steps={[
          { n: 1, title: "Create your event", hint: "Name it and list your teams.", done: hasEvent, href: "/app/id-cards/", cta: "Create an event" },
          { n: 2, title: "Add people", hint: "Type them in, import a sheet, or send players an invite link.", done: false, href: first ? `/app/events/?id=${encodeURIComponent(first.id)}` : undefined, cta: "Open your event" },
          { n: 3, title: "Design the ID cards", hint: "Pick a look for each team.", done: false, href: first ? `/app/id-cards/?open=${encodeURIComponent(first.id)}` : undefined, cta: "Open cards" },
          { n: 4, title: "Print or share passes", hint: "Download a PDF to print, or send each person a link.", done: false },
          { n: 5, title: "Check people in at the gate", hint: "Scan each pass when guests arrive.", done: false, href: "/app/check-in/", cta: "Open the gate" },
        ]}
      />

      <section aria-label="Other tools" className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map((a) => (
          <Link key={a.href} href={a.href} className="card block !p-4 outline-none focus-visible:ring-2 focus-visible:ring-cyan">
            <h2 className="font-display text-base font-bold text-white">{a.title}</h2>
            <p className="mt-1 text-sm text-zinc-300">{a.body}</p>
          </Link>
        ))}
      </section>

      <section aria-label="Your events" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-white">Your events</h2>
          <Link href="/app/id-cards/" className="btn-ghost !min-h-11 px-3 text-sm">New event</Link>
        </div>
        <Waiting loading={q.loading} apiKey="/events" label="Loading your events" onRetry={q.refetch}>
          <div className="space-y-2">{Array.from({ length: 3 }, (_, i) => <Sk key={i} i={i} className="!h-16 !rounded-xl" />)}</div>
        </Waiting>
        {q.error && <p role="alert" className="text-sm text-red-300">{explain(q.error)}</p>}
        {!q.loading && !q.error && list.length === 0 && (
          <div className="card space-y-3"><p className="text-zinc-200">No events saved online yet.</p><p className="text-sm text-zinc-400">Make your cards in the ID card maker, then press <strong className="text-zinc-200">Save, open or share</strong>, then <strong className="text-zinc-200">Online</strong>, to save the event here.</p><Link href="/app/id-cards/" className="btn !min-h-11 px-4 text-sm">Create your first event</Link></div>
        )}
        {list.length > 0 && (
          <ul className="space-y-2">
            {list.map((ev) => (
              <li key={ev.id} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
                <span className="min-w-0"><span className="block truncate font-semibold text-white">{ev.name}</span><span className="text-xs text-zinc-400">{ev.game || "No game"} · {ev.date || "No date"}{ev.venue ? ` · ${ev.venue}` : ""}</span></span>
                <span className="flex gap-2"><Link href={`/app/id-cards/?open=${encodeURIComponent(ev.id)}`} className="btn-ghost !min-h-11 px-3 text-sm">Open cards</Link><Link href={`/app/events/?id=${encodeURIComponent(ev.id)}`} className="btn-ghost !min-h-11 px-3 text-sm">Details</Link></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
