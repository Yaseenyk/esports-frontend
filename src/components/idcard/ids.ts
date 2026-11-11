/** Card IDs. The one rule that matters: no two people ever share an ID, because the signed pass, the gate list and the server all key on it. */

/** Three capital letters from a team name, for IDs like KON-001. */
export const idPrefix = (name: string): string => (name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3) || "ID").toUpperCase();

/**
 * The first free ID of the form PREFIX-001, counting up from `start`.
 * Counting the team's people is not enough on its own: after one is removed, "count + 1" lands on an ID that is still in use.
 */
export function uniqueId(prefix: string, taken: Iterable<string>, start = 1): string {
  const used = new Set(taken);
  for (let n = Math.max(1, Math.floor(start)); ; n++) {
    const id = `${prefix}-${String(n).padStart(3, "0")}`;
    if (!used.has(id)) return id;
  }
}

/** The IDs that appear more than once (case-insensitive, ignoring spaces), so the screen can warn before a pass is printed twice. */
export function repeatedIds(ids: string[]): Set<string> {
  const seen = new Map<string, number>();
  for (const id of ids) { const k = id.trim().toLowerCase(); seen.set(k, (seen.get(k) ?? 0) + 1); }
  return new Set([...seen].filter(([, n]) => n > 1).map(([k]) => k));
}
