import type { Metadata } from "next";
import EmbedWidget from "@/components/features/embed/EmbedWidget";

// A chrome-free widget for other people's websites, drawn inside an iframe. Which event comes from ?e=<slug>. Never for search engines.
export const metadata: Metadata = { title: "Live on Esports Hub", robots: { index: false, follow: false } };

export default function Page() {
  return <EmbedWidget />;
}
