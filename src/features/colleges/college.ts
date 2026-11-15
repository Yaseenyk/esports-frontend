/**
 * Public college pages: API shape -> domain, build-time reads and static params. Node only (build), never imported by a client component.
 * Copies a fixed list of fields, so nothing the server adds later can reach a component. With the API off (404), empty or unreachable the
 * list is empty and no college page is emitted (see PLACEHOLDER_SLUG and scripts/prune-v3.mjs).
 */
import { api } from "@/lib/api";
import { toCard } from "@/features/tournaments/services/tournament.adapter";
import type { TournamentCard } from "@/features/tournaments/domain";

export interface CollegeItem { slug: string; name: string; tournaments: number; indexable: boolean; lastStartsAt: string | null }
export interface College { slug: string; name: string; indexable: boolean; tournaments: TournamentCard[] }

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const text = (v: unknown, max: number): string | null => (typeof v === "string" && v.trim() ? v.slice(0, max) : null);
const SLUG = /^[a-z0-9-]+$/;

export function toCollegeList(raw: unknown): CollegeItem[] {
  return arr(obj(raw).items).flatMap((x) => {
    const o = obj(x), slug = text(o.slug, 80), name = text(o.name, 120);
    if (!slug || !name || !SLUG.test(slug)) return [];
    return [{ slug, name, tournaments: typeof o.tournaments === "number" ? Math.max(0, Math.floor(o.tournaments)) : 0, indexable: o.indexable === true, lastStartsAt: text(o.lastStartsAt, 40) }];
  });
}

export function toCollege(raw: unknown): College | null {
  const o = obj(raw), slug = text(o.slug, 80), name = text(o.name, 120);
  if (!slug || !name || !SLUG.test(slug)) return null;
  return { slug, name, indexable: o.indexable === true, tournaments: arr(o.tournaments).map(toCard).filter((c): c is TournamentCard => c !== null) };
}

const BUILD_OPT = { retries: 0, timeout: 8000, ttl: 300000 } as const;
let cached: Promise<College[]> | null = null;

async function load(): Promise<College[]> {
  let list: CollegeItem[] = [];
  try { list = toCollegeList(await api.get<unknown>("/public/colleges", BUILD_OPT)); } catch { return []; }
  const out: College[] = [];
  for (const c of list) {
    try { const d = toCollege(await api.get<unknown>(`/public/colleges/${encodeURIComponent(c.slug)}`, BUILD_OPT)); if (d && d.tournaments.length > 0) out.push(d); } catch { /* skip */ }
  }
  return out;
}

export const loadBuildColleges = (): Promise<College[]> => (cached ??= load());
export const indexableColleges = (all: readonly College[]): College[] => all.filter((c) => c.indexable);
export const findCollege = async (slug: string): Promise<College | undefined> => (await loadBuildColleges()).find((c) => c.slug === slug);
export const COLLEGE_PLACEHOLDER = "__none__";
export async function collegeStaticParams(): Promise<{ slug: string }[]> {
  const all = await loadBuildColleges();
  return all.length ? all.map((c) => ({ slug: c.slug })) : [{ slug: COLLEGE_PLACEHOLDER }];
}
