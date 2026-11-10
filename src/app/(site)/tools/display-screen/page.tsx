import type { Metadata } from "next";
import DisplayDemo from "@/components/display/DisplayDemo";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["display-screen"]!;
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/display-screen/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/display-screen/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><DisplayDemo /></ToolLanding>;
}
