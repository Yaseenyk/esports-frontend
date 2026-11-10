import { defineConfig, devices } from "@playwright/test";

const PORT = 4300;

// Tests run against the built static site (`npm run build` first), served like GitHub Pages serves it.
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure", acceptDownloads: true },
  webServer: { command: "node scripts/serve-out.mjs", url: `http://localhost:${PORT}/`, reuseExistingServer: !process.env.CI, env: { PORT: String(PORT) } },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: process.env.CI ? undefined : "chrome", viewport: { width: 1280, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"], channel: process.env.CI ? undefined : "chrome" } },
  ],
});
