"use client";

import GameBadge from "@/components/GameBadge";
import TiltLink from "@/components/TiltLink";
import { useState } from "react";
import Select from "@/components/Select";
import { EVENTS, GAMES, gameBySlug } from "@/lib/data";

export default function EventsBrowser() {
  const [game, setGame] = useState("all");
  const [mode, setMode] = useState("all");
  const [level, setLevel] = useState("all");
  const list = EVENTS.filter((e) => (game === "all" || e.game === game) && (mode === "all" || e.mode === mode) && (level === "all" || e.level === level));
  return (
    <>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Select label="Game" value={game} onChange={setGame} options={[{ value: "all", label: "All games" }, ...GAMES.map((g) => ({ value: g.slug, label: g.name, icon: <GameBadge game={g} size="sm" /> }))]} />
        <Select label="Mode" value={mode} onChange={setMode} options={["all", "Online", "Offline", "Hybrid"].map((m) => ({ value: m, label: m === "all" ? "Any mode" : m }))} />
        <Select label="Level" value={level} onChange={setLevel} options={["all", "Open", "College", "Community", "Pro qualifier"].map((m) => ({ value: m, label: m === "all" ? "Any level" : m }))} />
      </div>
      <p className="mt-4 text-sm text-zinc-400" aria-live="polite">{list.length} {list.length === 1 ? "event" : "events"}</p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {list.map((e) => (
          <TiltLink key={e.slug} href={`/events/${e.slug}/`}>
            <div className="flex items-center gap-3"><GameBadge game={gameBySlug(e.game)!} /><div className="flex flex-wrap gap-2"><span className="tag">{e.mode}</span><span className="tag">{e.level}</span></div></div>
            <h2 className="mt-4 text-lg font-bold text-white">{e.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">{e.format}</p>
            <p className="mt-4 flex flex-wrap justify-between gap-x-3 text-xs text-zinc-400"><span>{e.organiser}</span><span className="text-zinc-300">{e.date}</span></p>
          </TiltLink>
        ))}
        {list.length === 0 && <p className="card text-zinc-400 md:col-span-2">No events match. Clear a filter.</p>}
      </div>
    </>
  );
}
