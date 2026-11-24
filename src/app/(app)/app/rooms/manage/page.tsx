import type { Metadata } from "next";
import { OrganiserRoomsScreen } from "@/features/match-rooms/ui/RoomsScreens";

// The organiser's match rooms for one event (?id=<event id>; ids are not known at build time). Flag v3.rooms.
export const metadata: Metadata = { title: "Match rooms" };
export default function Page() { return <OrganiserRoomsScreen />; }
