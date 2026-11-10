"use client";

import Link from "next/link";
import { useState } from "react";
import GameBadge from "@/components/GameBadge";
import { EVENTS, GAMES } from "@/lib/data";

const PLATFORMS = ["All", "Mobile", "PC", "Console", "Cross-platform"] as const;
const GENRES = ["All", ...Array.from(new Set(GAMES.map((g) => g.genre))).sort()];

export default function GamesBrowser() {
  const [p, setP] = useState<(typeof PLATFORMS)[number]>("All");
  const [genre, setGenre] = useState("All");
  const [q, setQ] = useState("");
  const list = GAMES.filter((g) => (p === "All" || g.platform === p) && (genre === "All" || g.genre === genre) && (!q.trim() || `${g.name} ${g.short}`.toLowerCase().includes(q.trim().toLowerCase())));
  return (
    <>
      <label className="sr-only" htmlFor="game-filter">Filter games by name</label>
      <input id="game-filter" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter games by name…" className="field mt-6 max-w-md" />
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Platform">
        {PLATFORMS.map((x) => (<button key={x} type="button" className="chip" aria-pressed={p === x} onClick={() => setP(x)}>{x}</button>))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Genre">
        {GENRES.map((x) => (<button key={x} type="button" className="chip" aria-pressed={genre === x} onClick={() => setGenre(x)}>{x === "All" ? "All genres" : x}</button>))}
      </div>
      <p className="mt-4 text-sm text-zinc-500" aria-live="polite">{list.length} {list.length === 1 ? "game" : "games"}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.length === 0 && <p className="card text-zinc-400 sm:col-span-2 lg:col-span-3">No games match. Clear a filter.</p>}
        {list.map((g) => {
          const n = EVENTS.filter((e) => e.game === g.slug).length;
          return (
            <Link key={g.slug} href={`/games/${g.slug}/`} className="card block">
              <div className="flex items-center gap-3"><GameBadge game={g} /><div className="min-w-0"><h2 className="truncate font-bold text-zinc-50">{g.name}</h2><p className="text-xs text-zinc-500">{g.platform} · {g.genre}</p></div></div>
              <p className="mt-3 text-sm text-zinc-400">{g.blurb}</p>
              <p className="mt-3 text-xs text-zinc-500">{g.team} · {n} sample {n === 1 ? "event" : "events"}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
