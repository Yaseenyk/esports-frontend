import { readFile } from "node:fs/promises";
import path from "node:path";
import { PLACEHOLDER_SLUG, loadBuildTournaments, tournamentStaticParams } from "@/features/tournaments/services/build-data";
import { ogCard } from "@/features/tournaments/seo/og-card";
import { dateText, whereText } from "@/features/tournaments/ui/format";
import { gameName } from "@/features/tournaments/domain";

export const dynamic = "force-static";
export const dynamicParams = false;

export const generateStaticParams = tournamentStaticParams;

/** The Open Graph card, drawn at build time in the brand style: flat shapes on ink, cyan and violet only, no photos and no glow. */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const t = (await loadBuildTournaments()).find((x) => x.detail.slug === params.slug)?.detail;
  if (!t) return params.slug === PLACEHOLDER_SLUG ? new Response("", { headers: { "content-type": "image/png" } }) : new Response("Not found", { status: 404 });
  try {
    // Loaded here, not at the top, because next/og cannot start on Windows (it joins a file: URL with path.join). On Linux (CI) it works.
    const { ImageResponse } = await import("next/og");
    return new ImageResponse(ogCard({ title: t.title, game: gameName(t.game), when: dateText(t.startsAt), where: whereText(t.venue, t.city, t.state) }), { width: 1200, height: 630 });
  } catch (e) {
    if (process.env.CI) throw e; // in CI a missing card must fail the build, not hide
    return new Response(await readFile(path.join(process.cwd(), "public", "og.png")), { headers: { "content-type": "image/png" } });
  }
}
