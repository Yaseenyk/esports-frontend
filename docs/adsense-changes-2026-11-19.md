# AdSense revamp, esports.streamerosai.com (19 Nov 2026)

Follows `docs/adsense-changes-2026-11-16.md`. Context: AdSense rejected streamerosai.com on 16 Nov 2026 for "low-value content"; the review is
domain-level, so this subdomain is judged with the others. Policy checklist: `portfolio/docs/adsense-readiness-2026-11-16.md`.
Ads stay off: no ad code, no `ADSENSE_CLIENT`, `check:third-party` allowlist unchanged (GTM, Clarity, first-party pulse).

Already done earlier today (separate commit, not repeated here): publisher game icons replaced by own text badges, guides bylined Yaseen Khatib,
trademark notice in the footer and About.

## Audit method

Every guide (31 hand-written, 10 live-now, 120 scheduled) was loaded from source with its release date, word count and the highest 5-word
shingle overlap with any other guide. Text overlap is low everywhere (1 to 12 percent): each guide was written separately. The risk is
**topical** duplication (the same advice with the game name swapped) and **one skeleton** (answer box, list or table, "Common mistakes",
3 to 5 FAQs) repeated 130 times, plus a release rate that would have added 110 more pages on that skeleton by mid 2027.

## Guide queue

| Change | Why |
| --- | --- |
| Cadence three a week (Mon/Wed/Fri) to **two a week (Mon/Wed)** | Volume is what a domain-level review reads as scaled content. Posts 1 and 2 keep their dates. The schedule test now fails on a Friday or a third guide in a week. |
| **35 guides held** off the schedule (`src/content/scheduled/held.ts`, each with a reason) | Near-duplicates of a guide that is live or kept: 5 more poster guides, 2 name-idea lists, 4 per-game schedule templates, per-game copies of points, rules, scrims, registration-form, custom-room, QR attendance and certificate guides, 2 fixture/round-robin repeats, 2 bracket repeats, third Minecraft, second Fortnite and Dota, fifth chess guide. Kept in the batch files, not deleted. |
| 2 money guides held (`tournament-prize-pool-and-payout-split`, `tournament-entry-fee-and-refund-policy`) | About pooling player fees into cash prizes; reads as money-game promotion on a site that takes no payments and runs no prizes. |
| 85 guides stay scheduled; last release **Mon 6 Sep 2027** | One guide per topic. Next release: `random-team-generator-for-fair-teams`, Mon 23 Nov 2026 (the held BGMI poster guide was due 20 Nov). |
| Links in about 20 scheduled guides retargeted from held guides to the kept guide on the same topic (or a tool page) | A new test fails if any live or scheduled guide links to, or lists as related, a held guide. |
| `tournament-budget-template` rewritten: prizes are fixed and funded by a sponsor or the organiser, never paid out of player fees; new section "Keep prizes separate from player fees"; worked example is free entry | The old example made the prize pool "income minus costs" from entry fees and let it scale with entries. |
| 4 other scheduled guides (tennis-ball cricket, divisions, results announcement, post-event report): sentences that sent readers to the prize-pool guide reworded (sponsor-funded trophies and certificates) | Same reason. |
| "Common mistakes" heading (identical on all 130 guides) replaced on 90 live and scheduled guides by a topic heading (for example "Where BGMI points tables go wrong", "Bye mistakes to avoid") | The most visible sign of a template in every table of contents. |

## Live guides

| Page | Change | Why |
| --- | --- | --- |
| /guides/esports-team-names-ideas/ | Rewritten as the one name guide: method, ideas by style, word-play, BGMI squad names, Free Fire squad names (Booyah caution), tags in the custom room (sourced FFWS MEA 2025 rulebook fact on hidden nicknames), name checks; 4 FAQs; updated 19 Nov | Three thin name lists (836 to 876 words each) merged into one deeper page. |
| /guides/bgmi-team-names-ideas/, /guides/free-fire-team-names-ideas/ | `noindex, follow`, "merged into" note at the top, out of the sitemap, llms.txt and lists; URL kept for old links | Merged. Listed in `src/content/merged-guides.json`, which `verify-seo.mjs` also reads. |
| /guides/free-fire-tournament-poster-guide/ (released 18 Nov) | Same treatment, merged into /guides/free-fire-tournament-poster/ | Second Free Fire poster guide on the site. |
| Other live guides | Unchanged except the heading rename | The hand-written ones are 1,000 to 2,300 words; the Free Fire, BGMI, Valorant and campus guides already carry the publisher-conditions and legal notes on entry fees and prizes. |

## Money wording

