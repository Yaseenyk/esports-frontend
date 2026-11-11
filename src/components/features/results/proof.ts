import { PROOF_ATTEMPTS, checkProofDataUrl, checkProofFile, fitWidth } from "@/lib/results";

/**
 * Turns a picked screenshot into a small JPEG data URL (at most 200,000 characters, the server's limit). Throws an Error with a plain message
 * when the file is not a picture the browser can read or cannot be made small enough. Runs in the browser only.
 */
export async function proofFromFile(file: File): Promise<string> {
  const ok = checkProofFile(file.type, file.size);
  if (!ok.ok) throw new Error(ok.message);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error("That picture could not be read. Try a PNG or JPEG screenshot."));
      im.src = url;
    });
    for (const a of PROOF_ATTEMPTS) {
      const { w, h } = fitWidth(img.naturalWidth, img.naturalHeight, a.width);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const g = canvas.getContext("2d");
      if (!g) throw new Error("Your browser cannot shrink pictures here. Try another browser.");
      g.fillStyle = "#ffffff"; // a JPEG has no transparency
      g.fillRect(0, 0, w, h);
      g.drawImage(img, 0, 0, w, h);
      const data = canvas.toDataURL("image/jpeg", a.quality);
      if (checkProofDataUrl(data).ok) return data;
    }
    throw new Error("This picture is too detailed to shrink under 200 KB. Take a screenshot of just the scoreboard instead.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
