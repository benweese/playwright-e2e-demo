import { generateTestDescription, TAGS } from "@benweese/playwright-test-commons";
import { test, expect } from "../../../fixtures/test";
import { buildContactMessage, writeUploadFile } from "../data/contactData";
import { ContactPage } from "../pages/ContactPage";
import { HeaderComponent } from "../pages/HeaderComponent";
import { HomePage } from "../pages/HomePage";

test.describe("Contact form", () => {
	test(
		generateTestDescription({
			id: 44,
			description: "the Contact us link opens the Get In Touch form",
			tags: [TAGS.UI, TAGS.SMOKE, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const home = new HomePage(page);
			const header = new HeaderComponent(page);
			const contact = new ContactPage(page);

			await home.open();
			await header.clickContactUs();
			await contact.expectUrl("/contact_us");
			await contact.expectGetInTouchHeading();
			await contact.expectEmptyForm();
		}
	);

	test(
		generateTestDescription({
			id: 45,
			description: "submitting the form with a file shows the success message, and Home returns to the home page",
			tags: [TAGS.UI, TAGS.SMOKE, TAGS.REGRESSION]
		}),
		async ({ page }, testInfo) => {
			const message = buildContactMessage();
			const filePath = await writeUploadFile(testInfo.outputPath("upload-sample.txt"));
			const contact = new ContactPage(page);
			const home = new HomePage(page);

			await contact.open();
			await contact.fillForm(message);
			await contact.attachFile(filePath);
			await contact.expectUploadedFiles(["upload-sample.txt"]);

			const dialog = await contact.submitAccepting();
			expect.soft(dialog.type, "dialog type").toBe("confirm");
			expect.soft(dialog.message, "dialog message").toBe("Press OK to proceed!");
			await contact.expectUrl("/contact_us");
			await contact.expectSuccess();

			await contact.clickHome();
			await home.expectUrl("/");
			await home.expectTitle();
		}
	);

	test(
		generateTestDescription({
			id: 46,
			description: "cancelling the confirmation keeps the form and sends nothing",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }, testInfo) => {
			const message = buildContactMessage();
			const filePath = await writeUploadFile(testInfo.outputPath("upload-sample.txt"));
			const contact = new ContactPage(page);

			await contact.open();
			await contact.fillForm(message);
			await contact.attachFile(filePath);

			await contact.submitDismissing();
			await contact.expectUrl("/contact_us");
			await contact.expectNoSuccess();
			await contact.expectFormValues(message);
		}
	);
});

test.describe("Email validation", () => {
	test(
		generateTestDescription({
			id: 47,
			description: "the form is not submitted without an email or with a malformed one",
			tags: [TAGS.UI, TAGS.REGRESSION]
		}),
		async ({ page }) => {
			const message = buildContactMessage();
			const contact = new ContactPage(page);

			await contact.open();
			await contact.fillExceptEmail(message);

			await contact.submitExpectingNoDialog();
			await contact.expectEmailInvalid();
			await contact.expectNoSuccess();
			await contact.expectUrl("/contact_us");

			await contact.fillEmail("abc");
			await contact.submitExpectingNoDialog();
			await contact.expectEmailInvalid();
			await contact.expectNoSuccess();
			await contact.expectUrl("/contact_us");

			await contact.expectNoDialog();
		}
	);
});
