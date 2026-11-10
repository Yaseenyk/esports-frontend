import type { Metadata } from "next";
import CertificateMaker from "@/components/tools/CertificateMaker";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["certificates"]!;
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/certificates/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/certificates/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><CertificateMaker /></ToolLanding>;
}
