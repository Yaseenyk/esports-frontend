import type { Metadata } from "next";
import ToolLanding from "@/components/seo/ToolLanding";
import PlannerCreate from "@/features/squad-planner/ui/PlannerCreate";
import { SCRIM_PLANNER_PAGE as t } from "@/features/squad-planner/page";
import { pageTitle } from "@/lib/schema";

export const metadata: Metadata = {
  title: pageTitle(t.title), description: t.description, alternates: { canonical: "/tools/scrim-time-planner/" },
  openGraph: { title: t.title, description: t.description, url: "/tools/scrim-time-planner/", images: ["/og.png"] }, twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.png"] },
};

export default function Page() {
  return <ToolLanding t={t}><PlannerCreate /></ToolLanding>;
}
