"use client";

import Link from "next/link";
import { useState } from "react";
import GameBadge from "@/components/GameBadge";
import { EVENTS, GAMES } from "@/lib/data";

const PLATFORMS = ["All", "Mobile", "PC", "Console"] as const;

export default function GamesBrowser() {
  const [p, setP] = useState<(typeof PLATFORMS)[number]>("All");
  const list = GAMES.filter((g) => p === "All" || g.platform === p);
  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Platform">
        {PLATFORMS.map((x) => (<button key={x} type="button" className="chip" aria-pressed={p === x} onClick={() => setP(x)}>{x}</button>))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
