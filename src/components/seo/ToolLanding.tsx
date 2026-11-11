import Link from "next/link";
import { Item, Reveal, Stagger } from "@/components/Motion";
import JsonLd from "./JsonLd";
import Faq from "@/components/seo/Faq";
import { GUIDES } from "@/content/guides";
import { SITE_URL } from "@/lib/site";

export interface ToolPage {
  slug: string;
  name: string;
  h1: string;
  lead: string;
  benefits: { title: string; body: string }[];
  steps: string[];
  faq: { q: string; a: string }[];
  /** Guides to link to from the page, by slug. */
  guides?: string[];
  /** The label for the section that holds the tool itself. */
  useHeading?: string;
}

/**
 * A public page for one tool: what it does, the working tool itself (free, no account) and the questions people ask.
 * It is plain server-rendered HTML, so search engines read the full text; the tool loads on top of it.
 */
export default function ToolLanding({ t, children }: { t: ToolPage; children?: React.ReactNode }) {
  const url = `${SITE_URL}/tools/${t.slug}/`;
  const guides = (t.guides ?? []).map((s) => GUIDES.find((g) => g.slug === s)).filter((g): g is NonNullable<typeof g> => !!g);
  return (
    <article className="space-y-12">
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "SoftwareApplication", name: t.name, applicationCategory: "BusinessApplication", operatingSystem: "Web", url, description: t.lead, inLanguage: "en-IN", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" } },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` }, { "@type": "ListItem", position: 3, name: t.name, item: url }] },
      ]} />
      <header className="no-print">
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/tools/" className="hover:text-zinc-200">Tools</Link> / {t.name}</nav>
        <h1 className="mt-3 text-3xl font-black text-zinc-50 sm:text-5xl">{t.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-200">{t.lead}</p>
      </header>

      {children && <section aria-labelledby="use"><h2 id="use" className="mb-4 font-display text-2xl font-bold text-white">{t.useHeading ?? "Use it now"}</h2>{children}</section>}

      <section className="no-print" aria-labelledby="why"><h2 id="why" className="font-display text-2xl font-bold text-white">What you get</h2>
        <Stagger className="mt-4 grid gap-4 md:grid-cols-3">{t.benefits.map((b) => <Item key={b.title}><div className="card h-full"><h3 className="font-display font-bold text-white">{b.title}</h3><p className="mt-2 text-sm text-zinc-300">{b.body}</p></div></Item>)}</Stagger>
      </section>

      <section className="no-print" aria-labelledby="how"><h2 id="how" className="font-display text-2xl font-bold text-white">How it works</h2>
        <Stagger className="mt-4 space-y-3"><ol className="contents">{t.steps.map((s, i) => <li key={s} className="list-none"><Item><div className="card flex gap-4 !p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan font-bold text-ink">{i + 1}</span><span className="text-zinc-200">{s}</span></div></Item></li>)}</ol></Stagger>
      </section>

      {guides.length > 0 && (
        <section className="no-print" aria-labelledby="read"><h2 id="read" className="font-display text-2xl font-bold text-white">Guides that help</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">{guides.map((g) => <li key={g.slug}><Link href={`/guides/${g.slug}/`} className="card block h-full !p-4"><span className="tag">{g.tag}</span><span className="mt-2 block font-semibold text-white">{g.title}</span></Link></li>)}</ul>
        </section>
      )}

      <section className="no-print" aria-labelledby="faq"><h2 id="faq" className="font-display text-2xl font-bold text-white">Questions</h2>
        <div className="mt-4"><Faq items={t.faq} /></div>
      </section>

      <section className="card text-center"><h2 className="font-display text-xl font-bold text-white">Want to save your work online?</h2><p className="mt-1 text-sm text-zinc-300">The tools are free without an account. A free account adds saving events online, player invite links and live gate check-in.</p><div className="mt-4 flex justify-center gap-3"><Link href="/signup/" className="btn">Create a free account</Link></div></section>
    </article>
  );
}
