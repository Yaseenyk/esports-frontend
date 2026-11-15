"use client";

import { useCallback, useEffect, useState } from "react";
import { confirmAdult, fetchMeStatus, type MeStatus } from "@/features/shared/services/account.api";
import { explainFailure } from "@/features/shared/services/result";

/** The 18+ confirmation: read it once, and confirm it when the person ticks the box. */
export function useAdult(enabled: boolean) {
  const [status, setStatus] = useState<MeStatus | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    fetchMeStatus().then((r) => { if (live && r.ok) setStatus(r.data); });
    return () => { live = false; };
  }, [enabled]);
  const confirm = useCallback(async () => {
    setBusy(true); setError("");
    const r = await confirmAdult();
    setBusy(false);
    if (r.ok) setStatus(r.data); else setError(explainFailure(r.failure));
  }, []);
  return { status, adult: !!status?.adultConfirmedAt, known: status !== null, confirm, busy, error, setStatus };
}
