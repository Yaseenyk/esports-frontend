/** Pure checks for the sign-in and sign-up form. The server checks everything again; these only say what is wrong sooner, and in words. */

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

export function checkEmail(v: string): string {
  const e = v.trim();
  if (!e) return "Enter your email address.";
  if (e.length > 254 || !EMAIL_RE.test(e)) return "That does not look like an email address. It should look like name@example.com.";
  return "";
}

export function checkName(v: string): string {
  const n = v.trim();
  if (!n) return "Enter your name.";
  if (n.length > 80) return "Use 80 characters or fewer.";
  return "";
}

/** Passwords everybody tries first. A short list on purpose: it only stops the worst choices. */
const COMMON = new Set([
  "password", "password1", "password123", "passw0rd", "12345678", "123456789", "1234567890", "11111111", "00000000", "qwertyui", "qwerty123", "qwertyuiop",
  "iloveyou", "letmein1", "welcome1", "welcome123", "admin123", "abc12345", "abcd1234", "1q2w3e4r", "asdfghjk", "zxcvbnm1", "india123", "esports123", "bgmi1234", "freefire1",
]);

export function checkPassword(v: string, email = ""): string {
  if (!v) return "Create a password.";
  if (v.length < 8) return `Use at least 8 characters (you have ${v.length}).`;
  if (v.length > 200) return "Use 200 characters or fewer.";
  const lower = v.toLowerCase();
  if (COMMON.has(lower) || /^(.)\1+$/.test(v)) return "That password is too easy to guess. Pick something less common.";
  const local = email.trim().toLowerCase().split("@")[0] ?? "";
  if (local.length >= 4 && lower.includes(local)) return "Your password should not contain your email name.";
  return "";
}

export type Strength = "weak" | "okay" | "good" | "strong";

export function passwordStrength(v: string, email = ""): Strength {
  if (checkPassword(v, email)) return "weak";
  let s = 0;
  if (v.length >= 10) s++;
  if (v.length >= 14) s++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return s <= 1 ? "okay" : s <= 3 ? "good" : "strong";
}

/** A common typo in the domain, so the form can ask "Did you mean ...?" instead of letting a mistyped address through. */
const DOMAIN_FIXES: Record<string, string> = {
  "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com", "gmail.con": "gmail.com", "gmail.co": "gmail.com", "gmail.cm": "gmail.com", "gmali.com": "gmail.com", "gnail.com": "gmail.com",
  "hotmial.com": "hotmail.com", "hotmail.con": "hotmail.com", "hotnail.com": "hotmail.com",
  "yahooo.com": "yahoo.com", "yaho.com": "yahoo.com", "yahoo.con": "yahoo.com", "yahho.com": "yahoo.com",
  "outlok.com": "outlook.com", "outlook.con": "outlook.com", "iclod.com": "icloud.com", "icloud.con": "icloud.com",
};

export function suggestEmail(v: string): string | null {
  const e = v.trim();
  const at = e.lastIndexOf("@");
  if (at < 1) return null;
  const fixed = DOMAIN_FIXES[e.slice(at + 1).toLowerCase()];
  return fixed ? `${e.slice(0, at)}@${fixed}` : null;
}
