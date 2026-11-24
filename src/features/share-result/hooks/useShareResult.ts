"use client";

import { useCallback, useEffect, useState } from "react";
import { cardFontVars } from "@/components/idcard/fonts";
import { shareOrDownload } from "@/components/display/shareFile";
import type { Payload } from "@/lib/display";
import { loadExtras } from "@/lib/extras-store";
import type { UiLang } from "@/lib/pt-br";
import { renderShareCard, whatsappLink, type ShareFormat } from "@/lib/share-cards";
import { toolCopy } from "@/lib/tool-copy";
import { resultShare } from "@/features/share-result/domain";

export interface ShareMessage { ok: boolean; text: string }

/**
 * One tap: draw the result as a picture (portrait post or story) and hand it on. On a phone that can share files the share sheet opens with
 * the picture and the message; anywhere else the picture is saved and the message is copied. The message is copied at the start of the
 * tap, while the browser still counts it as the person's action, because drawing the picture takes a moment.
 * The same block also copies the text version and opens WhatsApp with it, so a tool has one share block, not three.
 */
export function useShareResult(payload: Payload | null, what: string, path: string, lang: UiLang = "en") {
  const c = toolCopy(lang);
  const [format, setFormat] = useState<ShareFormat>("portrait");
  const [theme, setTheme] = useState("dark");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<ShareMessage | null>(null);
  // The text version reads saved sponsors from this browser, so it is worked out after load (the static HTML has no link yet).
  const [text, setText] = useState("");
  useEffect(() => { setText(payload ? resultShare(payload, { path, what, format: "portrait", lang, extras: loadExtras() }).text : ""); }, [payload, path, what, lang]);

  const share = useCallback(async () => {
    if (!payload || busy) return;
    setBusy(true); setMsg(null);
    const extras = loadExtras();
    const s = resultShare(payload, { path, what, format, lang, extras });
    const phone = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
    const copying: Promise<boolean> = phone || !navigator.clipboard ? Promise.resolve(false) : navigator.clipboard.writeText(s.text).then(() => true, () => false);
    try {
      const blob = await renderShareCard(payload, { format, theme, extras, fontClass: cardFontVars, footer: s.footer });
      const r = await shareOrDownload(blob, s.fileName, s.title, s.text);
      if (r === "cancelled") setMsg(null);
      else if (r === "shared") setMsg({ ok: true, text: c.quick.shared });
      else setMsg({ ok: true, text: (await copying) ? c.quick.savedCopied : c.quick.savedOnly });
    } catch {
      setMsg({ ok: false, text: c.quick.failed });
    }
    setBusy(false);
  }, [payload, busy, path, what, format, theme, lang, c]);

  const copyText = useCallback(async () => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); setMsg({ ok: true, text: c.share.textCopied }); }
    catch { setMsg({ ok: false, text: c.share.textFail }); }
  }, [text, c]);

  return { format, setFormat, theme, setTheme, busy, msg, share, copyText, whatsapp: text ? whatsappLink(text) : "" };
}
