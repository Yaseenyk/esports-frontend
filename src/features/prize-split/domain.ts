/**
 * Slot and prize split maths. Pure, so every rounding rule is unit tested: the parts always add up to the total.
 *
 * Nothing here handles money. It divides numbers the organiser types: qualification slots across groups, and, if an event has a
 * prize pool, that figure across places. No currency, no payments, nothing stored.
 */

/**
 * Largest remainder rounding: shares proportional to `weights`, in whole steps of `unit`, that add up to exactly `total`.
 * Ties for the leftover go to the earlier entry (the higher place or the first group), so the answer never changes between runs.
 */
export function largestRemainder(total: number, weights: number[], unit = 1): number[] {
  const sum = weights.reduce((a, b) => a + Math.max(0, b), 0);
  if (!(total >= 0) || !(unit > 0) || sum <= 0 || weights.length === 0) return weights.map(() => 0);
  const steps = Math.round(total / unit);
  const exact = weights.map((w) => (Math.max(0, w) / sum) * steps);
  const base = exact.map((x) => Math.floor(x + 1e-9));
  let left = steps - base.reduce((a, b) => a + b, 0);
  const order = exact.map((x, i) => ({ i, r: x - base[i]! })).sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; left > 0 && k < order.length; k++, left--) base[order[k]!.i]! += 1;
  return base.map((b) => round(b * unit));
}

const round = (n: number) => Math.round(n * 1e6) / 1e6;

// ------------------------------------------------------------------ slots

export type SlotMode = "even" | "bySize";
export interface SlotInput { slots: number; groups: number; mode: SlotMode; /** Teams in each group, used by "bySize". */ sizes?: number[] }
export interface SlotGroup { group: string; teams?: number; slots: number }
export type SlotCheck = { ok: true; groups: SlotGroup[]; note?: string } | { ok: false; error: string };

export const MAX_GROUPS = 64, MAX_SLOTS = 1000;
export const groupName = (i: number): string => (i < 26 ? `Group ${String.fromCharCode(65 + i)}` : `Group ${i + 1}`);

/**
 * Splits qualification slots across groups. "even": sizes differ by at most one, the extra slots go to the first groups.
 * "bySize": in proportion to each group's teams (largest remainder), and never more slots than a group has teams.
 */
export function splitSlots(i: SlotInput): SlotCheck {
  if (!Number.isInteger(i.groups) || i.groups < 1 || i.groups > MAX_GROUPS) return { ok: false, error: `Use 1 to ${MAX_GROUPS} groups.` };
  if (!Number.isInteger(i.slots) || i.slots < 1 || i.slots > MAX_SLOTS) return { ok: false, error: `Use 1 to ${MAX_SLOTS} slots.` };
  if (i.mode === "even") {
    const base = Math.floor(i.slots / i.groups), extra = i.slots % i.groups;
    const groups = Array.from({ length: i.groups }, (_, g) => ({ group: groupName(g), slots: base + (g < extra ? 1 : 0) }));
    return { ok: true, groups, note: extra ? `${i.slots} does not divide evenly by ${i.groups}, so the first ${extra} group${extra === 1 ? " gets" : "s get"} one slot more. Decide in your rules which groups those are, for example by seeding or a draw.` : undefined };
  }
  const sizes = (i.sizes ?? []).slice(0, i.groups);
  if (sizes.length !== i.groups || sizes.some((n) => !Number.isInteger(n) || n < 1)) return { ok: false, error: "Type the number of teams in every group (1 or more)." };
  const teams = sizes.reduce((a, b) => a + b, 0);
  if (i.slots > teams) return { ok: false, error: `There are only ${teams} teams in the groups, fewer than ${i.slots} slots.` };
  const share = capped(i.slots, sizes);
  return { ok: true, groups: sizes.map((n, g) => ({ group: groupName(g), teams: n, slots: share[g]! })) };
}

