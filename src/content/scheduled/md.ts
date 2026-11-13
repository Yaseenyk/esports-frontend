import type { Block } from "../guides";

/** Turns the compact text of a section into the guide page's blocks. Inline links stay as [text](/path/). */
export function mdToBlocks(md: string): Block[] {
  const out: Block[] = [];
  const chunks = md.trim().split(/\n\s*\n/);
  for (const raw of chunks) {
    const lines = raw.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim() !== "");
    if (!lines.length) {
      continue;
    }
    if (lines.every((l) => l.startsWith("- "))) {
      out.push({ t: "ul", items: lines.map((l) => l.slice(2).trim()) });
    } else if (lines.every((l) => /^\d+\.\s/.test(l))) {
      out.push({ t: "ol", items: lines.map((l) => l.replace(/^\d+\.\s+/, "").trim()) });
    } else if (lines.every((l) => l.startsWith("> "))) {
      out.push({ t: "note", x: lines.map((l) => l.slice(2).trim()).join(" ") });
    } else if (lines.length === 1 && lines[0].startsWith("### ")) {
      out.push({ t: "h3", x: lines[0].slice(4).trim() });
    } else if (lines.every((l) => l.trim().startsWith("|"))) {
      const cells = (l: string) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const rows = lines.filter((l) => !/^\|\s*:?-{2,}/.test(l.trim()));
      out.push({ t: "table", head: cells(rows[0]), rows: rows.slice(1).map(cells) });
    } else {
      out.push({ t: "p", x: lines.join(" ").trim() });
    }
  }
  return out;
}
