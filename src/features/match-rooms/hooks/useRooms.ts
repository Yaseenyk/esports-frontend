"use client";

import { useCallback, useEffect, useState } from "react";
import { explainFailure, type V3Failure } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import { eventLoad, useEventIdParam } from "@/features/shared/hooks/useEventIdParam";
import { BLANK_ROOM, ROOM_WORDS, extractCaptainToken, toCreateBody, validateRoomForm, type CaptainRoom, type RevealedRoom, type RoomErrors, type RoomForm, type RoomView } from "@/features/match-rooms/domain";
import { claimCaptain, createRoom, deleteRoom, fetchMyRooms, fetchRooms, fetchViews, revealRoom, rotateRoom, updateRoom } from "@/features/match-rooms/services/rooms.api";

export const explainRoom = (f: V3Failure): string => (f.code && ROOM_WORDS[f.code]) || explainFailure(f);

export interface Msg { ok: boolean; text: string }

/** Organiser: list, add, edit timing, new password, delete, and the view log of one room. */
export function useOrganiserRooms() {
  const eventId = useEventIdParam();
  const res = useResource(() => eventLoad(eventId, fetchRooms), [eventId]);
  const [form, setForm] = useState<RoomForm>(BLANK_ROOM);
  const [errors, setErrors] = useState<RoomErrors>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [views, setViews] = useState<{ roomId: string; list: RoomView[] } | null>(null);

  const set = useCallback(<K extends keyof RoomForm>(k: K, v: RoomForm[K]) => setForm((f) => ({ ...f, [k]: v })), []);

  const add = useCallback(async () => {
    if (!eventId || busy) return;
    const e = validateRoomForm(form, { creating: true });
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true); setMsg(null);
    const r = await createRoom(eventId, toCreateBody(form));
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: explainRoom(r.failure) }); return; }
    // The typed credentials leave the screen at once: the organiser never sees them again, only captains at the reveal time.
    setForm({ ...BLANK_ROOM, revealMinutesBefore: form.revealMinutesBefore });
    setMsg({ ok: true, text: `Saved ${r.data.label}. Captains of confirmed teams can see it ${r.data.revealMinutesBefore ? `${r.data.revealMinutesBefore} minutes before the start` : "at the start"}.` });
    res.reload();
  }, [eventId, busy, form, res]);

  const retime = useCallback(async (roomId: string, revealMinutesBefore: number) => {
    if (!eventId) return;
    setBusy(true); setMsg(null);
    const r = await updateRoom(eventId, roomId, { revealMinutesBefore });
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: `Reveal time changed for ${r.data.label}.` } : { ok: false, text: explainRoom(r.failure) });
    if (r.ok) res.reload();
  }, [eventId, res]);

  const rotate = useCallback(async (roomId: string, password: string, newRoomId: string): Promise<boolean> => {
    if (!eventId) return false;
    const pw = password.trim(), rid = newRoomId.trim();
    if (!pw) { setMsg({ ok: false, text: "Type the new password." }); return false; }
    setBusy(true); setMsg(null);
    const r = await rotateRoom(eventId, roomId, rid ? { password: pw, roomId: rid } : { password: pw });
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: `New password saved for ${r.data.label}. Captains who already looked must look again.` } : { ok: false, text: explainRoom(r.failure) });
    if (r.ok) res.reload();
    return r.ok;
  }, [eventId, res]);

  const remove = useCallback(async (roomId: string) => {
    if (!eventId) return;
    setBusy(true); setMsg(null);
    const r = await deleteRoom(eventId, roomId);
    setBusy(false);
    setMsg(r.ok ? { ok: true, text: "Room deleted, with its view log." } : { ok: false, text: explainRoom(r.failure) });
    if (r.ok) { res.reload(); setViews(null); }
  }, [eventId, res]);

  const showViews = useCallback(async (roomId: string) => {
    if (!eventId) return;
    if (views?.roomId === roomId) { setViews(null); return; }
    const r = await fetchViews(eventId, roomId);
    if (r.ok) setViews({ roomId, list: r.data }); else setMsg({ ok: false, text: explainRoom(r.failure) });
  }, [eventId, views]);

  return { eventId, res, form, set, errors, busy, msg, add, retime, rotate, remove, views, showViews };
}

/**
 * Captain: claim with the team's captain link, list rooms, reveal one. Revealed credentials live only in this component's memory: never in
 * storage, never in the address bar, gone when the page closes. `hide` drops them at once.
 */
export function useCaptainRooms() {
  const res = useResource(fetchMyRooms, []);
  const [link, setLink] = useState("");
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [needsAdult, setNeedsAdult] = useState(false);
  const [shown, setShown] = useState<Record<string, RevealedRoom>>({});
  const [roomMsg, setRoomMsg] = useState<Record<string, string>>({});

  const claim = useCallback(async () => {
    const token = extractCaptainToken(link);
    if (!token) { setMsg({ ok: false, text: ROOM_WORDS.bad_token }); return; }
    if (needsAdult && !adult) { setMsg({ ok: false, text: "Tick the box to confirm you are 18 or older." }); return; }
    setBusy(true); setMsg(null);
    const r = await claimCaptain(token, needsAdult && adult);
    setBusy(false);
    if (!r.ok) {
      if (r.failure.code === "adult_required") { setNeedsAdult(true); setMsg({ ok: false, text: "Confirm you are 18 or older, then press the button again." }); return; }
      setMsg({ ok: false, text: explainRoom(r.failure) });
      return;
    }
    setLink(""); // the link is a secret of the team: it leaves the field as soon as it has been used
    setMsg({ ok: true, text: `You are now the captain of ${r.data.team} here. Its rooms are listed below.` });
    res.reload();
  }, [link, adult, needsAdult, res]);

  const reveal = useCallback(async (room: CaptainRoom) => {
    setRoomMsg((m) => ({ ...m, [room.id]: "" }));
    const r = await revealRoom(room.id);
    if (r.ok) setShown((s) => ({ ...s, [room.id]: r.data }));
    else setRoomMsg((m) => ({ ...m, [room.id]: explainRoom(r.failure) }));
  }, []);
  const hide = useCallback((roomId: string) => setShown((s) => { const { [roomId]: _gone, ...rest } = s; return rest; }), []);

  // Leaving the page forgets every revealed room.
  useEffect(() => () => setShown({}), []);

  return { res, link, setLink, adult, setAdult, needsAdult, busy, msg, claim, shown, reveal, hide, roomMsg };
}
