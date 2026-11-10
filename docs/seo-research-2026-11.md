# Esports Hub: keyword research, competitors and content plan (Nov 2026)

Market: India, English. Source: DataForSEO via treg (monthly search volume estimates, difficulty 0 to 100), Google results pulled live. Cost of the whole study: about $0.27. Raw keyword list: `docs/data/keywords-india-2026-11.csv`.

## 1. What people actually search for

| Group | Example keywords (monthly searches in India, difficulty) | What it means |
|---|---|---|
| ID cards (general) | id card maker 18,100 (12) · id card maker online 2,900 (23) · employee id card maker online 1,900 (7) · id card editor 1,300 (14) · student id card maker online 1,000 (0) · id card maker app 880 (11) | Biggest demand by far, easy to medium difficulty. Not esports-specific. |
| Attendance / check-in | qr code attendance 720 (2) · qr code attendance app 70 · event check in app 30 | Small but nearly uncontested. |
| Brackets | tournament bracket generator 590 (45) · tournament bracket maker 480 (20) · tournament maker 390 (33) · free bracket generator 70 | Medium, many small tool sites already rank. |
| Game tournaments (player intent) | free fire tournament app 18,100 (0) · free fire tournament 9,900 (0) · bgmi tournament 6,600 (9) · valorant tournament 2,400 (20) · bgmi tournament app 1,600 (0) · bgis points table 1,300 (0) · free fire tournament registration 2026 480 (5) | Large and easy, but these are mostly players looking for a tournament to join. |
| Esports organiser software | esports tournament software 10 · esports event management 10 · esports player id card 50 · event badge maker 10 | Almost no search demand. |

Plain reading: an "esports organiser tools" page will get very little search traffic. The search demand is in (a) generic ID card makers, (b) bracket makers and (c) game tournament terms.

## 2. Competitors

- **ID cards:** the top results for "id card maker online free" are template.net, edit.org, canva.com, adobe.com and a few small sites. `gamitisa.com` is a small site that ranks for 157 keywords in India (about 2,800 estimated visits a month), driven almost entirely by one free tool page (`/tools/student-idcard`) that ranks 6 to 31 for "id card maker", "student id card", "id maker" and similar. A single free, no-login tool page can earn real traffic.
- **Brackets:** many small tool sites (bracketmaker.app, snapbracket.com, keepthescore.com, maketheboard.com, scoreleader.com). All are free tools usable without an account.
- **Esports platforms:** `toornament.com` ranks in India for "tournament" (33,100), "bgmi tournament" (6,600), "ff tournament" (4,400), "valorant tournaments" (2,400), "pubg mobile custom room results" (2,400) and rules help pages ("pubg mobile tournament rules and regulations" 1,900). Its traffic comes from one page per game plus help articles. `codeclutch.io` (an Indian organiser) ranks for almost nothing.
- **Event check-in:** the results are listicles ("10 best event check-in apps", from freshtix, scanqueue and getperspective) and product pages (rsvpify, regfox, onetapcheckin). Comparison pages rank here.
- **Weak spots:** "how to run a college esports tournament", "esports player id card", "esports tournament rules template" and "college esports tournament india" are answered by Facebook, Quora, Reddit, Pinterest, YouTube or unrelated sports sites. Nobody has a good page.
- **Note on 'bgmi tournament registration':** Google returns youth sports pages. The query has no good answer yet.

## 3. What to do (in order)

1. **Make the useful tools free to use without an account, on public pages.** Competitors that rank do exactly this. Keep the account for saving online, invite links, live multi-door check-in, signed passes and team features. The tool landing pages built in the last step should embed a working demo version of the ID card maker and the bracket maker.
2. **Go wider than esports for the ID card page.** Target "id card maker online" with event, college-fest, club and esports variants; keep esports as the strongest example, not the only audience.
3. **Publish the weak-spot guides** (section 5). They are cheap to write, nobody good ranks, and they feed the product.
4. **Per-game pages with real content.** "Free Fire tournament", "BGMI tournament", "Valorant tournament": a page per game with rules, formats, points table, and later real listed events. This needs the events directory and registration features, otherwise the page promises something the site cannot give.
5. **A battle royale points table calculator** (BGMI, Free Fire, PUBG): placement plus kill points, for custom rooms. Targets "bgmi points system", "bgis points table"-style queries and organiser needs.
6. **A comparison page for check-in** ("event check-in apps for esports and college events"), because comparison pages are what rank for that group.
7. **Keep `noindex` on until pages have real content**, then set `NEXT_PUBLIC_INDEXABLE=1`.

## 4. Page map

| Page | Primary keyword | Notes |
|---|---|---|
| /tools/id-cards/ | id card maker online (+ variants) | Embed the free demo. Sections: event, college fest, club, esports, student. |
| /tools/id-cards/event/ | event id card maker | Variant page |
| /tools/id-cards/student/ | student id card maker online | Variant page, high volume |
| /tools/check-in/ | qr code attendance | Plus a comparison article |
| /tools/brackets/ | tournament bracket maker | Public, no login |
| /tools/points-table/ | bgmi points system, free fire points table | New tool |
| /games/free-fire-max/, /games/bgmi/, /games/valorant/ | free fire tournament, bgmi tournament, valorant tournament | Rules, formats, points table, later real events |
| /guides/college-esports-tournament-india/ | how to run a college esports tournament | Draft below |
| /guides/esports-tournament-rules-template/ | esports tournament rules template | Draft below |
| /guides/battle-royale-points-table/ | bgmi points system | Existing guide title, needs writing |

