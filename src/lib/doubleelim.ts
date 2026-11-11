/**
 * Double elimination: a team is out after two losses. Builds the winners bracket, the losers bracket and the grand final,
 * and works out who is in each slot from the winners picked so far. Pure functions.
 */
import { seedOrder } from "./seeding";

export type Ref =
  | { t: "team"; name: string; seed: number }
  | { t: "bye" }
  | { t: "winner"; of: string }
  | { t: "loser"; of: string };

export interface Match { id: string; bracket: "W" | "L" | "F"; round: number; a: Ref; b: Ref }
export interface Bracket { size: number; matches: Match[] }

export type Slot = { kind: "team"; name: string; seed: number } | { kind: "bye" } | { kind: "tbd"; label: string };

/** "W2-3" is the third match of round 2 of the winners bracket. */
export function build(teams: string[]): Bracket | null {
  const list = teams.map((t) => t.trim()).filter(Boolean);
  if (list.length < 3 || list.length > 64) return null;
  let size = 4;
  while (size < list.length) size *= 2;
  const k = Math.log2(size);
  const order = seedOrder(size);
  const team = (seed: number): Ref => (seed <= list.length ? { t: "team", name: list[seed - 1]!, seed } : { t: "bye" });
  const matches: Match[] = [];
  const W = (r: number, i: number) => `W${r}-${i}`, L = (r: number, i: number) => `L${r}-${i}`;

  for (let r = 1; r <= k; r++) {
    const count = size / 2 ** r;
    for (let i = 1; i <= count; i++) {
      matches.push({ id: W(r, i), bracket: "W", round: r, a: r === 1 ? team(order[2 * i - 2]!) : { t: "winner", of: W(r - 1, 2 * i - 1) }, b: r === 1 ? team(order[2 * i - 1]!) : { t: "winner", of: W(r - 1, 2 * i) } });
    }
  }
  for (let r = 1; r <= 2 * (k - 1); r++) {
    const m = Math.ceil(r / 2);
    const count = size / 2 ** (m + 1);
    for (let i = 1; i <= count; i++) {
      let a: Ref, b: Ref;
      if (r === 1) { a = { t: "loser", of: W(1, 2 * i - 1) }; b = { t: "loser", of: W(1, 2 * i) }; }
      else if (r % 2 === 0) { a = { t: "winner", of: L(r - 1, i) }; b = { t: "loser", of: W(m + 1, count - i + 1) }; } // drop-ins in reverse order so teams do not meet again straight away
      else { a = { t: "winner", of: L(r - 1, 2 * i - 1) }; b = { t: "winner", of: L(r - 1, 2 * i) }; }
      matches.push({ id: L(r, i), bracket: "L", round: r, a, b });
    }
  }
  matches.push({ id: "GF", bracket: "F", round: 1, a: { t: "winner", of: W(k, 1) }, b: { t: "winner", of: L(2 * (k - 1), 1) } });
  matches.push({ id: "GF2", bracket: "F", round: 2, a: { t: "winner", of: W(k, 1) }, b: { t: "winner", of: L(2 * (k - 1), 1) } });
  return { size, matches };
}

/** `picks[id]` is 0 if the first slot won, 1 if the second won. */
export function resolve(bracket: Bracket, ref: Ref, picks: Record<string, 0 | 1 | undefined>, depth = 0): Slot {
  if (depth > 60) return { kind: "tbd", label: "?" };
  const byId = new Map(bracket.matches.map((m) => [m.id, m]));
  const walk = (r: Ref, d: number): Slot => {
    if (r.t === "team") return { kind: "team", name: r.name, seed: r.seed };
    if (r.t === "bye") return { kind: "bye" };
    const m = byId.get(r.of)!;
    const A = walk(m.a, d + 1), B = walk(m.b, d + 1);
    if (r.t === "winner") {
      if (A.kind === "bye" && B.kind === "bye") return { kind: "bye" };
      if (A.kind === "bye") return B;
      if (B.kind === "bye") return A;
      const p = picks[m.id];
      return A.kind === "team" && B.kind === "team" && p !== undefined ? (p === 0 ? A : B) : { kind: "tbd", label: `Winner of ${m.id}` };
    }
    if (A.kind === "bye" || B.kind === "bye") return { kind: "bye" };
    const p = picks[m.id];
    return A.kind === "team" && B.kind === "team" && p !== undefined ? (p === 0 ? B : A) : { kind: "tbd", label: `Loser of ${m.id}` };
  };
  return walk(ref, depth);
}

/** The two slots of a match as they stand now. */
export function slots(bracket: Bracket, m: Match, picks: Record<string, 0 | 1 | undefined>): [Slot, Slot] {
  return [resolve(bracket, m.a, picks), resolve(bracket, m.b, picks)];
}

/** A match is played when both slots hold real teams. */
export const isPlayable = (s: [Slot, Slot]) => s[0].kind === "team" && s[1].kind === "team";

/** The tournament winner once the grand final (and the reset, if it was needed) has been decided, else null. */
export function champion(bracket: Bracket, picks: Record<string, 0 | 1 | undefined>): { name: string; seed: number } | null {
  const first = picks["GF"];
  if (first === undefined) return null;
  const gf = slots(bracket, bracket.matches.find((m) => m.id === "GF")!, picks);
  const r = first === 0 ? gf[0] : resolve(bracket, { t: "winner", of: "GF2" }, picks);
  return r.kind === "team" ? { name: r.name, seed: r.seed } : null;
}
