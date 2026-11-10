"use client";

import Link from "next/link";
import { useState } from "react";
import { EVENTS, GAMES, gameBySlug } from "@/lib/data";

export default function EventsBrowser() {
  const [game, setGame] = useState("all");
  const [mode, setMode] = useState("all");
  const [level, setLevel] = useState("all");
  const list = EVENTS.filter((e) => (game === "all" || e.game === game) && (mode === "all" || e.mode === mode) && (level === "all" || e.level === level));
  return (
    <>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <label className="block text-sm text-zinc-400">Game
          <select className="field mt-1" value={game} onChange={(e) => setGame(e.target.value)}><option value="all">All games</option>{GAMES.map((g) => (<option key={g.slug} value={g.slug}>{g.name}</option>))}</select>
        </label>
        <label className="block text-sm text-zinc-400">Mode
          <select className="field mt-1" value={mode} onChange={(e) => setMode(e.target.value)}>{["all", "Online", "Offline", "Hybrid"].map((m) => (<option key={m} value={m}>{m === "all" ? "Any mode" : m}</option>))}</select>
        </label>
        <label className="block text-sm text-zinc-400">Level
          <select className="field mt-1" value={level} onChange={(e) => setLevel(e.target.value)}>{["all", "Open", "College", "Community", "Pro qualifier"].map((m) => (<option key={m} value={m}>{m === "all" ? "Any level" : m}</option>))}</select>
        </label>
      </div>
      <p className="mt-4 text-sm text-zinc-500" aria-live="polite">{list.length} {list.length === 1 ? "event" : "events"}</p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {list.map((e) => (
          <Link key={e.slug} href={`/events/${e.slug}/`} className="card block">
            <div className="flex flex-wrap gap-2"><span className="tag">{gameBySlug(e.game)?.short}</span><span className="tag">{e.mode}</span><span className="tag">{e.level}</span></div>
            <h2 className="mt-3 font-bold text-zinc-50">{e.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">{e.format}</p>
            <p className="mt-3 text-xs text-zinc-500">{e.organiser} · {e.slots}</p>
          </Link>
        ))}
        {list.length === 0 && <p className="card text-zinc-400 md:col-span-2">No events match. Clear a filter.</p>}
      </div>
    </>
  );
}
