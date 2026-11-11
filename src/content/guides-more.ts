import type { Block, Guide } from "./guides";
import { EXAMPLE_SCALE, standings, type TeamEntry } from "@/lib/points";
import { fixtures, matchCount } from "@/lib/roundrobin";
import { buildSchedule, summary, type ScheduleInput } from "@/lib/schedule";
import { seedOrder } from "@/lib/seeding";

/**
 * The second batch of guides (Nov 2026). Examples are computed with the same code the tools run, so the numbers cannot drift from the tools.
 * Rule for this file: nothing about a publisher's current rules, prize money, laws or dates unless it is certain. When unsure, the guide tells the reader to check the source.
 */
const PUBLISHED = "2026-11-11";

// Free Fire / BGMI style points example (3 squads, 2 matches), from the points calculator's own code.
const MINI: TeamEntry[] = [
  { name: "Squad A", matches: [{ placement: 1, kills: 4 }, { placement: 3, kills: 6 }] },
  { name: "Squad B", matches: [{ placement: 2, kills: 7 }, { placement: 1, kills: 3 }] },
  { name: "Squad C", matches: [{ placement: 3, kills: 2 }, { placement: 2, kills: 5 }] },
];
const MINI_RESULT = standings(MINI, EXAMPLE_SCALE);
const miniTable: Block = {
  t: "table",
  head: ["Rank", "Squad", "Match 1", "Match 2", "Total"],
  rows: MINI_RESULT.map((s) => [String(s.rank), s.name, ...s.perMatch.map(String), String(s.total)]),
};

const run = (i: ScheduleInput) => { const s = buildSchedule(i)!; return { rows: s, ...summary(i, s) }; };
// Six squad matches in one lobby, 30 minutes each, 10 minute gap.
const FF_PLAN = run({ start: "10:00", matches: 6, duration: 30, gap: 10, lobbies: 1, breakEvery: 0, breakLength: 0 });
// Fifteen matches (a 16-team single elimination bracket), two servers, 60 minutes each including setup, 10 minute gap.
const VAL_PLAN = run({ start: "09:30", matches: 15, duration: 60, gap: 10, lobbies: 2, breakEvery: 0, breakLength: 0 });

const seeds8 = seedOrder(8);
const seeds16 = seedOrder(16);
const pairs = (order: number[]) => order.reduce<string[]>((a, s, i) => (i % 2 === 0 ? [...a, `${s} v ${order[i + 1]}`] : a), []);
const SIX_TEAMS = ["Team A", "Team B", "Team C", "Team D", "Team E", "Team F"];
const SIX = fixtures(SIX_TEAMS);
const sixTable: Block = {
  t: "table",
  head: ["Round", "Match 1", "Match 2", "Match 3"],
  rows: SIX.map((r, i) => [`Round ${i + 1}`, ...r.map((f) => `${f.a} v ${f.b}`)]),
};
const SIX_PLAN = run({ start: "10:00", matches: matchCount(6), duration: 30, gap: 10, lobbies: 3, breakEvery: 0, breakLength: 0 });

