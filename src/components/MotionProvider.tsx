"use client";

import { domAnimation, LazyMotion } from "framer-motion";

// Only the small animation feature set (menus, toasts, tabs) is shipped. Page and scroll reveals are plain CSS, see globals.css.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation} strict>{children}</LazyMotion>;
}
