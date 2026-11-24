"use client";

import Link from "next/link";
import { scoreSentence } from "@/features/community/domain";
import { useTrustSummary } from "@/features/community/hooks/useTrust";
import { h2, link, section } from "@/features/shared/ui/styles";

/** The organiser trust summary on a tournament page. Renders nothing until it has data, and nothing at all when the API answers 404. */
export default function TrustIsland({ slug }: { slug: string }) {
  const r = useTrustSummary(slug);
  if (r.phase !== "ready" || !r.data) return null;
  const d = r.data;
  return (
    <section className={section} aria-labelledby="trust-h" data-testid="trust-island">
      <h2 id="trust-h" className={h2}>Organiser trust</h2>
      <p className="mt-3 text-zinc-300">
        {d.score.average !== null && <span className="font-display text-2xl text-zinc-100 tabular-nums">{d.score.average.toFixed(1)}<span className="text-base text-zinc-300"> / 5 </span></span>}
        {scoreSentence(d.score)} Only players who took part can rate.
      </p>
      <p className="mt-2"><Link href={`/trust/?t=${encodeURIComponent(slug)}`} className={link}>Reviews and how the score is built</Link></p>
    </section>
  );
}
