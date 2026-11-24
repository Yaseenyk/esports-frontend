"use client";

import { TableView } from "@/components/display/DisplayScreen";
import { rankStyle, surface, type DisplayTheme } from "@/lib/display-themes";
import { pointsTableData, topFraggers, teamCards, type KitArea, type KitFeed, type KitPlayers } from "@/features/overlay-kit/domain";
import TeamBadge from "@/features/overlay-kit/ui/TeamBadge";

/** A backdrop the text sits on over gameplay: dark for the dark designs, white for the light ones. */
export const plate = (c: DisplayTheme) => (c.group === "Light" ? "rgba(255,255,255,.96)" : "rgba(6,8,14,.94)");
const box = (c: DisplayTheme): React.CSSProperties => ({ background: plate(c), border: `.2vmin solid ${c.line}`, borderRadius: `${Math.min(c.radius, 1.4)}vmin`, padding: "2.2vmin 2.6vmin" });
const heading = (c: DisplayTheme): React.CSSProperties => ({ fontSize: "4.2vmin", lineHeight: 1.05, fontWeight: 800, color: c.fg, textTransform: c.upper ? "uppercase" : "none", letterSpacing: c.upper ? ".04em" : "-.01em" });
const sub = (c: DisplayTheme): React.CSSProperties => ({ fontSize: "2.4vmin", color: c.soft, marginTop: ".6vmin", marginBottom: "1.6vmin" });

/** The live points table: the TV screen's table (TableView) on a backdrop. */
export function PointsOverlay({ feed, n, c }: { feed: KitFeed; n: number; c: DisplayTheme }) {
  const d = pointsTableData(feed, n);
  // Up to 12 rows the backdrop fits the table; longer tables fill the area and scroll by themselves (TableView repeats the rows for that).
  return (
    <div data-kit-view="points" style={{ ...box(c), ...(d.rows.length > 12 ? { height: "100%" } : { maxHeight: "100%" }), display: "flex", flexDirection: "column", boxSizing: "border-box", overflow: "hidden" }}>
      <TableView d={d} c={c} />
    </div>
  );
}

/** Kill leaders: players typed on the kit page, or team kills from the points table (labelled as such). */
export function FraggersOverlay({ feed, players, n, c }: { feed: KitFeed | null; players: KitPlayers | null; n: number; c: DisplayTheme }) {
  const f = topFraggers(feed, players, n);
  if (f.kind === "none") return null;
  return (
    <section data-kit-view="fraggers" aria-label="Top fraggers" style={{ ...box(c), maxHeight: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <h1 style={heading(c)}>{f.kind === "players" ? "Top fraggers" : "Kill leaders"}</h1>
      <p style={sub(c)}>{f.kind === "players" ? "Player kills" : "Team kills"}</p>
      <ol>
        {f.rows.map((r, i) => (
          <li key={`${r.name}${i}`} style={{ display: "grid", gridTemplateColumns: "6vmin minmax(0,1fr) auto", alignItems: "center", gap: "1.6vmin", padding: "1vmin 1.6vmin", marginBottom: ".7vmin", ...surface(c, i), fontSize: "3vmin" }}>
            <span style={{ ...rankStyle(c, r.rank - 1), fontVariantNumeric: "tabular-nums" }}>{r.rank}</span>
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: c.fg, fontWeight: 800 }}>
              {r.name}{r.team && <span style={{ color: c.soft, fontWeight: 500, fontSize: "2.4vmin" }}>  ·  {r.team}</span>}
            </span>
            <span style={{ color: c.accent, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{r.kills}<span style={{ color: c.soft, fontWeight: 500, fontSize: "2.4vmin" }}> kills</span></span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Team cards: the drawn badge, team name, current rank and points. A side area stacks them; the full screen and the bottom band line them up. */
export function CardsOverlay({ feed, n, team, area, c }: { feed: KitFeed | null; n: number; team: string; area: KitArea; c: DisplayTheme }) {
  const cards = teamCards(feed, n, team);
  if (!feed || !cards.length) return null;
  const stack = area === "left" || area === "right";
  return (
    <section data-kit-view="cards" aria-label="Team cards" style={{ display: "flex", flexDirection: stack ? "column" : "row", flexWrap: stack ? "nowrap" : "wrap", alignItems: stack ? "stretch" : "flex-end", justifyContent: area === "full" ? "center" : "flex-start", alignContent: "flex-end", gap: "1.6vmin", height: "100%" }}>
      {cards.map((t) => (
        <article key={t.team} aria-label={`${t.team}, rank ${t.rank}, ${t.points} points`} style={{ ...box(c), display: "flex", alignItems: "center", gap: "2vmin", flex: stack ? "none" : "1 1 0", minWidth: stack ? 0 : "26vmin", maxWidth: stack ? "none" : "60vmin" }}>
          <TeamBadge name={t.team} c={c} size={10} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "3.2vmin", fontWeight: 800, color: c.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: c.upper ? "uppercase" : "none" }}>{t.team}</p>
            <p style={{ fontSize: "2.6vmin", fontWeight: 800, color: c.accent, fontVariantNumeric: "tabular-nums" }}>Rank {t.rank}<span style={{ color: c.soft }}>  ·  </span>{t.points} pts</p>
            <p style={{ fontSize: "2.4vmin", color: c.soft, fontVariantNumeric: "tabular-nums" }}>{feed.mode === "br" ? `${t.kills ?? 0} kills · ${t.wins} ${t.wins === 1 ? "win" : "wins"}` : `${t.wins} won · ${t.lost ?? 0} lost`}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
