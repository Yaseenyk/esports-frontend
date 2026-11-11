"use client";

import { useEffect, useRef, useState } from "react";
import type { PanelProps } from "@/components/app/panels";
import ToolStep from "@/components/tools/ToolStep";
import { logoFromFile } from "@/components/live/logo";
import { explain } from "@/lib/api/cloud";
import { brandApi, type BrandInput } from "@/lib/api/f-brand";
import { INK, WHITE, colourWarnings, fixContrast, normaliseHex, readableOn, useBrandState } from "@/lib/brand";
import { loadExtras, saveExtras } from "@/lib/extras-store";

const DEFAULT_PRIMARY = "#22d3ee";
const DEFAULT_SECONDARY = "#a855f7";
type Msg = { ok: boolean; text: string } | null;
type Confirm = "event" | "account" | null;

/** A colour the person can pick with the browser's colour box or type as a code like #1a2b3c. */
function ColourField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => { setText(value); }, [value]);
  const valid = normaliseHex(text) !== null;
  return (
    <div className="space-y-1">
      <label htmlFor={`${id}-text`} className="block text-sm font-medium text-zinc-200">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" aria-label={`${label}: colour box`} value={normaliseHex(value) ?? DEFAULT_PRIMARY} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-white/20 bg-transparent p-1" />
        <input id={`${id}-text`} className="field !min-h-11 w-32 font-mono" maxLength={7} spellCheck={false} value={text} aria-invalid={!valid} aria-describedby={valid ? undefined : `${id}-err`}
          onChange={(e) => { setText(e.target.value); const n = normaliseHex(e.target.value); if (n) onChange(n); }} />
      </div>
      {!valid && <p id={`${id}-err`} className="text-xs text-amber-200">Type a colour code like #1a2b3c, or use the colour box.</p>}
    </div>
  );
}

