import Link from "next/link";
import JsonLd from "./JsonLd";
import { SITE_URL } from "@/lib/site";

/** A plain text page (about, privacy, terms): a heading, an updated date and readable sections. */
export default function TextPage({ title, path, updated, intro, children }: { title: string; path: string; updated: string; intro: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: title, item: `${SITE_URL}${path}` }] }} />
      <header>
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><Link href="/" className="hover:text-zinc-200">Home</Link> / {title}</nav>
        <h1 className="mt-3 text-3xl font-black text-zinc-50 sm:text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-zinc-400">Last updated {new Date(updated + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        <p className="mt-4 text-lg leading-relaxed text-zinc-200">{intro}</p>
      </header>
      <div className="space-y-6 leading-relaxed text-zinc-200 [&_h2]:mt-2 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:marker:text-cyan [&_a]:text-cyan [&_a]:underline">{children}</div>
    </article>
  );
}
