# SEO competitor check and change list (12 Nov 2026)

Scope: Esports Hub, https://esports.streamerosai.com. Docs only: no source was edited, nothing committed, no build or test run. The audit reads the existing `out/` build (dated 12 Nov 03:37) and `src/`. `out/` may be a little behind `src/`; re-check after the next build.

## 0. Spend

treg total: **$0.00200** (2,000 micro-USD, from `_treg.charged_micro`): 9 calls of `treg.google.serp.organic` at $0.00015 each, plus 1 call at $0.00065 (the last keyword fell through to a dearer provider). Nothing else was bought. Budget was $0.50, so we used well under 1%.

Why so little: earlier rounds already bought volumes and difficulty (`docs/data/keywords-usp-2026-11.csv`, 355 keywords; `docs/data/keywords-india-2026-11.csv`) and 15 SERPs (`docs/seo-serp-usp-2026-11.md`). I did not repeat them. I only checked 10 keywords that were not SERP-checked before. No competitor domain-overview or top-pages tool was bought (not tried, so "which pages bring them traffic" is **not verified**). Volumes below come from the existing CSVs, not new calls.

Method limit: the cheapest SERP route returns 1 to 10 organic rows, one provider, one day (12 Nov 2026), country `in`, language `en`.

## 1. SERP findings (new keywords, 10 checked today)

| # | Keyword (India vol/mo, from CSV) | Who ranks (position: domain, type) | Winning page type | Gap for us |
|---|---|---|---|---|
| 1 | id card maker online free (CSV: "id card making online free" 1,000; "id card maker online" 2,900) | 1 canva.com (tool), 2 idcreator.com (software), 3 template.net (templates), 4 sdev.in (Indian tool), 5 edit.org (tool), 6 play.google.com (app), 7 and 8 unrelated (cred.club, gogstbill.com), 9 bracketmaker.app | Generic online tools, titled "Online ID Maker/ID Card Maker ... Free" | Positions 7 and 8 are unrelated pages: the intent set is thin. Win with "event/team/tournament ID card" plus print at real size on A4. Do not fight Canva on the bare head term |
| 2 | student id card maker online (1,000) | 1 fedena.com (school ERP feature page), 2 edit.org, 3 lovart.ai (AI design), 4 drawtify.com, 5 idfcfirst.bank.in (unrelated bank page) | Tool or feature pages, only 5 rows, one is irrelevant | Weak SERP. A free, no-login student/college club ID page with batch import and print can reach page 1 |
| 3 | esports tournament app (720, difficulty 41) | 1 to 3, 5, 7 play.google.com (pay-to-join player apps), 4 xenora-esports.in, 6 toornament.com, 8 clashleague.in, 9 bracketmaker.app | Google Play app listings | Player intent (join tournaments for prizes). Not our audience. Skip |
| 4 | free fire tournament registration form (CSV: "free fire tournament registration 2026" 480) | Only 1 row: template.net (template page) | Template page | Almost empty SERP. A game-specific section on `/tools/registration/` can take it |
| 5 | tournament registration form (30) | 1 jotform.com, 2 formnx.com, 3 typeform.com (cricket template), 4 indianpowerliftingfederation.com, 5 bharatbijlee.com (unrelated) | Form templates | Small volume. Win by being a form that feeds ID cards and check-in |
| 6 | bgmi points system (1,000) | 1 kraftonindiaesports.com (official rankings), 2 liquipedia.net, 3 pointcalc.in (AI point table maker for BGMI, PUBG, Free Fire), 4 tournify.in (points table maker), 5 play.google.com, 6 andern.live, 7 esportsamaze.com, 8 instagram.com | Official + wiki + two direct tool competitors | Two tools already rank (pointcalc.in, tournify.in). Our `/points-table/bgmi/` must show the points scale in the HTML and say it is an example (it does say so) |
| 7 | esports tournament software (10) | 1 tournify.in ("Free Tournament management app for eSports ... points table maker, registration forms and team management"), 2 play.google.com, 3 matchboxsoftware.com, 4 x.com, 5 softwaresuggest.com (listicle), 6 bracketmaker.app, 7 tournamentsoftware.com | Product home pages and a listicle | Volume is 10, ignore the keyword. But **tournify.in is the closest direct competitor** found so far (esports, free, India domain) and is absent from our compare page |
| 8 | tournament bracket generator (590) | 1 brackethq.com, 2 bracketmaker.app, 3 lvup.gg, 4 play.google.com, 5 keepthescore.com, 6 score7.io, 7 commoninja.com, 8 scorecounter.com, 9 scheduler.leaguelobster.com | Tool home pages, all with "bracket generator" or "bracket maker" in the title | Hard head term. Our title says "bracket maker" but not "generator". Title and H1 should carry both |
| 9 | fixture maker (880) | 1 fixture-maker.soft112.com (software download), 2 uptodown.com (APK), 3 play.google.com, 4 playinga.com, 5 leaguerepublic.com, 6 playpass.com (cricket schedule maker), 7 kickly.net, 8 justtourney.com, 9 myleague24.com | Downloads, apps and a few web tools | Downloads and APK pages rank: a no-install web fixture maker is a clear differentiator. Page one is beatable |
| 10 | bgmi custom room points calculator (no volume in CSV: unverified) | 1 scribd.com (PDF), 2 to 9 youtube.com (live custom-room streams) | PDF and YouTube | The intent seen is live custom rooms, not a calculator. No page won here. Skip as a target |

