"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cardFontVars } from "@/components/idcard/fonts";
import { fontCss, themeById } from "@/lib/display-themes";
import { areaBox, countFor } from "@/features/overlay-kit/domain";
import { useKitFeed } from "@/features/overlay-kit/hooks/useKitFeed";
import { useOverlaySettings } from "@/features/overlay-kit/hooks/useOverlaySettings";
import { CardsOverlay, FraggersOverlay, PointsOverlay, plate } from "@/features/overlay-kit/ui/KitViews";

/**
 * The browser source page for OBS (1920 x 1080). Transparent, nothing from the website shows, text kept inside the safe area. The data comes
 * from a points table tool in the same browser (live), or from the snapshot in the link. Drawn in a portal on the body, like /overlay/.
 */
export default function OverlayLive() {
  const { settings: s, snapshot, ready } = useOverlaySettings();
  const { feed, players, ready: fed } = useKitFeed(s.src, snapshot);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const h = document.documentElement;
    h.dataset.display = "1"; h.dataset.kit = "1";
    return () => { delete h.dataset.display; delete h.dataset.kit; };
  }, []);

  if (!mounted || !ready) return null;
  const c = themeById(s.theme);
  const n = countFor(s);
  const a = areaBox(s.area);
  const css = `html[data-kit], html[data-kit] body { background: transparent !important; }
html[data-kit] body > *:not([data-kit-root]) { display: none !important; }`;

  let view: React.ReactNode = null;
  if (s.view === "points" && feed) view = <PointsOverlay feed={feed} n={n} c={c} />;
  else if (s.view === "fraggers") view = <FraggersOverlay feed={feed} players={players} n={n} c={c} />;
  else if (s.view === "cards") view = <CardsOverlay feed={feed} n={n} team={s.team} area={s.area} c={c} />;
  const waiting = fed && !view;

  return createPortal(
    <div data-kit-root="" className={`ds-root ${cardFontVars}`} style={{ fontFamily: fontCss(c), fontSynthesis: "none", position: "fixed", top: 0, left: 0, zIndex: 2147483000, width: `${100 / s.scale}vw`, height: `${100 / s.scale}vh`, zoom: s.scale === 1 ? undefined : s.scale, boxSizing: "border-box", overflow: "hidden", padding: `${s.safe}vh ${s.safe}vw`, color: c.fg, background: "transparent", pointerEvents: "none" }}>
      <style>{css}</style>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div data-kit-area={s.area} style={{ position: "absolute", left: `${a.left}%`, top: `${a.top}%`, width: `${a.width}%`, height: `${a.height}%` }}>{view}</div>
        {waiting && (
          <p role="status" style={{ position: "absolute", left: 0, bottom: 0, maxWidth: "70vmin", background: plate(c), color: c.fg, border: `.2vmin solid ${c.line}`, borderRadius: "1vmin", padding: "1.4vmin 2vmin", fontSize: "2.4vmin", lineHeight: 1.35 }}>
            Waiting for a points table. Open a points table tool in this browser and switch on &ldquo;Send to the OBS overlay&rdquo;, or copy the OBS link again from the overlay kit page.
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
