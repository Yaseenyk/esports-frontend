import HubNav from "@/components/HubNav";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_DESCRIPTION } from "@/lib/facts";
import { ORG_ID, SITE_URL } from "@/lib/site";

/** The public website: server-rendered at build time (static HTML), so every page is fully readable by search engines. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "Organization", "@id": ORG_ID, name: "Esports Hub", url: SITE_URL, description: SITE_DESCRIPTION, logo: `${SITE_URL}/icon-512.png` },
      ]} />
      <div id="top" />
      <HubNav />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:py-12">{children}</main>
      <SiteFooter />
    </>
  );
}
