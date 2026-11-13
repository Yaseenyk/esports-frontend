import type { Draft } from "./types";

/** Posts 50 to 59. */
export const BATCH_06: Draft[] = [
  {
    slug: "gsl-style-dual-tournament-format-explained",
    title: "GSL-style dual tournament format: four-player groups that need five matches",
    seoTitle: "GSL-style dual tournament format explained",
    description: "How the GSL-style dual tournament works: a four-player double elimination group, five matches, two qualifiers, a worked example and when to use it for your event.",
    tag: "Format guide",
    answer: "A GSL-style dual tournament is a four-player double elimination group. Two opening matches feed a winners' match and a losers' match, then a decider. It takes exactly five matches, sends two players through, and gives everyone a second chance.",
    intro: "Run a group stage with four players and a plain round robin, and you play six matches, with some meaningless. The dual tournament format fixes this. It is a miniature double elimination bracket, built for exactly four players and two qualifiers. It is popular in one-versus-one games for good reason.",
    sections: [
      { h2: "How a group works", md: `Four players, called A, B, C and D, start in two opening matches. Everyone then has at least two matches, and the group finishes after five matches in total.

1. Match 1: A plays B. Match 2: C plays D.
2. The two winners meet in the winners' match. The winner qualifies.
3. The two losers meet in the losers' match. The loser is eliminated.
4. The loser of the winners' match plays the winner of the losers' match in the decider. The winner of the decider qualifies. The loser is eliminated.

Two players qualify and two go out, and nobody is out after a single loss.` },
      { h2: "A worked example", md: `Players A to D play a group.

| Match | Pairing | Result |
|---|---|---|
| 1 | A vs B | A wins |
| 2 | C vs D | D wins |
| 3, winners' match | A vs D | D wins, qualifies |
| 4, losers' match | B vs C | B wins |
| 5, decider | A vs B | A wins, qualifies |

D and A qualify. C went out after losing twice, to D and B. B lost to A twice. A lost once and still qualified, which is the point of the format.` },
      { h2: "Why use it instead of a round robin", md: `A round robin of four players is six matches, and the last matches may not matter, or may be decided by a tie-break. The dual tournament has five matches, and every match matters.

It also avoids ties completely, since each result is a win or a loss, and the final qualification is decided by a match, not a table. This is why it suits games with no draws. A [round robin](/guides/round-robin-single-double-and-tiebreaks/) is fairer when draws are possible and tie-breaks are accepted.` },
      { h2: "Scaling up to a bigger event", md: `The group is the building block. For 16 players, make 4 groups of 4. That is 20 group matches, and 8 players qualify, who then enter a knockout.

| Players | Groups | Group matches | Qualifiers | Knockout |
|---|---|---|---|---|
| 8 | 2 | 10 | 4 | Semi-finals and final: 3 matches |
| 16 | 4 | 20 | 8 | Quarter-finals onward: 7 matches |
| 32 | 8 | 40 | 16 | Round of 16 onward: 15 matches |

Run groups at the same time if you have enough screens. See [group stage plus knockout](/guides/group-stage-and-knockout-planning/) for the cross-over rule: a group winner meets another group's runner-up.` },
      { h2: "Series length and scheduling", md: `Use best of 3 for each group match if you have the time, and best of 1 for a quick event. Plan for the longest case. Groups with the winners' and losers' matches played at the same time save time: matches 1 and 2 run together, and so do matches 3 and 4.

The decider cannot start until matches 3 and 4 finish. The [schedule maker](/tools/schedule/) can plan it, and the [series length guide](/guides/best-of-1-3-5-series-length-explained/) helps with timing.` },
      { h2: "Seeding the groups", md: `Seed the players so the best are in different groups, using pots as in [how to run a fair draw](/guides/how-to-draw-a-fair-tournament-draw/). Inside a group, A and B and C and D in the opening matches should pair a higher seed with a lower seed. Seed 1 plays seed 4, and seed 2 plays seed 3, so the top two meet only in the winners' match.

The [groups and knockout maker](/tools/groups/) can draw the groups, and the [bracket maker](/tools/brackets/) draws the knockout stage.` },
      { h2: "Common mistakes", md: `- Using it with fewer or more than four players per group.
- Starting the decider before both earlier matches finish.
- Forgetting to explain the format to players before the first match.
- Not seeding the groups.
- Using it for a game where draws are common, without a rule for them.` },
    ],
    faq: [
      { q: "What is a GSL-style dual tournament?", a: "It is a four-player double elimination group. Two opening matches feed a winners' match and a losers' match, and the loser of the winners' match plays the winner of the losers' match in a decider. Five matches in total send two players through, and no player is out after one loss." },
      { q: "How many matches are in a dual tournament group?", a: "Five. Two opening matches, one winners' match, one losers' match and one decider. A plain round robin of four players has six matches, so the dual tournament is shorter, and every match matters. For 16 players in four groups, that is 20 group matches before the knockout." },
      { q: "Can I use a dual tournament for team games with draws?", a: "It works best for games where every match has a winner. If draws are possible, add a rule that decides a drawn match, such as a replay or a short tiebreaker, because the format needs a winner and a loser in every match. Otherwise, a round robin with tie-breaks is a better fit." },
    ],
    related: ["group-stage-and-knockout-planning", "round-robin-single-double-and-tiebreaks", "how-to-draw-a-fair-tournament-draw"],
    cta: { label: "Build the groups and knockout", href: "/tools/groups/" },
  },

  {
    slug: "fighting-game-tournament-bracket-setup",
    title: "Fighting game tournament setup: brackets, pools, stations and rules",
    seoTitle: "Fighting game tournament setup and rules",
    description: "How to run a fighting game tournament: double elimination, pools, how many stations you need, controller and settings rules, set length and a schedule for the day.",
    tag: "Game guide",
    answer: "Fighting game events usually run double elimination, often with pools first. Count your stations, plan each set for its longest length, fix the game settings and controller rules, and appoint a bracket runner who calls players to stations. Stations, not players, are your limit.",
    intro: "Fighting games have their own tournament culture: pools, bracket runners, setup stations and a lot of rules about settings. A new organiser can run one well by copying the structure of established events. The structure is simple. The details, and the number of stations, are where events go wrong.",
    sections: [
      { h2: "Stations are your limit", md: `A station is one screen and console or PC set up for a match. Each set occupies a station until it ends. Your number of stations decides how many players you can take, not the size of the room.

Count the sets, estimate their length, and divide by your stations. For 16 players in double elimination, there are 30 sets. If each set takes 15 minutes and you have 4 stations, you need about 8 slots, which is 2 hours, plus gaps. Use the [match schedule maker](/tools/schedule/) to test your own numbers.` },
      { h2: "Format: double elimination, with pools for big fields", md: `Double elimination is the standard, because one lost set should not end a player's day. See [double elimination explained](/guides/double-elimination-bracket-explained/).

For larger fields, run pools first. Players are split into small groups, play inside the group, and the best from each go into the main bracket. The [groups and knockout maker](/tools/groups/) builds the pools. For the main bracket, use the [double elimination tool](/tools/double-elimination/).

Seed the bracket by past results or a rating, or use a random draw if you have none, as in [seeding a bracket](/guides/how-to-seed-a-tournament-bracket/).` },
      { h2: "Set length", md: `A set is a best-of series of games. Common choices are best of 3 in the early rounds and best of 5 in the later rounds and the final. Choose and publish them.

| Stage | Set |
|---|---|
| Pools and early bracket rounds | Best of 3 |
| Winners and losers semi-finals | Best of 5 |
| Grand final | Best of 5, with the bracket reset if you use one |

See [series length](/guides/best-of-1-3-5-series-length-explained/) and [bracket reset](/guides/bracket-reset-and-grand-final-explained/) for the details.` },
      { h2: "Game settings and controllers", md: `Write the settings once and use them for every set: game version, timer, rounds per game, stage selection method, and any banned items or modes. Settings can change with updates, so test on your own equipment before the event.

For controllers, decide who supplies them and whether players may bring their own. Many events allow personal controllers as long as they are standard, and ban any with unfair features. Say which. Have spare controllers at every station.` },
      { h2: "Character and stage rules", md: `Decide how characters and stages are chosen, because it affects every set:

- Whether a player may switch characters between games, and under what condition.
- How stages are picked: a fixed list, a strike or ban process, or a random choice.
- Which stages are banned, if any.

Write the rule in two lines and ask a referee to enforce it. The idea of banning and picking is the same as a [map veto](/guides/valorant-map-veto-explained/) in team shooters.` },
      { h2: "The bracket runner", md: `Appoint one person to be the bracket runner. They call the next sets, send players to free stations, record results and update the bracket. Without one, players wait for each other and the event runs late.

Make results public as they happen, on a [display screen](/tools/display-screen/) or a shared page. Tell players how long they have to arrive at a station once called, such as 5 minutes, before they forfeit.` },
      { h2: "Common mistakes", md: `- Taking more players than stations can handle.
- No bracket runner, so players hunt for their sets.
- Leaving settings and character rules unwritten.
- Using best of 5 everywhere and running over time.
- Having no spare controllers.` },
    ],
    faq: [
      { q: "How do you run a fighting game tournament?", a: "Use double elimination, with pools first if the field is large. Count your stations and plan each set for its longest length, fix the game settings and controller rules, appoint a bracket runner who calls players to stations and records results, and publish the set lengths for each round in advance." },
      { q: "How many stations do I need for a fighting game event?", a: "Count the sets your format needs, multiply by the time per set, and divide by the stations you have. Sixteen players in double elimination need 30 sets. At 15 minutes each on 4 stations that is about two hours. Stations, not players or space, are the real limit on the size of the event." },
      { q: "Should players be allowed to bring their own controllers?", a: "Many events allow standard personal controllers and ban any with unfair features. Decide and write the rule, tell players what is allowed at registration, and keep spare controllers at each station. Check the game's current settings and any controller restrictions before the event, because they can change with updates." },
    ],
    related: ["double-elimination-bracket-explained", "best-of-1-3-5-series-length-explained", "bracket-reset-and-grand-final-explained"],
    cta: { label: "Draw the double elimination bracket", href: "/tools/double-elimination/" },
  },

  {
    slug: "tournament-budget-template",
    title: "Tournament budget template: what to count before you promise a prize",
    seoTitle: "Tournament budget template",
    description: "A tournament budget template with every cost to count, an example with numbers for a campus event, income sources and a safe way to set the prize pool.",
    tag: "Organiser guide",
    answer: "List every cost first: venue, power and network, referees, printing, refreshments, prizes and a reserve. List the income you hold: entry fees and confirmed sponsors. Subtract, and set the prize pool from what is left. Never spend money you only hope to receive.",
    intro: "Most tournaments that fail financially do not fail because of one big cost. They fail because of a long list of small ones nobody wrote down, and a prize announced before the money existed. A budget on one page prevents both.",
    sections: [
      { h2: "List the costs", md: `Go through the event in order and write each cost down, even small ones.

| Group | Examples |
|---|---|
| Venue | Hall or ground booking, power, cleaning |
| Technology | Network, extra screens, extension boards |
| People | Referees, scorers, security, first aid |
| Printing | Posters, ID cards, certificates, score sheets |
| Hospitality | Water, refreshments for officials |
| Prizes | Cash, trophies, merchandise |
| Reserve | A small amount for surprises |

The [print kits tool](/tools/print-kits/) and the [ID card maker](/tools/id-cards/) cover most of the printing, and you can estimate the cost of each before you start.` },
      { h2: "List the income", md: `Income comes from three places:

- Entry fees: teams multiplied by the fee. Use the number of teams you are confident about, not the number you hope for.
- Sponsors: only agreed amounts count. See the [sponsor pitch guide](/guides/sponsor-pitch/).
- Your own contribution, or your club's.

A sponsor's "maybe" is not income. Move it into the budget only when it is confirmed in writing.` },
      { h2: "An example for a campus event", md: `A one-day event for 16 teams with a ₹300 entry fee per team.

| Item | Amount |
|---|---|
| Entry fees (16 × ₹300) | ₹4,800 |
| Sponsor (confirmed) | ₹3,000 |
| **Income** | **₹7,800** |
| Hall and power | ₹2,000 |
| Printing | ₹1,200 |
| Referees' refreshments | ₹600 |
| Certificates and trophy | ₹1,000 |
| Reserve | ₹800 |
| **Costs** | **₹5,600** |
| **Left for prizes** | **₹2,200** |

Income minus costs is ₹2,200, so that is the cash prize pool. See [prize pool and payout split](/guides/tournament-prize-pool-and-payout-split/) for how to share it.` },
      { h2: "Sensitivity: what if fewer teams come?", md: `Test the budget with a worse case. If only 12 teams enter, entry fees fall to ₹3,600, and income to ₹6,600. Costs stay near ₹5,600, so the prize pool drops to ₹1,000.

Two ways to protect yourself: set a minimum number of teams before the event runs, or state that the prize depends on entries. The first is safer. The second needs a rule on the poster: "prize pool is ₹X for 16 teams and scales down for fewer".` },
      { h2: "Track spending during the event", md: `Keep one sheet with the planned amount, the actual amount and a note for each line. Write down who paid and when. Keep receipts.

After the event, finish the sheet. If there is money left, say what you will do with it: carry it to the next event, or give it to the club. A clear record makes the next sponsor easier to win.

Name one person as the treasurer. Everyone else asks that person before spending. Two people spending from the same pot without telling each other is how a small event ends up ₹1,000 over budget by the afternoon.` },
      { h2: "Cutting costs without cutting quality", md: `If the numbers do not work, cut in this order:

1. Printing: use fewer colours, or print only what the day needs. The [print kits tool](/tools/print-kits/) lets you choose which sheets to make.
2. Refreshments: water for officials, and let players bring their own food.
3. Prizes: swap some cash for certificates and a trophy that is reused each year.
4. Venue: ask the college or club for a free hall, in return for the sponsor's name on the banner.

Do not cut the reserve, referees or first aid. Those are the lines that protect the event on a bad day.` },
      { h2: "Common mistakes", md: `- Announcing a prize before counting costs.
- Counting income that is not confirmed.
- Forgetting printing, power or refreshments.
- No reserve.
- Not keeping receipts.` },
    ],
    faq: [
      { q: "What should a tournament budget include?", a: "Venue and power, network and screens, referees and first aid, printing, refreshments, prizes and a small reserve on the cost side, and entry fees, confirmed sponsors and your own contribution on the income side. Subtract costs from confirmed income, and the remainder is the most you can offer as prizes." },
      { q: "How do I set the prize pool safely?", a: "Add up the income you hold or have confirmed in writing, subtract all costs and a reserve, and use the remainder. Test it with fewer teams than you expect. If entries drop, the prize pool drops too, so either set a minimum number of teams or state on the poster how the prize scales." },
      { q: "Should I count a sponsor who has not confirmed?", a: "No. Count only sponsors who have agreed in writing, and only the amount they agreed. A possible sponsor is a bonus, not income. If the money arrives, you can add to the prize pool or reduce the entry fee next time, but do not spend it before it exists." },
    ],
    related: ["sponsor-pitch", "tournament-prize-pool-and-payout-split", "run-a-campus-tournament"],
    cta: { label: "Plan the event and the numbers", href: "/tools/plan/" },
  },

  {
    slug: "school-sports-day-tournament-planning",
    title: "School sports day tournament planning: houses, events and a day plan",
    seoTitle: "School sports day tournament planning",
    description: "How to plan a school sports day tournament: house or class teams, events and brackets, points per place, consent and safety, staffing and a timetable for one day.",
    tag: "Sport guide",
    answer: "Divide students into houses or classes, choose a small set of events, give points per place in each event, add the points for an overall winner, and plan staff, safety and consent before the day. Keep the schedule tight and publish it a week ahead.",
    intro: "A school sports day is a tournament with many sports and many teams that never played each other before. The planning is the same as any event: format, schedule, staff, safety, results. Add the school's own rules on consent and supervision, and the day runs smoothly.",
    sections: [
      { h2: "Teams: houses or classes", md: `Most schools use houses, or classes within a grade, as teams. Keep them balanced in size, and decide how students who miss the day are handled.

Decide the age groups: for example under 12, under 14 and under 16, with separate events for each. Make a list of who is in which group, and check it before registration closes. The [registration form tool](/tools/registration/) can collect entries from teachers.` },
      { h2: "Choose the events", md: `Pick events that suit the space and the time. A mix of track, field and team games keeps students involved.

| Type | Examples | Format |
|---|---|---|
| Track | Short sprints, relays | Heats, then a final |
| Field | Long jump, throws | Best attempt |
| Team games | Football, kho-kho, throwball | Pools then a knockout |
| Fun events | Sack race, tug of war | Single match |

Use a [bracket](/tools/brackets/) or [groups](/tools/groups/) for the team games. Keep the list short: more events mean more staff and more waiting.` },
      { h2: "Points and the overall winner", md: `Give points for each place in each event, and add them for the overall winner.

| Place | Points (example) |
|---|---|
| 1st | 10 |
| 2nd | 7 |
| 3rd | 5 |
| 4th | 3 |
| Participation | 1 |

This is an example scale. Choose yours, apply it to every event, and publish it. Decide the tie-break for the overall winner: most first places, then most second places. See [how to write tie-breaker rules](/guides/tournament-tiebreaker-rules-how-to-write/).` },
      { h2: "Consent and safety", md: `Check the school's own policy on events, consent and supervision, and follow it. Typically you need parent consent for participation, a first-aid kit and a first-aider on site, shade and water, and enough adults for the number of children.

Write a short safety plan: who handles an injury, who calls a parent, where the nearest hospital is. Brief the staff before the day. The campus plan in [run a campus tournament](/guides/run-a-campus-tournament/) has a gate and safety checklist you can adapt.` },
      { h2: "Staffing and timetable", md: `Each event needs a person in charge, and a scorer. Teachers often cover these, with senior students helping.

| Time | What happens |
|---|---|
| 08:30 | Assembly and house parade |
| 09:00 to 10:30 | Track and field events |
| 10:30 | Break and water |
| 10:45 to 12:30 | Team game pools |
| 12:30 | Lunch |
| 13:15 to 14:30 | Semi-finals and finals |
| 14:45 | Prizes and house points |

Publish the schedule a week ahead, and put the venue map on the notice board. The [schedule maker](/tools/schedule/) helps with the team games.` },
      { h2: "Results and certificates", md: `Record every result on one sheet, and update the house points after each event. A [display screen](/tools/display-screen/) or a notice board shows the running totals, which keeps everyone engaged.

Give every participant a certificate if you can. The [certificate maker](/tools/certificates/) makes one page per name, and the [certificate wording guide](/guides/certificate-wording/) has text for winners and participants.` },
      { h2: "Common mistakes", md: `- Too many events for the time and staff.
- No tie-break for the overall winner.
- Unbalanced houses.
- Skipping consent or first aid.
- Not publishing the schedule in advance.` },
    ],
    faq: [
      { q: "How do you plan a school sports day?", a: "Divide students into houses or classes, choose a short list of events, decide points per place and the tie-break for the overall winner, check the school's consent and safety rules, assign a person and a scorer to each event, and publish the timetable a week ahead. Keep the schedule tight so students are not waiting." },
      { q: "How do you score a house competition?", a: "Give points for each place in every event, for example 10, 7, 5 and 3 for the first four, and 1 for taking part, and add them up for each house. Publish the scale first, and decide a tie-break such as the number of first places. Update the running totals after each event." },
      { q: "What safety arrangements does a school sports day need?", a: "Follow the school's policy on consent and supervision, have a first-aider and a kit on site, provide water and shade, and appoint enough adults for the number of children. Write a short plan for who handles an injury, who contacts a parent and where the nearest hospital is, and brief the staff." },
    ],
    related: ["run-a-campus-tournament", "tournament-tiebreaker-rules-how-to-write", "certificate-wording"],
    cta: { label: "Build the groups for team games", href: "/tools/groups/" },
  },

  {
    slug: "ea-fc-fifa-tournament-rules",
    title: "EA FC tournament rules: settings, match length and proof of results",
    seoTitle: "EA FC tournament rules and settings",
    description: "Rules for an EA FC (FIFA-style) tournament: match settings, squad rules, who hosts, extra time and penalties, disconnects and proof of results.",
    tag: "Game guide",
    answer: "Write the match settings once, decide team and squad rules, fix who hosts each match, set rules for extra time, penalties and disconnects, and require both players to send a screenshot of the final score. Use a league for small fields and a bracket for larger ones.",
    intro: "Football video game tournaments are easy to start and easy to argue about. Everyone agrees what a goal is. They disagree about settings, about what happens when a game freezes, and about who is allowed to use which team. The rules below cover each of those.",
    sections: [
      { h2: "Format", md: `Pick a format that suits the number of players.

| Players | Format |
|---|---|
| 4 to 8 | Single or double round robin |
| 8 to 16 | Single or double elimination |
| 16 to 32 | Groups, then a knockout |

The [round robin generator](/tools/round-robin/) makes fixtures for leagues, the [bracket maker](/tools/brackets/) draws knockouts, and the [football points guide](/guides/football-points-system-and-tiebreakers/) gives the points and tie-breaks for a league table. The [eFootball guide](/guides/efootball-tournament-organise/) covers the setup that applies to both games.` },
      { h2: "Match settings", md: `Fix the settings in writing, and test them in a match before the event:

- Match length for each half.
- Game mode and difficulty setting for matches against another person.
- Controls, if the game offers options that affect fairness.
- Whether weather, time of day or other game options are fixed.

Game versions and options change with updates and seasons. State the version your event uses, and check the settings again on the day.` },
      { h2: "Team and squad rules", md: `Decide whether players may pick any team. If any team is allowed, the strongest sides get chosen, which is fine in a casual event. For a fairer contest, you can set a rating limit, ban the top few teams, or assign teams by draw.

Whatever you choose, write it down and check team selection at the start of each match. A player who uses a banned team loses the match, or replays with a permitted one.` },
      { h2: "Hosting and knockouts", md: `Decide who hosts each match: the higher seed, or the first-named player in the fixture. Set a time limit for sending the invite.

For a knockout match that is level at full time, decide between extra time and penalties in the game, or going straight to penalties. Choose one rule and use it in every round. For a two-leg tie, say how aggregate scores and away goals, if any, are treated.` },
      { h2: "Disconnects and technical problems", md: `A disconnect rule saves arguments:

- A disconnect in the first half means a replay with the same settings, or the same score and clock if the game allows.
- A disconnect in the second half means the score stands, or the player who disconnected loses. Choose one.
- A second disconnect by the same player is a loss.

These are examples. Pick the numbers and the cut-off yourself, publish them, and apply them to every match.` },
      { h2: "Proof and disputes", md: `Both players send a screenshot of the final score with both names visible. If they disagree, ask for the match highlights or a replay on a call.

Collect results in one place and keep them until the protest window ends. The [dispute process guide](/guides/tournament-dispute-process-protest-window/) has a window and wording you can copy.` },
      { h2: "Common mistakes", md: `- Not fixing settings or the game version.
- Leaving team selection open without saying so.
- No rule for extra time and penalties.
- Writing no disconnect rule.
- Accepting a result with no screenshot.` },
    ],
    faq: [
      { q: "What settings should an EA FC tournament use?", a: "Fix the match length, the game mode used between two people, team selection rules and any options that affect fairness, then test them in a match before the event. Name the game version, because settings and modes change with updates, and write everything on the rules page so players cannot claim they were not told." },
      { q: "How do you handle disconnects in an EA FC match?", a: "Write a rule in advance: for example a replay if the disconnect is early, the score standing or the disconnecting player losing if it is late, and a loss for a repeat disconnect. The cut-off and the numbers are your choice, but they must be published and applied the same way to every match." },
      { q: "Should players be able to use any team?", a: "That is your decision. Open choice is fine for a casual event, but the strongest teams get picked. For fairness, you can limit team ratings, ban the top few sides, or draw teams. Write the rule, check team selection at the start of each match and set the penalty for breaking it." },
    ],
    related: ["efootball-tournament-organise", "football-points-system-and-tiebreakers", "tournament-dispute-process-protest-window"],
    cta: { label: "Generate league fixtures", href: "/tools/round-robin/" },
  },

  {
    slug: "page-playoff-system-explained",
    title: "Page playoff system explained: four teams, four matches, a second chance",
    seoTitle: "Page playoff system explained",
    description: "How the Page playoff system works for four teams: the matches, a worked example, why the top two get a second chance and when it beats a plain semi-final bracket.",
    tag: "Format guide",
    answer: "The Page playoff is a four-team playoff in four matches. Seeds 1 and 2 play each other and the winner goes straight to the final. Seeds 3 and 4 play, and the loser is out. The loser of 1 v 2 then plays the winner of 3 v 4 for the second final place.",
    intro: "When a league ends and four teams reach the playoffs, a plain semi-final bracket punishes the top seed for one bad day. The Page playoff, used in cricket leagues and other sports, gives the top two teams a second life. It needs only four matches.",
    sections: [
      { h2: "The four matches", md: `Take four teams ranked 1 to 4 after a league stage.

1. Match 1: seed 1 plays seed 2. The winner goes straight to the final.
2. Match 2: seed 3 plays seed 4. The loser is eliminated.
3. Match 3, the semi-final: the loser of match 1 plays the winner of match 2. The winner goes to the final.
4. Match 4, the final: the winner of match 1 plays the winner of match 3.

The top two seeds both have two chances to reach the final.` },
      { h2: "A worked example", md: `After the league, the table gives A, B, C and D as seeds 1 to 4.

| Match | Pairing | Result |
|---|---|---|
| 1 | A (1) vs B (2) | B wins, goes to the final |
| 2 | C (3) vs D (4) | C wins; D is out |
| 3 | A vs C | A wins, goes to the final |
| 4, final | B vs A | A wins the title |

A lost match 1 and still won the title, because finishing top of the league earned a second chance. If A had also lost match 3, it would have been eliminated.` },
      { h2: "What it rewards", md: `The Page playoff rewards the teams that finished first and second, with a safety net. It makes life harder for seeds 3 and 4: seed 4 must win match 2, match 3 and the final, three matches in a row, while seed 1 needs only one or two wins.

That is by design. The league stage is long, and the playoff should respect it. For a short league, a plain semi-final bracket may be fairer, since fewer matches say less about the table.` },
      { h2: "Comparison with other four-team formats", md: `| Format | Matches | Chances for top seeds |
|---|---|---|
| Single elimination semi-finals and final | 3 | One |
| Page playoff | 4 | Two for seeds 1 and 2 |
| Double elimination for 4 | 6 or 7 | Two for everyone |
| Round robin of 4 | 6 | Everyone plays everyone |

The Page playoff sits between a knockout and double elimination in time and fairness. It adds one match to a plain bracket, and gives a second chance only to the league's best two teams.` },
      { h2: "Scheduling it", md: `Matches 1 and 2 can be played at the same time if you have two venues, or one after the other. Match 3 follows both, and match 4 follows match 3. That is three time slots, and two if matches 1 and 2 run in parallel.

Use the [schedule maker](/tools/schedule/) to fit it into your day, and the [bracket maker](/tools/brackets/) if you want a printed bracket. For series, see the [series length guide](/guides/best-of-1-3-5-series-length-explained/). The semi-final and final are good places for a longer series.` },
      { h2: "Explaining it to players", md: `Print a small diagram on the rules page, and read the rule aloud at the captains' briefing: "Seeds 1 and 2 play first. The winner goes to the final. The loser gets another chance in the semi-final against the winner of 3 v 4."

Put it in your [rules template](/guides/esports-tournament-rules-template/) so that nobody is surprised.` },
      { h2: "Common mistakes", md: `- Using a Page playoff after a very short league.
- Not explaining why the top two get a second chance.
- Forgetting the order of the matches in the schedule.
- Applying it to more than four teams without a clear rule.
- Mixing it up with a double elimination bracket.` },
    ],
    faq: [
      { q: "How does the Page playoff work?", a: "Four teams play four matches. Seeds 1 and 2 play, and the winner goes to the final. Seeds 3 and 4 play, and the loser is out. The loser of the first match plays the winner of the second in a semi-final, and its winner meets the first match's winner in the final." },
      { q: "Why do the top two seeds get a second chance?", a: "Because they earned the best records in the league stage, which is a longer and more reliable test than a single playoff match. The format respects that by letting the first and second seeds lose once and still reach the final. Seeds 3 and 4 have only one chance." },
      { q: "When should I use the Page playoff?", a: "When you have a league stage followed by four teams in a playoff, and you want to reward the top two without the time of a full double elimination. After a very short league, a plain semi-final bracket may be fairer, because the table says less about team strength." },
    ],
    related: ["double-elimination-bracket-explained", "tournament-bracket-byes-explained", "best-of-1-3-5-series-length-explained"],
    cta: { label: "Make the playoff bracket", href: "/tools/brackets/" },
  },

  {
    slug: "tournament-volunteer-roles-and-briefing",
    title: "Tournament volunteers: roles to assign and how to brief them",
    seoTitle: "Tournament volunteers: roles and briefing",
    description: "How to organise volunteers for a tournament: roles, how many you need, a briefing sheet, shifts, safety, and how to thank them so they come back next time.",
    tag: "Organiser guide",
    answer: "List the jobs first, give each volunteer one clear role and a named lead, brief them together before the event with a printed sheet, plan short shifts with breaks, and thank them properly afterwards. Volunteers who know exactly what to do and who to ask do their jobs well.",
    intro: "Volunteers make most local tournaments possible, and most local tournaments waste them. People turn up, nobody tells them what to do, and the best ones leave. A short plan fixes this: a list of roles, a briefing and a way to say thank you.",
    sections: [
      { h2: "Start with the jobs, not the people", md: `Walk through the day from setup to pack-down and list every job. Then count how many people each job needs and when.

| Job | People | When |
|---|---|---|
| Registration and check-in | 2 | Before and at the start |
| Court or room marshals | 1 per match area | During matches |
| Results desk | 1 to 2 | Throughout |
| Runners and helpers | 2 | Throughout |
| First aid contact | 1 | Throughout |
| Setup and pack-down | 4 | Start and end |

Write the list on one sheet. Fill the roles with volunteers, and give each a name.` },
      { h2: "One role, one lead", md: `Give every volunteer a single role, and tell them who their lead is. A lead is a person they can ask for help, not a boss. Without a lead, volunteers ask whoever is nearest, and get different answers.

Put the leads on the briefing sheet with phone numbers. Keep the structure flat: you, a few leads, and volunteers. See [referee roles and duties](/guides/tournament-referee-roles-and-duties/) for the match-day roles.` },
      { h2: "The briefing", md: `Brief everyone together, 30 to 45 minutes before the start. Cover:

1. The schedule and the venue map.
2. Each person's role, shift and lead.
3. The five rules that matter most, such as late teams and protests.
4. What to do in an emergency, and who calls whom.
5. What not to do: no arguing with players, no promises about results, no sharing the schedule changes without telling the results desk.

Give each volunteer a printed sheet with these points. The [print kits tool](/tools/print-kits/) can produce signs and sheets.` },
      { h2: "Shifts and breaks", md: `Long, unbroken shifts lose volunteers. Plan shifts of 3 to 4 hours, with a break and water. If the event is longer, use two shifts, and overlap them by 15 minutes so people can hand over.

Feed your volunteers. Water and a simple meal cost little and signal respect.` },
      { h2: "Safety and young volunteers", md: `If volunteers are under 18, check your school or club's policy on supervision and consent. Do not put young volunteers in sole charge of anything safety-related.

Tell all volunteers where first aid is, who to call in an emergency, and which areas they must not enter. Write it on the briefing sheet.` },
      { h2: "Thank them, then ask them back", md: `Thank volunteers in person at the end, and again in writing. Give them a [certificate](/tools/certificates/) with their role, which is useful on a student's record, and see the [certificate wording guide](/guides/certificate-wording/) for text.

Ask each volunteer one question: what would have made the day easier? Use the answers next time, and invite the same people back.` },
      { h2: "Common mistakes", md: `- Turning up without a list of jobs.
- Several volunteers asking several different people for help.
- Long shifts with no break.
- No briefing, so volunteers improvise.
- Forgetting to say thank you.` },
    ],
    faq: [
      { q: "How many volunteers does a tournament need?", a: "It depends on the size, but list the jobs first: check-in, match-area marshals, results desk, runners, first aid contact, and setup and pack-down. Count how many people each job needs and when. A one-day event with four matches at once often needs around ten people, including a few who cover several roles." },
      { q: "How should I brief tournament volunteers?", a: "Meet everyone together 30 to 45 minutes before the start. Cover the schedule and map, each person's role, shift and lead, the few rules that cause the most trouble, emergency steps and what not to do. Give each volunteer a printed sheet with those points and the lead's phone number." },
      { q: "How do I keep volunteers coming back?", a: "Give them clear roles, short shifts with breaks, water and food, and a thank-you in person and in writing. A certificate with their role helps students. Ask each volunteer what would have made the day easier, act on it, and invite the same people to the next event." },
    ],
    related: ["tournament-referee-roles-and-duties", "run-a-campus-tournament", "certificate-wording"],
    cta: { label: "Print signs and sheets for the day", href: "/tools/print-kits/" },
  },

  {
    slug: "mobile-esports-tournament-device-and-network-rules",
    title: "Mobile esports tournament rules: devices, networks and emulators",
    seoTitle: "Mobile esports tournament device rules",
    description: "Rules for a mobile esports tournament: allowed devices, emulators, network and data, charging, notifications, screen recording and a fair-play checklist.",
    tag: "Game guide",
    answer: "Mobile tournaments need rules that PC events do not: which devices are allowed, whether emulators are banned, how players connect, charging, notifications and screen recording. Write each rule in plain words, publish it at registration, and check devices before the first match.",
    intro: "On PC, the hardware is usually the organiser's business. On mobile, every player brings their own phone, and phones differ a great deal. Without device and network rules, you will spend the event arguing about lag, emulators and notifications.",
    sections: [
      { h2: "Devices", md: `Decide which devices are allowed. Options include phones only, phones and tablets, or any device the game supports. Phones and tablets differ in screen size, and that can matter in some games.

If you want a level playing field, say "phones only" or "phones and tablets under a stated screen size". If you do not mind, say any device, and state it. Ask players to name their device at registration, which the [registration form tool](/tools/registration/) can collect.` },
      { h2: "Emulators and modified clients", md: `Many mobile games can run on a computer through an emulator, which gives a player a keyboard, mouse and bigger screen. For mobile-only events, ban emulators and any modified client, and say that this is an anti-cheating rule.

Say how you will check: a referee watching a camera or screen share, a spot check of devices, and recordings on request. Write the penalty, such as loss of the match or removal from the event.` },
      { h2: "Network and data", md: `Network quality decides many matches in mobile games. Write rules for it:

- Whether a Wi-Fi connection is required, or mobile data is also fine.
- Whether players may use a VPN. A VPN can change latency and the server a player connects to, so many organisers ban it.
- What happens with a bad connection: the same disconnect rule as for any technical problem.

For a [LAN-style event](/guides/online-vs-lan-tournament-which-to-run/), provide the network and test it with all devices at once.` },
      { h2: "Charging, notifications and interruptions", md: `A phone call in the middle of a match is a loss. Ask players to:

- Switch on do-not-disturb and silence notifications.
- Charge the phone fully, or keep it plugged in. For an in-person event, provide charging points.
- Close other apps.

State whether players can pause a match for an interruption. In most games they cannot. Include a rule for a phone that overheats or shuts down: it is the player's responsibility.` },
      { h2: "Screen recording and fair play", md: `Ask players to record their screen, at least in knockout rounds, and keep the recording until the protest window ends. Recording slows some phones, so test it in a practice match.

For fair play, use a short checklist at the start of each match: device is the one registered, emulators are not running, notifications are off, the roster matches the lobby. The [dispute process guide](/guides/tournament-dispute-process-protest-window/) explains what happens when a rule is broken.` },
      { h2: "A rule page to copy", md: `1. Devices: [phones only / phones and tablets].
2. Emulators and modified clients are banned; penalty: [disqualification].
3. Connection: [Wi-Fi or mobile data]; VPNs are [banned].
4. Do-not-disturb on; phone charged before each match.
5. Screen recordings may be requested; keep them for [one hour] after the match.
6. A phone problem is the player's responsibility; the disconnect rule applies.

Add it to the rules built from the [rules template](/guides/esports-tournament-rules-template/).` },
      { h2: "Common mistakes", md: `- Not stating whether emulators are banned.
- Ignoring VPN use.
- No rule for interruptions from calls.
- Not testing screen recording.
- Leaving device rules out of registration.` },
    ],
    faq: [
      { q: "Should a mobile tournament ban emulators?", a: "For a mobile-only event, yes: emulators give a keyboard, mouse and larger screen, which changes the game. Say it in the rules as an anti-cheating measure, explain how you will check, with referees watching and recordings on request, and write the penalty so that players know what to expect." },
      { q: "Can players use a VPN in a mobile tournament?", a: "Many organisers ban VPNs, because they change latency and the server a player connects to, which affects fairness. Decide your policy and write it in the rules. If you allow a VPN, say so, and apply the same disconnect rule as for any other connection problem." },
      { q: "What should mobile players do before a match?", a: "Switch on do-not-disturb, silence notifications, close other apps, charge the phone fully or plug it in, and start a screen recording if the rules ask for one. The organiser can print this as a short checklist and a referee can read it before each match." },
    ],
    related: ["online-vs-lan-tournament-which-to-run", "preventing-cheating-in-online-tournaments", "tournament-dispute-process-protest-window"],
    cta: { label: "Build the registration page", href: "/tools/registration/" },
  },

  {
    slug: "player-code-of-conduct-template",
    title: "Player code of conduct template for tournaments and communities",
    seoTitle: "Player code of conduct template",
    description: "A player code of conduct template for tournaments: respect, fair play, chat and social media, penalties, how reports work and a one-page version to copy.",
    tag: "Organiser guide",
    answer: "A code of conduct says how players must treat each other, referees and the game: respect, fair play, language, social media and what happens if the rules are broken. Keep it to one page, list penalties by level, and ask every player and captain to accept it at registration.",
    intro: "Most conduct problems at tournaments are small: a rude message, a slammed table, a post about a referee. They only become big if there is no agreed rule. A one-page code, accepted at registration, gives you something to point to calmly when it matters.",
    sections: [
      { h2: "What the code should cover", md: `Keep it to the behaviours that cause real problems:

- Respect for opponents, teammates, referees, volunteers and spectators.
- Fair play: no cheating, no match fixing, no teaming where it is banned.
- Language: no abuse, threats or discriminatory remarks, in person, in chat or on voice.
- Social media: no attacks on individuals, and no sharing private information.
- The venue and equipment: look after them.
- Alcohol, drugs and weapons: the venue's rules apply.

Each line should be a sentence a teenager can read in ten seconds.` },
      { h2: "Make penalties clear and graded", md: `Players accept a rule more easily when they know the consequence and see it applied evenly.

| Level | Example | Penalty |
|---|---|---|
| Minor | Rude remark, late arrival | Warning |
| Moderate | Repeated abuse, unsporting conduct | Loss of match points or a match |
| Serious | Cheating, threats, fixing | Disqualification and a ban from future events |

Say who decides, which is the head referee, and how a player can appeal, as in the [dispute process guide](/guides/tournament-dispute-process-protest-window/).` },
      { h2: "Reporting concerns", md: `Make it easy to report a problem. Give a person and a contact: a named organiser and a phone number or email. Tell players that reports will be handled privately, and that a report made in good faith will not be punished.

For events with young players, the school's or club's safeguarding policy applies. Name the contact person in the code, and brief your volunteers, as in [volunteer roles and briefing](/guides/tournament-volunteer-roles-and-briefing/).` },
      { h2: "Accepting the code", md: `Ask every captain to accept the code at registration, and every player to confirm they have read it. A checkbox on the form built with the [registration form tool](/tools/registration/) is enough.

For under-18s, ask a parent or guardian to accept too. State how you will use the player's details: only to run the tournament.` },
      { h2: "A one-page code to copy", md: `1. Treat opponents, teammates, referees and volunteers with respect.
2. Play fairly. No cheating, no fixing results and no teaming where it is banned.
3. No abuse, threats or discriminatory language, anywhere, including chat and social media.
4. Do not share anyone's private information.
5. Look after the venue and the equipment.
6. Follow the referee's instructions on the day.
7. Breaking these rules leads to a warning, a loss of points, or removal, depending on how serious it is. The head referee decides. You may appeal once to [name].
8. Report any problem to [name] at [contact].

Add it to the [rules template](/guides/esports-tournament-rules-template/).` },
      { h2: "Apply it evenly", md: `A code that is applied to some people and not others is worse than none. Apply it the same way to the best team and the newest one. If you must make an exception, write down why.

Record each warning and decision in one place: who, when, what and the outcome. If a player appeals, you have the record.` },
      { h2: "Common mistakes", md: `- A code too long to read.
- Penalties that are not stated.
- No way to report a problem.
- Applying it to some players and not others.
- Not asking players to accept it.` },
    ],
    faq: [
      { q: "What should a tournament code of conduct include?", a: "Respect for everyone involved, fair play, acceptable language in person and online, social media behaviour, care for the venue and equipment, graded penalties, how to report a problem and who decides. Keep it to one page that a teenager can read quickly, and ask every captain and player to accept it at registration." },
      { q: "What penalties should a code of conduct have?", a: "Use levels: a warning for minor issues like a rude remark, loss of match points or a match for repeated unsporting conduct, and disqualification and a ban for cheating, threats or match fixing. Say who decides and how to appeal, and apply the penalties the same way to every team." },
      { q: "How do I get players to accept the code?", a: "Add it to the registration form with a checkbox that every captain and player must tick, and ask a parent or guardian to accept for players under 18. Link to the full text, and read the key points aloud at the captains' briefing so nobody can say they did not know." },
    ],
    related: ["esports-tournament-rules-template", "tournament-dispute-process-protest-window", "tournament-volunteer-roles-and-briefing"],
    cta: { label: "Add it to the registration form", href: "/tools/registration/" },
  },

  {
    slug: "divisions-and-skill-levels-in-one-tournament",
    title: "Divisions and skill levels: how to run one tournament for mixed ability",
    seoTitle: "Divisions and skill levels in one tournament",
    description: "How to run a tournament for mixed ability: splitting into divisions, how to place players, rules for moving up, keeping prizes fair and a schedule that works.",
    tag: "Format guide",
    answer: "Split entries into divisions of similar ability, place players by a published rule, run each division as its own bracket or group, and give each its own prizes. This keeps matches close and beginners in the event, at the cost of more matches and more scheduling.",
    intro: "A tournament that mixes strong and beginner players ends two ways: the strong win every match, and the beginners leave after one. Divisions fix this. The price is more brackets and more scheduling, and a rule for who plays where.",
    sections: [
      { h2: "Why divisions help", md: `In a single bracket, a beginner who meets a top player in round one goes home after one match, and the top player learns nothing. In divisions, both play close matches.

Divisions also let you keep entries high. People enter when they believe they have a chance. A division for newer players means they do.` },
      { h2: "How to place players", md: `Choose a placement rule you can explain and apply to everyone.

- A past result or league: top players go to Division A.
- A rating or rank in the game, if one exists.
- Self-selection with a check: players choose a division, and the organiser may move them up.
- A short qualifier round: everyone plays a few matches and the results decide.

Publish the rule at registration. Ask for evidence when needed, and decide in advance who has the final word. Self-selection alone invites strong players to enter the beginner division.` },
      { h2: "Rules for moving up and sandbagging", md: `Write two rules:

- A player who wins a division, or who is clearly above its level, moves up for the next event.
- A player found to have entered a lower division on purpose is moved up, and may lose their prize.

Treat these as part of the code of conduct. See the [code of conduct template](/guides/player-code-of-conduct-template/) for the wording on fair play.` },
      { h2: "How many divisions", md: `Fewer is better, because each division is a separate bracket.

| Entries | Divisions | Why |
|---|---|---|
| Under 16 | 1 | Too few to split |
| 16 to 32 | 2 | Open and Beginner |
| 32 to 64 | 3 | A, B and C |

Each division should have at least 8 players, so it can run a real bracket. Use the [bracket maker](/tools/brackets/) or the [groups and knockout maker](/tools/groups/) for each. If a division has fewer than 8, merge it into the next one.` },
      { h2: "Scheduling several divisions", md: `Divisions multiply your matches. Two divisions of 16 in single elimination need 30 matches instead of 31 for one of 32, so the total is similar, but it needs two brackets running side by side. The same holds for stations, courts or lobbies.

Run divisions in parallel if you have the resources, or one after the other if you do not. The [schedule maker](/tools/schedule/) tests both, and the [how many teams guide](/guides/how-many-teams-for-your-format/) gives the match counts.` },
      { h2: "Prizes and recognition", md: `Give each division its own prizes, scaled to its size, and its own certificates. A beginner division winner deserves the same respect as an open winner. See [prize pool and payout split](/guides/tournament-prize-pool-and-payout-split/) for the allocation, and the [certificate maker](/tools/certificates/) for the printing.

Announce all divisions' results together, so everybody celebrates the same afternoon.` },
      { h2: "Common mistakes", md: `- Relying on self-selection with no check.
- Creating a division with only three or four players.
- No rule on moving up.
- Forgetting the extra scheduling load.
- Giving smaller prizes and less attention to lower divisions.` },
    ],
    faq: [
      { q: "How do I split players into divisions?", a: "Use a placement rule you can explain: a past result, a game rank, a short qualifier round, or self-selection with an organiser check. Publish the rule at registration and decide who has the final word. Self-selection alone lets strong players enter the beginner division, so add a check." },
      { q: "How many divisions should a tournament have?", a: "As few as work. Below about 16 entries, use one. From 16 to 32, two divisions such as Open and Beginner. From 32 to 64, three. Each division should have at least eight players so that it can run a proper bracket, and smaller divisions should merge with the next." },
      { q: "What if a strong player enters a lower division?", a: "Write the rule in advance: a player who is clearly above the division's level is moved up, and a player who entered a lower division on purpose may be moved and lose any prize. Include it in the code of conduct and apply it equally, based on evidence such as past results." },
    ],
    related: ["how-many-teams-for-your-format", "player-code-of-conduct-template", "group-stage-and-knockout-planning"],
    cta: { label: "Build a bracket for each division", href: "/tools/brackets/" },
  },
];
