"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { report, type CaptainMatch, type CaptainView } from "@/lib/api/f-results";
import { createPoller } from "@/lib/api/poller";
import { MAX_NOTE, MAX_SCORE, checkScores, fromSides, outcomeText, reportError, statusLabel, statusText, stepScore, toSides, tokenFromSearch } from "@/lib/results";
import { proofFromFile } from "./proof";
import { takeTokenSearch } from "@/lib/tokenHygiene";

type Load = "loading" | "ready" | "missing" | "error";

const timeText = (iso: string | null) => { if (!iso) return ""; const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : d.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" }); };

function Stepper({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const n = Number(value);
  const set = (v: number) => onChange(String(v));
  const btn = "grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-zinc-600 bg-zinc-900 text-3xl font-bold text-white outline-none hover:border-zinc-400 focus-visible:ring-4 focus-visible:ring-cyan/60 disabled:opacity-40";
  return (
    <div className="space-y-1">
      <label htmlFor={`sc-${label}`} className="block break-words text-base font-semibold text-zinc-100">{label}</label>
      <div className="flex items-center gap-3">
        <button type="button" className={btn} aria-label={`One less for ${label}`} disabled={!(n > 0)} onClick={() => set(stepScore(n, -1))}>-</button>
        <input id={`sc-${label}`} inputMode="numeric" pattern="[0-9]*" maxLength={3} value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))} className="field !h-14 w-24 text-center font-display text-3xl font-bold" />
        <button type="button" className={btn} aria-label={`One more for ${label}`} disabled={n >= MAX_SCORE} onClick={() => set(stepScore(Number.isFinite(n) ? n : 0, 1))}>+</button>
      </div>
    </div>
  );
}

function SubmissionNote({ m }: { m: CaptainMatch }) {
  const s = m.submission;
  if (!s) return null;
  const { mine, theirs } = fromSides(m.side, s.scoreA, s.scoreB);
  const tone = s.status === "approved" ? "border-emerald-400/50 text-emerald-200" : s.status === "rejected" ? "border-rose-400/50 text-rose-200" : "border-cyan/50 text-zinc-100";
  return (
    <div className={`mt-3 rounded-xl border p-3 text-base ${tone}`}>
      <p><strong>{statusLabel(s.status)}</strong>: you sent {mine} to {theirs}{s.hasProof ? " with a screenshot" : ""}.</p>
      <p className="mt-1">{statusText(s.status, s.rejectReason)}</p>
      {m.disputed && s.status === "pending" && <p className="mt-1 text-amber-200">The other team sent a different score. The organiser will check both and decide.</p>}
    </div>
  );
}

