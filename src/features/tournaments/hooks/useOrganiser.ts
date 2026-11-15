"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { explainFailure, type V3Result } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import { pageChecklist } from "@/features/tournaments/organiser/checklist";
import type { OrganiserTournament, OwnedEventRow } from "@/features/tournaments/organiser/domain";
import { BLANK_FORM, checkSlug, fieldForCode, fromTournament, isDirty, slugify, toCreateBody, toUpdateBody, validateForm, SLUG_WORDS, type FormErrors, type TournamentForm } from "@/features/tournaments/organiser/form";
import { countUndecided, explainTransitionError, statusLabel, transitionOptions } from "@/features/tournaments/organiser/state-machine";
import { createTournament, fetchDisputeStatuses, fetchEvent, fetchOwnedEvents, fetchTournament, moveTournament, probeTournaments, slugInUse, updateTournament } from "@/features/tournaments/services/organiser.api";
import type { EventLite } from "@/features/tournaments/services/organiser.adapter";
import { SITE_URL } from "@/lib/site";

/** The events the person can wrap, with the tournament built on each. A 404 from the probe means the feature is off ("Not available yet"). */
export const useMyTournaments = () => useResource<OwnedEventRow[]>(fetchOwnedEvents, []);

interface Loaded { event: EventLite | null; tournament: OrganiserTournament | null }

export type SlugHint = "idle" | "checking" | "invalid" | "taken" | "maybe_free" | "current";

/** The public address of a tournament page. */
export const publicUrl = (slug: string): string => `${SITE_URL}/tournaments/${slug}/`;

