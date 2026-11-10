/** Tiny, dependency-free file download helpers, kept apart from export.ts so pages that only save a file do not load the PDF and image libraries. */
export const download = (href: string, name: string) => { const a = document.createElement("a"); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
export const downloadBlob = (blob: Blob, name: string) => { const u = URL.createObjectURL(blob); download(u, name); setTimeout(() => URL.revokeObjectURL(u), 4000); };
