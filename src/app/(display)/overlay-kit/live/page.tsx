import type { Metadata } from "next";
import OverlayLive from "@/features/overlay-kit/ui/OverlayLive";

// The OBS browser source of the overlay kit. Settings come from the # part of the link. Never for search engines.
// Behind the overlay kit flag (src/features/overlay-kit/flag.ts): with the flag off, scripts/prune-v3.mjs deletes this page from ./out.
export const metadata: Metadata = { title: "OBS overlay", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <h1 className="sr-only">OBS overlay</h1>
      <OverlayLive />
    </>
  );
}
