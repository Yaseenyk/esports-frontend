/** After sign-in only a path inside the app is accepted as the return address, so a crafted link cannot send someone to another site. */
export const safeNext = (n: string | null): string => (n && /^\/app\/[A-Za-z0-9\-_/?=&%.]*$/.test(n) && !n.includes("//") && !n.includes("..") ? n : "/app/");
