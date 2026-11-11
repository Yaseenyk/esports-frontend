import type { Metadata } from "next";
import PrintKits from "@/components/features/printkits/PrintKits";
import ToolLanding from "@/components/seo/ToolLanding";
import { PRINTKITS_PAGE as t } from "@/lib/tool-page-printkits";

export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/print-kits/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/print-kits/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><PrintKits /></ToolLanding>;
}
