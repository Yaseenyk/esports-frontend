/**
 * Server badges (backend flag v3.achievements). The same list, ids and rule text as the backend's src/v3/lib/badges.ts (tests/badges.test.mjs pins the ids).
 * A badge is earned only from what Esports Hub itself recorded: approved registrations, organiser-entered results, confirmed scrims, published
 * tournaments, a player card link. Journal entries, achievements a player types and the device-only XP in the site menu never earn one. Pure.
 */
export interface BadgeDef { id: string; title: string; rule: string }
export const BADGES: readonly BadgeDef[] = [
  { id: "first_tournament", title: "First tournament", rule: "Captain a team whose registration an organiser approved in a public tournament." },
  { id: "first_result", title: "First verified result", rule: "Have one verified result: a finished match or a battle royale result the organiser entered." },
  { id: "first_win", title: "First win", rule: "Win a verified match, or place 1st in a verified battle royale match." },
  { id: "verified_5", title: "5 verified results", rule: "Have 5 verified results." },
  { id: "verified_10", title: "10 verified results", rule: "Have 10 verified results." },
  { id: "verified_25", title: "25 verified results", rule: "Have 25 verified results." },
  { id: "first_scrim", title: "First scrim", rule: "Play a scrim confirmed on the scrim finder: a confirmed seat, or your own slot with a team confirmed, once its start time has passed." },
  { id: "first_event", title: "First event organised", rule: "Organise a tournament that is published on the site." },
  { id: "player_card", title: "Player card", rule: "Make a player card link (QR) for your profile." },
];
export const BADGE_IDS = BADGES.map((b) => b.id);
export const badgeDef = (id: string): BadgeDef | undefined => BADGES.find((b) => b.id === id);

export interface PublicBadge { id: string; title: string }
export interface OwnBadge extends BadgeDef { earned: boolean; hidden: boolean }
export interface OwnBadges { items: OwnBadge[]; sectionHidden: boolean }

/** Plain words shown beside badges so nobody mistakes them for the site's device-only XP. */
export const BADGE_NOTE = "Badges are earned from records on Esports Hub, never from numbers you type. The XP and level in the site menu are kept only on this device and are not badges.";
