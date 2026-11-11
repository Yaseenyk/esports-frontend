"use client";

import { DISPLAY_THEMES, fontCss, rankStyle, surface, type DisplayTheme } from "@/lib/display-themes";

/** A small picture of a design: a title, and three rows in that design's own shape, colours and type. */
function Swatch({ t }: { t: DisplayTheme }) {
  const rows = ["Team A", "Team B", "Team C"];
  return (
    <span aria-hidden="true" className="block h-[4.6rem] w-full overflow-hidden rounded-lg text-left" style={{ background: t.bg, fontFamily: fontCss(t), position: "relative", padding: "6px 7px", color: t.fg }}>
      {t.deco && <span style={{ position: "absolute", inset: 0, backgroundImage: t.deco, backgroundSize: t.decoSize ? "10px 10px" : undefined, opacity: 0.9 }} />}
      <span className="relative block text-[9px] font-extrabold leading-none" style={{ color: t.head === "bar" ? t.on : t.fg, textTransform: t.upper ? "uppercase" : "none", background: t.head === "bar" ? t.accent : "transparent", display: "inline-block", padding: t.head === "bar" ? "2px 5px" : 0, borderBottom: t.head === "underline" ? `1.5px solid ${t.accent}` : "none" }}>Standings</span>
      <span className="relative mt-1 block space-y-[2px]">
        {rows.map((r, i) => (
          <span key={r} className="flex items-center gap-1 text-[7px] font-bold leading-[10px]" style={{ ...swatchSurface(t, i), padding: "0 3px", color: t.fg }}>
            <span style={{ ...swatchRank(t, i), minWidth: 9, height: 9, fontSize: 6, display: "inline-grid", placeItems: "center", textAlign: "center" }}>{i + 1}</span>
            <span className="flex-1 truncate" style={{ textTransform: t.upper ? "uppercase" : "none" }}>{r}</span>
            <span style={{ color: t.accent }}>{38 - i * 4}</span>
          </span>
        ))}
      </span>
    </span>
  );
}

// The real styles use vmin, which is meaningless inside a 4rem swatch, so swap to pixels.
const px = (v: unknown) => (typeof v === "string" ? v.replace(/(\d*\.?\d+)vmin/g, (_, n) => `${Math.max(1, Math.round(parseFloat(n) * 2))}px`) : v);
function swatchSurface(t: DisplayTheme, i: number) {
  const s = { ...surface(t, i) } as Record<string, unknown>;
  for (const k of Object.keys(s)) s[k] = px(s[k]);
  delete s.clipPath; delete s.backdropFilter;
  return s;
}
function swatchRank(t: DisplayTheme, i: number) {
  const s = { ...rankStyle(t, i) } as Record<string, unknown>;
  for (const k of Object.keys(s)) s[k] = px(s[k]);
  delete s.width; delete s.padding;
  return s;
}

/** Pick a design for a display screen. Grouped so a venue TV, a stream overlay and a bright projector are easy to find. */
export default function ThemePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const groups = ["Stream", "Venue", "Light"] as const;
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-zinc-200">Screen design</legend>
      {groups.map((g) => (
        <div key={g}>
          <p className="mb-1.5 text-xs uppercase tracking-wider text-zinc-400">{g === "Stream" ? "For streams and overlays" : g === "Venue" ? "For venue TVs and big screens" : "For projectors and bright rooms"}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" role="group" aria-label={g}>
            {DISPLAY_THEMES.filter((t) => t.group === g).map((t) => (
              <button key={t.id} type="button" aria-pressed={value === t.id} onClick={() => onChange(t.id)} className={`rounded-xl border p-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${value === t.id ? "border-cyan bg-[#0c1d27]" : "border-white/[0.14] bg-[#0a0b0d] hover:border-white/30"}`}>
                <Swatch t={t} />
                <span className="mt-1.5 block truncate px-0.5 text-xs font-semibold text-white">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
