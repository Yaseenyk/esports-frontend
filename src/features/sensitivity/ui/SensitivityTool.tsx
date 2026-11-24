"use client";

import { Field, describedBy } from "@/features/shared/ui/Fields";
import { btnSecondary, input, link } from "@/features/shared/ui/styles";
import { CHECKED, GAMES, MAX_DPI, MIN_DPI, roundFor } from "@/features/sensitivity/domain";
import { useSensitivity } from "@/features/sensitivity/hooks/useSensitivity";
import ShareResult from "@/features/share-result/ui/ShareResult";

const PATH = "/tools/sensitivity-converter/";
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

/**
 * Mouse sensitivity converter for PC games: game A sensitivity and DPI in, game B sensitivity out, with cm/360 and inches/360.
 * Everything is worked out in the browser. Changing numbers sit in their own elements so a translated page keeps working.
 */
export default function SensitivityTool() {
  const s = useSensitivity();
  const r = s.check.ok ? s.check.result : null;
  return (
    <div className="space-y-6">
      <section aria-labelledby="sens-in" className="space-y-4 rounded-xl border border-white/10 bg-surface p-4">
        <h3 id="sens-in" className="font-display text-lg text-zinc-100">Your current setting</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <GameSelect id="sens-from" label="From game" value={s.fromId} onChange={s.setFromId} />
          <GameSelect id="sens-to" label="To game" value={s.toId} onChange={s.setToId} />
          <NumberBox id="sens-value" label="Your sensitivity in the first game" value={s.sens} onChange={s.setSens} help="The number in the game's mouse settings, for example 0.4." error={s.sensError} />
          <NumberBox id="sens-dpi" label="Mouse DPI" value={s.dpiFrom} onChange={s.setDpiFrom} help={`From ${MIN_DPI} to ${MAX_DPI}. 400, 800 and 1600 are common.`} error={s.dpiFromError} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={btnSecondary} onClick={s.swap}>Swap the games</button>
          <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-100">
            <input type="checkbox" checked={s.dpiChange} onChange={(e) => s.setDpiChange(e.target.checked)} className="h-5 w-5 accent-cyan" />
            I am changing my mouse DPI too
          </label>
        </div>
        {s.dpiChange && (
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberBox id="sens-dpi-to" label="New mouse DPI" value={s.dpiTo} onChange={s.setDpiTo} help="The answer keeps the same hand movement for a full turn at this DPI." error={s.dpiToError} />
          </div>
        )}
      </section>

      <section aria-labelledby="sens-out" aria-live="polite" className="space-y-4 border-t border-white/10 pt-6">
        <h3 id="sens-out" className="font-display text-lg text-zinc-100">Your setting in the other game</h3>
        {!r ? (
          <p className="text-sm text-zinc-300">Fix the box marked above to see the answer.</p>
        ) : (
          <>
            <p className="text-base text-zinc-300">
              <span>{r.to.name}</span> sensitivity:{" "}
              <strong data-testid="sens-answer" className="font-mono text-3xl text-cyan-400 tabular-nums"><span key={r.sensText}>{r.sensText}</span></strong>
            </p>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-surface p-3"><dt className="text-xs text-zinc-400">Distance for a full turn</dt><dd className="font-mono text-xl text-zinc-100 tabular-nums" data-testid="sens-cm"><span key={r.cm360}>{roundFor(r.cm360, 2)}</span> cm/360</dd></div>
              <div className="rounded-xl border border-white/10 bg-surface p-3"><dt className="text-xs text-zinc-400">In inches</dt><dd className="font-mono text-xl text-zinc-100 tabular-nums"><span key={r.in360}>{roundFor(r.in360, 2)}</span> in/360</dd></div>
              <div className="rounded-xl border border-white/10 bg-surface p-3"><dt className="text-xs text-zinc-400">eDPI (sensitivity x DPI)</dt><dd className="font-mono text-xl text-zinc-100 tabular-nums"><span key={r.edpiFrom}>{roundFor(r.edpiFrom, 1)}</span> to <span key={`t${r.edpiTo}`}>{roundFor(r.edpiTo, 1)}</span></dd></div>
            </dl>
            <p className="text-xs leading-5 text-zinc-400">Rounded to the decimals {r.to.name} takes. The rounded value gives <span key={r.cm360Rounded}>{roundFor(r.cm360Rounded, 2)}</span> cm/360. eDPI is only comparable between games with the same yaw.</p>
            <div role="region" aria-label="The same setting in every listed game" tabIndex={0} className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">The same feel in every listed game</caption>
                <thead><tr className="text-zinc-300"><th scope="col" className="px-3 py-2">Game</th><th scope="col" className="px-3 py-2">Yaw</th><th scope="col" className="px-3 py-2">Sensitivity</th></tr></thead>
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
        <ShareResult payload={s.payload} what="sensitivity" path={PATH} />
      </section>

      <section aria-labelledby="sens-src" className="space-y-2 border-t border-white/10 pt-6 text-sm text-zinc-300">
        <h3 id="sens-src" className="font-display text-lg text-zinc-100">Where the yaw numbers come from (checked {CHECKED})</h3>
        <ul className="list-disc space-y-2 pl-5">
          {GAMES.map((g) => (
            <li key={g.id}>
              <strong className="text-zinc-100">{g.name}: {g.yaw}.</strong> {g.basis}{" "}
              {g.sources.map((src, i) => <span key={src.url}>{i > 0 ? " · " : ""}<a href={src.url} className={link} rel="noopener noreferrer" target="_blank">{src.label}</a></span>)}
            </li>
          ))}
        </ul>
        <p className="text-xs text-zinc-400">Mobile games (BGMI, Free Fire, Call of Duty: Mobile) are not in the list on purpose: their touch and gyro settings have no published value that maps to mouse counts, so any conversion would be a guess.</p>
      </section>
    </div>
  );
}
