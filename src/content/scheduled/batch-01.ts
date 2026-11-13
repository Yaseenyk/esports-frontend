import type { Draft } from "./types";
import { FACTS as F } from "./facts";

/** Posts 1 to 9 (released 16 Nov to 28 Nov 2026). The highest-demand topics first: formats, scoring and posters. */
export const BATCH_01: Draft[] = [
  {
    slug: "swiss-system-tournament-explained",
    title: "Swiss system tournament: how it works and how to run one",
    seoTitle: "Swiss system tournament explained",
    description: "How a Swiss system tournament works: pairing by score, how many rounds you need, tie-breaks, and when to pick it over a bracket or a round robin.",
    tag: "Format guide",
    answer: "In a Swiss system tournament nobody is knocked out. Each round, players or teams on the same score are paired together, and everyone plays the same number of rounds. It ranks a large field fairly in far fewer rounds than a round robin needs.",
    intro: "Organisers usually know two formats: a knockout bracket, where one bad match ends your day, and a round robin, where everyone plays everyone and the event never ends. The Swiss system sits between them. It is how large chess events run, and it works for any one-versus-one game where you want everyone to keep playing.",
    sections: [
      { h2: "What a Swiss tournament is", md: `A Swiss tournament has a fixed number of rounds, and every player plays every round. Nobody is eliminated. After each round, players are ranked by score, and the next round pairs players who are on the same or nearly the same score.

The effect is that strong players meet strong players as the rounds go on, and weaker players meet weaker players, so every match is close. After the last round, the player with the highest score wins.

${F.chess.text} The same 1, half and 0 idea works for most games with draws. For games without draws, a win is simply 1.` },
      { h2: "How the pairing works, round by round", md: `1. Round 1: list the players in seed order, split the list in half, and pair the top half against the bottom half (1 plays the first player of the bottom half, and so on). With no seeds, draw the pairs at random.
2. After the round, add up scores. Everyone with the same score forms a group.
3. Pair players inside each group, strongest against weakest, so a 2-0 player plays another 2-0 player.
4. Never pair two players who have already met.
5. If a group has an odd number of players, one player moves down to play in the next group.
6. Repeat until the last round.

Pairing by hand is manageable for 16 players and gets slow after that. For a bigger field, use a spreadsheet and sort by score before each round.` },
      { h2: "How many rounds do you need", md: `A common rule of thumb is to play at least as many rounds as it takes to halve the field down to one player. In numbers, that is the base-2 logarithm of the player count, rounded up.

| Players | Swiss rounds (rule of thumb) | Matches played in total |
|---|---|---|
| 8 | 3 | 12 |
| 16 | 4 | 32 |
| 32 | 5 | 80 |
| 64 | 6 | 192 |

The matches column is players divided by 2, times the rounds. Compare that with a round robin, where 16 players need 120 matches and 32 players need 496, and with a single-elimination bracket, where 16 players need 15 matches but half of them play only once.

More rounds make the final ranking more reliable. If you have the time, add one round beyond the rule of thumb.` },
      { h2: "Breaking ties", md: `With a small number of rounds, several players will finish on the same score. You decide the tie-break rule before round 1 and publish it.

${F.swissTiebreak.text} Buchholz is the sum of the final scores of everyone a player has faced, so it rewards a player who had a harder run. Other common options are head-to-head result between the tied players, the number of wins, and, for a game with scores, the total points difference.

> Write the order of tie-breaks in your rules page. Players accept almost any rule if it was published before the event and applied the same way to everyone.` },
      { h2: "When to choose Swiss, and when not to", md: `Choose a Swiss tournament when:

- You have too many players for a round robin, but you do not want half of them to leave after one match.
- The game is one against one (or team against team), with matches of about the same length.
- You want a ranking of the whole field, not only a winner.

Choose something else when:

- You have 4 to 8 teams. A round robin is simple and fair at that size, and the [round robin generator](/tools/round-robin/) writes the fixtures.
- You need a clear knockout final for the audience. Run a Swiss stage first, then take the top 4 or 8 into a [bracket](/tools/brackets/).
- The game is a battle royale with 20 teams in one lobby. That is a [points table](/guides/points-table/) job, not a pairing job.` },
      { h2: "Running it on the day", md: `Keep a single sheet with a row per player: name, score, opponents already played, and a column for each round. Put one person in charge of the pairings and one in charge of results.

- Announce the round time and the break between rounds in the rules, for example 45 minutes per round plus 10 minutes to pair the next one.
- Post pairings on a screen or a board the moment they are ready. A [display screen](/tools/display-screen/) on a TV works well for this.
- Set a rule for a player who is late: a short grace period, then a loss for that round.
- Decide in advance what a bye is worth. A common choice is one full point, and only once per player.` },
      { h2: "Common mistakes", md: `- Pairing before all results are in. One missing result changes every pairing below it.
- Letting two players meet twice because the group ran out of fresh opponents. Move a player down a group instead.
- Choosing the tie-break after seeing who is tied.
- Using too few rounds for the field, so two players finish unbeaten and the winner is decided by a tie-break.
- Giving the bye to the same weak player every time. Give it to the lowest-ranked player who has not had one yet.` },
    ],
    faq: [
      { q: "How many rounds should a Swiss tournament have?", a: "Use the base-2 logarithm of the number of players, rounded up, as a minimum: 3 rounds for 8 players, 4 for 16, 5 for 32 and 6 for 64. One extra round makes the ranking more reliable. Fewer rounds than that can leave several players unbeaten, and then the winner is decided by a tie-break rather than by play." },
      { q: "Can two players meet twice in a Swiss tournament?", a: "No. A basic rule of Swiss pairing is that two players never meet twice. If the pairing in a score group would repeat a match, move a player into the next group or swap with a neighbour. This is the main reason pairing by hand gets hard after round 4 or 5." },
      { q: "What do you do with an odd number of players in a Swiss tournament?", a: "One player gets a bye each round and is awarded a win without playing. Give the bye to the lowest-ranked player who has not had one, and never give the same player two. Say in the rules what a bye is worth, usually one full point, so nobody argues about it." },
    ],
    related: ["choosing-a-tournament-format", "tournament-bracket-template", "round-robin-schedule"],
    cta: { label: "Open the bracket maker for your playoff", href: "/tools/brackets/" },
  },

  {
    slug: "cricket-net-run-rate-explained",
    title: "Cricket net run rate explained, with a worked example",
    seoTitle: "Cricket net run rate (NRR) explained",
    description: "How net run rate works in a cricket tournament: the formula, a worked example with real numbers, the all-out rule and how to rank teams level on points.",
    tag: "Sport guide",
    answer: "Net run rate (NRR) is a team's runs per over minus the runs per over it conceded, across the whole tournament. Organisers use it to rank teams that finish level on points. A higher NRR ranks higher, and a negative one means a team conceded faster than it scored.",
    intro: "Every local cricket league ends the same way: two or three teams level on points, and an argument about who goes through. Net run rate is the standard way to settle it, and it is simple once you see one calculation done with real numbers.",
    sections: [
      { h2: "The formula", md: `${F.nrr.text}

Written out for one team:

- Run rate scored = total runs scored in all matches, divided by total overs faced in all matches.
- Run rate conceded = total runs conceded in all matches, divided by total overs bowled in all matches.
- Net run rate = run rate scored minus run rate conceded.

Use totals across the whole tournament, not an average of each match's NRR. That detail is the most common mistake.` },
      { h2: "A worked example", md: `Team Falcons play two 20-over matches.

| Match | Falcons scored | Overs faced | Falcons conceded | Overs bowled |
|---|---|---|---|---|
| 1 | 160 | 20 | 140 | 20 |
| 2 | 120 | 20 | 150 | 20 |
| Total | 280 | 40 | 290 | 40 |

Run rate scored: 280 divided by 40 is 7.00. Run rate conceded: 290 divided by 40 is 7.25. Net run rate: 7.00 minus 7.25 is -0.25.

The Falcons won one match and lost one, but they conceded slightly faster than they scored, so their NRR is slightly negative. A team that won both matches by small margins could still have a better NRR than a team that won once by a huge margin and lost once heavily. That is by design.` },
      { h2: "The all-out rule", md: `If a team is bowled out before using its overs, the calculation does not use the overs it actually faced. It uses the full quota of overs. A team all out for 90 in 14 overs in a 20-over match is treated as having scored 90 in 20 overs, which is a run rate of 4.5.

This stops a team from improving its rate by being dismissed quickly. For the bowling side, the conceded runs are also divided by the full 20 overs.

State this rule in your tournament rules even if your league is casual. It is the question captains ask first.` },
      { h2: "Matches with no result and rain", md: `A match with no result is normally left out of the NRR calculation altogether, and each team gets the shared point. For a rain-shortened match, the organisers should decide before the tournament which method applies: a published method such as DLS, or a simpler house rule such as a fixed minimum number of overs for a result.

For local leagues, a fixed rule is easier to explain: for example, a match needs at least 5 overs per side to count, and if fewer are played it is replayed or shared.` },
      { h2: "Putting NRR into your points table", md: `A typical league table has these columns: matches played, won, lost, tied or no result, points, and NRR. Sort by points first, then by NRR when points are level.

You can build the table by hand in a spreadsheet, or use the [round robin generator](/tools/round-robin/) for the fixtures and keep the results in one sheet. The guide to the [cricket league points table](/guides/cricket-league-points-table/) shows the columns and a common points scheme.

> Publish the tie-break order (points, then NRR, then head-to-head, then a coin toss) in the rules before the first match.` },
      { h2: "Common mistakes", md: `- Averaging each match's NRR instead of adding up totals first.
- Forgetting that an all-out team is counted for its full overs.
- Using the wrong overs when a match is reduced by rain.
- Mixing T20 and longer matches in one table without saying so.
- Deciding the tie-break after the league ends.` },
    ],
    faq: [
      { q: "Is a higher net run rate always better?", a: "Yes. A higher NRR means a team scores faster than it concedes. A positive number means it scored faster than its opponents on average, and a negative number means the opposite. It only matters for ranking when teams are level on points, because points always come first in a league table." },
      { q: "How is NRR calculated if a team is all out early?", a: "The team is treated as having faced its full quota of overs. A side all out for 90 in 14 overs of a 20-over match is counted as 90 runs in 20 overs. This keeps a team from lifting its run rate by being dismissed quickly, and it applies to the opposition's conceded rate as well." },
      { q: "Can I use NRR in a local tournament with different match lengths?", a: "You can, but only if every match uses the same number of overs, or if you calculate from total runs and total overs rather than per match. Mixed lengths in one table cause confusion, so decide the match length in the rules and keep it the same for the whole league." },
    ],
    related: ["cricket-league-points-table", "round-robin-schedule", "fixture-maker-for-football-and-cricket"],
    cta: { label: "Generate the league fixtures", href: "/tools/round-robin/" },
  },

  {
    slug: "double-elimination-bracket-explained",
    title: "Double elimination bracket explained: winners, losers and the final",
    seoTitle: "Double elimination bracket explained",
    description: "How a double elimination bracket works: the winners and losers brackets, how many matches you need, the grand final reset and when it beats single elimination.",
    tag: "Format guide",
    answer: "In double elimination a team is out only after its second loss. The winners bracket carries unbeaten teams, the losers bracket carries teams with one loss, and the two winners meet in the grand final. It needs about twice the matches of single elimination but is far fairer.",
    intro: "A single-elimination bracket is quick and cruel: a team that has one bad match goes home. Double elimination gives every team a second life, which is why it is the standard format for most fighting game and many esports events. It is also easy to get wrong when you draw it by hand.",
    sections: [
      { h2: "How the two brackets work", md: `Every team starts in the winners bracket. When it wins, it stays there and moves up. When it loses once, it drops into the losers bracket. In the losers bracket, one more loss is the end.

The winners bracket is a normal single-elimination bracket. The losers bracket collects the losers from each winners round, and its own rounds knock out more teams. At the end, the winners bracket champion (no losses or one loss, never two) meets the losers bracket champion in the grand final.` },
      { h2: "How many matches you need", md: `For a field that is a power of two, double elimination needs 2 times the number of teams, minus 2 matches, or one more if the grand final is reset.

| Teams | Single elimination | Double elimination (no reset) | With a reset |
|---|---|---|---|
| 4 | 3 | 6 | 7 |
| 8 | 7 | 14 | 15 |
| 16 | 15 | 30 | 31 |
| 32 | 31 | 62 | 63 |

Double elimination takes about twice as long. If you have 16 teams and a venue for one afternoon, check the schedule honestly before you pick it. The [match schedule maker](/tools/schedule/) shows how long the rounds take on the number of screens or courts you have.` },
      { h2: "The grand final and the bracket reset", md: `The grand final has a built-in unfairness. The team from the winners bracket has not lost yet, and the team from the losers bracket has lost once. If the losers bracket team wins the grand final, both teams now have one loss.

Fairness says they should play again. This extra match is the bracket reset. Most large events use it: if the team from the winners bracket wins the first grand final match, the event is over. If the losers bracket team wins, a second match decides the title.

Some small events skip the reset to save time. Either choice is fine, but write it in the rules before the event and tell the finalists.` },
      { h2: "Drawing it without mistakes", md: `Use a bracket generator. The [double elimination tool](/tools/double-elimination/) draws both brackets and the final for you. If you must draw by hand:

1. Seed the teams, with the best seed first. Our guide on [seeding a bracket](/guides/tournament-bracket-template/) shows the standard order.
2. Draw the winners bracket completely first.
3. Draw the losers bracket in rounds. Each losers round has two stages: the losers from the winners bracket drop in, and the losers bracket survivors play each other.
4. Cross the drop-ins so a team does not meet the same opponent again right away.
5. Add the grand final, and a second match if you use a reset.

Number every match on the sheet. Printed match numbers save a lot of questions on the day.` },
      { h2: "When double elimination is the right format", md: `- One-versus-one games and small teams where a single bad round should not decide everything.
- An event with 8 to 32 teams and enough time for roughly twice the matches of a knockout.
- A tournament where players travelled or paid an entry fee and expect to play more than one match.

It is the wrong choice when the schedule is tight, when you have a very large field (use groups and a knockout, or a [Swiss system](/guides/swiss-system-tournament-explained/)), or when matches are long and expensive to run.` },
      { h2: "Common mistakes", md: `- Dropping losers into the losers bracket in the same order every round, so two teams meet again straight away.
- Not telling players how the reset works until the final.
- Forgetting that the losers bracket needs its own schedule and referees at the same time as the winners bracket.
- Drawing the bracket after registration closed with a wrong number of teams. Fill empty slots with byes for the top seeds.` },
    ],
    faq: [
      { q: "How many matches are in a double elimination bracket?", a: "For a power-of-two field it is two times the number of teams, minus two, plus one more if the grand final is reset. That is 14 matches for 8 teams and 30 for 16 teams, or one more with a reset. It is almost twice a single-elimination bracket, so check your schedule first." },
      { q: "What is a bracket reset in double elimination?", a: "It is an extra grand final match played when the team from the losers bracket beats the team from the winners bracket in the first one. Both teams then have one loss, so a second match decides the winner. Some small events skip it to save time; say which you use in the rules." },
      { q: "Can double elimination work with a number of teams that is not a power of two?", a: "Yes. Round up to the next power of two and give the top seeds byes in the first round. For example, 11 teams are drawn in a 16-team bracket with 5 byes. A bracket generator handles this automatically and puts the byes with the highest seeds." },
    ],
    related: ["choosing-a-tournament-format", "tournament-bracket-template", "round-robin-schedule"],
    cta: { label: "Draw a double elimination bracket", href: "/tools/double-elimination/" },
  },

  {
    slug: "football-tournament-poster-ideas",
    title: "Football tournament poster: what to put on it and how to design it",
    seoTitle: "Football tournament poster ideas and checklist",
    description: "What a football tournament poster needs: the details players look for, layout ideas, sizes for print and WhatsApp, and common mistakes, with a free poster maker.",
    tag: "Poster guide",
    answer: "A good football tournament poster answers five questions in two seconds: what the event is, when and where, who can play, what it costs and the prize, and how to register. Put those in a clear order, use one strong image, and add a QR code for registration.",
    intro: "Teams decide whether to enter a tournament in a few seconds, usually while scrolling a phone. A poster that hides the date or the entry fee loses teams before they ask. This guide covers what to include, how to lay it out, and the sizes you need for print and for sharing.",
    sections: [
      { h2: "The details every poster needs", md: `Players and captains look for the same information, so put it where they expect it:

- The name of the tournament and the sport (football, 5-a-side or 7-a-side).
- Date and time, with the day of the week. Include the reporting time if it is earlier than kick-off.
- The venue name and the area, so people can find it on a map.
- Who can enter: age group, college or open, boys, girls or mixed.
- Team size and squad limit.
- Entry fee per team, if there is one, and the prize for the winner and runner-up.
- How to register, and the last date to register.
- A contact number or a handle for questions.

If the poster is for a college fest, add the college name and the fest name. For a sponsor, a row of logos at the bottom is enough.` },
      { h2: "Layout that works", md: `Keep a clear order from top to bottom:

1. Tournament name in the largest text.
2. One strong image: a ball, a pitch, or a group photo. Do not use five images.
3. Date, time and venue in the second largest text.
4. Entry fee and prize, so the decision is easy.
5. Registration details with a QR code and the last date.
6. Sponsor logos and the organiser at the bottom.

Use two colours and one font family. High contrast matters more than style: dark text on a light photo area, or white text on a dark overlay. Check that the date can be read from an arm's length on a phone screen.` },
      { h2: "Sizes for print and for sharing", md: `Make one design and export it for each place you will use it.

| Where | Shape | Notes |
|---|---|---|
| WhatsApp status and Instagram story | 9:16, tall | Keep text away from the top and bottom edges |
| Instagram feed and WhatsApp share | Square or 4:5 | Most shared format |
| Notice board | A4 or A3 | Print at full size and test the QR code |
| Banner | Wide | Fewer words, larger type |

The [tournament poster maker](/tools/poster/) exports the common sizes from one design. For other sports and more ideas, see the guide to [cricket tournament posters](/guides/cricket-tournament-poster-ideas/), which uses the same structure.` },
      { h2: "Add a registration QR code", md: `A QR code takes a captain from the poster to your registration form in one scan. Point it at a form or a registration page, not at a chat link that you will have to change. Test it with two different phones before you print.

If you do not have a form yet, the [registration form tool](/tools/registration/) builds one and gives you a link you can turn into a QR code. Write the link in small text under the code as a backup.` },
      { h2: "Wording tips", md: `- Say "5-a-side football tournament", not just "tournament". The sport and format are what people search for.
- Write the prize in plain numbers, and only promise what you have collected or secured.
- Write "Last date to register" with the real date, not "soon".
- Put a contact name as well as a number, so people know who they are calling.
- Proofread the date and the day of the week together. A wrong weekday is the most common poster error.` },
      { h2: "Common mistakes", md: `- Too many images and fonts, so nothing stands out.
- No registration route, only a phone number.
- A date without a time, or a venue without an area.
- A low-resolution image that looks blurred when printed.
- Sharing the print file on WhatsApp, which compresses it. Share an image made for screens.` },
    ],
    faq: [
      { q: "What size should a football tournament poster be?", a: "Make one design and export several sizes: a tall 9:16 version for stories and WhatsApp status, a square or 4:5 version for feeds, and an A4 or A3 version for notice boards. Keep important text away from the edges, because phones and printers crop differently, and test the QR code at the final size." },
      { q: "What should a football tournament poster say?", a: "It should say the name of the event, the date and time, the venue, who can enter, the team size, the entry fee and prize, how to register and the last date to register, and a contact. If any of these is missing, teams will message to ask, and many will not bother." },
      { q: "Can I make a football poster for free?", a: "Yes. The tournament poster maker on this site is free and works in your browser, so you can fill in your details, pick a design and export the sizes you need. It does not need an account. Check the final image on a phone before you share it widely." },
    ],
    related: ["cricket-tournament-poster-ideas", "free-fire-tournament-poster", "college-fest-esports-poster"],
    cta: { label: "Make your football tournament poster", href: "/tools/poster/" },
  },

  {
    slug: "how-to-seed-a-tournament-bracket",
    title: "How to seed a tournament bracket fairly",
    seoTitle: "How to seed a tournament bracket",
    description: "How to seed a tournament bracket: ranking the teams, the standard seed order, byes, random draws and how to keep the best teams apart until the late rounds.",
    tag: "Format guide",
    answer: "Seeding ranks the teams before the draw and places them in the bracket so the best teams cannot meet early. The top two seeds sit at opposite ends, the next two in opposite quarters, and so on. If you have no ranking, draw at random and say so in the rules.",
    intro: "A bracket is only as fair as its draw. If the two strongest teams meet in round one, one of them goes home early and the final is dull. Seeding fixes this. It is not hard, but you need a rule for ranking the teams and a standard order for placing them.",
    sections: [
      { h2: "Why seed at all", md: `Seeding protects the quality of the later rounds. In an unseeded random draw, the two best teams can meet in round one by chance. With seeding, they can only meet in the final, and the next-best teams can only meet in the semi-finals.

It also rewards the teams that earned a good rank. A team that did well in last season's league, or in a qualifier, should get an easier path than a team that just registered.` },
      { h2: "How to rank the teams", md: `Choose a method that you can explain in a sentence:

- Results from a previous event or a league table, if you have one.
- A qualifier or group stage, then seed the bracket from the group results.
- A published rating, such as a chess rating or a ladder rank, if the game has one.
- A fixed order decided by a neutral person, such as the head of the sports club, before the draw.
- No ranking at all: draw the order at random and show the draw to the captains.

Publish the method before registration closes. Never rank teams after seeing which ones are in which half.` },
      { h2: "The standard seed order", md: `The classic order puts the best seed against the worst in round one, and keeps the best seeds apart. For an 8-team bracket the first-round matches are:

| Match | Seeds |
|---|---|
| 1 | 1 vs 8 |
| 2 | 4 vs 5 |
| 3 | 2 vs 7 |
| 4 | 3 vs 6 |

Match 1 and match 2 feed the same semi-final, so seed 1 meets the winner of 4 vs 5 there, and seed 2 sits on the other side. The tools on this site use this order, so seeds 1 and 2 can only meet in the final. For 16 teams, the same pattern repeats: 1 vs 16, 8 vs 9, 4 vs 13, 5 vs 12, and so on.

The [bracket maker](/tools/brackets/) places seeds in this order for any team count, so you only need to enter the teams in rank order.` },
      { h2: "Byes and uneven fields", md: `If the number of teams is not a power of two (4, 8, 16, 32), round up and fill the gaps with byes. A bye is a free pass to the next round, and the highest seeds get them. With 11 teams in a 16-team bracket there are 5 byes, and seeds 1 to 5 skip round one.

This is not a hidden advantage. It is the reward for a high seed. Tell the teams how byes are given, and publish the bracket before the first match.

If you would rather not use byes, run a short first round to get down to a power of two: with 11 teams, play 3 matches between the six lowest seeds, and the three winners join the other five teams in a field of 8.` },
      { h2: "Random draws that people trust", md: `A random draw is fair, but it also has to look fair. Draw in front of the captains, in a video call or in the room, and keep the method simple: write the team names on paper, fold them, and pull them one at a time into bracket slots.

You can also draw with a tool and share a screenshot. Do not redraw because you do not like a pairing. If you promise a random draw and then change it, the event loses trust.` },
      { h2: "Common mistakes", md: `- Seeding after the draw, so people suspect favouritism.
- Putting teams from the same college or club into the same half when you could split them.
- Forgetting to give byes to the top seeds instead of random teams.
- Re-drawing after an unlucky pairing.
- Not publishing the bracket until the morning of the event.` },
    ],
    faq: [
      { q: "What is the standard seeding order for an 8-team bracket?", a: "The first-round matches are 1 vs 8, 4 vs 5, 2 vs 7 and 3 vs 6, arranged so that seeds 1 and 2 are in opposite halves and can only meet in the final. Seeds 1 and 4 can meet in the semi-final, and 2 and 3 in the other. The bracket maker on this site applies this order automatically." },
      { q: "Who gets byes in a bracket?", a: "The highest seeds get byes. With 11 teams in a 16-team bracket there are 5 byes, and seeds 1 to 5 skip round one. Byes are the reward for a high rank and should be explained in the rules. If you use a random draw with no seeds, draw the byes openly like any other slot." },
      { q: "Should I seed or draw at random?", a: "Seed when you have a fair way to rank teams, such as a previous league or a qualifier, because it keeps the best teams apart and makes the later rounds better. Draw at random when you have no ranking, and do the draw in front of the captains. Either is fine if the rule is published first." },
    ],
    related: ["tournament-bracket-template", "choosing-a-tournament-format", "swiss-system-tournament-explained"],
    cta: { label: "Build a seeded bracket", href: "/tools/brackets/" },
  },

  {
    slug: "football-points-system-and-tiebreakers",
    title: "Football tournament points system and tie-breakers",
    seoTitle: "Football points system and tie-breakers",
    description: "The standard football points system, how to rank teams level on points, goal difference and head-to-head order, and a ready tie-break rule for your tournament.",
    tag: "Sport guide",
    answer: "Football leagues give 3 points for a win, 1 for a draw and 0 for a defeat. When teams finish level, rank them by an order you publish in advance: usually goal difference, then goals scored, then the result between the tied teams, then a draw of lots or a shoot-out.",
    intro: "The points are the easy part. The tie-break is where local tournaments argue. Three teams finish on 7 points, two of them have the same goal difference, and the captains want to know who goes through. Decide the order before the first kick-off and the argument never starts.",
    sections: [
      { h2: "The standard points", md: `${F.football.text}

A win giving 3 points instead of 2 rewards teams that go for the win rather than the draw. It is used by most leagues and group stages, and players already know it, so you do not have to explain it.

Some local events use 2 points for a win and 1 for a draw. That is also acceptable, as long as you say so in the rules. Just keep one scheme for the whole tournament.` },
      { h2: "A league table in columns", md: `A group table has the same columns in every league:

| Column | Meaning |
|---|---|
| P | Matches played |
| W, D, L | Wins, draws and losses |
| GF, GA | Goals for and goals against |
| GD | Goal difference: GF minus GA |
| Pts | Points: 3 per win and 1 per draw |

Sort by points first. Anyone level on points is then ranked by your tie-break order, not by who has played more matches.` },
      { h2: "A tie-break order you can copy", md: `Write this order into your rules, then apply it in sequence until the tie is broken:

1. Points.
2. Goal difference across all group matches.
3. Goals scored across all group matches.
4. Result of the match between the tied teams (if only two are tied).
5. A mini-table of only the matches between the tied teams (if three or more are tied).
6. Fewer disciplinary points (cards).
7. A penalty shoot-out or a draw of lots, in front of the captains.

Some competitions put the head-to-head result before goal difference. Both orders exist. Pick one, publish it, and use it for every group.` },
      { h2: "A worked example with a three-way tie", md: `Teams A, B and C all finish on 6 points in a group of four.

| Team | W | D | L | GF | GA | GD |
|---|---|---|---|---|---|---|
| A | 2 | 0 | 1 | 5 | 3 | +2 |
| B | 2 | 0 | 1 | 4 | 3 | +1 |
| C | 2 | 0 | 1 | 4 | 4 | 0 |

Level on points, so look at goal difference: A has +2, B +1, C 0. A is first, B second, C third. No head-to-head is needed.

If A and B both had +1, you would check goals scored next, and then the head-to-head result. Writing the steps in order makes the table checkable by anyone.` },
      { h2: "Group stage to knockout", md: `If the group winners go into a knockout stage, decide how the draw works. A common choice is that the winner of each group plays the runner-up of another group, so teams from the same group cannot meet again in the first knockout round.

The [groups and knockout maker](/tools/groups/) sets up the groups, the table and the knockout stage. For the fixtures within each group, the [round robin generator](/tools/round-robin/) writes them in rounds.` },
      { h2: "Common mistakes", md: `- Choosing the tie-break order after the tie happens.
- Counting goal difference only from matches between the tied teams when your rule says all matches.
- Not saying what happens to a team that forfeits. A common rule is a 3-0 loss and no points.
- Forgetting a final tie-break, so a perfect tie ends in an argument.
- Using different points schemes in different groups.` },
    ],
    faq: [
      { q: "How many points is a win in football?", a: "Three points for a win, one for a draw and none for a defeat is the standard in most leagues and group stages. Some local tournaments use two for a win instead. Either works if it is written in the rules before the first match and used in every group of the tournament." },
      { q: "What happens if teams are level on points in a group?", a: "Apply your published tie-break order in sequence, usually goal difference, then goals scored, then the result between the tied teams, then a draw of lots or a shoot-out. Stop as soon as the tie is broken. Decide and publish the order before the first match, never after the tie appears." },
      { q: "Is head-to-head or goal difference first?", a: "Both orders are used. Many competitions check goal difference first, and some check the head-to-head result first. Pick one, put it in the rules, and use it everywhere. What matters is that every captain can read the order before the first match, not which order you choose." },
    ],
    related: ["cricket-league-points-table", "round-robin-schedule", "football-cricket-tournament-maker"],
    cta: { label: "Set up groups and a knockout", href: "/tools/groups/" },
  },

  {
    slug: "round-robin-single-double-and-tiebreaks",
    title: "Round robin tournament: single, double and how to break ties",
    seoTitle: "Round robin tournament: single, double, ties",
    description: "How a round robin tournament works: single and double round robin, the match count formula, how to schedule rounds, and how to rank teams level on points.",
    tag: "Format guide",
    answer: "In a round robin every team plays every other team. A single round robin has n times n minus 1, divided by 2 matches; a double round robin has twice that. It is the fairest format for small fields, and a published tie-break order settles teams that finish level.",
    intro: "Round robin is the format people trust, because luck matters little: if you play everyone, the best team usually finishes first. It has one weakness. The number of matches grows quickly, so it only works for small fields. This guide covers how to size it, schedule it and break ties.",
    sections: [
      { h2: "Single and double round robin", md: `In a single round robin, each pair of teams meets once. In a double round robin, each pair meets twice, often once at each team's home venue or with sides swapped. The double version is fairer because it cancels out the advantage of a good draw, and it is common for league seasons.

Use a single round robin for a one-day or weekend event. Use a double round robin for a league that runs over several weeks.` },
      { h2: "How many matches", md: `For n teams, a single round robin has n times (n minus 1), divided by 2 matches. A double round robin has twice that.

| Teams | Single | Double | Rounds (single) |
|---|---|---|---|
| 4 | 6 | 12 | 3 |
| 6 | 15 | 30 | 5 |
| 8 | 28 | 56 | 7 |
| 10 | 45 | 90 | 9 |
| 12 | 66 | 132 | 11 |

Each round has n divided by 2 matches when n is even. Above 8 or 10 teams, the numbers grow fast. If you have more teams than a day allows, split them into groups and run a round robin inside each group, then take the best into a knockout. The [groups and knockout maker](/tools/groups/) does exactly this.` },
      { h2: "Scheduling the rounds", md: `The standard method is the circle method. Put the teams in two rows, keep one team fixed, and rotate the others one place each round. Every team plays once per round, and no pair meets twice.

You do not need to do it by hand. The [round robin generator](/tools/round-robin/) writes every round for any team count and handles an odd number of teams by giving one team a rest each round.

Print the schedule and show it to all captains before the first match. Mark which court, pitch or room each match is on, and the time. The [schedule maker](/tools/schedule/) turns the fixtures into a timetable.` },
      { h2: "Odd numbers of teams", md: `With an odd number, one team is idle each round, which is called a bye. A 5-team single round robin has 5 rounds of 2 matches, and every team rests once.

Make sure the rest rounds are spread out, so no team waits through the whole afternoon. If your match times are fixed, the team with the first-round bye has the freshest start. That is a small advantage, so draw the order of byes openly.` },
      { h2: "Breaking ties", md: `With a full round robin, ties on points are common, especially in games with draws. Publish the order before round 1:

1. Points.
2. The result between the tied teams, or a mini-table if three or more are tied.
3. Score difference across all matches (goals, rounds, runs or points, depending on the game).
4. Scores for, across all matches.
5. A play-off match or a draw of lots.

For cricket, net run rate takes the place of score difference; the guide to [net run rate](/guides/cricket-net-run-rate-explained/) shows the calculation. For football, see [points and tie-breakers](/guides/football-points-system-and-tiebreakers/).` },
      { h2: "Common mistakes", md: `- Using a round robin for 12 or more teams in a single day.
- Not publishing the tie-break order, so the last match day turns into an argument.
- Letting a team skip its rest round, which changes the fixtures for everyone else.
- Playing the last round at different times, so teams know exactly what result they need. Where you can, play the final round's matches at the same time.` },
    ],
    faq: [
      { q: "How many matches are in a round robin tournament?", a: "A single round robin with n teams has n times n minus 1, divided by 2 matches: 6 for 4 teams, 15 for 6 and 28 for 8. A double round robin has twice as many. The count grows quickly, so above 8 to 10 teams most events switch to groups and a knockout stage." },
      { q: "What is the difference between single and double round robin?", a: "In a single round robin each pair of teams meets once. In a double round robin they meet twice, usually with home and away sides swapped or sides changed. Double is fairer and suits leagues that run over several weeks, while single suits one-day and weekend tournaments with limited time." },
      { q: "How do you schedule a round robin with an odd number of teams?", a: "One team rests in each round, called a bye. A 5-team event has 5 rounds with 2 matches each, and every team rests once. A generator handles this for you. Spread the rest rounds so no team waits all afternoon, and show the full schedule to the captains before play starts." },
    ],
    related: ["round-robin-schedule", "choosing-a-tournament-format", "swiss-system-tournament-explained"],
    cta: { label: "Generate a round robin schedule", href: "/tools/round-robin/" },
  },

  {
    slug: "chess-tournament-rules-for-organisers",
    title: "Chess tournament rules for organisers: a simple rulebook",
    seoTitle: "Chess tournament rules for organisers",
    description: "The chess tournament rules an organiser needs: scoring, time controls, touch-move, late arrivals, draws, disputes and a one-page rulebook you can copy.",
    tag: "Sport guide",
    answer: "A chess tournament needs a short rulebook covering scoring, the time control, touch-move, late arrivals, draw offers, how disputes are settled and who the arbiter is. Base it on the FIDE Laws of Chess and add your own local rules in writing before round 1.",
    intro: "Chess disputes are small but sharp: a player touched a piece, a clock was not pressed, a draw was offered at the wrong moment. Most can be settled by one calm adult with a written rule. This guide gives you the rules to write down and the decisions to make before the first round.",
    sections: [
      { h2: "Start from the official laws", md: `The international rules are the FIDE Laws of Chess. You do not have to write your own: say that the tournament follows the FIDE Laws, except where your rulebook says otherwise. That settles most arguments, because the answer is already written.

Then add a one-page set of local rules for the things the Laws leave to the organiser: the time control, the tie-breaks, the late-arrival rule, the use of phones, and who the arbiter is.` },
      { h2: "Scoring", md: `${F.chess.text} Every tournament format uses these points: a Swiss event, a round robin or a knockout of short matches.

If you run a school or club event with many players, a [Swiss system](/guides/swiss-system-tournament-explained/) lets everyone play every round. For 6 to 8 players, a single [round robin](/guides/round-robin-single-double-and-tiebreaks/) is simple and fair.` },
      { h2: "Time control", md: `Choose one time control and use it for every game. State it in the rules and on the pairing sheet.

- Rapid events give each player a longer time for the whole game, often between 10 and 25 minutes.
- Blitz gives each player a few minutes for the whole game.
- For beginners and schools, rapid is easier to supervise.

Use a chess clock for every board if you can. If you must run without clocks, say so, and give an arbiter the right to adjourn a game that is dragging on.` },
      { h2: "The rules players ask about most", md: `Put your decision on each of these in the rulebook:

- Touch-move: a player who touches a piece with the intention of moving it must move that piece, if it can legally move.
- A move is completed when the hand leaves the piece. Do not allow take-backs.
- Draw offers: a player offers a draw after making a move and before pressing the clock. An offer cannot be withdrawn once it is made.
- Late arrival: a common rule is that a player who arrives more than 15 to 30 minutes after the round starts loses the game. Choose a number and write it down.
- Phones: switched off and in a bag. A ringing phone is a loss of the game under many rulebooks; decide your own penalty.
- Spectators: silent, and no advice to players during a game.` },
      { h2: "Disputes and the arbiter", md: `Name one arbiter, and tell players that only the arbiter settles disputes. Players stop the clock and call the arbiter, and the arbiter decides, based on the rulebook.

Give players a short window to appeal to a second person, such as the head organiser. Set a time limit, for example 10 minutes after the game ends. Late appeals are not heard.

If you cannot find a qualified arbiter, ask a strong player who is not taking part in the event, such as a coach or a teacher.` },
      { h2: "Common mistakes", md: `- Starting round 1 without a written time control, so players assume different ones.
- Having no named arbiter, which leaves every dispute to the organiser who is also running the pairings.
- Allowing take-backs "just this once". It becomes the rule for the whole event.
- Choosing the late-arrival limit after a player is late.
- Forgetting a tie-break, so a tie for first place ends in an argument.` },
      { h2: "A one-page rulebook you can copy", md: `1. The tournament follows the FIDE Laws of Chess unless this page says otherwise.
2. Format: [Swiss or round robin], [number] rounds.
3. Time control: [time] per player for the whole game.
4. Scoring: win 1, draw half, loss 0.
5. Tie-breaks in order: [Buchholz, head-to-head, number of wins].
6. A player more than [minutes] late for a round loses the game.
7. Phones are switched off and kept in bags.
8. The arbiter's decision is final; appeals go to [name] within 10 minutes.

You can fill in the brackets and print this on the [registration page](/tools/registration/) or the notice board.` },
    ],
    faq: [
      { q: "What are the basic rules of a chess tournament?", a: "The tournament follows the FIDE Laws of Chess, with a win scoring 1 point, a draw half a point and a loss none. The organiser adds local rules for the time control, tie-breaks, late arrivals, phones and who settles disputes. Write them on one page and share it before the first round." },
      { q: "What time control should a school chess tournament use?", a: "Rapid is the easiest to supervise for schools: a single time for the whole game, for example 15 to 25 minutes per player. It keeps every round to under an hour and avoids very long games. Use a clock on every board if possible, and say so on the pairing sheet." },
      { q: "How late can a player be for a chess round?", a: "There is no single rule, so the organiser chooses it. Many events use a limit of 15 to 30 minutes after the round starts, after which the player loses the game. Pick a number that fits your schedule, write it in the rules and apply it to every player the same way." },
    ],
    related: ["swiss-system-tournament-explained", "esports-tournament-rules-template", "round-robin-single-double-and-tiebreaks"],
    cta: { label: "Build the registration page", href: "/tools/registration/" },
  },

  {
    slug: "clash-royale-tournament-how-to-run",
    title: "How to run a Clash Royale tournament with a bracket",
    seoTitle: "How to run a Clash Royale tournament",
    description: "How to organise a Clash Royale tournament: one-versus-one brackets, best-of series, how to prove results, rules for friendly battles and a simple schedule.",
    tag: "Game guide",
    answer: "A Clash Royale tournament is a one-versus-one bracket. Players play friendly battles against each other, send a screenshot of the result, and the winner moves on. Use single or double elimination, best of three for later rounds, and written rules for reconnects and proof.",
    intro: "Clash Royale is one of the easiest games to turn into a tournament: no teams, no lobby codes and matches that take a few minutes. The hard part is trust. You need a way to prove who won, and a rule for the match that disconnects halfway. This guide covers both.",
    sections: [
      { h2: "Pick the format", md: `Matches are one against one, so a bracket is the natural format. For a field of 8 to 32 players:

- Single elimination is fastest, but one bad match ends a player's day.
- Double elimination gives a second chance and is better when players have joined for fun and a prize. See [double elimination explained](/guides/double-elimination-bracket-explained/).
- For 40 or more players, run groups of 4, then take the best into a bracket, using the [groups and knockout maker](/tools/groups/).

Use best of one in the early rounds to move quickly, and best of three from the quarter-finals. Say how series are scored in the rules, and when the winner is the first to reach two wins.` },
      { h2: "How players play each other", md: `Clash Royale lets two players battle each other as friends, without affecting their trophies. Each player sends a friend request, or you share a clan link for the event, and the pair arranges a friendly battle at the time on the schedule.

Rules and menus change with each game update, so do not copy steps from an old guide. Check the game's current screens before the event, and test the whole process with two phones the day before.

Run the bracket in a group chat so players can find their opponents. Post the bracket with the player names, the in-game names and the match times.` },
      { h2: "Proof of result", md: `Because matches happen on phones, you need evidence. Ask both players to send a screenshot of the end screen to the organiser or to the match thread. The screenshot should show both player names and the result.

If the two players report different results, ask for the full battle replay or a repeat of the match, played in front of a referee on a call. Say in the rules that a player who refuses to send proof forfeits.

Do not accept a result that only one player reports with no screenshot. It takes two minutes to ask and saves an argument in the semi-final.` },
      { h2: "Fair play settings", md: `Decide the rules that affect fairness before the event:

- Which deck rules apply: open decks, or a set of banned cards. If you ban cards, publish the list before registration.
- Whether players may change their deck between games in a series. A common rule is that they may not.
- How to handle a connection problem: a player who disconnects early may get one replay, and a player who disconnects twice loses.
- A time limit for each match: if a player does not show up within 15 minutes of the scheduled time, they lose by forfeit.

The [tournament rules template](/guides/esports-tournament-rules-template/) has standard wording for late and absent players.` },
      { h2: "Schedule and results", md: `With a bracket and a group chat, a 16-player event can finish in an evening. Give each round a window, for example 30 minutes, and post the next round the moment all results are in.

Here is a plan for 16 players that fits an evening:

| Round | Matches | Series | Window |
|---|---|---|---|
| Round of 16 | 8 | Best of 1 | 30 minutes |
| Quarter-finals | 4 | Best of 3 | 40 minutes |
| Semi-finals | 2 | Best of 3 | 40 minutes |
| Final | 1 | Best of 5 | Livestream or voice call |

Put the results on a [display screen](/tools/display-screen/) or share a screenshot of the bracket after each round. Winners can receive a [certificate](/tools/certificates/) at the end.` },
      { h2: "Common mistakes", md: `- Starting without a rule for disconnects.
- Accepting a result with no screenshot.
- Copying menu steps from a guide for an older version of the game.
- Letting players agree their own match times with no deadline, so the bracket stalls.
- Not publishing the bracket where everyone can see it.` },
    ],
    faq: [
      { q: "How do you run a Clash Royale tournament?", a: "Set up a one-versus-one bracket, have each pair play a friendly battle at its scheduled time, and ask both players to send a screenshot of the result. Use best of one early and best of three later. Write rules for disconnects, no-shows and card bans before registration opens." },
      { q: "How do you prove who won a Clash Royale match?", a: "Ask both players to send a screenshot of the end screen showing both names and the result. If their reports differ, ask for a replay or have the pair play again on a call with a referee watching. A player who refuses to send proof forfeits, and the rules should say so." },
      { q: "What format works for a Clash Royale tournament with 16 players?", a: "A single-elimination bracket needs 15 matches and finishes quickly. Double elimination needs about 30 and gives players a second life, which many prefer for a prize event. Either way, use best of one for early rounds and best of three from the quarter-finals on." },
    ],
    related: ["tournament-bracket-template", "choosing-a-tournament-format", "swiss-system-tournament-explained"],
    cta: { label: "Make your Clash Royale bracket", href: "/tools/brackets/" },
  },
];
