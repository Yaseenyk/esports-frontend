import { api } from "./index";

/** Email verification (S6). Both calls need a signed-in session. */
export const verifyEmail = {
  /** Emails a new link. The server answers the same whether or not the address is already verified. */
  start: () => api.post<{ ok: true }>("/me/email/verify/start", {}),
  /** Fixes a mistyped address before it was confirmed; the server sends a new link to it. */
  change: (email: string) => api.post<{ ok: true; email: string }>("/me/email/change", { email }),
  confirm: (token: string) => api.post<{ ok: true }>("/me/email/verify", { token }),
};
