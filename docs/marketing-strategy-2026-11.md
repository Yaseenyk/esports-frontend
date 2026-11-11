# Esports Hub: positioning, SEO and growth plan (Nov 2026)

Built from `docs/seo-research-2026-11.md`, `docs/seo-serp-usp-2026-11.md` and `docs/data/keywords-usp-2026-11.csv` (355 keywords, India, Google Ads volumes). Where a fact is unverified the text says so.

## 0. The honest starting point

- Nobody can promise rank 1. For head terms ("bracket maker") established tools and app-store listings hold the top. For specific searches ("free fire points table", "free fire tournament poster", "fixture generator", "qr code attendance") the results are thin and often not tools at all. That is where a free, no-login tool can reach page one.
- A new subdomain needs time. Expect indexing within days to weeks, first impressions in weeks, and real rankings in 2 to 4 months if the pages are good and get links. Plan for that, do not count on it.
- Free is our wedge, but not our only one. A competitor (score7.io) already gives a public event page with a QR code, and pointstablemaker.com already exports WhatsApp-ready tables. What nobody was seen to offer is the whole chain in one free place for in-person events: sign-up to ID cards to gate check-in to brackets to live page to TV screen to winners pack. Sell the chain.
- We cannot see our own numbers yet: Search Console has no property for this site and Analytics has no stream for it (section 7). Fix this first.

## 1. Positioning

**Who:** people who run tournaments in person in India: college esports clubs and fests, gaming cafes, local BGMI, Free Fire and Valorant organisers, also cricket and football leagues for the fixture and points tools.

**Promise:** run the whole event from your phone, for free, without installing anything or making an account.

**Primary line (recommended):** **From sign-up to trophy. Free.**
Why: it names the whole chain (our difference), it is four words, and "free" is the last word people remember.

Alternates, in order of preference:
1. Run your whole tournament, free.
2. The free toolkit for tournament organisers.
3. Everything an organiser needs. Nothing to pay.

**Hinglish line for Instagram, reels and WhatsApp (tone for Gen Z in India):** **Tournament chalao. Poora free.** Use it in social posts, not on the site's main H1.

**One-sentence description (meta, directories, bios):** Free tools to run a gaming or sports tournament: sign-ups, ID cards, brackets, points tables, live results, TV screens and gate check-in. No account needed.

**Proof points we can state today (all true in the product):** works in the browser; no account for the tools; signed QR passes that reject forged codes; check-in works offline; Hindi and Marathi on the player-facing pages; 14 TV screen designs; 23 ID card designs. Do not state numbers of users, events or "best", "No 1" or "only" until verified.

**Never say:** "India's No 1", "trusted by N organisers", "only tool that...". Say what the product does.

## 2. Keywords to pages (what to build and rewrite)

Volumes are monthly searches in India (Google Ads, merged variants, treat as rough).

