"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ToolStep from "@/components/tools/ToolStep";
import { orgApi } from "@/lib/api/f-org";
import { CLUB_NAME_MAX, clubNameProblem, orgError, personalOnly, type ConvertPreview } from "@/lib/org";
import { ListSkeleton, Note, PageHead } from "./ui";
import { useOrg } from "./OrgContext";

/** "Make it a club": name it, read exactly what happens, confirm. The sentence comes from the server and is shown word for word. */
export default function ConvertScreen() {
  const s = useOrg();
  const router = useRouter();
  const [preview, setPreview] = useState<ConvertPreview | null>(null), [perr, setPerr] = useState(""), [loading, setLoading] = useState(false);
  const [name, setName] = useState(""), [step, setStep] = useState<1 | 2>(1);
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [done, setDone] = useState<{ name: string; eventCount: number } | null>(null);
  const sending = useRef(false);
  const offer = s.teamOrgs && personalOnly(s.ctx);

  useEffect(() => {
    if (!offer) return;
    let live = true;
    setLoading(true); setPerr("");
    orgApi.convertPreview().then((p) => { if (live) setPreview(p); }).catch((e) => { if (live) setPerr(orgError(e, "convert")); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [offer]);

  if (s.status === "loading") return <ListSkeleton />;
  if (done) {
    return (
      <div className="space-y-4">
        <PageHead title="Your club is ready" />
        <div role="status" className="space-y-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-5">
          <p className="font-display text-xl font-bold text-white">{done.name}</p>
          <p className="text-sm text-emerald-100">Your {done.eventCount} {done.eventCount === 1 ? "event is" : "events are"} now part of the club. Links, QR codes and passes did not change.</p>
        </div>
        <p className="text-sm text-zinc-300">Next: invite the people who help you run events.</p>
        <div className="flex flex-wrap gap-2"><Link href="/app/org/invite/" className="btn !min-h-11 px-4 text-sm">Invite someone</Link><Link href="/app/org/" className="btn-ghost !min-h-11 px-4 text-sm">Go to your club</Link></div>
      </div>
    );
  }
  if (!s.teamOrgs) {
    return <div className="card space-y-3"><p className="text-zinc-200">{s.status === "failed" ? "Could not load your account details. Check your connection and try again." : "Clubs are not available yet."}</p><Link href="/app/" className="btn-ghost !min-h-11 px-4 text-sm">Back to Home</Link></div>;
  }
  if (s.org) return <div className="card space-y-3"><p className="text-zinc-200">You already have a club: {s.org.name}.</p><Link href="/app/org/" className="btn !min-h-11 px-4 text-sm">Open your club</Link></div>;
  if (!offer) return <div className="card space-y-3"><p className="text-zinc-200">There is nothing to turn into a club here.</p><Link href="/app/" className="btn-ghost !min-h-11 px-4 text-sm">Back to Home</Link></div>;

  const problem = clubNameProblem(name);
  const create = async () => {
    if (sending.current || problem) return;
    sending.current = true; setBusy(true); setErr("");
    try { const r = await orgApi.convert(name.trim()); setDone({ name: r.name, eventCount: r.eventCount }); s.refresh(); }
    catch (x) { const code = (x as { detail?: { code?: string } }).detail?.code; setErr(orgError(x, "convert")); if (code === "already_club") { s.refresh(); router.replace("/app/org/"); } }
    finally { sending.current = false; setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <PageHead title="Make it a club" intro="A club lets you share your events with the people who help run them. It takes two steps." />
      {loading && <ListSkeleton n={2} />}
      {perr && <div className="space-y-2"><p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">{perr}</p><Link href="/app/" className="btn-ghost !min-h-11 px-4 text-sm">Back to Home</Link></div>}
      {preview && (
        <>
          <ToolStep n={1} title="Name your club" done={step === 2} hint="Use the name of your club, college or cafe. You can show it to the people you invite.">
            {step === 1 ? (
              <form onSubmit={(e) => { e.preventDefault(); if (!problem) setStep(2); }} className="space-y-3">
                <label className="block text-sm text-zinc-200">Club, college or cafe name<input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} maxLength={CLUB_NAME_MAX} autoComplete="organization" required aria-invalid={name.length > 0 && !!problem || undefined} /></label>
                <button className="btn !min-h-11 px-5 text-sm" disabled={!!problem}>Next: check what happens</button>
              </form>
            ) : <p className="text-sm text-zinc-200">Club name: <strong className="text-white">{name.trim()}</strong> <button type="button" className="ml-2 inline-flex min-h-11 items-center text-cyan underline" onClick={() => setStep(1)}>Change</button></p>}
          </ToolStep>
          {step === 2 && (
            <ToolStep n={2} title="Check and confirm" hint="Read this once before you press the button.">
              <p data-testid="convert-sentence" className="rounded-xl border border-cyan/40 bg-[#0c1d27] p-4 text-base text-white">{preview.sentence}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn !min-h-11 px-5 text-sm" disabled={busy} onClick={create}>{busy ? "Creating…" : preview.primaryButton}</button>
                <Link href="/app/" className="btn-ghost !min-h-11 px-5 text-sm">{preview.secondaryButton}</Link>
              </div>
              <Note err={err} />
            </ToolStep>
          )}
        </>
      )}
    </div>
  );
}
