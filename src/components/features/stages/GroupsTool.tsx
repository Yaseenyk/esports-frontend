"use client";

import { useMemo, useState } from "react";
import ScreenButtons from "@/components/display/ScreenButtons";
import TeamsInput from "@/components/tools/TeamsInput";
import ToolStep from "@/components/tools/ToolStep";
import { uniqueTeams } from "@/lib/seeding";
import {
  MAX_TEAMS, MIN_TEAMS, TIE_BREAK_TEXT, buildKnockout, clampSettings, defaultSettings, groupFixtures, groupMatchCount, groupTablesView, knockoutView,
  playKnockout, qualifiers, splitGroups, standings, togglePick, type GroupResult, type Picks, type StageSettings,
} from "@/lib/stages";
import BracketTree from "./BracketTree";
import SettingsFields from "./SettingsFields";

const EXAMPLE = ["Konkan Kings", "Pune Phantoms", "Mumbai Mavericks", "Nashik Ninjas", "Goa Gamers", "Nagpur Knights", "Thane Titans", "Satara Strikers", "Kolhapur Kings", "Solapur Storm", "Aurangabad Aces", "Raigad Raiders"];
type Score = { a: number | null; b: number | null };
const num = (v: string): number | null => { if (v.trim() === "") return null; const n = Math.floor(Number(v)); return Number.isFinite(n) && n >= 0 && n <= 999 ? n : null; };
const key = (g: string, a: string, b: string) => `${g}\u0001${a}\u0001${b}`;

