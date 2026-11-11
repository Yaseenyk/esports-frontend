"use client";

import type { Extras } from "@/lib/display";
import type { DisplayTheme } from "@/lib/display-themes";

/** How much of the screen height (in vmin) the extras take, so the view above can leave room for them and nothing jumps when they appear. */
export const tickerHeight = (x: Extras | undefined) => (x?.ticker?.length ? 6.4 : 0);
export const sponsorHeight = (x: Extras | undefined) => (x?.sponsors?.length ? 8.4 : 0);
export const extrasReserve = (x: Extras | undefined) => tickerHeight(x) + sponsorHeight(x) + (tickerHeight(x) || sponsorHeight(x) ? 1.2 : 0);

/**
 * The sponsor logo strip (bottom left) and the announcement ticker (along the bottom) of a display screen.
 * Both sizes are fixed, so a logo that loads late never moves anything. The ticker scrolls with CSS only, and stays still under prefers-reduced-motion.
 */
export default function ExtrasBar({ x, c, inset }: { x: Extras | undefined; c: DisplayTheme; /** Margin from the screen edge, in vmin. */ inset: number }) {
  const ticker = x?.ticker ?? [], sponsors = x?.sponsors ?? [];
  if (!ticker.length && !sponsors.length) return null;
  const chars = ticker.reduce((n, t) => n + t.length + 6, 0);
  const copy = (dup: boolean) => (
    <div className={`ds-ticker-copy${dup ? " ds-ticker-dup" : ""}`} aria-hidden={dup || undefined}>
      {ticker.map((t, i) => <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6vmin" }}>{t}<span aria-hidden="true" style={{ fontSize: "1.6vmin", opacity: 0.7 }}>◆</span></span>)}
    </div>
  );
  return (
    <>
      {sponsors.length > 0 && (
        <ul aria-label="Sponsors" style={{ position: "absolute", left: `${inset}vmin`, bottom: `${inset + tickerHeight(x) + (ticker.length ? 1.2 : 0)}vmin`, display: "flex", gap: "1.6vmin", height: "7.2vmin", margin: 0, padding: 0, listStyle: "none" }}>
          {sponsors.map((s, i) => (
            <li key={i} style={{ width: "15vmin", height: "7.2vmin", flex: "none", display: "grid", placeItems: "center", borderRadius: "1.2vmin", overflow: "hidden", background: s.logo ? "rgba(255,255,255,.94)" : c.row, border: s.logo ? "none" : `.2vmin solid ${c.line}`, padding: s.logo ? ".7vmin" : "0 1vmin", color: c.fg, fontSize: "2.2vmin", fontWeight: 800, textAlign: "center" }}>
              {s.logo
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={s.logo} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                : <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{s.name}</span>}
            </li>
          ))}
        </ul>
      )}
      {ticker.length > 0 && (
        <div role="marquee" aria-label="Announcements" style={{ position: "absolute", left: `${inset}vmin`, right: `${inset}vmin`, bottom: `${inset}vmin`, height: `${tickerHeight(x)}vmin`, overflow: "hidden", display: "flex", alignItems: "center", background: c.accent, color: c.on, borderRadius: `${Math.min(c.radius, 1.2)}vmin`, fontSize: "3.2vmin", fontWeight: 800, letterSpacing: c.upper ? ".05em" : 0, textTransform: c.upper ? "uppercase" : "none" }}>
          <div className="ds-ticker-track" style={{ ["--ds-tick" as string]: `${Math.max(18, chars * 0.32)}s` } as React.CSSProperties}>{copy(false)}{copy(true)}</div>
        </div>
      )}
    </>
  );
}
