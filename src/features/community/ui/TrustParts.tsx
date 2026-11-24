"use client";

import Link from "next/link";
import { useState } from "react";
import { scoreSentence, TRUST_REPORT_REASONS, verifiedLabel, type PublicReview, type TrustScore } from "@/features/community/domain";
import { SelectInput, TextArea, TextInput } from "@/features/shared/ui/Fields";
import { StatusBadge } from "@/features/shared/ui/States";
import { box, btnPrimary, btnSecondary, focus, h2, h3, link, section } from "@/features/shared/ui/styles";

const ASPECTS: [keyof NonNullable<TrustScore["aspects"]>, string][] = [["onTime", "Kept to the schedule"], ["fair", "Fair rules and results"], ["communication", "Clear communication"]];

/** The score: the number only from the minimum count, always with the count; the breakdown as plain tables (no bars, nothing to misread). */
export function ScoreBlock({ s }: { s: TrustScore }) {
  return (
    <section className={box} aria-labelledby="score-h">
      <h2 id="score-h" className={h2}>Organiser trust score</h2>
      {s.average !== null ? (
        <p className="mt-3"><span className="font-display text-4xl text-zinc-100 tabular-nums">{s.average.toFixed(1)}</span><span className="text-zinc-300"> out of 5</span></p>
      ) : null}
      <p className="mt-2 text-zinc-300">{scoreSentence(s)}</p>
      {s.aspects && s.distribution && (
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <table className="w-full text-left text-sm">
            <caption className="mb-2 text-left text-xs text-zinc-400">Average by question</caption>
            <tbody>{ASPECTS.map(([k, label]) => <tr key={k} className="border-t border-white/10"><th scope="row" className="py-2 font-normal text-zinc-300">{label}</th><td className="py-2 text-right font-mono tabular-nums text-zinc-100">{s.aspects![k].toFixed(1)}</td></tr>)}</tbody>
          </table>
          <table className="w-full text-left text-sm">
            <caption className="mb-2 text-left text-xs text-zinc-400">How many players gave each overall rating</caption>
            <tbody>{([5, 4, 3, 2, 1] as const).map((n) => <tr key={n} className="border-t border-white/10"><th scope="row" className="py-2 font-normal text-zinc-300">{n} {n === 1 ? "star" : "stars"}</th><td className="py-2 text-right font-mono tabular-nums text-zinc-100">{s.distribution![n]}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** How the score is built, in plain words. Shown on every trust page. */
export function HowItWorks({ minimum, days }: { minimum: number; days: number }) {
  return (
    <section className={section} aria-labelledby="how-trust-h">
      <h2 id="how-trust-h" className={h2}>How this score is built</h2>
      <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 text-zinc-300">
        <li>Only players who took part can rate: someone whose pass was scanned in at the event, or the captain of a team that played and has a verified result.</li>
        <li>One rating per player per event, and each pass or team counts once. Ratings open when the event ends and close {days} days later.</li>
        <li>The score is a plain average of the overall ratings across all of this organiser&apos;s events, with one decimal. Nothing is weighted, bought or edited.</li>
        <li>No score is shown until {minimum} players have rated, so a handful of ratings cannot be traced back to one person.</li>
        <li>Written reviews show the name the player chose and are tied to their account. Anonymous reviews are not accepted.</li>
        <li>The organiser can reply once to each review. Anyone signed in can report a review or a reply; a moderator decides, and a hidden review no longer counts towards the score.</li>
        <li>Nobody is paid, rewarded or asked to leave a good rating.</li>
      </ul>
    </section>
  );
}

function Stars({ n }: { n: number }) {
  return <span className="font-mono text-sm tabular-nums text-cyan-400">{n} / 5<span className="sr-only"> stars</span></span>;
}

function ReportForm({ idBase, busy, onSend, onClose }: { idBase: string; busy: boolean; onSend: (reason: string, note: string) => Promise<boolean>; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  return (
    <form className="mt-3 space-y-3" onSubmit={async (e) => { e.preventDefault(); if (reason && (await onSend(reason, note))) onClose(); }}>
      <SelectInput id={`rr-${idBase}`} label="What is wrong?" value={reason} onChange={setReason} options={TRUST_REPORT_REASONS} blank="Choose a reason" />
      <TextInput id={`rn-${idBase}`} label="Anything a moderator should know (optional)" value={note} onChange={setNote} maxLength={200} />
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy || !reason} className={btnSecondary}>Send report</button>
        <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
      </div>
    </form>
  );
}

export function ReviewItem({ r, canReply, canReport, busy, onReply, onReport }: {
  r: PublicReview; canReply: boolean; canReport: boolean; busy: boolean;
  onReply: (text: string) => Promise<boolean>; onReport: (target: "review" | "reply", reason: string, note: string) => Promise<boolean>;
}) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [reporting, setReporting] = useState<"review" | "reply" | null>(null);
  return (
    <li className="border-t border-white/10 py-4">
      <p className="flex flex-wrap items-center gap-2">
        <span className={`${h3}`}>{r.displayName}</span>
        <StatusBadge label={verifiedLabel(r.verifiedAs)} tone="success" />
        {r.stars !== null && <Stars n={r.stars} />}
      </p>
      <p className="mt-1 text-xs text-zinc-400">{r.createdAt ? r.createdAt.slice(0, 10) : ""}{r.tournament ? <> · <Link href={`/tournaments/${r.tournament.slug}/`} className={link}>{r.tournament.title ?? r.tournament.slug}</Link></> : null}</p>
      {r.review && <p className="mt-2 whitespace-pre-line text-zinc-100">{r.review}</p>}
      {r.reply && (
        <div className="mt-3 border-l-2 border-white/10 pl-3">
          <p className="text-xs font-medium text-zinc-300">Reply from the organiser</p>
          <p className="mt-1 whitespace-pre-line text-zinc-100">{r.reply.text}</p>
          {canReport && <button type="button" onClick={() => setReporting("reply")} className={`mt-2 min-h-11 text-sm text-zinc-400 underline underline-offset-2 ${focus}`}>Report this reply</button>}
        </div>
      )}
      {r.replyHidden && <p className="mt-2 text-xs text-zinc-400">The organiser&apos;s reply was hidden by a moderator.</p>}
      <div className="mt-2 flex flex-wrap gap-4">
        {canReply && !r.reply && !r.replyHidden && !replying && <button type="button" onClick={() => setReplying(true)} className={btnSecondary}>Reply publicly</button>}
        {canReport && <button type="button" onClick={() => setReporting("review")} className={`min-h-11 text-sm text-zinc-400 underline underline-offset-2 ${focus}`}>Report this review</button>}
      </div>
      {replying && (
        <form className="mt-3 space-y-3" onSubmit={async (e) => { e.preventDefault(); if (await onReply(text)) setReplying(false); }}>
          <TextArea id={`reply-${r.id}`} label="Your public reply" value={text} onChange={setText} rows={3} max={1000} help="You can reply once. Keep it about the event; replies can be reported too." />
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy || text.trim().length < 2} className={btnPrimary}>Publish reply</button>
            <button type="button" onClick={() => setReplying(false)} className={btnSecondary}>Cancel</button>
          </div>
        </form>
      )}
      {reporting && <ReportForm idBase={`${r.id}-${reporting}`} busy={busy} onSend={(reason, note) => onReport(reporting, reason, note)} onClose={() => setReporting(null)} />}
    </li>
  );
}
