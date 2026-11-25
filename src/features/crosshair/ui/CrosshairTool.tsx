"use client";

import { useId } from "react";
import { Field, describedBy } from "@/features/shared/ui/Fields";
import { btnPrimary, btnSecondary, input } from "@/features/shared/ui/styles";
import { COLOURS, FAV_NAME_MAX, RANGES, colourHex, previewRects, type Lines, type Primary } from "@/features/crosshair/domain";
import { useCrosshair } from "@/features/crosshair/hooks/useCrosshair";

const BG = { dark: "#05070A", grey: "#71717A", light: "#D4D4D8" } as const;
const step = "space-y-3 border-t border-white/10 pt-5";

function Slider({ label, value, min, max, stepBy = 1, onChange }: { label: string; value: number; min: number; max: number; stepBy?: number; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor={id} className="w-40 text-sm text-zinc-100">{label}</label>
      <input id={id} type="range" min={min} max={max} step={stepBy} value={value} onChange={(e) => onChange(Number(e.target.value))} className="min-h-11 flex-1 accent-cyan" />
      <output htmlFor={id} className="w-12 text-right font-mono text-sm text-zinc-100 tabular-nums"><span key={value}>{value}</span></output>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-100">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-cyan" />{label}
    </label>
  );
}

function LineControls({ title, x, which, r, set }: { title: string; x: Lines; which: "inner" | "outer"; r: { t: readonly [number, number]; l: readonly [number, number]; o: readonly [number, number] }; set: (which: "inner" | "outer", k: keyof Lines, v: Lines[keyof Lines]) => void }) {
  return (
    <fieldset className={step}>
      <legend className="font-display text-lg text-zinc-100">{title}</legend>
      <Toggle label={`Show ${title.toLowerCase()}`} checked={x.show} onChange={(v) => set(which, "show", v)} />
      {x.show && (
        <>
          <Slider label="Thickness" value={x.thickness} min={r.t[0]} max={r.t[1]} onChange={(v) => set(which, "thickness", v)} />
          <Slider label={x.split ? "Horizontal length" : "Length"} value={x.length} min={r.l[0]} max={r.l[1]} onChange={(v) => set(which, "length", v)} />
          <Toggle label="Different vertical length" checked={x.split} onChange={(v) => set(which, "split", v)} />
          {x.split && <Slider label="Vertical length" value={x.vertical} min={r.l[0]} max={r.l[1]} onChange={(v) => set(which, "vertical", v)} />}
          <Slider label="Offset from centre" value={x.offset} min={r.o[0]} max={r.o[1]} onChange={(v) => set(which, "offset", v)} />
          <Slider label="Opacity" value={x.opacity} min={0} max={1} stepBy={0.05} onChange={(v) => set(which, "opacity", v)} />
        </>
      )}
    </fieldset>
  );
}

function Preview({ p, bg }: { p: Primary; bg: keyof typeof BG }) {
  const fill = colourHex(p);
  return (
    <svg viewBox="-48 -48 96 96" className="mx-auto h-64 w-64 rounded-xl border border-white/10" role="img" aria-label="Preview of the crosshair" shapeRendering="crispEdges" data-testid="xh-preview">
      <rect x="-48" y="-48" width="96" height="96" fill={BG[bg]} />
      {previewRects(p).map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.outline ? "#000000" : fill} fillOpacity={r.opacity} />)}
    </svg>
  );
}

