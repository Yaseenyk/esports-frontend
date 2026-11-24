"use client";

import { LazyMotion } from "framer-motion";

const loadFeatures = () => import("./motionFeatures").then((m) => m.default);

// The feature set loads as its own file after the page is up (menus and toasts animate once it arrives). Only the small animation feature set (menus, toasts, tabs) is shipped. Page and scroll reveals are plain CSS, see globals.css.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={loadFeatures} strict>{children}</LazyMotion>;
}
