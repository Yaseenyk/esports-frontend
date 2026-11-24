"use client";

import Link from "next/link";
import { Field, describedBy } from "@/features/shared/ui/Fields";
import { btnPrimary, btnSecondary, input } from "@/features/shared/ui/styles";
import { COLOURS, NAME_MAX, PATTERNS, SHAPES, THEMES, CREATE_TEAM_HREF } from "@/features/team-name/domain";
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

/** Team name and badge generator: names from our own word lists, a blocklist check, and a flat badge to download. Browser only. */
export default function TeamNameTool() {
  const t = useTeamName();
  return (
    <div className="space-y-6">
      <section aria-labelledby="tn-names" className={step}>
        <h3 id="tn-names" className="font-display text-lg text-zinc-100">1. Pick a theme and a name</h3>
        <Chips label="Theme" items={THEMES} value={t.theme} onChange={t.setTheme} />
        <div role="radiogroup" aria-label="Name ideas" className="grid gap-2 sm:grid-cols-2" data-testid="tn-list">
          {t.names.map((n) => (
            <button key={n} type="button" role="radio" aria-checked={!t.useOwn && t.chosen === n} onClick={() => t.setChosen(n)}
              className="min-h-11 rounded-lg border border-white/10 bg-surface px-3 text-left text-zinc-100 transition-colors hover:border-white/30 aria-checked:border-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400">
              <span>{n}</span>
            </button>
          ))}
        </div>
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
