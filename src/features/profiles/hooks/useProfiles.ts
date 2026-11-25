"use client";

import { useCallback, useEffect, useState } from "react";
import { explainFailure, type V3Result } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import {
  fetchMyPlayerPage, fetchMyTeamPage, fetchMyTeamPages, fetchPlayerByCard, fetchPlayerPage, fetchTeamPage, postCardLink, postCardReport, postCardReset, postReport, postTeamClaim, putPageDetails,
  putPlayerHidden, putPlayerVisibility, putTeamHidden, putTeamVisibility, type DetailsPatch,
} from "@/features/profiles/services/profiles.api";
import { takeTokenSearch } from "@/lib/tokenHygiene";
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
/**
 * /p/?k=<token>: the token is read once, then removed from the address bar (lib/tokenHygiene: no-referrer, kept only in this tab's storage for a reload),
 * so it does not travel in a copied address, a screenshot, the history or an analytics hit. null until read; "" when the address has none.
 */
export function useCardToken(): string | null {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => { const k = new URLSearchParams(takeTokenSearch(["k"])).get("k") ?? ""; setToken(/^[A-Za-z0-9_-]{22}$/.test(k) ? k : ""); }, []);
  return token;
}
export function usePlayerByCard(token: string | null) {
  return useResource(() => (token ? fetchPlayerByCard(token) : none<PlayerPage>()), [token]);
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
  // Keyed on the loaded data, not on `res` (a new object every render): a write's answer must not be overwritten by the first read.
  const loaded = res.phase === "ready" ? res.data : undefined;
  useEffect(() => { if (loaded !== undefined) setPage(loaded); }, [loaded]);
  const a = useAction<OwnPlayerPage | null>(setPage);
  const setVisibility = (v: Visibility) => a.run(`vis-${v}`, () => putPlayerVisibility(v), v === "private" ? "Your profile is private." : v === "unlisted" ? "Your profile now opens for anyone with the link." : "Your profile is public.");
  const setHidden = (itemKey: string, hidden: boolean) => a.run(`hide-${itemKey}`, () => putPlayerHidden(itemKey, hidden), hidden ? "Hidden from your public profile." : "Shown on your public profile again.");
  const setDetails = (key: string, patch: DetailsPatch, done: string) => a.run(key, () => putPageDetails(patch), done);
  /** Creates the card link (only when the profile is already shared; the server answers share_first otherwise). Existing links are kept. */
  const ensureCard = () => a.run("card", postCardLink, "Your card link is ready.");
  const resetCard = () => a.run("card-reset", postCardReset, "New QR link made. Cards printed with the old QR no longer open your page.");
  return { res, page, ...a, setVisibility, setHidden, setDetails, ensureCard, resetCard };
}

export function useMyTeamPages() {
  return useResource(fetchMyTeamPages, []);
}

/** One team page the caller owns: visibility (with the captain-permission tick), add a tournament they captained, hide or show one. */
export function useTeamPageEditor(id: string | null, onChanged?: () => void) {
  const res = useResource(() => (id ? fetchMyTeamPage(id) : none<OwnTeamPage>()), [id]);
  const [page, setPage] = useState<OwnTeamPage | null>(null);
  // Keyed on the loaded data, not on `res` (a new object every render): a write's answer must not be overwritten by the first read.
  const loaded = res.phase === "ready" ? res.data : undefined;
  useEffect(() => { if (loaded !== undefined) setPage(loaded); }, [loaded]);
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

/** `kind: "cards"` reports a page opened through a card link: `slug` is then the token. */
export function useReportPage(kind: "players" | "teams" | "cards", slug: string) {
  const [reason, setReason] = useState("spam");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const submit = async () => {
    setBusy(true); setError("");
    const r = kind === "cards" ? await postCardReport(slug, reason, note) : await postReport(kind, slug, reason, note);
    setBusy(false);
    if (r.ok) setDone(true);
    else setError(r.failure.code === "own_page" ? "That is your own page." : explainFailure(r.failure));
  };
  return { reason, setReason, note, setNote, busy, error, done, submit };
}
