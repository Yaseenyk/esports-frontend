/** Dates for people, always in Indian time so the build machine's timezone never changes the page. */
const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
const fmtTime = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });

export function dateText(iso: string | null): string {
  if (!iso) return "Date to be announced";
  const t = Date.parse(iso);
  return Number.isFinite(t) ? fmt.format(t) : "Date to be announced";
}
export function dateTimeText(iso: string | null): string {
  if (!iso) return "Time to be announced";
  const t = Date.parse(iso);
  return Number.isFinite(t) ? `${fmtTime.format(t)} IST` : "Time to be announced";
}
export function whereText(v: "online" | "offline" | "hybrid" | null, city: string | null, state: string | null): string {
  const place = [city, state].filter(Boolean).join(", ");
  if (v === "online") return "Online";
  if (v === "hybrid") return place ? `Online and in person, ${place}` : "Online and in person";
  return place || "Venue to be announced";
}
