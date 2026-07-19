import { defineConfig, devices } from "@playwright/test";

const rawExternalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const externalBaseUrl =
  rawExternalBaseUrl && !rawExternalBaseUrl.endsWith("/")
    ? `${rawExternalBaseUrl}/`
    : rawExternalBaseUrl;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: externalBaseUrl ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile-chromium",
      use: devices["Pixel 7"],
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: "npm run dev -- --hostname 127.0.0.1",
        reuseExistingServer: false,
        url: "http://127.0.0.1:3000",
      },
});
