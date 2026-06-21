import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Each journey has several humanPause calls plus three 2000ms waitBetweenSteps pauses.
  // 90s gives comfortable headroom without masking genuinely hung tests.
  timeout: 90_000,

  // Serial execution — the suite hits a live site, and the brief warns about
  // 403s if requests come in too fast.
  fullyParallel: false,
  workers: 1,

  retries: process.env.CI ? 1 : 0,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: 'https://commercialexperts.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Suppresses navigator.webdriver — without this, some pages detect Playwright
        // and return a blank body before any JavaScript runs.
        launchOptions: {
          args: ['--disable-blink-features=AutomationControlled'],
        },
      },
    },
  ],
});
