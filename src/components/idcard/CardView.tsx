import type { CSSProperties } from "react";
import { maskAadhaar } from "@/lib/idcard/aadhaar";
import { FONTS, FORMATS, fmtOf, type El, type Person, type Template } from "@/lib/idcard/types";

export interface Ctx { event: string; game: string; teamName: string; person: Person }

export function fieldValue(el: El, c: Ctx): string {
  const p = c.person;
  switch (el.field) {
    case "name": return p.name;
    case "team": return c.teamName;
    case "role": return p.role;
    case "id": return p.id;
    case "event": return c.event;
    case "game": return c.game;
    case "dob": return p.dob ?? "";
    case "gender": return p.gender ?? "";
    case "aadhaar": return maskAadhaar(p.last4);
    default: return "";
  }
}

const grad = (a: string, b: string, angle: number) => `linear-gradient(${angle}deg, ${a}, ${b})`;

/** One element, drawn from percentages so the card is resolution independent. */
export function ElView({ el, ctx }: { el: El; ctx: Ctx }) {
  const box: CSSProperties = { position: "absolute", left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%`, transform: el.rot ? `rotate(${el.rot}deg)` : undefined, opacity: el.opacity };
  if (el.kind === "rect" || el.kind === "ellipse") {
    return <div style={{ ...box, background: el.fill2 ? grad(el.fill ?? "#fff", el.fill2, 90) : el.fill, borderRadius: el.kind === "ellipse" ? "50%" : `${el.radius ?? 0}cqmin`, border: el.stroke ? `${el.strokeW ?? 0.5}cqw solid ${el.stroke}` : undefined }} />;
  }
  if (el.kind === "photo") {
    const r = el.radius ?? 0;
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
    // eslint-disable-next-line @next/next/no-img-element
    return el.src ? <img src={el.src} alt="" style={{ ...box, objectFit: "contain", borderRadius: `${el.radius ?? 0}cqmin` }} /> : <div style={{ ...box, border: "0.4cqw dashed #ffffff55" }} />;
  }
  const text = el.kind === "field" ? fieldValue(el, ctx) : el.text ?? "";
  // Auto-fit: long names shrink to fit their box instead of being cut off. Wide, heavy or capital letters take more room.
  const k = el.font === "heavy" ? 0.68 : el.upper ? 0.64 : el.font === "mono" ? 0.6 : el.font === "serif" ? 0.5 : 0.54;
  const base = el.size ?? 4;
  const fit = Math.min(base, (el.w * 0.96) / Math.max(1, text.length * k + (el.spacing ?? 0) * text.length * 0.5));
  return (
    <div style={{ ...box, display: "flex", alignItems: "center", justifyContent: el.align === "center" ? "center" : el.align === "right" ? "flex-end" : "flex-start", overflow: "hidden", whiteSpace: "nowrap", color: el.color, fontFamily: FONTS[el.font ?? "body"].css, fontSize: `${Math.max(fit, base * 0.45)}cqw`, fontWeight: el.weight ?? 600, textTransform: el.upper ? "uppercase" : undefined, letterSpacing: el.spacing ? `${el.spacing}cqw` : undefined, lineHeight: 1.1 }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{text}</span>
    </div>
  );
}

/** A finished card at any size: it fills the width of its parent and keeps its real shape. */
export default function CardView({ tpl, ctx, className = "", children }: { tpl: Template; ctx: Ctx; className?: string; children?: React.ReactNode }) {
  const fmt = FORMATS[fmtOf(tpl)];
  const slot = fmt.slot;
  return (
    <div className={`idcard-box ${className}`} style={{ position: "relative", width: "100%", aspectRatio: `${fmt.w} / ${fmt.h}`, overflow: "hidden", background: grad(tpl.bg.a, tpl.bg.b, tpl.bg.angle), containerType: "size", borderRadius: fmt.w > 150 ? "1.2% / 10%" : "3.5% / 2.4%", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as CSSProperties}>
      {tpl.els.map((el) => <ElView key={el.id} el={el} ctx={ctx} />)}
      {slot && (
        // Lanyard slot guide: punch or cut inside the dashed outline.
        <div aria-hidden="true" style={{ position: "absolute", left: `${50 - slot.w / (fmt.w / 100) / 2}%`, top: "2.6%", width: `${slot.w / (fmt.w / 100)}%`, height: `${slot.h / (fmt.h / 100)}%`, borderRadius: "999px", background: "rgba(0,0,0,.35)", border: "0.5cqw dashed rgba(255,255,255,.75)", boxShadow: "0 0 0 0.25cqw rgba(0,0,0,.4)" }} />
      )}
      {children}
    </div>
  );
}
