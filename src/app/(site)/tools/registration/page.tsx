import type { Metadata } from "next";
import RegistrationTemplate from "@/components/tools/RegistrationTemplate";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["registration"]!;
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/registration/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/registration/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><RegistrationTemplate /></ToolLanding>;
}
