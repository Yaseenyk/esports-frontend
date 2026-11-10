/**
 * Battle royale points: placement points plus kill points over several matches, with tie-breakers.
 * Pure functions, so the calculator on the site and the worked example in the guide use the same code and cannot disagree.
 */
export interface MatchResult { placement: number; kills: number }
export interface TeamEntry { name: string; matches: MatchResult[] }
export interface Scale {
  /** Points for 1st place, 2nd place, and so on. Placements beyond the list score 0. */
  placement: number[];
  /** Points for each kill. */
  perKill: number;
}
export interface Standing {
  rank: number;
  name: string;
  total: number;
  placementPoints: number;
  killPoints: number;
  kills: number;
  wins: number;
  lastPlacement: number | null;
  /** Points scored in each match, in order. */
  perMatch: number[];
  /** True when another team has the same total, and the tie-breakers decided the order. */
  tied: boolean;
}

/** An example scale commonly used for custom rooms. Official tournaments publish their own, so always set yours to match your rules. */
export const EXAMPLE_SCALE: Scale = { placement: [10, 6, 5, 4, 3, 2, 1, 1], perKill: 1 };

export const matchPoints = (m: MatchResult, s: Scale): number => (s.placement[m.placement - 1] ?? 0) + Math.max(0, m.kills) * s.perKill;

/**
 * Orders teams by total points. Ties are broken by (1) more wins (first places), (2) more kills, (3) better placement in the last match,
 * (4) name, so the order is always the same for the same input. Say these rules in your rulebook before the event.
 */
export function standings(teams: TeamEntry[], s: Scale): Standing[] {
  const rows = teams.map((t) => {
    const placementPoints = t.matches.reduce((n, m) => n + (s.placement[m.placement - 1] ?? 0), 0);
    const kills = t.matches.reduce((n, m) => n + Math.max(0, m.kills), 0);
    const last = t.matches.length ? t.matches[t.matches.length - 1]!.placement : null;
    return {
      name: t.name, total: placementPoints + kills * s.perKill, placementPoints, killPoints: kills * s.perKill, kills,
      wins: t.matches.filter((m) => m.placement === 1).length, lastPlacement: last, perMatch: t.matches.map((m) => matchPoints(m, s)),
    };
  });
  rows.sort((a, b) => b.total - a.total || b.wins - a.wins || b.kills - a.kills || (a.lastPlacement ?? 99) - (b.lastPlacement ?? 99) || a.name.localeCompare(b.name));
  return rows.map((r, i) => ({ ...r, rank: i + 1, tied: rows.some((o) => o !== r && o.total === r.total) }));
}

/** Parses a scale typed as "10,6,5,4,3,2,1,1". Returns null if it is not a list of non-negative numbers. */
export function parsePlacement(text: string): number[] | null {
  const parts = text.split(/[,\s]+/).filter(Boolean);
  if (!parts.length || parts.length > 100) return null;
  const nums = parts.map(Number);
  return nums.every((n) => Number.isFinite(n) && n >= 0) ? nums : null;
}
