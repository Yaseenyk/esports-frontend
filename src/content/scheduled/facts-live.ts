/**
 * Facts the ten live-now guides rely on, each with where it was read and the day it was opened (16 Nov 2026).
 * Same shape as facts.ts. Official rulebooks change every season: guides say "in the rulebook we read" and tell
 * organisers to follow the current rulebook of the game they run.
 */
export interface FactLive { text: string; source: string; checked: "2026-11-16" }
const f = (text: string, source: string): FactLive => ({ text, source, checked: "2026-11-16" });

export const FACTS_LIVE = {
  bgmiPlacement: f(
    "A published BGMI esports points table gives 10 points for first place, 6 for second, 5 for third, 4 for fourth, 3 for fifth, 2 for sixth, 1 each for seventh and eighth, and 0 for ninth to sixteenth.",
    "https://www.esports.net/news/mobile-games/bgmi-esports-points-table-system (opened 2026-11-16); same 10-6-5-4-3-2-1-1 table reported for Liquipedia's BGMI Challengers Series page via search results",
  ),
  bgmiKill: f(
    "In that table a team earns one finish point for every finish (kill), and the team with the highest sum of finish points and placement points wins the match.",
    "https://www.esports.net/news/mobile-games/bgmi-esports-points-table-system (opened 2026-11-16)",
  ),
  bgmiTiebreakUnverified: f(
    "A full BGMI tie-break order could not be confirmed from an official rulebook, so the guides label any tie-break as an example the organiser sets.",
    "Searches on 2026-11-16 found no official BGMI tie-break text; sources say to check the rulebook of the specific event",
  ),
  ffPlacement: f(
    "The FFWS MEA 2025 official rulebook scores a Free Fire battle royale match with 1 point per elimination and placement points of 12 for 1st, 9 for 2nd, 8 for 3rd, 7 for 4th, 6 for 5th, 5 for 6th, 4 for 7th, 3 for 8th, 2 for 9th, 1 for 10th and 0 for 11th and 12th.",
    "https://liquipedia.net/commons/images/b/bf/FFWS_MEA_2025_Rulebook_(English).pdf section 3.1 Scoring Table (opened 2026-11-16; 1st to 9th also match Liquipedia's Free Fire Honor Elite 2026 Spring listing seen in search results)",
  ),
  ffTiebreak: f(
    "In that rulebook, teams tied on points are ranked first by the number of Booyahs, then by total eliminations, then by placement in the last game of the series.",
    "https://liquipedia.net/commons/images/b/bf/FFWS_MEA_2025_Rulebook_(English).pdf section 3.1.1 (opened 2026-11-16)",
  ),
  ffFormat: f(
    "In FFWS MEA 2025, a qualifier stage had 12 teams playing 6 battle royale matches in one day, and the top 8 teams in the overall standings advanced.",
    "https://liquipedia.net/commons/images/b/bf/FFWS_MEA_2025_Rulebook_(English).pdf section 1 (opened 2026-11-16)",
  ),
  ffRoster: f(
    "The FFWS MEA 2025 rulebook sets a roster of 5 players for a 4-player team, a minimum of 3 rostered players for non-invited teams, at most 2 import players, and says the roster must be final before a published deadline.",
    "https://liquipedia.net/commons/images/b/bf/FFWS_MEA_2025_Rulebook_(English).pdf section 2.1.3 (opened 2026-11-16)",
  ),
  ffSettings: f(
    "The FFWS MEA 2025 game configuration had revival on, in-game mission on, in-match quest off, high tier loot zone off, death cam on, safe zone moving on, standardised opponent costumes, hidden player nicknames and kill feed, and a rule that each player on a team brings a different active skill.",
    "https://liquipedia.net/commons/images/b/bf/FFWS_MEA_2025_Rulebook_(English).pdf section 3.2 (opened 2026-11-16)",
  ),
  ffSubs: f(
    "In that rulebook, a team must tell the referees about a substitution immediately after a match ends, and no substitution is accepted 2 minutes after a match ends.",
    "https://liquipedia.net/commons/images/b/bf/FFWS_MEA_2025_Rulebook_(English).pdf section 6.2.2 (opened 2026-11-16)",
  ),
  ffViolations: f(
    "The same rulebook lists collusion, hacking, exploiting bugs, looking at spectator monitors or other participants' phones, unauthorised software or devices, deliberate in-game suicide to deny kill points, and deliberately disconnecting from a match as violations.",
    "https://liquipedia.net/commons/images/b/bf/FFWS_MEA_2025_Rulebook_(English).pdf disciplinary action section (opened 2026-11-16)",
  ),
  ffPenalties: f(
    "That rulebook sets team penalties in three bands: minor is 15 points off the daily standings and/or 5 to 10 percent of prize money, moderate is 30 points and/or 10 to 20 percent, and major is disqualification and the entire prize money.",
    "https://liquipedia.net/commons/images/b/bf/FFWS_MEA_2025_Rulebook_(English).pdf list of penalties (opened 2026-11-16)",
  ),
  ffRestart: f(
    "In its Clash Squad restart rule, the rulebook allows only one restart request per match, and the head referee has the final decision.",
    "https://liquipedia.net/commons/images/b/bf/FFWS_MEA_2025_Rulebook_(English).pdf section 4.2 (opened 2026-11-16)",
  ),
  codRoster: f(
    "The Call of Duty: Mobile World Championship rules require five players on a team, with an optional sixth substitute player, and a roster of no more than six including the substitute.",
    "https://www.callofduty.com/mobile/esports/rules sections 3.4.12 and 4.2.1 (opened 2026-11-16)",
  ),
  codDevices: f(
    "The same rules require players to compete on an eligible mobile phone or tablet, forbid external controllers, mice and keyboards without consent, and forbid emulators; phone cases and fans are allowed if they do not plug in or give inputs.",
    "https://www.callofduty.com/mobile/esports/rules operating systems and devices section (opened 2026-11-16)",
  ),
  codLineup: f(
    "The rules allow teams to change the starting lineup between matches but not during a match.",
    "https://www.callofduty.com/mobile/esports/rules section 5.3.5 (opened 2026-11-16)",
  ),
  codDisconnect: f(
    "If a player disconnects in the first 30 seconds or before the first kill, the game is ended and restarted; after that the game continues and the player rejoins, and the officials make the final call.",
    "https://www.callofduty.com/mobile/esports/rules section 5.3.10 (opened 2026-11-16)",
  ),
  codDraw: f(
    "In the rules' qualifier stages, a ranked match that ends in a draw counts as a loss for both teams and is not replayed.",
    "https://www.callofduty.com/mobile/esports/rules section 5.3.7 (opened 2026-11-16)",
  ),
  codSeries: f(
    "In the World Championship Finals, matches other than the Grand Final are best of five and the Grand Final is best of seven, with the winners bracket team starting one map ahead.",
    "https://www.callofduty.com/mobile/esports/rules finals format section (opened 2026-11-16)",
  ),
  codIntegrity: f(
    "The rules name collusion and match fixing, DDoS attacks, playing on an account that is not yours, ghosting, unauthorised items, and abuse of servers as cheating or integrity violations.",
    "https://www.callofduty.com/mobile/esports/rules section 7.2 (opened 2026-11-16)",
  ),
  codSettings: f(
    "Game settings for the later stages are published on a separate Call of Duty: Mobile esports settings page, and the publisher can change modes and settings between events.",
    "https://www.callofduty.com/mobile/esports/rules section 5.3.6 (opened 2026-11-16)",
  ),
} as const;
