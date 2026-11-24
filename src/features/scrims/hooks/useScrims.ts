"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/components/cloud/useSession";
import { explainFailure, type V3Failure, type V3Result } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import { EMPTY_FILTERS, SCRIM_WORDS, type BoardFilters, type Slot } from "@/features/scrims/domain";
import {
  blockPoster, blockRequester, cancelSlot, createSlot, fetchBlocks, fetchBoard, fetchIncoming, fetchMySlots, fetchMyTeams, fetchSent, reportSlot, requestSlot, respondTo, unblock, withdrawRequest,
} from "@/features/scrims/services/scrims.api";
import { toUtcIso, todayIst, type Zone } from "@/features/scrims/time";
import { BOARD_KEYS as KEYS, EMPTY_FORM, boardSearch, parseBoardFilters, validateSlotForm, type SlotForm } from "@/features/scrims/filters";

export { boardSearch, parseBoardFilters, validateSlotForm };

/** The scrim codes in plain words, then the shared wording. */
export const scrimError = (f: V3Failure): string => (f.code && SCRIM_WORDS[f.code]) || explainFailure(f);

export type BoardPhase = "loading" | "ready" | "unavailable" | "error";

/** The board: filters in the query string, IST shown by default, signed-in captains get blocks applied and their own slots marked. */
export function useScrimBoard() {
  const session = useSession();
  const signedIn = !!session;
  const [filters, setFiltersState] = useState<BoardFilters>(EMPTY_FILTERS);
  const [zone, setZone] = useState<Zone>("ist");
  const [items, setItems] = useState<Slot[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [phase, setPhase] = useState<BoardPhase>("loading");
  const [skeleton, setSkeleton] = useState(false);
  const [failure, setFailure] = useState<V3Failure | null>(null);
  const [more, setMore] = useState(false);
  const [started, setStarted] = useState(false);
  const run = useRef(0);
  useEffect(() => { setFiltersState(parseBoardFilters(window.location.search)); setStarted(true); }, []);

  const load = useCallback(async (f: BoardFilters) => {
    const id = ++run.current;
    setPhase("loading"); setSkeleton(false);
    const timer = setTimeout(() => id === run.current && setSkeleton(true), 180);
    const r = await fetchBoard(f, signedIn);
    clearTimeout(timer);
    if (id !== run.current) return;
    if (r.ok) { setItems(r.data.items); setCursor(r.data.nextCursor); setPhase("ready"); setFailure(null); }
    else if (r.failure.kind === "unavailable") setPhase("unavailable");
    else { setFailure(r.failure); setPhase("error"); }
  }, [signedIn]);
  useEffect(() => { if (started) void load(filters); }, [started, filters, load]);

  const setFilters = useCallback((next: BoardFilters) => {
    setFiltersState(next);
    window.history.replaceState(null, "", `${window.location.pathname}${boardSearch(next)}`);
  }, []);
  const loadMore = useCallback(async () => {
    if (!cursor || more) return;
    setMore(true);
    const r = await fetchBoard(filters, signedIn, cursor);
    setMore(false);
    if (r.ok) { setItems((cur) => [...cur, ...r.data.items.filter((n) => !cur.some((c) => c.id === n.id))]); setCursor(r.data.nextCursor); }
    else setFailure(r.failure);
  }, [cursor, more, filters, signedIn]);
  const filtered = KEYS.some((k) => filters[k] !== "");
  return { signedIn, filters, setFilters, clear: () => setFilters(EMPTY_FILTERS), filtered, zone, setZone, items, phase, skeleton, failure, hasMore: cursor !== null, loadMore, loadingMore: more, retry: () => load(filters), today: todayIst() };
}

/** The caller's team pages, loaded once when signed in. */
export function useMyTeams(enabled: boolean) {
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    void fetchMyTeams().then((r) => { if (live && r.ok) setTeams(r.data); });
    return () => { live = false; };
  }, [enabled]);
  return teams;
}

