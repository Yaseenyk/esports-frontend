import type { Metadata } from "next";
import OverlayPage from "@/components/features/overlay/OverlayPage";

// A browser source for OBS, Streamlabs and YouTube streams. Which event and view come from the link. Never for search engines.
export const metadata: Metadata = { title: "Stream overlay", robots: { index: false, follow: false } };

export default function Page() {
  return <OverlayPage />;
}
