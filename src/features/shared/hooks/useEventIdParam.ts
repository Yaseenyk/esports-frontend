"use client";

import { useEffect, useState } from "react";
import type { V3Result } from "@/features/shared/failure";

/** The event id from `?id=` (ids are not known at build time). null while the address is still being read, "" when there is none. */
export function useEventIdParam(): string | null {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => { setId((new URLSearchParams(window.location.search).get("id") ?? "").slice(0, 80)); }, []);
  return id;
}

/** Waits while the id is still being read (null), answers "unavailable" when there is none (""), otherwise loads. */
export function eventLoad<T>(eventId: string | null, load: (id: string) => Promise<V3Result<T>>): Promise<V3Result<T>> {
  if (eventId === null) return new Promise(() => undefined);
  if (eventId === "") return Promise.resolve({ ok: false, failure: { kind: "unavailable", status: 404 } });
  return load(eventId);
}
