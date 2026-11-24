"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sendEvent } from "@/lib/track";
import type { Payload } from "@/lib/display";
import { allGames, convert, dpiError, gameById, roundFor, sensError } from "@/features/sensitivity/domain";

/** The converter's state and its answer. Starts on a common example: Valorant 0.4 at 800 DPI. */
export function useSensitivity() {
  const [fromId, setFromId] = useState("valorant");
  const [toId, setToId] = useState("cs2");
  const [sens, setSens] = useState("0.4");
  const [dpiFrom, setDpiFrom] = useState("800");
  const [dpiTo, setDpiTo] = useState("800");
  const [dpiChange, setDpiChange] = useState(false);

  const check = useMemo(
    () => convert({ fromId, toId, sens: Number(sens), dpiFrom: Number(dpiFrom), dpiTo: Number(dpiChange ? dpiTo : dpiFrom) }),
    [fromId, toId, sens, dpiFrom, dpiTo, dpiChange],
  );
  // Counts one completed conversion per visit, once the visitor has typed their own value and the answer is valid.
  const typed = useRef(false), sent = useRef(false);
  useEffect(() => {
    if (!typed.current || sent.current || !check.ok) return;
    const t = setTimeout(() => { sent.current = true; sendEvent("tool_complete", "sensitivity-converter"); }, 1500);
    return () => clearTimeout(t);
  }, [check]);
  const mark = <T,>(set: (v: T) => void) => (v: T) => { typed.current = true; set(v); };

  const table = useMemo(() => {
    const from = gameById(fromId);
    if (!check.ok || !from) return [];
    return allGames(Number(sens), from, Number(dpiFrom), Number(dpiChange ? dpiTo : dpiFrom));
  }, [check, fromId, sens, dpiFrom, dpiTo, dpiChange]);

  /** The answer as a table picture for Share result. */
  const payload = useMemo<Payload | null>(() => {
    if (!check.ok) return null;
    const r = check.result, dpi = Number(dpiChange ? dpiTo : dpiFrom);
    return {
      v: "table",
      d: {
        title: "Sensitivity converted",
        subtitle: `${r.from.name} ${sens} at ${dpiFrom} DPI = ${roundFor(r.cm360, 1)} cm/360`,
        head: ["#", "Game", `Sens at ${dpi} DPI`],
        rows: table.map((t, i) => [String(i + 1), t.game.name, t.text]),
        strong: 2,
      },
    };
  }, [check, table, sens, dpiFrom, dpiTo, dpiChange]);

  const swap = () => { setFromId(toId); setToId(fromId); };
  const errors = { sensError: sensError(sens), dpiFromError: dpiError(dpiFrom), dpiToError: dpiChange ? dpiError(dpiTo) : undefined };
  return { ...errors, fromId, setFromId: mark(setFromId), toId, setToId: mark(setToId), sens, setSens: mark(setSens), dpiFrom, setDpiFrom: mark(setDpiFrom), dpiTo, setDpiTo: mark(setDpiTo), dpiChange, setDpiChange, check, table, payload, swap };
}
