import type { Metadata } from "next";
import RunPage from "@/components/features/runofshow/RunPage";

// The read-only list volunteers open from a link. Which event comes from ?t=<token>. Never for search engines.
export const metadata: Metadata = { title: "Run of show", robots: { index: false, follow: false } };

export default function Page() {
  return <RunPage />;
}
