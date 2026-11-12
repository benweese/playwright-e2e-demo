import type { Page } from "@playwright/test";

/**
 * Locators for /product_details/<id>. The detail fields share one `p` with their label and have
 * no test ids, so they are found by their text.
 *
 * @param page - the Playwright page
 * @returns the page's locators
 */
export const productDetailsLocators = (page: Page) => ({
	/** The product's name heading. */
	name: (name: string) => page.getByRole("heading", { level: 2, name, exact: true }),
	/** The "Category: Women > Tops" line. */
	category: (category: string) => page.getByText(`Category: ${category}`),
	/** The price, e.g. "Rs. 500". */
	price: (price: string) => page.getByText(price, { exact: true }),
	/** The "Availability: ..." line with any value. */
	availability: page.getByText(/Availability:\s*\S/),
	/** The "Condition: ..." line with any value. */
	condition: page.getByText(/Condition:\s*\S/),
	/** The "Brand: Polo" line. */
	brand: (brand: string) => page.getByText(`Brand: ${brand}`),
	// The "Quantity:" label is not tied to the input, so the role is the only way in; it is the page's only spinbutton.
	quantityInput: page.getByRole("spinbutton"),
	addToCartButton: page.getByRole("button", { name: "Add to cart" })
});

/** The locators {@link productDetailsLocators} returns. */
export type ProductDetailsLocators = ReturnType<typeof productDetailsLocators>;
