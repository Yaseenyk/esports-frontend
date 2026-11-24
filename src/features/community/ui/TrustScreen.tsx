"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { windowSentence } from "@/features/community/domain";
import { useTrust } from "@/features/community/hooks/useTrust";
import { RatingForm } from "@/features/community/ui/RatingForm";
import { HowItWorks, ReviewItem, ScoreBlock } from "@/features/community/ui/TrustParts";
import { explainFailure } from "@/features/shared/failure";
import { AdultGate, ErrorState, NotAvailable, SkeletonRows } from "@/features/shared/ui/States";
import { box, btnDanger, btnPrimary, btnSecondary, h1, h2, link, section } from "@/features/shared/ui/styles";

const SEE_TOURNAMENTS = <Link href="/tournaments/" className={btnSecondary}>See tournaments</Link>;

function Body({ slug }: { slug: string }) {
  const t = useTrust(slug);
  const s = t.summary;
  if (s.phase === "unavailable") return <NotAvailable what="Organiser ratings" asPage action={SEE_TOURNAMENTS} />;
  if (s.phase === "loading") return s.showSkeleton ? <SkeletonRows n={3} label="Loading ratings" /> : null;
  if (s.phase === "error") return <ErrorState message={explainFailure(s.failure)} onRetry={s.reload} />;
  if (s.phase !== "ready" || !s.data) return <NotAvailable what="Organiser ratings" asPage action={SEE_TOURNAMENTS} />;
  const d = s.data;
  const me = t.me;
  const canRate = me && !me.isOrganiser && !me.myRating && d.window.state === "open";
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className={h1}>{d.organiser.name ?? "Organiser"}: trust score</h1>
        <p className="text-zinc-300">
          Organiser of <Link href={`/tournaments/${d.tournament.slug}/`} className={link}>{d.tournament.title}</Link>
          {d.organiser.verified && <span className="text-success"> · Verified organisation</span>}
        </p>
      </header>
      <ScoreBlock s={d.score} />
      {t.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{t.error}</p>}
      {t.notice && <p role="status" className="text-sm text-success">{t.notice}</p>}
      <section className={section} aria-labelledby="your-h">
        <h2 id="your-h" className={h2}>Your rating</h2>
        <p className="mt-2 text-zinc-300">{windowSentence(d.window)}</p>
        {t.signedOut && <p className="mt-3"><Link href={`/login/?next=${encodeURIComponent(`/trust/?t=${slug}`)}`} className={btnPrimary}>Sign in to rate</Link></p>}
        {me?.isOrganiser && <p className="mt-3 text-zinc-300">You run this event, so you cannot rate it. You can reply once to each written review below.</p>}
        {me?.myRating && (
          <div className={`${box} mt-3`}>
            <p className="text-zinc-100">You rated this event {me.myRating.stars} of 5 as {me.myRating.displayName}.</p>
            {me.myRating.hidden && <p className="mt-1 text-sm text-danger">A moderator hid this rating (reason: {me.myRating.hiddenReason ?? "not stated"}). It does not count towards the score.</p>}
            <button type="button" disabled={t.busy} onClick={() => void t.removeMine(me.myRating!.id)} className={`${btnDanger} mt-3`}>Delete my rating</button>
          </div>
        )}
        {canRate && !me.adultConfirmed && <div className="mt-3"><AdultGate busy={t.busy} error="" onConfirm={() => void t.confirmAdult()} /></div>}
        {canRate && me.adultConfirmed && <div className="mt-3"><RatingForm suggestedName={me.suggestedName} busy={t.busy} onSubmit={t.rate} /></div>}
      </section>
      <section className={section} aria-labelledby="reviews-h">
        <h2 id="reviews-h" className={h2}>Reviews from players who took part</h2>
        {d.reviews.length === 0 ? <p className="mt-2 text-zinc-300">No written reviews yet.</p> : (
          <ul className="mt-2">
            {d.reviews.map((r) => (
              <ReviewItem key={r.id} r={r} busy={t.busy} canReply={me?.canReply === true} canReport={!!me && me.adultConfirmed}
                onReply={(text) => t.reply(r.id, text)} onReport={(target, reason, note) => t.report(r.id, target, reason, note)} />
            ))}
          </ul>
        )}
      </section>
      <HowItWorks minimum={d.score.minimum} days={d.window.days} />
    </div>
  );
}

/** /trust/?t=<tournament slug>: the organiser trust score for a public tournament's organiser. */
export default function TrustScreen() {
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => { const v = new URLSearchParams(window.location.search).get("t") ?? ""; setSlug(/^[a-z0-9-]{1,80}$/.test(v) ? v : ""); }, []);
  if (slug === null) return null;
  if (!slug) return <NotAvailable what="This organiser page" asPage action={SEE_TOURNAMENTS} />;
  return <Body slug={slug} />;
}
