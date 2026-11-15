import type { ReactElement } from "react";

export interface OgCardInput { title: string; game: string; when: string; where: string }

const INK = "#05070A", TEXT = "#F4F4F5", MUTED = "#D4D4D8", CYAN = "#22D3EE", VIOLET = "#A855F7";

/** Brand card (DESIGN_SYSTEM.md "Images and share cards"): flat shapes on ink, cyan and violet only, no photos, no glow, no gradient. Text is 36 px or larger. */
export function ogCard(i: OgCardInput): ReactElement {
  const title = i.title.length > 90 ? `${i.title.slice(0, 89)}…` : i.title;
  const size = title.length > 60 ? 56 : title.length > 36 ? 68 : 84;
  return (
    <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "space-between", background: INK, padding: 72, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 28, height: 28, background: CYAN }} />
        <div style={{ fontSize: 40, color: CYAN, fontWeight: 700 }}>Esports Hub</div>
        <div style={{ fontSize: 36, color: MUTED, marginLeft: 16 }}>{`${i.game} tournament`}</div>
      </div>
      <div style={{ display: "flex", fontSize: size, lineHeight: 1.1, color: TEXT, fontWeight: 700 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 40, color: MUTED }}>{`${i.when} · ${i.where}`}</div>
        <div style={{ display: "flex", width: 1056, height: 8, background: VIOLET }} />
      </div>
    </div>
  );
}
