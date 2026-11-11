"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BracketView, CountdownView, ScheduleView, TableView } from "@/components/display/DisplayScreen";
import ExtrasBar from "@/components/display/ExtrasBar";
import { cardFontVars } from "@/components/idcard/fonts";
import type { PublicLive } from "@/lib/live";
import { fontCss, surface, themeById, type DisplayTheme } from "@/lib/display-themes";
import { lowerThird, matchBoard, payloadOf, sameTeam, type OverlayParams } from "@/lib/overlay";
import { scoreText, startText, type PublicMatch } from "@/lib/matches";

const SAFE = 2.5;

function useNow(every: number) { const [n, setN] = useState(() => Date.now()); useEffect(() => { const id = setInterval(() => setN(Date.now()), every); return () => clearInterval(id); }, [every]); return n; }

/** A backdrop the text can sit on over video: dark for dark designs, white for the light ones. Used by the slim bar and the scores. */
const plate = (c: DisplayTheme) => (c.group === "Light" ? "rgba(255,255,255,.92)" : "rgba(6,8,14,.86)");

/** The one-line bar: a coloured tag ("NEXT" or "LIVE") and the match. Fixed height, so a change of words never moves anything. */
function LowerThirdBar({ matches, snap, team, c }: { matches: PublicMatch[]; snap: PublicLive["snapshot"] | null; team: string; c: DisplayTheme }) {
  const now = useNow(15_000);
  const t = useMemo(() => lowerThird(matches, snap, team, new Date(now)), [matches, snap, team, now]);
  if (t.kind === "none") return null;
  return (
    <div role="status" aria-label={t.text} style={{ position: "absolute", left: `${SAFE}vmin`, right: `${SAFE}vmin`, bottom: `${SAFE}vmin`, height: "10vmin", display: "flex", alignItems: "stretch", overflow: "hidden", borderRadius: `${Math.min(c.radius, 1.4)}vmin`, background: plate(c), border: `.2vmin solid ${c.line}`, boxShadow: "0 .6vmin 2.4vmin rgba(0,0,0,.35)" }}>
      <span className={t.kind === "live" ? "ds-pulse" : undefined} style={{ display: "grid", placeItems: "center", padding: "0 3.4vmin", background: `linear-gradient(90deg, ${c.accent}, ${c.accent2})`, color: c.on, fontSize: "3.6vmin", fontWeight: 900, letterSpacing: ".08em" }}>{t.tag}</span>
      <span aria-hidden="true" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "2.4vmin", padding: "0 3vmin", fontSize: "4.4vmin", fontWeight: 800, color: c.fg, textTransform: c.upper ? "uppercase" : "none", whiteSpace: "nowrap" }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{t.a}</span>
        {t.mid && <span style={{ color: t.kind === "live" && t.mid !== "vs" ? c.accent : c.soft, fontWeight: 900, fontVariantNumeric: "tabular-nums", flex: "none" }}>{t.mid}</span>}
        {t.b && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{t.b}</span>}
        {t.at && <span style={{ marginLeft: "auto", flex: "none", color: c.accent, fontWeight: 800, fontSize: "3.6vmin" }}>{t.at}</span>}
      </span>
    </div>
  );
}

/** Current, next and latest matches with scores. */
function MatchesBoard({ matches, team, c }: { matches: PublicMatch[]; team: string; c: DisplayTheme }) {
  const b = useMemo(() => matchBoard(matches, team, 3), [matches, team]);
  if (!b.live.length && !b.next.length && !b.recent.length) return null;
  const row = (m: PublicMatch, i: number, tag: string, tagColor: string) => {
    const mine = !!team && (sameTeam(m.a, team) || sameTeam(m.b, team));
    const time = m.status === "live" || m.status === "finished" || m.status === "forfeit" ? "" : startText(m);
    return (
      <li key={`${tag}${m.id}`} data-ov-mine={mine ? "1" : undefined} style={{ display: "grid", gridTemplateColumns: "13vmin minmax(0,1fr) 17vmin minmax(0,1fr) 12vmin", alignItems: "center", gap: "1.6vmin", padding: "1.5vmin 2vmin", marginBottom: ".9vmin", ...surface(c, i), background: plate(c), fontSize: "3.6vmin", color: c.fg, fontWeight: 800 }}>
        <span style={{ color: tagColor, fontSize: "2.2vmin", letterSpacing: ".1em" }}>{tag}</span>
        <span style={{ textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.a.trim() || "TBD"}</span>
        <span style={{ textAlign: "center", color: c.accent, fontVariantNumeric: "tabular-nums" }}>{scoreText(m)}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.b.trim() || "TBD"}</span>
        <span style={{ textAlign: "right", color: c.soft, fontSize: "2.4vmin", fontWeight: 600 }}>{time}</span>
      </li>
    );
  };
  const group = (label: string, list: PublicMatch[], tag: string, color: string) => list.length > 0 && (
    <section aria-label={label} style={{ marginBottom: "2.2vmin" }}>
      <h2 style={{ fontSize: "2.2vmin", color: c.accent2, textTransform: "uppercase", letterSpacing: ".14em", fontWeight: 800, marginBottom: ".8vmin" }}>{label}</h2>
      <ul>{list.map((m, i) => row(m, i, tag, color))}</ul>
    </section>
  );
  return (
    <div>
      {group("On now", b.live, "LIVE", c.accent)}
      {group("Up next", b.next, "NEXT", c.accent2)}
      {group("Latest results", b.recent, "FINAL", c.soft)}
    </div>
  );
}