Earlier SERP rows (poster, OBS scoreboard, QR attendance, points table maker, fixture generator, planner) are in `docs/seo-serp-usp-2026-11.md`; the conclusions there still stand.

### Who ranks across the whole set

- **Tool pages beat guides** on every "maker/generator/calculator" keyword. Guides win only on "format", "template" and "how to" phrasing, and on the Hinglish "kaise banaye" terms (those were never SERP-checked here: **not verified**).
- **Google Play listings** hold 1 to 3 slots on almost every head term. A web page with "no install" in the title is the counter.
- **Challonge, Battlefy, start.gg, Liquipedia**: only Liquipedia appeared (bgmi points system, an informational wiki page). Challonge, Battlefy and start.gg did not appear in any of these 10 India SERPs. Toornament appeared once (esports tournament app).
- **Indian competitors seen**: tournify.in, pointcalc.in, pointstablemaker.com (earlier round), andern.live and esportsamaze.com (viewer sites), xenora-esports.in and clashleague.in (organiser-run tournament sites, not tools), sdev.in (ID cards).
- Reddit/YouTube: Reddit won "pubg mobile custom room results" earlier; YouTube won only the custom-room-calculator query (live streams).

## 2. Audit of our site (from `out/` and `src/`)

What is already good (keep, do not "fix"):
- 54 URLs in `sitemap.xml`, 138 built HTML pages; the rest are noindex app/private pages. `scripts/verify-seo.mjs` enforces title <= 70, description 70 to 170, one H1, canonical, og:title, og:image, alt text, valid JSON-LD, broken internal links, sitemap vs noindex agreement, duplicate titles/descriptions, a 120-word floor. Every indexable page I read passes those limits.
- Titles, descriptions and H1s of all 17 tool/game pages already lead with the target keyword (checked every page in the sitemap).
- JSON-LD: every tool and game page has SoftwareApplication (with a free Offer), FAQPage and BreadcrumbList. Every guide has Article, FAQPage and BreadcrumbList. Compare page has Article, FAQPage, BreadcrumbList. Home has FAQPage. Organization and WebSite sit in the site layout. `Person`/review markup is correctly absent.
- robots.txt allows everything except private screens and points at the sitemap. Canonicals correct. Google site-verification meta present.
- GTM and Clarity load through a gated loader (after consent signals), not on the critical path.

