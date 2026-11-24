"use client";

import { useCallback, useMemo, useState } from "react";
import { downloadBlob } from "@/lib/idcard/download";
import { badgeFileName, badgeSvg, generateNames, glossFor, nameProblem, type Pattern, type Shape, type Theme } from "@/features/team-name/domain";
import { svgToPng } from "@/features/team-name/render";

export const NAMES_PER_ROLL = 8;

/** The generator's state: theme, the current list, the chosen or typed name, and the badge settings. Nothing is stored. */
export function useTeamName() {
  const [theme, setThemeState] = useState<Theme>("animals");
  const [seed, setSeed] = useState(1);
  const names = useMemo(() => generateNames(theme, NAMES_PER_ROLL, seed), [theme, seed]);
  const [chosen, setChosen] = useState<string>("");
  const [own, setOwn] = useState("");
  const [useOwn, setUseOwn] = useState(false);
  const [shape, setShape] = useState<Shape>("shield");
  const [pattern, setPattern] = useState<Pattern>("band");
  const [primary, setPrimary] = useState("cyan");
  const [secondary, setSecondary] = useState("ink");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const ownProblem = useOwn ? nameProblem(own) : undefined;
  const name = useOwn ? (ownProblem ? "" : own.replace(/\s+/g, " ").trim()) : chosen || names[0] || "";
  const svg = useMemo(() => (name ? badgeSvg({ name, shape, pattern, primary, secondary }) : ""), [name, shape, pattern, primary, secondary]);
  const preview = svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : "";

  const setTheme = (t: Theme) => { setThemeState(t); setChosen(""); setUseOwn(false); };
  const roll = () => { setSeed((s) => (s * 7919 + 104729) % 2147483647 || 1); setChosen(""); setUseOwn(false); };

  const downloadSvg = useCallback(() => {
    if (!svg) return;
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), badgeFileName(name, "svg"));
    setMsg({ ok: true, text: "Badge saved as SVG." });
  }, [svg, name]);
  const downloadPng = useCallback(async () => {
    if (!svg) return;
    try { downloadBlob(await svgToPng(svg), badgeFileName(name, "png")); setMsg({ ok: true, text: "Badge saved as PNG (1024 x 1024)." }); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "The badge could not be saved." }); }
  }, [svg, name]);
  const copyName = useCallback(async () => {
    if (!name) return;
    try { await navigator.clipboard.writeText(name); setMsg({ ok: true, text: "Name copied." }); }
    catch { setMsg({ ok: false, text: "Could not copy here. Select the name and copy it yourself." }); }
  }, [name]);

  return {
    theme, setTheme, names, roll, chosen: chosen || names[0] || "", setChosen: (n: string) => { setChosen(n); setUseOwn(false); },
    own, setOwn, useOwn, setUseOwn, ownProblem, name, gloss: glossFor(name),
    shape, setShape, pattern, setPattern, primary, setPrimary, secondary, setSecondary,
    svg, preview, downloadSvg, downloadPng, copyName, msg,
  };
}
