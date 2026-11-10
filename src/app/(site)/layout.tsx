import HubNav from "@/components/HubNav";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

/** The public website: server-rendered at build time (static HTML), so every page is fully readable by search engines. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "Organization", name: "Esports Hub", url: SITE_URL, logo: `${SITE_URL}/icon-512.png` },
        { "@context": "https://schema.org", "@type": "WebSite", name: "Esports Hub", url: SITE_URL },
      ]} />
      <div className="no-print border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-200">
        <span className="sm:hidden">Prototype: all data is made up.</span><span className="hidden sm:inline">Interface prototype. Every name, event and community here is made-up sample data.</span>
      </div>
      <HubNav />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:py-12">{children}</main>
      <footer className="no-print mt-16 border-t border-white/10 px-4 py-8 text-center text-sm text-zinc-400">
        Esports Hub is an independent project and is not affiliated with any game publisher. Game names and logos are trademarks of their owners and are used only to identify the games.
      </footer>
    </>
  );
}
