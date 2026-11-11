import type { Block, Guide } from "./guides";
import { EXAMPLE_SCALE, standings, type TeamEntry } from "@/lib/points";
import { BYE, BYE_LABEL, DEFAULT_POINTS, fixtures, matchCount, table, type Score } from "@/lib/roundrobin";
import { buildSchedule, summary } from "@/lib/schedule";

/**
 * Growth guides (Nov 2026): poster, custom-room, cricket-table, fixture and Hinglish how-to guides.
 * Same rules as guides-more.ts: worked examples are computed with the tools' own code; nothing about a publisher's current rules, prize money, laws or dates unless certain.
 * Where a publisher's rules matter the guide tells the reader to check the publisher's own page.
 * Language note: the page template marks every guide inLanguage en-IN, so the two Hinglish guides (Roman script) carry that value too.
 */
const PUBLISHED = "2026-11-12";

// --- Custom room results example (4 squads, 3 matches). The tie for first is broken by the same rules as the calculator.
const ROOM_TEAMS: TeamEntry[] = [
  { name: "Night Owls", matches: [{ placement: 2, kills: 4 }, { placement: 1, kills: 7 }, { placement: 3, kills: 3 }] },
  { name: "Red Fang", matches: [{ placement: 1, kills: 5 }, { placement: 4, kills: 2 }, { placement: 2, kills: 6 }] },
  { name: "Blue Hawks", matches: [{ placement: 3, kills: 6 }, { placement: 2, kills: 3 }, { placement: 1, kills: 5 }] },
  { name: "Storm Five", matches: [{ placement: 4, kills: 1 }, { placement: 3, kills: 4 }, { placement: 4, kills: 2 }] },
];
const ROOM = standings(ROOM_TEAMS, EXAMPLE_SCALE);
const roomInput: Block = {
  t: "table",
  head: ["Team", "Match 1 (place, kills)", "Match 2 (place, kills)", "Match 3 (place, kills)"],
  rows: ROOM_TEAMS.map((t) => [t.name, ...t.matches.map((m) => `${m.placement}, ${m.kills}`)]),
};
const roomTable: Block = {
  t: "table",
  head: ["Rank", "Team", "Match 1", "Match 2", "Match 3", "Total"],
  rows: ROOM.map((s) => [String(s.rank), s.name, ...s.perMatch.map(String), String(s.total)]),
};
const roomScale: Block = {
  t: "table",
  head: ["Placement", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th or lower"],
  rows: [["Points", ...EXAMPLE_SCALE.placement.map(String), "0"]],
};
const tied = ROOM.filter((s) => s.tied);
const roomTie = `${tied[0]!.name} and ${tied[1]!.name} both finish on ${tied[0]!.total} points, with ${tied[0]!.wins} win and ${tied[0]!.kills} kills each. The next tie-breaker is the placement in the last match: ${ROOM[0]!.name} finished ${ROOM[0]!.lastPlacement === 1 ? "1st" : `#${ROOM[0]!.lastPlacement}`} in match 3 and ${ROOM[1]!.name} finished #${ROOM[1]!.lastPlacement}, so ${ROOM[0]!.name} ranks first.`;

// --- Custom room schedule: 24 squads, an assumed 12 squads per room, 3 rounds, two rooms at once.
const SQUADS = 24, PER_ROOM = 12, ROUNDS = 3;
const ROOMS = SQUADS / PER_ROOM;
const ROOM_MATCHES = ROOMS * ROUNDS;
const ROOM_PLAN_IN = { start: "14:00", matches: ROOM_MATCHES, duration: 30, gap: 10, lobbies: ROOMS, breakEvery: 0, breakLength: 0 };
const ROOM_PLAN = buildSchedule(ROOM_PLAN_IN)!;
const ROOM_SUM = summary(ROOM_PLAN_IN, ROOM_PLAN);
const ROOM_SINGLE_IN = { ...ROOM_PLAN_IN, matches: ROUNDS, lobbies: 1 };
const ROOM_SINGLE = summary(ROOM_SINGLE_IN, buildSchedule(ROOM_SINGLE_IN)!);

// --- Cricket league: four teams, single round robin, runs entered as scores, 2 points for a win, 1 for a tie or no result.
const CRICKET_TEAMS = ["Lions XI", "Tigers XI", "Bears XI", "Wolves XI"];
const CRICKET_POINTS = { win: 2, draw: 1, loss: 0 };
const CRICKET_ROUNDS = fixtures(CRICKET_TEAMS);
// Scores in the order the generator lists the fixtures (runs): round 1, round 2, round 3.
const CRICKET_SCORES: Score[][] = [
  [{ a: 142, b: 120 }, { a: 98, b: 131 }],
  [{ a: 110, b: 145 }, { a: 133, b: 133 }],
  [{ a: 150, b: 139 }, { a: 101, b: 120 }],
];
const CRICKET_TABLE = table(CRICKET_TEAMS, CRICKET_ROUNDS, CRICKET_SCORES, CRICKET_POINTS);
const cricketResults: Block = {
  t: "table",
  head: ["Round", "Match", "Runs entered"],
  rows: CRICKET_ROUNDS.flatMap((rd, ri) => rd.map((f, fi) => [String(ri + 1), `${f.a} v ${f.b}`, `${CRICKET_SCORES[ri]![fi]!.a} to ${CRICKET_SCORES[ri]![fi]!.b}`])),
};
const cricketTable: Block = {
  t: "table",
  head: ["Rank", "Team", "Played", "Won", "Tied", "Lost", "Points", "Run difference"],
  rows: CRICKET_TABLE.map((r) => [String(r.rank), r.team, String(r.played), String(r.won), String(r.drawn), String(r.lost), String(r.points), String(r.diff)]),
};

// --- Fixture example: five teams (odd), so one team sits out each round.
const FIX_TEAMS = ["Alpha", "Bravo", "Charlie", "Delta", "Echo"];
const FIX = fixtures(FIX_TEAMS);
const lab = (n: string) => (n === BYE ? BYE_LABEL : n);
const fixTable: Block = {
  t: "table",
  head: ["Round", "Match 1", "Match 2", "Sits out"],
  rows: FIX.map((rd, i) => {
    const real = rd.filter((f) => f.a !== BYE && f.b !== BYE).map((f) => `${f.a} v ${f.b}`);
    const out = rd.find((f) => f.a === BYE || f.b === BYE)!;
    return [String(i + 1), real[0]!, real[1]!, lab(out.a === BYE ? out.b : out.a)];
  }),
};

export const GROWTH_GUIDES: Guide[] = [
  // ------------------------------------------------------------------ 1
  {
    slug: "free-fire-tournament-poster",
    title: "Free Fire tournament poster: what to put on it",
    seoTitle: "Free Fire tournament poster: what to put on it",
    description: "What a Free Fire tournament poster needs: the event name, date, prize, entry steps and sponsor logos, in the order players read it, with a free poster maker.",
    tag: "Poster guide", minutes: 6, published: PUBLISHED, updated: PUBLISHED,
    answer: "A Free Fire tournament poster needs the event name, the date and time, the prize, who can play, how to register and one contact, in that order of size. Keep one message per poster, check the game publisher's rules before you use its artwork, and finish with a QR code to the sign-up.",
    intro: "A poster has about three seconds to answer one question: should I enter? Most Free Fire tournament posters fail because they hold too much, or hide the date. This guide lists what to put on it, in what order, and what to leave out. You can then lay it out with the free [poster maker](/tools/poster/).",
    sections: [
      { h2: "Decide what the poster has to do", blocks: [
        { t: "p", x: "Pick one job: get squads to register, tell people where to watch, or announce the winners. A registration poster and a results poster are different pages. If you try to do both, nobody reads either." },
        { t: "p", x: "Also decide where it will be seen. A poster pinned in a canteen is read from a metre away. A poster shared on WhatsApp or Instagram is read on a phone screen, so the text must still be readable when the picture is small." },
      ] },
      { h2: "What to put on it, in order of size", blocks: [
        { t: "ol", items: [
          "The event name, as the biggest text. Add the game name next to it so people know at a glance that this is for Free Fire.",
          "The date, day of the week and start time. Write the date in full so nobody confuses day and month.",
          "The prize, if there is one. Write what you will really give. If you have no cash prize, say certificates, trophies or goodies, whichever is true.",
          "Who can play: squad or solo, college or open, any age limit. Under-18 players need a guardian's consent, so say so if it applies.",
          "How to register: a short link or a QR code, and the closing date.",
          "One contact: a name and a phone number or handle that will be answered.",
          "Sponsor logos in a quiet strip at the bottom, not competing with the event name.",
        ] },
        { t: "note", x: "Free Fire and its logos belong to their publisher. Check the publisher's current rules before you use official artwork, characters or logos on a poster, and say clearly that your event is not run by the publisher." },
      ] },
      { h2: "Layout rules that work on a phone", blocks: [
        { t: "ul", items: [
          "Use at most two fonts and three colours. A dark background with one bright accent colour is easy to read on screens.",
          "Make the event name at least three times the size of the body text. If it is not obvious from across a table, it is too small.",
          "Leave empty space around the date and the prize. Space is what makes them stand out.",
          "Put the QR code on a plain light square with a clear margin and test it with two phones before you print or post.",
          "Do not put long rules on the poster. Link to the rules page and keep the poster for the headline facts.",
        ] },
      ] },
      { h2: "A worked layout", blocks: [
        { t: "p", x: "Here is the copy for a poster for a college event, with each line labelled by how big it should be. Replace each line with your own facts: the example shows the order, not real details." },
        { t: "table", head: ["Size", "Line", "Why it is there"], rows: [
          ["Largest", "Your event name + Free Fire", "The first thing read, and it names the game"],
          ["Large", "Saturday, full date, start time", "Answers: when do I turn up?"],
          ["Large", "Prize line, written exactly as you will give it", "Answers: what do I get?"],
          ["Medium", "Squad of four, college teams, closing date", "Answers: can my team enter?"],
          ["Medium", "QR code and short link", "Answers: how do I enter?"],
          ["Small", "Contact name and number", "Answers: who do I ask?"],
          ["Small, bottom strip", "Sponsor logos", "Thanks sponsors without hiding the event"],
        ] },
      ] },
      { h2: "Make it with the free poster maker", blocks: [
        { t: "ol", items: [
          "Open the [poster maker](/tools/poster/) and pick a template for your game.",
          "Type the event name, date, prize and contact, and add sponsor logos if you have permission to use them.",
          "Download the image and check it on a phone before you share it.",
          "Share it in the team group chats and print a few copies for the notice board.",
        ] },
        { t: "p", x: "Once teams are in, the same event can use the [registration form](/tools/registration/) for sign-ups and the [points table](/points-table/free-fire/) for results. For the whole event, read [how to run a Free Fire tournament](/guides/free-fire-tournament-organiser/)." },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: [
          "Putting the date in small text at the bottom.",
          "Promising a prize in big letters before you have the money or the sponsor confirmed.",
          "Using official game art without checking the publisher's rules.",
          "A QR code that is too small, too dark or on a busy photo, so it does not scan.",
          "No contact, so questions come to the organiser's personal inbox at midnight.",
          "Sharing a low quality screenshot of the poster instead of the original file.",
        ] },
      ] },
      { h2: "Before you post it", blocks: [
        { t: "ol", items: [
          "Read every number aloud: date, time, closing date, phone number.",
          "Ask one person who has not seen it to say what the event is in one sentence.",
          "Scan the QR code from the printed copy and from the phone screen.",
          "Keep the editable version so you can change the date when plans move.",
        ] },
      ] },
    ],
    faq: [
      { q: "What should a Free Fire tournament poster include?", a: "Put the event name and the game first, then the date and start time, the prize, who can play, how to register with a link or QR code, and one contact person. Add sponsor logos in a quiet strip at the bottom. Keep rules off the poster and link to them instead. The free poster maker on this site gives you a layout with these parts in the right order, so you only type your own facts and check them on a phone before sharing." },
      { q: "Can I use official Free Fire artwork and logos on my poster?", a: "Check the game publisher's current rules before you do. Publishers set their own conditions for fan events, and those conditions change, so this guide does not quote them. A safe default is to design your own layout with your own event name, say clearly that the event is not run or endorsed by the publisher, and avoid presenting your event as official. If you are unsure, ask the publisher through its support or community channel before you print." },
      { q: "What size should a tournament poster be?", a: "Make the file big enough that text stays sharp where it will be seen. For WhatsApp and Instagram a portrait or square image is easy to read on a phone, and for a notice board you print on A4 or A3 paper. Keep the key facts large and central so cropping on a different app does not cut them off. Use the poster maker, download the image, and look at it at the small size a phone shows before you share it." },
      { q: "How do I put a registration QR code on the poster?", a: "Create a short sign-up link first, for example from the registration tool on this site or a form you already use, then turn it into a QR code and place it on a plain light square with a clear margin. Test it with two different phones, from the screen and from a printed copy, before you share. Write the short link in text next to the code so people who cannot scan can still type it, and put the closing date beside it." },
      { q: "Should I write the prize amount on the poster?", a: "Only if you will really pay it and you are allowed to run an event with that prize. Write exactly what players get: cash, certificates, trophies or goodies. Do not round up or promise a prize that depends on a sponsor you have not confirmed. Check the game publisher's rules and your college's rules on prizes and entry fees before you advertise any figure, and keep the same wording on the poster, the registration page and the rules." },
      { q: "What do I do after players see the poster and register?", a: "Confirm every team in writing, send the rules and the schedule, and make ID cards and passes so the gate is quick. Use the registration tool to collect squads, the ID card maker for cards, and a points table to publish results the same day. The poster brings people in, but the event is judged on how well the day runs, so plan the schedule with the match schedule maker early." },
    ],
    related: ["free-fire-tournament-organiser", "college-fest-esports-poster", "run-a-campus-tournament"],
    cta: { label: "Make your poster free", href: "/tools/poster/" },
  },

  // ------------------------------------------------------------------ 2
  {
    slug: "cricket-tournament-poster-ideas",
    title: "Cricket tournament poster ideas for college and local leagues",
    seoTitle: "Cricket tournament poster ideas for leagues and fests",
    description: "Cricket tournament poster ideas that work: what to write, how to lay it out for WhatsApp and the notice board, and a free poster maker for local leagues.",
    tag: "Poster guide", minutes: 6, published: PUBLISHED, updated: PUBLISHED,
    answer: "A cricket tournament poster should show the tournament name, the dates, the venue, the entry fee if there is one, the team rules and how to register. Use one strong image or colour, big dates, and a QR code for sign-up. Put your sponsors in a quiet strip at the bottom.",
    intro: "Cricket posters go on gate walls, college notice boards and WhatsApp groups, often all in the same week. The ones that fill a tournament are simple: a clear name, a date, a ground and a way to enter. This guide gives you ideas for the layout and the words, and the free [poster maker](/tools/poster/) puts them together.",
    sections: [
      { h2: "Start with the facts, not the picture", blocks: [
        { t: "p", x: "Before any design, write the facts in a note: tournament name, format (for example tennis-ball, box cricket or leather-ball, whichever you really play), number of overs, team size, dates, venue, entry fee, prize and the closing date for teams. A poster is only as good as these facts." },
        { t: "p", x: "Write only what is decided. If the overs or the ball are not fixed yet, fix them first, because a poster you have to correct is a poster people stop trusting." },
      ] },
      { h2: "Five poster ideas", blocks: [
        { t: "ul", items: [
          "The big date: the dates take half the poster, the name sits above them. Good for a one-weekend tournament.",
          "The scoreboard look: lay out the facts like a scoreboard, with rows for date, venue, fee and prize. Easy to scan and fits cricket.",
          "The team sheet: a list of the first fixtures or the groups, useful for a second poster once teams are confirmed.",
          "The single photo: one strong action photo you have the right to use, with the text in a solid band. Do not use match photos of professional players unless you have permission.",
          "The sponsor poster: the sponsor's colour leads, the event name is still the largest text, and the logo has room around it.",
        ] },
        { t: "note", x: "Use only images and logos you have the right to use. Logos of leagues, boards or teams belong to their owners, so check their rules before you put them on your poster and say that your event is independent." },
      ] },
      { h2: "What to write on it", blocks: [
        { t: "ol", items: [
          "Tournament name, with the sport word (cricket) in it so people know at a glance.",
          "Dates and match times, written in full.",
          "Venue with the area or landmark, so a stranger can find it.",
          "Format in one line: for example eight teams, two groups of four, then semi-finals and a final.",
          "Entry fee and prize, if any, written exactly as they will be given.",
          "Registration link or QR code and the closing date.",
          "Contact person and number.",
        ] },
      ] },
      { h2: "A worked example: make the format line true", blocks: [
        { t: "p", x: `Suppose you write eight teams in two groups of four. Each group is a round robin of ${matchCount(4)} matches, so the groups need ${2 * matchCount(4)} matches. Add two semi-finals and a final and the tournament is ${2 * matchCount(4) + 3} matches in all. Before you print "two days", check that the number of matches fits your ground and your hours with the [match schedule maker](/tools/schedule/).` },
        { t: "p", x: "That one check stops the most common poster lie: promising a format that the ground and the daylight cannot hold. See [how to run a football or cricket tournament](/guides/football-cricket-tournament-maker/) for the same sums in more detail." },
      ] },
      { h2: "Layout for WhatsApp and the notice board", blocks: [
        { t: "ul", items: [
          "Make the tournament name and dates readable at thumbnail size. Open the image on a phone and shrink it to check.",
          "Keep text away from the edges, because apps crop square and portrait images differently.",
          "Use two colours and one font family. Dark text on a light band or light text on a dark band both work: pick the one with strong contrast.",
          "Print a few A4 copies for notice boards and keep the editable file for corrections.",
        ] },
      ] },
      { h2: "After the poster: sign-ups and the table", blocks: [
        { t: "p", x: "Put a link or QR code that goes to a real sign-up, such as the [registration form](/tools/registration/). When teams are confirmed, build fixtures with the [round robin generator](/tools/round-robin/) and publish the points after each match. The [cricket league points table guide](/guides/cricket-league-points-table/) explains how to keep that table honest." },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: [
          "Printing the poster before the dates and the ground are confirmed.",
          "Using a logo of a league or a player without permission.",
          "No venue landmark, so teams arrive at the wrong gate.",
          "Writing the prize as a big number you cannot yet guarantee.",
          "Forgetting the closing date for registration.",
          "Sending a screenshot that is already compressed twice.",
        ] },
      ] },
    ],
    faq: [
      { q: "What should I write on a cricket tournament poster?", a: "Write the tournament name with the word cricket in it, the dates and match times, the venue with a landmark, the format in one line, the entry fee and prize exactly as they will be given, the registration link or QR code with its closing date, and one contact number. Sponsor logos go in a quiet strip at the bottom. The free poster maker on this site gives you these fields in a sensible order, and you can check the result on your phone before sharing." },
      { q: "How do I choose the format line for a local cricket tournament?", a: "Count your teams, your pitches and your daylight, then check that the match count fits. Eight teams in two groups of four plus two semi-finals and a final is 15 matches, and a full round robin of eight is 28. The round robin generator and the match schedule maker on this site show the counts and the finish time. Put only a format you can really finish on the poster, and say how many matches each team is guaranteed." },
      { q: "Can I use photos of famous cricketers or league logos on my poster?", a: "Only if you have permission. Photos of professional players, and the logos of leagues, boards and teams, belong to their owners and have their own conditions, so check the owner's page before you use them. The safe route is your own photo of your own ground, an illustration you made, or a plain colour design, plus a line that your tournament is independent. The poster maker lets you build a clean layout without any of those." },
      { q: "What is the best way to share the poster?", a: "Share the original image file, not a screenshot, in the college group chats and on social media, and print a few A4 copies for the notice board. Make sure the name and dates are readable when the image is shrunk to thumbnail size, and put the link in text under the image because many apps do not let people tap a QR code. Keep the editable version so you can correct the date or the venue quickly if plans change." },
      { q: "Do I need a registration form as well as a poster?", a: "Yes, because a poster only gets attention and a form collects the teams. Ask for the team name, captain's contact, the players' names and the closing date, and for anyone under 18 get a guardian's consent. The registration tool on this site gives you a form you can copy, and with a free account a link where captains register and you approve each team. Link to it from the QR code on the poster." },
      { q: "How do I show the points table after matches start?", a: "Enter the results after each match and publish the table the same day. The round robin generator on this site builds fixtures and a league table from the scores you enter, and the display screen can show it full screen on a TV. For cricket, say in your rules how points are awarded and how ties between teams are decided, because the tool ranks by points and then run difference, not by net run rate." },
    ],
    related: ["cricket-league-points-table", "football-cricket-tournament-maker", "free-fire-tournament-poster"],
    cta: { label: "Make a cricket poster free", href: "/tools/poster/" },
  },

  // ------------------------------------------------------------------ 3
  {
    slug: "college-fest-esports-poster",
    title: "How to design a college fest esports poster",
    seoTitle: "College fest esports poster: how to design one",
    description: "Design a college fest esports poster that gets squads to register: the content, the layout, the permissions to check and a free poster maker to build it.",
    tag: "Poster guide", minutes: 6, published: PUBLISHED, updated: PUBLISHED,
    answer: "A college fest esports poster has to fit inside the fest's look and still say one thing clearly: which game, which day, how to enter. Get the fest committee's logo and approval first, use one bright accent on a dark layout, and add a QR code that goes to the sign-up.",
    intro: "At a fest, your esports event competes with dance, music and food for attention. The poster is your only chance to say why a gamer should walk over. This guide covers the content, the layout and the approvals that a fest poster needs, and shows how to build it quickly with the free [poster maker](/tools/poster/).",
    sections: [
      { h2: "Get the approvals before the design", blocks: [
        { t: "p", x: "A fest poster speaks for the college, so ask three things before you start: who approves posters, whether the fest logo and sponsor logos are ready to use, and whether outside participants are allowed. The poster must not promise anything the college has not agreed to." },
        { t: "ul", items: [
          "Ask the committee for the official fest logo and the colours or fonts they want used.",
          "Ask which sponsors must appear, and in what order or size.",
          "Ask whether the college wants a faculty name or a department on it.",
          "If you plan prizes or an entry fee, ask what the college allows before you print either.",
        ] },
      ] },
      { h2: "One game, one poster", blocks: [
        { t: "p", x: "If your fest has Valorant, BGMI, Free Fire and a chess event, make a poster for each game plus one overview poster. A single page listing five games makes the reader work out which one is theirs." },
        { t: "p", x: "Name the game in the largest line. Gamers search and scroll by game, so the game name is the hook." },
      ] },
      { h2: "What goes on a fest esports poster", blocks: [
        { t: "ol", items: [
          "The fest name and the event name together, for example the fest first and the game below it.",
          "The game and the format: squads of four, five against five, solo.",
          "Date, time and venue inside the campus: a building or room name people can find.",
          "Who may enter: your college only, or other colleges too, and the ID they must carry.",
          "Prize and entry fee, written exactly as they will be given, and only if the college agreed.",
          "A QR code and a short link to the [registration form](/tools/registration/), with the closing date.",
          "A contact: a student coordinator's name and number, and a faculty contact if the college asks.",
          "The fest and sponsor logos along the bottom.",
        ] },
        { t: "note", x: "Game names and logos belong to their publishers. Check the publisher's page before you use official art, and add a line that the event is run by your college and is not affiliated with the publisher." },
      ] },
      { h2: "Making esports feel like part of the fest", blocks: [
        { t: "p", x: "Use the fest's colours as your accent and keep the dark, high-contrast background that suits gaming. That way the poster looks like it belongs on the same wall as the other events and still looks like a gaming poster." },
        { t: "p", x: "Add one line that says what a visitor can do even if they are not playing: watch on a big screen, cheer for their department, or see the final. Fest audiences are mostly spectators, and a spectator line grows the crowd." },
      ] },
      { h2: "Build it and plan the day", blocks: [
        { t: "ol", items: [
          "Collect the logos, the dates and the registration link first.",
          "Build the poster in the [poster maker](/tools/poster/), one per game.",
          "Get it approved by the committee before you print or post.",
          "Share it as an image in groups and print A4 or A3 copies for the notice boards.",
          "Plan the rest of the event with [how to run a college esports tournament](/guides/run-a-campus-tournament/).",
        ] },
      ] },
      { h2: "A worked example of the timeline", blocks: [
        { t: "p", x: `Say the fest has two esports days and each game has 16 teams in a single elimination bracket. That is ${16 - 1} matches per game. With two matches running at a time, 60 minutes each and a 10 minute gap, the [match schedule maker](/tools/schedule/) tells you how long a game needs. Do this sum before you print dates on a poster, so the poster promises a day that the schedule can hold.` },
        { t: "p", x: "Once the bracket is real, use the [bracket maker](/tools/brackets/) and show it on the display screen at the venue." },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: [
          "Printing before the committee approves the poster.",
          "Listing every game on one poster so none stands out.",
          "No venue detail, so teams ask for directions on the day.",
          "A prize or fee that the college did not agree to.",
          "Sponsor logos larger than the event name.",
          "A QR code on a busy background that does not scan.",
        ] },
      ] },
    ],
    faq: [
      { q: "Who should approve a college fest esports poster?", a: "Ask the fest committee or your faculty contact before you design, because the poster speaks for the college. Find out whether the college wants a particular logo, colour or sponsor order, whether outside participants may enter and whether prizes or an entry fee are allowed. Get the final poster approved before you print or post it. Keeping the editable file in the free poster maker makes corrections quick if the committee asks for a change." },
      { q: "Should I make one poster for all esports games at the fest?", a: "Make one poster per game and one overview poster. A poster that lists five games makes readers work out which one is theirs, while a poster for one game names it in the largest line and gets straight to the date, the format and the sign-up. The poster maker on this site lets you reuse the same layout and change the game, the date and the QR link for each event, so the extra posters take minutes." },
      { q: "How do I make the poster look like part of the fest?", a: "Use the fest's logo, colours and fonts as the accent and keep a dark, high-contrast background that suits gaming. Put the fest name and the event name together at the top, and place the fest and sponsor logos in a strip at the bottom. Ask the committee for the official logo files so nothing is stretched or redrawn. The result should look like it belongs with the fest's other posters while the game name still stands out." },
      { q: "Can I use game logos and official artwork on the poster?", a: "Check the game publisher's current rules first, because publishers set their own conditions for events and those change. A safe approach is your own layout, the name of the game in plain text, and a line that your event is run by your college and is not affiliated with the publisher. If you want to use official art, ask the publisher through its support or community page and keep the answer in writing." },
      { q: "What should the QR code on the poster open?", a: "A real sign-up page: for example the registration form from this site, where a captain enters the team name, contact and players. Test the code with two phones from the screen and from the printed poster, and write the short link next to it for people who cannot scan. Put the closing date beside it. With a free account the registration link lets you approve each team into your roster, so you do not retype anything." },
      { q: "How early should the poster go out?", a: "Early enough that teams can form and sign up before the closing date, which for a fest usually means a few weeks, but fix the date from your own schedule. Release the poster only after the date, the venue and the permission are settled, and send a follow-up poster when the bracket or groups are ready. Build the plan backwards from the event day using the planner and the schedule maker on this site." },
    ],
    related: ["free-fire-tournament-poster", "run-a-campus-tournament", "sponsor-pitch"],
    cta: { label: "Design the poster free", href: "/tools/poster/" },
  },

  // ------------------------------------------------------------------ 4
  {
    slug: "pubg-mobile-custom-room-results",
    title: "PUBG Mobile custom room results: how to record and share them",
    seoTitle: "PUBG Mobile custom room results: record and share",
    description: "How to record PUBG Mobile and BGMI custom room results, work out a points table with tie-breakers and share it as an image, with a worked example and free tools.",
    tag: "How-to", minutes: 8, published: PUBLISHED, updated: PUBLISHED,
    answer: "To record custom room results, note each team's placement and kills after every match, keep a screenshot of the result screen as proof, and add the points with a scale you published before the event. Rank by total points, break ties by a written rule, and share the table as an image.",
    intro: "Custom room tournaments are easy to start and easy to argue about. The arguments are almost always about results: who finished where, how many kills, and why one team ranks above another. This guide shows how to record results cleanly, work out the table with the free [BGMI points table](/points-table/bgmi/) tools, and share the standings without a fight.",
    sections: [
      { h2: "Before the first match: publish the scale and the tie-breakers", blocks: [
        { t: "p", x: "A points table is only fair if teams know the rules first. Publish three things with your rules: points for each placement, points for each kill, and how ties are broken. Teams should be able to work out their own score." },
        { t: "p", x: "This guide uses an example scale of 10, 6, 5, 4, 3, 2, 1, 1 points for the first eight placements and 1 point per kill. It is an example for a custom room, not any publisher's official table. Official tournaments publish their own scales, so check the publisher's page if you want to match one, and set your own scale to match your rules." },
        roomScale,
      ] },
      { h2: "What to record after every match", blocks: [
        { t: "ol", items: [
          "Take a screenshot of the in-game result screen for every team, as soon as the match ends. Ask the room's referee, not each captain, to collect them.",
          "Write the placement and the kill count for every team in a sheet or in the points table tool.",
          "Ask captains to confirm within a short fixed time, for example before the next match starts. After that the result stands.",
          "Keep the screenshots until the event is over and any dispute is closed.",
        ] },
        { t: "p", x: "Record placement and kills separately and let the tool add them. Typing the total by hand is where most mistakes come from." },
      ] },
      { h2: "A worked example: four teams, three matches", blocks: [
        { t: "p", x: "Here are the results of a small custom room. Each cell is the placement and the number of kills in that match." },
        roomInput,
        { t: "p", x: "With the example scale, the points table from the same code the calculator runs is:" },
        roomTable,
        { t: "p", x: roomTie },
        { t: "p", x: "This is why the tie-break order must be written down before the event: two teams on the same points need a rule, not an argument. The calculator on this site breaks ties by wins, then kills, then placement in the last match, then name, so the order is always the same for the same input. Copy that order into your rules or write your own." },
      ] },
      { h2: "Use the free tools", blocks: [
        { t: "ol", items: [
          "Open the [points table calculator](/tools/points-table/) or the [BGMI points table page](/points-table/bgmi/).",
          "Enter your scale, then the team names, then the placement and kills for each match.",
          "Check the totals against your screenshots for any team that questions a result.",
          "Download the standings or open the display screen to show them on a TV or a stream.",
          "Share the table as an image in the captains' group, and keep the CSV for your records.",
        ] },
        { t: "p", x: "The [points table guide](/guides/points-table/) explains the scale and the tie-breakers in more depth, and [how to run a BGMI custom room tournament](/guides/bgmi-custom-room-tournament/) covers the rooms themselves." },
      ] },
      { h2: "Sharing the results", blocks: [
        { t: "ul", items: [
          "Share the table as an image after each match so captains can see it update. Write the match number on the image.",
          "Post the final table once, with the scale and the tie-breakers underneath, so anyone can verify it.",
          "Do not edit a published result silently. If a mistake is found, post a corrected table and say what changed.",
          "Show the live table on a screen at the venue with the [display screen](/tools/display-screen/).",
        ] },
      ] },
      { h2: "Disputes without drama", blocks: [
        { t: "p", x: "Decide who rules on disputes (one named person), the time limit for raising one, and what counts as proof (the result screenshot or a recording). Say it in the rules. When a captain questions a result, compare their claim with the screenshot and change the table only if the proof supports it." },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: [
          "Changing the points scale after seeing the results.",
          "Having no written tie-breaker.",
          "Recording only the totals, so mistakes cannot be traced.",
          "Letting every captain report their own kills with no screenshot.",
          "Sharing a table without saying which matches it covers.",
          "Quoting a publisher's official scale from memory instead of checking the publisher's page.",
        ] },
      ] },
    ],
    faq: [
      { q: "How do I record PUBG Mobile custom room results fairly?", a: "After every match, one referee takes a screenshot of the result screen and writes each team's placement and kills into the points table tool, and captains confirm within a fixed time. The tool adds placement points and kill points with the scale you published, so nobody types a total by hand. Keep the screenshots until the event is over. This gives every captain a way to check a result against proof and lets you answer a dispute in a minute." },
      { q: "What points scale should I use for a custom room tournament?", a: "Use any scale you publish before the event and apply it to every match. This guide's example gives 10, 6, 5, 4, 3, 2, 1 and 1 points for the first eight places and 1 point per kill, but that is only an example. Official tournaments publish their own scales, so check the publisher's page if you want to match one. The points table calculator lets you change the placement points and the points per kill." },
      { q: "How do I break a tie between two teams?", a: "Write the order in your rules before the first match. The calculator on this site uses more wins first, then more kills, then the better placement in the last match, then the team name so the order never changes. You can copy that order or write your own, for example most kills first. What matters is that captains see the rule in advance, so a tie is settled by the rule and not by the organiser's opinion." },
      { q: "Can I share the points table on WhatsApp?", a: "Yes. Share the table as an image in the captains' group after each match, with the match number written on it, and post the final table once with the scale and the tie-breakers below it. The display screen and share options on this site produce images and a full-screen view for a TV or stream. If a mistake is found, post a corrected table and say what changed, rather than editing an old image." },
      { q: "What should I do if a captain disputes a result?", a: "Name one person who rules on disputes, set a short time limit to raise one and decide what counts as proof, normally the result screenshot or a recording, and write all of it in the rules. Compare the captain's claim with the proof and change the table only if the proof supports it. Then publish the corrected table with a note. Keeping placement and kills recorded separately makes the check quick." },
      { q: "Does the points table tool work for BGMI and Free Fire too?", a: "Yes. The calculator takes placement and kills per match and a scale you can change, so it suits BGMI, PUBG Mobile, Free Fire and other battle royale formats. The game-specific pages are at the BGMI and Free Fire points table links in this guide. Where a game publisher publishes an official scale, check the publisher's page and enter that scale yourself, because the calculator's example values are only an example." },
    ],
    related: ["points-table", "bgmi-custom-room-tournament", "run-a-custom-room-tournament", "free-fire-tournament-organiser"],
    cta: { label: "Open the points table", href: "/tools/points-table/" },
  },

  // ------------------------------------------------------------------ 5
  {
    slug: "run-a-custom-room-tournament",
    title: "How to run a custom room tournament, step by step",
    seoTitle: "Run a custom room tournament: step-by-step plan",
    description: "Run a custom room tournament for BGMI, Free Fire or any battle royale: how many rooms, rules, schedule, results and a points table, with a worked time plan.",
    tag: "Organiser guide", minutes: 9, published: PUBLISHED, updated: PUBLISHED,
    answer: "To run a custom room tournament, decide how many squads each room can hold, split the squads into rooms, publish the rules and the points scale, schedule every round with real gaps, appoint one referee per room and record placement and kills after every match. Publish the table the same day.",
    intro: "A custom room tournament is a battle royale event where the organiser creates the rooms and the players join with a room ID and password. It needs no hardware and is why so many college and community events run on it. It also fails in predictable ways: late joiners, unclear rules and results nobody can check. This guide gives the order of work.",
    sections: [
      { h2: "1. Fix the numbers first", blocks: [
        { t: "p", x: "Find out from the game itself how many squads or players a custom room can hold and which room settings you can control, because games and versions differ. This guide uses an assumed room size so the sums are visible: check the real figure in the game before you plan." },
        { t: "ul", items: [
          "Number of squads you will accept, and the team size.",
          "How many squads one room holds in your game.",
          "How many rooms you can run at the same time, which depends on how many referees and spare accounts or devices you have.",
          "Number of rounds each squad plays.",
        ] },
      ] },
      { h2: "2. Work out rooms and matches", blocks: [
        { t: "p", x: `Example: ${SQUADS} squads, a room that holds ${PER_ROOM} squads (assumed), and ${ROUNDS} rounds. That needs ${ROOMS} rooms per round and ${ROOM_MATCHES} matches in total. If the rooms run at the same time, the matches go in ${ROOM_SUM.slots} slots.` },
        { t: "p", x: `With 30 minute matches and a 10 minute gap, starting at 14:00, the [match schedule maker](/tools/schedule/) gives ${ROOM_SUM.slots} slots and a finish at ${ROOM_SUM.finish}, which is ${ROOM_SUM.totalMinutes} minutes. If you had only one room at a time, the same ${ROUNDS} slots would not be enough: the ${ROOM_MATCHES} matches would take ${summary({ ...ROOM_PLAN_IN, lobbies: 1 }, buildSchedule({ ...ROOM_PLAN_IN, lobbies: 1 })!).finish} to finish. That one number often decides whether you need a second referee.` },
        { t: "p", x: `Remember that this is the best case. Add time for squads who join late, a room restart and a break. Rounds of ${ROOM_SINGLE.slots} slots like this one assume nothing goes wrong.` },
      ] },
      { h2: "3. Write the rules and the points scale", blocks: [
        { t: "p", x: "Start from the [tournament rules template](/guides/esports-tournament-rules-template/) and add the battle royale parts: team size and substitutes, the points for each placement and each kill, tie-breakers, how late a squad can be, what happens if a player disconnects, and what is considered cheating. Check the game publisher's page for any conditions on running tournaments before you advertise prizes." },
      ] },
      { h2: "4. Register squads and make the room lists", blocks: [
        { t: "ol", items: [
          "Collect squads with the [registration form](/tools/registration/): team name, captain's contact, in-game IDs and substitutes.",
          "Confirm each squad in writing with the rules and the schedule attached.",
          "Split squads into rooms. For a fair split, draw the rooms in front of the captains or use a published random order. Rotate the rooms in later rounds if the format allows.",
          "Give each room one referee who owns the room ID and password and sends them to captains at a set time, not earlier.",
        ] },
      ] },
      { h2: "5. Run each match to a checklist", blocks: [
        { t: "ol", items: [
          "Referee creates the room and sends the ID and password to captains only.",
          "Squads join, the referee checks every player against the roster, and anyone not registered is removed.",
          "Start the match at the published time. Late squads miss it, as the rules say.",
          "At the end, the referee screenshots the result screen for every squad.",
          "The referee enters placement and kills into the [points table](/tools/points-table/) and captains confirm.",
        ] },
        { t: "note", x: "Custom-room features and limits differ by game and change with updates. Test your setup in the real game a few days before the event." },
      ] },
      { h2: "6. Publish results as you go", blocks: [
        { t: "p", x: "After each round, share the table as an image and show it on a screen with the [display screen](/tools/display-screen/). The detailed method is in [recording and sharing custom room results](/guides/pubg-mobile-custom-room-results/). For game-specific tables see [BGMI](/points-table/bgmi/) and [Free Fire](/points-table/free-fire/)." },
      ] },
      { h2: "7. Finish properly", blocks: [
        { t: "p", x: "Publish the final table with the scale underneath, announce winners the same day and print [certificates](/tools/certificates/) for the top squads and participants. Keep the screenshots and the roster until any dispute is closed." },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: [
          "Planning from the match length alone and forgetting joining time and gaps.",
          "Sharing the room ID in a big public group, so outsiders join.",
          "One person trying to referee several rooms at once.",
          "Changing the scale or the tie-breaker after matches start.",
          "No screenshots, so a result cannot be checked.",
          "Not testing the room settings in the real game beforehand.",
        ] },
      ] },
    ],
    faq: [
      { q: "How many squads should I put in one custom room?", a: "Use the number your game actually allows in a custom room, which differs by game and version, so check it in the game before you plan. Then divide your squads by that number to get rooms per round, multiply by rounds to get the total matches, and put the match count into the match schedule maker with the number of rooms you can run at once. If the finish time is too late, add a referee and a room, or reduce the rounds." },
      { q: "How do I stop outsiders joining my custom room?", a: "Send the room ID and password only to captains, at a set time, and have the referee check every player against the roster before the match starts. Do not post the details in a public group. Remove anyone who is not registered. Registering with a form and confirming each squad in writing gives the referee a list to check, and ID cards or a pass link help at an in-person event." },
      { q: "How long does a custom room tournament take?", a: "Work it out from your own numbers. Enter the total matches, the match length, the gap between matches and the number of rooms running at once into the match schedule maker and read the finish time. Then add slack for late squads, restarts and breaks, because the tool shows the best case. A tournament that looks fine at the match length alone often takes almost twice as long once joining and results are counted." },
      { q: "What rules should a battle royale custom room tournament have?", a: "Cover team size and substitutes, the points for each placement and each kill, tie-breakers, how late a squad may be, what happens when a player disconnects, what counts as cheating and who decides disputes. The tournament rules template on this site gives you a base to edit. Check the game publisher's page for conditions on tournaments and prizes before you advertise, because they differ by publisher and change." },
      { q: "How do I make the rooms fair?", a: "Draw the room split in front of the captains or by a random order you publish, and rotate the rooms in later rounds if your format allows. Keep the same points scale and the same rules in every room, give each room one referee, and collect a result screenshot after every match. Fairness here mostly means that every squad can see how the result was decided and can check it." },
      { q: "What do I need to publish at the end?", a: "The final table with the points scale and the tie-breakers underneath, the winners, and a note of any corrections made during the event. The points table tool exports standings, the display screen shows them full screen, and the certificate maker prints one page per name for winners and participants. Keep the roster and the screenshots until disputes are closed, then delete personal details you no longer need." },
    ],
    related: ["pubg-mobile-custom-room-results", "bgmi-custom-room-tournament", "free-fire-tournament-organiser", "esports-tournament-rules-template"],
    cta: { label: "Plan the matches and rooms", href: "/tools/schedule/" },
  },

  // ------------------------------------------------------------------ 6
  {
    slug: "cricket-league-points-table",
    title: "Cricket league points table: how to keep one that is fair",
    seoTitle: "Cricket league points table: wins and points explained",
    description: "How to keep a cricket league points table for a college or society tournament: points per win, ties, tie-breakers and what our tool does not compute (net run rate).",
    tag: "How-to", minutes: 7, published: PUBLISHED, updated: PUBLISHED,
    answer: "A cricket league points table lists each team's matches played, won, tied, lost and points. Choose the points for a win, a tie and a no-result before the league starts, and write the tie-breaker in the rules. The free round robin tool ranks by points, then run difference. It does not compute net run rate.",
    intro: "A local cricket league needs one page every team trusts: the points table. This guide explains how to build one for a college, society or box cricket league from wins and points, and is honest about a limit: the round robin tool on this site does not calculate net run rate, so if your league uses it you must work it out yourself.",
    sections: [
      { h2: "What a points table has to show", blocks: [
        { t: "ul", items: [
          "Team name.",
          "Matches played, won, tied or drawn, and lost.",
          "Points: the number the league is decided by.",
          "A tie-breaker figure, if two teams can finish level.",
        ] },
        { t: "p", x: "Keep the columns the same every week so teams can check their own row." },
      ] },
      { h2: "Choose the points before the first match", blocks: [
        { t: "p", x: "Pick the points for a win, a tie and a loss, and decide what a no-result or abandoned match (for example because of rain) gives. A common simple choice is 2 points for a win, 1 for a tie or no-result and 0 for a loss, but it is your league: write down whatever you choose." },
        { t: "note", x: "Official cricket competitions publish their own points and tie-break rules, and those change between competitions. Do not copy one from memory. If you want to follow a particular competition, read its current rules on the organiser's page." },
      ] },
      { h2: "Fixtures first", blocks: [
        { t: "p", x: `Generate the fixtures with the [round robin generator](/tools/round-robin/). Four teams playing each other once is ${matchCount(4)} matches in ${CRICKET_ROUNDS.length} rounds. If the number of teams is odd, one team sits out each round. Choose single or double (home and away) before you start: double doubles the matches to ${matchCount(4, true)} for four teams.` },
      ] },
      { h2: "A worked example: four teams, runs entered", blocks: [
        { t: "p", x: `The generator listed these matches. The runs below were entered as the two scores, and the points were set to ${CRICKET_POINTS.win} for a win, ${CRICKET_POINTS.draw} for a tie and ${CRICKET_POINTS.loss} for a loss.` },
        cricketResults,
        { t: "p", x: "The tool built this table from those results with the same code as the page:" },
        cricketTable,
        { t: "p", x: `${CRICKET_TABLE[0]!.team} lead with ${CRICKET_TABLE[0]!.points} points. Note that the final column is run difference, which is runs scored minus runs conceded across the matches entered. That is not net run rate.` },
      ] },
      { h2: "What the tool does not do: net run rate", blocks: [
        { t: "p", x: "Net run rate compares the rate of runs scored per over with the rate conceded, and it needs the overs faced and bowled in every innings. The round robin tool only has two scores per match, so it cannot calculate it. If your league uses net run rate to separate teams, work it out in a spreadsheet and put the final order in your published table by hand." },
        { t: "p", x: "If you do not need net run rate, the easiest honest tie-breakers are the ones the tool can apply: points, then run difference, then runs scored, then wins, then name. Say that in your rules, so no team is surprised." },
        { t: "p", x: "If you only want a wins table, enter 1 and 0 as the scores. Then points come from wins and ties and the tie-breaker is simply the number of wins minus losses." },
      ] },
      { h2: "Keep the table honest", blocks: [
        { t: "ol", items: [
          "Enter a result only when both scores are final. The tool counts a match only when both scores are filled in.",
          "Photograph or save the scorebook page for each match.",
          "Update and share the table after every match day, with the date on it.",
          "If a score is corrected, post a corrected table and say what changed.",
          "Show it on a big screen at the ground with the [display screen](/tools/display-screen/).",
        ] },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: [
          "Not deciding what a rained-off match gives.",
          "Letting two teams finish level with no written tie-breaker.",
          "Copying another competition's rules from memory.",
          "Entering a score before the match is finished.",
          "Using net run rate in the rules but never calculating it.",
        ] },
      ] },
    ],
    faq: [
      { q: "How do I make a cricket league points table for free?", a: "Generate the fixtures with the round robin generator, play the matches and enter both scores after each one. The tool builds the table with matches played, won, tied, lost and points, and you can set the points for a win, a tie and a loss to match your rules. Share the table after every match day and show it on a TV with the display screen. Decide the points and the tie-breaker before the first match." },
      { q: "Does the points table calculate net run rate?", a: "No. Net run rate needs the overs faced and bowled in every innings, and the tool on this site only stores two scores per match, so it ranks by points, then run difference, then runs scored, then wins, then name. If your league uses net run rate, calculate it in a spreadsheet and enter the final order in your published table yourself. Say in your rules which tie-breaker you use, so teams know before the first match." },
      { q: "How many points should a win and a tie give?", a: "Whatever your league decides, and it should be written before the first match. A simple choice many local leagues use is 2 points for a win, 1 for a tie or no-result and 0 for a loss, but official competitions publish their own rules and change them, so check the organiser's page if you want to follow one. In the round robin tool you can set the points for a win, a draw and a loss." },
      { q: "What happens if a match is rained off?", a: "Decide it in your rules before the season starts. Common options are to share points, to replay the match or to give no points, depending on whether the league can fit a replay. Because the tool counts a match only when both scores are entered, you can leave a rained-off match empty until the decision is made. Then enter it the way your rule says and tell both captains." },
      { q: "How do I break a tie between two teams on the same points?", a: "Write the order in your rules first. The tool applies run difference (runs scored minus runs conceded), then runs scored, then wins, then the team name so the order never changes. That is not net run rate, which some leagues prefer. If you prefer another order, rank by it in a spreadsheet and publish that table. Do not change the order after the season starts." },
      { q: "How many matches will my league have?", a: "For n teams playing each other once there are n times n minus 1, divided by 2 matches, so 4 teams play 6, 6 teams play 15 and 8 teams play 28. Playing home and away doubles that. The round robin generator shows the count and builds the rounds, and the match schedule maker turns the count into a timed day. If the total is too many for your ground, use groups and a knockout instead." },
    ],
    related: ["round-robin-schedule", "football-cricket-tournament-maker", "cricket-tournament-poster-ideas", "fixture-maker-for-football-and-cricket"],
    cta: { label: "Build the fixtures and table", href: "/tools/round-robin/" },
  },

  // ------------------------------------------------------------------ 7
  {
    slug: "fixture-maker-for-football-and-cricket",
    title: "Fixture maker for football and cricket: make a league schedule",
    seoTitle: "Fixture maker for football and cricket leagues",
    description: "Make fixtures for a football or cricket league: how round robin fixtures work, how byes handle odd teams, how many matches you need and a free fixture generator.",
    tag: "How-to", minutes: 7, published: PUBLISHED, updated: PUBLISHED,
    answer: "To make fixtures for a football or cricket league, list the teams and let a round robin generator pair every team with every other team in rounds. An odd number of teams means one team sits out each round. n teams playing once need n times (n minus 1) divided by 2 matches.",
    intro: "Making fixtures by hand goes wrong in a familiar way: one team plays twice in a day and another never gets a Sunday. A round robin generator removes the mistakes. This guide explains what a fixture list is, how to work out the number of matches, and how to use the free [round robin generator](/tools/round-robin/) for football, cricket, kabaddi or any head-to-head game.",
    sections: [
      { h2: "What a fixture list is", blocks: [
        { t: "p", x: "A fixture list says who plays whom and in which round. In a round robin every team plays every other team. A round is a set of matches where each team plays at most once, so a round can be one match day." },
      ] },
      { h2: "Count the matches first", blocks: [
        { t: "p", x: `For n teams playing each other once there are n × (n − 1) ÷ 2 matches. Four teams need ${matchCount(4)}, five need ${matchCount(5)}, six need ${matchCount(6)} and eight need ${matchCount(8)}. Playing home and away doubles it: six teams need ${matchCount(6, true)}.` },
        { t: "p", x: "If the count is bigger than your ground and daylight can hold, split the teams into groups and play a short knockout afterwards. See [choosing a tournament format](/guides/choosing-a-tournament-format/) for how to decide." },
      ] },
      { h2: "A worked example: five teams", blocks: [
        { t: "p", x: `Five teams is an odd number, so every round one team sits out. The generator creates ${FIX.length} rounds of ${FIX[0]!.filter((f) => f.a !== BYE && f.b !== BYE).length} matches each: ${matchCount(5)} matches in all, and every team sits out exactly once.` },
        fixTable,
        { t: "p", x: "That is the same output the tool gives for the same five names. The tool also balances which team is listed first in each match, so nobody is always second." },
        { t: "p", x: "The team listed first can be treated as the home side or as the side that bats or kicks off first. Say which meaning you use in the rules." },
      ] },
      { h2: "Make your own fixtures", blocks: [
        { t: "ol", items: [
          "Open the [round robin generator](/tools/round-robin/).",
          "Type or paste the team names, one per line.",
          "Choose single (once) or double (home and away).",
          "Read the rounds and copy or download them.",
          "Enter the scores as matches are played to get the league table.",
          "Use the [match schedule maker](/tools/schedule/) to turn the matches into times on the day.",
        ] },
      ] },
      { h2: "Football and cricket details to decide", blocks: [
        { t: "ul", items: [
          "Points: football leagues commonly use 3 for a win, 1 for a draw and 0 for a loss, which is the tool's default. Cricket leagues choose their own points. Write yours in the rules.",
          "Draws and ties in knockout matches: extra time, penalties, a super over or a replay, whichever fits the sport.",
          "Tie-breakers: the tool ranks by points, then score difference, then scores for, then wins. If you use net run rate in cricket, work it out yourself: see the [cricket league points table guide](/guides/cricket-league-points-table/).",
          "Pitches: how many matches can run at the same time, and the length and the gap between them.",
        ] },
      ] },
      { h2: "When a round robin is the wrong choice", blocks: [
        { t: "p", x: "A round robin is fair, but the number of matches grows fast. For more than eight teams, or a one-day event, a knockout from the [bracket maker](/tools/brackets/) or groups then a knockout is usually better. The [football and cricket tournament guide](/guides/football-cricket-tournament-maker/) shows the sums for both." },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: [
          "Making fixtures by hand and putting a team in two matches in one round.",
          "Forgetting that an odd number of teams means a team sits out each round.",
          "Not deciding the points and tie-breakers first.",
          "Publishing fixtures without the date and pitch.",
          "Planning home and away without counting the doubled matches.",
        ] },
      ] },
    ],
    faq: [
      { q: "How do I make fixtures for a football or cricket league?", a: "List the teams in the round robin generator, choose single or home and away, and read the rounds it creates. Each round has every team playing at most once, and the tool builds the league table as you enter scores. Then use the match schedule maker to put times on the matches. It works for football, cricket, kabaddi and any game with head-to-head matches, because it only needs team names and a points rule." },
      { q: "How many matches does a league of 4, 6 or 8 teams need?", a: "For n teams playing each other once, n times n minus 1, divided by 2. So 4 teams play 6 matches, 5 teams play 10, 6 teams play 15, 8 teams play 28 and 10 teams play 45. Home and away doubles the number. If the count is too big for your ground and your daylight, use groups followed by a short knockout, and compare the options with the format guide on this site." },
      { q: "What happens when there is an odd number of teams?", a: "One team sits out each round, because someone has no opponent. With five teams there are five rounds of two matches and every team sits out once, so the ten matches are all played. The generator shows the team that sits out as a bye. Plan for it: the team that sits out in a round should not always be the one whose players have the hardest day, so check the byes against your venue and your exam dates." },
      { q: "Can the fixture maker also give me a league table?", a: "Yes. After you enter the scores, the tool builds a table with matches played, won, drawn, lost, points, score difference and rank. A match counts only when both scores are entered. You set the points for a win, a draw and a loss, and the table is ranked by points, then score difference, then scores for, then wins. It does not compute net run rate, so cricket leagues using it must work it out themselves." },
      { q: "Should the team listed first be the home team?", a: "Only if your rules say so. The tool balances which team is listed first so nobody is always second, and you can treat the first team as the home side, the side that kicks off, or the side that bats first, but you must say which. In a neutral-ground tournament the order may mean nothing. Write the meaning in the rules next to the fixtures so there is no argument on the day." },
      { q: "How do I turn fixtures into a timetable?", a: "Count the matches, the number of pitches or courts that can run at once, the match length and the gap, and put them in the match schedule maker. It returns a timed run-sheet and the finish time, and you can download it. Then match the fixture rounds to the time slots, and add slack for late teams and bad weather. Share the fixtures with the date and pitch on them." },
    ],
    related: ["round-robin-schedule", "football-cricket-tournament-maker", "cricket-league-points-table"],
    cta: { label: "Make fixtures free", href: "/tools/round-robin/" },
  },

  // ------------------------------------------------------------------ 8 (Hinglish)
  {
    slug: "id-card-kaise-banaye",
    title: "ID card kaise banaye: free me player ID card banane ka tarika",
    seoTitle: "ID card kaise banaye: free ID card maker guide",
    description: "ID card kaise banaye: event, college ya esports tournament ke liye free me ID card banane ka simple tarika, QR code, printing aur gate check-in ke saath.",
    tag: "Hinglish guide", minutes: 6, published: PUBLISHED, updated: PUBLISHED,
    answer: "ID card banane ke liye pehle players ki list taiyaar karo (naam, team, role aur photo), phir ID card maker me design chuno, card check karo aur print ya PDF download karo. Har card par QR code lagao taaki gate par jaldi check ho sake.",
    intro: "Agar aapko college event, esports tournament ya club ke liye ID card chahiye, to koi bada software ya designer zaroori nahi hai. Is guide me hum simple Hinglish me batate hain ki ID card kaise banaye, kya likhna hai aur kaise print karna hai, free [ID card maker](/tools/id-cards/) ke saath.",
    sections: [
      { h2: "Pehle ye tay karo: card kiske liye hai", blocks: [
        { t: "p", x: "Sabse pehle socho ki card kis kaam ka hai. Player ka card, staff ka card aur guest ka pass alag ho sakte hain. Card par sirf wahi cheez likho jo gate par kaam aaye: naam, team, role aur QR code." },
        { t: "p", x: "Agar kisi ki umar 18 saal se kam hai, to unke parent ya guardian ki permission lena mat bhulna." },
      ] },
      { h2: "Card par kya likhna chahiye", blocks: [
        { t: "ul", items: [
          "Event ka naam aur date.",
          "Player ya person ka naam, saaf aur bade akshar me.",
          "Team ka naam aur role (player, substitute, coach, staff, volunteer).",
          "Photo, agar aapko chahiye. Photo bhi sirf wahi lo jiski permission mili ho.",
          "QR code, jo gate par scan hoga.",
        ] },
        { t: "note", x: "Aadhaar number ya koi aur ID number card par mat chhapo jab tak sach me zaroorat na ho. Jitna kam personal data, utna safe." },
      ] },
      { h2: "Step by step: free me ID card banao", blocks: [
        { t: "ol", items: [
          "[ID card maker](/tools/id-cards/) kholo. Koi account banane ki zaroorat nahi hai, ye browser me chalta hai.",
          "Teams aur players ka naam type karo, ya spreadsheet se import karo.",
          "Ek ready-made design chuno. Is site par 23 designs hain, aur har cheez ko move, recolour ya delete kar sakte ho.",
          "Card ka shape chuno: wallet card, lanyard badge, wristband ya digital pass.",
          "Har card ko ek baar dhyaan se padho: naam ki spelling, team, role.",
          "Print karne ke liye A4 sheet ya PDF download karo.",
        ] },
        { t: "p", x: "Har card par ek signed QR code hota hai. Nakli QR code gate par reject ho jaata hai, aur ek hi pass dobara scan karne par flag ho jaata hai." },
      ] },
      { h2: "Gate par check-in kaise hoga", blocks: [
        { t: "p", x: "Event wale din ek phone me [gate check-in scanner](/tools/check-in/) kholo. Har card ka QR scan karo. Scanner signal na ho tab bhi chalta hai: scan phone me wait karte hain aur internet aate hi send ho jaate hain." },
        { t: "p", x: "Pura tarika padhna ho to [gate check-in guide](/guides/event-gate-checkin/) dekho." },
      ] },
      { h2: "Print karne ke tips", blocks: [
        { t: "ul", items: [
          "Card ek-do din pehle print karo, event wali subah nahi.",
          "Pehle sirf ek page print karke test karo: size aur QR dono check karo.",
          "Moti paper ya card sheet use karo, aur lanyard ke liye hole ki jagah chhodo.",
          "Kuch extra card print karke rakho, spelling ki galti ya naye log ke liye.",
          "Print dukaan ko PDF do, phone ka screenshot nahi.",
        ] },
        { t: "p", x: "PVC card ya student card ka format dekhna ho to [student ID card format](/guides/student-id-card-format/) aur [player ID cards guide](/guides/player-id-cards/) padho." },
      ] },
      { h2: "Ek chhota example", blocks: [
        { t: "p", x: "Maan lo aapke college me ek Free Fire tournament hai aur 16 teams hain. Har team me 4 players aur 1 substitute, yaani 5 log. 16 teams ke 80 card bante hain. Staff aur volunteers ke card alag. List me sab ki spelling pehle check kar lo, phir ek saath sab card banao: ek-ek kar ke banane se zyada galtiyan hoti hain." },
      ] },
      { h2: "Aam galtiyan", blocks: [
        { t: "ul", items: [
          "Naam ya team ki spelling galat hona.",
          "QR code chhota ya dhundhla print karna.",
          "Event ki subah print karna.",
          "Zaroorat se zyada personal data card par daalna.",
          "Bina test ke saare card print kar dena.",
        ] },
      ] },
    ],
    faq: [
      { q: "ID card free me kaise banaye?", a: "Is site ka ID card maker browser me chalta hai aur uske liye account nahi chahiye. Aap teams aur players ka naam type karte ho ya spreadsheet se import karte ho, ek design chunte ho, aur har person ka card ban jaata hai. Phir A4 sheet print karo ya PDF download karo. Print karne se pehle ek card dhyaan se check karo: naam, team, role aur QR code sab saaf dikhna chahiye." },
      { q: "ID card par kya kya likhna chahiye?", a: "Event ka naam aur date, person ka naam, team ka naam, role, photo agar zaroorat ho, aur ek QR code. Bas itna kaafi hai. Aadhaar ya koi aur ID number tab tak mat likho jab tak sach me zaroorat na ho, kyunki jitna kam personal data hoga utna safe rahega. Agar koi 18 saal se chhota hai to parent ya guardian ki permission pehle le lo. Card ka text itna bada rakho ki gate par door se bhi padha ja sake, aur print se pehle poori list ek baar kisi doosre se bhi check karwa lo." },
      { q: "QR code ka kya fayda hai?", a: "QR code se gate par card ek second me scan ho jaata hai aur naam, team aur role phone par dikh jaate hain. Is site ke cards par signed QR code hota hai, to nakli code reject ho jaata hai, aur ek hi card dobara scan hone par flag ho jaata hai. Isse bina permission ke substitute ya bahar ke log andar nahi aa paate. Scanner offline bhi chalta hai. Event ke baad bhi ye list kaam aati hai: kitne log aaye, ye saaf pata chal jaata hai." },
      { q: "Kitne card ek page par print ho sakte hain?", a: "Ye card ke shape aur size par depend karta hai: wallet card, lanyard badge aur wristband alag size ke hote hain. ID card maker A4 sheet par card laga deta hai, aur aap PDF ya images ka zip download kar sakte ho. Pehle ek page test print karke dekho ki size aur QR sahi hain, phir baaki print karo. Print dukaan ko PDF hi do. Agar card kam padein to extra sheet nikalna bhi aasan hai, kyunki design save rehta hai." },
      { q: "Kya photo lagana zaroori hai?", a: "Nahi. Photo optional hai. Agar aapko gate par chehra match karna hai to photo lagao, warna naam, team aur QR code se kaam chal jaata hai. Photo sirf unhi ki lo jinhone permission di hai, aur kisi chhote bachche ki photo ke liye parent ya guardian ki permission zaroori hai. Photo ki quality achhi ho to card par saaf dikhti hai. Agar photo na ho, to card par team ka rang ya role ka label lagao, taaki guard ek nazar me pehchan le." },
      { q: "Card kab tak print kar lene chahiye?", a: "Event se kam se kam ek-do din pehle. Subah print karne par spelling ki galti ya printer ki problem ka time nahi bachta. Kuch extra card bhi print karke rakho, naye log ya galti ke liye. Poori planning ke liye run-a-campus-tournament wali guide me four-week timeline di hai, aur gate ka test bhi event se pehle ek baar kar lo. Printer ya paper ki problem aaye to bhi time bacha rehta hai." },
    ],
    related: ["player-id-cards", "student-id-card-format", "event-gate-checkin", "certificate-kaise-banaye"],
    cta: { label: "ID card free me banao", href: "/tools/id-cards/" },
  },

  // ------------------------------------------------------------------ 9 (Hinglish)
  {
    slug: "certificate-kaise-banaye",
    title: "Certificate kaise banaye: winner aur participation certificate",
    seoTitle: "Certificate kaise banaye: free certificate maker",
    description: "Certificate kaise banaye: winner aur participation certificate free me banane ka tarika, kya likhna hai, kitne naam ek saath aur print ke liye PDF.",
    tag: "Hinglish guide", minutes: 6, published: PUBLISHED, updated: PUBLISHED,
    answer: "Certificate banane ke liye event ka naam, date, person ka naam, kis cheez ke liye certificate hai aur signature ki jagah chahiye. Naam ki list certificate maker me daalo, design chuno aur ek saath sabke liye ek print-ready PDF download karo.",
    intro: "Tournament ya event ke baad winners aur participants ko certificate dena achha lagta hai, lekin ek-ek naam type karke certificate banana bahut time leta hai. Is guide me simple Hinglish me batate hain ki certificate kaise banaye, kya likhna hai aur free [certificate maker](/tools/certificates/) se sabke certificate ek saath kaise nikalte hain.",
    sections: [
      { h2: "Pehle ye tay karo: kaunse certificate chahiye", blocks: [
        { t: "ul", items: [
          "Winner certificate: pehle, doosre aur teesre sthaan ke liye.",
          "Participation certificate: har us person ke liye jo event me shamil hua.",
          "Volunteer ya organiser certificate: jinhone event chalane me madad ki.",
        ] },
        { t: "p", x: "Har type ke liye wording alag hoti hai, isliye pehle types tay karo aur phir naam ki alag-alag list banao." },
      ] },
      { h2: "Certificate par kya likhna chahiye", blocks: [
        { t: "ol", items: [
          "Heading: Certificate of Achievement ya Certificate of Participation.",
          "Person ka poora naam, saaf aur bade akshar me.",
          "Kis cheez ke liye: jaise Free Fire College Cup me pehla sthaan.",
          "Event ka naam, date aur jagah.",
          "Organiser ka naam aur signature ke liye khaali jagah.",
          "Sponsor ya college ka logo, agar permission ho.",
        ] },
        { t: "note", x: "Sirf wahi likho jo sach hai. Agar kisi ne pehla sthaan nahi jeeta, to winner certificate nahi dena. Tareekh aur naam ki spelling do baar check karo." },
      ] },
      { h2: "Step by step: free me certificate banao", blocks: [
        { t: "ol", items: [
          "[Certificate maker](/tools/certificates/) kholo. Ye browser me chalta hai, account zaroori nahi.",
          "Event ka naam, date aur certificate ka text likho.",
          "Naamon ki list paste karo, ek line me ek naam.",
          "Design chuno aur dekho ki naam acchi tarah fit ho raha hai.",
          "Sabke liye ek hi print-ready PDF download karo: har naam ke liye ek page.",
          "Pehle ek page print karke test karo, phir baaki print karo.",
        ] },
        { t: "p", x: "Wording ke ideas chahiye to [certificate wording guide](/guides/certificate-wording/) padho." },
      ] },
      { h2: "Print aur signature", blocks: [
        { t: "ul", items: [
          "Achhe paper par print karo, aur signature pen se haath se karo to certificate zyada khaas lagta hai.",
          "Agar organiser ya faculty ki signature chahiye, to event se pehle time le lo.",
          "Digital copy bhi bhejo, kyunki log use WhatsApp ya LinkedIn par share karte hain.",
          "Print dukaan ko PDF do, screenshot nahi.",
        ] },
      ] },
      { h2: "Ek chhota example", blocks: [
        { t: "p", x: "Maan lo ek tournament me 16 teams hain, har team me 4 players. Participation certificate ke liye 64 naam ki list banti hai, aur top 3 teams ke 12 players ko winner certificate milta hai. Aap do list banate ho: ek winner aur ek participation. Certificate maker se 64 aur 12 page ka PDF turant ban jaata hai, aur aapko ek-ek naam type nahi karna padta. Naam ki list [registration form](/tools/registration/) se hi le lo, taaki spelling wahi rahe jo players ne likhi thi." },
      ] },
      { h2: "Aam galtiyan", blocks: [
        { t: "ul", items: [
          "Naam ki spelling galat hona. Hamesha registration wali list se naam lo.",
          "Event ke baad bahut der se certificate dena.",
          "Winner aur participation ka wording ek hi rakhna.",
          "Naam bahut lamba ho to design me fit na hona: pehle test karo.",
          "Signature ke bina certificate print kar dena.",
        ] },
      ] },
      { h2: "Certificate ke saath aur kya banaye", blocks: [
        { t: "p", x: "Event ke liye [ID card maker](/tools/id-cards/) se card banao, aur [ID card kaise banaye](/guides/id-card-kaise-banaye/) wali guide padho. Poore event ki planning ke liye [college tournament guide](/guides/run-a-campus-tournament/) dekho." },
      ] },
    ],
    faq: [
      { q: "Certificate free me kaise banaye?", a: "Is site ka certificate maker browser me chalta hai aur uske liye account nahi chahiye. Event ka naam, date aur certificate ka text likho, naamon ki list paste karo aur ek design chuno. Phir sabke liye ek hi PDF download karo jisme har naam ka alag page hota hai. Print se pehle ek page test karke dekho ki naam sahi fit ho raha hai aur spelling sahi hai." },
      { q: "Certificate par kya kya likhna chahiye?", a: "Heading, person ka poora naam, kis cheez ke liye certificate hai, event ka naam, date aur jagah, aur organiser ka naam ya signature ki jagah. Logo tabhi lagao jab uski permission ho. Sirf wahi likho jo sach hai, jaise winner certificate sirf winner ko. Spelling aur date do baar check karo, kyunki galat naam wala certificate dobara print karna padta hai." },
      { q: "Ek saath bahut saare certificate kaise banaye?", a: "Naamon ki list paste karo, ek line me ek naam, aur certificate maker har naam ke liye ek page banakar ek hi print-ready PDF de deta hai. Winner aur participation ki alag list banao taaki wording alag ho sake. Naam registration form ki list se lo, taaki spelling wahi ho jo players ne likhi thi, aur pehle ek page print karke test kar lo. Agar koi naam baad me jodna ho, to list me ek line badhao aur PDF dobara download kar lo." },
      { q: "Winner aur participation certificate me kya fark hota hai?", a: "Winner certificate kisi sthaan ya achievement ke liye hota hai, jaise pehla sthaan, aur participation certificate us har person ke liye hota hai jo event me shamil hua. Dono ki wording alag rakho. Winner certificate sirf unhe do jinhone sach me jeeta hai. Organiser ya volunteer ke liye alag certificate bhi ban sakta hai, jisme unka kaam likha ho. Dono ke design alag rakhne se pehchan aasan hoti hai, aur log certificate ko value dete hain." },
      { q: "Certificate par signature kaise karaye?", a: "Event se pehle organiser ya faculty se time le lo, kyunki signature ke liye unki availability chahiye. Certificate maker signature ki jagah chhod deta hai, aur print ke baad aap pen se haath se sign karwa sakte ho. Agar sabke liye ek hi signature hai to PDF me uska image bhi lagaya ja sakta hai, lekin pehle permission lo. Digital copy bhi share kar sakte ho." },
      { q: "Certificate kab tak dena chahiye?", a: "Jitni jaldi ho sake, bahut der karne par log bhool jaate hain. Event ke din ya agle kuch din me do, aur digital copy turant WhatsApp par bhej do. Certificate ki tayari event se pehle kar lo: naamon ki list, wording aur design pehle se ready ho, to sirf winners ka naam baad me jodna padta hai. Planning ke liye college tournament guide ki timeline dekho." },
    ],
    related: ["certificate-wording", "id-card-kaise-banaye", "run-a-campus-tournament"],
    cta: { label: "Certificate free me banao", href: "/tools/certificates/" },
  },
];
