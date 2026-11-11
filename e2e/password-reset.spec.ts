// Password reset by email, with the server mocked.
import { expect, test } from "@playwright/test";
import { json, preflight } from "./helpers";

test("the sign-in page links to forgot password and carries the typed email; sign-up has no such link", async ({ page }) => {
  await page.goto("/login/");
  const link = page.getByRole("link", { name: "Forgot password?" });
  await expect(link).toHaveAttribute("href", "/forgot-password/");
  await page.getByLabel("Email").fill("a@example.com");
  await expect(link).toHaveAttribute("href", "/forgot-password/?email=a%40example.com");
  await page.goto("/signup/");
  await expect(page.getByRole("link", { name: "Forgot password?" })).toHaveCount(0);
});

test("forgot password: same neutral message and a resend countdown", async ({ page }) => {
  await preflight(page);
  let n = 0;
  await page.route("**/auth/forgot", (r) => { n++; return r.fulfill(json({ ok: true })); });
  await page.goto("/forgot-password/?email=a%40example.com");
  await expect(page.getByLabel("Email")).toHaveValue("a@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status").filter({ hasText: "If an account exists for that email, we have sent a link. It works for 30 minutes. Check spam too." })).toBeVisible();
  await expect(page.getByRole("button", { name: /Send again in \d+s/ })).toBeDisabled();
  expect(n).toBe(1);
});

test("forgot password: malformed email, rate limit and network failure are explained", async ({ page }) => {
  await preflight(page);
  await page.route("**/auth/forgot", (r) => r.fulfill(json({ error: "rate" }, 429)));
  await page.goto("/forgot-password/");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /does not look like an email/i })).toBeVisible();
  await page.getByLabel("Email").fill("a@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Too many tries. Wait a few minutes." })).toBeVisible();
  await page.unroute("**/auth/forgot");
  await page.route("**/auth/forgot", (r) => r.abort());
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /could not reach the server/i })).toBeVisible();
});

test("reset password: the token leaves the address bar and success leads to sign in", async ({ page }) => {
  await preflight(page);
  let body = "";
  await page.route("**/auth/reset", (r) => { body = r.request().postData() ?? ""; return r.fulfill(json({ ok: true })); });
  await page.goto("/reset-password/?t=secret-token-1");
  const pw = page.getByLabel("New password", { exact: true });
  await expect(pw).toBeVisible();
  expect(page.url()).not.toContain("secret-token-1");
  expect(page.url()).not.toContain("?");
  await pw.fill("a-good-password");
  await page.getByLabel("Confirm new password").fill("a-good-password");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page.getByRole("status").filter({ hasText: /password is changed/i })).toBeVisible();
  expect(JSON.parse(body)).toEqual({ token: "secret-token-1", password: "a-good-password" });
  await page.getByRole("main").getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/login\//);
});

test("reset password: mismatch, weak password, expired link and missing token", async ({ page }) => {
  await preflight(page);
  await page.route("**/auth/reset", (r) => {
    const pw = JSON.parse(r.request().postData() ?? "{}").password;
    return r.fulfill(pw === "weakweak" ? json({ error: "Password is too common" }, 400) : json({ error: "invalid_or_expired" }, 400));
  });
  await page.goto("/reset-password/?t=tok");
  const pw = page.getByLabel("New password", { exact: true }), pw2 = page.getByLabel("Confirm new password");
  await pw.fill("abcdefgh"); await pw2.fill("abcdefgz");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /do not match/i })).toBeVisible();
  await pw.fill("weakweak"); await pw2.fill("weakweak");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Password is too common" })).toBeVisible();
  await pw.fill("another-pass"); await pw2.fill("another-pass");
  await page.getByRole("button", { name: "Set new password" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "This link has expired or was already used" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Request a new link" })).toHaveAttribute("href", "/forgot-password/");
  await page.goto("/reset-password/");
  await expect(page.getByRole("link", { name: "Request a new link" })).toBeVisible();
  await expect(page.getByLabel("New password", { exact: true })).toHaveCount(0);
});
