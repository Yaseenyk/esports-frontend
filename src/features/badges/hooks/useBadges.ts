"use client";

import { useEffect, useState } from "react";
import { explainFailure } from "@/features/shared/failure";
import { useResource } from "@/features/shared/hooks/useResource";
import { fetchMyBadges, putBadgeHidden } from "@/features/badges/services/badges.api";
import type { OwnBadges } from "@/features/badges/domain";

/** The owner's badges with their show/hide switches. Phase "unavailable" = flag off: the panel renders nothing. */
export function useMyBadges() {
  const res = useResource(fetchMyBadges, []);
  const [data, setData] = useState<OwnBadges | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { if (res.phase === "ready") setData(res.data); }, [res]);
  const toggle = async (id: string, hidden: boolean) => {
    setBusy(id); setError("");
    const r = await putBadgeHidden(id, hidden);
    setBusy("");
    if (r.ok) setData(r.data); else setError(explainFailure(r.failure));
  };
  return { res, data, busy, error, toggle };
}
