"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { claimCaptain, comment, downloadEvidence, fetchDispute, fetchForTournament, fetchMine, raiseDispute, resolve, transition, uploadEvidence } from "@/features/disputes/services/disputes.api";
import { checkInput, kb, MAX_FILES, slotsLeft } from "@/features/disputes/evidence";
import { compressImage } from "@/features/disputes/image-canvas";
import { cleanToken, raiseBody, validateNote, validateRaise, type RaiseForm } from "@/features/disputes/validators";
import { explainFailure, type V3Result } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import { v3Get } from "@/features/shared/services/v3-api";

export const useMyDisputes = () => useResource(fetchMine, []);

// ---- evidence picker: choose, compress, show a result per file ----

export interface PickedItem { key: string; name: string; status: "working" | "ready" | "error"; blob?: Blob; size?: number; error?: string }

/** Holds the images a person picked. Each is checked, then shrunk to 400 KB in the browser; every file reports its own result. */
export function useEvidencePicker(existing: number) {
  const [items, setItems] = useState<PickedItem[]>([]);
  const seq = useRef(0);
  const patch = (key: string, p: Partial<PickedItem>) => setItems((cur) => cur.map((i) => (i.key === key ? { ...i, ...p } : i)));
  const counted = items.filter((i) => i.status !== "error").length;

  const add = useCallback(async (files: File[]) => {
    let room = slotsLeft(existing, counted);
    for (const f of files) {
      const key = `f${++seq.current}`;
      const problem = checkInput(f);
      if (problem) { setItems((c) => [...c, { key, name: f.name, status: "error", error: problem }]); continue; }
      if (room <= 0) { setItems((c) => [...c, { key, name: f.name, status: "error", error: `A dispute holds at most ${MAX_FILES} images.` }]); continue; }
      room--;
      setItems((c) => [...c, { key, name: f.name, status: "working" }]);
      const r = await compressImage(f);
      if (r.ok) patch(key, { status: "ready", blob: r.blob, size: r.blob.size });
      else patch(key, { status: "error", error: r.reason === "too_big" ? "Still over 400 KB after shrinking. Crop the screenshot or try a smaller one." : "This image could not be read. Try a different file." });
    }
  }, [existing, counted]);

  return { items, add, remove: (key: string) => setItems((c) => c.filter((i) => i.key !== key)), clear: () => setItems([]), ready: items.filter((i) => i.status === "ready" && i.blob), full: slotsLeft(existing, counted) === 0, sizeText: kb };
}

// ---- raise a dispute ----

export const BLANK_RAISE: RaiseForm = { slug: "", type: "", summary: "", team: "", againstTeam: "", matchNo: "" };

export function useRaiseDispute() {
  const [form, setForm] = useState<RaiseForm>(BLANK_RAISE);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ id: string; failedFiles: string[] } | null>(null);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [token, setToken] = useState("");
  const [claimError, setClaimError] = useState("");
  const picker = useEvidencePicker(0);
  const [unavailable, setUnavailable] = useState(false);

  // The list call is the probe: it answers 404 while the dispute flag is off, and the whole screen then says "Not available yet".
  useEffect(() => { let live = true; fetchMine().then((x) => { if (live && !x.ok && x.failure.kind === "unavailable") setUnavailable(true); }); return () => { live = false; }; }, []);
  useEffect(() => { const t = new URLSearchParams(window.location.search).get("t"); if (t) setForm((f) => ({ ...f, slug: t.toLowerCase().slice(0, 60) })); }, []);
  const errors = shown ? validateRaise(form) : {};

  const claim = async () => {
    const c = cleanToken(token);
    if (c.error) { setClaimError(c.error); return; }
    if (!/^[a-z0-9-]{3,60}$/.test(form.slug.trim().toLowerCase())) { setClaimError("Enter the tournament address first."); return; }
    setBusy("claim"); setClaimError("");
    const r = await claimCaptain(form.slug.trim().toLowerCase(), c.token);
    setBusy(""); setToken(""); // the secret never stays in the page
    if (r.ok) { setClaimed((l) => (r.data.team && !l.includes(r.data.team) ? [...l, r.data.team] : l)); setForm((f) => (f.team ? f : { ...f, team: r.data.team })); }
    else setClaimError(r.failure.kind === "unavailable" ? "That token did not match a team in this tournament." : explainFailure(r.failure));
  };

  const submit = async () => {
    setShown(true);
    if (Object.keys(validateRaise(form)).length || busy) return;
    setBusy("raise"); setError("");
    const r = await raiseDispute(form.slug.trim().toLowerCase(), raiseBody(form));
    if (!r.ok || !r.data) { setBusy(""); setError(r.ok ? "The dispute could not be read back. Check your disputes list before trying again." : explainFailure(r.failure)); return; }
    const id = r.data.id, failedFiles: string[] = [];
    for (const it of picker.ready) { // the dispute exists now; each image is its own request so one failure does not lose the others
      const up = await uploadEvidence(id, it.blob as Blob);
      if (!up.ok) failedFiles.push(`${it.name}: ${explainFailure(up.failure)}`);
    }
    setBusy(""); setDone({ id, failedFiles });
  };
  return { unavailable, form, set: (k: keyof RaiseForm, v: string) => setForm((f) => ({ ...f, [k]: v })), errors, submit, busy, error, done, picker, claimed, token, setToken, claim, claimError };
}

