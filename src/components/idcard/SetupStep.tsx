"use client";

import GameBadge from "@/components/GameBadge";
import Select from "@/components/Select";
import { GAMES } from "@/lib/data";
import { FORMATS, type EventInfo, type Fmt, type Person, type Team } from "@/lib/idcard/types";
import { MoreOptions, TeamLogoButton } from "./SetupExtras";

const SHORT: Record<Fmt, string> = { wallet: "Wallet card", portrait: "Lanyard", badge: "Event badge", strip: "Wristband", poster: "Poster", story: "Story", pass: "Phone pass" };
const uidT = () => `t${Date.now().toString(36)}${Math.floor(Math.random() * 1e3).toString(36)}`;

/** Step 1: just what is needed to start (the event, the card shape and the teams). The rest is folded under "More options". */
export default function SetupStep({ event, setEvent, game, setGame, organiser, setOrganiser, fmt, onFmt, teams, setTeams, setPeople, info, setInfo }: {
  event: string; setEvent: (v: string) => void; game: string; setGame: (v: string) => void; organiser: string; setOrganiser: (v: string) => void;
  fmt: Fmt; onFmt: (f: Fmt) => void; teams: Team[]; setTeams: (f: (t: Team[]) => Team[]) => void; setPeople: (f: (p: Person[]) => Person[]) => void;
  info: EventInfo; setInfo: (i: EventInfo) => void;
}) {
  const F = FORMATS[fmt];
  return (
    <div className="no-print space-y-4">
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="card space-y-4" aria-labelledby="ev-h">
          <h2 id="ev-h" className="font-display text-lg font-bold text-white">Your event</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm text-zinc-300 sm:col-span-2">Event name<input className="field mt-1" value={event} onChange={(e) => setEvent(e.target.value)} /></label>
            <Select label="Game" value={game} onChange={setGame} options={[...GAMES.map((g) => ({ value: g.short, label: g.name, icon: <GameBadge game={g} size="sm" /> })), { value: "Multi-game", label: "Several games" }]} />
            <label className="block text-sm text-zinc-300">Organiser<input className="field mt-1" value={organiser} onChange={(e) => setOrganiser(e.target.value)} /></label>
          </div>
          <div>
            <p className="mb-2 text-sm text-zinc-300">Card shape</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Card shape">
              {(Object.keys(FORMATS) as Fmt[]).map((k) => {
                const f = FORMATS[k], r = f.w / f.h, on = fmt === k;
                const w = r >= 1 ? 46 : Math.round(40 * r), h = r >= 1 ? Math.round(46 / r) : 40;
                return (
                  <button key={k} type="button" role="radio" aria-checked={on} title={`${f.label}: ${f.note}`} onClick={() => onFmt(k)} className={`flex w-[5.3rem] flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${on ? "border-cyan bg-cyan/10" : "border-white/10 hover:border-white/30"}`}>
                    <span className="grid h-10 place-items-center"><span aria-hidden="true" className={`relative block rounded-[5px] border ${on ? "border-cyan bg-cyan/20" : "border-white/40 bg-white/5"}`} style={{ width: w, height: Math.max(h, 8) }}>{f.slot && <span className="absolute left-1/2 top-[3px] h-[3px] w-[10px] -translate-x-1/2 rounded-full bg-white/60" />}</span></span>
                    <span className="text-[11px] font-semibold leading-tight text-zinc-100">{SHORT[k]}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-zinc-400"><strong className="text-zinc-200">{F.label}</strong> · {F.w} × {F.h} mm · {F.note} You can change the shape for a single team later.</p>
          </div>
        </section>

        <section className="card flex flex-col gap-3" aria-labelledby="tm-h">
          <div className="flex items-baseline justify-between gap-2"><h2 id="tm-h" className="font-display text-lg font-bold text-white">Teams <span className="text-sm font-normal text-zinc-400">· {teams.length}</span></h2></div>
          <p className="text-sm text-zinc-400">Every team gets its own card design. The logo is optional.</p>
          <ul className="space-y-2">
            {teams.map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <TeamLogoButton compact team={t} onLogo={(logo) => setTeams((l) => l.map((x) => (x.id === t.id ? { ...x, logo } : x)))} />
                <input className="field" aria-label="Team name" value={t.name} onChange={(e) => setTeams((l) => l.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)))} />
                <button type="button" disabled={teams.length < 2} title={teams.length < 2 ? "You need at least one team" : `Remove ${t.name}. Its people move to another team.`} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/10 text-lg text-zinc-400 transition-colors hover:border-red-400/60 hover:text-red-300 disabled:opacity-30" aria-label={`Remove ${t.name}`} onClick={() => { const other = teams.find((x) => x.id !== t.id)!.id; setTeams((l) => l.filter((x) => x.id !== t.id)); setPeople((l) => l.map((p) => (p.teamId === t.id ? { ...p, teamId: other } : p))); }}>×</button>
              </li>
            ))}
          </ul>
          <button type="button" className="min-h-11 w-full rounded-lg border border-dashed border-white/25 text-sm font-semibold text-zinc-300 transition-colors hover:border-cyan hover:text-cyan" onClick={() => setTeams((t) => [...t, { id: uidT(), name: `Team ${t.length + 1}` }])}>+ Add a team</button>
        </section>
      </div>
      <MoreOptions info={info} setInfo={setInfo} />
    </div>
  );
}
