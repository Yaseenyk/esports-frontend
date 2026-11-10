"use client";

import { useMemo, useState } from "react";
import Select from "@/components/Select";
import JSZip from "jszip";
import { buildPdf, cardToBleedJpeg, cardToJpeg, cardToPng, download, downloadBlob, type PdfCard } from "@/lib/idcard/export";
import { eventKey } from "@/lib/idcard/sign";
import { FORMATS, ROLE_COLOURS, fmtOf, type EventInfo, type Fmt, type Person, type Team, type Template } from "@/lib/idcard/types";
import CardView, { type Ctx } from "./CardView";
import PassViewer from "./PassViewer";

/** A tiny face for the check-in pack, so the guard can compare the person at the gate with their photo. */
async function thumbOf(src?: string): Promise<string | undefined> {
  if (!src) return undefined;
  try {
    const img = new Image(); img.src = src; await img.decode();
    const cv = document.createElement("canvas"); cv.width = 110; cv.height = 140;
    const ctx = cv.getContext("2d")!; ctx.fillStyle = "#1e293b"; ctx.fillRect(0, 0, 110, 140);
    const k = Math.max(110 / img.width, 140 / img.height); const w = img.width * k, h = img.height * k;
    ctx.drawImage(img, (110 - w) / 2, 0, w, h);
    return cv.toDataURL("image/jpeg", 0.7);
  } catch { return undefined; }
}

