import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GameBadge from "@/components/GameBadge";
import { COMMUNITIES, EVENTS, gameBySlug } from "@/lib/data";

export const dynamicParams = false;
export function generateStaticParams() { return COMMUNITIES.map((c) => ({ slug: c.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  return { title: COMMUNITIES.find((c) => c.slug === params.slug)?.name ?? "Community" };
}

export default function CommunityPage({ params }: { params: { slug: string } }) {
  const c = COMMUNITIES.find((x) => x.slug === params.slug);
  if (!c) notFound();
  const events = EVENTS.filter((e) => e.organiser === c.name);
  return (
    <div className="space-y-10">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/communities/" className="hover:text-zinc-300">Communities</Link> / {c.name}</nav>
      <header><span className="tag">{c.kind}</span><h1 className="mt-3 text-3xl font-black text-zinc-50 sm:text-4xl">{c.name}</h1><p className="mt-2 max-w-2xl text-zinc-300">{c.blurb}</p></header>
      <section aria-labelledby="g"><h2 id="g" className="mb-4 text-2xl font-bold text-zinc-50">Games they play</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {c.games.map((s) => { const g = gameBySlug(s)!; return (<Link key={s} href={`/games/${s}/`} className="card flex items-center gap-3 !p-3"><GameBadge game={g} /><span className="font-semibold text-zinc-50">{g.short}</span></Link>); })}
        </div>
      </section>
      <section aria-labelledby="e"><h2 id="e" className="mb-4 text-2xl font-bold text-zinc-50">Events they run</h2>
        {events.length === 0 ? <p className="card text-zinc-400">No sample events listed.</p> : (
          <div className="grid gap-4 md:grid-cols-2">{events.map((e) => (<Link key={e.slug} href={`/events/${e.slug}/`} className="card block !p-4"><h3 className="font-semibold text-zinc-50">{e.name}</h3><p className="text-sm text-zinc-400">{e.format}</p></Link>))}</div>
        )}
      </section>
    </div>
  );
}
