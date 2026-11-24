"use client";

import { useMemo, useState } from "react";
import type { Payload } from "@/lib/display";
import { downloadBlob } from "@/lib/idcard/download";
import { sendEvent } from "@/lib/track";
import { MAX_DAYS, planCsv, planDays, planMatches, type DayHours, type Source } from "@/features/schedule-plan/domain";

const q = (c: unknown) => `"${String(c).replace(/"/g, '""')}"`;

/** The day-wise plan: where the matches come from, the days and their hours, the stations and the daily break. Nothing is stored. */
export function useDayPlan() {
  const [source, setSource] = useState<Source>("single");
  const [teams, setTeams] = useState(16);
  const [count, setCount] = useState(20);
  const [duration, setDuration] = useState(30);
  const [gap, setGap] = useState(10);
  const [stations, setStations] = useState(2);
  const [days, setDaysState] = useState<DayHours[]>([{ start: "10:00", end: "18:00" }, { start: "10:00", end: "18:00" }]);
  const [breakAt, setBreakAt] = useState("13:00");
  const [breakMinutes, setBreakMinutes] = useState(45);

  const matches = useMemo(() => planMatches(source, source === "count" ? count : teams), [source, teams, count]);
  const check = useMemo(() => planDays(matches, { duration, gap, stations, days, breakAt, breakMinutes }), [matches, duration, gap, stations, days, breakAt, breakMinutes]);

  const setDayCount = (n: number) => setDaysState((d) => { const k = Math.max(1, Math.min(MAX_DAYS, n)); return Array.from({ length: k }, (_, i) => d[i] ?? d[d.length - 1] ?? { start: "10:00", end: "18:00" }); });
  const setDay = (i: number, k: keyof DayHours, v: string) => setDaysState((d) => d.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const payload = useMemo<Payload | null>(() => {
    if (!check.ok || check.plan.placed.length === 0) return null;
    return { v: "schedule", d: { title: "Match schedule", slots: check.plan.placed.map((p, i) => ({ n: i + 1, start: p.startText, end: p.endText, label: `Day ${p.day} · Station ${p.station} · ${p.match.id} ${p.match.label}` })) } };
  }, [check]);

  const csv = () => {
    if (!check.ok) return;
    downloadBlob(new Blob([planCsv(check.plan).map((r) => r.map(q).join(",")).join("\r\n")], { type: "text/csv" }), "day-wise-schedule.csv");
    sendEvent("tool_complete", "schedule");
  };

  return { source, setSource, teams, setTeams, count, setCount, duration, setDuration, gap, setGap, stations, setStations, days, setDayCount, setDay, breakAt, setBreakAt, breakMinutes, setBreakMinutes, matches, check, payload, csv };
}
