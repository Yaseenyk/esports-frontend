import type { Metadata } from "next";
import { cardFontVars } from "@/components/idcard/fonts";
import IdCardStudio from "@/components/idcard/IdCardStudio";

export const metadata: Metadata = { title: "ID card maker" };

export default function Page() {
  return (
    <div className={cardFontVars}>
      <IdCardStudio />
    </div>
  );
}
