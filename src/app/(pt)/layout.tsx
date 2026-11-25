import Link from "next/link";
import { Mark } from "@/components/Logo";
import HtmlLang from "@/components/HtmlLang";

/**
 * The frame for the Portuguese (Brazil) pages: a short header and footer in Portuguese, instead of the English menu and footer.
 * Only the few Portuguese pages use it (see src/lib/pt-br.ts). The rest of the site is English, and the links here say so.
 * The static HTML gets lang="pt-BR" from scripts/set-lang.mjs (the root layout is shared and says "en"); HtmlLang sets it again
 * after a move inside the site.
 */
export default function PortugueseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HtmlLang lang="pt-BR" />
      <div id="top" />
      <header className="no-print mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 pt-4">
        <Link href="/" className="flex min-h-11 items-center gap-2 font-display text-lg font-bold text-white" aria-label="Esports Hub, página inicial (em inglês)"><Mark className="h-8 w-8" />Esports Hub</Link>
        <nav aria-label="Site" className="flex flex-wrap gap-x-4 text-sm text-zinc-300">
          <Link href="/tools/" className="inline-flex min-h-11 items-center hover:text-white">Ferramentas (em inglês)</Link>
          <Link href="/guides/" className="inline-flex min-h-11 items-center hover:text-white">Guias (em inglês)</Link>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:py-12">{children}</main>
      <footer className="no-print mx-auto max-w-6xl border-t border-white/10 px-4 py-8 text-sm text-zinc-400">
        <p>Esports Hub: ferramentas grátis para quem organiza torneios e para jogadores. O site é em inglês; só algumas páginas têm versão em português.</p>
        <nav aria-label="Rodapé" className="mt-3 flex flex-wrap gap-x-4">
          <Link href="/about/" className="inline-flex min-h-11 items-center hover:text-white">Sobre (em inglês)</Link>
          <Link href="/contact/" className="inline-flex min-h-11 items-center hover:text-white">Contato (em inglês)</Link>
          <Link href="/privacy/" className="inline-flex min-h-11 items-center hover:text-white">Privacidade (em inglês)</Link>
          <Link href="/terms/" className="inline-flex min-h-11 items-center hover:text-white">Termos (em inglês)</Link>
        </nav>
      </footer>
    </>
  );
}
