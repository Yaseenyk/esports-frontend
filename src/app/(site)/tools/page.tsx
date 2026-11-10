import type { Metadata } from "next";
import Link from "next/link";
import { Item, Stagger } from "@/components/Motion";
import TiltLink from "@/components/TiltLink";
import JsonLd from "@/components/seo/JsonLd";
import { TOOLS } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free tools for esports and gaming event organisers",
  description: "Free tools for running esports and gaming events: ID card maker, tournament bracket maker, battle royale points table calculator and a QR gate check-in scanner.",
  alternates: { canonical: "/tools/" },
};

export default function Tools() {
  return (
    <div className="space-y-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: "Free tools for event organisers", itemListElement: TOOLS.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `${SITE_URL}${t.href}` })) }} />
      <header>
        <h1 className="text-3xl font-black text-zinc-50 sm:text-5xl">Free tools for event organisers</h1>
        <p className="mt-3 max-w-2xl text-lg text-zinc-300">Everything here is free and works in your browser. You do not need an account to use the tools. An account adds saving events online, invite links for players and live check-in across several doors.</p>
      </header>
      <Stagger className="grid gap-4 md:grid-cols-2">
        {TOOLS.map((t) => (
          <Item key={t.slug} className="h-full"><TiltLink href={t.href} className="h-full">
            <span className="tag !bg-cyan/15 !text-cyan">Free</span>
            <h2 className="mt-3 font-display text-xl font-bold text-white">{t.name}</h2>
            <p className="mt-1 text-sm text-zinc-300">{t.blurb}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-cyan">Open →</span>
          </TiltLink></Item>
        ))}
      </Stagger>
      <p className="text-sm text-zinc-400">New to running an event? Start with the <Link href="/guides/run-a-campus-tournament/" className="text-cyan underline">college tournament guide</Link>.</p>
    </div>
  );
}
