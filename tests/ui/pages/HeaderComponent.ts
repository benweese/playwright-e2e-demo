import type { Page } from "@playwright/test";
import { BasePage, type ExpectOptions } from "@benweese/playwright-test-commons";
import { headerLocators, type HeaderLocators } from "../locators/headerLocators";

/** The navigation header shown on every page. */
export class HeaderComponent extends BasePage<HeaderLocators> {
	/**
	 * @param page - the Playwright page
	 */
	constructor(page: Page) {
		super(page, headerLocators);
	}

	/** Clicks "Home". */
	async clickHome() {
		await this.click(this.locators.homeLink);
	}

	/** Clicks "Products". */
	async clickProducts() {
		await this.click(this.locators.productsLink);
	}

	/** Clicks "Cart". */
	async clickCart() {
		await this.click(this.locators.cartLink);
	}

	/** Clicks "Signup / Login". */
	async clickSignupLogin() {
		await this.click(this.locators.signupLoginLink);
	}

	/** Clicks "Contact us". */
	async clickContactUs() {
		await this.click(this.locators.contactUsLink);
	}

	/** Clicks "Logout". */
	async logout() {
		await this.click(this.locators.logoutLink);
	}

	/** Clicks "Delete Account"; the site deletes the account at once, with no confirmation. */
	async deleteAccount() {
		await this.click(this.locators.deleteAccountLink);
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

	/** Asserts the logged-in header: "Logout" and "Delete Account" are shown and "Signup / Login" is not. */
	async expectLoggedInLinks() {
		await this.expectVisible(this.locators.logoutLink, "Logout link");
		await this.expectVisible(this.locators.deleteAccountLink, "Delete Account link");
		await this.expectHidden(this.locators.signupLoginLink, "Signup / Login link");
	}

	/** Asserts the logged-out header: "Signup / Login" is shown and "Logged in as", "Logout" are not. */
	async expectLoggedOut() {
		await this.expectVisible(this.locators.signupLoginLink, "Signup / Login link");
		await this.expectHidden(this.locators.loggedInAsAnyone, "Logged in as");
		await this.expectHidden(this.locators.logoutLink, "Logout link");
	}
}
