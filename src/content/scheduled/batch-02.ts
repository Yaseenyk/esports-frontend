import type { Draft } from "./types";
import { FACTS as F } from "./facts";

/** Posts 10 to 19. */
export const BATCH_02: Draft[] = [
  {
    slug: "tournament-bracket-byes-explained",
    title: "Byes in a tournament bracket: who gets them and why",
    seoTitle: "Byes in a tournament bracket explained",
    description: "What a bye is in a tournament bracket, how many you need for any number of teams, who should get them, and how to explain them so no captain complains.",
    tag: "Format guide",
    answer: "A bye is a free pass into the next round. You need byes when the number of teams is not a power of two (4, 8, 16, 32). The number of byes is the next power of two minus your team count, and the highest seeds should get them.",
    intro: "Nobody has exactly 16 teams. You get 11, or 13, or 21. A bracket only works neatly in powers of two, so the gaps are filled with byes. Done openly, byes are routine. Done quietly, they start arguments before the first match.",
    sections: [
      { h2: "What a bye is", md: `A bye means a team skips a round without playing and is treated as the winner. The team did nothing wrong and gained no points. It simply has no opponent, because the bracket has an empty slot.

Byes only happen in the first round of a knockout. In later rounds, every team that is still alive has an opponent.` },
      { h2: "How many byes you need", md: `Round the number of teams up to the next power of two. The difference is the number of byes.

| Teams entered | Bracket size | Byes | Round-one matches |
|---|---|---|---|
| 5 | 8 | 3 | 1 |
| 6 | 8 | 2 | 2 |
| 11 | 16 | 5 | 3 |
| 13 | 16 | 3 | 5 |
| 21 | 32 | 11 | 5 |

The round-one matches are your team count minus the bracket size's half: for 11 teams, 11 minus 8 is 3 matches, between the six teams that play. The other five teams wait with a bye. A [bracket maker](/tools/brackets/) does this arithmetic for you.` },
      { h2: "Who gets the byes", md: `The highest seeds. This is the standard rule, and it is easy to defend: a team that earned a higher rank gets an easier path. Our guide on [seeding](/guides/how-to-seed-a-tournament-bracket/) explains how to rank teams.

If you have no ranking and are drawing at random, draw the byes openly like any other slot, in front of the captains. Put the byes in different parts of the bracket, not all on one side.` },
      { h2: "Byes that look unfair, and fixes", md: `A bye can feel unfair to the teams that had to play. Three honest answers:

- Say in the rules who gets byes and why, before registration closes.
- Run a play-in round instead: the lowest-seeded teams play first to get the field down to a power of two, and nobody gets a free pass.
- Choose a format that needs no byes, such as a [round robin](/guides/round-robin-single-double-and-tiebreaks/) or a [Swiss system](/guides/swiss-system-tournament-explained/), where every team plays every round.` },
      { h2: "Byes in a double elimination bracket", md: `The same rule applies, but the effect is smaller: a team that gets a bye in round one still has a second life if it loses its first real match. The [double elimination tool](/tools/double-elimination/) places byes automatically. See [double elimination explained](/guides/double-elimination-bracket-explained/) for how the losers bracket handles a missing team.` },
      { h2: "Common mistakes", md: `- Giving byes to friends or to the organiser's own team.
- Putting all the byes in one half, so one half of the bracket is weaker than the other.
- Announcing the byes after the draw.
- Forgetting that a bye is not a win for tie-break purposes in a group stage. In a knockout it does not matter, in a league you must say what it counts for.` },
    ],
    faq: [
      { q: "How many byes do I need for 11 teams?", a: "Five. Round 11 up to the next power of two, which is 16, and subtract: 16 minus 11 is 5. Five teams skip round one, and the other six play 3 matches. The five highest seeds should receive the byes, and you should say so in the rules before the draw so that no captain is surprised." },
      { q: "Is a bye an advantage for the team that gets it?", a: "Yes, a small one: the team skips a match and keeps its energy. That is why byes go to the highest seeds as a reward for rank, or are drawn openly if you have no seeds. If you want no advantage at all, run a play-in round or use a format where everyone plays every round." },
      { q: "Do byes count as wins in a group table?", a: "Not unless you decide so. In a knockout a bye just advances the team. In a league or group, a bye usually earns no points, and a rest round is simply a rest. Write this in the rules so the table is not argued over at the end." },
    ],
    related: ["how-to-seed-a-tournament-bracket", "double-elimination-bracket-explained", "tournament-bracket-template"],
    cta: { label: "Draw a bracket with byes placed for you", href: "/tools/brackets/" },
  },

  {
    slug: "cricket-tournament-rules-template",
    title: "Cricket tournament rules template for local leagues",
    seoTitle: "Cricket tournament rules template",
    description: "A cricket tournament rules template you can copy: overs, squad size, umpires, tie rules, rain, points and net run rate, with the questions captains ask.",
    tag: "Sport guide",
    answer: "A local cricket tournament needs one page of rules that fixes the overs per innings, squad size, umpire decisions, rules for ties and bad weather, the points scheme and the tie-break order. Publish it before registration closes and apply it equally to every team.",
    intro: "Local cricket tournaments run into the same disputes every season: a late team, a rain-shortened match, a bowler over his limit, two teams level on points. A one-page rulebook answers all of them before they start. Below is a structure you can copy and adjust.",
    sections: [
      { h2: "Format and match basics", md: `Fix these first. Everything else depends on them.

- Overs per innings: for example 10, 15 or 20, the same for every match in the tournament.
- Team size on the field and the squad you may register, for example 11 on the field and 14 in the squad.
- Ball and pitch: leather, tennis ball or box cricket, and the pitch length if it is not standard.
- Bowling limit: the maximum overs one bowler may bowl. A common choice is one fifth of the innings, so 4 overs in a 20-over game.
- Match start time and the latest time a team may arrive, such as 15 minutes after the scheduled start.` },
      { h2: "Umpires and decisions", md: `Name who umpires. In local events each team often provides one umpire, which causes complaints, so a neutral pair of umpires per match is better if you can find them.

State that the umpire's decision is final on the field. Write down who decides a protest, and when it must be made, for example before the next ball is bowled or by the end of the match.

Agree a short list of dismissals and no-ball rules that your league uses, especially if you play a modified format.` },
      { h2: "Ties, rain and short matches", md: `Decide before the first match:

- A tied match: a super over is the common choice. Keep it simple and write it down.
- A rain-shortened match: a published method such as DLS if you have a scorer who can use it, or a simple rule such as each side must face at least 5 overs for a result.
- A match that cannot be played: replay, share the points, or give the win to the team that was ready. Pick one and write it down.` },
      { h2: "Points and net run rate", md: `A common local scheme is 2 points for a win, 1 point each for a tie or no result, and 0 for a loss. Check what your league used last year and keep it.

When teams are level on points, use net run rate. ${F.nrr.text} Our guides on [net run rate](/guides/cricket-net-run-rate-explained/) and the [cricket league points table](/guides/cricket-league-points-table/) show the columns and a worked example.

Publish the order of tie-breaks: points, then net run rate, then result between the tied teams, then a toss.` },
      { h2: "Registration and eligibility", md: `Collect the squad list before the first match: name, age, and contact number. For an age-limited event, say what proof is needed and who checks it.

Decide whether players may play for more than one team, and what the transfer deadline is. The [registration form tool](/tools/registration/) lets you collect squads online, and the [ID card maker](/tools/id-cards/) can turn the list into player cards for the gate.` },
      { h2: "A one-page rulebook to copy", md: `1. Format: [league then knockout], [number] overs per innings.
2. Squad: up to [14] players; [11] on the field.
3. Bowling limit: [number] overs per bowler.
4. Start: matches begin at [time]; a team more than [15] minutes late forfeits.
5. Umpires: appointed by the organisers; their decision is final on the field.
6. Ties: [super over].
7. Rain: a result needs at least [5] overs per side; otherwise [replay].
8. Points: win 2, tie or no result 1, loss 0.
9. Tie-breaks: net run rate, then head-to-head, then a toss.
10. Protests: to [name], in writing, within [30] minutes of the match.` },
      { h2: "Common mistakes", md: `- Not stating the bowling limit and finding out mid-match.
- Letting each team supply its own umpire without a rule for disputes.
- Leaving rain rules until it rains.
- Changing the points scheme between groups.
- Forgetting to publish the tie-break order.` },
    ],
    faq: [
      { q: "What rules does a local cricket tournament need?", a: "At minimum: overs per innings, squad and team size, bowling limit, umpires and who decides protests, how ties and rain-affected matches are settled, the points scheme and the order of tie-breaks. Put them on one page and publish them before registration closes. Most disputes disappear once these ten items are written." },
      { q: "How many overs can one bowler bowl in a local match?", a: "There is no single rule for local events, so the organiser sets it. A common limit is one fifth of the innings, which is 4 overs in a 20-over match and 2 overs in a 10-over match. Write the number in the rules so scorers and umpires can enforce it." },
      { q: "What happens if two teams are level on points?", a: "Use the tie-break order you published, normally net run rate first, then the result between the two teams, then a toss. Decide the order before the tournament starts. The worst time to choose a tie-break is after you know which teams are tied, because someone will say it favours the other side." },
    ],
    related: ["cricket-net-run-rate-explained", "cricket-league-points-table", "esports-tournament-rules-template"],
    cta: { label: "Build the squad registration form", href: "/tools/registration/" },
  },

  {
    slug: "minecraft-tournament-how-to-organise",
    title: "How to organise a Minecraft tournament: formats, rules and servers",
    seoTitle: "How to organise a Minecraft tournament",
    description: "How to run a Minecraft tournament: choosing a game mode, a server, team rules, a bracket or points table, fair settings, and how to prove who won.",
    tag: "Game guide",
    answer: "Pick one game mode, host it on a server you control, write rules for teams, cheating and griefing, and choose a format to match: a bracket for head-to-head modes, a points table for modes with many teams at once. Record matches so results can be checked.",
    intro: "Minecraft is flexible, which makes it easy to run a tournament and easy to run a bad one. There is no single competitive mode, so you choose what is played and how it is judged. These choices matter more than the prize.",
    sections: [
      { h2: "Choose one game mode", md: `Minecraft does not come with a built-in tournament. Organisers pick a mode and run it on a server or in a shared world. Popular choices are team-versus-team modes, last-player-standing modes and building contests.

Pick one mode and stay with it. Mixing modes in one event makes scoring unfair. Ask your players what they already know, and run a short test match the week before so nobody meets the mode for the first time on the day.` },
      { h2: "Pick the platform and the server", md: `Minecraft has more than one edition, and they do not play together. Choose one edition and tell players in the registration form. Players on the wrong edition cannot join.

For the server, you have three options: a private server you rent or host, a server run by a community that agrees to host the event, or a shared world among friends. A server you control lets you set rules, ban cheaters and restart a round. Test the server with the number of players you expect before the event.` },
      { h2: "Pick a format", md: `The format follows the mode.

| Mode | Format that fits |
|---|---|
| Team versus team, one match at a time | Single or double elimination bracket |
| Many teams in one match, last standing | Points table over several matches |
| Timed building or challenge rounds | Judged scores added up across rounds |

Use the [bracket maker](/tools/brackets/) for head-to-head modes and the [points table calculator](/tools/points-table/) for many-team modes. The [Swiss system](/guides/swiss-system-tournament-explained/) works well for a large number of players who should all keep playing.` },
      { h2: "Rules that matter in Minecraft", md: `Write down what is and is not allowed:

- Mods, resource packs and client hacks: say which are banned. Many tournaments allow only the unmodified game.
- Griefing, which means damaging another team's build or base outside the rules of the mode.
- Team size, substitutes and when a substitute may join.
- What happens if a player disconnects: a short window to rejoin, then play continues.
- Chat: respectful language and no sharing of private details.
- Who the referees are, and how a player calls one.

Our [tournament rules template](/guides/esports-tournament-rules-template/) has wording for cheating and conduct that applies to any game.` },
      { h2: "Proving who won", md: `Use an admin or referee in the server to watch each match, or ask teams to record their screen. A recording settles most disputes in minutes.

Have each match's result posted by the referee in a shared channel with the team names. If you have no referees, ask both captains to post a screenshot of the end screen and treat a mismatch as a dispute to be settled by the organiser.` },
      { h2: "Common mistakes", md: `- Not checking the edition, so players cannot join.
- Running a mode nobody has tried in a test.
- Allowing mods without saying which ones.
- Having no admin on the server when a match starts.
- Leaving rounds to start whenever players are ready, so the schedule slips by an hour.` },
    ],
    faq: [
      { q: "How do you host a Minecraft tournament?", a: "Choose one game mode and one edition of the game, set up a server you control, write rules for mods, griefing and disconnects, and pick a bracket or points format to match the mode. Run a test match first, assign referees or recordings to prove results, and post the schedule where all players can see it." },
      { q: "What is the best format for a Minecraft tournament?", a: "It depends on the mode. Head-to-head modes suit a single or double elimination bracket. Modes with many teams in one match suit a points table over several rounds. A Swiss system works for a big field where nobody should be knocked out early. Choose the format after the mode, not before." },
      { q: "How do you stop cheating in a Minecraft tournament?", a: "Host on a server you control, allow only the unmodified game if you can, put an admin or referee in every match, and ask players to record their screen. Write the penalty for cheating in the rules before registration. A clear penalty and a visible referee prevent most problems." },
    ],
    related: ["tournament-bracket-template", "choosing-a-tournament-format", "esports-tournament-rules-template"],
    cta: { label: "Make a bracket for the event", href: "/tools/brackets/" },
  },

  {
    slug: "how-to-run-a-swiss-chess-tournament",
    title: "How to run a Swiss chess tournament, round by round",
    seoTitle: "How to run a Swiss chess tournament",
    description: "A practical guide to running a Swiss chess tournament: registration, pairing round one, recording results, tie-breaks, and a timetable for club and school events.",
    tag: "Sport guide",
    answer: "To run a Swiss chess tournament, register players, decide the number of rounds, pair round one by rating or at random, pair each later round by score without repeating opponents, record results on one sheet, and rank by points then a published tie-break.",
    intro: "A Swiss tournament is the standard format for club and school chess because everyone plays every round. The method is easy to learn but easy to fumble live. This guide gives you the order of work and a sheet to run it with, no software required.",
    sections: [
      { h2: "Before the day", md: `- Open registration with name, age or class, and a rating if players have one. Use the [registration form tool](/tools/registration/).
- Fix the number of rounds from the number of players. The [Swiss system guide](/guides/swiss-system-tournament-explained/) has the rule of thumb: 4 rounds for 16 players, 5 for 32.
- Fix the time control and the late limit. The [chess rules guide](/guides/chess-tournament-rules-for-organisers/) gives wording.
- Print the rules, the pairing sheet and blank result slips.
- Name an arbiter who does not play.` },
      { h2: "Pairing round one", md: `Sort the players by rating, highest first. If nobody has a rating, sort by a fair method such as age or order of registration, or draw at random.

Split the sorted list into two halves. The first player of the top half plays the first player of the bottom half, the second plays the second, and so on. Give colours alternately.

With an odd number of players, the lowest-ranked player gets a bye, worth one point.` },
      { h2: "Recording results", md: `Use a simple sheet. One row per player, and these columns: name, rating, then one column per round showing opponent, colour and result.

${F.chess.text} Add the points after each round, then rank.

A result slip filled in by both players and signed removes most disputes. Collect slips at the table as games end. Do not accept a result by word of mouth.` },
      { h2: "Pairing the later rounds", md: `1. Rank everyone by points.
2. Group players with the same score.
3. Within each group, pair the top half against the bottom half.
4. Check nobody has met their opponent before. If they have, swap with a neighbour.
5. Give the colour a player has had less often.
6. If the group is odd, move the lowest player down to the next group.

Do not pair until the last result is in. A missing result changes every pairing below it.` },
      { h2: "A sample timetable", md: `This runs 5 rounds in a day with 32 players.

| Time | What happens |
|---|---|
| 09:00 | Registration and check-in |
| 09:30 | Rules and round 1 pairings |
| 09:45 to 10:30 | Round 1 |
| 10:40 to 11:25 | Round 2 |
| 11:35 to 12:20 | Round 3 |
| 13:20 to 14:05 | Round 4 |
| 14:15 to 15:00 | Round 5 |
| 15:15 | Final standings, tie-breaks and prizes |

The 10 minutes between rounds is for pairing. Show pairings on a screen using a [display screen](/tools/display-screen/) if you have a TV.` },
      { h2: "Ranking and tie-breaks", md: `Rank by total points. For tied players, apply the order you published. ${F.swissTiebreak.text}

If prizes depend on a tie, such as first place, you may play a short play-off game instead of using a tie-break. Say this in the rules before round one.` },
      { h2: "Common mistakes", md: `- Starting without a written time control.
- Pairing before every result is recorded.
- Giving the same player a bye twice.
- Using too few rounds for the number of players.
- Not choosing a tie-break rule before the event.` },
    ],
    faq: [
      { q: "How do you pair the first round of a Swiss chess tournament?", a: "Sort players by rating, split the list into two halves, and pair the first player of the top half with the first of the bottom half, the second with the second, and so on. With no ratings, sort by a fair method or draw at random. Give the lowest-ranked player the bye if the number is odd." },
      { q: "How many rounds should a school chess tournament have?", a: "Use the base-2 logarithm of the players as a minimum: 3 rounds for 8 players, 4 for 16 and 5 for 32. If time allows, add one more round. For a school event with limited time, 4 or 5 short rounds of rapid chess is a common choice and finishes within a day." },
      { q: "Do I need software to run a Swiss tournament?", a: "No. For up to about 30 players you can run it with a printed sheet and pencil, or a spreadsheet sorted by score before each round. Software saves time above that, but the most important skills are recording results carefully and never pairing two players twice." },
    ],
    related: ["swiss-system-tournament-explained", "chess-tournament-rules-for-organisers", "round-robin-single-double-and-tiebreaks"],
    cta: { label: "Build the registration form", href: "/tools/registration/" },
  },

  {
    slug: "best-of-1-3-5-series-length-explained",
    title: "Best of 1, best of 3 or best of 5: choosing a series length",
    seoTitle: "Best of 1, 3 or 5: choosing a series length",
    description: "How to choose between best of 1, best of 3 and best of 5 for a tournament: time cost, fairness, when to change length by round and how to schedule it.",
    tag: "Format guide",
    answer: "A longer series gives the better team a fairer chance, but costs time. Use best of 1 for early rounds to move fast, best of 3 for later knockout rounds, and best of 5 only for a final if you have the time. Always plan the schedule for the longest possible series.",
    intro: "Series length is a quiet decision that shapes the whole event. Best of one is quick and unpredictable. Best of five is fair and takes all afternoon. The right answer changes by round, and you can mix lengths in one bracket.",
    sections: [
      { h2: "What the numbers mean", md: `A best-of-3 series is won by the first side to win 2 games, so it lasts 2 or 3 games. Best of 5 is won by the first to 3, so it lasts 3, 4 or 5 games. Best of 1 is a single game.

| Series | Wins needed | Games played |
|---|---|---|
| Best of 1 | 1 | 1 |
| Best of 3 | 2 | 2 or 3 |
| Best of 5 | 3 | 3 to 5 |
| Best of 7 | 4 | 4 to 7 |

Use an odd number so the series cannot end level.` },
      { h2: "Fairness versus time", md: `One game can be decided by one mistake or one lucky moment. Over three games, the stronger team usually shows. Over five, it almost always does.

But every extra game costs time. If a game takes 30 minutes, a best-of-5 can need up to 150 minutes for one match. With 8 matches in a round, that is not realistic on one screen.

Decide using this question: what is the cost of the wrong team winning? In a friendly college cup, one game is fine. In a final with a prize pool, give the finalists three or five.` },
      { h2: "Change the length by round", md: `A common structure for a single-elimination bracket of 16:

| Round | Series |
|---|---|
| Round of 16 | Best of 1 |
| Quarter-finals | Best of 3 |
| Semi-finals | Best of 3 |
| Final | Best of 5 |

This keeps the early rounds fast, and gives the stronger teams a fair chance late on. The [bracket maker](/tools/brackets/) lets you set the series per round when you plan the event. Tell the teams the lengths when they register.` },
      { h2: "Scheduling for the worst case", md: `Plan each round for the longest possible series, not the average. A best-of-3 should be scheduled for 3 games even though many will end in 2. If it ends early, the next match starts early, which is a pleasant surprise rather than a delay.

The [match schedule maker](/tools/schedule/) turns series lengths and match durations into a timetable. Leave a 10 to 15 minute gap between series for results and set-up.` },
      { h2: "Special cases", md: `- Double elimination: use a shorter series in the winners bracket and losers bracket, and a longer series for the grand final. See [double elimination explained](/guides/double-elimination-bracket-explained/).
- Round robin and group stages: usually best of 1, because every team plays many matches and the table averages out luck.
- Games with sides or maps: in a series, alternate sides or maps so neither team has the same advantage every game. Map-based games such as Valorant and CS2 handle this with a veto, which later guides in this series cover.` },
      { h2: "Common mistakes", md: `- Scheduling for the average length and running late.
- Using an even number of games, leaving a possible draw.
- Using best of 1 for the final of a big event.
- Changing the series length mid-event.
- Not telling teams the length in advance.` },
    ],
    faq: [
      { q: "What does best of 3 mean?", a: "A best-of-3 series is won by the first side to win two games. It lasts two or three games: if one side wins the first two, the third is not played. It is a common choice for later knockout rounds because it is fairer than a single game and shorter than best of five." },
      { q: "When should I use best of 1?", a: "Use best of 1 in early rounds, group stages and casual events, where speed matters more than a perfect result. Over a round robin or group table, luck evens out across many matches. Avoid it for a final with a prize, where one unlucky game could decide the whole event." },
      { q: "How long does a best of 5 take?", a: "Multiply the length of one game by up to five, and add gaps between games. For a 30-minute game that is up to 150 minutes plus breaks. Plan the schedule for the maximum even though many series finish in three or four games, and keep best of 5 for the final." },
    ],
    related: ["tournament-bracket-byes-explained", "double-elimination-bracket-explained", "choosing-a-tournament-format"],
    cta: { label: "Plan a match schedule", href: "/tools/schedule/" },
  },

  {
    slug: "valorant-map-veto-explained",
    title: "Valorant map veto and series rules for tournament organisers",
    seoTitle: "Valorant map veto explained for organisers",
    description: "How to run a Valorant map veto for a tournament: the ban and pick order for best of 1, 3 and 5, side choice, round rules and what to write in your rulebook.",
    tag: "Game guide",
    answer: "A map veto is a turn-taking process in which two teams ban maps and then pick the ones to play, so the maps are decided by both sides rather than by chance. Write the order, who starts, who chooses sides and the match rules into your rulebook before the event.",
    intro: "In team shooters a map is half the match. A tournament that picks maps at random upsets the teams that prepared; a tournament with no rule invites an argument. A map veto fixes this with a short, fair procedure. This guide explains the idea so you can write your own.",
    sections: [
      { h2: "The match you are organising", md: `${F.valorant.text}

Your rulebook should state the round target and the overtime rule you are using, because they can differ by tournament. Check the game's current settings and the version of the rules you choose.` },
      { h2: "What a veto does", md: `The map pool is the list of maps allowed in your tournament. A veto is a fixed order of bans and picks:

- Each team bans maps it does not want to play, which removes them.
- Then teams pick maps, and the other team chooses which side to start on for each picked map.
- A last remaining map may be played as the decider.

The point is balance. Both teams get to remove a map they fear and to pick one they like.` },
      { h2: "A sample veto order", md: `Here is one common pattern for a best of 3 with a pool of 7 maps. Teams are called A and B, and A is the higher seed or wins a coin toss.

| Step | Who | Action |
|---|---|---|
| 1 | A | Ban a map |
| 2 | B | Ban a map |
| 3 | A | Pick map 1 |
| 4 | B | Choose side on map 1; pick map 2 |
| 5 | A | Choose side on map 2 |
| 6 | B | Ban a map |
| 7 | A | Ban a map |
| 8 | | The last map is the decider; B chooses the side |

Rulebooks vary in the exact order. Pick one, test it with two captains before the event, and print it. For a best of 1, a shorter pattern of alternate bans down to one map is common.` },
      { h2: "Who goes first, and sides", md: `Decide who starts the veto by seed, by a coin toss or by a result from earlier in the event, and say which. The team that starts the veto is the one that does not choose the side on the decider.

For overtime sides, follow the game's built-in rules unless your rulebook says otherwise. Write it down if you change anything.` },
      { h2: "Running it on the day", md: `- Run the veto in a call or a shared chat with a referee present. The referee records every ban and pick.
- Give each captain a time limit per decision, such as 30 seconds, and a default if time runs out.
- Post the result in the match thread so both teams can see the maps and sides before the match.
- Keep a single page called "Map pool and veto" in your rules. You can link to it from the [rules template](/guides/esports-tournament-rules-template/) and from your [bracket](/tools/brackets/).` },
      { h2: "Common mistakes", md: `- Letting teams agree maps privately and then dispute them.
- Not writing the veto order, so each match uses a different one.
- Changing the map pool mid-event.
- No time limit per decision.
- Forgetting that the game itself changes: re-check the map pool before each tournament.` },
    ],
    faq: [
      { q: "What is a map veto in Valorant?", a: "It is a turn-taking process where two teams ban maps from a pool and then pick maps to play, so that both sides help decide the maps. A referee records each step. The organiser writes the order and the side-choice rules in advance so every match in the tournament uses the same procedure." },
      { q: "How many maps are in a Valorant tournament map pool?", a: "It is set by the organiser and changes as the game updates. Many events use a pool of around seven maps. Check the game's current maps before the tournament, choose the pool, and publish it with the veto order so teams can prepare for the maps they may face." },
      { q: "Who chooses sides in a map veto?", a: "Usually the team that did not pick the map chooses the side for it, and the decider's side goes to the team that did not start the veto. This keeps the process balanced. Whatever you choose, write it in the rules and apply it to every match." },
    ],
    related: ["valorant-tournament-organiser", "best-of-1-3-5-series-length-explained", "esports-tournament-rules-template"],
    cta: { label: "Make the bracket for your Valorant event", href: "/tools/brackets/" },
  },

  {
    slug: "cricket-tournament-registration-form",
    title: "Cricket tournament registration form: fields to ask and how to collect them",
    seoTitle: "Cricket tournament registration form fields",
    description: "What to put on a cricket tournament registration form: team and player fields, age proof, fees, consent for minors, and how to collect and check entries online.",
    tag: "Sport guide",
    answer: "A cricket registration form should collect the team name, captain and contact, the squad with names and ages, the entry fee and how it was paid, and consent for any players under 18. Close registration on a fixed date and confirm every team in writing.",
    intro: "A good registration form saves you a week of WhatsApp messages. A bad one leaves you chasing player names on match day. The aim is simple: collect exactly what you need, once, in a format you can print and check.",
    sections: [
      { h2: "Team fields", md: `- Team name, exactly as it should appear on the fixture list.
- Captain's name and phone number.
- A second contact, such as the vice-captain, in case the first does not answer.
- Area or club the team belongs to, for events across several clubs or colleges.
- Preferred days or times if your schedule can use them.` },
      { h2: "Player fields", md: `For each player in the squad:

- Full name as on an ID.
- Age or date of birth, if the event has an age limit.
- Role: batter, bowler, all-rounder, wicketkeeper. It helps you check you have a full team.
- Phone number, or at least the captain's number for the whole squad.
- Shirt number if you will print scorecards or cards.

Set the squad limit on the form, for example 14 players. Make 11 the minimum if you require a full side.` },
      { h2: "Fees and payment", md: `State the entry fee on the form, what it covers, and what the refund rule is. Collect a payment reference or a screenshot so you can match payments to teams.

Do not collect card details on your own form. Use your normal payment method (a bank transfer or a UPI link) and record who has paid. The [tournament rules template](/guides/esports-tournament-rules-template/) has standard wording you can adapt for refunds.` },
      { h2: "Age proof and consent", md: `If any players may be under 18, ask for a parent or guardian's name and consent on the form, and say what ID may be asked for at the venue. Only collect what you need. Do not ask for ID numbers on a public form; ask players to carry the ID instead.

State how you will use their details: only to run the tournament, and not shared outside it. Link to your privacy page.` },
      { h2: "Collecting and checking entries", md: `Build the form with the [registration form tool](/tools/registration/), which gives you a page and a link you can turn into a QR code on your poster. Put the QR code on the [poster](/guides/cricket-tournament-poster-ideas/) too.

When registration closes, export the entries and check them: no duplicate players across teams, every squad within the limit, every fee recorded. Send each captain a written confirmation with the schedule, the rules and the first match time.` },
      { h2: "A sample form, field by field", md: `If you want a form you can build in ten minutes, use this order. Short forms get finished.

| Section | Fields |
|---|---|
| Your team | Team name, area or club, preferred match days |
| Contacts | Captain's name and phone, vice-captain's name and phone |
| Squad | Full name, age, role for each of up to 14 players |
| Fees | Amount, how it was paid, payment reference |
| Consent | Parent or guardian consent for any player under 18, and agreement to the rules |

Put the rules link at the top of the form, so teams read it before they pay. After submission, show a thank-you message that says when you will confirm the entry, for example within 24 hours.` },
      { h2: "Common mistakes", md: `- Asking for too much, so captains give up halfway.
- Having no squad limit, so teams add players all week.
- Leaving the closing date open.
- Collecting payments in several places with no record.
- Not confirming teams in writing.` },
    ],
    faq: [
      { q: "What should a cricket tournament registration form ask?", a: "Team name, captain and a second contact with phone numbers, the squad with names and ages, roles, the entry fee and a payment reference, and consent for players under 18. Add a closing date and a squad limit on the form itself. Ask only what you need, because every extra field costs you entries." },
      { q: "How many players should a cricket squad have?", a: "The organiser decides. A common local rule is 11 players on the field with a squad of up to 14 or 15, which allows for substitutes. Put the number on the form and in the rules so that every team registers within the same limit, and check squads when registration closes." },
      { q: "How do I check player ages for an age-limited tournament?", a: "Ask for date of birth on the form and tell teams that players must carry an ID or school card to the venue. Check the ID at the gate or before the first match, not by collecting copies online. Write the rule and the penalty for using an ineligible player in the rulebook." },
    ],
    related: ["cricket-tournament-rules-template", "tournament-registration-form-fields", "cricket-tournament-poster-ideas"],
    cta: { label: "Build your registration form", href: "/tools/registration/" },
  },

  {
    slug: "group-stage-and-knockout-planning",
    title: "Group stage plus knockout: how to plan the draw and the schedule",
    seoTitle: "Group stage and knockout: plan the draw",
    description: "How to plan a group stage followed by a knockout: group sizes, how many teams qualify, the draw, cross-over pairings and a match count for 8, 12 and 16 teams.",
    tag: "Format guide",
    answer: "A group stage splits teams into small round robins, then the best of each group go into a knockout bracket. Choose groups of 3 or 4, qualify the top one or two from each, and cross groups in the first knockout round so teams from the same group do not meet again.",
    intro: "Group stage plus knockout is the format of most major tournaments for a reason. Everyone plays more than one match, a bad first game does not end your event, and the knockout gives a clear finish. Planning it takes four decisions: group size, qualifiers, the draw, and the cross-over.",
    sections: [
      { h2: "Choose the group size", md: `Groups of 4 are the standard: each team plays 3 matches, and a group has 6 matches in total. Groups of 3 are shorter: 3 matches per group, and each team plays 2. Groups of 5 add up quickly: 10 matches per group.

| Teams | Groups | Group matches |
|---|---|---|
| 8 | 2 groups of 4 | 12 |
| 12 | 4 groups of 3 | 12 |
| 16 | 4 groups of 4 | 24 |
| 20 | 4 groups of 5 | 40 |

Match counts are 6 per group of 4 and 3 per group of 3. Use the [round robin guide](/guides/round-robin-single-double-and-tiebreaks/) for the formula.` },
      { h2: "How many teams qualify", md: `Choose so that the knockout stage is a clean power of two.

- 4 groups, top 2 from each: 8 teams in the quarter-finals.
- 2 groups, top 2 from each: 4 teams in the semi-finals.
- 4 groups, top 1 from each: 4 teams in the semi-finals.
- 8 groups of 4, top 2 each: 16 teams in the round of 16.

Qualifying two from each group gives teams a second chance in the last group match. Qualifying only one makes every group match more important.` },
      { h2: "Do the draw openly", md: `Seed the teams into pots by strength, then draw one team from each pot into every group. With 16 teams and 4 groups, you have 4 pots of 4: pot 1 has the top four seeds, one in each group.

If you have no ranking, draw all teams at random. Do it live or share a recording. The guide on [how to seed a bracket](/guides/how-to-seed-a-tournament-bracket/) covers the same fairness ideas.

The [groups and knockout maker](/tools/groups/) makes the draw, the group tables and the knockout bracket together.` },
      { h2: "Crossing over into the knockout", md: `The first knockout round should pair a group winner with another group's runner-up. For 4 groups (A to D), the quarter-finals are:

| Match | Pairing |
|---|---|
| 1 | Winner A vs runner-up B |
| 2 | Winner C vs runner-up D |
| 3 | Winner B vs runner-up A |
| 4 | Winner D vs runner-up C |

This keeps teams from the same group apart, and rewards group winners with the weaker opposition. The two teams from one group can only meet again in the final.` },
      { h2: "Scheduling the stages", md: `Run the group matches in rounds, so every team plays once before anyone plays twice. The final group round should be played at the same time for the two matches in each group, so no team knows the exact result it needs.

Leave a gap between the last group round and the first knockout, for results, tie-breaks and a new draw sheet. The [schedule maker](/tools/schedule/) builds a timetable for the whole event.` },
      { h2: "Common mistakes", md: `- Not writing the tie-break order for the groups. Use the order in the [football points guide](/guides/football-points-system-and-tiebreakers/) as a starting point.
- Drawing groups after seeing results from earlier events with no rule.
- Letting group winners meet their own group's runner-up in round one.
- Playing the last group round at different times.` },
    ],
    faq: [
      { q: "How many teams should qualify from each group?", a: "Choose a number that makes the knockout stage a power of two. With 4 groups, the top 2 from each gives 8 teams for the quarter-finals. With 2 groups, the top 2 gives 4 teams for the semi-finals. Qualifying two teams gives a group a second chance, and qualifying one team makes every match count." },
      { q: "How many matches are in a group stage?", a: "A group of 4 has 6 matches, a group of 3 has 3 and a group of 5 has 10. Multiply by the number of groups. Four groups of 4 therefore play 24 group matches before the knockout stage starts. Use that figure to check the schedule against your venue and hours." },
      { q: "How do I avoid group rematches in the knockout?", a: "Pair each group winner with another group's runner-up in the first knockout round, as in winner A against runner-up B. Teams from the same group are then placed in different halves and can only meet again in the final. A groups-and-knockout tool will generate this cross-over for you." },
    ],
    related: ["round-robin-single-double-and-tiebreaks", "how-to-seed-a-tournament-bracket", "football-points-system-and-tiebreakers"],
    cta: { label: "Build the groups and knockout", href: "/tools/groups/" },
  },

  {
    slug: "cs2-tournament-format-and-map-veto",
    title: "CS2 tournament format: rounds, overtime and a map veto",
    seoTitle: "CS2 tournament format, rounds and map veto",
    description: "How to organise a Counter-Strike 2 tournament: the MR12 match format, overtime, series length, map veto, server needs and what to put in the rulebook.",
    tag: "Game guide",
    answer: "A CS2 competitive match is first to 13 rounds, with 12-round halves, and overtime if both teams reach 12. Choose a series length, run a map veto to pick the maps, and write the overtime, server and pause rules into the rulebook before the event.",
    intro: "Counter-Strike has a long tournament tradition, so players arrive with expectations: a map veto, a fixed round format, and strict rules about pauses and disconnects. Meeting those expectations is most of the work of organising a CS2 event.",
    sections: [
      { h2: "The match format", md: `${F.cs2.text}

For the organiser, the practical effect is that a full match is between 13 and 24 rounds, or more with overtime. Check the current game settings before the event, because match formats and defaults can change with updates.` },
      { h2: "Choose the series", md: `Pick the series by round:

| Stage | Series |
|---|---|
| Early rounds or groups | Best of 1 |
| Knockouts | Best of 3 |
| Final | Best of 3 or best of 5 |

Plan the schedule for the longest series. A map can take 30 to 60 minutes with overtime, so a best-of-3 can fill an evening. The guide on [series length](/guides/best-of-1-3-5-series-length-explained/) shows how to schedule it.` },
      { h2: "Run a map veto", md: `Use a veto so both teams help choose the maps. A common best-of-3 pattern with seven maps is: team A bans one, team B bans one, A picks, B picks, A bans, B bans, and the last map is the decider. The team that did not pick a map chooses the starting side.

Read the [map veto guide](/guides/valorant-map-veto-explained/) for the process and sample table; the idea is the same in CS2. Record every step and post it in the match thread.` },
      { h2: "Servers and settings", md: `Use a dedicated server you control, with the same settings in every match. You need:

- A server for each match that is running at the same time.
- A written config: round time, freeze time, buy rules and the overtime setting.
- An admin who can pause, restart a round and add a spectator.
- An agreed way to share the server details with teams just before the match.

Test the server with the number of players you expect, on the day before the event.` },
      { h2: "Rules for pauses and disconnects", md: `Write the rules in numbers: how many pauses per team per map, how long each lasts, what happens if a player disconnects, and the time limit to rejoin. State what happens if a team is late: a common rule is a forfeit after 15 minutes.

Add a clear rule on cheating and a penalty. The [rules template](/guides/esports-tournament-rules-template/) has conduct wording you can adapt.` },
      { h2: "Match-day checklist", md: `1. Servers booted and tested an hour before the first match.
2. The map pool and veto order posted where captains can see them.
3. A referee or admin named for every live match, with a way to reach them.
4. Teams checked in at least 15 minutes before their start time.
5. Results written down by the referee, then posted on the bracket.

Give captains one contact number or chat channel for problems, and answer it quickly. Most match-day delays in CS2 events come from server details sent late, not from the game.` },
      { h2: "Common mistakes", md: `- Not testing the server config before the event.
- Leaving pause rules unwritten.
- Planning each match for one hour with a best-of-3 in the schedule.
- Not setting an overtime rule.
- Changing the map pool during the tournament.` },
    ],
    faq: [
      { q: "What does MR12 mean in CS2 matches?", a: "MR12 means each half of the match has 12 rounds. A full match is 24 rounds in regulation, and the first team to win 13 rounds wins outright. If both teams reach 12, the match goes to overtime, played in short sets. Organisers should state the overtime rule in the rulebook." },
      { q: "How long does a CS2 match take?", a: "A match can last 13 to 24 rounds, or longer with overtime, so a single map can take 30 to 60 minutes. A best-of-3 series can fill an evening. Schedule for the longest case, leave time between matches and use a shorter series in the early rounds." },
      { q: "How should I run the map pick in CS2?", a: "Use a veto: teams alternate bans and picks from a published map pool, a referee records the steps, and the team that did not pick a map chooses its starting side. Write the order in your rules and use the same order in every match, so that no team feels the process is arbitrary." },
    ],
    related: ["valorant-map-veto-explained", "best-of-1-3-5-series-length-explained", "esports-tournament-rules-template"],
    cta: { label: "Make a bracket for your CS2 event", href: "/tools/brackets/" },
  },

  {
    slug: "tournament-tiebreaker-rules-how-to-write",
    title: "How to write tie-breaker rules for any tournament",
    seoTitle: "How to write tie-breaker rules",
    description: "How to write tie-breaker rules that stop arguments: pick the order, test it on a sample table, handle three-way ties and publish it before the first match.",
    tag: "Format guide",
    answer: "Write your tie-breaks as an ordered list, apply them one at a time until the tie is broken, and finish with something that cannot tie, like a play-off or a draw of lots. Publish the order before the first match and test it on a sample table.",
    intro: "Every tournament that uses points will eventually have a tie, and the tie always lands on the team the organiser was hoping would win or lose. A tie-break written in advance protects you from that. This guide shows how to write one that holds up.",
    sections: [
      { h2: "Write them as an ordered list", md: `A tie-break is not one rule, it is a list. You apply the first rule, and only if the tie remains do you move to the second.

A typical order for a league or group:

1. Points.
2. Head-to-head result between the tied teams.
3. Score difference across all matches (goals, rounds or points).
4. Score for, across all matches.
5. A play-off match or a draw of lots.

Cricket replaces step 3 with net run rate. See [net run rate explained](/guides/cricket-net-run-rate-explained/). Chess and Swiss events use Buchholz and similar scores; see the [Swiss guide](/guides/swiss-system-tournament-explained/).` },
      { h2: "Choose a final tie-break that cannot tie", md: `If your last rule can also tie, someone will be stuck. End with one that always produces an answer:

- A play-off match, if time allows.
- A draw of lots in front of the captains.
- A coin toss, for events where time is short.

For a final, a play-off is the fairest. For a mid-table place, a draw is acceptable if you said so beforehand.` },
      { h2: "Head-to-head: when it works and when it does not", md: `Head-to-head means the result of the match between the tied teams. With two teams tied, it is simple. With three or more tied, one match is not enough, and you need a mini-table of only the matches between those teams.

A short rule that handles both: "If two teams are tied, the result between them decides. If three or more are tied, a table of the results among those teams decides, then the rest of the order applies."` },
      { h2: "Test it on a sample table", md: `Before the event, build a pretend table with a three-way tie and apply your rules. If you reach the end of the list without an answer, or if the answer depends on how you read a sentence, rewrite it.

| Team | Played | Pts | GD |
|---|---|---|---|
| A | 3 | 6 | +2 |
| B | 3 | 6 | +2 |
| C | 3 | 6 | -1 |

Two teams are level on points and goal difference here, so the next rule applies. This check takes ten minutes and prevents a dispute later.` },
      { h2: "Publish it, and stick to it", md: `Put the tie-break order on your rules page and on the registration form, and read it out at the captains' meeting. Use the [round robin generator](/tools/round-robin/) and keep the table in one place so it can be checked.

If you spot a gap during the event, fix it for the next event. Do not change the order mid-tournament, because whichever way you change it, some team benefits.` },
      { h2: "Common mistakes", md: `- Choosing the order after the tie appears.
- Ending with a rule that can also tie.
- Not covering a three-way tie.
- Using different orders for different groups.
- Counting a forfeit as a 0-0 draw in the score columns without saying so.` },
    ],
    faq: [
      { q: "What is a tie-breaker in a tournament?", a: "It is a rule used to rank teams that finish level on points. Tie-breakers are applied in a published order, such as head-to-head result, then score difference, then score for, and finally a play-off or a draw of lots. They should be written before the first match, not after a tie occurs." },
      { q: "How do you break a three-way tie?", a: "Use a mini-table that only counts the matches among the three tied teams, and rank them by points, then score difference within those matches. If they are still level, return to the overall record, and finish with a play-off or draw of lots. Write the three-way rule in advance." },
      { q: "Should head-to-head come before goal difference?", a: "Either order is used by real competitions. What matters is that you choose one before the event, write it in the rules and apply it equally. Many local events put head-to-head first when two teams are tied, and score difference first when three or more are tied." },
    ],
    related: ["football-points-system-and-tiebreakers", "round-robin-single-double-and-tiebreaks", "cricket-net-run-rate-explained"],
    cta: { label: "Generate fixtures and keep the table", href: "/tools/round-robin/" },
  },
];
