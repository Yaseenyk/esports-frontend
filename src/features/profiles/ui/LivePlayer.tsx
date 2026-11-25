"use client";

import { useEffect } from "react";
import { EmptyState, FindNext } from "@/features/shared/ui/States";
import type { PlayerPage } from "@/features/profiles/domain";
import { usePlayerPage } from "@/features/profiles/hooks/useProfiles";
import { PlayerView } from "@/features/profiles/ui/PlayerView";
import { PlayerReportBox } from "@/features/profiles/ui/ProfileScreens";

/** Adds (or tightens) the robots tag in the open page: a page that is gone must not stay indexable while it waits for the next build. */
function markNoindex(): void {
  let m = document.head.querySelector('meta[name="robots"]');
  if (!m) { m = document.createElement("meta"); m.setAttribute("name", "robots"); document.head.appendChild(m); }
  m.setAttribute("content", "noindex, nofollow");
}

/**
 * The pre-rendered player page's live check. The HTML ships the profile as it was at build time (for search engines and a fast first paint); in the
 * browser the page then reads the live profile once and shows THAT, so a field the player hid, or a change of mind, applies at once instead of at the
 * next daily build. When the live read says the page is gone (private, search off does not matter here, hidden, deleted, renamed) the old text is
 * replaced by a "not available" notice and the page marks itself noindex. A network error keeps the built text.
 */
export function LivePlayer({ initial, linkable }: { initial: PlayerPage & { slug: string }; linkable: string[] }) {
  const res = usePlayerPage(initial.slug);
  const gone = res.phase === "unavailable" || (res.phase === "ready" && (!res.data || res.data.slug !== initial.slug));
  useEffect(() => { if (gone) markNoindex(); }, [gone]);
  const known = new Set(linkable);
  if (gone) return <div className="mx-auto max-w-3xl"><EmptyState asPage title="This player page is not available" body="The player has made this page private, changed its address, or it is under review. It will leave search results soon." action={<FindNext />} /></div>;
  const p = res.phase === "ready" && res.data ? { ...res.data, slug: initial.slug } : initial;
  return <PlayerView p={p} linkable={(s) => known.has(s)} footer={<PlayerReportBox slug={initial.slug} />} />;
}
