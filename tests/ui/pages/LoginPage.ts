import type { Page } from "@playwright/test";
import { BasePage, type ExpectOptions } from "@benweese/playwright-test-commons";
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

	/** Pass { soft: false } when later steps need the session. */
	async expectLoggedInAs(name: string, options?: ExpectOptions) {
		await this.expectVisible(this.locators.loggedInAs(name), `header shows "Logged in as ${name}"`, options);
	}

	async expectLoginError() {
		await this.expectVisible(this.locators.loginError, "login error message");
	}
}
