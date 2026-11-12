import type { Metadata } from "next";
import Link from "next/link";
import TextPage from "@/components/seo/Page";

export const metadata: Metadata = {
  title: "Esports Hub API: read event counts",
  description: "A small read-only API for Esports Hub. Base URL, the key header, two endpoints, the response fields and the rate limits. Counts and event details only, never people.",
  alternates: { canonical: "/developers/" },
};

const code = "block overflow-x-auto rounded-lg border border-white/10 bg-[#0a0b0d] p-3 font-mono text-sm text-zinc-100";

export default function Page() {
  return (
    <TextPage title="Esports Hub API" path="/developers/" updated="2026-11-12" intro="A small, read-only API for organisers who want their event numbers in their own sheet or tool. It returns event details and counts. It never returns people.">
      <section><h2>Before you start</h2>
        <p>You need a free Esports Hub account. Open <Link href="/app/account/">Account</Link> in the app and make a key. The key is shown once, so copy it then. You can have up to 5 keys and revoke any of them at any time. A key only reads. It cannot change anything.</p>
        <p>This is a small free service run by one person. There is no uptime promise and no support promise. The API may change, and if it does this page will say so.</p>
      </section>
      <section><h2>Base URL and sign-in</h2>
        <p>Send every request to the Esports Hub server with your key in the <code>Authorization</code> header. The API is for servers and scripts: it does not allow calls from other websites, so do not put your key in a web page.</p>
        <code className={code}>Authorization: Bearer ehk_your_key_here</code>
        <p>The base URL is the address of the Esports Hub server, followed by <code>/api/v1</code>. Only <code>GET</code> requests work. Your key works on this API and nowhere else, and your normal sign-in does not work here.</p>
      </section>
      <section><h2>The two endpoints</h2>
        <ul>
          <li><code>GET /api/v1/events</code> returns up to 50 of your events, each with its counts.</li>
          <li><code>GET /api/v1/events/:id/summary</code> returns one event. You get a 404 if the key owner cannot see that event.</li>
        </ul>
      </section>
      <section><h2>What comes back</h2>
        <p>An event has an <code>id</code>, <code>key</code>, <code>name</code>, <code>game</code>, <code>date</code>, <code>startsOn</code> and <code>createdAt</code>. The counts are:</p>
        <ul>
          <li><code>registrations</code>: <code>total</code>, <code>pending</code>, <code>approved</code> and <code>byStatus</code>.</li>
          <li><code>checkIns</code>: a number.</li>
          <li><code>liveViews</code>: <code>total</code> and <code>bySource</code>, such as the live page and embeds.</li>
        </ul>
        <p>The list endpoint answers <code>{"{ \"events\": [ ... ] }"}</code>. The summary endpoint answers <code>{"{ \"event\": { ... }, \"counts\": { ... } }"}</code>. Names, emails, photos, rosters and contact details are never part of any answer.</p>
      </section>
      <section><h2>Limits</h2>
        <p>Each key may make 60 requests a minute, and each address 120 a minute. Past that you get a 429 answer: wait and try again. Keep your requests few. The numbers do not change second by second.</p>
        <p>If a key leaks, revoke it in <Link href="/app/account/">Account</Link>. It stops working straight away.</p>
      </section>
      <section><h2>Questions</h2><p>Found a problem or need another field? <Link href="/contact/">Tell us</Link>. See the <Link href="/privacy/">privacy policy</Link> for what is stored.</p></section>
    </TextPage>
  );
}
