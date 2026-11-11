"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import ToolStep from "@/components/tools/ToolStep";
import { results, type CaptainLinkInfo, type NewCaptainLink } from "@/lib/api/f-results";
import { explain } from "@/lib/api/cloud";
import { reportUrl, whatsappText } from "@/lib/results";
import { whatsappLink } from "@/lib/share-cards";

function FreshLink({ eventName, l, onNew }: { eventName: string; l: NewCaptainLink; onNew: () => void }) {
  const url = reportUrl(typeof location === "undefined" ? "" : location.origin, l.token);
  const [qr, setQr] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState("");
  useEffect(() => { if (showQr && !qr) QRCode.toDataURL(url, { width: 360, margin: 2 }).then(setQr).catch(() => setQr("")); }, [showQr, qr, url]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied("Copied. Paste it into a message to the captain."); } catch { setCopied("Could not copy by itself. Press and hold the link above to copy it."); }
  };
  return (
    <li className="space-y-2 rounded-xl border border-cyan/40 p-3">
      <p className="break-words font-semibold text-white">{l.team}</p>
      <input readOnly aria-label={`Link for ${l.team}`} value={url} onFocus={(e) => e.currentTarget.select()} className="field text-sm" />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn" onClick={copy}>Copy link</button>
        <a className="btn-ghost" target="_blank" rel="noopener noreferrer" href={whatsappLink(whatsappText(l.team, eventName, url))}>Send on WhatsApp</a>
        <button type="button" className="btn-ghost" aria-expanded={showQr} onClick={() => setShowQr((v) => !v)}>{showQr ? "Hide QR code" : "Show QR code"}</button>
        <button type="button" className="btn-ghost" onClick={onNew}>Replace this link</button>
      </div>
      {copied && <p role="status" className="text-sm text-emerald-300">{copied}</p>}
      {showQr && qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qr} alt={`QR code of the result link for ${l.team}`} width={180} height={180} className="rounded-lg bg-white p-1" />
      )}
    </li>
  );
}

