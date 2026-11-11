"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { downloadBlob } from "@/lib/idcard/download";
import { fixContrast, useBrand } from "@/lib/brand";
import ToolStep from "./ToolStep";
import TeamsInput from "./TeamsInput";
import { awardFor, entriesToText, parseAwardLines, parseCertQuery, type CertEntry } from "@/lib/certificates";

type Design = "classic" | "dark" | "minimal";
const DESIGNS: { id: Design; label: string }[] = [{ id: "classic", label: "Classic (white, for printing)" }, { id: "dark", label: "Dark esports" }, { id: "minimal", label: "Minimal (white)" }];
const W = 1123, H = 794; // A4 landscape at 96 dpi

interface Fields { heading: string; intro: string; award: string; body: string; event: string; date: string; org: string; sign1: string; role1: string; sign2: string; role2: string }
const DEFAULTS: Fields = {
  heading: "Certificate of Achievement", intro: "This certificate is proudly presented to", award: "Winner",
  body: "for outstanding performance as {award} in {event}, held on {date}.", event: "Monsoon Clash Season 2", date: "12 December 2026", org: "Konkan Gamers Guild",
  sign1: "Event Head", role1: "Organising Committee", sign2: "Faculty Coordinator", role2: "College",
};
const SAMPLE_NAMES = "Aarav Mehta\nDiya Kulkarni\nRohan Deshmukh";
const fill = (t: string, f: Fields) => t.replaceAll("{award}", f.award).replaceAll("{event}", f.event).replaceAll("{date}", f.date).replace(/\s+/g, " ").replace(/\s+([.,])/g, "$1");

