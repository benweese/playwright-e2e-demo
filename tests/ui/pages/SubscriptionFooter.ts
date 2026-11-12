import type { Page } from "@playwright/test";
import { BasePage } from "@benweese/playwright-test-commons";
import { subscriptionLocators, type SubscriptionLocators } from "../locators/subscriptionLocators";

/**
 * The subscription form in the footer of every page. The success message is visible for only
 * about a second, so call {@link SubscriptionFooter.expectSubscribed} right after
 * {@link SubscriptionFooter.subscribe}.
 */
export class SubscriptionFooter extends BasePage<SubscriptionLocators> {
	/**
	 * @param page - the Playwright page
	 */
	constructor(page: Page) {
		super(page, subscriptionLocators);
	}

	/** Scrolls the footer's "Subscription" heading into view. */
	async scrollToFooter() {
		await this.locators.heading.scrollIntoViewIfNeeded();
	}

	/** Asserts the "Subscription" heading is shown. */
	async expectHeading() {
		await this.expectVisible(this.locators.heading, '"Subscription" heading');
	}

	/**
	 * Types an email into the field.
	 *
	 * @param email - the address to subscribe
	 */
	async fillEmail(email: string) {
		await this.fill(this.locators.emailInput, email);
	}

	/** Clicks the arrow button. */
	async clickSubscribe() {
		await this.click(this.locators.subscribeButton);
	}

	/**
	 * Types an email and clicks the arrow button.
	 *
	 * @param email - the address to subscribe
	 */
	async subscribe(email: string) {
		await this.fillEmail(email);
		await this.clickSubscribe();
	}

	/** Asserts "You have been successfully subscribed!" is visible. It disappears after about a second. */
	async expectSubscribed() {
		await this.expectVisible(this.locators.successMessage, "subscription success message");
	}

	/** Asserts "You have been successfully subscribed!" is not visible. */
	async expectNotSubscribed() {
		await this.expectHidden(this.locators.successMessage, "subscription success message");
	}

	/** Asserts the email field fails the browser's own validation. */
	async expectEmailInvalid() {
		await this.expectInvalid(this.locators.emailInput, "subscription email field is invalid");
	}

	/** Asserts the email field is empty. */
	async expectEmailEmpty() {
		await this.expectValue(this.locators.emailInput, "", "subscription email field");
	}
}
