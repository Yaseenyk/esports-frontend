import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";
import { KIT_GUIDE_PATH, KIT_PATH } from "@/features/overlay-kit/flag";
import StreamerOsCard from "@/features/overlay-kit/ui/StreamerOsCard";

// Behind the overlay kit flag (src/features/overlay-kit/flag.ts): with the flag off, scripts/prune-v3.mjs deletes this page from ./out.
const title = "OBS setup for the esports overlay kit, step by step";
const description = "Add the live points table, top fraggers and team cards to OBS: Browser Source size 1920 x 1080, transparent background, docks and refreshing.";

export const metadata: Metadata = {
  title, description, alternates: { canonical: KIT_GUIDE_PATH },
  openGraph: { title, description, url: KIT_GUIDE_PATH, images: ["/og.png"] }, twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

const link = "text-cyan-400 underline underline-offset-2";
const h2 = "font-display text-2xl text-zinc-100";
const list = "list-decimal space-y-2 pl-6 leading-7 text-zinc-300 marker:text-cyan-400";

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: "OBS overlay kit", item: `${SITE_URL}${KIT_PATH}` }, { "@type": "ListItem", position: 3, name: "OBS setup", item: `${SITE_URL}${KIT_GUIDE_PATH}` }] }} />
      <header className="space-y-4">
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/" className="hover:text-zinc-100">Home</Link> / <Link href={KIT_PATH} className="hover:text-zinc-100">OBS overlay kit</Link> / OBS setup</nav>
        <h1 className="font-display text-3xl text-zinc-100 sm:text-4xl">Set up the overlay kit in OBS Studio</h1>
        <p className="text-base leading-7 text-zinc-300">
          This guide adds the <Link href={KIT_PATH} className={link}>overlay kit</Link> (live points table, top fraggers, team cards) to OBS
          Studio as Browser Sources. The same steps work in Streamlabs Desktop, where the source is also called Browser Source. You need a
          points table filled in on one of our tools and a few minutes before the stream.
        </p>
      </header>

      <section aria-labelledby="g-canvas" className="space-y-3 border-t border-white/10 pt-6">
        <h2 id="g-canvas" className={h2}>1. Check the canvas size</h2>
        <p className="leading-7 text-zinc-300">
          The overlays are drawn for a 1920 by 1080 canvas. In OBS, open Settings, then Video, and check that the Base (Canvas) Resolution
          is 1920x1080. A 1280x720 canvas also works: set the browser sources to 1280 by 720 instead, and everything scales with them.
        </p>
      </section>

      <section aria-labelledby="g-connect" className="space-y-3 border-t border-white/10 pt-6">
        <h2 id="g-connect" className={h2}>2. Choose how the tool talks to OBS</h2>
        <p className="leading-7 text-zinc-300">
          The tool and the overlay pass data inside one browser, without a server. OBS has its own built-in browser, which does not share
          saved data with Chrome or Edge. Pick one of these:
        </p>
        <ul className="list-disc space-y-2 pl-6 leading-7 text-zinc-300 marker:text-cyan-400">
          <li>
            <strong className="text-zinc-100">Live, with an OBS dock (recommended).</strong> In OBS open the Docks menu (View, then Docks, in
            older versions) and choose Custom Browser Docks. Give the dock a name, paste the address of your points table tool (for example
            the Free Fire page) and press Apply. The tool opens inside OBS, in the same built-in browser as your browser sources. Switch on
            &ldquo;Send to the OBS overlay&rdquo; under the table there, and every result you type shows on stream at once.
          </li>
          <li>
            <strong className="text-zinc-100">Snapshot link, any browser.</strong> Keep the tool in Chrome or Edge. On the overlay kit page,
            leave &ldquo;Put a snapshot of the current table in the link&rdquo; ticked and copy the OBS URL. After each match, copy it again
            and paste it into the browser source. Simple and reliable, but not live.
          </li>
        </ul>
        <p className="leading-7 text-zinc-300">
          To test before you open OBS, open the overlay link in a second tab of the browser that runs the tool: it follows the tool live.
        </p>
      </section>

      <section aria-labelledby="g-source" className="space-y-3 border-t border-white/10 pt-6">
        <h2 id="g-source" className={h2}>3. Add each overlay as a Browser Source</h2>
        <ol className={list}>
          <li>On the <Link href={KIT_PATH} className={link}>overlay kit page</Link>, set the design, the safe margin and where each overlay sits, then press Copy OBS URL for the overlay you want.</li>
          <li>In OBS, in the Sources box of your scene, press the plus button and choose Browser. Name it, for example &ldquo;Points table&rdquo;.</li>
          <li>Paste the link into URL. Set Width to 1920 and Height to 1080. Leave &ldquo;Use custom frame rate&rdquo; off.</li>
          <li>Leave the Custom CSS box as OBS fills it: <code className="font-mono text-sm text-zinc-100">body {"{"} background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; {"}"}</code>. That line keeps the background transparent.</li>
          <li>Leave &ldquo;Shutdown source when not visible&rdquo; off, so the overlay keeps receiving updates while another scene is on air.</li>
          <li>Press OK. The source fills the canvas; do not stretch it. To move an overlay, change &ldquo;Where on screen&rdquo; on the kit page instead, so text stays inside the safe margin.</li>
        </ol>
        <p className="leading-7 text-zinc-300">Repeat for top fraggers and team cards. Each is its own source, so you can show them in different scenes.</p>
      </section>

      <section aria-labelledby="g-safe" className="space-y-3 border-t border-white/10 pt-6">
        <h2 id="g-safe" className={h2}>4. Transparent background and safe areas</h2>
        <p className="leading-7 text-zinc-300">
          The overlay page has no background of its own: only the table, the cards and their dark backing plates are drawn, so gameplay
          shows around them. If you see a black or dark blue rectangle instead, the Custom CSS line from step 3 was removed; paste it back.
        </p>
        <p className="leading-7 text-zinc-300">
          The safe margin keeps text away from the edges of the frame. The default of 5% of the width and height matches the usual title-safe
          area for broadcast. Raise it if a webcam or a game&apos;s own interface sits in a corner; lower it for a cleaner, wider table.
        </p>
      </section>

      <section aria-labelledby="g-refresh" className="space-y-3 border-t border-white/10 pt-6">
        <h2 id="g-refresh" className={h2}>5. Refreshing and fixing problems</h2>
        <ul className="list-disc space-y-2 pl-6 leading-7 text-zinc-300 marker:text-cyan-400">
          <li>Changed a setting on the kit page? Copy the new link and paste it into the source&apos;s URL; OBS loads it again by itself.</li>
          <li>The overlay looks stuck: open the source&apos;s Properties and press &ldquo;Refresh cache of current page&rdquo;.</li>
          <li>The overlay says it is waiting for a points table: the tool is running in another browser than the overlay. Use the OBS dock, or a snapshot link.</li>
          <li>Text is too small or too big: change Text size on the kit page, not the size of the source.</li>
          <li>Top fraggers shows team kills: the points tools count kills per team. Type player kills on the kit page to show player names.</li>
        </ul>
      </section>

      <section aria-labelledby="g-clips" className="space-y-4 border-t border-white/10 pt-6">
        <h2 id="g-clips" className={h2}>Clips and highlights</h2>
        <p className="leading-7 text-zinc-300">
          The overlay kit only draws standings. It does not record, clip or upload your stream, and it has no viewer predictions.
        </p>
        <StreamerOsCard />
      </section>
    </article>
  );
}
