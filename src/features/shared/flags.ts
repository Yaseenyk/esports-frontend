/**
 * THE ONE SWITCH for showing v3 sections in the public site's navigation. The value is fixed at build time by `next.config.mjs`
 * (env NEXT_PUBLIC_V3_NAV): empty while the backend flags are off, so nothing new is linked anywhere.
 * To turn links on: switch the backend flag on, then rebuild (the daily deploy does it), or force it with V3_NAV=tournaments,lft,resume,disputes.
 * Routes themselves always exist (noindex, "Not available yet" when their flag is off); this only controls links.
 */
/** Phases 3-5 add "scrims" (flag v3.scrims) and "profiles" (flag v3.profiles: team pages and the shared player profile). */
export type V3Section = "tournaments" | "lft" | "resume" | "disputes" | "scrims" | "profiles" | "calendar";

const ON = new Set((process.env.NEXT_PUBLIC_V3_NAV ?? "").split(",").map((s) => s.trim()).filter(Boolean));
export const v3Enabled = (s: V3Section): boolean => ON.has(s);

export interface NavLink { label: string; href: string }
/** Footer links for the sections that are switched on. Empty array today. */
export function v3FooterLinks(): NavLink[] {
  const all: [V3Section, NavLink][] = [["tournaments", { label: "Tournaments", href: "/tournaments/" }], ["lft", { label: "Find a team", href: "/lft/" }], ["scrims", { label: "Scrims", href: "/scrims/" }], ["calendar", { label: "College calendar", href: "/calendar/" }]];
  return all.filter(([s]) => v3Enabled(s)).map(([, l]) => l);
}

/** The public pages that deserve an entry in the home menu, and the words the menu search should find them by. */
export interface PublicEntry { section: V3Section; label: string; href: string; blurb: string; keywords: string; icon: string }
const PUBLIC_ENTRIES: PublicEntry[] = [
  { section: "lft", label: "Find a team", href: "/lft/", blurb: "Players and teams", keywords: "team find a team player players lft looking for team looking for player recruit", icon: "M16 20v-1a4 4 0 00-4-4H8a4 4 0 00-4 4v1M10 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM20 20v-1a3.5 3.5 0 00-2.5-3.4M16 4.2a3.5 3.5 0 010 6.6" },
  { section: "tournaments", label: "Tournaments", href: "/tournaments/", blurb: "Public tournament pages", keywords: "tournament tournaments create tournament my tournaments organise organiser publish a tournament", icon: "M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3" },
  { section: "scrims", label: "Scrim finder", href: "/scrims/", blurb: "Practice slots", keywords: "scrim scrims practice match find scrims bgmi scrims free fire scrims captain slot", icon: "M4 4l7 7M20 4l-7 7M4 20l6-6M20 20l-6-6M9 12h6" },
  { section: "calendar", label: "College calendar", href: "/calendar/", blurb: "College and fest events", keywords: "calendar college fest events upcoming tournaments near me schedule dates college esports", icon: "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" },
];
/** Public menu and search entries for the sections that are switched on. Empty while the switches are off, so nothing new is shown. `on` is a parameter for tests. */
export function v3PublicEntries(on: (s: V3Section) => boolean = v3Enabled): PublicEntry[] {
  return PUBLIC_ENTRIES.filter((e) => on(e.section));
}
