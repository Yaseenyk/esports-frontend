import { LISTED_GUIDES as GUIDES } from "@/content/guides";
import { v3PublicEntries } from "@/features/shared/flags";
import { COMMUNITIES, EVENTS, GAMES, TOOLS, gameBySlug } from "@/lib/data";

/**
 * Server-only: the search box's index, served as the static file /search-index.json (src/app/search-index.json/route.ts) and fetched
 * by the search box the first time it is used. Never import this from a client component: it pulls in every guide (about 300 KB gzipped).
 */
/** One search index over everything, for the search box. */
export interface Hit {
  kind: "Game" | "Event" | "Community" | "Guide" | "Tool" | "Page";
  title: string;
  sub: string;
  href: string;
  keywords?: string; // extra words the search matches but does not show
}
export const SEARCH_INDEX: Hit[] = [
  ...v3PublicEntries().map((e) => ({ kind: "Page" as const, title: e.label, sub: e.blurb, keywords: e.keywords, href: e.href })), // only the sections that are switched on
  ...GAMES.map((g) => ({ kind: "Game" as const, title: g.name, sub: `${g.platform} · ${g.genre} · ${g.short}`, href: `/games/${g.slug}/` })),
  ...EVENTS.map((e) => ({ kind: "Event" as const, title: e.name, sub: `${gameBySlug(e.game)?.short} · ${e.level} · ${e.mode}`, href: `/events/${e.slug}/` })),
  ...COMMUNITIES.map((c) => ({ kind: "Community" as const, title: c.name, sub: `${c.kind} · ${c.city}`, href: `/communities/${c.slug}/` })),
  ...GUIDES.map((g) => ({ kind: "Guide" as const, title: g.title, sub: `${g.tag} · ${g.minutes} min`, href: `/guides/${g.slug}/` })),
  ...TOOLS.map((t) => ({ kind: "Tool" as const, title: t.name, sub: "Free tool", href: t.href })),
  { kind: "Tool" as const, title: "Arcade: aim trainer and reaction test", sub: "Warm up and earn XP", href: "/arcade/" },
];
