import type { Metadata } from "next";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["check-in"]!;
export const metadata: Metadata = { title: t.title, description: t.description, alternates: { canonical: "/tools/check-in/" }, openGraph: { title: t.title, description: t.description, url: "/tools/check-in/" } };

export default function Page() {
  return <ToolLanding t={t} />;
}
