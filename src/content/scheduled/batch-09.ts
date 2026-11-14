import type { Draft } from "./types";

/** Posts 80 to 89. */
export const BATCH_09: Draft[] = [
  {
    slug: "round-robin-with-an-odd-number-of-teams",
    title: "Round robin with an odd number of teams: byes, rounds and fairness",
    seoTitle: "Round robin with an odd number of teams",
    description: "How a round robin works with 5, 7 or 9 teams: one team sits out each round, how many matches and rounds you need, a worked schedule and how to keep it fair.",
    tag: "Format guide",
    answer: "With an odd number of teams, add an imaginary team called a bye. Whoever is paired with the bye sits out that round. With n teams you play n rounds, n(n-1)/2 matches in total, and every team has exactly one rest round.",
    intro: "Round robin schedules are easy with an even number of teams, because everyone plays every round. With five, seven or nine teams, someone is always left over. The standard fix is old and simple, and it works for any odd number.",
    sections: [
      { h2: "The idea: add a ghost team", md: `Add one imaginary team, often called Bye, so the number becomes even. Build the schedule as usual. In each round, the team paired with Bye does not play and rests.

Because every team meets Bye exactly once, every team rests exactly once. That is what keeps it fair: nobody rests twice while another team rests never.` },
      { h2: "The numbers", md: `For n teams, each plays n-1 real matches, so the total is n(n-1)/2 matches. With an odd n, there are n rounds, since the ghost team makes the count n+1.

| Teams | Rounds | Matches in total | Matches per round |
|---|---|---|---|
| 5 | 5 | 10 | 2 |
| 7 | 7 | 21 | 3 |
| 9 | 9 | 36 | 4 |
| 11 | 11 | 55 | 5 |

Compare with an even number: 6 teams need only 5 rounds and 15 matches. Adding one team to make it odd adds a whole round.` },
      { h2: "A worked schedule for five teams", md: `Teams A to E, plus the ghost G. Use the circle method: keep one team fixed and rotate the others.

| Round | Matches | Rests |
|---|---|---|
| 1 | A v E, B v D | C |
| 2 | A v D, C v E | B |
| 3 | A v B, C v D | E |
| 4 | A v C, B v E | D |
| 5 | B v C, D v E | A |

Check that every pair appears once, and that each team rests once. The [round robin generator](/tools/round-robin/) builds this for any number, so you do not have to do it by hand.` },
      { h2: "Is the rest round fair?", md: `A rest round is not equal for all teams in every case. A team that rests in the last round already knows the results of its rivals, and a team that rests first has a longer gap. In a close table this can matter.

Reduce the effect:

- Publish the schedule in advance, so nobody can claim it was changed.
- If the table is tight, play the final round at the same time.
- Draw the order of teams by lot, as in [how to draw a fair draw](/guides/how-to-draw-a-fair-tournament-draw/).` },
      { h2: "Alternatives to a rest round", md: `If you do not want a team to sit idle, you can:

- Add a friendly or exhibition match for the resting team.
- Use the rest round to schedule a rematch, which makes a double round robin, as in [round robin types](/guides/round-robin-single-double-and-tiebreaks/).
- Invite one more team to make the number even, if your resources allow.

For a Swiss event, byes are handled automatically. See [the Swiss system](/guides/swiss-system-tournament-explained/).` },
      { h2: "Points and tie-breaks", md: `A rest is not a match. It earns no points and no wins. Make sure your table shows matches played, so a team with fewer matches played is not wrongly ranked. Use a fixed tie-break order, as in [how to write tie-breaker rules](/guides/tournament-tiebreaker-rules-how-to-write/), and the [points table tool](/tools/points-table/) to compute it.` },
      { h2: "Common mistakes", md: `- Letting a team rest twice.
- Counting a rest as a win or a walkover.
- Forgetting the extra round that an odd number adds.
- Changing the order of rounds after publishing.
- Not showing matches played in the table.` },
    ],
    faq: [
      { q: "How do you schedule a round robin with 5 teams?", a: "Add an imaginary sixth team called Bye so the number is even, then use the circle method. There are five rounds with two matches each, ten matches in total, and every team rests exactly once, when it is paired with Bye. A generator tool builds it in seconds." },
      { q: "How many rounds does an odd round robin need?", a: "As many rounds as there are teams. Five teams need five rounds, seven teams need seven, nine teams need nine. Each team plays one fewer match than the number of rounds, because it rests once. The total number of matches is n times n minus one, divided by two." },
      { q: "Is it unfair that one team rests each round?", a: "It is fair on average, because every team rests exactly once. It can matter in a tight table, since a team resting last sees its rivals' results. Publish the schedule in advance, draw the team order by lot, and consider playing the last round at the same time." },
    ],
    related: ["round-robin-single-double-and-tiebreaks", "how-to-draw-a-fair-tournament-draw", "tournament-tiebreaker-rules-how-to-write", "swiss-system-tournament-explained"],
    cta: { label: "Generate the round robin", href: "/tools/round-robin/" },
  },

  {
    slug: "pubg-mobile-scrims-and-lobby-management",
    title: "PUBG Mobile scrims and lobby management: slots, rooms and results",
    seoTitle: "PUBG Mobile scrims and lobby management",
    description: "How to manage PUBG Mobile scrims: filling slots, custom room setup, waiting lists, check-in, a points table, handling no shows and keeping scrims running every week.",
    tag: "Game guide",
    answer: "Run scrims on a fixed schedule with a capped slot list, a waiting list and a check-in. Create custom rooms with written settings, send details close to start time, track points in one sheet and remove repeat no-shows. Predictability keeps teams coming back.",
    intro: "Scrims give teams practice and give your community a reason to gather every week. They also create a steady stream of small problems: empty slots, late rooms, disputes about points. Good lobby management reduces all of these.",
    sections: [
      { h2: "Fixed schedule, capped slots", md: `Choose a regular day and time. Cap the number of squads to what a room holds, since a match is a 100-player battle royale in Classic mode, according to the game's store listing. Allow a waiting list.

Use a signup form with a deadline an hour before the start. The [registration form tool](/tools/registration/) builds one. Publish the list of confirmed squads at the deadline so teams know whether they are in.` },
      { h2: "Check-in and waiting list", md: `Open a check-in 15 to 20 minutes before the start. A squad that does not check in loses its slot to the first team on the waiting list. This one rule removes most empty slots.

Keep a record of repeated no-shows, and apply a clear consequence, such as one missed session of suspension after two no-shows. The [no-shows guide](/guides/handling-no-shows-and-walkovers/) gives wording.` },
      { h2: "Custom room setup", md: `Create rooms with the same settings every session, and write them on a sheet. Check the options in the current version of the game before each season, since modes and settings change.

Send room details shortly before the start, only to captains. For several rooms, use a room per tier or per group of squads, and name each room clearly. See [PUBG Mobile tournament rules](/guides/pubg-mobile-tournament-rules-for-organisers/) for fair play rules to reuse.` },
      { h2: "Scoring and the table", md: `Use points for placement and eliminations, choose the scale, and publish it. Keep it the same across sessions, so teams can track progress. The [points table guide](/guides/points-table/) and the [PUBG Mobile results guide](/guides/pubg-mobile-custom-room-results/) show how to record it.

After each match, post a screenshot of the table. At the end of the session, post the final table and the winner.` },
      { h2: "Managing several lobbies", md: `When you have more squads than one room holds, split them into lobbies.

1. Rank squads by recent results or draw them by lot.
2. Put strong squads in the main lobby and others in development lobbies, or mix for fairness.
3. Give each lobby a lead who creates the room and records results.
4. Combine the tables at the end if you want one overall ranking.

Rotate squads between lobbies across sessions so nobody is stuck.` },
      { h2: "Rules and fair play", md: `Keep rules short: registered squads only, no teaming, no emulators or modified clients if you run mobile only, respectful chat. The [mobile device rules guide](/guides/mobile-esports-tournament-device-and-network-rules/) and [preventing cheating](/guides/preventing-cheating-in-online-tournaments/) give wording.

Ask squads to record gameplay in important sessions, and tell them when you may request it.` },
      { h2: "After the session", md: `Close each session properly. Post the final table, thank the squads, and note any incident: a late room, a dispute, a squad removed. Keep these notes in one place, because they show patterns over weeks, such as the same squads arriving late or the same slot times failing.

Announce the next session before people log off, with the day, time and signup link. A scrim programme survives on rhythm, so the next date should always be public. Once a month, ask squads for feedback and adjust the schedule or the lobby split if several teams ask for the same change.` },
      { h2: "Common mistakes", md: `- Sending room details hours early.
- No check-in, so slots stay empty.
- Changing the points scale mid-season.
- No consequence for repeated no-shows.
- Running scrims at different times each week.` },
    ],
    faq: [
      { q: "How do I run PUBG Mobile scrims every week?", a: "Fix one day and time, cap the squads to what a room holds, collect signups with a deadline, keep a waiting list, require a check-in before the start, create custom rooms with the same written settings and track points in one sheet. Remove squads that repeatedly no-show." },
      { q: "How do I handle more squads than one room holds?", a: "Split them into lobbies by recent results or by lot, give each lobby a lead who creates the room and records results, and combine the tables if you want one overall ranking. Rotate squads between lobbies across sessions so nobody stays stuck in a weaker or a stronger room." },
      { q: "When should I share room details?", a: "Share them only with captains, shortly before the start, such as 10 to 15 minutes before. Sending them hours early lets outsiders join or share the room, and squads may leave and forget. A check-in first, then the room details, is a reliable order." },
    ],
    related: ["bgmi-scrims-how-to-organise", "pubg-mobile-tournament-rules-for-organisers", "pubg-mobile-custom-room-results", "handling-no-shows-and-walkovers"],
    cta: { label: "Build the scrim points table", href: "/tools/points-table/" },
  },

  {
    slug: "tournament-entry-fee-and-refund-policy",
    title: "Tournament entry fee and refund policy: what to charge and what to promise",
    seoTitle: "Tournament entry fee and refund policy",
    description: "How to set a tournament entry fee and write a refund policy: what the fee covers, when to refund, handling cancellations and no-shows, and a short policy to copy.",
    tag: "Organiser guide",
    answer: "Set the fee from your costs divided by the number of teams you are confident about, say what it covers, and publish a refund policy before taking any money: full refund if you cancel, a cut-off date for players, and no refund after the cut-off. Keep records of every payment.",
    intro: "Money turns small misunderstandings into serious disputes. A fee with no stated purpose, or a refund promised in a chat message, leads to arguments and damaged trust. A short written policy, published before anyone pays, prevents most of them.",
    sections: [
      { h2: "Do you need a fee?", md: `Many events can run without one, as in [running a tournament with no budget](/guides/run-a-tournament-with-no-budget/). A fee makes sense when you have real costs: venue, referees, printing, prizes.

A fee also improves commitment, since players who paid are more likely to show up. If you charge, be sure you can explain exactly what it pays for.` },
      { h2: "Set the amount", md: `Start from the budget. Add your costs, subtract confirmed sponsor money, and divide by the number of teams you are confident of. The [budget template](/guides/tournament-budget-template/) shows the arithmetic.

| Costs | Confirmed sponsor | Teams | Fee per team |
|---|---|---|---|
| 5,600 | 3,000 | 16 | 163, round to 170 |

The numbers are an example. Test it with fewer teams, and decide the minimum number you need to run the event.` },
      { h2: "Say what the fee covers", md: `Write one line: "The entry fee covers the venue, referees, printing and the prize pool." If part of it goes to prizes, give the prize pool or the share, and the payout split, as in [prize pool and payout split](/guides/tournament-prize-pool-and-payout-split/).

Players accept a fee more easily when they see where it goes.` },
      { h2: "A refund policy to copy", md: `Publish this before taking payment, and adapt the numbers.

1. If the organiser cancels the event, every fee is refunded in full within [7] days.
2. If a team withdraws before [date], it receives a full refund.
3. If a team withdraws after [date], the fee is not refunded, because costs are committed.
4. A team that does not show up is not refunded.
5. If a team is disqualified for breaking the rules, the fee is not refunded.
6. If the event is postponed, fees roll over to the new date, or are refunded on request.

Put the policy on the registration page, and ask captains to accept it.` },
      { h2: "Taking and recording payments", md: `Use a payment method that leaves a record, such as a bank transfer or a payment link, and note the date, the team and the reference. Do not rely on messages alone.

Keep a simple sheet: team, amount, date, status. Send a confirmation to each captain. This protects you and the teams when someone asks "did you get my payment?".` },
      { h2: "Check local rules", md: `Rules about collecting money, prizes and taxes differ by place and by organisation. If your event runs under a college or club, follow its policy and ask an officer. If you run it commercially, check the local requirements. This guide is general advice, not legal advice.` },
      { h2: "Cancellations and changes", md: `If you cancel or postpone, tell teams at once with a clear message: what happened, what you will do with fees, and when. Pay refunds promptly and keep proof.

Avoid changing the policy after people have paid. If you must, tell everyone and offer a refund to those who object.` },
      { h2: "Common mistakes", md: `- Taking money before publishing a policy.
- Promising a refund in a chat message.
- No record of payments.
- Setting the fee without counting costs.
- Changing the policy after teams paid.` },
    ],
    faq: [
      { q: "How do I decide the entry fee for a tournament?", a: "Add up your costs, subtract confirmed sponsor money, and divide by the number of teams you are confident of, then test the result with fewer teams. Decide the minimum number of teams needed to run the event, and say on the registration page what the fee covers, including any prize pool share." },
      { q: "What should a tournament refund policy say?", a: "It should give a full refund if you cancel, a cut-off date for teams to withdraw with a refund, no refund after the cut-off or for no-shows and disqualifications, and what happens if the event is postponed. Publish it before taking payment and ask captains to accept it at registration." },
      { q: "How do I keep records of entry fees?", a: "Use a payment method that leaves a record, such as a bank transfer or payment link, and keep a sheet with team, amount, date, reference and status. Send each captain a confirmation. If anyone asks whether a payment arrived, you can answer from the record instead of from memory." },
    ],
    related: ["tournament-budget-template", "tournament-prize-pool-and-payout-split", "run-a-tournament-with-no-budget", "tournament-registration-form-fields"],
    cta: { label: "Add the policy to the registration form", href: "/tools/registration/" },
  },

  {
    slug: "scheduling-matches-across-courts-and-rooms",
    title: "Scheduling matches across courts and rooms: a method that works",
    seoTitle: "Scheduling matches across courts and rooms",
    description: "How to schedule tournament matches across several courts, pitches or rooms: counting slots, avoiding clashes, rest time for teams, a worked example and a check.",
    tag: "Organiser guide",
    answer: "Count the matches, divide by the courts to get time slots, assign matches slot by slot so no team plays twice at once, give teams rest time between games and keep the final slots for the biggest matches. Check the plan against the real clock before you publish.",
    intro: "A schedule is a puzzle with three constraints: every match needs a place, no team can be in two places at once, and everyone needs rest. A simple method and a worked example make it manageable, even without special software.",
    sections: [
      { h2: "Count matches and slots", md: `Start with the number of matches, which your format gives you. See [how many teams for your format](/guides/how-many-teams-for-your-format/) for counts. Then divide by the number of courts, pitches or rooms that can run at once.

| Matches | Courts | Slots (rounded up) |
|---|---|---|
| 24 | 2 | 12 |
| 24 | 3 | 8 |
| 31 | 4 | 8 |

Multiply slots by the length of a slot, which is the match time plus a changeover gap. That is your minimum day length.` },
      { h2: "Use slot lengths that include gaps", md: `A match slot is longer than a match. Add time for teams to arrive, for scorers to record the result, and for the next teams to warm up. A 20 minute match may need a 30 minute slot.

If matches vary in length, such as best of three series, plan for the longest case and keep a buffer at the end of the day. Estimates that use the best case always overrun.` },
      { h2: "Assign matches slot by slot", md: `For each slot, choose matches such that no team appears twice. A simple method:

1. List the matches of the round.
2. Place them into the first slot until you run out of courts.
3. Put the rest in the next slot.
4. Check that no team plays twice in a slot, or in consecutive slots without rest.

In a group stage, play the groups' matches in rounds so that each team plays once per round. The [schedule maker](/tools/schedule/) does this for you.` },
      { h2: "Rest time and fairness", md: `Give every team a minimum rest, such as one slot between matches. If one team plays back to back and another has long gaps, you will hear about it.

Balance the number of early and late slots across teams. In a group stage, rotate so that no team always plays first or last. In knockout rounds, a team that wins its first match plays again soon, so make sure the break is similar for both teams in the next match.` },
      { h2: "A worked example", md: `Eight teams in two groups of four, one round robin each, six matches per group, twelve in total, on two courts.

| Slot | Court 1 | Court 2 |
|---|---|---|
| 1 | A1 v A2 | B1 v B2 |
| 2 | A3 v A4 | B3 v B4 |
| 3 | A1 v A3 | B1 v B3 |
| 4 | A2 v A4 | B2 v B4 |
| 5 | A1 v A4 | B1 v B4 |
| 6 | A2 v A3 | B2 v B3 |

Six slots, and every team plays once per two slots. Add semi-finals and a final after.` },
      { h2: "Publish and keep it live", md: `Publish the schedule with times, courts and teams, and a note that times may shift. Put it on a wall and share it digitally, and update it as matches finish. A [display screen](/tools/display-screen/) works well.

Appoint one person to keep the schedule, and tell teams to check it. If you must move a match, announce it in the same place as the schedule.` },
      { h2: "Common mistakes", md: `- Planning the best case rather than the worst.
- No gap between slots.
- A team playing two matches at once.
- Unbalanced rest between teams.
- Changing times without telling teams.` },
    ],
    faq: [
      { q: "How do I schedule matches across several courts?", a: "Count the matches, divide by the number of courts to get slots, then fill each slot with matches so that no team appears twice, leaving rest between games. Use slot lengths that include gaps for arrival and scoring, plan for the longest case and keep a buffer. A scheduling tool does the assignment automatically." },
      { q: "How long should a match slot be?", a: "Longer than the match itself. Add time for teams to arrive, scorers to record the result and the next teams to warm up, for example a 30 minute slot for a 20 minute match. For series, plan for the longest case and keep a buffer at the end of the day, because best-case estimates overrun." },
      { q: "How do I keep a schedule fair for all teams?", a: "Give every team a minimum rest between matches, balance early and late slots by rotating them across teams and make the break before a knockout match similar for both sides. Publish the schedule in advance and announce any change in the same place so teams see it." },
    ],
    related: ["how-many-teams-for-your-format", "group-stage-and-knockout-planning", "round-robin-with-an-odd-number-of-teams", "handling-no-shows-and-walkovers"],
    cta: { label: "Build the schedule", href: "/tools/schedule/" },
  },

  {
    slug: "one-v-one-mobile-game-fair-settings",
    title: "One versus one mobile game tournaments: fair settings and rules",
    seoTitle: "One versus one mobile game tournament rules",
    description: "How to run a one versus one mobile game tournament fairly: shared settings, hosting, screen proof, disconnect rules and device checks.",
    tag: "Game guide",
    answer: "Fix the game version and settings, decide who hosts each match, require a screenshot of the result from both players, write a disconnect rule and check devices. In 1v1 events there is no teammate to blame, so clear, even rules matter more.",
    intro: "One versus one events are quick to organise: no rosters, no captains. But every dispute is personal, and a lag spike or a disconnect decides a match. Fair settings and a short, strict routine protect both players.",
    sections: [
      { h2: "Settings and version", md: `Write the settings on one sheet: game version, mode, match length, and any option that affects fairness. Settings and modes change with updates, so check them before each event, and tell players which version to use.

Test one match yourself with another person. If the setup takes ten minutes, tell players to arrive early.` },
      { h2: "Who hosts", md: `Many 1v1 games need one player to create a room and invite the other. Choose a rule: the higher seed hosts, or the first-named player in the bracket. Set a time limit for the invite, such as five minutes.

If hosting matters for the game, for example because the host has a lower delay, alternate hosting in a series, so each player hosts about half the time.` },
      { h2: "Format", md: `Pick the bracket by the number of players.

| Players | Format |
|---|---|
| Up to 16 | Single elimination |
| 16 to 32 | Groups then a knockout, or double elimination |
| Large field | Swiss or qualifier rounds |

Use the [bracket maker](/tools/brackets/) and see [best of 1, 3 and 5](/guides/best-of-1-3-5-series-length-explained/) for series lengths. For the final, a longer series is more convincing.` },
      { h2: "Proof of results", md: `Both players send a screenshot of the final score with both names visible, to one place. If screenshots disagree, ask for a recording or a short call. A referee records the official result.

The [dispute process guide](/guides/tournament-dispute-process-protest-window/) has a window and wording. Keep results public in the bracket, so a mistake is visible quickly.` },
      { h2: "Disconnects", md: `In 1v1 a disconnect decides the match, so write the rule precisely. For example: a player may reconnect within a set time, a limited number of times, and the time limit applies to both players. A player who disconnects repeatedly forfeits.

Choose the numbers yourself and publish them. Compare with the approach in the [EA FC rules guide](/guides/ea-fc-fifa-tournament-rules/), which uses similar logic.` },
      { h2: "Devices and fair play", md: `If the game is mobile, set device rules: phones only or phones and tablets, no emulators, notifications off, phone charged. See [mobile device and network rules](/guides/mobile-esports-tournament-device-and-network-rules/) for a rules page to copy.

Ask players to record their screens in later rounds, so you can settle disputes fairly.` },
      { h2: "Seeding and byes in a solo bracket", md: `Solo events often have uneven numbers, so some players get a bye in the first round. Seed by past results if you have them, or draw by lot in public. The [seeding guide](/guides/how-to-seed-a-tournament-bracket/) and [byes explained](/guides/tournament-bracket-byes-explained/) cover both. Give byes to the top seeds, and say so in advance.

Publish the bracket with times for each round, and ask players to be ready ten minutes before. A player who is not present within the grace period forfeits, as in the [no-shows guide](/guides/handling-no-shows-and-walkovers/).` },
      { h2: "Common mistakes", md: `- No written settings, so each match differs.
- No time limit for creating the room.
- Accepting results without a screenshot.
- Vague disconnect rules.
- Letting one player host every match in a series.` },
    ],
    faq: [
      { q: "How do I run a fair 1v1 mobile game tournament?", a: "Fix the game version and settings on a sheet, decide who hosts each match and how long they have to send the invite, require screenshots of the final score from both players, write a precise disconnect rule and set device rules such as no emulators and notifications off. Record the official result in a public bracket." },
      { q: "Who should host a 1v1 match?", a: "Use a rule everyone knows: the higher seed hosts, or the first-named player in the bracket. Set a time limit for the invite. If hosting gives an advantage in the game, alternate hosting inside a series so each player hosts about half the games." },
      { q: "What should a disconnect rule say in a 1v1 event?", a: "State how long a player has to reconnect, how many times they may reconnect and what happens after that, such as forfeiting the game or match. The limits are your choice, but they must be published and applied equally, because in 1v1 a single disconnect can decide the result." },
    ],
    related: ["ea-fc-fifa-tournament-rules", "best-of-1-3-5-series-length-explained", "mobile-esports-tournament-device-and-network-rules", "tournament-dispute-process-protest-window"],
    cta: { label: "Draw the bracket", href: "/tools/brackets/" },
  },

  {
    slug: "live-scoreboard-on-a-tv-for-your-tournament",
    title: "Live scoreboard on a TV for your tournament: setup in 15 minutes",
    seoTitle: "Live scoreboard on a TV for your tournament",
    description: "How to show a live scoreboard or bracket on a TV at your tournament: what to display, hardware you need, a simple setup, readable layouts and a plan if it fails.",
    tag: "Organiser guide",
    answer: "Connect a laptop or a phone to a TV, open a display screen page that shows your bracket, standings or schedule, use large text and high contrast, and keep a printed copy as backup. A live board saves you from answering the same question all day.",
    intro: "Players and spectators keep asking the same questions: who plays next, where, what is the score? A scoreboard on a TV answers them without you. It does not need a streaming rig, only a screen, a link and a bit of planning.",
    sections: [
      { h2: "What to show", md: `Choose one or two views, not everything.

| View | Useful for |
|---|---|
| Bracket | Knockout events, to see who plays next |
| Standings | Group or league events |
| Schedule with courts | Large events with many matches |
| Announcements | Rules, delays, results |

The [display screen tool](/tools/display-screen/) shows these on a page designed for a large screen. Rotate views every 20 to 30 seconds if you show more than one.` },
      { h2: "Hardware", md: `You need a screen and a source.

- A TV or a monitor with an HDMI port.
- A laptop, or a phone or a small streaming device that can mirror a page.
- An HDMI cable long enough to reach, and an adapter if your device needs one.
- Power for both the screen and the source.

Test the connection before the day. Some venues have a projector and a fixed screen, so ask what is there and what inputs it takes.` },
      { h2: "Set it up", md: `1. Place the screen where players and spectators can see it, near the entrance or the results desk.
2. Connect the source and set the display to full screen.
3. Open the display page and check the text is readable from the back of the room.
4. Turn off sleep and screen savers, and disable notifications on the device.
5. Keep the device plugged in.

Do a ten minute test at the venue the day before.` },
      { h2: "Make it readable", md: `Large text beats clever design. Use high contrast, a few columns, and plain names. Test from the furthest seat. If you cannot read it from there, make the text larger or show fewer rows.

Avoid showing private information such as phone numbers. Show team names and scores only.` },
      { h2: "Keep it updated", md: `A scoreboard that is wrong is worse than none. Appoint one person to update results after each match, and make sure the page refreshes. If you update by hand, do it as soon as the referee confirms the result.

Post the same results in your announcement channel, as in [tournament communication](/guides/tournament-communication-whatsapp-and-discord/), so remote teams see them too.` },
      { h2: "Backup plan", md: `Screens fail. Keep a printed bracket and schedule on a wall, made with the [bracket maker](/tools/brackets/) or the [schedule maker](/tools/schedule/). If the TV goes down, update the paper copy by hand. The [backup plan guide](/guides/backup-plan-when-internet-or-power-fails/) covers other failures.` },
      { h2: "Adding sponsors and a stream", md: `A scoreboard is also a place to thank sponsors. Add a rotating slide with their names and a short line, and agree the wording with them first. Keep it brief, so the useful information still dominates the screen.

If you also stream, the same page can serve as an overlay or as a source for your broadcast software. Test it at the same resolution as your stream, and keep the text large enough to read on a phone. The [sponsor pitch guide](/guides/sponsor-pitch/) explains how to describe what sponsors get, so you can list the screen as one of the benefits.` },
      { h2: "Common mistakes", md: `- Showing too much on one screen.
- Text too small for the back of the room.
- Screen sleeping during the event.
- Nobody assigned to update results.
- No printed backup.` },
    ],
    faq: [
      { q: "How do I show a live bracket on a TV?", a: "Connect a laptop or a device that can mirror a page to a TV over HDMI, open a display screen page showing your bracket, standings or schedule, set it to full screen, turn off sleep and notifications, keep the device plugged in and test it at the venue the day before." },
      { q: "What should a tournament scoreboard show?", a: "One or two views: the bracket for knockouts, standings for groups or leagues, a schedule with courts for big events, and an announcements slide for rules and delays. If you show several, rotate them every 20 to 30 seconds. Use large text and keep private details off the screen." },
      { q: "What if the screen fails during the event?", a: "Keep a printed bracket and schedule on a wall as a backup, and update it by hand if the screen goes down. Assign one person to results, and post the same results to your announcement channel so teams see updates even without the TV." },
    ],
    related: ["tournament-seating-and-room-layout", "backup-plan-when-internet-or-power-fails", "tournament-communication-whatsapp-and-discord", "how-to-announce-a-tournament"],
    cta: { label: "Open the display screen", href: "/tools/display-screen/" },
  },

  {
    slug: "certificates-for-volunteers-and-referees",
    title: "Certificates for volunteers and referees: wording, design and delivery",
    seoTitle: "Certificates for volunteers and referees",
    description: "How to make certificates for volunteers and referees: what to write, role titles, hours, signatures, bulk printing from a list, digital delivery and common mistakes.",
    tag: "Organiser guide",
    answer: "A volunteer certificate names the person, the role, the event, the date and the organiser's signature, and can state hours if you tracked them. Make them from one list so names are right, and deliver them soon after the event, digitally or on paper.",
    intro: "For students especially, a certificate from a real event is useful: it goes on a record, an application or a profile. It also costs almost nothing, and it tells volunteers their work mattered. The only way to get it wrong is to be late, or to misspell a name.",
    sections: [
      { h2: "What a certificate should say", md: `Include:

- The person's full name, as they want it written.
- The role: referee, scorer, check-in volunteer, technical lead.
- The event name, the date and the place or "online".
- A short line on what they did.
- The organiser's name, signature or stamp.

Optionally add the number of hours, if you recorded them. Do not invent hours, since a certificate is only worth something if it is accurate.` },
      { h2: "Wording that works", md: `Keep it short and specific.

"This certificate is awarded to **[Name]** in recognition of their work as **[Role]** at **[Event]**, held on **[Date]**. They [one specific contribution, such as officiated eight matches or ran team check-in]."

A specific line makes the certificate more useful to the reader than "for outstanding contribution". The [certificate wording guide](/guides/certificate-wording/) has more examples for winners and participants.` },
      { h2: "Role titles", md: `Use accurate titles, and use the same ones in your volunteer briefing. If you use [volunteer roles](/guides/tournament-volunteer-roles-and-briefing/) and [referee roles](/guides/tournament-referee-roles-and-duties/), copy the titles from there.

| Role | A short description |
|---|---|
| Referee | Officiated matches and recorded results |
| Scorer | Kept scores and updated standings |
| Check-in volunteer | Registered teams and checked rosters |
| Technical lead | Set up and ran the equipment |
| Event coordinator | Managed volunteers and the schedule |` },
      { h2: "Make them from one list", md: `Keep one sheet: name, role, hours if recorded, email. Make every certificate from that sheet, so spellings are consistent and nobody is missed. The [certificate maker](/tools/certificates/) prints one page per name from a list.

Ask volunteers to confirm the spelling of their name at the briefing or in the thank-you message. Fixing a name before printing takes seconds. Fixing it afterwards takes a reprint.` },
      { h2: "Deliver soon", md: `Send certificates within a few days. A digital copy by email or chat is enough for most people, and a printed copy is a nice extra for those who want it. Add a short thank-you message.

If you wait months, people forget and the certificate means less. Put "send certificates" on your post-event checklist, and set a date.` },
      { h2: "Signatures and authenticity", md: `If your college or club has a rule about signatures or stamps, follow it. Where a staff member signs, ask them before the event so you are not chasing them later.

Do not use another organisation's logo or name without permission. A certificate with a fake signature is worse than none.` },
      { h2: "A short thank-you message to send", md: `Send the certificate with a message of two or three lines: "Thank you for [role] at [event]. Your work on [specific task] kept the day running. Your certificate is attached. If your name is wrong, reply and we will fix it. We hope to see you at the next event."

It costs a minute, and it invites people back. Volunteers who feel noticed return, and they bring friends. Keep a list of those who said yes to the next event, and invite them first when you plan it, using the same role sheet you used this time.` },
      { h2: "Common mistakes", md: `- Misspelling names.
- Vague wording that says nothing about the work.
- Listing hours nobody recorded.
- Sending certificates months late.
- Using logos without permission.` },
    ],
    faq: [
      { q: "What should a volunteer certificate include?", a: "The person's full name, their role, the event name and date, a short line on what they did, and the organiser's name and signature or stamp. Add hours only if you recorded them. A specific line such as officiated eight matches is more useful to a reader than a general phrase." },
      { q: "How do I avoid mistakes on certificates?", a: "Keep one list with names, roles and emails, ask volunteers to confirm their spelling, and generate every certificate from that list with a certificate maker. Check a few printouts before printing all of them, and keep a copy of the list so you can reprint on request." },
      { q: "When should I send certificates after an event?", a: "Within a few days, while people remember the event. A digital copy by email or chat is enough, with a printed copy for those who want it. Add certificates to your post-event checklist with a date, so they do not get forgotten once the event is over." },
    ],
    related: ["certificate-wording", "tournament-volunteer-roles-and-briefing", "tournament-referee-roles-and-duties", "tournament-results-announcement-template"],
    cta: { label: "Make the certificates", href: "/tools/certificates/" },
  },

  {
    slug: "minecraft-hunger-games-tournament-format",
    title: "Minecraft Hunger Games tournament format: lobbies, points and final",
    seoTitle: "Minecraft Hunger Games tournament format",
    description: "How to run a Minecraft Hunger Games tournament: lobby rounds, points for placement and kills, qualification, a final lobby, spectators and rules to prevent stalling.",
    tag: "Format guide",
    answer: "Run several lobby rounds with points for placement and eliminations, qualify the top players or teams on total points, and play a final lobby. Add rules against stalling and teaming, and use referees as spectators. Lobby size depends on the server and map.",
    intro: "Hunger Games style events put many players in one arena, last one standing wins. That does not fit a normal bracket, so organisers use lobby rounds and points. The format is easy to run once you decide how many lobbies, how many rounds and who goes through.",
    sections: [
      { h2: "Lobby rounds", md: `Split entrants into lobbies that match the map and server limits. Check the number of players the map supports, since it varies by server and version, and set the lobby size to that.

Each lobby plays one or more rounds. Every round gives points. After all rounds, you rank players or teams by total points. For a small event, one big lobby may be enough.` },
      { h2: "Points", md: `Give points for placement and for eliminations, and publish the scale before the event.

| Result | Example points |
|---|---|
| Winner of the round | Highest award |
| Other placements | Decreasing awards |
| Each elimination | A smaller award each |

The numbers are your choice. Weight placement more than eliminations if you want to reward survival, and weight eliminations more if you want action. The [tie-breaker guide](/guides/tournament-tiebreaker-rules-how-to-write/) shows how to rank equal totals.` },
      { h2: "Qualification and finals", md: `For a larger field, run qualifying lobbies, take the top players or teams from each, and play a final lobby. The [group stage and knockout guide](/guides/group-stage-and-knockout-planning/) shows the same idea for other games.

| Entries | Plan |
|---|---|
| Up to one lobby | One lobby, several rounds |
| Several lobbies | Qualifier lobbies, then a final lobby |
| Large field | Two qualifier stages, then a final |` },
      { h2: "Teams or solo", md: `Decide whether players compete solo or in teams. In teams, say how the team's points are added, and whether teammates may help each other. Solo events need a rule against teaming: players may not cooperate to eliminate others, then split.

Describe the rule, the penalty and who decides. The [Bed Wars and Sky Wars rules guide](/guides/minecraft-bedwars-and-skywars-tournament-rules/) covers mods and items, which apply here too.` },
      { h2: "Preventing stalling", md: `Stalling is the main risk: players hide to avoid fights. Write a rule, for example a time limit per round, with the map's own shrinking mechanic if it has one. Decide what happens when time runs out: a tie-break by remaining players, or sudden death.

Tell players the limit before the event, and have referees watch for deliberate stalling.` },
      { h2: "Referees and records", md: `Add referees as spectators in each lobby to watch for teaming, cheating and disputes. Record the placement and eliminations of each round in one sheet, and share the table after each round. Ask players to record their screens in the final.

See [preventing cheating](/guides/preventing-cheating-in-online-tournaments/) for broader checks.` },
      { h2: "A sample day plan", md: `Suppose you have 24 solo players, with a lobby size of 12 on your map. Run two qualifier lobbies of 12, each playing two rounds. Add the points, and take the top six from each lobby into a final lobby of 12 that plays three rounds. Rank the final lobby by total points.

Check the timing: each round has a set length plus a break, so two qualifier rounds, a break and three final rounds take a few hours. Test the numbers with the [schedule maker](/tools/schedule/), and keep a buffer, since lobbies often start late while players join.` },
      { h2: "Common mistakes", md: `- Lobby size larger than the map supports.
- Points scale not published.
- No rule against teaming in solo events.
- No time limit per round.
- Not recording results after each round.` },
    ],
    faq: [
      { q: "How do I run a Minecraft Hunger Games tournament?", a: "Split entrants into lobbies that match the map's limit, play several rounds with points for placement and eliminations, rank by total points, qualify the top players or teams and play a final lobby. Publish the points scale, add rules against stalling and teaming and use referees as spectators." },
      { q: "How should points work in a lobby format?", a: "Give points for round placement and for each elimination, and publish the scale before the event. Weight placement more to reward survival, or eliminations more for action. Decide a tie-break for equal totals, such as more round wins, and record the results of every round in one sheet." },
      { q: "How do I stop players hiding or teaming?", a: "Set a time limit per round and say what happens when it runs out, such as a tie-break by players remaining or sudden death. For solo events, ban cooperation between players and set a penalty. Add referees as spectators and ask players to record their screens in the final." },
    ],
    related: ["minecraft-tournament-how-to-organise", "minecraft-bedwars-and-skywars-tournament-rules", "tournament-tiebreaker-rules-how-to-write", "group-stage-and-knockout-planning"],
    cta: { label: "Plan qualifiers and a final", href: "/tools/groups/" },
  },

  {
    slug: "ranking-teams-in-a-three-way-tie",
    title: "Ranking teams in a three way tie: head to head mini tables explained",
    seoTitle: "Ranking teams in a three way tie",
    description: "How to rank three teams that finish level on points: the head to head mini table, a worked example, score difference and what to do if still level.",
    tag: "Format guide",
    answer: "When three teams finish level on points, build a mini table using only the matches among those three, rank them by points in it, then by difference and scored, and use a final tie-break such as a playoff or a draw. Decide the order before the tournament.",
    intro: "A two way tie is easy: look at who won the match between them. A three way tie is harder, because the results can form a circle: A beat B, B beat C, C beat A. Head to head alone gives no answer. A mini table does.",
    sections: [
      { h2: "Why head to head alone fails", md: `With three teams, each has one match against each other. Suppose A beat B, B beat C and C beat A. Every team has one win and one loss against the others, so a plain head to head comparison ranks nobody above anyone.

You need a method that uses more than the result. A mini table is the standard one.` },
      { h2: "Step by step", md: `1. List the teams that are level on points.
2. Take only the matches played among those teams.
3. Build a small table from those matches: points, then score difference, then goals or points scored.
4. Rank the teams by that table.
5. If still level, move to the next tie-break in your published order.

Do not use matches against other teams in the mini table. Only matches among the tied teams count.` },
      { h2: "A worked example", md: `Teams A, B and C finish level on points. In their matches against each other: A beat B 2-1, B beat C 2-1, C beat A 3-1.

| Team | Played | Won | Scored | Conceded | Difference | Points |
|---|---|---|---|---|---|---|
| A | 2 | 1 | 3 | 4 | -1 | 3 |
| B | 2 | 1 | 3 | 3 | 0 | 3 |
| C | 2 | 1 | 4 | 3 | +1 | 3 |

The mini table is level on points, so the next step is difference: C is +1, B is 0 and A is -1. The ranking is C, B, A. Had the differences also been level, you would have moved to goals scored, and then to the next tie-break in your list. This is why the order must be written down in advance.` },
      { h2: "What comes next if still level", md: `Choose from your published list. Common next steps:

- Overall score difference across the whole group.
- Overall scored.
- Fair play record, such as fewer cards or penalties.
- A playoff match or a short decider.
- A draw by lot, as a last resort and done in public.

Pick the order that suits your sport and publish it. See [how to write tie-breaker rules](/guides/tournament-tiebreaker-rules-how-to-write/) for wording.` },
      { h2: "Sport specific notes", md: `Different sports use different measures. For football, see [football points and tie-breakers](/guides/football-points-system-and-tiebreakers/). For cricket, net run rate is often used, as in [net run rate explained](/guides/cricket-net-run-rate-explained/). For chess, see [chess tie-breaks](/guides/chess-points-system-and-tiebreaks/). Esports tables often use game or round difference.

Make sure your table shows the measure you use.` },
      { h2: "Write it down before the event", md: `Add a "Ranking ties" section to your rules, with the order of steps. Read it aloud at the captains' meeting. Arguments about tie-breaks nearly always start when a rule is invented after the result.

The [points table tool](/tools/points-table/) can rank teams by a chosen order, so you do not need to calculate by hand.` },
      { h2: "Common mistakes", md: `- Counting matches against teams outside the tied group in the mini table.
- Using head to head alone for three teams.
- Not writing the order of tie-breaks.
- Drawing lots in private.
- Changing the order after seeing the results.` },
    ],
    faq: [
      { q: "How do you break a three way tie?", a: "Take only the matches among the three tied teams, build a mini table with points, then score or goal difference, then scored, and rank by it. If still level, use the next tie-break in your published list, such as overall difference, a playoff, or a public draw as a last resort." },
      { q: "Why does head to head fail with three teams?", a: "Because results can form a circle, where A beats B, B beats C and C beats A. Each team has one win and one loss against the others, so head to head ranks nobody. A mini table using differences and goals scored among the three gives a basis for ranking." },
      { q: "Should the tie-break order be decided in advance?", a: "Yes. Write the order of tie-breaks in your rules and read it at the captains' meeting. Rules invented after the results are seen cause most arguments. A published order also lets a points table tool rank teams automatically and consistently." },
    ],
    related: ["tournament-tiebreaker-rules-how-to-write", "football-points-system-and-tiebreakers", "cricket-net-run-rate-explained", "chess-points-system-and-tiebreaks"],
    cta: { label: "Rank the table automatically", href: "/tools/points-table/" },
  },

  {
    slug: "esports-club-trials-and-recruitment-format",
    title: "Esports club trials and recruitment: a fair format for picking a team",
    seoTitle: "Esports club trials and recruitment format",
    description: "How to run trials for an esports club team: what to measure, a fair format, scrim rounds, communication and teamwork checks, scoring sheets and giving feedback.",
    tag: "Organiser guide",
    answer: "Decide the roles you need, run trial matches or scrims where players are observed, score a few clear criteria on a sheet, include a communication check, and give each applicant feedback. Pick the team from the scores and the fit, not from friendships.",
    intro: "Choosing a club team is hard and easily unfair. Friends get picked, shy but skilled players get missed, and rejected players leave without knowing why. A simple trial format with a scoring sheet does not remove judgement, but it makes it visible and consistent.",
    sections: [
      { h2: "Decide what you need", md: `Start from the team, not the applicants. How many players, which roles, what level of commitment, and what schedule? Write it as a short brief that applicants can read before they apply.

A club team that practises three evenings a week needs different people from a casual one. Be honest about the time, and say whether there is a reserve squad.` },
      { h2: "Open applications", md: `Use a form to collect names, roles, in-game IDs, rank or past results, availability and a short note. The [registration form tool](/tools/registration/) builds one.

Give a deadline and say how decisions will be announced. Ask applicants to agree to the trial rules, including a code of conduct, as in the [code of conduct template](/guides/player-code-of-conduct-template/).` },
      { h2: "The trial format", md: `A trial should show how a player performs in a team, not only alone. A simple structure:

1. A short briefing on the day's format and criteria.
2. Several scrim matches, with applicants mixed into temporary teams.
3. A review round, where applicants and trial staff discuss one match.
4. A short individual conversation.

Using [scrims](/guides/free-fire-scrims-how-to-run/) as the base keeps it close to real play. Swap applicants between temporary teams so you see them with different partners.` },
      { h2: "What to score", md: `Score a few criteria, each on a simple scale, on a sheet shared by the trial staff.

| Criterion | What to look for |
|---|---|
| Game skill | Decisions and execution in the role |
| Communication | Clear, calm and useful calls |
| Teamwork | Supports teammates, adapts |
| Attitude | Handles losses and feedback well |
| Availability | Can attend the schedule |

Weight them as you like and publish the criteria. Let at least two staff score independently, then compare.` },
      { h2: "Avoiding bias", md: `Friends are easy to overrate. Reduce this by having more than one scorer, scoring before discussing, and writing a reason for each score. If a staff member is a friend of an applicant, ask them to declare it, and let others score.

Make the criteria visible to applicants. People accept a decision more easily when they know how it was made.` },
      { h2: "Decisions and feedback", md: `Announce the decision on the date you promised. Give every applicant a short message: whether they were selected, a reserve, or not this time, and one or two points on strengths and what to improve.

Feedback is the part that keeps people in your community. A rejected player who got useful advice may apply again, or join a development squad.` },
      { h2: "After the trials: onboarding", md: `Selection is only the start. Give new members a short onboarding: the schedule, roles, the code of conduct and who to ask for help. Set a trial period, such as a month, after which you review how it is working for both sides.

Keep a reserve list and a development squad, so players who were not selected still have a place to improve. Re-run trials once or twice a year, so there is always a route in. A club that opens its doors regularly keeps its standards high and its community growing.` },
      { h2: "Common mistakes", md: `- No written brief of the roles needed.
- Judging only on rank, not teamwork.
- A single scorer.
- No feedback to unsuccessful applicants.
- Missing the promised decision date.` },
    ],
    faq: [
      { q: "How do I run trials for an esports club team?", a: "Define the roles and commitment you need, collect applications with a form, run scrims with applicants mixed into temporary teams, add a review round and a short conversation, score clear criteria on a shared sheet with at least two scorers and announce decisions on the promised date with feedback for everyone." },
      { q: "What should I measure in a trial?", a: "Game skill in the role, communication, teamwork, attitude when losing or receiving feedback and availability for the practice schedule. Score each on a simple scale on a shared sheet, publish the criteria and weight them as you like. Rank alone says little about how someone plays in a team." },
      { q: "How do I keep trials fair?", a: "Use more than one scorer, score before discussing, write a reason for each score, ask staff to declare friendships with applicants, publish the criteria and give every applicant feedback. A visible method does not remove judgement, but it makes decisions easier to explain and accept." },
    ],
    related: ["free-fire-scrims-how-to-run", "player-code-of-conduct-template", "tournament-registration-form-fields", "divisions-and-skill-levels-in-one-tournament"],
    cta: { label: "Build the application form", href: "/tools/registration/" },
  },
];
