import type { Page } from "@playwright/test";
import { BasePage } from "@benweese/playwright-test-commons";
import { config } from "../../../config";
import { cartModalLocators, type CartModalLocators } from "../locators/cartModalLocators";

/** The "Added!" modal that opens after "Add to cart" on the products and product detail pages. */
export class CartModal extends BasePage<CartModalLocators> {
	/**
	 * @param page - the Playwright page
	 */
	constructor(page: Page) {
		super(page, cartModalLocators);
	}

	/** Asserts the modal shows "Added!" and "Your product has been added to cart.". */
	async expectAdded() {
		// The modal opens only after the add-to-cart request returns, which is slow when the shared site is busy.
		await this.expectVisible(this.locators.heading, '"Added!" modal heading', {
			soft: false,
			timeout: config.timeouts.addedToCartModalMs
		});
		await this.expectVisible(this.locators.message, '"Your product has been added to cart." text');
	}

	/** Clicks "Continue Shopping" and waits for the modal to close, so the next add is not mistaken for this one. */
	async continueShopping() {
		await this.click(this.locators.continueShoppingButton);
		await this.expectHidden(this.locators.heading, '"Added!" modal heading');
	}

	/** Clicks "View Cart". */
	async viewCart() {
		await this.click(this.locators.viewCartLink);
	}
}
