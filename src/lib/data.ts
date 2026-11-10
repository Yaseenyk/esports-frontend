import { GUIDES } from "@/content/guides";
/**
 * DEMO DATA for the interface prototype. Nothing here is a real event, community or result: the names, dates, fees and prizes are
 * invented to show how the site will look when it is full. Games are listed with generic facts only (platform and the usual team size). When the app is
 * built, this file is replaced by the database. The site is marked noindex until it carries real content.
 */
export interface Game {
  slug: string;
  name: string;
  short: string;
  platform: "Mobile" | "PC" | "Console" | "Cross-platform";
  genre: string;
  /** Usual team size in organised play. */
  team: string;
  /** Tailwind gradient used for the text badge: we draw our own badges and never use publishers' logos. */
  hue: string;
  blurb: string;
}
/** Games whose official store icon is in public/games/<slug>.webp (192 px). Drop a file there and add the slug to use another. */
export const LOGOS = new Set(["bgmi", "free-fire-max", "valorant", "cs2", "cod-mobile", "mobile-legends", "dota-2", "ea-fc", "clash-royale", "fortnite", "minecraft", "roblox", "gta-v", "among-us", "fall-guys", "apex-legends", "pubg", "overwatch-2", "rainbow-six-siege", "rocket-league", "tekken-8", "street-fighter-6", "brawl-stars", "clash-of-clans", "pokemon-unite", "genshin-impact", "wild-rift", "chess"]);
export const GAMES: Game[] = [
  { slug: "bgmi", name: "Battlegrounds Mobile India", short: "BGMI", platform: "Mobile", genre: "Battle royale", team: "Squads of 4", hue: "from-amber-400 to-orange-600", blurb: "Squad battle royale on phones. The biggest grassroots circuit for mobile in India." },
  { slug: "free-fire-max", name: "Free Fire MAX", short: "FF MAX", platform: "Mobile", genre: "Battle royale", team: "Squads of 4", hue: "from-rose-400 to-red-600", blurb: "Fast battle royale that runs on modest phones, with a large community-run scene." },
  { slug: "valorant", name: "Valorant", short: "VAL", platform: "PC", genre: "Tactical shooter", team: "5 v 5", hue: "from-red-400 to-pink-600", blurb: "Agent-based 5v5 tactical shooter with a growing campus and open-qualifier scene." },
  { slug: "cs2", name: "Counter-Strike 2", short: "CS2", platform: "PC", genre: "Tactical shooter", team: "5 v 5", hue: "from-sky-400 to-blue-600", blurb: "The long-running 5v5 shooter: leagues, LANs and a deep community-server culture." },
  { slug: "cod-mobile", name: "Call of Duty: Mobile", short: "CODM", platform: "Mobile", genre: "Shooter", team: "5 v 5", hue: "from-lime-400 to-green-600", blurb: "Console-style shooter on mobile, with ranked and tournament play." },
  { slug: "mobile-legends", name: "Mobile Legends: Bang Bang", short: "MLBB", platform: "Mobile", genre: "MOBA", team: "5 v 5", hue: "from-violet-400 to-purple-600", blurb: "Mobile MOBA with a big organised-play scene across South and South-East Asia." },
  { slug: "dota-2", name: "Dota 2", short: "DOTA", platform: "PC", genre: "MOBA", team: "5 v 5", hue: "from-red-500 to-rose-700", blurb: "Deep PC MOBA with long-standing open qualifiers and community leagues." },
  { slug: "ea-fc", name: "EA Sports FC", short: "FC", platform: "Cross-platform", genre: "Sports", team: "1 v 1", hue: "from-emerald-400 to-teal-600", blurb: "Football on console and PC. Knockout brackets suit one-day college events." },
  { slug: "clash-royale", name: "Clash Royale", short: "CR", platform: "Mobile", genre: "Strategy", team: "1 v 1", hue: "from-cyan-400 to-indigo-600", blurb: "Quick one-on-one card battles: easy to run as an open bracket." },
  { slug: "fortnite", name: "Fortnite", short: "FN", platform: "Cross-platform", genre: "Battle royale", team: "Solo, duos or trios", hue: "from-fuchsia-400 to-violet-600", blurb: "Battle royale with creative modes that communities use for custom events." },
  { slug: "minecraft", name: "Minecraft", short: "Minecraft", platform: "Cross-platform", genre: "Sandbox", team: "Any size", hue: "from-green-400 to-emerald-700", blurb: "Build, survive and compete on servers. Communities run build battles, survival games and mini-game nights." },
  { slug: "roblox", name: "Roblox", short: "Roblox", platform: "Cross-platform", genre: "Sandbox", team: "Any size", hue: "from-sky-400 to-blue-700", blurb: "Millions of player-made games in one app, popular for community events and creator showcases." },
  { slug: "gta-v", name: "Grand Theft Auto V", short: "GTA V", platform: "PC", genre: "Open world", team: "Crews of any size", hue: "from-lime-400 to-green-700", blurb: "Open-world game with large roleplay and racing communities that run organised sessions." },
  { slug: "among-us", name: "Among Us", short: "AMONG", platform: "Cross-platform", genre: "Party", team: "4 to 15 players", hue: "from-red-400 to-rose-700", blurb: "Social deduction party game, easy to run as a fun community night or fest side event." },
  { slug: "fall-guys", name: "Fall Guys", short: "FALL", platform: "Cross-platform", genre: "Party", team: "Solo or squads", hue: "from-pink-400 to-fuchsia-600", blurb: "Colourful party battle royale that works well for relaxed creator and community events." },
  { slug: "apex-legends", name: "Apex Legends", short: "APEX", platform: "Cross-platform", genre: "Battle royale", team: "Trios", hue: "from-red-500 to-orange-600", blurb: "Fast hero battle royale played in trios, with an active competitive scene." },
  { slug: "pubg", name: "PUBG: Battlegrounds", short: "PUBG", platform: "PC", genre: "Battle royale", team: "Squads of 4", hue: "from-amber-500 to-yellow-700", blurb: "The original PC battle royale, with squad and solo custom lobbies for events." },
  { slug: "overwatch-2", name: "Overwatch 2", short: "OW2", platform: "Cross-platform", genre: "Hero shooter", team: "5 v 5", hue: "from-orange-400 to-amber-600", blurb: "Team hero shooter with organised open cups and community leagues." },
  { slug: "rainbow-six-siege", name: "Rainbow Six Siege", short: "R6", platform: "Cross-platform", genre: "Tactical shooter", team: "5 v 5", hue: "from-yellow-400 to-amber-700", blurb: "Tactical attacker-versus-defender shooter with a long-running competitive scene." },
  { slug: "rocket-league", name: "Rocket League", short: "RL", platform: "Cross-platform", genre: "Sports", team: "3 v 3", hue: "from-blue-400 to-indigo-600", blurb: "Rocket-powered football: quick matches that suit knockout brackets." },
  { slug: "tekken-8", name: "Tekken 8", short: "TK8", platform: "Console", genre: "Fighting", team: "1 v 1", hue: "from-red-600 to-zinc-800", blurb: "3D fighting game: brackets and side events at community meetups." },
  { slug: "street-fighter-6", name: "Street Fighter 6", short: "SF6", platform: "Cross-platform", genre: "Fighting", team: "1 v 1", hue: "from-orange-500 to-red-700", blurb: "Classic fighting game with a big community of local weekly events." },
  { slug: "brawl-stars", name: "Brawl Stars", short: "BRAWL", platform: "Mobile", genre: "Brawler", team: "3 v 3", hue: "from-yellow-300 to-orange-500", blurb: "Fast 3v3 brawler on phones, popular in school and college events." },
  { slug: "clash-of-clans", name: "Clash of Clans", short: "COC", platform: "Mobile", genre: "Strategy", team: "Clans of up to 50", hue: "from-amber-400 to-yellow-700", blurb: "Clan-based village strategy game with clan wars and friendly community matches." },
  { slug: "pokemon-unite", name: "Pokémon UNITE", short: "UNITE", platform: "Mobile", genre: "MOBA", team: "5 v 5", hue: "from-yellow-300 to-purple-600", blurb: "Team battle game with Pokémon, with an organised scene on mobile and Switch." },
  { slug: "genshin-impact", name: "Genshin Impact", short: "GI", platform: "Cross-platform", genre: "Action RPG", team: "Co-op, up to 4", hue: "from-sky-300 to-indigo-500", blurb: "Open-world action RPG with large fan communities and creator events." },
  { slug: "wild-rift", name: "League of Legends: Wild Rift", short: "WR", platform: "Mobile", genre: "MOBA", team: "5 v 5", hue: "from-cyan-400 to-blue-700", blurb: "Mobile version of the LoL-style MOBA with growing organised play." },
  { slug: "chess", name: "Chess", short: "CHESS", platform: "Cross-platform", genre: "Board", team: "1 v 1", hue: "from-lime-500 to-green-800", blurb: "Online chess: the easiest game to run as an open knockout for any community." },
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
  date: string;
  venue: string;
  fee: string;
  prize: string;
  blurb: string;
}
/** Demo events. The names, organisers, dates and prizes are invented for this prototype. */
export const EVENTS: EventItem[] = [
  { slug: "monsoon-clash-s2", name: "Monsoon Clash Season 2", game: "bgmi", organiser: "Konkan Gamers Guild", format: "Squads, 3 lobbies, points table", mode: "Online", level: "College", slots: "100 squads", date: "12 to 13 Dec 2026", venue: "Online, custom rooms", fee: "Rs 200 per squad", prize: "Rs 25,000", blurb: "Two days of squad battles for college teams. Placement and kill points, with a final lobby for the top 25." },
  { slug: "pune-valorant-campus-open", name: "Pune Campus Open", game: "valorant", organiser: "Pune Phantoms Esports", format: "Single elimination, best of 1", mode: "Online", level: "Open", slots: "64 teams", date: "20 Dec 2026", venue: "Online", fee: "Free", prize: "Rs 15,000 and merch", blurb: "Open qualifier for the winter campus series. Brackets go live the night before." },
  { slug: "pixel-arena-lan-night", name: "Pixel Arena LAN Night", game: "cs2", organiser: "Pixel Arena Gaming Cafe", format: "Group stage then playoffs", mode: "Offline", level: "Community", slots: "16 teams", date: "9 Jan 2027", venue: "Pixel Arena, Pune", fee: "Rs 500 per team", prize: "Rs 20,000", blurb: "A full day on the cafe's LAN setup. Check-in with player passes, then groups, playoffs and a live final." },
  { slug: "streamers-showdown-ff", name: "Streamers Showdown", game: "free-fire-max", organiser: "Mumbai Mavericks Collective", format: "Squads, 6 matches", mode: "Online", level: "Community", slots: "48 squads", date: "17 Jan 2027", venue: "Online, streamed live", fee: "Rs 100 per squad", prize: "Rs 10,000", blurb: "Creators and viewers squad up in custom rooms while the collective streams every match." },
  { slug: "wice-codm-league", name: "Inter-College CODM League", game: "cod-mobile", organiser: "Western India Collegiate Esports Federation", format: "Round robin then finals", mode: "Hybrid", level: "College", slots: "24 teams", date: "Jan to Feb 2027", venue: "Online, finals in Pune", fee: "Rs 300 per team", prize: "Rs 40,000 and trophies", blurb: "A five-week league with a points table, then a finals day at a host campus." },
  { slug: "sahyadri-fc-knockout", name: "Fest FC Knockout", game: "ea-fc", organiser: "Sahyadri University Fest Committee", format: "Single elimination", mode: "Offline", level: "College", slots: "64 players", date: "14 Feb 2027", venue: "Sahyadri University, Kolhapur", fee: "Rs 100", prize: "Rs 12,000", blurb: "One-day one-on-one bracket as part of the annual tech fest." },
  { slug: "konkan-mlbb-cup", name: "Konkan Regional Cup", game: "mobile-legends", organiser: "Konkan Gamers Guild", format: "Double elimination", mode: "Online", level: "Open", slots: "32 teams", date: "27 Feb 2027", venue: "Online", fee: "Rs 250 per team", prize: "Rs 18,000", blurb: "Regional open cup with a lower-bracket second chance." },
  { slug: "sahyadri-techfest-arena", name: "Techfest Arena", game: "valorant", organiser: "Sahyadri University Fest Committee", format: "Several games, one fest, one ID system", mode: "Offline", level: "College", slots: "Many", date: "13 to 15 Feb 2027", venue: "Sahyadri University, Kolhapur", fee: "Per game", prize: "Rs 1,00,000 pool", blurb: "Three days, five games, one shared schedule and one set of passes for every participant." },
  { slug: "craft-and-chill-villages", name: "Build Battle: Fantasy Villages", game: "minecraft", organiser: "Craft & Chill Creators", format: "Timed theme, judged by the community", mode: "Online", level: "Community", slots: "40 builders", date: "6 Dec 2026", venue: "Online, creative server", fee: "Free", prize: "Server perks and shoutouts", blurb: "Builders get 90 minutes and a theme. The community votes, and the top builds are featured on the server." },
  { slug: "obby-night-roblox", name: "Obby Night", game: "roblox", organiser: "Sahyadri University Fest Committee", format: "Rounds on a shared course", mode: "Online", level: "College", slots: "Open", date: "19 Dec 2026", venue: "Online", fee: "Free", prize: "Goodies", blurb: "A relaxed evening of obstacle courses, with spot prizes for the fastest and the funniest falls." },
  { slug: "winter-drop-apex", name: "Winter Drop Trios Cup", game: "apex-legends", organiser: "Western India Collegiate Esports Federation", format: "Trios, 5 matches, points table", mode: "Online", level: "Open", slots: "20 trios", date: "5 Dec 2026", venue: "Online", fee: "Rs 150 per trio", prize: "Rs 8,000", blurb: "Five matches, ranked by placement and eliminations." },
  { slug: "rocket-weekender", name: "3v3 Weekender", game: "rocket-league", organiser: "Pixel Arena Gaming Cafe", format: "Double elimination", mode: "Hybrid", level: "Community", slots: "16 teams", date: "23 to 24 Jan 2027", venue: "Pixel Arena, Pune, and online", fee: "Rs 300 per team", prize: "Rs 12,000", blurb: "Weekend bracket with an in-person final at the cafe." },
  { slug: "rapid-rumble-chess", name: "Rapid Rumble Online Open", game: "chess", organiser: "Western India Collegiate Esports Federation", format: "Swiss rounds then knockout", mode: "Online", level: "Open", slots: "128 players", date: "29 Nov 2026", venue: "Online", fee: "Free", prize: "Rs 5,000", blurb: "Eight rapid rounds, then a top-16 knockout. Anyone can enter." },
  { slug: "fight-night-weekly-14", name: "Fight Night Weekly #14", game: "street-fighter-6", organiser: "Dojo 91 Fighting Club", format: "Double elimination, best of 3", mode: "Offline", level: "Community", slots: "32 players", date: "Every Saturday", venue: "Dojo 91, Mumbai", fee: "Rs 150", prize: "Pot bonus", blurb: "The weekly local. Pools in the afternoon, top eight on the big screen." },
  { slug: "impostor-night", name: "Impostor Night", game: "among-us", organiser: "Mumbai Mavericks Collective", format: "Lobbies of 10, several rounds", mode: "Online", level: "Community", slots: "60 players", date: "10 Jan 2027", venue: "Online, streamed live", fee: "Free", prize: "Shoutouts", blurb: "A social night where viewers play with the streamers." },
];

