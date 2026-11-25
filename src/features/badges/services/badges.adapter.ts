/** Badge payloads to screen shapes. Only ids from the known list pass, and titles and rules come from that list, never from the response. Pure. */
import { badgeDef, type OwnBadges, type PublicBadge } from "@/features/badges/domain";

type R = Record<string, unknown>;
const obj = (v: unknown): R => (v && typeof v === "object" && !Array.isArray(v) ? (v as R) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export function toPublicBadges(v: unknown): PublicBadge[] {
  const seen = new Set<string>();
  const out: PublicBadge[] = [];
  for (const x of arr(v)) {
    const d = badgeDef(String(obj(x).id ?? ""));
    if (d && !seen.has(d.id)) { seen.add(d.id); out.push({ id: d.id, title: d.title }); }
  }
  return out;
}
export function toOwnBadges(v: unknown): OwnBadges {
  const o = obj(v);
  const items = arr(o.items).map((x) => {
    const b = obj(x);
    const d = badgeDef(String(b.id ?? ""));
    return d ? { ...d, earned: b.earned === true, hidden: b.hidden === true } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);
  return { items, sectionHidden: o.sectionHidden === true };
}
