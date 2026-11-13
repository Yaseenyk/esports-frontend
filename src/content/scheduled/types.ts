/**
 * A scheduled guide, written in a compact form (see md.ts) and turned into a normal Guide at build time.
 * The release date is NOT stored here: it comes from the post's position in the list (schedule.ts), so the three-a-week
 * cap cannot be broken by a typo. To move a post, move it in the list.
 */
export interface Draft {
  slug: string;
  title: string;
  /** Tab and search-result title, 56 characters or fewer. Defaults to the title. */
  seoTitle?: string;
  /** 100 to 165 characters. */
  description: string;
  tag: string;
  /** The direct answer in a box at the top: 120 to 420 characters. */
  answer: string;
  intro: string;
  /** `md` is paragraphs separated by blank lines, "- " bullets, "1. " steps, "> " a note, "### " a small heading, and | tables |. */
  sections: { h2: string; md: string }[];
  faq: { q: string; a: string }[];
  /** 2 to 4 slugs of guides released EARLIER than this one (or existing guides). */
  related: string[];
  cta: { label: string; href: string };
}
