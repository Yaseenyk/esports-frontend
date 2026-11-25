"use client";

import { useMemo, useState } from "react";
import { dpiError, edpiCalc, sensError } from "@/features/sensitivity/domain";
import { sensCopy } from "@/features/sensitivity/copy";
import type { UiLang } from "@/lib/pt-br";

/** The eDPI calculator's state: game, sensitivity and DPI in; eDPI, cm/360 and the matching eDPI in each listed game out. */
export function useEdpi(lang: UiLang = "en") {
  const c = sensCopy(lang);
  const [gameId, setGameId] = useState("valorant");
  const [sens, setSens] = useState("0.4");
  const [dpi, setDpi] = useState("800");
  const check = useMemo(() => edpiCalc(gameId, Number(sens), Number(dpi)), [gameId, sens, dpi]);
  return { gameId, setGameId, sens, setSens, dpi, setDpi, check, sensError: sensError(sens) && c.sensError, dpiError: dpiError(dpi) && c.dpiError };
}
