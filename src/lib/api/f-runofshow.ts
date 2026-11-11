/** Run-of-show calls. Own client for this feature: same shared `api` as the rest of the app. */
import { api } from "./index";
import type { PublicRos, RosItem, RosLink, RosStatus } from "../runofshow";
import { toPayload } from "../runofshow";

export interface RosState { items: RosItem[]; link: RosLink | null }
const base = (eventId: string) => `/events/${encodeURIComponent(eventId)}/runofshow`;

export const runofshow = {
  /** Owner, editor or viewer. Never cached: the panel must show what is really saved. */
  get: (eventId: string) => api.get<RosState>(base(eventId), { ttl: 0, swr: 0 }),
  /** Owner or editor. Replaces the whole list (at most 200 items) and returns what was saved. */
  put: (eventId: string, items: RosItem[]) => api.put<RosState>(base(eventId), { items: toPayload(items) }),
  /** Owner or editor. One status change. */
  setStatus: (eventId: string, itemId: string, status: RosStatus) => api.post<{ item: RosItem | null }>(`${base(eventId)}/${encodeURIComponent(itemId)}/status`, { status }),
  /** Owner or editor. Makes the volunteer link (replacing any older one). The token is returned this once. */
  makeLink: (eventId: string, showNotes: boolean) => api.post<{ token: string; showNotes: boolean; createdAt: string }>(`${base(eventId)}/link`, { showNotes }),
  /** Owner or editor. Stops the volunteer link working. */
  revokeLink: (eventId: string) => api.del<{ ok: true }>(`${base(eventId)}/link`),
  /** No sign-in. The shared client sends the saved ETag, so an unchanged list costs one tiny 304 answer. */
  public: (token: string) => api.get<PublicRos>(`/public/run/${encodeURIComponent(token)}`, { ttl: 0, swr: 0, retries: 1 }),
};
