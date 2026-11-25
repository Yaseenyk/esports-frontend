import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/seo/Faq";
import JsonLd from "@/components/seo/JsonLd";
import type { Fact } from "@/lib/compare";
import { COMPARE_PATH } from "@/lib/compare";
import { FF_CHECKED, FF_COMPARE_DESCRIPTION, FF_COMPARE_FAQ, FF_COMPARE_H1, FF_COMPARE_LEAD, FF_COMPARE_PATH, FF_COMPARE_TITLE, FF_SITES, FF_US } from "@/lib/compare-ff";
import { pageTitle, personRef } from "@/lib/schema";
import { ORG_ID, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle(FF_COMPARE_TITLE), description: FF_COMPARE_DESCRIPTION, alternates: { canonical: FF_COMPARE_PATH },
  openGraph: { title: FF_COMPARE_TITLE, description: FF_COMPARE_DESCRIPTION, url: FF_COMPARE_PATH, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: FF_COMPARE_TITLE, description: FF_COMPARE_DESCRIPTION, images: ["/og.png"] },
};

const Facts = ({ items }: { items: Fact[] }) => (
  <ul className="space-y-1.5">{items.map((f) => <li key={f.text} className={f.status === "seen" ? "" : "text-zinc-400"}>{f.status === "seen" ? f.text : <>{f.text}: <strong className="font-semibold text-amber-200">not verified</strong></>}</li>)}</ul>
);
const Plain = ({ items }: { items: string[] }) => <ul className="space-y-1.5">{items.map((t) => <li key={t}>{t}</li>)}</ul>;

