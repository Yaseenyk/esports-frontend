/** API payloads (backend /v3/me/journal) to screen shapes. Defensive: odd values become safe defaults or the row is dropped. Pure. */
import type { JournalEntry, JournalList } from "@/features/journal/domain";

type R = Record<string, unknown>;
const obj = (v: unknown): R => (v && typeof v === "object" && !Array.isArray(v) ? (v as R) : {});
const strOrNull = (v: unknown): string | null => (typeof v === "string" ? v : null);
const intOrNull = (v: unknown): number | null => (typeof v === "number" && Number.isInteger(v) ? v : null);

export function toEntry(v: unknown): JournalEntry | null {
  const o = obj(v);
  if (typeof o.id !== "string" || typeof o.playedOn !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.playedOn) || typeof o.game !== "string") return null;
  const kills = intOrNull(o.kills);
  if (kills === null) return null;
  return {
    id: o.id, playedOn: o.playedOn, game: o.game, mode: strOrNull(o.mode), map: strOrNull(o.map), placement: intOrNull(o.placement), kills, damage: intOrNull(o.damage),
    notes: strOrNull(o.notes), createdAt: strOrNull(o.createdAt), updatedAt: strOrNull(o.updatedAt),
  };
}
export function toList(v: unknown): JournalList {
  const o = obj(v);
  const items = (Array.isArray(o.items) ? o.items : []).map(toEntry).filter((x): x is JournalEntry => x !== null);
  return { items, count: items.length, cap: typeof o.cap === "number" ? o.cap : 2000 };
}
export const toItem = (v: unknown): JournalEntry | null => toEntry(obj(v).item);
