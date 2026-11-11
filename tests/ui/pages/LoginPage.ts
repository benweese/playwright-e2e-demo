import type { Page } from "@playwright/test";
import { BasePage, type ExpectOptions } from "@benweese/playwright-test-commons";
import { loginLocators, type LoginLocators } from "../locators/loginLocators";

/** The login and sign-up page, /login. */
export class LoginPage extends BasePage<LoginLocators> {
	/**
	 * @param page - the Playwright page
	 */
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

	/**
	 * Asserts the header shows "Logged in as <name>".
	 *
	 * @param name - the account's name
	 * @param options - soft by default; pass `{ soft: false }` when later steps need the session
	 */
	async expectLoggedInAs(name: string, options?: ExpectOptions) {
		await this.expectVisible(this.locators.loggedInAs(name), `header shows "Logged in as ${name}"`, options);
	}

	/** Asserts the "Your email or password is incorrect!" message is shown. */
	async expectLoginError() {
		await this.expectVisible(this.locators.loginError, "login error message");
	}
}
