import type { Page } from "@playwright/test";

/**
 * Locators for the home page, /.
 *
 * @param page - the Playwright page
 * @returns the page's locators
 */
export const homeLocators = (page: Page) => ({
	featuresHeading: page.getByRole("heading", { name: "Features Items" }),
	// Fixme: could not reliably locate one card's "View Product" link by role alone. Tried: getByRole("link", { name: "View Product" }) —
	// the name is the same on every card and cards have no name or test id. Needs a data-qa or an accessible name that includes the product.
	viewProductLink: (id: number) =>
		page.getByRole("link", { name: "View Product" }).and(page.locator(`[href="/product_details/${id}"]`))
});

/** The locators {@link homeLocators} returns. */
export type HomeLocators = ReturnType<typeof homeLocators>;
