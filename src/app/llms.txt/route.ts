import { GUIDES } from "@/content/guides";
import { TOOLS } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * /llms.txt: a plain-text map of the site for AI assistants and search crawlers (the llmstxt.org convention).
 * It lists every free tool and every guide that is live today, so a guide released by the daily schedule appears here
 * the same day, with no one editing a file. Only what exists is listed.
 */
export function GET() {
  const guides = GUIDES.map((g) => `- [${g.title}](${SITE_URL}/guides/${g.slug}/): ${g.description}`).join("\n");
  const tools = TOOLS.map((t) => `- [${t.name}](${SITE_URL}${t.href}): ${t.blurb}`).join("\n");
  const md = `# Esports Hub

> Free tools and plain-English guides for people who organise tournaments: brackets, points tables, round robin fixtures, schedules, registration forms, ID cards, certificates, posters and a gate check-in scanner. The tools run in the browser and need no account. Built in India for esports, cricket, football, chess and other tournaments. Run by Yaseen Khatib (https://yk.streamerosai.com).

## What it does

- Draws brackets (single and double elimination), round robin and group-stage fixtures, and ranks points tables for battle royale lobbies.
- Makes tournament posters, ID cards, certificates and printable kits, and builds registration forms.
- Scans players in at the gate with QR codes, and shows live standings on a TV or in OBS.
- Guides explain formats, scoring, rules and running an event. New guides are published three times a week (Monday, Wednesday, Friday).

## Free tools

${tools}

## Guides (${GUIDES.length} live)

${guides}

## More

- [All guides](${SITE_URL}/guides/)
- [All tools](${SITE_URL}/tools/)
- [Sitemap](${SITE_URL}/sitemap.xml)
- [About](${SITE_URL}/about/)
- [Contact](${SITE_URL}/contact/)
`;
  return new Response(md, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
