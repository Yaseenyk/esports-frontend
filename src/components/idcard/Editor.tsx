"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Select from "@/components/Select";
import { FIELDS, FONTS, FORMATS, fmtOf, uid, type El, type Field, type FontKey, type Pattern, type Template } from "@/lib/idcard/types";
import CardView, { type Ctx } from "./CardView";

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const fieldOptions = (Object.keys(FIELDS) as Field[]).map((f) => ({ value: f, label: FIELDS[f] }));
const patternOptions = [{ value: "none", label: "No pattern" }, { value: "dots", label: "Dots" }, { value: "grid", label: "Grid" }, { value: "stripes", label: "Stripes" }, { value: "rays", label: "Sunburst rays" }, { value: "rings", label: "Rings" }, { value: "diamonds", label: "Diamonds" }];
const fontOptions = (Object.keys(FONTS) as FontKey[]).map((f) => ({ value: f, label: FONTS[f].label }));

function Num({ label, value, onChange, min = -50, max = 150, step = 1 }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <label className="block text-xs text-zinc-400">{label}
      <input type="number" className="field mt-1 !min-h-9 px-2" value={Math.round(value * 10) / 10} min={min} max={max} step={step} onChange={(e) => { const n = parseFloat(e.target.value); if (!Number.isNaN(n)) onChange(n); }} />
    </label>
  );
}
function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-zinc-400">{label}
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ffffff"} onChange={(e) => onChange(e.target.value)} className="h-8 w-12 cursor-pointer rounded border border-white/15 bg-transparent p-0.5" aria-label={label} />
    </label>
  );
}
function Range({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  return (
    <label className="block text-xs text-zinc-400"><span className="flex justify-between"><span>{label}</span><span className="text-zinc-400">{Math.round(value * 10) / 10}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="mt-1 w-full accent-cyan" />
    </label>
  );
}

export default function Editor({ tpl, onChange, ctx, onPhotoFile }: { tpl: Template; onChange: (t: Template) => void; ctx: Ctx; onPhotoFile?: (f: File) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const past = useRef<Template[]>([]);
  const future = useRef<Template[]>([]);
  const [, bump] = useState(0);
  const tplRef = useRef(tpl);
  tplRef.current = tpl;
  const box = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  // Switching to another team's design resets the undo history.
  useEffect(() => { past.current = []; future.current = []; setSel(null); bump((n) => n + 1); }, [tpl.id]);

  const snapshot = useCallback(() => { past.current = [...past.current.slice(-49), tplRef.current]; future.current = []; bump((n) => n + 1); }, []);
  const undo = () => { const p = past.current.pop(); if (!p) return; future.current.push(tplRef.current); onChange(p); bump((n) => n + 1); };
  const redo = () => { const f = future.current.pop(); if (!f) return; past.current.push(tplRef.current); onChange(f); bump((n) => n + 1); };
  const commit = (t: Template) => { snapshot(); onChange(t); };
  const patch = (id: string, p: Partial<El>, record = true) => { const t = { ...tplRef.current, els: tplRef.current.els.map((e) => (e.id === id ? { ...e, ...p } : e)) }; record ? commit(t) : onChange(t); };
  const el = tpl.els.find((e) => e.id === sel) ?? null;

  const add = (e: Partial<El> & { kind: El["kind"] }) => {
    const base: El = { id: uid(), x: 30, y: 30, w: 30, h: 12, rot: 0, opacity: 1, ...e };
    commit({ ...tpl, els: [...tpl.els, base] });
    setSel(base.id);
  };
  const remove = () => { if (!el) return; commit({ ...tpl, els: tpl.els.filter((e) => e.id !== el.id) }); setSel(null); };
  const dup = () => { if (!el) return; const c = { ...el, id: uid(), x: clamp(el.x + 3, -20, 100), y: clamp(el.y + 3, -20, 100) }; commit({ ...tpl, els: [...tpl.els, c] }); setSel(c.id); };
  const move = (dir: 1 | -1 | "top" | "bottom") => {
    if (!el) return;
    const i = tpl.els.findIndex((e) => e.id === el.id); const a = [...tpl.els]; a.splice(i, 1);
    const j = dir === "top" ? a.length : dir === "bottom" ? 0 : clamp(i + dir, 0, a.length);
    a.splice(j, 0, el); commit({ ...tpl, els: a });
  };

  // Drag to move, corner handle to resize. Geometry is in % of the card, so the maths is the same at any screen size.
  const drag = (e: React.PointerEvent, item: El, mode: "move" | "resize") => {
    e.stopPropagation();
    root.current?.focus({ preventScroll: true }); // so Ctrl+Z, arrows and Delete work right after a click
    setSel(item.id);
    const rect = box.current!.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY, o = { x: item.x, y: item.y, w: item.w, h: item.h };
    let moved = false;
    const onMove = (m: PointerEvent) => {
      const dx = ((m.clientX - sx) / rect.width) * 100, dy = ((m.clientY - sy) / rect.height) * 100;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 0.4) return;
      if (!moved) { moved = true; snapshot(); }
      const next = mode === "move" ? { x: clamp(o.x + dx, -50, 130), y: clamp(o.y + dy, -50, 130) } : { w: clamp(o.w + dx, 2, 150), h: clamp(o.h + dy, 1, 150) };
      onChange({ ...tplRef.current, els: tplRef.current.els.map((x) => (x.id === item.id ? { ...x, ...next } : x)) });
    };
    const up = () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", up);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName)) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); return; }
    if (!el) return;
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); remove(); }
    const step = e.shiftKey ? 2 : 0.5;
    const d: Record<string, Partial<El>> = { ArrowLeft: { x: el.x - step }, ArrowRight: { x: el.x + step }, ArrowUp: { y: el.y - step }, ArrowDown: { y: el.y + step } };
    if (d[e.key]) { e.preventDefault(); patch(el.id, d[e.key]); }
  };

  const logo = (f?: File) => { if (!f) return; const r = new FileReader(); r.onload = () => add({ kind: "image", src: String(r.result), w: 20, h: 20, x: 70, y: 70 }); r.readAsDataURL(f); };
  const logoFile = (f?: File) => { if (!f) return; const r = new FileReader(); r.onload = () => add({ kind: "image", src: String(r.result), w: 20, h: 20, x: 70, y: 70 }); r.readAsDataURL(f); };
  const pickImage = () => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => logoFile(i.files?.[0]); i.click(); };
  const addItems: { label: string; help: string; run: () => void }[] = [
    { label: "Text", help: "A line of text you type yourself.", run: () => add({ kind: "text", text: "Your text", size: 5, color: "#ffffff", font: "display", weight: 700, align: "left", w: 40, h: 10 }) },
    { label: "Info from the person", help: "Fills in by itself for each person: name, team, role, ID, date and more.", run: () => add({ kind: "field", field: "name", size: 5, color: "#ffffff", font: "display", weight: 700, align: "left", w: 50, h: 10 }) },
    { label: "Photo frame", help: "A framed spot for each person's photo.", run: () => add({ kind: "photo", w: 24, h: 45, radius: 6, fill: "#00000055", stroke: "#22D3EE", strokeW: 0.9 }) },
    { label: "Cut-out person", help: "The person stands in front of the design with no frame. Best with a cut-out photo.", run: () => add({ kind: "photo", cutout: true, w: 60, h: 55, x: 20, y: 30, color: "#334155", shadow: true }) },
    { label: "QR code", help: "A QR code for the pass. Signed, if you turned that on.", run: () => add({ kind: "qr", w: 24, h: 15, color: "#111111", fill: "#ffffff", radius: 3 }) },
    { label: "Box", help: "A coloured rectangle, for bars, tags and panels.", run: () => add({ kind: "rect", fill: "#22D3EE", w: 30, h: 12, radius: 2 }) },
    { label: "Circle", help: "A coloured circle or oval.", run: () => add({ kind: "ellipse", fill: "#A855F7", w: 20, h: 32 }) },
    { label: "Role colour bar", help: "A bar whose colour follows each person's role.", run: () => add({ kind: "rect", fill: "#22d3ee", roleColor: true, w: 100, h: 2.4, x: 0, y: 97.6, radius: 0 }) },
    { label: "Team logo", help: "Shows the team's logo (add it in Event & teams).", run: () => add({ kind: "image", bind: "team", w: 18, h: 11, x: 76, y: 5 }) },
    { label: "Sponsor logo", help: "Shows the event sponsor's logo.", run: () => add({ kind: "image", bind: "sponsor", w: 30, h: 7, x: 35, y: 91 }) },
    { label: "Picture from your device", help: "Any image: a badge, a pattern, a mascot.", run: pickImage },
  ];
  const isText = el && (el.kind === "text" || el.kind === "field");
  const isShape = el && (el.kind === "rect" || el.kind === "ellipse" || (el.kind === "photo" && !el.cutout));

  return (
    <div ref={root} tabIndex={-1} className="grid gap-4 outline-none lg:grid-cols-[1fr_17rem]" onKeyDown={onKey}>
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2" role="toolbar" aria-label="Design tools">
          <button type="button" title="Undo the last change (Ctrl+Z)" className="btn-ghost !min-h-9 px-3 text-sm" onClick={undo} disabled={!past.current.length} aria-label="Undo">↶ Undo</button>
          <button type="button" title="Redo (Ctrl+Y)" className="btn-ghost !min-h-9 px-3 text-sm" onClick={redo} disabled={!future.current.length} aria-label="Redo">↷ Redo</button>
          <span className="mx-1 h-5 w-px bg-white/10" aria-hidden="true" />
          <div className="relative">
            <button type="button" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)} className="btn !min-h-9 px-4 text-sm">+ Add to the card</button>
            {menu && (
              <>
                <button type="button" aria-label="Close menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setMenu(false)} />
                <div role="menu" className="absolute left-0 top-full z-50 mt-2 w-[min(92vw,34rem)] rounded-2xl border border-white/15 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl">
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {addItems.map((it) => (
                      <li key={it.label}>
                        <button type="button" role="menuitem" onClick={() => { it.run(); setMenu(false); }} className="flex w-full flex-col rounded-xl px-3 py-2 text-left outline-none hover:bg-white/10 focus-visible:bg-white/10">
                          <span className="text-sm font-semibold text-white">{it.label}</span>
                          <span className="text-xs text-zinc-400">{it.help}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
          {onPhotoFile && <label title="Add or change the photo of the person being previewed. It appears on every design." className="btn-ghost !min-h-9 cursor-pointer px-3 text-sm">{ctx.person.photo ? "Change photo" : "Add photo"}<input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhotoFile(f); e.target.value = ""; }} /></label>}
        </div>
        <div className="mx-auto w-full select-none" style={{ maxWidth: FORMATS[fmtOf(tpl)].w < FORMATS[fmtOf(tpl)].h ? 380 : fmtOf(tpl) === "strip" ? 980 : 760 }} ref={box} onPointerDown={() => { root.current?.focus({ preventScroll: true }); setSel(null); }}>
          <CardView tpl={tpl} ctx={ctx} className="ring-1 ring-white/10 shadow-2xl shadow-black/60">
            {tpl.els.map((e) => (
              <div key={e.id} data-el={e.id} onPointerDown={(ev) => drag(ev, e, "move")} className={`absolute cursor-move touch-none ${sel === e.id ? "outline outline-2 outline-cyan" : "hover:outline hover:outline-1 hover:outline-white/40"}`}
                style={{ left: `${e.x}%`, top: `${e.y}%`, width: `${e.w}%`, height: `${e.h}%`, transform: e.rot ? `rotate(${e.rot}deg)` : undefined }}>
                {e.kind === "image" && e.bind && !(e.bind === "team" ? ctx.teamLogo : ctx.sponsorLogo) && (
                  <span className="pointer-events-none absolute inset-0 grid place-items-center rounded border border-dashed border-white/60 bg-black/40 text-center text-[10px] font-semibold leading-tight text-white">{e.bind === "team" ? "Team logo" : "Sponsor logo"}</span>
                )}
                {e.kind === "photo" && !ctx.person.photo && onPhotoFile && (
                  <label onPointerDown={(ev) => ev.stopPropagation()} className="absolute inset-x-[8%] top-[42%] z-10 flex cursor-pointer items-center justify-center rounded-full border border-dashed border-white/70 bg-black/55 px-2 py-1.5 text-center text-[11px] font-semibold text-white backdrop-blur-sm">
                    Click to add the photo<input type="file" accept="image/*" className="sr-only" onChange={(ev) => { const f = ev.target.files?.[0]; if (f) onPhotoFile(f); ev.target.value = ""; }} />
                  </label>
                )}
                {sel === e.id && <span data-handle onPointerDown={(ev) => drag(ev, e, "resize")} className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize touch-none rounded-sm border-2 border-cyan bg-ink" />}
              </div>
            ))}
          </CardView>
        </div>
        <p className="mt-3 text-center text-xs text-zinc-400">Drag to move, pull the corner to resize. Arrow keys nudge (Shift for bigger steps). Delete removes. Ctrl+Z undoes.</p>
      </div>

      <aside className="card h-fit space-y-4 !p-4" aria-label="Properties">
        <div>
          <h3 className="text-sm font-bold text-white">Background</h3>
          <div className="mt-2 space-y-2">
            <Color label="Colour 1" value={tpl.bg.a} onChange={(v) => commit({ ...tpl, bg: { ...tpl.bg, a: v } })} />
            <Color label="Colour 2" value={tpl.bg.b} onChange={(v) => commit({ ...tpl, bg: { ...tpl.bg, b: v } })} />
            <Range label="Angle" min={0} max={360} value={tpl.bg.angle} onChange={(n) => onChange({ ...tpl, bg: { ...tpl.bg, angle: n } })} />
            <Select label="Pattern" value={tpl.bg.pattern?.type ?? "none"} searchable={false} options={patternOptions}
              onChange={(v) => commit({ ...tpl, bg: { ...tpl.bg, pattern: v === "none" ? undefined : { type: v as Pattern["type"], color: tpl.bg.pattern?.color ?? "#ffffff", opacity: tpl.bg.pattern?.opacity ?? 0.18, size: tpl.bg.pattern?.size ?? (v === "rays" ? 3.2 : 4), cx: tpl.bg.pattern?.cx ?? 70, cy: tpl.bg.pattern?.cy ?? 30 } } })} />
            {tpl.bg.pattern && <>
              <Color label="Pattern colour" value={tpl.bg.pattern.color} onChange={(v) => commit({ ...tpl, bg: { ...tpl.bg, pattern: { ...tpl.bg.pattern!, color: v } } })} />
              <Range label="Pattern strength" min={0.03} max={1} step={0.01} value={tpl.bg.pattern.opacity} onChange={(n) => onChange({ ...tpl, bg: { ...tpl.bg, pattern: { ...tpl.bg.pattern!, opacity: n } } })} />
              <Range label="Pattern size" min={1} max={20} step={0.1} value={tpl.bg.pattern.size} onChange={(n) => onChange({ ...tpl, bg: { ...tpl.bg, pattern: { ...tpl.bg.pattern!, size: n } } })} />
              {(tpl.bg.pattern.type === "rings" || tpl.bg.pattern.type === "rays") && <>
                <Range label="Centre across" min={-20} max={120} value={tpl.bg.pattern.cx ?? 70} onChange={(n) => onChange({ ...tpl, bg: { ...tpl.bg, pattern: { ...tpl.bg.pattern!, cx: n } } })} />
                <Range label="Centre down" min={-20} max={120} value={tpl.bg.pattern.cy ?? 30} onChange={(n) => onChange({ ...tpl, bg: { ...tpl.bg, pattern: { ...tpl.bg.pattern!, cy: n } } })} />
              </>}
            </>}
          </div>
        </div>
        {!el ? <p className="text-sm text-zinc-400">Select anything on the card to edit it.</p> : (
          <div className="space-y-3 border-t border-white/10 pt-4">
            <h3 className="text-sm font-bold capitalize text-white">{el.kind === "field" ? "Detail" : el.kind}</h3>
            {el.kind === "text" && <label className="block text-xs text-zinc-400">Text<input className="field mt-1 !min-h-9" value={el.text ?? ""} onChange={(e) => patch(el.id, { text: e.target.value }, false)} onBlur={() => snapshot()} /></label>}
            {el.kind === "field" && <Select label="Shows" value={el.field ?? "name"} onChange={(v) => patch(el.id, { field: v as Field })} options={fieldOptions} searchable={false} />}
            {isText && <>
              <Select label="Font" value={el.font ?? "body"} onChange={(v) => patch(el.id, { font: v as FontKey })} options={fontOptions} searchable={false} />
              <Range label="Size" min={1.5} max={34} step={0.1} value={el.size ?? 4} onChange={(n) => patch(el.id, { size: n }, false)} />
              <Range label="Weight" min={300} max={900} step={100} value={el.weight ?? 600} onChange={(n) => patch(el.id, { weight: n }, false)} />
              <Range label="Letter spacing" min={0} max={2} step={0.1} value={el.spacing ?? 0} onChange={(n) => patch(el.id, { spacing: n }, false)} />
              <Color label="Colour" value={el.color ?? "#ffffff"} onChange={(v) => patch(el.id, { color: v })} />
              <div className="flex gap-1" role="group" aria-label="Alignment">{(["left", "center", "right"] as const).map((a) => (<button key={a} type="button" aria-pressed={el.align === a} className="chip flex-1 justify-center capitalize" onClick={() => patch(el.id, { align: a })}>{a}</button>))}</div>
              <div className="flex flex-wrap gap-1">
                <button type="button" className="chip" aria-pressed={!!el.upper} onClick={() => patch(el.id, { upper: !el.upper })}>UPPERCASE</button>
                <button type="button" className="chip italic" aria-pressed={!!el.italic} onClick={() => patch(el.id, { italic: !el.italic })}>Italic</button>
                <button type="button" className="chip" aria-pressed={!!el.outline} onClick={() => patch(el.id, { outline: !el.outline, stroke: el.stroke ?? el.color ?? "#ffffff", strokeW: el.strokeW ?? 0.3 })}>Outline only</button>
                <button type="button" className="chip" aria-pressed={!!el.ticker} onClick={() => patch(el.id, { ticker: !el.ticker })}>Ribbon repeat</button>
              </div>
              {el.outline && <>
                <Color label="Outline colour" value={el.stroke ?? "#ffffff"} onChange={(v) => patch(el.id, { stroke: v })} />
                <Range label="Outline width" min={0.1} max={1.2} step={0.05} value={el.strokeW ?? 0.3} onChange={(n) => patch(el.id, { strokeW: n }, false)} />
              </>}
              <Range label="Stack the line" min={1} max={6} step={1} value={el.repeat ?? 1} onChange={(n) => patch(el.id, { repeat: n }, false)} />
              <div className="flex items-center justify-between gap-2">
                <Color label="Box behind text" value={el.fill ?? "#000000"} onChange={(v) => patch(el.id, { fill: v })} />
                {el.fill && <button type="button" className="chip !min-h-8" onClick={() => patch(el.id, { fill: undefined, fill2: undefined })}>None</button>}
              </div>
              {el.fill && <Range label="Box corner radius" min={0} max={50} value={el.radius ?? 0} onChange={(n) => patch(el.id, { radius: n }, false)} />}
              {el.fill && <button type="button" className="chip" aria-pressed={!!el.roleColor} onClick={() => patch(el.id, { roleColor: !el.roleColor })}>Box colour follows role</button>}
            </>}
            {el.kind === "photo" && <>
              <button type="button" className="chip" aria-pressed={!!el.cutout} onClick={() => patch(el.id, { cutout: !el.cutout })}>Cut-out person (no frame)</button>
              {el.cutout && <>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className="chip" aria-pressed={!!el.sticker} onClick={() => patch(el.id, { sticker: el.sticker ? undefined : "#ffffff" })}>Sticker outline</button>
                  <button type="button" className="chip" aria-pressed={!!el.shadow} onClick={() => patch(el.id, { shadow: !el.shadow })}>Shadow</button>
                </div>
                {el.sticker && <Color label="Outline colour" value={el.sticker} onChange={(v) => patch(el.id, { sticker: v })} />}
                <Color label="Placeholder shirt" value={el.color ?? "#334155"} onChange={(v) => patch(el.id, { color: v })} />
                <p className="text-xs text-zinc-400">Use a transparent PNG for the best result. Without one, the photo fades softly at the bottom.</p>
              </>}
            </>}
            {el.kind === "qr" && <>
              <Color label="QR colour" value={el.color ?? "#111111"} onChange={(v) => patch(el.id, { color: v })} />
              <Color label="QR background" value={el.fill && el.fill !== "none" ? el.fill : "#ffffff"} onChange={(v) => patch(el.id, { fill: v })} />
              <button type="button" className="chip" aria-pressed={el.fill === "none"} onClick={() => patch(el.id, { fill: el.fill === "none" ? "#ffffff" : "none" })}>Transparent background</button>
              <Range label="Corner radius" min={0} max={20} value={el.radius ?? 0} onChange={(n) => patch(el.id, { radius: n }, false)} />
              <p className="text-xs text-zinc-400">The QR holds the person&apos;s ID number only.</p>
            </>}
            {isShape && <>
              {el.kind !== "photo" && <Color label="Fill" value={el.fill ?? "#ffffff"} onChange={(v) => patch(el.id, { fill: v })} />}
              {el.kind !== "photo" && <Color label="Gradient to" value={el.fill2 ?? el.fill ?? "#ffffff"} onChange={(v) => patch(el.id, { fill2: v })} />}
              {el.kind !== "photo" && el.fill2 && <Range label="Gradient angle" min={0} max={360} value={el.ang ?? 90} onChange={(n) => patch(el.id, { ang: n }, false)} />}
              {el.kind !== "ellipse" && <Range label="Corner radius" min={0} max={50} value={el.radius ?? 0} onChange={(n) => patch(el.id, { radius: n }, false)} />}
              {el.kind !== "photo" && <button type="button" className="chip" aria-pressed={!!el.roleColor} onClick={() => patch(el.id, { roleColor: !el.roleColor })}>Colour follows role</button>}
              {el.kind === "photo" && !el.cutout && <Color label="Frame" value={el.stroke ?? "#ffffff"} onChange={(v) => patch(el.id, { stroke: v })} />}
            </>}
            {el.kind === "image" && el.bind && <p className="text-xs text-zinc-400">Shows the {el.bind === "team" ? "team's logo, added in Event & teams or with the logo button above" : "sponsor logo, added in Event & teams"}.</p>}
            {el.kind === "image" && <Range label="Corner radius" min={0} max={50} value={el.radius ?? 0} onChange={(n) => patch(el.id, { radius: n }, false)} />}
            <Range label="Rotation" min={-180} max={180} value={el.rot} onChange={(n) => patch(el.id, { rot: n }, false)} />
            <Range label="Opacity" min={0.05} max={1} step={0.05} value={el.opacity} onChange={(n) => patch(el.id, { opacity: n }, false)} />
            <div className="grid grid-cols-2 gap-2"><Num label="X %" value={el.x} onChange={(n) => patch(el.id, { x: n })} /><Num label="Y %" value={el.y} onChange={(n) => patch(el.id, { y: n })} /><Num label="Width %" value={el.w} min={1} onChange={(n) => patch(el.id, { w: n })} /><Num label="Height %" value={el.h} min={1} onChange={(n) => patch(el.id, { h: n })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="btn-ghost !min-h-9 text-sm" onClick={() => patch(el.id, { x: 50 - el.w / 2 })}>Centre ↔</button>
              <button type="button" className="btn-ghost !min-h-9 text-sm" onClick={() => patch(el.id, { y: 50 - el.h / 2 })}>Centre ↕</button>
              <button type="button" className="btn-ghost !min-h-9 text-sm" onClick={() => move(1)}>Forward</button>
              <button type="button" className="btn-ghost !min-h-9 text-sm" onClick={() => move(-1)}>Backward</button>
              <button type="button" className="btn-ghost !min-h-9 text-sm" onClick={dup}>Duplicate</button>
              <button type="button" className="btn-ghost !min-h-9 text-sm text-red-300" onClick={remove}>Delete</button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
