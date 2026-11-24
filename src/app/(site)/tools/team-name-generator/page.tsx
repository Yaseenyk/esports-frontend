import type { Metadata } from "next";
import ToolLanding from "@/components/seo/ToolLanding";
import Tool from "@/features/team-name/ui/TeamNameLazy";
import { TEAM_NAME_PAGE as t } from "@/lib/tool-page-extra";

export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/team-name-generator/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/team-name-generator/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><Tool /></ToolLanding>;
}