Problems and gaps:
1. **Orphan pages (biggest finding).** `/compare/free-tournament-software-india/`, `/points-table/bgmi/` and `/points-table/free-fire/` are in the sitemap but **no page links to the compare page** and only two guides link to the BGMI points-table page. Checked: home, `/tools/`, `/tools/points-table/`, `/guides/points-table/`, `/tools/brackets/` and the footer contain none of the three links. The two game pages target about 4,900 searches a month; the compare page targets "tournament software india". Google finds them only through the sitemap, with no internal link equity.
2. **Head-term wording gaps**: `/tools/brackets/` title has "maker" but not "generator" (590 searches); `/tools/schedule/` says "fixture generator" but "fixture maker" (the form the SERP titles use) is not in the title; `/tools/registration/` says "esports", missing sports and "team" searches; home and `/tools/` titles carry no "India".
3. **Generic H2s on all 17 tool pages**: "What you get", "How it works", "Questions", "Guides that help" come from `src/components/seo/ToolLanding.tsx` and repeat on every page. They carry no keyword.
4. **Compare page lists only Bracketmaker, Challonge and Score7** (`src/lib/compare.ts`). The SERPs show tournify.in and pointcalc.in ranking for our points-table and software keywords, so a "compared" page that omits them reads as incomplete.
5. **One Open Graph image for everything**: all 54 pages share `/og.png` (42 KB, brand image). Titles and descriptions are per-page; the picture is not. Weaker share previews on WhatsApp and Instagram, where organisers share links.
6. **Structured data is thinner than it can be**: Organization has no `sameAs` (needs real profile URLs, which I could not verify exist), WebSite and Organization are emitted on every page (harmless, but only the home page needs them), the Breadcrumb "Home" item is `https://esports.streamerosai.com` without the trailing slash while the canonical home is `/`. No HowTo markup: Google stopped showing HowTo rich results in 2023, so do not add it.
7. **Sitemap `lastModified`** is the constant 2026-11-11 for all tools and game pages (`src/app/sitemap.ts` `LAUNCH`). Google ignores priority and changefreq but does use an honest lastmod.
8. **No hreflang.** None is present and none is needed today: Hindi and Marathi exist only as a client-side language switch (`useLang`), no `/hi/` or `/mr/` URLs are in the sitemap, so there is nothing for Google to index. The Hinglish guides (`id-card-kaise-banaye`, `certificate-kaise-banaye`) are plain `en` pages. Do not add hreflang until separate URLs exist.
9. **Core Web Vitals risks (not measured, no Lighthouse run because the machine is busy)**: home HTML is 234 KB (most is inline Next flight data), the build has 80 JS chunk files, and every page mounts a `HexField` canvas/aurora background plus Framer Motion (`MotionProvider`). On low-end Android these can hurt INP and LCP. The home H1 itself is plain HTML (not animated in), which is right. **Unverified**: real LCP, CLS and INP numbers. Run a mobile Lighthouse and PageSpeed Insights on `/`, `/tools/points-table/` and `/points-table/bgmi/` before acting.
10. **Thin or duplicate pages**: no duplicate titles or descriptions exist (the verify script fails the build on them). Word counts were not recomputed here; the 120-word floor is enforced in CI. Near-duplicate risk is between `/tools/points-table/`, `/points-table/bgmi/` and `/points-table/free-fire/` (same tool and same template, different preset). Their intros and FAQs must stay game-specific (they currently are, in `src/lib/game-pages.ts`).
11. **Search Console**: per `docs/marketing-strategy-2026-11.md` the property was not visible to the connected account on 11 Nov. Whether the sitemap is submitted and the property is verified now: **not verified**. No ranking or index data exists, so every "expected impact" below is a judgement from SERP weakness and volume, not measured.

## 3. Prioritised change list (25 items, highest expected impact first)

Title limit: the verify script allows 70 characters in total, including the ` · Esports Hub` suffix (14 characters). The "total" in brackets is the final title length. Descriptions must be 70 to 170 characters.

### A. Internal linking (do first, near-zero risk, biggest lever)

