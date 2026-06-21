import { Page, Locator } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async acceptCookies(): Promise<void> {
    // CWUK uses <a> links for the cookie banner rather than <button> elements.
    const acceptLocator = this.page.getByRole('link', { name: /^accept$/i })
      .or(this.page.getByRole('button', { name: /accept/i }));
    try {
      await acceptLocator.first().waitFor({ state: 'visible', timeout: 5_000 });
      await acceptLocator.first().click();
    } catch { /* banner not present */ }
  }

  // Randomised rather than fixed so the timing doesn't appear as a metronome in server logs.
  async humanPause(minMs = 600, maxMs = 1400): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs) + minMs);
    await this.page.waitForTimeout(delay);
  }

  protected async clickTile(label: string): Promise<boolean> {
    // Regex special chars are escaped so values like '$3000+' match literally.
    // Substring (non-anchored) match is intentional — some sites append Font Awesome
    // icon characters to button accessible names, which breaks an anchored pattern.
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const namePattern = new RegExp(escaped, 'i');
    for (const role of ['radio', 'button'] as const) {
      const loc = this.page.getByRole(role, { name: namePattern });
      try {
        await loc.first().waitFor({ state: 'visible', timeout: 4_000 });
        await loc.first().click({ force: true });
        return true;
      } catch { /* try next role */ }
    }
    return false;
  }

  protected async fillTextStep(input: Locator, value: string, charDelay = 70): Promise<void> {
    await input.pressSequentially(value, { delay: charDelay });
    await this.humanPause();
    // force: true bypasses Playwright's stability check on the Continue button's pulse animation.
    await this.page.getByRole('button', { name: /continue/i }).click({ force: true });
    await this.page.waitForLoadState('domcontentloaded');
    await this.humanPause();
  }

  async waitForNavigation(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout: 30_000 });
  }
}
