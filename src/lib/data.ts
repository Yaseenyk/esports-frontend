/**
 * SAMPLE DATA for the interface prototype. Nothing here is a real event, community or result: the names are made up and the
 * dates are blank on purpose. Games are listed with generic facts only (platform and the usual team size). When the app is
 * built, this file is replaced by the database. The site is marked noindex until it carries real content.
 */
export interface Game {
  slug: string;
  name: string;
  short: string;
  platform: "Mobile" | "PC" | "Console";
  genre: string;
  /** Usual team size in organised play. */
  team: string;
  /** Tailwind gradient used for the text badge: we draw our own badges and never use publishers' logos. */
  hue: string;
  blurb: string;
}
export const GAMES: Game[] = [
  { slug: "bgmi", name: "Battlegrounds Mobile India", short: "BGMI", platform: "Mobile", genre: "Battle royale", team: "Squads of 4", hue: "from-amber-400 to-orange-600", blurb: "Squad battle royale on phones. The biggest grassroots circuit for mobile in India." },
  { slug: "free-fire-max", name: "Free Fire MAX", short: "FF MAX", platform: "Mobile", genre: "Battle royale", team: "Squads of 4", hue: "from-rose-400 to-red-600", blurb: "Fast battle royale that runs on modest phones, with a large community-run scene." },
  { slug: "valorant", name: "Valorant", short: "VAL", platform: "PC", genre: "Tactical shooter", team: "5 v 5", hue: "from-red-400 to-pink-600", blurb: "Agent-based 5v5 tactical shooter with a growing campus and open-qualifier scene." },
  { slug: "cs2", name: "Counter-Strike 2", short: "CS2", platform: "PC", genre: "Tactical shooter", team: "5 v 5", hue: "from-sky-400 to-blue-600", blurb: "The long-running 5v5 shooter: leagues, LANs and a deep community-server culture." },
  { slug: "cod-mobile", name: "Call of Duty: Mobile", short: "CODM", platform: "Mobile", genre: "Shooter", team: "5 v 5", hue: "from-lime-400 to-green-600", blurb: "Console-style shooter on mobile, with ranked and tournament play." },
  { slug: "mobile-legends", name: "Mobile Legends: Bang Bang", short: "MLBB", platform: "Mobile", genre: "MOBA", team: "5 v 5", hue: "from-violet-400 to-purple-600", blurb: "Mobile MOBA with a big organised-play scene across South and South-East Asia." },
  { slug: "dota-2", name: "Dota 2", short: "DOTA", platform: "PC", genre: "MOBA", team: "5 v 5", hue: "from-red-500 to-rose-700", blurb: "Deep PC MOBA with long-standing open qualifiers and community leagues." },
  { slug: "ea-fc", name: "EA Sports FC", short: "FC", platform: "Console", genre: "Sports", team: "1 v 1", hue: "from-emerald-400 to-teal-600", blurb: "Football on console and PC. Knockout brackets suit one-day college events." },
  { slug: "clash-royale", name: "Clash Royale", short: "CR", platform: "Mobile", genre: "Strategy", team: "1 v 1", hue: "from-cyan-400 to-indigo-600", blurb: "Quick one-on-one card battles: easy to run as an open bracket." },
  { slug: "fortnite", name: "Fortnite", short: "FN", platform: "Console", genre: "Battle royale", team: "Solo, duos or trios", hue: "from-fuchsia-400 to-violet-600", blurb: "Battle royale with creative modes that communities use for custom events." },
];

