# AdSense readiness changes, esports.streamerosai.com (16 Nov 2026)

Audit method: fresh `npm run build`, then a script over every `out/**/index.html` (visible text of `<main>`, robots meta, sitemap membership, links to About/Contact/Privacy/Terms). 176 pages built, 68 indexable before, 67 after. Ads stay off: no AdSense code, `check:third-party` allowlist unchanged (GTM, Clarity, first-party pulse).

## Audit result
- Every indexable page except Contact had at least 400 words of body text; 63 of 68 had over 1,000. No stub, placeholder or "under construction" page. App, gate, admin, display, join, pass and register routes are noindex and carry no content by design.
- All 68 indexable pages link About, Contact, Privacy and Terms in the footer (the 30 pages without them are noindex app screens).
- Tool pages (id-cards, brackets, points-table, check-in, poster, certificates, schedule, plan, display-screen, round-robin, double-elimination, groups, print-kits, registration): 1,200 to 2,450 words each of explanation, rules, limits and worked examples around the widget. No change needed.

## Page-by-page
| Page | Before | After |
| --- | --- | --- |
| /contact/ | 49 words plus a form | about 500 words: who reads messages (Yaseen Khatib, Hyderabad), what to write about, data requests, what not to send |
| /about/ | "an independent developer", guides by "the team" | names Yaseen Khatib, Hyderabad; says guides are written by him with AI help and checked; adds "Why it exists" |
| /privacy/ | no mention of the pulse counter or future ads | adds the first-party visit counter (no cookies, where it is off) and an Advertising paragraph (none today; AdSense possible later on guides only; personalised-ads opt-out links) |
| /tools/ | 435 words (directory) | about 700 words: how the tools fit together in a first event |
| /developers/ | 403 words of API docs, usable only with an account | noindex,follow and removed from the sitemap (`verify-seo` policy list extended, no check weakened) |
| /terms/ | 703 words | unchanged |
| Guides (60 live) | 1,009 to 1,926 words each | unchanged |

## Guide queue (not changed, dates untouched)
Live today: 10 live-now guides plus the older hand-written ones. Queued: 110 scheduled posts at three a week (Mon/Wed/Fri), the last in mid 2027. Each must pass `tests/scheduled-guides.test.mjs` (700+ words, 5 to 8 sections, FAQs unique, sourced facts only), and they do.

## Remaining weaknesses
- Templating: all scheduled guides share one skeleton (answer box, table or list, Common mistakes, 3 to 5 FAQs). Content is unique per guide, but a reviewer sees one pattern repeated 120 times. Weakest live guides are the name-idea lists (BGMI/Free Fire/esports team names, about 1,000 words): useful but light on original information.
- Pace: three a week on a young domain is moderate, not a flood, but volume is the thing a domain-level review reads as "scaled content". Fewer, deeper guides would be safer than 120 on one topic cluster.
- Guides are by-lined "the Esports Hub team" while About says Yaseen Khatib with AI help; consider a person byline.
- Contact is a form only (no public email address).
- Demand is small per the research files; "genuine user interest" depends on real traffic, which a review will check.
