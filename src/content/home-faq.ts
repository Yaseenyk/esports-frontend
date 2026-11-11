import { CARD_DESIGNS, CARD_SHAPES } from "@/lib/facts";

/** The home page questions. Written to say what the app actually does, because they are also the FAQ structured data search engines read. */
export const HOME_FAQ: { q: string; a: string }[] = [
  {
    q: "What is Esports Hub and what can I do with it?",
    a: "Esports Hub is a set of free tools and practical guides for people who run esports and gaming events: college tournaments, club cups, gaming cafe leagues and community events in India.\n\nYou can make player and event ID cards with a signed QR code, check people in at the gate with a phone, draw single and double elimination brackets, work out battle royale standings from placement and kill points, generate round robin fixtures, turn a match count into a timed schedule, print winner certificates, collect team registrations, and put your standings or bracket full screen on a TV or a stream. It is made by an independent developer, not by a game publisher.",
  },
  {
    q: "How does the ID card maker work?",
    a: `You add your teams and people (type them in, import a spreadsheet, or scan an Aadhaar card on your own device with the holder's permission), pick one of ${CARD_DESIGNS} ready-made designs, and the maker draws a card for every person. Everything on a card can be moved, recoloured or deleted, so a design is a starting point and not a template you are stuck with.\n\nThere are ${CARD_SHAPES} card shapes: wallet card, lanyard badge, event badge, wristband strip, poster card, story card and a phone-sized digital pass. You can print the cards on A4 sheets, download a PDF or a zip of images, and give each person a pass link. Every card carries a QR code that is cryptographically signed, so a forged code is rejected at the gate, and a copied one is flagged the second time it is scanned.`,
  },
  {
    q: "Can I check people in at the gate without internet?",
    a: "Yes. The gate scanner runs in a phone browser and can be added to the home screen. Each QR pass is checked on the phone against its signature, so a forged pass is refused even when there is no signal, and a second scan of the same pass is flagged as already used.\n\nScans taken offline wait in a queue on the phone and are sent when the connection returns. If you save the event online with a free account, you can give each gate its own key, run several phones at once, and watch a live count of who has arrived, with a big counter you can show on a screen. Names stay hidden on that screen unless you choose to show them.",
  },
  {
    q: "How do I make a bracket, a points table or a match schedule?",
    a: "Paste your team names, one per line. The bracket maker seeds them, adds byes when the number is not a power of two, and lets you click a winner to advance them. The double elimination tool does the same for three to 64 teams with a winners bracket, a losers bracket, a grand final and a reset final when the losers-bracket team wins the first final.\n\nFor battle royale, the points table calculator takes placement and kills for every match, applies a points scale you can change, and ranks the teams with a clear tie-break. The round robin generator pairs every team with every other team and tracks results into a league table, and the schedule maker turns your number of matches, lobbies, match length and breaks into a timed run-sheet.",
  },
  {
    q: "Can I show standings or a bracket on a TV, projector or stream?",
    a: "Yes. Every table, bracket and schedule tool has an Open the screen button that opens a clean, full-screen view with large text and safe margins for TVs. There are 14 screen designs, from neon stream overlays to stadium scoreboards and light styles for bright projector rooms, and five views: standings, league table, run-sheet with a now and next marker, knockout bracket and a countdown.\n\nWhile the tool page stays open, the screen follows every change you make. For OBS or YouTube, choose a transparent background and capture the window or add the link as a browser source. A copied link is a snapshot that carries its data inside the address, so nothing is uploaded to a server.",
  },
  {
    q: "How do teams register for my tournament?",
    a: "You can copy a ready-made team registration form, or, with a free account, create a registration link for your event. A captain opens the link on a phone, enters the team name, contact and players, and the submission arrives in your app. You approve or reject it, and approving creates the team and its roster, so there is nothing to retype.\n\nYou set the closing time and the maximum number of teams, and the page tells the captain when registration is closed or full. The registration page can be read in English, Hindi and Marathi.",
  },
  {
    q: "Is it free, and what does an account add?",
    a: "The tools are free and work in your browser without an account: ID cards, brackets, double elimination, points tables, round robin, schedules, certificates, the gate scanner and the display screens. You do not have to sign up to try any of them.\n\nA free account adds the things that need a server: saving an event online, invite links so players add their own details and photos, team registration with approvals, live check-in across several phones, and extra organisers on one event as editors or view-only members. Ads are not shown today.",
  },
  {
    q: "What happens to players' personal details?",
    a: "Cards are made in your browser. Scanning an Aadhaar card happens on your own device, the picture is never uploaded, and only the last four digits of the number are kept. Birth dates and Aadhaar digits are never sent to the servers, even if you save the event online.\n\nIf you do save an event online, only names, teams, roles, access zones, minor flags and photos are sent. Only collect an ID if your event needs one, and tell players why. The privacy page lists what is stored.",
  },
  {
    q: "Which games and kinds of events is it for?",
    a: "Any game that has teams, rounds and points. The games directory lists 28, including BGMI, Free Fire MAX, Valorant, Counter-Strike 2, Call of Duty: Mobile, EA Sports FC and Chess, and brackets and round robin also suit in person sports such as football and cricket. The points table is built for battle royale placement and kill scoring, and brackets and round robin fit anything with head-to-head matches.\n\nThe guides cover how to run a college tournament, write rules, choose a format, run a Free Fire, BGMI or Valorant event, print ID cards and use QR attendance. They are practical checklists, and where a game publisher's rules matter, they tell you to check the publisher's own page.",
  },
  {
    q: "Do I need to install anything, and which devices work?",
    a: "No. Everything runs in a web browser on a phone, tablet or computer, and you can add the gate scanner to a phone's home screen so it opens like an app. Scanning needs a phone camera; printing works from any computer or from a phone connected to a printer.\n\nThe ID card maker keeps your work in the browser, so you can save a project file and open it again later or on another device, or sign in to keep events online. Use a recent version of Chrome, Edge, Firefox or Safari.",
  },
  {
    q: "Who makes Esports Hub, and is it affiliated with any game publisher?",
    a: "Esports Hub is an independent project and is not affiliated with any game publisher. Game names and logos are trademarks of their owners and are used only to identify the games. The about page explains how the guides are written and kept up to date, and the contact page is the way to report a mistake or ask for a feature.",
  },
];
