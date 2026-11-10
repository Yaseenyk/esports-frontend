import type { Metadata } from "next";
import GameBadge from "@/components/GameBadge";
import TiltLink from "@/components/TiltLink";
import { COMMUNITIES, gameBySlug } from "@/lib/data";

export const metadata: Metadata = { title: "Communities" };

export default function Communities() {
  return (
    <div>
      <h1 className="text-3xl font-black text-zinc-50 sm:text-4xl">Communities</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">Organisations, college clubs, streaming groups, cafes and organisers, each with every game they play on one profile.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {COMMUNITIES.map((c) => (
          <TiltLink key={c.slug} href={`/communities/${c.slug}/`}>
            <span className="tag">{c.kind}</span>
            <h2 className="mt-3 text-lg font-bold text-white">{c.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">{c.blurb}</p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3"><div className="flex items-center gap-2"><div className="flex gap-1.5">{c.games.map((s) => <GameBadge key={s} game={gameBySlug(s)!} size="sm" />)}</div><span className="text-xs text-zinc-400">{c.games.length} {c.games.length === 1 ? "game" : "games"}</span></div><span className="text-xs text-zinc-300">{c.city}</span></div>
          </TiltLink>
        ))}
      </div>
    </div>
  );
}
