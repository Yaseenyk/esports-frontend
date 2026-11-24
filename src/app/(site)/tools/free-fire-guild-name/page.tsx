import type { Metadata } from "next";
import ToolLanding from "@/components/seo/ToolLanding";
import Tool from "@/features/team-name/ui/TeamNameLazy";
import { FF_GUILD_PAGE as t } from "@/lib/tool-page-extra";

export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/free-fire-guild-name/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/free-fire-guild-name/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

/** The team name generator, started on the Free Fire guild preset with stylish versions on. */
export default function Page() {
  return <ToolLanding t={t}><Tool preset="ff-guild" stylish /></ToolLanding>;
}
