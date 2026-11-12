"use client";

import { useEffect, useRef, useState } from "react";
import { sendEvent } from "@/lib/track";
import { cardFontVars } from "@/components/idcard/fonts";
import { shareOrDownload } from "@/components/display/shareFile";
import { logoFromFile } from "@/lib/extras-store";
import { downloadBlob } from "@/lib/idcard/download";
import { EMPTY_POSTER, MAX_POSTER_SPONSORS, POSTER_FORMATS, POSTER_SIZES, POSTER_TEMPLATES, posterFileName, posterWhatsappLink, renderPoster, templateById, type PosterData, type PosterFormat, type PosterSponsor } from "@/lib/poster-cards";
import { themeById } from "@/lib/display-themes";
import { useBrand } from "@/lib/brand";
import ToolStep from "./ToolStep";

const SAMPLE: PosterData = { event: "Inter-College Cup", date: "", venue: "", game: "Free Fire", prize: "", organiser: "", sponsors: [] };

/**
 * Three steps: say what the event is, pick a look and a shape, then download or share. The picture is drawn in this browser on a canvas.
 * Nothing is uploaded, and nothing is added to the poster that was not typed here.
 */
export default function PosterMaker() {
  const [data, setData] = useState<PosterData>(SAMPLE);
  const [template, setTemplate] = useState("free-fire");
  const [format, setFormat] = useState<PosterFormat>("poster");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const urlRef = useRef<string | null>(null);

  const set = <K extends keyof PosterData>(k: K, v: PosterData[K]) => setData((d) => ({ ...d, [k]: v }));
  const pickTemplate = (id: string) => {
    const was = templateById(template).game;
    setTemplate(id);
    // Follow the template's game name unless the organiser typed their own.
    setData((d) => (!d.game.trim() || d.game === was ? { ...d, game: templateById(id).game } : d));
  };
  const setSponsor = (i: number, s: PosterSponsor) => setData((d) => ({ ...d, sponsors: d.sponsors.map((x, k) => (k === i ? s : x)) }));
  const ready = data.event.trim().length > 0;
  const brand = useBrand(); // your account brand kit; null when signed out or none saved
  const applyBrand = () => {
    if (!brand) return;
    const mine: PosterSponsor = { name: (brand.name || "My brand").slice(0, 40), ...(brand.logo ? { logo: brand.logo } : null) };
    setData((d) => ({ ...d, organiser: d.organiser.trim() ? d.organiser : (brand.name ?? "").slice(0, 60), sponsors: [mine, ...d.sponsors.filter((x) => x.name !== mine.name)].slice(0, MAX_POSTER_SPONSORS) }));
    setMsg({ ok: true, text: "Added your brand name as organiser (if empty) and your logo to the sponsor row. The look keeps its own colours." });
  };

  // Redraw the preview shortly after the last change.
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(async () => {
      try {
        const blob = await renderPoster(data, { format, template, fontClass: cardFontVars });
        if (!alive) return;
        const url = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url; setPreview(url);
      } catch { if (alive) setPreview(null); }
    }, 250);
    return () => { alive = false; clearTimeout(timer); };
  }, [data, format, template]);
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  const make = async () => renderPoster(data, { format, template, fontClass: cardFontVars });
  const share = async () => {
    if (!ready || busy) return;
    setBusy(true); setMsg(null);
    try {
      const r = await shareOrDownload(await make(), posterFileName(data.event, format), data.event || "Tournament poster");
      if (r !== "cancelled") sendEvent("tool_complete", "poster"); setMsg(r === "cancelled" ? null : { ok: true, text: r === "shared" ? "Shared." : "Saved the picture. Open WhatsApp or Instagram and choose it from your gallery." });
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "The picture could not be made. Try again." }); }
    setBusy(false);
  };
  const download = async () => {
    if (!ready || busy) return;
    setBusy(true); setMsg(null);
    try { downloadBlob(await make(), posterFileName(data.event, format)); sendEvent("tool_complete", "poster"); setMsg({ ok: true, text: "Saved the PNG picture." }); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "The picture could not be made. Try again." }); }
    setBusy(false);
  };

  const size = POSTER_SIZES[format];
  return (
    <div className="space-y-5">
      <ToolStep n={1} id="po-event" title="What is the event?" done={ready}
        hint="Type the facts that go on the poster. Only what you type appears: leave the date, venue, prize or organiser empty and that line is left out."
        status={ready ? data.event.trim() : undefined}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-zinc-200 sm:col-span-2">Event name<input className="field mt-1 font-semibold" maxLength={60} value={data.event} onChange={(e) => set("event", e.target.value)} placeholder="Inter-College Cup" /></label>
          <label className="block text-sm text-zinc-200">Date<input className="field mt-1" type="date" value={/^\d{4}-\d{2}-\d{2}$/.test(data.date) ? data.date : ""} onChange={(e) => set("date", e.target.value)} /></label>
          <label className="block text-sm text-zinc-200">Game or sport<input className="field mt-1" maxLength={30} value={data.game} onChange={(e) => set("game", e.target.value)} placeholder="Free Fire" /></label>
          <label className="block text-sm text-zinc-200 sm:col-span-2">Venue<input className="field mt-1" maxLength={70} value={data.venue} onChange={(e) => set("venue", e.target.value)} placeholder="College auditorium, your city" /></label>
          <label className="block text-sm text-zinc-200">Prize line<input className="field mt-1" maxLength={70} value={data.prize} onChange={(e) => set("prize", e.target.value)} placeholder="Type your own prize text" /></label>
          <label className="block text-sm text-zinc-200">Organiser<input className="field mt-1" maxLength={60} value={data.organiser} onChange={(e) => set("organiser", e.target.value)} placeholder="Your club or cafe" /></label>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-200">Sponsors (up to {MAX_POSTER_SPONSORS}, optional)</p>
          {brand && <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={applyBrand}>Use my brand</button>}
          <ul className="space-y-3">
            {data.sponsors.map((s, i) => (
              <li key={i} className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 p-3">
                <span className="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-md bg-white/90 p-1">
                  {s.logo
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={s.logo} alt={`${s.name || "Sponsor"} logo preview`} className="max-h-full max-w-full object-contain" />
                    : <span className="px-1 text-center text-[10px] font-semibold leading-tight text-zinc-700">No logo</span>}
                </span>
                <label className="min-w-0 flex-1 basis-40 text-xs text-zinc-300">Name<input className="field !min-h-11 mt-0.5 w-full" maxLength={40} value={s.name} onChange={(e) => setSponsor(i, { ...s, name: e.target.value })} /></label>
                <label className="basis-48 text-xs text-zinc-300">Logo (PNG or JPEG)
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="field !min-h-11 mt-0.5 w-full text-xs"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]; e.target.value = "";
                      if (!file) return;
                      try { const logo = await logoFromFile(file); setSponsor(i, { ...s, logo }); setMsg({ ok: true, text: `Logo added for ${s.name || `sponsor ${i + 1}`}.` }); }
                      catch (err) { setMsg({ ok: false, text: err instanceof Error ? err.message : "That logo could not be used." }); }
                    }} />
                </label>
                <button type="button" className="chip shrink-0" aria-label={`Remove sponsor ${s.name || i + 1}`} onClick={() => setData((d) => ({ ...d, sponsors: d.sponsors.filter((_, k) => k !== i) }))}>Remove</button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" disabled={data.sponsors.length >= MAX_POSTER_SPONSORS} onClick={() => setData((d) => ({ ...d, sponsors: [...d.sponsors, { name: `Sponsor ${d.sponsors.length + 1}` }] }))}>Add a sponsor</button>
          <p className="text-xs leading-5 text-zinc-400">Logos are shrunk to fit in your browser and stay on your device. Use a logo you have the right to use.</p>
        </div>
        <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" onClick={() => { setData(EMPTY_POSTER); setMsg(null); }}>Clear everything</button>
      </ToolStep>

      <ToolStep n={2} id="po-look" title="Pick a look" done={ready} hint="Each look uses the colours and lettering of one of the 14 TV screen designs. Choose the shape for where you will post it."
        status={`${templateById(template).name} · ${size.label}`}>
        <div role="group" aria-label="Look" className="flex flex-wrap gap-2">
          {POSTER_TEMPLATES.map((t) => (
            <button key={t.id} type="button" className="chip !min-h-11" aria-pressed={template === t.id} onClick={() => pickTemplate(t.id)}>
              <span aria-hidden="true" className="mr-2 inline-block h-3 w-3 rounded-full" style={{ background: themeById(t.theme).accent }} />{t.name}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Shape" className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-200">Shape:</span>
          {POSTER_FORMATS.map((f) => <button key={f} type="button" className="chip" aria-pressed={format === f} onClick={() => setFormat(f)}>{POSTER_SIZES[f].label}</button>)}
        </div>
        <div className="grid place-items-center rounded-xl border border-white/10 bg-[#0a0b0d] p-3">
          {preview
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={preview} alt={`Preview of the poster for ${data.event || "your tournament"}`} width={size.w} height={size.h} className="h-auto max-h-[70vh] w-auto max-w-full rounded-lg" />
            : <p className="p-8 text-sm text-zinc-300">The preview appears here.</p>}
        </div>
      </ToolStep>

      <ToolStep n={3} id="po-share" title="Download or share" hint="The picture is made on this device. On a phone the share button opens the share sheet; on a computer it saves the file.">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn px-5" disabled={!ready || busy} onClick={share}>{busy ? "Making the picture…" : "Share on WhatsApp or Instagram"}</button>
          <button type="button" className="btn-ghost px-4 text-sm" disabled={!ready || busy} onClick={download}>Download PNG ({size.w} x {size.h})</button>
          {ready ? <a className="btn-ghost px-4 text-sm" href={posterWhatsappLink(data)} target="_blank" rel="noopener noreferrer">Send the text on WhatsApp</a> : <span className="btn-ghost px-4 text-sm opacity-50" aria-disabled="true">Send the text on WhatsApp</span>}
        </div>
        {!ready && <p className="text-sm text-amber-200">Type an event name in step 1 to enable these buttons.</p>}
        <p role="status" aria-live="polite" className={`min-h-5 text-xs ${msg?.ok ? "text-emerald-300" : "text-amber-200"}`}>{msg?.text ?? ""}</p>
      </ToolStep>
    </div>
  );
}
