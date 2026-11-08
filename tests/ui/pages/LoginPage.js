import { BasePage } from "@benweese/playwright-test-commons";
import { loginLocators } from "../locators/loginLocators.js";

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

	/** @param {{ soft?: boolean }} [options] - pass { soft: false } when later steps need the session */
	async expectLoggedInAs(name, options) {
		await this.expectVisible(this.locators.loggedInAs(name), `header shows "Logged in as ${name}"`, options);
	}

	async expectLoginError() {
		await this.expectVisible(this.locators.loginError, "login error message");
	}
}
