/** The LFT board domain: plain types and constants, no imports. */
export type Kind = "looking_for_team" | "looking_for_player";

export interface Listing {
  id: string; kind: Kind; game: string; roles: string[]; rankMin: number | null; rankMax: number | null; state: string | null; city: string | null;
  onlineOk: boolean; message: string; teamName: string | null; createdAt: string; lastBumpedAt: string; expiresAt: string;
  /** Team matching (flag v3.lft_match): empty lists while it is off. */
  languages: string[]; playHours: string[]; match: { score: number; reasons: string[] } | null;
}
export interface BoardPage { items: Listing[]; nextCursor: string | null }
/** One of my own listings: the only listing shape that carries a contact and moderation facts. */
export interface MyListing extends Listing { contact: string; status: string; hidden: boolean; reportCount: number; applications: number; contacts: Contacts | null }
/** The contacts a person chose to share after an accept (kind -> handle). */
export type Contacts = Partial<Record<ContactKind, string>>;
export interface InboxApplication { id: string; status: string; message: string; createdAt: string; respondedAt: string | null; profileSlug: string | null; contact: string | null; contacts: Contacts | null }
export interface SentApplication { id: string; listingId: string; status: string; kind: Kind; game: string; teamName: string | null; listingStatus: string; createdAt: string; respondedAt: string | null; contact: string | null; contacts: Contacts | null }

export interface BoardFilters { game: string; kind: string; role: string; rankMin: string; rankMax: string; state: string; city: string; online: boolean; lang: string; hours: string; sort: "" | "match" }
export const EMPTY_FILTERS: BoardFilters = { game: "", kind: "", role: "", rankMin: "", rankMax: "", state: "", city: "", online: false, lang: "", hours: "", sort: "" };

/** What I look for, used only to rank the board ("Best match for me"). Kept in this browser only. */
export interface MatchWants { roles: string[]; languages: string[]; hours: string[] }
export const EMPTY_WANTS: MatchWants = { roles: [], languages: [], hours: [] };

export const LANGUAGES: { value: string; label: string }[] = [
  { value: "en", label: "English" }, { value: "hi", label: "Hindi" }, { value: "bn", label: "Bengali" }, { value: "ta", label: "Tamil" }, { value: "te", label: "Telugu" },
  { value: "mr", label: "Marathi" }, { value: "kn", label: "Kannada" }, { value: "ml", label: "Malayalam" }, { value: "gu", label: "Gujarati" }, { value: "pa", label: "Punjabi" },
  { value: "ur", label: "Urdu" }, { value: "or", label: "Odia" }, { value: "pt", label: "Portuguese" }, { value: "id", label: "Indonesian" }, { value: "other", label: "Another language" },
];
export const PLAY_HOURS: { value: string; label: string }[] = [
  { value: "morning", label: "Morning (6 am to 12 pm IST)" }, { value: "afternoon", label: "Afternoon (12 to 5 pm IST)" }, { value: "evening", label: "Evening (5 to 9 pm IST)" },
  { value: "night", label: "Night (9 pm to 1 am IST)" }, { value: "late_night", label: "Late night (1 to 6 am IST)" },
];
export const CONTACT_KINDS = ["discord", "instagram", "telegram", "ign", "other"] as const;
export type ContactKind = (typeof CONTACT_KINDS)[number];
export const CONTACT_LABELS: Record<ContactKind, string> = { discord: "Discord", instagram: "Instagram", telegram: "Telegram", ign: "In-game name", other: "Other handle" };
export const labelOf = (list: { value: string; label: string }[], v: string): string => list.find((x) => x.value === v)?.label ?? v;

export { GAMES, ROLES, ROLE_LABELS, gameLabel } from "@/features/shared/games";
export const KINDS: { value: Kind; label: string }[] = [{ value: "looking_for_team", label: "Player looking for a team" }, { value: "looking_for_player", label: "Team looking for a player" }];
export const REPORT_REASONS: { value: string; label: string }[] = [
  { value: "spam", label: "Spam" }, { value: "scam", label: "Scam" }, { value: "minor_exposed", label: "Someone who may be under 18" }, { value: "contact_details", label: "Shares contact details" },
  { value: "offensive", label: "Offensive" }, { value: "copyright", label: "Copyright" }, { value: "wrong_info", label: "Wrong information" }, { value: "other", label: "Something else" },
];
export const kindLabel = (k: Kind): string => (k === "looking_for_team" ? "Player looking for a team" : "Team looking for a player");
