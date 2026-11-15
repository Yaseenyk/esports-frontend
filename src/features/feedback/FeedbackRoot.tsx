"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { COPY } from "@/features/feedback/copy";
import type { FeedbackStatus } from "@/features/feedback/domain";
import { currentPrompt, transcript } from "@/features/feedback/hooks/conversation";
import { recentErrors } from "@/features/feedback/hooks/error-capture";
import { useFeedback } from "@/features/feedback/hooks/useFeedback";
import { useDialogFocus, useFullscreen, useNudge, useProbe, useStepFocus } from "@/features/feedback/hooks/useWidget";
import { imagesFromPaste } from "@/features/feedback/services/capture";
import FeedbackBubble from "@/features/feedback/ui/FeedbackBubble";
import FeedbackPanel from "@/features/feedback/ui/FeedbackPanel";

/** The mounted widget. Draws nothing until the API says feedback is on, and nothing while something is fullscreen. */
export default function FeedbackRoot({ pathname }: { pathname: string }) {
  const probe = useProbe();
  const full = useFullscreen();
  if (!probe || !probe.on || full) return null;
  return <Widget status={probe.status} pathname={pathname} />;
}

function Widget({ status, pathname }: { status: FeedbackStatus; pathname: string }) {
  const [open, setOpen] = useState(false);
  const f = useFeedback(status, pathname);
  const bubble = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { line, dismiss } = useNudge(pathname, open);
  const s = f.state;

  const close = useCallback(() => setOpen(false), []);
  const openIt = useCallback(() => {
    // A finished or withdrawn report starts fresh next time; a draft in progress is kept (in memory only).
    if ((f.state.step === "withdrawn") || (f.state.step === "done" && !f.allowWithdraw)) f.reset(pathname);
    setOpen(true);
  }, [f, pathname]);

  useDialogFocus(panel, bubble, open, close);
  useStepFocus(panel, s.step, open);

  // Paste an image while the screenshot step is showing.
  useEffect(() => {
    if (!open || s.step !== "shots") return;
    const on = (e: ClipboardEvent) => { const files = imagesFromPaste(e); if (files.length) { e.preventDefault(); void f.addFiles(files); } };
    document.addEventListener("paste", on);
    return () => document.removeEventListener("paste", on);
  }, [open, s.step, f]);

  const d = f.dispatch;
  return (
    <>
      {/* Phones: 9rem up. The studio's step bar (66 px tall) can end up 64 px above the screen bottom at the end of a page, so anything lower would cover it. */}
      <div className="no-print fixed bottom-36 right-4 z-40 sm:bottom-6 sm:right-6" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <FeedbackBubble ref={bubble} open={open} onOpen={openIt} nudge={open ? null : line} onDismissNudge={dismiss} />
      </div>
      {open && (
        <FeedbackPanel ref={panel}
          v={{
            state: s, history: s.step === "greeting" ? [] : transcript(s), prompt: currentPrompt(s), signedIn: f.signedIn, maxShots: status.maxAttachments, canCapture: f.canCapture, captureNote: f.captureNote,
            shotsFull: f.shotsFull, allowWithdraw: f.allowWithdraw, hidden: f.hidden, errorCount: recentErrors().length, viewport: `${window.innerWidth} x ${window.innerHeight}`, accountLabel: COPY.includeAccount, title: document.title,
          }}
          h={{
            onClose: close, onNext: () => d({ type: "next" }), onBack: () => d({ type: "back" }), onSkip: () => d({ type: "skip" }), onKind: (k) => d({ type: "kind", kind: k }),
            onMessage: (t) => d({ type: "message", text: t }), onPath: (t) => d({ type: "path", text: t }), onContact: (t) => d({ type: "contact", text: t }),
            onAccount: (on) => d({ type: "account", on }), onErrorsTick: (on) => d({ type: "errorsTick", on }), onConsent: (on) => d({ type: "consent", on }),
            onFiles: (files) => void f.addFiles(files), onRemoveShot: f.removeShot, onCapture: () => void f.capture(), onSend: () => void f.send(), onRetryUpload: () => void f.retryUpload(),
            onFinishWithout: () => d({ type: "finishWithout" }), onWithdraw: () => void f.withdraw(), onAnother: () => f.reset(pathname),
          }} />
      )}
    </>
  );
}