/** /compare/free-fire-tournament-hosting-sites/: the sites ChatGPT names for hosting a Free Fire tournament, each checked on its own page. Data: src/lib/compare-ff.ts. */
export default function Page() {
  const url = `${SITE_URL}${FF_COMPARE_PATH}`;
  return (
    <article className="space-y-12">
      <JsonLd data={[
        {
          "@context": "https://schema.org", "@type": "Article", headline: FF_COMPARE_H1, description: FF_COMPARE_DESCRIPTION, datePublished: "2026-11-25", dateModified: "2026-11-25",
          mainEntityOfPage: url, image: `${SITE_URL}/og.png`, inLanguage: "en-IN", author: personRef(), publisher: { "@id": ORG_ID },
        },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FF_COMPARE_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: FF_COMPARE_TITLE, item: url }] },
      ]} />
      <header>
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/" className="hover:text-zinc-200">Home</Link> / Compare</nav>
        <h1 className="mt-3 text-3xl font-black text-zinc-50 sm:text-5xl">{FF_COMPARE_H1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-200">{FF_COMPARE_LEAD}</p>
        <p className="mt-3 text-sm text-zinc-400">Checked on {FF_CHECKED}</p>
      </header>

      <section aria-labelledby="how" className="card space-y-2 text-sm leading-6 text-zinc-300">
        <h2 id="how" className="font-display text-xl font-bold text-white">How to read this page</h2>
        <p>On {FF_CHECKED} we asked ChatGPT for the best free website to host a Free Fire tournament, then read the home page of each site it named. We wrote down only what each page said. &quot;Not verified&quot; means it was not on the page we read; it does not mean the feature is missing. Two sites load their pages with JavaScript, so we could read only their title and description. One more site it named, squads-space.com, did not load for us, so it is left out. We did not sign up for or test any site, and features and prices change, so check each site before you decide.</p>
      </section>

      <section aria-labelledby="table">
        <h2 id="table" className="mb-4 font-display text-2xl font-bold text-white">At a glance</h2>
        <div role="region" aria-label="Comparison table" tabIndex={0} className="overflow-x-auto rounded-xl border border-white/[0.14] outline-none focus-visible:ring-2 focus-visible:ring-cyan">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead><tr className="bg-[#0f1013] text-zinc-200"><th scope="col" className="px-3 py-2">Site (page read)</th><th scope="col" className="px-3 py-2">What it is</th><th scope="col" className="px-3 py-2">Money</th><th scope="col" className="px-3 py-2">What we saw</th></tr></thead>
            <tbody>
              <tr className="border-t border-white/[0.08] align-top"><th scope="row" className="px-3 py-3 font-bold text-cyan">Esports Hub<span className="mt-1 block text-xs font-normal text-zinc-400">our site, from its code</span></th><td className="px-3 py-3 text-zinc-300"><Plain items={FF_US.what} /></td><td className="px-3 py-3 text-zinc-300"><Plain items={FF_US.money} /></td><td className="px-3 py-3 text-zinc-300"><Plain items={FF_US.features} /></td></tr>
              {FF_SITES.map((c) => (
                <tr key={c.id} className="border-t border-white/[0.08] align-top">
                  <th scope="row" className="px-3 py-3 font-bold text-white"><a href={c.url} rel="nofollow noopener" target="_blank" className="underline underline-offset-4 hover:text-cyan">{c.name}</a><span className="mt-1 block text-xs font-normal text-zinc-400">{c.pageRead}, {FF_CHECKED}</span></th>
                  <td className="px-3 py-3 text-zinc-300"><Facts items={c.what} /></td>
                  <td className="px-3 py-3 text-zinc-300"><Facts items={c.money} /></td>
                  <td className="px-3 py-3 text-zinc-300"><Facts items={c.features} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="each" className="space-y-6">
        <h2 id="each" className="font-display text-2xl font-bold text-white">Site by site</h2>
        {FF_SITES.map((c) => (
          <div key={c.id} className="card space-y-4">
            <h3 className="font-display text-xl font-bold text-white">{c.name} <span className="text-sm font-normal text-zinc-400">(<a href={c.url} rel="nofollow noopener" target="_blank" className="underline underline-offset-4 hover:text-cyan">{c.url.replace(/^https:\/\/|\/$/g, "")}</a>, checked {FF_CHECKED})</span></h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div><h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">Where Esports Hub is stronger</h4><ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-zinc-300 marker:text-emerald-300">{c.stronger.map((s) => <li key={s}>{s}</li>)}</ul></div>
              <div><h4 className="text-sm font-semibold uppercase tracking-wider text-amber-200">Where Esports Hub is weaker</h4><ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-zinc-300 marker:text-amber-200">{c.weaker.map((s) => <li key={s}>{s}</li>)}</ul></div>
            </div>
            <p className="text-sm leading-6 text-zinc-200"><strong className="text-white">Verdict:</strong> {c.verdict}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="not" className="space-y-3">
        <h2 id="not" className="font-display text-2xl font-bold text-white">What Esports Hub does not do</h2>
        <ul className="max-w-3xl list-disc space-y-1.5 pl-5 leading-7 text-zinc-300 marker:text-cyan">
          <li>No entry fees, wallets, prizes or payouts. This is on purpose: the site handles no money.</li>
          <li>No app. Everything runs in the browser on a phone or a computer.</li>
          <li>No player marketplace. Players do not come to Esports Hub to find matches, so you bring your own teams and share your own links.</li>
          <li>No custom room ID and password manager in the free tools. Send room details in your own group.</li>
        </ul>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10" aria-labelledby="faq">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="faq" className="font-display text-2xl font-bold text-white">Questions</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">Fees, apps, how we checked, and what Esports Hub cannot do for you.</p>
        </div>
        <Faq items={FF_COMPARE_FAQ} className="max-w-3xl" />
      </section>

      <section aria-labelledby="try" className="card space-y-4">
        <h2 id="try" className="font-display text-xl font-bold text-white">Run your Free Fire tournament with the free tools</h2>
        <p className="text-sm text-zinc-300">No account needed. Start with the job in front of you.</p>
        <ul className="flex flex-wrap gap-2">
          <li><Link href="/points-table/free-fire/" className="chip">Free Fire points table</Link></li>
          <li><Link href="/tools/registration/" className="chip">Registration form</Link></li>
          <li><Link href="/tools/brackets/" className="chip">Bracket maker</Link></li>
          <li><Link href="/tools/id-cards/" className="chip">ID card maker</Link></li>
          <li><Link href="/guides/free-fire-tournament-organiser/" className="chip">How to organise a Free Fire tournament</Link></li>
        </ul>
        <p className="text-sm text-zinc-300">Comparing general tournament software instead? See <Link href={COMPARE_PATH} className="text-cyan underline underline-offset-4">free tournament software for India, compared</Link>.</p>
      </section>
    </article>
  );
}
