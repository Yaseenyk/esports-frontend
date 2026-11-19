/**
 * Guides taken OFF the release schedule on 19 Nov 2026 (AdSense "low-value content" review of streamerosai.com, 16 Nov 2026).
 * Each one is written and kept in its batch file, but it is not released, built or linked. The reason says which live or
 * scheduled guide already covers the topic. Too many guides on one skeleton and one topic reads as scaled content, so the
 * queue keeps the strongest guide per topic. To bring one back: deepen it until it says something the kept guide does not,
 * remove it from this list, and run the tests (it takes the next free slot; every later guide moves back).
 */
export const HELD: Record<string, string> = {
  // Posters: the site already has three poster guides (Free Fire, cricket, college fest) and the poster tool page.
  "bgmi-tournament-poster-guide": "fourth poster guide; same advice as free-fire-tournament-poster with the game name swapped",
  "valorant-tournament-poster-guide": "fifth poster guide; covered by college-fest-esports-poster and the poster tool page",
  "esports-tournament-flyer-and-banner-guide": "sixth poster guide; covered by free-fire-tournament-poster and the poster tool page",
  "football-tournament-poster-ideas": "seventh poster guide; covered by cricket-tournament-poster-ideas",
  "tournament-poster-sizes-whatsapp-instagram-print": "the sizes table is already in free-fire-tournament-poster and the poster tool page",
  // Names: name-idea lists are light on original information. One merged guide stays (esports-team-names-ideas).
  "gaming-team-names-for-valorant-cs2-minecraft-efootball": "fourth team-name list; merged topic lives in esports-team-names-ideas",
  "how-to-name-your-tournament": "a name-idea list with little original information",
  // Points and schedules: the same advice repeated per game.
  "points-table-maker-guide": "repeats the points-table guide and the points table tool page",
  "pubg-mobile-points-system-and-table": "BGMI is the Indian version of PUBG Mobile; bgmi-points-system-explained covers the same scoring",
  "pubg-mobile-tournament-schedule-template": "same template as bgmi-tournament-schedule-template",
  "free-fire-tournament-schedule-template": "same template as bgmi-tournament-schedule-template with a smaller lobby",
  "cs2-tournament-schedule-template": "schedule advice already in valorant-tournament-organiser and the schedule tool page",
  // Rules, forms, rooms: one guide per topic is enough.
  "pubg-mobile-tournament-rules-for-organisers": "same rules as bgmi-tournament-rules-template",
  "efootball-tournament-organise": "overlaps efootball-tournament-rules-template",
  "esports-tournament-registration-form-template": "covered by tournament-registration-form-fields and free-fire-tournament-registration-form-template",
  "cricket-tournament-registration-form": "covered by tournament-registration-form-fields",
  "custom-room-card-id-password-template": "covered by bgmi-and-free-fire-custom-room-setup-guide",
  "qr-code-attendance-for-events": "near duplicate of the qr-code-attendance guide",
  "how-to-run-a-swiss-chess-tournament": "covered by swiss-system-tournament-explained",
  "free-fire-scrims-how-to-run": "same advice as bgmi-scrims-how-to-organise",
  "pubg-mobile-scrims-and-lobby-management": "same advice as bgmi-scrims-how-to-organise",
  "free-fire-college-tournament-checklist": "covered by run-a-campus-tournament and free-fire-tournament-organiser",
  "esports-tournament-certificate-template": "covered by certificate-wording",
  "certificates-for-volunteers-and-referees": "covered by certificate-wording",
  "tournament-fixture-generator-guide": "covered by fixture-maker-for-football-and-cricket and round-robin-schedule",
  "round-robin-single-double-and-tiebreaks": "covered by round-robin-schedule",
  "bracket-reset-and-grand-final-explained": "the bracket reset is explained in double-elimination-bracket-explained",
  "football-tournament-bracket-for-16-teams": "covered by tournament-bracket-template and knockout-for-32-teams-in-one-day",
  "minecraft-bedwars-and-skywars-tournament-rules": "third Minecraft guide; minecraft-tournament-how-to-organise stays",
  "minecraft-hunger-games-tournament-format": "third Minecraft guide; shares much of its lobby text with the Fortnite lobby guide",
  "fortnite-custom-lobby-and-arena-points": "second Fortnite guide; fortnite-tournament-rules-and-scoring stays",
  "dota-2-and-moba-draft-and-substitution-rules": "second Dota guide; dota-2-tournament-captains-mode-and-series stays",
  "chess-rapid-vs-blitz-for-events": "fifth chess guide on an esports site",
  // Money: the site takes no payments and runs no prizes. Guides about pooling entry fees into prizes read as money-game promotion.
  "tournament-prize-pool-and-payout-split": "about splitting a cash pool funded by entry fees; off-topic for a site that handles no money",
  "tournament-entry-fee-and-refund-policy": "about charging entry fees; off-topic for a site that handles no money",
};
