"use client";

import { useCallback, useEffect, useState } from "react";
import type { MyTrust, TrustSummary } from "@/features/community/domain";
import { deleteRating, fetchMyTrust, fetchTrust, replyTo, reportReview, submitRating, type RatingBody } from "@/features/community/services/community.api";
import { explainFailure, type V3Failure } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import { confirmAdult } from "@/features/shared/services/account.api";

const WORDS: Record<string, string> = {
  own_event: "You run this event, so you cannot rate it.",
  window_not_yet: "Ratings open when the event ends.",
  window_closed: "Ratings for this event have closed.",
  window_no_dates: "This event has no dates, so it cannot be rated.",
  invalid_proof: "Paste the full link you were given for this event.",
  proof_not_found: "That link does not belong to this event.",
  not_checked_in: "That pass was never scanned in at the event, so it cannot be used to rate.",
  minor_roster: "That roster entry is marked under 18, so it cannot be used to rate.",
  team_not_played: "That team has no approved registration with a verified result in this event.",
  already_rated: "You have already rated this event.",
  proof_used: "That pass or team has already been used to rate this event.",
  name_anonymous: "Use the name people know you by. Reviews are never anonymous.",
  invalid_review: "A written review must be 10 to 1000 characters of plain text, or left empty.",
  invalid_displayName: "Your name must be 2 to 40 characters.",
  already_replied: "You have already replied to this review.",
  review_hidden: "This review is hidden by a moderator.",
  nothing_to_reply: "Only written reviews can be answered.",
  already_reported: "You have already reported this.",
  own_review: "You cannot report your own review.",
};
export const sayTrust = (f: V3Failure): string => (f.code && WORDS[f.code]) || explainFailure(f);

/** The public summary for one tournament's organiser (404 = the feature is off or the tournament is not public). */
export function useTrustSummary(slug: string) {
  return useResource(() => fetchTrust(slug), [slug]);
}

/** Everything the trust page needs: the public summary, what this visitor may do, and the actions. */
export function useTrust(slug: string) {
  const summary = useResource(() => fetchTrust(slug, true), [slug]);
  const [me, setMe] = useState<MyTrust | null>(null);
  const [signedOut, setSignedOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadMe = useCallback(async () => {
    const r = await fetchMyTrust(slug);
    if (r.ok) { setMe(r.data); setSignedOut(false); } else if (r.failure.kind === "unauthorized") setSignedOut(true);
  }, [slug]);
  useEffect(() => { if (slug) void loadMe(); }, [slug, loadMe]);

  const act = useCallback(async (work: () => Promise<{ ok: true } | { ok: false; failure: V3Failure }>, done: string) => {
    setBusy(true); setError(""); setNotice("");
    const r = await work();
    setBusy(false);
    if (!r.ok) { setError(sayTrust(r.failure)); return false; }
    setNotice(done);
    summary.reload();
    await loadMe();
    return true;
  }, [summary, loadMe]);

  return {
    summary, me, signedOut, busy, error, notice,
    confirmAdult: () => act(async () => { const r = await confirmAdult(); return r.ok ? { ok: true } : r; }, "Thanks. You can rate now."),
    rate: (body: RatingBody) => act(async () => { const r = await submitRating(slug, body); return r.ok ? { ok: true } : r; }, "Thanks. Your rating is published."),
    removeMine: (id: string) => act(async () => { const r = await deleteRating(id); return r.ok ? { ok: true } : r; }, "Your rating was deleted."),
    reply: (id: string, text: string) => act(async () => { const r = await replyTo(id, text); return r.ok ? { ok: true } : r; }, "Your reply is published."),
    report: (id: string, target: "review" | "reply", reason: string, note: string) => act(async () => { const r = await reportReview(id, target, reason, note); return r.ok ? { ok: true } : r; }, "Thanks. A moderator will look at it. Nothing is hidden until they decide."),
  };
}
