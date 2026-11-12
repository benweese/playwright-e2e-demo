import type { Page } from "@playwright/test";

/**
 * Locators for /contact_us. The form's fields have `data-qa` attributes, read through
 * `getByTestId`; the success message is in the DOM twice, so only the visible copy counts.
 *
 * @param page - the Playwright page
 * @returns the page's locators
 */
export const contactLocators = (page: Page) => ({
	getInTouchHeading: page.getByRole("heading", { name: "Get In Touch" }),
	nameInput: page.getByTestId("name"),
	emailInput: page.getByTestId("email"),
	subjectInput: page.getByTestId("subject"),
	messageInput: page.getByTestId("message"),
	// The file input has no label or test id; Chromium exposes it as this button, and the name stays after a file is chosen.
	fileInput: page.getByRole("button", { name: "Choose File" }),
	submitButton: page.getByTestId("submit-button"),
	successMessage: page.getByText("Success! Your details have been submitted successfully.").filter({ visible: true }),
	// Fixme: could not reliably locate the Home button by role and name alone. Tried: getByRole("link", { name: "Home" }), with exact: true —
	// the header's Home link has the same name, and the button's container (#form-section) has no role or test id.
	// Only the button wraps its text in a span, which the filter uses. Needs a data-qa on the button or a landmark around the form.
	homeButton: page.getByRole("link", { name: "Home" }).filter({ has: page.locator("span") })
});

/** The locators {@link contactLocators} returns. */
export type ContactLocators = ReturnType<typeof contactLocators>;
