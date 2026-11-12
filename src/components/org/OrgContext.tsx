"use client";

import { createContext, useContext, useMemo } from "react";
import { useAppContext, type AppContext } from "@/lib/api/context";
import { useSession } from "@/components/cloud/useSession";
import { teamOrgOf, type ContextOrg } from "@/lib/org";

/**
 * What the shell knows about clubs. `status` is "loading" until /me/context answers; the app shows today's screens in the meantime
 * and also when the call fails or the flag is off. Nothing here ever blocks the UI.
 */
export interface OrgState { status: "loading" | "ready" | "failed"; ctx: AppContext | undefined; teamOrgs: boolean; org: ContextOrg | null; refresh: () => void }

const OFF: OrgState = { status: "ready", ctx: undefined, teamOrgs: false, org: null, refresh: () => undefined };
const Ctx = createContext<OrgState>(OFF);

/** Loads /me/context once after sign-in (cached for 5 minutes) and shares it. Keyed by the sign-in so another person never sees the previous one's answer. */
export function OrgContextProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  return <Inner key={session?.token ?? "out"} signedIn={!!session}>{children}</Inner>;
}

function Inner({ signedIn, children }: { signedIn: boolean; children: React.ReactNode }) {
  const q = useAppContext(signedIn);
  const value = useMemo<OrgState>(() => {
    const ctx = signedIn ? q.data : undefined;
    return {
      status: !signedIn ? "ready" : ctx ? "ready" : q.error ? "failed" : "loading",
      ctx, teamOrgs: !!ctx && ctx.features.teamOrgs, org: teamOrgOf(ctx), refresh: q.refetch,
    };
  }, [signedIn, q.data, q.error, q.refetch]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** The club state. Outside the provider (public pages, tests) it reads as "no clubs": the old behaviour. */
export const useOrg = (): OrgState => useContext(Ctx);
