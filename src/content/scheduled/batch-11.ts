import type { Draft } from "./types";
import { FACTS_B11 as B } from "./facts-b11";

/** Batch 11: ten demand-led guides queued right after post 1 (see docs/seo-research-2026-11-16-blogs.md). */
export const BATCH_11: Draft[] = [
  {
    slug: "free-fire-tournament-poster-guide",
    title: "Free Fire tournament poster: what to put on it and how to size it",
    seoTitle: "Free Fire tournament poster: contents and sizes",
    description: "How to make a Free Fire tournament poster that gets teams to register: the details it must carry, sizes for WhatsApp, Instagram and print, and what to avoid.",
    tag: "Organiser guide",
    answer: "A Free Fire tournament poster needs the event name, date and start time, entry fee or prize, how to register, and a contact. Make one 4:5 or square image for feeds, a 9:16 version for stories and statuses, and keep the text large enough to read on a phone.",
    intro: "Most Free Fire tournaments are announced in a WhatsApp group or an Instagram story, and the poster is the only thing a player sees before deciding to sign up. A poster that hides the date or forgets the registration link costs you teams. This guide covers what to put on it, the sizes to export, a layout that works on a phone, and the mistakes that send players back with questions.",
    sections: [
      { h2: "What a tournament poster must contain", md: `Think of the poster as a one-screen answer to the questions every captain asks. If any of these is missing, expect a message asking for it.

- Event name and the game, for example the name of your college fest plus Free Fire.
- Date and start time, with the day of the week. Players check the weekday before anything else.
- Where it is played: a venue and city, or "online, custom rooms" if it is remote.
- Format in a few words: squads of four, how many matches, one day or two.
- Entry fee, or the words "free entry", and the prize line. Only write a prize you will actually pay.
- How to register and the last date to do so: a link, a QR code or a phone number.
- The organiser's name, and sponsor logos if you have any.

The poster does not need rules. Put a short line such as "full rules in the registration link" and keep the rules in a separate [rules document](/guides/free-fire-tournament-rules-for-organisers/).` },
      { h2: "Sizes for WhatsApp, Instagram and print", md: `Make a few exports from the same design rather than forcing one shape everywhere. ${B.posterSizes.text}

| Where it goes | Shape to use | Size in pixels |
|---|---|---|
| WhatsApp status or Instagram story | 9:16 story | 1080 by 1920 |
| Instagram or Facebook feed | 4:5 poster | 1080 by 1350 |
| WhatsApp groups, Telegram | Square | 1080 by 1080 |
| Notice board or college wall | Print on A4 from the 4:5 file | A4 is 210 by 297 millimetres |

Keep the important text away from the edges. Stories get covered at the top and bottom by app buttons, and chat apps crop square previews. A margin of about 70 pixels on every side is a safe habit. For print, a 1080 by 1350 picture is fine for A4 on a notice board that people read from close by, but it will look soft on a large banner. For a banner, ask the printer what resolution they need.` },
      { h2: "Layout that reads on a phone", md: `Most people will see the poster at about the width of a thumb, so design for that.

1. Put the event name at the top in the largest type. It should be readable at arm's length.
2. Put the date and time directly under it, in the second largest type.
3. Put the prize or entry fee in a clear band, because it is the second reason people tap.
4. Put the registration method near the bottom, with a QR code if you have one. Test the QR code by scanning the exported image from a second phone.
5. Put sponsor logos in a single row at the very bottom, small and equal in size.

Use two colours and one or two fonts. A plain dark background with one bright accent colour is easier to read than a busy artwork background, and it exports cleanly. Check contrast: light text on a light picture disappears.` },
      { h2: "Making it with the poster maker", md: `The [tournament poster maker](/tools/poster/) draws the poster in your browser from only the lines you type. You enter the event name, date, venue, prize line and organiser, can add up to two sponsor logos, choose the Free Fire look, pick a poster, story or square shape, and download a PNG. Lines you leave empty are left off, so nothing is invented for you, and the picture is not uploaded anywhere.

It uses its own flat designs, not the game's official artwork or logos. If you want publisher artwork on a poster, follow that publisher's rules for using it. Read the finished PNG once more for spelling, the date and the prize text before you share it, because players will quote it back to you.` },
      { h2: "Do and do not", md: `Do:

- Write the date with the weekday, for example "Sat 21 Dec, 4 PM", not only numbers.
- Say whether the entry fee is refundable and what the prize is paid in.
- Put one contact method, not five.
- Export a story version as well as a feed version.

Do not:

- Use game logos or character art you do not have permission for.
- Put a long list of rules on the image.
- Promise a prize pool you have not secured.
- Post the poster before the registration link works. Open the link on a phone first.` },
      { h2: "Common mistakes", md: `- A date without a time, so players ask whether it starts in the morning or the evening.
- Tiny text that looks fine on a laptop and unreadable in a WhatsApp preview.
- A QR code that was never scanned. Test it on two phones before posting.
- A poster with no way to register, only "DM for details".
- One shape for every app, so Instagram crops the registration line off the bottom.
- Changing the date after posting and leaving the old poster in group chats. When plans change, post a new poster that says "updated" and ask admins to remove the old one.` },
      { h2: "A short checklist before you post", md: `1. Is the event name spelt the way the college or club spells it?
2. Are the date, weekday and time correct?
3. Does the registration link or QR code open on a phone?
4. Is the prize line exactly what you will pay?
5. Do you have a story size and a feed size?

Once players register, the next jobs are the [registration form](/guides/free-fire-tournament-registration-form-template/) and the [custom room setup](/guides/bgmi-and-free-fire-custom-room-setup-guide/). The older [Free Fire poster guide](/guides/free-fire-tournament-poster/) on this site has more design ideas for fests.` },
    ],
    faq: [
      { q: "What size should a Free Fire tournament poster be?", a: "Export two or three shapes from one design. Use 1080 by 1920 pixels for WhatsApp status and Instagram stories, 1080 by 1350 for a 4:5 feed post, and 1080 by 1080 for square group posts. For a printed notice, use the 4:5 file on A4 paper. Keep important text away from the edges, because stories and chat previews crop them." },
      { q: "What information must a tournament poster include?", a: "At minimum: the event and game name, the date with weekday and time, the venue or the word online, the format in one line, the entry fee and prize, how and by when to register, and the organiser. Rules can live in a separate document linked from the registration page, so the poster stays easy to read." },
      { q: "Can I use official Free Fire artwork on my poster?", a: "Only if the publisher's own rules allow it for your use, and you should check them before you post. The safer route is a flat design of your own with the event name in large type. The poster maker on this site uses its own flat designs and does not include any publisher logos or characters." },
      { q: "How do I make a tournament poster without design skills?", a: "Type your event details into a poster maker, pick one look, and download the picture. Keep it to two colours, large text for the name and date, and one clear way to register. Then open it on a phone and check that every line is readable at thumb size before you post it." },
    ],
    related: ["free-fire-tournament-poster", "college-fest-esports-poster", "free-fire-tournament-registration-form-template"],
    cta: { label: "Make your Free Fire poster", href: "/tools/poster/" },
  },

  {
    slug: "bgmi-tournament-poster-guide",
    title: "BGMI tournament poster: design, details and sizes that work",
    seoTitle: "BGMI tournament poster: details, design, sizes",
    description: "Make a BGMI tournament poster that fills your slots: what to print on it, how to lay it out for phones, which sizes to export, and the mistakes that cost teams.",
    tag: "Organiser guide",
    answer: "A BGMI tournament poster needs the event name, date and time, format (squad of 4, number of matches), entry fee and prize, a registration link or QR code and a contact. Export a 9:16 story and a 4:5 or square feed image, and keep the text large for phones.",
    intro: "BGMI is played by squads, so a poster has to convince a captain and then three more players. That changes what belongs on it: the squad size, the match count and the slot limit matter more than a fancy background. This guide lists what to include, a layout for phones, the sizes to export and how to avoid the mistakes that make captains ask twice.",
    sections: [
      { h2: "The details a BGMI poster needs", md: `A captain wants to know four things in three seconds: when, how many matches, what it costs and what they win. Everything else is secondary.

- Event name, and BGMI written clearly as the game.
- Date, weekday and start time, plus the time room details will be shared.
- Format: squad matches with teams of four, how many matches, which maps if you have decided.
- Slots: how many teams you will accept, for example "first 20 teams". Say it only if you will enforce it.
- Entry fee or free entry, and the prize line.
- Registration method and deadline.
- Organiser name and one contact.

${B.bgmiSquad.text} Many events allow one substitute. Whatever you decide, state it, and keep the full rules in your [tournament rules](/guides/esports-tournament-rules-template/) rather than on the image.` },
      { h2: "Layout for phones", md: `1. Event name at the top, largest type.
2. Date and time right below, second largest.
3. A band with entry fee and prize.
4. A short format line such as "Squads of 4, 6 matches, 1 day". Write the numbers you actually plan.
5. The registration QR code or link at the bottom, with the deadline.
6. Sponsor logos in one row, equal size.

Use a dark background with a single accent colour. Battle royale posters often lean on busy art, but a clean layout survives being compressed by WhatsApp. If you use a photo, darken it behind the text so the lettering stays readable.` },
      { h2: "Sizes to export", md: `${B.posterSizes.text}

| Use | Shape | Pixels |
|---|---|---|
| Instagram story, WhatsApp status | 9:16 story | 1080 by 1920 |
| Instagram or Facebook feed | 4:5 poster | 1080 by 1350 |
| Group chats | Square | 1080 by 1080 |

For a printed notice, use the 4:5 version on A4 paper (A4 is 210 by 297 millimetres) and stick to short text. Keep a safe margin on every side, because chat apps and story screens cover the edges.` },
      { h2: "Making it with the poster maker", md: `The [tournament poster maker](/tools/poster/) has a BGMI look. You type the event name, date, venue, prize line and organiser, optionally add up to two sponsor logos, choose poster, story or square, and download a PNG. Empty lines are left off and nothing is uploaded, because the picture is drawn in your browser.

The look uses flat colours and lettering of its own, not the game's artwork, and it does not suggest that Krafton runs or approves your event. Type the game name and every number yourself, and read the final image once for mistakes.

If you also need the scoring explained for teams, link them to the [BGMI points system](/guides/bgmi-points-system-explained/) so the poster stays short.` },
      { h2: "What to avoid", md: `- Do not use the game logo, character art or Krafton marks without permission from the publisher.
- Do not claim an official partnership you do not have.
- Do not promise a prize pool before it is secured.
- Do not post a registration link you have not opened on a phone.
- Do not put the rules on the image. A poster that reads like a contract is skipped.` },
      { h2: "Common mistakes", md: `- Missing squad size, so solo players register and the first hour is spent sorting them.
- A slot limit on the poster that you do not enforce, which teaches teams to ignore deadlines.
- No time for room details, so captains message you at 4 PM asking when the room ID arrives.
- Text over a bright part of the artwork. Check it by squinting at the preview: if you cannot read the date, players cannot either.
- Posting only a feed-shaped image, then watching it get cropped in a story.` },
      { h2: "After the poster", md: `A poster brings registrations, and registrations need a place to land. Use a [registration form](/tools/registration/) or a link of your own, and plan the day with the [match schedule maker](/tools/schedule/). When the day comes, the [points table calculator](/tools/points-table/) and the [BGMI points table page](/points-table/bgmi/) handle the standings.` },
    ],
    faq: [
      { q: "What should a BGMI tournament poster include?", a: "The event and game name, date with weekday and start time, the format (squads of four and how many matches), the entry fee and prize line, the registration method with a deadline, and one contact. If you cap slots, say how many teams. Keep full rules in a separate document and link to it from the registration page." },
      { q: "What are the best sizes for a BGMI poster?", a: "Export a 1080 by 1920 story for Instagram and WhatsApp status, a 1080 by 1350 post for feeds and a 1080 by 1080 square for group chats. Keep text inside a margin so apps do not crop it. For a printed notice, use the 4:5 file on A4 and keep the wording short." },
      { q: "Can I use BGMI or Krafton logos on my poster?", a: "Do not assume you can. Game logos and artwork belong to the publisher, so read its rules for third-party use before adding them, and never imply that the publisher runs your event. A poster with your event name in large type and your own flat colours avoids the problem and reads well on a phone." },
      { q: "How early should I post the tournament poster?", a: "Post it as soon as the date, format and registration link are fixed, and set a closing date for registration. Giving teams a week or more lets captains collect four players and the entry fee. Repost a reminder story the day before the deadline, with the same details, so nobody sees conflicting information." },
    ],
    related: ["free-fire-tournament-poster-guide", "bgmi-custom-room-tournament", "points-table"],
    cta: { label: "Make your BGMI poster", href: "/tools/poster/" },
  },

  {
    slug: "points-table-maker-guide",
    title: "Points table maker: build a points table by hand, in a sheet or online",
    seoTitle: "Points table maker: by hand, sheet or online",
    description: "How to make a points table for a tournament by hand, in a spreadsheet or with a free calculator, including how to rank teams that finish level on points.",
    tag: "Organiser guide",
    answer: "A points table lists each team with matches played, points earned and a final rank. Build it by hand with a grid, in a spreadsheet with SUM and a sort, or with a points table calculator. Decide the tie-break order before the first match.",
    intro: "Whoever runs the scores owns the table, and the table decides who wins and who argues. Whether it is a battle royale lobby with placement and kill points or a league of football-style wins and draws, the job is the same: record every result, add it up the same way for every team, and rank the teams by a rule everyone has seen. Here are three ways to do it, and how to handle ties.",
    sections: [
      { h2: "What goes in a points table", md: `Every points table has the same skeleton. Add columns for your format.

- Rank, team, matches played and total points. These four are the minimum.
- For battle royale: placement points and kill points as separate columns, plus wins (first places) and kills, because tie-breaks use them.
- For league or round robin: won, drawn, lost, scores for and against, and the difference.
- A column per match, so you can show where each total came from. Disputes end quickly when teams can see their own row.

Publish the scoring rule above the table: the points for each placement, the points per kill, and the tie-break order.` },
      { h2: "Method 1: by hand on paper or a board", md: `Good for a small event and a quick lobby.

1. Draw a grid with one row per team and one column per match.
2. After each match, write the points scored in that match (placement points plus kills) in the cell.
3. Keep a running total column at the right, updated by one person and checked by another.
4. At the end, rank by total and apply the tie-break.

The risk is addition mistakes, so have a second person check totals before they go on a screen. Photograph the sheet after each match as a record.` },
      { h2: "Method 2: a spreadsheet", md: `A sheet removes the arithmetic errors. For a battle royale:

1. Put team names in column A, and for each match two columns: placement and kills.
2. Put your placement scale in a small lookup table, and use a lookup for the points of each placement.
3. Add kills times the points per kill, and sum across matches for the total.
4. Sort by total descending. For ties, add helper columns for wins and kills and sort by them next.

Lock the scale cells so nobody changes them mid-event, and keep one master file with one editor. A spreadsheet is the right tool if you want custom columns. Expect to spend a bit of time on formulas before the event, not during it.` },
      { h2: "Method 3: the points table calculator", md: `The [points table calculator](/tools/points-table/) does the adding and ranking in your browser. You set the placement points (1st place first), the points per kill and the number of matches, enter each team's placement and kills, and it shows ranked standings. You can download them as a CSV, or show them full screen on a TV.

${B.pointsDefault.text} Change the scale to match your own rules. For BGMI and Free Fire there are two pages that open with the right fields: [BGMI points table](/points-table/bgmi/) and [Free Fire points table](/points-table/free-fire/). Their starting scales are only examples, so type in the one from your rulebook.

For leagues with wins and draws, the [round robin generator](/tools/round-robin/) builds the fixtures and keeps a league table as you enter scores.` },
      { h2: "Breaking ties", md: `Teams will finish level, so write the order down first. A common battle royale order is:

| Order | Tie-break |
|---|---|
| 1 | Most first places (wins) |
| 2 | Most kills |
| 3 | Better placement in the last match |
| 4 | Agreed final step, for example a decider match |

That is the order the calculator uses, ending with team name only to keep the table stable. For leagues use score difference, then scores for, then the result between the two teams. Your rulebook may differ, so follow it and publish it before the first match. ${B.bgisPlacement.text} Treat that as one reported example and use your own organiser's rulebook for a real event. The [points table guide](/guides/points-table/) goes deeper on the scoring itself.` },
      { h2: "Common mistakes", md: `- Changing the scale after the first match. If teams see the rule change after results, trust goes with it.
- Adding kills in one place and placement in another, then losing track. Keep per-match columns.
- No second checker. One typo of a kill count can swap two ranks.
- Choosing the tie-break after seeing who is tied.
- Rounding or averaging per-match numbers instead of using totals.
- Showing the table only at the end. Post it after every match so mistakes are caught early.` },
    ],
    faq: [
      { q: "How do you make a points table for a tournament?", a: "List teams in rows, add a column for each match and a total, then rank by the total. For battle royale, add placement points from your scale to kills times the kill value. For leagues, award points for wins and draws. Publish the scale and tie-break order before play, and check totals with a second person." },
      { q: "What is a points table calculator?", a: "It is a tool that takes each team's results and works out the total points and the ranking for you. On this site you enter the placement scale, the points per kill and each team's placement and kills per match, and it returns ranked standings that you can download as a CSV or show on a screen." },
      { q: "How do you break ties in a points table?", a: "Decide the order in advance and publish it. For battle royale a common order is wins, then kills, then placement in the last match. For leagues it is score difference, scores for, then the result between the tied teams. If everything is equal, play a decider match instead of picking a name." },
      { q: "Can I make a points table in Excel or Google Sheets?", a: "Yes. Use one row per team, a placement and a kills column per match, and a lookup table for placement points. Add the kill points, sum the matches and sort by total. Add helper columns for wins and kills to sort ties. Lock the scale cells and keep one master copy with a single editor." },
    ],
    related: ["points-table", "free-fire-tournament-poster-guide", "bgmi-tournament-poster-guide"],
    cta: { label: "Open the points table calculator", href: "/tools/points-table/" },
  },

  {
    slug: "random-team-generator-for-fair-teams",
    title: "Random team generator: how to make fair teams for custom games and scrims",
    seoTitle: "Random team generator: how to make fair teams",
    description: "How to use a random team generator or team randomizer for custom matches and scrims: pure random draws, skill balancing with pots, seeding and re-draw rules.",
    tag: "Organiser guide",
    answer: "To make fair random teams, put players in skill pots, draw one player from each pot into every team, and publish the draw method and a single re-draw rule before you start. Pure random is quickest, but pots stop one team getting all the strong players.",
    intro: "Random teams are the answer when a group of friends, a college club or a community server wants a custom game where nobody picks sides. The trouble is that a pure random draw can put the three best players together, and then the match is over before it starts. A team randomizer works well only when you decide how much to balance, how to prove the draw was fair, and when a re-draw is allowed. Here is how to do it for custom tournaments and scrims.",
    sections: [
      { h2: "Pure random or balanced draw", md: `There are two honest choices, and you should say which one you are using.

- Pure random: shuffle the list of players and cut it into teams of the size you need. It is fast and nobody can say it was fixed. The downside is lopsided teams.
- Balanced draw: rank players roughly by skill, split them into pots, and draw one from each pot per team. Teams are still random, but each team gets one player of each level.

Use pure random for a fun night where results do not matter. Use a balanced draw for anything with a prize, a leaderboard or a reputation attached.` },
      { h2: "How to run a balanced draw", md: `1. Collect the player list with a skill note you can defend, such as the rank in the game or the last season's results. Self-reported skill is better than nothing, but ask a neutral person to check the top and bottom.
2. Sort players from strongest to weakest.
3. Cut the list into pots of equal size. For teams of four you need four pots, and the number of teams equals the number of players in a pot. With 20 players that is 5 teams and 4 pots of 5.
4. Draw one name from each pot, in turn, for team 1, then team 2, and so on.
5. Write the final teams on a screen so everyone sees the same list.

Do the draw in front of the players, in a call or in the room, and record it. The method is simple enough that people accept it. The [groups and knockout maker](/tools/groups/) uses the same pot idea for splitting teams into groups: list the best first and turn on pots.` },
      { h2: "Ways to draw: paper, sheet or tool", md: `| Method | How | Good for |
|---|---|---|
| Paper chits | Write names on slips, fold, draw from a bowl | A room full of people |
| Spreadsheet | Add a RAND() column, sort by it, then cut into teams | Lists of 20 or more |
| Chat or wheel app | Spin or shuffle on a shared screen | A call with remote players |

In a spreadsheet, put the players in column A and a random number in column B, sort by column B, then assign teams in blocks (rows 1 to 4, 5 to 8, and so on). Freeze the result by copying it as values before you share it, otherwise the numbers change every time the sheet recalculates and people will think the draw was redone.` },
      { h2: "Seeding teams after the draw", md: `Once teams exist, you may need to place them in a bracket or a group stage. Random teams of similar strength do not need seeding, so you can draw the bracket spots at random as well. If you did not balance, seed by the players' skill notes so the strongest teams cannot meet in round one. The [bracket maker](/tools/brackets/) builds a seeded single elimination bracket with byes from a pasted list, and the [round robin generator](/tools/round-robin/) works well for six teams or fewer, where everyone plays everyone.

For battle royale scrims there is nothing to seed: all teams play in one lobby and the [points table](/tools/points-table/) ranks them.` },
      { h2: "Re-draw rules", md: `Teams will complain after the draw, so write down when a re-draw is allowed before you draw.

- One re-draw only, and only for a clear fault such as a duplicate name or a player who cannot attend.
- A player who drops out is replaced by a player from the same pot, drawn at random.
- No swaps by agreement after the list is published. If two players want to swap, it needs the organiser's approval and is posted publicly.
- If the draw produces a team that has already played together in the last event and you wanted to avoid that, apply the rule you published and nothing else.

Keep a copy of the final list with the date and time. It ends most arguments in one message.` },
      { h2: "Common mistakes", md: `- Not saying whether the draw is pure random or balanced, so players guess the worst.
- Letting the best player draw first, or draw twice.
- Redoing the draw until a favourite team appears.
- Using a spreadsheet RAND() column and forgetting to copy it as values, so the order changes every time the sheet opens.
- Ignoring team size, which leaves one team with a missing player and the whole lobby waiting.
- Skipping a substitute rule, so a no-show cancels a team.` },
      { h2: "Fair teams for scrims and practice", md: `For scrims between squads that already exist, there is nothing to draw. For community nights where players join solo, draw teams once, play a set number of matches, and re-draw each session so everyone plays with different people. Keep the points and the simple [custom room setup](/guides/bgmi-and-free-fire-custom-room-setup-guide/) the same every session, so the only thing changing is the teammates.` },
    ],
    faq: [
      { q: "What is a random team generator?", a: "It is a way of splitting a list of players into teams by chance, so nobody picks sides. You can use a tool, a spreadsheet with a random number column, or paper chits. For a fair result, decide the team size first and publish how the draw was done, so players can see that no one controlled it." },
      { q: "How do I make fair teams from a random draw?", a: "Rank players roughly by skill, cut the list into equal pots, and draw one player from each pot into each team. This keeps the draw random but stops the strongest players landing together. For a casual night, a pure shuffle is fine, as long as you say that is what you used." },
      { q: "When should I allow a re-draw of teams?", a: "Only for a clear fault, such as a missing player or a duplicate entry, and only once. Replace a dropped player from the same skill pot. Write these rules before the draw and post the final list with the date, so no one can ask for a re-draw because they dislike the teams." },
      { q: "How do I randomize teams in Excel or Google Sheets?", a: "Put the names in one column and a random number formula in the next, sort by the random column, then give the first four rows to team 1, the next four to team 2, and so on. Copy the result as values before you share it, because the random numbers change every time the sheet recalculates." },
    ],
    related: ["choosing-a-tournament-format", "points-table-maker-guide", "run-a-custom-room-tournament"],
    cta: { label: "Split teams into groups with pots", href: "/tools/groups/" },
  },

  {
    slug: "tournament-fixture-generator-guide",
    title: "Tournament fixture generator: fixtures for groups, round robin and knockout",
    seoTitle: "Tournament fixture generator: groups to knockout",
    description: "How a tournament fixture generator works for groups, round robin and knockout: match counts, the circle method, byes, home and away, and a worked example.",
    tag: "Organiser guide",
    answer: "A fixture generator takes your list of teams and returns who plays whom, round by round. A round robin of n teams has n times (n minus 1) divided by 2 matches, a knockout of n teams needs n minus 1, and groups split the field into small round robins first.",
    intro: "A fixture list is a promise: every team will know when it plays and against whom. Writing one by hand works for four teams and starts breaking at ten, because someone ends up playing twice in a round or never meeting a rival. A fixture generator removes that arithmetic. Below is how fixtures work for round robin, groups and knockout, how many matches each needs, and how to check a generated list before you publish it.",
    sections: [
      { h2: "Pick the format, then count the matches", md: `The format decides how many matches you must schedule. ${B.roundRobinCount.text}

| Teams | Round robin matches | Knockout matches | Groups of 4 then top 2 knockout |
|---|---|---|---|
| 4 | 6 | 3 | not needed |
| 6 | 15 | 5 | not needed |
| 8 | 28 | 7 | 2 groups: 12 group matches, then 3 knockout |
| 16 | 120 | 15 | 4 groups: 24 group matches, then 7 knockout |

The group column adds six matches for every group of four, plus a bracket for the teams that go through. Compare the count against the hours and the rooms or pitches you have before announcing the format. The [format guide](/guides/choosing-a-tournament-format/) helps you choose.` },
      { h2: "Round robin fixtures: the circle method", md: `The standard way to generate a round robin is the circle method, and the [round robin generator](/tools/round-robin/) uses it.

1. Write the teams in two rows, or around a circle. If the number is odd, add an empty seat called a bye.
2. Keep one team fixed. In round 1, pair each team with the team opposite it.
3. For the next round, rotate every team except the fixed one by one place.
4. Repeat until every team has met every other team once. That takes n minus 1 rounds for an even n.
5. For home and away, play the whole schedule again with sides swapped.

With an odd number of teams, one team sits out each round. The generator on this site shows the sit-out as a match against a bye, lets you enter scores and keeps a league table. The side listed first is shared out so nobody is always second.` },
      { h2: "Groups, then knockout", md: `A groups stage is a set of small round robins. It suits college fests, because every team gets several matches and the final day stays short.

1. Split the teams into groups of three to five. List the best teams first and use pots so they land in different groups.
2. Generate a round robin fixture list for each group.
3. After the group matches, take the top teams from each group, usually the top two.
4. Draw the knockout so teams from the same group do not meet in the first round.

The [groups and knockout maker](/tools/groups/) does steps 1 to 4: it splits teams into 2 to 8 groups, shows live group tables and then builds the knockout bracket with byes where needed. For a knockout only, the [bracket maker](/tools/brackets/) seeds teams and moves winners forward.` },
      { h2: "Knockout fixtures and byes", md: `In a single elimination bracket every match removes one team, so n teams need n minus 1 matches. If n is not a power of two, some teams get a bye in round one, and the bye goes to the best seeds.

- 6 teams: the top 2 seeds get a bye, 4 teams play round one.
- 12 teams: the top 4 seeds get a bye, 8 teams play round one.
- Standard seeding puts seed 1 against the lowest seed and keeps the top seeds apart until late.

If you want a second chance for every team, the [double elimination maker](/tools/double-elimination/) roughly doubles the matches.` },
      { h2: "Check a generated fixture list", md: `Do these checks before you publish any list, whether from a tool or by hand.

- Every team appears once in each round, except the team with a bye.
- No pairing appears twice in a single round robin.
- The total match count equals the formula above.
- Nobody plays three matches in a row while another team rests, if rest matters in your game.
- The list has dates and times, not only pairings. The [match schedule maker](/tools/schedule/) turns a number of matches, rooms and breaks into a timed run sheet.

Matches nearly always run late, so add slack between rounds.` },
      { h2: "Common mistakes", md: `- Choosing round robin for 12 teams and discovering that 66 matches do not fit in a day.
- Forgetting the bye in an odd field, so one team plays twice in a round.
- Letting teams from the same group meet in the first knockout round.
- Publishing pairings without times, so captains cannot plan.
- Editing a fixture by hand after publishing and breaking the balance of home and away.
- Entering a result against the wrong pairing. Keep one master list and one person entering scores.` },
    ],
    faq: [
      { q: "How do you generate fixtures for a round robin?", a: "Use the circle method: keep one team fixed, rotate the rest one place each round, and pair teams across the circle. Add a bye if the number of teams is odd. For n teams you play n minus 1 rounds, and a fixture generator does this instantly, then you add dates and times to the pairings." },
      { q: "How many fixtures does a round robin with 8 teams need?", a: "The count is n times (n minus 1) divided by 2. Four teams give 6 matches, eight give 28 and sixteen give 120. If every pairing is played twice, home and away, double the count. Check this number against your hours before choosing the format." },
      { q: "What is the difference between fixtures and a bracket?", a: "Fixtures list who plays whom in a league or group, where every team keeps playing and results go into a table. A bracket is a knockout tree where the loser is out and the winner moves on. Groups followed by a knockout combine the two, which many college fests use." },
      { q: "Can a fixture generator handle an odd number of teams?", a: "Yes. It adds an empty seat called a bye, so one team sits out each round. A round robin of five teams has five rounds with a different team resting in each. In a knockout, byes go to the best seeds so they move straight to round two." },
    ],
    related: ["round-robin-schedule", "tournament-bracket-template", "random-team-generator-for-fair-teams"],
    cta: { label: "Generate round robin fixtures", href: "/tools/round-robin/" },
  },

  {
    slug: "qr-code-attendance-for-events",
    title: "QR code attendance for events: how it works, privacy and offline backup",
    seoTitle: "QR code attendance for college events and tournaments",
    description: "How QR code attendance works at college events and tournaments: passes, scanning, preventing copied codes, privacy, and what to do when the internet fails.",
    tag: "Organiser guide",
    answer: "QR code attendance gives each person a pass with a QR code. A phone at the gate scans it, checks that the pass is genuine and for this event, and records the time. Store only what you need, and keep an offline list ready for when the network drops.",
    intro: "A paper list at the gate works until the queue grows, names are misspelt and someone says their name is on it. QR attendance replaces the list with passes that a phone can check in a second, and it records who came in and when. It adds a few things to plan: how the pass is made, how copies are stopped, what personal data it holds and what you do when the signal fails. This guide covers all of it for college events and tournaments.",
    sections: [
      { h2: "How QR attendance works", md: `1. You prepare a list of people, for example players, volunteers, guests and staff.
2. Each person gets a pass, printed on a card or sent as an image to their phone, carrying a QR code.
3. At the gate, a phone camera scans the code. The scanner looks the person up on the list and shows a result: accepted, already checked in, or not valid.
4. The scan is stored with a time, so you can count attendance and see who has not arrived.

The code itself should hold as little as possible, such as an ID and a signature, not the person's phone number or address. The details stay on the list that you control.` },
      { h2: "Stopping copied and fake passes", md: `A QR code is only an image, so anyone can copy it. There are two defences.

- A signature. The pass is signed with a secret passphrase, so an edited code, for example one changed from a player pass to a staff pass, fails the check.
- A one-time check-in log. The first scan is accepted, and a second scan of the same pass shows "already checked in" with the time of the first.

The [ID card maker](/tools/id-cards/) can add a signed QR to each card, and the [gate check-in scanner](/tools/check-in/) rejects passes that do not match the event or the signature. Keep the passphrase off the cards and out of group chats. The [gate check-in guide](/guides/event-gate-checkin/) walks through the day.` },
      { h2: "Using the scanner at the gate", md: `The scanner on this site is opened at [/gate/](/gate/). It has two ways to work:

- Offline pack: you make a check-in pack for your event on the card maker's print step and load it on the scanning phone. It checks passes without the internet and keeps its log on that phone.
- Live check-in: with a gate key from a free account, several doors share one log, so a person cannot enter at two gates.

Scan with the phone camera, or type the pass code by hand if the camera cannot read a damaged card. If the pass is signed, you type the event passphrase once on the scanning phone.

If you use one phone, its log is the record, so keep it charged and export or photograph the list before you leave.` },
      { h2: "Privacy: what to store", md: `Attendance records are personal data, so treat them carefully.

- Collect only what you need to run the event: a name, a team or role, and the check-in time.
- Do not put phone numbers, dates of birth or ID numbers inside the QR code.
- For players under 18, follow your institution's rule on guardian consent, and tell people what you record.
- Say how long you keep the list, and delete it after the event and any report you owe a sponsor.
- Share the list only with the people who need it, and avoid pasting it into public chats.

A short notice on the registration page, in plain words, is enough: what you collect, why and for how long.` },
      { h2: "Offline fallback", md: `Mobile data in a college hall or a gaming cafe is unreliable, so plan for it.

| Risk | Backup |
|---|---|
| No internet at the gate | Use an offline pack that checks without a connection |
| The scanner phone dies | A second phone with the same pack, and a power bank |
| A pass will not scan | Type the pass code, or check the printed list by name |
| Camera cannot read the code | Print larger codes with a clear margin |

Print a short paper list as the last resort, sorted by name, and note any hand check-ins on it so the record stays complete.` },
      { h2: "Common mistakes", md: `- Sending the same pass image to a whole team, so one code is used by everyone.
- Printing codes too small or on glossy card that reflects the light.
- Never testing the scanner with a real card before the day.
- Putting personal details in the code itself.
- Using two phones with separate offline logs at different doors, so the same person can enter twice. Use live check-in for several doors.
- Keeping the attendance list forever with no reason.` },
    ],
    faq: [
      { q: "How does QR code attendance work?", a: "Each person gets a pass with a QR code. At the gate a phone scans it, looks the person up on your list and records the time. A signed code is rejected if it is edited, and a second scan shows the person is already checked in. The list, not the code, holds the personal details." },
      { q: "Can QR passes be copied or faked?", a: "A QR image can always be copied, but a signed pass and a check-in log limit the damage. A changed code fails the signature, a pass for another event is rejected, and a copy of a used pass shows already checked in. Keep the passphrase private and test with a real card first." },
      { q: "Is QR check-in safe for students' privacy?", a: "It can be, if you store little. Keep names, team and check-in time, never put phone numbers or ID numbers in the code, tell people what you record, follow your institution's rules for minors and delete the list after the event. Share it only with the people running the gate." },
      { q: "What if the internet fails at the gate?", a: "Use an offline pack loaded on the scanning phone, which checks passes without a connection and keeps its own log. Have a charged backup phone and a printed list sorted by name. For several doors, offline logs are separate, so use live check-in with a gate key where signal allows." },
    ],
    related: ["event-gate-checkin", "player-id-cards", "run-a-campus-tournament"],
    cta: { label: "Open the gate check-in scanner", href: "/tools/check-in/" },
  },

  {
    slug: "esports-tournament-registration-form-template",
    title: "Esports tournament registration form template for any game",
    seoTitle: "Esports tournament registration form template",
    description: "A copy-ready esports tournament registration form for any game: the fields to ask, what to leave out, consent for minors, and how to handle duplicates and no-shows.",
    tag: "Template",
    answer: "An esports tournament registration form should collect the team name, captain contact, each player's name and in-game ID, substitutes, consent for players under 18 and agreement to the rules. Ask only what you need, and set a deadline and a slot limit.",
    intro: "A registration form is the first rule of your event. It decides who gets a slot, how you reach them and what you can prove when two teams claim the same name. This template works for any game, from squad shooters to five-a-side tactical games and one-versus-one titles. If you run Free Fire, use the dedicated [Free Fire registration form](/guides/free-fire-tournament-registration-form-template/), which is tuned to that game. Everything below is a base you can adapt.",
    sections: [
      { h2: "The template, section by section", md: `Copy this and change the names in square brackets.

### About the team
1. Team name (must be unique)
2. College, club or city
3. Game and division, if you run more than one

### Captain
4. Captain's full name
5. Captain's phone number or email, whichever you will actually use

### Players
6. For each player: full name, in-game name or ID, and whether under 18
7. Substitutes: name and in-game ID, up to [number] allowed

### Before you submit
8. Anything the organiser should know (optional)
9. I have read the rules and agree to follow them (yes or no)
10. Players under 18 have a parent or guardian's consent (yes, no or not applicable)

Put the event name, date and registration deadline at the top of the form, so a player who finds it later sees the same facts as the poster.` },
      { h2: "Team size by game type", md: `The number of player rows changes with the game. Set it before you publish.

| Game type | Players per team | Substitutes |
|---|---|---|
| Squad battle royale | 4 | 1 is common |
| Five against five tactical | 5 | 1 is common |
| Duo | 2 | usually none |
| Solo | 1 | none |

These are the sizes the [registration form tool](/tools/registration/) offers as presets, and the ones the [tournament planner](/tools/plan/) puts in its sign-up form. Your game's rules may differ, so check them and set your own. The tool gives you ready-to-copy text, or a link that collects teams and adds approved ones to your roster.` },
      { h2: "What not to ask", md: `Every extra field lowers the number of completed forms, and extra data is a risk you then have to look after.

- Do not ask for ID numbers, bank details or home addresses at registration.
- Do not ask for a social media password or an in-game account password. A player ID is enough.
- Do not ask for a payment in the form itself unless you use a real payment service. Say how to pay and confirm by message.
- Do not ask for a date of birth when a yes or no under-18 question does the job.

If you need a college ID for entry on the day, ask for it at the gate, not in the form. The [player ID cards guide](/guides/player-id-cards/) covers that.` },
      { h2: "Rules, consent and minors", md: `Add a link to your rules and a required checkbox. Short rules are read, so keep the link to a [one-page rules document](/guides/esports-tournament-rules-template/).

For players under 18, ask for a guardian's consent in a form that your institution or country allows. A yes or no tick is a minimum, and some colleges want a signed letter. Check what applies where you are, and say what you will do with the data.

State the deadline, the slot limit and what happens when slots fill. For example: "registration closes on [date] or when 24 teams are confirmed, whichever is first. Teams are confirmed in the order they pay."` },
      { h2: "After the form is submitted", md: `The form is the start of the process, not the end.

1. Reply to each captain with a confirmation, within a day.
2. Put confirmed teams on a roster list and mark unpaid teams as pending.
3. Check for duplicate team names and the same player on two teams.
4. Share the schedule, the room-card plan and the rules once registration closes.
5. Keep a waiting list, because someone always drops out.

A short confirmation message with the date, time and rules link prevents most questions. The [registration form fields guide](/guides/tournament-registration-form-fields/) explains why each field earns its place.` },
      { h2: "Common mistakes", md: `- No deadline, so teams register at midnight before the event.
- No unique team-name rule, so two teams register as the same name.
- Asking for too much, so half the captains give up.
- No substitute field, then a player drops out and you have no name for the replacement.
- Not confirming registrations, so captains register twice.
- Forgetting consent for minors on a college or school event.
- Collecting data you never use and never delete.` },
    ],
    faq: [
      { q: "What fields should an esports registration form have?", a: "Team name, college or city, captain name and contact, each player's name and in-game ID, substitutes, an under-18 question with guardian consent, and a tick that the team has read the rules. Put the event name, date and deadline at the top. Leave out passwords, bank details and ID numbers." },
      { q: "How do I stop duplicate team registrations?", a: "State that team names must be unique, check the list as forms arrive, and ask each captain to confirm by message. Mark each confirmed team on a roster. Check that no player ID appears on two teams, and keep a waiting list so a rejected duplicate can be replaced quickly." },
      { q: "Do I need parental consent for players under 18?", a: "It depends on your institution, the venue and where you live, so check the rules that apply to you. A common approach is to ask whether each player is under 18 and require a guardian's consent for those who are, then keep only what you need for the event." },
      { q: "Can I use one registration form for different games?", a: "Yes, if you add a game field and set the number of player rows for each game. Squad games need four players, tactical games five, duos two. If the rules differ a lot, make one form per game so teams see only what applies to them and the roster stays clean." },
    ],
    related: ["tournament-registration-form-fields", "esports-tournament-rules-template", "free-fire-tournament-poster-guide"],
    cta: { label: "Get a ready registration form", href: "/tools/registration/" },
  },

  {
    slug: "custom-room-card-id-password-template",
    title: "Custom room card: how to share room ID and password safely",
    seoTitle: "Custom room card: share room ID and password",
    description: "A room card template for BGMI and Free Fire custom rooms: what to put on it, when to send the room ID and password, and how to stop leaks and stream snipers.",
    tag: "Template",
    answer: "A room card is a short message that gives each team the match number, room ID, password, map and start time. Send it to captains only, a few minutes before start, use a new ID and password for every match, and tell teams not to share it.",
    intro: "Custom rooms run on two secrets: the room ID and the password. If they leak, strangers join, a team gets scouted by an opponent or a streamer gets sniped, and the match is ruined. A good room card is short, goes to the right people at the right time and is easy to copy. Here is a template you can paste into a message, with the rules that keep rooms private. It suits BGMI and Free Fire alike.",
    sections: [
      { h2: "The room card template", md: `Copy this and fill the brackets for each match. Send it as plain text, so it is easy to copy.

- Event: [event name]
- Match: [number] of [total]
- Map and mode: [map], [squad or other mode], [perspective if relevant]
- Room ID: [ID]
- Password: [password]
- Join by: [time, for example 4:10 PM]
- Match starts: [time, for example 4:15 PM]
- Slot or team number: [number]
- Rules reminder: no sharing the room ID, captains only, use your registered in-game names
- Contact if you cannot join: [name and number]

Create the room only after you know the match number, and fill every field before sending. A half-filled card creates questions in the group chat.` },
      { h2: "When and to whom to send it", md: `1. Send room cards to captains, not to the full group. Captains pass them to their own players.
2. Send each card about 10 minutes before the join time, enough to get in but not long enough to leak.
3. Use a different ID and password for each match. Never reuse a room.
4. Send the card from one account, the organiser's, so teams know which message is real.
5. Post "room closed" once the match starts, so latecomers stop asking.

If you stream, delay the stream by a few minutes and keep the room card off the screen, or the room is open to anyone watching. The [stream your event guide](/guides/stream-your-event/) covers the delay.` },
      { h2: "Setting up the room", md: `The settings you choose inside the game are covered in the [custom room setup guide](/guides/bgmi-and-free-fire-custom-room-setup-guide/). Two points matter for the card:

- Choose a password that is easy to type on a phone, such as a short mix of letters and numbers, and avoid characters that are easy to confuse.
- Check the slot or team count before you send the card, so teams you invited can fit.

For scoring afterwards, collect the placements and kills from each match and enter them into the [points table calculator](/tools/points-table/). A [custom room tournament guide](/guides/bgmi-custom-room-tournament/) shows how many matches to run.` },
      { h2: "Keeping the room private", md: `| Risk | What to do |
|---|---|
| A stranger joins | Use a new room and password for every match, send to captains only |
| A rival scouts a team | Do not post the room card in open groups |
| Stream sniping | Delay the stream and hide the card on screen |
| A leak mid-event | Cancel the room, create a new one, resend to captains |
| Player joins with a wrong name | Check names against the registered list before start |

Also tell teams in the rules that sharing a room ID or password outside the team can lead to a penalty. Write the penalty in your [rules](/guides/esports-tournament-rules-template/) before the event, so you can apply it the same way to everyone.` },
      { h2: "Message formats for WhatsApp", md: `Keep the card short enough to read at a glance.

- Use plain text. Fancy fonts do not paste well into a game's join box.
- Put the room ID and password on separate lines, with nothing else on them.
- Write the time in the 12-hour style your players use, with AM or PM.
- Pin nothing. A pinned message is easy to find later, including by people you did not invite.
- Do not send a screenshot of the card to an open group.

If you send many cards in one day, name them by match, for example "Match 3 room card", so captains can find the right one quickly.` },
      { h2: "Common mistakes", md: `- Sending the room ID the night before, which gives everyone time to leak it.
- Reusing one room for the whole event.
- Posting the card in the main group chat, not to captains.
- Showing the card on a stream without a delay.
- A late start because the organiser had not yet created the room when the join time came.
- Not checking who joined against the registered list.
- Forgetting a contact for players who cannot get in.` },
    ],
    faq: [
      { q: "What should a custom room card include?", a: "The event name, match number, map and mode, room ID, password, the time to join and the start time, the team's slot number if you use one, a short reminder not to share, and a contact for problems. Send it as plain text so captains can copy the ID and password straight into the game." },
      { q: "When should I send the room ID and password?", a: "About ten minutes before the join time, to captains only. That is long enough for teams to get ready and short enough that a leak does little harm. Use a fresh ID and password for every match and send from one organiser account so teams know which message to trust." },
      { q: "How do I stop stream snipers from joining my room?", a: "Delay the stream by a few minutes, keep the room card and the game's lobby off the screen, and use a new room and password per match. If you think the details leaked, close the room, make a new one and resend the card to captains." },
      { q: "Can I use the same room for several matches?", a: "It is safer not to. A new room and password for each match limit how far a leaked ID can spread and keep results clean. Create each room just before you send its card, and label the cards by match number so captains do not use an old one." },
    ],
    related: ["bgmi-custom-room-tournament", "run-a-custom-room-tournament", "esports-tournament-registration-form-template"],
    cta: { label: "Plan the match schedule", href: "/tools/schedule/" },
  },

  {
    slug: "bgmi-tournament-rules-template",
    title: "BGMI tournament rules template you can copy and adapt",
    seoTitle: "BGMI tournament rules template to copy",
    description: "A copy-ready BGMI tournament rules template for custom and college events: eligibility, squads, scoring, conduct, disputes and penalties, with example values.",
    tag: "Template",
    answer: "A BGMI tournament rules document covers who can play, squad and substitute limits, the match and scoring rules, conduct and cheating, disputes and penalties. Use the template below, change the example numbers, and follow the current official rulebook for any official event.",
    intro: "Rules do two jobs: they tell teams what to expect, and they let you say no without a fight. For a college or community BGMI event the rules do not need to be long, but they do need to be written, published before registration and applied the same way to everyone. This template covers the sections that matter. Every number in it is an example to change, not an official value, and for an official BGMI event you should follow the publisher's current rulebook.",
    sections: [
      { h2: "How to use this template", md: `Copy each section into a document, replace the values in square brackets, and share the final version as a pinned link, not a screenshot. Number the rules so you can cite them in disputes.

This template sits next to your other documents: the [BGMI poster](/guides/bgmi-tournament-poster-guide/) states the date and format, the [registration form](/guides/esports-tournament-registration-form-template/) collects teams, and the room card shares each match's room details. For a generic version covering any game, see the [esports tournament rules template](/guides/esports-tournament-rules-template/).` },
      { h2: "Eligibility and teams", md: `1. Who can play: [for example students of named colleges, or open to anyone in India]. Players under 18 need guardian consent.
2. Team size: ${B.bgmiSquad.text} Set your own, for example 4 players and [number] substitute.
3. One player may be registered in one team only.
4. Players use the in-game name and ID given at registration. Name changes need the organiser's approval.
5. Registration closes on [date] or when [number] teams are confirmed.
6. Devices: players use their own mobile devices. Emulators are not allowed, and the organiser may ask to check a device.` },
      { h2: "Match format and scoring (example values)", md: `Write the match count, map order and scoring in the rules, not in chat. The scoring below is an example. ${B.bgisPlacement.text} ${B.bgisKill.text} That was reported for BGIS 2024 by two media sites, and the current official scale may be different, so for an official event follow the publisher's current rulebook. For a custom event, choose your own and write it down.

| Placement | Example points |
|---|---|
| 1st | 10 |
| 2nd | 6 |
| 3rd | 5 |
| 4th | 4 |
| 5th | 3 |
| 6th | 2 |
| 7th and 8th | 1 each |
| 9th and below | 0 |

Kills: [1] point each. Matches: [number], on [maps]. Total points decide the ranking. Tie-breaks, in order: most first places, most kills, then better placement in the last match. The [points table calculator](/tools/points-table/) uses this tie-break order by default, and the [BGMI points system guide](/guides/bgmi-points-system-explained/) explains the scale in more detail.` },
      { h2: "Conduct and fair play", md: `- No cheating, hacks, modified clients or third-party tools. A confirmed breach means disqualification of the player and, at the organiser's choice, the team.
- No teaming up with other squads, and no deliberately feeding kills.
- No abusive language in chat or voice. The organiser may warn, penalise or remove.
- No sharing room IDs or passwords outside the team.
- Players must join on time. A team not in the room at the start time may lose that match.
- Each team is responsible for its own device, internet and power.

State plainly who decides: the organiser or a named referee, and that the decision after a review is final for that event.` },
      { h2: "Disputes and penalties", md: `1. A captain raises a dispute in writing to [contact] within [number] minutes of the match ending.
2. Include the match number, the issue and any screenshot or recording.
3. The referee reviews it and replies before the next match, where possible.
4. Penalty scale, for example: a warning, then points deducted, then loss of the match, then disqualification. Decide the points and write them down.
5. Results are final once the table is posted and no dispute is open.

A single published scale is fairer than deciding each case fresh.` },
      { h2: "Common mistakes", md: `- Publishing the rules after registration, so teams say they never agreed.
- Copying an official scoring scale without saying it is only an example, then arguing when the official rules change.
- Leaving out the penalty scale, so every breach becomes a debate.
- No dispute window, so complaints arrive hours later.
- Rules that exist only in chat messages and cannot be found.
- Changing a rule during the event without telling every captain at once.` },
    ],
    faq: [
      { q: "What rules should a BGMI tournament have?", a: "Eligibility, team and substitute limits, the match count and scoring, tie-breaks, conduct and cheating, how disputes are raised and the penalty scale. Number them, publish them before registration and apply them equally. For an official event, follow the publisher's current rulebook instead of your own numbers." },
      { q: "Is this the official BGMI rulebook?", a: "No. It is a template for custom, college and community events. The numbers in it are examples you can change, and the scoring reflects a scale reported for BGIS 2024 by media sites, not Krafton's current rules. Always check the publisher's latest rulebook for an official or ranked event." },
      { q: "How do I handle cheating accusations?", a: "Ask the captain to report it in writing within a set time, with the match number and any recording. A named referee reviews it, and the penalty follows a scale you published in advance, from a warning up to disqualification. Do not decide on rumour, and tell both teams the result." },
      { q: "Should substitutes be allowed in a BGMI tournament?", a: "That is your choice, but state it. Many events allow one substitute per team, who must be registered in advance and may replace a player between matches, not during one. Writing the limit down avoids disputes about borrowed players on the day." },
    ],
    related: ["bgmi-tournament-poster-guide", "esports-tournament-registration-form-template", "custom-room-card-id-password-template", "points-table"],
    cta: { label: "Open the BGMI points table", href: "/points-table/bgmi/" },
  },

  {
    slug: "bgmi-tournament-schedule-template",
    title: "BGMI tournament schedule template: timings for a one-day event",
    seoTitle: "BGMI tournament schedule template for one day",
    description: "A BGMI tournament schedule template for a one-day custom event: a timed run sheet, how long matches take, break planning and a checklist you can adapt.",
    tag: "Template",
    answer: "A BGMI tournament schedule lists the check-in, each match with its join and start time, the breaks and the results time. Plan about 40 minutes per match including the lobby and results, add a longer break every few matches, and leave slack because matches run late.",
    intro: "A schedule is what makes a one-day tournament finish before the venue closes. The pattern is simple: check-in, a briefing, then a repeating loop of join, play, score and rest, with a longer break in the middle. This template gives a run sheet you can adapt, and a way to work out the timings from your own match count. The durations are examples. Measure your own first match and adjust.",
    sections: [
      { h2: "How long a match takes", md: `There is no official figure you can rely on, because it depends on the mode, the map, how fast teams join and how long results take. Plan with your own numbers.

- Lobby and room card: about 10 minutes before start, including the time for captains to join.
- Play: the match itself, which you should time in a practice room.
- Results: a few minutes to collect placements and kills, and to update the table.
- Gap: a short pause before the next room.

The example sheet below uses 40 minutes per match slot and 10 minutes between rounds, which are the defaults of the [match schedule maker](/tools/schedule/). Replace them after you time a practice match.` },
      { h2: "A one-day run sheet", md: `This example assumes one lobby of up to 20 squads, six matches and a lunch break. Times are examples.

| Time | What happens |
|---|---|
| 10:00 | Check-in opens, teams checked against the roster |
| 10:45 | Briefing: rules, scoring, dispute window |
| 11:00 | Match 1 room card sent, join by 11:10 |
| 11:15 to 11:55 | Match 1 |
| 12:05 to 12:45 | Match 2 (after a 10 minute gap) |
| 12:55 to 13:35 | Match 3 |
| 13:35 to 14:15 | Lunch and standings check |
| 14:15 to 14:55 | Match 4 |
| 15:05 to 15:45 | Match 5 |
| 15:55 to 16:35 | Match 6 |
| 16:45 | Final standings and winners announced |

Share it with captains as a list, and tell them that start times can move by a few minutes. The [rules](/guides/bgmi-tournament-rules-template/) should say how much lateness a team is allowed.` },
      { h2: "Work out your own timings", md: `1. Decide the number of matches, for example 6, from how many hours you have, not from what you wish.
2. Time one practice match, from the room card to the table update.
3. Add the gap between rounds and decide where the longer breaks go, for example after every third match.
4. Add 15 to 20 percent slack for the day, because some match will run long.
5. Work backwards from the venue closing time to get the latest check-in time.

The schedule maker does this arithmetic: you enter the start time, the number of matches, the duration, the gap, how many matches run at the same time and the break pattern, and it gives a timed list you can print or download. Matches are numbered M1, M2 and so on, so you can match them to your rooms.` },
      { h2: "Lobbies, rooms and large fields", md: `One battle royale lobby holds a limited number of teams, so a bigger event needs several lobbies. Check the room size of your game mode and your tool, then split the registered teams into groups that play in parallel or in turns. If you run lobbies at the same time, one referee per lobby is useful.

For a two-stage event, run groups first and a final for the top teams. The [format guide](/guides/choosing-a-tournament-format/) explains the choices, and the [points table](/tools/points-table/) can carry points from earlier rounds. Each room needs its own [room card](/guides/custom-room-card-id-password-template/) and its own result sheet.` },
      { h2: "Common mistakes", md: `- No slack, so a 20 minute delay in match 2 becomes an hour by match 6.
- Using hopeful times from a poster instead of times from a practice match.
- Putting the long break at the end, when everyone is tired and leaving.
- Forgetting the results time and starting the next room before the table is updated.
- Not telling captains the schedule can move, so they hold you to every minute.
- Scheduling too many matches for the hours available and cutting the final.` },
      { h2: "Checklist for the day before", md: `- Rules published and pinned.
- Roster final, with substitutes noted.
- Schedule shared with captains, with join and start times.
- Room cards drafted for each match.
- Referees and a scorer assigned, with the table sheet ready.
- A device and charger for the scorer, and a spare.
- A plan for the stream or screen, if there is one.

The [tournament planner](/tools/plan/) can produce a first draft of the format, the schedule and the rules as one pack, which you then change to fit your venue.` },
    ],
    faq: [
      { q: "How long does a BGMI tournament match take?", a: "It depends on the mode, map and how quickly teams join, so time a practice match before you fix the schedule. Add the lobby time before it, the minutes to collect results after it and a gap before the next room. Many organisers use a round slot, such as 40 minutes, then adjust." },
      { q: "How many matches should a one-day BGMI tournament have?", a: "Count backwards from your venue hours: slots per match, plus breaks, plus slack. Six matches is an example that fits a day with a lunch break, but your number should come from your own timings. More matches make the ranking more reliable, but a day that runs out of time is worse." },
      { q: "How do I schedule several lobbies at once?", a: "Split the registered teams into groups that fit one room, then run the groups in parallel with one referee per lobby, or one after another if you have a single room. For a final, take the top teams into one lobby. Give each lobby its own room card and result sheet." },
      { q: "What should I do when the schedule runs late?", a: "Tell captains the new start time straight away, shorten the next gap if possible and trim the break rather than the matches. Do not change the rules or the scoring to catch up. That is why you add slack at the start. If delays continue, decide early whether to drop the last match." },
    ],
    related: ["bgmi-tournament-rules-template", "custom-room-card-id-password-template", "bgmi-tournament-poster-guide"],
    cta: { label: "Build your match schedule", href: "/tools/schedule/" },
  },
];
