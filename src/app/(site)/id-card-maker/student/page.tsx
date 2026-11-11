import type { Metadata } from "next";
import StudioEmbed from "@/components/tools/StudioEmbed";
import ToolLanding from "@/components/seo/ToolLanding";
import { STUDENT_PAGE as t } from "@/lib/student-page";

export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: t.path },
  openGraph: { title: t.title, description: t.description, url: t.path, images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><StudioEmbed /></ToolLanding>;
}
