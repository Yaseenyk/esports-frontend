import type { Metadata } from "next";
import ToolLanding from "@/components/seo/ToolLanding";
import Tool from "@/features/sensitivity/ui/SensitivityLazy";
import { SENSITIVITY_PAGE as t } from "@/lib/tool-page-extra";
import { pageTitle } from "@/lib/schema";

export const metadata: Metadata = {
  title: pageTitle(t.title), description: t.description, alternates: { canonical: "/tools/sensitivity-converter/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/sensitivity-converter/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><Tool /></ToolLanding>;
}
