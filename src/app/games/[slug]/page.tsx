import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GameBadge from "@/components/GameBadge";
import { COMMUNITIES, EVENTS, GAMES, gameBySlug } from "@/lib/data";

export const dynamicParams = false;
export function generateStaticParams() { return GAMES.map((g) => ({ slug: g.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = gameBySlug(params.slug);
  return { title: g?.name ?? "Game" };
}

export default function GamePage({ params }: { params: { slug: string } }) {
  const g = gameBySlug(params.slug);
  if (!g) notFound();
  const events = EVENTS.filter((e) => e.game === g.slug);
  const comms = COMMUNITIES.filter((c) => c.games.includes(g.slug));
  return (
    <div className="space-y-10">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500"><Link href="/games/" className="hover:text-zinc-300">Games</Link> / {g.short}</nav>
      <header className="flex items-center gap-4"><GameBadge game={g} size="lg" /><div><h1 className="text-3xl font-black text-zinc-50 sm:text-4xl">{g.name}</h1><p className="mt-1 text-zinc-400">{g.platform} · {g.genre} · {g.team}</p></div></header>
      <p className="max-w-2xl text-zinc-300">{g.blurb}</p>
      <section aria-labelledby="ev">
        <h2 id="ev" className="mb-4 text-2xl font-bold text-zinc-50">Events</h2>
        {events.length === 0 ? <p className="card text-zinc-400">No sample events for this game yet.</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((e) => (
              <Link key={e.slug} href={`/events/${e.slug}/`} className="card block">
                <div className="flex gap-2"><span className="tag">{e.mode}</span><span className="tag">{e.level}</span></div>
                <h3 className="mt-3 font-bold text-zinc-50">{e.name}</h3><p className="mt-1 text-sm text-zinc-400">{e.format}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section aria-labelledby="co">
        <h2 id="co" className="mb-4 text-2xl font-bold text-zinc-50">Communities that play it</h2>
        {comms.length === 0 ? <p className="card text-zinc-400">No sample communities for this game yet.</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {comms.map((c) => (
              <Link key={c.slug} href={`/communities/${c.slug}/`} className="card block !p-4"><h3 className="font-semibold text-zinc-50">{c.name}</h3><p className="text-sm text-zinc-400">{c.kind} · {c.city}</p></Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
