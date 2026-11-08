// The login form's inputs have no labels, and both forms on the page share the "Email Address"
// placeholder. The site's data-qa attributes are stable, so testIdAttribute is "data-qa"
// (playwright.config.js) and these use getByTestId.
export const loginLocators = (page) => ({
	emailInput: page.getByTestId("login-email"),
	passwordInput: page.getByTestId("login-password"),
	loginButton: page.getByTestId("login-button"),
	loginError: page.getByText("Your email or password is incorrect!"),
	loggedInAs: (name) => page.getByRole("listitem").filter({ hasText: `Logged in as ${name}` })
});
