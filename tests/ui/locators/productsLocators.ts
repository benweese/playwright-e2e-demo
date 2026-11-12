import type { Page } from "@playwright/test";

/**
 * Locators for /products. Product cards have no role, name or test id, and every card repeats
 * its text and "Add to cart" in a hover overlay, so cards are reached through their
 * "View Product" link and "Add to cart" button instead.
 *
 * @param page - the Playwright page
 * @returns the page's locators
 */
export const productsLocators = (page: Page) => ({
	allProductsHeading: page.getByRole("heading", { name: "All Products" }),
	searchedProductsHeading: page.getByRole("heading", { name: "Searched Products" }),
	searchInput: page.getByRole("textbox", { name: "Search Product" }),
	// One of the two ids the repo allows: the search button is icon-only, with no name or data-* attribute.
	searchButton: page.locator("#submit_search"),
	/** Every "View Product" link, one per card. */
	viewProductLinks: page.getByRole("link", { name: "View Product" }),
	/** Every card's picture; the hover overlay has none, so this is one per card. */
	productImages: page.getByRole("img", { name: "ecommerce website products" }),
	// Fixme: could not reliably locate one card's "View Product" link by role alone. Tried: getByRole("link", { name: "View Product" }) —
	// the name is the same on every card and cards have no name or test id. Needs a data-qa or an accessible name that includes the product.
	viewProductLink: (id: number) =>
		page.getByRole("link", { name: "View Product" }).and(page.locator(`[href="/product_details/${id}"]`)),
	// Fixme: could not reliably locate one card's "Add to cart" button. Tried: getByText("Add to cart"), getByRole("link"|"button", { name: "Add to cart" }),
	// [data-product-id="<id>"] — it is a role-less anchor and the hover overlay repeats it (both copies count as visible).
	// The sibling-of-the-picture selector keeps the visible copy only. Needs role="button" with an accessible name that includes the product.
	addToCartButton: (id: number) => page.locator(`img ~ [data-product-id="${id}"]`)
});

/** The locators {@link productsLocators} returns. */
export type ProductsLocators = ReturnType<typeof productsLocators>;
