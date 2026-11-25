/** Phase 3: public player profiles and team pages (API.md section 9, flag v3.profiles). Shapes the screens use; pure. */
export type Visibility = "private" | "unlisted" | "public";

export const VISIBILITY_CHOICES: { value: Visibility; label: string; help: string }[] = [
  { value: "private", label: "Private", help: "Only you can see it. This is the default." },
  { value: "unlisted", label: "Link only", help: "Anyone with the link can open it. It is never listed and search engines are asked not to index it." },
  { value: "public", label: "Public", help: "Anyone can open it. Search engines may index it, but only once it shows verified results." },
];
export const visibilityLabel = (v: Visibility): string => VISIBILITY_CHOICES.find((c) => c.value === v)?.label ?? "Private";

export interface TournamentRef { slug: string; title: string }
export interface MatchRow { tournament: TournamentRef; team: string; stage: string; round: number; opponent: string; scoreFor: number | null; scoreAgainst: number | null; result: "win" | "loss" | "draw"; corrected: boolean; playedAt: string | null; hidden: boolean }
export interface BrRow { tournament: TournamentRef; team: string; matchNo: number; placement: number; kills: number; corrected: boolean; hidden: boolean }
export interface Certificate {
  id: string; tournament: TournamentRef & { game: string }; team: string; completedOn: string | null;
  record: { played: number; wins: number; draws: number; losses: number } | null;
  battleRoyale: { matches: number; wins: number; bestPlacement: number; kills: number } | null;
  hidden: boolean;
}
export interface Entry { itemKey: string; tournament: TournamentRef & { game: string; status: string; startsAt: string | null; endsAt: string | null }; team: string; hidden: boolean }
export interface TeamOnProfile { name: string; games: string[]; tournaments: number; teamPageSlug: string | null }
export interface ProfileStats { tournaments: number; matches: { played: number; wins: number; losses: number; draws: number }; battleRoyale: { matches: number; wins: number; kills: number; bestPlacement: number | null } }
export interface GameLine { game: string; inGameName: string; rankCode: string | null; rankOrdinal: number | null; roles: string[] }

export interface Results { matches: MatchRow[]; battleRoyale: BrRow[]; certificates: Certificate[] }

export type LinkKind = "youtube" | "twitch" | "instagram" | "x" | "discord" | "facebook" | "kick" | "loco" | "rooter" | "website";
export interface PlayerLink { kind: LinkKind; url: string }
export interface Achievement { title: string; year: number | null }

/** `slug` is null when the page was opened through a card link of a Link only profile (its address is the link alone). */
export interface PlayerPage extends Results {
  slug: string | null; handle: string; bio: string | null; city: string | null; state: string | null; languages: string[]; games: GameLine[]; stats: ProfileStats | null;
  teamName: string | null; links: PlayerLink[]; achievements: Achievement[];
  visibility: Visibility; indexable: boolean; teams: TeamOnProfile[]; updatedAt: string | null;
}
export interface TeamPage extends Results {
  slug: string; name: string; blurb: string; links: string[]; visibility: Visibility; indexable: boolean;
  tournaments: { tournament: TournamentRef & { game: string; status: string; startsAt: string | null; endsAt: string | null }; team: string }[]; updatedAt: string | null;
}

export interface OwnPage extends Results {
  slug: string; visibility: Visibility; path: string; indexable: boolean; indexBlockers: string[]; hiddenByModeration: boolean; entries: Entry[];
}
export interface DetailsPatch { teamName?: string | null; links?: PlayerLink[]; achievements?: Achievement[]; hiddenFields?: HideableField[]; searchOptIn?: boolean }
export interface PageDetails { teamName: string | null; links: PlayerLink[]; achievements: Achievement[]; hiddenFields: HideableField[]; searchOptIn: boolean }
/** `path` is null while nothing is shared (or Link only before a card link exists); `cardPath` is the QR value ("/p/?k=..."), null until made. */
export interface OwnPlayerPage extends Omit<OwnPage, "path"> { path: string | null; cardPath: string | null; cardCreatedAt: string | null; details: PageDetails; teams: TeamOnProfile[] }

export const LINK_KINDS: { value: LinkKind; label: string; example: string }[] = [
  { value: "youtube", label: "YouTube", example: "https://www.youtube.com/@yourchannel" }, { value: "twitch", label: "Twitch", example: "https://twitch.tv/yourname" },
  { value: "instagram", label: "Instagram", example: "https://instagram.com/yourname" }, { value: "x", label: "X (Twitter)", example: "https://x.com/yourname" },
  { value: "discord", label: "Discord server", example: "https://discord.gg/invite" }, { value: "facebook", label: "Facebook", example: "https://facebook.com/yourpage" },
  { value: "kick", label: "Kick", example: "https://kick.com/yourname" }, { value: "loco", label: "Loco", example: "https://loco.com/streamers/yourname" },
  { value: "rooter", label: "Rooter", example: "https://rooter.gg/yourname" }, { value: "website", label: "Website", example: "https://example.com" },
];
export const linkLabel = (k: string): string => LINK_KINDS.find((x) => x.value === k)?.label ?? "Link";
export const LINKS_MAX = 6;
export const ACHIEVEMENTS_MAX = 8;

/** The show/hide switches on the edit screen, in the order the public page shows the fields. */
export type HideableField = "bio" | "location" | "languages" | "games" | "roles" | "team" | "links" | "achievements" | "stats" | "teams" | "certificates" | "matches";
export const HIDEABLE: { value: HideableField; label: string }[] = [
  { value: "bio", label: "Bio" }, { value: "location", label: "City and state" }, { value: "languages", label: "Languages" }, { value: "games", label: "Games and in-game names" },
  { value: "roles", label: "Roles" }, { value: "team", label: "Current team" }, { value: "links", label: "Social links" }, { value: "achievements", label: "Achievements" },
  { value: "stats", label: "Verified stats" }, { value: "teams", label: "Teams captained" }, { value: "certificates", label: "Certificates" }, { value: "matches", label: "Recent matches" },
];
export interface OwnTeamPage extends OwnPage { id: string; name: string; claimable: { tournament: TournamentRef; team: string }[] }
export interface TeamPageSummary { id: string; slug: string; name: string; visibility: Visibility; path: string; indexable: boolean; indexBlockers: string[]; hiddenByModeration: boolean; tournaments: number; certificates: number }

/** Why a page is not indexed, in words (codes from the API). */
export const BLOCKER_TEXT: Record<string, string> = {
  not_public: "It is not Public.",
  no_verified_results: "It has no verified results yet (results an organiser recorded on Esports Hub).",
  adult_required: "You have not confirmed you are 18 or older.",
  consent_required: "You have not given consent to a shared resume.",
  hidden_by_moderation: "A moderator is reviewing reports about it, so it is hidden for now.",
  search_off: "You have not switched on Show my profile in Google search.",
  thin_content: "It needs a bio of at least 80 characters and a game, or at least one verified result (hidden fields do not count).",
};

export const REPORT_REASONS: { value: string; label: string }[] = [
  { value: "spam", label: "Spam" }, { value: "scam", label: "Scam" }, { value: "minor_exposed", label: "Shows someone under 18" }, { value: "contact_details", label: "Shares contact details" },
  { value: "offensive", label: "Offensive" }, { value: "copyright", label: "Copyright" }, { value: "wrong_info", label: "Wrong information" }, { value: "other", label: "Something else" },
];
