"use client";

import Link from "next/link";
import { Field, describedBy } from "@/features/shared/ui/Fields";
import { btnPrimary, btnSecondary, input } from "@/features/shared/ui/styles";
import { COLOURS, FRAMES, LETTERS, NAME_MAX, PATTERNS, PRESETS, SHAPES, THEMES, CREATE_TEAM_HREF, type Preset } from "@/features/team-name/domain";
import { useTeamName } from "@/features/team-name/hooks/useTeamName";

const step = "space-y-4 border-t border-white/10 pt-6 first:border-t-0 first:pt-0";

function Chips<T extends string>({ label, items, value, onChange }: { label: string; items: readonly { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-zinc-100">{label}:</span>
      {items.map((i) => <button key={i.id} type="button" className="chip" aria-pressed={value === i.id} onClick={() => onChange(i.id)}>{i.label}</button>)}
    </div>
  );
}

function ColourChips({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-zinc-100">{label}:</span>
      {COLOURS.map((c) => (
        <button key={c.id} type="button" className="chip" aria-pressed={value === c.id} onClick={() => onChange(c.id)}>
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4"><circle cx="8" cy="8" r="7" fill={c.hex} stroke="#a1a1aa" strokeWidth="1" /></svg>
          <span className="ml-1">{c.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Team name and badge generator: names from our own word lists shaped by a game preset, optional stylish versions (always next to
 * the plain name), a blocklist check on every output, and a flat badge to download. Browser only.
 */
export default function TeamNameTool({ preset, stylish }: { preset?: Preset; stylish?: boolean }) {
  const t = useTeamName({ preset, stylish });
  const hint = PRESETS.find((p) => p.id === t.preset)?.hint;
  return (
    <div className="space-y-6">
      <section aria-labelledby="tn-names" className={step}>
        <h3 id="tn-names" className="font-display text-lg text-zinc-100">1. Pick a game, a theme and a name</h3>
        <Chips label="Game" items={PRESETS} value={t.preset} onChange={t.setPreset} />
        {hint && <p className="text-xs text-zinc-400"><span key={hint}>{hint}</span></p>}
        <Chips label="Theme" items={THEMES} value={t.theme} onChange={t.setTheme} />
        <div className="space-y-3">
          <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-100">
            <input type="checkbox" checked={t.styled} onChange={(e) => t.setStyled(e.target.checked)} className="h-5 w-5 accent-cyan" />
            Show stylish versions (fancy letters and symbols)
          </label>
          {t.styled && (
            <div className="space-y-3">
              <Chips label="Letters" items={LETTERS} value={t.letters} onChange={t.setLetters} />
              <Chips label="Symbols" items={FRAMES} value={t.frame} onChange={t.setFrame} />
              <p className="text-xs leading-5 text-zinc-400" data-testid="tn-style-note">
                Check it fits in the game before you use it. We could not find a reliable published rule for which symbols or how many characters Free Fire, BGMI or other games accept in a guild or team name, so the plain name stays next to every stylish one. Some phones show a symbol they do not have as an empty box.
              </p>
            </div>
          )}
        </div>
        <ul className="grid gap-2 sm:grid-cols-2" aria-label="Name ideas" data-testid="tn-list">
          {t.rows.map((row) => {
            const on = !t.useOwn && t.chosen === row.name;
            return (
              <li key={row.name} className={`space-y-2 rounded-lg border bg-surface p-2 ${on ? "border-cyan-400" : "border-white/10"}`}>
                <div className="flex items-center gap-2">
                  <button type="button" aria-pressed={on} onClick={() => t.setChosen(row.name)} data-testid="tn-pick"
                    className="min-h-11 flex-1 rounded-md px-2 text-left text-zinc-100 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
                    <span>{row.name}</span>
                  </button>
                  <button type="button" className="chip" aria-label={`Copy ${row.name}`} onClick={() => t.copy(row.name)}>Copy</button>
                </div>
                {row.stylish && (
                  <div className="flex items-center gap-2 border-t border-white/10 pt-2" data-testid="tn-stylish">
                    <span className="min-w-0 flex-1 break-all px-2 text-zinc-100"><span key={row.stylish} data-testid="tn-stylish-text">{row.stylish}</span> <span className="whitespace-nowrap text-xs text-zinc-400"><span key={row.chars}>{row.chars}</span> characters</span></span>
                    <button type="button" className="chip" aria-label={`Copy the stylish version of ${row.name}`} onClick={() => t.copy(row.stylish)}>Copy</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={btnSecondary} onClick={t.roll}>More names</button>
        </div>
        <div className="space-y-2">
          <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-100">
            <input type="checkbox" checked={t.useOwn} onChange={(e) => t.setUseOwn(e.target.checked)} className="h-5 w-5 accent-cyan" />
            I have my own name: check it and use it
          </label>
          {t.useOwn && (
            <Field id="tn-own" label="Your team name" help={`Up to ${NAME_MAX} characters. It is checked against game, publisher and esports organisation names and abusive words.`} error={t.own.trim() ? t.ownProblem : undefined}>
              <input id="tn-own" type="text" value={t.own} maxLength={NAME_MAX + 8} autoComplete="off" onChange={(e) => t.setOwn(e.target.value)} aria-invalid={t.own.trim() && t.ownProblem ? true : undefined} aria-describedby={describedBy("tn-own", "help", t.own.trim() ? t.ownProblem : undefined)} className={input} />
            </Field>
          )}
          {t.useOwn && t.own.trim() && !t.ownProblem && <p className="text-sm text-success" role="status"><span aria-hidden="true">✓ </span>That name is fine to use.</p>}
        </div>
      </section>

      <section aria-labelledby="tn-badge" className={step}>
        <h3 id="tn-badge" className="font-display text-lg text-zinc-100">2. Make the badge</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Chips label="Shape" items={SHAPES} value={t.shape} onChange={t.setShape} />
            <Chips label="Pattern" items={PATTERNS} value={t.pattern} onChange={t.setPattern} />
            <ColourChips label="Main colour" value={t.primary} onChange={t.setPrimary} />
            <ColourChips label="Second colour" value={t.secondary} onChange={t.setSecondary} />
          </div>
          <figure className="space-y-2" aria-live="polite">
            {t.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.preview} alt={`Badge for ${t.name}`} width={256} height={256} className="mx-auto h-64 w-64" data-testid="tn-badge" />
            ) : (
              <p className="flex h-64 items-center justify-center rounded-xl border border-white/10 text-sm text-zinc-300">Choose or type a name to see the badge.</p>
            )}
            <figcaption className="text-center">
              <span className="block font-display text-xl text-zinc-100" data-testid="tn-name"><span key={t.name}>{t.name || "No name yet"}</span></span>
              {t.gloss && <span className="block text-xs text-zinc-400"><span key={t.gloss}>{t.gloss}</span></span>}
            </figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="tn-use" className={step}>
        <h3 id="tn-use" className="font-display text-lg text-zinc-100">3. Download it, or create the team</h3>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={btnSecondary} disabled={!t.svg} onClick={t.downloadPng}>Download PNG</button>
          <button type="button" className={btnSecondary} disabled={!t.svg} onClick={t.downloadSvg}>Download SVG</button>
          <button type="button" className={btnSecondary} disabled={!t.name} onClick={t.copyName}>Copy the name</button>
          <Link href={CREATE_TEAM_HREF} className={btnPrimary}>Create this team</Link>
        </div>
        <p className="text-xs leading-5 text-zinc-400">Create this team opens the free sign-up. The name is not sent or saved anywhere, so copy it first and type it in when you make your team page.</p>
        <p role="status" aria-live="polite" className={`min-h-5 text-xs ${t.msg?.ok === false ? "text-warning" : "text-success"}`}>{t.msg && <span key={t.msg.text}>{t.msg.text}</span>}</p>
      </section>
    </div>
  );
}
