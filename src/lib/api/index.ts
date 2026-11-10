import { createClient } from "./client";

/** Where the backend lives. Empty means "no backend configured": the site then runs fully in the browser, exactly as before. */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
export const hasBackend = API_BASE !== "";

let token: string | null = null;
export const setToken = (t: string | null) => { token = t; };

/** One shared client for the whole app, so every screen shares one cache and one set of in-flight requests. */
export const api = createClient({ base: API_BASE, token: () => token });

export { ApiError } from "./client";
export { createBatchQueue } from "./queue";
export { createPoller } from "./poller";
