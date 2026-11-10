import type { Metadata } from "next";
import { Item, Stagger } from "@/components/Motion";
import TiltLink from "@/components/TiltLink";
import JsonLd from "@/components/seo/JsonLd";
import { GUIDES } from "@/content/guides";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Esports event guides for organisers",
  description: "Practical guides for running esports and gaming events: tournament formats, points tables, rules templates, ID cards, gate check-in, streaming and sponsors.",
  alternates: { canonical: "/guides/" },
};

export default function Guides() {
  return (
    <div className="space-y-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Esports event guides", url: `${SITE_URL}/guides/`, hasPart: GUIDES.map((g) => ({ "@type": "Article", headline: g.title, url: `${SITE_URL}/guides/${g.slug}/` })) }} />
      <header>
        <h1 className="text-3xl font-black text-zinc-50 sm:text-5xl">Guides for running esports events</h1>
        <p className="mt-3 max-w-2xl text-lg text-zinc-300">Plain, practical guides for organisers of college, community and club events. Each one ends with a free tool you can use straight away.</p>
      </header>
      <Stagger className="grid gap-4 md:grid-cols-2">
        {GUIDES.map((g) => (
          <Item key={g.slug} className="h-full"><TiltLink href={`/guides/${g.slug}/`} className="h-full">
            <div className="flex items-center justify-between"><span className="tag">{g.tag}</span><span className="text-xs text-zinc-400">{g.minutes} min read</span></div>
            <h2 className="mt-3 font-display text-lg font-bold text-white">{g.title}</h2>
            <p className="mt-1 text-sm text-zinc-300">{g.description}</p>
          </TiltLink></Item>
        ))}
      </Stagger>
    </div>
  );
}
