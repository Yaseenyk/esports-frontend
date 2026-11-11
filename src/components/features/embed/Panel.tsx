"use client";

import { useEffect, useState } from "react";
import type { PanelProps } from "@/components/app/panels";
import ToolStep from "@/components/tools/ToolStep";
import { explain, live } from "@/lib/api/cloud";
import { EMBED_THEMES, EMBED_VIEWS, TEAM_MAX, VIEW_LABEL, embedUrl, iframeSnippet, scriptSnippet, type EmbedTheme, type EmbedView } from "@/lib/embed";
import { liveUrl, teamsOf, type LiveState } from "@/lib/live";

const VIEW_HINT: Record<EmbedView, string> = { standings: "Points table or battle royale standings.", bracket: "The knockout bracket.", schedule: "Match times for the day.", matches: "Every match with its score." };

function Snippet({ title, hint, code, preview, previewTitle }: { title: string; hint: string; code: string; preview: string; previewTitle: string }) {
  const [msg, setMsg] = useState("");
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(""), 4000); return () => clearTimeout(t); }, [msg]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setMsg("Copied. Now paste it into your website."); }
    catch { setMsg("Could not copy. Select the code in the box and copy it by hand."); }
  };
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-[#0a0b0d] p-3">
      <h4 className="font-display text-base font-bold text-white">{title}</h4>
      <p className="text-sm text-zinc-300">{hint}</p>
      <textarea readOnly rows={4} value={code} aria-label={`${title} code`} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-lg border border-zinc-700 bg-[#05070a] p-3 font-mono text-sm text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan" />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={copy} className="btn-ghost min-h-11 px-5 font-semibold">Copy</button>
        <p role="status" aria-live="polite" className="text-sm text-zinc-200">{msg}</p>
      </div>
      <details className="rounded-lg border border-white/10">
        <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-semibold text-zinc-100">See how it looks</summary>
        <div className="p-2">{preview ? <iframe src={preview} title={previewTitle} loading="lazy" className="h-80 w-full rounded-lg border-0 bg-[#05070a]" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" /> : null}</div>
      </details>
    </div>
  );
}

/** Put the live standings, bracket or schedule on your own website, in three steps. */
export default function Panel({ eventId, eventName }: PanelProps) {
  const [state, setState] = useState<LiveState | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [view, setView] = useState<EmbedView>("standings");
  const [theme, setTheme] = useState<EmbedTheme>("dark");
  const [team, setTeam] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    live.get(eventId).then((s) => { if (alive) { setState(s); setErr(""); } }).catch((e) => { if (alive) setErr(explain(e)); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [eventId]);

  const publish = async () => {
    if (busy) return;
    if (!confirm("Publish the live page? Anyone with the link, and anyone who sees your website, will be able to see it. You can switch it off later.")) return;
    setBusy(true); setMsg(null);
    try { const s = await live.put(eventId, { published: true }); setState(s); setMsg({ ok: true, text: "The live page is on. The code below now works." }); }
    catch (e) { setMsg({ ok: false, text: explain(e) }); } finally { setBusy(false); }
  };

  const slug = state?.slug ?? "";
  const ready = !!state?.published && !!slug;
  const teams = teamsOf(state?.snapshot ?? null);
  const o = { slug, view, theme, team };
  const origin = typeof location === "undefined" ? "" : location.origin;
  const radio = "flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 text-[15px] text-zinc-100 has-[:checked]:border-cyan has-[:checked]:bg-cyan/10";

  if (loading) return <section aria-label="Put it on your website" aria-busy="true" className="space-y-3"><p className="sr-only" role="status">Loading</p><div className="sk h-24 w-full rounded-2xl" /><div className="sk h-24 w-full rounded-2xl" /></section>;
  if (err || !state) return <section aria-label="Put it on your website" className="card space-y-2 !p-4"><p role="alert" className="text-sm text-amber-200">{err || "Could not load this."} Open this panel again to retry.</p></section>;

  return (
    <section aria-label="Put it on your website" className="space-y-4">
      <p className="text-sm text-zinc-300">Show the live results of {eventName} on your own website. It updates by itself every 20 seconds and shows a small link back to the live page. Nothing here changes your event.</p>

      {!ready && (
        <div className="card space-y-3 !border-amber-300/40 !p-4" role="note">
          <p className="font-semibold text-white">The live page is not published yet</p>
          <p className="text-sm text-zinc-300">The widget shows what is on the live page, so it stays empty until you publish it. Publishing makes the page public to anyone with the link. You can switch it off again in the Live page panel.</p>
          <button type="button" onClick={publish} disabled={busy} className="btn px-5">{busy ? "Publishing..." : "Publish the live page"}</button>
        </div>
      )}
      <p role="status" aria-live="polite" className={`empty:hidden text-sm ${msg?.ok ? "text-emerald-300" : "text-amber-200"}`}>{msg?.text}</p>

      <ToolStep n={1} title="Pick what to show" hint="One widget shows one thing. You can add as many widgets as you like, one per page section.">
        <fieldset className="space-y-2"><legend className="sr-only">What to show</legend>
          {EMBED_VIEWS.map((v) => <label key={v} className={radio}><input type="radio" name="eh-embed-view" className="mt-1 h-5 w-5 accent-cyan" checked={view === v} onChange={() => setView(v)} /><span><span className="block font-semibold text-white">{VIEW_LABEL[v]}</span><span className="block text-sm text-zinc-300">{VIEW_HINT[v]}</span></span></label>)}
        </fieldset>
      </ToolStep>

      <ToolStep n={2} title="Pick the look" hint="Choose the colours that match your website. You can also highlight one team.">
        <fieldset className="grid gap-2 sm:grid-cols-2"><legend className="sr-only">Colours</legend>
          {EMBED_THEMES.map((t) => <label key={t} className={radio}><input type="radio" name="eh-embed-theme" className="mt-1 h-5 w-5 accent-cyan" checked={theme === t} onChange={() => setTheme(t)} /><span><span className="block font-semibold text-white">{t === "dark" ? "Dark" : "Light"}</span><span className="block text-sm text-zinc-300">{t === "dark" ? "For dark or gaming websites." : "For white or light websites."}</span></span></label>)}
        </fieldset>
        <label className="block text-sm text-zinc-200"><span className="font-semibold">Highlight a team (optional)</span>
          {teams.length > 0
            ? <select value={team} onChange={(e) => setTeam(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-zinc-700 bg-[#05070a] px-3 text-base text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan"><option value="">No team</option>{teams.map((t) => <option key={t} value={t}>{t}</option>)}</select>
            : <input value={team} maxLength={TEAM_MAX} onChange={(e) => setTeam(e.target.value)} placeholder="Type a team name, or leave empty" className="mt-1 min-h-11 w-full rounded-lg border border-zinc-700 bg-[#05070a] px-3 text-base text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan" />}
        </label>
      </ToolStep>

      <ToolStep n={3} title="Copy the code" hint="Copy one of these and paste it into your website. The script option is best: it makes the box exactly as tall as the content.">
        {!ready ? <p className="text-sm text-zinc-300">Publish the live page above first. Then the code appears here.</p> : (
          <div className="space-y-3">
            <Snippet title="Option A: script (best)" hint="A small piece of code that also resizes the box to fit." code={scriptSnippet(o)} preview={origin ? embedUrl(o, origin) : ""} previewTitle="Preview of the script option" />
            <Snippet title="Option B: iframe" hint="Plain HTML for places that block scripts. The box has a fixed height of 480 pixels and scrolls inside if needed." code={iframeSnippet(o)} preview={origin ? embedUrl(o, origin) : ""} previewTitle="Preview of the iframe option" />
            <div className="space-y-2 text-sm text-zinc-300">
              <h4 className="font-display text-base font-bold text-white">Where to paste it</h4>
              <ul className="list-disc space-y-1 pl-5">
                <li><strong className="text-zinc-100">Google Sites:</strong> Insert, then Embed, then Embed code. Paste it there. Google Sites blocks the script option, so use Option B.</li>
                <li><strong className="text-zinc-100">WordPress:</strong> add a Custom HTML block and paste it there.</li>
                <li><strong className="text-zinc-100">Wix:</strong> Add, then Embed Code, then Embed HTML. Paste it there. Use Option B if the script does not run.</li>
              </ul>
              <p>Not sure? Open the page where you want it, find the block called HTML or Embed, and paste the code. Your live page is at <a className="underline underline-offset-4" href={origin ? liveUrl(origin, slug) : "#"} target="_blank" rel="noopener">its own address</a>.</p>
            </div>
          </div>
        )}
      </ToolStep>
    </section>
  );
}
