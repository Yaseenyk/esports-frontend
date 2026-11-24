"use client";

import { useMemo, useState } from "react";
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
  return { ...errors, fromId, setFromId, toId, setToId, sens, setSens, dpiFrom, setDpiFrom, dpiTo, setDpiTo, dpiChange, setDpiChange, check, table, payload, swap };
}
