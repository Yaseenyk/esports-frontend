"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Sk } from "@/components/skeleton/Sk";
import { useOrg } from "./OrgContext";
import { CAP, can, personalOnly, type ContextOrg } from "@/lib/org";

export const Note = ({ msg, err }: { msg?: string; err?: string }) => (
  <div aria-live="polite">{msg && <p role="status" className="text-sm text-emerald-300">{msg}</p>}{err && <p role="alert" className="text-sm text-red-300">{err}</p>}</div>
);

export function PageHead({ title, intro, back }: { title: string; intro?: string; back?: boolean }) {
  return (
    <div>
      {back && <Link href="/app/org/" className="inline-flex min-h-11 items-center text-sm text-cyan hover:underline">← Your club</Link>}
      <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</h1>
      {intro && <p className="mt-1 text-sm text-zinc-300">{intro}</p>}
    </div>
  );
}

export const ListSkeleton = ({ n = 3 }: { n?: number }) => (
  <div role="status" aria-busy="true" className="space-y-2"><span className="sr-only">Loading</span>{Array.from({ length: n }, (_, i) => <Sk key={i} i={i} className="!h-16 !rounded-xl" />)}</div>
);

/**
 * Decides what a club screen shows: a skeleton while the shell's context loads, a plain note when clubs are not switched on (or the call
 * failed), the "make it a club" offer for someone with only their own space, and otherwise the screen. `need="admin"` also asks for the
 * people-management capability. The server checks every call again; this only decides what to draw.
 */
export function ClubGate({ need, children }: { need?: "admin" | "audit"; children: (org: ContextOrg) => React.ReactNode }) {
  const s = useOrg();
  if (s.status === "loading") return <ListSkeleton />;
  if (!s.teamOrgs) {
    return (
      <div className="card space-y-3">
        <p className="text-zinc-200">{s.status === "failed" ? "Could not load your account details. Check your connection and try again." : "Clubs are not available yet."}</p>
        <div className="flex flex-wrap gap-2">{s.status === "failed" && <button type="button" className="btn !min-h-11 px-4 text-sm" onClick={s.refresh}>Try again</button>}<Link href="/app/" className="btn-ghost !min-h-11 px-4 text-sm">Back to Home</Link></div>
      </div>
    );
  }
  if (!s.org) {
    return personalOnly(s.ctx) ? (
      <div className="card space-y-3">
        <p className="text-zinc-200">You do not have a club yet.</p>
        <p className="text-sm text-zinc-300">Make your events a club to share them with the people who help you run them.</p>
        <Link href="/app/org/convert/" className="btn !min-h-11 px-4 text-sm">Make it a club</Link>
      </div>
    ) : (
      <div className="card space-y-3"><p className="text-zinc-200">You do not belong to a club.</p><Link href="/app/" className="btn-ghost !min-h-11 px-4 text-sm">Back to Home</Link></div>
    );
  }
  const cap = need === "admin" ? CAP.people : need === "audit" ? CAP.audit : null;
  if (cap && !can(s.org, cap)) {
    return <div className="card space-y-3"><p className="text-zinc-200">Only club admins can see this page.</p><Link href="/app/org/" className="btn-ghost !min-h-11 px-4 text-sm">Back to your club</Link></div>;
  }
  return <>{children(s.org)}</>;
}

/** A banner for a paused club: reads still work, changes do not. */
export const SuspendedBanner = ({ status }: { status: string }) => status === "suspended"
  ? <p role="status" className="rounded-xl border border-amber-500/30 bg-[#0a0b0d] p-3 text-sm text-amber-100">This club is paused. You can look at everything, but changes are switched off for now.</p> : null;

/**
 * Asks before something that cannot be undone. Inline, not a pop-up, so it works with a phone keyboard and a screen reader:
 * focus moves to the question, Escape cancels, and both buttons are 44 px tall.
 */
export function ConfirmBar({ question, yes, busy, onYes, onNo, danger }: { question: string; yes: string; busy?: boolean; onYes: () => void; onNo: () => void; danger?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.focus(); }, []);
  return (
    <div ref={box} tabIndex={-1} role="alertdialog" aria-label="Confirm" onKeyDown={(e) => { if (e.key === "Escape" && !busy) onNo(); }} className="mt-2 space-y-2 rounded-xl border border-amber-500/40 bg-[#0a0b0d] p-3 outline-none focus-visible:ring-2 focus-visible:ring-cyan">
      <p className="text-sm text-zinc-100">{question}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={danger ? "btn-ghost !min-h-11 px-4 text-sm !border-red-400/60 text-red-200" : "btn !min-h-11 px-4 text-sm"} disabled={busy} onClick={onYes}>{busy ? "Working…" : yes}</button>
        <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" disabled={busy} onClick={onNo}>Cancel</button>
      </div>
    </div>
  );
}

/** Copies text, and says plainly when the browser will not let it (the text stays selectable). */
export function CopyButton({ text, label = "Copy link" }: { text: string; label?: string }) {
  const [state, setState] = useState<"" | "ok" | "fail">("");
  return (
    <>
      <button type="button" className="btn !min-h-11 px-4 text-sm" onClick={() => {
        if (!navigator.clipboard) { setState("fail"); return; }
        navigator.clipboard.writeText(text).then(() => setState("ok"), () => setState("fail"));
      }}>{state === "ok" ? "Copied" : label}</button>
      <span aria-live="polite" className="text-sm">{state === "ok" && <span className="text-emerald-300">Copied to the clipboard.</span>}{state === "fail" && <span className="text-red-300">Could not copy. Select the link above and copy it by hand.</span>}</span>
    </>
  );
}
