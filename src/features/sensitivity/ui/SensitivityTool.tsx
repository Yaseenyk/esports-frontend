"use client";

import { Field, describedBy } from "@/features/shared/ui/Fields";
import { btnSecondary, input, link } from "@/features/shared/ui/styles";
import { CHECKED, GAMES, roundFor } from "@/features/sensitivity/domain";
import { useSensitivity } from "@/features/sensitivity/hooks/useSensitivity";
import { useEdpi } from "@/features/sensitivity/hooks/useEdpi";
import ShareResult from "@/features/share-result/ui/ShareResult";
import { sensCopy } from "@/features/sensitivity/copy";
import type { UiLang } from "@/lib/pt-br";

const options = GAMES.map((g) => ({ value: g.id, label: g.name }));

function GameSelect({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field id={id} label={label}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={input}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

function NumberBox({ id, label, value, onChange, help, error }: { id: string; label: string; value: string; onChange: (v: string) => void; help?: string; error?: string }) {
  return (
    <Field id={id} label={label} help={help} error={error}>
      <input id={id} type="text" inputMode="decimal" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value.replace(",", "."))} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, help, error)} className={`${input} font-mono tabular-nums`} />
    </Field>
  );
}

/** The eDPI calculator: sensitivity x DPI for one game, its cm/360, and the eDPI that gives the same feel in each listed game. */
function EdpiCalculator({ lang }: { lang: UiLang }) {
  const c = sensCopy(lang);
  const e = useEdpi(lang);
  const r = e.check.ok ? e.check.result : null;
  return (
    <section aria-labelledby="edpi-h" className="space-y-4 border-t border-white/10 pt-6">
      <h3 id="edpi-h" className="font-display text-lg text-zinc-100">{c.edpiH}</h3>
      <p className="max-w-3xl text-sm leading-6 text-zinc-300">
        {c.edpiP}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <GameSelect id="edpi-game" label={c.edpiGame} value={e.gameId} onChange={e.setGameId} />
        <NumberBox id="edpi-sens" label={c.edpiSens} value={e.sens} onChange={e.setSens} error={e.sensError} />
        <NumberBox id="edpi-dpi" label={c.dpi} value={e.dpi} onChange={e.setDpi} error={e.dpiError} />
      </div>
      {!r ? (
        <p className="text-sm text-zinc-300">{c.edpiFix}</p>
      ) : (
        <>
          <p className="text-base text-zinc-300" aria-live="polite">
            {c.edpiIn} <span key={r.game.id}>{r.game.name}</span>:{" "}
            <strong data-testid="edpi-answer" className="font-mono text-3xl text-cyan-400 tabular-nums"><span key={r.edpi}>{roundFor(r.edpi, 2)}</span></strong>{" "}
            <span className="text-sm">(<span key={`c${r.cm360}`} data-testid="edpi-cm">{roundFor(r.cm360, 2)}</span> cm/360, <span key={`i${r.in360}`}>{roundFor(r.in360, 2)}</span> in/360)</span>
          </p>
          <div role="region" aria-label={c.edpiTableLabel} tabIndex={0} className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">{c.edpiTableCaption}</caption>
              <thead><tr className="text-zinc-300"><th scope="col" className="px-3 py-2">{c.game}</th><th scope="col" className="px-3 py-2">{c.edpiCol}</th></tr></thead>
              <tbody>
                {r.perGame.map((g) => (
                  <tr key={g.game.id} className="border-t border-white/10">
                    <th scope="row" className="px-3 py-2 font-medium text-zinc-100">{g.game.name}</th>
                    <td className="px-3 py-2 font-mono text-zinc-100 tabular-nums"><span key={g.edpi}>{roundFor(g.edpi, 1)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs leading-5 text-zinc-400">{c.edpiNote}</p>
        </>
      )}
    </section>
  );
}

/**
 * Mouse sensitivity converter for PC games: game A sensitivity and DPI in, game B sensitivity out, with cm/360 and inches/360.
 * Everything is worked out in the browser. Changing numbers sit in their own elements so a translated page keeps working.
 */
export default function SensitivityTool({ lang = "en", path = "/tools/sensitivity-converter/" }: { lang?: UiLang; path?: string }) {
  const c = sensCopy(lang);
  const s = useSensitivity(lang);
  const r = s.check.ok ? s.check.result : null;
  return (
    <div className="space-y-6">
      <section aria-labelledby="sens-in" className="space-y-4 rounded-xl border border-white/10 bg-surface p-4">
        <h3 id="sens-in" className="font-display text-lg text-zinc-100">{c.current}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <GameSelect id="sens-from" label={c.from} value={s.fromId} onChange={s.setFromId} />
          <GameSelect id="sens-to" label={c.to} value={s.toId} onChange={s.setToId} />
          <NumberBox id="sens-value" label={c.sens} value={s.sens} onChange={s.setSens} help={c.sensHelp} error={s.sensError} />
          <NumberBox id="sens-dpi" label={c.dpi} value={s.dpiFrom} onChange={s.setDpiFrom} help={c.dpiHelp} error={s.dpiFromError} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={btnSecondary} onClick={s.swap}>{c.swap}</button>
          <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-100">
            <input type="checkbox" checked={s.dpiChange} onChange={(e) => s.setDpiChange(e.target.checked)} className="h-5 w-5 accent-cyan" />
            {c.dpiChange}
          </label>
        </div>
        {s.dpiChange && (
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberBox id="sens-dpi-to" label={c.newDpi} value={s.dpiTo} onChange={s.setDpiTo} help={c.newDpiHelp} error={s.dpiToError} />
          </div>
        )}
      </section>

      <section aria-labelledby="sens-out" aria-live="polite" className="space-y-4 border-t border-white/10 pt-6">
        <h3 id="sens-out" className="font-display text-lg text-zinc-100">{c.out}</h3>
        {!r ? (
          <p className="text-sm text-zinc-300">{c.fix}</p>
        ) : (
          <>
            <p className="text-base text-zinc-300">
              <span>{r.to.name}</span> {c.sensOf}{" "}
              <strong data-testid="sens-answer" className="font-mono text-3xl text-cyan-400 tabular-nums"><span key={r.sensText}>{r.sensText}</span></strong>
            </p>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-surface p-3"><dt className="text-xs text-zinc-400">{c.turn}</dt><dd className="font-mono text-xl text-zinc-100 tabular-nums" data-testid="sens-cm"><span key={r.cm360}>{roundFor(r.cm360, 2)}</span> cm/360</dd></div>
              <div className="rounded-xl border border-white/10 bg-surface p-3"><dt className="text-xs text-zinc-400">{c.inches}</dt><dd className="font-mono text-xl text-zinc-100 tabular-nums"><span key={r.in360}>{roundFor(r.in360, 2)}</span> in/360</dd></div>
              <div className="rounded-xl border border-white/10 bg-surface p-3"><dt className="text-xs text-zinc-400">{c.edpiBox}</dt><dd className="font-mono text-xl text-zinc-100 tabular-nums"><span key={r.edpiFrom}>{roundFor(r.edpiFrom, 1)}</span> {c.toWord} <span key={`t${r.edpiTo}`}>{roundFor(r.edpiTo, 1)}</span></dd></div>
            </dl>
            <p className="text-xs leading-5 text-zinc-400"><span key={r.to.id}>{c.rounded(r.to.name)}</span> <span key={r.cm360Rounded}>{roundFor(r.cm360Rounded, 2)}</span> {c.roundedTail}</p>
            <div role="region" aria-label={c.tableLabel} tabIndex={0} className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">{c.tableCaption}</caption>
                <thead><tr className="text-zinc-300"><th scope="col" className="px-3 py-2">{c.game}</th><th scope="col" className="px-3 py-2">{c.yaw}</th><th scope="col" className="px-3 py-2">{c.sensCol}</th></tr></thead>
                <tbody>
                  {s.table.map((t) => (
                    <tr key={t.game.id} className="border-t border-white/10">
                      <th scope="row" className="px-3 py-2 font-medium text-zinc-100">{t.game.name}</th>
                      <td className="px-3 py-2 font-mono text-zinc-300 tabular-nums">{t.game.yaw}</td>
                      <td className="px-3 py-2 font-mono text-zinc-100 tabular-nums"><span key={t.text}>{t.text}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <ShareResult payload={s.payload} what={c.what} path={path} lang={lang} />
      </section>

      <EdpiCalculator lang={lang} />

      <section aria-labelledby="sens-src" className="space-y-2 border-t border-white/10 pt-6 text-sm text-zinc-300">
        <h3 id="sens-src" className="font-display text-lg text-zinc-100">{c.srcH(CHECKED)}</h3>
        <ul className="list-disc space-y-2 pl-5">
          {GAMES.map((g) => (
            <li key={g.id}>
              <strong className="text-zinc-100">{g.name}: {g.yaw}.</strong> {lang === "en" ? g.basis : null}{" "}
              {g.sources.map((src, i) => <span key={src.url}>{i > 0 ? " · " : ""}<a href={src.url} className={link} rel="noopener noreferrer" target="_blank">{src.label}</a></span>)}
            </li>
          ))}
        </ul>
        {c.srcNote && <p className="text-xs text-zinc-400">{c.srcNote}</p>}
        <p className="text-xs text-zinc-400">{c.mobile}</p>
      </section>
    </div>
  );
}