| Page (path) | Target keywords | Volume | Action |
|---|---|---|---|
| `/tools/poster/` (new) | free fire tournament poster 1,600; cricket tournament poster maker 590; tournament poster maker 260 | ~2,400+ | Build a poster maker on the share-card engine: event name, date, prize, sponsor logos, templates for Free Fire, BGMI, Valorant, cricket, football. Best easy win: no dedicated poster page ranks. |
| `/games/bgmi-points-table/` and `/games/free-fire-points-table/` (new, indexable game landing pages with the tool embedded) | bgmi points table 1,000; bgmi points system 1,000; free fire points table 480; pubg mobile custom room results 2,400 | ~4,900 | Game pages with the points-table preset, the official-looking scale (flagged as example, link to the publisher's rules), a WhatsApp image button, and a custom-room results guide. |
| `/tools/points-table/` (rewrite title and intro) | points table maker 320 | 320 | Add cricket and football presets and wording; "no install" angle against app-store results. |
| `/tools/schedule/` (rewrite) plus fixture framing | fixture generator / fixture maker 880; round robin tournament 1,900 (on `/tools/round-robin/`) | ~2,800 | Re-title for fixtures with cricket, football, kabaddi and esports examples. |
| `/tools/brackets/` (rewrite) | tournament bracket maker 480; tournament bracket generator 590 | ~1,070 | Lead with what happens after the bracket (live page, TV screen, share card). Add bracket pages by team count: 4, 6, 8, 16 teams. |
| `/tools/check-in/` (retitle) | qr code attendance 720 | 720 | Title and copy say event attendance and QR passes; add a short demo. |
| `/tools/display-screen/` (retitle) | obs scoreboard 210; online scoreboard 720 | ~930 | Position as the free, plugin-free browser-source scoreboard with sponsor strip and ticker. |
| `/tools/plan/` (live) | tournament planner 320 | 320 | Keep as the planner page; link it from every guide. |
| `/compare/free-tournament-software-india/` (new) | tournament software india 480 | 480 | An honest comparison including where we are weaker. Only list products we checked. Keep the facts in this research doc. |
| Hindi / Hinglish guides | id card kaise banaye 1,000; certificate kaise banaye 590 | ~1,600 | Two short Hinglish guides (Roman script): they out-volume Devanagari. Marathi returned no volume, so do not invest until measured. |
| Skip | live scoreboard, kabaddi points table, round robin scheduler, match scheduler | off-intent | Do not target. |

Rules for every page: one search intent, a title that starts with the keyword (<= 70 characters), a description of 70 to 170 characters, an answer box in the first screen, a worked example computed from the real tool, FAQs of 350 to 900 characters that explain the product, internal links to the tool and two related guides, structured data. The existing guards (`verify-seo.mjs`, `tests/faq.test.mjs`, `tests/guide-faq.test.mjs`) enforce most of this.

## 3. Content plan (8 weeks, two quality pieces a week, not more)

Quality over volume: the sibling portfolio site lost its index when it published too much too fast. Each piece must be useful on its own and tied to a tool.

Weeks 1 to 2: poster maker page and three poster guides ("Free Fire tournament poster: what to put on it", "cricket tournament poster ideas", "how to design a college fest esports poster"); BGMI and Free Fire points table pages.
Weeks 3 to 4: fixture maker rewrite; "how to run a custom room tournament" and "PUBG Mobile custom room results: how to record and share them"; the comparison page.
Weeks 5 to 6: bracket pages by team count; "how to run a cricket league with a points table"; two Hinglish how-to guides; QR attendance guide rewrite.
Weeks 7 to 8: "run an esports event with sponsors" (uses sponsor strip and winners pack); "event report template for colleges" (uses the report PDF); refresh the best three by Search Console data.

Each piece also becomes: a 30 to 45 second screen recording (Reels, Shorts), a carousel of three or four slides, and a WhatsApp-ready summary card.

## 4. Marketing channels (India, free to low cost)

1. **The product itself is the channel.** Every share card, poster and winners image carries a small "made with Esports Hub" mark and link. Every live page has the same footer link. This is free, runs on every event, and brings new organisers from players and visitors.
2. **Instagram Reels and YouTube Shorts.** Short screen recordings: "Make the BGMI points table in 60 seconds", "Print 50 ID cards in 5 minutes", "Show standings on the cafe TV". Post 3 per week for 8 weeks, then keep what works.
3. **College esports clubs and fest committees.** Direct outreach to clubs at colleges (Instagram DMs, club emails): a free "event pack" walkthrough, and a one-page PDF. Ask for one real event to support and then publish the result with permission.
4. **Gaming cafes and local organisers on WhatsApp and Telegram.** Share the plan wizard and a ready points table; ask groups for feedback, do not spam.
5. **Discord and Reddit.** Contribute answers in organiser threads (for example custom-room questions), disclose that you built the tool, follow each community's rules. No link drops.
6. **Student ambassadors.** One volunteer per college who runs the first event with us and posts the live page link. Offer a certificate and a listing on the site.
7. **Tutorials with creators.** Offer the tools to small gaming YouTubers who run community tournaments, in exchange for an honest walkthrough.

## 5. Making people come back, and what to build for it

Daily use needs a reason that repeats. Events happen weekly or monthly, so build loops around them:

1. **Season leaderboard for weekly scrims and leagues (build next).** A league across many matches and days: players and teams return every week to see ranks. This is the strongest daily or weekly habit available.
2. **Live event page (built).** Every event day brings players and visitors back to the same link. Players are a free audience for the organiser's next event.
3. **Public events listing (build after real events exist).** A page listing upcoming events published by organisers, with registration links. It gives players a reason to visit between events and gives the site fresh, indexable content. Only list real events.
4. **Reminders by email (Resend is now set up).** "Your event starts tomorrow", "Registration closes in 3 hours", "Results are up". Opt-in only.
5. **Template library.** Poster, certificate and rules templates organisers come back for every time they run something.

## 6. What to measure (leading indicators, not promises)

Weekly: indexed pages, impressions, clicks, average position per target keyword (Search Console); visits, tool starts, tool completions, "Open the screen" clicks, share-card downloads, live-page publishes, sign-ups (Analytics); returning visitors; events published; share-card link clicks.
Targets are set after two weeks of real data. Until then the only numbers worth chasing are: all new pages indexed; first impressions on the target keywords; a first 100 weekly visitors; then a first organiser who runs a real event on the live page.

## 7. Fix before anything else (owner: you, with my help)

1. **Search Console:** add `https://esports.streamerosai.com/` (or the domain property for streamerosai.com) to the Google account connected to the research tool, then submit the sitemap. Without this there is no ranking data.
2. **Analytics:** the hub has no tracking. Create a GA4 property and web stream for it (I can do this through the connected Google Analytics admin tool if you approve) and add the measurement ID to the site. Keep it consent-friendly.
3. **Real proof:** run one real event on the toolkit and write it up (with permission). Real artifacts beat claims; it is also the best link-earning page we can make.

## 8. Next actions

1. I rewrite the titles, descriptions and intros of the existing tool pages with the keywords above and put the new primary line on the home page.
2. I build `/tools/poster/`, the two game points-table pages, the fixture rewrite, the comparison page and the first poster guides.
3. Season leaderboard after that.
4. You: Search Console, Analytics, one real event.
