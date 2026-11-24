"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "eh-pt-offer-dismissed";

/**
 * A small "Ver em português" link for visitors whose browser language is Portuguese, on the English pages that have a Portuguese version.
 * No automatic redirect and no location lookup: it reads navigator.language only, after the page has loaded, and hides for good once closed.
 * It is fixed to the bottom of the screen, so showing it moves nothing on the page. Nothing is rendered on the server.
 */
export default function PortugueseOffer({ href }: { href: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let dismissed = false;
    try { dismissed = localStorage.getItem(KEY) === "1"; } catch { /* private mode: show it, closing still hides it for this page */ }
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    if (!dismissed && (langs[0] ?? "").toLowerCase().startsWith("pt")) setShow(true);
  }, []);
  if (!show) return null;
  const close = () => { setShow(false); try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ } };
  return (
    <div lang="pt-BR" translate="no" role="region" aria-label="Versão em português" data-testid="pt-offer"
      className="no-print fixed bottom-4 left-4 z-bubble flex items-center gap-1 rounded-xl border border-white/15 bg-[#0a0b0d] py-1 pl-4 pr-1 text-sm text-zinc-100">
      <Link href={href} hrefLang="pt-BR" className="min-h-11 py-3 font-semibold text-cyan underline underline-offset-4">Ver em português</Link>
      <button type="button" onClick={close} aria-label="Fechar" className="grid h-11 w-11 place-items-center rounded-lg text-zinc-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan">
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
      </button>
    </div>
  );
}
