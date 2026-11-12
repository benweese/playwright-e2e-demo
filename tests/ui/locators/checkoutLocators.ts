import type { Page } from "@playwright/test";

/**
 * Locators for /checkout. The address blocks are plain lists, found through their headings; the
 * order table's rows are found through the product's link, like the cart's.
 *
 * @param page - the Playwright page
 * @returns the page's locators
 */
export const checkoutLocators = (page: Page) => {
	/** The row of the product with this exact name in the "Review Your Order" table. */
	const row = (name: string) => page.getByRole("row").filter({ has: page.getByRole("link", { name, exact: true }) });
	return {
		addressDetailsHeading: page.getByRole("heading", { name: "Address Details" }),
		deliveryAddress: page
			.getByRole("list")
			.filter({ has: page.getByRole("heading", { name: "Your delivery address" }) }),
		billingAddress: page
			.getByRole("list")
			.filter({ has: page.getByRole("heading", { name: "Your billing address" }) }),
		reviewHeading: page.getByRole("heading", { name: "Review Your Order" }),
		row,
		/** The cells of a product's row, in column order: item, description, price, quantity, total. */
		cells: (name: string) => row(name).getByRole("cell"),
		/** The cells of the "Total Amount" row: two empty cells, the label, the amount. */
		totalAmountCells: page.getByRole("row").filter({ hasText: "Total Amount" }).getByRole("cell"),
		// Fixme: could not reliably locate the order comment box. Tried: getByRole("textbox") — it also matches the footer's email box;
		// getByLabel and getByPlaceholder — it has neither. Needs a label or data-qa="comment".
		commentBox: page.getByRole("textbox").and(page.locator("textarea")),
		placeOrderLink: page.getByRole("link", { name: "Place Order" })
	};
};

/** The locators {@link checkoutLocators} returns. */
export type CheckoutLocators = ReturnType<typeof checkoutLocators>;
