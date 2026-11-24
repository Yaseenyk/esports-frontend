"use client";

import { useCallback, useState } from "react";
import type { OwnEntry } from "@/features/community/domain";
import { createEntry, deleteEntry, fetchMyCalendar, updateEntry, type EntryBody } from "@/features/community/services/community.api";
import { explainFailure } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";

export interface EntryForm { orgId: string; title: string; game: string; city: string; online: boolean; startsOn: string; endsOn: string; registrationUrl: string; tournamentSlug: string }
export const EMPTY_FORM: EntryForm = { orgId: "", title: "", game: "bgmi", city: "", online: false, startsOn: "", endsOn: "", registrationUrl: "", tournamentSlug: "" };

const WORDS: Record<string, string> = {
  date_past: "That event has already ended.",
  invalid_dates: "Check the dates: the end cannot be before the start.",
  span_too_long: "An event can last at most 31 days.",
  too_far_ahead: "That date is too far ahead.",
  url_not_https: "The registration link must start with https://",
  url_invalid: "That registration link does not look right.",
  url_blocked_host: "That link cannot be used. Payment pages and link shorteners are not allowed.",
  url_too_long: "That registration link is too long.",
  link_required: "Add a registration link or one of your tournament pages.",
  tournament_not_found: "That tournament page is not public, or it belongs to another organisation.",
  calendar_cap: "Your organisation already lists 30 upcoming events.",
  invalid_title: "The title must be 3 to 100 characters of plain text.",
  invalid_city: "The city must be 2 to 60 characters.",
};
const say = (f: Parameters<typeof explainFailure>[0]) => (f.code && WORDS[f.code]) || explainFailure(f);

/** Entry form -> request body. Empty optional fields become null. Pure, exported for tests. */
export function toBody(f: EntryForm, status?: "listed" | "cancelled"): EntryBody {
  return {
    title: f.title.trim(), game: f.game, city: f.city.trim(), online: f.online, startsOn: f.startsOn, endsOn: f.endsOn || f.startsOn,
    registrationUrl: f.registrationUrl.trim() || null, tournamentSlug: f.tournamentSlug.trim() || null, ...(status ? { status } : {}),
  };
}
export const toForm = (e: OwnEntry): EntryForm => ({ orgId: e.orgId, title: e.title, game: e.game, city: e.city, online: e.online, startsOn: e.startsOn, endsOn: e.endsOn, registrationUrl: e.registrationUrl ?? "", tournamentSlug: e.tournamentSlug ?? "" });

/** The organiser's calendar screen: their verified organisations, their entries, and create / edit / cancel / delete. */
export function useMyCalendar() {
  const res = useResource(fetchMyCalendar, []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const run = useCallback(async (work: () => Promise<{ ok: boolean; failure?: Parameters<typeof explainFailure>[0]; stripped?: boolean }>, done: string) => {
    setBusy(true); setError(""); setNotice("");
    const r = await work();
    setBusy(false);
    if (!r.ok) { setError(r.failure ? say(r.failure) : "That was not saved."); return false; }
    setNotice(r.stripped ? `${done} We removed everything after the ? in the link, because that part can hold private tokens.` : done);
    res.reload();
    return true;
  }, [res]);

  const save = (form: EntryForm, editing: string | null) => run(async () => {
    const r = editing ? await updateEntry(editing, toBody(form)) : await createEntry(form.orgId, toBody(form));
    return r.ok ? { ok: true, stripped: r.data.urlStripped } : { ok: false, failure: r.failure };
  }, editing ? "Saved." : "Listed. It is on the public calendar now.");
  const cancel = (e: OwnEntry) => run(async () => {
    const r = await updateEntry(e.id, toBody(toForm(e), "cancelled"));
    return r.ok ? { ok: true } : { ok: false, failure: r.failure };
  }, "Marked as cancelled.");
  const remove = (e: OwnEntry) => run(async () => {
    const r = await deleteEntry(e.id);
    return r.ok ? { ok: true } : { ok: false, failure: r.failure };
  }, "Deleted.");

  return { res, busy, error, notice, save, cancel, remove };
}
