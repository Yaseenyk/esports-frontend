# Fifteen features: shared contract (Nov 2026)

Two repos: frontend `D:\Streamer OS\esports-hub` (Next.js static export) and backend `D:\Streamer OS\esports-backend` (Cloudflare Worker, Hono, D1, vitest). Read `docs/usp-contract.md` for the earlier live page work and `docs/marketing-strategy-2026-11.md` for the product strategy.

## The 15 features, ids, owners and reserved names

| # | id | Feature | Backend files and migration | Frontend files |
|---|---|---|---|---|
| 1 | `leaderboard` | Season leaderboard across events and days | `src/features/leaderboard.ts`, `0010_leaderboard.sql` | `src/lib/api/f-leaderboard.ts`, `src/components/features/leaderboard/**`, panel `leaderboard`, public page `/league/` (route dir `src/app/(site)/(noindex)/league/`) |
| 2 | `directory` | Public events listing | `src/features/directory.ts`, `0011_directory.sql` | `f-directory.ts`, `components/features/directory/**`, panel `directory`, public page `/tournaments/` |
| 3 | `reminders` | Email reminders and result emails | `src/features/reminders.ts`, `0012_reminders.sql`, cron in wrangler.toml | `f-reminders.ts`, `components/features/reminders/**`, panel `reminders` |
| 4 | `profiles` | Team and player profile pages (opt-in) | `src/features/profiles.ts`, `0013_profiles.sql` | `f-profiles.ts`, `components/features/profiles/**`, panel `profiles`, public page `/team/` |
| 5 | `scorer` | Scorer mode (referee links to enter results) | `src/features/scorer.ts`, `0014_scorer.sql` | `f-scorer.ts`, `components/features/scorer/**`, panel `scorer`, public page `/score/` |
| 6 | `results` | Captain result submission with proof, organiser approval | `src/features/results.ts`, `0015_results.sql` | `f-results.ts`, `components/features/results/**`, panel `results`, public page `/report/` |
| 7 | `stages` | Groups then knockout | `src/features/stages.ts` (no new table: uses matches) | `f-stages.ts`, `components/features/stages/**`, panel `stages`, tool page `/tools/groups/` |
| 8 | `ready` | Team ready-check and forfeit timers | `src/features/ready.ts`, `0016_ready.sql` | `f-ready.ts`, `components/features/ready/**`, panel `ready`, public page `/ready/` |
| 9 | `runofshow` | Run-of-show checklist with owners | `src/features/runofshow.ts`, `0017_runofshow.sql` | `f-runofshow.ts`, `components/features/runofshow/**`, panel `runofshow` |
| 10 | `printkits` | Printable kits (score sheets, referee sheets, gate signs, bracket posters) | none | `components/features/printkits/**`, `src/lib/printkits.ts`, tool page `/tools/print-kits/` |
| 11 | `overlay` | Live-updating stream overlay (OBS browser source) | none (uses public live API) | `components/features/overlay/**`, `src/lib/overlay.ts`, panel `overlay`, public page `/overlay/` |
| 12 | `embed` | Embeddable widgets | none (uses public live API) | `components/features/embed/**`, panel `embed`, public page `/embed/` |
| 13 | `brand` | Brand kit (logo, colours) applied across the product | `src/features/brand.ts`, `0018_brand.sql` | `src/lib/brand.ts` (hook), `f-brand.ts`, `components/features/brand/**`, panel `brand` |
| 14 | `duplicate` | Event templates and run it again | `src/features/duplicate.ts` | `f-duplicate.ts`, `components/features/duplicate/**`, header action `DuplicateEventButton` |
| 15 | `sponsorreport` | Sponsor report with privacy-friendly counters | `src/features/sponsorreport.ts`, `0019_sponsorreport.sql` | `f-sponsorreport.ts`, `components/features/sponsorreport/**`, panel `sponsorreport` |

Core (built first, by the scaffolding workstreams): migration `0008_matches.sql`, `src/matches.ts` and `src/features/matches.ts` (backend); `src/lib/api/matches.ts`, `src/components/app/EventToolbox.tsx` and the panel registry (frontend).

## Rules for every workstream

