import type { ToolPage } from "@/components/seo/ToolLanding";

/** The words on the public tool pages. Written to describe what the tools really do today, and nothing more. */
export const TOOL_PAGES: Record<string, ToolPage & { title: string; description: string }> = {
  "id-cards": {
    slug: "id-cards", name: "Free ID card maker for events and teams",
    title: "Free ID card maker for events, teams and tournaments",
    description: "Make player and event ID cards free in your browser: add people, pick a design per team, add a QR code and print at real size on A4. No account needed.",
    h1: "Free ID card maker for events, teams and tournaments",
    lead: "Add your teams and people, pick a design for each team, and print real-size cards or download them as pictures. Each card can carry a signed QR code, so the gate can tell a genuine card from a copy. It runs in your browser and needs no account.",
    useHeading: "Make your cards",
    benefits: [
      { title: "Fast roster entry", body: "Type people in, import a spreadsheet, or scan Aadhaar cards with the holder's permission. Scanning happens on your own device and only the last four digits of a number are kept." },
      { title: "Designs for every team", body: "Ten classic and twelve poster-style designs, seven card shapes from wallet cards to phone passes, and an editor to move, resize and recolour anything. Add team and sponsor logos." },
      { title: "Print-ready files", body: "A PDF at real size with crop marks, optional 3 mm bleed, fronts and mirrored backs for double-sided printing, A4 or US Letter, or a zip of PNG pictures." },
    ],
    steps: ["Name your event, choose the game and the card shape, and list your teams.", "Add people by hand, from a sheet, or by scanning Aadhaar cards with their permission.", "Choose a design for each team and adjust it.", "Download the PDF to print, or share the pictures. Create a free account if you also want to save the event online and check guests in live."],
    guides: ["player-id-cards", "event-gate-checkin", "run-a-campus-tournament"],
    faq: [
      { q: "Do I need an account?", a: "No. The card maker works in your browser without one. An account is only needed to save an event online, send players invite links and run live check-in across several doors." },
      { q: "Is the Aadhaar number stored?", a: "No. A card is read inside your browser, the picture is never uploaded, and only the last four digits of the number are kept. Birth dates and Aadhaar digits are not sent to our servers. Only collect an ID if your event needs one." },
      { q: "Can players add their own details?", a: "Yes, with a free account. Send a team an invite link; each player enters a name and photo, and you approve it before it reaches the roster." },
      { q: "What sizes can I print?", a: "Wallet cards (85 × 54 mm), lanyard cards, event badges, wristband strips, poster cards, story cards and phone passes, on A4 or US Letter, with crop marks and optional bleed." },
      { q: "What does it cost?", a: "The tools are free." },
    ],
  },
  "check-in": {
    slug: "check-in", name: "Event gate check-in scanner",
    title: "Event gate check-in scanner with QR passes",
    description: "Scan QR passes at the gate with a phone camera. Genuine passes show the person's photo, role and access zones; copies and edited cards are rejected. Works offline.",
    h1: "Gate check-in that catches fake and copied passes",
    lead: "Open the scanner on any phone, point it at a card, and see the person's photo, team, role and access zones. A copied, edited or already-used pass is flagged straight away. Door staff need no account.",
    benefits: [
      { title: "Signed passes", body: "Each QR carries a signature tied to the person and their role. Change the role or edit the code and the signature no longer matches." },
      { title: "Several doors, one list", body: "With a free account, give each door its own gate key. Every phone shares one list, so nobody gets in twice, and you see which door each guest used." },
      { title: "Keeps working without signal", body: "Use an offline pack made in the ID card maker, or keep scanning live: scans made with no connection are saved on the phone, marked as not yet verified, and sent when the signal returns." },
    ],
    steps: ["Make passes in the ID card maker.", "For one door, load the offline pack. For several doors, save the event online and create a gate key per door.", "Open the gate scanner on the phone and load the pack or paste the key.", "Scan. Green means let them in, amber means already inside, red means turn them away."],
    guides: ["event-gate-checkin", "player-id-cards", "run-a-campus-tournament"],
    faq: [
      { q: "Do door staff need an account?", a: "No. They only need the gate key, which can only check guests in and expires after the time you choose, or an offline pack." },
      { q: "What if the gate has no mobile signal?", a: "Use the offline pack, or keep scanning in live mode: scans are queued and sent when the connection returns. They are clearly marked as not yet verified." },
      { q: "Can I switch a key off?", a: "Yes. Revoke it from your account and that phone stops working immediately." },
    ],
  },
  brackets: {
    slug: "brackets", name: "Free tournament bracket maker",
    title: "Free tournament bracket maker: seeded single elimination",
    description: "Paste your teams in seed order and get a single-elimination bracket with byes added for you. Click winners to move them forward to the final. Free, no account.",
    h1: "Free tournament bracket maker",
    lead: "Paste your team names in seed order and get a clean single-elimination bracket. Byes are added automatically for the top seeds, and a click moves a winner to the next round. Nothing is uploaded and no account is needed.",
    useHeading: "Make your bracket",
    benefits: [
      { title: "Standard seeding", body: "Seed 1 meets the lowest seed first, and the top seeds can only meet late. Byes go to the highest seeds." },
      { title: "Any number of teams", body: "If the number of teams is not a power of two, the bracket rounds up and gives the extra places to byes." },
      { title: "Private", body: "Your team list stays in your browser." },
    ],
    steps: ["Paste your teams, one per line, best seed first.", "Check the generated bracket.", "Click a team after each match to move it forward.", "The champion is shown at the end."],
    guides: ["choosing-a-tournament-format", "run-a-campus-tournament", "points-table"],
    faq: [
      { q: "How are byes decided?", a: "The bracket rounds the number of teams up to the next power of two, and the missing places become byes, given to the highest seeds. With 11 teams there are 5 byes." },
      { q: "Does it support double elimination or round robin?", a: "Not yet. It builds single-elimination brackets. The guide on tournament formats explains the other formats and how many matches each needs." },
      { q: "Can I share the bracket?", a: "You can print or take a screenshot. Sharing a link is not built yet." },
    ],
  },
  "points-table": {
    slug: "points-table", name: "Battle royale points table calculator",
    title: "Battle royale points table calculator (free)",
    description: "Free battle royale points table calculator: set placement and kill points, enter each team's results and get ranked standings with tie-breakers.",
    h1: "Battle royale points table calculator",
    lead: "Set your own placement points and kill points, enter each team's placement and kills for every match, and get ranked standings with tie-breakers. Free, no account, and everything is worked out in your browser.",
    useHeading: "Work out your standings",
    benefits: [
      { title: "Your scale, your rules", body: "Type any placement scale and kill value. The example scale is only an example: use the one in your own rulebook." },
      { title: "Clear tie-breakers", body: "Ties are broken by most wins, then most kills, then the better placement in the last match, then name, so the same input always gives the same order." },
      { title: "Export", body: "Download the standings as a CSV file for a spreadsheet or to post to your players." },
    ],
    steps: ["Enter your placement points and the points per kill.", "Choose how many matches were played.", "Enter each team's placement and kills for each match.", "Read the ranked table and download it if you want a copy."],
    guides: ["points-table", "esports-tournament-rules-template", "choosing-a-tournament-format"],
    faq: [
      { q: "Are these the official points for BGMI, Free Fire or Valorant?", a: "No. The numbers shown on first load are an example. Official tournaments publish their own scales, and they change between seasons. Enter the scale from your own rulebook." },
      { q: "How are ties decided?", a: "By most first places, then most total kills, then the better placement in the last match, then team name. Write your own tie-breakers in your rules before the event." },
      { q: "Is my data saved?", a: "Nothing is sent anywhere. The numbers stay in your browser tab and are gone when you close it, so download the CSV if you want to keep them." },
    ],
  },
};
