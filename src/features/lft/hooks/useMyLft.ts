"use client";

import { useCallback, useState } from "react";
import { blockFromRequest, bumpListing, closeListing, fetchBlocks, fetchInbox, fetchMine, fetchSent, reportRequest, respond, unblock, withdraw } from "@/features/lft/services/lft.api";
import type { InboxApplication, MyListing, SentApplication } from "@/features/lft/domain";
import { useResource } from "@/features/shared/hooks/useResource";
import { explainFailure, type V3Result } from "@/features/shared/failure";

/** My listings, the applications I sent, and the actions on both. Every action refreshes the list and reports in plain words. */
export function useMyLft() {
  const listings = useResource<MyListing[]>(fetchMine, []);
  const sent = useResource<SentApplication[]>(fetchSent, []);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const act = useCallback(async (id: string, label: string, run: () => Promise<V3Result<unknown>>) => {
    setBusyId(id); setError(""); setNotice("");
    const r = await run();
    setBusyId("");
    if (r.ok) { setNotice(label); listings.reload(); sent.reload(); } else setError(explainFailure(r.failure));
    return r.ok;
  }, [listings, sent]);

  return {
    listings, sent, notice, error, busyId,
    bump: (id: string) => act(id, "Bumped to the top of the board.", () => bumpListing(id)),
    close: (id: string, status: "closed" | "filled") => act(id, status === "filled" ? "Marked as filled." : "Listing closed.", () => closeListing(id, status)),
    withdraw: (id: string) => act(id, "Application withdrawn.", () => withdraw(id)),
    blockPoster: (id: string) => act(id, "Blocked. Your open requests to them were withdrawn, and you will not see requests from each other.", () => blockFromRequest(id)),
  };
}

/** The applications inbox of one of my listings, with accept and decline. */
export function useInbox(listingId: string, onChanged: () => void) {
  const inbox = useResource<InboxApplication[]>(() => fetchInbox(listingId), [listingId]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const block = async (id: string) => {
    setBusyId(id); setError("");
    const r = await blockFromRequest(id);
    setBusyId("");
    if (r.ok) { inbox.reload(); onChanged(); } else setError(explainFailure(r.failure));
  };
  const report = async (id: string, reason: string, note: string) => {
    const r = await reportRequest(id, reason, note);
    return r.ok ? "" : explainFailure(r.failure);
  };
  const decide = async (id: string, decision: "accept" | "decline") => {
    setBusyId(id); setError("");
    const r = await respond(id, decision);
    setBusyId("");
    if (r.ok) { inbox.reload(); onChanged(); } else setError(explainFailure(r.failure));
  };
  return { inbox, decide, block, report, error, busyId };
}

/** The people I blocked on the board, with unblock. */
export function useLftBlocks() {
  const list = useResource(fetchBlocks, []);
  const [error, setError] = useState("");
  const remove = async (id: string) => { const r = await unblock(id); if (r.ok) list.reload(); else setError(explainFailure(r.failure)); };
  return { list, remove, error };
}
