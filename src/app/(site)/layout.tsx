import HubNav from "@/components/HubNav";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/schema";

/** The public website: server-rendered at build time (static HTML), so every page is fully readable by search engines. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <div id="top" />
      <HubNav />
      <main id="main" className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:py-12">{children}</main>
      <SiteFooter />
    </>
  );
}
