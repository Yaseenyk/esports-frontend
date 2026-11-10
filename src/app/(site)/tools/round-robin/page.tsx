import type { Metadata } from "next";
import RoundRobin from "@/components/tools/RoundRobin";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["round-robin"]!;
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/round-robin/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/round-robin/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><RoundRobin /></ToolLanding>;
}
