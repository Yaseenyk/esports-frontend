# SERP, competitor and own-data check for the five new features (Nov 2026)

Market: India (google.co.in, English). Volumes: Google Ads data via DataForSEO (monthly searches, India). Full list: `docs/data/keywords-usp-2026-11.csv` (355 keywords with volume; 338 are new against `keywords-india-2026-11.csv`). Spend: see `docs/seo-research-spend-2026-11.md` (about $0.52 of the $1.50 cap).

Method notes, read first:
- SERPs were pulled with the cheapest routed Google organic tool. It returned 2 to 7 organic results per query, not 10. "Top 5" below is whatever came back, in order. A short result list is itself a signal that few pages match, but it is not a full SERP.
- "Difficulty to beat" is my judgement from who ranks and what kind of page it is. The providers gave no usable 0-100 difficulty for most of these keywords (the one value I have is `bgmi points table`: 5, `bgmi tournament points table`: 4, from Serpstat). Treat difficulty as rough.
- "Free no-login" is marked only where I read the page (section 2). Otherwise "not verified".
- Google Ads merges close variants, so near-identical keywords (for example "fixture maker" and "fixture generator") report the same number. Do not add them up.

## 1. SERP table, 15 keywords

| # | Keyword (India searches/month) | Top results seen (position: domain, page type) | Free no-login? | Difficulty to beat | Our angle |
|---|---|---|---|---|---|
| 1 | tournament bracket maker (480) | 1 play.google.com (app) · 2 bracketmaker.app (tool) · 3 score7.io (tool, home) · 4 keepthescore.com (tool page) · 5 play.google.com (app) | bracketmaker.app: "free to start" (seen). Others not verified | Medium. Two app-store slots plus three established tools | Esports-ready bracket with live page, TV screen and share card; free with no sign-up |
| 2 | bgmi points table (1,000) | 1 andern.live (live standings site) · 2 instagram.com (hashtag page) · 3 esportsamaze.com (live standings) | n/a: these are viewer sites for official events | Low to medium. Only 3 results, none is an organiser tool | Custom-room points table for college and local events, with a one-tap WhatsApp card |
| 3 | free fire points table (480) | 1 pointstablemaker.com (tool) · 2 esportsworldcup.com (official event page) · 3 scribd.com (PDF) · 4 andern.live · 5 esportsamaze.com · 6 instagram.com | pointstablemaker.com: web app with a "Make your first table" button (seen); login not verified | Low to medium. A tool ranks 1, rest are event pages | Free Fire preset (placement + kills), image export, then live page |
| 4 | pubg mobile custom room results (2,400) | 1 reddit.com (thread) · 2 toornament.com (a daily free custom-room tournament page) | not verified | Low. Only 2 results, a forum thread and a platform page | A results-entry page for custom rooms that outputs a shareable standings card |
| 5 | round robin scheduler (5,400) | 1 medium.com (CPU scheduling article) · 2 scaler.com (C program) | n/a | Not a real target | Off-intent (computer science). Skip. Use "round robin generator" (210) or "round robin tournament" (1,900) |
| 6 | fixture generator (880) | 1 playinga.com (tool) · 2 leaguerepublic.com (feature page) · 3 justtourney.com (football software page) · 4 score7.io · 5 instagram.com (reel) · 6 justdial.com (unrelated) · 7 play.google.com (app) | not verified | Low to medium. Results are weak: a reel and an unrelated Justdial page rank | Free fixture maker for cricket, football, kabaddi and esports lobbies, with WhatsApp-ready image |
| 7 | tournament schedule maker (110) | 1 scheduler.leaguelobster.com (tool) · 2 score7.io · 3 tournamentscheduler.net (tool) · 4 playinga.com · 5 bracketmaker.app · 6 leaguelobster (round robin page) · 7 play.google.com | not verified | Medium. All dedicated schedulers | Small volume. Win it through the Plan wizard page, which covers schedule plus format plus rules |
| 8 | points table maker (320) | 1 play.google.com (League Table Creator) · 2 play.google.com (Points Table Maker) · 3 play.google.com (Pointcalc Pro) · 4 pointstablemaker.com · 5 andern.live · 6 esportsamaze.com · 7 scribd.com | pointstablemaker.com: see section 2 | Medium. Three app-store slots plus an established web tool | Web, no install, cricket + football + BGMI + Free Fire presets, then live page and TV screen |
| 9 | tournament poster maker (260) | 1 play.google.com (cricket poster app) · 2 leaguelobster.com · 3 bracketmaker.app · 4 score7.io · 5 pointstablemaker.com · 6 keepthescore.com | not verified | Low. No dedicated web poster maker; bracket tools fill the page | A poster maker as a share card: event name, date, prize, sponsor logos. Nobody on page 1 does this |
| 10 | free fire tournament poster (1,600) | 1 scheduler.leaguelobster.com · 2 play.google.com (Points Table Maker) · 3 bracketmaker.app · 4 playinga.com · 5 keepthescore.com | not verified | Low. No result is a poster page | Highest-volume poster keyword we found. Dedicated `/tools/poster/` page with Free Fire and BGMI templates |
| 11 | obs scoreboard (210) | 1 obscoreboard.com (paid SaaS) · 2 obsproject.com forum (free plugin) · 3 obsproject.com forum (free plugin) · 4 youtube.com · 5 overlayon.com · 6 obsproject.com forum tag page · 7 overlays.uno | obscoreboard.com is paid (section 2). Forum plugins are free downloads | Low to medium. Forum threads and paid products | A free browser-source scoreboard that needs no plugin: paste one URL into OBS. Esports and cricket designs |
| 12 | qr code attendance (720) | 1 play.google.com (QR Attendance Control) · 2 play.google.com (Qr Attendance) · 3 sgmc.in (a medical college page) | not verified | Low. Two apps and an unrelated college page | Signed-QR event pass plus offline gate check-in. Page must say event, not classroom attendance |
| 13 | winner certificate template (210) | 1 canva.com · 2 adobe.com/express · 3 pinterest.com · 4 powerpoint.cloud.microsoft · 5 magnific.com · 6 certifier.io (blog) · 7 canva.com | Canva and Adobe: not verified | High. Big brands | Do not fight on "template". Win "certificate maker for tournament winners" with results-to-certificate in one step |
| 14 | tournament planner (320) | 1 apps.microsoft.com (Windows app) · 2 playpass.com (badminton page) · 3 apps.microsoft.com · 4 leaguelobster.com · 5 playinga.com · 6 tournamentscheduler.net · 7 score7.io | not verified | Low to medium. No guide or wizard ranks | The Plan wizard fits this exactly: answer 5 questions, get format, schedule, rules and form |
| 15 | tournament software india (480) | 1 tournamentsoftware.com (badminton product, order page) · 2 and 3 tournamentsoftware.com (event list) · 4 playinga.com (badminton software) · 5 technologycounter.com (listicle) · 6 bracketmaker.app | not verified | Low. Results are a badminton product and a listicle | A "free tournament software for India" page, with an honest comparison. Make it the hub that links all tools |

