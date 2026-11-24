"use client";

import { Field, describedBy } from "@/features/shared/ui/Fields";
import { btnPrimary, btnSecondary, input } from "@/features/shared/ui/styles";
import { FORMATS, GAMES, TEMPLATE_NOTE, type Format, type GameId, type RulebookInput } from "@/features/rulebook/domain";
import { useRulebook } from "@/features/rulebook/hooks/useRulebook";

const step = "space-y-4 border-t border-white/10 pt-6 first:border-t-0 first:pt-0";

function Text({ id, label, value, onChange, help, type = "text", max = 120 }: { id: string; label: string; value: string; onChange: (v: string) => void; help?: string; type?: string; max?: number }) {
  return (
    <Field id={id} label={label} help={help}>
      <input id={id} type={type} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} aria-describedby={describedBy(id, help)} className={input} />
    </Field>
  );
}

function Count({ id, label, value, onChange, min, max, help }: { id: string; label: string; value: number; onChange: (n: number) => void; min: number; max: number; help?: string }) {
  return (
    <Field id={id} label={label} help={help}>
      <input id={id} type="number" inputMode="numeric" min={min} max={max} value={value} aria-describedby={describedBy(id, help)} className={`${input} font-mono tabular-nums`}
        onChange={(e) => { const n = Math.floor(Number(e.target.value)); if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, n))); }} />
    </Field>
  );
}

const CONDUCT: [keyof RulebookInput["conduct"], string][] = [
  ["cheating", "No cheats, hacks or scripts"], ["teaming", "No teaming or match fixing"], ["respect", "Respect players and staff"],
  ["devices", "Device and account rules"], ["streaming", "Streaming with a delay"],
];

/** Rulebook generator: a short form, an editable preview and a PDF made in the browser. A template to adapt, not official rules. */
export default function RulebookTool() {
  const r = useRulebook(), i = r.input;
  const usesBestOf = i.format === "single" || i.format === "double" || i.format === "bo-maps";
  return (
    <div className="space-y-6">
      <section aria-labelledby="rb-game" className={step}>
        <h3 id="rb-game" className="font-display text-lg text-zinc-100">1. Game and format</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="rb-game-select" label="Game">
            <select id="rb-game-select" value={i.game} onChange={(e) => r.setGame(e.target.value as GameId)} className={input}>
              {GAMES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </Field>
          <Field id="rb-format" label="Format">
            <select id="rb-format" value={i.format} onChange={(e) => r.set("format", e.target.value as Format)} className={input}>
              {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </Field>
          {i.game === "other" && <Text id="rb-other" label="Name of the game or sport" value={i.otherGame ?? ""} onChange={(v) => r.set("otherGame", v)} max={60} />}
          {usesBestOf && (
            <Field id="rb-bo" label="Matches are best of">
              <select id="rb-bo" value={i.bestOf} onChange={(e) => r.set("bestOf", Number(e.target.value))} className={input}>
                {[1, 3, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
          )}
          {i.format === "br-points" && <Count id="rb-brm" label="Matches per team" value={i.brMatches ?? 6} min={1} max={30} onChange={(n) => r.set("brMatches", n)} />}
        </div>
      </section>

      <section aria-labelledby="rb-event" className={step}>
        <h3 id="rb-event" className="font-display text-lg text-zinc-100">2. Event details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text id="rb-name" label="Event name" value={i.eventName} onChange={(v) => r.set("eventName", v)} help="Left empty, the rulebook says [Event name]." max={80} />
          <Text id="rb-org" label="Organiser" value={i.organiser ?? ""} onChange={(v) => r.set("organiser", v)} help="The club, college or person who runs it." max={80} />
          <Text id="rb-start" label="First day" type="date" value={i.startDate ?? ""} onChange={(v) => r.set("startDate", v)} />
          <Text id="rb-end" label="Last day" type="date" value={i.endDate ?? ""} onChange={(v) => r.set("endDate", v)} />
          <Text id="rb-where" label="Where" value={i.where ?? ""} onChange={(v) => r.set("where", v)} help="Type online, or the venue." max={80} />
          <Text id="rb-contact" label="Contact for disputes" value={i.contact ?? ""} onChange={(v) => r.set("contact", v)} help="A Discord channel, email or phone." max={80} />
          <Count id="rb-size" label="Players per team" value={i.teamSize ?? 4} min={1} max={20} onChange={(n) => r.set("teamSize", n)} />
          <Count id="rb-subs" label="Substitutes per team" value={i.subs ?? 0} min={0} max={10} onChange={(n) => r.set("subs", n)} />
        </div>
      </section>

      <section aria-labelledby="rb-rules" className={step}>
        <h3 id="rb-rules" className="font-display text-lg text-zinc-100">3. Check-in, conduct and disputes</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Count id="rb-checkin" label="Check-in opens (minutes before)" value={i.checkInMinutes} min={0} max={600} onChange={(n) => r.set("checkInMinutes", n)} />
          <Count id="rb-late" label="Late limit (minutes)" value={i.lateMinutes} min={0} max={120} onChange={(n) => r.set("lateMinutes", n)} help="After this, the team loses the match." />
          <Count id="rb-dispute" label="Dispute window (minutes)" value={i.disputeMinutes} min={1} max={1440} onChange={(n) => r.set("disputeMinutes", n)} />
        </div>
        <fieldset className="space-y-1">
          <legend className="mb-1 text-sm font-medium text-zinc-100">Conduct rules to include</legend>
          {CONDUCT.map(([k, label]) => (
            <label key={k} className="flex min-h-11 items-center gap-2 text-sm text-zinc-100">
              <input type="checkbox" checked={i.conduct[k]} onChange={(e) => r.setConduct(k, e.target.checked)} className="h-5 w-5 accent-cyan" />{label}
            </label>
          ))}
        </fieldset>
      </section>

      <section aria-labelledby="rb-preview" className={step}>
        <h3 id="rb-preview" className="font-display text-lg text-zinc-100">4. Read, edit and download</h3>
        <p className="text-sm text-zinc-300">{TEMPLATE_NOTE}</p>
        <Field id="rb-text" label="Your rulebook (edit freely)" help="Lines starting with # are headings and lines starting with - are bullet points in the PDF.">
          <textarea id="rb-text" value={r.text} rows={22} onChange={(e) => r.edit(e.target.value)} aria-describedby="rb-text-help" className={`${input} py-2 font-mono text-sm leading-6`} />
        </Field>
        <p className="text-sm text-zinc-300" aria-live="polite">
          <span key={r.left}>{r.left === 0 ? "No [brackets] left to fill." : `${r.left} [bracket] ${r.left === 1 ? "item is" : "items are"} still to fill in.`}</span>
          {r.edited && <span key="ed"> You have edited the text, so the form above no longer changes it.</span>}
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={btnPrimary} disabled={r.busy} onClick={r.pdf}><span key={r.busy ? "b" : "i"}>{r.busy ? "Making the PDF…" : "Download PDF"}</span></button>
          <button type="button" className={btnSecondary} onClick={r.copy}>Copy the text</button>
          {r.edited && <button type="button" className={btnSecondary} onClick={r.rebuild}>Rebuild from the form</button>}
        </div>
        <p role="status" aria-live="polite" className={`min-h-5 text-xs ${r.msg?.ok === false ? "text-warning" : "text-success"}`}>{r.msg && <span key={r.msg.text}>{r.msg.text}</span>}</p>
      </section>
    </div>
  );
}