export interface EventItem {
  slug: string;
  name: string;
  game: string; // Game.slug
  organiser: string;
  format: string;
  mode: "Online" | "Offline" | "Hybrid";
  level: "Open" | "College" | "Community" | "Pro qualifier";
  slots: string;
  blurb: string;
}
export const EVENTS: EventItem[] = [
  { slug: "sample-campus-cup-bgmi", name: "Sample Campus Cup", game: "bgmi", organiser: "Sample College Esports Club", format: "Squads, 3 lobbies, points table", mode: "Online", level: "College", slots: "100 squads", blurb: "A placeholder event to show how a listing, its rules and its registration button will look." },
  { slug: "sample-open-qualifier-valorant", name: "Sample Open Qualifier", game: "valorant", organiser: "Sample City Gaming Community", format: "Single elimination, best of 1", mode: "Online", level: "Open", slots: "64 teams", blurb: "Placeholder for an open qualifier. Brackets and match times will appear here." },
  { slug: "sample-lan-night-cs2", name: "Sample LAN Night", game: "cs2", organiser: "Sample Gaming Cafe", format: "Group stage then playoffs", mode: "Offline", level: "Community", slots: "16 teams", blurb: "Placeholder for a venue event: check-in, player passes and a printable schedule." },
  { slug: "sample-freefire-showdown", name: "Sample Showdown", game: "free-fire-max", organiser: "Sample Streamers Collective", format: "Squads, 6 matches", mode: "Online", level: "Community", slots: "48 squads", blurb: "Placeholder for a streamer-run custom-room event." },
  { slug: "sample-codm-league", name: "Sample Inter-College League", game: "cod-mobile", organiser: "Sample Esports Federation", format: "Round robin then finals", mode: "Hybrid", level: "College", slots: "24 teams", blurb: "Placeholder for a multi-week league with a points table and a finals day." },
  { slug: "sample-fc-knockout", name: "Sample 1v1 Knockout", game: "ea-fc", organiser: "Sample Campus Fest", format: "Single elimination", mode: "Offline", level: "College", slots: "64 players", blurb: "Placeholder for a one-day fest bracket." },
  { slug: "sample-mlbb-cup", name: "Sample Regional Cup", game: "mobile-legends", organiser: "Sample Regional Community", format: "Double elimination", mode: "Online", level: "Open", slots: "32 teams", blurb: "Placeholder for a regional open cup." },
  { slug: "sample-multi-game-fest", name: "Sample Multi-Game Fest", game: "valorant", organiser: "Sample University", format: "Several games, one fest, one ID system", mode: "Offline", level: "College", slots: "Many", blurb: "Placeholder for a fest that runs several games and needs one set of passes and a shared schedule." },
];

export interface Community {
  slug: string;
  name: string;
  kind: "Esports organisation" | "College club" | "Streaming community" | "Gaming cafe" | "Tournament organiser";
  games: string[];
  city: string;
  blurb: string;
}
export const COMMUNITIES: Community[] = [
  { slug: "sample-esports-org", name: "Sample Esports Organisation", kind: "Esports organisation", games: ["bgmi", "valorant", "cs2"], city: "Sample city", blurb: "Runs rosters in several games. Placeholder profile: teams, staff, achievements and open trials will live here." },
  { slug: "sample-college-club", name: "Sample College Esports Club", kind: "College club", games: ["bgmi", "free-fire-max", "ea-fc"], city: "Sample city", blurb: "A campus club that hosts events and fields teams in inter-college leagues." },
  { slug: "sample-streamers", name: "Sample Streamers Collective", kind: "Streaming community", games: ["free-fire-max", "bgmi", "cod-mobile"], city: "Online", blurb: "Streamers who run custom rooms and community nights together." },
  { slug: "sample-cafe", name: "Sample Gaming Cafe", kind: "Gaming cafe", games: ["cs2", "valorant", "dota-2"], city: "Sample city", blurb: "A venue that hosts LAN nights and local qualifiers." },
  { slug: "sample-organiser", name: "Sample Tournament Organiser", kind: "Tournament organiser", games: ["valorant", "mobile-legends", "clash-royale"], city: "Online", blurb: "Runs open cups across games, with sponsors and brackets." },
  { slug: "sample-federation", name: "Sample Esports Federation", kind: "Tournament organiser", games: ["bgmi", "cod-mobile", "ea-fc"], city: "Sample state", blurb: "A state-level body that runs leagues and publishes rules for them." },
];

