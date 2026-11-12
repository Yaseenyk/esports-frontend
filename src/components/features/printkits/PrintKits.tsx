"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sendEvent } from "@/lib/track";
import ToolStep from "@/components/tools/ToolStep";
import TeamsInput from "@/components/tools/TeamsInput";
import NumberField from "@/components/tools/NumberField";
import { downloadBlob } from "@/lib/idcard/download";
import { buildKit, cleanTeams, defaultOrient, MAX_BRACKET_TEAMS, MAX_PAGES, SIGN_PRESETS, type KitKind, type Orient, type Paper } from "@/lib/printkits";
import { drawKitPage, pageCanvas } from "./draw";

const KITS: { id: KitKind; title: string; body: string }[] = [
  { id: "match", title: "Match score sheet", body: "Head-to-head matches. Two team names, two score boxes and a referee signature line." },
  { id: "br", title: "Battle royale score sheet", body: "One page per match: a row for every team with placement, kills and total." },
  { id: "referee", title: "Referee sheet", body: "A one-page checklist (before, during, after) and an incident log table." },
  { id: "signs", title: "Gate signs", body: "Huge words on A4 or A3: Registration, Check-in, Toilets and more." },
  { id: "bracket", title: "Bracket poster", body: "A big knockout bracket for up to 32 teams with empty score boxes." },
];
const EXAMPLE = ["Team Alpha", "Team Bravo", "Team Charlie", "Team Delta", "Team Echo", "Team Foxtrot", "Team Golf", "Team Hotel"];
const COUNT: Record<KitKind, { label: string; hint: string; min: number; max: number; def: number }> = {
  match: { label: "Number of matches", hint: "Teams are paired in order: line 1 plays line 2, line 3 plays line 4. Extra matches are left blank to fill by hand.", min: 1, max: 200, def: 8 },
  br: { label: "Number of matches (one page set each)", hint: "Every match gets its own page with a row for each team.", min: 1, max: 30, def: 6 },
  referee: { label: "Number of sheets", hint: "Each sheet is a checklist page and an incident log page.", min: 1, max: 20, def: 2 },
  signs: { label: "Copies of each sign", hint: "One page per copy, for example one for each entrance.", min: 1, max: 5, def: 1 },
  bracket: { label: "Number of posters", hint: "Identical copies of the bracket.", min: 1, max: 5, def: 1 },
};

