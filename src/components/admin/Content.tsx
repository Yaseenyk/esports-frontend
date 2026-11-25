"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONTENT_KINDS, type ContentItem, type ContentKind, admin, anyReasonLabel } from "@/lib/admin/client";
import { ago } from "@/lib/admin/labels";
import { ConfirmPanel, Empty, Failed, H1, Loading, Success, say, useLoad } from "./ui";

export const KIND_LABEL: Record<ContentKind, string> = { scrims: "Scrims", lft: "LFT posts", directory: "Directory", calendar: "Calendar", ratings: "Ratings and reviews", results: "Results and recaps" };
const HIDE_COPY: Record<ContentKind, string> = {
  scrims: "The slot leaves the scrim board. The captain still sees it in their list.",
  lft: "The post leaves the Looking for team board.",
  directory: "The listing leaves the public directory and stays out even if the organiser edits it.",
  calendar: "The entry leaves the college calendar. The reason is kept in its moderation log.",
  ratings: "The review and its stars leave the organiser's trust score. Hide only the reply to keep the review.",
  results: "This hides the event's public pages: the tournament page, its results, and the recap link back to it.",
};

function Item({ x, reasons, onDone }: { x: ContentItem; reasons: string[]; onDone: (m: string) => void }) {
  const [ask, setAsk] = useState<{ hide: boolean; target?: "review" | "reply" } | null>(null);
  async function run(reason: string) {
    if (!ask) return;
    await admin.setContentHidden(x.kind, x.id, ask.hide, reason, ask.target);
    setAsk(null);
    onDone(ask.hide ? `Hidden: ${x.title}.` : `Public again: ${x.title}.`);
  }
  return (
    <li className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-white">{x.title}</h2>
          {x.meta.length > 0 && <p className="mt-0.5 text-sm text-zinc-300">{x.meta.join(" · ")}</p>}
          <p className="mt-0.5 text-xs text-zinc-400">{x.createdAt ? ago(x.createdAt) : ""}{x.status ? ` · ${x.status.replace(/_/g, " ")}` : ""}</p>
        </div>
        <span className="flex shrink-0 flex-col items-end gap-1">
          {x.hidden && <span className="tag !text-amber-200">Hidden</span>}
          {x.reports > 0 && <span className="tag">{x.reports} {x.reports === 1 ? "report" : "reports"}</span>}
        </span>
      </div>
      {x.body && <p className="mt-2 whitespace-pre-line break-words text-sm text-zinc-200">{x.body}</p>}
      {x.reply && <p className="mt-2 border-l-2 border-white/20 pl-3 text-sm text-zinc-300"><span className="text-zinc-400">Organiser reply{x.replyHidden ? " (hidden)" : ""}: </span>{x.reply}</p>}
      {x.hidden && x.hiddenReason && <p className="mt-2 text-xs text-zinc-400">Reason: {x.hiddenReason === "held_by_reports" ? "held after reports" : anyReasonLabel(x.hiddenReason)}</p>}
      {x.link && <p className="mt-2 text-sm"><Link href={x.link} target="_blank" rel="noopener noreferrer" className="text-cyan underline underline-offset-2">Open the public page (new tab)</Link></p>}
      {ask ? (
        <ConfirmPanel title={ask.hide ? (ask.target === "reply" ? "Hide the organiser's reply?" : "Hide this from the public?") : (ask.target === "reply" ? "Show the reply again?" : "Make this public again?")}
          confirmLabel={ask.hide ? "Hide it" : "Make public"} danger={ask.hide} reasons={reasons} onCancel={() => setAsk(null)} onConfirm={run}>
          <p>{ask.hide ? (ask.target === "reply" ? "Only the reply is hidden; the review stays." : HIDE_COPY[x.kind]) : "It is shown to the public again from the next request."} You can undo this later.</p>
        </ConfirmPanel>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {x.hidden ? <button type="button" className="btn-ghost" onClick={() => setAsk({ hide: false, target: x.kind === "ratings" ? "review" : undefined })}>Make public</button>
            : <button type="button" className="btn-ghost" onClick={() => setAsk({ hide: true, target: x.kind === "ratings" ? "review" : undefined })}>{x.kind === "ratings" ? "Hide review" : "Hide"}</button>}
          {x.kind === "ratings" && x.reply && (x.replyHidden
            ? <button type="button" className="btn-ghost" onClick={() => setAsk({ hide: false, target: "reply" })}>Show reply</button>
            : <button type="button" className="btn-ghost" onClick={() => setAsk({ hide: true, target: "reply" })}>Hide reply</button>)}
        </div>
      )}
    </li>
  );
}

