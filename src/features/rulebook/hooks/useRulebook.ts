"use client";

import { useState } from "react";
import { downloadBlob } from "@/lib/idcard/download";
import { sendEvent } from "@/lib/track";
import { footerLine } from "@/lib/share-cards";
import { DEFAULT_INPUT, GAMES, buildRulebook, rulebookFileName, type GameId, type RulebookInput } from "@/features/rulebook/domain";
import { rulebookToPdf } from "@/features/rulebook/pdf";

export const RULEBOOK_PATH = "/tools/rulebook/";

/**
 * The form, the generated text and the organiser's own edits. While the text has not been edited it follows the form; once edited,
 * the form no longer overwrites it until the organiser asks to rebuild. Nothing is saved: download the PDF or copy the text.
 */
export function useRulebook() {
  const [input, setInput] = useState<RulebookInput>(DEFAULT_INPUT);
  const [edited, setEdited] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const generated = buildRulebook(input);
  const text = edited ?? generated;

  const set = <K extends keyof RulebookInput>(k: K, v: RulebookInput[K]) => setInput((x) => ({ ...x, [k]: v }));
  const setGame = (g: GameId) => setInput((x) => ({ ...x, game: g, format: GAMES.find((y) => y.id === g)!.format }));
  const setConduct = (k: keyof RulebookInput["conduct"], v: boolean) => setInput((x) => ({ ...x, conduct: { ...x.conduct, [k]: v } }));
  const edit = (t: string) => setEdited(t);
  const rebuild = () => setEdited(null);

  const pdf = async () => {
    if (busy) return;
    setBusy(true); setMsg(null);
    try {
      downloadBlob(await rulebookToPdf(text, `Template, not official rules · ${footerLine(RULEBOOK_PATH)}`), rulebookFileName(input.eventName)); sendEvent("tool_complete", "rulebook");
      setMsg({ ok: true, text: "PDF saved. Check every [bracket] is filled before you share it." });
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "The PDF could not be made. Try again." }); }
    setBusy(false);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); sendEvent("tool_complete", "rulebook"); setMsg({ ok: true, text: "Text copied. Paste it into a document, a Discord post or WhatsApp." }); }
    catch { setMsg({ ok: false, text: "Could not copy here. Select the text and copy it yourself." }); }
  };
  const left = (text.match(/\[[^\]]+\]/g) ?? []).length;

  return { input, set, setGame, setConduct, text, edited: edited !== null, edit, rebuild, pdf, copy, busy, msg, left };
}