/** Five steps, all in the browser: add teams, choose groups, enter group scores, see the knockout, optionally put it on a TV. */
export default function GroupsTool() {
  const [text, setText] = useState(EXAMPLE.join("\n"));
  const [custom, setCustom] = useState<StageSettings | null>(null);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [pickState, setPickState] = useState<{ sig: string; map: Picks }>({ sig: "", map: {} });
  const [screen, setScreen] = useState<"bracket" | "groups">("bracket");

  const all = useMemo(() => uniqueTeams(text.split(/\r?\n/)), [text]);
  const teams = useMemo(() => all.slice(0, MAX_TEAMS), [all]);
  const ready = teams.length >= MIN_TEAMS;
  const settings = useMemo(() => (custom ? clampSettings(teams.length, custom) : defaultSettings(teams.length)), [custom, teams.length]);

  const plan = useMemo(() => {
    if (!ready) return [];
    return splitGroups(teams, settings.groups, settings.mode).map((g) => ({ group: g, rounds: groupFixtures(g) }));
  }, [teams, settings, ready]);

  const tables = useMemo(() => plan.map((p) => {
    const results: GroupResult[] = p.rounds.flat().map((f) => { const s = scores[key(p.group.name, f.a, f.b)]; return { a: f.a, b: f.b, scoreA: s?.a ?? null, scoreB: s?.b ?? null }; });
    return { name: p.group.name, rows: standings(p.group.teams, results) };
  }), [plan, scores]);
  const total = plan.reduce((n, p) => n + groupMatchCount(p.group.teams.length), 0);
  const scored = tables.reduce((n, t) => n + t.rows.reduce((m, r) => m + r.played, 0) / 2, 0);
  const groupsDone = ready && total > 0 && scored >= total;

  const quals = useMemo(() => (ready ? qualifiers(tables, settings.advance, settings.thirds) : []), [tables, settings, ready]);
  const ko = useMemo(() => buildKnockout(quals, "t"), [quals]);
  const sig = quals.map((q) => q.team).join("\u0001");
  const picks = pickState.sig === sig ? pickState.map : {};
  const played = useMemo(() => playKnockout(ko.matches, picks), [ko, picks]);
  const decided = played.matches.filter((m) => m.winner).length;
  const koTotal = ko.matches.length;

  const payload = useMemo(() => {
    if (!ready) return null;
    return screen === "groups" ? groupTablesView(tables) : ko.matches.length ? knockoutView(ko, picks) : null;
  }, [ready, screen, tables, ko, picks]);

  const setScore = (g: string, a: string, b: string, side: "a" | "b", v: string) => setScores((s) => ({ ...s, [key(g, a, b)]: { ...(s[key(g, a, b)] ?? { a: null, b: null }), [side]: num(v) } }));
  const shuffle = () => { const a = [...all]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; } setText(a.join("\n")); };
  const pick = (id: string, side: "a" | "b") => setPickState({ sig, map: togglePick(ko.matches, picks, id, side) });

  return (
    <div className="space-y-5">
      <ToolStep n={1} id="gk-teams" title="Add your teams" done={ready}
        hint="Type or paste your teams, one per line. Between 4 and 64 teams works. If you want the best teams spread across the groups, list the best team first and use pots in step 2."
        status={ready ? `${teams.length} teams` : undefined}>
        <TeamsInput value={text} onChange={setText} min={MIN_TEAMS} max={MAX_TEAMS} example={EXAMPLE} label="One team per line" />
        {ready && <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300"><span>Want the groups drawn at random?</span><button type="button" className="btn-ghost !min-h-10 px-4 text-sm" onClick={shuffle}>Shuffle the order</button></div>}
      </ToolStep>

      <ToolStep n={2} id="gk-settings" title="Choose the groups and how many go through" done={ready}
        hint="Good numbers are already filled in, so you can skip this step. Each group plays a mini league, then the best teams of every group meet in a knockout.">
        {!ready ? <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-zinc-300">Add at least {MIN_TEAMS} teams in step 1 and your groups appear here.</p> : <>
          <SettingsFields n={teams.length} value={settings} onChange={(s) => setCustom(s)} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="The groups">
            {plan.map((p) => (
              <li key={p.group.name} className="rounded-xl border border-white/[0.14] bg-[#0f1013] p-3">
                <p className="font-display text-sm font-bold text-white">Group {p.group.name}</p>
                <ol className="mt-1 list-inside list-decimal space-y-0.5 text-sm text-zinc-200">{p.group.teams.map((t) => <li key={t} className="truncate">{t}</li>)}</ol>
              </li>
            ))}
          </ul>
        </>}
      </ToolStep>

      <ToolStep n={3} id="gk-scores" title="Enter the group scores as matches finish" done={groupsDone}
        hint="Type each team's score next to its name when a match ends. Every group table updates by itself. A match counts once both boxes are filled in."
        status={ready ? (groupsDone ? "All group matches have a score" : `${scored} of ${total} group matches have a score`) : undefined}
        actions={ready && scored > 0 ? <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" onClick={() => setScores({})}>Clear all scores</button> : undefined}>
        {!ready ? <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-zinc-300">No matches yet. Add your teams in step 1.</p> : (
          <div className="grid gap-4 lg:grid-cols-2">
            {plan.map((p, gi) => {
              const rows = tables[gi]?.rows ?? [];
              return (
                <section key={p.group.name} aria-label={`Group ${p.group.name}`} className="min-w-0 space-y-3 rounded-xl border border-white/[0.14] bg-[#0f1013] p-3">
                  <h4 className="font-display text-base font-bold text-white">Group {p.group.name}</h4>
                  {p.rounds.map((rd, ri) => (
                    <fieldset key={ri} className="min-w-0">
                      <legend className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-300">Round {ri + 1}</legend>
                      <ul className="space-y-2">
                        {rd.map((f) => {
                          const s = scores[key(p.group.name, f.a, f.b)] ?? { a: null, b: null };
                          return (
                            <li key={f.a + f.b} className="flex items-center gap-2 text-sm">
                              <span className="min-w-0 flex-1 truncate text-right text-zinc-100">{f.a}</span>
                              <input aria-label={`Group ${p.group.name}, round ${ri + 1}, ${f.a} score`} className="field !min-h-11 !w-14 !px-1 text-center" inputMode="numeric" value={s.a ?? ""} onChange={(e) => setScore(p.group.name, f.a, f.b, "a", e.target.value)} />
                              <span aria-hidden="true" className="text-zinc-500">–</span>
                              <input aria-label={`Group ${p.group.name}, round ${ri + 1}, ${f.b} score`} className="field !min-h-11 !w-14 !px-1 text-center" inputMode="numeric" value={s.b ?? ""} onChange={(e) => setScore(p.group.name, f.a, f.b, "b", e.target.value)} />
                              <span className="min-w-0 flex-1 truncate text-zinc-100">{f.b}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </fieldset>
                  ))}
                  <div role="region" aria-label={`Group ${p.group.name} table`} tabIndex={0} className="overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-cyan" aria-live="polite">
                    <table className="w-full min-w-[22rem] border-collapse text-left text-sm">
                      <thead><tr className="bg-[#0a0b0d] text-zinc-200">{["#", "Team", "P", "W", "D", "L", "Diff", "Pts"].map((h) => <th key={h} scope="col" className="px-2 py-2">{h}</th>)}</tr></thead>
                      <tbody>{rows.map((r) => {
                        const through = r.rank <= settings.advance;
                        return (
                          <tr key={r.team} className="border-t border-white/[0.08]">
                            <th scope="row" className="px-2 py-2 font-bold text-cyan">{r.rank}</th>
                            <td className="px-2 py-2 font-medium text-white">{r.team}{through && <span className="ml-2 rounded-full border border-cyan/50 px-2 py-0.5 text-xs font-semibold text-cyan">Through</span>}</td>
                            <td className="px-2 py-2 text-zinc-300">{r.played}</td><td className="px-2 py-2 text-zinc-300">{r.won}</td><td className="px-2 py-2 text-zinc-300">{r.drawn}</td><td className="px-2 py-2 text-zinc-300">{r.lost}</td>
                            <td className="px-2 py-2 text-zinc-300">{r.diff > 0 ? `+${r.diff}` : r.diff}</td><td className="px-2 py-2 font-bold text-white">{r.points}</td>
                          </tr>
                        );
                      })}</tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        )}
        {ready && <p className="text-xs leading-5 text-zinc-400">P = played, W = won, D = drawn, L = lost, Diff = scores made minus scores conceded, Pts = points (3 for a win, 1 for a draw, 0 for a loss). {TIE_BREAK_TEXT}</p>}
      </ToolStep>

      <ToolStep n={4} id="gk-knockout" title="See the knockout bracket" done={Boolean(played.champion)}
        hint={!ready ? "Your bracket appears here once you have teams." : groupsDone ? "Tap the team that won each match and it moves on. Tapped the wrong one? Tap it again to undo." : "This is the bracket as the group tables stand now. It changes as you enter scores. Finish the group scores in step 3 and you can tap winners here."}
        status={ready && koTotal > 0 ? (played.champion ? `Champion: ${played.champion}` : `${decided} of ${koTotal} matches decided`) : undefined}
        actions={decided > 0 ? <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" onClick={() => setPickState({ sig, map: {} })}>Clear winners</button> : undefined}>
        {!ready || koTotal === 0 ? <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-zinc-300">No bracket yet. Add your teams in step 1.</p> : <>
          <p className="text-sm text-zinc-300">{ko.sameGroupFirstRound === 0 ? "Teams from the same group do not meet in the first round. " : "Some first-round matches are between teams of the same group because the numbers leave no other way. "}{ko.byes > 0 ? `${ko.byes} team${ko.byes === 1 ? " has" : "s have"} a bye: they go straight to the next round without playing.` : ""}</p>
          <p className="text-xs text-zinc-400 sm:hidden">Swipe sideways to see every round.</p>
          <BracketTree matches={played.matches} roundNames={ko.roundNames} champion={played.champion} onPick={groupsDone ? pick : undefined} />
        </>}
      </ToolStep>

      {ready && <fieldset className="card space-y-2">
        <legend className="px-1 text-sm font-semibold text-white">What should the screen show?</legend>
        <div className="flex flex-wrap gap-4">
          {([["bracket", "The knockout bracket"], ["groups", "The group tables"]] as const).map(([v, l]) => (
            <label key={v} className="flex min-h-11 items-center gap-2 text-sm text-zinc-200"><input type="radio" name="gk-screen" checked={screen === v} onChange={() => setScreen(v)} className="h-5 w-5 accent-cyan" />{l}</label>
          ))}
        </div>
      </fieldset>}
      <ScreenButtons payload={payload} what={screen === "groups" ? "group tables" : "knockout bracket"} step={5} />
    </div>
  );
}
