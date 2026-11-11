import type { Metadata } from "next";
import PlanWizard from "@/components/tools/PlanWizard";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["plan"]!;
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/plan/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/plan/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><PlanWizard /></ToolLanding>;
}
