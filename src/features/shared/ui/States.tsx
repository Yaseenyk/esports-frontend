import Link from "next/link";
import { box, btnPrimary, btnSecondary, h1, h2, link } from "@/features/shared/ui/styles";
import { authHref } from "@/lib/safe-next";
import { v3Enabled } from "@/features/shared/flags";

/**
 * A calm "Not available yet": the API answered 404, which means the feature flag is still off. Not an error.
 * `asPage`: it is the page's only content, so its heading is the page's h1. `action`: one useful next step (the home link stays too).
 */
export function NotAvailable({ what = "This", asPage = false, action }: { what?: string; asPage?: boolean; action?: React.ReactNode }) {
  const H = asPage ? "h1" : "h2";
  return (
    <section role="status" className={box}>
      <H className={asPage ? h1 : h2}>Not available yet</H>
      <p className="mt-2 text-zinc-300">{what} is not open yet. Nothing is wrong and nothing was lost. Check back soon.</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">{action}<Link href="/" className={link}>Back to the home page</Link></div>
    </section>
  );
}

export function EmptyState({ title, body, action, asPage = false }: { title: string; body: string; action?: React.ReactNode; /** The page's only content: the title is the page's h1. */ asPage?: boolean }) {
  const H = asPage ? "h1" : "h2";
  return (
    <section className={box}>
      <H className={asPage ? h1 : "font-display text-lg font-semibold text-zinc-100"}>{title}</H>
      <p className="mt-2 text-zinc-300">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <section role="alert" className={box}>
      <h2 className="font-display text-lg font-semibold text-danger"><span aria-hidden="true">! </span>That did not load</h2>
      <p className="mt-2 text-zinc-300">{message}</p>
      {onRetry && <button type="button" onClick={onRetry} className={`${btnSecondary} mt-4`}>Try again</button>}
    </section>
  );
}

export function SignInPrompt({ what, next = "/app/" }: { what: string; next?: string }) {
  return (
    <section className={box}>
      <h2 className="font-display text-lg font-semibold text-zinc-100">Sign in to continue</h2>
      <p className="mt-2 text-zinc-300">{what}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={authHref("login", next)} className={btnPrimary}>Sign in</Link>
        <Link href={authHref("signup", next)} className={btnSecondary}>Create a free account</Link>
      </div>
    </section>
  );
}

export function SkeletonRows({ n = 3, label = "Loading" }: { n?: number; label?: string }) {
  return (
    <div role="status" aria-busy="true" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: n }, (_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 motion-safe:animate-pulse" />)}
    </div>
  );
}

/** Asks for the 18+ confirmation, the one thing every v3 account feature needs (API.md section 1). */
export function AdultGate({ busy, error, onConfirm }: { busy: boolean; error: string; onConfirm: () => void }) {
  return (
    <section className={box}>
      <h2 className="font-display text-lg font-semibold text-zinc-100">Confirm you are 18 or older</h2>
      <p className="mt-2 text-zinc-300">This part of Esports Hub is for adults only. We store the time you confirmed, not your date of birth or any id.</p>
      {error && <p role="alert" className="mt-3 text-sm text-danger"><span aria-hidden="true">! </span>{error}</p>}
      <button type="button" onClick={onConfirm} disabled={busy} className={`${btnPrimary} mt-4`}>I am 18 or older</button>
    </section>
  );
}

const TONES: Record<string, string> = { success: "text-success", warning: "text-warning", danger: "text-danger", neutral: "text-zinc-300", accent: "text-cyan-400" };
/** Status is always a word, colour only supports it. */
export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: keyof typeof TONES }) {
  return <span className={`inline-flex min-h-6 items-center rounded-full border border-white/10 px-2 text-xs font-medium ${TONES[tone]}`}>{label}</span>;
}

/** The useful way on from an empty profile or resume address: the team finder when it is on, otherwise the tournaments list, plus home. */
export function FindNext() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {v3Enabled("lft") ? <Link href="/lft/" className={btnSecondary}>Find a team</Link> : <Link href="/tournaments/" className={btnSecondary}>See tournaments</Link>}
      <Link href="/" className={link}>Back to the home page</Link>
    </div>
  );
}