export const MORE_GUIDES: Guide[] = [
  {
    slug: "free-fire-tournament-organiser",
    title: "How to organise a Free Fire tournament for your college or community",
    seoTitle: "How to organise a Free Fire tournament: custom rooms",
    description: "Organise a Free Fire tournament step by step: squads, custom rooms, a points table, registration and results. Written for organisers, not players.",
    tag: "Organiser guide", minutes: 8, published: PUBLISHED, updated: PUBLISHED,
    answer: "To organise a Free Fire tournament, fix the squad size and the number of matches, write the rules and the points scale, open a short registration form, run each match in a custom room, and publish a points table after every match. Most of the work is in the rules and the schedule, not in the game.",
    intro: "People who search for a Free Fire tournament are usually players looking for one to join. This guide is for the other side: the person who has to run it. If your college, club or community wants its own Free Fire event, this is the order to do things in, and the free tools that save you the spreadsheet work.",
    sections: [
      { h2: "Start with the format, not the prize", blocks: [
        { t: "p", x: "Free Fire is a battle royale, so a match produces a placement for every squad rather than a single winner. That means the usual head-to-head bracket does not fit. The normal format is a set of matches played in the same lobby, with points for placement and kills added up across all of them. The squad with the most points at the end wins." },
        { t: "p", x: "Decide three numbers first: squads per lobby, matches per day, and how many matches count. Six matches is a common length for a one-day event, because it is long enough that one lucky match does not decide the result and short enough to finish in an afternoon. If you have more squads than a lobby can hold, split them into groups and send the best squads from each group to a final lobby. The [tournament formats guide](/guides/choosing-a-tournament-format/) shows how to count the matches." },
      ] },
      { h2: "Set up custom rooms", blocks: [
        { t: "p", x: "Matches for an organised event are played in custom rooms: private lobbies that the organiser creates and shares with the squads. The exact menus and the room limits change with game updates, so check the current version of the game before the event rather than relying on a screenshot from last year. Always do a test room with a few friends two days before." },
        { t: "ul", items: [
          "Make one person the room host. They create the room and share the room ID and password only with the squads in that match.",
          "Send the ID and password a few minutes before the match, not the day before, so nobody can join early or leak it.",
          "Appoint a separate person to watch for rule breaks and to collect the results screenshot after each match. The host should not do this at the same time.",
          "Agree a start time and a late rule in the rules page: for example, a squad that is not in the room at the start loses that match.",
        ] },
      ] },
      { h2: "Write the points scale and the tie-breakers", blocks: [
        { t: "p", x: "Your points scale is part of your rules. Publishers and official tournaments publish their own scales and change them between seasons, so do not copy one without checking it, and do not claim yours is official. Choose a scale, write it down and publish it with the registration link. The scale below is the example used in the [points table calculator](/tools/points-table/); you can type your own." },
        { t: "table", head: ["Placement", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"], rows: [["Points", ...EXAMPLE_SCALE.placement.map(String)], ["Per kill", `${EXAMPLE_SCALE.perKill} point`, "", "", "", "", "", "", ""]] },
        { t: "p", x: `Here is the same scale applied to three squads over two matches, worked out by the calculator code. ${MINI_RESULT[0]!.name} finishes first with ${MINI_RESULT[0]!.total} points.` },
        miniTable,
        { t: "p", x: "Decide the tie-breakers now. A fair default is most first places, then most kills, then the better placement in the last match. The [points table guide](/guides/points-table/) explains why each one is used." },
      ] },
      { h2: "Plan the day with real times", blocks: [
        { t: "p", x: `Six matches in one lobby at 30 minutes each, with a 10 minute gap for joining and results, starting at ${FF_PLAN.rows[0]!.start}, ends at ${FF_PLAN.finish}: about ${FF_PLAN.totalMinutes} minutes in total. That is the schedule maker's own arithmetic. If matches overrun, as they will, you have no slack, so add a longer break in the middle and announce a finish time an hour later than the sum.` },
        { t: "p", x: "Put the times in the [match schedule maker](/tools/schedule/), download the run-sheet and send it to every captain with the rules." },
      ] },
      { h2: "Registration and squads", blocks: [
        { t: "p", x: "Use one form per squad, not per player. Ask for the squad name, the captain's phone number, four player names with their in-game names and IDs, and one substitute. Close registration a day before the event so you can check the list. A [free copyable registration form](/tools/registration/) and the [form fields guide](/guides/tournament-registration-form-fields/) cover what to ask and what to leave out." },
        { t: "p", x: "If any player is under 18, get a parent or guardian's consent before the event. Do not collect more personal data than you need." },
      ] },
      { h2: "Prizes and the publisher's conditions", blocks: [
        { t: "note", x: "Game publishers set their own conditions for running tournaments and for charging entry or giving cash prizes, and the law on money prizes and entry fees can matter too. This guide does not tell you what is allowed. Read the publisher's current policy and ask your college or a legal adviser before you advertise a cash prize or an entry fee. A free-entry event with certificates and non-cash prizes avoids most of the questions." },
      ] },
      { h2: "Run, publish and finish", blocks: [
        { t: "ol", items: [
          "Check squads in against the registration list. For an offline event use [passes and the gate scanner](/guides/event-gate-checkin/).",
          "Brief the captains for five minutes: rules, schedule, who decides disputes.",
          "Play each match, collect the result screenshot, and enter placements and kills in the calculator.",
          "Show the standings on a screen between matches with the [display screen](/tools/display-screen/).",
          "After the last match, publish the final table and give out [certificates](/tools/certificates/).",
        ] },
      ] },
      { h2: "A worked tie-break", blocks: [
        { t: "p", x: "Two squads can finish level on points, so decide the order before the event. Suppose Squad X finished 1st with 2 kills and 4th with 3 kills, and Squad Y finished 2nd with 5 kills and 3rd with 3 kills. With the example scale (10, 6, 5, 4, 3, 2, 1, 1 and 1 point per kill) the matches are worth 12 and 7 for X, and 11 and 8 for Y. Both total 19." },
        { t: "p", x: "The [points table calculator](/tools/points-table/) ranks Squad X first, because it has one first place and Squad Y has none, and it marks both rows as decided by a tie-break. Y has more kills (8 against 5), but wins are checked first. If you would rather reward kills, write kills first in your rules and say so before the first match." },
      ] },
      { h2: "Checklist for the week before", blocks: [
        { t: "ol", items: ["Rules and the points scale published with the registration link.","Registration closed a day early and the squad list checked for duplicate players.","A test custom room run with a few friends on the current version of the game.","A room host, a referee and a results person named, as three different people.","A schedule with slack sent to every captain.","A screen or projector ready for the live table, and a plan for certificates."] },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: ["Sharing the room ID and password the day before, so a squad joins early or a stranger joins.","Letting squads send their own screenshots. Have an official take the result screen.","Changing the points scale or the kill value after the first match.","Using one person as host, referee and scorer. Mistakes follow.","Announcing a cash prize before reading the publisher's conditions."] },
      ] },
    ],
    faq: [
      { q: "How do I organise a Free Fire tournament for my college?", a: "Fix the squad size and the number of matches, write the rules and the points scale, open a short registration form with one entry per squad, run each match in a custom room and publish the table after every match. Most of the work is in the rules and the schedule, not the game. The free points table calculator, registration form and match schedule maker on this site cover the paperwork, and none needs an account." },
      { q: "How many matches should a one-day Free Fire event have?", a: "Six matches is a common length. It gives enough games that one lucky match does not decide the winner, and it can finish in an afternoon. As an illustration, six matches in one lobby at 30 minutes each with a 10 minute gap, starting at 10:00, end at 13:50 in the match schedule maker. Matches overrun, so add a longer break and announce a finish time an hour later than the sum." },
      { q: "What points scale should I use for a Free Fire custom room tournament?", a: "Use the one in your own rules. Official tournaments publish their scales and change them between seasons, so copy one only after checking it, and say clearly that yours is a custom scale. The points table calculator lets you type any placement scale and kill value; its starting numbers (10, 6, 5, 4, 3, 2, 1, 1 and one point per kill) are only an example. Publish your scale with the registration link." },
      { q: "How do I break a tie between two squads?", a: "Write the order before the event. A fair default, and the one the calculator applies, is most first places, then most kills, then the better placement in the last match. For example, two squads on 19 points: the one with a win ranks above the one with more kills but no win. If squads are still level, say whether you play a decider or the head official decides." },
      { q: "Can I run a Free Fire tournament with free entry?", a: "Yes, and it is the simplest option. Entry fees and cash prizes raise questions about the game publisher's current conditions and about the law that applies to you, so check both and ask your college before you advertise either. A free-entry event with certificates and non-cash prizes avoids most of those questions, and the certificate maker on this site prints one page per name for everyone who took part." },
      { q: "How do I share the room ID and password safely?", a: "Make one person the room host, create the room shortly before the match and share the ID and password only with the squads in that match, a few minutes before the start, not the day before. Use a separate person to watch for rule breaks and collect the result screenshot, so the host is not doing both. Then enter placements and kills in the points table calculator so the standings are ready to show on a screen." },
    ],
    related: ["points-table", "bgmi-custom-room-tournament", "tournament-registration-form-fields"],
    cta: { label: "Open the points table calculator", href: "/tools/points-table/" },
  },

  {
    slug: "bgmi-custom-room-tournament",
    title: "How to run a BGMI tournament with custom rooms: groups, finals and points",
    seoTitle: "Run a BGMI tournament with custom rooms and finals",
    description: "Plan a BGMI tournament for a college or community: qualifier groups, a final lobby, custom rooms, a points table and a clear schedule. Free tools included.",
    tag: "Organiser guide", minutes: 8, published: PUBLISHED, updated: PUBLISHED,
    answer: "Run a BGMI tournament by splitting your squads into groups, playing a few matches per group in custom rooms, taking the top squads from each group to a final lobby, and ranking everyone with a published points scale. Plan the schedule first: the number of lobbies decides how long the day is.",
    intro: "Official BGMI events are run by the publisher and its partners. This guide is for the many smaller events: a college fest, a club league or a community cup. The problem is always the same: more squads than one lobby can hold, and one day to play. Here is a format and a plan that works, with the arithmetic shown.",
    sections: [
      { h2: "Know how many squads fit in a room", blocks: [
        { t: "p", x: "A custom room holds a limited number of players, and the limit depends on the mode and the current version of the game. Look it up in the game itself before you fix your numbers. Everything below uses a variable, squads per room, so you can plug in your own value." },
        { t: "p", x: "If you have S squads and a room takes R squads, you need at least S ÷ R rooms, rounded up. For example, if a room took 25 squads, 100 squads would need 4 rooms for the first stage. Whatever your R is, the point is the same: the first stage is played in several rooms at once or one after another, and the schedule decides which." },
      ] },
      { h2: "Pick a two-stage format", blocks: [
        { t: "ul", items: [
          "Stage one (groups): split the squads into groups of at most R. Each group plays the same number of matches, for example three.",
          "Stage two (final lobby): the top squads from each group play a final lobby, again with a fixed number of matches.",
          "Final result: either the final lobby points alone, or the final lobby points added to stage one. Choose one and write it in the rules.",
        ] },
        { t: "p", x: "Put the cut-off in numbers: for instance, the top 5 squads of each of 4 groups would make a 20-squad final. Keep final lobby size at or under R. If groups are uneven in strength, seed the squads across groups so that the strongest do not all land together." },
      ] },
      { h2: "Write the points scale before the first match", blocks: [
        { t: "p", x: "Use a placement and kill scale and tell squads in writing. Points tables published for official events are specific to those events and change, so treat them as a reference and set your own. Our [points table guide](/guides/points-table/) shows how to do the sums and the tie-breakers, and the [calculator](/tools/points-table/) does them for you." },
        { t: "p", x: `As an example, with the calculator's example scale a first place with 4 kills is worth ${EXAMPLE_SCALE.placement[0]! + 4 * EXAMPLE_SCALE.perKill} points and a third place with 6 kills is worth ${EXAMPLE_SCALE.placement[2]! + 6 * EXAMPLE_SCALE.perKill} points. Kills matter, so say how you will count them and who decides when a screenshot is unclear.` },
      ] },
      { h2: "Plan the room schedule", blocks: [
        { t: "p", x: "Each match takes longer than its in-game time: squads join, the host checks them, and results are collected. Plan 10 to 15 minutes of gap between matches. With one room host you can run one lobby at a time; with more hosts and a second set of phones, you can run groups in parallel. The [schedule maker](/tools/schedule/) turns your lobbies and breaks into a timed run-sheet with the finish time." },
        { t: "p", x: "Build in a longer break after the group stage so the host can enter results, announce who qualified and brief the final lobby. If the day is short, cut the number of matches, not the gap." },
      ] },
      { h2: "Registration, rooms and fair play", blocks: [
        { t: "ul", items: [
          "Register squads, not players. Collect the squad name, a captain contact, four players with in-game names and IDs, and a substitute.",
          "Share the room ID and password a few minutes before each match, only with the squads in it.",
          "Say in the rules what happens with late squads, disconnects and rule breaks. Use the [rules template](/guides/esports-tournament-rules-template/).",
          "Keep a separate referee for disputes and screenshot checks.",
        ] },
        { t: "p", x: "Create the form with the [registration tool](/tools/registration/) and read the [form fields guide](/guides/tournament-registration-form-fields/) first." },
      ] },
      { h2: "Prizes, branding and the publisher", blocks: [
        { t: "note", x: "Publisher conditions for tournaments, entry fees and prizes change over time, and Indian rules on prizes and fees can be a legal question. This site does not give legal advice. Read the publisher's current policy, get your college's written permission, and ask a legal adviser before advertising cash prizes. Do not use a publisher's logos in a way that suggests the event is official." },
      ] },
      { h2: "On the day", blocks: [
        { t: "ol", items: [
          "Check squads in, or confirm they are in the room, against the registration list.",
          "Run the matches to the written schedule and update the table after every match.",
          "Show the live standings on a screen with the [display screen](/tools/display-screen/).",
          "Announce the qualifiers, play the final, publish the final table and give certificates.",
        ] },
      ] },
      { h2: "A worked example with numbers you can replace", blocks: [
        { t: "p", x: "Suppose the room limit in your version of the game allowed 20 squads, and 60 squads registered. That is 3 groups of 20. Each group plays 3 matches, so the group stage is 9 matches. If the top 6 from each group go through, the final lobby has 18 squads, below the room limit, and plays 4 matches." },
        { t: "table", head: ["Stage","Matches","Lobbies at once","Time from 10:00 (30 min matches, 10 min gaps)"], rows: [["Group stage","9","3","3 slots: ends 11:50"],["Group stage","9","1","9 slots: ends 15:50"],["Final lobby (4 matches)","4","1","4 slots: 150 minutes in total"]] },
        { t: "p", x: "These are the [match schedule maker's](/tools/schedule/) own results for those numbers, and the room limit of 20 is an illustration, not a fact about the game. With one lobby the group stage alone takes all day, so you would need several hosts and phones, or fewer squads. Put your real room limit in first and the day becomes a plan." },
      ] },
      { h2: "Checklist", blocks: [
        { t: "ol", items: ["Room limit looked up in the current version of the game.","Groups, matches per group and the cut-off for the final decided and written in the rules.","Points scale and tie-breakers published.","One host and one referee per lobby that runs at once.","A longer break between the group stage and the final for results and a briefing.","A table per group in the [points table calculator](/tools/points-table/), and a separate one for the final."] },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: ["Letting a group be larger than a room can hold, so squads are turned away on the day.","Seeding badly so that the strongest squads are all in one group and one of them is knocked out early.","No tie-breaker for the last qualifying place, so a cut-off becomes an argument.","Forgetting that matches take longer than their in-game length.","Not deciding whether the final adds the group points."] },
      ] },
    ],
    faq: [
      { q: "How do I run a BGMI tournament with more squads than one room can take?", a: "Split the squads into groups no bigger than a room, give every group the same number of matches and send the best squads from each group to a final lobby. Seed the squads so the strongest are not all in one group. Look up your room limit in the game itself, because it depends on mode and version. The points table calculator ranks each group, and the schedule maker turns lobbies and breaks into a timed run-sheet." },
      { q: "Should the BGMI final add up the group stage points?", a: "Either works, but choose before the event and write it in the rules. Final-lobby points alone keep the final simple and give every qualified squad a fresh start. Adding stage one points rewards consistency but needs a clear explanation for captains. Whichever you pick, run the final as its own table in the points table calculator, or enter both stages and add the totals, so the result is checkable." },
      { q: "Is the calculator's scale the official BGMI points system?", a: "No. The numbers that appear when the points table calculator loads are only an example. Official events publish their own scales and change them, so use your own and say so. Type your placement points and points per kill into the calculator, publish them with the registration link, and do not change them after the first match, because that changes how squads should have played." },
      { q: "How long does a BGMI group stage and final take?", a: "It depends on the number of lobbies. As an illustration only, if you had 3 groups of 3 matches each, run in 3 lobbies at once with 30 minute matches and 10 minute gaps, the group stage takes 110 minutes from the first start; in one lobby it takes 350. Enter your own numbers in the match schedule maker to see your finish time, and put a longer break after the group stage for results and the final briefing." },
      { q: "Can I run BGMI tournaments for money?", a: "That depends on the publisher's current conditions and on the law that applies to you, and this site cannot tell you either. Check the publisher's policy, get your college's written permission and ask a legal adviser before you advertise cash prizes or an entry fee. A free-entry event avoids most of these questions, and you can still give winners and participants certificates from the free certificate maker." },
      { q: "What should the BGMI squad registration collect?", a: "One entry per squad: the squad name, a captain's phone or email, four players with in-game names and IDs, and a substitute. Ask whether any player is under 18 and get a guardian's consent. Leave out ID numbers and addresses. The registration tool on this site gives you a copyable squad form without an account, or with a free account a link where captains register and you approve each squad into your roster." },
    ],
    related: ["free-fire-tournament-organiser", "points-table", "run-a-campus-tournament"],
    cta: { label: "Build the run-sheet for your lobbies", href: "/tools/schedule/" },
  },

  {
    slug: "valorant-tournament-organiser",
    title: "How to organise a Valorant tournament: brackets, best-of series and servers",
    seoTitle: "How to organise a Valorant tournament with a bracket",
    description: "Organise a Valorant tournament for a college or community: team size, a bracket, best-of-1 or best-of-3, a map plan and a realistic schedule with times.",
    tag: "Organiser guide", minutes: 8, published: PUBLISHED, updated: PUBLISHED,
    answer: "To organise a Valorant tournament, collect 5-player teams, seed them into a single or double elimination bracket, decide whether matches are best-of-1 or best-of-3, agree how maps are picked, and work out the finish time before you announce it. Fifteen matches on two servers at 60 minutes each need most of a day.",
    intro: "Valorant is a 5 v 5 game, so a Valorant event looks like a classic bracket tournament: teams meet head to head and the winner moves on. That makes planning easier than for a battle royale, but the time maths catches many organisers out. This guide covers the decisions and shows the sums.",
    sections: [
      { h2: "Teams, substitutes and eligibility", blocks: [
        { t: "p", x: "A team has five players and usually one or two substitutes. Decide who may play: your college only, open to other colleges, or fully open. Say whether a player can appear for more than one team, and whether a substitute can be added after registration closes. Collect each player's in-game name and tag, because that is how the other team and the referee find them." },
        { t: "p", x: "Use a registration form per team and close it a day before the event. The [form fields guide](/guides/tournament-registration-form-fields/) lists what to ask." },
      ] },
      { h2: "Single elimination or double elimination", blocks: [
        { t: "p", x: `A single elimination bracket for n teams needs n − 1 matches, so 16 teams need 15. It is fast, but one bad game ends a team's day. Double elimination gives every team a second life and needs at most 2n − 2 matches (30 for 16 teams) plus a possible reset final, so it takes about twice the time. If your day is short, choose single elimination and make the opening round best-of-1. If you have a weekend, double elimination is fairer.` },
        { t: "p", x: "Build either one free: the [bracket maker](/tools/brackets/) for single elimination and the [double elimination generator](/tools/double-elimination/) for the second chance. Seed teams by a fair rule such as a qualifier result or a random draw, not by who registered first." },
      ] },
      { h2: "Best-of-1 or best-of-3", blocks: [
        { t: "p", x: "A best-of-1 is one map. A best-of-3 is first to two maps, so it takes two or three maps. Best-of-3 is fairer because one lucky map does not decide it, but it costs time: up to three maps for every match in the bracket. Many organisers use best-of-1 in early rounds and best-of-3 in the semi-finals and the final. Whatever you choose, write it in the rules." },
        { t: "p", x: "Also say how maps are chosen. A common approach is for teams to take turns to ban and pick maps from an agreed map pool. The game's current map pool and the available competitive settings change with updates, so check the version you will play on and run a test match before the event." },
      ] },
      { h2: "Work out the time", blocks: [
        { t: "p", x: `Fifteen matches on two servers at a planned 60 minutes each (including joining and map picks), a 10 minute gap, start ${VAL_PLAN.rows[0]!.start}: the schedule maker puts the last match ending at ${VAL_PLAN.finish}, ${VAL_PLAN.totalMinutes} minutes after the start, over ${VAL_PLAN.slots} rounds of play. Bracket rounds depend on each other, so a real day runs slower than the table: a match cannot start until both of its feeder matches finish. Add slack, and publish a finish time later than the sum.` },
        { t: "p", x: "Try your own numbers in the [match schedule maker](/tools/schedule/): change the servers, the match length and the gap and read the finish time." },
      ] },
      { h2: "Servers, devices and fair play", blocks: [
        { t: "ul", items: [
          "PC events need machines, peripherals and a stable network. Test the venue network with all machines playing, at the hour you will play.",
          "Online events need each captain to create or join the lobby and report the result with a screenshot.",
          "Have a technical lead whose only job is to fix machines and reconnects.",
          "Write down what happens on a disconnect, a pause and a late team. The [rules template](/guides/esports-tournament-rules-template/) has wording you can copy.",
        ] },
      ] },
      { h2: "Prizes and conditions", blocks: [
        { t: "note", x: "The publisher of the game sets conditions for running tournaments, using its name or marks, entry fees and prizes, and these change. Read the current policy before you advertise, and ask your college before offering cash. This guide does not state what is permitted." },
      ] },
      { h2: "Publish the bracket and the result", blocks: [
        { t: "p", x: "Show the bracket on a screen at the venue or on stream using the [display screen](/tools/display-screen/), and update it after every match. Afterwards, publish the final bracket and give each player a [certificate](/tools/certificates/)." },
      ] },
      { h2: "A worked example: 8 teams in one day", blocks: [
        { t: "p", x: "Eight teams in a single elimination bracket play 7 matches: four quarter-finals, two semi-finals and a final. Standard seeding makes the quarter-finals 1 v 8, 4 v 5, 2 v 7 and 3 v 6. On two servers with 60 minute matches and a 10 minute gap, starting at 09:30, the [match schedule maker](/tools/schedule/) shows 4 slots and a finish at 14:00 (270 minutes). That is with best-of-1 throughout." },
        { t: "p", x: "If the semi-finals and final were best-of-3, each could take up to three maps, so allow time for up to three maps in those rounds. Adding slack for a late team and a technical pause is how you get a finish time you can honestly publish." },
      ] },
      { h2: "Checklist", blocks: [
        { t: "ol", items: ["Team size, substitutes and eligibility written in the rules.","Registration closed a day before, in-game names and tags checked.","Bracket seeded by a stated rule and shown to captains.","Best-of choice for each round written in the rules.","Map pool and the ban and pick order agreed, and tested on the current game version.","Machines tested on the venue network, and a technical lead named."] },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: ["Planning a best-of-3 bracket with the clock of a best-of-1 day.","Not saying who owns the result when a match ends, so the bracket is out of date.","Waiting for a late team with no written limit.","Letting teams choose their own seed.","Not updating the bracket on screen, so teams do not know when they play."] },
      ] },
    ],
    faq: [
      { q: "How many matches does a 16-team Valorant bracket need?", a: "Single elimination needs 15 matches for 16 teams, because every match removes one team. Double elimination needs up to 30, or 31 if a reset final is played. Each match can be one map or a best-of series, which multiplies the maps. The bracket maker builds the single elimination bracket and the double elimination generator builds winners, losers and grand final, and both let you click winners forward through the rounds." },
      { q: "Should I use best-of-1 or best-of-3 in a Valorant tournament?", a: "Use best-of-1 when time is short and best-of-3 where fairness matters most, such as the semi-finals and the final. A best-of-3 is first to two maps, so it takes two or three maps per match. Many organisers mix the two. Write your choice in the rules and plan the clock for the longest case: enter a longer match length for the later rounds in the match schedule maker and see the finish time." },
      { q: "How do I seed teams in a Valorant bracket?", a: "Use a fair rule you can explain: a qualifier result, a ranking, or a random draw, never who registered first. Enter the teams best first in the bracket maker. It uses standard seeding, so for 8 teams the first round is 1 v 8, 4 v 5, 2 v 7 and 3 v 6, the top seeds meet late and any byes go to the highest seeds. Say in the rules how seeds were decided." },
      { q: "How long will a Valorant bracket take to play?", a: "More than the table says, because a bracket round cannot start until both feeder matches finish. As an illustration, 15 matches on two servers at 60 minutes each with a 10 minute gap, starting 09:30, finish at 18:40 in the match schedule maker. Add slack, publish a later finish time, and test the real match length with a practice game on the machines you will use." },
      { q: "What do I need for a PC Valorant tournament at a college?", a: "Machines with peripherals, a stable network tested with every machine playing at the hour you will play, a technical lead whose only job is fixing machines and reconnects, and written rules for disconnects, pauses and late teams. Collect each player's in-game name and tag at registration. The registration form tool and ID card maker on this site handle the roster and passes, and the gate scanner checks players in." },
      { q: "Can a free Valorant event have prizes?", a: "Yes, but check the publisher's current conditions and your college's rules before you advertise any cash prize or entry fee, and ask a legal adviser if money is involved. Certificates and non-cash prizes avoid most of the questions. After the final, the certificate maker prints one page per player from a pasted list of names, and the display screen can show the final bracket on a TV." },
    ],
    related: ["choosing-a-tournament-format", "tournament-bracket-template", "run-a-campus-tournament"],
    cta: { label: "Build your Valorant bracket", href: "/tools/brackets/" },
  },

  {
    slug: "tournament-bracket-template",
    title: "Tournament bracket template: how to build one in a sheet, in Word or online",
    seoTitle: "Tournament bracket template: seeding, byes, free tool",
    description: "How to make a tournament bracket template for 4, 8, 16 or any number of teams: standard seeding order, byes, match counts and a free generator that does it.",
    tag: "Tool guide", minutes: 8, published: PUBLISHED, updated: PUBLISHED,
    answer: "A tournament bracket template is a grid of rounds in which each match feeds the winner into the next one. For 8 teams the standard first round is 1 v 8, 4 v 5, 2 v 7 and 3 v 6, and a bracket for n teams has n − 1 matches. You can draw one in a spreadsheet or Word, or generate it free in a browser.",
    intro: "Many organisers start with a search for a bracket template for Excel, Google Sheets or Word. A template works if you do the seeding correctly, and it is slow if the number of teams changes. This guide explains what a correct bracket is, so you can build one by hand or check the output of a generator.",
    sections: [
      { h2: "What a bracket is", blocks: [
        { t: "p", x: "A single elimination bracket has rounds. Each round halves the number of teams: 16 teams play 8 matches, then 4, then 2, then the final. Every match has two slots, and the winner moves into a slot in the next round. Total matches are always n − 1, because every match removes exactly one team and one team is left." },
        { t: "table", head: ["Teams", "Rounds", "Matches", "Round of play"], rows: [["4", "2", "3", "Semi-finals, final"], ["8", "3", "7", "Quarter-finals, semi-finals, final"], ["16", "4", "15", "Round of 16 onwards"], ["32", "5", "31", "Round of 32 onwards"]] },
      ] },
      { h2: "Standard seeding: who plays whom", blocks: [
        { t: "p", x: "Seeding is the order in which teams are ranked before the draw. In a fair bracket, seed 1 plays the lowest seed, seed 2 the second lowest, and the top seeds are kept apart until the late rounds. The bracket maker uses this standard order, so a bracket for eight teams starts with these matches, in this order down the page:" },
        { t: "table", head: ["Size", "First round pairs, in bracket order"], rows: [["8 teams", pairs(seeds8).join(", ")], ["16 teams", pairs(seeds16).join(", ")]] },
        { t: "p", x: "Notice that seeds 1 and 2 are at opposite ends, so they can only meet in the final, and seeds 1 and 4 can only meet in the semi-final. That is the whole point of seeding. If you build a template by hand, copy this order." },
      ] },
      { h2: "What to do when the number is not a power of two", blocks: [
        { t: "p", x: `Brackets work in powers of two: 4, 8, 16, 32. With 11 teams, round up to 16 and give the five empty places to the five top seeds as byes: they skip the first round. The bracket still has 11 − 1 = 10 real matches, because a bye is not a match. The same rule works for any number: the number of byes is the next power of two minus the number of teams.` },
        { t: "p", x: "A template that is fixed at 16 teams breaks when 11 register. That is the best reason to use a generator, or to build a spreadsheet that reads the number of teams." },
      ] },
      { h2: "Build it in a spreadsheet or a document", blocks: [
        { t: "ol", items: [
          "List teams in seed order in one column, best first.",
          "Make a grid with one column per round and place the first-round pairs in the order shown above, leaving a blank row between pairs.",
          "In each later column, put one cell between each pair of cells in the column before it, so each match lines up with the two matches that feed it.",
          "Draw the borders that join each pair to its next match, and number the matches M1, M2, and so on so captains can refer to them.",
          "Print it landscape on A3 or two A4 pages joined, and write the winners in by hand or edit the cells live.",
        ] },
        { t: "p", x: "This works, but every change in team count means redrawing, and nothing stops a wrong winner from being written in the wrong cell." },
      ] },
      { h2: "Generate it free in the browser", blocks: [
        { t: "p", x: "The [free bracket maker](/tools/brackets/) takes your teams, one per line, best seed first, and builds a single elimination bracket with byes for you. Click a team after each match and it moves forward. For a second life for every team, use the [double elimination generator](/tools/double-elimination/). For league-style play with a table, see the [round robin generator](/tools/round-robin/). Nothing is uploaded and no account is needed." },
        { t: "p", x: "For a bracket on a TV or a stream, press Open the screen and use the [display screen](/tools/display-screen/)." },
      ] },
      { h2: "Choosing the right kind of bracket", blocks: [
        { t: "p", x: "Single elimination is fast but unforgiving, double elimination is fairer but takes about twice as long, and a round robin or groups suit small fields. The [formats guide](/guides/choosing-a-tournament-format/) compares them and shows the number of matches each one needs, so you can check whether your day fits before you announce it." },
      ] },
      { h2: "A worked example: 11 teams", blocks: [
        { t: "p", x: "Eleven teams round up to a 16-place bracket, so there are 5 byes, given to seeds 1 to 5. Standard 16-place seeding pairs seeds in this order: 1 v 16, 8 v 9, 4 v 13, 5 v 12, 2 v 15, 7 v 10, 3 v 14 and 6 v 11. Seeds 12 to 16 do not exist, so seeds 5, 4, 3, 2 and 1 skip round one." },
        { t: "table", head: ["Pair","Result in round one"], rows: [["1 v 16","Seed 1 has a bye"],["8 v 9","Played"],["4 v 13","Seed 4 has a bye"],["5 v 12","Seed 5 has a bye"],["2 v 15","Seed 2 has a bye"],["7 v 10","Played"],["3 v 14","Seed 3 has a bye"],["6 v 11","Played"]] },
        { t: "p", x: "Only 3 matches are played in round one, and the whole bracket has 10 real matches (11 − 1). The [bracket maker](/tools/brackets/) builds exactly this from 11 pasted team names." },
      ] },
      { h2: "Common mistakes in a hand-made template", blocks: [
        { t: "ul", items: ["Seeding in the order teams registered, so the best teams may meet in round one.","Drawing a fixed 16-team bracket and leaving blank boxes without making the byes explicit.","Giving a bye to a low seed instead of a top seed.","Putting a winner in the wrong cell and not noticing until the next round.","Forgetting a third-place match when prizes depend on it."] },
      ] },
      { h2: "Checklist", blocks: [
        { t: "ol", items: ["Teams are listed in seed order, best first.","The size is rounded up to the next power of two.","Byes are given to the highest seeds.","Matches are numbered so captains can refer to them.","Someone owns updating the bracket after each match."] },
      ] },
    ],
    faq: [
      { q: "How many matches are in a single elimination bracket?", a: "For n teams there are n − 1 matches, because each match eliminates exactly one team and one team is left at the end. 4 teams need 3 matches, 8 need 7, 16 need 15 and 32 need 31. A bye is not a match, so 11 teams also play 10 matches. The bracket maker on this site builds the rounds from a pasted team list and shows the champion once the last winner is clicked." },
      { q: "What are byes in a bracket and who gets them?", a: "A bye lets a team skip the first round when the number of teams is not a power of two. The bracket rounds up to the next power of two and the empty places become byes, given to the highest seeds. With 11 teams you round up to 16, so 5 byes go to seeds 1 to 5. The bracket maker adds them automatically for any number from small groups up to large fields." },
      { q: "Is there a free bracket template for Excel, Google Sheets or Word?", a: "You can draw one by hand using the steps in this guide: list teams in seed order, place first-round pairs in the standard order, line up each later column with the two matches that feed it, and number the matches. It works but breaks when the team count changes. The free bracket maker on this site does the seeding and byes for any number of teams in your browser, with no account." },
      { q: "How should I seed the teams in a bracket?", a: "Rank teams by a fair rule such as a qualifier or a previous league, enter them best first and let standard seeding do the rest: seed 1 plays the lowest seed, and seeds 1 and 2 can only meet in the final. For 16 teams the first round pairs are 1 v 16, 8 v 9, 4 v 13, 5 v 12, 2 v 15, 7 v 10, 3 v 14 and 6 v 11. If you cannot rank teams, draw seeds at random and say so." },
      { q: "Can I share or display the bracket I make?", a: "You can print it, take a screenshot, or press Open the screen to show the live bracket full screen on a TV, projector or stream. Clicking a team after each match moves it forward, and the screen follows while the bracket tab stays open. A shareable link to an editable bracket is not built, so decide who updates results and keep to one person. Pick one person to click the results so the bracket on screen always matches what happened on the field." },
      { q: "When should I use double elimination instead of a single bracket?", a: "When you want every team to have a second chance and you have the time. Double elimination needs up to 2n − 2 matches, or 2n − 1 with a reset final, about twice the matches of single elimination. The double elimination generator on this site builds the winners bracket, the losers bracket and the grand final for 3 to 64 teams, with byes where needed, and drops losers into the right losers-bracket match as you click winners." },
    ],
    related: ["choosing-a-tournament-format", "valorant-tournament-organiser", "football-cricket-tournament-maker"],
    cta: { label: "Build a bracket for free", href: "/tools/brackets/" },
  },

  {
    slug: "student-id-card-format",
    title: "Student ID card format: what to put on a college club or event ID card",
    seoTitle: "Student ID card format: fields, size and layout",
    description: "A practical student ID card format for a college club, fest or esports event: fields, standard card size, photo rules, QR code and printing. Make cards free.",
    tag: "Tool guide", minutes: 7, published: PUBLISHED, updated: PUBLISHED,
    answer: "A student ID card for a club or event should show a photo, the full name, the college and course or team, an ID or roll number, a validity date and a QR code, on a standard wallet card of about 85 × 54 mm. For a fest or tournament you can design and print these free in a browser.",
    intro: "This guide is about ID cards that a college club, fest committee or esports team issues for its own members and events: access cards, team cards and participant badges. It is not about the official identity card a college or a government office issues. For official cards, follow your institution's own format.",
    sections: [
      { h2: "What the card is for", blocks: [
        { t: "p", x: "Before choosing fields, write one sentence on what the card must do. A fest pass must let the gate tell participants from visitors. A team card must show which team a person plays for. A club card must prove membership. The purpose decides what belongs on the card and what does not. See [player ID cards and passes](/guides/player-id-cards/) for the esports case in detail." },
      ] },
      { h2: "Fields to include", blocks: [
        { t: "table", head: ["Field", "Why", "Notes"], rows: [
          ["Photo", "Lets staff match a face to the card", "Plain background, face clearly visible, same crop for every card"],
          ["Full name", "The main thing staff check", "Largest text on the card; check spelling against the roster"],
          ["College or club", "Shows who issued it", "Add your own logo; do not use a logo you do not have the right to"],
          ["Team, course or role", "Tells staff what the person may do", "Player, captain, coach, volunteer, organiser"],
          ["ID or roll number", "Makes the card unique", "Use your own event number; avoid government ID numbers"],
          ["Valid until / event date", "Stops old cards being reused", "One date is enough"],
          ["QR code", "Fast scanning at the gate", "Signed codes make copied cards detectable"],
        ] },
        { t: "note", x: "Do not print Aadhaar numbers, home addresses or phone numbers on a card that many people will see. If you must record an ID for verification, keep only what you need, such as the last four digits, and keep it off the printed card." },
      ] },
      { h2: "Size and layout", blocks: [
        { t: "p", x: "The common wallet or credit-card size is about 85.6 × 54 mm, and this is the size that standard card holders and card printers expect. The ID card maker supports wallet cards at 85 × 54 mm and six other shapes, including lanyard cards, badges and phone passes. Portrait cards suit a lanyard and landscape cards suit a wallet." },
        { t: "ul", items: [
          "Keep the photo in the same place on every card.",
          "Use at least 9 to 10 pt text for the name so it can be read at arm's length.",
          "Leave a margin of 3 mm or more from the edge, and extend the background past the cut line if you use full-colour edges (bleed).",
          "Use strong contrast between text and background, and avoid thin fonts on a photo.",
        ] },
      ] },
      { h2: "Make the cards", blocks: [
        { t: "ol", items: [
          "Open the [ID card maker](/tools/id-cards/) and list your teams and people, by hand or from a spreadsheet.",
          "Pick a design for each team and adjust colours and logos.",
          "Add a QR code if you will check people in at the gate.",
          "Download the PDF, check the preview and print.",
        ] },
        { t: "p", x: "For printing, see [how to print ID cards on PVC or paper](/guides/print-pvc-id-cards/). For scanning, see the [gate check-in guide](/guides/event-gate-checkin/)." },
      ] },
      { h2: "Privacy basics", blocks: [
        { t: "p", x: "Collect only what the card needs, tell people why, and get a parent or guardian's consent for anyone under 18. Delete the list and the photos when the event is over. The ID card maker works in your browser and does not upload your photos to a server." },
      ] },
      { h2: "A sample layout", blocks: [
        { t: "p", x: "For a fest team card in landscape wallet format, put the club logo at the top left and the event name beside it. Put the photo on the left, about a third of the card, and the name beside it in the largest text. Under the name put the team and the role, then the ID number and the valid-until date at the bottom, with the QR code on the right. On the back, put the organiser's contact, a short line of rules and a return address. The [ID card maker](/tools/id-cards/) lets you move and resize each of these in its editor." },
        { t: "table", head: ["Area","Contents"], rows: [["Top strip","Logo, event name"],["Left","Photo"],["Centre","Name, team and role, ID number"],["Right","QR code"],["Bottom","Valid-until date"],["Back","Organiser contact, rules line, if-found note"]] },
      ] },
      { h2: "Checklist and common mistakes", blocks: [
        { t: "ol", items: ["Names checked against the roster.","Photos have the same crop and a plain background.","ID numbers are your own, not government numbers.","Every card has a date or event name.","One printed card scans correctly."] },
        { t: "ul", items: ["A thin font over a photo, so the name cannot be read.","A tiny QR code that does not scan from paper.","Printing without bleed and getting a white edge.","Using the college's official logo and layout as if the card were an official one."] },
      ] },
    ],
    faq: [
      { q: "What size is a standard student ID card?", a: "The usual wallet card is about 85.6 × 54 mm, the size card holders and card printers expect. The ID card maker uses 85 × 54 mm for wallet cards and offers six other shapes, including lanyard cards, event badges, wristband strips, poster cards, story cards and phone passes. Portrait suits a lanyard and landscape suits a wallet. Download the PDF at real size, print one test page and hold it against a real card." },
      { q: "What fields should a student ID card for a club or event have?", a: "A photo, the full name, the college or club, the team, course or role, an ID or roll number that you issue, a validity date or event date, and a QR code if you will scan it at the gate. Keep government ID numbers, home addresses and phone numbers off the card. The ID card maker has fields and designs for all of these and lets you add your own logo." },
      { q: "Can I make an official college ID card with the ID card maker?", a: "No. It makes cards for clubs, fests, teams and events, such as access cards, team cards and participant badges. An official college or government ID should follow the format your institution or the issuing authority sets. For a fest pass or a team card it is the right tool, and it is free and runs in your browser without an account. Say clearly on the card that it is an event pass, so nobody mistakes it for an official identity document." },
      { q: "Should I add a QR code to a student ID card?", a: "If you will check people in at an event, yes. The ID card maker can print a signed QR code, and the gate check-in scanner reads it to show the photo, team and role and to flag a copied or edited card. If the card is only checked by eye, you can leave the code out. Print one card and scan it from paper before you print the whole set. The QR code is cheap to add: it costs nothing in the card maker, and it makes lost-card and stand-in problems visible at the door instead of after the event." },
      { q: "How do I handle photos and privacy for student cards?", a: "Collect only what the card needs, tell people why, and get a parent or guardian's consent for anyone under 18. Use the same crop for every photo: head and shoulders, plain background. Delete the list and photos when the event is over. The ID card maker works in your browser and does not upload your photos to a server when you only make and print cards." },
      { q: "How do I make many student cards at once?", a: "Type people in, or import a spreadsheet, then pick a design for each team and download one PDF with every card at real size, with crop marks and optional 3 mm bleed. Most of the time goes on collecting photos, so ask for them early in one agreed shape. With a free account you can also send teams an invite link so each player adds their own name and photo, which you approve before it reaches the roster." },
    ],
    related: ["player-id-cards", "print-pvc-id-cards", "employee-id-card-format"],
    cta: { label: "Make ID cards for free", href: "/tools/id-cards/" },
  },

  {
    slug: "employee-id-card-format",
    title: "Employee and staff ID card format for small teams and events",
    seoTitle: "Employee ID card format: fields, layout and tips",
    description: "A clear employee or staff ID card format for a small company, studio or event crew: what to print, front and back layout, size and a free card maker.",
    tag: "Tool guide", minutes: 6, published: PUBLISHED, updated: PUBLISHED,
    answer: "An employee ID card normally shows a photo, the full name, the role or department, an employee number, the organisation's name and logo and a validity date on the front, and contact or return information on the back. A QR code can link it to a gate or an attendance check. Free online makers can produce one print-ready PDF per team.",
    intro: "Small companies, studios, event crews and volunteer groups often need staff cards in a hurry. This guide sets out a simple format and what to keep off the card. It covers cards you issue yourself; a regulated workplace may have its own requirements, so check those first.",
    sections: [
      { h2: "Front of the card", blocks: [
        { t: "ul", items: [
          "Organisation name and logo at the top.",
          "A clear photo, in the same size and position on every card.",
          "Full name, as large as the layout allows.",
          "Role or department. For an event crew, use the role (volunteer, security, media) because it tells people what the person may do.",
          "Employee or staff number.",
          "Validity: a date, or an event name.",
        ] },
      ] },
      { h2: "Back of the card", blocks: [
        { t: "p", x: "The back is where you put what you do not want in the person's face: an organisation address, a phone number to call if the card is found, a line such as \"if found, please return to\" and a QR code. The ID card maker can print mirrored backs so the fronts and backs line up when you print double-sided." },
        { t: "note", x: "Keep sensitive data off the card. Do not print a home address or a government ID number. If a card is lost, whoever finds it can read everything on it." },
      ] },
      { h2: "A QR code that does a job", blocks: [
        { t: "p", x: "A QR code is useful if something scans it: a gate, an attendance sheet or a door log. A signed code lets the scanner reject a copy or an edited card. A QR code that nobody scans is decoration. The [gate scanner](/tools/check-in/) reads signed codes from the ID card maker and works offline. The [QR attendance guide](/guides/qr-code-attendance/) explains how that works." },
      ] },
      { h2: "Make and print them", blocks: [
        { t: "ol", items: [
          "List your people with name, role and photo in the [ID card maker](/tools/id-cards/).",
          "Choose one design for the whole team, or one per department.",
          "Download the PDF at real size.",
          "Print on thick card, or take the file to a printing shop. See [printing ID cards on PVC](/guides/print-pvc-id-cards/).",
        ] },
        { t: "p", x: "If you want a Word template instead, the fields above are the ones to put in it. A generator is quicker when you have more than a handful of people because it fills every card from your list." },
      ] },
      { h2: "Layout choices that make staff cards readable", blocks: [
        { t: "ul", items: [
          "Put the role in a coloured band across the card. A security guard, a volunteer and a media person can then be told apart from several metres away.",
          "Print the name in at least the same size as the role. People check the name first.",
          "Use the same photo crop for everyone: head and shoulders, plain background, no sunglasses or caps that hide the face.",
          "Choose a portrait card for a lanyard and a landscape card for a wallet or a card holder, and print a test before you commit to a design.",
          "Add the event dates or the validity on the front, so an old card from last year is obvious.",
        ] },
        { t: "p", x: "A team of ten can have cards done in an hour: collect photos and names in one sheet, import them into the maker, pick the design, and download. Most of the time goes on getting the photos, so ask for them early and in one agreed shape." },
      ] },
      { h2: "Good practice", blocks: [
        { t: "ul", items: [
          "Issue cards only to people on the list, and keep the list up to date.",
          "Collect cards back at the end of an event or when someone leaves.",
          "Use a different colour for each role so it can be read from a distance.",
          "Do not store more personal details than you need, and delete the list when it is no longer useful.",
        ] },
      ] },
      { h2: "A worked example: a crew of twelve", blocks: [
        { t: "p", x: "An event crew has twelve people: six volunteers, three security, two media and one organiser. Use one design and four colours, one per role. Collect twelve photos in the same shape, import the names and roles into the [ID card maker](/tools/id-cards/), pick the design for each team and download the PDF. Print one test card, scan its QR code with the [gate scanner](/tools/check-in/), then print the lot." },
        { t: "p", x: "Give each role its colour in a band across the card and write the role in words as well, because people with colour-vision difficulties cannot rely on colour alone." },
      ] },
      { h2: "Checklist and common mistakes", blocks: [
        { t: "ol", items: ["Every person is on the list, spelled the way they want.","Roles match what each person may do.","The back has a return contact.","The validity date or event name is on the front.","A spare few cards and blank ones are printed."] },
        { t: "ul", items: ["Printing a home address or government ID number on the card.","Using two similar colours for different roles.","Not collecting cards back after the event.","A QR code on the card with nothing set up to scan it."] },
      ] },
    ],
    faq: [
      { q: "What should an employee ID card show?", a: "On the front: the organisation's name and logo, a clear photo in the same size and position on every card, the full name as large as the layout allows, the role or department, a staff number and a validity date or event name. On the back put an address or phone number to call if the card is found. Keep home addresses and government ID numbers off it. The ID card maker has these fields and prints mirrored backs for double-sided printing." },
      { q: "Is there a free employee ID card maker?", a: "Yes. The ID card maker on this site is free, runs in your browser and exports a print-ready PDF at real size, with crop marks and optional bleed. It is built for events, teams and crews, so a regulated workplace should check its own requirements before relying on it. For a small studio, a volunteer group or an event crew it covers the whole job in about an hour." },
      { q: "Should I put a QR code on a staff card?", a: "Only if something will scan it, such as a gate, an attendance sheet or a door log. A QR code nobody scans is decoration. The ID card maker prints signed codes, and the gate check-in scanner reads them offline and flags a copied or edited card. Test a printed card against the scanner before you print the full set. Make sure the person at the door knows which result colour means let them in. A one-minute briefing for each scanner volunteer saves long queues on the day." },
      { q: "Can I use a Word template for employee ID cards?", a: "You can, using the fields in this guide, but you fill every card by hand and nothing keeps photos and names consistent. A generator is quicker when you have more than a handful of people, because it fills every card from one list. Import names from a spreadsheet into the ID card maker, choose one design for the team or one per department, and download one PDF." },
      { q: "How do I tell roles apart on staff cards?", a: "Put the role in a coloured band across the card, use one colour per role everywhere and avoid similar colours for different roles, because people confuse them in poor light. Print the name at least as large as the role, since people read the name first. In the ID card maker you can pick a design per team or department and recolour anything in the editor, so a security, volunteer and media card look different from several metres." },
      { q: "What should I do with staff cards after the event ends?", a: "Collect them back at the end of an event or when someone leaves, keep the list up to date, and delete personal details you no longer need. Put an event name or date on the front so an old card from last year is obvious. If a role changes, issue a new card: a pass signed for the old role fails at the gate scanner by design. Keep a simple sign-in and sign-out sheet for cards at the start and end of each shift, so you know who still holds one and can switch off a lost one." },
    ],
    related: ["student-id-card-format", "print-pvc-id-cards", "qr-code-attendance"],
    cta: { label: "Make ID cards for free", href: "/tools/id-cards/" },
  },

  {
    slug: "print-pvc-id-cards",
    title: "How to print ID cards: PVC card printing, shops and printing at home",
    seoTitle: "How to print ID cards: PVC shop or A4 at home",
    description: "How to print event and team ID cards: send a print-ready PDF to a local PVC card printing shop, or print on A4 at home. Sizes, bleed, files and checks.",
    tag: "Tool guide", minutes: 7, published: PUBLISHED, updated: PUBLISHED,
    answer: "To print ID cards, make a print-ready PDF at real size, then either take it to a local shop that prints on PVC cards or print it on thick A4 paper or card at home and cut along the crop marks. Check one proof card for spelling, photo and QR before printing the full set.",
    intro: "Most people who search for card printing near them want the same thing: cards that look professional in their hands, in time for the event. You have two routes, a shop with a PVC card printer or a home or office printer. Both start from the same file, and the checks are the same.",
    sections: [
      { h2: "Make the file first", blocks: [
        { t: "p", x: "Design the cards in the [ID card maker](/tools/id-cards/) and download the PDF. It prints at real size, with crop marks, optional 3 mm bleed and mirrored backs for double-sided printing. Check the size you choose: wallet cards are 85 × 54 mm, and there are also lanyard cards, event badges, wristband strips and phone passes. Choose the one that matches your holder or lanyard before you print." },
      ] },
      { h2: "Route 1: a PVC card printing shop", blocks: [
        { t: "p", x: "Plastic (PVC) cards are what most people think of as a real ID card. Many print and stationery shops can print them, and you can search for card printing in your own area. Prices and turnaround differ from shop to shop, so ask for a quote and do not rely on a figure from the internet." },
        { t: "ul", items: [
          "Ask what file they need. Many shops will take a PDF or PNG files at the card size.",
          "Ask whether they print both sides and whether you need to send a separate back.",
          "Ask about bleed and whether they will cut or the printer prints edge to edge.",
          "Ask for one proof card before they print the full set.",
          "Go at least a week ahead of the event, not the morning of.",
        ] },
        { t: "p", x: "Because every shop works differently, treat the ID card maker's PNG export as the safest thing to hand over: one picture per card, front and back." },
      ] },
      { h2: "Route 2: print at home or in an office", blocks: [
        { t: "ol", items: [
          "Print one page as a test on plain paper. Set the printer to 100% or Actual size, not Fit to page.",
          "Hold the test sheet against a real card or a ruler to confirm the size.",
          "Print the full set on thick paper or card stock. Print double-sided if the backs are included, then check that fronts and backs line up.",
          "Cut along the crop marks with a sharp blade and a steel ruler, or a paper trimmer.",
          "Laminate the cards, or put them in clear card holders, so they survive the day.",
        ] },
        { t: "p", x: "This route is cheaper and quicker, and it is fine for a one-day event. For anything that must last, use PVC." },
      ] },
      { h2: "The proof checklist", blocks: [
        { t: "ul", items: [
          "Names spelled correctly, checked against your roster.",
          "Each photo matches its person.",
          "The QR code scans with the [gate scanner](/tools/check-in/) from a printed card, not only from the screen.",
          "Text is readable at arm's length and nothing is too close to the cut line.",
          "Colours look right: screens and printers differ, so look at a printed sample.",
        ] },
      ] },
      { h2: "Pack and hand over", blocks: [
        { t: "p", x: "Sort cards by team, put each team's cards in an envelope with the captain's name, and bring spares and blank cards for last-minute additions. The [player ID cards guide](/guides/player-id-cards/) and the [gate check-in guide](/guides/event-gate-checkin/) cover handing cards out and what the gate should check." },
      ] },
      { h2: "A worked plan: 60 cards in two days", blocks: [
        { t: "p", x: "Say you need 60 cards for an event on Saturday. On Monday finalise the roster and photos. On Tuesday download the PDF and the PNG pictures from the [ID card maker](/tools/id-cards/), print one page at home on plain paper at 100%, hold it against a real card, and scan the QR code with the [gate scanner](/tools/check-in/). On Wednesday take the files to a shop and ask for a proof. On Thursday approve the proof. On Friday collect, sort by team and put each team's cards in an envelope. That leaves a day for a reprint if something is wrong." },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: ["Printing at Fit to page, so the card is smaller than 85 × 54 mm and the QR code is too small to scan.","Not asking for a proof, then finding a misspelt name on every card.","Giving the shop a screenshot instead of the PDF or the PNG pictures.","Printing double-sided without checking that fronts and backs line up.","Cutting by eye instead of along the crop marks.","Leaving the printing to the morning of the event."] },
      ] },
    ],
    faq: [
      { q: "Can I print ID cards at home?", a: "Yes. Download the PDF from the ID card maker, print one test page on plain paper at 100% or Actual size (not Fit to page), and hold it against a real card to check the size. Then print the full set on thick paper or card stock, cut along the crop marks with a sharp blade and a steel ruler, and laminate or use clear card holders. It is cheaper and quicker, and fine for a one-day event." },
      { q: "How do I get PVC ID cards printed near me?", a: "Search for card printing or PVC card printing in your own area, ask for a quote and a proof, and give the shop the PDF or the PNG pictures from the ID card maker. Prices and turnaround differ between shops, so ask before you commit and do not rely on a figure from the internet. Go at least a week before the event and ask for one proof card before they print the full set." },
      { q: "What file should I give a card printing shop?", a: "Ask what they need. Many shops take a PDF or PNG files at the card size. The ID card maker downloads a PDF at real size with crop marks and optional 3 mm bleed, plus a zip of PNG pictures, one per card, front and back. Because every shop works differently, the PNG pictures are the safest thing to hand over. Ask whether they print both sides and whether you must send the back separately." },
      { q: "What size should I print ID cards?", a: "Wallet cards are 85 × 54 mm. The ID card maker also offers lanyard cards, event badges, wristband strips, poster cards, story cards and phone passes, on A4 or US Letter. Choose the shape that fits your lanyard or holder before you print, and always print a test page first. If the test is smaller or larger than a real card, check that the printer is set to 100%." },
      { q: "What is bleed on a printed ID card?", a: "Bleed is extra background that extends past the cut line, so there is no white edge if the cut is slightly off. The ID card maker offers an optional 3 mm bleed. If you print at a shop, ask whether they cut or print edge to edge and whether they need bleed. At home, keep text and the QR code at least 3 mm inside the edge so a small cutting error does not clip them." },
      { q: "How do I check printed cards before the event?", a: "Check names against your roster, check each photo matches its person, make sure the text can be read at arm's length, and scan a printed card, not only the screen, with the gate check-in scanner. Look at a printed sample for colour, because screens and printers differ. Sort cards by team in envelopes, and bring spares and blank cards for last-minute additions." },
    ],
    related: ["player-id-cards", "student-id-card-format", "event-gate-checkin"],
    cta: { label: "Make print-ready ID cards", href: "/tools/id-cards/" },
  },

  {
    slug: "qr-code-attendance",
    title: "QR code attendance for events: how it works and how to set it up free",
    seoTitle: "QR code attendance for events: how it works, free setup",
    description: "How QR code attendance works for events, workshops and tournaments: signed passes, scanning with a phone, offline use, and how it compares with Google Forms.",
    tag: "Tool guide", minutes: 8, published: PUBLISHED, updated: PUBLISHED,
    answer: "QR code attendance gives each person a card or pass with a QR code, and a phone scans it at the door to mark them present. A signed code stops copied or edited passes. For events this is faster than a paper list or a form, and it can work offline.",
    intro: "People search for QR code attendance for classrooms, workshops, fests and tournaments. This guide explains how it works, what you need, and where it stops being the right tool. The free gate scanner on this site is built for events with a list of people and a door. It is not a daily classroom register.",
    sections: [
      { h2: "How it works", blocks: [
        { t: "ol", items: [
          "You have a list of people: name, team or role, photo.",
          "Each person gets a card or pass with a QR code that identifies them.",
          "At the door, a phone scans the code and looks it up against the list.",
          "The scanner marks the person present, and flags a code that has already been used or does not match.",
        ] },
        { t: "p", x: "The key detail is the signature. Without one, anyone can make a QR code that says \"Player 17\". With a signed code, the signature is tied to the person and their role, so an edited code no longer matches and the scanner rejects it." },
      ] },
      { h2: "Set it up with free tools", blocks: [
        { t: "ol", items: [
          "Make passes in the [ID card maker](/tools/id-cards/) with the QR option on.",
          "For one door, export an offline pack. For several doors, save the event online with a free account and make a gate key for each door.",
          "Open the [gate scanner](/tools/check-in/) on a phone, load the pack or paste the key, and point the camera at a card.",
          "Read the result: a genuine pass shows the photo, team, role and access zones. A copy, a repeat or an unknown code is flagged.",
        ] },
        { t: "p", x: "The [gate check-in guide](/guides/event-gate-checkin/) covers how many doors and volunteers you need and what to do when something goes wrong." },
      ] },
      { h2: "QR attendance or a Google Form?", blocks: [
        { t: "table", head: ["", "QR pass at the gate", "Google Form or paper list"], rows: [
          ["Speed at the door", "A scan per person", "Typing or ticking a name"],
          ["Copies and fakes", "Signed codes detect copies and edits", "Nothing stops someone entering another person's name"],
          ["No signal", "Works with an offline pack", "A form needs internet; paper does not"],
          ["Set-up work", "Make cards, test the scanner", "Almost none"],
          ["Best for", "Fests, tournaments, workshops with a list of attendees", "Small meetings where everyone knows each other"],
        ] },
        { t: "p", x: "For a small meeting of 20 people who know one another, a form or a paper list is enough. Once a few hundred people arrive in a short time, or access zones matter, passes pay for themselves." },
      ] },
      { h2: "Privacy and good practice", blocks: [
        { t: "ul", items: [
          "Tell people what you record: arrival time and door. Do not collect more.",
          "Keep the roster and the attendance log only as long as you need them.",
          "Do not put sensitive identifiers inside a QR code or print them on the card.",
          "Have a manual list as a backup for a dead phone or a damaged card.",
        ] },
      ] },
      { h2: "What this is not", blocks: [
        { t: "p", x: "The scanner is for entry to an event with a door. It is not a lesson-by-lesson classroom attendance register, a payroll system or a tool that checks a person's location. If that is what you need, look for a tool designed for it." },
      ] },
      { h2: "A worked example: a 300-person workshop day", blocks: [
        { t: "p", x: "A fest runs a workshop with 300 registered people arriving over 30 minutes. If one scan takes about six seconds, one door handles about ten people a minute, which is the same 300 people in 30 minutes. One door is just enough, but any problem at the door stops the queue, so run two with the problems handled by a runner. Make the passes in the [ID card maker](/tools/id-cards/), save the event online and create two gate keys, one per door." },
        { t: "p", x: "At the end, export the attendance list. It shows who came, when, and through which door, which is more than a Google Form can tell you." },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: ["Printing a QR code that nothing is set up to scan.","Testing the scanner on a screen but not on a printed card.","Having a single offline phone for several doors and expecting it to know the other door's scans.","Putting a personal identifier inside a QR code.","Not keeping a manual list as a backup."] },
      ] },
    ],
    faq: [
      { q: "How does QR code attendance work for an event?", a: "Each person gets a card or pass with a QR code that identifies them. At the door a phone scans the code, looks it up against the list and marks the person present, flagging a code that was already used or does not match. With signed codes from the ID card maker, an edited code no longer matches its signature, so the gate scanner rejects it and shows the photo, team and role of a genuine pass." },
      { q: "Is there a free QR code attendance system?", a: "The gate check-in scanner on this site is free for events. Make signed passes in the ID card maker, then scan them with any phone: load an offline pack for one door, or save the event online with a free account and make a gate key per door. It is built for event entry with a list of people and a door, not for daily class registers. You can try it at no cost: open the card maker, add five test names, print one card and scan it from the paper before you commit to a bigger event." },
      { q: "Does QR attendance work without internet?", a: "Yes, with an offline pack made in the ID card maker, which loads the guest list and the checking secret onto the phone. In live mode, scans made without a connection are saved on the phone, marked as not yet verified and sent when the signal returns. An offline pack cannot know about another phone's scans until you merge them afterwards, so use live mode with several doors." },
      { q: "Is QR attendance better than Google Forms or a paper list?", a: "For a large crowd, several doors or access zones, yes: a scan is quicker than typing a name, and signed codes detect copies that nothing else stops. For a small meeting of 20 people who know one another, a form or paper list is enough and needs almost no set-up. Passes pay for themselves when a few hundred people arrive in a short time. You can also combine them: use the form for advance registration, then scan passes at the door, so the list you scan against is the list people signed up on." },
      { q: "Can QR attendance replace a classroom attendance register?", a: "No. The scanner is for entry to an event with a door and a list of attendees. It is not a lesson-by-lesson classroom register, a payroll system or a tool that checks a person's location. If that is what you need, look for a tool designed for it. For fests, workshops and tournaments with a guest list, it is a good fit. A fest session, a workshop day or a tournament check-in with a printed list is the sweet spot for the gate scanner; daily lessons are not." },
      { q: "What personal data does QR attendance record?", a: "Only what you set up: the names and details on your list, plus the arrival time and the door for each scan. Tell people what you record and for how long, keep the log only as long as you need it, do not put sensitive identifiers inside a code or on the card, and keep a manual list as a backup for a dead phone. Export the attendance list after the event, then delete what you no longer need." },
    ],
    related: ["event-gate-checkin", "player-id-cards", "employee-id-card-format"],
    cta: { label: "Open the gate scanner", href: "/tools/check-in/" },
  },

  {
    slug: "certificate-wording",
    title: "Certificate wording for winners and participants: examples you can copy",
    seoTitle: "Certificate wording for winners and participants",
    description: "Certificate wording for esports and college events: ready sentences for winners, runners-up, participants and volunteers, plus a free maker that prints one per name.",
    tag: "Tool guide", minutes: 6, published: PUBLISHED, updated: PUBLISHED,
    answer: "A good certificate has a heading, the person's name, a short sentence saying what they did and where, the event name and date, and one or two signatures. Use short, plain wording, and make one version for winners and another for participants. A free maker can print one page per name from a list.",
    intro: "Writing the words on a certificate is easy to put off until the last night. The wording matters less than getting the name, event and date right, but a clear sentence makes the certificate feel real. Here are the parts and sentences you can copy and adapt.",
    sections: [
      { h2: "The parts of a certificate", blocks: [
        { t: "ol", items: [
          "A heading: Certificate of Achievement, Certificate of Participation, or Certificate of Appreciation.",
          "A line such as \"This is presented to\".",
          "The person's full name, the largest text on the page.",
          "One sentence saying what they did.",
          "The event name, the organiser and the date.",
          "One or two signatures with names and roles.",
        ] },
      ] },
      { h2: "Sentences for each kind of award", blocks: [
        { t: "table", head: ["Award", "Sentence you can adapt"], rows: [
          ["Winner", "for winning first place in {event}, organised by your club, on {date}."],
          ["Runner-up", "for finishing second in {event} on {date}."],
          ["Participant", "for taking part in {event} on {date}."],
          ["Volunteer", "in appreciation of their help as a volunteer at {event} on {date}."],
          ["Best player or MVP", "for being named the most valuable player of {event} on {date}."],
          ["Team award", "as a member of the winning team in {event}, played on {date}."],
        ] },
        { t: "p", x: "The words {award}, {event} and {date} in the [certificate maker](/tools/certificates/) are filled in from the fields below for you, so you write the sentence once and it is correct on every page." },
      ] },
      { h2: "Check before you print", blocks: [
        { t: "ul", items: [
          "Spell every name from the roster, not from memory. Names in Hindi, Marathi and other scripts print as you type them.",
          "Use the same date and event name as on your posters.",
          "Have the signatories sign a printed copy, or add the names as typed text if a real signature is not needed.",
          "Decide whether winners and participants get different designs. A different colour is enough.",
          "Print one page first, at 100%, on A4 landscape, to check the layout.",
        ] },
      ] },
      { h2: "Make them", blocks: [
        { t: "p", x: "Paste the names, one per line, into the free [certificate maker](/tools/certificates/), choose a design, set the wording, and download a single PDF with one page per name. Print on thick paper. The [campus tournament guide](/guides/run-a-campus-tournament/) covers what else to wrap up after an event, and the [points table guide](/guides/points-table/) helps you work out who the winners actually are." },
      ] },
      { h2: "Layout and design tips", blocks: [
        { t: "ul", items: [
          "Make the name the largest text on the page, with the award line second.",
          "Keep to two fonts at most: one for headings and one for body text.",
          "Leave generous margins so nothing is cut off by a home printer.",
          "Put the organiser's logo at the top and any sponsor logos at the bottom, small.",
          "Choose a light background if you will print at home, because a dark full-page background uses a lot of ink and can streak.",
        ] },
        { t: "p", x: "Winners and participants can share one layout. Change the heading, the sentence and perhaps the accent colour, and everyone can see the difference at a glance without any extra design work." },
      ] },
      { h2: "A note on trust", blocks: [
        { t: "p", x: "A certificate is only worth what the event was worth. Only give winner certificates to the real winners, say how many people took part if you advertise it, and do not use another organisation's logo or name without permission." },
      ] },
      { h2: "Two filled-in examples", blocks: [
        { t: "p", x: "Winner: Certificate of Achievement. This is presented to Asha Verma for winning first place in Inter-College Free Fire Cup, organised by the Gaming Club, on 14 December. Signed by the organiser and the faculty coordinator. This is an example of the layout, not a real event." },
        { t: "p", x: "Participant: Certificate of Participation. This is presented to Rohan Patil for taking part in Inter-College Free Fire Cup, organised by the Gaming Club, on 14 December. In the [certificate maker](/tools/certificates/) you write the heading, the sentence with {event} and {date}, and the signatories once, and every name in your list gets its own page." },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: ["Misspelling a name because it was typed from memory.","Printing in Fit to page mode, which shrinks the page.","Using a dark full-page background on a home printer.","Giving winner certificates to everyone, so they mean nothing.","Using another organisation's logo without permission.","Forgetting the date and the event name."] },
      ] },
    ],
    faq: [
      { q: "What should I write on a participation certificate?", a: "The person's full name as the largest text, a sentence such as for taking part in {event} on {date}, the event name and organiser, the date and one or two signatures with names and roles. Start with a heading such as Certificate of Participation. In the certificate maker the words {award}, {event} and {date} are filled in from the fields below, so you write the sentence once and it is correct on every page." },
      { q: "Can I make certificates for many people at once?", a: "Yes. Paste the names, one per line, into the certificate maker, choose a design, set the wording and signatures and download a single PDF with one A4 landscape page per name. About a hundred names per file works well; for more, make several files. Everything is drawn in your browser, so names and logos are not uploaded anywhere and no account is needed." },
      { q: "Do certificates work with Hindi, Marathi or other scripts?", a: "Yes. Certificates are drawn in your browser, so names in Devanagari and other scripts appear exactly as you type them. Spell each name from your roster, not from memory, and check the preview before you download. Print one page first at 100% to confirm that the layout and the script look right. Because the PDF is made in your browser, the same file can be taken to a print shop on a USB drive, and each name keeps the spelling you typed." },
      { q: "What paper and size should I print certificates on?", a: "The certificate maker produces A4 landscape. Print at 100% (not Fit to page) on thick paper for a good finish, and print one page first to check the layout. If you print at home, choose a light background, because a dark full-page background uses a lot of ink and can streak. Leave generous margins so a home printer does not cut anything off. For a shop print, send the PDF as it is, and ask them to print A4 landscape at actual size so the border and signature lines stay where you placed them." },
      { q: "What is the difference between winner, runner-up and participant wording?", a: "Only the sentence changes: for winning first place in the event, for finishing second, for taking part, in appreciation of their help as a volunteer, or for being named most valuable player. A different heading and accent colour is enough to tell the kinds apart at a glance. Only give winner certificates to the real winners; the points table calculator and bracket maker show who they are." },
      { q: "Can I add a logo or a signature to the certificate?", a: "Yes. In the certificate maker you can add your own logo, change the heading, award, event, date and signatories, and choose a design. Have the signatories sign a printed copy, or add their names as typed text if a real signature is not needed. Use only logos you have the right to use, and do not use another organisation's name without permission. Add your club logo first, then check the preview: a wide logo and a long event name can push the layout, so shorten the event name if the heading gets crowded." },
    ],
    related: ["run-a-campus-tournament", "sponsor-pitch", "points-table"],
    cta: { label: "Make certificates for free", href: "/tools/certificates/" },
  },

  {
    slug: "round-robin-schedule",
    title: "How to make a round robin schedule: the circle method with a 6-team example",
    seoTitle: "Round robin schedule: circle method, 6-team example",
    description: "How to make a round robin schedule for any number of teams: the circle method, byes for odd numbers, match counts, home and away, a worked 6-team example.",
    tag: "Tool guide", minutes: 7, published: PUBLISHED, updated: PUBLISHED,
    answer: "In a round robin every team plays every other team once. For n teams there are n × (n − 1) ÷ 2 matches, so 6 teams play 15. The circle method builds the rounds: fix one team, rotate the others one place each round, and with an odd number of teams one team has a bye each round.",
    intro: "A round robin is the fairest format for a small field because every team plays every other team and the best record wins. The hard part is writing the fixtures so no team plays twice in a round. The circle method does it in a few steps, and the free generator does it for you.",
    sections: [
      { h2: "How many matches and rounds", blocks: [
        { t: "p", x: `For n teams, each pair plays once, so there are n × (n − 1) ÷ 2 matches. Six teams play ${matchCount(6)} matches and eight teams play ${matchCount(8)}. If everyone plays everyone twice, home and away, the count doubles. With an even number of teams there are n − 1 rounds. With an odd number there are n rounds, and one team sits out each one.` },
      ] },
      { h2: "The circle method", blocks: [
        { t: "ol", items: [
          "Write the teams in two rows, the first half on top and the second half below, so that each team faces one other team.",
          "The pairs that face each other play in round 1.",
          "Keep the first team fixed. Rotate every other team one place around the circle.",
          "The new pairs play in round 2. Repeat until the teams are back where they started.",
          "If the number of teams is odd, add a dummy team called Bye. Whoever faces the Bye has a rest round.",
        ] },
        { t: "p", x: "Every pair meets exactly once and no team plays twice in a round. Alternate which team is listed first so that nobody is always the home side." },
      ] },
      { h2: "A worked example with 6 teams", blocks: [
        { t: "p", x: `Here are the fixtures the round robin generator builds for six teams: ${SIX.length} rounds of ${SIX[0]!.length} matches, ${matchCount(6)} matches in all.` },
        sixTable,
        { t: "p", x: `If three matches can run at the same time (three lobbies or fields), each round takes one slot. At 30 minutes a match and a 10 minute gap from ${SIX_PLAN.rows[0]!.start}, the schedule maker finishes at ${SIX_PLAN.finish}: ${SIX_PLAN.totalMinutes} minutes for the whole league.` },
      ] },
      { h2: "Scoring and the table", blocks: [
        { t: "p", x: "A league needs a points rule and tie-breakers, and you must write them before the first match. A common football-style rule is 3 points for a win, 1 for a draw and 0 for a loss, which is the generator's default and which you can change. Then rank by points, then score difference, then scores for, then wins. See the [esports rules template](/guides/esports-tournament-rules-template/) for wording." },
      ] },
      { h2: "When a round robin is the wrong choice", blocks: [
        { t: "p", x: "The number of matches grows quickly: 16 teams would need 120. For a big field use groups followed by a knockout, as explained in the [formats guide](/guides/choosing-a-tournament-format/). For battle royale games, a [points table](/guides/points-table/) is the right tool." },
        { t: "p", x: "Make your fixtures free with the [round robin generator](/tools/round-robin/), enter scores as matches finish and show the live table on a screen with the [display screen](/tools/display-screen/)." },
      ] },
      { h2: "A worked example: four teams with scores", blocks: [
        { t: "p", x: "Four teams, Red, Blue, Green and Gold, play 6 matches in 3 rounds. The generator lists round one as Red v Gold and Green v Blue, round two as Green v Red and Gold v Blue, and round three as Blue v Red and Gold v Green. Suppose the scores are Red 2-1 Gold, Green 0-0 Blue, Green 1-3 Red, Gold 2-2 Blue, Blue 1-0 Red and Gold 4-1 Green." },
        { t: "table", head: ["Rank","Team","Played","Won","Drawn","Lost","For","Against","Points"], rows: [["1","Red","3","2","0","1","5","3","6"],["2","Blue","3","1","2","0","3","2","5"],["3","Gold","3","1","1","1","7","5","4"],["4","Green","3","0","1","2","2","7","1"]] },
        { t: "p", x: "That is the table the [round robin generator](/tools/round-robin/) produces with 3 points for a win and 1 for a draw. Red wins on 6 points. If two teams had been level, the next step would be score difference, then scores for, then wins." },
      ] },
      { h2: "Odd numbers: a 5-team example", blocks: [
        { t: "p", x: "With five teams, A to E, there are 5 rounds of 2 matches and one team resting in each round, 10 matches in all. Round one is A v Bye, E v B and C v D, so A rests. Each team rests exactly once." },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: ["Not writing the tie-breakers, so two teams on equal points cause an argument.","Counting the bye as a match.","Using a round robin for a big field. 16 teams need 120 matches.","Forgetting that a match only counts in the table once both scores are entered.","Always listing the same team first and calling it fair."] },
      ] },
    ],
    faq: [
      { q: "How many matches are in a round robin?", a: "n × (n − 1) ÷ 2 for n teams, because every pair plays once. 6 teams play 15 matches, 8 teams play 28 and 16 teams would need 120. Playing everyone twice, home and away, doubles the count. With an even number of teams there are n − 1 rounds. The round robin generator on this site lists every fixture round by round once you paste the team names. Use that number early: it is the first sum that tells you whether a round robin fits your day, or whether groups and a knockout would suit a larger field better." },
      { q: "What do I do with an odd number of teams in a round robin?", a: "Add a dummy team called Bye. Whichever team faces it rests that round. In a single round robin every team gets exactly one bye, and with 5 teams there are 5 rounds of 2 matches, so 10 matches in all. The round robin generator does this for you and shows the empty seat as Bye, which it never mistakes for a team of that name. The bye round is a free rest day for that team, so tell teams in advance when they rest, and do not count a bye as a win or a loss in the table." },
      { q: "How do I decide the order of a league table?", a: "By points first, then tie-breakers written in advance. The generator uses points (3 for a win, 1 for a draw and 0 for a loss by default, all changeable), then score difference, then scores for, then wins, then name, so the same results always give the same table. Write your own order in the rules before the first match. A match counts only when both scores are filled in." },
      { q: "Is there a free round robin generator?", a: "Yes, on this site. Paste your teams, choose whether everyone plays twice, get every fixture round by round, download the fixtures or the table as a CSV file, enter each score as the match finishes and read the league table, which updates immediately. It needs no account and runs in your browser, and you can open the table full screen on a TV with the display screen." },
      { q: "How do I make a round robin fair for home and away?", a: "Alternate which team is listed first so nobody is always home or always second. The generator assigns the first-listed side to whichever team has had it less often, and in a double round robin the second half repeats each pairing with sides swapped. For esports, treat first-listed as the side that picks first, for example the map or side, and say that in the rules." },
      { q: "How long will a round robin take?", a: "Divide the matches by how many can run at once, then add match length and gaps. For example, 6 teams have 15 matches in 5 rounds of 3; with 3 lobbies, 30 minute matches and a 10 minute gap from 10:00, the schedule maker finishes at 13:10 (190 minutes). With one lobby it would take 15 slots. Enter your own numbers to see your finish time. Running more matches at the same time shortens the day, but only as far as the number of matches in a round allows, so check how many lobbies you really have." },
    ],
    related: ["choosing-a-tournament-format", "football-cricket-tournament-maker", "tournament-bracket-template"],
    cta: { label: "Make your fixtures free", href: "/tools/round-robin/" },
  },

  {
    slug: "football-cricket-tournament-maker",
    title: "How to run a football or cricket tournament: groups, knockouts and fixtures",
    seoTitle: "Run a football or cricket tournament: groups, knockout",
    description: "Plan a football, cricket or box-cricket tournament for a college, society or club: how many teams, groups and a knockout, match counts and a free maker.",
    tag: "Organiser guide", minutes: 7, published: PUBLISHED, updated: PUBLISHED,
    answer: "To run a football or cricket tournament, count your teams and pitches, pick a format (a knockout for speed, groups then a knockout for bigger fields), work out the number of matches, and schedule them with real match times. Eight teams in two groups of four plus semi-finals and a final need 15 matches.",
    intro: "The tools on this site were built for esports events, but a tournament is a tournament. Fixtures, brackets and a league table work the same for football, cricket, box cricket, kabaddi or table tennis. This guide covers planning the field, the format and the sums, with the free generators.",
    sections: [
      { h2: "Start with teams, pitches and hours", blocks: [
        { t: "p", x: "Count three things: how many teams, how many pitches or courts you can use at the same time, and how many hours you have. A pitch can host a match, then a gap for the teams to change, then the next. The rest of the planning is arithmetic on those three numbers." },
      ] },
      { h2: "Choose the format", blocks: [
        { t: "ul", items: [
          "Knockout: fastest. For n teams it needs n − 1 matches, but half the teams play only once. Build it with the [bracket maker](/tools/brackets/).",
          "Round robin: every team plays every other team, so n × (n − 1) ÷ 2 matches. Fair for small leagues. Use the [round robin generator](/tools/round-robin/).",
          "Groups then knockout: a round robin in each group, then the best teams play a knockout. The usual choice for 8 to 16 teams.",
        ] },
        { t: "p", x: `Example: 8 teams in two groups of 4. Each group is a round robin of ${matchCount(4)} matches, so ${2 * matchCount(4)} group matches. The top two of each group play two semi-finals and a final: 3 more matches. Total ${2 * matchCount(4) + 3} matches, or ${2 * matchCount(4) + 4} with a third-place match. A full round robin of 8 would take ${matchCount(8)}.` },
      ] },
      { h2: "Fixtures, points and tie-breakers", blocks: [
        { t: "p", x: "Football leagues commonly give 3 points for a win, 1 for a draw and 0 for a loss, and the generator defaults to that. Cricket leagues often use different points and net run rate to separate teams. Whatever your sport, write the points and the tie-breakers in the rules before the first match, and decide what happens in a drawn knockout match: extra time, penalties, a super over or a replay. See the [rules template](/guides/esports-tournament-rules-template/) for how to word it." },
      ] },
      { h2: "Work out the day", blocks: [
        { t: "p", x: "Enter the number of matches, the pitches, the match length and the gap in the [match schedule maker](/tools/schedule/) and read the finish time. Add slack for late teams and injuries. If the finish time does not fit your hours, reduce the number of teams, shorten the matches, or move to a knockout." },
      ] },
      { h2: "Run it", blocks: [
        { t: "ol", items: [
          "Register teams with a short form: team name, captain, players and contact. Use the [registration form](/tools/registration/).",
          "Issue a card or wristband to each player with the [ID card maker](/tools/id-cards/) if you need entry control.",
          "Publish fixtures and update the table after every match. Show it on a screen with the [display screen](/tools/display-screen/).",
          "Print [certificates](/tools/certificates/) for the winners and runners-up.",
        ] },
      ] },
      { h2: "Safety and permission", blocks: [
        { t: "p", x: "Physical sports bring risks that esports do not: injuries, weather and ground rules. Get written permission for the ground, arrange a first-aid contact, decide what happens in bad weather, and ask the college or the ground owner what insurance or approvals they need. This guide does not replace that." },
      ] },
      { h2: "A worked example: eight teams on two pitches", blocks: [
        { t: "p", x: "Eight teams in two groups of four play 12 group matches, then two semi-finals and a final: 15 matches. On two pitches with 40 minute matches and a 10 minute gap starting at 09:00, the [match schedule maker](/tools/schedule/) gives 8 slots and a finish at 15:30. That is 390 minutes with no lunch and no delays, so add a break and slack, or run it over two days." },
        { t: "p", x: "Build each group with the [round robin generator](/tools/round-robin/), take the top two from each, and use the [bracket maker](/tools/brackets/) for the semi-finals and the final." },
      ] },
      { h2: "Checklist and common mistakes", blocks: [
        { t: "ol", items: ["Written permission for the ground and a first-aid contact.","Points, tie-breakers and a rule for drawn knockout matches in the rules.","Fixtures and the schedule published before the first match.","A plan for bad weather.","Cards or wristbands if you need entry control."] },
        { t: "ul", items: ["Choosing a round robin for too many teams.","No rule for a drawn knockout match.","A schedule with no slack for late teams.","Not telling teams how many matches they are guaranteed."] },
      ] },
    ],
    faq: [
      { q: "How many matches does an 8-team tournament need?", a: "It depends on the format. A knockout needs 7 matches. Two groups of four plus semi-finals and a final need 15 (12 group matches and 3 knockout matches), or 16 with a third-place match. A full round robin of 8 teams needs 28. The bracket maker and the round robin generator on this site build the fixtures for any of these, so you can count before you announce." },
      { q: "Can I use these esports tools for football or cricket?", a: "Yes. The bracket maker, round robin generator, match schedule maker, certificate maker and display screen do not depend on the game. They need team names and a points rule. Set 3 points for a win and 1 for a draw for football, or your own points for cricket, and write your tie-breakers into the rules before the first match. The tools never ask which game it is, so the same teams list gives you a knockout, a league or a timed run-sheet, and you can open any of them on a TV or projector." },
      { q: "How do I schedule football or cricket matches on limited pitches?", a: "Enter the number of matches, the number of pitches or courts that can run at once, the match length and the gap in the match schedule maker. It returns a timed run-sheet with the finish time, with optional longer breaks, and you can download it as a CSV file. For example, 15 matches on 2 pitches at 40 minutes with a 10 minute gap from 09:00 end at 15:30. Add slack for late teams and injuries." },
      { q: "What if a knockout match is drawn?", a: "Decide in advance and write it in the rules: extra time, penalties, a super over or a replay, depending on the sport. A knockout needs a winner to fill the next slot in the bracket, so a drawn match cannot be left open. The bracket maker moves whichever team you click forward, so record the result under your rule first. Tell both captains the tie rule before the match starts, not after the final whistle, and have an official ready to record the result and the way it was decided." },
      { q: "How should I split teams into groups?", a: "Use groups of three or four, so each group is a short round robin, and let the best teams from each group enter a knockout. Seed the teams across groups so the strongest are not all in one. Eight teams in two groups of four give 12 group matches; the round robin generator builds each group's fixtures and table. Say how groups are drawn in the rules." },
      { q: "What safety and permission do I need for a physical tournament?", a: "Physical sports bring risks that esports do not: injuries, weather and ground rules. Get written permission for the ground, arrange a first-aid contact, decide what happens in bad weather and ask your college or the ground owner what insurance or approvals they need. This guide does not replace that. For entry control, the ID card maker and gate scanner work for any tournament." },
    ],
    related: ["choosing-a-tournament-format", "round-robin-schedule", "tournament-bracket-template"],
    cta: { label: "Build a bracket for free", href: "/tools/brackets/" },
  },

  {
    slug: "tournament-registration-form-fields",
    title: "Tournament registration form: what to ask, what to leave out and how to approve teams",
    seoTitle: "Tournament registration form: fields to ask and avoid",
    description: "What to put on a tournament registration form for esports and college events: the fields to ask, what to skip, minors, deadlines and how to approve teams.",
    tag: "Tool guide", minutes: 7, published: PUBLISHED, updated: PUBLISHED,
    answer: "A tournament registration form should ask for the team name, the college or club, a captain's contact, each player's name and in-game ID, and whether anyone is under 18. Set a closing date and a team limit, confirm each team in writing, and leave out anything you will not use.",
    intro: "A registration form decides how much chasing you do later. Too few fields and you spend the week messaging captains. Too many and people give up or give you wrong data. This guide lists what to ask for each kind of event, what to leave out, and how to go from a submitted form to an approved roster.",
    sections: [
      { h2: "The fields every form needs", blocks: [
        { t: "table", head: ["Field", "Why you need it"], rows: [
          ["Team name", "How the team appears in brackets and tables"],
          ["College, club or city", "Eligibility and a tie-break for disputes about who a team is"],
          ["Captain's name and phone or email", "The one contact for all messages"],
          ["Each player's name", "Roster, ID cards and certificates"],
          ["In-game name and ID for each player", "How opponents and referees find them in a lobby"],
          ["Substitutes", "So a missing player does not cost the team the match"],
          ["Under-18 flag", "Triggers a guardian's consent"],
          ["Agreement to the rules", "A tick box that links to the rules page"],
        ] },
      ] },
      { h2: "Fields to add by game and event", blocks: [
        { t: "ul", items: [
          "Squad games (such as Free Fire or BGMI): four players and one substitute per squad. See the [Free Fire](/guides/free-fire-tournament-organiser/) and [BGMI](/guides/bgmi-custom-room-tournament/) guides.",
          "5 v 5 games (such as Valorant): five players, one or two substitutes. See the [Valorant guide](/guides/valorant-tournament-organiser/).",
          "Solo events: one player, no captain.",
          "Offline events: a photo for each player, if you will print cards.",
          "Entry fee events: how and when it is paid. Check the rules and law before you take money.",
        ] },
      ] },
      { h2: "What to leave out", blocks: [
        { t: "ul", items: [
          "Government ID numbers, including Aadhaar numbers: you rarely need them, and holding them is a risk.",
          "Home addresses.",
          "Anything you cannot say what you will use it for.",
          "Long free-text questions. A long form lowers completion.",
        ] },
        { t: "note", x: "Tell people on the form what you will do with their details and how long you will keep them. Delete them when the event is over. Our [privacy policy](/privacy/) explains how this site handles data entered in the registration feature." },
      ] },
      { h2: "Open, close and approve", blocks: [
        { t: "ol", items: [
          "Publish the rules with the form, so a tick on the form means something.",
          "Set a team limit and a closing date. Close a day before the event so you can check the list.",
          "Check each registration: spellings, duplicate players, eligibility.",
          "Approve or reject each team and tell the captain in writing, with the schedule and the rules attached.",
          "Keep a waiting list. Teams drop out.",
        ] },
      ] },
      { h2: "Use a ready form", blocks: [
        { t: "p", x: "The [free registration form](/tools/registration/) lets you copy a ready form for squad, 5 v 5, duo or solo events, with no account. With a free account you get a registration link: captains fill in the form on their phone, you set a team limit and a closing time, and an approved team and its players go straight into your roster, ready for [ID cards](/tools/id-cards/) and gate check-in." },
        { t: "p", x: "For the whole event around the form, see [how to run a college tournament](/guides/run-a-campus-tournament/)." },
      ] },
      { h2: "A sample squad form", blocks: [
        { t: "p", x: "For a four-player squad game, a good form has about 25 fields: the squad name, college or city, the captain's name and phone or email, four players (name and in-game name and ID each), one substitute, an under-18 box for each player, and one tick box for the rules. Nothing else. Asking players for a photo is useful only for offline events where you will print cards, and the [ID card maker](/tools/id-cards/) can collect those with an invite link." },
        { t: "table", head: ["Section","Fields"], rows: [["Team","Squad name, college, club or city"],["Contact","Captain's name, phone or email"],["Players","Name, in-game name and ID, under 18 (yes or no), for each of four players"],["Substitute","Name, in-game name and ID"],["Agreement","Tick box that links to the rules"]] },
      ] },
      { h2: "Checklist and common mistakes", blocks: [
        { t: "ol", items: ["Rules published with the form.","Team limit and closing time set.","Each registration checked for duplicate players and spelling.","Every captain told in writing whether they are approved, with the schedule attached.","A waiting list kept."] },
        { t: "ul", items: ["Asking for Aadhaar numbers, addresses or anything you will not use.","A long free-text form that people abandon.","Not saying what you will do with the details.","Closing registration on the morning of the event.","Approving teams by chat message instead of in one list."] },
      ] },
    ],
    faq: [
      { q: "What should a tournament registration form ask?", a: "Team name, college, club or city, the captain's name and phone or email, each player's name and in-game name or ID, substitutes, whether anyone is under 18, and a tick box agreeing to the rules. Add fields by game: four players and a substitute for a squad game, five players for 5 v 5, one player for a solo event. The registration tool on this site gives you a copyable form for squad, 5 v 5, duo or solo events with no account." },
      { q: "Should I collect Aadhaar or other ID numbers on a registration form?", a: "Not unless you truly need them. They are sensitive, a registration rarely needs them and holding them is a risk. Collect only what you will use, say how long you will keep it and delete it when the event is over. If you must verify an ID at a gate, check it by eye and do not copy the number. The ID card maker keeps only the last four digits when it reads an Aadhaar card." },
      { q: "How do I handle players under 18 in registration?", a: "Ask on the form whether any player is under 18, and get a parent or guardian's consent before the event and before printing their card. Record that consent against the player in your roster. In the registration tool captains mark players who are under 18, so you can see at the approval step who still needs consent. Keep the consent as a simple record next to the roster, and do not collect more details about a minor than you would for an adult, because the form only needs what the event itself needs." },
      { q: "Is there a free registration form for esports teams?", a: "Yes. The registration tool on this site gives you a copyable form with no account. With a free account you also get a registration link: captains fill in the form on their phone, you set a team limit and a closing time, and approve or reject each team. An approved team and its players and substitutes go straight into your roster, ready for ID cards and gate check-in." },
      { q: "How do I approve teams and handle a waiting list?", a: "Publish the rules with the form so a tick means something, set a team limit and a closing date, and close a day before the event so you can check the list. Check spellings, duplicate players and eligibility, approve or reject each team and tell the captain in writing with the schedule and rules attached. Keep a waiting list, because teams drop out." },
      { q: "Who can see the contact details people enter?", a: "In the registration feature, contact details are shown only to the organiser of the event and are deleted with the event or your account. They are never shown publicly. The privacy policy explains how this site handles data entered in the registration feature. Tell captains on the form what you will do with their details and how long you will keep them." },
    ],
    related: ["run-a-campus-tournament", "free-fire-tournament-organiser", "player-id-cards", "manage-multiple-games"],
    cta: { label: "Get a free registration form", href: "/tools/registration/" },
  },
];
