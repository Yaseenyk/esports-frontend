"use client";

import { Field, describedBy } from "@/features/shared/ui/Fields";
import { input } from "@/features/shared/ui/styles";
import { FRAMES, NAME_INPUT_MAX, PROBLEM_TEXT, STYLE_LABEL, TAG_MAX, TAG_STYLES, type Game, type Lang } from "@/features/name-style/domain";
import { NAME_STYLE_COPY } from "@/features/name-style/copy";
import { useNameStyle } from "@/features/name-style/hooks/useNameStyle";

const SUPPORT_TONE = { plain: "text-success", common: "text-zinc-300", newer: "text-warning" } as const;

/**
 * The name style generator: a typed name in every letter style, with a symbol frame and an optional clan tag, each with a Copy button and
 * a note on how widely fonts draw it. Browser only; the name never leaves the page (masked from Clarity, never in an analytics label).
 */
export default function NameStyleTool({ game, lang = "en" }: { game: Game; lang?: Lang }) {
  const c = NAME_STYLE_COPY[lang];
  const s = useNameStyle(game, lang);
  const err = s.problem && s.problem !== "empty" ? PROBLEM_TEXT[lang][s.problem] : undefined;
  return (
    <div className="space-y-5" data-clarity-mask="true" data-testid="name-style-tool">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="ns-name" label={c.nameLabel} help={c.nameHelp} error={err}>
          <input id="ns-name" type="text" value={s.name} maxLength={NAME_INPUT_MAX + 8} autoComplete="off" autoCapitalize="off" spellCheck={false}
            onChange={(e) => s.setName(e.target.value)} aria-invalid={err ? true : undefined} aria-describedby={describedBy("ns-name", c.nameHelp, err)} className={input} />
        </Field>
        <div className="space-y-2">
          <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-100">
            <input type="checkbox" checked={s.useTag} onChange={(e) => s.setUseTag(e.target.checked)} className="h-5 w-5 accent-cyan" />
            {c.tagToggle}
          </label>
          {s.useTag && (
            <>
              <Field id="ns-tag" label={c.tagLabel} help={c.tagHelp}>
                <input id="ns-tag" type="text" value={s.tag} maxLength={TAG_MAX} autoComplete="off" autoCapitalize="characters" spellCheck={false}
                  onChange={(e) => s.setTag(e.target.value)} aria-describedby="ns-tag-help" className={input} />
              </Field>
              <div role="group" aria-label={c.tagGroup} className="flex flex-wrap gap-2">
                {TAG_STYLES.map((t) => <button key={t.id} type="button" className="chip" aria-pressed={s.tagStyle === t.id} onClick={() => s.setTagStyle(t.id)}>{c.tagStyles[t.id]}</button>)}
              </div>
            </>
          )}
        </div>
      </div>
      <div role="group" aria-label={c.frameGroup} className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-100">{c.frameGroup}:</span>
        {FRAMES.map((f) => <button key={f.id} type="button" className="chip" aria-pressed={s.frame === f.id} onClick={() => s.setFrame(f.id)}>{c.frames[f.id]}</button>)}
      </div>
      {s.problem === "empty" && <p className="text-sm text-zinc-300">{PROBLEM_TEXT[lang].empty}</p>}
      {s.rows.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2" aria-label={c.listLabel} data-testid="ns-list">
          {s.rows.map((r) => (
            <li key={r.style} className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface p-2">
              <span className="min-w-0 flex-1 px-1">
                <span className="block text-xs text-zinc-400">{STYLE_LABEL[lang][r.style]}</span>
                <span className="block break-all text-lg text-zinc-100" data-testid="ns-text"><span key={r.text}>{r.text}</span></span>
                <span className="block text-xs text-zinc-400"><span key={r.chars}>{c.chars(r.chars)}</span> · <span className={SUPPORT_TONE[r.support]}>{c.support[r.support]}</span></span>
              </span>
              <button type="button" className="chip" aria-label={c.copyAria(STYLE_LABEL[lang][r.style])} onClick={() => s.copy(r.text)}>{c.copy}</button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs leading-5 text-zinc-400">{c.supportNote}</p>
      <p role="status" aria-live="polite" className={`min-h-5 text-sm ${s.msg?.ok === false ? "text-warning" : "text-success"}`}>{s.msg && <span key={s.msg.text}>{s.msg.text}</span>}</p>
    </div>
  );
}