/** Marks the rows that belong to the chosen team (data-ov-mine), also when the view redraws or scrolls. React never touches this attribute. */
function useMark(root: React.RefObject<HTMLElement | null>, team: string, schedule: boolean) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const needle = team.trim().toLowerCase();
    let raf = 0;
    const run = () => {
      el.querySelectorAll("[data-ov-mark]").forEach((n) => n.removeAttribute("data-ov-mark"));
      if (!needle) return;
      el.querySelectorAll("li").forEach((li) => {
        if (li.hasAttribute("data-ov-mine")) return;
        const hit = schedule ? (li.textContent ?? "").toLowerCase().includes(needle) : Array.from(li.querySelectorAll("span")).some((s) => (s.textContent ?? "").trim().toLowerCase() === needle);
        if (hit) li.setAttribute("data-ov-mark", "1");
      });
    };
    const later = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(run); };
    run();
    const mo = new MutationObserver(later);
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => { mo.disconnect(); cancelAnimationFrame(raf); };
  }, [root, team, schedule]);
}

/** Everything drawn on the overlay page: the page style (transparent unless asked), the chosen view, and a soft fade whenever the data changes. */
export default function OverlayStage({ p, data }: { p: OverlayParams; data: PublicLive | null }) {
  const c = themeById(p.theme);
  const transparent = p.bg === "transparent";
  const snap = data?.snapshot ?? null;
  const matches = useMemo(() => (Array.isArray(data?.matches) ? data!.matches! : []), [data]);
  const body = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const kind = p.v === "standings" || p.v === "league" || p.v === "schedule" || p.v === "bracket" || p.v === "countdown" ? p.v : null;
  const payload = kind ? payloadOf(snap, kind) : null;
  // A soft fade on every real change of what is shown (never a layout jump: the content box keeps its size).
  const sig = JSON.stringify([p.v, payload, p.v === "matches" ? matches : null, p.v === "nextmatch" ? [matches.length] : null, snap?.ticker, snap?.sponsors?.length]);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = body.current;
    if (el && typeof el.animate === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) el.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 900, easing: "ease-out" });
  }, [sig]);
  useMark(body, p.team, p.v === "schedule");

  const bg = transparent ? "transparent" : c.base;
  const scale = p.scale;
  const mine = `${c.accent}`;
  const css = `html[data-overlay], html[data-overlay] body { background: ${bg} !important; }
html[data-overlay] body > *:not([data-ov-root]) { display: none !important; }
[data-ov-root] li[data-ov-mark], [data-ov-root] li[data-ov-mine] { background-image: linear-gradient(90deg, ${mine}55, ${mine}22) !important; box-shadow: inset .8vmin 0 0 ${mine} !important; }
[data-ov-root] .ds-scroll { will-change: transform; }`;

  let content: React.ReactNode = null;
  let extras: React.ComponentProps<typeof ExtrasBar>["x"];
  if (payload?.v === "table") content = <TableView d={payload.d} c={c} />;
  else if (payload?.v === "schedule") content = <ScheduleView d={payload.d} c={c} />;
  else if (payload?.v === "bracket") content = <BracketView d={payload.d} c={c} />;
  else if (payload?.v === "countdown") content = <CountdownView d={payload.d} c={c} />;
  else if (p.v === "matches") content = <MatchesBoard matches={matches} team={p.team} c={c} />;
  else if (p.v === "nextmatch") content = <LowerThirdBar matches={matches} snap={snap} team={p.team} c={c} />;
  else if (p.v === "ticker" && snap?.ticker.length) extras = { ticker: snap.ticker };
  else if (p.v === "sponsors" && snap?.sponsors.length) extras = { sponsors: snap.sponsors };

  const inner = p.v === "nextmatch" ? content : <div ref={body} style={{ position: "relative", height: "100%", width: "100%" }}>{content}</div>;
  return (
    <div data-ov-root="" className={`ds-root ${cardFontVars}`} style={{ fontFamily: fontCss(c), fontSynthesis: "none", position: "fixed", top: 0, left: 0, zIndex: 2147483000, width: `${100 / scale}vw`, height: `${100 / scale}dvh`, zoom: scale === 1 ? undefined : scale, boxSizing: "border-box", overflow: "hidden", padding: p.v === "nextmatch" ? 0 : `${SAFE}vmin`, color: c.fg, background: transparent ? "transparent" : undefined, pointerEvents: "none" }}>
      <style>{css}</style>
      {!transparent && c.deco && <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: c.deco, backgroundSize: c.decoSize }} />}
      {p.v === "nextmatch" ? <div ref={body} style={{ position: "absolute", inset: 0 }}>{inner}</div> : p.v === "ticker" || p.v === "sponsors" ? null : inner}
      {extras && <ExtrasBar x={extras} c={c} inset={SAFE} />}
    </div>
  );
}
