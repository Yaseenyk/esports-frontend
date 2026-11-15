"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { blankDraft, correctionPayload, MAX_CORRECTIONS, validateCorrections, type CorrectionDraft, type CorrectionsCheck, type CurrentResults, type DraftKind } from "@/features/disputes/corrections";
import { fetchCurrentResults } from "@/features/disputes/services/disputes.api";

export type CurrentState = "none" | "loading" | "ready" | "error";

/**
 * The corrections being typed into the resolve form. `eventId` (from `?e=` in the link the organiser queue builds) lets the form read the
 * event's current results, so each correction shows the old value beside the new one. Without it the form still works; the server reads
 * the old value itself and records it.
 */
export function useCorrections(eventId: string | null, seed: { matchId: string | null; matchNo: number | null; raisedByTeam: string | null }) {
  const [drafts, setDrafts] = useState<CorrectionDraft[]>([]);
  const [current, setCurrent] = useState<CurrentResults | null>(null);
  const [state, setState] = useState<CurrentState>(eventId ? "loading" : "none");
  const [shown, setShown] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    if (!eventId) { setState("none"); return; }
    let live = true;
    setState("loading");
    fetchCurrentResults(eventId).then((r) => { if (!live) return; if (r.ok) { setCurrent(r.data); setState("ready"); } else setState("error"); });
    return () => { live = false; };
  }, [eventId]);

  const add = useCallback((kind: DraftKind) => {
    setDrafts((d) => (d.length >= MAX_CORRECTIONS ? d : [...d, blankDraft(kind, `c${++seq.current}`, kind === "match" ? { matchId: d.length === 0 && seed.matchId ? seed.matchId : "" } : { matchNo: d.length === 0 && seed.matchNo !== null ? String(seed.matchNo) : "", team: d.length === 0 && seed.raisedByTeam ? seed.raisedByTeam : "" })]));
  }, [seed.matchId, seed.matchNo, seed.raisedByTeam]);

  const check: CorrectionsCheck = validateCorrections(drafts, current);
  return {
    drafts, current, state, add, full: drafts.length >= MAX_CORRECTIONS,
    change: (key: string, patch: Partial<CorrectionDraft>) => setDrafts((d) => d.map((x) => (x.key === key ? { ...x, ...patch } : x))),
    remove: (key: string) => setDrafts((d) => d.filter((x) => x.key !== key)),
    errors: shown ? check.byKey : ({} as CorrectionsCheck["byKey"]), general: shown ? check.general : "",
    /** Validates (and shows the problems). Returns the payload, or null when something is wrong. */
    submit: (): Record<string, unknown>[] | null => { setShown(true); return check.ok ? correctionPayload(drafts) : null; },
  };
}
