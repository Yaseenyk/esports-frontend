/** The organiser's view of a tournament (API.md section 2, "Organiser response"). Plain types, no imports. */
import type { Venue } from "@/features/tournaments/domain";

export type TournamentStatus = "draft" | "published" | "registration_open" | "registration_closed" | "live" | "completed" | "cancelled";

export interface OrganiserTournament {
  id: string; eventId: string; slug: string; title: string; game: string; format: string; status: string; venue: Venue;
  city: string | null; state: string | null; summary: string | null; description: string | null; rules: string | null;
  maxTeams: number | null; startsAt: string | null; endsAt: string | null; publishedAt: string | null;
  seoReady: boolean; seoFailures: string[]; updatedAt: string | null;
}

/** One event the person may wrap, with the tournament already built on it (or none). */
export interface OwnedEventRow { id: string; name: string; game: string; date: string; role: string; tournament: OrganiserTournament | null; failed: boolean }
