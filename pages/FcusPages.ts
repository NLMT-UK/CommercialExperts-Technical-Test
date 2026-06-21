import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

// ─────────────────────────────────────────────────────────────────────────────
// Data types
// ─────────────────────────────────────────────────────────────────────────────

export interface FcusVehicleDetails {
  fleetSize: string;        // e.g. '50+ Vehicles'
  hasExistingCard: string;  // e.g. 'No'
  cardType: string;         // e.g. 'Fleet Fuel Card'
  fuelLocation: string;     // e.g. 'Gas Stations'
  monthlySpend: string;     // e.g. '$3000+'
  vehicleType: string;      // e.g. 'Heavy Duty Trucks/Semis'
}

export interface FcusBusinessDetails {
  businessType: string;  // e.g. 'Corporation'
  industry: string;      // e.g. 'Logistics'
  zipCode: string;       // e.g. '99999'
  companyName: string;   // e.g. 'Testing Ltd'
}

export interface FcusContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Vehicle / fleet details
// ─────────────────────────────────────────────────────────────────────────────

export class FcusVehicleDetailsPage extends BasePage {
  readonly url = '/us/fuel-cards/Apply';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    // Clear cookies to ensure each run starts from a clean session.
    await this.page.context().clearCookies();
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await this.acceptCookies();
  }

  // Each method falls back to a <select> in case the tile UI is ever replaced.
  async selectFleetSize(fleetSize: string): Promise<void> {
    await this.humanPause();
    if (!await this.clickTile(fleetSize)) {
      await this.page.getByLabel(/fleet size|number of vehicles|how many vehicles/i).selectOption(fleetSize);
    }
  }

  async selectHasExistingCard(value: string): Promise<void> {
    await this.humanPause();
    if (!await this.clickTile(value)) {
      await this.page.getByLabel(/existing card|current.*card|already have/i).selectOption(value);
    }
  }

  async selectCardType(cardType: string): Promise<void> {
    await this.humanPause();
    if (!await this.clickTile(cardType)) {
      await this.page.getByLabel(/card type/i).selectOption(cardType);
    }
  }

  async selectFuelLocation(fuelLocation: string): Promise<void> {
    await this.humanPause();
    if (!await this.clickTile(fuelLocation)) {
      await this.page.getByLabel(/fuel location|where.*fuel|station/i).selectOption(fuelLocation);
    }
  }

  async selectMonthlySpend(monthlySpend: string): Promise<void> {
    await this.humanPause();
    if (!await this.clickTile(monthlySpend)) {
      await this.page.getByLabel(/monthly spend|monthly fuel/i).selectOption(monthlySpend);
    }
  }

  async selectVehicleType(vehicleType: string): Promise<void> {
    await this.humanPause();
    if (!await this.clickTile(vehicleType)) {
      await this.page.getByLabel(/vehicle type|type of vehicle/i).selectOption(vehicleType);
    }
  }

  async fillVehicleDetails(data: FcusVehicleDetails): Promise<void> {
    await this.selectFleetSize(data.fleetSize);
    await this.selectHasExistingCard(data.hasExistingCard);
    await this.selectCardType(data.cardType);
    await this.selectFuelLocation(data.fuelLocation);
    await this.selectMonthlySpend(data.monthlySpend);
    await this.selectVehicleType(data.vehicleType);
  }

  async clickNext(): Promise<void> {
    // Tile selections auto-advance — no Continue button exists on these steps.
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Business details
// ─────────────────────────────────────────────────────────────────────────────

export class FcusBusinessDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async selectBusinessType(businessType: string): Promise<void> {
    await this.humanPause();
    if (!await this.clickTile(businessType)) {
      await this.page.getByLabel(/business type|company type/i).selectOption(businessType);
    }
  }

  async selectIndustry(industry: string): Promise<void> {
    await this.humanPause();
    if (!await this.clickTile(industry)) {
      await this.page.getByLabel(/industry|sector/i).selectOption(industry);
    }
  }

  async fillZipCode(zipCode: string): Promise<void> {
    await this.humanPause();
    // Exact accessible name not yet confirmed from a live run — broad pattern covers likely formats.
    const input = this.page.getByRole('textbox', { name: /zip|postal|90210|\d{5}/i });
    if (await input.isVisible().catch(() => false)) {
      await this.fillTextStep(input, zipCode);
    }
  }

  async fillCompanyName(companyName: string): Promise<void> {
    await this.humanPause();
    // Exact accessible name not yet confirmed from a live run — broad pattern covers likely formats.
    const input = this.page.getByRole('textbox', { name: /company|business|organi|acme|corp|ltd/i });
    if (await input.isVisible().catch(() => false)) {
      await this.fillTextStep(input, companyName);
    }
  }

  async fillBusinessDetails(data: FcusBusinessDetails): Promise<void> {
    await this.selectBusinessType(data.businessType);
    await this.selectIndustry(data.industry);
    await this.fillZipCode(data.zipCode);
    await this.fillCompanyName(data.companyName);
  }

  async clickNext(): Promise<void> {
    // fillCompanyName calls fillTextStep, which clicks Continue on the final step.
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Contact details
// ─────────────────────────────────────────────────────────────────────────────

export class FcusContactDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async fillContactDetails(data: FcusContactDetails): Promise<void> {
    await this.humanPause();

    // The form uses a single combined name field rather than separate first/last inputs.
    const fullNameInput = this.page.getByRole('textbox', { name: 'e.g. John Doe', exact: true });
    if (await fullNameInput.isVisible().catch(() => false)) {
      await this.fillTextStep(fullNameInput, `${data.firstName} ${data.lastName}`);
    }

    // Accessible name is the hint text, not the label "Email".
    const emailInput = this.page.getByRole('textbox', { name: 'e.g. name@company.com', exact: true });
    if (await emailInput.isVisible().catch(() => false)) {
      await this.fillTextStep(emailInput, data.email, 60);
    }

    // Exact accessible name not yet confirmed — broad pattern covers likely US phone hint formats.
    const phoneInput = this.page.getByRole('textbox', { name: /phone|telephone|mobile|555|000-0000/i });
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.pressSequentially(data.phone, { delay: 80 });
    }
  }

  async clickNext(): Promise<void> {
    await this.humanPause();
    await this.page.getByRole('button', { name: /next|continue/i }).click({ force: true });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary page — assertion only, no interactions
// ─────────────────────────────────────────────────────────────────────────────

export class FcusSummaryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertOnSummaryPage(): Promise<void> {
    await this.page.waitForURL(/fuel-cards(?!.*\/apply\/\d)/i, { timeout: 30_000 });
    // Confirm the CTA is present — do NOT click it, this is a live system.
    await expect(
      this.page.getByRole('button', { name: /get quotes/i })
    ).toBeVisible({ timeout: 20_000 });
  }
}
