/** Phase 4: the scrim finder (API.md section 10, flag v3.scrims). Shapes and fixed lists; pure. */
export const REGIONS: { value: string; label: string }[] = [
  { value: "india", label: "India" }, { value: "south_asia", label: "South Asia" }, { value: "asia_pacific", label: "Asia Pacific" }, { value: "middle_east", label: "Middle East" },
  { value: "europe", label: "Europe" }, { value: "americas", label: "Americas" }, { value: "other", label: "Other" },
];
export const regionLabel = (r: string): string => REGIONS.find((x) => x.value === r)?.label ?? r;

export interface Slot { id: string; game: string; startsAt: string; region: string; server: string | null; skillNote: string | null; slotsTotal: number; slotsLeft: number; teamName: string; createdAt: string | null; mine: boolean; myRequest: string | null }
export interface MySlot extends Slot { status: string; expired: boolean; hidden: boolean; contact: string; requests: { pending: number; accepted: number } }
export interface IncomingRequest { id: string; teamName: string; message: string | null; status: string; createdAt: string | null; respondedAt: string | null; contact: string | null }
export interface SentRequest { id: string; slotId: string; status: string; game: string; startsAt: string; region: string; slotStatus: string; teamName: string; myTeamName: string; contact: string | null }
export interface Block { id: string; label: string; createdAt: string | null }
export interface BoardPage { items: Slot[]; nextCursor: string | null }

export interface BoardFilters { game: string; region: string; day: string }
export const EMPTY_FILTERS: BoardFilters = { game: "", region: "", day: "" };

export const REQUEST_WORDS: Record<string, string> = { sent: "Waiting for an answer", accepted: "Accepted", declined: "Declined", withdrawn: "Withdrawn" };

/** Plain words for the scrim API codes (fallbacks come from the shared failure helper). */
export const SCRIM_WORDS: Record<string, string> = {
  starts_too_soon: "A scrim must start at least 15 minutes from now.",
  starts_too_late: "You can post a scrim at most 30 days ahead.",
  invalid_startsAt: "Pick a date and a time.",
  slot_cap: "You already have 5 open scrim slots. Cancel one first.",
  slot_full: "Every slot in this scrim is taken.",
  slot_expired: "This scrim has already started.",
  already_requested: "You already asked to join this scrim.",
  own_slot: "That is your own scrim.",
  contact_has_email: "Use a game or Discord handle, not an email address.",
  not_team_owner: "Pick a team page you own.",
  team_required: "Pick your team page.",
  already_answered: "That request was already answered.",
  not_open: "Only an open scrim that has not started can be changed or cancelled.",
  slot_not_full: "This scrim still has room: ask to join instead.",
  offer_expired: "The time to accept this place has passed.",
  not_offered: "There is no open offer for you on this scrim.",
  not_waiting: "You are not on this waitlist any more.",
  below_confirmed: "More teams are already confirmed than that. Remove one first.",
  not_confirmed: "Only a confirmed team can be removed.",
  schedule_cap: "You can have at most 3 recurring scrims.",
  invalid_timeOfDay: "Pick a time of day.",
};
