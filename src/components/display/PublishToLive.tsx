"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Payload } from "@/lib/display";
import { events, explain, live, type CloudEvent } from "@/lib/api/cloud";
import { useSession } from "@/components/cloud/useSession";
import { mergeView, tooBig } from "@/lib/live";
import { toolCopy } from "@/lib/tool-copy";
import type { UiLang } from "@/lib/pt-br";

/**
 * Inside every tool's last step. Signed out: a link to sign in. Signed in: pick one of your events and send this tool's current view
 * (standings, bracket, schedule...) to that event's live page. The page's announcements, sponsors, ticker and other views are kept.
 */
export default function PublishToLive({ payload, what, lang = "en" }: { payload: Payload | null; what: string; lang?: UiLang }) {
  const c = toolCopy(lang).live;
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

  if (!session) return <p className="text-sm text-zinc-300">{c.signIn} <Link href="/login/" className="font-semibold text-cyan underline underline-offset-2">{c.signInLink}</Link></p>;
  if (list === null) return <p role="status" className="text-sm text-zinc-400">{c.loading}</p>;
  if (list.length === 0) return <div className="space-y-2 text-sm text-zinc-300">{done && <p role="alert" className="text-red-300">{done.text}</p>}<p>{c.noEvents} <Link href="/app/events/" className="font-semibold text-cyan underline underline-offset-2">{c.openEvents}</Link></p></div>;

  const publish = async () => {
    if (!payload || !eventId || busy) return;
    setBusy(true); setDone(null);
    try {
      const state = await live.get(eventId);
      const snapshot = mergeView(state.snapshot, payload);
      if (tooBig(snapshot)) { setDone({ ok: false, text: c.tooBig }); return; }
      const res = await live.put(eventId, state.published ? { snapshot, published: true } : { snapshot });
      setDone(res.published ? { ok: true, text: c.published(what) } : { ok: true, unpublished: true, text: c.savedNotPublished });
    } catch (e) { setDone({ ok: false, text: explain(e) }); } finally { setBusy(false); }
  };

  return (
    <div role="group" aria-label={c.group} className="space-y-2 rounded-xl border border-white/10 bg-[#0a0b0d] p-4">
      <p className="text-sm font-semibold text-white">{c.title}</p>
      <p className="text-xs leading-5 text-zinc-400">{c.body(what)}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-zinc-200 sm:flex-none"><span className="shrink-0">{c.event}</span>
          <select value={eventId} onChange={(e) => { setEventId(e.target.value); setDone(null); }} className="min-h-11 min-w-0 max-w-full flex-1 rounded-lg border border-zinc-700 bg-[#0a0b0d] px-3 text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan">{list.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
        </label>
        <button type="button" className="btn px-5" disabled={!payload || busy || !eventId} onClick={publish}>{busy ? c.publishing : c.publish(what)}</button>
      </div>
      <p role="status" aria-live="polite" className={`min-h-5 text-sm ${done?.ok ? "text-emerald-300" : "text-red-300"}`}>{done?.text}{done?.unpublished && <> <Link href={`/app/events/?id=${encodeURIComponent(eventId)}`} className="font-semibold text-cyan underline underline-offset-2">{c.publishPage}</Link></>}</p>
    </div>
  );
}
