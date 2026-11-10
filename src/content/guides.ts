import { EXAMPLE_SCALE, standings, type TeamEntry } from "@/lib/points";

/** Inline links are written as [text](/path/) inside paragraphs, lists and notes. */
export type Block =
  | { t: "p"; x: string }
  | { t: "h3"; x: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "note"; x: string }
  | { t: "table"; head: string[]; rows: string[][] };

export interface Guide {
  slug: string;
  title: string;
  /** A shorter title for the browser tab and search results (the site name is added after it, so keep it under 56 characters). Defaults to the title. */
  seoTitle?: string;
  /** 120 to 160 characters: what the search result shows under the title. */
  description: string;
  tag: string;
  minutes: number;
  published: string;
  updated: string;
  intro: string;
  sections: { h2: string; blocks: Block[] }[];
  related: string[];
  cta: { label: string; href: string };
}

const PUBLISHED = "2026-11-11";

// The worked example for the points guide is computed, not typed, so the numbers always match the calculator.
const EXAMPLE_TEAMS: TeamEntry[] = [
  { name: "Alpha", matches: [{ placement: 1, kills: 5 }, { placement: 4, kills: 2 }, { placement: 2, kills: 3 }] },
  { name: "Bravo", matches: [{ placement: 2, kills: 6 }, { placement: 1, kills: 4 }, { placement: 5, kills: 1 }] },
  { name: "Charlie", matches: [{ placement: 3, kills: 2 }, { placement: 2, kills: 7 }, { placement: 1, kills: 4 }] },
  { name: "Delta", matches: [{ placement: 4, kills: 3 }, { placement: 3, kills: 1 }, { placement: 3, kills: 6 }] },
];
const EXAMPLE = standings(EXAMPLE_TEAMS, EXAMPLE_SCALE);
const exampleTable: Block = {
  t: "table",
  head: ["Rank", "Team", "Match 1", "Match 2", "Match 3", "Total"],
  rows: EXAMPLE.map((s) => [String(s.rank), s.name, ...s.perMatch.map(String), String(s.total)]),
};
const exampleInput: Block = {
  t: "table",
  head: ["Team", "Match 1 (place, kills)", "Match 2 (place, kills)", "Match 3 (place, kills)"],
  rows: EXAMPLE_TEAMS.map((t) => [t.name, ...t.matches.map((m) => `${m.placement}, ${m.kills}`)]),
};
const scaleTable: Block = {
  t: "table",
  head: ["Placement", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th or lower"],
  rows: [["Points", ...EXAMPLE_SCALE.placement.map(String), "0"]],
};

export const GUIDES: Guide[] = [
  {
    slug: "run-a-campus-tournament",
    title: "How to run a college esports tournament in India",
    description: "A step-by-step plan for a college esports tournament: pick the game, get permission, write the rules, register teams, run the gate and publish results.",
    tag: "Organiser guide", minutes: 9, published: PUBLISHED, updated: PUBLISHED,
    intro: "A college esports tournament is mostly planning, not gaming. The events that go well are the ones where permissions, rules, registration and the gate were sorted days before. This guide walks through the order to do things in, with the decisions you need to make at each step.",
    sections: [
      { h2: "1. Decide what the event is for", blocks: [
        { t: "p", x: "Write one sentence: a fest event, a recurring league, or a one-day cup. That sentence decides your budget, how many teams you can handle, and whether you need one day or several." },
        { t: "p", x: "Also decide who it is for. A tournament only for your own college is simple. One open to other colleges means outsiders on campus, which changes your ID, security and permission plan." },
      ] },
      { h2: "2. Pick a game that fits your players and your hardware", blocks: [
        { t: "ul", items: [
          "Mobile games (for example BGMI or Free Fire MAX) need no PCs and no wired setup. You need reliable Wi-Fi or mobile data, charging points and a room per lobby if you use custom rooms.",
          "PC games (for example Valorant or Counter-Strike) need machines, peripherals, a stable network and a technical lead who can fix a machine in five minutes.",
          "Pick a game people already play. A tournament in a game nobody owns will not fill.",
        ] },
        { t: "note", x: "Check the game publisher's rules for running or monetising tournaments before you advertise prize money. Publishers set their own conditions and they change." },
      ] },
      { h2: "3. Get permission first", blocks: [
        { t: "p", x: "Get written approval from the college, a venue booking, and a named faculty contact. Ask early whether outside participants may enter, how they will be identified, and who is responsible for safety on the day. If you plan to charge an entry fee or give prizes, check what the college allows." },
      ] },
      { h2: "4. Choose the format", blocks: [
        { t: "ul", items: [
          "Few teams, each match a head-to-head game: a single-elimination bracket. See [choosing a tournament format](/guides/choosing-a-tournament-format/).",
          "Battle royale games with many teams in one lobby: a points table over several matches. See [the points table guide](/guides/points-table/).",
          "Many teams: groups first, then a knockout stage for the best teams.",
        ] },
        { t: "p", x: "Count the time honestly. Each match takes longer than its length: add time for players to join, a technical delay and a short break. Build slack into the schedule." },
      ] },
      { h2: "5. Write the rules before registration opens", blocks: [
        { t: "p", x: "One page is enough: who can play, team size and substitutes, the schedule, what happens if a team is late or does not show, device rules, cheating and its penalty, how disputes are decided and who has the final say. Publish it with the registration link so nobody can say they did not know. Start from the [tournament rules template](/guides/esports-tournament-rules-template/)." },
      ] },
      { h2: "6. Open registration with a short form", blocks: [
        { t: "p", x: "Ask only what you need: team name, captain's contact, each player's name and in-game ID, and which college or group they belong to. For anyone under 18, get a parent or guardian's consent. Do not collect ID numbers you do not need. Fewer fields means more complete registrations." },
        { t: "p", x: "Set a closing date and stick to it. Confirm every team in writing, with the schedule and the rules attached." },
      ] },
      { h2: "7. Make ID cards and passes", blocks: [
        { t: "p", x: "A card for every player and staff member with name, team, role and a QR code makes the gate quick and stops unapproved substitutions. You can make them free with the [ID card maker](/tools/id-cards/). Print them a few days ahead, not the morning of the event. See [player ID cards and passes](/guides/player-id-cards/) for what to put on them." },
      ] },
      { h2: "8. Plan the gate", blocks: [
        { t: "p", x: "Decide how many doors you need, who stands on each one, and what they check. Test the scanner on the real network, or have an offline option ready. The [gate check-in guide](/guides/event-gate-checkin/) covers this in detail." },
      ] },
      { h2: "9. Run the day to a written schedule", blocks: [
        { t: "ol", items: [
          "Setup and a technical check the day before, if you can.",
          "Gate opens; teams check in.",
          "Captains' briefing: rules, schedule, who to talk to.",
          "Matches, with one person whose only job is disputes and results.",
          "Results published the same day, with the final table or bracket.",
        ] },
      ] },
      { h2: "10. After the event", blocks: [
        { t: "p", x: "Publish results and thank everyone. Keep the roster and attendance list for next time, and ask the captains what went wrong. The second event is always easier if you wrote the first one down." },
      ] },
      { h2: "A four-week timeline", blocks: [
        { t: "p", x: "If you have about a month, this order keeps the important things ahead of the pressure. Move the dates to fit your event." },
        { t: "table", head: ["When", "What to finish"], rows: [
          ["4 weeks before", "Permission, venue, game and format decided; a named faculty contact; a rough budget"],
          ["3 weeks before", "Rules written and shown to a few captains; registration form built and opened"],
          ["2 weeks before", "Registration closes; teams confirmed in writing; schedule drafted; ID cards designed"],
          ["1 week before", "Cards printed; gate scanner tested; volunteers briefed; stream plan agreed if you have one"],
          ["The day before", "Technical check of the venue, network and devices; final schedule sent to captains"],
          ["The day", "Gate, briefing, matches, results"],
          ["After", "Results published, thanks sent, roster and attendance saved, notes written"],
        ] },
      ] },
      { h2: "Common mistakes", blocks: [
        { t: "ul", items: [
          "Opening registration before the rules exist, so every question becomes an argument later.",
          "Planning match time as the length of the match only. Joining, delays and breaks often double it.",
          "Having no plan for the network. If the game needs internet, test the venue's connection with the number of devices you expect, at the time of day you will play.",
          "Letting one person do everything. Give the gate, the technical side, disputes and results to different people.",
          "Not writing down who decides disputes, so the organiser ends up arguing with every captain.",
          "Printing ID cards on the morning of the event.",
        ] },
      ] },
      { h2: "A short budget checklist", blocks: [
        { t: "p", x: "You do not need a large budget, but write the costs down so nothing surprises you: venue and power, network, prizes, printing (cards, posters, certificates), refreshments, a first-aid contact, and a small reserve for things that go wrong. If a sponsor is paying, agree in writing what they get. See [writing a sponsor pitch](/guides/sponsor-pitch/)." },
      ] },
    ],
    related: ["esports-tournament-rules-template", "choosing-a-tournament-format", "event-gate-checkin"],
    cta: { label: "Make the ID cards for your event", href: "/tools/id-cards/" },
  },

  {
    slug: "esports-tournament-rules-template",
    title: "Esports tournament rules template you can copy and edit",
    description: "A ready-to-edit rules document for a custom-room or LAN esports tournament: eligibility, teams, schedule, conduct, cheating, disputes and prizes.",
    tag: "Template", minutes: 6, published: PUBLISHED, updated: PUBLISHED,
    intro: "Most tournament arguments come from rules that were never written down. This template covers what a small or medium tournament needs. Copy it, replace the words in [brackets], delete what does not apply, and publish it before registration opens.",
    sections: [
      { h2: "How to use this template", blocks: [
        { t: "ul", items: [
          "Keep it short. Players read one page; they do not read ten.",
          "Replace every [bracket] with a real value. A rule that still says [number] is worse than no rule.",
          "Show it to a few captains before you publish. They will find the gaps.",
          "Say that the organisers may change the rules for fairness, and say how you will tell everyone.",
        ] },
        { t: "note", x: "This is a general template, not legal advice. If prize money, minors or an outside sponsor are involved, check the college or your organisation's own requirements." },
      ] },
      { h2: "The template", blocks: [
        { t: "h3", x: "1. Eligibility" },
        { t: "p", x: "Players must be [age rule] on [date]. Players under 18 need a parent or guardian's written consent. Each player may play for one team in this tournament." },
        { t: "h3", x: "2. Teams" },
        { t: "p", x: "A team has [number] players and up to [number] substitutes, all listed at registration. The captain is the only contact for the organisers. A roster change after [deadline] needs written approval from the organisers." },
        { t: "h3", x: "3. Registration" },
        { t: "p", x: "Registration closes on [date and time]. Only complete registrations count. The organisers may refuse an entry and will say why." },
        { t: "h3", x: "4. Format" },
        { t: "p", x: "[Single elimination / groups then knockout / points over N matches]. Matches are played on [map or mode]. In points formats, placement and kill points follow the points table published with these rules, and ties are broken by [order of tie-breakers]." },
        { t: "h3", x: "5. Schedule and check-in" },
        { t: "p", x: "Teams must be present [number] minutes before their match. A team more than [number] minutes late forfeits the match. Each player shows a pass or ID at the gate." },
        { t: "h3", x: "6. Devices and settings" },
        { t: "p", x: "Each player uses their own device. Emulators and modified game clients are not allowed in mobile events. Required game version: [version]." },
        { t: "h3", x: "7. Conduct" },
        { t: "p", x: "Respect other players, officials and spectators. Insults, threats or harassment lead to a warning, then removal from the event." },
        { t: "h3", x: "8. Cheating" },
        { t: "p", x: "Using hacks or exploits, teaming with other teams, and intentionally losing a match are cheating. A confirmed case leads to disqualification of the player and may lead to disqualification of the team. The organisers review the evidence and decide." },
        { t: "h3", x: "9. Disputes" },
        { t: "p", x: "Raise a dispute with an official straight after the match, through the captain only. Decisions are made by [name or committee] and are final." },
        { t: "h3", x: "10. Prizes" },
        { t: "p", x: "[Prizes and how they are paid]. Prizes are paid after results are confirmed." },
        { t: "h3", x: "11. Changes" },
        { t: "p", x: "The organisers may change these rules for fairness or safety and will tell all captains in writing before the change applies." },
      ] },
      { h2: "Rules people forget", blocks: [
        { t: "ul", items: [
          "What happens if a player disconnects mid-match. Decide in advance: replay, continue, or forfeit after a time limit.",
          "Who can talk to the officials during a match. One person per team keeps it calm.",
          "What happens if two teams both claim the same result. Have a screenshot or replay rule.",
          "How a substitute is approved on the day, and by whom.",
          "What happens to prizes if a winner is later found cheating.",
        ] },
      ] },
      { h2: "Enforcing the rules", blocks: [
        { t: "p", x: "Rules only work if they are checked. Use passes and a roster at the gate so a player who is not on the list cannot play: see [gate check-in](/guides/event-gate-checkin/) and [player ID cards](/guides/player-id-cards/)." },
      ] },
      { h2: "A filled-in example", blocks: [
        { t: "p", x: "This is an example for a one-day squad battle royale event, so you can see what the brackets turn into. The numbers are examples: choose your own." },
        { t: "ul", items: [
          "Eligibility: players must be 18 or older on the day of the event, or have a parent or guardian's written consent.",
          "Teams: 4 players and up to 1 substitute per team, all named at registration. Roster changes close 48 hours before the event.",
          "Format: 3 matches in one lobby. Teams are ranked by total points: placement points plus 1 point per kill.",
          "Schedule: teams arrive 30 minutes before the first match. A team more than 10 minutes late loses that match's placement points.",
          "Disputes: the captain tells an official straight after the match. The head official decides and the decision is final.",
        ] },
      ] },
      { h2: "Common mistakes in rules documents", blocks: [
        { t: "ul", items: [
          "Rules that say \"fair play\" without saying what is not allowed. Name the behaviours.",
          "No tie-breaker order, so the winner is decided in a shouting match.",
          "No rule for a disconnected player, so every disconnect becomes a dispute.",
          "Rules published after registration closed. Teams entered under rules they never saw.",
          "Penalties that nobody is willing to apply. Only write what you will actually enforce.",
        ] },
      ] },
    ],
    related: ["run-a-campus-tournament", "event-gate-checkin", "points-table"],
    cta: { label: "Make passes for your players", href: "/tools/id-cards/" },
  },

  {
    slug: "points-table",
    seoTitle: "Battle royale points table: placement, kills, ties",
    title: "Battle royale points table: placement, kills and tie-breakers",
    description: "How a battle royale points table works: placement points, kill points, tie-breakers, and a worked three-match example you can check with a free calculator.",
    tag: "Game guide", minutes: 7, published: PUBLISHED, updated: PUBLISHED,
    intro: "In a battle royale tournament many teams play in one lobby, so there is no head-to-head result to put in a bracket. Instead, each match gives every team points, and the team with the most points over several matches wins. This guide explains the parts of a points table and works through an example.",
    sections: [
      { h2: "The two parts of a score", blocks: [
        { t: "ul", items: [
          "Placement points: points for where the team finished in the match. First place gets the most.",
          "Kill points: points for each elimination the team's players made. Usually one point per kill, but you can weight them.",
        ] },
        { t: "p", x: "A team's score for one match is placement points plus kill points. Its tournament score is the sum over all matches." },
        { t: "note", x: "Official tournaments publish their own scales and they differ between games and seasons. The scale below is only an example. Use the points your own rulebook states, and publish them before the first match." },
      ] },
      { h2: "An example scale", blocks: [
        { t: "p", x: "Here is an example placement scale with one point per kill:" },
        scaleTable,
        { t: "p", x: "Why this shape? A big gap between first and second rewards winning. Small points for the lower places keep every team in the game. One point per kill rewards aggression without letting a team win only by fighting." },
        { t: "p", x: "If winning matters most to you, raise the gap at the top. If you want to reward aggressive play, raise the kill value. Changing either changes how teams play, so decide before the event and do not change it halfway." },
      ] },
      { h2: "A worked example", blocks: [
        { t: "p", x: "Four teams played three matches. Each entry is the team's placement and kills:" },
        exampleInput,
        { t: "p", x: "Using the example scale above, the points per match and the final table are:" },
        exampleTable,
        { t: "p", x: `${EXAMPLE[0]!.name} wins with ${EXAMPLE[0]!.total} points. You can enter the same numbers into the [points table calculator](/tools/points-table/) to check the working.` },
      ] },
      { h2: "Tie-breakers", blocks: [
        { t: "p", x: "Two teams will eventually finish on the same points. Decide the order of tie-breakers in advance and write it in the rules. A common order is:" },
        { t: "ol", items: [
          "Most wins (first places).",
          "Most total kills.",
          "Better placement in the last match.",
          "If still equal, a decider match or the organisers' ruling.",
        ] },
        { t: "p", x: "The calculator on this site uses the first three, then team name, so the same input always gives the same order." },
      ] },
      { h2: "Running it on the day", blocks: [
        { t: "ul", items: [
          "Collect results after every match from a screenshot of the result screen, taken by an official, not by the teams.",
          "Update the table straight away and show it, so teams see how they stand.",
          "Keep one person responsible for the table. Two people editing it is how mistakes happen.",
          "Check the totals with a second method (the calculator, or a second person) before you announce the winner.",
        ] },
        { t: "p", x: "For the full plan of a tournament day see [how to run a college esports tournament](/guides/run-a-campus-tournament/)." },
      ] },
      { h2: "Questions organisers ask", blocks: [
        { t: "h3", x: "What if a team is disqualified in the middle of the event?" },
        { t: "p", x: "Decide before the event and write it in the rules. The two common choices are to remove the team's results from the table entirely, or to keep the matches already played and give nothing for later matches. Removing them changes the placement of other teams in past matches only if your rules say placements are re-counted, so say which you do." },
        { t: "h3", x: "Do kills count if the team finished last?" },
        { t: "p", x: "In the scoring above, yes: kill points are added whatever the placement. Some events cap kill points or weight them lower so a team cannot win by fighting alone. Choose the rule that suits your game and say it up front." },
        { t: "h3", x: "How many matches should we play?" },
        { t: "p", x: "More matches make the result less dependent on one lucky game, but they take longer. Many events play an even number of short matches in a day; your own limit is how many your players, officials and schedule can handle without rushing. Whatever you pick, write it in the rules." },
        { t: "h3", x: "Can we change the points halfway?" },
        { t: "p", x: "Do not. Changing the scale after teams have started playing changes how they should have played. If you find a real mistake in the scale, tell every captain and apply the correction to all matches, not just the next ones." },
      ] },
      { h2: "A checklist for the table", blocks: [
        { t: "ol", items: [
          "The scale (placement points and kill points) is written in the rules and shown to all teams.",
          "The tie-breaker order is written in the rules.",
          "One person owns the table, and one person checks it.",
          "Each match result comes from an official's screenshot or recording.",
          "The table is shown after every match.",
          "Final totals are checked with the [calculator](/tools/points-table/) before they are announced.",
        ] },
      ] },
    ],
    related: ["choosing-a-tournament-format", "esports-tournament-rules-template", "run-a-campus-tournament"],
    cta: { label: "Open the points table calculator", href: "/tools/points-table/" },
  },

  {
    slug: "choosing-a-tournament-format",
    seoTitle: "Tournament formats: which to choose and match counts",
    title: "Tournament formats: single elimination, double elimination, round robin and groups",
    description: "How the main tournament formats work, how many matches each needs, and which to choose for your esports event, with a simple rule for byes.",
    tag: "Organiser guide", minutes: 7, published: PUBLISHED, updated: PUBLISHED,
    intro: "The format decides how long your event takes, how fair it feels and how many matches you must schedule. Here are the common formats, the number of matches each needs, and when each is the right choice.",
    sections: [
      { h2: "Single elimination", blocks: [
        { t: "p", x: "Lose once and you are out. With n teams you need exactly n − 1 matches, because every match removes one team and only one team is left at the end. 16 teams need 15 matches in four rounds." },
        { t: "ul", items: [
          "Good for: short events, many teams, little time.",
          "Weakness: one bad match ends a team's day, so it is less forgiving. A strong team can go out in round one.",
        ] },
        { t: "h3", x: "Byes" },
        { t: "p", x: "If the number of teams is not a power of two (2, 4, 8, 16, 32...), some teams skip the first round. Those skips are called byes. The usual rule: round the team count up to the next power of two, and give the byes to the highest seeds. With 11 teams you round up to 16, so 5 teams get byes. The free [bracket maker](/tools/brackets/) adds them for you." },
        { t: "h3", x: "Seeding" },
        { t: "p", x: "Seeding places the strongest teams so they cannot meet until late. In a standard bracket seed 1 plays the lowest seed, and seeds 1 and 2 can only meet in the final. If you have no information about strength, draw seeds at random and say so." },
      ] },
      { h2: "Double elimination", blocks: [
        { t: "p", x: "A team must lose twice to be out. There is a winners' bracket and a losers' bracket. It needs up to 2n − 2 matches, or 2n − 1 if the team from the losers' bracket beats the unbeaten finalist and a second final is needed." },
        { t: "ul", items: [
          "Good for: events where fairness matters and you have the time.",
          "Weakness: about twice the matches of single elimination and a more complicated schedule.",
        ] },
      ] },
      { h2: "Round robin", blocks: [
        { t: "p", x: "Every team plays every other team once. With n teams that is n × (n − 1) ÷ 2 matches: 6 teams play 15 matches, 8 teams play 28. It is the fairest format because no single result decides everything, and it grows fast." },
        { t: "ul", items: [
          "Good for: small groups (up to about 6 or 8 teams) and leagues.",
          "Weakness: too many matches for a large field. You also need tie-breakers for the table.",
        ] },
      ] },
      { h2: "Groups, then knockout", blocks: [
        { t: "p", x: "Split the teams into groups, play a round robin inside each group, and send the best teams from each group to a single-elimination bracket. It combines fairness in the early rounds with a clear finish." },
        { t: "p", x: "Example: 16 teams in 4 groups of 4. Each group plays 6 matches, so 24 group matches. The top 2 from each group go through: 8 teams, which need 7 knockout matches. Total 31 matches." },
      ] },
      { h2: "Points over several matches", blocks: [
        { t: "p", x: "Battle royale games put many teams in one lobby. Teams collect points over several matches and the highest total wins. See the [battle royale points table guide](/guides/points-table/)." },
      ] },
      { h2: "How to choose", blocks: [
        { t: "table", head: ["Situation", "Format"], rows: [
          ["One day, many teams, head-to-head game", "Single elimination"],
          ["You want a second chance for every team and have time", "Double elimination"],
          ["6 to 8 teams or fewer, a league", "Round robin"],
          ["12 to 32 teams, two days", "Groups then knockout"],
          ["Battle royale", "Points table over several matches"],
        ] },
        { t: "p", x: "Whatever you choose, write it in the rules and publish the schedule before the first match. See [how to run a college esports tournament](/guides/run-a-campus-tournament/)." },
      ] },
      { h2: "A worked example: 20 teams in one day", blocks: [
        { t: "p", x: "Say you have 20 teams, one day, a head-to-head game, and you can run 4 matches at the same time. Single elimination is the only format that fits. Twenty is not a power of two, so the bracket rounds up to 32 places: 12 teams get a bye and 8 teams play in the first round." },
        { t: "table", head: ["Round", "Matches", "Teams left after"], rows: [
          ["Round 1 (the 8 teams without a bye)", "4", "16"],
          ["Round 2", "8", "8"],
          ["Quarter-finals", "4", "4"],
          ["Semi-finals", "2", "2"],
          ["Final", "1", "1"],
        ] },
        { t: "p", x: "That is 19 matches, which matches the n − 1 rule (20 − 1). If each match takes about 40 minutes including setup, and you can run 4 at once, the rounds take roughly 40, 80, 40, 40 and 40 minutes: about four hours of matches, plus breaks. Change the numbers to your own and you can plan the day." },
        { t: "p", x: "Double elimination for the same field would need up to 38 matches, which does not fit in a day with 4 lobbies. This is the kind of arithmetic worth doing before you choose." },
      ] },
      { h2: "Mistakes to avoid", blocks: [
        { t: "ul", items: [
          "Choosing a format you like without counting the matches and the time.",
          "Forgetting the bronze or third-place match if prizes depend on it. Decide before the event.",
          "Seeding by who you know instead of by a rule. If you cannot rank teams, draw seeds at random and say so.",
          "Not telling teams how many matches they are guaranteed. In single elimination a team may play only one match, so tell them before they travel.",
        ] },
      ] },
    ],
    related: ["points-table", "run-a-campus-tournament", "esports-tournament-rules-template"],
    cta: { label: "Build a bracket for free", href: "/tools/brackets/" },
  },

  {
    slug: "player-id-cards",
    seoTitle: "Player ID cards and passes: what to put on them",
    title: "Player ID cards and passes for esports events: what to put on them",
    description: "What a player ID card or event pass should show, how QR passes stop copies, how to print them, and how to protect players' personal details.",
    tag: "Organiser guide", minutes: 7, published: PUBLISHED, updated: PUBLISHED,
    intro: "An ID card or pass answers one question at the door: is this person supposed to be here, and as what? A good card makes the gate faster, stops stand-ins nobody approved, and tells staff at a glance who can go where.",
    sections: [
      { h2: "What to put on the card", blocks: [
        { t: "ul", items: [
          "Name, large enough to read at arm's length.",
          "Team or organisation, so staff can match a person to a group.",
          "Role: player, substitute, coach, manager, staff, media, guest. Use a colour for each role so guards can tell them apart without reading.",
          "Event name and date, so an old card cannot be reused.",
          "A photo, if you want to check that the person holding the card is the person on it.",
          "A QR code, so the gate can check the card quickly and tell a genuine pass from a copy.",
          "Access zones, if some areas are restricted (backstage, the match room, the stage).",
        ] },
        { t: "p", x: "Put the emergency contact and the rules summary on the back. Leave out anything you do not need." },
      ] },
      { h2: "Why a QR code helps, and what makes it safe", blocks: [
        { t: "p", x: "A QR code on its own only holds text, and anyone can print a QR code that says the same text. What stops copies is a signature: the code carries a secret-keyed check value computed from the person, the event and the role. If someone edits the name, changes the role or invents a new code, the check value no longer matches, and the scanner rejects it." },
        { t: "p", x: "A signed pass still cannot stop a real card being handed to someone else. That is what the photo and the scanner's record are for: the first scan marks the person as inside, and a second scan of the same code shows \"already checked in\". See [gate check-in](/guides/event-gate-checkin/)." },
      ] },
      { h2: "Protect the people on the cards", blocks: [
        { t: "ul", items: [
          "Collect the least you need. A name, team, role and photo are enough for most events.",
          "Do not print an ID number on a card. If you must verify an official ID, check it and do not copy the number onto the card or keep it.",
          "For anyone under 18, get a parent or guardian's consent before you collect or print anything.",
          "Tell people what you collect, why, and how long you keep it. Delete it after the event if you do not need it.",
        ] },
        { t: "p", x: "The ID card maker on this site works in your browser, so photos are not uploaded when you only make and print cards. If you scan an Aadhaar card to read the details, the picture is read on your device and only the last four digits of the number are kept. Whether you should collect an ID at all depends on your event, so decide that before you start." },
        { t: "note", x: "This is general guidance, not legal advice. Rules on personal data depend on who you are and what you collect: check what applies to your organisation." },
      ] },
      { h2: "Sizes and printing", blocks: [
        { t: "ul", items: [
          "Wallet card (about 85 × 54 mm): carried in a pocket or wallet. Cheapest, many to a page.",
          "Lanyard card or badge: worn round the neck, so make the name large and put it on both sides if it can flip.",
          "Wristband strip: for crowd events where a card would be lost.",
          "Poster or story card: for sharing a player's pass on social media.",
        ] },
        { t: "p", x: "Print on thick paper or card (250 gsm or more) and trim to the crop marks. If you use a print shop, ask for 3 mm bleed so there is no white edge after cutting. Always print one test page first and check the QR code scans." },
      ] },
      { h2: "A simple process", blocks: [
        { t: "ol", items: [
          "Collect names, teams, roles and photos (players can send their own through an invite link).",
          "Check for duplicates and for minors without consent.",
          "Pick a design for each team and print a test card.",
          "Print the rest a few days before the event.",
          "Load the guest list on the gate scanner and test one card of each role.",
        ] },
      ] },
      { h2: "Using colours for roles", blocks: [
        { t: "p", x: "At a busy gate, colour is faster than reading. Pick one colour per role and use it on every card, the stripe, the badge text or the lanyard. Do not use two similar colours for different roles, because people confuse them in poor light." },
        { t: "table", head: ["Role", "Why it needs its own look"], rows: [
          ["Player", "Allowed in the match area and the venue"],
          ["Substitute", "Allowed in the venue, in the match area only when approved"],
          ["Coach or manager", "Allowed beside the team, may not play"],
          ["Staff and volunteers", "Allowed in working areas and backstage"],
          ["Media", "Allowed to film or photograph in set areas"],
          ["Guest or VIP", "Allowed in guest areas"],
          ["Organiser", "Allowed everywhere"],
        ] },
      ] },
      { h2: "Before you print: a checklist", blocks: [
        { t: "ol", items: [
          "Every name is spelled the way the person wants it on the card.",
          "Roles are correct. A changed role means a new card.",
          "No duplicates: two cards for one person means a second person can get in on the same code.",
          "Anyone under 18 has a guardian's consent recorded.",
          "You have printed a few spare cards for last-minute changes, and know who can issue them on the day.",
          "One printed card of each role has been scanned successfully.",
        ] },
      ] },
    ],
    related: ["event-gate-checkin", "run-a-campus-tournament", "esports-tournament-rules-template"],
    cta: { label: "Make ID cards for free", href: "/tools/id-cards/" },
  },

  {
    slug: "event-gate-checkin",
    title: "How to run check-in at the gate of a gaming event",
    description: "A practical plan for event check-in: how many doors, who stands where, scanning QR passes online and offline, and what to do with fake or duplicate passes.",
    tag: "Organiser guide", minutes: 6, published: PUBLISHED, updated: PUBLISHED,
    intro: "Check-in is the first thing every guest sees and the first place an event can go wrong. A queue that does not move, a fake card that gets in, or a guest list nobody can find all start at the gate. A little planning removes most of it.",
    sections: [
      { h2: "Before the day", blocks: [
        { t: "ul", items: [
          "Fix the guest list. Anyone not on it needs an organiser's approval at the gate.",
          "Give everyone a pass with their name, role and a QR code. See [player ID cards and passes](/guides/player-id-cards/).",
          "Decide the number of doors from the crowd: one scanner can check a person in a few seconds, so what matters is the arrival peak, not the total.",
          "Test everything on the real venue network, or have an offline plan.",
        ] },
      ] },
      { h2: "Online or offline?", blocks: [
        { t: "ul", items: [
          "Online with a shared list: every door sees the same list, so a guest who has already come in at one door is flagged at another. You need a working connection.",
          "Offline pack: the guest list and the checking secret are loaded on the phone beforehand and nothing needs the internet. A second door does not know about the first door's scans unless you merge them afterwards.",
          "A mix: scan live when there is signal, and keep scanning when it drops. Scans made without a connection are saved on the phone, marked as not yet checked, and sent when the signal returns.",
        ] },
        { t: "p", x: "Venues with crowded Wi-Fi are exactly where connections fail, so always have the offline option ready. The free [gate scanner](/gate/) works both ways." },
      ] },
      { h2: "Who stands where", blocks: [
        { t: "ul", items: [
          "A greeter at the front of the queue to tell people what to have ready.",
          "A scanner at each door. Give each door its own key or login, so you can see which door scanned whom and switch one off if a phone is lost.",
          "A runner for problems: lost passes, not on the list, minors without consent. Keep them out of the queue so it keeps moving.",
        ] },
      ] },
      { h2: "What the scanner should tell the guard", blocks: [
        { t: "table", head: ["Result", "What it means", "What the guard does"], rows: [
          ["Green: genuine", "Pass is real and this is the first scan", "Let the person in; glance at the photo and role"],
          ["Amber: already checked in", "This pass was already used, and when", "Ask the person; call the runner if it is not them"],
          ["Red: not valid", "Edited, copied, for another event, or unknown", "Do not let them in; send to the runner"],
          ["Blue: not verified yet", "No signal; the scan is saved for later", "Check the card by eye and let the runner know"],
        ] },
      ] },
      { h2: "Handling problems", blocks: [
        { t: "ul", items: [
          "Lost pass: look the person up by name on the list, check their ID against the name, and re-issue one pass. The old code should then stop working.",
          "Role changed after printing: a pass signed for the old role will fail by design. Print a new one.",
          "Minor without consent: do not let them in as a player until the consent is recorded.",
          "Phone lost: switch that door's key off straight away.",
        ] },
      ] },
      { h2: "After the event", blocks: [
        { t: "p", x: "Export the attendance list. It tells you who really came, which doors were slow, and what to fix next time. Delete personal data you no longer need." },
      ] },
      { h2: "How many doors do you need?", blocks: [
        { t: "p", x: "It depends on how fast people arrive, not on how many come in total. As an illustration, if checking one guest takes about six seconds, one door handles about ten guests a minute. If 200 guests arrive within 20 minutes, that is 10 a minute, so one door is enough. If 600 arrive in the same 20 minutes, that is 30 a minute, so you need three doors. Time a real check-in at your own gate with a few volunteers and use those numbers." },
        { t: "p", x: "Staggering arrival times helps more than adding doors: give each team a time slot to arrive in, and the queue spreads out." },
      ] },
      { h2: "Equipment checklist", blocks: [
        { t: "ul", items: [
          "A charged phone for each door, plus a power bank each.",
          "A printed copy of the guest list as a last resort.",
          "A few spare printed passes and a pen for changes.",
          "A table, a banner saying which door is which, and a rope or barrier if the queue is long.",
          "The gate key or offline pack for each phone, tested the day before.",
          "A named person who can approve exceptions.",
        ] },
      ] },
    ],
    related: ["player-id-cards", "run-a-campus-tournament", "esports-tournament-rules-template"],
    cta: { label: "Open the gate scanner", href: "/gate/" },
  },

  {
    slug: "stream-your-event",
    title: "How to stream your own esports event on a small budget",
    description: "Plan a stream for a community esports event: what you need, scenes to set up in OBS Studio, a run-sheet, casters, and a checklist for the day.",
    tag: "Streaming", minutes: 8, published: PUBLISHED, updated: PUBLISHED,
    intro: "A stream gives your event a life beyond the room: players' families can watch, sponsors get exposure, and you get clips to promote the next one. You do not need a studio. You need a plan, a free tool, and one person whose only job is the stream.",
    sections: [
      { h2: "What you need", blocks: [
        { t: "ul", items: [
          "A computer that can capture the game and encode video at the same time. Test it with a real match, not a menu.",
          "A stable upload connection. Run a speed test at the venue, at the time of day you will stream, and aim for well above the bitrate you plan to send.",
          "A microphone for casters. Audio matters more than video: people forgive a soft picture, not bad sound.",
          "Headphones for the stream operator.",
          "A free streaming program. OBS Studio is free and open source and runs on Windows, macOS and Linux; check obsproject.com for the current system requirements.",
        ] },
      ] },
      { h2: "Scenes to prepare in OBS Studio", blocks: [
        { t: "p", x: "A scene is a saved layout. Make these before the day, name them clearly, and give each a hotkey so the operator can switch without hunting through menus." },
        { t: "ol", items: [
          "Starting soon: the event logo, the start time, music at a low level.",
          "Gameplay: the match feed with a small overlay showing team names and the score.",
          "Casters: camera or voice-only layout with names.",
          "Standings: the points table or bracket, updated between matches.",
          "Break: a timer and sponsor logos.",
          "Ending: results, thanks and where to find the next event.",
        ] },
        { t: "p", x: "OBS Studio has a Studio Mode, which lets you preview the next scene before sending it live. Use it so viewers never see a half-built scene." },
      ] },
      { h2: "The run-sheet", blocks: [
        { t: "p", x: "A run-sheet is a timed list of what happens on stream. Write it for the whole day and keep a copy beside the operator." },
        { t: "table", head: ["Time", "Scene", "What happens"], rows: [
          ["T − 15 min", "Starting soon", "Check audio, check the feed, go live"],
          ["T", "Casters", "Welcome, introduce the event and the teams"],
          ["T + 5 min", "Gameplay", "First match"],
          ["After each match", "Standings", "Show the table, short caster recap"],
          ["Between blocks", "Break", "Timer, sponsor logos"],
          ["End", "Ending", "Results, thanks, next event"],
        ] },
      ] },
      { h2: "Casters and the producer", blocks: [
        { t: "ul", items: [
          "Two casters work better than one: one describes the action, the other adds context. They need the team names and player names spelled correctly, written down.",
          "One producer, not the operator, tells the casters when to move on, and keeps a log of timestamps for clips.",
          "Brief the casters on what not to say: no insults, no unconfirmed claims about cheating.",
        ] },
      ] },
      { h2: "Rights and safety", blocks: [
        { t: "ul", items: [
          "Check that you are allowed to stream the game and to use any music you play. Use music you have the right to, or none.",
          "Tell players they will be on stream. For anyone under 18, get a parent or guardian's consent for them to appear.",
          "Do not show personal details on stream: phone numbers, full names on ID cards, or room codes before the match starts.",
        ] },
      ] },
      { h2: "Checklist for the day", blocks: [
        { t: "ol", items: [
          "Power and spare cables for every device.",
          "Upload speed tested at the venue.",
          "Scenes and hotkeys tested; a recording running in case the stream drops.",
          "Casters' microphones tested with headphones on.",
          "A person assigned to monitor the chat and the stream health.",
        ] },
        { t: "p", x: "For the rest of the event, see [how to run a college esports tournament](/guides/run-a-campus-tournament/)." },
      ] },
      { h2: "Who does what on the day", blocks: [
        { t: "table", head: ["Role", "Job"], rows: [
          ["Operator", "Switches scenes, watches the stream health, keeps the recording running"],
          ["Producer", "Follows the run-sheet, tells the casters when to move on, logs times for clips"],
          ["Casters", "Describe the match and the standings"],
          ["Match official", "Confirms results so the casters and the table agree"],
          ["Chat moderator", "Removes abuse and answers simple questions"],
        ] },
      ] },
      { h2: "Mistakes that ruin streams", blocks: [
        { t: "ul", items: [
          "Testing with a menu instead of a real match, then finding the computer cannot cope.",
          "Not recording locally. If the stream drops you still have the footage.",
          "Casters who do not know how to pronounce the players' names.",
          "Showing room codes or personal details on screen before the match starts.",
          "No plan for dead air between matches. Have a break scene, music you may use, and a short list of things to say.",
        ] },
      ] },
    ],
    related: ["run-a-campus-tournament", "points-table", "sponsor-pitch"],
    cta: { label: "Build a bracket to show on stream", href: "/tools/brackets/" },
  },

  {
    slug: "sponsor-pitch",
    seoTitle: "How to write a sponsor pitch for an esports event",
    title: "How to write a sponsor pitch for a community esports event",
    description: "What a sponsor wants to read, what to offer and promise, how to price it fairly, and what to report back after the event, with a one-page outline.",
    tag: "Community", minutes: 6, published: PUBLISHED, updated: PUBLISHED,
    intro: "A sponsor is not giving you money because you asked. They are buying access to people they want to reach. A good pitch says who those people are, what the sponsor gets, and how you will prove it afterwards. It fits on one page.",
    sections: [
      { h2: "What a sponsor wants to know", blocks: [
        { t: "ul", items: [
          "Who is the audience? Be specific: college students in a city, players of one game, a community of a certain size. Use real numbers from your own past events or your own group, never a guess.",
          "What will you do for them? Logo placement, a mention on stream, a stall at the venue, content they can reuse.",
          "What does it cost, and what does it pay for?",
          "How will they know it worked?",
        ] },
        { t: "note", x: "Only promise what you can deliver and measure. If you have not run an event before, say so, and offer a smaller, cheaper package in return for flexibility." },
      ] },
      { h2: "A one-page outline", blocks: [
        { t: "ol", items: [
          "Who we are: one paragraph about your community and event.",
          "The event: date, place, format, expected number of players and visitors (an honest estimate).",
          "The audience: who comes and why they care about the sponsor's field.",
          "What the sponsor gets: a short list of options with prices.",
          "What happens to the money: venue, prizes, equipment. Keep it simple.",
          "What we report afterwards: attendance, stream views, photos, a summary.",
          "Contact: one named person.",
        ] },
      ] },
      { h2: "Packages and pricing", blocks: [
        { t: "p", x: "Offer two or three levels so the sponsor can choose, for example a logo on the ID cards and the stream, a stall at the venue, and title sponsorship. Price each one against what it costs you and what it is worth to the sponsor, not against what you hope to raise. If you are not sure, ask a few sponsors what they would pay." },
        { t: "ul", items: [
          "Logo on the back of every ID card or pass: cheap and visible all day. The [ID card maker](/tools/id-cards/) has a place for a sponsor logo.",
          "Mentions and logo on stream: see [streaming your own event](/guides/stream-your-event/).",
          "A stall or activity at the venue.",
          "Naming a match, a prize or the whole event.",
        ] },
      ] },
      { h2: "Before you send it", blocks: [
        { t: "ul", items: [
          "Check the college or organisation allows sponsors and what it requires.",
          "Check the game publisher's rules on sponsored tournaments.",
          "Check the sponsor is relevant. A small local business with students as customers is easier to win than a large brand.",
          "Send it to a named person, not a general address, with a short message and the one-page pitch attached.",
        ] },
      ] },
      { h2: "After the event", blocks: [
        { t: "p", x: "Send the report you promised within a week: attendance, photos, stream numbers, and a thank you. Sponsors who see the proof renew; sponsors who hear nothing do not." },
      ] },
      { h2: "Who to approach", blocks: [
        { t: "p", x: "Start with businesses that already want your audience, near where your event happens." },
        { t: "ul", items: [
          "Local cafes, restaurants and shops near campus that want students as customers.",
          "Computer, phone and accessory sellers, and internet providers, whose customers play games.",
          "Coaching and education businesses that advertise to students.",
          "College alumni and departments that fund student activities.",
        ] },
        { t: "p", x: "Make a list of ten, learn what each one sells and to whom, and tailor the first line of your message to them." },
      ] },
      { h2: "An email you can copy", blocks: [
        { t: "p", x: "Subject: Sponsoring a student esports tournament on [date]" },
        { t: "p", x: "Hello [name], I am [your name], organising [event name] on [date] at [place], a tournament for [number] teams from [college or community]. Your customers include students like our players, so I would like to offer you [one clear option, for example your logo on every player's pass and a mention on our stream]. The one-page details are attached, with options from [lowest price] to [highest price]. After the event I will send you a short report with attendance and photos. Could we speak for ten minutes this week? Thank you, [name and phone number]." },
      ] },
      { h2: "Common objections", blocks: [
        { t: "ul", items: [
          "\"We have no budget.\" Offer a smaller package, or a product or service instead of money, such as prizes, food or equipment.",
          "\"We do not know esports.\" Explain the audience and what happens at the event in plain words, and invite them to come and see.",
          "\"Send me details.\" Send the one-page pitch the same day and follow up once, a week later.",
          "\"No.\" Thank them and ask whether you may contact them for the next event.",
        ] },
      ] },
    ],
    related: ["run-a-campus-tournament", "stream-your-event", "player-id-cards"],
    cta: { label: "Put a sponsor logo on your cards", href: "/tools/id-cards/" },
  },

  {
    slug: "manage-multiple-games",
    seoTitle: "Managing rosters across more than one game",
    title: "Managing rosters when your community plays more than one game",
    description: "How a club or organisation can keep rosters, substitutes and schedules straight across several games, with a simple structure and a weekly routine.",
    tag: "Community", minutes: 6, published: PUBLISHED, updated: PUBLISHED,
    intro: "Once a club fields teams in two or three games, the spreadsheet that worked for one team starts to break: one player appears in two rosters, a substitute is double-booked, and nobody knows which captain to ask. A few simple rules keep it manageable.",
    sections: [
      { h2: "Keep one list of people and one list per team", blocks: [
        { t: "p", x: "Keep a single master list of everyone in the community: name, contact, and which teams they play for. Then each team has its own roster pointing at that list. A person is entered once, so a change of phone number or a left player is fixed in one place." },
        { t: "ul", items: [
          "Master list: name, contact, join date, status (active, on break, left).",
          "Team roster: game, team name, captain, players, substitutes, coach.",
          "Event entries: which roster entered which event, and when the roster was locked.",
        ] },
      ] },
      { h2: "Name roles clearly", blocks: [
        { t: "ul", items: [
          "Captain: the contact for the team and the event organisers.",
          "Starter and substitute: who plays by default and who covers.",
          "Coach or manager: not a player, may not play unless the rules allow it.",
          "Admin: someone in the community who can change rosters.",
        ] },
      ] },
      { h2: "Rules for players in more than one team", blocks: [
        { t: "p", x: "Decide in advance whether a player may play for two teams in the same game (usually no) and in different games (usually yes). Check each tournament's own rule, since many allow a player on only one team per event. Put your rule in writing so captains do not argue about it." },
      ] },
      { h2: "A weekly routine", blocks: [
        { t: "ol", items: [
          "Monday: captains confirm availability for the coming week.",
          "Midweek: lock rosters for any event that week and send the list to the organiser.",
          "After each event: record results and attendance.",
          "Monthly: remove players who left, add new ones, review who is overloaded.",
        ] },
      ] },
      { h2: "Cards, passes and entry lists", blocks: [
        { t: "p", x: "When you enter an event, the organiser usually wants a roster with names and roles, and may issue passes. If you keep your roster clean, you can export it and the organiser can load it straight into an [ID card maker](/tools/id-cards/). See [player ID cards and passes](/guides/player-id-cards/)." },
      ] },
      { h2: "Privacy", blocks: [
        { t: "p", x: "A community roster holds personal details. Keep it in a place only the admins can open, collect the least you need, and get a guardian's consent for anyone under 18." },
      ] },
      { h2: "A simple roster layout", blocks: [
        { t: "p", x: "A spreadsheet is enough for most communities. Keep one sheet for people and one for each team." },
        { t: "table", head: ["Sheet", "Columns"], rows: [
          ["People", "Name, phone or contact, joined on, status, notes"],
          ["Each team", "Player, role (starter, substitute, coach), in-game ID, contact, joined team on"],
          ["Events", "Event, date, which team entered, roster locked on, result"],
        ] },
        { t: "p", x: "Lock a copy of the roster on the day you enter an event. That copy is what the organiser has, so it is the one to check if a question comes up later." },
      ] },
      { h2: "Handling clashes", blocks: [
        { t: "ul", items: [
          "Keep one shared calendar for all teams, not one per game. A clash is easy to see when everything is in one place.",
          "When two events fall on the same day, decide by a written priority (for example, the event with prize money first) rather than by who shouts loudest.",
          "Ask players for the days they cannot play at the start of each month.",
          "If a substitute is needed, have a short list of who can cover which game before the day, not on it.",
        ] },
      ] },
      { h2: "When people join and leave", blocks: [
        { t: "ol", items: [
          "New player: add them to the master list, put them on one team, tell them the rules and who the captain is.",
          "Moving teams: remove them from the old roster, add them to the new one, and note the date.",
          "Leaving: mark them as left, remove them from every roster and group chat, and delete personal details you no longer need.",
        ] },
        { t: "p", x: "A short group-chat rule helps too: one chat per team for match talk, one announcement chat for the whole community where only admins post." },
      ] },
    ],
    related: ["run-a-campus-tournament", "player-id-cards", "sponsor-pitch"],
    cta: { label: "Make cards for your roster", href: "/tools/id-cards/" },
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
