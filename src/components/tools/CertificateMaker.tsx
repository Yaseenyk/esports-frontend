"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { downloadBlob } from "@/lib/idcard/download";

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
function Cert({ f, name, design, logo }: { f: Fields; name: string; design: Design; logo: string }) {
  const dark = design === "dark";
  const ink = dark ? "#f4f4f5" : "#111827", soft = dark ? "#a1a1aa" : "#4b5563", accent = dark ? "#22d3ee" : design === "classic" ? "#0e7490" : "#7c3aed";
  const frame: React.CSSProperties = design === "classic" ? { border: `10px double ${accent}`, margin: 28 } : design === "dark" ? { border: `3px solid ${accent}`, margin: 36, boxShadow: `inset 0 0 0 10px #0a0b0d, inset 0 0 0 12px #a855f7` } : { borderLeft: `18px solid ${accent}`, margin: 0 };
  return (
    <div style={{ width: W, height: H, background: dark ? "#0a0b0d" : "#ffffff", color: ink, position: "relative", fontFamily: design === "minimal" ? "system-ui, 'Segoe UI', sans-serif" : "Georgia, 'Times New Roman', serif", boxSizing: "border-box" }}>
      <div style={{ ...frame, height: design === "minimal" ? H : H - (design === "classic" ? 56 : 72), boxSizing: "border-box", padding: "56px 90px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logo ? <img src={logo} alt="" style={{ height: 86, objectFit: "contain", marginBottom: 14 }} /> : <div style={{ height: 86 }} />}
        <div style={{ fontSize: 50, fontWeight: 700, letterSpacing: 1, color: accent, lineHeight: 1.1 }}>{f.heading}</div>
        <div style={{ fontSize: 22, color: soft, marginTop: 28 }}>{f.intro}</div>
        <div style={{ fontSize: name.length > 28 ? 46 : 62, fontWeight: 700, margin: "14px 0 10px", lineHeight: 1.1, borderBottom: `3px solid ${accent}`, padding: "0 28px 10px", maxWidth: "100%" }}>{name || "Participant name"}</div>
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
  const list = useMemo(() => names.split("\n").map((n) => n.trim()).filter(Boolean), [names]);
  const [live, setLive] = useState<string>("");
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
    } catch { setStatus("Could not make the PDF. Try fewer names at a time."); } finally { setBusy(false); setLive(""); }
  }, [list, busy]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section className="card min-w-0 space-y-3" aria-label="Certificate details">
          <h3 className="font-display text-lg font-bold text-white">1. Details</h3>
          <label className="block text-sm text-zinc-200">Names, one per line<textarea className="field mt-1 min-h-28 py-2" value={names} onChange={(e) => setNames(e.target.value)} spellCheck={false} /></label>
          <p className="text-xs text-zinc-400">{list.length} certificate{list.length === 1 ? "" : "s"}. Up to 100 per file works well.</p>
          <label className="block text-sm text-zinc-200">Design<select className="field mt-1" value={design} onChange={(e) => setDesign(e.target.value as Design)}>{DESIGNS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}</select></label>
          <label className="block text-sm text-zinc-200">Heading<input className="field mt-1" value={f.heading} onChange={set("heading")} /></label>
          <label className="block text-sm text-zinc-200">Award or result<input className="field mt-1" value={f.award} onChange={set("award")} /></label>
          <label className="block text-sm text-zinc-200">Wording<textarea className="field mt-1 min-h-20 py-2" value={f.body} onChange={set("body")} /><span className="mt-1 block text-xs text-zinc-400">{"{award}"}, {"{event}"} and {"{date}"} are filled in for you.</span></label>
          <label className="block text-sm text-zinc-200">Event<input className="field mt-1" value={f.event} onChange={set("event")} /></label>
          <label className="block text-sm text-zinc-200">Date<input className="field mt-1" value={f.date} onChange={set("date")} /></label>
          <label className="block text-sm text-zinc-200">Organiser<input className="field mt-1" value={f.org} onChange={set("org")} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm text-zinc-200">Signed by<input className="field mt-1" value={f.sign1} onChange={set("sign1")} /></label>
            <label className="block text-sm text-zinc-200">Title<input className="field mt-1" value={f.role1} onChange={set("role1")} /></label>
            <label className="block text-sm text-zinc-200">Signed by<input className="field mt-1" value={f.sign2} onChange={set("sign2")} /></label>
            <label className="block text-sm text-zinc-200">Title<input className="field mt-1" value={f.role2} onChange={set("role2")} /></label>
          </div>
          <div className="flex flex-wrap items-center gap-2"><label className="btn-ghost !min-h-10 cursor-pointer px-3 text-sm">{logo ? "Change logo" : "Add a logo"}<input type="file" accept="image/*" className="sr-only" onChange={(e) => { readLogo(e.target.files?.[0]); e.target.value = ""; }} /></label>{logo && <button type="button" className="chip" onClick={() => setLogo("")}>Remove logo</button>}</div>
        </section>

        <section className="min-w-0 space-y-3" aria-label="Preview">
          <h3 className="font-display text-lg font-bold text-white">2. Preview</h3>
          <div ref={box} className="w-full overflow-hidden rounded-xl border border-white/[0.14]" style={{ height: H * scale }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: W, height: H }}><Cert f={f} name={list[0] ?? ""} design={design} logo={logo} /></div>
          </div>
          <p className="text-xs text-zinc-400">The preview shows the first name. Each name gets its own page. Print at 100% on A4, landscape.</p>
          <div className="flex flex-wrap items-center gap-3"><button type="button" className="btn" disabled={!list.length || busy} onClick={make}>{busy ? "Working…" : `Download PDF (${list.length})`}</button><span role="status" aria-live="polite" className="text-sm text-zinc-300">{status}</span></div>
        </section>
      </div>
      {/* Off-screen copy used to draw each page */}
      <div aria-hidden="true" style={{ position: "fixed", left: -99999, top: 0 }}><div ref={off}><Cert f={f} name={live} design={design} logo={logo} /></div></div>
    </div>
  );
}
