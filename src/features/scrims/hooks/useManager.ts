"use client";

import { useState } from "react";
import { useSession } from "@/components/cloud/useSession";
import type { V3Result } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import { answerOffer, createSchedule, deleteSchedule, editSlot, fetchMyWaitlist, fetchNotices, fetchRoster, fetchSchedules, joinWaitlist, readNotices, removeTeam, skipDay, updateSchedule } from "@/features/scrims/services/manager.api";
import { scrimError, useMyTeams } from "@/features/scrims/hooks/useScrims";

/** One write at a time with a status line; reloads the given resources afterwards. */
function useAct() {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const act = async (key: string, call: () => Promise<V3Result<unknown>>, done: string, after: (() => void)[] = []) => {
    setBusy(key); setError(""); setNotice("");
    const r = await call();
    setBusy("");
    if (r.ok) { setNotice(done); after.forEach((f) => f()); return true; }
    setError(scrimError(r.failure));
    return false;
  };
  return { busy, error, notice, act };
}

/** Who is in which slot of one scrim, its waitlist, and the poster's edits (teams needed, skill note) and removals. */
export function useRoster(slotId: string, onChange?: () => void) {
  const res = useResource(() => fetchRoster(slotId), [slotId]);
  const a = useAct();
  const refresh = () => { res.reload(); onChange?.(); };
  return {
    res, ...a,
    remove: (requestId: string) => a.act(`remove-${requestId}`, () => removeTeam(requestId), "Team removed. The next team on the waitlist gets an offer.", [refresh]),
    edit: (body: { slots?: number; skillNote?: string }) => a.act("edit", () => editSlot(slotId, body), "Scrim updated.", [refresh]),
  };
}

/** My waitlist places and offers: accept within the time shown, decline, or leave. */
export function useMyWaitlist() {
  const res = useResource(fetchMyWaitlist, []);
  const a = useAct();
  const words = { accept: "You are in. The scrim is on My scrims with the poster's contact.", decline: "Offer declined. It passes to the next team.", leave: "You left the waitlist." } as const;
  return { res, ...a, answer: (id: string, action: "accept" | "decline" | "leave") => a.act(`${action}-${id}`, () => answerOffer(id, action), words[action], [res.reload]) };
}

export function useNotices() {
  const res = useResource(fetchNotices, []);
  const markRead = async () => { const r = await readNotices(); if (r.ok) res.reload(); };
  return { res, markRead };
}

export interface ScheduleForm { teamProfileId: string; game: string; timeOfDay: string; daysAhead: string; region: string; slots: string; contact: string; skillNote: string }
const EMPTY: ScheduleForm = { teamProfileId: "", game: "", timeOfDay: "21:00", daysAhead: "3", region: "india", slots: "4", contact: "", skillNote: "" };

/** Recurring daily scrims: create, pause or resume, skip one day, stop. */
export function useSchedules() {
  const session = useSession();
  const teams = useMyTeams(!!session);
  const res = useResource(fetchSchedules, []);
  const a = useAct();
  const [form, setForm] = useState<ScheduleForm>(EMPTY);
  const set = <K extends keyof ScheduleForm>(k: K, v: ScheduleForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const create = async () => {
    if (!form.teamProfileId || !form.game || !/^\d{2}:\d{2}$/.test(form.timeOfDay) || form.contact.trim().length < 2) { a.act("create", async () => ({ ok: false, failure: { kind: "bad_input", status: 400, message: "Pick your team, a game, a time and your contact." } }), ""); return; }
    const ok = await a.act("create", () => createSchedule({ teamProfileId: form.teamProfileId, game: form.game, timeOfDay: form.timeOfDay, daysAhead: Number(form.daysAhead), region: form.region, slots: Number(form.slots), contact: form.contact.trim(), skillNote: form.skillNote.trim() || undefined }), "Recurring scrim saved. Its next days are on the board.", [res.reload]);
    if (ok) setForm(EMPTY);
  };
  return {
    teams, res, ...a, form, set, create,
    toggle: (id: string, active: boolean) => a.act(`toggle-${id}`, () => updateSchedule(id, { active }), active ? "Resumed: new days will be made again." : "Paused: no new days are made.", [res.reload]),
    skip: (id: string, day: string) => a.act(`skip-${id}-${day}`, () => skipDay(id, day), "No scrim that day.", [res.reload]),
    stop: (id: string) => a.act(`stop-${id}`, () => deleteSchedule(id), "Recurring scrim stopped. Future days nobody joined were cancelled.", [res.reload]),
  };
}

/** Join the waitlist of a full scrim from the board. */
export function useJoinWaitlist(slotId: string) {
  const session = useSession();
  const teams = useMyTeams(!!session);
  const [teamProfileId, setTeam] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async () => {
    if (!teamProfileId) { setError("Pick your team page."); return; }
    if (contact.trim().length < 2) { setError("Add your contact: 2 to 40 characters."); return; }
    setBusy(true); setError("");
    const r = await joinWaitlist(slotId, { teamProfileId, message: "", contact: contact.trim() });
    setBusy(false);
    if (r.ok) setSent(true); else setError(scrimError(r.failure));
  };
  return { teams, teamProfileId, setTeam, contact, setContact, busy, error, sent, submit };
}