/** The page a team captain opens from the link the organiser sent. Phone first, plain words, text only. */
export default function ReportPage() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [data, setData] = useState<CaptainView | null>(null);
  const [load, setLoad] = useState<Load>("loading");
  const [offline, setOffline] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [mine, setMine] = useState("0");
  const [theirs, setTheirs] = useState("0");
  const [note, setNote] = useState("");
  const [proof, setProof] = useState("");
  const [proofBusy, setProofBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState<{ status: "pending" | "approved"; disputed: boolean; matchId: string } | null>(null);
  const poller = useRef<ReturnType<typeof createPoller<CaptainView>> | null>(null);
  const pickedRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { setToken(tokenFromSearch(takeTokenSearch())); }, []);
  useEffect(() => { if (token === null) setLoad("missing"); }, [token]);
  useEffect(() => {
    if (!token) return;
    const p = createPoller<CaptainView>({
      fetch: () => report.get(token),
      onData: (d) => { setData(d); setLoad("ready"); setOffline(false); },
      onError: (e) => { if ((e as { status?: number }).status === 404) { setLoad("missing"); setData(null); } else { setOffline(true); setLoad((c) => (c === "loading" ? "error" : c)); } },
      minMs: 20_000, maxMs: 60_000, staleMs: 15_000,
    });
    poller.current = p;
    const wake = () => { setOffline(!navigator.onLine); p.resume(); };
    document.addEventListener("visibilitychange", wake); window.addEventListener("online", wake); window.addEventListener("offline", wake);
    p.start();
    return () => { p.stop(); poller.current = null; document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); window.removeEventListener("offline", wake); };
  }, [token]);

  const match = data?.matches.find((m) => m.id === picked) ?? null;

  const pick = useCallback((m: CaptainMatch) => {
    setPicked(m.id); setSent(null); setErr(""); setConfirming(false); setProof("");
    const s = m.submission && m.submission.status === "pending" ? fromSides(m.side, m.submission.scoreA, m.submission.scoreB) : { mine: 0, theirs: 0 };
    setMine(String(s.mine)); setTheirs(String(s.theirs)); setNote("");
    setTimeout(() => pickedRef.current?.focus(), 0);
  }, []);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setErr(""); setProofBusy(true);
    try { setProof(await proofFromFile(f)); } catch (e) { setProof(""); setErr(e instanceof Error ? e.message : "That picture could not be used."); } finally { setProofBusy(false); }
  };

  const check = checkScores(mine, theirs);
  const review = () => { if (!check.ok) { setErr(check.message); return; } setErr(""); setConfirming(true); };

  const send = async () => {
    if (!token || !match || !check.ok) return;
    setBusy(true); setErr("");
    try {
      const sides = toSides(match.side, check.a, check.b);
      const r = await report.send(token, match.id, { ...sides, note: note.trim() || undefined, proof: proof || undefined });
      setSent({ status: r.status, disputed: r.disputed, matchId: match.id });
      setConfirming(false); setPicked(null); setProof(""); setNote("");
      poller.current?.nudge();
    } catch (e) {
      const x = e as { status?: number; serverError?: string };
      setConfirming(false);
      setErr(reportError(x.status, x.serverError));
    } finally { setBusy(false); }
  };

  const shell = (children: React.ReactNode) => (
    <main className="mx-auto w-full max-w-lg space-y-4 px-4 py-6 text-base" aria-label="Report your match result">
      {/* A person at a venue needs the form, not the site footer. */}
      <style>{"footer.no-print{display:none}"}</style>
      {children}
    </main>
  );

  if (load === "missing") return shell(
    <section className="py-10 text-center">
      <h1 className="font-display text-2xl font-bold text-white">This link does not work</h1>
      <p role="status" className="mt-3 text-zinc-300">It may be mistyped, or the organiser replaced it with a new one. Ask the organiser for your team link again.</p>
    </section>,
  );
  if (load === "loading" || token === undefined) return shell(
    <div aria-busy="true"><p className="sr-only" role="status">Loading your matches</p><div className="sk h-8 w-2/3 rounded-lg" /><div className="sk mt-4 h-48 w-full rounded-2xl" /></div>,
  );
  if (load === "error" || !data) return shell(
    <section className="py-10 text-center">
      <h1 className="font-display text-2xl font-bold text-white">Could not load your matches</h1>
      <p role="alert" className="mt-3 text-zinc-300">Check your connection. We try again by ourselves, or you can press the button.</p>
      <button type="button" className="btn mt-4" onClick={() => poller.current?.resume()}>Try again</button>
    </section>,
  );

  return shell(
    <>
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">{data.event.name}</p>
        <h1 className="break-words font-display text-3xl font-bold text-white">{data.team}</h1>
        <p className="mt-1 text-zinc-300">Report the score after your match. The organiser checks it and approves it.</p>
      </header>
      {offline && <p role="status" className="rounded-lg border border-amber-300/40 p-3 text-amber-200">You look offline. What you see may be out of date.</p>}
      <div aria-live="polite">
        {sent && (
          <section className="rounded-2xl border-2 border-emerald-400 p-4" aria-label="Sent">
            <h2 className="font-display text-xl font-bold text-emerald-300">{sent.status === "approved" ? "Sent and approved" : "Sent to the organiser"}</h2>
            <p className="mt-1 text-zinc-100">{sent.status === "approved" ? "Both teams sent the same score, so the result is recorded." : "You will see it here when it is approved. You can close this page and come back to the same link."}</p>
            {sent.disputed && <p className="mt-2 text-amber-200">The other team sent a different score. The organiser will check both.</p>}
            <p className="mt-2 text-zinc-300">Status: <strong>{statusLabel(sent.status)}</strong></p>
          </section>
        )}
        {err && <p role="alert" className="rounded-lg border border-rose-400/50 p-3 text-rose-200">{err}</p>}
      </div>

      {!match && (
        <section aria-labelledby="mine-h" className="space-y-3">
          <h2 id="mine-h" className="font-display text-xl font-bold text-white">Your matches</h2>
          {data.matches.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0b0d] p-5">
              <p className="font-display text-lg font-bold text-white">No matches for your team yet</p>
              <p className="mt-2 text-zinc-300">When the organiser adds your matches they show up here. You can leave this page open, it checks again by itself.</p>
            </div>
          )}
          {data.matches.map((m) => (
            <article key={m.id} aria-label={`Match against ${m.opponent || "a team to be decided"}`} className="rounded-2xl border border-white/10 bg-[#0a0b0d] p-4">
              <h3 className="break-words font-display text-xl font-bold text-white">{data.team} <span className="text-zinc-300">vs</span> {m.opponent || "to be decided"}</h3>
              <p className="mt-1 text-zinc-300">{m.status === "finished" || m.status === "forfeit"
                ? (m.scoreA !== null && m.scoreB !== null ? (() => { const r = fromSides(m.side, m.scoreA, m.scoreB); return `Result recorded. ${outcomeText(r.mine, r.theirs, m.opponent)}.`; })() : "Result recorded.")
                : <>{m.stage !== "main" ? `${m.stage}, ` : ""}round {m.round}{m.startsAt ? `, ${timeText(m.startsAt)}` : ""}</>}</p>
              <SubmissionNote m={m} />
              {m.canReport && (
                <button type="button" className="btn mt-3 !min-h-14 w-full text-lg" onClick={() => pick(m)}>{m.submission?.status === "pending" ? "Change the score I sent" : "Send the score"}</button>
              )}
              {!m.canReport && !m.opponent.trim() && <p className="mt-2 text-zinc-300">Your opponent is not decided yet. You can report when it is.</p>}
            </article>
          ))}
        </section>
      )}

      {match && !confirming && (
        <section aria-labelledby="form-h" className="space-y-5 rounded-2xl border-2 border-cyan bg-[#0a0b0d] p-4">
          <div>
            <h2 id="form-h" ref={pickedRef} tabIndex={-1} className="break-words font-display text-xl font-bold text-white outline-none">{data.team} vs {match.opponent}</h2>
            <p className="mt-1 text-zinc-300">Enter the final score. Use the plus and minus buttons or type the number.</p>
          </div>
          <Stepper label={`${data.team} (you)`} value={mine} onChange={setMine} />
          <Stepper label={match.opponent} value={theirs} onChange={setTheirs} />
          <div className="space-y-2">
            <label htmlFor="proof" className="block text-base font-semibold text-zinc-100">Screenshot as proof (optional, but it helps)</label>
            <input id="proof" type="file" accept="image/png,image/jpeg,image/webp" disabled={proofBusy} onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} className="block w-full text-base text-zinc-200 file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-cyan file:px-4 file:font-semibold file:text-ink" />
            <p className="text-sm text-amber-200">Show only the scoreboard. Do not include phone numbers, emails, ID cards or photos of people. The organiser can see this picture.</p>
            {proofBusy && <p role="status" className="text-zinc-300">Making the picture smaller...</p>}
            {proof && (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proof} alt="Your screenshot" className="max-h-56 w-full rounded-lg border border-white/15 object-contain" />
                <button type="button" className="btn-ghost mt-2" onClick={() => setProof("")}>Remove the screenshot</button>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="note" className="block text-base font-semibold text-zinc-100">Note for the organiser (optional)</label>
            <textarea id="note" rows={2} maxLength={MAX_NOTE} value={note} onChange={(e) => setNote(e.target.value)} className="field py-2" />
            <p className="text-sm text-zinc-400">{note.length} of {MAX_NOTE} characters</p>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" className="btn !min-h-14 text-lg" disabled={proofBusy} onClick={review}>Check and send</button>
            <button type="button" className="btn-ghost" onClick={() => { setPicked(null); setErr(""); }}>Back to my matches</button>
          </div>
        </section>
      )}

      {match && confirming && check.ok && (
        <section role="alertdialog" aria-modal="false" aria-labelledby="confirm-h" className="space-y-4 rounded-2xl border-2 border-cyan bg-[#0a0b0d] p-4">
          <h2 id="confirm-h" className="font-display text-xl font-bold text-white">Is this correct?</h2>
          <p className="font-display text-3xl font-bold text-white">{data.team} {check.a} <span className="text-zinc-400">-</span> {check.b} {match.opponent}</p>
          <p className="text-zinc-200">{proof ? "A screenshot is attached." : "No screenshot is attached."} Pressing send sends this to the organiser. It does not change the result until they approve it, and you can send a new score before then.</p>
          <div className="flex flex-col gap-2">
            <button type="button" className="btn !min-h-14 text-lg" disabled={busy} onClick={send}>{busy ? "Sending..." : "Yes, send it"}</button>
            <button type="button" className="btn-ghost" disabled={busy} onClick={() => setConfirming(false)}>No, go back and change it</button>
          </div>
        </section>
      )}

      <p className="text-sm text-zinc-400">This is your team link. Do not share it outside your team: anyone with it can send scores for your team. The organiser can replace it at any time.</p>
    </>,
  );
}
