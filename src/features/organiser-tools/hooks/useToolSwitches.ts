"use client";

import { useEffect, useState } from "react";
import { fetchToolSwitches, type ToolSwitches } from "@/features/organiser-tools/services/tools.api";

/** The switches for one event, or null while loading, when every flag is off (404), or on any failure: nothing is shown unless the API says so. */
export function useToolSwitches(eventId: string): ToolSwitches | null {
  const [s, setS] = useState<ToolSwitches | null>(null);
  useEffect(() => {
    let live = true;
    setS(null);
    fetchToolSwitches(eventId).then((r) => { if (live && r.ok) setS(r.data); });
    return () => { live = false; };
  }, [eventId]);
  return s;
}
