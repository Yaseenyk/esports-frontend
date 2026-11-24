/** API shapes -> domain. Fixed field lists: anything the server adds later never reaches a component. Bad rows are dropped, not repaired. */
import type {
  CalendarEntry, CalendarPage, CommunityStatus, MyCalendar, MyTrust, OwnEntry, OwnRating, PublicReview, RatingWindow, TrustScore, TrustSummary,
} from "@/features/community/domain";

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown, max = 200): string | null => (typeof v === "string" && v.trim() ? v.slice(0, max) : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9-]{1,80}$/;
const HTTPS = /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[^\s?#]*)?$/i;

export function toEntry(raw: unknown): CalendarEntry | null {
  const o = obj(raw), org = obj(o.organiser);
  const id = str(o.id, 64), title = str(o.title, 120), game = str(o.game, 20), city = str(o.city, 80), startsOn = str(o.startsOn, 10), endsOn = str(o.endsOn, 10), orgName = str(org.name, 120);
  if (!id || !title || !game || !city || !startsOn || !endsOn || !DAY.test(startsOn) || !DAY.test(endsOn) || !orgName) return null;
  const url = str(o.registrationUrl, 300);
  const slug = str(o.tournamentSlug, 80);
  return {
    id, title, game, city, startsOn, endsOn,
    online: o.online === true,
    status: o.status === "cancelled" ? "cancelled" : "listed",
    registrationUrl: url && HTTPS.test(url) ? url : null,
    tournamentSlug: slug && SLUG.test(slug) ? slug : null,
    organiser: { name: orgName, slug: str(org.slug, 80), verified: org.verified === true },
  };
}

export function toCalendarPage(raw: unknown): CalendarPage {
  const o = obj(raw);
  const today = str(o.today, 10);
  return { items: arr(o.items).map(toEntry).filter((e): e is CalendarEntry => e !== null), upcomingVerified: Math.max(0, Math.floor(num(o.upcomingVerified) ?? 0)), today: today && DAY.test(today) ? today : "" };
}

export function toMyCalendar(raw: unknown): MyCalendar {
  const o = obj(raw);
  const orgs = arr(o.orgs).flatMap((x) => { const r = obj(x), id = str(r.id, 64), name = str(r.name, 120); return id && name ? [{ id, name, slug: str(r.slug, 80) }] : []; });
  const items = arr(o.items).flatMap((x): OwnEntry[] => {
    const e = toEntry(x), r = obj(x);
    return e ? [{ ...e, orgId: str(r.orgId, 64) ?? "", hidden: r.hidden === true, hiddenReason: str(r.hiddenReason, 40) }] : [];
  });
  return { orgs, items };
}

export const toStatus = (raw: unknown): CommunityStatus => ({ calendar: obj(raw).calendar === true, trust: obj(raw).trust === true });

const toWindow = (raw: unknown): RatingWindow => {
  const o = obj(raw);
  const state = o.state === "open" || o.state === "not_yet" || o.state === "closed" ? o.state : "no_dates";
  return { state, opensAt: str(o.opensAt, 40), closesAt: str(o.closesAt, 40), days: num(o.days) ?? 30 };
};

const star = (v: unknown): number | null => { const n = num(v); return n !== null && n >= 1 && n <= 5 ? n : null; };

function toScore(raw: unknown): TrustScore {
  const o = obj(raw), a = obj(o.aspects), d = obj(o.distribution);
  const average = num(o.average);
  const shown = average !== null;
  return {
    count: Math.max(0, Math.floor(num(o.count) ?? 0)),
    minimum: Math.max(1, Math.floor(num(o.minimum) ?? 5)),
    average: shown ? average : null,
    aspects: shown && o.aspects ? { onTime: num(a.onTime) ?? 0, fair: num(a.fair) ?? 0, communication: num(a.communication) ?? 0 } : null,
    distribution: shown && o.distribution ? { 1: num(d[1]) ?? 0, 2: num(d[2]) ?? 0, 3: num(d[3]) ?? 0, 4: num(d[4]) ?? 0, 5: num(d[5]) ?? 0 } : null,
  };
}

function toReview(raw: unknown): PublicReview | null {
  const o = obj(raw), t = obj(o.tournament), r = obj(o.reply);
  const id = str(o.id, 64), displayName = str(o.displayName, 40);
  if (!id || !displayName) return null;
  const tSlug = str(t.slug, 80);
  const replyText = str(r.text, 1000);
  return {
    id, displayName,
    verifiedAs: o.verifiedAs === "played" ? "played" : "checked_in",
    stars: star(o.stars),
    review: str(o.review, 1000),
    createdAt: str(o.createdAt, 40),
    tournament: tSlug && SLUG.test(tSlug) ? { slug: tSlug, title: str(t.title, 120) } : null,
    reply: replyText ? { text: replyText, at: str(r.at, 40) } : null,
    replyHidden: o.replyHidden === true,
  };
}

export function toTrustSummary(raw: unknown): TrustSummary | null {
  const o = obj(raw), t = obj(o.tournament), g = obj(o.organiser);
  const slug = str(t.slug, 80), title = str(t.title, 120);
  if (!slug || !title) return null;
  return {
    tournament: { slug, title },
    organiser: { name: str(g.name, 120), verified: g.verified === true },
    score: toScore(o.score),
    reviews: arr(o.reviews).map(toReview).filter((r): r is PublicReview => r !== null),
    window: toWindow(o.window),
  };
}

export function toOwnRating(raw: unknown): OwnRating | null {
  const o = obj(raw);
  const id = str(o.id, 64), stars = star(o.stars);
  if (!id || stars === null) return null;
  return {
    id, stars,
    displayName: str(o.displayName, 40) ?? "",
    verifiedAs: str(o.verifiedAs, 20) ?? "checked_in",
    onTime: star(o.onTime) ?? stars, fair: star(o.fair) ?? stars, communication: star(o.communication) ?? stars,
    review: str(o.review, 1000), hidden: o.hidden === true, hiddenReason: str(o.hiddenReason, 40), createdAt: str(o.createdAt, 40),
  };
}

export const toMyTrust = (raw: unknown): MyTrust => {
  const o = obj(raw);
  return { adultConfirmed: o.adultConfirmed === true, isOrganiser: o.isOrganiser === true, canReply: o.canReply === true, window: toWindow(o.window), myRating: o.myRating ? toOwnRating(o.myRating) : null, suggestedName: str(o.suggestedName, 40) };
};
