import { llmsTxt } from "@/lib/llms";

export const dynamic = "force-static";

/**
 * /llms.txt: a plain-text map of the site for AI assistants and search crawlers (the llmstxt.org convention).
 * Built from the same data as the pages (src/lib/llms.ts): the fact block, tools for organisers and for players, game pages,
 * comparisons, the Portuguese pages and every live guide. A guide released by the daily schedule appears here the same day.
 */
export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
