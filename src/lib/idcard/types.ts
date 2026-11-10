/**
 * ID card data model. A card is a background plus a list of elements. Every position and size is a percentage of the card,
 * and font sizes are a percentage of the card width, so one design prints at any size and shows at any screen size.
 */
export const FIELDS = {
  name: "Full name",
  first: "First name",
  last: "Last name",
  team: "Team",
  role: "Role",
  id: "ID number",
  event: "Event",
  game: "Game",
  dob: "Date of birth",
  gender: "Gender",
  aadhaar: "Aadhaar (last 4 only)",
} as const;
export type Field = keyof typeof FIELDS;

export const ROLES = ["Player", "Substitute", "Coach", "Manager", "Staff", "Guest", "Caster"] as const;
export type Role = (typeof ROLES)[number];

export type Kind = "text" | "field" | "photo" | "rect" | "ellipse" | "image" | "qr";

export interface El {
  id: string;
  kind: Kind;
  x: number; y: number; w: number; h: number; // % of the card
  rot: number; // degrees
  opacity: number; // 0..1
  /** text */
  text?: string;
  /** field: which person detail this shows */
  field?: Field;
  font?: FontKey;
  size?: number; // % of card width
  weight?: number;
  color?: string;
  align?: "left" | "center" | "right";
  upper?: boolean;
  spacing?: number; // letter spacing in %
  /** shapes, photo frame */
  fill?: string;
  fill2?: string; // gradient end
  radius?: number; // % of the shorter side, 50 = fully round
  stroke?: string;
  strokeW?: number;
  /** image: a data URL the user uploaded (for example a team logo) */
  src?: string;
  /** text: italic */
  italic?: boolean;
  /** text: transparent letters with only an outline (uses stroke / strokeW) */
  outline?: boolean;
  /** text: stack the same line this many times, like a repeated word behind a portrait */
  repeat?: number;
  /** text: repeat across the width like a ribbon ("NAME • NAME • NAME") */
  ticker?: boolean;
  /** shapes and text boxes: angle of the gradient between fill and fill2 */
  ang?: number;
  /** photo: a cut-out person (transparent PNG) stands on the bottom edge with no frame, so type behind it shows around them */
  cutout?: boolean;
  /** photo cut-out: colour of a sticker-style outline around the person */
  sticker?: string;
  /** photo cut-out: soft drop shadow */
  shadow?: boolean;
  /** photo cut-out with a normal (not transparent) photo: set false to show it as a plain rounded picture instead of fading at the bottom */
  fade?: boolean;
}

/** A texture drawn over the background: dots, grid, stripes, sunburst rays, concentric rings or a diamond lattice. */
export interface Pattern { type: "dots" | "grid" | "stripes" | "rays" | "rings" | "diamonds"; color: string; opacity: number; size: number; cx?: number; cy?: number }

export interface Template {
  id: string;
  name: string;
  /** Card shape. Older saved designs have none and are wallet cards. */
  fmt?: Fmt;
  /** Which ready-made theme it started from, so a change of card type can rebuild the same look. */
  theme?: string;
  bg: { a: string; b: string; angle: number; pattern?: Pattern };
  els: El[];
}

export interface Team { id: string; name: string }
export interface Person {
  id: string;
  name: string;
  teamId: string;
  role: Role;
  dob?: string;
  gender?: string;
  /** Only the last four digits of an Aadhaar number are ever kept. */
  last4?: string;
  photo?: string;
  /** True when the details came from OCR and nobody has checked them yet. */
  review?: boolean;
  /** How a scanned person was read: the card's QR code (exact) or OCR (needs a check). */
  source?: "qr" | "ocr";
  /** The photo is a cut-out with a transparent background. */
  cutout?: boolean;
}

/** k is the typical width of a letter as a share of the font size, so text can be shrunk to fit its box. */
export const FONTS = {
  display: { label: "Display", css: "var(--font-display), system-ui, sans-serif", k: 0.56 },
  body: { label: "Clean", css: "var(--font-body), system-ui, sans-serif", k: 0.56 },
  mono: { label: "Mono", css: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", k: 0.62 },
  serif: { label: "Serif", css: "Georgia, 'Times New Roman', serif", k: 0.52 },
  heavy: { label: "Heavy", css: "'Arial Black', Impact, 'Haettenschweiler', sans-serif", k: 0.8 },
  poppins: { label: "Poppins", css: "var(--font-poppins), var(--font-body), system-ui, sans-serif", k: 0.6 },
  anton: { label: "Anton (poster)", css: "var(--font-anton), Impact, 'Arial Narrow', sans-serif", k: 0.47 },
  bebas: { label: "Bebas (tall)", css: "var(--font-bebas), Impact, 'Arial Narrow', sans-serif", k: 0.4 },
  oswald: { label: "Oswald", css: "var(--font-oswald), Impact, 'Arial Narrow', sans-serif", k: 0.5 },
  montserrat: { label: "Montserrat Black", css: "var(--font-montserrat), 'Arial Black', sans-serif", k: 0.68 },
} as const;
export type FontKey = keyof typeof FONTS;

let n = 0;
export const uid = () => `e${Date.now().toString(36)}${(n++).toString(36)}`;

/** Card types. Wearable ones have a slot guide for a lanyard or clip. Sizes are millimetres. */
export const FORMATS = {
  wallet: { label: "Wallet card", w: 85.6, h: 54, cols: 2, slot: null, note: "Credit-card size. Carry it." },
  portrait: { label: "Lanyard badge", w: 54, h: 85.6, cols: 3, slot: { w: 26, h: 3.6 }, note: "Credit-card size, upright. Punch the slot and wear it on a lanyard." },
  badge: { label: "Event badge", w: 76, h: 102, cols: 2, slot: { w: 19, h: 3 }, note: "Large 3 x 4 in badge for lanyards, clips and pins." },
  strip: { label: "Wristband strip", w: 190, h: 22, cols: 1, slot: null, note: "A long strip. Cut it, then fit it around the wrist or a bag strap." },
  poster: { label: "Poster card (2:3)", w: 70, h: 105, cols: 2, slot: null, note: "Big poster-style card for events and teams. Shows well on screens too." },
  story: { label: "Story card (9:16)", w: 60, h: 106.7, cols: 3, slot: null, note: "Tall card for phones and social stories, or a large printed badge." },
  pass: { label: "Digital pass (phone)", w: 54, h: 112.4, cols: 3, slot: null, note: "Shaped like a phone screen, for a digital ID shown in an app or shared as an image." },
} as const;
export type Fmt = keyof typeof FORMATS;
export const fmtOf = (t: { fmt?: Fmt }): Fmt => t.fmt ?? "wallet";
