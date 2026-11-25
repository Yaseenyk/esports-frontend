/**
 * The Free Fire tournament hosting comparison, kept as data so tests/compare-ff.test.mjs can check it.
 *
 * Where the list comes from: on 25 Nov 2026 ChatGPT (asked from India, through treg) answered "best free website to host a free fire
 * tournament" with battlezy.in, squads-space.com, gamzone.in, pointx.in and battlefy.com (D:\Streamer OS\resume\seo-PLAN.md, section 5).
 * Each site's home page was read on 25 Nov 2026. "seen" means the words appeared on that page (quoted where it matters); anything else
 * is "not verified", which never means the feature is missing. squads-space.com did not resolve (DNS) on 25 Nov 2026, so it is left out.
 * pointx.in and battlefy.com load their content with JavaScript, so only their page title and description could be read.
 */
import type { Fact } from "@/lib/compare";

export const FF_CHECKED = "25 Nov 2026";
export const FF_COMPARE_PATH = "/compare/free-fire-tournament-hosting-sites/";
export const FF_COMPARE_TITLE = "Free Fire tournament hosting sites, compared";
export const FF_COMPARE_DESCRIPTION = "Battlezy, Game Zone, PointX, Battlefy and Esports Hub for a Free Fire tournament: what each site's own page says, checked on 25 Nov 2026, and where we fall short.";
export const FF_COMPARE_H1 = "Free Fire tournament hosting sites, compared honestly";
export const FF_COMPARE_LEAD = "If you want to run a Free Fire tournament, the sites below come up most often. For each one we read its own home page on 25 Nov 2026 and wrote down only what it said. Esports Hub is our site, so read what we say about ourselves with that in mind; we list where we are weaker too.";

export interface FfSite {
  id: string; name: string; url: string; pageRead: string;
  what: Fact[]; money: Fact[]; features: Fact[];
  stronger: string[]; weaker: string[]; verdict: string;
}
const seen = (text: string): Fact => ({ text, status: "seen" });
const nv = (text: string): Fact => ({ text, status: "not verified" });

export const FF_SITES: FfSite[] = [
  {
    id: "battlezy", name: "Battlezy", url: "https://battlezy.in/", pageRead: "home page",
    what: [seen("Describes itself as a place to \"Launch and manage esports tournaments\", and says \"anyone can create and host tournaments\"."), seen("Lists BGMI, PUBG, Call of Duty, Free Fire and Mini Militia as supported games.")],
    money: [seen("Says \"Battlezy is completely free to use\" and that it does not charge fees for hosting tournaments."), seen("Says tournaments can be \"free or paid\"."), nv("How prize money is paid out")],
    features: [seen("\"Bracket trees are generated automatically\"."), seen("\"Dynamic tables auto-calculate rankings\" from the results you enter."), seen("The Create and Join buttons lead to a sign-in page, and there is a Play Store link."), nv("Custom room ID and password sharing")],
    stronger: ["The Esports Hub tools work without signing in: open the Free Fire points table and start typing.", "Esports Hub never handles money, so there are no paid tournaments, wallets or payouts to worry about.", "It adds the in-person parts: ID cards, QR gate check-in and a TV screen for standings."],
    weaker: ["Battlezy is also a place where players find and join tournaments. Esports Hub does not bring players to you: you share your own link.", "Battlezy supports paid tournaments if you want entry fees. Esports Hub does not, by design.", "Battlezy links an Android app. Esports Hub has no app, only the website."],
    verdict: "A fit if you want a platform where players sign up and join, including paid events. Choose Esports Hub if you already have your teams and want free tools with no sign-in and no money involved.",
  },
  {
    id: "gamzone", name: "Game Zone", url: "https://gamzone.in/", pageRead: "home page",
    what: [seen("Calls itself an \"ONLINE competitive mobile esports platform\" where organisers can \"Publish your own custom room tournaments\" and players \"Enter private room lobbies\"."), seen("Names Free Fire, BGMI and PUBG Mobile.")],
    money: [seen("The upcoming events listed were marked \"Free (Community)\", with the prize pool shown as \"TBA\"."), nv("What, if anything, organisers pay")],
    features: [seen("Sign-in is for a player profile, support tickets and registrations; the page says user accounts and Google sign-in are \"preparing for full launch\"."), nv("A points table you can use"), nv("A bracket view")],
    stronger: ["Every Esports Hub tool you need for a Free Fire event works today with no account.", "The Esports Hub Free Fire points table states its scoring rules on the page, and you can change the placement and kill points."],
    weaker: ["Game Zone is built around players entering custom room lobbies on its platform. Esports Hub is a set of tools for the organiser and has no player lobby.", "Game Zone lists upcoming tournaments for players to find. Esports Hub has no public tournament list that players use today."],
    verdict: "Worth a look if you want your custom room tournament listed where mobile players browse. Choose Esports Hub for the organiser's tools: points table, brackets, registration form and ID cards.",
  },
  {
    id: "pointx", name: "PointX", url: "https://pointx.in/", pageRead: "home page title and description (the rest of the page did not load as text)",
    what: [seen("Its title reads \"Free Fire Tournament & Point Table Platform\"."), seen("Its description names a \"Point Calculation Engine, OBS Live Broadcast Overlays & 4K Graphics Studio\".")],
    money: [nv("Whether it is free or paid"), nv("Entry fees or prizes")],
    features: [seen("\"Automated Free Fire point calculation\" and \"real-time OBS Studio browser source scoreboards\"."), nv("Whether an account is needed"), nv("Brackets")],
    stronger: ["Esports Hub covers more than Free Fire: BGMI, COD Mobile and Valorant points tables, brackets and fixtures for other games.", "Esports Hub states on each page that its tools are free and need no account."],
    weaker: ["PointX is built around Free Fire broadcasts: overlays and a graphics studio are what its page leads with. If stream graphics matter most to you, look at it first.", "We could not read PointX's prices or features beyond its title and description, so this row is thin."],
    verdict: "A likely fit for streamed Free Fire events that need broadcast graphics. Choose Esports Hub for a free points table, brackets and the paperwork around the event.",
  },
  {
    id: "battlefy", name: "Battlefy", url: "https://battlefy.com/", pageRead: "home page title and description (the rest of the page did not load as text)",
    what: [seen("Describes itself as \"the simplest way to start, manage, and find esports tournaments\"."), nv("Whether Free Fire is supported")],
    money: [nv("Prices or a free plan"), nv("Entry fees or prizes")],
    features: [nv("A battle royale points format"), nv("Whether an account is needed")],
    stronger: ["The Esports Hub Free Fire points table is made for battle royale scoring (placement points plus kill points, with tie-breakers) and works without an account."],
    weaker: ["Battlefy is also a place to find tournaments, so players can discover yours there. Esports Hub does not bring players to you.", "Esports Hub is a small project run by one developer, with no player community of its own."],
    verdict: "Its page did not let us check Free Fire support or prices, so check its site before you decide. Choose Esports Hub if you want a free Free Fire points table with no sign-in.",
  },
];

