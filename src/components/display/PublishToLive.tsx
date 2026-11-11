"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Payload } from "@/lib/display";
import { events, explain, live, type CloudEvent } from "@/lib/api/cloud";
import { useSession } from "@/components/cloud/useSession";
import { mergeView, tooBig } from "@/lib/live";

/**
 * Inside every tool's last step. Signed out: a link to sign in. Signed in: pick one of your events and send this tool's current view
 * (standings, bracket, schedule...) to that event's live page. The page's announcements, sponsors, ticker and other views are kept.
 */
export default function PublishToLive({ payload, what }: { payload: Payload | null; what: string }) {
  const session = useSession();
  const [list, setList] = useState<CloudEvent[] | null>(null);
  const [eventId, setEventId] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ ok: boolean; text: string; unpublished?: boolean } | null>(null);

  const uid = session?.user.id ?? null;
  useEffect(() => {
    if (!uid) { setList(null); return; }
    let alive = true;
    events.list().then((l) => { if (!alive) return; const mine = l.filter((e) => e.role !== "viewer"); setList(mine); setEventId((cur) => cur || mine[0]?.id || ""); }).catch((e) => { if (alive) { setList([]); setDone({ ok: false, text: explain(e) }); } });
    return () => { alive = false; };
  }, [uid]);

  if (!session) return <p className="text-sm text-zinc-300">Sign in to publish this on your event&apos;s live page. <Link href="/login/" className="font-semibold text-cyan underline underline-offset-2">Sign in</Link></p>;
  if (list === null) return <p role="status" className="text-sm text-zinc-400">Loading your events…</p>;
  if (list.length === 0) return <div className="space-y-2 text-sm text-zinc-300">{done && <p role="alert" className="text-red-300">{done.text}</p>}<p>You have no event to publish to yet. <Link href="/app/events/" className="font-semibold text-cyan underline underline-offset-2">Open your events</Link></p></div>;

  const publish = async () => {
    if (!payload || !eventId || busy) return;
    setBusy(true); setDone(null);
    try {
      const state = await live.get(eventId);
      const snapshot = mergeView(state.snapshot, payload);
      if (tooBig(snapshot)) { setDone({ ok: false, text: "The live page would be too large. Remove a sponsor logo or an old view on the event page, then try again." }); return; }
      const res = await live.put(eventId, state.published ? { snapshot, published: true } : { snapshot });
      setDone(res.published ? { ok: true, text: `Published. The ${what} is now on the live page.` } : { ok: true, unpublished: true, text: `Saved to the live page, but the page is not published yet, so nobody can see it.` });
    } catch (e) { setDone({ ok: false, text: explain(e) }); } finally { setBusy(false); }
  };

  return (
    <div role="group" aria-label="Publish on the live page" className="space-y-2 rounded-xl border border-white/10 bg-[#0a0b0d] p-4">
      <p className="text-sm font-semibold text-white">Put it on your event&apos;s live page</p>
      <p className="text-xs leading-5 text-zinc-400">Players and visitors see this {what} on one link, and it updates when you publish again.</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-zinc-200 sm:flex-none"><span className="shrink-0">Event</span>
          <select value={eventId} onChange={(e) => { setEventId(e.target.value); setDone(null); }} className="min-h-11 min-w-0 max-w-full flex-1 rounded-lg border border-zinc-700 bg-[#0a0b0d] px-3 text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan">{list.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
        </label>
        <button type="button" className="btn px-5" disabled={!payload || busy || !eventId} onClick={publish}>{busy ? "Publishing…" : `Publish this ${what}`}</button>
      </div>
      <p role="status" aria-live="polite" className={`min-h-5 text-sm ${done?.ok ? "text-emerald-300" : "text-red-300"}`}>{done?.text}{done?.unpublished && <> <Link href={`/app/events/?id=${encodeURIComponent(eventId)}`} className="font-semibold text-cyan underline underline-offset-2">Publish the page</Link></>}</p>
    </div>
  );
}
