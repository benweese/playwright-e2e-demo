import type { Page } from "@playwright/test";

/**
 * Locators for the site header, which every page shares. Link names start with an icon glyph,
 * so the links are matched by the text after it, inside the banner.
 *
 * @param page - the Playwright page
 * @returns the header's locators
 */
export const headerLocators = (page: Page) => {
	const banner = page.getByRole("banner");
	return {
		homeLink: banner.getByRole("link", { name: "Home" }),
		productsLink: banner.getByRole("link", { name: "Products" }),
		cartLink: banner.getByRole("link", { name: "Cart" }),
		signupLoginLink: banner.getByRole("link", { name: "Signup / Login" }),
		contactUsLink: banner.getByRole("link", { name: "Contact us" }),
		logoutLink: banner.getByRole("link", { name: "Logout" }),
		deleteAccountLink: banner.getByRole("link", { name: "Delete Account" }),
		/** Any "Logged in as ..." item, whoever the user is. */
		loggedInAsAnyone: banner.getByText("Logged in as"),
		/** The "Logged in as <name>" item; it is a `li > a` with no href, so it is not a link. */
		loggedInAs: (name: string) => banner.getByRole("listitem").filter({ hasText: `Logged in as ${name}` })
	};
};

/** The locators {@link headerLocators} returns. */
export type HeaderLocators = ReturnType<typeof headerLocators>;
