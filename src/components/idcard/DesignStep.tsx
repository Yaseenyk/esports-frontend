"use client";

import Select from "@/components/Select";
import { FORMATS, fmtOf, type Fmt, type Person, type Team, type Template } from "@/lib/idcard/types";
import { THEMES, VIBES, posterFmt, type ThemeEntry } from "@/lib/idcard/themes";
import CardView, { type Ctx } from "./CardView";
import Editor from "./Editor";
import { TeamLogoButton } from "./SetupExtras";

interface Props {
  teamOpts: { value: string; label: string }[]; dTeam: Team; setDesignTeam: (id: string) => void;
  curTpl: Template; editView: Template; onEdit: (t: Template) => void;
  ctxFor: (p: Person) => Ctx; sample: Person; teamPeople: Person[]; setPreviewId: (id: string) => void;
  side: "front" | "back"; setSide: (s: "front" | "back") => void;
  vibe: string | null; setVibe: (v: string | null) => void;
  onFormat: (f: Fmt) => void; applyTheme: (id: string) => void; surprise: () => void; sameForAll: () => void; differentPerTeam: () => void;
  addBack: () => void; rebuildBack: () => void; toggleRoleBar: () => void; roleBarOn: boolean; recolourFromLogo: () => void; setTeamLogo: (logo: string | undefined) => void;
  photoForSample: (f: File) => void; onSaveDesign: () => void; onLoadDesign: (f: File) => void;
}

/** Step 3: choose a team and a starting design, then fine-tune it. The designs sit in one scrolling strip so the editor stays on screen. */
export default function DesignStep(p: Props) {
  const f = fmtOf(p.curTpl);
  const poster = posterFmt(f);
  const list: ThemeEntry[] = THEMES.filter((t) => (poster ? t.group === "poster" && !!t.fmts?.includes(f) : t.group === "classic"));
  const F = FORMATS[f];
  const thumbW = f === "strip" ? 280 : F.w < F.h ? 96 : 150;

  return (
    <div className="no-print space-y-4">
      {/* 1. Which card am I working on? */}
      <section className="card !p-3" aria-label="Which card">
        <div className="grid grid-cols-2 items-end gap-3 lg:grid-cols-[1fr_1fr_auto_1fr]">
          <Select label="Team" value={p.dTeam.id} onChange={p.setDesignTeam} options={p.teamOpts} searchable={false} />
          <Select label="Card shape for this team" value={f} onChange={(v) => p.onFormat(v as Fmt)} options={(Object.keys(FORMATS) as Fmt[]).map((k) => ({ value: k, label: FORMATS[k].label, hint: `${FORMATS[k].w}×${FORMATS[k].h} mm` }))} searchable={false} />
          <div>
            <p className="mb-1 text-sm text-zinc-400">Side</p>
            <div className="flex gap-1 rounded-xl bg-white/5 p-1" role="group" aria-label="Side of the card">
              <button type="button" aria-pressed={p.side === "front"} onClick={() => p.setSide("front")} className={`min-h-9 rounded-lg px-4 text-sm font-semibold ${p.side === "front" ? "bg-cyan text-ink" : "text-zinc-300 hover:bg-white/5"}`}>Front</button>
              <button type="button" aria-pressed={p.side === "back"} disabled={!p.curTpl.back} title={p.curTpl.back ? "Edit the back of the card" : "This card has no back yet. Use “Add a back” below."} onClick={() => p.setSide("back")} className={`min-h-9 rounded-lg px-4 text-sm font-semibold disabled:opacity-40 ${p.side === "back" ? "bg-cyan text-ink" : "text-zinc-300 hover:bg-white/5"}`}>Back</button>
            </div>
          </div>
          <Select label="Preview with" value={p.sample.id} onChange={p.setPreviewId} options={p.teamPeople.map((x) => ({ value: x.id, label: x.name || x.id, hint: x.photo ? (x.cutout ? "cut-out" : "photo") : "no photo" }))} searchable={false} />
        </div>
      </section>

      {/* 2. Pick a starting point */}
      <section className="card !p-3" aria-label="Designs">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-white">1. Pick a starting design <span className="text-sm font-normal text-zinc-500">· {list.length} for {FORMATS[f].label.toLowerCase()}</span></h2>
            {!poster && <p className="text-xs text-zinc-500">Want poster-style cards with big type and cut-out portraits? Change the card shape to Poster, Story or Phone pass.</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-36"><Select ariaLabel="Style" value={p.vibe ?? ""} onChange={(v) => p.setVibe(v || null)} options={[{ value: "", label: "Any style" }, ...VIBES.map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))]} searchable={false} /></div>
            <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" title="Pick a design for this team that fits the chosen style" onClick={p.surprise}>Surprise me</button>
            <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" title="Give every team a copy of this team's design" onClick={p.sameForAll}>Use for all teams</button>
            <button type="button" className="btn-ghost !min-h-10 px-3 text-sm" title="Give each team a different design" onClick={p.differentPerTeam}>Different per team</button>
          </div>
        </div>
        <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2" aria-label="Designs">
          {list.map((th) => (
            <li key={th.id} className={`shrink-0 snap-start ${p.vibe && !th.tags.includes(p.vibe) ? "opacity-35" : ""}`} style={{ width: thumbW }}>
              <button type="button" onClick={() => p.applyTheme(th.id)} aria-label={`Use the ${th.name} design`} aria-pressed={p.curTpl.theme === th.id} className={`group w-full rounded-xl border p-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan ${p.curTpl.theme === th.id ? "border-cyan bg-cyan/10" : "border-white/10 hover:border-white/30"}`}>
                <CardView tpl={th.make(f)} ctx={p.ctxFor(p.sample)} />
                <span className="mt-1.5 block truncate text-center text-[11px] font-semibold text-zinc-300">{th.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Fine-tune it */}
      <section className="card !p-3 sm:!p-4" aria-label="Edit the card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-base font-bold text-white">2. Fine-tune <span className="text-cyan">{p.dTeam.name}</span>&apos;s {p.side} <span className="text-sm font-normal text-zinc-500">· click anything on the card to change it</span></h2>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Card options">
            {p.curTpl.back
              ? <button type="button" className="chip" title="Throw away edits to the back and rebuild it from the front's colours" onClick={p.rebuildBack}>Rebuild the back</button>
              : f === "strip" ? <span className="text-xs text-zinc-500">Wristbands have no back.</span> : <button type="button" className="chip" title="Make a back with a QR code, return details and rules" onClick={p.addBack}>Add a back</button>}
            <button type="button" className="chip" aria-pressed={p.roleBarOn} title="A thin stripe whose colour shows the person's role (Player, Staff, VIP…), so guards can tell roles apart at a glance" onClick={p.toggleRoleBar}>Role colour stripe</button>
            <TeamLogoButton team={p.dTeam} onLogo={p.setTeamLogo} />
            <button type="button" className="chip" title="Save this card's design as a file you can share or reuse in another event" onClick={p.onSaveDesign}>Save design file</button>
            <label className="chip cursor-pointer" title="Load a design file made with this tool. It replaces this team's card.">Load design file<input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) p.onLoadDesign(f); e.target.value = ""; }} /></label>
            <button type="button" className="chip" disabled={!p.dTeam.logo} title={p.dTeam.logo ? "Use the main colour of the team logo as this card's accent colour" : "Add a team logo first"} onClick={p.recolourFromLogo}>Colours from logo</button>
          </div>
        </div>
        <Editor tpl={p.editView} onChange={p.onEdit} ctx={p.ctxFor(p.sample)} onPhotoFile={p.photoForSample} />
      </section>
    </div>
  );
}
