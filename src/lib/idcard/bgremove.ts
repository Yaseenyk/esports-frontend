/**
 * Removes the background from a photo, in the browser, with a small open model (MODNet, Apache-2.0) run through transformers.js.
 * The first use downloads the model once (a few tens of MB) and then it is cached by the browser. The photo is never uploaded.
 */
type Pipe = (input: string) => Promise<unknown>;
let pipeP: Promise<Pipe> | null = null;

export async function removeBackground(photo: Blob, onStatus?: (s: string) => void): Promise<Blob> {
  if (!pipeP) {
    pipeP = (async () => {
      // Loaded from a CDN at run time (pinned version) instead of being bundled: the library brings its own WebAssembly runtime,
      // which the site build cannot package, and this keeps the page itself light.
      const url = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2/dist/transformers.min.js";
      const t = (await import(/* webpackIgnore: true */ url)) as unknown as {
        env: { allowLocalModels: boolean };
        pipeline: (task: string, model: string, opts: unknown) => Promise<unknown>;
      };
      t.env.allowLocalModels = false;
      const p = await t.pipeline("background-removal", "Xenova/modnet", {
        progress_callback: (e: { status?: string; progress?: number; file?: string }) => {
          if (e.status === "progress" && typeof e.progress === "number") onStatus?.(`Downloading the model ${Math.round(e.progress)}%`);
        },
      });
      return p as unknown as Pipe;
    })();
    pipeP.catch(() => { pipeP = null; }); // let a later try start fresh
  }
  const pipe = await pipeP;
  onStatus?.("Cutting out the person…");
  const url = URL.createObjectURL(photo);
  try {
    const out = (await pipe(url)) as unknown;
    const img = (Array.isArray(out) ? out[0] : out) as { toBlob?: (type?: string) => Promise<Blob>; toCanvas?: () => HTMLCanvasElement };
    if (img.toBlob) return await img.toBlob("image/png");
    if (img.toCanvas) { const cv = img.toCanvas(); return await new Promise<Blob>((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error("no output"))), "image/png")); }
    throw new Error("Unexpected result from the background remover");
  } finally { URL.revokeObjectURL(url); }
}