/** Step 1: one link per team captain. Tokens are shown once, here, right after they are made. */
export default function LinksStep({ eventId, eventName, teams, canEdit }: { eventId: string; eventName: string; teams: string[]; canEdit: boolean }) {
  const [links, setLinks] = useState<CaptainLinkInfo[] | null>(null);
  const [fresh, setFresh] = useState<NewCaptainLink[]>([]);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState<{ kind: "renew" | "revoke"; team: string; id?: string } | null>(null);

  const refresh = useCallback(async () => {
    try { setLinks(await results.links(eventId)); setErr(""); } catch (e) { setErr(explain(e)); setLinks((l) => l ?? []); }
  }, [eventId]);
  useEffect(() => { void refresh(); }, [refresh]);

  const active = new Map((links ?? []).filter((l) => l.active).map((l) => [l.team.toLowerCase(), l]));
  const known = [...new Set([...teams, ...(links ?? []).filter((l) => l.active).map((l) => l.team)].map((t) => t.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const missing = known.filter((t) => !active.has(t.toLowerCase()));

  const merge = (made: NewCaptainLink[]) => setFresh((f) => [...made, ...f.filter((x) => !made.some((m) => m.team === x.team))]);

  const makeAll = async () => {
    setBusy("all"); setErr(""); setMsg("");
    try {
      const r = await results.makeAll(eventId);
      merge(r.links);
      setMsg(r.links.length ? `Made ${r.links.length} link${r.links.length === 1 ? "" : "s"}. Copy each one now: for safety they are shown only this once.` : "Every team already has a link.");
      await refresh();
    } catch (e) { setErr((e as { status?: number }).status === 400 ? "Add your matches with team names first, then come back to make the links." : explain(e)); } finally { setBusy(""); }
  };
  const makeOne = async (team: string) => {
    setBusy(team); setErr(""); setMsg(""); setConfirm(null);
    try { const r = await results.makeOne(eventId, team); merge(r.links); setMsg(`New link made for ${team}. The old one no longer works.`); await refresh(); } catch (e) { setErr(explain(e)); } finally { setBusy(""); }
  };
  const revoke = async (id: string, team: string) => {
    setBusy(id); setErr(""); setMsg(""); setConfirm(null);
    try { await results.revoke(eventId, id); setFresh((f) => f.filter((x) => x.team !== team)); setMsg(`The link for ${team} is turned off. Make a new one if the captain needs it again.`); await refresh(); } catch (e) { setErr(explain(e)); } finally { setBusy(""); }
  };

  const done = known.length > 0 && missing.length === 0;
  return (
    <ToolStep n={1} title="Give every captain a link" done={done} status={known.length ? `${known.length - missing.length} of ${known.length} teams` : undefined}
      hint="Each team captain gets their own private link. They open it on a phone, pick their match and send the score with a screenshot. You approve it in step 2.">
      <div aria-live="polite" className="space-y-2">
        {msg && <p role="status" className="rounded-lg border border-emerald-400/50 p-3 text-sm text-emerald-300">{msg}</p>}
        {err && <p role="alert" className="rounded-lg border border-rose-400/50 p-3 text-sm text-rose-200">{err}</p>}
      </div>

      {links === null && <p role="status" className="text-sm text-zinc-300">Loading the links...</p>}

      {links !== null && known.length === 0 && (
        <div className="rounded-xl border border-white/10 p-4">
          <p className="font-semibold text-white">No teams yet</p>
          <p className="mt-1 text-sm text-zinc-300">Captains report the score of a match, so first add your matches with team names (for example in &quot;Run the day&quot;). Then come back and make the links.</p>
        </div>
      )}

      {links !== null && known.length > 0 && canEdit && (
        <div className="space-y-2">
          <button type="button" className="btn" disabled={busy === "all" || missing.length === 0} onClick={makeAll}>{busy === "all" ? "Making links..." : missing.length === 0 ? "Every team has a link" : `Make links for ${missing.length === known.length ? "all teams" : `the ${missing.length} team${missing.length === 1 ? "" : "s"} without one`}`}</button>
          <p className="text-sm text-zinc-300">This makes one private link per team. Teams that already have a link keep it. Links are shown only once, so copy them straight away.</p>
        </div>
      )}

      {fresh.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-display text-base font-bold text-white">New links (shown only now)</h4>
          <ul className="space-y-3">{fresh.map((l) => <FreshLink key={l.id} eventName={eventName} l={l} onNew={() => setConfirm({ kind: "renew", team: l.team })} />)}</ul>
        </div>
      )}

      {links !== null && known.length > 0 && (
        <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
          {known.map((t) => {
            const l = active.get(t.toLowerCase());
            return (
              <li key={t} className="flex flex-wrap items-center gap-2 p-3">
                <span className="min-w-0 flex-1 break-words font-semibold text-white">{t}</span>
                <span className="text-sm text-zinc-300">{l ? "Link works" : "No link yet"}</span>
                {canEdit && (
                  <>
                    <button type="button" className="btn-ghost" disabled={!!busy} onClick={() => (l ? setConfirm({ kind: "renew", team: t }) : void makeOne(t))}>{l ? "Make a new link" : "Make link"}</button>
                    {l && <button type="button" className="btn-ghost" disabled={!!busy} onClick={() => setConfirm({ kind: "revoke", team: t, id: l.id })}>Turn off</button>}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {confirm && (
        <div role="alertdialog" aria-labelledby="cl-confirm" className="space-y-2 rounded-xl border border-amber-300/50 p-3">
          <p id="cl-confirm" className="text-sm text-zinc-100">
            {confirm.kind === "renew" ? `Make a new link for ${confirm.team}? The link the captain has now stops working, so you must send them the new one.` : `Turn off the link for ${confirm.team}? The captain can no longer send scores until you make a new link.`}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn" onClick={() => (confirm.kind === "renew" ? void makeOne(confirm.team) : void revoke(confirm.id ?? "", confirm.team))}>{confirm.kind === "renew" ? "Yes, make a new link" : "Yes, turn it off"}</button>
            <button type="button" className="btn-ghost" onClick={() => setConfirm(null)}>No, keep it</button>
          </div>
        </div>
      )}
    </ToolStep>
  );
}
