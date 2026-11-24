"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cardFontVars } from "@/components/idcard/fonts";
import { shareOrDownload } from "@/components/display/shareFile";
import { renderShareCard, shareFileName, type ShareFormat } from "@/lib/share-cards";
import { useResource } from "@/features/shared/hooks/useResource";
import { eventLoad, useEventIdParam } from "@/features/shared/hooks/useEventIdParam";
import { buildRecap, recapTargets, type RecapTarget } from "@/features/match-recap/recap";
import { fetchRecapFacts } from "@/features/match-recap/services/recap.api";

export const targetKey = (t: RecapTarget): string => (t.kind === "br" ? `br:${t.matchNo}` : `m:${t.id}`);

/**
 * The recap for one match: the template text (editable before sharing), and a picture drawn by the share-card renderer from the same entered
 * results. Editing changes only the message; the picture always shows the results as entered.
 */
export function useRecap() {
  const eventId = useEventIdParam();
  const res = useResource(() => eventLoad(eventId, fetchRecapFacts), [eventId]);
  const facts = res.phase === "ready" ? res.data : null;
  const targets = useMemo(() => (facts ? recapTargets(facts) : []), [facts]);
  const [chosen, setChosen] = useState("");
  const target = targets.find((t) => targetKey(t.target) === chosen)?.target ?? targets[0]?.target ?? null;
  const recap = useMemo(() => (facts && target ? buildRecap(facts, target) : null), [facts, target]);
  const [text, setText] = useState("");
  const [format, setFormat] = useState<ShareFormat>("portrait");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // A new match (or fresh facts) starts from its template text again.
  useEffect(() => { setText(recap?.text ?? ""); setMsg(null); }, [recap]);
  const edited = !!recap && text !== recap.text;
  const reset = useCallback(() => setText(recap?.text ?? ""), [recap]);

  const copy = useCallback(async () => {
    try { await navigator.clipboard.writeText(text); setMsg({ ok: true, text: "Recap copied." }); } catch { setMsg({ ok: false, text: "Copying is blocked in this browser. Select the text and copy it." }); }
  }, [text]);

  const share = useCallback(async () => {
    if (!recap || busy) return;
    setBusy(true); setMsg(null);
    try {
      const blob = await renderShareCard(recap.payload, { format, theme: "dark", fontClass: cardFontVars, footer: recap.footer });
      const r = await shareOrDownload(blob, shareFileName(recap.title, format), recap.title, text);
      if (r === "shared") setMsg({ ok: true, text: "Shared." });
      else if (r === "downloaded") {
        const copied = await navigator.clipboard?.writeText(text).then(() => true, () => false);
        setMsg({ ok: true, text: copied ? "Picture saved and recap copied." : "Picture saved." });
      }
    } catch {
      setMsg({ ok: false, text: "The picture could not be made in this browser." });
    }
    setBusy(false);
  }, [recap, busy, format, text]);

  return { eventId, res, facts, targets, target, setChosen, recap, text, setText, edited, reset, format, setFormat, busy, msg, copy, share };
}
