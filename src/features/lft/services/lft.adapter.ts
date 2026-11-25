/** API shape -> domain for the LFT board. Copies known fields only: an author id, email or anything else the server adds never reaches a component. Pure. */
import { CONTACT_KINDS, type BoardPage, type Contacts, type InboxApplication, type Kind, type Listing, type MyListing, type SentApplication } from "@/features/lft/domain";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const str = (v: unknown, max = 2000): string | null => (typeof v === "string" && v.trim() ? v.slice(0, max) : null);
const int = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : null);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const codes = (v: unknown, max: number): string[] => arr(v).filter((x): x is string => typeof x === "string" && /^[a-z_]{1,12}$/.test(x)).slice(0, max);
/** Chosen contacts: known kinds only, short strings only. */
export function toContacts(v: unknown): Contacts | null {
  const o = obj(v), out: Contacts = {};
  for (const k of CONTACT_KINDS) { const s = str(o[k], 40); if (s) out[k] = s; }
  return Object.keys(out).length ? out : null;
}
const toMatch = (v: unknown): Listing["match"] => { const o = obj(v); return typeof o.score === "number" ? { score: Math.max(0, Math.min(100, Math.round(o.score))), reasons: codes(o.reasons, 3) } : null; };
const kind = (v: unknown): Kind | null => (v === "looking_for_team" || v === "looking_for_player" ? v : null);

export function toListing(raw: unknown): Listing | null {
  const o = obj(raw);
  const id = str(o.id, 80), k = kind(o.kind), game = str(o.game, 40), message = str(o.message, 1000);
  if (!id || !k || !game || !message) return null;
  return {
    id, kind: k, game, roles: arr(o.roles).filter((r): r is string => typeof r === "string").slice(0, 4), rankMin: int(o.rankMin), rankMax: int(o.rankMax),
    state: str(o.state, 80), city: str(o.city, 80), onlineOk: o.onlineOk === true, message, teamName: str(o.teamName, 80),
    createdAt: str(o.createdAt, 40) ?? "", lastBumpedAt: str(o.lastBumpedAt, 40) ?? "", expiresAt: str(o.expiresAt, 40) ?? "",
    languages: codes(o.languages, 5), playHours: codes(o.playHours, 5), match: toMatch(o.match),
  };
}

export function toBoardPage(raw: unknown): BoardPage {
  const o = obj(raw);
  return { items: arr(o.items).map(toListing).filter((x): x is Listing => x !== null), nextCursor: str(o.nextCursor, 200) };
}

export function toMyListings(raw: unknown): MyListing[] {
  const list = Array.isArray(raw) ? raw : arr(obj(raw).items ?? obj(raw).listings);
  return list.map((r) => {
    const base = toListing(r), o = obj(r);
    if (!base) return null;
    return { ...base, contact: str(o.contact, 80) ?? "", status: str(o.status, 20) ?? "open", hidden: o.hidden === true, reportCount: int(o.reportCount) ?? 0, applications: int(o.applications) ?? 0, contacts: toContacts(o.contacts) };
  }).filter((x): x is MyListing => x !== null);
}

export function toInbox(raw: unknown): InboxApplication[] {
  const list = Array.isArray(raw) ? raw : arr(obj(raw).items ?? obj(raw).applications);
  return list.map((r) => {
    const o = obj(r), id = str(o.id, 80);
    if (!id) return null;
    const status = str(o.status, 20) ?? "sent";
    // Defence in depth: a contact is only ever kept for an accepted application, whatever the server sent.
    return { id, status, message: str(o.message, 1000) ?? "", createdAt: str(o.createdAt, 40) ?? "", respondedAt: str(o.respondedAt, 40), profileSlug: str(o.profileSlug, 80), contact: status === "accepted" ? str(o.contact, 80) : null, contacts: status === "accepted" ? toContacts(o.contacts) : null };
  }).filter((x): x is InboxApplication => x !== null);
}

export function toSent(raw: unknown): SentApplication[] {
  const list = Array.isArray(raw) ? raw : arr(obj(raw).items ?? obj(raw).applications);
  return list.map((r) => {
    const o = obj(r), id = str(o.id, 80), k = kind(o.kind);
    if (!id || !k) return null;
    const status = str(o.status, 20) ?? "sent";
    return { id, listingId: str(o.listingId, 80) ?? "", status, kind: k, game: str(o.game, 40) ?? "other", teamName: str(o.teamName, 80), listingStatus: str(o.listingStatus, 20) ?? "open", createdAt: str(o.createdAt, 40) ?? "", respondedAt: str(o.respondedAt, 40), contact: status === "accepted" ? str(o.contact, 80) : null, contacts: status === "accepted" ? toContacts(o.contacts) : null };
  }).filter((x): x is SentApplication => x !== null);
}
