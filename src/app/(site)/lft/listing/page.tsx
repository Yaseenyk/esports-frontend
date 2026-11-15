import type { Metadata } from "next";
import { ListingScreen } from "@/features/lft/ui/LftScreens";

export const metadata: Metadata = { title: "Listing" };
export default function Page() { return <ListingScreen />; }
