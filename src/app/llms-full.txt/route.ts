import { llmsFullTxt } from "@/lib/llms";

export const dynamic = "force-static";

/** /llms-full.txt: the full text of every tool page and live guide in one file, generated at build from the page data (src/lib/llms.ts). */
export function GET() {
  return new Response(llmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
