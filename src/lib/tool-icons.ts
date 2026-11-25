/**
 * Short names and line icons for every tool, shared by the footer honeycomb and the home page tool cards, so a new tool gets its own
 * icon in both places from one entry. The words carry the meaning, so the icons are decorative.
 */
export const TOOL_TILES: Record<string, { label: string; d: string }> = {
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
  rulebook: { label: "Rulebook", d: "M6 3h10l3 3v15H6zM9 8h7M9 12h7M9 16h4" },
  "prize-split": { label: "Splits", d: "M12 3v18M5 8h14M5 8l-2 6h4zM19 8l-2 6h4zM8 21h8" },
  "team-name-generator": { label: "Team names", d: "M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6zM9 11h6M12 8v6" },
  "free-fire-guild-name": { label: "Guild names", d: "M5 4h14l-2 6 2 6H5zM5 4v17M9 8h5M9 12h4" },
  "sensitivity-converter": { label: "Sensitivity", d: "M12 3a5 5 0 015 5v8a5 5 0 01-10 0V8a5 5 0 015-5zM12 7v4M4 12h2M18 12h2" },
  "free-fire-name-style": { label: "FF names", d: "M4 18L8 6l4 12M5.5 14h5M14 6h6M14 6v12M14 12h4" },
  "bgmi-name-style": { label: "BGMI names", d: "M4 6h7M7.5 6v12M13 18V6l3 6 3-6v12" },
  "reaction-time-test": { label: "Reaction", d: "M12 21a8 8 0 100-16 8 8 0 000 16zM12 9v4l2.5 2.5M10 2h4M19 5l1.5-1.5" },
  "tap-speed-test": { label: "Tap speed", d: "M9 11V5a2 2 0 014 0v6M13 10a2 2 0 014 0v4a7 7 0 01-7 7 6 6 0 01-5-3l-2-4a1.8 1.8 0 013-2l2 2.5M4 4l2 2M20 4l-2 2" },
  "valorant-crosshair": { label: "Crosshair", d: "M12 3v6M12 15v6M3 12h6M15 12h6M12 11.5v1" },
  "scrim-time-planner": { label: "Squad times", d: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14l2 2 4-4" },
  "check-in": { label: "Check-in", d: "M4 7V5h3M17 5h3v2M20 17v2h-3M7 19H4v-2M8 12l3 3 5-6" },
};