export interface Community {
  slug: string;
  name: string;
  kind: "Esports organisation" | "College club" | "Streaming community" | "Gaming cafe" | "Tournament organiser";
  games: string[];
  city: string;
  blurb: string;
}
/** Demo communities. All invented. */
export const COMMUNITIES: Community[] = [
  { slug: "konkan-gamers-guild", name: "Konkan Gamers Guild", kind: "Esports organisation", games: ["bgmi", "mobile-legends", "free-fire-max"], city: "Ratnagiri", blurb: "A coastal community that fields squads in three mobile games and runs a monthly open cup." },
  { slug: "pune-phantoms", name: "Pune Phantoms Esports", kind: "Esports organisation", games: ["valorant", "cs2", "bgmi"], city: "Pune", blurb: "A semi-pro organisation with rosters in three games, open trials every quarter and a student academy." },
  { slug: "mumbai-mavericks", name: "Mumbai Mavericks Collective", kind: "Streaming community", games: ["free-fire-max", "among-us", "cod-mobile"], city: "Mumbai", blurb: "Twelve creators who stream together, run viewer nights and host a monthly showdown." },
  { slug: "pixel-arena", name: "Pixel Arena Gaming Cafe", kind: "Gaming cafe", games: ["cs2", "valorant", "rocket-league"], city: "Pune", blurb: "A 40-seat LAN cafe that hosts weekend brackets and local qualifiers." },
  { slug: "wicef", name: "Western India Collegiate Esports Federation", kind: "Tournament organiser", games: ["cod-mobile", "apex-legends", "chess"], city: "Pune", blurb: "Runs inter-college leagues across the region and publishes one rulebook for all of them." },
  { slug: "sahyadri-fest-committee", name: "Sahyadri University Fest Committee", kind: "College club", games: ["valorant", "ea-fc", "roblox"], city: "Kolhapur", blurb: "The student team behind the annual tech fest, which adds an esports arena every year." },
  { slug: "craft-and-chill", name: "Craft & Chill Creators", kind: "Streaming community", games: ["minecraft", "roblox", "among-us"], city: "Online", blurb: "Builders and storytellers who run a creative Minecraft server and weekly game nights." },
  { slug: "dojo-91", name: "Dojo 91 Fighting Club", kind: "Gaming cafe", games: ["street-fighter-6", "tekken-8"], city: "Mumbai", blurb: "A fighting-game club with a weekly local and a monthly ranked ladder." },
];

