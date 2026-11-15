import type { Draft } from "./types";
import { FACTS_B12 as B } from "./facts-b12";

/**
 * Batch 12: ten more demand-led guides, queued after batch 11 (see docs/seo-research-2026-11-16-blogs.md).
 * Game numbers come from facts-b12.ts. Anything else that looks like a number is labelled an EXAMPLE the organiser can change.
 */
export const BATCH_12: Draft[] = [
  {
    slug: "pubg-mobile-points-system-and-table",
    title: "PUBG Mobile points system and points table, explained",
    seoTitle: "PUBG Mobile points system and points table",
    description: "How a PUBG Mobile points system works: placement points, kill points, a worked points table with three matches, tie-breaks, and how to build your own.",
    tag: "Scoring guide",
    answer: "A PUBG Mobile points system adds placement points (more for finishing higher) to one point per elimination, match by match, and ranks teams by the total. The points table is that running total with a tie-break order. Values differ by organiser, so publish yours before match one.",
    intro: "Teams ask two things before any custom room: what is a win worth, and what is a kill worth. If your points table cannot answer both in one line, the argument starts after the first match. Here is how the scoring in official PUBG Mobile events works, with a worked table you can copy and a way to adapt it to a college or community event.",
    sections: [
      { h2: "What the system is made of", md: `Every battle royale points system has the same two parts. Placement points reward surviving longer, and kill points reward eliminations. A team's score for a match is the sum, and the table adds the matches together.

${B.pubgmPlacement.text} That is one real rulebook, used for a national championship. It is a good starting point for a community event, but it is not a law: you are free to set your own values as long as you publish them first.

If you run BGMI instead, read [BGMI points system explained](/guides/bgmi-points-system-explained/), because the two games are run by different publishers and their event rules are written separately.` },
      { h2: "Placement points table (one rulebook, as an example)", md: `| Finish | Placement points | Plus |
|---|---|---|
| 1st | 10 | 1 per elimination |
| 2nd | 6 | 1 per elimination |
| 3rd | 5 | 1 per elimination |
| 4th | 4 | 1 per elimination |
| 5th | 3 | 1 per elimination |
| 6th | 2 | 1 per elimination |
| 7th and 8th | 1 | 1 per elimination |
| 9th and below | 0 | 1 per elimination |

In the rulebook the table stops at sixteenth place, because that event had sixteen teams. If your lobby has more teams, extend the zero rows to match.

> Say in your rules that this is the scale you use and where it came from. If a player quotes a different tournament, the answer is "we publish our scale, and it is on the rules page."` },
      { h2: "A worked points table: three matches", md: `Four teams, three matches, using the scale above. Each cell shows finish, eliminations and the points that produce.

| Team | Match 1 | Match 2 | Match 3 | Total |
|---|---|---|---|---|
| Alpha | 1st, 7 kills = 17 | 4th, 3 kills = 7 | 2nd, 5 kills = 11 | 35 |
| Bravo | 2nd, 9 kills = 15 | 1st, 5 kills = 15 | 3rd, 2 kills = 7 | 37 |
| Charlie | 3rd, 4 kills = 9 | 2nd, 8 kills = 14 | 1st, 4 kills = 14 | 37 |
| Delta | 4th, 2 kills = 6 | 3rd, 6 kills = 11 | 4th, 1 kill = 5 | 22 |

Bravo and Charlie are level on 37. Bravo has one first place, and Charlie has one first place, so the first tie-break does not separate them. The next step looks at total placement points: Bravo has 6 + 10 + 5 = 21 and Charlie has 5 + 6 + 10 = 21. Level again, so total eliminations decide it: Bravo has 16 and Charlie has 16. Still level, and the last step is the placement in the most recent match, where Charlie finished first. Charlie ranks above Bravo.

This is why you write the tie-break order down before the event. Two teams can be level for three steps in a row.` },
      { h2: "Tie-break order", md: `${B.pubgmTiebreak.text}

You can reuse that order or choose your own. Whatever you pick, keep these rules:

- Decide it before match one and put it on the rules page.
- Apply it the same way for every pair of tied teams.
- Count the steps in the order given. Do not skip to eliminations because they feel fairer.
- If a tie for first place still cannot be broken, say whether you will play an extra match.` },
      { h2: "Build your own points table", md: `1. Pick a placement scale. Copy the one above, or shorten it if you have fewer teams in a lobby.
2. Pick a value for an elimination. One point per elimination is the value in the rulebook above. A higher value pushes teams to fight early and a lower value rewards survival.
3. Write the tie-break order.
4. Open the [points table calculator](/tools/points-table/), enter placement and eliminations for each match and let it rank the teams.
5. Show the table on a screen after every match, so teams see their standing while the next lobby loads.

For a short walk-through of the layout, read [how to build a points table](/guides/points-table-maker-guide/). For the same idea in another game, see [Free Fire points system and points table](/guides/free-fire-points-system-and-points-table/).` },
      { h2: "Common mistakes", md: `- Changing the scale after seeing the first lobby. If a scale needs a fix, announce it before the next match and apply it to every match from then on, in writing.
- Counting eliminations from screenshots without checking the match results screen. Agree one source of truth, such as the in-game results screen shown to an admin.
- Giving full points to a team that was disqualified in the match. Write down what a disqualified team scores.
- Forgetting substitutes in the roster. ${B.pubgmRoster.text} Decide how many substitutes your event allows.
- Posting totals but not each match's breakdown. Teams cannot check your sums if they only see the total.` },
    ],
    faq: [
      { q: "How many points is first place in the PUBG Mobile points system?", a: "In the 2025 PMNC Qatar rulebook, first place is worth 10 placement points, plus 1 point for each elimination. Other organisers set their own values, so a custom room can use a different scale. Whatever you choose, publish it before the first match and keep it the same for every lobby." },
      { q: "What breaks a tie on a PUBG Mobile points table?", a: "The 2025 PMNC Qatar rulebook uses first-place finishes, then total placement points, then total eliminations, then the finish in the most recent match. For your own event, pick an order, write it on the rules page before match one, and apply every step in order for every tied pair of teams." },
      { q: "Is the PUBG Mobile points system the same as BGMI's?", a: "Do not assume so. The two games have separate event rules, and each organiser sets its own scoring. This guide uses one real PUBG Mobile rulebook as an example. For BGMI, use the BGMI guide on this site, then check the rulebook of the event you are copying." },
    ],
    related: ["bgmi-points-system-explained", "points-table", "points-table-maker-guide"],
    cta: { label: "Open the points table calculator", href: "/tools/points-table/" },
  },

  {
    slug: "pubg-mobile-tournament-schedule-template",
    title: "PUBG Mobile tournament schedule template you can copy",
    seoTitle: "PUBG Mobile tournament schedule template",
    description: "A copyable PUBG Mobile tournament schedule: a two-day qualifier and final run-sheet with times, lobby checks, breaks and result slots, plus how to size it.",
    tag: "Schedule template",
    answer: "A PUBG Mobile tournament schedule is a timed run-sheet: room open, roster check, each match with a gap, a longer break, results and awards. The example below runs six matches in about five hours. Replace the match length with the time you measure in a practice lobby.",
    intro: "A schedule is the first thing teams read and the first thing that breaks. The usual failure is simple: the organiser guesses how long a match lasts, then every later slot is wrong. This guide gives a two-day template you can copy, and says which numbers are examples to replace. For how a table scores the matches, see the [PUBG Mobile points system guide](/guides/pubg-mobile-points-system-and-table/).",
    sections: [
      { h2: "Decide four numbers first", md: `Everything in the schedule follows from four numbers. None of them are fixed by the game, so measure or choose them:

- Teams in each lobby. This sets how many lobbies you need.
- Matches each team plays on each day.
- Minutes one match takes, from room start to the results screen. Time two practice matches and use the longer one.
- Minutes between matches for joining, reporting results and resetting.

Examples below use 35 minutes per match and 15 minutes between matches. These are examples. Your number will differ, and a number you timed yourself beats any template.` },
      { h2: "Day one: qualifier run-sheet (example)", md: `| Time | Slot | What happens |
|---|---|---|
| 13:30 | Room open | Captains join, substitutes listed |
| 13:50 | Roster check | Match names to the registration list |
| 14:00 | Match 1 | Points table updated after |
| 14:50 | Match 2 | Short gap used for results |
| 15:40 | Match 3 | Table check |
| 16:15 | Break, 20 min | Food, charging, questions |
| 16:35 | Match 4 | Table check |
| 17:25 | Match 5 | Table check |
| 18:15 | Match 6 | Last match of the day |
| 18:50 | Results | Standings posted, finalists named |

The times follow the example numbers: each match is 35 minutes, the gap between matches is 15 minutes, and the longer break after match three is 20 minutes.` },
      { h2: "Day two: final, with a cut line", md: `For a final, take the top teams from the qualifier. The cut is your choice. A common method is to take a fixed number of teams, such as the top 16 of 24, and say so in advance.

1. Publish the finalists the same evening as the qualifier, with the final standings and the tie-breaks used.
2. Repeat the same room-open and roster-check slots, because rosters change between days.
3. Run the same pattern of matches and one longer break.
4. Reset the table to zero for the final unless your rules say points carry over. State which.
5. Keep 30 minutes at the end for a possible tie, a protest, and prize giving.

${B.pubgmRoster.text} Name the substitute slots in the roster check, so nobody swaps players in the middle of a lobby.` },
      { h2: "Size it with the schedule tool", md: `Do not do the clock arithmetic by hand. Open the [match schedule maker](/tools/schedule/), type the start time, the number of matches and the minutes per match. In the options, set the gap between matches, how many lobbies run at the same time, and a longer break after a number of matches. It returns a timed run-sheet you can download as a CSV or print.

If you have more teams than one lobby holds, set two lobbies running at the same time, and remember that each extra lobby needs its own admin to watch the room and read the results.

For the room details that go with the schedule, such as the room ID and password card, see [custom room card, ID and password template](/guides/custom-room-card-id-password-template/).` },
      { h2: "What to publish to teams", md: `A schedule teams can act on fits on one phone screen. Include:

- The date, the start time and the time the room opens
- The match times, with a note that they are planned times
- The break times
- The roster check rule and the deadline for substitutes
- Where results and standings will be shown
- The name and number of one admin to contact

For the check-in side of an in-person event, the [gate check-in scanner](/tools/check-in/) reads QR passes at the door. For the sign-up that comes before all this, use the [registration form](/tools/registration/). A similar template for another title is in the [BGMI tournament schedule template](/guides/bgmi-tournament-schedule-template/).` },
      { h2: "Common mistakes", md: `- Using a guessed match length. Run a practice match, or use the longest match from your last event.
- No buffer before a cut-line announcement. Reserve time to check the points sheet before you read names aloud.
- Scheduling a final on the same evening without a rest. Teams play worse and protests rise.
- Printing the schedule without a "planned time" note, then running 20 minutes late and being blamed for each delay.
- Setting no rule for a team that is late to the room. Write the wait time and what happens next in the rules, for example whether they join the next match with points from the one they missed set to zero.` },
    ],
    faq: [
      { q: "How long should a PUBG Mobile tournament match slot be?", a: "The game does not fix one number for a custom room, so measure it. Run a practice lobby, time it from room start to the results screen, and add your gap for joining and reporting. The template here uses 35 minutes plus 15 as an example only. Replace both with your own timed values." },
      { q: "How many matches should one day of a PUBG Mobile tournament have?", a: "Pick the number that your players and admins can stay sharp for. The example uses six matches with one longer break, which runs about five hours of play. If your lobby is on phones, plan for tired players late in the day, and keep the final day for the matches that decide the winner." },
      { q: "Do points carry over from the qualifier to the PUBG Mobile final?", a: "That is an organiser choice, not a game rule. Many events reset the table for the final, but others carry over some points. Pick one, write it on the rules page before the qualifier, and repeat it on the final-day schedule so no team can claim they were told something else." },
    ],
    related: ["pubg-mobile-points-system-and-table", "bgmi-tournament-schedule-template", "custom-room-card-id-password-template"],
    cta: { label: "Build the timed run-sheet", href: "/tools/schedule/" },
  },

  {
    slug: "free-fire-tournament-schedule-template",
    title: "Free Fire tournament schedule template for one day",
    seoTitle: "Free Fire tournament schedule template",
    description: "A one-day Free Fire tournament schedule with two rooms running at once, a lunch break and a final, with the example arithmetic and what to tell teams.",
    tag: "Schedule template",
    answer: "A Free Fire tournament schedule for one day can use two stages: groups play in separate rooms at the same time, then the top teams play a final. The example below puts 24 teams through four group rounds and three final matches, ending near 16:30. Replace the match length with your measured time.",
    intro: "Most Free Fire events fit in a single day. The trick to a good schedule is running two rooms at once for the qualifying stage, so you finish the group games before lunch. This guide walks through one complete day with the arithmetic shown, so you can change the numbers and keep the structure.",
    sections: [
      { h2: "The structure in one paragraph", md: `Split the teams into two groups. Each group plays in its own room, so two matches run at once. After four rounds, combine the scores, take the top half into a final room and play three matches. The winner is the final room's best total.

For a format with more detail, read [Free Fire battle royale tournament format](/guides/free-fire-battle-royale-tournament-format/). For the scoring itself, see [Free Fire points system and points table](/guides/free-fire-points-system-and-points-table/).` },
      { h2: "The numbers behind the example", md: `These are example values, not game rules. Change them for your event.

| Item | Example value |
|---|---|
| Teams | 24, split into two groups of 12 |
| Group rounds | 4, with both rooms playing at the same time |
| Matches played in the group stage | 8 (4 rounds times 2 rooms) |
| Minutes per match | 40 |
| Gap between matches | 10 |
| Final | Top 12 teams, 3 matches |
| Lunch break | 50 minutes |

Time one practice match first. If your real match takes 50 minutes, every later time in the sheet moves, and the table below should be redone.` },
      { h2: "Run-sheet for the day", md: `| Time | Slot |
|---|---|
| 09:30 | Both rooms open, roster check |
| 10:00 | Group round 1, both rooms |
| 10:50 | Group round 2 |
| 11:40 | Group round 3 |
| 12:30 | Group round 4 |
| 13:10 | Lunch, scores combined, finalists announced |
| 14:00 | Final match 1 |
| 14:50 | Final match 2 |
| 15:40 | Final match 3 |
| 16:20 | Last results check |
| 16:30 | Prizes and certificates |

Each round starts 50 minutes after the last: 40 for the match and 10 for the gap. The final starts at 14:00 after the lunch break.` },
      { h2: "Let the tool do the sums", md: `In the [match schedule maker](/tools/schedule/), the group stage is: first match 10:00, number of matches 8, minutes per match 40, matches at the same time 2, minutes between rounds 10. The tool returns four rounds with two matches each. Run it again for the final with 3 matches and 1 at a time, starting after lunch.

Two things the tool cannot know: who watches each room, and how teams get from one room to the next. Name one admin per room and write their name on the run-sheet.` },
      { h2: "Telling teams what to expect", md: `Send this on the evening before:

1. The date, the room-open time and the start of round 1.
2. Which group each team is in, and which room they join.
3. How the finalists are chosen and the tie-breaks used, in a sentence each.
4. That the times are planned times and a late round shifts everything after it.
5. One contact number for the admin.

For the room itself, the [custom room setup guide for BGMI and Free Fire](/guides/bgmi-and-free-fire-custom-room-setup-guide/) covers room settings and the card you share. To place teams in groups fairly, the [random team generator guide](/guides/random-team-generator-for-fair-teams/) helps, and so does the [groups maker](/tools/groups/).` },
      { h2: "Common mistakes", md: `- Planning the final straight after the last group round, with no time to add up scores and read the cut.
- Running both rooms with one admin. One room will always be forgotten.
- Putting the strongest registered teams all in one group by accident. Seed or draw the groups on a recording or live in the call.
- Forgetting a lunch break and finding every team ask for one at the worst moment.
- Not saying whether points carry from the group stage into the final.` },
    ],
    faq: [
      { q: "How long does a Free Fire custom room match take?", a: "It depends on the mode, the map and the players, so time it yourself. Run a practice lobby, note the time from room start to the results screen, and add your gap. The 40 minutes used in this template is only an example for planning, and your real figure may be different." },
      { q: "Can two Free Fire rooms run at the same time in one tournament?", a: "Yes, if you have two admins and each room has its own ID and password. It halves the day for a group stage. Give each admin the same rules sheet and the same results format, so the two tables can be combined without arguments afterwards." },
      { q: "When should a Free Fire tournament schedule start the final?", a: "After a break long enough to add up scores, announce finalists and let teams rest. In the example this is 50 minutes at lunch. If you run the final the next day instead, publish the finalists the same evening so teams can prepare and do not learn the cut the next morning." },
    ],
    related: ["free-fire-battle-royale-tournament-format", "free-fire-points-system-and-points-table", "bgmi-and-free-fire-custom-room-setup-guide"],
    cta: { label: "Build the timed run-sheet", href: "/tools/schedule/" },
  },

  {
    slug: "efootball-tournament-rules-template",
    title: "eFootball tournament rules template with match settings",
    seoTitle: "eFootball tournament rules template",
    description: "An eFootball tournament rules template with match settings from a real rulebook, pause and result rules, tie-breaks and numbered clauses you can paste and edit.",
    tag: "Rules template",
    answer: "An eFootball tournament rules template should fix the match settings, the pause rules, how results are confirmed and how ties are broken. One published national-qualifier rulebook used 10-minute matches, no extra time and five substitutes. Copy the structure, then set your own values.",
    intro: "eFootball events fail in small ways: a player pauses at the wrong time, a result is disputed, two players tie on points. A short rulebook decided in advance removes all three arguments. Below are the settings from one real rulebook, a set of numbered clauses to paste, and the gaps you must fill in yourself. Pair it with the general [esports tournament rules template](/guides/esports-tournament-rules-template/).",
    sections: [
      { h2: "Settings used by one real rulebook", md: `${B.efootballSettings.text} That rulebook was written for a national qualifier played on one console platform, and it dates from January 2024, so treat it as an example and not a current standard. Your event may use a phone, a different version or another match length.

| Setting | Value in that rulebook | Your value |
|---|---|---|
| Match time | 10 minutes | |
| Extra time | Off | |
| Injuries | Off | |
| Substitutes | 5 | |
| Penalty shootout | On, off in the group stage | |
| Pauses | See the next section | |

Copy the table into your rules and fill the last column. A blank cell is a future argument.` },
      { h2: "Pauses and preparation", md: `Two clauses cause most of the fuss in a one-versus-one game.

${B.efootballPauses.text}

${B.efootballPrep.text}

You can copy these ideas or set a different number. The point is to name the limit, the moment pauses are allowed and what happens to a player who is not ready.` },
      { h2: "Rules you can paste", md: `1. Eligibility. Players must have their own game account and play from it. Write the minimum age your event requires.
2. Format. State the bracket or league, the number of games in a match, and the seeding method.
3. Settings. Use the table above. Both players check the settings before kick-off.
4. Kick-off. A game counts once both players are loaded in and the first kick-off has been taken. Restarts after that need an admin.
5. Pauses. Pause only when the ball is out of play, within the limit in your rules.
6. Disconnection. If a game is interrupted by a power or connection fault, the admin decides whether to replay it. Write the maximum wait.
7. Result. Both players send a screenshot of the final screen to the admin. ${B.efootballResults.text}
8. Late arrival. A player not ready by the start time loses the game after the grace period in your rules.
9. Conduct. Insults, deliberate losing and bug exploits lead to a warning, a forfeit or removal.
10. Changes. The admin may amend the rules after a patch, and announces any change to all players before it applies.` },
      { h2: "Tie-breaks for a league or group", md: `If you run a group stage, rank by points first. For equal points, you need a written order.

${B.efootballTiebreak.text}

That mini-league idea is worth copying: when three players tie, look only at the games between those three. If one player separates from the other two, rank them, and apply the same steps again to the rest.

For the format itself, a [round robin generator](/tools/round-robin/) writes the fixtures and a league table, and a [bracket maker](/tools/brackets/) handles the knockout stage. If your player count is large, see [how to choose a tournament format](/guides/choosing-a-tournament-format/).` },
      { h2: "Disputes and protests", md: `Give players a clear and short route to complain.

- A protest goes to the admin within a stated time after the game, with the screenshot attached.
- The admin replies in writing and the decision stands for that game.
- A second admin reviews only if the first admin played in the event.

Keep protest records in one place so you can look back if the same issue returns in the next round.` },
      { h2: "Common mistakes", md: `- Leaving match time unwritten, so one player expects 10 minutes and the other 15.
- Allowing pauses at any moment. A late pause during an attack is how fights start.
- Taking results by chat message with no screenshot.
- Using a rulebook from another year without checking that settings still exist in your version of the game.
- Not stating what happens in a drawn knockout match. Say whether it goes to a penalty shootout or a replay.` },
    ],
    faq: [
      { q: "What match time should an eFootball tournament use?", a: "There is no single standard. One published national-qualifier rulebook used 10 minutes per match with extra time off. Another organiser may choose longer. Pick a value your schedule can afford, write it into the rules, and make both players confirm the settings before kick-off so nothing is changed by mistake." },
      { q: "How should eFootball tournament players report results?", a: "Ask both players to take a screenshot of the final screen and send it to the admin. The rulebook used here treats a result the referee has not confirmed as not counted. Copy that rule if you want a clean record, and say which chat or form the screenshots must go to." },
      { q: "Do eFootball tournament rules need a tie-break for groups?", a: "Yes, whenever players can finish level on points. One rulebook looks only at the matches between the tied players: head-to-head result, then goal difference, then goals scored. Choose your own order, write it before the first game and apply every step in the same sequence for every group." },
    ],
    related: ["esports-tournament-rules-template", "choosing-a-tournament-format", "tournament-fixture-generator-guide"],
    cta: { label: "Generate the group fixtures", href: "/tools/round-robin/" },
  },

  {
    slug: "cs2-tournament-schedule-template",
    title: "CS2 tournament schedule template for an 8-team day",
    seoTitle: "CS2 tournament schedule template",
    description: "A CS2 tournament schedule for eight teams in one day: bracket slots, server waves, map veto time, overtime padding and a printable run-sheet you can edit.",
    tag: "Schedule template",
    answer: "A CS2 tournament schedule is built from server slots, not from the clock. Eight teams in a single-elimination bracket need seven matches. With two servers and a one-hour slot (an example), the quarter-finals take two hours, the semi-finals one, and a best-of-three final up to three more.",
    intro: "A Counter-Strike 2 event is easy to schedule badly, because the match length is not fixed: a close game can reach overtime. The fix is to plan by slots, with padding. Below is a one-day plan for eight teams, with the arithmetic shown so you can swap in your own numbers.",
    sections: [
      { h2: "Why CS2 match length varies", md: `${B.cs2Rounds.text} So a match can end before the last round when one side has clearly won, and it can run longer when the score is tied after regulation. Add a map pick and ban phase before it, and a warm-up.

You cannot read a fixed length off the rules, so measure it. Time two scrim matches on the same server and use the longer one, plus a buffer. The slot used below is 60 minutes. That is an example, not a game value.` },
      { h2: "How many matches and servers", md: `A single-elimination bracket with 8 teams plays 7 matches in total: 4 quarter-finals, 2 semi-finals and 1 final. Every extra team adds one match, and a double-elimination bracket needs more. See the [double elimination maker](/tools/double-elimination/) if you want a second chance for teams.

The number of servers decides the wall-clock time:

| Servers | Quarter-finals | Semi-finals | Final |
|---|---|---|---|
| 4 | 1 slot | 1 slot | 1 match |
| 2 | 2 slots | 1 slot | 1 match |
| 1 | 4 slots | 2 slots | 1 match |

With one server the day is long, so many community events use two.` },
      { h2: "The run-sheet (example, 2 servers)", md: `| Time | Slot | Detail |
|---|---|---|
| 09:30 | Check-in | Rosters confirmed, substitutes listed |
| 10:00 | Quarter-finals 1 and 2 | Both servers, 60-minute slot |
| 11:00 | Quarter-finals 3 and 4 | Both servers |
| 12:00 | Lunch | 45 minutes, bracket updated |
| 12:45 | Semi-finals 1 and 2 | Both servers |
| 13:45 | Break | 30 minutes |
| 14:15 | Final, best of three | Reserve up to three slots, until 17:15 |
| 17:15 | Prizes | Certificates and photos |

The final is the only match that can run long: if it ends in two maps, you finish an hour earlier.` },
      { h2: "Veto, side picks and pace", md: `Put the map selection into the slot rather than before it. Teams take turns removing maps from the pool until one is left, then choose sides. Agree the map pool in your rules from the game's current competitive pool, and check it again on the day, because the pool can change.

- Give each team a captain who submits picks within a stated time.
- Start the veto five minutes before the slot starts, in a shared chat.
- Decide what happens if a team is late: a short wait, then a forfeit for the match, written in the rules.

If your bracket has an odd number of teams, a [bracket maker](/tools/brackets/) places byes for you.` },
      { h2: "Build and print it", md: `The [match schedule maker](/tools/schedule/) takes a start time, a number of matches, minutes per match, and how many matches run at once. For the example above: start 10:00, 4 matches, 60 minutes, 2 at the same time. Run it again for the semi-finals and the final. Print the result and tape it by the check-in desk.

For the fixtures of a league instead of a bracket, read the [tournament fixture generator guide](/guides/tournament-fixture-generator-guide/). To write the rules that go with this schedule, start from the [esports tournament rules template](/guides/esports-tournament-rules-template/).` },
      { h2: "Common mistakes", md: `- Scheduling exact times for rounds that depend on earlier results. Give semi-finals a planned time and say it moves if a quarter-final runs long.
- Forgetting overtime in the plan. A slot that fits only a 24-round match will break.
- One admin for two servers.
- Starting the veto when the slot starts, so the match begins late every time.
- Not saying whether a lost connection means a pause, a replay of the round or a forfeit. Write it down.` },
    ],
    faq: [
      { q: "How many matches does an 8-team CS2 bracket need?", a: "A single-elimination bracket with eight teams needs seven matches: four quarter-finals, two semi-finals and one final. With two servers you can play two matches at a time, so the quarter-finals take two slots. A double-elimination bracket for eight teams needs more matches, so add time." },
      { q: "How long should a CS2 tournament match slot be?", a: "There is no fixed length, because rounds vary and overtime can be played. The example here uses 60 minutes. Time your own scrim matches, add the map veto and a warm-up, then pad for overtime. The final should get a longer reserve than earlier rounds." },
      { q: "Does CS2 competitive play overtime?", a: "Yes. Regulation is capped at 24 rounds, 12 per half, and a tied score goes to a 6-round overtime, according to HLTV's report on Valve's change. Your schedule should leave room for that, and your rules should say whether you play overtime or use another tie-break in the early rounds." },
    ],
    related: ["tournament-fixture-generator-guide", "esports-tournament-rules-template", "choosing-a-tournament-format"],
    cta: { label: "Build the timed run-sheet", href: "/tools/schedule/" },
  },

  {
    slug: "valorant-tournament-poster-guide",
    title: "Valorant tournament poster: what to put on it and how",
    seoTitle: "Valorant tournament poster guide",
    description: "How to design a Valorant tournament poster: the details to include, which shape to use for WhatsApp and Instagram, and how to make one in minutes in your browser.",
    tag: "Poster guide",
    answer: "A Valorant tournament poster needs seven things: event name, game and team size, date, venue or server, prize, sign-up link and organiser. Make a 4:5 poster for the feed, a 9:16 story for status and a square for chats. The free poster maker has a Valorant look and exports all three.",
    intro: "Players decide in about three seconds whether a poster is worth a message. They look for a game, a date and a prize. If those are buried, the poster does not get a click. This guide lists what to put on a Valorant poster, how to fit it, and how to make the three common shapes in one sitting. It is a companion to the [Free Fire poster guide](/guides/free-fire-tournament-poster-guide/), with the choices that matter for Valorant.",
    sections: [
      { h2: "The seven things every poster needs", md: `1. Event name, large and readable.
2. The game and mode. Write the team size your rules actually require, so no team turns up short.
3. Date and start time.
4. Venue, or "online" with the platform.
5. Prize, stated plainly. If the prize is not yet confirmed, leave it out.
6. How to sign up: a short link or a QR code, and a deadline.
7. Organiser and sponsors.

Everything else is a decoration. If the poster passes the three-second test with these seven, it works.` },
      { h2: "Pick the shape for where it will be seen", md: `The [poster maker](/tools/poster/) exports three shapes, and each fits a place people look.

| Shape | Size in pixels | Best for |
|---|---|---|
| Poster (4:5) | 1080 by 1350 | Instagram feed, Facebook, print on a notice board |
| Story (9:16) | 1080 by 1920 | WhatsApp status, Instagram story |
| Square | 1080 by 1080 | Group chats and link previews |

Make all three from the same details. It takes a minute and each place gets the right shape.` },
      { h2: "Make it in three steps", md: `The tool runs in your browser and does not need an account.

1. Type the event name, date, venue, game, prize and organiser. Add up to two sponsor names or logos.
2. Pick the Valorant look from the five available (Free Fire, BGMI, Valorant, cricket, football) and a shape.
3. Download the picture or use the share button. On a phone the share button opens the share sheet. On a computer it saves the file.

The text fields have length limits so that every line fits the layout, which also keeps your poster readable. If your event name is long, shorten it.` },
      { h2: "Valorant-specific choices", md: `- Say how teams join: a registration link beats a phone number, because it collects the information you need. The [registration form template](/guides/esports-tournament-registration-form-template/) lists the fields.
- State the region or server for online play, since players choose where they queue.
- Name the format in one line, such as "knockout, best of one", so teams know the commitment.
- Do not copy game artwork or logos from the publisher onto your poster unless the publisher's content policy allows it. The poster maker uses its own design, so you do not need them.

For a BGMI event, see the [BGMI tournament poster guide](/guides/bgmi-tournament-poster-guide/), which covers the same steps with that game's details.` },
      { h2: "Where to post it", md: `- Send the square to every team captain and to your Discord or WhatsApp community.
- Post the 4:5 version on the feed with the sign-up link in the caption.
- Put the story on your status the day registration opens, and again three days before the deadline.
- Print the 4:5 version for a college notice board.

After sign-up closes, replace the poster with the bracket or the schedule. A poster that still says "register now" after the deadline costs you trust.` },
      { h2: "Common mistakes", md: `- Putting the prize in tiny text. It is usually the reason a player reads on.
- No deadline. Without one, nobody signs up today.
- A date without a day or a time zone for an online event.
- Dark text on a dark image. Check the poster on a phone in sunlight.
- Posting only one shape and cropping it for the others, which cuts off the date.` },
    ],
    faq: [
      { q: "What size is a Valorant tournament poster for Instagram?", a: "A feed poster in the 4:5 shape, 1080 by 1350 pixels, is a good choice, with a 1080 by 1920 story for the 9:16 view and a 1080 square for chats. The free poster maker on this site exports all three from one set of details, so you can fill in the information only once." },
      { q: "What should a Valorant tournament poster say?", a: "The event name, game, date and start time, venue or online platform, prize if confirmed, how and when to sign up, and who runs it. If the team size matters, write the size your rules require. Leave out any detail you are not sure of, since a wrong date does more harm than a missing one." },
      { q: "Can I use Valorant artwork on my poster?", a: "Check the publisher's fan content or community policy before you do. The simplest safe route is to avoid the publisher's logos and character art and use your own design. The poster maker here draws its own layout in the Valorant colour look and does not include game artwork." },
    ],
    related: ["free-fire-tournament-poster-guide", "bgmi-tournament-poster-guide", "esports-tournament-registration-form-template"],
    cta: { label: "Make a Valorant tournament poster", href: "/tools/poster/" },
  },

  {
    slug: "gaming-team-names-for-valorant-cs2-minecraft-efootball",
    title: "Gaming team names for Valorant, CS2, Minecraft and eFootball",
    seoTitle: "Team names for Valorant, CS2, Minecraft, eFootball",
    description: "Original team name ideas for Valorant, CS2, Minecraft and eFootball, with naming rules for length and tone, so the name fits a bracket and a poster.",
    tag: "Name ideas",
    answer: "A good gaming team name is short, easy to say aloud and fits on a bracket line. Below are original ideas for Valorant, CS2, Minecraft and eFootball, drawn from each game's own vocabulary. Check the name is free in your event's team list before you register it.",
    intro: "Teams often register with a temporary name and then keep it for a year. Naming takes ten minutes, and the name goes on the bracket, the poster and the certificate. The ideas here are made up for this guide. Use them as they are, mix two, or take the pattern and build your own. For other games, see [esports team names ideas](/guides/esports-team-names-ideas/), [BGMI team names](/guides/bgmi-team-names-ideas/) and [Free Fire team names](/guides/free-fire-team-names-ideas/).",
    sections: [
      { h2: "Four rules before you pick", md: `1. Keep it under 20 characters if you can. Bracket cards and score screens cut long names.
2. Make it easy to say. If a commentator has to spell it, it will be dropped.
3. Avoid offensive words, real people and other teams' names. Many events reject them in registration.
4. Check the spelling works in every place it is used: the game's team field, the poster and the certificate.

A short pattern also helps: a game word plus a group word, such as "Clutch" plus "Club", or a place plus a game word.` },
      { h2: "Valorant team name ideas", md: `Valorant words come from rounds, economy and plays: clutch, eco, rotate, retake, plant, defuse, ace.

- Clutch Protocol
- Eco Round Heroes
- Last Site Standing
- Silent Plant
- Retake Club
- Rotate Late
- Pistol Round Poets
- Defuse Diaries
- Third Site Theory
- Ace in Reserve
- Flash and Dash
- Smoke Signal Squad` },
      { h2: "CS2 team name ideas", md: `CS2 vocabulary leans on bomb sites, utility and buy rounds: peek, flash, molotov, defuse, rush, rotate.

- Peek and Pray
- Flashbang Family
- Long A Legends
- Defuse Kit Club
- Molotov Mondays
- Eco Frag Society
- Rush B Rangers
- Bomb Site Bhai
- Anti-Eco Army
- Last Round Lads
- Smoke Line Society
- Half Time Heroes` },
      { h2: "Minecraft team name ideas", md: `Minecraft names come from blocks, mobs and materials. They suit build battles, survival games and mini-game events.

- Creeper Crew
- Redstone Rebels
- Netherite Nomads
- Block Party Brigade
- Obsidian Order
- Pickaxe Poets
- Ender Pearl Express
- Cobblestone Kings
- Villager Union
- Diamond Dig Dogs
- Lava Bucket Legion
- Crafting Table Club` },
      { h2: "eFootball team name ideas", md: `eFootball names borrow from football itself: pitch, press, set pieces, matchday. They also fit club-style teams of two or three players.

- Through Ball Tigers
- Counter Press Club
- Last Minute Winners
- Set Piece Society
- Super Sub FC
- Matchday Mavericks
- Offside Trap
- Penalty Box Poets
- Midfield Maestros
- One Touch Orbit
- Stoppage Time Squad
- Golden Boot Gang` },
      { h2: "Make your own in five steps", md: `1. Pick a word from your game's own language, like "eco" or "creeper".
2. Pick a group word: club, crew, society, army, gang, squad, union.
3. Add a place, a college or a shared joke if you have one: "Pune Eco Society".
4. Say it aloud three times. If it is hard to say, drop a word.
5. Write it in capitals and in lower case to make sure the letters stay distinct.

When your name is ready, register it through the event's form. If your event has no form yet, the [registration form tool](/tools/registration/) makes one. When teams are drawn into groups or brackets, short names fit better in the [bracket maker](/tools/brackets/).` },
      { h2: "Common mistakes", md: `- Copying a known team's name. It confuses fans and can be rejected.
- Using a symbol-heavy tag that cannot be typed on every device.
- A name that only makes sense to the team. Spectators and sponsors read it too.
- Changing the name between rounds, which breaks the points table.
- Choosing a name the night before, then discovering another team in the event has it.` },
    ],
    faq: [
      { q: "What is a good Valorant team name?", a: "A good one is short, easy to say, and uses the game's own vocabulary, such as clutch, eco, retake, plant or defuse. Examples from this guide are Clutch Protocol, Last Site Standing and Retake Club. Check that no team in your event already uses the name before you register." },
      { q: "How do I choose a Minecraft team name?", a: "Start with a block, mob or material, such as creeper, redstone or obsidian, and add a group word like crew, order or union. Say it aloud, and keep it short enough to fit on a bracket or a server tag. Avoid names of real servers or other known teams." },
      { q: "Can an eFootball team name be a football club name?", a: "Avoid real club names, because they belong to the clubs and many events reject them. Use football words instead, such as Through Ball Tigers or Set Piece Society. These read as football but belong to nobody, so no registration or sponsor will object to them." },
      { q: "How long can a team name be in a tournament?", a: "That depends on the event and the game, so check the registration form and the game's team field. Short names of about twenty characters or fewer are safer, because brackets, score screens and certificates cut long names. Test the name on the poster before you finalise it." },
    ],
    related: ["esports-team-names-ideas", "bgmi-team-names-ideas", "free-fire-team-names-ideas"],
    cta: { label: "Open the bracket maker", href: "/tools/brackets/" },
  },

  {
    slug: "how-to-make-an-esports-team",
    title: "How to make an esports team, and how to join one",
    seoTitle: "How to make an esports team (and join one)",
    description: "How to make an esports team or join one: roles, trials, communication habits, picking a name and registering for events, in plain steps with honest expectations.",
    tag: "Team guide",
    answer: "To make an esports team, pick one game, find players you can play with weekly, give each a role, practise together, choose a name and register for events. To join one, show up to open scrims, play your role well and be easy to work with. Nobody can promise results; consistency is what teams notice.",
    intro: "Many teams start in a group chat, not a contract. They last when the members agree on a game, a schedule and who does what. The steps below work for a college team, a friends' squad or a community team that wants to enter its first event. The same steps help if you are the player trying to get in, since you learn what a team is looking for.",
    sections: [
      { h2: "Start with one game and one goal", md: `Pick a single game. A team that plays three games on different nights is not a team in any of them. Then pick a goal you can check: play a full month of scrims, enter one local event, reach the second round.

Write the goal in one sentence in the group chat. It filters people early, since someone who only wants to play casually will say so.` },
      { h2: "Find players and fill roles", md: `Ask in places where people already play: your college, a local Discord, the community of a tournament you follow. Look for people with similar free time, since a skilled player who can never turn up cannot help.

Roles depend on the game. A squad game needs someone calling plays, someone who plays entry or front line, and someone who supports. A one-versus-one game such as a football title needs fewer roles, and a team entry may be two or three players who share a name.

Some rulebooks name the roster size. ${B.pubgmRoster.text} Check the roster rules of the event you want to enter before you recruit.` },
      { h2: "Hold trials that are fair", md: `A trial is a few matches with the team, not a test of one clip.

1. Tell the player the game, the role and the time in advance.
2. Play at least two or three matches, so one bad game does not decide.
3. Watch for communication, calm after a loss and willingness to take a role, as well as the score.
4. Give an answer within a few days, even if it is no.
5. Offer a trial period before an official spot, so both sides can decide.

If you want random teams for an open scrim day, the [random team generator guide](/guides/random-team-generator-for-fair-teams/) covers a fair method.` },
      { h2: "How to join an esports team", md: `If you are the player, these steps help:

- Join open scrims and community servers for your game. Teams recruit from people they have already played with.
- State your game, role, rank or experience, and your free time in one short message. Do not exaggerate it, because the trial will show the truth.
- Be on time, keep your mic clear and accept feedback without arguing.
- Ask what the team expects: practice days, events, and what happens if you cannot attend.
- Expect to be turned down sometimes. A no after a trial is information, and the next team may be a better fit.

Nobody can promise a spot, a prize or a career. A reliable habit of showing up is the part you control.` },
      { h2: "Name, practise and register", md: `1. Pick a name that is short and easy to say. [Esports team name ideas](/guides/esports-team-names-ideas/) has patterns to start from.
2. Agree practice days and hold to them for a month before judging the team.
3. Review one match a week: what went well, what to fix. Keep it to three points.
4. Find events. Local and college events often have a registration form, and the [esports tournament registration form template](/guides/esports-tournament-registration-form-template/) shows the fields you will be asked for: team name, captain, player IDs and contact.
5. Keep a document with every player's in-game ID, so registration takes minutes.

Organisers who want to see how teams are asked to sign up can open the [registration form tool](/tools/registration/).` },
      { h2: "Common mistakes", md: `- Recruiting the best players available without checking their schedules.
- No captain. Decisions and registration then land on whoever is loudest.
- Picking a name the day of the event.
- Entering an event without reading its rules on roster size, substitutes and eligibility.
- Arguing about blame in the group chat after a loss. Review the match instead.
- Treating a trial as a one-match test.` },
    ],
    faq: [
      { q: "How many players do I need to make an esports team?", a: "It depends on the game and the event. Squad games need a full squad plus a substitute, while one-versus-one games may need only one or two entrants. One published rulebook asked for 5 to 6 players, with players beyond four as substitutes. Always read the rules of the event you want to enter." },
      { q: "How do I join an esports team with no experience?", a: "Play in open scrims and community servers, tell teams plainly what you play, your role and your free time, and be reliable. Teams often pick up players they already know from scrims. Expect some refusals. A trial period lets both sides decide without a long commitment." },
      { q: "What roles does an esports team need?", a: "It depends on the game. In a squad game you usually want someone who calls the plan, someone who leads the fight and someone who supports, plus a substitute. Agree the roles during trials by watching who is comfortable where, not by assigning them from a rank or a screenshot." },
    ],
    related: ["esports-team-names-ideas", "random-team-generator-for-fair-teams", "esports-tournament-registration-form-template"],
    cta: { label: "See a team registration form", href: "/tools/registration/" },
  },

  {
    slug: "esports-tournament-certificate-template",
    title: "Esports tournament certificate template: wording and format",
    seoTitle: "Esports tournament certificate template",
    description: "An esports tournament certificate template with wording for winners, runners-up and participants, what to include, and a free maker for Free Fire and BGMI events.",
    tag: "Certificate guide",
    answer: "An esports tournament certificate needs the player or team name, the award, the event, the date, the organiser and a signature. Winner and participation certificates use the same layout with different wording. The free certificate maker produces one A4 landscape page per name in a single PDF.",
    intro: "Certificates cost little and they are the part of an event that players keep, for a CV, a college file or a shelf. Whether your event is a Free Fire, BGMI or Valorant tournament, the same six elements matter. This guide gives you ready wording, a table of award types, and a workflow for printing a hundred certificates without a design program.",
    sections: [
      { h2: "What a certificate should include", md: `- The name, spelled the way the player wants it. Collect it at registration, not on the day.
- The award: Winner, Runner-up, Third place, Participation, or a special award such as Best Player.
- The event name and game.
- The date, and the place if the event was in person.
- The organiser's name, and a logo if you have one.
- At least one signature with a title, such as Event Head or Faculty Coordinator.

Leave out claims you cannot back up, such as a ranking you did not measure. If the event had an official partner, name the partner only with their agreement.` },
      { h2: "Wording you can copy", md: `| Certificate | Sentence |
|---|---|
| Winner | This certificate is presented to NAME for winning EVENT, held on DATE. |
| Runner-up | This certificate is presented to NAME for finishing as runner-up in EVENT, held on DATE. |
| Third place | This certificate is presented to NAME for finishing third in EVENT, held on DATE. |
| Participation | This certificate is presented to NAME for taking part in EVENT, held on DATE. |
| Special award | This certificate is presented to NAME as Best Player of EVENT, held on DATE. |

Keep the sentence short and in the plain past tense. For a team, put the team name in the main line and the players' names under it, or issue a separate certificate to each player.` },
      { h2: "Make them in the certificate maker", md: `The [certificate maker](/tools/certificates/) draws each certificate in your browser as an A4 landscape page and gives you one PDF.

1. Choose how to add names: one per line, or one per line with the award, written as "Winner: Team A".
2. Fill in the event, date, award and organiser. The sentence uses {award}, {event} and {date}, and fills them in for you.
3. Pick a design: classic white for printing, dark esports, or minimal white.
4. Optionally add a logo and edit the heading, wording and the two signature lines.
5. Press download for a PDF with one certificate per name. Up to 100 lines work well in one file.

Because the pages are drawn in the browser, names in Hindi or Marathi print correctly too.` },
      { h2: "Winners and participation, one file or two", md: `If you give every player a participation certificate and also give prizes, make two files: one for the top places with "Award: Name" lines, one for everyone with the participation wording. Print the winners on better paper if you can.

Pull the winner names from your final table. If you used the [points table calculator](/tools/points-table/) or a [points table maker](/guides/points-table-maker-guide/), the order is already there, so copy the top rows into the award lines instead of retyping them.` },
      { h2: "Free Fire and BGMI events", md: `For a Free Fire or BGMI event, put the game in the event line, such as "Monsoon Clash, Free Fire squad tournament". That keeps the certificate useful to the player when they show it to a college or a recruiter.

- Do not add publisher logos unless you have permission.
- Do list the team name and the player names, since one player may be asked to prove they were in the team.
- Mention the format in the event line if it matters, for example "online qualifier".

For rules on the event itself, see [Free Fire tournament rules for organisers](/guides/free-fire-tournament-rules-for-organisers/).` },
      { h2: "Common mistakes", md: `- Misspelled names. Collect and check names before printing, and print a single test page first.
- Awards typed by hand on the day, with the wrong place next to the wrong name.
- No date. A certificate without a date is hard to use later.
- A dark design for a printer that would use a full tray of ink. Use a white design for print and a dark one for sharing on a phone.
- Signatures nobody agreed to. Ask the signatory first.` },
    ],
    faq: [
      { q: "What should an esports certificate say?", a: "The player or team name, the award, the event and game, the date, the organiser and a signature with a title. Keep the sentence short, such as: presented to NAME for winning EVENT, held on DATE. Leave out ranks or claims you did not measure, and check every name against the registration list." },
      { q: "How do I make a Free Fire tournament certificate for free?", a: "Open the certificate maker on this site, add the names or award lines, fill in the event and date and pick a design. It draws each certificate in your browser and gives you one PDF. Put Free Fire in the event line, and skip the publisher's logo unless you have permission to use it." },
      { q: "Can I make a BGMI tournament certificate for every participant?", a: "Yes. Add one name per line, set the award to Participation, and download one PDF with a page for each person. If you also want winner certificates, use the Name plus award mode with lines such as Winner: Team A, and print those on better paper." },
    ],
    related: ["points-table-maker-guide", "free-fire-tournament-rules-for-organisers", "esports-tournament-rules-template"],
    cta: { label: "Make certificates in the browser", href: "/tools/certificates/" },
  },

  {
    slug: "esports-tournament-flyer-and-banner-guide",
    title: "Esports tournament flyer and banner: sizes and content",
    seoTitle: "Esports tournament flyer and banner guide",
    description: "How to make an esports tournament flyer and banner: which sizes suit print, feed, story and stage, what content goes on each, and how to make the flyer free.",
    tag: "Design guide",
    answer: "A flyer is a handout that carries the full details, and a banner is a large sign with only the name, date and venue. Make the flyer on A4 or a 4:5 picture, and give your printer the exact banner size. The free poster maker makes 1080 by 1350, 1080 by 1920 and square pictures.",
    intro: "People use the words flyer, poster and banner as if they were the same thing, and then print the wrong size. They are different jobs. A flyer is read in the hand, a banner is read across a room. This guide says what goes on each, which sizes to choose, and what the free tool covers and does not cover.",
    sections: [
      { h2: "Flyer or banner: which do you need", md: `| Item | Read from | Carries | Typical use |
|---|---|---|---|
| Flyer | Arm's length | All details: game, date, venue, prize, sign-up | Handed out at college, posted in chats |
| Banner | Across a room | Event name, date, venue only | Stage, entrance, venue wall |
| Story or status | Phone, a few seconds | Name, date, one call to action | WhatsApp status, Instagram story |

Choose by reading distance. If a person will stand next to it, it can hold detail. If they walk past, it cannot.` },
      { h2: "What goes on a flyer", md: `1. Event name, large.
2. Game and format in one line.
3. Date, start time and venue, or the online platform.
4. Prize, only if confirmed.
5. How to sign up, with a short link or QR code, and the deadline.
6. Organiser and sponsor names.
7. A contact number or handle for questions.

Keep text to what a person can read in ten seconds. Put the sign-up on the flyer itself, since a flyer without it sends people to ask you for the link.` },
      { h2: "What goes on a banner", md: `A banner has room for three things.

- The event name, in letters you can read from the back of the room.
- The date and the venue.
- Sponsor logos, if they paid or supplied the banner.

Do not put prize details, rules or sign-up links on it. A banner is branding. If you want a QR code on it, make it large and test it from the distance people will stand.` },
      { h2: "Sizes that work", md: `Sizes depend on where the file goes. Use these as starting points.

| Use | Size | Note |
|---|---|---|
| Feed post | 1080 by 1350 pixels (4:5) | The size the poster tool exports as Poster |
| Story or status | 1080 by 1920 pixels (9:16) | The tool's Story size |
| Chat or link preview | 1080 by 1080 pixels | The tool's Square size |
| Printed flyer | A4, 210 by 297 mm | A common office paper size |
| Large printed banner | Ask your printer | Sizes and resolution are set by the printer |

For banners, do not guess. Ask the printer for the finished size, the file type and the resolution they need, then design at that size. Ask whether they want extra margin around the edges for trimming.` },
      { h2: "Make the flyer for free", md: `The [tournament poster maker](/tools/poster/) draws the picture in your browser. Type the event name, date, venue, game, prize and organiser, add up to two sponsors, pick one of five looks (Free Fire, BGMI, Valorant, cricket or football) and a shape. Then download or share it.

It makes feed, story and square pictures. It does not make wide banners for a printer, so for a large venue banner use a design program or ask your printer to set the layout from your text and logos.

If you are making posters for a specific game, see the [Free Fire poster guide](/guides/free-fire-tournament-poster-guide/) and the [BGMI poster guide](/guides/bgmi-tournament-poster-guide/). For the sign-up link that goes on the flyer, use the [registration form tool](/tools/registration/).` },
      { h2: "Common mistakes", md: `- Designing a banner at flyer size and stretching it, which makes it blurry.
- Too much text on the banner. People read the name and nothing else.
- A QR code too small to scan from where people stand. Test it before printing.
- No deadline on the flyer.
- Printing without a proof. Ask the printer for a sample or check the file at full size on screen.
- Forgetting sponsors who were promised a place on the banner.` },
    ],
    faq: [
      { q: "What size should an esports tournament flyer be?", a: "For print, A4 (210 by 297 mm) is a common choice. For phones, a 1080 by 1350 pixel 4:5 picture suits the feed and 1080 by 1920 suits stories. The free poster maker here exports those pixel sizes. Pick the one that matches where people will see it, and make a version for each place." },
      { q: "What size should an esports tournament banner be?", a: "It depends on where it hangs and what your printer accepts, so ask the printer for the finished size, file type and resolution before you design. Do not stretch a flyer to fit. Keep the banner to the event name, date, venue and sponsor logos, so it reads from across the room." },
      { q: "What is the difference between a flyer and a banner?", a: "A flyer is handed out and read up close, so it carries the full details: game, date, venue, prize and sign-up. A banner is a large sign read from a distance, so it carries only the name, date and venue. Make both from the same branding so they look like one event." },
    ],
    related: ["free-fire-tournament-poster-guide", "bgmi-tournament-poster-guide", "valorant-tournament-poster-guide"],
    cta: { label: "Make a tournament poster", href: "/tools/poster/" },
  },
];