### Interpretation, per keyword

1. **tournament bracket maker.** Established, but the bracket tools are generic. Our bracket maker alone will not out-rank them. Our edge is what happens after the bracket: live page, TV screen, share card. Make those the headline.
2. **bgmi points table.** The ranking pages are viewer sites for official events (BGIS, BGMS). Nobody serves the person who runs a custom-room college event. Different intent, so we do not need to beat them.
3. **free fire points table.** A single tool page ranks first. A Free Fire preset with kill and placement points and an image export competes directly. Realistic page-1 target.
4. **pubg mobile custom room results.** 2,400 searches and only a Reddit thread and one platform page. The best volume-to-competition ratio in the set, though many searchers may just want to find a room. Needs a guide plus the points table tool.
5. **round robin scheduler.** Do not target; it is computer-science noise. Use `round robin tournament` (1,900) and `round robin generator` (210).
6. **fixture generator.** Weak SERP (a reel and an unrelated Justdial result rank). 880 a month, shared with "fixture maker" and "online fixture generator". Strong candidate for the schedule page, framed for cricket, football and kabaddi, not only esports.
7. **tournament schedule maker.** Only 110 a month and full of dedicated schedulers. Not worth a standalone push. Cover it inside the Plan wizard page.
8. **points table maker.** Three app-store listings plus pointstablemaker.com. Web-only with no install is our difference. Needs cricket and football presets as well as BGMI, because that is who searches.
9. **tournament poster maker.** No dedicated web poster maker on page 1. The surrounding "cricket tournament poster" keywords add up to several thousand searches (see CSV). Strong gap, and it reuses the share-card engine.
10. **free fire tournament poster.** 1,600 a month with no poster page ranking. Probably the single best easy win here, if searchers are organisers and not players looking for a tournament to join (not verified).
11. **obs scoreboard.** Small (210) but nearly everything that ranks is paid or a forum thread. A free, plugin-free scoreboard URL is a clear angle and it feeds feature 4.
12. **qr code attendance.** Two apps and an unrelated page. The existing check-in page can rank, but the title and copy must match "attendance" and show a demo.
13. **winner certificate template.** Dominated by Canva, Adobe and Microsoft. Skip the template keyword. Target `certificate maker online free` (320) and tournament-specific phrases.
14. **tournament planner.** No guide, wizard or comparison ranks. Matches feature 5 directly.
15. **tournament software india.** Weak SERP, and a listicle ranks. A comparison page that tells the truth about each tool (including where we are weaker) would fit.

