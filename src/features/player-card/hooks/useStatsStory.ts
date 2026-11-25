"use client";

import { useEffect, useMemo, useState } from "react";
import { useJournalAvailable } from "@/features/journal/hooks/useJournal";
import { summarise } from "@/features/journal/domain";
import { fetchPlayerByCard, fetchPlayerPage } from "@/features/profiles/services/profiles.api";
import type { OwnPlayerPage, PlayerPage } from "@/features/profiles/domain";
import { useResource } from "@/features/shared/hooks/useResource";
import { gameLabel, ROLE_LABELS } from "@/features/shared/games";
import { downloadBlob } from "@/lib/idcard/export";
import { footerLine, type ShareFormat } from "@/lib/share-cards";
import { SITE_URL } from "@/lib/site";
import { renderStory } from "@/features/player-card/render-story";
import { selfLoggedStats, storyFileName, storyQr, verifiedStats, type StoryInput } from "@/features/player-card/story";

const none = () => Promise.resolve({ ok: true as const, data: null as PlayerPage | null });

/**
 * The stats story card. Its numbers are the player's PUBLIC page exactly as a visitor sees it (verified stats, shown badges, hidden fields left out),
 * read from the same endpoint the QR opens. Journal numbers join only when the player ticks the box, in a block labelled Self-logged.
 * The picture is drawn on a canvas here; nothing is uploaded.
 */
export function useStatsStory(page: OwnPlayerPage | null, game: string, role: string) {
  const token = page?.cardPath ? /k=([A-Za-z0-9_-]{22})$/.exec(page.cardPath)?.[1] ?? null : null;
  const pub = useResource(() => (page?.visibility === "public" ? fetchPlayerPage(page.slug) : token && page?.visibility === "unlisted" ? fetchPlayerByCard(token) : none()), [page?.visibility, page?.slug, token]);
  const journal = useJournalAvailable();
  const [format, setFormat] = useState<ShareFormat>("story");
  const [withSelf, setWithSelf] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const p = pub.phase === "ready" ? pub.data : null;

  const input = useMemo<StoryInput | null>(() => {
    if (!p || !page) return null;
    const team = p.teamName ?? "";
    const g = game && p.games.some((x) => x.game === game) ? game : p.games[0]?.game ?? "";
    const subtitle = [g ? gameLabel(g) : "", role ? ROLE_LABELS[role] ?? role : "", team].filter(Boolean).join(" · ");
    const self = withSelf && journal.on ? selfLoggedStats(summarise(g ? journal.items.filter((e) => e.game === g) : journal.items)) : null;
    return {
      handle: p.handle, subtitle, verified: verifiedStats(p.stats), badges: p.badges.map((b) => b.title), selfLogged: self && self.length ? self : null,
      qr: storyQr(SITE_URL, page.cardPath, page.visibility === "public" ? page.slug : null), qrCaption: "Scan to open my player page", footer: footerLine("/players/"),
    };
  }, [p, page, game, role, withSelf, journal.on, journal.items]);

  useEffect(() => {
    if (!input) { setPreview(null); return; }
    let live = true, url = "";
    renderStory(input, format).then((b) => { if (!live) return; url = URL.createObjectURL(b); setPreview(url); }).catch(() => live && setError("This browser could not draw the picture."));
    return () => { live = false; if (url) URL.revokeObjectURL(url); };
  }, [input, format]);

  const download = async () => {
    if (!input) return;
    setBusy(true); setError("");
    try { downloadBlob(await renderStory(input, format), storyFileName(input.handle, format)); } catch { setError("This browser could not draw the picture."); } finally { setBusy(false); }
  };

  return { pub, ready: !!input, input, format, setFormat, withSelf, setWithSelf, journalOn: journal.on, journalCount: journal.count, preview, download, busy, error };
}
