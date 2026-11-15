/** The Esports Resume domain: plain types and constants, no imports. */
export type Visibility = "private" | "unlisted" | "public";

export interface GameRow { game: string; inGameName: string; rankCode: string; rankOrdinal: number; roles: string[] }
export interface OwnProfile {
  slug: string; handle: string; bio: string | null; city: string | null; state: string | null; languages: string[]; visibility: Visibility; games: GameRow[]; updatedAt: string | null;
}
export interface OwnResume { profile: OwnProfile | null; adultConfirmedAt: string | null; resumeConsentAt: string | null }
/** What anyone may see. Deliberately has no visibility, no consent time, no email, no ids. */
/** Counts computed by the platform from verified results of tournaments where the player captains a team. Never typed by the player. */
export interface ResumeStats {
  tournaments: number;
  matches: { played: number; wins: number; losses: number; draws: number };
  battleRoyale: { matches: number; wins: number; kills: number; bestPlacement: number | null };
}
export interface PublicProfile { slug: string; handle: string; bio: string | null; city: string | null; state: string | null; languages: string[]; games: GameRow[]; stats: ResumeStats | null; updatedAt: string | null }

export interface ProfileForm { slug: string; handle: string; bio: string; city: string; state: string; languages: string }
export interface GameForm { game: string; inGameName: string; rankName: string; rankOrdinal: string; roles: string[] }
