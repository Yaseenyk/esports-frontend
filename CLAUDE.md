# CLAUDE.md

Esports Hub (https://esports.streamerosai.com): free tools for Indian esports organisers (ID cards, brackets, points table,
check-in, display screens, registration) growing into an ecosystem: public tournament pages, an Esports Resume, a Looking for
Team / Player board, Discord automation and a dispute portal.

Read in this order before changing anything:
1. This file.
2. [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md): tokens and UI rules.
3. `docs/ecosystem/v3/README.md`: the architecture decisions, open decisions and the phase plan (private, not in git).
4. `docs/ecosystem/v3/DATA_CONTRACT.md` and [`db/schema.ts`](db/schema.ts): the data contract. Change both in the same change.

## What is real today (do not assume otherwise)

- Frontend: Next.js 14 App Router, **static export** (`output: "export"`, `trailingSlash: true`), deployed to GitHub Pages from `main`
  (repo `esports-frontend`). No server runtime: no SSR, no ISR, no route handlers, no middleware. Dynamic data comes from the build
  (`generateStaticParams`) or from the browser calling the API.
- Backend: `../esports-backend`, a Cloudflare Worker (Hono) on D1 (SQLite), free plan. About 50 migrations are live in production.
- `db/schema.ts` is the **v3 design contract in PostgreSQL**, not wired to anything. Which database runs it is an open decision
  (see ADR-1 in `docs/ecosystem/v3/README.md`). Do not write repository code until that is decided.
- The site is indexable. Pages under `src/app/(site)/(noindex)` and the app, gate, join and pass routes are noindex on purpose.

## Hard limits (the owner's rules, not suggestions)

- **Everything free.** No paid Cloudflare plan, no paid database, no payments. treg research budget is set per task by the owner.
- **No money.** No entry fees, prizes, payouts or wallets, and no money columns in the schema. A lawyer decides that later.
- **18+ only.** No under-18 accounts and no guardian flow. New accounts confirm 18+; nothing public for a user without it.
- **No government ids or dates of birth stored.** The ID card studio reads Aadhaar QR in the browser and keeps the last 4 digits only.
- **Privacy by default.** Profiles, rosters and listings are private or unlisted until the person opts in. Honour DNT and GPC (`src/lib/gtm.ts`).
- **Honest content.** No invented stats, tournaments, colleges, results or testimonials. Demo data is labelled and noindex.
- **No ads** on tools, studio, gate or app screens.

## Two zones

| Zone | Where | Rules |
| --- | --- | --- |
| **Legacy** | everything that exists today under `src/` | Keep working. Do not mass-refactor to meet the v3 rules. When you touch a file, do not make it worse. |
| **v3** | new code: `src/features/**`, new routes, `db/**`, the new Worker modules | The strict rules below are enforced. |

Legacy is not clean: about 370 arbitrary Tailwind values and 29 relative `../` imports across 372 files at 15 Nov 2026. A lint check
that reports these in v3 paths only is a Phase 1 task. Never "fix" legacy files as a side effect of a v3 change.

## Trinity Architecture (v3 code)

Three layers, one direction. A layer talks only to its neighbour. Same definition as `../micro-lms/docs/01-architecture-standards.md`.

| Layer | Frontend (`src/features/<feature>/`) | Backend (Worker) |
| --- | --- | --- |
| 1 Presentation | `ui/`: dumb, prop-driven components and `app/` pages | `routes/`: parse, call a service, respond |
| 2 Logic | `hooks/`: state, validation, rules | `services/`: business rules, authorisation, orchestration |
| 3 Data | `services/`: the API client calls and serialisation adapters | `repositories/` (the only place tables are queried), `adapters/` |

- Presentation never imports `fetch`, a repository or a table. Logic never builds a query. Data never holds a business rule.
- `if (user.plan === ...)` in a route or a component is a boundary violation. Put it in a service or hook.
- Only repositories import `db/schema.ts`.
- The single HTTP client is `src/lib/api` (cache, de-dup, ETag, batching, retry only for reads). Do not add a second one.

## Styling rules (v3 code)

- Tailwind only. **No arbitrary values**: `text-[#123456]`, `p-[13px]`, `w-[37rem]`, `bg-[url(...)]` are forbidden in v3 files.
- Every colour, radius, font size and layout width is a named token in `tailwind.config.ts` (see `DESIGN_SYSTEM.md`). Spacing uses
  Tailwind's default scale (`p-3`, `gap-4`).
- Geometry that must be computed (print sizes, positions from data) is set with a CSS variable on `style` and consumed by a token class
  or a rule in `globals.css`, never by an arbitrary class.
- No shadows, blur or gradients. Content is visible at first paint: no `opacity-0` initial state that waits for JavaScript.

## Imports (v3 code)

- `@/` aliases only: `@/features/...`, `@/lib/...`, `@/components/...`. **No `../` imports.** Same-folder `./` is allowed only for files in the
  same feature folder; prefer the alias.
- `@/db/*` is added to `tsconfig.json` paths in Phase 1; until then `db/` is excluded from the Next type-check.

## Programmatic SEO rules

- A programmatic page exists only for a **real record** (a tournament someone created, a college that hosts one). Never from a keyword list.
- **Thin-page guard:** a page is indexable only when `tournaments.seo_ready` is true: a unique title, a summary and description of real text
  from the organiser, a start date, a venue or online flag, and either open registration or published results. Otherwise it renders for
  sharing but is `noindex` and absent from the sitemap. The check runs in the build, in `scripts/verify-seo.mjs`.
- **Cadence cap:** at most 10 newly indexable programmatic pages per week. This site and the owner's other sites lost their index once to
  an auto-publishing flood; do not repeat it.
- Hub pages (`/games/<game>/tournaments/`, `/cities/<city>/`) are created only when at least 3 real indexable tournaments back them.
- Player and team pages are noindex unless the owner of the profile made them public **and** they have real results.
- Structured data goes through one helper; never hand-write JSON-LD in a page. Tournaments use `SportsEvent`.
- The measured demand is small (see the research file). Pages are for sharing and conversion first, search second. Do not promise rankings.

## Commands

```bash
npm run dev              # dev server :3000
npm run build            # static export to ./out (needs NEXT_PUBLIC_API_URL for e2e)
npm test                 # node unit tests (tsx)
npx playwright test      # e2e + axe WCAG 2.1 AA; run suites ONE AT A TIME
node scripts/verify-seo.mjs
```

E2E needs the site built with `NEXT_PUBLIC_API_URL=https://esports-api.yaseenyk.workers.dev` or every auth test fails.

## Conventions

- Conventional commits (`feat(scope):`). Push to `main` when the build and tests pass; deploys are push-triggered.
- The repo is **public**. Never commit `docs/ecosystem/**`, keys, tokens or legal notes. Secrets live in gitignored `.env` and in Cloudflare/GitHub secrets.
- Migrations: production uses `wrangler d1 migrations apply`; staging D1 is not migration-tracked (apply with `d1 execute --file`).
- Ship access-control code behind a flag that is OFF, verify, then switch on.