/** Free printable kits, drawn in the browser as a PDF. Nothing is uploaded. */
export default function PrintKits() {
  const [kind, setKind] = useState<KitKind>("match");
  const [event, setEvent] = useState("Monsoon Clash Season 2");
  const [date, setDate] = useState("");
  const [teamsText, setTeamsText] = useState("");
  const [paper, setPaper] = useState<Paper>("A4");
  const [orient, setOrient] = useState<Orient | null>(null);
  const [counts, setCounts] = useState<Record<KitKind, number>>({ match: 8, br: 6, referee: 2, signs: 1, bracket: 1 });
  const [signIds, setSignIds] = useState<string[]>(["registration", "checkin", "toilets"]);
  const [custom, setCustom] = useState("");
  const [hi, setHi] = useState(false), [mr, setMr] = useState(false);
  const [status, setStatus] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");

  const orientation = orient ?? defaultOrient(kind);
  const teams = useMemo(() => cleanTeams(teamsText), [teamsText]);
  const usedTeams = kind === "bracket" ? teams.slice(0, MAX_BRACKET_TEAMS) : teams;
  const pages = useMemo(() => buildKit({ kind, event, date, paper, orient: orientation, teams: usedTeams, count: counts[kind], signIds, custom, hi, mr }), [kind, event, date, paper, orientation, usedTeams, counts, signIds, custom, hi, mr]);
  const needsTeams = kind === "bracket";
  const ready = pages.length > 0 && (!needsTeams || teams.length >= 2);
  const shown = pages.slice(0, 3);

  const refs = useRef<(HTMLCanvasElement | null)[]>([]);
  useEffect(() => { shown.forEach((p, i) => { const cv = refs.current[i]; if (cv) drawKitPage(cv, p, 2.4); }); });

  const make = async (): Promise<Blob | null> => {
    setBusy(true); setError(""); setStatus("");
    try {
      const { jsPDF } = await import("jspdf");
      const first = pages[0]!;
      const doc = new jsPDF({ unit: "mm", format: [Math.min(first.w, first.h), Math.max(first.w, first.h)], orientation: first.w > first.h ? "landscape" : "portrait" });
      for (let i = 0; i < pages.length; i++) {
        setStatus(`Drawing page ${i + 1} of ${pages.length}…`);
        await new Promise((r) => setTimeout(r, 0));
        const p = pages[i]!, cv = pageCanvas(p, 6);
        if (i) doc.addPage([Math.min(p.w, p.h), Math.max(p.w, p.h)], p.w > p.h ? "landscape" : "portrait");
        doc.addImage(cv.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, p.w, p.h);
        cv.width = cv.height = 0;
      }
      return doc.output("blob");
    } catch {
      setError("The PDF could not be made. Try fewer pages, or a smaller paper size, and press the button again.");
      setStatus("");
      return null;
    } finally { setBusy(false); }
  };
  const download = async () => {
    const blob = await make();
    if (!blob) return;
    downloadBlob(blob, `${kind}-kit.pdf`); sendEvent("tool_complete", "print-kits");
    setStatus(`Done: ${pages.length} page${pages.length === 1 ? "" : "s"} saved as ${kind}-kit.pdf. Print it at 100% size (not "fit to page") on ${paper} paper.`);
  };
  const print = async () => {
    const blob = await make();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const f = document.createElement("iframe");
    f.setAttribute("aria-hidden", "true"); f.style.cssText = "position:fixed;width:0;height:0;border:0;right:0;bottom:0";
    f.onload = () => { try { f.contentWindow?.focus(); f.contentWindow?.print(); sendEvent("tool_complete", "print-kits"); setStatus("The print window should be open. If nothing appeared, press Download PDF and print the file."); } catch { setError("Your browser did not open the print window. Press Download PDF and print the file instead."); } setTimeout(() => { f.remove(); URL.revokeObjectURL(url); }, 60000); };
    f.src = url; document.body.appendChild(f);
  };

  const toggleSign = (id: string) => setSignIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const c = COUNT[kind];

  return (
    <div className="space-y-5">
      <ToolStep n={1} id="pk-kit" title="Pick a kit" done hint="Choose what you want to print. You can come back and pick another one after.">
        <div role="group" aria-label="Kit" className="grid gap-3 sm:grid-cols-2">
          {KITS.map((k) => (
            <button key={k.id} type="button" aria-pressed={kind === k.id} onClick={() => { setKind(k.id); setOrient(null); setStatus(""); setError(""); }}
              className={`min-h-11 rounded-xl border p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan ${kind === k.id ? "border-cyan bg-cyan/10" : "border-white/10 bg-[#0a0b0d] hover:border-zinc-500"}`}>
              <span className="block font-semibold text-white">{kind === k.id ? "✓ " : ""}{k.title}</span>
              <span className="mt-1 block text-sm leading-6 text-zinc-300">{k.body}</span>
            </button>
          ))}
        </div>
      </ToolStep>

      <ToolStep n={2} id="pk-details" title="Fill in the details" hint="The sample values already work. Change what you need and the preview in step 3 updates.">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-zinc-200">Event name<input className="field mt-1" value={event} maxLength={80} onChange={(e) => setEvent(e.target.value)} /></label>
          <label className="block text-sm text-zinc-200">Date (optional)<input className="field mt-1" value={date} maxLength={40} onChange={(e) => setDate(e.target.value)} placeholder="12 December 2026" /></label>
          <label className="block text-sm text-zinc-200">Paper<select className="field mt-1" value={paper} onChange={(e) => setPaper(e.target.value as Paper)}><option value="A4">A4 (normal printer)</option><option value="A3">A3 (large, for posters)</option></select></label>
          <NumberField label={c.label} value={counts[kind]} min={c.min} max={c.max} hint={c.hint} onChange={(n) => setCounts({ ...counts, [kind]: n })} />
        </div>
        {kind === "signs" && (
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-white">Which signs?</legend>
            <div className="flex flex-wrap gap-2">{SIGN_PRESETS.map((s) => <button key={s.id} type="button" className="chip" aria-pressed={signIds.includes(s.id)} onClick={() => toggleSign(s.id)}>{s.en}</button>)}</div>
            <label className="block text-sm text-zinc-200">Your own signs, one per line<textarea className="field mt-1 min-h-20 py-2" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={"Parking\nFirst aid"} /></label>
            <div className="flex flex-wrap gap-2"><button type="button" className="chip" aria-pressed={hi} onClick={() => setHi(!hi)}>Add Hindi labels</button><button type="button" className="chip" aria-pressed={mr} onClick={() => setMr(!mr)}>Add Marathi labels</button></div>
            <p className="text-xs leading-5 text-zinc-400">Hindi and Marathi are added only for the common words where we are sure of the wording (Registration, Players only, Volunteers, Press, Toilets, and Stage in Hindi). The other signs, and your own, stay in English. Ask a Hindi or Marathi reader to look at the printed sign once.</p>
          </fieldset>
        )}
        {(kind === "match" || kind === "br" || kind === "bracket") && (
          <TeamsInput value={teamsText} onChange={setTeamsText} noun="team" min={kind === "bracket" ? 2 : 0} max={kind === "bracket" ? MAX_BRACKET_TEAMS : 200} example={EXAMPLE} label={kind === "bracket" ? "Teams, one per line (2 to 32)" : "Team names, one per line (optional)"}
            help={kind === "bracket" ? "Line 1 is the top seed. Type one team per line, or paste a column from a spreadsheet or WhatsApp. If the number is not 2, 4, 8, 16 or 32 the empty places are marked Bye." : "Leave this empty to print blank name lines you fill in by hand. Or type one team per line, or paste a column from a spreadsheet."} />
        )}
        <details className="group rounded-xl border border-white/10 bg-[#0a0b0d]">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan [&::-webkit-details-marker]:hidden"><span>More options <span className="font-normal text-zinc-300">· page direction</span></span><span aria-hidden="true" className="text-zinc-400 transition-transform group-open:rotate-180">▾</span></summary>
          <div className="space-y-2 border-t border-white/10 p-4">
            <div role="group" aria-label="Page direction" className="flex flex-wrap gap-2">
              <button type="button" className="chip" aria-pressed={orientation === "portrait"} onClick={() => setOrient("portrait")}>Tall (portrait)</button>
              <button type="button" className="chip" aria-pressed={orientation === "landscape"} onClick={() => setOrient("landscape")}>Wide (landscape)</button>
            </div>
            <p className="text-xs text-zinc-400">Sheets and signs start tall; the bracket starts wide.</p>
          </div>
        </details>
      </ToolStep>

      <ToolStep n={3} id="pk-preview" title="Check the preview" status={pages.length ? `${pages.length} page${pages.length === 1 ? "" : "s"}` : undefined}
        hint={ready ? `This is how the first ${shown.length === 1 ? "page" : `${shown.length} pages`} will look. On a phone, scroll sideways inside the picture if it is wide.` : needsTeams ? "Add at least 2 teams in step 2 and the bracket appears here." : "Choose at least one sign in step 2 and it appears here."}>
        {ready ? (
          <div className="space-y-4">
            {shown.map((p, i) => (
              <div key={i} className="overflow-x-auto rounded-xl border border-white/[0.14] bg-white" tabIndex={0} aria-label={`Preview of page ${i + 1}`}>
                <canvas ref={(el) => { refs.current[i] = el; }} role="img" aria-label={`${p.label}, page ${i + 1} of ${pages.length}`} style={{ width: "100%", minWidth: p.w > p.h ? 640 : 320, maxWidth: p.w > p.h ? 900 : 420, display: "block", margin: "0 auto", height: "auto" }} />
              </div>
            ))}
            {pages.length > shown.length && <p className="text-sm text-zinc-300">{pages.length - shown.length} more page{pages.length - shown.length === 1 ? "" : "s"} are in the PDF. They use the same layout.</p>}
            {pages.length >= MAX_PAGES && <p className="text-sm text-amber-300">A PDF holds at most {MAX_PAGES} pages here. Make a second PDF for the rest.</p>}
          </div>
        ) : <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-zinc-300">Nothing to preview yet.</p>}
      </ToolStep>

      <ToolStep n={4} id="pk-pdf" title="Download or print" done={status.startsWith("Done")} hint="The PDF is made on this device. Nothing is uploaded. Download it to print later, or press Print to open the print window now.">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn" disabled={!ready || busy} onClick={download}>{busy ? "Working…" : "Download PDF"}</button>
          <button type="button" className="btn-ghost" disabled={!ready || busy} onClick={print}>Print</button>
        </div>
        <p role="status" aria-live="polite" className={`text-sm ${status.startsWith("Done") ? "text-emerald-300" : "text-zinc-300"}`}>{status || (ready ? "" : "Finish step 2 first.")}</p>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <p className="text-xs leading-5 text-zinc-400">The pages are pictures, so the text in the PDF cannot be selected. Print at 100% size on {paper} paper.</p>
      </ToolStep>
    </div>
  );
}
