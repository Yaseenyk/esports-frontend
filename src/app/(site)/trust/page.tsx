import type { Metadata } from "next";
import { loadCommunityStatus, PRUNE_MARKER_ID } from "@/features/community/services/build-data";
import TrustScreen from "@/features/community/ui/TrustScreen";

export const metadata: Metadata = { title: "Organiser trust score" };

/** /trust/?t=<tournament slug>. Emitted only while flag v3.trust was on at build time (otherwise scripts/prune-community.mjs deletes it). */
export default async function Page() {
  if (!(await loadCommunityStatus()).trust) return <script type="application/json" id={PRUNE_MARKER_ID} dangerouslySetInnerHTML={{ __html: '{"route":"trust"}' }} />;
  return <div className="mx-auto max-w-3xl"><TrustScreen /></div>;
}
