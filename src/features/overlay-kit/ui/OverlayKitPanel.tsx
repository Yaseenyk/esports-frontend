"use client";

import Link from "next/link";
import { useState } from "react";
import ThemePicker from "@/components/display/ThemePicker";
import { themeById } from "@/lib/display-themes";
import {
  AREA_NAME, COUNT_MAX, KIT_AREAS, KIT_SOURCES, KIT_VIEWS, SAFE_MAX, SCALE_MAX, SCALE_MIN, SOURCE_LABEL, SOURCE_PATH, VIEW_COUNT, VIEW_NAME,
  type KitArea, type KitSource, type KitView,
} from "@/features/overlay-kit/domain";
import { useKitPanel } from "@/features/overlay-kit/hooks/useKitPanel";

const field = "mt-1 min-h-11 w-full rounded-lg border border-white/10 bg-surface px-3 text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400";
const label = "block text-sm text-zinc-300";
const secondary = "inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 text-sm text-zinc-100 hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400";
const primary = "inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400";
const HELP: Record<KitView, string> = {
  points: "Rank, team, kills, wins and points (played, won and lost for a league), straight from the tool's own ranking.",
  fraggers: "The kill leaders. Uses the player kills below when you add any; otherwise team kills from a battle royale points table.",
  cards: "One card per team: a drawn badge, the team name, current rank and points. Name one team for a team camera scene.",
};

