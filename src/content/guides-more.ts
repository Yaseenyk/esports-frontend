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
    ],
    faq: [
      { q: "Do I need an app to run a Free Fire tournament?", a: "No. You need custom rooms in the game, a registration form, a points table and a schedule. The free tools on this site cover the last three, and you can use them without an account." },
      { q: "How many matches should a one-day Free Fire event have?", a: "Six matches is a common length. It gives enough games that a single lucky match does not decide the winner, and it can finish in an afternoon. Work out your own finish time with the schedule maker and add slack." },
      { q: "What points scale should I use?", a: "Use the one in your own rules. Official tournaments publish their scales and change them, so copy one only after checking it, and say clearly that yours is a custom scale. The calculator lets you type any scale." },
      { q: "Can I run it with free entry?", a: "Yes, and it is the simplest option. Entry fees and cash prizes raise questions about the publisher's conditions and the law, so check those before you advertise either." },
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
    ],
    faq: [
      { q: "How do I handle more squads than one room can take?", a: "Split them into groups no bigger than a room, give each group the same number of matches, and send the best squads from each group to a final lobby. Seed the squads so the strongest are spread across the groups." },
      { q: "Should the final add up the group stage points?", a: "Either works, but you must choose before the event and write it in the rules. Final-lobby points alone keep the final simple. Adding stage one points rewards consistency but needs a clear explanation for captains." },
      { q: "Is this the official BGMI points system?", a: "No. Use your own scale and say so. Official events publish their own and change them, so the calculator lets you type any scale." },
      { q: "Can I run BGMI tournaments for money?", a: "That depends on the publisher's current conditions and on the law that applies to you. Check both and ask your college before advertising cash prizes or an entry fee. A free-entry event avoids most of that." },
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
    ],
    faq: [
      { q: "How many matches does a 16-team Valorant bracket need?", a: "Single elimination needs 15 matches for 16 teams. Double elimination needs up to 30, or 31 if a reset final is played. Each match can be one map or a best-of series, which multiplies the maps." },
      { q: "Should I use best-of-1 or best-of-3?", a: "Use best-of-1 when time is short and best-of-3 where fairness matters most, such as the semi-finals and the final. Write your choice in the rules before the event." },
      { q: "How do I seed the teams?", a: "Use a fair rule: results of a qualifier, a ranking you can explain, or a random draw. The bracket maker uses standard seeding so that top seeds meet late and byes go to the highest seeds." },
      { q: "Can a free event have prizes?", a: "Yes, but check the publisher's conditions and your college's rules before you advertise any cash. Certificates and non-cash prizes avoid most of the questions." },
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
    ],
    faq: [
      { q: "How many matches are in a single elimination bracket?", a: "For n teams there are n − 1 matches, because each match eliminates exactly one team. 8 teams need 7 matches and 16 teams need 15." },
      { q: "What are byes and who gets them?", a: "A bye lets a team skip the first round when the number of teams is not a power of two. They go to the highest seeds. With 11 teams there are 5 byes, given to seeds 1 to 5." },
      { q: "Is there a free bracket template for Excel or Google Sheets?", a: "You can draw one with the steps above, but a generator is easier because it handles any number of teams. The free bracket maker on this site builds the bracket in your browser and lets you click winners forward." },
      { q: "How should I seed the teams?", a: "Rank them by a fair rule, such as a qualifier or a previous league, and enter them best first. Standard seeding then keeps the top seeds apart until the late rounds." },
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
    ],
    faq: [
      { q: "What size is a standard ID card?", a: "The usual wallet card is about 85.6 × 54 mm. The ID card maker uses 85 × 54 mm for wallet cards and offers other shapes for lanyards, badges and phone passes." },
      { q: "Can I make an official college ID with this?", a: "No. It makes cards for clubs, fests, teams and events. An official college or government ID should follow the format your institution or the issuing authority sets." },
      { q: "Is the ID card maker free?", a: "Yes. It is free and works in the browser without an account. A free account adds saving online and live gate check-in." },
      { q: "Should I print a QR code on it?", a: "If you will check people in at an event, yes. A signed QR code lets the scanner detect a copied or edited card. If the card is only for identification by eye, you can leave it out." },
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
    ],
    faq: [
      { q: "What should an employee ID card show?", a: "A photo, the full name, the role or department, a staff number, the organisation's name and logo and a validity date. Put contact or return information on the back." },
      { q: "Is there a free employee ID card maker?", a: "Yes. The ID card maker on this site is free, runs in the browser and exports a print-ready PDF. It is built for events and teams, so a regulated workplace should check its own requirements first." },
      { q: "Should I put a QR code on a staff card?", a: "Only if something scans it, such as a gate or an attendance check. A signed code lets the scanner detect a copied or edited card." },
      { q: "Can I use a Word template?", a: "You can, using the fields above, but it means filling every card by hand. A generator fills every card from one list." },
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
    ],
    faq: [
      { q: "Can I print ID cards at home?", a: "Yes. Print the PDF at 100% on thick paper or card, cut along the crop marks and laminate or use card holders. It is fine for a one-day event." },
      { q: "How do I get PVC ID cards printed near me?", a: "Search for card printing or PVC card printing in your area, ask for a quote and a proof, and give them the PDF or PNG files from the card maker. Prices and times differ between shops, so ask before you commit." },
      { q: "What size should I print?", a: "Wallet cards are 85 × 54 mm. Choose the shape that fits your lanyard or holder, and always print a test page first." },
      { q: "What is bleed on a printed card?", a: "Bleed is extra background that extends beyond the cut line, so there is no white edge if the cut is slightly off. The card maker offers an optional 3 mm bleed." },
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
    ],
    faq: [
      { q: "How does QR code attendance work?", a: "Each person gets a pass with a QR code. A phone scans it at the door and checks it against the list, marking the person present. A signed code lets the scanner reject a copied or edited pass." },
      { q: "Is there a free QR code attendance system?", a: "The gate scanner on this site is free for events. Make signed passes in the ID card maker and scan them with any phone. It is built for event entry, not for daily class registers." },
      { q: "Does it work without internet?", a: "Yes, with an offline pack made in the ID card maker. In live mode, scans made without a connection are saved on the phone, marked as not verified, and sent when the signal returns." },
      { q: "Is it better than Google Forms?", a: "For a large crowd or access zones, yes: it is faster and detects copies. For a small meeting where everyone knows each other, a form or a paper list is enough." },
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
    ],
    faq: [
      { q: "What should I write on a participation certificate?", a: "The person's name, a sentence such as \"for taking part in {event} on {date}\", the event and organiser, the date and a signature." },
      { q: "Can I make certificates for many people at once?", a: "Yes. Paste the names, one per line, and the certificate maker produces one A4 page per name in a single PDF. About a hundred names per file works well." },
      { q: "Do certificates work with Hindi or Marathi names?", a: "Yes. They are drawn in your browser, so names in Devanagari and other scripts appear as you type them." },
      { q: "What paper and size should I use?", a: "A4 landscape, printed at 100% (not Fit to page), on thick paper for a good finish." },
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
    ],
    faq: [
      { q: "How many matches are in a round robin?", a: "n × (n − 1) ÷ 2 for n teams. 6 teams play 15 matches, 8 teams play 28, and 16 teams would need 120. Playing everyone twice doubles the count." },
      { q: "What do I do with an odd number of teams?", a: "Add a dummy team called Bye. The team that faces it rests that round. Every team gets exactly one bye in a single round robin." },
      { q: "How do I decide the table order?", a: "By points first, then tie-breakers such as score difference, scores for and wins. Write your tie-breakers in the rules before the event." },
      { q: "Is there a free round robin generator?", a: "Yes, on this site. Paste your teams and get every fixture round by round, enter scores and see the league table. It needs no account." },
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
    ],
    faq: [
      { q: "How many matches does an 8-team tournament need?", a: "A knockout needs 7, two groups of four plus semi-finals and a final need 15, and a full round robin needs 28." },
      { q: "Can I use the esports tools for football or cricket?", a: "Yes. The bracket maker, round robin generator, schedule maker, certificate maker and display screen do not depend on the game. Set your own points and tie-breakers." },
      { q: "How do I schedule matches on limited pitches?", a: "Enter the number of matches, pitches, match length and gap in the schedule maker. It returns a timed run-sheet and the finish time, which you can download." },
      { q: "What if a knockout match is drawn?", a: "Decide in advance and write it in the rules: extra time, penalties, a super over or a replay, depending on the sport." },
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
    ],
    faq: [
      { q: "What should a tournament registration form ask?", a: "Team name, college or club, the captain's contact, each player's name and in-game ID, substitutes, and whether anyone is under 18. Add a tick box for the rules." },
      { q: "Should I collect Aadhaar or other ID numbers?", a: "Not unless you truly need them. They are sensitive, and a registration rarely needs them. Collect only what you will use and say how long you will keep it." },
      { q: "How do I handle players under 18?", a: "Ask on the form and get a parent or guardian's consent before the event, and before printing their card." },
      { q: "Is there a free registration form for esports?", a: "Yes. The registration tool on this site gives you a copyable form with no account, and a registration link with approvals if you create a free account." },
    ],
    related: ["run-a-campus-tournament", "free-fire-tournament-organiser", "player-id-cards", "manage-multiple-games"],
    cta: { label: "Get a free registration form", href: "/tools/registration/" },
  },
];
