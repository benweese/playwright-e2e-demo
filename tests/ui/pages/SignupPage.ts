import type { Page } from "@playwright/test";
import { BasePage } from "@benweese/playwright-test-commons";
import type { Account } from "../../../payloads/accountPayload";
import { signupLocators, type SignupLocators } from "../locators/signupLocators";

/** The account form (/signup) and the Account Created and Account Deleted pages that follow it. */
export class SignupPage extends BasePage<SignupLocators> {
	/**
	 * @param page - the Playwright page
	 */
	constructor(page: Page) {
		super(page, signupLocators);
	}

	/** Asserts the "Enter Account Information" heading is shown. */
	async expectAccountInformationHeading() {
		await this.expectVisible(this.locators.accountInformationHeading, '"Enter Account Information" heading');
	}

	/** Asserts the "Enter Account Information" heading is not shown. */
	async expectNoAccountInformationHeading() {
		await this.expectHidden(this.locators.accountInformationHeading, '"Enter Account Information" heading');
	}

	/**
	 * Fills the whole account form except name and email (the site prefills those) and ticks both
	 * checkboxes. Does not submit.
	 *
	 * @param account - the account to register
	 */
	async fillAccount(account: Account) {
		await this.click(account.title === "Mr" ? this.locators.titleMr : this.locators.titleMrs);
		await this.fill(this.locators.passwordInput, account.password);
		await this.selectOption(this.locators.dayOfBirth, account.birth_date);
		await this.selectOption(
			this.locators.monthOfBirth,
			new Date(2000, Number(account.birth_month) - 1).toLocaleString("en-US", { month: "long" })
		);
		await this.selectOption(this.locators.yearOfBirth, account.birth_year);
		await this.click(this.locators.newsletterCheckbox);
		await this.click(this.locators.offersCheckbox);
		await this.fill(this.locators.firstNameInput, account.firstname);
		await this.fill(this.locators.lastNameInput, account.lastname);
		await this.fill(this.locators.companyInput, account.company);
		await this.fill(this.locators.addressInput, account.address1);
		await this.fill(this.locators.address2Input, account.address2);
		await this.selectOption(this.locators.countrySelect, account.country);
		await this.fill(this.locators.stateInput, account.state);
		await this.fill(this.locators.cityInput, account.city);
		await this.fill(this.locators.zipcodeInput, account.zipcode);
		await this.fill(this.locators.mobileNumberInput, account.mobile_number);
	}

	/** Clicks "Create Account". */
	async createAccount() {
		await this.click(this.locators.createAccountButton);
	}

	/** Asserts the "Account Created!" heading is shown. */
	async expectAccountCreated() {
		await this.expectVisible(this.locators.accountCreatedHeading, '"Account Created!" heading');
	}

	/** Asserts the "Account Deleted!" heading is shown. */
	async expectAccountDeleted() {
		await this.expectVisible(this.locators.accountDeletedHeading, '"Account Deleted!" heading');
	}

	/** Clicks "Continue" on the Account Created or Account Deleted page. */
	async clickContinue() {
		await this.click(this.locators.continueButton);
	}
}
