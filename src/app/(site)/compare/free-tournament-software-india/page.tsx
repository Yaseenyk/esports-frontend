import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/seo/Faq";
import JsonLd from "@/components/seo/JsonLd";
import { CHECKED, COMPARE_DESCRIPTION, COMPARE_FAQ, COMPARE_H1, COMPARE_LEAD, COMPARE_PATH, COMPARE_TITLE, COMPETITORS, type Fact } from "@/lib/compare";
import { TOOLS } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: COMPARE_TITLE, description: COMPARE_DESCRIPTION, alternates: { canonical: COMPARE_PATH },
  openGraph: { title: COMPARE_TITLE, description: COMPARE_DESCRIPTION, url: COMPARE_PATH, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: COMPARE_TITLE, description: COMPARE_DESCRIPTION, images: ["/og.png"] },
};

const Facts = ({ items }: { items: Fact[] }) => (
  <ul className="space-y-1.5">{items.map((f) => <li key={f.text} className={f.status === "seen" ? "" : "text-zinc-400"}>{f.status === "seen" ? f.text : <>{f.text}: <strong className="font-semibold text-amber-200">not verified</strong></>}</li>)}</ul>
);

export default function Page() {
  const url = `${SITE_URL}${COMPARE_PATH}`;
  return (
    <article className="space-y-12">
      <JsonLd data={[
        {
          "@context": "https://schema.org", "@type": "Article", headline: COMPARE_H1, description: COMPARE_DESCRIPTION, datePublished: "2026-11-11", dateModified: "2026-11-11",
          mainEntityOfPage: url, image: `${SITE_URL}/og.png`, inLanguage: "en-IN",
          author: { "@type": "Organization", name: "Esports Hub", url: SITE_URL }, publisher: { "@type": "Organization", name: "Esports Hub", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` } },
        },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: COMPARE_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Free tournament software for India", item: url }] },
      ]} />
      <header>
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/" className="hover:text-zinc-200">Home</Link> / Compare</nav>
        <h1 className="mt-3 text-3xl font-black text-zinc-50 sm:text-5xl">{COMPARE_H1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-200">{COMPARE_LEAD}</p>
        <p className="mt-3 text-sm text-zinc-400">Last checked: {CHECKED}</p>
      </header>

      <section aria-labelledby="how" className="card space-y-2 text-sm leading-6 text-zinc-300">
        <h2 id="how" className="font-display text-xl font-bold text-white">How to read this page</h2>
        <p>We read one page of each product on {CHECKED} and wrote down only what appeared in the text. &quot;Not verified&quot; means it was not in the text we read. It does not mean the feature is missing. We did not sign up for or test any product, and prices and features change, so check each site before you decide. Esports Hub is made by the people who wrote this page, so read our claims with that in mind.</p>
      </section>

      <section aria-labelledby="table">
        <h2 id="table" className="mb-4 font-display text-2xl font-bold text-white">At a glance</h2>
        <div role="region" aria-label="Comparison table" tabIndex={0} className="overflow-x-auto rounded-xl border border-white/[0.14] outline-none focus-visible:ring-2 focus-visible:ring-cyan">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead><tr className="bg-[#0f1013] text-zinc-200"><th scope="col" className="px-3 py-2">Product (page read)</th><th scope="col" className="px-3 py-2">Price as seen</th><th scope="col" className="px-3 py-2">What is free</th><th scope="col" className="px-3 py-2">What we saw</th></tr></thead>
            <tbody>
              <tr className="border-t border-white/[0.08] align-top"><th scope="row" className="px-3 py-3 font-bold text-cyan">Esports Hub</th><td className="px-3 py-3 text-zinc-300">Free. No paid tier today.</td><td className="px-3 py-3 text-zinc-300">All tools, with no account. A free account adds saving events online, sign-up links and live check-in.</td><td className="px-3 py-3 text-zinc-300">Brackets, points table, round robin, schedule, poster maker, certificates, ID cards, QR gate check-in, TV screens with sponsor strip and ticker.</td></tr>
              {COMPETITORS.map((c) => (
                <tr key={c.id} className="border-t border-white/[0.08] align-top">
                  <th scope="row" className="px-3 py-3 font-bold text-white">{c.name}<span className="mt-1 block text-xs font-normal text-zinc-400">{c.pageRead}</span></th>
                  <td className="px-3 py-3 text-zinc-300"><Facts items={c.price} /></td>
                  <td className="px-3 py-3 text-zinc-300"><Facts items={c.free} /></td>
                  <td className="px-3 py-3 text-zinc-300"><Facts items={c.seen} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-zinc-400">Prices are in US dollars as shown on the product pages we read.</p>
      </section>

      <section aria-labelledby="each" className="space-y-6">
        <h2 id="each" className="font-display text-2xl font-bold text-white">Product by product</h2>
        {COMPETITORS.map((c) => (
          <div key={c.id} className="card space-y-4">
            <h3 className="font-display text-xl font-bold text-white">{c.name}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div><h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">Where Esports Hub is stronger</h4><ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-zinc-300 marker:text-emerald-300">{c.stronger.map((s) => <li key={s}>{s}</li>)}</ul></div>
              <div><h4 className="text-sm font-semibold uppercase tracking-wider text-amber-200">Where Esports Hub is weaker</h4><ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-zinc-300 marker:text-amber-200">{c.weaker.map((s) => <li key={s}>{s}</li>)}</ul></div>
            </div>
            <p className="text-sm leading-6 text-zinc-200"><strong className="text-white">Verdict:</strong> {c.verdict}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10" aria-labelledby="faq">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="faq" className="font-display text-2xl font-bold text-white">Questions</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">How we compared, what is free, and where Esports Hub falls short.</p>
        </div>
        <Faq items={COMPARE_FAQ} className="max-w-3xl" />
      </section>

      <section aria-labelledby="try" className="card space-y-4">
        <h2 id="try" className="font-display text-xl font-bold text-white">Try the tools, free</h2>
        <p className="text-sm text-zinc-300">No account needed. Start with the job in front of you.</p>
        <ul className="flex flex-wrap gap-2">{TOOLS.map((t) => <li key={t.slug}><Link href={t.href} className="chip">{t.name}</Link></li>)}</ul>
        <div><Link href="/tools/" className="btn">See all free tools</Link></div>
      </section>
    </article>
  );
}
