/**
 * THE ONE SWITCH for showing v3 sections in the public site's navigation. The value is fixed at build time by `next.config.mjs`
 * (env NEXT_PUBLIC_V3_NAV): empty while the backend flags are off, so nothing new is linked anywhere.
 * To turn links on: switch the backend flag on, then rebuild (the daily deploy does it), or force it with V3_NAV=tournaments,lft,resume,disputes.
 * Routes themselves always exist (noindex, "Not available yet" when their flag is off); this only controls links.
 */
export type V3Section = "tournaments" | "lft" | "resume" | "disputes";

const ON = new Set((process.env.NEXT_PUBLIC_V3_NAV ?? "").split(",").map((s) => s.trim()).filter(Boolean));
export const v3Enabled = (s: V3Section): boolean => ON.has(s);

export interface NavLink { label: string; href: string }
/** Footer links for the sections that are switched on. Empty array today. */
export function v3FooterLinks(): NavLink[] {
  const all: [V3Section, NavLink][] = [["tournaments", { label: "Tournaments", href: "/tournaments/" }], ["lft", { label: "Find a team", href: "/lft/" }]];
  return all.filter(([s]) => v3Enabled(s)).map(([, l]) => l);
}
