import type { ToolPage } from "@/components/seo/ToolLanding";
import type { PointsPreset } from "@/components/tools/PointsTable";

/**
 * Landing pages for the points table tool, one per game people search for. They are the same working tool with a game's name on it.
 * The scale on them is an example, said so on the page: this site never states a publisher's official points.
 * Kept apart from TOOL_PAGES, which holds exactly one entry per tool.
 */
export type GamePage = ToolPage & { title: string; description: string; preset: PointsPreset; path: string };

const CRUMB = { name: "Points table maker", href: "/tools/points-table/" };

export const GAME_PAGES: Record<PointsPreset, GamePage> = {
  bgmi: {
    slug: "bgmi-points-table", path: "/points-table/bgmi/", crumb: CRUMB, preset: "bgmi", name: "BGMI points table maker",
    title: "BGMI points table maker and points system (free)",
    description: "Free BGMI points table maker for custom rooms: set placement and kill points, enter each squad's results and get ranked standings you can share on WhatsApp.",
    h1: "BGMI points table maker and points system",
    lead: "A BGMI custom-room points system adds placement points (for where a squad finished) to kill points, match after match. Enter your own scale, type each squad's place and kills, and the table ranks them with tie-breakers. Share it as a picture on WhatsApp or show it on a TV. Free, no account. The scale shown is an example, not an official one.",
    useHeading: "Make your BGMI points table",
    benefits: [
      { title: "Your rulebook, your numbers", body: "Type any placement scale and any kill value. The starting scale is only an example of the kind used in custom rooms: replace it with the scale in your own rules or the publisher's rulebook." },
      { title: "A table you can post", body: "Share the standings as a square post or a story picture, or send them as a WhatsApp text. The picture uses one of the 14 screen designs and carries a small made-with line." },
      { title: "Clear tie-breakers", body: "Squads on the same total are ordered by most wins, then most kills, then the better place in the last match, then name, so the same results always give the same table." },
    ],
    steps: ["Set the placement points, the points per kill and how many matches were played.", "Add a row for each squad and type its place and kills for every match.", "Read the ranked standings, which update as you type.", "Share the table as a picture on WhatsApp or Instagram, download it as CSV, or open it on a TV."],
    guides: ["bgmi-custom-room-tournament", "points-table", "esports-tournament-rules-template", "stream-your-event"],
    faq: [
      { q: "How does a BGMI custom room points system work?", a: "Most custom-room events score each match in two parts. Placement points depend on where the squad finished, with the last survivors earning the most, and kill points are a fixed number for every elimination. A squad's match score is the two added together, and its tournament total is the sum over all matches. This tool does exactly that sum, ranks the squads by total, and shows the points earned in each match so players can check the table against their own notes." },
      { q: "What placement points should I use for BGMI?", a: "Use the scale in your own rulebook, or in the publisher's rulebook if you are copying an official event. This page starts with an example scale of 10, 6, 5, 4, 3, 2, 1 and 1 points for the first eight places and one point per kill, because a starting point is easier to edit than a blank box. It is only an example, not an official scale, and it may differ from the current rules of any official BGMI tournament, so always set your own numbers and publish them before the first match." },
      { q: "How do I make a points table for a BGMI custom room tournament?", a: "Set the placement points and the points per kill, choose how many matches you will play, then add one row per squad. After every match type each squad's place and kills in its row. The standings below update by themselves and show rank, points per match, kills, wins and the total. When the last match is done you can share the table as a picture, download it as a CSV file for a spreadsheet, or open it on a TV for the room. Nothing needs installing and no account is needed." },
      { q: "How are ties broken in the table?", a: "When two squads have the same total, the order is decided by most wins (matches finished first), then most kills, then the better placement in the last match, then the squad name. A row that was ordered by these rules is marked tie-break in the table. These are this tool's rules, not an official standard, so write the tie-breakers you want in your event rules before the first match and, if they differ, work out the order by hand for the tied squads." },
      { q: "Can I send the BGMI points table to WhatsApp as a picture?", a: "Yes. In the last step press Share on WhatsApp or Instagram. On a phone that can share files the share sheet opens with the picture attached; on a computer the PNG is saved and you attach it yourself. You can choose a square post or a story shape, change the design under the screen look, and add sponsor logos and a ticker line that appear on the picture. There is also a button that sends the standings as plain text on WhatsApp for groups that do not show images well." },
      { q: "Can I show the standings on a TV or in a stream?", a: "Yes. Open the screen from the last step and put that window on a TV, a projector or a stream capture. Choose the transparent background if you capture it in OBS. A copied link shows the table as it is at that moment, so to keep a stream updating keep the screen window open and capture it, then keep typing results into the tool and the screen follows. A free account also lets you publish the table to a live page for your event." },
      { q: "Is this the official BGMI points table?", a: "No. It is a free calculator for the organisers of your own events: college tournaments, cafe nights and community scrims. It does not pull results from any game or from any official tournament, and it is not affiliated with the game's publisher. You type the results yourself. If you are looking for the standings of an official event, use the organiser's own channels. For your own event, the table is only as accurate as the results you enter." },
    ],
  },
  "free-fire": {
    slug: "free-fire-points-table", path: "/points-table/free-fire/", crumb: CRUMB, preset: "free-fire", name: "Free Fire points table maker",
    title: "Free Fire points table maker and points system",
    description: "Free Fire points table maker for custom rooms: set placement and kill points, enter each team's results and get ranked standings for WhatsApp, a TV or a stream.",
    h1: "Free Fire points table maker and points system",
    lead: "A Free Fire custom-room points system gives each team placement points for where it finished plus points for every kill, added up over all matches. Enter your own scale, type each team's place and kills, and get a ranked table with tie-breakers to share on WhatsApp or show on a TV. Free, no account. The scale shown is an example, not an official one.",
    useHeading: "Make your Free Fire points table",
    benefits: [
      { title: "Set the points yourself", body: "Type your placement points and your points per kill. The starting scale is an example only, so replace it with the scale in your own rules or the publisher's rulebook." },
      { title: "Made for custom-room nights", body: "Add as many teams as you have, enter up to twelve matches, and see the points each team earned in every match next to its total, so nobody has to ask how a score was reached." },
      { title: "Post it or put it on screen", body: "Turn the standings into a picture for WhatsApp or Instagram, send them as a text, or open them full screen on a TV, a projector or OBS with an optional sponsor strip." },
    ],
    steps: ["Enter the placement points, the points per kill and the number of matches.", "Add each team and type its place and kills for every match.", "Check the ranked standings, which update as you type.", "Share the picture on WhatsApp or Instagram, download the CSV, or open the screen for a TV."],
    guides: ["free-fire-tournament-organiser", "points-table", "esports-tournament-rules-template", "run-a-campus-tournament"],
    faq: [
      { q: "How does a Free Fire points system work in a custom room?", a: "A common custom-room system gives every team points for its finishing position and extra points for each kill. After each match you add the two parts together, and the table ranks teams by the total across all matches. This tool does that arithmetic for you. You choose the placement points and the points per kill, type each team's result, and it shows each match's points, the total and the rank, so a disagreement can be settled by looking at the row." },
      { q: "What are the Free Fire placement and kill points?", a: "That depends on the event, and this site does not state an official scale. The page starts with an example of 10, 6, 5, 4, 3, 2, 1 and 1 points for the first eight places and one point per kill so that the table is not empty. It is a sample, and it may not match the current rules of any official Free Fire tournament. Use the scale from your own rulebook or from the publisher's published rules, and tell the teams the numbers before the first match." },
      { q: "How do I make a Free Fire points table?", a: "Set your placement points, the points per kill and the number of matches, then add one row for each team and type its place and kills for every match once the match ends. The standings update at once. Download them as a CSV file if you want a spreadsheet copy, or share the table as a picture. It runs in your browser, works on a phone, needs no install and does not ask you to sign in." },
      { q: "What happens when two Free Fire teams have the same points?", a: "The tool orders them by most wins, then most kills, then the better placement in the last match, then the team name, and it marks the row as a tie-break so you can see it. These are the tool's own rules, not an official standard. If your event uses different tie-breakers, put them in your rules ahead of time and check the tied teams by hand, because the table cannot know a rule you did not tell it." },
      { q: "Can I share the Free Fire points table on WhatsApp?", a: "Yes. Use the share button in the last step to make a picture. On a phone it opens the share sheet with the image attached, and on a computer it saves a PNG for you to attach. Pick a square post for groups and feeds or a story for status updates, and choose one of the 14 designs. If the group does not show images well, send the standings as a text message with the other button instead." },
      { q: "Can I put the standings on a TV at the venue?", a: "Yes. Press Open the screen and move that window to the TV or projector, then press F for full screen. The screen follows the tool, so every result you type appears on it. Sponsor logos and a scrolling announcement line can be added, and a transparent background is available for OBS. A free account also lets you publish the standings on a live page that players can open on their own phones." },
      { q: "Is this an official Free Fire tool?", a: "No. It is an independent, free tool for people who run their own tournaments, and it is not affiliated with the publisher of the game. It does not connect to the game or to any official results: you enter the placements and kills yourself, so the table is only as correct as your entries. Use it for college events, cafes and community scrims, and use the organiser's own channels for official tournament standings." },
    ],
  },
};
