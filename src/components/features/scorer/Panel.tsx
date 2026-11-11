"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import type { PanelProps } from "@/components/app/panels";
import ToolStep from "@/components/tools/ToolStep";
import { explain } from "@/lib/api/cloud";
import { scorerLinks, type ScorerLink } from "@/lib/api/f-scorer";
import { useMatches } from "@/lib/api/matches";
import { stageLabel } from "@/lib/matches";
import { linkStateText, scoreUrl, whatsappText, whatsappUrl } from "@/lib/scorer";

const HOURS = [2, 6, 12, 24, 48, 72];
interface Made { link: ScorerLink; url: string; hours: number }

/** Scorer links: make a link for a referee, share it, see and switch off the links that exist. */
export default function Panel({ eventId, eventName, role }: PanelProps) {
  const canEdit = role !== "viewer";
  const { matches } = useMatches(eventId);
  const stages = useMemo(() => [...new Set(matches.map((m) => m.stage))], [matches]);
  const [label, setLabel] = useState("");
  const [stage, setStage] = useState("");
  const [hours, setHours] = useState(12);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [made, setMade] = useState<Made | null>(null);
  const [links, setLinks] = useState<ScorerLink[] | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const canvas = useRef<HTMLCanvasElement>(null);

  const reload = useCallback(async () => {
    if (!canEdit) return;
    try { setLinks(await scorerLinks.list(eventId)); setLoadErr(null); } catch (e) { setLoadErr(explain(e)); }
  }, [eventId, canEdit]);
  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(t); }, []);
  useEffect(() => { if (made && canvas.current) QRCode.toCanvas(canvas.current, made.url, { width: 192, margin: 2 }).catch(() => undefined); }, [made]);

  const make = async () => {
    const name = label.trim();
    if (!name) { setMsg({ ok: false, text: "Give the link a name first, for example Lobby A referee." }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await scorerLinks.make(eventId, { label: name, stage: stage || null, hours });
      setMade({ link: r.link, url: scoreUrl(location.origin, r.token), hours });
      setLabel("");
      setMsg({ ok: true, text: "Link made. Now share it in step 2. You will not be able to see this link again, so copy it now." });
      await reload();
    } catch (e) { setMsg({ ok: false, text: explain(e) }); } finally { setBusy(false); }
  };
  const copy = async () => {
    if (!made) return;
    try { await navigator.clipboard.writeText(made.url); setMsg({ ok: true, text: "Link copied. Paste it into a message to the referee." }); } catch { setMsg({ ok: false, text: "Could not copy. Select the link and copy it by hand." }); }
  };
  const revoke = async (id: string) => {
    setBusy(true); setMsg(null);
    try {
      await scorerLinks.revoke(eventId, id);
      setConfirming(null);
      if (made?.link.id === id) setMade(null);
      setMsg({ ok: true, text: "Link switched off. It stops working straight away. Results already entered stay." });
      await reload();
    } catch (e) { setMsg({ ok: false, text: explain(e) }); } finally { setBusy(false); }
  };

  if (!canEdit) return (
    <section aria-label="Scorer links" className="card space-y-2 !p-4">
      <h3 className="font-display text-lg font-bold text-white">Scorer links</h3>
      <p className="text-sm text-zinc-300">You can view this event but not make scorer links. Ask the owner or an editor of the event.</p>
    </section>
  );

  const active = (links ?? []).filter((l) => l.state === "active");
  const text = made ? whatsappText(made.link.label, eventName, made.url, made.hours) : "";
  return (
    <section aria-label="Scorer links" className="space-y-4">
      <div className="card space-y-2 !p-4">
        <h3 className="font-display text-lg font-bold text-white">Let a referee enter results from their phone</h3>
        <p className="text-sm leading-6 text-zinc-300">Make a link and send it to a referee or lobby host. They open it on their phone, no account needed, and enter scores for you.</p>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-300">
          <li><strong className="text-white">They can:</strong> see the matches in the link, set a score, mark a match live, finish it, record a forfeit, enter battle royale placements and kills, and correct a result while the link works.</li>
          <li><strong className="text-white">They cannot:</strong> see players, passes or other events, change teams or schedules, or touch matches outside the link. Every change they make is marked with the link name, for example scorer: Lobby A referee.</li>
          <li><strong className="text-white">A link</strong> stops working after the hours you choose, or when you switch it off. Anyone who has the link can enter results, so send it only to the person who needs it.</li>
        </ul>
      </div>

      <ToolStep n={1} title="Make a link" hint="Name it after the person or the room, so you can tell the links apart." done={!!made}>
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-zinc-200">Name of the link
            <input value={label} maxLength={40} onChange={(e) => setLabel(e.target.value)} placeholder="Lobby A referee" className="mt-1 block min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-base text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan" />
          </label>
          <details className="rounded-lg border border-zinc-800">
            <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-semibold text-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan">More options</summary>
            <div className="space-y-3 border-t border-zinc-800 p-3">
              <label className="block text-sm font-semibold text-zinc-200">Which matches can they score?
                <select value={stage} onChange={(e) => setStage(e.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-base text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan">
                  <option value="">All matches of this event</option>
                  {stages.map((s) => <option key={s} value={s}>{stageLabel(s)} only</option>)}
                  <option value="br">Battle royale lists only</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-zinc-200">How long should the link work?
                <select value={hours} onChange={(e) => setHours(Number(e.target.value))} className="mt-1 block min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-base text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan">
                  {HOURS.map((h) => <option key={h} value={h}>{h} hours{h === 12 ? " (usual)" : ""}</option>)}
                </select>
              </label>
            </div>
          </details>
          <button type="button" className="btn w-full sm:w-auto" disabled={busy} onClick={make}>{busy ? "Making the link..." : "Make the link"}</button>
          <p className="text-sm text-zinc-300">After you press the button, a private link is made for {hours} hours. It is not sent anywhere yet; you send it in step 2.</p>
        </div>
      </ToolStep>

      <ToolStep n={2} title="Share it" hint={made ? `Link for ${made.link.label}. Send it to that person only.` : "Make a link in step 1 and it shows up here."} done={false}>
        {made ? (
          <div className="space-y-3">
            <p className="break-all rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm text-white" data-testid="scorer-url">{made.url}</p>
            <div className="flex flex-wrap items-start gap-4">
              <canvas ref={canvas} width={192} height={192} role="img" aria-label="QR code for the scoring link" className="h-48 w-48 rounded-lg bg-white" />
              <div className="flex min-w-0 flex-1 basis-48 flex-col gap-2">
                <button type="button" className="btn !min-h-11" onClick={copy}>Copy the link</button>
                <a className="btn-ghost !min-h-11 text-center" href={whatsappUrl(text)} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
                <p className="text-sm text-zinc-300">The QR code is for a referee standing next to you: they point their camera at it.</p>
              </div>
            </div>
            <p className="text-sm text-amber-200">This is the only time the link is shown. If you lose it, switch it off below and make a new one.</p>
          </div>
        ) : (
          <p className="text-sm text-zinc-300">Nothing to share yet.</p>
        )}
      </ToolStep>

      <div aria-live="polite">{msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm font-semibold ${msg.ok ? "text-emerald-300" : "text-amber-200"}`}>{msg.text}</p>}</div>

      <section aria-label="Links made for this event" className="card space-y-3 !p-4">
        <h4 className="font-display text-base font-bold text-white">Links for this event {links && <span className="text-sm font-normal text-zinc-300">({active.length} working)</span>}</h4>
        {loadErr ? (
          <p role="alert" className="text-sm text-amber-200">{loadErr} <button type="button" className="underline" onClick={() => void reload()}>Try again</button></p>
        ) : links === null ? (
          <div role="status" aria-busy="true" className="space-y-2"><span className="sr-only">Loading the links</span><div className="sk h-12 rounded-lg" /><div className="sk h-12 rounded-lg" /></div>
        ) : links.length === 0 ? (
          <p className="text-sm text-zinc-300">No links yet. Use step 1 to make the first one.</p>
        ) : (
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800 p-3">
                <div className="min-w-0 flex-1 basis-40">
                  <p className="break-words font-semibold text-white">{l.label}</p>
                  <p className="text-sm text-zinc-300">{l.stage ? (l.stage === "br" ? "Battle royale lists" : stageLabel(l.stage)) : "All matches"} · <span className={l.state === "active" ? "font-semibold text-emerald-300" : "text-zinc-300"}>{l.state === "active" ? "Working: " : ""}{linkStateText(l, now)}</span></p>
                </div>
                {l.state === "active" && (confirming === l.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-zinc-200">Switch it off now?</span>
                    <button type="button" className="btn !min-h-11 px-4 text-sm" disabled={busy} onClick={() => void revoke(l.id)}>Yes, switch off</button>
                    <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => setConfirming(null)}>No</button>
                  </div>
                ) : (
                  <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => setConfirming(l.id)} aria-label={`Switch off the link ${l.label}`}>Switch off</button>
                ))}
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
