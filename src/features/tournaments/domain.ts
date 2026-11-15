/** The tournament domain: plain types and labels, no imports. UI components import from here, never from services. */
export type Venue = "online" | "offline" | "hybrid";

export interface TournamentCard {
  slug: string; title: string; game: string; format: string; status: string; summary: string | null; venue: Venue | null;
  city: string | null; state: string | null; startsAt: string | null; endsAt: string | null; maxTeams: number | null; publishedAt: string | null; seoReady: boolean;
}
export interface ScheduleRow { stage: string; round: number | null; slot: number | null; teamA: string; teamB: string; startsAt: string | null; status: string }
export interface MatchResult { stage: string; round: number | null; slot: number | null; teamA: string; teamB: string; status: string; scoreA: number | null; scoreB: number | null; winner: "a" | "b" | null; corrected: boolean }
export interface BrResult { matchNo: number; team: string; placement: number; kills: number; corrected: boolean; original: { placement: number; kills: number } | null }
export interface TournamentDetail extends TournamentCard {
  description: string | null; rules: string | null;
  registration: { open: boolean; registered: number; approved: number; spotsLeft: number | null };
  teams: { name: string; teamSlug: string }[];
  schedule: ScheduleRow[];
  results: { matches: MatchResult[]; battleRoyale: BrResult[] };
  hasResults: boolean;
}
export interface LiveStatus { slug: string; status: string; registered: number; spotsLeft: number | null; open: boolean }

export const GAME_NAMES: Record<string, string> = { bgmi: "BGMI", free_fire: "Free Fire", valorant: "Valorant", cod_mobile: "COD Mobile", cs2: "CS2", other: "Other game" };
export const FORMAT_NAMES: Record<string, string> = { battle_royale_points: "Battle royale points", single_elimination: "Single elimination", double_elimination: "Double elimination", round_robin: "Round robin", swiss: "Swiss" };
export const STATUS_NAMES: Record<string, string> = { published: "Announced", registration_open: "Registration open", registration_closed: "Registration closed", live: "Live", completed: "Completed" };
export const gameName = (g: string): string => GAME_NAMES[g] ?? g;
export const formatName = (f: string): string => FORMAT_NAMES[f] ?? f;
export const statusName = (s: string): string => STATUS_NAMES[s] ?? s;
