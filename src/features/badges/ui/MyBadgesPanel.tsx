"use client";

import { explainFailure } from "@/features/shared/failure";
import { ErrorState } from "@/features/shared/ui/States";
import { box, h3, helper } from "@/features/shared/ui/styles";
import { BADGE_NOTE } from "@/features/badges/domain";
import { useMyBadges } from "@/features/badges/hooks/useBadges";

/**
 * The owner's badges: every badge with its rule, earned or still to earn, and a show/hide switch for each. Renders nothing while the flag is off.
 * The whole section can also be switched off with the "Badges" field switch above.
 */
export function MyBadgesPanel() {
  const b = useMyBadges();
  if (b.res.phase === "unavailable" || b.res.phase === "signin" || b.res.phase === "loading") return null;
  if (b.res.phase === "error") return <ErrorState message={explainFailure(b.res.failure)} onRetry={b.res.reload} />;
  const d = b.data;
  if (!d) return null;
  const earned = d.items.filter((x) => x.earned);
  const next = d.items.filter((x) => !x.earned);
  return (
    <section aria-labelledby="mb-h" className={`${box} space-y-4`}>
      <h3 id="mb-h" className={h3}>Badges</h3>
      <p className="text-sm text-zinc-300">{BADGE_NOTE}</p>
      {d.sectionHidden && <p role="status" className="text-sm text-warning"><span aria-hidden="true">! </span>The Badges field is switched off, so none show on your page.</p>}
      {b.error && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{b.error}</p>}
      {earned.length === 0 ? <p className="text-zinc-300">No badges yet. Play a tournament or a scrim on Esports Hub to earn your first.</p> : (
        <ul className="space-y-2">
          {earned.map((x) => (
            <li key={x.id}>
              <label className="flex min-h-11 items-start gap-3 rounded-lg border border-white/10 px-3 py-2 text-zinc-100">
                <input type="checkbox" checked={!x.hidden} disabled={b.busy !== ""} onChange={() => void b.toggle(x.id, !x.hidden)} className="mt-1 h-5 w-5 accent-cyan-400" />
                <span><span className="font-medium">{x.title}</span> <span className="text-sm text-zinc-400">{x.hidden ? "(hidden)" : "(shown on your page)"}</span><span className="block text-sm text-zinc-300">{x.rule}</span></span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {next.length > 0 && (
        <details className="text-sm">
          <summary className="min-h-11 cursor-pointer py-2 text-zinc-100">Badges still to earn ({next.length})</summary>
          <ul className="mt-2 space-y-2">{next.map((x) => <li key={x.id} className="text-zinc-300"><span className="text-zinc-100">{x.title}</span>: {x.rule}</li>)}</ul>
        </details>
      )}
      <p className={helper}>Hidden badges never leave the server on your public page.</p>
    </section>
  );
}
