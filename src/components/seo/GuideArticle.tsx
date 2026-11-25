import Link from "next/link";
import Faq from "@/components/seo/Faq";
import JsonLd from "@/components/seo/JsonLd";
import { Blocks, Inline } from "@/components/seo/Prose";
import type { Guide } from "@/content/guides";
import type { UiLang } from "@/lib/pt-br";
import { ORG_ID, SITE_URL } from "@/lib/site";
import { personRef } from "@/lib/schema";

/** The words around a guide's own text. Only the Portuguese Free Fire team names guide passes "pt-BR". */
const UI = {
  en: { inLanguage: "en-IN", dateLocale: "en-IN", home: "Home", guides: "Guides", updated: "Updated", minRead: "min read", by: "By", short: "Short answer", toc: "In this guide", tocLabel: "On this page", faq: "Questions and answers", faqLead: "The things people ask most about this, answered plainly.", tryIt: "Try it", tryLead: "Free to use, no account needed.", more: "Keep reading", mistake: "Spotted a mistake or something out of date? Tell us on the [contact page](/contact/) and we will fix it. How we write and update guides: [about this site](/about/)." },
  "pt-BR": { inLanguage: "pt-BR", dateLocale: "pt-BR", home: "Início", guides: "Guias (em inglês)", updated: "Atualizado em", minRead: "min de leitura", by: "Por", short: "Resposta curta", toc: "Neste guia", tocLabel: "Nesta página", faq: "Perguntas e respostas", faqLead: "O que as pessoas mais perguntam sobre isso, com respostas diretas.", tryIt: "Experimente", tryLead: "Grátis e sem precisar de conta.", more: "Continue lendo (em inglês)", mistake: "Viu um erro ou algo desatualizado? Avise na [página de contato](/contact/) (em inglês) e vamos corrigir. Como escrevemos e atualizamos os guias: [sobre este site](/about/) (em inglês)." },
} as const;

const dateText = (iso: string, locale: string) => new Date(iso + "T00:00:00").toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });

/**
 * One guide as a plain server-rendered article: structured data, header with the short answer, contents, sections, FAQ and links.
 * `path` is the page address; `related` are the guides linked at the end; `notice` is shown under the breadcrumb (the merged-guide note).
 */
export default function GuideArticle({ g, path, og, related, notice, lang = "en" }: { g: Guide; path: string; og: string; related: Guide[]; notice?: React.ReactNode; lang?: UiLang }) {
  const u = UI[lang];
  const url = `${SITE_URL}${path}`;
  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <JsonLd data={[
        {
          "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, datePublished: g.published, dateModified: g.updated,
          mainEntityOfPage: url, image: `${SITE_URL}${og}`, inLanguage: u.inLanguage,
          author: personRef(), publisher: { "@id": ORG_ID },
        },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: u.home, item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: u.guides, item: `${SITE_URL}/guides/` }, { "@type": "ListItem", position: 3, name: g.title, item: url }] },
        ...(g.faq?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: g.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
      ]} />
      <header>
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link prefetch={false} href="/guides/" className="hover:text-zinc-200">{u.guides}</Link> / {g.tag}</nav>
        {notice}
        <h1 className="mt-3 text-3xl font-black leading-tight text-zinc-50 sm:text-4xl">{g.title}</h1>
        <p className="mt-3 text-sm text-zinc-400">{u.updated} {dateText(g.updated, u.dateLocale)} · {g.minutes} {u.minRead} · {u.by} <Link prefetch={false} href="/about/" className="underline-offset-4 hover:underline">Yaseen Khatib</Link></p>
        {g.answer && <div role="note" aria-label={u.short} className="mt-5 rounded-xl border border-cyan/40 bg-[#0a0b0d] p-4"><p className="text-sm font-semibold uppercase tracking-wide text-cyan">{u.short}</p><p className="mt-1 leading-relaxed text-zinc-100"><Inline text={g.answer} /></p></div>}
        <p className="mt-5 text-lg leading-relaxed text-zinc-200">{g.intro}</p>
        {g.slug === "best-free-esports-id-card-makers" && <p className="mt-5"><Link prefetch={false} href={g.cta.href} className="btn">{g.cta.label}</Link></p>}
      </header>

      <nav aria-label={u.tocLabel} className="rounded-xl border border-white/[0.14] bg-[#0a0b0d] p-4">
        <p className="text-sm font-semibold text-white">{u.toc}</p>
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
            <h2 id="faq" className="font-display text-2xl font-bold text-white">{u.faq}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{u.faqLead}</p>
          </div>
          <Faq items={g.faq} className="max-w-3xl" />
        </section>
      )}

      <section className="card text-center"><h2 className="font-display text-xl font-bold text-white">{u.tryIt}</h2><p className="mt-1 text-sm text-zinc-300">{u.tryLead}</p><div className="mt-4"><Link prefetch={false} href={g.cta.href} className="btn">{g.cta.label}</Link></div></section>

      {related.length > 0 && (
        <section aria-labelledby="more"><h2 id="more" className="font-display text-xl font-bold text-white">{u.more}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">{related.map((r) => <li key={r.slug}><Link prefetch={false} href={`/guides/${r.slug}/`} className="card block h-full !p-4"><span className="tag">{r.tag}</span><span className="mt-2 block font-semibold text-white">{r.title}</span></Link></li>)}</ul>
        </section>
      )}
      <p className="text-xs text-zinc-400"><Inline text={u.mistake} /></p>
    </article>
  );
}
