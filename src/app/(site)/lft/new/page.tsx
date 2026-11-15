import type { Metadata } from "next";
import { NewListingScreen } from "@/features/lft/ui/LftScreens";

export const metadata: Metadata = { title: "Post a listing" };
export default function Page() { return <NewListingScreen />; }
