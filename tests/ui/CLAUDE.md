# tests/ui/

UI tests in three layers per page, plus optional data:

```
locators/<name>Locators.ts   a factory: (page: Page) => ({ ...locators }), plus its type
pages/<Name>Page.ts          extends BasePage<NameLocators>; one documented method per user action
specs/<name>.spec.ts         calls page methods and asserts; tag TAGS.UI
data/<name>Data.ts           faker input, only if needed
```

Create them in that order. Reuse or extend an existing page object or spec for the same page.

## Example

`loginLocators`, `LoginPage` and `HomePage` are real; `home.spec.ts` is an illustration (the real specs are in `specs/`):

```ts
// tests/ui/locators/loginLocators.ts
import type { Page } from "@playwright/test";

/** Locators for /login; the inputs use the site's data-qa attributes. */
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

/** The login and sign-up page, /login. */
export class LoginPage extends BasePage<LoginLocators> {
	constructor(page: Page) {
		super(page, loginLocators);
	}

	/** Opens /login. */
	async open() {
		await this.goto("/login");
	}

	/**
	 * Signs in through the login form.
	 *
	 * @param email - the account's email
	 * @param password - the account's password
	 */
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
		await home.expectLoaded();
	}
);
```

## Page objects and specs

- Specs never contain raw locators; they call page methods.
- Page objects use `BasePage` methods, not raw Playwright, except for small things BasePage doesn't cover (like `press`). Besides `goto`, `click`, `fill` and `expectVisible`/`expectHidden`/`expectText`/`expectUrl`, it has `expectValue`, `expectCount`, `expectAny`, `expectInvalid` (browser validation), `expectTitle`, `expectFilesAttached`, `uploadFiles`, `reload`, `waitForLoad`, `clickAndWaitForResponse`, `clickAndHandleDialog` and `recordDialogs`. Checks are soft; pass `{ soft: false }` when later steps depend on them, or a `timeout` for something known to be slow. `this.goto("/path")`, never a full URL.
- A helper every page could use, taking locators as arguments, belongs in `BasePage` (in commons): add it there and release a new tag, never a local helper file. Anything with page-specific names goes on the page object.
- Accessibility: `expectNoA11yViolations(page)` from commons scans the page as it is, WCAG 2.0–2.2 A/AA.
- Locator factories take `page: Page` and export their type (`ReturnType<typeof xLocators>`); page objects extend `BasePage<XLocators>`.
- JSDoc on every locator factory and page object method (lint enforces it).

## Locators (hard rule)

- **The element you act on:** `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByAltText`, `getByTitle`, `getByTestId`, or a stable `data-*` attribute when none of those is unique, e.g. `page.locator('[data-product-id="1"]')`.
- **`data-qa` attributes.** The site marks form controls with `data-qa="login-email"` and similar, and `testIdAttribute` is `data-qa`, so `page.getByTestId("login-email")` finds them. Prefer them where the control has no accessible label.
- **No good locator on its own?** If the element can't be found uniquely and reliably by itself, find a good container first: the nearest meaningful parent that gives the element its context (a form, dialog, table row, card, list item, section or landmark). Locate the container the same way or by a stable `data-*` attribute, e.g. `getByRole("dialog", { name })`, `getByRole("row").filter({ hasText })` or `getByRole("listitem").filter({ hasText })`, then locate the element inside it. `loggedInAs` in `loginLocators.ts` is an example.
- **Two ids are allowed, and no others:** `#submit_search` (the product search button) and `#subscribe` (the footer subscribe button). Both are icon-only, with no accessible name or `data-*` attribute.
- **Never:** XPath, generated CSS class names, `.first()`/`.nth()`/`.last()` or `:nth-child`. Lint enforces the XPath and index rules.
- If an element can't be found with the allowed methods, write the best allowed locator and put a comment above it:
  `// Fixme: could not reliably locate <what>. Tried: <locators> — <why>. Needs <role/label/testid>.`

## Logged in by default

The `ui` project starts logged in as the run's test account (see `tests/setup/CLAUDE.md`).

- `readTestUser()` from `helpers/` returns its `{ name, email, password }`.
- A test that needs a logged-out page uses `test.use({ storageState: { cookies: [], origins: [] } })`.
- Don't log out or delete the shared account in a test; other ui tests run with the same session. A test that needs its own account creates one with `Accounts.create(buildAccount())` and deletes it afterwards.
- **The cart belongs to the session cookie.** Every ui test shares one session, so any test that touches the cart uses the logged-out `storageState` above (and its own account if it must be logged in). Otherwise parallel tests would share one cart.

## Site quirks

- **Late-bound handlers.** Some controls are wired by a script at the end of the page (the cart's remove "X" by `cart.js`), so a click that lands first does nothing even though the element is visible. Call `this.waitForLoad()`, then `this.clickAndWaitForResponse(...)` for the control's own request, as `CartPage.removeProduct` does.
- **The "Added!" modal is slow**, up to ~20 s under load; wait with `config.timeouts.addedToCartModalMs`.
- **Duplicated cards.** Each product card holds its name, price and "Add to cart" twice (a hover overlay), which is why some product locators carry a `// Fixme:`.
- **Brief success messages.** The subscription message shows for about a second; assert it straight after the click.
