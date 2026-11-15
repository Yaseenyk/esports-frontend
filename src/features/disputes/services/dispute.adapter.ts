/** API shape -> domain for disputes. Fixed field lists: no user id can reach a component because none is ever copied. Pure. */
import type { Correction, DisputeDetail, DisputeEvent, DisputeListItem, EvidenceItem, Permissions } from "@/features/disputes/domain";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const str = (v: unknown, max = 3000): string | null => (typeof v === "string" && v.trim() ? v.slice(0, max) : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const flat = (v: unknown): Record<string, number | string> => Object.fromEntries(Object.entries(obj(v)).filter(([, x]) => typeof x === "number" || typeof x === "string").slice(0, 8)) as Record<string, number | string>;

export function toListItem(raw: unknown): DisputeListItem | null {
  const o = obj(raw), id = str(o.id, 80), t = obj(o.tournament);
  if (!id) return null;
  return {
    id, tournament: { slug: str(t.slug, 80) ?? "", title: str(t.title, 200) ?? "Tournament" }, type: str(o.type, 40) ?? "other", status: str(o.status, 40) ?? "open", summary: str(o.summary, 1000) ?? "",
    raisedByTeam: str(o.raisedByTeam, 80), againstTeam: str(o.againstTeam, 80), evidenceCount: Math.max(0, num(o.evidenceCount) ?? 0), dueAt: str(o.dueAt, 40), overdue: o.overdue === true, createdAt: str(o.createdAt, 40) ?? "",
  };
}

export function toList(raw: unknown): DisputeListItem[] {
  const list = Array.isArray(raw) ? raw : arr(obj(raw).items ?? obj(raw).disputes);
  return list.map(toListItem).filter((x): x is DisputeListItem => x !== null);
}

const toEvent = (raw: unknown): DisputeEvent | null => {
  const o = obj(raw), id = str(o.id, 80), action = str(o.action, 60);
  return id && action ? { id, actorRole: str(o.actorRole, 20) ?? "team", action, fromStatus: str(o.fromStatus, 40), toStatus: str(o.toStatus, 40), note: str(o.note, 1200), createdAt: str(o.createdAt, 40) ?? "" } : null;
};
const toEvidence = (raw: unknown): EvidenceItem | null => {
  const o = obj(raw), id = str(o.id, 80);
  return id ? { id, mimeType: str(o.mimeType, 40) ?? "image/webp", sizeBytes: Math.max(0, num(o.sizeBytes) ?? 0), caption: str(o.caption, 200), createdAt: str(o.createdAt, 40) ?? "", purged: o.purged === true, purgeAfter: str(o.purgeAfter, 40) } : null;
};
const toCorrection = (raw: unknown): Correction | null => { const o = obj(raw), ref = str(o.matchRef, 120); return ref ? { matchRef: ref, oldValue: flat(o.oldValue), newValue: flat(o.newValue) } : null; };

/** Missing permissions mean "may do nothing": the UI only ever offers what the server said is allowed. */
export function toPermissions(raw: unknown): Permissions {
  const o = obj(raw);
  return { canComment: o.canComment === true, canUploadEvidence: o.canUploadEvidence === true, canWithdraw: o.canWithdraw === true, transitions: arr(o.transitions).filter((t): t is string => typeof t === "string"), canResolve: o.canResolve === true, role: str(o.role, 20) ?? "party" };
}

export function toDetail(raw: unknown): DisputeDetail | null {
  const base = toListItem(raw), o = obj(raw);
  if (!base) return null;
  return {
    ...base, matchId: str(o.matchId, 80), matchNo: num(o.matchNo), outcome: str(o.outcome, 30), resolutionNote: str(o.resolutionNote, 1200), resolvedAt: str(o.resolvedAt, 40), updatedAt: str(o.updatedAt, 40) ?? "",
    events: arr(o.events).map(toEvent).filter((x): x is DisputeEvent => x !== null), evidence: arr(o.evidence).map(toEvidence).filter((x): x is EvidenceItem => x !== null),
    corrections: arr(o.corrections).map(toCorrection).filter((x): x is Correction => x !== null), permissions: toPermissions(o.permissions),
  };
}
