import type { Metadata } from "next";
import Link from "next/link";

// A missing page. Next.js already adds <meta name="robots" content="noindex"> to the 404 page, so the root layout's
// "index, follow" is cleared here (null) to leave exactly one robots tag. GitHub Pages also answers 404 for these URLs.
export const metadata: Metadata = { title: "Page not found", robots: null };

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-black text-zinc-50 sm:text-4xl">Page not found</h1>
      <p className="mt-4 text-zinc-300">This address does not exist on Esports Hub. It may have moved, or the link may be mistyped.</p>
      <p className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn">Home</Link>
        <Link href="/tools/" className="btn-ghost">All tools</Link>
        <Link href="/guides/" className="btn-ghost">Guides</Link>
      </p>
    </main>
  );
}
