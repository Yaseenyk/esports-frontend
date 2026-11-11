/**
 * The facts on the comparison page, kept as data so a test can check them. Every competitor statement comes from the research notes in
 * docs/seo-serp-usp-2026-11.md (section 2), read on 11 Nov 2026 from one page of each product. "seen" means it appeared in the text we read;
 * anything else is written as "not verified". Nothing here is guessed, and "not seen" is never presented as "does not exist".
 */
export const CHECKED = "11 Nov 2026";
export const COMPARE_PATH = "/compare/free-tournament-software-india/";

export interface Fact { text: string; status: "seen" | "not verified" }
export interface Competitor {
  id: string; name: string; site: string; pageRead: string;
  price: Fact[]; free: Fact[]; seen: Fact[];
  stronger: string[]; weaker: string[]; verdict: string;
}
const seen = (text: string): Fact => ({ text, status: "seen" });
const nv = (text: string): Fact => ({ text, status: "not verified" });

export const COMPETITORS: Competitor[] = [
  {
    id: "bracketmaker", name: "bracketmaker.app", site: "bracketmaker.app", pageRead: "home page",
    price: [seen("The home page says \"Free to start\"."), nv("Paid plans and their prices")],
    free: [nv("What the free version limits"), nv("Whether sign-in is needed")],
    seen: [seen("Live online brackets that you share with a link."), seen("Templates by team count, such as 4 to 8 team round robin pages."), seen("PDF export of brackets."), nv("A QR code or per-team view"), nv("Share cards, TV or OBS screens, sponsors, a plan wizard")],
    stronger: ["Every Esports Hub tool works with no account, and the points table, schedule, TV screen, poster and winners picture sit next to the bracket.", "It covers the steps around a bracket for in-person events: ID cards, QR gate check-in and certificates."],
    weaker: ["It has pages built for specific team counts. We do not have those yet.", "Its live bracket is shared with a link. Our live page needs a free account.", "It offers PDF export of brackets. We offer share pictures and a TV screen for brackets instead."],
    verdict: "A good fit if you only need a bracket and a shareable link. Choose Esports Hub if the bracket is one step in a longer event.",
  },
  {
    id: "score7", name: "score7.io", site: "score7.io", pageRead: "home page",
    price: [seen("Plans are listed as Starter (Free) and the paid Essentials, Pro and Unlimited."), nv("The prices of the paid plans")],
    free: [seen("The free tier is described as one admin, basic tools, a public page and Score7 branding."), seen("Auto-scheduling, embedding, custom branding, CSV import and export and co-admins are listed as premium."), seen("A page to try it without signing up is linked.")],
    seen: [seen("A public page with a share link and a QR code, and a personal page for every team and player."), seen("A TV mode for the venue screen."), nv("Sponsor strips, a ticker, share pictures, a plan wizard")],
    stronger: ["Our tools are free with no account, with no premium tier for scheduling, branding or co-admins to unlock.", "TV screens carry a sponsor strip and a ticker, and there are ID cards, signed QR passes and gate check-in for the same event."],
    weaker: ["score7.io already has a public event page with a QR code. Ours exists but needs a free account.", "It gives every team and player a personal page. We do not."],
    verdict: "The closest match to our live page. Pick score7.io if a public page with a QR code and team pages is the main need; pick Esports Hub if you want free tools for the whole in-person event.",
  },
  {
    id: "pointstablemaker", name: "pointstablemaker.com", site: "pointstablemaker.com", pageRead: "home page",
    price: [nv("Pricing, because it is not shown on the home page")],
    free: [nv("What is free, and whether sign-in is needed")],
    seen: [seen("It exports a share-ready image for WhatsApp."), seen("14 themes, with presets for cricket, football, PUBG/BGMI and Free Fire."), seen("The page claims 18K+ organisers and 25K+ tables. We did not verify these numbers."), nv("A live page, certificates, TV screens, a plan wizard")],
    stronger: ["Beyond the points table, we cover fixtures, brackets, a TV screen, a poster maker, ID cards and gate check-in, all free.", "Standings can go to a TV screen with sponsors and a ticker, or to a live page with a free account."],
    weaker: ["It has presets for cricket, football, PUBG/BGMI and Free Fire. Our points table is built for battle royale scoring, and cricket and football tables go through the round robin tool.", "It has 14 themes, as we have 14 screen designs, so there is no gap in looks.", "Its page claims a large user base (18K+ organisers, which we did not verify). We have no such numbers and state none."],
    verdict: "Choose pointstablemaker.com if you only want a points table image in a cricket or football preset. Choose Esports Hub if the table is part of a wider event.",
  },
  {
    id: "obscoreboard", name: "obscoreboard.com", site: "obscoreboard.com", pageRead: "home page",
    price: [seen("$90, $120 and $1,200 per year (Hobby, Studio, Professional)."), seen("A free trial is stated, then paid.")],
    free: [seen("A free version is offered on request for charities, schools and volunteer groups."), seen("Hobby is limited to 5 teams and 2 draft scoreboards.")],
    seen: [seen("Sponsor-ready lower thirds, crests and API control."), seen("The sports list does not include esports. Cricket appears as a heading with no link.")],
    stronger: ["Our scoreboard screens are free, need no plugin and no account, and come in 14 designs.", "A sponsor strip and a ticker are built in, and the screen opens from the same tool that holds your standings."],
    weaker: ["It is a professional broadcast tool with lower thirds, crests and API control. Our screens have none of those.", "It is a professional broadcast tool, as far as its home page shows. We are a free toolkit for small in-person events."],
    verdict: "If you run a produced broadcast and need lower thirds or API control, obscoreboard.com is the more capable tool and is paid. If you need a free scoreboard for a venue TV or OBS, use Esports Hub.",
  },
  {
    id: "challonge", name: "challonge.com", site: "challonge.com", pageRead: "pricing page",
    price: [seen("Standard is $0 and ad-supported."), seen("Premier is $12 per month, or $6.99 per month billed yearly."), seen("A Stripe fee of $0.75 per paid-registration order is listed.")],
    free: [seen("The free tier allows up to 256 participants per tournament and is ad-supported."), seen("Premier removes ads, allows 512 participants and adds custom themes for embeds."), seen("Ad removal, embed themes and file uploads are paid.")],
    seen: [nv("Features on its other pages, because we read only the pricing page")],
    stronger: ["There are no participant tiers to pay for, and the tools work with no account.", "We add the steps around the bracket: a poster maker, share pictures, TV screens, ID cards and gate check-in."],
    weaker: ["Its free tier allows up to 256 participants in a tournament. Our bracket maker takes 2 to 64 teams and our double elimination tool 3 to 64.", "Its pricing page shows paid tiers with ads removed and larger limits. We have no paid tier, so we also have no such extras.", "We cannot say what other formats or features it offers, because we did not read those pages."],
    verdict: "Challonge is the safer choice for very large brackets. For a college or cafe event with up to 64 teams, Esports Hub covers the bracket and the rest of the day.",
  },
];

