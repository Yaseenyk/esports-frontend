"use client";

import { useId, useState } from "react";

/**
 * Where a person gives the tool a list of names (teams or people). It says exactly how: type one per line, or copy a column from
 * a spreadsheet or a chat and paste it. There is a Paste button for people who do not know the keyboard shortcut, a one-tap
 * example, and a live count that says in words whether the list is ready.
 */
export default function TeamsInput({ value, onChange, noun = "team", min = 2, max, example, label, help, rows = 7, mono = false }: {
  value: string; onChange: (v: string) => void;
  noun?: string; min?: number; max?: number; example: string[]; label?: string; help?: string; rows?: number; mono?: boolean;
}) {
  const id = useId();
  const [note, setNote] = useState("");
  const lines = value.split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  const unique = new Set(lines.map((l) => l.toLowerCase())).size;
  const dupes = lines.length - unique;
  const over = max !== undefined && unique > max;
  const ready = unique >= min && !over;
  const plural = (n: number) => `${n} ${noun}${n === 1 ? "" : "s"}`;

  const paste = async () => {
    setNote("");
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) { setNote("The clipboard is empty. Copy your list first, then press Paste."); return; }
      onChange(value.trim() ? `${value.replace(/\s+$/, "")}\n${text.trim()}` : text.trim());
      setNote("Pasted.");
    } catch {
      setNote("Your browser did not allow that. Click in the box and press Ctrl+V (on a phone, press and hold, then Paste).");
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={id} className="block text-sm font-semibold text-white">{label ?? `Your ${noun}s`}</label>
        <p id={`${id}-help`} className="mt-1 text-sm leading-6 text-zinc-300">{help ?? `Type one ${noun} per line. Or copy a column from Excel, Google Sheets or WhatsApp and paste it here.`}</p>
      </div>
      <textarea id={id} aria-describedby={`${id}-help ${id}-count`} className={`field py-2 ${mono ? "font-mono text-sm" : ""}`} style={{ minHeight: `${rows * 1.6 + 1}rem` }} value={value} onChange={(e) => { setNote(""); onChange(e.target.value); }} spellCheck={false}
        placeholder={`${example.slice(0, 3).join("\n")}\n…`} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" onClick={paste}>Paste from clipboard</button>
        <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" onClick={() => { setNote(""); onChange(example.join("\n")); }}>Use an example list</button>
        {value.trim() && <button type="button" className="btn-ghost !min-h-10 px-4 text-sm" onClick={() => { setNote(""); onChange(""); }}>Clear</button>}
      </div>
      <p id={`${id}-count`} role="status" aria-live="polite" className={`text-sm font-semibold ${ready ? "text-emerald-300" : "text-amber-300"}`}>
        {ready ? `✓ ${plural(unique)}, ready.` : over ? `${plural(unique)} is too many. The most this tool takes is ${max}.` : unique === 0 ? `Add at least ${plural(min)} to begin.` : `${plural(unique)} so far. Add ${min - unique} more to continue.`}
        {dupes > 0 && <span className="ml-2 font-normal text-zinc-300">{dupes} repeated name{dupes === 1 ? " was" : "s were"} ignored.</span>}
        {note && <span className="ml-2 font-normal text-zinc-300">{note}</span>}
      </p>
    </div>
  );
}
