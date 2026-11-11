"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ViewRenderer from "@/components/live/ViewRenderer";
import MatchesView from "@/components/live/MatchesView";
import { live } from "@/lib/api/cloud";
import { createPoller } from "@/lib/api/poller";
import { EMBED_MSG, KINDS_FOR, VIEW_LABEL, parseEmbedQuery, type EmbedOptions } from "@/lib/embed";
import { sendHit } from "@/lib/hits";
import { agoText, liveUrl, orderedViews, type PublicLive } from "@/lib/live";

type Status = "loading" | "ready" | "missing" | "error";

/** Colours for the part that is not drawn by the shared renderers. The renderers are dark; in the light theme they are inverted with a filter. */
const THEMES = {
  dark: { bg: "#05070a", fg: "#f4f4f5", mute: "#a1a1aa", line: "rgba(255,255,255,0.12)", link: "#22d3ee" },
  light: { bg: "#ffffff", fg: "#09090b", mute: "#52525b", line: "rgba(0,0,0,0.14)", link: "#0e7490" },
} as const;

/**
 * The widget a college or club puts on its own site, inside an iframe. No site header, footer or navigation. Text and images only.
 * It sends one thing to the page around it: its own height as a number (no data), so the frame can grow to fit.
 */
export default function EmbedWidget() {
  const [opts, setOpts] = useState<EmbedOptions | null | undefined>(undefined);
  const [data, setData] = useState<PublicLive | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [okAt, setOkAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [offline, setOffline] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpts(parseEmbedQuery(location.search)); }, []);
  useEffect(() => { if (opts) sendHit(opts.slug, "embed", opts.view); }, [opts]);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 15_000); return () => clearInterval(id); }, []);

  const slug = opts?.slug ?? "";
  useEffect(() => {
    if (!slug) return;
    const p = createPoller<PublicLive>({
      fetch: () => live.public(slug),
      same: (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b),
      onData: (d) => { setData(d); setStatus("ready"); setOkAt(Date.now()); setOffline(false); },
      onError: (e) => { const s = (e as { status?: number }).status; if (s === 404) { setStatus("missing"); setData(null); } else { setOffline(true); setStatus((cur) => (cur === "loading" ? "error" : cur)); } },
      minMs: 20_000, maxMs: 60_000, staleMs: 15_000,
    });
    const wake = () => { setOffline(!navigator.onLine); p.resume(); };
    document.addEventListener("visibilitychange", wake); window.addEventListener("online", wake); window.addEventListener("offline", wake);
    p.start();
    return () => { p.stop(); document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); window.removeEventListener("offline", wake); };
  }, [slug]);

  // Tell the page around us how tall we are: on load, on every resize of the content and after every update. Only a number is sent.
  const frameId = opts?.id ?? "";
  useEffect(() => {
    const el = root.current;
    if (!el || window.parent === window) return;
    const send = () => { try { window.parent.postMessage({ type: EMBED_MSG, height: Math.ceil(el.getBoundingClientRect().height), id: frameId }, "*"); } catch { /* nothing to tell */ } };
    send();
    if (typeof ResizeObserver === "undefined") { window.addEventListener("resize", send); return () => window.removeEventListener("resize", send); }
    const ro = new ResizeObserver(send);
    ro.observe(el);
    return () => ro.disconnect();
  }, [frameId, opts, status, data]);

  const view = opts?.view ?? "standings", team = opts?.team ?? "";
  const th = THEMES[opts?.theme ?? "dark"];
  const snap = data?.snapshot ?? null;
  const matchList = useMemo(() => (Array.isArray(data?.matches) ? data!.matches! : []), [data]);
  const picked = useMemo(() => {
    if (!snap || view === "matches") return undefined;
    const views = orderedViews(snap);
    for (const k of KINDS_FOR[view]) { const v = views.find((x) => x.kind === k); if (v) return v; }
    return undefined;
  }, [snap, view]);

  const home = typeof location === "undefined" || !slug ? "https://esports.streamerosai.com/" : liveUrl(location.origin, slug);
  const footer = (
    <p className="pt-3 text-center text-sm" style={{ color: th.mute }}>
      <a href={home} target="_top" rel="noopener" className="inline-flex min-h-11 items-center underline underline-offset-4 outline-none focus-visible:ring-2" style={{ color: th.link }}>Live on Esports Hub</a>
    </p>
  );
  const note = (title: string, text: string, alert = false) => (
    <div className="py-6 text-center"><p className="font-display text-lg font-bold" style={{ color: th.fg }}>{title}</p><p role={alert ? "alert" : "status"} className="mt-2 text-base" style={{ color: th.mute }}>{text}</p></div>
  );

  let body: React.ReactNode;
  const skeleton = <div aria-busy="true"><p className="sr-only" role="status">Loading</p><div className="sk h-8 w-2/3 rounded-lg" /><div className="sk mt-3 h-40 w-full rounded-xl" /></div>;
  if (opts === undefined) body = skeleton;
  else if (opts === null) body = note("This widget is not set up right", "The link is missing the event code. Copy the code again from the Put it on your website panel.", true); // checked before "loading": a link with no valid code never starts loading
  else if (status === "loading") body = skeleton;
  else if (status === "missing") body = note("Not live yet", "The organiser has not published this event page yet. It will appear here by itself as soon as it is live.");
  else if (status === "error" || !data || !snap) body = note("Could not load this", "Check the connection. It tries again by itself.", true);
  else {
    const content = view === "matches"
      ? (matchList.length ? <MatchesView matches={matchList} team={team} /> : null)
      : picked ? <ViewRenderer key={picked.kind} payload={picked.payload} team={team} /> : null;
    body = (
      <>
        <p className="flex flex-wrap items-center gap-x-2 pb-2 text-sm" style={{ color: th.mute }}>
          <span className="min-w-0 flex-1 truncate font-bold" style={{ color: th.fg }}>{data.event.name}</span>
          <span>{VIEW_LABEL[view]}{okAt ? ` · updated ${agoText(Math.max(0, now - okAt))}` : ""}</span>
        </p>
        <div role="status" aria-live="polite" className="empty:hidden">{offline ? <p className="mb-2 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: th.line, color: th.fg }}>You are offline. Showing the last update.</p> : null}</div>
        {content
          ? <div style={opts.theme === "light" ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}>{content}</div>
          : <p role="status" className="py-6 text-center text-base" style={{ color: th.mute }}>{view === "matches" ? "No matches have been added yet." : `The ${VIEW_LABEL[view].toLowerCase()} has not been published yet.`} Check back soon.</p>}
      </>
    );
  }

  return (
    <div ref={root} className="eh-root px-3 pb-2 pt-3" data-theme={opts?.theme ?? "dark"} style={{ background: th.bg, color: th.fg }}>
      <style>{`footer.no-print,div.no-print.sticky.top-3,.aurora,body>canvas,canvas[aria-hidden="true"]{display:none!important}main:has(.eh-root){padding:0;max-width:none}body:has(.eh-root),html:has(.eh-root){background:${th.bg}!important;min-height:0}body{min-height:0!important}`}</style>
      {body}
      {footer}
    </div>
  );
}