## 5. Content drafts (to review and edit before publishing)

These contain no statistics and no claims that need a source. Add real examples from your own events when you have them.

### 5.1 How to run a college esports tournament in India

**Title tag:** How to run a college esports tournament in India (step by step)
**Meta description:** A practical plan for a college esports tournament: pick the game, get permission, set rules, register teams, run check-in and handle results.

1. **Decide what it is for.** A fest event, a recurring league, or a one-day cup. This decides the budget, the number of teams and how many days you need.
2. **Pick a game that fits your players and your hardware.** Mobile games (BGMI, Free Fire MAX) need no PCs and no venue wiring, but need good Wi-Fi or mobile data and charging points. PC games (Valorant, CS) need machines, peripherals and a technical lead.
3. **Get the permissions first.** Written approval from the college, a venue booking, and a named faculty contact. Ask early whether outside participants can enter the campus, because that changes your ID and security plan.
4. **Choose the format.** Small field: single-elimination bracket. Battle royale: a points table over several matches (placement points plus kill points). Many teams: groups first, then a knockout.
5. **Write the rules before registration opens.** One page: eligibility, team size and substitutes, match schedule, lateness and no-show rules, device rules, cheating and its penalty, how disputes are decided, and who has the final say. Publish it with the registration link.
6. **Open registration with a form that asks only what you need.** Team name, captain contact, player names and in-game IDs. For anyone under 18 you need a guardian's consent. Do not collect ID numbers you do not need.
7. **Issue ID cards and passes.** A card per player and staff member with name, team, role and a QR code makes the gate quick and stops substitutions nobody approved. Print them a few days ahead.
8. **Plan the gate.** Decide how many doors, who stands on each, and what they check. Test the scanner on the real network or have an offline option.
9. **Run the day to a written schedule.** Setup, a technical check, a captains' briefing, then matches. Keep one person only for disputes and results.
10. **Publish results the same day,** with the final table or bracket, and thank everyone. Keep the roster and attendance for next time.

*Call to action:* make the ID cards and passes for your event with the free tool.

### 5.2 Esports tournament rules template (BGMI, Free Fire, Valorant)

**Title tag:** Esports tournament rules template you can copy and edit
**Meta description:** A ready-to-edit rules document for a custom-room or LAN esports tournament: eligibility, teams, schedule, conduct, disputes and penalties.

Copy this and replace the brackets.

**1. Eligibility.** Players must be [age rule] on [date]. Players under 18 need a parent or guardian's written consent. Each player may play for one team in this tournament.

**2. Teams.** A team has [number] players and up to [number] substitutes, listed at registration. The captain is the only contact for the organisers. A roster change after [deadline] needs written approval from the organisers.

**3. Registration.** Registration closes on [date and time]. Only complete registrations count. The organisers may refuse any entry and will say why.

**4. Format.** [Single elimination / group stage then knockout / points over N matches]. Matches are played on [map or mode]. In points formats, placement and kill points are as listed in the points table.

**5. Schedule and check-in.** Teams must be present [minutes] before their match. A team that is more than [minutes] late forfeits the match. Each player shows a pass or ID at the gate.

**6. Devices and settings.** Each player uses their own device. Emulators and modified clients are not allowed in mobile events. Required game version: [version].

**7. Conduct.** Respect other players, officials and spectators. Insults, threats or harassment lead to a warning, then removal.

**8. Cheating.** Using hacks, exploits, teaming with other teams, or intentionally losing are cheating. A confirmed case leads to disqualification of the player and may lead to disqualification of the team. Evidence is reviewed by the organisers.

**9. Disputes.** Raise a dispute with the officials immediately after the match, through the captain. Decisions are made by [name or committee] and are final.

**10. Prizes.** [Prizes and how they are paid]. Prizes are paid after results are confirmed.

**11. Changes.** The organisers may change these rules for fairness or safety and will tell all captains in writing.

*Call to action:* attach this to your registration page and use passes to enforce check-in.

### 5.3 Outlines to write next
- **Battle royale points table:** how placement and kill points work, a worked three-lobby example, tie-breakers, a free calculator. (Existing guide title: "Setting up a fair points table for battle royale events".)
- **Best event check-in apps for esports and college events:** honest comparison of options, including where each fits. Only list products you have checked.
- **Free Fire / BGMI / Valorant tournament pages:** formats, rules, points table, how to organise one, link to the tools.

## 6. Limits of this study
Volumes are estimates from one provider for India and English only. Hindi and Marathi searches were not measured. Difficulty is a provider estimate. Competitor traffic figures are estimates, not their real analytics. Total spend $0.27 on the team balance of `connectmazjid`.
