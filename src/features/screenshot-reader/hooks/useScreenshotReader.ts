"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { explainFailure } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import { eventLoad, useEventIdParam } from "@/features/shared/hooks/useEventIdParam";
import { parseResultsText } from "@/features/screenshot-reader/parse";
import { addRow, applySuggestion, cleanUnconfirmed, confirmClean, confirmRow, editRow, fromRead, removeRow, saveBlocker, toSaveBody, unconfirmRow, type ReviewRow, type RowPatch } from "@/features/screenshot-reader/review";
import { ACCEPTED, MAX_FILE_BYTES, fetchShotContext, readScreenshotText, saveShotRows } from "@/features/screenshot-reader/services/screenshots.api";

export type ReadPhase = "idle" | "reading" | "review";

/**
 * Pick a screenshot, read it on this device, check every value, then save. NEVER saves on its own: only the Save button saves, and only when every row
 * is confirmed. The picture stays in this tab (a local preview URL, released when the page closes or a new picture is picked).
 */
export function useScreenshotReader() {
  const eventId = useEventIdParam();
  const ctx = useResource(() => eventLoad(eventId, fetchShotContext), [eventId]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [phase, setPhase] = useState<ReadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [matchNo, setMatchNo] = useState("");
  const [replace, setReplace] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(() => { if (ctx.phase === "ready" && !matchNo) setMatchNo(String(ctx.data.nextMatchNo)); }, [ctx, matchNo]);
  useEffect(() => () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); }, []);

  const pick = useCallback((f: File | null) => {
    setMsg(null);
    if (previewRef.current) { URL.revokeObjectURL(previewRef.current); previewRef.current = null; }
    setPreview(null); setFile(null);
    if (!f) return;
    if (!(ACCEPTED as readonly string[]).includes(f.type)) { setMsg({ ok: false, text: "Pick a PNG, JPEG or WebP screenshot." }); return; }
    if (f.size > MAX_FILE_BYTES) { setMsg({ ok: false, text: "That picture is over 15 MB. Pick a smaller screenshot." }); return; }
    setFile(f);
    previewRef.current = URL.createObjectURL(f);
    setPreview(previewRef.current);
  }, []);

  const read = useCallback(async () => {
    if (!file || phase === "reading") return;
    setPhase("reading"); setProgress(0); setMsg(null);
    try {
      const text = await readScreenshotText(file, setProgress);
      const found = parseResultsText(text, ctx.phase === "ready" ? ctx.data.teams : []);
      setRows(fromRead(found));
      setPhase("review");
      setMsg(found.length ? { ok: true, text: `Found ${found.length} ${found.length === 1 ? "row" : "rows"}. Check each one against the screenshot.` } : { ok: false, text: "No rows could be read. Add them by hand below, or try a clearer screenshot." });
    } catch {
      setPhase(rows.length ? "review" : "idle");
      setMsg({ ok: false, text: "The screenshot could not be read in this browser. You can add the rows by hand." });
    }
  }, [file, phase, ctx, rows.length]);

  const edit = useCallback((id: string, patch: RowPatch) => setRows((r) => editRow(r, id, patch)), []);
  const confirm = useCallback((id: string) => setRows((r) => confirmRow(r, id)), []);
  const unconfirm = useCallback((id: string) => setRows((r) => unconfirmRow(r, id)), []);
  const confirmAll = useCallback(() => setRows((r) => confirmClean(r)), []);
  const cleanCount = cleanUnconfirmed(rows);
  const remove = useCallback((id: string) => setRows((r) => removeRow(r, id)), []);
  const add = useCallback(() => { setRows((r) => addRow(r)); setPhase("review"); }, []);
  const suggest = useCallback((id: string) => setRows((r) => applySuggestion(r, id)), []);

  const existing = ctx.phase === "ready" && ctx.data.matchNumbers.includes(Number(matchNo));
  const blocker = saveBlocker(rows, matchNo) ?? (existing && !replace ? `Match ${matchNo} already has results. Tick Replace to overwrite that match, or change the number.` : null);

  const save = useCallback(async () => {
    if (!eventId || busy || blocker) return;
    setBusy(true); setMsg(null);
    const r = await saveShotRows(eventId, toSaveBody(rows, matchNo, replace));
    setBusy(false);
    if (!r.ok) {
      setMsg({ ok: false, text: r.failure.code === "match_has_results" ? `Match ${matchNo} already has results. Tick Replace to overwrite it.` : r.failure.code === "unconfirmed_rows" ? "Every row must be confirmed before saving." : explainFailure(r.failure) });
      return;
    }
    pick(null); // clears the picture (and any old message) first, so the confirmation below stays on screen
    setRows([]); setPhase("idle"); setReplace(false); setMatchNo("");
    setMsg({ ok: true, text: `Saved ${r.data.saved} ${r.data.saved === 1 ? "row" : "rows"} for match ${r.data.matchNo}.` });
    ctx.reload();
  }, [eventId, busy, blocker, rows, matchNo, replace, pick, ctx]);

  return { eventId, ctx, file, preview, pick, phase, progress, read, rows, edit, confirm, confirmAll, cleanCount, unconfirm, remove, add, suggest, matchNo, setMatchNo, replace, setReplace, existing, blocker, busy, msg, save };
}
