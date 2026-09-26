# Playwright SauceDemo

A TypeScript and Playwright end-to-end test automation project for
[SauceDemo](https://www.saucedemo.com/). It is designed as a practical bridge
from Java, Selenium, Appium, and TestNG into modern Playwright test automation.

The suite contains 10 independent test cases across authentication, inventory,
cart, and checkout flows. It follows the official Playwright recommendations:
user-facing locators, web-first assertions, test isolation, fixtures, Page
Objects, multi-browser projects, failure artifacts, and CI execution.

## Test cases

| # | Area | Scenario |
|---:|---|---|
| 1 | Authentication | Log in with a valid standard user |
| 2 | Authentication | Reject an invalid password |
| 3 | Authentication | Reject a locked-out user |
| 4 | Authentication | Log out an authenticated user |
| 5 | Inventory | Display the complete six-product catalog |
| 6 | Inventory | Sort products by price, low to high |
| 7 | Inventory | Add and remove a product |
| 8 | Cart | Preserve a cart item across navigation |
| 9 | Checkout | Validate required checkout details |
| 10 | Checkout | Complete an order successfully |

## Architecture

```text
.
├── .github/workflows/playwright.yml
├── pages/
│   ├── cart.page.ts
│   ├── checkout.page.ts
│   ├── inventory.page.ts
│   └── login.page.ts
├── tests/
│   ├── data/users.ts
│   ├── fixtures/test.ts
│   ├── auth.spec.ts
│   ├── checkout.spec.ts
│   └── inventory.spec.ts
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

### Models and patterns

- **Page Object Model:** page locators and user actions live in page classes.
- **Custom fixtures:** tests receive ready-to-use Page Objects through a typed
  fixture, similar in purpose to TestNG dependency injection.
- **Test data model:** credentials are immutable and separate from test logic.
- **AAA flow:** tests keep setup, action, and assertion phases visually clear.
- **Isolated browser contexts:** every test gets fresh cookies and storage.
- **User-visible contracts:** role, placeholder, text, and `data-test` locators
  are preferred over CSS and XPath selectors.

## Tools

- Node.js 22 or newer
- TypeScript with strict type checking
- Playwright Test
- Chromium, Firefox, and WebKit projects
- Playwright HTML report, traces, screenshots, and videos
- GitHub Actions

## Getting started

```bash
npm ci
npx playwright install
npm test
```

The default target is `https://www.saucedemo.com`. To test another compatible
environment, set `BASE_URL`:

```bash
BASE_URL=https://www.saucedemo.com npm test
```

## Useful commands

```bash
npm test
npm run test:chromium
npm run test:headed
npm run test:ui
npm run test:debug
npm run test:smoke
npm run typecheck
npm run report
```

Run one file or one test by title:

```bash
npx playwright test tests/auth.spec.ts
npx playwright test -g "logs in with valid user"
```

## Reports and debugging

The HTML report is generated in `playwright-report/`. On CI, failed tests are
retried twice and a trace is captured on the first retry. Screenshots are kept
for failures and videos are retained for failed tests.

```bash
npm run report
npx playwright show-trace test-results/path/to/trace.zip
```

## Design choices

- Tests remain independent and can run in parallel.
- Assertions use Playwright's retrying `expect` matchers.
- Page Objects expose business actions instead of implementation details.
- Secrets are not required because SauceDemo publishes its practice accounts.
- Smoke coverage is tagged with `@smoke` for quick feedback.
- CI runs type checking before the full cross-browser suite.

## Official references

- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Projects](https://playwright.dev/docs/test-projects)
- [TypeScript](https://playwright.dev/docs/test-typescript)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
