"use client";

import { useSyncExternalStore } from "react";
import { sessionStore } from "@/lib/api/cloud";

/** The signed-in person, or null. Updates on sign-in and sign-out anywhere in the app. */
export function useSession() {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get, () => null);
}
