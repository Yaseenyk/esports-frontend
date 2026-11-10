"use client";

import { LazyMotion } from "framer-motion";

// The animation engine loads after first paint instead of inside every page's JavaScript.
const features = () => import("./motionFeatures").then((m) => m.default);

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={features} strict>{children}</LazyMotion>;
}