/** Largest remainder in proportion to the sizes, with no group given more slots than it has teams (the overflow is shared again). */
function capped(total: number, sizes: number[]): number[] {
  const out = sizes.map(() => 0);
  let open = sizes.map((_, i) => i), left = total;
  while (left > 0 && open.length) {
    const share = largestRemainder(left, open.map((i) => sizes[i]! - out[i]!));
    open.forEach((i, k) => { out[i] += share[k]!; });
    const over = open.reduce((a, i) => a + Math.max(0, out[i]! - sizes[i]!), 0);
    open.forEach((i) => { out[i] = Math.min(out[i]!, sizes[i]!); });
    left = over;
    open = open.filter((i) => out[i]! < sizes[i]!);
  }
  return out;
}

// ------------------------------------------------------------------ pool split

export type Rule = "custom" | "winner" | "equal" | "linear" | "halving";
export const RULES: readonly { id: Rule; label: string; help: string }[] = [
  { id: "custom", label: "My own percentages", help: "Type a percentage for each place. They must add up to 100." },
  { id: "winner", label: "Winner takes all", help: "First place gets the whole figure." },
  { id: "equal", label: "Equal shares", help: "Every place in the list gets the same share." },
  { id: "linear", label: "Even steps", help: "Each place gets one step less than the place above: with 4 places the weights are 4, 3, 2 and 1." },
  { id: "halving", label: "Each place half the one above", help: "Weights 1, 1/2, 1/4 and so on: a steep split that favours the top." },
];

export const MAX_PLACES = 32;

/** The weights a rule gives to `places` places. Custom uses the typed percentages. */
export function ruleWeights(rule: Rule, places: number, custom: number[] = []): number[] {
  const n = Math.max(0, Math.min(MAX_PLACES, Math.floor(places)));
  if (rule === "winner") return Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0));
  if (rule === "equal") return Array.from({ length: n }, () => 1);
  if (rule === "linear") return Array.from({ length: n }, (_, i) => n - i);
  if (rule === "halving") return Array.from({ length: n }, (_, i) => 1 / 2 ** i);
  return Array.from({ length: n }, (_, i) => Math.max(0, custom[i] ?? 0));
}

export interface PoolInput { pool: number; places: number; rule: Rule; percents?: number[]; /** Round each share to a multiple of this (1, 10, 100...). */ unit: number }
export interface PoolPlace { place: number; percent: number; share: number }
export type PoolCheck = { ok: true; places: PoolPlace[]; total: number; note?: string } | { ok: false; error: string };

export const ordinal = (n: number): string => {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${s}`;
};

/** Splits the figure across places. Every share is a multiple of `unit` and the shares add up to the figure exactly. */
export function splitPool(i: PoolInput): PoolCheck {
  if (!(Number.isFinite(i.pool) && i.pool > 0)) return { ok: false, error: "Type the figure to split, above 0." };
  if (!Number.isInteger(i.places) || i.places < 1 || i.places > MAX_PLACES) return { ok: false, error: `Use 1 to ${MAX_PLACES} places.` };
  if (!(i.unit > 0)) return { ok: false, error: "Choose what to round to." };
  if (Math.abs(i.pool / i.unit - Math.round(i.pool / i.unit)) > 1e-9) return { ok: false, error: `The figure is not a whole number of ${i.unit}s. Round it, or round to a smaller step.` };
  const w = ruleWeights(i.rule, i.places, i.percents);
  if (i.rule === "custom") {
    const sum = round(w.reduce((a, b) => a + b, 0));
    if (Math.abs(sum - 100) > 1e-6) return { ok: false, error: `The percentages add up to ${sum}, not 100.` };
  }
  const shares = largestRemainder(i.pool, w, i.unit), wsum = w.reduce((a, b) => a + b, 0);
  const places = shares.map((share, k) => ({ place: k + 1, percent: round((w[k]! / wsum) * 100), share }));
  const exact = w.every((x) => Math.abs(((x / wsum) * i.pool) / i.unit - Math.round(((x / wsum) * i.pool) / i.unit)) < 1e-9);
  return { ok: true, places, total: round(shares.reduce((a, b) => a + b, 0)), note: exact ? undefined : `The exact shares are not whole multiples of ${i.unit}, so each was rounded and the leftover went to the places closest to the next step, highest place first on a tie. The total is still exactly ${i.pool}.` };
}

/** "12,500" style grouping without any currency sign. */
export const grouped = (n: number): string => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
