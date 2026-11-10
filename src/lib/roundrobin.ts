/** Round-robin fixtures (everyone plays everyone) using the circle method, and the league table that goes with them. Pure functions. */
export interface Fixture { a: string; b: string }
export type Round = Fixture[];

export const BYE = "Bye";

/**
 * Builds the rounds. With an odd number of teams one team sits out each round (shown as a match against "Bye").
 * With `double` every pairing is played twice, the second time with sides swapped.
 */
export function fixtures(teams: string[], double = false): Round[] {
  const list = teams.map((t) => t.trim()).filter(Boolean);
  if (list.length < 2) return [];
  const ring = list.length % 2 ? [...list, BYE] : [...list];
  const n = ring.length;
  const rounds: Round[] = [];
  let arr = [...ring];
  for (let r = 0; r < n - 1; r++) {
    const round: Round = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i]!, b = arr[n - 1 - i]!;
      // Swap sides now and then so no team is always listed first.
      const flip = i === 0 ? r % 2 === 1 : (r + i) % 2 === 1;
      round.push(flip ? { a: b, b: a } : { a, b });
    }
    rounds.push(round);
    // Keep the first team in place and rotate the rest by one.
    arr = [arr[0]!, arr[n - 1]!, ...arr.slice(1, n - 1)];
  }
  if (!double) return rounds;
  return [...rounds, ...rounds.map((rd) => rd.map((f) => ({ a: f.b, b: f.a })))];
}

/** Number of real matches for n teams (a match against a bye is not a match). */
export const matchCount = (n: number, double = false): number => (n * (n - 1)) / 2 * (double ? 2 : 1);

export interface Score { a: number | null; b: number | null }
export interface Points { win: number; draw: number; loss: number }
export interface Row { rank: number; team: string; played: number; won: number; drawn: number; lost: number; for: number; against: number; diff: number; points: number }

export const DEFAULT_POINTS: Points = { win: 3, draw: 1, loss: 0 };

/**
 * The league table from the results entered so far. A match counts only when both scores are filled in.
 * Order: points, then score difference, then scores for, then wins, then name, so the same results always give the same table.
 */
export function table(teams: string[], rounds: Round[], scores: Score[][], pts: Points = DEFAULT_POINTS): Row[] {
  const rows = new Map(teams.map((t) => [t.trim(), { team: t.trim(), played: 0, won: 0, drawn: 0, lost: 0, for: 0, against: 0, points: 0 }]));
  rounds.forEach((rd, ri) => rd.forEach((f, fi) => {
    const s = scores[ri]?.[fi];
    if (!s || s.a === null || s.b === null || f.a === BYE || f.b === BYE) return;
    const A = rows.get(f.a), B = rows.get(f.b);
    if (!A || !B) return;
    A.played++; B.played++; A.for += s.a; A.against += s.b; B.for += s.b; B.against += s.a;
    if (s.a > s.b) { A.won++; B.lost++; A.points += pts.win; B.points += pts.loss; }
    else if (s.a < s.b) { B.won++; A.lost++; B.points += pts.win; A.points += pts.loss; }
    else { A.drawn++; B.drawn++; A.points += pts.draw; B.points += pts.draw; }
  }));
  return [...rows.values()]
    .map((r) => ({ ...r, diff: r.for - r.against }))
    .sort((x, y) => y.points - x.points || y.diff - x.diff || y.for - x.for || y.won - x.won || x.team.localeCompare(y.team))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
