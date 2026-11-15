import type { Guide } from "../guides";
import { mdToBlocks } from "./md";
import { LIVE_NOW_DATE, releaseDate, today } from "./schedule";
import type { Draft } from "./types";
import { BATCH_01 } from "./batch-01";
import { BATCH_02 } from "./batch-02";
import { BATCH_03 } from "./batch-03";
import { BATCH_04 } from "./batch-04";
import { BATCH_05 } from "./batch-05";
import { BATCH_06 } from "./batch-06";
import { BATCH_07 } from "./batch-07";
import { BATCH_08 } from "./batch-08";
import { BATCH_09 } from "./batch-09";
import { BATCH_10 } from "./batch-10";
import { BATCH_11 } from "./batch-11";
import { BATCH_12 } from "./batch-12";
import { LIVE_NOW_DRAFTS } from "./live-now";

/** Every scheduled guide, in release order. The order of this list IS the release schedule. */
/**
 * Order: post 1 (already released on Monday 16 Nov 2026), then the 20 demand-led guides of batches 11 and 12 (added 16 Nov 2026, from the
 * treg volume check in docs/seo-research-2026-11-16-blogs.md), then the original posts 2 to 100, which moved back by 20 slots.
 */
export const DRAFTS: Draft[] = [BATCH_01[0], ...BATCH_11, ...BATCH_12, ...BATCH_01.slice(1), ...BATCH_02, ...BATCH_03, ...BATCH_04, ...BATCH_05, ...BATCH_06, ...BATCH_07, ...BATCH_08, ...BATCH_09, ...BATCH_10];

const wordsOf = (d: Draft) => [d.intro, d.answer, ...d.sections.flatMap((s) => [s.h2, s.md]), ...d.faq.flatMap((f) => [f.q, f.a])].join(" ").split(/\s+/).length;

export function toGuideOn(d: Draft, date: string): Guide {
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

export const toGuide = (d: Draft, index: number): Guide => toGuideOn(d, releaseDate(index));

/** Ten guides published immediately (not part of the weekly schedule). Always live. */
export const LIVE_NOW: Guide[] = LIVE_NOW_DRAFTS.map((d) => toGuideOn(d, LIVE_NOW_DATE));

/** All scheduled guides with their release dates, including ones not live yet. Tests and the schedule doc read this. */
export const SCHEDULED: Guide[] = DRAFTS.map(toGuide);

/** Only the guides whose day has come. The site's daily deploy (00:17 UTC) turns the next one on. */
export const RELEASED: Guide[] = SCHEDULED.filter((g) => g.published <= today());