**1. Link the two points-table game pages from the main points-table tool.** File: `src/components/seo/ToolLanding.tsx` (add an optional `related?: {href: string; label: string; blurb: string}[]` prop, rendered as a "Related pages" section after "Guides that help") and `src/lib/tool-pages.ts` (set it on the `points-table` entry). Exact items:
- `/points-table/bgmi/`, anchor "BGMI points table maker and points system", blurb "Placement and kill points for BGMI custom rooms, with a WhatsApp-ready table."
- `/points-table/free-fire/`, anchor "Free Fire points table maker and points system", blurb "Placement and kill points for Free Fire custom rooms, ready to post."
Also add each game page to the other's related list, and link both from `src/content/guides-growth.ts` guide `points-table` (body text, "Try the BGMI points table maker" and "Try the Free Fire points table maker").

**2. Link the compare page from the footer and the home page.** Files: `src/components/SiteFooter.tsx` (add a link in the FEATURED or LEGAL group: `["Free tournament software compared", "/compare/free-tournament-software-india/"]`) and `src/app/(site)/page.tsx` (one sentence under the Free tools section: `Not sure which tool to use? <Link href="/compare/free-tournament-software-india/">See free tournament software for India, compared honestly</Link>.`). Also link it from `/tools/brackets/` and `/tools/points-table/` "Related pages" (item 1).

**3. Add the two game pages to the home page and `/tools/` hub.** File: `src/app/(site)/page.tsx` (Made for any game section) and the tools hub page under `src/app/(site)/tools/`. Exact anchor text "BGMI points table" and "Free Fire points table", as plain links inside the existing games paragraph ("ID cards, brackets, points tables ..."). The game badges there should link to `/points-table/bgmi/` and `/points-table/free-fire/` for those two games.

### B. Titles, descriptions, H1 (existing pages)

**4. Bracket tool: add "generator" (590 searches).** File `src/lib/tool-pages.ts`, entry `brackets`.
- title: `Free tournament bracket generator with live page and TV` (total 69)
- description: `Free tournament bracket maker and generator: single elimination for 3 to 64 teams, then a live page, TV screen and share card. No account, runs in your browser.` (verify 70 to 170 and that every claim matches what the tool does; the existing description at `out/tools/brackets/` is the source of truth)
- h1: `Tournament bracket generator: bracket, live page, TV screen and share card`

**5. Schedule tool: match the SERP wording "fixture maker" (880).** Entry `schedule`.
- title: `Free fixture maker and generator for any sport` (total 60)
- h1 (keep, already good): `Fixture schedule maker for cricket, football, kabaddi and esports`
- Add to the lead paragraph, first sentence: `Use this free fixture maker to build a match timetable for cricket, football, kabaddi or esports, with no download and no APK.` (counters the soft112/uptodown/Play Store results).

**6. Registration form: widen beyond esports.** Entry `registration`.
- title: `Free tournament registration form for esports and sports` (total 70)
- Add FAQ (so the FAQPage JSON-LD picks it up): Q `Can I make a Free Fire or BGMI tournament registration form?` A `Yes. Choose the team size (solo, duo, squad), add fields such as team name, captain name, in-game ID and WhatsApp number, and copy the form. It works for Free Fire, BGMI, Valorant, cricket and football events. Teams you approve go straight into the roster used for ID cards and gate check-in.` (check against the real field list before publishing; answer length must be 350 to 900 characters per `tests/faq.test.mjs`, so extend with the real fields).

**7. Home title: add India.** File `src/app/layout.tsx`, `title.default`.
- new: `Free tournament tools for India: bracket, points table, ID cards` (total 65). The home H1 stays as is.

**8. Tools hub title.** File under `src/app/(site)/tools/page.tsx` metadata.
- title: `Free tournament tools: bracket, points table, ID card` (total 67 with suffix). Keep the description.

**9. Points table (generic) page: lead with "no install".** Entry `points-table`. Add to the lead's first sentence: `Make a points table in your browser: no app to install, no account.` (Play Store apps hold 3 of the first 7 slots for "points table maker".) Title stays.

