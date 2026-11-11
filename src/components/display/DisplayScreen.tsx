"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHANNEL, DEFAULT_LOOK, decode, lookFrom, remaining, secondsUntil, slotNow, validate, type BracketData, type CountdownData, type Look, type Payload, type ScheduleData, type TableData } from "@/lib/display";
import { gateClient } from "@/lib/api/cloud";
import { createPoller } from "@/lib/api/poller";

const THEMES = {
  dark: { fg: "#f4f4f5", soft: "#a1a1aa", accent: "#22d3ee", accent2: "#a855f7", row: "rgba(255,255,255,.06)", line: "rgba(255,255,255,.14)", bg: "#05070a" },
  light: { fg: "#111827", soft: "#4b5563", accent: "#0e7490", accent2: "#7c3aed", row: "rgba(17,24,39,.06)", line: "rgba(17,24,39,.18)", bg: "#ffffff" },
  neon: { fg: "#ffffff", soft: "#c4b5fd", accent: "#22d3ee", accent2: "#f472b6", row: "rgba(168,85,247,.16)", line: "rgba(34,211,238,.4)", bg: "#0b0220" },
} as const;
type Theme = (typeof THEMES)[Look["theme"]];

const pad = (n: number) => String(n).padStart(2, "0");

function useNow(every = 1000) { const [n, setN] = useState(() => Date.now()); useEffect(() => { const id = setInterval(() => setN(Date.now()), every); return () => clearInterval(id); }, [every]); return n; }

function Title({ title, subtitle, c }: { title: string; subtitle?: string; c: Theme }) {
  return <header className="mb-[2.2vmin]"><h1 style={{ fontSize: "5.2vmin", lineHeight: 1.05, fontWeight: 800, color: c.fg, letterSpacing: "-.01em" }}>{title}</h1>{subtitle && <p style={{ fontSize: "2.4vmin", color: c.soft, marginTop: ".6vmin" }}>{subtitle}</p>}</header>;
}

