/**
 * Facts used by the batch 12 guides, each with the page it was read on and the day it was checked (16 Nov 2026).
 * Rules differ by organiser and change by season. Guides present these as one real rulebook's values (an example),
 * and tell organisers to follow the current official rulebook for their own event.
 */
export interface FactB12 { text: string; source: string; checked: "2026-11-16" }
const f = (text: string, source: string): FactB12 => ({ text, source, checked: "2026-11-16" });

const PMNC = "https://liquipedia.net/commons/images/b/b2/2025_PMNC_Qatar_Rulebook.pdf (2025 PMNC Qatar rulebook, section 4.1 Scoring, 4.2 Tiebreaker Criteria, 2.x team rosters)";
const IESF = "https://nf.iesf.org/ynopsifa/2024/02/eFootball%E2%84%A2-Rulebook-National-Qualifier-2024.pdf (IESF eFootball Rulebook, National Qualifier 2024, latest update 15/01/2024, sections 2, 5, 8, 10, 11, 13)";

export const FACTS_B12 = {
  pubgmPlacement: f("In the 2025 PMNC Qatar rulebook, placement points are 10 for first, 6 for second, 5 for third, 4 for fourth, 3 for fifth, 2 for sixth, 1 each for seventh and eighth, and 0 for ninth to sixteenth, with 1 point for each elimination.", PMNC),
  pubgmTiebreak: f("The same rulebook breaks ties in this order: first-place finishes, then total placement points, then total eliminations, then the placement in the most recent match.", PMNC),
  pubgmRoster: f("That rulebook requires a roster of 5 to 6 players, where players beyond four act as substitutes.", PMNC),
  efootballSettings: f("The IESF eFootball 2024 National Qualifier rulebook sets match time to 10 minutes, extra time off, injuries off, 5 substitutes, and penalty shootouts on (off in the group stage).", IESF),
  efootballPauses: f("The same rulebook lets a player pause only while the ball is out of play, at most 3 times per half and 180 seconds in total.", IESF),
  efootballPrep: f("The same rulebook gives 5 minutes of preparation before the start time and 5 to 10 minutes between games, and penalises a player who is not ready within 10 minutes of the match start time.", IESF),
  efootballResults: f("The same rulebook requires online players to take a screenshot of the result and confirm it with the referee, and a result the referee has not confirmed is not counted.", IESF),
  efootballTiebreak: f("For group-stage ties on win-loss difference, the same rulebook looks only at matches between the tied players: head-to-head result, then goal difference, then goals scored.", IESF),
  cs2Rounds: f("CS2 competitive is capped at 24 rounds in regulation (12 per half), with a 6-round overtime if the score is tied.", "https://www.hltv.org/news/36967/the-logic-behind-valves-move-to-mr12 (HLTV, Valve's move to MR12)"),
} as const;
