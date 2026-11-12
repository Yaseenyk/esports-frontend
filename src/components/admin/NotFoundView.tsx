import Link from "next/link";

/** An ordinary "not found". It is also what the page shows to anyone who is not staff, so it says nothing about what lives here. */
export default function NotFoundView() {
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-5xl font-bold text-white">404</h1>
      <p className="mt-3 text-zinc-300">This page could not be found.</p>
      <Link href="/" className="btn-ghost mt-6">Go to the home page</Link>
    </main>
  );
}
