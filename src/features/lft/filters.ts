/** Board filters <-> the query string. Pure. Unknown or out-of-range values are dropped, never trusted. */
import { EMPTY_FILTERS, GAMES, ROLES, type BoardFilters } from "@/features/lft/domain";

const rank = (v: string | null): string => (v !== null && /^\d{1,3}$/.test(v) && Number(v) <= 100 ? String(Number(v)) : "");
const text = (v: string | null, max: number): string => (v ?? "").replace(/[<>]/g, "").trim().slice(0, max);

export function parseFilters(search: string): BoardFilters {
  const p = new URLSearchParams(search);
  const game = p.get("game") ?? "", kind = p.get("kind") ?? "", role = p.get("role") ?? "";
  return {
    game: GAMES.some((g) => g.value === game) ? game : "",
    kind: kind === "looking_for_team" || kind === "looking_for_player" ? kind : "",
    role: (ROLES as readonly string[]).includes(role) ? role : "",
    rankMin: rank(p.get("rank_min")), rankMax: rank(p.get("rank_max")),
    state: text(p.get("state"), 60), city: text(p.get("city"), 60), online: p.get("online") === "1",
  };
}

/** The page's own query string (`?game=bgmi&online=1`), empty when no filter is set. */
export function filtersToSearch(f: BoardFilters): string {
  const p = new URLSearchParams();
  if (f.game) p.set("game", f.game);
  if (f.kind) p.set("kind", f.kind);
  if (f.role) p.set("role", f.role);
  if (f.rankMin) p.set("rank_min", f.rankMin);
  if (f.rankMax) p.set("rank_max", f.rankMax);
  if (f.state) p.set("state", f.state);
  if (f.city) p.set("city", f.city);
  if (f.online) p.set("online", "1");
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** The API query for GET /public/lft (same names, plus limit and cursor). */
export const filtersToApiQuery = (f: BoardFilters, cursor?: string | null, limit = 20): string => {
  const p = new URLSearchParams(filtersToSearch(f).slice(1));
  p.set("limit", String(limit));
  if (cursor) p.set("cursor", cursor);
  return `?${p.toString()}`;
};

export const hasAnyFilter = (f: BoardFilters): boolean => JSON.stringify(f) !== JSON.stringify(EMPTY_FILTERS);