/** The newest public content of every kind in one place, each with hide and restore and a reason. ?kind= and ?id= open one kind or one item. */
export default function Content() {
  const [kind, setKind] = useState<ContentKind>("scrims");
  const [onlyHidden, setOnlyHidden] = useState(false);
  const [one, setOne] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState("");
  const [more, setMore] = useState<ContentItem[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [moreErr, setMoreErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const k = p.get("kind");
    if (k && (CONTENT_KINDS as readonly string[]).includes(k)) setKind(k as ContentKind);
    const id = p.get("id");
    if (id && /^[A-Za-z0-9._~-]{1,64}$/.test(id)) setOne(id);
    setReady(true);
  }, []);
  const r = useLoad(async () => {
    if (!ready) return null;
    const p = await admin.content(kind, { state: onlyHidden ? "hidden" : "all", id: one });
    setMore([]); setNext(p.next); return p;
  }, [kind, onlyHidden, one, ready]);
  async function loadMore() {
    if (!next) return;
    setBusy(true); setMoreErr("");
    try { const p = await admin.content(kind, { state: onlyHidden ? "hidden" : "all", id: one, after: next }); setMore((m) => [...m, ...p.items]); setNext(p.next); } catch (e) { setMoreErr(say(e)); }
    setBusy(false);
  }
  const page = r.data ?? null;
  const rows = [...(page?.items ?? []), ...more];
  const choose = (k: ContentKind) => { setKind(k); setOne(undefined); setDone(""); history.replaceState(null, "", `/admin/content/?kind=${k}`); };
  return (
    <>
      <H1 sub="The newest posts, listings, reviews and results across the site. Hiding is never deletion: every action can be undone and is logged with its reason.">Content</H1>
      <div role="group" aria-label="Which content" className="mb-3 flex flex-wrap gap-2">
        {CONTENT_KINDS.map((k) => <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => choose(k)}>{KIND_LABEL[k]}</button>)}
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" className="chip" aria-pressed={onlyHidden} onClick={() => setOnlyHidden((v) => !v)}>Only hidden</button>
        {one && <button type="button" className="btn-ghost" onClick={() => { setOne(undefined); history.replaceState(null, "", `/admin/content/?kind=${kind}`); }}>Showing one item. Show all</button>}
      </div>
      {done && <div className="mb-4"><Success>{done}</Success></div>}
      {(r.status === "loading" || (r.status === "ready" && page === null)) && <Loading what={KIND_LABEL[kind].toLowerCase()} />}
      {r.status === "error" && <Failed error={r.error} onRetry={r.reload} />}
      {r.status === "ready" && page && (!page.available ? <Empty>This part of the site is not set up on the database yet.</Empty> : rows.length === 0 ? <Empty>{onlyHidden ? "Nothing of this kind is hidden." : "Nothing here yet."}</Empty> : (
        <>
          <ul className="space-y-3">{rows.map((x) => <Item key={`${x.kind}:${x.id}`} x={x} reasons={page.reasons} onDone={(m) => { setDone(m); r.reload(); }} />)}</ul>
          {moreErr && <p role="alert" className="mt-3 text-sm text-red-300">{moreErr}</p>}
          {next && <button type="button" disabled={busy} className="btn-ghost mt-4" onClick={loadMore}>{busy ? "Loading..." : "Show more"}</button>}
        </>
      ))}
    </>
  );
}