/** The overlay kit's control panel: what data this browser has, the three overlays with their OBS links, a live preview and player kills. */
export default function OverlayKitPanel() {
  const k = useKitPanel();
  const [msg, setMsg] = useState<Partial<Record<KitView, string>>>({});
  const age = k.chosen ? Math.max(0, Math.round((Date.now() - k.chosen.at) / 60000)) : 0;

  return (
    // Phones: steps, then the preview, then player kills. From lg: the steps on the left and the preview sticky on the right.
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
      <div className="order-1 space-y-8 lg:col-start-1 lg:row-start-1">
      <section aria-labelledby="kit-data" className="space-y-3">
        <h2 id="kit-data" className="font-display text-2xl text-zinc-100">1. Your table in this browser</h2>
        {!k.ready ? (
          // Same text and size as the empty state, hidden, so the line below does not jump when the browser data is read.
          <p aria-hidden="true" className="invisible text-zinc-300">No table yet. Open a points table tool in this browser, enter your teams and switch on &ldquo;Send to the OBS overlay&rdquo; under the table.</p>
        ) : k.chosen ? (
          <p role="status" className="text-zinc-300" data-testid="kit-source">
            Using <strong className="text-zinc-100">{SOURCE_LABEL[k.chosen.source]}</strong>: {k.chosen.teams.length} {k.chosen.teams.length === 1 ? "team" : "teams"}, leader {k.chosen.teams[0]?.team ?? "none yet"}, updated {age === 0 ? "just now" : `${age} min ago`}.
          </p>
        ) : (
          <p role="status" className="text-zinc-300" data-testid="kit-source">
            No table yet. Open a points table tool in this browser, enter your teams and switch on &ldquo;Send to the OBS overlay&rdquo; under the table.
          </p>
        )}
        <ul className="flex flex-wrap gap-2" aria-label="Points table tools">
          {KIT_SOURCES.map((s) => <li key={s}><Link href={SOURCE_PATH[s]} className={secondary}>{SOURCE_LABEL[s]}</Link></li>)}
        </ul>
        <label className={`${label} max-w-sm`}>Which tool feeds the overlays
          <select className={field} value={k.look.src} onChange={(e) => k.setLook({ ...k.look, src: e.target.value as KitSource | "auto" })}>
            <option value="auto">Whichever tool sent last</option>
            {KIT_SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}
          </select>
        </label>
      </section>

      <section aria-labelledby="kit-look" className="space-y-4 border-t border-white/10 pt-6">
        <h2 id="kit-look" className="font-display text-2xl text-zinc-100">2. The look</h2>
        <p className="text-sm text-zinc-300">Design now: {themeById(k.look.theme).name}. The overlays use the same designs as the TV display screens.</p>
        <ThemePicker value={k.look.theme} onChange={(theme) => k.setLook({ ...k.look, theme })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>Safe area margin: {k.look.safe}% of the width and height
            <input type="range" className="mt-2 min-h-11 w-full accent-cyan-400" min={0} max={SAFE_MAX} step={0.5} value={k.look.safe} onChange={(e) => k.setLook({ ...k.look, safe: Number(e.target.value) })} />
          </label>
          <label className={label}>Text size: {Math.round(k.look.scale * 100)}%
            <input type="range" className="mt-2 min-h-11 w-full accent-cyan-400" min={SCALE_MIN} max={SCALE_MAX} step={0.05} value={k.look.scale} onChange={(e) => k.setLook({ ...k.look, scale: Number(e.target.value) })} />
          </label>
        </div>
        <label className="flex min-h-11 items-center gap-3 text-sm text-zinc-100">
          <input type="checkbox" className="h-5 w-5 shrink-0 accent-cyan-400" checked={k.withData} onChange={(e) => k.setWithData(e.target.checked)} />
          Put a snapshot of the current table in the link (for an OBS that cannot see this browser; copy the link again after each match)
        </label>
      </section>

      <section aria-labelledby="kit-views" className="space-y-4 border-t border-white/10 pt-6">
        <h2 id="kit-views" className="font-display text-2xl text-zinc-100">3. The overlays and their OBS links</h2>
        <ul className="space-y-6">
          {KIT_VIEWS.map((v) => {
            const cfg = k.views[v], url = k.urlFor(v);
            return (
              <li key={v} className="space-y-3 border-t border-white/10 pt-4 first:border-t-0 first:pt-0" data-testid={`kit-view-${v}`}>
                <h3 className="font-display text-lg text-zinc-100">{VIEW_NAME[v]}</h3>
                <p className="text-sm text-zinc-300">{HELP[v]}</p>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
                  <label className={label}>Where on screen
                    <select className={field} value={cfg.area} onChange={(e) => k.setView(v, { area: e.target.value as KitArea })}>
                      {KIT_AREAS.map((a) => <option key={a} value={a}>{AREA_NAME[a]}</option>)}
                    </select>
                  </label>
                  <label className={label}>{v === "cards" ? "Cards" : "Rows"} (default {VIEW_COUNT[v]}, up to {COUNT_MAX[v]})
                    <input className={field} inputMode="numeric" value={cfg.n || ""} placeholder={String(VIEW_COUNT[v])} onChange={(e) => k.setView(v, { n: Math.min(COUNT_MAX[v], Math.floor(Number(e.target.value.replace(/\D/g, "").slice(0, 2)) || 0)) })} />
                  </label>
                  {v === "cards" && (
                    <label className={label}>Only this team (optional)
                      <input className={field} value={cfg.team} maxLength={60} onChange={(e) => k.setView(v, { team: e.target.value })} />
                    </label>
                  )}
                </div>
                <label className={label}>OBS browser source URL
                  <input className={`${field} font-mono text-xs`} readOnly value={url} onFocus={(e) => e.currentTarget.select()} data-testid={`kit-url-${v}`} />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" className={primary} disabled={!url} onClick={async () => { const ok = await k.copy(v); setMsg((m) => ({ ...m, [v]: ok ? "Copied. Paste it into the URL box of an OBS Browser Source." : "Copying is blocked here: select the URL above and copy it yourself." })); }}>Copy OBS URL</button>
                  <button type="button" className={secondary} aria-pressed={k.preview === v} onClick={() => k.setPreview(v)}>Show in preview</button>
                  <a className={secondary} href={url || undefined} target="_blank" rel="noopener">Open in a new tab</a>
                </div>
                <p role="status" aria-live="polite" className="min-h-5 text-xs text-zinc-400">{msg[v] ?? ""}</p>
              </li>
            );
          })}
        </ul>
      </section>

      </div>

      <section aria-labelledby="kit-preview" className="order-2 space-y-3 border-t border-white/10 pt-6 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-t-0 lg:pt-0">
        <h2 id="kit-preview" className="font-display text-2xl text-zinc-100">Preview: {VIEW_NAME[k.preview]}</h2>
        <p className="text-sm text-zinc-300">A 16:9 frame, like a 1920 by 1080 OBS canvas. The dark box stands in for your gameplay; in OBS the background is transparent. It updates live from the tool.</p>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-surface">
          {k.previewUrl && <iframe key={k.preview} title={`Preview of the ${VIEW_NAME[k.preview]} overlay`} src={k.previewUrl} className="h-full w-full" data-testid="kit-preview" />}
          {k.example && <p className="absolute right-2 top-2 rounded-lg border border-warning bg-ink px-2 py-1 text-xs font-semibold text-warning" data-testid="kit-example">Example data</p>}
        </div>
        {k.example && <p className="text-sm text-zinc-400" role="note">Example data: sample teams so you can see the look. It stays in this preview: it is never sent to your OBS links or saved. Send a real table from a points table tool to replace it.</p>}
      </section>

      <section aria-labelledby="kit-players" className="order-3 space-y-3 border-t border-white/10 pt-6 lg:col-start-1 lg:row-start-2">
        <h2 id="kit-players" className="font-display text-2xl text-zinc-100">Player kills for top fraggers (optional)</h2>
        <p className="text-sm text-zinc-300">The points tools count kills per team. To show player names, type each player&apos;s kills here; the overlay changes as you type. Saved in this browser only.</p>
        {k.rows.length === 0 ? <p className="text-sm text-zinc-400">No players yet. Without players, the top fraggers overlay shows team kills.</p> : (
          <ul className="space-y-2">
            {k.rows.map((r, i) => (
              <li key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                <input aria-label={`Player ${i + 1} name`} className={field} value={r.name} maxLength={60} placeholder="Player" onChange={(e) => k.setPlayer(i, { name: e.target.value })} />
                <input aria-label={`Player ${i + 1} team`} className={field} value={r.team} maxLength={60} placeholder="Team" onChange={(e) => k.setPlayer(i, { team: e.target.value })} />
                <input aria-label={`Player ${i + 1} kills`} className={field} inputMode="numeric" value={String(r.kills)} onChange={(e) => k.setPlayer(i, { kills: e.target.value })} />
                <button type="button" className={secondary} aria-label={`Remove player ${i + 1}`} onClick={() => k.removePlayer(i)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="button" className={secondary} onClick={k.addPlayer}>Add a player</button>
          {k.rows.length > 0 && <button type="button" className={`${secondary} text-danger`} onClick={k.clearAll}>Clear all players</button>}
        </div>
      </section>
    </div>
  );
}
