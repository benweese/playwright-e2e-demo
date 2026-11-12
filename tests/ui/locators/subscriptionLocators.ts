import type { Page } from "@playwright/test";

/**
 * Locators for the footer's subscription form, which every page shares.
 *
 * @param page - the Playwright page
 * @returns the form's locators
 */
export const subscriptionLocators = (page: Page) => {
	const footer = page.getByRole("contentinfo");
	return {
		heading: footer.getByRole("heading", { name: "Subscription" }),
		emailInput: footer.getByRole("textbox", { name: "Your email address" }),
		// One of the two ids the repo allows: the arrow button is icon-only, with no name or data-* attribute.
		subscribeButton: footer.locator("#subscribe"),
		successMessage: footer.getByText("You have been successfully subscribed!")
	};
};

/** The locators {@link subscriptionLocators} returns. */
export type SubscriptionLocators = ReturnType<typeof subscriptionLocators>;
