import Link from "next/link";
import { Item, Reveal, Stagger } from "@/components/Motion";
import JsonLd from "./JsonLd";
import Faq from "@/components/seo/Faq";
import { Inline } from "@/components/seo/Prose";
import ScrollTable from "@/components/seo/ScrollTable";
import { LISTED_GUIDES as GUIDES } from "@/content/guides";
import { ORG_ID, SITE_URL } from "@/lib/site";
import type { UiLang } from "@/lib/pt-br";
import { OWNER, personJsonLd, type ScoringRules } from "@/features/tool-trust/domain";
import { SafeToUse, ScoringRulesBlock, WhoRuns } from "@/features/tool-trust/ui/TrustBlocks";

/** The page's own words around the tool. Only the Portuguese Free Fire page passes "pt-BR". */
const UI = {
  en: { inLanguage: "en-IN", home: "Home", howToName: (hn: string) => `How to use the ${hn}`, use: "Use it now", words: "What these words mean", why: (hn: string) => `Why use this ${hn}`, how: (hn: string) => `How to use the ${hn}`, guides: "Guides that help", related: "Related pages", faq: (n: string) => `${n}: questions and answers`, faqLead: "Straight answers about how this tool works, what it can and cannot do, and where your data goes.", saveH: "Want to save your work online?", saveP: "The tools are free without an account. A free account adds saving events online, player invite links and live gate check-in.", signup: "Create a free account" },
  "pt-BR": { inLanguage: "pt-BR", home: "Início", howToName: (hn: string) => `Como usar a ${hn}`, use: "Use agora", words: "O que estas palavras significam", why: (hn: string) => `Por que usar esta ${hn}`, how: (hn: string) => `Como usar a ${hn}`, guides: "Guias que ajudam (em inglês)", related: "Páginas relacionadas", faq: (n: string) => `${n}: perguntas e respostas`, faqLead: "Respostas diretas sobre como esta ferramenta funciona, o que ela faz e não faz, e para onde vão os seus dados.", saveH: "Quer salvar o seu trabalho online?", saveP: "As ferramentas são grátis e funcionam sem conta. Uma conta grátis adiciona eventos salvos online, links de convite para jogadores e check-in ao vivo na entrada do evento.", signup: "Criar uma conta grátis" },
} as const;

export interface ToolPage {
  slug: string;
  name: string;
  h1: string;
  lead: string;
  /** A short plain-words opening (about two lines) shown in the header instead of `lead`, so the button comes before any jargon. `lead` stays the description for search engines and structured data. */
  intro?: string;
  /** Print-shop and tech words used on the page, explained once in a small note under the tool. */
  glossary?: { term: string; meaning: string }[];
  benefits: { title: string; body: string }[];
  steps: string[];
  faq: { q: string; a: string }[];
  /** Guides to link to from the page, by slug. */
  guides?: string[];
  /** The label for the section that holds the tool itself. */
  useHeading?: string;
  /** The page address when it is not /tools/<slug>/ (the game points table pages). */
  path?: string;
  /** The parent in the breadcrumb when it is not the tools index. */
  crumb?: { name: string; href: string };
  /** The name as it reads inside a heading ("Why use this ..."), when the full name is long or starts with a capital that must stay. */
  shortName?: string;
  /** Other pages worth a link from this one: shown as "Related pages". Every href must be a real page. */
  related?: { href: string; label: string; blurb: string }[];
  /** A small table shown under "Why use this ...", as plain HTML: caption, header row and rows. */
  table?: { caption: string; head: string[]; rows: string[][] };
  /** The date (YYYY-MM-DD) the text of this page last really changed. Used as the sitemap lastmod. */
  updated?: string;
  /** Extra content sections, shown after the steps. Text may hold [label](/path/) links. */
  sections?: ToolSection[];
  /** Also emit HowTo structured data from the steps. */
  howTo?: boolean;
  /** The share card for this page, as a path under /og/. Defaults to the site card. */
  og?: string;
}

