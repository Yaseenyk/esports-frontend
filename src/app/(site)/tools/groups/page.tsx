import type { Metadata } from "next";
import GroupsTool from "@/components/features/stages/GroupsTool";
import ToolLanding from "@/components/seo/ToolLanding";
import { GROUPS_PAGE } from "@/lib/tool-page-groups";

const t = GROUPS_PAGE;
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/groups/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/groups/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><GroupsTool /></ToolLanding>;
}
