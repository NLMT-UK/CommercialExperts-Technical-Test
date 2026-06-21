import { test, expect } from '@playwright/test';
import {
  FcusVehicleDetailsPage,
  FcusBusinessDetailsPage,
  FcusContactDetailsPage,
  FcusSummaryPage,
} from '../pages/FcusPages';
import {
  fcusVehicleDetails,
  fcusBusinessDetails,
  fcusContactDetails,
} from '../fixtures/testData';
import { waitBetweenSteps, waitForPageLoad } from '../utils/helpers';

test.describe('FCUS – Fuel Cards US application journey @fcus', () => {

  test.beforeAll(async () => {
    // CWUK runs first (alphabetical order), so a delay here prevents the FCUS
    // requests from immediately following and triggering rate-limit 403s.
    await new Promise(resolve => setTimeout(resolve, 20_000));
  });

  test('should complete the full application journey and reach the Summary page', async ({ page }) => {

    // ── Step 1: Vehicle / fleet details ───────────────────────────────────
    const vehicleDetailsPage = new FcusVehicleDetailsPage(page);
    await vehicleDetailsPage.goto();
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/fuel-cards.*apply/i);

    await vehicleDetailsPage.fillVehicleDetails(fcusVehicleDetails);
    await waitBetweenSteps(page);
    await vehicleDetailsPage.clickNext();

    // ── Step 2: Business details ───────────────────────────────────────────
    await waitForPageLoad(page);
    const businessDetailsPage = new FcusBusinessDetailsPage(page);

    await businessDetailsPage.fillBusinessDetails(fcusBusinessDetails);
    await waitBetweenSteps(page);
    await businessDetailsPage.clickNext();

    // ── Step 3: Contact details ────────────────────────────────────────────
    await waitForPageLoad(page);
    const contactDetailsPage = new FcusContactDetailsPage(page);

    await contactDetailsPage.fillContactDetails(fcusContactDetails);
    await waitBetweenSteps(page);
    await contactDetailsPage.clickNext();

    // ── Summary page ───────────────────────────────────────────────────────
    await waitForPageLoad(page);
    const summaryPage = new FcusSummaryPage(page);
    await summaryPage.assertOnSummaryPage();
  });

});
