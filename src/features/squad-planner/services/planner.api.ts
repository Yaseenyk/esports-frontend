/**
 * Planner API calls and the browser's own keys. Tokens and keys go in POST bodies, never in a URL. The adapter copies known fields only.
 * Keys kept in localStorage: the captain key of a plan this browser made, and this browser's edit key for each plan it answered.
 */
import { v3Post } from "@/features/shared/services/v3-api";
import type { V3Result } from "@/features/shared/failure";
import type { CreatedPlan, Plan, PlanPerson } from "@/features/squad-planner/domain";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const ints = (v: unknown): number[] => (Array.isArray(v) ? v.filter((x): x is number => typeof x === "number" && Number.isInteger(x)) : []);
const str = (v: unknown, max: number): string => (typeof v === "string" ? v.slice(0, max) : "");

export function toPlan(raw: unknown): Plan | null {
  const o = obj(raw);
  const slots = ints(o.slots);
  if (!slots.length || typeof o.game !== "string") return null;
  const people: PlanPerson[] = (Array.isArray(o.people) ? o.people : []).map((p) => {
    const x = obj(p);
    return { id: str(x.id, 64), name: str(x.name, 24), picks: ints(x.picks).filter((i) => i >= 0 && i < slots.length) };
  }).filter((p) => p.id && p.name);
  const counts = slots.map((_, i) => people.filter((p) => p.picks.includes(i)).length); // recomputed: never trust a count we did not see
  return { game: o.game, title: str(o.title, 60), tz: str(o.tz, 40) || "Asia/Kolkata", slotMinutes: o.slotMinutes === 30 ? 30 : 60, slots, people, counts, expiresAt: str(o.expiresAt, 40), ...(typeof o.mine === "string" ? { mine: o.mine.slice(0, 64) } : {}) };
}

const map = async <A, B>(p: Promise<V3Result<A>>, f: (a: A) => B): Promise<V3Result<B>> => { const r = await p; return r.ok ? { ok: true, data: f(r.data) } : r; };

export const createPlan = (body: { game: string; title: string; tz: string; slotMinutes: number; slots: number[] }) =>
  map(v3Post<unknown>("/public/planner", body), (r): CreatedPlan | null => {
    const o = obj(r);
    return typeof o.token === "string" && typeof o.captainKey === "string" ? { token: o.token, captainKey: o.captainKey, expiresAt: str(o.expiresAt, 40) } : null;
  });
export const openPlan = (token: string) => map(v3Post<unknown>("/public/planner/open", { token }), toPlan);
export const sendVote = (token: string, editKey: string, name: string, picks: number[]) => map(v3Post<unknown>("/public/planner/vote", { token, editKey, name, picks }), toPlan);
export const removeVote = (token: string, editKey: string) => map(v3Post<unknown>("/public/planner/unvote", { token, editKey }), toPlan);
export const deletePlan = (token: string, captainKey: string) => v3Post<unknown>("/public/planner/delete", { token, captainKey });

// ---- keys kept in this browser only (every read and write may fail in a private window) ----
const KEY = "eh_squad_plans_v1";
interface Stored { [token: string]: { editKey?: string; voteId?: string; name?: string; captainKey?: string; at: number } }
function readAll(): Stored {
  try { const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}"); return v && typeof v === "object" ? (v as Stored) : {}; } catch { return {}; }
}
function writeAll(s: Stored): void {
  try {
    const cutoff = Date.now() - 31 * 86_400_000; // plans are deleted after 30 days: forget their keys too
    const kept = Object.fromEntries(Object.entries(s).filter(([, v]) => v.at > cutoff).slice(-30));
    localStorage.setItem(KEY, JSON.stringify(kept));
  } catch { /* storage blocked: the page still works, it just will not remember */ }
}
export const localFor = (token: string) => readAll()[token] ?? null;
export function saveLocal(token: string, patch: Partial<Stored[string]>): void {
  const all = readAll();
  all[token] = { ...(all[token] ?? { at: Date.now() }), ...patch, at: Date.now() };
  writeAll(all);
}
export function forgetLocal(token: string): void {
  const all = readAll();
  delete all[token];
  writeAll(all);
}
