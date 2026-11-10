"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

/** A card link that tilts toward the pointer and catches a moving glare. Touch and reduced-motion users get a plain card. */
export default function TiltLink({ href, className = "", children }: { href: string; className?: string; children: ReactNode }) {
  const el = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !el.current) return;
    const b = el.current.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    el.current.style.setProperty("--rx", `${(0.5 - y) * 12}deg`);
    el.current.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
    el.current.style.setProperty("--gx", `${x * 100}%`);
    el.current.style.setProperty("--gy", `${y * 100}%`);
  };
  const leave = () => { el.current?.style.setProperty("--rx", "0deg"); el.current?.style.setProperty("--ry", "0deg"); };
  return (
    <Link ref={el} href={href} onPointerMove={move} onPointerLeave={leave} className={`tilt card relative block overflow-hidden ${className}`}>
      {children}
    </Link>
  );
}
