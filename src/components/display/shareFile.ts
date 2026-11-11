import { downloadBlob } from "@/lib/idcard/download";

/**
 * Hands a picture to the phone's share sheet (WhatsApp, Instagram and so on) when the device can share files, otherwise saves it.
 * Only touch screens use the share sheet; on a computer a saved file is what people expect.
 */
export async function shareOrDownload(blob: Blob, filename: string, title: string): Promise<"shared" | "downloaded" | "cancelled"> {
  try {
    const file = new File([blob], filename, { type: "image/png" });
    const phone = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
    if (phone && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] }) && typeof navigator.share === "function") {
      try { await navigator.share({ files: [file], title }); return "shared"; } catch (e) { if ((e as { name?: string }).name === "AbortError") return "cancelled"; /* otherwise fall back to saving it */ }
    }
  } catch { /* File or share not available: save instead */ }
  downloadBlob(blob, filename);
  return "downloaded";
}
