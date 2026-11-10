import QRCode from "qrcode";
import { useMemo, type CSSProperties } from "react";
import { maskAadhaar } from "@/lib/idcard/aadhaar";
import { bustDataUri } from "@/lib/idcard/bust";
import { FONTS, FORMATS, ROLE_COLOURS, fmtOf, type El, type Pattern, type Person, type Template } from "@/lib/idcard/types";

export interface Ctx {
  event: string; game: string; teamName: string; person: Person;
  /** Event details shown by the organiser, date, venue, emergency and rules fields. */
  info?: { organiser?: string; date?: string; venue?: string; emergency?: string; rules?: string };
  teamLogo?: string; sponsorLogo?: string;
  /** What the QR code holds: a signed pass when signing is on, otherwise the ID number. */
  qr?: string;
  /** The person is under 18 on the event date. */
  minor?: boolean;
}

export function fieldValue(el: El, c: Ctx): string {
  const p = c.person;
  switch (el.field) {
    case "name": return p.name;
    case "first": return p.name.trim().split(/\s+/)[0] ?? "";
    case "last": { const w = p.name.trim().split(/\s+/); return w.length > 1 ? w.slice(1).join(" ") : w[0] ?? ""; }
    case "team": return c.teamName;
    case "role": return p.role;
    case "id": return p.id;
    case "event": return c.event;
    case "game": return c.game;
    case "dob": return p.dob ?? "";
    case "gender": return p.gender ?? "";
    case "aadhaar": return maskAadhaar(p.last4);
    case "zones": return p.zones ?? "";
    case "flag": return c.minor ? (p.guardian ? "MINOR · CONSENT" : "MINOR") : "";
    case "organiser": return c.info?.organiser ?? "";
    case "date": return c.info?.date ?? "";
    case "venue": return c.info?.venue ?? "";
    case "emergency": return c.info?.emergency ?? "";
    case "rules": return c.info?.rules ?? "";
    default: return "";
  }
}

const grad = (a: string, b: string, angle: number) => `linear-gradient(${angle}deg, ${a}, ${b})`;

/** Background texture. It sits in its own layer so its sizes can use the card's own width units. */
function patternStyle(p: Pattern): CSSProperties {
  const c = p.color, s = p.size, cx = p.cx ?? 70, cy = p.cy ?? 30;
  switch (p.type) {
    case "dots": return { backgroundImage: `radial-gradient(circle, ${c} ${s * 0.1}cqw, transparent ${s * 0.12}cqw)`, backgroundSize: `${s}cqw ${s}cqw` };
    case "grid": return { backgroundImage: `linear-gradient(${c} 0.15cqw, transparent 0.15cqw), linear-gradient(90deg, ${c} 0.15cqw, transparent 0.15cqw)`, backgroundSize: `${s}cqw ${s}cqw` };
    case "stripes": return { backgroundImage: `repeating-linear-gradient(45deg, ${c} 0, ${c} ${s * 0.2}cqw, transparent ${s * 0.2}cqw, transparent ${s}cqw)` };
    case "rays": return { backgroundImage: `repeating-conic-gradient(from 0deg at ${cx}% ${cy}%, ${c} 0deg, ${c} ${s * 0.16}deg, transparent ${s * 0.16}deg, transparent ${s}deg)` };
    case "rings": return { backgroundImage: `repeating-radial-gradient(circle at ${cx}% ${cy}%, transparent 0, transparent ${s}cqw, ${c} ${s}cqw, ${c} ${s + 0.35}cqw)` };
    case "diamonds": return { backgroundImage: `linear-gradient(45deg, ${c} 0.18cqw, transparent 0.18cqw), linear-gradient(-45deg, ${c} 0.18cqw, transparent 0.18cqw)`, backgroundSize: `${s}cqw ${s}cqw` };
  }
}

