import { Page } from '@playwright/test';

// A slightly longer pause between form sections, on top of the per-interaction
// humanPause calls. Gives the server time to process the previous submission
// before the next step starts.
export async function waitBetweenSteps(page: Page, ms = 2000): Promise<void> {
  await page.waitForTimeout(ms);
}

export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('load');
}
