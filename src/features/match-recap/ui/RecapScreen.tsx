"use client";

import Link from "next/link";
import { explainFailure } from "@/features/shared/failure";
import { SelectInput, TextArea } from "@/features/shared/ui/Fields";
import { EmptyState, ErrorState, NotAvailable, SignInPrompt, SkeletonRows } from "@/features/shared/ui/States";
import { box, btnPrimary, btnSecondary, h1, h2, helper, link, section } from "@/features/shared/ui/styles";
import { targetKey, useRecap } from "@/features/match-recap/hooks/useRecap";

const WHAT = "The match recap";

export function RecapScreen() {
  const v = useRecap();
  const { res } = v;
  const ev = encodeURIComponent(v.eventId ?? "");
  return (
    <div className="mx-auto max-w-3xl space-y-8" data-testid="recap-screen">
      <header className="space-y-2">
        <h1 className={h1}>Match recap</h1>
        {v.facts && <p className="text-zinc-300"><span key={v.facts.event.name}>{v.facts.event.name}</span></p>}
        <p className="text-zinc-300">A short recap written from the results you entered, with a picture to share. You can change the words before you share them.</p>
      </header>
      {v.eventId === "" && <EmptyState title="Open this from an event" body="A recap belongs to one event. Open the event first, then choose Match recap." action={<Link href="/app/events/" className={btnSecondary}>My events</Link>} />}
      {v.eventId !== "" && res.phase === "unavailable" && <NotAvailable what={WHAT} />}
      {res.phase === "signin" && <SignInPrompt what="Sign in to make a recap." next="/app/events/" />}
      {res.phase === "loading" && (res.showSkeleton ? <SkeletonRows n={2} label="Loading results" /> : <p className="sr-only">Loading results</p>)}
      {res.phase === "error" && <ErrorState message={explainFailure(res.failure)} onRetry={res.reload} />}
      {res.phase === "ready" && v.targets.length === 0 && (
        <EmptyState title="No results yet" body="Enter results first (battle royale results, or scores in the match scorer). The recap is written only from results you entered." action={<Link href={`/app/screenshot-results/?id=${ev}`} className={btnSecondary}>Enter results</Link>} />
      )}
      {res.phase === "ready" && v.recap && v.target && (
        <>
          <section className={`${box} space-y-4`} aria-labelledby="pick-h">
            <h2 id="pick-h" className="sr-only">Pick a match</h2>
            <SelectInput id="recap-match" label="Match" value={targetKey(v.target)} onChange={v.setChosen} options={v.targets.map((t) => ({ value: targetKey(t.target), label: t.label }))} />
            {!v.facts?.scoring && <p className={helper}>Points and standings are left out because this event has no points rules yet. Save them in the season leaderboard tool to add them.</p>}
          </section>
          <section className={`${section} space-y-3`} aria-labelledby="text-h">
            <h2 id="text-h" className={h2}>Recap text</h2>
            <TextArea id="recap-text" label="Edit before sharing" value={v.text} onChange={v.setText} rows={9} max={2000} help="Written from your entered results only. Check it before you share it." />
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btnSecondary} onClick={() => void v.copy()}>Copy text</button>
              <button type="button" className={btnSecondary} onClick={v.reset} disabled={!v.edited}>Back to the original text</button>
            </div>
          </section>
          <section className={`${section} space-y-3`} aria-labelledby="pic-h">
            <h2 id="pic-h" className={h2}>Picture</h2>
            <p className="text-sm text-zinc-300">The picture shows <span key={v.recap.payload.v === "table" ? v.recap.payload.d.subtitle ?? "" : ""}>{v.recap.payload.v === "table" ? (v.recap.payload.d.subtitle ?? "").toLowerCase() : ""}</span> as entered, with the link <span key={v.recap.footer} className="text-zinc-100">{v.recap.footer.split(" · ").pop()}</span>.</p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={btnPrimary} disabled={v.busy} onClick={() => void v.share()}><span key={v.busy ? "b" : "i"}>{v.busy ? "Making the picture" : "Share recap"}</span></button>
              <div role="group" aria-label="Picture shape" className="flex flex-wrap gap-2">
                <button type="button" className="chip" aria-pressed={v.format === "square"} onClick={() => v.setFormat("square")}>Square post</button>
                <button type="button" className="chip" aria-pressed={v.format === "story"} onClick={() => v.setFormat("story")}>Story</button>
              </div>
            </div>
            <p role="status" aria-live="polite" className={`min-h-5 text-sm ${v.msg?.ok === false ? "text-danger" : "text-success"}`}>{v.msg && <span key={v.msg.text}>{v.msg.text}</span>}</p>
          </section>
          <p className="text-sm text-zinc-400"><Link href="/app/events/" className={link}>Back to my events</Link></p>
        </>
      )}
    </div>
  );
}
