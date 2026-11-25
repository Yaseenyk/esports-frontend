import type { Metadata } from "next";
import { cardFontVars } from "@/components/idcard/fonts";
import { PlayerCardStudio } from "@/features/player-card/ui/PlayerCardStudio";

export const metadata: Metadata = { title: "My player card" };

export default function Page() {
  return <div className={cardFontVars}><PlayerCardStudio /></div>;
}
