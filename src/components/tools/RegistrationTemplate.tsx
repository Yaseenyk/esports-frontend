"use client";

import Link from "next/link";
import { sendEvent } from "@/lib/track";
import { useMemo, useState } from "react";
import { downloadBlob } from "@/lib/idcard/download";
import ToolStep from "./ToolStep";
import { REG_PRESETS as PRESETS, regPreset, registrationText } from "@/lib/regform";
import type { RegPresetId } from "@/lib/regform";

/** A ready-to-paste team registration form: the questions to ask, as plain text for Google Forms, WhatsApp or a printed sheet. */
export default function RegistrationTemplate() {
  const [preset, setPreset] = useState<RegPresetId>("squad");
  const [event, setEvent] = useState("Monsoon Clash Season 2");
  const [copied, setCopied] = useState<"" | "yes" | "no">("");
  const p = regPreset(preset);

  const text = useMemo(() => registrationText(preset, event), [event, preset]);

  return (
    <div className="space-y-5">
      <ToolStep n={1} id="rg-size" title="Pick the team size" done hint="How many players are in one team? The form gets a line for each player, and for substitutes where the game allows them."
        status={`${p.size} player${p.size === 1 ? "" : "s"}${p.subs ? ` + ${p.subs} sub` : ""}`}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-zinc-200">Team size<select className="field mt-1" value={preset} onChange={(e) => setPreset(e.target.value as typeof preset)}>{PRESETS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
          <label className="block text-sm text-zinc-200">Event name<input className="field mt-1" value={event} onChange={(e) => setEvent(e.target.value)} maxLength={80} /></label>
        </div>
        <p className="text-xs text-zinc-400">Most squad modes use 4 players and 5 v 5 games use 5. Always follow the rules of your own event or the game&apos;s tournament rules.</p>
      </ToolStep>

      <ToolStep n={2} id="rg-copy" title="Copy or download the form" done={copied === "yes"} hint="Press Copy, then paste it into Google Forms, WhatsApp or a document. Each numbered line is one question to ask. It works without an account.">
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-white/[0.14] bg-[#0f1013] p-3 text-sm text-zinc-200" tabIndex={0} aria-label="Registration form text">{text}</pre>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn px-4 text-sm" onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied("yes"); sendEvent("tool_complete", "registration"); } catch { setCopied("no"); } setTimeout(() => setCopied(""), 2500); }}>{copied === "yes" ? "Copied" : "Copy the form"}</button>
          <button type="button" className="btn-ghost px-4 text-sm" onClick={() => { downloadBlob(new Blob([text], { type: "text/plain" }), "registration-form.txt"); sendEvent("tool_complete", "registration"); }}>Download as a text file</button>
          <span role="status" aria-live="polite" className={`text-sm ${copied === "yes" ? "text-emerald-300" : "text-amber-200"}`}>{copied === "yes" ? "Copied. Now paste it where you want it." : copied === "no" ? "Your browser did not allow copying. Select the text above and copy it yourself." : ""}</span>
        </div>
      </ToolStep>

      <div className="card space-y-2">
        <h3 className="font-display text-lg font-bold text-white">Want the form to run itself? (optional)</h3>
        <p className="text-sm text-zinc-300">With a free account you get an online registration link instead of a copied form. Captains fill it in on their phone, you approve each team, and approved teams and players land in your roster, ready for ID cards and gate check-in. You can set a team limit and a closing time.</p>
        <Link href="/signup/" className="btn-ghost inline-flex px-4 text-sm">Create a free account</Link>
      </div>
    </div>
  );
}