export function useNewScrim() {
  const session = useSession();
  const teams = useMyTeams(!!session);
  const [form, setForm] = useState<SlotForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof SlotForm, string>>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const set = <K extends keyof SlotForm>(k: K, v: SlotForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async () => {
    const e = validateSlotForm(form);
    setErrors(e); setServerError("");
    if (Object.keys(e).length > 0) return;
    setBusy(true);
    const r = await createSlot({ teamProfileId: form.teamProfileId, game: form.game, startsAt: toUtcIso(form.zone, form.day, form.time), region: form.region, server: form.server.trim() || undefined, skillNote: form.skillNote.trim() || undefined, slots: Number(form.slots), contact: form.contact.trim() });
    setBusy(false);
    if (r.ok && r.data) setCreatedId(r.data.id);
    else if (!r.ok) setServerError(scrimError(r.failure));
  };
  return { session, teams, form, set, errors, busy, serverError, createdId, submit, minDay: todayIst() };
}

/** Ask to join one slot. */
export function useRequestSlot(slotId: string) {
  const session = useSession();
  const teams = useMyTeams(!!session);
  const [teamProfileId, setTeam] = useState("");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async () => {
    if (!teamProfileId) { setError("Pick your team page."); return; }
    if (contact.trim().length < 2) { setError("Add your contact: 2 to 40 characters."); return; }
    setBusy(true); setError("");
    const r = await requestSlot(slotId, { teamProfileId, message: message.trim(), contact: contact.trim() });
    setBusy(false);
    if (r.ok) setSent(true); else setError(scrimError(r.failure));
  };
  return { teams, teamProfileId, setTeam, message, setMessage, contact, setContact, busy, error, sent, submit };
}

/** Report or block from a board card. */
export function useSlotActions(slotId: string, onBlocked: () => void) {
  const [reason, setReason] = useState("spam");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [reported, setReported] = useState(false);
  const report = async () => {
    setBusy("report"); setError("");
    const r = await reportSlot(slotId, reason, note);
    setBusy("");
    if (r.ok) setReported(true); else setError(scrimError(r.failure));
  };
  const block = async () => {
    setBusy("block"); setError("");
    const r = await blockPoster(slotId);
    setBusy("");
    if (r.ok) onBlocked(); else setError(scrimError(r.failure));
  };
  return { reason, setReason, note, setNote, busy, error, reported, report, block };
}

/** /app/scrims/: my slots (with their requests), the requests I sent, the captains I blocked. */
export function useMyScrims() {
  const slots = useResource(fetchMySlots, []);
  const sent = useResource(fetchSent, []);
  const blocks = useResource(fetchBlocks, []);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const act = async (key: string, call: () => Promise<V3Result<unknown>>, done: string, reload: (() => void)[]) => {
    setBusy(key); setError(""); setNotice("");
    const r = await call();
    setBusy("");
    if (r.ok) { setNotice(done); reload.forEach((f) => f()); } else setError(scrimError(r.failure));
  };
  return {
    slots, sent, blocks, busy, error, notice,
    cancel: (id: string) => act(`cancel-${id}`, () => cancelSlot(id), "Scrim cancelled.", [slots.reload]),
    withdraw: (id: string) => act(`withdraw-${id}`, () => withdrawRequest(id), "Request withdrawn.", [sent.reload]),
    unblock: (id: string) => act(`unblock-${id}`, () => unblock(id), "Unblocked.", [blocks.reload]),
    afterRequestChange: () => { slots.reload(); blocks.reload(); },
  };
}

/** The requests on one of my slots: accept, decline, block. */
export function useIncoming(slotId: string, onChange: () => void) {
  const res = useResource(() => fetchIncoming(slotId), [slotId]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const act = async (key: string, call: () => Promise<V3Result<unknown>>) => {
    setBusy(key); setError("");
    const r = await call();
    setBusy("");
    if (r.ok) { res.reload(); onChange(); } else setError(scrimError(r.failure));
  };
  return {
    res, busy, error,
    accept: (id: string) => act(`accept-${id}`, () => respondTo(id, "accept")),
    decline: (id: string) => act(`decline-${id}`, () => respondTo(id, "decline")),
    block: (id: string) => act(`block-${id}`, () => blockRequester(id)),
  };
}
