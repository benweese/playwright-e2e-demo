import type { Page } from "@playwright/test";
import { BasePage } from "@benweese/playwright-test-commons";
import { homeLocators, type HomeLocators } from "../locators/homeLocators";
import { SubscriptionFooter } from "./SubscriptionFooter";

/** The home page, /. */
export class HomePage extends BasePage<HomeLocators> {
	/** The footer's subscription form. */
	readonly subscription: SubscriptionFooter;

	/**
	 * @param page - the Playwright page
	 */
	constructor(page: Page) {
		super(page, homeLocators);
		this.subscription = new SubscriptionFooter(page);
	}

	/** Opens /. */
	async open() {
		await this.goto("/");
	}

	/** Asserts the page has loaded, by its "Features Items" heading. */
	async expectLoaded() {
		await this.expectVisible(this.locators.featuresHeading, '"Features Items" heading');
	}

	/**
	 * Clicks "View Product" on a product's card.
	 *
	 * @param id - the product's id from the products API
	 */
	async openProduct(id: number) {
		await this.click(this.locators.viewProductLink(id));
	}

	/** Asserts the page title is "Automation Exercise". */
	async expectTitle() {
		await super.expectTitle("Automation Exercise");
	}
}
