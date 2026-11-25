"use client";

import { useCallback, useEffect, useState } from "react";
import { explainFailure, type V3Result } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import { BLANK_RULE, MAX_RULES, placeProblem, type AlertRule, type AlertSettings } from "@/features/alerts/domain";
import { confirmToken, deleteAlerts, fetchAlerts, saveRules, sendConfirm, stopAlerts, unsubscribeToken } from "@/features/alerts/services/alerts.api";

/** The signed-in settings screen: edit up to 5 rules, save, send the confirmation email, stop, delete. */
export function useAlerts() {
  const res = useResource<AlertSettings>(fetchAlerts, []);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [settings, setSettings] = useState<AlertSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [adultNeeded, setAdultNeeded] = useState(false);
  const ready = res.phase === "ready" ? res.data : null;
  useEffect(() => { if (ready) { setSettings(ready); setRules(ready.rules.length ? ready.rules : [BLANK_RULE]); } }, [ready]);
  const run = useCallback(async (label: string, call: () => Promise<V3Result<AlertSettings>>) => {
    setBusy(true); setError(""); setNotice("");
    const r = await call();
    setBusy(false);
    if (r.ok) { setSettings(r.data); setNotice(label); return true; }
    if (r.failure.code === "adult_required") setAdultNeeded(true);
    setError(r.failure.code === "mail_budget_exhausted" ? "Alert emails are paused for today to stay inside the free email plan. Try again tomorrow." : explainFailure(r.failure));
    return false;
  }, []);
  const problems = rules.map((r) => placeProblem(r.place));
  const setRule = (i: number, patch: Partial<AlertRule>) => setRules((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addRule = () => setRules((rs) => (rs.length < MAX_RULES ? [...rs, BLANK_RULE] : rs));
  const removeRule = (i: number) => setRules((rs) => rs.filter((_, j) => j !== i));
  const save = async (): Promise<boolean> => {
    if (problems.some(Boolean)) { setError("Fix the place in each alert first."); return false; }
    return run("Alerts saved.", () => saveRules(rules.map((r) => ({ ...r, place: r.place.trim().toLowerCase() || "any" }))));
  };
  const confirm = async () => { if (await save()) await run("Check your inbox: we sent a confirmation link. Nothing is sent until you click it.", sendConfirm); };
  const stop = () => run("Alerts stopped. No more emails.", stopAlerts);
  const remove = async () => {
    setBusy(true); setError("");
    const r = await deleteAlerts();
    setBusy(false);
    if (r.ok) { setRules([BLANK_RULE]); setSettings((s) => (s ? { ...s, status: "off", rules: [], confirmedAt: null } : s)); setNotice("Your alerts and their history were deleted."); }
    else setError(explainFailure(r.failure));
  };
  return { res, settings, rules, problems, setRule, addRule, removeRule, save, confirm, stop, remove, busy, notice, error, adultNeeded, setAdultNeeded };
}

export type TokenPhase = "working" | "done" | "notfound" | "missing" | "error" | "ask";

/** The confirm and unsubscribe pages: read the token from the URL fragment, drop it from the address bar, then act (confirm at once, unsubscribe on one tap). */
export function useAlertToken(action: "confirm" | "unsubscribe") {
  const [phase, setPhase] = useState<TokenPhase>("working");
  const [token, setToken] = useState("");
  const go = useCallback(async (t: string) => {
    setPhase("working");
    const r = action === "confirm" ? await confirmToken(t) : await unsubscribeToken(t);
    setPhase(r.ok ? "done" : r.failure.kind === "unavailable" ? "notfound" : "error");
  }, [action]);
  useEffect(() => {
    const m = /(?:^#|&)t=([A-Za-z0-9_-]{32})(?:&|$)/.exec(window.location.hash);
    if (!m) { setPhase("missing"); return; }
    try { window.history.replaceState(null, "", window.location.pathname); } catch { /* keep going */ }
    setToken(m[1]!);
    if (action === "confirm") void go(m[1]!); else setPhase("ask");
  }, [action, go]);
  return { phase, submit: () => void go(token) };
}
