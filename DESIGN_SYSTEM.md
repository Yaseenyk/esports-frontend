# DESIGN_SYSTEM.md

The look of Esports Hub: dark, matte, flat, one accent. The owner's choice for the whole streamerOS family. This file is the contract for
**v3 code** (see `CLAUDE.md`, "Two zones"). Legacy screens already follow it in spirit; do not restyle them.

## The rules in one place

1. **Tailwind only, zero arbitrary values.** `text-[#123456]`, `p-[13px]`, `w-[37rem]`, `rounded-[10px]`, `grid-cols-[1fr_2fr]` are forbidden in v3 files.
   If a value you need has no token, add the token to `tailwind.config.ts` first, then use it.
2. **Flat.** No shadows, no blur, no gradients, no glow, no grid backgrounds. Depth comes from a matte box and a thin line.
3. **One accent: cyan.** Violet is for the rare second highlight (a badge, a chart series). Never both in one component.
4. **Dark only.** `color-scheme: dark` is set; do not build a light theme.
5. **Visible at first paint.** No `opacity-0` start state that waits for JavaScript. Skeletons only for API-backed screens.
6. **Accessible.** WCAG 2.1 AA (axe runs in Playwright). Touch targets at least `min-h-11` (44 px). Respect `prefers-reduced-motion`.

## Tokens (Tailwind names, defined in `tailwind.config.ts`)

Already defined: `ink`, `cyan`, `purple`, `font-sans`, `font-display`, `font-mono`. To add in Phase 1: `surface`, `line`, `success`, `warning`, `danger`.

### Colour

| Token | Value | Use | Contrast on `surface` |
| --- | --- | --- | --- |
| `ink` | `#05070A` | page background | n/a |
| `surface` | `#0A0B0D` | matte boxes, cards, inputs | n/a |
| `line` | white at 10% (`border-white/10` today) | all borders and dividers | n/a |
| `text-zinc-100` | Tailwind zinc 100 | body and headings | high |
| `text-zinc-300` | Tailwind zinc 300 | secondary text | above 9:1 |
| `text-zinc-400` | Tailwind zinc 400 | tertiary text, captions, placeholders | about 7:1 |
| `cyan-400` (`cyan`) | `#22D3EE` | the accent: links, primary action, focus | 10.9:1 |
| `purple-500` (`purple`) | `#A855F7` | second highlight only | 5.0:1 (large text and icons; not for small body text) |
| `success` | `#4ADE80` | open registration, verified, accepted | 11.3:1 |
| `warning` | `#FBBF24` | closing soon, evidence requested | 11.8:1 |
| `danger` | `#F87171` | rejected, overdue, disqualified, errors | 7.1:1 |

Status colour is never the only signal: pair it with a word or an icon (`Open`, `Overdue`).
Do not use `text-white/50` or lower for text; use `text-zinc-400`.

### Type

| Use | Class | Notes |
| --- | --- | --- |
| Page title (h1) | `font-display text-3xl sm:text-4xl` | one per page, near-white, never gradient text |
| Section (h2) | `font-display text-2xl` | |
| Card title (h3) | `font-display text-lg` | |
| Body | `text-base` | `text-zinc-100` or `text-zinc-300` |
| Secondary | `text-sm` | |
| Meta / caption | `text-xs` | tertiary colour; never the only place a key fact appears |
| Numbers in tables | `font-mono tabular-nums` | scores, kills, points |

Headings use `text-wrap: balance` (already global). No custom font sizes.

### Space, size, radius

- Spacing: Tailwind's default scale only (`p-3`, `gap-4`, `mt-6`). Page gutter `px-4 sm:px-6`. Section gap `space-y-8`.
- Width: `max-w-3xl` (reading), `max-w-5xl` (lists), `max-w-6xl` (dashboards). No arbitrary widths.
- Radius: `rounded-lg` for controls and chips, `rounded-xl` for boxes, `rounded-full` for pills and avatars. No other radii.
- Breakpoints: Tailwind defaults. Design mobile first and check at 390x844 and 412x915 (Chrome; WebKit cannot load pages in Playwright here).

## The box

The only container. Used for cards, panels, inputs.

```tsx
<section className="rounded-xl border border-white/10 bg-surface p-4">...</section>
```

Do not nest boxes. Separate sibling blocks with a `border-t border-white/10` and space, as the marketing pages do.
Interactive boxes change `border-white/10` to `border-white/30` on hover and focus; they do not lift, glow or scale.

## Interaction

- **Focus:** `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400`. Never remove the outline.
- **Buttons:** primary = `bg-cyan-400 text-ink font-semibold rounded-lg min-h-11 px-4`; secondary = box with `border-white/10`; destructive =
  secondary with `text-danger`. One primary per view.
- **Forms:** label above field, helper text below, error text in `danger` with an icon; never placeholder-as-label. Inputs are `surface` boxes.
- **Links in prose:** `text-cyan-400 underline underline-offset-2`.
- **Loading:** a skeleton that matches the final layout, only when the API call is slow enough to notice (`lib/loading.ts`); otherwise nothing.
- **Empty:** one sentence saying why it is empty and the one action to fix it. **Error:** what failed, whether data was lost, a retry button.
- **Motion:** CSS transitions on border colour and opacity only, 150 ms. Nothing moves in a way that changes layout.

## Screens v3 needs, and the pieces

| Screen | Pieces |
| --- | --- |
| Tournament page | `TournamentHeader` (title, game badge, status badge, dates), `RegistrationPanel`, `ScheduleList`, `StandingsTable`, `RosterList`, `RulesAccordion`, `ShareBar` |
| LFT board | `LftFilters` (game, role, rank range, state, online), `LftCard`, `LftEmpty`, `ApplyDialog` |
| Esports Resume | `ResumeHeader`, `GameRankRow`, `StatTile` (number + label), `HistoryTable`, `VisibilityToggle` |
| Disputes | `DisputeForm`, `EvidenceUploader` (5 MB, png/jpeg/webp), `EvidenceGrid`, `DisputeTimeline`, `OverdueBadge` |
| Shared | `StatusBadge`, `GameBadge` (exists), `Pill`, `EmptyState`, `Skeleton` (exists), `ConfirmDialog` |

Each is a presentation component: props in, markup out, no fetching (Trinity layer 1).

## Images and share cards

- Game icons 192 px WebP (existing). Team logos: square, uploaded as WebP, shown `rounded-full` or `rounded-lg`; always with `width`/`height`.
- Open Graph cards for tournaments are drawn at build time in the brand style: flat vector on `#05070A`, cyan and violet only, no photos,
  no glow, no warm colours (same contract as the portfolio covers). Title, game, date, college name. No text smaller than the card's body size.

## Review checklist (v3 pull request)

- [ ] No `[` arbitrary Tailwind value in any added line (`grep -E "\b[a-z-]+-\[" `).
- [ ] No `../` import; no `fetch` in a component; no table import outside a repository.
- [ ] Only tokens above; status has a word or icon; text colour is zinc 100/300/400 or an accent token.
- [ ] Works at 390 px wide, keyboard-only, with reduced motion; axe has no new violations.
- [ ] Empty, loading and error states exist.
