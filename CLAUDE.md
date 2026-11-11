# CLAUDE.md

Playwright API and UI tests for https://automationexercise.com, a public practice shop, written in TypeScript. Read this before writing or changing any test.

The suite is built on two other repos:

- **[playwright-test-commons](https://github.com/benweese/playwright-test-commons)** (`@benweese/playwright-test-commons`): `ApiBase`, `getBody`, `validateJsonSchema`, the date helpers, `BasePage`, `generateTestDescription`, `TAGS`, with type definitions. Installed from a GitHub Release. Change it in that repo, release a new version and bump it here; never patch `node_modules`.
- **[playwright-ai-qa-agents](https://github.com/benweese/playwright-ai-qa-agents)**: the `playwright-qa-agents` Claude Code plugin that plans, writes, runs and heals tests here (see "Claude Code plugin").

## Layout

```
api/                     one client class per API area, exported as a singleton
api/types.ts             response body types (ProductList, UserDetail, ...)
config/environments.ts   per-environment values (TEST_ENV picks one; only "prod" exists)
config/index.ts          exports `config`; the only place tests read settings from
fixtures/test.ts         `test` and `expect` for every spec (blocks the site's ads)
helpers/                 site-specific helpers (expectResponseCode, readTestUser), exported from helpers/index.ts
payloads/                request body builders (faker), typed
schemas/<area>/<name>.schema.json
scripts/                 check-test-ids.ts (run by npm run lint)
.claude/skills/playwright-cli/   Playwright's own skill for driving a browser with playwright-cli (vendored)
.playwright/cli.config.json     playwright-cli settings (browser)
tests/smoke/             @smoke checks
tests/setup/             auth.setup.ts / auth.teardown.ts (create and delete the run's test account)
tests/api/<area>/        API specs
tests/ui/locators|pages|specs|data/   UI layers (see "UI tests")
plans/                   test plans, one per feature: the written test cases (committed)
docs/pages/              page references written by the page-mapper agent (committed)
```

## Commands

Run Playwright directly from the repo root, where `playwright.config.ts` lives:

```bash
npx playwright test                                         # every project
npx playwright test --project=smoke                         # quick "is it up" checks
npx playwright test --grep "#0002"                          # one test, by its id
npx playwright test tests/smoke/site-up.spec.ts --headed    # one file, in a visible browser
npx playwright test --project=api --reporter=line           # one project, compact output
npx playwright show-report                                  # open the last HTML report
npm run lint                                                # ESLint + type-check + test id check
npm run lint:fix
```

`npm test`, `npm run test:smoke`, `npm run test:api`, `npm run test:ui` and `npm run report` are shortcuts for the same commands.

## TypeScript

- Everything is TypeScript with `strict` on. Playwright runs `.ts` directly; there is no build step. `npm run lint` runs `tsc` to type-check.
- Relative imports have no extension: `import { config } from "../../config"`.
- Type response bodies. Add the shape to `api/types.ts` and pass it to the helper: `expectResponseCode<ProductList>(response, 200)`. Avoid `any`; lint warns on it.
- Use `import type` for type-only imports (lint enforces it).
- Locator factories take `page: Page`. Page objects extend `BasePage<XLocators>`, where `XLocators` is `ReturnType<typeof xLocators>` exported from the locators file.

## Dependencies

- Keep dependencies on their latest versions. Exceptions: **TypeScript stays on 6.x** until typescript-eslint supports 7, and **`playwright` is pinned to the same version as `@playwright/test`**. `@playwright/cli` (used by the agents' page-mapper) depends on a pre-release `playwright`; without the explicit `playwright` dev dependency, npm hoists that pre-release, `npx playwright test` runs it, and Playwright fails with "did not expect test() to be called here". When you upgrade `@playwright/test`, upgrade `playwright` to the same version.
- **The `playwright-cli` skill** in `.claude/skills/playwright-cli/` comes from `@playwright/cli` and teaches agents its commands. Don't edit it. After upgrading `@playwright/cli`, run `npm run skills:update` to refresh it and commit the result.

## Site quirks (read before writing a test)

- **The API always returns HTTP 200**, with a `text/html` content type, and puts the real status in the body: `{ "responseCode": 404, "message": "User not found!" }`. Use `expectResponseCode(response, code)` from `helpers/` for success and error cases alike. Commons' `errorCheck(response, 404)` would always fail here. `getBody` still works (it parses JSON whatever the content type), and `expectResponseCode` calls it.
- **Request bodies are form-encoded.** Clients pass `bodyType: "form"` to `ApiBase`. The endpoint list is at https://automationexercise.com/api_list.
- **Ads.** The site serves Google ads, including full-page vignettes that swallow clicks. `fixtures/test.ts` blocks ad and tracking hosts in every browser context, so **always import `test` and `expect` from `fixtures/test`**, never from `@playwright/test`. Lint enforces this.
- **`data-qa` attributes.** Form controls carry `data-qa="login-email"` and similar. `testIdAttribute` is set to `data-qa`, so `page.getByTestId("login-email")` finds them. Prefer them where the control has no accessible label.
- **Shared public data.** Other people use the site too. Never assert on data you didn't create (e.g. "the cart is empty") unless the test set it up.

## Rules for every test

- **Title:** `generateTestDescription({ id, description, tags })`. The `id` is the scenario's number from the plan: `#0012` in the plan is `id: 12` in code, and the title shows `#0012`. One plan scenario = one test, same id.
- **Ids are unique numbers across the whole repo.** They say nothing about the area or kind of test. A new scenario takes the next number after the highest one in use (`npm run check:ids` prints it, and plans may hold numbers not generated yet). `npm run lint` fails on a missing or duplicate id, and on a spec with no `@smoke`, `@api` or `@ui` tag.
- **Tags say what kind of test it is:** from `TAGS`. Every test needs at least one of `@smoke`, `@api`, `@ui`, or it runs in no project. Add `@regression`, `@a11y` or `@slow` where they apply. Use `npx playwright test --grep @smoke` to select by kind, never an id range.
- **No hardcoded URLs or data ids.** URLs come from `baseURL`/`config`; per-environment values go in `config/environments.ts`.
- **Assert what the plan says should happen, not what you observe.** If the site disagrees with the plan, the test fails and the mismatch is reported. Never change an assertion to match a bug.
- **Soft assertions** (`expect.soft`) for property checks, so one run reports every failure. Hard `expect` only when later steps depend on the value.
- **No fixed waits** (`waitForTimeout`) and no `networkidle`. Use web-first assertions, or `pollUntil` for eventually-consistent APIs.
- **Read-only environments.** Specs that create or change data must call `test.skip(config.readOnly, "changes data")`. `prod` here is not read-only, because the site is built for practice.
- **Clean up what you create.** A test that creates an account deletes it (`Accounts.remove`) in a `finally` or `afterAll`.
- **Extend, don't duplicate.** If a spec for the area exists, add to it.

## API tests

A client per API area, extending `ApiBase`, exported as a singleton (see `api/AccountsClient.ts`, `api/ProductsClient.ts`):

```ts
// api/BrandsClient.ts
import { ApiBase } from "@benweese/playwright-test-commons";
import { config } from "../config";

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

```ts
// tests/api/products/products.spec.ts
import { generateTestDescription, TAGS, validateJsonSchema } from "@benweese/playwright-test-commons";
import { test, expect } from "../../../fixtures/test";
import { Products } from "../../../api/ProductsClient";
import type { ProductList } from "../../../api/types";
import { expectResponseCode } from "../../../helpers";

test.describe("Products API", () => {
	test(
		generateTestDescription({ id: 12, description: "lists all products", tags: [TAGS.API, TAGS.REGRESSION] }),
		async () => {
			const body = await expectResponseCode<ProductList>(await Products.list(), 200);
			await validateJsonSchema("products/productsList", body);
		}
	);

	test(
		generateTestDescription({ id: 13, description: "search finds matching products", tags: [TAGS.API] }),
		async () => {
			const body = await expectResponseCode<ProductList>(await Products.search("top"), 200);
			for (const product of body.products) {
				expect.soft(product.name.toLowerCase()).toContain("top");
			}
		}
	);

	test(
		generateTestDescription({ id: 14, description: "POST to productsList is not supported", tags: [TAGS.API] }),
		async () => {
			await expectResponseCode(await Products.post("productsList"), 405);
		}
	);
});
```

- `pollUntil<T>(() => Client.call(), (body) => condition)` for anything that settles over time.
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

```ts
// tests/ui/locators/loginLocators.ts
import type { Page } from "@playwright/test";

export const loginLocators = (page: Page) => ({
	emailInput: page.getByTestId("login-email"),
	passwordInput: page.getByTestId("login-password"),
	loginButton: page.getByTestId("login-button"),
	loggedInAs: (name: string) => page.getByRole("listitem").filter({ hasText: `Logged in as ${name}` })
});

export type LoginLocators = ReturnType<typeof loginLocators>;

// tests/ui/pages/LoginPage.ts
import type { Page } from "@playwright/test";
import { BasePage } from "@benweese/playwright-test-commons";
import { loginLocators, type LoginLocators } from "../locators/loginLocators";

export class LoginPage extends BasePage<LoginLocators> {
	constructor(page: Page) {
		super(page, loginLocators);
	}

	async open() {
		await this.goto("/login");
	}

	async login(email: string, password: string) {
		await this.fill(this.locators.emailInput, email);
		await this.fill(this.locators.passwordInput, password);
		await this.click(this.locators.loginButton);
	}
}

// tests/ui/specs/home.spec.ts
import { generateTestDescription, TAGS } from "@benweese/playwright-test-commons";
import { test } from "../../../fixtures/test";
import { HomePage } from "../pages/HomePage";

test(
	generateTestDescription({ id: 15, description: "shows the logged-in user", tags: [TAGS.UI] }),
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
- **No good locator on its own?** If the element can't be found uniquely and reliably by itself, find a good container first: the nearest meaningful parent that gives the element its context (a form, dialog, table row, card, list item, section or landmark). Locate the container the same way, e.g. `getByRole("dialog", { name })`, `getByRole("row").filter({ hasText })` or `getByRole("listitem").filter({ hasText })`, then locate the element inside it. `loggedInAs` in `loginLocators.ts` is an example.
- **Never:** XPath, generated CSS class names, `.first()`/`.nth()`/`.last()` or `:nth-child`. Lint enforces the XPath and index rules.
- If an element can't be found with the allowed methods, write the best allowed locator and put a comment above it:
  `// Fixme: could not reliably locate <what>. Tried: <locators> — <why>. Needs <role/label/testid>.`

## Auth

The `ui` project starts logged in:

1. **`setup`** (`tests/setup/auth.setup.ts`) creates a fresh account through `POST /api/createAccount` with faker data, signs in through `LoginPage`, and saves the session to `.auth/state.json`. It also saves the credentials to `.auth/user.json`.
2. **`ui`** depends on `setup` and uses that `storageState`. Call `readTestUser()` from `helpers/` to get `{ name, email, password }`.
3. **`teardown`** (`tests/setup/auth.teardown.ts`) deletes the account and `.auth/` after `ui` finishes.

There are no credentials to manage, and every run leaves the shared site as it found it. A test that needs a logged-out page uses `test.use({ storageState: { cookies: [], origins: [] } })`.

## Plans: the written test cases

`plans/<feature>.md` opens with numbered **acceptance criteria** (`AC-1`, `AC-2`, ...): what should be true, in testable statements. Then come the scenarios, each with its steps, its expected result and the criteria it covers (`**Covers:** AC-1, AC-3`). The plan is the human-readable record of what each test checks and why, so it's committed. Scenario ids (`#0012`) are assigned in the plan, unique across the repo, and reused in the test title. Keep plans in sync when tests change.

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
