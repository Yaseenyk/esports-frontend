"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import type { PanelProps } from "@/components/app/panels";
import ToolStep from "@/components/tools/ToolStep";
import { explain } from "@/lib/api/cloud";
import { runofshow } from "@/lib/api/f-runofshow";
import { LIMITS, STATUS_LABEL, TEMPLATES, firstProblem, fromTemplate, moveItem, newItem, progress, runUrl, shiftItems, sortByTime, toPayload, whenText, type RosItem, type RosLink, type RosStatus } from "@/lib/runofshow";
import ItemRow, { field } from "./ItemRow";

type Load = "loading" | "error" | "ready";
type Msg = { ok: boolean; text: string } | null;

/** Run of show: a timeline of everything that must happen on the day, each item with a time, an owner, a status and notes. */
export default function Panel({ eventId, eventName, role }: PanelProps) {
  const canEdit = role !== "viewer";
  const [load, setLoad] = useState<Load>("loading");
  const [loadErr, setLoadErr] = useState("");
  const [items, setItems] = useState<RosItem[]>([]);
  const [saved, setSaved] = useState<RosItem[]>([]);
  const [link, setLink] = useState<RosLink | null>(null);
  const [fresh, setFresh] = useState<string>("");
  const [showNotes, setShowNotes] = useState(false);
  const [pdfNotes, setPdfNotes] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [undo, setUndo] = useState<{ item: RosItem; index: number } | null>(null);
  const [shift, setShift] = useState("15");
  const canvas = useRef<HTMLCanvasElement>(null);

  const adopt = (s: { items: RosItem[]; link: RosLink | null }) => { setItems(s.items); setSaved(s.items); setLink(s.link); };
  const reload = () => {
    setLoad("loading"); setLoadErr("");
    runofshow.get(eventId).then((s) => { adopt(s); setLoad("ready"); }).catch((e) => { setLoadErr(explain(e)); setLoad("error"); });
  };
  useEffect(() => {
    let alive = true;
    runofshow.get(eventId).then((s) => { if (alive) { adopt(s); setLoad("ready"); } }).catch((e) => { if (alive) { setLoadErr(explain(e)); setLoad("error"); } });
    return () => { alive = false; };
  }, [eventId]);
  useEffect(() => { if (!undo) return; const t = setTimeout(() => setUndo(null), 20_000); return () => clearTimeout(t); }, [undo]);

  const url = fresh && typeof location !== "undefined" ? runUrl(location.origin, fresh) : "";
  useEffect(() => { if (url && canvas.current) QRCode.toCanvas(canvas.current, url, { width: 192, margin: 2 }).catch(() => undefined); }, [url]);

  const dirty = useMemo(() => JSON.stringify(toPayload(items)) !== JSON.stringify(toPayload(saved)), [items, saved]);
  const prog = progress(items);
  const savedIds = useMemo(() => new Set(saved.map((i) => i.id)), [saved]);

  const patch = (id: string, p: Partial<RosItem>) => { setItems((l) => l.map((i) => (i.id === id ? { ...i, ...p } : i))); setMsg(null); };

  const applyTemplate = (id: string) => {
    if (items.length > 0 && !confirm(`This replaces the ${items.length} item${items.length === 1 ? "" : "s"} you have now. Nothing is lost until you press Save, and you can reload the page to get your saved list back. Continue?`)) return;
    setItems(fromTemplate(id)); setUndo(null);
    setMsg({ ok: true, text: "Template added. These are suggestions: change the times, names and wording to match your day, then press Save." });
  };
  const startBlank = () => { if (items.length > 0 && !confirm("Start with an empty list? Your saved list is kept until you press Save.")) return; setItems([newItem()]); setMsg(null); };

  const setStatus = async (item: RosItem, s: RosStatus) => {
    if (s === item.status) return;
    patch(item.id, { status: s });
    if (!savedIds.has(item.id)) return; // a new line is sent with the next Save
    try { await runofshow.setStatus(eventId, item.id, s); setSaved((l) => l.map((i) => (i.id === item.id ? { ...i, status: s } : i))); setMsg({ ok: true, text: `Marked "${item.title.trim() || "item"}" as ${STATUS_LABEL[s].toLowerCase()}.` }); }
    catch (e) { patch(item.id, { status: item.status }); setMsg({ ok: false, text: explain(e) }); }
  };

  const remove = (i: number) => { const item = items[i]!; setItems(items.filter((_, k) => k !== i)); setUndo({ item, index: i }); setMsg(null); };
  const restore = () => { if (!undo) return; const l = items.slice(); l.splice(Math.min(undo.index, l.length), 0, undo.item); setItems(l); setUndo(null); setMsg({ ok: true, text: "Item put back." }); };

  const save = async () => {
    if (busy) return;
    const problem = firstProblem(items);
    if (problem) { setMsg({ ok: false, text: problem }); return; }
    setBusy(true); setMsg(null);
    try { adopt(await runofshow.put(eventId, items)); setUndo(null); setMsg({ ok: true, text: "Saved. Everyone with access to this event sees the new list." }); }
    catch (e) { setMsg({ ok: false, text: explain(e) }); } finally { setBusy(false); }
  };

  const doShift = (sign: 1 | -1) => {
    const n = Math.round(Number(shift));
    if (!Number.isFinite(n) || n < 1 || n > 1440) { setMsg({ ok: false, text: "Type a number of minutes between 1 and 1440." }); return; }
    const r = shiftItems(items, sign * n);
    setItems(r.items);
    setMsg({ ok: !r.clamped, text: r.clamped ? "Everything moved, but nothing can start before 00:00 on the event day, so some items stopped there. Check the times." : `Every item moved ${n} minute${n === 1 ? "" : "s"} ${sign > 0 ? "later" : "earlier"}. Press Save to keep it.` });
  };

  const makeLink = async () => {
    if (busy) return;
    if (link && !confirm("Making a new link stops the old one working. Anyone using the old link will need the new one. Continue?")) return;
    setBusy(true); setMsg(null);
    try { const r = await runofshow.makeLink(eventId, showNotes); setFresh(r.token); setLink({ active: true, showNotes: r.showNotes, createdAt: r.createdAt }); setMsg({ ok: true, text: "Link made. Copy it now: for safety it is only shown on this screen until you leave it." }); }
    catch (e) { setMsg({ ok: false, text: explain(e) }); } finally { setBusy(false); }
  };
  const revoke = async () => {
    if (busy || !confirm("Stop the volunteer link? Anyone who has it will see that it no longer works. You can make a new one later.")) return;
    setBusy(true); setMsg(null);
    try { await runofshow.revokeLink(eventId); setLink(null); setFresh(""); setMsg({ ok: true, text: "The volunteer link has been stopped." }); }
    catch (e) { setMsg({ ok: false, text: explain(e) }); } finally { setBusy(false); }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(url); setMsg({ ok: true, text: "Link copied." }); } catch { setMsg({ ok: false, text: "Could not copy. Select the link and copy it." }); } };

  const pdf = async (open: boolean) => {
    if (busy) return;
    setBusy(true); setMsg(null);
    try {
      const { runOfShowToPdf } = await import("@/lib/runofshow-pdf");
      const blob = await runOfShowToPdf(items, { eventName }, { notes: pdfNotes });
      const href = URL.createObjectURL(blob);
      if (open) window.open(href, "_blank", "noopener");
      else { const a = document.createElement("a"); a.href = href; a.download = "run-of-show.pdf"; a.click(); }
      setTimeout(() => URL.revokeObjectURL(href), 60_000);
      setMsg({ ok: true, text: open ? "The PDF opened in a new tab. Print it from there." : "PDF downloaded." });
    } catch { setMsg({ ok: false, text: "Could not make the PDF. Try again." }); } finally { setBusy(false); }
  };

  const status = <p role="status" aria-live="polite" className={`min-h-5 text-sm ${msg?.ok ? "text-emerald-300" : "text-red-300"}`}>{msg?.text}</p>;
  const shell = (children: React.ReactNode) => (
    <section aria-label="Run of show" className="space-y-4">
      <div><h3 className="font-display text-lg font-bold text-white">Run of show</h3><p className="mt-1 text-sm text-zinc-300">A list of everything that must happen on the day, in time order, with who is responsible for each. Volunteers do not need an account: give each one a name, and share a read-only link.</p></div>
      {children}
    </section>
  );

  if (load === "loading") return shell(<p role="status" className="text-sm text-zinc-400">Loading the run of show…</p>);
  if (load === "error") return shell(<div className="space-y-2"><p role="alert" className="text-sm text-red-300">{loadErr}</p><button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={reload}>Try again</button></div>);

  if (!canEdit) {
    const l = sortByTime(items);
    return shell(
      <div className="card space-y-3 !p-4">
        <p className="text-sm text-zinc-300">You can view this list but not change it.</p>
        {l.length === 0 ? <p className="text-sm text-zinc-400">Nothing has been added yet.</p> : (
          <ol className="space-y-2">{l.map((i) => <li key={i.id} className="rounded-lg border border-white/10 p-3 text-sm"><p className="font-semibold text-white">{whenText(i)}: {i.title}</p><p className="text-zinc-300">{i.ownerName ? `Owner: ${i.ownerName}. ` : ""}{STATUS_LABEL[i.status]}</p>{i.notes && <p className="text-zinc-400">{i.notes}</p>}</li>)}</ol>
        )}
      </div>,
    );
  }

  return shell(
    <>
      <ToolStep n={1} title="Start from a template" done={items.length > 0} status={items.length ? `${items.length} item${items.length === 1 ? "" : "s"}` : undefined}
        hint="These are only suggestions of what usually needs to happen. Pick the closest one and change anything, or start with a blank list.">
        <div className="grid gap-2 sm:grid-cols-3">
          {TEMPLATES.map((t) => <button key={t.id} type="button" onClick={() => applyTemplate(t.id)} className="min-h-11 rounded-xl border border-zinc-700 bg-[#0a0b0d] p-3 text-left outline-none hover:border-cyan focus-visible:ring-2 focus-visible:ring-cyan"><span className="block font-semibold text-white">{t.title}</span><span className="mt-1 block text-sm text-zinc-300">{t.blurb}</span></button>)}
        </div>
        <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={startBlank}>Start with a blank list</button>
      </ToolStep>

      <ToolStep n={2} title="Edit the timeline" done={items.length > 0 && !dirty} status={items.length ? `${prog.done} of ${prog.total} done` : undefined}
        hint="Add each thing that has to happen, with a time and the name of the person responsible. Tap a status to update it on the day; it saves straight away. Press Save after any other change.">
        {items.length === 0 ? (
          <div className="space-y-3 rounded-xl border border-dashed border-zinc-600 p-4">
            <p className="text-sm text-zinc-200">Nothing here yet. Pick a template in step 1, or add the first item yourself.</p>
            <button type="button" className="btn px-5" onClick={() => setItems([newItem()])}>Add the first item</button>
          </div>
        ) : (
          <>
            <ol className="space-y-3">{items.map((it, i) => <ItemRow key={it.id} item={it} index={i} count={items.length} onChange={(p) => patch(it.id, p)} onStatus={(s) => void setStatus(it, s)} onMove={(d) => setItems(moveItem(items, i, d))} onDelete={() => remove(i)} />)}</ol>
            {items.length < LIMITS.items && <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => setItems([...items, newItem({ atTime: items[items.length - 1]?.atTime ?? "09:00", dayOffset: items[items.length - 1]?.dayOffset ?? 0 })])}>Add an item</button>}
          </>
        )}
        {undo && <p className="flex flex-wrap items-center gap-2 rounded-lg border border-white/15 bg-[#0a0b0d] px-3 py-1 text-sm text-zinc-100">Removed &quot;{undo.item.title.trim() || "an empty item"}&quot;. <button type="button" className="btn-ghost !min-h-11 px-3 text-sm" onClick={restore}>Undo</button></p>}
        {items.length > 0 && (
          <details className="rounded-xl border border-white/10 p-3">
            <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-zinc-100">More options</summary>
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <p className="text-sm text-zinc-300">Running late or early? Move every item by the same number of minutes.</p>
                <div className="flex flex-wrap items-end gap-2">
                  <label className="w-32"><span className="mb-1 block text-xs font-semibold text-zinc-300">Minutes</span><input type="number" inputMode="numeric" min={1} max={1440} value={shift} onChange={(e) => setShift(e.target.value)} className={field} /></label>
                  <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => doShift(-1)}>Move everything earlier</button>
                  <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => doShift(1)}>Move everything later</button>
                </div>
              </div>
              <div className="space-y-1"><p className="text-sm text-zinc-300">Put the items in time order.</p><button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => { setItems(sortByTime(items)); setMsg({ ok: true, text: "Sorted by time. Press Save to keep it." }); }}>Sort by time</button></div>
            </div>
          </details>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn px-5" disabled={busy || !dirty} onClick={save}>{busy ? "Saving…" : "Save the timeline"}</button>
          {dirty && <span className="text-sm text-amber-200">You have changes that are not saved.</span>}
        </div>
        {status}
      </ToolStep>

      <ToolStep n={3} title="Share and print" done={Boolean(link)} hint={items.length === 0 ? "Add and save some items first." : dirty ? "Save the timeline first, so what you share matches what you see." : "Give volunteers a read-only link, or print the timeline."}>
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Volunteer link</h4>
          <p className="text-sm text-zinc-300">Volunteers open it on their phone and see the times, who is responsible and what is done. They cannot change anything. Anyone who has the link can see it, so share it only with your crew. You can stop it at any time.</p>
          <label className="flex min-h-11 items-center gap-3 text-sm text-zinc-100"><input type="checkbox" className="h-5 w-5" checked={showNotes} onChange={(e) => setShowNotes(e.target.checked)} />Also show my notes to volunteers</label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn px-5" disabled={busy || items.length === 0 || dirty} onClick={makeLink}>{link ? "Make a new link" : "Make a volunteer link"}</button>
            {link && <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" disabled={busy} onClick={revoke}>Stop the link</button>}
          </div>
          {link && !url && <p className="text-sm text-zinc-300">A link is on ({link.showNotes ? "notes shown" : "notes hidden"}), made {new Date(link.createdAt).toLocaleString()}. For safety the address is only shown right after you make it. To get it again, make a new link (the old one then stops).</p>}
          {url && (
            <div className="space-y-3">
              <p className="break-all rounded-lg border border-white/10 bg-[#0a0b0d] px-3 py-2 font-mono text-xs text-zinc-200" aria-label="Volunteer link">{url}</p>
              <div className="flex flex-wrap items-start gap-4">
                <canvas ref={canvas} width={192} height={192} role="img" aria-label="QR code for the volunteer link" className="h-48 w-48 rounded-lg bg-white" />
                <div className="flex flex-wrap gap-2"><button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={copy}>Copy link</button><a href={url} target="_blank" rel="noreferrer" className="btn-ghost !min-h-11 px-4 text-sm">Open the page</a></div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-3 border-t border-white/10 pt-4">
          <h4 className="font-semibold text-white">Print</h4>
          <p className="text-sm text-zinc-300">A clean A4 sheet in time order with a tick box for each item. A longer list continues on a second page.</p>
          <label className="flex min-h-11 items-center gap-3 text-sm text-zinc-100"><input type="checkbox" className="h-5 w-5" checked={pdfNotes} onChange={(e) => setPdfNotes(e.target.checked)} />Include notes</label>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" disabled={busy || items.length === 0} onClick={() => void pdf(false)}>Download the PDF</button>
            <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" disabled={busy || items.length === 0} onClick={() => void pdf(true)}>Open it to print</button>
          </div>
        </div>
      </ToolStep>
    </>,
  );
}
