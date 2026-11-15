import type { Metadata } from "next";
import { TournamentEditorScreen } from "@/features/tournaments/ui/OrganiserScreens";

// Create, edit and publish one tournament. The event comes from the query string (?id=<event id>): ids are not known at build time.
export const metadata: Metadata = { title: "Manage tournament" };
export default function Page() { return <TournamentEditorScreen />; }
