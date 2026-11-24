"use client";

import { useState } from "react";
import type { Payload } from "@/lib/display";
import { downloadBlob } from "@/lib/idcard/download";
import { grouped, ordinal, splitPool, splitSlots, type Rule, type SlotMode } from "@/features/prize-split/domain";

const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/,/g, "")));
const q = (c: unknown) => `"${String(c).replace(/"/g, '""')}"`;

/** State for both calculators. Starts on a worked example: 16 slots from 5 groups, and a figure of 10,000 split 50/30/20. */
export function usePrizeSplit() {
  const [slots, setSlots] = useState("16");
  const [groups, setGroups] = useState("5");
  const [mode, setMode] = useState<SlotMode>("even");
  const [sizes, setSizes] = useState<string[]>(["16", "16", "16", "16", "12"]);

  const [pool, setPool] = useState("10000");
  const [places, setPlacesState] = useState("3");
  const [rule, setRule] = useState<Rule>("custom");
  const [percents, setPercents] = useState<string[]>(["50", "30", "20"]);
  const [unit, setUnit] = useState("1");

  const g = Math.max(0, Math.min(64, Math.floor(num(groups)) || 0));
  const sizeList = Array.from({ length: g }, (_, i) => sizes[i] ?? "");
  const slotCheck = splitSlots({ slots: num(slots), groups: num(groups), mode, sizes: sizeList.map(num) });

  const p = Math.max(0, Math.min(32, Math.floor(num(places)) || 0));
  const percentList = Array.from({ length: p }, (_, i) => percents[i] ?? "");
  const poolCheck = splitPool({ pool: num(pool), places: num(places), rule, percents: percentList.map((x) => num(x) || 0), unit: num(unit) });
  const percentSum = percentList.reduce((a, b) => a + (num(b) || 0), 0);

  const setSize = (i: number, v: string) => setSizes((s) => { const n = [...s]; n[i] = v; return n; });
  const setPercent = (i: number, v: string) => setPercents((s) => { const n = [...s]; n[i] = v; return n; });
  const setPlaces = (v: string) => setPlacesState(v);

  const slotPayload: Payload | null = (slotCheck.ok ? { v: "table", d: { title: "Qualification slots", subtitle: `${slots} slots across ${groups} groups`, head: ["#", "Group", "Slots"], rows: slotCheck.groups.map((x, i) => [String(i + 1), x.group, String(x.slots)]), strong: 2 } } : null);
  const poolPayload: Payload | null = (poolCheck.ok ? { v: "table", d: { title: "Prize pool split", subtitle: `${grouped(num(pool))} across ${places} places`, head: ["#", "Place", "%", "Share"], rows: poolCheck.places.map((x) => [String(x.place), ordinal(x.place), String(x.percent), grouped(x.share)]), strong: 3 } } : null);

  const csvSlots = () => {
    if (!slotCheck.ok) return;
    const rows = [["Group", "Teams", "Slots"], ...slotCheck.groups.map((x) => [x.group, x.teams ?? "", x.slots])];
    downloadBlob(new Blob([rows.map((r) => r.map(q).join(",")).join("\r\n")], { type: "text/csv" }), "slot-split.csv");
  };
  const csvPool = () => {
    if (!poolCheck.ok) return;
    const rows = [["Place", "Percent", "Share"], ...poolCheck.places.map((x) => [ordinal(x.place), x.percent, x.share])];
    downloadBlob(new Blob([rows.map((r) => r.map(q).join(",")).join("\r\n")], { type: "text/csv" }), "pool-split.csv");
  };

  return {
    slots, setSlots, groups, setGroups, mode, setMode, sizeList, setSize, slotCheck, slotPayload, csvSlots,
    pool, setPool, places, setPlaces, rule, setRule, percentList, setPercent, percentSum, unit, setUnit, poolCheck, poolPayload, csvPool,
  };
}
