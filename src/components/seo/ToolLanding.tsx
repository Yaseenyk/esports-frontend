import Link from "next/link";
import JsonLd from "./JsonLd";
import { SITE_URL } from "@/lib/site";

export interface ToolPage {
  slug: string;
  name: string;
  h1: string;
  lead: string;
  benefits: { title: string; body: string }[];
  steps: string[];
  faq: { q: string; a: string }[];
}

/** A public, server-rendered page that explains one tool. It is what search engines read; the tool itself lives in the app after sign-in. */
export default function ToolLanding({ t }: { t: ToolPage }) {
  const url = `${SITE_URL}/tools/${t.slug}/`;
  return (
    <article className="space-y-12">
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "SoftwareApplication", name: t.name, applicationCategory: "BusinessApplication", operatingSystem: "Web", url, description: t.lead, offers: { "@type": "Offer", price: "0", priceCurrency: "INR" } },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` }, { "@type": "ListItem", position: 3, name: t.name, item: url }] },
      ]} />
      <header>
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/tools/" className="hover:text-zinc-200">Tools</Link> / {t.name}</nav>
        <h1 className="mt-3 text-3xl font-black text-zinc-50 sm:text-5xl">{t.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-300">{t.lead}</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link href="/signup/" className="btn">Create a free account</Link><Link href="/login/" className="btn-ghost">Sign in</Link></div>
      </header>

      <section aria-labelledby="why"><h2 id="why" className="font-display text-2xl font-bold text-white">What you get</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">{t.benefits.map((b) => <div key={b.title} className="card"><h3 className="font-display font-bold text-white">{b.title}</h3><p className="mt-2 text-sm text-zinc-300">{b.body}</p></div>)}</div>
      </section>

      <section aria-labelledby="how"><h2 id="how" className="font-display text-2xl font-bold text-white">How it works</h2>
        <ol className="mt-4 space-y-3">{t.steps.map((s, i) => <li key={s} className="card flex gap-4 !p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan font-bold text-ink">{i + 1}</span><span className="text-zinc-200">{s}</span></li>)}</ol>
      </section>

      <section aria-labelledby="faq"><h2 id="faq" className="font-display text-2xl font-bold text-white">Questions</h2>
        <div className="mt-4 space-y-3">{t.faq.map((f) => <details key={f.q} className="card !p-4"><summary className="cursor-pointer font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan">{f.q}</summary><p className="mt-2 text-sm text-zinc-300">{f.a}</p></details>)}</div>
      </section>

      <section className="card text-center"><h2 className="font-display text-xl font-bold text-white">Ready to try it?</h2><p className="mt-1 text-sm text-zinc-300">Accounts are free. Your tools open the moment you sign in.</p><div className="mt-4 flex justify-center gap-3"><Link href="/signup/" className="btn">Create a free account</Link></div></section>
    </article>
  );
}
