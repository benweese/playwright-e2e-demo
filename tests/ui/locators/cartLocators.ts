import type { Page } from "@playwright/test";

/**
 * Locators for /view_cart. The table's cells are plain `td`s without names, so a product's row is
 * found through the link to its product page, and its price, quantity and total are read as the
 * row's cells in column order.
 *
 * @param page - the Playwright page
 * @returns the page's locators
 */
export const cartLocators = (page: Page) => {
	/** The row of the product with this exact name. */
	const row = (name: string) => page.getByRole("row").filter({ has: page.getByRole("link", { name, exact: true }) });
	return {
		row,
		/** Every product row (the header row has no links). */
		productRows: page.getByRole("row").filter({ has: page.getByRole("link") }),
		/** The cells of a product's row, in column order: item, description, price, quantity, total, remove. */
		cells: (name: string) => row(name).getByRole("cell"),
		// The remove control is an icon-only anchor with no href or name; its data-product-id is the
		// stable key, and inside the product's row it is unique.
		removeButton: (name: string, id: number) => row(name).locator(`[data-product-id="${id}"]`),
		emptyMessage: page.getByText("Cart is empty!"),
		hereLink: page.getByRole("link", { name: "here" }),
		// Fixme: could not reliably locate "Proceed To Checkout". Tried: getByRole("link"|"button", { name: "Proceed To Checkout" }) —
		// it is an anchor with no href, so it has no role. Needs a real href or role="button".
		proceedToCheckout: page.getByText("Proceed To Checkout"),
		checkoutModalHeading: page.getByRole("heading", { name: "Checkout" }),
		checkoutModalMessage: page.getByText("Register / Login account to proceed on checkout."),
		registerLoginLink: page.getByRole("link", { name: "Register / Login" })
	};
};

/** The locators {@link cartLocators} returns. */
export type CartLocators = ReturnType<typeof cartLocators>;
