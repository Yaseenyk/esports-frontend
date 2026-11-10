import type { Metadata } from "next";
import DoubleElimination from "@/components/tools/DoubleElimination";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["double-elimination"]!;
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/double-elimination/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/double-elimination/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><DoubleElimination /></ToolLanding>;
}
