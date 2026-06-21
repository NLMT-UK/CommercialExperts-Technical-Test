# CommercialExperts E2E Test Suite

Playwright + TypeScript automation framework for the CommercialExperts.com application journeys — covering Commercial Waste UK (CWUK) and Fuel Cards US (FCUS).

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
npx playwright install chromium
```

### Run all tests

```bash
npm test
```

### Run a specific product journey

```bash
# UK Commercial Waste only
npm run test:cwuk

# US Fuel Cards only
npm run test:fcus
```

### Run in headed mode (watch the browser)

```bash
npm run test:headed
```

### View the HTML report after a run

```bash
npm run test:report
```

---

## A note on rate limiting

The site will return 403s if you move too fast. Tests are configured to run serially (`workers: 1`) with randomised human-like pauses between every interaction. A 20-second gap is also inserted before the FCUS test starts to give the server time to reset between journeys. If you still hit 403s, wait 5 minutes before re-running — don't increase `workers`, it will make things worse.

---

## Project Structure

```
├── pages/
│   ├── BasePage.ts          # Shared behaviour: cookies, pacing, tile clicks, text steps
│   ├── CwukPages.ts         # Page objects for each CWUK form step
│   └── FcusPages.ts         # Page objects for each FCUS form step
├── fixtures/
│   └── testData.ts          # Centralised test data (one place to update)
├── utils/
│   └── helpers.ts           # Shared utility functions
├── tests/
│   ├── cwuk.spec.ts         # CWUK journey test
│   └── fcus.spec.ts         # FCUS journey test
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## How this solution meets the brief

### Use Playwright and TypeScript
The entire framework is TypeScript in strict mode, using `@playwright/test` v1.44.

### A design pattern that promotes reusability and maintainability
The framework uses the Page Object Model, with one class per logical form section rather than one class per product. Shared behaviour — cookie handling, human-like pacing, tile-click logic, text-input steps - lives in `BasePage` and is inherited by every page object. Test data is separated into `fixtures/testData.ts` so option strings are updated in one place when the live form changes. Please see the reflection section below for more on these choices.

### Clear assertions
Each test asserts:
1. The landing URL matches the expected product path before any interaction begins.
2. After completing the form, the URL has left the numbered question steps (`/apply/N`).
3. The "Get My Quote/Get Quotes" CTA button is visible on the summary page.

Assertions use Playwright's `expect` with explicit timeouts. The CTA button assertions use simple regexes (`/get my quote/i` and `/get quotes/i`) rather than exact string matching — both buttons include Font Awesome icons or surrounding whitespace in their accessible names, which causes exact matches to fail.

### No record-and-playback
All code is hand-written. Selectors were derived initially from browsing the page. Where required, these were then refined by reading error snapshots and page ARIA trees from failed runs, rather than recording interactions.

### Human browsing pace
Every interaction is preceded by a `humanPause()` call that waits a randomised 600–1400ms. A fixed 2000ms `waitBetweenSteps()` pause sits between each major form section. The random range is deliberate — fixed-interval pauses appear as a metronome in server logs, whereas variable timing looks like a real user reading before clicking. Tests run with `workers: 1` and `fullyParallel: false` to ensure the site does not get overloaded by this test suite.

### Stop at the Summary page — do not click "Get My Quote"
Both tests assert the CTA button is *visible* but never interact with it. The `assertOnSummaryPage()` method on both summary page objects contains only `expect(...).toBeVisible()` calls. There is no `.click()` anywhere near that element. This was treated as the hardest constraint in the brief.

---

## Key technical decisions

### Single-question-per-page pattern
Both forms advance one question at a time rather than presenting a multi-field page. This was discovered during the first test run, not assumed upfront. Each text-input step follows the pattern: fill the single visible textbox, click Continue (which has a CSS pulse animation requiring `{ force: true }`), wait for the next step to load, repeat. The `fillTextStep()` method in `BasePage` encapsulates exactly this sequence.

### Accessible names, not placeholders
The textboxes on both sites have empty `placeholder` attributes. The visible hint text ("e.g. Acme Limited", "e.g. John Doe", "e.g. name@company.com") is the *accessible name* — what a screen reader would announce. Using `getByRole('textbox', { name: '...', exact: true })` is therefore both more robust and semantically correct compared to `getByPlaceholder()`. Where the exact accessible name hasn't been confirmed from a live run, a broad regex pattern is used as a fallback.

### Tile clicks with `waitFor`
Categorical questions (waste type, fleet size, etc.) use card-style button tiles that auto-advance to the next step on click. Rather than checking `isVisible()` immediately (which returns false if the page's JavaScript hasn't finished rendering), `clickTile()` in `BasePage` waits up to 4 seconds for either a radio or button element matching the target label to become visible. This handles both slow JS rendering and the possibility that the site renders tiles as radio inputs rather than buttons.

### Bot-detection bypass
Playwright sets `navigator.webdriver = true` in the browser by default — a standard WebDriver property that some sites check and respond to by serving a blank page.  Adding `--disable-blink-features=AutomationControlled` to the Chromium launch arguments in `playwright.config.ts` suppresses that flag, making the browser indistinguishable from a normal user session. This meant if either site served blank pages to prevent bots from accessing, the test suite could still be ran.

### Tile button matching
Callers pass plain strings to `clickTile()` — exactly what they read on screen. Internally, `clickTile()` escapes any regex special characters (so `'$3000+'` and `'50+ Vehicles'` match literally) and builds a case-insensitive substring pattern. A substring match rather than an anchored one is necessary because Font Awesome appends icon characters to button accessible names via CSS pseudo-elements, which causes an exact full-string match to fail.

