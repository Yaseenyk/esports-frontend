"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, h2, h3, section } from "@/features/shared/ui/styles";
import type { CheckItem } from "@/features/tournaments/organiser/checklist";
import type { OrganiserTournament, OwnedEventRow } from "@/features/tournaments/organiser/domain";
import { markdownToPlain } from "@/features/tournaments/organiser/form";
import { nextStepText, STATUS_TONE, statusLabel, type TransitionOption } from "@/features/tournaments/organiser/state-machine";
import { formatName, gameName } from "@/features/tournaments/domain";

export const TournamentStatusBadge = ({ status }: { status: string }) => <StatusBadge label={statusLabel(status)} tone={STATUS_TONE[status] ?? "neutral"} />;

/** The thin-page guard as a checklist. Every line says Done or Missing in words; colour only supports it. */
export function PageChecklist({ items }: { items: readonly CheckItem[] }) {
  const missing = items.filter((i) => !i.ok).length;
  return (
    <section aria-labelledby="chk-h" className={`${section} space-y-3`}>
      <h2 id="chk-h" className={h2}>Search checklist</h2>
      <p className="max-w-3xl text-zinc-300">Your page will be indexed by search engines when all of these are true. Be realistic: few people search for one particular tournament, so this page is mainly for sharing the link. Search is a bonus.</p>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.key} className="text-sm">
            <span className={i.ok ? "text-success" : "text-warning"}><span aria-hidden="true">{i.ok ? "+ " : "- "}</span><span className="font-medium">{i.ok ? "Done" : "Missing"}:</span></span> <span className="text-zinc-100">{i.label}</span>
            {!i.ok && <span className="block pl-5 text-xs text-zinc-400">{i.hint}</span>}
          </li>
        ))}
      </ul>
      <p role="status" className="text-sm text-zinc-300">{missing === 0 ? "Every line is done. The server makes the final decision when you save, and at most 10 new pages a week are indexed across the whole site." : `${missing} of ${items.length} still missing. The page works for sharing either way.`}</p>
    </section>
  );
}

/** The public link and a copy button. A draft has no public page yet, so the link is only described. */
export function ShareBlock({ url, isPublic, copied, onCopy }: { url: string; isPublic: boolean; copied: "" | "ok" | "fail"; onCopy: (text: string) => void }) {
  return (
    <section aria-labelledby="share-h" className={`${section} space-y-3`}>
      <h2 id="share-h" className={h2}>Share</h2>
      {!isPublic ? <p className="text-zinc-300">The public link works after you publish the page. It will be:</p> : <p className="text-zinc-300">Send this link in your college or Discord group. The page is built by the next site build (the daily one, or when the site is rebuilt), so it can take a little while to appear after you publish.</p>}
      <p className="break-all rounded-lg border border-white/10 bg-surface p-3 font-mono text-sm text-zinc-100"><span className="sr-only">Public link: </span>{url}</p>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => onCopy(url)} className={btnSecondary}>Copy link</button>
        <span role="status" className="text-sm">{copied === "ok" && <span className="text-success"><span aria-hidden="true">+ </span>Link copied.</span>}{copied === "fail" && <span className="text-danger"><span aria-hidden="true">! </span>Could not copy. Select the link and copy it by hand.</span>}</span>
      </div>
    </section>
  );
}

/** Only the legal next moves, each with a reason when it is blocked right now. Cancelling asks first. */
export function TransitionPanel({ saved, options, busy, onMove }: { saved: OrganiserTournament; options: readonly TransitionOption[]; busy: string; onMove: (to: string) => void }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <section aria-labelledby="st-h" className={`${section} space-y-4`}>
      <h2 id="st-h" className={h2}>Status</h2>
      <p className="flex flex-wrap items-center gap-2 text-zinc-100"><TournamentStatusBadge status={saved.status} /><span className="text-zinc-300">{nextStepText(saved.status)}</span></p>
      {options.length === 0 ? <p className="text-zinc-300">There are no further moves.</p> : (
        <ul className="space-y-4">
          {options.map((o) => (
            <li key={o.to} className="space-y-1">
              {o.destructive && confirm ? (
                <div className="space-y-2" role="group" aria-label="Confirm cancelling">
                  <p className="text-sm text-zinc-100">Cancel this tournament? This is final: the page stops being public and nothing can be edited afterwards.</p>
                  <div className="flex flex-wrap gap-3"><button type="button" onClick={() => { setConfirm(false); onMove(o.to); }} disabled={!!busy} className={btnDanger}>Yes, cancel the tournament</button><button type="button" onClick={() => setConfirm(false)} className={btnSecondary}>Keep it</button></div>
                </div>
              ) : (
                <button type="button" onClick={() => (o.destructive ? setConfirm(true) : onMove(o.to))} disabled={o.blocked || !!busy} aria-describedby={`mv-${o.to}`} className={o.destructive ? btnDanger : btnSecondary}>{busy === `to-${o.to}` ? "Working" : o.label}</button>
              )}
              <p id={`mv-${o.to}`} className="text-xs text-zinc-400">{o.blocked ? <span className="text-warning"><span aria-hidden="true">! </span>{o.reason}</span> : o.help}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** What visitors will see: the description as plain text, line breaks kept. */
export function DescriptionPreview({ markdown }: { markdown: string }) {
  const plain = markdownToPlain(markdown);
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <h3 className="text-sm font-medium text-zinc-100">Plain-text preview</h3>
      {plain ? <p className="mt-2 max-w-3xl whitespace-pre-line text-sm text-zinc-300">{plain}</p> : <p className="mt-2 text-sm text-zinc-400">Nothing yet. What you write above appears here as visitors will read it.</p>}
      <p className="mt-2 text-xs text-zinc-400">The page shows plain text. Simple Markdown (# headings, **bold**, - lists, [links](https://example.com)) is turned into plain text when you save.</p>
    </div>
  );
}

export function OwnedEventCard({ row }: { row: OwnedEventRow }) {
  const t = row.tournament;
  const manage = `/app/tournaments/manage/?id=${encodeURIComponent(row.id)}`;
  return (
    <li className={`${box} space-y-2`}>
      <h3 className={h3}>{t ? t.title : row.name}</h3>
      <p className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
        {t ? <><TournamentStatusBadge status={t.status} /><span>{gameName(t.game)}{t.format ? ` · ${formatName(t.format)}` : ""}</span></> : <span>{[row.game, row.date].filter(Boolean).join(" · ") || "Saved event"}</span>}
        {row.role === "editor" && <span className="text-xs text-zinc-400">Shared with you (editor)</span>}
      </p>
      {t && <p className="text-xs text-zinc-400">Event: {row.name}</p>}
      {row.failed && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>Could not check this event. Try again in a moment.</p>}
      <p className="flex flex-wrap gap-3">
        {t ? <Link href={manage} className={btnSecondary}>Manage<span className="sr-only">: {t.title}</span></Link> : <Link href={manage} className={btnPrimary}>Create tournament<span className="sr-only"> for {row.name}</span></Link>}
      </p>
    </li>
  );
}
