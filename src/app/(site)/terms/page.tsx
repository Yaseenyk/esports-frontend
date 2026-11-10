import type { Metadata } from "next";
import Link from "next/link";
import TextPage from "@/components/seo/Page";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms for using Esports Hub tools and guides: organisers are responsible for consent and rules, and the site has no affiliation with game publishers.",
  alternates: { canonical: "/terms/" },
};

export default function Page() {
  return (
    <TextPage title="Terms of use" path="/terms/" updated="2026-11-11" intro="By using Esports Hub you agree to these terms. They are written in plain language.">
      <section><h2>What you may do</h2><p>You may use the tools and read the guides for free, for your own events and communities, including events that charge an entry fee. You may print and share cards and results you make.</p></section>
      <section><h2>Your responsibilities as an organiser</h2>
        <ul>
          <li>You are responsible for the events you run, the rules you publish and the safety of the people who attend.</li>
          <li>You are responsible for the personal details you collect. Collect only what you need, get consent (including a parent or guardian&apos;s consent for anyone under 18) and handle the details with care.</li>
          <li>Do not use the tools to make cards or passes that pretend to be an official document, or to collect details without people&apos;s permission.</li>
          <li>Keep your sign-in, gate keys, invite links and pass links safe, and switch off any you no longer need.</li>
        </ul>
      </section>
      <section><h2>Guides and tools are general help</h2><p>The guides describe how events are commonly run. They are not legal, financial or professional advice, and rules from game publishers, colleges or authorities may differ and change. Check what applies to you. The tools are provided as they are, without a promise that they will be free of errors or always available. Check results, such as a points table, before you announce them.</p></section>
      <section><h2>Accounts</h2><p>You can delete your account at any time from the Account page. We may remove an account that is used to abuse the service or other people.</p></section>
      <section><h2>No affiliation</h2><p>Esports Hub is independent and is not affiliated with any game publisher, tournament organiser or government body. Game names and logos belong to their owners.</p></section>
      <section><h2>Limits</h2><p>To the extent the law allows, we are not liable for losses arising from the use of the tools or guides, including lost data or a mistake at an event. Keep your own copy of anything important: the card maker lets you save a project file.</p></section>
      <section><h2>Changes and contact</h2><p>We may update these terms and will change the date above when we do. Questions: use the <Link href="/contact/">contact page</Link>. See also the <Link href="/privacy/">privacy policy</Link>.</p></section>
    </TextPage>
  );
}
