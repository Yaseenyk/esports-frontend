import type { Draft } from "./types";
import { FACTS as F } from "./facts";
import { FACTS_LIVE as L } from "./facts-live";

/** Ten guides published at once on 16 Nov 2026, outside the weekly schedule (the owner asked for them live and indexed at once). */
export const LIVE_NOW_DRAFTS: Draft[] = [
  {
    slug: "bgmi-points-system-explained",
    title: "BGMI points system and points table for tournaments",
    seoTitle: "BGMI points system and points table explained",
    description: "How the BGMI points system works: placement points plus kill points, a worked points table for four teams, tie-breaks and how to run it in your own event.",
    tag: "Scoring guide",
    answer: "The BGMI points system adds placement points (10 for first place, falling to 0 from ninth) to one point for every kill, match after match. The team with the highest total after the last match tops the points table. Tie-break rules are set by each event.",
    intro: "If you run a BGMI scrim, college event or community cup, you need a points table before the first match starts. This guide gives you the placement and kill values, a worked table you can check by hand, the tie-break choices, and the common ways organisers get the totals wrong.",
    sections: [
      { h2: "Placement points plus kill points", md: `A BGMI tournament does not rank teams by wins alone. Every match gives each team two kinds of points, and the points table is the running total of both.

- Placement points depend on where the team finished in the match.
- Kill points depend on how many opponents the team finished.

${L.bgmiKill.text} The match winner is just the team that scored most in that single match, which is not always the team that got the chicken dinner. That is why a team can finish first in a match and still not lead the table.

Scoring rules change between seasons and between organisers. The numbers below are the ones we read in a published table on 16 Nov 2026. Always check the current rulebook of the event you copy, and write your own numbers into your own rules page.` },
      { h2: "The placement table", md: `${L.bgmiPlacement.text}

| Finish | Placement points |
|---|---|
| 1st | 10 |
| 2nd | 6 |
| 3rd | 5 |
| 4th | 4 |
| 5th | 3 |
| 6th | 2 |
| 7th and 8th | 1 each |
| 9th to 16th | 0 |

${F.bgmi.text} Placement points go to the team, not to each player. For a smaller community lobby, keep the same top values and cut the table where your lobby ends.` },
      { h2: "A worked points table", md: `Four teams play three matches. Each cell shows placement points plus kills. Only the four teams are shown, and the finishes are an invented example to show the sums.

| Team | Match 1 | Match 2 | Match 3 | Total | Kills |
|---|---|---|---|---|---|
| Team A | 10 + 8 = 18 | 4 + 1 = 5 | 6 + 4 = 10 | 33 | 13 |
| Team B | 6 + 5 = 11 | 10 + 6 = 16 | 5 + 2 = 7 | 34 | 13 |
| Team C | 5 + 3 = 8 | 6 + 4 = 10 | 4 + 3 = 7 | 25 | 10 |
| Team D | 4 + 2 = 6 | 5 + 7 = 12 | 10 + 5 = 15 | 33 | 14 |

Team B leads with 34 even though it won only one match. Teams A and D are level on 33. In this example the organiser decided that total kills break a tie, so Team D (14) ranks above Team A (13). The final order is B, D, A, C.

You can enter the same numbers in the [points table calculator](/tools/points-table/) and compare. For the general idea behind any points table, see the [points table guide](/guides/points-table/).` },
      { h2: "Breaking ties on the table", md: `${L.bgmiTiebreakUnverified.text}

Pick one order, publish it before match 1 and apply it the same way to every team. Options organisers commonly use:

1. Most match wins (chicken dinners).
2. Most total kills across the event.
3. Highest placement points.
4. Result of the last match played.

> Whatever you choose, write it in the rules page next to the points values. A tie-break announced after the tie is a dispute waiting to happen.` },
      { h2: "Running the table on match day", md: `1. Fix the point values and tie-break in your rules before registration closes.
2. Collect each match result from the end-of-match screen: placement and kills for every team.
3. Enter results straight after each match, and have a second person check the sheet against the screenshot.
4. Show the live table on a TV with the [display screen](/tools/display-screen/) so teams can see their position.
5. Lock the table once the last match is entered and share the final version as an image or CSV.

If you want the same system for another game, read the [Free Fire points system and points table](/guides/free-fire-points-system-and-points-table/) guide. For the room side, use the [BGMI and Free Fire custom room setup guide](/guides/bgmi-and-free-fire-custom-room-setup-guide/). Ready to enter a lobby? Open the [BGMI points table](/points-table/bgmi/) page.` },
      { h2: "Common mistakes", md: `- Counting kills twice, once in the kill column and again inside the total.
- Giving points to the match winner only and forgetting the teams below.
- Using last season's values after the game or event changed them.
- Entering a team under two spellings, so it splits into two rows.
- Announcing the tie-break after two teams are already level.
- Skipping the check of the screenshot, so a typo in kills moves a team two places.` },
    ],
    faq: [
      { q: "How many points does a kill give in the BGMI points system?", a: "In the published table we read, each finish (kill) gives the team one point, added to its placement points for that match. Kill points go to the team, not the individual player. Your own event can set a different value, so write the number in the rules page and keep it the same all event." },
      { q: "How do I break a tie on a BGMI points table?", a: "Choose the order before the first match and publish it. Common choices are most match wins, then most total kills, then highest placement points, then the result of the last match. We could not confirm one official order from the rulebook, so treat these as an organiser's choice and follow the official rulebook if you copy a Krafton event." },
      { q: "How many points does first place get in a BGMI match?", a: "The table we read gives 10 placement points for first place, 6 for second, 5 for third and 4 for fourth. Add one point for every kill. So a team with first place and 8 kills scores 18 for that match. Points values are set by the event, so check the current rulebook before you copy them." },
    ],
    related: ["free-fire-points-system-and-points-table", "bgmi-and-free-fire-custom-room-setup-guide", "points-table", "choosing-a-tournament-format"],
    cta: { label: "Open the points table calculator", href: "/tools/points-table/" },
  },

  {
    slug: "free-fire-points-system-and-points-table",
    title: "Free Fire points system and points table for tournaments",
    seoTitle: "Free Fire points system and points table explained",
    description: "Free Fire points system explained: placement points from an official rulebook, one point per elimination, a worked table, Booyah tie-breaks and common errors.",
    tag: "Scoring guide",
    answer: "A Free Fire battle royale points table adds placement points to one point per elimination. In the official rulebook we read, first place gets 12 points and the list falls to 0 from 11th. Ties are broken by Booyahs, then eliminations, then the last game.",
    intro: "A Free Fire points table decides who wins an event, so it has to be right. Below you get the placement values from an official rulebook, a worked table that shows how a tie is settled, and the steps for keeping the table clean across a day of matches.",
    sections: [
      { h2: "How Free Fire scoring works", md: `Free Fire tournament scoring is simple: each match, each team earns placement points for where it finished plus points for its eliminations. The table is the running total across all matches of the day or event.

${L.ffFormat.text}

The numbers below come from one official rulebook. Garena and local organisers use different tables for different events, so use these as a starting point and publish your own.` },
      { h2: "Placement points, from the rulebook", md: `${L.ffPlacement.text}

| Place | Points | Place | Points |
|---|---|---|---|
| 1st | 12 | 7th | 4 |
| 2nd | 9 | 8th | 3 |
| 3rd | 8 | 9th | 2 |
| 4th | 7 | 10th | 1 |
| 5th | 6 | 11th | 0 |
| 6th | 5 | 12th | 0 |

${F.freeFire.text} If your lobby holds a different number of teams, extend or cut the table and say so in your rules.` },
      { h2: "A worked example with a tie", md: `Four teams, two matches. Each cell is placement points plus eliminations. The finishes are invented to show the sums.

| Team | Match 1 | Match 2 | Total | Booyahs | Eliminations |
|---|---|---|---|---|---|
| Alpha | 12 + 6 = 18 | 5 + 2 = 7 | 25 | 1 | 8 |
| Bravo | 8 + 5 = 13 | 12 + 4 = 16 | 29 | 1 | 9 |
| Charlie | 9 + 2 = 11 | 7 + 1 = 8 | 19 | 0 | 3 |
| Delta | 6 + 3 = 9 | 9 + 7 = 16 | 25 | 0 | 10 |

Bravo leads on 29. Alpha and Delta are tied on 25. ${L.ffTiebreak.text} Alpha has one Booyah and Delta has none, so Alpha ranks second even though Delta has more eliminations. Final order: Bravo, Alpha, Delta, Charlie.

Check your own numbers in the [points table calculator](/tools/points-table/), or open the [Free Fire points table](/points-table/free-fire/) page to enter a lobby live.` },
      { h2: "Setting your own scoring", md: `You can copy an official table or design your own. Three decisions matter:

- Placement versus kills: a high placement value rewards survival, a high kill value rewards aggression. Keep both visible so teams know what the table pays for.
- Lobby size: write placement points for every position in the lobby.
- Cut-off or finale rule: some events end early when a team reaches a score and wins a Booyah afterwards. Only use that if you have the time to run the extra matches.

Whatever you pick, publish it in the rules page before registration closes. The [tournament rules template](/guides/esports-tournament-rules-template/) shows where scoring sits in the full rules, and the [Free Fire battle royale tournament format](/guides/free-fire-battle-royale-tournament-format/) guide covers lobbies and match counts.` },
      { h2: "Keeping the table accurate on the day", md: `1. Assign one scorer and one checker.
2. After each match, take a screenshot of the result screen showing placement and eliminations for every team.
3. Enter the screenshot values, then have the checker compare each row.
4. Post the standings after every match, so a mistake is caught while players still remember the match.
5. After the last match, freeze the table and share it as an image.

For a screen at the venue, the [display screen](/tools/display-screen/) shows standings full screen on a TV or in OBS.` },
      { h2: "Common mistakes", md: `- Mixing up the BGMI and Free Fire scales. The two games use different placement values, so do not reuse the table. See the [BGMI points system](/guides/bgmi-points-system-explained/) guide for that side.
- Forgetting positions below the last scoring place, so teams in 11th and 12th get blank cells.
- Counting eliminations from the kill feed instead of the result screen.
- Not recording Booyahs, then having no way to break a tie.
- Changing point values after the first match.` },
    ],
    faq: [
      { q: "How many points does first place get in Free Fire?", a: "In the FFWS MEA 2025 rulebook, first place scores 12 placement points, second 9, third 8 and fourth 7, plus one point for every elimination. Other events use different values, so check the rulebook of the tournament you are copying and publish your own numbers if you run a local event." },
      { q: "How are ties broken on a Free Fire points table?", a: "In the rulebook we read, teams level on points are ranked by the number of Booyahs first, then by total eliminations, then by their placement in the last game of the series. A local event can pick another order, but it should be written in the rules before the first match." },
      { q: "How many matches should a Free Fire points table cover?", a: "The qualifier we read had 12 teams play 6 battle royale matches in one day, and the top 8 in the overall standings advanced. For your own event the number depends on the time you have: count the minutes per match plus breaks, then fit the matches into the day." },
    ],
    related: ["bgmi-points-system-explained", "free-fire-battle-royale-tournament-format", "points-table", "esports-tournament-rules-template"],
    cta: { label: "Open the points table calculator", href: "/tools/points-table/" },
  },

  {
    slug: "cod-mobile-tournament-rules-template",
    title: "COD Mobile tournament rules template you can copy",
    seoTitle: "COD Mobile tournament rules template to copy",
    description: "A section-by-section COD Mobile tournament rules template: eligibility, roster, devices, disconnects, cheating and penalties, with notes from the official rules.",
    tag: "Rules template",
    answer: "A COD Mobile tournament rules template should cover eligibility, rosters, devices, match settings, disconnects, fair play and penalties. Copy the sections below, replace the bracketed values with your own, and check them against the official Call of Duty: Mobile rules.",
    intro: "Players ask the same questions every event: how many on a team, can I use a controller, what if I disconnect, what happens if someone cheats. This template answers them section by section. Each section has text you can paste and a note where the official rules give a number we checked on 16 Nov 2026.",
    sections: [
      { h2: "How to use this template", md: `Copy each section into your own document, replace everything in square brackets, and delete sections you do not need. Do not copy a number you cannot defend. Where the template says "official", it comes from the public Call of Duty: Mobile World Championship rules, which are written for a much larger event than yours.

Pair it with the general [esports tournament rules template](/guides/esports-tournament-rules-template/), which covers behaviour, check-in and prizes for any game.

> Rules change between seasons. Read the current official rules before you publish yours, and put a version date on your page.` },
      { h2: "Sections 1 and 2: eligibility and rosters", md: `### Eligibility

Template: Players must be [age or class requirement] and registered with their own account. A player may be on one team only. Organisers may ask for proof of age or school or college enrolment.

${L.codIntegrity.text} The rule about accounts is worth copying: only the registered owner plays on an account.

### Roster

Template: A team has [5] players and may register [1] substitute. The roster is final at [date and time]. Changes after that need organiser approval.

${L.codRoster.text} For a local cup, one substitute is a sensible copy of the official limit.

### Check-in

Template: The captain checks in [30] minutes before the first match with the team's in-game names. Late teams may be disqualified after [10] minutes.` },
      { h2: "Sections 3 and 4: devices and settings", md: `### Devices

Template: Players use their own phone or tablet. No controllers, mice, keyboards or emulators. Phone cases and cooling fans that do not plug in are allowed.

${L.codDevices.text}

### Game settings

Template: Matches use the modes and maps listed in the schedule. The organiser may change settings between matches and will announce it before the match begins.

${L.codSettings.text} Put your modes and maps in a table:

| Round | Mode | Map |
|---|---|---|
| 1 | [Mode] | [Map] |
| 2 | [Mode] | [Map] |
| 3 | [Mode] | [Map] |

Keep the table in your schedule. The [match schedule maker](/tools/schedule/) turns the list into a timed run-sheet.` },
      { h2: "Sections 5 and 6: match conduct and technical issues", md: `### Lineup changes

Template: Teams may change their lineup between matches, not during a match.

${L.codLineup.text}

### Disconnects

Template: If a player disconnects in the first [30] seconds or before the first kill, the match is restarted. After that the match continues and the player rejoins. If a whole team leaves the lobby, that team forfeits the match. The referee decides any unclear case.

${L.codDisconnect.text}

### Draws

Template: A drawn match is [replayed / a loss for both teams / decided by a tie-break].

${L.codDraw.text} That is the official rule for a ladder stage; for a knockout event you will usually want a replay or an overtime round instead.` },
      { h2: "Section 7: fair play and penalties", md: `### Fair play

Template: Cheating, collusion, ghosting, account sharing, DDoS attacks and the use of unauthorised software are not allowed. Players must record their own match when asked and keep the evidence for [7] days.

${L.codIntegrity.text}

### Penalties

Template:

1. First minor offence, such as late check-in: a warning.
2. Second minor offence or a deliberate delay: forfeit of the next match.
3. Cheating or collusion: disqualification of the team and removal of prizes.

The official rules leave penalties to the administrator's discretion, so give your own referee the same freedom but list the ladder in advance, so players can see it is fair. If your event ends with a series, say how long it is: in the official finals, ${L.codSeries.text.replace("In the World Championship Finals, matches", "matches")}` },
      { h2: "Common mistakes", md: `- Copying a league's rules wholesale, including roster-lock and regional clauses that do not apply to your event.
- Leaving out the disconnect rule, so the first dropped player starts an argument.
- Not saying whether a drawn match is replayed.
- Publishing rules after teams have registered, which invites complaints.
- Hiding penalties in the fine print. Put them in a table or a short numbered list.
- No version date, so nobody knows which copy is current.` },
    ],
    faq: [
      { q: "How many players are on a COD Mobile tournament team?", a: "The official World Championship rules require five players, with an optional sixth substitute, and limit a roster to six including the substitute. A local event can use the same five-plus-one structure. Write the roster size and the deadline for roster changes into your rules before registration opens." },
      { q: "Can players use a controller in a COD Mobile tournament?", a: "In the official rules we read, players must compete on an eligible phone or tablet and may not use controllers, mice, keyboards or emulators without the administrator's consent. Cases and fans that do not plug in are allowed. State the same limits in your rules so everyone starts on equal terms." },
      { q: "What happens if a player disconnects in a COD Mobile match?", a: "The official rules end and restart the match if a player disconnects in the first 30 seconds or before the first kill. After that, the match continues and the player rejoins. The officials make the final decision. Copy the same structure for your event, and name who the referee is." },
    ],
    related: ["esports-tournament-rules-template", "free-fire-tournament-rules-for-organisers", "choosing-a-tournament-format", "player-id-cards"],
    cta: { label: "Open the Plan my tournament tool", href: "/tools/plan/" },
  },

  {
    slug: "free-fire-tournament-rules-for-organisers",
    title: "Free Fire tournament rules for organisers: a ready checklist",
    seoTitle: "Free Fire tournament rules for organisers",
    description: "Free Fire tournament rules for organisers: roster, device and fair-play rules, restarts, substitutions and a penalty ladder, with notes from the FFWS rulebook.",
    tag: "Rules guide",
    answer: "Free Fire tournament rules for organisers need five things: who may play, how the roster and substitutes work, the game settings, fair play, and a penalty ladder. The FFWS MEA 2025 rulebook is a good model, and the notes below show what to copy.",
    intro: "A tournament with no written rules turns into an argument after the first dispute. This guide lists the rules a Free Fire organiser should write, shows what the official FFWS MEA 2025 rulebook says about each, and gives a penalty ladder you can adjust.",
    sections: [
      { h2: "Rosters and substitutes", md: `${L.ffRoster.text}

For a local event, write your own numbers in a short block:

- Team size: 4 players in the match, 1 substitute.
- Roster deadline: the day and time after which no names change.
- Account rule: each player uses only their own account.
- Substitution rule: how and when a sub comes in.

${L.ffSubs.text} A simple version for your event: the captain tells the referee right after a match, and no changes are allowed once the next room is created.` },
      { h2: "Game settings the rules must name", md: `Players need to know the room settings before the match. ${L.ffSettings.text}

You do not have to copy all of it. Pick the settings that matter for your event, write them in a table, and share the table with captains:

| Setting | Your value |
|---|---|
| Map rotation | [Maps in order] |
| Revival | [On or off] |
| Death cam | [On or off] |
| Character skills | [Each player a different active skill, or no limit] |
| Loadouts | [Allowed or disabled] |

The [custom room setup guide](/guides/bgmi-and-free-fire-custom-room-setup-guide/) covers how to set these in the room itself.` },
      { h2: "Device and fair-play rules", md: `Write down what players may use and what they may not:

- One phone per player, their own, with no emulator unless your event allows it.
- No third-party software or tools that change the game.
- No looking at another player's screen or a spectator display.
- No account sharing, no playing under another name.

${L.ffViolations.text}

Add a line on conduct: abusive language, threats and unsporting behaviour are rule breaks too. Players under 18 should have a parent or guardian contact on the registration form, which the [registration form tool](/tools/registration/) can collect.` },
      { h2: "Disconnects, restarts and delays", md: `Decide before the event who can ask for a restart and when. The official Clash Squad rule is a good model: ${L.ffRestart.text}

For a battle royale lobby, a restart is rare and costly, so many organisers allow one only if the room itself fails, not when one team drops. Write it plainly:

1. A player who disconnects keeps playing if they return. The match does not stop.
2. A restart is only for a room or server fault that affects several teams.
3. The referee decides, and the decision stands.
4. A team that is more than [10] minutes late forfeits the match.` },
      { h2: "A penalty ladder", md: `The official rulebook sets team penalties in three bands, minor, moderate and major. Minor and moderate ones take points off the daily standings (15 and 30 points) and may cut prize money, and a major one is disqualification. For a local cup, you do not need money penalties. Use points and match bans:

| Level | Example | Penalty |
|---|---|---|
| Minor | Late to the room, wrong skills choice | Warning or [5] points off |
| Moderate | Repeated delay, abusive chat | [10] points off or a ban for one match |
| Major | Hacking, collusion, deliberate disconnect | Disqualification |

Publish the table with the rules. The [tournament rules template](/guides/esports-tournament-rules-template/) and the [COD Mobile rules template](/guides/cod-mobile-tournament-rules-template/) show how the same ladder fits into a full rules page.` },
      { h2: "Common mistakes", md: `- Writing the rules after registration closes.
- Leaving the point values out, which sends teams to ask in chat. Link your [points system](/guides/free-fire-points-system-and-points-table/) from the rules.
- Not naming a referee, so every decision is a debate.
- Having rules but no evidence process. Ask teams to record their own matches.
- Penalties with no ladder, so the same offence gets different results.` },
    ],
    faq: [
      { q: "How many players are on a Free Fire tournament roster?", a: "In the FFWS MEA 2025 rulebook, a team of four players has a roster of five, with at most two import players, and the roster must be final before a published deadline. For a local event, a roster of four players plus one substitute is a common starting point; write the deadline into your rules." },
      { q: "When can a Free Fire team make a substitution?", a: "The official rulebook we read says the team must inform the referees immediately after a match ends, and no substitute is accepted 2 minutes after the match ends. Use the same idea in your event: a short window between matches, and the referee confirms it before the next room opens." },
      { q: "What penalties can a Free Fire tournament set for rule breaks?", a: "The FFWS MEA 2025 rulebook uses three bands for teams: minor, moderate and major. Minor and moderate penalties remove points from the daily standings, and a major one is disqualification. Your event can copy the structure with smaller penalties and publish it before the first match." },
    ],
    related: ["esports-tournament-rules-template", "cod-mobile-tournament-rules-template", "free-fire-points-system-and-points-table", "bgmi-and-free-fire-custom-room-setup-guide"],
    cta: { label: "Open the registration form tool", href: "/tools/registration/" },
  },

  {
    slug: "free-fire-battle-royale-tournament-format",
    title: "Free Fire tournament format: battle royale lobbies and cutoffs",
    seoTitle: "Free Fire tournament format for battle royale",
    description: "Plan a Free Fire tournament format: lobby size, how many matches, groups, cutoffs to a final, and a timetable you can run in one day, with a table to copy.",
    tag: "Format guide",
    answer: "A Free Fire battle royale tournament format is a number of teams per lobby, a set of matches per day, a points table, and a cutoff that sends the top teams to a final. In the official qualifier we read, 12 teams played 6 matches and the top 8 advanced.",
    intro: "Many organisers choose a format by copying a stream. This guide shows how to size lobbies, count matches, split teams into groups and set a cutoff, then fit it into a real day. Clash Squad is a different 4v4 round-based mode and needs its own format, which a separate guide covers.",
    sections: [
      { h2: "The shape of a battle royale event", md: `A battle royale event has four decisions:

1. Teams per lobby: how many squads play in one room.
2. Matches per lobby: how many games each team plays.
3. Groups or stages: do all teams play together, or in groups, then a final.
4. Cutoff: how many teams move forward, or when the event ends.

${L.ffFormat.text} That is one working example of those four decisions: 12 teams per lobby, 6 matches, one day, top 8 through.

${F.freeFire.text}` },
      { h2: "How many teams per lobby", md: `A lobby is one room, and the room size sets how many groups you need. If you use 12 teams per lobby, which matches the 12-place scoring table in the rulebook we read, the numbers are:

| Teams | Lobbies of 12 | Groups |
|---|---|---|
| 12 | 1 | 1 |
| 24 | 2 | 2 |
| 36 | 3 | 3 |
| 48 | 4 | 4 |

If your team count is not a multiple of 12, either run one smaller lobby or fill it with the best-seeded teams from a previous round. Do not leave a lobby so small that the match ends in a minute.` },
      { h2: "How many matches", md: `More matches give a fairer ranking, because one lucky zone does not decide the day. The limit is time. Count it like this:

1. Minutes per match, including loading, in your plan.
2. Add a break between matches for room changes and score entry.
3. Multiply by the matches you want.
4. Add a buffer of 30 minutes for the unexpected.

The [match schedule maker](/tools/schedule/) does this arithmetic from your numbers and gives you a run-sheet. The same rulebook played six matches in a day for the qualifier we read, which is a useful upper limit for a one-day local event.` },
      { h2: "Groups, cutoffs and a final", md: `With more than 12 teams, a common structure is group stage, then a final:

- Stage 1: each group plays its own lobby for the same number of matches.
- Cutoff: the top teams from each group move forward. In the official qualifier, the top 8 of 12 went through.
- Final: the qualifiers play together in one lobby for a set number of matches, and the points table decides the winner.

For 24 teams in two groups of 12, taking the top 6 from each gives 12 finalists, which fills one lobby. Use the [groups and knockout maker](/tools/groups/) to split teams so that seeded teams do not meet early, and the [points table calculator](/tools/points-table/) for the standings. Write your scoring into the rules; the [Free Fire points system](/guides/free-fire-points-system-and-points-table/) guide gives the values we checked.

If you want a knockout end instead, take the top teams to a [bracket](/tools/brackets/), but battle royale points tables usually suit a final better.

For the squad-versus-squad mode, Clash Squad is a 4v4 round-based format and needs its own bracket rather than a lobby table.` },
      { h2: "A sample one-day plan", md: `This is an example you can edit, not a rule.

| Time | Activity |
|---|---|
| 10:00 | Check-in and room test |
| 10:30 | Group A, matches 1 to 4 |
| 13:00 | Group B, matches 1 to 4 |
| 15:30 | Cutoff and finalists announced |
| 16:00 | Final, matches 1 to 4 |
| 18:00 | Results and prizes |

Adjust the match count and breaks to your own timings. Show the plan to captains a few days before, and use the [Plan my tournament](/tools/plan/) tool if you want it generated from your numbers.` },
      { h2: "Common mistakes", md: `- Choosing a format that needs more hours than the venue is booked for.
- Letting each group play a different number of matches, so the cutoff is not fair.
- Setting the cutoff after seeing who is on the edge.
- Mixing Clash Squad rounds into a battle royale table.
- Forgetting the room handover between groups. The [custom room guide](/guides/bgmi-and-free-fire-custom-room-setup-guide/) has a checklist for it.
- Not telling teams the format before they register.` },
    ],
    faq: [
      { q: "How many teams play in one Free Fire battle royale lobby?", a: "In the official rulebook we read, the scoring table covers 12 places, which fits a lobby of 12 teams. For a local event you can use any lobby size that your room and staff can handle, as long as your points table has a value for each position and every team plays the same number of matches." },
      { q: "How many matches should a Free Fire tournament day have?", a: "The official qualifier we read played 6 battle royale matches in a day and sent the top 8 of 12 teams through. For your own event, add the minutes per match, the break between matches and a buffer, and divide into the time you have. Fewer matches done well beat more matches that run late." },
      { q: "How do you decide a cutoff for the Free Fire final?", a: "Fix the number of teams that move on before the first match. In the qualifier we read, the top 8 of 12 advanced. A common local choice is to fill a final lobby, for example the top 6 from each of two groups of 12. Publish the number with the format so teams know what they play for." },
    ],
    related: ["free-fire-points-system-and-points-table", "choosing-a-tournament-format", "bgmi-and-free-fire-custom-room-setup-guide", "free-fire-tournament-rules-for-organisers"],
    cta: { label: "Open the groups and knockout maker", href: "/tools/groups/" },
  },

  {
    slug: "free-fire-tournament-registration-form-template",
    title: "Free Fire tournament registration form template",
    seoTitle: "Free Fire tournament registration form template",
    description: "A Free Fire tournament registration form template: the fields to collect, what to leave out for privacy, slot confirmation and a message you can send to teams.",
    tag: "Template",
    answer: "A Free Fire tournament registration form needs the team name, captain contact, each player's in-game name and UID, the roster and substitute, and a rules agreement. Collect only what you need, and confirm each slot by message so teams know they are in.",
    intro: "A good registration form saves the whole event, and a bad one ends in 60 messages asking whether a team is in. Below is the field list, the privacy limits, a slot confirmation flow and the message to send, ready to copy into your own form or into the registration tool.",
    sections: [
      { h2: "The fields to collect", md: `Start with the minimum. Every extra field costs you completion and creates data you must protect.

| Field | Why you need it |
|---|---|
| Team name | Shown on the table and poster |
| Captain name and phone or WhatsApp | The one contact for room details |
| Four player names and in-game UIDs | To check the right players are in the room |
| In-game names | So referees can match the lobby |
| Substitute (optional) | Roster rules, if you allow one |
| City or college | For eligibility or local events |
| Rules agreement | A tick box that the team has read the rules |

${L.ffRoster.text} Use the same structure as a default: four starters and one substitute, with the deadline clear.` },
      { h2: "What to leave out", md: `Collect nothing you do not use. Skip these unless the event truly needs them:

- Government ID numbers.
- Home addresses of players.
- Payment card details. Use a separate payment provider for fees, and never ask for card or UPI PIN details in a form.
- Photos of players, unless you make ID cards. For that, the [player ID cards](/guides/player-id-cards/) guide shows a safer approach.

For players under 18, ask for a parent or guardian contact and say how you will use it. Tell teams what you collect, who sees it, and when you will delete it after the event. Put those three lines at the top of the form.` },
      { h2: "A step-by-step setup", md: `1. Write the rules page first and link it from the form. The [Free Fire tournament rules](/guides/free-fire-tournament-rules-for-organisers/) guide is a good start.
2. Set a registration deadline and a maximum number of teams.
3. Build the form with the fields above, with the captain contact as a required field.
4. Make the UID field a short text field, and say where to find the UID in the game.
5. Test the form on a phone, because players will use one.
6. Share the link on your poster and group chats. The [poster maker](/tools/poster/) can make a post with the link and the date.

The [registration form tool](/tools/registration/) gives you a ready-to-copy form, or a link that collects teams and adds approved ones to your roster.` },
      { h2: "Slot confirmation", md: `A registration is not a slot until you confirm it. Use three states and tell teams which one they are in:

- Received: the form is in, nothing guaranteed.
- Confirmed: a slot is held. The team gets room timing and rules.
- Waitlisted: a place if another team drops.

Send the confirmation within a day of the form, so teams do not register twice. Here is a message to adapt:

> Hi [Captain], your team [Team name] is confirmed for [Event name] on [date]. Check-in opens at [time]. The room ID and password will be sent here [15] minutes before the first match. Rules: [link]. Reply with YES to keep your slot by [deadline].

Teams that do not reply by the deadline lose the slot, and the waitlist moves up.` },
      { h2: "After the form closes", md: `Export the list and check it before the event.

- Remove duplicates, such as one captain registering twice.
- Check that the number of confirmed teams fits your lobbies. The [battle royale format](/guides/free-fire-battle-royale-tournament-format/) guide shows how to count.
- Print a check-in list. For larger events, the [gate check-in scanner](/tools/check-in/) works with QR passes.
- Delete personal data you no longer need after the event, as you promised on the form.` },
      { h2: "Common mistakes", md: `- Asking for too much, so teams give up halfway through the form.
- No deadline, so registrations trickle in during the event.
- Forgetting the captain's phone number.
- Not saying where to find the UID.
- Sending the room ID and password with the confirmation, days early. Send it just before the match.
- Leaving the form open after your slots are full without saying so.` },
    ],
    faq: [
      { q: "What should a Free Fire registration form ask for?", a: "At least the team name, the captain's name and contact, each player's name and in-game UID, the substitute if you allow one, and a tick box for the rules. Add city or college only if your event needs it. Keep it short, because every extra field makes teams less likely to finish the form." },
      { q: "How do I confirm a team's slot in a Free Fire tournament?", a: "Send a message to the captain within a day of the form saying the slot is confirmed, with the date, check-in time and rules link, and ask for a reply by a deadline. If the team does not reply, give the slot to the next team on the waitlist. Keep a simple list with three states: received, confirmed and waitlisted." },
      { q: "Is it safe to collect players' details for a gaming event?", a: "It is safe if you collect only what you need, explain how you will use it, store the sheet with access limited to organisers, and delete it after the event. Do not ask for government ID numbers or payment card details in a form. For players under 18, ask for a guardian's contact and say why." },
    ],
    related: ["free-fire-tournament-rules-for-organisers", "free-fire-battle-royale-tournament-format", "player-id-cards", "run-a-campus-tournament"],
    cta: { label: "Open the registration form tool", href: "/tools/registration/" },
  },

  {
    slug: "esports-team-names-ideas",
    title: "Esports team names: original ideas and how to pick one",
    seoTitle: "Esports team names: original ideas and how to pick",
    description: "Esports team names grouped by style, with original ideas for any game, plus how to check a name is free, how long it should be and how to avoid copying a team.",
    tag: "Name ideas",
    answer: "Good esports team names are short, easy to say out loud and not already used by another team. Use the style groups below for ideas, mix two words from different lists, and check the name on search and social sites before you register it.",
    intro: "A team name goes on a poster, a scoreboard, a jersey and a stream overlay, so it has to be easy to read and say. Below are original ideas grouped by style, a way to build your own, and a checklist for making sure nobody else already owns the name. The lists are for any game; BGMI and Free Fire have their own pages.",
    sections: [
      { h2: "How to choose a name that works", md: `A name that looks good in a chat message can fail on a scoreboard. Test each idea against five points:

1. Say it out loud once. If a commentator would stumble, change it.
2. Keep it to one or two words and under about 14 characters, so it fits a scoreboard row.
3. Avoid strange spelling, such as swapped letters, that people cannot search.
4. Check it is family friendly. Many events have young players and sponsors.
5. Check it is not already taken (see the last section).

A short name also helps on the [tournament poster](/tools/poster/), where long names get shrunk.` },
      { h2: "Sharp and fast names", md: `Names that sound like speed and edge. These are invented combinations, not copies of known teams:

- Ashen Relay
- Cobalt Drift
- Nova Static
- Quiet Voltage
- Razor Orbit
- Static Harbour
- Tidal Spark
- Zero Latency
- Hollow Signal
- Rapid Ember
- Sharp Margin
- Cinder Pulse` },
      { h2: "Animal and nature names", md: `Easy to remember and easy to turn into a logo:

- Iron Heron
- Dusk Lynx
- Ember Moth
- Storm Pelican
- Lone Jackal
- Silent Otter
- Copper Mantis
- Midnight Finch
- Granite Fox
- Violet Hornet
- Frost Marlin
- Ridge Falcon` },
      { h2: "Word-play and short names", md: `These work well when you want a one-word handle:

| Pattern | How to build it | Examples |
|---|---|---|
| Two words joined | Join a noun and a verb | Spikebound, Ghostline, Rushpoint |
| Drop a vowel | Shorten a long word | Vltage, Strm, Frge |
| Add a suffix | Noun plus -ix, -on, -ar | Pulsar, Nexon, Vectrix |
| Number or letter | One number or letter at the end | Orbit9, Kite7, Zenith X |

Be careful with dropped vowels: they look cool and are hard to search. Use them only if you can still spell the name to someone over the phone.` },
      { h2: "Names for a college or local team", md: `A name that points to a place or a group makes it easy for supporters to share:

- Campus Cipher
- North Block Gaming
- Rooftop Raiders
- Metro Mavericks
- Lakeside Legion
- Hostel Hawks
- Canteen Crew
- Terrace Titans

You can mix a place with a style word: take a place from your city or college, add a word from the sharp or animal lists. The [campus tournament guide](/guides/run-a-campus-tournament/) is useful if the team plays college events. For games with their own naming habits, see the [BGMI team names](/guides/bgmi-team-names-ideas/) and [Free Fire team names](/guides/free-fire-team-names-ideas/) pages.` },
      { h2: "Check that the name is free", md: `A name is only yours if nobody else is using it. Before you print jerseys, check:

1. Search the name in quotes on a search engine, then check the first two pages.
2. Search it on the social sites you will use, and on YouTube.
3. Check the game's own player and clan search, if it has one.
4. Look for registered brands or well-known teams with the same or a close name.
5. Check your tournament's registration list for the same name.
6. Claim the handle on the social sites you need the same day you choose the name.

None of the names above is checked for you. They are ideas, and the check is your job. If you want a mood board or a logo next, start from the style group you liked best.` },
      { h2: "Common mistakes", md: `- Copying a known team's name with one letter changed.
- Choosing a name with a joke that stops being funny, or one that can offend a sponsor.
- A name too long for the scoreboard.
- Special characters that the registration form does not accept.
- Changing the name every month, so the audience never learns it.
- Not asking the whole team. The name has to be one every player is happy to wear.` },
    ],
    faq: [
      { q: "What makes a good esports team name?", a: "A good name is short, easy to say and spell, family friendly and not already used. Test it by saying it out loud, writing it on a scoreboard row and searching it online. If you cannot find the team's page by typing the name, new fans will not find it either." },
      { q: "How can I check if an esports team name is already taken?", a: "Search the name in quotes on a search engine, then on the social sites and video sites you plan to use. Check the game's clan or player search, and ask the tournament organiser for the registered list. A name used by a well-known team or a brand should be avoided." },
      { q: "How long should an esports team name be?", a: "Keep it to one or two words, and short enough to fit a scoreboard row and a jersey print, which in practice means about 14 characters or fewer. A short name is easier to chant, type in chat and show in a stream overlay. Longer names can use a short tag, such as three letters." },
    ],
    related: ["bgmi-team-names-ideas", "free-fire-team-names-ideas", "run-a-campus-tournament", "player-id-cards"],
    cta: { label: "Make a poster with your team name", href: "/tools/poster/" },
  },

  {
    slug: "bgmi-team-names-ideas",
    title: "BGMI team names: original ideas for squads and clans",
    seoTitle: "BGMI team names: original ideas for squads",
    description: "BGMI team names for squads, scrims and clans: original ideas by style, how to add a short tag, rules for in-game name limits and how to check a name is free.",
    tag: "Name ideas",
    answer: "BGMI team names work best when they are short, readable on a scoreboard and not copied from an existing esports team. Below are original names for four-player squads grouped by style, plus a tag system and a check before you register.",
    intro: "A BGMI squad needs one name for the lobby, the poster and the points table. This page gives original ideas by style, a simple way to build a tag so the whole team can show it in game, and a short checklist so you do not clash with a team that already has the name.",
    sections: [
      { h2: "Pick a style first", md: `Choose the feeling you want, then pick words. For a squad of four, the name has to suit four people, so ask each player to vote for a style.

| Style | Feels like | Sample words |
|---|---|---|
| Fast | Rotations and pushes | Rush, Dash, Blitz, Surge |
| Calm | Patient squads | Hollow, Quiet, Still, Drift |
| Sharp | Aim and spray control | Razor, Pierce, Flint, Edge |
| Wild | Aggressive fraggers | Jackal, Hornet, Viper, Mantis |

Take one word from your style and pair it with a noun. That gives you plenty of unique names without copying anyone.` },
      { h2: "Squad names with a map or zone feel", md: `Names that nod to the game without using any game or publisher trademark:

- Last Circle
- Rooftop Rotation
- Quiet Compound
- Edge Of Zone
- Bridge Holders
- Harbour Hunters
- Second Floor
- Slow Rotation
- Final Ring
- Shoreline Crew
- Cover Fire
- Ridge Runners

${F.bgmi.text} Because a squad has up to four players, a name with four parts (four tags) is a neat match.` },
      { h2: "Short names for the scoreboard", md: `Short names fit on a points table row and are easy to shout in comms. Original ideas:

- Kiteline
- Nexora
- Vantor
- Pulse Nine
- Ghostwave
- Emberline
- Tactic Zero
- Rushmark
- Silent Four
- Orbit Core
- Vector Dusk
- Frostbyte Crew

Say each one out loud. If you hesitate, skip it. When you list the team on a [BGMI points table](/points-table/bgmi/), the name appears in a narrow column, so a name of 12 characters or fewer is the safe choice.` },
      { h2: "Tags and in-game names", md: `Many squads use a short tag in front of each player's in-game name so the lobby sees the team at once. A simple system:

1. Pick a tag of two to four letters, for example the first letters of the team name.
2. Put it in front of each player's in-game name.
3. Keep the player name readable, with no long strings of symbols.
4. Write the format in your event rules so referees can match players to teams.

Each event and the game itself have their own limits for name length and symbols, so check the rules page of the event, and the game's name rules, before you print jerseys. The [BGMI and Free Fire custom room guide](/guides/bgmi-and-free-fire-custom-room-setup-guide/) explains why names in the room matter to referees.` },
      { h2: "Check before you register", md: `Before you send the name to an organiser:

- Search it in quotes online and on the social sites you use.
- Look at the tournament's team list, so you do not match a team already in.
- Check it is not a well-known esports team, a brand or a creator's channel name.
- Make sure the name is clean enough for a poster with sponsors.
- Register the name on your tournament form using the exact spelling you will use everywhere.

Organisers can use the [registration form tool](/tools/registration/) to catch duplicate names at sign-up. For more general ideas that work in any game, see the [esports team names](/guides/esports-team-names-ideas/) list.` },
      { h2: "Common mistakes", md: `- Taking a famous team's name and adding a number.
- Using the game's own name or logo in the team name.
- Choosing a name only one player likes.
- Symbols that break the registration sheet.
- A very long name that is cut off on the points table and the stream overlay.
- Forgetting to check the name for an unintended meaning in another language.` },
    ],
    faq: [
      { q: "What are good BGMI team names for a squad of four?", a: "Choose a short two-word name in a style the whole squad likes, such as Last Circle, Quiet Compound or Pulse Nine. These are ideas, not checked names. Say the name out loud, make sure it fits a scoreboard row and search it online before you register it with an organiser." },
      { q: "Can I use a famous BGMI team's name for my squad?", a: "Avoid it. A name that copies an existing esports team can lead to your registration being rejected, and it confuses fans who search for the original team. Build your own from two words in a style you like, and check that the name is free before you print jerseys or a logo." },
      { q: "How do I add a team tag to BGMI player names?", a: "Pick a tag of two to four letters and put it before each player's in-game name, then write the format in the event rules. Limits on length and symbols come from the game and the event, so check both. A readable tag helps referees match players to the team in the lobby." },
    ],
    related: ["esports-team-names-ideas", "free-fire-team-names-ideas", "bgmi-points-system-explained", "bgmi-and-free-fire-custom-room-setup-guide"],
    cta: { label: "Open the BGMI points table", href: "/points-table/bgmi/" },
  },

  {
    slug: "free-fire-team-names-ideas",
    title: "Free Fire team names: original ideas and name rules",
    seoTitle: "Free Fire team names: original ideas and rules",
    description: "Free Fire team names for squads and guilds: original ideas by style, how to pick a short tag, name rules to check with your organiser and how to avoid copying.",
    tag: "Name ideas",
    answer: "Free Fire team names should be short, clean and different from existing teams. Pick a style, join two words, add a short tag for the squad, and check the name online and with your organiser before you register. The ideas below are original and unchecked.",
    intro: "A Free Fire squad is four players, and the name has to be easy to type into a registration form and read on a points table. This guide gives original name ideas by style, a tag method for the lobby, a short rule set for choosing names, and the checks to run before you commit.",
    sections: [
      { h2: "Name ideas by style", md: `The names below are made up for this page. They are not checked, so run the checks in the last section before you use one.

| Style | Ideas |
|---|---|
| Fire and heat | Ember Rush, Cinder Crew, Flarepoint, Ashline |
| Speed | Rapid Orbit, Quickmark, Dashboard Four, Blur Squad |
| Calm and sharp | Still Aim, Quiet Pierce, Cold Margin, Hush Fire |
| Animal | Copper Jackal, Dusk Viper, Ridge Falcon, Iron Heron |
| Team spirit | Last Four, Fourth Floor, One Circle, Together Zero |

${F.freeFire.text} Mode names and character names belong to the game, so use your own words rather than theirs.` },
      { h2: "Squad names with a finish-line feel", md: `Many players like names about winning the last circle. Without using game trademarks:

- Final Circle Four
- Last Zone Standing
- Bridge To Win
- Loud Finish
- Sunrise Squad
- Victory Lane
- Crown Chase
- Last Light
- Golden Hour Four
- Top Of The Hill

Treat the word "Booyah" with care: it is a word the game uses, so a name built on it may be too close to the game's own branding for a sponsored event. Ask the organiser.` },
      { h2: "Names for a guild, school or city team", md: `If the team represents a place, join the place with a short word:

- North Gate Gaming
- Riverside Rush
- Harbour Hawks
- Old Town Orbit
- Campus Cobras
- Station Road Squad
- Lakeview Legion
- Sector Seven Crew

For schools and colleges, check the event's rules on naming first. Many events want the institution's name used in a standard way. The [campus tournament guide](/guides/run-a-campus-tournament/) covers that side. For general lists, see [esports team names](/guides/esports-team-names-ideas/), and for the other big mobile battle royale, see [BGMI team names](/guides/bgmi-team-names-ideas/).` },
      { h2: "Tags, names and the lobby", md: `Referees need to match a name in the room to a team on the list. Make that easy:

1. Choose a short tag of two to four letters and put it in front of each player's in-game name.
2. Keep each player name readable. Long chains of symbols are hard for a referee to compare with the list.
3. Send the exact names on the registration form, including capital letters and symbols.
4. Do not change a name after registration without telling the organiser.

In the official FFWS MEA 2025 rulebook, the game configuration hides player nicknames and the kill feed in matches, so referees there rely on the roster they hold. Rooms for smaller events usually show names, so a tag helps everyone.` },
      { h2: "Check the name and the rules", md: `Run these checks before you register:

1. Search the name in quotes online and on the social sites you use.
2. Look at the event's registered list for a clash.
3. Make sure no well-known team, brand or creator has the name.
4. Read the event's rules for limits on length, symbols and words.
5. Ask the whole squad to approve.

Your [registration form](/tools/registration/) is the place where the final spelling is locked, so check it twice. For the roster rules around names and substitutes, read the [Free Fire tournament rules for organisers](/guides/free-fire-tournament-rules-for-organisers/) guide, which also explains why the roster is fixed before the event.` },
      { h2: "Common mistakes", md: `- Changing one letter of a known team's name.
- Putting the game's brand in the name.
- A name with symbols that the form rejects.
- Names with insults or adult jokes that sponsors will not accept.
- Registering one spelling and playing under another.
- Choosing a name so long that the points table shows only half of it.` },
    ],
    faq: [
      { q: "What are some original Free Fire team name ideas?", a: "Try two-word names in a style your squad shares, such as Ember Rush, Quiet Pierce, Copper Jackal or Last Light. They are ideas only and have not been checked, so search each one online and check the event's list before you register. Pick one all four players like, and keep it short enough for a scoreboard." },
      { q: "Is it okay to put Booyah in a Free Fire team name?", a: "It is a word the game uses, so there is no rule against it for a casual squad, but a name built on game branding may be refused at a sponsored event. Ask the organiser, and consider a name of your own words instead, which is also easier to find in search and to protect as your team's identity." },
      { q: "How do I stop two Free Fire teams having the same name in my event?", a: "Collect team names in a registration form, search the list for duplicates before confirming slots, and tell teams that the first confirmed registration keeps the name. Ask for the exact spelling and a short tag, so players in the room can be matched to the roster without confusion." },
    ],
    related: ["esports-team-names-ideas", "bgmi-team-names-ideas", "free-fire-tournament-registration-form-template", "free-fire-tournament-rules-for-organisers"],
    cta: { label: "Open the registration form tool", href: "/tools/registration/" },
  },

  {
    slug: "bgmi-and-free-fire-custom-room-setup-guide",
    title: "BGMI and Free Fire custom room setup guide for organisers",
    seoTitle: "BGMI and Free Fire custom room setup guide",
    description: "Set up a BGMI or Free Fire custom room for a tournament: settings to decide, room ID and password handling, a pre-match checklist and what to do if a room fails.",
    tag: "Setup guide",
    answer: "To run a BGMI or Free Fire custom room, decide the map, mode and settings, create the room shortly before the match, send the room ID and password only to the registered captains, check the players who join, and start when the list is complete.",
    intro: "A custom room is where a tournament match actually happens, and many delays come from it: wrong settings, a leaked password or a missing team. This guide covers the settings to decide in advance, the handling of the room ID and password, a checklist you can run before every match, and a fallback plan.",
    sections: [
      { h2: "What a custom room is for", md: `A custom room is a private match that the organiser creates, with a room ID and a password. Only people who have both can join. It lets an organiser fix the map, the mode and the rules, instead of leaving it to a public lobby.

${F.bgmi.text} ${F.freeFire.text} Because squads and lobbies differ by game, check the squad size and the number of teams your room holds before you set your schedule.

The exact menus and options change when the game updates. This guide gives you what to decide, not a click-by-click path. Open the custom room screen in the current version of your game and match it to the checklist.` },
      { h2: "Decide the settings before match day", md: `Write the settings as a table and send it to captains with the rules. Do not decide them in the room.

| Decision | Your answer |
|---|---|
| Game and mode | [BGMI or Free Fire, squad] |
| Map and rotation | [Map for each match] |
| Teams in the room | [Number] |
| Scoring | [Link to your points table rules] |
| Start time and late rule | [Time and grace period] |

For Free Fire, one official rulebook shows what an organiser can fix. ${L.ffSettings.text} Treat that as one example from one event, and choose your own list. For BGMI, we did not verify an official room-settings list, so follow the current rulebook of the event you copy, or write your own and publish it.

Decide scoring at the same time. See the [BGMI points system](/guides/bgmi-points-system-explained/) and [Free Fire points system](/guides/free-fire-points-system-and-points-table/) guides.` },
      { h2: "Room ID and password handling", md: `The ID and password are the keys to the match. Treat them like it.

1. Create the room close to match time, not the night before.
2. Send the ID and password only to the captain of each registered team, by the channel they gave on the form.
3. Never post them in a public group, a stream chat or a story.
4. Use a fresh password for each match. Do not reuse one between rounds.
5. Tell captains that sharing the details with anyone outside the roster is a rule break.
6. If a stranger joins, remove them and change the password for the next match.

Your [registration form](/guides/free-fire-tournament-registration-form-template/) should collect the captain's phone number or WhatsApp, because that is where the room details go.` },
      { h2: "A pre-match checklist", md: `Run this list before every match:

1. Settings match the published table.
2. Room created, password set, and the room ID copied.
3. Referee or co-host has joined and can see the lobby.
4. Captains have the details and the start time.
5. Players join. Compare the names in the room with the registered roster.
6. Remove anyone not on the list.
7. Check the count of teams, and wait for the late rule time.
8. Start, and take a screenshot of the result screen at the end for the table.

The [printable kits](/tools/print-kits/) include a referee checklist if you prefer to run it on paper.` },
      { h2: "If something goes wrong", md: `Prepare answers in advance:

- A team cannot join: the captain re-sends the ID, then the organiser checks the password and the team's slot.
- A player disconnects: follow your rules. Copy the structure in the [Free Fire tournament rules](/guides/free-fire-tournament-rules-for-organisers/) or [COD Mobile rules template](/guides/cod-mobile-tournament-rules-template/).
- The room fails: create a new room, send new details, and replay the match if no result was recorded.
- A leaked password: stop, remove strangers, change the password and restart if the match has not begun.

Record every decision in a log with the time. It protects you in a dispute.` },
      { h2: "Common mistakes", md: `- Creating all rooms the night before and sharing the details early.
- Reusing a password.
- Starting before the roster check, so an extra player is in a team's slot.
- Changing settings between matches without telling captains.
- One person doing room, scoring and chat. Split the jobs.
- Forgetting the result screenshot, then arguing about kills later.` },
    ],
    faq: [
      { q: "How do I keep a custom room password from leaking?", a: "Create the room close to match time, send the ID and password only to registered captains through the contact they gave, and use a new password for every match. Never post the details in a public group or stream chat. If a stranger joins, remove them and change the password for the next match." },
      { q: "What settings should a BGMI or Free Fire custom room have?", a: "Decide the map, mode, number of teams, start time and scoring before match day, and publish them in a table. For Free Fire, the FFWS MEA 2025 rulebook shows examples such as revival, death cam and loot settings. For BGMI, follow the rulebook of the event you copy, or publish your own list." },
      { q: "What should an organiser check before starting a custom room match?", a: "Check the settings against your published table, confirm a referee has joined, compare the names in the room with the registered roster, remove anyone not on the list, and wait until the late rule time. Keep a screenshot of the result screen afterwards so the points table can be checked." },
    ],
    related: ["bgmi-points-system-explained", "free-fire-points-system-and-points-table", "free-fire-tournament-rules-for-organisers", "free-fire-tournament-registration-form-template"],
    cta: { label: "Open the match schedule maker", href: "/tools/schedule/" },
  },
];
