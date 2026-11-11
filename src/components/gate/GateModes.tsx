"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { hasBackend } from "@/lib/api";
import { StepSkeleton } from "@/components/skeleton/Scenes";
import CheckIn from "./CheckIn";

// The online gate loads only when someone chooses it.
const LiveGate = dynamic(() => import("@/components/cloud/LiveGate"), { loading: () => <StepSkeleton kind="people" /> });

export default function GateModes() {
  const [mode, setMode] = useState<"offline" | "live">("offline");
  return (
    <>
      {hasBackend && (
        <div className="mt-6 flex gap-2" role="tablist" aria-label="Check-in mode">
          <button type="button" role="tab" aria-selected={mode === "offline"} onClick={() => setMode("offline")} className={`chip ${mode === "offline" ? "!border-cyan !text-cyan" : ""}`}>Offline pack</button>
          <button type="button" role="tab" aria-selected={mode === "live"} onClick={() => setMode("live")} onPointerEnter={() => void import("@/components/cloud/LiveGate")} className={`chip ${mode === "live" ? "!border-cyan !text-cyan" : ""}`}>Live (online, several doors)</button>
        </div>
      )}
      {hasBackend && <p className="mt-3 max-w-2xl text-sm text-zinc-300">{mode === "offline" ? "Offline pack: works with no internet. You load a file made on the Print step of the ID card maker. Best for one door." : "Live: every phone shares one list over the internet, so a pass cannot be used at two doors. You need a door code from the organiser."}</p>}
      {mode === "offline" ? <CheckIn /> : <LiveGate />}
    </>
  );
}
