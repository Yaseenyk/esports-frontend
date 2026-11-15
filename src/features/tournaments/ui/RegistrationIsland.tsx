"use client";

import { useLiveRegistration } from "@/features/tournaments/hooks/useLiveRegistration";
import { RegistrationPanel } from "@/features/tournaments/ui/TournamentParts";

/** The one client island on a tournament page: the registration box with live numbers. Everything else is static HTML. */
export default function RegistrationIsland({ slug, open, registered, spotsLeft, status }: { slug: string; open: boolean; registered: number; spotsLeft: number | null; status: string }) {
  const s = useLiveRegistration(slug, { open, registered, spotsLeft, status });
  return <RegistrationPanel open={s.open} registered={s.registered} spotsLeft={s.spotsLeft} status={s.status} live={s.live} />;
}
