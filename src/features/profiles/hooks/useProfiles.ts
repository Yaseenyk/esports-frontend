"use client";

import { useCallback, useEffect, useState } from "react";
import { explainFailure, type V3Result } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import {
  fetchMyPlayerPage, fetchMyTeamPage, fetchMyTeamPages, fetchPlayerPage, fetchTeamPage, postReport, postTeamClaim, putPlayerHidden, putPlayerVisibility, putTeamHidden, putTeamVisibility,
} from "@/features/profiles/services/profiles.api";
import type { OwnPlayerPage, OwnTeamPage, PlayerPage, TeamPage, Visibility } from "@/features/profiles/domain";

/** The `?s=` of a public page, read once on the client (static export: there is no server to read it). null until read. */
export function useSlugParam(): string | null {
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => { setSlug(new URLSearchParams(window.location.search).get("s") ?? ""); }, []);
  return slug;
}

const none = <T>(): Promise<V3Result<T | null>> => Promise.resolve({ ok: true, data: null });

export function usePlayerPage(slug: string | null) {
  return useResource(() => (slug ? fetchPlayerPage(slug) : none<PlayerPage>()), [slug]);
}
export function useTeamPage(slug: string | null) {
  return useResource(() => (slug ? fetchTeamPage(slug) : none<TeamPage>()), [slug]);
}

/** One write at a time with a status line: shared by the two owner screens. */
function useAction<T>(apply: (data: T) => void) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const run = useCallback(async (key: string, call: () => Promise<V3Result<T>>, done: string) => {
    setBusy(key); setError(""); setNotice("");
    const r = await call();
    setBusy("");
    if (r.ok) { apply(r.data); setNotice(done); return true; }
    setError(explainFailure(r.failure));
    return false;
  }, [apply]);
  return { busy, error, notice, run };
}

/** The owner's player page: visibility, what blocks indexing, hide or show one tournament. Phase "unavailable" = flag off: render nothing. */
export function useMyPlayerPage() {
  const res = useResource(fetchMyPlayerPage, []);
  const [page, setPage] = useState<OwnPlayerPage | null>(null);
  useEffect(() => { if (res.phase === "ready") setPage(res.data); }, [res]);
  const a = useAction<OwnPlayerPage | null>(setPage);
  const setVisibility = (v: Visibility) => a.run(`vis-${v}`, () => putPlayerVisibility(v), v === "private" ? "Your profile is private." : v === "unlisted" ? "Your profile now opens for anyone with the link." : "Your profile is public.");
  const setHidden = (itemKey: string, hidden: boolean) => a.run(`hide-${itemKey}`, () => putPlayerHidden(itemKey, hidden), hidden ? "Hidden from your public profile." : "Shown on your public profile again.");
  return { res, page, ...a, setVisibility, setHidden };
}

export function useMyTeamPages() {
  return useResource(fetchMyTeamPages, []);
}

/** One team page the caller owns: visibility (with the captain-permission tick), add a tournament they captained, hide or show one. */
export function useTeamPageEditor(id: string | null, onChanged?: () => void) {
  const res = useResource(() => (id ? fetchMyTeamPage(id) : none<OwnTeamPage>()), [id]);
  const [page, setPage] = useState<OwnTeamPage | null>(null);
  useEffect(() => { if (res.phase === "ready") setPage(res.data); }, [res]);
  const apply = useCallback((p: OwnTeamPage | null) => { setPage(p); onChanged?.(); }, [onChanged]);
  const a = useAction<OwnTeamPage | null>(apply);
  const [consent, setConsent] = useState(false);
  const setVisibility = (v: Visibility) => {
    if (!id) return Promise.resolve(false);
    return a.run(`vis-${v}`, () => putTeamVisibility(id, v, v !== "private" && consent), v === "private" ? "The team page is private." : v === "unlisted" ? "The team page opens for anyone with the link." : "The team page is public.");
  };
  const addClaim = (slug: string, team: string) => (id ? a.run(`claim-${slug}`, () => postTeamClaim(id, slug, team), "Tournament added to the team page.") : Promise.resolve(false));
  const setHidden = (itemKey: string, hidden: boolean) => (id ? a.run(`hide-${itemKey}`, () => putTeamHidden(id, itemKey, hidden), hidden ? "Hidden from the team page." : "Shown on the team page again.") : Promise.resolve(false));
  return { res, page, ...a, consent, setConsent, setVisibility, addClaim, setHidden };
}

export function useReportPage(kind: "players" | "teams", slug: string) {
  const [reason, setReason] = useState("spam");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const submit = async () => {
    setBusy(true); setError("");
    const r = await postReport(kind, slug, reason, note);
    setBusy(false);
    if (r.ok) setDone(true);
    else setError(r.failure.code === "own_page" ? "That is your own page." : explainFailure(r.failure));
  };
  return { reason, setReason, note, setNote, busy, error, done, submit };
}
