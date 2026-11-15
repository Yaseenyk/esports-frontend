/** The LFT board domain: plain types and constants, no imports. */
export type Kind = "looking_for_team" | "looking_for_player";

export interface Listing {
  id: string; kind: Kind; game: string; roles: string[]; rankMin: number | null; rankMax: number | null; state: string | null; city: string | null;
  onlineOk: boolean; message: string; teamName: string | null; createdAt: string; lastBumpedAt: string; expiresAt: string;
}
export interface BoardPage { items: Listing[]; nextCursor: string | null }
/** One of my own listings: the only listing shape that carries a contact and moderation facts. */
export interface MyListing extends Listing { contact: string; status: string; hidden: boolean; reportCount: number; applications: number }
export interface InboxApplication { id: string; status: string; message: string; createdAt: string; respondedAt: string | null; profileSlug: string | null; contact: string | null }
export interface SentApplication { id: string; listingId: string; status: string; kind: Kind; game: string; teamName: string | null; listingStatus: string; createdAt: string; respondedAt: string | null; contact: string | null }

export interface BoardFilters { game: string; kind: string; role: string; rankMin: string; rankMax: string; state: string; city: string; online: boolean }
export const EMPTY_FILTERS: BoardFilters = { game: "", kind: "", role: "", rankMin: "", rankMax: "", state: "", city: "", online: false };

export { GAMES, ROLES, ROLE_LABELS, gameLabel } from "@/features/shared/games";
export const KINDS: { value: Kind; label: string }[] = [{ value: "looking_for_team", label: "Player looking for a team" }, { value: "looking_for_player", label: "Team looking for a player" }];
export const REPORT_REASONS: { value: string; label: string }[] = [
  { value: "spam", label: "Spam" }, { value: "scam", label: "Scam" }, { value: "minor_exposed", label: "Someone who may be under 18" }, { value: "contact_details", label: "Shares contact details" },
  { value: "offensive", label: "Offensive" }, { value: "copyright", label: "Copyright" }, { value: "wrong_info", label: "Wrong information" }, { value: "other", label: "Something else" },
];
export const kindLabel = (k: Kind): string => (k === "looking_for_team" ? "Player looking for a team" : "Team looking for a player");
