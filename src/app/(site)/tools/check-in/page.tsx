import type { Metadata } from "next";
import Link from "next/link";
import ToolLanding from "@/components/seo/ToolLanding";
import { TOOL_PAGES } from "@/lib/tool-pages";

const t = TOOL_PAGES["check-in"]!;
export const metadata: Metadata = {
  title: t.title, description: t.description, alternates: { canonical: "/tools/check-in/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/check-in/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><div className="card flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-display text-lg font-bold text-white">Open the gate scanner</p><p className="text-sm text-zinc-300">Scan passes with the phone camera. Use an offline pack, or a gate key for live check-in across several doors.</p></div><Link href="/gate/" className="btn shrink-0">Open the scanner</Link></div></ToolLanding>;
}