---

## Test Selection & Reflection Questionnaire

### 1. How did you approach automating the two journeys?

For both user journeys, I had to make assumptions in order to take a risk-based approach, ensuring the most critical happy path is tested for each product. This meant I would automate both user journeys for a high-value customer, because naturally these are the most critical for businesses to succeed.

For the CWUK user journey, this meant choosing a Business customer who needs Ongoing Waste Collection of General Waste, as this is the most common type of waste disposal, in the largest regular amounts.

For FCUS, this meant choosing the largest possible fleet size, using a Fleet Fuel Card (I assumed this is the most regularly-used payment method) to purchase at Gas Stations, with an estimated spend of over $3000 per month to provide fuel for Heavy Duty Trucks/Semis for a Logistics Corporation.

I didn't write negative tests for invalid inputs (bad postcode format, invalid email, letters in a phone number). Those matter for a full test suite but given the time constraint, proving the happy path works end-to-end gave more signal about the health of the system than a handful of validation checks.

### 2. Why is the framework structured the way it is?

The core architectural choice is Page Object Model (POM) with one class per form section. Each section — waste details, business details, contact details — is a distinct screen with its own validation rules, its own selector strategy, and its own data. When a step changes (e.g. FCUS adds a new fleet-type question), you open the relevant page object class, add one method, and the POM is updated. This provides a much cleaner code base than one single monolithic Page Object.

`BasePage` centralises everything that the page object needs, such as cookie banner handling, human-like pacing, the `clickTile()` helper, and the `fillTextStep()` helper.

`fixtures/testData.ts` is the single source of truth for test data. This allows the user to make quick adjustments to the test data - e.g. to tweak the user journey for CWUK from a Business customer to a Residential customer - if required.

The long-term advantage of this structure is locality of change. Any modification to the form requires updating exactly one file, and the scope of that change is obvious.

### 3. An alternative approach that would have been a worse idea

I could have put the selector logic directly inside the spec files, so each test just does `await page.getByRole('button', { name: /General/i }).click()` inline with no page objects at all. This approach would have been faster to write tests initially.

This would've made the suite more difficult to maintain, as inevitably this leads to the same selector being re-used within the tests - therefore whenever this selector is updated in the DOM, it would have to be updated in multiple places within the test suite, rather than just updating the page within the POM.

### 4. What would you do with another 4–8 hours?

**Increased happy-path test coverage** The current test coverage provided by this suite is minimal, and is restricted to two very specific happy-path user journeys. I'd increase the test coverage to provide tests for different types of customers on both applications, making sure to cover as many different types of happy-paths as possible on both applications.

**Negative tests with data-driven inputs.** A proper risk-based suite would cover invalid user inputs such as invalid postcode formats, invalid email addresses, phone numbers with letters in them, and boundary values on numeric fields.

**Environment configuration.** The base URL is hardcoded to production. I'd add a `.env` file approach using `dotenv` so the same test suite can point at staging or a feature branch, or even a local development environment, without touching code.

**CI pipeline.** A GitHub Actions workflow that runs on push, caches the Playwright browsers, respects the 5-minute rate-limit rule by building in a wait step, and uploads the HTML report as a build artifact. The serial execution and human-paced delays make this slow enough that a pipeline probably needs a 10-minute timeout, but it's entirely viable. This workflow would then act as a 'quality gate' for deployments, and failing tests would lead to a blocked deployment.

**Accessibility assertions.** B2B users on company devices often have locked-down browsers or use assistive technology. I'd add `axe-playwright` checks on the first step of each form — at minimum verifying that the tile buttons have appropriate ARIA labels and that the focus order is logical.

**Trace on every failure, not just first retry.** The current config captures a trace on first retry only. For a live site that can have transient failures, I'd capture a trace on every failure so you have the full request waterfall to diagnose whether a failure was a selector issue or a server blip.

### 5. What part of the code are you most proud of?

The `BasePage` utility layer, particularly `clickTile()`. Tile-style buttons are common on comparison forms, but matching them reliably requires handling three things simultaneously — the element type might be a radio input or a button depending on the site's markup; the text might not be rendered until JavaScript executes, so you need a short wait before concluding the tile isn't there; and option values like `'50+ Vehicles'` and `'$3000+'` contain regex special characters that must be escaped. While the match itself must be a substring rather than an anchored full-string comparison, because Font Awesome appends icon characters to button accessible names via CSS pseudo-elements that would cause an anchored pattern to fail. Solving all three concerns in one reusable method that every page object inherits felt like the right level of abstraction — callers simply pass the string they read on screen, and `clickTile()` handles the rest.

The randomised `humanPause()` is a small thing but I think it's right. Fixed 1000ms waits appear as perfectly regular spikes in server traffic logs. Variable 600–1400ms waits look indistinguishable from a real user pausing to read. This also matched the brief's technical requirement of running the tests at a pace similar to normal human browsing.

### 6. What's the weakest part?

The text-input selectors for the later FCUS steps. The name and email fields were confirmed against the actual page and are pinned to their exact accessible names (`'e.g. John Doe'` and `'e.g. name@company.com'`). The phone, zip code, and company name fields weren't — those selectors are broad regexes (`/phone|telephone|mobile|555|000-0000/i`, `/zip|postal|90210|\d{5}/i`, `/company|business|organi|acme|corp|ltd/i`) that cover plausible formats rather than the real hint text. They'll probably work, but they're guesses rather than verified values. The right fix is one more run with a `console.log` of the accessible name on each step, then replace the patterns with exact strings the way the name and email fields were done.
