import type { Draft } from "./types";
import { FACTS as F } from "./facts";

/** Posts 30 to 39. */
export const BATCH_04: Draft[] = [
  {
    slug: "pubg-mobile-tournament-rules-for-organisers",
    title: "PUBG Mobile tournament rules: what organisers should write down",
    seoTitle: "PUBG Mobile tournament rules for organisers",
    description: "The rules a PUBG Mobile tournament needs: squad rosters, custom room setup, scoring, teaming, hacks, disconnects, proof of results and a short rulebook to copy.",
    tag: "Game guide",
    answer: "A PUBG Mobile tournament needs a rulebook covering squad rosters and substitutes, the match count and scoring table, how custom rooms are shared, bans on hacks and teaming, a disconnect rule and a way to prove results. Publish it before registration closes and apply it equally.",
    intro: "PUBG Mobile tournaments run on the same pattern as other battle royale events: many squads in one lobby, several matches, a points table. What makes or breaks them is the rulebook. Players will test every gap in it, usually in the final match.",
    sections: [
      { h2: "The match you are organising", md: `${F.pubgm.text}

For tournaments, the usual format is squads in a custom lobby, with a fixed number of matches and a points table that adds placement and eliminations. Game modes and room options change with updates, so confirm them in a test match before registration opens.` },
      { h2: "Rosters and substitutes", md: `State the squad size you require and how many substitutes a team may register. Lock rosters when registration closes, and say whether a substitute may replace a player between matches.

Ask each team to supply in-game names and IDs for every player, so you can check the lobby against the roster. The [registration form tool](/tools/registration/) collects this in one page.` },
      { h2: "Points and match count", md: `Choose a points scale that rewards both survival and eliminations, and write it in the rules.

| Placement | Points (example) |
|---|---|
| 1st | 15 |
| 2nd | 12 |
| 3rd | 10 |
| 4th | 8 |
| 5th to 8th | 6 to 3 |
| 9th to 12th | 2 to 1 |

Add 1 point per elimination. This is an example scale, not an official one. Our [points table guide](/guides/points-table/) explains how to choose a balance and the [points table calculator](/tools/points-table/) applies it. Choose 4 to 6 matches for a one-evening event, and keep the same scale throughout.` },
      { h2: "Custom room rules", md: `- Room details go only to registered captains, shortly before the match.
- Teams join in the order and by the time you publish, or forfeit that match.
- Observers or referees watch the lobby and record violations.
- Each team sends a screenshot of its result for the match.

Our [custom room guide](/guides/pubg-mobile-custom-room-results/) shows how to collect and check results, and the [BGMI custom room guide](/guides/bgmi-custom-room-tournament/) covers the setup for the related game.` },
      { h2: "Cheating, teaming and conduct", md: `Write what is banned and what the penalty is:

- Hacks, modified clients and unfair tools: removal from the event.
- Teaming with another squad: loss of that match's points, and removal for repeat cases.
- Abuse in chat: a warning, then removal.
- Stream sniping, if the event is broadcast: define it and the penalty.

Say who decides, and how a team can appeal. The [tournament rules template](/guides/esports-tournament-rules-template/) has the wording for conduct and disputes.` },
      { h2: "Disconnects and technical problems", md: `A disconnect is the most common dispute. Choose a rule and do not bend it:

- A team that disconnects keeps what it has earned. There is no replay.
- A team may report a server-wide problem to the organiser, who decides if a match is replayed.
- A team that cannot join because of its own network misses the match.

Replays are rare and only for problems that affected all teams.` },
      { h2: "Common mistakes", md: `- No roster lock, so teams swap players between matches.
- Sharing room details in a public group.
- Changing the points scale after the first match.
- Allowing results without screenshots.
- Writing no rule for disconnects.` },
    ],
    faq: [
      { q: "What rules does a PUBG Mobile tournament need?", a: "Roster and substitute limits, a locked line-up, the match count and points table, how room details are shared, bans on hacks and teaming with penalties, a disconnect rule, and proof of results by screenshot. Put them on one page and publish them before registration closes so that every team plays under the same terms." },
      { q: "How do you score a PUBG Mobile tournament?", a: "Add placement points and elimination points for every match, and rank teams by the total. Use a published table that pays more for higher placement, add one point per elimination, and write a tie-break such as best single-match placement. Do not change the scale during the event." },
      { q: "What if a team disconnects during a match?", a: "The common rule is that the team keeps the points it earned and there is no replay, because replays are unfair to the other teams. Write this in advance, and allow a replay only for a problem that affected all teams, which the organiser decides." },
    ],
    related: ["pubg-mobile-custom-room-results", "points-table", "esports-tournament-rules-template"],
    cta: { label: "Calculate the points table", href: "/tools/points-table/" },
  },

  {
    slug: "online-vs-lan-tournament-which-to-run",
    title: "Online or LAN tournament: which should you run?",
    seoTitle: "Online or LAN tournament: which should you run?",
    description: "Online or LAN: compare cost, setup, cheating risk, turnout and atmosphere for a gaming tournament, and a checklist to decide which format suits your event.",
    tag: "Organiser guide",
    answer: "Run online if you want low cost, wide reach and quick setup. Run a LAN if you want a stronger atmosphere, easier fairness checks and a livestreamable event, and you can pay for a venue and equipment. Many organisers start online and move to LAN for a final.",
    intro: "The choice between online and LAN shapes your budget, your rules and your risks. Neither is better. It depends on the game, your venue, your players and how much you can control. This guide compares them on the points that matter.",
    sections: [
      { h2: "What each one means", md: `An online tournament has players at home, connected over the internet. A LAN (local area network) event has players in one place, usually on the same network and in the same room.

A hybrid is common: online qualifiers, then a LAN final with the best teams. It gives you reach and an event.` },
      { h2: "A side-by-side comparison", md: `| | Online | LAN |
|---|---|---|
| Cost | Low: no venue, no travel | Higher: venue, power, network, staff |
| Reach | Any player with a connection | Players who can travel |
| Setup time | Days | Weeks |
| Cheating risk | Higher, harder to check | Lower, with referees in the room |
| Atmosphere | Limited | Strong |
| Technical risk | Each player's network | The venue's network and power |
| Livestream | Possible | Easy to produce well |

Neither column wins in every row.` },
      { h2: "Cost and workload", md: `Online costs mostly your time: registration, a bracket, rules, a communication channel and referees on a call. See [how to manage the day online](/guides/run-a-custom-room-tournament/) for a custom-room example.

A LAN adds a venue booking, power and network, equipment or players' own devices, staff, and safety. Our [campus tournament guide](/guides/run-a-campus-tournament/) covers the plan, and the [plan my tournament tool](/tools/plan/) lets you check the numbers.` },
      { h2: "Fairness and cheating", md: `Online events rely on trust, rules and spot checks: screen recordings, a referee watching on a call, and screenshots. They cannot match a room full of referees.

At a LAN, you can see the screens, control the devices and check IDs at the gate. Use the [gate check-in scanner](/tools/check-in/) to confirm who is entering. If you stay online, put a referee in every knockout match and ask for recordings.` },
      { h2: "How to decide", md: `Ask these questions in order:

1. Can your players travel to one place? If not, go online.
2. Do you have a venue, power and a network you can test? If not, go online.
3. Is the prize large enough that fairness checks matter most? Prefer LAN.
4. Do you want an audience or a livestream? Prefer LAN for the final.
5. Is this your first event? Start online, learn, and add a LAN later.` },
      { h2: "A worked example", md: `A college fest expects 16 teams from four cities. Travel is hard, and the fest hall is booked for one afternoon only.

A workable plan: run online qualifiers over two evenings with a bracket and referees on a call, then bring the top 4 teams to the hall for a LAN final. Stream the final. The cost stays low, the semi-finals and final are watched by referees in the room, and the venue time is used only for the matches that matter most.` },
      { h2: "Common mistakes", md: `- Booking a venue before you know how many teams will come.
- Running a LAN without testing the network with the real number of devices.
- Running an online event with no way to check results.
- Mixing both without telling players which rules apply to which stage.
- Forgetting travel and food costs for LAN finalists.` },
    ],
    faq: [
      { q: "Is an online or LAN tournament cheaper?", a: "Online is cheaper, because there is no venue, power, network or staff to pay for, and no travel for players. A LAN adds those costs but gives a better atmosphere and easier fairness checks. Many organisers run online qualifiers and hold a LAN only for the final, which keeps costs down." },
      { q: "How do you reduce cheating in an online tournament?", a: "Use clear rules with penalties, a referee watching each match on a call, screen recordings or screenshots, and a roster check against the lobby. You cannot remove cheating entirely online, so for high-value events, use a LAN for the final, where referees can see every screen." },
      { q: "Can I run a hybrid tournament?", a: "Yes. A common design is online qualifiers with a LAN final for the top teams. It gives you reach at low cost, and a better final. Tell teams from the start which stage is online and which is in person, and publish the rules for each stage." },
    ],
    related: ["run-a-campus-tournament", "run-a-custom-room-tournament", "stream-your-event"],
    cta: { label: "Plan your tournament", href: "/tools/plan/" },
  },

  {
    slug: "how-to-draw-a-fair-tournament-draw",
    title: "How to run a fair tournament draw: pots, groups and a draw people trust",
    seoTitle: "How to run a fair tournament draw",
    description: "How to run a tournament draw that nobody disputes: seeding into pots, drawing groups, handling same-club teams, doing it live and recording the result.",
    tag: "Format guide",
    answer: "Rank teams into pots by strength, then draw one team from each pot into every group, so strong teams are spread out. Keep teams from the same club or college apart where you can. Do the draw openly, in front of captains or on a recording, and publish the result.",
    intro: "A draw decides who plays whom, and so it decides who has an easy path. If captains suspect a draw was rigged, nothing you do afterwards will fix it. The method below is simple, and the openness is the part that earns trust.",
    sections: [
      { h2: "Decide how teams are ranked", md: `A draw starts with pots. A pot is a group of teams of similar strength. Teams in the same pot cannot be drawn into the same group.

Rank teams by a method you can explain: a previous league, a qualifier, a published rating, or a neutral person's judgement. If you have no way to rank, put all teams in one pot and draw at random. Our guide on [seeding a bracket](/guides/how-to-seed-a-tournament-bracket/) covers ranking in more detail.` },
      { h2: "Form the pots", md: `For 16 teams in 4 groups, make 4 pots of 4 teams each.

| Pot | Teams |
|---|---|
| Pot 1 | Seeds 1 to 4 |
| Pot 2 | Seeds 5 to 8 |
| Pot 3 | Seeds 9 to 12 |
| Pot 4 | Seeds 13 to 16 |

Each group then gets one team from each pot. The strongest four teams are all in different groups, and each group is balanced.` },
      { h2: "Draw the groups", md: `Draw pot 1 first, one team per group in order, then pot 2, and so on. Use paper slips, numbered balls or a tool, and show every step.

If the draw is online, share your screen or record it. After the draw, post the groups on the [groups and knockout maker](/tools/groups/) or in a message, and keep the recording until the event ends.` },
      { h2: "Keep same-club teams apart", md: `If two teams from the same club, college or city enter, avoid placing them in the same group when you can. You do this by adding a rule to the draw: "teams from the same club cannot be drawn into the same group, and the draw is repeated for that team if it happens."

Publish this rule before the draw. If you cannot avoid it, as when a club has more teams than groups, say so.` },
      { h2: "Handling a draw that goes wrong", md: `Sometimes the draw gives an obvious problem: a strong team drawn with another, or a club clash. Decide before the draw how you will handle it, and only use what the rule allows.

Do not redraw because someone dislikes a result. If you promise a random draw and then change it, the event loses trust, and the next one is harder to run.` },
      { h2: "A worked draw", md: `Take 12 teams and 3 groups of 4. Make 4 pots of 3: seeds 1 to 3, seeds 4 to 6, seeds 7 to 9 and seeds 10 to 12.

Draw pot 1 first, one team into each of groups A, B and C. Then draw pot 2 the same way, then pot 3, then pot 4. Each group ends with one team from every pot, so no group has two top seeds and none is left with all the weakest teams. Post the finished groups straight away, with the recording link.` },
      { h2: "Common mistakes", md: `- Drawing in private and announcing the result.
- Forming pots after seeing who is entered.
- Redrawing when captains complain.
- Not recording the draw.
- Forgetting to publish the same-club rule.` },
    ],
    faq: [
      { q: "How do you run a fair draw for a tournament?", a: "Rank the teams into pots by strength, draw one team from each pot into every group, keep teams from the same club apart if you can, and do the draw in front of the captains or on a recording. Publish the groups and the method straight after the draw." },
      { q: "What is a pot in a tournament draw?", a: "A pot is a set of teams of similar strength. Pot 1 holds the top seeds, pot 2 the next group, and so on. Each group takes one team from each pot, so the strongest teams are in different groups and the groups are balanced. A pot is not a prize pool." },
      { q: "Can I redraw if captains complain?", a: "No, unless the rule you published allows it, for example for a same-club clash. Redrawing because someone dislikes a result damages trust in the event and invites more complaints. Explain the draw method before you do it, record it, and treat the result as final." },
    ],
    related: ["how-to-seed-a-tournament-bracket", "group-stage-and-knockout-planning", "tournament-bracket-template"],
    cta: { label: "Make the draw with the groups tool", href: "/tools/groups/" },
  },

  {
    slug: "call-of-duty-mobile-tournament-format",
    title: "Call of Duty Mobile tournament format: modes, series and rules",
    seoTitle: "Call of Duty Mobile tournament format",
    description: "How to organise a Call of Duty Mobile tournament: picking team modes, 5v5 brackets, series length, private match setup, rules, results and how to avoid disputes.",
    tag: "Game guide",
    answer: "Pick one team mode, such as Search & Destroy, and run it as a bracket with best-of-3 series. Use private matches, write rules for rosters, disconnects and banned items, and have a referee or a recording for each match so results can be checked.",
    intro: "Call of Duty: Mobile is a good fit for college and community events because many players already own the game and know the team modes. The organiser's job is to pick one mode, one format and one clear set of rules, then keep them the same for every match.",
    sections: [
      { h2: "Choose the mode", md: `${F.codm.text}

For tournaments, pick one team mode and use it throughout. Search & Destroy is a common choice for competitive events because rounds are short and decisive, but you can choose another mode if your players prefer it. Mixing modes in one match makes it hard to judge a winner.

Modes, maps and settings change with updates, so confirm your choices in a test match before registration opens.` },
      { h2: "Pick the format", md: `For team-versus-team play, use a bracket.

| Teams | Suggested format |
|---|---|
| 4 to 8 | Single elimination or round robin |
| 8 to 16 | Single or double elimination |
| 16 to 32 | Groups, then a knockout |

Use the [bracket maker](/tools/brackets/) for the draw. If you have a large field, a [group stage plus knockout](/guides/group-stage-and-knockout-planning/) keeps everyone playing.` },
      { h2: "Series length and schedule", md: `Use best of 1 in early rounds and best of 3 for the semi-finals and the final. Our [series length guide](/guides/best-of-1-3-5-series-length-explained/) explains how to plan the time.

Plan each round for the longest possible series. A short mode gives you more matches per hour, but still leave a gap between matches for room setup and results. The [schedule maker](/tools/schedule/) builds the timetable.` },
      { h2: "Match setup", md: `Create a private match for each pairing and invite the two teams. Share the room details with captains only. A referee joins as an observer if the mode allows it, or the teams record their screens.

Write the settings in the rules: the map pool, the number of rounds, and any restrictions on items or gear. Use the same settings in every match, and publish them. Test the process with two teams the day before.` },
      { h2: "Rules to write", md: `- Squad of 5 players with one substitute, locked when the bracket is drawn.
- A team that is not ready within 10 minutes of its slot forfeits.
- A player who disconnects may rejoin; a repeat disconnect loses the round.
- No modified clients or banned tools; penalty is removal from the event.
- The referee's decision is final, and disputes go to the organiser.
- Both teams send a screenshot of the result.

The [rules template](/guides/esports-tournament-rules-template/) has wording for conduct and disputes.` },
      { h2: "A sample evening", md: `For 8 teams in a single-elimination bracket, with each match taking about 30 minutes and a referee for every match:

| Time | What happens |
|---|---|
| 18:30 | Captains check in; room test |
| 19:00 | Quarter-finals (4 matches at once) |
| 20:00 | Semi-finals (2 matches) |
| 21:00 | Final, best of 3 |

If you have fewer referees than matches, stagger the quarter-finals and add an hour. Check the schedule against the real length of a match in your chosen mode.` },
      { h2: "Common mistakes", md: `- Not choosing the mode until registration is full.
- Using different settings in different matches.
- Having no rule for disconnects.
- Not recording results.
- Underestimating the time per match.` },
    ],
    faq: [
      { q: "What mode is best for a Call of Duty Mobile tournament?", a: "Choose one team mode and use it for the whole event. Search & Destroy is common in competitive play because rounds are short and decisive, but your players' preference matters more than convention. Mixing modes within a match makes the result hard to judge, so confirm your choice in a test match first." },
      { q: "How do you set up a Call of Duty Mobile tournament match?", a: "Create a private match for each pairing, invite the two teams, and share the room details with captains only. Use the same settings in every match, and have a referee observe or ask teams to record their screens. Both teams send a result screenshot afterwards." },
      { q: "How big should a Call of Duty Mobile team be?", a: "The organiser decides. Many team modes are 5v5, so a registration of five players plus one substitute is common. Write the team size and the substitute rule in the rulebook, lock the roster when the bracket is drawn, and check the game's current mode requirements before you publish." },
    ],
    related: ["tournament-bracket-template", "best-of-1-3-5-series-length-explained", "esports-tournament-rules-template"],
    cta: { label: "Make the bracket", href: "/tools/brackets/" },
  },

  {
    slug: "tournament-referee-roles-and-duties",
    title: "Tournament referee roles and duties: who does what on match day",
    seoTitle: "Tournament referee roles and duties",
    description: "The referee and official roles a tournament needs: head referee, match referees, scorekeeper, results desk and gate staff, with duties, a briefing list and tips.",
    tag: "Organiser guide",
    answer: "A tournament needs a head referee who settles disputes, match referees who watch games, a scorekeeper who records results, and a results desk that updates the bracket. Name each person before the event, brief them with the rules, and give each a single clear job.",
    intro: "When an organiser tries to do everything on match day, the tournament runs at the speed of one person. Splitting the jobs is the simplest improvement you can make. These are the roles that matter, and what each one should do.",
    sections: [
      { h2: "Head referee", md: `The head referee knows the rules better than anyone else, and settles disputes. Players come to this person with protests, and the answer should be quick and final, within the rulebook.

The head referee should not be a player or a coach in the event. For a school or college event, a teacher or a senior student who is not competing is a good choice.` },
      { h2: "Match referees", md: `Each live match, or each court or room, needs a referee. Their job is to start the match, check the players against the roster, watch for rule breaks and record the result.

In online events, referees join as observers or watch on a call. In person, they stand at the court or sit at the table. Give each a printed copy of the rules and the roster.` },
      { h2: "Scorekeeper and results desk", md: `The scorekeeper writes the official result of each match: score, winner and any penalties. The results desk takes that and updates the bracket or table, and tells the next teams when and where to play.

Keep these as one place on the day, with one set of records. The [display screen](/tools/display-screen/) can show the results live, and the [bracket maker](/tools/brackets/) keeps the draw.` },
      { h2: "Gate and registration staff", md: `At a physical event, one or two people check in teams at the gate with the [check-in scanner](/tools/check-in/), hand out ID cards from the [ID card maker](/tools/id-cards/) and answer first questions.

Their job ends when the event starts. After that, they help with crowd control and information.` },
      { h2: "A short briefing list", md: `Brief all officials together, 30 minutes before the start:

1. The schedule and the venue map.
2. The rules that cause the most disputes, such as late teams and disconnects.
3. How to record a result, and who gets it.
4. Who the head referee is and how to reach them.
5. What to do if a player is hurt or an adult needs to be called.

Give each person a printed sheet with these points and a phone number.` },
      { h2: "Sample staffing for a 16-team event", md: `| Role | People | Notes |
|---|---|---|
| Head referee | 1 | Not playing; settles disputes |
| Match referees | 1 per live match | Four courts or rooms need four |
| Scorekeeper and results desk | 1 to 2 | One set of records |
| Gate and registration | 2 | Check-in, cards, questions |
| Floating helper | 1 | Fetches, replaces, covers breaks |

That is about 9 to 10 people for a one-day event with four matches running at once. Volunteers can cover several of these roles in turn if the schedule has gaps.` },
      { h2: "Common mistakes", md: `- One person doing refereeing, scoring and announcements.
- Letting each team supply its own referee with no neutral check.
- Not briefing officials before the first match.
- Leaving results in several places.
- Putting a player or coach in charge of disputes.` },
    ],
    faq: [
      { q: "What roles does a tournament need?", a: "A head referee who settles disputes, match referees for each live game, a scorekeeper who records results, a results desk that updates the bracket, and gate staff for check-in at a physical event. In a small event one person can combine two roles, but not refereeing and scoring at the same time." },
      { q: "Who should be the head referee?", a: "Someone who knows the rules and is not playing or coaching in the event. A teacher, a senior student not competing, or an experienced player from another club works well. They need to be able to give quick, final decisions that both sides accept, so authority matters as much as knowledge." },
      { q: "How should I brief tournament officials?", a: "Hold a short meeting about 30 minutes before the start. Cover the schedule, the rules that cause most disputes, how to record results, who the head referee is and what to do in an emergency. Give each official a printed sheet with these points and a contact number." },
    ],
    related: ["run-a-campus-tournament", "event-gate-checkin", "esports-tournament-rules-template"],
    cta: { label: "Print the tournament kits", href: "/tools/print-kits/" },
  },

  {
    slug: "badminton-tournament-format-and-scoring",
    title: "Badminton tournament format and scoring for club and school events",
    seoTitle: "Badminton tournament format and scoring",
    description: "How to run a badminton tournament: singles and doubles formats, match scoring, groups or knockout, court time, rules for service and a timetable for one day.",
    tag: "Sport guide",
    answer: "Badminton matches are best of three games. Run singles or doubles as a group stage plus knockout, or a straight knockout for small fields, plan the court time from the number of matches, and check the current game target score, because the official one has changed.",
    intro: "Badminton is easy to organise because matches are short and need only a court and a net. The two decisions that matter are the format, which depends on your court time, and the scoring, which depends on which version of the rules you adopt.",
    sections: [
      { h2: "Scoring: check the current rule", md: `${F.badminton.text}

Because the target score has changed, do not copy a rulebook from a few years ago. Decide what your event will use, 15 or 21, write it in the rules, and tell players when they register. Local events are free to choose, as long as they say so.` },
      { h2: "Events and formats", md: `Typical categories are men's singles, women's singles, doubles and mixed doubles, and age groups for school events. Fewer categories mean a shorter day.

| Players per category | Format |
|---|---|
| 4 to 8 | Single elimination, or a small round robin |
| 8 to 16 | Single elimination with seeds |
| 16 to 32 | Groups of 4, then a knockout |

Use the [bracket maker](/tools/brackets/) for knockouts and the [groups and knockout maker](/tools/groups/) for larger fields.` },
      { h2: "Court time", md: `A badminton match of three games can take 30 to 45 minutes, and shorter if the target score is lower. Plan with a slot length that includes warm-up and changeover, such as 45 minutes.

Total matches for a category of 16 in single elimination is 15. With 4 courts and 45-minute slots, a round of 8 matches takes 2 slots, which is 90 minutes. Use the [schedule maker](/tools/schedule/) to plan across your courts.` },
      { h2: "Rules to write", md: `- Match format: best of three games, with the target score you chose.
- Service rules and any local variations.
- Warm-up time before the match, such as 3 minutes.
- A team that is not ready within 10 minutes forfeits.
- Doubles pairs are registered together, with a substitute rule.
- Disputes: the umpire decides in a match with one; otherwise the organiser.
- Shuttle: who supplies it, and when it is changed.` },
      { h2: "A sample day", md: `For 16 singles players on 4 courts, with 45-minute slots:

| Time | Round |
|---|---|
| 09:00 | Registration and warm-up |
| 09:30 to 11:00 | Round of 16 (8 matches, 2 slots) |
| 11:00 to 11:45 | Quarter-finals (4 matches, 1 slot) |
| 12:30 to 13:15 | Semi-finals (2 matches) |
| 13:30 | Final and prizes |

Add a second category in the afternoon if you have the courts.` },
      { h2: "Seeding and odd numbers", md: `If you have an odd number of entries, use byes for the top seeds. Eleven players need a 16-player bracket with 5 byes, and the bracket maker places them automatically. See [byes explained](/guides/tournament-bracket-byes-explained/) for the rule.

Seed the strongest players so they meet late, using the standard order in the [seeding guide](/guides/how-to-seed-a-tournament-bracket/). In doubles, seed pairs, not individuals, and keep pairs fixed once the bracket is drawn.` },
      { h2: "Common mistakes", md: `- Using a rulebook that is out of date on scoring.
- Planning match slots without the warm-up.
- Too many categories for the courts available.
- No rule for a late player.
- Not telling players the target score before the event.` },
    ],
    faq: [
      { q: "How are badminton matches scored?", a: "Matches are best of three games with rally scoring, where every rally earns a point. The target score has changed in recent years: BWF announced 15-point games in 2026, replacing the earlier 21. A local tournament can choose either, as long as the rule is written and shared before the event." },
      { q: "How long does a badminton match take?", a: "A best-of-three match can take 30 to 45 minutes, and less with a lower target score. Plan slots of about 45 minutes, including warm-up and changeover, and schedule for three games even though many matches end in two. Check the total against the number of courts you have." },
      { q: "What format suits a badminton tournament?", a: "A knockout works for 4 to 16 players per category. For larger fields, play groups of four and then a knockout. For a single day with limited courts, reduce categories rather than extending the day. Seed the strongest players so that they meet late." },
    ],
    related: ["tournament-bracket-template", "group-stage-and-knockout-planning", "best-of-1-3-5-series-length-explained"],
    cta: { label: "Build the badminton bracket", href: "/tools/brackets/" },
  },

  {
    slug: "how-to-name-your-tournament",
    title: "How to name your tournament so people remember and search for it",
    seoTitle: "How to name your tournament",
    description: "How to choose a tournament name: what to include, how to make it easy to say and search, naming a series, avoiding trademark trouble and a checklist of ideas.",
    tag: "Poster guide",
    answer: "A good tournament name says what it is, is easy to say and spell, and is not already taken. Include the sport or game and a place or organiser, add the year for one-off events, and check that nothing else uses the same name before you print it.",
    intro: "A name appears on every poster, form and certificate, and people search for it by name. A name that is hard to spell or confusingly similar to another event costs you entries. Choosing it takes ten minutes if you follow a few rules.",
    sections: [
      { h2: "What a name should do", md: `A tournament name has three jobs. It tells people what the event is, it is easy to repeat, and it is yours.

Test it with two questions. Can someone who has never heard it say it after hearing it once? Can they spell it correctly after hearing it? If not, simplify.` },
      { h2: "Include the sport and a place", md: `Searchers type what they are looking for: "football tournament Pune", "college esports cup". Put the sport or game in the name or the title line on every poster, and add the place or organiser.

| Weak name | Stronger name |
|---|---|
| The Big Clash | Pune Inter-College Football Cup |
| Arena X | Sahyadri Valorant Open |
| Battle Royale 2 | Campus BGMI Squad Cup |

The name can be creative. The title line below it should be plain.` },
      { h2: "Make it work as a series", md: `If you plan to run the event again, choose a name that works with a year or a season: "Sahyadri Cup 2027", "Spring League, Season 2". Players can then say "I won Season 1."

Avoid putting the year in the name of an event you hope to run for many years, unless you want a new name every time. Use a fixed name and a separate edition number.` },
      { h2: "Check that the name is free", md: `Before you print, search the name in a search engine and on the social platforms you will use. If another event already uses it, change yours.

Avoid names that copy a game publisher's or a brand's trademark in a way that suggests you are officially connected. Say that your tournament is "for" a game, not "by" its publisher. Publishers set their own rules for tournaments, so check them if you offer prizes.` },
      { h2: "Names for teams and divisions", md: `If you name divisions, keep the names plain: "Division A and B", "Under 16", "Open". Funny names confuse a bracket.

For team names, ask teams to avoid offensive words, and put a rule in the [rules template](/guides/esports-tournament-rules-template/) saying you may ask a team to change its name. Put the rule in the registration form built with the [registration form tool](/tools/registration/).` },
      { h2: "A worked example", md: `Start with a draft: "The Big Clash". It says nothing about the sport, the place or the audience. Add what searchers type: "Pune Inter-College Football Cup". Add an edition if you plan to repeat it: "Season 1".

Now run the checks: Can someone spell it after hearing it once? Is another event already using it? Does it imply an official link to a brand? If all three answers are fine, put the name in the largest text on the poster and the plain title line below it.` },
      { h2: "Common mistakes", md: `- A name that is hard to spell.
- Leaving the sport out of the poster title.
- Reusing another event's name.
- Using a brand name in a way that implies endorsement.
- Printing before checking whether the name is free.` },
    ],
    faq: [
      { q: "How do I name a tournament?", a: "Make it say what the event is, easy to say and spell, and different from other events. Include the sport or game and a place or organiser, add a season or edition for events you plan to repeat, and check that nobody else uses it. Then write the plain description under the creative name on every poster." },
      { q: "Should a tournament name include the year?", a: "Only for a one-off event. For one you plan to repeat, use a fixed name and an edition number or season, such as Season 2. That way, the name builds recognition over time and the date can change without a rename. Put the year on the poster as a separate line." },
      { q: "Can I use a game's name in my tournament name?", a: "You can say that a tournament is for a game, such as a Valorant open or a BGMI squad cup, but do not suggest the publisher runs it. Publishers have their own conditions for tournaments and prizes, and they change, so check them before you advertise prize money." },
    ],
    related: ["football-tournament-poster-ideas", "college-fest-esports-poster", "tournament-poster-sizes-whatsapp-instagram-print"],
    cta: { label: "Put the name on a poster", href: "/tools/poster/" },
  },

  {
    slug: "preventing-cheating-in-online-tournaments",
    title: "Preventing cheating in online tournaments: practical steps for organisers",
    seoTitle: "Preventing cheating in online tournaments",
    description: "How to reduce cheating in an online tournament: rules and penalties, referees, recordings, roster checks, proof of results and what to do when a team is accused.",
    tag: "Organiser guide",
    answer: "You cannot stop all cheating online, but you can make it costly and easy to catch. Publish rules with penalties, check rosters against the lobby, put a referee in every match, require screenshots or recordings, and handle accusations with a fixed process.",
    intro: "Cheating is the thing that makes organisers nervous about online events. It will happen sometimes. The goal is not to prevent every case, but to make cheating risky, to catch it quickly and to handle it fairly. Here is how.",
    sections: [
      { h2: "Write the rules and penalties first", md: `Players cheat less when they know what happens. Write down what is banned: hacks, modified clients, teaming where it is not allowed, account sharing, stream sniping.

Then write the penalty for each: a warning, loss of match points, disqualification, a ban from future events. Publish it on the registration page built with the [registration form tool](/tools/registration/), and ask each captain to confirm they have read it.` },
      { h2: "Check who is playing", md: `Account sharing and ringers are the easiest cheats to prevent. Collect each player's in-game name and ID at registration, lock the roster, and check the lobby against it before every match.

A referee or an organiser should be able to say, "these are the players on this team, and no one else." The [ID card maker](/tools/id-cards/) can make digital cards with a name, team and role for each player.` },
      { h2: "Put eyes on the match", md: `A referee in every match, as an observer or on a call, is the best deterrent. If you cannot cover every match, cover the later rounds and spot-check the early ones.

Ask players to record their screen, at least in knockout rounds. Say before the event that a recording may be requested, and that a team that cannot supply one when asked may be penalised.` },
      { h2: "Proof of results", md: `Require both teams to send a screenshot of the result. Results from only one side are not accepted.

Keep one place for results. A message thread or a sheet, where the referee, not the players, records the final result. The [display screen](/tools/display-screen/) can show results live, which makes disputes visible early.` },
      { h2: "When a team is accused", md: `Have a fixed process, so you do not improvise under pressure:

1. The accuser reports within a set time, such as 15 minutes after the match, with evidence.
2. The head referee reviews the evidence, and asks the accused team for its recording.
3. The referee decides, in writing, and tells both teams.
4. The accused team may appeal to the organiser within a short time.

Treat everyone as innocent until the evidence says otherwise. False accusations should have a penalty too. See the [referee roles guide](/guides/tournament-referee-roles-and-duties/) for who does what.` },
      { h2: "A short fair-play policy to copy", md: `1. All players use only the unmodified game and their own account.
2. Rosters are locked when the bracket is drawn; the lobby is checked against the roster.
3. A referee observes every knockout match; any team may be asked for a screen recording.
4. Hacks, account sharing or teaming mean disqualification.
5. Reports must be made within [15] minutes of the match, with evidence.
6. The head referee decides in writing; appeals go to the organiser within [30] minutes.

Put this on the registration page and ask each captain to confirm they have read it.` },
      { h2: "Common mistakes", md: `- Relying on trust with no way to check.
- Writing rules without penalties.
- Not locking rosters.
- Accepting results from one team only.
- Deciding an accusation on the spot without looking at evidence.` },
    ],
    faq: [
      { q: "How do you stop cheating in online tournaments?", a: "You cannot stop all of it, but you can reduce it: publish rules with penalties, lock and check rosters, put a referee in every match or at least every knockout match, require screenshots or recordings, and use a fixed process for accusations. Visible checks deter most cheating before it starts." },
      { q: "What penalty should I use for cheating?", a: "Match the penalty to the offence and write the list in advance: a warning for minor conduct issues, loss of that match's points for teaming, and disqualification and a ban for hacks or account sharing. Publish the list at registration and apply it equally, because uneven penalties cause more arguments than the cheating itself." },
      { q: "Should I ask players to record their screens?", a: "Yes, at least in knockout rounds and for any match that is disputed. Tell players in advance that a recording may be requested and that a team that cannot supply one may be penalised. Recordings settle most disputes in minutes and discourage the cheating that would otherwise be hard to prove." },
    ],
    related: ["esports-tournament-rules-template", "tournament-referee-roles-and-duties", "run-a-custom-room-tournament"],
    cta: { label: "Build the registration page", href: "/tools/registration/" },
  },

  {
    slug: "table-tennis-tournament-draw-and-format",
    title: "Table tennis tournament draw and format for clubs and schools",
    seoTitle: "Table tennis tournament draw and format",
    description: "How to plan a table tennis tournament: groups then knockout, match scoring, number of tables, seeding and a timetable for singles and doubles in one day.",
    tag: "Sport guide",
    answer: "Table tennis games go to 11 points and a match is usually best of five games. Run singles as groups of 4 then a knockout, seed the best players apart, count tables and slot length to size the field, and write rules for warm-up, service and late players.",
    intro: "Table tennis fits a hall, needs little equipment and has short matches, so it is a good tournament sport. The planning problem is tables: you have a few, and each match ties one up. Count the matches and the table time before you take entries.",
    sections: [
      { h2: "How matches are scored", md: `${F.tableTennis.text}

Local events often shorten the match to best of three games so the day fits. Choose one length, write it in the rules and tell players when they register.` },
      { h2: "Singles format", md: `For up to 8 players, a round robin is possible. For 8 to 32, use groups then a knockout.

| Players | Format | Matches |
|---|---|---|
| 8 | 2 groups of 4, top 2 to semi-finals | 12 + 3 = 15 |
| 16 | 4 groups of 4, top 2 to quarter-finals | 24 + 7 = 31 |
| 16 | Straight knockout | 15 |

Use the [groups and knockout maker](/tools/groups/) for the first two, and the [bracket maker](/tools/brackets/) for the knockout. Seed the best players so they do not meet early, as in the [seeding guide](/guides/how-to-seed-a-tournament-bracket/).` },
      { h2: "Count the table time", md: `A best-of-five match can take 15 to 30 minutes. Use a slot of 30 minutes with the gap for the next players. With 4 tables and 31 matches, you need about 8 slots, which is 4 hours.

Plan for the longest case in each round. If you have fewer tables than you want, use best of three in the groups and best of five from the semi-finals. The [schedule maker](/tools/schedule/) plans the timetable.` },
      { h2: "Doubles and categories", md: `Doubles pairs register together and play as a team, in a separate bracket. Age groups, such as under 14 and under 18, also need their own brackets.

Each extra category adds matches and table time. Choose the categories you can fit, and say which are held, in the registration form built with the [registration form tool](/tools/registration/).` },
      { h2: "Rules to write", md: `- Match length: best of three or five games.
- Warm-up: 2 minutes with the match ball.
- Service rules and whether a let is replayed.
- Equipment: who supplies balls and whether players may use their own bat.
- A player not at the table within 5 minutes of being called forfeits.
- A referee or the players call the score; disputes go to the organiser.` },
      { h2: "Odd numbers and byes", md: `If 11 players enter a straight knockout, the bracket has 16 places and 5 byes, and the top 5 seeds skip the first round. See [byes explained](/guides/tournament-bracket-byes-explained/) for the arithmetic.

In groups, a group of 3 plays 3 matches and a group of 5 plays 10. When entries do not divide evenly, mix groups of 3 and 4 and say how the qualifiers are chosen, such as the top 2 from each group plus the best third-placed players.` },
      { h2: "Common mistakes", md: `- Taking more entries than the tables can handle.
- Not planning table time for the longest matches.
- Mixing categories on the same bracket.
- No rule for a late player.
- Forgetting to supply balls and scorecards.` },
    ],
    faq: [
      { q: "How are table tennis games scored?", a: "A game is played to 11 points and must be won by two clear points. A match is usually the best of five games, although local events often use the best of three to save time. Write the match length in the rules and tell players when they register, so everyone knows what to prepare for." },
      { q: "How many tables do I need for a tournament?", a: "Count the matches your format needs, multiply by the slot length, and divide by the tables you have. For 31 matches in 30-minute slots, 4 tables take about 4 hours. If that is too long, use best of three, fewer players or more tables, and plan for the longest matches in each round." },
      { q: "What is the best table tennis tournament format?", a: "For a day event with 8 to 32 players, groups of four followed by a knockout works best. Everyone plays at least three matches, and the knockout gives a clear final. For 4 to 8 players a round robin is simple. Seed the best players apart in the knockout." },
    ],
    related: ["tournament-bracket-template", "group-stage-and-knockout-planning", "how-to-seed-a-tournament-bracket"],
    cta: { label: "Build the groups and knockout", href: "/tools/groups/" },
  },

  {
    slug: "rocket-league-tournament-format",
    title: "Rocket League tournament format: brackets, series and rules",
    seoTitle: "Rocket League tournament format",
    description: "How to organise a Rocket League tournament: team size, double elimination, best-of series, custom match setup, overtime rules, results and a rulebook you can copy.",
    tag: "Game guide",
    answer: "Rocket League is team versus team, so run it as a bracket, usually double elimination, with best-of-3 or best-of-5 series. Fix the team size, create a private match for each series, write overtime and disconnect rules, and have a referee or recording for results.",
    intro: "Rocket League tournaments are a natural fit for brackets: two teams, one winner, clear scores. The format most communities use is double elimination with best-of series, because one unlucky game should not end a team's event. Here is how to set it up.",
    sections: [
      { h2: "Choose the team size", md: `Rocket League supports several team sizes. Pick one for your tournament and say it in the registration. Check the sizes the game offers in private matches before you decide, because options change with updates.

A bigger team size needs a bigger roster and more substitutes, and makes scheduling harder. For a first event, choose the size most of your players already play.` },
      { h2: "Pick a bracket", md: `Double elimination is the standard, because it gives every team a second life. See [double elimination explained](/guides/double-elimination-bracket-explained/).

| Teams | Format |
|---|---|
| 4 to 8 | Round robin or double elimination |
| 8 to 16 | Double elimination |
| 16 to 32 | Groups, then double elimination |

The [double elimination tool](/tools/double-elimination/) draws both brackets and the final. Seed teams using the [seeding guide](/guides/how-to-seed-a-tournament-bracket/).` },
      { h2: "Series length", md: `Use best of 3 in the early rounds, best of 5 from the semi-finals, and best of 5 or 7 for the grand final if time allows. A series is won by the first team to win a majority of games.

At the default settings a game lasts about five minutes plus any overtime, but check your own settings. Plan the schedule for the longest series, and add gaps between games for settings. The [series length guide](/guides/best-of-1-3-5-series-length-explained/) helps with the timetable.` },
      { h2: "Match setup", md: `Create a private match for each series and invite the two teams. Fix the settings: arena, match length and overtime rule. Write them in the rules, so each match uses the same ones.

Decide who creates the match and what happens if a team cannot find it: a named host, a time limit, and a forfeit after that limit.` },
      { h2: "Rules to write", md: `- Roster: the team size plus a substitute, locked when the bracket is drawn.
- Overtime: how it works, and whether there is a limit.
- Disconnects: a team that loses a player may continue short, or pause for a limited time. Choose one.
- Pauses: how many each team may use.
- Results: both teams send a screenshot of the series result.
- Conduct: respect, no abuse, and a penalty.

The [rules template](/guides/esports-tournament-rules-template/) has conduct wording to adapt.` },
      { h2: "A sample evening for 8 teams", md: `Double elimination for 8 teams has 14 matches. If a best-of-3 takes about 20 minutes, that is 280 minutes of play. With two matches running at the same time, the bracket fits in roughly two and a half hours, plus gaps.

| Stage | Matches |
|---|---|
| Winners round 1 | 4 |
| Winners semi-finals and final | 3 |
| Losers bracket | 6 |
| Grand final | 1 |

Check the real length of a series in a test match, then fit the evening around it. Use the [match schedule maker](/tools/schedule/) for the timetable.` },
      { h2: "Common mistakes", md: `- Not fixing the team size before registration.
- Using different settings in different matches.
- No rule for overtime or disconnects.
- Scheduling a best-of-5 as if it were a best-of-1.
- Forgetting to name who creates each match.` },
    ],
    faq: [
      { q: "What format is best for a Rocket League tournament?", a: "Double elimination with best-of series is the standard, because it gives every team a second chance and keeps the better teams in. For small fields, a round robin works. For large ones, use groups first and then double elimination. Choose after you count the matches and the time you have." },
      { q: "How long does a Rocket League series take?", a: "A single game takes around five minutes plus any overtime, so a best-of-5 can take 30 to 40 minutes with gaps for settings. Plan the schedule for the longest case in every round, and use best-of-3 early to save time. Test the match setup with two teams beforehand." },
      { q: "How do I handle disconnects in Rocket League?", a: "Choose one rule and write it down: either the team plays short for the rest of the game, or it may pause for a limited time to let the player rejoin. Limit the number of pauses per team, and treat repeated disconnects as a forfeit of the game." },
    ],
    related: ["double-elimination-bracket-explained", "best-of-1-3-5-series-length-explained", "how-to-seed-a-tournament-bracket"],
    cta: { label: "Draw the double elimination bracket", href: "/tools/double-elimination/" },
  },
];