/** One certificate, drawn at a fixed A4 landscape size so that what you see is what prints. */
function Cert({ f, name, design, logo, brandAccent }: { f: Fields; name: string; design: Design; logo: string; brandAccent?: string }) {
  const dark = design === "dark";
  const ink = dark ? "#f4f4f5" : "#111827", soft = dark ? "#a1a1aa" : "#4b5563", accent = brandAccent ? fixContrast(brandAccent, dark ? "#0a0b0d" : "#ffffff") : dark ? "#22d3ee" : design === "classic" ? "#0e7490" : "#7c3aed";
  const frame: React.CSSProperties = design === "classic" ? { border: `10px double ${accent}`, margin: 28 } : design === "dark" ? { border: `3px solid ${accent}`, margin: 36, boxShadow: `inset 0 0 0 10px #0a0b0d, inset 0 0 0 12px #a855f7` } : { borderLeft: `18px solid ${accent}`, margin: 0 };
  return (
    <div style={{ width: W, height: H, background: dark ? "#0a0b0d" : "#ffffff", color: ink, position: "relative", fontFamily: design === "minimal" ? "system-ui, 'Segoe UI', sans-serif" : "Georgia, 'Times New Roman', serif", boxSizing: "border-box" }}>
      <div style={{ ...frame, height: design === "minimal" ? H : H - (design === "classic" ? 56 : 72), boxSizing: "border-box", padding: "56px 90px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logo ? <img src={logo} alt="" style={{ height: 86, objectFit: "contain", marginBottom: 14 }} /> : <div style={{ height: 86 }} />}
        <div style={{ fontSize: 50, fontWeight: 700, letterSpacing: 1, color: accent, lineHeight: 1.1 }}>{f.heading}</div>
        <div style={{ fontSize: 22, color: soft, marginTop: 28 }}>{f.intro}</div>
        <div style={{ fontSize: name.length > 70 ? 28 : name.length > 44 ? 36 : name.length > 28 ? 46 : 62, overflowWrap: "anywhere", fontWeight: 700, margin: "14px 0 10px", lineHeight: 1.1, borderBottom: `3px solid ${accent}`, padding: "0 28px 10px", maxWidth: "100%" }}>{name || "Participant name"}</div>
        <div style={{ fontSize: 26, color: ink, maxWidth: 800, lineHeight: 1.45, marginTop: 14 }}>{fill(f.body, f)}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-end" }}>
          {[[f.sign1, f.role1], [f.sign2, f.role2]].map(([n, r], i) => (
            <div key={i} style={{ width: 300, textAlign: "center" }}><div style={{ borderTop: `2px solid ${soft}`, paddingTop: 8, fontSize: 20, fontWeight: 700 }}>{n}</div><div style={{ fontSize: 16, color: soft }}>{r}</div></div>
          ))}
        </div>
        <div style={{ fontSize: 15, color: soft, marginTop: 20 }}>{f.org}</div>
      </div>
    </div>
  );
}

/** Free certificate maker: one A4 landscape certificate per name, as a single PDF. Drawn in the browser, so any script (Hindi, Marathi) prints correctly. */
export default function CertificateMaker() {
  const [f, setF] = useState<Fields>(DEFAULTS);
  const [names, setNames] = useState(SAMPLE_NAMES);
  const [design, setDesign] = useState<Design>("classic");
  const [logo, setLogo] = useState("");
  const [status, setStatus] = useState(""), [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"list" | "awards">("list");
  const [awardText, setAwardText] = useState("Winner: Team A\nRunner-up: Team B\nThird place: Team C");
  const [prefilled, setPrefilled] = useState(false);
  const brand = useBrand(); // your account brand kit; null when signed out or none saved
  const [useBrandColour, setUseBrandColour] = useState(false);
  const list = useMemo<CertEntry[]>(() => (mode === "awards"
    ? parseAwardLines(awardText).map((r) => ({ name: r.name, award: awardFor(r, f.award) }))
    : names.split("\n").map((n) => n.trim()).filter(Boolean).map((name) => ({ name, award: f.award }))), [mode, awardText, names, f.award]);
  const [live, setLive] = useState<CertEntry | null>(null);
  // Results tools link here with ?awards=Winner:Team A|Runner-up:Team B (or ?names=A|B). Read once, defensively, after the page loads.
  useEffect(() => {
    const q = parseCertQuery(location.search);
    if (!q.rows.length) return;
    setAwardText(entriesToText(q.rows)); setMode("awards"); setPrefilled(true);
  }, []);
  const off = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => { const el = box.current; if (!el) return; const fit = () => setScale(Math.min(1, el.clientWidth / W)); fit(); const ro = new ResizeObserver(fit); ro.observe(el); return () => ro.disconnect(); }, []);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const readLogo = (file?: File) => { if (!file) return; const r = new FileReader(); r.onload = () => setLogo(String(r.result)); r.readAsDataURL(file); };
  const frame = () => new Promise<void>((ok) => requestAnimationFrame(() => requestAnimationFrame(() => ok())));

  const make = useCallback(async () => {
    if (!list.length || busy) return;
    setBusy(true);
    try {
      const [{ toJpeg }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
      for (let i = 0; i < list.length; i++) {
        setStatus(`Drawing certificate ${i + 1} of ${list.length}…`);
        setLive(list[i]!); await frame();
        const url = await toJpeg(off.current!, { pixelRatio: 2, quality: 0.92, width: W, height: H, cacheBust: false });
        if (i) doc.addPage();
        doc.addImage(url, "JPEG", 0, 0, 297, 210);
      }
      downloadBlob(doc.output("blob"), "certificates.pdf");
      setStatus(`Done: ${list.length} certificate${list.length === 1 ? "" : "s"} in certificates.pdf.`);
    } catch { setStatus("Could not make the PDF. Try fewer names at a time."); } finally { setBusy(false); setLive(null); }
  }, [list, busy]);

  return (
    <div className="space-y-5">
      <ToolStep n={1} id="ce-names" title="Who gets a certificate?" done={list.length > 0}
        hint="Add one name for each certificate. Each person gets their own page in one PDF."
        status={list.length ? `${list.length} certificate${list.length === 1 ? "" : "s"}` : undefined}>
        {prefilled && <p role="status" className="rounded-xl border border-cyan/30 bg-[#0a0b0d] p-3 text-sm text-zinc-200">Pre-filled from your results. Check the names and press Download.</p>}
        <div role="group" aria-label="How to add names" className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={mode === "list"} onClick={() => setMode("list")}>Names only</button>
          <button type="button" className="chip" aria-pressed={mode === "awards"} onClick={() => setMode("awards")}>Name + award</button>
        </div>
        {mode === "list"
          ? <TeamsInput value={names} onChange={setNames} noun="name" min={1} max={500} example={SAMPLE_NAMES.split("\n")} label="Names, one per line" help="Type one name per line. Or copy a column from Excel, Google Sheets or WhatsApp and paste it here. Up to 100 per file works well." />
          : <div className="space-y-2">
              <label htmlFor="ce-awards" className="block text-sm font-semibold text-white">Award and name, one per line</label>
              <p id="ce-awards-help" className="text-sm leading-6 text-zinc-300">Write the award, a colon, then the name. For example <span className="font-mono text-zinc-100">Winner: Team A</span>. Each certificate says its own award. A line with no award uses the box &quot;Award or result&quot; in step 2. Up to 100 lines.</p>
              <textarea id="ce-awards" aria-describedby="ce-awards-help" className="field min-h-40 py-2" spellCheck={false} value={awardText} onChange={(e) => { setPrefilled(false); setAwardText(e.target.value); }} placeholder={"Winner: Team A\nRunner-up: Team B\nParticipation: Team C"} />
              <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" onClick={() => { setPrefilled(false); setAwardText(""); }}>Clear</button>
            </div>}
      </ToolStep>

      <ToolStep n={2} id="ce-look" title="Choose the wording and the look" hint="Change the event details below. The preview in step 3 updates as you type. The sample text already works, so you can keep what you like.">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-zinc-200">Event<input className="field mt-1" value={f.event} onChange={set("event")} /></label>
          <label className="block text-sm text-zinc-200">Date<input className="field mt-1" value={f.date} onChange={set("date")} /></label>
          <label className="block text-sm text-zinc-200">Award or result<input className="field mt-1" value={f.award} onChange={set("award")} placeholder="Winner, Runner-up, Participant" /></label>
          <label className="block text-sm text-zinc-200">Organiser<input className="field mt-1" value={f.org} onChange={set("org")} /></label>
          <label className="block text-sm text-zinc-200 sm:col-span-2">Design<select className="field mt-1" value={design} onChange={(e) => setDesign(e.target.value as Design)}>{DESIGNS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}</select></label>
        </div>
        {brand && (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" aria-pressed={useBrandColour && !!brand} onClick={() => { setUseBrandColour((v) => !v); if (!useBrandColour && brand.logo) setLogo(brand.logo); }}>{useBrandColour ? "Stop using my brand colour" : "Use my brand (colour and logo)"}</button>
            <span className="text-xs text-zinc-400">Takes your main colour (made darker or lighter if it would be hard to read) and your logo. Change the logo under More options.</span>
          </div>
        )}
        <details className="group rounded-xl border border-white/10 bg-[#0a0b0d]">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan [&::-webkit-details-marker]:hidden">
            <span>More options <span className="font-normal text-zinc-300">· heading, sentence, signatures, logo</span></span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 fill-none stroke-current text-zinc-400 transition-transform group-open:rotate-180" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5" /></svg>
          </summary>
          <div className="space-y-3 border-t border-white/10 p-4">
            <label className="block text-sm text-zinc-200">Heading<input className="field mt-1" value={f.heading} onChange={set("heading")} /></label>
            <label className="block text-sm text-zinc-200">Wording<textarea className="field mt-1 min-h-20 py-2" value={f.body} onChange={set("body")} /><span className="mt-1 block text-xs text-zinc-400">{"{award}"}, {"{event}"} and {"{date}"} are filled in for you from the boxes above.</span></label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-sm text-zinc-200">First signature: name<input className="field mt-1" value={f.sign1} onChange={set("sign1")} /></label>
              <label className="block text-sm text-zinc-200">First signature: title<input className="field mt-1" value={f.role1} onChange={set("role1")} /></label>
              <label className="block text-sm text-zinc-200">Second signature: name<input className="field mt-1" value={f.sign2} onChange={set("sign2")} /></label>
              <label className="block text-sm text-zinc-200">Second signature: title<input className="field mt-1" value={f.role2} onChange={set("role2")} /></label>
            </div>
            <div className="flex flex-wrap items-center gap-2"><label className="btn-ghost cursor-pointer px-3 text-sm focus-within:ring-2 focus-within:ring-cyan">{logo ? "Change logo" : "Add a logo"}<input type="file" accept="image/*" className="sr-only" onChange={(e) => { readLogo(e.target.files?.[0]); e.target.value = ""; }} /></label>{logo && <button type="button" className="chip !min-h-11" onClick={() => setLogo("")}>Remove logo</button>}</div>
          </div>
        </details>
      </ToolStep>

      <ToolStep n={3} id="ce-preview" title="Check the preview" hint={list.length ? "This is the first certificate. Every other name gets the same page with their own name." : "Add a name in step 1 and your certificate appears here."}>
        <div ref={box} className="w-full overflow-hidden rounded-xl border border-white/[0.14]" style={{ height: H * scale }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: W, height: H }}><Cert f={{ ...f, award: list[0]?.award ?? f.award }} name={list[0]?.name ?? ""} design={design} logo={logo} brandAccent={useBrandColour ? brand?.primary : undefined} /></div>
        </div>
      </ToolStep>

      <ToolStep n={4} id="ce-pdf" title="Save it as a PDF" done={status.startsWith("Done")} hint="Press the button. A PDF with one page per name downloads. Print it at 100% size on A4 paper, landscape.">
        <div className="flex flex-wrap items-center gap-3"><button type="button" className="btn" disabled={!list.length || busy} onClick={make}>{busy ? "Working…" : `Download PDF (${list.length})`}</button><span role="status" aria-live="polite" className={`text-sm ${status.startsWith("Done") ? "text-emerald-300" : "text-zinc-300"}`}>{status || (list.length ? "" : "Add at least one name in step 1 first.")}</span></div>
      </ToolStep>
      {/* Off-screen copy used to draw each page */}
      <div aria-hidden="true" style={{ position: "fixed", left: -99999, top: 0 }}><div ref={off}><Cert f={{ ...f, award: live?.award ?? f.award }} name={live?.name ?? ""} design={design} logo={logo} brandAccent={useBrandColour ? brand?.primary : undefined} /></div></div>
    </div>
  );
}
