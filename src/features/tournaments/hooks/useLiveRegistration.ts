"use client";

import { useEffect, useState } from "react";
import { fetchLive } from "@/features/tournaments/services/tournaments.api";

export interface RegState { open: boolean; registered: number; spotsLeft: number | null; status: string; live: boolean }

/** Starts from the numbers the page was built with and replaces them with the live ones when the endpoint answers. Any failure keeps the built numbers. */
export function useLiveRegistration(slug: string, initial: Omit<RegState, "live">): RegState {
  const [state, setState] = useState<RegState>({ ...initial, live: false });
  useEffect(() => {
    let alive = true;
    fetchLive(slug).then((r) => {
      if (!alive || !r.ok || !r.data) return;
      setState({ open: r.data.open, registered: r.data.registered, spotsLeft: r.data.spotsLeft, status: r.data.status, live: true });
    });
    return () => { alive = false; };
  }, [slug]);
  return state;
}
