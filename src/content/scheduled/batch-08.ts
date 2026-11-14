import type { Draft } from "./types";

/** Posts 70 to 79. */
export const BATCH_08: Draft[] = [
  {
    slug: "run-a-tournament-with-no-budget",
    title: "Run a tournament with no budget: free tools, free venues, real events",
    seoTitle: "Run a tournament with no budget",
    description: "How to run a good tournament with no money: free tools for brackets and registration, free venues, volunteer help, non-cash prizes and a plan that costs nothing.",
    tag: "Organiser guide",
    answer: "Run online or in a free space, use free tools for registration, brackets and posters, recruit volunteers, give certificates and recognition instead of cash, and ask a local business for small support in kind. A no-budget event works when the plan is simple.",
    intro: "You do not need money to start. You need a clear format, a way to sign people up, a place to play and a reason for people to turn up. Many good community events began with nothing but a free bracket and a chat group. Here is how to plan one that holds together.",
    sections: [
      { h2: "Start small and online", md: `The cheapest venue is the internet. An online event needs no hall, no power, no seating and no travel. Players join from home, and you run the bracket from your phone.

If you want an in-person event, look for free spaces: a classroom, a common room, a club room or a community hall that a friendly teacher or officer can lend. Ask early and explain the plan in two lines. The [online versus LAN guide](/guides/online-vs-lan-tournament-which-to-run/) compares the two.` },
      { h2: "Free tools that cover the basics", md: `Most of what a tournament needs is free.

| Job | Free option |
|---|---|
| Registration | The [registration form tool](/tools/registration/) |
| Brackets and groups | The [bracket maker](/tools/brackets/) and [groups tool](/tools/groups/) |
| Schedule | The [schedule maker](/tools/schedule/) |
| Points table | The [points table tool](/tools/points-table/) |
| Posters and certificates | The [poster maker](/tools/poster/) and [certificate maker](/tools/certificates/) |
| Chat and announcements | A free chat group, as in [tournament communication](/guides/tournament-communication-whatsapp-and-discord/) |

Print only what you need, or share everything digitally.` },
      { h2: "Prizes that cost nothing", md: `You can run a good event without cash prizes.

- Digital certificates for winners and everyone who took part.
- A title, such as "Season 1 Champion", and a role in your chat group.
- A featured post on your page or a short write-up with photos.
- A trophy that is passed on each season.

Say clearly that there is no cash prize, so nobody expects one. If someone offers a small gift or a voucher, take it, and add it to the prize list.` },
      { h2: "Ask for help in kind", md: `A local shop, cafe or college club may give something other than money: a venue, snacks for volunteers, a printed banner, a voucher. Asking for a small, specific thing is easier than asking for sponsorship.

Offer something back: their name on the poster and a thank-you post. The [sponsor pitch guide](/guides/sponsor-pitch/) has a short script. Count only what is confirmed, and use the [budget template](/guides/tournament-budget-template/) to see what you still lack.` },
      { h2: "Use volunteers well", md: `People will help for free when the task is clear and short. Recruit a few friends and give each a role and a lead, as in [volunteer roles and briefing](/guides/tournament-volunteer-roles-and-briefing/). Say what you need and for how long.

Thank them properly. A certificate with their role costs nothing and means something to a student.` },
      { h2: "Keep the format cheap to run", md: `Pick a format that needs little staff and little time: a single elimination bracket for small fields, a short Swiss for larger ones, or a weekly cup that repeats. See [weekly community cup](/guides/weekly-community-cup-how-to-run/) for a format that runs itself.

Fewer matches mean fewer referees and a shorter day. The [how many teams guide](/guides/how-many-teams-for-your-format/) shows the match counts.` },
      { h2: "Grow it, then add money", md: `Run the first event free and record what happened: number of entries, matches, photos, feedback. Use that record to ask for support next time. A sponsor says yes more easily to something that already happened.

Add an entry fee only when you have something to spend it on, and tell players what it covers.` },
      { h2: "Common mistakes", md: `- Waiting for money before starting.
- Promising prizes you cannot pay for.
- Doing every job yourself.
- Printing everything in colour.
- Not keeping a record to show sponsors next time.` },
    ],
    faq: [
      { q: "Can I run a tournament with no money?", a: "Yes. Run it online or in a free space, use free tools for registration, brackets, schedules and posters, recruit volunteers, give certificates and titles instead of cash, and ask local businesses for small support in kind. Choose a simple format that needs few matches and little staff." },
      { q: "What prizes can I give if I have no budget?", a: "Digital certificates for winners and participants, a champion title and a role in your community, a featured post or write-up with photos, and a trophy passed on each season. Say clearly that there is no cash prize, and add any gift or voucher a local supporter offers." },
      { q: "How do I find sponsors for a first event?", a: "Ask for something small and specific in kind, such as a venue, snacks or a printed banner, and offer a poster mention and a thank-you post. Count only confirmed support. After the first event, use your record of entries, photos and feedback to ask for more next time." },
    ],
    related: ["sponsor-pitch", "tournament-budget-template", "weekly-community-cup-how-to-run", "tournament-volunteer-roles-and-briefing"],
    cta: { label: "Start with a free bracket", href: "/tools/brackets/" },
  },

  {
    slug: "tournament-ladder-format-explained",
    title: "Tournament ladder format explained: challenges, ranks and seasons",
    seoTitle: "Tournament ladder format explained",
    description: "How a ladder format works: ranks, challenge rules, how far up you can challenge, inactivity, seasons and when a ladder beats a bracket for a long running community.",
    tag: "Format guide",
    answer: "A ladder ranks players in order. A player challenges someone above them, and the winner takes or keeps the higher rank. It suits ongoing play, since matches are scheduled by players, but it needs rules on challenge range, deadlines and inactivity.",
    intro: "A bracket ends. A ladder keeps going, which suits clubs, schools and communities that want regular matches without a fixed event day. Players play when they can, and the ranking tells everyone who is on top. The rules matter more than the software.",
    sections: [
      { h2: "How a ladder works", md: `Players are listed in order, from rank 1 downward. A player can challenge someone above them. If the challenger wins, they swap places. If the challenged player wins, the order stays.

That is the whole idea. Everything else is rules to keep it fair and moving: who can challenge whom, how long they have to play, and what happens when someone stops showing up.` },
      { h2: "Challenge range", md: `Limit how far up a player may challenge. Without a limit, the bottom player could challenge the top player and skip the work in between.

| Rule | Effect |
|---|---|
| Challenge up to 2 ranks above | Slow, steady movement |
| Challenge up to 4 ranks above | Faster movement, more upsets |
| Any rank | Chaotic; rewards a strong newcomer quickly |

The numbers are examples. Pick one that matches the size of your ladder, and publish it.` },
      { h2: "Deadlines and refusals", md: `A ladder stalls when a challenge sits unanswered. Set a deadline, such as seven days from the challenge to a played match. If the challenged player cannot or will not play, they forfeit and the challenger moves up.

Allow a small number of reasonable delays, such as exams or travel, but cap them. Write the rule, and keep a public list of open challenges. The [no-shows guide](/guides/handling-no-shows-and-walkovers/) has useful wording.` },
      { h2: "Inactivity", md: `Players who stop playing block the ladder. Choose a consequence: drop a rank after a period with no match, or move to an inactive list and return at a set position.

A common policy is to drop an inactive player by a few ranks each week after a grace period. Use whatever you can run consistently. Publish it so nobody is surprised.` },
      { h2: "Seasons and resets", md: `Long ladders benefit from seasons. At the end of each season, say eight or twelve weeks, record the final order, award titles and start a fresh ladder, seeded by the last result. The seeding approach is similar to [how to seed a bracket](/guides/how-to-seed-a-tournament-bracket/).

A reset keeps new players interested, since the top is not permanently held by whoever joined first.` },
      { h2: "Recording matches", md: `Keep one public table: rank, player, last match, and open challenges. Ask players to report results with a screenshot or a note from both sides. Appoint one person to update the table, and keep a history.

A simple shared sheet works. If a dispute arises, use the [dispute process](/guides/tournament-dispute-process-protest-window/).` },
      { h2: "When to use a ladder or a bracket", md: `Use a ladder when you want ongoing play, flexible times and a ranking. Use a bracket for a single event with a clear champion. Use both: a ladder through a season, then a bracket for the top eight as a finals event. The [group and knockout planning guide](/guides/group-stage-and-knockout-planning/) shows how to build the finals.` },
      { h2: "Common mistakes", md: `- No limit on how far up a player may challenge.
- No deadline on challenges.
- No rule for inactive players.
- Letting the ladder run forever without a season.
- Keeping results in private messages.` },
    ],
    faq: [
      { q: "How does a tournament ladder work?", a: "Players are ranked in order. A player challenges someone above them, and if the challenger wins they swap places, otherwise the order stays. Rules limit how far up a challenge may go, set a deadline to play, and say what happens to inactive players. It suits ongoing play without a fixed event day." },
      { q: "How far up should players be allowed to challenge?", a: "Choose a limit that fits the size of the ladder, such as two to four ranks above. A short range gives slow, steady movement, and a long range gives faster movement and more upsets. Without a limit, a player could jump straight to the top and skip the work in between." },
      { q: "How do I handle inactive players on a ladder?", a: "Write the rule before the ladder starts. Common options are dropping an inactive player a few ranks each week after a grace period, or moving them to an inactive list and returning them at a set position. Publish the rule and apply it to everyone the same way." },
    ],
    related: ["how-to-seed-a-tournament-bracket", "handling-no-shows-and-walkovers", "group-stage-and-knockout-planning", "tournament-dispute-process-protest-window"],
    cta: { label: "Build a finals bracket", href: "/tools/brackets/" },
  },

  {
    slug: "football-tournament-bracket-for-16-teams",
    title: "Football tournament bracket for 16 teams: knockout, groups and timing",
    seoTitle: "Football tournament bracket for 16 teams",
    description: "How to run a 16 team football tournament: knockout versus groups, match counts, a one day or two day schedule, byes, pitches and a bracket you can build in minutes.",
    tag: "Sport guide",
    answer: "Sixteen teams fit a clean knockout of 15 matches in four rounds, or four groups of four with 24 group matches then a knockout of 7 matches. Choose by how many matches each team must play and how much time and how many pitches you have.",
    intro: "Sixteen is a friendly number for a tournament: it divides evenly into a knockout, groups of four, or groups of eight. The choice is not only about format. It is about how many matches each team plays, and how many fit in your day.",
    sections: [
      { h2: "Option one: straight knockout", md: `A single elimination bracket for 16 teams has four rounds: round of 16, quarter-finals, semi-finals and final. That is 15 matches in total, and the champion plays four.

| Round | Matches |
|---|---|
| Round of 16 | 8 |
| Quarter-finals | 4 |
| Semi-finals | 2 |
| Final | 1 |

It is fast and simple, but half the teams play only one match. Use it when time is short. Build it with the [bracket maker](/tools/brackets/).` },
      { h2: "Option two: groups then knockout", md: `Split the teams into four groups of four. Each group plays a round robin of 6 matches, which is 24 group matches. The top two from each group go to a quarter-final knockout of 7 matches.

Every team plays at least three matches, which feels better for players who travelled. Total matches: 31. See [group stage and knockout planning](/guides/group-stage-and-knockout-planning/) and the [groups tool](/tools/groups/). Use the [football points guide](/guides/football-points-system-and-tiebreakers/) for the table.` },
      { h2: "Option three: two groups of eight", md: `Two groups of eight play 28 matches each in a single round robin, 56 in total. That is rarely practical in one day. Use it only for a league that runs over weeks.

For a one or two day event, groups of four are the sensible choice.` },
      { h2: "Fitting it into a day", md: `Count the time. A short match format, such as two halves of 10 or 15 minutes, lets you run many matches. Add a gap between matches for changeovers.

For groups of four with 31 matches on one pitch, you need many hours. With two pitches in parallel, the group stage takes about half the time. Test your numbers with the [schedule maker](/tools/schedule/). For a one-day event, the [five-a-side format guide](/guides/five-a-side-football-tournament-format/) shows how to size matches.` },
      { h2: "Seeding and the draw", md: `Seed the strongest teams so they do not meet early: in a knockout, give seeds 1 and 2 opposite halves. In groups, place one top seed in each group using pots. The [fair draw guide](/guides/how-to-draw-a-fair-tournament-draw/) and [seeding guide](/guides/how-to-seed-a-tournament-bracket/) explain how to do it in public so nobody doubts it.` },
      { h2: "Tie-breaks and drawn knockout matches", md: `In groups, rank by points, then a published tie-break order. In knockout matches, a draw needs a decider: extra time, penalties, or both. Decide the rule before the event and read it at the captains' meeting. Use [how to write tie-breaker rules](/guides/tournament-tiebreaker-rules-how-to-write/) as a template.` },
      { h2: "A quick decision guide", md: `Choose by what matters most to you.

- If you have only a few hours and one pitch, run the straight knockout.
- If you want every team to play at least three matches, run four groups of four and a knockout, and add a second pitch or shorten the halves.
- If you run weekly matches over several weeks, a league of two groups of eight works.

Whichever you pick, tell teams the number of guaranteed matches in the invitation. Visiting teams decide whether to travel based on that number, and an honest answer builds trust for your next event.` },
      { h2: "Common mistakes", md: `- Planning 31 matches on one pitch in one day.
- No tie-break order for the groups.
- Seeding after the draw has started.
- Forgetting a gap between matches.
- Not telling teams how many matches they are guaranteed.` },
    ],
    faq: [
      { q: "How many matches are in a 16 team knockout?", a: "Fifteen: eight in the round of 16, four quarter-finals, two semi-finals and one final. The champion plays four matches, but half the teams play only one. A knockout is quick and simple, so it suits a short day, but groups give each team more matches." },
      { q: "How many matches are in four groups of four plus a knockout?", a: "Each group of four plays a round robin of six matches, so 24 group matches, then the top two from each group enter a quarter-final knockout of seven matches. The total is 31 matches, and every team plays at least three, which makes the event feel better for visiting teams." },
      { q: "Can a 16 team football tournament finish in one day?", a: "A straight knockout can, with short matches and one or two pitches. A groups plus knockout format of 31 matches needs several pitches and short halves. Estimate the time per match, add changeovers, and test the total with a schedule tool before you promise a finish time." },
    ],
    related: ["group-stage-and-knockout-planning", "five-a-side-football-tournament-format", "football-points-system-and-tiebreakers", "how-to-draw-a-fair-tournament-draw"],
    cta: { label: "Draw the 16 team bracket", href: "/tools/brackets/" },
  },

  {
    slug: "tournament-results-announcement-template",
    title: "Tournament results announcement template: post, caption and certificate text",
    seoTitle: "Tournament results announcement template",
    description: "A template for announcing tournament results: a short post, a table of placings, thanks to people, a caption for social media and a checklist before you publish.",
    tag: "Organiser guide",
    answer: "Announce results after the protest window closes. Lead with the winner, list the top placings in a short table, thank teams and helpers, add one photo and a link to the full results. Keep it factual and check every name before posting.",
    intro: "The results post is what people remember and share. It is also where mistakes hurt most: a misspelt name, a wrong placing, a missing team. A template and a short checklist make it quick and accurate.",
    sections: [
      { h2: "When to post", md: `Wait until the protest window closes, then post. If you post early and a result changes, you have to correct a public message, which looks worse than a short delay. The [dispute process guide](/guides/tournament-dispute-process-protest-window/) explains the window.

Tell players when to expect the results, for example "within two hours of the final". Then keep the promise.` },
      { h2: "The structure of the post", md: `Use this order:

1. A headline with the event name and the winner.
2. One line on what happened: number of teams, matches, and the final score.
3. A table of the top placings.
4. Thanks to teams, referees, volunteers and sponsors.
5. A link to the full results and the next event.

Keep it short enough to read on a phone in half a minute.` },
      { h2: "A template to copy", md: `**[Event name] results**

Congratulations to **[Winner]** for winning [Event name]. [N] teams played [M] matches over [day/date]. The final finished [score].

| Place | Team |
|---|---|
| 1st | [Team] |
| 2nd | [Team] |
| 3rd | [Team] |

Thank you to every team, our referees, our volunteers and [sponsor]. Full results: [link]. Next event: [date].

Replace the brackets, and remove any line that does not apply.` },
      { h2: "A short social caption", md: `For Instagram or a chat group, shorten it:

"[Winner] take the title at [Event name]. Thank you to all [N] teams, our referees and volunteers. Full results at [link]. See you at [next event]."

Add one photo of the winners, with their permission. Tag teams only if they agreed to be tagged.` },
      { h2: "Check every name", md: `Names are the most common error. Before posting:

- Check team names against the registration list.
- Check the order of placings against the final table.
- Check the spelling of the winners' names for the certificate.
- Check that every sponsor and helper you thank is included.

Ask a second person to read it. Two minutes of checking prevents a correction later.` },
      { h2: "Certificates and prizes", md: `Send certificates the same day if you can. The [certificate maker](/tools/certificates/) prints one page per name, and the [certificate wording guide](/guides/certificate-wording/) has text for winners and participants.

For cash prizes, say when and how they will be paid. For example: "Winners will be contacted within three days". Then do it, and note the date. See [prize pool and payout split](/guides/tournament-prize-pool-and-payout-split/) for planning.` },
      { h2: "Handling a close or disputed result", md: `If the final was close or a protest was upheld, say so briefly and neutrally. For example: "The final was decided after a review by the head referee." Do not name the player or team that raised the protest, and do not add opinion.

If there is still an open issue, post the confirmed placings and add a short line that one result is under review, with a date for the decision. Players accept a delay when they are told why, and a calm, factual tone protects both the winners and the losers from an argument in the comments.` },
      { h2: "Common mistakes", md: `- Posting before the protest window closes.
- Misspelling team or player names.
- Forgetting to thank volunteers.
- Not saying when prizes will be paid.
- Tagging people who did not agree.` },
    ],
    faq: [
      { q: "When should I announce tournament results?", a: "After the protest window closes, so you do not have to correct a public post. Tell players when to expect the results, such as within two hours of the final, and keep that promise. If a protest is still open, post a short note that results will follow." },
      { q: "What should a results announcement include?", a: "The event name and winner, a line on how many teams and matches took part, a short table of the top placings, thanks to teams, referees, volunteers and sponsors, a link to full results and the date of the next event. Add one photo, and keep the post readable on a phone." },
      { q: "How do I avoid mistakes in a results post?", a: "Check team names against the registration list, the placings against the final table, the winners' spellings for certificates and that every sponsor and helper is thanked. Ask a second person to read it before posting, since a two minute check is quicker than a public correction." },
    ],
    related: ["tournament-dispute-process-protest-window", "certificate-wording", "tournament-prize-pool-and-payout-split", "how-to-announce-a-tournament"],
    cta: { label: "Print the certificates", href: "/tools/certificates/" },
  },

  {
    slug: "age-groups-and-junior-tournaments",
    title: "Age groups and junior tournaments: categories, consent and fair play",
    seoTitle: "Age groups and junior tournaments",
    description: "How to run age group and junior tournaments: choosing categories, checking ages, parental consent, safeguarding, match length and keeping events fair and fun.",
    tag: "Organiser guide",
    answer: "Set age categories by date of birth on a fixed cut-off date, check ages at registration, get parental consent for under-18s, adapt match length and rules to each group, and put safeguarding first. Fairness for young players depends on clear categories and trusted adults.",
    intro: "Junior tournaments are rewarding and need extra care. Children of different ages play differently, parents want to know who is looking after them, and your event may come under a school or club policy. Good planning covers categories, consent and safety.",
    sections: [
      { h2: "Choose the categories", md: `Group players so that matches are fair and safe. Typical bands are under 10, under 12, under 14 and under 16, but choose bands that suit your sport and numbers.

Use a single cut-off date, such as the first day of the event or the start of the season, and publish it. Each player's age on that date decides the category. Avoid ad hoc exceptions, since they open arguments.` },
      { h2: "Check ages at registration", md: `Ask for date of birth on the registration form and check it at entry. For school events, a class list or a teacher's confirmation is enough. For open events, a school ID or a similar document can serve. The [registration form tool](/tools/registration/) and the [form fields guide](/guides/tournament-registration-form-fields/) help you build it.

Collect only what you need, and store it safely. After the event, delete what you do not need.` },
      { h2: "Consent and safeguarding", md: `For players under 18, get consent from a parent or guardian before the event, and record an emergency contact. Follow your school's or club's safeguarding policy. Name a safeguarding contact and put their number on the rules page.

Do not leave an adult alone with a child without another adult in view. Brief volunteers, using [volunteer roles and briefing](/guides/tournament-volunteer-roles-and-briefing/). The [code of conduct template](/guides/player-code-of-conduct-template/) covers behaviour towards players and by players.` },
      { h2: "Adapt the format", md: `Younger players need shorter matches, more breaks and simpler rules. For example, fewer minutes per half, smaller teams, and a format that guarantees several matches, such as groups of four or a round robin.

| Age group | Suggested adaptation |
|---|---|
| Under 10 | Short matches, small teams, no elimination on the first day |
| Under 12 to 14 | Groups then a short knockout |
| Under 16 | Close to the senior format with shorter time limits |

Guaranteeing matches matters more than finding a champion for the youngest players.` },
      { h2: "Scoring and results for juniors", md: `For very young players, some events do not publish a ranking at all and give every participant a certificate. For older groups, a normal table is fine. Choose your policy and state it.

Never display results in a way that embarrasses a child, and be careful with photos: get permission before posting. The [school sports day guide](/guides/school-sports-day-tournament-planning/) shows a points and recognition approach.` },
      { h2: "Online games and age ratings", md: `If you run an online game event, check the game's age rating and the platform's terms. Some games and platforms have minimum ages. Ask parents to confirm the child's account and permission. Do not collect passwords.` },
      { h2: "Parents and spectators", md: `Tell parents where to stand or sit, how to behave and who to contact. A short note in the invite works: "Cheer for everyone. Leave decisions to the referees." Sideline behaviour is a common problem at junior events, and a clear line helps referees.` },
      { h2: "Common mistakes", md: `- Using different age cut-off dates for different teams.
- Skipping consent forms and emergency contacts.
- Running senior length matches for young children.
- Posting photos without permission.
- No named safeguarding contact.` },
    ],
    faq: [
      { q: "How do I set age groups for a junior tournament?", a: "Pick bands that suit your sport and numbers, such as under 10, 12, 14 and 16, and fix one cut-off date, such as the first day of the event. A player's age on that date decides the category. Publish the rule and avoid exceptions, which lead to arguments and perceived unfairness." },
      { q: "Do I need parental consent for junior events?", a: "For players under 18 it is good practice and often required by a school or club. Get consent from a parent or guardian, record an emergency contact and follow your organisation's safeguarding policy. Name a contact person on the rules page. Check any local requirements that apply to you." },
      { q: "How should match formats change for younger players?", a: "Use shorter matches, smaller teams, more breaks and simpler rules, and prefer formats that guarantee several matches, such as groups of four or a round robin. For the youngest players, giving every child a fair number of games and a certificate matters more than finding one champion." },
    ],
    related: ["school-sports-day-tournament-planning", "player-code-of-conduct-template", "tournament-registration-form-fields", "tournament-volunteer-roles-and-briefing"],
    cta: { label: "Build the registration form", href: "/tools/registration/" },
  },

  {
    slug: "free-fire-scrims-how-to-run",
    title: "Free Fire scrims: how to run practice matches for teams",
    seoTitle: "Free Fire scrims: how to run them",
    description: "How to run Free Fire scrims: what a scrim is, how many matches, room setup, a simple points table, invite rules, fair play and how to keep them going every week.",
    tag: "Game guide",
    answer: "A scrim is a set of practice matches between teams. Fix a day and time, invite a set number of squads, create custom rooms with the same settings each time, track points in one sheet and keep rules light. Consistency matters more than prizes.",
    intro: "Scrims are the training ground of competitive play: teams practise against real opponents without the pressure of a prize event. They are also an easy way for a community to stay active between tournaments. Running them well means being predictable and keeping the admin small.",
    sections: [
      { h2: "What a scrim is", md: `A scrim is a block of practice matches, usually a few in a row, with a points table across the block. Teams use it to test strategy and roles. There is rarely a prize, and the results often stay within the group.

Because the stakes are lower, you can run them often and with less paperwork than a tournament. The same ideas as [BGMI scrims](/guides/bgmi-scrims-how-to-organise/) apply here, adapted for Free Fire.` },
      { h2: "Set the schedule and slots", md: `Choose a regular day and time, and a number of matches per session, such as three to six. Cap the number of squads to the size of a room, and keep a waiting list. Slots filled by a first come, first served form work well. The [registration form tool](/tools/registration/) makes one in minutes.

Open slots on the same day each week, and close them an hour before. Fixed rhythms build habits. See [weekly community cup](/guides/weekly-community-cup-how-to-run/).` },
      { h2: "Room setup", md: `Create custom rooms with the same settings every time, and write them down. Check the current options in the game, since settings and modes can change with updates. Share the room details with captains shortly before the start, not hours earlier.

Add a check-in, so empty slots can be given to the waiting list. A team that does not check in loses the slot for that session.` },
      { h2: "Scoring", md: `Use a simple points table: points for placement and for eliminations. The exact numbers are your choice, and the [points table guide](/guides/points-table/) and [points table tool](/tools/points-table/) help you set them up. Publish the scale before the first match and keep it the same across sessions, so teams can compare results.

Share the table after each match as a screenshot.` },
      { h2: "Rules to keep light", md: `Use a short rules list:

- Squads only, with the registered roster.
- No teaming with other squads.
- No emulators or modified clients, if your event is mobile only.
- Respect in chat.
- The organiser's decision is final during the session.

For banned behaviour, see [preventing cheating](/guides/preventing-cheating-in-online-tournaments/) and the [mobile device rules](/guides/mobile-esports-tournament-device-and-network-rules/). Remove repeat offenders from the list.` },
      { h2: "From scrim to tournament", md: `Scrims feed tournaments. Keep a table across weeks, and use the top teams as seeds or invitees for a bigger event. The [Free Fire tournament organiser guide](/guides/free-fire-tournament-organiser/) and the [college checklist](/guides/free-fire-college-tournament-checklist/) show how to scale up.` },
      { h2: "Keeping scrims healthy over time", md: `A scrim list tends to drift: the same strong teams dominate, new squads drop out, and the room fills with the same names. Rotate the slots so newer teams get a turn, and consider two tiers, a main room and a development room, so newer squads face opponents at their level.

Review the list monthly:

1. Remove teams that no-show repeatedly.
2. Invite new teams from the waiting list.
3. Ask for feedback and adjust the schedule.

A short note after each session, with the table and one highlight, keeps the group engaged between events.` },
      { h2: "Common mistakes", md: `- Changing the schedule each week.
- Sharing room details too early.
- No check-in, so empty slots stay empty.
- Changing the points scale between sessions.
- Letting a scrim turn into a late night with no end time.` },
    ],
    faq: [
      { q: "What is a Free Fire scrim?", a: "A scrim is a block of practice matches between squads, usually several in a row with a points table across the block. Teams use it to test strategies and roles without the pressure of a prize event. It is also a simple way for a community to stay active between tournaments." },
      { q: "How many squads should a scrim have?", a: "Fit the number of squads to one room, which is set by the game's room size, and keep a waiting list. Use a registration form with a cap, open it on the same day each week, add a check-in an hour before start and give empty slots to the waiting list." },
      { q: "How do I score a Free Fire scrim?", a: "Use points for placement and for eliminations, choose the scale yourself, publish it before the first match and keep it the same each session so results can be compared. Share a screenshot of the table after every match and a final table at the end." },
    ],
    related: ["bgmi-scrims-how-to-organise", "free-fire-tournament-organiser", "weekly-community-cup-how-to-run", "points-table"],
    cta: { label: "Build the scrim points table", href: "/tools/points-table/" },
  },

  {
    slug: "tournament-seating-and-room-layout",
    title: "Tournament seating and room layout: stations, referees and spectators",
    seoTitle: "Tournament seating and room layout",
    description: "How to lay out a room for a tournament: station spacing, referee positions, spectator areas, walkways, signs and a simple plan you can sketch before the day.",
    tag: "Organiser guide",
    answer: "Sketch the room before the day: stations with room to move, referees where they can see every match, a spectator area that does not block players, clear walkways and exits, and signs at every station. A plan on paper saves an hour of moving tables.",
    intro: "A good room layout is invisible: players sit down and play, referees see what they need, spectators find a spot, and nobody trips over a cable. A bad layout creates noise, arguments and safety problems. Fortunately, a sketch and a few measurements are enough.",
    sections: [
      { h2: "Measure and sketch", md: `Measure the room and draw it on paper or a simple drawing tool. Mark the doors, windows, sockets and any fixed furniture. Then place stations, referees' positions and the spectator area.

Do this a week ahead, and visit the room with the sketch. Things that look easy on paper, such as a socket on the wrong wall, are easier to fix a week early. The [LAN checklist](/guides/lan-event-setup-checklist/) covers power and network.` },
      { h2: "Station spacing", md: `Give each player space: room for elbows, a chair that can move, and a table wide enough for the setup. Cramped stations cause arguments and block exits.

For team games, seat each team together but separate teams from each other, so that players cannot see opponents' screens. A simple rule: one empty seat or a divider between teams, or a distance that stops screen peeking. Whatever you choose, check it from a player's point of view.` },
      { h2: "Referees and the results desk", md: `Place referees where they can see more than one match, and where players can find them. A raised or central position helps. Put the results desk near the entrance, so teams check in and report without crossing the room.

Use the [referee roles guide](/guides/tournament-referee-roles-and-duties/) to decide how many referees you need, and place a person for each match area.` },
      { h2: "Spectators and the stage", md: `Put spectators where they can watch without blocking players or seeing hidden screens. If you have a [display screen](/tools/display-screen/) for the bracket or a stream, place it where both players and spectators can see it, but not where it reveals strategy.

For a final, set up a stage area with the matches on a larger screen and chairs for the audience. Keep cables away from walking areas.` },
      { h2: "Walkways, exits and safety", md: `Keep a clear path to every exit. Do not block doors with tables or cables. Tape or cover any cable that crosses a walkway. Count the people in the room against the venue's limit, and ask the venue about fire exits and first aid.

The [campus tournament guide](/guides/run-a-campus-tournament/) includes a gate and safety checklist. Brief your volunteers on where the exits are.` },
      { h2: "Signs and labels", md: `Label each station with a number or a team name, and put signs for check-in, results, first aid, food and toilets. Use the [print kits tool](/tools/print-kits/) to make station cards, and keep signs large and plain.

Put the schedule and bracket on a wall near the entrance. People will look for them before they ask you.` },
      { h2: "A simple layout for a 16 team event", md: `For sixteen teams playing eight matches at once in a hall, place eight match areas in two rows with a central walkway. Seat each pair of teams at facing tables or at neighbouring stations with a divider, and put a referee between every two areas. Put the results desk and the display screen at the entrance end, and the spectator seating at the far end behind a rope or tape line.

Then check it in order:

1. Sketch it on paper.
2. Count the sockets for each match area.
3. Walk the route from the entrance to the exit with a volunteer.
4. If the route is awkward, redo the layout.` },
      { h2: "Common mistakes", md: `- Not measuring the room.
- Seating opposing teams where they can see each other's screens.
- Cables across walkways.
- No sign for the results desk.
- Blocking an exit with equipment.` },
    ],
    faq: [
      { q: "How do I plan the layout for a tournament room?", a: "Measure the room, mark doors, sockets and fixed furniture, and sketch stations, referee positions, a results desk and a spectator area. Leave clear walkways and exits, label every station and visit the room with the sketch a week ahead to catch problems like sockets on the wrong wall." },
      { q: "How far apart should stations be?", a: "Far enough that players have room for their elbows and a chair that moves, and that opposing teams cannot see each other's screens. Seat teammates together and put a gap or divider between teams. Check the layout from a player's seat rather than from above." },
      { q: "Where should referees sit at a tournament?", a: "Where they can see more than one match and where players can find them, ideally a central or raised spot. Put the results desk near the entrance so teams can check in and report scores without crossing the room. Assign one referee to each match area." },
    ],
    related: ["lan-event-setup-checklist", "tournament-referee-roles-and-duties", "run-a-campus-tournament", "tournament-volunteer-roles-and-briefing"],
    cta: { label: "Print station and sign cards", href: "/tools/print-kits/" },
  },

  {
    slug: "third-place-match-and-consolation-brackets",
    title: "Third place match and consolation brackets: when to add them",
    seoTitle: "Third place match and consolation brackets",
    description: "When to add a third place match or a consolation bracket: how each works, extra matches needed, a simple example and how to decide for your event and time.",
    tag: "Format guide",
    answer: "A third place match pits the two semi-final losers against each other, adding one match. A consolation bracket gives early losers more games, adding many. Add them when you want a clear third place or more games per team, and the schedule has room.",
    intro: "A straight knockout is brutal: lose once and you are done. Two additions soften it: the third place match, which settles the bronze, and the consolation bracket, which keeps losing teams playing. Both cost extra matches, so the choice depends on your time.",
    sections: [
      { h2: "The third place match", md: `In a single elimination bracket, two teams lose the semi-finals. They would normally share third place. A third place match settles it: the two semi-final losers play each other, usually before the final.

It adds exactly one match to the whole bracket. For a 16 team bracket, the total goes from 15 to 16 matches. Use it when a podium matters, such as for prizes or certificates.` },
      { h2: "When to skip it", md: `Skip the third place match when the day is tight, or when losing semi-finalists would be tired and unmotivated. Some events share third place and give both teams the same award. If you do, say it in the rules: "Losing semi-finalists share third place."

A shared third place is a legitimate policy. An unclear one causes arguments after the final.` },
      { h2: "What a consolation bracket is", md: `A consolation bracket gives teams that lose early a second bracket to play in. A common version: teams that lose their first match enter a second bracket for the remaining places.

| Version | Result |
|---|---|
| Full consolation | Every team plays at least two matches |
| Placement matches | Teams play to decide each final position |
| Back-door (double elimination) | A loss moves you to the losers' bracket |

See [double elimination explained](/guides/double-elimination-bracket-explained/) for the full version, where nobody leaves after one loss.` },
      { h2: "Match counts", md: `Extra matches matter when you plan the day.

| Format, 16 teams | Matches |
|---|---|
| Single elimination | 15 |
| Plus a third place match | 16 |
| Single elimination with a consolation bracket for first-round losers | 15, plus 7 more for the eight first-round losers |
| Double elimination | 30 or 31 |

Use the [schedule maker](/tools/schedule/) to check whether your day can hold them. The [how many teams guide](/guides/how-many-teams-for-your-format/) shows more counts.` },
      { h2: "A middle path: groups first", md: `If you want every team to play several matches without a consolation bracket, start with groups. Every team plays at least three matches, and the knockout is shorter. See [group stage and knockout planning](/guides/group-stage-and-knockout-planning/) for the cross-over rule.

Then add a third place match only if you need it.` },
      { h2: "Announcing it", md: `State in the rules and on the bracket which of these you use: "Third place match: yes" or "Losing semi-finalists share third place". Put the third place match in the schedule, and say when it will be played and by whom.

Print the bracket with the [bracket maker](/tools/brackets/), and include the third place match as a separate box so teams see it.` },
      { h2: "A worked example with eight teams", md: `In an eight team single elimination bracket there are seven matches: four quarter-finals, two semi-finals and a final. Add a third place match and the total is eight. The two semi-final losers play it before the final, so the audience stays for the best match last.

Now add a consolation bracket for the four quarter-final losers: they play two semi-finals and a final for fifth place, which adds three more matches, so eleven in total. That is a reasonable cost for a two day event, and probably too much for a single evening.` },
      { h2: "Common mistakes", md: `- Not saying whether third place is shared or played.
- Forgetting the match in the schedule.
- Adding a consolation bracket without counting the matches.
- Scheduling the third place match after the final.
- Giving different prizes without telling teams.` },
    ],
    faq: [
      { q: "Do I need a third place match?", a: "Only if a clear third place matters for prizes or certificates and your schedule has room for one more match. Otherwise, let the two losing semi-finalists share third place, and say so in the rules. Either policy is fine, as long as it is stated before the tournament starts." },
      { q: "What is a consolation bracket?", a: "It is a second bracket for teams that lose early, so they keep playing for the remaining places. It can be full, where each team plays at least two matches, or limited to placement matches. It adds many matches, so count them before you commit to it for a one day event." },
      { q: "How many matches does a third place match add?", a: "Exactly one. The two losing semi-finalists play each other, usually before the final, so a 16 team single elimination bracket goes from 15 matches to 16. It is the cheapest way to settle a podium, compared with a consolation bracket, which adds many more." },
    ],
    related: ["double-elimination-bracket-explained", "group-stage-and-knockout-planning", "how-many-teams-for-your-format", "tournament-bracket-byes-explained"],
    cta: { label: "Draw the bracket with a third place box", href: "/tools/brackets/" },
  },

  {
    slug: "valorant-roster-and-substitute-rules",
    title: "Valorant roster and substitute rules: what to write before the event",
    seoTitle: "Valorant roster and substitute rules",
    description: "How to write roster and substitute rules for a Valorant tournament: team size, locking rosters, substitutes, mid series changes, account checks and penalties.",
    tag: "Game guide",
    answer: "Write the team size, a roster lock date, how many substitutes are allowed, when they can play, how accounts are verified and what the penalty is for an illegal player. Publish it at registration, since roster arguments usually start in the middle of an event.",
    intro: "Valorant is played five against five, and a missing player on match day is the most common problem in team events. Roster and substitute rules answer it before it happens. They need to be short, fair and enforced the same way for every team.",
    sections: [
      { h2: "Team size and registration", md: `State how many players make a team on the court: five, as Valorant competitive is 5v5. Then state how many substitutes a team may register, such as one or two.

Ask for every player's in-game name and a contact at registration, using the [registration form tool](/tools/registration/). Publish the list of registered rosters, so teams can check each other.` },
      { h2: "Roster lock", md: `Choose a date after which the roster cannot change except through the substitute rule. A lock at the end of registration or a day before the first match is common.

Say what happens to a team that wants to change a player after the lock: for example, it must ask the organiser, give a reason, and the change must be approved. This prevents last minute swaps for stronger players, a known source of unfairness.` },
      { h2: "Substitutes", md: `Define when a substitute may play:

- At the start of a match, if a registered player cannot attend.
- Between maps in a series, if the team informs the referee before the next map begins.
- Not mid-map, except in an emergency approved by the referee.

| Situation | Typical rule |
|---|---|
| Registered player absent at start | Substitute may play |
| Change between maps | Allowed with notice to the referee |
| Change mid-map | Only in an emergency, with approval |
| Substituted player returns | Not in the same series |

Say whether a substituted player may return in the same series. A simple rule is that a player who has been substituted out cannot return in that series. Read it aloud at the captains' meeting.` },
      { h2: "A team that cannot field five", md: `Decide what happens if a team has fewer than five players at the start time. Typical options: a short grace period, then forfeit, or play the series with the missing player only if both captains agree. Pick one and publish it. The [no-shows and walkovers guide](/guides/handling-no-shows-and-walkovers/) provides a base.

Use the same limits for every team.` },
      { h2: "Account checks", md: `Check names against the registered list in the lobby. Ask players to use their own accounts, and ban account sharing. For events with prizes, you may ask for a screenshot of the account profile at registration.

The [preventing cheating guide](/guides/preventing-cheating-in-online-tournaments/) covers broader checks, and the [lobby setup guide](/guides/valorant-custom-tournament-lobby-setup/) shows where in the routine to verify rosters.` },
      { h2: "Penalties", md: `State the penalty for fielding an unregistered or illegal player: for example, forfeiting the map or match, and a warning or disqualification for repeated breaches. Decide who rules, which is usually the head referee, and how appeals work. See [the dispute process](/guides/tournament-dispute-process-protest-window/).

Penalties should be proportionate. A genuine mistake, quickly reported, is different from deliberate deception.` },
      { h2: "Put it in the rules page", md: `Add a short section to your rules with these points: team size, substitutes, lock date, mid-series changes, accounts and penalties. Start from the [rules template](/guides/esports-tournament-rules-template/) and the [Valorant organiser guide](/guides/valorant-tournament-organiser/).

Keep it to a screen of text. Rules nobody reads do not protect anyone.` },
      { h2: "Common mistakes", md: `- No roster lock.
- Unclear rules on mid-series substitutes.
- Not checking names in the lobby.
- Letting a team play short without a rule.
- Applying penalties differently to different teams.` },
    ],
    faq: [
      { q: "How many substitutes should a Valorant team have?", a: "That is your decision. One or two registered substitutes is common, since it covers an absence without creating a large pool of players to verify. Ask for every player's in-game name at registration, publish the rosters and say when substitutes may play and whether a substituted player can return." },
      { q: "When can a Valorant roster change?", a: "Choose a lock date, such as the end of registration or a day before the first match. After the lock, allow changes only through the substitute rule or with organiser approval and a reason. This prevents last minute swaps for stronger players and keeps the rules fair for every team." },
      { q: "What if a team cannot field five players?", a: "Set a short grace period and then a rule: forfeit the map or match, or play on only if both captains agree. Whichever you choose, publish it before the event and apply the same limit to every team so no team feels singled out when it happens." },
    ],
    related: ["valorant-tournament-organiser", "valorant-custom-tournament-lobby-setup", "handling-no-shows-and-walkovers", "esports-tournament-rules-template"],
    cta: { label: "Collect rosters at registration", href: "/tools/registration/" },
  },

  {
    slug: "online-tournament-checklist-for-first-timers",
    title: "Online tournament checklist for first timers: six steps from idea to results",
    seoTitle: "Online tournament checklist for first timers",
    description: "A checklist for your first online tournament: choose the game and format, set rules, collect signups, run check-in, play, record results and handle disputes.",
    tag: "Organiser guide",
    answer: "Six steps: choose the game and format, write short rules, open signups with a deadline, run a check-in, play with one source of truth for results, allow a short protest window, then announce winners. Keep the first event small and simple.",
    intro: "Your first online tournament does not need to be big. It needs to finish, on time, with a result players accept. This checklist gives you the steps in order, with links to deeper guides when you want more.",
    sections: [
      { h2: "Step 1: choose the game and format", md: `Pick a game you know and a format that fits your numbers. For under 16 players, single elimination works. For more, add groups. See [how many teams for your format](/guides/how-many-teams-for-your-format/) and the [bracket maker](/tools/brackets/).

Decide the date, the start time, and a backup date. Say how long the event will last.` },
      { h2: "Step 2: write short rules", md: `Write one page: eligibility, how to report results, late arrival, conduct and penalties. Use the [rules template](/guides/esports-tournament-rules-template/) and the [code of conduct template](/guides/player-code-of-conduct-template/). If your game is on mobile, add the [device and network rules](/guides/mobile-esports-tournament-device-and-network-rules/).` },
      { h2: "Step 3: open signups", md: `Make a form with a deadline and a cap, using the [registration form tool](/tools/registration/). Ask for names, in-game IDs and a contact. Publish the list of confirmed entries after the deadline.

Announce the event in the places your players already are. The [announcement guide](/guides/how-to-announce-a-tournament/) has a template. Create an announcement place, a captains' group and match threads, as in [tournament communication](/guides/tournament-communication-whatsapp-and-discord/), and pin the rules and the schedule.` },
      { h2: "Step 4: check-in and play", md: `1. Open check-in 15 to 30 minutes before the start.
2. Drop teams that do not check in, and build the bracket from those who did.
3. Send lobby details to the two teams of each match.
4. Ask for a screenshot of the final score from the winner, and confirm with the loser.
5. Update the bracket after every match.

Keep a rule for disconnects and delays ready, using [no-shows and walkovers](/guides/handling-no-shows-and-walkovers/).` },
      { h2: "Step 5: record and resolve", md: `Keep one results sheet or bracket as the source of truth, and update it in one place. If a team disagrees with a result, use the protest window and process in the [dispute guide](/guides/tournament-dispute-process-protest-window/).

Plan for failures with the [backup plan guide](/guides/backup-plan-when-internet-or-power-fails/).` },
      { h2: "Step 6: announce and learn", md: `After the window closes, announce results using the [results template](/guides/tournament-results-announcement-template/), and send certificates from the [certificate maker](/tools/certificates/).

Then ask players two questions: what worked, and what to change. Write the answers down and use them for the next event.` },
      { h2: "A one page timeline to copy", md: `Here is a timeline you can paste into your notes and adjust.

| When | What to do |
|---|---|
| Three weeks before | Choose game, format and date; write rules |
| Two weeks before | Open signups and announce |
| One week before | Close signups; publish confirmed teams |
| Day before | Send schedule, rules link and lobby plan |
| Start time minus 30 minutes | Open check-in |
| During | Update the bracket after each match |
| After the final | Close the protest window, then announce |

Add your own dates next to each line, and share the table with your helpers so everybody works from the same plan.` },
      { h2: "Common mistakes", md: `- Starting too big for a first event.
- Skipping the check-in.
- Results in several places.
- No backup date.
- Forgetting to ask for feedback.` },
    ],
    faq: [
      { q: "How do I run my first online tournament?", a: "Pick a game and a simple format, write a one page rules sheet, open a signup form with a deadline and a cap, set up announcement and captain channels, run a check-in before the start, keep one results sheet, allow a short protest window and announce the winners. Keep the first event small." },
      { q: "How many teams should a first online event have?", a: "Keep it small enough to finish on time, such as 8 to 16 teams for a single elimination bracket. A small field means fewer matches, fewer referees and fewer problems, and gives you a clear picture of what to change before running a bigger event." },
      { q: "What should I do after the first tournament?", a: "Announce the results, send certificates, then ask players what worked and what to change, and write the answers down. Save the bracket, results and any posts in one folder. Use that record to plan the next event and to show sponsors what happened." },
    ],
    related: ["how-to-announce-a-tournament", "esports-tournament-rules-template", "tournament-communication-whatsapp-and-discord", "backup-plan-when-internet-or-power-fails"],
    cta: { label: "Make your first bracket", href: "/tools/brackets/" },
  },
];
