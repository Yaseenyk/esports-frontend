/** Typed calls for the public events listing. Own client file; copies the pattern of `live.public` in cloud.ts. */
import { api } from "./index";
import type { DirectoryDraft, DirectoryEntry } from "../directory";

export interface DirectoryOwnerState {
  entry: (DirectoryDraft & { listed: boolean; updatedAt: string }) | null;
  hasRegistration: boolean;
  reports: number;
  hidden: boolean;
  defaults: DirectoryDraft;
}
export interface PublicDirectory { entries: DirectoryEntry[]; page: number; hasMore: boolean; games: string[]; cities: string[] }

const enc = encodeURIComponent;

export const directory = {
  /** Owner, editor or viewer. Never cached: the panel must show what is really listed. */
  get: (eventId: string) => api.get<DirectoryOwnerState>(`/events/${enc(eventId)}/directory`, { ttl: 0, swr: 0 }),
  /** Owner or editor. */
  put: (eventId: string, body: Partial<DirectoryDraft> & { listed?: boolean }) =>
    api.put<{ entry: DirectoryOwnerState["entry"]; reports: number; hidden: boolean }>(`/events/${enc(eventId)}/directory`, body),
  /** No sign-in. The shared client sends the saved ETag, so an unchanged list costs one tiny 304 answer. `query` is the string from listQuery(). */
  list: (query: string) => api.get<PublicDirectory>(`/public/directory${query}`, { ttl: 0, swr: 0, retries: 1 }),
  report: (eventId: string, reason: string) => api.post<{ ok: true }>(`/public/directory/${enc(eventId)}/report`, { reason }),
};