/** Mock-ups of three places the brand appears. Drawn with the draft colours only; nothing here is real event data. */
function Preview({ name, logo, primary, secondary }: { name: string; logo: string; primary: string; secondary: string }) {
  const fg = readableOn(primary);
  const accent = fixContrast(primary, INK);
  const certAccent = fixContrast(primary, WHITE);
  const box = "overflow-hidden rounded-xl border border-white/15";
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <figure className="space-y-2">
        <div className={box} style={{ background: INK }}>
          <div className="flex h-12 items-center gap-2 border-b px-3" style={{ borderColor: secondary }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {logo ? <img src={logo} alt="" className="h-7 w-auto max-w-[72px] object-contain" /> : null}
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{name || "Your event"}</span>
            <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: primary, color: fg }}>Share</span>
          </div>
          <div className="space-y-2 p-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Announcement</p>
            <div className="h-2 w-4/5 rounded bg-white/25" /><div className="h-2 w-3/5 rounded bg-white/15" />
            <div className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ background: primary, color: fg }}>Standings</div>
          </div>
        </div>
        <figcaption className="text-xs text-zinc-300">Live page header and highlights</figcaption>
      </figure>
      <figure className="space-y-2">
        <div className={`${box} mx-auto flex aspect-[3/4] max-w-[180px] flex-col`} style={{ background: INK }}>
          <div className="h-2" style={{ background: primary }} />
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {logo ? <img src={logo} alt="" className="h-9 w-auto max-w-[110px] object-contain" /> : <div className="h-9" />}
            <span className="text-sm font-extrabold leading-tight text-white">{name || "Your event"}</span>
            <span className="h-1 w-12 rounded" style={{ background: secondary }} />
            <span className="text-[10px] text-zinc-300">Poster sponsor row</span>
          </div>
        </div>
        <figcaption className="text-xs text-zinc-300">Poster (the poster tool has a Use my brand button)</figcaption>
      </figure>
      <figure className="space-y-2">
        <div className={`${box} flex aspect-[1.41/1] flex-col items-center justify-center gap-1 p-3 text-center`} style={{ background: WHITE, border: `4px double ${certAccent}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logo ? <img src={logo} alt="" className="h-8 w-auto max-w-[100px] object-contain" /> : null}
          <span className="font-serif text-sm font-bold" style={{ color: certAccent }}>Certificate of Achievement</span>
          <span className="w-3/4 border-b-2 pb-0.5 font-serif text-xs text-zinc-800" style={{ borderColor: certAccent }}>Participant name</span>
        </div>
        <figcaption className="text-xs text-zinc-300">Certificate accent (adjusted to stay readable on white)</figcaption>
      </figure>
    </div>
  );
}

/** Set a logo and two colours once; they appear on the live page, posters and certificates. */
export default function Panel({ eventId, eventName, role }: PanelProps) {
  const canEdit = role !== "viewer";
  const cur = useBrandState(eventId);
  const acct = useBrandState();
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [primary, setPrimary] = useState(DEFAULT_PRIMARY);
  const [secondary, setSecondary] = useState(DEFAULT_SECONDARY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [logoMsg, setLogoMsg] = useState<Msg>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [touched, setTouched] = useState(false);
  const seeded = useRef(false);

  // Fill the form once from whatever kit is in force, so a returning organiser sees what they saved.
  useEffect(() => {
    if (seeded.current || cur.loading) return;
    seeded.current = true;
    if (cur.brand) { setName(cur.brand.name ?? ""); setLogo(cur.brand.logo ?? ""); setPrimary(cur.brand.primary); setSecondary(cur.brand.secondary); }
  }, [cur.loading, cur.brand]);

  const p = normaliseHex(primary) ?? DEFAULT_PRIMARY, s = normaliseHex(secondary) ?? DEFAULT_SECONDARY;
  const warnings = colourWarnings(p, s);
  const fixable = warnings.some((w) => w.which !== "pair");
  const shownName = name.trim() || eventName;
  const input = (): BrandInput => ({ name: (name.trim() || eventName).slice(0, 60), logo: logo || null, primaryColor: p, secondaryColor: s });

  const save = async (where: "event" | "account") => {
    if (!canEdit || busy) return;
    setBusy(true); setMsg(null); setConfirm(null);
    try {
      if (where === "event") await brandApi.saveEvent(eventId, input()); else await brandApi.saveAccount(input());
      cur.refetch(); acct.refetch(); setTouched(false);
      setMsg({ ok: true, text: where === "event" ? `Saved. Only ${eventName} uses this logo and these colours now.` : "Saved. Every event of yours that has no kit of its own uses this logo and these colours." });
    } catch (e) { setMsg({ ok: false, text: explain(e) }); }
    setBusy(false);
  };

  const remove = async (where: "event" | "account") => {
    if (!canEdit || busy) return;
    setBusy(true); setMsg(null);
    try {
      if (where === "event") await brandApi.removeEvent(eventId); else await brandApi.removeAccount();
      cur.refetch(); acct.refetch(); setConfirm(null);
      setMsg({ ok: true, text: where === "event" ? `Removed. ${eventName} now follows your account kit, or has no brand if you have none.` : "Removed your account kit. Events with their own kit keep it. Your form above is unchanged, so you can save it again." });
    } catch (e) { setMsg({ ok: false, text: explain(e) }); }
    setBusy(false);
  };

  const pickLogo = async (file?: File) => {
    if (!file) return;
    setLogoMsg(null);
    try { setLogo(await logoFromFile(file)); setTouched(true); setLogoMsg({ ok: true, text: "Logo added. It was shrunk to under 60 KB in your browser." }); }
    catch (e) { setLogoMsg({ ok: false, text: e instanceof Error ? e.message : "That logo could not be used." }); }
  };

  const toScreens = () => {
    const x = loadExtras() ?? {};
    const mine = { name: shownName.slice(0, 40), ...(logo ? { logo } : null) };
    const rest = (x.sponsors ?? []).filter((sp) => sp.name !== mine.name);
    const ok = saveExtras({ ...x, sponsors: [mine, ...rest].slice(0, 4) });
    setMsg(ok ? { ok: true, text: "Added to the sponsor strip of your TV screens. This is saved in this browser only, so open the screens on this device." } : { ok: false, text: "This browser would not save it. Check that private browsing is off." });
  };

  const none = !cur.loading && !cur.error && cur.source === "none";
  const sourceText = cur.source === "event" ? `${eventName} has its own kit.` : cur.source === "account" ? "This event uses your account kit." : "No kit saved yet.";

  if (cur.loading) return <section aria-label="Your logo and colours" aria-busy="true" className="space-y-3"><p role="status" className="sr-only">Loading your logo and colours</p><div className="sk h-24 w-full rounded-xl" /><div className="sk h-24 w-full rounded-xl" /></section>;
  if (cur.error) return <section aria-label="Your logo and colours" className="card space-y-3 !p-4"><p role="alert" className="text-sm text-amber-200">{explain(cur.error)}</p><button type="button" className="btn-ghost px-4 text-sm" onClick={() => cur.refetch()}>Try again</button></section>;

  return (
    <section aria-label="Your logo and colours" className="space-y-4">
      <p className="text-sm leading-6 text-zinc-300">Set your logo and two colours once. They are used on the live page, and the poster and certificate tools offer them with one button. <span className="font-semibold text-zinc-100">{sourceText}</span></p>
      {none && canEdit && <p role="note" className="rounded-xl border border-cyan/30 bg-[#0a0b0d] p-3 text-sm text-zinc-200">Start with step 1: add your logo. You can skip the logo and only choose colours.</p>}
      {!canEdit && <p role="note" className="rounded-xl border border-white/15 bg-[#0a0b0d] p-3 text-sm text-zinc-200">You can look at the brand kit, but only the owner or an editor can change it.</p>}

      <ToolStep n={1} id="br-logo" title="Upload your logo" done={!!logo} hint="A PNG or JPEG picture. It is shrunk in your browser to under 60 KB. Use a logo you have the right to use.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid h-24 place-items-center rounded-xl border border-white/15 bg-white p-2" aria-label="Logo on a light background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {logo ? <img src={logo} alt="Your logo on a light background" className="max-h-full max-w-full object-contain" /> : <span className="text-xs font-semibold text-zinc-700">Light background</span>}
          </div>
          <div className="grid h-24 place-items-center rounded-xl border border-white/15 p-2" style={{ background: INK }} aria-label="Logo on a dark background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {logo ? <img src={logo} alt="Your logo on a dark background" className="max-h-full max-w-full object-contain" /> : <span className="text-xs font-semibold text-zinc-300">Dark background</span>}
          </div>
        </div>
        {canEdit && (
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn cursor-pointer px-5 focus-within:ring-2 focus-within:ring-cyan">{logo ? "Choose a different logo" : "Choose a logo"}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => { void pickLogo(e.target.files?.[0]); e.target.value = ""; }} /></label>
            {logo && <button type="button" className="chip !min-h-11" onClick={() => { setLogo(""); setTouched(true); }}>Remove the logo</button>}
          </div>
        )}
        <label className="block text-sm text-zinc-200">Brand name (shown next to the logo)
          <input className="field mt-1" maxLength={60} value={name} disabled={!canEdit} placeholder={eventName} onChange={(e) => { setName(e.target.value); setTouched(true); }} />
        </label>
        <p role="status" aria-live="polite" className={`min-h-5 text-xs ${logoMsg?.ok ? "text-emerald-300" : "text-amber-200"}`}>{logoMsg?.text ?? ""}</p>
      </ToolStep>

      <ToolStep n={2} id="br-colours" title="Pick two colours" done={warnings.length === 0} hint="The main colour is used for buttons and highlights, the second for lines and details. Text on the main colour switches between white and black by itself.">
        <div className="grid gap-4 sm:grid-cols-2" aria-disabled={!canEdit}>
          <fieldset disabled={!canEdit} className="contents">
            <ColourField id="br-p" label="Main colour" value={primary} onChange={(v) => { setPrimary(v); setTouched(true); }} />
            <ColourField id="br-s" label="Second colour" value={secondary} onChange={(v) => { setSecondary(v); setTouched(true); }} />
          </fieldset>
        </div>
        <div role="status" aria-live="polite" className="space-y-2">
          {warnings.length === 0
            ? <p className="text-sm text-emerald-300">Both colours are easy to read on the dark live page.</p>
            : warnings.map((w) => <p key={w.which} className="text-sm text-amber-200">Warning: {w.text}</p>)}
        </div>
        {fixable && canEdit && (
          <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={() => { setPrimary(fixContrast(p, INK)); setSecondary(fixContrast(s, INK)); setTouched(true); }}>Make the colours easier to read (lightens them a little)</button>
        )}
      </ToolStep>

      <ToolStep n={3} id="br-see" title="See it, then save it" hint="This is a mock-up with your colours. Nothing changes anywhere until you press one of the save buttons.">
        <Preview name={shownName} logo={logo} primary={p} secondary={s} />
        {canEdit && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn px-5" disabled={busy} onClick={() => save("event")}>{busy ? "Saving…" : "Use for this event only"}</button>
              <button type="button" className="btn-ghost px-5" disabled={busy} onClick={() => save("account")}>Use for all my events</button>
            </div>
            <p className="text-xs leading-5 text-zinc-400">&quot;This event only&quot; is used for {eventName} and wins over the all-events kit. &quot;All my events&quot; applies to every event that has no kit of its own. Anyone with the live page link can see the logo, name and colours once the page is published.</p>
            {touched && <p className="text-xs text-amber-200">You have changes that are not saved yet.</p>}
          </div>
        )}
        <p role="status" aria-live="polite" className={`min-h-5 text-sm ${msg?.ok ? "text-emerald-300" : "text-amber-200"}`}>{msg?.text ?? ""}</p>

        {canEdit && (
          <details className="group rounded-xl border border-white/10 bg-[#0a0b0d]">
            <summary className="flex min-h-11 cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan [&::-webkit-details-marker]:hidden">More options <span className="ml-2 font-normal text-zinc-300">· TV screens, remove, start again</span></summary>
            <div className="space-y-4 border-t border-white/10 p-4">
              <div className="space-y-1">
                <button type="button" className="btn-ghost !min-h-11 px-4 text-sm" onClick={toScreens}>Add my logo to my TV screens</button>
                <p className="text-xs leading-5 text-zinc-400">Puts your name and logo first in the sponsor strip of the screens opened from this browser. It does not use the server.</p>
              </div>
              <div className="space-y-2">
                {confirm === null ? (
                  <div className="flex flex-wrap gap-2">
                    {cur.source === "event" && <button type="button" className="chip !min-h-11" onClick={() => setConfirm("event")}>Stop using a kit for this event</button>}
                    {acct.brand && <button type="button" className="chip !min-h-11" onClick={() => setConfirm("account")}>Remove my all-events kit</button>}
                    {cur.source !== "event" && !acct.brand && <p className="text-sm text-zinc-300">Nothing saved yet, so there is nothing to remove.</p>}
                  </div>
                ) : (
                  <div role="alertdialog" aria-label="Confirm removal" className="space-y-3 rounded-xl border border-amber-300/40 p-3">
                    <p className="text-sm text-zinc-100">{confirm === "event" ? `Remove the kit of ${eventName}? The event then uses your all-events kit, or no brand if you have none.` : "Remove your all-events kit? Events with their own kit keep it. Logos and colours already on downloaded posters stay as they are."}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn px-5" disabled={busy} onClick={() => remove(confirm)}>Yes, remove it</button>
                      <button type="button" className="btn-ghost px-5" onClick={() => setConfirm(null)}>No, keep it</button>
                    </div>
                  </div>
                )}
              </div>
              <button type="button" className="chip !min-h-11" onClick={() => { setName(cur.brand?.name ?? ""); setLogo(cur.brand?.logo ?? ""); setPrimary(cur.brand?.primary ?? DEFAULT_PRIMARY); setSecondary(cur.brand?.secondary ?? DEFAULT_SECONDARY); setTouched(false); setMsg({ ok: true, text: "Form reset to what is saved." }); }}>Reset the form to what is saved</button>
            </div>
          </details>
        )}
      </ToolStep>
    </section>
  );
}