| Page | Change |
| --- | --- |
| /events/ demo pages (noindex, labelled demo) | Invented entry fees and cash prizes (including a "pot bonus") removed from the demo data; each event now shows "Money: None. Esports Hub takes no entry fees, holds no money and runs no prizes or betting." Noindex kept (layout plus `verify-seo` policy). |
| Guides | See the queue table. No live guide promotes paid entry; the remaining mentions are factual (a poster should state any fee exactly) next to "check the publisher's conditions and the law". |
| /terms/ | Unchanged: already says the site takes no payments and runs no prizes or betting. |

## Trust pages and the ID card studio

| Page | Change | Why |
| --- | --- | --- |
| /contact/ | Adds the public address **contact@streamerosai.com** (the one the portfolio and FitRank already publish) in the intro, an "Email" section and the meta description | Contact was form-only. |
| /about/ | Email in "Found a mistake?"; release schedule now "two a week", and says duplicate guides were removed or merged in November 2026 | Accuracy. |
| /privacy/ | New section "The ID card maker and Aadhaar: what is and is not stored": a table for the card picture, the full number, the last four digits, birth date and gender, names, photos and downloads, plus which analytics run on which ID card page; email in Questions; dated 19 Nov | Every row was checked against the code: `lib/idcard/aadhaar.ts`, `ocr.ts`, `draft.ts`, `roster.ts`, `lib/cloud/sync.ts`, `lib/gtm.ts`, the pulse exclude list in `app/layout.tsx`. |
| ID card studio on /tools/id-cards/ | The studio wrapper carries `data-clarity-mask="true"` | GTM and Clarity load on /tools/ pages, so Clarity's session replay could show the names, dates and card digits in the card preview. The attribute is Clarity's documented masking switch; the studio itself behaves exactly as before. |
| /app/id-cards/ | Already `noindex, nofollow` (checked in `out/`) | The signed-in studio. |
| /tools/id-cards/, /id-card-maker/esports/, /id-card-maker/student/ | Stay indexable | Long explanatory tool pages; no personal data is in the page, everything happens in the visitor's browser. AdSense would never run there (privacy page). |

## Checks

`npm run typecheck` passes. `npm test`: 801 tests, 0 failures (schedule test tightened, held-guide test added; nothing weakened). `npm run build`
passes; `node scripts/verify-seo.mjs`: 178 pages, 66 indexable, 66 in the sitemap, passed; merged guides confirmed `noindex, follow` and absent
from `sitemap.xml`; no AdSense code in `out/`; `check:third-party` ok.

## What remains

- Scheduled guides are still 700 to 1,300 words on a shared skeleton (answer box, FAQs). They are fewer and slower now, but each would be
  stronger with something only a working organiser has: a photo of a real bracket, a real results sheet, a lesson from a real event. That needs the owner.
- Held guides can come back one at a time only after they say something the kept guide does not (see the header of `held.ts`).
- Four live Free Fire guides (points, rules, format, registration form) are each about 950 words; distinct topics, but short. Deepen them from
  real events when there are some.
- Demand is small (see the research files), so "genuine user interest" depends on real traffic, which this work cannot create.
- The demo pages under /events/, /games/ and /communities/ are noindex and labelled, but a reviewer can still click into them. Replacing them with
  real tournaments (the v3 pages) is the lasting fix.

## Privacy and crawl audit (19 Nov 2026)

Method: home and /id-card-maker/student/ loaded in headless Chromium with every third-party request and cookie recorded,
/tools/plan/ and /tools/poster/ fetched raw, and `src/app/layout.tsx`, `src/lib/gtm.ts` and `src/components/GoogleTag.tsx`
read for scripts injected later.

- Loaded on esports.streamerosai.com public pages: Google Analytics 4 through GTM (googletagmanager.com,
  analytics.google.com, stats.g.doubleclick.net; cookies `_ga`, `_ga_7BZ71GPLDW`), Microsoft Clarity (clarity.ms,
  c.bing.com; cookies `_clck`, `_clsk`, plus Microsoft's `MUID`/`MR`/`SM`), Pulse (pulse.yaseenyk.workers.dev, no
  cookies), the site's own API (esports-api.yaseenyk.workers.dev). On /id-card-maker/ pages only the Pulse script file
  and the API load: no GA, no Clarity, and Pulse records nothing there (path excluded). On demand: jsDelivr for OCR and
  background removal, Google sign-in on sign-in pages. No AdSense.
- Privacy page: already named every service and nothing unused. Fixed the Pulse paragraph, which said only "counts page
  visits and referring sites": it now lists what Pulse records (country, network name, clicks, form name on submit), the
  daily-rotating visitor code, 90-day deletion and the DNT/GPC switch-off. AdSense "future use" paragraph kept.
- Crawl: robots.txt allows the public site, blocks app and private-link paths, and names the sitemap. All 66 sitemap URLs
  return 200, none redirects, none is noindex, every canonical matches, none is blocked by robots.txt.
- Raw HTML: main text is in the static HTML (home about 2,680 words, tool pages 1,400 to 1,650 words).
