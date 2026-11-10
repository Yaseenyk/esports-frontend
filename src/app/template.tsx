"use client";

import { PageFade } from "@/components/Motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageFade>{children}</PageFade>;
}
