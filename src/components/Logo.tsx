/** The Esports Hub mark: a hub with three spokes, one per community, inside a hexagon. */
export function Mark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#22D3EE" /><stop offset="1" stopColor="#A855F7" /></linearGradient>
      </defs>
      <path d="M24 3.5l17.5 10v21L24 44.5 6.5 34.5v-21z" fill="#0b0f16" stroke="url(#lg)" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M24 24L24 12M24 24L13.6 30M24 24L34.4 30" stroke="url(#lg)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="24" cy="12" r="3.2" fill="#22D3EE" /><circle cx="13.6" cy="30" r="3.2" fill="#A855F7" /><circle cx="34.4" cy="30" r="3.2" fill="#22D3EE" />
      <circle cx="24" cy="24" r="4.4" fill="url(#lg)" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <Mark />
      <span className="font-display text-lg font-bold tracking-tight text-white">Esports<span className="bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">Hub</span></span>
    </span>
  );
}
