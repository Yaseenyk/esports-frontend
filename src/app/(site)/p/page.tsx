import type { Metadata } from "next";
import { CardProfileScreen } from "@/features/profiles";

export const metadata: Metadata = { title: "Player card" };
export default function Page() { return <CardProfileScreen />; }