/** A table that fills the screen. Long tables scroll by themselves, rows that move up flash, and the top three get medals. */
function TableView({ d, c }: { d: TableData; c: Theme }) {
  const prev = useRef<Map<string, number>>(new Map());
  const [up, setUp] = useState<Set<string>>(new Set());
  const nameCol = d.head.findIndex((h) => /team|name|player/i.test(h)) >= 0 ? d.head.findIndex((h) => /team|name|player/i.test(h)) : 1;
  useEffect(() => {
    const now = new Map(d.rows.map((r, i) => [r[nameCol] ?? String(i), i]));
    const moved = new Set<string>();
    now.forEach((i, k) => { const was = prev.current.get(k); if (was !== undefined && i < was) moved.add(k); });
    prev.current = now;
    if (moved.size) { setUp(moved); const t = setTimeout(() => setUp(new Set()), 3500); return () => clearTimeout(t); }
  }, [d, nameCol]);
  const scrolls = d.rows.length > 12;
  const medal = ["#facc15", "#d4d4d8", "#d97706"];
  const cols = `minmax(6vmin,.6fr) minmax(0,3fr) ${d.head.slice(2).map(() => "minmax(7vmin,1fr)").join(" ")}`;
  const row = (r: string[], i: number, key: string, hidden = false) => (
    <li key={key} aria-hidden={hidden || undefined} className={up.has(r[nameCol] ?? "") ? "ds-flash" : ""} style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", gap: "1.2vmin", padding: "1.1vmin 1.6vmin", marginBottom: ".8vmin", borderRadius: "1.2vmin", background: c.row, borderLeft: `.7vmin solid ${i < 3 ? medal[i] : "transparent"}`, fontSize: "3.1vmin", animation: `dsIn .5s ${Math.min(i, 14) * 0.05}s both ease-out` }}>
      {r.map((cell, j) => <span key={j} style={{ color: j === d.strong ? c.accent : j === 0 && i < 3 ? medal[i] : j === 1 ? c.fg : c.soft, fontWeight: j === d.strong || j <= 1 ? 800 : 500, textAlign: j >= 2 ? "right" : "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{cell}</span>)}
    </li>
  );
  return (
    <section aria-label={d.title} className="flex h-full min-h-0 flex-col">
      <Title title={d.title} subtitle={d.subtitle} c={c} />
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: "1.2vmin", padding: "0 1.6vmin .8vmin 2.3vmin", fontSize: "2vmin", color: c.soft, textTransform: "uppercase", letterSpacing: ".08em" }}>{d.head.map((h, j) => <span key={j} style={{ textAlign: j >= 2 ? "right" : "left" }}>{h}</span>)}</div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <ul className={scrolls ? "ds-scroll" : ""} style={scrolls ? ({ ["--ds-dur" as string]: `${d.rows.length * 2.2}s` } as React.CSSProperties) : undefined}>
          {d.rows.map((r, i) => row(r, i, `a${i}`))}
          {scrolls && d.rows.map((r, i) => row(r, i, `b${i}`, true))}
        </ul>
      </div>
    </section>
  );
}

function ScheduleView({ d, c }: { d: ScheduleData; c: Theme }) {
  const now = useNow(1000);
  const { current, next } = useMemo(() => slotNow(d, new Date(now)), [d, now]);
  const cur = useRef<HTMLLIElement>(null);
  useEffect(() => { cur.current?.scrollIntoView({ block: "center", behavior: "smooth" }); }, [current, next]);
  const target = current >= 0 ? current : next;
  const toNext = next >= 0 ? secondsUntil(d, d.slots[next]!.start, new Date(now)) : null;
  return (
    <section aria-label={d.title} className="flex h-full min-h-0 flex-col">
      <Title title={d.title} subtitle={current >= 0 ? `Now: round ${d.slots[current]!.n}${toNext !== null ? `   ·   Next in ${pad(Math.floor(toNext / 60))}:${pad(toNext % 60)}` : ""}` : toNext !== null ? `Next round starts in ${pad(Math.floor(toNext / 3600))}:${pad(Math.floor(toNext / 60) % 60)}:${pad(toNext % 60)}` : "Schedule finished"} c={c} />
      <ul className="min-h-0 flex-1 overflow-hidden">
        {d.slots.map((s, i) => {
          const isNow = i === current, past = current >= 0 ? i < current : next >= 0 ? i < next : true;
          return (
            <li key={i} ref={i === target ? cur : undefined} style={{ display: "grid", gridTemplateColumns: "10vmin 38vmin 1fr auto", alignItems: "center", gap: "2vmin", padding: "1.3vmin 2vmin", marginBottom: ".8vmin", borderRadius: "1.2vmin", background: isNow ? `linear-gradient(90deg, ${c.accent}33, ${c.accent2}22)` : c.row, outline: isNow ? `.35vmin solid ${c.accent}` : "none", opacity: past && !isNow ? 0.45 : 1, fontSize: "3.2vmin", animation: `dsIn .5s ${Math.min(i, 12) * 0.04}s both ease-out` }}>
              <span style={{ color: c.accent, fontWeight: 800 }}>R{s.n}</span>
              <span style={{ color: c.fg, fontWeight: 800, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{s.start}<span style={{ color: c.soft, fontWeight: 400 }}> to {s.end}</span></span>
              <span style={{ color: c.fg }}>{s.label}{s.breakAfter ? <span style={{ color: c.soft, fontSize: "2.2vmin" }}>   · break {s.breakAfter} min after</span> : null}</span>
              {isNow && <span className="ds-pulse" style={{ background: c.accent, color: "#05070a", fontWeight: 800, fontSize: "2.2vmin", padding: ".4vmin 1.4vmin", borderRadius: "5vmin" }}>NOW</span>}
              {!isNow && i === next && <span style={{ color: c.accent2, fontWeight: 800, fontSize: "2.2vmin" }}>NEXT</span>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** A knockout bracket that fits the screen. Text size follows how many matches the widest round has, winners are lit, the champion gets a card. */
function BracketView({ d, c }: { d: BracketData; c: Theme }) {
  const weight = (sec: BracketData["sections"][number]) => Math.max(1, ...sec.rounds.map((r) => r.matches.length));
  const total = d.sections.reduce((n, sec) => n + weight(sec), 0);
  const fs = Math.max(1.15, Math.min(2.7, (d.sections.length > 1 ? 52 : 60) / (total * 2.7)));
  const card = (m: BracketData["sections"][number]["rounds"][number]["matches"][number], i: number) => (
    <li key={i} style={{ borderRadius: `${fs * 0.5}vmin`, background: c.row, border: `.2vmin solid ${c.line}`, overflow: "hidden", fontSize: `${fs}vmin`, animation: `dsIn .5s ${Math.min(i, 12) * 0.04}s both ease-out` }}>
      {[m.a, m.b].map((t, side) => {
        const won = m.w === side, lost = m.w !== undefined && m.w !== side;
        return <div key={side} style={{ display: "flex", justifyContent: "space-between", gap: ".6em", padding: `${fs * 0.28}vmin ${fs * 0.6}vmin`, borderTop: side ? `.15vmin solid ${c.line}` : "none", background: won ? `${c.accent}33` : "transparent", color: lost || t === "TBD" || t === "Bye" ? c.soft : c.fg, fontWeight: won ? 800 : 500, textDecoration: lost ? "line-through" : "none", opacity: lost ? 0.6 : 1 }}><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t}</span>{won && <span aria-hidden="true" style={{ color: c.accent }}>✓</span>}</div>;
      })}
    </li>
  );
  return (
    <section aria-label={d.title} className="flex h-full min-h-0 flex-col">
      <Title title={d.title} c={c} />
      <div className="flex min-h-0 flex-1 flex-col" style={{ gap: "1.2vmin" }}>
        {d.sections.map((sec, si) => (
          <div key={si} className="flex min-h-0 flex-col" style={{ flex: `${weight(sec)} 1 0` }}>
            {sec.name && <h2 style={{ fontSize: "2vmin", color: c.accent2, textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 800, marginBottom: ".5vmin" }}>{sec.name}</h2>}
            <div className="flex min-h-0 flex-1" style={{ gap: "1.6vmin" }}>
              {sec.rounds.map((r, ri) => (
                <div key={ri} className="flex min-w-0 flex-1 flex-col">
                  <p style={{ fontSize: "1.6vmin", color: c.soft, textTransform: "uppercase", letterSpacing: ".08em", textAlign: "center", marginBottom: ".5vmin" }}>{r.name}</p>
                  <ul className="flex min-h-0 flex-1 flex-col justify-around" style={{ gap: ".6vmin" }}>{r.matches.map(card)}</ul>
                </div>
              ))}
              {si === d.sections.length - 1 && d.champion !== undefined && (
                <div className="flex min-w-0 flex-1 flex-col"><p style={{ fontSize: "1.6vmin", color: c.accent2, textTransform: "uppercase", letterSpacing: ".08em", textAlign: "center", marginBottom: ".5vmin" }}>Champion</p><div className="flex flex-1 items-center"><div className="ds-pulse" style={{ width: "100%", textAlign: "center", padding: "2vmin 1vmin", borderRadius: "1.6vmin", border: `.3vmin solid ${c.accent}`, background: `linear-gradient(135deg, ${c.accent}33, ${c.accent2}33)` }}><div style={{ fontSize: "5vmin" }} aria-hidden="true">🏆</div><div style={{ fontSize: "2.8vmin", fontWeight: 800, color: c.fg }}>{d.champion}</div></div></div></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CountdownView({ d, c }: { d: CountdownData; c: Theme }) {
  const now = useNow(250);
  const r = remaining(d.at, now);
  const cell = (n: number, label: string) => <div style={{ textAlign: "center" }}><div style={{ fontSize: "17vmin", fontWeight: 800, lineHeight: 1, color: c.fg, fontVariantNumeric: "tabular-nums", textShadow: `0 0 4vmin ${c.accent}55` }}>{pad(n)}</div><div style={{ fontSize: "2.4vmin", color: c.soft, textTransform: "uppercase", letterSpacing: ".2em", marginTop: "1vmin" }}>{label}</div></div>;
  return (
    <section aria-label={d.title} className="flex h-full flex-col items-center justify-center text-center">
      <h1 style={{ fontSize: "7vmin", fontWeight: 800, color: c.fg, lineHeight: 1.05 }}>{d.title}</h1>
      {d.subtitle && <p style={{ fontSize: "3vmin", color: c.soft, marginTop: "1vmin" }}>{d.subtitle}</p>}
      {r.done
        ? <p className="ds-pulse" style={{ fontSize: "14vmin", fontWeight: 900, color: c.accent, marginTop: "4vmin" }}>LIVE NOW</p>
        : <div style={{ display: "flex", gap: "4vmin", marginTop: "5vmin" }}>{r.days > 0 && cell(r.days, "days")}{cell(r.hours, "hours")}{cell(r.minutes, "minutes")}{cell(r.seconds, "seconds")}</div>}
    </section>
  );
}

interface GateRow { id: string; name: string; team: string | null; role: string; checkedInAt: string | null }

/** A live arrivals counter fed by a gate key. Shows only counts unless names are switched on in the link. */
function CheckinView({ gateKey, title, look, c }: { gateKey: string; title: string; look: Look; c: Theme }) {
  const [rows, setRows] = useState<GateRow[] | null>(null);
  const [event, setEvent] = useState(title);
  const [err, setErr] = useState("");
  useEffect(() => {
    const g = gateClient(gateKey);
    const p = createPoller({ fetch: () => g.roster(), same: (a, b) => a.people.filter((x) => x.checkedInAt).length === b.people.filter((x) => x.checkedInAt).length, onData: (r) => { setRows(r.people); setEvent(title || r.event.name); setErr(""); }, onError: (e) => setErr((e as { status?: number }).status === 401 ? "This gate key is not valid or has expired." : "Reconnecting…"), minMs: 8000, maxMs: 30000 });
    const wake = () => p.resume();
    document.addEventListener("visibilitychange", wake); window.addEventListener("online", wake);
    p.start();
    return () => { p.stop(); document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); };
  }, [gateKey, title]);
  if (err && !rows) return <p style={{ fontSize: "4vmin", color: c.soft }} role="alert">{err}</p>;
  const total = rows?.length ?? 0, done = rows?.filter((r) => r.checkedInAt).length ?? 0, pct = total ? Math.round((done / total) * 100) : 0;
  const recent = (rows ?? []).filter((r) => r.checkedInAt).sort((a, b) => (b.checkedInAt! > a.checkedInAt! ? 1 : -1)).slice(0, 6);
  const roles = Object.entries((rows ?? []).reduce<Record<string, [number, number]>>((m, r) => { const x = (m[r.role] ??= [0, 0]); x[1]++; if (r.checkedInAt) x[0]++; return m; }, {}));
  return (
    <section aria-label="Check-in" className="flex h-full flex-col justify-center">
      <Title title={event || "Check-in"} subtitle="Guests checked in" c={c} />
      <div style={{ display: "flex", alignItems: "baseline", gap: "2vmin" }}><span style={{ fontSize: "26vmin", fontWeight: 900, lineHeight: 1, color: c.accent, fontVariantNumeric: "tabular-nums" }}>{done}</span><span style={{ fontSize: "7vmin", color: c.soft }}>of {total}</span><span style={{ fontSize: "7vmin", color: c.fg, marginLeft: "auto" }}>{pct}%</span></div>
      <div style={{ height: "3vmin", borderRadius: "3vmin", background: c.row, overflow: "hidden", margin: "2.5vmin 0" }}><div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${c.accent}, ${c.accent2})`, transition: "width 1s ease" }} /></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.6vmin" }}>{roles.map(([role, [a, b]]) => <span key={role} style={{ background: c.row, borderRadius: "2vmin", padding: ".8vmin 2vmin", fontSize: "2.6vmin", color: c.fg }}>{role} <strong style={{ color: c.accent }}>{a}</strong><span style={{ color: c.soft }}> / {b}</span></span>)}</div>
      {look.names && recent.length > 0 && <ul style={{ marginTop: "3vmin", fontSize: "3vmin", color: c.fg }}>{recent.map((r) => <li key={r.id} style={{ marginBottom: ".6vmin", animation: "dsIn .5s both" }}>{r.name} <span style={{ color: c.soft }}>· {r.team ?? r.role}</span></li>)}</ul>}
    </section>
  );
}

/**
 * The fullscreen display: no menus, big readable text, safe margins for TVs, an optional transparent background for OBS and YouTube.
 * The view comes from the link (after the # sign) or arrives live from the tool that opened it.
 */
export default function DisplayScreen() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [look, setLook] = useState<Look>(DEFAULT_LOOK);
  const [extra, setExtra] = useState<{ view: string; key: string; title: string; at: string; sub: string }>({ view: "", key: "", title: "", at: "", sub: "" });
  const [bad, setBad] = useState(false);
  const [bar, setBar] = useState(true);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.dataset.display = "1";
    const q = new URLSearchParams(location.search);
    const l = lookFrom(q);
    setLook(l);
    document.body.style.background = l.bg === "transparent" ? "transparent" : l.bg === DEFAULT_LOOK.bg ? THEMES[l.theme].bg : l.bg;
    setExtra({ view: q.get("v") ?? "", key: q.get("k") ?? "", title: q.get("title") ?? "", at: q.get("t") ?? "", sub: q.get("sub") ?? "" });
    // The link can change while the screen stays open (the tool opens the same window again), so read it now and whenever it changes.
    let alive = true;
    const fromHash = () => {
      const h = new URLSearchParams(location.hash.slice(1)).get("d");
      if (h) void decode(h).then((p) => { if (!alive) return; if (p) { setPayload(p); setBad(false); } else setBad(true); });
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    let ch: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") { ch = new BroadcastChannel(CHANNEL); ch.onmessage = (e: MessageEvent) => { const p = validate(e.data?.payload); if (p) { setPayload(p); setBad(false); } }; ch.postMessage({ ready: true }); }
    return () => { alive = false; window.removeEventListener("hashchange", fromHash); ch?.close(); delete document.documentElement.dataset.display; document.body.style.background = ""; };
  }, []);

  const wake = useCallback(() => { setBar(true); if (idle.current) clearTimeout(idle.current); idle.current = setTimeout(() => setBar(false), 3000); }, []);
  useEffect(() => { wake(); const k = (e: KeyboardEvent) => { if (e.key === "f" || e.key === "F") void toggleFull(); else wake(); }; window.addEventListener("keydown", k); return () => { window.removeEventListener("keydown", k); if (idle.current) clearTimeout(idle.current); }; }, [wake]);
  const toggleFull = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { /* not allowed here */ } };

  const c = THEMES[look.theme];
  const transparent = look.bg === "transparent";
  const countdown: CountdownData | null = extra.view === "countdown" && !Number.isNaN(Date.parse(extra.at)) ? { title: extra.title || "Starting soon", subtitle: extra.sub, at: extra.at } : null;

  return (
    <div className="ds-root" onPointerMove={wake} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100dvh", boxSizing: "border-box", overflow: "hidden", padding: `${look.safe}vmin`, fontSize: `${look.scale}rem`, zoom: look.scale === 1 ? undefined : look.scale, color: c.fg, background: transparent ? "transparent" : undefined, cursor: bar ? "default" : "none", fontFamily: "var(--font-body), system-ui, sans-serif" }}>
      <div style={{ height: "100%", width: "100%" }}>
        {extra.view === "checkin" && extra.key ? <CheckinView gateKey={extra.key} title={extra.title} look={look} c={c} />
          : countdown ? <CountdownView d={countdown} c={c} />
          : payload?.v === "table" ? <TableView d={payload.d} c={c} />
          : payload?.v === "schedule" ? <ScheduleView d={payload.d} c={c} />
          : payload?.v === "bracket" ? <BracketView d={payload.d} c={c} />
          : payload?.v === "countdown" ? <CountdownView d={payload.d} c={c} />
          : <div className="flex h-full flex-col items-center justify-center text-center" role="status">{bad ? <><p style={{ fontSize: "5vmin", fontWeight: 800 }}>This screen link is damaged</p><p style={{ fontSize: "2.6vmin", color: c.soft, marginTop: "1vmin" }}>Open the screen again from the tool it came from.</p></> : <><p style={{ fontSize: "5vmin", fontWeight: 800 }}>Waiting for a view</p><p style={{ fontSize: "2.6vmin", color: c.soft, marginTop: "1vmin" }}>Open a screen from a tool such as the points table calculator, and it appears here.</p></>}</div>}
      </div>
      <div style={{ position: "fixed", right: "2vmin", bottom: "2vmin", opacity: bar ? 1 : 0, visibility: bar ? "visible" : "hidden", transition: "opacity .4s, visibility .4s", display: "flex", gap: "1vmin", alignItems: "center", fontSize: "1.8vmin", color: c.soft, background: "rgba(0,0,0,.55)", padding: "1vmin 1.6vmin", borderRadius: "2vmin", pointerEvents: bar ? "auto" : "none" }}>
        <button type="button" onClick={toggleFull} onFocus={wake} style={{ color: "#fff", border: "1px solid rgba(255,255,255,.3)", borderRadius: "1vmin", padding: ".5vmin 1.4vmin" }}>Full screen (F)</button>
      </div>
    </div>
  );
}