export interface Post {
  slug: string;
  title: string;
  tag: "Organiser guide" | "Community" | "Game guide" | "Streaming";
  blurb: string;
  minutes: number;
}
export const POSTS: Post[] = [
  { slug: "sample-run-a-campus-tournament", title: "How to run a campus tournament, step by step", tag: "Organiser guide", blurb: "Sample article: choosing a game, rules, registration, check-in, results and certificates.", minutes: 8 },
  { slug: "sample-player-id-cards", title: "Why every event needs player ID cards and passes", tag: "Organiser guide", blurb: "Sample article: stopping duplicates and proxy players, and speeding up check-in.", minutes: 5 },
  { slug: "sample-points-table", title: "Setting up a fair points table for battle royale events", tag: "Game guide", blurb: "Sample article: placement points, kill points and tie-breakers.", minutes: 6 },
  { slug: "sample-manage-multiple-games", title: "Managing rosters in more than one game", tag: "Community", blurb: "Sample article: one organisation, several teams, one schedule.", minutes: 7 },
  { slug: "sample-stream-your-event", title: "Streaming your own event on a small budget", tag: "Streaming", blurb: "Sample article: scenes, overlays, casters and a run-sheet.", minutes: 9 },
  { slug: "sample-sponsor-pitch", title: "Writing a sponsor pitch for a community event", tag: "Community", blurb: "Sample article: what to include, what to promise, what to report afterwards.", minutes: 6 },
];

export interface Tool {
  slug: string;
  name: string;
  blurb: string;
  status: "Working in this prototype" | "Planned";
  href?: string;
}
export const TOOLS: Tool[] = [
  { slug: "id-cards", name: "ID cards and passes", blurb: "Make printable player, staff and guest cards for an event, with a photo, role and ID number. Works in your browser; nothing is uploaded.", status: "Working in this prototype", href: "/tools/id-cards/" },
  { slug: "brackets", name: "Bracket and points table", blurb: "Single or double elimination, round robin, and battle-royale points tables with tie-breakers.", status: "Planned" },
  { slug: "schedule", name: "Event schedule", blurb: "A run-sheet and match schedule you can share or print.", status: "Planned" },
  { slug: "rosters", name: "Team and roster manager", blurb: "One organisation, several games: players, substitutes, staff and contracts in one place.", status: "Planned" },
  { slug: "registration", name: "Registration forms", blurb: "Collect teams and players, check eligibility, and confirm slots.", status: "Planned" },
  { slug: "certificates", name: "Certificates", blurb: "Winner and participation certificates generated from your results.", status: "Planned" },
];

export const gameBySlug = (slug: string) => GAMES.find((g) => g.slug === slug);

/** One search index over everything, for the search box. */
export interface Hit {
  kind: "Game" | "Event" | "Community" | "Guide" | "Tool";
  title: string;
  sub: string;
  href: string;
}
export const SEARCH_INDEX: Hit[] = [
  ...GAMES.map((g) => ({ kind: "Game" as const, title: g.name, sub: `${g.platform} · ${g.genre} · ${g.short}`, href: `/games/${g.slug}/` })),
  ...EVENTS.map((e) => ({ kind: "Event" as const, title: e.name, sub: `${gameBySlug(e.game)?.short} · ${e.level} · ${e.mode}`, href: `/events/${e.slug}/` })),
  ...COMMUNITIES.map((c) => ({ kind: "Community" as const, title: c.name, sub: `${c.kind} · ${c.city}`, href: `/communities/${c.slug}/` })),
  ...POSTS.map((p) => ({ kind: "Guide" as const, title: p.title, sub: `${p.tag} · ${p.minutes} min`, href: `/guides/` })),
  ...TOOLS.map((t) => ({ kind: "Tool" as const, title: t.name, sub: t.status, href: t.href ?? "/tools/" })),
];
