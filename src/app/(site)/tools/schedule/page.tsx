import type { Metadata } from "next";
import ScheduleMaker from "@/components/tools/ScheduleMaker";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["schedule"]!;
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/schedule/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/schedule/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><ScheduleMaker /></ToolLanding>;
}
