import { expect, test } from "@playwright/test";

test("the app can be installed: manifest, icons and a service worker", async ({ page, request }) => {
  const m = await (await request.get("/manifest.webmanifest")).json();
  expect(m.display).toBe("standalone");
  expect(m.start_url).toBe("/tools/check-in/");
  for (const icon of m.icons) expect((await request.get(icon.src)).status()).toBe(200);
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
});

test("the gate scanner page still opens with no connection once it has been opened before", async ({ page, context }) => {
  await page.goto("/tools/check-in/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // now controlled by the worker and cached
  await page.waitForLoadState("networkidle");
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/check-in/i);
  await context.setOffline(false);
});
