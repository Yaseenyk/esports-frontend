import Link from "next/link";
import { Mark } from "./Logo";
import { LISTED_GUIDES as GUIDES } from "@/content/guides";
import { TOOLS } from "@/lib/data";
import { v3FooterLinks } from "@/features/shared/flags";
import { TOOL_TILES as TILE } from "@/lib/tool-icons";


/** The guides worth a place in the footer, by slug. The rest are one click away on the guides page. */
const FEATURED: [string, string][] = [["run-a-campus-tournament", "Run a college tournament"], ["esports-tournament-rules-template", "Tournament rules template"], ["choosing-a-tournament-format", "Choosing a format"], ["free-fire-tournament-organiser", "Free Fire tournaments"], ["bgmi-custom-room-tournament", "BGMI custom rooms"], ["valorant-tournament-organiser", "Valorant tournaments"], ["tournament-bracket-template", "Bracket template"], ["student-id-card-format", "Student ID card format"], ["qr-code-attendance", "QR code attendance"], ["tournament-registration-form-fields", "Registration form fields"]];
const LEGAL: [string, string][] = [["All tools", "/tools/"], ["Esports ID card maker", "/id-card-maker/esports/"], ["Free tournament software compared", "/compare/free-tournament-software-india/"], ["About", "/about/"], ["Developers", "/developers/"], ["Contact", "/contact/"], ["Privacy", "/privacy/"], ["Terms", "/terms/"]];

function Hex({ slug }: { slug: string }) {
  const t = TILE[slug]; const tool = TOOLS.find((x) => x.slug === slug);
  if (!t || !tool) return null;
  return (
    <Link prefetch={false} href={`/tools/${slug}/`} className="fx-hex" aria-label={tool.name}>
      <span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-cyan" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={t.d} /></svg>
        <span className="fx-hex-label">{t.label}</span>
      </span>
    </Link>
  );
}

/** Row sizes for the honeycomb: the pattern repeated until every tool has a place (the last row takes what is left). */
const rows = (n: number, pattern: number[]): number[] => { const out: number[] = []; let left = n; for (let i = 0; left > 0; i++) { const k = Math.min(pattern[i % pattern.length]!, left); out.push(k); left -= k; } return out; };
const chunk = <T,>(a: T[], sizes: number[]) => { const out: T[][] = []; let i = 0; for (const n of sizes) { out.push(a.slice(i, i + n)); i += n; } return out; };

/**
 * The site footer: a honeycomb of the free tools (the same shape as the menu), a numbered "guide log", and a thin status bar.
 * Server-rendered, no script: every link is plain HTML for readers and search engines.
 */
export default function SiteFooter() {
  const slugs = TOOLS.map((t) => t.slug).filter((s) => TILE[s]);
  const guides = FEATURED.map(([s, label]) => { const g = GUIDES.find((x) => x.slug === s); return g ? { slug: g.slug, title: g.title, label } : null; }).filter((g): g is { slug: string; title: string; label: string } => !!g);
  return (
    <footer className="cv-auto no-print mt-20 px-4 pb-8 text-sm text-zinc-400">
      <div className="fx-seam mx-auto max-w-6xl" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 pt-10 lg:grid-cols-2 lg:gap-14">
        <nav aria-label="Tools" className="min-w-0">
          <p className="fx-kicker"><span>{slugs.length} free tools</span></p>
          <div className="fx-comb fx-comb-wide">{chunk(slugs, rows(slugs.length, [5])).map((row, i) => <div key={i} className="fx-row">{row.map((s) => <Hex key={s} slug={s} />)}</div>)}</div>
          <div className="fx-comb fx-comb-narrow">{chunk(slugs, rows(slugs.length, [2, 3])).map((row, i) => <div key={i} className="fx-row">{row.map((s) => <Hex key={s} slug={s} />)}</div>)}</div>
          <p className="mt-4 text-xs text-zinc-400">No account needed. They run in your browser.</p>
        </nav>

        <nav aria-label="Guides" className="min-w-0">
          <p className="fx-kicker"><span>Guide log · {GUIDES.length} guides</span></p>
          <ol className="grid gap-x-8 sm:grid-cols-2">
            {guides.map((g, i) => (
              <li key={g.slug}>
                <Link prefetch={false} href={`/guides/${g.slug}/`} className="fx-log group" title={g.title}>
                  <span className="fx-log-n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 truncate">{g.label}</span>
                  <span aria-hidden="true" className="fx-log-go">→</span>
                </Link>
              </li>
            ))}
          </ol>
          <Link prefetch={false} href="/guides/" className="mt-3 inline-flex items-center gap-2 text-cyan hover:text-white">All {GUIDES.length} guides <span aria-hidden="true">→</span></Link>
        </nav>
      </div>

      <div className="mx-auto mt-12 max-w-6xl rounded-2xl border border-white/10 bg-[#0a0b0d] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link prefetch={false} href="/" className="flex items-center gap-2 font-display font-bold text-white" aria-label="Esports Hub home"><Mark className="h-8 w-8" />Esports Hub</Link>
          <nav aria-label="About this site" className="flex flex-wrap gap-2">{[...v3FooterLinks().map((x): [string, string] => [x.label, x.href]), ...LEGAL].map(([l, h]) => <Link prefetch={false} key={h} href={h} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:border-cyan hover:text-white">{l}</Link>)}</nav>
          <a href="#top" aria-label="Back to top" className="fx-top ml-auto"><span aria-hidden="true">↑</span></a>
        </div>
        <p className="mt-3 border-t border-white/10 pt-3 text-xs text-zinc-400">Esports Hub is an independent project and is not affiliated with any game publisher. Game names are trademarks of their owners and are used only to identify the games. Esports Hub draws its own badges and does not use publishers' logos or artwork.</p>
      </div>
    </footer>
  );
}
