import type { Draft } from "./types";
import { FACTS as F } from "./facts";

/** Posts 20 to 29. */
export const BATCH_03: Draft[] = [
  {
    slug: "box-cricket-tournament-rules",
    title: "Box cricket tournament rules: a simple rulebook for indoor and net arenas",
    seoTitle: "Box cricket tournament rules rulebook",
    description: "Rules for a box cricket tournament: team size, overs, scoring off the nets, bowling limits, tie rules and a one-page rulebook you can adapt to your arena.",
    tag: "Sport guide",
    answer: "Box cricket is played in a small enclosed arena, so standard cricket rules need local changes. Decide the team size, overs, how runs are scored off the walls and nets, bowling limits and tie rules, write them on one page, and read them out before the first match.",
    intro: "Box cricket has no official rulebook that every venue follows. Each arena has its own netting, its own boundaries and its own habits. That makes a written rulebook more important here than in normal cricket: two teams that learned the game at different venues will disagree about almost everything.",
    sections: [
      { h2: "Why box cricket needs its own rules", md: `The ground is small and enclosed. Balls hit walls and nets, and the usual boundary rules do not apply. Matches are short, and teams are usually smaller than 11 players.

Because there is no single standard, the organiser decides, and the decisions below are the ones that cause arguments. Write each one down. If your arena has house rules, ask the venue manager for them and include them.` },
      { h2: "Team size and match length", md: `Choose these and keep them for the whole tournament:

- Players per side: commonly 6 to 8 in box cricket, but it is your choice.
- Overs per innings: short games are the norm, for example 5 or 6 overs.
- Bowling limit: the maximum overs one bowler can bowl, such as 1 or 2.
- Time per match: set a fixed slot, such as 30 minutes, including changeovers, and stop the next match from starting late.

Registered squads can be larger than the playing team, which lets teams rotate players.` },
      { h2: "How runs are scored in the arena", md: `This is the part with no standard. Decide how each hit is scored and print it:

| Hit | Example rule |
|---|---|
| Ball hits the side net on the full | 4 runs |
| Ball hits the back net on the full | 6 runs |
| Ball hits the net after bouncing | 4 runs, or runs by running |
| Ball hits the roof or a wall | Decide per arena |
| Caught off a net | Out or not out: decide |

The numbers above are examples, not a standard. Walk the arena with the venue manager and fix each rule for that venue. Ask both captains to confirm before the first match.` },
      { h2: "Wickets and extras", md: `Decide which dismissals count: bowled, caught, run out and so on, and whether "caught off the net" is out. Decide whether there is a penalty for wides and no-balls, usually one run plus a re-bowl.

If you want a rule that keeps pace high, add a "last man stands" option so a team can continue with a single batter, or require batters to retire after a number of runs so everyone gets a turn. Whatever you choose, apply it equally.` },
      { h2: "Points, ties and tie-breaks", md: `A simple league scheme is 2 points for a win, 1 each for a tie, 0 for a loss. For ties on points, use net run rate if you have a scorer, as in [net run rate explained](/guides/cricket-net-run-rate-explained/), and finish with a super over for knockout matches.

For a short event, a [round robin](/guides/round-robin-single-double-and-tiebreaks/) followed by a final works well, with fixtures from the [round robin generator](/tools/round-robin/).` },
      { h2: "A one-page rulebook", md: `1. [6] players per side; squads up to [9].
2. [5] overs per innings; bowlers bowl up to [1] over each.
3. Scoring: [side net on the full = 4; back net on the full = 6; other hits as marked on the arena plan].
4. Out: bowled, caught (not off the nets), run out, stumped is [not] used.
5. Wide and no-ball: [1] run and a re-bowl.
6. Ties: [super over].
7. Late teams: a team that is more than [10] minutes late forfeits.
8. Umpire's decision is final; protests go to [name] before the next match.

You can build the registration page for teams with the [registration form tool](/tools/registration/), and use the ideas in the [cricket rules template](/guides/cricket-tournament-rules-template/) for anything this page leaves out.` },
      { h2: "Common mistakes", md: `- Not agreeing how the nets are scored until a ball hits one.
- Letting match slots overrun, so the whole evening shifts.
- Using different rules for different matches because an umpire "remembers" them differently.
- Forgetting to set a bowling limit.
- Not putting the arena rules in writing.` },
    ],
    faq: [
      { q: "What are the rules of box cricket?", a: "There is no single official rulebook. The organiser and the arena decide the team size, overs, how runs are scored off the nets and walls, bowling limits and dismissals. Typical events use smaller sides and short innings. Write the rules on one page, check them with the venue manager and read them out before the first match." },
      { q: "How many players are in a box cricket team?", a: "It varies by venue and event, and many arenas use sides of 6 to 8 players on the field. The organiser sets the number and the size of the squad that can be registered. State both in the rules so that teams arrive with the right number and so that substitutes are allowed in the same way for every team." },
      { q: "How do you score runs in box cricket?", a: "Each arena sets its own scale. A common choice gives 4 for a hit that reaches a side net on the full and 6 for the back net, with other hits scored by running. Walk the arena with the venue manager, write each rule down and make sure both captains agree before the first match." },
    ],
    related: ["cricket-tournament-rules-template", "cricket-net-run-rate-explained", "cricket-league-points-table"],
    cta: { label: "Build the team registration form", href: "/tools/registration/" },
  },

  {
    slug: "fortnite-tournament-rules-and-scoring",
    title: "Fortnite tournament rules and scoring for organisers",
    seoTitle: "Fortnite tournament rules and scoring",
    description: "How to organise a Fortnite tournament: choosing solo, duo, trio or squad, a points system with placement and eliminations, lobby rules and proof of results.",
    tag: "Game guide",
    answer: "Choose a team size, play a set number of matches, and score each team on placement plus eliminations using one published table. Add lobby rules for starting times, teaming, disconnects and screenshots, and add up the points over all matches to rank teams.",
    intro: "A Fortnite tournament is a points event: many players share one match, and the winner is the team that scores best across several games. The scoring table is the heart of the event. The rest is housekeeping, but housekeeping is where tournaments go wrong.",
    sections: [
      { h2: "Pick the team size", md: `${F.fortnite.text}

Pick one for the whole event. Solo is simplest to organise. Duos and squads need team registration and a rule about who may substitute. If you are not sure, start with duos or squads for a college event, because teams bring friends and the registration list fills faster.` },
      { h2: "Design the points table", md: `Most tournaments score placement and eliminations. Placement rewards survival, and eliminations reward fighting. The balance between them decides the style of play.

| Placement | Points (example) |
|---|---|
| 1st | 12 |
| 2nd | 9 |
| 3rd | 7 |
| 4th to 5th | 5 |
| 6th to 10th | 3 |
| Lower | 0 |

Add 1 point per elimination. This is an example scale, not an official one. Publish yours before the event, and change it only between events. The [points table calculator](/tools/points-table/) applies your scale and ranks the teams, and our [points table guide](/guides/points-table/) shows a worked example.

Here is why the tie-break matters. With the example scale and 1 point per elimination, Team A finishes 1st with 5 eliminations and scores 12 plus 5, which is 17. Team B finishes 2nd with 8 eliminations and scores 9 plus 8, which is also 17. The two teams are level, so a published rule, such as "best single-match placement wins the tie", decides it.` },
      { h2: "How many matches", md: `Choose a number of matches that fits your time. A common range is 4 to 6 matches in an evening, with a break between each. Total points across all matches rank the teams.

If many teams enter, split them into lobbies and run qualifier rounds, then play a final with the top teams. The [match schedule maker](/tools/schedule/) can build the lobby timetable.` },
      { h2: "Lobby rules to write", md: `- Start time and the time teams must be in the lobby. Late teams may join the next match only.
- Teaming: players from different teams must not cooperate in a match. State the penalty.
- Disconnects: a team that disconnects keeps the points it has earned, and there is no replay.
- Proof: each team sends a screenshot of its end-of-match placement and eliminations, and a referee checks them against the lobby.
- Disputes: one organiser decides, within a stated time.

Game features for custom matches change with updates. Check what is available and test a practice match before the tournament.` },
      { h2: "Recording the results", md: `After each match, a referee or organiser enters placement and eliminations for every team. Keep one results sheet and update it live on a [display screen](/tools/display-screen/) so teams can see the standings.

At the end, check the total and publish the final ranking with the tie-break rule: the best single-match placement, or most eliminations, or a play-off match.` },
      { h2: "Common mistakes", md: `- Publishing the points table after players ask questions.
- Allowing teams to submit results without a screenshot.
- Not writing a teaming rule.
- Running too many matches for the time available.
- Changing the points scale during the event.` },
    ],
    faq: [
      { q: "How is a Fortnite tournament scored?", a: "A common method gives points for final placement and a point per elimination, with a table that pays more for higher placement. Points from every match are added, and the highest total wins. Publish the table before the event, and write a tie-break such as the best single-match placement." },
      { q: "How many matches should a Fortnite tournament have?", a: "Choose a number that fits your time, commonly 4 to 6 matches in an evening, with a short break between each. If many teams enter, run qualifier lobbies and a final with the top teams. Plan the total time before registration so players know how long to stay." },
      { q: "How do I stop teaming in a Fortnite tournament?", a: "Write a rule that players from different teams must not cooperate, with a penalty such as removing the points of that match. Use a referee or recordings to check, ask teams to share screenshots and clips on request, and apply the same rule to every team without exception." },
    ],
    related: ["points-table", "run-a-custom-room-tournament", "pubg-mobile-custom-room-results"],
    cta: { label: "Calculate your points table", href: "/tools/points-table/" },
  },

  {
    slug: "tournament-poster-sizes-whatsapp-instagram-print",
    title: "Tournament poster sizes for WhatsApp, Instagram and print",
    seoTitle: "Tournament poster sizes: WhatsApp, Instagram, print",
    description: "The poster sizes you need for a tournament: WhatsApp status, Instagram feed and stories, A4 and A3 print, banners and standees, with safe-area and QR tips.",
    tag: "Poster guide",
    answer: "Make one design and export it in a tall 9:16 size for stories and WhatsApp status, a square or 4:5 size for feeds, and A4 or A3 for print. Keep important text away from the edges, use a QR code at least 2 cm wide in print, and test on a real phone.",
    intro: "A poster looks great on your laptop and then arrives on a phone with its date cut off. Different places crop and compress differently. Knowing the sizes in advance turns a day of fixing into ten minutes of exporting.",
    sections: [
      { h2: "One design, several sizes", md: `Make the poster once, then adapt it. The content stays the same, but the layout changes for each shape.

| Where it is used | Shape | Notes |
|---|---|---|
| WhatsApp status, Instagram and Facebook stories | 9:16 (tall) | The top and bottom of the screen are covered by app buttons |
| Instagram feed and most shares | 1:1 (square) or 4:5 | The most flexible shape |
| WhatsApp share in chats | Square or 4:5 | Keep the file size small |
| Notice boards | A4 or A3 portrait | Print at full size |
| Banners | Wide, about 3:1 | Very few words |
| Standees | Tall, about 1:2.5 | Only name, date and QR |

The [tournament poster maker](/tools/poster/) exports the common sizes from a single design.` },
      { h2: "Keep a safe area", md: `Phones and printers crop. Leave a margin on all four sides, and keep the date, venue and QR code inside it.

For tall stories, leave extra room at the top and bottom, because the app places a profile bar and a reply bar there. For print, leave at least 1 cm of margin so a printer does not cut off the border.

Check your poster on at least two different phones before you share it.` },
      { h2: "Text size and contrast", md: `People read posters on a small screen. Use large text for the three things they need: what, when and where. The name of the tournament should be the largest text, then the date and venue.

Use high contrast: light text on a dark area, or dark text on a light area. Avoid text on a busy photo without a dark overlay behind it.` },
      { h2: "QR code size and placement", md: `For print, make the QR code at least 2 cm wide, with a blank border around it. For a standee read from a few steps away, make it larger. On a phone poster, a QR code scanned from another screen should be around a fifth of the width.

Point it at a registration page or form. Print the web address in small text beneath it as a backup. Test it with two phones at the final size. The [registration form tool](/tools/registration/) gives you the link.` },
      { h2: "Exporting and sharing", md: `Export the stories and feed versions as PNG or high-quality JPEG. For print, export a high-resolution PDF or image and check it at actual size.

When you share on WhatsApp, send the image as a photo for viewing, and keep a clean file for people who want to forward it. For the same poster idea in another sport, see the guide to [football tournament posters](/guides/football-tournament-poster-ideas/).` },
      { h2: "Common mistakes", md: `- Sharing the print file on WhatsApp, which compresses it and blurs the text.
- Putting the date at the very top of a story where the app covers it.
- A QR code that is too small to scan.
- Low-resolution images that look soft on A3.
- Forgetting to test on a real phone.` },
    ],
    faq: [
      { q: "What size should a tournament poster be for WhatsApp status?", a: "Use a tall 9:16 image, the same shape as a phone screen. Keep the date, venue and QR code away from the top and bottom, because the app covers those areas with its own buttons. Keep the file small so that it uploads quickly, and check it on a real phone before sharing." },
      { q: "What size should a tournament poster be for printing?", a: "A4 or A3 portrait are the usual notice-board sizes. Export a high-resolution PDF or image, leave a margin of at least 1 cm, and check the QR code at actual size before you print a batch. For banners and standees, use fewer words and larger text because they are read from a distance." },
      { q: "How big should a QR code be on a poster?", a: "For A4 print, at least 2 cm wide with a blank border around it, and larger for a standee. On a phone image, make it large enough to scan from another screen, around a fifth of the poster's width. Always test the final file on two phones, and add the web address in small text as a backup." },
    ],
    related: ["football-tournament-poster-ideas", "cricket-tournament-poster-ideas", "college-fest-esports-poster"],
    cta: { label: "Make your poster in every size", href: "/tools/poster/" },
  },

  {
    slug: "five-a-side-football-tournament-format",
    title: "Five-a-side football tournament format: groups, timings and rules",
    seoTitle: "Five-a-side football tournament format",
    description: "How to plan a five-a-side football tournament: team numbers, group format, match length, pitch use, points, tie-breaks and a timetable for one evening or day.",
    tag: "Sport guide",
    answer: "A five-a-side tournament works best as groups of 4 teams, then a knockout. Keep matches to 10 or 12 minutes with a short gap, use 3 points for a win, publish the tie-break order, and plan the whole day around the pitch time you have booked.",
    intro: "Five-a-side is the easiest football tournament to run, because matches are short and you can fit a lot of them on one small pitch. The risk is the schedule: twelve teams, one pitch and a fixed booking leave no room for slippage. Plan the maths first.",
    sections: [
      { h2: "Work out the pitch time first", md: `Everything depends on how many matches you need and how long each takes. A match of 10 minutes plus 3 minutes for changeover is a 13-minute slot.

| Teams | Format | Group matches | Knockout matches | Total |
|---|---|---|---|---|
| 8 | 2 groups of 4, top 2 into semi-finals | 12 | 3 (two semi-finals and a final) | 15 |
| 12 | 3 groups of 4, top 2 plus 2 best third into quarter-finals | 18 | 7 | 25 |
| 16 | 4 groups of 4, top 2 into quarter-finals | 24 | 7 | 31 |

Multiply the total by the slot length. For 15 matches at 13 minutes, that is just under 3.5 hours on one pitch. Use two pitches to halve it.` },
      { h2: "Choose the format", md: `Groups of 4 play 3 matches each, which means every team gets at least three games, a good deal for an entry fee. Our guide to [group stage plus knockout](/guides/group-stage-and-knockout-planning/) covers the draw and the cross-over.

If you have only 4 to 6 teams, a single [round robin](/guides/round-robin-single-double-and-tiebreaks/) is simpler, and the [round robin generator](/tools/round-robin/) writes the fixtures.` },
      { h2: "Points and tie-breaks", md: `${F.football.text} Use the same points as the main game so players know them. For ties, use goal difference, then goals scored, then the result between the tied teams, then a penalty shoot-out. The [football points guide](/guides/football-points-system-and-tiebreakers/) explains the order.

For a knockout match that is level at full time, go straight to penalties, to protect the schedule.` },
      { h2: "Rules that matter in five-a-side", md: `Decide these before the day:

- Players per side on the pitch, and squad size, such as up to 8.
- Rolling substitutions, with no limit, which keeps matches moving.
- Whether goalkeepers can handle outside the area, and the rule for back-passes.
- Boundaries: walls, nets and kick-ins.
- Penalties for fouls and cards, and a time-out for a serious foul.
- A rule that a team arriving late forfeits after a few minutes.

Write the six points above on one page and share it with every captain before registration closes.` },
      { h2: "A sample timetable", md: `For 12 teams on two pitches, matches of 10 minutes with 3 minutes between:

| Time | What happens |
|---|---|
| 09:00 | Teams arrive and register |
| 09:30 | Captains' briefing |
| 09:45 to 11:45 | Group matches, two pitches |
| 12:00 to 13:00 | Lunch and the quarter-final draw |
| 13:00 to 14:30 | Quarter-finals and semi-finals |
| 14:45 | Final and prizes |

Use the [schedule maker](/tools/schedule/) to check the real numbers for your pitch count and match length.` },
      { h2: "Common mistakes", md: `- Planning the schedule without counting the changeover time.
- Using groups of 5 on a single pitch, which adds 10 matches per group.
- Not publishing the tie-break order.
- Letting matches run over their slot.
- Forgetting a rule for a late team.` },
    ],
    faq: [
      { q: "How long should a five-a-side match be?", a: "Ten to twelve minutes is common for a group stage, with a short gap to change teams. Knockout matches can be a little longer. Count the changeover time in your slot length and check the total against your pitch booking. A short match leaves room for delays, which are unavoidable with many teams." },
      { q: "How many teams can play on one pitch in a day?", a: "It depends on the slot length and your booking. With 13-minute slots, one pitch fits about 4.5 matches an hour, so 16 teams with a group stage and knockout need roughly 31 matches, which is about 7 hours. Use two pitches or a smaller field if the booking is shorter." },
      { q: "What is the best format for a five-a-side tournament?", a: "Groups of 4 followed by a knockout is a good default, because each team plays at least three matches and the knockout gives a clear end. For 4 to 6 teams, a single round robin is simpler. Choose after you count the pitch time, not before." },
    ],
    related: ["football-points-system-and-tiebreakers", "group-stage-and-knockout-planning", "round-robin-single-double-and-tiebreaks"],
    cta: { label: "Build the groups and knockout", href: "/tools/groups/" },
  },

  {
    slug: "bgmi-scrims-how-to-organise",
    title: "BGMI scrims: how to organise practice lobbies for teams",
    seoTitle: "BGMI scrims: how to organise practice lobbies",
    description: "How to run BGMI scrims: slot lists, custom room details, match counts, scoring, proof of results and rules, so teams get fair practice before a tournament.",
    tag: "Game guide",
    answer: "Scrims are practice lobbies where teams play full matches against each other. Fix the number of slots, share the room details just before the start, play a set number of matches, score with a simple table and collect screenshots, so teams get fair and useful practice.",
    intro: "Teams run scrims to practise against real opposition before a tournament, and organisers run them to build a community. A good scrim is predictable: same time, same format, same scoring. A bad one starts late, has empty slots and ends in a score argument.",
    sections: [
      { h2: "What a scrim is", md: `${F.bgmi.text}

A scrim is a set of full matches in a custom room where the teams that signed up play each other. Teams use them to practise drops, rotations and teamwork. They are not official tournament matches, and the results often do not decide a prize, but they should still be scored so teams can see their progress.` },
      { h2: "Slots and registration", md: `Fix the number of teams per lobby. The battle royale has room for many squads, so decide how many slots you will fill and keep a waiting list.

Use a simple sign-up with team name, captain contact and roster. The [registration form tool](/tools/registration/) can produce a link. Close sign-up before the start time, and publish the slot list with team names in a fixed order.

Custom rooms may have access requirements in the game, so confirm what is needed and give teams time to meet them.` },
      { h2: "Schedule and room details", md: `State the date, start time and the number of matches, with a short break between each. A common plan is 3 to 6 matches in an evening.

Share the room ID and password only shortly before the start, in a private channel for registered captains, so that people who have not registered cannot join. Ask teams to be in the room 5 to 10 minutes early. Start on time: teams that are late play the next match.

The [match schedule maker](/tools/schedule/) turns the number of matches into a timetable.` },
      { h2: "Scoring scrims", md: `Use the same style of table as a tournament, so teams practise under real conditions: points for placement plus points for each elimination.

| Placement | Points (example) |
|---|---|
| 1st | 10 |
| 2nd | 6 |
| 3rd | 5 |
| 4th | 4 |
| 5th to 8th | 3 to 1 |

This is an example scale, not an official one. Use your own, publish it, and apply it to every match. The [points table calculator](/tools/points-table/) ranks the teams for you, and our [BGMI custom room guide](/guides/bgmi-custom-room-tournament/) goes into the full setup.` },
      { h2: "Proof and fair play", md: `Ask each team to send a screenshot of the match result with its placement and eliminations. Keep a referee in the room as an observer if you can, to see teaming or other violations.

Write a short rule on teaming, emulators, hacks and abusive chat, with a penalty, such as losing the points of that match or being removed from future scrims. Apply it the same way every time.` },
      { h2: "Common mistakes", md: `- Sharing room details publicly, so uninvited players join.
- Starting late because teams are still joining.
- Changing the points scale mid-evening.
- No proof of results.
- Running too many matches, so teams leave before the last one.` },
    ],
    faq: [
      { q: "What are scrims in BGMI tournaments?", a: "Scrims are practice lobbies where teams play full matches against each other in a custom room. They help teams rehearse drops and rotations against real opposition before a tournament. Organisers fix the slots, the number of matches and the scoring, and share room details with registered teams only." },
      { q: "How many matches should a scrim have?", a: "Three to six matches in an evening is common, with a short break between each. More matches mean more practice but more time, and teams tend to leave before the last one. Decide and publish the number before sign-up, and start on time so the plan holds." },
      { q: "How do I score a BGMI scrim?", a: "Use a placement-plus-eliminations table like a tournament would, publish it before the first match and apply it every game. Teams send screenshots of their result, and you add the points for each match. A points calculator saves time and removes arithmetic errors at the end of the evening." },
    ],
    related: ["bgmi-custom-room-tournament", "run-a-custom-room-tournament", "points-table"],
    cta: { label: "Plan the scrim timetable", href: "/tools/schedule/" },
  },

  {
    slug: "how-many-teams-for-your-format",
    title: "How many teams can your tournament take? Match counts and time by format",
    seoTitle: "How many teams can your tournament take?",
    description: "Work out how many teams your venue and time allow: match counts for knockout, double elimination, round robin and groups, and a simple way to check your schedule.",
    tag: "Format guide",
    answer: "Count the matches your format needs, multiply by the length of one slot, divide by the number of courts or screens, and compare with your time. Knockout needs teams minus one matches, round robin needs n times n minus 1 over 2, and double elimination needs about twice a knockout.",
    intro: "The most common planning error in a tournament is accepting too many teams. Registration fills up, and then you find that the format needs twice the time you have. A five-minute calculation at the start prevents a day of apologies.",
    sections: [
      { h2: "The formulas", md: `With n teams:

| Format | Matches |
|---|---|
| Single elimination | n minus 1 |
| Double elimination | 2n minus 2 (one more with a reset) |
| Round robin, single | n times (n minus 1), divided by 2 |
| Round robin, double | n times (n minus 1) |
| Swiss, r rounds | n divided by 2, times r |

These are the numbers that drive your schedule. See the guides on [double elimination](/guides/double-elimination-bracket-explained/), [round robin](/guides/round-robin-single-double-and-tiebreaks/) and [Swiss](/guides/swiss-system-tournament-explained/) for how each works.` },
      { h2: "A comparison for 16 teams", md: `| Format | Matches |
|---|---|
| Single elimination | 15 |
| Double elimination | 30 |
| Swiss, 4 rounds | 32 |
| Groups of 4, then 8-team knockout | 24 + 7 = 31 |
| Round robin | 120 |

Round robin is unrealistic at 16 teams in a day. The others are within a factor of two of each other.` },
      { h2: "Turn matches into time", md: `Take one match slot as the match length plus the gap for changeover and results. A 30-minute match with a 10-minute gap is a 40-minute slot.

Time needed = matches times the slot, divided by the number of courts, pitches or screens playing at once.

For 31 matches in 40-minute slots on one court, that is 1,240 minutes, over 20 hours. On four courts it is about 5 hours. The [match schedule maker](/tools/schedule/) does this for you with your real numbers.` },
      { h2: "Work out your team cap", md: `Start from the time you have and work backwards.

1. Write your total available time and subtract set-up, breaks and the prize ceremony.
2. Divide by the slot length, then multiply by the number of courts. This is the number of matches you can play.
3. Pick the format, and find the largest team count whose match total fits.

If your plan allows 24 matches, a knockout takes up to 25 teams and a double elimination up to 13. Then publish a team cap with a waiting list.

A worked example: a hall is booked from 10:00 to 17:00, which is 7 hours. Take off 1 hour for set-up and 1 hour for breaks and the prize ceremony, leaving 5 hours, or 300 minutes. With 30-minute slots, one court plays 10 matches. With two courts that is 20 matches. A single-elimination bracket needs one fewer match than teams, so it fits up to 21 teams. A double-elimination bracket needs 2n minus 2 matches, so it fits up to 11 teams.` },
      { h2: "What to do when too many teams register", md: `- Switch to a format with fewer matches, such as single elimination or groups plus a short knockout.
- Add courts, screens or a second day.
- Shorten matches, with a shorter series or fewer overs.
- Hold a qualifier for the extra teams.
- Close registration and keep a waiting list.

The [plan my tournament tool](/tools/plan/) walks through these choices for your numbers.` },
      { h2: "Common mistakes", md: `- Opening registration with no team cap.
- Forgetting the changeover time in the slot.
- Planning the knockout rounds for the average length, not the longest.
- Using a round robin for 12 or more teams in one day.
- Not leaving time for the final and the prize ceremony.` },
    ],
    faq: [
      { q: "How many matches does a knockout with 16 teams need?", a: "Fifteen, because each match eliminates one team and you need to eliminate fifteen to find the winner. In general a single-elimination bracket needs one fewer match than the number of teams. A double-elimination bracket for 16 teams needs about 30, and a full round robin needs 120." },
      { q: "How do I calculate how long a tournament will take?", a: "Count the matches your format needs, multiply by the slot length (match plus changeover), and divide by the number of courts or screens in use at once. Compare the result with the hours you have. Plan for the longest series in each round, not the average." },
      { q: "How many teams should I accept?", a: "Work backwards from your time: total hours minus set-up and breaks, divided by the slot length, times the number of courts, gives the matches you can play. Then choose the largest team count whose match total fits your format. Set that as the cap and keep a waiting list." },
    ],
    related: ["choosing-a-tournament-format", "round-robin-single-double-and-tiebreaks", "double-elimination-bracket-explained"],
    cta: { label: "Plan your tournament", href: "/tools/plan/" },
  },

  {
    slug: "chess-points-system-and-tiebreaks",
    title: "Chess points system and tie-breaks: Buchholz, head-to-head and more",
    seoTitle: "Chess points system and tie-breaks explained",
    description: "How chess tournaments score points and break ties: win, draw, loss, Buchholz, Sonneborn-Berger, head-to-head and wins, with a worked example and a rule to copy.",
    tag: "Sport guide",
    answer: "A chess win scores 1 point, a draw half a point and a loss 0. Players tied on points are separated by a published tie-break order, usually Buchholz (the sum of opponents' scores), then head-to-head, then number of wins, and finally a play-off or a draw.",
    intro: "Chess tournaments finish with ties far more often than football leagues, because draws are common and scores are in halves. A clear tie-break order is not optional here. This guide covers the common methods and how to write them into your rules.",
    sections: [
      { h2: "The points", md: `${F.chess.text}

Some local events want to discourage draws and use 3 points for a win and 1 for a draw. This is not standard in chess, and players may be confused, so state it clearly if you use it.

Whichever you pick, use it for the whole event and print it on the rules.` },
      { h2: "Buchholz", md: `${F.swissTiebreak.text}

Buchholz is the sum of the final scores of all the opponents a player met. A higher total means a player faced stronger opposition, so the player with the higher Buchholz ranks higher among those tied.

For example, two players both have 4 points. Player A's opponents scored 3, 3.5, 2, 4 and 2.5, a total of 15. Player B's opponents scored 2, 2, 3, 2.5 and 3, a total of 12.5. A ranks above B.` },
      { h2: "Other common tie-breaks", md: `| Tie-break | What it is |
|---|---|
| Head-to-head | The result of the game between the tied players, if they met |
| Number of wins | More wins ranks higher, since a win is worth more than two draws in effort |
| Sonneborn-Berger | The sum of the scores of opponents beaten, plus half the scores of opponents drawn |
| Cumulative score | The running total after each round, which rewards early wins |
| Play-off game | One or more extra games, usually for first place |

Many events choose two or three in order, then end with a play-off or a draw of lots. Pick the order before round one and print it.` },
      { h2: "A worked example", md: `Three players finish a five-round event on 3.5 points.

| Player | Points | Buchholz | Wins | Head-to-head |
|---|---|---|---|---|
| Asha | 3.5 | 14.5 | 3 | beat Ravi |
| Ravi | 3.5 | 14.5 | 2 | lost to Asha |
| Meera | 3.5 | 13 | 3 | did not meet |

Order by Buchholz first: Asha and Ravi tie on 14.5, and Meera has 13, so Meera is third. Between Asha and Ravi, the next rule is head-to-head, and Asha beat Ravi, so Asha is first and Ravi second. Wins would also have favoured Asha.` },
      { h2: "A rule to copy", md: `"Players tied on points are ranked in this order: 1. Buchholz, 2. result between the tied players, 3. number of wins, 4. a play-off game for first place, otherwise a draw of lots."

Print it on the registration page built with the [registration form tool](/tools/registration/), and again on the first pairing sheet. For the pairing and round structure, see [how to run a Swiss chess tournament](/guides/how-to-run-a-swiss-chess-tournament/).` },
      { h2: "Common mistakes", md: `- Not choosing the tie-break before round one.
- Using Buchholz for a round robin, where every player met the same opponents.
- Forgetting a final rule that cannot tie.
- Confusing players by changing the points scheme.
- Ranking prizes before the tie-break is worked out.` },
    ],
    faq: [
      { q: "How many points is a win in chess?", a: "A win scores 1 point, a draw half a point and a loss none. These are the standard points in chess tournaments, and the format of the event, such as Swiss or round robin, does not change them. If you want a different scheme, such as 3 for a win, say so clearly in the rules." },
      { q: "What is Buchholz in chess?", a: "Buchholz is the sum of the final scores of all the opponents a player has faced. It is the most common first tie-break in Swiss tournaments, because a player who faced stronger opposition ranks above one who faced weaker players on the same score. Some events cut the lowest score before summing." },
      { q: "Should I use Buchholz in a round robin?", a: "Usually not. In a round robin every player faces the same opponents, so Buchholz is nearly the same for everyone and does not separate players well. Use head-to-head, number of wins or Sonneborn-Berger instead, and finish with a play-off if first place is tied." },
    ],
    related: ["swiss-system-tournament-explained", "how-to-run-a-swiss-chess-tournament", "chess-tournament-rules-for-organisers"],
    cta: { label: "Build the registration page", href: "/tools/registration/" },
  },

  {
    slug: "free-fire-clash-squad-tournament-format",
    title: "Free Fire Clash Squad tournament: formats, series and rules",
    seoTitle: "Free Fire Clash Squad tournament format",
    description: "How to run a Free Fire Clash Squad tournament: 4v4 brackets, best-of series, custom room setup, rules for disconnects, and how to record and verify results.",
    tag: "Game guide",
    answer: "Clash Squad is a 4v4 team mode, so it suits a bracket rather than a points table. Use single or double elimination, best of 3 from the quarter-finals, write rules for disconnects and late teams, and record every match result with a screenshot.",
    intro: "Most Free Fire events run on points, because the battle royale has many teams per match. Clash Squad is different: two teams, one result. That makes it easier to run, with a bracket you can draw in minutes, and it suits college events with 8 to 16 teams.",
    sections: [
      { h2: "What makes Clash Squad different", md: `${F.freeFire.text}

For the organiser, the important fact is that Clash Squad is a head-to-head mode. Two teams play, one wins, and the winner moves on. That is the structure of a knockout bracket, not of a points table.

Game modes and settings change with updates, so check the mode's current options in a test match before the event.` },
      { h2: "Pick the bracket", md: `For 8 to 16 teams:

- Single elimination: fastest, but one bad match ends a team's event.
- Double elimination: gives a second life and suits events with prizes. See [double elimination explained](/guides/double-elimination-bracket-explained/).
- Groups then a knockout: for 16 or more teams, with the [groups and knockout maker](/tools/groups/).

The [bracket maker](/tools/brackets/) seeds the teams and draws the rounds. Our guide on [seeding](/guides/how-to-seed-a-tournament-bracket/) explains the draw.` },
      { h2: "Series length", md: `Use best of 1 in early rounds for speed and best of 3 from the quarter-finals. Make the final best of 3 or best of 5 if time allows.

| Round | Series |
|---|---|
| Round of 16 and quarter-finals | Best of 1 or best of 3 |
| Semi-finals | Best of 3 |
| Final | Best of 3 or 5 |

Plan the schedule for the longest series. The guide on [series length](/guides/best-of-1-3-5-series-length-explained/) shows how to plan the timetable.` },
      { h2: "Custom room and match setup", md: `Create the room for each match, share the details with the two captains only, and have a referee observe. Decide the settings once, such as the map and round rules, and use the same for every match.

Write the setup in the rules so no team can say it was not told. Our general [custom room guide](/guides/run-a-custom-room-tournament/) covers the room details and codes.` },
      { h2: "Rules to write down", md: `- A squad is 4 players, and the roster is locked once the bracket is drawn. State whether substitutes are allowed and when.
- A team has up to 10 minutes after the scheduled time to join, then forfeits.
- A player who disconnects may rejoin if the round has not ended. A repeated disconnect loses the round.
- No emulators or modified clients, if the tournament is for mobile players only.
- Teams must send a screenshot of the final score to the referee.
- Disputes go to the organiser within 10 minutes of the match.
- If the team count is not a power of two, the top seeds get byes. See [byes explained](/guides/tournament-bracket-byes-explained/) for how many you need.` },
      { h2: "Common mistakes", md: `- Using a points table for a 4v4 mode.
- Not locking rosters, so teams change players between rounds.
- Starting without a disconnect rule.
- Letting captains agree match times privately.
- Forgetting a referee for the final.` },
    ],
    faq: [
      { q: "How do you run a Free Fire Clash Squad tournament?", a: "Use a knockout bracket, because Clash Squad is a 4v4 head-to-head mode. Seed the teams, play best of 1 early and best of 3 from the quarter-finals, create a custom room for each match, share the details with captains only, and collect a screenshot of each result. Write rules for late teams and disconnects." },
      { q: "Should I use a points table for Clash Squad?", a: "No. A points table suits battle royale matches with many teams in one lobby. Clash Squad pits two teams against each other, so a bracket, groups or a round robin fits better. Use a points table only if you run the standard battle royale mode in the same event." },
      { q: "How many players are in a Clash Squad team?", a: "Four players per side, as a 4v4 mode. Your rosters should list four players plus any substitutes you allow, and the rules should say when a substitute may join. Lock rosters when the bracket is drawn to prevent teams from changing their line-up between rounds." },
    ],
    related: ["free-fire-tournament-organiser", "best-of-1-3-5-series-length-explained", "tournament-bracket-template"],
    cta: { label: "Make your Clash Squad bracket", href: "/tools/brackets/" },
  },

  {
    slug: "handling-no-shows-and-walkovers",
    title: "No-shows and walkovers: what to write in your tournament rules",
    seoTitle: "No-shows and walkovers in tournament rules",
    description: "How to handle teams that do not turn up: a grace period, forfeit rules, how a walkover works in a bracket and a table, and wording you can copy into your rules.",
    tag: "Organiser guide",
    answer: "Give every team a published grace period, then record a forfeit. In a bracket the other team advances by walkover. In a league table it earns the win and a fixed score. Write the rule, the grace period and the table treatment before the event, and apply them equally.",
    intro: "Some teams will not turn up. It happens at every event, however well you plan. The difference between an organiser who handles it calmly and one who does not is a rule written in advance. Here is what that rule should say.",
    sections: [
      { h2: "Set a grace period", md: `Choose how long a team has to arrive after its match time. For short matches, 10 to 15 minutes is typical. For longer series, it may be 20 to 30 minutes.

Announce it in the rules, on the schedule and at the captains' meeting. Then keep to it. A grace period you stretch for friends is not a rule.` },
      { h2: "Forfeit and walkover wording", md: `A forfeit is the loss recorded against the team that did not appear. A walkover is the advance given to the team that did. Use one clear sentence:

"A team that is not ready to play within [15] minutes of its scheduled time forfeits the match. The opponent receives a walkover and advances."

Say who decides when the clock starts: the referee's clock or the scoreboard clock, and where it is shown.` },
      { h2: "How a walkover works in a bracket", md: `In a knockout, the team that is present advances to the next round. No score is needed, though some events record a nominal score such as 1-0 for statistics.

Be careful with seeding and byes. A walkover is not a bye: the team that did not show is out, and the schedule for the next round does not change. See [byes explained](/guides/tournament-bracket-byes-explained/) for the difference.

In double elimination, a no-show counts as a loss. A team that forfeits its first match goes to the losers bracket if you allow that, or is out if you do not. State which.` },
      { h2: "How a walkover works in a league table", md: `In a round robin or group stage, you need a fixed result to put in the table. Choose one and write it down.

| Format | Common treatment |
|---|---|
| Football-style | Win to the present team, score 3-0, no points to the absent team |
| Cricket-style | Points to the present team, no net run rate change |
| Battle royale lobby | The absent team scores zero for the match |

Whichever you choose, tell teams before the first match. The [tie-break guide](/guides/football-points-system-and-tiebreakers/) shows where the table counts forfeits.` },
      { h2: "Repeat no-shows and warnings", md: `If a team misses a second match, take a firmer step: disqualify it from the group, or remove it from the rest of the event. State the limit in the rules, such as two forfeits.

For a team that tells you in advance, you may allow a reschedule within a window, for example up to 24 hours before the match, and only once.` },
      { h2: "Tell teams, then record it", md: `Send the rules on no-shows with the schedule. Remind captains the day before. On the day, call the missing team once, record the time, and mark the forfeit on the sheet and the [match schedule](/tools/schedule/).

Write the record in one place: team, match, time called, time recorded. If a team disputes it, you have the answer.` },
      { h2: "Common mistakes", md: `- Changing the grace period for some teams.
- Not saying how a forfeit appears in the table.
- Confusing a walkover with a bye.
- Waiting for a late team so long that the whole schedule slips.
- Not recording the time you called the team.` },
    ],
    faq: [
      { q: "How long should you wait for a team that is late?", a: "Choose a grace period and publish it: 10 to 15 minutes is common for short matches and up to 30 for long series. Announce it in the rules, on the schedule and at the captains' briefing, then apply it to every team. A rule that bends for some teams is not a rule." },
      { q: "What is a walkover in a tournament?", a: "A walkover is the advance given to a team whose opponent does not turn up. In a knockout the present team moves to the next round, and the absent team is out. In a league table, the present team gets the win with a fixed score, which you should fix in the rules." },
      { q: "Is a walkover the same as a bye?", a: "No. A bye is a free pass given to a team because the bracket has an empty slot, and it is decided by the draw. A walkover is given because an opponent did not appear. In a walkover the other team is eliminated or takes a loss, which does not happen with a bye." },
    ],
    related: ["tournament-bracket-byes-explained", "esports-tournament-rules-template", "best-of-1-3-5-series-length-explained"],
    cta: { label: "Plan the match schedule", href: "/tools/schedule/" },
  },

  {
    slug: "football-tournament-rules-template",
    title: "Football tournament rules template for local and school events",
    seoTitle: "Football tournament rules template",
    description: "A football tournament rules template to copy: team and squad size, match length, substitutions, cards, points, tie-breaks, late teams and how protests work.",
    tag: "Sport guide",
    answer: "A football tournament rulebook needs team and squad size, match length, substitution rules, how cards and fouls are handled, the points scheme and tie-break order, a late-team rule and a protest procedure. Put it on one page, share it before registration closes, and stick to it.",
    intro: "Football is a game everyone thinks they know, which is why local tournaments have so many arguments about it. The rules differ by pitch size, by age group and by who is refereeing. A one-page rulebook settles what the game's laws do not.",
    sections: [
      { h2: "Format and match basics", md: `State the basics first:

- Players on the pitch per side, and squad size.
- Match length and the break at half-time, if any.
- Pitch size and goal size, if non-standard for the venue.
- Ball size, if you are using a young age group.
- Kick-off times and how long teams have to arrive.

For a small-sided event, see the [five-a-side format guide](/guides/five-a-side-football-tournament-format/) for match lengths and timetables.` },
      { h2: "Substitutions and squads", md: `Decide how substitutions work. Rolling substitutions with no limit keep the game moving in small-sided events. In larger formats, set a number per match and when they may be made.

Set the squad limit and a deadline for adding players, such as the registration close date. A player may play for one team only. Ask for a squad list on the registration form built with the [registration form tool](/tools/registration/).` },
      { h2: "Fouls, cards and discipline", md: `Write the penalties in a short table so the referee does not have to improvise.

| Offence | Consequence |
|---|---|
| Yellow card | Caution, recorded |
| Two yellows in one match | Sent off; sit out the next match |
| Red card | Sent off; sit out the next match, with review by the organiser |
| Violence or abuse | Removed from the event |

A team with a player sent off plays a player short for the rest of the match, or for a time limit in small-sided football. Decide which. Agree how card suspensions carry over from the group stage into the knockout.` },
      { h2: "Points, ties and extra time", md: `${F.football.text}

For group ties, use goal difference, then goals scored, then the result between the tied teams, then a penalty shoot-out. See [football points and tie-breakers](/guides/football-points-system-and-tiebreakers/) for the order and an example.

For a knockout match that is level at the end, go to a penalty shoot-out of five kicks each, then sudden death. Skip extra time if the schedule is tight.` },
      { h2: "Late teams and protests", md: `A team that is not ready to play within [10] minutes of kick-off forfeits. See [no-shows and walkovers](/guides/handling-no-shows-and-walkovers/) for the full wording.

Protests must be made in writing to the organiser before the next match, with the reason. The organiser's decision is final. The referee's decisions on the pitch cannot be protested.` },
      { h2: "A one-page rulebook", md: `1. [Number] players per side; squad of up to [number].
2. Matches are [number] minutes each way; a [number]-minute break.
3. Substitutions: [rolling / up to number].
4. Win 3 points, draw 1, loss 0.
5. Tie-breaks: goal difference, goals scored, head-to-head, shoot-out.
6. Cards: two yellows or a red means the player sits out the next match.
7. A team more than [10] minutes late forfeits 3-0.
8. Knockout draws go to penalties.
9. The referee's decisions are final; protests in writing to [name] before the next match.` },
      { h2: "Common mistakes", md: `- Not setting a squad limit, so teams add players all day.
- No rule for cards across stages.
- Forgetting the penalty-shoot-out rule for knockouts.
- Not telling teams the match length.
- Using different rules for different groups.` },
    ],
    faq: [
      { q: "What rules does a local football tournament need?", a: "The number of players and squad size, match length, substitutions, how cards and misconduct are handled, the points scheme and tie-breaks, what happens to a late team and how protests are made. Put them on one page and share them before registration closes, so that every team plays under the same rules." },
      { q: "How do penalty shoot-outs work in a knockout?", a: "If a knockout match is level at full time, each team takes five penalties in turn, and the team with more goals wins. If still level, sudden death follows, one kick each, until one team scores and the other does not. State the rule in advance and skip extra time if your schedule is tight." },
      { q: "What happens if a player gets a red card?", a: "The player is sent off and the team plays short for the rest of the match, or for a time limit in small-sided football. Many events also add a suspension from the next match. Decide the penalty and how it carries from the group stage to the knockout, and write it in the rules." },
    ],
    related: ["football-points-system-and-tiebreakers", "five-a-side-football-tournament-format", "football-cricket-tournament-maker"],
    cta: { label: "Build the registration form", href: "/tools/registration/" },
  },
];
