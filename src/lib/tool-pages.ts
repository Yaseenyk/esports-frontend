import type { ToolPage } from "@/components/seo/ToolLanding";

/** The words on the public tool pages. Written to describe what the tools really do today. */
export const TOOL_PAGES: Record<string, ToolPage & { title: string; description: string }> = {
  "id-cards": {
    slug: "id-cards", name: "Player ID cards and passes",
    title: "Player ID cards and passes for esports events",
    description: "Make player ID cards, signed QR passes and lanyard badges for esports and gaming events. Read Aadhaar cards in your browser, design a card per team, print at real size.",
    h1: "Player ID cards and passes for your event",
    lead: "Add your teams and players, pick a design for each team, and print real-size cards or download them as pictures. Every card carries a signed QR pass, so the gate can tell a genuine card from a copy.",
    benefits: [
      { title: "Fast roster entry", body: "Type people in, import a sheet, or scan Aadhaar cards. Cards are read inside your browser and only the last four digits of a number are ever kept." },
      { title: "Designs that look like your event", body: "Ten classic and twelve poster-style designs, seven card shapes from wallet cards to phone passes, and an editor to move, resize and recolour anything." },
      { title: "Print-ready", body: "A PDF at real size with crop marks and optional 3 mm bleed, fronts and mirrored backs for double-sided printing, or a zip of PNG pictures." },
    ],
    steps: ["Name your event, choose the game and the card shape, and list your teams.", "Add people: by hand, from a sheet, or by scanning Aadhaar cards with their permission.", "Choose a design for each team and adjust it.", "Download the PDF to print, or share the pictures. Save the event online to check guests in live."],
    faq: [
      { q: "Is the Aadhaar number stored?", a: "No. Cards are read inside the browser, the picture is never uploaded, and only the last four digits are kept, in line with UIDAI rules. Birth dates and Aadhaar digits are not sent to our servers." },
      { q: "Can players add their own details?", a: "Yes. Send a team an invite link: each player enters a name and photo, and the organiser approves it before it reaches the roster." },
      { q: "Does it work without internet?", a: "The card maker runs in your browser. You need to be online to sign in and to use the online features such as live check-in." },
      { q: "What does it cost?", a: "Accounts are free." },
    ],
  },
  "check-in": {
    slug: "check-in", name: "Gate check-in scanner",
    title: "Gate check-in scanner for events: genuine passes only",
    description: "Scan QR passes at the gate with a phone camera. Genuine passes show the person's photo, role and access zones; copies and edited cards are rejected. Works offline and live across several doors.",
    h1: "Gate check-in that catches fake and copied passes",
    lead: "Open the scanner on any phone, point it at a card, and see the person's photo, team, role and access zones. A copied, edited or already-used pass is flagged straight away.",
    benefits: [
      { title: "Signed passes", body: "Each QR carries a signature tied to the person and their role. Change the role or edit the code and the signature no longer matches." },
      { title: "Several doors, one list", body: "Give each door its own gate key. Every phone shares one list, so nobody gets in twice, and you see who came through which door." },
      { title: "Keeps working without signal", body: "Scans made with no connection are saved on the phone, clearly marked as not yet verified, and sent together when the signal returns." },
    ],
    steps: ["Save your event online from the ID card maker.", "Create a gate key for each door and hand it to the person on that door.", "On the gate phone, open the scanner and paste the key.", "Scan. Green means let them in, amber means already inside, red means turn them away."],
    faq: [
      { q: "Do door staff need an account?", a: "No. They only need the gate key, which can only check guests in and expires after the time you choose." },
      { q: "What if the gate has no mobile signal?", a: "Use the offline pack from the ID card maker, or keep scanning in live mode: scans are queued and sent when the connection returns." },
      { q: "Can I switch a key off?", a: "Yes. Revoke it from the app and that phone stops working immediately." },
    ],
  },
  brackets: {
    slug: "brackets", name: "Tournament bracket maker",
    title: "Free tournament bracket maker for gaming events",
    description: "Paste your teams, get a seeded single-elimination bracket with byes added for you, and click winners to move them forward to the final.",
    h1: "A tournament bracket in seconds",
    lead: "Paste your team names in seed order and get a clean single-elimination bracket. Byes are added automatically, and a click moves a winner to the next round.",
    benefits: [
      { title: "Seeded properly", body: "Top seeds are kept apart until the later rounds, and byes go to the highest seeds." },
      { title: "Any number of teams", body: "Not a power of two? The bracket adds byes for you." },
      { title: "Nothing uploaded", body: "Your team list stays in your browser." },
    ],
    steps: ["Paste your teams, one per line, best seed first.", "Check the generated bracket.", "Click a team after each match to move it forward.", "The champion is shown at the end."],
    faq: [
      { q: "Does it support double elimination?", a: "Not yet. It builds single-elimination brackets." },
      { q: "Can I share the bracket?", a: "You can print or screenshot it. Sharing links is not built yet." },
    ],
  },
};
