import type { Metadata } from "next";
import MyLftScreen from "@/features/lft/ui/MyLftScreen";

export const metadata: Metadata = { title: "My listings" };
export default function Page() { return <MyLftScreen />; }
