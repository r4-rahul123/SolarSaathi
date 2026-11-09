import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const port = new URL(baseURL).port || "3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: "list",
  outputDir: "test-results/e2e",
  use: {
    baseURL,
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
  },
  ...(process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1"
    ? {}
    : {
        webServer: {
          command: `node node_modules/next/dist/bin/next dev --port ${port}`,
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }),
});
