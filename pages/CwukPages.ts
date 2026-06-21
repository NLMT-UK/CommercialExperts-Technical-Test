import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

// ─────────────────────────────────────────────────────────────────────────────
// Data types
// ─────────────────────────────────────────────────────────────────────────────

export interface CwukWasteDetails {
  wasteType: string;            // e.g. 'General'
  collectionFrequency: string;  // e.g. 'Ongoing Waste Collection'
  numberOfBins: string;         // e.g. 'Business'
}

export interface CwukBusinessDetails {
  companyName: string;
  businessType: string;  // e.g. 'Office'
  postcode: string;
}

export interface CwukContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Waste details
// ─────────────────────────────────────────────────────────────────────────────

export class CwukWasteDetailsPage extends BasePage {
  readonly url = '/uk/commercial-waste/Apply';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.acceptCookies();
  }

  // Each method falls back to a <select> in case the site ever replaces the
  // tile UI with a standard dropdown — the happy path is always the tile click.
  async selectWasteType(wasteType: string): Promise<void> {
    await this.humanPause();
    if (!await this.clickTile(wasteType)) {
      await this.page.getByLabel(/waste type/i).selectOption(wasteType);
    }
  }

  async selectCollectionFrequency(frequency: string): Promise<void> {
    await this.humanPause();
    if (!await this.clickTile(frequency)) {
      await this.page.getByLabel(/collection frequency|how often/i).selectOption(frequency);
    }
  }

  async selectNumberOfBins(numberOfBins: string): Promise<void> {
    await this.humanPause();
    if (!await this.clickTile(numberOfBins)) {
      await this.page.getByLabel(/number of bins|how many bins/i).selectOption(numberOfBins);
    }
  }

  async fillWasteDetails(data: CwukWasteDetails): Promise<void> {
    await this.selectWasteType(data.wasteType);
    await this.selectCollectionFrequency(data.collectionFrequency);
    await this.selectNumberOfBins(data.numberOfBins);
  }

  async clickNext(): Promise<void> {
    // Tile selections auto-advance to the next step as no Continue button exists here.
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Business details
// ─────────────────────────────────────────────────────────────────────────────

export class CwukBusinessDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async fillBusinessDetails(data: CwukBusinessDetails): Promise<void> {
    await this.humanPause();

    const companyInput = this.page.getByRole('textbox', { name: 'e.g. Acme Limited', exact: true });
    if (await companyInput.isVisible().catch(() => false)) {
      await this.fillTextStep(companyInput, data.companyName);
    }

    const postcodeInput = this.page.getByRole('textbox', { name: 'Postcode', exact: true });
    if (await postcodeInput.isVisible().catch(() => false)) {
      await this.fillTextStep(postcodeInput, data.postcode);
    }

    // Business type is a tile — clicking it auto-advances to the next step.
    await this.clickTile(data.businessType);
    await this.humanPause();
  }

  async clickNext(): Promise<void> {
    // fillTextStep clicks Continue after each text input above.
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Contact details
// ─────────────────────────────────────────────────────────────────────────────

export class CwukContactDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async fillContactDetails(data: CwukContactDetails): Promise<void> {
    await this.humanPause();

    // The form uses a single combined name field rather than separate first/last inputs.
    const nameInput = this.page.getByRole('textbox', { name: /forename|full.?name/i });
    if (await nameInput.isVisible().catch(() => false)) {
      await this.fillTextStep(nameInput, `${data.firstName} ${data.lastName}`);
    }

    const emailInput = this.page.getByRole('textbox', { name: /email/i });
    if (await emailInput.isVisible().catch(() => false)) {
      await this.fillTextStep(emailInput, data.email, 60);
    }

    // Phone is filled but not submitted here — clickNext() handles the final Continue.
    const phoneInput = this.page.getByRole('textbox', { name: 'e.g. 0207xxxxxxx', exact: true });
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.pressSequentially(data.phone, { delay: 80 });
    }
  }

  async clickNext(): Promise<void> {
    await this.humanPause();
    await this.page.getByRole('button', { name: /continue/i }).click({ force: true });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary page — assertion only, no interactions
// ─────────────────────────────────────────────────────────────────────────────

export class CwukSummaryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertOnSummaryPage(): Promise<void> {
    // The URL leaves the numbered steps (/apply/N) once the summary is reached.
    await this.page.waitForURL(/commercial-waste(?!.*\/apply\/\d)/i, { timeout: 30_000 });
    // Confirm the CTA is present — do NOT click it, this is a live system.
    await expect(
      this.page.getByRole('button', { name: /get my quote/i })
    ).toBeVisible({ timeout: 20_000 });
  }
}
