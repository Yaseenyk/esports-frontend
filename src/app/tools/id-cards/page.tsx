import type { Metadata } from "next";
import { cardFontVars } from "@/components/idcard/fonts";
import IdCardStudio from "@/components/idcard/IdCardStudio";

export const metadata: Metadata = { title: "ID card maker" };

export default function Page() {
  // A working tool, so it uses more of the screen than the reading pages do.
  return (
    <div className={`relative left-1/2 w-[min(100vw-2rem,1500px)] -translate-x-1/2 ${cardFontVars}`}>
      <IdCardStudio />
    </div>
  );
}
