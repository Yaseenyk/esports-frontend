import { api } from "./index";

/** Email verification (S6). Both calls need a signed-in session. */
export const verifyEmail = {
  /** Emails a new link. The server answers the same whether or not the address is already verified. */
  start: () => api.post<{ ok: true }>("/me/email/verify/start", {}),
  confirm: (token: string) => api.post<{ ok: true }>("/me/email/verify", { token }),
};
