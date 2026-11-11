"use client";

import { useMemo, useState } from "react";
import type { PanelProps } from "@/components/app/panels";
import ToolStep from "@/components/tools/ToolStep";
import { useMatches } from "@/lib/api/matches";
import { results } from "@/lib/api/f-results";
import { explain } from "@/lib/api/cloud";
import LinksStep from "./LinksStep";
import ReviewStep from "./ReviewStep";

/** Settings (step 3) live under "More options": one switch, off by default. */
function Settings({ eventId, canEdit }: { eventId: string; canEdit: boolean }) {
  const [auto, setAuto] = useState<boolean | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => { try { const r = await results.submissions(eventId, "pending"); setAuto(r.autoApprove); } catch (e) { setErr(explain(e)); } };
  const toggle = async (v: boolean) => {
    setBusy(true); setErr(""); setMsg("");
    try { const r = await results.setAutoApprove(eventId, v); setAuto(r.autoApprove); setMsg(r.autoApprove ? "On. When both captains send the same score, it is recorded without waiting for you." : "Off. You approve every score yourself."); } catch (e) { setErr(explain(e)); } finally { setBusy(false); }
  };
  return (
    <ToolStep n={3} title="Settings" hint="Optional. You can ignore this and approve every score yourself.">
      <details onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open && auto === null) void load(); }}>
        <summary className="min-h-11 cursor-pointer py-2 font-semibold text-white">More options</summary>
        <div className="space-y-2 pt-2">
          <label className="flex min-h-11 items-start gap-3 text-sm text-zinc-100">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={!!auto} disabled={auto === null || busy || !canEdit} onChange={(e) => void toggle(e.target.checked)} />
            <span>Approve automatically when both captains send the same score<br /><span className="text-zinc-300">If the two scores differ, nothing is recorded and you decide in step 2.</span></span>
          </label>
          <div aria-live="polite">
            {msg && <p role="status" className="text-sm text-emerald-300">{msg}</p>}
            {err && <p role="alert" className="text-sm text-rose-200">{err}</p>}
          </div>
        </div>
      </details>
    </ToolStep>
  );
}

/** Captains send scores with a screenshot, you approve them. Three steps: links, review, settings. */
export default function Panel({ eventId, eventName, role }: PanelProps) {
  const m = useMatches(eventId);
  const [tick, setTick] = useState(0);
  const canEdit = role !== "viewer";
  const teams = useMemo(() => [...new Set(m.matches.flatMap((x) => [x.a, x.b]).map((t) => t.trim()).filter(Boolean))], [m.matches]);
  return (
    <section aria-label="Results from captains" className="space-y-4">
      {!canEdit && <p className="rounded-lg border border-white/15 p-3 text-sm text-zinc-200">You can look at this but not change it. Ask the owner to make you an editor.</p>}
      <LinksStep eventId={eventId} eventName={eventName} teams={teams} canEdit={canEdit} />
      <ReviewStep eventId={eventId} canEdit={canEdit} canSee={canEdit} onChanged={() => { setTick((n) => n + 1); m.refetch(); }} refreshKey={tick} />
      <Settings eventId={eventId} canEdit={canEdit} />
    </section>
  );
}
