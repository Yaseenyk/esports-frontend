import { API_BASE, api } from "./index";
import { explain, fetchWithin } from "./cloud";
import type { BrBody, ResultBody, ScorerMatch } from "../scorer";

export type LinkState = "active" | "expired" | "revoked";
export interface ScorerLink { id: string; label: string; stage: string | null; expiresAt: string; revokedAt: string | null; createdAt: string; state: LinkState }
export interface BrRow { matchNo: number; team: string; placement: number; kills: number }
export interface ScoreView {
  event: { name: string };
  label: string;
  stage: string | null;
  expiresAt: string;
  matches: ScorerMatch[];
  battleRoyale: { allowed: boolean; teams: string[]; rows: BrRow[] };
}
export interface ScoreSaved {
  match: ScorerMatch;
  changed: ScorerMatch[];
  /** The match already had a result and this replaced it. */
  correction: boolean;
  previous: { status: string; scoreA: number | null; scoreB: number | null } | null;
  /** Fixing this result undid a match that was played after it. */
  downstreamReset: boolean;
}

const base = (eventId: string) => `/events/${encodeURIComponent(eventId)}/scorer-links`;

/** Organiser calls (owner or editor). The link's token comes back once, when it is made. */
export const scorerLinks = {
  list: (eventId: string) => api.get<{ links: ScorerLink[] }>(base(eventId), { ttl: 0, swr: 0 }).then((r) => r?.links ?? []),
  make: (eventId: string, b: { label: string; stage?: string | null; hours?: number }) => api.post<{ link: ScorerLink; token: string }>(base(eventId), b),
  revoke: (eventId: string, id: string) => api.del<{ ok: true }>(`${base(eventId)}/${encodeURIComponent(id)}`),
};

/** What a person sees when something goes wrong on the scoring page. */
export function scoreMessage(e: unknown): string {
  const s = (e as { status?: number })?.status;
  if (s === 404) return "This scoring link has stopped working. It may have expired or been switched off. Ask the organiser for a new one.";
  if (s === 409) return (e as Error).message && (e as Error).message.length < 160 ? (e as Error).message : "The server could not save that right now.";
  if (s === 400) return (e as Error).message && (e as Error).message.length < 160 ? (e as Error).message : "The server did not accept that. Check the numbers.";
  if (s === 403) return "This link cannot do that.";
  return explain(e);
}

/**
 * The public side: the token is the only credential. Short timeouts, so a venue with a bad signal gets an answer or an error within seconds
 * and the queue can try again, instead of hanging. Errors carry the HTTP status (0 when there was no answer at all) and the server's sentence.
 */
export function scoreClient(token: string) {
  const root = `/public/score/${encodeURIComponent(token)}`;
  const call = async <T>(path: string, body?: unknown): Promise<T> => {
    let res: Response;
    try {
      res = await fetchWithin(API_BASE + root + path, { method: body === undefined ? "GET" : "POST", cache: "no-store", headers: body === undefined ? undefined : { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) }, body === undefined ? 15000 : 10000);
    } catch {
      throw Object.assign(new Error("offline"), { status: 0 });
    }
    if (!res.ok) {
      let msg = `score ${res.status}`;
      try { const j = (await res.json()) as { error?: string }; if (typeof j.error === "string") msg = j.error; } catch { /* keep the generic message */ }
      throw Object.assign(new Error(msg), { status: res.status });
    }
    return res.json() as Promise<T>;
  };
  return {
    view: () => call<ScoreView>(""),
    result: (matchId: string, body: ResultBody) => call<ScoreSaved>(`/matches/${encodeURIComponent(matchId)}/result`, body),
    br: (body: BrBody) => call<{ ok: true; saved: number; rows: BrRow[] }>("/br", body),
  };
}
