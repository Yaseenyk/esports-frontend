import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GameBadge from "@/components/GameBadge";
import TiltLink from "@/components/TiltLink";
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
  const related = GAMES.filter((x) => x.slug !== g.slug && (x.genre === g.genre || x.platform === g.platform)).slice(0, 5);
  return (
    <div className="space-y-12">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500"><Link href="/games/" className="hover:text-zinc-300">Games</Link> / {g.short}</nav>
      <header className="relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-10">
        <div aria-hidden="true" className={`absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br ${g.hue} opacity-30 blur-3xl`} />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <GameBadge game={g} size="xl" />
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-5xl">{g.name}</h1>
            <p className="mt-3 max-w-2xl text-zinc-300">{g.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-2"><span className="tag">{g.platform}</span><span className="tag">{g.genre}</span><span className="tag">{g.team}</span></div>
          </div>
        </div>
      </header>
      <section aria-labelledby="ev">
        <h2 id="ev" className="mb-4 text-2xl font-bold text-white">Events</h2>
        {events.length === 0 ? <p className="card text-zinc-400">No sample events for this game yet. Organisers will list them here.</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((e) => (
              <TiltLink key={e.slug} href={`/events/${e.slug}/`}>
                <div className="flex gap-2"><span className="tag">{e.mode}</span><span className="tag">{e.level}</span></div>
                <h3 className="mt-3 font-bold text-white">{e.name}</h3><p className="mt-1 text-sm text-zinc-400">{e.format}</p>
              </TiltLink>
            ))}
          </div>
        )}
      </section>
      <section aria-labelledby="co">
        <h2 id="co" className="mb-4 text-2xl font-bold text-white">Communities that play it</h2>
        {comms.length === 0 ? <p className="card text-zinc-400">No sample communities for this game yet.</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {comms.map((c) => (
              <TiltLink key={c.slug} href={`/communities/${c.slug}/`} className="!p-4"><h3 className="font-semibold text-white">{c.name}</h3><p className="text-sm text-zinc-400">{c.kind} · {c.city}</p></TiltLink>
            ))}
          </div>
        )}
      </section>
      {related.length > 0 && (
        <section aria-labelledby="rel">
          <h2 id="rel" className="mb-4 text-2xl font-bold text-white">Similar games</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((x) => (<TiltLink key={x.slug} href={`/games/${x.slug}/`} className="!p-3"><span className="flex items-center gap-3"><GameBadge game={x} /><span className="min-w-0 truncate font-display font-semibold text-white">{x.short}</span></span></TiltLink>))}
          </div>
        </section>
      )}
    </div>
  );
}
