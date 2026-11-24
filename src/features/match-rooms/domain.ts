/**
 * Match rooms (flag v3.rooms): the organiser stores a custom-room ID and password once; captains of confirmed teams read them from the reveal time.
 * Pure: no network, no React. The server enforces every rule; the checks here only give quick, plain feedback.
 */
export type RoomPhase = "waiting" | "revealed" | "expired";

export interface RoomMatch { id: string; teamA: string | null; teamB: string | null }
export interface OrganiserRoom {
  id: string; label: string; match: RoomMatch | null; startsAt: string; revealAt: string; revealMinutesBefore: number; phase: RoomPhase;
  hasCredentials: boolean; version: number; rotatedAt: string | null; purgedAt: string | null; views: number; teamsSeenCurrent: number;
}
export interface EventMatch { id: string; stage: string; round: number; slot: number; teamA: string; teamB: string }
export interface RoomsState { event: { id: string; name: string }; canEdit: boolean; rooms: OrganiserRoom[]; matches: EventMatch[]; revealMax: number; revealDefault: number; credentialMax: number }
export interface RoomView { team: string; version: number; viewedAt: string }
export interface CaptainRoom { id: string; event: { id: string; name: string }; team: string; label: string; match: RoomMatch | null; startsAt: string; revealAt: string; phase: RoomPhase }
export interface RevealedRoom { id: string; label: string; team: string; startsAt: string; version: number; roomId: string; password: string }

export const CRED_MAX = 40;
export const REVEAL_CHOICES = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180] as const;

export interface RoomForm { label: string; matchId: string; startsAt: string; revealMinutesBefore: string; roomId: string; password: string }
export const BLANK_ROOM: RoomForm = { label: "", matchId: "", startsAt: "", revealMinutesBefore: "15", roomId: "", password: "" };
export type RoomErrors = Partial<Record<keyof RoomForm, string>>;

const credOk = (v: string) => { const t = v.trim(); return t.length >= 1 && Array.from(t).length <= CRED_MAX && !/[\u0000-\u001f\u007f]/.test(t); };

/** `<input type="datetime-local">` value (local time) to ISO, or null. */
export function localToIso(v: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) return null;
  const ms = new Date(v).getTime();
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

export function validateRoomForm(f: RoomForm, o: { creating: boolean; now?: number }): RoomErrors {
  const e: RoomErrors = {};
  const label = f.label.trim();
  if (label.length < 1 || label.length > 80) e.label = "Give the room a name of 1 to 80 characters, for example Match 3 lobby.";
  const iso = localToIso(f.startsAt);
  if (!iso) e.startsAt = "Pick the date and time the match starts.";
  else if (new Date(iso).getTime() < (o.now ?? Date.now()) - 24 * 3600_000) e.startsAt = "That start time is more than a day ago.";
  const m = Number(f.revealMinutesBefore);
  if (!Number.isInteger(m) || m < 0 || m > 180) e.revealMinutesBefore = "Choose when captains can see the room: 0 to 180 minutes before the start.";
  if (o.creating) {
    if (!credOk(f.roomId)) e.roomId = `Type the room ID: 1 to ${CRED_MAX} characters on one line.`;
    if (!credOk(f.password)) e.password = `Type the room password: 1 to ${CRED_MAX} characters on one line.`;
  }
  return e;
}

export function toCreateBody(f: RoomForm) {
  return { label: f.label.trim(), matchId: f.matchId || null, startsAt: localToIso(f.startsAt), revealMinutesBefore: Number(f.revealMinutesBefore), roomId: f.roomId.trim(), password: f.password.trim() };
}

/** Captain links look like https://esports.streamerosai.com/report/?t=<token>. Accepts the whole link or the token alone. The token is never stored. */
export function extractCaptainToken(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  let candidate = s;
  const m = /[?#&]t=([A-Za-z0-9_-]{20,64})(?:[&#]|$)/.exec(s);
  if (m) candidate = m[1]!;
  return /^[A-Za-z0-9_-]{20,64}$/.test(candidate) ? candidate : null;
}

export const PHASE_TEXT: Record<RoomPhase, string> = { waiting: "Not shown yet", revealed: "Open to captains", expired: "Ended" };

/** "15 minutes before the start", "at the start". */
export function revealText(minutes: number): string {
  if (minutes <= 0) return "at the start";
  if (minutes % 60 === 0) return `${minutes / 60} hour${minutes === 60 ? "" : "s"} before the start`;
  return `${minutes} minute${minutes === 1 ? "" : "s"} before the start`;
}

export function whenText(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function matchText(m: RoomMatch | null): string {
  if (!m) return "Every confirmed team";
  return m.teamA && m.teamB ? `${m.teamA} vs ${m.teamB}` : "One match";
}

/** Words for the server's room codes. Unknown codes fall back to the shared explanations. */
export const ROOM_WORDS: Record<string, string> = {
  not_yet: "The room details are not shown yet. Come back at the reveal time.",
  expired: "This room has ended and its details were deleted.",
  unavailable: "The room details are not available. Ask the organiser.",
  rooms_not_configured: "Room sharing is not set up on the server yet. Nothing was saved.",
  team_not_confirmed: "That team is not confirmed in this event yet. Ask the organiser to approve it first.",
  bad_token: "That captain link is not valid. Ask the organiser for your team's captain link.",
  token_required: "Paste your team's captain link.",
  room_id_required: "Type the room ID as well: the old one was deleted after the match.",
  room_limit: "This event already has the most rooms it can have.",
  use_rotate: "Change the room ID or password with New password.",
};
