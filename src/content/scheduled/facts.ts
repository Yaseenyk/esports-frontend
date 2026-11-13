/**
 * Facts the scheduled guides rely on, each with where it was read and the day it was checked (14 Nov 2026).
 * A guide that needs a game or sport number takes it from here, so there is one place to correct when a rule changes.
 * Rules and modes change often. Guides say "at the time of writing" and tell organisers to read the current rulebook.
 */
export interface Fact { text: string; source: string; checked: "2026-11-14" }
const f = (text: string, source: string): Fact => ({ text, source, checked: "2026-11-14" });

export const FACTS = {
  bgmi: f("A BGMI classic match has up to 100 players, in solo, duo or squad of up to 4.", "https://pubg.com/en/clause/rules_of_conduct (100-player battle royale); squad size from public BGMI mode listings"),
  freeFire: f("Free Fire's battle royale puts roughly 50 players in a match, and its Clash Squad mode is 4v4 and round-based.", "https://en.wikipedia.org/wiki/Free_Fire_(video_game); https://ign.com/wikis/free-fire/Free_Fire:All_Game_Modes"),
  pubgm: f("PUBG Mobile's Classic mode is a 100-player battle royale, and it also has 4v4 Arena battles.", "https://apps.apple.com/us/app/pubg-mobile/id1330123889"),
  codm: f("Call of Duty: Mobile has team modes including Search & Destroy, with a Ranked Multiplayer ladder.", "https://apps.apple.com/us/app/call-of-duty-mobile/id1287282214"),
  valorant: f("Valorant competitive is 5v5: teams swap sides after 12 rounds and the first to 13 rounds wins.", "https://valorant.fandom.com/wiki/Competitive"),
  cs2: f("CS2 competitive is 5v5 with 12-round halves (MR12): 24 rounds in regulation, first to 13 wins, and overtime is played in six-round sets.", "https://hltv.org/news/36967/the-logic-behind-valves-move-to-mr12; https://counterstrikewiki.com/Competitive"),
  fortnite: f("Fortnite battle royale has solo, duos, trios and squads modes.", "Fortnite game modes, public listings"),
  chess: f("In FIDE chess a win scores 1 point, a draw half a point and a loss 0.", "https://www.fide.com/FIDE/handbook/LawsOfChess.pdf"),
  swissTiebreak: f("Buchholz is the most common first tie-break in a Swiss tournament.", "https://handbook.fide.com/chapter/TieBreakRegulations032026"),
  football: f("In football leagues a win is worth 3 points, a draw 1 and a defeat 0.", "https://premierleague.com/en/news/58905"),
  nrr: f("Net run rate is the runs a team scores per over minus the runs it concedes per over, across the tournament.", "https://www.olympics.com/en/news/net-run-rate-cricket-how-to-calculate-formula"),
  volleyball: f("FIVB volleyball is best of five sets: the first four to 25 points and a deciding fifth set to 15, each won by two clear points.", "https://www.fivb.com/volleyball/the-game/basic-rules/"),
  tableTennis: f("Table tennis games are played to 11 points, won by two, and a match is usually best of five games.", "https://www.pongfit.org/official-rules-of-table-tennis"),
  badminton: f("Badminton matches are best of three games, and the game target score has changed: BWF announced 15-point games in 2026.", "https://bwfbadminton.com/news-single/2026/04/26/key-changes-under-the-3x15-scoring-system"),
} as const;
