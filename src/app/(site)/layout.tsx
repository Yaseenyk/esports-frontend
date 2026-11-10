import Link from "next/link";
import HubNav from "@/components/HubNav";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

const FOOTER = [
  { title: "Tools", links: [["ID card maker", "/tools/id-cards/"], ["Bracket maker", "/tools/brackets/"], ["Points table calculator", "/tools/points-table/"], ["Round robin generator", "/tools/round-robin/"], ["Match schedule maker", "/tools/schedule/"], ["Certificate maker", "/tools/certificates/"], ["Gate check-in scanner", "/tools/check-in/"]] },
  { title: "Guides", links: [["Run a college tournament", "/guides/run-a-campus-tournament/"], ["Rules template", "/guides/esports-tournament-rules-template/"], ["Tournament formats", "/guides/choosing-a-tournament-format/"], ["All guides", "/guides/"]] },
  { title: "Esports Hub", links: [["About", "/about/"], ["Contact", "/contact/"], ["Privacy policy", "/privacy/"], ["Terms of use", "/terms/"]] },
];

/** The public website: server-rendered at build time (static HTML), so every page is fully readable by search engines. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "Organization", name: "Esports Hub", url: SITE_URL, logo: `${SITE_URL}/icon-512.png` },
        { "@context": "https://schema.org", "@type": "WebSite", name: "Esports Hub", url: SITE_URL, inLanguage: "en-IN" },
      ]} />
      <HubNav />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:py-12">{children}</main>
      <footer className="no-print mt-16 border-t border-white/10 px-4 py-10 text-sm text-zinc-400">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
          {FOOTER.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="font-display font-semibold text-white">{c.title}</p>
              <ul className="mt-3 space-y-2">{c.links.map(([label, href]) => <li key={href}><Link href={href as string} className="hover:text-white">{label}</Link></li>)}</ul>
            </nav>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-6xl border-t border-white/10 pt-6 text-xs">Esports Hub is an independent project and is not affiliated with any game publisher. Game names and logos are trademarks of their owners and are used only to identify the games.</p>
      </footer>
    </>
  );
}
