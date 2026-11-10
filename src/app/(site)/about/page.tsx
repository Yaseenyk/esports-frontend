import type { Metadata } from "next";
import Link from "next/link";
import TextPage from "@/components/seo/Page";

export const metadata: Metadata = {
  title: "About Esports Hub",
  description: "What Esports Hub is, who it is for, what it costs, how the guides are written and kept up to date, and how to report a mistake.",
  alternates: { canonical: "/about/" },
};

export default function Page() {
  return (
    <TextPage title="About Esports Hub" path="/about/" updated="2026-11-11" intro="Esports Hub is a small, independent project that gives people who organise esports and gaming events free tools and plain, practical guides.">
      <section><h2>What it is</h2><p>Organising a college tournament or a club cup involves the same jobs every time: choosing a format, writing rules, registering teams, issuing ID cards, checking people in at the gate and publishing results. Most of the tools for this are built for large companies, cost money, or are made for other sports. Esports Hub collects the jobs that come up most often into free tools that run in a web browser, and explains how to do each job in a guide.</p></section>
      <section><h2>Who it is for</h2><p>Students and faculty who run college esports events, members of gaming clubs and communities, and small organisers in India and elsewhere who want something simple. You do not need technical knowledge.</p></section>
      <section><h2>What you can do here</h2>
        <ul>
          <li><Link href="/tools/id-cards/">Make ID cards and passes</Link> for players and staff, with QR codes that the gate can check.</li>
          <li><Link href="/tools/brackets/">Build a tournament bracket</Link> with seeds and byes.</li>
          <li><Link href="/tools/points-table/">Work out a battle royale points table</Link> with tie-breakers.</li>
          <li><Link href="/tools/check-in/">Check guests in at the gate</Link>, online or offline.</li>
          <li>Read the <Link href="/guides/">guides</Link> that explain how to run the whole event.</li>
        </ul>
      </section>
      <section><h2>What it costs</h2><p>The tools are free and do not need an account. A free account adds saving an event online, invite links for players and live check-in across several doors.</p></section>
      <section><h2>How the guides are written</h2>
        <p>Guides are written by the Esports Hub team, with AI tools used to help draft and structure them. They describe how events are commonly run and how the tools on this site work. We do not invent statistics, prices or results. Where a rule or number comes from someone else, such as a game publisher, we say so and tell you to check the current version, because those change. Every guide shows the date it was last updated.</p>
        <p>The calculators and tools are tested, and the worked examples in the guides are produced by the same code as the tools, so the numbers match.</p>
      </section>
      <section><h2>Independence</h2><p>Esports Hub is not affiliated with, endorsed by or sponsored by any game publisher or tournament organiser. Game names and logos are trademarks of their owners and are used only to identify the games.</p></section>
      <section><h2>Found a mistake?</h2><p>Tell us on the <Link href="/contact/">contact page</Link> with the page address and what is wrong. We correct errors and update the date on the page.</p></section>
      <section><h2>Your data</h2><p>See the <Link href="/privacy/">privacy policy</Link> for exactly what is stored and what is not, and the <Link href="/terms/">terms of use</Link>.</p></section>
    </TextPage>
  );
}
