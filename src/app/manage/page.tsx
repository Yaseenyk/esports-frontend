import type { Metadata } from "next";
import Link from "next/link";
import { COMMUNITIES, EVENTS, GAMES, gameBySlug } from "@/lib/data";

export const metadata: Metadata = { title: "Manage (mock-up)" };

const ME = COMMUNITIES[0];
const STEPS = ["Rules published", "Registration open", "Teams confirmed", "ID cards printed", "Schedule shared", "Results and certificates"];

export default function Manage() {
  const mine = EVENTS.filter((e) => e.organiser === COMMUNITIES[1].name || e.organiser === ME.name);
  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">Mock-up of the organiser dashboard</p>
        <h1 className="mt-2 text-3xl font-black text-zinc-50 sm:text-4xl">{ME.name}</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">This is how a manager will see every game, team and event in one place. The numbers are placeholders, and nothing here saves yet.</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Summary">
        {[["Games", String(ME.games.length)], ["Teams", "—"], ["Events", String(mine.length)], ["People", "—"]].map(([k, v]) => (
          <div key={k} className="card"><p className="text-sm text-zinc-500">{k}</p><p className="mt-1 text-3xl font-black text-zinc-50">{v}</p></div>
        ))}
      </section>
      <section aria-labelledby="games" className="card">
        <h2 id="games" className="mb-3 font-bold text-zinc-50">Rosters by game</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="text-zinc-500"><tr><th className="py-2 pe-4 font-medium">Game</th><th className="py-2 pe-4 font-medium">Team size</th><th className="py-2 pe-4 font-medium">Roster</th><th className="py-2 font-medium">Next event</th></tr></thead>
          <tbody className="divide-y divide-zinc-800">
            {ME.games.map((s) => { const g = gameBySlug(s)!; const ev = EVENTS.find((e) => e.game === s); return (
              <tr key={s}><td className="py-3 pe-4 font-semibold text-zinc-100">{g.name}</td><td className="py-3 pe-4 text-zinc-400">{g.team}</td><td className="py-3 pe-4 text-zinc-500">Not set up</td><td className="py-3 text-zinc-400">{ev ? ev.name : "None"}</td></tr>
            ); })}
          </tbody>
        </table></div>
      </section>
      <section aria-labelledby="check" className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 id="check" className="mb-3 font-bold text-zinc-50">Event checklist</h2>
          <ol className="space-y-2">
            {STEPS.map((s, i) => (<li key={s} className="flex items-center gap-3 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300"><span className="grid h-6 w-6 place-items-center rounded-full bg-zinc-800 text-xs text-zinc-400">{i + 1}</span>{s}</li>))}
          </ol>
        </div>
        <div className="card">
          <h2 className="mb-3 font-bold text-zinc-50">Quick actions</h2>
          <div className="grid gap-3">
            <Link href="/tools/id-cards/" className="btn">Print ID cards</Link>
            <button type="button" disabled className="btn-ghost opacity-50">Create event (coming with the app)</button>
            <button type="button" disabled className="btn-ghost opacity-50">Invite a co-manager (coming with the app)</button>
          </div>
          <p className="mt-4 text-xs text-zinc-500">{GAMES.length} games supported in this prototype.</p>
        </div>
      </section>
    </div>
  );
}
