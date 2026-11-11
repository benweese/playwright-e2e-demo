# CLAUDE.md

Playwright API and UI tests for https://automationexercise.com, a public practice shop. Read this before writing or changing any test.

The suite is built on two other repos:

- **[playwright-test-commons](https://github.com/benweese/playwright-test-commons)** (`@benweese/playwright-test-commons`): `ApiBase`, `getBody`, `validateJsonSchema`, the date helpers, `BasePage`, `generateTestDescription`, `TAGS`. Installed from a git tag. Change it in that repo and bump the tag here; never patch `node_modules`.
- **[playwright-ai-qa-agents](https://github.com/benweese/playwright-ai-qa-agents)**: the `playwright-qa-agents` Claude Code plugin that plans, writes, runs and heals tests here (see "Claude Code plugin").

## Layout

```
api/                     one client class per API area, exported as a singleton
config/environments.js   per-environment values (TEST_ENV picks one; only "prod" exists)
config/index.js          exports `config`; the only place tests read settings from
fixtures/test.js         `test` and `expect` for every spec (blocks the site's ads)
helpers/                 site-specific helpers (expectResponseCode, readTestUser), exported from helpers/index.js
payloads/                request body builders (faker)
schemas/<area>/<name>.schema.json
tests/smoke/             @smoke checks
tests/setup/             auth.setup.js / auth.teardown.js (create and delete the run's test account)
tests/api/<area>/        API specs
tests/ui/locators|pages|specs|data/   UI layers (see "UI tests")
plans/                   test plans, one per feature: the written test cases (committed)
docs/pages/              page references written by the page-mapper agent (committed)
```

## Commands

Run Playwright directly from the repo root, where `playwright.config.js` lives:

```bash
npx playwright test                                         # every project
npx playwright test --project=smoke                         # quick "is it up" checks
npx playwright test --grep "SMOKE-002"                      # one test, by its scenario id
npx playwright test tests/smoke/site-up.spec.js --headed    # one file, in a visible browser
npx playwright test --project=api --reporter=line           # one project, compact output
npx playwright show-report                                  # open the last HTML report
npm run lint / npm run lint:fix
```

`npm test`, `npm run test:smoke`, `npm run test:api`, `npm run test:ui` and `npm run report` are shortcuts for the same commands.

## Site quirks (read before writing a test)

- **The API always returns HTTP 200**, with a `text/html` content type, and puts the real status in the body: `{ "responseCode": 404, "message": "User not found!" }`. Use `expectResponseCode(response, code)` from `helpers/` for success and error cases alike. Commons' `errorCheck(response, 404)` would always fail here. `getBody` still works (it parses JSON whatever the content type), and `expectResponseCode` calls it.
- **Request bodies are form-encoded.** Clients pass `bodyType: "form"` to `ApiBase`. The endpoint list is at https://automationexercise.com/api_list.
- **Ads.** The site serves Google ads, including full-page vignettes that swallow clicks. `fixtures/test.js` blocks ad and tracking hosts in every browser context, so **always import `test` and `expect` from `fixtures/test.js`**, never from `@playwright/test`. Lint enforces this.
- **`data-qa` attributes.** Form controls carry `data-qa="login-email"` and similar. `testIdAttribute` is set to `data-qa`, so `page.getByTestId("login-email")` finds them. Prefer them where the control has no accessible label.
- **Shared public data.** Other people use the site too. Never assert on data you didn't create (e.g. "the cart is empty") unless the test set it up.

## Rules for every test

- **Title:** `generateTestDescription({ id, description, tags })`. The `id` is the scenario id from the plan (`AREA-001`). One plan scenario = one test, same id.
- **Tags:** from `TAGS`. Every test needs at least one of `@smoke`, `@api`, `@ui`, or it runs in no project.
- **No hardcoded URLs or data ids.** URLs come from `baseURL`/`config`; per-environment values go in `config/environments.js`.
- **Assert what the plan says should happen, not what you observe.** If the site disagrees with the plan, the test fails and the mismatch is reported. Never change an assertion to match a bug.
- **Soft assertions** (`expect.soft`) for property checks, so one run reports every failure. Hard `expect` only when later steps depend on the value.
- **No fixed waits** (`waitForTimeout`) and no `networkidle`. Use web-first assertions, or `pollUntil` for eventually-consistent APIs.
- **Read-only environments.** Specs that create or change data must call `test.skip(config.readOnly, "changes data")`. `prod` here is not read-only, because the site is built for practice.
- **Clean up what you create.** A test that creates an account deletes it (`Accounts.remove`) in a `finally` or `afterAll`.
- **Extend, don't duplicate.** If a spec for the area exists, add to it.

## API tests

A client per API area, extending `ApiBase`, exported as a singleton (see `api/AccountsClient.js`, `api/ProductsClient.js`):

```js
// api/BrandsClient.js
import { ApiBase } from "@benweese/playwright-test-commons";
import { config } from "../config/index.js";

class BrandsClient extends ApiBase {
	constructor() {
		super({ baseUrl: config.apiBaseUrl, bodyType: "form", debug: config.debug });
	}

	list() {
		return this.get("brandsList");
	}
}

export const Brands = new BrandsClient();
```

A spec calls clients and helpers, then asserts:

```js
// tests/api/products/products.spec.js
import { generateTestDescription, TAGS, validateJsonSchema } from "@benweese/playwright-test-commons";
import { test, expect } from "../../../fixtures/test.js";
import { Products } from "../../../api/ProductsClient.js";
import { expectResponseCode } from "../../../helpers/index.js";

test.describe("Products API", () => {
	test(
		generateTestDescription({
			id: "PROD-001",
			description: "lists all products",
			tags: [TAGS.API, TAGS.REGRESSION]
		}),
		async () => {
			const body = await expectResponseCode(await Products.list(), 200);
			await validateJsonSchema("products/productsList", body);
		}
	);

	test(
		generateTestDescription({ id: "PROD-002", description: "search finds matching products", tags: [TAGS.API] }),
		async () => {
			const body = await expectResponseCode(await Products.search("top"), 200);
			for (const product of body.products) {
				expect.soft(product.name.toLowerCase()).toContain("top");
			}
		}
	);

	test(
		generateTestDescription({
			id: "PROD-003",
			description: "POST to productsList is not supported",
			tags: [TAGS.API]
		}),
		async () => {
			await expectResponseCode(await Products.post("productsList"), 405);
		}
	);
});
```

- `pollUntil(() => Client.call(), (body) => condition)` for anything that settles over time.
- `timingCheck(() => Client.call(), maxAverageMs)` for response-time checks.

## JSON schema validation

- `validateJsonSchema("products/productsList", body)` validates against `schemas/products/productsList.schema.json`, and also checks every date-like field.
- **New endpoint:** run once with `{ update: true }` (or `UPDATE_SCHEMAS=true npx playwright test --grep "<test id>"`). That writes a strict schema from the real response. Review it, tighten it by hand (required fields, enums, formats), commit it, and remove the flag. Never commit `update: true`.
- Schemas are strict: `additionalProperties: false` everywhere, so a new or renamed field fails until the schema is updated on purpose.

## Date validation

- Automatic: every `validateJsonSchema` call checks fields whose key ends in `At`/`Date`/`_at`/`_date` (or is `date`, `timestamp`) are valid ISO 8601 dates, rejecting impossible dates like `2026-02-30`.
- Direct: `isIsoDate(value)`, `expectValidDate(value, { format })`, `expectDateBetween(value, from, to)`, `expectSortedByDate(items, key, "desc" | "asc")`.

## UI tests

Three layers per page, plus optional data. `LoginPage` is the working example:

```js
// tests/ui/locators/loginLocators.js
export const loginLocators = (page) => ({
	emailInput: page.getByTestId("login-email"),
	passwordInput: page.getByTestId("login-password"),
	loginButton: page.getByTestId("login-button"),
	loggedInAs: (name) => page.getByRole("listitem").filter({ hasText: `Logged in as ${name}` })
});

// tests/ui/pages/LoginPage.js
export class LoginPage extends BasePage {
	constructor(page) {
		super(page, loginLocators);
	}

	async open() {
		await this.goto("/login");
	}

	async login(email, password) {
		await this.fill(this.locators.emailInput, email);
		await this.fill(this.locators.passwordInput, password);
		await this.click(this.locators.loginButton);
	}
}

// tests/ui/specs/home.spec.js
import { generateTestDescription, TAGS } from "@benweese/playwright-test-commons";
import { test } from "../../../fixtures/test.js";
import { HomePage } from "../pages/HomePage.js";

test(
	generateTestDescription({ id: "HOME-001", description: "shows the logged-in user", tags: [TAGS.UI] }),
	async ({ page }) => {
		const home = new HomePage(page);
		await home.open();
		await home.expectLoggedIn();
	}
);
```

- Specs never contain raw locators; they call page methods.
- Page objects use `BasePage` methods (`this.click`, `this.fill`, `this.expectVisible`, ...), not raw `locator.click()`, except for small things BasePage doesn't cover (like `press`).
- A helper every page could use, taking locators as arguments, belongs in `BasePage` (in commons). Anything with page-specific names goes on the page object.

## Locators (hard rule)

- **The element you act on:** only `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByAltText`, `getByTitle`, `getByTestId` (which reads `data-qa` here).
- **No good locator on its own?** If the element can't be found uniquely and reliably by itself, find a good container first: the nearest meaningful parent that gives the element its context (a form, dialog, table row, card, list item, section or landmark). Locate the container the same way, e.g. `getByRole("dialog", { name })`, `getByRole("row").filter({ hasText })` or `getByRole("listitem").filter({ hasText })`, then locate the element inside it. `loggedInAs` in `loginLocators.js` is an example.
- **Never:** XPath, generated CSS class names, `.first()`/`.nth()`/`.last()` or `:nth-child`. Lint enforces the XPath and index rules.
- If an element can't be found with the allowed methods, write the best allowed locator and put a comment above it:
  `// Fixme: could not reliably locate <what>. Tried: <locators> — <why>. Needs <role/label/testid>.`

## Auth

The `ui` project starts logged in:

1. **`setup`** (`tests/setup/auth.setup.js`) creates a fresh account through `POST /api/createAccount` with faker data, signs in through `LoginPage`, and saves the session to `.auth/state.json`. It also saves the credentials to `.auth/user.json`.
2. **`ui`** depends on `setup` and uses that `storageState`. Call `readTestUser()` from `helpers/` to get `{ name, email, password }`.
3. **`teardown`** (`tests/setup/auth.teardown.js`) deletes the account and `.auth/` after `ui` finishes.

There are no credentials to manage, and every run leaves the shared site as it found it. A test that needs a logged-out page uses `test.use({ storageState: { cookies: [], origins: [] } })`.

## Plans: the written test cases

`plans/<feature>.md` opens with numbered **acceptance criteria** (`AC-1`, `AC-2`, ...): what should be true, in testable statements. Then come the scenarios, each with its steps, its expected result and the criteria it covers (`**Covers:** AC-1, AC-3`). The plan is the human-readable record of what each test checks and why, so it's committed. Scenario ids (`AREA-001`) are assigned in the plan and reused in the test title. Keep plans in sync when tests change.

## Claude Code plugin

`.claude/settings.json` enables `playwright-qa-agents` from the `benweese/playwright-ai-qa-agents` marketplace.

```
author-tests skill:  description → planner → YOU REVIEW → generator → run → (healer, UI only)
```

- `/playwright-qa-agents:author-tests <feature description, URL, or path to a requirements file>`
- `/playwright-qa-agents:run-spec <spec path | project | --grep id>`
- `/playwright-qa-agents:check [fix]` – lint
- `/playwright-qa-agents:bug-report <description>` – writes a bug report to `bugs/`

## Git

Branch off `main` as `feature/<short-description>`; open a PR. Don't commit generated reports, `.auth/` or `.env`.
