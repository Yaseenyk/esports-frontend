"use client";

import { memo } from "react";
import type { Payload } from "@/lib/display";
import BracketCarousel from "./BracketCarousel";
import CountdownBig from "./CountdownBig";
import ScheduleTimeline from "./ScheduleTimeline";
import StandingsList from "./StandingsList";

/**
 * One published view, drawn for a phone (the venue screen's vmin views are for TVs). Everything is plain text.
 * "My team" is marked by the renderers themselves with a data-mine attribute on the matching card, match or round.
 */
function ViewRenderer({ payload, team }: { payload: Payload; team: string }) {
  return payload.v === "table" ? <StandingsList d={payload.d} team={team} />
    : payload.v === "schedule" ? <ScheduleTimeline d={payload.d} team={team} />
    : payload.v === "bracket" ? <BracketCarousel d={payload.d} team={team} />
    : <CountdownBig d={payload.d} />;
}
export default memo(ViewRenderer);
