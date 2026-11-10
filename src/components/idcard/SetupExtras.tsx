"use client";

import { randomPassphrase, type EventInfo, type Team } from "@/lib/idcard/types";

/** Reads a small logo picture into a data URL, shrunk so saving it in the browser stays light. */
export async function readLogo(file: File, max = 320): Promise<string> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const cv = document.createElement("canvas"); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
  cv.getContext("2d")!.drawImage(bmp, 0, 0, cv.width, cv.height); bmp.close();
  return cv.toDataURL("image/png");
}

/** Event details, the sponsor strip and the signed-pass switch. */
export default function SetupExtras({ info, setInfo }: { info: EventInfo; setInfo: (i: EventInfo) => void }) {
  const set = (p: Partial<EventInfo>) => setInfo({ ...info, ...p });
  return (
    <section className="card space-y-4 md:col-span-2">
      <h2 className="font-display text-xl font-bold text-white">Details for the back of the card and the gate</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm text-zinc-400">Event date<input type="date" className="field mt-1" value={info.date} onChange={(e) => set({ date: e.target.value })} /></label>
        <label className="block text-sm text-zinc-400 md:col-span-2">Venue<input className="field mt-1" value={info.venue} onChange={(e) => set({ venue: e.target.value })} /></label>
        <label className="block text-sm text-zinc-400 md:col-span-3">Emergency contact (printed on the back)<input className="field mt-1" value={info.emergency} onChange={(e) => set({ emergency: e.target.value })} /></label>
        <label className="block text-sm text-zinc-400 md:col-span-2">Rules (one per line, up to 8)<textarea className="field mt-1 min-h-24 py-2" value={info.rules} onChange={(e) => set({ rules: e.target.value })} /></label>
        <div>
          <p className="text-sm text-zinc-400">Sponsor logo</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="grid h-16 w-24 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/5">{info.sponsorLogo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={info.sponsorLogo} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-zinc-500">None</span>}</span>
            <div className="flex flex-col gap-2">
              <label className="btn-ghost !min-h-9 cursor-pointer px-3 text-sm">{info.sponsorLogo ? "Change" : "Upload"}<input type="file" accept="image/*" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) set({ sponsorLogo: await readLogo(f) }); e.target.value = ""; }} /></label>
              {info.sponsorLogo && <button type="button" className="chip !min-h-8" onClick={() => set({ sponsorLogo: undefined })}>Remove</button>}
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 p-4">
        <label className="flex items-start gap-3 text-sm text-zinc-300">
          <input type="checkbox" checked={info.sign} onChange={(e) => set({ sign: e.target.checked, passphrase: e.target.checked && !info.passphrase ? randomPassphrase() : info.passphrase })} className="mt-1 h-5 w-5 accent-cyan" />
          <span><strong className="text-white">Tamper-proof QR codes.</strong> Each card&apos;s QR is signed with a passphrase, so a copied or edited card fails at the gate. The check-in page needs the same passphrase.</span>
        </label>
        {info.sign && (
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="block text-sm text-zinc-400">Passphrase (keep it among the organisers)
              <input className="field mt-1 font-mono" value={info.passphrase} onChange={(e) => set({ passphrase: e.target.value })} spellCheck={false} />
            </label>
            <button type="button" className="btn-ghost self-end text-sm" onClick={() => set({ passphrase: randomPassphrase() })}>Make a new one</button>
          </div>
        )}
      </div>
    </section>
  );
}

/** One row per team: a name, a logo and a button to recolour the team's card from that logo. */
export function TeamLogoButton({ team, onLogo }: { team: Team; onLogo: (logo: string | undefined) => void }) {
  return (
    <div className="flex items-center gap-2">
      {team.logo
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={team.logo} alt="" className="h-9 w-9 shrink-0 rounded-md border border-white/10 bg-white/5 object-contain" />
        : null}
      <label className="btn-ghost !min-h-9 cursor-pointer px-3 text-xs">{team.logo ? "Change logo" : "Add logo"}<input type="file" accept="image/*" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) onLogo(await readLogo(f)); e.target.value = ""; }} /></label>
      {team.logo && <button type="button" className="chip !min-h-8 text-xs" onClick={() => onLogo(undefined)}>Remove</button>}
    </div>
  );
}
