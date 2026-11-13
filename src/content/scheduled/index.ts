import type { Guide } from "../guides";
import { mdToBlocks } from "./md";
import { releaseDate, today } from "./schedule";
import type { Draft } from "./types";
import { BATCH_01 } from "./batch-01";
import { BATCH_02 } from "./batch-02";
import { BATCH_03 } from "./batch-03";

/** Every scheduled guide, in release order. The order of this list IS the release schedule. */
export const DRAFTS: Draft[] = [...BATCH_01, ...BATCH_02, ...BATCH_03];

const wordsOf = (d: Draft) => [d.intro, d.answer, ...d.sections.flatMap((s) => [s.h2, s.md]), ...d.faq.flatMap((f) => [f.q, f.a])].join(" ").split(/\s+/).length;

export function toGuide(d: Draft, index: number): Guide {
  const date = releaseDate(index);
  return {
    slug: d.slug,
    title: d.title,
    seoTitle: d.seoTitle,
    description: d.description,
    tag: d.tag,
    minutes: Math.min(15, Math.max(4, Math.round(wordsOf(d) / 200))),
    published: date,
    updated: date,
    intro: d.intro,
    answer: d.answer,
    faq: d.faq,
    sections: d.sections.map((s) => ({ h2: s.h2, blocks: mdToBlocks(s.md) })),
    related: d.related,
    cta: d.cta,
  };
}

/** All scheduled guides with their release dates, including ones not live yet. Tests and the schedule doc read this. */
export const SCHEDULED: Guide[] = DRAFTS.map(toGuide);

/** Only the guides whose day has come. The site's daily deploy (00:17 UTC) turns the next one on. */
export const RELEASED: Guide[] = SCHEDULED.filter((g) => g.published <= today());
