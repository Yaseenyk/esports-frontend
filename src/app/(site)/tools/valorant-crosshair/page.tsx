import type { Metadata } from "next";
import { pageTitle } from "@/lib/schema";
import ToolLanding from "@/components/seo/ToolLanding";
import Tool from "@/features/crosshair/ui/CrosshairLazy";
import { CROSSHAIR_PAGE as t } from "@/lib/tool-page-players";

const path = "/tools/valorant-crosshair/";
export const metadata: Metadata = {
  title: pageTitle(t.title), description: t.description, alternates: { canonical: path },
  openGraph: { title: t.title, description: t.description, url: path, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

/** Shared links (?c=...) load the same static page, whose canonical is this URL, so they never compete in search. */
export default function Page() {
  return <ToolLanding t={t}><Tool /></ToolLanding>;
}
