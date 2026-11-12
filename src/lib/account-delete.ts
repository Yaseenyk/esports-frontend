/** Plain-words messages for the account deletion screen. The backend answers 409 with a `code`; this turns each into something a person can act on. */
export interface EventRef { id: string; name: string; newOwnerName?: string }
export interface DeleteBlock {
  /** confirm: tick "also delete my events" and send again. conflict and too_many: nothing can be done on this screen. */
  kind: "confirm" | "conflict" | "too_many" | "club" | "count";
  text: string;
  events: EventRef[];
}

const names = (events: EventRef[]) => {
  const shown = events.slice(0, 5).map((e) => `“${e.name}”`).join(", ");
  return events.length > 5 ? `${shown} and ${events.length - 5} more` : shown;
};

export function deleteBlock(err: unknown): DeleteBlock | null {
  const x = err as { status?: number; detail?: { code?: string; events?: EventRef[] } } | null;
  if (!x || x.status !== 409 || !x.detail?.code) return null;
  const events = x.detail.events ?? [];
  switch (x.detail.code) {
    case "events_need_delete_confirmation":
      return {
        kind: "confirm",
        events,
        text: `No co-organiser can take over ${names(events)}, so ${events.length === 1 ? "this event is" : "these events are"} deleted with your account. People who only view ${events.length === 1 ? "it" : "them"} lose access. Tick the box below if you also want to delete your events.`,
      };
    case "ownership_conflict": {
      const e = events[0];
      return {
        kind: "conflict",
        events,
        text: `${e?.newOwnerName ?? "Your co-organiser"} cannot take over “${e?.name ?? "this event"}” because they already have an event with the same key. Remove them from the event or ask them to rename their event, then try again. Nothing was deleted.`,
      };
    }
    case "too_many_shared_events":
      return { kind: "too_many", events, text: "You share more than 50 events with other organisers. Remove some co-organisers or delete some events first, then delete your account." };
    case "sole_owner":
      return { kind: "club", events, text: "You are the only admin of a club that other people use. Hand the club over first: on the People page make someone else an admin. Then delete your account. Nothing was deleted." };
    case "events_need_count_confirmation":
      return { kind: "count", events, text: "A lot of your events would be deleted with your account. Type how many in the box below to confirm. Nothing was deleted yet." };
    default:
      return null;
  }
}
