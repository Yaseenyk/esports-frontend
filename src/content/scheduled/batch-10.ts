import type { Draft } from "./types";

/** Posts 90 to 100. */
export const BATCH_10: Draft[] = [
  {
    slug: "fortnite-custom-lobby-and-arena-points",
    title: "Fortnite custom lobby and points: running a scored tournament",
    seoTitle: "Fortnite custom lobby and points tournament",
    description: "How to run a Fortnite tournament with custom lobbies and a points system: modes, lobby limits, placement and elimination points, rounds, finals and fair play checks.",
    tag: "Game guide",
    answer: "Choose a mode, split entrants into lobbies, play several rounds with points for placement and eliminations, rank by total points and run a final lobby. Game modes and custom options change, so check what is available and write your settings down.",
    intro: "Fortnite events are scored, not bracketed: many players or teams share a match, and points decide the ranking over several rounds. That makes the points table and the lobby plan the heart of the event. Get them right, and the rest is routine.",
    sections: [
      { h2: "Choose the mode", md: `Fortnite battle royale has solo, duos, trios and squads modes. Pick the one that fits your community and your numbers. Solo events are simplest to score, and squads need a rule for how team points are added.

Check which custom options the game currently offers, because they change between seasons and updates. Write the final settings on one sheet and use it for every lobby.` },
      { h2: "Plan the lobbies", md: `A lobby holds a limited number of players, set by the game. Divide your entrants into lobbies of that size or smaller, and give each lobby a lead who creates the room and records results.

| Entrants | Suggested plan |
|---|---|
| One lobby | Several rounds in the same lobby |
| A few lobbies | Qualifier lobbies, then a final lobby |
| Large field | Two qualifier stages, then a final |

The [group stage and knockout guide](/guides/group-stage-and-knockout-planning/) shows the same qualifier logic for other formats.` },
      { h2: "Points", md: `Use points for placement and for eliminations, and publish the scale before the first round. Weight placement more if you want to reward survival, and eliminations more for aggressive play.

Keep the scale the same for all rounds, or say clearly which rounds are different. The [points table guide](/guides/points-table/) and the [points table tool](/tools/points-table/) help you record and rank. Compare with the approach in [Apex Legends points and lobbies](/guides/apex-legends-tournament-points-and-lobbies/), which uses similar ideas.` },
      { h2: "Rounds and finals", md: `Decide how many rounds each lobby plays, and how the finalists are chosen: the top players by total points from each lobby. Consider a cutoff style final, as in [points cutoff finals](/guides/bgmi-points-cutoff-finals-format/), if you have time and a way to explain it.

Leave a short break between rounds, so players can rest and you can update the table.` },
      { h2: "Teams and teaming", md: `In solo and duo events, ban cooperation between different teams. Write a clear rule and a penalty, and say who decides. Use referees to watch for suspicious behaviour, and ask finalists to record their games.

For team modes, say how points are shared among teammates, and how substitutes are handled. The [roster guide for Valorant](/guides/valorant-roster-and-substitute-rules/) shows the structure you can adapt.` },
      { h2: "Fair play and records", md: `Check player names against registered entries at the lobby. Use the [anti-cheating guide](/guides/preventing-cheating-in-online-tournaments/) for broader checks, and the [Fortnite rules guide](/guides/fortnite-tournament-rules-and-scoring/) for a starting rules page.

Record placement and eliminations after every round in one sheet, and post a screenshot of the table. Keep the sheet until the protest window closes.` },
      { h2: "A sample plan for 40 solo players", md: `Suppose lobbies hold up to 20 players on your setup. Run two qualifier lobbies of 20, each playing three rounds. Add the points, and take the top ten from each lobby into a final lobby of 20, which plays four rounds. Rank the final by total points and announce the winner after the protest window.

Check the timing: each round has a set length plus a break, so three qualifier rounds, a pause and four final rounds fill several hours. Test it with the [schedule maker](/tools/schedule/), and keep a buffer, since lobbies start late while players join and update the game.` },
      { h2: "Common mistakes", md: `- Lobby size larger than the game allows.
- Changing the points scale between rounds without saying.
- No rule against teaming.
- Results kept in several places.
- Not checking custom options after a game update.` },
    ],
    faq: [
      { q: "How do I run a Fortnite tournament with points?", a: "Pick a mode, split entrants into lobbies of the allowed size, play several rounds with points for placement and eliminations, rank by total points and run a final lobby. Publish the points scale, record results after every round in one sheet and write your custom settings down." },
      { q: "How should I score placement and eliminations?", a: "Choose a scale yourself and publish it before the first round. Weight placement more to reward survival, or eliminations more for aggressive play. Keep it the same across rounds unless you say otherwise, and record every round's results in one table so players can check the totals." },
      { q: "How do I prevent teaming in a Fortnite event?", a: "Write a rule that bans cooperation between different players or teams, set a penalty, and name who decides. Use referees to watch lobbies, check names against registered entries, and ask finalists to record their games so you can review suspicious rounds if someone protests." },
    ],
    related: ["fortnite-tournament-rules-and-scoring", "apex-legends-tournament-points-and-lobbies", "bgmi-points-cutoff-finals-format", "points-table"],
    cta: { label: "Build the points table", href: "/tools/points-table/" },
  },

  {
    slug: "tournament-photo-and-content-plan",
    title: "Tournament photo and content plan: what to capture and when to post",
    seoTitle: "Tournament photo and content plan",
    description: "A photo and content plan for tournaments: a shot list, who captures what, consent, captions, a posting schedule before, during and after and a simple folder system.",
    tag: "Organiser guide",
    answer: "Make a short shot list, assign one person to capture, get consent for photos, post a teaser before the event, quick updates during it and a results post after. Keep photos in one folder with clear names. Content makes the next event easier to promote and sponsor.",
    intro: "Photos and short posts are the proof that your event happened. They also feed your next announcement, your sponsor pitch and your players' memories. A small plan, made beforehand, beats frantic phone snapping on the day.",
    sections: [
      { h2: "Make a shot list", md: `List the pictures you want before the event, so nobody has to think about it during.

| Moment | Why it matters |
|---|---|
| Setup and venue | Shows scale and effort |
| Check-in desk | Shows organisation |
| Matches in progress | The core content |
| Reactions and crowd | Shows energy |
| The final | The key moment |
| Winners with certificates | The post-event hero image |
| Volunteers and referees | Thanks, and recruiting for next time |

Add a few wide shots and a few close ones. Wide shots show the venue, and close shots show people.` },
      { h2: "Assign a person", md: `Name one person as the photographer, and let them skip other duties while shooting. If you have none to spare, take photos at the key moments only: opening, the final, the prize giving.

A phone is enough. Clean the lens, turn on the grid, and shoot horizontally for the poster and vertically for stories. Ask the photographer to back up pictures the same night.` },
      { h2: "Consent and privacy", md: `Ask permission before taking and posting photos, especially of players under 18, and follow your school's or club's policy. Put a line in the registration form: "We take photos at the event and may post them. Tell us if you prefer not to appear." The [registration form tool](/tools/registration/) can add it.

Do not post photos of private information such as screens with phone numbers. For young players, see [age groups and junior tournaments](/guides/age-groups-and-junior-tournaments/).` },
      { h2: "A posting schedule", md: `Plan posts in three stages.

1. Before: the announcement with a poster, as in [how to announce a tournament](/guides/how-to-announce-a-tournament/), and a reminder the day before.
2. During: one or two quick updates, such as a bracket photo or a match moment.
3. After: the results post, as in the [results template](/guides/tournament-results-announcement-template/), with the winners' photo, and a thank-you post for volunteers a day later.

Posts do not need to be fancy. Consistency matters more than polish.` },
      { h2: "Captions", md: `Keep captions short: what happened, who, and what is next. Add the event name and a link. Tag teams only if they agreed, and thank sponsors by name.

Example: "[Winner] took the title at [Event] after a close final. Thank you to all [N] teams, our referees and volunteers. Next event: [date]."` },
      { h2: "A simple folder system", md: `Create one folder per event, with sub-folders for photos, results, posters and certificates. Name files with the date and a short label, such as 2026-11-20-final-winners.jpg.

Choose the best ten photos right after the event and mark them. When you ask a sponsor for support next time, send those ten with the numbers you recorded.` },
      { h2: "Short video and stories", md: `Short clips travel further than photos. Capture a few ten second moments: a decisive point, a crowd reaction, the winners lifting a certificate. Shoot vertically, hold the phone steady and keep the sound on if the venue allows.

Post one or two clips on the day and a longer highlight reel a few days later, if you have the time. Keep the same style each time, so followers recognise your events. Credit the people who helped, and check any music you add is allowed on the platform before you post.` },
      { h2: "Common mistakes", md: `- No plan, so nobody takes photos of the final.
- Posting photos without consent.
- Photos stored on one phone only.
- Long, complicated captions.
- Forgetting to thank volunteers.` },
    ],
    faq: [
      { q: "What photos should I take at a tournament?", a: "Make a shot list: setup, check-in, matches in progress, reactions and crowd, the final, winners with certificates and the volunteers. Take a few wide shots for the venue and a few close ones for people. Assign one person as photographer and back up the pictures the same night." },
      { q: "Do I need consent to post tournament photos?", a: "It is good practice to ask, and often required for players under 18 or by your school or club. Add a line to the registration form saying you take photos and may post them, and how to opt out. Do not post pictures showing private information." },
      { q: "When should I post during a tournament?", a: "Post an announcement and a reminder before the event, one or two quick updates during it, a results post with the winners' photo after the protest window closes and a thank-you post for volunteers a day later. Short, consistent posts work better than occasional elaborate ones." },
    ],
    related: ["how-to-announce-a-tournament", "tournament-results-announcement-template", "age-groups-and-junior-tournaments", "sponsor-pitch"],
    cta: { label: "Make the event poster", href: "/tools/poster/" },
  },

  {
    slug: "split-seasons-promotion-and-relegation",
    title: "Split seasons, promotion and relegation: running a tiered community league",
    seoTitle: "Split seasons, promotion and relegation",
    description: "How to run a tiered league with promotion and relegation: divisions, how many go up and down, split seasons, playoffs, new entrants and rules to keep it fair.",
    tag: "Format guide",
    answer: "A tiered league has divisions. At the end of each split, the top teams of a lower division move up and the bottom teams of a higher one move down. Fix the number of divisions, how many move, and how new teams enter, and publish it before the season.",
    intro: "A one-off tournament has a winner. A league with promotion and relegation has stakes all the way down, since every match can move a team up or keep it from going down. It gives a community a reason to keep playing, and it needs careful rules to stay fair.",
    sections: [
      { h2: "Divisions", md: `Divide teams into tiers, for example Division 1, Division 2 and Division 3. Each division plays its own table, as a round robin or a shorter format. See [round robin types](/guides/round-robin-single-double-and-tiebreaks/) and [odd numbers of teams](/guides/round-robin-with-an-odd-number-of-teams/).

Keep division sizes similar, and large enough for a meaningful season. A division of four plays only a few matches, and one of twelve may take too long.` },
      { h2: "How many move", md: `Decide how many teams go up and down. A common pattern is two up and two down between neighbouring divisions, but pick numbers to suit your sizes.

| Division | Top finishers | Bottom finishers |
|---|---|---|
| Division 1 | Champions | Relegated to Division 2 |
| Division 2 | Promoted to Division 1 | Relegated to Division 3 |
| Division 3 | Promoted to Division 2 | Stay, or leave if inactive |

Keep the number going up equal to the number going down, so division sizes stay stable.` },
      { h2: "Split seasons", md: `A season can be split into two parts, often called splits. After the first split, the standings can reset, or carry over partly. The splits can end with playoffs, and the second split can decide promotion.

Choose one structure and explain it plainly. For example: "Two splits per season. Split 1 decides seeding for the Split 2 playoffs. Promotion and relegation happen after Split 2."` },
      { h2: "Playoffs and promotion matches", md: `Some leagues use a playoff between the team that finishes just outside promotion and the team just inside relegation, a promotion or relegation match. It adds drama and gives a second chance.

Use a short format with a published tie-break, as in [how to write tie-breaker rules](/guides/tournament-tiebreaker-rules-how-to-write/), and use the [bracket maker](/tools/brackets/) for playoffs. Make sure your schedule has room, as in [scheduling across courts and rooms](/guides/scheduling-matches-across-courts-and-rooms/).` },
      { h2: "New entrants and withdrawals", md: `New teams need a way in. Usually they start in the lowest division, or take a place left by a withdrawn team. A trial or qualifier can place strong newcomers higher, as in [divisions and skill levels](/guides/divisions-and-skill-levels-in-one-tournament/).

If a team withdraws mid-season, decide what happens to its results: voided or kept as forfeits. Write it down, and apply it evenly.` },
      { h2: "Communicating the system", md: `Tiers are only motivating if everyone understands them. Publish a one page explanation with a diagram of the divisions and arrows for movement. Show the current table with colours for promotion and relegation zones.

Show it on a [display screen](/tools/display-screen/) or a shared page, and update it after every match.` },
      { h2: "A sample season for three divisions", md: `Imagine three divisions of eight teams. Each division plays a single round robin in Split 1, which is seven rounds of four matches. The top four of each division play a short playoff in Split 2, and the bottom four play a placement round. After Split 2, the top two of Division 2 and Division 3 move up, and the bottom two of Division 1 and Division 2 move down.

Publish the calendar with the dates of each split, the playoffs and the promotion decisions. Teams make plans around it, and a clear calendar is the best protection against complaints about fairness.` },
      { h2: "Common mistakes", md: `- Divisions of very different sizes.
- Different numbers going up and down.
- No rule for withdrawals.
- Starting without a written structure.
- A season too long for the community to sustain.` },
    ],
    faq: [
      { q: "How does promotion and relegation work in a community league?", a: "Teams are placed in divisions. At the end of a split or season, the top teams of a lower division move up and the bottom teams of a higher division move down. Keep the number going up equal to the number going down, and publish the numbers before the season starts." },
      { q: "How many divisions should a league have?", a: "As few as your numbers allow. Each division should have enough teams for a meaningful table, such as six to ten, so a small community may need only two. Add a third tier when you have enough teams to fill each division, rather than splitting thinly." },
      { q: "What happens when a team withdraws mid-season?", a: "Decide in advance whether its results are voided or kept as forfeits, and whether another team takes its place. Write the rule on the rules page and apply it the same way every time, so teams know the effect on the table before they commit to the season." },
    ],
    related: ["round-robin-single-double-and-tiebreaks", "round-robin-with-an-odd-number-of-teams", "divisions-and-skill-levels-in-one-tournament", "tournament-tiebreaker-rules-how-to-write"],
    cta: { label: "Generate each division's fixtures", href: "/tools/round-robin/" },
  },

  {
    slug: "chess-rapid-vs-blitz-for-events",
    title: "Chess rapid vs blitz for events: choosing a time control",
    seoTitle: "Chess rapid vs blitz for events",
    description: "How to choose between rapid and blitz chess for your event: what each means, total time per round, number of rounds, fair play, player comfort and a sample schedule.",
    tag: "Game guide",
    answer: "Rapid games give players more time to think and take longer per round. Blitz is fast, tense and fits more rounds in the same time. Choose by how long your event lasts, who plays, and how much you want to reward calm thinking versus speed. Check the current FIDE definitions.",
    intro: "Time control decides the character of a chess event. A rapid tournament feels like chess, with plenty of thinking. A blitz tournament feels like a sprint. Neither is better. They suit different goals, and the choice affects your whole schedule.",
    sections: [
      { h2: "What the terms mean", md: `Rapid and blitz are named by time per player. Rapid games give each player a longer time, usually more than ten minutes each, while blitz games give each player a short time, around ten minutes or less once increments are counted. Exact definitions are set by FIDE and can be revised, so check the current regulations before you announce.

In practice, you set a base time and an increment per move, and describe it in one line, such as "10 minutes plus 5 seconds per move".` },
      { h2: "How long will a round take?", md: `Estimate the maximum length of a game: the base time for both players plus the increments over a typical number of moves, with a margin. Add time between rounds.

| Control | Round length, rough | Rounds in a four hour event |
|---|---|---|
| Blitz | Short, with a fast turnaround | Many |
| Rapid | Longer games | Fewer |

Use these as a guide only, and work out your own numbers with the [schedule maker](/tools/schedule/). Always plan for the longest games, not the average.` },
      { h2: "Who is playing", md: `Beginners and juniors often do better with a longer control, since they need time to think and to write moves if the rules require it. Experienced players enjoy blitz because it rewards instincts, but a very fast game can be frustrating for a newcomer.

For school events, rapid is the safer choice. For a casual evening club night, blitz is fun. If you have both, run a rapid event and a blitz side event.` },
      { h2: "Format and tie-breaks", md: `Both work in a Swiss or a round robin. A Swiss with fewer rounds suits rapid, and with more rounds suits blitz. See [how to run a Swiss chess tournament](/guides/how-to-run-a-swiss-chess-tournament/) for the logic, and [chess points and tie-breaks](/guides/chess-points-system-and-tiebreaks/) for scoring.

A drawn game is half a point in both, per the FIDE rules.` },
      { h2: "Equipment and online play", md: `Over the board, you need clocks that support the time control, including increments. Check the clocks before the event, and have spares. Online, the platform's clock handles it, as in [online chess tournaments](/guides/chess-online-tournaments-lichess-and-chesscom/).

Latency matters more in blitz, so for online events with players on mixed connections, a slightly longer control is fairer.` },
      { h2: "Announce it clearly", md: `State the control in the event announcement and on the rules page, in one line, and repeat it at the opening. Include how flag falls are handled, what happens if a clock fails, and how to claim a draw. The [chess tournament rules guide](/guides/chess-tournament-rules-for-organisers/) covers these points.` },
      { h2: "A sample schedule", md: `Suppose you have a hall for four hours and 24 players, and you want a Swiss with five rounds. With a rapid control, allow a round to run for the full length of the longest games plus a break, and the five rounds may fill the whole afternoon. With a blitz control, the same five rounds finish much sooner, so you could play seven or nine.

Write the plan as a table of round start times and publish it. Add ten minutes after each round for pairings and late arrivals. If rounds finish early, start the next one early, and say so in advance so players do not wander off.` },
      { h2: "Common mistakes", md: `- Not stating the increment.
- Planning rounds by the average game, not the longest.
- Using blitz for beginners without a warning.
- No spare clocks.
- Mixing different controls between rounds.` },
    ],
    faq: [
      { q: "What is the difference between rapid and blitz chess?", a: "They are named by the time each player gets. Rapid gives more time, usually more than ten minutes each, and blitz gives much less, around ten minutes or less once increments are counted. FIDE sets the exact definitions and can revise them, so check the current regulations before you announce your event." },
      { q: "Which time control is better for a school event?", a: "Rapid is usually safer, because beginners and juniors need time to think and, where required, to record moves. Blitz suits casual club nights and experienced players. If you have time, run a rapid main event and a blitz side event, and say the control clearly in the announcement." },
      { q: "How do I schedule rounds for rapid or blitz?", a: "Estimate the longest game, which is the base time for both players plus increments over a typical number of moves, add a margin and the time between rounds, then divide your available time by that to get the number of rounds. Plan for the longest case, not the average." },
    ],
    related: ["chess-tournament-rules-for-organisers", "how-to-run-a-swiss-chess-tournament", "chess-online-tournaments-lichess-and-chesscom", "chess-points-system-and-tiebreaks"],
    cta: { label: "Plan the round times", href: "/tools/schedule/" },
  },

  {
    slug: "post-event-report-template",
    title: "Post event report template: numbers, lessons and a one page summary",
    seoTitle: "Post event report template",
    description: "A post event report template for tournaments: what to record, key numbers, what went well and badly, costs, feedback and a one page summary.",
    tag: "Organiser guide",
    answer: "Write the report within a week: the key numbers, a short story of the day, what went well, what to change, a cost and income summary, feedback quotes and photos. One page is enough. It helps you improve and helps you win sponsors.",
    intro: "After an event, everyone wants to rest. But the days right after are when you remember what happened. A one page report written then saves you from repeating mistakes, and gives you proof for sponsors and your college or club. Here is a template.",
    sections: [
      { h2: "Why write it", md: `Three readers benefit: you, your team and your supporters. You learn what to fix. Your team sees what was achieved. A sponsor or an officer sees what their support delivered.

Keep it short, so you actually write it, and factual, so people trust it. Do not claim numbers you did not record. Write it in the same place each time, such as a shared document, and give it a date in the file name, so you can compare events over the year and see whether entries, matches and costs are growing.` },
      { h2: "The key numbers", md: `Record these while they are fresh.

| Item | Number |
|---|---|
| Teams or players registered | |
| Teams or players who played | |
| Matches played | |
| Referees and volunteers | |
| Duration of the event | |
| Spectators or stream viewers, if counted | |
| Income and costs | |

Leave a cell empty if you did not measure it. Next time, decide beforehand what you will count, using the [budget template](/guides/tournament-budget-template/) as a guide for money.` },
      { h2: "The story of the day", md: `Write five or six lines on what happened: the format, the winner, a highlight, any problem. Keep it in plain words, like a short news item. The [results template](/guides/tournament-results-announcement-template/) can supply the first lines.

Add the best two or three photos, chosen from your [photo plan](/guides/tournament-photo-and-content-plan/).` },
      { h2: "What went well and what to change", md: `Make two short lists.

1. What went well: things to keep, such as the check-in routine or the venue.
2. What to change: specific problems and a fix for each.

Be concrete. "Late start" is a note. "Started 30 minutes late because check-in opened at the start time. Open check-in 30 minutes earlier." is a lesson.` },
      { h2: "Costs and income", md: `Summarise the money in a few lines: income by source, costs by group, and the balance. Compare with your plan and explain big differences. If there is a surplus, say what happens to it.

Keep receipts and the sheet. Note any cost you did not expect, such as extra printing or a replacement cable, with the amount, and add a line on how you would budget for it next time. A sponsor who sees an honest summary, including the surprises, is more likely to return, and you will plan the next budget with real figures instead of guesses. See [prize pool and payout split](/guides/tournament-prize-pool-and-payout-split/) for how prizes fit in.` },
      { h2: "Feedback", md: `Ask players and volunteers two questions: what was best, and what should change. A short form works, built with the [registration form tool](/tools/registration/). Quote one or two comments, with permission.

Honest critical feedback is useful. Report it and say what you will do about it.` },
      { h2: "One page for sponsors", md: `Make a one page version for supporters: event name, date, headline numbers, two photos, a line of thanks and what is next. Send it within a week, with a thank-you message.

This page is the start of your next [sponsor pitch](/guides/sponsor-pitch/), so keep it clean and save it with the other event files.` },
      { h2: "Common mistakes", md: `- Waiting weeks before writing it.
- Claiming numbers you did not count.
- Lessons too vague to act on.
- Hiding the money summary.
- Not sending a version to supporters.` },
    ],
    faq: [
      { q: "What should a post event report include?", a: "The key numbers such as teams registered and played, matches, helpers and duration, a short story of the day, what went well and what to change, a cost and income summary, feedback quotes and a couple of photos. One page is enough, and it should only contain numbers you actually recorded." },
      { q: "When should I write the report?", a: "Within a week of the event, while you still remember what happened. Record the key numbers on the day or the evening after, and write the lessons while the problems are fresh. Waiting weeks leads to vague notes, and the most useful details get lost." },
      { q: "How do I use the report with sponsors?", a: "Make a one page version with the event name, date, headline numbers, two photos, a line of thanks and what is next, and send it within a week with a thank-you message. Keep it with your other event files and use it as the starting point for your next sponsor pitch." },
    ],
    related: ["tournament-budget-template", "tournament-results-announcement-template", "tournament-photo-and-content-plan", "sponsor-pitch"],
    cta: { label: "Collect feedback with a form", href: "/tools/registration/" },
  },

  {
    slug: "overall-champion-points-across-several-games",
    title: "Overall champion points across several games: how to score a multi game event",
    seoTitle: "Overall champion across several games",
    description: "How to crown an overall champion across several games or sports: points per place, weighting, house or team totals, tie-breaks and a worked example.",
    tag: "Format guide",
    answer: "Give points for each place in each game, add them up per team or house and rank the totals. Decide whether all games weigh the same, publish the scale and the tie-break first, and show a running total so the contest stays alive until the end.",
    intro: "Fests, school sports days and gaming weekends often run several events and want one overall winner. That needs a points scale that is simple, fair across very different games, and published before anyone plays. The arithmetic is easy. The decisions are not.",
    sections: [
      { h2: "Points per place", md: `The usual method is points for each finishing place in each game. A common scale awards more points for first and fewer down the table.

| Place | Example points |
|---|---|
| 1st | 10 |
| 2nd | 7 |
| 3rd | 5 |
| 4th | 3 |
| Others who played | 1 |

This is an example. Choose a scale with enough steps for your number of teams, and give everyone who takes part at least a point, so participation counts. The [school sports day guide](/guides/school-sports-day-tournament-planning/) uses a similar scale.` },
      { h2: "Should every game count the same?", md: `A game with 32 teams and a game with 4 teams do not mean the same. Decide whether to weight them.

- Equal weight: simple and easy to explain, but small events count as much as big ones.
- Weighted: multiply the points of bigger or more important events, such as a final event, by a factor.

If you weight, publish the factor for each game. Do not change it after the first results, since that looks like favouring a team.` },
      { h2: "Team or house totals", md: `Sum the points of each team or house across all games. If teams enter several games, add every game. If a team enters only some, say whether that is allowed, and how it affects the total.

Use one sheet with a row per team and a column per game, and a total column. The [points table tool](/tools/points-table/) can build it.` },
      { h2: "A worked example", md: `Three houses play three games. Points per place as above.

| House | Football | Chess | Relay | Total |
|---|---|---|---|---|
| Red | 10 | 5 | 7 | 22 |
| Blue | 7 | 10 | 5 | 22 |
| Green | 5 | 7 | 10 | 22 |

All three are level on 22. This is exactly why a tie-break must be published before the event.` },
      { h2: "Tie-breaks", md: `Choose an order and publish it. Typical options:

1. More first places.
2. More second places.
3. The result of the head to head in a named deciding game.
4. A short decider event.

In the example, each house has one first place, so you continue down the list. See [ranking teams in a three way tie](/guides/ranking-teams-in-a-three-way-tie/) and [how to write tie-breaker rules](/guides/tournament-tiebreaker-rules-how-to-write/) for the method.` },
      { h2: "Keep the contest alive", md: `Show the running totals after every game on a [display screen](/tools/display-screen/) or a notice board. Schedule the biggest weighted event last, so the title is not decided early.

If a leader is far ahead after the first games, the audience loses interest. A weighted final keeps the outcome open without making the early games meaningless.` },
      { h2: "Handling teams that skip games", md: `In a multi game event, some teams will skip a game they are weak at. Decide in advance whether that is allowed, and what it costs. A fair rule is that a team scores zero in a game it skips, which discourages strategic skipping, or that every team must enter a minimum number of games.

Also decide how to treat forfeits and disqualifications: a team that forfeits scores nothing for that game, and a disqualified team loses its points there. Publish these rules with the scale, so the overall table cannot be gamed or argued over.` },
      { h2: "Common mistakes", md: `- Changing the points scale after results.
- No tie-break for the overall total.
- Not saying whether small games count the same.
- Letting teams enter only their strongest games without a rule.
- Not showing running totals.` },
    ],
    faq: [
      { q: "How do I pick an overall champion across several games?", a: "Give points for each place in each game, add them up per team or house and rank the totals. Publish the scale and a tie-break before the first game, decide whether all games weigh the same and show a running total after each event so the contest stays open until the end." },
      { q: "Should every game count the same in an overall score?", a: "It is your choice. Equal weights are simple to explain, but a four team game counts as much as a 32 team game. Weighting bigger or final events gives them more influence. Publish the factors in advance and do not change them after the first results come in." },
      { q: "What if teams finish level on overall points?", a: "Use a tie-break order published before the event, such as more first places, then more second places, then a named deciding game or a short decider event. A written order avoids arguments, as in the example where three houses each finish on the same total." },
    ],
    related: ["school-sports-day-tournament-planning", "tournament-tiebreaker-rules-how-to-write", "ranking-teams-in-a-three-way-tie", "points-table"],
    cta: { label: "Build the overall table", href: "/tools/points-table/" },
  },

  {
    slug: "dota-2-and-moba-draft-and-substitution-rules",
    title: "Dota 2 and MOBA draft and substitution rules for organisers",
    seoTitle: "Dota 2 and MOBA draft and substitution rules",
    description: "Draft, ban and substitution rules for Dota 2 and other MOBA tournaments: draft modes, side selection, pauses, substitutes, spectator delay and a rules page to copy.",
    tag: "Game guide",
    answer: "Decide the draft mode, how sides are chosen, pause limits, substitute rules and the penalty for breaches. MOBAs have long matches, so a pause and disconnect policy matters. Check the current client's options, because modes and rules change with patches.",
    intro: "MOBA matches are long, five against five and full of rules about drafts, pauses and who may play. A rules page that covers these points in plain words prevents most disputes. Because patches change the game, organisers should check the details before each event.",
    sections: [
      { h2: "Draft mode", md: `Pick the draft mode for your event. Competitive formats use a structured pick and ban phase where teams alternate, and there is a time limit for each choice. Casual events sometimes use simpler modes.

State the mode in the rules and test it in a lobby. The [Dota 2 captains mode guide](/guides/dota-2-tournament-captains-mode-and-series/) explains how it works in series. Settings and modes change with updates, so check them before every event.` },
      { h2: "Sides and series", md: `Decide how sides are chosen in each game of a series: a coin toss for the first game, then the loser chooses, or alternate. Write it down.

For the series length, see [best of 1, 3 and 5](/guides/best-of-1-3-5-series-length-explained/). Use longer series for semi-finals and finals, and a shorter one for early rounds, because MOBA games are long and a day fills quickly.` },
      { h2: "Pauses and disconnects", md: `Pauses are a common source of disputes. Write the rules:

1. How many pauses each team may use, and for how long in total.
2. Valid reasons for a pause, such as a technical problem.
3. How to announce a pause in chat, and who may unpause.
4. What happens if a player disconnects and cannot return.

Choose the numbers yourself, publish them and keep a record of each pause. The [no-shows guide](/guides/handling-no-shows-and-walkovers/) has a useful structure.` },
      { h2: "Substitutes", md: `Say how many substitutes a team may register, when they can play and whether a replaced player can return. The principles match the [Valorant roster rules](/guides/valorant-roster-and-substitute-rules/): lock the roster, allow changes between games with notice, and ban changes mid-game except in an emergency approved by a referee.

Check the names of players in the lobby against the registered roster at the start of every game.` },
      { h2: "Spectators and delay", md: `If you stream, use a spectator delay, so a team cannot get live information from the broadcast. Check the available delay options in the current client.

Referees should spectate each match. Keep chat channels for referees and teams separate from the public ones, so rulings are not distracted by the audience.` },
      { h2: "Penalties", md: `Write graded penalties: a warning for a minor breach, a loss of a game for a serious one and disqualification for deliberate cheating. Name who decides, usually the head referee, and how a team can appeal, as in the [dispute process guide](/guides/tournament-dispute-process-protest-window/).

Apply the same penalties to every team, and record each decision.` },
      { h2: "A one page rules summary", md: `Put a summary at the top of your rules:

1. Mode: [draft mode], with [time] per pick.
2. Sides: coin toss for game one, loser picks for later games.
3. Pauses: [number] per team, [time] total, with a reason in chat.
4. Substitutes: registered before the lock, between games only.
5. Spectators: delayed stream, referee in every match.
6. Penalties: warning, loss of a game, disqualification, ruled by the head referee.

Fill the brackets with your own numbers. Read it aloud at the captains' meeting and ask each captain to confirm they have read the full rules.` },
      { h2: "Common mistakes", md: `- Not testing the draft mode in a lobby.
- No pause limits.
- Letting a team substitute mid-game without approval.
- Streaming without a spectator delay.
- Applying penalties unevenly.` },
    ],
    faq: [
      { q: "What draft rules does a MOBA tournament need?", a: "State the draft mode, the time limit for each pick or ban, how sides are chosen in each game of a series, and test the mode in a lobby before the event. Check the current client's options, since modes and rules change with patches, and write the final settings on the rules page." },
      { q: "How should I handle pauses in a Dota 2 match?", a: "Set how many pauses a team may use and for how long in total, list valid reasons such as technical problems, say how to announce a pause and who may unpause, and write what happens when a player cannot return. Keep a record of every pause and apply the same limits to all teams." },
      { q: "Do I need a spectator delay when streaming a MOBA?", a: "Yes, if you stream live. A delay stops teams from getting information from the broadcast during a game. Check the delay options available in the current client, test them before the event and keep referees on the match as spectators, with separate channels from the public audience." },
    ],
    related: ["dota-2-tournament-captains-mode-and-series", "best-of-1-3-5-series-length-explained", "valorant-roster-and-substitute-rules", "tournament-dispute-process-protest-window"],
    cta: { label: "Plan the bracket and series", href: "/tools/brackets/" },
  },

  {
    slug: "liability-and-safety-basics-for-campus-events",
    title: "Liability and safety basics for campus events: what organisers should check",
    seoTitle: "Liability and safety basics for campus events",
    description: "Safety and liability basics for campus tournaments: permissions, first aid, venue safety, consent for minors and insurance questions. Not legal advice.",
    tag: "Organiser guide",
    answer: "Get written permission from the college or venue, plan first aid and emergency contacts, check the venue's capacity, power and exits, get consent for minors and ask your institution about insurance. This is general guidance, not legal advice, so check your local rules.",
    intro: "Most campus events pass without incident, but organisers are responsible for the people who attend. A short list of checks, done before the day, covers the common risks. This guide is general, and your college, club and local rules come first.",
    sections: [
      { h2: "Permission first", md: `Get written permission from the college or the venue owner before you announce. Ask what they require: forms, dates, security, a staff member present, limits on numbers or hours. Keep the reply.

If your event is under a club or society, confirm who is accountable and who signs. Do not assume that a verbal yes is enough.` },
      { h2: "Venue safety", md: `Visit the venue with a checklist.

| Check | Why |
|---|---|
| Capacity | Do not exceed it |
| Exits | Clear and marked |
| Power | Safe load, no overloaded extension boards |
| Cables | Covered or taped in walkways |
| Lighting | Enough for safe movement |
| Water and toilets | Available |

See the [LAN checklist](/guides/lan-event-setup-checklist/) and [seating and room layout](/guides/tournament-seating-and-room-layout/) for practical details.` },
      { h2: "First aid and emergencies", md: `Keep a first aid kit on site and know who can use it. Write down emergency numbers, the nearest hospital and the venue manager's contact. Put them on the briefing sheet.

Name one person to call for help and one to meet the ambulance at the gate. Brief your volunteers, using [volunteer roles and briefing](/guides/tournament-volunteer-roles-and-briefing/).` },
      { h2: "Sports and physical events", md: `For sports, add checks for the playing area: surface, boundaries, equipment, shade and water in hot weather. Ask players about medical conditions that the organisers should know, and keep the information private.

Use qualified officials where the sport needs them, and stop play if conditions become unsafe. The referee's authority to stop a match should be in your rules.` },
      { h2: "Minors and consent", md: `For players under 18, get consent from a parent or guardian, record an emergency contact and follow your institution's safeguarding policy. The [age groups guide](/guides/age-groups-and-junior-tournaments/) covers categories, consent and photos.

Do not leave an adult alone with a child without another adult in view.` },
      { h2: "Insurance and responsibility", md: `Ask your institution whether events are covered by its insurance, and what the conditions are. If you hire equipment or a venue, ask what the owner's policy covers and what you must cover.

Put a short participation statement on the registration form, if your institution provides one. This is general guidance and not legal advice. Check the local requirements, and ask a staff member or an adviser when in doubt.` },
      { h2: "A one page safety plan", md: `Write a short plan and share it with every volunteer.

1. Event name, date, venue and the name of the person in charge.
2. Emergency numbers, the nearest hospital and the venue manager's phone.
3. Where the first aid kit is and who can use it.
4. The exits, and a meeting point outside the building.
5. Who calls for help, and who meets the ambulance at the gate.
6. The venue capacity, and who counts people at the door.
7. What to do if a player is injured, or if a child is separated from their group.
8. Who speaks to parents, the college or the press if something goes wrong.

Print it, put a copy at the results desk and brief the volunteers at the start. A plan that sits in an email nobody opens will not help in an emergency. Go through it once aloud, so every person knows their part, and update it after each event with what you learned. If the event is under a college or club, ask a staff member to read it and add their requirements.` },
      { h2: "Common mistakes", md: `- Announcing before permission is confirmed.
- No first aid kit or emergency contact.
- Exceeding the venue capacity.
- Skipping consent for minors.
- Assuming insurance covers the event without asking.` },
    ],
    faq: [
      { q: "What safety checks do campus tournament organisers need?", a: "Get written permission from the college or venue, check capacity, exits, power, cables and lighting, keep a first aid kit and emergency contacts, assign people to call for help, get consent for minors and ask your institution about insurance. Check local rules, since this is general advice and not legal advice." },
      { q: "Do I need parental consent for a college event?", a: "For players under 18, it is good practice and often required by the institution. Get consent from a parent or guardian, record an emergency contact, follow the safeguarding policy and name a contact person. Check your institution's rules, since requirements differ by place." },
      { q: "Does the college insurance cover my event?", a: "Do not assume. Ask the institution whether events are covered, under what conditions and what you must do, such as submitting forms in advance. If you hire a venue or equipment, ask what the owner's policy covers. Keep the answers in writing." },
    ],
    related: ["run-a-campus-tournament", "age-groups-and-junior-tournaments", "tournament-seating-and-room-layout", "tournament-volunteer-roles-and-briefing"],
    cta: { label: "Plan the event step by step", href: "/tools/plan/" },
  },

  {
    slug: "timeline-for-a-one-day-tournament",
    title: "Timeline for a one day tournament: from setup to prize giving",
    seoTitle: "Timeline for a one day tournament",
    description: "A sample timeline for a one day tournament: setup, check-in, matches, breaks, finals, prize giving and pack-down, with buffers you can adapt.",
    tag: "Organiser guide",
    answer: "Work backwards from the finish: book the venue for the whole day, leave setup time before the first match, schedule breaks, put the biggest matches last, keep a buffer and plan pack-down. A written timeline shared with every volunteer keeps the day on track.",
    intro: "A one day tournament is a tight schedule with many people depending on it. A timeline answers the question \"what happens next?\" for everyone. Use the sample below as a skeleton, and replace the times with yours.",
    sections: [
      { h2: "Start with the end", md: `Decide the latest finish, given the venue, daylight or transport. Then count backwards: pack-down, prize giving, final, semi-finals, earlier rounds, check-in, setup.

If the numbers do not fit, change the format, not the clock. Fewer matches or shorter matches, as in [how many teams for your format](/guides/how-many-teams-for-your-format/), is better than a rushed final.` },
      { h2: "A sample timeline", md: `This example is for sixteen teams in groups then a knockout, on two courts, in a hall booked from 8 am to 6 pm.

| Time | What happens |
|---|---|
| 08:00 | Venue opens; setup and tests |
| 09:00 | Volunteer briefing |
| 09:30 | Team check-in |
| 10:00 | Opening and captains' briefing |
| 10:15 to 12:45 | Group matches |
| 12:45 to 13:30 | Lunch and bracket update |
| 13:30 to 15:00 | Quarter-finals |
| 15:00 to 15:30 | Semi-finals |
| 15:45 | Final |
| 16:30 | Results, prize giving, photos |
| 17:00 | Pack-down |
| 18:00 | Venue closed |

Change the times to match your own match lengths.` },
      { h2: "Setup and check-in", md: `Give yourself a full hour for setup. Things always take longer than planned, and you want the first match to start on time. Do the tests from the [LAN checklist](/guides/lan-event-setup-checklist/) or the venue equivalent.

Open check-in half an hour before the start. Drop teams that have not checked in by the deadline, as in [handling no-shows](/guides/handling-no-shows-and-walkovers/).` },
      { h2: "Matches and breaks", md: `Use the [schedule maker](/tools/schedule/) to place matches. Add gaps for changeovers, and breaks for players and referees. Water and a short rest keep decisions sensible in the afternoon.

Put the longest or most important matches last, with a buffer before them. If a morning round overruns, you can absorb it before the final.` },
      { h2: "Buffers", md: `Add buffers in three places: between rounds, before the final and at the end of the day. A buffer of 10 to 15 minutes per round is usual. If you do not use it, you can finish early, and nobody complains.

If you run behind, decide in advance what to cut: shorten the third place match, reduce series length in early rounds or skip a break. The [backup plan guide](/guides/backup-plan-when-internet-or-power-fails/) covers other disruptions.` },
      { h2: "Prize giving and pack-down", md: `Announce the winners and give prizes within an hour of the final, while people are still there. See the [results announcement template](/guides/tournament-results-announcement-template/) and the [certificate maker](/tools/certificates/).

Plan pack-down with roles: who collects equipment, who cleans, who returns the keys. A list on the wall helps. A tidy exit makes the venue happy to host you again.` },
      { h2: "Roles by time", md: `A timeline works best when each time block has an owner. Next to each row, write who is in charge: the technical lead at 08:00, the registration desk at 09:30, the head referee at 10:15, the results desk through the afternoon, the host at 16:30 and the pack-down lead at 17:00.

Share the sheet with every volunteer the day before, and print one copy for the results desk. When something slips, the owner of the block knows to tell the others. A timeline without owners is only a wish, and one with owners becomes a plan the whole team can follow.` },
      { h2: "Common mistakes", md: `- Planning the clock from the best case.
- No buffer before the final.
- Starting setup too late.
- No lunch break.
- No plan for pack-down.` },
    ],
    faq: [
      { q: "How do I plan the timeline for a one day tournament?", a: "Decide the latest finish, then work backwards: pack-down, prize giving, final, semi-finals, earlier rounds, check-in and setup. Add gaps for changeovers, breaks for players and referees and buffers between rounds and before the final. If it does not fit, change the format rather than the clock." },
      { q: "How long should setup take for a one day event?", a: "Allow at least an hour before check-in, and more for a LAN event with many machines. Things take longer than planned, and you want the first match to start on time. Test equipment the day before so setup on the day is only a quick check." },
      { q: "What should I cut if the event runs late?", a: "Decide in advance, for example shorten the third place match, reduce series length in the early rounds or skip a break. Putting the biggest matches last, with a buffer before them, lets you absorb an overrun in the morning without rushing the final." },
    ],
    related: ["how-many-teams-for-your-format", "lan-event-setup-checklist", "handling-no-shows-and-walkovers", "backup-plan-when-internet-or-power-fails"],
    cta: { label: "Build your match schedule", href: "/tools/schedule/" },
  },

  {
    slug: "knockout-for-32-teams-in-one-day",
    title: "Knockout for 32 teams in one day: rounds, courts and a realistic plan",
    seoTitle: "Knockout for 32 teams in one day",
    description: "Can 32 teams finish a knockout in one day? Match counts, how many courts or lobbies you need, a time budget by round, byes, seeding and a fallback plan.",
    tag: "Format guide",
    answer: "A 32 team knockout has five rounds and 31 matches. Whether it fits in a day depends on match length and how many courts or lobbies run at once. With four courts and short matches it is feasible, with one court it is not. Count first, then decide.",
    intro: "Thirty-two teams make a perfect bracket with no byes, which is why organisers love the number. But 31 matches in one day is a real constraint. This guide shows how to count it and what to do if the numbers do not fit.",
    sections: [
      { h2: "The match counts", md: `A single elimination bracket for 32 teams has five rounds.

| Round | Matches |
|---|---|
| Round of 32 | 16 |
| Round of 16 | 8 |
| Quarter-finals | 4 |
| Semi-finals | 2 |
| Final | 1 |

That is 31 matches in total. The champion plays five, and half the teams play only one, so think about whether that suits the event.` },
      { h2: "How many slots", md: `Divide each round by the number of courts or lobbies you can run at once, and round up.

| Round | Matches | Slots with 4 courts | Slots with 2 courts |
|---|---|---|---|
| Round of 32 | 16 | 4 | 8 |
| Round of 16 | 8 | 2 | 4 |
| Quarter-finals | 4 | 1 | 2 |
| Semi-finals | 2 | 1 | 1 |
| Final | 1 | 1 | 1 |
| Total | 31 | 9 | 16 |

Multiply by the slot length. With four courts and 40 minute slots, that is 6 hours. With two courts it is nearly 11 hours, which is not a day.` },
      { h2: "What if it does not fit", md: `You have three levers.

- Shorten matches or use best of one in early rounds, as in [best of 1, 3 and 5](/guides/best-of-1-3-5-series-length-explained/).
- Add courts or lobbies.
- Reduce the number of teams with a qualifier before the day.

Test each option in the [schedule maker](/tools/schedule/) before you announce. The [how many teams guide](/guides/how-many-teams-for-your-format/) has counts for other sizes.` },
      { h2: "Seeding", md: `Seed the bracket so strong teams meet late. Seeds 1 and 2 go to opposite halves, and seeds 3 and 4 to opposite quarters. If you do not have ratings, draw by lot in public, as in [how to draw a fair draw](/guides/how-to-draw-a-fair-tournament-draw/).

Use the [bracket maker](/tools/brackets/), and publish the bracket in advance. For details, see [seeding a bracket](/guides/how-to-seed-a-tournament-bracket/).` },
      { h2: "Keep teams engaged", md: `Teams eliminated in round one may leave. Keep them involved with a side event, a consolation bracket, as in [third place and consolation brackets](/guides/third-place-match-and-consolation-brackets/), or a role as spectators with a clear schedule and a screen showing the bracket.

A short consolation event costs matches, so count them first.` },
      { h2: "Prepare for delays", md: `A 31 match day has little slack. Write a plan for running late: shorten the early rounds, drop the third place match or move the final to a fixed time. Put it in the rules so nobody argues.

Use a [display screen](/tools/display-screen/) for the bracket and keep a printed copy. The [timeline guide](/guides/timeline-for-a-one-day-tournament/) shows buffers in a full day plan.` },
      { h2: "Online versus in person", md: `If you run online, the number of courts is the number of matches your referees can supervise at once, since players need no physical space. With eight referees you can run eight matches at once, and the round of 32 finishes in two slots. That changes the maths a lot: the whole bracket takes only a handful of slots.

The limit online is people, not rooms, plus the time players need between rounds. Even so, give every round a start time and a late arrival limit, and use the [no-shows guide](/guides/handling-no-shows-and-walkovers/) to keep the bracket moving.` },
      { h2: "Common mistakes", md: `- Not counting slots before announcing.
- Planning with the shortest match length.
- One court for 31 matches.
- No plan for delays.
- Nothing for teams eliminated early.` },
    ],
    faq: [
      { q: "How many matches are in a 32 team knockout?", a: "Thirty-one: sixteen in the round of 32, eight in the round of 16, four quarter-finals, two semi-finals and a final. The champion plays five matches, and half the teams play only one. Count slots with the number of courts or lobbies you have before you promise a one day finish." },
      { q: "Can a 32 team knockout finish in one day?", a: "Yes, if you can run enough matches in parallel. With four courts and 40 minute slots it takes about nine slots, or six hours. With two courts it takes nearly eleven hours, which does not fit a day. Shorten matches, add courts or qualify teams before the day." },
      { q: "What do I do if the knockout runs late?", a: "Write a plan in advance: shorten series in the early rounds, drop the third place match or fix a start time for the final. Put the plan in the rules so nobody argues, and put the biggest matches last with a buffer before them so an overrun in the morning does not rush the final." },
    ],
    related: ["how-many-teams-for-your-format", "how-to-seed-a-tournament-bracket", "third-place-match-and-consolation-brackets", "timeline-for-a-one-day-tournament"],
    cta: { label: "Draw the 32 team bracket", href: "/tools/brackets/" },
  },

  {
    slug: "qualifier-system-for-a-year-end-championship",
    title: "Qualifier system for a year end championship: points, slots and finals",
    seoTitle: "Qualifier system for a year end championship",
    description: "How to build a qualifier system for a year end championship: season points, direct slots, open qualifiers, a ladder route, fairness rules and how to announce it.",
    tag: "Format guide",
    answer: "Decide how many finalists you need, split them into direct slots from a season points table and open qualifier slots, publish how points are earned and set a deadline. A clear route to the final gives every event in the year a purpose.",
    intro: "A year end championship turns scattered events into a story. Players ask, how do I get in? If the answer is clear and fair, every weekly cup, scrim and tournament matters. If it is vague, people drift away. Here is a simple system to adapt.",
    sections: [
      { h2: "Decide the size of the final", md: `Start from the final. How many teams can you host, on what format, in what time? A final of eight or sixteen teams is common. Use [how many teams for your format](/guides/how-many-teams-for-your-format/) to check the match count.

Fix the number first. Everything else, the points and the routes, comes from it.` },
      { h2: "Routes to qualify", md: `Offer more than one way in, so both regulars and newcomers have a path.

| Route | Who it suits | Slots (example for 16) |
|---|---|---|
| Season points | Regular players | 8 |
| Open qualifier | Anyone, including new teams | 4 |
| Ladder or league top finishers | Active community members | 2 |
| Wildcard chosen by organisers | Special cases, stated reasons | 2 |

Choose your own split. Publish it, so people can plan the year.` },
      { h2: "Season points", md: `Award points at each qualifying event by placing, using a scale you publish. A bigger event can give more points. Count a team's best few results, not all, so a missed event does not end its chances.

Keep a public table, updated after every event, using the [points table tool](/tools/points-table/). The method resembles [overall champion points](/guides/overall-champion-points-across-several-games/).` },
      { h2: "Open qualifiers", md: `An open qualifier lets new teams in. Run it as a short knockout or a Swiss, with a published cutoff, and give the winners the open slots. See [group stage and knockout planning](/guides/group-stage-and-knockout-planning/) for formats.

Set the dates well ahead, and run the qualifier early enough that finalists have time to prepare.` },
      { h2: "Fairness rules", md: `Write rules that prevent gaming the system:

- A team must keep the same core roster, as in the [roster rules](/guides/valorant-roster-and-substitute-rules/).
- A player may qualify with only one team.
- Points are removed for forfeits and for misconduct.
- Ties on points are broken by a published order, as in [how to write tie-breaker rules](/guides/tournament-tiebreaker-rules-how-to-write/).

If a qualified team cannot attend, say who takes the slot: the next team on the table.` },
      { h2: "Announce the system", md: `Publish one page with the number of slots, the routes, the points scale, the dates and the rules. Show a diagram and the current table. Repeat the key dates in each event announcement, using the template in [how to announce a tournament](/guides/how-to-announce-a-tournament/).

Keep the system the same through the year. If you must change it, say so early and explain why.` },
      { h2: "A sample season calendar", md: `Here is a calendar you can adapt. Four qualifying events in the first nine months, each with points. An open qualifier in month ten. The season points table closes at the end of month ten, and the finalists are announced in month eleven. The final takes place in month twelve.

Put the dates on one page and repeat them in each announcement. Players who know that the last qualifying event is in three weeks will plan for it. Add a reminder a week before every deadline, and publish the table the day after each event so the standings are always current.` },
      { h2: "Common mistakes", md: `- Announcing the final without saying how to qualify.
- Only one route, which shuts out new teams.
- Changing the points scale mid-season.
- No rule for a qualified team that cannot attend.
- Choosing wildcards without stated reasons.` },
    ],
    faq: [
      { q: "How do I build a qualification system for a final?", a: "Fix the size of the final first, then split the slots between routes such as season points, an open qualifier, a league or ladder route and a few wildcards. Publish the points scale, the dates and the rules, keep a public table and say what happens if a qualified team cannot attend." },
      { q: "Why offer an open qualifier as well as season points?", a: "Season points reward regular players, but they shut out new teams. An open qualifier gives newcomers a path, keeps the community growing and means the final is open to anyone who can win the route. Give it a fair share of slots and run it early enough for finalists to prepare." },
      { q: "What if a qualified team cannot attend the final?", a: "Write the rule in advance: the slot goes to the next team on the season points table, or the runner-up of the open qualifier. Set a deadline for confirming attendance, and apply the same rule to every team, so nobody feels a slot was handed out unfairly." },
    ],
    related: ["how-many-teams-for-your-format", "overall-champion-points-across-several-games", "group-stage-and-knockout-planning", "valorant-roster-and-substitute-rules"],
    cta: { label: "Build the season points table", href: "/tools/points-table/" },
  },
];
