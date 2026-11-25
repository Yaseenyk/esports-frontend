"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { sendEvent } from "@/lib/track";
import { SITE_URL } from "@/lib/site";
import { addFavourite, encodeCode, fresh, parseCode, shareLink, type Favourite, type Lines, type Parsed, type Primary } from "@/features/crosshair/domain";
import { loadFavourites, saveFavourites } from "@/features/crosshair/services/favourites-store";

export const PASTE_ERRORS = {
  empty: "Paste a code to load it.",
  start: "That does not look like a Valorant crosshair code: a code starts with 0; (for example 0;P;c;5;h;0).",
  pairs: "The code is cut short or has a missing value. Copy it again from the game or the page you found it on.",
  value: "One of the values in the code is not valid. Copy it again from the game or the page you found it on.",
} as const;

/** The crosshair builder's state: the parsed code, the pasted text, favourites and the share link. Codes stay in this browser. */
export function useCrosshair() {
  const [value, setValue] = useState<Parsed>(fresh);
  const [paste, setPaste] = useState("");
  const [pasteError, setPasteError] = useState<string | undefined>();
  const [favs, setFavs] = useState<Favourite[]>([]);
  const [favName, setFavName] = useState("");
  const [bg, setBg] = useState<"dark" | "grey" | "light">("grey");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // A shared link (?c=...) opens with that code loaded.
  useEffect(() => {
    setFavs(loadFavourites());
    try {
      const c = new URLSearchParams(window.location.search).get("c");
      if (c) { const r = parseCode(c); if (r.ok) { setValue(r.value); setPaste(c); } else setPasteError(PASTE_ERRORS[r.error]); }
    } catch { /* no query string */ }
  }, []);

  const code = useMemo(() => encodeCode(value), [value]);
  const load = useCallback((text: string) => {
    setPaste(text);
    const r = parseCode(text);
    if (r.ok) { setValue(r.value); setPasteError(undefined); } else setPasteError(text.trim() ? PASTE_ERRORS[r.error] : undefined);
  }, []);

  const set = useCallback(<K extends keyof Primary>(k: K, v: Primary[K]) => setValue((p) => ({ ...p, primary: { ...p.primary, [k]: v } })), []);
  const setColour = useCallback((id: number) => setValue((p) => ({ ...p, primary: { ...p.primary, colour: id, custom: undefined } })), []);
  const setLine = useCallback((which: "inner" | "outer", k: keyof Lines, v: Lines[keyof Lines]) => setValue((p) => ({ ...p, primary: { ...p.primary, [which]: { ...p.primary[which], [k]: v } } })), []);
  const reset = useCallback(() => { setValue(fresh()); setPaste(""); setPasteError(undefined); }, []);

  const write = useCallback(async (text: string, ok: string) => {
    try { await navigator.clipboard.writeText(text); setMsg({ ok: true, text: ok }); return true; }
    catch { setMsg({ ok: false, text: "Could not copy here. Select the text and copy it yourself." }); return false; }
  }, []);
  const copyCode = useCallback(async () => { if (await write(code, "Code copied. In Valorant: Settings > Crosshair > the import arrow next to Crosshair Profile.")) sendEvent("tool_complete", "valorant-crosshair"); }, [code, write]);
  const copyLink = useCallback(() => write(shareLink(SITE_URL, code), "Link copied. It opens this page with your crosshair loaded."), [code, write]);

  const saveFav = useCallback(() => { setFavs((l) => { const n = addFavourite(l, favName, code); saveFavourites(n); return n; }); setFavName(""); setMsg({ ok: true, text: "Saved in this browser." }); }, [favName, code]);
  const removeFav = useCallback((c: string) => setFavs((l) => { const n = l.filter((f) => f.code !== c); saveFavourites(n); return n; }), []);

  return { value, p: value.primary, code, paste, load, pasteError, set, setColour, setLine, reset, copyCode, copyLink, favs, favName, setFavName, saveFav, removeFav, bg, setBg, msg };
}