/** What Esports Hub has and does not have, from the code and the site's rules (no money, no app). */
export const FF_US = {
  what: ["Free browser tools for organisers: a Free Fire points table, single and double elimination brackets, a registration form, ID cards, gate check-in and a TV screen for standings."],
  money: ["Free, with no paid version. No entry fees, wallets, prizes or payouts on the site, by design."],
  features: ["No account for the tools. A free account adds saving events online and live check-in.", "No app, and the free tools do not manage custom room IDs and passwords."],
};

export const FF_COMPARE_FAQ: { q: string; a: string }[] = [
  { q: "What is the best free website to host a Free Fire tournament?", a: "It depends on what you need the site to do. If you want players to find your tournament and sign up on a platform, Battlezy and Game Zone are built for that, and Battlezy also allows paid tournaments. If stream graphics matter most, PointX leads with overlays. If you already have your teams and want free tools with no sign-in, Esports Hub gives you a Free Fire points table, brackets, a registration form and ID cards. Read each site's own page before you decide, because features and prices change." },
  { q: "Which of these sites handle entry fees and prize money?", a: "On the pages we read on 25 Nov 2026, Battlezy said tournaments can be free or paid, and Game Zone listed its upcoming events as free with the prize pool to be announced. We could not see prices for PointX or Battlefy. Esports Hub handles no money at all: no entry fees, no wallets, no prizes and no payouts. If you collect fees or pay prizes, you do that yourself, outside the site, and you should check the rules that apply where you live." },
  { q: "Do I need an app to run a Free Fire tournament?", a: "No. Esports Hub runs in the browser on a phone or a computer and has no app. Battlezy's home page links to a Play Store app. For Game Zone, PointX and Battlefy we did not see an app on the pages we read." },
  { q: "Can players find my tournament on Esports Hub?", a: "Not in a useful way today. Esports Hub is a set of tools for the person running the event; it does not have a large audience of players browsing for tournaments. Share your registration link and your points table picture in your own WhatsApp, Discord or Instagram groups. If you need a platform where players already look for matches, the sites above that list tournaments are a better fit for that part." },
  { q: "How did you compare these sites?", a: "These are the sites ChatGPT named on 25 Nov 2026 when asked for the best free website to host a Free Fire tournament. We read each site's home page that day and wrote down only what it said, quoting where it matters. Where something was not on the page we say not verified, which does not mean the feature is missing. squads-space.com was also named, but the address did not load for us, so it is not in the table. We did not sign up for or test any site." },
  { q: "Is the Esports Hub Free Fire points table really free?", a: "Yes. It needs no account and no payment, and the scoring rules it uses are written on the page: placement points plus points per kill, with fixed tie-breakers, and you can change the points. The results you type stay in your browser. There is no paid version and the tool pages carry no adverts." },
];
