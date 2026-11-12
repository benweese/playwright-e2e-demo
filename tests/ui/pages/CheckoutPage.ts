import type { Page } from "@playwright/test";
import { BasePage } from "@benweese/playwright-test-commons";
import type { Account } from "../../../payloads/accountPayload";
import { expect } from "../../../fixtures/test";
import { checkoutLocators, type CheckoutLocators } from "../locators/checkoutLocators";
import type { CartRowValues } from "./CartPage";

/** The checkout page, /checkout: addresses, order review and the comment box. */
export class CheckoutPage extends BasePage<CheckoutLocators> {
	/**
	 * @param page - the Playwright page
	 */
	constructor(page: Page) {
		super(page, checkoutLocators);
	}

	/** Asserts the page is /checkout with its "Address Details" heading. */
	async expectLoaded() {
		await this.expectUrl("/checkout");
		await this.expectVisible(this.locators.addressDetailsHeading, '"Address Details" heading');
	}

	/**
	 * Asserts the delivery address block holds every value the account registered with.
	 *
	 * @param account - the account whose address was registered
	 */
	async expectDeliveryAddress(account: Account) {
		await this.expectAddressContains("delivery", this.locators.deliveryAddress, account);
	}

	/**
	 * Asserts the billing address block holds every value the account registered with.
	 *
	 * @param account - the account whose address was registered
	 */
	async expectBillingAddress(account: Account) {
		await this.expectAddressContains("billing", this.locators.billingAddress, account);
	}

	/**
	 * Checks each registered value on its own, so one wrong line does not hide the others.
	 *
	 * @param kind - "delivery" or "billing", for the failure message
	 * @param block - the address block
	 * @param account - the account whose address was registered
	 */
	private async expectAddressContains(kind: string, block: CheckoutLocators["deliveryAddress"], account: Account) {
		const values: Record<string, string> = {
			"first name": account.firstname,
			"last name": account.lastname,
			company: account.company,
			address1: account.address1,
			address2: account.address2,
			city: account.city,
			state: account.state,
			zipcode: account.zipcode,
			country: account.country,
			"mobile number": account.mobile_number
		};
		for (const [label, value] of Object.entries(values)) {
			await expect.soft(block, `${kind} address ${label}`).toContainText(value);
		}
	}

	/** Asserts the "Review Your Order" heading is shown. */
	async expectReviewHeading() {
		await this.expectVisible(this.locators.reviewHeading, '"Review Your Order" heading');
	}

	/**
	 * Asserts a product's row in the order review shows its price, quantity and total.
	 *
	 * @param name - the product's name
	 * @param values - what the price, quantity and total cells should read
	 */
	async expectRowValues(name: string, values: CartRowValues) {
		await this.expectText(this.locators.cells(name), [/.*/, /.*/, values.price, values.quantity, values.total]);
	}

	/**
	 * Asserts the "Total Amount" row.
	 *
	 * @param total - the amount, e.g. "Rs. 1000"
	 */
	async expectTotalAmount(total: string) {
		await this.expectText(this.locators.totalAmountCells, [/.*/, /.*/, "Total Amount", total]);
	}

	/**
	 * Types an order comment.
	 *
	 * @param comment - the text to enter
	 */
	async fillComment(comment: string) {
		await this.fill(this.locators.commentBox, comment);
	}

	/** Clicks "Place Order". */
	async placeOrder() {
		await this.click(this.locators.placeOrderLink);
	}
}
