/** Resume form rules (API.md section 3). Pure. The server is the authority; these only save a round trip. */
import type { GameForm, ProfileForm } from "@/features/resume/domain";

export const checkSlug = (s: string): string => {
  const t = s.trim().toLowerCase();
  if (t.length < 3 || t.length > 60) return "Use 3 to 60 characters.";
  if (!/^[a-z0-9-]+$/.test(t)) return "Only letters a-z, digits and hyphens.";
  if (t.startsWith("-") || t.endsWith("-")) return "Do not start or end with a hyphen.";
  if (t.includes("--")) return "Use single hyphens only.";
  return "";
};

export const splitLanguages = (s: string): string[] => s.split(",").map((x) => x.trim()).filter(Boolean);

export type ProfileErrors = Partial<Record<keyof ProfileForm, string>>;
export function validateProfile(f: ProfileForm, creating: boolean): ProfileErrors {
  const e: ProfileErrors = {};
  if (creating || f.slug) { const m = checkSlug(f.slug); if (m) e.slug = m; }
  const h = f.handle.trim();
  if (h.length < 2 || h.length > 40) e.handle = "Use 2 to 40 characters.";
  if (/[<>]/.test(f.bio + f.handle + f.city + f.state + f.languages)) e.bio = "Plain text only: remove the < and > characters.";
  if (Array.from(f.bio).length > 400) e.bio = "At most 400 characters.";
  if (f.city.length > 60) e.city = "At most 60 characters.";
  if (f.state.length > 60) e.state = "At most 60 characters.";
  const langs = splitLanguages(f.languages);
  if (langs.length > 6) e.languages = "At most 6 languages.";
  else if (langs.some((l) => l.length > 20)) e.languages = "Each language is at most 20 characters.";
  return e;
}

/** `Diamond 3` -> `diamond_3`: the server wants `[a-z0-9_]`, up to 24 characters. */
export const toRankCode = (name: string): string => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24);

export type GameErrors = Partial<Record<keyof GameForm, string>>;
export function validateGame(f: GameForm): GameErrors {
  const e: GameErrors = {};
  if (!f.game) e.game = "Choose a game.";
  const n = f.inGameName.trim();
  if (n.length < 1 || n.length > 40) e.inGameName = "Use 1 to 40 characters.";
  if (/[<>]/.test(n)) e.inGameName = "Plain text only.";
  if (!toRankCode(f.rankName)) e.rankName = "Enter your rank, for example Diamond 3.";
  if (!/^\d{1,3}$/.test(f.rankOrdinal) || Number(f.rankOrdinal) > 100) e.rankOrdinal = "A whole number from 0 to 100.";
  if (f.roles.length > 4) e.roles = "Pick at most 4 roles.";
  return e;
}

export const profileBody = (f: ProfileForm, creating: boolean): Record<string, unknown> => ({
  ...(creating || f.slug ? { slug: f.slug.trim().toLowerCase() } : {}), handle: f.handle.trim(), bio: f.bio.trim() || null,
  city: f.city.trim() || null, state: f.state.trim() || null, languages: splitLanguages(f.languages),
});
export const gameBody = (f: GameForm) => ({ inGameName: f.inGameName.trim(), rankCode: toRankCode(f.rankName), rankOrdinal: Number(f.rankOrdinal), roles: f.roles });

/** Public can be chosen only with the 18+ confirmation AND consent. Unlisted is reserved by the API. */
export const canChoose = (v: "private" | "unlisted" | "public", adult: boolean, consent: boolean): boolean => v === "private" || (v === "public" && adult && consent);

/** `diamond_3` + 70 -> `Diamond 3 (skill level 70)`. The typed rank with a capital, then the 0 to 100 level. */
export const rankLabel = (rankCode: string, level: number): string => {
  const name = rankCode.replace(/_/g, " ").trim();
  return `${name ? name.charAt(0).toUpperCase() + name.slice(1) : "Unranked"} (skill level ${level})`;
};
