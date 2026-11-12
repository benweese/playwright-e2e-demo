import type { Page } from "@playwright/test";

/**
 * Locators for /payment and the order confirmation. The form's labels are not tied to their
 * inputs, so the fields use the site's `data-qa` attributes through `getByTestId`.
 *
 * @param page - the Playwright page
 * @returns the page's locators
 */
export const paymentLocators = (page: Page) => ({
	heading: page.getByRole("heading", { name: "Payment", exact: true }),
	nameOnCardInput: page.getByTestId("name-on-card"),
	cardNumberInput: page.getByTestId("card-number"),
	cvcInput: page.getByTestId("cvc"),
	expiryMonthInput: page.getByTestId("expiry-month"),
	expiryYearInput: page.getByTestId("expiry-year"),
	payButton: page.getByTestId("pay-button"),
	orderPlacedHeading: page.getByTestId("order-placed"),
	/** The text test case 16 documents. The site keeps it in a hidden alert on /payment. */
	orderPlacedMessage: page.getByText("Your order has been placed successfully!")
});

/** The locators {@link paymentLocators} returns. */
export type PaymentLocators = ReturnType<typeof paymentLocators>;