// ---- one dispute ----

export function useDisputeView() {
  const [id, setId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null); // `?e=`: set by the organiser queue; lets the resolve form show current results
  useEffect(() => { const p = new URLSearchParams(window.location.search); setId((p.get("id") ?? "").slice(0, 80)); setEventId((p.get("e") ?? "").slice(0, 80) || null); }, []);
  const res = useResource(() => (id ? fetchDispute(id) : Promise.resolve({ ok: true as const, data: null })), [id]);
  const detail = res.phase === "ready" ? res.data : null;
  const picker = useEvidencePicker(detail?.evidence.filter((e) => !e.purged).length ?? 0);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const run = async (key: string, okText: string, call: () => Promise<V3Result<unknown>>) => {
    setBusy(key); setError(""); setNotice("");
    const r = await call();
    setBusy("");
    if (r.ok) { setNotice(okText); res.reload(); } else setError(explainFailure(r.failure));
    return r.ok;
  };

  return {
    id, eventId, res, detail, picker, note, setNote, noteError, busy, error, notice,
    sendComment: async () => { const m = validateNote(note); setNoteError(m); if (m || !id) return; if (await run("comment", "Comment added.", () => comment(id, note.trim()))) setNote(""); },
    uploadAll: async () => {
      if (!id) return;
      setBusy("upload"); setError(""); setNotice("");
      const failed: string[] = [];
      for (const it of picker.ready) { const r = await uploadEvidence(id, it.blob as Blob); if (!r.ok) failed.push(`${it.name}: ${explainFailure(r.failure)}`); }
      setBusy("");
      const okCount = picker.ready.length - failed.length;
      picker.clear();
      if (failed.length) setError(failed.join(" ")); if (okCount > 0) setNotice(`${okCount} image${okCount === 1 ? "" : "s"} added.`);
      res.reload();
    },
    withdraw: () => (id ? run("withdraw", "Dispute withdrawn.", () => transition(id, "withdrawn", "")) : Promise.resolve(false)),
    move: (to: string) => (id ? run(`to-${to}`, "Status updated.", () => transition(id, to, note)) : Promise.resolve(false)),
    resolveWith: (status: string, outcome: string, text: string, corrections?: Record<string, unknown>[]) => {
      const m = validateNote(text, 10); setNoteError(m);
      return id && !m ? run("resolve", corrections?.length ? "Decision saved, with the result corrections." : "Decision saved.", () => resolve(id, { status, outcome, note: text.trim(), ...(corrections?.length ? { corrections } : {}) })) : Promise.resolve(false);
    },
  };
}

/** One evidence image, fetched with the bearer token and shown through an object URL that is released when it leaves the screen. */
export function useEvidenceImage(disputeId: string, evidenceId: string, mime: string, skip: boolean) {
  const [state, setState] = useState<{ url: string; error: string; loading: boolean }>({ url: "", error: "", loading: !skip });
  useEffect(() => {
    if (skip) return;
    let live = true, made = "";
    downloadEvidence(disputeId, evidenceId).then((r) => {
      if (!live) return;
      if (r.ok) { made = URL.createObjectURL(new Blob([r.data], { type: mime })); setState({ url: made, error: "", loading: false }); }
      else setState({ url: "", error: r.failure.status === 410 ? "Deleted after the retention period." : explainFailure(r.failure), loading: false });
    });
    return () => { live = false; if (made) URL.revokeObjectURL(made); };
  }, [disputeId, evidenceId, mime, skip]);
  return state;
}

// ---- organiser queue ----

/** The organiser's queue for one tournament. The tournament is named by `?t=<slug>`, or by `?id=<event id>` which is looked up through the organiser route. */
export function useOrganiserQueue() {
  const [target, setTarget] = useState<{ slug?: string; eventId?: string } | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const slug = (p.get("t") ?? "").toLowerCase().slice(0, 60), eventId = (p.get("id") ?? "").slice(0, 80);
    setTarget(slug ? { slug } : eventId ? { eventId } : {});
  }, []);
  const res = useResource(async () => {
    if (!target || (!target.slug && !target.eventId)) return { ok: true as const, data: { slug: "", title: "", items: [], eventId: "" } };
    let slug = target.slug ?? "", title = "";
    if (!slug && target.eventId) {
      const t = await v3Get<{ slug?: unknown; title?: unknown }>(`/v3/events/${encodeURIComponent(target.eventId)}/tournament`, { force: true });
      if (!t.ok) return t;
      slug = typeof t.data.slug === "string" ? t.data.slug : ""; title = typeof t.data.title === "string" ? t.data.title : "";
    }
    const list = await fetchForTournament(slug);
    return list.ok ? { ok: true as const, data: { slug, title: title || list.data[0]?.tournament.title || slug, items: list.data, eventId: target.eventId ?? "" } } : list;
  }, [target]);
  return { target, res };
}
