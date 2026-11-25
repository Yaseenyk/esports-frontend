"use client";

import { useState } from "react";
import type { Game, Lang } from "@/features/name-style/domain";
import { copyText } from "@/features/name-style/hooks/useNameStyle";

/**
 * Makes every server-rendered button with a data-copy attribute inside it copy that text. The lists stay plain static HTML (readable by
 * search engines and with JavaScript off); this only adds the click. The status line says what was copied.
 */
export default function CopyArea({ game, lang = "en", children }: { game: Game; lang?: Lang; children: React.ReactNode }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const onClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-copy]");
    if (!b) return;
    setMsg(await copyText(b.dataset.copy ?? "", lang, game));
  };
  return (
    <div onClick={onClick} className="space-y-3">
      {children}
      <p role="status" aria-live="polite" className={`sticky bottom-2 min-h-5 text-sm ${msg?.ok === false ? "text-warning" : "text-success"}`}>{msg && <span key={msg.text}>{msg.text}</span>}</p>
    </div>
  );
}
