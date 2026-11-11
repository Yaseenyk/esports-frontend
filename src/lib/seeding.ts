/** Standard seeding: 1 meets the lowest seed first, and the top seeds can only meet late. Size must be a power of two. */
export function seedOrder(n: number): number[] {
  let order = [1];
  while (order.length < n) { const m = order.length * 2 + 1; order = order.flatMap((s) => [s, m - s]); }
  return order;
}

/** Cleans a typed list of team names: trims, drops blank lines and repeats (ignoring capital letters), keeps the first spelling and the order. */
export function uniqueTeams(lines: string[], max = Infinity): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of lines) {
    const t = raw.replace(/\s+/g, " ").trim();
    const k = t.toLowerCase();
    if (!t || seen.has(k)) continue;
    seen.add(k); out.push(t);
    if (out.length >= max) break;
  }
  return out;
}
