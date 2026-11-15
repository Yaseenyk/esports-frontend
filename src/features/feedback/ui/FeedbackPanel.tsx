import { forwardRef } from "react";
import { COPY, KINDS, fill } from "@/features/feedback/copy";
import { CONTACT_MAX, MESSAGE_MAX, MESSAGE_MIN } from "@/features/feedback/config";
import type { ConvState, Line } from "@/features/feedback/hooks/conversation";
import { messageLength } from "@/features/feedback/hooks/conversation";
import type { FeedbackKind } from "@/features/feedback/domain";

export interface PanelView {
  state: ConvState;
  history: Line[];
  prompt: string;
  signedIn: boolean;
  maxShots: number;
  canCapture: boolean;
  captureNote: string;
  shotsFull: boolean;
  allowWithdraw: boolean;
  hidden: boolean;
  errorCount: number;
  viewport: string;
  accountLabel: string;
  title?: string;
}
export interface PanelHandlers {
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onKind: (k: FeedbackKind) => void;
  onMessage: (t: string) => void;
  onPath: (t: string) => void;
  onContact: (t: string) => void;
  onAccount: (on: boolean) => void;
  onErrorsTick: (on: boolean) => void;
  onConsent: (on: boolean) => void;
  onFiles: (f: File[]) => void;
  onRemoveShot: (id: string) => void;
  onCapture: () => void;
  onSend: () => void;
  onRetryUpload: () => void;
  onFinishWithout: () => void;
  onWithdraw: () => void;
  onAnother: () => void;
}

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400";
const primary = `inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-ink disabled:opacity-60 ${focus}`;
const secondary = `inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 text-sm text-zinc-100 hover:border-white/30 ${focus}`;
const danger = `inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 text-sm text-danger hover:border-white/30 ${focus}`;
const field = `block w-full rounded-lg border border-white/10 bg-surface p-3 text-base text-zinc-100 placeholder:text-zinc-400 ${focus}`;
const label = "mb-1 block text-sm font-medium text-zinc-100";
const help = "mt-1 text-xs text-zinc-400";
const checkRow = "flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm text-zinc-100";

const Err = ({ id, text }: { id: string; text?: string }) => (text ? <p id={id} role="alert" className="mt-1 text-sm text-danger"><span aria-hidden="true">! </span>{text}</p> : null);

/**
 * The chat panel. Presentation only: everything arrives as props. A modal dialog (focus is trapped by the parent), the bot's current
 * line sits in an `aria-live="polite"` region, and there is a hidden decoy field (never focusable, never read) as a honeypot.
 */
