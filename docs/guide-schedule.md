# Scheduled guides: how they work

Guides are written ahead of time and released two a week (Monday and Wednesday), starting Monday 16 November 2026.
Until 19 Nov 2026 the rate was three a week; see the 19 Nov section at the end for what changed. No API key and no bot writes them: they were written in a Claude Code session,
tested, and committed. The site's daily deploy releases them.

## Where things are

- `src/content/scheduled/batch-01.ts` to `batch-10.ts`: the posts, ten per batch (batch 10 has eleven).
- `src/content/scheduled/index.ts`: the list `DRAFTS`. **The position in this list is the release date.**
- `src/content/scheduled/schedule.ts`: `FIRST_RELEASE`, the Monday/Wednesday/Friday offsets, `today()`.
- `src/content/scheduled/facts.ts`: sourced game and sport facts. A post may state a game number only if it
  comes from here, with a source and a check date.
- `tests/scheduled-guides.test.mjs`: the quality bar. It runs on every push.

## How release works

A guide is hidden until its date (UTC). `deploy.yml` runs every day at 00:17 UTC, rebuilds, and the build
keeps only guides whose `published` date is today or earlier. So post 1 appears on Monday 16 Nov 2026,
post 2 on Wednesday 18 Nov, post 3 on Friday 20 Nov, and so on. Post 100 appears on Monday 5 Jul 2027.
The cap of three a week cannot be broken by a typo, because dates are computed from position.

To preview a future date: `GUIDES_NOW=2027-01-01 npm run build`.

## Moving or adding a post

- Move a post: move it in its batch or between batches. Every later post shifts by one slot.
- After moving, run the tests. Links may point only at tools, core guides, or posts released earlier, so a
  moved post can break a link. Fix the link, do not disable the test.
- Never schedule more than two a week (the test enforces it). Auto-publishing floods cost the sister portfolio its index once.

## The quality bar (enforced by tests)

At least 700 words, 5 to 8 sections including "Common mistakes", a list plus a table or numbered steps,
three to five FAQs (unique across the site), an answer box, description 100 to 165 characters, tab title
56 or fewer, two to four related guides, no hype words, no unsourced statistics, no spaced em dashes.

## After the last post

Guide 100 goes live in July 2027. The daily deploy's keep-alive commit continues. Write the next batch
before then, add `batch-11.ts`, register it in `index.ts` and run the tests.

## Honest expectations

Game-specific search demand is small, and AI-written scaled content carries risk. A person should skim each
batch before it goes live. Re-measure impressions in Search Console about 4 and 8 weeks after the first release.

## 16 Nov 2026 additions (demand-led batch)

Research: `docs/seo-research-2026-11-16-blogs.md` (treg volumes for 303 phrases, India).

- `live-now.ts`: ten guides published at once on 16 Nov 2026, outside the schedule, at the owner's request (to get them indexed first).
  They are always live. Tests hold them to the same quality bar as the scheduled ones.
- `batch-11.ts` and `batch-12.ts`: twenty guides queued directly after post 1. The original posts 2 to 100 moved back by 20 slots
  (list position is the date), so the schedule now holds 120 posts.
- Facts for these live in `facts-live.ts`, `facts-b11.ts`, `facts-b12.ts`, each with a source and a check date.
- Releasing ten at once is a deliberate exception to the three-a-week rule. If indexing stalls, check Search Console before adding more at that pace.

## 19 Nov 2026: slower and fewer (AdSense low-value review)

AdSense rejected streamerosai.com for "low-value content" on 16 Nov 2026, and the review covers every subdomain. Volume on one skeleton is
what a reviewer reads as scaled content, so:

- **Cadence: two a week, Monday and Wednesday** (`schedule.ts`, `OFFSETS = [0, 2]`). Posts 1 and 2 (16 and 18 Nov) keep their dates.
  `tests/scheduled-guides.test.mjs` fails on any Friday release or a third guide in a week.
- **35 guides held** (`held.ts`): near-duplicates of a live or kept guide (four more poster guides, four schedule templates, per-game
  copies of points, rules, scrims and registration guides, third Minecraft, second Fortnite and Dota, fifth chess) and the two money guides
  (prize pool split, entry fee policy). They stay in their batch files with a reason each; they are not built or linked. A test checks
  that nothing scheduled links to a held guide.
- **85 guides scheduled**; the last one, `qualifier-system-for-a-year-end-championship`, releases on Monday 6 Sep 2027.
- **Merged live guides** (`src/content/merged-guides.json`): BGMI and Free Fire team names into `esports-team-names-ideas`, and the
  second Free Fire poster guide into `free-fire-tournament-poster`. Merged pages still build for old links, show a "merged into" note,
  are `noindex, follow`, and are left out of the sitemap, llms.txt and lists. `verify-seo.mjs` reads the same file.
- The identical "Common mistakes" heading (on all 130 guides) was replaced by a topic-specific heading on every live and scheduled guide.
