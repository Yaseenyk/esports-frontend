import Link from "next/link";
import { OWNER, TRUST_COPY, type ScoringRules, type TrustLang } from "@/features/tool-trust/domain";
import { box, h2, link } from "@/features/shared/ui/styles";

/** "Built and run by Yaseen Khatib, a developer in Hyderabad (LinkedIn)." Plain server HTML under the page's lead. */
export function WhoRuns({ lang = "en" }: { lang?: TrustLang }) {
  const c = TRUST_COPY[lang];
  return (
    <p className="mt-3 max-w-2xl text-sm text-zinc-300" data-testid="who-runs">
      {c.by} <a href={OWNER.url} rel="author" className={link}>{OWNER.name}</a>{c.role} (<a href={OWNER.linkedin} rel="noopener" className={link}>{c.linkedin}</a>).
    </p>
  );
}

/** What the calculator calculates and the scoring rules it really uses, as static text (the tool itself renders in the browser only). */
export function ScoringRulesBlock({ rules, lang = "en" }: { rules: ScoringRules; lang?: TrustLang }) {
  return (
    <section className="no-print max-w-3xl space-y-3" aria-labelledby="scoring" data-testid="scoring-rules">
      <h2 id="scoring" className={h2}>{TRUST_COPY[lang].rulesH}</h2>
      <p className="leading-7 text-zinc-300">{rules.lead}</p>
      <ul className="list-disc space-y-1 pl-5 leading-7 text-zinc-300 marker:text-cyan">{rules.items.map((i) => <li key={i}>{i}</li>)}</ul>
    </section>
  );
}

/** The "Safe to use" box: no sign-in, nothing to install, no payment, what stays in the browser and what is counted. */
export function SafeToUse({ lang = "en" }: { lang?: TrustLang }) {
  const c = TRUST_COPY[lang];
  return (
    <aside className={`no-print max-w-3xl ${box}`} aria-labelledby="safe-to-use" data-testid="safe-to-use">
      <h2 id="safe-to-use" className="font-display text-lg text-zinc-100">{c.safeH}</h2>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-300">
        {c.safe.map(([k, v]) => <li key={k}><strong className="font-semibold text-zinc-100">{k}</strong> {v}</li>)}
      </ul>
      <p className="mt-3 text-sm"><Link href="/privacy/#analytics" hrefLang={lang === "en" ? undefined : "en"} className={link}>{c.privacy}</Link></p>
    </aside>
  );
}
