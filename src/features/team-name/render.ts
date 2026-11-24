/** Browser-only: turns the badge SVG into a PNG on a canvas. Nothing is uploaded. */
export async function svgToPng(svg: string, size = 1024): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error("The badge could not be drawn in this browser.")); im.src = url; });
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const g = canvas.getContext("2d");
    if (!g) throw new Error("The badge could not be drawn in this browser.");
    g.drawImage(img, 0, 0, size, size);
    return await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("The badge could not be saved in this browser."))), "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}
