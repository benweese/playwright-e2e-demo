import type { Page } from "@playwright/test";
import { BasePage } from "@benweese/playwright-test-commons";
import type { PaymentDetails } from "../data/paymentData";
import { paymentLocators, type PaymentLocators } from "../locators/paymentLocators";

/** The payment page, /payment, and the order confirmation that follows it. */
export class PaymentPage extends BasePage<PaymentLocators> {
	/**
	 * @param page - the Playwright page
	 */
	constructor(page: Page) {
		super(page, paymentLocators);
	}

	/** Asserts the page is /payment with its "Payment" heading. */
	async expectLoaded() {
		await this.expectUrl("/payment");
		await this.expectVisible(this.locators.heading, '"Payment" heading');
	}

	/**
	 * Fills the card form. Does not submit.
	 *
	 * @param payment - the card details
	 */
	async fillPayment(payment: PaymentDetails) {
		await this.fill(this.locators.nameOnCardInput, payment.nameOnCard);
		await this.fill(this.locators.cardNumberInput, payment.cardNumber);
		await this.fill(this.locators.cvcInput, payment.cvc);
		await this.fill(this.locators.expiryMonthInput, payment.expiryMonth);
		await this.fill(this.locators.expiryYearInput, payment.expiryYear);
	}

	/** Clicks "Pay and Confirm Order". */
	async pay() {
		await this.click(this.locators.payButton);
	}

	/** Asserts "Your order has been placed successfully!" is visible, the text test case 16 documents. */
	async expectOrderPlacedMessage() {
		await this.expectVisible(
			this.locators.orderPlacedMessage,
			'"Your order has been placed successfully!" message'
		);
	}

	/** Asserts the "Order Placed!" heading is not shown. */
	async expectNoOrderPlaced() {
		await this.expectHidden(this.locators.orderPlacedHeading, '"Order Placed!" heading');
	}

	/** Asserts the Name on Card field fails the browser's own validation. */
	async expectNameOnCardInvalid() {
		await this.expectInvalid(this.locators.nameOnCardInput, "Name on Card field is invalid");
	}
}
