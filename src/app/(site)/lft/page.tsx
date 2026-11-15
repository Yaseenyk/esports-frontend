import type { Metadata } from "next";
import { BoardScreen } from "@/features/lft/ui/LftScreens";

export const metadata: Metadata = { title: "Looking for team or player" };
export default function Page() { return <BoardScreen />; }
