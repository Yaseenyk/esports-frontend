# Scheduled guides: how they work

100 guides are written ahead of time and released three a week (Monday, Wednesday, Friday), starting
Monday 16 November 2026. No API key and no bot writes them: they were written in a Claude Code session,
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
- Never schedule more than three a week. Auto-publishing floods cost the sister portfolio its index once.

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