## 2. Competitor feature check

Pages read on 11 Nov 2026 with a cheap web extractor. Only what appeared in the extracted text is stated. "Not seen" means the text I read did not mention it, which is not proof the feature is absent.

| Tool | Price (as seen) | Behind login or paywall | Our five features |
|---|---|---|---|
| bracketmaker.app (home page) | Home says "Free to start". Paid plans: not verified | Not verified | (1) "Live online brackets: share a link": seen. QR and per-team view: not seen. (2) share cards: not seen. (3) certificates/report: not seen; it offers PDF export of brackets. (4) TV/OBS and sponsors: not seen. (5) plan wizard: not seen. It does have templates by team count (4 to 8 team round robin pages) |
| score7.io (home page) | Plans listed: Starter (Free), Premium tiers called Essentials, Pro, Unlimited. Prices were not in the text I read: not verified | Free tier: single admin, basic tools, public page, "Score7 branding". Auto-scheduling, embedding, custom branding, CSV import/export and co-admins are premium. A "try it without signing up" page is linked | (1) Seen: public page with share link and QR code, plus "a personal page for every team and player". This is the closest to our feature 1. (2) not seen. (3) not seen. (4) "TV mode for the venue screen" seen; sponsors/ticker not seen. (5) not seen |
| pointstablemaker.com (home page) | Pricing not shown on the home page: not verified | Not verified. Home links to a web app | (2) Seen: exports a share-ready image for WhatsApp. It has 14 themes and presets for cricket, football, PUBG/BGMI and Free Fire. It claims 18K+ organisers and 25K+ tables; I did not verify these. (1), (3), (4), (5): not seen |
| andern.live (home page) | Not verified | Viewer site, no login needed to read standings | Live BGMI standings for official events (BGIS, BGMS, BMSD and others). Not an organiser tool. None of our five features seen |
| obscoreboard.com (home page) | $90, $120 and $1,200 per year (Hobby, Studio, Professional). Free trial stated, then paid. Free version only on request for charities, schools and volunteer groups | Everything is paid after trial. Hobby is limited to 5 teams and 2 draft scoreboards | (4) Seen: sponsor-ready lower thirds, crests, API control. Sports list on the page does not include esports; cricket appears as a heading with no link. (1), (2), (3), (5): not seen |
| challonge.com (pricing page) | Standard $0 (ad-supported, up to 256 participants per tournament, Stripe fee $0.75 per paid-registration order). Premier $12 per month, or $6.99 per month billed yearly (no ads, 512 participants, custom themes for embeds) | Free tier is ad-supported. Ad removal, embed themes and file uploads are paid | None of our five features appear on the pricing page text. Other Challonge pages: not verified |
| toornament.com | Pricing page returned 404: not verified | not verified | not verified |