1. **Own your files only.** Never edit another feature's files or shared files listed below. Report what a shared file needs (nav entries, sitemap, robots, tools index, footer, `data.ts`, `tool-pages.ts`) in your final report: the lead wires them.
2. **Shared files nobody but the lead edits:** `src/index.ts` and `src/features/index.ts` (backend registry, already mounts every feature module), `test/authz-matrix.test.ts` (it discovers `test/features/<id>.routes.ts`), `src/components/app/panels.tsx`, `EventsPage.tsx`, `AppShell.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `scripts/verify-seo.mjs`, `src/lib/data.ts`, `src/lib/tool-pages.ts`, `SiteFooter.tsx`, `e2e/site.spec.ts`, `e2e/a11y.spec.ts`, `src/lib/api/cloud.ts`.
3. **Backend feature module**: `src/features/<id>.ts` exports `routes` (a Hono app mounted at `/` by the registry) and `routeRules` (see the authz section below). Migrations only with your reserved number. Constant prepared statements only (the source scan test enforces it). Rate limit every public route. Never return personal data, passes, gate keys or registration tokens on public routes.
4. **Authz tests**: put your route declarations in `test/features/<id>.routes.ts` (format defined by the backend scaffolding workstream in `test/features/README.md`). Write your own behaviour tests in `test/<id>.test.ts`.
5. **Frontend API client**: `src/lib/api/f-<id>.ts` using the existing `api` client from `src/lib/api/client.ts` and `explain()` from `cloud.ts`; do not edit `cloud.ts`.
6. **Panels** are components in `src/components/features/<id>/Panel.tsx` with default export `({ eventId, eventName, role }: PanelProps)`; the registry already lazy-loads them. Replace the stub body only.
7. **Public pages** are route directories you create under `src/app/(site)/(noindex)/<path>/page.tsx` (noindex) with a client component in your folder. Mobile first. No site footer clutter if the page is a tool for a person at a venue (use the CSS-class approach the live page uses).
8. **Tests**: unit tests in `tests/<id>.test.mjs` (node:test via tsx) for all pure logic; Playwright specs in `e2e/<id>.spec.ts` with the API mocked via `page.route` as in `e2e/live.spec.ts`; backend tests as above. Nobody runs `npm run build`, Playwright, `npm test` in the backend is allowed (it is isolated) but not concurrently-heavy: run it once at the end. Nobody commits or pushes or deploys.

## UX strategy (applies to every screen you build)

- Sequential and simple: numbered steps with `ToolStep` (src/components/tools/ToolStep.tsx) for anything with more than one action; one primary button per step; advanced settings under 'More options'.
- Plain words, no jargon; explain unavoidable terms once in a sentence; say exactly what happens after a button is pressed.
- Every screen has an empty state that says what to do next with one primary button, a loading state, an error state in plain words and a success message.
- Phone first: 360px wide, 44px tap targets, no sideways scroll, readable 16px text on public pages.
- Destructive actions are confirmed and, where cheap, undoable. Nothing irreversible happens on a single tap.
- Accessibility: labelled controls, `aria-live` statuses, visible focus, contrast 4.5:1, nothing relies on colour alone.
- Safety: render user text as text only; sanitise sizes; never show full names or photos of anyone under 18 on a public page; never store or show Aadhaar digits beyond the last four; public links are unguessable tokens, revocable, and say so.
- Honest copy only: do not claim what the product does not do; no invented numbers.

## Match model (core, defined here, built by the backend scaffolding workstream)

```sql
CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'main',        -- 'main', 'group:A', 'knockout', 'league' or any short label (<= 40)
  round INTEGER NOT NULL DEFAULT 1,
  slot INTEGER NOT NULL DEFAULT 1,
  a TEXT NOT NULL DEFAULT '',                -- team name as plain text (<= 60); '' = to be decided
  b TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','ready','live','finished','forfeit')),
  score_a INTEGER, score_b INTEGER,
  winner TEXT CHECK (winner IN ('a','b','draw')),
  starts_at TEXT,                            -- ISO time or NULL
  next_id TEXT, next_side TEXT CHECK (next_side IN ('a','b')),   -- where the winner goes (knockout advancement)
  updated_at TEXT NOT NULL,
  updated_by TEXT
);
CREATE INDEX idx_matches_event ON matches(event_id, stage, round, slot);
CREATE TABLE br_results (               -- battle royale: one row per team per match
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  match_no INTEGER NOT NULL, team TEXT NOT NULL, placement INTEGER NOT NULL, kills INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL, PRIMARY KEY (event_id, match_no, team)
);
```

Match JSON (API): `{ id, stage, round, slot, a, b, status, scoreA, scoreB, winner, startsAt, nextId, nextSide, updatedAt }`.

- `GET /events/:id/matches` (owner, editor, viewer): `{ matches: Match[], br: { matchNo, team, placement, kills }[] }`.
- `PUT /events/:id/matches` (owner, editor): `{ matches: Partial<Match>[], replaceStage?: string }` upserts by id (new ids generated when missing, at most 512 matches per event, strings trimmed and length-capped), returns the full list; `replaceStage` first deletes that stage.
- `POST /events/:id/matches/:mid/result` (owner, editor): `{ scoreA, scoreB, status?: 'finished'|'forfeit', winner?: 'a'|'b' }` applies the result (winner derived from scores unless forfeit), and if `nextId` is set puts the winner's name into the next match's `nextSide` slot (idempotent; changing a result re-advances and clears downstream results that depended on it). Returns `{ match, changed: Match[] }`.
- `DELETE /events/:id/matches?stage=` (owner, editor).
- `GET /events/:id/br-results`, `PUT /events/:id/br-results` (owner, editor, body `{ results: [...] , replace?: true }`).
- Server module `src/matches.ts` exports `listMatches(env, eventId)`, `applyResult(env, eventId, matchId, input, by)`, `upsertMatches(...)` for other features (scorer, results, ready) to call after their own authorisation. Features never write the matches table directly.
- `GET /public/live/:slug` adds `matches` (public subset: id, stage, round, slot, a, b, status, scoreA, scoreB, startsAt) when the page is published.

## Panels registry (frontend core)

`src/components/app/panels.tsx` exports `PANELS: { id, group: 'run' | 'share' | 'settings', title, blurb, roles: Role[], load: () => Promise<{default: ComponentType<PanelProps>}> }[]` and `EventToolbox` renders them as three grouped sections ('Run the day', 'Share it', 'Settings') each a closed-by-default disclosure with the plain-language blurb, lazily loading the panel on open. `PanelProps = { eventId: string; eventName: string; role: 'owner' | 'editor' | 'viewer' }`.

## Shared pieces added by the lead (use them, do not rebuild them)

- **Captain links** (backend): migration `0009_captain_links.sql` and `src/captains.ts` (`createCaptainLink`, `resolveCaptainToken`, `listCaptainLinks`, `revokeCaptainLink`). One revocable, unguessable link per team per event; only the token hash is stored. The `results` workstream (6) owns the organiser routes and panel to create, list and revoke captain links (`POST/GET /events/:id/captain-links`, `DELETE /events/:id/captain-links/:id`); the `ready` workstream (8) only resolves tokens with `resolveCaptainToken`. In tests create links with `createCaptainLink(env, eventId, team)`.
- **Visit counter hook** (frontend): `src/lib/hits.ts` exports `sendHit(slug, source, view?)`, a placeholder owned by the `sponsorreport` workstream (15). The overlay (11) and embed (12) pages and the live page call it once per page load. Never write your own counter.
- **Match core** is built: see the match model and API above; `src/matches.ts` (backend) exposes `listMatches`, `upsertMatches`, `applyResult`, `deleteMatches`, `listBr`, `putBr`, `publicMatch`. Match ids are global primary keys: an id already used by another event returns 409.
- **Backend registry and authz rule files**: `src/features/index.ts`, `src/features/types.ts` (`RouteRules`), `test/features/README.md`, `test/features/types.ts`. Your module exports `routes` and `routeRules`; your rows go in `test/features/<id>.routes.ts`.
- **Panels registry**: `src/components/app/panels.tsx`, `EventToolbox.tsx`; replace only the body of `src/components/features/<id>/Panel.tsx`.
- **Shared UI and libs** you may import: `ToolStep`, `TeamsInput`, `ScreenButtons`, `ShareCardButtons`, `src/lib/display*`, `src/lib/live.ts`, `src/lib/matches.ts`, `src/lib/api/matches.ts`, `src/lib/idcard/qr.ts`.
- **Public API client pattern**: look at `live.public` in `src/lib/api/cloud.ts` for an unauthenticated conditional GET; copy the pattern into your own `f-<id>.ts`.
