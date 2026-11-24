"use client";

import { useCallback, useState } from "react";
import { cardFontVars } from "@/components/idcard/fonts";
import { shareOrDownload } from "@/components/display/shareFile";
import type { Payload } from "@/lib/display";
import { loadExtras } from "@/lib/extras-store";
import type { UiLang } from "@/lib/pt-br";
import { renderShareCard, type ShareFormat } from "@/lib/share-cards";
import { toolCopy } from "@/lib/tool-copy";
import { resultShare } from "@/features/share-result/domain";

export interface ShareMessage { ok: boolean; text: string }

/**
 * One tap: draw the result as a picture (square post or story) and hand it on. On a phone that can share files the share sheet opens with
 * the picture and the message; anywhere else the picture is saved and the message is copied. The message is copied at the start of the
 * tap, while the browser still counts it as the person's action, because drawing the picture takes a moment.
 */
export function useShareResult(payload: Payload | null, what: string, path: string, lang: UiLang = "en") {
  const c = toolCopy(lang).quick;
  const [format, setFormat] = useState<ShareFormat>("square");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<ShareMessage | null>(null);

  const share = useCallback(async () => {
    if (!payload || busy) return;
    setBusy(true); setMsg(null);
    const extras = loadExtras();
    const s = resultShare(payload, { path, what, format, lang, extras });
    const phone = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
    const copying: Promise<boolean> = phone || !navigator.clipboard ? Promise.resolve(false) : navigator.clipboard.writeText(s.text).then(() => true, () => false);
    try {
      const blob = await renderShareCard(payload, { format, theme: "dark", extras, fontClass: cardFontVars, footer: s.footer });
      const r = await shareOrDownload(blob, s.fileName, s.title, s.text);
      if (r === "cancelled") setMsg(null);
      else if (r === "shared") setMsg({ ok: true, text: c.shared });
      else setMsg({ ok: true, text: (await copying) ? c.savedCopied : c.savedOnly });
    } catch {
      setMsg({ ok: false, text: c.failed });
    }
    setBusy(false);
  }, [payload, busy, path, what, format, lang, c]);

  return { format, setFormat, busy, msg, share };
}
