"use client";

import { useCallback, useMemo, useState } from "react";
import { sendEvent } from "@/lib/track";
import { nameProblem, variants, type Frame, type Game, type Lang, type TagStyle } from "@/features/name-style/domain";
import { NAME_STYLE_COPY } from "@/features/name-style/copy";

/** Counts one copied name per visit for the page's tool. Only the tool id is sent, never the name. */
export function reportCopy(game: Game): void {
  if (game === "bgmi") sendEvent("tool_complete", "bgmi-name-style");
  else sendEvent("tool_complete", "free-fire-name-style");
}

/** Copies text and returns the status line to show. */
export async function copyText(text: string, lang: Lang, game: Game): Promise<{ ok: boolean; text: string }> {
  const c = NAME_STYLE_COPY[lang];
  try { await navigator.clipboard.writeText(text); reportCopy(game); return { ok: true, text: c.copied(text) }; }
  catch { return { ok: false, text: c.copyFail }; }
}

/** The generator's state: the typed name, the optional clan tag, the frame and every style of the name. Nothing is stored or sent. */
export function useNameStyle(game: Game, lang: Lang) {
  const c = NAME_STYLE_COPY[lang];
  const [name, setName] = useState(c.example);
  const [useTag, setUseTag] = useState(false);
  const [tag, setTag] = useState("");
  const [tagStyle, setTagStyle] = useState<TagStyle>("bar");
  const [frame, setFrame] = useState<Frame>("curl");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const t = useTag ? tag : "";
  const problem = nameProblem(name, t);
  const rows = useMemo(() => (problem ? [] : variants(name, frame, t, tagStyle)), [problem, name, frame, t, tagStyle]);
  const copy = useCallback(async (text: string) => { if (text) setMsg(await copyText(text, lang, game)); }, [lang, game]);
  return { name, setName, useTag, setUseTag, tag, setTag, tagStyle, setTagStyle, frame, setFrame, problem, rows, copy, msg };
}
