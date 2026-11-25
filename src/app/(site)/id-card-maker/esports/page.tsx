import type { Metadata } from "next";
import StudioEmbed from "@/components/tools/StudioEmbed";
import ToolLanding from "@/components/seo/ToolLanding";
import { ESPORTS_PAGE as t } from "@/lib/esports-id-page";
import { pageTitle } from "@/lib/schema";

const og = t.og ?? "/og.png";
export const metadata: Metadata = {
  title: pageTitle(t.title), description: t.description, alternates: { canonical: t.path },
  openGraph: { title: t.title, description: t.description, url: t.path, images: [og] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: [og] },
};

export default function Page() {
  return <ToolLanding t={t}><StudioEmbed /></ToolLanding>;
}