export const COMPARE_TITLE = "Free tournament software for India: an honest comparison";
export const COMPARE_DESCRIPTION = "Compare free tournament software for India: what bracketmaker.app, score7.io, pointstablemaker.com, obscoreboard.com and Challonge offer, and where we are weaker.";
export const COMPARE_H1 = "Free tournament software for India, compared honestly";
export const COMPARE_LEAD = "Esports Hub is a free toolkit for organisers of in-person gaming and sports events: brackets, points tables, fixtures, posters, TV screens, ID cards and gate check-in, with no account for the tools. It is not the best choice for everything. Below is what five other products showed on the pages we read, and where each one is stronger or weaker than us.";

export const COMPARE_FAQ: { q: string; a: string }[] = [
  { q: "What is the best free tournament software for an event in India?", a: "It depends on the job. For a very large online bracket, Challonge's free tier allows up to 256 participants. For a public event page with a QR code and a page for every team, score7.io is a close match. For a points table image in a cricket or football preset, pointstablemaker.com fits. For a free in-person toolkit that carries an event from sign-ups to ID cards, gate check-in, brackets, a TV screen and a winners picture, with no account, use Esports Hub. We do not rank products." },
  { q: "How did you compare these products?", a: "We read one page of each product on 11 Nov 2026 with a simple text extractor: the home page for bracketmaker.app, score7.io, pointstablemaker.com and obscoreboard.com, and the pricing page for challonge.com. We write down only what appeared in that text. When something was not in the text we say not verified, which is not the same as saying a feature does not exist. We did not sign up for any product or test it, and prices and features can change, so check the product's own site before you decide." },
  { q: "Is Esports Hub really free?", a: "The tools are free to use in your browser with no account and no payment. A free account adds saving events online, player sign-up links, shared access for your team and live gate check-in across several doors. Today there is no paid tier. We do not promise that this will never change. Your own costs, such as printing ID cards or a venue screen, are separate." },
  { q: "Where is Esports Hub weaker than the others?", a: "Our bracket tools take up to 64 teams and the round robin up to 40, so very large online tournaments are better served by Challonge. Our points table is built for battle royale scoring, so cricket and football tables go through the round robin tool, while pointstablemaker.com has presets for them. We have no per-team pages, lower thirds or API control, and our live page needs a free account. We also have no bracket pages built for specific team counts yet." },
  { q: "Does Esports Hub work offline or only online?", a: "Most tools work in the browser after the page has loaded, because the calculations and pictures are made on your device, and nothing you type into them is uploaded. The gate check-in scanner can use an offline pack made in the ID card maker, so scans keep working at a door with no signal and are marked as not yet verified until the phone is back online. Features that need a server, such as saving an event online or the live page, need a connection and a free account." },
  { q: "Can I use these tools for cricket, football or kabaddi, not only esports?", a: "Yes for several of them. The round robin generator lists fixtures for any set of teams and keeps a league table with points for a win, draw and loss. The schedule tool times any number of matches across pitches or rooms, and the poster maker has cricket and football looks. The bracket and double elimination tools work for any knockout. The points table is the exception: it is built for battle royale placement and kills, so it does not model cricket scoring such as net run rate." },
  { q: "How do I move from another tool to Esports Hub?", a: "There is nothing to import, and that is a limit as well as a convenience. The tools take team names that you paste, one per line, so you can copy a list from a spreadsheet or from the other tool's page. Brackets and tables are rebuilt from those names and the results you enter. If you are halfway through an event in another product, it is usually safer to finish it there and use Esports Hub for the next one." },
];
