/**
 * Facts behind batch 11, each with where it was read and the day it was checked.
 * Game numbers are labelled as examples in the guides: Krafton's own current rulebook could not be opened (the Liquipedia and talkesport pages
 * returned 403), so the BGMI scale is the one reported by two media sites for BGIS 2024 and is told to organisers as an example to change.
 */
export interface Fact { text: string; source: string; checked: "2026-11-16" }
const f = (text: string, source: string): Fact => ({ text, source, checked: "2026-11-16" });

export const FACTS_B11 = {
  bgisPlacement: f("The 10-point placement scale reported for BGIS 2024 gives 10 points for 1st, 6 for 2nd, 5 for 3rd, 4 for 4th, 3 for 5th, 2 for 6th, 1 each for 7th and 8th, and 0 for 9th to 16th.", "https://sportskeeda.com/bgmi/news-battlegrounds-mobile-india-series-bgis-2024-scoring-system-match-parameters-revealed; https://www.esports.net/news/mobile-games/bgmi-esports-points-table-system"),
  bgisKill: f("In that scale each kill is worth 1 point.", "https://sportskeeda.com/bgmi/news-battlegrounds-mobile-india-series-bgis-2024-scoring-system-match-parameters-revealed"),
  bgmiSquad: f("A BGMI squad match is played by teams of 4 players, with one substitute allowed in one college event rulebook.", "https://sites.google.com/view/cibmrdastralogy2026/events/bgmi (one organiser's rulebook, not Krafton's)"),
  posterSizes: f("The Esports Hub poster maker draws a 4:5 poster at 1080 by 1350 pixels, a 9:16 story at 1080 by 1920 and a square post at 1080 by 1080.", "https://esports.streamerosai.com/tools/poster/ (src/lib/poster-cards.ts, read 2026-11-16)"),
  pointsDefault: f("The points table tool starts from an example scale of 10, 6, 5, 4, 3, 2, 1, 1 with 1 point per kill, and breaks ties by wins, then kills, then last-match placement, then name.", "https://esports.streamerosai.com/tools/points-table/ (src/lib/points.ts, read 2026-11-16)"),
  roundRobinCount: f("A single round robin of n teams has n times (n minus 1) divided by 2 matches.", "Arithmetic; checked against src/lib/roundrobin.ts matchCount, 2026-11-16"),
  a4: f("A4 paper is 210 by 297 millimetres.", "ISO 216 paper sizes, standard knowledge; not opened in this session"),
} as const;
