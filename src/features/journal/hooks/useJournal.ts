"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { explainFailure } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import { clearJournal, deleteEntry, fetchJournal, postEntry, putEntry } from "@/features/journal/services/journal.api";
import { buckets, csvFileName, draftBody, draftOf, draftProblems, emptyDraft, journalCsv, localDay, summarise, type Draft, type DraftField, type JournalEntry, type Period } from "@/features/journal/domain";

/**
 * The private match journal: list, add, edit, delete, clear, progress and CSV. Every write goes to the owner-only API; the CSV is made in this browser.
 * Phase "unavailable" = flag off (404): the screen says so and nothing else is called.
 */
export function useJournal() {
  const res = useResource(fetchJournal, []);
  const [items, setItems] = useState<JournalEntry[]>([]);
  const [cap, setCap] = useState(2000);
  const today = useMemo(() => localDay(), []);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(localDay()));
  const [editing, setEditing] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [period, setPeriod] = useState<Period>("week");
  const [game, setGame] = useState("");

  // Copy the loaded list once per load (the resource object itself is new on every render; its data is not).
  const loaded = res.phase === "ready" ? res.data : null;
  useEffect(() => { if (loaded) { setItems(loaded.items); setCap(loaded.cap); } }, [loaded]);

  const problems = draftProblems(draft, today);
  const setField = (k: DraftField, v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const sorted = useMemo(() => [...items].sort((a, b) => b.playedOn.localeCompare(a.playedOn) || (b.createdAt ?? "").localeCompare(a.createdAt ?? "")), [items]);

  const save = useCallback(async () => {
    setTouched(true);
    if (Object.keys(draftProblems(draft, today)).length) return false;
    setBusy("save"); setError(""); setNotice("");
    const r = editing ? await putEntry(editing, draftBody(draft)) : await postEntry(draftBody(draft));
    setBusy("");
    if (!r.ok || !r.data) { setError(r.ok ? "The server sent an answer this page could not read." : explainFailure(r.failure)); return false; }
    const e = r.data;
    setItems((xs) => (editing ? xs.map((x) => (x.id === e.id ? e : x)) : [e, ...xs]));
    setNotice(editing ? "Match updated." : "Match saved to your journal.");
    setEditing(null); setTouched(false);
    setDraft((d) => ({ ...emptyDraft(today, d.game), mode: d.mode, map: "" }));
    return true;
  }, [draft, editing, today]);

  const edit = (e: JournalEntry) => { setEditing(e.id); setDraft(draftOf(e)); setTouched(false); setNotice(""); setError(""); };
  const cancelEdit = () => { setEditing(null); setDraft(emptyDraft(today, draft.game)); setTouched(false); };

  const remove = useCallback(async (id: string) => {
    setBusy(`del:${id}`); setError(""); setNotice("");
    const r = await deleteEntry(id);
    setBusy("");
    if (!r.ok) { setError(explainFailure(r.failure)); return; }
    setItems((xs) => xs.filter((x) => x.id !== id));
    if (editing === id) setEditing(null);
    setNotice("Match deleted.");
  }, [editing]);

  const clearAll = useCallback(async () => {
    setBusy("clear"); setError(""); setNotice("");
    const r = await clearJournal();
    setBusy("");
    if (!r.ok) { setError(explainFailure(r.failure)); return; }
    setItems([]); setEditing(null);
    setNotice(`Deleted ${r.data.deleted} match${r.data.deleted === 1 ? "" : "es"}. Your journal is empty.`);
  }, []);

  const exportCsv = () => {
    const blob = new Blob([journalCsv(items)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = csvFileName(today);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const progress = useMemo(() => buckets(items, period, game), [items, period, game]);
  const totals = useMemo(() => summarise(game ? items.filter((x) => x.game === game) : items), [items, game]);

  return {
    res, items: sorted, cap, today, draft, setField, problems: touched ? problems : {}, save, editing, edit, cancelEdit, remove, clearAll, exportCsv,
    busy, error, notice, period, setPeriod, game, setGame, progress, totals,
  };
}

const NO_ENTRIES: JournalEntry[] = [];
/** Whether the journal is open for this account (one read; "unavailable" while the flag is off), and how many matches it holds. `items` is stable between renders. */
export function useJournalAvailable() {
  const res = useResource(fetchJournal, []);
  return res.phase === "ready" ? { on: true, count: res.data.items.length, items: res.data.items } : { on: false, count: 0, items: NO_ENTRIES };
}
