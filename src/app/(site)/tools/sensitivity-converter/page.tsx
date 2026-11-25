import type { Metadata } from "next";
import PortugueseOffer from "@/components/PortugueseOffer";
import ToolLanding from "@/components/seo/ToolLanding";
import Tool from "@/features/sensitivity/ui/SensitivityLazy";
import { PT_BR_PAGES, hreflangFor } from "@/lib/pt-br";
import { SENSITIVITY_PAGE as t } from "@/lib/tool-page-extra";
import { pageTitle } from "@/lib/schema";

export const metadata: Metadata = {
  title: pageTitle(t.title), description: t.description, alternates: { canonical: "/tools/sensitivity-converter/", languages: hreflangFor("/tools/sensitivity-converter/") },
  openGraph: { title: t.title, description: t.description, url: "/tools/sensitivity-converter/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <><PortugueseOffer href={PT_BR_PAGES["/tools/sensitivity-converter/"]!} /><ToolLanding t={t}><Tool /></ToolLanding></>;
}
