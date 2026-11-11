"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { explain, live } from "@/lib/api/cloud";
import { LIMITS, emptySnapshot, formatLocalTime, isLogo, liveUrl, tooBig, withExtras, type Announcement, type LiveState, type Sponsor } from "@/lib/live";
import { logoFromFile } from "@/components/live/logo";

const input = "min-h-11 w-full min-w-0 rounded-lg border border-zinc-700 bg-[#0a0b0d] px-3 text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan";

/** The event page's control for the public live page: publish switch, link, QR poster, announcements, sponsors and ticker. */
export default function LivePagePanel({ eventId }: { eventId: string }) {
  const [state, setState] = useState<LiveState | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [ann, setAnn] = useState<Announcement[]>([]);
  const [spons, setSpons] = useState<Sponsor[]>([]);
  const [ticker, setTicker] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const adopt = (s: LiveState) => { setState(s); const sn = s.snapshot ?? emptySnapshot(); setAnn(sn.announcements); setSpons(sn.sponsors); setTicker(sn.ticker); };
  useEffect(() => {
    let alive = true;
    live.get(eventId).then((s) => { if (alive) adopt(s); }).catch((e) => { if (alive) setLoadErr(explain(e)); });
    return () => { alive = false; };
  }, [eventId]);

  const url = state?.slug && typeof location !== "undefined" ? liveUrl(location.origin, state.slug) : "";
  useEffect(() => { if (url && canvas.current) QRCode.toCanvas(canvas.current, url, { width: 192, margin: 2 }).catch(() => undefined); }, [url]);

  const saved = state?.snapshot ?? emptySnapshot();
  const dirty = JSON.stringify([saved.announcements, saved.sponsors, saved.ticker]) !== JSON.stringify([ann, spons, ticker]);

  const togglePublish = async () => {
    if (!state || busy) return;
    const on = !state.published;
    if (!confirm(on ? "Publish the live page? Anyone with the link will be able to see it." : "Unpublish the live page? The link will stop working until you publish again.")) return;
    setBusy(true); setMsg(null);
    try { const s = await live.put(eventId, { published: on }); setState(s); setMsg({ ok: true, text: s.published ? "The live page is on. Anyone with the link can see it." : "The live page is off. The link shows that it is not live." }); }
    catch (e) { setMsg({ ok: false, text: explain(e) }); } finally { setBusy(false); }
  };

  const save = async () => {
    if (busy) return;
    setBusy(true); setMsg(null);
    try {
      const fresh = await live.get(eventId); // the views may have been published from a tool since this panel opened: keep them
      const snapshot = withExtras(fresh.snapshot, { announcements: ann, sponsors: spons, ticker: ticker.filter((t) => t.trim()) });
      if (tooBig(snapshot)) { setMsg({ ok: false, text: "That is too large to save. Remove a sponsor logo and try again." }); return; }
      adopt(await live.put(eventId, { snapshot }));
      setMsg({ ok: true, text: "Saved." });
    } catch (e) { setMsg({ ok: false, text: explain(e) }); } finally { setBusy(false); }
  };

  const post = () => {
    const t = text.trim();
    if (!t) return;
    setAnn([{ text: t.slice(0, LIMITS.announcementText), at: new Date().toISOString() }, ...ann].slice(0, LIMITS.announcements)); setText(""); setMsg(null);
  };
  const copy = async () => { try { await navigator.clipboard.writeText(url); setMsg({ ok: true, text: "Link copied." }); } catch { setMsg({ ok: false, text: "Could not copy. Select the link and copy it." }); } };
  const downloadQr = async () => {
    try { const a = document.createElement("a"); a.href = await QRCode.toDataURL(url, { width: 1024, margin: 4 }); a.download = "live-page-qr.png"; a.click(); }
    catch { setMsg({ ok: false, text: "Could not make the picture. Try again." }); }
  };
  const setLogo = async (i: number, f: File | undefined) => {
    if (!f) return;
    try { const logo = await logoFromFile(f); setSpons((s) => s.map((x, k) => (k === i ? { ...x, logo } : x))); setMsg(null); }
    catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
  };

  return (
    <section aria-label="Live page" className="card space-y-5 !p-4">
      <div>
        <h3 className="font-display text-lg font-bold text-white">Live page for players and visitors</h3>
        <p className="mt-1 text-sm text-zinc-300">Players and visitors open one link on their phone and see the standings, schedule and bracket you publish, your announcements and your sponsors, and the page updates by itself.</p>
      </div>
      {loadErr && <p role="alert" className="text-sm text-red-300">{loadErr}</p>}
      {!state && !loadErr && <p role="status" className="text-sm text-zinc-400">Loading…</p>}
      {state && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" role="switch" aria-checked={state.published} aria-label="Live page is published" disabled={busy} onClick={togglePublish} className={`relative h-11 w-20 shrink-0 rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-cyan ${state.published ? "border-cyan bg-cyan" : "border-zinc-600 bg-zinc-800"}`}><span aria-hidden="true" className={`absolute top-1.5 h-7 w-7 rounded-full bg-[#05070a] transition-all ${state.published ? "left-11" : "left-1.5 !bg-zinc-300"}`} /></button>
            <p className="text-sm font-semibold text-zinc-100">{state.published ? "Published: anyone with the link can see it" : "Not published: nobody can see it yet"}</p>
          </div>

          {url && (
            <div className="space-y-3">
              <p className="break-all rounded-lg border border-white/10 bg-[#0a0b0d] px-3 py-2 font-mono text-xs text-zinc-200" aria-label="Public link">{url}</p>
              <div className="flex flex-wrap items-start gap-4">
                <canvas ref={canvas} width={192} height={192} role="img" aria-label="QR code for the live page link" className="h-48 w-48 rounded-lg bg-white" />
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={copy}>Copy link</button>
                  <a href={url} target="_blank" rel="noreferrer" className="btn-ghost !min-h-11 px-4 text-sm">Open the page</a>
                  <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={downloadQr}>Download QR for a poster</button>
                </div>
              </div>
            </div>
          )}
          {!url && <p className="text-sm text-zinc-400">The link appears here after you publish for the first time.</p>}

          <div className="space-y-2 border-t border-white/10 pt-4">
            <h4 className="font-semibold text-white">Announcements</h4>
            <div className="flex gap-2"><label className="min-w-0 flex-1"><span className="sr-only">New announcement</span><input value={text} maxLength={LIMITS.announcementText} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); post(); } }} placeholder="For example: Round 2 starts at 3 pm" className={input} /></label><button type="button" className="btn-ghost !min-h-11 shrink-0 px-4 text-sm" onClick={post} disabled={!text.trim()}>Post</button></div>
            <p className="text-xs text-zinc-400">Up to {LIMITS.announcementText} characters, {LIMITS.announcements} at a time. Newest first. Press Save to send it.</p>
            {ann.length > 0 && <ul className="space-y-1.5">{ann.map((a, i) => <li key={`${a.at}-${i}`} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm"><span className="shrink-0 text-xs text-zinc-400">{formatLocalTime(a.at)}</span><span className="min-w-0 flex-1 break-words text-zinc-100">{a.text}</span><button type="button" className="btn-ghost !min-h-11 shrink-0 px-3 text-xs" aria-label={`Delete announcement: ${a.text}`} onClick={() => setAnn(ann.filter((_, k) => k !== i))}>Delete</button></li>)}</ul>}
          </div>

          <div className="space-y-2 border-t border-white/10 pt-4">
            <h4 className="font-semibold text-white">Sponsors</h4>
            <p className="text-xs text-zinc-400">Up to {LIMITS.sponsors}. A logo is made small in your browser first (at most 240 pixels wide).</p>
            <ul className="space-y-2">{spons.map((s, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 p-2">
                {isLogo(s.logo) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.logo} alt={`${s.name || "Sponsor"} logo`} className="h-11 w-auto max-w-[120px] rounded bg-white/5 object-contain" />}
                <label className="min-w-[8rem] flex-1"><span className="sr-only">Sponsor {i + 1} name</span><input value={s.name} maxLength={LIMITS.sponsorName} placeholder="Sponsor name" onChange={(e) => setSpons(spons.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} className={input} /></label>
                <label className="btn-ghost !min-h-11 cursor-pointer px-3 text-xs focus-within:ring-2 focus-within:ring-cyan"><span>{s.logo ? "Change logo" : "Add logo"}<span className="sr-only"> for sponsor {i + 1}</span></span><input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(e) => { void setLogo(i, e.target.files?.[0]); e.target.value = ""; }} /></label>
                {s.logo && <button type="button" className="btn-ghost !min-h-11 px-3 text-xs" onClick={() => setSpons(spons.map((x, k) => (k === i ? { name: x.name } : x)))}>Remove logo</button>}
                <button type="button" className="btn-ghost !min-h-11 px-3 text-xs" aria-label={`Remove sponsor ${i + 1}`} onClick={() => setSpons(spons.filter((_, k) => k !== i))}>Remove</button>
              </li>))}</ul>
            {spons.length < LIMITS.sponsors && <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => setSpons([...spons, { name: "" }])}>Add a sponsor</button>}
          </div>

          <div className="space-y-2 border-t border-white/10 pt-4">
            <h4 className="font-semibold text-white">Ticker lines</h4>
            <p className="text-xs text-zinc-400">Short lines that scroll along the bottom of the page. Up to {LIMITS.ticker}, {LIMITS.tickerLine} characters each.</p>
            <ul className="space-y-2">{ticker.map((t, i) => <li key={i} className="flex gap-2"><label className="min-w-0 flex-1"><span className="sr-only">Ticker line {i + 1}</span><input value={t} maxLength={LIMITS.tickerLine} onChange={(e) => setTicker(ticker.map((x, k) => (k === i ? e.target.value : x)))} className={input} /></label><button type="button" className="btn-ghost !min-h-11 shrink-0 px-3 text-xs" aria-label={`Remove ticker line ${i + 1}`} onClick={() => setTicker(ticker.filter((_, k) => k !== i))}>Remove</button></li>)}</ul>
            {ticker.length < LIMITS.ticker && <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => setTicker([...ticker, ""])}>Add a ticker line</button>}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
            <button type="button" className="btn px-5" disabled={busy || !dirty} onClick={save}>{busy ? "Saving…" : "Save"}</button>
            {dirty && <span className="text-sm text-amber-200">You have changes that are not saved.</span>}
          </div>
        </>
      )}
      <p role="status" aria-live="polite" className={`min-h-5 text-sm ${msg?.ok ? "text-emerald-300" : "text-red-300"}`}>{msg?.text}</p>
    </section>
  );
}