**10. BGMI and Free Fire game pages: put the scale in plain HTML and add the "BGMS" and "points system" wording.** File `src/lib/game-pages.ts`. Add a short HTML table "Example BGMI placement points (an example, not the official scale)" under "What you get", and add this FAQ to the BGMI page: Q `What is the BGMI points system for a custom room?` A `Most custom-room events give points for finishing place and for each kill, then add them across matches. The scale in this tool is an example, not the official scale: tournament organisers publish their own, so copy the one in your rulebook into the placement and kill boxes. Ties are broken by most wins, then most kills, then the better place in the last match.` (matches the tie-break copy already on the page; keep wording true to the tool; lengthen to the FAQ minimum). Do not claim the official Krafton scale.

### C. Headings and page templates

**11. Keyword-bearing H2s on every tool page.** File `src/components/seo/ToolLanding.tsx`. Replace the fixed strings:
- `What you get` becomes `` `Why use this ${t.name.toLowerCase()}` `` (for example "Why use this tournament poster maker")
- `How it works` becomes `` `How to use the ${t.name.toLowerCase()}` ``
- `Questions` becomes `` `${t.name}: questions and answers` ``
- keep `Guides that help`.
These are server-rendered, no JSON-LD change. Check no heading exceeds the layout (long names such as "Free ID card maker for events and teams"); where the name is long, set an optional `shortName` on the ToolPage type.

