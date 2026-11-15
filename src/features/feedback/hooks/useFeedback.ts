"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useSession } from "@/components/cloud/useSession";
import { checkInput, kb } from "@/features/disputes/evidence";
import { compressImage } from "@/features/disputes/image-canvas";
import { COPY, fill } from "@/features/feedback/copy";
import type { FeedbackCode, FeedbackKind, FeedbackStatus } from "@/features/feedback/domain";
import { canWithdraw, initialState, reduce } from "@/features/feedback/hooks/conversation";
import { recentErrors } from "@/features/feedback/hooks/error-capture";
import { cleanPath } from "@/features/feedback/hooks/path";
import { captureScreen, canCaptureScreen } from "@/features/feedback/services/capture";
import { createReport, uploadShot, withdrawReport } from "@/features/feedback/services/feedback.api";
import { buildReportBody } from "@/features/feedback/services/request";

/** The conversation for one open panel: the pure state machine plus the calls it needs. The draft lives in memory only. */
export function useFeedback(status: FeedbackStatus, pathname: string) {
  const session = useSession();
  const [state, dispatch] = useReducer((s: ReturnType<typeof initialState>, a: Parameters<typeof reduce>[1]) => reduce(s, a, typeof location === "undefined" ? undefined : location.origin), pathname, initialState);
  const blobs = useRef(new Map<string, Blob>());
  const seq = useRef(0);
  const [now, setNow] = useState(() => Date.now());
  const [hidden, setHidden] = useState(false); // the panel hides itself for the instant a screen picture is taken
  const [captureNote, setCaptureNote] = useState("");
  const live = useRef(state); live.current = state;

  // Keep the auto-detected path fresh until the visitor starts answering.
  useEffect(() => { dispatch({ type: "start", path: pathname }); }, [pathname]);

  // One tick when the withdraw window closes, so the button disappears by itself.
  useEffect(() => {
    if (!state.report) return;
    const left = state.report.expiresAt - Date.now();
    if (left <= 0) { setNow(Date.now()); return; }
    const t = setTimeout(() => setNow(Date.now()), left + 50);
    return () => clearTimeout(t);
  }, [state.report]);

  const room = () => Math.max(0, status.maxAttachments - live.current.shots.filter((x) => x.status !== "error").length);

  const addFiles = useCallback(async (files: File[]) => {
    for (const f of files) {
      const id = `s${++seq.current}`;
      const problem = checkInput(f);
      if (problem) { dispatch({ type: "shotAdd", shot: { id, name: f.name || "image", status: "error", error: problem } }); continue; }
      if (room() <= 0) { dispatch({ type: "shotAdd", shot: { id, name: f.name || "image", status: "error", error: fill(COPY.shotMax, { max: status.maxAttachments }) } }); continue; }
      dispatch({ type: "shotAdd", shot: { id, name: f.name || "image", status: "working" } });
      const r = await compressImage(f, status.maxAttachmentBytes);
      if (r.ok) { blobs.current.set(id, r.blob); dispatch({ type: "shotPatch", id, patch: { status: "ready", size: r.blob.size } }); }
      else dispatch({ type: "shotPatch", id, patch: { status: "error", error: r.reason === "too_big" ? COPY.errors.too_big : COPY.errors.bad_image } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.maxAttachments, status.maxAttachmentBytes]);

  const removeShot = useCallback((id: string) => { blobs.current.delete(id); dispatch({ type: "shotRemove", id }); }, []);

  const capture = useCallback(async () => {
    setCaptureNote("");
    if (!canCaptureScreen()) { setCaptureNote(COPY.captureUnsupported); return; }
    const f = await captureScreen(() => setHidden(true), () => setHidden(false));
    if (!f) { setCaptureNote(COPY.captureFailed); return; }
    await addFiles([f]);
  }, [addFiles]);

  const send = useCallback(async () => {
    const s = live.current;
    dispatch({ type: "sendStart" });
    const errs = reduce(s, { type: "sendStart" }, location.origin);
    if (errs.step !== "sending" || !s.kind) return;
    const withAccount = s.includeAccount && !!session;
    const edited = s.path !== s.detectedPath;
    const body = buildReportBody({
      kind: s.kind as FeedbackKind, message: s.message, path: cleanPath(s.path), title: edited ? undefined : document.title,
      viewport: { w: window.innerWidth, h: window.innerHeight }, locale: navigator.language,
      errors: s.includeErrors ? recentErrors() : undefined, contact: s.contact, includeAccount: withAccount,
    }, status.consentVersion);
    const r = await createReport(body, withAccount);
    if (!r.ok) { dispatch({ type: "sendFailed", code: r.failure.code, max: status.maxAttachments }); return; }
    dispatch({ type: "created", id: r.data.id, token: r.data.attachToken, expiresInSeconds: r.data.attachExpiresIn, now: Date.now() });
    await uploadAll(r.data.id, r.data.attachToken, s.shots.filter((x) => x.status === "ready").map((x) => x.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  /** Uploads the given screenshots one by one. A failure never loses the report: it is already created. */
  const uploadAll = useCallback(async (reportId: string, token: string, ids: string[]) => {
    const uploaded: string[] = []; const failed: string[] = [];
    let code: FeedbackCode | undefined;
    for (const id of ids) {
      const blob = blobs.current.get(id);
      if (!blob) { failed.push(id); continue; }
      const r = await uploadShot(reportId, token, blob);
      if (r.ok) uploaded.push(id); else { failed.push(id); code = r.failure.code; }
    }
    dispatch({ type: "uploadResult", uploaded, failed, code, max: status.maxAttachments });
  }, [status.maxAttachments]);

  const retryUpload = useCallback(async () => {
    const s = live.current;
    if (!s.report) return;
    dispatch({ type: "retryStart" });
    await uploadAll(s.report.id, s.report.token, s.uploadFailed);
  }, [uploadAll]);

  const withdraw = useCallback(async () => {
    const s = live.current;
    if (!s.report) return;
    dispatch({ type: "withdrawStart" });
    const r = await withdrawReport(s.report.id, s.report.token);
    if (r.ok) { blobs.current.clear(); dispatch({ type: "withdrawn" }); } else dispatch({ type: "withdrawFailed", code: r.failure.code });
  }, []);

  const reset = useCallback((path: string) => { blobs.current.clear(); dispatch({ type: "reset", path }); }, []);

  return useMemo(() => ({
    state, dispatch, signedIn: !!session, now, hidden, captureNote, canCapture: canCaptureScreen(), kb,
    allowWithdraw: canWithdraw(state, now), addFiles, removeShot, capture, send, retryUpload, withdraw, reset,
    shotsFull: room() <= 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state, session, now, hidden, captureNote, addFiles, removeShot, capture, send, retryUpload, withdraw, reset]);
}
