import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GameBadge from "@/components/GameBadge";
import { COMMUNITIES, EVENTS, gameBySlug } from "@/lib/data";

export const dynamicParams = false;
export function generateStaticParams() { return EVENTS.map((e) => ({ slug: e.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  return { title: EVENTS.find((e) => e.slug === params.slug)?.name ?? "Event" };
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const e = EVENTS.find((x) => x.slug === params.slug);
  if (!e) notFound();
  const g = gameBySlug(e.game)!;
  const org = COMMUNITIES.find((c) => c.name === e.organiser);
  const rows: [string, string][] = [["Game", g.name], ["Format", e.format], ["Mode", e.mode], ["Level", e.level], ["Slots", e.slots], ["Date", "To be announced (sample)"]];
  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500"><Link href="/events/" className="hover:text-zinc-300">Events</Link> / {e.name}</nav>
      <header className="flex items-center gap-4"><GameBadge game={g} size="lg" /><div><h1 className="text-3xl font-black text-zinc-50 sm:text-4xl">{e.name}</h1><p className="mt-1 text-zinc-400">by {org ? <Link href={`/communities/${org.slug}/`} className="text-cyan hover:underline">{e.organiser}</Link> : e.organiser}</p></div></header>
      <p className="max-w-2xl text-zinc-300">{e.blurb}</p>
      <div className="grid gap-6 md:grid-cols-3">
        <dl className="card md:col-span-2 divide-y divide-zinc-800 !p-0">
          {rows.map(([k, v]) => (<div key={k} className="flex justify-between gap-4 px-5 py-3 text-sm"><dt className="text-zinc-500">{k}</dt><dd className="text-end text-zinc-100">{v}</dd></div>))}
        </dl>
        <aside className="card space-y-3">
          <h2 className="font-bold text-zinc-50">Take part</h2>
          <button type="button" disabled className="btn w-full opacity-50">Register (coming with the app)</button>
          <Link href="/tools/id-cards/" className="btn-ghost w-full">Make player ID cards</Link>
        </aside>
      </div>
    </div>
  );
}
