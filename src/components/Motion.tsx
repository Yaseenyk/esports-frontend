"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
import { useEffect, useRef, useState, type ReactNode } from "react";


/**
 * Scroll reveals done with CSS, so nothing is hidden until JavaScript arrives. Everything is visible in the HTML.
 * After hydration, content that is still below the fold is tucked away (data-hide), then eased in when it scrolls into view.
 * One shared IntersectionObserver serves every block on the page and writes the attribute straight to the element, so a page with
 * a dozen reveals no longer pays for a dozen observers, a dozen forced layouts and a dozen React re-renders at start-up.
 */
let revealIO: IntersectionObserver | null = null;
function revealObserver(): IntersectionObserver {
  if (!revealIO) {
    revealIO = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const el = e.target;
        if (e.isIntersecting) { el.removeAttribute("data-hide"); revealIO?.unobserve(el); } // on screen already, or has just arrived: show it and stop watching
        else el.setAttribute("data-hide", "1"); // below the fold: hide it until it comes into view
      }
    }, { rootMargin: "0px 0px -60px 0px" });
  }
  return revealIO;
}
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = revealObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return ref;
}

/** Fades and lifts its children in once, when they scroll into view. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} className={`rv ${className ?? ""}`} style={delay ? { transitionDelay: `${delay}s` } : undefined}>{children}</div>;
}

/** A grid or list whose direct <Item> children rise in one after another. */
export function Stagger({ children, className }: { children: ReactNode; className?: string; step?: number }) {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} className={`stagger ${className ?? ""}`}>{children}</div>;
}
export function Item({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

/**
 * Counts up to a number when it comes into view. The real number is in the page from the start (so search engines and anyone without
 * JavaScript read it), and the count-up plays over the top once the number is seen.
 */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(to);
  useEffect(() => {
    if (!inView || reduce) return;
    setN(0);
    const c = animate(0, to, { duration: 1.2, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to, reduce]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/** Page transition: a short upward settle done in CSS. The page is fully visible from the first paint. */
export function PageFade({ children }: { children: ReactNode }) {
  return <div className="page-in">{children}</div>;
}

/** Endless horizontal strip, paused on hover and when the user prefers reduced motion. */
export function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="marquee group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <div className="marquee-track animate-marquee flex w-max gap-4 group-hover:[animation-play-state:paused]">{children}{children}</div>
    </div>
  );
}
