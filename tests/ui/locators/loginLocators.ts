import type { Page } from "@playwright/test";

/**
 * Locators for /login. The login form's inputs have no labels, and both forms on the page share
 * the "Email Address" placeholder, so the inputs use the site's stable `data-qa` attributes
 * through `getByTestId` (`testIdAttribute` is `data-qa` in playwright.config.ts).
 *
 * @param page - the Playwright page
 * @returns the page's locators
 */
export const loginLocators = (page: Page) => ({
	emailInput: page.getByTestId("login-email"),
	passwordInput: page.getByTestId("login-password"),
	loginButton: page.getByTestId("login-button"),
	loginError: page.getByText("Your email or password is incorrect!"),
	loginHeading: page.getByRole("heading", { name: "Login to your account" }),
	signupHeading: page.getByRole("heading", { name: "New User Signup!" }),
	signupNameInput: page.getByTestId("signup-name"),
	signupEmailInput: page.getByTestId("signup-email"),
	signupButton: page.getByTestId("signup-button"),
	signupError: page.getByText("Email Address already exist!"),
	/** The header's "Logged in as <name>" item, scoped by its text. */
	loggedInAs: (name: string) => page.getByRole("listitem").filter({ hasText: `Logged in as ${name}` })
});

/** The locators {@link loginLocators} returns. */
export type LoginLocators = ReturnType<typeof loginLocators>;