export default function PrintPanel({ people, allPeople, teams, teamOpts, printTeam, setPrintTeam, tplFor, teamById, ctxFor, event, info, minorOf, duplicates, needReview, onPrinted }: {
  people: Person[]; allPeople: Person[]; teams: Team[]; teamOpts: { value: string; label: string }[]; printTeam: string; setPrintTeam: (v: string) => void;
  tplFor: (t: Team) => Template; teamById: (id: string) => Team; ctxFor: (p: Person) => Ctx; event: string; info: EventInfo;
  minorOf: (p: Person) => boolean; duplicates: Map<string, string[]>; needReview: number; onPrinted: () => void;
}) {
  const [backs, setBacks] = useState(true);
  const [marks, setMarks] = useState(true);
  const [bleed, setBleed] = useState(false);
  // Sheet layout, for card stock and print shops: paper size, space between cards, margin. "auto" keeps the roomy default that leaves space for crop marks.
  const [paper, setPaper] = useState<"a4" | "letter">("a4");
  const [layout, setLayout] = useState<"auto" | "tight" | "custom">("auto");
  const [gap, setGap] = useState(2), [margin, setMargin] = useState(8);
  const [status, setStatus] = useState<string | null>(null);
  const [view, setView] = useState<Person | null>(null);

  const hasBack = (p: Person) => !!tplFor(teamById(p.teamId)).back;
  const showBacks = backs && people.some(hasBack);
  const groups = useMemo(() => (Object.keys(FORMATS) as Fmt[]).map((k) => ({ k, list: people.filter((p) => fmtOf(tplFor(teamById(p.teamId))) === k) })).filter((g) => g.list.length), [people, tplFor, teamById]);
  const unconsented = people.filter((p) => minorOf(p) && !p.guardian);
  const dupCount = people.filter((p) => duplicates.has(p.id)).length;
  const noPhoto = people.filter((p) => !p.photo).length;
  const roles = Array.from(new Set(people.map((p) => p.role)));

  const nodes = (face: "front" | "back") => Array.from(document.querySelectorAll<HTMLElement>(`[data-face="${face}"] .idcard-box`));
  const makePdf = async () => {
    try {
      const gather = async (face: "front" | "back"): Promise<PdfCard[]> => {
        const out: PdfCard[] = []; const list = nodes(face);
        for (let i = 0; i < list.length; i++) {
          setStatus(`Preparing ${face} ${i + 1} of ${list.length}…`);
          const fmt = list[i].closest<HTMLElement>("[data-fmt]")!.dataset.fmt as Fmt;
          out.push({ png: bleed ? await cardToBleedJpeg(list[i], fmt, 3, 1100) : await cardToJpeg(list[i], 1100), fmt });
        }
        return out;
      };
      const fronts = await gather("front");
      const bk = showBacks ? await gather("back") : [];
      setStatus("Building the PDF…");
      downloadBlob(buildPdf(fronts, bk, { marks: layout === "tight" ? false : marks, bleedMm: bleed ? 3 : 0, paper, ...(layout === "tight" ? { gapMm: 0, marginMm: 5 } : layout === "custom" ? { gapMm: gap, marginMm: margin } : {}) }), `${eventKey(event)}-cards.pdf`);
      setStatus("PDF downloaded.");
    } catch { setStatus("Could not make the PDF. Try Print, then choose Save as PDF."); }
  };

  const zipAll = async () => {
    try {
      const zip = new JSZip();
      for (const face of ["front", "back"] as const) {
        if (face === "back" && !showBacks) continue;
        const list = Array.from(document.querySelectorAll<HTMLElement>(`[data-face="${face}"]`));
        for (let i = 0; i < list.length; i++) {
          setStatus(`Preparing ${face} ${i + 1} of ${list.length}…`);
          const node = list[i].querySelector<HTMLElement>(".idcard-box"); if (!node) continue;
          const data = (await cardToPng(node, 1100)).split(",")[1];
          const who = (list[i].dataset.pid || `card-${i + 1}`).replace(/[^A-Za-z0-9_-]/g, "_");
          zip.file(`${face}/${who}.png`, data, { base64: true });
        }
      }
      setStatus("Zipping…");
      downloadBlob(await zip.generateAsync({ type: "blob" }), `${eventKey(event)}-cards-png.zip`);
      setStatus("Zip downloaded.");
    } catch { setStatus("Could not make the zip."); }
  };

  const pack = async () => {
    setStatus("Making the check-in pack…");
    const list = [];
    for (const p of allPeople) list.push({ id: p.id, name: p.name, team: teamById(p.teamId)?.name ?? "", role: p.role, zones: p.zones ?? "", minor: minorOf(p), guardian: !!p.guardian, thumb: await thumbOf(p.photo) });
    const blob = new Blob([JSON.stringify({ v: 1, eventKey: eventKey(event), event, date: info.date, signed: info.sign, people: list })], { type: "application/json" });
    downloadBlob(blob, `${eventKey(event)}-checkin-pack.json`);
    setStatus("Check-in pack downloaded. Open the Check-in tool on the gate phone and load it there.");
  };

  const png = async (p: Person, face: "front" | "back") => {
    const node = document.querySelector<HTMLElement>(`[data-pid="${CSS.escape(p.id)}"][data-face="${face}"] .idcard-box`); if (!node) return;
    download(await cardToPng(node), `${p.name.replace(/\s+/g, "-") || p.id}-${face}.png`);
  };

  /** Backs are mirrored within each row so a double-sided print lines up when the pages are flipped on the long edge. */
  const mirrored = (list: Person[], cols: number) => { const out: Person[] = []; for (let i = 0; i < list.length; i += cols) out.push(...list.slice(i, i + cols).reverse()); return out; };

  const card = (p: Person, face: "front" | "back", fmt: Fmt) => {
    const tpl = tplFor(teamById(p.teamId));
    return (
      <div key={`${face}-${p.id}-${p.teamId}`} data-pid={p.id} data-face={face} data-fmt={fmt} className="idcard-wrap group relative w-full">
        <CardView tpl={tpl} ctx={ctxFor(p)} side={face} className="shadow-xl shadow-black/50" />
        <div className="no-print absolute inset-x-2 bottom-2 flex justify-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
          <button type="button" className="rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black" onClick={() => setView(p)}>View</button>
          <button type="button" className="rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black" onClick={() => png(p, face)}>PNG</button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="no-print mb-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-[16rem_1fr] sm:items-end">
          <Select label="Show" value={printTeam} onChange={setPrintTeam} options={[{ value: "all", label: "All teams" }, ...teamOpts]} searchable={false} />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={backs} onChange={(e) => setBacks(e.target.checked)} className="h-5 w-5 accent-cyan" />Include backs (double-sided)</label>
            <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={marks} onChange={(e) => setMarks(e.target.checked)} className="h-5 w-5 accent-cyan" />Crop marks in the PDF</label>
            <label className="flex items-center gap-2 text-sm text-zinc-300" title="Adds 3 mm of extra edge around every card so a print shop can trim cleanly. Square corners; the artwork is extended outward from its edges."><input type="checkbox" checked={bleed} onChange={(e) => setBleed(e.target.checked)} className="h-5 w-5 accent-cyan" />3 mm bleed (print shops)</label>
            <details className="w-full text-sm text-zinc-300">
              <summary className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-cyan">Sheet layout (card stock, print shops)</summary>
              <div className="mt-2 space-y-3 rounded-xl border border-white/10 p-3">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Paper size">{([["a4", "A4"], ["letter", "US Letter"]] as const).map(([v, l]) => <button key={v} type="button" aria-pressed={paper === v} className={`chip ${paper === v ? "!border-cyan !text-cyan" : ""}`} onClick={() => setPaper(v)}>{l}</button>)}</div>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Spacing">{([["auto", "Roomy (room for crop marks)"], ["tight", "Tight, no gaps (pre-cut or perforated stock)"], ["custom", "Custom"]] as const).map(([v, l]) => <button key={v} type="button" aria-pressed={layout === v} className={`chip ${layout === v ? "!border-cyan !text-cyan" : ""}`} onClick={() => setLayout(v)}>{l}</button>)}</div>
                {layout === "custom" && (
                  <div className="flex flex-wrap gap-3">
                    <label className="text-sm">Gap between cards (mm)<input className="field mt-1 w-28" type="number" min={0} max={30} step={0.5} value={gap} onChange={(e) => setGap(Math.max(0, Number(e.target.value) || 0))} /></label>
                    <label className="text-sm">Page margin (mm)<input className="field mt-1 w-28" type="number" min={0} max={40} step={0.5} value={margin} onChange={(e) => setMargin(Math.max(0, Number(e.target.value) || 0))} /></label>
                  </div>
                )}
                <p className="text-xs text-zinc-400">Measure the card stock and enter its gap and margin, so each card lands inside its cut or perforation. Print at 100% (no “fit to page”). Do a test print on plain paper first.</p>
              </div>
            </details>
          </div>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <button id="pdf-button" type="button" className="btn" onClick={makePdf}>Download PDF (real size)</button>
          <button type="button" className="btn-ghost" onClick={() => { onPrinted(); window.print(); }}>Print {people.length} {people.length === 1 ? "card" : "cards"}</button>
          <button type="button" className="btn-ghost" onClick={zipAll} title="Every card as a PNG picture, in one zip file">Download all as PNG (zip)</button>
          <button type="button" className="btn-ghost" onClick={pack} title="A file the gate-check page uses to check guests in without internet">Check-in pack for the gate</button>
        </div>
        {status && <p className="text-sm text-zinc-300" role="status">{status}</p>}
        <p className="text-xs text-zinc-400">The PDF puts every card at its real size on A4 pages. Backs go on their own pages, mirrored so a double-sided print lines up. Hover or tap a card to view it in your hand or save it as a PNG. In the print window, turn on background graphics if your browser asks.</p>

        {(unconsented.length > 0 || dupCount > 0 || needReview > 0 || noPhoto > 0) && (
          <ul className="space-y-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100" aria-label="Things to check before printing">
            {unconsented.length > 0 && <li><strong>{unconsented.length}</strong> {unconsented.length === 1 ? "person is" : "people are"} under 18 on the event date without guardian consent: {unconsented.slice(0, 4).map((p) => p.name).join(", ")}{unconsented.length > 4 ? "…" : ""}.</li>}
            {dupCount > 0 && <li><strong>{dupCount}</strong> {dupCount === 1 ? "person looks" : "people look"} like a duplicate entry.</li>}
            {needReview > 0 && <li><strong>{needReview}</strong> scanned {needReview === 1 ? "person has" : "people have"} not been checked yet.</li>}
            {noPhoto > 0 && <li><strong>{noPhoto}</strong> {noPhoto === 1 ? "person has" : "people have"} no photo.</li>}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400" aria-label="Role colours"><span>Role colours:</span>{roles.map((r) => (<span key={r} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: ROLE_COLOURS[r] }} />{r}</span>))}</div>
      </div>

      {groups.map(({ k, list }) => (
        <section key={k} className="mb-8" aria-label={FORMATS[k].label}>
          <h2 className="no-print mb-3 font-display text-lg font-bold text-white">{FORMATS[k].label} <span className="text-sm font-normal text-zinc-400">· {FORMATS[k].w} x {FORMATS[k].h} mm · {list.length} {list.length === 1 ? "card" : "cards"}</span></h2>
          {FORMATS[k].slot && <p className="no-print mb-3 text-sm text-zinc-400">Punch or cut inside the dashed slot at the top, then thread a lanyard or fit a clip. Print on thick card (250 gsm or more) or put the printout in a badge holder.</p>}
          <div className="print-sheet grid gap-4" style={{ ["--w" as string]: `${FORMATS[k].w}mm`, ["--cols" as string]: FORMATS[k].cols, gridTemplateColumns: `repeat(auto-fill, minmax(${k === "strip" ? 260 : k === "wallet" ? 280 : 200}px, 1fr))` }}>
            {list.map((p) => card(p, "front", k))}
          </div>
        </section>
      ))}

      {showBacks && groups.map(({ k, list }) => {
        const withBack = list.filter(hasBack);
        if (!withBack.length) return null;
        return (
          <section key={`b-${k}`} className="mb-8 break-before-page" aria-label={`${FORMATS[k].label} backs`}>
            <h2 className="no-print mb-3 font-display text-lg font-bold text-white">{FORMATS[k].label} backs <span className="text-sm font-normal text-zinc-400">· mirrored for double-sided printing</span></h2>
            <div className="print-sheet grid gap-4" style={{ ["--w" as string]: `${FORMATS[k].w}mm`, ["--cols" as string]: FORMATS[k].cols, gridTemplateColumns: `repeat(auto-fill, minmax(${k === "strip" ? 260 : k === "wallet" ? 280 : 200}px, 1fr))` }}>
              {mirrored(withBack, FORMATS[k].cols).map((p) => card(p, "back", k))}
            </div>
          </section>
        );
      })}
      {people.length === 0 && <p className="card text-zinc-400">No people yet. Add some in the People step.</p>}
      {view && <PassViewer open onClose={() => setView(null)} tpl={tplFor(teamById(view.teamId))} ctx={ctxFor(view)} />}
    </div>
  );
}
