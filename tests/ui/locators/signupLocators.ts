import type { Page } from "@playwright/test";

/**
 * Locators for the account form (/signup), Account Created and Account Deleted. The form's
 * labels are mostly not associated with their inputs, so the controls use the site's `data-qa`
 * attributes through `getByTestId`; the radios and checkboxes have proper names.
 *
 * @param page - the Playwright page
 * @returns the pages' locators
 */
export const signupLocators = (page: Page) => ({
	accountInformationHeading: page.getByRole("heading", { name: "Enter Account Information" }),
	titleMr: page.getByRole("radio", { name: "Mr.", exact: true }),
	titleMrs: page.getByRole("radio", { name: "Mrs.", exact: true }),
	passwordInput: page.getByTestId("password"),
	dayOfBirth: page.getByTestId("days"),
	monthOfBirth: page.getByTestId("months"),
	yearOfBirth: page.getByTestId("years"),
	newsletterCheckbox: page.getByRole("checkbox", { name: "Sign up for our newsletter!" }),
	offersCheckbox: page.getByRole("checkbox", { name: "Receive special offers from our partners!" }),
	firstNameInput: page.getByTestId("first_name"),
	lastNameInput: page.getByTestId("last_name"),
	companyInput: page.getByTestId("company"),
	addressInput: page.getByTestId("address"),
	address2Input: page.getByTestId("address2"),
	countrySelect: page.getByTestId("country"),
	stateInput: page.getByTestId("state"),
	cityInput: page.getByTestId("city"),
	// The label's `for` points at the City field, so only the test id finds this input.
	zipcodeInput: page.getByTestId("zipcode"),
	mobileNumberInput: page.getByTestId("mobile_number"),
	createAccountButton: page.getByTestId("create-account"),
	accountCreatedHeading: page.getByRole("heading", { name: "Account Created!" }),
	accountDeletedHeading: page.getByRole("heading", { name: "Account Deleted!" }),
	continueButton: page.getByTestId("continue-button")
});

/** The locators {@link signupLocators} returns. */
export type SignupLocators = ReturnType<typeof signupLocators>;
