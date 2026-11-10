import type { Metadata } from "next";
import Link from "next/link";
import { COMMUNITIES, gameBySlug } from "@/lib/data";

export const metadata: Metadata = { title: "Communities" };

export default function Communities() {
  return (
    <div>
      <h1 className="text-3xl font-black text-zinc-50 sm:text-4xl">Communities</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">Organisations, college clubs, streaming groups, cafes and organisers, each with every game they play on one profile.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {COMMUNITIES.map((c) => (
          <Link key={c.slug} href={`/communities/${c.slug}/`} className="card block">
            <span className="tag">{c.kind}</span>
            <h2 className="mt-3 font-bold text-zinc-50">{c.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">{c.blurb}</p>
            <p className="mt-3 text-xs text-zinc-500">{c.games.map((s) => gameBySlug(s)?.short).join(" · ")} · {c.city}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
