"use client";

import { useId } from "react";
import { chosenOrgId, orgChoices } from "@/lib/org";
import { useOrg } from "./OrgContext";

/** Options for the picker, or an empty list (picker hidden) for anyone without a club. */
export function useOrgChoices(defaultLabel: string) {
  const { ctx } = useOrg();
  return orgChoices(ctx, defaultLabel);
}

/** "Where does this event live?" A plain select, drawn only for someone who belongs to a club and has a real choice. `value` "" means send nothing. */
export default function OrgPicker({ value, onChange, defaultLabel, hint, disabled }: { value: string; onChange: (v: string) => void; defaultLabel: string; hint: string; disabled?: boolean }) {
  const options = useOrgChoices(defaultLabel);
  const id = useId();
  if (options.length === 0) return null;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-zinc-200">Which club is it for?</label>
      <select id={id} className="field mt-1 w-full" value={chosenOrgId(value, options) ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <p className="mt-1 text-xs text-zinc-400">{hint}</p>
    </div>
  );
}

export { chosenOrgId };
