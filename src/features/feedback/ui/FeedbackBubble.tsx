import { forwardRef } from "react";
import { COPY } from "@/features/feedback/copy";

interface Props { open: boolean; onOpen: () => void; nudge: string | null; onDismissNudge: () => void }

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400";

/**
 * The small round button, with the optional one-line nudge beside it. Presentation only. The nudge is animated with CSS transform and
 * opacity (`animate-nudge`) and is static under reduced motion. While the panel is open the bubble is `invisible` (out of the tab order).
 */
const FeedbackBubble = forwardRef<HTMLButtonElement, Props>(function FeedbackBubble({ open, onOpen, nudge, onDismissNudge }, ref) {
  return (
    <div className={`flex items-end justify-end gap-2 ${open ? "invisible" : ""}`}>
      {nudge && (
        <div role="status" className="animate-nudge motion-reduce:animate-none flex max-w-64 items-center gap-1 rounded-xl border border-white/10 bg-surface py-1 pl-3 pr-1 text-sm text-zinc-100">
          <span>{nudge}</span>
          <button type="button" onClick={onDismissNudge} aria-label={COPY.dismissNudge} className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 ${focus}`}>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      )}
      <button ref={ref} type="button" onClick={onOpen} aria-haspopup="dialog" aria-expanded={open} aria-label={COPY.bubbleLabel}
        className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-surface px-4 text-sm font-medium text-zinc-100 transition-colors duration-150 hover:border-white/30 ${focus}`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-cyan-400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" /></svg>
        <span>{COPY.bubbleShort}</span>
      </button>
    </div>
  );
});
export default FeedbackBubble;
