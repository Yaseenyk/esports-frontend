import { api } from "./index";
import type { HistoryEntry } from "../profiles";

export { explain } from "./cloud";

export interface ProfileLinkedEvent { eventId: string; eventName: string; teamName: string }
/** A team page as its owner sees it. `consentAt` is set only while the page is published. */
export interface TeamProfile { id: string; name: string; slug: string; published: boolean; blurb: string; links: string[]; consentAt: string | null; updatedAt: string; events: ProfileLinkedEvent[] }
/** What anyone sees: no player names, photos or emails. */
export interface PublicTeam { name: string; blurb: string; links: string[]; history: HistoryEntry[]; updatedAt: string }

const root = "/profiles";
const one = (id: string) => `${root}/${encodeURIComponent(id)}`;

/** Opt-in team pages. Written against the backend routes of the `profiles` feature. */
export const profiles = {
  /** Never cached: the panel must show what is really published. */
  list: () => api.get<{ profiles: TeamProfile[] }>(root, { ttl: 0, swr: 0 }).then((r) => r?.profiles ?? []),
  create: (b: { name: string; blurb?: string; links?: string[] }) => api.post<TeamProfile>(root, b),
  update: (id: string, b: { name?: string; blurb?: string; links?: string[]; published?: boolean; consent?: boolean }) => api.put<TeamProfile>(one(id), b),
  remove: (id: string) => api.del<{ ok: true }>(one(id)),
  /** The caller must own or edit the event. */
  link: (id: string, b: { eventId: string; teamName: string }) => api.post<TeamProfile>(`${one(id)}/link`, b),
  unlink: (id: string, b: { eventId: string; teamName: string }) => api.post<TeamProfile>(`${one(id)}/unlink`, b),
  /** No sign-in. The shared client sends the saved ETag, so an unchanged page costs one tiny 304 answer. */
  public: (slug: string) => api.get<PublicTeam>(`/public/team/${encodeURIComponent(slug)}`, { ttl: 0, swr: 0, retries: 1 }),
};
