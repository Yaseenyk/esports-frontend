# USP build contract (Nov 2026)

Five features are built in parallel by separate workstreams. This file is the shared contract. Do not edit files that belong to another workstream.

## Ownership

| Workstream | Owns |
|---|---|
| Backend (esports-backend repo) | migration `0007_live_pages`, routes for the live page, tests |
| A. Live page | `src/app/(site)/(noindex)/live/**`, `src/components/live/**`, `src/components/display/PublishToLive.tsx`, `src/components/app/LivePagePanel.tsx`, `src/lib/api/cloud.ts` (live methods only), `src/lib/live.ts`, tests for these |
| B. Share cards and sponsors | `src/lib/share-cards.ts`, `src/components/display/ShareCardButtons.tsx`, `src/components/display/SponsorEditor.tsx`, `src/lib/display.ts` (extras only), `src/components/display/DisplayScreen.tsx`, `src/components/display/useScreen.ts`, `src/components/display/ScreenButtons.tsx`, winners block in `BracketMaker.tsx`, `DoubleElimination.tsx`, `PointsTable.tsx`, tests |
| C. Certificates from results and event report | `src/components/tools/CertificateMaker.tsx`, `src/lib/report.ts`, `src/components/app/EventReportPanel.tsx`, `src/lib/idcard/pdf.ts` (additions only), tests |
| D. Plan wizard | `src/lib/plan.ts`, `src/components/tools/PlanWizard.tsx`, `src/app/(site)/tools/plan/**`, `src/lib/data.ts` (TOOLS entry), `src/lib/tool-pages.ts` (new page), `src/components/SiteFooter.tsx`, `src/lib/facts.ts` and any copy or test that counts the tools, sitemap wiring, tests |

The lead owns `e2e/site.spec.ts`, `e2e/a11y.spec.ts`, the build and every Playwright run. Put new browser specs in your own file: `e2e/live.spec.ts` (A), `e2e/share.spec.ts` (B), `e2e/report.spec.ts` (C), `e2e/plan.spec.ts` (D). Nobody runs `npm run build`, Playwright or dev servers; nobody commits or pushes.

## Live page API (backend builds it, workstream A uses it)

A `LiveSnapshot` is what an organiser publishes:

```ts
type LiveKind = "standings" | "league" | "schedule" | "bracket" | "countdown";
interface LiveSnapshot {
  views: { kind: LiveKind; payload: Payload }[];        // at most 5, one per kind; Payload is the display payload from src/lib/display.ts
  announcements: { text: string; at: string }[];         // at most 10, text up to 140 chars, at is an ISO time, newest first
  sponsors: { name: string; logo?: string }[];           // at most 4, name up to 40 chars, logo an image data URL (png, jpeg or webp) up to 60000 characters
  ticker: string[];                                      // at most 5 lines of up to 80 characters, scrolled along the bottom of screens
}
```

Whole snapshot at most 250 KB of JSON. The server checks shape and sizes; it never trusts or renders content (the front end shows everything as plain text and images only).

- `GET /events/:id/live` (owner, editor, viewer): `{ slug: string | null, published: boolean, snapshot: LiveSnapshot | null, updatedAt: string | null }`.
- `PUT /events/:id/live` (owner or editor; viewers get 403): body `{ published?: boolean, snapshot?: LiveSnapshot }`. Either part is optional; sending a snapshot replaces it whole. Creates a random 12 character lowercase base32 `slug` on first use (unguessable, stable afterwards). Returns the same shape as GET.
- `GET /public/live/:slug` (no sign-in): `{ event: { name, date, venue }, snapshot: LiveSnapshot, updatedAt }` when published, otherwise 404 `{error:"not_found"}`. Sends `Cache-Control: public, max-age=10` and an ETag; honours `If-None-Match` with 304. Never returns anything about people, passes, keys or registrations.
- Rate limits: PUT 60 per hour per user; public GET 240 per minute per hashed IP.

## Display extras (workstream B)

Every display payload may carry optional `x?: { ticker?: string[]; sponsors?: { name: string; logo?: string }[] }` next to `v` and `d`. `validate()` trims and caps them as above (ticker 5 x 80, sponsors 4, logo data URL 60000 characters and only `data:image/(png|jpeg|webp);base64,`). The display screen shows the ticker as a scrolling strip along the bottom and sponsor logos in a small strip, both optional and both off when empty. Extras are stored per browser (localStorage key `eh-extras-v1`) so they are set once and used by every tool.

## Share card API (workstream B)

`src/lib/share-cards.ts` exports `renderShareCard(payload: Payload, opts: { format: "square" | "story"; theme: string; title?: string; extras?: Payload["x"] }): Promise<Blob>` (PNG, 1080x1080 or 1080x1920, drawn on a canvas with the display theme's colours and fonts) and `renderWinnersCard(data: { title: string; first: string; second?: string; third?: string; event?: string }, opts: { format: "square" | "story"; theme: string }): Promise<Blob>`. Pure layout helpers are exported and unit tested.

## Event page mount points (already in place)

`EventsPage` mounts `<LivePagePanel eventId />` (owners and editors) and `<EventReportPanel eventId eventName />`; `ScreenButtons` mounts `<PublishToLive payload what />`. Fill the placeholder files; do not move the mounts.

## Plan wizard (workstream D)

New public, no-login tool at `/tools/plan/`: answer a few questions (game type: battle royale or head to head; number of teams; hours available; rooms at the same time; start time) and get a recommended format, match counts and finish time computed from the real libraries (`src/lib/schedule.ts`, `roundrobin.ts`, `doubleelim.ts`, `seeding.ts`, `points.ts`), a schedule, a points scale, rules text filled from the rules template guide's wording, and the sign-up form text from `RegistrationTemplate`. Copy and download as one text pack. Indexable like the other tool pages: needs a `tool-pages.ts` entry with at least 7 detailed FAQ items (350 to 1100 characters each, see `tests/faq.test.mjs`), a TOOLS entry, footer honeycomb tile, sitemap and tests that count tools updated (search for the current tool count, 10, in `src/`, `tests/` and `e2e/` outside the lead-owned specs and update it to 11, listing the lead-owned specs you could not edit in your report).