export interface ToolSection {
  id: string; h2: string; paras?: string[]; items?: string[]; note?: string;
  table?: { caption: string; head: string[]; rows: string[][] };
  images?: { src: string; alt: string; caption: string; w: number; h: number }[];
}

/** The tool's name as it reads in a heading: the short name when set, else the name without a leading "Free", first letter lowercased. */
export const headingName = (t: ToolPage) => t.shortName ?? ((n) => n.charAt(0).toLowerCase() + n.slice(1))(t.name.replace(/^Free /, ""));

/**
 * A public page for one tool: what it does, the working tool itself (free, no account) and the questions people ask.
 * It is plain server-rendered HTML, so search engines read the full text; the tool loads on top of it.
 */
export default function ToolLanding({ t, children, lang = "en", trust }: { t: ToolPage; children?: React.ReactNode; lang?: UiLang; /** The points table pages: the "who runs this" line, the scoring rules as static text, the "Safe to use" box and the Person schema. */ trust?: { rules: ScoringRules } }) {
  const u = UI[lang];
  const path = t.path ?? `/tools/${t.slug}/`, url = `${SITE_URL}${path}`, crumb = t.crumb ?? { name: "Tools", href: "/tools/" };
  const guides = (t.guides ?? []).map((s) => GUIDES.find((g) => g.slug === s)).filter((g): g is NonNullable<typeof g> => !!g);
  const hn = headingName(t);
  return (
    <article className="space-y-12">
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "SoftwareApplication", ...(trust ? { "@id": `${url}#app` } : {}), name: t.name, applicationCategory: "UtilitiesApplication", operatingSystem: "Web", url, description: t.lead, inLanguage: u.inLanguage, isAccessibleForFree: true, browserRequirements: "Requires JavaScript. Works in any current browser.", featureList: t.benefits.map((b) => b.title), offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          ...(trust ? { author: { "@id": OWNER.personId }, creator: { "@id": OWNER.personId }, publisher: { "@id": ORG_ID } } : {}) },
        ...(trust ? [personJsonLd()] : []),
        ...(t.howTo ? [{ "@context": "https://schema.org", "@type": "HowTo", name: u.howToName(hn), description: t.lead, step: t.steps.map((x, i) => ({ "@type": "HowToStep", position: i + 1, name: x.split(/[.,:]/)[0], text: x })) }] : []),
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: u.home, item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: crumb.name, item: `${SITE_URL}${crumb.href}` }, { "@type": "ListItem", position: 3, name: t.name, item: url }] },
      ]} />
      <header className="no-print">
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href={crumb.href} className="hover:text-zinc-200">{crumb.name}</Link> / {t.name}</nav>
        <h1 className="mt-3 text-3xl font-black text-zinc-50 sm:text-5xl">{t.h1}</h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-200">{t.intro ?? t.lead}</p>
        {trust && <WhoRuns lang={lang} />}
      </header>

      {children && <section aria-labelledby="use"><h2 id="use" className="mb-4 font-display text-2xl font-bold text-white">{t.useHeading ?? u.use}</h2>{children}</section>}

      {t.glossary && t.glossary.length > 0 && (
        <aside className="no-print -mt-6 max-w-3xl rounded-xl border border-white/[0.14] bg-[#0a0b0d] p-4 text-sm text-zinc-300" aria-labelledby="words">
          <h2 id="words" className="font-semibold text-white">{u.words}</h2>
          <dl className="mt-2 space-y-1.5">{t.glossary.map((g) => <div key={g.term}><dt className="inline font-semibold text-zinc-100">{g.term}</dt><dd className="inline">{": "}{g.meaning}</dd></div>)}</dl>
        </aside>
      )}

      {trust && <><ScoringRulesBlock rules={trust.rules} lang={lang} /><SafeToUse lang={lang} /></>}

      <section className="no-print" aria-labelledby="why"><h2 id="why" className="font-display text-2xl font-bold text-white">{u.why(hn)}</h2>
        <Stagger className="mt-4 grid gap-4 md:grid-cols-3">{t.benefits.map((b) => <Item key={b.title}><div className="card h-full"><h3 className="font-display font-bold text-white">{b.title}</h3><p className="mt-2 text-sm text-zinc-300">{b.body}</p></div></Item>)}</Stagger>
      </section>

      {t.table && (
        <section className="no-print" aria-label={t.table.caption}>
          <ScrollTable label={t.table.caption} caption={t.table.caption} head={t.table.head} rows={t.table.rows} />
        </section>
      )}

      <section className="no-print" aria-labelledby="how"><h2 id="how" className="font-display text-2xl font-bold text-white">{u.how(hn)}</h2>
        <Stagger className="mt-4 space-y-3"><ol className="contents">{t.steps.map((s, i) => <li key={s} className="list-none"><Item><div className="card flex gap-4 !p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan font-bold text-ink">{i + 1}</span><span className="text-zinc-200">{s}</span></div></Item></li>)}</ol></Stagger>
      </section>

      {(t.sections ?? []).map((x) => (
        <section key={x.id} className="no-print space-y-3" aria-labelledby={x.id}><h2 id={x.id} className="font-display text-2xl font-bold text-white">{x.h2}</h2>
          {x.paras?.map((p) => <p key={p} className="max-w-3xl leading-7 text-zinc-300"><Inline text={p} /></p>)}
          {x.items && <ul className="max-w-3xl list-disc space-y-1.5 pl-5 leading-7 text-zinc-300 marker:text-cyan">{x.items.map((i) => <li key={i}><Inline text={i} /></li>)}</ul>}
          {x.images && (
            <div className="grid gap-4 sm:grid-cols-3">{x.images.map((im) => (
              <figure key={im.src} className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.src} alt={im.alt} width={im.w} height={im.h} loading="lazy" decoding="async" className="h-auto w-full rounded-xl border border-white/10" />
                <figcaption className="text-sm text-zinc-400">{im.caption}</figcaption>
              </figure>
            ))}</div>
          )}
          {x.table && <ScrollTable label={x.table.caption} caption={x.table.caption} head={x.table.head} rows={x.table.rows} />}
          {x.note && <p className="max-w-3xl text-sm text-zinc-400"><Inline text={x.note} /></p>}
        </section>
      ))}

      {guides.length > 0 && (
        <section className="no-print" aria-labelledby="read"><h2 id="read" className="font-display text-2xl font-bold text-white">{u.guides}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">{guides.map((g) => <li key={g.slug}><Link href={`/guides/${g.slug}/`} className="card block h-full !p-4"><span className="tag">{g.tag}</span><span className="mt-2 block font-semibold text-white">{g.title}</span></Link></li>)}</ul>
        </section>
      )}

      {t.related && t.related.length > 0 && (
        <section className="no-print" aria-labelledby="related"><h2 id="related" className="font-display text-2xl font-bold text-white">{u.related}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">{t.related.map((r) => <li key={r.href}><Link href={r.href} className="card block h-full !p-4"><span className="block font-semibold text-white">{r.label}</span><span className="mt-1 block text-sm text-zinc-300">{r.blurb}</span></Link></li>)}</ul>
        </section>
      )}

      <section className="no-print grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10" aria-labelledby="faq">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="faq" className="font-display text-2xl font-bold text-white">{u.faq(((n) => n.charAt(0).toUpperCase() + n.slice(1))(t.shortName ?? t.name))}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{u.faqLead}</p>
        </div>
        <Faq items={t.faq} className="max-w-3xl" />
      </section>

      <section className="card text-center"><h2 className="font-display text-xl font-bold text-white">{u.saveH}</h2><p className="mt-1 text-sm text-zinc-300">{u.saveP}</p><div className="mt-4 flex justify-center gap-3"><Link href="/signup/" className="btn">{u.signup}</Link></div></section>
    </article>
  );
}
