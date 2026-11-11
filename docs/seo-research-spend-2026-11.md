# SEO research spend, USP round (Nov 2026)

Team: connectmazjid. Balance before: $9.55. Balance after: $9.03. Cap for this round: $1.50. Total spent: **$0.523** (523,050 micro-USD, from the per-call `charged_micro` values; matches the balance change).

| Tool id | Calls | Purpose | Cost |
|---|---|---|---|
| serpstat.google.keywords.ideas | 19 (8 returned "data not found" and cost nothing) | Related keyword ideas for 18 seed phrases, India database | $0.185 |
| serpstat.google.keywords.volume | 3 batches (plus a repeat that was served from archive) | Volume for 503 candidate keywords, India database; 154 had data. Used for the few difficulty values | $0.154 (includes the repeat) |
| dataforseo.google.keywords.volume | 2 | Google Ads volume and CPC, India, English (461 keywords) and Hindi (42 keywords) | $0.180 |
| treg.google.serp.organic | 15 | Google India SERPs for the 15 keywords in `seo-serp-usp-2026-11.md` | $0.003 |
| treg.web.extract | 7 (1 returned 404, not charged) | Home or pricing pages: bracketmaker.app, score7.io, pointstablemaker.com, andern.live, obscoreboard.com, challonge.com | $0.001 |
| google-search-console, google-analytics, google-analytics-admin | 5 | Sites list, account summaries, host-name reports | $0 (team's own tools) |

Notes
- One mistake cost money: the first volume run was not saved because of a Windows console encoding error, so the same batch was requested again (the log shows the batch charged twice, about $0.077 each time, so about $0.077 was wasted).
- A google-ads route was tried first (free in the catalog). It failed: no Google Ads credential on this team. Nothing was charged.