What this means for us:
- Feature 1 (live page with QR and team view) is already offered by score7.io. We cannot claim it as unique. What we can claim: free with no sign-up, Indian-language ready, built for esports and college fests, and tied to ID cards and gate check-in.
- Feature 2 (WhatsApp card) is offered by pointstablemaker.com for points tables only. Nobody I read offers it for schedules, brackets and winner posters.
- Features 3 (results-to-certificate and event report PDF) and 5 (plan wizard) were not seen on any page I read. That is the strongest whitespace, but "not seen on a home page" is weak evidence. Check before using the word "only" in copy.
- Feature 4: paid OBS scoreboard tools exist (obscoreboard.com, $90 to $1,200 a year). A free one is a real price angle. I did not verify whether a free tool ships a scrolling ticker.

## 3. Our own data (free tools)

- **Search Console.** The connected account lists one property only: `https://connectmazjid.com/` (a different site). `https://esports.streamerosai.com/` and the domain property are not in the sites list, so there are no queries, pages, clicks, impressions, sitemap or indexing data for the hub. The account cannot read it. To get data, add the property to the connected Google account (or share it with it), then re-run.
- **Google Analytics.** The connected account has two properties, both for the ConnectMazjid sites. A host-name report for the last 28 days in each showed only connectmazjid.com, cmzapp.com and translation/dev hosts. No esports.streamerosai.com traffic appears, so the hub is not tracked in these properties. The hub has no GA ID in `src/` that I could find.
- **Quick wins at positions 5 to 30:** none can be listed; there is no data.
- Per `docs/seo-research-2026-11.md`, the site has been `noindex` until real content exists, which would also explain empty data. I did not check the current flag.

## 4. What to do with this

Priority by evidence (volume, weak SERP, a feature we are building):
1. `free fire tournament poster` (1,600) and the wider poster set: new `/tools/poster/` page on the share-card engine.
2. `pubg mobile custom room results` (2,400) and the BGMI / Free Fire points table set (`bgmi points table` 1,000, `bgmi points system` 1,000, `free fire points table` 480): game pages plus the points table tool.
3. `fixture generator` / `fixture maker` (880) and `round robin tournament` (1,900) with cricket and football framing.
4. `tournament bracket generator` / `bracket generator` (590) and `tournament bracket maker` (480): lead with live page and TV screen.
5. `qr code attendance` (720), `obs scoreboard` (210) / `online scoreboard` (720), `tournament planner` (320), `points table maker` (320).
6. Skip: `live scoreboard`, `kabaddi points table`, `round robin scheduler`, `match scheduler` (all off-intent, flagged in the CSV).
7. Hindi: Google Ads reports small numbers (for example "free fire tournament" in Hindi script: 390; "cricket tournament poster" in Hindi script: 480). Transliterated Hindi ("id card kaise banaye": 1,000; "certificate kaise banaye": 590) is bigger than Devanagari. Marathi keywords returned no volume at all. Treat Hindi volumes as a floor.

## 5. Limits
- Volumes are Google Ads estimates, rounded, and often rounded to 10. Numbers for close variants are merged.
- SERPs returned 2 to 7 results, from one provider, on one day.
- Competitor facts come from one page each. Prices on score7.io were not in the text I read.
- No real data for our own site (section 3).
