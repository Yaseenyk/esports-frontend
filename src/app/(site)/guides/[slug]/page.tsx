import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/seo/Faq";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { Blocks, Inline } from "@/components/seo/Prose";
import { GUIDES, guideBySlug } from "@/content/guides";
import { ORG_ID, SITE_URL } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = guideBySlug(params.slug);
  if (!g) return {};
  const url = `/guides/${g.slug}/`;
  return {
    title: g.seoTitle ?? g.title, description: g.description, alternates: { canonical: url },
    openGraph: { type: "article", title: g.seoTitle ?? g.title, description: g.description, url, publishedTime: g.published, modifiedTime: g.updated, images: ["/og.png"] },
    twitter: { card: "summary_large_image", title: g.seoTitle ?? g.title, description: g.description, images: ["/og.png"] },
  };
}

const dateText = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = guideBySlug(params.slug);
  if (!g) notFound();
  const url = `${SITE_URL}/guides/${g.slug}/`;
  const related = g.related.map((s) => guideBySlug(s)).filter((x): x is NonNullable<typeof x> => !!x);
  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <JsonLd data={[
        {
          "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, datePublished: g.published, dateModified: g.updated,
          mainEntityOfPage: url, image: `${SITE_URL}/og.png`, inLanguage: "en-IN",
          author: { "@id": ORG_ID }, publisher: { "@id": ORG_ID },
        },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides/` }, { "@type": "ListItem", position: 3, name: g.title, item: url }] },
        ...(g.faq?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: g.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
      ]} />
      <header>
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/guides/" className="hover:text-zinc-200">Guides</Link> / {g.tag}</nav>
        <h1 className="mt-3 text-3xl font-black leading-tight text-zinc-50 sm:text-4xl">{g.title}</h1>
        <p className="mt-3 text-sm text-zinc-400">Updated {dateText(g.updated)} · {g.minutes} min read · By the Esports Hub team</p>
        {g.answer && <div role="note" aria-label="Short answer" className="mt-5 rounded-xl border border-cyan/40 bg-[#0a0b0d] p-4"><p className="text-sm font-semibold uppercase tracking-wide text-cyan">Short answer</p><p className="mt-1 leading-relaxed text-zinc-100"><Inline text={g.answer} /></p></div>}
        <p className="mt-5 text-lg leading-relaxed text-zinc-200">{g.intro}</p>
      </header>

      <nav aria-label="On this page" className="rounded-xl border border-white/[0.14] bg-[#0a0b0d] p-4">
        <p className="text-sm font-semibold text-white">In this guide</p>
        <ol className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
          {g.sections.map((s, i) => <li key={s.h2}><a href={`#s${i}`} className="text-zinc-300 hover:text-cyan">{s.h2}</a></li>)}
        </ol>
      </nav>

      {g.sections.map((s, i) => (
        <section key={s.h2} aria-labelledby={`s${i}`} className="space-y-4">
          <h2 id={`s${i}`} className="scroll-mt-24 font-display text-2xl font-bold text-white">{s.h2}</h2>
          <Blocks blocks={s.blocks} />
        </section>
      ))}

      {g.faq && g.faq.length > 0 && (
        <section aria-labelledby="faq" className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 id="faq" className="font-display text-2xl font-bold text-white">Questions and answers</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">The things people ask most about this, answered plainly.</p>
          </div>
          <Faq items={g.faq} className="max-w-3xl" />
        </section>
      )}

      <section className="card text-center"><h2 className="font-display text-xl font-bold text-white">Try it</h2><p className="mt-1 text-sm text-zinc-300">Free to use, no account needed.</p><div className="mt-4"><Link href={g.cta.href} className="btn">{g.cta.label}</Link></div></section>

      {related.length > 0 && (
        <section aria-labelledby="more"><h2 id="more" className="font-display text-xl font-bold text-white">Keep reading</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">{related.map((r) => <li key={r.slug}><Link href={`/guides/${r.slug}/`} className="card block h-full !p-4"><span className="tag">{r.tag}</span><span className="mt-2 block font-semibold text-white">{r.title}</span></Link></li>)}</ul>
        </section>
      )}
      <p className="text-xs text-zinc-400"><Inline text="Spotted a mistake or something out of date? Tell us on the [contact page](/contact/) and we will fix it. How we write and update guides: [about this site](/about/)." /></p>
    </article>
  );
}
