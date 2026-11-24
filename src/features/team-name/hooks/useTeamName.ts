"use client";

import { useCallback, useMemo, useState } from "react";
import { downloadBlob } from "@/lib/idcard/download";
import { sendEvent } from "@/lib/track";
import { badgeFileName, badgeSvg, charCount, generateNames, glossFor, nameProblem, stylish, type Frame, type Letters, type Pattern, type Preset, type Shape, type Theme } from "@/features/team-name/domain";
import { svgToPng } from "@/features/team-name/render";

export const NAMES_PER_ROLL = 8;

/** The generator's state: preset, theme, the current list, the chosen or typed name, stylish versions and the badge settings. Nothing is stored. */
export function useTeamName(initial: { preset?: Preset; stylish?: boolean } = {}) {
  const [preset, setPresetState] = useState<Preset>(initial.preset ?? "general");
  const [theme, setThemeState] = useState<Theme>("animals");
  const [seed, setSeed] = useState(1);
  const names = useMemo(() => generateNames(theme, NAMES_PER_ROLL, seed, preset), [theme, seed, preset]);
  const [styled, setStyled] = useState(initial.stylish ?? false);
  const [letters, setLetters] = useState<Letters>("bold");
  const [frame, setFrame] = useState<Frame>("curl");
  /** Each name with its stylish version (empty when stylish is off) and that version's length in characters. */
  const rows = useMemo(() => names.map((n) => { const s = styled ? stylish(n, letters, frame) : ""; return { name: n, stylish: s, chars: charCount(s) }; }), [names, styled, letters, frame]);
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
  const setPreset = (p: Preset) => { setPresetState(p); setChosen(""); setUseOwn(false); };
  const roll = () => { setSeed((s) => (s * 7919 + 104729) % 2147483647 || 1); setChosen(""); setUseOwn(false); };

  const downloadSvg = useCallback(() => {
    if (!svg) return;
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), badgeFileName(name, "svg")); sendEvent("tool_complete", "team-name-generator");
    setMsg({ ok: true, text: "Badge saved as SVG." });
  }, [svg, name]);
  const downloadPng = useCallback(async () => {
    if (!svg) return;
    try { downloadBlob(await svgToPng(svg), badgeFileName(name, "png")); sendEvent("tool_complete", "team-name-generator"); setMsg({ ok: true, text: "Badge saved as PNG (1024 x 1024)." }); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "The badge could not be saved." }); }
  }, [svg, name]);
  /** Copies any name: the chosen one, a name from the list or its stylish version. */
  const copy = useCallback(async (text: string) => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); sendEvent("tool_complete", "team-name-generator"); setMsg({ ok: true, text: `Copied: ${text}` }); }
    catch { setMsg({ ok: false, text: "Could not copy here. Select the name and copy it yourself." }); }
  }, []);
  const copyName = useCallback(() => copy(name), [copy, name]);

  return {
    preset, setPreset, theme, setTheme, names, rows, roll, styled, setStyled, letters, setLetters, frame, setFrame, copy, chosen: chosen || names[0] || "", setChosen: (n: string) => { setChosen(n); setUseOwn(false); },
    own, setOwn, useOwn, setUseOwn, ownProblem, name, gloss: glossFor(name),
    shape, setShape, pattern, setPattern, primary, setPrimary, secondary, setSecondary,
    svg, preview, downloadSvg, downloadPng, copyName, msg,
  };
}
