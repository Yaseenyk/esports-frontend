import type { Draft } from "./types";

/** Posts 60 to 69. */
export const BATCH_07: Draft[] = [
  {
    slug: "free-fire-college-tournament-checklist",
    title: "Free Fire college tournament checklist: from first notice to prize day",
    seoTitle: "Free Fire college tournament checklist",
    description: "A step by step checklist for a Free Fire college tournament: format, registration, room setup, rules, referees, results and prizes, with a timeline you can copy.",
    tag: "Game guide",
    answer: "Decide the format and slots, open registration with a deadline, publish rules, test room settings, run a captains' briefing, keep a results sheet, and settle disputes before prizes. Work backwards from the date: two weeks of signups, one day of testing, one day of play.",
    intro: "A college Free Fire event looks simple from outside: make rooms, play, give prizes. In practice most delays come from the same few places: unclear slots, late teams, and no record of who won what. This checklist walks through the whole event in the order you will meet each problem.",
    sections: [
      { h2: "Two to three weeks before: decide the shape", md: `Fix the basics first, because everything else depends on them.

- Which modes you will run: battle royale squads, Clash Squad, or both. See the [Clash Squad format guide](/guides/free-fire-clash-squad-tournament-format/).
- How many teams you can host, and how many slots each room has.
- Date, start time, and a backup date.
- Entry fee, if any, and what the prize pool is. The [budget template](/guides/tournament-budget-template/) shows how to count it.

Write these in one message you can paste anywhere. If the plan does not fit in five lines, it is not ready.` },
      { h2: "Registration", md: `Open registration with a clear deadline and a cap. Ask only for what you need: team name, captain, in-game names and IDs, a contact number, and the college or department.

Use a form, not chat messages. The [registration form tool](/tools/registration/) builds one, and the [form fields guide](/guides/tournament-registration-form-fields/) lists what to ask. Close registration on the deadline and publish the list of confirmed teams so nobody wonders whether they got in.` },
      { h2: "Rules and room settings", md: `Publish rules before the first match. Cover roster changes, late arrival, banned behaviour and how results are decided. Start from the [rules template](/guides/esports-tournament-rules-template/) and the [Free Fire tournament organiser guide](/guides/free-fire-tournament-organiser/).

Room settings change with game updates, so test them. Create a practice room, check the map and mode you plan to use, and write the settings on a sheet. Do this a day before, not an hour before.` },
      { h2: "The day before", md: `Send every captain the schedule, room timings and the rules link. Ask them to confirm. Print or share the points table so nobody argues about scoring later. The [points table guide](/guides/points-table/) explains how to build one.

Check your people: who creates rooms, who watches for cheating, who records results. Brief them, using [volunteer roles and briefing](/guides/tournament-volunteer-roles-and-briefing/) as a model.` },
      { h2: "On the day", md: `1. Open the lobby at the time you promised, and start on time.
2. Take attendance by team name. A team that is absent past the grace period forfeits its slot, as in [no-shows and walkovers](/guides/handling-no-shows-and-walkovers/).
3. Share the room ID and password only with the captains, close to start time.
4. After each match, record the placement and kills on a single sheet and share a screenshot of the standings.
5. Give a short break between matches so players can rest and you can fix problems.

Keep one person as the only source of decisions. Four people answering the same question gives four answers.` },
      { h2: "Results, disputes and prizes", md: `Publish the final table soon after the last match, and give a short window for protests. The [dispute process guide](/guides/tournament-dispute-process-protest-window/) has wording for it. Only after the window closes, announce winners and hand out prizes and certificates. The [certificate maker](/tools/certificates/) prints one per name.

Take a few photos with permission, and write a short post for your college page the same evening.` },
      { h2: "Common mistakes", md: `- Opening registration with no deadline or cap.
- Changing room settings on the day without telling captains.
- Keeping results in several chat groups instead of one sheet.
- Announcing prizes before the protest window ends.
- Skipping the backup date.` },
    ],
    faq: [
      { q: "How do I organise a Free Fire tournament in college?", a: "Fix the format, slots, date and prize pool, open a registration form with a deadline and a cap, publish rules, test the room settings the day before, run a captains' briefing, record every result on one sheet, allow a short protest window and only then announce winners and give prizes." },
      { q: "How early should registration close for a college event?", a: "Close it a few days before the event so you have time to publish the confirmed team list, send the schedule and rules, and fix any duplicate or incomplete entries. A hard deadline and a cap on teams also stop last minute additions from breaking your room plan and schedule." },
      { q: "Who should keep the results in a Free Fire event?", a: "Name one person and use one shared sheet. After each match, record placement and kills, update the points table and share a screenshot of the standings. When results sit in several chats, teams quote different numbers and protests take longer to settle." },
    ],
    related: ["free-fire-tournament-organiser", "free-fire-clash-squad-tournament-format", "tournament-budget-template", "tournament-volunteer-roles-and-briefing"],
    cta: { label: "Build the registration form", href: "/tools/registration/" },
  },

  {
    slug: "lan-event-setup-checklist",
    title: "LAN event setup checklist: power, network, seating and a test day",
    seoTitle: "LAN event setup checklist",
    description: "A practical LAN event setup checklist: venue, power, network, stations, spare equipment, a test run and a pack-down plan for a one-day gaming tournament.",
    tag: "Organiser guide",
    answer: "For a LAN event, count stations, check the venue's power, build the network and test every machine and cable the day before. Bring spares, label everything, assign one technical lead and plan pack-down. Most failures come from power and cables, not the games.",
    intro: "A LAN event gives players a fair, low-delay match, but you carry every problem yourself: power, cables, machines, seating. A checklist turns a stressful setup into a routine. Use this one two weeks out, again the day before, and again on the morning.",
    sections: [
      { h2: "Count what you need", md: `Start with stations: one per player, plus spares. For a five-a-side team game, ten players per match need ten stations at least, and more if two matches run at once.

| Item | How to count |
|---|---|
| Stations | Players per match, times matches at once, plus 10 percent spare |
| Power sockets | Machines, monitors, routers, chargers |
| Network ports | One per station, plus the admin machine |
| Chairs and tables | One set per station, with room to move |

The [schedule maker](/tools/schedule/) shows how many matches run at once for your format.` },
      { h2: "Check the venue", md: `Visit the venue before you confirm it. Look at the number of wall sockets, whether the circuit can carry the load, the lighting, the noise, and the exits. Ask who to call if the power trips.

Measure the room. Ten stations need more space than ten chairs: players need elbow room, and spectators need a place that does not block them. Plan a clear walkway for referees. The [campus tournament guide](/guides/run-a-campus-tournament/) has a gate and safety checklist you can adapt.` },
      { h2: "Power", md: `Power is the most common point of failure.

- Spread machines across more than one circuit if you can.
- Use proper extension boards with surge protection, not daisy-chained cheap ones.
- Tape cables down where people walk.
- Keep a few spare extension boards and a torch.

Ask the venue to confirm the load limit, and do not guess. If something trips mid-match, your rules should already say how a match restarts. See the [no-shows and technical problems guidance](/guides/handling-no-shows-and-walkovers/).` },
      { h2: "Network", md: `A LAN needs a switch for the stations and a clear plan for how the game connects. Some games need only the local network, and some still need internet access for login or servers. Check each game's requirements before you buy cables or plan the room.

- Label every cable at both ends with the station number.
- Keep one spare switch and spare cables.
- Separate the players' network from the audience Wi-Fi if you offer one.

Compare this with running online in [online versus LAN](/guides/online-vs-lan-tournament-which-to-run/).` },
      { h2: "The test day", md: `Test everything the day before, on the real equipment:

1. Boot every machine and log in to the game.
2. Join a test match across all stations at once.
3. Check controllers, headsets, mice and displays.
4. Confirm the game version and settings match on every machine.
5. Time how long one full setup takes, and add a margin.

Write down every fault and fix it that day. A fault on the morning costs you the first round.` },
      { h2: "Roles on the day", md: `Assign a technical lead who does nothing else, a referee for each match area, and a person at the entrance. Give the technical lead a list of spare parts and a phone number for the venue manager.

Use the [referee roles guide](/guides/tournament-referee-roles-and-duties/) to split the work, and print signs and station labels with the [print kits tool](/tools/print-kits/).` },
      { h2: "Common mistakes", md: `- Not visiting the venue first.
- Relying on one extension board for many machines.
- Skipping the full test on the real equipment.
- No spare cables, mice or keyboards.
- No plan for pack-down, so tidying takes hours.` },
    ],
    faq: [
      { q: "What do I need to set up a LAN tournament?", a: "Enough stations for every player plus spares, safe power with surge protected extension boards, a network switch and labelled cables, matching game versions on every machine, referees, a technical lead and a test run the day before on the real equipment. Also bring spare cables, mice and keyboards." },
      { q: "How early should I test a LAN setup?", a: "Test a full day before the event on the real machines: boot every station, log in, join one match together, check peripherals and display settings, and confirm game versions. Write down faults and fix them that day, so the morning is for last checks rather than repairs." },
      { q: "What usually goes wrong at a LAN event?", a: "Power and cables cause most failures: overloaded circuits, loose extension boards and unlabelled cables. Mismatched game versions and untested login problems come next. A visit to the venue, a full test, a technical lead and a few spares cover most of these risks." },
    ],
    related: ["online-vs-lan-tournament-which-to-run", "run-a-campus-tournament", "tournament-referee-roles-and-duties", "handling-no-shows-and-walkovers"],
    cta: { label: "Plan the schedule for your stations", href: "/tools/schedule/" },
  },

  {
    slug: "weekly-community-cup-how-to-run",
    title: "Weekly community cup: how to run a small tournament every week",
    seoTitle: "How to run a weekly community cup",
    description: "How to run a weekly community cup: a simple format, fixed schedule, light rules, automatic reminders, a points ladder and how to avoid burning yourself out.",
    tag: "Organiser guide",
    answer: "Keep a weekly cup simple: the same day and time, a fixed format, a short rules page, one signup link and a running points ladder across weeks. Reuse everything each week. Consistency, not size, is what builds a community.",
    intro: "A big tournament is exciting but rare. A small weekly cup builds the habit: players know when it happens, regulars improve, newcomers find a way in. The trick is to make it cheap to run, so you can keep going for months.",
    sections: [
      { h2: "Pick a rhythm and keep it", md: `Choose one day and one start time and stay with it. People plan around a slot more easily than around announcements. If Saturday at 7 pm works, do not move it without a strong reason.

Say how long the cup lasts, such as two hours, and stick to it. A cup that sometimes ends at 9 pm and sometimes at midnight loses players.` },
      { h2: "Choose a format that runs itself", md: `The best weekly format is one you can run with little thought.

| Players | Format |
|---|---|
| 8 to 16 | Single elimination, best of one, best of three for the final |
| 16 to 32 | Groups then a knockout |
| Any size, short time | A fixed number of Swiss rounds |

Pick one and reuse it. The [bracket maker](/tools/brackets/) and [Swiss explainer](/guides/swiss-system-tournament-explained/) cover the options. Fewer decisions each week means fewer mistakes.` },
      { h2: "One page of rules", md: `Weekly players will not read a long rulebook. Write one page: how to join, start time, check-in deadline, how a match is reported, and what happens with a no-show. Pin it where players gather.

Copy the structure of the [rules template](/guides/esports-tournament-rules-template/) and cut it down. Add a line on conduct, using the [code of conduct template](/guides/player-code-of-conduct-template/) as a base.` },
      { h2: "A signup flow that costs nothing", md: `Use one link every week. Open it after the previous cup ends, close it an hour before start, and ask for a name and a contact. The [registration form tool](/tools/registration/) makes one.

Require a check-in 15 minutes before the start. Anyone who does not check in is dropped and the bracket is built from those who did. This single rule removes most no-show problems.` },
      { h2: "A ladder that connects the weeks", md: `A season makes a weekly cup matter. Give points for each result: for example, points for taking part and more for each round reached. Add them across weeks and publish a ladder.

Decide the scale once and publish it. At the end of a season, say four or eight weeks, give a small prize or a role to the top players. Explain tie-breaks in advance, as in [how to write tie-breaker rules](/guides/tournament-tiebreaker-rules-how-to-write/).` },
      { h2: "Share the work and keep it light", md: `You will burn out if you do everything every week. Find two or three regulars who can run the bracket, report results or referee. A short rota, with a briefing sheet, keeps it going when you are away.

Keep costs low. Most weekly cups run on a free bracket and a free chat group. If you add prizes, keep them small and sourced from sponsors, as in the [sponsor pitch guide](/guides/sponsor-pitch/).` },
      { h2: "Common mistakes", md: `- Changing the day or time often.
- Running a different format every week.
- No check-in, so the bracket breaks at the start.
- Doing everything yourself.
- Promising big prizes you cannot keep up.` },
    ],
    faq: [
      { q: "How do I run a weekly esports cup?", a: "Fix one day and time, use the same simple format each week, publish a one page rules sheet, take signups through one form that closes an hour before start, require a check-in, report results in one place and keep a points ladder across weeks. Share tasks with two or three regulars." },
      { q: "What format is best for a weekly tournament?", a: "A format you can run without much thought: single elimination for 8 to 16 players, groups plus a knockout for larger fields, or a fixed number of Swiss rounds when time is short. Pick one and reuse it, because changing the format every week increases mistakes and confusion." },
      { q: "How do I stop a weekly cup from burning me out?", a: "Share the work. Train two or three regulars to run the bracket, record results and referee, give them a short briefing sheet, and rotate duties. Keep costs and prizes small, reuse the same forms and rules each week, and stop adding extras that need your attention every time." },
    ],
    related: ["swiss-system-tournament-explained", "esports-tournament-rules-template", "player-code-of-conduct-template", "sponsor-pitch"],
    cta: { label: "Make this week's bracket", href: "/tools/brackets/" },
  },

  {
    slug: "valorant-custom-tournament-lobby-setup",
    title: "Valorant custom tournament lobby setup: rooms, sides, maps and checks",
    seoTitle: "Valorant custom tournament lobby setup",
    description: "How to set up a Valorant custom game for a tournament: lobby settings, team sides, map choice, spectators, pre-match checks and what to do when a player drops.",
    tag: "Game guide",
    answer: "Create a custom game, choose the map from your veto, set the mode and options on a written sheet, assign sides, check the rosters in the lobby, and confirm the start with both captains. Decide in advance what happens if a player disconnects.",
    intro: "Valorant custom games give organisers control, but only if everyone uses the same settings. Most disputes come from a lobby that was set up differently for different matches. The routine below makes each match start the same way.",
    sections: [
      { h2: "Before the match: the sheet", md: `Write the lobby settings on one sheet and use it for every match. Include the mode, cheats setting, overtime rules, and any option your event changes. Settings and options can change between game updates, so check the current options in the custom game screen before your first match and update the sheet.

Keep the sheet next to the bracket. A new referee can then set up a lobby correctly without asking anyone.` },
      { h2: "Maps and the veto", md: `Run the map veto before players enter the lobby, so the lobby only has to be created once. The [map veto guide](/guides/valorant-map-veto-explained/) explains the order for best of one and best of three.

Write the final map order in the match thread. If it is a series, note which team picked each map and which side the other team chose, so a dispute can be settled by reading the record.` },
      { h2: "Sides and rosters", md: `In Valorant, teams play attack and defence and swap after a set number of rounds. See the [format note on rounds and overtime](/guides/valorant-tournament-organiser/) for how to describe it in your rules.

At the lobby, check that each team has exactly the registered players. Match in-game names to your registration list. A player who is not on the list does not play, unless the rules allow a substitute. Your rules page should state the substitute policy in one line.` },
      { h2: "Who creates the lobby", md: `Decide who creates the lobby: an organiser account, or one captain per match. An organiser account gives you control, but it needs someone online for every match. A captain created lobby is faster to scale but gives you less control.

| Event size | Who creates lobbies |
|---|---|
| Small, a few matches | An organiser |
| Large, many matches | One referee per match |
| Casual, low stakes | A captain, with the sheet |

For a small event, create lobbies yourself. For a large event, give each match a referee who creates it and sends the invite to both captains.` },
      { h2: "Spectators and recording", md: `If you stream or record, decide how observers join. Add them to the lobby before the match, and set the delay you want for a live broadcast. Check what the current client offers for observers, because options differ over time.

Even with no stream, ask a referee to watch important matches, and ask players to record their own screens in knockout rounds. The [preventing cheating guide](/guides/preventing-cheating-in-online-tournaments/) has more on checks.` },
      { h2: "Disconnects and pauses", md: `Write the rule before it is needed. A common approach: a player may reconnect, the team may pause for a short, fixed time, and a team that cannot field the required players after that time forfeits the round or the map. Choose your own limits, publish them and apply them evenly.

Record each pause with the time and the reason in the match thread.` },
      { h2: "Common mistakes", md: `- Changing lobby settings between matches.
- Starting before the veto is finished.
- Not checking names against the roster.
- No rule for disconnects.
- Forgetting to update the sheet after a game update.` },
    ],
    faq: [
      { q: "How do I set up a Valorant custom tournament match?", a: "Run the map veto first, then create a custom game using a written settings sheet, assign sides, check that the lobby names match each team's registered roster, add observers if you stream, and confirm with both captains before the start. Use the same sheet for every match." },
      { q: "Who should create the lobby in a Valorant tournament?", a: "For small events, an organiser account gives the most control and consistency. For larger events, assign a referee to each match who creates the lobby and invites the captains. A lobby created by a captain scales easily but gives you less control, so it needs clear written settings." },
      { q: "What if a player disconnects in a Valorant match?", a: "Decide before the event and publish it: how long a player has to reconnect, how long a team may pause, and when a team forfeits a round or map. Write each pause with its time and reason in the match thread, and apply the same limits to every team." },
    ],
    related: ["valorant-map-veto-explained", "valorant-tournament-organiser", "preventing-cheating-in-online-tournaments", "best-of-1-3-5-series-length-explained"],
    cta: { label: "Plan the bracket", href: "/tools/brackets/" },
  },

  {
    slug: "backup-plan-when-internet-or-power-fails",
    title: "Backup plan for tournaments: what to do when internet or power fails",
    seoTitle: "Backup plan when internet or power fails",
    description: "How to plan for internet and power failures at a tournament: what to prepare, a decision tree, rules for paused matches, communication and a backup date.",
    tag: "Organiser guide",
    answer: "Plan for failure before the event: list what can break, assign a person to each risk, write a rule for paused and restarted matches, keep a backup date and tell players how you will communicate. A written plan turns an emergency into a routine.",
    intro: "Every organiser hits an outage sooner or later: Wi-Fi drops, a circuit trips, a phone dies at the wrong moment. The event survives if you decided in advance what to do. The plan does not need to be long. It needs to exist.",
    sections: [
      { h2: "List what can break", md: `Walk through the event and write down every dependency.

| Dependency | What failure looks like |
|---|---|
| Internet for the venue | Online matches stall; scores cannot be posted |
| Players' own connections | A player drops mid match |
| Power | Machines or screens go off |
| Your own device | Results sheet or bracket inaccessible |
| A key person | Referee or lead does not show |

Each line needs an owner and a fallback. A risk with no owner will be nobody's problem until it happens.` },
      { h2: "Internet failure at the venue", md: `Have a second connection ready: a mobile hotspot on a different network from the main line, or a second router. Test it before the day.

Decide what can run without internet: if you use a LAN, local play may continue. For online play, a venue outage may mean pausing until the connection returns. Set a time limit, such as 20 minutes, after which you switch to the backup or postpone.` },
      { h2: "A player's connection fails", md: `Players' connections fail more often than yours. Write the rule once: a short reconnect window, a pause limit per team, and a cut-off after which the match continues or is forfeited. The [no-shows guide](/guides/handling-no-shows-and-walkovers/) gives a base to adapt.

Apply the rule evenly, record each case and make the decision visible in the match thread.` },
      { h2: "Power failure", md: `Check the venue's backup options, and ask what the load limit is. Keep a torch, a few extra extension boards and a phone with the electrician's number.

For a LAN, a small uninterruptible power supply for the network switch and the admin machine lets you save results and communicate, even if the playing machines go off. See the [LAN checklist](/guides/lan-event-setup-checklist/) for the full setup.` },
      { h2: "Keep your records safe", md: `Do not keep the bracket and results in one place that needs the internet. Save a copy on your phone, a photo of the bracket every round, and a paper results sheet. If everything fails, you can continue from the paper.

Use the [bracket maker](/tools/brackets/) and export or screenshot the bracket after each round.` },
      { h2: "Tell people what is happening", md: `Silence makes a delay feel worse. Pick one place for announcements, such as a pinned message, and post a short update: what happened, what you are doing, and when the next update will be.

A line like "Internet is down; we are switching to the backup connection; next update in 15 minutes" is enough. Keep a template ready.` },
      { h2: "The backup date", md: `State a backup date when you announce the event: "If we cannot finish, the remaining matches run on this date." Players can plan around a known date, and you avoid arguments about what to do with unfinished rounds.

Decide how results carry over: matches already finished stand, and unfinished ones restart. Put it in the [rules template](/guides/esports-tournament-rules-template/).` },
      { h2: "Common mistakes", md: `- No second connection.
- Keeping the only copy of results online.
- No time limit on waiting for a fix.
- Different decisions for different teams.
- Not telling players what is happening.` },
    ],
    faq: [
      { q: "What should I do if the internet fails during a tournament?", a: "Switch to a backup connection such as a mobile hotspot on a different network, pause matches with a time limit you set in advance, tell players what is happening and when the next update comes, and decide whether to resume or use the backup date. Keep a paper or phone copy of the bracket and results." },
      { q: "How long should I wait before postponing a match?", a: "Set the limit before the event and publish it, for example 20 minutes for a venue outage and a shorter window for a single player's connection. After the limit, switch to the backup, continue without the player under your rule, or postpone to the backup date. Apply the same limit to every team." },
      { q: "Do I need a backup date for a one day event?", a: "It is a good idea. Announce a backup date with the event so players can plan, and state how results carry over: matches already completed stand and unfinished ones restart. A known fallback avoids arguments and gives you time to fix a serious problem instead of rushing." },
    ],
    related: ["lan-event-setup-checklist", "handling-no-shows-and-walkovers", "online-vs-lan-tournament-which-to-run", "esports-tournament-rules-template"],
    cta: { label: "Save and print your bracket", href: "/tools/brackets/" },
  },

  {
    slug: "cricket-super-over-and-tie-rules",
    title: "Cricket super over and tie rules for local tournaments",
    seoTitle: "Cricket super over and tie rules",
    description: "How to handle tied cricket matches in a local tournament: super over steps, what to do if it ties again, boundary countback alternatives and how to write the rule.",
    tag: "Sport guide",
    answer: "Decide your tie rule before the tournament: usually a super over of one over per side, and a second tie-break if that also ties. Write it on the rules page, name who decides, and use the same rule in every match so nobody argues on the day.",
    intro: "A tied match is the moment a tournament feels most tense, and the moment a missing rule causes the most arguments. A local event can borrow the idea of the super over and adapt it to its own limits of time, light and overs. The key is deciding early.",
    sections: [
      { h2: "What a super over is", md: `A super over is a one-over-each contest to break a tie. Each team picks batters and a bowler, bats for one over, and the team with more runs wins. It is common in limited overs cricket, and you can use it in tournaments of any level.

Rules at professional level vary and change, so for your event, write your own version. Keep it short and clear enough to read aloud before the match.` },
      { h2: "A simple version to copy", md: `1. If scores are level at the end of the match, play a super over.
2. Each team nominates up to three batters and one bowler.
3. Teams bat one over each. The team that batted second in the match bats first.
4. A team loses a fixed number of wickets, for example two, ends its over early.
5. The team with more runs wins.

The numbers are your choice. Choose them, publish them, and apply them in every match. In a box cricket event, adapt it to the format, as in the [box cricket rules guide](/guides/box-cricket-tournament-rules/).` },
      { h2: "If the super over also ties", md: `Write a second step. Common options:

- Another super over, with the bowling and batting roles swapped.
- A bowl-out, where each team bowls a few balls at the stumps.
- A fixed tie-break such as fewer wickets lost, or a coin toss for lower stakes matches.

Pick one. For a final, prefer a method that is decided on the field. For a group match where a tie only affects the table, you may share points. The [net run rate guide](/guides/cricket-net-run-rate-explained/) explains how tied matches feed into a table.` },
      { h2: "Tied matches in the league stage", md: `You do not need a super over in every match. In a league, a tied match can end with points shared, which avoids extra time on a long day. Decide which stage uses which rule:

| Stage | Tie rule |
|---|---|
| League matches | Share points, or a super over if time allows |
| Semi-finals and final | A super over, then a second tie-break |

Publish this in the [cricket tournament rules template](/guides/cricket-tournament-rules-template/) so teams know before the first ball.` },
      { h2: "Time and light", md: `Super overs need time. Add a buffer to your schedule, especially in a day-night or evening event, and decide the cut-off. If light fails or the ground closes, what happens? Your fallback might be a coin toss or the higher seed advancing.

The [schedule maker](/tools/schedule/) helps you check whether the day has room for extra overs in the later rounds.` },
      { h2: "Announce it before the match", md: `Read the rule aloud at the toss, both captains and umpires present. One sentence for the super over, one for what happens if that ties. Ask the scorer to write it on the scoresheet.

A rule read out and written down is much harder to dispute. The [dispute process guide](/guides/tournament-dispute-process-protest-window/) covers what happens if someone still objects.` },
      { h2: "Common mistakes", md: `- Not writing any tie rule.
- Using a different rule in different matches.
- No time buffer for extra overs.
- Letting teams argue over who bats first.
- Not telling both captains before the match.` },
    ],
    faq: [
      { q: "How does a super over work in a local tournament?", a: "Each team nominates a few batters and a bowler, bats one over, and the team with more runs wins. Many events let the team that batted second in the match bat first, and end a team's over early after a set number of wickets. You choose the numbers, publish them and apply them to every match." },
      { q: "What if the super over is also tied?", a: "Write a second step before the event. Options include another super over with roles swapped, a bowl-out, or a fixed tie-break such as fewer wickets lost. For a final, use a method decided on the field. For a league match where a tie only affects points, sharing points is simpler." },
      { q: "Do all matches need a super over?", a: "No. In a league stage, a tied match can end with shared points to save time. Use a super over and a second tie-break for knockout matches and finals, where one side must advance. Publish which stage uses which rule so teams know before the first ball." },
    ],
    related: ["cricket-tournament-rules-template", "cricket-net-run-rate-explained", "box-cricket-tournament-rules", "tournament-tiebreaker-rules-how-to-write"],
    cta: { label: "Plan the match schedule", href: "/tools/schedule/" },
  },

  {
    slug: "minecraft-bedwars-and-skywars-tournament-rules",
    title: "Minecraft Bed Wars and Sky Wars tournament rules for organisers",
    seoTitle: "Minecraft Bed Wars and Sky Wars tournament rules",
    description: "Rules and format ideas for Minecraft Bed Wars and Sky Wars tournaments: server choice, team sizes, banned items, match length, scoring and fair play checks.",
    tag: "Game guide",
    answer: "Choose a server and version, set team sizes, list banned mods and items, decide how matches are scored, and require a short fair play check. Because servers and mini-game rules change, write the settings you use and check them before each event.",
    intro: "Bed Wars and Sky Wars are popular for school and community events because they are quick, easy to watch and need no special equipment. They also depend heavily on the server, and servers change. Your rules should describe your setup, not assume a standard one.",
    sections: [
      { h2: "Pick the server and version", md: `Run on a server you control, or a server whose rules and owners allow tournaments. A private server gives you control over settings and spectators. A public server may restrict events or change maps, so ask the owners first.

State the game version in your rules and tell players which launcher or client to use. If you also run other Minecraft modes, see the [Minecraft tournament guide](/guides/minecraft-tournament-how-to-organise/).` },
      { h2: "Team sizes and format", md: `Choose a team size that fits the map: solo, duos, trios or fours. Smaller teams give more matches and less waiting. For a bracket, a team versus team match works well, and for a lobby of several teams, a points system is better.

| Entries | Suggested format |
|---|---|
| 8 to 16 teams | Single elimination, best of one |
| 16 to 32 teams | Groups then knockout |
| Many solo players | Lobby rounds with points |

Use the [bracket maker](/tools/brackets/) or [groups tool](/tools/groups/) to build it.` },
      { h2: "Mods, packs and items", md: `List what players may and may not use:

- Client mods: ban any that give an advantage, such as x-ray, auto clickers or radar. Say that cosmetic or performance mods are allowed, if you permit them.
- Texture packs: allow simple ones, ban any that make blocks see-through.
- Items and maps: use the server's standard setup and ban exploits.

The line between helpful and unfair mods is a judgement call, so name a referee who decides. See the [anti-cheating guide](/guides/preventing-cheating-in-online-tournaments/) for how to check.` },
      { h2: "Scoring", md: `Choose a scoring method and publish it:

- For bracket matches, the winner advances.
- For lobby rounds, give points for placement and for eliminations, and add them across rounds.

Decide the tie-break before you need it, for example more eliminations or a final round between tied players. The [tie-breaker rules guide](/guides/tournament-tiebreaker-rules-how-to-write/) has wording.` },
      { h2: "Match length and breaks", md: `Matches have natural lengths, but a slow match can delay the whole event. Set a maximum time and say what happens at the limit, such as a sudden death step or a win for the team with more beds or lives, based on the mode you play.

Leave a short break between rounds, so you can recheck the next lobby. Check your plan with the [schedule maker](/tools/schedule/).` },
      { h2: "Spectating and recording", md: `Add referees as spectators so they can watch for rule breaks. If you stream, check what delay the server allows. Ask players to record their own game in later rounds, so you can settle disputes.

Keep the invite and the lobby private until the match time, to avoid outsiders joining. After the match, ask the referee to note the final score and any incident in the match thread, so the record is complete before the next round starts.` },
      { h2: "Common mistakes", md: `- Not asking the server owners first.
- Leaving mods and packs unspecified.
- No maximum match length.
- Not naming a referee who decides.
- Not checking settings after a server update.` },
    ],
    faq: [
      { q: "What rules do I need for a Bed Wars tournament?", a: "Name the server and game version, set team sizes, list banned mods and texture packs, say how a match is scored or who advances, set a maximum match length and a tie-break, and name a referee who decides disputes. Check the server settings before each event because mini-games and maps can change." },
      { q: "Should I run my Minecraft tournament on a public server?", a: "Ask the owners first, since some public servers restrict events or change maps and rules. A private server gives you control over settings, spectators and lobbies, but needs someone to set it up. Whichever you choose, write the version and settings in your rules." },
      { q: "How do I stop cheating in a Minecraft tournament?", a: "Ban client mods that give an advantage, such as x-ray or radar, restrict see-through texture packs, add referees as spectators, ask players to record their screens in later rounds and name one referee who rules on borderline cases. Publish the penalties before the event." },
    ],
    related: ["minecraft-tournament-how-to-organise", "preventing-cheating-in-online-tournaments", "tournament-tiebreaker-rules-how-to-write", "group-stage-and-knockout-planning"],
    cta: { label: "Build the bracket", href: "/tools/brackets/" },
  },

  {
    slug: "tournament-communication-whatsapp-and-discord",
    title: "Tournament communication: WhatsApp and Discord setup that stays calm",
    seoTitle: "Tournament communication on WhatsApp and Discord",
    description: "How to set up WhatsApp and Discord for a tournament: announcement channels, captain groups, pinned rules, reporting results and keeping the noise down.",
    tag: "Organiser guide",
    answer: "Use one announcement-only place for official news, one captains' group for questions, and one place for results. Pin the rules and schedule, set posting rules, and name who answers. Fewer, clearer channels keep a tournament calm.",
    intro: "Most tournament confusion is a communication problem: the schedule is in one chat, the rules in another, and the latest change in a message nobody saw. A simple structure on WhatsApp or Discord fixes this, without any special software.",
    sections: [
      { h2: "Three places, three jobs", md: `Keep roles separate:

| Place | Who can post | What it is for |
|---|---|---|
| Announcements | Organisers only | Schedule, rules, changes, results |
| Captains' group | Captains and organisers | Questions, check-in, disputes |
| Match threads | Two teams and a referee | Lobby details and reports for one match |

On WhatsApp, use a Community or a broadcast list with only admins posting. On Discord, use a read-only announcements channel and role-based channels.` },
      { h2: "Pin the essentials", md: `Pin or link in one place:

- The rules.
- The schedule and bracket, using the [bracket maker](/tools/brackets/) or a [display screen](/tools/display-screen/).
- Contact names and what each person handles.

Then tell players "everything official is in Announcements". When they ask a question that is already pinned, point to it politely.` },
      { h2: "Discord setup", md: `On Discord, create roles for organisers, referees, captains and players. Give only organisers permission to post in announcements. Create a private channel per match if you have the capacity, or use threads.

Turn on a verification step to keep out spam, and write short channel descriptions. Add a rules channel that new members see first. Keep the number of channels small: fewer than ten for a one-day event.` },
      { h2: "WhatsApp setup", md: `WhatsApp groups get noisy quickly. Set the announcement group to admin-only posting. For captains, a separate group with a short name rule, such as "Team name, captain name".

Add a line at the top: "Questions about rules and schedule go here. Please do not forward memes." Mute-friendly rules help. Do not add players to groups without asking, and let them leave when the event ends.` },
      { h2: "Reporting results", md: `Pick one way for teams to report results and stick to it: a form, or a message in the match thread with a screenshot. Many arguments start when results arrive in three different places.

Have a referee confirm each result and post the official one in announcements. The [dispute process guide](/guides/tournament-dispute-process-protest-window/) explains the window for objections.` },
      { h2: "Tone and moderation", md: `Set the tone early: respectful, brief, on topic. Write a short conduct line and apply it evenly, using the [code of conduct template](/guides/player-code-of-conduct-template/) as a base. Remove abuse quickly and tell people why.

Respond to questions within a set time during event hours, and say when you are offline. Players are patient when they know when to expect an answer.` },
      { h2: "Privacy", md: `Phone numbers and in-game IDs are personal data. Share them only with those who need them, such as referees and captains. For under-18 players, follow your school's or club's policy. Do not post screenshots of private chats without consent.

After the event, close or archive the groups, so players are not left in a channel that keeps pinging.` },
      { h2: "Common mistakes", md: `- Everything in one chat group.
- Allowing anyone to post in announcements.
- Results reported in several places.
- No pinned rules.
- Leaving groups open and noisy after the event.` },
    ],
    faq: [
      { q: "How should I organise a tournament on Discord?", a: "Create roles for organisers, referees, captains and players, make an announcements channel only organisers can post in, a captains' channel for questions, and a private channel or thread for each match. Pin the rules and schedule, keep the number of channels small and add a verification step to stop spam." },
      { q: "Is WhatsApp good enough to run a tournament?", a: "Yes, for small and medium events. Use an admin only announcement group, a separate captains' group and short match groups if needed. Pin the rules and schedule, ask players to send results with screenshots in one place and close the groups after the event so they do not keep pinging." },
      { q: "How do I keep tournament chats from getting noisy?", a: "Separate announcements from questions, allow only organisers to post official news, pin the rules and schedule, set a short conduct line and answer questions within a stated time. Point players to pinned information politely and remove abuse quickly. Fewer channels with clear jobs keep things calm." },
    ],
    related: ["how-to-announce-a-tournament", "tournament-dispute-process-protest-window", "player-code-of-conduct-template", "tournament-volunteer-roles-and-briefing"],
    cta: { label: "Share the live bracket on a screen", href: "/tools/display-screen/" },
  },

  {
    slug: "chess-online-tournaments-lichess-and-chesscom",
    title: "Chess online tournaments: running events on Lichess and Chess.com",
    seoTitle: "Chess online tournaments on Lichess and Chess.com",
    description: "How to run an online chess tournament: choosing Arena or Swiss, time controls, fair play, pairing and tie-breaks, and what to publish before the first round.",
    tag: "Game guide",
    answer: "Pick the platform, choose Swiss or arena, set a time control, publish fair play and tie-break rules, and check player accounts before round one. Platform features change, so confirm the current options before announcing.",
    intro: "Chess is one of the easiest games to run online, because the big platforms already provide pairing and clocks. The organiser's job is to choose the format, set clear rules about fair play, and make sure players know how it works. This guide covers the decisions.",
    sections: [
      { h2: "Choose the platform", md: `Lichess and Chess.com both support organised events, and both change features over time, so check what is available to you now, including any limits on free accounts. Decide where players already have accounts, and whether you need private entry, a team, or a club.

Tell players the platform, the event link and how to join. For the basics of rules and scoring, see the [chess tournament rules guide](/guides/chess-tournament-rules-for-organisers/) and [chess points and tie-breaks](/guides/chess-points-system-and-tiebreaks/).` },
      { h2: "Swiss or arena", md: `The two main formats suit different goals.

| Format | How it works | Good for |
|---|---|---|
| Swiss | Fixed rounds, players with similar scores meet | A fair result with a fixed number of games each |
| Arena | Play as many games as you can in a time window | A casual, drop-in event |

A Swiss event gives each player the same number of games and a clearer winner. An arena is looser but easier to join late. See [how to run a Swiss chess tournament](/guides/how-to-run-a-swiss-chess-tournament/) for the logic.` },
      { h2: "Time controls", md: `Choose the time control to match the time you have. Rapid and blitz suit an evening event, and longer games suit a weekend. Remember to add time between rounds for late starts and disputes.

Publish the control in a simple form, such as the base time and the increment per move. Players should know before they register. Keep the control the same for every round.` },
      { h2: "Fair play", md: `Online chess has a well known cheating problem, because a player can consult an engine. You cannot fully remove it, but you can reduce it.

- Require players to use their real, established accounts.
- State that engine assistance is banned and what happens if it is found.
- Use the platform's own fair play tools and report suspicious accounts to it.
- For prize events, consider asking top finishers to explain a game or play a short verification match.

Write the rule clearly and apply it evenly. The [anti-cheating guide](/guides/preventing-cheating-in-online-tournaments/) covers general checks.` },
      { h2: "Pairings, byes and tie-breaks", md: `Let the platform pair the rounds, and explain the tie-breaks you will use, since many players do not know them. Buchholz is the most common first tie-break in a Swiss tournament, per the FIDE regulations. State the order you use, and say how a bye is scored.

Set a rule for late arrival: a player who is not present a few minutes after the round starts forfeits. See [no-shows and walkovers](/guides/handling-no-shows-and-walkovers/).` },
      { h2: "Before round one", md: `Send players a short message: the link, the format, the time control, the rules, and who to contact. Open a check-in period, and confirm accounts match registered names.

Use the [registration form tool](/tools/registration/) to collect names and usernames, and the [certificate maker](/tools/certificates/) for results.` },
      { h2: "Common mistakes", md: `- Not checking the platform's current features.
- Mixing time controls between rounds.
- No fair play rule.
- Not explaining tie-breaks.
- Accepting entries with new or unknown accounts for a prize event.` },
    ],
    faq: [
      { q: "Should an online chess tournament be Swiss or arena?", a: "Choose a Swiss for a fair result with the same number of games per player, and an arena for a casual, drop-in event where people can join late. Swiss fits prize events and school competitions, while an arena suits a relaxed evening. Confirm the options your platform currently offers." },
      { q: "How do I prevent engine cheating in online chess?", a: "You cannot remove it entirely, but you can reduce it: require established real accounts, state that engine help is banned and what the penalty is, use the platform's fair play tools, and for prize events consider asking top finishers to explain a game or play a short verification match." },
      { q: "What should I tell players before an online chess event?", a: "Send the event link, the platform, the format, the time control with increment, the fair play and late arrival rules, the tie-break order and who to contact. Collect names and usernames in a form beforehand so you can match accounts to registered players at check-in." },
    ],
    related: ["chess-tournament-rules-for-organisers", "how-to-run-a-swiss-chess-tournament", "chess-points-system-and-tiebreaks", "preventing-cheating-in-online-tournaments"],
    cta: { label: "Collect names and usernames", href: "/tools/registration/" },
  },

  {
    slug: "bgmi-points-cutoff-finals-format",
    title: "BGMI points cutoff finals format: how a cutoff final works",
    seoTitle: "BGMI points cutoff finals format explained",
    description: "How a points cutoff (race to a score) finals format works for BGMI and other battle royale events: the rule, an example, pros and cons, and how to explain it.",
    tag: "Format guide",
    answer: "In a points cutoff final, teams play matches as normal and the first team to reach a set total wins, but only by winning a match after reaching it. It rewards both consistency and a strong finish, at the cost of an unpredictable length.",
    intro: "Many battle royale events end with a cutoff or a similar race format: teams collect points across matches until one reaches a threshold. It is exciting, because the lead can change late, but it needs careful explanation and a plan for time. This guide shows how it works.",
    sections: [
      { h2: "The basic rule", md: `Teams play matches in a lobby and earn points for placement and eliminations, as in a normal points table. A cutoff score is set before the final. Once a team's total reaches the cutoff, that team is on match point. The team wins by winning a match, usually the first place in a match, while on match point.

Variations exist, so write your own version exactly. Say what counts as a win and whether the match that crosses the cutoff counts. The [points table guide](/guides/points-table/) covers building the scoring.` },
      { h2: "An example", md: `Suppose the cutoff is a set number you choose, and the points are scored as usual.

| After match | Leader's total | Status |
|---|---|---|
| 1 to 4 | Below cutoff | Normal play |
| 5 | Reaches cutoff | On match point |
| 6 | Does not win the match | Still on match point |
| 7 | Wins the match | Declared champion |

A team that is on match point must still win a match to take the title. Another team that is not on match point can overtake by winning matches and reaching the cutoff first, then winning one more.` },
      { h2: "Choosing the cutoff", md: `The cutoff decides how long the final lasts. A low cutoff ends the event quickly, and a high one makes it longer and rewards consistency.

Estimate the number of matches by playing through a simple example with your scoring. Then leave a margin. Because the length is not fixed, set a maximum number of matches: if no team wins by then, the highest total wins. Write this cap into the rules.` },
      { h2: "Pros and cons", md: `Pros:

- A comeback is possible until the end.
- It rewards a consistent team that also wins when it counts.
- It builds a clear finish for spectators.

Cons:

- The length is unpredictable, which is hard for schedules and streams.
- A team can be on match point and feel pressure from the first match.
- It needs clear explanation, or teams may feel the rule is unfair.

Compare with a fixed number of matches in [how many teams for your format](/guides/how-many-teams-for-your-format/).` },
      { h2: "Scheduling and breaks", md: `Plan the longest case. Use the match cap and the time per match to set the maximum length, and book the venue or stream for that long. Leave a break between matches, since players need rest, and organisers need time to update the table.

Use the [schedule maker](/tools/schedule/) to test the numbers, and publish the finish time as an estimate with a maximum.` },
      { h2: "Explaining it to teams", md: `Put it in the rules in plain words, with a worked example like the one above. Read it aloud at the captains' briefing and ask for questions. Show a live table with a marker when a team is on match point.

The [BGMI scrims guide](/guides/bgmi-scrims-how-to-organise/) and the [BGMI custom room guide](/guides/bgmi-custom-room-tournament/) cover the room side. Confirm current room and scoring options in the game before your event.` },
      { h2: "Common mistakes", md: `- Not writing the exact win condition.
- No cap on the number of matches.
- Setting the cutoff by guess with no example.
- Not telling teams who is on match point.
- Booking a venue or stream for only the shortest case.` },
    ],
    faq: [
      { q: "How does a points cutoff final work?", a: "Teams earn points for placement and eliminations across matches. When a team's total reaches the cutoff score, it is on match point, and it wins the title by winning a match from that position. Other teams can still overtake by winning matches and reaching the cutoff themselves." },
      { q: "How do I choose the cutoff score?", a: "Work through an example with your own scoring to see how many matches the cutoff usually takes. A low cutoff ends the event quickly, and a high one rewards consistency but runs longer. Add a cap on the number of matches, after which the highest total wins, so the schedule has a limit." },
      { q: "Is a cutoff format fair for teams?", a: "It rewards consistency and a strong finish, which many teams like, but it adds pressure and an unpredictable length. It feels fair when the rules include a clear win condition, a worked example, a match cap and a live table showing who is on match point." },
    ],
    related: ["bgmi-scrims-how-to-organise", "bgmi-custom-room-tournament", "points-table", "how-many-teams-for-your-format"],
    cta: { label: "Build the points table", href: "/tools/points-table/" },
  },
];
