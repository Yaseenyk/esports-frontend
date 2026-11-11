import GateModes from "./GateModes";

/** The gate check-in screen, shared by the web app (/app/check-in) and the sign-in-free staff page (/gate). */
export default function GateScreen() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Event day</p>
      <h1 className="mt-1 text-3xl font-bold text-white sm:text-5xl">Gate check-in</h1>
      <p className="mt-3 max-w-2xl text-zinc-300">Point a phone camera at each guest&apos;s pass. A green tick means let them in; a red cross means stop. First choose how this phone gets the guest list, below.</p>
      <GateModes />
    </div>
  );
}
