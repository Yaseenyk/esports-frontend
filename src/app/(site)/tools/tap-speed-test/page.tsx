import type { Metadata } from "next";
import ToolLanding from "@/components/seo/ToolLanding";
import Tool from "@/features/reflex/ui/TapLazy";
import { TAP_PAGE as t } from "@/lib/tool-page-players";

const path = "/tools/tap-speed-test/";
export const metadata: Metadata = {
  title: { absolute: t.title }, description: t.description, alternates: { canonical: path },
  openGraph: { title: t.title, description: t.description, url: path, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><Tool /></ToolLanding>;
}
