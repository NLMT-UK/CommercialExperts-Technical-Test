import { test, expect } from '@playwright/test';
import {
  CwukWasteDetailsPage,
  CwukBusinessDetailsPage,
  CwukContactDetailsPage,
  CwukSummaryPage,
} from '../pages/CwukPages';
import {
  cwukWasteDetails,
  cwukBusinessDetails,
  cwukContactDetails,
} from '../fixtures/testData';
import { waitBetweenSteps, waitForPageLoad } from '../utils/helpers';

test.describe('CWUK – Commercial Waste UK application journey @cwuk', () => {

  test('should complete the full application journey and reach the Summary page', async ({ page }) => {

    // ── Step 1: Waste details ──────────────────────────────────────────────
    const wasteDetailsPage = new CwukWasteDetailsPage(page);
    await wasteDetailsPage.goto();
    await waitForPageLoad(page);

    await expect(page).toHaveURL(/commercial-waste.*apply/i);
    await expect(page.getByRole('heading').first()).toBeVisible();

    await wasteDetailsPage.fillWasteDetails(cwukWasteDetails);
    await waitBetweenSteps(page);
    await wasteDetailsPage.clickNext();

    // ── Step 2: Business details ───────────────────────────────────────────
    await waitForPageLoad(page);
    const businessDetailsPage = new CwukBusinessDetailsPage(page);

    await businessDetailsPage.fillBusinessDetails(cwukBusinessDetails);
    await waitBetweenSteps(page);
    await businessDetailsPage.clickNext();

    // ── Step 3: Contact details ────────────────────────────────────────────
    await waitForPageLoad(page);
    const contactDetailsPage = new CwukContactDetailsPage(page);

    await contactDetailsPage.fillContactDetails(cwukContactDetails);
    await waitBetweenSteps(page);
    await contactDetailsPage.clickNext();

    // ── Summary page ───────────────────────────────────────────────────────
    await waitForPageLoad(page);
    const summaryPage = new CwukSummaryPage(page);
    await summaryPage.assertOnSummaryPage();
  });

});