const FeedbackPanel = forwardRef<HTMLDivElement, { v: PanelView; h: PanelHandlers }>(function FeedbackPanel({ v, h }, ref) {
  const s = v.state;
  const form = ["kind", "message", "page", "shots", "contact", "review"].includes(s.step);
  const readyShots = s.shots.filter((x) => x.status === "ready");
  const n = messageLength(s.message);

  return (
    <div className={`pointer-events-none fixed inset-0 z-dialog flex items-end justify-center p-2 sm:justify-end sm:p-6 no-print ${v.hidden ? "invisible" : ""}`} style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="eh-fb-title" className="pointer-events-auto flex max-h-full w-full flex-col rounded-xl border border-white/10 bg-surface text-zinc-100 sm:w-96">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 py-1 pl-4 pr-1">
          <h2 id="eh-fb-title" className="font-display text-lg text-zinc-100">{COPY.panelTitle}</h2>
          <button type="button" onClick={h.onClose} aria-label={COPY.close} className={`inline-flex h-11 w-11 items-center justify-center rounded-lg text-zinc-300 hover:text-zinc-100 ${focus}`}>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {v.history.length > 0 && (
            <ul className="space-y-2 text-sm">
              {v.history.map((l, i) => <li key={i} className={l.from === "bot" ? "text-zinc-400" : "border-l-2 border-cyan-400 pl-3 text-zinc-100"}>{l.text}</li>)}
            </ul>
          )}
          <div aria-live="polite" className="text-base text-zinc-100"><p>{v.prompt}</p></div>
          {s.notice && <p role="alert" className="text-sm text-danger"><span aria-hidden="true">! </span>{s.notice}</p>}

          {s.step === "greeting" && <button type="button" data-autofocus onClick={h.onNext} className={primary}>Start</button>}

          {s.step === "kind" && (
            <fieldset>
              <legend className="sr-only">{COPY.kindQuestion}</legend>
              <div className="space-y-1">
                {KINDS.map((k, i) => (
                  <label key={k.id} className={checkRow}>
                    <input type="radio" name="eh-fb-kind" value={k.id} checked={s.kind === k.id} onChange={() => h.onKind(k.id)} data-autofocus={s.kind ? (s.kind === k.id ? "" : undefined) : i === 0 ? "" : undefined} className={`mt-1 h-5 w-5 accent-cyan-400 ${focus}`} aria-describedby={s.errors.kind ? "eh-fb-kind-err" : undefined} />
                    <span><span className="block">{k.label}</span><span className="block text-xs text-zinc-400">{k.hint}</span></span>
                  </label>
                ))}
              </div>
              <Err id="eh-fb-kind-err" text={s.errors.kind} />
            </fieldset>
          )}

          {s.step === "message" && (
            <div>
              <label htmlFor="eh-fb-msg" className={label}>{COPY.messageLabel}</label>
              <textarea id="eh-fb-msg" data-autofocus rows={5} value={s.message} onChange={(e) => h.onMessage(e.target.value)} className={field} aria-describedby="eh-fb-msg-help eh-fb-msg-count" aria-invalid={s.errors.message ? true : undefined} />
              <p id="eh-fb-msg-count" className={`mt-1 text-xs ${n >= MESSAGE_MIN && s.message.length <= MESSAGE_MAX ? "text-zinc-400" : "text-zinc-300"}`}>{fill(COPY.count, { n: s.message.length, max: MESSAGE_MAX })} (at least {MESSAGE_MIN})</p>
              <p id="eh-fb-msg-help" className={help}>{COPY.messageHelp} {COPY.messageWarning}</p>
              <Err id="eh-fb-msg-err" text={s.errors.message} />
            </div>
          )}

          {s.step === "page" && (
            <div>
              <label htmlFor="eh-fb-path" className={label}>{COPY.pageLabel}</label>
              <input id="eh-fb-path" data-autofocus type="text" inputMode="url" autoComplete="off" spellCheck={false} value={s.path} onChange={(e) => h.onPath(e.target.value)} className={`${field} font-mono`} aria-describedby="eh-fb-path-help" aria-invalid={s.errors.path ? true : undefined} />
              <p id="eh-fb-path-help" className={help}>{COPY.pageHelp}</p>
              <Err id="eh-fb-path-err" text={s.errors.path} />
            </div>
          )}

          {s.step === "shots" && (
            <div>
              <p className={help}>{fill(COPY.shotsHelp, { max: v.maxShots })}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <label data-testid="eh-fb-pick" className={`${secondary} cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cyan-400 ${v.shotsFull ? "opacity-60" : ""}`}>
                  <span>{COPY.shotsPick}</span>
                  <input data-autofocus type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={v.shotsFull} className="sr-only" onChange={(e) => { h.onFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
                </label>
                {v.canCapture && <button type="button" onClick={h.onCapture} disabled={v.shotsFull} className={secondary}>{COPY.shotsCapture}</button>}
              </div>
              <p className={help}>{COPY.shotsPaste}{v.canCapture ? ` ${COPY.shotsCaptureHelp}` : ""}</p>
              {v.captureNote && <p role="alert" className="mt-1 text-sm text-danger"><span aria-hidden="true">! </span>{v.captureNote}</p>}
              {s.shots.length > 0 && (
                <ul className="mt-3 space-y-2" aria-live="polite">
                  {s.shots.map((x) => (
                    <li key={x.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate">{x.name}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        {x.status === "working" && <span className="text-zinc-400">{COPY.shotWorking}</span>}
                        {x.status === "ready" && <span className="text-success"><span aria-hidden="true">+ </span>{fill(COPY.shotReady, { kb: `${Math.max(1, Math.round((x.size ?? 0) / 1024))} KB` })}</span>}
                        {x.status === "error" && <span className="text-danger"><span aria-hidden="true">! </span>{x.error ?? COPY.shotErr}</span>}
                        <button type="button" onClick={() => h.onRemoveShot(x.id)} aria-label={`${COPY.remove} ${x.name}`} className={secondary}>{COPY.remove}</button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Err id="eh-fb-shots-err" text={s.errors.shots} />
            </div>
          )}

          {s.step === "contact" && (
            <div>
              <label htmlFor="eh-fb-contact" className={label}>{COPY.contactLabel}</label>
              <input id="eh-fb-contact" data-autofocus type="text" autoComplete="off" value={s.contact} onChange={(e) => h.onContact(e.target.value)} className={field} aria-describedby="eh-fb-contact-help" aria-invalid={s.errors.contact ? true : undefined} maxLength={CONTACT_MAX + 80} />
              <p id="eh-fb-contact-help" className={help}>{COPY.contactHelp}</p>
              <Err id="eh-fb-contact-err" text={s.errors.contact} />
            </div>
          )}

          {s.step === "review" && (
            <div>
              <h3 tabIndex={-1} data-autofocus className="font-display text-base text-zinc-100">{COPY.summaryHeading}</h3>
              <dl className="mt-2 space-y-2 text-sm">
                <Row k={COPY.summary.kind} v={KINDS.find((x) => x.id === s.kind)?.label ?? ""} />
                <Row k={COPY.summary.message} v={s.message.trim()} wrap />
                <Row k={COPY.summary.page} v={s.path} mono />
                {v.title && s.path === s.detectedPath && <Row k={COPY.summary.title} v={v.title} />}
                <Row k={COPY.summary.screen} v={v.viewport} />
                <Row k={COPY.summary.shots} v={readyShots.length ? `${readyShots.length}` : COPY.summary.none} />
                <Row k={COPY.summary.contact} v={s.contact.trim() || COPY.summary.none} />
                <Row k={COPY.summary.account} v={s.includeAccount && v.signedIn ? COPY.summary.sent : COPY.summary.notSent} />
                <Row k={COPY.summary.errors} v={s.includeErrors && v.errorCount ? `${v.errorCount}` : COPY.summary.none} />
              </dl>
              <div className="mt-3 border-t border-white/10 pt-2">
                <label className={checkRow}>
                  <input type="checkbox" checked={s.includeErrors} onChange={(e) => h.onErrorsTick(e.target.checked)} className={`mt-1 h-5 w-5 accent-cyan-400 ${focus}`} />
                  <span><span className="block">{COPY.includeErrors}</span><span className="block text-xs text-zinc-400">{COPY.includeErrorsHelp}</span></span>
                </label>
                {v.signedIn ? (
                  <label className={checkRow}>
                    <input type="checkbox" checked={s.includeAccount} onChange={(e) => h.onAccount(e.target.checked)} className={`mt-1 h-5 w-5 accent-cyan-400 ${focus}`} />
                    <span><span className="block">{COPY.includeAccount}</span><span className="block text-xs text-zinc-400">{COPY.includeAccountHelp}</span></span>
                  </label>
                ) : <p className={help}>{COPY.noteNoAccount}</p>}
                <label className={checkRow}>
                  <input type="checkbox" checked={s.consent} onChange={(e) => h.onConsent(e.target.checked)} aria-describedby={s.errors.consent ? "eh-fb-consent-err" : undefined} className={`mt-1 h-5 w-5 accent-cyan-400 ${focus}`} />
                  <span>{COPY.consent}</span>
                </label>
                <Err id="eh-fb-consent-err" text={s.errors.consent} />
                <p className="text-sm"><a href="/privacy/#feedback" target="_blank" rel="noopener" className={`inline-flex min-h-11 items-center text-cyan-400 underline underline-offset-2 ${focus}`}>{COPY.privacyLink} (new tab)</a></p>
              </div>
              <Err id="eh-fb-review-err" text={s.errors.message || s.errors.path || s.errors.kind || s.errors.contact} />
            </div>
          )}

          {s.step === "sending" && <p className="text-sm text-zinc-400" role="status">{COPY.sending}</p>}

          {(s.step === "done" || s.step === "partial" || s.step === "withdrawn") && (
            <div className="space-y-3">
              {s.step === "done" && <p className="text-sm text-zinc-300">{COPY.thanksBody}</p>}
              {s.step === "partial" && <p className="text-sm text-zinc-300">{COPY.partialBody}</p>}
              {s.step === "partial" && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" data-autofocus onClick={h.onRetryUpload} className={primary}>{COPY.retryUpload}</button>
                  <button type="button" onClick={h.onFinishWithout} className={secondary}>{COPY.finishWithout}</button>
                </div>
              )}
              {v.allowWithdraw && (s.step === "done" || s.step === "partial") && (
                <div>
                  <button type="button" onClick={h.onWithdraw} disabled={s.withdrawing} className={danger}>{s.withdrawing ? COPY.withdrawing : COPY.withdraw}</button>
                  <p className={help}>{COPY.withdrawNote}</p>
                </div>
              )}
              {(s.step === "done" || s.step === "withdrawn") && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" data-autofocus onClick={h.onAnother} className={secondary}>{COPY.another}</button>
                  <button type="button" onClick={h.onClose} className={secondary}>{COPY.closeThanks}</button>
                </div>
              )}
            </div>
          )}

          {/* Honeypot: a decoy for bots. Hidden from sight and from assistive tech, never reachable by keyboard, and the widget always sends it empty. */}
          <div aria-hidden="true" className="sr-only"><input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" /></div>
        </div>

        {form && (
          <div className="flex items-center justify-between gap-2 border-t border-white/10 p-3">
            {s.step !== "greeting" ? <button type="button" onClick={h.onBack} className={secondary}>{COPY.back}</button> : <span />}
            <div className="flex gap-2">
              {(s.step === "shots" || s.step === "contact") && <button type="button" onClick={h.onSkip} className={secondary}>{COPY.skip}</button>}
              {s.step === "review" ? <button type="button" onClick={h.onSend} className={primary}>{COPY.send}</button> : <button type="button" onClick={h.onNext} className={primary}>{COPY.next}</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

function Row({ k, v, mono, wrap }: { k: string; v: string; mono?: boolean; wrap?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/10 pb-2 last:border-b-0">
      <dt className="text-xs text-zinc-400">{k}</dt>
      <dd className={`${mono ? "font-mono" : ""} ${wrap ? "whitespace-pre-line break-words" : "break-all"} text-zinc-100`}>{v}</dd>
    </div>
  );
}

export default FeedbackPanel;
