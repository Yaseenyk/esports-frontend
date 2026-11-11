import { api } from "./index";
import type { CloudEvent } from "./cloud";
import type { DuplicateRequest } from "../duplicate";

/** Event templates: "Run it again". The new event is returned in the same shape as a created event. */
export const duplicate = {
  run: async (eventId: string, body: DuplicateRequest) => {
    const created = await api.post<CloudEvent>(`/events/${encodeURIComponent(eventId)}/duplicate`, body);
    api.invalidate("/events"); // the list of events now has one more
    return created;
  },
};
