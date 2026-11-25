import type { Metadata } from "next";
import { pageTitle } from "@/lib/schema";
import ToolLanding from "@/components/seo/ToolLanding";
import Tool from "@/features/reflex/ui/ReactionLazy";
import { REACTION_PAGE as t } from "@/lib/tool-page-players";

const path = "/tools/reaction-time-test/";
export const metadata: Metadata = {
  title: pageTitle(t.title), description: t.description, alternates: { canonical: path },
  openGraph: { title: t.title, description: t.description, url: path, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><Tool /></ToolLanding>;
}
