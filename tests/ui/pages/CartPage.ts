import type { Page } from "@playwright/test";
import { BasePage } from "@benweese/playwright-test-commons";
import { cartLocators, type CartLocators } from "../locators/cartLocators";
import { SubscriptionFooter } from "./SubscriptionFooter";

/** What a cart row should show, written as the site writes it. */
export interface CartRowValues {
	/** Unit price, e.g. "Rs. 500". */
	price: string;
	/** Quantity, e.g. "2". */
	quantity: string;
	/** Line total, e.g. "Rs. 1000". */
	total: string;
}

/** The cart page, /view_cart. */
export class CartPage extends BasePage<CartLocators> {
	/** The footer's subscription form. */
	readonly subscription: SubscriptionFooter;

	/**
	 * @param page - the Playwright page
	 */
	constructor(page: Page) {
		super(page, cartLocators);
		this.subscription = new SubscriptionFooter(page);
	}

	/** Opens /view_cart. */
	async open() {
		await this.goto("/view_cart");
	}

	/**
	 * Asserts a product's row is shown.
	 *
	 * @param name - the product's name
	 * @param options - soft by default; pass `{ soft: false }` when later steps depend on the row
	 */
	async expectProductInCart(name: string, options?: { soft?: boolean }) {
		await this.expectVisible(this.locators.row(name), `cart row for ${name}`, options);
	}

	/**
	 * Asserts a product has no row in the cart.
	 *
	 * @param name - the product's name
	 */
	async expectProductNotInCart(name: string) {
		await this.expectHidden(this.locators.row(name), `cart row for ${name}`);
	}

	/**
	 * Asserts the cart holds exactly this many product rows.
	 *
	 * @param count - the number of products
	 */
	async expectProductCount(count: number) {
		await this.expectCount(this.locators.productRows, count, "product rows in the cart");
	}

	/**
	 * Asserts a product's row shows the price, quantity and total.
	 *
	 * @param name - the product's name
	 * @param values - what the price, quantity and total cells should read
	 */
	async expectRowValues(name: string, values: CartRowValues) {
		await this.expectText(this.locators.cells(name), [
			/.*/,
			/.*/,
			values.price,
			values.quantity,
			values.total,
			/.*/
		]);
	}

	/**
	 * Removes a product with its "X" control.
	 *
	 * @param name - the product's name
	 * @param id - the product's id from the products API
	 */
	async removeProduct(name: string, id: number) {
		// cart.js binds the remove handler when it runs at the end of the body; a click before that does nothing.
		await this.waitForLoad();
		await this.clickAndWaitForResponse(this.locators.removeButton(name, id), (response) =>
			response.url().endsWith(`/delete_cart/${id}`)
		);
	}

	/** Asserts "Cart is empty!" and the link to the products page are shown. */
	async expectEmptyCart() {
		await this.expectVisible(this.locators.emptyMessage, '"Cart is empty!" message');
		await this.expectVisible(this.locators.hereLink, 'link "here" to the products page');
	}

	/** Asserts no product row is shown. */
	async expectNoProducts() {
		await this.expectCount(this.locators.productRows, 0, "product rows in the cart");
	}

	/** Clicks the "here" link in the empty-cart message. */
	async clickHere() {
		await this.click(this.locators.hereLink);
	}

	/** Clicks "Proceed To Checkout". */
	async proceedToCheckout() {
		await this.click(this.locators.proceedToCheckout);
	}

	/** Asserts the Register / Login modal is shown, with its heading and message. */
	async expectRegisterLoginModal() {
		await this.expectVisible(this.locators.checkoutModalHeading, '"Checkout" modal heading');
		await this.expectVisible(this.locators.checkoutModalMessage, "register or log in message");
	}

	/** Clicks "Register / Login" in the checkout modal. */
	async clickRegisterLogin() {
		await this.click(this.locators.registerLoginLink);
	}
}
