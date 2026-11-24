import type { DisplayTheme } from "@/lib/display-themes";
import { badgeTone, initials } from "@/features/overlay-kit/domain";

/** A team badge drawn by the site: a hexagon in one of the design's two accent colours with the team's initials. No logos, no game art. */
export default function TeamBadge({ name, c, size }: { name: string; c: DisplayTheme; /** Width in vmin. */ size: number }) {
  const tone = badgeTone(name) === 0 ? c.accent : c.accent2;
  const text = initials(name);
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" style={{ width: `${size}vmin`, height: `${size}vmin`, flex: "none" }}>
      <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" fill={c.row} stroke={tone} strokeWidth="6" strokeLinejoin="round" />
      <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fill={c.fg} fontSize={text.length > 1 ? 34 : 44} fontWeight="800" style={{ fontFamily: "inherit" }}>{text}</text>
    </svg>
  );
}
