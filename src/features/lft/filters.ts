/** Board filters <-> the query string. Pure. Unknown or out-of-range values are dropped, never trusted. */
import { EMPTY_FILTERS, GAMES, LANGUAGES, PLAY_HOURS, ROLES, type BoardFilters, type MatchWants } from "@/features/lft/domain";

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
    lang: LANGUAGES.some((l) => l.value === p.get("lang")) ? (p.get("lang") as string) : "",
    hours: PLAY_HOURS.some((h) => h.value === p.get("hours")) ? (p.get("hours") as string) : "",
    sort: p.get("sort") === "match" ? "match" : "",
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
  if (f.lang) p.set("lang", f.lang);
  if (f.hours) p.set("hours", f.hours);
  if (f.sort) p.set("sort", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** The API query for GET /public/lft (same names, plus limit and cursor). */
export const filtersToApiQuery = (f: BoardFilters, cursor?: string | null, limit = 20, wants?: MatchWants): string => {
  const p = new URLSearchParams(filtersToSearch(f).slice(1));
  p.set("limit", String(limit));
  if (cursor && f.sort !== "match") p.set("cursor", cursor);
  if (f.sort === "match" && wants) {
    if (wants.roles.length) p.set("want_roles", wants.roles.slice(0, 4).join(","));
    if (wants.languages.length) p.set("want_langs", wants.languages.slice(0, 5).join(","));
    if (wants.hours.length) p.set("want_hours", wants.hours.slice(0, 5).join(","));
  }
  return `?${p.toString()}`;
};

/** My "what I look for" choices, from storage text. Unknown codes are dropped. Pure. */
export function parseWants(raw: string | null): MatchWants {
  try {
    const v = JSON.parse(raw ?? "{}") as Record<string, unknown>;
    const pick = (x: unknown, ok: readonly string[], max: number) => (Array.isArray(x) ? x.filter((y): y is string => typeof y === "string" && ok.includes(y)).slice(0, max) : []);
    return { roles: pick(v.roles, ROLES, 4), languages: pick(v.languages, LANGUAGES.map((l) => l.value), 5), hours: pick(v.hours, PLAY_HOURS.map((h) => h.value), 5) };
  } catch { return { roles: [], languages: [], hours: [] }; }
}

export const hasAnyFilter = (f: BoardFilters): boolean => JSON.stringify(f) !== JSON.stringify(EMPTY_FILTERS);
