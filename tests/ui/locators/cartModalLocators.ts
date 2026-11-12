import type { Page } from "@playwright/test";

/**
 * Locators for the "Added!" modal that follows every "Add to cart". The modal has no dialog
 * role or name, so it is found through its heading and text.
 *
 * @param page - the Playwright page
 * @returns the modal's locators
 */
export const cartModalLocators = (page: Page) => ({
	heading: page.getByRole("heading", { name: "Added!" }),
	message: page.getByText("Your product has been added to cart."),
	viewCartLink: page.getByRole("link", { name: "View Cart" }),
	continueShoppingButton: page.getByRole("button", { name: "Continue Shopping" })
});

/** The locators {@link cartModalLocators} returns. */
export type CartModalLocators = ReturnType<typeof cartModalLocators>;
