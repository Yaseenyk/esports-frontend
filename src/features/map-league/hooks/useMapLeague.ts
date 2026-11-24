"use client";

import { useMemo, useState } from "react";
import { fixtures, type Fixture } from "@/lib/roundrobin";
import { uniqueTeams } from "@/lib/seeding";
import {
  DEFAULT_MAP_LEAGUE, MAX_ROUNDS, mapLeagueTable, mapLeagueView, matchOutcome, progress,
  type BestOf, type MapLeagueSettings, type MapScore,
} from "@/features/map-league/domain";

export const EXAMPLE_TEAMS = ["Night Owls", "Byte Force", "Echo Five", "Delta Squad"];
export const MIN_TEAMS = 2;
export const MAX_TEAMS = 16;

const toRounds = (v: string): number | null => {
  const d = v.replace(/\D/g, "").slice(0, 2);
  if (!d) return null;
  return Math.min(Number(d), MAX_ROUNDS);
};

/**
 * State for the map league tool: the teams, the format, the points, and the rounds typed for each map. Results belong to a pairing
 * (leg, team A, team B), not to a position, so fixing a team's name or adding a team never moves a result onto another match.
 */
export function useMapLeague() {
  const [text, setText] = useState(EXAMPLE_TEAMS.join("\n"));
  const [double, setDouble] = useState(false);
  const [settings, setSettings] = useState<MapLeagueSettings>(DEFAULT_MAP_LEAGUE);
  const [results, setResults] = useState<Record<string, MapScore[]>>({});

  const teams = useMemo(() => uniqueTeams(text.split(/\r?\n/)), [text]);
  const ready = teams.length >= MIN_TEAMS && teams.length <= MAX_TEAMS;
  const rounds = useMemo(() => (ready ? fixtures(teams, double) : []), [teams, double, ready]);
  const keyOf = (f: Fixture, ri: number) => `${double && ri >= rounds.length / 2 ? 2 : 1}\u0001${f.a}\u0001${f.b}`;
  const grid = useMemo(() => rounds.map((rd, ri) => rd.map((f) => results[keyOf(f, ri)] ?? [])), [rounds, results]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows = useMemo(() => (ready ? mapLeagueTable(teams, rounds, grid, settings) : []), [ready, teams, rounds, grid, settings]);
  const count = useMemo(() => progress(rounds, grid, settings.bestOf), [rounds, grid, settings.bestOf]);
  const view = useMemo(() => (ready && rows.length ? mapLeagueView(rows, settings.bestOf) : null), [ready, rows, settings.bestOf]);

  const outcome = (ri: number, fi: number) => matchOutcome(grid[ri]?.[fi] ?? [], settings.bestOf);
  const setRounds = (ri: number, fi: number, map: number, side: "a" | "b", v: string) => {
    const f = rounds[ri]?.[fi];
    if (!f) return;
    const k = keyOf(f, ri);
    setResults((all) => {
      const maps = [...(all[k] ?? [])];
      while (maps.length <= map) maps.push({ a: null, b: null });
      maps[map] = { ...maps[map]!, [side]: toRounds(v) };
      return { ...all, [k]: maps };
    });
  };
  const setBestOf = (bestOf: BestOf) => setSettings((s) => ({ ...s, bestOf }));
  const setPoints = (key: "win" | "loss", n: number) => setSettings((s) => ({ ...s, [key]: n }));
  const changeTeams = (v: string) => setText(v);

  return {
    text, changeTeams, teams, ready, double, setDouble, settings, setBestOf, setPoints,
    rounds, grid, outcome, setRounds, clear: () => setResults({}), rows, count, view,
  };
}
