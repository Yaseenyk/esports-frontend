import type { Metadata } from "next";
import StudioEmbed from "@/components/tools/StudioEmbed";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["id-cards"]!;
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/id-cards/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/id-cards/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><StudioEmbed /></ToolLanding>;
}
