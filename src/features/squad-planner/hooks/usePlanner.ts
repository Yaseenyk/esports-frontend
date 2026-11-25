"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { sendEvent } from "@/lib/track";
import { explainFailure } from "@/features/shared/failure";
import { DEFAULT_TZ, bestWindows, buildSlots, nameProblem, randomKey, shareLink, todayIn, tokenFromHash, type CreatedPlan, type Plan } from "@/features/squad-planner/domain";
import { createPlan, deletePlan, forgetLocal, localFor, openPlan, removeVote, saveLocal, sendVote } from "@/features/squad-planner/services/planner.api";

export interface CreateForm { game: string; title: string; tz: string; firstDay: string; days: string; fromHour: string; toHour: string; slotMinutes: "30" | "60" }

/** The captain's form: days, hours and zone -> slots -> a plan and its share link. */
export function useCreatePlan() {
  const [form, setForm] = useState<CreateForm>({ game: "bgmi", title: "", tz: DEFAULT_TZ, firstDay: "", days: "3", fromHour: "20", toHour: "23", slotMinutes: "60" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [created, setCreated] = useState<(CreatedPlan & { link: string }) | null>(null);
  useEffect(() => { setForm((f) => (f.firstDay ? f : { ...f, firstDay: todayIn(f.tz) })); }, []);
  const set = <K extends keyof CreateForm>(k: K, v: CreateForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const grid = useMemo(() => (form.firstDay ? buildSlots({ firstDay: form.firstDay, days: Number(form.days), fromHour: Number(form.fromHour), toHour: Number(form.toHour), slotMinutes: form.slotMinutes === "30" ? 30 : 60, tz: form.tz }) : null), [form]);
  const titleProblem = form.title.trim() && nameProblem(form.title.slice(0, 60)) ? "Plain words only: no links, phone numbers or @handles." : form.title.length > 60 ? "At most 60 characters." : "";
  const submit = async () => {
    if (!grid || !grid.ok || titleProblem || busy) { setError(grid && !grid.ok ? grid.problem : titleProblem); return; }
    setBusy(true); setError("");
    const r = await createPlan({ game: form.game, title: form.title.trim(), tz: form.tz, slotMinutes: Number(form.slotMinutes), slots: grid.slots });
    setBusy(false);
    if (r.ok && r.data) {
      saveLocal(r.data.token, { captainKey: r.data.captainKey });
      setCreated({ ...r.data, link: shareLink(window.location.origin, r.data.token) });
      sendEvent("tool_complete", "scrim-time-planner");
    } else if (!r.ok && r.failure.kind === "unavailable") setUnavailable(true);
    else setError(r.ok ? "The plan could not be made. Try again." : explainFailure(r.failure));
  };
  return { form, set, grid, titleProblem, submit, busy, error, unavailable, created };
}

export type PlanPhase = "loading" | "ready" | "gone" | "error" | "nolink";

/** The shared plan page: read the token from the URL fragment, load, tap free hours, save, and the captain's delete. */
export function usePlan() {
  const [token, setToken] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [phase, setPhase] = useState<PlanPhase>("loading");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [length, setLength] = useState(1);
  const [isCaptain, setIsCaptain] = useState(false);
  const [mineId, setMineId] = useState<string | null>(null);

  const load = useCallback(async (t: string) => {
    setPhase("loading");
    const r = await openPlan(t);
    if (r.ok && r.data) {
      setPlan(r.data); setPhase("ready");
      const local = localFor(t);
      setIsCaptain(!!local?.captainKey);
      if (local?.voteId) {
        const me = r.data.people.find((p) => p.id === local.voteId);
        if (me) { setName(me.name); setPicks(new Set(me.picks)); setMineId(me.id); }
      } else if (local?.name) setName(local.name);
    } else if (!r.ok && r.failure.kind === "unavailable") setPhase("gone");
    else { setPhase("error"); setError(r.ok ? "The plan did not load." : explainFailure(r.failure)); }
  }, []);

  useEffect(() => {
    const t = tokenFromHash(window.location.hash);
    if (!t) { setPhase("nolink"); return; }
    setToken(t); void load(t);
  }, [load]);

  const toggle = (i: number) => { setPicks((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; }); setDirty(true); setNotice(""); };
  const nameError = name ? nameProblem(name) : "";
  const save = async () => {
    if (!token || busy) return;
    const p = nameProblem(name);
    if (p) { setError(p); return; }
    setBusy(true); setError("");
    const local = localFor(token);
    const editKey = local?.editKey ?? randomKey();
    const r = await sendVote(token, editKey, name.trim(), [...picks].sort((a, b) => a - b));
    setBusy(false);
    if (r.ok && r.data) {
      const me = r.data.mine ?? null;
      saveLocal(token, { editKey, name: name.trim(), ...(me ? { voteId: me } : {}) });
      if (me) setMineId(me);
      setPlan(r.data); setDirty(false); setNotice("Saved. Your squad sees your hours now.");
    } else if (!r.ok) setError(r.failure.code === "plan_full" ? "This plan already has 20 people." : explainFailure(r.failure));
  };
  const remove = async () => {
    const local = token ? localFor(token) : null;
    if (!token || !local?.editKey || busy) return;
    setBusy(true);
    const r = await removeVote(token, local.editKey);
    setBusy(false);
    if (r.ok && r.data) { saveLocal(token, { voteId: undefined }); setMineId(null); setPicks(new Set()); setPlan(r.data); setNotice("Your answers were removed."); }
    else if (!r.ok) setError(explainFailure(r.failure));
  };
  const destroy = async () => {
    const local = token ? localFor(token) : null;
    if (!token || !local?.captainKey || busy) return false;
    setBusy(true);
    const r = await deletePlan(token, local.captainKey);
    setBusy(false);
    if (r.ok) { forgetLocal(token); setPlan(null); setPhase("gone"); setNotice("The plan and everyone's answers were deleted."); return true; }
    setError(explainFailure(r.failure));
    return false;
  };
  const windows = useMemo(() => (plan ? bestWindows(plan, length) : []), [plan, length]);
  return { token, plan, phase, error, name, setName, nameError, picks, toggle, dirty, save, remove, destroy, busy, notice, isCaptain, hasMine: !!mineId, length, setLength, windows, reload: () => token && load(token) };
}