/** A QR code drawn as one SVG path, so it prints crisply at any size. It encodes the person's ID number only. */
function Qr({ value, fg, bg, style }: { value: string; fg: string; bg: string; style: CSSProperties }) {
  const m = useMemo(() => { try { return QRCode.create(value || "ID", { errorCorrectionLevel: "M" }).modules; } catch { return null; } }, [value]);
  if (!m) return <div style={style} />;
  const n = m.size; let d = "";
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m.get(x, y)) d += `M${x} ${y}h1v1h-1z`;
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} preserveAspectRatio="none" shapeRendering="crispEdges" style={style}>
      {bg !== "none" && <rect x="-2" y="-2" width={n + 4} height={n + 4} fill={bg} />}
      <path d={d} fill={fg} />
    </svg>
  );
}

const STICKER_DIRS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];

/** One element, drawn from percentages so the card is resolution independent. */
export function ElView({ el, ctx }: { el: El; ctx: Ctx }) {
  const box: CSSProperties = { position: "absolute", left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%`, transform: el.rot ? `rotate(${el.rot}deg)` : undefined, opacity: el.opacity };
  const roleFill = el.roleColor ? ROLE_COLOURS[ctx.person.role] : undefined;
  const fillCss = roleFill ?? (el.fill2 ? grad(el.fill ?? "#fff", el.fill2, el.ang ?? 90) : el.fill);

  if (el.kind === "rect" || el.kind === "ellipse") {
    return <div style={{ ...box, background: fillCss, borderRadius: el.kind === "ellipse" ? "50%" : `${el.radius ?? 0}cqmin`, border: el.stroke ? `${el.strokeW ?? 0.5}cqw solid ${el.stroke}` : undefined }} />;
  }

  if (el.kind === "qr") {
    return <Qr value={ctx.qr ?? ctx.person.id} fg={el.color ?? "#000000"} bg={el.fill ?? "#ffffff"} style={{ ...box, borderRadius: `${el.radius ?? 0}cqmin` }} />;
  }

  if (el.kind === "photo") {
    const r = el.radius ?? 0;
    if (el.cutout) {
      // A cut-out person. With no photo yet we show a stylised figure so the layout still reads. A normal (non-transparent) photo
      // falls back to a soft-edged picture instead of looking like a rectangle pasted on.
      const real = ctx.person.photo;
      const hasAlpha = !real || ctx.person.cutout;
      const src = real ?? bustDataUri(ctx.person.name, el.color ?? "#334155");
      const filters: string[] = [];
      if (el.sticker && hasAlpha) for (const [dx, dy] of STICKER_DIRS) filters.push(`drop-shadow(${dx * 0.55}cqw ${dy * 0.55}cqw 0 ${el.sticker})`);
      if (el.shadow) filters.push("drop-shadow(0 1cqw 1.6cqw rgba(0,0,0,.45))");
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" style={{ ...box, objectFit: hasAlpha ? "contain" : "cover", objectPosition: hasAlpha ? "center bottom" : "center 18%", filter: filters.join(" ") || undefined, borderRadius: hasAlpha ? undefined : `${r}cqmin`, WebkitMaskImage: hasAlpha || el.fade === false ? undefined : "linear-gradient(#000 72%, transparent)", maskImage: hasAlpha || el.fade === false ? undefined : "linear-gradient(#000 72%, transparent)" }} />
      );
    }
    return (
      <div style={{ ...box, borderRadius: r >= 50 ? "50%" : `${r}cqmin`, overflow: "hidden", background: el.fill, border: el.stroke ? `${el.strokeW ?? 0.6}cqw solid ${el.stroke}` : undefined }}>
        {ctx.person.photo
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={ctx.person.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#ffffff66", fontWeight: 800, fontSize: `${Math.min(el.w, el.h) * 0.45}cqmin`, fontFamily: FONTS.display.css }}>{ctx.person.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?"}</div>}
      </div>
    );
  }

  if (el.kind === "image") {
    const src = el.bind === "team" ? ctx.teamLogo : el.bind === "sponsor" ? ctx.sponsorLogo : el.src;
    // A logo slot with no logo yet prints nothing; the editor shows a hint over it instead.
    if (!src) return el.bind ? null : <div style={{ ...box, border: "0.4cqw dashed #ffffff55" }} />;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" style={{ ...box, objectFit: "contain", borderRadius: `${el.radius ?? 0}cqmin` }} />;
  }

  // text and detail
  const raw = el.kind === "field" ? fieldValue(el, ctx) : el.text ?? "";
  const text = el.ticker ? Array.from({ length: 16 }, () => raw).join("   •   ") : raw;
  // Auto-fit: long names shrink to fit their box instead of being cut off. Wide, heavy or capital letters take more room.
  const k = FONTS[el.font ?? "body"].k * (el.upper ? 1.1 : 1);
  const base = el.size ?? 4;
  const parts = el.lines ? raw.split("\n").filter(Boolean).slice(0, 8) : null;
  const lines = parts ? Math.max(1, parts.length) : Math.max(1, Math.min(8, el.repeat ?? 1));
  const longest = parts ? Math.max(1, ...parts.map((x) => x.length)) : text.length;
  const fit = el.ticker ? base : Math.min(base, (el.w * 0.96) / Math.max(1, longest * k + (el.spacing ?? 0) * longest * 0.5));
  const hasBox = !!el.fill && !el.outline;
  const style: CSSProperties = {
    ...box,
    display: "flex", flexDirection: "column", justifyContent: "center",
    alignItems: el.align === "center" ? "center" : el.align === "right" ? "flex-end" : "flex-start",
    overflow: "hidden", whiteSpace: "nowrap",
    color: el.outline ? "transparent" : el.color,
    WebkitTextStroke: el.outline ? `${el.strokeW ?? 0.3}cqw ${el.stroke ?? el.color ?? "#fff"}` : undefined,
    fontFamily: FONTS[el.font ?? "body"].css, fontSize: `${Math.max(fit, base * 0.45)}cqw`, fontWeight: el.weight ?? 600, fontStyle: el.italic ? "italic" : undefined,
    textTransform: el.upper ? "uppercase" : undefined, letterSpacing: el.spacing ? `${el.spacing}cqw` : undefined, lineHeight: 1.1,
    background: hasBox ? fillCss : undefined, borderRadius: hasBox ? `${el.radius ?? 0}cqmin` : undefined, padding: hasBox ? "0 1.6cqw" : undefined, boxSizing: "border-box",
  };
  return (
    <div style={style}>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} style={{ flex: lines > 1 ? 1 : undefined, display: "flex", alignItems: "center", maxWidth: "100%", overflow: "hidden", textOverflow: el.ticker ? "clip" : "ellipsis", justifyContent: el.align === "center" ? "center" : el.align === "right" ? "flex-end" : "flex-start" }}>{parts ? parts[i] : text}</span>
      ))}
    </div>
  );
}

/** A finished card at any size: it fills the width of its parent and keeps its real shape. */
export default function CardView({ tpl, ctx, className = "", children, side = "front" }: { tpl: Template; ctx: Ctx; className?: string; children?: React.ReactNode; side?: "front" | "back" }) {
  const fmt = FORMATS[fmtOf(tpl)];
  const face = side === "back" && tpl.back ? tpl.back : tpl;
  const slot = fmt.slot;
  return (
    <div className={`idcard-box ${className}`} style={{ position: "relative", width: "100%", aspectRatio: `${fmt.w} / ${fmt.h}`, overflow: "hidden", background: grad(face.bg.a, face.bg.b, face.bg.angle), containerType: "size", borderRadius: fmt.w > 150 ? "1.2% / 10%" : "3.5% / 2.4%", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as CSSProperties}>
      {face.bg.pattern && <div aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: face.bg.pattern.opacity, ...patternStyle(face.bg.pattern) }} />}
      {face.els.map((el) => <ElView key={el.id} el={el} ctx={ctx} />)}
      {slot && side === "front" && (
        // Lanyard slot guide: punch or cut inside the dashed outline.
        <div aria-hidden="true" style={{ position: "absolute", left: `${50 - slot.w / (fmt.w / 100) / 2}%`, top: "2.6%", width: `${slot.w / (fmt.w / 100)}%`, height: `${slot.h / (fmt.h / 100)}%`, borderRadius: "999px", background: "rgba(0,0,0,.35)", border: "0.5cqw dashed rgba(255,255,255,.75)", boxShadow: "0 0 0 0.25cqw rgba(0,0,0,.4)" }} />
      )}
      {children}
    </div>
  );
}
