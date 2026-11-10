# SEO research for the second batch of pages (Nov 2026)

Market: India, English. Source: DataForSEO via treg (monthly search volume estimates and difficulty 0 to 100) and live Google results. This round cost about $0.12 (total with the first study: about $0.39 of the $1 limit). Raw keyword lists were kept out of the repository; the figures below are the ones that drove decisions.

## What people search for

| Page | Main keyword (India, monthly searches) | Related | Reading |
|---|---|---|---|
| Certificate maker | certificate maker online free: 320 (difficulty 0) | participation certificate maker online | Small but easy. Results are large design and PDF brands. |
| Round robin generator | round robin generator: 210 | | Small. Many dedicated generators, apps and a Chrome extension. |
| Match schedule maker | match schedule maker: 90 | | Very small. App store results and bracket sites. |
| Double elimination bracket generator | double elimination bracket generator: 20 | | Tiny in India. Global tools dominate. Built because it completes the bracket tool, not for traffic. |
| Tournament registration form | tournament registration form: 30 · team registration form: 30 · esports tournament registration form: 10 | free fire tournament registration 2026: 480 · free fire esports registration: 390 · ff tournament registration: 170 · ff tournament app: 6,600 | Generic form demand is tiny. Game-specific registration is around 1,000 a month, but most of it is players looking for a tournament to join. |
| Custom room guides | free fire custom room: 260 · how to make custom in free fire: 90 · bgmi custom room tournament: 10 | | Too small to justify a page. Results are YouTube, TikTok and a tournament site. |

## Competitors

- **Certificates:** craftmypdf, templated.io, Adobe Express, Canva, Bannerbear, simplecert, picmaker, Certifier. All are general certificate tools. None is aimed at event organisers or handles Indian-script names as a selling point. Our angle: event winners and participants, one PDF with a page per name, Hindi and Marathi names print correctly, no sign-up.
- **Round robin:** a Chrome extension, a Google Play app, bracketmaker.app, LeagueLobster, Plan2Play, Brakto, Score7, PrintYourBrackets. Our angle: fixtures plus a live league table with scores, odd teams with byes, home and away, CSV, no sign-up.
- **Schedule:** Tourney (app), bracketmaker.app, PlayPass, Canva, generic schedule tools. Our angle: lobbies, gaps and longer breaks, and the finish time worked out for you.
- **Double elimination:** LeagueLobster, Common Ninja, BracketHQ, bracketmaker.app, Elimly, maketheboard, BracketsNinja. Our angle: clicks advance winners and losers, reset final shown only when needed, 3 to 64 teams, no sign-up.
- **Registration forms:** the top results are form templates (Free Fire tournament registration form, gaming tournament registration form), Google Forms templates, Cognito Forms and SurveyMonkey. There is a real template page for "Free Fire tournament registration form". Our angle: a copyable form for any team size, plus a registration link that approves teams straight into the roster used for ID cards and gate check-in.
- **Organiser apps (India):** mostly Google Play apps (ApnaJeet, Tournament Maker apps) and codeclutch.io, a local organiser. No strong organiser-intent web tool for colleges.

## Decisions

1. **Build, but expect modest traffic.** The new tools target small keywords against established sites. They add depth (internal links, helpful tools, topical authority around running events) rather than a traffic spike. The earlier study's bigger opportunities stay as they were: "id card maker" variants and the weak-spot guides.
2. **Registration form page targets the template searches.** `/tools/registration/` gives a free copyable form (no account), with the account feature as the upgrade. This matches what the results show people want.
3. **Skip custom room pages for now.** Search volume is near zero and accuracy depends on game versions that change.
4. **Make titles carry the main keyword.** Certificates title now includes "online"; round robin, schedule, double elimination and registration titles lead with the keyword.
5. **Link everything.** Guides link to the matching tools and tools link back to guides, so each new page is reachable in two clicks from the home page.
6. **Do not publish thin pages.** Every tool page has a description, how-it-works steps, three benefits, questions and answers and guide links. The build check fails otherwise.

## Indexing

- All new tool pages are in the sitemap automatically.
- Each deploy runs IndexNow for changed pages (Bing and other engines).
- Google: submit the sitemap once in Search Console. Do not request indexing page by page for more than a handful of key URLs. Re-check the Pages report after two weeks.

## Limits
Volumes are estimates from one provider for India and English. Hindi and Marathi searches were not measured.
