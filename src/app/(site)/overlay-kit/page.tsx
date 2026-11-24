import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";
import { KIT_GUIDE_PATH, KIT_PATH } from "@/features/overlay-kit/flag";
import OverlayKitPanel from "@/features/overlay-kit/ui/OverlayKitPanel";
import StreamerOsCard from "@/features/overlay-kit/ui/StreamerOsCard";

// Behind the overlay kit flag (src/features/overlay-kit/flag.ts): with the flag off, scripts/prune-v3.mjs deletes this page from ./out.
const title = "Free OBS overlay kit for esports points tables";
const description = "Live points table, top fraggers and team cards as transparent OBS browser sources, fed from our free points table tools in your own browser.";

export const metadata: Metadata = {
  title, description, alternates: { canonical: KIT_PATH },
  openGraph: { title, description, url: KIT_PATH, images: ["/og.png"] }, twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

const link = "text-cyan-400 underline underline-offset-2";

export default function Page() {
  return (
    <article className="mx-auto max-w-5xl space-y-10">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: "OBS overlay kit", item: `${SITE_URL}${KIT_PATH}` }] }} />
      <header className="max-w-3xl space-y-4">
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/" className="hover:text-zinc-100">Home</Link> / OBS overlay kit</nav>
        <h1 className="font-display text-3xl text-zinc-100 sm:text-4xl">OBS overlay kit for esports points tables</h1>
        <p className="text-base leading-7 text-zinc-300">
          Three overlays for your tournament stream: a live points table, the top fraggers and team cards. Each one is a web page you add to
          OBS as a Browser Source. The page has a transparent background, is drawn for a 1920 by 1080 canvas and keeps its text inside a
          safe margin. The numbers come from our points table tools for Free Fire, BGMI, COD Mobile and Valorant leagues, using the same
          ranking and tie-breakers as the tool, so the stream never shows a different order from the sheet you announce.
        </p>
        <p className="text-base leading-7 text-zinc-300">
          No account, no upload and no server: the tool and the overlay talk to each other inside one browser on your streaming PC. New to
          browser sources? Read the <Link href={KIT_GUIDE_PATH} className={link}>OBS setup guide</Link> first; it takes about five minutes.
        </p>
      </header>

      <OverlayKitPanel />

      <section aria-labelledby="kit-how" className="max-w-3xl space-y-3 border-t border-white/10 pt-6">
        <h2 id="kit-how" className="font-display text-2xl text-zinc-100">How the data reaches OBS</h2>
        <p className="leading-7 text-zinc-300">
          When you switch on &ldquo;Send to the OBS overlay&rdquo; under a points table, the tool saves the current standings in this
          browser and announces every change on a local channel. An overlay page open in the same browser picks the change up at once. OBS
          has its own built-in browser, which does not share saved data with Chrome or Edge, so the guide shows two ways to connect them: open
          the tool in an OBS dock, or paste a link that carries a snapshot of the table and copy it again after each match.
        </p>
        <p className="leading-7 text-zinc-300">
          The overlay settings (design, margin, text size, rows) sit after the # sign in the link. That part of an address is never sent to
          any server, and the link holds no keys or passwords.
        </p>
      </section>

      <section aria-labelledby="kit-not" className="max-w-3xl space-y-4 border-t border-white/10 pt-6">
        <h2 id="kit-not" className="font-display text-2xl text-zinc-100">What this kit does not do</h2>
        <p className="leading-7 text-zinc-300">
          It shows the standings you enter; it does not read match results from any game, and it does not record or clip your stream.
          Viewer predictions and polls are not part of it either. For clips of your best moments:
        </p>
        <StreamerOsCard />
      </section>
    </article>
  );
}
