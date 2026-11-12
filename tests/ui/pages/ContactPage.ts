import type { Page } from "@playwright/test";
import { BasePage, type DialogInfo } from "@benweese/playwright-test-commons";
import { expect } from "../../../fixtures/test";
import type { ContactMessage } from "../data/contactData";
import { contactLocators, type ContactLocators } from "../locators/contactLocators";

/** The contact us page, /contact_us. */
export class ContactPage extends BasePage<ContactLocators> {
	private unexpectedDialogs: string[] = [];

	/**
	 * @param page - the Playwright page
	 */
	constructor(page: Page) {
		super(page, contactLocators);
	}

	/** Opens /contact_us. */
	async open() {
		await this.goto("/contact_us");
	}

	/** Asserts the "Get In Touch" heading is shown. */
	async expectGetInTouchHeading() {
		await this.expectVisible(this.locators.getInTouchHeading, '"Get In Touch" heading');
	}

	/** Asserts every form field is shown and the text fields and the file chooser are empty. */
	async expectEmptyForm() {
		for (const [label, field] of [
			["Name", this.locators.nameInput],
			["Email", this.locators.emailInput],
			["Subject", this.locators.subjectInput],
			["Your Message Here", this.locators.messageInput]
		] as const) {
			await this.expectVisible(field, `${label} field`);
			await this.expectValue(field, "", `${label} field`);
		}
		await this.expectVisible(this.locators.fileInput, "file chooser");
		await this.expectUploadedFiles([]);
		await this.expectVisible(this.locators.submitButton, "Submit button");
	}

	/**
	 * Fills name, email, subject and message.
	 *
	 * @param contact - the values to type
	 */
	async fillForm(contact: ContactMessage) {
		await this.fillExceptEmail(contact);
		await this.fillEmail(contact.email);
	}

	/**
	 * Fills name, subject and message, leaving the email as it is.
	 *
	 * @param contact - the values to type; its email is ignored
	 */
	async fillExceptEmail(contact: ContactMessage) {
		await this.fill(this.locators.nameInput, contact.name);
		await this.fill(this.locators.subjectInput, contact.subject);
		await this.fill(this.locators.messageInput, contact.message);
	}

	/**
	 * Replaces the email.
	 *
	 * @param email - the text to type
	 */
	async fillEmail(email: string) {
		await this.fill(this.locators.emailInput, email);
	}

	/**
	 * Attaches a file to "Upload file".
	 *
	 * @param filePath - absolute path of the file
	 */
	async attachFile(filePath: string) {
		await this.uploadFiles(this.locators.fileInput, filePath);
	}

	/**
	 * Asserts the names of the files attached to "Upload file".
	 *
	 * @param names - the expected file names, in order; empty for no file
	 */
	async expectUploadedFiles(names: string[]) {
		await this.expectFilesAttached(this.locators.fileInput, names, "files attached to Upload file");
	}

	/**
	 * Asserts the fields still hold what was typed.
	 *
	 * @param contact - the values that were typed
	 */
	async expectFormValues(contact: ContactMessage) {
		await this.expectValue(this.locators.nameInput, contact.name, "Name field");
		await this.expectValue(this.locators.emailInput, contact.email, "Email field");
		await this.expectValue(this.locators.subjectInput, contact.subject, "Subject field");
		await this.expectValue(this.locators.messageInput, contact.message, "Your Message Here field");
	}

	/**
	 * Clicks "Submit" and accepts the confirmation dialog.
	 *
	 * @returns the dialog that was shown
	 */
	async submitAccepting(): Promise<DialogInfo> {
		return this.clickAndHandleDialog(this.locators.submitButton, "accept");
	}

	/**
	 * Clicks "Submit" and dismisses the confirmation dialog.
	 *
	 * @returns the dialog that was shown
	 */
	async submitDismissing(): Promise<DialogInfo> {
		return this.clickAndHandleDialog(this.locators.submitButton, "dismiss");
	}

	/**
	 * Clicks "Submit" while it is expected that no dialog opens; any dialog is dismissed and
	 * recorded for {@link ContactPage.expectNoDialog}.
	 */
	async submitExpectingNoDialog() {
		this.unexpectedDialogs = this.recordDialogs();
		await this.click(this.locators.submitButton);
	}

	/** Asserts no dialog opened during {@link ContactPage.submitExpectingNoDialog}. */
	async expectNoDialog() {
		expect.soft(this.unexpectedDialogs, "dialogs opened").toEqual([]);
	}

	/** Asserts the email field fails the browser's own validation. */
	async expectEmailInvalid() {
		await this.expectInvalid(this.locators.emailInput, "Email field is invalid");
	}

	/** Asserts "Success! Your details have been submitted successfully." is visible. */
	async expectSuccess() {
		await this.expectVisible(this.locators.successMessage, "success message");
	}

	/** Asserts the success message is not visible. */
	async expectNoSuccess() {
		await this.expectHidden(this.locators.successMessage, "success message");
	}

	/** Clicks the "Home" button that replaces the form after a submit. */
	async clickHome() {
		await this.click(this.locators.homeButton);
	}
}
