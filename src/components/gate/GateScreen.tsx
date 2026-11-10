import GateModes from "./GateModes";

/** The gate check-in screen, shared by the web app (/app/check-in) and the sign-in-free staff page (/gate). */
export default function GateScreen() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan">Event day</p>
      <h1 className="mt-1 text-3xl font-bold text-white sm:text-5xl">Gate check-in</h1>
      <p className="mt-3 max-w-2xl text-zinc-300">Scan cards with the phone camera. Genuine passes show the person&apos;s photo, role and zones; copied or edited cards are rejected. Use an offline pack from the ID card maker, or Live mode with a gate key so every door shares one list.</p>
      <GateModes />
    </div>
  );
}
