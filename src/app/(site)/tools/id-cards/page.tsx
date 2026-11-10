import type { Metadata } from "next";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["id-cards"]!;
export const metadata: Metadata = { title: t.title, description: t.description, alternates: { canonical: "/tools/id-cards/" }, openGraph: { title: t.title, description: t.description, url: "/tools/id-cards/" } };

export default function Page() {
  return <ToolLanding t={t} />;
}
