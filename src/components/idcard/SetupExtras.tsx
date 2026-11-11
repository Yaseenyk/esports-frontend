"use client";

import { prettyDate, randomPassphrase, type EventInfo, type Team } from "@/lib/idcard/types";

/** Reads a small logo picture into a data URL, shrunk so saving it in the browser stays light. */
/** Same as readLogo, but a picture the browser cannot read gives a plain message instead of nothing. */
async function pickLogo(f: File | undefined, done: (url: string) => void) {
  if (!f) return;
  try { done(await readLogo(f)); } catch { window.alert("That picture could not be read. Try a PNG or JPG."); }
}

export async function readLogo(file: File, max = 320): Promise<string> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const cv = document.createElement("canvas"); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
  cv.getContext("2d")!.drawImage(bmp, 0, 0, cv.width, cv.height); bmp.close();
  return cv.toDataURL("image/png");
}

const Field = ({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) => (
  <label className={`block text-sm text-zinc-300 ${className}`}>{label}{children}{hint && <span className="mt-1 block text-xs text-zinc-400">{hint}</span>}</label>
);

/**
 * Everything that is not needed to make a first card: the back of the card, the age check and signed QR codes.
 * It is folded away by default and its heading says what is currently set, so nothing is hidden without a clue.
 */
export function MoreOptions({ info, setInfo }: { info: EventInfo; setInfo: (i: EventInfo) => void }) {
  const set = (p: Partial<EventInfo>) => setInfo({ ...info, ...p });
  const rules = info.rules.split("\n").filter(Boolean).length;
  return (
    <details className="group rounded-2xl border border-white/10 bg-zinc-900/40">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-cyan">
        <span>
          <span className="font-display text-base font-bold text-white">More options</span>
          <span className="ml-2 text-sm text-zinc-400">optional: back of the card, under-18 check, stop fake cards</span>
        </span>
        <span className="flex items-center gap-2 text-xs text-zinc-400">
          <span>{prettyDate(info.date)}</span><span aria-hidden="true">·</span><span>{info.sign ? "signed QR on" : "signed QR off"}</span><span aria-hidden="true">·</span><span>{rules} {rules === 1 ? "rule" : "rules"}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current transition-transform group-open:rotate-180" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </summary>
      <div className="grid gap-4 border-t border-white/10 p-4 lg:grid-cols-3">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Back of the card</h3>
          <Field label="Venue" hint="Printed on the back."><input className="field mt-1" value={info.venue} onChange={(e) => set({ venue: e.target.value })} /></Field>
          <Field label="Emergency contact" hint="Who to call if the card is found."><input className="field mt-1" value={info.emergency} onChange={(e) => set({ emergency: e.target.value })} /></Field>
          <Field label="Rules" hint="One per line, up to 8."><textarea className="field mt-1 min-h-20 py-2" value={info.rules} onChange={(e) => set({ rules: e.target.value })} /></Field>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/5">{info.sponsorLogo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={info.sponsorLogo} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-[11px] text-zinc-400">No logo</span>}</span>
            <label className="btn-ghost !min-h-9 cursor-pointer px-3 text-sm">{info.sponsorLogo ? "Change sponsor logo" : "Add sponsor logo"}<input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void pickLogo(f, (u) => set({ sponsorLogo: u })); }} /></label>
            {info.sponsorLogo && <button type="button" className="chip !min-h-8" onClick={() => set({ sponsorLogo: undefined })}>Remove</button>}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Under-18 check</h3>
          <Field label="Event date" hint="Anyone under 18 on this date is flagged, so you can collect a guardian's consent before printing."><input type="date" className="field mt-1" value={info.date} onChange={(e) => set({ date: e.target.value })} /></Field>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Stop fake cards (signed QR)</h3>
          <label className="flex items-start gap-3 text-sm text-zinc-300">
            <input type="checkbox" checked={info.sign} onChange={(e) => set({ sign: e.target.checked, passphrase: e.target.checked && !info.passphrase ? randomPassphrase() : info.passphrase })} className="mt-0.5 h-5 w-5 accent-cyan" />
            <span>Make copied or edited cards fail at the gate. The gate phone needs the same secret word (passphrase) to check them.</span>
          </label>
          {info.sign && (
            <div className="space-y-2">
              <Field label="Secret word (passphrase)" hint="Keep it among the organisers. Anyone who knows it can make passes that look real."><input className="field mt-1 font-mono" value={info.passphrase} onChange={(e) => set({ passphrase: e.target.value })} spellCheck={false} /></Field>
              <button type="button" className="chip" onClick={() => set({ passphrase: randomPassphrase() })}>Make a new one</button>
            </div>
          )}
        </div>
      </div>
    </details>
  );
}

/** A team's logo: a button that adds, changes or removes it. */
export function TeamLogoButton({ team, onLogo, compact = false }: { team: Team; onLogo: (logo: string | undefined) => void; compact?: boolean }) {
  if (compact) {
    return (
      <span className="relative inline-flex shrink-0">
        <label title={team.logo ? "Change this team's logo" : "Add a logo for this team"} className="grid h-11 w-11 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-white/25 bg-white/5 text-lg text-zinc-400 transition-colors hover:border-cyan hover:text-cyan">
          {team.logo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={team.logo} alt={`${team.name} logo`} className="h-full w-full object-contain" /> : "+"}
          <input type="file" accept="image/*" className="sr-only" aria-label={`Logo for ${team.name}`} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void pickLogo(f, onLogo); }} />
        </label>
        {team.logo && <button type="button" aria-label="Remove logo" title="Remove logo" onClick={() => onLogo(undefined)} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-zinc-800 text-[11px] text-zinc-300 ring-1 ring-white/20 hover:bg-red-500 hover:text-white">×</button>}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      {team.logo
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={team.logo} alt="" className="h-8 w-8 shrink-0 rounded-md border border-white/10 bg-white/5 object-contain" />
        : null}
      <label className="chip cursor-pointer" title="Upload the team's logo. Designs can show it, and the card can take its colours from it.">{team.logo ? "Change team logo" : "Team logo"}<input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void pickLogo(f, onLogo); }} /></label>
      {team.logo && <button type="button" className="chip" onClick={() => onLogo(undefined)}>Remove</button>}
    </span>
  );
}
