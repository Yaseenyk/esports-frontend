/** Browser adapters for getting an image: the screen-capture picture and the clipboard. No rules live here. */

export const canCaptureScreen = (): boolean => typeof navigator !== "undefined" && !!navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === "function";

const frames = (n: number) => new Promise<void>((ok) => { const step = (i: number) => (i <= 0 ? ok() : requestAnimationFrame(() => step(i - 1))); step(n); });

/**
 * Takes ONE picture of the screen, window or tab the visitor picks in the browser's own dialog, then stops sharing at once.
 * `beforeGrab` lets the caller hide the panel so it is not in the picture. Returns null when the visitor cancels or it fails.
 */
export async function captureScreen(beforeGrab?: () => Promise<void> | void, afterGrab?: () => void): Promise<File | null> {
  if (!canCaptureScreen()) return null;
  let stream: MediaStream | null = null;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    const video = document.createElement("video");
    video.muted = true; video.srcObject = stream;
    await video.play();
    await beforeGrab?.();
    await frames(3);
    await new Promise((r) => setTimeout(r, 250));
    const w = video.videoWidth, h = video.videoHeight;
    if (!w || !h) return null;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d")?.drawImage(video, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/png"));
    return blob ? new File([blob], "screen.png", { type: "image/png" }) : null;
  } catch { return null; } finally {
    stream?.getTracks().forEach((t) => t.stop());
    afterGrab?.();
  }
}

/** Images on the clipboard of a paste event. */
export function imagesFromPaste(e: ClipboardEvent): File[] {
  const out: File[] = [];
  for (const it of Array.from(e.clipboardData?.items ?? [])) { if (it.kind === "file" && it.type.startsWith("image/")) { const f = it.getAsFile(); if (f) out.push(f); } }
  return out;
}
