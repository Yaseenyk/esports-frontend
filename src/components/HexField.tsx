"use client";

import { useEffect, useRef } from "react";

/**
 * A honeycomb that lives behind the whole site. Cells light up around the pointer and ripple when you click or tap.
 * It only redraws while something is moving, and it is a quiet static grid for people who prefer reduced motion.
 */
export default function HexField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const R = 34;
    const W = Math.sqrt(3) * R;
    let w = 0, h = 0, dpr = 1, raf = 0, lastMove = 0;
    const mouse = { x: -999, y: -999 };
    const ripples: { x: number; y: number; t: number }[] = [];
    const hexPath = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.closePath();
    };
    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const idle = now - lastMove > 1400;
      for (let row = -1; row * R * 1.5 < h + R; row++) {
        for (let col = -1; col * W < w + W; col++) {
          const cx = col * W + (row & 1 ? W / 2 : 0), cy = row * R * 1.5;
          let k = 0;
          if (!idle || ripples.length) {
            const d = Math.hypot(cx - mouse.x, cy - mouse.y);
            k = idle ? 0 : Math.max(0, 1 - d / 190) ** 2;
            for (const r of ripples) { const age = (now - r.t) / 900; const ring = Math.abs(Math.hypot(cx - r.x, cy - r.y) - age * 420); if (ring < 46 && age < 1) k = Math.max(k, (1 - ring / 46) * (1 - age)); }
          }
          const t = Math.min(1, Math.max(0, cx / w));
          const color = `${Math.round(34 + t * 134)}, ${Math.round(211 - t * 127)}, ${Math.round(238 + t * 9)}`;
          hexPath(cx, cy, R - 1.5);
          if (k > 0.01) { ctx.fillStyle = `rgba(${color}, ${0.16 * k})`; ctx.fill(); ctx.strokeStyle = `rgba(${color}, ${0.15 + 0.6 * k})`; }
          else ctx.strokeStyle = "rgba(255,255,255,0.045)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      while (ripples.length && now - ripples[0].t > 900) ripples.shift();
    };
    const loop = (now: number) => {
      draw(now);
      raf = now - lastMove < 1500 || ripples.length ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => { lastMove = performance.now(); if (!raf && !reduce) raf = requestAnimationFrame(loop); };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2); w = window.innerWidth; h = window.innerHeight;
      cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + "px"; cv.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(performance.now());
    };
    const move = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; kick(); };
    const down = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() }); kick(); };
    resize();
    window.addEventListener("resize", resize);
    if (!reduce) { window.addEventListener("pointermove", move, { passive: true }); window.addEventListener("pointerdown", down, { passive: true }); }
    return () => { window.removeEventListener("resize", resize); window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", down); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className="hexfield no-print pointer-events-none fixed inset-0 -z-10" />;
}
