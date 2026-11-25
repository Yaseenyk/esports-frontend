import { StatusBadge } from "@/features/shared/ui/States";
import { h2, helper, section } from "@/features/shared/ui/styles";
import { badgeDef, type PublicBadge } from "@/features/badges/domain";

/** Badges on a shared player page: earned and not hidden by the owner (the API already removed the rest). Each shows its rule. Presentation only. */
export function BadgeList({ badges }: { badges: PublicBadge[] }) {
  if (badges.length === 0) return null;
  return (
    <section className={section} aria-labelledby="badges-h">
      <h2 id="badges-h" className={`${h2} flex flex-wrap items-center gap-3`}>Badges <StatusBadge label="Recorded by Esports Hub" tone="success" /></h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {badges.map((b) => (
          <li key={b.id} className="rounded-xl border border-white/10 bg-surface p-4">
            <p className="font-medium text-zinc-100"><span aria-hidden="true" className="text-purple">◆ </span>{b.title}</p>
            <p className="mt-1 text-sm text-zinc-300">{badgeDef(b.id)?.rule}</p>
          </li>
        ))}
      </ul>
      <p className={helper}>Earned from records on Esports Hub (results, scrims, events). The player cannot type or award these.</p>
    </section>
  );
}
