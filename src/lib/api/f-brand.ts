/** Brand kit calls: a logo and two colours, saved once for an account or for one event. */
import { api } from "./index";

export interface BrandKit { name: string; logo: string | null; primaryColor: string; secondaryColor: string; updatedAt?: string }
/** Where the kit in force came from: this event's own kit, the account kit, or nothing saved yet. */
export type BrandSource = "event" | "account" | "none";
export interface BrandState { brand: BrandKit | null; source: BrandSource }
export interface BrandInput { name: string; logo?: string | null; primaryColor: string; secondaryColor: string }
/** What a public page may see: no ids, no owner, no times. */
export interface PublicBrandKit { name: string; logo: string | null; primaryColor: string; secondaryColor: string }

const ev = (id: string) => `/events/${encodeURIComponent(id)}/brand`;
const FRESH = { ttl: 0, swr: 0 } as const;

export const brandApi = {
  /** The signed-in user's account kit. */
  account: () => api.get<BrandState>("/brand", FRESH),
  saveAccount: (b: BrandInput) => api.put<BrandState>("/brand", b),
  removeAccount: () => api.del<BrandState>("/brand"),
  /** The kit in force for one event (its own, else the account kit) and where it came from. */
  event: (eventId: string) => api.get<BrandState>(ev(eventId), FRESH),
  saveEvent: (eventId: string, b: BrandInput) => api.put<BrandState>(ev(eventId), b),
  removeEvent: (eventId: string) => api.del<BrandState>(ev(eventId)),
  /** Unauthenticated, by live page slug. Conditional GET: the shared client sends the ETag and treats 304 as "unchanged". A 404 is the same for unknown and unpublished pages. */
  public: (slug: string) => api.get<{ brand: PublicBrandKit | null }>(`/public/brand/${encodeURIComponent(slug)}`, { ttl: 30_000, swr: 0, retries: 1 }),
};
