// The sign-in and sign-up form (validation, messages) and the "Check your email" screen, with the server mocked.
import { expect, test } from "@playwright/test";
import { json, mockContext, mockUser, preflight, signedIn } from "./helpers";

const API = "https://esports-api.yaseenyk.workers.dev";
const ctxUnverified = (email = "sam@gmail.com") => mockContext({ user: mockUser({ email, name: "Sam", emailVerified: false, verifyRequired: true }) });

test("sign-up says what is wrong under each field and focuses the first one, sending nothing", async ({ page }) => {
  await preflight(page);
  let sent = 0;
  await page.route(`${API}/auth/register`, (r) => { sent++; return r.fulfill(json({}, 201)); });
  await page.goto("/signup/");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  await expect(page.getByText("Enter your email address.")).toBeVisible();
  await expect(page.getByText("Create a password.")).toBeVisible();
  await expect(page.getByText("Tick the box to confirm you are 18 or older.")).toBeVisible();
  await expect(page.getByLabel("Your name")).toBeFocused();
  expect(sent).toBe(0);
});

test("fields are checked as you leave them, and a problem clears as soon as the value is fine", async ({ page }) => {
  await preflight(page);
  await page.goto("/signup/");
  const email = page.getByLabel("Email");
  await email.fill("not-an-email");
  await email.blur();
  await expect(page.getByText(/does not look like an email/)).toBeVisible();
  await email.fill("sam@example.com");
  await expect(page.getByText(/does not look like an email/)).toHaveCount(0);

  const pw = page.getByLabel("Password", { exact: true });
  await pw.fill("short");
  await pw.blur();
  await expect(page.getByText(/at least 8 characters \(you have 5\)/)).toBeVisible();
  await pw.fill("password");
  await pw.blur();
  await expect(page.getByText(/too easy to guess/)).toBeVisible();
  await pw.fill("correct-Horse-battery-9!");
  await expect(page.getByText(/Password strength:/)).toContainText("Strong");
});

test("a mistyped email domain is offered a one-tap fix", async ({ page }) => {
  await preflight(page);
  await page.goto("/signup/");
  await page.getByLabel("Email").fill("sam@gmial.com");
  await page.getByRole("button", { name: "sam@gmail.com" }).click();
  await expect(page.getByLabel("Email")).toHaveValue("sam@gmail.com");
});

test("an email that already has an account says so and offers to sign in instead", async ({ page }) => {
  await preflight(page);
  await page.route(`${API}/auth/register`, (r) => r.fulfill(json({ error: "An account with this email already exists" }, 409)));
  await page.goto("/signup/");
  await page.getByLabel("Your name").fill("Sam");
  await page.getByLabel("Email").fill("sam@example.com");
  await page.getByLabel("Password", { exact: true }).fill("correct-Horse-battery-9!");
  await page.getByLabel(/I am 18 or older/).check();
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("That email already has an account.")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeFocused();
  await page.getByRole("button", { name: "Sign in instead" }).click();
  await expect(page.getByRole("button", { name: "Sign in", exact: true }).last()).toBeVisible();
});

test("a wrong password on sign-in is explained, keeps the email, and offers a reset", async ({ page }) => {
  await preflight(page);
  await page.route(`${API}/auth/login`, (r) => r.fulfill(json({ error: "Wrong email or password" }, 401)));
  await page.goto("/login/");
  await page.getByLabel("Email").fill("sam@example.com");
  await page.getByLabel("Password", { exact: true }).fill("not-my-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText(/email and password do not match/)).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveValue("sam@example.com");
  await expect(page.getByLabel("Password", { exact: true })).toBeFocused();
  await expect(page.getByRole("link", { name: "reset your password" }).or(page.getByRole("link", { name: "Forgot password?" })).first()).toBeVisible();
});

test("the eye button shows and hides the password", async ({ page }) => {
  await preflight(page);
  await page.goto("/login/");
  const pw = page.getByLabel("Password", { exact: true });
  await expect(pw).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show characters" }).click();
  await expect(pw).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Show characters" }).click();
  await expect(pw).toHaveAttribute("type", "password");
});

test("a new account that is not confirmed sees 'Check your email' instead of the app, with an inbox shortcut and a wait before resending", async ({ page }) => {
  await signedIn(page, [], { context: ctxUnverified() });
  await page.goto("/app/");
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  await expect(page.getByText("sam@gmail.com")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Gmail" })).toHaveAttribute("href", /mail\.google\.com/);
  await expect(page.getByRole("button", { name: /Send again in \d+s/ })).toBeDisabled();
  await expect(page.getByRole("heading", { name: /Welcome/ })).toHaveCount(0);
});

test("the screen notices on its own when the email gets confirmed and opens the app", async ({ page }) => {
  await signedIn(page, [], { context: ctxUnverified() });
  let confirmed = false;
  await page.route(`${API}/me/context`, (r) => r.fulfill(json(confirmed ? mockContext() : ctxUnverified())));
  await page.goto("/app/");
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  confirmed = true; // the link was opened on another device
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Check your email" })).toHaveCount(0);
});

test("a mistyped address can be fixed from the screen, and the taken or invalid cases are explained", async ({ page }) => {
  await signedIn(page, [], { context: ctxUnverified("sam@gmial.com") });
  let body: unknown = null;
  await page.route(`${API}/me/email/change`, async (r) => {
    body = r.request().postDataJSON();
    const e = (body as { email: string }).email;
    if (e === "taken@example.com") return r.fulfill(json({ error: "An account with this email already exists", code: "email_taken" }, 409));
    return r.fulfill(json({ ok: true, email: e }));
  });
  await page.goto("/app/");
  await page.getByRole("button", { name: "Wrong email? Change it" }).click();
  const box = page.getByLabel("Correct email address");
  await box.fill("nope");
  await page.getByRole("button", { name: "Save and send" }).click();
  await expect(page.getByText(/does not look like an email/)).toBeVisible();
  await box.fill("taken@example.com");
  await page.getByRole("button", { name: "Save and send" }).click();
  await expect(page.getByText("That email already has an account.")).toBeVisible();
  await box.fill("sam@gmail.com");
  await page.getByRole("button", { name: "Save and send" }).click();
  await expect(page.getByText("We sent a new link to sam@gmail.com.")).toBeVisible();
  await expect(page.getByText("sam@gmail.com").first()).toBeVisible();
  expect(body).toEqual({ email: "sam@gmail.com" });
});