export interface Post {
  slug: string;
  title: string;
  tag: "Organiser guide" | "Community" | "Game guide" | "Streaming";
  blurb: string;
  minutes: number;
}

export interface Tool {
  slug: string;
  name: string;
  blurb: string;
  href: string;
}
/** The free tools. Only tools that work today are listed. */
export const TOOLS: Tool[] = [
  { slug: "id-cards", name: "ID card maker", blurb: "Make player and event ID cards with signed QR passes. Free, in your browser, no account.", href: "/tools/id-cards/" },
  { slug: "brackets", name: "Bracket maker", blurb: "Paste your teams, get a seeded single-elimination bracket with byes, and click winners forward.", href: "/tools/brackets/" },
  { slug: "points-table", name: "Points table calculator", blurb: "Battle royale placement and kill points with tie-breakers, ranked standings and CSV export.", href: "/tools/points-table/" },
  { slug: "double-elimination", name: "Double elimination bracket", blurb: "Winners and losers brackets with a grand final and reset, byes for any number of teams, and click-to-advance results.", href: "/tools/double-elimination/" },
  { slug: "registration", name: "Registration form", blurb: "A ready-to-copy team registration form, or a link that collects teams and adds approved ones to your roster.", href: "/tools/registration/" },
  { slug: "round-robin", name: "Round robin generator", blurb: "Fixtures for every team playing every other team, with results entry and a league table.", href: "/tools/round-robin/" },
  { slug: "schedule", name: "Match schedule maker", blurb: "Turn a number of matches, lobbies and break times into a timed run-sheet you can download.", href: "/tools/schedule/" },
  { slug: "certificates", name: "Certificate maker", blurb: "Winner and participation certificates, one per name, as a single print-ready PDF.", href: "/tools/certificates/" },
  { slug: "check-in", name: "Gate check-in scanner", blurb: "Scan QR passes at the gate, online or offline. Fake and copied passes are rejected.", href: "/tools/check-in/" },
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
  ...GUIDES.map((g) => ({ kind: "Guide" as const, title: g.title, sub: `${g.tag} · ${g.minutes} min`, href: `/guides/${g.slug}/` })),
  ...TOOLS.map((t) => ({ kind: "Tool" as const, title: t.name, sub: "Free tool", href: t.href })),
  { kind: "Tool" as const, title: "Arcade: aim trainer and reaction test", sub: "Warm up and earn XP", href: "/arcade/" },
];
