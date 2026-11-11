"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { live } from "@/lib/api/cloud";
import { createPoller } from "@/lib/api/poller";
import { sendHit } from "@/lib/hits";
import type { PublicLive } from "@/lib/live";
import { DEFAULT_OVERLAY, parseOverlayParams, type OverlayParams } from "@/lib/overlay";
import OverlayStage from "./OverlayStage";

const POLL_MS = 10_000;

/**
 * The stream overlay page (an OBS or YouTube browser source). It polls the public live data every 10 seconds, keeps the last good answer
 * when anything fails, and never shows an error: on stream, nothing is better than a broken screen. It is drawn in a portal on the body so
 * nothing from the website (menu, footer, page fade) can show through, and the page background is transparent unless asked for.
 */
export default function OverlayPage() {
  const [params, setParams] = useState<OverlayParams | null>(null);
  const [data, setData] = useState<PublicLive | null>(null);
  const last = useRef("");

  useEffect(() => { setParams(parseOverlayParams(location.search)); }, []);

  useEffect(() => {
    if (!params?.e || new URLSearchParams(location.search).get("preview") === "1") return; // the panel's preview is not a viewer
    sendHit(params.e, "overlay", params.v); // once per page load
  }, [params?.e, params?.v]);

  useEffect(() => {
    document.documentElement.dataset.display = "1";
    document.documentElement.dataset.overlay = "1";
    return () => { delete document.documentElement.dataset.display; delete document.documentElement.dataset.overlay; };
  }, []);

  const slug = params?.e ?? "";
  useEffect(() => {
    if (!slug) return;
    const p = createPoller<PublicLive>({
      fetch: () => live.public(slug),
      same: () => false, // keep the steady 10 s rhythm; an unchanged answer is a tiny 304 thanks to the ETag
      onData: (d) => { const s = JSON.stringify(d); if (s !== last.current) { last.current = s; setData(d); } }, // identical data never re-renders
      onError: () => undefined, // keep the last good data, show nothing new
      minMs: POLL_MS, maxMs: 60_000,
      isVisible: () => true, // an OBS source is often "not visible" to the browser, and must keep updating
      isOnline: () => true,
    });
    p.start();
    return () => p.stop();
  }, [slug]);

  const p = params ?? DEFAULT_OVERLAY;
  const view = useMemo(() => (params ? <OverlayStage p={p} data={data} /> : null), [params, p, data]);
  if (!params || typeof document === "undefined") return null;
  return createPortal(view, document.body);
}
