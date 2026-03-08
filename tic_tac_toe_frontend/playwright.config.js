// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/**
 * Playwright E2E configuration for the Tic Tac Toe React app.
 *
 * By default, tests target the local CRA dev server at http://localhost:3000.
 * Override via:
 *   - PLAYWRIGHT_BASE_URL (recommended in CI when using a preview URL)
 */
module.exports = defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  outputDir: "test-results",
});
