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

	/** Asserts the "Login to your account" heading is shown. */
	async expectLoginHeading() {
		await this.expectVisible(this.locators.loginHeading, '"Login to your account" heading');
	}

	/** Asserts the "New User Signup!" heading is shown. */
	async expectSignupHeading() {
		await this.expectVisible(this.locators.signupHeading, '"New User Signup!" heading');
	}

	/** Asserts the "Your email or password is incorrect!" message is not shown. */
	async expectNoLoginError() {
		await this.expectHidden(this.locators.loginError, "login error message");
	}

	/**
	 * Starts a sign-up through the "New User Signup!" form.
	 *
	 * @param name - the new account's name
	 * @param email - the new account's email
	 */
	async signup(name: string, email: string) {
		await this.fill(this.locators.signupNameInput, name);
		await this.fill(this.locators.signupEmailInput, email);
		await this.click(this.locators.signupButton);
	}

	/** Asserts the "Email Address already exist!" message is shown. */
	async expectSignupError() {
		await this.expectVisible(this.locators.signupError, "signup error message");
	}

	/** Clicks "Login" without entering anything. */
	async submitLoginForm() {
		await this.click(this.locators.loginButton);
	}

	/** Asserts the login email field fails the browser's own validation. */
	async expectLoginEmailInvalid() {
		await this.expectInvalid(this.locators.emailInput, "login email field is invalid");
	}
}
