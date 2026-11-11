import type { Page } from "@playwright/test";

// The login form's inputs have no labels, and both forms on the page share the "Email Address"
// placeholder. The site's data-qa attributes are stable, so testIdAttribute is "data-qa"
// (playwright.config.ts) and these use getByTestId.
export const loginLocators = (page: Page) => ({
	emailInput: page.getByTestId("login-email"),
	passwordInput: page.getByTestId("login-password"),
	loginButton: page.getByTestId("login-button"),
	loginError: page.getByText("Your email or password is incorrect!"),
	loggedInAs: (name: string) => page.getByRole("listitem").filter({ hasText: `Logged in as ${name}` })
});

export type LoginLocators = ReturnType<typeof loginLocators>;
