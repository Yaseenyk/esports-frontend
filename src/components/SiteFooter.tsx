import Link from "next/link";
import { Mark } from "./Logo";
import { GUIDES } from "@/content/guides";
import { TOOLS } from "@/lib/data";

/** Short names and line icons for the honeycomb. The words carry the meaning, so the icons are decorative. */
const TILE: Record<string, { label: string; d: string }> = {
  plan: { label: "Plan it", d: "M9 4h6v3H9zM6 7h12v14H6zM9 12h6M9 16h4M3 11l1.5 1.5L7 10" },
  "id-cards": { label: "ID cards", d: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM8 11a2 2 0 100-4 2 2 0 000 4zM5.5 16c.5-1.7 1.5-2.5 2.5-2.5s2 .8 2.5 2.5M14 9h4M14 13h3" },
  brackets: { label: "Brackets", d: "M4 5h5v4H4zM4 15h5v4H4zM15 10h5v4h-5zM9 7h3v10H9M12 12h3" },
  "points-table": { label: "Points table", d: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  "double-elimination": { label: "Double elim", d: "M3 4h5v3H3zM3 10h5v3H3zM10 7h4v3h-4zM10 13h4v3h-4zM16 10h5v4h-5zM8 5.5h2M8 11.5h2M14 8.5h2M14 14.5h2" },
  registration: { label: "Sign-ups", d: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5" },
  "round-robin": { label: "Round robin", d: "M12 4a8 8 0 018 8M20 12l-2.5-2.5M12 20a8 8 0 01-8-8M4 12l2.5 2.5M12 8v4l3 2" },
  "display-screen": { label: "TV screens", d: "M3 5h18v11H3zM8 20h8M12 16v4M7 9h5M7 12h8" },
  schedule: { label: "Schedule", d: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h3M13 14h3M8 17h3" },
  groups: { label: "Groups", d: "M3 5h6v4H3zM3 15h6v4H3zM15 10h6v4h-6zM9 7h3v10H9M12 12h3" },
  "print-kits": { label: "Print kits", d: "M7 9V4h10v5M7 17H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2M7 14h10v6H7z" },
  poster: { label: "Posters", d: "M5 3h14v18H5zM8 7h8M8 11h8M8 15h5M15 17l2-2" },
  certificates: { label: "Certificates", d: "M5 4h14v12H5zM9 20l3-3 3 3V16M8 8h8M8 12h5" },
  "check-in": { label: "Check-in", d: "M4 7V5h3M17 5h3v2M20 17v2h-3M7 19H4v-2M8 12l3 3 5-6" },
};

/** The guides worth a place in the footer, by slug. The rest are one click away on the guides page. */
const FEATURED: [string, string][] = [["run-a-campus-tournament", "Run a college tournament"], ["esports-tournament-rules-template", "Tournament rules template"], ["choosing-a-tournament-format", "Choosing a format"], ["free-fire-tournament-organiser", "Free Fire tournaments"], ["bgmi-custom-room-tournament", "BGMI custom rooms"], ["valorant-tournament-organiser", "Valorant tournaments"], ["tournament-bracket-template", "Bracket template"], ["student-id-card-format", "Student ID card format"], ["qr-code-attendance", "QR code attendance"], ["tournament-registration-form-fields", "Registration form fields"]];
const LEGAL: [string, string][] = [["Free tournament software compared", "/compare/free-tournament-software-india/"], ["About", "/about/"], ["Contact", "/contact/"], ["Privacy", "/privacy/"], ["Terms", "/terms/"]];

function Hex({ slug }: { slug: string }) {
  const t = TILE[slug]; const tool = TOOLS.find((x) => x.slug === slug);
  if (!t || !tool) return null;
  return (
    <Link href={`/tools/${slug}/`} className="fx-hex" aria-label={tool.name}>
      <span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-cyan" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={t.d} /></svg>
        <span className="fx-hex-label">{t.label}</span>
      </span>
    </Link>
  );
}

const chunk = <T,>(a: T[], sizes: number[]) => { const out: T[][] = []; let i = 0; for (const n of sizes) { out.push(a.slice(i, i + n)); i += n; } return out; };

/**
 * The site footer: a honeycomb of the free tools (the same shape as the menu), a numbered "guide log", and a thin status bar.
 * Server-rendered, no script: every link is plain HTML for readers and search engines.
 */
export default function SiteFooter() {
  const slugs = TOOLS.map((t) => t.slug).filter((s) => TILE[s]);
  const guides = FEATURED.map(([s, label]) => { const g = GUIDES.find((x) => x.slug === s); return g ? { slug: g.slug, title: g.title, label } : null; }).filter((g): g is { slug: string; title: string; label: string } => !!g);
  return (
    <footer className="no-print mt-20 px-4 pb-8 text-sm text-zinc-400">
      <div className="fx-seam mx-auto max-w-6xl" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 pt-10 lg:grid-cols-2 lg:gap-14">
        <nav aria-label="Tools" className="min-w-0">
          <p className="fx-kicker"><span>{slugs.length} free tools</span></p>
          <div className="fx-comb fx-comb-wide">{chunk(slugs, [5, 5, 4]).map((row, i) => <div key={i} className="fx-row">{row.map((s) => <Hex key={s} slug={s} />)}</div>)}</div>
          <div className="fx-comb fx-comb-narrow">{chunk(slugs, [2, 3, 2, 3, 2, 2]).map((row, i) => <div key={i} className="fx-row">{row.map((s) => <Hex key={s} slug={s} />)}</div>)}</div>
          <p className="mt-4 text-xs text-zinc-400">No account needed. They run in your browser.</p>
        </nav>

        <nav aria-label="Guides" className="min-w-0">
          <p className="fx-kicker"><span>Guide log · {GUIDES.length} guides</span></p>
          <ol className="grid gap-x-8 sm:grid-cols-2">
            {guides.map((g, i) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}/`} className="fx-log group" title={g.title}>
                  <span className="fx-log-n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 truncate">{g.label}</span>
                  <span aria-hidden="true" className="fx-log-go">→</span>
                </Link>
              </li>
            ))}
          </ol>
          <Link href="/guides/" className="mt-3 inline-flex items-center gap-2 text-cyan hover:text-white">All {GUIDES.length} guides <span aria-hidden="true">→</span></Link>
        </nav>
      </div>

      <div className="mx-auto mt-12 max-w-6xl rounded-2xl border border-white/10 bg-[#0a0b0d] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-white" aria-label="Esports Hub home"><Mark className="h-8 w-8" />Esports Hub</Link>
          <nav aria-label="About this site" className="flex flex-wrap gap-2">{LEGAL.map(([l, h]) => <Link key={h} href={h} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:border-cyan hover:text-white">{l}</Link>)}</nav>
          <a href="#top" aria-label="Back to top" className="fx-top ml-auto"><span aria-hidden="true">↑</span></a>
        </div>
        <p className="mt-3 border-t border-white/10 pt-3 text-xs text-zinc-400">Esports Hub is an independent project and is not affiliated with any game publisher. Game names and logos are trademarks of their owners and are used only to identify the games.</p>
      </div>
    </footer>
  );
}
