import type { Metadata } from "next";
import PosterMaker from "@/components/tools/PosterMaker";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["poster"]!;
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/poster/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/poster/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><PosterMaker /></ToolLanding>;
}
