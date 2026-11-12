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

test("signup asks for the 18+ confirmation and sends nothing until it is ticked", async ({ page }) => {
  await preflight(page);
  let sent = 0;
  await page.route("**/auth/register", (r) => { sent++; return r.fulfill(json({ token: "t", user: { id: "u", email: "a@example.com", name: "A" } }, 201)); });
  await page.goto("/signup/");
  await page.getByLabel("Your name").fill("A");
  await page.getByLabel("Email").fill("a@example.com");
  await page.getByLabel("Password", { exact: true }).fill("longenough1");
  const box = page.getByLabel(/I am 18 or older/);
  await expect(box).not.toBeChecked();
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForTimeout(300);
  expect(sent).toBe(0);
  await box.check();
  await page.getByRole("button", { name: "Create account" }).click();
  await expect.poll(() => sent).toBe(1);
});

test("Continue with Google: needs the 18+ tick to create an account, sends the token, and a missing account explains itself on sign-in", async ({ page }) => {
  await preflight(page);
  await page.addInitScript(() => {
    const w = window as unknown as { __cb?: (r: { credential: string }) => void; google: unknown };
    w.google = { accounts: { id: { initialize: (o: { callback: (r: { credential: string }) => void }) => { w.__cb = o.callback; }, renderButton: () => {} } } };
  });
  const bodies: Record<string, unknown>[] = [];
  let reply: { status: number; body: unknown } = { status: 201, body: { token: "t", user: { id: "u", email: "a@example.com", name: "A" }, created: true } };
  await page.route("**/auth/google", (r) => { bodies.push(r.request().postDataJSON()); return r.fulfill(json(reply.body, reply.status)); });

  await page.goto("/signup/");
  const wrap = page.getByTestId("google-button");
  await expect(wrap).toHaveAttribute("aria-disabled", "true");
  await page.getByLabel(/I am 18 or older/).check();
  await expect(wrap).not.toHaveAttribute("aria-disabled", "true");
  await page.evaluate(() => (window as unknown as { __cb: (r: { credential: string }) => void }).__cb({ credential: "tok" }));
  await expect.poll(() => bodies.length).toBe(1);
  expect(bodies[0]).toEqual({ credential: "tok", adult: true });

  reply = { status: 400, body: { error: "Confirm that you are 18 or older to create an account", code: "adult_required" } };
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto("/login/");
  await expect(page.getByTestId("google-button")).not.toHaveAttribute("aria-disabled", "true");
  await page.evaluate(() => (window as unknown as { __cb: (r: { credential: string }) => void }).__cb({ credential: "tok2" }));
  await expect(page.getByRole("alert").filter({ hasText: /[^ ]/ }).filter({ hasText: /no account for that Google address/i })).toBeVisible();
  expect(bodies[1]).toEqual({ credential: "tok2" });
});
