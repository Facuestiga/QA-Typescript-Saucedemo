# Playwright SauceDemo

A TypeScript and Playwright end-to-end test automation project for
[SauceDemo](https://www.saucedemo.com/). It is designed as a practical bridge
from Java, Selenium, Appium, and TestNG into modern Playwright test automation.

The suite contains 23 independent test cases across authentication, inventory,
cart, and checkout flows. It follows the official Playwright recommendations:
user-facing locators, web-first assertions, test isolation, fixtures, Page
Objects, multi-browser and mobile projects, failure artifacts, and CI execution.

## Test cases

|     # | Area           | Scenario                                                                  |
| ----: | -------------- | ------------------------------------------------------------------------- |
|   1–4 | Product grid   | Catalog contents, responsive layout, product details, and back navigation |
|   5–8 | Filtering      | Name and price sorting in both directions                                 |
|  9–13 | Cart           | Add, remove, multi-item, details-page, and persistence flows              |
| 14–15 | Account        | Navigation menu and logout                                                |
| 16–17 | Authentication | Valid-user pool and invalid-username validation                           |
| 18–22 | Checkout       | Successful totals, required fields, and cancellation persistence          |

Detailed steps, expected results, priority, and automation status are maintained
in [`test-cases.csv`](test-cases.csv).

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
- Chromium, Firefox, WebKit, and Pixel 7 emulation projects
- Playwright HTML report, traces, screenshots, and videos
- ESLint and Prettier quality gates
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
npm run test:regression
npm run test:mobile
npm run test:ci
npm run lint
npm run format:check
npm run typecheck
npm run quality
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
- `@regression` identifies the complete functional coverage.
- `@smoke` identifies the fastest critical paths and runs on Chromium.
- `@mobile` identifies behavior that only makes sense under Mobile Web emulation.
- The mobile project uses the Pixel 7 device profile and executes smoke plus
  mobile-specific coverage.
- Pull requests run linting, formatting, type checking, and Chromium smoke tests.
- Pushes to `main` run Chromium regression plus Firefox, WebKit, and Mobile Web smoke tests.
- Nightly and manual runs execute the complete suite across every configured project.

## Execution strategy

| Command                   | Scope                                       | Intended use                                   |
| ------------------------- | ------------------------------------------- | ---------------------------------------------- |
| `npm run test:smoke`      | Critical paths in Chromium                  | Fast local and pull-request feedback           |
| `npm run test:regression` | Functional suite across configured projects | Broad validation before integration or release |
| `npm run test:mobile`     | Smoke and mobile-specific cases on Pixel 7  | Mobile Web validation                          |
| `npm run test:ci`         | Critical paths in Chromium                  | Stable entry point for CI                      |

Tags are stored as Playwright metadata rather than as part of test titles. The
desktop projects omit mobile-only scenarios, while the mobile project combines
critical paths with responsive coverage.

## Continuous integration

| Trigger           | Quality gate                     | Browser coverage                                              |
| ----------------- | -------------------------------- | ------------------------------------------------------------- |
| Pull request      | ESLint, Prettier, and TypeScript | Smoke on Chromium                                             |
| Push to `main`    | Validated by the pull request    | Regression on Chromium; smoke on Firefox, WebKit, and Pixel 7 |
| Nightly or manual | Validated by the pull request    | Complete suite on Chromium, Firefox, WebKit, and Pixel 7      |

The nightly workflow runs every day at 06:00 UTC and can also be started from
the GitHub Actions interface. Concurrency cancels obsolete runs for the same
branch. Browser matrices keep running after an individual project fails so the
report shows the full compatibility picture.

Every test job retains its HTML report for 14 days. Failed jobs also retain
`test-results/`, including available traces, screenshots, and videos. Retries
remain disabled locally and are limited to CI, where the report identifies tests
that only passed after retrying.

## Official references

- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Locators](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Projects](https://playwright.dev/docs/test-projects)
- [TypeScript](https://playwright.dev/docs/test-typescript)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