**12. Student ID card maker landing page (new, weak SERP, 1,000 searches).** New file `src/app/(site)/id-card-maker/student/page.tsx` using `ToolLanding` (copy the pattern of `src/app/(site)/points-table/bgmi/page.tsx`), add to `src/lib/growth-pages.ts` (so it enters the sitemap) and link it from `/tools/id-cards/` and `guides/student-id-card-format`.
- path: `/id-card-maker/student/`
- title: `Student ID card maker online, free, print on A4` (total 61)
- description: `Free student and college club ID card maker: add names and photos, pick a design, add a QR code and print at real size on A4. No sign-up, runs in your browser.` (verify against the id-cards tool's real features: photo, QR, A4 print per `tool-pages.ts` entry `id-cards`)
- h1: `Student ID card maker online: free, with photo and QR code`
- Honest scope line in the lead: `This makes ID cards for clubs, fests and events. It does not issue official school or government ID.`
Reuse the `id-cards` FAQ items and add one: Q `Can I print ID cards for students at a PVC card shop?` A (point to `guides/print-pvc-id-cards`, only what that guide already says).

**13. Compare page: add tournify.in and pointcalc.in.** File `src/lib/compare.ts`. Add two entries. Facts allowed today come only from the Google snippets seen on 12 Nov: tournify.in describes itself as a "Free Tournament management app for eSports ... eSports points table maker, registration forms and team management"; pointcalc.in is titled "PointCalc: AI Point Table Maker for BGMI, PUBG & Free Fire". **Before publishing, read both home pages (one `treg.web.extract` call each, about $0.0002) and fill the "stronger/weaker" lists only from what you read.** Keep the existing rule: no "only" or "best" claims. Update the FAQ item "which tools did you compare" to name five tools. Title stays 70 characters.

### D. Structured data

**14. Move `WebSite` JSON-LD to the home page only and give `Organization` a stable `@id`.** File `src/app/(site)/layout.tsx`: keep Organization everywhere with `"@id": SITE_URL + "/#org"`; remove WebSite from the layout and add it only in `src/app/(site)/page.tsx`. In `guides/[slug]/page.tsx` and `compare/.../page.tsx` replace the repeated inline publisher/author objects with `{"@id": SITE_URL + "/#org"}`. Saves bytes and avoids conflicting entities.

**15. Organization `sameAs`.** File `src/app/(site)/layout.tsx`. Add `sameAs: [ ...real profile URLs ]` **only if real public profiles exist** (Instagram, YouTube, GitHub). None were verified: ask the owner for the URLs. Do not invent any.

**16. SoftwareApplication enrichments.** File `src/components/seo/ToolLanding.tsx`, line with `"@type": "SoftwareApplication"`. Add `isAccessibleForFree: true`, `browserRequirements: "Requires JavaScript. Works in any current browser."`, `featureList: t.benefits.map((b) => b.title)`, and `applicationCategory: "UtilitiesApplication"` (a closer fit than BusinessApplication for a free utility; either is valid). Do **not** add `aggregateRating`, `review` or `softwareVersion` (no verified data: against the site's honesty rule).

**17. Breadcrumb Home item trailing slash.** Files `src/components/seo/ToolLanding.tsx`, `src/components/seo/Page.tsx`, `guides/[slug]/page.tsx`, `compare/.../page.tsx`: change `item: SITE_URL` to `item: \`${SITE_URL}/\`` so it equals the canonical home URL.

### E. Sitemap, robots, canonical

**18. Honest `lastModified`.** File `src/app/sitemap.ts`. Replace the single `LAUNCH` constant with a per-page date: tools use a `updated` field you add to `ToolPage` (set to the date the page text last changed), guides already pass `g.updated`. Never bump dates without a real change. Keep priority and changefreq (ignored by Google, harmless).

**19. Add `/id-card-maker/student/` (item 12) automatically via `GROWTH_PAGES`.** No separate edit if item 12 uses `growth-pages.ts`; confirm `scripts/verify-seo.mjs` then passes (`sitemap vs indexable` check).

**20. robots.txt: keep as is.** Disallowed paths are all private or one-off links, and the noindex content pages (`/games/`, `/events/` etc.) are deliberately not disallowed so Google can read their noindex. No change. (Listed so the developer does not "fix" it.)

### F. Social, speed, measurement

**21. Per-page Open Graph images for the money pages.** Add `public/og/<slug>.png` (1200x630) for `brackets`, `points-table`, `poster`, `id-cards`, `check-in`, `display-screen`, `/points-table/bgmi`, `/points-table/free-fire`, and point each page's `openGraph.images` at it (in the same `generateMetadata` that sets the title). Use the brand-locked flat style used for `/og.png`. Value is click-through when links are shared in WhatsApp/Instagram, not ranking.

**22. Measure Core Web Vitals before changing anything.** Run mobile PageSpeed Insights on `/`, `/tools/points-table/`, `/points-table/bgmi/`, `/tools/poster/`. If LCP > 2.5 s or INP > 200 ms: first suspects are the `HexField` canvas and `aurora` layer in `src/app/layout.tsx` (render them after `requestIdleCallback`, and not at all under `prefers-reduced-motion` or `saveData`), then the 234 KB home payload. **Not measured.**

**23. Search Console.** Confirm the property for `https://esports.streamerosai.com/` (the verification meta is in `src/app/layout.tsx`), submit `/sitemap.xml`, and inspect these 5 URLs once: `/`, `/tools/points-table/`, `/points-table/bgmi/`, `/points-table/free-fire/`, `/compare/free-tournament-software-india/`. Re-run the keyword set after 4 weeks of data. **Not verified whether this is already done.**

### G. Content that follows from the SERPs (after A to F)

**24. Free Fire registration form guide cross-link.** Existing guide `tournament-registration-form-fields` should link to `/tools/registration/` with the anchor `free tournament registration form` and add one H2 `Free Fire and BGMI tournament registration form` (SERP has one template page only, 480 searches). File `src/content/guides*.ts` entry for that slug. Keep to facts the tool does.

**25. Do not build** (SERP shows wrong intent or no volume): "esports tournament app" (player-side Play Store apps), "bgmi custom room points calculator" (live YouTube streams), "esports tournament software" (10 searches), Devanagari/Marathi pages (no measured volume, no separate URLs).

## 4. Could not verify

- Rankings, impressions, indexed page count for our own site (no Search Console access).
- Competitor domain overview and top pages (no tool bought).
- Real Core Web Vitals (no Lighthouse run requested because the machine is busy).
- Hinglish keyword SERPs ("id card kaise banaye", "certificate kaise banaye").
- Contents of tournify.in and pointcalc.in beyond their Google snippets; prices and login rules of every competitor not already read in `docs/seo-serp-usp-2026-11.md`.
- Whether `out/` equals the current `src/` (it was built 12 Nov 03:37).
- Whether real social profiles exist for Organization `sameAs`.
- Word counts per page (CI enforces a 120-word floor; not recomputed).
