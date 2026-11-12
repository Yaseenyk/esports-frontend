"use client";

import { useEffect } from "react";
import { useSession } from "@/components/cloud/useSession";
import { useAppContext } from "@/lib/api/context";
import AcceptInvitation from "./AcceptInvitation";

/**
 * Shown on /join/ when the token is not a player invite. A club or event invitation uses the same address.
 *  - signed in and clubs are on: this takes over the page (`onHandled(true)` hides the old "invite no longer active" box);
 *  - signed out: the old message stays, and a closed section below offers to sign in and accept;
 *  - signed in and clubs are off, or /me/context fails: nothing changes from before.
 */
export default function JoinOrgFallback({ token, onHandled }: { token: string; onHandled: (handled: boolean) => void }) {
  const session = useSession();
  const ctx = useAppContext(!!session);
  const takeOver = !!session && !!ctx.data?.features.teamOrgs;
  useEffect(() => { onHandled(takeOver); return () => onHandled(false); }, [takeOver, onHandled]);
  if (!session) {
    return <details className="mb-4 rounded-xl border border-white/10 p-3"><summary className="flex min-h-11 cursor-pointer items-center text-sm text-cyan outline-none focus-visible:ring-2 focus-visible:ring-cyan">Was this link an invitation to a club or an event?</summary><div className="pt-3"><AcceptInvitation token={token} embedded /></div></details>;
  }
  return takeOver ? <AcceptInvitation token={token} /> : null;
}
