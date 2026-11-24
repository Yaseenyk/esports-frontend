import { SEARCH_INDEX } from "@/lib/search-index";

export const dynamic = "force-static";

/** /search-index.json: what the search box searches, as a static file loaded on first use (so no page ships it in its JavaScript). */
export function GET() {
  return new Response(JSON.stringify(SEARCH_INDEX), { headers: { "content-type": "application/json; charset=utf-8" } });
}
