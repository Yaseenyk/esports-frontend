"use client";

import Link from "next/link";
import { useToolSwitches } from "@/features/organiser-tools/hooks/useToolSwitches";
import { btnSecondary, h3 } from "@/features/shared/ui/styles";

/** Links to the organiser tools that are switched on for this event. Renders NOTHING while the flags are off or the probe fails. */
export default function MatchToolsLinks({ eventId }: { eventId: string }) {
  const s = useToolSwitches(eventId);
  if (!s || !(s.rooms || s.recaps || s.screenshots)) return null;
  const id = encodeURIComponent(eventId);
  return (
    <section aria-labelledby="match-tools-h" className="space-y-3 border-t border-white/10 pt-4" data-testid="match-tools">
      <h3 id="match-tools-h" className={h3}>Match day tools</h3>
      <div className="flex flex-wrap gap-2">
        {s.rooms && <Link href={`/app/rooms/manage/?id=${id}`} className={btnSecondary}>Match rooms</Link>}
        {s.screenshots && s.canEdit && <Link href={`/app/screenshot-results/?id=${id}`} className={btnSecondary}>Results from a screenshot</Link>}
        {s.recaps && <Link href={`/app/recap/?id=${id}`} className={btnSecondary}>Match recap</Link>}
      </div>
    </section>
  );
}
