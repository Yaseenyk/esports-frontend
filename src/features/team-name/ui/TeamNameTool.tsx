"use client";

import Link from "next/link";
import { Field, describedBy } from "@/features/shared/ui/Fields";
import { btnPrimary, btnSecondary, input } from "@/features/shared/ui/styles";
import { COLOURS, FRAMES, LETTERS, NAME_MAX, PATTERNS, PRESETS, SHAPES, THEMES, CREATE_TEAM_HREF, type Preset } from "@/features/team-name/domain";
import { teamNameCopy, type TeamNameCopy } from "@/features/team-name/copy";
import type { UiLang } from "@/lib/pt-br";
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

function ColourChips({ label, value, onChange, names }: { label: string; value: string; onChange: (v: string) => void; names: TeamNameCopy["colours"] }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-zinc-100">{label}:</span>
      {COLOURS.map((c) => (
        <button key={c.id} type="button" className="chip" aria-pressed={value === c.id} onClick={() => onChange(c.id)}>
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4"><circle cx="8" cy="8" r="7" fill={c.hex} stroke="#a1a1aa" strokeWidth="1" /></svg>
          <span className="ml-1">{names[c.id] ?? c.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Team name and badge generator: names from our own word lists shaped by a game preset, optional stylish versions (always next to
 * the plain name), a blocklist check on every output, and a flat badge to download. Browser only.
 */
export default function TeamNameTool({ preset, stylish, lang = "en" }: { preset?: Preset; stylish?: boolean; lang?: UiLang }) {
  const c = teamNameCopy(lang);
  const t = useTeamName({ preset, stylish, lang });
  const hint = c.presets[t.preset].hint;
  const L = <T extends string>(items: readonly { id: T; label: string }[], names: Record<T, string>) => items.map((i) => ({ id: i.id, label: names[i.id] ?? i.label }));
  const presets = PRESETS.map((p) => ({ id: p.id, label: c.presets[p.id].label }));
  const themes = L(THEMES, c.themes).filter((x) => lang === "en" || x.id !== "indian");
  return (
    <div className="space-y-6">
      <section aria-labelledby="tn-names" className={step}>
        <h3 id="tn-names" className="font-display text-lg text-zinc-100">{c.step1}</h3>
        <Chips label={c.game} items={presets} value={t.preset} onChange={t.setPreset} />
        {hint && <p className="text-xs text-zinc-400"><span key={hint}>{hint}</span></p>}
        <Chips label={c.theme} items={themes} value={t.theme} onChange={t.setTheme} />
        <div className="space-y-3">
          <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-100">
            <input type="checkbox" checked={t.styled} onChange={(e) => t.setStyled(e.target.checked)} className="h-5 w-5 accent-cyan" />
            {c.showStylish}
          </label>
          {t.styled && (
            <div className="space-y-3">
              <Chips label={c.lettersLabel} items={L(LETTERS, c.letters)} value={t.letters} onChange={t.setLetters} />
              <Chips label={c.symbolsLabel} items={L(FRAMES, c.frames)} value={t.frame} onChange={t.setFrame} />
              <p className="text-xs leading-5 text-zinc-400" data-testid="tn-style-note">
                {c.styleNote}
              </p>
            </div>
          )}
        </div>
        <ul className="grid gap-2 sm:grid-cols-2" aria-label={c.listLabel} data-testid="tn-list">
          {t.rows.map((row) => {
            const on = !t.useOwn && t.chosen === row.name;
            return (
              <li key={row.name} className={`space-y-2 rounded-lg border bg-surface p-2 ${on ? "border-cyan-400" : "border-white/10"}`}>
                <div className="flex items-center gap-2">
                  <button type="button" aria-pressed={on} onClick={() => t.setChosen(row.name)} data-testid="tn-pick"
                    className="min-h-11 flex-1 rounded-md px-2 text-left text-zinc-100 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
                    <span>{row.name}</span>
                  </button>
                  <button type="button" className="chip" aria-label={c.copyAria(row.name)} onClick={() => t.copy(row.name)}>{c.copy}</button>
                </div>
                {row.stylish && (
                  <div className="flex items-center gap-2 border-t border-white/10 pt-2" data-testid="tn-stylish">
                    <span className="min-w-0 flex-1 break-all px-2 text-zinc-100"><span key={row.stylish} data-testid="tn-stylish-text">{row.stylish}</span> <span className="whitespace-nowrap text-xs text-zinc-400"><span key={row.chars}>{row.chars}</span> {c.characters}</span></span>
                    <button type="button" className="chip" aria-label={c.copyStylishAria(row.name)} onClick={() => t.copy(row.stylish)}>{c.copy}</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={btnSecondary} onClick={t.roll}>{c.more}</button>
        </div>
        <div className="space-y-2">
          <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-100">
            <input type="checkbox" checked={t.useOwn} onChange={(e) => t.setUseOwn(e.target.checked)} className="h-5 w-5 accent-cyan" />
            {c.own}
          </label>
          {t.useOwn && (
            <Field id="tn-own" label={c.ownLabel} help={c.ownHelp} error={t.own.trim() ? t.ownProblem : undefined}>
              <input id="tn-own" type="text" value={t.own} maxLength={NAME_MAX + 8} autoComplete="off" onChange={(e) => t.setOwn(e.target.value)} aria-invalid={t.own.trim() && t.ownProblem ? true : undefined} aria-describedby={describedBy("tn-own", "help", t.own.trim() ? t.ownProblem : undefined)} className={input} />
            </Field>
          )}
          {t.useOwn && t.own.trim() && !t.ownProblem && <p className="text-sm text-success" role="status"><span aria-hidden="true">✓ </span>{c.ownOk}</p>}
        </div>
      </section>

      <section aria-labelledby="tn-badge" className={step}>
        <h3 id="tn-badge" className="font-display text-lg text-zinc-100">{c.step2}</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Chips label={c.shape} items={L(SHAPES, c.shapes)} value={t.shape} onChange={t.setShape} />
            <Chips label={c.pattern} items={L(PATTERNS, c.patterns)} value={t.pattern} onChange={t.setPattern} />
            <ColourChips label={c.main} value={t.primary} onChange={t.setPrimary} names={c.colours} />
            <ColourChips label={c.second} value={t.secondary} onChange={t.setSecondary} names={c.colours} />
          </div>
          <figure className="space-y-2" aria-live="polite">
            {t.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.preview} alt={c.badgeAlt(t.name)} width={256} height={256} className="mx-auto h-64 w-64" data-testid="tn-badge" />
            ) : (
              <p className="flex h-64 items-center justify-center rounded-xl border border-white/10 text-sm text-zinc-300">{c.noBadge}</p>
            )}
            <figcaption className="text-center">
              <span className="block font-display text-xl text-zinc-100" data-testid="tn-name"><span key={t.name}>{t.name || c.noName}</span></span>
              {t.gloss && <span className="block text-xs text-zinc-400"><span key={t.gloss}>{t.gloss}</span></span>}
            </figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="tn-use" className={step}>
        <h3 id="tn-use" className="font-display text-lg text-zinc-100">{c.step3}</h3>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={btnSecondary} disabled={!t.svg} onClick={t.downloadPng}>{c.png}</button>
          <button type="button" className={btnSecondary} disabled={!t.svg} onClick={t.downloadSvg}>{c.svg}</button>
          <button type="button" className={btnSecondary} disabled={!t.name} onClick={t.copyName}>{c.copyName}</button>
          <Link href={CREATE_TEAM_HREF} className={btnPrimary}>{c.create}</Link>
        </div>
        <p className="text-xs leading-5 text-zinc-400">{c.createNote}</p>
        <p role="status" aria-live="polite" className={`min-h-5 text-xs ${t.msg?.ok === false ? "text-warning" : "text-success"}`}>{t.msg && <span key={t.msg.text}>{t.msg.text}</span>}</p>
      </section>
    </div>
  );
}