/** Create, edit and publish one tournament. The event comes from `?id=<event id>` because ids are not known at build time. */
export function useTournamentEditor() {
  const [eventId, setEventId] = useState<string | null>(null);
  useEffect(() => { setEventId((new URLSearchParams(window.location.search).get("id") ?? "").slice(0, 80)); }, []);

  const res = useResource<Loaded>(async (): Promise<V3Result<Loaded>> => {
    if (!eventId) return { ok: true, data: { event: null, tournament: null } };
    const ev = await fetchEvent(eventId);
    if (!ev.ok) return ev.failure.kind === "unavailable" ? { ok: true, data: { event: null, tournament: null } } : ev;
    const t = await fetchTournament(eventId);
    if (t.ok) return { ok: true, data: { event: ev.data, tournament: t.data } };
    if (t.failure.kind !== "unavailable") return t;
    const probe = await probeTournaments(); // 404 on the tournament is "none yet" only when the feature is on
    return probe.ok ? { ok: true, data: { event: ev.data, tournament: null } } : probe;
  }, [eventId]);

  const [saved, setSaved] = useState<OrganiserTournament | null>(null);
  const [form, setForm] = useState<TournamentForm>(BLANK_FORM);
  const [ready, setReady] = useState(false);
  const slugTouched = useRef(false);
  const loaded = res.phase === "ready" ? res.data : null;
  useEffect(() => {
    if (!loaded) return;
    const { event, tournament } = loaded;
    setSaved(tournament);
    const suggested = event?.name && event.name !== "Untitled event" ? event.name.slice(0, 120) : "";
    setForm(tournament ? fromTournament(tournament) : { ...BLANK_FORM, title: suggested, slug: slugify(suggested, 48) });
    slugTouched.current = !!tournament;
    setReady(true);
  }, [loaded]);

  const [shown, setShown] = useState(false);
  const [serverErrors, setServerErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [openDisputes, setOpenDisputes] = useState<number | null>(null);

  const creating = ready && !saved;
  const slugLocked = !!saved?.publishedAt;
  const errors: FormErrors = useMemo(() => ({ ...(shown ? validateForm(form, { slugLocked }) : {}), ...serverErrors }), [shown, form, slugLocked, serverErrors]);
  const dirty = !!saved && isDirty(form, saved);
  const checklist = useMemo(() => pageChecklist(form, saved), [form, saved]);

  const set = useCallback((k: keyof TournamentForm, v: string) => {
    setServerErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
    if (k === "slug") slugTouched.current = true;
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "title" && !slugTouched.current && !saved) next.slug = slugify(v, 48);
      return next;
    });
  }, [saved]);

  // ---- slug hint: format is known at once; "taken" is certain only for a published address; the save is the final check ----
  const [slugHint, setSlugHint] = useState<SlugHint>("idle");
  const [slugNote, setSlugNote] = useState("");
  useEffect(() => {
    if (!ready || slugLocked) { setSlugHint("idle"); return; }
    const s = form.slug.trim().toLowerCase();
    if (!s) { setSlugHint("idle"); setSlugNote(""); return; }
    const c = checkSlug(s);
    if (!c.ok) { setSlugHint("invalid"); setSlugNote(SLUG_WORDS[c.reason]); return; }
    if (saved && s === saved.slug) { setSlugHint("current"); return; }
    setSlugHint("checking");
    let live = true;
    const t = setTimeout(() => { slugInUse(s).then((taken) => { if (live) setSlugHint(taken ? "taken" : "maybe_free"); }); }, 400);
    return () => { live = false; clearTimeout(t); };
  }, [form.slug, ready, slugLocked, saved]);

  // ---- disputes: only a live tournament can be completed, and open disputes block it ----
  useEffect(() => {
    if (!saved || saved.status !== "live") { setOpenDisputes(null); return; }
    let live = true;
    fetchDisputeStatuses(saved.slug).then((r) => { if (live) setOpenDisputes(r.ok ? countUndecided(r.data) : null); });
    return () => { live = false; };
  }, [saved]);

  const options = useMemo(() => (saved ? transitionOptions(saved.status, { description: saved.description, startsAt: saved.startsAt, openDisputes, dirty }) : []), [saved, openDisputes, dirty]);

  const failWith = (code: string | undefined, text: string) => {
    const field = fieldForCode(code);
    if (field) setServerErrors((e) => ({ ...e, [field]: text })); else setError(text);
  };

  const save = async () => {
    if (!eventId || busy) return;
    setShown(true); setError(""); setNotice("");
    if (Object.keys(validateForm(form, { slugLocked })).length) { setError("Fix the marked fields first."); return; }
    if (saved) {
      const body = toUpdateBody(form, saved);
      if (!Object.keys(body).length) { setNotice("Nothing has changed."); return; }
    }
    setBusy("save");
    const r = saved ? await updateTournament(eventId, toUpdateBody(form, saved)) : await createTournament(eventId, toCreateBody(form));
    setBusy("");
    if (r.ok) {
      setSaved(r.data); setForm(fromTournament(r.data)); setShown(false); setServerErrors({}); slugTouched.current = true;
      setNotice(saved ? "Saved." : "Tournament created as a draft. Only you can see it until you publish.");
      return;
    }
    if (r.failure.code === "tournament_exists") { setNotice(explainFailure(r.failure)); res.reload(); return; }
    failWith(r.failure.code, explainFailure(r.failure));
  };

  const move = async (to: string) => {
    if (!eventId || !saved || busy) return;
    setBusy(`to-${to}`); setError(""); setNotice("");
    const r = await moveTournament(eventId, to);
    setBusy("");
    if (r.ok) { setSaved(r.data); setForm(fromTournament(r.data)); setNotice(`Status is now: ${statusLabel(r.data.status)}.`); return; }
    setError(explainTransitionError(r.failure.code, to) || explainFailure(r.failure));
    if (r.failure.code === "bad_transition" || r.failure.code === "disputes_open") {
      const fresh = await fetchTournament(eventId); // the page was out of date, or a dispute is open: bring both up to date
      if (fresh.ok) { setSaved(fresh.data); setForm(fromTournament(fresh.data)); }
      if (saved.status === "live") { const d = await fetchDisputeStatuses(saved.slug); if (d.ok) setOpenDisputes(countUndecided(d.data)); }
    }
  };

  const [copied, setCopied] = useState<"" | "ok" | "fail">("");
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied("ok"); } catch { setCopied("fail"); }
  };

  return { eventId, res, ready, event: loaded?.event ?? null, saved, creating, form, set, errors, save, busy, error, notice, dirty, checklist, slugLocked, slugHint, slugNote, options, move, openDisputes, copied, copy };
}
