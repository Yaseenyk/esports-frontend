"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { meApi } from "@/lib/api/f-org";
import { EXPORT_CONTAINS, EXPORT_NOT_CONTAINS_FALLBACK, deletionLines, exportFileName, type DeletionPreview } from "@/lib/org";
import { useOrg } from "./OrgContext";

/** Plain wording for why a download or a preview did not work. */
const failText = (e: unknown, what: "export" | "preview"): string => {
  const s = (e as { status?: number })?.status;
  if (s === 429) return "You can download your data 5 times an hour. Wait a while and try again.";
  if (typeof s === "number" && s >= 500) return "The server had a problem. Try again in a moment.";
  if (typeof s === "number") return what === "export" ? "The server did not accept that. Try again later." : "Could not check what would be deleted.";
  return "Could not reach the server. Check your connection.";
};

/** Starts a browser download of a JSON document. Plain DOM, no library; the object URL is released straight after. */
function saveJson(data: unknown, name: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** "Download my data". Shown only when clubs are switched on (the privacy tools ship together with them). */
export function ExportPanel() {
  const { teamOrgs } = useOrg();
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [done, setDone] = useState<{ notIncluded: string[] } | null>(null);
  if (!teamOrgs) return null;
  const go = async () => {
    if (busy) return;
    setBusy(true); setErr(""); setDone(null);
    try {
      const d = await meApi.exportData();
      saveJson(d, exportFileName());
      setDone({ notIncluded: Array.isArray(d.notIncluded) ? d.notIncluded.filter((x): x is string => typeof x === "string").slice(0, 20) : [] });
    } catch (e) { setErr(failText(e, "export")); } finally { setBusy(false); }
  };
  const not = done?.notIncluded.length ? done.notIncluded.join("; ") : EXPORT_NOT_CONTAINS_FALLBACK;
  return (
    <section aria-label="Download my data" className="card space-y-3 !p-4">
      <h2 className="font-display font-bold text-white">Download my data</h2>
      <p className="text-sm text-zinc-300">Get a copy of what we hold about your account, as one file you can open or keep.</p>
      <p className="text-sm text-zinc-300"><strong className="text-zinc-100">In the file:</strong> {EXPORT_CONTAINS}</p>
      <p className="text-sm text-zinc-300"><strong className="text-zinc-100">Not in the file:</strong> {not}.</p>
      <button type="button" className="btn !min-h-11 px-4 text-sm" disabled={busy} onClick={go}>{busy ? "Preparing the file…" : "Download my data"}</button>
      <div aria-live="polite">{done && <p role="status" className="text-sm text-emerald-300">Your file was downloaded. Look in your Downloads folder.</p>}{err && <p role="alert" className="text-sm text-red-300">{err}</p>}</div>
    </section>
  );
}

/** Reads what deleting the account would remove. `enabled` false does nothing (the old screen asks for nothing extra). */
export function useDeletionPreview(enabled: boolean, reloadKey = 0) {
  const [preview, setPreview] = useState<DeletionPreview | null>(null), [error, setError] = useState(""), [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    setLoading(true); setError("");
    meApi.deletionPreview().then((p) => { if (live) setPreview(p); }).catch((e) => { if (live) setError(failText(e, "preview")); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [enabled, reloadKey]);
  return { preview, error, loading };
}

/** The plain list above the delete button. */
export function DeletionPreviewNote({ preview, error, loading }: { preview: DeletionPreview | null; error: string; loading: boolean }) {
  if (loading && !preview) return <p role="status" className="text-sm text-zinc-400">Checking what would be deleted…</p>;
  if (error) return <p role="alert" className="text-sm text-amber-200">{error} You can still delete your account: the server tells you if anything blocks it.</p>;
  if (!preview) return null;
  const lines = deletionLines(preview);
  const names = preview.events.deleted.slice(0, 8).map((e) => e.name);
  return (
    <div role="status" className="space-y-2 rounded-xl border border-amber-500/30 bg-[#0a0b0d] p-3 text-sm text-amber-100">
      {lines.length === 0 ? <p>None of your events will be deleted with your account.</p> : lines.map((l) => <p key={l}>{l}</p>)}
      {names.length > 0 && <p className="text-xs text-zinc-300">Including: {names.join(", ")}{preview.events.deletedCount > names.length ? ` and ${preview.events.deletedCount - names.length} more` : ""}.</p>}
      {preview.clubs.blocking.length > 0 && <p><Link href="/app/org/people/" className="inline-flex min-h-11 items-center text-cyan underline">Open People to hand the club over</Link></p>}
    </div>
  );
}
