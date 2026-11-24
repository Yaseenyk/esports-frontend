import { loadCommunityStatus } from "@/features/community/services/build-data";
import TrustIsland from "@/features/community/ui/TrustIsland";

/**
 * Server slot for a tournament page: emits the trust island ONLY when the API had flag v3.trust on at build time. With the flag off nothing is
 * rendered and nothing is fetched in the browser.
 */
export default async function TrustSlot({ slug }: { slug: string }) {
  const on = (await loadCommunityStatus()).trust;
  return on ? <TrustIsland slug={slug} /> : null;
}
