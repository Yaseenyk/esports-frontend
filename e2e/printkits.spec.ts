import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test.describe("printable kits", () => {
  test("preview renders and the PDF downloads", async ({ page }) => {
    await page.goto("/tools/print-kits/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Printable tournament kits");
    await expect(page.getByRole("button", { name: /Match score sheet/ })).toHaveAttribute("aria-pressed", "true");
    const canvas = page.locator("#pk-preview canvas").first();
    await expect(canvas).toBeVisible();
    const filled = await canvas.evaluate((el: HTMLCanvasElement) => { const d = el.getContext("2d")!.getImageData(0, 0, el.width, el.height).data; for (let i = 0; i < d.length; i += 4) if (d[i]! < 100) return true; return false; });
    expect(filled).toBe(true);

    const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download PDF" }).click()]);
    expect(dl.suggestedFilename()).toBe("match-kit.pdf");
    const path = await dl.path();
    expect(readFileSync(path!).subarray(0, 4).toString()).toBe("%PDF");
    await expect(page.locator("#pk-pdf [role=status]")).toContainText("Done");
  });

  test("bracket needs two teams, then draws", async ({ page }) => {
    await page.goto("/tools/print-kits/");
    await page.getByRole("button", { name: /Bracket poster/ }).click();
    await expect(page.locator("#pk-preview")).toContainText("Add at least 2 teams");
    await expect(page.getByRole("button", { name: "Download PDF" })).toBeDisabled();
    await page.getByRole("button", { name: "Use an example list" }).click();
    await expect(page.locator("#pk-preview canvas").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Download PDF" })).toBeEnabled();
  });

  test("gate signs: pick a sign and download", async ({ page }) => {
    await page.goto("/tools/print-kits/");
    await page.getByRole("button", { name: /Gate signs/ }).click();
    await page.getByRole("button", { name: "Add Hindi labels" }).click();
    await expect(page.locator("#pk-preview canvas").first()).toBeVisible();
    const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download PDF" }).click()]);
    expect(readFileSync((await dl.path())!).subarray(0, 4).toString()).toBe("%PDF");
  });
});