/** Paste, preview, edit and copy a Valorant crosshair code. Codes and favourites stay in this browser (masked from Clarity). */
export default function CrosshairTool() {
  const x = useCrosshair();
  const p = x.p;
  return (
    <div className="space-y-6" data-clarity-mask="true">
      <Field id="xh-paste" label="Paste a crosshair code" help="From the game (the export arrow copies yours) or any page that lists codes." error={x.pasteError}>
        <textarea id="xh-paste" rows={2} value={x.paste} autoComplete="off" spellCheck={false} onChange={(e) => x.load(e.target.value)}
          aria-invalid={x.pasteError ? true : undefined} aria-describedby={describedBy("xh-paste", "help", x.pasteError)} className={`${input} py-2 font-mono text-sm`} />
      </Field>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Preview p={p} bg={x.bg} />
          <div role="group" aria-label="Preview background" className="flex flex-wrap justify-center gap-2">
            {(["dark", "grey", "light"] as const).map((b) => <button key={b} type="button" className="chip" aria-pressed={x.bg === b} onClick={() => x.setBg(b)}>{b === "dark" ? "Dark" : b === "grey" ? "Grey" : "Light"} background</button>)}
          </div>
          <p className="text-xs leading-5 text-zinc-400">An approximate preview at 1080p for comparing settings. The game draws it at your own resolution, so check it in the Range.</p>
        </div>
        <div className="space-y-3">
          <label htmlFor="xh-code" className="block text-sm font-medium text-zinc-100">Your code</label>
          <input id="xh-code" readOnly value={x.code} className={`${input} font-mono text-sm`} data-testid="xh-code" onFocus={(e) => e.currentTarget.select()} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={btnPrimary} onClick={x.copyCode}>Copy code</button>
            <button type="button" className={btnSecondary} onClick={x.copyLink}>Copy share link</button>
            <button type="button" className={btnSecondary} onClick={x.reset}>Start from the default</button>
          </div>
          <p role="status" aria-live="polite" className={`min-h-5 text-sm ${x.msg?.ok === false ? "text-warning" : "text-success"}`}>{x.msg && <span key={x.msg.text}>{x.msg.text}</span>}</p>
          {(x.value.extra.length > 0 || x.value.rest.length > 0 || x.value.general.length > 0) && (
            <p className="text-xs leading-5 text-zinc-400" data-testid="xh-kept">Settings this tool does not edit (such as firing error, the aim down sights or sniper crosshair, or advanced options) were kept from your code exactly as they were.</p>
          )}
        </div>
      </div>

      <fieldset className={step}>
        <legend className="font-display text-lg text-zinc-100">Colour</legend>
        <div role="group" aria-label="Crosshair colour" className="flex flex-wrap gap-2">
          {COLOURS.map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={!p.custom && p.colour === c.id} onClick={() => x.setColour(c.id)}>
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4"><circle cx="8" cy="8" r="7" fill={c.hex} stroke="#a1a1aa" strokeWidth="1" /></svg>
              <span className="ml-1">{c.name}</span>
            </button>
          ))}
        </div>
        {p.custom && <p className="text-sm text-zinc-300">This code uses a custom colour, <span className="font-mono">{p.custom}</span>. It is kept in the code as it was. Pick a preset colour to replace it; this tool does not write custom colours.</p>}
      </fieldset>

      <fieldset className={step}>
        <legend className="font-display text-lg text-zinc-100">Outlines</legend>
        <Toggle label="Outlines" checked={p.outlines} onChange={(v) => x.set("outlines", v)} />
        {p.outlines && (
          <>
            <Slider label="Outline thickness" value={p.outlineThickness} min={RANGES.outlineThickness[0]} max={RANGES.outlineThickness[1]} onChange={(v) => x.set("outlineThickness", v)} />
            <Slider label="Outline opacity" value={p.outlineOpacity} min={0} max={1} stepBy={0.05} onChange={(v) => x.set("outlineOpacity", v)} />
          </>
        )}
      </fieldset>

      <fieldset className={step}>
        <legend className="font-display text-lg text-zinc-100">Centre dot</legend>
        <Toggle label="Centre dot" checked={p.dot} onChange={(v) => x.set("dot", v)} />
        {p.dot && (
          <>
            <Slider label="Dot thickness" value={p.dotThickness} min={RANGES.dotThickness[0]} max={RANGES.dotThickness[1]} onChange={(v) => x.set("dotThickness", v)} />
            <Slider label="Dot opacity" value={p.dotOpacity} min={0} max={1} stepBy={0.05} onChange={(v) => x.set("dotOpacity", v)} />
          </>
        )}
      </fieldset>

      <LineControls title="Inner lines" x={p.inner} which="inner" r={{ t: RANGES.innerThickness, l: RANGES.innerLength, o: RANGES.innerOffset }} set={x.setLine} />
      <LineControls title="Outer lines" x={p.outer} which="outer" r={{ t: RANGES.outerThickness, l: RANGES.outerLength, o: RANGES.outerOffset }} set={x.setLine} />

      <section aria-labelledby="xh-favs" className={step}>
        <h3 id="xh-favs" className="font-display text-lg text-zinc-100">Favourites on this device</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <Field id="xh-fav-name" label="Name for this crosshair">
              <input id="xh-fav-name" type="text" value={x.favName} maxLength={FAV_NAME_MAX} autoComplete="off" onChange={(e) => x.setFavName(e.target.value)} className={input} />
            </Field>
          </div>
          <button type="button" className={btnSecondary} onClick={x.saveFav}>Save to favourites</button>
        </div>
        {x.favs.length === 0 ? <p className="text-sm text-zinc-300">No favourites yet. Saved codes stay in this browser only.</p> : (
          <ul className="space-y-2" data-testid="xh-fav-list">
            {x.favs.map((f) => (
              <li key={f.code} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-surface p-2">
                <span className="min-w-0 flex-1"><span className="block text-zinc-100">{f.name}</span><span className="block break-all font-mono text-xs text-zinc-400">{f.code}</span></span>
                <button type="button" className="chip" onClick={() => x.load(f.code)} aria-label={`Load ${f.name}`}>Load</button>
                <button type="button" className="chip" onClick={() => x.removeFav(f.code)} aria-label={`Remove ${f.name}`}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
