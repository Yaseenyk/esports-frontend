"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Select from "@/components/Select";
import { FIELDS, FONTS, uid, type El, type Field, type FontKey, type Template } from "@/lib/idcard/types";
import CardView, { type Ctx } from "./CardView";

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const fieldOptions = (Object.keys(FIELDS) as Field[]).map((f) => ({ value: f, label: FIELDS[f] }));
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
    <label className="block text-xs text-zinc-400"><span className="flex justify-between"><span>{label}</span><span className="text-zinc-500">{Math.round(value * 10) / 10}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="mt-1 w-full accent-cyan" />
    </label>
  );
}

export default function Editor({ tpl, onChange, ctx }: { tpl: Template; onChange: (t: Template) => void; ctx: Ctx }) {
  const [sel, setSel] = useState<string | null>(null);
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
  const isText = el && (el.kind === "text" || el.kind === "field");
  const isShape = el && (el.kind === "rect" || el.kind === "ellipse" || el.kind === "photo");

  return (
    <div ref={root} tabIndex={-1} className="grid gap-4 outline-none lg:grid-cols-[1fr_17rem]" onKeyDown={onKey}>
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2" role="toolbar" aria-label="Design tools">
          <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={undo} disabled={!past.current.length} aria-label="Undo">↶ Undo</button>
          <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={redo} disabled={!future.current.length} aria-label="Redo">↷ Redo</button>
          <span className="mx-1 h-5 w-px bg-white/10" aria-hidden="true" />
          <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => add({ kind: "text", text: "Your text", size: 5, color: "#ffffff", font: "display", weight: 700, align: "left", w: 40, h: 10 })}>+ Text</button>
          <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => add({ kind: "field", field: "name", size: 5, color: "#ffffff", font: "display", weight: 700, align: "left", w: 50, h: 10 })}>+ Detail</button>
          <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => add({ kind: "rect", fill: "#22D3EE", w: 30, h: 12, radius: 2 })}>+ Box</button>
          <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => add({ kind: "ellipse", fill: "#A855F7", w: 20, h: 32 })}>+ Circle</button>
          <button type="button" className="btn-ghost !min-h-9 px-3 text-sm" onClick={() => add({ kind: "photo", w: 24, h: 45, radius: 6, fill: "#00000055", stroke: "#22D3EE", strokeW: 0.9 })}>+ Photo</button>
          <label className="btn-ghost !min-h-9 cursor-pointer px-3 text-sm">+ Logo<input type="file" accept="image/*" className="sr-only" onChange={(e) => { logo(e.target.files?.[0]); e.target.value = ""; }} /></label>
        </div>
        <div className="mx-auto w-full max-w-[640px] select-none" ref={box} onPointerDown={() => { root.current?.focus({ preventScroll: true }); setSel(null); }}>
          <CardView tpl={tpl} ctx={ctx} className="ring-1 ring-white/10 shadow-2xl shadow-black/60">
            {tpl.els.map((e) => (
              <div key={e.id} data-el={e.id} onPointerDown={(ev) => drag(ev, e, "move")} className={`absolute cursor-move touch-none ${sel === e.id ? "outline outline-2 outline-cyan" : "hover:outline hover:outline-1 hover:outline-white/40"}`}
                style={{ left: `${e.x}%`, top: `${e.y}%`, width: `${e.w}%`, height: `${e.h}%`, transform: e.rot ? `rotate(${e.rot}deg)` : undefined }}>
                {sel === e.id && <span data-handle onPointerDown={(ev) => drag(ev, e, "resize")} className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize touch-none rounded-sm border-2 border-cyan bg-ink" />}
              </div>
            ))}
          </CardView>
        </div>
        <p className="mt-3 text-center text-xs text-zinc-500">Drag to move, pull the corner to resize. Arrow keys nudge (Shift for bigger steps). Delete removes. Ctrl+Z undoes.</p>
      </div>

      <aside className="card h-fit space-y-4 !p-4" aria-label="Properties">
        <div>
          <h3 className="text-sm font-bold text-white">Background</h3>
          <div className="mt-2 space-y-2">
            <Color label="Colour 1" value={tpl.bg.a} onChange={(v) => commit({ ...tpl, bg: { ...tpl.bg, a: v } })} />
            <Color label="Colour 2" value={tpl.bg.b} onChange={(v) => commit({ ...tpl, bg: { ...tpl.bg, b: v } })} />
            <Range label="Angle" min={0} max={360} value={tpl.bg.angle} onChange={(n) => onChange({ ...tpl, bg: { ...tpl.bg, angle: n } })} />
          </div>
        </div>
        {!el ? <p className="text-sm text-zinc-500">Select anything on the card to edit it.</p> : (
          <div className="space-y-3 border-t border-white/10 pt-4">
            <h3 className="text-sm font-bold capitalize text-white">{el.kind === "field" ? "Detail" : el.kind}</h3>
            {el.kind === "text" && <label className="block text-xs text-zinc-400">Text<input className="field mt-1 !min-h-9" value={el.text ?? ""} onChange={(e) => patch(el.id, { text: e.target.value }, false)} onBlur={() => snapshot()} /></label>}
            {el.kind === "field" && <Select label="Shows" value={el.field ?? "name"} onChange={(v) => patch(el.id, { field: v as Field })} options={fieldOptions} searchable={false} />}
            {isText && <>
              <Select label="Font" value={el.font ?? "body"} onChange={(v) => patch(el.id, { font: v as FontKey })} options={fontOptions} searchable={false} />
              <Range label="Size" min={1.5} max={16} step={0.1} value={el.size ?? 4} onChange={(n) => patch(el.id, { size: n }, false)} />
              <Range label="Weight" min={300} max={900} step={100} value={el.weight ?? 600} onChange={(n) => patch(el.id, { weight: n }, false)} />
              <Range label="Letter spacing" min={0} max={2} step={0.1} value={el.spacing ?? 0} onChange={(n) => patch(el.id, { spacing: n }, false)} />
              <Color label="Colour" value={el.color ?? "#ffffff"} onChange={(v) => patch(el.id, { color: v })} />
              <div className="flex gap-1" role="group" aria-label="Alignment">{(["left", "center", "right"] as const).map((a) => (<button key={a} type="button" aria-pressed={el.align === a} className="chip flex-1 justify-center capitalize" onClick={() => patch(el.id, { align: a })}>{a}</button>))}</div>
              <button type="button" className="chip" aria-pressed={!!el.upper} onClick={() => patch(el.id, { upper: !el.upper })}>UPPERCASE</button>
            </>}
            {isShape && <>
              {el.kind !== "photo" && <Color label="Fill" value={el.fill ?? "#ffffff"} onChange={(v) => patch(el.id, { fill: v })} />}
              {el.kind !== "photo" && <Color label="Gradient to" value={el.fill2 ?? el.fill ?? "#ffffff"} onChange={(v) => patch(el.id, { fill2: v })} />}
              {el.kind !== "ellipse" && <Range label="Corner radius" min={0} max={50} value={el.radius ?? 0} onChange={(n) => patch(el.id, { radius: n }, false)} />}
              {el.kind === "photo" && <Color label="Frame" value={el.stroke ?? "#ffffff"} onChange={(v) => patch(el.id, { stroke: v })} />}
            </>}
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
