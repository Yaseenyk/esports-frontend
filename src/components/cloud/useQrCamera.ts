"use client";

import { useEffect, useRef, useState } from "react";

/** Opens the rear camera and calls `onCode` for each QR it reads (the same code is ignored for 4 s). jsQR loads only when the camera starts. */
export function useQrCamera(onCode: (code: string) => void) {
  const [state, setState] = useState<"off" | "on" | "error">("off");
  const video = useRef<HTMLVideoElement>(null);
  const last = useRef({ code: "", at: 0 });
  const cb = useRef(onCode); cb.current = onCode;

  useEffect(() => {
    if (state !== "on") return;
    let off = false, timer: ReturnType<typeof setInterval> | undefined, stream: MediaStream | undefined;
    (async () => {
      try {
        const { default: jsQR } = await import("jsqr");
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (off) { stream.getTracks().forEach((t) => t.stop()); return; }
        const v = video.current!; v.srcObject = stream; await v.play();
        const cv = document.createElement("canvas"); const ctx = cv.getContext("2d", { willReadFrequently: true })!;
        timer = setInterval(() => {
          if (document.visibilityState !== "visible" || !v.videoWidth) return; // no scanning while the tab is hidden
          cv.width = v.videoWidth; cv.height = v.videoHeight; ctx.drawImage(v, 0, 0);
          const d = ctx.getImageData(0, 0, cv.width, cv.height);
          const r = jsQR(d.data, d.width, d.height, { inversionAttempts: "dontInvert" });
          if (r?.data && (r.data !== last.current.code || Date.now() - last.current.at > 4000)) { last.current = { code: r.data, at: Date.now() }; cb.current(r.data); }
        }, 250);
      } catch { setState("error"); }
    })();
    return () => { off = true; if (timer) clearInterval(timer); stream?.getTracks().forEach((t) => t.stop()); };
  }, [state]);

  return { state, setState, video };
}
