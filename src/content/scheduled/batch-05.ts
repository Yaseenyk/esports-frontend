import type { Draft } from "./types";
import { FACTS as F } from "./facts";

/** Posts 40 to 49. */
export const BATCH_05: Draft[] = [
  {
    slug: "tournament-dispute-process-protest-window",
    title: "How to handle disputes in a tournament: a protest process that works",
    seoTitle: "Tournament dispute process and protest window",
    description: "A simple dispute process for tournaments: protest window, evidence, who decides, written decisions, appeals, and wording you can paste into your rules.",
    tag: "Organiser guide",
    answer: "Give disputes a fixed path: a short window to protest, written evidence, one named decision-maker, a written decision and a single appeal. Publish the process before the first match and use it the same way every time, so arguments end in minutes instead of hours.",
    intro: "Every tournament gets a dispute. A score is reported two ways, a player says an opponent cheated, or a rule is read differently by each captain. The organisers who cope are not the ones who avoid disputes. They are the ones with a process that everyone has already agreed to.",
    sections: [
      { h2: "Why a process matters more than the rule", md: `Most disputes are not really about the rule. They are about who gets to decide, and whether the decision feels fair. A clear process answers both questions before they are asked.

A good process is short, written down, and applied the same way to every team, including the organiser's friends. If it bends once, it will be tested every time after that.` },
      { h2: "Step 1: the protest window", md: `Choose a time limit for raising a protest. For a match-day event, 10 to 15 minutes after the match ends is common. For an online event with replays, it might be 30 minutes.

A protest after the window is not heard. This keeps the schedule moving and stops teams from raising a complaint after they have lost the next round. Say the window in the rules, and repeat it at the captains' briefing.` },
      { h2: "Step 2: evidence", md: `A protest needs evidence. Ask for it in the rules: a screenshot, a recording, a witness, the match record. A claim with no evidence is noted but cannot change a result.

Collect protests in one place, such as a form or a message thread, so there is a record. The [registration form tool](/tools/registration/) can build a simple protest form with a team name, match, reason and a link to evidence.` },
      { h2: "Step 3: one decision-maker", md: `Name one person who decides, usually the head referee. See [referee roles and duties](/guides/tournament-referee-roles-and-duties/) for who that should be. Do not form a committee on the day. Committees take an hour.

The decision-maker reviews the evidence, may ask both teams for their view, and decides according to the rulebook. They should not be on either team or a friend of either captain.` },
      { h2: "Step 4: written decision and one appeal", md: `Write the decision in a sentence: what was decided, which rule it relies on, and what happens next. Send it to both captains and record it.

Allow one appeal, to the organiser or a second named person, within a short time such as 10 minutes. The appeal can only check that the rulebook was applied, not start the argument again. After that, the decision is final.` },
      { h2: "A worked example", md: `Team A reports a 2-1 win. Team B says it won 2-1.

| Step | What happens |
|---|---|
| Report | Both teams send their result screenshot to the referee |
| Mismatch | The referee sees that the screenshots disagree |
| Protest | Team B protests within 10 minutes and attaches a recording |
| Review | The head referee compares the recording with Team A's screenshot |
| Decision | Written to both teams, citing the rule that the referee's record is final |
| Appeal | Team A appeals within 10 minutes; the organiser checks the rule was applied |

The whole process takes about 20 minutes, and the schedule moves on.` },
      { h2: "Wording to copy", md: `"A protest must be made in writing to the head referee within [15] minutes of the match ending, with evidence. The head referee decides in writing. A team may appeal once to [name] within [10] minutes, and the appeal can only review whether the rules were applied correctly. Decisions after the appeal are final."

Put it in your [rules template](/guides/esports-tournament-rules-template/) and on the registration page.` },
      { h2: "Common mistakes", md: `- Letting protests come in after the next match.
- Deciding on the spot without looking at evidence.
- Having several people decide, and getting several answers.
- Not writing the decision down.
- Giving friends a longer window than other teams.` },
    ],
    faq: [
      { q: "How should a tournament handle disputes?", a: "Use a fixed path: a short protest window, written evidence, one named decision-maker, a written decision and a single appeal. Publish the process before the first match and apply it equally to every team. A process agreed in advance ends most arguments in minutes, and the schedule keeps moving." },
      { q: "How long should the protest window be?", a: "Ten to fifteen minutes after the match ends is common for in-person events, and up to thirty for online events where replays must be checked. The window should be short enough that the schedule is not affected and long enough for a captain to gather evidence. Say the number in the rules." },
      { q: "Who should decide a tournament dispute?", a: "One person, normally the head referee, who is not on either team and has no personal tie to the captains. A single decision-maker is fast and accountable. Allow one appeal to the organiser or a second named person, limited to checking that the rulebook was applied correctly." },
    ],
    related: ["esports-tournament-rules-template", "tournament-referee-roles-and-duties", "preventing-cheating-in-online-tournaments"],
    cta: { label: "Build a protest and registration form", href: "/tools/registration/" },
  },

  {
    slug: "volleyball-tournament-format-and-points",
    title: "Volleyball tournament format, scoring and timetable",
    seoTitle: "Volleyball tournament format and scoring",
    description: "How to run a volleyball tournament: match scoring, sets and points, pool play then knockout, court time, tie-breaks by set ratio and a one-day timetable.",
    tag: "Sport guide",
    answer: "Volleyball matches are best of five sets, so plan court time for up to five sets. Use pools followed by a knockout for 8 to 16 teams, rank pool teams by match wins then set ratio, and decide in advance whether you play five sets or a shorter best of three.",
    intro: "Volleyball is a good tournament sport because the format is well known and the scoring is simple. The planning problem is time. A full best-of-five match can run long, and a hall with two courts fills quickly. Count the matches and the minutes first.",
    sections: [
      { h2: "How a match is scored", md: `${F.volleyball.text}

Because a match can last three, four or five sets, plan each slot for five. If your hall time is short, choose a shorter format for the early rounds, such as best of three sets to 25, and keep best of five for the final. Write the choice in the rules.` },
      { h2: "Choose the format", md: `For 6 to 16 teams, pools then a knockout is the standard.

| Teams | Format | Pool matches | Knockout matches |
|---|---|---|---|
| 6 | 2 pools of 3, top 2 to semi-finals | 6 | 3 |
| 8 | 2 pools of 4, top 2 to semi-finals | 12 | 3 |
| 12 | 3 pools of 4, top 2 plus 2 best third to quarter-finals | 18 | 7 |
| 16 | 4 pools of 4, top 2 to quarter-finals | 24 | 7 |

The [groups and knockout maker](/tools/groups/) builds the pools and the bracket. Our guide to [group stage plus knockout](/guides/group-stage-and-knockout-planning/) covers the draw and the cross-over.` },
      { h2: "Ranking pool teams", md: `Rank pool teams by match wins first. Volleyball has no draws, so a match win is the clearest unit. If teams are level, use these in order:

1. Result between the tied teams, if two are tied.
2. Set ratio: sets won divided by sets lost, across all pool matches.
3. Point ratio: points scored divided by points conceded.
4. A play-off or a draw of lots.

A set ratio is easier to compare than set difference when teams have played different numbers of sets. Publish the order, as described in [how to write tie-breaker rules](/guides/tournament-tiebreaker-rules-how-to-write/).` },
      { h2: "Court time", md: `A set to 25 points can take 20 to 25 minutes, so a five-set match can take up to two hours with breaks, and a best-of-three can take about 75 minutes. Check the length in practice matches and plan for the longest case.

For 8 teams in two pools of 4, there are 12 pool matches and 3 knockout matches. With best of three and 75-minute slots on two courts, the 12 pool matches need 6 slots, which is 7.5 hours. That is too long for most halls, which is why many events shorten pool matches to a single set to 25, or play two sets.` },
      { h2: "A worked time check", md: `You have a hall for 8 hours with two courts. Take off 1 hour for set-up and 1 for the final and prizes, leaving 6 hours, or 360 minutes. With 45-minute slots, each court plays 8 matches, and two courts play 16.

| Format | Matches | Fits? |
|---|---|---|
| 8 teams, 2 pools of 4 and a knockout | 15 | Yes, with one spare slot |
| 12 teams, 3 pools of 4 and a knockout | 25 | No |
| 9 teams, 3 pools of 3, top 2 plus the 2 best third-placed teams, then a knockout | 16 | Just |

Use the [schedule maker](/tools/schedule/) to check with your real match length.` },
      { h2: "Rules to write", md: `- Match length per stage: sets and the target for each.
- Team size, squad size and substitution limit.
- Warm-up time before each match.
- A team not ready within 10 minutes forfeits the match.
- Ball and net height: state them for age groups.
- Who referees pool matches: neutral referees if you can.
- Protests: in writing before the next match.` },
      { h2: "Common mistakes", md: `- Planning each match for three sets and finding it takes five.
- Not stating the format by stage.
- Leaving tie-breaks until after the pools.
- Booking a hall for the pool matches only, with no time for the knockout.
- Not briefing referees on the format.` },
    ],
    faq: [
      { q: "How is a volleyball match scored?", a: "A match is best of five sets: the first four sets are played to 25 points, and a deciding fifth set to 15, with each set won by two clear points. Local events often shorten this to best of three. Whichever you use, write it in the rules and plan court time for the longest possible match." },
      { q: "How do you break ties in volleyball pools?", a: "Rank by match wins first, then the result between tied teams, then set ratio, then point ratio, and finally a play-off or draw of lots. Volleyball has no draws, so match wins are the clearest unit. Publish the order before the first pool match so there is no argument at the end." },
      { q: "How long does a volleyball match take?", a: "A set to 25 points takes roughly 20 to 25 minutes, so a best-of-five match can take up to two hours and a best-of-three about 75 minutes. Plan for the longest case, test it in a practice match, and shorten pool matches if your hall time is limited." },
    ],
    related: ["group-stage-and-knockout-planning", "tournament-tiebreaker-rules-how-to-write", "five-a-side-football-tournament-format"],
    cta: { label: "Build pools and a knockout", href: "/tools/groups/" },
  },

  {
    slug: "dota-2-tournament-captains-mode-and-series",
    title: "Dota 2 tournament organising: drafting, series length and lobbies",
    seoTitle: "Dota 2 tournament: drafting and series length",
    description: "How to organise a Dota 2 tournament: 5v5 team brackets, captains mode drafting, best-of series, lobby setup, pauses, remakes and rules to write down for referees.",
    tag: "Game guide",
    answer: "Dota 2 is 5v5, so run it as a bracket with best-of-3 series, usually double elimination. Choose a drafting mode, often captains mode, create a private lobby for each game, and write rules for pauses, disconnects and remakes, because games are long and problems are common.",
    intro: "Dota 2 games are long, complex and full of ways to dispute a result: a disconnect at minute twenty, an accidental pause, a draft mistake. A tournament for it succeeds or fails on its rulebook. The bracket is the easy part.",
    sections: [
      { h2: "Format and series length", md: `Dota 2 is a five-versus-five game, and a single game can last well over half an hour. That makes series length a time decision before it is a fairness decision.

| Stage | Series |
|---|---|
| Early rounds | Best of 1 or best of 3 |
| Later rounds | Best of 3 |
| Grand final | Best of 5 |

Use [double elimination](/guides/double-elimination-bracket-explained/) so teams get a second chance after one bad game. Plan each match for the longest series, as in the [series length guide](/guides/best-of-1-3-5-series-length-explained/).` },
      { h2: "Pick the drafting mode", md: `Before a game starts, both teams choose heroes in a draft. Several drafting modes exist. A mode where each team has a captain who bans and picks heroes in turn is the one most commonly used in competitive play, which gives the process the same turn-taking structure as a map veto in other games. See the [map veto guide](/guides/valorant-map-veto-explained/) for the idea.

Pick one mode, test it with two teams, and use it in every game. Available modes can change with updates, so check the game's current options before the event.` },
      { h2: "Lobby setup", md: `Create a private lobby for each game, name it with the match number, and share the details with the two captains. Set the server region, the drafting mode and spectator access in the lobby settings. Decide who creates the lobby, and who is the back-up if that person is late.

Add a referee as a spectator to every game if you can, so that disconnects and pauses are seen by someone neutral.` },
      { h2: "Pauses, disconnects and remakes", md: `Write each of these in numbers:

- Pauses: how many each team may use per game, and how long each lasts.
- Disconnect: how long the team has to reconnect before the game is lost or continues short.
- Remake: when a game may be restarted, for example in the first minutes if a technical fault stops play. Name who decides.
- Accidental draft error: whether the draft stands once confirmed.

Games are long, so a disconnect late in the game is costly. Choose rules that you can apply without a long argument.` },
      { h2: "Rosters and conduct", md: `Registered rosters are five players plus up to two substitutes, if you allow them. Lock the roster when the bracket is drawn. Write the rule on stand-ins, such as an emergency substitute allowed with the head referee's approval.

For conduct, ban cheating tools and abusive chat with a penalty. The [rules template](/guides/esports-tournament-rules-template/) has wording you can adapt.` },
      { h2: "A sample timeline", md: `For 8 teams in double elimination, there are 14 matches. If a best-of-3 takes about 90 minutes, and you run two matches at once, plan for around 10 hours of matches. That is why many organisers use best of 1 early, run the event over two days, or cap the field at 8.

Check the real length of a game in a test match, then cut the format to fit. The [schedule maker](/tools/schedule/) helps you test the numbers.` },
      { h2: "Common mistakes", md: `- Scheduling a best-of-3 as if it were an hour.
- Not testing the lobby and draft with two teams.
- Leaving pauses and disconnects unwritten.
- Allowing roster changes between games.
- Running 16 teams in a single day.` },
    ],
    faq: [
      { q: "How do you run a Dota 2 tournament?", a: "Use a double-elimination bracket with best-of-3 series, a drafting mode you have tested, a private lobby for each game and a referee spectating where possible. Write rules for pauses, disconnects and remakes, lock rosters when the bracket is drawn and plan the schedule for long games and the longest possible series." },
      { q: "How long does a Dota 2 tournament take?", a: "A single game can run well over half an hour, so a best-of-3 can take 90 minutes or more. Eight teams in double elimination play 14 matches, which can need around 10 hours of play even with two matches at once. Shorten early series, add a day, or limit the number of teams." },
      { q: "How should I handle disconnects in a Dota 2 match?", a: "Write a rule in numbers: how long a team has to reconnect, how many pauses it may use, and whether the game continues short after the limit. Decide who may call a remake, and when. Because games are long, apply the same rule every time and have a referee watching as a spectator." },
    ],
    related: ["double-elimination-bracket-explained", "best-of-1-3-5-series-length-explained", "valorant-map-veto-explained"],
    cta: { label: "Draw the double elimination bracket", href: "/tools/double-elimination/" },
  },

  {
    slug: "bracket-reset-and-grand-final-explained",
    title: "Bracket reset and grand final: should your double elimination use one?",
    seoTitle: "Bracket reset and grand final explained",
    description: "What a bracket reset is, why double elimination grand finals have one, when to skip it, how it changes the schedule and how to explain it to finalists fairly.",
    tag: "Format guide",
    answer: "A bracket reset is a second grand final match played when the team from the losers bracket beats the unbeaten team from the winners bracket. Both then have one loss, so a second match decides the title. Use it when you can spare the time, and announce it before the event.",
    intro: "The grand final of a double elimination bracket contains a puzzle that confuses many players and some organisers. One finalist has not lost yet, and the other has lost once. If the one-loss team wins, who is champion? The answer is the bracket reset, and it deserves a few minutes of explanation.",
    sections: [
      { h2: "The puzzle", md: `In double elimination, a team is out after its second loss. The winners bracket champion has no losses. The losers bracket champion has one loss, because that is how it ended up in the losers bracket.

If they meet in the grand final and the losers bracket champion wins, both teams now have one loss. Under the rule that you are out after two losses, nobody is out, and the match did not settle the title.` },
      { h2: "How the reset works", md: `The bracket reset is the answer: a second grand final match.

| Grand final result | What happens |
|---|---|
| Winners bracket team wins match 1 | Event over; that team is champion |
| Losers bracket team wins match 1 | Both teams have one loss; match 2 decides |

The team from the winners bracket therefore has an advantage: it only has to win once, while the other side has to win twice. That is the reward for staying unbeaten. Our guide to [double elimination](/guides/double-elimination-bracket-explained/) shows where the grand final sits.` },
      { h2: "Series in the grand final", md: `If your matches are series, as in best of 3 or best of 5, the reset applies to the series. If the losers bracket team wins the first series, a second full series is played.

That can double the length of the final. Check that your schedule can take it, using the longest case: two best-of-5 series in the final. See [series length](/guides/best-of-1-3-5-series-length-explained/) for how to plan this.` },
      { h2: "When to use a reset", md: `Use it when:

- The event has meaningful prizes, and fairness in the final matters.
- Your players know double elimination from other events and expect it.
- You have time for a possible extra match.

Skip it when time is tight, in a casual or small event, or in a format where a single grand final is the stated rule. If you skip it, say so clearly. The winners bracket team then needs only to win once, and the losers bracket team needs to win once as well, which favours the losers bracket slightly.` },
      { h2: "How to explain it to finalists", md: `Tell the two finalists before the final starts, not after. A short script works:

"This is a double elimination final. [Team A] came through the winners bracket and has not lost. [Team B] came through the losers bracket and has lost once. If [Team A] wins, the event is over. If [Team B] wins, we play one more match to decide the title."

Print the rule in the rules and on the bracket, drawn with the [double elimination tool](/tools/double-elimination/).` },
      { h2: "Common mistakes", md: `- Not mentioning the reset until the final.
- Forgetting to book time for a possible second match.
- Drawing the bracket without a second final slot.
- Calling the final over after one result when the rules say reset.
- Applying the reset to some events and not others without saying.` },
    ],
    faq: [
      { q: "What is a bracket reset in a final?", a: "It is a second grand final match played when the team from the losers bracket beats the unbeaten winners bracket team in the first one. Both teams then have one loss, so a second match decides the champion. If the winners bracket team wins the first match, the event ends." },
      { q: "Do I have to use a bracket reset?", a: "No. It is a choice, and many casual events skip it to save time. If you skip it, the grand final is a single match or series, and you should say so clearly in the rules. Use a reset when the prize is significant and you can fit a possible extra match." },
      { q: "How does a bracket reset affect the schedule?", a: "It adds a possible extra match or series to the end of the event, so plan the final slot for two. If your matches are best-of-5 series, the final can run twice as long. Leave time at the end, and warn the finalists before the final begins." },
    ],
    related: ["double-elimination-bracket-explained", "best-of-1-3-5-series-length-explained", "tournament-bracket-byes-explained"],
    cta: { label: "Draw the bracket with the reset final", href: "/tools/double-elimination/" },
  },

  {
    slug: "kabaddi-tournament-organise",
    title: "How to organise a kabaddi tournament: format, teams and match day",
    seoTitle: "How to organise a kabaddi tournament",
    description: "How to run a kabaddi tournament: league or knockout format, team and squad rules, match timing, referees, a points table, safety and a one-day plan.",
    tag: "Sport guide",
    answer: "Choose a format that fits your court time, usually pools then a knockout. Fix team size, squad size, match length, referees and a points scheme in a short rulebook, plan court time from the number of matches, and sort out first aid and a safe playing surface before the day.",
    intro: "Kabaddi tournaments are common at colleges, villages and clubs across India, and the organisers are usually volunteers. The rules of the sport are well known to the players, which helps. What you need to supply is the structure: who plays whom, when, on what, and who decides.",
    sections: [
      { h2: "Agree which rules apply", md: `Kabaddi is played under different rule sets: standard rules, a professional league's variant, and local versions. The sport's governing body publishes its rules, and local associations may add their own.

Choose which set your tournament uses, say so on the poster and the registration form, and give captains a copy. Do not leave it to each referee's habit. If players from different regions meet, differences will show up quickly.` },
      { h2: "Format and the number of matches", md: `Use the same planning as any team sport. Count the matches and the court time.

| Teams | Format | Matches |
|---|---|---|
| 4 to 6 | Single round robin | 6 to 15 |
| 8 | 2 pools of 4, then semi-finals and final | 12 + 3 = 15 |
| 8 to 16 | Single elimination | 7 to 15 |
| 12 to 16 | Pools, then knockout | 25 to 31 |

Use the [groups and knockout maker](/tools/groups/) or the [bracket maker](/tools/brackets/). A knockout is the fastest, and a pool stage gives teams more matches for the entry fee.` },
      { h2: "Teams, squads and eligibility", md: `Set the number of players on the court, the squad size, and the substitution rule. Add the eligibility rule for a college or club event, and what proof is needed.

Collect the squad list in advance. The [registration form tool](/tools/registration/) makes a form for names, ages, a captain and a contact number, and the [ID card maker](/tools/id-cards/) can produce player cards. For age groups and weight categories, state them clearly and check at weigh-in or registration.` },
      { h2: "Match length and court time", md: `Decide match length, break length and time-out rules before the day, and use the real numbers to plan. A match slot should include the match, the break, the change of ends and the gap before the next match.

Work out how many matches you can fit on the court from the hours you have. The [schedule maker](/tools/schedule/) helps you check the numbers. Leave time for the final and the prize ceremony.` },
      { h2: "Referees and the table", md: `Appoint qualified referees, and a scorer and timekeeper for each match. If your event is small, one person can score and keep time. Brief them on the rule set you chose, and put one named person in charge of disputes, as in [referee roles and duties](/guides/tournament-referee-roles-and-duties/).

Keep a points table: typically points for a win, a tie and a loss, plus score difference as a tie-break. Publish the scheme first. See [how to write tie-breaker rules](/guides/tournament-tiebreaker-rules-how-to-write/).` },
      { h2: "Safety and the playing surface", md: `Kabaddi is a contact sport. Check the playing surface for hard or uneven areas, and use proper mats where you can. Have first aid on site, and a plan for an injury, including a nearby hospital and a person with a phone.

Set a rule on players who are injured: a substitute may replace them. Write the safety plan on one page and give it to the head referee.` },
      { h2: "Common mistakes", md: `- Not stating which rule set applies.
- Planning too many matches for one court.
- No first aid or injury plan.
- Letting each referee interpret a different rule set.
- Forgetting the squad list and eligibility check.` },
    ],
    faq: [
      { q: "What format should a kabaddi tournament use?", a: "For 4 to 6 teams, a single round robin. For 8 to 16 teams, pools followed by a knockout, or a straight knockout if court time is short. Count the matches and the court time before you choose, and publish the format, the points scheme and the tie-break order with the schedule." },
      { q: "Which rules apply to a kabaddi tournament?", a: "Kabaddi has several rule sets, including a standard set, a professional league's variant and local versions. The organiser should choose one, say so on the poster and registration form, and give captains and referees a copy. Do not let different referees use different rules in the same event." },
      { q: "What safety arrangements does a kabaddi tournament need?", a: "A playing surface that is checked for hard or uneven areas, mats where possible, first aid on site, a named person to manage an injury and a plan for reaching a hospital. Write a short safety plan, brief the head referee, and allow substitutes for injured players." },
    ],
    related: ["group-stage-and-knockout-planning", "tournament-referee-roles-and-duties", "tournament-tiebreaker-rules-how-to-write"],
    cta: { label: "Build the groups and knockout", href: "/tools/groups/" },
  },

  {
    slug: "apex-legends-tournament-points-and-lobbies",
    title: "Apex Legends tournament: points, lobbies and match rules",
    seoTitle: "Apex Legends tournament points and lobbies",
    description: "How to organise an Apex Legends tournament: squad registration, lobby setup, a placement and kill points table, tie-breaks, results and rules to write down.",
    tag: "Game guide",
    answer: "Apex Legends tournaments are points events: squads play several matches in a lobby, and a table that adds placement and kills ranks them. Publish the table, register squads, set up lobbies for each round, write rules for disconnects and cheating, and verify results from screenshots.",
    intro: "Apex is a squad-based battle royale, so a tournament is a points table, not a bracket. Everything flows from the scoring: how much a win is worth, how much a kill is worth, and what happens in a tie. Get that right and the rest is housekeeping.",
    sections: [
      { h2: "Format: a points event", md: `Many squads share one lobby, so the question is not who beat whom but who scored most across several matches. Choose how many matches you will play, usually 4 to 6, and add up each squad's points.

For a large field, split squads into lobbies for early rounds and take the top squads into a final lobby. Our [points table guide](/guides/points-table/) explains how, and the [points table calculator](/tools/points-table/) does the sums.` },
      { h2: "Design the scoring table", md: `Choose a table that balances placement and kills.

| Placement | Points (example) |
|---|---|
| 1st | 12 |
| 2nd | 9 |
| 3rd | 7 |
| 4th | 6 |
| 5th | 5 |
| 6th to 10th | 4 to 1 |
| Lower | 0 |

Add 1 point per kill. This is an example, not an official scale. A table that pays little for kills rewards careful play, and one that pays a lot rewards fighting. Pick the style you want, publish it, and keep it the same for every match.` },
      { h2: "Squads and registration", md: `Register squads with a captain, a roster and in-game names. Decide the squad size the game requires for your mode, and the substitute rule. Lock rosters at the start of the event.

Collect entries with the [registration form tool](/tools/registration/). Confirm each squad in writing, with the schedule and the rules attached.` },
      { h2: "Lobby setup and schedule", md: `Create the lobbies, share the details with captains shortly before each match, and set a start time with a short grace period. Game features for custom lobbies change with updates, so test the setup in a practice match the day before.

For several lobbies, publish which squads are in which. Use the [schedule maker](/tools/schedule/) to plan matches, breaks and the final.` },
      { h2: "Proof and tie-breaks", md: `After each match, each squad sends a screenshot of its placement and kills. A referee checks them against the lobby, and enters the points. Update the standings on a [display screen](/tools/display-screen/) between matches.

For ties, use a published order: highest placement points, then most kills, then best single-match placement, then a play-off if first place is tied.` },
      { h2: "A worked scoring example", md: `Two squads play three matches with the example table and 1 point per kill.

| Squad | Match 1 | Match 2 | Match 3 | Total |
|---|---|---|---|---|
| Alpha | 1st with 4 kills = 16 | 5th with 2 kills = 7 | 2nd with 6 kills = 15 | 38 |
| Bravo | 3rd with 3 kills = 10 | 1st with 5 kills = 17 | 4th with 1 kill = 7 | 34 |

Alpha leads by 4 points even though Bravo won a match, because Alpha was consistent. If you want wins to count for more, raise the first-place points in the table before the event, not after.` },
      { h2: "Rules to write", md: `- Rosters are locked; substitutes are allowed only with referee approval.
- A squad not in the lobby by the start time misses that match.
- Teaming with another squad loses the points of that match.
- Hacks and modified clients mean removal.
- A disconnected squad keeps the points it earned; there is no replay.
- Results are final after the protest window, as in the [dispute process guide](/guides/tournament-dispute-process-protest-window/).` },
      { h2: "Common mistakes", md: `- Publishing the points table late.
- Changing the table mid-event.
- Accepting results with no screenshot.
- Not writing a teaming rule.
- Running too many matches for the evening.` },
    ],
    faq: [
      { q: "How is an Apex Legends tournament scored?", a: "Add placement points and kill points for every match, and rank squads by the total. Publish a table that pays more for higher placement, add a point per kill, and write a tie-break such as most kills or the best single-match placement. Keep the table the same for every match." },
      { q: "How many matches should an Apex tournament have?", a: "Four to six matches fit an evening, with short breaks. More matches make the ranking more reliable but cost time. With many squads, use qualifier lobbies for early rounds and a final lobby for the best squads. Decide the number and publish it before registration closes." },
      { q: "How do I verify results in an Apex tournament?", a: "Ask each squad to send a screenshot of its match result showing placement and kills, and have a referee check it against the lobby, ideally as a spectator. Enter the points yourself rather than accepting a number from a squad, and keep the screenshots until the protest window has ended." },
    ],
    related: ["points-table", "run-a-custom-room-tournament", "tournament-dispute-process-protest-window"],
    cta: { label: "Calculate your points table", href: "/tools/points-table/" },
  },

  {
    slug: "tournament-prize-pool-and-payout-split",
    title: "Tournament prize pool and payout split: how to plan it honestly",
    seoTitle: "Tournament prize pool and payout split",
    description: "How to plan a tournament prize pool: where the money comes from, how to split it between places, an example with numbers, trust rules and what to check first.",
    tag: "Organiser guide",
    answer: "Plan the prize pool from money you have secured, from entry fees and sponsors, not from hope. Split it by place using a simple scheme, publish it before registration, and pay promptly after the event. Check local rules and the game publisher's conditions before you advertise cash prizes.",
    intro: "Prizes bring in teams, and a broken prize promise ends your tournament series. The safest way to run a prize pool is the dullest: count the money you actually hold, split it simply, say so in public and pay on time. Here is how to plan one.",
    sections: [
      { h2: "Start with money you have", md: `A prize pool comes from three places: entry fees, sponsors and your own contribution. Only count what has been paid or formally agreed.

A sponsor who says "maybe" is not in the pool. Write the pool as a fixed amount on the poster only when it is secured. If you want to advertise a bigger number, say how it works: "Prize pool grows with every team that enters, up to a maximum of..." and be exact.` },
      { h2: "Budget first, prize second", md: `Do not give away the whole pool at the start. Subtract the costs the event must cover: venue, printing, referees, refreshments, trophies and certificates, and a small reserve for surprises.

Whatever is left is the prize pool. The [campus tournament guide](/guides/run-a-campus-tournament/) shows what to count, and the [plan my tournament tool](/tools/plan/) can help you estimate. A tournament that runs a deficit cannot pay the prizes it promised.` },
      { h2: "Splitting the pool", md: `Choose how many places are paid. Fewer places mean bigger prizes and more tension, and more places keep more teams engaged.

| Places paid | Example split of a ₹10,000 pool |
|---|---|
| Top 3 | ₹5,000, ₹3,000, ₹2,000 |
| Top 4 | ₹4,000, ₹3,000, ₹2,000, ₹1,000 |
| Winner takes most | ₹7,000, ₹3,000 |

The numbers are examples. Use simple amounts, make sure they add up to the pool exactly, and print them on the rules and the poster. For a team event, state whether the prize is paid per team or per player.` },
      { h2: "Rules and approvals to check", md: `Entry fees and cash prizes can be treated differently in different places and for different games. Before you advertise, check:

- Whether your college, venue or local rules allow entry fees and cash prizes.
- The game publisher's conditions for tournaments. Publishers set their own terms, and they change.
- Whether tax or reporting rules apply to the amounts you plan to pay.

This is not legal advice. For a large pool, ask someone qualified, and keep records of what you collected and paid.` },
      { h2: "Pay promptly, and keep records", md: `Announce when and how winners will be paid, then keep to the date. A common promise is within seven days of the event, with proof of payment sent to the team.

Keep a one-page record: entry fees collected, sponsor payments, costs paid, prizes paid with dates. If anyone asks, you can show it. This also makes the next sponsor easier to win, with the report described in the [sponsor pitch guide](/guides/sponsor-pitch/).` },
      { h2: "Non-cash prizes", md: `If you cannot fund a cash pool, use certificates, trophies, merchandise or sponsor products. Make a certificate with the [certificate maker](/tools/certificates/) and write the wording using the [certificate wording guide](/guides/certificate-wording/).

Say exactly what the prize is. "Gaming accessories" is vague. "A keyboard and a mouse from our sponsor" is clear.` },
      { h2: "Common mistakes", md: `- Advertising a pool you have not secured.
- Giving away the whole pool before counting costs.
- Splits that do not add up.
- Paying late, or not at all.
- Not checking the publisher's conditions for prizes.` },
    ],
    faq: [
      { q: "How do I decide the prize pool for a tournament?", a: "Count the money you hold from entry fees, sponsors and your own contribution, subtract the event's costs and a small reserve, and the remainder is the pool. Only count money that is paid or formally agreed. Publish the amount and the split before registration opens, and pay winners promptly." },
      { q: "How should a prize pool be split?", a: "Pay a few places, commonly the top three or four, with simple amounts that add up to the pool exactly. For example, a ₹10,000 pool can pay ₹5,000, ₹3,000 and ₹2,000. State whether prizes are per team or per player, and print the split on the poster and in the rules." },
      { q: "Do I need to check any rules before offering cash prizes?", a: "Yes. Check whether your college, venue or local rules allow entry fees and cash prizes, read the game publisher's conditions for tournaments, and find out whether tax or reporting rules apply. This is not legal advice, so for a large pool ask someone qualified and keep records of what you collect and pay." },
    ],
    related: ["sponsor-pitch", "run-a-campus-tournament", "certificate-wording"],
    cta: { label: "Plan your tournament budget", href: "/tools/plan/" },
  },

  {
    slug: "tennis-ball-cricket-tournament-organise",
    title: "Tennis ball cricket tournament: how to organise a local league",
    seoTitle: "Tennis ball cricket tournament: organise a league",
    description: "How to organise a tennis ball cricket tournament: teams, overs, ground and pitch, umpires, scoring, fixtures, points, prizes and a rulebook for a local league.",
    tag: "Sport guide",
    answer: "A tennis ball cricket tournament needs teams, a ground, umpires, a scorer, fixed overs, a fixture list, a points scheme and a short rulebook. Plan the number of matches against the daylight and grounds you have, and write down the local rules that differ from standard cricket.",
    intro: "Tennis ball cricket is the most played form of the game in many neighbourhoods, and its tournaments are often the biggest local events of the season. They are also often the most chaotic, because the rules live in people's heads. Writing them down is the best change you can make.",
    sections: [
      { h2: "Fix the basics", md: `Decide these before you take entries:

- Overs per innings: for example 6, 8, 10 or 12, depending on daylight and how many matches you need.
- Players per side and squad size.
- Ball and pitch: the type of tennis ball, any tape, and the pitch length.
- The boundary: how it is marked, and what counts as 4 and 6.
- Bowling limit per bowler, such as one fifth of the innings.

Put them on one page, and use the same ones in every match.` },
      { h2: "Choose the format and the fixtures", md: `Count the matches the ground and daylight can take. A match of 8 overs a side with changeover might need 60 minutes, so a ground used for 8 hours fits about 8 matches.

| Teams | Format | Matches |
|---|---|---|
| 8 | Single elimination | 7 |
| 8 | 2 groups of 4, then semi-finals and final | 15 |
| 16 | Single elimination | 15 |

Use the [bracket maker](/tools/brackets/) or the [groups and knockout maker](/tools/groups/) to draw the event, and the [round robin generator](/tools/round-robin/) for league fixtures. Plan across the days you have.` },
      { h2: "Umpires, scorers and fair play", md: `Appoint two umpires per match if you can, who do not belong to either team. A scorer records runs, wickets and overs, and a timekeeper tracks the slot.

Write the rules for common disputes: wide and no-ball, caught off a boundary line, run-outs, and handling a lost ball. A short rule list helps umpires decide quickly. Use the [cricket rules template](/guides/cricket-tournament-rules-template/) for the structure.` },
      { h2: "Points, ties and net run rate", md: `A common scheme is 2 points for a win and 1 for a tie or no result. Use net run rate to separate teams on equal points, as in [net run rate explained](/guides/cricket-net-run-rate-explained/), and a super over for a tied knockout match.

Print the points table and update it after every match, so teams know where they stand. The [cricket league points table guide](/guides/cricket-league-points-table/) shows the columns.` },
      { h2: "Registration, fees and prizes", md: `Build a registration form with team name, captain, contact, squad names and ages. The [registration form tool](/tools/registration/) does this, and the [cricket registration form guide](/guides/cricket-tournament-registration-form/) lists the fields.

Decide the entry fee and the prizes before you advertise. See [prize pool and payout split](/guides/tournament-prize-pool-and-payout-split/) for how to plan them honestly. Make certificates with the [certificate maker](/tools/certificates/).` },
      { h2: "Match day", md: `Arrive early and check the pitch, the boundary and the ball. Start on time, and keep each match to its slot. Post the fixtures where captains can see them, and the results after each match.

Have a plan for rain: a covered area, a reserve day or a shortened format. Our [cricket rules template](/guides/cricket-tournament-rules-template/) shows how to write the rain rule.` },
      { h2: "Common mistakes", md: `- Rules that exist only in people's heads.
- Too many matches for the daylight.
- Letting teams supply their own umpires without a rule for disputes.
- No rain plan.
- Not publishing the points table after each match.` },
    ],
    faq: [
      { q: "How many overs should a tennis ball cricket match have?", a: "It depends on daylight and how many matches you need. Local tournaments commonly use 6 to 12 overs per side. Choose a length so that every match fits its slot with the changeover, use the same number for the whole event, and print it in the rules before registration closes." },
      { q: "How do I organise a tennis ball cricket tournament?", a: "Fix the overs, team size and local rules, choose a format that fits your daylight and ground, register teams with a squad list, appoint neutral umpires and a scorer, publish fixtures and a points table, and plan for rain. Write all of it on one page and share it before the first match." },
      { q: "What is the best format for a local cricket tournament?", a: "A knockout is quickest: 8 teams need 7 matches. Groups followed by a knockout give every team more matches: 8 teams in two groups need 15. A round robin suits 4 to 6 teams. Count the matches against your daylight and grounds before you choose." },
    ],
    related: ["cricket-tournament-rules-template", "cricket-tournament-registration-form", "cricket-net-run-rate-explained"],
    cta: { label: "Build the registration form", href: "/tools/registration/" },
  },

  {
    slug: "efootball-tournament-organise",
    title: "How to organise an eFootball tournament: brackets, settings and proof",
    seoTitle: "How to organise an eFootball tournament",
    description: "How to run an eFootball tournament: one-versus-one brackets or leagues, match settings, who hosts, how to prove results, disconnect rules and a simple schedule.",
    tag: "Game guide",
    answer: "eFootball is one versus one, so run a bracket or a league. Fix the match settings and who hosts, play best of 1 early and best of 3 later, require screenshots of the final score, and write a disconnect rule before registration opens.",
    intro: "Football games are among the easiest esports tournaments to run, because everyone understands the result. They are also easy to dispute: one player says the score was 2-1, the other says 2-2, and a connection dropped in the 80th minute. A short rulebook handles it.",
    sections: [
      { h2: "Format", md: `With one player against one, pick a bracket or a league.

| Players | Format |
|---|---|
| 4 to 8 | Round robin |
| 8 to 16 | Single or double elimination |
| 16 to 32 | Groups, then a knockout |

A round robin gives every player several matches, which is good for a casual event. The [round robin generator](/tools/round-robin/) writes the fixtures, and the [bracket maker](/tools/brackets/) draws a knockout. For a league table, use the same points as football: see [football points and tie-breakers](/guides/football-points-system-and-tiebreakers/).` },
      { h2: "Match settings", md: `Decide the settings once and use them everywhere: match length, difficulty or competition mode, team strength limits and any rule about team choice.

Settings can change with game updates, so test a match with two players the day before. Write the settings on the rules page, so that no player can say they were not told.` },
      { h2: "Who hosts, and how players meet", md: `Each match needs one player to host a room or send an invitation. Decide how: the higher seed hosts, or the first-named player in the fixture. Give the host a time limit to send the invite, such as 5 minutes after the scheduled time.

Run the event in a group chat with the bracket pinned. Our guide on [Clash Royale tournaments](/guides/clash-royale-tournament-how-to-run/) uses the same approach for other one-versus-one games.` },
      { h2: "Proving the result", md: `Both players send a screenshot of the full-time score, showing both names. If they disagree, ask for a replay of the highlights, or have the pair replay with a referee watching on a call.

Write a rule that a player who refuses to send proof forfeits. Record every result in one place, kept by the organiser and not the players.` },
      { h2: "Disconnects and extra time", md: `Choose a rule and write it down:

- A disconnect before the 60th minute, or any time before the first half ends, means a replay.
- A disconnect later means the score stands, or the player who disconnects loses.
- A player who disconnects twice in an event is out.

For a knockout match that is level at full time, decide whether it goes to extra time and penalties in the game, or to a replay. The numbers above are examples, so pick your own and publish them.` },
      { h2: "A simple schedule", md: `For 16 players in single elimination, there are 15 matches over four rounds. If each match takes 30 minutes including setup, and you let pairs play in parallel, an evening is enough.

Post each round's pairings as soon as the previous round ends, with a deadline for each match. Use the [schedule maker](/tools/schedule/) if you need fixed times.` },
      { h2: "Common mistakes", md: `- Not fixing the match settings.
- Accepting a result with no screenshot.
- Leaving disconnect rules unwritten.
- Letting pairs agree their own times with no deadline.
- Using a format that needs more matches than you have time for.` },
    ],
    faq: [
      { q: "How do you run an eFootball tournament?", a: "Choose a bracket or league for one-versus-one play, fix the match settings and who hosts each match, play best of 1 early and best of 3 later, require a screenshot of the final score from both players and write a rule for disconnects. Publish the bracket and the rules before registration closes." },
      { q: "How do you prove the score in an online football game?", a: "Ask both players to send a screenshot of the full-time score showing both names, and keep results in one place. If the screenshots disagree, ask for a replay of the match or have the pair replay on a call with a referee. A player who will not send proof should forfeit, per the rules." },
      { q: "What if a player disconnects in the match?", a: "Write the rule beforehand. A common approach is a replay if the disconnect happens early, and the score standing if it happens late, with a player who disconnects repeatedly being removed. Choose the cut-off yourself, publish it, and apply it to every match in the event." },
    ],
    related: ["clash-royale-tournament-how-to-run", "football-points-system-and-tiebreakers", "round-robin-single-double-and-tiebreaks"],
    cta: { label: "Make the bracket", href: "/tools/brackets/" },
  },

  {
    slug: "how-to-announce-a-tournament",
    title: "How to announce a tournament: the message, the timing and the channels",
    seoTitle: "How to announce a tournament",
    description: "How to announce a tournament so teams sign up: what to say, when to post, which channels to use, a message template and a countdown plan until registration closes.",
    tag: "Poster guide",
    answer: "Announce with one clear message: what, when, where, who can enter, the cost and prize, how to register and the last date. Post the poster in the channels your players already use, repeat it on a schedule until registration closes, and answer questions in one place.",
    intro: "A great poster does nothing if nobody sees it. Announcing a tournament is a small campaign: one message, sent to the right places, repeated at the right times. You do not need a marketing budget. You need a plan and a template.",
    sections: [
      { h2: "Write the message once", md: `Use the same message everywhere, so questions are the same too. The five things people need:

1. What it is: name, sport or game, format.
2. When and where: date, time, venue or platform.
3. Who can enter: team size, age group, college or open.
4. What it costs and what you can win.
5. How to register, and the last date.

Put a registration link and a contact. Make the poster with the [poster maker](/tools/poster/), and see [poster sizes](/guides/tournament-poster-sizes-whatsapp-instagram-print/) for the shapes.` },
      { h2: "A message to copy", md: `"[Tournament name]: [game or sport], [format]. [Date], [time], [venue or platform]. Open to [who]. Entry [fee], prize [prize]. Register at [link] before [date]. Questions: [name, contact]."

Keep it short enough to read without tapping "read more". The details go on the registration page.` },
      { h2: "Where to post", md: `Post where your players already are:

| Channel | Best for |
|---|---|
| WhatsApp groups | Colleges, clubs and friend groups |
| Instagram stories and feed | Wider reach and a visual poster |
| Discord servers | Game communities |
| Notice boards | Colleges and clubs |
| Local community pages | City events |

Ask captains and club presidents to forward it to their groups. A message that arrives from a known person is read more than one that arrives from an unknown account.` },
      { h2: "A countdown plan", md: `Repeat the announcement on a schedule, not once.

| When | What to post |
|---|---|
| 4 weeks before | Launch: poster and registration link |
| 3 weeks before | Reminder, with one detail such as the prize |
| 2 weeks before | "Teams registered so far", real numbers only |
| 1 week before | Last date approaching |
| 2 days before | Final reminder |
| Day after closing | Confirmed teams and the schedule |

Only post true numbers. A fake "only 3 slots left" costs trust the first time anyone checks.` },
      { h2: "Handle questions in one place", md: `Choose one place for questions, such as a group chat or a contact number, and put it on the poster. Answer questions quickly. If you answer one person privately and others publicly, you will give different answers.

A short list of frequently asked questions on the registration page, built with the [registration form tool](/tools/registration/), removes most repeats.` },
      { h2: "A short checklist before you post", md: `1. The poster is checked on two phones, and the date and weekday agree.
2. The registration link opens and the form works on a phone.
3. The QR code scans from a printed copy.
4. One named person answers questions, and the contact number is on the poster.
5. The closing date and the first match date are both written clearly.

Do this the day before the launch. Ten minutes of checking saves a week of corrections.` },
      { h2: "Common mistakes", md: `- Posting once and hoping.
- Using a different message in each channel.
- Leaving out the last registration date.
- No place for questions.
- Posting made-up numbers of teams or slots.` },
    ],
    faq: [
      { q: "How do I announce a tournament?", a: "Write one message with the name, the sport or game, the date and venue, who can enter, the cost and prize, a registration link and the last date. Post it with the poster in the channels your players already use, repeat it on a schedule until registration closes, and answer questions in one place." },
      { q: "When should I start announcing a tournament?", a: "About four weeks before the event is a sensible start for a local tournament, with reminders at three weeks, two weeks, one week and two days. Give teams enough time to form a squad and pay, and close registration a few days before the event so you can plan." },
      { q: "Where should I post my tournament poster?", a: "Where your players already spend time: WhatsApp groups for colleges and clubs, Instagram for wider reach, Discord servers for game communities, and notice boards on campus. Ask captains and club presidents to forward it, since a message from a known person gets read more than one from a stranger." },
    ],
    related: ["football-tournament-poster-ideas", "tournament-poster-sizes-whatsapp-instagram-print", "how-to-name-your-tournament"],
    cta: { label: "Make your poster", href: "/tools/poster/" },
  },
];
